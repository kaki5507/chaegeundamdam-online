// 채근담담 온라인 — 정적 파일 + 계정/저장 API
const express = require('express'), crypto = require('crypto'), path = require('path');
const db = require('./db');
const ROOT = path.join(__dirname, '..');
const SECRET = process.env.SECRET || crypto.randomBytes(32).toString('hex'); // 운영에서는 환경변수로 고정
if (!process.env.SECRET) console.warn('[warn] SECRET 미설정: 서버 재시작 시 로그인이 풀립니다');
const TOKEN_DAYS = 30;

const b64 = b => Buffer.from(b).toString('base64url');
function sign(name) {
  const body = b64(JSON.stringify({ n: name, e: Date.now() + TOKEN_DAYS * 864e5 }));
  return body + '.' + crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}
function verify(tok) {
  if (typeof tok !== 'string') return null;
  const [body, mac] = tok.split('.'); if (!body || !mac) return null;
  const want = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  const a = Buffer.from(mac), b = Buffer.from(want);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const o = JSON.parse(Buffer.from(body, 'base64url')); return o.e > Date.now() ? o.n : null; } catch { return null; }
}
const hashPw = (pw, salt) => new Promise((res, rej) => crypto.scrypt(pw, salt, 64, (e, k) => e ? rej(e) : res(k.toString('hex'))));
const NAME_RE = /^[0-9A-Za-z_가-힣]{2,12}$/;
const keyOf = n => n.toLowerCase();

// 간단한 IP 별 요청 제한 (로그인 시도 20회/분, 저장 60회/분)
const hits = new Map();
function limit(kind, max) {
  return (req, res, next) => {
    const k = kind + ':' + (req.headers['x-forwarded-for'] || req.ip), now = Date.now();
    const arr = (hits.get(k) || []).filter(t => now - t < 60000); arr.push(now); hits.set(k, arr);
    if (arr.length > max) return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' });
    next();
  };
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some(t => now - t < 60000)) hits.delete(k); }, 60000).unref();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '256kb' }));

function auth(req, res, next) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  const name = m && verify(m[1]);
  if (!name) return res.status(401).json({ error: '로그인이 필요합니다.' });
  req.user = name; next();
}

