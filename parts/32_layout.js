/* ============================================================
   LAYOUT : 포탈과 겹치는 NPC 자동으로 옆으로 비키기 (말 걸기 · 포탈 타기 둘 다 편하게)
   ============================================================ */
function onPlatAt(L,x,gy){return L.plats.some(p=>!p.mv&&Math.abs(p.y-gy)<6&&x>=p.x+16&&x<=p.x+p.w-16)}
function separateNPCs(L){
  if(!L||!L.npcs||!L.portals)return;
  const tooClose=(n,x)=>L.portals.some(po=>Math.abs(x-po.x)<96&&Math.abs(n.gy-po.y)<70)||L.npcs.some(o=>o!==n&&!o.hidden&&Math.abs(x-o.x)<92&&Math.abs(n.gy-o.gy)<40);
  for(const n of L.npcs){
    if(n.hidden||n.fixed||!tooClose(n,n.x))continue;
    let best=null;
    for(let d=40;d<=360&&!best;d+=20)for(const s of[1,-1]){const x=n.x+s*d;if(x<40||x>L.w-40)continue;if(!tooClose(n,x)&&onPlatAt(L,x,n.gy)){best=x;break}}
    if(best!=null){n.x0=n.x;n.x=best}
  }
}
{const _lm=loadMap;loadMap=function(id,end){_lm(id,end);separateNPCs(S.L)}}

/* ---------- 포탈로 이동하면 '돌아가는 포탈' 앞에서 나온다 (오른쪽 포탈로 갔으면 다음 맵의 왼쪽 포탈… 처럼 이어짐) ---------- */
{const _up=usePortal;usePortal=function(po){if(po&&po.to&&po.to!=='__exit')G.portalFrom={from:S.id,to:po.to,t:performance.now()};return _up(po)}}
{const _lm=loadMap;loadMap=function(id,end){
  const pf=G.portalFrom;G.portalFrom=null;_lm(id,end);
  if(!pf||pf.to!==id||performance.now()-pf.t>8000||end)return;
  const L=S.L,back=L.portals.filter(o=>o.to===pf.from);if(!back.length)return;
  const po=back[0],face=po.x>L.w/2?-1:1;
  PARTY.forEach((p,i)=>{p.x=clamp(po.x+face*(18+i*22),20,L.w-20);p.y=po.y;p.vx=0;p.vy=0;p.face=face;p.rope=null});
  S.cp={x:PARTY[0].x,y:po.y};
  const WZ=window.WZ||1,VW=W/WZ,VH=H/WZ;S.cam.x=clamp(PARTY[0].x-VW/2,0,Math.max(0,L.w-VW));S.cam.y=clamp(po.y-VH*.6,0,Math.max(0,L.h-VH)+70/WZ);
}}
