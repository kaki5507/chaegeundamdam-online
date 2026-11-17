/* ============================================================
   ENTITIES : party, combat, skills, monsters, items
   ============================================================ */
let S=null,PARTY=[];
const CTRL=[
  {l:['ArrowLeft'],r:['ArrowRight'],u:['ArrowUp'],d:['ArrowDown'],j:['Space','AltLeft','AltRight','KeyK'],a:['KeyZ','ControlLeft','ControlRight','KeyJ'],s:['KeyX','KeyC','KeyV','KeyB','KeyN']},
  {l:['KeyA'],r:['KeyD'],u:['KeyW'],d:['KeyS'],j:['ShiftLeft','ShiftRight'],a:['KeyF'],s:['KeyG','KeyH','KeyT','KeyY','KeyU']},
];
const NOIN={l:0,r:0,u:0,d:0,uT:0,jT:0,jH:0,a:0,aT:0,s:[0,0,0,0,0],fd:0};

function mkPlayer(kind,jobId,lvl){
  const p={kind,job:jobId,x:0,y:0,w:26,h:52,vx:0,vy:0,face:1,onGround:false,ground:null,rope:null,rcool:0,drop:0,coyote:0,jbuf:0,
    inv:0,stun:0,atkT:0,atkCd:0,hitQ:-1,combo:0,comboT:0,cds:[0,0,0,0,0],buff:null,shieldT:0,dashT:0,dashHit:null,skillT:0,
    hp:1,mp:1,dead:false,deadT:0,t:Math.random()*5,eq:{},lvl:lvl||1,tier:0,team:0,lastAtk:null,hold:false,ai:null,aiT:0,far:0,mpWarn:0,vyPrev:0};
  recalc(p);p.hp=p.maxhp;p.mp=p.maxmp;return p;
}
function recalc(p){
  const j=JOB[p.job],lv=p.lvl,ti=p.tier;
  p.maxhp=Math.round((j.hp+(lv-1)*13)*[1,1.15,1.4,1.8][ti]);
  p.maxmp=Math.round((j.mp+(lv-1)*4)*[1,1.1,1.25,1.5][ti]);
  p.atkBase=(j.atk+(lv-1)*2.3)*[1,1.15,1.45,1.9][ti];
  if(p.kind==='p1'&&typeof SAVE!=='undefined'&&SAVE&&SAVE.enh){p.maxhp=Math.round(p.maxhp*(1+SAVE.enh.hp*.015));p.atkBase*=1+SAVE.enh.atk*.012}
  p.hp=Math.min(p.hp,p.maxhp);p.mp=Math.min(p.mp,p.maxmp);
}
const atkOf=p=>p.atkBase*(p.buff?p.buff.atk:1);
const spdOf=p=>JOB[p.job].spd*(p.buff?p.buff.spd:1);
const prect=p=>({x:p.x-p.w/2+2,y:p.y-p.h,w:p.w-4,h:p.h});
const alive=()=>PARTY.filter(p=>!p.dead);
const unlocked=(p,i)=>p.tier>=SK_TIER[i];
function inputOf(p){
  if(p.kind==='ai')return p.ai||NOIN;
  if(G.ui||G.state!=='play')return NOIN;
  const c=CTRL[p.kind==='p1'?0:1],h=a=>a.some(k=>keys[k]),t=a=>a.some(k=>pressed[k]);
  return {l:h(c.l),r:h(c.r),u:h(c.u),d:h(c.d),uT:t(c.u),jT:t(c.j),jH:h(c.j),a:h(c.a),aT:t(c.a),s:c.s.map(k=>!!pressed[k]),fd:0};
}

/* ---------- exp / coins ---------- */
function gainExp(n,mob){
  const p=PARTY[0];if(!p||SAVE.lvl>=MAXLV)return;
  if(mob)n=Math.max(1,Math.round(n*expMul(SAVE.lvl)));
  SAVE.exp+=n;ftext(p.x,p.y-78,'+'+n+' EXP','#9be8ff',14);
  while(SAVE.lvl<MAXLV&&SAVE.exp>=need(SAVE.lvl)){
    SAVE.exp-=need(SAVE.lvl);SAVE.lvl++;
    p.lvl=SAVE.lvl;recalc(p);p.hp=p.maxhp;p.mp=p.maxmp;
    for(const q of PARTY)if(q!==p&&!q.foe){q.lvl=SAVE.lvl;q.tier=q.kind==='p1'?SAVE.tier:tierOfLv(q.lvl);recalc(q);q.hp=q.maxhp;q.mp=q.maxmp}
    sfx('lvl');ftext(p.x,p.y-110,'LEVEL UP! Lv.'+SAVE.lvl,'#ffe04a',24,1.6);spark(p.x,p.y-30,40,'#ffe04a',320,.9,4,200,true);
    const ai=[1,2,3].find(t=>SAVE.lvl===ADV_LV[t]&&SAVE.tier<t);
    G.toast('레벨 업!  Lv.'+SAVE.lvl+(ai?'  — '+ai+'차 전직 가능! ('+['','야채마을 교관','도깨비 숲 꼭대기','하늘길 끝'][ai]+')':''));
    qev('lvl');
  }
  if(SAVE.lvl>=MAXLV)SAVE.exp=0;
}
function addCoins(n){SAVE.coins+=n;qev('count',{key:'coin',n})}

