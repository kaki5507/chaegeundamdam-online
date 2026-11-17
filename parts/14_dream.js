/* ============================================================
   DREAM : 몽환 컨셉 — 피아노 BGM · 꿈결 연출 · 기괴한 보스 · 새 타이틀
   (모든 음악은 코드로 즉석 생성하는 오리지널 진행/선율)
   ============================================================ */
/* ---------- 아련한 피아노 BGM ---------- */
let REV=null,DLY=null;
function dreamAudio(){
  if(!AC||REV)return;
  // 리버브 : 감쇠 노이즈 임펄스
  const len=AC.sampleRate*3.2,buf=AC.createBuffer(2,len,AC.sampleRate);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
  REV=AC.createConvolver();REV.buffer=buf;const wet=AC.createGain();wet.gain.value=.55;REV.connect(wet);wet.connect(master);
  // 잔향 딜레이
  DLY=AC.createDelay(1);DLY.delayTime.value=.42;const fb=AC.createGain();fb.gain.value=.28;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2200;
  DLY.connect(lp);lp.connect(fb);fb.connect(DLY);lp.connect(REV);
}
function piano(f,dur,vol,delay=0,bright=1){
  if(!AC||muted)return;dreamAudio();
  const t0=AC.currentTime+delay,g=AC.createGain(),flt=AC.createBiquadFilter();
  flt.type='lowpass';flt.frequency.setValueAtTime(Math.min(9000,f*7*bright),t0);flt.frequency.exponentialRampToValueAtTime(Math.max(300,f*1.6),t0+dur);
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.006);g.gain.exponentialRampToValueAtTime(vol*.35,t0+.25);g.gain.exponentialRampToValueAtTime(.0008,t0+dur);
  for(const[m,v,tp]of[[1,1,'triangle'],[2,.28,'sine'],[3,.08,'sine'],[1.003,.35,'sine']]){const o=AC.createOscillator(),og=AC.createGain();o.type=tp;o.frequency.value=f*m;og.gain.value=v;o.connect(og);og.connect(flt);o.start(t0);o.stop(t0+dur+.05)}
  flt.connect(g);g.connect(musGain);g.connect(REV);if(DLY)g.connect(DLY);
}
const NOTE=n=>440*Math.pow(2,(n-69)/12);
// 테마별 화성 진행 (MIDI 음 목록) · 템포
const SONGS={
  field:{bpm:64,chords:[[53,60,64,69],[57,60,64,67],[50,57,60,65],[58,62,65,69],[53,60,64,69],[52,59,64,67],[50,57,60,65],[55,62,65,70]],scale:[0,2,4,7,9],root:65},
  sky:{bpm:58,chords:[[51,58,62,67],[48,55,58,63],[56,60,63,67],[58,62,65,70],[51,58,62,67],[55,58,62,67],[53,56,60,65],[58,62,65,68]],scale:[0,2,3,7,10],root:63},
  boss:{bpm:84,chords:[[38,50,53,57],[34,46,50,53],[43,50,55,58],[45,49,52,57],[38,50,53,56],[34,46,49,53],[43,50,55,57],[45,51,52,57]],scale:[0,1,3,6,7,10],root:62},
};
function startMusic(theme){
  MUS.theme=theme;MUS.want=true;stopMusic(true);if(!AC)return;dreamAudio();
  const S2=SONGS[theme==='boss'?'boss':theme==='sky'?'sky':'field'];MUS.song=S2;MUS.step=0;MUS.mel=2;
  MUS.timer=setInterval(()=>{try{musicStep()}catch(e){}},60000/S2.bpm/2);
}
function musicStep(){
  if(!AC||muted||G.paused)return;
  const S2=MUS.song;if(!S2)return;const s=MUS.step++,i=s%8,bar=Math.floor(s/8),ch=S2.chords[bar%S2.chords.length],boss=S2===SONGS.boss;
  // 왼손 : 넓게 펼친 아르페지오
  const arp=[0,1,2,3,2,1,2,3];
  if(i===0)piano(NOTE(ch[0]-12),3.6,boss?.12:.09,0,.6);
  piano(NOTE(ch[arp[i]]),boss?.9:2.4,boss?.05:.045,0,.8);
  // 오른손 : 느린 선율 (랜덤 워크, 4/8박 위주)
  const play=boss?(i%2===0&&Math.random()<.55):(i===0||i===3||(i===6&&Math.random()<.6)||(i===5&&Math.random()<.2));
  if(play){
    MUS.mel=clamp(MUS.mel+[-2,-1,-1,0,1,1,2][Math.random()*7|0],0,S2.scale.length*2-1);
    const deg=MUS.mel%S2.scale.length,oct=Math.floor(MUS.mel/S2.scale.length);
    let n=S2.root+12+S2.scale[deg]+oct*12;
    if(i===0&&!boss){const top=ch[3]+12;if(Math.abs(n-top)<5)n=top}
    piano(NOTE(n),boss?1.2:3.2,boss?.06:.07,0,1.2);
    if(!boss&&Math.random()<.25)piano(NOTE(n+12),2.8,.025,.02,1.5);            // 반짝이는 옥타브
  }
  if(boss){ // 기괴한 저음 · 불협 오르골
    if(i===0)tone(NOTE(ch[0]-24),2.2,'sawtooth',.02,-8,0,musGain);
    if(i===4&&Math.random()<.5)piano(NOTE(S2.root+30+(Math.random()<.5?6:1)),1.6,.03,0,2);
    if(i===2||i===6)noise(.08,.04,600,0,musGain);
  }else if(i===7&&bar%4===3)piano(NOTE(S2.root+36),3,.02,0,2);             // 꿈결 종소리
}

