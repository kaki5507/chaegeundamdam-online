/* ============================================================
   EXTRA : 표정 · 시작 섬(새싹 항구) · 명예의 전당/랭킹 · 확대 방지
   ============================================================ */
/* ---------- 표정 (20종, 우스꽝스러운 것 포함) ---------- */
const FACES=['또랑또랑','방긋','윙크','멍~','능글','깜짝','졸림','하트뿅','><','점눈','엉엉','반짝반짝','고양이입','이빨활짝','어질어질','결의','침흘림','뽀뽀','삐짐','메롱'];
function drawFace(g,fid,ec,t,hurt,st){
  const O=O_,ln=(w=1.8)=>{g.strokeStyle=O;g.lineWidth=w;g.lineCap='round';g.lineJoin='round'};
  const eye=(ex,ey,s=1)=>{g.beginPath();g.ellipse(ex,ey,3.6*s,4.8*s,0,0,6.28);g.fillStyle='#1a1220';g.fill();g.beginPath();g.ellipse(ex,ey+1.4*s,2.6*s,2.8*s,0,0,6.28);g.fillStyle=ec;g.fill();circ(g,ex+1.3*s,ey-1.8*s,1.5*s,'#fff');circ(g,ex-1.2*s,ey+2.2*s,.7*s,'#fff')};
  const arcEye=(ex,ey,up)=>{ln(2);g.beginPath();g.arc(ex,ey+(up?2:-1),3.4,up?Math.PI*1.1:Math.PI*.1,up?Math.PI*1.9:Math.PI*.9);g.stroke()};
  const lineEye=(ex,ey)=>{ln(2);g.beginPath();g.moveTo(ex-3.5,ey);g.lineTo(ex+3.5,ey);g.stroke()};
  const brow=(ex,ey,tilt=0)=>{ln(1.6);g.beginPath();g.moveTo(ex-4,ey-6.6-tilt);g.quadraticCurveTo(ex,ey-8,ex+4,ey-6.6+tilt);g.stroke()};
  const blush=(a=.38)=>{g.fillStyle=`rgba(255,120,120,${a})`;g.beginPath();g.ellipse(-11,10,3.6,2.2,0,0,6.28);g.ellipse(11,10,3.6,2.2,0,0,6.28);g.fill()};
  const smile=()=>{ln(1.6);g.beginPath();g.moveTo(-2.4,12);g.quadraticCurveTo(0,14,2.4,12);g.stroke()};
  const openM=(w=3,h=4,col='#c04a5a')=>{ln(1.6);g.beginPath();g.moveTo(-w,11.5);g.quadraticCurveTo(0,11.5+h*2,w,11.5);g.closePath();g.fillStyle=col;g.fill();g.stroke()};
  const blink=Math.sin(t*1.7+fid)>.985;
  if(hurt){for(const s of[-1,1]){const ex=s*7.5;ln(2);g.beginPath();g.moveTo(ex-3,1);g.lineTo(ex+3,7);g.moveTo(ex+3,1);g.lineTo(ex-3,7);g.stroke()}blush(.3);ln(1.6);g.beginPath();g.arc(0,13,2.4,0,6.28);g.fillStyle='#a04050';g.fill();g.stroke();return}
  const act=st==='atk'||st==='skill';
  switch(fid%FACES.length){
    case 0: for(const s of[-1,1]){blink?arcEye(s*7.5,4,false):eye(s*7.5,4);brow(s*7.5,4)}blush();act?openM():smile();break;
    case 1: for(const s of[-1,1])arcEye(s*7.5,4,true);blush(.5);openM(3.4,3.6);break;
    case 2: eye(-7.5,4);arcEye(7.5,4,true);brow(-7.5,4);blush();ln(1.6);g.beginPath();g.moveTo(-3,12);g.quadraticCurveTo(1,14.5,4,11);g.stroke();break;
    case 3: eye(-7.5,4,1.25);eye(7.5,5,.6);blush(.25);openM(3,3,'#c04a5a');ell(g,1.5,15.5,2.2,2.6,'#ff7a8a',O,1.2);break;
    case 4: for(const s of[-1,1]){eye(s*7.5,5,.9);g.fillStyle=SKINC;g.fillRect(s*7.5-4.5,-1.5,9,4.5);ln(1.8);g.beginPath();g.moveTo(s*7.5-4,2.8);g.lineTo(s*7.5+4,2.8);g.stroke()}blush(.3);ln(1.6);g.beginPath();g.moveTo(-3,13);g.quadraticCurveTo(2,13.5,4,10.5);g.stroke();break;
    case 5: for(const s of[-1,1]){circ(g,s*7.5,4,4.4,'#fff',O,1.6);circ(g,s*7.5,4,1.4,'#1a1220')}ln(1.6);g.beginPath();g.ellipse(0,13,2.4,3,0,0,6.28);g.fillStyle='#7a2a3a';g.fill();g.stroke();break;
    case 6: for(const s of[-1,1])lineEye(s*7.5,5);blush(.3);smile();if(Math.sin(t*2)>0)txt(g,'z',16,-10+Math.sin(t*2)*2,9,'#6a8ad0','left',2);break;
    case 7: for(const s of[-1,1]){g.save();g.translate(s*7.5,4);const k=1+Math.sin(t*8)*.08;g.scale(k,k);g.beginPath();g.moveTo(0,4);g.bezierCurveTo(-6,0,-4,-5,0,-2.4);g.bezierCurveTo(4,-5,6,0,0,4);g.fillStyle='#ff4a7a';g.fill();g.lineWidth=1.2;g.strokeStyle=O;g.stroke();g.restore()}blush(.5);openM(2.6,3);break;
    case 8: for(const s of[-1,1]){ln(2.2);g.beginPath();g.moveTo(s*7.5-3.5*s,1);g.lineTo(s*7.5+2.5*s,4);g.lineTo(s*7.5-3.5*s,7);g.stroke()}blush(.55);openM(4,4.5);break;
    case 9: for(const s of[-1,1])circ(g,s*7,4,1.8,'#1a1220');ln(1.4);g.beginPath();g.moveTo(-2,12.5);g.lineTo(2,12.5);g.stroke();break;
    case 10: for(const s of[-1,1]){arcEye(s*7.5,4,false);g.fillStyle='rgba(120,190,255,.8)';g.fillRect(s*7.5-1.5,6,3,10+Math.sin(t*6+s)*2)}ln(1.6);g.beginPath();g.moveTo(-4,13);for(let i=0;i<4;i++)g.lineTo(-4+(i+1)*2,i%2?13:11.5);g.stroke();break;
    case 11: for(const s of[-1,1]){g.save();g.translate(s*7.5,4);g.rotate(t*2);poly(g,[0,-5,1.4,-1.4,5,0,1.4,1.4,0,5,-1.4,1.4,-5,0,-1.4,-1.4],'#ffd34a',O,1.1);g.restore()}blush(.45);openM(3,3.4);break;
    case 12: for(const s of[-1,1]){blink?arcEye(s*7.5,4,false):eye(s*7.5,4,.9)}blush(.4);ln(1.5);g.beginPath();g.moveTo(-4,11);g.quadraticCurveTo(-2,14,0,11.5);g.quadraticCurveTo(2,14,4,11);g.stroke();break;
    case 13: for(const s of[-1,1])arcEye(s*7.5,4,true);g.fillStyle='#fff';g.beginPath();g.roundRect(-5.5,10,11,5,2);g.fill();ln(1.4);g.stroke();g.beginPath();g.moveTo(-5.5,12.5);g.lineTo(5.5,12.5);for(let i=-3;i<=3;i+=3){g.moveTo(i,10);g.lineTo(i,15)}g.stroke();break;
    case 14: for(const s of[-1,1]){ln(1.3);g.beginPath();for(let a=0;a<12;a+=.3){const r=a*.38;g.lineTo(s*7.5+Math.cos(a+t*6*s)*r,4+Math.sin(a+t*6*s)*r)}g.stroke()}ln(1.5);g.beginPath();g.moveTo(-3,12.5);g.quadraticCurveTo(-1,10.5,1,12.5);g.quadraticCurveTo(3,14.5,4,12);g.stroke();break;
    case 15: for(const s of[-1,1]){eye(s*7.5,5,.9);ln(2.2);g.beginPath();g.moveTo(s*7.5-4*s,-2.5);g.lineTo(s*7.5+4*s,-.5);g.stroke()}ln(1.8);g.beginPath();g.moveTo(-3,12.5);g.lineTo(3,12.5);g.stroke();break;
    case 16: for(const s of[-1,1])eye(s*7.5,4,1.1);blush(.4);openM(3,2.4);g.fillStyle='rgba(140,200,255,.85)';g.beginPath();g.ellipse(3.6,17+Math.abs(Math.sin(t*2))*3,1.4,2.6,0,0,6.28);g.fill();break;
    case 17: for(const s of[-1,1])arcEye(s*7.5,4,false);blush(.6);ln(1.6);g.beginPath();g.ellipse(1,12.5,2,2.4,0,0,6.28);g.fillStyle='#e05a7a';g.fill();g.stroke();if(Math.sin(t*3)>.3){g.fillStyle='#ff6a9a';g.font='bold 8px sans-serif';g.fillText('♥',8,8)}break;
    case 18: for(const s of[-1,1]){eye(s*7.5,5,.85);ln(2);g.beginPath();g.moveTo(s*7.5-4*s,0);g.lineTo(s*7.5+4*s,-2);g.stroke()}ln(1.6);g.beginPath();g.moveTo(-3,14);g.quadraticCurveTo(0,11.5,3,14);g.stroke();g.fillStyle='rgba(255,120,120,.5)';g.beginPath();g.ellipse(-12,8,2.5,4,0,0,6.28);g.fill();break;
    default: eye(-7.5,4);arcEye(7.5,4,true);blush(.4);openM(3,3);ell(g,0,16,2.6,3,'#ff7a8a',O,1.2);break;
  }
}
const fidOf=s=>{let h=7;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return h%FACES.length};

