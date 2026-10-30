import { LABS, CATEGORIES, DIFFICULTY } from './data/index.js';
import { GUIDE, CHEATSHEET } from './data/reference.js';

const STORE_KEY = 'xss-lab-forge:progress:v1';
const done = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'));
const saveDone = () => localStorage.setItem(STORE_KEY, JSON.stringify([...done]));

const app = document.getElementById('app');
const labById = new Map(LABS.map((l) => [l.id, l]));
const catById = new Map(CATEGORIES.map((c) => [c.id, c]));

let filterCat = 'all';
let filterText = '';
let pollTimer = null;

function clearPoll() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

/* ---------------- helpers ---------------- */

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Escapes first, then re-enables `code` and **bold** markup. Safe for authored prose. */
function fmt(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/** Code blocks always use textContent: payloads must never be parsed. */
function codeBlock(code) {
  const wrap = document.createElement('div');
  wrap.className = 'code';
  const btn = document.createElement('button');
  btn.className = 'copy';
  btn.type = 'button';
  btn.textContent = 'copy';
  btn.dataset.code = code;
  const pre = document.createElement('pre');
  const c = document.createElement('code');
  c.textContent = code;
  pre.appendChild(c);
  wrap.append(btn, pre);
  return wrap;
}

function appendCode(host, code) {
  if (host) host.appendChild(codeBlock(code));
}

const diffOf = (d) => DIFFICULTY[d] || DIFFICULTY.apprentice;

function setSolved(id, note) {
  if (!labById.has(id)) return;
  if (!done.has(id)) {
    done.add(id);
    saveDone();
    renderProgress();
  }
  const t = document.getElementById('solve-state');
  if (t) {
    t.className = 'solve-hint ok';
    t.textContent = note || 'Payload executed ✓';
  }
  const card = document.querySelector('.card.solved');
  if (card) card.classList.add('solved');
}

function renderProgress() {
  const el = document.getElementById('prog-label');
  if (el) el.textContent = `${done.size}/${LABS.length}`;
  const fill = document.getElementById('prog-fill');
  if (fill) fill.style.width = `${Math.round((done.size / LABS.length) * 100)}%`;
  const cnt = document.getElementById('console-count');
  if (cnt) cnt.textContent = String(done.size);
}

function chrome(active) {
  const nav = [
    ['#/', 'labs', 'Labs'],
    ['#/console', 'console', 'Attacker console'],
    ['#/guide', 'guide', 'Defense guide'],
    ['#/cheatsheet', 'cheatsheet', 'Payloads'],
  ];
  app.innerHTML = `
    <header class="top"><div class="top-in">
      <a class="brand" href="#/"><span class="glyph">▚</span> XSS Lab Forge <small>range</small></a>
      <nav class="nav">
        ${nav.map(([href, key, label]) => `<a href="${href}" class="${active === key ? 'on' : ''}">${label}${key === 'console' ? '<span class="count" id="console-count">0</span>' : ''}</a>`).join('')}
      </nav>
      <span class="top-spacer"></span>
      <div class="progress"><span class="bar"><span class="fill" id="prog-fill" style="width:0%"></span></span><span id="prog-label">0/${LABS.length}</span></div>
    </div></header>
    <main id="view"></main>
    <footer>
      ${LABS.length} labs · every payload runs inside a sandboxed iframe on this site only · no third-party targets, no real credentials.
      <br /><span class="muted">Learn the bug, then fix the bug. Testing systems you do not own is a crime.</span>
    </footer>`;
  renderProgress();
}

/* ---------------- home ---------------- */

function renderHome() {
  clearPoll();
  chrome('labs');
  const view = document.getElementById('view');
  const total = LABS.length;
  const stats = [
    ['labs', total],
    ['types', CATEGORIES.length],
    ['solved', done.size],
  ];

  view.innerHTML = `
    <section class="hero">
      <span class="eyebrow">● interactive range · sandboxed</span>
      <h1>Every kind of <em>XSS</em>, one lab at a time.</h1>
      <p class="lede">A self-contained training range for cross-site scripting. Reflected, stored, DOM, blind, self-XSS, sanitiser and CSP bypasses, plus realistic attack chains — each with a guiding walkthrough, working payloads, the root cause and the fix.</p>
      <div class="stats">
        ${stats.map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join('')}
      </div>
      <div class="notice">
        <span>◈</span>
        <div><b>How this range is contained.</b> Every target page runs inside an <code>iframe</code> with <code>sandbox="allow-scripts"</code> and no <code>allow-same-origin</code>: payloads execute in an opaque origin and cannot read this portal, its storage or any real cookie. Session values are simulated, and every exfiltration payload reports to this site's own attacker console. Nothing here is designed to attack third-party systems.</div>
      </div>
      <div class="notice" style="border-left-color:var(--mint)">
        <span>↳</span>
        <div><b>New to the topic?</b> Read the <a href="#/guide" style="color:var(--mint);text-decoration:underline">defense guide</a> first — it explains sources, sinks, contexts and the fixes — then start with the apprentice labs.</div>
      </div>
    </section>

    <div class="controls">
      <div class="chips" id="chips">
        <button class="chip ${filterCat === 'all' ? 'on' : ''}" data-cat="all">All ${total}</button>
        ${CATEGORIES.map((c) => {
          const n = LABS.filter((l) => l.category === c.id).length;
          return `<button class="chip ${filterCat === c.id ? 'on' : ''}" data-cat="${c.id}">${esc(c.label)} <span style="opacity:.6">${n}</span></button>`;
        }).join('')}
      </div>
      <div class="search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input id="q" type="search" placeholder="Search labs, sinks, payloads…" value="${esc(filterText)}" />
      </div>
    </div>

    <div id="groups"></div>`;

  document.getElementById('chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    filterCat = b.dataset.cat;
    renderHome();
  });
  const q = document.getElementById('q');
  q.addEventListener('input', () => {
    filterText = q.value;
    renderGroups();
  });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') q.blur();
  });
  renderGroups();
}

