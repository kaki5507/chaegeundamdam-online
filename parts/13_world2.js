/* ============================================================
   WORLD2 : 실시간 접속(같은 맵 유저 보기) · 넓어진 야채마을 · 높은 곳 NPC
   ============================================================ */
/* ---------- 실시간 접속 ---------- */
let WSK=null,PEERS={},ONLINE_N=0,_stT=0;
function presenceConnect(){
  if(location.protocol==='file:'||WSK)return;
  try{WSK=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws')}catch(e){WSK=null;return}
  WSK.onopen=()=>presenceHello();
  WSK.onmessage=e=>{let o;try{o=JSON.parse(e.data)}catch(_){return}
    if(o.t!=='peers')return;ONLINE_N=o.online;const seen={};
    for(const p of o.peers){seen[p.id]=1;const q=PEERS[p.id];if(q){if(q.tg.map!==p.map||Math.hypot(p.x-q.x,p.y-q.y)>500){q.x=p.x;q.y=p.y}q.tg=p}else PEERS[p.id]={tg:p,x:p.x,y:p.y,t:Math.random()*5}}
    for(const k in PEERS)if(!seen[k])delete PEERS[k]};
  WSK.onclose=()=>{WSK=null;PEERS={};ONLINE_N=0;setTimeout(presenceConnect,4000)};
  WSK.onerror=()=>{};
}
function presenceHello(){if(WSK&&WSK.readyState===1&&ACCT)WSK.send(JSON.stringify({t:'hello',token:ACCT.token}))}
const stateOf=p=>p.dead?'idle':p.stun>0?'hurt':p.skillT>0&&p.atkT<=0?'skill':p.atkT>0?'atk':p.rope?'climb':!p.onGround?'air':Math.abs(p.vx)>30?'run':'idle';
function presenceStep(dt){
  for(const k in PEERS){const q=PEERS[k],k2=Math.min(1,dt*12);q.x+=(q.tg.x-q.x)*k2;q.y+=(q.tg.y-q.y)*k2;q.t+=dt}
  if(!WSK||WSK.readyState!==1||!S||!PARTY[0]||G.state!=='play')return;
  _stT-=dt;if(_stT>0)return;_stT=.1;
  const p=PARTY[0];
  WSK.send(JSON.stringify({t:'st',map:S.id,x:Math.round(p.x),y:Math.round(p.y),f:p.face,s:stateOf(p),j:SAVE.job,ti:SAVE.tier,fi:SAVE.fid|0,lv:SAVE.lvl,eq:p.eq}));
}
const myName=()=>ACCT?ACCT.name:'나';
function nameTag(g,x,y,s,col,bg){g.font=F(11);const w=g.measureText(s).width+10;g.fillStyle=bg||'rgba(90,60,150,.75)';g.beginPath();g.roundRect(x-w/2,y,w,15,7);g.fill();txt(g,s,x,y+11.5,11,col||'#fff','center',0)}
function speech(g,x,y,text){
  g.font=F(12);const lines=wrap(g,text,150,12).slice(0,3),w=Math.min(170,Math.max(...lines.map(l=>g.measureText(l).width))+18),h=lines.length*15+10;
  g.fillStyle='rgba(255,250,254,.96)';g.strokeStyle='#f0a8e0';g.lineWidth=1.6;g.beginPath();g.roundRect(x-w/2,y-h,w,h,8);g.fill();g.stroke();
  g.beginPath();g.moveTo(x-5,y);g.lineTo(x,y+7);g.lineTo(x+5,y);g.closePath();g.fill();
  lines.forEach((l,i)=>txt(g,l,x,y-h+17+i*15,12,'#6a3a9a','center',0));
}
function lastSay(name){for(let i=CHAT.length-1;i>=0;i--){const m=CHAT[i];if(G.t-m.at>5)return null;if(m.kind==='map'&&m.name===name)return m.text}return null}
function drawPeers(g,t){
  for(const k in PEERS){const q=PEERS[k],p=q.tg;if(p.map!==S.id)continue;
    drawVeggie(g,JOB[p.j]||JOB.warrior,{sc:WSC,x:q.x,y:q.y,face:p.f,t:q.t,st:p.s,eq:p.eq||{},tier:p.ti,fid:p.fi});
    nameTag(g,q.x,q.y+3,p.name+' Lv.'+p.lv,'#fff');
    const say=lastSay(p.name);if(say)speech(g,q.x,q.y-62,say);
  }
}
function drawSelfTag(g){const p=PARTY[0];if(!p||p.dead)return;nameTag(g,p.x,p.y+3,myName(),'#ffe9a0','rgba(60,30,0,.75)');const say=lastSay(myName());if(say)speech(g,p.x,p.y-62,say)}

/* ---------- 넓어진 야채마을 + 높은 곳 NPC ---------- */
Object.assign(NPC_LOOK_X,{
  swingkid:{job:'archer',eq:{hat:'hat_flower'},n:'그네 타는 단비',fid:1},
  roofcat:{job:'guardian',eq:{hat:'hat_gat',face:'face_sun'},n:'지붕 위 고양이 할아버지',fid:6},
  balloon:{job:'gunner',eq:{hat:'hat_helm',cape:'cape_red'},n:'열기구 아저씨 뭉게',fid:13},
  lookout:{job:'rogue',eq:{face:'face_patch'},n:'망루 지기 바다',fid:4},
});
GIVER_NAME.swingkid='그네 타는 단비';
NPCS.push({id:'swingkid',name:'그네 타는 단비',x:1180,look:'swingkid',tag:'퀘스트',swing:{by:240,len:150}},
  {id:'roofcat',name:'지붕 위 고양이 할아버지',x:640,look:'roofcat',tag:'수다',roof:1},
  {id:'balloon',name:'열기구 아저씨 뭉게',x:2240,look:'balloon',tag:'하늘 구경',high:1},
  {id:'lookout',name:'망루 지기 바다',x:0,look:'lookout',tag:'수다',map:'harbor'});
QUESTS.tw1={name:'마을 높은 곳 탐험',giver:'swingkid',min:5,desc:'단비가 그네에서 내려다보며 말한다. "지붕 위 고양이 할아버지랑 열기구 아저씨, 둘 다 만나고 와 봐! 높은 데 있어서 점프 잘해야 해!"',
  objs:[{t:'flag',key:'roof',label:'지붕 위 고양이 할아버지 만나기'},{t:'flag',key:'balloon',label:'열기구 아저씨 만나기'}],rew:{exp:150,coin:300,item:'face_heart'}};
const TALK_LINES={
  roofcat:['여기가 마을에서 제일 바람이 잘 드는 곳이지. 냐옹~ 아니, 에헴.','지붕 위에서 보면 모험가들이 개미만 해. 자네도 귀엽구먼.','저 열기구 아저씨는 맨날 내려오질 않아. 하늘이 그렇게 좋을까.'],
  balloon:['어서 와! 여기까지 올라오다니 점프 실력이 대단한걸?','날씨 좋은 날엔 저 멀리 새싹 항구 등대까지 보인다구!','언젠가 이 열기구로 구름 위 하늘길까지 날아갈 거야.'],
  lookout:['배 위 망루는 내 자리야. 바다 냄새 최고지?','저기 수평선 너머에 야채마을이 있어. Lv.5가 되면 갈 수 있다구!','갈매기가 내 빵을 훔쳐 갔어… 세 번째야.'],
};
function talkExtra(n){
  if(n.id==='roofcat'){qev('flag','roof')}
  if(n.id==='balloon'){qev('flag','balloon')}
  if(n.id==='swingkid')return questMenu(n,'swingkid','우와~ 그네 높이 올라간다! 오빠(언니)도 탈래? 아니면… 내 부탁 들어줄래?');
  const L=TALK_LINES[n.id];if(L)openDialog(n.name,L[Math.random()*L.length|0]);
}
const HOUSES=[{x:520,w:260,h:150,roof:'#e05a4a',wall:'#fff1d6'},{x:1500,w:220,h:130,roof:'#4a8ae0',wall:'#f4ecff'},{x:2080,w:300,h:170,roof:'#3fae6a',wall:'#fff6e0'},{x:2700,w:240,h:140,roof:'#e0a030',wall:'#ffeef0'},{x:3280,w:200,h:120,roof:'#a05ad0',wall:'#f0fff4'}];
function buildTown2(){
  const L=buildTown(),K=1.4,OFF=520;   // 왼쪽 520px 은 큰 나무 공원
  L.w=3700+OFF;L.spawn.x=Math.round(L.spawn.x*K)+OFF;
  for(const p of L.plats){if(p.h>=300){p.x=-300;p.w=L.w+600}else p.x=Math.round((p.x+p.w/2)*K-p.w/2)+OFF}
  for(const r of L.ropes)r.x=Math.round(r.x*K)+OFF;
  for(const d of L.dummies)d.x=Math.round(d.x*K)+OFF;
  for(const po of L.portals)po.x=Math.round(po.x*K)+OFF+(po.to==='stele'?-30:0);
  const gy=470;
  L.npcs=NPCS.filter(n=>!n.map&&!n.maps&&!n.swing&&!n.roof&&!n.high).map(n=>Object.assign({gy},n,{x:Math.round(n.x*K)+OFF}));
  // 지붕 산책로 (집 지붕 위를 걸을 수 있다)
  const HS=HOUSES.map(h=>Object.assign({},h,{x:h.x+OFF}));
  for(const h of HS)L.plats.push(plat(h.x+10,gy-h.h-26,h.w-20,14,'o',{roof:1}));
  L.ropes.push({x:HS[0].x+HS[0].w-30,y1:gy-HS[0].h-26,y2:gy},{x:HS[2].x+30,y1:gy-HS[2].h-26,y2:gy});
  // 큰 나무 가지 (그네가 매달린 곳)
  L.plats.push(plat(200,240,240,16,'o',{branch:1}),plat(80,350,110,14,'o'));L.ropes.push({x:430,y1:240,y2:gy});
  // 열기구로 가는 구름 계단
  const bx=2265+OFF+300;L.plats.push(plat(bx+155,300,110,14,'o',{cloud:1}),plat(bx+295,220,110,14,'o',{cloud:1}),plat(bx+135,150,120,14,'o',{cloud:1}),plat(bx-75,120,150,14,'o',{basket:1}));
  const roof=HS[0];
  L.npcs.push(Object.assign({},NPCS.find(n=>n.id==='roofcat'),{x:roof.x+roof.w/2,gy:gy-roof.h-26}));
  L.npcs.push(Object.assign({},NPCS.find(n=>n.id==='swingkid'),{x:320,gy}));
  L.npcs.push(Object.assign({},NPCS.find(n=>n.id==='balloon'),{x:bx,gy:120}));
  L.houses=HS;L.bigTree={x:320,y:gy};L.balloon={x:bx,y:120};
  return L;
}
MAPS.town=buildTown2;
// 항구도 크게 + 배 망루 NPC
const _buildHarbor1=buildHarbor;
MAPS.harbor=function(){
  const L=_buildHarbor1();const Wd=3300,gy=470;L.w=Wd;
  L.plats=L.plats.filter(p=>!p.pier);for(let x=1760;x<Wd+300;x+=110)L.plats.push(plat(x,gy,110,300,'s',{pier:true}));
  L.plats.push(plat(1950,360,160,14,'o'),plat(2200,280,150,14,'o'),plat(2450,360,160,14,'o'),plat(170,330,150,14,'o'),plat(330,240,130,14,'o'));
  L.mobs.push(['egg',2030,360,1960,2100],['egg',2520,360,2460,2600],['egg',2100,gy,1800,2700],['egg',2500,gy,1800,2700]);
  const bx=Wd-200;L.boatX=bx;
  L.plats.push(plat(bx-40,300,80,14,'o',{nest:1}));L.ropes.push({x:bx+12,y1:300,y2:gy});
  L.npcs.push(Object.assign({},NPCS.find(n=>n.id==='lookout'),{x:bx,gy:300}));
  L.portals=[{x:bx+90,y:gy,to:'town',label:'⛵ 야채마을행 배',lockLv:5,boat:true}];
  return L;
};
function drawTownDecor(g,L,t,cam){
  const gy=470;
  // 집
  for(const h of L.houses||[]){
    if(h.x+h.w<cam.x-50||h.x>cam.x+W+50)continue;
    const x=h.x,y=gy-h.h,w=h.w;
    g.fillStyle=h.wall;g.fillRect(x,y,w,h.h);g.strokeStyle=O_;g.lineWidth=3;g.strokeRect(x,y,w,h.h);
    g.fillStyle='rgba(0,0,0,.06)';for(let yy=y+12;yy<gy;yy+=16)g.fillRect(x+2,yy,w-4,2);
    poly(g,[x-18,y,x+w/2,y-30,x+w+18,y,x+w+8,y-12+12,],h.roof,O_,3);
    g.fillStyle=h.roof;g.beginPath();g.moveTo(x-18,y+2);g.lineTo(x+14,y-28);g.lineTo(x+w-14,y-28);g.lineTo(x+w+18,y+2);g.closePath();g.fill();g.stroke();
    g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x+16,y-24,w-32,4);
    // 문 · 창
    g.fillStyle='#8a5a30';g.beginPath();g.roundRect(x+w/2-16,gy-48,32,48,[14,14,0,0]);g.fill();g.stroke();circ(g,x+w/2+8,gy-24,2.4,'#ffd34a');
    for(const s of[-1,1]){const wx=x+w/2+s*(w/2-40)-16,wy=y+26;g.fillStyle='#bfe8ff';g.fillRect(wx,wy,32,28);g.strokeRect(wx,wy,32,28);g.beginPath();g.moveTo(wx+16,wy);g.lineTo(wx+16,wy+28);g.moveTo(wx,wy+14);g.lineTo(wx+32,wy+14);g.stroke();
      g.fillStyle='#ff8ac0';for(let i=0;i<4;i++)circ(g,wx+4+i*8,wy+31,3,['#ff8ac0','#ffe04a','#ff6a5a','#fff'][i])}
    // 굴뚝 연기
    g.fillStyle='#8a5a40';g.fillRect(x+w-50,y-46,16,26);g.strokeRect(x+w-50,y-46,16,26);
    for(let i=0;i<3;i++){const k=(t*.5+i/3)%1;g.globalAlpha=(1-k)*.6;circ(g,x+w-42+Math.sin(k*6)*6,y-52-k*50,6+k*8,'#ffffff');g.globalAlpha=1}
  }
  // 큰 나무 + 그네
  const T=L.bigTree;if(T&&T.x>cam.x-400&&T.x<cam.x+W+400){
    g.fillStyle='#8a5a30';g.beginPath();g.moveTo(T.x-30,T.y);g.quadraticCurveTo(T.x-18,T.y-120,T.x-28,T.y-250);g.lineTo(T.x+24,T.y-250);g.quadraticCurveTo(T.x+14,T.y-120,T.x+32,T.y);g.closePath();g.fill();g.strokeStyle=O_;g.lineWidth=3;g.stroke();
    for(const[cx,cy,r]of[[T.x-90,T.y-280,70],[T.x+60,T.y-300,80],[T.x-10,T.y-340,75],[T.x+130,T.y-250,55],[T.x-150,T.y-240,50]]){circ(g,cx,cy,r,'#4ab85a',O_,3);circ(g,cx-r*.3,cy-r*.3,r*.45,'rgba(255,255,255,.18)')}
    for(let i=0;i<6;i++)circ(g,T.x-120+i*48,T.y-260+Math.sin(i*2)*40,6,'#ff7a6a',O_,1.5);
  }
  // 열기구
  const B=L.balloon;if(B&&B.x>cam.x-300&&B.x<cam.x+W+300){
    const bob=Math.sin(t*1.3)*4,x=B.x,y=B.y-6+bob;
    g.strokeStyle='#6a4a2a';g.lineWidth=2;for(const s of[-1,1]){g.beginPath();g.moveTo(x+s*60,y-6);g.lineTo(x+s*40,y-120);g.stroke()}
    const gr=g.createLinearGradient(x-90,0,x+90,0);['#ff6a5a','#ffd34a','#5ac87a','#5ab0ff','#c05aff'].forEach((c,i)=>gr.addColorStop(i/4,c));
    g.beginPath();g.ellipse(x,y-190,95,100,0,0,6.28);g.fillStyle=gr;g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke();
    g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(x-35,y-225,22,40,-.3,0,6.28);g.fill();
    g.fillStyle='#b07a40';g.beginPath();g.roundRect(x-76,y-2,152,30,6);g.fill();g.stroke();
    g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1.5;for(let i=-60;i<=60;i+=15){g.beginPath();g.moveTo(x+i,y);g.lineTo(x+i,y+26);g.stroke()}
  }
  // 꽃 화분 · 울타리
  for(let x=60;x<L.w;x+=170){if(x<cam.x-60||x>cam.x+W+60)continue;g.fillStyle='#fff';for(let k=0;k<3;k++){g.fillRect(x+k*14,gy-24,4,24)}g.fillRect(x-4,gy-18,40,4);g.strokeStyle=O_;g.lineWidth=1.2;g.strokeRect(x-4,gy-18,40,4)}
  // 줄 전등
  for(let x=200;x<L.w-200;x+=520){if(x+520<cam.x||x>cam.x+W)continue;g.strokeStyle='#5a3a1c';g.lineWidth=1.6;g.beginPath();g.moveTo(x,gy-150);g.quadraticCurveTo(x+130,gy-110,x+260,gy-150);g.stroke();
    for(let i=1;i<8;i++){const k=i/8,lx=x+260*k,ly=gy-150+Math.sin(k*Math.PI)*36;circ(g,lx,ly+4,4,['#ff6a5a','#ffd34a','#5ac87a','#5ab0ff'][i%4],O_,1)}}
}
function drawSwingNPC(g,n,t,faceDir){
  const sw=n.swing,ang=Math.sin(t*1.6)*.55,bx=n.x,by=sw.by,sx=bx+Math.sin(ang)*sw.len,sy=by+Math.cos(ang)*sw.len;
  g.strokeStyle='#6a4a2a';g.lineWidth=2;for(const s of[-14,14]){g.beginPath();g.moveTo(bx+s,by);g.lineTo(sx+s,sy);g.stroke()}
  g.fillStyle='#b07a40';g.fillRect(sx-20,sy-3,40,7);g.strokeStyle=O_;g.lineWidth=1.6;g.strokeRect(sx-20,sy-3,40,7);
  const xl=NPC_LOOK_X[n.look];drawVeggie(g,JOB[xl.job],{sc:WSC,x:sx,y:sy+2,face:ang>0?1:-1,t:t+n.x,st:'air',eq:xl.eq,fid:xl.fid});
  n.labelY=sy-44;
}
