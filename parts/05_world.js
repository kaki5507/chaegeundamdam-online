/* ============================================================
   WORLD : maps (town / jump maps / boss arenas / party quest)
   ============================================================ */
function plat(x,y,w,h,t,extra){return Object.assign({x,y,w,h,t,dx:0,dy:0},extra||{})}
function newL(o){return Object.assign({id:'',name:'',sub:'',theme:'forest',music:'field',w:1280,h:540,plats:[],ropes:[],spikes:[],drops:[],mobs:[],flags:[],portals:[],npcs:[],dummies:[],boxes:[],plates:[],spawn:{x:150,y:470},killY:9999,walls:true,mscale:1,boss:null},o)}

function buildTown(){
  const Wd=2600,gy=470;
  const L=newL({id:'town',name:'야채마을',sub:'모험의 시작 · 촌장님을 찾아가자',theme:'forest',music:'field',w:Wd,h:540,town:true,spawn:{x:250,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));
  L.plats.push(plat(920,300,170,14,'o'));
  L.ropes.push({x:1005,y1:300,y2:gy});
  L.plats.push(plat(1500,380,150,14,'o'),plat(1640,300,120,14,'o'));   // decorative hop
  L.npcs=NPCS.filter(n=>!n.map&&!n.maps).map(n=>Object.assign({gy},n));
  L.dummies=[{x:560,y:gy},{x:660,y:gy},{x:760,y:gy}];
  L.portals=[{x:2290,y:gy,to:'forest',label:'도깨비 숲'},{x:2450,y:gy,to:'sky',label:'하늘길',lock:'dokkaebi'}];
  return L;
}

function buildForest(){
  const r=mulberry(11),Wd=1280,kinds=[],dys=[];
  for(let i=0;i<26;i++){let k='n';if(i>3&&i%7===4)k='r';else if(i>8&&i%8===2)k='m';kinds.push(k);dys.push(k==='r'?188:k==='m'?18:Math.round(58+r()*14))}
  const climb=dys.reduce((a,b)=>a+b,0)+80,Hh=climb+700,gy=Hh-70;
  const L=newL({id:'forest',name:'도깨비 숲 오르기',sub:'점프맵 · 꼭대기의 홍살문까지 올라라',theme:'forest',music:'field',w:Wd,h:Hh,spawn:{x:Wd/2,y:gy},killY:Hh+400,mscale:1});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));
  L.mobs.push(['egg',300,gy,120,520],['egg',980,gy,760,1200]);
  let cur={x:Wd/2-130,y:gy,w:260},y=gy;
  for(let i=0;i<26;i++){
    const k=kinds[i];y-=dys[i];let w,nx;
    if(k==='r'){
      const rx=clamp(cur.x+cur.w*(.3+r()*.4),90,Wd-90);w=150+r()*60;nx=clamp(rx-w/2+(r()-.5)*40,60,Wd-60-w);
      L.ropes.push({x:rx,y1:y,y2:cur.y});L.plats.push(plat(nx,y,w,14,'o'));
    }else if(k==='m'){
      const dir=cur.x+cur.w/2<Wd/2?1:-1;w=150;const gap=230;
      let bx=dir>0?cur.x+cur.w+gap:cur.x-gap-w;bx=clamp(bx,50,Wd-50-w);
      const ea=dir>0?cur.x+cur.w:cur.x,eb=dir>0?bx:bx+w,gp=Math.abs(eb-ea),mid=(ea+eb)/2;
      if(gp>110){L.plats.push(plat(mid-50,cur.y-8,100,14,'o',{mv:{x0:mid-50,y0:cur.y-8,ax:Math.max(10,gp/2-32),ay:0,sp:1.05,ph:r()*6}}))}
      nx=bx;L.plats.push(plat(nx,y,w,14,'o'));
    }else{
      w=Math.round(110+r()*90);let dir=r()<.5?-1:1;if(cur.x<120)dir=1;if(cur.x+cur.w>Wd-120)dir=-1;
      const gap=26+r()*50;nx=dir>0?cur.x+cur.w+gap:cur.x-gap-w;nx=clamp(nx,60,Wd-60-w);
      L.plats.push(plat(nx,y,w,14,'o'));
      if(w>=170&&i%3===2)L.spikes.push({x:nx+w/2-22,y,w:44});
      else if(w>=150&&r()<.5)L.mobs.push(['egg',nx+w/2,y,nx+14,nx+w-14]);
      if(i%4===3)L.drops.push({x:nx+w/2+(r()-.5)*60,y:y-330,period:3.2+r(),ph:r()*3});
      if(i%4===1)L.mobs.push(['wisp',nx+w/2,y-100,70]);
    }
    if(i%6===5)L.flags.push({x:nx+w/2,y});
    cur={x:nx,y,w};
  }
  y-=80;L.plats.push(plat(0,y,Wd,14,'o',{big:true}));
  L.portals.push({x:Wd/2,y,to:'boss1',label:'도깨비 대왕의 마당',reach:'forest'});
  L.npcs=NPCS.filter(n=>n.map==='forest').map(n=>Object.assign({gy:y},n,{x:Wd/2-230}));L.endSpawn={x:Wd/2-110,y};
  return L;
}

