import { labPage, htmlResponse, redirect, esc } from '../shell.js';
import { addEntry, listEntries } from '../store.js';

const USER_COOKIE = 'session=usr_5f2c91d7; theme=leaf';
const AGENT_COOKIE = 'session=adm_71be4f0c9a; role=agent';

function ago(ts) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  return s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
}

export const LABS = {
  /* 26 */
  'blind-contact': {
    async handle({ env, form, method, segs }) {
      if (method === 'POST') {
        await addEntry(env, {
          lab: 'blind-contact',
          kind: 'message',
          data: { name: form.name || 'anonymous', email: form.email || '', message: form.message || '' },
        });
        return redirect('/lab/blind-contact?sent=1');
      }

      const rows = await listEntries(env, { lab: 'blind-contact', kind: 'message', limit: 30 });

      if (segs[0] === 'admin') {
        const items = rows.length
          ? rows
              .map(
                (r) => `<div class="item">
                  <div class="meta">${ago(r.createdAt)} · ${esc(r.data.name)} · ${esc(r.data.email)}</div>
                  <!-- INTENTIONAL VULNERABILITY: staff queue renders the message as HTML -->
                  <div>${r.data.message}</div>
                </div>`
              )
              .join('')
          : '<div class="empty">Nothing in the queue.</div>';
        const body = `
          <h1>Staff queue</h1>
          <p class="muted small">Internal · messages from the contact form. ${rows.length} waiting.</p>
          <div class="list">${items}</div>
          <p class="small muted" style="margin-top:14px">You cannot see this page as a visitor. Payloads here report back over HTTP instead.</p>`;
        return labPage({
          id: 'blind-contact',
          app: 'Greenleaf Store',
          title: 'Staff queue',
          cookie: AGENT_COOKIE,
          who: 'staff@greenleaf.example',
          body,
        });
      }

      const body = `
        <h1>Contact Greenleaf</h1>
        <p class="muted small">We reply within one business day.</p>
        <form method="post" action="/lab/blind-contact" class="stack">
          <div><label for="n">Name</label><input id="n" type="text" name="name" placeholder="Your name" /></div>
          <div><label for="e">Email</label><input id="e" type="email" name="email" placeholder="you@example.com" /></div>
          <div><label for="m">Message</label><textarea id="m" name="message" placeholder="How can we help?"></textarea></div>
          <button type="submit">Send message</button>
        </form>
        ${form.sent ? '' : ''}
        <div class="banner ok" style="margin-top:14px">Thanks — your message is in the queue. You will only ever see this confirmation page.</div>`;
      return labPage({ id: 'blind-contact', app: 'Greenleaf Store', title: 'Contact us', cookie: USER_COOKIE, body });
    },
  },

  /* 27 */
  'blind-header': {
    async handle({ env, form, method, segs }) {
      if (method === 'POST') {
        await addEntry(env, {
          lab: 'blind-header',
          kind: 'visit',
          data: {
            ua: form.ua || '',
            path: form.path || '/pricing',
            ip: '203.0.113.' + (Math.floor(Math.random() * 200) + 10),
          },
        });
        return redirect('/lab/blind-header?logged=1');
      }

      const rows = await listEntries(env, { lab: 'blind-header', kind: 'visit', limit: 40 });

      if (segs[0] === 'admin') {
        const tbody = rows.length
          ? rows
              .map(
                (r) => `<tr>
                  <td class="mono">${esc(r.data.ip)}</td>
                  <td>${esc(r.data.path)}</td>
                  <!-- INTENTIONAL VULNERABILITY: captured header rendered as HTML -->
                  <td class="mono">${r.data.ua}</td>
                  <td>${ago(r.createdAt)}</td>
                </tr>`
              )
              .join('')
          : '<tr><td colspan="4" class="empty">No traffic captured.</td></tr>';
        const body = `
          <h1>Recent visitors</h1>
          <p class="muted small">Internal analytics widget · last ${rows.length} requests.</p>
          <table>
            <thead><tr><th>IP</th><th>Path</th><th>User-Agent</th><th>When</th></tr></thead>
            <tbody>${tbody}</tbody>
          </table>`;
        return labPage({
          id: 'blind-header',
          app: 'Nimbus Support',
          title: 'Recent visitors',
          cookie: AGENT_COOKIE,
          who: 'analytics@nimbus.example',
          body,
          wide: true,
        });
      }

      const body = `
        <h1>Request inspector</h1>
        <p class="muted small">This lab runs in a browser, so it cannot receive real headers. Submit a header value exactly as a proxy would capture it — that is the same string support staff will see.</p>
        <form method="post" action="/lab/blind-header" class="stack">
          <div><label for="ua">User-Agent value</label><input id="ua" type="text" name="ua" placeholder="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)…" /></div>
          <div><label for="p">Requested path</label><input id="p" type="text" name="path" value="/pricing" /></div>
          <button type="submit">Log this request</button>
        </form>
        <div class="banner info" style="margin-top:14px">Logged values are displayed in an internal "recent visitors" widget. You cannot open that widget as a visitor — see the Victim view panel.</div>`;
      return labPage({ id: 'blind-header', app: 'Nimbus Support', title: 'Request inspector', cookie: USER_COOKIE, body });
    },
  },

  /* 28 */
  'blind-exfil': {
    async handle({ env, form, method, segs }) {
      if (method === 'POST') {
        await addEntry(env, {
          lab: 'blind-exfil',
          kind: 'note',
          data: {
            ticket: form.ticket || 'T-4812',
            author: form.author || 'customer',
            note: form.note || '',
          },
        });
        return redirect('/lab/blind-exfil?sent=1');
      }

      const rows = await listEntries(env, { lab: 'blind-exfil', kind: 'note', limit: 30 });

      if (segs[0] === 'admin') {
        const items = rows.length
          ? rows
              .map(
                (r) => `<div class="item">
                  <div class="meta">${esc(r.data.ticket)} · from ${esc(r.data.author)} · ${ago(r.createdAt)}</div>
                  <!-- INTENTIONAL VULNERABILITY: customer note rendered as HTML inside an agent session -->
                  <div>${r.data.note}</div>
                </div>`
              )
              .join('')
          : '<div class="empty">No notes on this ticket.</div>';
        const body = `
          <h1>Ticket T-4812 — agent console</h1>
          <p class="muted small">Signed in as agent · customer notes below. Billing actions and workspace deletion are available from this view.</p>
          <div class="banner warn">Session in this frame: <code>session=adm_71be4f0c9a</code> · role=agent. A payload that runs here can read it.</div>
          <div class="list" style="margin-top:12px">${items}</div>`;
        return labPage({
          id: 'blind-exfil',
          app: 'Nimbus Support',
          title: 'Agent console',
          cookie: AGENT_COOKIE,
          who: 'agent@nimbus.example',
          body,
        });
      }

      const body = `
        <h1>Add a note to your ticket</h1>
        <p class="muted small">Notes are visible to the agent handling your ticket. You will never see the agent console.</p>
        <form method="post" action="/lab/blind-exfil" class="stack">
          <div><label for="t">Ticket</label><input id="t" type="text" name="ticket" value="T-4812" /></div>
          <div><label for="n">Note</label><textarea id="n" name="note" placeholder="Additional context for the agent…"></textarea></div>
          <button type="submit">Save note</button>
        </form>
        <div class="banner ok" style="margin-top:14px">Got it. Your agent will see this note on their next refresh.</div>`;
      return labPage({ id: 'blind-exfil', app: 'Nimbus Support', title: 'Ticket note', cookie: USER_COOKIE, body });
    },
  },
};
