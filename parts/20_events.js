/* ============================================================
   EVENTS : 2차 슈퍼점프 · 상단 버튼(파티퀘스트/이벤트) · 별의 신전(고렙) · 필드보스
            매일 20:00 축제 보스 레이드 · 20:30 명예의 전당 쟁탈전 · 명예 메달 교환
   ============================================================ */
/* ---------- 슈퍼점프 (2차 전직부터 공중에서 한 번 더) ---------- */
function superJump(p){
  p.sj=1;p.jbuf=0;p.sjUntil=performance.now()+380;p.vy=-Math.max(780,JOB[p.job].jump*1.22);sfx('jump');
  spark(p.x,p.y-6,14,'#bff0ff',220,.45,3,120,true);
  if(typeof fxPush==='function')fxPush({k:'ring',x:p.x,y:p.y-4,r:46,col:'#bff0ff',max:.35});
  S.fx.push({k:'ring',x:p.x,y:p.y,r:40,col:'rgba(190,240,255,.9)',t:0,max:.3});
  if(p===PARTY[0]&&!SAVE.flags.sjTip){SAVE.flags.sjTip=1;G.toast('2단 점프! 공중에서 점프를 한 번 더 — 높은 곳의 보물상자를 찾아봐요')}
}

/* ---------- 신규 장비 : 명예 무기 · 축제 레이드 · 필드보스 · 신전 ---------- */
Object.assign(GEAR,{
  g_hn_sword:{wt:'sword',n:'명예의 대파 검',gr:4,atk:30,hp:10,req:{lv:40,str:110}},
  g_hn_hammer:{wt:'twohand',n:'명예의 무 망치',gr:4,atk:36,hp:14,req:{lv:40,str:110}},
  g_hn_bow:{wt:'bow',n:'명예의 당근 장궁',gr:4,atk:35,spd:4,req:{lv:40,dex:110}},
  g_hn_staff:{wt:'staff',n:'명예의 양파 지팡이',gr:4,atk:35,mp:30,req:{lv:40,int:110}},
  g_hn_knuckle:{wt:'knuckle',n:'명예의 고추 너클',gr:4,atk:31,spd:4,req:{lv:40,str:110}},
  g_hn_dagger:{wt:'dagger',n:'명예의 가지 단검',gr:4,atk:28,spd:6,req:{lv:40,luk:110}},
  g_hn_gun:{wt:'gun',n:'명예의 옥수수 대포',gr:4,atk:35,req:{lv:40,dex:110}},
  g_hn_wand:{wt:'wand',n:'명예의 마늘 완드',gr:4,atk:29,mp:30,req:{lv:40,int:110}},
  g_hn_badge:{slot:'acc',n:'명예의 전당 휘장',gr:3,atk:8,hp:8,req:{lv:20}},
  g_rd_ring:{slot:'acc',n:'축제 보스의 반지',gr:3,atk:10,hp:10,req:{lv:20}},
  g_rd_cape:{slot:'armor',n:'축제 보스의 망토 갑옷',gr:3,atk:6,hp:24,req:{lv:25}},
  g_rd_star:{slot:'acc',n:'축제의 별 브로치',gr:4,atk:14,mp:20,spd:4,req:{lv:30}},
  g_fb_amulet:{slot:'acc',n:'필드 보스의 송곳니 목걸이',gr:2,atk:6,hp:6,req:{lv:15}},
  g_tp_ring:{slot:'acc',n:'별의 신전 성배 반지',gr:3,atk:12,hp:12,req:{lv:80}},
  g_tp_armor:{slot:'armor',n:'별의 신전 수호 갑주',gr:4,atk:12,hp:40,mp:20,req:{lv:85}},
});
for(const k in GEAR){const d=GEAR[k];if(d.wt)d.slot=WT[d.wt].lh?'lh':'rh'}
const HONOR_WEAP={warrior:'g_hn_sword',guardian:'g_hn_hammer',archer:'g_hn_bow',mage:'g_hn_staff',fighter:'g_hn_knuckle',rogue:'g_hn_dagger',gunner:'g_hn_gun',priest:'g_hn_wand'};
function giveGear(id,why){
  const d=GEAR[id];if(SAVE.ginv[id]){const c=[50,150,400,1200,3000][d.gr];SAVE.coins+=c;return'['+GRADE[d.gr]+'] '+d.n+' (중복 → '+c+'●)'}
  SAVE.ginv[id]=1;return'★ ['+GRADE[d.gr]+'] '+d.n+' 획득!'+(why?' ('+why+')':'');
}

/* ---------- 별의 신전 (Lv.80~) ---------- */
THEMES.temple={sun:1,sky:['#ffd890','#ffe8c0','#fff6e8','#ffffff'],moon:{x:.5,y:.16,r:52,c:'#fffbe0',glow:'rgba(255,236,170,'},
  layers:[{k:'clouds',col:'#fffaf0',base:.5,f:.05},{k:'ridge',col:'#f0dcb0',amp:40,base:.8,f:.12,cyc:[2,5,9]},{k:'clouds',col:'#fff4dc',base:.96,f:.3}],
  grass:'#fff0c8',grass2:'#d8b870',dirt:'#eadcbc',dirt2:'#c8b088',stone:'#e8dcc8',plank:'#e0c898',plank2:'#a88a58',fly:'#fff0a0'};
