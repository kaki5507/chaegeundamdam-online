/* ============================================================
   POLISH : 메이플풍(오리지널) 퀄리티 개편
   타일 · 배경(둥근 나무/언덕/뭉게구름) · 소용돌이 포탈 · 하단 상태바 · 미니맵
   데미지 숫자 · 이름표 · 신규 몬스터 4종 · 레벨업 연출
   ============================================================ */
/* ---------- 배경 (레이어 종류 확장) ---------- */
function buildBG(name){
  const T=THEMES[name],r=mulberry(name.length*97+3);
  const sky=mk(W,H),g=sky.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,H);T.sky.forEach((c,i)=>gr.addColorStop(i/(T.sky.length-1),c));g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<160;i++){g.globalAlpha=.2+r()*.7;g.fillStyle='#fff';const s=r()<.1?2:1;g.fillRect(r()*W,r()*H*.6,s,s)}g.globalAlpha=1;
  const m=T.moon,mx=m.x*W,my=m.y*H;
  const rg=g.createRadialGradient(mx,my,m.r*.4,mx,my,m.r*3.4);rg.addColorStop(0,m.glow+'.55)');rg.addColorStop(1,m.glow+'0)');g.fillStyle=rg;g.fillRect(0,0,W,H);
  const mg=g.createRadialGradient(mx-m.r*.3,my-m.r*.3,m.r*.1,mx,my,m.r);mg.addColorStop(0,'#ffffff');mg.addColorStop(1,m.c);g.fillStyle=mg;g.beginPath();g.arc(mx,my,m.r,0,6.2832);g.fill();
  // 하늘 뭉게구름 띠
  {const cl=mk(W,H),cq=cl.getContext('2d');for(let k=0;k<6;k++){const cx=r()*W,cy=H*(.18+r()*.3),s=40+r()*50;puff(cq,cx,cy,s,'#ffffff')}g.globalAlpha=.55;g.drawImage(cl,0,0);g.globalAlpha=1}
  const layers=T.layers.map(Ly=>{
    const c=mk(LW,LHT),q=c.getContext('2d');q.fillStyle=Ly.col;
    if(Ly.k==='ridge'){
      q.beginPath();q.moveTo(0,LHT);
      for(let x=0;x<=LW;x+=8){let y=0;Ly.cyc.forEach((k,i)=>{y+=Math.sin(x/LW*6.2832*k+i*1.7)*Ly.amp/(i+1.3)});q.lineTo(x,LHT-130+y*.9)}
      q.lineTo(LW,LHT);q.fill();
      // 능선 하이라이트
      q.globalAlpha=.18;q.strokeStyle='#fff';q.lineWidth=3;q.beginPath();for(let x=0;x<=LW;x+=8){let y=0;Ly.cyc.forEach((k,i)=>{y+=Math.sin(x/LW*6.2832*k+i*1.7)*Ly.amp/(i+1.3)});x?q.lineTo(x,LHT-129+y*.9):q.moveTo(x,LHT-129+y*.9)}q.stroke();q.globalAlpha=1;
    }else if(Ly.k==='pines'){ // 둥근 나무 숲 (몽글몽글)
      for(let i=0;i<Ly.n;i++){
        const x=(i+.2+r()*.6)*LW/Ly.n,h=lerp(Ly.hh[0],Ly.hh[1],r()),R=h*.32;
        q.fillRect(x-4,LHT-h*.45,8,h*.45);
        for(const[dx,dy,rr]of[[0,-h*.62,R],[-R*.7,-h*.45,R*.8],[R*.7,-h*.47,R*.78],[0,-h*.82,R*.7]])q.beginPath(),q.arc(x+dx,LHT+dy,rr,0,6.2832),q.fill();
        q.globalAlpha=.16;q.fillStyle='#fff';q.beginPath();q.arc(x-R*.35,LHT-h*.75,R*.4,0,6.2832);q.fill();q.globalAlpha=1;q.fillStyle=Ly.col;
      }
      q.fillRect(0,LHT-30,LW,30);
    }else if(Ly.k==='clouds'){
      for(let k=0;k<14;k++){const cx=r()*LW,cy=LHT-80-r()*110,s=40+r()*60;for(const o of[-LW,0,LW])puff(q,cx+o,cy,s,Ly.col)}
      q.fillRect(0,LHT-60,LW,60);
    }else if(Ly.k==='islands'){
      for(let k=0;k<5;k++){
        const cx=(k+.3+r()*.4)*LW/5,cy=LHT-150-r()*90,rx=70+r()*70,dp=60+r()*70;
        q.beginPath();q.ellipse(cx,cy,rx,14,0,0,6.2832);q.fill();
        poly(q,[cx-rx,cy,cx+rx,cy,cx+rx*.3,cy+dp,cx-rx*.2,cy+dp*.8],Ly.col);
        for(let j=0;j<3;j++){q.beginPath();q.arc(cx-rx*.5+j*rx*.5,cy-14-r()*10,14+r()*10,0,6.2832);q.fill()}
        q.globalAlpha=.25;q.fillStyle='#fff';q.fillRect(cx-3,cy+10,2,dp*.8);q.globalAlpha=1;q.fillStyle=Ly.col;
      }
    }else if(Ly.k==='gates'){ // 먼 마을 실루엣 (지붕 · 탑)
      for(let k=0;k<6;k++){const cx=(k+.5)*LW/6+(r()-.5)*60,hh=80+r()*90,w=50+r()*40;
        q.fillRect(cx-w/2,LHT-hh,w,hh);poly(q,[cx-w/2-10,LHT-hh,cx+w/2+10,LHT-hh,cx,LHT-hh-30-r()*20],Ly.col);
        if(r()<.5){q.fillRect(cx+w/2-8,LHT-hh-40,10,40)}}
      q.fillRect(0,LHT-24,LW,24);
    }
    return Object.assign({cv:c},Ly);
  });
  const dirt=mk(96,96),d=dirt.getContext('2d');
  d.fillStyle=T.dirt;d.fillRect(0,0,96,96);
  for(let i=0;i<70;i++){d.fillStyle=r()<.5?T.dirt2:'rgba(255,255,255,.08)';d.beginPath();d.arc(r()*96,r()*96,1+r()*2.5,0,6.28);d.fill()}
  for(let i=0;i<5;i++){const x=r()*96,y=r()*96;for(const[ox,oy]of[[0,0],[-96,0],[96,0],[0,-96],[0,96]]){ell(d,x+ox,y+oy,5+r()*5,3.5+r()*3,T.stone,T.dirt2,1.2);d.fillStyle='rgba(255,255,255,.3)';d.fillRect(x+ox-2,y+oy-2,3,1.5)}}
  return {sky,layers,dirt:ctx.createPattern(dirt,'repeat')};
}
const PUFF=[[0,0,.62],[-.6,.12,.45],[.6,.12,.48],[-.25,-.25,.42],[.3,-.2,.4],[-.3,.3,.4],[.3,.3,.4]];
function puff(q,cx,cy,s,col,line){if(line){q.fillStyle=line;for(const[dx,dy,rr]of PUFF){q.beginPath();q.arc(cx+dx*s,cy+dy*s,rr*s+1.8,0,6.2832);q.fill()}}q.fillStyle=col;for(const[dx,dy,rr]of PUFF){q.beginPath();q.arc(cx+dx*s,cy+dy*s,rr*s,0,6.2832);q.fill()}}

