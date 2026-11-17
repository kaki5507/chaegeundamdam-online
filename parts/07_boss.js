/* ============================================================
   BOSSES : zones / hostile projectiles / 3 boss AIs
   ============================================================ */
function addZone(o){S.zones.push(Object.assign({t:0,warn:.8,act:.2,dmg:20,hit:new Set(),kind:'slam',fired:false},o))}
function addEproj(o){S.eproj.push(Object.assign({x:0,y:0,vx:0,vy:0,r:11,dmg:16,life:5,kind:'fire',grav:0,t:0},o))}
function tp(){const a=alive();return a[Math.random()*a.length|0]||PARTY[0]}
function updateZones(dt){
  for(const z of S.zones){
    z.t+=dt;
    if(z.t>=z.warn&&!z.fired){z.fired=true;
      if(z.kind==='pillar'||z.kind==='moon')sfx('beam');else if(z.kind==='slam'||z.kind==='band'||z.kind==='claw'){sfx('boom');if(z.kind!=='claw')S.shake=Math.max(S.shake,z.kind==='band'?6:10)}
      if(z.kind==='slam')dust(z.x+z.w/2,z.y+z.h,10);
    }
    if(z.t>=z.warn&&z.t<z.warn+z.act&&z.dmg>0){
      for(const p of PARTY)if(!z.hit.has(p)&&ov(prect(p),z)){z.hit.add(p);hurtPlayer(p,z.dmg,z.x+z.w/2)}
    }
  }
  S.zones=S.zones.filter(z=>z.t<z.warn+z.act+.2);
}
function drawZone(g,z,t){
  const x=z.x,y=z.y,w=z.w,h=z.h;
  if(z.t<z.warn){
    const p=z.t/z.warn,pul=.55+.25*Math.sin(t*22);
    const col=z.kind==='moon'?'120,160,255':z.kind==='warnline'?'255,200,60':'255,50,50';
    g.fillStyle=`rgba(${col},${.10+.12*p})`;g.fillRect(x,y,w,h);
    g.fillStyle=`rgba(${col},${.28*pul})`;
    if(z.kind==='pillar'||z.kind==='moon')g.fillRect(x,y+h*(1-p),w,h*p);else g.fillRect(x,y,w*(z.kind==='warnline'?1:1),h*p>0?h:0);
    g.strokeStyle=`rgba(${col},.85)`;g.lineWidth=2;g.setLineDash([10,7]);g.strokeRect(x+1,y+1,w-2,h-2);g.setLineDash([]);
    if(z.kind==='warnline'){g.fillStyle=`rgba(${col},.9)`;g.font='bold 22px sans-serif';g.textAlign='center';const dir=z.dir||1;for(let i=0;i<w;i+=70)g.fillText(dir>0?'▶':'◀',x+i+35,y+h*.6)}
    else if(z.kind==='band'||z.kind==='claw'){g.fillStyle=`rgba(${col},.9)`;g.font='bold 18px sans-serif';g.textAlign='center';g.fillText('!',x+w/2,y+h/2+6)}
  }else if(z.t<z.warn+z.act){
    const a=1-(z.t-z.warn)/z.act;
    if(z.kind==='pillar'){const gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'rgba(255,90,30,0)');gr.addColorStop(.5,`rgba(255,${200+55*a|0},120,${.95})`);gr.addColorStop(1,'rgba(255,90,30,0)');g.fillStyle=gr;g.fillRect(x-10,y,w+20,h)}
    else if(z.kind==='moon'){const gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'rgba(120,160,255,0)');gr.addColorStop(.5,'rgba(240,250,255,.98)');gr.addColorStop(1,'rgba(120,160,255,0)');g.fillStyle=gr;g.fillRect(x-14,y,w+28,h)}
    else if(z.kind==='slam'){g.fillStyle=`rgba(255,230,180,${.65*a})`;g.fillRect(x,y,w,h);for(let i=0;i<5;i++){poly(g,[x+i*w/5,y+h,x+(i+.5)*w/5,y+h*(.2+hash(i+x)*.4),x+(i+1)*w/5,y+h],`rgba(255,240,200,${.8*a})`)}}
    else if(z.kind==='band'){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,`rgba(255,200,240,${.9*a})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x,y,w,h)}
    else if(z.kind==='claw'){g.save();g.strokeStyle=`rgba(255,255,255,${a})`;g.lineWidth=7;g.lineCap='round';for(let i=0;i<3;i++){g.beginPath();g.moveTo(x+(z.dir>0?0:w)+(z.dir>0?20:-20)*i*0,y+8+i*h/3);g.lineTo(x+(z.dir>0?w:0),y+h*.2+i*h/3+16);g.stroke()}g.restore()}
  }
}
function updateEproj(dt){
  const L=S.L;
  for(const e of S.eproj){
    e.t+=dt;e.life-=dt;e.vy+=e.grav*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;
    if(e.kind==='shock'){const g=groundAt(L,e.x,e.y-30,80);if(g)e.y=g.y;if(e.x<16||e.x>L.w-16)e.life=0;if(Math.random()<.6)dust(e.x,e.y,1)}
    if(e.kind==='rock'||e.kind==='shard'){
      for(const pl of L.plats){if(pl.solidOff)continue;if(e.x>pl.x&&e.x<pl.x+pl.w&&e.y>=pl.y&&e.y-e.vy*dt<=pl.y+6&&e.vy>0){e.life=0;dust(e.x,pl.y,6);spark(e.x,pl.y,6,'#b8a890',180,.4,3,400);break}}
    }
    const r=e.kind==='shock'?{x:e.x-24,y:e.y-44,w:48,h:44}:{x:e.x-e.r*.75,y:e.y-e.r*.75,w:e.r*1.5,h:e.r*1.5};
    for(const p of PARTY)if(!p.dead&&ov(prect(p),r)){if(hurtPlayer(p,e.dmg,e.x)&&e.kind!=='shock')e.life=0}
    if(e.x<-80||e.x>L.w+80||e.y>L.h+120||e.y<-300)e.life=0;
  }
  S.eproj=S.eproj.filter(e=>e.life>0);
}
function drawEproj(g,e,t){
  g.save();g.translate(e.x,e.y);
  if(e.kind==='fire'){
    const gl=g.createRadialGradient(0,0,2,0,0,e.r*2.2);gl.addColorStop(0,e.col||'rgba(120,200,255,.95)');gl.addColorStop(1,'rgba(80,140,255,0)');g.fillStyle=gl;g.fillRect(-e.r*2.4,-e.r*2.4,e.r*4.8,e.r*4.8);
    g.rotate(Math.atan2(e.vy,e.vx));g.beginPath();g.moveTo(-e.r*1.8,0);g.quadraticCurveTo(-e.r*.4,-e.r*.95,e.r*.9,0);g.quadraticCurveTo(-e.r*.4,e.r*.95,-e.r*1.8,0);g.fillStyle=e.core||'#bfe8ff';g.fill();circ(g,e.r*.1,0,e.r*.55,'#fff');
  }else if(e.kind==='ember'){
    const gl=g.createRadialGradient(0,0,2,0,0,e.r*2.2);gl.addColorStop(0,'rgba(255,150,60,.95)');gl.addColorStop(1,'rgba(255,80,20,0)');g.fillStyle=gl;g.fillRect(-e.r*2.4,-e.r*2.4,e.r*4.8,e.r*4.8);circ(g,0,0,e.r*.6,'#ffe090');
  }else if(e.kind==='shock'){
    g.beginPath();g.moveTo(-30*sgn(e.vx),0);g.quadraticCurveTo(-4*sgn(e.vx),-70,24*sgn(e.vx),-6);g.lineTo(24*sgn(e.vx),0);g.closePath();
    const gr=g.createLinearGradient(-30,0,24,0);gr.addColorStop(0,'rgba(255,120,60,.2)');gr.addColorStop(1,'rgba(255,230,160,.95)');g.fillStyle=gr;g.fill();g.strokeStyle='#ffe9b0';g.lineWidth=2;g.stroke();
  }else if(e.kind==='rock'||e.kind==='shard'){
    g.rotate(e.t*(e.kind==='shard'?9:4));
    if(e.kind==='shard'){poly(g,[-9,0,0,-12,9,2,2,12],'#f4ead0',O_,2)}
    else poly(g,[-12,-4,-4,-13,10,-8,13,5,2,13,-10,9],'#8a8394',O_,2.2);
  }
  g.restore();
  if(e.kind==='rock'&&e.shadowY){ell(g,e.x,e.shadowY,14,4,'rgba(0,0,0,.35)')}
}

/* ---------------- boss factory ---------------- */
const BOSS_REW={
  dokkaebi:{pct:.30,coin:500,pool:['hat_helm','face_mask','out_dobok']},
  fox:{pct:.35,coin:1000,pool:['hat_fox','cape_gold','aura_thunder']},
  eggking:{pct:.40,coin:1500,pool:['hat_crown','out_gold','aura_flame','cape_ghost']},
};
function mkBoss(id){
  const n=PARTY.length,sc=1+.45*(n-1),L=S.L;
  const b={kind:'boss',id,face:-1,phase:1,flash:0,stun:0,anim:'idle',wait:1,cond:null,invuln:false,dying:false,dead:false,vx:0,vy:0,airT:0,onGround:true,gy:470,t:0,alpha:1,alphaT:1,last:''};
  if(id==='dokkaebi'){Object.assign(b,{name:'도깨비 대왕',x:1020,y:470,w:104,h:165,hp:Math.round(2600*sc),spd:125,cdmg:18});b.rect=e=>({x:e.x-44,y:e.y-e.h,w:88,h:e.h});b.gen=dokkaebiBrain(b)}
  else if(id==='fox'){Object.assign(b,{name:'구미호',x:900,y:330,w:80,h:120,hp:Math.round(3800*sc),cdmg:20,tx:900,ty:330,orbs:0,face:-1});b.rect=e=>({x:e.x-34,y:e.y-122,w:68,h:118});b.gen=foxBrain(b)}
  else{Object.assign(b,{name:'달걀귀신 대왕',x:1000,y:470,w:150,h:190,hp:Math.round(3600*sc),spd:100,cdmg:16});b.rect=e=>({x:e.x-e.w*.46,y:e.y-(e.anim==='roll'?105:e.h),w:e.w*.92,h:e.anim==='roll'?105:e.h-4});b.gen=eggKingBrain(b)}
  if((id==='dokkaebi'&&qst('j2').s==='active')||(id==='fox'&&qst('j3').s==='active')){b.hp=Math.round(b.hp*1.6);b.trial=true;b.name+=' (시련)'}
  b.max=b.hp;return b;
}
function hitBoss(b,dmg,crit,p){
  if(b.invuln||b.dying){const r=rectOf(b);ftext(r.x+r.w/2,r.y,'무적','#aab',14);return}
  dmg=Math.round(dmg*(b.stun>0?1.35:1));b.hp-=dmg;b.flash=.09;
  const r=rectOf(b),cx=r.x+r.w/2,cy=r.y+r.h*(.3+Math.random()*.4);
  ftext(cx+rnd(-20,20),r.y+10,dmg,crit?'#ffb040':(b.stun>0?'#ff9aff':'#fff'),crit?28:20);sfx(crit?'crit':'hit');spark(cx,cy,crit?12:6,crit?'#ffb040':'#fff6c0',crit?280:180,.4);
  S.hitstop=Math.max(S.hitstop,crit?.07:.035);
  if(b.hp<=0){b.hp=0;bossDie(b)}
}
function bossDie(b){
  b.dying=true;b.dieT=0;b.gen=null;b.cond=null;b.vx=0;b.anim='stun';S.zones=[];S.eproj=[];S.clones=[];
  for(const m of S.mobs)if(!m.dead){m.dead=true;spark(m.x,m.y,10,'#fff',200,.5)}
  sfx('roar');S.shake=24;S.slow=1.6;G.toast(b.name+' 격파!');
}
function bossFinish(b){
  b.dead=true;const rw=BOSS_REW[b.id];
  SAVE.cleared[b.id]=true;rw.exp=Math.max(30,Math.round(need(SAVE.lvl)*rw.pct*bossPct(SAVE.lvl)));gainExp(rw.exp);addCoins(rw.coin);
  let drop=null;const free=rw.pool.filter(i=>!SAVE.inv[i]);
  if(free.length){drop=free[Math.random()*free.length|0];SAVE.inv[drop]=1}
  qev('boss',{id:b.id});
  if(b.id==='eggking'){SAVE.pq=(SAVE.pq||0)+1;qev('pq',{})}
  saveGame();
  G.clear={title:b.name+' 격파!',lines:['경험치 +'+rw.exp,'야채코인 +'+rw.coin].concat(drop?['획득: '+ITEMS[drop].n+' ['+RARITY[ITEMS[drop].r]+']']:[])};
  G.state='clear';
}
function updateBoss(dt){
  const b=S.boss;if(!b||b.dead)return;
  b.flash-=dt;b.t+=dt;const L=S.L;
  b.alpha=approach(b.alpha,b.alphaT,dt*5);
  if(b.dying){
    b.dieT+=dt;if(Math.random()<.7)spark(b.x+rnd(-50,50),b.y-rnd(10,150),3,'#ffd34a',220,.5,4,100,true);
    if(b.dieT>1.2&&!b.boomed){b.boomed=true;spark(b.x,b.y-80,60,'#fff7c0',500,.9,5,200,true);sfx('boom');S.shake=30}
    if(b.dieT>2.6)bossFinish(b);
    return;
  }
  if(b.stun>0)b.stun-=dt;
  // script
  if(b.cond){if(b.cond())b.cond=null}else if(b.wait>0)b.wait-=dt;
  if(!b.cond&&b.wait<=0&&b.gen){
    for(let g=0;g<4;g++){const r=b.gen.next(),v=r.value;if(typeof v==='function'){b.cond=v;break}b.wait=v||0;if(b.wait>0)break}
  }
  // physics
  if(b.id==='fox'){
    b.x+=(b.tx-b.x)*Math.min(1,dt*2.4);b.y+=(b.ty-b.y)*Math.min(1,dt*2.4);b.bob=Math.sin(b.t*2)*5;
    if(b.orbs){b.orbA=(b.orbA||0)+dt*2.3;b.orbPos=[];for(let i=0;i<b.orbs;i++){const a=b.orbA+i*6.283/b.orbs;b.orbPos.push({x:b.x+Math.cos(a)*100,y:b.y-60+Math.sin(a)*70})}
      for(const o of b.orbPos)for(const p of PARTY)if(!p.dead&&Math.hypot(p.x-o.x,p.y-30-o.y)<30)hurtPlayer(p,14,o.x)}
  }else{
    b.hitWall=false;b.x+=b.vx*dt;
    if(b.x<90){b.x=90;if(b.vx<0)b.hitWall=true}if(b.x>L.w-90){b.x=L.w-90;if(b.vx>0)b.hitWall=true}
    b.vy+=GRAV*dt;b.y+=b.vy*dt;b.airT=b.onGround?0:b.airT+dt;
    if(b.y>=b.gy){const was=b.onGround;b.y=b.gy;if(b.vy>0)b.vy=0;b.onGround=true;if(!was)b.justLanded=true}else b.onGround=false;
    if(b.anim==='roll')b.rot=(b.rot||0)+b.vx*dt/80;
  }
  // contact
  const r=rectOf(b),cd=b.cdmg*(b.anim==='charge'||b.anim==='roll'?1.5:1);
  if(b.anim!=='vanish'&&b.alpha>.6)for(const p of PARTY)if(!p.dead&&ov(prect(p),{x:r.x+8,y:r.y+8,w:r.w-16,h:r.h-12}))hurtPlayer(p,cd,b.x,{kb:300});
  // clones
  for(const c of S.clones){c.t+=dt;
    if(c.t>.9&&!c.fired){c.fired=true;const t=nearestAlive(c.x,c.y)||PARTY[0],ang=Math.atan2(t.y-40-c.y,t.x-c.x),n=b.phase>1?7:5;sfx('fire');for(let i=0;i<n;i++){const a=ang+(i-(n-1)/2)*.2;addEproj({x:c.x,y:c.y-60,vx:Math.cos(a)*320,vy:Math.sin(a)*320,r:10,dmg:14})}}
    if(c.t>1.6){c.dead=true;spark(c.x,c.y-60,16,'#9fd0ff',200,.5,3,0,true)}
  }
  S.clones=S.clones.filter(c=>!c.dead);
}
function drawBoss(g,b,t){
  if(b.dead)return;
  if(b.id==='dokkaebi')drawDokkaebi(g,b,t);
  else if(b.id==='fox'){
    for(const c of S.clones)drawFox(g,{x:c.x,y:c.y,face:sgn(PARTY[0].x-c.x),phase:b.phase,anim:'cast',flash:0},t,.5*Math.min(1,c.t*3)*(c.t>1.3?1-(c.t-1.3)/.3:1),'#9fd0ff');
    drawFox(g,Object.assign({},b,{y:b.y+(b.bob||0)}),t,b.alpha);
    if(b.orbPos)for(const o of b.orbPos){const gl=g.createRadialGradient(o.x,o.y,2,o.x,o.y,26);gl.addColorStop(0,'rgba(255,160,230,.95)');gl.addColorStop(1,'rgba(255,100,200,0)');g.fillStyle=gl;g.fillRect(o.x-28,o.y-28,56,56);circ(g,o.x,o.y,7,'#fff0fa')}
  }else drawEggKing(g,b,t);
  if(b.stun>0){g.fillStyle='#ffe04a';g.font='bold 22px sans-serif';g.textAlign='center';for(let i=0;i<3;i++){const a=t*5+i*2.1;g.fillText('★',b.x+Math.cos(a)*40,b.y-b.h-8+Math.sin(a)*8)}}
}

/* ---------------- 도깨비 대왕 ---------------- */
function* walkTo(b,dist,maxT){let t=0;while(Math.abs(b.tg.x-b.x)>dist&&t<maxT){b.face=sgn(b.tg.x-b.x);b.vx=b.face*b.spd*(b.phase>1?1.3:1);b.anim='walk';t+=.05;yield .05}b.vx=0;b.anim='idle'}
function* dokkaebiBrain(b){
  while(true){
    if(b.hp<=b.max*.5&&b.phase===1)yield* dkPhase(b);
    yield b.phase>1?.5:.9;
    const opts=['slam','leap','rain','charge'];let pick;do{pick=opts[Math.random()*4|0]}while(pick===b.last);b.last=pick;
    b.tg=tp();
    if(pick==='slam')yield* dkSlam(b);else if(pick==='leap')yield* dkLeap(b);else if(pick==='rain')yield* dkRain(b);else yield* dkCharge(b);
  }
}
function* dkPhase(b){
  b.phase=2;b.invuln=true;b.vx=0;b.anim='roar';sfx('roar');S.shake=18;G.toast('도깨비 대왕이 분노했다!');
  for(let i=0;i<3;i++)spawnMob('wisp',250+i*300,300,{chase:true,range:30,bonus:true});
  spark(b.x,b.y-100,40,'#ff4a30',420,.8,5,0,true);yield 1.6;b.invuln=false;b.anim='idle';
}
function* dkSlam(b){
  yield* walkTo(b,190,1.7);b.face=sgn(b.tg.x-b.x);b.anim='raise';
  addZone({x:b.face>0?b.x+10:b.x-250,y:b.gy-95,w:240,h:95,warn:.8,act:.14,dmg:26,kind:'slam'});sfx('warn');yield .8;
  b.anim='slam';S.shake=14;
  for(const d of(b.phase>1?[1,-1]:[b.face]))addEproj({kind:'shock',x:b.x+d*120,y:b.gy,vx:d*(b.phase>1?440:350),dmg:20,life:5,r:20});
  yield .7;b.anim='idle';
  if(b.phase>1){b.anim='raise';addZone({x:b.face>0?b.x+10:b.x-250,y:b.gy-95,w:240,h:95,warn:.55,act:.14,dmg:26,kind:'slam'});yield .55;b.anim='slam';S.shake=12;yield .5;b.anim='idle'}
}
function* dkLeap(b){
  const L=S.L,tx=clamp(b.tg.x,170,L.w-170);
  b.face=sgn(tx-b.x);b.anim='crouch';sfx('warn');
  addZone({x:tx-115,y:b.gy-100,w:230,h:100,warn:1.42,act:.2,dmg:30,kind:'slam'});yield .5;
  const T=.9;b.vy=-GRAV*T/2;b.vx=(tx-b.x)/T;b.onGround=false;b.anim='air';b.airT=0;
  yield ()=>b.onGround&&b.airT===0&&b.t>0;
  b.vx=0;b.anim='land';S.shake=18;sfx('boom');dust(b.x,b.gy,14);
  const n=b.phase>1?5:2;for(let i=0;i<n;i++)addEproj({kind:'rock',x:rnd(120,L.w-120),y:-30-i*60,vy:200,grav:1200,r:15,dmg:18,life:4});
  yield .7;b.anim='idle';
}
function* dkRain(b){
  b.anim='roar';sfx('roar');yield .6;
  const n=b.phase>1?10:6;
  for(let i=0;i<n;i++){
    const x=clamp((i%3===0?b.tg.x:b.tg.x+rnd(-300,300)),70,S.L.w-70);
    addZone({x:x-30,y:0,w:60,h:b.gy,warn:.9,act:.3,dmg:22,kind:'pillar'});sfx('warn');yield b.phase>1?.22:.3;
  }
  yield 1.3;b.anim='idle';
}
function* dkCharge(b){
  b.face=sgn(b.tg.x-b.x);b.anim='charge_tel';sfx('roar');
  addZone({x:b.face>0?b.x:30,y:b.gy-78,w:b.face>0?S.L.w-b.x-30:b.x-30,h:78,warn:.95,act:.02,dmg:0,kind:'warnline',dir:b.face});yield .95;
  b.vx=b.face*(b.phase>1?820:680);b.anim='charge';b.hitWall=false;
  yield ()=>b.hitWall;
  b.vx=0;b.anim='stun';b.stun=2.6;S.shake=22;sfx('boom');dust(b.x,b.gy,14);
  for(let i=0;i<4;i++)addEproj({kind:'rock',x:rnd(140,S.L.w-140),y:-30-i*80,vy:150,grav:1200,r:15,dmg:18,life:4});
  yield ()=>b.stun<=0;b.anim='idle';
}

/* ---------------- 구미호 ---------------- */
function* foxBrain(b){
  while(true){
    if(b.hp<=b.max*.5&&b.phase===1)yield* foxPhase(b);
    yield b.phase>1?.4:.8;
    b.tg=tp();
    const xs=[210,640,1070];b.tx=xs[Math.random()*3|0];b.ty=300+rnd(-20,30);b.face=sgn(b.tg.x-b.tx);yield .8;
    const opts=['fan','tele','sweep','moon','clones'];let pick;do{pick=opts[Math.random()*5|0]}while(pick===b.last);b.last=pick;
    if(pick==='fan')yield* foxFan(b);else if(pick==='tele')yield* foxTele(b);else if(pick==='sweep')yield* foxSweep(b);else if(pick==='moon')yield* foxMoon(b);else yield* foxClones(b);
    b.anim='idle';
  }
}
function* foxPhase(b){
  b.phase=2;b.invuln=true;b.anim='cast';b.tx=640;b.ty=250;sfx('roar');S.shake=16;G.toast('구미호의 아홉 꼬리가 깨어났다!');
  spark(b.x,b.y-80,50,'#ff80d0',420,.9,5,0,true);yield 1.8;b.invuln=false;b.orbs=3;b.anim='idle';
}
function* foxFan(b){
  b.anim='cast';yield .5;const waves=b.phase>1?4:3;
  for(let w=0;w<waves;w++){
    const t=tp(),ang=Math.atan2(t.y-40-(b.y-70),t.x-b.x),n=b.phase>1?9:7;b.face=sgn(t.x-b.x);sfx('fire');
    for(let i=0;i<n;i++){const a=ang+(i/(n-1)-.5)*1.25;addEproj({x:b.x,y:b.y-70,vx:Math.cos(a)*(b.phase>1?340:300),vy:Math.sin(a)*(b.phase>1?340:300),r:11,dmg:16})}
    yield .6;
  }
  yield .5;
}
function* foxTele(b){
  const n=b.phase>1?3:2;
  for(let k=0;k<n;k++){
    const t=tp();b.anim='vanish';b.alphaT=0;yield .35;
    const side=Math.random()<.5?-1:1;b.x=b.tx=clamp(t.x+side*150,90,S.L.w-90);b.y=b.ty=t.y+2;b.face=-side;
    spark(b.x,b.y-60,14,'#ffd0f0',220,.4,3,0,true);b.anim='claw';b.alphaT=1;b.alpha=Math.max(b.alpha,.4);sfx('warn');
    addZone({x:b.face>0?b.x-20:b.x-250,y:b.y-96,w:270,h:96,warn:.65,act:.16,dmg:28,kind:'claw',dir:b.face});yield .85;
  }
  b.anim='idle';b.ty=300;yield .3;
}
function* foxSweep(b){
  b.anim='tails';b.tx=640;b.ty=140;sfx('roar');yield .7;
  const bands=[{y:408,h:68},{y:296,h:70},{y:186,h:70}];
  const pick=b.phase>1?[0,1,2].sort(()=>Math.random()-.5).slice(0,2):[Math.random()*3|0];
  for(const i of pick)addZone({x:-50,y:bands[i].y,w:S.L.w+100,h:bands[i].h,warn:1.25,act:.35,dmg:30,kind:'band'});
  sfx('warn');yield 1.9;b.anim='idle';b.ty=300;
}
function* foxMoon(b){
  b.anim='cast';b.tx=640;b.ty=200;yield .5;
  const n=b.phase>1?9:6;
  for(let i=0;i<n;i++){
    const x=clamp(i%3===0?tp().x:rnd(80,S.L.w-80),70,S.L.w-70);
    addZone({x:x-35,y:0,w:70,h:470,warn:1.0,act:.35,dmg:24,kind:'moon'});sfx('warn');yield .3;
  }
  yield 1.6;b.ty=300;
}
function* foxClones(b){
  b.anim='cast';sfx('roar');const n=b.phase>1?3:2;
  for(let i=0;i<n;i++)S.clones.push({x:rnd(140,S.L.w-140),y:rnd(240,360),t:-i*.35,fired:false});
  yield 2.6;
}

/* ---------------- 달걀귀신 대왕 ---------------- */
function* eggKingBrain(b){
  while(true){
    if(b.hp<=b.max*.5&&b.phase===1)yield* egPhase(b);
    yield b.phase>1?.5:.9;
    const opts=['roll','hatch','stomp','shell'];let pick;do{pick=opts[Math.random()*4|0]}while(pick===b.last);b.last=pick;
    b.tg=tp();
    if(pick==='roll')yield* egRoll(b);else if(pick==='hatch')yield* egHatch(b);else if(pick==='stomp')yield* egStomp(b);else yield* egShell(b);
  }
}
function* egPhase(b){
  b.phase=2;b.invuln=true;b.vx=0;b.anim='roar';sfx('roar');S.shake=18;G.toast('달걀귀신 대왕의 껍데기가 갈라진다!');
  spark(b.x,b.y-100,40,'#ffd34a',420,.8,5,0,true);yield 1.6;b.invuln=false;b.anim='idle';
}
function* egRoll(b){
  const passes=b.phase>1?3:2;b.anim='crouch';
  b.face=sgn(b.tg.x-b.x);sfx('warn');
  addZone({x:30,y:b.gy-70,w:S.L.w-60,h:70,warn:.9,act:.02,dmg:0,kind:'warnline',dir:b.face});yield .9;
  b.anim='roll';b.hitWall=false;
  for(let i=0;i<passes;i++){
    b.vx=b.face*(b.phase>1?640:540);b.hitWall=false;
    yield ()=>b.hitWall;
    S.shake=14;sfx('boom');b.face=-b.face;b.vx=0;
    for(let k=0;k<2;k++)addEproj({kind:'rock',x:rnd(140,S.L.w-140),y:-30-k*70,vy:150,grav:1200,r:14,dmg:16,life:4});
    yield .2;
  }
  b.vx=0;b.anim='stun';b.stun=2.4;b.rot=0;yield ()=>b.stun<=0;b.anim='idle';
}
function* egHatch(b){
  b.anim='roar';sfx('roar');yield .7;
  const n=b.phase>1?5:3;
  for(let i=0;i<n;i++){spawnMob('baby',b.x+(i%2?60:-60),b.gy-20,{chase:true});spark(b.x+(i%2?60:-60),b.gy-30,8,'#f4ead0',160,.4,3)}
  yield 1.3;b.anim='idle';
}
function* egStomp(b){
  const L=S.L,tx=clamp(b.tg.x,180,L.w-180);b.face=sgn(tx-b.x);b.anim='crouch';sfx('warn');
  addZone({x:tx-130,y:b.gy-105,w:260,h:105,warn:1.45,act:.2,dmg:30,kind:'slam'});yield .55;
  const T=.9;b.vy=-GRAV*T/2;b.vx=(tx-b.x)/T;b.onGround=false;b.anim='air';b.airT=0;
  yield ()=>b.onGround&&b.airT===0&&b.t>0;
  b.vx=0;b.anim='land';S.shake=20;sfx('boom');dust(b.x,b.gy,16);
  for(let i=0;i<(b.phase>1?6:3);i++)addEproj({kind:'shard',x:b.x+rnd(-60,60),y:b.gy-120,vx:rnd(-260,260),vy:-rnd(500,720),grav:1300,r:12,dmg:14,life:4});
  yield .8;b.anim='idle';
}
function* egShell(b){
  b.anim='roar';yield .6;sfx('fire');
  const n=b.phase>1?13:9;
  for(let i=0;i<n;i++)addEproj({kind:'shard',x:b.x,y:b.gy-140,vx:(i/(n-1)-.5)*760,vy:-rnd(520,760),grav:1250,r:12,dmg:14,life:5});
  yield 1.3;b.anim='idle';
}