function buildSky(){
  const r=mulberry(29),Hh=1000,seq=['n','c','n','m','n','v','c','n','n','m'];
  const L=newL({id:'sky',name:'구름 위 하늘길',sub:'점프맵 · 떨어지면 체력을 잃는다',theme:'sky',music:'sky',w:0,h:Hh,killY:Hh+90,mscale:2.2,pit:true});
  let y=720;L.plats.push(plat(-300,y,660,400,'s'));L.spawn={x:180,y};
  let cur={x:0,w:360,y},x=360;
  for(let i=0;i<32;i++){
    const k=i<2?'n':seq[(i*3+1)%seq.length];let nx,w,ny;
    if(k==='m'){
      const gap=250;w=130;ny=cur.y-10;
      L.plats.push(plat(x+gap/2-50,cur.y-4,100,16,'o',{mv:{x0:x+gap/2-50,y0:cur.y-4,ax:gap/2-62,ay:0,sp:1.0,ph:r()*6}}));
      nx=x+gap;L.plats.push(plat(nx,ny,w,16,'o'));
    }else if(k==='v'){
      const up=cur.y>=560,dist=170;w=130;ny=up?cur.y-dist:cur.y+dist;
      const y0=up?cur.y-dist/2:cur.y+dist/2;
      L.plats.push(plat(x+40,y0,110,16,'o',{mv:{x0:x+40,y0,ax:0,ay:dist/2,sp:1.15,ph:up?Math.PI:0}}));
      nx=x+40+110+40;L.plats.push(plat(nx,ny,w,16,'o'));
    }else{
      const gap=36+r()*44;w=Math.round(110+r()*80);ny=clamp(cur.y+Math.round(-62+r()*110),340,820);nx=x+gap;
      const cr=k==='c';L.plats.push(plat(nx,ny,w,16,'o',cr?{crumble:{timer:0,fall:false,fy:0,back:0}}:{}));
      if(!cr&&w>=150&&i%3===0)L.spikes.push({x:nx+w/2-22,y:ny,w:44});
      else if(!cr&&w>=150&&i%3===1)L.mobs.push(['egg',nx+w/2,ny,nx+14,nx+w-14]);
      if(i%3===1)L.mobs.push(['wisp',nx+w/2,ny-110,80]);
      if(i%4===2)L.drops.push({x:nx+w/2,y:Math.max(60,ny-330),period:3+r(),ph:r()*3});
    }
    if(i===10||i===21)L.flags.push({x:nx+w/2,y:ny});
    cur={x:nx,w,y:ny};x=nx+w;
  }
  const ex=x+60;L.plats.push(plat(ex,cur.y,500,400,'s'));
  L.portals.push({x:ex+250,y:cur.y,to:'boss2',label:'달빛 신당',reach:'sky'});
  L.npcs=NPCS.filter(n=>n.map==='sky').map(n=>Object.assign({gy:cur.y},n,{x:ex+110}));L.endSpawn={x:ex+170,y:cur.y};
  L.w=ex+620;return L;
}