/* ---------- 타일 / 발판 ---------- */
function drawPlat(g,pl,T,bg,t){
  const {x,y,w,h}=pl;
  if(pl.t==='s'||pl.big){
    const hh=pl.big?70:h;
    g.fillStyle=bg.dirt;g.fillRect(x,y+6,w,hh-6);
    const sh=g.createLinearGradient(0,y,0,y+Math.min(hh,160));sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(.3,'rgba(40,10,60,.06)');sh.addColorStop(1,'rgba(40,10,60,.35)');g.fillStyle=sh;g.fillRect(x,y,w,Math.min(hh,160));
    // 잔디 둔덕 (둥근 가장자리)
    g.fillStyle=T.grass2;g.beginPath();g.moveTo(x,y+16);for(let xx=x;xx<=x+w;xx+=18)g.quadraticCurveTo(xx+9,y+22+hash(xx)*4,xx+18,y+16);g.lineTo(x+w,y);g.lineTo(x,y);g.closePath();g.fill();
    g.fillStyle=T.grass;g.fillRect(x,y,w,10);
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x,y,w,2.5);
    // 꽃 · 풀포기 (화면에 보이는 구간만)
    const s=Math.max(x,S?S.cam.x-40:x),e=Math.min(x+w,S?S.cam.x+W+40:x+w);
    for(let xx=Math.floor(s/23)*23;xx<e;xx+=23){const k=hash(xx*1.3);
      if(k>.72){const c=['#ffffff','#ffb8e0','#fff0a0','#b8e0ff'][(k*40|0)%4];for(let p=0;p<5;p++)circ(g,xx+Math.cos(p*1.256)*3,y-3+Math.sin(p*1.256)*3,2.2,c);circ(g,xx,y-3,1.6,'#ffc860')}
      else if(k>.4){g.fillStyle=T.grass;const sw=Math.sin(t*2+xx)*1.2;poly(g,[xx-3,y+1,xx+3,y+1,xx+sw,y-7-k*5]);poly(g,[xx+1,y+1,xx+6,y+1,xx+4+sw,y-5])}}
    g.strokeStyle='rgba(74,51,96,.55)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.stroke();
    return;
  }
  const cr=pl.crumble;let ox=0,oy=0;
  if(cr&&cr.timer>0&&!cr.fall){ox=Math.sin(t*90)*1.6}
  if(cr&&cr.fall){oy=cr.fy;g.globalAlpha=clamp(1-cr.fy/160,0,1)}
  g.save();g.translate(ox,oy);
  // 그림자
  g.fillStyle='rgba(40,20,70,.12)';g.beginPath();g.ellipse(x+w/2,y+30,w*.45,6,0,0,6.28);g.fill();
  // 떠 있는 흙 섬 (아랫면 둥글게)
  g.fillStyle=T.dirt;g.beginPath();g.moveTo(x+2,y+8);g.quadraticCurveTo(x+w*.15,y+24,x+w*.35,y+20);g.quadraticCurveTo(x+w*.5,y+30,x+w*.65,y+20);g.quadraticCurveTo(x+w*.85,y+24,x+w-2,y+8);g.closePath();g.fill();
  g.strokeStyle=O_;g.lineWidth=1.8;g.stroke();
  g.fillStyle='rgba(255,255,255,.12)';for(let xx=x+12;xx<x+w-10;xx+=26)g.fillRect(xx,y+12+hash(xx)*5,5,3);
  // 윗면 잔디 (둥근 캡)
  const top=g.createLinearGradient(0,y-2,0,y+12);top.addColorStop(0,T.grass);top.addColorStop(1,T.grass2);
  g.fillStyle=top;g.beginPath();g.roundRect(x-3,y-2,w+6,13,7);g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();
  g.fillStyle='rgba(255,255,255,.4)';g.fillRect(x+6,y,w-12,2);
  if(cr){g.strokeStyle='rgba(60,20,40,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(x+w*.3,y);g.lineTo(x+w*.36,y+10);g.lineTo(x+w*.32,y+18);g.moveTo(x+w*.7,y);g.lineTo(x+w*.64,y+12);g.stroke()}
  // 덩굴
  g.strokeStyle=T.grass2;g.lineWidth=2;for(let i=0;i<Math.max(1,w/90|0);i++){const xx=x+w*(.18+.64*hash(x+i*7)),L=14+hash(xx)*22;g.beginPath();g.moveTo(xx,y+10);g.quadraticCurveTo(xx+Math.sin(t*1.5+i)*4,y+10+L*.6,xx,y+10+L);g.stroke();circ(g,xx,y+10+L,2.4,T.grass)}
  g.restore();g.globalAlpha=1;
}

