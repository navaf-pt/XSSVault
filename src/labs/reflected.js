import { labPage, htmlResponse, jsonResponse, esc, filters } from '../shell.js';

const COOKIE = 'session=usr_5f2c91d7; theme=leaf';

/** Search form shared by the search-shaped labs. */
function searchForm(id, q, extra = '') {
  return `<form method="get" action="/lab/${id}" class="row" style="margin-bottom:14px">
      <input type="search" name="q" placeholder="Search…" value="${esc(q)}" style="flex:1" />
      <button type="submit">Search</button>
    </form>${extra}`;
}

export const LABS = {
  /* 1 — HTML text context */
  'reflected-html': {
    handle({ url }) {
      const q = url.searchParams.get('q') || '';
      const body = `
        <h1>Nimbus knowledge base</h1>
        <p class="muted small">Search help articles, or browse the top questions below.</p>
        ${searchForm('reflected-html', q)}
        ${
          q
            ? `<div class="card">
                 <!-- INTENTIONAL VULNERABILITY: q is interpolated into HTML text unencoded -->
                 <h2 style="margin:0">Results for ${q}</h2>
                 <p class="muted small" style="margin-bottom:0">3 articles matched your query.</p>
               </div>
               <div class="list" style="margin-top:12px">
                 <div class="item"><div class="meta">Article</div>Resetting your API key</div>
                 <div class="item"><div class="meta">Article</div>Inviting teammates to a workspace</div>
                 <div class="item"><div class="meta">Article</div>Understanding billing periods</div>
               </div>`
            : `<div class="empty">Type a query to search the knowledge base.</div>`
        }`;
      return labPage({ id: 'reflected-html', app: 'Nimbus Support', title: 'Knowledge base', cookie: COOKIE, body });
    },
  },

  /* 2 — quoted attribute, angle brackets encoded but not quotes */
  'reflected-attribute': {
    handle({ url }) {
      const q = url.searchParams.get('q') || '';
      const filtered = filters.encodeAnglesOnly(q);
      const body = `
        <h1>Product search</h1>
        <p class="muted small">We remember your last search so you can refine it.</p>
        <form method="get" action="/lab/reflected-attribute" class="stack">
          <!-- INTENTIONAL VULNERABILITY: value attribute built by concatenation; only < and > are filtered -->
          <input class="q" type="text" name="q" value="${filtered}" placeholder="Search products…" />
          <button type="submit">Search</button>
        </form>
        <p class="small muted" style="margin-top:14px">Filter in use: <code>&lt;</code> and <code>&gt;</code> are removed as entities. Quotes are passed through.</p>
        ${
          q
            ? `<div class="list">${['Nimbus Desk Lamp — $49', 'Nimbus Notebook — $8', 'Nimbus Cable Kit — $19']
                .map((x) => `<div class="item">${esc(x)}</div>`)
                .join('')}</div>`
            : ''
        }`;
      return labPage({ id: 'reflected-attribute', app: 'Polygon Shop', title: 'Product search', cookie: COOKIE, body });
    },
  },

  /* 3 — unquoted attribute */
  'reflected-unquoted': {
    handle({ url }) {
      const q = url.searchParams.get('q') || '';
      // The filter blocks the four characters people always block.
      const filtered = q.replace(/[<>"']/g, '');
      const body = `
        <h1>Greenleaf store</h1>
        <p class="muted small">Search our spring collection.</p>
        ${searchForm('reflected-unquoted', q)}
        ${
          q
            ? `<p class="small muted">Preview chip (hover it):</p>
               <!-- INTENTIONAL VULNERABILITY: unquoted attribute value -->
               <div class="preview" data-q=${filtered} style="display:inline-block;background:#eef6ff;border:1px solid #bfdbfe;color:#1e3a8a;padding:9px 13px;border-radius:9px;font:600 13px/1 ui-monospace,monospace">“${esc(q)}”</div>`
            : `<div class="empty">Search for something to preview it here.</div>`
        }
        <p class="small muted" style="margin-top:16px">Filter in use: <code>&lt;</code> <code>&gt;</code> <code>"</code> <code>'</code> are stripped.</p>`;
      return labPage({ id: 'reflected-unquoted', app: 'Greenleaf Store', title: 'Store search', cookie: COOKIE, body });
    },
  },

  /* 4 — JavaScript string context */
  'reflected-js-string': {
    handle({ url }) {
      const q = url.searchParams.get('q') || '';
      const filtered = q.replace(/[<>]/g, '');
      const body = `
        <h1>Search</h1>
        <p class="muted small">Results are rendered by a legacy inline widget.</p>
        ${searchForm('reflected-js-string', q)}
        <div id="results"></div>
        <!-- INTENTIONAL VULNERABILITY: request data concatenated into JavaScript source -->
        <script>
          var q = '${filtered}';
          document.write('<div class="card">You searched for <b>' + q + '</b></div>');
        </script>
        <p class="small muted" style="margin-top:14px">Filter in use: <code>&lt;</code> and <code>&gt;</code> are stripped from the query.</p>`;
      return labPage({ id: 'reflected-js-string', app: 'Nimbus Support', title: 'Search', cookie: COOKIE, body });
    },
  },

  /* 5 — href / javascript: URI with a blocklist */
  'reflected-href': {
    handle({ url }) {
      const q = url.searchParams.get('q') || '';
      const blocked = /javascript:/i.test(q);
      const body = `
        <h1>Greenleaf store</h1>
        <p class="muted small">Search results for your last query.</p>
        ${searchForm('reflected-href', '')}
        ${
          blocked
            ? `<div class="banner bad">Blocked: the query contains a disallowed scheme.</div>`
            : q
              ? `<div class="card">
                   <p class="small muted" style="margin:0 0 6px">Refine your search:</p>
                   <!-- INTENTIONAL VULNERABILITY: query interpolated into href + a blocklist that only checks the raw string -->
                   <a id="refine" href="${q}">${esc(q)}</a>
                 </div>
                 <div id="verdict" class="small" style="margin-top:10px"></div>
                 <p class="small muted" style="margin:8px 0 0">This range renders labs in a sandboxed frame, and Chrome blocks <code>javascript:</code> navigation there.
                 So the lab resolves the href for you and reports the scheme it parsed — that is the proof the blocklist was bypassed.</p>
                 <script>
                   (function () {
                     var a = document.getElementById('refine');
                     if (!a) return;
                     var resolved;
                     try { resolved = new URL(a.getAttribute('href'), location.href); } catch (e) { return; }
                     document.getElementById('verdict').innerHTML = 'Resolved scheme: <b>' + resolved.protocol + '</b>';
                     if (resolved.protocol === 'javascript:' && window.__labSolved) {
                       window.__labSolved('scheme blocklist bypassed: ' + resolved.protocol);
                     }
                   })();
                 </script>
                 <div class="list" style="margin-top:12px"><div class="item">Spring jacket — $89</div><div class="item">Canvas tote — $24</div></div>`
              : `<div class="empty">Run a search to get a refine link.</div>`
        }
        <p class="small muted" style="margin-top:16px">Filter in use: the raw query is rejected if it contains the literal text <code>javascript:</code>.</p>`;
      return labPage({ id: 'reflected-href', app: 'Greenleaf Store', title: 'Refine search', cookie: COOKIE, body });
    },
  },

  /* 6 — JSON API consumed by the client */
  'reflected-json': {
    handle({ url, segs }) {
      const q = url.searchParams.get('q') || '';

      if (segs[0] === 'api') {
        // The API itself is not vulnerable: it is application/json and echoes data only.
        return jsonResponse({ q, total: 3, items: ['Reset your API key', 'Invite teammates', 'Billing periods'] }, {
          headers: { 'x-content-type-options': 'nosniff', 'access-control-allow-origin': '*' },
        });
      }

      const body = `
        <h1>Knowledge base</h1>
        <p class="muted small">Search is rendered client-side from the JSON API.</p>
        ${searchForm('reflected-json', q)}
        <div id="out"></div>
        <p class="small muted" style="margin-top:16px">Transport: <code>/lab/reflected-json/api?q=…</code> returns <code>application/json</code>. The page renders one field with <code>innerHTML</code>.</p>
        <script>
          (function () {
            var q = new URLSearchParams(location.search).get('q') || '';
            if (!q) return;
            fetch('/lab/reflected-json/api?q=' + encodeURIComponent(q))
              .then(function (r) { return r.json(); })
              .then(function (data) {
                var box = document.getElementById('out');
                // INTENTIONAL VULNERABILITY: JSON field written with an HTML sink
                box.innerHTML = '<div class="card"><h2 style="margin:0">Results for ' + data.q + '</h2>' +
                  '<p class="muted small" style="margin-bottom:0">' + data.total + ' articles matched.</p></div>';
              });
          })();
        </script>`;
      return labPage({ id: 'reflected-json', app: 'Nimbus Support', title: 'Knowledge base', cookie: COOKIE, body });
    },
  },
};
