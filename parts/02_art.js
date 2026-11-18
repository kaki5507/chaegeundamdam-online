/* ============================================================
   ART : backgrounds, platforms, characters (all procedural)
   ============================================================ */
const O_='#4a3360';
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function circ(g,x,y,r,fill,stroke,lw){g.beginPath();g.arc(x,y,r,0,6.2832);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||2;g.strokeStyle=stroke;g.stroke()}}
function ell(g,x,y,rx,ry,fill,stroke,lw,rot=0){g.beginPath();g.ellipse(x,y,rx,ry,rot,0,6.2832);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||2;g.strokeStyle=stroke;g.stroke()}}
function limb(g,x1,y1,x2,y2,w,col){g.lineCap='round';g.lineJoin='round';g.strokeStyle=O_;g.lineWidth=w+4;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke()}
function limb2(g,x1,y1,xm,ym,x2,y2,w,col){g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(xm,ym);g.lineTo(x2,y2);g.strokeStyle=O_;g.lineWidth=w+4;g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke()}
function poly(g,pts,fill,stroke,lw){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||2;g.lineJoin='round';g.strokeStyle=stroke;g.stroke()}}

/* ---------------- themes / backgrounds ---------------- */
const THEMES={
  forest:{sun:1,sky:['#8a7ae8','#c8a8f4','#ffd0ec','#fff0e0'],moon:{x:.78,y:.2,r:46,c:'#fff6fc',glow:'rgba(255,220,250,'},
    layers:[{k:'clouds',col:'#fff4fd',base:.42,f:.04},{k:'ridge',col:'#b8a8ec',amp:70,base:.62,f:.08,cyc:[2,5,9]},{k:'ridge',col:'#9ad0d8',amp:60,base:.74,f:.16,cyc:[3,7,11]},
            {k:'pines',col:'#78bcb8',base:.86,f:.3,hh:[90,170],n:26},{k:'pines',col:'#589a9e',base:.98,f:.55,hh:[130,240],n:15}],
    grass:'#a8f0c8',grass2:'#6ac4a4',dirt:'#c09ab8',dirt2:'#9a7498',stone:'#c8b8d8',plank:'#e0b8c8',plank2:'#a07898',fly:'#fff6c8'},
  sky:{sun:1,sky:['#6a8af0','#a8b8ff','#ffd0f0','#fff4ea'],moon:{x:.2,y:.24,r:52,c:'#fffaff',glow:'rgba(255,230,255,'},
    layers:[{k:'clouds',col:'#ffffff',base:.5,f:.05},{k:'islands',col:'#c0b0f0',base:.64,f:.1},{k:'clouds',col:'#ffe8f8',base:.84,f:.24},{k:'clouds',col:'#ffffff',base:1.02,f:.42}],
    grass:'#c8f4e8',grass2:'#88d0c0',dirt:'#c8b8f0',dirt2:'#9a88d0',stone:'#d8d0f8',plank:'#e8e0ff',plank2:'#a8a0e0',fly:'#ffffff'},
  night:{sky:['#1a1050','#4a2a98','#a85ab8','#f0a0c0'],moon:{x:.5,y:.26,r:70,c:'#ffeefa',glow:'rgba(255,200,250,'},
    layers:[{k:'ridge',col:'#4a3a98',amp:80,base:.64,f:.06,cyc:[2,4,7]},{k:'pines',col:'#33287a',base:.86,f:.28,hh:[80,150],n:24},{k:'gates',col:'#7a3a8a',base:.98,f:.5}],
    grass:'#c0a8ff',grass2:'#7a60c8',dirt:'#4a3a80',dirt2:'#32285e',stone:'#8a80c0',plank:'#b08ad0',plank2:'#6a4a90',fly:'#ffe8ff'},
  lava:{sky:['#3a0a10','#7a1a14','#d04a1a','#ffb060'],moon:{x:.62,y:.86,r:120,c:'#ff9a4a',glow:'rgba(255,120,40,'},
    layers:[{k:'ridge',col:'#5a1a14',amp:120,base:.5,f:.06,cyc:[2,3,8]},{k:'ridge',col:'#3a0e0a',amp:90,base:.7,f:.16,cyc:[3,5,13]},{k:'gates',col:'#6a1408',base:.96,f:.45}],
    grass:'#ff8a3a',grass2:'#b8401a',dirt:'#5a2c20',dirt2:'#3a1a14',stone:'#7a4a40',plank:'#9a5a38',plank2:'#5a2c18',fly:'#ffd080'},
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
  const sun=!!T.sun;
  if(sun){g.strokeStyle='rgba(255,250,200,.5)';g.lineWidth=4;for(let i=0;i<12;i++){const a=i/12*6.283;g.beginPath();g.moveTo(mx+Math.cos(a)*m.r*1.25,my+Math.sin(a)*m.r*1.25);g.lineTo(mx+Math.cos(a)*m.r*1.6,my+Math.sin(a)*m.r*1.6);g.stroke()}}
  g.fillStyle=sun?'rgba(255,255,255,0)':'rgba(60,20,40,.10)';
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
  const face=(ex,ey)=>{ // 메이플풍: 큰 눈 · 하이라이트 · 볼터치 · 작은 입
    const blink=(Math.sin(t*1.7+x)>.985)&&!hurt;
    for(const s of[-1,1]){const cx=ex+s*5.2,cy=ey+.5;
      if(blink){g.strokeStyle=O_;g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(cx-3,cy);g.quadraticCurveTo(cx,cy+2,cx+3,cy);g.stroke();continue}
      if(hurt){g.strokeStyle=O_;g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(cx-2.6,cy-2.6);g.lineTo(cx+2.6,cy+2.6);g.moveTo(cx+2.6,cy-2.6);g.lineTo(cx-2.6,cy+2.6);g.stroke();continue}
      ell(g,cx,cy,3.1,4.1,'#1c1428');circ(g,cx+.9,cy-1.5,1.35,'#fff');circ(g,cx-1,cy+1.6,.65,'#fff')}
    g.fillStyle='rgba(255,120,140,.45)';g.beginPath();g.ellipse(ex-9,ey+5,3.2,2,0,0,6.28);g.ellipse(ex+9,ey+5,3.2,2,0,0,6.28);g.fill();
    g.strokeStyle=O_;g.lineWidth=1.5;g.lineCap='round';g.beginPath();
    if(hurt){g.arc(ex,ey+8,2.2,0,6.28);g.fillStyle='#8a2a3a';g.fill();g.stroke()}
    else{g.moveTo(ex-2.2,ey+6.2);g.quadraticCurveTo(ex,ey+8.4,ex+2.2,ey+6.2);g.stroke()}
  };
  g.save();g.translate(x,y);
  const flut=Math.sin(t*(st==='run'?18:6))*3;
  const bandY=0;
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
  g.restore();
}
/* ---------------- 플레이어 : 메이플풍 2등신 사람 + 야채 무기 ---------------- */
const HAIR={warrior:{c:'#3fa04a',st:'spiky'},archer:{c:'#ff8c2a',st:'pony'},guardian:{c:'#e8e2d6',st:'bowl'},mage:{c:'#c8905a',st:'long'},
  fighter:{c:'#e0342a',st:'flame'},rogue:{c:'#7a4ab8',st:'messy'},gunner:{c:'#ffcf3a',st:'short'},priest:{c:'#f4ead0',st:'longS'}};