/* ---------- 시작 섬 : 새싹 항구 (튜토리얼 · Lv.1~5) ---------- */
Object.assign(THEMES,{harbor:{sun:1,sky:['#5ac8ff','#9ae0ff','#d8f4ff','#fff8e0'],moon:{x:.2,y:.2,r:44,c:'#fffbe0',glow:'rgba(255,250,210,'},
  layers:[{k:'clouds',col:'#ffffff',base:.42,f:.04},{k:'ridge',col:'#9ad8f0',amp:40,base:.68,f:.08,cyc:[2,5,9]},{k:'clouds',col:'#f4fbff',base:.86,f:.2}],
  grass:'#8ae070',grass2:'#4ab05a',dirt:'#e8d0a0',dirt2:'#c8a878',stone:'#c0b8b0',plank:'#d8a868',plank2:'#8a6038',fly:'#ffffff'}});
Object.assign(NPC_LOOK_X,{
  captain:{job:'guardian',eq:{hat:'hat_gat',outfit:'out_vest',cape:'cape_blue'},n:'선장 감자수염',fid:1},
  fisher:{job:'archer',eq:{hat:'hat_flower',outfit:'out_tank'},n:'어부 미역이',fid:6},
  baker:{job:'priest',eq:{outfit:'out_hanbok'},n:'빵집 누나 호박',fid:12},
  kid:{job:'gunner',eq:{},n:'꼬마 콩이',fid:3},
});
GIVER_NAME.captain='선장 감자수염';GIVER_NAME.fisher='어부 미역이';GIVER_NAME.baker='빵집 누나 호박';
ETC_NAME.shell='반짝 조개';
NPCS.push(
  {id:'captain',name:'선장 감자수염',x:420,look:'captain',tag:'튜토리얼 · 항해',map:'harbor'},
  {id:'fisher',name:'어부 미역이',x:1180,look:'fisher',tag:'퀘스트',map:'harbor'},
  {id:'baker',name:'빵집 누나 호박',x:760,look:'baker',tag:'퀘스트 · 물약',map:'harbor'},
  {id:'kid',name:'꼬마 콩이',x:620,look:'kid',tag:'수다',map:'harbor'},
  {id:'fame',name:'명예의 전당',x:1500,look:'fame',tag:'랭킹'},
);
// 튜토리얼은 항구 선장에게서
QUESTS.tut1.giver='captain';QUESTS.tut1.name='튜토리얼 · 새싹 항구의 아침';
QUESTS.tut1.desc='선장 감자수염이 모험의 기초를 알려준다. 이동·점프·공격·스킬·밧줄을 익히고 허수아비를 쓰러뜨려라!';
Object.assign(QUESTS,{
 h1:{name:'바닷가 슬라임 소동',giver:'captain',min:1,pre:['tut1'],desc:'항구 동쪽 해변에 달걀 슬라임이 몰려왔다. 8마리만 쫓아내 주게!',objs:[{t:'kill',mob:'egg',map:'harbor',n:8,label:'해변의 달걀 슬라임'}],rew:{exp:70,coin:120}},
 h2:{name:'반짝 조개 줍기',giver:'fisher',min:2,pre:['tut1'],desc:'파도에 쓸려 온 반짝 조개를 6개 주워 줄래? 슬라임이 삼키고 있을 때가 많아.',objs:[{t:'collect',item:'shell',n:6,label:'반짝 조개 (슬라임 40%)'}],rew:{exp:80,coin:150,item:'face_sun'}},
 h3:{name:'갓 구운 빵 배달',giver:'baker',min:1,pre:['tut1'],desc:'선장님, 어부 미역이, 꼬마 콩이에게 빵 냄새를 전해 줘. (세 사람과 대화)',objs:[{t:'talk',n:5,label:'항구 사람들과 대화'}],rew:{exp:60,coin:100}},
 h4:{name:'야채마을로 가는 배',giver:'captain',min:5,pre:['h1'],desc:'Lv.5가 되었으니 이제 큰 세상으로 나갈 때야. 오른쪽 부두의 배를 타고 야채마을로 가게!',objs:[{t:'lvl',n:5,label:'Lv.5 달성'}],rew:{exp:120,coin:300,item:'cape_blue'}},
});
QUESTS.main1.pre=['h4'];
function buildHarbor(){
  const gy=470,Wd=2500;
  const L=newL({id:'harbor',name:'새싹 항구',sub:'모험의 첫걸음 · 파도 소리가 들리는 작은 항구',theme:'harbor',music:'field',w:Wd,h:540,town:true,harbor:true,spawn:{x:240,y:gy},mscale:.7});
  L.plats.push(plat(-300,gy,2060,300,'s'));                                  // 마을 + 해변
  for(let x=1760;x<Wd+300;x+=110)L.plats.push(plat(x,gy,110,300,'s',{pier:true})); // 부두
  L.plats.push(plat(860,330,190,14,'o'),plat(1080,250,150,14,'o'),plat(1300,330,170,14,'o'),plat(560,300,140,14,'o'));
  L.ropes.push({x:960,y1:330,y2:gy},{x:630,y1:300,y2:gy});
  L.dummies=[{x:300+40,y:gy},{x:520,y:gy}];
  L.mobs.push(['egg',1350,gy,1250,1720],['egg',1500,gy,1250,1720],['egg',1650,gy,1250,1720],['egg',1150,330,1090,1220],['egg',1385,330,1310,1460],['egg',1460,gy,1250,1720]);
  L.npcs=NPCS.filter(n=>n.map==='harbor').map(n=>Object.assign({gy},n));
  L.portals=[{x:2380,y:gy,to:'town',label:'⛵ 야채마을행 배',lockLv:5,boat:true}];
  return L;
}
MAPS.harbor=buildHarbor;
function drawHarborDecor(g,L,t,cam){
  // 바다
  const y0=488;g.fillStyle='#4ab8f0';g.fillRect(1760,y0,L.w-1700,200);
  g.fillStyle='rgba(255,255,255,.6)';for(let x=1760;x<L.w;x+=60){const yy=y0+8+Math.sin(t*2+x*.05)*3;g.fillRect(x,yy,30,3)}
  // 부두 기둥
  for(let x=1770;x<L.w;x+=110){g.fillStyle='#8a6038';g.fillRect(x,470,12,60);g.strokeStyle=O_;g.lineWidth=2;g.strokeRect(x,470,12,60)}
  // 등대
  const lx=90,ly=470;g.save();poly(g,[lx-30,ly,lx-20,ly-190,lx+20,ly-190,lx+30,ly],'#fff',O_,3);
  for(let i=0;i<3;i++){g.fillStyle='#ff5a5a';g.fillRect(lx-28+i*2.5,ly-60-i*60,56-i*5,18)}
  g.fillStyle='#ffe070';g.fillRect(lx-16,ly-218,32,28);g.strokeRect(lx-16,ly-218,32,28);poly(g,[lx-22,ly-218,lx,ly-240,lx+22,ly-218],'#ff5a5a',O_,2.5);
  const a=t*1.4,gl=g.createRadialGradient(lx,ly-204,4,lx,ly-204,90);gl.addColorStop(0,'rgba(255,240,150,.55)');gl.addColorStop(1,'rgba(255,240,150,0)');g.fillStyle=gl;g.beginPath();g.moveTo(lx,ly-204);g.arc(lx,ly-204,160,a,a+.35);g.closePath();g.fill();g.restore();
  // 배
  const bx=2330,by=500+Math.sin(t*1.5)*3;g.save();g.translate(bx,by);
  g.beginPath();g.moveTo(-120,-30);g.lineTo(140,-30);g.quadraticCurveTo(120,20,90,24);g.lineTo(-90,24);g.quadraticCurveTo(-118,10,-120,-30);g.fillStyle='#c0603a';g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke();
  g.fillStyle='#fff';g.fillRect(-120,-30,260,8);g.strokeRect(-120,-30,260,8);
  g.fillStyle='#7a4a24';g.fillRect(-4,-190,8,160);g.strokeRect(-4,-190,8,160);
  g.beginPath();g.moveTo(6,-180);g.quadraticCurveTo(70+Math.sin(t*2)*6,-120,6,-50);g.closePath();g.fillStyle='#fff8e8';g.fill();g.stroke();
  g.beginPath();g.moveTo(-6,-170);g.quadraticCurveTo(-60,-120,-6,-70);g.closePath();g.fillStyle='#ffe0a0';g.fill();g.stroke();
  poly(g,[4,-190,30,-182,4,-174],'#5ac85a',O_,1.5);g.restore();
  // 갈매기
  for(let i=0;i<3;i++){const sx=(t*40+i*400)%L.w,sy=120+i*30+Math.sin(t*3+i)*8;g.strokeStyle='#334';g.lineWidth=2;g.beginPath();g.moveTo(sx-8,sy);g.quadraticCurveTo(sx-4,sy-5,sx,sy);g.quadraticCurveTo(sx+4,sy-5,sx+8,sy);g.stroke()}
  // 꽃
  for(let x=200;x<1700;x+=97){const c=['#ff8ac0','#ffe04a','#fff','#9ad0ff'][x%4];for(let k=0;k<5;k++)circ(g,x+Math.cos(k*1.25)*3.5,462+Math.sin(k*1.25)*3.5,2.4,c);circ(g,x,462,1.8,'#ffb040')}
}

