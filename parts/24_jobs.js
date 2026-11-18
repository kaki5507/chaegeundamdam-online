/* ============================================================
   JOBS : 1차 전직 공격 스킬 — 직업 컨셉별 움직이는 스킬
   lunge(돌진·순간이동) · backshot(뒤로 뛰며 연사) · recoil(반동 대포)
   ============================================================ */
// 잠깐 뒤에 실행되는 일 (연타 등)
let TQ=[];
function tqStep(dt){if(!TQ.length)return;for(const q of TQ)q.t-=dt;const due=TQ.filter(q=>q.t<=0);TQ=TQ.filter(q=>q.t>0);for(const q of due)try{q.fn()}catch(e){}}
{const _rs=respawnStep;respawnStep=function(dt){_rs(dt);tqStep(dt)}}
{const _lm=loadMap;loadMap=function(id,end){TQ=[];_lm(id,end)}}
function areaHit(p,cx,cy,r,m,col){
  S.fx.push({k:'ring',x:cx,y:cy,r,t:0,max:.35,col:col||'#fff'});spark(cx,cy,14,col||'#fff',r*1.4,.4,3,60,true);
  eachTarget(t=>{const q=rectOf(t);if(Math.hypot(q.x+q.w/2-cx,q.y+q.h/2-cy)<r+q.w/2)dealDamage(p,t,atkOf(p)*m,sgn(q.x-cx)||p.face)},p);
}
const SKX={
  lunge(p,sk){
    sfx('skill');ftext(p.x,p.y-96,sk.n,'#ffe9a0',15,.9);
    if(sk.start)areaHit(p,p.x,p.y-20,sk.start.r,sk.start.m,sk.col);
    if(sk.blink){for(let i=0;i<14;i++)parts.push({x:p.x+rnd(-12,12),y:p.y-rnd(4,44),vx:rnd(-40,40),vy:rnd(-60,-10),life:.45,max:.45,size:rnd(3,7),col:sk.col,grav:0,glow:true})}
    if(sk.guard)p.shieldT=Math.max(p.shieldT||0,sk.guard);
    p.dashT=sk.t||.22;p.dashV=sk.v||760;p.dashDir=p.face;p.dashHit=new Set();p.dashM=sk.m;p.dashNoHit=0;p.trailT=.3;
    if(typeof fxPush==='function')fxPush({k:'swing',x:p.x+p.face*30,y:p.y-22,col:sk.col,max:.25,f:p.face,r:60});
    p.dashEnd=()=>{if(!sk.fin)return;const cx=p.x+p.face*36,cy=p.y-20,n=sk.fin.hits||1;S.shake=Math.max(S.shake,8);
      for(let k=0;k<n;k++)TQ.push({t:k*.09,fn:()=>{if(!p.dead){areaHit(p,p.x+p.face*36,p.y-20,sk.fin.r,sk.fin.m,sk.col);sfx(k===n-1?'boom':'hit')}}});
      if(sk.blink)for(let i=0;i<12;i++)parts.push({x:p.x+rnd(-14,14),y:p.y-rnd(4,44),vx:rnd(-80,80),vy:rnd(-80,0),life:.4,max:.4,size:rnd(3,6),col:sk.col,grav:0,glow:true})};
  },
  backshot(p,sk){
    sfx('throw');ftext(p.x,p.y-96,sk.n,'#ffe9a0',15,.9);
    const j=JOB[p.job],n=sk.cnt||3,dmg=atkOf(p)*sk.m;
    for(let k=0;k<n;k++){const a=(n>1?(k/(n-1)-.5)*sk.sp:0),ang=(p.face>0?0:Math.PI)+a*(p.face>0?1:-1);
      S.pshots.push({owner:p,x:p.x+p.face*18,y:p.y-22,vx:Math.cos(ang)*sk.spd,vy:Math.sin(ang)*sk.spd,w:18,h:18,dmg,pierce:sk.pierce||0,life:1,kind:sk.ammo||j.proj,grav:0,hit:new Set(),rot:0,delay:k*.06,big:false})}
    // 뒤로 껑충 (얼굴은 앞을 본 채)
    p.dashT=.16;p.dashV=640;p.dashDir=-p.face;p.dashNoHit=1;p.dashHit=new Set();p.dashM=0;p.vy=-180;dust(p.x,p.y,6);
  },
  recoil(p,sk){
    sfx('boom');S.shake=Math.max(S.shake,9);ftext(p.x,p.y-96,sk.n,'#ffe9a0',15,.9);
    S.pshots.push({owner:p,x:p.x+p.face*22,y:p.y-24,vx:p.face*sk.spd,vy:0,w:30,h:30,dmg:atkOf(p)*sk.m,pierce:sk.pierce||0,life:1,kind:sk.ammo||'popcorn',grav:0,hit:new Set(),rot:0,delay:0,big:true});
    if(typeof fxPush==='function')fxPush({k:'muzzle',x:p.x+p.face*26,y:p.y-24,col:'#ffd34a',max:.2,f:p.face});
    spark(p.x+p.face*26,p.y-24,16,'#ffe9a0',300,.35,4,0,true);
    p.dashT=.14;p.dashV=520;p.dashDir=-p.face;p.dashNoHit=1;p.dashHit=new Set();p.dashM=0;dust(p.x,p.y,8);
  },
};
const _castSkillJ=castSkill;
castSkill=function(p,i){
  const sk=JOB[p.job].sk[i];
  if(!sk||!SKX[sk.k])return _castSkillJ(p,i);
  if(p.cds[i]>0||p.stun>0||p.dashT>0)return;
  if(p.mp<sk.mp){if(p.mpWarn<=0){p.mpWarn=.8;ftext(p.x,p.y-76,'MP 부족','#6ab0ff',14)}return}
  p.mp-=sk.mp;p.cds[i]=sk.cd*(p.tier>=3?.88:1);p.skillT=.38;
  if(p.kind==='p1'||p.kind==='p2'){qev('flag','skill');qev('count',{key:'skill'})}
  SKX[sk.k](p,sk);
};
