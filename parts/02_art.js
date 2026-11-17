/* ============================================================
   ART : backgrounds, platforms, characters (all procedural)
   ============================================================ */
const O_='#1c1018';
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function circ(g,x,y,r,fill,stroke,lw){g.beginPath();g.arc(x,y,r,0,6.2832);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||2;g.strokeStyle=stroke;g.stroke()}}
function ell(g,x,y,rx,ry,fill,stroke,lw,rot=0){g.beginPath();g.ellipse(x,y,rx,ry,rot,0,6.2832);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||2;g.strokeStyle=stroke;g.stroke()}}
function limb(g,x1,y1,x2,y2,w,col){g.lineCap='round';g.lineJoin='round';g.strokeStyle=O_;g.lineWidth=w+4;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke()}
function limb2(g,x1,y1,xm,ym,x2,y2,w,col){g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(xm,ym);g.lineTo(x2,y2);g.strokeStyle=O_;g.lineWidth=w+4;g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke()}
function poly(g,pts,fill,stroke,lw){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||2;g.lineJoin='round';g.strokeStyle=stroke;g.stroke()}}

/* ---------------- themes / backgrounds ---------------- */
const THEMES={
  forest:{sky:['#150a33','#3c1d62','#b04a6c','#ffa65c'],moon:{x:.74,y:.2,r:54,c:'#fff1cf',glow:'rgba(255,230,180,'},
    layers:[{k:'ridge',col:'#3a2266',amp:70,base:.62,f:.08,cyc:[2,5,9]},{k:'ridge',col:'#2a1850',amp:60,base:.72,f:.16,cyc:[3,7,11]},
            {k:'pines',col:'#170d38',base:.84,f:.3,hh:[90,170],n:26},{k:'pines',col:'#0c0620',base:.97,f:.55,hh:[130,240],n:15}],
    grass:'#5cbc52',grass2:'#2f7d3b',dirt:'#5d3b2a',dirt2:'#3f271d',stone:'#7a6a78',plank:'#9a6a3c',plank2:'#5f3d20',fly:'#d7ff8a',lantern:true},
  sky:{sky:['#12072a','#4a1646','#c23f45','#ffb454'],moon:{x:.2,y:.28,r:72,c:'#ffe0c0',glow:'rgba(255,170,120,'},
    layers:[{k:'clouds',col:'#6a2a5a',base:.55,f:.05},{k:'islands',col:'#4a1e4e',base:.66,f:.1},{k:'clouds',col:'#913a63',base:.84,f:.24},{k:'clouds',col:'#d0576a',base:1.02,f:.42}],
    grass:'#9be8ae',grass2:'#4aa07a',dirt:'#6f6a8e',dirt2:'#45426a',stone:'#8a88b0',plank:'#aeb0dc',plank2:'#6a68a0',fly:'#ffd7a0'},
  night:{sky:['#03030f','#0e1245','#2a2878','#6b4aa0'],moon:{x:.5,y:.27,r:92,c:'#ff7a72',glow:'rgba(255,60,70,'},
    layers:[{k:'ridge',col:'#1d1b52',amp:80,base:.64,f:.06,cyc:[2,4,7]},{k:'pines',col:'#100d33',base:.86,f:.28,hh:[80,150],n:24},{k:'gates',col:'#3a0a18',base:.98,f:.5}],
    grass:'#7e68c4',grass2:'#40337a',dirt:'#2a2250',dirt2:'#1a1538',stone:'#5a5090',plank:'#7a5aa0',plank2:'#3a2a5a',fly:'#9fd0ff'},
  lava:{sky:['#0a0204','#2a0608','#6a120c','#d0401a'],moon:{x:.62,y:.86,r:120,c:'#ff8a3a',glow:'rgba(255,90,20,'},
    layers:[{k:'ridge',col:'#2a0a0e',amp:120,base:.5,f:.06,cyc:[2,3,8]},{k:'ridge',col:'#1a0608',amp:90,base:.7,f:.16,cyc:[3,5,13]},{k:'gates',col:'#3a0806',base:.96,f:.45}],
    grass:'#ff7a2a',grass2:'#a8320e',dirt:'#3a1c18',dirt2:'#241010',stone:'#5a3a38',plank:'#7a4a30',plank2:'#3a2014',fly:'#ffb060'},
};
const LW=1200,LHT=330;
const BGCACHE={};
function getBG(name){if(!BGCACHE[name])BGCACHE[name]=buildBG(name);return BGCACHE[name]}
function buildBG(name){
  const T=THEMES[name],r=mulberry(name.length*97+3);
  const sky=mk(W,H),g=sky.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,H);T.sky.forEach((c,i)=>gr.addColorStop(i/(T.sky.length-1),c));
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<140;i++){g.globalAlpha=.25+r()*.75;g.fillStyle='#fff';const s=r()<.12?2:1;g.fillRect(r()*W,r()*H*.62,s,s)}
  g.globalAlpha=1;
  const m=T.moon,mx=m.x*W,my=m.y*H;
  const rg=g.createRadialGradient(mx,my,m.r*.5,mx,my,m.r*3.2);rg.addColorStop(0,m.glow+'.5)');rg.addColorStop(1,m.glow+'0)');
  g.fillStyle=rg;g.fillRect(0,0,W,H);
  g.fillStyle=m.c;g.beginPath();g.arc(mx,my,m.r,0,6.2832);g.fill();
  g.fillStyle='rgba(60,20,40,.10)';
  for(let i=0;i<7;i++){g.beginPath();g.arc(mx+(r()-.5)*m.r*1.2,my+(r()-.5)*m.r*1.2,m.r*(.07+r()*.13),0,6.2832);g.fill()}
  const layers=T.layers.map(Ly=>{
    const c=mk(LW,LHT),q=c.getContext('2d');q.fillStyle=Ly.col;
    if(Ly.k==='ridge'){
      q.beginPath();q.moveTo(0,LHT);
      for(let x=0;x<=LW;x+=8){let y=0;Ly.cyc.forEach((k,i)=>{y+=Math.sin(x/LW*6.2832*k+i*1.7)*Ly.amp/(i+1.3)});q.lineTo(x,LHT-130+y*.9)}
      q.lineTo(LW,LHT);q.fill();
    }else if(Ly.k==='pines'){
      for(let i=0;i<Ly.n;i++){
        const x=(i+.2+r()*.6)*LW/Ly.n,h=lerp(Ly.hh[0],Ly.hh[1],r());
        for(let j=0;j<5;j++){const ty=LHT-h+j*h*.19,hw=(j+1.2)*h*.062;poly(q,[x,ty,x+hw,ty+h*.26,x-hw,ty+h*.26],Ly.col)}
        q.fillRect(x-3,LHT-h*.2,6,h*.2);
      }
      q.fillRect(0,LHT-30,LW,30);
    }else if(Ly.k==='clouds'){
      for(let k=0;k<16;k++){
        const cx=r()*LW,cy=LHT-70-r()*110,rx=70+r()*130,ry=16+r()*30;
        for(const o of[-LW,0,LW]){q.beginPath();q.ellipse(cx+o,cy,rx,ry,0,0,6.2832);q.fill()}
      }
      q.fillRect(0,LHT-60,LW,60);
    }else if(Ly.k==='islands'){
      for(let k=0;k<5;k++){
        const cx=(k+.3+r()*.4)*LW/5,cy=LHT-150-r()*90,rx=70+r()*70,dp=60+r()*70;
        q.beginPath();q.ellipse(cx,cy,rx,14,0,0,6.2832);q.fill();
        poly(q,[cx-rx,cy,cx+rx,cy,cx+rx*.3,cy+dp,cx-rx*.2,cy+dp*.8],Ly.col);
        // little pagoda
        q.fillRect(cx-9,cy-26,18,26);poly(q,[cx-20,cy-26,cx+20,cy-26,cx,cy-46],Ly.col);poly(q,[cx-13,cy-44,cx+13,cy-44,cx,cy-62],Ly.col);
      }
    }else if(Ly.k==='gates'){
      for(let k=0;k<4;k++){
        const cx=(k+.5)*LW/4+(r()-.5)*60,hh=150+r()*50;
        q.fillRect(cx-70,LHT-hh,14,hh);q.fillRect(cx+56,LHT-hh,14,hh);
        q.fillRect(cx-82,LHT-hh+8,164,10);q.fillRect(cx-76,LHT-hh+26,152,6);
        for(let s=-62;s<=62;s+=9){poly(q,[cx+s-2,LHT-hh+8,cx+s+2,LHT-hh+8,cx+s,LHT-hh-20],Ly.col)}
      }
      q.fillRect(0,LHT-24,LW,24);
    }
    return Object.assign({cv:c},Ly);
  });
  const dirt=mk(96,96),d=dirt.getContext('2d');
  d.fillStyle=T.dirt;d.fillRect(0,0,96,96);
  for(let i=0;i<110;i++){d.fillStyle=r()<.5?T.dirt2:'rgba(255,255,255,.05)';d.fillRect(r()*96,r()*96,2+r()*5,2+r()*3)}
  for(let i=0;i<6;i++){const x=r()*96,y=r()*96;for(const[ox,oy]of[[0,0],[-96,0],[96,0],[0,-96],[0,96]]){ell(d,x+ox,y+oy,6+r()*6,4+r()*4,T.stone,T.dirt2,1.5)}}
  return {sky,layers,dirt:ctx.createPattern(dirt,'repeat')};
}
function drawBG(g,bg,camx,camy,maxCamY){
  g.drawImage(bg.sky,0,0);
  for(const Ly of bg.layers){
    const sh=(maxCamY-camy)*Ly.f*.5,baseY=Ly.base*H+sh;
    let off=-((camx*Ly.f)%LW);if(off>0)off-=LW;
    for(let x=off;x<W;x+=LW)g.drawImage(Ly.cv,x,baseY-LHT);
    g.fillStyle=Ly.col;g.fillRect(0,baseY-1,W,H+300);
  }
}