const EYEC={warrior:'#2a6a2a',archer:'#8a4a10',guardian:'#3a4a6a',mage:'#5a3aa0',fighter:'#8a1a1a',rogue:'#4a2a7a',gunner:'#7a5a10',priest:'#3a7ab0'};
const SKINC='#ffe0c4',SKIN2C='#f2c6a4';
function hairPath(g,st,t,back){
  const H=HAIR[st]||HAIR.warrior;
  return H;
}
function drawHumanHead(g,c,t,st,hurt,fid){
  const H=HAIR[c.id]||HAIR.warrior,hc=H.c,hd=shade(hc,-45),R=19,run=st==='run';
  const sway=Math.sin(t*(run?14:3))*(run?3:1.2);
  // 뒷머리
  g.fillStyle=hc;g.strokeStyle=O_;g.lineWidth=2.2;g.lineJoin='round';
  if(H.st==='long'||H.st==='longS'){g.beginPath();g.moveTo(-R-1,-4);g.quadraticCurveTo(-R-4+sway*.3,22,-12+sway,26);g.lineTo(12+sway,26);g.quadraticCurveTo(R+4+sway*.3,22,R+1,-4);g.closePath();g.fill();g.stroke()}
  if(H.st==='pony'){g.save();g.translate(-R+2,-6);g.rotate(.5+sway*.06);g.beginPath();g.ellipse(-6,10,7,16,.2,0,6.28);g.fill();g.stroke();g.restore();circ(g,-R+3,-6,3.5,'#3fae49',O_,1.4)}
  // 귀 · 얼굴
  circ(g,-R+1,3,4.5,SKINC,O_,2);circ(g,R-1,3,4.5,SKINC,O_,2);
  g.beginPath();g.ellipse(0,1,R,R-1.5,0,0,6.28);g.fillStyle=SKINC;g.fill();g.lineWidth=2.4;g.strokeStyle=O_;g.stroke();
  drawFace(g,fid|0,EYEC[c.id]||'#3a2a1a',t,hurt,st);
  // 앞머리
  g.fillStyle=hc;g.strokeStyle=O_;g.lineWidth=2.2;
  g.beginPath();g.moveTo(-R-1.5,4);g.quadraticCurveTo(-R-2,-R-3,0,-R-3);g.quadraticCurveTo(R+2,-R-3,R+1.5,4);
  const bangs={spiky:[[13,-2],[8,-8],[3,-3],[-3,-9],[-8,-3],[-13,-6]],pony:[[12,-4],[5,-7],[0,-3],[-6,-8],[-13,-2]],bowl:[[14,-6],[-14,-6]],long:[[12,-2],[6,-7],[0,-5],[-6,-8],[-12,-1]],
    flame:[[13,-4],[7,-6],[1,-2],[-5,-7],[-12,-3]],messy:[[13,4],[7,-4],[0,2],[-6,-5],[-14,6]],short:[[13,-6],[6,-9],[-1,-6],[-8,-9],[-13,-5]],longS:[[12,-3],[0,-7],[-12,-3]]}[H.st]||[];
  for(const[x,y]of bangs)g.lineTo(x,y);g.closePath();g.fill();g.stroke();
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-6,-13,7,2.5,-.3,0,6.28);g.fill();
  // 머리 장식 (스타일별)
  if(H.st==='spiky'||H.st==='flame'){const n=H.st==='flame'?5:4;for(let i=0;i<n;i++){const a=-2.5+i*(1.7/(n-1))-.15,x0=Math.cos(a)*R*.85,y0=Math.sin(a)*R*.85-4;
    g.beginPath();g.moveTo(x0-5,y0+2);g.lineTo(x0+Math.cos(a)*12+(H.st==='flame'?sway:0),y0+Math.sin(a)*12-2);g.lineTo(x0+5,y0+2);g.closePath();g.fillStyle=hc;g.fill();g.stroke()}}
  if(H.st==='messy'){g.beginPath();g.moveTo(-4,-R-1);g.quadraticCurveTo(-10,-R-12,-2+sway,-R-10);g.stroke()}
  if(H.st==='bowl'){g.fillStyle='#e83a3a';g.fillRect(-R,-9,R*2,5);g.strokeRect(-R,-9,R*2,5)}
  if(H.st==='longS'){g.strokeStyle='#ffd34a';g.lineWidth=2.4;g.beginPath();g.arc(0,2,R+.5,Math.PI*1.12,Math.PI*1.88);g.stroke();circ(g,0,-R+1,2.6,'#7ad0ff',O_,1.2)}
  if(H.st==='long'){g.save();g.translate(2,-R-2);g.rotate(sway*.05);ell(g,0,-6,2.2,7,'#6fc85a',O_,1.4);g.restore()}
  if(H.st==='short'){g.fillStyle='#3a5a2a';g.beginPath();g.moveTo(-R+1,-6);g.quadraticCurveTo(0,-R-10,R-1,-6);g.lineTo(R+9,-4);g.lineTo(R-1,-2);g.closePath();g.fill();g.stroke()}
}
function drawVegWeapon(g,c,t,st){ // 야채 무기 (손 기준 좌표)
  g.lineJoin='round';
  switch(c.id){
    case'warrior':{ // 대파 검
      g.fillStyle='#8a5a2a';g.fillRect(-2.5,-2,5,12);g.strokeStyle=O_;g.lineWidth=1.6;g.strokeRect(-2.5,-2,5,12);
      poly(g,[-7,-3,7,-3,6,-6,-6,-6],'#ffd34a',O_,1.6);
      g.beginPath();g.moveTo(-4,-6);g.lineTo(-4,-34);g.quadraticCurveTo(0,-44,4,-34);g.lineTo(4,-6);g.closePath();
      const gr=g.createLinearGradient(0,-44,0,-6);gr.addColorStop(0,'#5ad04a');gr.addColorStop(.55,'#c8f0a0');gr.addColorStop(1,'#ffffff');g.fillStyle=gr;g.fill();g.lineWidth=1.8;g.strokeStyle=O_;g.stroke();
      g.strokeStyle='rgba(60,140,50,.6)';g.lineWidth=1;g.beginPath();g.moveTo(0,-8);g.lineTo(0,-36);g.stroke();break}
    case'archer':{ // 당근 활
      g.strokeStyle=O_;g.lineWidth=6;g.beginPath();g.arc(-8,0,22,-1.1,1.1);g.stroke();g.strokeStyle='#ff8c1f';g.lineWidth=3.6;g.stroke();
      {const pull=g.bowPull||0;g.bowPull=0;const ax=-8+22*Math.cos(-1.1),ay=22*Math.sin(-1.1),bx=-8+22*Math.cos(1.1),by=22*Math.sin(1.1),mx=ax-pull*16;
       g.strokeStyle='#fff';g.lineWidth=1.2;g.beginPath();g.moveTo(ax,ay);g.lineTo(mx,0);g.lineTo(bx,by);g.stroke();
       if(pull>.15){poly(g,[mx,-2,mx+30,0,mx,2],'#ff8c1f',O_,1);ell(g,mx-2,0,4,2,'#3fae49',O_,.8)}}
      for(const s of[-1,1])ell(g,-8+22*Math.cos(1.1*s)+1,22*Math.sin(1.1*s)+s*3,2,4,'#3fae49',O_,1);break}
    case'guardian':{ // 무 망치
      g.fillStyle='#8a5a2a';g.fillRect(-2,-26,4,32);g.strokeStyle=O_;g.lineWidth=1.6;g.strokeRect(-2,-26,4,32);
      g.save();g.translate(0,-30);g.rotate(Math.PI/2);ell(g,0,0,9,13,'#f6f3ec',O_,2);g.fillStyle='rgba(220,150,190,.5)';g.beginPath();g.ellipse(-4,0,4,11,0,0,6.28);g.fill();
      for(const a of[-.4,0,.4]){g.save();g.translate(-12,0);g.rotate(Math.PI+a);ell(g,0,-5,2.2,6,'#7fcf6a',O_,1.2);g.restore()}g.restore();break}
    case'mage':{ // 양파 지팡이
      g.fillStyle='#7a4a24';g.fillRect(-2,-30,4,40);g.strokeStyle=O_;g.lineWidth=1.6;g.strokeRect(-2,-30,4,40);
      const gl=g.createRadialGradient(0,-38,2,0,-38,18);gl.addColorStop(0,'rgba(180,140,255,.7)');gl.addColorStop(1,'rgba(180,140,255,0)');g.fillStyle=gl;g.fillRect(-20,-58,40,40);
      g.beginPath();g.moveTo(0,-48);g.bezierCurveTo(6,-44,10,-38,9,-34);g.bezierCurveTo(8,-29,-8,-29,-9,-34);g.bezierCurveTo(-10,-38,-6,-44,0,-48);g.fillStyle='#e0a860';g.fill();g.lineWidth=1.8;g.strokeStyle=O_;g.stroke();
      ell(g,0,-50,1.6,4,'#6fc85a',O_,1);circ(g,0,-36,2.6,'#e8d8ff');break}
    case'fighter':{ // 고추 너클
      g.save();g.rotate(.2);g.beginPath();g.ellipse(0,0,7.5,6,0,0,6.28);g.fillStyle='#e02a2a';g.fill();g.lineWidth=1.8;g.strokeStyle=O_;g.stroke();
      ell(g,-6,-3,3,2,'#3fae49',O_,1.2);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(-2,-4,5,1.8);g.restore();
      if(st==='atk'||st==='skill'){g.globalAlpha*=.6;circ(g,6,0,5,'#ffb040');g.globalAlpha/=.6}break}
    case'rogue':{ // 가지 단검
      g.fillStyle='#3a2a1a';g.fillRect(-2,-1,4,9);poly(g,[-5,-2,5,-2,4,-4,-4,-4],'#3fae49',O_,1.4);
      g.beginPath();g.moveTo(-3.5,-4);g.quadraticCurveTo(-5,-18,0,-26);g.quadraticCurveTo(5,-18,3.5,-4);g.closePath();
      const gr=g.createLinearGradient(-4,-26,4,-4);gr.addColorStop(0,'#b07ae0');gr.addColorStop(1,'#4a2478');g.fillStyle=gr;g.fill();g.lineWidth=1.6;g.strokeStyle=O_;g.stroke();break}
    case'gunner':{ // 옥수수 총
      g.save();g.rotate(Math.PI/2);
      g.fillStyle='#8a5a2a';g.beginPath();g.roundRect(-3,-2,7,10,2);g.fill();g.strokeStyle=O_;g.lineWidth=1.6;g.stroke();
      ell(g,0,-12,6,13,'#ffd83a',O_,1.8);g.strokeStyle='rgba(190,130,0,.55)';g.lineWidth=.9;for(let i=-20;i<=-4;i+=4){g.beginPath();g.moveTo(-5,i);g.lineTo(5,i);g.stroke()}
      for(const s of[-1,1])ell(g,s*5,-4,3,8,'#6fc85a',O_,1.2);g.restore();break}
    case'priest':{ // 마늘 완드
      g.fillStyle='#d8c890';g.fillRect(-1.8,-24,3.6,30);g.strokeStyle=O_;g.lineWidth=1.4;g.strokeRect(-1.8,-24,3.6,30);
      g.beginPath();g.moveTo(0,-38);g.bezierCurveTo(5,-34,10,-30,9,-25);g.bezierCurveTo(8,-20,-8,-20,-9,-25);g.bezierCurveTo(-10,-30,-5,-34,0,-38);g.fillStyle='#fffaf0';g.fill();g.lineWidth=1.8;g.strokeStyle=O_;g.stroke();
      if(Math.sin(t*5)>0){g.fillStyle='#fff3a0';g.font='bold 9px sans-serif';g.fillText('✦',7,-38)}break}
  }
}
function drawVeggie(g,c,o){
  const t=o.t||0,st=o.st||'idle',face=o.face||1,ap=o.ap||0,sc=.98*(o.sc||1);
  g.save();g.translate(o.x,o.y);g.scale(face*sc,sc);
  if(o.alpha!==undefined)g.globalAlpha=o.alpha;
  const ph=t*14,run=st==='run',shirt=c.col,shirtD=shade(c.col,-40),pants=c.short;
  const bob=st==='idle'?Math.sin(t*3.2)*1:run?-Math.abs(Math.sin(ph))*2.2:0;
  if(o.buff){const a=.35+.15*Math.sin(t*8),gl=g.createRadialGradient(0,-40,6,0,-40,58);gl.addColorStop(0,`rgba(255,220,60,${a+.2})`);gl.addColorStop(1,'rgba(255,160,0,0)');g.fillStyle=gl;g.fillRect(-60,-100,120,130)}
  if(o.tier>=2){const a=.22+.08*Math.sin(t*5),cc=o.tier>=3?'255,215,80':'210,235,255',gl=g.createRadialGradient(0,-40,8,0,-40,54);gl.addColorStop(0,`rgba(${cc},${a})`);gl.addColorStop(1,`rgba(${cc},0)`);g.fillStyle=gl;g.fillRect(-60,-100,120,130)}
  if(o.eq&&o.eq.aura){const ac=ITEMS[o.eq.aura].col,gl=g.createRadialGradient(0,-38,6,0,-38,58);gl.addColorStop(0,ac+'55');gl.addColorStop(1,ac+'00');g.fillStyle=gl;g.fillRect(-60,-100,120,130)}
  ell(g,0,0,13,3,'rgba(0,0,0,.18)');
  // 포즈
  let lf=[5,0],lb=[-5,0];
  if(st==='air'){lf=[7,-7];lb=[-4,-3]}
  else if(run){lf=[Math.sin(ph)*8,-Math.max(0,Math.cos(ph))*5];lb=[-Math.sin(ph)*8,-Math.max(0,-Math.cos(ph))*5]}
  else if(st==='climb'){const s=Math.sin(t*10)*4;lf=[3,-4+s];lb=[-3,-4-s]}
  const sy=-37+bob,hip=-19+bob*.5;
  let hf,hb,wa=-.55;
  if(st==='skill'){hf=[15,-50];hb=[-15,-50];wa=-1.2}
  else if(run){const sw=Math.sin(ph)*9;hf=[6+sw,-24];hb=[-6-sw,-24];wa=-.25}
  else if(st==='air'){hf=[14,-46];hb=[-14,-44];wa=-1}
  else if(st==='climb'){const s=Math.sin(t*10)*6;hf=[7,-50+s];hb=[-7,-50-s]}
  else if(st==='hurt'){hf=[16,-30];hb=[-16,-32];wa=.6}
  else{hf=[12,-23+bob];hb=[-12,-23+bob]}
  let pz=null;
  if(st==='atk'){pz=atkPose(c,ap,o.combo|0);hf=pz.hf;hb=pz.hb;wa=pz.wa}
  else if(st==='skill'){const k=clamp(o.sk||0,0,1);pz={lean:-.1+Math.sin(k*Math.PI)*.04,lx:0,crouch:Math.sin(k*Math.PI)*3}}
  if(pz){g.translate(pz.lx||0,hip+(pz.crouch||0));g.rotate(pz.lean||0);g.translate(0,-hip)}
  // 망토 (옛 몸통 좌표 → 새 몸통)
  const oldT=f=>{g.save();g.translate(0,sy+12-(-50)*.6+bob*0);g.scale(.55,.6);f();g.restore()};
  if(o.eq&&o.eq.cape)oldT(()=>drawCape(g,o.eq.cape,t,st,-50));
  // 뒷팔 · 다리
  limb(g,-8,sy+2,hb[0],hb[1],7,shirtD);circ(g,hb[0],hb[1],4.4,SKIN2C,O_,1.8);
  limb(g,-4,hip,lb[0],lb[1]-4,7.5,shade(pants,-25));ell(g,lb[0]+1,lb[1]-2,6,3.4,c.shoe,O_,1.6);
  limb(g,4,hip,lf[0],lf[1]-4,7.5,pants);ell(g,lf[0]+2,lf[1]-2,6,3.4,c.shoe,O_,1.6);
  // 몸통 (셔츠 + 벨트)
  g.beginPath();g.moveTo(-11,sy);g.quadraticCurveTo(0,sy-4,11,sy);g.lineTo(12,hip+2);g.quadraticCurveTo(0,hip+5,-12,hip+2);g.closePath();
  g.fillStyle=shirt;g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();
  g.fillStyle='rgba(255,255,255,.22)';g.fillRect(-8,sy+2,4,12);
  poly(g,[-5,sy-1,0,sy+5,5,sy-1],'#fff',O_,1.2);
  g.fillStyle=c.band;g.fillRect(-12,hip-3,24,4);g.strokeStyle=O_;g.lineWidth=1.4;g.strokeRect(-12,hip-3,24,4);circ(g,0,hip-1,2,'#fff3a0',O_,1);
  if(o.eq&&o.eq.outfit)oldT(()=>drawOutfit(g,o.eq.outfit,-50));
  // 앞팔 + 무기
  limb(g,8,sy+2,hf[0],hf[1],7,shirt);
  if(pz&&pz.smear)drawSmear(g,c,pz,sy);
  if(st!=='climb'){g.save();g.translate(hf[0],hf[1]);g.rotate(wa);if(pz&&pz.bow!=null)g.bowPull=pz.bow;drawVegWeapon(g,c,t,st);g.restore()}
  circ(g,hf[0],hf[1],4.6,SKINC,O_,1.8);
  if(c.id==='fighter'&&st!=='climb'){g.save();g.translate(hb[0],hb[1]);drawVegWeapon(g,c,t,st);g.restore()}
  // 머리 (2등신)
  g.save();g.translate(0,sy-21);g.rotate(st==='run'?Math.sin(ph)*.035:st==='hurt'?-.12:0);
  drawHumanHead(g,c,t,st,st==='hurt',o.fid);
  if(o.eq){g.save();g.translate(0,-3);g.scale(1.3,1.3);drawGear(g,c,o.eq,0,0,t);g.restore()}
  g.restore();
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
function drawEgg(g,e,t){ // 달걀 슬라임 (메이플풍)
  g.save();g.translate(e.x,e.y);

  const sq=e.vy<-50?1.15:e.vy>50?.88:1+Math.sin(t*6+e.x)*.05;
  g.scale(e.dir>0?1:-1,1);
  ell(g,0,-1,14,3.2,'rgba(0,0,0,.2)');
  g.save();g.scale(1/sq,sq);
  g.beginPath();g.moveTo(-17,0);g.bezierCurveTo(-19,-22,-9,-30,0,-30);g.bezierCurveTo(9,-30,19,-22,17,0);g.closePath();
  const gr=g.createLinearGradient(0,-30,0,0);gr.addColorStop(0,'#fff6a8');gr.addColorStop(1,'#ffcf3a');g.fillStyle=gr;g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();
  g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(-8,-21,3.4,5,.5,0,6.28);g.fill();
  // 달걀 껍질 모자
  g.beginPath();g.moveTo(-11,-24);g.bezierCurveTo(-12,-40,12,-40,11,-24);g.lineTo(7,-27);g.lineTo(3,-23);g.lineTo(-1,-27);g.lineTo(-5,-23);g.lineTo(-8,-27);g.closePath();g.fillStyle='#fffdf6';g.fill();g.lineWidth=1.8;g.stroke();
  g.restore();
  for(const s of[-1,1]){ell(g,s*5+2,-13,2.6,3.4,'#2a1a10');circ(g,s*5+2.8,-14.3,1,'#fff')}
  g.fillStyle='rgba(255,120,120,.5)';g.beginPath();g.ellipse(-6,-8,3,1.7,0,0,6.28);g.ellipse(11,-8,3,1.7,0,0,6.28);g.fill();
  g.strokeStyle=O_;g.lineWidth=1.4;g.beginPath();g.moveTo(0,-8);g.quadraticCurveTo(2.5,-5.5,5,-8);g.stroke();
  g.restore();
}
function drawWisp(g,e,t){ // 불꽃 요정
  g.save();g.translate(e.x,e.y);

  const gl=g.createRadialGradient(0,0,4,0,0,36);gl.addColorStop(0,e.col+'.55)');gl.addColorStop(1,e.col+'0)');g.fillStyle=gl;g.fillRect(-40,-40,80,80);
  const w=Math.sin(t*9+e.ph)*2.5;
  g.beginPath();g.moveTo(0,-26+w);g.bezierCurveTo(14,-10,17,2,0,13);g.bezierCurveTo(-17,2,-14,-10,0,-26+w);
  const gr=g.createLinearGradient(0,-26,0,13);gr.addColorStop(0,'#e8ffff');gr.addColorStop(.5,e.col2);gr.addColorStop(1,e.col3);
  g.fillStyle=gr;g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
  ell(g,-5,-1,3,4,'#101030');ell(g,5,-1,3,4,'#101030');circ(g,-4.2,-2.6,1.2,'#fff');circ(g,5.8,-2.6,1.2,'#fff');
  g.fillStyle='rgba(255,140,170,.55)';g.beginPath();g.ellipse(-8,4,2.6,1.6,0,0,6.28);g.ellipse(8,4,2.6,1.6,0,0,6.28);g.fill();
  g.strokeStyle='#101030';g.lineWidth=1.4;g.beginPath();g.arc(0,4,2.2,.2,2.9);g.stroke();
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