/* ---------- 꿈결 연출 (화면 공간) ---------- */
const BOKEH=Array.from({length:26},(_,i)=>({x:Math.random()*W,y:Math.random()*H,r:6+Math.random()*26,s:4+Math.random()*12,ph:Math.random()*6,c:['255,200,240','200,220,255','255,240,200','210,255,240'][i%4]}));
function drawDreamFX(g,t,boss){
  g.save();g.globalCompositeOperation='lighter';
  // 빛줄기
  if(!boss)for(let i=0;i<4;i++){const a=-.5+i*.18+Math.sin(t*.15+i)*.05,x0=W*(.15+i*.18);g.save();g.translate(x0,-20);g.rotate(a);
    const gr=g.createLinearGradient(0,0,0,H*1.1);gr.addColorStop(0,'rgba(255,240,220,.10)');gr.addColorStop(1,'rgba(255,240,220,0)');g.fillStyle=gr;g.fillRect(-26-i*6,0,52+i*12,H*1.2);g.restore()}
  // 보케
  for(const b of BOKEH){const y=(b.y-t*b.s)%(H+60);const yy=y<-30?y+H+60:y,x=b.x+Math.sin(t*.4+b.ph)*24,a=.05+.05*Math.sin(t*1.3+b.ph);
    const col=boss?'255,80,120':b.c,gr=g.createRadialGradient(x,yy,0,x,yy,b.r);gr.addColorStop(0,`rgba(${col},${a*2})`);gr.addColorStop(.7,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-b.r,yy-b.r,b.r*2,b.r*2)}
  g.restore();
  // 몽환 비네트 (라벤더) / 보스는 붉은 어둠
  const vg=g.createRadialGradient(W/2,H/2,H*.38,W/2,H/2,H*.95);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,boss?'rgba(40,0,20,.55)':'rgba(120,90,190,.28)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  const fog=g.createLinearGradient(0,H*.72,0,H);fog.addColorStop(0,'rgba(255,230,255,0)');fog.addColorStop(1,boss?'rgba(60,0,30,.2)':'rgba(255,225,250,.16)');g.fillStyle=fog;g.fillRect(0,H*.7,W,H*.3);
}