/* ---------------- platforms & world props ---------------- */
function drawPlat(g,pl,T,bg,t){
  const {x,y,w,h}=pl;
  if(pl.t==='s'||pl.big){
    const hh=pl.big?70:h;
    g.fillStyle=bg.dirt;g.fillRect(x,y,w,hh);
    const sh=g.createLinearGradient(0,y,0,y+hh);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(.25,'rgba(0,0,0,.05)');sh.addColorStop(1,'rgba(0,0,0,.45)');
    g.fillStyle=sh;g.fillRect(x,y,w,hh);
    if(pl.big){ // rounded cliff underside
      g.fillStyle=T.dirt2;for(let xx=x;xx<x+w;xx+=34){const d=18+hash(xx)*34;poly(g,[xx,y+hh-2,xx+34,y+hh-2,xx+17,y+hh+d],T.dirt2)}
    }
    // grass
    g.fillStyle=T.grass2;g.fillRect(x,y,w,12);
    g.fillStyle=T.grass;g.fillRect(x,y,w,7);
    for(let xx=x;xx<x+w;xx+=5){const bh=3+hash(xx*.37)*6;g.fillStyle=hash(xx)>.5?T.grass:T.grass2;poly(g,[xx,y+2,xx+4,y+2,xx+2,y-bh])}
    g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x,y,w,2);
    if(!pl.big&&T===THEMES.sky){g.fillStyle='rgba(255,230,200,.25)';for(let xx=x;xx<x+w;xx+=60)ell(g,xx+20,y+h+4,40,10,'rgba(255,200,190,.25)')}
    return;
  }
  // one-way
  const sky=T===THEMES.sky,cr=pl.crumble;
  let ox=0,oy=0;
  if(cr&&cr.timer>0&&!cr.fall){ox=Math.sin(t*90)*1.6}
  if(cr&&cr.fall){oy=cr.fy;g.globalAlpha=clamp(1-cr.fy/160,0,1)}
  g.save();g.translate(ox,oy);
  if(sky){
    const gr=g.createLinearGradient(0,y,0,y+16);gr.addColorStop(0,T.plank);gr.addColorStop(1,T.plank2);
    g.fillStyle=gr;g.beginPath();g.roundRect(x,y,w,16,5);g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+4,y+2,w-8,2);
    // runes
    g.strokeStyle=cr?'rgba(255,120,120,.9)':'rgba(120,230,255,.85)';g.lineWidth=1.5;
    for(let xx=x+14;xx<x+w-10;xx+=24){g.beginPath();g.moveTo(xx,y+5);g.lineTo(xx+5,y+11);g.lineTo(xx+10,y+5);g.stroke()}
    if(cr){g.strokeStyle='rgba(30,10,20,.7)';g.beginPath();g.moveTo(x+w*.3,y);g.lineTo(x+w*.36,y+8);g.lineTo(x+w*.32,y+16);g.moveTo(x+w*.7,y);g.lineTo(x+w*.64,y+9);g.stroke()}
    // cloud wisps below
    g.fillStyle='rgba(255,210,220,.22)';for(let i=0;i<3;i++)ell(g,x+w*(.2+.3*i)+Math.sin(t+i)*6,y+22,w*.14,6);
  }else{
    const gr=g.createLinearGradient(0,y,0,y+16);gr.addColorStop(0,T.plank);gr.addColorStop(1,T.plank2);
    g.fillStyle=gr;g.beginPath();g.roundRect(x,y,w,16,7);g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
    g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;for(let xx=x+10;xx<x+w-6;xx+=17){g.beginPath();g.moveTo(xx,y+4);g.lineTo(xx+6,y+12);g.stroke()}
    ell(g,x+3,y+8,5,8,T.plank,O_,1.5);ell(g,x+3,y+8,2,4,null,'rgba(0,0,0,.4)',1);
    ell(g,x+w-3,y+8,5,8,T.plank,O_,1.5);ell(g,x+w-3,y+8,2,4,null,'rgba(0,0,0,.4)',1);
    g.fillStyle=T.grass;for(let xx=x+8;xx<x+w-8;xx+=11){const k=hash(xx*.7);if(k>.35){g.beginPath();g.ellipse(xx,y+1,5+k*4,3,0,0,6.2832);g.fill()}}
    g.strokeStyle=T.grass2;g.lineWidth=2;for(let i=0;i<3;i++){const xx=x+w*(.2+.3*i);g.beginPath();g.moveTo(xx,y+14);g.quadraticCurveTo(xx+Math.sin(t*1.5+i)*3,y+26,xx,y+34+hash(xx)*14);g.stroke()}
  }
  g.restore();g.globalAlpha=1;
}
function drawRope(g,rp,T,t){
  const x=rp.x,y1=rp.y1,y2=rp.y2;
  g.lineCap='round';
  g.strokeStyle=O_;g.lineWidth=7;g.beginPath();g.moveTo(x,y1);g.lineTo(x,y2);g.stroke();
  g.strokeStyle='#c99a5b';g.lineWidth=4;g.stroke();
  g.strokeStyle='#8a5d2c';g.lineWidth=1.5;g.setLineDash([3,5]);g.stroke();g.setLineDash([]);
  for(let y=y1+16;y<y2;y+=34){circ(g,x,y,4.5,'#d8aa6a',O_,1.5)}
}
function drawSpikes(g,s,T){
  const n=Math.max(2,Math.round(s.w/16)),sw=s.w/n;
  g.fillStyle='#2a1a28';g.fillRect(s.x,s.y-4,s.w,4);
  for(let i=0;i<n;i++){const x=s.x+i*sw;
    poly(g,[x+1,s.y-3,x+sw-1,s.y-3,x+sw/2,s.y-24],'#d6dcf0',O_,1.8);
    poly(g,[x+sw/2,s.y-24,x+sw-1,s.y-3,x+sw/2+1,s.y-3],'rgba(110,120,170,.55)');
  }
}
function drawFlag(g,f,t){
  const x=f.x,y=f.y;
  g.fillStyle='#4a2c18';g.fillRect(x-3,y-84,6,84);g.strokeStyle=O_;g.lineWidth=1.5;g.strokeRect(x-3,y-84,6,84);
  circ(g,x,y-86,6,'#ffd55c',O_,1.5);
  const wv=Math.sin(t*4)*4;
  g.fillStyle=f.on?'#ffcf3a':'#c0283c';
  g.beginPath();g.moveTo(x+3,y-80);g.quadraticCurveTo(x+24,y-80+wv,x+44,y-76+wv*1.4);g.lineTo(x+40,y-54+wv);g.quadraticCurveTo(x+22,y-52+wv*.6,x+3,y-50);g.closePath();
  g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
  g.fillStyle=f.on?'#8a3a00':'#ffe6a0';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText('魂',x+23,y-58+wv*.8);
  if(f.on){const gl=g.createRadialGradient(x,y-50,4,x,y-50,60);gl.addColorStop(0,'rgba(255,220,100,.35)');gl.addColorStop(1,'rgba(255,220,100,0)');g.fillStyle=gl;g.fillRect(x-60,y-110,120,120)}
}
function drawTotem(g,d,t){ // 장승 : stone-spitting totem
  const x=d.x,y=d.y,warn=d.warn>0;
  g.save();g.translate(x,y+Math.sin(t*2+x)*3);
  g.fillStyle='#6b4423';g.beginPath();g.roundRect(-16,-30,32,60,5);g.fill();g.lineWidth=2.5;g.strokeStyle=O_;g.stroke();
  g.fillStyle='#8a5a30';g.fillRect(-16,-30,32,8);
  g.fillStyle=warn?'#ff4040':'#f3e6a0';
  ell(g,-7,-8,4.5,5.5,g.fillStyle,O_,1.5);ell(g,7,-8,4.5,5.5,g.fillStyle,O_,1.5);
  g.fillStyle=O_;g.fillRect(-4,-4,2,2);
  g.beginPath();g.moveTo(-8,8);g.lineTo(8,8);g.lineTo(5,18);g.lineTo(-5,18);g.closePath();g.fillStyle='#2a0f0f';g.fill();
  poly(g,[-4,8,-1,8,-2.5,13],'#fff');poly(g,[1,8,4,8,2.5,13],'#fff');
  g.strokeStyle='#c0283c';g.lineWidth=3;g.beginPath();g.moveTo(-16,-22);g.lineTo(16,-22);g.stroke();
  if(warn){const gl=g.createRadialGradient(0,0,2,0,0,50);gl.addColorStop(0,'rgba(255,60,60,.5)');gl.addColorStop(1,'rgba(255,60,60,0)');g.fillStyle=gl;g.fillRect(-50,-50,100,100)}
  g.restore();
}
function drawPortal(g,p,t,open=true){
  const x=p.x,y=p.y;
  // glow
  const gl=g.createRadialGradient(x,y-60,10,x,y-60,110);gl.addColorStop(0,'rgba(150,220,255,.55)');gl.addColorStop(1,'rgba(150,220,255,0)');g.fillStyle=gl;g.fillRect(x-110,y-170,220,220);
  // swirl
  g.save();g.translate(x,y-58);
  for(let i=0;i<4;i++){g.rotate(t*(1.2+i*.3));ell(g,0,0,36-i*6,52-i*8,null,`rgba(${150+i*25},${210+i*10},255,${.8-i*.15})`,3-i*.4)}
  g.restore();
  circ(g,x,y-58,10+Math.sin(t*5)*2,'#fff');
  // 홍살문 frame
  g.fillStyle='#b8202e';
  g.fillRect(x-58,y-128,14,128);g.fillRect(x+44,y-128,14,128);
  g.strokeStyle=O_;g.lineWidth=2;g.strokeRect(x-58,y-128,14,128);g.strokeRect(x+44,y-128,14,128);
  g.fillRect(x-70,y-136,140,12);g.strokeRect(x-70,y-136,140,12);
  g.fillRect(x-62,y-110,124,8);g.strokeRect(x-62,y-110,124,8);
  for(let s=-56;s<=56;s+=8){poly(g,[x+s-2,y-136,x+s+2,y-136,x+s,y-156],'#d8d0d8',O_,1.2)}
  circ(g,x,y-170,0,'#fff');
  g.fillStyle='#ffe9a0';g.font='bold 14px sans-serif';g.textAlign='center';g.fillText('↑ 입장',x,y-162-Math.sin(t*4)*3);
}

