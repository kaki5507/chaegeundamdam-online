/* ============================================================
   ENDGAME : 만렙 200 · Lv.120 궁극기(R, 화면 전체 공격) · 용의 요새(Lv.100~180 사냥터 5곳)
             용의 제단 → 「용의 각인석」으로 보스 방 소환 → 5인 파티 보스 「불멸의 용왕 아그니르」
             (결정 기믹 · 화염 숨결 · 유성 · 새끼 용 · 10분 분노) · 전리품은 공격한 사람 중 랜덤 1명
   ============================================================ */
/* ---------- 궁극기 ---------- */
const ULT={warrior:['천지 붕괴 대참','#ffe08a'],archer:['유성 화살 폭풍','#ffb060'],guardian:['대지의 심판','#c8e0ff'],mage:['은하 붕괴','#b8a0ff'],
  fighter:['태양 화염권','#ff7a30'],rogue:['천 개의 그림자','#c05aff'],gunner:['최후의 팝콘 포격','#ffd34a'],priest:['여명의 대축복','#fff6c0']};
for(const j in ULT)JOB[j].sk[5]={n:ULT[j][0],k:'ult',m:2.6,hits:3,mp:150,cd:45,col:ULT[j][1],desc:'Lv.120 궁극기 — 화면 안의 모든 적에게 3연타'+(j==='priest'?' · 파티 전원 완전 회복':'')};
let ULTFX=null;
SKX.ult=function(p,sk){
  sfx('boom');S.shake=Math.max(S.shake,22);if(p===PARTY[0])ULTFX={t0:G.t,n:sk.n,col:sk.col};
  const WZ=window.WZ||1,x0=S.cam.x-40,x1=S.cam.x+W/WZ+40,y0=S.cam.y-40,y1=S.cam.y+H/WZ+40;
  for(let k=0;k<sk.hits;k++)TQ.push({t:.25+k*.22,fn:()=>{if(p.dead)return;
    eachTarget(t=>{const r=rectOf(t),cx=r.x+r.w/2,cy=r.y+r.h/2;if(cx<x0||cx>x1||cy<y0||cy>y1)return;dealDamage(p,t,atkOf(p)*sk.m,sgn(cx-p.x)||p.face);
      spark(cx,cy,10,sk.col,260,.45,4,0,true);S.fx.push({k:'ring',x:cx,y:cy,r:50,t:0,max:.3,col:sk.col})},p);sfx('hit')}});
  if(p.job==='priest')for(const q of PARTY)if(!q.dead){q.hp=q.maxhp;q.mp=q.maxmp;spark(q.x,q.y-30,20,'#fff6c0',200,.6,4,0,true)}
};
function drawUltFX(g,t){
  if(!ULTFX)return;const k=G.t-ULTFX.t0;if(k>1.3){ULTFX=null;return}
  const a=k<.15?k/.15:Math.max(0,1-(k-.15)/1.15);g.save();g.globalAlpha=a*.45;g.fillStyle=ULTFX.col;g.fillRect(0,0,W,H);g.restore();
  g.save();g.globalAlpha=Math.min(1,a*1.6);g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,H/2-46,W,92);
  txt(g,ULTFX.n,W/2+(1-Math.min(1,k*4))*120,H/2+14,46,'#fff','center',6);g.restore();
}
// 퀵슬롯 R 칸
{const _sb=drawStatusBar;drawStatusBar=function(g,t){_sb(g,t);const p=PARTY[0];if(!p)return;const j=JOB[p.job],sk=j.sk[5],sw=44,x=816,y=H-58+9,ul=unlocked(p,5),cd=p.cds[5]||0;
  g.fillStyle='rgba(60,20,40,.7)';g.beginPath();g.roundRect(x,y,sw,sw,10);g.fill();g.strokeStyle=ul?'#ffd34a':'rgba(255,210,245,.4)';g.lineWidth=2;g.stroke();
  if(ul){circ(g,x+sw/2,y+sw/2,15,sk.col,O_,1.5);txt(g,'궁',x+sw/2,y+sw/2+5,13,'#3a1a00','center',0);
    if(cd>0){g.save();g.beginPath();g.roundRect(x,y,sw,sw,10);g.clip();g.fillStyle='rgba(10,0,30,.6)';g.fillRect(x,y+sw*(1-cd/sk.cd),sw,sw);g.restore();txt(g,Math.ceil(cd),x+sw/2,y+sw/2+5,13,'#fff','center',3)}}
  else txt(g,'120',x+sw/2,y+sw/2+5,12,'#998','center',0);
  txt(g,'R',x+5,y+12,10,'#ffe9a0','left',2)}}
cv.addEventListener('pointerdown',e=>{if(G.state!=='play'||G.ui||!S)return;const P=cvPos(e);if(inR(P,816,H-49,44,44)){e.preventDefault();pressed.KeyR=true;keys.KeyR=true;setTimeout(()=>{keys.KeyR=false},120)}});
// 폰 : 궁극기 버튼
{const box=document.getElementById('touch');if(box){const b=document.createElement('div');b.className='b';b.dataset.k='KeyR';b.textContent='궁';b.style.cssText='right:150px;bottom:250px;width:54px;height:54px;font-size:18px;background:rgba(255,190,60,.35)';
  const on=e=>{e.preventDefault();keys.KeyR=true;pressed.KeyR=true;b.classList.add('on')},off=e=>{e.preventDefault();keys.KeyR=false;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);box.appendChild(b)}}
{const _r=render;render=function(){_r();const b=document.querySelector('#touch [data-k="KeyR"]');if(b){const v=SAVE&&SAVE.lvl>=ULT_LV;if(b._v!==v){b._v=v;b.style.display=v?'':'none'}}}}

