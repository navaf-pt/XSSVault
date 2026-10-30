export const REFLECTED = [
  {
    id: 'reflected-html',
    title: 'Reflected XSS in an HTML text context',
    category: 'reflected',
    difficulty: 'apprentice',
    app: 'Nimbus Support',
    tags: ['search', 'text context', 'no encoding'],
    summary: 'The helpdesk search page writes your query into the results heading without encoding it, so markup you send is parsed as HTML.',
    scenario:
      'Nimbus is a B2B helpdesk. The knowledge-base search page builds its "Results for …" heading by concatenating the query parameter into a template string. That one line is the whole bug: the application never separates untrusted data from markup, so anything in ?q= becomes part of the document.',
    goal: 'Execute JavaScript in the lab frame. Any of alert(document.domain), prompt(1) or a visible dialog proves it.',
    hints: [
      'Search for a normal word first and look at where it lands in the page — it sits inside an <h1>, i.e. HTML text context.',
      'In HTML text context, a tag you send is a tag the browser builds. You do not need to break out of quotes.',
      'An <img> with a broken src plus an onerror handler runs even though the page has no form for scripts.',
    ],
    payloads: [
      { label: 'Classic script tag', code: '<script>alert(document.domain)</script>' },
      { label: 'Broken image (works when <script> is filtered)', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'SVG load handler', code: '<svg onload=alert(document.domain)>' },
    ],
    walkthrough: [
      { t: 'Confirm the reflection', d: 'Search for hello. The heading reads "Results for hello". Reload with ?q=hello and the value is taken straight from the URL.' },
      { t: 'Identify the context', d: 'The value is placed between <h1> and </h1>. You are in HTML text context, so the parser will happily open elements for you.' },
      { t: 'Make it execute', d: 'Search for <img src=x onerror=alert(document.domain)>. The src fails to load, onerror fires, and the dialog shows the lab hostname.' },
      { t: 'Deliver it', d: 'Everything is in the URL, so the attacker sends a link (chat, email, support ticket). The script runs with the victim\'s session on the Nimbus origin.' },
    ],
    why:
      'The sink is `"<h1>Results for " + q + "</h1>"`. Browsers parse strings assigned to HTML sinks as markup, so the query exits the text node and becomes code. Reflected XSS is a server-side output-encoding failure, not a "JavaScript problem".',
    fix: {
      text: 'Encode on output, for the exact context you are writing into. In HTML text context that means & < > " \'. A framework template does this by default — the bug appears where strings are concatenated by hand.',
      code: "// vulnerable\nres.send('<h1>Results for ' + q + '</h1>');\n\n// fixed: contextual HTML encoding\nimport { escapeHtml } from './html.js';\nres.send('<h1>Results for ' + escapeHtml(q) + '</h1>');",
    },
  },
  {
    id: 'reflected-attribute',
    title: 'Reflected XSS by breaking out of an attribute',
    category: 'reflected',
    difficulty: 'apprentice',
    app: 'Nimbus Support',
    tags: ['attribute context', 'quotes', 'autofocus'],
    summary: 'The query is echoed into a double-quoted value="" attribute and only angle brackets are encoded, so a quote is all you need.',
    scenario:
      'The search box remembers what you typed so you can refine it. The template does `<input value="${q}">`. Someone added a filter that strips `<` and `>` to "stop XSS" — but the reflection is inside an attribute, where quotes matter more than angle brackets.',
    goal: 'Break out of the value attribute and fire an event handler without using any angle brackets.',
    hints: [
      'Where exactly does your text appear? Look at the HTML around the search input.',
      'Quotes are not encoded, so a " closes the attribute. Everything after it is a new attribute on the same tag.',
      'The input is already in the document. onfocus plus autofocus runs as soon as the page loads.',
    ],
    payloads: [
      { label: 'Close the attribute, add a handler', code: '" autofocus onfocus="alert(document.domain)' },
      { label: 'Same idea, no autofocus needed if you click the box', code: '" onclick="alert(document.domain)' },
      { label: 'Adding a whole new element', code: '"><svg onload=alert(document.domain)>' },
    ],
    walkthrough: [
      { t: 'Locate the sink', d: 'Search for test. The page returns `<input class="q" value="test">` — your input is inside a quoted attribute.' },
      { t: 'Test the filter', d: 'Send <test>. It comes back as &lt;test&gt;, so angle brackets are encoded. Send " and it is returned raw: the filter is in the wrong context.' },
      { t: 'Break out', d: 'Send `" autofocus onfocus="alert(document.domain)` . The parser closes value, sees a new autofocus attribute, then an onfocus handler that is syntactically complete.' },
      { t: 'Watch it fire', d: 'On load the input receives focus and the handler runs — no user interaction, no angle brackets.' },
    ],
    why:
      'Encoding is contextual. Stripping angle brackets protects text nodes; inside an attribute value the escape character is the quote. Because the app chose a filter instead of the right encoder, a single `"` moves you into attribute space where you control event handlers.',
    fix: {
      text: 'Use attribute-context encoding (escape " and \'), or better, never build attributes by concatenation. Also quote every attribute — unquoted attributes are even easier to escape.',
      code: "// vulnerable: only angle brackets encoded\n`<input value=\"${q.replace(/[<>]/g, '')}\">`\n\n// fixed: attribute encoding\n`<input value=\"${escapeAttr(q)}\">`\n// escapeAttr: & -> &amp;  \" -> &quot;  ' -> &#39;  < -> &lt;  > -> &gt;",
    },
  },
  {
    id: 'reflected-unquoted',
    title: 'Reflected XSS in an unquoted attribute',
    category: 'reflected',
    difficulty: 'apprentice',
    app: 'Greenleaf Store',
    tags: ['unquoted attribute', 'event handler', 'interaction'],
    summary: 'A product page writes your search term into an unquoted attribute, where a single space starts a brand-new attribute.',
    scenario:
      'Greenleaf renders a "your search" preview chip as `<div class="preview" data-q=${q}>`. The value is unquoted (valid HTML as long as it has no spaces), and the sanitiser removes `<`, `>`, `"` and `\'` — the four characters people usually think of. Space is not on the list.',
    goal: 'Get script execution in the lab using only characters that survive the filter, then hover the preview chip.',
    hints: [
      'In an unquoted attribute, whitespace ends the value. What comes after the space is parsed as a new attribute.',
      'You can add a whole event handler with no quotes at all as long as the value has no spaces.',
      'The preview chip is a normal <div>. onmouseover fires when the pointer enters it.',
    ],
    payloads: [
      { label: 'Add an event handler with no quotes', code: 'x onmouseover=alert(document.domain)' },
      { label: 'Style trick to make the target impossible to miss', code: 'x style=position:fixed;inset:0;z-index:9 onmouseover=alert(document.domain)' },
    ],
    walkthrough: [
      { t: 'Look at the markup', d: 'Search for abc. The chip is rendered as data-q=abc — note there are no quotes around the value.' },
      { t: 'Understand unquoted parsing', d: 'An unquoted attribute value ends at the first space, so `data-q=x onmouseover=...` is two attributes, not one.' },
      { t: 'Send the payload', d: 'Submit `x onmouseover=alert(document.domain)` — all characters pass the filter, which only blocks < > " \'.' },
      { t: 'Trigger it', d: 'Hover the highlighted preview chip; the handler fires and the dialog shows the lab hostname.' },
    ],
    why:
      'HTML tokenisation, not the filter, decides what is an attribute. A space is enough to start a new one, and unquoted values accept `=`, `/`, `(` and `)` unescaped — everything a handler needs. Block-lists over `<` and quotes give false confidence.',
    fix: {
      text: 'Always quote attributes and encode for attribute context. Do not rely on blacklists: they fail on the character set you forgot.',
      code: "// vulnerable\n`<div data-q=${q}>`\n\n// fixed\n`<div data-q=\"${escapeAttr(q)}\">`",
    },
  },
  {
    id: 'reflected-js-string',
    title: 'Reflected XSS inside a JavaScript string',
    category: 'reflected',
    difficulty: 'practitioner',
    app: 'Nimbus Support',
    tags: ['JavaScript context', 'string break-out', 'inline script'],
    summary: 'The query is injected into an inline script as a single-quoted string. Angle brackets are stripped, but a quote still ends the string.',
    scenario:
      'A legacy widget prints the search term with document.write from an inline script: `<script>var q = \'${q}\'; ...`. The team added a filter that removes `<` and `>` to block script tags — which does nothing at all inside a JavaScript string literal.',
    goal: 'Escape the JavaScript string literal and run code without using angle brackets.',
    hints: [
      'The value is not in HTML here, it is in JavaScript source code. The parser you must escape is the JS one.',
      'In a single-quoted string, `\'` ends the literal and `//` comments out the rest of the line.',
      'Because < and > are stripped you cannot close the script element — you do not need to, you are already inside it.',
    ],
    payloads: [
      { label: 'Close the string, call alert, comment the tail', code: "';alert(document.domain);//" },
      { label: 'Alternative if the tail breaks', code: "';alert(document.domain);var x='" },
    ],
    walkthrough: [
      { t: 'Find the context', d: 'Search for test and view source. You will see: var q = \'test\'; document.write(\'<p>You searched for \' + q + \'</p>\');' },
      { t: 'Choose the breaker', d: 'Angle brackets are filtered, so a tag is out. But the sink is JS source: a single quote ends the string.' },
      { t: 'Build the payload', d: "Send `';alert(document.domain);//`. The result is var q = '';alert(document.domain);//'; — valid JS that runs immediately." },
      { t: 'Reflect on the fix', d: 'HTML-encoding is irrelevant here. The correct fix is JSON-encoding the value into JS, or passing it through a data attribute instead of source.' },
    ],
    why:
      'Context beats payload. Every sink has its own escape characters: HTML text needs & < >, attributes need quotes, JS strings need quotes, backslashes and line terminators. A filter aimed at HTML does nothing in a script block.',
    fix: {
      text: 'Never concatenate data into JavaScript source. Serialise it as JSON (which escapes quotes and unicode line separators) or put it in a data-* attribute and read it with dataset.',
      code: "// vulnerable\n<script>var q = 'USER_INPUT';</script>\n\n// fixed: JSON-encode, and escape < so </script> cannot break out\n<script>var q = JSON.parse(JSON_ENCODED_VALUE);</script>\n\n// better still: no inline script at all\n<div id=\"search\" data-q=\"USER_INPUT\"></div>",
    },
  },
  {
    id: 'reflected-href',
    title: 'Reflected XSS in an href (javascript: URI)',
    category: 'reflected',
    difficulty: 'practitioner',
    app: 'Greenleaf Store',
    tags: ['URL context', 'javascript: URI', 'blocklist bypass'],
    summary: 'A "back to results" link copies your query into href. The filter blocks the literal string javascript: — so use a tab character inside the scheme.',
    scenario:
      'After a search, Greenleaf renders `<a href="/search?q=${q}">Back to results</a>` — except the template writes the raw query into href first. A blocklist rejects anything containing "javascript:" which is the classic, and classically bypassable, defence.',
    goal: 'Get JavaScript running through the link. Two routes: break out of the href attribute, or bypass the scheme blocklist.',
    hints: [
      'The browser normalises URLs before choosing a scheme. Whitespace and control characters inside a scheme are stripped.',
      'If a filter blocks the letters, encode them: HTML entities are decoded when the attribute is parsed.',
      '&#9; is a tab. &#10; is a newline. Both are removed from the scheme by the URL parser.',
      'Quotes are not encoded either, so you can also leave the href and add your own attribute: `" onclick="alert(document.domain)`.',
      'This range sandboxes labs and Chrome blocks javascript: navigation inside a sandboxed frame, so the lab resolves the href and shows you the scheme it parsed instead of executing it.',
    ],
    payloads: [
      { label: 'Break out of the attribute (executes when the link is clicked)', code: '" onclick="alert(document.domain)' },
      { label: 'Scheme blocklist bypass: tab inside the scheme', code: 'java&#9;script:alert(document.domain)' },
      { label: 'Newline variant', code: 'java&#10;script:alert(document.domain)' },
      { label: 'If there is no filter at all', code: 'javascript:alert(document.domain)' },
    ],
    walkthrough: [
      { t: 'Find the link', d: 'Search for test, then inspect the "Back to results" anchor — its href is built from your query.' },
      { t: 'Confirm the blocklist', d: 'Submitting javascript:alert(1) returns an error banner: the server rejected the literal scheme.' },
      { t: 'Bypass the blocklist', d: 'Send `java&#9;script:alert(document.domain)`. The filter sees no "javascript:" substring, the HTML parser decodes &#9; to a tab inside href, and the lab shows the resolved scheme as <b>javascript:</b>.' },
      { t: 'Or skip the scheme entirely', d: 'Because quotes are also unencoded, send `" onclick="alert(document.domain)`. The parser closes href, adds an onclick attribute, and clicking the link executes your handler.' },
      { t: 'Explain the sandbox note', d: 'Chrome refuses javascript: navigation inside a sandboxed frame (this range always sandboxes labs), so the tab-bypass route is proven by the resolved scheme rather than an alert. On a normal page the click would run the code — which is why scheme allowlisting belongs in the app, not a blocklist.' },
    ],
    why:
      'URL schemes are decided after HTML entity decoding and after tab/newline stripping, but blocklists look at the raw request. Any normalisation step between the check and the use is a bypass primitive. This is also why "javascript:" filters miss `java\\tscript:` and `%6aavascript:`.',
    fix: {
      text: 'Do not put user input directly in href. Allowlist the scheme (https, mailto, relative paths) after parsing with the URL API, and reject everything else. Keep URLs in a query parameter instead of an attribute.',
      code: "function safeHref(raw) {\n  const url = new URL(raw, 'https://example.com');\n  if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return '#';\n  return url.href;\n}",
    },
  },
  {
    id: 'reflected-json',
    title: 'Reflected XSS in a JSON API response',
    category: 'reflected',
    difficulty: 'practitioner',
    app: 'Nimbus Support',
    tags: ['JSON', 'client-side sink', 'innerHTML'],
    summary: 'The API returns application/json and is not itself dangerous — but the page writes the decoded value with innerHTML.',
    scenario:
      'Nimbus rebuilt its search as an API plus a fetch() call. The endpoint returns {"q":"…"} with Content-Type: application/json, so putting a payload in the URL does nothing on its own. The client then does `box.innerHTML = data.q`. The bug moved from the server template into the browser.',
    goal: 'Achieve DOM execution through the JSON field, and note that the API alone would never show it.',
    hints: [
      'Open /lab/reflected-json/api?q=test directly and see what comes back. Reflection in JSON is not XSS by itself.',
      'Follow the data: the page fetches that endpoint and writes one field into the DOM.',
      'The sink is innerHTML, so an image with a broken src is enough.',
    ],
    payloads: [
      { label: 'HTML injection through the JSON field', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'Inside the raw API response', code: '/lab/reflected-json/api?q=<img src=x onerror=alert(document.domain)>' },
    ],
    walkthrough: [
      { t: 'Look at the API', d: 'Visit the /api?q=test path. You get JSON. A scanner stops here and calls it a false positive — correctly, for that endpoint.' },
      { t: 'Follow the consumer', d: 'The page script runs fetch(...).then(r => r.json()) and assigns the value with innerHTML.' },
      { t: 'Inject', d: 'Load ?q=<img src=x onerror=alert(document.domain)>. JSON is a transport, not a sanitiser: the string survives and the browser parses it as HTML at the sink.' },
      { t: 'Explain the impact', d: 'Any consumer of that field is vulnerable — a web client today, a mobile webview or an admin dashboard tomorrow. Fix it at the sink.' },
    ],
    why:
      'XSS is about where data reaches an HTML parser, not where it is stored. JSON with a correct Content-Type prevents direct navigation XSS, but it does nothing once client code feeds the string to innerHTML, jQuery .html(), document.write or a framework bypassing its own escaping.',
    fix: {
      text: 'Use textContent (or a template engine) for data, and only innerHTML for markup you built yourself. Treat every API field as attacker-controlled, including ones "we only show to admins".',
      code: "// vulnerable\nbox.innerHTML = data.q;\n\n// fixed\nbox.textContent = data.q;\n\n// if you must allow a little markup, sanitise it\nimport DOMPurify from 'dompurify';\nbox.innerHTML = DOMPurify.sanitize(data.q);",
    },
  },
];
