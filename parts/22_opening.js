/* ============================================================
   OPENING : 오프닝 연출(시네마틱 로고 → 화면을 눌러 시작) → 로그인 필수 → 캐릭터 화면
   이어하기/처음하기 메뉴 제거 · 게스트 플레이 없음 (file:// 로컬 개발 때만 오프라인 허용)
   ============================================================ */
const OFFLINE_DEV=location.protocol==='file:';
G.tph='intro';G.tt0=0;G.sel=0;
const OP_BIRDS=Array.from({length:7},(_,i)=>({x:Math.random()*W,y:60+Math.random()*140,s:20+Math.random()*30,ph:Math.random()*6}));
const OP_PETAL=Array.from({length:36},()=>({x:Math.random()*W,y:Math.random()*H,v:20+Math.random()*30,ph:Math.random()*6,c:['#ffd6f0','#fff6c0','#d8f0ff','#e6d8ff'][Math.random()*4|0]}));

/* ---------- 타이틀 진행 ---------- */
function charOpts(){return OFFLINE_DEV&&!ACCT?['start','new']:['start','logout']}
function titleStep(){
  if(document.getElementById('auth'))return;
  const el=G.t-G.tt0;
  if(G.tph==='intro'){
    if(el<.6)return;
    if(tap('ok')||pressed.Space||Object.keys(pressed).length&&el>1.2){initAudio();sfx('lvl');startMusic('town');goLogin()}
    return;
  }
  // 캐릭터 화면
  const opts=charOpts();
  if(tap('up')||tap('down')||tap('left')||tap('right')){G.sel=(G.sel+1)%opts.length;sfx('sel')}
  if(pressed.Escape){G.tph='intro';G.tt0=G.t;return}
  if(tap('ok')){
    const o=opts[G.sel];initAudio();
    if(o==='start'){if(loadGame()){continueGame();sfx('lvl')}else{G.state='select';G.jsel=0;sfx('sel');startMusic('field')}}
    else if(o==='new'){G.state='select';G.jsel=0;sfx('sel')}
    else if(o==='logout'){setAcct(null);CLOUD={};refreshMe();G.tph='intro';G.tt0=G.t;sfx('sel')}
  }
}
function goLogin(){
  if(ACCT){G.tph='char';G.sel=0;G.tt0=G.t;return}
  openAuth(()=>{if(ACCT||OFFLINE_DEV){G.tph='char';G.sel=0;G.tt0=G.t}else{G.tph='intro';G.tt0=G.t}});
}
// 캐릭터 화면 버튼 탭 위치
cv.addEventListener('pointerdown',e=>{
  if(G.state!=='title'||G.tph!=='char')return;const rc=cv.getBoundingClientRect(),x=(e.clientX-rc.left)*W/rc.width,y=(e.clientY-rc.top)*H/rc.height;
  charOpts().forEach((o,i)=>{const b=charBtn(i);if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)G.sel=i});
});
const charBtn=i=>({x:W/2+60,y:300+i*58,w:230,h:46});
// 캐릭터 선택에서 ESC → 캐릭터 화면
{const _ss=selectStep;selectStep=function(){if(pressed.Escape){G.state='title';G.tph='char';G.tt0=G.t;pressed={};return}_ss()}}