const TEMPLES=[
  {id:'tp1',name:'별의 신전 1층 · 기도의 회랑',min:80,ms:13,hue:30,mobs:['golem','lamp']},
  {id:'tp2',name:'별의 신전 2층 · 거울 서고',min:85,ms:16,hue:190,mobs:['golem','book']},
  {id:'tp3',name:'별의 신전 3층 · 별의 제단',min:90,ms:19,hue:290,mobs:['golem','book','lamp']},
];
function buildTemple(i){
  const T=TEMPLES[i],gy=470,Wd=3200,r=mulberry(9100+i*31);
  const L=newL({id:T.id,name:T.name,sub:'Lv.'+T.min+'~ · 잊혀진 별의 신전 — 가장 높은 곳의 사냥터',theme:'temple',music:'sky',w:Wd,h:540,mscale:T.ms,allHue:T.hue,hunt:1,temple:i+1,spawn:{x:140,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));L.landmark={k:'temple',x:0,y:gy};
  const tiers=[[365,[[200,520],[960,560],[1780,540],[2520,420]]],[260,[[480,460],[1300,520],[2140,480]]],[155,[[780,520],[1700,560]]]];
  const gr=T.mobs.filter(k=>!MOBS[k].fly),fl=T.mobs.filter(k=>MOBS[k].fly);let gi=0,fi=0;
  for(const[y,list]of tiers)for(const[x,w]of list){L.plats.push(plat(x,y,w,16,'o'));L.ropes.push({x:x+40+Math.round(r()*(w-80)),y1:y,y2:gy});
    const n=w>=500?2:1;for(let k=0;k<n;k++)L.mobs.push([gr[(gi++)%gr.length],x+40+(w-80)*(k+.5)/n,y,x+12,x+w-12])}
  for(let k=0;k<8;k++){const x=320+k*340;L.mobs.push([gr[(gi++)%gr.length],x,gy,x-150,x+150])}
  for(let k=0;k<5;k++)L.mobs.push([fl[(fi++)%fl.length],400+k*560,200+(k%2)*80,100]);
  L.plats.push(plat(1180,35,160,14,'o',{cloud:1}));L.npcs=[{id:'chest',name:'별의 성배 상자',x:1260,gy:35,look:'chest',town:T.id}];
  L.portals=[{x:60,y:gy,to:i?TEMPLES[i-1].id:'h5',label:'← '+(i?TEMPLES[i-1].name.split(' · ')[0]:'달그림자 계곡')}];
  L.portals.push(i<2?{x:Wd-70,y:gy,to:TEMPLES[i+1].id,label:TEMPLES[i+1].name.split(' · ')[0]+' →',lockLv:TEMPLES[i+1].min}:{x:Wd-70,y:gy,to:'town',label:'야채마을 →'});
  L.sign={x:230,y:gy,t:T.name.split(' · ')[1],s:'Lv.'+T.min+'~'};
  return L;
}
TEMPLES.forEach((T,i)=>{MAPS[T.id]=()=>buildTemple(i)});
{const _h5=MAPS.h5;MAPS.h5=()=>{const L=_h5();L.portals.push({x:L.w-260,y:470,to:'tp1',label:'별의 신전 (Lv.80)',lockLv:80});return L}}
const _taxiDestsE=taxiDests;
taxiDests=function(){const d=_taxiDestsE();if(S.id!=='tp1')d.push({id:'tp1',n:'🏛 잊혀진 별의 신전  (Lv.80~)',c:2000,min:80});return d};

/* ---------- 필드보스 (사냥터에 가끔 등장) ---------- */
function fieldBossStep(dt){
  const L=S.L;if(!L.hunt||L.raid||L.arenaEv)return;
  if(S.fbT==null)S.fbT=rnd(70,150)*(L.temple?.6:1);
  if(S.fb&&!S.fb.dead)return;S.fb=null;
  S.fbT-=dt;if(S.fbT>0)return;S.fbT=rnd(220,380)*(L.temple?.6:1);
  spawnFieldBoss();
}
function spawnFieldBoss(){
  const L=S.L,types=[...new Set(L.mobs.map(m=>m[0]).filter(k=>MOB_DRAW[k]&&!MOBS[k].fly))],type=types.length?types[(Math.random()*types.length)|0]:'bunny';
  const p=PARTY[0],x=clamp(p.x+(Math.random()<.5?-1:1)*rnd(300,500),200,L.w-200),sc=2.6,d=MOBS[type];
  const m=spawnMob(type,x,300,{min:160,max:L.w-160,fb:1,sc,chase:true,hue:L.allHue||L.mhue||0});
  m.w=Math.round(d.w*sc);m.h=Math.round(d.h*sc);m.hp=m.max=Math.round(d.hp*L.mscale*55);m.dmg=Math.round(m.dmg*2.2);
  m.exp=Math.max(m.exp*30,Math.round(need(SAVE.lvl)*.06));m.fbName='거대 '+d.n;S.fb=m;
  G.banner={t:0,name:'⚠ 필드 보스 출현!',sub:'「거대 '+d.n+'」 이(가) 나타났다! 함께 쓰러뜨리자!'};sfx('roar');S.shake=12;
  spark(x,300,40,'#ffd0f0',360,.8,5,0,true);if(typeof sysChat==='function')sysChat('[필드 보스] '+L.name+'에 거대 '+d.n+' 출현!');
}
const _killMobE=killMob;
killMob=function(m){
  if(m.type==='peer'){m.hp=m.max;return}
  _killMobE(m);
  if(m.fb){S.fb=null;S.fbT=rnd(220,380);const L=S.L;
    for(let i=0;i<6;i++)dropItem('coin',m.x+rnd(-40,40),m.y-30,Math.round((30+SAVE.lvl*4)*EV().drop));
    for(let i=0;i<3;i++)dropItem('vegbit',m.x+rnd(-30,30),m.y-30,1);
    const extra=[];if(Math.random()<.35*EV().drop)extra.push(giveGear('g_fb_amulet'));
    if(L.temple&&Math.random()<.25*EV().drop)extra.push(giveGear(Math.random()<.3?'g_tp_armor':'g_tp_ring'));
    SAVE.ec=(SAVE.ec||0)+1;G.banner={t:0,name:'필드 보스 격파!',sub:'◆ 이벤트 코인 +1'+(extra.length?'  ·  '+extra.join(' · '):'')};sfx('levelup');S.shake=20;saveGame();
  }else if(S.L.temple&&Math.random()<.004*EV().drop){const r=giveGear(Math.random()<.3?'g_tp_armor':'g_tp_ring');G.toast(r)}
};
const _drawBossBarE=drawBossBar;
drawBossBar=function(g){_drawBossBarE(g);const m=S&&S.fb;if(!m||m.dead||(S.boss&&!S.boss.dead))return;
  const x=W/2-170,y=50;panel(g,x-10,y-8,360,46,.7);txt(g,'⚠ 필드 보스 · '+m.fbName,x,y+10,16,'#ffb0e0');bar(g,x,y+16,340,14,m.hp/m.max,'#ff6ab0')};

/* ---------- 이벤트 상태 (서버 실시간) ---------- */
let EVLIVE=null,MYWID=null,EVPT='',RAIDQ=0,RAIDDMG=0,RAIDKEY=null,RAIDWIN=null,_rdT=0,EVLOCAL=null;
try{EVPT=localStorage.getItem('cgdd_team')||''}catch(e){}
const wsOK=()=>WSK&&WSK.readyState===1;
const kstMin=()=>Math.floor((Date.now()+(typeof SRVOFF==='number'?SRVOFF:0)+9*3600e3)/60000)%1440;
const evOpen=k=>!!(EVLIVE&&EVLIVE[k]&&EVLIVE[k].open)||!!(EVLOCAL&&EVLOCAL[k]);
function wsSend(o){if(wsOK())WSK.send(JSON.stringify(o))}
function evMsg(raw){
  let o;try{o=JSON.parse(raw)}catch(_){return}
  if(o.t==='you')MYWID=o.id;
  else if(o.t==='ev'){EVLIVE=o;const r=o.raid;
    if(S&&S.L&&S.L.raid&&r&&r.open&&S.boss&&!S.boss.dead){const b=S.boss;b.max=r.max;if(!b.dying)b.hp=Math.max(1,r.hp-RAIDQ);if(r.dead&&!b.dying){b.hp=0;bossDie(b)}}}
  else if(o.t==='raidEnd'){RAIDWIN=o;if(o.wid===MYWID)grantRaidItem(o.key);
    if(S&&S.L.raid&&S.boss&&!S.boss.dying&&!S.boss.dead){S.boss.hp=0;bossDie(S.boss)}
    else if(o.wid!==MYWID)G.toast('🐉 축제 보스 격파! 전리품은 '+o.winner+' 님에게!')}
  else if(o.t==='hurt'){const p=PARTY[0];if(!p||!S||!S.L.arenaEv||p.dead)return;const ok=hurtPlayer(p,o.d|0,p.x-(o.dir||1)*40,{kb:380+Math.min(400,(o.d/p.maxhp)*1200),up:320,inv:.25,stun:.18,pvp:1});if(ok&&p.dead)ftext(p.x,p.y-110,o.fname+' 에게 밀려났다!','#ffb0b0',15,1.4)}
  else if(o.t==='healed'){const p=PARTY[0];if(p&&!p.dead&&S&&S.L.arenaEv){healPlayer(p,p.maxhp*Math.min(.8,+o.v||0));ftext(p.x,p.y-96,o.fname+' 의 치유','#8affb0',13,1)}}
  else if(o.t==='arenaWin'){const me=(o.wids||[]).includes(MYWID);arenaWon(me,o.tname,o.names||[])}
}
function grantRaidItem(key){
  const k='raid_'+key;if(SAVE.flags[k])return;SAVE.flags[k]=1;
  const r=Math.random(),id=r<.15?'g_rd_star':r<.6?'g_rd_ring':'g_rd_cape',msg=giveGear(id,'축제 보스 전리품');saveGame();
  G.banner={t:0,name:'🎁 축제 보스 전리품 당첨!',sub:msg};sfx('levelup');
  if(typeof sysChat==='function')sysChat('🎁 축제 보스 전리품 당첨! '+msg);
}
function arenaWon(me,tname,names){
  if(me){SAVE.medal=(SAVE.medal||0)+1;saveGame();G.banner={t:0,name:'🏅 명예의 전당 우승!',sub:'명예 메달 +1  (보유 '+SAVE.medal+'개 · 10개 모으면 명예 무기!)'};sfx('levelup');
    const p=PARTY[0];if(p)spark(p.x,p.y-40,50,'#ffe9a0',360,1,5,0,true)}
  else G.banner={t:0,name:'🏛 '+tname+' 우승!',sub:names.slice(0,6).join(', ')+' — 다음 라운드를 노려요!'};
}

/* ---------- 이벤트 맵 : 축제 보스 레이드 ---------- */
const RAID_BOSS_N={dokkaebi:'도깨비 대왕',eggking:'킹 달걀 슬라임',fox:'구미호'};
MAPS.ev_raid=function(){
  const bid=(EVLIVE&&EVLIVE.raid&&EVLIVE.raid.boss)||(EVLOCAL&&EVLOCAL.boss)||'eggking',dead=EVLIVE&&EVLIVE.raid&&EVLIVE.raid.dead;
  const L=arenaBase({id:'ev_raid',name:'🐉 축제 보스 레이드',sub:'매일 20:00 · 모두 함께! 공격한 사람 중 한 명에게 전리품',theme:bid==='fox'?'night':'forest',music:'boss',boss:dead?null:bid,raid:1,dmul:1+SAVE.lvl/14});
  L.plats.push(plat(120,350,200,14,'o'),plat(960,350,200,14,'o'),plat(540,255,200,14,'o'));
  L.spawn={x:120+Math.random()*200|0,y:470};L.arena=false;return L;
};
const _mkBossE=mkBoss;
mkBoss=function(id){const b=_mkBossE(id);if(S.L.raid){b.name='[축제] 거대 '+b.name;b.raid=1;RAIDQ=0;
  const r=EVLIVE&&EVLIVE.raid;if(r&&r.open&&wsOK()){b.max=r.max;b.hp=r.hp;RAIDKEY=r.key}else{b.hp=b.max=Math.round(b.max*(3+SAVE.lvl/10));RAIDKEY='local'+dayNum()}RAIDDMG=0}return b};
const _hitBossE=hitBoss;
hitBoss=function(b,dmg,crit,p){
  if(!b.raid||!(EVLIVE&&EVLIVE.raid&&EVLIVE.raid.open&&wsOK()))return _hitBossE(b,dmg,crit,p);
  if(b.invuln||b.dying)return _hitBossE(b,dmg,crit,p);
  dmg=Math.round(dmg*(b.stun>0?1.35:1));b.hp=Math.max(1,b.hp-dmg);b.flash=.09;if(p===PARTY[0]||!p||p.kind==='ai'||p.kind==='p2')RAIDQ+=dmg;
  const r=rectOf(b),cx=r.x+r.w/2,cy=r.y+r.h*(.3+Math.random()*.4);
  ftext(cx+rnd(-20,20),r.y+10,dmg,crit?'#ffb040':'#fff',crit?28:20);sfx(crit?'crit':'hit');spark(cx,cy,crit?12:6,crit?'#ffb040':'#fff6c0',crit?280:180,.4);S.hitstop=Math.max(S.hitstop,crit?.07:.035);
};
const _bossFinishE=bossFinish;
bossFinish=function(b){
  if(!b.raid)return _bossFinishE(b);
  b.dead=true;const ex=Math.round(need(SAVE.lvl)*.25),cn=1500+SAVE.lvl*40;gainExp(ex);addCoins(cn);SAVE.ec=(SAVE.ec||0)+3;
  const online=!String(RAIDKEY||'').startsWith('local'),lines=['참가 보상: 경험치 +'+ex+' · '+cn+'● · ◆3'];
  if(!online)grantRaidItem(RAIDKEY);
  else if(RAIDWIN&&RAIDWIN.wid===MYWID)lines.push('🎁 전리품 당첨! (장비 창 확인)');
  else if(RAIDWIN)lines.push('전리품은 '+RAIDWIN.winner+' 님에게 돌아갔어요');
  saveGame();openDialog('축제 보스 격파!',lines.join('\n')+'\n\n내일 저녁 8시에 또 만나요!',[{t:'마을로',fn:()=>{closeUI();goMap('town')}},{t:'여기 있기',fn:closeUI}]);
};

/* ---------- 이벤트 맵 : 명예의 전당 쟁탈전 ---------- */
const HALL={x:1600,r:150};
MAPS.ev_arena=function(){
  const gy=470,Wd=3200,L=newL({id:'ev_arena',name:'🏛 명예의 전당 쟁탈전',sub:'매일 20:30 · 가운데 명예의 전당을 30초 지켜라! (같은 팀 코드끼리는 동료)',theme:'temple',music:'boss',w:Wd,h:540,arenaEv:1,noExit:true});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));
  L.plats.push(plat(560,370,200,14,'o'),plat(2440,370,200,14,'o'),plat(1040,300,180,14,'o'),plat(1980,300,180,14,'o'));
  const left=Math.random()<.5;L.spawn={x:Math.round(left?rnd(160,820):rnd(2380,3040)),y:gy};
  L.portals=[{x:left?60:Wd-60,y:gy,to:'__exit',label:'↩ 나가기',exit:true}];L.landmark={k:'none',x:0,y:gy};
  return L;
};
function drawHall(g,t){
  const x=HALL.x,gy=470,A=EVLIVE&&EVLIVE.arena,mine=A&&A.tkey&&A.tkey===myTeamKey(),con=A&&A.contested;
  const col=con?'255,120,120':mine?'120,255,170':A&&A.hold>0?'255,200,120':'255,240,180';
  const gl=g.createRadialGradient(x,gy,10,x,gy,HALL.r+40);gl.addColorStop(0,`rgba(${col},.45)`);gl.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gl;g.fillRect(x-HALL.r-40,gy-200,HALL.r*2+80,240);
  g.strokeStyle=`rgba(${col},.9)`;g.lineWidth=4;g.setLineDash([14,10]);g.lineDashOffset=-t*30;g.beginPath();g.ellipse(x,gy,HALL.r,22,0,0,6.28);g.stroke();g.setLineDash([]);
  // 전당 건물
  g.save();g.globalAlpha=.9;g.fillStyle='#fff8e8';g.strokeStyle=O_;g.lineWidth=3;
  poly(g,[x-170,gy-250,x,gy-320,x+170,gy-250],'#ffe0a0',O_,3);g.fillRect(x-160,gy-250,320,16);g.strokeRect(x-160,gy-250,320,16);
  for(let i=0;i<5;i++){const px=x-140+i*70;g.fillStyle='#fffaf0';g.fillRect(px-10,gy-234,20,234);g.strokeRect(px-10,gy-234,20,234)}g.restore();
  // 트로피
  const b=Math.sin(t*2)*4;g.save();g.translate(x,gy-150+b);
  const tg=g.createRadialGradient(0,0,4,0,0,60);tg.addColorStop(0,'rgba(255,240,150,.7)');tg.addColorStop(1,'rgba(255,240,150,0)');g.fillStyle=tg;g.fillRect(-60,-60,120,120);
  g.beginPath();g.moveTo(-26,-30);g.lineTo(26,-30);g.quadraticCurveTo(24,10,0,14);g.quadraticCurveTo(-24,10,-26,-30);g.fillStyle='#ffd34a';g.fill();g.lineWidth=2.6;g.strokeStyle=O_;g.stroke();
  for(const s of[-1,1]){g.beginPath();g.arc(s*28,-18,10,s>0?-1.6:1.6,s>0?1.6:4.7,s<0);g.stroke()}
  g.fillStyle='#ffd34a';g.fillRect(-6,14,12,16);g.strokeRect(-6,14,12,16);g.fillRect(-18,30,36,8);g.strokeRect(-18,30,36,8);
  txt(g,'★',0,-6,18,'#fff6c0','center',0);g.restore();
  txt(g,'명예의 전당',x,gy-268,16,'#8a5a10','center',0);
  if(A&&A.open&&A.hold>0){const k=Math.min(1,A.hold/30);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=8;g.beginPath();g.arc(x,gy-150,52,0,6.28);g.stroke();g.strokeStyle=con?'#ff7a7a':mine?'#7affb0':'#ffc070';g.beginPath();g.arc(x,gy-150,52,-1.57,-1.57+k*6.283);g.stroke()}
}
const myTeamKey=()=>EVPT?'p:'+EVPT:'s:'+MYWID;
// 다른 유저 → 공격 가능한 '그림자 표적' (실제 피해는 서버를 거쳐 상대에게)
function arenaSync(){
  const want={};
  for(const k in PEERS){const q=PEERS[k],p=q.tg;if(p.map!=='ev_arena'||p.dd||(EVPT&&p.pt===EVPT))continue;want[k]=q}
  S.mobs=S.mobs.filter(m=>m.type!=='peer'||want[m.pid]);
  for(const k in want){let m=S.mobs.find(x=>x.type==='peer'&&x.pid===k);
    if(!m){m={kind:'mob',type:'peer',pid:k,w:24,h:40,hp:1e9,max:1e9,dmg:0,vx:0,vy:0,kbx:0,dir:1,flash:0,dead:false,t:0,ph:0,exp:0,hitCD:0};S.mobs.push(m)}
    m.x=want[k].x;m.y=want[k].y;m.hp=m.max}
}
const _updateMobsE=updateMobs;
updateMobs=function(dt){if(!S.mobs.some(m=>m.type==='peer'))return _updateMobsE(dt);const pm=S.mobs.filter(m=>m.type==='peer');S.mobs=S.mobs.filter(m=>m.type!=='peer');_updateMobsE(dt);S.mobs.push(...pm)};
const _hitTargetE=hitTarget;
hitTarget=function(t,dmg,dir,crit,p,o){
  if(t.type!=='peer')return _hitTargetE(t,dmg,dir,crit,p,o);
  if(p&&p!==PARTY[0])return;
  const d=Math.max(1,Math.round(dmg*.5));wsSend({t:'hit',to:t.pid,d,dir});
  ftext(t.x,t.y-50,d,crit?'#ffb040':'#ffd0d0',crit?22:17);sfx(crit?'crit':'hit');spark(t.x,t.y-20,crit?12:7,'#fff0b0',220,.35);S.hitstop=Math.max(S.hitstop,.03);
};
const _castSkillE=castSkill;
castSkill=function(p,i){const r=_castSkillE(p,i);
  if(p===PARTY[0]&&S.L.arenaEv&&EVPT){const sk=JOB[p.job].sk[i];if(sk&&sk.k==='heal'&&p.cds[i]>0)for(const k in PEERS){const q=PEERS[k];if(q.tg.map==='ev_arena'&&q.tg.pt===EVPT&&Math.hypot(q.x-p.x,q.y-p.y)<520)wsSend({t:'heal',to:k,v:sk.m})}}
  return r};