/* ---------- 포탈 : 빛의 소용돌이 ---------- */
function drawPortal(g,p,t){
  const x=p.x,y=p.y-46,ex=p.exit;
  const c1=ex?'255,190,120':'150,200,255',c2=ex?'255,140,190':'190,150,255';
  const gl=g.createRadialGradient(x,y,6,x,y,80);gl.addColorStop(0,`rgba(${c1},.6)`);gl.addColorStop(1,`rgba(${c1},0)`);g.fillStyle=gl;g.fillRect(x-80,y-80,160,160);
  g.save();g.translate(x,y);
  for(let i=0;i<5;i++){g.save();g.rotate(t*(1.6+i*.35)*(i%2?-1:1));g.strokeStyle=`rgba(${i%2?c2:c1},${.85-i*.13})`;g.lineWidth=3.2-i*.4;g.beginPath();g.ellipse(0,0,26-i*3,40-i*5,0,.3,5.6);g.stroke();g.restore()}
  const core=g.createRadialGradient(0,0,0,0,0,16);core.addColorStop(0,'#fff');core.addColorStop(1,`rgba(${c1},0)`);g.fillStyle=core;g.beginPath();g.ellipse(0,0,14,22,0,0,6.28);g.fill();
  for(let i=0;i<6;i++){const a=t*2+i*1.05,rr=30+Math.sin(t*3+i)*6;circ(g,Math.cos(a)*rr*.7,Math.sin(a)*rr,1.8,'#fff')}
  g.restore();
  ell(g,x,p.y-2,28,5,`rgba(${c1},.45)`);
  txt(g,'▲',x,y-52-Math.abs(Math.sin(t*4))*5,13,'#fff','center',2);
}

