import { labPage, htmlResponse, redirect, esc } from '../shell.js';
import { addEntry, listEntries, setSetting, getSetting } from '../store.js';

const USER_COOKIE = 'session=usr_5f2c91d7; theme=leaf';
const AGENT_COOKIE = 'session=adm_71be4f0c9a; role=agent';
const MOD_COOKIE = 'session=adm_4b2a8e5d11; role=moderator';

/** Intentionally naive markdown: raw HTML passes through, link schemes are not checked. */
function md(s) {
  return String(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, '<br />');
}

function ago(ts) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  return s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
}

export const LABS = {
  /* 30 — moderated blog */
  'rw-blog-moderator': {
    async handle({ env, form, method, segs }) {
      const KEY = 'rw-blog-moderator:approved';
      const approved = new Set(((await getSetting(env, KEY, '')) || '').split(',').filter(Boolean));

      if (segs[0] === 'admin') {
        if (method === 'POST') {
          if (form.approve) approved.add(String(form.approve));
          if (form.reject) approved.delete(String(form.reject));
          await setSetting(env, KEY, [...approved].join(','));
          return redirect('/lab/rw-blog-moderator/admin');
        }
        const rows = await listEntries(env, { lab: 'rw-blog-moderator', kind: 'comment', limit: 40 });
        const queue = rows.length
          ? rows
              .map(
                (r) => `<div class="item">
                  <div class="meta">${esc(r.data.author)} · ${ago(r.createdAt)} · ${approved.has(String(r.id)) ? 'published' : 'pending'}</div>
                  <!-- INTENTIONAL VULNERABILITY: moderation queue renders the pending comment as HTML -->
                  <div>${r.data.body}</div>
                  <form method="post" action="/lab/rw-blog-moderator/admin" class="row" style="margin-top:8px">
                    <input type="hidden" name="${approved.has(String(r.id)) ? 'reject' : 'approve'}" value="${r.id}" />
                    <button class="tiny" type="submit">${approved.has(String(r.id)) ? 'Unpublish' : 'Approve'}</button>
                  </form>
                </div>`
              )
              .join('')
          : '<div class="empty">Queue is empty.</div>';

        const body = `
          <h1>Moderation queue</h1>
          <p class="muted small">Signed in as moderator. Comments awaiting review are rendered so you can see formatting.</p>
          <div class="banner warn">Reading the queue is enough to trigger a payload — approval is not required.</div>
          <div class="list" style="margin-top:12px">${queue}</div>`;
        return labPage({
          id: 'rw-blog-moderator',
          app: 'PixelPress',
          title: 'Moderation queue',
          cookie: MOD_COOKIE,
          who: 'moderator@pixelpress.example',
          body,
        });
      }

      if (method === 'POST') {
        await addEntry(env, {
          lab: 'rw-blog-moderator',
          kind: 'comment',
          data: { author: form.author || 'reader', body: form.body || '' },
        });
        return redirect('/lab/rw-blog-moderator?posted=1');
      }

      const rows = await listEntries(env, { lab: 'rw-blog-moderator', kind: 'comment', limit: 40 });
      const published = rows.filter((r) => approved.has(String(r.id)));
      const pending = rows.length - published.length;

      const list = published.length
        ? published
            .map(
              (r) => `<div class="item">
                <div class="meta">${esc(r.data.author)} · ${ago(r.createdAt)}</div>
                <!-- INTENTIONAL VULNERABILITY: published comment rendered as HTML -->
                <div>${r.data.body}</div>
              </div>`
            )
            .join('')
        : '<div class="empty">No comments published yet.</div>';

      const body = `
        <h1>Why your framework does not save you</h1>
        <p class="muted small">By the PixelPress team · 6 min read · ${published.length} comments · ${pending} awaiting review</p>
        <div class="card" style="margin:12px 0">
          <p style="margin:0">Escaping is a property of a template, not of a framework. The moment someone concatenates a string,
          or reaches for an HTML sink "just here", the guarantee is gone. Our own comment section is the proof.</p>
        </div>
        <h2>Leave a comment</h2>
        <form method="post" action="/lab/rw-blog-moderator" class="stack">
          <div><label for="a">Name</label><input id="a" type="text" name="author" placeholder="Your name" /></div>
          <div><label for="b">Comment</label><textarea id="b" name="body" placeholder="Great write-up…"></textarea></div>
          <button type="submit">Post comment (moderated)</button>
        </form>
        <h2>Comments (${published.length})</h2>
        <div class="list">${list}</div>`;
      return labPage({ id: 'rw-blog-moderator', app: 'PixelPress', title: 'Blog', cookie: USER_COOKIE, body });
    },
  },

  /* 31 — support ticket */
  'rw-support-ticket': {
    async handle({ env, form, method, segs }) {
      if (method === 'POST' && segs[0] !== 'admin') {
        await addEntry(env, {
          lab: 'rw-support-ticket',
          kind: 'ticket',
          data: { subject: form.subject || '(no subject)', body: form.body || '', from: form.from || 'customer' },
        });
        return redirect('/lab/rw-support-ticket?sent=1');
      }

      const rows = await listEntries(env, { lab: 'rw-support-ticket', kind: 'ticket', limit: 30 });

      if (segs[0] === 'admin') {
        const items = rows.length
          ? rows
              .map(
                (r) => `<div class="item">
                  <div class="meta">${esc(r.data.from)} · ${ago(r.createdAt)} · open</div>
                  <div><b>${esc(r.data.subject)}</b></div>
                  <!-- INTENTIONAL VULNERABILITY: ticket body rendered as HTML in the agent console -->
                  <div style="margin-top:4px">${r.data.body}</div>
                </div>`
              )
              .join('')
          : '<div class="empty">No tickets.</div>';
        const body = `
          <h1>Agent console</h1>
          <p class="muted small">Signed in as <code>agent@nimbus.example</code> · ${rows.length} ticket(s)</p>
          <div class="banner warn">This console can reset passwords, change plans and export invoices for any account.</div>
          <div class="list" style="margin-top:12px">${items}</div>`;
        return labPage({
          id: 'rw-support-ticket',
          app: 'Nimbus Support',
          title: 'Agent console',
          cookie: AGENT_COOKIE,
          who: 'agent@nimbus.example',
          body,
        });
      }

      const mine = rows.length
        ? rows.map((r) => `<div class="item"><div class="meta">${ago(r.createdAt)}</div>${esc(r.data.subject)}</div>`).join('')
        : '<div class="empty">You have no tickets.</div>';

      const body = `
        <h1>Open a support ticket</h1>
        <p class="muted small">Average first response: 2 hours.</p>
        <form method="post" action="/lab/rw-support-ticket" class="stack">
          <div><label for="f">From</label><input id="f" type="text" name="from" placeholder="your@email.com" /></div>
          <div><label for="s">Subject</label><input id="s" type="text" name="subject" placeholder="Cannot export invoices" /></div>
          <div><label for="b">Description</label><textarea id="b" name="body" placeholder="Tell us what happened…"></textarea></div>
          <button type="submit">Submit ticket</button>
        </form>
        <h2>Your tickets (${rows.length})</h2>
        <div class="list">${mine}</div>`;
      return labPage({ id: 'rw-support-ticket', app: 'Nimbus Support', title: 'Support', cookie: USER_COOKIE, body });
    },
  },

  /* 32 — password reset with a JS-context reflection */
  'rw-password-reset': {
    handle({ url }) {
      const email = url.searchParams.get('email') || 'dana@example.com';
      const filtered = email.replace(/[<>]/g, '');
      const token = 'rt_9f31c7e0b4';

      const body = `
        <h1>Reset your password</h1>
        <p class="muted small">Greenleaf account recovery.</p>
        <form method="get" action="/lab/rw-password-reset" class="row" style="margin:12px 0">
          <input type="text" name="email" value="${esc(email)}" style="flex:1" placeholder="you@example.com" />
          <button type="submit">Send reset link</button>
        </form>
        <div class="card">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Reset token issued for this link</div>
          <pre id="issued" style="margin-top:6px">${token}</pre>
          <p class="small muted" style="margin:8px 0 0">In a real flow this token would be in the URL and bound to the account. Here it is displayed so you can prove you reached it.</p>
        </div>
        <p class="small muted" id="greet" style="margin-top:14px"></p>
        <!-- INTENTIONAL VULNERABILITY: request data concatenated into a JavaScript string -->
        <script>
          var email = '${filtered}';
          document.getElementById('greet').textContent = 'Reset link sent to ' + email;
          var resetToken = '${token}';
        </script>`;
      return labPage({ id: 'rw-password-reset', app: 'Greenleaf Store', title: 'Reset password', cookie: USER_COOKIE, body });
    },
  },

  /* 33 — OAuth authorize popup */
  'rw-oauth-state': {
    handle({ url }) {
      const client = url.searchParams.get('client_id') || 'nimbus-workspace';
      const body = `
        <h1>Authorize application</h1>
        <p class="muted small"><b>${esc(client)}</b> is requesting access to your Nimbus Cloud account.</p>
        <div class="banner warn">Scopes requested: <code>profile</code>, <code>workspaces.read</code>, <code>workspaces.write</code></div>
        <div class="row" style="margin:14px 0">
          <button type="button" onclick="document.getElementById('decision').textContent='Approved — token issued below.'">Approve</button>
          <button type="button" class="ghost" onclick="document.getElementById('decision').textContent='Denied.'">Deny</button>
        </div>
        <div class="card">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Access token issued to this session</div>
          <pre id="issued" style="margin-top:6px">at_7f21c9d4ab3e</pre>
          <p class="small muted" id="decision" style="margin:8px 0 0">Awaiting your decision.</p>
        </div>
        <div id="state-slot"></div>
        <!-- INTENTIONAL VULNERABILITY: state reflected with document.write -->
        <script>
          (function () {
            var state = new URLSearchParams(location.search).get('state') || '';
            if (!state) return;
            document.write('<input type="hidden" name="state" value="' + state + '">');
            document.write('<div class="card" style="margin-top:14px"><div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Callback state</div><div>' + state + '</div></div>');
          })();
        </script>`;
      return labPage({ id: 'rw-oauth-state', app: 'Nimbus Cloud', title: 'Authorize', cookie: 'session=usr_5f2c91d7; theme=cloud', body });
    },
  },

  /* 34 — chat widget trusting every host */
  'rw-chat-widget': {
    handle({ segs }) {
      if (segs[0] === 'widget') {
        const wbody = `
          <div class="card">
            <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Embedded widget</div>
            <h2 id="brand" style="font-size:15px;margin:2px 0 8px">Acme Store</h2>
            <p class="small muted" style="margin:0">Hi! How can we help today?</p>
          </div>
          <!-- INTENTIONAL VULNERABILITY: no origin check, brand rendered with innerHTML -->
          <script>
            window.addEventListener('message', function (e) {
              var d = e.data || {};
              if (d.type !== 'config') return;
              document.getElementById('brand').innerHTML = d.brand || '';
            });
          </script>`;
        return labPage({ id: 'rw-chat-widget', app: 'Nimbus Chat widget', title: 'Widget', cookie: '', body: wbody });
      }

      const body = `
        <h1>Acme Store</h1>
        <p class="muted small">The Nimbus Chat widget is embedded below and configured by the host page with postMessage.</p>
        <div style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#fff;margin:12px 0">
          <iframe id="wf" src="/lab/rw-chat-widget/widget" sandbox="allow-scripts allow-forms" style="width:100%;height:150px;border:0" title="widget"></iframe>
        </div>
        <div class="card stack">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Host page · widget config composer</div>
          <label for="msg">Message sent to the widget</label>
          <textarea id="msg">{"type":"config","brand":"Acme Store"}</textarea>
          <div class="row"><button type="button" id="send">postMessage to widget</button></div>
          <p class="small muted" style="margin:0">The widget accepts any message from any frame and renders <code>brand</code> as HTML.</p>
        </div>
        <script>
          document.getElementById('send').addEventListener('click', function () {
            var f = document.getElementById('wf');
            var raw = document.getElementById('msg').value;
            var payload;
            try { payload = JSON.parse(raw); }
            catch (e) { alert('Invalid JSON: ' + e.message); return; }
            f.contentWindow.postMessage(payload, '*');
          });
        </script>`;
      return labPage({ id: 'rw-chat-widget', app: 'Acme Store', title: 'Storefront', cookie: USER_COOKIE, body });
    },
  },

  /* 35 — markdown comment renderer */
  'rw-markdown': {
    async handle({ env, form, method }) {
      if (method === 'POST') {
        await addEntry(env, { lab: 'rw-markdown', kind: 'comment', data: { author: form.author || 'reader', md: form.body || '' } });
        return redirect('/lab/rw-markdown?posted=1');
      }

      const rows = await listEntries(env, { lab: 'rw-markdown', kind: 'comment', limit: 30 });
      const list = rows.length
        ? rows
            .map(
              (r) => `<div class="item">
                <div class="meta">${esc(r.data.author)} · ${ago(r.createdAt)}</div>
                <!-- INTENTIONAL VULNERABILITY: markdown output inserted as HTML, raw HTML allowed -->
                <div class="md">${md(r.data.md)}</div>
              </div>`
            )
            .join('')
        : '<div class="empty">No comments yet.</div>';

      const body = `
        <h1>Comments</h1>
        <p class="muted small">Markdown supported: <code>**bold**</code>, <code>*italic*</code>, <code>\`code\`</code>, <code>[links](url)</code>.</p>
        <form method="post" action="/lab/rw-markdown" class="stack">
          <div><label for="a">Name</label><input id="a" type="text" name="author" placeholder="Your name" /></div>
          <div><label for="b">Comment (markdown)</label><textarea id="b" name="body" placeholder="**Great** article"></textarea></div>
          <button type="submit">Post</button>
        </form>
        <h2>Comments (${rows.length})</h2>
        <div class="list">${list}</div>`;
      return labPage({ id: 'rw-markdown', app: 'PixelPress', title: 'Comments', cookie: USER_COOKIE, body });
    },
  },

  /* 36 — SVG upload */
  'rw-svg-upload': {
    async handle({ env, url, form, method, segs }) {
      if (segs[0] === 'file') {
        const name = url.searchParams.get('name') || '';
        const rows = await listEntries(env, { lab: 'rw-svg-upload', kind: 'asset', limit: 50 });
        const hit = rows.find((r) => r.data.name === name);
        if (!hit) return htmlResponse('<!doctype html><h1>404</h1><p>No such file.</p>', { status: 404 });
        // INTENTIONAL VULNERABILITY: user-supplied SVG served from the app origin as a document
        return new Response(hit.data.svg, {
          headers: {
            'content-type': 'image/svg+xml',
            'cache-control': 'no-store',
            'x-robots-tag': 'noindex',
          },
        });
      }

      if (method === 'POST') {
        if (form.svg) {
          await addEntry(env, {
            lab: 'rw-svg-upload',
            kind: 'asset',
            data: { name: form.name || 'avatar.svg', svg: form.svg },
          });
        }
        return redirect('/lab/rw-svg-upload?uploaded=1');
      }

      const rows = await listEntries(env, { lab: 'rw-svg-upload', kind: 'asset', limit: 30 });
      const list = rows.length
        ? rows
            .map(
              (r) => `<div class="item">
                <div class="meta">${esc(r.data.svg.length)} bytes · image/svg+xml</div>
                <a href="/lab/rw-svg-upload/file?name=${encodeURIComponent(r.data.name)}">${esc(r.data.name)}</a>
              </div>`
            )
            .join('')
        : '<div class="empty">No uploads yet.</div>';

      const body = `
        <h1>Upload an avatar</h1>
        <p class="muted small">Accepted: png, jpg, gif, svg. Maximum 2 MB. This demo stores the SVG text rather than bytes.</p>
        <form method="post" action="/lab/rw-svg-upload" class="stack">
          <div><label for="n">File name</label><input id="n" type="text" name="name" value="avatar.svg" /></div>
          <div><label for="s">SVG content</label><textarea id="s" name="svg" style="min-height:120px" placeholder="&lt;svg xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt;…&lt;/svg&gt;"></textarea></div>
          <button type="submit">Upload</button>
        </form>
        <h2>Your files (${rows.length})</h2>
        <div class="list">${list}</div>
        <p class="small muted" style="margin-top:14px">Files are served from the application origin with their original content type.</p>`;
      return labPage({ id: 'rw-svg-upload', app: 'Nimbus Docs', title: 'Avatar upload', cookie: USER_COOKIE, body });
    },
  },
};