/* ---------- 용의 요새 몬스터 ---------- */
Object.assign(MOBS,{
  whelp:{n:'불꽃 새끼용',hp:80,dmg:20,exp:30,coin:[10,22],w:36,h:34},
  dknight:{n:'용비늘 기사',hp:110,dmg:24,exp:36,coin:[12,26],w:34,h:48},
  drake:{n:'바람 비룡',hp:70,dmg:22,exp:32,coin:[10,22],w:44,h:30,fly:1},
});
Object.assign(MOB_DRAW,{
  whelp(g,m,t){g.save();g.translate(m.x,m.y);g.scale(m.dir>0?1:-1,1);const b=Math.abs(Math.sin(t*7+m.ph))*3;ell(g,0,-1,17,3,'rgba(0,0,0,.2)');
    g.strokeStyle=O_;g.lineWidth=2;g.beginPath();g.moveTo(-12,-12);g.quadraticCurveTo(-26,-6,-30,-18+Math.sin(t*5)*3);g.stroke();
    for(const s of[-1,1]){g.save();g.translate(-2,-24-b);g.rotate(s*.3-.8+Math.sin(t*9)*.25);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-6,-16,-16,-12);g.quadraticCurveTo(-10,-4,0,0);g.fillStyle='#ffb070';g.fill();g.stroke();g.restore()}
    ell(g,0,-14-b,15,13,'#ff6a3a',O_,2.2);ell(g,3,-10-b,9,7,'#ffd8a0');ell(g,10,-28-b,11,10,'#ff7a4a',O_,2);
    for(const s of[-1,1])poly(g,[6+s*4,-36-b,8+s*6,-46-b,11+s*3,-36-b],'#fff0c0',O_,1.2);circ(g,13,-30-b,2.6,'#fff');circ(g,13.6,-30-b,1.4,'#2a1a10');
    if(Math.sin(t*3+m.ph)>.6){g.fillStyle='rgba(255,200,80,.8)';g.beginPath();g.ellipse(26,-26-b,6,3,0,0,6.28);g.fill()}g.restore()},
  dknight(g,m,t){g.save();g.translate(m.x,m.y);g.scale(m.dir>0?1:-1,1);const st=Math.sin(t*6+m.ph)*2;ell(g,0,-1,16,3,'rgba(0,0,0,.2)');
    for(const s of[-1,1]){g.fillStyle='#5a3a6a';g.fillRect(s*6-3,-14,6,14+(s>0?st:-st)*.5);g.strokeStyle=O_;g.lineWidth=1.4;g.strokeRect(s*6-3,-14,6,14)}
    g.beginPath();g.roundRect(-13,-40,26,28,6);g.fillStyle='#8a3a4a';g.fill();g.lineWidth=2;g.stroke();for(let i=0;i<3;i++){g.strokeStyle='rgba(255,200,120,.5)';g.beginPath();g.arc(0,-34+i*8,8,.3,2.8);g.stroke()}
    ell(g,4,-48,11,9,'#9a4a5a',O_,2);poly(g,[10,-50,22,-46,10,-43],'#9a4a5a',O_,1.5);for(const s of[-1,1])poly(g,[-2+s*3,-55,-8+s*2,-66,1+s*2,-56],'#ffe0a0',O_,1.2);circ(g,8,-50,2,'#ffd34a');
    g.save();g.translate(14,-28);g.rotate(-.4+Math.sin(t*4+m.ph)*.2);g.fillStyle='#c8c8e0';g.fillRect(-2,-34,4,34);g.strokeRect(-2,-34,4,34);poly(g,[-6,-34,0,-46,6,-34],'#e8e8ff',O_,1.4);g.restore();
    g.beginPath();g.roundRect(-20,-36,10,22,4);g.fillStyle='#c8a050';g.fill();g.stroke();g.restore()},
  drake(g,m,t){g.save();g.translate(m.x,m.y);g.scale(m.dir>0?1:-1,1);const f=Math.sin(t*10+m.ph);
    for(const s of[-1,1]){g.save();g.translate(-2,-4);g.scale(1,s);g.rotate(-.2-f*.5);g.beginPath();g.moveTo(0,0);g.lineTo(-12,-26);g.lineTo(-24,-18);g.lineTo(-30,-4);g.closePath();g.fillStyle='rgba(120,200,190,.85)';g.fill();g.strokeStyle=O_;g.lineWidth=1.6;g.stroke();g.restore()}
    ell(g,0,0,18,9,'#4aa89a',O_,2);g.strokeStyle=O_;g.lineWidth=2;g.beginPath();g.moveTo(-16,2);g.quadraticCurveTo(-30,6,-36,-2);g.stroke();
    ell(g,20,-6,10,7,'#5ab8aa',O_,2);poly(g,[26,-8,36,-5,26,-2],'#5ab8aa',O_,1.4);for(const s of[-1,1])poly(g,[16,-11,12,-20,20,-12],'#e8f0d0',O_,1.2);circ(g,24,-8,1.8,'#ffe04a');g.restore()},
  dcrys(g,m,t){if(m.broken){g.save();g.globalAlpha=.6;poly(g,[m.x-26,m.y,m.x-10,m.y-22,m.x+6,m.y-8,m.x+24,m.y],'#6a4a8a',O_,2);g.restore();return}
    const x=m.x,y=m.y,pul=.6+.4*Math.sin(t*4+m.ph);
    g.fillStyle='#3a2a4a';g.beginPath();g.roundRect(x-30,y-18,60,18,4);g.fill();g.strokeStyle=O_;g.lineWidth=2;g.stroke();
    const gl=g.createRadialGradient(x,y-60,4,x,y-60,70);gl.addColorStop(0,`rgba(255,120,200,${.45*pul})`);gl.addColorStop(1,'rgba(255,120,200,0)');g.fillStyle=gl;g.fillRect(x-70,y-130,140,140);
    poly(g,[x-18,y-18,x,y-104,x+18,y-18],'#ff8ad8',O_,2.4);poly(g,[x-4,y-30,x,y-96,x+8,y-34],'rgba(255,255,255,.55)');
    if(S.dkBoss&&!S.dkBoss.dead){g.save();g.strokeStyle=`rgba(255,140,220,${.35+.3*pul})`;g.lineWidth=3;g.setLineDash([10,8]);g.lineDashOffset=-t*40;g.beginPath();g.moveTo(x,y-100);g.lineTo(S.dkBoss.x,S.dkBoss.y-90);g.stroke();g.restore()}},
  dragonking(g,m,t){const x=m.x,y=m.y,f=Math.sin(t*3),shield=DKS&&DKS.pil>0,enr=DKS&&(Date.now()-(DKS.t0||Date.now()))>540000;
    g.save();
    // 날개
    for(const s of[-1,1]){g.save();g.translate(x+s*30,y-120);g.scale(s,1);g.rotate(-.3-f*.25);g.beginPath();g.moveTo(0,0);g.lineTo(150,-90);g.lineTo(190,-20);g.quadraticCurveTo(150,0,170,40);g.quadraticCurveTo(120,20,110,60);g.quadraticCurveTo(70,30,40,50);g.closePath();
      const wg=g.createLinearGradient(0,-90,0,60);wg.addColorStop(0,'#5a1a2a');wg.addColorStop(1,'#a03040');g.fillStyle=wg;g.fill();g.lineWidth=3;g.strokeStyle='#2a0a14';g.stroke();
      g.strokeStyle='rgba(255,180,120,.5)';g.lineWidth=2;for(const[a,b]of[[150,-90],[190,-20],[170,40],[110,60]]){g.beginPath();g.moveTo(0,0);g.lineTo(a,b);g.stroke()}g.restore()}
    // 꼬리
    g.strokeStyle='#7a1a2a';g.lineWidth=18;g.lineCap='round';g.beginPath();g.moveTo(x-40,y-50);g.quadraticCurveTo(x-140,y-10+f*10,x-200,y-60+f*20);g.stroke();g.lineCap='butt';
    poly(g,[x-206,y-74+f*20,x-232,y-58+f*20,x-206,y-46+f*20],'#ffd34a','#2a0a14',2);
    // 몸통
    const bg=g.createRadialGradient(x,y-90,10,x,y-80,110);bg.addColorStop(0,'#d84a4a');bg.addColorStop(1,'#6a1424');g.fillStyle=bg;g.beginPath();g.ellipse(x,y-80,95,70,0,0,6.28);g.fill();g.lineWidth=4;g.strokeStyle='#2a0a14';g.stroke();
    g.fillStyle='#ffd8a0';g.beginPath();g.ellipse(x+20,y-62,48,40,-.2,0,6.28);g.fill();g.strokeStyle='rgba(160,90,40,.6)';g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.arc(x+20,y-80+i*14,30,.4,2.7);g.stroke()}
    for(const s of[-1,1]){g.fillStyle='#8a1a2a';g.beginPath();g.roundRect(x+s*44-14,y-30,28,30,8);g.fill();g.strokeStyle='#2a0a14';g.lineWidth=3;g.stroke();for(let k=0;k<3;k++)poly(g,[x+s*44-10+k*9,y,x+s*44-6+k*9,y+8,x+s*44-2+k*9,y],'#fff0d0','#2a0a14',1)}
    // 목 · 머리
    g.strokeStyle='#9a2434';g.lineWidth=34;g.lineCap='round';g.beginPath();g.moveTo(x+40,y-120);g.quadraticCurveTo(x+80,y-180,x+110,y-170+f*6);g.stroke();g.lineCap='butt';
    const hx=x+130,hy=y-172+f*6;g.fillStyle='#b8303f';g.beginPath();g.ellipse(hx,hy,44,30,.1,0,6.28);g.fill();g.lineWidth=4;g.strokeStyle='#2a0a14';g.stroke();
    g.beginPath();g.moveTo(hx+20,hy-6);g.lineTo(hx+66,hy+4);g.lineTo(hx+20,hy+18);g.closePath();g.fillStyle='#b8303f';g.fill();g.stroke();
    for(const[a,b,c]of[[-10,-24,-34],[10,-26,-22]])poly(g,[hx+a,hy+b+6,hx+a-14,hy+b-30,hx+a+8,hy+b+2],'#ffe9b0','#2a0a14',2);
    const ec=enr?'#ff2020':'#ffe04a';circ(g,hx+18,hy-8,7,ec,'#2a0a14',2);g.fillStyle='#2a0a14';g.fillRect(hx+17,hy-14,3,12);
    const eg=g.createRadialGradient(hx+18,hy-8,2,hx+18,hy-8,26);eg.addColorStop(0,enr?'rgba(255,40,40,.7)':'rgba(255,230,90,.6)');eg.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=eg;g.fillRect(hx-8,hy-34,52,52);
    if(DKS&&DKS.breathT>0){g.fillStyle='rgba(255,160,60,.8)';for(let i=0;i<5;i++){g.beginPath();g.arc(hx+60+i*14,hy+8+i*6,6+i*2,0,6.28);g.fill()}}
    // 결정의 보호막
    if(shield){const a=.25+.12*Math.sin(t*5);g.strokeStyle=`rgba(255,140,220,${a+.3})`;g.lineWidth=4;g.fillStyle=`rgba(255,160,230,${a*.5})`;g.beginPath();g.ellipse(x+20,y-110,190,140,0,0,6.28);g.fill();g.stroke()}
    g.restore()},
});
// 보스·결정은 일반 몬스터 이동을 하지 않는다
{const _um=updateMobs;updateMobs=function(dt){const keep=S.mobs.filter(m=>m.type==='dragonking'||m.type==='dcrys');if(!keep.length)return _um(dt);S.mobs=S.mobs.filter(m=>m.type!=='dragonking'&&m.type!=='dcrys');_um(dt);S.mobs.push(...keep)}}