/* ---------- 로그인 창 : 게스트 없음 ---------- */
openAuth=function(onDone){
  if(document.getElementById('auth'))return;
  const inGame=G.state!=='title',d=document.createElement('div');d.id='auth';
  d.innerHTML=`<div class="box"><h2>${ACCT?'☁ 내 계정':'채근담담 ONLINE'}</h2>
   <p class="sub">${ACCT?'로그인됨: <b>'+ACCT.name+'</b>':'로그인하고 모험을 시작하세요<br><span style="font-size:12px">처음이라면 이름·비밀번호를 정하고 <b>회원가입</b>!</span>'}</p>
   ${ACCT?'':'<input id="a_n" placeholder="이름 (한글/영문/숫자 2~12자)" maxlength="12" autocomplete="username"><input id="a_p" type="password" placeholder="비밀번호 (4자 이상)" maxlength="64" autocomplete="current-password">'}
   <div class="msg" id="a_m"></div>
   <div class="row">${ACCT?'<button id="a_out">로그아웃</button><button id="a_x" class="g">닫기</button>':'<button id="a_in">로그인</button><button id="a_up">회원가입</button>'}</div>
   ${!ACCT&&!inGame?'<div class="row" style="margin-top:8px"><button id="a_back" class="g">← 처음 화면</button>'+(OFFLINE_DEV?'<button id="a_off" class="g">오프라인(개발)</button>':'')+'</div>':''}</div>`;
  document.body.appendChild(d);
  const $=i=>d.querySelector('#'+i),msg=t=>{$('a_m').textContent=t};
  const close=()=>{d.remove();pressed={};onDone&&onDone()};
  if(ACCT){$('a_x').onclick=close;$('a_out').onclick=()=>{setAcct(null);ISADMIN=false;d.remove();pressed={};if(inGame){try{saveGame()}catch(e){}}SAVE=null;S=null;PARTY=[];G.ui=null;G.state='title';G.tph='intro';G.tt0=G.t;startMusic('town')};return}
  if($('a_back'))$('a_back').onclick=()=>{d.remove();pressed={};G.tph='intro';G.tt0=G.t};
  if($('a_off'))$('a_off').onclick=close;
  const go=async kind=>{
    const name=$('a_n').value.trim(),password=$('a_p').value;
    if(!name||!password){msg('이름과 비밀번호를 입력하세요');return}
    msg('연결 중…');
    try{
      const o=await api('POST','/api/'+kind,{name,password});
      setAcct({name:o.name,token:o.token});const how=await syncAfterLogin();CLOUD={ok:true,at:Date.now()};refreshMe();
      msg(how==='server'?'어서 와요, '+o.name+'!':how==='guest'?'예전 게스트 기록을 계정으로 옮겼어요':'환영해요, '+o.name+'!');setTimeout(close,500);
    }catch(e){msg(e.message==='Failed to fetch'||e instanceof TypeError?'서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요':e.message)}
  };
  $('a_in').onclick=()=>go('login');$('a_up').onclick=()=>go('register');
  d.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go('login')}));
  setTimeout(()=>$('a_n').focus(),50);
};

