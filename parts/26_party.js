/* ============================================================
   PARTY : 직업 간 상호작용 — 파티 버프(겹쳐짐) · 소환수(거너 포탑 / 성직자 수호 정령)
           온라인 파티(파티 코드) : 같은 맵 파티원에게 버프·힐 전달, 경험치 보너스, 처치 경험치 나눔
   ============================================================ */
/* ---------- 스킬 재설계 : 서로 필요한 직업 ---------- */
Object.assign(JOB.warrior.sk[2],{n:'전투 함성',party:1,atk:1.35,spd:1.1,def:0,dur:12,mp:36,cd:26,desc:'파티 공격력 +35%'});
Object.assign(JOB.archer.sk[2],{n:'매의 눈',party:1,atk:1.25,spd:1.15,dur:12,mp:32,cd:24,desc:'파티 공격력 +25% · 공속/이속 +15%'});
Object.assign(JOB.guardian.sk[2],{n:'수호 오라',party:1,atk:1.1,spd:1,def:.4,dur:12,mp:36,cd:26,desc:'파티 받는 피해 -40%'});
Object.assign(JOB.mage.sk[2],{n:'마나 축복',party:1,atk:1.2,spd:1,mpr:5,dur:14,mp:30,cd:26,desc:'파티 MP 회복 +5/초 · 공격력 +20%'});
Object.assign(JOB.rogue.sk[2],{n:'바람걸음',party:1,atk:1.15,spd:1.3,def:.1,dur:12,mp:30,cd:24,desc:'파티 이동속도 +30%'});
Object.assign(JOB.fighter.sk[2],{desc:'자신 공격력 +60% (파티 버프와 겹쳐짐)'});
JOB.gunner.sk[2]={n:'팝콘 포탑',k:'summon',kind:'turret',dur:20,m:.75,int:.45,range:440,mp:30,cd:22,desc:'20초 동안 자동 사격하는 포탑 설치'};
JOB.priest.sk[3]={n:'수호 정령',k:'summon',kind:'spirit',dur:24,m:1.0,int:.9,range:400,heal:.06,mp:36,cd:26,desc:'따라다니며 공격 · 2초마다 파티 회복'};

