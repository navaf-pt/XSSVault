/**
 * Tiny storage layer: D1 when a binding exists, in-memory otherwise.
 *
 * Only the lab targets use it, and every value is stored/read as raw text so the
 * labs can keep their intentionally unsafe rendering paths. Tables are created
 * lazily on first use.
 */

const mem = { entries: [], settings: new Map(), seq: 1 };
let ready = false;

async function ensure(env) {
  if (!env || !env.DB) return false;
  if (ready) return true;
  await env.DB.batch([
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS entries (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         lab TEXT NOT NULL,
         kind TEXT NOT NULL,
         data TEXT NOT NULL,
         created_at INTEGER NOT NULL
       )`
    ),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS entries_lab ON entries (lab, kind)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`),
  ]);
  ready = true;
  return true;
}

export async function addEntry(env, { lab, kind = 'row', data = {}, createdAt }) {
  const payload = JSON.stringify(data);
  const ts = createdAt || Date.now();
  if (await ensure(env)) {
    await env.DB.prepare('INSERT INTO entries (lab, kind, data, created_at) VALUES (?, ?, ?, ?)')
      .bind(lab, kind, payload, ts)
      .run();
    return;
  }
  mem.entries.push({ id: mem.seq++, lab, kind, data: payload, created_at: ts });
}

export async function listEntries(env, { lab, kind = 'row', limit = 50 }) {
  if (await ensure(env)) {
    const { results } = await env.DB.prepare(
      'SELECT id, data, created_at FROM entries WHERE lab = ? AND kind = ? ORDER BY id DESC LIMIT ?'
    )
      .bind(lab, kind, limit)
      .all();
    return (results || []).map((r) => ({ id: r.id, createdAt: r.created_at, data: safeParse(r.data) }));
  }
  return mem.entries
    .filter((e) => e.lab === lab && e.kind === kind)
    .sort((a, b) => b.id - a.id)
    .slice(0, limit)
    .map((e) => ({ id: e.id, createdAt: e.created_at, data: safeParse(e.data) }));
}

export async function clearLab(env, lab) {
  if (await ensure(env)) {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM entries WHERE lab = ?').bind(lab),
      env.DB.prepare("DELETE FROM settings WHERE key LIKE ?").bind(lab + ':%'),
    ]);
    return;
  }
  mem.entries = mem.entries.filter((e) => e.lab !== lab);
  for (const k of [...mem.settings.keys()]) if (k.startsWith(lab + ':')) mem.settings.delete(k);
}

export async function setSetting(env, key, value) {
  const v = String(value);
  if (await ensure(env)) {
    await env.DB.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    )
      .bind(key, v)
      .run();
    return;
  }
  mem.settings.set(key, v);
}

export async function getSetting(env, key, fallback = null) {
  if (await ensure(env)) {
    const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first();
    return row ? row.value : fallback;
  }
  return mem.settings.has(key) ? mem.settings.get(key) : fallback;
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return { value: String(s) };
  }
}
