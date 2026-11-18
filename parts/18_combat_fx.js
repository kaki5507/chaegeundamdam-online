/* ============================================================
   COMBAT FX : 키프레임 공격 모션 · 무기 스미어 · 초승달 베기 · 투사체 꼬리
               스킬 종류별 연출 · 타격 베기 자국
   ============================================================ */
const easeOut=k=>1-Math.pow(1-k,3),easeIn=k=>k*k*k,lerp2=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
// 공격 포즈 : 예비동작(뒤로 젖힘) → 강타 → 마무리
function atkPose(c,ap,combo){
  const shoot=c.basic&&c.basic.k==='shoot';
  if(shoot){
    if(c.id==='archer'){ // 활 : 시위를 당겼다가 놓는다
      const pull=ap<.45?easeOut(ap/.45):Math.max(0,1-(ap-.45)*6);
      return {hf:[16+pull*-1,-34],hb:[10-pull*14,-34],wa:0,lean:-.04*pull,lx:-pull*2,bow:pull};
    }
    // 총 · 마법 : 반동
    const kick=ap<.15?ap/.15:Math.max(0,1-(ap-.15)*3);
    return {hf:[18-kick*6,-32-kick*4],hb:[8,-30],wa:-.15-kick*.5,lean:-kick*.08,lx:-kick*3};
  }
  const W1=[-6,-48],W2=[20,-18],REST=[12,-24];
  let hf,wa,lean,lx,smear=null;
  const up=combo===1,stab=combo===2;
  if(ap<.22){const k=easeOut(ap/.22);hf=lerp2(REST,stab?[-4,-30]:up?[6,-14]:W1,k);wa=lerp(-.55,stab?-1.6:up?.9:-2.7,k);lean=-.12*k;lx=-2*k}
  else if(ap<.48){const k=easeIn(Math.min(1,(ap-.22)/.26*1.25));
    if(stab){hf=lerp2([-4,-30],[26,-30],k);wa=lerp(-1.6,-1.57,k)}
    else if(up){hf=lerp2([6,-14],[10,-52],k);wa=lerp(.9,-2.4,k)}
    else{hf=lerp2(W1,W2,k);wa=lerp(-2.7,1.1,k)}
    lean=lerp(-.12,.16,k);lx=lerp(-2,6,k);smear={a0:stab?-1.6:up?.9:-2.7,a1:wa,k};
  }else{const k=easeOut((ap-.48)/.52),from=stab?[26,-30]:up?[10,-52]:W2;hf=lerp2(from,REST,k);wa=lerp(stab?-1.57:up?-2.4:1.1,-.55,k);lean=lerp(.16,0,k);lx=lerp(6,0,k);
    if(k<.35)smear={a0:stab?-1.6:up?.9:-2.7,a1:stab?-1.57:up?-2.4:1.1,k:1-k/.35,fade:1}}
  return {hf,hb:[-12+lx*.5,-26],wa,lean,lx,smear,stab};
}
// 무기 궤적 (스미어) : 어깨 기준 호를 쓸고 지나간 자리를 빛으로
function drawSmear(g,c,pz,sy){
  const s=pz.smear;if(!s)return;const col=JOB[c.id].fx||JOB[c.id].col||'#fff';
  const len=c.id==='rogue'?30:c.id==='fighter'?18:c.id==='guardian'?40:46,sx=8,syy=sy+2;
  const a0=s.a0-Math.PI/2,a1=s.a1-Math.PI/2,alpha=(s.fade?s.k:1)*.6;
  g.save();g.globalCompositeOperation='lighter';
  if(pz.stab){const gr=g.createLinearGradient(sx,0,sx+len+30,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,col);g.globalAlpha=alpha;g.fillStyle=gr;g.beginPath();g.moveTo(sx,syy-34);g.lineTo(sx+len+34,syy-32);g.lineTo(sx,syy-26);g.fill();g.restore();return}
  const lo=Math.min(a0,a1),hi=Math.max(a0,a1),R=len+6;
  const gr=g.createRadialGradient(sx,syy-12,R*.35,sx,syy-12,R);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.6,'rgba(255,255,255,0)');gr.addColorStop(.85,col);gr.addColorStop(1,'rgba(255,255,255,.9)');
  g.globalAlpha=alpha;g.fillStyle=gr;g.beginPath();g.arc(sx,syy-12,R,lo,hi);g.arc(sx,syy-12,R*.6,hi,lo,true);g.closePath();g.fill();
  g.restore();
}
// 초승달 베기 (월드 이펙트) — 두 원호로 만든 테이퍼 크레센트 + 광원 + 반짝이
function drawSlash(g,x,y,face,prog,col,combo){
  const a=1-prog;if(a<=0)return;
  g.save();g.translate(x,y);g.scale(face,1);if(combo===1)g.scale(1,-1);
  const r=40+combo*6+easeOut(prog)*22,sweep=combo===2?.9:2.3,st=-sweep/2-.2,en=st+sweep*Math.min(1,prog*3.2+.25);
  g.globalCompositeOperation='lighter';
  // 바깥 광원
  g.globalAlpha=a*.35;const gl=g.createRadialGradient(0,0,r*.4,0,0,r*1.25);gl.addColorStop(0,'rgba(255,255,255,0)');gl.addColorStop(.75,col);gl.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gl;g.beginPath();g.arc(0,0,r*1.25,st,en);g.arc(0,0,r*.4,en,st,true);g.closePath();g.fill();
  // 크레센트 본체 (안쪽 원 중심을 어긋나게 해서 양끝이 가늘어진다)
  g.globalAlpha=a;g.beginPath();g.arc(0,0,r,st,en);g.arc(-r*.16,0,r*.86,en,st,true);g.closePath();
  const gr=g.createLinearGradient(0,-r,0,r);gr.addColorStop(0,'#ffffff');gr.addColorStop(.5,col);gr.addColorStop(1,'#ffffff');g.fillStyle=gr;g.fill();
  // 날카로운 흰 테두리
  g.strokeStyle='rgba(255,255,255,'+a+')';g.lineWidth=2;g.beginPath();g.arc(0,0,r,st,en);g.stroke();
  for(let i=0;i<5;i++){const an=st+(en-st)*(i+.5)/5+Math.sin(i*7)*.05,rr=r+4+((i*13)%9);circ(g,Math.cos(an)*rr,Math.sin(an)*rr,1.6*a+.6,'#fff')}
  g.restore();
}
// 투사체 : 혜성 꼬리 + 속도선
const _drawPshot=drawPshot;
drawPshot=function(g,s,t){
  if(s.delay>0)return;
  if(s.kind!=='wave'){const sp=Math.hypot(s.vx,s.vy)||1,L=Math.min(70,sp*.07)*(s.big?1.4:1),ux=s.vx/sp,uy=s.vy/sp,col=s.owner?jobCol(s.owner):'#fff';
    g.save();g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(s.x-ux*L,s.y-uy*L,s.x,s.y);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,col);
    g.strokeStyle=gr;g.lineCap='round';g.lineWidth=s.big?11:7;g.globalAlpha=.55;g.beginPath();g.moveTo(s.x-ux*L,s.y-uy*L);g.lineTo(s.x,s.y);g.stroke();
    g.lineWidth=2;g.globalAlpha=.9;g.strokeStyle='rgba(255,255,255,.9)';g.beginPath();g.moveTo(s.x-ux*L*.6,s.y-uy*L*.6);g.lineTo(s.x,s.y);g.stroke();g.restore()}
  else{ // 지진파 : 흙먼지 · 돌 파편
    if(Math.random()<.6)parts.push({x:s.x+rnd(-14,14),y:s.y-2,vx:rnd(-40,40),vy:rnd(-220,-80),life:.5,max:.5,size:rnd(2,4),col:Math.random()<.5?'#c8a888':'#f0e0c8',grav:900,glow:false})}
  _drawPshot(g,s,t);
};