/* ---------- 명예의 전당 (랭킹) ---------- */
function drawFameSign(g,x,y,t){
  g.fillStyle='#7a5430';g.fillRect(x-5,y-100,10,100);g.strokeStyle=O_;g.lineWidth=2;g.strokeRect(x-5,y-100,10,100);
  g.beginPath();g.roundRect(x-58,y-132,116,52,8);const gr=g.createLinearGradient(0,y-132,0,y-80);gr.addColorStop(0,'#ffe680');gr.addColorStop(1,'#e0a020');g.fillStyle=gr;g.fill();g.lineWidth=3;g.stroke();
  poly(g,[x-14,y-134,x-14,y-148,x-7,y-140,x,y-152,x+7,y-140,x+14,y-148,x+14,y-134],'#ffd34a',O_,2);
  txt(g,'명예의 전당',x,y-100,15,'#5a2a00','center',0);
  if(Math.sin(t*3)>.6)txt(g,'✦',x+50,y-132,12,'#fff','center',0);
}
async function openFame(){
  G.ui='fame';G.fame={loading:true,list:[],me:null,err:''};sfx('sel');
  try{
    if(!ONLINE)throw new Error('offline');
    const r=await fetch('/api/ranking',{headers:ACCT?{authorization:'Bearer '+ACCT.token}:{}});const o=await r.json();
    G.fame=Object.assign(G.fame,{loading:false,list:o.top||[],me:o.me});
  }catch(e){G.fame=Object.assign(G.fame,{loading:false,err:'서버에 연결되어 있지 않아 랭킹을 불러올 수 없습니다.\n(로그인/온라인 상태에서 확인할 수 있어요)'})}
}
function drawFame(g,t){
  g.fillStyle='rgba(8,4,16,.62)';g.fillRect(0,0,W,H);panel(g,150,30,660,480,.95);
  txt(g,'👑 명예의 전당',W/2,74,28,'#ffd34a','center');txt(g,'레벨 · 경험치 순위 (상위 10명) · Esc 닫기',W/2,98,13,'#cfd4e2','center',2);
  const F=G.fame;if(!F)return;
  if(F.loading){txt(g,'불러오는 중…',W/2,260,18,'#fff','center');return}
  if(F.err){wrap(g,F.err,560,16).forEach((l,i)=>txt(g,l,W/2,240+i*24,16,'#fff','center',2));return}
  const medal=['#ffd34a','#d8e0f0','#e0a060'];
  F.list.slice(0,10).forEach((r,i)=>{
    const y=118+i*36,top=i<3;
    g.fillStyle=top?`rgba(255,220,120,${.22-i*.05})`:'rgba(255,255,255,.05)';g.beginPath();g.roundRect(180,y,600,32,8);g.fill();
    if(top){circ(g,206,y+16,12,medal[i],O_,2);txt(g,String(i+1),206,y+21,14,'#3a2000','center',0)}else txt(g,String(i+1),206,y+22,15,'#cfd4e2','center',2);
    const j=JOB[r.job];
    g.save();g.beginPath();g.rect(226,y+1,30,30);g.clip();if(j)drawVeggie(g,j,{x:241,y:y+48,face:1,t,st:'idle',tier:r.tier||0,fid:fidOf(r.name)});g.restore();
    txt(g,r.name,264,y+22,16,top?'#ffe9a0':'#fff');
    txt(g,j?jline(j,r.tier||0):'-',520,y+22,13,'#9be8ff','left',2);
    txt(g,'Lv.'+r.lvl,760,y+22,16,'#7aff9a','right');
  });
  if(!F.list.length)txt(g,'아직 기록이 없습니다. 첫 번째 주인공이 되어 보세요!',W/2,260,16,'#fff','center',2);
  if(F.me)txt(g,'내 순위 : '+F.me.rank+'위  (Lv.'+F.me.lvl+')',W/2,494,15,'#ffd34a','center',2);
}
// 랭킹 1~3위 접속 환영 (서버가 전체에 알림)
async function sayHello(){if(!ONLINE||!ACCT)return;try{saveGame();await api('PUT','/api/save',{save:SAVE});const o=await api('POST','/api/hello',{});if(o.rank&&o.rank<=3)G.toast('명예의 전당 '+o.rank+'위! 모두에게 환영 인사가 전해졌어요')}catch(e){}}
let RANKBAN=null;
function drawRankBanner(g,t){
  if(!RANKBAN)return;const k=G.t-RANKBAN.t0;if(k>7){RANKBAN=null;return}
  const a=clamp(Math.min(k*3,(7-k)*2),0,1),m=RANKBAN.m,col=['#ffd34a','#e0e8ff','#ffb070'][(m.rank||1)-1];
  g.save();g.globalAlpha=a;const s='👑 랭킹 '+m.rank+'위 '+m.name+' 님이 접속했습니다! 모두 환영해 주세요!';g.font=F(17);const w=Math.min(880,g.measureText(s).width+60);
  g.fillStyle='rgba(30,16,4,.92)';g.beginPath();g.roundRect(W/2-w/2,140,w,40,12);g.fill();g.strokeStyle=col;g.lineWidth=3.5;g.stroke();
  for(let i=0;i<6;i++){const sx=W/2-w/2+((t*80+i*w/6)%w),sy=140+Math.sin(t*4+i)*3;txt(g,'✦',sx,sy,10,col,'center',0)}
  txt(g,s,W/2,167,17,col,'center',3);g.restore();
}

/* ---------- 확대 방지 (핀치 · 더블탭 · 더블클릭 · Ctrl+휠/키) ---------- */
(function noZoom(){
  const stop=e=>{e.preventDefault()};
  document.addEventListener('dblclick',stop,{passive:false});
  document.addEventListener('gesturestart',stop,{passive:false});document.addEventListener('gesturechange',stop,{passive:false});document.addEventListener('gestureend',stop,{passive:false});
  document.addEventListener('touchmove',e=>{if(e.touches.length>1||(e.scale&&e.scale!==1))e.preventDefault()},{passive:false});
  document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
  let lastTap=0;document.addEventListener('touchend',e=>{const now=Date.now();if(now-lastTap<350&&!(e.target&&/^(INPUT|SELECT|BUTTON)$/.test(e.target.tagName)))e.preventDefault();lastTap=now},{passive:false});
  addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)e.preventDefault()},{passive:false});
  addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['Equal','Minus','NumpadAdd','NumpadSubtract','Digit0','Numpad0'].includes(e.code))e.preventDefault()},{capture:true});
})();