/* ---------------- player (야채 부락리) ---------------- */
function drawHead(g,c,x,y,t,st,hurt){
  const ang=true;
  const face=(ex,ey)=>{ // eyes + mouth, centered at ex,ey
    ell(g,ex-4.5,ey,3.4,3.1,'#fff',O_,1.2);ell(g,ex+4.5,ey,3.4,3.1,'#fff',O_,1.2);
    circ(g,ex-3.7,ey+.4,1.6,O_);circ(g,ex+5.3,ey+.4,1.6,O_);
    g.strokeStyle=O_;g.lineWidth=2.2;g.lineCap='round';
    g.beginPath();g.moveTo(ex-9,ey-5.6);g.lineTo(ex-1.2,ey-2.8);g.moveTo(ex+9,ey-5.6);g.lineTo(ex+1.2,ey-2.8);g.stroke();
    g.beginPath();
    if(hurt){g.arc(ex+.5,ey+9,3,0,6.28);g.fillStyle='#4a1020';g.fill();g.stroke()}
    else{g.moveTo(ex-4.5,ey+6.5);g.quadraticCurveTo(ex+1,ey+11,ex+6.5,ey+5.5);g.stroke();g.beginPath();g.moveTo(ex-2,ey+8.2);g.lineTo(ex+3,ey+8.2);g.strokeStyle='#fff';g.lineWidth=1.2;g.stroke()}
  };
  g.save();g.translate(x,y);
  const flut=Math.sin(t*(st==='run'?18:6))*3;
  // headband tails (behind)
  const bandY=c.head==='carrot'?-1:c.head==='radish'?-2:-3;
  g.strokeStyle=O_;g.lineWidth=5.5;g.lineCap='round';
  g.beginPath();g.moveTo(-9,bandY);g.quadraticCurveTo(-18,bandY+flut,-24,bandY+4+flut*1.4);g.stroke();
  g.beginPath();g.moveTo(-9,bandY);g.quadraticCurveTo(-17,bandY-4+flut,-25,bandY-4+flut*1.2);g.stroke();
  g.strokeStyle=c.band;g.lineWidth=3;
  g.beginPath();g.moveTo(-9,bandY);g.quadraticCurveTo(-18,bandY+flut,-24,bandY+4+flut*1.4);g.stroke();
  g.beginPath();g.moveTo(-9,bandY);g.quadraticCurveTo(-17,bandY-4+flut,-25,bandY-4+flut*1.2);g.stroke();
  if(c.head==='broc'){
    const fl=[[-10,-10,8],[-2,-15,9.5],[8,-12,8.5],[-14,-3,6.5],[13,-3,6.5],[3,-9,7.5],[-6,-8,7]];
    fl.forEach(([fx,fy,r])=>circ(g,fx,fy,r,'#2f9a3e',O_,1.8));
    fl.forEach(([fx,fy,r])=>circ(g,fx-1.5,fy-1.8,r*.55,'#4cc65c'));
    circ(g,0,2,11,'#a9d96c',O_,2);
    ell(g,-4,-3,4,3,'rgba(255,255,255,.22)');
    face(0,1);
  }else if(c.head==='carrot'){
    // leaves
    for(const[a,l]of[[-.5,16],[0,20],[.5,16]]){g.save();g.translate(0,-12);g.rotate(a+Math.sin(t*3+a)*.05);ell(g,0,-l/2,4.5,l/2,'#3fae49',O_,1.6);g.restore()}
    g.beginPath();g.moveTo(-12,-8);g.quadraticCurveTo(-13,5,-3,16);g.quadraticCurveTo(0,19,3,16);g.quadraticCurveTo(13,5,12,-8);g.quadraticCurveTo(0,-15,-12,-8);g.closePath();
    g.fillStyle='#ff8c1f';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
    g.strokeStyle='#d8650c';g.lineWidth=1.3;for(const yy of[-4,6,12]){g.beginPath();g.moveTo(-8+Math.abs(yy)*.2,yy);g.lineTo(-3,yy+1.2);g.moveTo(8-Math.abs(yy)*.2,yy+2);g.lineTo(4,yy+3);g.stroke()}
    g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(-6,-6,2.5,5,.3,0,6.28);g.fill();
    face(0,-3);
  }else if(c.head==='onion'){
    g.save();g.translate(0,-14);for(const a of[-.35,.05,.4]){g.save();g.rotate(a);ell(g,0,-9,2.6,10,'#6fc85a',O_,1.5);g.restore()}g.restore();
    g.beginPath();g.moveTo(0,-17);g.bezierCurveTo(8,-12,16,-4,14,5);g.bezierCurveTo(12,15,-12,15,-14,5);g.bezierCurveTo(-16,-4,-8,-12,0,-17);
    g.fillStyle='#e0a860';g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();
    g.strokeStyle='#b97c3c';g.lineWidth=1.3;for(const k of[-8,-3,3,8]){g.beginPath();g.moveTo(k*.5,-14);g.quadraticCurveTo(k*1.5,0,k,12);g.stroke()}
    ell(g,-6,-6,2.2,4.5,'rgba(255,255,255,.35)');
    face(0,-1);
    g.fillStyle='#7ad0ff';g.beginPath();g.ellipse(-9,7,1.6,2.6,0,0,6.28);g.fill();
  }else if(c.head==='chili'){
    g.save();g.rotate(.18);
    g.beginPath();g.moveTo(-10,-10);g.bezierCurveTo(-15,8,-8,18,2,19);g.bezierCurveTo(10,18,15,6,10,-10);g.bezierCurveTo(5,-15,-5,-15,-10,-10);
    g.fillStyle='#e02a2a';g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();
    ell(g,-6,0,2.2,8,'rgba(255,255,255,.3)');
    g.beginPath();g.moveTo(-9,-11);g.quadraticCurveTo(0,-19,9,-11);g.quadraticCurveTo(10,-15,5,-16);g.quadraticCurveTo(7,-23,1,-26);g.quadraticCurveTo(-1,-18,-8,-15);g.closePath();
    g.fillStyle='#3fae49';g.fill();g.stroke();g.restore();
    face(0,-1);
  }else if(c.head==='eggplant'){
    g.beginPath();g.moveTo(-9,-12);g.bezierCurveTo(-16,2,-12,16,0,17);g.bezierCurveTo(12,16,16,2,9,-12);g.bezierCurveTo(4,-16,-4,-16,-9,-12);
    const eg=g.createLinearGradient(-12,-10,12,16);eg.addColorStop(0,'#8a52b8');eg.addColorStop(1,'#4a2478');g.fillStyle=eg;g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();
    ell(g,-6,-1,2.4,8,'rgba(255,255,255,.35)');
    poly(g,[-11,-12,-6,-18,0,-14,6,-18,11,-12,0,-9],'#3fae49',O_,1.8);
    g.fillStyle='#3fae49';g.beginPath();g.roundRect(-2,-26,4,10,2);g.fill();g.stroke();
    face(0,0);
  }else if(c.head==='corn'){
    g.save();g.translate(0,-2);
    ell(g,0,0,11,17,'#ffd83a',O_,2.2);
    g.strokeStyle='rgba(190,130,0,.55)';g.lineWidth=1;
    for(let i=-8;i<=8;i+=4){g.beginPath();g.moveTo(i,-14);g.lineTo(i*1.05,15);g.stroke()}
    for(let j=-12;j<=12;j+=4){g.beginPath();g.moveTo(-9,j);g.lineTo(9,j);g.stroke()}
    g.restore();
    for(const s of[-1,1]){g.save();g.translate(s*4,12);g.rotate(s*.5);ell(g,0,5,5,10,'#6fc85a',O_,1.6);g.restore()}
    g.save();g.translate(0,-16);for(const a of[-.4,0,.4]){g.save();g.rotate(a);ell(g,0,-4,3,6,'#8fd870',O_,1.4);g.restore()}g.restore();
    face(0,-2);
  }else if(c.head==='garlic'){
    g.save();g.translate(0,-15);g.rotate(Math.sin(t*2)*.04);ell(g,0,-6,2.4,8,'#bfe06a',O_,1.5);g.restore();
    g.beginPath();g.moveTo(0,-19);g.bezierCurveTo(6,-12,16,-6,14,5);g.bezierCurveTo(12,15,-12,15,-14,5);g.bezierCurveTo(-16,-6,-6,-12,0,-19);
    g.fillStyle='#f6f2e6';g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();
    g.strokeStyle='#cfc6ae';g.lineWidth=1.4;for(const k of[-8,-3,3,8]){g.beginPath();g.moveTo(k*.3,-14);g.quadraticCurveTo(k*1.6,0,k,12);g.stroke()}
    ell(g,-6,-5,2.2,5,'rgba(255,255,255,.7)');
    face(0,-1);
  }else{
    for(const[a,l]of[[-.9,17],[-.35,22],[.2,21],[.8,16]]){g.save();g.translate(0,-14);g.rotate(a);ell(g,0,-l/2,4,l/2,'#7fcf6a',O_,1.6);g.restore()}
    ell(g,0,1,12,15,'#f6f3ec',O_,2);
    g.fillStyle='rgba(220,150,190,.4)';g.beginPath();g.ellipse(0,-9,11,5,0,Math.PI,0);g.fill();
    ell(g,-4.5,-4,2.5,6,'rgba(255,255,255,.7)');
    face(0,-2);
  }
  // headband over the face
  g.strokeStyle=O_;g.lineWidth=6;g.beginPath();g.moveTo(-11,bandY);g.lineTo(11,bandY);g.stroke();
  g.strokeStyle=c.band;g.lineWidth=3.4;g.beginPath();g.moveTo(-11,bandY);g.lineTo(11,bandY);g.stroke();
  g.restore();
}
function drawVeggie(g,c,o){
  const t=o.t||0,st=o.st||'idle',face=o.face||1,ap=o.ap||0,sc=.86;
  g.save();g.translate(o.x,o.y);g.scale(face*sc,sc);
  if(o.alpha!==undefined)g.globalAlpha=o.alpha;
  const skin=c.skin,sk2=c.skin2,ph=t*14,run=st==='run';
  const bob=st==='idle'?Math.sin(t*3.2)*1.3:run?-Math.abs(Math.sin(ph))*2.6:0;
  if(o.buff){const a=.35+.15*Math.sin(t*8),gl=g.createRadialGradient(0,-36,6,0,-36,58);gl.addColorStop(0,`rgba(255,220,60,${a+.2})`);gl.addColorStop(1,'rgba(255,160,0,0)');g.fillStyle=gl;g.fillRect(-60,-100,120,130)}
  if(o.tier>=2){const a=.22+.08*Math.sin(t*5),cc=o.tier>=3?'255,215,80':'210,235,255',gl=g.createRadialGradient(0,-36,8,0,-36,52);gl.addColorStop(0,`rgba(${cc},${a})`);gl.addColorStop(1,`rgba(${cc},0)`);g.fillStyle=gl;g.fillRect(-60,-96,120,120)}
  if(o.eq&&o.eq.aura){const ac=ITEMS[o.eq.aura].col,gl=g.createRadialGradient(0,-34,6,0,-34,56);gl.addColorStop(0,ac+'55');gl.addColorStop(1,ac+'00');g.fillStyle=gl;g.fillRect(-60,-96,120,120)}
  // legs
  let lf,lb;
  if(st==='air'){lf=[10,-13];lb=[-8,-7]}
  else if(run){lf=[Math.sin(ph)*12,-Math.max(0,Math.cos(ph))*7];lb=[-Math.sin(ph)*12,-Math.max(0,-Math.cos(ph))*7]}
  else if(st==='climb'){const s=Math.sin(t*10)*6;lf=[3,-8+s];lb=[-3,-8-s]}
  else{lf=[8,0];lb=[-8,0]}
  const hip=-27+bob*.5,shy=-50+bob;
  // arm poses
  const pulse=Math.sin(t*6)*1.5;
  let fa,ba; // [ex,ey,fx,fy]
  if(st==='idle'||st==='skill'){const up=st==='skill'?-14:0;fa=[31,shy+8+up*.4,25,shy-10+up+pulse];ba=[-31,shy+8+up*.4,-25,shy-10+up+pulse]}
  else if(run){const sw=Math.sin(ph)*14;fa=[22+sw*.3,shy+11,14+sw,shy+20-Math.abs(sw)*.35];ba=[-22-sw*.3,shy+11,-14-sw,shy+20-Math.abs(sw)*.35]}
  else if(st==='air'){fa=[29,shy-4,27,shy-24];ba=[-29,shy-4,-27,shy-24]}
  else if(st==='climb'){const s=Math.sin(t*10)*8;fa=[20,shy-8,14,shy-20+s];ba=[-20,shy-8,-14,shy-20-s]}
  else if(st==='hurt'){fa=[30,shy+2,38,shy+14];ba=[-30,shy+2,-38,shy+14]}
  else{fa=[28,shy+8,22,shy-8];ba=[-28,shy+8,-22,shy-8]}
  if(st==='atk'){
    const e=Math.sin(clamp(ap*1.25,0,1)*Math.PI*.5+ (ap>.8?(ap-.8)*3:0));
    const up=o.combo===2;
    fa=[18+e*22,shy+(up?-2:6)+(-e*(up?14:0)),20+e*48,shy+(up?8-e*34:2)];
    ba=[-26,shy+10,-20,shy-6];
  }
  const armDraw=(a,col)=>{
    const sx=a[0]>0?18:-18,sy=shy+3;
    limb2(g,sx,sy,a[0],a[1],a[2],a[3],12,col);
    // bicep
    const mx=(sx+a[0])/2+(a[0]>0?1:-1)*2,my=(sy+a[1])/2-2;
    circ(g,mx,my,7.2+(st==='skill'?Math.sin(t*10)*.8:0),col,O_,1.8);
    circ(g,a[2],a[3],6.8,col,O_,2);
  };
  if(o.eq&&o.eq.cape)drawCape(g,o.eq.cape,t,st,shy);
  armDraw(ba,sk2);
  limb(g,-5,hip,lb[0]-2,lb[1]-5,11.5,sk2);ell(g,lb[0]+1,lb[1]-3.5,8,4.2,c.shoe,O_,1.8);
  limb(g,5,hip,lf[0]+1,lf[1]-5,11.5,skin);ell(g,lf[0]+3,lf[1]-3.5,8,4.2,c.shoe,O_,1.8);
  // torso
  g.beginPath();g.moveTo(-22,shy+3);g.quadraticCurveTo(0,shy-7,22,shy+3);g.lineTo(11,-26);g.lineTo(-11,-26);g.closePath();
  g.fillStyle=skin;g.fill();g.lineWidth=2.6;g.strokeStyle=O_;g.lineJoin='round';g.stroke();
  g.strokeStyle=sk2;g.lineWidth=1.6;g.lineCap='round';
  g.beginPath();g.arc(-8,shy+10,8,.2,2.9);g.stroke();g.beginPath();g.arc(8,shy+10,8,.25,2.95);g.stroke();
  g.beginPath();g.moveTo(0,shy+7);g.lineTo(0,-30);g.stroke();
  for(const yy of[shy+19,shy+25,-33]){g.beginPath();g.moveTo(-5,yy);g.lineTo(5,yy);g.stroke()}
  // shorts
  g.beginPath();g.roundRect(-12.5,-30,25,12,3);g.fillStyle=c.short;g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();
  g.fillStyle='#ffd34a';g.fillRect(-12,-30,24,3.5);circ(g,0,-28.3,2.2,'#fff3a0',O_,1);
  if(o.eq&&o.eq.outfit)drawOutfit(g,o.eq.outfit,shy);
  // shoulder deltoids
  circ(g,-19,shy+3,8.2,sk2,O_,2);circ(g,19,shy+3,8.2,skin,O_,2);
  armDraw(fa,skin);
  drawHead(g,c,0,shy-12,t,st,st==='hurt');
  if(o.eq)drawGear(g,c,o.eq,0,shy-12,t);
  g.restore();
}
function drawSlash(g,x,y,face,prog,col,combo){
  const a=1-prog;if(a<=0)return;
  g.save();g.translate(x,y);g.scale(face,1);g.globalAlpha=a;
  const r=48+combo*8+prog*18,start=combo===2?-1.9:-1.2,end=combo===2?.5:1.0;
  g.beginPath();g.arc(0,0,r,start,end);g.arc(0,0,r-12*(1-prog),end,start,true);g.closePath();
  const gr=g.createLinearGradient(0,-r,r,r);gr.addColorStop(0,'#fff');gr.addColorStop(1,col);g.fillStyle=gr;g.fill();
  g.restore();
}
function drawVegProj(g,kind,x,y,rot,s=1){
  g.save();g.translate(x,y);g.rotate(rot);g.scale(s,s);
  if(kind==='carrot'){poly(g,[-14,-6,12,0,-14,6],'#ff8c1f',O_,2);g.fillStyle='#3fae49';ell(g,-18,-3,6,2.8,'#3fae49',O_,1.4);ell(g,-18,3,6,2.8,'#3fae49',O_,1.4)}
  else if(kind==='radish'){ell(g,0,0,12,8,'#f6f3ec',O_,2);ell(g,-14,0,6,3,'#7fcf6a',O_,1.4);poly(g,[10,-2,18,0,10,2],'#e8d8c8',O_,1.4)}
  else{circ(g,-3,-3,6,'#2f9a3e',O_,1.8);circ(g,4,-4,5.5,'#3fae49',O_,1.8);circ(g,-1,3,6,'#2f9a3e',O_,1.8);g.fillStyle='#a9d96c';g.fillRect(2,3,9,5);g.strokeStyle=O_;g.lineWidth=1.5;g.strokeRect(2,3,9,5)}
  g.restore();
}