/* ---------- 스킬 종류별 연출 ---------- */
const _castSkill2=castSkill;
castSkill=function(p,i){
  const cd=p.cds[i];_castSkill2(p,i);if(!(p.cds[i]>cd))return;
  const sk=JOB[p.job].sk[i],col=sk.col||jobCol(p),cx=p.x,cy=p.y-20;
  switch(sk.k){
    case'burst':
      fxPush({k:'rays',x:cx,y:cy,col,max:.55,r:sk.r*1.1});fxPush({k:'shock',x:cx,y:cy,col,max:.45,r:sk.r});fxPush({k:'crack',x:cx,y:p.y,col,max:1.1,r:sk.r*.8,seed:Math.random()*99});
      for(let k=0;k<14;k++)parts.push({x:cx+rnd(-20,20),y:p.y-4,vx:rnd(-260,260),vy:rnd(-420,-160),life:.8,max:.8,size:rnd(2.5,5),col:k%3?'#d8c0a8':'#fff',grav:1100,glow:false});break;
    case'quake':fxPush({k:'shock',x:cx,y:p.y,col,max:.5,r:140,flat:1});fxPush({k:'crack',x:cx,y:p.y,col,max:1.2,r:160,seed:Math.random()*99});break;
    case'rain':{const rx=cx+p.face*(sk.off||0);fxPush({k:'zone',x:rx,y:p.y,col,max:1.1,r:sk.rw||120});break}
    case'dash':fxPush({k:'wind',x:cx,y:cy,col,max:.4,f:p.face});break;
    case'heal':fxPush({k:'leaves',x:cx,y:p.y,col:'#8affb0',max:1.2});for(const q of PARTY)if(!q.dead)fxPush({k:'cross',x:q.x,y:q.y-30,col:'#8affb0',max:.9});break;
    case'buff':fxPush({k:'arrows',x:cx,y:p.y,col:'#ffd34a',max:1});break;
    case'shield':fxPush({k:'hex',x:cx,y:cy,col:'#9fe0ff',max:.8,r:44});break;
    case'fan':fxPush({k:'muzzle',x:cx+p.face*20,y:p.y-22,col,max:.2,f:p.face});break;
  }
};
// 타격 베기 자국 (근접)
const _dealDamage2=dealDamage;
dealDamage=function(p,t,dmg,dir){_dealDamage2(p,t,dmg,dir);
  if(p&&JOB[p.job].basic.k!=='shoot'&&p.atkT>0){try{const r=rectOf(t);fxPush({k:'cut',x:r.x+r.w/2,y:r.y+r.h*.45,col:jobCol(p),max:.22,rot:(p.combo===1?-.7:.7)*(p.face||1)})}catch(e){}}};