/* ---------- 겹쳐지는 버프 ---------- */
function addBuff(q,key,b,from){
  q.buffs=q.buffs||{};q.buffs[key]={atk:b.atk||1,spd:b.spd||1,def:b.def||0,mpr:b.mpr||0,t:b.dur||10,n:b.n||'',from:from||''};
  S.fx.push({k:'ring',x:q.x,y:q.y-20,r:60,t:0,max:.45,col:'#ffd34a'});spark(q.x,q.y-30,10,'#ffe9a0',160,.4,3,0,true);
}
function buffStep(dt){
  for(const p of PARTY){if(!p.buffs)continue;let a=1,s=1,d=0,m=0,t=0,n=0;
    for(const k in p.buffs){const b=p.buffs[k];b.t-=dt;if(b.t<=0||p.dead){delete p.buffs[k];continue}a*=b.atk;s*=b.spd;d+=b.def;m+=b.mpr;t=Math.max(t,b.t);n++}
    if(n)p.buff={atk:a,spd:s,def:Math.min(.6,d),mpr:m,t,combo:1};else if(p.buff&&p.buff.combo)p.buff=null}
}
const onlineParty=()=>{if(!EVPT||!S)return[];const o=[];for(const k in PEERS){const q=PEERS[k];if(q.tg.pt===EVPT&&q.tg.map===S.id)o.push(Object.assign({id:k},q))}return o};
SKX.buff=function(p,sk){
  sfx('skill');ftext(p.x,p.y-96,sk.n,'#ffe9a0',15,.9);
  const b={atk:sk.atk,spd:sk.spd,def:sk.def,mpr:sk.mpr,dur:sk.dur,n:sk.n};
  const tg=sk.party?PARTY.filter(q=>!q.dead&&(!S.L.pvp||q.team===p.team)&&Math.hypot(q.x-p.x,q.y-p.y)<700):[p];
  for(const q of tg)addBuff(q,p.job+':'+sk.n,b,p===q?'':JOB[p.job].role);
  if(sk.party&&p===PARTY[0]&&onlineParty().length){wsSend({t:'pb',b,k:p.job+':'+sk.n,x:p.x,y:p.y});ftext(p.x,p.y-116,'🌐 파티 버프!','#9affc0',13,1)}
};
/* ---------- 소환수 ---------- */
let SUMS=[];
SKX.summon=function(p,sk){
  sfx('skill');ftext(p.x,p.y-96,sk.n,'#ffe9a0',15,.9);
  SUMS=SUMS.filter(s=>!(s.owner===p&&s.kind===sk.kind));
  const s={owner:p,kind:sk.kind,sk,x:p.x+p.face*46,y:sk.kind==='turret'?p.y:p.y-70,t:sk.dur,cd:.3,hcd:2,face:p.face,ph:Math.random()*6};
  SUMS.push(s);spark(s.x,s.y-20,24,sk.kind==='turret'?'#ffd34a':'#fff7c0',220,.5,4,0,true);S.fx.push({k:'ring',x:s.x,y:s.y-16,r:70,t:0,max:.4,col:'#fff'});
};
function sumStep(dt){
  if(!SUMS.length)return;
  for(const s of SUMS){const p=s.owner;s.t-=dt;s.cd-=dt;s.hcd-=dt;
    if(s.kind==='spirit'){const tx=p.x-p.face*40,ty=p.y-74+Math.sin(G.t*3+s.ph)*6;s.x+=(tx-s.x)*Math.min(1,dt*4);s.y+=(ty-s.y)*Math.min(1,dt*4);s.face=p.face}
    // 공격
    if(s.cd<=0){let best=null,bd=s.sk.range;eachTarget(t=>{const r=rectOf(t),d=Math.hypot(r.x+r.w/2-s.x,r.y+r.h/2-(s.y-20));if(d<bd&&!t.dead&&t.type!=='peer'){bd=d;best=t}},p);
      if(best){s.cd=s.sk.int;const r=rectOf(best),dx=r.x+r.w/2-s.x,dy=r.y+r.h/2-(s.y-22),L=Math.hypot(dx,dy)||1,sp=760;s.face=dx>0?1:-1;
        S.pshots.push({owner:p,x:s.x+s.face*14,y:s.y-22,vx:dx/L*sp,vy:dy/L*sp,w:16,h:16,dmg:atkOf(p)*s.sk.m,pierce:0,life:.9,kind:s.kind==='turret'?'kernel':'holy',homing:s.kind==='spirit'?1:0,grav:0,hit:new Set(),rot:0,delay:0});
        if(s.kind==='turret'){sfx('throw');if(typeof fxPush==='function')fxPush({k:'muzzle',x:s.x+s.face*16,y:s.y-24,col:'#ffd34a',max:.12,f:s.face})}}else s.cd=.2}
    // 정령의 회복
    if(s.kind==='spirit'&&s.hcd<=0){s.hcd=2;let any=0;for(const q of PARTY)if(!q.dead&&Math.hypot(q.x-s.x,q.y-s.y)<s.sk.range){healPlayer(q,q.maxhp*s.sk.heal);any=1}
      if(any)S.fx.push({k:'ring',x:s.x,y:s.y,r:s.sk.range*.5,t:0,max:.5,col:'#8affb0'});
      if(p===PARTY[0])for(const o of onlineParty())if(Math.hypot(o.x-s.x,o.y-s.y)<s.sk.range)wsSend({t:'heal',to:o.id,v:s.sk.heal})}
  }
  SUMS=SUMS.filter(s=>s.t>0&&!s.owner.dead&&PARTY.includes(s.owner));
}
function drawSummons(g,t){
  for(const s of SUMS){const fade=Math.min(1,s.t*2);g.save();g.globalAlpha=fade;
    if(s.kind==='turret'){const x=s.x,y=s.y;ell(g,x,y-1,18,4,'rgba(0,0,0,.2)');
      g.fillStyle='#c0283c';g.beginPath();g.roundRect(x-14,y-22,28,22,4);g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
      g.fillStyle='#fff';for(let i=0;i<3;i++)g.fillRect(x-12+i*9,y-22,5,22);g.strokeRect(x-14,y-22,28,22);
      g.save();g.translate(x,y-26);g.rotate(s.face>0?0:Math.PI);g.fillStyle='#8a8aa0';g.beginPath();g.roundRect(0,-5,22,10,3);g.fill();g.stroke();g.restore();
      for(let i=0;i<4;i++){const k=(t*2+i/4)%1;circ(g,x-8+i*5,y-34-k*14,3.2,'#fff6c0',O_,1)}
    }else{const x=s.x,y=s.y,gl=g.createRadialGradient(x,y-20,2,x,y-20,34);gl.addColorStop(0,'rgba(255,250,200,.7)');gl.addColorStop(1,'rgba(255,250,200,0)');g.fillStyle=gl;g.fillRect(x-34,y-54,68,68);
      for(const sd of[-1,1]){g.save();g.translate(x+sd*10,y-22);g.rotate(sd*(.4+Math.sin(t*12)*.3));ell(g,sd*8,0,10,5,'rgba(255,255,255,.85)',O_,1.2);g.restore()}
      g.beginPath();g.moveTo(x,y-38);g.quadraticCurveTo(x+14,y-30,x+12,y-16);g.quadraticCurveTo(x,y-6,x-12,y-16);g.quadraticCurveTo(x-14,y-30,x,y-38);g.fillStyle='#fffaf0';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
      for(const sd of[-1,1])circ(g,x+sd*4,y-22,1.6,'#2a1a30');g.strokeStyle=O_;g.lineWidth=1.2;g.beginPath();g.arc(x,y-19,2.4,.3,2.8);g.stroke();
      g.strokeStyle='#ffe04a';g.lineWidth=2;g.beginPath();g.ellipse(x,y-44,9,3,0,0,6.28);g.stroke()}
    bar(g,s.x-14,s.y+4,28,3,s.t/s.sk.dur,'#ffe04a');g.restore()}
}
{const _st=drawSelfTag;drawSelfTag=function(g){drawSummons(g,G.t);_st(g)}}
{const _rs=respawnStep;respawnStep=function(dt){_rs(dt);buffStep(dt);sumStep(dt)}}
{const _lm=loadMap;loadMap=function(id,end){SUMS=[];_lm(id,end)}}