/* ---------------- monsters ---------------- */
function drawEgg(g,e,t){ // 달걀귀신
  g.save();g.translate(e.x,e.y);
  if(e.flash>0)g.globalAlpha=.6;
  const sq=e.vy<-50?1.12:e.vy>50?.92:1+Math.sin(t*5+e.x)*.03;
  g.scale(e.dir>0?1:-1,1);
  ell(g,0,-1,13,3.5,'rgba(0,0,0,.25)');
  g.save();g.scale(1/sq,sq);
  ell(g,0,-18,14.5,18,'#f4f0e6',O_,2.2);
  g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(-5,-25,3,6,.4,0,6.28);g.fill();
  g.restore();
  // creepy smooth "no-face" with tiny glowing eyes? give it a cheeky blank & crack
  g.strokeStyle='#8a7a68';g.lineWidth=1.6;g.beginPath();g.moveTo(-3,-34);g.lineTo(0,-29);g.lineTo(-4,-26);g.lineTo(0,-22);g.stroke();
  ell(g,4,-19,2.4,3.2,'#2a1020');ell(g,10,-19,2.4,3.2,'#2a1020');
  g.fillStyle='#d03a4a';g.beginPath();g.ellipse(7,-10,3.5,2.6,0,0,6.28);g.fill();
  g.fillStyle='#e8e0f0';poly(g,[-9,-10,-5,-3,-12,-3],'#e8e0f0',O_,1);
  ell(g,-6,0,6,3,'#caa',O_,1.4);ell(g,6,0,6,3,'#caa',O_,1.4);
  g.restore();
}
function drawWisp(g,e,t){ // 도깨비불
  g.save();g.translate(e.x,e.y);
  if(e.flash>0)g.globalAlpha=.65;
  const gl=g.createRadialGradient(0,0,4,0,0,36);gl.addColorStop(0,e.col+'.55)');gl.addColorStop(1,e.col+'0)');g.fillStyle=gl;g.fillRect(-40,-40,80,80);
  const w=Math.sin(t*9+e.ph)*2.5;
  g.beginPath();g.moveTo(0,-26+w);g.bezierCurveTo(14,-10,17,2,0,13);g.bezierCurveTo(-17,2,-14,-10,0,-26+w);
  const gr=g.createLinearGradient(0,-26,0,13);gr.addColorStop(0,'#e8ffff');gr.addColorStop(.5,e.col2);gr.addColorStop(1,e.col3);
  g.fillStyle=gr;g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
  ell(g,-5,-1,2.7,3.6,'#101030');ell(g,5,-1,2.7,3.6,'#101030');circ(g,-4.4,-2.4,.9,'#fff');circ(g,5.6,-2.4,.9,'#fff');
  g.strokeStyle='#101030';g.lineWidth=1.6;g.beginPath();g.moveTo(-8,-6);g.lineTo(-2,-4);g.moveTo(8,-6);g.lineTo(2,-4);g.stroke();
  g.beginPath();g.arc(0,6,3.4,.15,3);g.stroke();
  g.restore();
}
function drawPotion(g,it,t){
  const y=it.y+Math.sin(t*4+it.x)*3;
  g.save();g.translate(it.x,y);
  const col=it.kind==='hp'?'#ff4a5a':'#4a8aff';
  const gl=g.createRadialGradient(0,-8,2,0,-8,24);gl.addColorStop(0,col+'88');gl.addColorStop(1,col+'00');g.fillStyle=gl;g.fillRect(-26,-34,52,52);
  g.beginPath();g.roundRect(-7,-16,14,16,5);g.fillStyle=col;g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
  g.fillStyle='#d8c090';g.fillRect(-3.5,-22,7,6);g.strokeRect(-3.5,-22,7,6);
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-4,-13,2.4,7);
  g.restore();
}

