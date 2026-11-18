/* ============================================================
   PERF : 렉 줄이기
   · 필터(색조/번쩍임)는 몬스터 크기만 한 작은 캔버스에서만 적용 (화면 전체 필터 레이어 X)
   · 고해상도 폰은 픽셀 밀도 최대 2배, 느리면 자동으로 1.5 → 1.15 배로 낮추고 장식 효과 줄임
   ============================================================ */
const FOC=document.createElement('canvas'),FOX=FOC.getContext('2d');
function drawFiltered(g,filter,bx,by,bw,bh,fn){
  const m=g.getTransform(),X=Math.floor(m.a*bx+m.e),Y=Math.floor(m.d*by+m.f),w=Math.ceil(m.a*bw)+2,h=Math.ceil(m.d*bh)+2;
  if(w<=0||h<=0||w>2048||h>2048){fn(g);return}
  if(FOC.width<w)FOC.width=w;if(FOC.height<h)FOC.height=h;
  FOX.setTransform(1,0,0,1,0,0);FOX.clearRect(0,0,w,h);FOX.filter=filter||'none';
  FOX.setTransform(m.a,m.b,m.c,m.d,m.e-X,m.f-Y);fn(FOX);FOX.filter='none';
  g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(FOC,0,0,w,h,X,Y,w,h);g.restore();
}
// 대시 잔상 : 필터 없이 반투명만
drawTrails=function(g,t){
  for(const p of PARTY){if(!p.trail||!p.trail.length)continue;const n=p.trail.length;
    p.trail.forEach((q,i)=>{if(G.lowFx&&i%2)return;g.save();g.globalAlpha=.06+i*.04;drawVeggie(g,JOB[p.job],{sc:WSC,fid:p.fid,x:q.x,y:q.y,face:q.f,t:p.t,st:q.st,eq:p.eq,tier:p.tier});g.restore()})}
};
// 보스 : 대비/채도 필터 제거, 색조만 작은 캔버스에서
{const _db=drawBoss;drawBoss=function(g,b,t){
  if(b.dead)return;
  const P=CanvasRenderingContext2D.prototype,d=Object.getOwnPropertyDescriptor(P,'filter');
  // 원래 함수가 g.filter 를 거는 순간을 무시하도록 이번 호출 동안만 막음
  let hue=b.hue||0;Object.defineProperty(g,'filter',{configurable:true,get(){return'none'},set(){}});
  try{if(hue){const r=rectOf(b);drawFiltered(g,'hue-rotate('+hue+'deg)',r.x-260,r.y-260,r.w+520,r.h+420,c=>{Object.defineProperty(c,'filter',{configurable:true,get(){return'none'},set(){}});try{_db(c,b,t)}finally{delete c.filter;c.filter='hue-rotate('+hue+'deg)'}})}else _db(g,b,t)}
  finally{delete g.filter;g.filter='none'}
}}

/* ---------- 자동 화질 조절 ---------- */
window.DPR_CAP=2;resize();
G.lowFx=0;let _pf={last:0,ema:16,slowT:0,fastT:0};
function perfTick(){
  const now=performance.now(),dt=_pf.last?now-_pf.last:16;_pf.last=now;if(dt>250||document.hidden)return;
  _pf.ema+=(dt-_pf.ema)*.05;
  if(_pf.ema>23){_pf.slowT+=dt;_pf.fastT=0}else if(_pf.ema<17.5){_pf.fastT+=dt;_pf.slowT=0}
  if(_pf.slowT>2500){_pf.slowT=0;
    if(window.DPR_CAP>1.5){window.DPR_CAP=1.5;resize()}else if(!G.lowFx){G.lowFx=1}else if(window.DPR_CAP>1.15){window.DPR_CAP=1.15;resize()}else if(G.lowFx<2){G.lowFx=2}}
  if(_pf.fastT>20000&&G.lowFx){_pf.fastT=0;G.lowFx=Math.max(0,G.lowFx-1)}
}
{const _r=render;render=function(){perfTick();_r()}}
// 장식 효과 줄이기


setInterval(()=>{const cap=G.lowFx?90:220;if(parts.length>cap)parts.splice(0,parts.length-cap)},250);