/* ---------- 하단 상태바 · 미니맵 (drawHUD 앞부분 대체) ---------- */
function drawStatusBar(g,t){
  const p=PARTY[0];if(!p)return;const j=JOB[p.job],y0=H-62;
  const bg=g.createLinearGradient(0,y0,0,H);bg.addColorStop(0,'rgba(86,62,150,.9)');bg.addColorStop(1,'rgba(48,32,96,.95)');
  g.fillStyle=bg;g.fillRect(0,y0,W,62);g.fillStyle='rgba(255,210,245,.8)';g.fillRect(0,y0,W,2);
  // 레벨 배지
  const lg=g.createRadialGradient(36,y0+26,4,36,y0+26,24);lg.addColorStop(0,'#fff6c8');lg.addColorStop(1,'#ffb84a');circ(g,36,y0+27,22,lg,O_,2.4);
  txt(g,'Lv',36,y0+18,10,'#7a3a00','center',0);txt(g,String(p.lvl),36,y0+38,18,'#5a2a00','center',0);
  txt(g,myName(),66,y0+23,14,'#fff','left',2);txt(g,jline(j,p.tier),66,y0+42,12,'#ffd6f4','left',2);
  if(SAVE.apFree>0)txt(g,'AP +'+SAVE.apFree+' (O)',66,y0+57,10,'#9cffb0','left',2);
  // HP / MP
  const gauge=(gx,gy,w,h,k,c1,c2,label,val)=>{g.fillStyle='rgba(20,10,40,.7)';g.beginPath();g.roundRect(gx,gy,w,h,h/2);g.fill();
    const gg=g.createLinearGradient(0,gy,0,gy+h);gg.addColorStop(0,c1);gg.addColorStop(1,c2);g.fillStyle=gg;g.beginPath();g.roundRect(gx+1.5,gy+1.5,Math.max(h-3,(w-3)*clamp(k,0,1)),h-3,(h-3)/2);g.fill();
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(gx+h/2,gy+2.5,(w-h)*clamp(k,0,1),2);
    txt(g,label,gx+8,gy+h-3.5,11,'#fff','left',2);txt(g,val,gx+w-8,gy+h-3.5,11,'#fff','right',2)};
  gauge(190,y0+10,270,18,p.hp/p.maxhp,p.hp<p.maxhp*.3?'#ff8a9a':'#ff7a8a','#e03a5a','HP',Math.ceil(p.hp)+' / '+p.maxhp);
  gauge(190,y0+33,270,18,p.mp/p.maxmp,'#8ad0ff','#3a7ae0','MP',Math.floor(p.mp)+' / '+p.maxmp);
  // 퀵슬롯
  const sw=44,x0=480;
  for(let i=0;i<7;i++){const x=x0+i*(sw+4),y=y0+9;
    g.fillStyle='rgba(20,10,40,.55)';g.beginPath();g.roundRect(x,y,sw,sw,10);g.fill();g.strokeStyle='rgba(255,210,245,.65)';g.lineWidth=1.5;g.stroke();
    if(i<5){const sk=j.sk[i],ul=unlocked(p,i),cd=p.cds[i];
      if(ul){const c=sk.col||j.col,cg=g.createRadialGradient(x+sw/2-4,y+sw/2-4,2,x+sw/2,y+sw/2,17);cg.addColorStop(0,'#fff');cg.addColorStop(1,c);circ(g,x+sw/2,y+sw/2,15,cg,O_,1.5);
        txt(g,sk.n.slice(0,2),x+sw/2,y+sw/2+4,10,'#3a2050','center',0)}
      else txt(g,SK_TIER[i]+'차',x+sw/2,y+sw/2+5,12,'#998','center',0);
      if(ul&&cd>0){g.save();g.beginPath();g.roundRect(x,y,sw,sw,10);g.clip();g.fillStyle='rgba(10,0,30,.6)';g.fillRect(x,y+sw*(1-cd/(sk.cd||1)),sw,sw);g.restore();txt(g,cd.toFixed(1),x+sw/2,y+sw/2+5,13,'#fff','center',3)}
      if(ul&&p.mp<sk.mp){g.fillStyle='rgba(40,80,200,.4)';g.beginPath();g.roundRect(x,y,sw,sw,10);g.fill()}
      txt(g,SK_LABEL[i],x+5,y+12,10,'#ffe9a0','left',2);
    }else{const k=i===5?'hp':'mp',c=i===5?'#ff6a8a':'#5a9aff';
      g.fillStyle=c;g.beginPath();g.roundRect(x+14,y+12,16,22,5);g.fill();g.strokeStyle=O_;g.lineWidth=1.5;g.stroke();g.fillStyle='#fff';g.fillRect(x+17,y+8,10,6);g.strokeRect(x+17,y+8,10,6);
      txt(g,String(i-4),x+5,y+12,10,'#ffe9a0','left',2);txt(g,'×'+SAVE.potions[k],x+sw-4,y+sw-4,11,'#fff','right',2)}
  }
  // 재화
  txt(g,'● '+SAVE.coins,W-10,y0+24,13,'#ffd34a','right',2);txt(g,'◆ '+SAVE.ec,W-10,y0+44,12,'#ff9ae0','right',2);
  // 경험치 (맨 아래)
  const ex=SAVE.lvl>=MAXLV?1:SAVE.exp/need(SAVE.lvl);
  g.fillStyle='rgba(10,0,30,.8)';g.fillRect(0,H-7,W,7);const eg=g.createLinearGradient(0,0,W,0);eg.addColorStop(0,'#fff3a0');eg.addColorStop(1,'#ffb84a');g.fillStyle=eg;g.fillRect(0,H-6,W*ex,5);
  txt(g,'EXP '+(SAVE.lvl>=MAXLV?'MAX':(ex*100).toFixed(2)+'%'),W-10,y0-4,11,'#fff3a0','right',3);
}
function drawMinimap(g,t){
  const L=S.L,mw=200,sc=Math.min(mw/L.w,64/Math.max(300,L.h)),mh=Math.max(40,Math.min(70,L.h*sc)),x0=10,y0=8;
  panel(g,x0,y0,mw+16,mh+34,.72);
  txt(g,L.name,x0+10,y0+19,13,'#ffe9a0','left',2);if(ONLINE_N)txt(g,'🟢'+ONLINE_N,x0+mw+8,y0+19,11,'#9cffb0','right',2);
  const ox=x0+8,oy=y0+26,ys=mh/Math.max(300,L.h);
  g.save();g.beginPath();g.rect(ox,oy,mw,mh);g.clip();g.fillStyle='rgba(20,10,50,.45)';g.fillRect(ox,oy,mw,mh);
  g.fillStyle='rgba(220,200,255,.7)';
  for(const pl of L.plats){const px=ox+pl.x*sc,py=oy+pl.y*ys;g.fillRect(px,py,Math.max(2,pl.w*sc),pl.t==='s'?3:2)}
  for(const po of L.portals)if(!po.hidden)circ(g,ox+po.x*sc,oy+(po.y-20)*ys,2.6,'#7ad0ff');
  for(const n of L.npcs||[])if(!n.hidden)circ(g,ox+n.x*sc,oy+(n.gy-10)*ys,2.2,'#7aff9a');
  for(const k in PEERS){const q=PEERS[k];if(q.tg.map===S.id)circ(g,ox+q.x*sc,oy+(q.y-10)*ys,2.4,'#ff8ad0')}
  for(const q of PARTY)if(q!==PARTY[0])circ(g,ox+q.x*sc,oy+(q.y-10)*ys,2.2,'#9be8ff');
  const p=PARTY[0];circ(g,ox+p.x*sc,oy+(p.y-10)*ys,3+Math.sin(t*6)*.6,'#ffe04a',O_,1);
  g.restore();
  return y0+mh+40;
}