/* ---------- 용의 요새 테마 · 장식 ---------- */
THEMES.dragon={sky:['#2a0e1e','#5a1a2a','#a83a2a','#e8904a'],moon:{x:.78,y:.2,r:44,c:'#ffd8a0',glow:'rgba(255,170,90,'},
  layers:[{k:'ridge',col:'#4a1a26',amp:90,base:.62,f:.12,cyc:[2,5,9]},{k:'ridge',col:'#2e1018',amp:60,base:.76,f:.25,cyc:[3,7,11]}],
  grass:'#7a4a3a',grass2:'#3a1a14',dirt:'#4a2a26',dirt2:'#2a1612',stone:'#5a4040',plank:'#6a4030',plank2:'#3a2014',fly:'#ffb060'};
{const _dl=drawLandmark;drawLandmark=function(g,L,t){_dl(g,L,t);const m=L.landmark;if(!m||m.k!=='dfort')return;const gy=m.y;
  for(let i=0;i<Math.ceil(L.w/520);i++){const x=200+i*520;g.fillStyle='rgba(40,14,22,.85)';g.fillRect(x-60,170,120,gy-170);for(let k=0;k<4;k++)g.fillRect(x-60+k*34,150,22,22);
    g.fillStyle='rgba(255,170,80,.6)';g.fillRect(x-10,230,20,30);g.fillRect(x-30,320,14,22);g.fillRect(x+16,320,14,22);
    g.fillStyle='#a02030';g.fillRect(x-2,90,4,62);poly(g,[x+2,92,x+40,102+Math.sin(t*3+i)*4,x+2,114],'#c83040')}
  for(let i=0;i<Math.ceil(L.w/340);i++){const x=110+i*340,fl=Math.sin(t*12+i)*3;g.fillStyle='#3a2a2a';g.fillRect(x-6,gy-60,12,60);
    g.fillStyle='rgba(255,140,40,.9)';g.beginPath();g.ellipse(x,gy-70+fl*.3,9,16+fl,0,0,6.28);g.fill();g.fillStyle='rgba(255,230,120,.9)';g.beginPath();g.ellipse(x,gy-66,4,8,0,0,6.28);g.fill();
    const gl=g.createRadialGradient(x,gy-70,4,x,gy-70,80);gl.addColorStop(0,'rgba(255,150,60,.35)');gl.addColorStop(1,'rgba(255,150,60,0)');g.fillStyle=gl;g.fillRect(x-80,gy-150,160,160)}
  for(let i=0;i<14;i++){const r=mulberry(i*7+5),x=r()*L.w,y=((r()*400)-t*30*(.5+r()))%400;g.fillStyle='rgba(255,170,90,.7)';g.fillRect(x,(y+400)%400,2,2)}
}}
{const _ar=/gears/;}

