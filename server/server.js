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
    if (/운영|관리자|gm|admin|운엉/i.test(name) && !isAdmin(name)) return res.status(400).json({ error: '운영자를 사칭하는 이름은 쓸 수 없습니다.' });
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
const ADMINS = (process.env.ADMIN_NAMES || '운영자').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
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
    if (rank && rank <= 3 && list[i].lvl >= 10 && Date.now() - (greeted.get(req.user) || 0) > 10 * 60000) {
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
/* ---------- 저녁 이벤트 (KST) : 20:00 축제 보스 레이드 · 20:30 명예의 전당 쟁탈전 ---------- */
const LIVE = { force: { raid: 0, arena: 0 }, forceAt: { raid: 0, arena: 0 }, raid: null, arena: null, was: { raid: false, arena: false } };
const kstNow = () => { const ms = Date.now() + 9 * 3600e3; return { min: Math.floor(ms / 60000) % 1440, day: Math.floor(ms / 864e5) }; };
const WIN = { raid: [1200, 1225], arena: [1230, 1240] };
const RAID_BOSSES = ['dokkaebi', 'eggking', 'fox'];
function liveOpen(kind) { if (LIVE.force[kind] > Date.now()) return true; const m = kstNow().min; return m >= WIN[kind][0] && m < WIN[kind][1]; }
function liveUntil(kind) { if (LIVE.force[kind] > Date.now()) return LIVE.force[kind]; const k = kstNow(); return Date.now() - (Date.now() % 60000) + (WIN[kind][1] - k.min) * 60000; }
app.post('/api/admin/live', auth, (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).json({ error: '운영자만 열 수 있습니다.' });
  const b = req.body || {}, kind = b.kind === 'arena' ? 'arena' : 'raid';
  if (b.off) { LIVE.force[kind] = 0; if (kind === 'raid') LIVE.raid = null; else LIVE.arena = null; return res.json({ ok: true }); }
  const minutes = Math.min(120, Math.max(1, +b.minutes || 15));
  LIVE.force[kind] = Date.now() + minutes * 60000; LIVE.forceAt[kind] = Date.now();
  if (kind === 'raid') LIVE.raid = null; else LIVE.arena = null;
  res.json({ ok: true, until: LIVE.force[kind] });
});
app.post('/api/admin/notice', auth, (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).json({ error: '운영자만 공지할 수 있습니다.' });
  const text = clean(req.body && req.body.text); if (!text) return res.status(400).json({ error: '빈 공지' });
  res.json({ ok: true, msg: pushMsg({ kind: 'notice', name: '운영자', text, ch: 'all' }) });
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
app.use('/fonts', express.static(path.join(ROOT, 'fonts'), { maxAge: '30d', immutable: true }));
app.use('/docs', express.static(path.join(ROOT, 'docs'), { maxAge: '1h' }));

const PORT = process.env.PORT || 3000;
db.init().then(kind => {
  DBKIND = kind; console.log('[db]', kind);
  db.getKV('event').then(e => { if (e && e.until > Date.now()) EVENT = e; }).catch(() => {});
  if (kind === 'file' && process.env.RENDER) console.error('[경고] DATABASE_URL 이 없어 임시 파일 DB를 사용합니다. 재배포/재시작 시 계정이 사라집니다! Render > Environment 에 Neon 연결 문자열을 넣으세요.');
  if (require.main === module) { const srv = app.listen(PORT, () => console.log('listening on', PORT)); attachPresence(srv); }
}).catch(e => { console.error('db init failed', e); process.exit(1); });
/* ---------- 실시간 접속 (WebSocket) : 같은 맵의 유저끼리 서로 보인다 ---------- */
function attachPresence(server) {
  const { WebSocketServer } = require('ws');
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4096 });
  let seq = 0;
  const num = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));
  wss.on('connection', ws => {
    ws.id = 'u' + (++seq); ws.alive = true; ws.st = null; ws.name = '손님' + (1000 + (seq % 9000));
    ws.on('pong', () => { ws.alive = true; });
    try { ws.send(JSON.stringify({ t: 'you', id: ws.id })); } catch {}
    ws.rb = { t: 0, n: 0 }; ws.hb = { t: 0, n: 0 };
    ws.on('message', raw => {
      let m; try { m = JSON.parse(raw); } catch { return; }
      if (m.t === 'hello') { const n = verify(m.token); if (n) db.getUser(n).then(u => { if (u) { ws.name = u.display; ws.user = n; } }).catch(() => {}); return; }
      if (m.t === 'st') {
        ws.st = { id: ws.id, name: ws.name, map: String(m.map || '').slice(0, 20), x: num(m.x, -500, 20000), y: num(m.y, -2000, 5000), f: m.f < 0 ? -1 : 1,
          s: String(m.s || 'idle').slice(0, 8), j: String(m.j || 'warrior').slice(0, 10), ti: num(m.ti, 0, 3) | 0, fi: num(m.fi, 0, 99) | 0, lv: num(m.lv, 1, 100) | 0,
          eq: m.eq && typeof m.eq === 'object' ? Object.fromEntries(Object.entries(m.eq).slice(0, 5).map(([k, v]) => [String(k).slice(0, 8), String(v).slice(0, 20)])) : {}, h: num(m.h, 0, 100) | 0, pt: String(m.pt || '').slice(0, 10), dd: m.dd ? 1 : 0, w: num(m.w, 0, 2) | 0, at: Date.now() };
        return;
      }
      if (m.t === 'whoami') { try { ws.send(JSON.stringify({ t: 'you', id: ws.id })); } catch {} return; }
      if (m.t === 'rd') { raidDamage(ws, m); return; }
      if (m.t === 'pb' || m.t === 'kx') {
        if (!ws.st || !ws.st.pt) return;
        const now = Date.now(); if (now - ws.hb.t > 1000) ws.hb = { t: now, n: 0 }; if (++ws.hb.n > 20) return;
        const o = m.t === 'pb'
          ? { t: 'pb', k: String(m.k || '').slice(0, 30), x: num(m.x, -1e4, 1e5), y: num(m.y, -1e4, 1e5), fname: ws.name,
              b: { atk: num(m.b && m.b.atk, 1, 1.6), spd: num(m.b && m.b.spd, 1, 1.4), def: num(m.b && m.b.def, 0, .5), mpr: num(m.b && m.b.mpr, 0, 6), dur: num(m.b && m.b.dur, 1, 15), n: String(m.b && m.b.n || '').slice(0, 12) } }
          : { t: 'kx', e: Math.round(num(m.e, 0, 1e7)), x: num(m.x, -1e4, 1e5), fname: ws.name };
        const s2 = JSON.stringify(o);
        for (const c of wss.clients) if (c !== ws && c.readyState === 1 && c.st && c.st.pt === ws.st.pt && c.st.map === ws.st.map) c.send(s2);
        return;
      }
      if (m.t === 'heal' && ws.st && ws.st.map !== 'ev_arena') {
        let tg = null; for (const c of wss.clients) if (c.id === m.to) { tg = c; break; }
        if (tg && tg.readyState === 1 && tg.st && ws.st.pt && tg.st.pt === ws.st.pt && tg.st.map === ws.st.map) tg.send(JSON.stringify({ t: 'healed', v: num(m.v, 0, .8), fname: ws.name }));
        return;
      }
      if (m.t === 'hit' || m.t === 'heal') {
        if (!ws.st || ws.st.map !== 'ev_arena') return;
        const now = Date.now(); if (now - ws.hb.t > 1000) ws.hb = { t: now, n: 0 }; if (++ws.hb.n > 20) return;
        let tg = null; for (const c of wss.clients) if (c.id === m.to) { tg = c; break; }
        if (!tg || tg.readyState !== 1 || !tg.st || tg.st.map !== 'ev_arena') return;
        const same = !!ws.st.pt && ws.st.pt === tg.st.pt;
        if (m.t === 'hit' && !same) tg.send(JSON.stringify({ t: 'hurt', d: num(m.d, 1, 30000) | 0, dir: m.dir < 0 ? -1 : 1, from: ws.id, fname: ws.name }));
        if (m.t === 'heal' && same) tg.send(JSON.stringify({ t: 'healed', v: num(m.v, 0, 1), fname: ws.name }));
      }
    });
  });
  const bcast = o => { const s = JSON.stringify(o); for (const c of wss.clients) if (c.readyState === 1) c.send(s); };
  function raidDamage(ws, m) {
    const R = LIVE.raid; if (!R || R.dead || !ws.st || ws.st.map !== 'ev_raid') return;
    const now = Date.now(); if (now - ws.rb.t > 1000) ws.rb = { t: now, n: 0 };
    const d = Math.min(num(m.d, 0, 60000), Math.max(0, 150000 - ws.rb.n)); if (d <= 0) return; ws.rb.n += d;
    if (!R.att.has(ws.id)) { R.max += 60000; R.hp += 60000; }
    const a = R.att.get(ws.id) || { d: 0, name: ws.name }; a.d += d; a.name = ws.name; R.att.set(ws.id, a);
    R.hp -= d;
    if (R.hp <= 0) {
      R.hp = 0; R.dead = true;
      const alive = [...wss.clients].filter(c => c.readyState === 1 && R.att.has(c.id));
      const pool = alive.length ? alive.map(c => c.id) : [...R.att.keys()];
      const wid = pool[Math.floor(Math.random() * pool.length)], w = R.att.get(wid);
      R.winner = w.name; R.wid = wid;
      bcast({ t: 'raidEnd', key: R.key, wid, winner: w.name, boss: R.boss });
      pushMsg({ kind: 'event', name: '축제 보스', text: '거대 보스 격파! 참가 ' + R.att.size + '명 · 전리품은 ' + w.name + ' 님에게!', ch: 'all' });
    }
  }
  function liveTick(dt) {
    for (const kind of ['raid', 'arena']) {
      const open = liveOpen(kind);
      if (open && !LIVE.was[kind]) pushMsg({ kind: 'event', name: '이벤트', text: kind === 'raid' ? '🐉 축제 보스 레이드가 열렸다! 오른쪽 위 [이벤트] 버튼으로 입장!' : '🏛 명예의 전당 쟁탈전이 열렸다! 30초 버티면 우승!', ch: 'all' });
      LIVE.was[kind] = open;
    }
    if (!liveOpen('raid')) LIVE.raid = null;
    else if (!LIVE.raid) { const k = kstNow(); LIVE.raid = { key: k.day + '-' + (LIVE.force.raid > Date.now() ? LIVE.forceAt.raid : 0), boss: RAID_BOSSES[k.day % 3], max: 150000, hp: 150000, att: new Map(), dead: false }; }
    if (!liveOpen('arena')) { LIVE.arena = null; return; }
    const A = LIVE.arena || (LIVE.arena = { round: 1, hold: 0, tkey: '', tname: '', contested: false, brk: 0 });
    if (A.brk > 0) { A.brk -= dt; if (A.brk <= 0) { A.brk = 0; A.round++; A.hold = 0; A.tkey = ''; A.tname = ''; } return; }
    const now = Date.now(), inMap = [...wss.clients].filter(c => c.readyState === 1 && c.st && c.st.map === 'ev_arena' && now - c.st.at < 3000);
    const keyOfC = c => c.st.pt ? 'p:' + c.st.pt : 's:' + c.id;
    const occ = inMap.filter(c => !c.st.dd && Math.abs(c.st.x - 1600) < 150 && c.st.y > 380);
    const teams = new Set(occ.map(keyOfC));
    if (teams.size === 1) {
      const tk = [...teams][0];
      if (tk !== A.tkey) { A.tkey = tk; A.hold = 0; A.tname = tk.startsWith('p:') ? tk.slice(2) + ' 팀' : occ[0].st.name; }
      A.hold += dt; A.contested = false;
      if (A.hold >= 30) {
        const win = inMap.filter(c => keyOfC(c) === tk);
        bcast({ t: 'arenaWin', tname: A.tname, wids: win.map(c => c.id), names: win.map(c => c.st.name) });
        pushMsg({ kind: 'event', name: '명예의 전당', text: '🏆 ' + A.tname + ' 우승! (' + win.map(c => c.st.name).join(', ') + ') 명예 메달 획득!', ch: 'all' });
        A.brk = 8; A.hold = 30;
      }
    } else if (teams.size > 1) A.contested = true;
    else { A.contested = false; A.hold = Math.max(0, A.hold - dt * .5); if (A.hold === 0) { A.tkey = ''; A.tname = ''; } }
  }
  let evT = 0;
  setInterval(() => {
    liveTick(.1);
    if (++evT % 4) return;
    const R = LIVE.raid, A = LIVE.arena;
    bcast({ t: 'ev', now: Date.now(),
      raid: R ? { open: 1, key: R.key, boss: R.boss, hp: R.hp, max: R.max, n: R.att.size, dead: R.dead, winner: R.winner || '', until: liveUntil('raid') } : { open: 0 },
      arena: A ? { open: 1, round: A.round, hold: +A.hold.toFixed(1), tkey: A.tkey, tname: A.tname, contested: A.contested, brk: +A.brk.toFixed(1), until: liveUntil('arena') } : { open: 0 } });
  }, 100).unref();
  // 10Hz 로 같은 맵 사람들 위치 전송
  setInterval(() => {
    const byMap = new Map(); let online = 0;
    for (const c of wss.clients) { if (c.readyState !== 1) continue; online++; if (c.st && Date.now() - c.st.at < 10000) { const a = byMap.get(c.st.map) || []; a.push(c.st); byMap.set(c.st.map, a); } }
    for (const c of wss.clients) {
      if (c.readyState !== 1 || !c.st) continue;
      const peers = (byMap.get(c.st.map) || []).filter(p => p.id !== c.id).slice(0, 30);
      c.send(JSON.stringify({ t: 'peers', online, peers }));
    }
  }, 100).unref();
  setInterval(() => { for (const c of wss.clients) { if (!c.alive) { c.terminate(); continue; } c.alive = false; try { c.ping(); } catch {} } }, 30000).unref();
  return wss;
}
module.exports = app;
module.exports.attachPresence = attachPresence;
module.exports.LIVE = LIVE;