/* ---------- 온라인 파티 : 경험치 보너스 · 처치 경험치 나눔 · 버프/힐 받기 ---------- */
const partyExpBonus=()=>Math.min(.5,onlineParty().length*.15);
const _gainExpP=gainExp;
gainExp=function(n,mob){if(mob&&n>0){const b=partyExpBonus();if(b>0)n=Math.round(n*(1+b))}return _gainExpP(n,mob)};
{const _km=killMob;killMob=function(m){const had=!m.dead&&m.type!=='peer';_km(m);if(had&&m.dead&&m.exp>0&&onlineParty().length)wsSend({t:'kx',e:Math.max(1,Math.round(m.exp*.25)),x:m.x})}}
{const _em=evMsg;evMsg=function(raw){_em(raw);let o;try{o=JSON.parse(raw)}catch(_){return}const p=PARTY[0];if(!p||!S)return;
  if(o.t==='pb'){if(Math.hypot((o.x||0)-p.x,(o.y||0)-p.y)>760)return;addBuff(p,o.k,o.b,o.fname);ftext(p.x,p.y-110,(o.fname||'파티원')+' 의 '+(o.b.n||'버프'),'#ffe9a0',13,1.2)}
  else if(o.t==='kx'){if(Math.hypot((o.x||0)-p.x,0)>1400)return;_gainExpP(o.e|0);ftext(p.x,p.y-80,'파티 경험치 +'+o.e,'#9affc0',12,.8)}
  else if(o.t==='healed'&&!S.L.arenaEv){if(!p.dead){healPlayer(p,p.maxhp*Math.min(.8,+o.v||0));ftext(p.x,p.y-96,(o.fname||'파티원')+' 의 치유','#8affb0',13,1)}}}}