/* ---------- 데미지 숫자 (메이플풍 · 오리지널 스타일) ---------- */
function drawDmgText(g,tx){
  const s=String(tx.txt),a=clamp(tx.life/tx.max*1.6,0,1),age=tx.max-tx.life,pop=age<.12?1.35-age*3:1;
  if(!/^\d+$/.test(s)){g.globalAlpha=a;txt(g,s,tx.x,tx.y,tx.size,tx.col,'center',4);g.globalAlpha=1;return}
  const crit=tx.size>=22,sz=tx.size*1.25*pop;
  g.save();g.globalAlpha=a;g.translate(tx.x,tx.y);g.rotate(crit?-.06:0);
  g.font=`${sz}px ${FONT}`;g.textAlign='center';g.lineJoin='round';
  g.lineWidth=sz*.28;g.strokeStyle=crit?'#5a1050':'#5a2a10';g.strokeText(s,0,0);
  const gr=g.createLinearGradient(0,-sz*.8,0,0);
  if(crit){gr.addColorStop(0,'#fff0ff');gr.addColorStop(.5,'#ff8ad8');gr.addColorStop(1,'#c040ff')}else{gr.addColorStop(0,'#fffbe0');gr.addColorStop(.5,'#ffd34a');gr.addColorStop(1,'#ff8a2a')}
  g.fillStyle=gr;g.fillText(s,0,0);
  if(crit){g.font=`${sz*.5}px ${FONT}`;g.fillStyle='#fff';g.fillText('✦',-g.measureText(s).width*1.2-6,-sz*.5)}
  g.restore();
}

