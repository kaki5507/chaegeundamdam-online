/* ============================================================
   JOBTOWNS : 직업 마을 8곳 · 마을마다 컨셉 사냥터 2곳 · 1차 전직은 내 직업 마을에서
   신규 몬스터 8종 · 슈퍼점프로만 닿는 높은 곳의 보물상자
   ============================================================ */
/* ---------- 신규 몬스터 ---------- */
Object.assign(MOBS,{
  mush:{n:'통통 버섯',hp:38,dmg:13,exp:17,coin:[4,10],w:30,h:32},
  crab:{n:'집게 꽃게',hp:44,dmg:14,exp:19,coin:[4,11],w:34,h:26},
  golem:{n:'조약돌 골렘',hp:70,dmg:17,exp:26,coin:[6,14],w:38,h:42},
  snowman:{n:'눈사람 꼬마',hp:48,dmg:14,exp:20,coin:[5,12],w:30,h:38},
  gear:{n:'태엽 깡통로봇',hp:52,dmg:15,exp:22,coin:[5,12],w:30,h:38},
  bat:{n:'솜털 박쥐',hp:30,dmg:13,exp:16,coin:[4,9],w:30,h:24,fly:1},
  book:{n:'날아다니는 마도서',hp:36,dmg:14,exp:18,coin:[4,10],w:30,h:26,fly:1},
  lamp:{n:'초롱 도깨비불',hp:34,dmg:14,exp:17,coin:[4,10],w:26,h:32,fly:1},
});
const _sq=(m,t)=>m.vy<-50?1.12:m.vy>50?.9:1+Math.sin(t*6+m.ph)*.04;
Object.assign(MOB_DRAW,{
  mush(g,m,t){g.save();g.translate(m.x,m.y);g.scale(m.dir>0?1:-1,1);const sq=_sq(m,t);ell(g,0,-1,14,3,'rgba(0,0,0,.18)');g.scale(1/sq,sq);
    g.beginPath();g.roundRect(-9,-16,18,16,6);g.fillStyle='#fff4e0';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
    for(const s of[-1,1]){ell(g,s*4+1,-9,1.8,2.4,'#3a2030');circ(g,s*4+1.6,-10,.7,'#fff')}g.fillStyle='rgba(255,140,170,.5)';g.beginPath();g.ellipse(-5,-5,2.4,1.4,0,0,6.28);g.ellipse(8,-5,2.4,1.4,0,0,6.28);g.fill();
    g.beginPath();g.moveTo(-17,-14);g.bezierCurveTo(-18,-36,18,-36,17,-14);g.quadraticCurveTo(0,-10,-17,-14);g.closePath();g.fillStyle='#ff7a8a';g.fill();g.lineWidth=2.2;g.stroke();
    for(const[x,y,r]of[[-8,-24,3.4],[3,-28,2.6],[9,-19,3],[-2,-18,2]])circ(g,x,y,r,'#fff6f0');
    g.globalAlpha=.3;ell(g,-6,-28,6,3,'#fff');g.globalAlpha=1;g.restore()},
  crab(g,m,t){g.save();g.translate(m.x,m.y);g.scale(m.dir>0?1:-1,1);ell(g,0,-1,17,3,'rgba(0,0,0,.18)');const w=Math.sin(t*10+m.ph);
    g.strokeStyle=O_;g.lineWidth=2;for(const s of[-1,1])for(let k=0;k<3;k++){g.beginPath();g.moveTo(s*8,-6);g.lineTo(s*(14+k*2),-1+(k%2?w:-w)*1.5);g.stroke()}
    ell(g,0,-11,16,10,'#ff6a5a',O_,2);g.globalAlpha=.35;ell(g,-4,-15,7,3,'#fff');g.globalAlpha=1;
    for(const s of[-1,1]){g.save();g.translate(s*15,-16);g.rotate(s*(.4+Math.abs(Math.sin(t*4+m.ph))*.4));ell(g,s*5,-4,7,5.5,'#ff8a6a',O_,1.8);g.strokeStyle=O_;g.beginPath();g.moveTo(s*4,-6);g.lineTo(s*11,-6);g.stroke();g.restore()}
    for(const s of[-1,1]){g.fillStyle=O_;g.fillRect(s*5-1,-27,2,8);circ(g,s*5,-28,3.4,'#fff',O_,1.4);circ(g,s*5+.6,-28,1.6,'#2a1a30')}
    g.strokeStyle=O_;g.lineWidth=1.4;g.beginPath();g.arc(0,-9,3,.3,2.8);g.stroke();g.restore()},
  golem(g,m,t){g.save();g.translate(m.x,m.y);g.scale(m.dir>0?1:-1,1);const st=Math.sin(t*5+m.ph)*1.5;ell(g,0,-1,19,4,'rgba(0,0,0,.2)');
    for(const s of[-1,1]){g.beginPath();g.roundRect(s*9-5,-12+(s>0?st:-st)*.5,10,12,4);g.fillStyle='#9a8aa8';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke()}
    g.beginPath();g.roundRect(-17,-38,34,28,12);g.fillStyle='#b8a8c8';g.fill();g.lineWidth=2.4;g.stroke();
    for(const s of[-1,1]){g.beginPath();g.roundRect(s*20-6,-34+st,12,20,6);g.fillStyle='#a898b8';g.fill();g.stroke()}
    ell(g,0,-44,11,9,'#c8b8d8',O_,2.2);for(const s of[-1,1]){circ(g,s*4+1,-45,2.4,'#7af0ff');const gl=g.createRadialGradient(s*4+1,-45,1,s*4+1,-45,7);gl.addColorStop(0,'rgba(120,240,255,.6)');gl.addColorStop(1,'rgba(120,240,255,0)');g.fillStyle=gl;g.fillRect(s*4-7,-53,16,16)}
    g.fillStyle='#7ac87a';g.beginPath();g.ellipse(-4,-52,7,3,-.2,0,6.28);g.fill();circ(g,4,-54,2.2,'#ff9ad8');g.strokeStyle='rgba(80,60,100,.4)';g.lineWidth=1.4;g.beginPath();g.moveTo(-8,-30);g.lineTo(-2,-22);g.lineTo(-6,-16);g.stroke();g.restore()},
  snowman(g,m,t){g.save();g.translate(m.x,m.y);g.scale(m.dir>0?1:-1,1);const sq=_sq(m,t);ell(g,0,-1,14,3,'rgba(0,0,0,.18)');g.scale(1/sq,sq);
    circ(g,0,-12,13,'#ffffff',O_,2.2);circ(g,0,-31,10,'#ffffff',O_,2.2);
    g.fillStyle='#ff6a8a';g.fillRect(-10,-23,20,5);g.strokeStyle=O_;g.lineWidth=1.4;g.strokeRect(-10,-23,20,5);g.fillRect(4,-22,5,10);g.strokeRect(4,-22,5,10);
    for(const s of[-1,1])circ(g,s*3.5+1,-33,1.7,'#2a1a30');poly(g,[2,-30,12,-29,2,-27],'#ff8a1f',O_,1);
    for(let k=0;k<3;k++)circ(g,0,-15+k*5-6,1.4,'#5a4a6a');
    g.strokeStyle='#8a5a30';g.lineWidth=2;for(const s of[-1,1]){g.beginPath();g.moveTo(s*11,-15);g.lineTo(s*20,-22+Math.sin(t*4+s)*3);g.stroke()}
    g.fillStyle='#5a7ad0';g.beginPath();g.roundRect(-8,-46,16,8,3);g.fill();g.stroke();g.fillRect(-11,-39,22,3);g.restore()},
  gear(g,m,t){g.save();g.translate(m.x,m.y);g.scale(m.dir>0?1:-1,1);const st=Math.sin(t*12+m.ph);ell(g,0,-1,14,3,'rgba(0,0,0,.18)');
    for(const s of[-1,1]){g.fillStyle='#8a8aa0';g.fillRect(s*6-2,-8,4,8+(s>0?st:-st));g.strokeStyle=O_;g.lineWidth=1.4;g.strokeRect(s*6-2,-8,4,8)}
    g.beginPath();g.roundRect(-13,-36,26,30,6);const gr=g.createLinearGradient(-13,0,13,0);gr.addColorStop(0,'#d8e0f0');gr.addColorStop(1,'#9aa8c8');g.fillStyle=gr;g.fill();g.lineWidth=2.2;g.stroke();
    g.fillStyle='#ffd34a';g.fillRect(-13,-26,26,4);g.strokeRect(-13,-26,26,4);
    g.fillStyle='#2a2a40';g.beginPath();g.roundRect(-9,-34,18,7,3);g.fill();for(const s of[-1,1])circ(g,s*4,-30.5,1.8,(Math.sin(t*3)>.9)?'#2a2a40':'#7aff9a');
    g.save();g.translate(-14,-20);g.rotate(t*4);g.strokeStyle=O_;g.lineWidth=2.4;g.beginPath();g.moveTo(0,0);g.lineTo(-7,0);g.stroke();ell(g,-9,-3,3,4,'#ffd34a',O_,1.4);ell(g,-9,3,3,4,'#ffd34a',O_,1.4);g.restore();
    g.strokeStyle=O_;g.lineWidth=1.4;g.beginPath();g.moveTo(0,-36);g.lineTo(0,-42);g.stroke();circ(g,0,-43,2.4,'#ff6a5a',O_,1);g.restore()},
  bat(g,m,t){g.save();g.translate(m.x,m.y);const fl=Math.sin(t*14+m.ph);
    for(const s of[-1,1]){g.save();g.translate(s*8,-2);g.scale(s,1);g.rotate(-.2+fl*.5);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(10,-12,20,-4);g.quadraticCurveTo(16,0,18,4);g.quadraticCurveTo(10,2,0,6);g.closePath();g.fillStyle='#8a6ab8';g.fill();g.strokeStyle=O_;g.lineWidth=1.6;g.stroke();g.restore()}
    circ(g,0,0,11,'#a888d0',O_,2);for(const s of[-1,1])poly(g,[s*4,-9,s*8,-17,s*9,-7],'#a888d0',O_,1.4);
    for(const s of[-1,1]){circ(g,s*4,-1,2.6,'#fff',O_,1);circ(g,s*4,-.6,1.3,'#2a1a30')}poly(g,[-2,4,0,7,2,4],'#fff');g.fillStyle='rgba(255,140,190,.5)';g.beginPath();g.ellipse(-7,3,2,1.2,0,0,6.28);g.ellipse(7,3,2,1.2,0,0,6.28);g.fill();g.restore()},
  book(g,m,t){g.save();g.translate(m.x,m.y);const fl=Math.sin(t*9+m.ph);
    g.fillStyle='rgba(200,170,255,.25)';g.beginPath();g.ellipse(0,0,24,16,0,0,6.28);g.fill();
    for(const s of[-1,1]){g.save();g.scale(s,1);g.rotate(-.25-fl*.3);g.beginPath();g.moveTo(0,0);g.lineTo(18,-6);g.lineTo(18,8);g.lineTo(0,12);g.closePath();g.fillStyle='#fffaf0';g.fill();g.strokeStyle=O_;g.lineWidth=1.6;g.stroke();
      g.strokeStyle='rgba(120,90,160,.5)';g.lineWidth=1;for(let k=0;k<3;k++){g.beginPath();g.moveTo(3,2+k*3);g.lineTo(15,-2+k*3);g.stroke()}g.restore()}
    g.beginPath();g.roundRect(-4,-4,8,18,2);g.fillStyle='#7a4ab8';g.fill();g.strokeStyle=O_;g.lineWidth=1.6;g.stroke();
    circ(g,0,-8,6,'#fff',O_,1.4);circ(g,Math.sin(t*2)*1.5,-8,2.8,'#a050ff');circ(g,Math.sin(t*2)*1.5+.8,-9,1,'#fff');
    for(let k=0;k<2;k++){const a=t*3+k*3.1;g.fillStyle='#ffe9a0';g.font='9px sans-serif';g.textAlign='center';g.fillText('✦',Math.cos(a)*20,Math.sin(a)*12-4)}g.restore()},
  lamp(g,m,t){g.save();g.translate(m.x,m.y);const sw=Math.sin(t*3+m.ph)*.15;g.rotate(sw);
    const gl=g.createRadialGradient(0,0,4,0,0,30);gl.addColorStop(0,'rgba(255,200,120,.55)');gl.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=gl;g.fillRect(-30,-30,60,60);
    g.strokeStyle=O_;g.lineWidth=1.6;g.beginPath();g.moveTo(0,-18);g.lineTo(0,-24);g.stroke();
    g.beginPath();g.ellipse(0,0,13,16,0,0,6.28);g.fillStyle='#ff9a5a';g.fill();g.lineWidth=2;g.stroke();
    g.strokeStyle='rgba(160,60,40,.45)';g.lineWidth=1.2;for(const x of[-6,0,6]){g.beginPath();g.ellipse(0,0,Math.abs(x)+1,16,0,0,6.28);g.stroke()}
    g.fillStyle='#c0283c';g.fillRect(-8,-18,16,4);g.fillRect(-8,14,16,4);
    for(const s of[-1,1]){ell(g,s*4,-2,1.8,2.6,'#3a1a10')}g.strokeStyle='#3a1a10';g.lineWidth=1.4;g.beginPath();g.arc(0,3,3,.2,2.9);g.stroke();
    g.fillStyle='#ffd34a';g.beginPath();g.moveTo(-3,18);g.quadraticCurveTo(0,30+Math.sin(t*12)*3,3,18);g.fill();g.restore()},
  peer(){},
});
// 큰 몬스터(필드보스) 크기 · 모든 몬스터 색 변주
for(const k in MOB_DRAW){const f=MOB_DRAW[k];MOB_DRAW[k]=function(g,m,t){if(!m.sc||m.sc===1)return f(g,m,t);g.save();g.translate(m.x,m.y);g.scale(m.sc,m.sc);g.translate(-m.x,-m.y);f(g,m,t);g.restore()}}
const _spawnTplJ=spawnTpl;
spawnTpl=function(i){const m=_spawnTplJ(i);if(m&&S.L.allHue&&!m.hue)m.hue=S.L.allHue;return m};

