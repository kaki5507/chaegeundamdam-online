/* ============================================================
   HUNT : 사냥터 5곳 · 몬스터 리젠 · 던전 나가기 · 스킬 이펙트/모션
   ============================================================ */
/* ---------- 사냥터 ---------- */
const HUNTS=[
 {id:'h1',name:'꽃잎 언덕',lv:'Lv.5~15',min:5,theme:'forest',ms:1,hue:0,sub:'벚꽃잎이 흩날리는 첫 사냥터',mobs:['bunny','egg']},
 {id:'h2',name:'반딧불 숲',lv:'Lv.12~25',min:12,theme:'bamboo',ms:2,hue:80,sub:'밤마다 반딧불이 춤추는 대나무 숲',mobs:['bunny','egg','wisp']},
 {id:'h6',name:'무지개 폭포',lv:'Lv.20~35',min:20,theme:'sea',ms:3,hue:170,sub:'물보라에 무지개가 걸리는 폭포 아래',mobs:['egg','bunny','jelly']},
 {id:'h3',name:'솜사탕 구름 목장',lv:'Lv.30~45',min:30,theme:'sky',ms:4.5,hue:300,sub:'구름 양떼가 뛰노는 하늘 목장',mobs:['sheep','jelly']},
 {id:'h7',name:'사탕 동굴',lv:'Lv.40~55',min:40,theme:'mask',ms:6,hue:330,sub:'달콤한 사탕 종유석이 반짝이는 동굴',mobs:['sheep','egg','owl']},
 {id:'h4',name:'별빛 호수',lv:'Lv.50~65',min:50,theme:'night',ms:7.5,hue:200,sub:'별이 내려앉은 고요한 호숫가',mobs:['jelly','owl','sheep']},
 {id:'h8',name:'오로라 설원',lv:'Lv.60~75',min:60,theme:'snow',ms:9,hue:180,sub:'오로라가 춤추는 하얀 눈밭',mobs:['sheep','owl']},
 {id:'h5',name:'달그림자 계곡',lv:'Lv.70~',min:70,theme:'origin',ms:11,hue:260,sub:'꿈과 현실의 경계, 가장 깊은 계곡',mobs:['owl','jelly','sheep']},
];
function buildHunt(i){
  const H=HUNTS[i],gy=470,Wd=2800,r=mulberry(4000+i*17);
  const L=newL({id:H.id,name:H.name,sub:H.lv+' · '+H.sub,theme:H.theme,music:i>=3?'sky':'field',w:Wd,h:540,mscale:H.ms,mhue:H.hue,hunt:i+1,spawn:{x:140,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));
  // 메이플식 층 구조 : 긴 발판 + 밧줄
  const LAYOUTS=[[[360,[[260,520],[960,560],[1700,620]]],[250,[[560,520],[1300,560],[2020,520]]],[140,[[880,460],[1640,480]]]],
    [[370,[[160,700],[1100,700],[2000,600]]],[270,[[420,500],[1250,420],[1900,520]]],[170,[[700,600],[1500,640]]],[90,[[1100,420]]]],
    [[360,[[120,420],[700,480],[1300,480],[1900,520]]],[260,[[380,560],[1100,600],[1850,560]]],[150,[[640,520],[1420,600]]]]];
  const tiers=LAYOUTS[i%3];
  for(const[y,list]of tiers)for(const[x,w]of list){
    L.plats.push(plat(x,y,w,16,'o'));
    L.ropes.push({x:x+40+Math.round(r()*(w-80)),y1:y,y2:gy});
    const n=w>=540?2:1;for(let k=0;k<n;k++){const mx=x+40+(w-80)*(k+.5)/n;L.mobs.push(['egg',mx,y,x+12,x+w-12])}
  }
  for(let k=0;k<7;k++){const x=320+k*340;L.mobs.push(['egg',x,gy,x-150,x+150])}
  for(let k=0;k<4;k++)L.mobs.push(['wisp',500+k*560,200+(k%2)*60,90]);
  L.portals=[{x:60,y:gy,to:i?HUNTS[i-1].id:'town',label:i?'← '+HUNTS[i-1].name:'← 야채마을'}];
  if(i<HUNTS.length-1)L.portals.push({x:Wd-70,y:gy,to:HUNTS[i+1].id,label:HUNTS[i+1].name+' →',lockLv:HUNTS[i+1].min});
  else L.portals.push({x:Wd-70,y:gy,to:'town',label:'야채마을 →'});
  L.sign={x:230,y:gy,t:H.name,s:H.lv};
  return L;
}
HUNTS.forEach((h,i)=>{MAPS[h.id]=()=>buildHunt(i)});
function drawHuntSign(g,L,t){
  const s=L.sign;if(!s)return;const x=s.x,y=s.y;
  g.fillStyle='#8a6040';g.fillRect(x-4,y-80,8,80);g.strokeStyle=O_;g.lineWidth=2;g.strokeRect(x-4,y-80,8,80);
  g.beginPath();g.roundRect(x-74,y-122,148,50,10);const gr=g.createLinearGradient(0,y-122,0,y-72);gr.addColorStop(0,'#fff6fd');gr.addColorStop(1,'#f0d8ff');g.fillStyle=gr;g.fill();g.lineWidth=2.5;g.stroke();
  txt(g,s.t,x,y-100,15,'#7a3a9a','center',0);txt(g,s.s,x,y-81,12,'#9a70c0','center',0);
  for(let k=0;k<3;k++)circ(g,x-60+k*60,y-122,3.5,['#ff9ad8','#ffe080','#a8e0ff'][k],O_,1);
}

/* ---------- 몬스터 리젠 (빠르게) ---------- */
const RESP_T=2.2;
function spawnTpl(i){
  const L=S.L,m=L.mobs[i];if(!m)return null;let mob;
  const fire=Object.assign(L.theme==='lava'?{col:'rgba(255,140,60,',col2:'#ff9a40',col3:'#c03010'}:{},L.mhue?{hue:L.mhue}:{});
  if(m[0]==='egg')mob=spawnMob('egg',m[1],m[2],Object.assign({min:m[3],max:m[4]},L.mhue?{hue:L.mhue}:{}));
  else mob=spawnMob('wisp',m[1],m[2],Object.assign({range:m[3]},fire));
  if(mob)mob.tpl=i;return mob;
}
function respawnStep(dt){
  if(!S.resp)S.resp=[];
  for(const m of S.mobs)if(m.dead&&m.tpl!=null&&!m.queued){m.queued=1;S.resp.push({i:m.tpl,t:RESP_T*(S.L.hunt?.8:1)})}
  for(const r of S.resp)r.t-=dt;
  const ready=S.resp.filter(r=>r.t<=0);S.resp=S.resp.filter(r=>r.t>0);
  for(const r of ready){const m=spawnTpl(r.i);if(m){spark(m.x,m.y-14,12,'#fff0ff',160,.5,3,0,true);m.flash=.3}}
}

/* ---------- 던전 · 사냥 맵 나가기 ---------- */
function addExitPortal(L){
  if(L.town||L.pvp||L.hunt||L.noExit)return;
  L.portals.push({x:Math.max(40,(L.spawn?L.spawn.x:100)-70),y:L.spawn?L.spawn.y:470,to:'__exit',label:'↩ 나가기',exit:true});
}
function exitDungeon(){
  const busy=(S.boss&&!S.boss.dead)||(S.dg&&!S.dg.done)||S.L.pq||S.L.altarMap&&S.boss;
  const go=()=>{closeUI();if(S.L.pq){G.pqRun=null}if(S.pvp)S.pvp.over=true;returnTown()};
  if(busy){openDialog('던전 나가기','지금 나가면 이 던전의 진행 상황이 사라져요.\n(보스 체력 · 웨이브 · 파티퀘스트 단계)\n\n정말 나갈까요?',[{t:'나가기',fn:go},{t:'계속 싸우기',fn:closeUI}]);return}
  go();
}

/* ---------- 스킬 이펙트 · 모션 ---------- */
const FX2=[];
const jobCol=p=>{const c=JOB[p.job];return c.fx||c.col||'#ffd34a'};
function fxPush(o){FX2.push(Object.assign({t:0},o));if(FX2.length>120)FX2.shift()}
const _castSkill=castSkill;
castSkill=function(p,i){
  const cd=p.cds[i];_castSkill(p,i);
  if(p.cds[i]>cd){ // 실제로 발동했을 때
    const col=jobCol(p),tier=SK_TIER[i];
    fxPush({k:'circle',x:p.x,y:p.y,col,max:.7,r:34+tier*8});
    fxPush({k:'pillar',x:p.x,y:p.y,col,max:.45});
    for(let k=0;k<3;k++)fxPush({k:'ring',x:p.x,y:p.y-18,col,max:.5,delay:k*.08,r:60+k*20});
    spark(p.x,p.y-20,16+tier*6,col,260,.6,3.2,-40,true);
    p.trailT=.45;S.shake=Math.max(S.shake,3+tier*2);
    if(tier>=2)G.flashT=.12,G.flashC=col;
    ftext(p.x,p.y-64,JOB[p.job].sk[i].n,'#fff',13,.9);
  }
};
const _doBasic=doBasic;
doBasic=function(p,I){_doBasic(p,I);const b=JOB[p.job].basic;
  if(b.k==='shoot')fxPush({k:'muzzle',x:p.x+p.face*16,y:p.y-22,col:jobCol(p),max:.15,f:p.face});
  else fxPush({k:'swing',x:p.x,y:p.y-20,col:jobCol(p),max:.22,f:p.face,r:(b.range||50)*.8});
};
const _dealDamage=dealDamage;
dealDamage=function(p,t,dmg,dir){_dealDamage(p,t,dmg,dir);try{const r=rectOf(t);fxPush({k:'hit',x:r.x+r.w/2+rnd(-6,6),y:r.y+r.h*.45+rnd(-6,6),col:p?jobCol(p):'#fff',max:.25,rot:Math.random()*6})}catch(e){}};
function fxStep(dt){
  for(const f of FX2)f.t+=dt;for(let i=FX2.length-1;i>=0;i--)if(FX2[i].t>FX2[i].max+(FX2[i].delay||0))FX2.splice(i,1);
  for(const p of PARTY){p.trailT=Math.max(0,(p.trailT||0)-dt);
    if(p.trailT>0||p.dashT>0){p.trail=p.trail||[];p.trail.push({x:p.x,y:p.y,f:p.face,st:p.atkT>0?'atk':'skill',a:.35});if(p.trail.length>6)p.trail.shift()}else if(p.trail&&p.trail.length)p.trail.shift()}
  for(const s of S.pshots)if(Math.random()<.7)parts.push({x:s.x+rnd(-3,3),y:s.y+rnd(-3,3),vx:-s.vx*.05,vy:rnd(-10,10),life:.3,max:.3,size:rnd(2,3.6),col:s.owner?jobCol(s.owner):'#fff',grav:0,glow:true});
  if(G.flashT>0)G.flashT-=dt;
}
function drawTrails(g,t){
  for(const p of PARTY){if(!p.trail||!p.trail.length)continue;
    p.trail.forEach((q,i)=>{g.save();g.globalAlpha=.08+i*.05;g.filter='brightness(1.6) saturate(1.4)';drawVeggie(g,JOB[p.job],{sc:WSC,fid:p.fid,x:q.x,y:q.y,face:q.f,t:p.t,st:q.st,eq:p.eq,tier:p.tier});g.restore()})}
}
function drawFX2(g,t){
  for(const f of FX2){const k=Math.max(0,f.t-(f.delay||0))/f.max;if(f.t<(f.delay||0))continue;const a=1-k;
    g.save();
    if(f.k==='circle'){g.translate(f.x,f.y);g.scale(1,.32);g.rotate(t*3);g.globalAlpha=a;g.strokeStyle=f.col;g.lineWidth=3;
      g.beginPath();g.arc(0,0,f.r*(.6+k*.5),0,6.28);g.stroke();g.lineWidth=1.6;g.beginPath();g.arc(0,0,f.r*(.42+k*.4),0,6.28);g.stroke();
      for(let i=0;i<6;i++){const an=i/6*6.28;g.save();g.rotate(an);g.fillStyle=f.col;g.fillRect(f.r*(.5+k*.45)-3,-3,6,6);g.restore()}
      g.globalCompositeOperation='lighter';g.globalAlpha=a*.35;const gr=g.createRadialGradient(0,0,0,0,0,f.r);gr.addColorStop(0,f.col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,f.r,0,6.28);g.fill()}
    else if(f.k==='pillar'){g.globalCompositeOperation='lighter';g.globalAlpha=a*.6;const w=20*(1-k*.5),gr=g.createLinearGradient(0,f.y-120,0,f.y);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,f.col);g.fillStyle=gr;g.fillRect(f.x-w/2,f.y-120,w,120)}
    else if(f.k==='ring'){g.globalAlpha=a*.8;g.strokeStyle='#fff';g.lineWidth=2.5*a+.5;g.beginPath();g.arc(f.x,f.y,f.r*k,0,6.28);g.stroke()}
    else if(f.k==='swing'){g.translate(f.x,f.y);g.scale(f.f,1);g.globalCompositeOperation='lighter';g.globalAlpha=a*.85;
      const a0=-1.6+k*2.4,gr=g.createRadialGradient(0,0,f.r*.4,0,0,f.r);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.8,f.col);gr.addColorStop(1,'rgba(255,255,255,.9)');
      g.fillStyle=gr;g.beginPath();g.arc(0,0,f.r,a0-1.2,a0);g.arc(0,0,f.r*.55,a0,a0-1.2,true);g.closePath();g.fill()}
    else if(f.k==='muzzle'){g.globalCompositeOperation='lighter';g.globalAlpha=a;g.translate(f.x,f.y);for(let i=0;i<5;i++){g.rotate(1.256);g.fillStyle=i%2?'#fff':f.col;g.fillRect(0,-1.5,10*a+4,3)}}
    else if(f.k==='hit'){g.translate(f.x,f.y);g.rotate(f.rot);g.globalCompositeOperation='lighter';g.globalAlpha=a;const s=8+k*14;
      g.fillStyle='#fff';g.beginPath();for(let i=0;i<8;i++){const an=i/8*6.28,rr=i%2?s*.35:s;g.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}g.closePath();g.fill();
      g.strokeStyle=f.col;g.lineWidth=2;g.beginPath();g.arc(0,0,s*1.2,0,6.28);g.stroke()}
    g.restore();
  }
  if(G.flashT>0){g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=G.flashT*1.4;g.fillStyle=G.flashC||'#fff';g.globalCompositeOperation='lighter';g.fillRect(0,0,9999,9999);g.restore()}
}