/* ---------- targets ---------- */
function eachTarget(fn,owner){
  if(S.L.pvp){if(owner)for(const q of PARTY)if(!q.dead&&q.team!==owner.team&&q.inv<=0&&q.shieldT<=0)fn(q);return}
  for(const m of S.mobs)if(!m.dead)fn(m);
  for(const d of S.dummies)if(d.hp>0)fn(d);
  for(const b of S.boxes)if(!b.dead)fn(b);
  if(S.boss&&!S.boss.dead&&!S.boss.dying)fn(S.boss);
}
const rectOf=t=>t.rect?t.rect(t):{x:t.x-t.w/2,y:t.y-t.h,w:t.w,h:t.h};
function dealDamage(p,t,dmg,dir,o={}){
  const crit=Math.random()<.12;
  let d=Math.round(dmg*(.9+Math.random()*.2)*(crit?1.7:1));
  hitTarget(t,d,dir,crit,p,o);
}
function hitTarget(t,dmg,dir,crit,p,o){
  const r=rectOf(t),cx=r.x+r.w/2,cy=r.y+r.h/2;
  if(t.kind==='boss'){hitBoss(t,dmg,crit,p);return}
  if(t.kind==='p1'||t.kind==='p2'||t.kind==='ai'){pvpHit(t,dmg,dir,crit,p);return}
  if(t.kind==='dummy'){t.hp-=dmg;t.shake=.3;t.flash=.1;t.regen=2.5;ftext(cx,r.y-10,dmg,crit?'#ffb040':'#fff',crit?24:18);sfx(crit?'crit':'hit');
    spark(cx,cy,6,'#ffe9a0',160,.3);S.hitstop=Math.max(S.hitstop,.03);qev('flag','attack');
    if(t.hp<=0){qev('kill',{mob:'dummy'});t.respawn=1.8;spark(cx,cy,18,'#e0c890',240,.6);ftext(cx,r.y-30,'KO!','#ff8a5a',22)}return}
  if(t.kind==='box'){t.hp-=dmg;t.flash=.15;sfx('hit');spark(cx,cy,6,'#d8a860',180,.35);ftext(cx,r.y-8,dmg,'#fff',15);if(t.hp<=0)breakBox(t);return}
  // mob
  t.hp-=dmg;t.flash=.12;t.kbx=dir*(crit?260:170);if(t.type!=='wisp')t.vy=Math.min(t.vy,-120);
  if(t.type==='wisp')t.kbx*=.8;
  ftext(cx,r.y-6,dmg,crit?'#ffb040':'#ffffff',crit?24:18);sfx(crit?'crit':'hit');
  spark(cx,cy,crit?12:6,crit?'#ffb040':'#fff6c0',crit?260:170,.35);S.hitstop=Math.max(S.hitstop,crit?.06:.03);
  if(t.hp<=0)killMob(t);
}
function killMob(m){
  m.dead=true;const d=MOBS[m.type];
  spark(m.x,m.y-12,16,m.type==='wisp'?'#7ad0ff':'#f4f0e6',230,.55,4,300,true);
  gainExp(m.exp,true);S.kills=(S.kills||0)+1;
  const cn=Math.round(rnd(d.coin[0],d.coin[1])*(S.L.mscale>1?1.6:1));
  for(let i=0;i<Math.min(3,1+(cn>8?1:0)+(cn>16?1:0));i++)dropItem('coin',m.x+rnd(-14,14),(m.type==='wisp'?m.y:m.y-14),Math.max(1,Math.round(cn/Math.min(3,1+(cn>8?1:0)+(cn>16?1:0)))));
  if(Math.random()<.36&&!S.L.pq)dropItem('vegbit',m.x,m.y-16,1);
  if(Math.random()<.10||m.bonus)dropItem(m.bonus||Math.random()<.6?'hp':'mp',m.x,m.y-16,1);
  if(S.L.pq===1)dropItem('coupon',m.x,m.y-16,1);
  qev('kill',{mob:m.type});
}
function breakBox(b){
  b.dead=true;spark(b.x,b.y-20,16,'#c08a48',260,.6,4,500);sfx('boom');
  if(b.key){dropItem('key',b.x,b.y-24,1);ftext(b.x,b.y-60,'열쇠 발견!','#ffe04a',18)}
  else if(b.trap){for(let i=0;i<2;i++)spawnMob('baby',b.x+(i?14:-14),b.y-10,{chase:true});ftext(b.x,b.y-60,'함정!','#ff6a6a',18);sfx('roar')}
  else if(Math.random()<.5)dropItem('coin',b.x,b.y-20,rnd(4,10)|0);
}
function dropItem(kind,x,y,v){S.items.push({kind,x,y,vx:rnd(-80,80),vy:-rnd(200,340),v,life:14,t:0,ground:false})}

/* ---------- mobs ---------- */
function spawnMob(type,x,y,o){
  const d=MOBS[type],sc=S.L.mscale;
  const m=Object.assign({kind:'mob',type,x,y,w:d.w,h:d.h,hp:Math.round(d.hp*sc),max:Math.round(d.hp*sc),vx:0,vy:0,kbx:0,dir:Math.random()<.5?-1:1,flash:0,dead:false,
    dmg:Math.round(d.dmg*(sc>1?1+(sc-1)*.5:1)),exp:Math.round(d.exp*(sc>1?sc*.8:1)),ph:Math.random()*6,t:0,hopT:rnd(.4,2),col:'rgba(120,220,255,',col2:'#7ad0ff',col3:'#2a6ae0'},o||{});
  if(type==='wisp'){m.rect=e=>({x:e.x-e.w/2,y:e.y-e.h/2,w:e.w,h:e.h});m.ox=x;m.by=y;m.range=m.range||70}
  S.mobs.push(m);return m;
}
function nearestAlive(x,y,maxd=9999){let b=null,bd=maxd;for(const p of PARTY){if(p.dead)continue;const d=Math.hypot(p.x-x,p.y-30-y);if(d<bd){bd=d;b=p}}return b}
function updateMobs(dt){
  const L=S.L;
  for(const m of S.mobs){
    if(m.dead)continue;
    m.t+=dt;m.flash-=dt;m.kbx=approach(m.kbx,0,700*dt);
    if(m.type==='wisp'){
      const tg=nearestAlive(m.x,m.y,m.chase?900:260);
      if(tg){m.ox+=sgn(tg.x-m.x)*(m.chase?120:50)*dt;m.by+=(tg.y-44-m.by)*(m.chase?1.1:.35)*dt}
      m.ox=clamp(m.ox,30,L.w-30);
      m.x=m.ox+Math.sin(m.t*.9+m.ph)*m.range*(tg?.4:1)+m.kbx*.1;m.y=m.by+Math.sin(m.t*1.9+m.ph)*14;
    }else{
      if(m.chase){const tg=nearestAlive(m.x,m.y-20);if(tg)m.dir=sgn(tg.x-m.x)}
      else{if(m.min!==undefined){if(m.x<m.min)m.dir=1;if(m.x>m.max)m.dir=-1}}
      m.vx=m.dir*(m.chase?(m.type==='baby'?105:80):46)+m.kbx;
      m.vy+=GRAV*dt;m.hopT-=dt;
      if(m.onGround&&m.hopT<=0){m.vy=-(m.chase?560:340);m.hopT=rnd(1.1,2.3)}
      moveBody(L,m,dt);
      if(m.hitWall)m.dir*=-1;
      m.x=clamp(m.x,22,L.w-22);
      if(m.y>L.h+300){m.dead=true}
    }
    // contact
    const mr=rectOf(m);
    for(const p of PARTY){if(!p.dead&&ov(mr,prect(p)))hurtPlayer(p,m.dmg,m.x)}
  }
  S.mobs=S.mobs.filter(m=>!m.dead);
  for(const d of S.dummies){d.flash-=dt;d.shake-=dt;if(d.hp>0){d.regen-=dt;if(d.regen<=0&&d.hp<d.max)d.hp=Math.min(d.max,d.hp+60*dt)}else{d.respawn-=dt;if(d.respawn<=0)d.hp=d.max}}
  for(const b of S.boxes)b.flash-=dt;
  // PQ spawner
  const sp=L.spawner;
  if(sp&&S.pq&&S.pq.active){
    S.spT=(S.spT||0)-dt;
    if(S.spT<=0&&S.mobs.filter(m=>!m.dead).length<sp.max){
      S.spT=sp.every;const type=sp.types[Math.random()*sp.types.length|0],x=Math.random()<.5?60:L.w-60;
      if(type==='wisp')spawnMob('wisp',x,rnd(200,380),{chase:true,range:30});else spawnMob('egg',x,470,{chase:true});
      spark(x,400,10,'#cfa8ff',160,.5,3,0,true);
    }
  }
}