const _drawPeersE=drawPeers;
drawPeers=function(g,t){_drawPeersE(g,t);if(!S.L.arenaEv)return;
  for(const k in PEERS){const q=PEERS[k],p=q.tg;if(p.map!=='ev_arena')continue;const ally=EVPT&&p.pt===EVPT;
    bar(g,q.x-18,q.y-50,36,5,(p.h==null?100:p.h)/100,ally?'#5ad87a':'#e8484f');if(p.pt)txt(g,(ally?'아군 ':'')+p.pt,q.x,q.y-56,10,ally?'#7aff9a':'#ffb0b0','center',2)}};

/* ---------- 이벤트 진행 (매 프레임) ---------- */
function eventStep(dt){
  if(WSK&&!WSK._ev){WSK._ev=1;WSK.addEventListener('message',e=>evMsg(e.data));if(WSK.readyState===1)wsSend({t:'whoami'})}
  if(S.L.arenaEv){arenaSync();if(!wsOK())localArenaStep(dt)}
  if(S.L.raid){_rdT-=dt;if(_rdT<=0&&RAIDQ>0&&wsOK()){_rdT=.25;wsSend({t:'rd',d:RAIDQ});RAIDDMG+=RAIDQ;RAIDQ=0}}
  if(G.state==='play'&&!G.ui&&!G.chatOpen){if(pressed.KeyL)pqMenu();else if(pressed.Digit8)eventMenu()}
}
// 서버 없이(로컬) 연습 : 혼자 30초 버티기
function localArenaStep(dt){
  if(!EVLOCAL||!EVLOCAL.arena)return;const p=PARTY[0],A=EVLIVE&&EVLIVE.arena&&EVLIVE.arena.local?EVLIVE.arena:null;
  if(!A){EVLIVE=Object.assign({},EVLIVE||{},{arena:{open:1,local:1,round:1,hold:0,tname:'',tkey:'',contested:false,brk:0}})}
  const a=EVLIVE.arena;if(a.done)return;
  if(!p.dead&&Math.abs(p.x-HALL.x)<HALL.r&&p.y>380){a.tkey=myTeamKey();a.tname='나';a.hold+=dt;if(a.hold>=30){a.done=1;G.banner={t:0,name:'연습 완료!',sub:'실제 이벤트(20:30, 온라인)에서 우승하면 명예 메달을 받아요'};sfx('levelup')}}
  else a.hold=Math.max(0,a.hold-dt*.5);
}
const _respawnStepE=respawnStep;
respawnStep=function(dt){_respawnStepE(dt);fieldBossStep(dt);eventStep(dt)};

