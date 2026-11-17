/* ============================================================
   MAIN : game flow, maps, rendering, loop
   ============================================================ */
const G={state:'title',t:0,ui:null,dlg:null,toasts:[],fade:null,sel:0,jsel:0,clear:null,paused:false,pqRun:null,banner:null,
  toast(m){this.toasts.push({m,t:0,max:3.2});if(this.toasts.length>4)this.toasts.shift()}};
const NOSAVE=()=>!loadGame();

function buildP1(){
  const p=mkPlayer('p1',SAVE.job,SAVE.lvl);p.tier=SAVE.tier||0;p.fid=SAVE.fid|0;p.eq=Object.assign({},SAVE.eq);p.slot=0;recalc(p);p.hp=p.maxhp;p.mp=p.maxmp;return p;
}
function newGame(jobId){
  SAVE=defaultSave(jobId);SAVE.fid=G.fsel|0;PARTY=[buildP1()];saveGame();G.pqRun=null;
  goMap('harbor',true);checkDaily();G.toast('선장 감자수염에게 ↑ 로 말을 걸어보세요!');setTimeout(sayHello,1500);
}
function continueGame(){
  SAVE=loadGame();if(!SAVE)return;
  for(const k of['inv','eq','potions','q','flags','cnt','talked','cleared'])SAVE[k]=SAVE[k]||{};
  SAVE.potions.hp=SAVE.potions.hp||0;SAVE.potions.mp=SAVE.potions.mp||0;SAVE.tier=SAVE.tier||0;SAVE.pq=SAVE.pq||0;SAVE.duel=SAVE.duel||{w:0,l:0};SAVE.ec=SAVE.ec||0;SAVE.att=SAVE.att||{last:-1,streak:0,total:0,weeks:0};SAVE.enh=SAVE.enh||{atk:0,hp:0,used:0};SAVE.scrolls=SAVE.scrolls||{};SAVE.mega=SAVE.mega||{m:1,h:0};SAVE.dg=SAVE.dg||{};SAVE.stele=SAVE.stele||{};ensureAP();SAVE.gear=SAVE.gear||{};SAVE.ginv=SAVE.ginv||{};migrateGear();SAVE.dayKey=SAVE.dayKey||'';
  PARTY=[buildP1()];goMap(SAVE.lvl<5&&!SAVE.flags.leftHarbor&&qst('h4').s!=='done'?'harbor':'town',true);setTimeout(sayHello,1500);if(checkDaily())G.toast('새로운 하루! 일일 퀘스트가 초기화됐어요 (쪽파)');
}