app.post('/api/register', limit('auth', 20), async (req, res) => {
  try {
    const { name, password } = req.body || {};
    if (typeof name !== 'string' || !NAME_RE.test(name)) return res.status(400).json({ error: '이름은 한글/영문/숫자/_ 2~12자입니다.' });
    if (typeof password !== 'string' || password.length < 4 || password.length > 64) return res.status(400).json({ error: '비밀번호는 4~64자입니다.' });
    const salt = crypto.randomBytes(16).toString('hex');
    const ok = await db.createUser(keyOf(name), name, salt, await hashPw(password, salt));
    if (!ok) return res.status(409).json({ error: '이미 사용 중인 이름입니다.' });
    res.json({ token: sign(keyOf(name)), name });
  } catch (e) { console.error(e); res.status(500).json({ error: '서버 오류' }); }
});
app.post('/api/login', limit('auth', 20), async (req, res) => {
  try {
    const { name, password } = req.body || {};
    if (typeof name !== 'string' || typeof password !== 'string') return res.status(400).json({ error: '이름과 비밀번호를 입력하세요.' });
    const u = await db.getUser(keyOf(name));
    const h = await hashPw(password, u ? u.salt : 'x'.repeat(32));
    if (!u || !crypto.timingSafeEqual(Buffer.from(h), Buffer.from(u.hash))) return res.status(401).json({ error: '이름 또는 비밀번호가 틀립니다.' });
    res.json({ token: sign(u.name), name: u.display });
  } catch (e) { console.error(e); res.status(500).json({ error: '서버 오류' }); }
});
const ADMINS = (process.env.ADMIN_NAMES || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const isAdmin = n => ADMINS.includes(String(n).toLowerCase());
app.get('/api/me', auth, async (req, res) => {
  const u = await db.getUser(req.user); if (!u) return res.status(401).json({ error: '계정이 없습니다.' });
  res.json({ name: u.display, admin: isAdmin(req.user) });
});

/* ---------- 채팅 (메모리 링버퍼) · 확성기 · 운영자 이벤트 ---------- */
const CHAT = []; let lastTs = 0;
const nextTs = () => (lastTs = Math.max(Date.now(), lastTs + 1));
function pushMsg(m) { m.ts = nextTs(); CHAT.push(m); if (CHAT.length > 300) CHAT.shift(); return m; }
let EVENT = null;
const curEvent = () => (EVENT && EVENT.until > Date.now() ? EVENT : null);
const clean = s => String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 80);
const lastChat = new Map();
/* ---------- 명예의 전당 · 랭커 접속 환영 ---------- */
let RANK = { at: 0, list: [] };
async function rankList() { if (Date.now() - RANK.at > 15000) RANK = { at: Date.now(), list: await db.ranking(200) }; return RANK.list; }
const optUser = req => { const m = /^Bearer (.+)$/.exec(req.headers.authorization || ''); return m && verify(m[1]); };
app.get('/api/ranking', async (req, res) => {
  try {
    const list = await rankList(), me = optUser(req), i = me ? list.findIndex(r => r.key === me) : -1;
    res.json({ top: list.slice(0, 10).map(({ key, up, ...r }) => r), me: i >= 0 ? { rank: i + 1, lvl: list[i].lvl } : null });
  } catch (e) { console.error(e); res.status(500).json({ error: '서버 오류' }); }
});
const greeted = new Map();
app.post('/api/hello', auth, limit('auth', 20), async (req, res) => {
  try {
    RANK.at = 0; const list = await rankList(), i = list.findIndex(r => r.key === req.user), rank = i >= 0 ? i + 1 : null;
    if (rank && rank <= 3 && Date.now() - (greeted.get(req.user) || 0) > 10 * 60000) {
      greeted.set(req.user, Date.now());
      pushMsg({ kind: 'rank', rank, name: list[i].name, text: '랭킹 ' + rank + '위 ' + list[i].name + ' 님이 접속했습니다! 모두 환영해 주세요!', ch: 'all' });
    }
    res.json({ rank });
  } catch (e) { console.error(e); res.status(500).json({ error: '서버 오류' }); }
});
app.get('/api/poll', (req, res) => {
  const since = +req.query.since || 0, map = String(req.query.map || '').slice(0, 20);
  const msgs = CHAT.filter(m => m.ts > since && (m.ch === 'all' || m.ch === 'map:' + map)).slice(since ? -40 : -12);
  res.json({ now: Date.now(), msgs, event: curEvent() });
});
app.post('/api/chat', auth, async (req, res) => {
  const now = Date.now(), last = lastChat.get(req.user) || 0;
  if (now - last < 1200) return res.status(429).json({ error: '채팅이 너무 빠릅니다.' });
  const text = clean(req.body && req.body.text); if (!text) return res.status(400).json({ error: '빈 메시지' });
  const kind = ['map', 'mega', 'hmega'].includes(req.body.kind) ? req.body.kind : 'map';
  const map = String(req.body.map || 'town').slice(0, 20);
  const u = await db.getUser(req.user); if (!u) return res.status(401).json({ error: '계정이 없습니다.' });
  lastChat.set(req.user, now);
  res.json({ ok: true, msg: pushMsg({ kind, name: u.display, text, ch: kind === 'map' ? 'map:' + map : 'all' }) });
});
app.post('/api/admin/event', auth, async (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).json({ error: '운영자만 이벤트를 열 수 있습니다.' });
  const b = req.body || {};
  if (b.off) { EVENT = null; await db.setKV('event', null); pushMsg({ kind: 'event', name: '운영자', text: '이벤트가 종료되었습니다.', ch: 'all' }); return res.json({ ok: true, event: null }); }
  const exp = Math.min(5, Math.max(1, +b.exp || 1)), drop = Math.min(5, Math.max(1, +b.drop || 1)), minutes = Math.min(1440, Math.max(1, +b.minutes || 60));
  EVENT = { id: 'e' + Date.now(), exp, drop, until: Date.now() + minutes * 60000, msg: clean(b.msg), by: req.user };
  await db.setKV('event', EVENT);
  const what = [exp > 1 ? '경험치 ' + exp + '배' : '', drop > 1 ? '드롭률 ' + drop + '배' : ''].filter(Boolean).join(' · ');
  pushMsg({ kind: 'event', name: '운영자', text: what + ' 이벤트가 실행됐다! (' + minutes + '분) ' + EVENT.msg, ch: 'all' });
  res.json({ ok: true, event: EVENT });
});
app.get('/api/save', auth, async (req, res) => {
  try { const s = await db.getSave(req.user); res.json(s ? { save: s.data, updated: s.updated } : { save: null }); }
  catch (e) { console.error(e); res.status(500).json({ error: '서버 오류' }); }
});
app.put('/api/save', auth, limit('save', 60), async (req, res) => {
  try {
    const s = req.body && req.body.save;
    if (!s || typeof s !== 'object' || typeof s.job !== 'string' || !Number.isFinite(s.lvl) || s.lvl < 1 || s.lvl > 100) return res.status(400).json({ error: '저장 데이터가 올바르지 않습니다.' });
    await db.putSave(req.user, s); res.json({ ok: true, updated: Date.now() });
  } catch (e) { console.error(e); res.status(500).json({ error: '서버 오류' }); }
});
app.delete('/api/account', auth, limit('auth', 20), async (req, res) => { await db.deleteUser(req.user); res.json({ ok: true }); });
let DBKIND = 'init';
app.get('/api/health', (_q, res) => res.json({ ok: true, db: DBKIND }));

// 정적 파일: 게임 본체와 문서 이미지만 공개
app.get('/', (_q, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.get('/index.html', (_q, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.use('/docs', express.static(path.join(ROOT, 'docs'), { maxAge: '1h' }));

const PORT = process.env.PORT || 3000;
db.init().then(kind => {
  DBKIND = kind; console.log('[db]', kind);
  db.getKV('event').then(e => { if (e && e.until > Date.now()) EVENT = e; }).catch(() => {});
  if (kind === 'file' && process.env.RENDER) console.error('[경고] DATABASE_URL 이 없어 임시 파일 DB를 사용합니다. 재배포/재시작 시 계정이 사라집니다! Render > Environment 에 Neon 연결 문자열을 넣으세요.');
  if (require.main === module) app.listen(PORT, () => console.log('listening on', PORT));
}).catch(e => { console.error('db init failed', e); process.exit(1); });
module.exports = app;
