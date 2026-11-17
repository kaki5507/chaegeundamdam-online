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
module.exports = { init, getUser, createUser, getSave, putSave, deleteUser };
