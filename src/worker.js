/**
 * XSS Lab Forge — lab server.
 *
 * Everything under /lab/* is deliberately vulnerable and is only meant to be
 * rendered inside a sandboxed iframe by the portal. The portal itself is static
 * (see /public) and never renders lab data.
 *
 * Exfiltration endpoints are local by design: payloads report to /api/attack/log
 * on this same site so no third party is ever involved.
 */

import { htmlResponse, jsonResponse, shimSource, esc } from './shell.js';
import { addEntry, listEntries, clearLab } from './store.js';
import { LABS as REFLECTED } from './labs/reflected.js';
import { LABS as STORED } from './labs/stored.js';
import { LABS as DOM } from './labs/dom.js';
import { LABS as BYPASS } from './labs/bypass.js';
import { LABS as BLIND } from './labs/blind.js';
import { LABS as SELF } from './labs/self.js';
import { LABS as SCENARIO } from './labs/scenario.js';

const LABS = { ...REFLECTED, ...STORED, ...DOM, ...BYPASS, ...BLIND, ...SELF, ...SCENARIO };

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store',
};

async function readForm(req) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    const fd = await req.formData();
    const out = {};
    for (const [k, v] of fd.entries()) out[k] = typeof v === 'string' ? v : v.name || '';
    return out;
  }
  return {};
}

function notFound() {
  return htmlResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>Lab not found</title>
     <style>body{font:15px system-ui;background:#f4f6f9;color:#0f172a;padding:40px}h1{font-size:18px}a{color:#2563eb}</style>
     </head><body><h1>Lab not found</h1><p>That lab id does not exist. Go back to the range and pick one.</p>
     <p><a href="/">← back to XSS Lab Forge</a></p></body></html>`,
    { status: 404 }
  );
}

/* ------------------------------------------------------------------ *
 * Exfiltration sink — the "attacker server" for the range
 * ------------------------------------------------------------------ */

async function attackLog(req, env, url) {
  let lab = url.searchParams.get('lab') || 'unknown';
  let src = url.searchParams.get('src') || 'get';
  let data = url.searchParams.get('d') ?? url.searchParams.get('data') ?? '';

  if (req.method === 'POST') {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try {
        const body = await req.json();
        lab = body.lab || lab;
        src = body.src || src;
        data = body.d ?? body.data ?? data;
      } catch {
        /* ignore malformed body */
      }
    } else if (ct.includes('form')) {
      const f = await readForm(req);
      lab = f.lab || lab;
      src = f.src || src;
      data = f.d || f.data || data;
    } else {
      const text = (await req.text()).slice(0, 2000);
      if (text) data = text;
    }
  }

  await addEntry(env, {
    lab: String(lab).slice(0, 60),
    kind: 'attack',
    data: { src: String(src).slice(0, 60), data: String(data).slice(0, 2000) },
  });

  return jsonResponse({ ok: true }, { headers: CORS });
}

async function attackList(env, url) {
  const all = url.searchParams.get('all') === '1';
  const lab = url.searchParams.get('lab') || '';
  const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 200);

  let rows;
  if (all) {
    rows = await listEntries(env, { lab: '__all__', kind: 'attack', limit });
    // listEntries filters by lab; for "all" we union the known labs instead.
    const seen = new Map();
    for (const labId of Object.keys(LABS)) {
      const part = await listEntries(env, { lab: labId, kind: 'attack', limit });
      for (const r of part) seen.set(r.id, { id: r.id, lab: labId, ...r.data, ts: r.createdAt });
    }
    rows = [...seen.values()].sort((a, b) => b.id - a.id).slice(0, limit);
    return jsonResponse({ entries: rows }, { headers: CORS });
  }

  const part = await listEntries(env, { lab, kind: 'attack', limit });
  return jsonResponse(
    { entries: part.map((r) => ({ id: r.id, lab, ...r.data, ts: r.createdAt })) },
    { headers: CORS }
  );
}

async function attackClear(env, req, url) {
  let lab = url.searchParams.get('lab');
  if (!lab) {
    const body = await req.text().catch(() => '');
    if (body && body !== 'all') lab = body.trim();
  }
  const targets = lab ? [lab] : Object.keys(LABS);
  for (const t of targets) await clearLab(env, t);
  return jsonResponse({ ok: true, cleared: targets.length }, { headers: CORS });
}

function jsonp(url) {
  const cb = url.searchParams.get('cb') || 'callback';
  // Deliberately permissive: this is the gadget the CSP lab teaches about.
  if (!/^[A-Za-z_$][\w$.]{0,64}$/.test(cb)) {
    return new Response('invalid callback', { status: 400, headers: CORS });
  }
  return new Response(`${cb}(${JSON.stringify({ ok: true, note: 'jsonp gadget', ts: Date.now() })});`, {
    headers: { 'content-type': 'application/javascript; charset=utf-8', ...CORS },
  });
}

function shim(env, url) {
  const id = url.searchParams.get('id') || 'lab';
  const ck = url.searchParams.get('ck') || '';
  return new Response(shimSource(id, ck), {
    headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function resetLab(env, url) {
  const lab = url.searchParams.get('lab') || '';
  if (!lab) return jsonResponse({ ok: false, error: 'lab required' }, { status: 400, headers: CORS });
  await clearLab(env, lab);
  return jsonResponse({ ok: true }, { headers: CORS });
}

/* ------------------------------------------------------------------ */

async function labRoute(req, env, url) {
  const rest = url.pathname.slice('/lab/'.length);
  const parts = rest.split('/').filter(Boolean);
  const id = parts[0] || '';
  const segs = parts.slice(1);

  const def = LABS[id];
  if (!def) return notFound();

  const ctx = {
    id,
    req,
    url,
    env,
    segs,
    method: req.method.toUpperCase(),
    form: req.method === 'POST' ? await readForm(req) : {},
    rawForm: null,
  };

  let out;
  try {
    out = await def.handle(ctx);
  } catch (err) {
    return htmlResponse(
      `<!doctype html><meta charset="utf-8"><body style="font:14px system-ui;padding:30px">
       <h1 style="font-size:16px">Lab error</h1><pre>${esc(String(err && err.stack ? err.stack : err))}</pre></body>`,
      { status: 500, headers: { 'x-robots-tag': 'noindex' } }
    );
  }

  const res = out instanceof Response ? out : htmlResponse(out);
  const h = new Headers(res.headers);
  h.set('x-robots-tag', 'noindex, nofollow');
  return new Response(res.body, { status: res.status, headers: h });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname;

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (p === '/api/health') return jsonResponse({ ok: true, labs: Object.keys(LABS).length });
    if (p === '/api/attack/log') return attackLog(req, env, url);
    if (p === '/api/attack') return attackList(env, url);
    if (p === '/api/attack/clear') return attackClear(env, req, url);
    if (p === '/api/reset') return resetLab(env, url);
    if (p === '/api/jsonp') return jsonp(url);
    if (p === '/lab/_shim.js') return shim(env, url);
    if (p.startsWith('/lab/')) return labRoute(req, env, url);

    if (env.ASSETS) return env.ASSETS.fetch(req);
    return new Response('Not found', { status: 404 });
  },
};