/* ---------- 용의 요새 사냥터 ---------- */
const DFORT=[
 {id:'df1',name:'용의 요새 · 외성 성벽',min:100,mobs:['dknight','drake'],hue:0},
 {id:'df2',name:'용의 요새 · 비늘 광장',min:120,mobs:['whelp','dknight','drake'],hue:20},
 {id:'df3',name:'용의 요새 · 용암 해자',min:140,mobs:['whelp','golem','lamp'],hue:0},
 {id:'df4',name:'용의 요새 · 폭풍 첨탑',min:160,mobs:['drake','dknight','bat'],hue:200},
 {id:'df5',name:'용의 요새 · 태초의 둥지',min:180,mobs:['whelp','drake','dknight'],hue:40},
];
function buildDF(i){
  const T=DFORT[i],gy=470,Wd=3200,r=mulberry(4400+i*13),ms=T.min*.16;
  const L=newL({id:T.id,name:T.name,sub:'Lv.'+T.min+'~ · 붉은 하늘 아래 용들이 지키는 요새',theme:'dragon',music:'boss',w:Wd,h:540,mscale:ms,allHue:T.hue,hunt:1,df:1,spawn:{x:140,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));L.landmark={k:'dfort',x:0,y:gy};
  const tiers=[[365,[[220,520],[980,560],[1800,540],[2560,420]]],[262,[[520,460],[1340,520],[2180,480]]],[160,[[820,520],[1720,560]]]];
  const gr=T.mobs.filter(k=>!MOBS[k].fly),fl=T.mobs.filter(k=>MOBS[k].fly);let gi=i,fi=0;
  for(const[y,list]of tiers)for(const[x,w]of list){L.plats.push(plat(x,y,w,16,'o'));L.ropes.push({x:x+40+Math.round(r()*(w-80)),y1:y,y2:gy});
    const n=w>=500?2:1;for(let k=0;k<n;k++)L.mobs.push([gr[(gi++)%gr.length],x+40+(w-80)*(k+.5)/n,y,x+12,x+w-12])}
  for(let k=0;k<8;k++){const x=320+k*340;L.mobs.push([gr[(gi++)%gr.length],x,gy,x-150,x+150])}
  if(fl.length)for(let k=0;k<5;k++)L.mobs.push([fl[(fi++)%fl.length],400+k*560,200+(k%2)*80,100]);
  const prev=i?DFORT[i-1].id:'tp3',next=i<4?DFORT[i+1]:null;
  L.portals=[{x:60,y:gy,to:prev,label:'← '+(i?DFORT[i-1].name.split(' · ')[1]:'별의 신전')}];
  L.portals.push(next?{x:Wd-70,y:gy,to:next.id,label:next.name.split(' · ')[1]+' →',lockLv:next.min}:{x:Wd-70,y:gy,to:'df_altar',label:'용의 제단 →'});
  L.sign={x:230,y:gy,t:T.name.split(' · ')[1],s:'Lv.'+T.min+'~'};
  return fixReach(L);
}
DFORT.forEach((T,i)=>{MAPS[T.id]=()=>buildDF(i)});
{const f=MAPS.tp3;MAPS.tp3=()=>{const L=f();L.portals.push({x:L.w-260,y:470,to:'df1',label:'용의 요새 (Lv.100)',lockLv:100});return L}}
// 요새 몬스터는 가끔 「용의 비늘 조각」 (보스 소환 재료)
ETC_NAME.dscale='용의 비늘 조각';ETC_NAME.dsigil='🔥 용의 각인석';BOSS_MATS.push('dscale','dsigil');
BOSS_MAT_DESC.dscale='용의 요새 몬스터가 가끔 떨어뜨린다. 30개를 모아 용의 제단에서 「용의 각인석」으로.';BOSS_MAT_DESC.dsigil='용의 제단에서 사용하면 파티의 용왕 보스 방이 열린다.';
{const _km=killMob;killMob=function(m){const was=!m.dead;_km(m);if(was&&m.dead&&S.L.df&&!m.fb&&Math.random()<.07*EV().drop){addMat('dscale',1);ftext(m.x,m.y-60,'용의 비늘 조각 +1','#ff9a6a',13,1)}}}

/* ---------- 용의 제단 (보스 소환) ---------- */
MAPS.df_altar=function(){
  const gy=470,Wd=1600,L=newL({id:'df_altar',name:'용의 제단',sub:'불멸의 용왕이 잠든 봉인의 제단 · 각인석으로 깨울 수 있다',theme:'dragon',music:'boss',w:Wd,h:540,spawn:{x:140,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));L.landmark={k:'dfort',x:0,y:gy};
  L.npcs=[{id:'dkpriest',name:'봉인의 사제 화염꽃',x:620,gy,look:'dkpriest'}];
  L.portals=[{x:60,y:gy,to:'df5',label:'← 태초의 둥지'},{x:Wd-90,y:gy,to:'town',label:'야채마을 →'}];
  return L;
};
NPC_LOOK_X.dkpriest={job:'priest',eq:{hat:'hat_gat',outfit:'out_gold',cape:'cape_red'},n:'봉인의 사제',fid:4};ROLE.dkpriest='용왕 소환 · 각인석';
Object.assign(QUESTS,{
  dq1:{name:'용의 요새 : 봉인의 열쇠',giver:'dkpriest',min:100,desc:'용왕을 깨우려면 각인석이 필요하다. 요새의 몬스터들에게서 용의 비늘 조각 30개를 모아오너라. 첫 각인석은 내가 직접 새겨주마.',objs:[{t:'collect',item:'dscale',n:30,label:'용의 비늘 조각'}],rew:{pct:.03,coin:30000}},
  dq2:{name:'용의 요새 : 불멸의 용왕',giver:'dkpriest',min:100,pre:['dq1'],desc:'각인석으로 용왕을 깨우고, 동료들과 함께 쓰러뜨려라. 혼자서는 어림도 없다 — Lv.100 이상 5명 정도는 모아야 할 것이다.',objs:[{t:'boss',id:'dragonking',n:1,label:'불멸의 용왕 토벌'}],rew:{pct:.05,coin:100000}},
});
GIVER_NAME.dkpriest='봉인의 사제 화염꽃';
{const _qt=qTurnIn;qTurnIn=function(id){const r=_qt(id);if(id==='dq1'){SAVE.inv.dsigil=(SAVE.inv.dsigil||0)+1;saveGame();G.toast('🔥 용의 각인석 1개를 받았다!')}return r}}
function dkPriestMenu(n){
  const opts=[];
  for(const id of['dq1','dq2']){const st=qst(id).s;if(st!=='none'||qAvail(id))opts.push({t:({none:'[!] ',active:'[진행중] ',ready:'[완료!] ',done:'[끝] '})[st]+QUESTS[id].name,fn:()=>questDetail(n,'dkpriest',id)})}
  opts.push({t:'⚒ 각인석 새기기 (비늘 조각 30 + 귀목의 정수 1)',fn:()=>{if((SAVE.inv.dscale||0)<30||(SAVE.inv.essence||0)<1){G.toast('재료 부족 (비늘 '+(SAVE.inv.dscale||0)+'/30 · 정수 '+(SAVE.inv.essence||0)+'/1)');return}SAVE.inv.dscale-=30;SAVE.inv.essence-=1;SAVE.inv.dsigil=(SAVE.inv.dsigil||0)+1;saveGame();sfx('levelup');dkPriestMenu(n)}});
  opts.push({t:'🔥 각인석으로 용왕 소환 ('+(SAVE.inv.dsigil||0)+'개) — 우리 파티 방',fn:()=>{if(SAVE.lvl<100){G.toast('Lv.100부터 도전할 수 있어요');return}if(!(SAVE.inv.dsigil>0)){G.toast('용의 각인석이 없어요');return}
    SAVE.inv.dsigil--;saveGame();G.dkSummon=1;closeUI();sfx('roar');goMap('df_boss')}});
  opts.push({t:'⚔ 파티원이 소환한 방으로 들어가기',fn:()=>{if(SAVE.lvl<100){G.toast('Lv.100부터 도전할 수 있어요');return}G.dkSummon=0;closeUI();sfx('portal');goMap('df_boss')}});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,'용왕은 같은 파티 코드를 쓰는 동료들이 함께 싸우는 보스다. (파티 코드: '+(EVPT||'없음 — 가이드/파티 메뉴에서 설정')+')\n\n· 결정 3개가 살아 있으면 용왕은 다치지 않는다 — 결정부터 부숴라 (70%·35%에 다시 생긴다)\n· 바닥을 덮는 화염 숨결은 발판 위로 피하고, 붉은 원(유성)은 벗어나라\n· 10분 안에 쓰러뜨리지 못하면 용왕이 분노한다\n· 전리품은 공격에 참여한 사람 중 한 명에게!',opts);
}
{const _t=talkNPC;talkNPC=function(n){if(n.id==='dkpriest')return dkPriestMenu(n);return _t(n)}}

/* ---------- 보스 방 ---------- */
let DKS=null,DKQ={b:0,p:0},_dkT=0,DKDMG=0;
const DK_LOCAL=()=>!wsOK();
MAPS.df_boss=function(){
  const gy=470,Wd=1800,L=newL({id:'df_boss',name:'🐲 불멸의 용왕의 둥지',sub:'결정을 부수고 · 숨결은 발판 위로 · 유성은 피하라',theme:'dragon',music:'boss',w:Wd,h:540,mscale:16,dk:1,spawn:{x:160,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));L.landmark={k:'dfort',x:0,y:gy};
  for(const x of[90,560,1040,1500])L.plats.push(plat(x,350,220,14,'o'));for(const x of[200,670,1150,1610])L.ropes.push({x,y1:350,y2:gy});
  L.portals=[{x:50,y:gy,to:'df_altar',label:'↩ 제단으로'}];
  return L;
};
{const _lm=loadMap;loadMap=function(id,end){_lm(id,end);S.dkBoss=null;S.dkCrys=[];S.dkfx=[];DKQ={b:0,p:0};DKDMG=0;
  if(id!=='df_boss'){DKS=null;return}
  if(DK_LOCAL()){DKS={hp:40000,max:40000,pil:9000,pilMax:9000,phase:1,t0:Date.now(),dead:false,fail:false,n:1,local:1,key:'local'+Date.now()};dkSpawn()}
  else{DKS=null;wsSend({t:'st',map:'df_boss',x:PARTY[0].x,y:PARTY[0].y,pt:EVPT||''});setTimeout(()=>{wsSend({t:G.dkSummon?'bsum':'bjoin'});G.dkSummon=0},150);G.toast('용왕의 기운을 살피는 중…')}
}}
function dkSpawn(){
  if(S.dkBoss||S.id!=='df_boss')return;const L=S.L;
  const m=spawnMob('whelp',L.w/2,300,{});m.type='dragonking';m.w=240;m.h=230;m.y=452;m.hp=m.max=1e9;m.dmg=0;m.fbName='불멸의 용왕 아그니르';S.dkBoss=m;S.fb=m;
  S.dkCrys=[];for(const x of[320,900,1480]){const c=spawnMob('whelp',x,470,{});c.type='dcrys';c.w=50;c.h=100;c.y=470;c.hp=c.max=1e9;c.dmg=0;S.dkCrys.push(c)}
  G.banner={t:0,name:'🐲 불멸의 용왕 아그니르',sub:'결정 3개를 먼저 부숴라!'};sfx('roar');S.shake=24;S.dkAt=0;
}
function dkSync(){
  const b=S.dkBoss;if(!b||!DKS)return;b.hp=Math.max(1,DKS.hp);b.max=DKS.max;
  const alive=Math.ceil(DKS.pil/(DKS.pilMax/3)-1e-6);S.dkCrys.forEach((c,i)=>{c.broken=i>=alive;c.hp=c.max});
  b.fbName='불멸의 용왕 아그니르'+(DKS.pil>0?'  🛡 결정 '+alive+'개':'')+'  · '+DKS.phase+'단계';
}
// 공격 처리 : 결정 / 용왕 (서버 공유 체력)
{const _ht=hitTarget;hitTarget=function(t,dmg,dir,crit,p,o){
  if(t.type!=='dragonking'&&t.type!=='dcrys')return _ht(t,dmg,dir,crit,p,o);
  if(!DKS||DKS.dead||DKS.fail)return;
  if(t.type==='dcrys'&&t.broken)return;
  const d=Math.round(dmg);
  if(t.type==='dragonking'&&DKS.pil>0){ftext(t.x,t.y-200,'무적 — 결정을 부숴라!','#ff9ad8',15,.7);return}
  ftext(t.x+rnd(-20,20),t.y-(t.type==='dcrys'?110:200),d,crit?'#ffb040':'#fff',crit?24:18);sfx(crit?'crit':'hit');spark(t.x,t.y-(t.type==='dcrys'?60:120),6,'#ffe0c0',180,.35);t.flash=.08;
  if(p===PARTY[0]||!p||p.kind==='ai')DKDMG+=d;
  if(DKS.local){dkLocalDmg(t.type==='dcrys'?'p':'b',d)}else{if(t.type==='dcrys')DKQ.p+=d;else DKQ.b+=d}
}}
function dkLocalDmg(k,d){const R=DKS;if(R.dead||R.fail)return;if(k==='p'){R.pil=Math.max(0,R.pil-d);return}if(R.pil>0)return;R.hp-=d;const ph=R.hp>R.max*.7?1:R.hp>R.max*.35?2:3;if(ph!==R.phase){R.phase=ph;R.pil=R.pilMax;G.banner={t:0,name:'결정이 다시 솟아올랐다!',sub:ph+'단계 — '+(ph===2?'화염 숨결 주의!':'유성과 새끼 용!')}}
  if(R.hp<=0){R.hp=0;R.dead=true;R.wid=MYWID||'me';R.winner='나';dkOnState(R)}}
function dkOnState(o){
  const prev=DKS;DKS=Object.assign(DKS||{},o);
  if(o.none){S.L.portals.length&&G.toast('소환된 용왕이 없어요 — 파티원 중 한 명이 제단에서 각인석을 써야 해요');return}
  if(!S.dkBoss&&!o.dead&&!o.fail)dkSpawn();
  if(prev&&prev.phase&&o.phase>prev.phase&&!o.dead)G.banner={t:0,name:'결정이 다시 솟아올랐다!',sub:o.phase+'단계 — '+(o.phase===2?'화염 숨결 주의!':'유성과 새끼 용!')};
  if(o.dead&&!SAVE.flags['dkdone_'+o.key]){SAVE.flags['dkdone_'+o.key]=1;dkReward(o)}
  if(o.fail&&!SAVE.flags['dkfail_'+o.key]){SAVE.flags['dkfail_'+o.key]=1;G.banner={t:0,name:'🔥 용왕의 분노',sub:'10분이 지나 용왕이 모든 것을 불태우고 날아갔다…'};if(S.dkBoss){S.dkBoss.dead=true;S.mobs=S.mobs.filter(m=>m!==S.dkBoss)}S.fb=null}
}
const DK_POOL=['g_dk_armor','g_dk_eye','JOBWEAP'];
Object.assign(GEAR,{g_dk_armor:{slot:'armor',n:'용왕의 비늘 갑주',gr:4,atk:22,hp:90,mp:40,req:{lv:100}},g_dk_eye:{slot:'acc',n:'용왕의 눈 반지',gr:4,atk:24,hp:30,spd:6,req:{lv:100}}});
for(const job in SIGW){const s=SIGW[job],h2=WT[s.wt].h2?1:0;GEAR['g_dk_'+job]={wt:s.wt,n:'용왕의 '+['발톱검','뿔활','척추망치','심장지팡이','송곳니권','그림자발톱','포효포','성화홀'][Object.keys(SIGW).indexOf(job)],gr:4,atk:58+h2*8,req:{lv:100,[s.st]:300},sig:2,slot:WT[s.wt].lh?'lh':'rh'}}
function dkReward(o){
  const S0=S.dkBoss;if(S0){S0.dead=true;S.mobs=S.mobs.filter(m=>m!==S0);for(const c of S.dkCrys)c.broken=true}S.fb=null;
  qev('boss',{id:'dragonking'});SAVE.cleared.dragonking=true;
  const lines=[];if(DKDMG>0||o.local){const ex=Math.round(need(SAVE.lvl)*.03),cn=50000;gainExp(ex);addCoins(cn);SAVE.ec=(SAVE.ec||0)+5;addMat('dscale',5);lines.push('참가 보상: 경험치 +'+ex+' · '+cn+'● · ◆5 · 비늘 조각 5')}
  const win=o.local||o.wid===MYWID;
  if(win){let id=DK_POOL[(Math.random()*DK_POOL.length)|0];if(id==='JOBWEAP')id='g_dk_'+SAVE.job;lines.push('🎁 '+giveGear(id,'용왕의 전리품'))}
  else lines.push('전리품은 '+(o.winner||'?')+' 님에게 돌아갔다');
  saveGame();sfx('levelup');S.shake=30;G.banner={t:0,name:'🐲 불멸의 용왕 토벌!',sub:win?'전리품 당첨!':'전리품: '+(o.winner||'?')};
  setTimeout(()=>openDialog('불멸의 용왕 토벌!',lines.join('\n'),[{t:'제단으로',fn:()=>{closeUI();goMap('df_altar')}},{t:'여기 있기',fn:closeUI}]),2200);
}
{const _em=evMsg;evMsg=function(raw){_em(raw);let o;try{o=JSON.parse(raw)}catch(_){return}if(o.t==='bst'&&S&&S.id==='df_boss')dkOnState(o)}}
// 용왕 패턴 (각자 화면에서 진행)
function dkStep(dt){
  if(S.id!=='df_boss')return;
  if(!DK_LOCAL()){_dkT-=dt;if(_dkT<=0){_dkT=.25;if(DKQ.b>0){wsSend({t:'bd',d:DKQ.b});DKQ.b=0}if(DKQ.p>0){wsSend({t:'bp',d:DKQ.p});DKQ.p=0}}}
  const b=S.dkBoss;if(!b||!DKS||DKS.dead||DKS.fail)return;
  if(DKS.local&&Date.now()-DKS.t0>600000){DKS.fail=true;dkOnState(DKS)}
  dkSync();const L=S.L,tt=(Date.now()-DKS.t0)/1000,enr=tt>540;
  b.x=L.w/2+Math.sin(tt*.35)*320;b.y=452+Math.sin(tt*1.3)*6;b.dir=b.x<PARTY[0].x?1:-1;
  S.dkAt=(S.dkAt||0)-dt;DKS.breathT=Math.max(0,(DKS.breathT||0)-dt);
  const mul=enr?2.5:1;
  if(S.dkAt<=0){S.dkAt=(DKS.phase===3?3:4)/(enr?1.6:1);const r=Math.random(),ph=DKS.phase;
    if(ph>=2&&r<.38){S.dkfx.push({k:'breath',t:0,warn:1.5,dur:1.1,hit:false});G.toast('🔥 화염 숨결! 발판 위로!')}
    else if(r<.72){for(let i=0;i<(ph===1?4:6);i++){const x=i<2?PARTY[(i)%PARTY.length].x+rnd(-40,40):rnd(80,L.w-80);S.dkfx.push({k:'meteor',x,t:0,warn:1.3,dur:.35,hit:false})}}
    else if(ph===3&&r<.9){for(let i=0;i<3;i++){const w=spawnMob('whelp',clamp(b.x+rnd(-300,300),100,L.w-100),300,{chase:true});w.hp=w.max=Math.round(MOBS.whelp.hp*L.mscale*1.5);w.dmg=Math.round(w.dmg*1.6)}G.toast('새끼 용들이 날아든다!')}
    else S.dkfx.push({k:'claw',x:b.x,t:0,warn:.9,dur:.3,hit:false});
  }
  for(const f of S.dkfx){f.t+=dt;if(f.hit||f.t<f.warn)continue;f.hit=true;
    for(const p of PARTY){if(p.dead)continue;let hit=false;
      if(f.k==='breath')hit=p.y>=460&&p.onGround;else if(f.k==='meteor')hit=Math.abs(p.x-f.x)<62;else if(f.k==='claw')hit=Math.abs(p.x-f.x)<280&&p.y>300;
      if(hit)hurtPlayer(p,Math.round(p.maxhp*({breath:.45,meteor:.28,claw:.32})[f.k]*mul),f.x||b.x,{kb:420,up:300,inv:.4})}
    if(f.k==='breath'){DKS.breathT=1;S.shake=18;sfx('boom')}else if(f.k==='meteor'){spark(f.x,465,22,'#ffb060',300,.6,5,0,true);sfx('boom')}else{S.shake=10;sfx('hit')}}
  S.dkfx=S.dkfx.filter(f=>f.t<f.warn+f.dur);
}
{const _rs=respawnStep;respawnStep=function(dt){_rs(dt);dkStep(dt)}}
function drawDkFx(g,t){
  if(S.id!=='df_boss'||!S.dkfx)return;const L=S.L;
  for(const f of S.dkfx){const k=Math.min(1,f.t/f.warn),fire=f.t>=f.warn;
    if(f.k==='breath'){if(!fire){g.fillStyle=`rgba(255,80,40,${.12+.18*k})`;g.fillRect(0,440,L.w,40);txt(g,'⚠ 화염 숨결 — 발판 위로!',S.cam.x+W/2/(window.WZ||1),430,16,'#ffd0a0','center',3)}
      else{const gr=g.createLinearGradient(0,380,0,480);gr.addColorStop(0,'rgba(255,140,40,0)');gr.addColorStop(1,'rgba(255,90,30,.85)');g.fillStyle=gr;g.fillRect(0,380,L.w,100);for(let i=0;i<30;i++){const x=(i*61+t*400)%L.w;g.fillStyle='rgba(255,220,120,.8)';g.beginPath();g.ellipse(x,450-Math.abs(Math.sin(t*9+i))*30,8,18,0,0,6.28);g.fill()}}}
    else if(f.k==='meteor'){if(!fire){g.strokeStyle=`rgba(255,60,60,${.5+.4*k})`;g.lineWidth=3;g.beginPath();g.ellipse(f.x,468,62*k+8,12*k+3,0,0,6.28);g.stroke();g.fillStyle=`rgba(255,60,60,${.15*k})`;g.fill();
        const my=-40+k*500;circ(g,f.x+(1-k)*80,my,14,'#ff8a3a','#5a1a0a',2);g.fillStyle='rgba(255,180,80,.5)';g.beginPath();g.ellipse(f.x+(1-k)*80+16,my-24,8,22,-.5,0,6.28);g.fill()}
      else{const a=1-(f.t-f.warn)/f.dur;g.fillStyle=`rgba(255,160,60,${a*.8})`;g.beginPath();g.ellipse(f.x,460,80,26,0,0,6.28);g.fill()}}
    else if(f.k==='claw'){if(!fire){g.fillStyle=`rgba(255,80,80,${.1+.2*k})`;g.fillRect(f.x-280,300,560,180)}else{g.strokeStyle='rgba(255,230,230,.9)';g.lineWidth=6;for(let i=0;i<3;i++){g.beginPath();g.moveTo(f.x-200+i*40,320);g.lineTo(f.x+120+i*40,470);g.stroke()}}}
  }
  if(DKS&&!DKS.dead&&!DKS.fail){const left=Math.max(0,600-(Date.now()-DKS.t0)/1000);txt(g,'⏳ '+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0')+(left<60?'  분노 임박!':'')+'   참여 '+(DKS.n||1)+'명',S.cam.x+W/2/(window.WZ||1),S.cam.y+96/(window.WZ||1),14,left<60?'#ff8a8a':'#ffe9a0','center',3)}
}
{const _st=drawSelfTag;drawSelfTag=function(g){drawDkFx(g,G.t);_st(g)}}
{const _dh=drawHUD;drawHUD=function(g,t){_dh(g,t);drawUltFX(g,t)}}

/* ---------- 택시 · 가이드 ---------- */
{const _td=taxiDests;taxiDests=function(){const d=_td();if(S.id!=='df1')d.push({id:'df1',n:'🐉 용의 요새 · 외성 성벽  (Lv.100~)',c:5000,min:100});if(S.id!=='df_altar')d.push({id:'df_altar',n:'🔥 용의 제단  (Lv.100~)',c:8000,min:100});return d}}
{const _ah=allHunts;allHunts=function(){const a=_ah();for(const T of DFORT)a.push({id:T.id,n:T.name,min:T.min,where:'용의 요새'});return a}}
{const _ng=nextGoals;nextGoals=function(){const g=_ng();if(SAVE.lvl>=100&&!SAVE.cleared.dragonking)g.unshift('🐲 용의 제단 → 불멸의 용왕 (5인 파티 추천)');if(SAVE.lvl>=110&&SAVE.lvl<ULT_LV)g.push('⭐ Lv.'+ULT_LV+' 궁극기(R) 습득');return g.slice(0,3)}}
{const _ge=gainExp;gainExp=function(n,mob){const lv=SAVE.lvl;const r=_ge(n,mob);if(lv<ULT_LV&&SAVE.lvl>=ULT_LV)setTimeout(()=>{G.banner={t:0,name:'⭐ 궁극기 습득!',sub:JOB[SAVE.job].sk[5].n+' — R 키(폰: 궁 버튼)로 화면 전체 공격!'};sfx('levelup')},1500);
  if(lv<100&&SAVE.lvl>=100)setTimeout(()=>{G.banner={t:0,name:'Lv.100 달성!',sub:'이제부터 레벨업이 아주 느려져요 · 용의 요새가 열렸어요'}},3500);return r}}