/* ---------- items on ground ---------- */
function updateItems(dt){
  for(const it of S.items){
    it.t+=dt;it.life-=dt;
    if(!it.ground){it.vy+=1400*dt;it.x+=it.vx*dt;it.y+=it.vy*dt;it.vx*=.98;
      const g=groundAt(S.L,it.x,it.y-it.vy*dt-2,400);
      if(g&&it.y>=g.y&&it.vy>0){it.y=g.y;it.vy=0;it.vx=0;it.ground=true}
      if(it.y>S.L.h+200)it.life=0;}
    if(it.t>.35)for(const p of PARTY){
      if(p.dead)continue;
      if(Math.abs(p.x-it.x)<26&&Math.abs((p.y-24)-(it.y-10))<44){pickup(it,p);it.life=0;break}
    }
  }
  S.items=S.items.filter(i=>i.life>0);
}
function pickup(it,p){
  const k=it.kind;sfx('pickup');
  if(k==='coin'){addCoins(it.v);ftext(it.x,it.y-20,'+'+it.v+'●','#ffd34a',13)}
  else if(k==='hp'){const h=Math.round(p.maxhp*.35);p.hp=Math.min(p.maxhp,p.hp+h);ftext(p.x,p.y-70,'+'+h,'#6aff8a',17)}
  else if(k==='mp'){const h=Math.round(p.maxmp*.4);p.mp=Math.min(p.maxmp,p.mp+h);ftext(p.x,p.y-70,'+'+h,'#6ab0ff',17)}
  else if(k==='vegbit'){SAVE.inv.vegbit=(SAVE.inv.vegbit||0)+1;ftext(it.x,it.y-20,'야채 조각','#9be8ae',13);qev('collect',{item:'vegbit'})}
  else if(k==='coupon'){S.pq.coupons++;ftext(it.x,it.y-20,'영혼 쿠폰 '+S.pq.coupons+'/15','#c0a0ff',15)}
  else if(k==='key'){S.pq.keys++;ftext(it.x,it.y-20,'열쇠 '+S.pq.keys+'/7','#ffe04a',17)}
}

/* ---------- player damage ---------- */
function hurtPlayer(p,dmg,srcx,o){
  if(p.dead||p.inv>0||p.shieldT>0||p.dashT>0||G.state!=='play')return false;
  const def=p.buff&&p.buff.def?p.buff.def:0;
  dmg=Math.max(1,Math.round(dmg*(1-def)));
  p.hp-=dmg;p.inv=o&&o.inv!==undefined?o.inv:1.0;p.stun=o&&o.stun||.2;p.vx=(sgn(p.x-srcx)||p.face*-1)*(o&&o.kb||240);p.vy=-(o&&o.up||300);p.rope=null;p.atkT=0;p.hitQ=-1;p.dashT=0;
  ftext(p.x,p.y-70,'-'+dmg,'#ff5a5a',20);sfx('hurt');spark(p.x,p.y-30,10,'#ff7a7a',200,.4);
  if(p.kind!=='ai'){S.shake=Math.max(S.shake,8);S.hitstop=Math.max(S.hitstop,.05)}
  if(p.hp<=0){p.hp=0;p.dead=true;p.deadT=0;if(S.L.pvp)pvpKO(p);else p.vx=0;sfx('die');spark(p.x,p.y-30,26,'#cfe0ff',260,.9,4,-50,true);ftext(p.x,p.y-90,'귀혼이 되었다…','#cfe0ff',16,1.4)}
  return true;
}
/* ---------- PvP ---------- */
const PVP_DMG=.55;
function pvpHit(t,dmg,dir,crit,atk){
  if(t.dead||!S.pvp||S.pvp.over)return;
  const d=Math.max(1,Math.round(dmg*PVP_DMG)),ratio=d/t.maxhp,missing=1-t.hp/t.maxhp;
  // 넉백: 큰 피해 · 체력이 적을수록 더 멀리 밀려난다
  const kb=330+Math.min(560,ratio*1500)+missing*260+(crit?90:0);
  if(hurtPlayer(t,d,t.x-dir*40,{kb,up:300+Math.min(220,ratio*600),inv:.3,stun:.16+Math.min(.28,ratio*1.1),pvp:1})){
    t.lastAtk=atk;S.hitstop=Math.max(S.hitstop,crit?.07:.04);S.shake=Math.max(S.shake,crit?9:5);
    spark(t.x,t.y-30,crit?14:8,'#fff0b0',240,.35);
  }
}
function pvpKO(p,ring){
  const pv=S.pvp;if(!pv||pv.over)return;
  pv.score[1-p.team]++;ftext(p.x,Math.min(p.y,S.L.h)-100,'KO!','#ffd34a',28,1.4);S.shake=14;
  if(pv.score[1-p.team]>=pv.to){pv.over=true;pv.winner=1-p.team;sfx('lvl');const d=SAVE.duel||(SAVE.duel={w:0,l:0});if(pv.winner===0){d.w++;SAVE.coins+=150;G.toast('결투 승리! 야채코인 +150')}else d.l++;saveGame()}
}
function healPlayer(p,amt){const h=Math.min(p.maxhp-p.hp,Math.round(amt));if(h>0){p.hp+=h;ftext(p.x,p.y-70,'+'+h,'#6aff8a',18)}spark(p.x,p.y-30,10,'#8affb0',140,.6,3,-60,true)}

