// 서버 통합 테스트 (파일 DB) : node server/test.js
process.env.ADMIN_NAMES = 'admin1';
process.env.DB_FILE = require('os').tmpdir() + '/cgdd-test-' + Date.now() + '.json';
const app = require('./server'); const assert = require('assert');
const srv = app.listen(0, async () => {
  app.attachPresence(srv);
  const base = 'http://127.0.0.1:' + srv.address().port;
  const j = async (m, p, body, tok) => { const r = await fetch(base + p, { method: m, headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}) }, body: body ? JSON.stringify(body) : undefined }); return [r.status, await r.json()]; };
  try {
    await new Promise(r => setTimeout(r, 300));
    let [s, o] = await j('POST', '/api/register', { name: 'a', password: '1234' }); assert.equal(s, 400);
    [s, o] = await j('POST', '/api/register', { name: '근육맨', password: '12' }); assert.equal(s, 400);
    [s, o] = await j('POST', '/api/register', { name: '근육맨', password: 'pass1234' }); assert.equal(s, 200); const tok = o.token;
    [s] = await j('POST', '/api/register', { name: '근육맨', password: 'zzzz' }); assert.equal(s, 409);
    [s] = await j('POST', '/api/login', { name: '근육맨', password: 'wrong' }); assert.equal(s, 401);
    [s] = await j('POST', '/api/login', { name: '없는사람', password: 'wrong' }); assert.equal(s, 401);
    [s, o] = await j('POST', '/api/login', { name: '근육맨', password: 'pass1234' }); assert.equal(s, 200);
    [s] = await j('GET', '/api/save'); assert.equal(s, 401);
    [s] = await j('GET', '/api/save', null, tok + 'x'); assert.equal(s, 401);
    [s, o] = await j('GET', '/api/save', null, tok); assert.equal(o.save, null);
    [s] = await j('PUT', '/api/save', { save: { job: 'x', lvl: 999 } }, tok); assert.equal(s, 400);
    [s] = await j('PUT', '/api/save', { save: { job: 'mage', lvl: 42, coins: 5 } }, tok); assert.equal(s, 200);
    [s, o] = await j('GET', '/api/save', null, tok); assert.equal(o.save.lvl, 42);
    // 채팅 · 이벤트
    [s, o] = await j('POST', '/api/chat', { text: '안녕<script>', kind: 'map', map: 'town' }, tok); assert.equal(s, 200);
    [s] = await j('POST', '/api/chat', { text: '연타', kind: 'map', map: 'town' }, tok); assert.equal(s, 429);
    [s, o] = await j('GET', '/api/poll?since=0&map=town'); assert.equal(o.msgs[0].text, '안녕script'); assert.equal(o.event, null);
    [s, o] = await j('GET', '/api/poll?since=0&map=forest'); assert.equal(o.msgs.length, 0);
    await new Promise(r => setTimeout(r, 1300));
    [s] = await j('POST', '/api/chat', { text: '전체', kind: 'mega', map: 'town' }, tok); assert.equal(s, 200);
    [s, o] = await j('GET', '/api/poll?since=0&map=forest'); assert.equal(o.msgs.length, 1);
    [s] = await j('POST', '/api/admin/event', { exp: 2, minutes: 10 }, tok); assert.equal(s, 403);
    [s, o] = await j('POST', '/api/register', { name: 'admin1', password: 'pass1234' }); const at = o.token;
    [s, o] = await j('GET', '/api/me', null, at); assert.equal(o.admin, true);
    [s, o] = await j('POST', '/api/admin/event', { exp: 2, drop: 1, minutes: 10, msg: '테스트' }, at); assert.equal(s, 200);
    [s, o] = await j('GET', '/api/poll?since=0&map=x'); assert.equal(o.event.exp, 2);
    [s] = await j('POST', '/api/admin/event', { off: true }, at); assert.equal(s, 200);
    [s, o] = await j('GET', '/api/poll?since=0&map=x'); assert.equal(o.event, null);
    // 랭킹 · 환영
    [s] = await j('PUT', '/api/save', { save: { job: 'archer', lvl: 77, exp: 5 } }, at); assert.equal(s, 200);
    [s, o] = await j('GET', '/api/ranking', null, at); assert.equal(o.top[0].name, 'admin1'); assert.equal(o.me.rank, 1); assert.equal(o.top[0].key, undefined);
    [s, o] = await j('POST', '/api/hello', {}, at); assert.equal(o.rank, 1);
    [s, o] = await j('GET', '/api/poll?since=0&map=x'); assert.ok(o.msgs.some(m => m.kind === 'rank' && m.rank === 1));
    [s, o] = await j('POST', '/api/hello', {}, tok); assert.equal(o.rank, 2);
    // 실시간 접속
    const WS = require('ws'), url = base.replace('http', 'ws') + '/ws';
    const a = new WS(url), b = new WS(url); await Promise.all([a, b].map(w => new Promise(r => w.on('open', r))));
    a.send(JSON.stringify({ t: 'hello', token: tok })); await new Promise(r => setTimeout(r, 200));
    a.send(JSON.stringify({ t: 'st', map: 'town', x: 100, y: 470, f: 1, s: 'run', j: 'mage', lv: 7 }));
    b.send(JSON.stringify({ t: 'st', map: 'town', x: 300, y: 470, f: -1, s: 'idle', j: 'rogue', lv: 3 }));
    const got = await new Promise(r => b.on('message', d => { const o = JSON.parse(d); if (o.peers.length) r(o); }));
    assert.equal(got.peers[0].name, '근육맨'); assert.equal(got.peers[0].j, 'mage'); assert.equal(got.online, 2);
    a.close(); b.close();
    console.log('SERVER TESTS OK');
  } catch (e) { console.error('FAIL', e); process.exitCode = 1; } finally { srv.close(); setTimeout(() => process.exit(), 100); }
});
