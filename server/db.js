// 저장소 추상화: DATABASE_URL 이 있으면 Postgres, 없으면 로컬 JSON 파일(개발용)
const fs = require('fs'), path = require('path');
let pool = null;
async function init() {
  if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false }, // Neon 은 SSL 필수
      max: 5, idleTimeoutMillis: 20000, connectionTimeoutMillis: 15000,   // Neon 무료 플랜은 유휴 시 절전 → 첫 연결이 느릴 수 있음
    });
    pool.on('error', e => console.error('pg pool error', e.message));
    await pool.query(`CREATE TABLE IF NOT EXISTS users(
      name TEXT PRIMARY KEY, display TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS saves(
      name TEXT PRIMARY KEY REFERENCES users(name) ON DELETE CASCADE, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT now())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v JSONB NOT NULL)`);
    return 'postgres';
  }
  return 'file';
}
/* ---- file fallback ---- */
const FILE = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'db.json');
let mem = null;
function load() { if (mem) return mem; try { mem = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { mem = { users: {}, saves: {} }; } return mem; }
function flush() { try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(mem)); } catch (e) { console.error('db flush', e.message); } }

async function getUser(name) {
  if (pool) { const r = await pool.query('SELECT * FROM users WHERE name=$1', [name]); return r.rows[0] || null; }
  return load().users[name] || null;
}
async function createUser(name, display, salt, hash) {
  if (pool) {
    try { await pool.query('INSERT INTO users(name,display,salt,hash) VALUES($1,$2,$3,$4)', [name, display, salt, hash]); return true; }
    catch (e) { if (e.code === '23505') return false; throw e; }
  }
  const d = load(); if (d.users[name]) return false;
  d.users[name] = { name, display, salt, hash }; flush(); return true;
}
async function getSave(name) {
  if (pool) { const r = await pool.query('SELECT data,updated_at FROM saves WHERE name=$1', [name]); return r.rows[0] ? { data: r.rows[0].data, updated: +new Date(r.rows[0].updated_at) } : null; }
  const s = load().saves[name]; return s || null;
}
async function putSave(name, data) {
  if (pool) { await pool.query(`INSERT INTO saves(name,data,updated_at) VALUES($1,$2,now())
    ON CONFLICT(name) DO UPDATE SET data=$2, updated_at=now()`, [name, JSON.stringify(data)]); return; }
  load().saves[name] = { data, updated: Date.now() }; flush();
}
async function deleteUser(name) {
  if (pool) { await pool.query('DELETE FROM users WHERE name=$1', [name]); return; }
  const d = load(); delete d.users[name]; delete d.saves[name]; flush();
}
async function getKV(k) {
  if (pool) { const r = await pool.query('SELECT v FROM kv WHERE k=$1', [k]); return r.rows[0] ? r.rows[0].v : null; }
  const d = load(); return (d.kv || {})[k] || null;
}
async function setKV(k, v) {
  if (pool) { await pool.query('INSERT INTO kv(k,v) VALUES($1,$2) ON CONFLICT(k) DO UPDATE SET v=$2', [k, JSON.stringify(v)]); return; }
  const d = load(); d.kv = d.kv || {}; d.kv[k] = v; flush();
}
async function ranking(limit = 100) {
  if (pool) {
    const r = await pool.query(`SELECT u.display AS name, s.data->>'job' AS job, COALESCE((s.data->>'lvl')::int,1) AS lvl,
      COALESCE((s.data->>'exp')::float,0) AS exp, COALESCE((s.data->>'tier')::int,0) AS tier, s.name AS key
      FROM saves s JOIN users u ON u.name=s.name ORDER BY lvl DESC, exp DESC, s.updated_at ASC LIMIT $1`, [limit]);
    return r.rows;
  }
  const d = load();
  return Object.keys(d.saves).filter(k => d.users[k]).map(k => { const s = d.saves[k].data || {}; return { name: d.users[k].display, job: s.job, lvl: +s.lvl || 1, exp: +s.exp || 0, tier: +s.tier || 0, key: k, up: d.saves[k].updated || 0 }; })
    .sort((a, b) => b.lvl - a.lvl || b.exp - a.exp || a.up - b.up).slice(0, limit);
}
module.exports = { ranking, getKV, setKV, init, getUser, createUser, getSave, putSave, deleteUser };