/* ---------- player update ---------- */
function updatePlayer(p,dt){
  p.t+=dt;p.inv=Math.max(0,p.inv-dt);p.stun=Math.max(0,p.stun-dt);p.atkCd-=dt;p.comboT-=dt;p.skillT-=dt;p.shieldT=Math.max(0,p.shieldT-dt);p.mpWarn-=dt;p.rcool-=dt;
  for(let i=0;i<5;i++)p.cds[i]=Math.max(0,p.cds[i]-dt);
  if(p.buff){p.buff.t-=dt;if(p.buff.t<=0)p.buff=null}
  const L=S.L;
  if(p.dead){
    p.deadT+=dt;
    if(L.pvp){
      p.vx=approach(p.vx,0,600*dt);
      if(p.deadT>2&&!S.pvp.over){const sp=S.L.spawns[p.team];p.dead=false;p.hp=p.maxhp;p.mp=p.maxmp;p.x=sp.x;p.y=sp.y;p.vx=p.vy=0;p.inv=2;p.stun=0;p.buff=null;p.lastAtk=null;sfx('portal');spark(p.x,p.y-30,24,'#fff7a0',260,.7,4,0,true);ftext(p.x,p.y-80,'부활!','#fff7a0',20)}
      return;
    }
    const allies=PARTY.filter(q=>!q.dead);
    if(allies.length&&p.deadT>(p.kind==='ai'?7:6)){
      const a=allies[0];p.dead=false;p.hp=Math.round(p.maxhp*.5);p.mp=p.maxmp*.5;p.x=a.x;p.y=a.y;p.vx=p.vy=0;p.inv=2;sfx('portal');spark(p.x,p.y-30,24,'#fff7a0',260,.7,4,0,true);ftext(p.x,p.y-80,'부활!','#fff7a0',20);
    }else if(!allies.length&&!L.arena&&!L.pq&&!L.town&&p.deadT>1.3){
      p.dead=false;p.hp=p.maxhp;p.mp=p.maxmp;p.x=S.cp.x;p.y=S.cp.y;p.vx=p.vy=0;p.inv=2;sfx('portal');ftext(p.x,p.y-80,'체크포인트 부활','#fff7a0',18);spark(p.x,p.y-30,20,'#fff7a0',200,.6,3,0,true)}
    else if(!allies.length&&L.town&&p.deadT>1.3){p.dead=false;p.hp=p.maxhp;p.mp=p.maxmp;p.vx=p.vy=0;p.inv=2}
    return;
  }
  if(p.kind==='ai')aiThink(p,dt);
  const I=inputOf(p);
  if(p.ground&&(p.ground.dx||p.ground.dy)){p.x+=p.ground.dx;p.y+=p.ground.dy}
  p.mp=Math.min(p.maxmp,p.mp+(2.2+(p.buff&&p.buff.mpr||0))*dt);
  const stunned=p.stun>0;
  // facing
  if(I.fd)p.face=I.fd;
  // ----- dash skill -----
  if(p.dashT>0){
    p.dashT-=dt;p.vx=p.face*720;p.vy=0;p.inv=Math.max(p.inv,.1);
    moveBody(L,p,dt);
    const r=prect(p);r.x-=14;r.w+=28;
    eachTarget(t=>{if(!p.dashHit.has(t)&&ov(r,rectOf(t))){p.dashHit.add(t);dealDamage(p,t,atkOf(p)*p.dashM,p.face)}},p);
    if(Math.random()<.8)parts.push({x:p.x-p.face*10,y:p.y-rnd(8,44),vx:0,vy:0,life:.3,max:.3,size:rnd(4,8),col:JOB[p.job].col,grav:0,glow:true});
    if(p.dashT<=0)p.vx*=.3;
    return finishPlayer(p,dt,I);
  }
  // ----- rope -----
  if(p.rope){
    const rp=p.rope;p.vx=0;p.vy=0;p.x=rp.x;
    const dy=(I.u?-1:0)+(I.d?1:0);p.y+=dy*150*dt;
    if(p.y<=rp.y1){p.y=rp.y1;p.rope=null;p.rcool=.25;if(p===PARTY[0])qev('flag','rope')}
    else if(p.y>=rp.y2){p.y=rp.y2;if(dy>0){p.rope=null;p.rcool=.2}}
    if(I.jT&&(I.l||I.r)){p.rope=null;p.rcool=.3;p.vx=(I.r?1:-1)*230;p.vy=-430;p.face=I.r?1:-1;sfx('jump')}
    p.t+=dy?dt:0;
    return finishPlayer(p,dt,I,true);
  }
  // ----- horizontal -----
  let ax=(I.l?-1:0)+(I.r?1:0);if(stunned)ax=0;
  if(ax&&!I.fd&&p.atkT<=0)p.face=ax;
  if(ax&&I.fd===0&&p.atkT>0)p.face=p.face;
  const sp=spdOf(p)*(p.atkT>0&&p.onGround?.5:1);
  if(!stunned)p.vx=approach(p.vx,ax*sp,(p.onGround?3200:1900)*dt);
  else p.vx=approach(p.vx,0,500*dt);
  // ----- jump -----
  if(I.jT)p.jbuf=.12;else p.jbuf-=dt;
  p.coyote=p.onGround?.09:p.coyote-dt;
  if(p.jbuf>0&&!stunned){
    if(I.d&&p.onGround&&p.ground&&p.ground.t==='o'&&!p.ground.big){p.drop=.28;p.y+=3;p.vy=80;p.jbuf=0;p.coyote=0;p.onGround=false}
    else if(p.coyote>0){p.vy=-JOB[p.job].jump;p.jbuf=0;p.coyote=0;p.onGround=false;sfx('jump');dust(p.x,p.y,4);if(p===PARTY[0])qev('flag','jump')}
  }
  if(!I.jH&&p.vy<-230&&!p.dashT&&!p.rope)p.vy=-230;
  p.drop-=dt;
  p.vy=Math.min(p.vy+GRAV*dt,980);
  p.vyPrev=p.vy;
  // ----- rope grab -----
  if(p.rcool<=0&&(I.u||I.d)&&!stunned){
    for(const rp of L.ropes){
      if(Math.abs(p.x-rp.x)<17){
        if(I.u&&p.y-20>rp.y1&&p.y-20<rp.y2+8){p.rope=rp;p.vx=0;p.vy=0;p.x=rp.x;break}
        if(I.d&&p.y>=rp.y1-4&&p.y<=rp.y1+10&&p.onGround){p.rope=rp;p.y=rp.y1+16;p.vx=0;p.vy=0;break}
      }
    }
  }
  // ----- move & collide -----
  moveBody(L,p,dt);
  if(p.landed){if(p.vyPrev>420){dust(p.x,p.y,6);sfx('land')}}
  if(p.ground&&p.ground.crumble&&!p.ground.crumble.fall&&p.ground.crumble.timer<=0)p.ground.crumble.timer=.55;
  finishPlayer(p,dt,I);
}
function finishPlayer(p,dt,I,onRope){
  const L=S.L;
  if(!L.pvp)p.x=clamp(p.x,18,L.w-18);
  if(Math.abs(p.vx)>20||I.l||I.r)qev('flag',p===PARTY[0]&&Math.abs(p.vx)>30?'move':'');
  // attack input
  if(!onRope&&p.stun<=0){
    if(I.a&&p.atkCd<=0)doBasic(p,I);
    for(let i=0;i<5;i++)if(I.s[i]&&unlocked(p,i))castSkill(p,i);
  }
  p.atkT=Math.max(0,p.atkT-dt);
  if(p.hitQ>=0){p.hitQ-=dt;if(p.hitQ<0){p.hitQ=-1;meleeHit(p)}}
  // spikes
  for(const s of L.spikes){if(ov(prect(p),{x:s.x+2,y:s.y-22,w:s.w-4,h:22})&&p.inv<=0){hurtPlayer(p,Math.round(p.maxhp*.14+6),s.x+s.w/2,{kb:200});p.vy=-420}}
  // checkpoints
  for(const f of S.flagsOn){if(!f.on&&Math.abs(p.x-f.x)<40&&Math.abs(p.y-f.y)<110){f.on=true;S.cp={x:f.x,y:f.y};sfx('flag');ftext(f.x,f.y-110,'체크포인트!','#ffe04a',18);spark(f.x,f.y-60,24,'#ffe04a',220,.8,3,100,true);qev('count',{key:'flag'})}}
  // pit
  if(L.pvp&&p.y>L.killY&&!p.dead){p.hp=0;p.dead=true;p.deadT=0;p.vx=p.vy=0;sfx('die');ftext(p.x,L.h-60,'낙사!','#ff8a8a',22,1.2);pvpKO(p,true);return}
  if(p.y>L.killY){
    const loss=Math.round(p.maxhp*.12);p.hp=Math.max(1,p.hp-loss);ftext(p.x,Math.min(p.y,L.h)-60,'-'+loss,'#ff5a5a',20);sfx('hurt');
    p.x=S.cp.x+rnd(-20,20);p.y=S.cp.y;p.vx=p.vy=0;p.inv=1.5;p.rope=null;S.shake=10;spark(p.x,p.y-30,18,'#fff7a0',200,.6,3,0,true);
  }
  if(p.y>L.h+800){p.y=S.cp.y;p.x=S.cp.x}
  drawAuraFx(p,dt);
  if(p.buff&&Math.random()<.4)parts.push({x:p.x+rnd(-14,14),y:p.y-rnd(0,60),vx:0,vy:-60,life:.5,max:.5,size:rnd(2,4),col:'#ffd34a',grav:-40,glow:true});
}