/* ---------- 상단 버튼 : 파티퀘스트 · 이벤트 ---------- */
const HUDB=[{id:'pq',x:W-218,y:8,w:100,h:32,l:'👥 파티퀘스트',k:'L'},{id:'ev',x:W-112,y:8,w:102,h:32,l:'🎉 이벤트',k:'8'}];
function anyLive(){return evOpen('raid')||evOpen('arena')}
function drawHudButtons(g,t){
  for(const b of HUDB){const live=b.id==='ev'&&anyLive();
    g.save();if(live){const gl=g.createRadialGradient(b.x+b.w/2,b.y+b.h/2,4,b.x+b.w/2,b.y+b.h/2,70);gl.addColorStop(0,`rgba(255,200,120,${.35+.2*Math.sin(t*5)})`);gl.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=gl;g.fillRect(b.x-30,b.y-30,b.w+60,b.h+60)}
    g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,16);const gr=g.createLinearGradient(0,b.y,0,b.y+b.h);gr.addColorStop(0,b.id==='ev'?'#fff0f8':'#f4f0ff');gr.addColorStop(1,b.id==='ev'?'#ffc8e4':'#d8c8ff');g.fillStyle=gr;g.fill();g.lineWidth=2;g.strokeStyle=b.id==='ev'?'#e070b0':'#8a6ad0';g.stroke();
    txt(g,b.l,b.x+b.w/2-(b.k?6:0),b.y+21,13,b.id==='ev'?'#a0306a':'#5a3a9a','center',0);
    if(b.k){g.beginPath();g.roundRect(b.x+b.w-18,b.y+8,14,16,4);g.fillStyle='rgba(255,255,255,.75)';g.fill();txt(g,b.k,b.x+b.w-11,b.y+20,10,'#7a5a9a','center',0);}
    if(live){g.beginPath();g.roundRect(b.x+b.w-34,b.y-8,36,15,7);g.fillStyle='#ff4a6a';g.fill();txt(g,'LIVE',b.x+b.w-16,b.y+3,10,'#fff','center',0)}
    g.restore()}
}
function evCountdown(){
  const m=kstMin(),fmt=v=>{v=(v+1440)%1440;return v<60?v+'분':Math.floor(v/60)+'시간 '+(v%60)+'분'};
  if(evOpen('raid'))return'🐉 지금 축제 보스 레이드 진행 중!';if(evOpen('arena'))return'🏛 지금 명예의 전당 쟁탈전 진행 중!';
  return m<1200?'다음 이벤트: 보스 레이드까지 '+fmt(1200-m):m<1230?'다음 이벤트: 쟁탈전까지 '+fmt(1230-m):'다음 이벤트: 내일 보스 레이드까지 '+fmt(1200-m);
}
function pqMenu(){
  if(S.L.pq||S.L.raid||S.L.arenaEv||(S.boss&&!S.boss.dead)||S.dg){G.toast('지금은 파티퀘스트로 이동할 수 없어요');return}
  sfx('sel');
  openDialog('👥 파티퀘스트','파티원과 힘을 모아 도전하는 던전이에요. (AI 동료 · 2P 로컬 포함)\n현재 파티 '+PARTY.length+'명 · 마을의 파티 모집꾼에게서도 똑같이 할 수 있어요.',[
    {t:'🥚 달걀 슬라임 소굴  (Lv.6+ · 3명)',fn:()=>{if(SAVE.lvl<6){G.toast('Lv.6부터 입장할 수 있어요');return}enterPQ({name:'숨은 무녀'})}},
    {t:'👹 귀목의 제단 원정  (Lv.40+ · 귀문 동굴로)',fn:()=>{if(SAVE.lvl<40){G.toast('Lv.40부터 입장할 수 있어요');return}closeUI();sfx('portal');goMap('cave')}},
    {t:'🙋 파티원 모으기  (AI 동료 · 2P)',fn:()=>partyMenu({name:'파티 모집'})},
    {t:'닫기',fn:closeUI}]);
}
function eventMenu(){
  sfx('sel');const r=EVLIVE&&EVLIVE.raid,a=EVLIVE&&EVLIVE.arena,on=wsOK();
  let st=evCountdown();
  if(r&&r.open)st+=r.dead?'\n   오늘의 보스는 쓰러졌어요! (전리품: '+((RAIDWIN&&RAIDWIN.winner)||'?')+')':'\n   '+(RAID_BOSS_N[r.boss]||'보스')+' 체력 '+Math.ceil(r.hp/r.max*100)+'% · 참여 '+r.n+'명';
  if(a&&a.open&&!a.local)st+='\n   라운드 '+a.round+(a.tname?' · 점령: '+a.tname+' '+a.hold.toFixed(1)+'/30초':'');
  const opts=[];
  const busy=S.L.pq||(S.boss&&!S.boss.dead&&!S.L.raid)||S.dg;
  const go=(id)=>{if(busy){G.toast('던전 안에서는 이동할 수 없어요');return}closeUI();sfx('portal');goMap(id)};
  if(evOpen('raid')||!on)opts.push({t:(on?'🐉 축제 보스 레이드 입장':'🐉 보스 레이드 (서버 미연결 · 혼자 연습)'),fn:()=>{if(!on)EVLOCAL={raid:1,boss:['dokkaebi','eggking','fox'][dayNum()%3]};go('ev_raid')}});
  else opts.push({t:'🔒 보스 레이드 — 매일 20:00~20:25',fn:()=>G.toast('저녁 8시에 열려요!')});
  if(evOpen('arena')||!on)opts.push({t:(on?'🏛 명예의 전당 쟁탈전 입장':'🏛 쟁탈전 (서버 미연결 · 혼자 연습)'),fn:()=>{if(!on)EVLOCAL={arena:1};go('ev_arena')}});
  else opts.push({t:'🔒 명예의 전당 쟁탈전 — 매일 20:30~20:40',fn:()=>G.toast('저녁 8시 30분에 열려요!')});
  opts.push({t:'🤝 팀 코드: '+(EVPT||'(없음 · 개인전)')+'  — 바꾸기',fn:()=>{const v=(prompt('같은 팀 코드를 쓴 사람끼리 쟁탈전 동료가 돼요 (서로 공격 X, 힐 O)\n비워두면 개인전','')||'').trim().slice(0,10);EVPT=v;try{localStorage.setItem('cgdd_team',v)}catch(e){}eventMenu()}});
  opts.push({t:'🏅 명예 메달 교환소  (보유 '+(SAVE.medal||0)+'개)',fn:()=>medalShop({name:'명예 메달 교환소'})});
  opts.push({t:'닫기',fn:closeUI});
  openDialog('🎉 매일 저녁 이벤트 (한국 시간)','🐉 20:00~20:25  축제 보스 레이드 — 모두 함께 거대 보스를! 공격에 참여한 사람 중 한 명에게 랜덤 전리품, 참가자 전원 경험치·코인\n🏛 20:30~20:40  명예의 전당 쟁탈전 — 가운데 전당을 30초 지키면 우승! 같은 팀 코드끼리 힐 주며 함께 우승 가능 · 우승자 전원 명예 메달 1개\n\n'+st,opts);
}
function medalShop(n){
  const m=SAVE.medal||0,mine=HONOR_WEAP[SAVE.job],opts=[];
  const buy=(id,c)=>()=>{if((SAVE.medal||0)<c){G.toast('명예 메달이 부족해요 ('+c+'개 필요)');return}if(SAVE.ginv[id]){G.toast('이미 가지고 있어요');return}SAVE.medal-=c;const r=giveGear(id,'명예 메달 '+c+'개');saveGame();sfx('levelup');openDialog(n.name,r+'\n인벤토리(I) → 장비에서 착용하세요!',[{t:'뒤로',fn:()=>medalShop(n)},{t:'닫기',fn:closeUI}])};
  opts.push({t:'⭐ '+GEAR[mine].n+' (내 직업 · '+gearDesc(mine)+')  — 🏅10',fn:buy(mine,10)});
  opts.push({t:GEAR.g_hn_badge.n+' ('+gearDesc('g_hn_badge')+')  — 🏅3',fn:buy('g_hn_badge',3)});
  opts.push({t:'다른 직업 명예 무기 보기',fn:()=>openDialog(n.name,'명예 무기 (각 🏅10)',Object.values(HONOR_WEAP).filter(id=>id!==mine).map(id=>({t:GEAR[id].n+'  — 🏅10',fn:buy(id,10)})).concat([{t:'뒤로',fn:()=>medalShop(n)}]))});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,'명예의 전당 쟁탈전에서 우승하면 명예 메달을 1개 받아요.\n메달 10개로 그 직업 최고의 명예 무기와 바꿀 수 있어요!\n\n보유 명예 메달: 🏅 '+m+'개',opts);
}
NPC_LOOK_X.medalnpc={job:'warrior',eq:{hat:'hat_gat',outfit:'out_gold',cape:'cape_red'},n:'명예 메달 교환원',fid:5};
ROLE.medal='명예 메달 교환';
{const _tw=MAPS.town;MAPS.town=()=>{const L=_tw();L.npcs.push({id:'medal',name:'명예 메달 교환원',x:3580,gy:470,look:'medalnpc'});return L}}
const _talkNPCE=talkNPC;
talkNPC=function(n){if(n.id==='medal')return medalShop(n);return _talkNPCE(n)};