function arenaBase(o){
  const L=newL(Object.assign({w:1280,h:540,spawn:{x:170,y:470},arena:true},o));
  L.plats.push(plat(-300,470,1880,300,'s'));return L;
}
function buildArena1(){
  const L=arenaBase({id:'boss1',name:'도깨비 대왕의 마당',sub:'BOSS · 패턴을 읽고 피해라!',theme:'forest',music:'boss',boss:'dokkaebi'});
  L.plats.push(plat(120,350,200,14,'o'),plat(960,350,200,14,'o'),plat(540,255,200,14,'o'));return L;
}
function buildArena2(){
  const L=arenaBase({id:'boss2',name:'달빛 신당',sub:'BOSS · 구미호가 달 아래 기다린다',theme:'night',music:'boss',boss:'fox'});
  L.plats.push(plat(110,360,300,14,'o'),plat(870,360,300,14,'o'),plat(500,250,280,14,'o'));return L;
}

/* ---------- Party Quest : 달걀귀신 소굴 ---------- */
function buildPQ1(){
  const L=arenaBase({id:'pq1',name:'소굴 1단계 · 영혼 쿠폰',sub:'달걀귀신을 잡아 영혼 쿠폰 15장을 모아라',theme:'night',music:'boss',pq:1,mscale:1.8});
  L.plats.push(plat(110,350,240,14,'o'),plat(930,350,240,14,'o'),plat(520,250,240,14,'o'));
  L.spawner={max:9,every:1.5,types:['egg','egg','wisp']};
  L.portals.push({x:1200,y:470,to:'pq2',label:'다음 단계',hidden:true,pqNext:true});return L;
}
function buildPQ2(){
  const L=arenaBase({id:'pq2',name:'소굴 2단계 · 혼의 발판',sub:'세 명이 동시에 발판 위에 서라! (E : AI 동료 배치)',theme:'night',music:'boss',pq:2,mscale:1.8});
  L.plats.push(plat(420,390,150,14,'o'),plat(620,300,160,14,'o'),plat(840,210,160,14,'o'));
  L.plates=[{x:170,y:470,w:120},{x:630,y:300,w:140},{x:850,y:210,w:140}];
  L.spawner={max:5,every:2.6,types:['egg','wisp']};
  L.portals.push({x:1200,y:470,to:'pq3',label:'다음 단계',hidden:true,pqNext:true});return L;
}
function buildPQ3(){
  const L=arenaBase({id:'pq3',name:'소굴 3단계 · 열쇠 상자',sub:'상자를 부숴 열쇠 7개를 찾아라! (함정 주의)',theme:'night',music:'boss',pq:3,mscale:1.8});
  L.plats.push(plat(120,360,260,14,'o'),plat(900,360,260,14,'o'),plat(500,255,280,14,'o'));
  const spots=[[330,470],[420,470],[520,470],[610,470],[700,470],[820,470],[920,470],[1040,470],[160,360],[240,360],[330,360],[940,360],[1030,360],[1120,360],[560,255],[650,255],[740,255]];
  const idx=spots.map((_,i)=>i).sort(()=>Math.random()-.5);
  L.boxes=spots.map(([x,y],i)=>({x,y,hp:26,max:26,flash:0,key:idx.indexOf(i)<7,trap:idx.indexOf(i)>=7&&idx.indexOf(i)<11}));
  L.portals.push({x:1200,y:470,to:'pq4',label:'보스 방',hidden:true,pqNext:true});return L;
}
function buildPQ4(){
  const L=arenaBase({id:'pq4',name:'소굴 최하층 · 달걀귀신 대왕',sub:'BOSS · 파티원과 함께 쓰러뜨려라!',theme:'night',music:'boss',pq:4,boss:'eggking'});
  L.plats.push(plat(130,350,220,14,'o'),plat(930,350,220,14,'o'),plat(530,250,220,14,'o'));return L;
}
/* ---------- PvP 결투장 : 공중 섬. 밀려 떨어지면 낙사! ---------- */
function buildPvp(){
  const L=newL({id:'pvp',name:'낙사 결투장',sub:'PvP · 3KO 선취! 상대를 밀어서 떨어뜨려라',theme:'night',music:'boss',w:960,h:540,pvp:true,killY:640,spawn:{x:300,y:400},spawns:[{x:300,y:400},{x:660,y:400}]});
  L.plats.push(plat(170,420,620,200,'s'));
  L.plats.push(plat(240,310,150,14,'o'),plat(570,310,150,14,'o'),plat(405,215,150,14,'o'));
  return L;
}
/* ---------- 파티던전 : 귀문 동굴(용암 점프맵) → 귀목의 제단 ---------- */
function buildCave(){
  const r=mulberry(77),Hh=1000,seq=['n','c','m','n','c','v','n','c','m','c','n','v'];
  const L=newL({id:'cave',name:'귀문 동굴',sub:'파티던전 1단계 · 용암 위 숨겨진 길을 돌파하라',theme:'lava',music:'sky',w:0,h:Hh,killY:Hh+90,mscale:3,pit:true,cave:true});
  let y=720;L.plats.push(plat(-300,y,660,400,'s'));L.spawn={x:200,y};
  let cur={x:0,w:360,y},x=360;
  for(let i=0;i<40;i++){
    const k=i<2?'n':seq[(i*5+2)%seq.length];let nx,w,ny;
    if(k==='m'){
      const gap=260;w=120;ny=cur.y-10;
      L.plats.push(plat(x+gap/2-48,cur.y-4,96,16,'o',{mv:{x0:x+gap/2-48,y0:cur.y-4,ax:gap/2-60,ay:0,sp:1.15,ph:r()*6}}));
      nx=x+gap;L.plats.push(plat(nx,ny,w,16,'o'));
    }else if(k==='v'){
      const up=cur.y>=560,dist=170;w=120;ny=up?cur.y-dist:cur.y+dist;
      const y0=up?cur.y-dist/2:cur.y+dist/2;
      L.plats.push(plat(x+40,y0,104,16,'o',{mv:{x0:x+40,y0,ax:0,ay:dist/2,sp:1.25,ph:up?Math.PI:0}}));
      nx=x+40+104+40;L.plats.push(plat(nx,ny,w,16,'o'));
    }else{
      const gap=40+r()*46;w=Math.round(100+r()*70);ny=clamp(cur.y+Math.round(-60+r()*110),340,820);nx=x+gap;
      const cr=k==='c';L.plats.push(plat(nx,ny,w,16,'o',cr?{crumble:{timer:0,fall:false,fy:0,back:0}}:{}));
      if(!cr&&w>=140&&i%3===0)L.spikes.push({x:nx+w/2-22,y:ny,w:44});
      else if(!cr&&w>=130)L.mobs.push(['egg',nx+w/2,ny,nx+14,nx+w-14]);
      if(i%2===1)L.mobs.push(['wisp',nx+w/2,ny-110,80]);
      if(i%3===2)L.drops.push({x:nx+w/2,y:Math.max(60,ny-330),period:2.6+r(),ph:r()*3});
    }
    if(i===19)L.flags.push({x:nx+w/2,y:ny});
    cur={x:nx,w,y:ny};x=nx+w;
  }
  const ex=x+60;L.plats.push(plat(ex,cur.y,520,400,'s'));
  L.portals.push({x:ex+330,y:cur.y,to:'altar',label:'귀목의 제단',reach:'cave',party:true});
  L.npcs=NPCS.filter(n=>n.maps&&n.maps.includes('cave')).map(n=>Object.assign({},n,{x:330,gy:720}));
  L.w=ex+640;return L;
}
function buildAltar(){
  const L=arenaBase({id:'altar',name:'귀목의 제단',sub:'파티던전 · 제단에 귀안을 바쳐 천년 귀목을 깨워라',theme:'lava',music:'boss',spawn:{x:120,y:470},altarMap:true});
  L.plats.push(plat(300,370,170,14,'o'),plat(810,370,170,14,'o'),plat(470,270,340,14,'o'),plat(130,285,150,14,'o'),plat(1000,285,150,14,'o'));
  L.altar={x:230,y:470};
  L.npcs=NPCS.filter(n=>n.maps&&n.maps.includes('altar')).map(n=>Object.assign({},n,{x:60,gy:470}));
  return L;
}
const MAPS={cave:buildCave,altar:buildAltar,pvp:buildPvp,town:buildTown,forest:buildForest,boss1:buildArena1,sky:buildSky,boss2:buildArena2,pq1:buildPQ1,pq2:buildPQ2,pq3:buildPQ3,pq4:buildPQ4};