/* ---------- 배경 : 낮은 해상도 캔버스에 그려 한 번에 붙이기 (카메라가 움직일 때만 다시 그림) ---------- */
const BGO=document.createElement('canvas'),BGX=BGO.getContext('2d');let _bgKey='';
{const _dbg=drawBG;drawBG=function(g,bg,cx,cy,mx){
  if(G.state!=='play'&&G.state!=='over'){return _dbg(g,bg,cx,cy,mx)}
  const q=G.lowFx?.42:.6,w=Math.ceil(W*SC*q),h=Math.ceil(H*SC*q);
  if(BGO.width!==w||BGO.height!==h){BGO.width=w;BGO.height=h;_bgKey=''}
  const anim=S&&S.L&&S.L.landmark&&/tower|windmill|bell|volcano|alley/.test(S.L.landmark.k||'')||/gears|lavafall|crystal|garden|stars|sea/.test(S&&S.L&&S.L.landmark&&S.L.landmark.k||''),
    key=(S&&S.id)+'|'+Math.round(cx)+'|'+Math.round(cy)+'|'+mx+'|'+(anim?Math.floor(G.t*15):0);
  if(key!==_bgKey){_bgKey=key;BGX.setTransform(SC*q,0,0,SC*q,0,0);BGX.clearRect(0,0,W,H);_dbg(BGX,bg,cx,cy,mx)}
  g.drawImage(BGO,0,0,W,H);
}}

/* ---------- 몽환 효과 : 미리 구운 이미지로 ---------- */
const DFX={};
function dfxBake(boss){
  const c=document.createElement('canvas');c.width=W/2;c.height=H/2;const x=c.getContext('2d');x.scale(.5,.5);
  const vg=x.createRadialGradient(W/2,H/2,H*.38,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,boss?'rgba(40,0,20,.55)':'rgba(120,90,190,.28)');x.fillStyle=vg;x.fillRect(0,0,W,H);
  const fog=x.createLinearGradient(0,H*.72,0,H);fog.addColorStop(0,'rgba(255,230,255,0)');fog.addColorStop(1,boss?'rgba(60,0,30,.2)':'rgba(255,225,250,.16)');x.fillStyle=fog;x.fillRect(0,H*.7,W,H*.3);
  return c;
}
function dfxRay(){const c=document.createElement('canvas');c.width=32;c.height=128;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'rgba(255,240,220,.10)');gr.addColorStop(1,'rgba(255,240,220,0)');x.fillStyle=gr;x.fillRect(0,0,32,128);return c}
function dfxDot(col){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,`rgba(${col},1)`);gr.addColorStop(.7,`rgba(${col},.5)`);gr.addColorStop(1,`rgba(${col},0)`);x.fillStyle=gr;x.fillRect(0,0,64,64);return c}
drawDreamFX=function(g,t,boss){
  if(G.lowFx>=2)return;
  const k=boss?'b':'n';DFX[k]=DFX[k]||dfxBake(boss);DFX.ray=DFX.ray||dfxRay();
  g.save();g.globalCompositeOperation='lighter';
  if(!boss&&!G.lowFx)for(let i=0;i<4;i++){const a=-.5+i*.18+Math.sin(t*.15+i)*.05;g.save();g.translate(W*(.15+i*.18),-20);g.rotate(a);g.drawImage(DFX.ray,-26-i*6,0,52+i*12,H*1.2);g.restore()}
  const step=G.lowFx?2:1;
  for(let i=0;i<BOKEH.length;i+=step){const b=BOKEH[i],y=(b.y-t*b.s)%(H+60),yy=y<-30?y+H+60:y,x=b.x+Math.sin(t*.4+b.ph)*24,a=.05+.05*Math.sin(t*1.3+b.ph),col=boss?'255,80,120':b.c;
    const s=DFX['d'+col]||(DFX['d'+col]=dfxDot(col));g.globalAlpha=Math.min(1,a*2);g.drawImage(s,x-b.r,yy-b.r,b.r*2,b.r*2)}
  g.restore();g.drawImage(DFX[k],0,0,W,H);
};