/* ---------- HUD ---------- */
const _drawHUDE=drawHUD;
drawHUD=function(g,t){_drawHUDE(g,t);if(!PARTY[0])return;drawHudButtons(g,t);
  if(S.L.arenaEv){const A=EVLIVE&&EVLIVE.arena;panel(g,W/2-200,8,400,58,.78);
    if(!A||!A.open){txt(g,'쟁탈전이 열리지 않았어요 (매일 20:30)',W/2,40,15,'#ffe9a0','center')}
    else if(A.brk>0)txt(g,'🏆 '+A.tname+' 우승! 다음 라운드 '+Math.ceil(A.brk)+'초',W/2,40,16,'#ffe04a','center');
    else{txt(g,'🏛 라운드 '+A.round+(A.contested?'  ⚔ 쟁탈 중!':A.tname?'  점령: '+A.tname:'  전당이 비어 있다!'),W/2,30,15,A.contested?'#ff9a9a':'#ffe9a0','center');
      bar(g,W/2-180,38,360,10,Math.min(1,(A.hold||0)/30),A.tkey===myTeamKey()?'#5ad87a':'#ffb040');txt(g,(A.hold||0).toFixed(1)+' / 30초   ·   내 팀: '+(EVPT||'개인'),W/2,62,11,'#cfd4e2','center',2)}}
  if(S.L.raid&&S.boss&&!S.boss.dead){const r=EVLIVE&&EVLIVE.raid;txt(g,(r&&r.open&&wsOK()?'참여 '+r.n+'명 · 내 피해 '+Math.round(RAIDDMG+RAIDQ):'혼자 연습 모드'),W/2,108,12,'#ffe9a0','center',2)}
};
// 전당 그리기 : 배경 랜드마크 단계 (캐릭터 뒤)
const _drawLandmarkE=drawLandmark;
drawLandmark=function(g,L,t){_drawLandmarkE(g,L,t);if(L.arenaEv)drawHall(g,t)};
// 이벤트 맵을 떠나면 연습 상태 초기화
const _loadMapE=loadMap;
loadMap=function(id,end){if(!/^ev_/.test(id)){EVLOCAL=null;if(EVLIVE&&EVLIVE.arena&&EVLIVE.arena.local)EVLIVE.arena={open:0}}S&&(S.fb=null);_loadMapE(id,end);S.fbT=null;S.fb=null};
// 상단 버튼 터치/클릭
cv.addEventListener('pointerdown',e=>{
  if(G.state!=='play'||G.ui||!S)return;const rc=cv.getBoundingClientRect(),x=(e.clientX-rc.left)*W/rc.width,y=(e.clientY-rc.top)*H/rc.height;
  for(const b of HUDB){if(b.admin&&!ISADMIN)continue;if(x>=b.x-6&&x<=b.x+b.w+6&&y>=b.y-8&&y<=b.y+b.h+12){e.preventDefault();initAudio();b.id==='adm'?adminMenu():b.id==='guide'?guideMenu2():b.id==='pq'?pqMenu():eventMenu();return}}
});