const _drawFX2=drawFX2;
drawFX2=function(g,t){
  _drawFX2(g,t);
  for(const f of FX2){const k=Math.max(0,f.t-(f.delay||0))/f.max;if(f.t<(f.delay||0)||k>1)continue;const a=1-k;
    g.save();
    if(f.k==='rays'){g.translate(f.x,f.y);g.globalCompositeOperation='lighter';g.globalAlpha=a*.7;g.rotate(k*.6);
      for(let i=0;i<12;i++){g.rotate(Math.PI/6);const gr=g.createLinearGradient(0,0,f.r,0);gr.addColorStop(0,'#fff');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,-3);g.lineTo(f.r*(.6+.4*easeOut(k)),0);g.lineTo(0,3);g.fill()}}
    else if(f.k==='shock'){g.translate(f.x,f.y);if(f.flat)g.scale(1,.3);g.globalAlpha=a;const R=f.r*easeOut(k);
      g.strokeStyle='#fff';g.lineWidth=6*a+1;g.beginPath();g.arc(0,0,R,0,6.28);g.stroke();g.strokeStyle=f.col;g.lineWidth=14*a;g.globalAlpha=a*.4;g.beginPath();g.arc(0,0,R*.92,0,6.28);g.stroke()}
    else if(f.k==='crack'){g.translate(f.x,f.y);g.globalAlpha=Math.min(1,a*1.6);g.strokeStyle='rgba(60,30,60,.75)';g.lineWidth=2.4;
      for(let i=0;i<7;i++){const s=Math.sin(f.seed+i*3.1),an=(i/7-.5)*Math.PI*.95,L=f.r*(.5+.5*Math.abs(s))*Math.min(1,k*4);g.beginPath();g.moveTo(0,0);
        g.lineTo(Math.cos(an)*L*.5+s*6,Math.sin(an)*L*.08);g.lineTo(Math.cos(an)*L,Math.sin(an)*L*.15);g.stroke()}
      g.globalCompositeOperation='lighter';g.strokeStyle=f.col;g.globalAlpha=a*.5;g.lineWidth=1;g.stroke()}
    else if(f.k==='zone'){g.translate(f.x,f.y);g.scale(1,.25);g.globalAlpha=a*.8;g.strokeStyle=f.col;g.lineWidth=4;g.setLineDash([12,8]);g.lineDashOffset=-t*40;g.beginPath();g.arc(0,0,f.r,0,6.28);g.stroke();g.setLineDash([]);
      g.globalAlpha=a*.2;g.fillStyle=f.col;g.fill()}
    else if(f.k==='wind'){g.globalCompositeOperation='lighter';g.globalAlpha=a;g.strokeStyle='#fff';g.lineWidth=2;
      for(let i=0;i<7;i++){const yy=f.y-24+i*8,len=60+((i*37)%40);const x0=f.x-f.f*(20+k*120);g.beginPath();g.moveTo(x0,yy);g.lineTo(x0-f.f*len,yy);g.stroke()}}
    else if(f.k==='leaves'){g.globalAlpha=a;for(let i=0;i<10;i++){const an=i*.63+t*2,rr=30+i*4,yy=f.y-k*90-i*6;g.save();g.translate(f.x+Math.cos(an)*rr,yy);g.rotate(an);ell(g,0,0,5,2.6,'#8affb0','#3a9a5a',1);g.restore()}
      g.globalCompositeOperation='lighter';g.globalAlpha=a*.4;const gr=g.createLinearGradient(0,f.y-140,0,f.y);gr.addColorStop(0,'rgba(140,255,180,0)');gr.addColorStop(1,'rgba(140,255,180,.8)');g.fillStyle=gr;g.fillRect(f.x-50,f.y-140,100,140)}
    else if(f.k==='cross'){g.translate(f.x,f.y-k*40);g.globalAlpha=a;g.fillStyle='#fff';g.fillRect(-3,-9,6,18);g.fillRect(-9,-3,18,6);g.globalCompositeOperation='lighter';g.fillStyle=f.col;g.fillRect(-2,-8,4,16);g.fillRect(-8,-2,16,4)}
    else if(f.k==='arrows'){g.globalAlpha=a;for(let i=0;i<6;i++){const x=f.x-30+i*12,y=f.y-10-((k*120+i*20)%90);poly(g,[x,y-8,x+5,y,x+2,y,x+2,y+8,x-2,y+8,x-2,y,x-5,y],'#ffe680',O_,1)}
      g.globalCompositeOperation='lighter';g.globalAlpha=a*.5;const gr=g.createRadialGradient(f.x,f.y-24,4,f.x,f.y-24,60);gr.addColorStop(0,'rgba(255,220,100,.8)');gr.addColorStop(1,'rgba(255,220,100,0)');g.fillStyle=gr;g.fillRect(f.x-60,f.y-84,120,120)}
    else if(f.k==='hex'){g.translate(f.x,f.y);g.globalAlpha=a;g.strokeStyle=f.col;g.lineWidth=2;const R=f.r*(.8+.2*easeOut(k));
      for(let i=0;i<6;i++){const a0=i/6*6.28+t,hx=Math.cos(a0)*R*.6,hy=Math.sin(a0)*R*.6;g.beginPath();for(let j=0;j<6;j++){const b=j/6*6.28;g.lineTo(hx+Math.cos(b)*10,hy+Math.sin(b)*10)}g.closePath();g.stroke()}
      g.globalAlpha=a*.25;g.fillStyle=f.col;g.beginPath();g.arc(0,0,R,0,6.28);g.fill()}
    else if(f.k==='cut'){g.translate(f.x,f.y);g.rotate(f.rot);g.globalCompositeOperation='lighter';g.globalAlpha=a;const L=30*easeOut(Math.min(1,k*3));
      const gr=g.createLinearGradient(-L,0,L,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'#fff');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(-L,0);g.lineTo(0,-3*a);g.lineTo(L,0);g.lineTo(0,3*a);g.fill();
      g.strokeStyle=f.col;g.lineWidth=1;g.globalAlpha=a*.7;g.beginPath();g.moveTo(-L*.8,2);g.lineTo(L*.8,2);g.stroke()}
    g.restore();
  }
};