/* ---------------- bosses ---------------- */
function drawDokkaebi(g,b,t){
  const rage=b.phase>1;
  const sk=rage?'#d23a3a':'#4a72d8',sk2=rage?'#9c2030':'#3050a8';
  g.save();g.translate(b.x,b.y);
  if(b.flash>0)g.filter='brightness(2)';
  const sx=b.face,anim=b.anim;
  g.scale(sx*1.15,1.15);
  let sqy=1,lift=0;
  if(anim==='crouch'||anim==='land'){sqy=.86}
  if(anim==='air'){sqy=1.06;lift=0}
  const bob=anim==='idle'?Math.sin(t*3)*2:0;
  g.translate(0,0);g.scale(1,sqy);
  const step=anim==='walk'||anim==='charge'?Math.sin(t*(anim==='charge'?22:9))*10:0;
  // shadow
  if(b.y>=b.gy-1)ell(g,0,0,52,9,'rgba(0,0,0,.35)');
  if(rage){const gl=g.createRadialGradient(0,-80,10,0,-80,120);gl.addColorStop(0,'rgba(255,60,40,.35)');gl.addColorStop(1,'rgba(255,60,40,0)');g.fillStyle=gl;g.fillRect(-130,-210,260,260)}
  // legs
  limb(g,-22,-62,-26+step,-6,26,sk2);limb(g,22,-62,26-step,-6,26,sk);
  ell(g,-26+step,-3,18,8,'#3a2418',O_,2);ell(g,26-step,-3,18,8,'#3a2418',O_,2);
  // loincloth (tiger skin)
  g.beginPath();g.moveTo(-40,-82);g.lineTo(40,-82);g.lineTo(34,-42);g.lineTo(18,-52);g.lineTo(0,-38);g.lineTo(-18,-52);g.lineTo(-34,-42);g.closePath();
  g.fillStyle='#f0b01c';g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke();
  g.fillStyle=O_;for(const[a,c]of[[-28,-70],[-12,-62],[6,-72],[22,-62],[32,-74],[-4,-50],[14,-48],[-24,-52]]){poly(g,[a,c,a+8,c+3,a+3,c+9])}
  // torso
  g.beginPath();g.moveTo(-50,-150+bob);g.quadraticCurveTo(0,-168+bob,50,-150+bob);g.lineTo(34,-80);g.lineTo(-34,-80);g.closePath();
  g.fillStyle=sk;g.fill();g.lineWidth=3.2;g.strokeStyle=O_;g.stroke();
  g.strokeStyle=sk2;g.lineWidth=2.4;g.lineCap='round';
  g.beginPath();g.arc(-17,-128+bob,17,.1,3);g.stroke();g.beginPath();g.arc(17,-128+bob,17,.15,3.05);g.stroke();
  for(const yy of[-108,-96,-86]){g.beginPath();g.moveTo(-9,yy);g.lineTo(9,yy);g.stroke()}
  g.beginPath();g.moveTo(0,-114);g.lineTo(0,-82);g.stroke();
  // belt
  g.fillStyle='#4a2a14';g.fillRect(-36,-86,72,9);g.strokeRect(-36,-86,72,9);circ(g,0,-81.5,6,'#ffd34a',O_,2);
  // arms: back arm (visual right side is the club arm)
  const clubAng=anim==='raise'?-2.45:anim==='slam'?1.05:anim==='charge_tel'?-.2:anim==='charge'?.5:anim==='roar'?-1.4:anim==='air'?-2.2:-.55;
  // free arm
  const fx=anim==='roar'?-60:-52,fy=anim==='roar'?-190:-96;
  limb2(g,-48,-146+bob,-66,-118,fx,fy,22,sk2);circ(g,-48,-146+bob,15,sk2,O_,2.4);circ(g,fx,fy,13,sk2,O_,2.4);
  // club arm
  const sx0=48,sy0=-146+bob;
  g.save();g.translate(sx0,sy0);g.rotate(clubAng);
  limb(g,0,0,0,52,22,sk);
  // club
  g.translate(0,56);
  g.beginPath();g.moveTo(-9,0);g.lineTo(9,0);g.lineTo(26,92);g.quadraticCurveTo(0,112,-26,92);g.closePath();
  const cg=g.createLinearGradient(-26,0,26,0);cg.addColorStop(0,'#5a3a1c');cg.addColorStop(.5,'#8f6234');cg.addColorStop(1,'#4a2e16');g.fillStyle=cg;g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke();
  for(const[a,c]of[[-14,30],[12,44],[-6,62],[16,78],[-18,86]]){poly(g,[a-5,c+4,a+5,c+4,a,c-9],'#cfd2e0',O_,1.6)}
  g.restore();
  circ(g,sx0,sy0,16,sk,O_,2.6);
  // head
  const hy=-170+bob+(anim==='roar'?-6:0);
  for(const s of[-1,1]){g.save();g.translate(s*28,hy-8);g.rotate(s*.35);poly(g,[-7,0,7,0,s*3,-34],'#fff0c4',O_,2.4);g.restore()}
  // hair
  g.fillStyle='#1c2860';for(let i=-4;i<=4;i++){poly(g,[i*8-9,hy-16,i*8+9,hy-16,i*8+(i%2?5:-5),hy-44-Math.abs(i)%3*5],'#222f7a',O_,2)}
  ell(g,0,hy,34,30,sk,O_,3);
  // brow & eyes
  g.fillStyle='#fff6c8';
  ell(g,-14,hy-2,7,6,rage?'#ffe040':'#fff6c8',O_,2);ell(g,14,hy-2,7,6,rage?'#ffe040':'#fff6c8',O_,2);
  circ(g,-13,hy-1,2.8,rage?'#c00000':O_);circ(g,13,hy-1,2.8,rage?'#c00000':O_);
  g.strokeStyle=O_;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-26,hy-14);g.lineTo(-6,hy-6);g.moveTo(26,hy-14);g.lineTo(6,hy-6);g.stroke();
  // nose, mouth, tusks
  ell(g,0,hy+8,6,4.5,sk2,O_,2);
  g.beginPath();g.moveTo(-18,hy+16);g.quadraticCurveTo(0,hy+(anim==='roar'||anim==='slam'?36:28),18,hy+16);g.fillStyle='#3a0a14';g.fill();g.lineWidth=2.4;g.stroke();
  poly(g,[-16,hy+16,-9,hy+16,-13,hy+3],'#fff6e0',O_,2);poly(g,[16,hy+16,9,hy+16,13,hy+3],'#fff6e0',O_,2);
  g.restore();g.filter='none';
}
function drawFox(g,b,t,alpha=1,tint){
  g.save();g.translate(b.x,b.y);g.globalAlpha=alpha;
  if(b.flash>0&&!tint)g.filter='brightness(2)';
  const sx=b.face,rage=b.phase>1,anim=b.anim;
  g.scale(sx,1);
  const sw=Math.sin(t*2)*4;
  const bodyCol=tint||'#fff8f2';
  // glow
  const gl=g.createRadialGradient(0,-70,10,0,-70,130);gl.addColorStop(0,rage?'rgba(255,120,200,.35)':'rgba(140,200,255,.3)');gl.addColorStop(1,'rgba(140,200,255,0)');g.fillStyle=gl;g.fillRect(-140,-210,280,280);
  // tails
  const nt=rage?9:5;
  for(let i=0;i<nt;i++){
    const a=-Math.PI/2-.2+((i/(nt-1))-.5)*(rage?3.3:2.4)-.55*0 ;
    const ang=a+Math.sin(t*1.7+i)*.07;
    g.save();g.translate(-18,-62);g.rotate(ang+Math.PI/2);
    const L_=96+(i%2)*14;
    g.beginPath();g.moveTo(-9,0);g.bezierCurveTo(-24,L_*.4,-18,L_*.9,0,L_);g.bezierCurveTo(18,L_*.9,24,L_*.4,9,0);g.closePath();
    const tg=g.createLinearGradient(0,0,0,L_);tg.addColorStop(0,tint||'#fff8f0');tg.addColorStop(.7,tint||(rage?'#ffc4e4':'#e6f2ff'));tg.addColorStop(1,tint||(rage?'#ff5aa8':'#6aa8ff'));
    g.fillStyle=tg;g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();
    g.restore();
  }
  // robe
  g.beginPath();g.moveTo(-20,-96+sw*.2);g.lineTo(20,-96+sw*.2);g.lineTo(34,-6);g.quadraticCurveTo(0,6,-34,-6);g.closePath();
  g.fillStyle=bodyCol;g.fill();g.lineWidth=2.8;g.strokeStyle=O_;g.stroke();
  g.fillStyle=tint||'#d02a44';g.beginPath();g.moveTo(-20,-96);g.lineTo(20,-96);g.lineTo(22,-72);g.lineTo(-22,-72);g.closePath();g.fill();g.stroke();
  g.fillStyle=tint||'#3a4aa8';g.fillRect(-21,-76,42,6);g.strokeRect(-21,-76,42,6);
  g.strokeStyle='rgba(180,60,80,.55)';g.lineWidth=2;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*6,-66);g.lineTo(i*11,-12);g.stroke()}
  // sleeves/arms
  const cast=anim==='cast'||anim==='claw'||anim==='tails';
  const ay=cast?-124:-90;
  limb2(g,-18,-92,-34,cast?-112:-76,-40,ay,13,bodyCol);limb2(g,18,-92,34,cast?-112:-76,40,ay,13,bodyCol);
  circ(g,-40,ay,7,bodyCol,O_,2);circ(g,40,ay,7,bodyCol,O_,2);
  if(anim==='claw'){for(const s of[-1,1])for(let k=0;k<3;k++){poly(g,[s*(44+k*4),ay-6,s*(44+k*4)+s*14,ay-2,s*(44+k*4),ay+4],'#fff',O_,1.4)}}
  // fox bead
  const bx=Math.cos(t*2)*26,by=-108+Math.sin(t*2)*5;
  const bg=g.createRadialGradient(bx,by,1,bx,by,16);bg.addColorStop(0,'#fff');bg.addColorStop(.5,rage?'#ff80d0':'#8fd0ff');bg.addColorStop(1,'rgba(120,180,255,0)');g.fillStyle=bg;g.fillRect(bx-18,by-18,36,36);
  // head
  const hy=-116+sw*.25;
  poly(g,[-17,hy-6,-24,hy-34,-6,hy-14],bodyCol,O_,2.4);poly(g,[17,hy-6,24,hy-34,6,hy-14],bodyCol,O_,2.4);
  poly(g,[-15,hy-10,-20,hy-26,-8,hy-14],tint||'#ff9ab0');poly(g,[15,hy-10,20,hy-26,8,hy-14],tint||'#ff9ab0');
  g.beginPath();g.moveTo(-22,hy-6);g.quadraticCurveTo(0,hy-22,22,hy-6);g.quadraticCurveTo(24,hy+8,0,hy+26);g.quadraticCurveTo(-24,hy+8,-22,hy-6);
  g.fillStyle=bodyCol;g.fill();g.lineWidth=2.8;g.strokeStyle=O_;g.stroke();
  // markings
  g.fillStyle=tint||'#d02a44';poly(g,[-3,hy-14,3,hy-14,0,hy-5]);
  g.strokeStyle=tint||'#d02a44';g.lineWidth=2;g.beginPath();g.moveTo(-18,hy+1);g.lineTo(-9,hy+3);g.moveTo(18,hy+1);g.lineTo(9,hy+3);g.stroke();
  // eyes
  const ec=rage?'#ff2a6a':'#ff5a30';
  g.fillStyle=ec;g.beginPath();g.moveTo(-15,hy+2);g.quadraticCurveTo(-9,hy-6,-3,hy+4);g.quadraticCurveTo(-9,hy+4,-15,hy+2);g.fill();g.stroke();
  g.beginPath();g.moveTo(15,hy+2);g.quadraticCurveTo(9,hy-6,3,hy+4);g.quadraticCurveTo(9,hy+4,15,hy+2);g.fill();g.stroke();
  circ(g,0,hy+14,2.6,'#2a1020');
  g.strokeStyle=O_;g.lineWidth=1.8;g.beginPath();g.moveTo(-8,hy+19);g.quadraticCurveTo(0,hy+(anim==='cast'?27:22),8,hy+19);g.stroke();
  g.restore();g.filter='none';g.globalAlpha=1;
}