/* ---------- 신규 몬스터 (오리지널) ---------- */
Object.assign(MOBS,{
  bunny:{n:'꽃잎 토끼',hp:26,dmg:10,exp:13,coin:[3,8],w:28,h:30},
  sheep:{n:'솜구름 양',hp:46,dmg:14,exp:20,coin:[5,12],w:36,h:32},
  jelly:{n:'별 해파리',hp:34,dmg:13,exp:17,coin:[4,10],w:30,h:34,fly:1},
  owl:{n:'달빛 부엉이',hp:40,dmg:15,exp:19,coin:[5,11],w:30,h:32,fly:1},
});
MOBS.wisp.fly=1;
const MOB_DRAW={
  bunny(g,m,t){g.save();g.translate(m.x,m.y);if(m.flash>0)g.globalAlpha=.6;g.scale(m.dir>0?1:-1,1);const sq=m.vy<-50?1.12:m.vy>50?.9:1+Math.sin(t*6+m.ph)*.04;
    ell(g,0,-1,13,3,'rgba(0,0,0,.18)');g.scale(1/sq,sq);
    for(const s of[-1,1]){g.save();g.translate(s*6,-24);g.rotate(s*.25+Math.sin(t*3+s)*.1);ell(g,0,-9,4.5,11,'#fff6fb',O_,1.8);ell(g,0,-9,2,7,'#ffb8d8');g.restore()}
    ell(g,0,-12,14,13,'#fff6fb',O_,2);ell(g,-12,-4,4,3,'#fff6fb',O_,1.5);
    for(const s of[-1,1]){ell(g,s*5+2,-14,2.2,2.8,'#3a2030');circ(g,s*5+2.6,-15,.8,'#fff')}
    ell(g,2,-9,1.6,1.2,'#ff8ab0');g.fillStyle='rgba(255,140,170,.5)';g.beginPath();g.ellipse(-5,-9,2.6,1.5,0,0,6.28);g.ellipse(10,-9,2.6,1.5,0,0,6.28);g.fill();
    for(let k=0;k<3;k++)circ(g,-6+k*5,-25+Math.sin(k)*2,2,['#ffb8e0','#fff0a0','#ffb8e0'][k],O_,.8);
    g.restore()},
  sheep(g,m,t){g.save();g.translate(m.x,m.y);if(m.flash>0)g.globalAlpha=.6;g.scale(m.dir>0?1:-1,1);
    ell(g,0,-1,16,3,'rgba(0,0,0,.18)');const st=Math.sin(t*8+m.ph)*2;
    for(const lx of[-9,-3,4,10]){g.fillStyle='#5a4a6a';g.fillRect(lx-1.5,-8,3,8+(lx%2?st:-st)*.3)}
    puff(g,0,-16,15,'#ffffff',O_);g.fillStyle='rgba(220,210,255,.5)';g.beginPath();g.arc(-4,-11,6,0,6.28);g.fill();
    ell(g,13,-18,7,8,'#e8dcf0',O_,1.8);ell(g,11,-25,4,2.5,'#fff',O_,1.2);
    circ(g,15,-19,1.6,'#2a1a30');circ(g,15.6,-19.6,.6,'#fff');g.fillStyle='rgba(255,140,180,.5)';g.beginPath();g.ellipse(16,-14,2,1.3,0,0,6.28);g.fill();
    g.restore()},
  jelly(g,m,t){g.save();g.translate(m.x,m.y);if(m.flash>0)g.globalAlpha=.6;const pul=1+Math.sin(t*4+m.ph)*.06;
    const gl=g.createRadialGradient(0,-4,2,0,-4,26);gl.addColorStop(0,'rgba(200,180,255,.5)');gl.addColorStop(1,'rgba(200,180,255,0)');g.fillStyle=gl;g.fillRect(-26,-30,52,52);
    g.save();g.scale(pul,1/pul);g.beginPath();g.moveTo(-14,0);g.bezierCurveTo(-16,-22,16,-22,14,0);g.closePath();const bg=g.createLinearGradient(0,-20,0,0);bg.addColorStop(0,'#f4e8ff');bg.addColorStop(1,'#b8a0ff');g.fillStyle=bg;g.fill();g.strokeStyle=O_;g.lineWidth=1.8;g.stroke();g.restore();
    g.strokeStyle='rgba(180,150,255,.8)';g.lineWidth=2;for(let k=0;k<4;k++){const x=-9+k*6;g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+Math.sin(t*5+k)*4,8,x+Math.sin(t*4+k)*3,16);g.stroke()}
    poly(g,[0,-17,1.5,-13,5,-12,2,-10,3,-6,0,-8,-3,-6,-2,-10,-5,-12,-1.5,-13],'#fff6a0',O_,.8);
    for(const s of[-1,1])circ(g,s*5,-5,1.6,'#3a2050');g.restore()},
  owl(g,m,t){g.save();g.translate(m.x,m.y);if(m.flash>0)g.globalAlpha=.6;const fl=Math.sin(t*12+m.ph);
    for(const s of[-1,1]){g.save();g.translate(s*12,-6);g.rotate(s*(.3+fl*.4));ell(g,s*6,0,9,5,'#8a7ab8',O_,1.5);g.restore()}
    ell(g,0,-6,13,15,'#a898d8',O_,2);ell(g,0,-1,8,9,'#e8e0ff');
    for(const s of[-1,1]){circ(g,s*5.5,-11,5,'#fff',O_,1.4);circ(g,s*5.5,-11,2.6,'#ffd34a');circ(g,s*5.5,-11,1.3,'#2a1a30');poly(g,[s*3,-20,s*10,-23,s*8,-17],'#a898d8',O_,1.2)}
    poly(g,[-2,-7,2,-7,0,-4],'#ffb040',O_,1);circ(g,9,-24,2,'#fff6c8');g.restore()},
};
const HUNT_MOBS=[['bunny','egg'],['bunny','egg','wisp'],['sheep','sheep','jelly'],['jelly','owl','sheep'],['owl','jelly','sheep']];
const _buildHunt=buildHunt;
buildHunt=function(i){const L=_buildHunt(i),ty=HUNT_MOBS[i];let gi=0,fi=0;const gr=ty.filter(k=>!MOBS[k].fly),fl=ty.filter(k=>MOBS[k].fly).concat(['wisp']);
  for(const m of L.mobs){if(m[0]==='egg')m[0]=gr[(gi++)%gr.length];else m[0]=fl[(fi++)%fl.length]}return L};