/* ---------- basic attack ---------- */
function doBasic(p,I){
  const b=JOB[p.job].basic;
  p.atkCd=b.cd/(p.buff&&p.buff.spd>1.1?1.1:1);
  p.atkT=Math.min(.3,b.cd+.04);p.atkDur=p.atkT;
  if(p.comboT>0)p.combo=(p.combo+1)%3;else p.combo=0;p.comboT=.8;
  if(b.k==='melee'){p.hitQ=.07;sfx('atk')}
  else{
    const hq=(()=>{const a=b.homing?0:0;return a})();
    S.pshots.push({owner:p,x:p.x+p.face*16,y:p.y-34,vx:p.face*b.spd,vy:0,w:14,h:14,dmg:atkOf(p)*b.m,pierce:0,life:b.life||.9,kind:b.ammo||JOB[p.job].proj,homing:b.homing,grav:0,hit:new Set(),rot:0,delay:0});
    sfx('throw');
  }
  qev('flag','attacked');
}
function meleeHit(p){
  const b=JOB[p.job].basic,rng=b.range,L=S.L;
  const rx=p.face>0?p.x-10:p.x-rng,r={x:rx,y:p.y-p.h-14,w:rng+10,h:p.h+28};
  const dmg=atkOf(p)*b.m*(p.combo===2?1.5:1);
  let hit=0;
  eachTarget(t=>{if(ov(r,rectOf(t))){dealDamage(p,t,dmg,p.face);hit++}},p);
  S.fx.push({k:'slash',x:p.x+p.face*26,y:p.y-30,face:p.face,t:0,max:.22,col:b.fire?'#ff8a30':JOB[p.job].col,combo:p.combo});
  if(b.fire)spark(p.x+p.face*50,p.y-30,6,'#ff9a40',160,.3,3,-100,true);
  // destroy weak enemy projectiles
  if(hit)p.mp=Math.min(p.maxmp,p.mp+1.2);
}