/* ---------- 직업 마을 데이터 ---------- */
const JTOWNS=[
 {job:'warrior',name:'푸른줄기 성채',sub:'브로콜리 전사들이 땀 흘리는 훈련 성채',theme:'forest',lm:'castle',houses:[['#3fae49','#f4ffe8'],['#2a8a3a','#fff8e6'],['#5ac85a','#f0fff0'],['#4a9a3a','#fffbe8']],
  local:{n:'훈련병 브로콜리',lines:['하나! 둘! 근육은 배신하지 않아!','성벽 위엔 2차 전직한 선배들만 올라가. 공중에서 한 번 더 뛰더라고!','왼쪽 들판은 말랑한 버섯, 오른쪽 성벽은 돌 골렘이 살아.']},
  hunts:[{name:'초록 훈련 들판',min:10,mobs:['mush','bunny'],theme:'forest',hue:40,sub:'목검 소리가 울리는 너른 들판'},{name:'무너진 옛 성벽',min:32,mobs:['golem','bat'],theme:'mask',hue:0,sub:'이끼 낀 돌무더기 사이로 골렘이 깨어난다'}]},
 {job:'archer',name:'당근뿌리 나무마을',sub:'거대한 나무 위에 지은 궁수들의 마을',theme:'bamboo',lm:'tree',houses:[['#ff8a1f','#fff4e0'],['#e07a20','#fffaf0'],['#ffa040','#fff0e0'],['#d86a10','#fff8e8']],
  local:{n:'꼬마 궁수 당근',lines:['저 큰 나무 꼭대기? 슈퍼점프 없인 못 가!','바람 협곡은 박쥐가 많아서 화살 연습하기 딱이야.','과녁 한가운데를 맞히면 하루가 행복해져.']},
  hunts:[{name:'높은 가지 숲',min:12,mobs:['owl','mush'],theme:'bamboo',hue:0,sub:'나뭇가지 사이로 부엉이 눈이 반짝인다'},{name:'휘파람 바람 협곡',min:34,mobs:['bat','bunny'],theme:'sky',hue:200,sub:'휘이잉— 바람이 노래하는 협곡'}]},
 {job:'guardian',name:'하얀무 바위요새',sub:'눈 덮인 바위산의 단단한 요새',theme:'snow',lm:'fort',houses:[['#7a8ab0','#ffffff'],['#9a7ab8','#f4f8ff'],['#5a7ab8','#fffaf8'],['#8a9ac8','#f8f8ff']],
  local:{n:'보초병 무',lines:['방패는 들 때보다 내려놓을 때가 더 무거운 법이지.','눈사람 언덕 녀석들, 귀엽다고 방심하면 눈덩이 맞는다.','얼음 광산 깊은 곳엔 반짝이는 해파리가 산대.']},
  hunts:[{name:'눈사람 언덕',min:14,mobs:['snowman','sheep'],theme:'snow',hue:0,sub:'눈사람들이 굴러다니는 하얀 언덕'},{name:'반짝 얼음 광산',min:38,mobs:['golem','jelly'],theme:'night',hue:160,sub:'얼음 결정이 빛나는 광산 갱도'}]},
 {job:'mage',name:'양파 별탑 마을',sub:'밤하늘에 떠 있는 마법사들의 별탑',theme:'night',lm:'tower',houses:[['#7a5ad0','#f4ecff'],['#5a4ab0','#fff4ff'],['#a05ad0','#f0f0ff'],['#6a6ae0','#fff8ff']],
  local:{n:'견습 마법사 양파',lines:['서고의 책들이 또 날아다녀… 누가 좀 잡아줘!','별탑 꼭대기에서 보는 야경이 최고래. 공중에서 한 번 더 뛰면 갈 수 있대.','버섯숲 초롱불은 밤에만 웃어.']},
  hunts:[{name:'떠도는 서고',min:11,mobs:['book','owl'],theme:'night',hue:0,sub:'책들이 날개를 펴고 날아다니는 서고'},{name:'보랏빛 버섯숲',min:36,mobs:['mush','lamp'],theme:'mask',hue:250,sub:'버섯이 은은하게 빛나는 몽환의 숲'}]},
 {job:'fighter',name:'고추 화산 온천마을',sub:'화산 아래 김이 모락모락 나는 온천마을',theme:'lava',lm:'volcano',houses:[['#e02a2a','#fff0e8'],['#c0201a','#fff6ee'],['#ff5a3a','#fff4ea'],['#d8401a','#fffaf2']],
  local:{n:'온천지기 고추',lines:['땀 흘린 뒤엔 온천이지! 근데 저 위 바위 온천은 슈퍼점프로만 가.','용암길 불꽃 요정은 뜨겁고, 수증기 골짜기 꽃게는 맵다.','주먹은 빠르게, 마음은 따뜻하게!']},
  hunts:[{name:'부글부글 용암길',min:16,mobs:['golem','crab'],theme:'lava',hue:0,sub:'발밑에서 용암이 부글거리는 길'},{name:'수증기 골짜기',min:40,mobs:['crab','lamp'],theme:'origin',hue:330,sub:'온천 수증기가 안개처럼 깔린 골짜기'}]},
 {job:'rogue',name:'가지 달밤 골목',sub:'초롱불만 깜박이는 비밀스러운 골목',theme:'mask',lm:'alley',houses:[['#5a3a8a','#efe6ff'],['#3a2a6a','#f6eeff'],['#7a4aa0','#f0e8ff'],['#4a3a7a','#f8f0ff']],
  local:{n:'정보상 가지',lines:['쉿… 지붕 위 달 아래에 비밀 상자가 있다는 소문이야.','그림자 지붕길은 박쥐 천지. 발소리 죽이고 다녀.','도깨비불 시장은 밤에만 열리지. 사실 매일 밤이지만.']},
  hunts:[{name:'그림자 지붕길',min:13,mobs:['bat','lamp'],theme:'night',hue:280,sub:'달빛 아래 기와지붕을 뛰어다니는 길'},{name:'도깨비불 시장',min:42,mobs:['lamp','mush'],theme:'mask',hue:20,sub:'초롱불 손님들이 북적이는 한밤의 장터'}]},
 {job:'gunner',name:'옥수수 태엽 항구',sub:'태엽 풍차가 도는 기계공들의 항구',theme:'sea',lm:'windmill',houses:[['#ffd83a','#fffbe8'],['#e0b020','#fff8f0'],['#c8a028','#fffaf0'],['#ffc020','#fff4e0']],
  local:{n:'기계공 옥수수',lines:['태엽 공장 로봇들이 고장 났어! 좀 두드려줘.','풍차 꼭대기 전망대엔 슈퍼점프로만 올라갈 수 있지.','모래 해변 꽃게는 집게가 아파. 조심!']},
  hunts:[{name:'모래톱 해변',min:15,mobs:['crab','bunny'],theme:'sea',hue:0,sub:'꽃게가 옆으로 걷는 반짝이는 모래톱'},{name:'철컥철컥 태엽 공장',min:44,mobs:['gear','bat'],theme:'origin',hue:180,sub:'톱니바퀴가 쉬지 않고 도는 공장'}]},
 {job:'priest',name:'마늘 종소리 수도원',sub:'구름 위로 종소리가 울리는 하얀 수도원',theme:'sky',lm:'bell',houses:[['#f0d080','#ffffff'],['#e8c060','#fffdf4'],['#d8b850','#fffaf0'],['#f4dc90','#fffef8']],
  local:{n:'수습 사제 마늘',lines:['종탑 꼭대기 종은 슈퍼점프를 익힌 사람만 칠 수 있어요.','고요한 꽃 회랑엔 길 잃은 초롱불이 떠다녀요. 따뜻하게 보내주세요.','다치면 언제든 오세요. 마늘 향은… 덤이에요.']},
  hunts:[{name:'종탑 구름길',min:12,mobs:['sheep','jelly'],theme:'sky',hue:40,sub:'구름 위로 종소리가 퍼지는 길'},{name:'고요한 꽃 회랑',min:46,mobs:['lamp','bunny'],theme:'harbor',hue:300,sub:'꽃잎이 소리 없이 떨어지는 긴 회랑'}]},
];
JTOWNS.forEach((d,k)=>{d.id='jt_'+d.job;d.hunts.forEach((h,i)=>{h.id='jh_'+d.job+(i+1);h.town=d.id;h.idx=i;h.ms=Math.max(1.3,h.min*.15)})});
const JT_OF=job=>JTOWNS.find(d=>d.job===job);
// 교관 NPC 모습
for(const d of JTOWNS){const j=JOB[d.job];NPC_LOOK_X['jt_'+d.job]={job:d.job,eq:{hat:'hat_helm',outfit:'out_dobok',cape:'cape_red'},n:j.role+' 교관',fid:3};NPC_LOOK_X['jl_'+d.job]={job:d.job,eq:{hat:'hat_flower',outfit:'out_vest'},n:d.local.n,fid:7}}
GIVER_NAME.coach='내 직업 마을의 전직 교관';
QUESTS.j1.desc='수련생 시절은 끝! 내 직업 마을의 전직 교관이 내는 시험이다. 몬스터 20마리를 쓰러뜨리고 스킬을 10번 써서 실력을 증명하라. 통과하면 1차 전직!';
// 야채마을 1차 교관 → 전직 안내원
{const c=NPCS.find(n=>n.id==='coach');if(c){c.id='jguide';c.name='전직 안내원 고추';c.tag='직업 마을 안내'}}
ROLE.jguide='직업 마을 안내 · 전직';ROLE.jtm='다른 직업 교관';ROLE.jlocal='대화';ROLE.chest='슈퍼점프 보물상자';ROLE.coach='1차 전직';