HUNTS.forEach((h,i)=>{MAPS[h.id]=()=>buildHunt(i)});
function spawnTpl(i){
  const L=S.L,m=L.mobs[i];if(!m)return null;let mob;const hue=L.mhue&&['egg','wisp','baby'].includes(m[0])?{hue:L.mhue}:{};
  const fire=Object.assign(L.theme==='lava'?{col:'rgba(255,140,60,',col2:'#ff9a40',col3:'#c03010'}:{},hue);
  if(MOBS[m[0]]&&MOBS[m[0]].fly)mob=spawnMob(m[0],m[1],m[2],Object.assign({range:m[3]},fire));
  else mob=spawnMob(m[0],m[1],m[2],Object.assign({min:m[3],max:m[4]},hue));
  if(mob)mob.tpl=i;return mob;
}

/* ---------- 레벨업 연출 ---------- */
const _gainExp=gainExp;
gainExp=function(n,mob){const lv=SAVE.lvl;_gainExp(n,mob);if(SAVE.lvl>lv&&PARTY[0]){const p=PARTY[0];
  for(let k=0;k<4;k++)fxPush({k:'ring',x:p.x,y:p.y-18,col:'#ffe04a',max:.8,delay:k*.12,r:90+k*30});
  fxPush({k:'pillar',x:p.x,y:p.y,col:'#ffe680',max:1.2});fxPush({k:'circle',x:p.x,y:p.y,col:'#ffd34a',max:1.2,r:60});
  G.bigBanner={t0:G.t,title:'✦ LEVEL UP ✦',sub:'Lv.'+SAVE.lvl+' 달성!  AP +5 (O 키)',col:'#ffe04a'}}};
