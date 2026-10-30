# XSSVault
<img width="1434" height="860" alt="Screenshot From 2026-10-30 19-38-13" src="https://github.com/user-attachments/assets/92e30244-ef22-4d19-bc28-040335c29ac2" />

A self-contained, sandboxed XSS training range: **36 labs** covering every major type of
cross-site scripting, each with a scenario, guided hints, working payloads, a step-by-step
walkthrough, the root cause and the fix — plus 7 full real-world attack-chain labs.

Live pages: the portal is static (served from `public/`), the vulnerable targets and the
exfil sink are a Cloudflare Worker (`src/`).

---

## Safety model (read this first)

The labs are *deliberately* vulnerable. Containment is the point:

- Every lab runs inside `<iframe sandbox="allow-scripts allow-forms allow-modals">` with **no**
  `allow-same-origin`, so a payload executes in an opaque origin and cannot read the portal,
  its storage, cookies or DOM. Top-level navigation is not permitted either.
- There are **no real credentials anywhere**. Lab pages get a *simulated* cookie jar (the page
  shim redefines `document.cookie` inside the frame) so classic "steal the session" lessons still
  work without issuing a session.
- Exfiltration payloads post to this site's own `/api/attack/log` endpoint, which feeds the
  **Attacker console** in the portal. Nothing is ever sent to a third party, and there is no
  outbound callback infrastructure.
- Lab responses carry `X-Robots-Tag: noindex` and the range is meant to be used locally or as a
  training deployment, not exposed as production SaaS.
- `javascript:` navigation is blocked by Chrome inside sandboxed frames; the two labs that would
  need it (href scheme bypass, DOM clobbering) are wired so the *bypass* is proven in-page and
  the *impact* is proven through the app's own request instead of a navigation.

## Lab index

| Type | Count | What it teaches |
| --- | --- | --- |
| Reflected | 6 | HTML text, quoted attribute, unquoted attribute, JavaScript string, `href` scheme, JSON API consumed client-side |
| Stored | 5 | guestbook, profile viewed by an admin, second-order (invoice print), uploaded filename, audit log |
| DOM-based | 10 | `document.write`, `innerHTML`, `eval`, `setTimeout` string, selector sink, `postMessage` without origin check, `window.name`, JSON → client rendering, `location.pathname` router, DOM clobbering |
| Filters / CSP / sanitisers | 4 | tag blocklist, non-recursive sanitiser (tag rebuilt from its own removal), CSP `script-src 'self'` + JSONP gadget, client-side template injection |
| Blind | 3 | contact-form queue, logged request header, silent session capture |
| Self-XSS | 1 | the "paste this in your console" scam |
| Real-world scenarios | 7 | moderated blog queue, support agent console, password-reset token theft, OAuth `state` XSS, chat-widget origin trust, markdown renderer, SVG avatar upload |

`mXSS` (mutation XSS) and parser-differential bypasses are covered by principle in the defense
guide: their payloads depend on the exact browser/sanitiser version, so the range does not ship a
lab that might silently stop firing.

## Run locally

```bash
npm install            # wrangler + playwright (dev only)
npm run dev            # http://localhost:3000  (wrangler dev, local D1)
npm run build          # bundles src/worker.js -> dist/worker.js for deployment
```

Storage: when a `DB` (D1) binding exists it is used and the schema is created lazily; without a
binding the Worker falls back to an in-isolate in-memory store, so labs still work in a bare
`wrangler dev`.

## Verification

`tools/test-labs.mjs` drives headless Chromium through **every lab** with the payload from its
walkthrough, inside the same sandboxed iframe the portal uses, and asserts real evidence:

- a script-execution message posted by the lab frame (the shim intercepts `alert`),
- a native dialog (the SVG upload lab, which runs without the shim), or
- the exfiltration callback landing in the attacker console (DOM-clobbering / blind chains).

It also checks that inline script is genuinely blocked under the CSP lab, and that the
attacker-console endpoint round-trips.

```bash
npm run test:labs      # expects a dev server on 127.0.0.1:3000
```

The suite lives outside the deployed bundle and needs no network beyond localhost. In a bare
Linux container Chromium may need system libraries and fonts; `tools/fetch-libs.sh` unpacks the
Debian packages it needs into `.chromium-libs` without root, and `tools/fonts.conf` provides a
minimal fontconfig setup.
