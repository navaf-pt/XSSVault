export const SELF = [
  {
    id: 'self-console',
    title: 'Self-XSS: the "paste this in your console" scam',
    category: 'self',
    difficulty: 'apprentice',
    app: 'PixelPress',
    tags: ['self-XSS', 'social engineering', 'devtools'],
    summary: 'Nobody can inject into your own console — so attackers convince you to inject for them. This lab shows the mechanics and the tell-tale signs.',
    scenario:
      'The classic social-engineering chain: a page or chat says "paste this code into your browser console to unlock the theme / verify your account / win the giveaway". The code runs with your session, on the site you are logged into. There is no server-side vulnerability — the victim is the delivery mechanism. This lab simulates a user pasting something they were told to paste.',
    goal: 'Paste a payload into the simulated console, then explain why this is not a vulnerability in the website.',
    hints: [
      'Self-XSS requires the victim to run code themselves. The payload is only as dangerous as the instruction that came with it.',
      'Try alert(document.cookie) — a real scam would send that value somewhere.',
      'Look at the "why it works" panel: the defence is education, browser warnings and CSP, not input filtering.',
    ],
    payloads: [
      { label: 'What a scam asks you to paste', code: 'alert(document.cookie)' },
      { label: 'What the scam actually runs', code: "fetch('/api/attack/log?lab=self-console&src=self-xss&d='+encodeURIComponent(document.cookie))" },
      { label: 'Obfuscated as a "theme loader" (this is what it looks like in the wild)', code: "javascript:void(fetch('/api/attack/log?lab=self-console&src=obfuscated&d='+encodeURIComponent(document.cookie)))" },
    ],
    walkthrough: [
      { t: 'Paste something harmless', d: 'Type 1+1 in the simulated console and run it. It evaluates, exactly like a real devtools console.' },
      { t: 'Paste the "theme loader"', d: 'Run the third payload. It does nothing visible except send your session to the console at the bottom of this page — a perfect scam payload.' },
      { t: 'See why it is not a site bug', d: 'The site never rendered your input. You typed code into an evaluator. Fixing this with input filters would break the console feature and still not stop a determined script.' },
      { t: 'Recognise the pattern', d: 'Unsolicited instructions to paste code, "verify by pasting", shortened snippets with encoded blobs, requests to disable your adblocker or open devtools: all red flags. Devtools now warns on paste; browsers refuse javascript: URLs typed in some contexts for the same reason.' },
      { t: 'Note the one real defence', d: 'CSP still limits what a pasted payload can do, and HttpOnly cookies make it harder to walk away with a session. Education does the rest.' },
    ],
    why:
      'Self-XSS is a social-engineering attack, not an injection flaw: the code runs with the victim\'s own privileges because the victim executed it. Bug bounty programmes generally reject self-XSS unless you can chain it into a real cross-user attack (for example, DOM XSS that runs the payload automatically after a paste).',
    fix: {
      text: 'You cannot filter your way out of self-XSS. Use CSP so pasted code cannot reach third-party endpoints, keep session cookies HttpOnly, and never ask users to paste code. If you must offer a console, isolate it in a sandboxed worker without DOM or network access.',
      code: "Content-Security-Policy: default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'\n\n// and an HttpOnly session cookie\nSet-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax",
    },
  },
];