// 성직자의 힐도 온라인 파티원에게 (쟁탈전 밖에서도)
{const _cs=castSkill;castSkill=function(p,i){const before=p.cds[i];const r=_cs(p,i);const sk=JOB[p.job].sk[i];
  if(p===PARTY[0]&&sk&&sk.k==='heal'&&p.cds[i]>0&&before<=0&&!S.L.arenaEv)for(const o of onlineParty())if(Math.hypot(o.x-p.x,o.y-p.y)<560)wsSend({t:'heal',to:o.id,v:sk.m});return r}}

/* ---------- 파티 메뉴 · HUD ---------- */
function setPartyCode(after){const v=(prompt('같은 파티 코드를 입력한 사람끼리 온라인 파티가 돼요\n(같은 맵에서 버프·힐 공유 · 경험치 보너스 · 처치 경험치 나눔)\n비워두면 파티 탈퇴','')||'').trim().slice(0,10);EVPT=v;try{localStorage.setItem('cgdd_team',v)}catch(e){}sysChat(v?'🌐 온라인 파티 「'+v+'」 참가!':'온라인 파티에서 나왔어요');after&&after()}
{const _pm=partyMenu;partyMenu=function(n){_pm(n);if(!G.dlg)return;G.dlg.opts.splice(G.dlg.opts.length-1,0,{t:'🌐 온라인 파티 코드: '+(EVPT||'(없음)')+' — 바꾸기',fn:()=>setPartyCode(()=>partyMenu(n))});
  G.dlg.text='파티를 꾸려보자! 현재 '+PARTY.length+'명.\n\n🌐 온라인 파티: 같은 파티 코드를 쓴 사람끼리 같은 맵에 있으면 버프·힐이 서로에게 들어가고,\n   경험치 +15%/명 (최대 +50%) · 파티원이 잡은 몬스터 경험치 25%를 나눠 받아요.\n🙋 AI 동료·2P 로컬도 함께 할 수 있어요.\n\n직업 궁합: 전사 함성(공격) · 수호자 오라(방어) · 궁수 매의 눈 · 마법사 마나 축복 · 암살자 바람걸음 · 성직자 힐·결계·정령 · 거너 포탑'}}
{const _em=eventMenu;eventMenu=function(){_em();if(G.dlg)for(const o of G.dlg.opts)if(o.t.startsWith('🤝 팀 코드')){o.t='🌐 파티 코드: '+(EVPT||'(없음 · 개인전)')+'  — 바꾸기';o.fn=()=>setPartyCode(eventMenu)}}}
function drawOnlineParty(g,t){
  if(!EVPT||!S||!PARTY[0])return;const op=onlineParty(),y0=H-112-op.length*26;
  panel(g,8,y0-6,190,24+op.length*26,.62);
  txt(g,'🌐 파티 「'+EVPT+'」'+(op.length?'  경험치 +'+Math.round(partyExpBonus()*100)+'%':'  (같은 맵에 없음)'),14,y0+10,12,'#9affc0','left',2);
  op.forEach((o,i)=>{const y=y0+18+i*26;txt(g,o.tg.name+' · '+(JOB[o.tg.j]?JOB[o.tg.j].role:'')+' Lv.'+o.tg.lv,14,y+10,11,'#fff','left',2);bar(g,14,y+14,170,5,(o.tg.h==null?100:o.tg.h)/100,'#5ad87a')});
  // 받은 버프 아이콘
  const p=PARTY[0];if(p.buffs){let i=0;for(const k in p.buffs){const b=p.buffs[k];txt(g,'✦'+(b.n||'')+' '+Math.ceil(b.t)+'s',W-14,H-150-i*16,11,'#ffe9a0','right',2);i++}}
}
{const _dh=drawHUD;drawHUD=function(g,t){_dh(g,t);drawOnlineParty(g,t)}}
// 스킬 설명에 desc 표시
{const _ji=typeof jobInfoDialog==='function'?jobInfoDialog:null;if(_ji)jobInfoDialog=function(n){_ji(n);if(G.dlg)G.dlg.text=G.dlg.text.replace(/\[(\w)\] ([^(\n]+)\(/g,(m,k,nm)=>{const sk=JOB[SAVE.job].sk.find(s=>s.n===nm.trim());return sk&&sk.desc?'['+k+'] '+nm+'— '+sk.desc+' (':m})}}
