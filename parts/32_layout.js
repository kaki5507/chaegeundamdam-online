/* ============================================================
   LAYOUT : 포탈과 겹치는 NPC 자동으로 옆으로 비키기 (말 걸기 · 포탈 타기 둘 다 편하게)
   ============================================================ */
function onPlatAt(L,x,gy){return L.plats.some(p=>!p.mv&&Math.abs(p.y-gy)<6&&x>=p.x+16&&x<=p.x+p.w-16)}
function separateNPCs(L){
  if(!L||!L.npcs||!L.portals)return;
  const tooClose=(n,x)=>L.portals.some(po=>Math.abs(x-po.x)<96&&Math.abs(n.gy-po.y)<70)||L.npcs.some(o=>o!==n&&!o.hidden&&Math.abs(x-o.x)<64&&Math.abs(n.gy-o.gy)<40);
  for(const n of L.npcs){
    if(n.hidden||n.fixed||!tooClose(n,n.x))continue;
    let best=null;
    for(let d=40;d<=360&&!best;d+=20)for(const s of[1,-1]){const x=n.x+s*d;if(x<40||x>L.w-40)continue;if(!tooClose(n,x)&&onPlatAt(L,x,n.gy)){best=x;break}}
    if(best!=null){n.x0=n.x;n.x=best}
  }
}
{const _lm=loadMap;loadMap=function(id,end){_lm(id,end);separateNPCs(S.L)}}