/* ---------- 직업 마을 맵 ---------- */
function buildJobTown(d){
  const gy=470,Wd=3200,mine=SAVE&&SAVE.job===d.job;
  const L=newL({id:d.id,name:d.name,sub:JOB[d.job].role+'의 마을 · '+d.sub,theme:d.theme,music:'field',w:Wd,h:540,town:true,jt:d.job,spawn:{x:220,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));
  const HX=[[420,240,140],[1080,220,120],[2050,280,160],[2620,230,130]];
  L.houses=HX.map(([x,w,h],i)=>({x,w,h,roof:d.houses[i][0],wall:d.houses[i][1]}));
  for(const h of L.houses){L.plats.push(plat(h.x+10,gy-h.h-26,h.w-20,14,'o',{roof:1}));L.ropes.push({x:h.x+h.w-30,y1:gy-h.h-26,y2:gy})}
  // 랜드마크 : 밧줄로 중간층까지, 꼭대기는 슈퍼점프(2차 전직)로만
  const lx=1620;L.landmark={k:d.lm,x:lx,y:gy};
  L.plats.push(plat(lx-110,300,220,16,'o',{lm:1}),plat(lx-70,165,140,16,'o',{lm:1}));L.ropes.push({x:lx-80,y1:300,y2:gy});
  L.npcs=[
    mine?{id:'coach',name:JOB[d.job].role+' 교관',x:820,gy,look:'jt_'+d.job,tag:'1차 전직 (Lv.10)'}:{id:'jtm',name:JOB[d.job].role+' 교관',x:820,gy,look:'jt_'+d.job,town:d.id},
    {id:'shop',name:'마을 상점',x:1400,gy,look:'shop',tag:'상점'},
    {id:'jlocal',name:d.local.n,x:2400,gy,look:'jl_'+d.job,town:d.id},
    {id:'chest',name:'별빛 보물상자',x:lx,gy:165,look:'chest',town:d.id},
  ];
  L.portals=[{x:60,y:gy,to:'town',label:'← 야채마을'},{x:Wd-70,y:gy,to:d.hunts[0].id,label:d.hunts[0].name+' →',lockLv:Math.max(1,d.hunts[0].min-4)}];
  L.sign={x:330,y:gy,t:d.name,s:JOB[d.job].role+'의 마을'};
  return L;
}
function buildJobHunt(h){
  const d=JTOWNS.find(x=>x.id===h.town),gy=470,Wd=3000,r=mulberry(7000+h.min*13+h.idx);
  const L=newL({id:h.id,name:h.name,sub:'Lv.'+h.min+'~'+(h.min+18)+' · '+h.sub,theme:h.theme,music:h.idx?'sky':'field',w:Wd,h:540,mscale:h.ms,allHue:h.hue||0,hunt:1,jh:1,spawn:{x:140,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));
  const LAY=[[[360,[[220,560],[1000,520],[1760,600]]],[255,[[520,520],[1360,480],[2140,520]]],[150,[[840,440],[1700,460]]]],
             [[370,[[140,640],[1060,700],[2000,640]]],[265,[[400,460],[1300,420],[2120,500]]],[160,[[760,520],[1660,560]]]]];
  const tiers=LAY[h.idx%2],gr=h.mobs.filter(k=>!MOBS[k].fly),fl=h.mobs.filter(k=>MOBS[k].fly);let gi=0,fi=0;
  const G1=()=>gr.length?gr[(gi++)%gr.length]:'egg',F1=()=>fl.length?fl[(fi++)%fl.length]:'wisp';
  for(const[y,list]of tiers)for(const[x,w]of list){
    L.plats.push(plat(x,y,w,16,'o'));L.ropes.push({x:x+40+Math.round(r()*(w-80)),y1:y,y2:gy});
    const n=w>=520?2:1;for(let k=0;k<n;k++){const mx=x+40+(w-80)*(k+.5)/n;L.mobs.push([G1(),mx,y,x+12,x+w-12])}
  }
  for(let k=0;k<7;k++){const x=340+k*360;L.mobs.push([G1(),x,gy,x-160,x+160])}
  for(let k=0;k<4;k++)L.mobs.push([F1(),520+k*600,210+(k%2)*70,90]);
  // 슈퍼점프 전용 하늘 발판 (보물상자)
  const top=tiers[2][1][0],sx=top[0]+top[1]/2;
  const hy=tiers[2][0]-120;L.plats.push(plat(sx-70,hy,140,14,'o',{cloud:1}));
  L.npcs=[{id:'chest',name:'하늘 보물상자',x:sx,gy:hy,look:'chest',town:h.id}];
  const prev=h.idx?d.hunts[0]:null,next=h.idx?null:d.hunts[1];
  L.portals=[{x:60,y:gy,to:prev?prev.id:d.id,label:'← '+(prev?prev.name:d.name)}];
  L.portals.push(next?{x:Wd-70,y:gy,to:next.id,label:next.name+' →',lockLv:next.min}:{x:Wd-70,y:gy,to:d.id,label:d.name+' →'});
  L.sign={x:230,y:gy,t:h.name,s:'Lv.'+h.min+'~'};
  return L;
}
for(const d of JTOWNS){MAPS[d.id]=()=>buildJobTown(d);for(const h of d.hunts)MAPS[h.id]=()=>buildJobHunt(h)}

/* ---------- 랜드마크 (배경 건물) ---------- */
function drawLandmark(g,L,t){
  const m=L.landmark;if(!m)return;const x=m.x,gy=m.y;
  const box=(x0,y0,w,h,c,rad)=>{g.beginPath();g.roundRect(x0,y0,w,h,rad||6);g.fillStyle=c;g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke()};
  const winRow=(x0,y0,n,c)=>{for(let i=0;i<n;i++){g.beginPath();g.roundRect(x0+i*30,y0,18,24,[9,9,2,2]);g.fillStyle=c;g.fill();g.lineWidth=2;g.stroke()}};
  g.save();
  if(m.k==='castle'){
    box(x-130,300,260,gy-300,'#d8e8c8');for(let i=0;i<6;i++)box(x-130+i*45,284,26,20,'#c8dcb8',3);
    box(x-80,165,160,135,'#e4f0d8');for(let i=0;i<4;i++)box(x-80+i*42,150,24,18,'#d4e4c4',3);
    winRow(x-62,200,4,'#9ae0a8');winRow(x-100,340,7,'#9ae0a8');
    g.beginPath();g.roundRect(x-26,gy-80,52,80,[26,26,0,0]);g.fillStyle='#6a4a2a';g.fill();g.stroke();
    g.fillStyle='#3fae49';poly(g,[x,96,x+30,108,x,120],'#3fae49',O_,2);g.fillStyle='#6a4a2a';g.fillRect(x-2,96,4,56);
  }else if(m.k==='tree'){
    g.fillStyle='#9a6a3a';g.beginPath();g.moveTo(x-60,gy);g.quadraticCurveTo(x-40,300,x-50,120);g.lineTo(x+50,120);g.quadraticCurveTo(x+40,300,x+60,gy);g.closePath();g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke();
    for(const[cx,cy,r]of[[x-120,140,80],[x+110,130,90],[x,70,100],[x-170,230,60],[x+170,230,60]]){circ(g,cx,cy,r,'#7acb5a',O_,3);circ(g,cx-r*.3,cy-r*.3,r*.4,'rgba(255,255,255,.18)')}
    for(let i=0;i<9;i++)circ(g,x-150+i*38,120+Math.sin(i*1.7)*60,7,'#ff8a1f',O_,1.5);
    g.beginPath();g.roundRect(x-22,gy-70,44,70,[22,22,0,0]);g.fillStyle='#5a3a1a';g.fill();g.stroke();
    circ(g,x+70,380,26,'#fff',O_,2);circ(g,x+70,380,17,'#ff6a5a');circ(g,x+70,380,8,'#fff');circ(g,x+70,380,3,'#ff6a5a');
  }else if(m.k==='fort'){
    poly(g,[x-240,gy,x-150,250,x-60,180,x+40,150,x+150,230,x+240,gy],'#c8d0e8',O_,3);
    poly(g,[x-60,180,x-20,170,x+40,150,x+10,195],'#ffffff');poly(g,[x+150,230,x+120,240,x+100,215],'#ffffff');
    box(x-110,300,220,gy-300,'#e8ecf8');for(let i=0;i<5;i++)box(x-110+i*50,284,30,20,'#d8dcf0',3);
    winRow(x-90,330,6,'#a8d8ff');g.beginPath();g.roundRect(x-28,gy-84,56,84,[28,28,0,0]);g.fillStyle='#5a6a90';g.fill();g.stroke();
    g.fillStyle='#e83a3a';g.fillRect(x-2,120,4,60);poly(g,[x+2,120,x+34,132,x+2,144],'#e83a3a',O_,2);
  }else if(m.k==='tower'){
    const gr=g.createLinearGradient(0,60,0,gy);gr.addColorStop(0,'#c8b0ff');gr.addColorStop(1,'#8a6ad0');
    g.beginPath();g.moveTo(x-90,gy);g.lineTo(x-70,170);g.lineTo(x+70,170);g.lineTo(x+90,gy);g.closePath();g.fillStyle=gr;g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke();
    poly(g,[x-90,170,x,40,x+90,170],'#5a3a9a',O_,3);
    for(let k=0;k<3;k++){const a=t*.8+k*2.1;g.fillStyle='#fff6a0';g.font='16px sans-serif';g.textAlign='center';g.fillText('✦',x+Math.cos(a)*120,110+Math.sin(a)*40)}
    const sg=g.createRadialGradient(x,40,2,x,40,30);sg.addColorStop(0,'rgba(255,250,180,.9)');sg.addColorStop(1,'rgba(255,250,180,0)');g.fillStyle=sg;g.fillRect(x-30,10,60,60);
    for(let k=0;k<4;k++){g.beginPath();g.arc(x,200+k*62,14,0,6.28);g.fillStyle=k%2?'#fff4a0':'#a8e0ff';g.fill();g.lineWidth=2;g.stroke()}
    g.beginPath();g.roundRect(x-24,gy-72,48,72,[24,24,0,0]);g.fillStyle='#3a2a6a';g.fill();g.stroke();
  }else if(m.k==='volcano'){
    poly(g,[x-300,gy,x-80,150,x+80,150,x+300,gy],'#a85a4a',O_,3);
    poly(g,[x-80,150,x-50,190,x-10,170,x+30,195,x+80,150],'#ff7a3a',O_,2);
    for(let i=0;i<4;i++){const k=(t*.4+i/4)%1;g.globalAlpha=(1-k)*.6;circ(g,x-30+i*20+Math.sin(k*6+i)*10,140-k*120,14+k*20,'#ffffff');g.globalAlpha=1}
    box(x-120,300,240,gy-300,'#f4e0d0');winRow(x-96,330,7,'#ffd0a0');
    g.beginPath();g.ellipse(x+160,gy-8,90,16,0,0,6.28);g.fillStyle='#8ad8ff';g.fill();g.lineWidth=2.4;g.stroke();
    for(let i=0;i<3;i++){const k=(t*.5+i/3)%1;g.globalAlpha=(1-k)*.5;circ(g,x+130+i*30,gy-20-k*60,8+k*10,'#ffffff');g.globalAlpha=1}
  }else if(m.k==='alley'){
    circ(g,x+20,110,60,'#fff6d0',O_,2);circ(g,x+40,100,52,'rgba(60,40,90,.0)');
    const mg=g.createRadialGradient(x+20,110,20,x+20,110,140);mg.addColorStop(0,'rgba(255,240,200,.35)');mg.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=mg;g.fillRect(x-130,-40,300,300);
    box(x-120,300,240,gy-300,'#4a3a6a');poly(g,[x-150,300,x-90,262,x+90,262,x+150,300],'#2a1a4a',O_,3);
    box(x-80,165,160,95,'#5a4a7a');poly(g,[x-110,165,x-60,128,x+60,128,x+110,165],'#2a1a4a',O_,3);
    for(let i=0;i<5;i++){const lx=x-100+i*50;g.strokeStyle=O_;g.lineWidth=1.4;g.beginPath();g.moveTo(lx,300);g.lineTo(lx,312);g.stroke();ell(g,lx,322,9,12,'#ff9a5a',O_,1.6)}
    winRow(x-62,190,4,'#ffd880');winRow(x-96,340,7,'#ffd880');
  }else if(m.k==='windmill'){
    box(x-90,300,180,gy-300,'#fff4d0');g.beginPath();g.moveTo(x-90,300);g.lineTo(x-60,165);g.lineTo(x+60,165);g.lineTo(x+90,300);g.closePath();g.fillStyle='#ffe8a0';g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke();
    poly(g,[x-70,165,x,110,x+70,165],'#c8a028',O_,3);
    g.save();g.translate(x,175);g.rotate(t*.6);for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.beginPath();g.roundRect(-8,-130,16,120,4);g.fillStyle='rgba(255,255,255,.9)';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke()}g.restore();
    circ(g,x,175,12,'#ffd34a',O_,2.4);winRow(x-66,330,5,'#a8e0ff');
    g.beginPath();g.roundRect(x-22,gy-70,44,70,[22,22,0,0]);g.fillStyle='#8a5a30';g.fill();g.lineWidth=3;g.stroke();
  }else if(m.k==='bell'){
    box(x-100,300,200,gy-300,'#ffffff');box(x-70,165,140,135,'#fffaf0');poly(g,[x-90,165,x,70,x+90,165],'#f0d080',O_,3);
    const sw=Math.sin(t*2)*.25;g.save();g.translate(x,200);g.rotate(sw);g.beginPath();g.moveTo(-24,40);g.quadraticCurveTo(-24,0,0,0);g.quadraticCurveTo(24,0,24,40);g.closePath();g.fillStyle='#ffd34a';g.fill();g.lineWidth=2.6;g.strokeStyle=O_;g.stroke();circ(g,0,42,5,'#c89a20',O_,1.6);g.restore();
    winRow(x-80,340,6,'#bfe8ff');g.beginPath();g.roundRect(x-24,gy-76,48,76,[24,24,0,0]);g.fillStyle='#c8a050';g.fill();g.lineWidth=3;g.stroke();
    g.fillStyle='#ffd34a';g.fillRect(x-3,40,6,34);g.fillRect(x-14,50,28,6);
  }else if(m.k==='temple'){
    for(let i=0;i<Math.ceil(L.w/420);i++){const px=200+i*420;g.globalAlpha=.55;
      g.fillStyle='#fff8e8';g.fillRect(px-26,120,52,gy-120);g.strokeStyle='rgba(180,150,90,.6)';g.lineWidth=2;g.strokeRect(px-26,120,52,gy-120);
      for(let k=0;k<4;k++){g.beginPath();g.moveTo(px-14+k*9,124);g.lineTo(px-14+k*9,gy);g.stroke()}
      g.fillStyle='#f4e4c0';g.fillRect(px-40,104,80,18);g.fillRect(px-36,gy-18,72,18);g.globalAlpha=1}
    const sg=g.createRadialGradient(L.w/2,40,10,L.w/2,40,260);sg.addColorStop(0,'rgba(255,240,180,.5)');sg.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=sg;g.fillRect(L.w/2-260,-220,520,520);
  }
  g.restore();
}
const _drawBGJ=drawBG;
drawBG=function(g,bg,cx,cy,ex){_drawBGJ(g,bg,cx,cy,ex);if(G.state!=='title'&&S&&S.L&&S.L.landmark){g.save();g.translate(-Math.round(S.cam.x),-Math.round(S.cam.y));drawLandmark(g,S.L,G.t);g.restore()}};

/* ---------- 보물상자 (하루 1번) · NPC 모습 ---------- */
function drawChest(g,n,t){
  const x=n.x,y=n.gy,open=SAVE.flags['chest_'+n.town]===dayNum(),b=open?0:Math.sin(t*3)*1.5;
  if(!open){const gl=g.createRadialGradient(x,y-14,2,x,y-14,46);gl.addColorStop(0,'rgba(255,230,120,.55)');gl.addColorStop(1,'rgba(255,230,120,0)');g.fillStyle=gl;g.fillRect(x-46,y-60,92,92)}
  g.beginPath();g.roundRect(x-20,y-24+b,40,24,4);g.fillStyle='#b8783a';g.fill();g.lineWidth=2.4;g.strokeStyle=O_;g.stroke();
  g.save();g.translate(x-20,y-24+b);if(open)g.rotate(-.7);g.beginPath();g.roundRect(0,-12,40,14,[8,8,2,2]);g.fillStyle='#d8904a';g.fill();g.stroke();g.restore();
  g.fillStyle='#ffd34a';g.fillRect(x-3,y-26+b,6,10);g.strokeRect(x-3,y-26+b,6,10);
  if(!open)for(let i=0;i<3;i++){const a=t*2+i*2.1;g.fillStyle='#fff7a0';g.font='12px sans-serif';g.textAlign='center';g.fillText('✦',x+Math.cos(a)*30,y-30+Math.sin(a)*14)}
}
const _drawNPCJ=drawNPC;
drawNPC=function(g,n,t,mark,f){if(n.look==='chest'){drawChest(g,n,t);return}return _drawNPCJ(g,n,t,mark,f)};
function openChest(n){
  const k='chest_'+n.town;
  if(SAVE.flags[k]===dayNum()){openDialog(n.name,'텅 비었다… 내일 다시 채워진다고 한다.',[{t:'닫기',fn:closeUI}]);return}
  SAVE.flags[k]=dayNum();const coin=200+SAVE.lvl*30,ec=SAVE.lvl>=30?2:1;addCoins(coin);SAVE.ec=(SAVE.ec||0)+ec;SAVE.potions.hp+=3;SAVE.potions.mp+=3;
  const ex=Math.round(need(SAVE.lvl)*.04);gainExp(ex);saveGame();sfx('levelup');spark(n.x,n.gy-20,30,'#ffe9a0',260,.8,4,0,true);
  openDialog(n.name,'슈퍼점프로만 닿는 높은 곳의 상자를 열었다!\n\n● '+coin+' 코인 · ◆ '+ec+' 이벤트 코인\nHP·MP 물약 각 3개 · 경험치 +'+ex+'\n\n(상자는 매일 다시 채워진다)',[{t:'좋아!',fn:closeUI}]);
}

/* ---------- 대화 ---------- */
function jobTownTaxi(d,free){const c=free?0:150;if(SAVE.coins<c){G.toast('코인이 부족해요 ('+c+'●)');return}SAVE.coins-=c;closeUI();sfx('portal');goMap(d.id);G.toast(d.name+'(으)로 출발!')}
function guideMenu(n){
  const mine=JT_OF(SAVE.job);
  const opts=[{t:'⭐ 내 직업 마을 「'+mine.name+'」 로 데려다줘 (무료)',fn:()=>jobTownTaxi(mine,true)}];
  for(const d of JTOWNS)if(d!==mine)opts.push({t:JOB[d.job].role+'의 마을 「'+d.name+'」 — 150●',fn:()=>jobTownTaxi(d,false)});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,'모험가는 Lv.10 이 되면 자기 직업 마을에서 1차 전직을 해!\n'+JOB[SAVE.job].role+'인 너는 「'+mine.name+'」 의 교관을 찾아가.\n\n· 마을마다 분위기가 다른 사냥터가 2곳씩 있어.\n· 2차 전직을 하면 공중에서 한 번 더 뛰는 슈퍼점프를 배워. 높은 곳의 보물상자를 찾아봐!',opts);
}
const _talkNPCJ=talkNPC;
talkNPC=function(n){
  if(n.id==='jguide'){if(!SAVE.talked[n.id]){SAVE.talked[n.id]=1;qev('talk',{})}return guideMenu(n)}
  if(n.id==='chest')return openChest(n);
  if(n.id==='jtm'){const d=JTOWNS.find(x=>x.id===n.town),mine=JT_OF(SAVE.job);
    return openDialog(n.name,'어서 와! 여긴 '+JOB[d.job].role+'들의 마을 「'+d.name+'」이야.\n너는 '+JOB[SAVE.job].role+'구나! 네 전직 교관은 「'+mine.name+'」 에 있어.\n\n구경은 얼마든지 해도 좋아. 사냥터도 마음껏 써!',[{t:'내 직업 마을로 데려다줘 (무료)',fn:()=>jobTownTaxi(mine,true)},{t:'닫기',fn:closeUI}])}
  if(n.id==='jlocal'){if(!SAVE.talked['jl_'+n.town]){SAVE.talked['jl_'+n.town]=1;qev('talk',{})}const d=JTOWNS.find(x=>x.id===n.town);n.li=((n.li|0)+1)%d.local.lines.length;
    return openDialog(n.name,d.local.lines[n.li],[{t:'또 얘기해줘',fn:()=>talkNPC(n)},{t:'닫기',fn:closeUI}])}
  return _talkNPCJ(n);
};
// 1차 전직 교관 : 내 직업 마을에서
ADV_INFO.coach.place='내 직업 마을';
const _advMenuJ=advMenu;
advMenu=function(n){
  if(n.id!=='coach')return _advMenuJ(n);
  if(!S.L.jt){return guideMenu(n)}
  const a=ADV_INFO.coach,j=JOB[SAVE.job],opts=[],st=qst('j1').s;
  if(st!=='none'||qAvail('j1'))opts.push({t:({none:'[!] ',active:'[진행중] ',ready:'[완료!] ',done:'[끝] '})[st]+QUESTS.j1.name,fn:()=>questDetail(n,'coach','j1')});
  opts.push({t:'내 직업 · 스킬 보기',fn:()=>jobInfoDialog(n)});opts.push({t:'닫기',fn:closeUI});
  let msg='현재: '+jline(j,SAVE.tier)+' ('+SAVE.tier+'차)\n\n';
  if(SAVE.tier>=1)msg+='이미 1차 전직을 마쳤구나! 2차 전직은 Lv.30, 도깨비 숲 꼭대기의 스승에게 가라.\n2차가 되면 공중에서 한 번 더 뛰는 「슈퍼점프」를 쓸 수 있다!';
  else if(SAVE.lvl<ADV_LV[1])msg+='1차 전직은 Lv.'+ADV_LV[1]+' 부터다. (현재 Lv.'+SAVE.lvl+')\n옆 사냥터에서 조금 더 수련하고 와!';
  else msg+='준비가 됐군. '+j.role+'의 길에 들어설 시험을 받아보겠나?';
  openDialog(n.name,'「'+JT_OF(SAVE.job).name+'」 의 '+j.role+' 교관이다!\n'+msg,opts);
};

/* ---------- 택시 · 포탈 지기 메뉴에 직업 마을 추가 ---------- */
const _taxiDestsJ=taxiDests;
taxiDests=function(){
  const d=_taxiDestsJ(),mine=JT_OF(SAVE.job),add=[{id:mine.id,n:'⭐ 내 직업 마을 · '+mine.name,c:0}];
  for(const t of JTOWNS)if(t!==mine)add.push({id:t.id,n:'🏰 '+t.name+' ('+JOB[t.job].role+')',c:150});
  for(const t of JTOWNS)for(const h of t.hunts)add.push({id:h.id,n:'🌿 '+h.name+'  (Lv.'+h.min+'~ · '+t.name+')',c:100+h.min*6,min:h.min});
  return d.slice(0,2).concat(add.filter(x=>x.id!==S.id),d.slice(2));
};
