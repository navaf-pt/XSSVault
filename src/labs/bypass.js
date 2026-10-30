import { labPage, htmlResponse, esc } from '../shell.js';

const COOKIE = 'session=usr_5f2c91d7; theme=bypass';

/** Removes complete <script> blocks and stray script tags. Single pass, very naive. */
function stripScriptTags(v) {
  return String(v)
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<\/?script[^>]*>/gi, '');
}

/** Removes the literal tags <script>/</script> and every on*= handler. Still single pass. */
function stripTagsAndHandlers(v) {
  return String(v)
    .replace(/<\/?script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export const LABS = {
  /* 22 — tag blacklist */
  'bypass-tag-blacklist': {
    handle({ url }) {
      const q = url.searchParams.get('q') || '';
      const filtered = stripScriptTags(q);
      const body = `
        <h1>Reviews</h1>
        <p class="muted small">Reviews go through our sanitiser before they are shown: script tags are removed.</p>
        <form method="get" action="/lab/bypass-tag-blacklist" class="stack" style="margin-bottom:14px">
          <div><label for="q">Write a review</label><textarea id="q" name="q" placeholder="Loved it!">${esc(q)}</textarea></div>
          <button type="submit">Preview review</button>
        </form>
        ${
          q
            ? `<div class="card">
                 <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Your review</div>
                 <!-- INTENTIONAL VULNERABILITY: blocklist of one tag, output unencoded -->
                 <div class="msg">${filtered}</div>
               </div>
               <p class="small muted" style="margin-top:10px">Sanitiser output: <code>${esc(filtered)}</code></p>`
            : '<div class="empty">Nothing previewed yet.</div>'
        }`;
      return labPage({ id: 'bypass-tag-blacklist', app: 'Polygon Shop', title: 'Reviews', cookie: COOKIE, body });
    },
  },

  /* 23 — single-pass replacement, rebuild the tag */
  'bypass-nested-tag': {
    handle({ url }) {
      const q = url.searchParams.get('q') || '';
      const filtered = stripTagsAndHandlers(q);
      const body = `
        <h1>Comments</h1>
        <p class="muted small">Hardened sanitiser: removes <code>&lt;script&gt;</code>, <code>&lt;/script&gt;</code> and every <code>on*</code> handler.</p>
        <form method="get" action="/lab/bypass-nested-tag" class="stack" style="margin-bottom:14px">
          <div><label for="q">Comment</label><textarea id="q" name="q" placeholder="Great post!">${esc(q)}</textarea></div>
          <button type="submit">Post</button>
        </form>
        ${
          q
            ? `<div class="card">
                 <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Posted</div>
                 <!-- INTENTIONAL VULNERABILITY: non-recursive string replacement, output unencoded -->
                 <div class="msg">${filtered}</div>
               </div>
               <p class="small muted" style="margin-top:10px">Filter code: <code>input.replace(/&lt;\\/?script&gt;/gi, '').replace(/\\son\\w+\\s*=/gi, '')</code></p>`
            : '<div class="empty">No comment yet.</div>'
        }`;
      return labPage({ id: 'bypass-nested-tag', app: 'PixelPress', title: 'Comments', cookie: COOKIE, body });
    },
  },

  /* 24 — CSP script-src 'self' with a JSONP gadget */
  'bypass-csp-jsonp': {
    handle({ url }) {
      const q = url.searchParams.get('q') || '';
      const body = `
        <h1>Nimbus Cloud status</h1>
        <p class="muted small">This page ships a strict CSP: <code>script-src 'self'</code>. Inline script is blocked.</p>
        <div class="banner info">Legacy widget endpoint still available: <code>/api/jsonp?cb=name</code> returns <code>name({...})</code>.</div>
        <form method="get" action="/lab/bypass-csp-jsonp" class="stack" style="margin:14px 0">
          <div><label for="q">Status page search</label><input id="q" type="text" name="q" value="${esc(q)}" placeholder="incident, latency, uptime" /></div>
          <button type="submit">Search</button>
        </form>
        ${
          q
            ? `<div class="card">
                 <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Search</div>
                 <!-- INTENTIONAL VULNERABILITY: unencoded reflection -->
                 <div class="msg">Results for ${q}</div>
               </div>`
            : '<div class="empty">No search yet. All systems operational.</div>'
        }
        <p class="small muted" style="margin-top:14px">CSP in force:
          <code>default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'</code></p>`;
      return htmlResponse(
        labPage({ id: 'bypass-csp-jsonp', app: 'Nimbus Cloud', title: 'Status', cookie: COOKIE, body }),
        { headers: { 'content-security-policy': "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'" } }
      );
    },
  },

  /* 25 — client-side template injection */
  'bypass-csti': {
    handle({ url }) {
      const tpl = url.searchParams.get('t') || '';
      const body = `
        <h1>Newsletter greeting</h1>
        <p class="muted small">Write your greeting template. Use <code>{{ user.name }}</code> for the subscriber name.</p>
        <form method="get" action="/lab/bypass-csti" class="stack" style="margin-bottom:14px">
          <div><label for="t">Template</label><textarea id="t" name="t" placeholder="Hi {{ user.name }}, thanks for reading!">${esc(tpl)}</textarea></div>
          <button type="submit">Render preview</button>
        </form>
        <div class="card">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Rendered</div>
          <div id="out" style="margin-top:4px"></div>
        </div>
        <!-- INTENTIONAL VULNERABILITY: user input compiled as a template expression -->
        <script>
          function renderTemplate(tpl, scope) {
            return String(tpl).replace(/\\{\\{([\\s\\S]+?)\\}\\}/g, function (_, expr) {
              try {
                return String(new Function('scope', 'with (scope) { return (' + expr + '); }')(scope));
              } catch (e) {
                return '[template error]';
              }
            });
          }
          (function () {
            var tpl = ${JSON.stringify(tpl)};
            if (!tpl) return;
            var out = document.getElementById('out');
            out.innerHTML = renderTemplate(tpl, { user: { name: 'Dana', plan: 'pro' } });
          })();
        </script>`;
      return labPage({ id: 'bypass-csti', app: 'PixelPress', title: 'Greeting template', cookie: COOKIE, body });
    },
  },
};