function matchLab(l) {
  if (filterCat !== 'all' && l.category !== filterCat) return false;
  if (!filterText.trim()) return true;
  const hay = [l.title, l.summary, l.scenario, l.app, ...(l.tags || []), l.category].join(' ').toLowerCase();
  return filterText
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

function cardHtml(l) {
  const d = diffOf(l.difficulty);
  const c = catById.get(l.category);
  return `<a class="card ${done.has(l.id) ? 'solved' : ''}" href="#/lab/${l.id}">
    ${done.has(l.id) ? '<span class="done">solved</span>' : ''}
    <div class="row"><span class="badge b-${l.category}">${esc(c ? c.label : l.category)}</span><span class="diff d${d.n}"><i></i>${d.label}</span></div>
    <h3>${esc(l.title)}</h3>
    <p>${esc(l.summary)}</p>
    <div class="tags">${(l.tags || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <span class="go">Open lab →</span>
  </a>`;
}

function renderGroups() {
  const host = document.getElementById('groups');
  if (!host) return;
  const shown = LABS.filter(matchLab);
  if (!shown.length) {
    host.innerHTML = `<div class="empty-state">No labs match “${esc(filterText)}”. Try “dom”, “attribute”, “blind”, “csp” or “token”.</div>`;
    return;
  }
  if (filterCat !== 'all') {
    host.innerHTML = `<div class="group-title"><h2>${esc(catById.get(filterCat).label)}</h2><span>${shown.length} labs</span></div>
      <p class="muted" style="margin:-6px 0 14px;font-size:13.5px">${esc(catById.get(filterCat).blurb)}</p>
      <div class="grid">${shown.map(cardHtml).join('')}</div>`;
    return;
  }
  host.innerHTML = CATEGORIES.map((c) => {
    const items = shown.filter((l) => l.category === c.id);
    if (!items.length) return '';
    return `<div class="group-title"><h2>${esc(c.label)}</h2><span>${items.length} labs</span></div>
      <p class="muted" style="margin:-6px 0 14px;font-size:13.5px">${esc(c.blurb)}</p>
      <div class="grid">${items.map(cardHtml).join('')}</div>`;
  }).join('');
}

/* ---------------- lab ---------------- */

function renderLab(id) {
  clearPoll();
  const lab = labById.get(id);
  if (!lab) {
    location.hash = '#/';
    return;
  }
  chrome('labs');
  const d = diffOf(lab.difficulty);
  const c = catById.get(lab.category);
  const entry = lab.entry || `/lab/${lab.id}`;
  const view = document.getElementById('view');

  view.innerHTML = `
    <div class="lab-head">
      <a href="#/">labs</a> / <a href="#/cat-${lab.category}">${esc(c ? c.label : lab.category)}</a> / <span>${esc(lab.app)}</span>
    </div>
    <div class="row" style="gap:7px;margin-top:12px">
      <span class="badge b-${lab.category}">${esc(c ? c.label : lab.category)}</span>
      <span class="diff d${d.n}"><i></i>${d.label}</span>
      ${done.has(lab.id) ? '<span class="pill" style="color:var(--mint);border-color:rgba(110,231,168,.4)">solved</span>' : ''}
    </div>
    <h1 class="lab-title">${esc(lab.title)}</h1>
    <p class="lab-sub">${esc(lab.summary)}</p>

    <div class="lab-layout">
      <div class="frame-col">
        <div class="chrome">
          <span class="dots"><i></i><i></i><i></i></span>
          <span class="url">${esc(lab.app)} · ${esc(entry)}</span>
          <button id="reload" type="button">reload</button>
        </div>
        <div class="frame-wrap">
          <iframe id="lab-frame" sandbox="allow-scripts allow-forms allow-modals" src="${esc(entry)}" title="${esc(lab.title)}"></iframe>
        </div>
        <div class="frame-foot">
          <button class="mini" id="reload2" type="button">⟳ Reload target</button>
          ${lab.victim ? `<button class="mini" id="victim-toggle" type="button">👁 ${esc(lab.victim.label)}</button>` : ''}
          <button class="mini" id="reset-lab" type="button">Clear lab data</button>
          <a class="mini" href="${esc(entry)}" target="_blank" rel="noopener">Open raw ↗</a>
          <span class="solve-hint" id="solve-state">${done.has(lab.id) ? 'Payload executed ✓' : 'not solved yet'}</span>
        </div>
        ${lab.victim ? `<div class="victim-pane" id="victim-pane" hidden>
          <div class="vh">◈ Victim view · ${esc(lab.victim.label)}</div>
          <iframe id="victim-frame" sandbox="allow-scripts allow-forms allow-modals" title="victim view"></iframe>
        </div>` : ''}
        <div class="panel" style="margin-top:2px">
          <h3>Objective</h3>
          <p>${fmt(lab.goal)}</p>
        </div>
        <div class="panel">
          <h3>Attacker console <span class="n">live</span></h3>
          <div id="mini-console" class="small muted">No callbacks received for this lab yet. Exfiltration payloads in this range post to <code>/api/attack/log</code>, which is shown here and on the console page.</div>
        </div>
      </div>

      <div class="info-col">
        <div class="panel">
          <h3>Scenario</h3>
          <p>${fmt(lab.scenario)}</p>
        </div>

        <div class="panel">
          <h3>Hints <span class="n">${lab.hints.length} · expand one at a time</span></h3>
          ${lab.hints.map((h, i) => `<details class="hint"><summary>Hint ${i + 1}</summary><p>${fmt(h)}</p></details>`).join('')}
        </div>

        <div class="panel">
          <h3>Payloads</h3>
          <div id="payload-list"></div>
        </div>

        <div class="panel">
          <h3>Walkthrough</h3>
          <ol>${lab.walkthrough.map((s) => `<li><b>${fmt(s.t)}</b><br />${fmt(s.d)}</li>`).join('')}</ol>
        </div>

        <div class="panel">
          <h3>Why it works</h3>
          <p>${fmt(lab.why)}</p>
        </div>

        <div class="panel">
          <h3>The fix</h3>
          <p>${fmt(lab.fix.text)}</p>
          <div id="fix-code"></div>
        </div>

        <div class="panel">
          <h3>Next</h3>
          <p class="small muted" style="margin-bottom:10px">Finish this one, then keep the same skill moving.</p>
          <div id="next-labs" class="tags"></div>
        </div>
      </div>
    </div>`;

  // payloads
  const list = document.getElementById('payload-list');
  lab.payloads.forEach((p) => {
    const label = document.createElement('div');
    label.className = 'small muted';
    label.style.marginTop = '10px';
    label.textContent = p.label;
    list.append(label);
    appendCode(list, p.code);
  });
  appendCode(document.getElementById('fix-code'), lab.fix.code);

  // next labs
  const next = LABS.filter((l) => l.id !== lab.id && l.category === lab.category).slice(0, 4);
  document.getElementById('next-labs').innerHTML = (next.length ? next : LABS.filter((l) => l.id !== lab.id).slice(0, 4))
    .map((l) => `<a class="tag" href="#/lab/${l.id}" style="color:var(--mint)">${esc(l.title.length > 34 ? l.title.slice(0, 33) + '…' : l.title)}</a>`)
    .join('');

  // frame controls
  const frame = document.getElementById('lab-frame');
  const reload = () => {
    const u = new URL(entry, location.origin);
    u.searchParams.set('_r', String(Date.now()));
    frame.src = u.pathname + u.search + u.hash;
  };
  document.getElementById('reload').onclick = reload;
  document.getElementById('reload2').onclick = reload;

  document.getElementById('reset-lab').onclick = async () => {
    await fetch(`/api/reset?lab=${encodeURIComponent(lab.id)}`, { method: 'POST' });
    reload();
    document.getElementById('mini-console').innerHTML = '<span class="muted small">Lab data cleared.</span>';
  };

  if (lab.victim) {
    const pane = document.getElementById('victim-pane');
    const vframe = document.getElementById('victim-frame');
    const btn = document.getElementById('victim-toggle');
    btn.onclick = () => {
      const show = pane.hidden;
      pane.hidden = !show;
      btn.classList.toggle('on', show);
      if (show) {
        const u = new URL(lab.victim.path, location.origin);
        u.searchParams.set('_r', String(Date.now()));
        vframe.src = u.pathname + u.search;
      }
    };
    frame.addEventListener('load', () => {
      if (!pane.hidden) {
        const u = new URL(lab.victim.path, location.origin);
        u.searchParams.set('_r', String(Date.now()));
        vframe.src = u.pathname + u.search;
      }
    });
  }

  pollAttack(lab.id);
}

function pollAttack(labId) {
  const host = document.getElementById('mini-console');
  const tick = async () => {
    try {
      const r = await fetch(`/api/attack?lab=${encodeURIComponent(labId)}&limit=5`, { cache: 'no-store' });
      const data = await r.json();
      if (!host || !document.body.contains(host)) return;
      if (!data.entries || !data.entries.length) return;
      setSolved(labId, `${data.entries.length} callback${data.entries.length > 1 ? 's' : ''} captured ✓`);
      host.innerHTML = `<div class="small" style="color:var(--mint);margin-bottom:6px">${data.entries.length} callback(s) received</div>`;
      const table = document.createElement('table');
      table.className = 'data';
      table.innerHTML = '<thead><tr><th>src</th><th>data</th><th>when</th></tr></thead>';
      const tb = document.createElement('tbody');
      data.entries.forEach((e) => {
        const tr = document.createElement('tr');
        const s = document.createElement('td');
        s.textContent = e.src || '—';
        s.className = 't';
        const dd = document.createElement('td');
        dd.textContent = e.data == null ? '' : String(e.data);
        dd.className = 'mono';
        const t = document.createElement('td');
        t.className = 't';
        t.textContent = new Date(e.ts).toLocaleTimeString();
        tr.append(s, dd, t);
        tb.appendChild(tr);
      });
      table.appendChild(tb);
      host.appendChild(table);
    } catch {
      /* ignore polling errors */
    }
  };
  tick();
  pollTimer = setInterval(tick, 4000);
}

/* ---------------- console ---------------- */

async function renderConsole() {
  clearPoll();
  chrome('console');
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="console-head">
      <h1>Attacker console</h1>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="mini" id="refresh-console" type="button">⟳ Refresh</button>
        <button class="mini" id="clear-console" type="button">Clear all</button>
      </div>
    </div>
    <p class="muted" style="max-width:78ch;margin-top:0">Every exfiltration payload in the range reports here instead of to a third-party server. A callback means your payload executed in a sandboxed lab frame and was able to read something — a simulated session cookie, a page URL, a CSRF token. That is the evidence you would put in a report.</p>
    <div class="legend">
      <span><b>lab</b> which lab produced the hit</span>
      <span><b>src</b> the label your payload set</span>
      <span><b>data</b> what it exfiltrated</span>
    </div>
    <div id="console-body"><div class="empty-row">loading…</div></div>`;

  const body = document.getElementById('console-body');
  const load = async () => {
    const r = await fetch('/api/attack?limit=100&all=1', { cache: 'no-store' });
    const data = await r.json();
    if (!data.entries || !data.entries.length) {
      body.innerHTML = '<div class="empty-row">No callbacks yet. Run a blind or stored lab and send a payload to <code>/api/attack/log</code>.</div>';
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'tablewrap';
    const table = document.createElement('table');
    table.className = 'data';
    table.innerHTML = '<thead><tr><th>lab</th><th>src</th><th>data</th><th>when</th></tr></thead>';
    const tb = document.createElement('tbody');
    data.entries.forEach((e) => {
      const tr = document.createElement('tr');
      const labTd = document.createElement('td');
      labTd.className = 't';
      labTd.textContent = e.lab || '—';
      const srcTd = document.createElement('td');
      srcTd.className = 't';
      srcTd.textContent = e.src || '—';
      const dTd = document.createElement('td');
      dTd.className = 'mono';
      dTd.textContent = e.data == null ? '' : String(e.data);
      const tTd = document.createElement('td');
      tTd.className = 't';
      tTd.textContent = new Date(e.ts).toLocaleString();
      tr.append(labTd, srcTd, dTd, tTd);
      tb.appendChild(tr);
    });
    table.appendChild(tb);
    wrap.appendChild(table);
    body.replaceChildren(wrap);
  };
  document.getElementById('refresh-console').onclick = load;
  document.getElementById('clear-console').onclick = async () => {
    await fetch('/api/attack/clear', { method: 'POST', body: 'all' });
    load();
  };
  load();
}

/* ---------------- guide + cheatsheet ---------------- */

function renderGuide() {
  clearPoll();
  chrome('guide');
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="console-head"><h1>Defense guide</h1></div>
    <p class="muted" style="max-width:78ch;margin-top:0">The mental model behind every lab in this range: sources, sinks, contexts, and the order in which you apply defences.</p>
    <div class="cat-grid" style="margin-top:20px">
      ${CATEGORIES.map((c) => `<div class="cat-card"><span class="n">${LABS.filter((l) => l.category === c.id).length} labs</span><h3>${esc(c.label)}</h3><p>${esc(c.blurb)}</p></div>`).join('')}
    </div>
    <div class="prose">
      ${GUIDE.map(
        (s) => `<h2 id="${esc(s.t.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${esc(s.t)}</h2>
        ${(s.p || []).map((p) => `<p>${fmt(p)}</p>`).join('')}
        ${s.ul ? `<ul>${s.ul.map((li) => `<li>${fmt(li)}</li>`).join('')}</ul>` : ''}`
      ).join('')}
      <h2>Quick reference</h2>
      <p>The <a href="#/cheatsheet" style="color:var(--mint)">payload reference</a> lists the exact syntax for each context, and each entry maps back to a lab in this range.</p>
    </div>`;
}

function renderCheatsheet() {
  clearPoll();
  chrome('cheatsheet');
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="console-head"><h1>Payload reference</h1></div>
    <p class="muted" style="max-width:78ch;margin-top:0">Grouped by parser, because the parser decides the payload. Use these only on systems you are authorised to test — this range exists so you can practise legally.</p>
    <div id="sheet" style="max-width:920px"></div>`;
  const host = document.getElementById('sheet');
  CHEATSHEET.forEach((sec) => {
    const panel = document.createElement('div');
    panel.className = 'panel';
    const h = document.createElement('h3');
    h.textContent = sec.t;
    const p = document.createElement('p');
    p.innerHTML = fmt(sec.d);
    p.style.marginBottom = '4px';
    panel.append(h, p);
    sec.items.forEach((it) => {
      const l = document.createElement('div');
      l.className = 'small muted';
      l.style.marginTop = '10px';
      l.textContent = it.label;
      panel.append(l);
      appendCode(panel, it.code);
    });
    host.appendChild(panel);
  });
}

/* ---------------- routing ---------------- */

function route() {
  const hash = location.hash || '#/';
  const m = hash.match(/^#\/lab\/([\w-]+)/);
  if (m) return renderLab(m[1]);
  if (hash.startsWith('#/console')) return renderConsole();
  if (hash.startsWith('#/guide')) return renderGuide();
  if (hash.startsWith('#/cheatsheet')) return renderCheatsheet();
  const catm = hash.match(/^#\/cat-([\w-]+)/);
  if (catm) {
    filterCat = catm[1];
    return renderHome();
  }
  return renderHome();
}

window.addEventListener('hashchange', route);

window.addEventListener('message', (e) => {
  const d = e.data;
  if (!d || typeof d !== 'object' || d.type !== 'lab-event' || !d.lab) return;
  if (d.kind === 'alert') setSolved(d.lab, `Execution confirmed: ${String(d.message).slice(0, 70)}`);
  else if (d.kind === 'solved') setSolved(d.lab, 'Objective met ✓');
});

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy');
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(btn.dataset.code || '');
    btn.textContent = 'copied';
    btn.classList.add('done');
    setTimeout(() => {
      btn.textContent = 'copy';
      btn.classList.remove('done');
    }, 1300);
  } catch {
    btn.textContent = 'select manually';
  }
});

route();
