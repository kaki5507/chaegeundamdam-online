/* ============================================================
   MORE : 이벤트 치장 16종(◆ 상점 + 이벤트 보상 상자) · 새 사냥터 6곳 · 택시 레벨별 폴더
   ============================================================ */
/* ---------- 이벤트 치장 ---------- */
Object.assign(ITEMS,{
  ev_hat_witch:{slot:'hat',n:'[이벤트] 별밤 마녀 모자',price:0,ec:18,cash:1,ev:1,r:4,col:'#5a3aa8'},
  ev_hat_bunny:{slot:'hat',n:'[이벤트] 토끼 귀 머리띠',price:0,ec:14,cash:1,ev:1,r:4,col:'#ffffff'},
  ev_hat_mush:{slot:'hat',n:'[이벤트] 통통 버섯 모자',price:0,ec:12,cash:1,ev:1,r:4,col:'#ff7a8a'},
  ev_hat_beanie:{slot:'hat',n:'[이벤트] 겨울 털모자',price:0,ec:12,cash:1,ev:1,r:4,col:'#e84a5a'},
  ev_hat_star:{slot:'hat',n:'[이벤트] 떠도는 별 핀',price:0,ec:16,cash:1,ev:1,r:4,col:'#ffe04a'},
  ev_hat_dragon:{slot:'hat',n:'[이벤트] 아기용 모자',price:0,ec:28,cash:1,ev:1,r:4,col:'#ff6a3a'},
  ev_face_blush:{slot:'face',n:'[이벤트] 반짝 볼터치',price:0,ec:8,cash:1,ev:1,r:4,col:'#ff9ab8'},
  ev_face_mono:{slot:'face',n:'[이벤트] 신사의 외알 안경',price:0,ec:10,cash:1,ev:1,r:4,col:'#ffd34a'},
  ev_out_sailor:{slot:'outfit',n:'[이벤트] 바다 세일러복',price:0,ec:22,cash:1,ev:1,r:4,col:'#ffffff'},
  ev_out_cloud:{slot:'outfit',n:'[이벤트] 구름 잠옷',price:0,ec:20,cash:1,ev:1,r:4,col:'#c8e4ff'},
  ev_out_knight:{slot:'outfit',n:'[이벤트] 은빛 기사 갑옷',price:0,ec:32,cash:1,ev:1,r:4,col:'#d8e0f0'},
  ev_cape_butterfly:{slot:'cape',n:'[이벤트] 나비 날개',price:0,ec:30,cash:1,ev:1,r:4,col:'#ff9ae0'},
  ev_cape_dragon:{slot:'cape',n:'[이벤트] 용의 날개',price:0,ec:40,cash:1,ev:1,r:4,col:'#c02a3a'},
  ev_aura_snow:{slot:'aura',n:'[이벤트] 눈송이 오라',price:0,ec:22,cash:1,ev:1,r:4,col:'#e8f4ff'},
  ev_aura_bubble:{slot:'aura',n:'[이벤트] 비눗방울 오라',price:0,ec:20,cash:1,ev:1,r:4,col:'#a8e8ff'},
  ev_aura_note:{slot:'aura',n:'[이벤트] 음표 오라',price:0,ec:20,cash:1,ev:1,r:4,col:'#ffb0e0'},
});
const EV_COS=Object.keys(ITEMS).filter(k=>ITEMS[k].ev);for(const k of EV_COS)if(!CASH_ITEMS.includes(k))CASH_ITEMS.push(k);
// 그리기 : 얼굴 · 모자
{const _dg=drawGear;drawGear=function(g,c,eq,x,y,t){
  const hat=eq.hat,face=eq.face,mine=k=>k&&ITEMS[k]&&ITEMS[k].ev;
  _dg(g,c,Object.assign({},eq,{hat:mine(hat)?null:hat,face:mine(face)?null:face}),x,y,t);
  if(!mine(hat)&&!mine(face))return;g.save();g.translate(x,y);g.lineJoin='round';const ey=3;
  if(face==='ev_face_blush'){for(const s of[-1,1]){g.fillStyle='rgba(255,120,170,.55)';g.beginPath();g.ellipse(s*9,ey+6,4,2.4,0,0,6.28);g.fill();if(Math.sin(t*4+s)>.5){g.fillStyle='#fff';g.font='6px sans-serif';g.textAlign='center';g.fillText('✦',s*12,ey+2)}}}
  if(face==='ev_face_mono'){circ(g,5.5,ey-.5,5,'rgba(220,240,255,.35)','#c89a20',1.6);g.strokeStyle='#c89a20';g.lineWidth=1;g.beginPath();g.moveTo(10,ey);g.quadraticCurveTo(13,ey+10,8,ey+16);g.stroke()}
  if(hat==='ev_hat_witch'){ell(g,0,-12,22,5,'#4a2a88',O_,2);g.beginPath();g.moveTo(-11,-13);g.quadraticCurveTo(-4,-36,10,-44+Math.sin(t*2)*2);g.quadraticCurveTo(4,-30,11,-13);g.closePath();g.fillStyle='#5a3aa8';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
    g.fillStyle='#ffd34a';g.fillRect(-11,-18,22,4);txt(g,'★',2,-24,9,'#ffe97a','center',0)}
  else if(hat==='ev_hat_bunny'){for(const s of[-1,1]){g.save();g.translate(s*7,-15);g.rotate(s*(.18+Math.sin(t*3+s)*.06));ell(g,0,-12,5,13,'#ffffff',O_,2);ell(g,0,-11,2.4,9,'#ffb0c8');g.restore()}g.strokeStyle='#ff8ab0';g.lineWidth=2.4;g.beginPath();g.arc(0,-6,14,Math.PI*1.1,Math.PI*1.9);g.stroke()}
  else if(hat==='ev_hat_mush'){g.beginPath();g.moveTo(-17,-10);g.bezierCurveTo(-18,-32,18,-32,17,-10);g.quadraticCurveTo(0,-6,-17,-10);g.fillStyle='#ff7a8a';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();for(const[a,b,r]of[[-8,-20,3],[4,-24,2.4],[9,-15,2.6]])circ(g,a,b,r,'#fff6f0')}
  else if(hat==='ev_hat_beanie'){g.beginPath();g.arc(0,-8,15,Math.PI,0);g.fillStyle='#e84a5a';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();g.fillStyle='#fff';g.fillRect(-16,-10,32,5);g.strokeRect(-16,-10,32,5);circ(g,0,-24,5,'#ffffff',O_,1.6)}
  else if(hat==='ev_hat_star'){const by=-30+Math.sin(t*2.4)*3;g.save();g.translate(10,by);g.rotate(t*.8);poly(g,[0,-8,2.4,-2.4,8,0,2.4,2.4,0,8,-2.4,2.4,-8,0,-2.4,-2.4],'#ffe04a',O_,1.4);g.restore();g.globalAlpha=.6;txt(g,'✦',-8,by+6,7,'#fff','center',0);g.globalAlpha=1}
  else if(hat==='ev_hat_dragon'){g.beginPath();g.arc(0,-8,15,Math.PI,0);g.fillStyle='#ff6a3a';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();for(const s of[-1,1])poly(g,[s*8,-18,s*13,-30,s*4,-21],'#fff0c0',O_,1.4);for(let i=0;i<3;i++)poly(g,[-6+i*6,-22,-3+i*6,-28,i*6,-22],'#ffd34a',O_,1);
    circ(g,-5,-12,2,'#2a1a10');circ(g,5,-12,2,'#2a1a10')}
  g.restore()}}
