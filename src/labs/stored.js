import { labPage, htmlResponse, redirect, esc } from '../shell.js';
import { addEntry, listEntries, setSetting, getSetting } from '../store.js';

const USER_COOKIE = 'session=usr_5f2c91d7; theme=leaf';
const ADMIN_COOKIE = 'session=adm_71be4f0c9a; role=admin';

function ago(ts) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}

export const LABS = {
  /* 7 — guestbook */
  'stored-guestbook': {
    async handle({ env, form, method }) {
      if (method === 'POST') {
        await addEntry(env, {
          lab: 'stored-guestbook',
          kind: 'entry',
          data: { name: form.name || 'anonymous', message: form.message || '' },
        });
        return redirect('/lab/stored-guestbook?posted=1');
      }

      const rows = await listEntries(env, { lab: 'stored-guestbook', kind: 'entry', limit: 40 });
      const list = rows.length
        ? rows
            .map(
              (r) => `<div class="item">
                <div class="meta">${esc(r.data.name)} · ${ago(r.createdAt)}</div>
                <!-- INTENTIONAL VULNERABILITY: stored message rendered as HTML -->
                <div class="msg">${r.data.message}</div>
              </div>`
            )
            .join('')
        : '<div class="empty">No entries yet. Be the first to sign the guestbook.</div>';

      const body = `
        <h1>PixelPress guestbook</h1>
        <p class="muted small">Leave a note for other readers. Entries appear immediately.</p>
        <form method="post" action="/lab/stored-guestbook" class="stack" style="margin-bottom:18px">
          <div><label for="n">Name</label><input id="n" type="text" name="name" placeholder="Your name" /></div>
          <div><label for="m">Message</label><textarea id="m" name="message" placeholder="Say something nice…"></textarea></div>
          <button type="submit">Sign the guestbook</button>
        </form>
        <h2>Recent entries (${rows.length})</h2>
        <div class="list">${list}</div>`;
      return labPage({ id: 'stored-guestbook', app: 'PixelPress', title: 'Guestbook', cookie: USER_COOKIE, body });
    },
  },

  /* 8 — profile bio seen by an admin */
  'stored-profile': {
    async handle({ env, form, method, segs }) {
      const KEY = 'stored-profile:bio';

      if (method === 'POST') {
        await setSetting(env, KEY, form.bio || '');
        return redirect('/lab/stored-profile?saved=1');
      }

      const bio = (await getSetting(env, KEY, '')) || '';

      if (segs[0] === 'admin') {
        const body = `
          <h1>Agent dashboard</h1>
          <p class="muted small">Signed in as <code>agent@nimbus.io</code> · opened from the support queue.</p>
          <div class="banner warn">This panel renders customer-supplied profile fields. Support agents open it for every ticket.</div>
          <div class="card" style="margin-top:12px">
            <div class="meta" style="font:600 10.5px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Customer profile</div>
            <p style="margin:4px 0"><b>Name:</b> Dana Whitfield</p>
            <p style="margin:4px 0"><b>Company:</b> Northwind Labs</p>
            <p style="margin:4px 0"><b>Plan:</b> Enterprise · 214 seats</p>
            <p style="margin:4px 0"><b>Bio:</b></p>
            <!-- INTENTIONAL VULNERABILITY: stored bio rendered as HTML in a privileged view -->
            <div class="bio">${bio || '<span class="muted">(empty)</span>'}</div>
          </div>
          <p class="small muted" style="margin-top:14px">Actions available to this agent: reset password, change plan, export invoices, delete workspace.</p>`;
        return labPage({
          id: 'stored-profile',
          app: 'Nimbus Support',
          title: 'Agent dashboard',
          cookie: ADMIN_COOKIE,
          who: 'admin@nimbus.io',
          body,
        });
      }

      const body = `
        <h1>Your support profile</h1>
        <p class="muted small">Agents see these details when you open a ticket.</p>
        <form method="post" action="/lab/stored-profile" class="stack">
          <div><label for="b">Bio</label><textarea id="b" name="bio" placeholder="Tell support about your setup…">${esc(bio)}</textarea></div>
          <button type="submit">Save profile</button>
        </form>
        <div class="card" style="margin-top:14px">
          <p class="small muted" style="margin:0">Your profile preview (escaped here — the agent dashboard is what matters):</p>
          <p style="margin:6px 0 0">${esc(bio)}</p>
        </div>`;
      return labPage({ id: 'stored-profile', app: 'Nimbus Support', title: 'Support profile', cookie: USER_COOKIE, body });
    },
  },

  /* 9 — second order: account name, invoice print view */
  'stored-second-order': {
    async handle({ env, form, method, segs }) {
      const KEY = 'stored-second-order:name';

      if (method === 'POST') {
        await setSetting(env, KEY, form.name || '');
        return redirect('/lab/stored-second-order?saved=1');
      }

      const name = (await getSetting(env, KEY, 'Dana Whitfield')) || 'Dana Whitfield';

      if (segs[0] === 'print') {
        const body = `
          <h1>Invoice #GRL-20418</h1>
          <p class="muted small">Printable view · generated from your stored account details.</p>
          <table style="margin-top:12px">
            <tr><th>Bill to</th>
              <!-- INTENTIONAL VULNERABILITY: same stored value, a second sink with no encoding -->
              <td>${name}</td>
            </tr>
            <tr><th>Issued</th><td>${new Date().toISOString().slice(0, 10)}</td></tr>
            <tr><th>Item</th><td>Greenleaf subscription (annual)</td></tr>
            <tr><th>Total</th><td>$1,188.00</td></tr>
          </table>
          <p class="small muted" style="margin-top:16px"><a href="/lab/stored-second-order">← back to account</a></p>`;
        return labPage({ id: 'stored-second-order', app: 'Greenleaf Store', title: 'Invoice', cookie: USER_COOKIE, body });
      }

      const body = `
        <h1>Account settings</h1>
        <p class="muted small">This page escapes everything. Other pages that use the same field may not.</p>
        <form method="post" action="/lab/stored-second-order" class="stack">
          <div><label for="nm">Account name</label><input id="nm" type="text" name="name" value="${esc(name)}" /></div>
          <button type="submit">Save</button>
        </form>
        <div class="card" style="margin-top:14px">
          <p class="small muted" style="margin:0 0 4px">Name as rendered here (encoded):</p>
          <p style="margin:0"><b>${esc(name)}</b></p>
        </div>
        <p style="margin-top:16px"><a href="/lab/stored-second-order/print">Print invoice →</a></p>`;
      return labPage({ id: 'stored-second-order', app: 'Greenleaf Store', title: 'Account', cookie: USER_COOKIE, body });
    },
  },

  /* 10 — filename in a document list */
  'stored-filename': {
    async handle({ env, form, method }) {
      if (method === 'POST') {
        const name = form.filename || '';
        if (name) {
          await addEntry(env, {
            lab: 'stored-filename',
            kind: 'file',
            data: { name, size: `${Math.floor(Math.random() * 900 + 90)} KB`, owner: 'you' },
          });
        }
        return redirect('/lab/stored-filename?added=1');
      }

      const files = await listEntries(env, { lab: 'stored-filename', kind: 'file', limit: 30 });
      const rows = files.length
        ? files
            .map(
              (f) => `<div class="item doc-row" data-name="${esc(f.data.name)}">
                <div class="meta">${esc(f.data.owner)} · ${esc(f.data.size)}</div>
                <!-- INTENTIONAL VULNERABILITY: filename concatenated into HTML -->
                <div class="fname">📄 ${f.data.name}</div>
              </div>`
            )
            .join('')
        : '<div class="empty">No documents yet.</div>';

      const body = `
        <h1>Nimbus Docs</h1>
        <p class="muted small">Team workspace · 4 members. This demo records the filename only.</p>
        <form method="post" action="/lab/stored-filename" class="stack" style="margin-bottom:16px">
          <div><label for="f">Upload a document (filename)</label><input id="f" type="text" name="filename" placeholder="quarterly-report.pdf" /></div>
          <button type="submit">Upload</button>
        </form>
        <h2>Documents (${files.length})</h2>
        <div class="list" id="files">${rows}</div>`;
      return labPage({ id: 'stored-filename', app: 'Nimbus Docs', title: 'Documents', cookie: USER_COOKIE, body });
    },
  },

  /* 11 — audit log read by support */
  'stored-log': {
    async handle({ env, form, method, segs }) {
      if (method === 'POST') {
        await addEntry(env, {
          lab: 'stored-log',
          kind: 'report',
          data: { subject: form.subject || '', message: form.message || '', status: 'open' },
        });
        return redirect('/lab/stored-log?sent=1');
      }

      const rows = await listEntries(env, { lab: 'stored-log', kind: 'report', limit: 40 });

      if (segs[0] === 'admin') {
        const table = rows.length
          ? rows
              .map(
                (r, i) => `<div class="item">
                  <div class="meta">#${1000 + i} · ${ago(r.createdAt)} · ${esc(r.data.status)}</div>
                  <div><b>${esc(r.data.subject)}</b></div>
                  <!-- INTENTIONAL VULNERABILITY: log body rendered as HTML for "formatting" -->
                  <div style="margin-top:4px">${r.data.message}</div>
                </div>`
              )
              .join('')
          : '<div class="empty">No reports in the audit log.</div>';

        const body = `
          <h1>Support audit log</h1>
          <p class="muted small">Internal only · renders report bodies with HTML for formatting.</p>
          <div class="list">${table}</div>`;
        return labPage({
          id: 'stored-log',
          app: 'Nimbus Support',
          title: 'Audit log',
          cookie: ADMIN_COOKIE,
          who: 'support@nimbus.io',
          body,
        });
      }

      const open = rows.filter((r) => r.data.status === 'open').length;
      const body = `
        <h1>Report a problem</h1>
        <p class="muted small">Your report goes to the support audit log. ${open} open report(s).</p>
        <form method="post" action="/lab/stored-log" class="stack">
          <div><label for="s">Subject</label><input id="s" type="text" name="subject" placeholder="Short summary" /></div>
          <div><label for="m">Message</label><textarea id="m" name="message" placeholder="What went wrong?"></textarea></div>
          <button type="submit">Send report</button>
        </form>`;
      return labPage({ id: 'stored-log', app: 'Nimbus Support', title: 'Report a problem', cookie: USER_COOKIE, body });
    },
  },
};