/* ---------- skills ---------- */
function castSkill(p,i){
  const j=JOB[p.job],sk=j.sk[i];
  if(p.cds[i]>0||p.stun>0)return;
  if(p.mp<sk.mp){if(p.mpWarn<=0){p.mpWarn=.8;ftext(p.x,p.y-76,'MP 부족','#6ab0ff',14)}return}
  p.mp-=sk.mp;p.cds[i]=sk.cd*(p.tier>=3?.88:1);p.skillT=.38;
  if(p.kind==='p1'||p.kind==='p2'){qev('flag','skill');qev('count',{key:'skill'})}
  const dmg=atkOf(p)*(sk.m||1),cx=p.x,cy=p.y-30;
  const nameTag=()=>{ftext(p.x,p.y-96,sk.n,'#ffe9a0',15,.9)};
  switch(sk.k){
    case'burst':{
      sfx('skill');S.shake=Math.max(S.shake,10);nameTag();
      S.fx.push({k:'ring',x:cx,y:cy,r:sk.r,t:0,max:.5,col:sk.col||'#ffe08a'});
      spark(cx,cy,30,sk.col||'#ffe08a',sk.r*1.4,.6,4,100,true);
      eachTarget(t=>{const r=rectOf(t);if(Math.hypot(r.x+r.w/2-cx,r.y+r.h/2-cy)<sk.r+r.w/2)dealDamage(p,t,dmg,sgn(r.x-cx))},p);
      S.eproj=S.eproj.filter(e=>Math.hypot(e.x-cx,e.y-cy)>sk.r);
      break}
    case'fan':{
      sfx(sk.ammo==='fire'?'fire':'throw');
      const n=sk.cnt||1,sp=sk.sp||0;
      for(let k=0;k<n;k++){
        const a=(n>1?(k/(n-1)-.5)*sp*(n>1?1:0):0)*(1),ang=(p.face>0?0:Math.PI)+a*(p.face>0?1:-1);
        S.pshots.push({owner:p,x:cx+p.face*18,y:p.y-34,vx:Math.cos(ang)*(sk.spd||600),vy:Math.sin(ang)*(sk.spd||600),w:18,h:18,dmg:dmg,pierce:sk.pierce||0,life:sk.life||1.1,kind:sk.ammo||j.proj,homing:sk.homing,grav:0,hit:new Set(),rot:0,delay:0,big:n===1&&(sk.m>2)});
      }
      break}
    case'rain':{
      sfx('skill');nameTag();
      const rx=cx+p.face*(sk.off||0);
      for(let k=0;k<sk.cnt;k++){
        S.pshots.push({owner:p,x:rx+rnd(-sk.rw,sk.rw),y:Math.max(-100,p.y-480-rnd(0,120)),vx:0,vy:760,w:18,h:30,dmg:dmg,pierce:0,life:2,kind:sk.ammo||j.proj,aoe:sk.aoe||50,grav:0,hit:new Set(),rot:Math.PI/2,delay:k*.045+rnd(0,.25),falling:true});
      }
      break}
    case'quake':{
      sfx('boom');S.shake=Math.max(S.shake,9);nameTag();
      for(const d of[-1,1])S.pshots.push({owner:p,x:cx+d*20,y:p.y,vx:d*430,vy:0,w:46,h:46,dmg:dmg,pierce:99,life:.85,kind:'wave',grav:0,hit:new Set(),rot:0,delay:0,ground:true,face:d});
      dust(cx,p.y,10);break}
    case'dash':{
      sfx('skill');p.dashT=.22;p.dashHit=new Set();p.dashM=sk.m*(atkOf(p)/Math.max(1,atkOf(p)))||sk.m;nameTag();p.dashM=sk.m;break}
    case'heal':{
      sfx('lvl');nameTag();
      for(const q of PARTY){if(!q.dead&&(!S.L.pvp||q.team===p.team))healPlayer(q,q.maxhp*sk.m)}
      S.fx.push({k:'ring',x:cx,y:cy,r:200,t:0,max:.7,col:'#8affb0'});
      if(sk.burst){S.fx.push({k:'ring',x:cx,y:cy,r:sk.burst.r,t:0,max:.6,col:'#fff7c0'});eachTarget(t=>{const r=rectOf(t);if(Math.hypot(r.x+r.w/2-cx,r.y+r.h/2-cy)<sk.burst.r+r.w/2)dealDamage(p,t,atkOf(p)*sk.burst.m,sgn(r.x-cx))},p);S.eproj=S.eproj.filter(e=>Math.hypot(e.x-cx,e.y-cy)>sk.burst.r);S.shake=Math.max(S.shake,8)}
      break}
    case'buff':{
      sfx('skill');nameTag();p.buff={atk:sk.atk||1,spd:sk.spd||1,def:sk.def||0,mpr:sk.mpr||0,t:sk.dur};
      S.fx.push({k:'ring',x:cx,y:cy,r:90,t:0,max:.5,col:'#ffd34a'});ftext(p.x,p.y-112,'버프!','#ffd34a',16);break}
    case'shield':{
      sfx('portal');nameTag();
      for(const q of(sk.party?PARTY.filter(z=>!S.L.pvp||z.team===p.team):[p])){if(!q.dead){q.shieldT=sk.dur;S.fx.push({k:'ring',x:q.x,y:q.y-30,r:60,t:0,max:.5,col:'#9fe0ff'})}}
      break}
  }
}