/* ---------------- physics ---------------- */
function updatePlats(L,dt,t){
  for(const pl of L.plats){
    if(pl.mv){
      const m=pl.mv,nx=m.x0+Math.sin(t*m.sp+m.ph)*m.ax,ny=m.y0+Math.sin(t*m.sp+m.ph)*m.ay;
      pl.dx=nx-pl.x;pl.dy=ny-pl.y;pl.x=nx;pl.y=ny;
    }
    if(pl.crumble){
      const c=pl.crumble;
      if(c.fall){c.fy+=c.vy*dt;c.vy+=900*dt;c.back-=dt;pl.solidOff=true;if(c.back<=0){c.fall=false;c.fy=0;c.timer=0;pl.solidOff=false}}
      else if(c.timer>0){c.timer-=dt;if(c.timer<=0){c.fall=true;c.vy=0;c.back=3.2;pl.solidOff=true}}
    }
  }
}
// body : {x(center),y(feet),w,h,vx,vy,drop} -> collides with L.plats
function moveBody(L,b,dt,noOneway){
  b.x+=b.vx*dt;b.hitWall=false;
  const rect=()=>({x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h});
  for(const pl of L.plats){
    if(pl.t!=='s')continue;const r=rect();
    if(ov(r,pl)){if(b.vx>0)b.x=pl.x-b.w/2;else if(b.vx<0)b.x=pl.x+pl.w+b.w/2;else b.x+=(b.x<pl.x+pl.w/2?-1:1);b.vx=0;b.hitWall=true}
  }
  const pb=b.y;b.y+=b.vy*dt;const wasG=b.onGround;b.onGround=false;b.ground=null;
  for(const pl of L.plats){
    const r=rect();
    if(pl.t==='s'){
      if(ov(r,pl)){if(b.vy>=0&&pb<=pl.y+6){b.y=pl.y;b.onGround=true;b.ground=pl}else if(b.vy<0){b.y=pl.y+pl.h+b.h}b.vy=0}
    }else if(!noOneway&&!pl.solidOff&&b.vy>=0&&!(b.drop>0)&&r.x<pl.x+pl.w&&r.x+r.w>pl.x&&pb<=pl.y+5&&b.y>=pl.y){
      b.y=pl.y;b.vy=0;b.onGround=true;b.ground=pl;
    }
  }
  b.landed=b.onGround&&!wasG;
}
function groundAt(L,x,y,maxd=600){ // highest platform top below y at x
  let best=null;
  for(const pl of L.plats){if(pl.solidOff)continue;if(x>pl.x&&x<pl.x+pl.w&&pl.y>=y-4&&pl.y<y+maxd&&(!best||pl.y<best.y))best=pl}
  return best;
}