/* ---------- 색조가 다른 몬스터 : 몬스터마다 작은 그림을 2~3프레임에 한 번만 다시 그림 ---------- */
let _frameNo=0;{const _r=render;render=function(){_frameNo++;_r()}}
function drawHueMob(g,m,t,reuse){
  const sc=m.sc||1,bw=140*sc,bh=140*sc,ox=70*sc,oy=110*sc,px=Math.ceil(bw*SC),py=Math.ceil(bh*SC);
  let c=m._spr;if(!c||c.width!==px||c.height!==py){c=m._spr=document.createElement('canvas');c.width=px;c.height=py;m._sprF=-99}
  const every=G.lowFx?3:2;
  if(!reuse&&(_frameNo-m._sprF>=every||m._sprD!==m.dir)){m._sprF=_frameNo;m._sprD=m.dir;
    const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.clearRect(0,0,px,py);
    x.setTransform(SC,0,0,SC,(ox-m.x)*SC,(oy-m.y)*SC);mobArt(x,m,t);
    x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='hsla('+((m.hue+200)%360)+',85%,62%,.38)';x.fillRect(0,0,px,py);x.globalCompositeOperation='source-over';m._sprX=m.x;m._sprY=m.y}
  g.drawImage(c,m.x-ox,m.y-oy,bw,bh);
}

/* ---------- 고정 발판 : 512px 타일로 미리 그려두고 붙이기 ---------- */
const PT={L:null,sc:0,tiles:new Map(),stat:new Set(),drawing:false};
const TW=512;
function drawPlatTiles(g,L,T,bg,t){
  if(PT.L!==L||PT.sc!==SC){PT.L=L;PT.sc=SC;PT.tiles.clear();PT.stat=new Set(L.plats.filter(p=>!p.mv&&!p.crumble&&!p.moving&&!p.fallT))}
  const cam=S.cam,i0=Math.floor(cam.x/TW),i1=Math.floor((cam.x+W)/TW),th=L.h+140;
  for(let i=i0;i<=i1;i++){
    let c=PT.tiles.get(i);
    if(!c){c=document.createElement('canvas');c.width=Math.ceil(TW*SC);c.height=Math.ceil(th*SC);const x=c.getContext('2d');
      x.setTransform(SC,0,0,SC,-i*TW*SC,0);x.beginPath();x.rect(i*TW,0,TW,th);x.clip();PT.drawing=true;
      for(const pl of PT.stat)if(pl.x<(i+1)*TW+40&&pl.x+pl.w>i*TW-40)_drawPlatP(x,pl,T,bg,0);
      PT.drawing=false;PT.tiles.set(i,c);
      if(PT.tiles.size>6){for(const k of PT.tiles.keys())if(k<i0-1||k>i1+1){PT.tiles.delete(k);if(PT.tiles.size<=6)break}}}
    g.drawImage(c,i*TW,0,TW,th);
  }
}
const _drawPlatP=drawPlat;
drawPlat=function(g,pl,T,bg,t){if(!PT.drawing&&PT.stat.has(pl)&&PT.L===S.L)return;_drawPlatP(g,pl,T,bg,t)};

/* ---------- 이름표 : 글자 그림 캐시 ---------- */
const TAGC=new Map();
function tagSprite(s,size,col,bg,h,rad){
  const k=s+'|'+size+'|'+col+'|'+bg+'|'+SC+'|'+window.TSC;let c=TAGC.get(k);if(c)return c;
  const m=document.createElement('canvas').getContext('2d');m.font=F(size);const w=m.measureText(s).width+10;
  h=Math.round(h*Math.max(1,window.TSC/.86));c=document.createElement('canvas');c.width=Math.ceil(w*SC);c.height=Math.ceil(h*SC);const x=c.getContext('2d');x.scale(SC,SC);x.fillStyle=bg;x.beginPath();x.roundRect(0,0,w,h,rad);x.fill();txt(x,s,w/2,h-(h===15?3.5:3),size,col,'center',0);c.w=w;c.h=h;
  if(TAGC.size>400)TAGC.clear();TAGC.set(k,c);return c;
}
nameTag=function(g,x,y,s,col,bg){const c=tagSprite(String(s),11,col||'#fff',bg||'rgba(90,60,150,.75)',15,7);g.drawImage(c,x-c.w/2,y,c.w,c.h)};
drawRoleTag=function(g,n){const r=roleOf(n);if(!r)return;const c=tagSprite(r,10,'#8a4ac0','rgba(255,240,252,.9)',13,6);g.drawImage(c,n.x-c.w/2,n.gy+20,c.w,c.h)};

/* ---------- 캔버스 필터 완전 차단 : 안드로이드(갤럭시)에서 필터를 처음 쓸 때 몇 초씩 멈추는 문제 ---------- */
{const P=CanvasRenderingContext2D.prototype,d=Object.getOwnPropertyDescriptor(P,'filter');
  if(d)Object.defineProperty(P,'filter',{configurable:true,get(){return'none'},set(){}});}