/* ---------- player projectiles ---------- */
function updatePshots(dt){
  const L=S.L;
  for(const s of S.pshots){
    if(s.delay>0){s.delay-=dt;continue}
    s.life-=dt;s.rot+=dt*(s.kind==='star'?20:s.kind==='wave'?0:6)*(s.falling?0:1);
    if(s.homing){
      let bt=null,bd=420;eachTarget(t=>{const r=rectOf(t),d=Math.hypot(r.x+r.w/2-s.x,r.y+r.h/2-s.y);if(d<bd&&!s.hit.has(t)){bd=d;bt=r}},s.owner);
      if(bt){const a=Math.atan2(bt.y+bt.h/2-s.y,bt.x+bt.w/2-s.x),sp=Math.hypot(s.vx,s.vy)||400,ca=Math.atan2(s.vy,s.vx);let da=a-ca;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;const na=ca+clamp(da,-6*dt,6*dt);s.vx=Math.cos(na)*sp;s.vy=Math.sin(na)*sp}
    }
    s.x+=s.vx*dt;s.y+=s.vy*dt;
    if(s.ground){const g=groundAt(L,s.x,s.y-20,60);if(g)s.y=g.y;if(Math.random()<.5)dust(s.x,s.y,1,'rgba(255,230,160,')}
    let boom=false;
    const r={x:s.x-s.w/2,y:s.y-s.h/2,w:s.w,h:s.h};
    if(s.falling){
      for(const pl of L.plats){if(pl.solidOff)continue;if(s.x>pl.x&&s.x<pl.x+pl.w&&s.y>=pl.y&&s.y-s.vy*dt<=pl.y+4){boom=true;s.y=pl.y;break}}
    }
    if(!boom)eachTarget(t=>{
      if(s.life<=0&&!boom)return;
      if(s.hit.has(t)||!ov(r,rectOf(t)))return;
      s.hit.add(t);
      if(s.aoe){boom=true;return}
      dealDamage(s.owner,t,s.dmg,sgn(s.vx||1));
      if(s.hit.size>s.pierce)s.life=0;
    },s.owner);
    if(boom){
      sfx('boom');S.fx.push({k:'ring',x:s.x,y:s.y,r:s.aoe,t:0,max:.3,col:s.kind==='popcorn'?'#fff0b0':'#ffb060'});spark(s.x,s.y,10,'#ffd080',200,.4,3,300,true);
      eachTarget(t=>{const rr=rectOf(t);if(Math.hypot(rr.x+rr.w/2-s.x,rr.y+rr.h/2-s.y)<s.aoe+rr.w/2)dealDamage(s.owner,t,s.dmg,sgn(rr.x-s.x))},s.owner);
      s.life=0;
    }
    if(s.x<-60||s.x>L.w+60||s.y>L.h+300||s.y<-700)s.life=0;
  }
  S.pshots=S.pshots.filter(s=>s.life>0);
}
function drawPshot(g,s,t){
  if(s.delay>0)return;
  const k=s.kind;
  if(k==='wave'){
    g.save();g.translate(s.x,s.y);g.scale(s.face,1);const gr=g.createLinearGradient(-30,0,20,0);gr.addColorStop(0,'rgba(255,230,160,0)');gr.addColorStop(1,'rgba(255,240,190,.9)');
    g.fillStyle=gr;g.beginPath();g.moveTo(-34,0);g.quadraticCurveTo(-4,-60,22,-8);g.lineTo(22,0);g.closePath();g.fill();g.restore();return}
  if(k==='broc'||k==='carrot'||k==='radish'){drawVegProj(g,k,s.x,s.y,Math.atan2(s.vy,s.vx)+(k==='broc'?s.rot:0),s.big?1.4:1);return}
  g.save();g.translate(s.x,s.y);
  if(k==='orb'||k==='holy'||k==='fire'||k==='chili'||k==='popcorn'||k==='kernel'||k==='star'){
    const col=k==='orb'?'120,210,255':k==='holy'?'255,240,160':k==='fire'||k==='chili'?'255,130,40':k==='popcorn'?'255,246,210':k==='kernel'?'255,216,58':'200,140,255';
    const gl=g.createRadialGradient(0,0,2,0,0,(s.big?26:18));gl.addColorStop(0,`rgba(${col},.9)`);gl.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gl;g.fillRect(-28,-28,56,56);
    if(k==='orb'){circ(g,0,0,6.5*(s.big?1.4:1),'#e8fbff',O_,1.5)}
    else if(k==='holy'){g.rotate(s.rot);poly(g,[0,-9,3,-3,9,0,3,3,0,9,-3,3,-9,0,-3,-3],'#fff6b8',O_,1.4)}
    else if(k==='fire'||k==='chili'){g.rotate(Math.atan2(s.vy,s.vx));g.beginPath();g.moveTo(-14,0);g.quadraticCurveTo(-4,-9,8,0);g.quadraticCurveTo(-4,9,-14,0);g.fillStyle='#ff6a20';g.fill();circ(g,2,0,4.4,'#ffe08a')}
    else if(k==='popcorn'){for(const[a,b2,r]of[[-4,-2,5],[3,-3,4.5],[0,3,5]])circ(g,a,b2,r,'#fffaf0',O_,1.3)}
    else if(k==='kernel'){g.rotate(Math.atan2(s.vy,s.vx));ell(g,0,0,6,3.4,'#ffd83a',O_,1.3)}
    else if(k==='star'){g.rotate(s.rot);poly(g,[0,-9,3,-3,9,0,3,3,0,9,-3,3,-9,0,-3,-3],'#d8b0ff',O_,1.4)}
  }else circ(g,0,0,6,'#fff');
  g.restore();
}