/* ---------- map loading ---------- */
function goMap(id,instant,end){
  if(instant){loadMap(id,end);return}
  G.fade={t:0,phase:'out',cb:()=>loadMap(id,end)};
}
function loadMap(id,end){
  PARTY=PARTY.filter(p=>!p.foe);
  const L=MAPS[id]();
  if(end&&L.endSpawn)L.spawn=L.endSpawn;
  S={L,id,t:0,time:0,mobs:[],dummies:[],boxes:[],items:[],pshots:[],eproj:[],zones:[],fx:[],clones:[],boss:null,cam:{x:0,y:0},shake:0,hitstop:0,slow:0,
     cp:{x:L.spawn.x,y:L.spawn.y},flagsOn:L.flags.map(f=>Object.assign({on:false},f)),drops:L.drops.map(d=>({x:d.x,y:d.y,period:d.period,t:d.ph,warn:0})),
     bg:getBG(L.theme),kills:0,pq:null,spT:0,npcs:L.npcs};
  parts.length=0;texts.length=0;
  const fire=Object.assign(L.theme==='lava'?{col:'rgba(255,140,60,',col2:'#ff9a40',col3:'#c03010'}:{},L.mhue?{hue:L.mhue}:{});
  for(const m of L.mobs){if(m[0]==='egg')spawnMob('egg',m[1],m[2],Object.assign({min:m[3],max:m[4]},L.mhue?{hue:L.mhue}:{}));else spawnMob('wisp',m[1],m[2],Object.assign({range:m[3]},fire))}
  for(const d of L.dummies)S.dummies.push({kind:'dummy',x:d.x,y:d.y,w:36,h:92,hp:150,max:150,shake:0,flash:0,regen:0,respawn:0});
  for(const b of L.boxes)S.boxes.push(Object.assign({kind:'box',w:44,h:44,dead:false},b));
  if(L.pq){
    const r=G.pqRun||(G.pqRun={});
    if(L.pq===1){r.coupons=0}if(L.pq===3){r.keys=0}
    r.coupons=r.coupons||0;r.keys=r.keys||0;r.hold=0;r.plateOn=0;r.done=false;r.active=true;S.pq=r;
  }
  PARTY.forEach((p,i)=>{
    p.dead=false;p.hp=L.town?p.maxhp:Math.max(p.hp,Math.round(p.maxhp*.6));if(L.town)p.mp=p.maxmp;
    p.x=L.spawn.x-i*30;p.y=L.spawn.y;p.vx=p.vy=0;p.rope=null;p.cds=[0,0,0,0,0];p.buff=null;p.shieldT=0;p.dashT=0;p.stun=0;p.inv=1.2;p.atkT=0;p.hitQ=-1;p.hold=false;p.far=0;p.ground=null;p.onGround=false;
  });
  if(L.pvp)setupPvp();
  if(L.dg)dgInit();
  if(L.hub&&!SAVE.flags.hubIntro){SAVE.flags.hubIntro=1;setTimeout(()=>{if(S&&S.id==='stele')playScene('hub')},900)}
  if(L.boss)S.boss=mkBoss(L.boss);
  const lead=PARTY[0];S.cam.x=clamp(lead.x-W/2,0,Math.max(0,L.w-W));S.cam.y=clamp(lead.y-H*.62,0,Math.max(0,L.h-H));
  G.state='play';G.ui=null;G.dlg=null;G.banner={t:0,name:L.name,sub:L.sub};
  startMusic(L.music);
  if(L.town)saveGame();
}
function setupPvp(){
  S.pvp={score:[0,0],to:3,over:false,winner:-1,t:0};
  const cnt=[0,0];
  for(const p of PARTY){p.team=p.kind==='p2'?1:p.kind==='p1'?0:-1;if(p.team>=0)cnt[p.team]++}
  for(const p of PARTY)if(p.team<0){p.team=cnt[0]<=cnt[1]?0:1;cnt[p.team]++}
  while(cnt[1]<Math.max(1,cnt[0])&&PARTY.length<8){
    addMember('ai',JOBS[Math.random()*8|0].id);G.toasts.pop();
    const f=PARTY[PARTY.length-1];f.foe=true;f.team=1;f.tier=SAVE.tier;recalc(f);f.hp=f.maxhp;f.mp=f.maxmp;cnt[1]++;
  }
  const idx=[0,0];
  for(const p of PARTY){const sp=S.L.spawns[p.team],k=idx[p.team]++;p.x=sp.x+(k%2?1:-1)*Math.ceil(k/2)*34;p.y=sp.y;p.vx=p.vy=0;p.face=p.team?-1:1;p.hp=p.maxhp;p.mp=p.maxmp;p.inv=1.5;p.lastAtk=null;p.dead=false}
  S.cp={x:S.L.spawn.x,y:S.L.spawn.y};
}
function startPQ(){G.pqRun={coupons:0,keys:0,hold:0,plateOn:0};goMap('pq1')}
function returnTown(){
  const id=S&&S.id;G.clear=null;
  if(S&&S.L.ch)return goMap('stele');
  if(id==='boss1'&&['active','ready'].includes(qst('j2').s))return goMap('forest',false,true);
  if(id==='boss2'&&['active','ready'].includes(qst('j3').s))return goMap('sky',false,true);
  goMap('town');
}
function stageDone(msg){
  const pq=S.pq;pq.done=true;pq.active=false;
  for(const m of S.mobs)if(!m.dead){m.dead=true;spark(m.x,m.y-10,10,'#cfa8ff',200,.5,3,0,true)}
  for(const p of S.L.portals)p.hidden=false;
  sfx('portal');G.toast(msg+'  오른쪽 포탈이 열렸다!');S.shake=10;
}
function toggleHold(){
  const ais=PARTY.filter(p=>p.kind==='ai'&&!p.dead);
  if(!ais.length){G.toast('AI 동료가 없습니다 (파티 모집꾼)');return}
  const on=!ais[0].hold;
  if(on&&S.L.plates.length){
    const free=S.L.plates.filter(pl=>!PARTY.some(q=>q.kind!=='ai'&&!q.dead&&q.onGround&&q.x>pl.x&&q.x<pl.x+pl.w&&Math.abs(q.y-pl.y)<6));
    ais.forEach((a,k)=>{const pl=free[k];a.hold=true;if(pl){a.x=pl.x+pl.w/2;a.y=pl.y-1;a.vx=a.vy=0;a.rope=null;spark(a.x,a.y-30,12,'#9fe0ff',180,.5,3,0,true)}});
  }else ais.forEach(a=>a.hold=on);
  G.toast(on?'AI 동료: 대기 (E 로 해제)':'AI 동료: 따라오기');sfx('sel');
}
function usePotion(k){
  const p=PARTY[0];if(p.dead)return;
  if(!SAVE.potions[k]){G.toast('물약이 없습니다 (상점)');return}
  SAVE.potions[k]--;sfx('pickup');
  if(k==='hp'){const h=Math.round(p.maxhp*POTION.hp.heal);p.hp=Math.min(p.maxhp,p.hp+h);ftext(p.x,p.y-80,'+'+h,'#6aff8a',20)}
  else{const h=Math.round(p.maxmp*POTION.mp.heal);p.mp=Math.min(p.maxmp,p.mp+h);ftext(p.x,p.y-80,'+'+h,'#6ab0ff',20)}
}

