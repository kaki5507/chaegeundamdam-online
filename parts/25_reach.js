/* ============================================================
   REACH : 모든 맵 자동 점검 — 1차(일반 점프)로 못 가는 발판엔 밧줄을 내려준다
   (보물상자가 놓인 '비밀 발판'만 예외 : 2차 슈퍼점프 전용)
   ============================================================ */
function reachInfo(L,H,G){
  const P=[];
  for(const p of L.plats){if(p.mv){const m=p.mv;for(const k of[-1,0,1])P.push({x:m.x0+m.ax*k,y:m.y0+m.ay*k,w:p.w,src:p})}else P.push({x:p.x,y:p.y,w:p.w,src:p})}
  const gapX=(a,b)=>Math.max(0,Math.max(a.x,b.x)-Math.min(a.x+a.w,b.x+b.w));
  const can=(a,b)=>{const dy=a.y-b.y,gx=gapX(a,b);return dy>0?dy<=H&&gx<=G:gx<=Math.min(320,G+(-dy)*.7)};
  const ropeOK=(a,r)=>r.x>=a.x-24&&r.x<=a.x+a.w+24&&r.y2>=a.y-H&&r.y1<=a.y+4;
  const fromRope=(r,b)=>{if(r.x>=b.x-24&&r.x<=b.x+b.w+24&&b.y>=r.y1-H&&b.y<=r.y2+40)return true;const gx=Math.max(0,b.x-r.x,r.x-(b.x+b.w));return gx<=G&&b.y>=r.y1-H*.9};
  const sp=L.spawn,start=P.filter(p=>sp.x>=p.x-4&&sp.x<=p.x+p.w+4&&p.y>=sp.y-6).sort((a,b)=>a.y-b.y)[0];
  const seen=new Set(),q=[],rs=new Set();if(start){seen.add(start);q.push(start)}
  while(q.length){const a=q.shift();
    for(const b of P)if(!seen.has(b)&&can(a,b)){seen.add(b);q.push(b)}
    for(const r of L.ropes)if(!rs.has(r)&&ropeOK(a,r)){rs.add(r);for(const b of P)if(!seen.has(b)&&fromRope(r,b)){seen.add(b);q.push(b)}}}
  return{P,seen,srcSeen:new Set([...seen].map(p=>p.src))};
}
function isSecretPlat(L,p){return(L.npcs||[]).some(n=>n.id==='chest'&&n.x>=p.x-10&&n.x<=p.x+p.w+10&&Math.abs(n.gy-p.y)<6)}
function fixReach(L){
  if(!L||!L.plats||L.pvpNoFix)return L;
  for(let it=0;it<12;it++){
    const{seen,srcSeen}=reachInfo(L,96,140);
    const bad=L.plats.filter(p=>!p.mv&&!srcSeen.has(p)&&!isSecretPlat(L,p)&&p.y<L.h-20).sort((a,b)=>b.y-a.y);
    if(!bad.length)break;
    const p=bad[0];
    // 밧줄을 내릴 자리 : 발판 중 이미 갈 수 있는 바닥과 겹치는 x
    const below=[...seen].filter(s=>s.y>p.y+20).sort((a,b)=>a.y-b.y);
    let best=null;for(const s of below){const lo=Math.max(s.x+20,p.x+24),hi=Math.min(s.x+s.w-20,p.x+p.w-24);if(lo<=hi){best={x:Math.round((lo+hi)/2),y2:s.y};break}}
    if(!best)best={x:Math.round(p.x+p.w/2),y2:L.spawn.y};
    L.ropes.push({x:best.x,y1:p.y,y2:best.y2,auto:1});
  }
  return L;
}
for(const k of Object.keys(MAPS)){const f=MAPS[k];MAPS[k]=function(){return fixReach(f.apply(this,arguments))}}
