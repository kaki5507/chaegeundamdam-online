// 맵 도달 가능성 분석 (브라우저에서 window.__reach(H1,H2) 로 실행)
window.__reach=function(opts){
  opts=opts||{};const HJ=opts.hj||98,HS=opts.hs||240,GX=150,GXS=210;
  const out={};
  for(const id of Object.keys(MAPS)){
    let L;try{L=MAPS[id]()}catch(e){out[id]={err:String(e)};continue}
    const P=[];
    for(const p of L.plats){
      if(p.mv){const m=p.mv;for(const k of[-1,0,1])P.push({x:m.x0+m.ax*k,y:m.y0+m.ay*k,w:p.w,src:p})}
      else P.push({x:p.x,y:p.y,w:p.w,src:p});
    }
    const gapX=(a,b)=>Math.max(0,Math.max(a.x,b.x)-Math.min(a.x+a.w,b.x+b.w));
    const can=(a,b,H,G)=>{const dy=a.y-b.y,gx=gapX(a,b);
      if(dy>0)return dy<=H&&gx<=G;               // 위로 점프
      return gx<=Math.min(320,G+(-dy)*.7)};          // 같은 높이·아래로 걸어/떨어져
    const ropeOK=(a,r,H)=>r.x>=a.x-24&&r.x<=a.x+a.w+24&&r.y2>=a.y-H&&r.y1<=a.y+4;
    const fromRope=(r,b,H,G)=>{const inX=r.x>=b.x-24&&r.x<=b.x+b.w+24;if(inX&&b.y>=r.y1-H&&b.y<=r.y2+40)return true;
      const gx=Math.max(0,Math.max(b.x-r.x,r.x-(b.x+b.w)));return gx<=G&&b.y>=r.y1-H*.9};
    const run=(H,G)=>{
      const sp=L.spawn,start=P.filter(p=>sp.x>=p.x-4&&sp.x<=p.x+p.w+4&&p.y>=sp.y-6).sort((a,b)=>a.y-b.y)[0];
      const seen=new Set(),q=[];if(start){seen.add(start);q.push(start)}
      const rseen=new Set();
      while(q.length){const a=q.shift();
        for(const b of P)if(!seen.has(b)&&can(a,b,H,G)){seen.add(b);q.push(b)}
        for(const r of L.ropes)if(!rseen.has(r)&&ropeOK(a,r,H)){rseen.add(r);for(const b of P)if(!seen.has(b)&&fromRope(r,b,H,G)){seen.add(b);q.push(b)}}
      }
      const srcSeen=new Set([...seen].map(p=>p.src));
      const onP=(x,y)=>[...seen].some(p=>x>=p.x-10&&x<=p.x+p.w+10&&Math.abs(p.y-y)<12);
      return{plats:L.plats.filter(p=>!srcSeen.has(p)&&!p.deco).map(p=>[Math.round(p.x),Math.round(p.y),p.w,p.t]),
        npcs:L.npcs.filter(n=>!onP(n.x,n.gy)).map(n=>n.id+'@'+n.x+','+n.gy),
        portals:L.portals.filter(o=>!onP(o.x,o.y)).map(o=>o.to+'@'+o.x+','+o.y),
        steles:(L.steles||[]).filter(o=>!onP(o.x,o.y||o.gy)).length};
    };
    const a=run(HJ,GX),b=run(HS,GXS);
    out[id]={n:P.length,t1:a,t2:b};
  }
  return out;
};