/* ---------- interactions (P1: ↑) ---------- */
function nearInteract(){
  const p=PARTY[0],L=S.L;if(!p||p.dead)return null;
  for(const n of L.npcs||[]){
    if(n.hidden){if(SAVE.lvl<(n.minLv||6)||Math.abs(p.x-n.x)>200||(n.seeY&&Math.abs(p.y-n.gy)>140))continue}
    if(Math.abs(p.x-n.x)<56&&Math.abs(p.y-n.gy)<40)return{k:'npc',n};
  }
  for(const po of L.portals){if(!po.hidden&&Math.abs(p.x-po.x)<52&&Math.abs(p.y-po.y)<70)return{k:'portal',po}}
  if(L.steles)for(const st of L.steles)if(Math.abs(p.x-st.x)<55&&Math.abs(p.y-st.y)<30)return{k:'stele',st};
  if(L.altar&&!S.boss&&Math.abs(p.x-L.altar.x)<60&&Math.abs(p.y-L.altar.y)<30)return{k:'altar'};
  return null;
}
function usePortal(po){
  if(po.lockLv&&SAVE.lvl<po.lockLv){G.toast(po.boat?'배는 Lv.5부터 탈 수 있어요 — 항구에서 조금 더 수련해요!':'Lv.'+po.lockLv+' 이상만 갈 수 있다');return}
  if(po.boat){SAVE.flags.leftHarbor=1;saveGame()}
  if(po.lock&&!SAVE.cleared[po.lock]){G.toast('아직 갈 수 없다… ('+MOBNAME(po.lock)+'을(를) 쓰러뜨려야 한다)');return}
  if(po.party&&PARTY.length<2){const n={name:'귀문 수문장 해태'};openDialog(n.name,'귀목의 제단은 파티 던전이다. 2명 이상이어야 들어갈 수 있다.\nAI 동료로 채워서 들어가겠나? (2P는 마을 파티 모집꾼)',[{t:'AI 동료 2명과 입장',fn:()=>{while(PARTY.length<3)addMember('ai',JOBS[Math.random()*8|0].id);closeUI();usePortal(po)}},{t:'취소',fn:closeUI}]);return}
  if(po.reach){SAVE.cleared[po.reach]=true;qev('reach',{map:po.reach});}
  sfx('portal');goMap(po.to);
}
function summonGuimok(){
  if(!(SAVE.inv.gwi>0)){G.toast('귀안(鬼眼)이 필요하다 — 귀문 수문장 퀘스트로만 얻을 수 있다');sfx('hurt');return}
  SAVE.inv.gwi--;saveGame();sfx('portal');S.shake=20;spark(S.L.altar.x,S.L.altar.y-60,50,'#ff6a20',420,1,5,0,true);
  S.boss=mkBoss('guimok');G.banner={t:0,name:'천년 귀목',sub:'팔 8개를 모두 부숴야 본체에 피해가 들어간다!'};startMusic('boss');
}
const MOBNAME=id=>({dokkaebi:'도깨비 대왕',fox:'구미호',eggking:'킹 달걀 슬라임'})[id]||id;

/* ---------- main step ---------- */
function step(dt){
  G.t+=dt;
  for(const ts of G.toasts)ts.t+=dt;G.toasts=G.toasts.filter(ts=>ts.t<ts.max);
  if(tap('mute')&&G.state!=='title'){muted=!muted;if(muted)stopMusic(true);else startMusic(MUS.theme);G.toast(muted?'음소거':'소리 켬')}
  if(G.fade){
    G.fade.t+=dt;
    if(G.fade.phase==='out'&&G.fade.t>=.35){G.fade.cb();G.fade={t:0,phase:'in'}}
    else if(G.fade.phase==='in'&&G.fade.t>=.4)G.fade=null;
    if(G.fade&&G.fade.phase==='out')return;
  }
  if(G.state==='title')return titleStep();
  if(G.state==='select')return selectStep();
  if(!S)return;
  if(G.state==='over'){if(tap('ok')){const id=S.id;for(const p of PARTY){p.dead=false;p.hp=p.maxhp;p.mp=p.maxmp}if(S.L.pq===1||S.L.pq===2||S.L.pq===3)G.pqRun=Object.assign(G.pqRun||{},{});goMap(id)}if(pressed.Escape){for(const p of PARTY){p.dead=false;p.hp=p.maxhp}goMap('town')}return}
  if(G.state==='clear'){ambient(dt);if(tap('ok'))returnTown();return}
  // ----- play -----
  if(G.ui){
    if(G.ui==='dialog')dialogUpdate();
    else if(G.ui==='shop')shopUpdate();
    else if(G.ui==='wardrobe')wdUpdate();
    else if(G.ui==='inv')invUpdate();
    else if(G.ui==='scene')sceneUpdate(dt);
    else if(G.ui==='stat')statUpdate();
    else if(G.ui==='fame'){if(pressed.Escape||pressed.Enter||pressed.ArrowUp&&0)closeUI()}
    else if(G.ui==='qlog'){if(pressed.KeyQ||pressed.Escape||pressed.Enter)closeUI()}
    else if(G.ui==='help'){if(Object.keys(pressed).length)closeUI()}
    else if(G.ui==='pause'){const nv=nav();if(nv.u||nv.d){G.psel=1-(G.psel||0);sfx('sel')}if(pressed.KeyP||pressed.Escape){closeUI()}else if(nv.ok){if(G.psel){saveGame();stopMusic();G.state='title';G.ui=null;S=null}else closeUI()}}
    return;
  }
  if(pressed.KeyP||pressed.Escape){G.ui='pause';G.psel=0;return}
  if(pressed.KeyQ){G.ui='qlog';return}
  if(pressed.KeyO){openStat();return}
  if(pressed.Enter&&!G.chatOpen&&!(S.pvp&&S.pvp.over)){openChat();return}
  if(pressed.KeyI){openInv();return}
  if(pressed.KeyH){G.ui='help';return}
  if(pressed.Digit1)usePotion('hp');if(pressed.Digit2)usePotion('mp');
  if(pressed.KeyE)toggleHold();
  playStep(dt);
}
function ambient(dt){
  const L=S.L;
  if(Math.random()<dt*6)parts.push({x:S.cam.x+rnd(0,W),y:S.cam.y+rnd(H*.3,H),vx:rnd(-12,12),vy:rnd(-14,-4),life:4,max:4,size:rnd(1.4,2.6),col:THEMES[L.theme].fly,grav:0,glow:true,amb:true});
  for(const q of parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=q.grav*dt;q.life-=dt;if(q.amb){q.vx+=rnd(-30,30)*dt;q.vy+=rnd(-30,30)*dt}}
  for(let i=parts.length-1;i>=0;i--)if(parts[i].life<=0)parts.splice(i,1);
  for(const tx of texts){tx.y+=tx.vy*dt;tx.vy*=.96;tx.life-=dt}for(let i=texts.length-1;i>=0;i--)if(texts[i].life<=0)texts.splice(i,1);
}
function playStep(dt){
  const L=S.L,lead=PARTY[0];
  if(S.hitstop>0){S.hitstop-=dt;return}
  if(S.slow>0){S.slow-=dt;dt*=.45}
  S.t+=dt;S.time+=dt;G.banner&&(G.banner.t+=dt);
  updatePlats(L,dt,S.t);
  for(const p of PARTY)updatePlayer(p,dt);
  updateMobs(dt);updateItems(dt);updatePshots(dt);updateEproj(dt);updateZones(dt);updateBoss(dt);storyStep(dt);presenceStep(dt);
  // totems
  for(const d of S.drops){
    d.t+=dt;const ph=d.t%d.period;d.warn=ph>d.period-.75?1:0;
    if(d.t>=d.period){d.t-=d.period;const n=nearestAlive(d.x,d.y,800);if(n){addEproj({kind:'rock',x:d.x,y:d.y+22,vy:60,grav:1300,r:15,dmg:20,life:5});sfx('warn')}}
  }
  // pq
  if(L.pq&&S.pq&&!S.pq.done){
    const pq=S.pq;
    if(L.pq===1&&pq.coupons>=15)stageDone('영혼 쿠폰을 모두 모았다!');
    else if(L.pq===3&&pq.keys>=7)stageDone('열쇠를 모두 찾았다!');
    else if(L.pq===2){
      let on=0;L.plates.forEach(pl=>{pl.on=PARTY.some(q=>!q.dead&&q.onGround&&q.x>pl.x&&q.x<pl.x+pl.w&&Math.abs(q.y-pl.y)<6);if(pl.on)on++});
      pq.plateOn=on;if(on===L.plates.length)pq.hold+=dt;else pq.hold=Math.max(0,pq.hold-dt*2);
      if(pq.hold>=1.5)stageDone('혼의 발판이 하나가 되었다!');
    }
  }
  // fx
  for(const f of S.fx)f.t+=dt;S.fx=S.fx.filter(f=>f.t<f.max);
  ambient(dt);
  S.shake=Math.max(0,S.shake-dt*40);
  // human 2P rubber band
  for(const p of PARTY){if(p.kind==='p2'&&!p.dead&&lead&&!lead.dead){const dx=Math.abs(p.x-lead.x),dy=Math.abs(p.y-lead.y);p.far=(dx>W/2-30||dy>H/2-10)?p.far+dt:0;if(p.far>1.5){p.x=lead.x;p.y=lead.y;p.vx=p.vy=0;p.far=0;sfx('portal');spark(p.x,p.y-30,16,'#cfe0ff',200,.5,3,0,true)}}}
  // interact
  const near=nearInteract();S.near=near;
  if(near&&pressed.ArrowUp&&!lead.rope){if(near.k==='stele')steleMenu(near.st.c);else if(near.k==='altar')summonGuimok();else if(near.k==='npc')talkNPC(near.n);else if(near.k==='portal'){if(near.po.pqNext){sfx('portal');goMap(near.po.to)}else usePortal(near.po)}}
  // camera
  const cl=alive()[0]||lead;
  const tx=clamp(cl.x-W/2+cl.face*50,0,Math.max(0,L.w-W)),ty=clamp(cl.y-H*.6,0,Math.max(0,L.h-H));
  const k=1-Math.pow(.0005,dt);S.cam.x=lerp(S.cam.x,tx,k);S.cam.y=lerp(S.cam.y,ty,k);
  // game over
  if(PARTY.every(p=>p.dead)&&(L.arena||L.pq)&&G.state==='play'){S.overT=(S.overT||0)+dt;if(S.overT>1.4){G.state='over'}}
  // pvp end
  if(S.pvp&&S.pvp.over){S.pvp.t+=dt;if(S.pvp.t>1.2&&(pressed.Enter||pressed.Space)){returnTown();return}}
  // save auto
  S.saveT=(S.saveT||0)+dt;if(S.saveT>20){S.saveT=0;saveGame()}
}