/* ---------- AI companion ---------- */
function pvpAI(p,dt){
  const I={l:0,r:0,u:0,d:0,uT:0,jT:0,jH:0,a:0,aT:0,s:[0,0,0,0,0],fd:0};p.ai=I;
  if(S.pvp.over)return;
  let en=null,ed=9999;for(const q of PARTY){if(q.dead||q.team===p.team)continue;const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<ed){ed=d;en=q}}
  if(!en)return;
  p.aiT-=dt;p.jT=(p.jT||0)-dt;
  const j=JOB[p.job],ranged=j.basic.k==='shoot',dx=en.x-p.x,pref=ranged?260:60;
  I.fd=sgn(dx);
  let go=0;if(Math.abs(dx)>pref+20)go=sgn(dx);else if(ranged&&Math.abs(dx)<pref-90)go=-sgn(dx);
  // 낭떠러지 회피
  if(go&&p.onGround&&!groundAt(S.L,p.x+go*34,p.y-4,120))go=0;
  // 밀려나 섬 밖에 나갔으면 섬 중앙 쪽으로
  const sp=S.L.spawns[p.team];if(p.y>S.L.h-40||(!p.onGround&&Math.abs(p.x-S.L.w/2)>S.L.w/2-60))go=sgn(S.L.w/2-p.x);
  I.l=go<0?1:0;I.r=go>0?1:0;
  if(Math.abs(dx)<(ranged?520:j.basic.range+24)&&Math.abs(en.y-p.y)<120)I.a=1;
  if(en.y<p.y-70&&p.onGround&&p.jT<=0&&Math.abs(dx)<220){I.jT=1;I.jH=1;p.jT=.9}
  if(!p.onGround&&p.y>S.L.h-20&&p.jT<=0){I.jT=1;I.jH=1;p.jT=.5}
  if(p.aiT<=0){p.aiT=.35;for(let i=4;i>=0;i--){
    if(!unlocked(p,i)||p.cds[i]>0||p.mp<j.sk[i].mp+4)continue;const sk=j.sk[i];let use=false;
    if(sk.k==='burst')use=ed<sk.r*.8;else if(sk.k==='fan'||sk.k==='rain'||sk.k==='quake')use=ed<460;else if(sk.k==='dash')use=ed>90&&ed<300;
    else if(sk.k==='buff')use=!p.buff&&ed<420;else if(sk.k==='shield')use=p.hp<p.maxhp*.5;else if(sk.k==='heal')use=p.hp<p.maxhp*.5;
    if(use&&Math.random()<.5){I.s[i]=1;break}}}
}
function aiThink(p,dt){
  if(S.L.pvp)return pvpAI(p,dt);
  const I={l:0,r:0,u:0,d:0,uT:0,jT:0,jH:0,a:0,aT:0,s:[0,0,0,0,0],fd:0};p.ai=I;
  const humans=PARTY.filter(q=>!q.dead&&q.kind!=='ai'),lead=humans[0]||PARTY.find(q=>!q.dead&&q!==p);
  if(!lead)return;
  p.aiT-=dt;
  // find target
  let tg=null,td=p.hold?220:340;
  eachTarget(t=>{if(t.kind==='dummy')return;const r=rectOf(t),d=Math.hypot(r.x+r.w/2-p.x,r.y+r.h/2-(p.y-30));if(d<td){td=d;tg=r}},p);
  const j=JOB[p.job],ranged=j.basic.k==='shoot';
  if(p.hold){
    if(tg){I.fd=sgn(tg.x+tg.w/2-p.x);if(td<(ranged?300:90)){I.a=1}}
  }else{
    const dxL=lead.x-p.x,dyL=lead.y-p.y;
    p.far=(Math.abs(dxL)>620||Math.abs(dyL)>240)?p.far+dt:0;
    if(p.far>1.2||Math.abs(dxL)>900){p.x=lead.x-lead.face*50;p.y=lead.y;p.vx=p.vy=0;p.far=0;p.rope=null;spark(p.x,p.y-30,12,'#cfe0ff',180,.5,3,0,true)}
    let goX=lead.x-p.x,keep=110+(p.slot||0)*50;
    if(tg){
      const tx=tg.x+tg.w/2,pref=ranged?230:58;
      if(Math.abs(tx-p.x)>pref+14)goX=tx-p.x;else if(ranged&&Math.abs(tx-p.x)<pref-60)goX=p.x-tx;else goX=0;
      I.fd=sgn(tx-p.x);
      if(td<(ranged?380:j.basic.range+26)&&Math.abs((tg.y+tg.h/2)-(p.y-30))<110+(ranged?70:0))I.a=1;
      // skills
      if(p.aiT<=0){
        p.aiT=.25;
        for(let i=4;i>=0;i--){
          if(!unlocked(p,i)||p.cds[i]>0||p.mp<j.sk[i].mp+4)continue;const sk=j.sk[i];
          let use=false;
          if(sk.k==='burst')use=td<sk.r*.85;
          else if(sk.k==='fan'||sk.k==='rain'||sk.k==='quake')use=td<420&&(sk.mp>8||Math.random()<.4);
          else if(sk.k==='dash')use=td>100&&td<300;
          else if(sk.k==='buff')use=!p.buff&&td<400;
          else if(sk.k==='shield')use=p.hp<p.maxhp*.55;
          else if(sk.k==='heal')use=PARTY.some(q=>!q.dead&&q.hp<q.maxhp*.55);
          if(use&&Math.random()<.6){I.s[i]=1;break}
        }
      }
    }else{
      if(Math.abs(goX)<keep)goX=0;
      // heal when idle
      if(p.aiT<=0){p.aiT=.4;const sk=j.sk[0];if(j.sk.some((s,i)=>s.k==='heal'&&unlocked(p,i)&&p.cds[i]<=0&&p.mp>=s.mp)&&PARTY.some(q=>!q.dead&&q.hp<q.maxhp*.5)){const i=j.sk.findIndex((s,i)=>s.k==='heal'&&unlocked(p,i));if(i>=0)I.s[i]=1}}
    }
    I.l=goX<-8?1:0;I.r=goX>8?1:0;
    // jump over obstacles / up to leader
    p.jT=(p.jT||0)-dt;
    if(p.onGround&&p.jT<=0){
      if((p.hitWall&&(I.l||I.r))||(lead.y<p.y-70&&Math.abs(dxL)<150&&!tg)||(tg&&tg.y+tg.h/2<p.y-70&&Math.abs(tg.x+tg.w/2-p.x)<110)){I.jT=1;I.jH=1;p.jT=.9}
    }
    if(!p.onGround&&p.vy<0)I.jH=1;
  }
}