/* ---------- 기괴한 보스 ---------- */
function drawCreepBack(g,b,t){
  const r=rectOf(b),cx=r.x+r.w/2,cy=r.y+r.h/2;
  g.save();
  for(let i=0;i<9;i++){const a=i/9*6.283+t*.4,d=r.w*.55+Math.sin(t*2+i)*14,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d*.8,rr=26+Math.sin(t*3+i*2)*8;
    const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(20,0,20,.7)');gr.addColorStop(1,'rgba(20,0,20,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2)}
  // 촉수
  g.strokeStyle='rgba(30,6,30,.75)';g.lineCap='round';
  for(let i=0;i<6;i++){const s=i%2?1:-1,bx=cx+s*r.w*.3,by=r.y+r.h*.85;g.lineWidth=7-i*.6;g.beginPath();g.moveTo(bx,by);
    for(let k=1;k<=5;k++){g.lineTo(bx+s*k*14+Math.sin(t*3+i+k)*10,by-k*8+Math.cos(t*2.4+k+i)*8)}g.stroke()}
  g.restore();
}
function drawCreepFront(g,b,t){
  const r=rectOf(b),cx=r.x+r.w/2,lead=PARTY[0]||{x:cx,y:r.y};
  g.save();
  // 떠다니는 눈알들 (플레이어를 쳐다본다)
  const n=b.phase>1?7:4;
  for(let i=0;i<n;i++){const a=i/n*6.283+t*.6,x=cx+Math.cos(a)*(r.w*.7+20),y=r.y+r.h*.35+Math.sin(a*1.3)*r.h*.4,s=10+Math.sin(t*2+i)*2;
    const bl=Math.sin(t*1.1+i*2.3)>.93;ell(g,x,y,s+2,bl?1:s+1,'#f4ece0',O_,1.6);
    if(!bl){const ang=Math.atan2(lead.y-20-y,lead.x-x);circ(g,x+Math.cos(ang)*s*.45,y+Math.sin(ang)*s*.45,s*.5,'#b0102a');circ(g,x+Math.cos(ang)*s*.5,y+Math.sin(ang)*s*.5,s*.22,'#100')}}
  // 흘러내리는 검은 점액
  g.fillStyle='rgba(25,5,25,.8)';for(let i=0;i<5;i++){const x=r.x+r.w*(.15+i*.18),L=10+((t*20+i*13)%26);g.beginPath();g.moveTo(x-4,r.y+r.h*.25);g.quadraticCurveTo(x,r.y+r.h*.25+L*2,x+4,r.y+r.h*.25);g.fill();circ(g,x,r.y+r.h*.25+L*1.3,3,'rgba(25,5,25,.8)')}
  // 2페이즈 노이즈 글리치
  if(b.phase>1&&Math.random()<.18){g.globalAlpha=.35;g.fillStyle=Math.random()<.5?'#ff2a5a':'#2affe0';g.fillRect(r.x-20+Math.random()*20,r.y+Math.random()*r.h,r.w+40,3+Math.random()*6)}
  g.restore();
}