/* ---------- 오프닝 화면 ---------- */
function opScene(g,t,el,dim){
  // 새벽 → 아침으로 밝아지는 하늘 (처음 3초)
  const dawn=Math.min(1,el/3);
  const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,dawn<1?'#3a2f7a':'#4a3a9a');sky.addColorStop(.4,'#8a6ad0');sky.addColorStop(.7,'#f2a8d8');sky.addColorStop(1,'#ffe2c8');
  g.fillStyle=sky;g.fillRect(0,0,W,H);
  // 해돋이
  const sy=H*.62-dawn*120,sg=g.createRadialGradient(W*.5,sy,10,W*.5,sy,260);sg.addColorStop(0,'rgba(255,248,220,.95)');sg.addColorStop(.25,'rgba(255,220,200,.5)');sg.addColorStop(1,'rgba(255,200,230,0)');
  g.fillStyle=sg;g.fillRect(0,0,W,H);circ(g,W*.5,sy,46,'#fffbea');
  for(let i=0;i<12;i++){const a=i/12*6.283+t*.05;g.strokeStyle=`rgba(255,250,220,${.08+.05*Math.sin(t+i)})`;g.lineWidth=18;g.beginPath();g.moveTo(W*.5+Math.cos(a)*60,sy+Math.sin(a)*60);g.lineTo(W*.5+Math.cos(a)*700,sy+Math.sin(a)*700);g.stroke()}
  // 먼 산호섬 실루엣 (패럴랙스로 천천히)
  const pan=Math.min(1,el/6)*120+t*4;
  for(const[base,col,amp,f]of[[.66,'rgba(160,120,210,.55)',40,.3],[.74,'rgba(200,150,220,.6)',30,.6]]){
    g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=20){const wx=x+pan*f;g.lineTo(x,H*base-Math.abs(Math.sin(wx*.006))*amp-Math.sin(wx*.017)*amp*.4)}g.lineTo(W,H);g.fill()}
  // 떠 있는 섬 + 폭포 + 큰 나무
  const isl=(ix,iy,w,sp,tree)=>{const y=iy+Math.sin(t*sp+ix)*5;
    g.fillStyle='rgba(110,80,160,.9)';g.beginPath();g.moveTo(ix-w/2,y);g.quadraticCurveTo(ix-w*.2,y+w*.5,ix,y+w*.55);g.quadraticCurveTo(ix+w*.2,y+w*.5,ix+w/2,y);g.closePath();g.fill();
    g.fillStyle='#a8e6b8';g.beginPath();g.ellipse(ix,y,w/2,13,0,0,6.28);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.fillRect(ix-w/2+12,y-6,w-24,3);
    for(let j=0;j<3;j++){g.fillStyle='rgba(210,235,255,.6)';g.fillRect(ix-w*.15+j*14,y+14,3,30+w*.15+Math.sin(t*3+j)*6)}
    if(tree){g.fillStyle='#9a6a4a';g.fillRect(ix-6,y-60,12,60);for(const[cx,cy,r]of[[0,-70,30],[-24,-58,22],[24,-58,22]])circ(g,ix+cx,y+cy,r,'#ffc8e8');circ(g,ix-6,y-80,10,'rgba(255,255,255,.5)')}};
  isl(130-pan*.25,260,160,.7,true);isl(W-140-pan*.15,230,190,1,true);isl(330+pan*.1,150,90,1.3,false);
  // 고래 구름 (하늘을 헤엄치는 큰 구름 고래)
  const wx=((el*28+200)%(W+500))-250,wy=110+Math.sin(t*.8)*10;
  g.save();g.translate(wx,wy);g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(0,0,90,34,0,0,6.28);g.fill();
  g.beginPath();g.moveTo(-80,0);g.quadraticCurveTo(-130,-30,-150,-10);g.quadraticCurveTo(-130,5,-150,22);g.quadraticCurveTo(-120,20,-80,8);g.fill();
  g.fillStyle='rgba(200,180,240,.6)';g.beginPath();g.ellipse(10,14,70,12,0,0,3.14);g.fill();circ(g,56,-6,4,'#6a4aa0');g.restore();
  // 새
  for(const b of OP_BIRDS){const x=(b.x+el*b.s)%(W+40)-20,y=b.y+Math.sin(t*2+b.ph)*6,f=Math.sin(t*10+b.ph)*5;g.strokeStyle='rgba(90,60,140,.7)';g.lineWidth=2;g.beginPath();g.moveTo(x-8,y-f);g.quadraticCurveTo(x-3,y-2,x,y);g.quadraticCurveTo(x+3,y-2,x+8,y-f);g.stroke()}
  // 앞쪽 큰 섬 (캐릭터 무대)
  const fy=440;g.fillStyle='rgba(100,70,150,.95)';g.beginPath();g.moveTo(80,fy);g.quadraticCurveTo(W/2,fy+260,W-80,fy);g.closePath();g.fill();
  g.fillStyle='#bdeec8';g.beginPath();g.ellipse(W/2,fy,W/2-80,20,0,0,6.28);g.fill();g.fillStyle='#d8f8dc';g.beginPath();g.ellipse(W/2,fy-4,W/2-110,10,0,0,6.28);g.fill();
  for(let i=0;i<14;i++){const x=120+i*52;circ(g,x,fy-8+Math.sin(i)*3,4,['#ffb8e0','#fff2a0','#bfe0ff'][i%3])}
  // 구름 바다
  for(let i=0;i<9;i++){const x=(i*130+t*12)%(W+220)-110;g.fillStyle='rgba(255,240,250,.7)';g.beginPath();g.ellipse(x,H-14+Math.sin(i)*8,120,36,0,0,6.28);g.fill()}
  // 꽃잎
  for(const p of OP_PETAL){const x=(p.x+Math.sin(t+p.ph)*30+t*12)%W,y=(p.y+t*p.v)%H;g.save();g.translate(x,y);g.rotate(t*2+p.ph);g.fillStyle=p.c;g.beginPath();g.ellipse(0,0,4,2.2,0,0,6.28);g.fill();g.restore()}
  if(dim){g.fillStyle=`rgba(30,16,60,${dim})`;g.fillRect(0,0,W,H)}
}
function opLogo(g,t,el,y0){
  const k=Math.min(1,Math.max(0,(el-.8)/.9)),bounce=k<1?Math.sin(k*Math.PI*2.5)*(1-k)*40:0,y=y0-(1-k)*220+bounce;if(k<=0)return;
  g.save();g.translate(W/2,y+Math.sin(t*1.6)*(k>=1?4:0));g.globalAlpha=Math.min(1,k*2);
  // 리본 배지
  g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(0,-14,250,80,0,0,6.28);g.fill();
  g.font='84px '+FONT;g.textAlign='center';g.lineJoin='round';
  g.shadowColor='rgba(255,170,230,.95)';g.shadowBlur=30;g.lineWidth=14;g.strokeStyle='#5a3a8a';g.strokeText('채근담담',0,0);g.shadowBlur=0;
  const lg=g.createLinearGradient(0,-70,0,10);lg.addColorStop(0,'#ffffff');lg.addColorStop(.5,'#ffd0f2');lg.addColorStop(1,'#a8e0ff');g.fillStyle=lg;g.fillText('채근담담',0,0);
  // 잎사귀 장식
  for(const s of[-1,1]){g.save();g.translate(s*190,-34);g.rotate(s*.5+Math.sin(t*2)*.08);g.fillStyle='#7ad87a';g.beginPath();g.ellipse(0,0,22,10,0,0,6.28);g.fill();g.strokeStyle='#4a9a4a';g.lineWidth=2;g.beginPath();g.moveTo(-18,0);g.lineTo(18,0);g.stroke();g.restore()}
  g.font='30px '+FONT;g.lineWidth=7;g.strokeStyle='#5a3a8a';g.strokeText('ONLINE',0,40);const og=g.createLinearGradient(-60,0,60,0);og.addColorStop(0,'#ffe46a');og.addColorStop(1,'#ffb86a');g.fillStyle=og;g.fillText('ONLINE',0,40);
  // 반짝임 쏟아짐 (로고 착지 순간)
  const sp=el-1.7;if(sp>0&&sp<1.2)for(let i=0;i<16;i++){const a=i/16*6.283,r=40+sp*220;g.globalAlpha=(1-sp/1.2);txt(g,'✦',Math.cos(a)*r,-20+Math.sin(a)*r*.5,12+(i%3)*4,'#fff6b0','center',0)}
  g.globalAlpha=1;for(let i=0;i<5;i++){const a=t*1.4+i*1.26;txt(g,'✧',Math.cos(a)*230,-20+Math.sin(a)*50,12+i%2*5,'#fffbe0','center',0)}
  g.restore();
}
const OP_FID=[1,3,11,9,13,4,7,19];
drawTitle=function(g,t){
  const el=G.t-G.tt0;
  if(G.tph==='intro'){
    opScene(g,t,el,0);
    // 캐릭터들이 양쪽에서 달려와 자리 잡기
    JOBS.forEach((j,i)=>{const tx=W/2-260+i*74,from=i<4?-60-i*50:W+60+(7-i)*50,k=Math.min(1,Math.max(0,(el-1.4-i*.08)/1.1)),e=1-Math.pow(1-k,3),x=from+(tx-from)*e;
      const run=k<1&&k>0,hop=k>=1?Math.abs(Math.sin(t*2+i))*0:0;
      drawVeggie(g,j,{x,y:432-hop,face:k<1?(i<4?1:-1):(i<4?1:-1),t:t+i,st:run?'run':'idle',fid:OP_FID[i],tier:i%3,sc:.95})});
    opLogo(g,t,el,150);
    drawDreamFX(g,t,false);
    // 영화처럼 위아래 검은 띠가 열린다
    const bar=Math.max(0,1-el/1.2)*H*.5;g.fillStyle='#120a24';g.fillRect(0,0,W,bar);g.fillRect(0,H-bar,W,bar);
    if(el>2.6){const a=.55+.45*Math.sin(t*4);g.globalAlpha=a;
      g.fillStyle='rgba(40,20,80,.55)';g.beginPath();g.roundRect(W/2-170,290,340,44,22);g.fill();txt(g,'▶  화면을 눌러 시작하세요  ◀',W/2,319,20,'#fff','center',3);g.globalAlpha=1;
      txt(g,'PRESS ANY KEY',W/2,352,13,'#fff2c0','center',3)}
    txt(g,'ⓒ 채근담담 온라인 · 모든 캐릭터와 세계는 창작물입니다',W/2,H-12,12,'rgba(255,255,255,.85)','center',3);
    txt(g,'v1.0',W-12,H-12,12,'rgba(255,255,255,.8)','right',3);
  }else{
    opScene(g,t,10,.35);opLogo(g,t,10,80);
    const sv=loadGame(),opts=charOpts();
    // 캐릭터 카드
    const cx=W/2-150,cy=410;g.save();const gl=g.createRadialGradient(cx,cy-60,10,cx,cy-60,150);gl.addColorStop(0,'rgba(255,230,250,.6)');gl.addColorStop(1,'rgba(255,230,250,0)');g.fillStyle=gl;g.fillRect(cx-150,cy-210,300,260);g.restore();
    g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(cx,cy+4,90,16,0,0,6.28);g.fill();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;g.stroke();
    if(sv){const j=JOB[sv.job];drawVeggie(g,j,{x:cx,y:cy,face:1,t,st:'idle',fid:sv.fid==null?3:sv.fid,tier:sv.tier||0,sc:1.7,eq:sv.eq||{}});
      panel(g,cx-130,cy+26,260,62,.75);txt(g,(ACCT?ACCT.name:'오프라인')+'  ·  Lv.'+sv.lvl,cx,cy+50,19,'#fff','center',3);txt(g,j.veg+' · '+jline(j,sv.tier||0),cx,cy+76,14,'#ffd6f4','center',2)}
    else{txt(g,'?',cx,cy-50,90,'rgba(255,255,255,.75)','center',4);panel(g,cx-130,cy+26,260,62,.75);txt(g,(ACCT?ACCT.name:'오프라인')+' 님',cx,cy+50,19,'#fff','center',3);txt(g,'아직 캐릭터가 없어요',cx,cy+76,14,'#ffd6f4','center',2)}
    const lab={start:sv?'▶ 게임 시작':'✦ 캐릭터 만들기',logout:'로그아웃',new:'새 캐릭터 (개발)'};
    opts.forEach((o,i)=>{const b=charBtn(i),sel=G.sel===i;g.save();g.shadowColor=sel?'rgba(255,190,240,.95)':'transparent';g.shadowBlur=sel?20:0;
      const bg=g.createLinearGradient(0,b.y,0,b.y+b.h);bg.addColorStop(0,sel?'#fff6fd':'rgba(255,255,255,.8)');bg.addColorStop(1,sel?(o==='start'?'#ffc4ec':'#e8dcff'):'rgba(235,220,255,.7)');
      g.fillStyle=bg;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,23);g.fill();g.restore();g.strokeStyle=sel?'#ff8ad0':'rgba(150,120,210,.6)';g.lineWidth=sel?3:2;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,23);g.stroke();
      txt(g,lab[o],b.x+b.w/2,b.y+31,o==='start'?22:17,sel?'#7a3a9a':'#5a4a8a','center',0)});
    txt(g,'Enter · 터치로 선택   ESC 처음 화면',W/2+175,H-16,13,'#fff','center',3);
    txt(g,ACCT?'☁ 클라우드 저장 '+(CLOUD.ok===false?'(연결 실패)':'ON'):'',14,H-16,13,'#fff','left',3);
    const fade=Math.max(0,1-(G.t-G.tt0)*3);if(fade){g.fillStyle=`rgba(255,255,255,${fade})`;g.fillRect(0,0,W,H)}
  }
  if(G.helpT)drawHelp(g);
};