/* ---------- title / select ---------- */
function titleStep(){
  const opts=titleOpts();
  if(tap('up')||tap('down')){G.sel=(G.sel+(tap('up')?opts.length-1:1))%opts.length;sfx('sel')}
  if(tap('ok')){
    const o=opts[G.sel];initAudio();
    if(o==='login'){openAuth();return}
    if(o==='new'){if(loadGame()&&!confirm('저장된 캐릭터가 있습니다.\n새로 시작하면 덮어씁니다. 계속할까요?'))return;G.state='select';G.jsel=0;sfx('sel');startMusic('field')}
    else if(o==='cont'){continueGame();sfx('lvl')}
    else if(o==='help'){G.helpT=1}
  }
  if(G.helpT&&Object.keys(pressed).length>0&&!tap('ok'))G.helpT=0;
}
const titleOpts=()=>(loadGame()?['cont','new','login','help']:['new','login','help']);
function selectStep(){
  if(tap('left'))G.jsel=(G.jsel+7)%8;if(tap('right'))G.jsel=(G.jsel+1)%8;
  if(tap('up'))G.jsel=(G.jsel+4)%8;if(tap('down'))G.jsel=(G.jsel+4)%8;
  if(tap('left')||tap('right')||tap('up')||tap('down'))sfx('sel');
  if(pressed.Escape){G.state='title';return}
  if(pressed.KeyF){G.fsel=((G.fsel|0)+1)%FACES.length;sfx('sel')}
  if(tap('ok')){newGame(JOBS[G.jsel].id);sfx('lvl')}
}
function drawTitle(g,t){
  const bg=getBG('forest');drawBG(g,bg,t*28,0,0);
  const gr=g.createLinearGradient(0,H*.55,0,H);gr.addColorStop(0,'rgba(10,5,24,0)');gr.addColorStop(1,'rgba(10,5,24,.92)');g.fillStyle=gr;g.fillRect(0,H*.4,W,H*.6);
  // ground
  g.fillStyle='#2f7d3b';g.fillRect(0,468,W,H);g.fillStyle='#5cbc52';g.fillRect(0,468,W,8);g.fillStyle='#3f271d';g.fillRect(0,484,W,H);
  JOBS.forEach((j,i)=>{const x=70+i*116,fl=i%2?-1:1;drawVeggie(g,j,{x,y:470,face:fl,t:t+i,st:'idle',fid:[1,3,11,9,13,4,7,19][i],eq:i===2?{hat:'hat_gat'}:i===5?{hat:'hat_ninja',cape:'cape_red'}:i===7?{outfit:'out_hanbok',aura:'aura_petal'}:i===4?{face:'face_sun'}:{},tier:i%3+1})});
  g.save();g.translate(W/2,128);
  g.font=F(66);g.textAlign='center';g.lineJoin='round';
  g.lineWidth=14;g.strokeStyle='#1c0a22';g.strokeText('채근담담 온라인',0,0);
  const tg=g.createLinearGradient(0,-60,0,10);tg.addColorStop(0,'#fff3a0');tg.addColorStop(.5,'#8be05a');tg.addColorStop(1,'#2f9a3e');g.fillStyle=tg;g.fillText('채근담담 온라인',0,0);
  g.lineWidth=3;g.strokeStyle='#fff';g.globalAlpha=.25;g.strokeText('채근담담 온라인',0,0);g.globalAlpha=1;
  txt(g,'~ 야채 무기 대모험 · 점프맵 · 보스 · 스토리 던전 ~',0,40,22,'#ffe9a0','center');
  g.restore();
  const opts=titleOpts(),lab={cont:'이어하기',new:'새로 시작',help:'조작법',login:ACCT?'계정 · '+ACCT.name:'로그인 / 회원가입'};
  opts.forEach((o,i)=>{const y=232+i*54,sel=G.sel===i;g.fillStyle=sel?'rgba(255,220,120,.3)':'rgba(10,5,24,.55)';g.beginPath();g.roundRect(W/2-140,y,280,44,12);g.fill();g.strokeStyle=sel?'#ffd34a':'rgba(255,255,255,.25)';g.lineWidth=sel?3:1.5;g.stroke();txt(g,lab[o],W/2,y+30,22,sel?'#ffe9a0':'#fff','center')});
  txt(g,'↑↓ 선택 · Enter 확인',W/2,H-18,14,'rgba(255,255,255,.7)','center',2);
  txt(g,ACCT?'☁ '+ACCT.name+' 님 · 클라우드 저장 '+(CLOUD.ok===false?'(연결 실패 — 로컬에 저장됨)':'ON'):'게스트 · 이 브라우저에만 저장됩니다',W-14,H-18,13,ACCT?'#9be8ff':'#cfd4e2','right',2);
  if(G.helpT)drawHelp(g);
}
function drawSelect(g,t){
  const bg=getBG('forest');drawBG(g,bg,t*20,0,0);g.fillStyle='rgba(10,5,24,.7)';g.fillRect(0,0,W,H);
  txt(g,'직업을 선택하세요  (8직업 · 1차 Lv.'+ADV_LV[1]+' / 2차 Lv.'+ADV_LV[2]+' / 3차 Lv.'+ADV_LV[3]+' 전직 · 만렙 '+MAXLV+')',W/2,46,26,'#ffe9a0','center');
  JOBS.forEach((j,i)=>{
    const cx=(i%4),cy=(i/4|0),x=36+cx*224,y=70+cy*190,sel=G.jsel===i;
    panel(g,x,y,208,178,sel?.95:.6);
    if(sel){g.strokeStyle='#ffd34a';g.lineWidth=4;g.beginPath();g.roundRect(x,y,208,178,12);g.stroke()}
    g.save();g.beginPath();g.rect(x+6,y+6,196,120);g.clip();
    const gl=g.createRadialGradient(x+104,y+100,10,x+104,y+100,90);gl.addColorStop(0,j.col+'55');gl.addColorStop(1,j.col+'00');g.fillStyle=gl;g.fillRect(x,y,208,178);
    drawVeggie(g,j,{x:x+104,y:y+122,face:1,t:t+i,st:sel?'skill':'idle',tier:0,fid:G.fsel|0});g.restore();
    txt(g,j.veg+' '+j.role,x+104,y+148,17,'#fff','center');txt(g,'수련생→'+j.line.join('→'),x+104,y+168,10,'#ffe9a0','center',2);
  });
  const j=JOBS[G.jsel];panel(g,36,448,888,82,.85);
  txt(g,j.bio,54,478,16,'#fff');
  txt(g,'수련생 C '+j.sk[1].n+' · 1차 X '+j.sk[0].n+' / V '+j.sk[2].n+' · 2차 B '+j.sk[3].n+' · 3차 N '+j.sk[4].n,54,506,13,'#9be8ff','left',2);
  txt(g,'← → ↑ ↓ 선택 · F 표정 바꾸기 ['+FACES[G.fsel|0]+'] · Enter 시작 · Esc 뒤로',W-30,22,13,'rgba(255,255,255,.7)','right',2);
}