// 옷
{const _do=drawOutfit;drawOutfit=function(g,id,shy){
  if(!(ITEMS[id]&&ITEMS[id].ev))return _do(g,id,shy);const it=ITEMS[id];
  g.save();torsoPath(g,shy);g.clip();
  if(id==='ev_out_sailor'){g.fillStyle='#fff';g.fillRect(-24,shy-2,48,70);g.fillStyle='#2a56b8';g.beginPath();g.moveTo(-22,shy);g.lineTo(0,shy+14);g.lineTo(22,shy);g.lineTo(22,shy+6);g.lineTo(0,shy+20);g.lineTo(-22,shy+6);g.fill();poly(g,[-4,shy+14,4,shy+14,0,shy+24],'#e84a5a')}
  else if(id==='ev_out_cloud'){g.fillStyle='#c8e4ff';g.fillRect(-24,shy-2,48,70);for(let i=0;i<5;i++){g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(-18+i*9,shy+8+(i%2)*10,5,3.4,0,0,6.28);g.fill()}txt(g,'☾',8,shy+28,9,'#ffe04a','center',0)}
  else if(id==='ev_out_knight'){const gr=g.createLinearGradient(-20,shy,20,-26);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#9aa8c8');g.fillStyle=gr;g.fillRect(-24,shy-2,48,70);g.fillStyle='#2a56b8';g.fillRect(-7,shy-2,14,70);g.fillStyle='#ffd34a';g.beginPath();g.arc(0,shy+14,4,0,6.28);g.fill()}
  g.restore();g.save();torsoPath(g,shy);g.lineWidth=2.4;g.strokeStyle=O_;g.stroke();g.restore()}}
// 망토(날개)
{const _dc=drawCape;drawCape=function(g,id,t,st,shy){
  if(id!=='ev_cape_butterfly'&&id!=='ev_cape_dragon')return _dc(g,id,t,st,shy);
  const f=Math.sin(t*(st==='air'?12:4))*.25;g.save();
  for(const s of[-1,1]){g.save();g.translate(s*4,shy+6);g.scale(s,1);g.rotate(-.5-f);
    if(id==='ev_cape_butterfly'){g.beginPath();g.ellipse(-14,-10,14,11,-.5,0,6.28);g.fillStyle='rgba(255,150,224,.85)';g.fill();g.lineWidth=1.6;g.strokeStyle=O_;g.stroke();g.beginPath();g.ellipse(-10,6,9,7,.4,0,6.28);g.fillStyle='rgba(170,200,255,.85)';g.fill();g.stroke();circ(g,-16,-12,3,'#fff')}
    else{g.beginPath();g.moveTo(0,0);g.lineTo(-30,-22);g.lineTo(-34,-6);g.quadraticCurveTo(-26,0,-30,10);g.quadraticCurveTo(-18,4,-14,14);g.closePath();g.fillStyle='#c02a3a';g.fill();g.lineWidth=1.8;g.strokeStyle=O_;g.stroke();g.strokeStyle='rgba(255,200,140,.7)';g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(-30,-22);g.moveTo(0,0);g.lineTo(-30,10);g.stroke()}
    g.restore()}g.restore()}}
// 오라
{const _da=drawAuraFx;drawAuraFx=function(p,dt){const a=p.eq&&p.eq.aura;if(!a||!a.startsWith('ev_'))return _da(p,dt);p._ax=(p._ax||0)-dt;if(p._ax>0)return;p._ax=.09;const cx=p.x,cy=p.y-30;
  if(a==='ev_aura_snow')parts.push({x:cx+rnd(-30,30),y:p.y-rnd(50,80),vx:rnd(-12,12),vy:rnd(20,45),life:1.2,max:1.2,size:rnd(2,3.6),col:'#ffffff',grav:0,glow:true});
  else if(a==='ev_aura_bubble')parts.push({x:cx+rnd(-20,20),y:p.y-rnd(0,20),vx:rnd(-15,15),vy:rnd(-60,-30),life:1,max:1,size:rnd(3,6),col:'rgba(170,230,255,.8)',grav:-10,glow:false});
  else if(a==='ev_aura_note')parts.push({x:cx+rnd(-22,22),y:cy+rnd(-10,10),vx:rnd(-20,20),vy:rnd(-50,-25),life:.9,max:.9,size:rnd(3,5),col:Math.random()<.5?'#ffb0e0':'#b0d0ff',grav:-15,glow:true})}}
// 이벤트에서 얻기 : 이벤트 치장 상자
function giveEvCos(why){const left=EV_COS.filter(k=>!SAVE.inv[k]);if(!left.length){SAVE.ec=(SAVE.ec||0)+5;return'치장을 모두 모았어요! 대신 ◆5'}const k=left[(Math.random()*left.length)|0];SAVE.inv[k]=1;saveGame();return'🎀 '+ITEMS[k].n+(why?' ('+why+')':'')}
{const _ar=arenaWon;arenaWon=function(me,tn,names){_ar(me,tn,names);if(me){const r=giveEvCos('쟁탈전 우승');setTimeout(()=>G.toast(r),2500)}}}
{const _gr=grantRaidItem;grantRaidItem=function(key){_gr(key)}}
{const _bf=bossFinish;bossFinish=function(b){const raid=b.raid;_bf(b);if(raid&&Math.random()<.35){const r=giveEvCos('레이드 참가');setTimeout(()=>G.toast(r),3000)}}}
{const _km=killMob;killMob=function(m){const fb=m.fb&&!m.dead;_km(m);if(fb&&m.dead&&Math.random()<.12){const r=giveEvCos('필드 보스');G.toast(r)}
  // 저녁 경험치 이벤트 · 운영자 이벤트 중엔 사냥하다가 가끔 치장 상자
  if(m.dead&&!m.fb&&typeof evOn==='function'&&evOn()&&Math.random()<.0015){const r=giveEvCos('이벤트 중 사냥');G.banner={t:0,name:'🎁 이벤트 치장 상자!',sub:r}}}}
{const _ch=openChest;openChest=function(n){const was=SAVE.flags['chest_'+n.town]===dayNum();_ch(n);if(!was&&Math.random()<.08){const r=giveEvCos('보물상자');setTimeout(()=>G.toast(r),600)}}}

/* ---------- 새 사냥터 6곳 ---------- */
const NHUNTS=[
 {id:'nh1',name:'버섯 요정 숲',min:22,theme:'forest',lm:'mushcave',hue:0,mobs:['mush','bunny','bat'],sub:'형광 버섯이 가로등처럼 빛나는 숲'},
 {id:'nh2',name:'산호초 바닷속 길',min:38,theme:'sea',lm:'sea',hue:0,mobs:['crab','jelly'],sub:'물결 아래 산호와 해초가 흔들리는 길'},
 {id:'nh3',name:'유령선 갑판',min:52,theme:'night',lm:'stars',hue:260,mobs:['lamp','bat','crab'],sub:'별빛 아래 떠도는 낡은 배'},
 {id:'nh4',name:'수정 사막',min:63,theme:'origin',lm:'crystal',hue:30,mobs:['golem','gear'],sub:'모래 속에서 수정이 자라는 사막'},
 {id:'nh5',name:'구름 위 정원',min:78,theme:'sky',lm:'garden',hue:0,mobs:['sheep','owl','drake'],sub:'구름 위에 핀 꽃밭과 바람 비룡'},
 {id:'nh6',name:'얼음 수정 동굴',min:92,theme:'snow',lm:'crystal',hue:190,mobs:['snowman','golem','lamp'],sub:'푸른 얼음 기둥이 노래하는 동굴'},
];
function buildNH(i){
  const T=NHUNTS[i],gy=470,Wd=3000,r=mulberry(8100+i*17),ms=Math.max(2,T.min*.15);
  const L=newL({id:T.id,name:T.name,sub:'Lv.'+T.min+'~'+(T.min+18)+' · '+T.sub,theme:T.theme,music:i%2?'sky':'field',w:Wd,h:540,mscale:ms,allHue:T.hue,hunt:1,spawn:{x:140,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));L.landmark={k:T.lm,x:0,y:gy};
  const LAYS=[[[360,[[200,600],[1000,560],[1800,640]]],[255,[[520,520],[1360,480],[2200,520]]],[150,[[860,460],[1720,480]]]],
             [[365,[[140,520],[860,600],[1660,520],[2400,420]]],[262,[[420,480],[1260,460],[2060,520]]],[160,[[700,560],[1560,520]]]]];
  const tiers=LAYS[i%2],gr=T.mobs.filter(k=>!MOBS[k].fly),fl=T.mobs.filter(k=>MOBS[k].fly);let gi=i,fi=0;
  for(const[y,list]of tiers)for(const[x,w]of list){L.plats.push(plat(x,y,w,16,'o'));L.ropes.push({x:x+40+Math.round(r()*(w-80)),y1:y,y2:gy});const n=w>=500?2:1;for(let k=0;k<n;k++)L.mobs.push([gr[(gi++)%gr.length],x+40+(w-80)*(k+.5)/n,y,x+12,x+w-12])}
  for(let k=0;k<7;k++){const x=340+k*360;L.mobs.push([gr[(gi++)%gr.length],x,gy,x-150,x+150])}
  if(fl.length)for(let k=0;k<4;k++)L.mobs.push([fl[(fi++)%fl.length],520+k*600,200+(k%2)*70,90]);
  const top=tiers[2][1][1],hy=tiers[2][0]-120;L.plats.push(plat(top[0]+top[1]/2-70,hy,140,14,'o',{cloud:1}));L.npcs=[{id:'chest',name:'하늘 보물상자',x:top[0]+top[1]/2,gy:hy,look:'chest',town:T.id}];
  const next=NHUNTS[i+1];L.portals=[{x:60,y:gy,to:'town',label:'← 야채마을'}];
  L.portals.push(next?{x:Wd-70,y:gy,to:next.id,label:next.name+' →',lockLv:next.min}:{x:Wd-70,y:gy,to:'tp1',label:'별의 신전 →',lockLv:80});
  L.sign={x:230,y:gy,t:T.name,s:'Lv.'+T.min+'~'};
  return fixReach(L);
}
NHUNTS.forEach((T,i)=>{MAPS[T.id]=()=>buildNH(i)});
{const _ah=allHunts;allHunts=function(){const a=_ah();for(const T of NHUNTS)a.push({id:T.id,n:T.name,min:T.min,where:'새 사냥터'});return a}}

/* ---------- 택시 : 레벨 그룹 폴더 ---------- */
{const _td=taxiDests;taxiDests=function(){const d=_td();for(const T of NHUNTS)if(S.id!==T.id)d.push({id:T.id,n:'🍃 '+T.name+'  (Lv.'+T.min+'~)',c:100+T.min*6,min:T.min});return d}}
const TAXI_DIRS=[
  {k:'town',n:'🏘 마을 · 직업 마을',f:d=>d.id==='town'||d.id==='harbor'||d.id.startsWith('jt_')},
  {k:'lv1',n:'🌱 사냥터 Lv.1 ~ 29',f:d=>d.min!=null&&d.min<30},
  {k:'lv30',n:'🌿 사냥터 Lv.30 ~ 59',f:d=>d.min!=null&&d.min>=30&&d.min<60},
  {k:'lv60',n:'🌳 사냥터 Lv.60 ~ 99',f:d=>d.min!=null&&d.min>=60&&d.min<100},
  {k:'lv100',n:'🐉 Lv.100 ~ (용의 요새)',f:d=>d.min!=null&&d.min>=100},
  {k:'etc',n:'🗺 던전 입구 · 특별한 곳',f:()=>true},
];
function taxiGroups(){
  const all=taxiDests(),used=new Set(),groups=[];
  for(const D of TAXI_DIRS){const list=all.filter(d=>!used.has(d)&&D.f(d));list.forEach(d=>used.add(d));if(list.length)groups.push({D,list})}
  return groups;
}
taxiMenu=function(n){
  const groups=taxiGroups(),lv=SAVE.lvl;let rec=null,best=-1;for(const g of groups){if(g.D.k==='town')continue;for(const d of g.list)if(d.min&&d.min<=lv&&d.min>best){best=d.min;rec=g}}
  const opts=groups.map(g=>{const open=g.list.filter(d=>!d.min||SAVE.lvl>=d.min).length;return{t:g.D.n+'  ('+open+'/'+g.list.length+')'+(g===rec?'  ⭐ 추천':''),fn:()=>taxiFolder(n,g)}});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,'어디로 갈까? 레벨대별로 골라봐!  보유 ● '+SAVE.coins,opts);
};
function taxiFolder(n,g){
  const opts=g.list.map(d=>{const lock=d.min&&SAVE.lvl<d.min;return{t:(lock?'🔒 ':'')+d.n+'  — '+(d.c?d.c+'●':'무료'),fn:()=>{
    if(lock){G.toast('Lv.'+d.min+'부터 갈 수 있어요');return}if(SAVE.coins<d.c){G.toast('코인이 부족해요 ('+d.c+'●)');return}
    SAVE.coins-=d.c;closeUI();sfx('portal');goMap(d.id,false,!!d.end);G.toast('뭉게뭉게~ 구름 택시 출발!')}}});
  opts.push({t:'← 폴더 목록',fn:()=>taxiMenu(n)},{t:'닫기',fn:closeUI});
  openDialog(n.name+' · '+g.D.n.replace(/^\S+\s/,''),g.list.length+'곳 · 보유 ● '+SAVE.coins,opts);
}
