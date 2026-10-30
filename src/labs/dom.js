import { labPage, htmlResponse, jsonResponse, redirect, esc } from '../shell.js';
import { addEntry, listEntries, setSetting, getSetting } from '../store.js';

const COOKIE = 'session=usr_5f2c91d7; theme=pixel';

/** Fragment setter: lets the student drive hash-based labs without devtools. */
function hashForm(id, label, ph) {
  return `<form class="stack" style="margin-bottom:16px" onsubmit="event.preventDefault(); var v=this.t.value; location.hash = v; location.reload();">
      <div><label for="t">${esc(label)}</label><input id="t" type="text" name="t" placeholder="${esc(ph)}" /></div>
      <button type="submit">Set fragment &amp; reload</button>
    </form>`;
}

export const LABS = {
  /* 12 */
  'dom-document-write': {
    handle({ url }) {
      const body = `
        <h1>PixelPress search highlight</h1>
        <p class="muted small">The highlighted term comes from the URL fragment, so it never reaches the server.</p>
        ${hashForm('dom-document-write', 'Search term (goes into the # fragment)', '<img src=x onerror=alert(1)>')}
        <div id="out"></div>
        <p class="small muted" style="margin-top:16px">Server-side request log for this page: <code>GET /lab/dom-document-write</code> — no query, no fragment.</p>
        <!-- INTENTIONAL VULNERABILITY: document.write of location.hash -->
        <script>
          (function () {
            var term = decodeURIComponent((location.hash || '').slice(1));
            if (!term) return;
            document.write('<div class="card"><h2 style="margin:0">You searched for ' + term + '</h2>' +
              '<p class="muted small" style="margin-bottom:0">Highlighting matches in the archive…</p></div>');
          })();
        </script>`;
      return labPage({ id: 'dom-document-write', app: 'PixelPress', title: 'Search highlight', cookie: COOKIE, body });
    },
  },

  /* 13 */
  'dom-innerhtml': {
    handle() {
      const body = `
        <h1>Welcome back</h1>
        <p class="muted small">Greeting is rendered client-side from the query string.</p>
        <form class="stack" style="margin-bottom:16px" onsubmit="event.preventDefault(); location.search = '?name=' + encodeURIComponent(this.t.value);">
          <div><label for="t">Your name</label><input id="t" type="text" name="t" placeholder="returning shopper" /></div>
          <button type="submit">Set name</button>
        </form>
        <div class="card" id="banner">Hello, guest.</div>
        <!-- INTENTIONAL VULNERABILITY: innerHTML sink fed from URLSearchParams -->
        <script>
          (function () {
            var name = new URLSearchParams(location.search).get('name');
            if (!name) return;
            document.getElementById('banner').innerHTML = 'Welcome back, <b>' + name + '</b>';
          })();
        </script>`;
      return labPage({ id: 'dom-innerhtml', app: 'Greenleaf Store', title: 'Welcome back', cookie: COOKIE, body });
    },
  },

  /* 14 */
  'dom-eval': {
    handle() {
      const body = `
        <h1>Status page</h1>
        <p class="muted small">A leftover debugger: pass a snippet in the fragment to evaluate it.</p>
        <div class="banner info">Engineers used this to poke at the status widget from bookmarks. It shipped.</div>
        ${hashForm('dom-eval', 'JavaScript to evaluate (no # needed)', 'alert(document.domain)')}
        <div class="card"><p class="small muted" style="margin:0">eval() output appears below.</p><pre id="out" style="margin-top:8px">—</pre></div>
        <!-- INTENTIONAL VULNERABILITY: eval of location.hash -->
        <script>
          (function () {
            var code = decodeURIComponent((location.hash || '').slice(1));
            if (!code) return;
            var out = document.getElementById('out');
            try { out.textContent = String(eval(code)); }
            catch (e) { out.textContent = 'Error: ' + e.message; }
          })();
        </script>`;
      return labPage({ id: 'dom-eval', app: 'Nimbus Support', title: 'Status', cookie: COOKIE, body });
    },
  },

  /* 15 */
  'dom-settimeout': {
    handle() {
      const body = `
        <h1>Launch countdown</h1>
        <p class="muted small">The countdown setup code is passed to setTimeout as a string.</p>
        <div class="card" id="tick">waiting…</div>
        ${hashForm('dom-settimeout', 'Countdown setup code', 'alert(document.domain)')}
        <!-- INTENTIONAL VULNERABILITY: setTimeout called with a string -->
        <script>
          (function () {
            var code = decodeURIComponent((location.hash || '').slice(1));
            if (!code) return;
            setTimeout(code, 150);
          })();
        </script>`;
      return labPage({ id: 'dom-settimeout', app: 'PixelPress', title: 'Countdown', cookie: COOKIE, body });
    },
  },

  /* 16 */
  'dom-selector': {
    handle() {
      const body = `
        <h1>Anchor navigation</h1>
        <p class="muted small">The theme script runs <code>$(location.hash)</code> to scroll to a section.</p>
        ${hashForm('dom-selector', 'Hash (without #)', '<img src=x onerror=alert(1)>')}
        <div class="card" id="out"><p class="muted small" style="margin:0">Resolved nodes are appended here.</p></div>
        <!-- INTENTIONAL VULNERABILITY: jQuery-style $() treats strings starting with < as HTML -->
        <script>
          window.$ = function (arg) {
            if (typeof arg === 'string' && /^\\s*</.test(arg)) {
              var d = document.createElement('div');
              d.innerHTML = arg;            // parses attacker HTML
              return Array.prototype.slice.call(d.children);
            }
            try { return Array.prototype.slice.call(document.querySelectorAll(arg || '*')); }
            catch (e) { return []; }
          };
          (function () {
            var h = decodeURIComponent((location.hash || '').slice(1));
            if (!h) return;
            var out = document.getElementById('out');
            var nodes = $(h);
            nodes.forEach(function (n) { out.appendChild(n); });
          })();
        </script>`;
      return labPage({ id: 'dom-selector', app: 'Greenleaf Store', title: 'Navigation', cookie: COOKIE, body });
    },
  },

  /* 17 */
  'dom-postmessage': {
    handle({ segs }) {
      if (segs[0] === 'widget') {
        const wbody = `
          <div class="card" style="margin-bottom:10px">
            <div class="meta" style="font:600 10px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#64748b">Third-party widget</div>
            <h2 style="font-size:14px;margin:2px 0 8px">Message the chat window</h2>
            <form class="stack" onsubmit="event.preventDefault(); parent.postMessage(this.m.value, '*'); this.m.value='';">
              <input id="m" name="m" type="text" placeholder="Hi! How can we help?" />
              <button type="submit" class="tiny">Send message</button>
            </form>
            <p class="small muted" style="margin:8px 0 0">This frame posts to its parent with target origin <code>*</code>. It never checks who the parent is, and the parent never checks who sent the message.</p>
          </div>`;
        return labPage({ id: 'dom-postmessage', app: 'Widget sandbox', title: 'Chat widget', cookie: '', body: wbody });
      }

      const body = `
        <h1>Nimbus Chat</h1>
        <p class="muted small">Messages from the widget are rendered into the conversation.</p>
        <div class="card" id="box" style="min-height:64px">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;letter-spacing:.08em;text-transform:uppercase">Conversation</div>
          <p class="muted small" id="placeholder" style="margin:6px 0 0">No messages yet — send one from the widget below.</p>
        </div>
        <p class="small muted" id="mlog" style="margin:8px 0 0">last message origin: —</p>
        <div style="margin-top:12px;border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#fff">
          <iframe src="/lab/dom-postmessage/widget" sandbox="allow-scripts allow-forms" style="width:100%;height:190px;border:0" title="widget"></iframe>
        </div>
        <!-- INTENTIONAL VULNERABILITY: no event.origin check, then innerHTML -->
        <script>
          window.addEventListener('message', function (e) {
            document.getElementById('mlog').textContent = 'last message origin: ' + e.origin;
            var box = document.getElementById('box');
            box.innerHTML = '<div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;letter-spacing:.08em;text-transform:uppercase">Conversation</div><div id="msg"></div>';
            box.querySelector('#msg').innerHTML = e.data;
          });
        </script>`;
      return labPage({ id: 'dom-postmessage', app: 'Nimbus Chat', title: 'Chat', cookie: COOKIE, body });
    },
  },

  /* 18 */
  'dom-windowname': {
    handle({ segs }) {
      if (segs[0] === 'partner') {
        const body = `
          <h1>Partner storefront</h1>
          <p class="muted small">Restoring your session state from the browsing context…</p>
          <div class="card" id="restored"><span class="muted small">no state</span></div>
          <p class="small muted" style="margin-top:14px"><a href="/lab/dom-windowname">← back to step 1</a></p>
          <!-- INTENTIONAL VULNERABILITY: window.name written into HTML -->
          <script>
            document.getElementById('restored').innerHTML =
              window.name ? ('<div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;letter-spacing:.08em;text-transform:uppercase">Restored</div>' + window.name)
                          : '<span class="muted small">no state found</span>';
          </script>`;
        return labPage({ id: 'dom-windowname', app: 'Greenleaf Store', title: 'Partner storefront', cookie: COOKIE, body });
      }

      const body = `
        <h1>Step 1 — the site before the target</h1>
        <p class="muted small">Any page can set <code>window.name</code> and then send the visitor to another site. The value survives the navigation.</p>
        <form class="stack" style="margin-bottom:14px" onsubmit="event.preventDefault(); window.name = this.v.value; location.href = '/lab/dom-windowname/partner';">
          <div><label for="v">Value for window.name</label><input id="v" type="text" name="v" placeholder="<img src=x onerror=alert(1)>" /></div>
          <button type="submit">Set window.name and continue to partner site →</button>
        </form>
        <div class="banner info">The partner page (step 2) writes <code>window.name</code> into its DOM as HTML. Your value crosses the navigation boundary with you.</div>`;
      return labPage({ id: 'dom-windowname', app: 'Attacker-ish page', title: 'window.name step 1', cookie: COOKIE, body });
    },
  },

  /* 19 */
  'dom-json': {
    async handle({ env, form, method, segs }) {
      if (segs[0] === 'api') {
        const rows = await listEntries(env, { lab: 'dom-json', kind: 'note', limit: 30 });
        return jsonResponse(rows.map((r) => r.data), {
          headers: { 'x-content-type-options': 'nosniff', 'access-control-allow-origin': '*' },
        });
      }

      if (method === 'POST') {
        await addEntry(env, { lab: 'dom-json', kind: 'note', data: { author: 'account-alerts', text: form.text || '' } });
        return redirect('/lab/dom-json?saved=1');
      }

      const rows = await listEntries(env, { lab: 'dom-json', kind: 'note', limit: 30 });
      const body = `
        <h1>Notification centre</h1>
        <p class="muted small">Rendered in the browser from <code>/lab/dom-json/api</code>. ${rows.length} notification(s) stored.</p>
        <form method="post" action="/lab/dom-json" class="stack" style="margin-bottom:16px">
          <div><label for="t">New notification text</label><input id="t" type="text" name="text" placeholder="Your workspace limit is approaching…" /></div>
          <button type="submit">Add notification</button>
        </form>
        <div class="list" id="list"><div class="empty">loading…</div></div>
        <!-- INTENTIONAL VULNERABILITY: client-side rendering with innerHTML -->
        <script>
          fetch('/lab/dom-json/api').then(function (r) { return r.json(); }).then(function (items) {
            var list = document.getElementById('list');
            if (!items.length) { list.innerHTML = '<div class="empty">No notifications.</div>'; return; }
            list.innerHTML = items.map(function (n) {
              return '<div class="item"><div class="meta">' + n.author + '</div>' + n.text + '</div>';
            }).join('');
          });
        </script>`;
      return labPage({ id: 'dom-json', app: 'Nimbus Support', title: 'Notifications', cookie: COOKIE, body });
    },
  },

  /* 20 */
  'dom-urlpath': {
    handle({ url }) {
      const body = `
        <h1>Docs viewer</h1>
        <p class="muted small">The breadcrumb is built from <code>location.pathname</code>.</p>
        <form class="stack" style="margin-bottom:16px" onsubmit="event.preventDefault(); location.href = '/lab/dom-urlpath/' + encodeURIComponent(this.s.value);">
          <div><label for="s">Document slug</label><input id="s" type="text" name="s" placeholder="getting-started" /></div>
          <button type="submit">Open document</button>
        </form>
        <div class="card">
          <p class="small muted" style="margin:0 0 4px">Breadcrumb</p>
          <div id="crumbs"></div>
        </div>
        <div class="nav-pills" style="margin-top:14px">
          <a href="/lab/dom-urlpath/getting-started">getting-started</a>
          <a href="/lab/dom-urlpath/api-keys">api-keys</a>
          <a href="/lab/dom-urlpath/billing">billing</a>
        </div>
        <!-- INTENTIONAL VULNERABILITY: path segment decoded and written with innerHTML -->
        <script>
          (function () {
            var seg = decodeURIComponent((location.pathname.split('/')[3] || ''));
            if (!seg) return;
            document.getElementById('crumbs').innerHTML = '<a href="/">Docs</a> / <span>' + seg + '</span>';
          })();
        </script>`;
      return labPage({ id: 'dom-urlpath', app: 'Nimbus Docs', title: 'Docs', cookie: COOKIE, body });
    },
  },

  /* 21 */
  'dom-clobbering': {
    async handle({ env, form, method, segs }) {
      if (segs[0] === 'ping') return jsonResponse({ ok: true, note: 'legit heartbeat endpoint' });
      const KEY = 'dom-clobbering:name';
      if (method === 'POST') {
        const raw = form.name || '';
        const clean = String(raw)
          .replace(/<(?!\/?a[\s>])[^>]*>/gi, '') // allow only <a>
          .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
        await setSetting(env, KEY, clean);
        return redirect('/lab/dom-clobbering?saved=1');
      }

      const name = (await getSetting(env, KEY, '')) || '';
      const body = `
        <h1>Display name</h1>
        <p class="muted small">Links are allowed in your name; everything else is tidied away. The name is rendered as HTML.</p>
        <form method="post" action="/lab/dom-clobbering" class="stack" style="margin-bottom:14px">
          <div><label for="n">Display name</label><input id="n" type="text" name="name" value="${esc(name)}" placeholder='<a href="/">Dana</a>' /></div>
          <button type="submit">Save display name</button>
        </form>
        <div class="card">
          <p class="small muted" style="margin:0 0 4px">How your name renders:</p>
          <div id="name">${name || '<span class="muted">(not set)</span>'}</div>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Config heartbeat</div>
          <p class="small muted" style="margin:6px 0">On load the page sends a heartbeat, including the session, to the endpoint in its config.</p>
          <p class="small" id="beat" style="margin:0">waiting…</p>
          <p style="margin:8px 0 0"><button type="button" class="tiny" id="beat-btn">Send heartbeat now</button></p>
        </div>
        <p class="small muted">The endpoint is read from <code>window.appConfig.endpoint</code> — a global the theme partial is supposed to inject.</p>
        <!-- INTENTIONAL VULNERABILITY: config read from a DOM-clobberable global -->
        <script>
          (function () {
            var cfg = window.appConfig || {};
            var endpoint = (cfg.endpoint && (cfg.endpoint.href || cfg.endpoint.value)) || '/lab/dom-clobbering/ping';
            function beat() {
              var url = String(endpoint) + (String(endpoint).indexOf('?') > -1 ? '&' : '?') + 'd=' + encodeURIComponent(document.cookie);
              fetch(url).then(function () {
                document.getElementById('beat').textContent = 'heartbeat sent to ' + url.slice(0, 140);
              }).catch(function () {
                document.getElementById('beat').textContent = 'heartbeat failed for ' + url.slice(0, 140);
              });
            }
            document.getElementById('beat-btn').addEventListener('click', beat);
            beat();
          })();
        </script>`;
      return labPage({ id: 'dom-clobbering', app: 'Nimbus Docs', title: 'Display name', cookie: COOKIE, body });
    },
  },
};