/* ---------- world render ---------- */
function drawWalls(g,L,T,cam){
  for(const side of[0,1]){
    const x=side?L.w-22:-40,w=62;
    g.fillStyle=T.dirt2;g.fillRect(x,cam.y-20,w,H+40);
    g.fillStyle='rgba(0,0,0,.25)';for(let y=Math.floor(cam.y/50)*50;y<cam.y+H+60;y+=50){g.fillRect(x+4+hash(y+side)*30,y,6,40+hash(y*2)*10)}
    g.fillStyle='rgba(255,255,255,.07)';g.fillRect(side?x:x+w-4,cam.y-20,4,H+40);
    g.fillStyle=T.grass2;for(let y=Math.floor(cam.y/90)*90;y<cam.y+H+60;y+=90){g.beginPath();g.ellipse(side?x+2:x+w-2,y+hash(y)*30,7,16,0,0,6.28);g.fill()}
  }
}
function drawWorld(g){
  const L=S.L,T=THEMES[L.theme],bg=S.bg,t=G.t,cam=S.cam;
  drawBG(g,bg,cam.x,cam.y,Math.max(0,L.h-H));
  g.save();
  const sx=S.shake?rnd(-S.shake,S.shake)*.5:0,sy=S.shake?rnd(-S.shake,S.shake)*.5:0;
  g.translate(-Math.round(cam.x)+sx,-Math.round(cam.y)+sy);
  const vx0=cam.x-80,vx1=cam.x+W+80,vy0=cam.y-80,vy1=cam.y+H+80;
  const vis=(x,y,w,h)=>x+w>vx0&&x<vx1&&y+h>vy0&&y<vy1;
  if(!L.town&&!L.pvp)drawWalls(g,L,T,cam);
  else{ // town decor: signboards & lanterns
    for(let x=140;x<L.w;x+=260){const y=470;g.fillStyle='#5a3a1c';g.fillRect(x,y-110,5,110);circ(g,x+2,y-118,13,'#ff6a4a',O_,2);const gl=g.createRadialGradient(x+2,y-118,2,x+2,y-118,60);gl.addColorStop(0,'rgba(255,170,90,.55)');gl.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=gl;g.fillRect(x-60,y-180,124,124)}
  }
  for(const pl of L.plats)if(vis(pl.x,pl.y-20,pl.w,(pl.t==='s'?Math.min(pl.h,600):60)))drawPlat(g,pl,T,bg,t);
  for(const r of L.ropes)if(vis(r.x-10,r.y1,20,r.y2-r.y1))drawRope(g,r,T,t);
  for(const s of L.spikes)if(vis(s.x,s.y-30,s.w,40))drawSpikes(g,s,T);
  for(const f of S.flagsOn)if(vis(f.x-30,f.y-120,100,130))drawFlag(g,f,t);
  for(const d of S.drops)if(vis(d.x-60,d.y-60,120,120))drawTotem(g,d,t);
  L.plates.forEach((pl,i)=>drawPlate(g,pl,pl.on,0,t,i));
  for(const po of L.portals){if(po.hidden)continue;if(vis(po.x-120,po.y-200,240,220)){if(!po.boat)drawPortal(g,po,t);else txt(g,'▼',po.x,po.y-40+Math.sin(t*4)*4,20,'#ffe04a','center',3);txt(g,po.label,po.x,po.y+22,15,'#ffe9a0','center',3);if(po.lock&&!SAVE.cleared[po.lock])txt(g,'🔒',po.x,po.y-60,28,'#fff','center',3)}}
  const lead=PARTY[0];
  for(const n of L.npcs||[]){
    let al=1;
    if(n.hidden){if(SAVE.lvl<(n.minLv||6))continue;al=clamp(1-(Math.abs(lead.x-n.x)-90)/140,0,1);if(n.seeY&&Math.abs(lead.y-n.gy)>140)al=0;
      if(al<.05){if(Math.random()<.05)parts.push({x:n.x+rnd(-40,40),y:n.gy-rnd(20,100),vx:0,vy:-10,life:1.6,max:1.6,size:2.2,col:'#bfe8ff',grav:0,glow:true});continue}}
    if(!vis(n.x-70,n.gy-160,140,170))continue;
    n.alpha=al;g.save();if(n.look!=='miko')g.globalAlpha=al;drawNPC(g,n,t,null,sgn(lead.x-n.x));g.restore();
    if(al>.5){const mk=npcMark(n.id),top=n.look==='board'?128:n.look==='closet'?126:n.look==='miko'?128:n.look==='fame'?156:60,ny=n.labelY?n.labelY:n.gy-top-8;
      txt(g,n.name,n.x,ny,13,'#fff','center',3);drawMark(g,n.x,ny-22,mk==='ready'?'ready':mk==='new'?'new':mk==='act'?'act':null,t);}
  }
  if(L.harbor)drawHarborDecor(g,L,t,cam);
  if(L.houses)drawTownDecor(g,L,t,cam);
  if(L.steles)for(const st of L.steles)if(vis(st.x-140,st.y-240,280,290))drawStele(g,st,t,S.near&&S.near.st===st);
  if(L.altar)drawAltar(g,L.altar,t,SAVE.inv.gwi>0&&!S.boss);
  for(const d of S.dummies)drawDummy(g,d,t);
  for(const b of S.boxes)if(!b.dead)drawCrate(g,b,t);
  for(const it of S.items){if(it.kind==='hp'||it.kind==='mp')drawPotion(g,it,t);else{
    const y=it.y+Math.sin(t*5+it.x)*2;g.save();g.translate(it.x,y);
    if(it.kind==='coin'){circ(g,0,-8,6.5,'#ffd34a',O_,1.6);g.fillStyle='#b88a10';g.font=F(9);g.textAlign='center';g.fillText('●',0,-5)}
    else if(it.kind==='vegbit'){circ(g,-3,-9,5,'#3fae49',O_,1.4);circ(g,3,-11,4.5,'#5fc85a',O_,1.4);circ(g,0,-6,4.5,'#ff8a1f',O_,1.4)}
    else if(it.kind==='coupon'){g.beginPath();g.roundRect(-9,-18,18,13,3);g.fillStyle='#c0a0ff';g.fill();g.lineWidth=1.8;g.strokeStyle=O_;g.stroke();g.fillStyle='#fff';g.font=F(9);g.textAlign='center';g.fillText('魂',0,-8)}
    else if(ETC_NAME[it.kind]){const col=it.kind==='essence'?'#ff8a3a':it.kind==='gtooth'?'#ffd34a':'#c8a8ff',gl=g.createRadialGradient(0,-10,2,0,-10,18);gl.addColorStop(0,col+'cc');gl.addColorStop(1,col+'00');g.fillStyle=gl;g.fillRect(-20,-30,40,40);poly(g,[0,-20,7,-10,0,0,-7,-10],col,O_,1.6)}
    else if(it.kind==='key'){const gl=g.createRadialGradient(0,-12,2,0,-12,22);gl.addColorStop(0,'rgba(255,230,100,.8)');gl.addColorStop(1,'rgba(255,230,100,0)');g.fillStyle=gl;g.fillRect(-24,-36,48,48);circ(g,-4,-14,5,'#ffd34a',O_,1.6);g.fillStyle='#ffd34a';g.fillRect(-1,-14,12,3.5);g.fillRect(7,-14,3,8)}
    g.restore()}}
  for(const m of S.mobs){if(m.type==='arm'||!vis(m.x-40,m.y-60,80,80))continue;if(m.hue){g.save();g.filter='hue-rotate('+m.hue+'deg)'}if(m.type==='wisp')drawWisp(g,m,t);else{g.save();if(m.type==='baby'){g.translate(m.x,m.y);g.scale(.72,.72);g.translate(-m.x,-m.y)}
    if(m.type==='baby'){g.translate(m.x*(1-1/.72)*0,0)}drawEgg(g,m,t);g.restore()}if(m.hue)g.restore();
    if(m.hp<m.max){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(m.x-16,(m.type==='wisp'?m.y-36:m.y-46),32,5);g.fillStyle='#ff5a5a';g.fillRect(m.x-15,(m.type==='wisp'?m.y-35:m.y-45),30*m.hp/m.max,3)}}
  if(S.boss)drawBoss(g,S.boss,t);
  for(const m of S.mobs)if(m.type==='arm'&&!m.dead)drawArm(g,m,t);
  drawPeers(g,t);
  // party
  const order=PARTY.slice().reverse();
  for(const p of order){
    if(p.dead){g.save();g.globalAlpha=.45;drawVeggie(g,JOB[p.job],{sc:WSC,fid:p.fid,x:p.x,y:p.y-30+Math.sin(t*3)*6,face:p.face,t:p.t,st:'idle',eq:p.eq,tier:p.tier,alpha:.45});g.restore();continue}
    const st=p.stun>0?'hurt':p.skillT>0&&p.atkT<=0?'skill':p.atkT>0?'atk':p.rope?'climb':!p.onGround?'air':Math.abs(p.vx)>30?'run':'idle';
    const blink=p.inv>0&&Math.floor(p.inv*14)%2===0&&p.stun<=0;
    drawVeggie(g,JOB[p.job],{sc:WSC,fid:p.fid,x:p.x,y:p.y,face:p.face,t:p.t,st,ap:p.atkDur?1-p.atkT/p.atkDur:0,combo:p.combo,buff:!!p.buff,eq:p.eq,tier:p.tier,alpha:blink?.45:1});
    if(p.shieldT>0){g.strokeStyle=`rgba(150,230,255,${.5+.3*Math.sin(t*10)})`;g.lineWidth=3;g.beginPath();g.arc(p.x,p.y-18,24,0,6.28);g.stroke();g.fillStyle='rgba(150,230,255,.12)';g.fill()}
    if(L.pvp){txt(g,(p===lead?'1P':p.kind==='p2'?'2P':p.team===lead.team?'아군':'상대'),p.x,p.y-50,12,p.team===lead.team?'#7aff9a':'#ff8a8a','center',3);bar(g,p.x-18,p.y-46,36,5,p.hp/p.maxhp,'#e8484f')}
    else if(p!==lead){txt(g,(p.kind==='p2'?'2P':'AI')+(p.hold?' ■':''),p.x,p.y-50,12,p.kind==='p2'?'#ffb84a':'#9be8ff','center',3);bar(g,p.x-18,p.y-46,36,5,p.hp/p.maxhp,'#e8484f')}
    else txt(g,'1P',p.x,p.y-50,12,'#7aff9a','center',3);
  }
  drawSelfTag(g);
  for(const s of S.pshots)drawPshot(g,s,t);
  for(const e of S.eproj)drawEproj(g,e,t);
  for(const z of S.zones)drawZone(g,z,t);
  for(const f of S.fx){
    const k=f.t/f.max;
    if(f.k==='ring'){g.strokeStyle=f.col;g.globalAlpha=1-k;g.lineWidth=10*(1-k)+2;g.beginPath();g.arc(f.x,f.y,f.r*(.2+.8*Math.sqrt(k)),0,6.28);g.stroke();g.fillStyle=f.col;g.globalAlpha=(1-k)*.18;g.fill();g.globalAlpha=1}
    else if(f.k==='slash')drawSlash(g,f.x,f.y,f.face,k,f.col,f.combo);
  }
  // particles
  for(const q of parts){
    const a=clamp(q.life/q.max,0,1);if(!vis(q.x-10,q.y-10,20,20))continue;
    g.globalAlpha=q.amb?Math.min(a,1-a)*2:a;
    if(q.glow){g.globalCompositeOperation='lighter'}
    g.fillStyle=q.soft?q.col+(a*.5)+')':q.col;
    g.beginPath();g.arc(q.x,q.y,q.size*(q.soft?(2-a):a*.6+.4),0,6.28);g.fill();
    g.globalCompositeOperation='source-over';
  }
  g.globalAlpha=1;
  for(const tx of texts){const a=clamp(tx.life/tx.max*1.6,0,1);g.globalAlpha=a;txt(g,String(tx.txt),tx.x,tx.y,tx.size,tx.col,'center',4)}
  g.globalAlpha=1;
  // interact hint
  if(S.near&&S.near.k!=='stele'&&G.state==='play'&&!G.ui){const n=S.near;const x=n.k==='npc'?n.n.x:n.k==='altar'?L.altar.x:n.po.x,y=(n.k==='npc'?n.n.gy:n.k==='altar'?L.altar.y:n.po.y)+44;txt(g,'↑ '+(n.k==='npc'?'대화':n.k==='altar'?'귀안 바치기 (보유 '+(SAVE.inv.gwi||0)+')':'입장'),x,y,15,'#ffe04a','center',4)}
  g.restore();
  // vignette
  const vg=g.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,0,20,.45)');g.fillStyle=vg;g.fillRect(0,0,W,H);
}
function render(){
  const g=ctx;g.setTransform(SC,0,0,SC,0,0);g.imageSmoothingQuality='high';g.clearRect(0,0,W,H);
  const t=G.t;
  if(G.state==='title'){drawTitle(g,t)}
  else if(G.state==='select'){drawSelect(g,t)}
  else if(S){
    drawWorld(g);drawHUD(g,t);drawBossBar(g);drawSocial(g,t);drawToasts(g);
    if(G.banner&&G.banner.t<3.2&&!G.ui){const a=Math.min(1,G.banner.t*2,(3.2-G.banner.t)*2);g.globalAlpha=clamp(a,0,1);
      panel(g,W/2-270,86,540,70,.78);txt(g,G.banner.name,W/2,122,30,'#ffe9a0','center');txt(g,G.banner.sub,W/2,146,15,'#cfd4e2','center',2);g.globalAlpha=1}
    if(G.ui==='dialog')drawDialog(g,t);else if(G.ui==='shop')drawShop(g,t);else if(G.ui==='wardrobe')drawWardrobe(g,t);else if(G.ui==='inv')drawInv(g,t);else if(G.ui==='stat')drawStat(g,t);else if(G.ui==='fame')drawFame(g,t);else if(G.ui==='scene')drawScene(g,t);else if(G.ui==='qlog')drawQuestLog(g,t);else if(G.ui==='help')drawHelp(g);
    else if(G.ui==='pause'){g.fillStyle='rgba(8,4,16,.6)';g.fillRect(0,0,W,H);txt(g,'일시정지',W/2,200,36,'#ffe9a0','center');['계속하기','저장하고 타이틀로'].forEach((s,i)=>{const y=240+i*50,sel=(G.psel||0)===i;g.fillStyle=sel?'rgba(255,220,120,.3)':'rgba(255,255,255,.08)';g.beginPath();g.roundRect(W/2-140,y,280,40,10);g.fill();txt(g,s,W/2,y+27,19,sel?'#ffe9a0':'#fff','center')})}
    if(S.pvp&&S.pvp.over){g.fillStyle='rgba(8,4,16,.55)';g.fillRect(0,0,W,H);const win=S.pvp.winner===0;txt(g,win?'승리!':'패배…',W/2,230,56,win?'#ffe04a':'#ff8a8a','center');txt(g,S.pvp.score[0]+' : '+S.pvp.score[1]+'   (전적 '+SAVE.duel.w+'승 '+SAVE.duel.l+'패)',W/2,276,22,'#fff','center');if(S.pvp.t>1.2)txt(g,'Enter : 마을로',W/2,320,20,'#cfd4e2','center',2)}
    if(G.state==='over'){g.fillStyle='rgba(20,0,10,.7)';g.fillRect(0,0,W,H);txt(g,'기절했다…',W/2,230,48,'#ff8a8a','center');txt(g,'Enter : 다시 도전      Esc : 마을로',W/2,290,20,'#fff','center')}
    if(G.state==='clear'&&G.clear){g.fillStyle='rgba(8,4,16,.6)';g.fillRect(0,0,W,H);panel(g,W/2-250,120,500,300,.94);txt(g,G.clear.title,W/2,184,36,'#ffe04a','center');G.clear.lines.forEach((l,i)=>txt(g,l,W/2,236+i*34,20,'#fff','center'));txt(g,'Enter : 돌아가기',W/2,392,17,'#cfd4e2','center',2)}
  }
  if(S&&G.state!=='title')drawBigBanner(g,G.t);
  if(G.fade){const a=G.fade.phase==='out'?Math.min(1,G.fade.t/.35):1-Math.min(1,G.fade.t/.4);g.fillStyle=`rgba(0,0,0,${a})`;g.fillRect(0,0,W,H)}
}
let _last=0,_acc=0;
function frame(ts){
  const d=Math.min(.05,(ts-_last)/1000||0);_last=ts;_acc+=d;
  let n=0;while(_acc>=1/60&&n++<4){step(1/60);pressed={};_acc-=1/60}
  if(n>=4)_acc=0;
  render();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
autoLogin();
socialInit();
window.__game={press:c=>{pressed[c]=true},hold:(c,v)=>{keys[c]=v},G,get S(){return S},get PARTY(){return PARTY},get SAVE(){return SAVE},newGame,continueGame,goMap,loadMap,addMember,qAccept,qTurnIn,checkDaily,dailyMenu,need,expMul,pvpHit,gainExp,advanceJob,startPQ,step,render,JOBS,QUESTS};
