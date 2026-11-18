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
  const dawn=Math.min(1,el/3),pan=Math.min(1,el/6)*90+t*3;
  // 하늘 : 깊은 청록 → 금빛 지평선
  const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#123a5a');sky.addColorStop(.38,'#2f6f8a');sky.addColorStop(.62,'#d8b66a');sky.addColorStop(.78,'#f2d690');sky.addColorStop(1,'#f6e2a8');
  g.fillStyle=sky;g.fillRect(0,0,W,H);
  // 해 (지평선 위로 떠오름)
  const sy=H*.6-dawn*70,sx=W*.62,sg=g.createRadialGradient(sx,sy,8,sx,sy,300);sg.addColorStop(0,'rgba(255,246,210,.95)');sg.addColorStop(.18,'rgba(255,220,140,.55)');sg.addColorStop(1,'rgba(255,200,120,0)');
  g.fillStyle=sg;g.fillRect(0,0,W,H);circ(g,sx,sy,34,'#fff6dc');
  g.save();g.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const a=-2.6+i*.16+Math.sin(t*.2+i)*.02;g.strokeStyle=`rgba(255,230,160,${.05+.03*Math.sin(t+i)})`;g.lineWidth=26;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+Math.cos(a)*900,sy+Math.sin(a)*900);g.stroke()}g.restore();
  // 구름띠 (금빛 테두리)
  for(let i=0;i<6;i++){const x=((i*210+t*6+pan*.2)%(W+300))-150,y=70+(i%3)*42;g.fillStyle='rgba(240,236,220,.55)';g.beginPath();g.ellipse(x,y,110,18,0,0,6.28);g.ellipse(x+50,y-10,60,16,0,0,6.28);g.fill();g.fillStyle='rgba(255,214,140,.35)';g.beginPath();g.ellipse(x,y+8,100,6,0,0,6.28);g.fill()}
  // 먼 산맥 (푸른 안개) + 설산
  const ridge=(base,col,amp,f,seed)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=16){const wx=x+pan*f+seed;g.lineTo(x,H*base-Math.abs(Math.sin(wx*.004))*amp-Math.abs(Math.sin(wx*.011+1))*amp*.45)}g.lineTo(W,H);g.fill()};
  ridge(.6,'#5d7f96',120,.12,0);
  const mx=W*.28-pan*.12;g.fillStyle='#4d6f88';g.beginPath();g.moveTo(mx-200,H*.6);g.lineTo(mx,H*.6-230);g.lineTo(mx+220,H*.6);g.fill();
  g.fillStyle='#eef4f6';g.beginPath();g.moveTo(mx-52,H*.6-170);g.lineTo(mx,H*.6-230);g.lineTo(mx+56,H*.6-168);g.lineTo(mx+22,H*.6-180);g.lineTo(mx,H*.6-160);g.lineTo(mx-20,H*.6-178);g.closePath();g.fill();
  g.fillStyle='rgba(246,226,168,.25)';g.fillRect(0,H*.48,W,H*.2);   // 대기 원근
  ridge(.68,'#3f6a5a',70,.25,400);
  // 절벽 위 오래된 돌탑 유적
  const tx=W*.84-pan*.3,ty=H*.58;g.fillStyle='#2f5446';g.beginPath();g.moveTo(tx-120,H);g.lineTo(tx-90,ty);g.lineTo(tx+80,ty-10);g.lineTo(tx+130,H);g.fill();
  g.fillStyle='#8a8a78';g.fillRect(tx-22,ty-150,44,150);g.fillStyle='#6e6e60';g.fillRect(tx-30,ty-160,60,16);for(let i=0;i<4;i++){g.fillStyle='#6e6e60';g.fillRect(tx-30+i*17,ty-176,10,16)}
  g.fillStyle='#2a3a2a';g.beginPath();g.roundRect(tx-8,ty-120,16,24,[8,8,0,0]);g.fill();g.fillStyle='#4a7a3a';for(let i=0;i<5;i++){g.beginPath();g.ellipse(tx-20+i*10,ty-150+Math.sin(i)*30+i*20,8,4,.5,0,6.28);g.fill()}
  const fl=.5+.5*Math.sin(t*3);g.fillStyle=`rgba(255,220,120,${.5+fl*.4})`;g.beginPath();g.arc(tx,ty-108,4,0,6.28);g.fill();
  // 폭포 + 강
  const wfx=W*.12-pan*.35;g.fillStyle='#2a5a48';g.beginPath();g.moveTo(wfx-90,H);g.lineTo(wfx-70,H*.62);g.lineTo(wfx+60,H*.6);g.lineTo(wfx+90,H);g.fill();
  {const wg=g.createLinearGradient(0,H*.6,0,H*.82);wg.addColorStop(0,'rgba(200,232,245,.85)');wg.addColorStop(1,'rgba(200,232,245,.25)');g.fillStyle=wg;g.beginPath();g.moveTo(wfx+30,H*.6);g.lineTo(wfx+56,H*.6);g.lineTo(wfx+64,H*.82);g.lineTo(wfx+22,H*.82);g.fill();for(let i=0;i<7;i++){const k=(t*1.4+i/7)%1;g.fillStyle=`rgba(255,255,255,${.6-k*.5})`;g.fillRect(wfx+30+i*4+k*2,H*.6+k*110,2,22)}g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(wfx+43,H*.82,30,7,0,0,6.28);g.fill()}
  // 숲 실루엣 (뾰족한 침엽수 줄)
  const forest=(base,col,h,f,seed)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=-20;x<=W+20;x+=18){const wx=x+pan*f,hh=h*(.6+.4*Math.abs(Math.sin(wx*.07+seed)));const yb=H*base+Math.sin(wx*.01)*8;g.lineTo(x-9,yb);g.lineTo(x,yb-hh);g.lineTo(x+9,yb)}g.lineTo(W,H);g.fill()};
  forest(.75,'#2c5a3e',40,.4,1);
  // 굽이치는 강
  g.strokeStyle='rgba(160,210,220,.75)';g.lineWidth=10;g.beginPath();g.moveTo(-20,H*.8);g.bezierCurveTo(W*.3,H*.74,W*.45,H*.86,W*.7,H*.78);g.lineTo(W+20,H*.76);g.stroke();
  g.strokeStyle='rgba(255,240,200,.5)';g.lineWidth=2;g.stroke();
  forest(.84,'#1f4630',30,.6,3);
  // 새 떼
  for(const b of OP_BIRDS){const x=(b.x+el*b.s)%(W+40)-20,y=b.y*.8+Math.sin(t*2+b.ph)*6,f=Math.sin(t*10+b.ph)*5;g.strokeStyle='rgba(20,40,40,.75)';g.lineWidth=2;g.beginPath();g.moveTo(x-8,y-f);g.quadraticCurveTo(x-3,y-2,x,y);g.quadraticCurveTo(x+3,y-2,x+8,y-f);g.stroke()}
  // 앞쪽 풀밭 언덕 (캐릭터 무대) + 돌길 + 나무 표지판
  const fy=440;const hg=g.createLinearGradient(0,fy-20,0,H);hg.addColorStop(0,'#5fa34a');hg.addColorStop(1,'#2e6a32');
  g.fillStyle=hg;g.beginPath();g.moveTo(0,fy+10);g.quadraticCurveTo(W*.5,fy-34,W,fy+10);g.lineTo(W,H);g.lineTo(0,H);g.fill();
  g.fillStyle='#8a7a5a';for(let i=0;i<9;i++){g.beginPath();g.ellipse(W*.5+(i-4)*36,fy+30+Math.abs(i-4)*10,16,6,0,0,6.28);g.fill()}
  for(let i=0;i<60;i++){const x=i*16+(i%3)*4,y=fy-6+Math.abs(x-W/2)/W*40,sw=Math.sin(t*2+i*.7)*4;g.strokeStyle=i%2?'#4a8a3a':'#7ac05a';g.lineWidth=2;g.beginPath();g.moveTo(x,y+14);g.quadraticCurveTo(x+sw*.5,y+4,x+sw,y-6);g.stroke()}
  const spx=W-110,spy=fy+4;g.fillStyle='#6a4a2a';g.fillRect(spx-4,spy-56,8,56);g.beginPath();g.moveTo(spx-40,spy-58);g.lineTo(spx+34,spy-58);g.lineTo(spx+46,spy-48);g.lineTo(spx+34,spy-38);g.lineTo(spx-40,spy-38);g.closePath();g.fillStyle='#9a6e3e';g.fill();g.strokeStyle='#4a3018';g.lineWidth=2;g.stroke();txt(g,'모험 →',spx,spy-43,12,'#fff4d8','center',0);
  // 반딧불·금빛 꽃가루
  g.save();g.globalCompositeOperation='lighter';for(const p of OP_PETAL){const x=(p.x+Math.sin(t*.7+p.ph)*30+t*8)%W,y=H-((p.y*.6+t*p.v*.6)%(H*.8)),a=.35+.35*Math.sin(t*3+p.ph);g.fillStyle=`rgba(255,236,150,${a})`;g.beginPath();g.arc(x,y,2.2,0,6.28);g.fill();g.fillStyle=`rgba(255,236,150,${a*.25})`;g.beginPath();g.arc(x,y,6,0,6.28);g.fill()}g.restore();
  // 바람에 날리는 나뭇잎
  for(let i=0;i<10;i++){const r=mulberry(i*31+7),x=((r()*W)+t*60*(.5+r()))%(W+40)-20,y=(r()*H*.7+Math.sin(t+i)*20);g.save();g.translate(x,y);g.rotate(t*3+i);g.fillStyle=i%2?'#6ab04a':'#c8a040';g.beginPath();g.ellipse(0,0,5,2.4,0,0,6.28);g.fill();g.restore()}
  if(dim){g.fillStyle=`rgba(8,20,16,${dim})`;g.fillRect(0,0,W,H)}
}
function opLogo(g,t,el,y0){
  const k=Math.min(1,Math.max(0,(el-.8)/.9)),bounce=k<1?Math.sin(k*Math.PI*2.5)*(1-k)*30:0,y=y0-(1-k)*200+bounce;if(k<=0)return;
  g.save();g.translate(W/2,y);g.globalAlpha=Math.min(1,k*2);
  // 방패 모양 엠블럼 (나무·돌 느낌)
  g.save();g.translate(0,-20);g.beginPath();g.moveTo(-250,-62);g.lineTo(250,-62);g.lineTo(270,0);g.lineTo(250,62);g.lineTo(-250,62);g.lineTo(-270,0);g.closePath();
  const pg=g.createLinearGradient(0,-62,0,62);pg.addColorStop(0,'rgba(20,50,40,.72)');pg.addColorStop(1,'rgba(10,30,24,.82)');g.fillStyle=pg;g.fill();g.lineWidth=3;g.strokeStyle='#c8a050';g.stroke();
  g.lineWidth=1.2;g.strokeStyle='rgba(230,200,120,.6)';g.beginPath();g.moveTo(-240,-54);g.lineTo(240,-54);g.lineTo(258,0);g.lineTo(240,54);g.lineTo(-240,54);g.lineTo(-258,0);g.closePath();g.stroke();g.restore();
  g.font='80px '+FONT;g.textAlign='center';g.lineJoin='round';
  g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=14;g.lineWidth=12;g.strokeStyle='#1e3a24';g.strokeText('채근담담',0,0);g.shadowBlur=0;
  const lg=g.createLinearGradient(0,-64,0,8);lg.addColorStop(0,'#fff6d0');lg.addColorStop(.5,'#f0c860');lg.addColorStop(1,'#b07a28');g.fillStyle=lg;g.fillText('채근담담',0,0);
  g.lineWidth=1.5;g.strokeStyle='rgba(255,250,220,.7)';g.strokeText('채근담담',0,-1);
  // 덩굴 장식
  for(const s of[-1,1]){g.save();g.translate(s*232,-20);g.scale(s,1);g.strokeStyle='#7ab04a';g.lineWidth=3;g.beginPath();g.moveTo(0,30);g.bezierCurveTo(-20,10,10,-10,-6,-34);g.stroke();
    for(const[lx,ly,a]of[[-10,14,.6],[4,-6,-.5],[-8,-24,.8]]){g.save();g.translate(lx,ly);g.rotate(a);g.fillStyle='#8ac85a';g.beginPath();g.ellipse(0,0,9,4,0,0,6.28);g.fill();g.restore()}g.restore()}
  g.font='24px '+FONT;g.lineWidth=6;g.strokeStyle='#1e3a24';g.strokeText('— ONLINE —',0,38);g.fillStyle='#e8f4c8';g.fillText('— ONLINE —',0,38);
  const sp=el-1.7;if(sp>0&&sp<1.2)for(let i=0;i<14;i++){const a=i/14*6.283,r=40+sp*220;g.globalAlpha=(1-sp/1.2);txt(g,'✦',Math.cos(a)*r,-20+Math.sin(a)*r*.5,12+(i%3)*4,'#ffe9a0','center',0)}
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
    // 영화처럼 위아래 검은 띠가 열린다
    const bar=Math.max(0,1-el/1.2)*H*.5;g.fillStyle='#06100c';g.fillRect(0,0,W,bar);g.fillRect(0,H-bar,W,bar);
    if(el>2.6){const a=.55+.45*Math.sin(t*4);g.globalAlpha=a;
      g.fillStyle='rgba(12,34,26,.7)';g.beginPath();g.roundRect(W/2-170,290,340,44,8);g.fill();g.strokeStyle='#c8a050';g.lineWidth=2;g.stroke();txt(g,'▶  화면을 눌러 모험을 시작하세요  ◀',W/2,319,19,'#fff4d0','center',3);g.globalAlpha=1;
      txt(g,'PRESS ANY KEY',W/2,352,13,'#fff2c0','center',3)}
    txt(g,'ⓒ 채근담담 온라인',W/2,H-12,12,'rgba(255,255,255,.85)','center',3);
    txt(g,'v1.0',W-12,H-12,12,'rgba(255,255,255,.8)','right',3);
  }else{
    opScene(g,t,10,.35);opLogo(g,t,10,80);
    const sv=loadGame(),opts=charOpts();
    // 캐릭터 카드
    const cx=W/2-150,cy=410;g.save();const gl=g.createRadialGradient(cx,cy-60,10,cx,cy-60,150);gl.addColorStop(0,'rgba(255,236,170,.5)');gl.addColorStop(1,'rgba(255,236,170,0)');g.fillStyle=gl;g.fillRect(cx-150,cy-210,300,260);g.restore();
    g.fillStyle='rgba(140,120,80,.55)';g.beginPath();g.ellipse(cx,cy+4,90,16,0,0,6.28);g.fill();g.strokeStyle='rgba(240,210,130,.9)';g.lineWidth=2;g.stroke();
    if(sv){const j=JOB[sv.job];drawVeggie(g,j,{x:cx,y:cy,face:1,t,st:'idle',fid:sv.fid==null?3:sv.fid,tier:sv.tier||0,sc:1.7,eq:sv.eq||{}});
      panel(g,cx-130,cy+26,260,62,.75);txt(g,(ACCT?ACCT.name:'오프라인')+'  ·  Lv.'+sv.lvl,cx,cy+50,19,'#fff','center',3);txt(g,jline(j,sv.tier||0),cx,cy+76,14,'#f0d890','center',2)}
    else{txt(g,'?',cx,cy-50,90,'rgba(255,255,255,.75)','center',4);panel(g,cx-130,cy+26,260,62,.75);txt(g,(ACCT?ACCT.name:'오프라인')+' 님',cx,cy+50,19,'#fff','center',3);txt(g,'아직 캐릭터가 없어요',cx,cy+76,14,'#f0d890','center',2)}
    const lab={start:sv?'▶ 게임 시작':'✦ 캐릭터 만들기',logout:'로그아웃',new:'새 캐릭터 (개발)'};
    opts.forEach((o,i)=>{const b=charBtn(i),sel=G.sel===i;g.save();g.shadowColor=sel?'rgba(255,190,240,.95)':'transparent';g.shadowBlur=sel?20:0;
      const bg=g.createLinearGradient(0,b.y,0,b.y+b.h);bg.addColorStop(0,sel?'#3a6a44':'rgba(20,44,34,.82)');bg.addColorStop(1,sel?'#1e4a2c':'rgba(12,30,22,.86)');
      g.fillStyle=bg;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,8);g.fill();g.restore();g.strokeStyle=sel?'#f0c860':'rgba(200,160,80,.55)';g.lineWidth=sel?3:2;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,8);g.stroke();
      txt(g,lab[o],b.x+b.w/2,b.y+31,o==='start'?22:17,sel?'#fff0c0':'#d8e4c8','center',2)});
    txt(g,'Enter · 터치로 선택   ESC 처음 화면',W/2+175,H-16,13,'#fff','center',3);
    txt(g,ACCT?'☁ 클라우드 저장 '+(CLOUD.ok===false?'(연결 실패)':'ON'):'',14,H-16,13,'#fff','left',3);
    const fade=Math.max(0,1-(G.t-G.tt0)*3);if(fade){g.fillStyle=`rgba(255,255,255,${fade})`;g.fillRect(0,0,W,H)}
  }
  if(G.helpT)drawHelp(g);
};