/* ---------- 몽환 타이틀 ---------- */
const TSTAR=Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H*.7,r:Math.random()*1.6+.3,ph:Math.random()*6}));
function drawTitle(g,t){
  // 하늘
  const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#2a1f6a');sky.addColorStop(.35,'#6a4ab8');sky.addColorStop(.65,'#e79ad0');sky.addColorStop(1,'#ffd8c8');
  g.fillStyle=sky;g.fillRect(0,0,W,H);
  for(const s of TSTAR){g.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.2+s.ph));circ(g,s.x,s.y,s.r,'#fff')}g.globalAlpha=1;
  // 커다란 고리 행성
  const px=W*.78,py=120;const pg=g.createRadialGradient(px-20,py-20,6,px,py,70);pg.addColorStop(0,'#fff4fb');pg.addColorStop(1,'#c8a4f0');circ(g,px,py,62,pg);
  g.save();g.translate(px,py);g.rotate(-.35);g.strokeStyle='rgba(255,240,255,.75)';g.lineWidth=5;g.beginPath();g.ellipse(0,0,110,22,0,Math.PI*.05,Math.PI*.95);g.stroke();g.restore();
  // 별똥별
  const k=(t*.35)%1;if(k<.25){const sx=W*.1+k*W*2.4,sy=60+k*200;g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx-60,sy-24);g.stroke()}
  // 떠 있는 섬들
  for(const[ix,iy,w,sp]of[[150,300,170,.7],[820,330,150,1],[480,420,560,0]]){const y=iy+Math.sin(t*sp+ix)*5;
    g.fillStyle='rgba(120,90,170,.8)';g.beginPath();g.moveTo(ix-w/2,y);g.quadraticCurveTo(ix,y+w*.45,ix+w/2,y);g.closePath();g.fill();
    g.fillStyle='#bdeec8';g.beginPath();g.ellipse(ix,y,w/2,12,0,0,6.28);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.fillRect(ix-w/2+10,y-6,w-20,3);
    if(sp)for(let j=0;j<3;j++){g.fillStyle='rgba(200,230,255,.55)';g.fillRect(ix-20+j*18,y+12,3,40+Math.sin(t*3+j)*6)}}
  // 구름 바다
  for(let i=0;i<8;i++){const x=(i*150+t*10)%(W+200)-100;g.fillStyle='rgba(255,240,250,.55)';g.beginPath();g.ellipse(x,H-30+Math.sin(i)*8,120,40,0,0,6.28);g.fill()}
  // 캐릭터들 (가운데 섬)
  JOBS.forEach((j,i)=>{const x=W/2-245+i*70;drawVeggie(g,j,{x,y:420+Math.sin(t*.7)*0,face:i<4?1:-1,t:t+i,st:'idle',fid:[1,3,11,9,13,4,7,19][i],tier:i%3,sc:.9})});
  drawDreamFX(g,t,false);
  // 로고
  g.save();g.translate(W/2,118+Math.sin(t*1.6)*4);
  g.font='72px '+FONT;g.textAlign='center';g.lineJoin='round';
  g.shadowColor='rgba(255,180,240,.9)';g.shadowBlur=24;g.lineWidth=12;g.strokeStyle='#5a3a8a';g.strokeText('채근담담',0,0);g.shadowBlur=0;
  const lg=g.createLinearGradient(0,-60,0,8);lg.addColorStop(0,'#ffffff');lg.addColorStop(.45,'#ffd6f4');lg.addColorStop(1,'#b8e6ff');g.fillStyle=lg;g.fillText('채근담담',0,0);
  g.font='26px '+FONT;g.lineWidth=6;g.strokeStyle='#5a3a8a';g.strokeText('ONLINE',0,34);g.fillStyle='#fff2a8';g.fillText('ONLINE',0,34);
  txt(g,'꿈결 같은 하늘섬에서, 야채 무기를 들고',0,66,17,'#fff','center',4);
  for(let i=0;i<5;i++){const a=t*1.5+i*1.26;txt(g,'✦',Math.cos(a)*190,-20+Math.sin(a)*40,14+i%2*4,'#fff7c0','center',0)}
  g.restore();
  // 메뉴
  const opts=titleOpts(),lab={cont:'이어하기',new:'새로 시작',help:'조작법',login:ACCT?'계정 · '+ACCT.name:'로그인 / 회원가입'};
  opts.forEach((o,i)=>{const y=212+i*50,sel=G.sel===i,w=sel?272:256,x=W/2-w/2;
    g.save();g.shadowColor=sel?'rgba(255,190,240,.9)':'rgba(0,0,0,0)';g.shadowBlur=sel?18:0;
    const bg=g.createLinearGradient(0,y,0,y+40);bg.addColorStop(0,sel?'#fff6fd':'rgba(255,255,255,.75)');bg.addColorStop(1,sel?'#ffd6f0':'rgba(240,225,255,.65)');
    g.fillStyle=bg;g.beginPath();g.roundRect(x,y,w,40,20);g.fill();g.restore();g.strokeStyle=sel?'#ff9ad8':'rgba(150,120,210,.6)';g.lineWidth=sel?3:2;g.beginPath();g.roundRect(x,y,w,40,20);g.stroke();
    txt(g,(sel?'♡ ':'')+lab[o]+(sel?' ♡':''),W/2,y+28,20,sel?'#7a3a9a':'#5a4a8a','center',0)});
  txt(g,'↑↓ 선택 · Enter 확인',W/2,H-14,14,'#fff','center',3);
  txt(g,ACCT?'☁ '+ACCT.name+' 님 · 클라우드 저장 '+(CLOUD.ok===false?'(연결 실패)':'ON'):'게스트 · 이 브라우저에만 저장돼요',W-14,H-14,13,'#fff','right',3);
  if(G.helpT)drawHelp(g);
}
