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
app.get('/api/me', auth, async (req, res) => {
  const u = await db.getUser(req.user); if (!u) return res.status(401).json({ error: '계정이 없습니다.' });
  res.json({ name: u.display });
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
app.get('/api/health', (_q, res) => res.json({ ok: true }));

// 정적 파일: 게임 본체와 문서 이미지만 공개
app.get('/', (_q, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.get('/index.html', (_q, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.use('/docs', express.static(path.join(ROOT, 'docs'), { maxAge: '1h' }));

const PORT = process.env.PORT || 3000;
db.init().then(kind => {
  console.log('[db]', kind);
  if (require.main === module) app.listen(PORT, () => console.log('listening on', PORT));
}).catch(e => { console.error('db init failed', e); process.exit(1); });
module.exports = app;
