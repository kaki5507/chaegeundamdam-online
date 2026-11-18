/* ============================================================
   ADMIN : 운영자(닉네임 '운영자') 전용 버튼 · 운영 패널 · 전체 공지
           이벤트 시작 연출(폭죽 + 확성기 띠) · 이벤트 버프(오라 + 버프 아이콘)
   ============================================================ */
/* ---------- 운영 패널 ---------- */
async function adminPost(path,body,ok){closeUI();try{await api('POST',path,body);if(ok)sysChat(ok);pollOnce().catch(()=>{})}catch(e){sysChat(e.message)}}
adminMenu=function(){
  if(!ISADMIN){G.toast('운영자만 사용할 수 있어요');return}
  const ev=b=>()=>adminPost('/api/admin/event',b);
  const cur=evOn()?evText(EVENT)+' (남은 '+Math.ceil((EVENT.until-Date.now()-SRVOFF)/60000)+'분)':'진행 중인 이벤트 없음';
  openDialog('🛠 운영자 패널','이벤트를 열면 접속 중인 모든 유저 화면에 폭죽과 알림이 뜨고, 모두에게 버프가 걸립니다.\n\n현재: '+cur,[
    {t:'✨ 경험치 2배 · 1시간',fn:ev({exp:2,drop:1,minutes:60,msg:'사냥하기 좋은 시간!'})},
    {t:'✨ 경험치 3배 · 30분 (번개)',fn:ev({exp:3,drop:1,minutes:30,msg:'번개 이벤트!'})},
    {t:'🎁 드롭률 2배 · 1시간',fn:ev({exp:1,drop:2,minutes:60,msg:'장비가 쏟아진다!'})},
    {t:'🌈 경험치·드롭 2배 · 2시간',fn:ev({exp:2,drop:2,minutes:120,msg:'특별 이벤트'})},
    {t:'⚙ 직접 설정 (배율·시간·문구)',fn:()=>{const e=Math.min(5,Math.max(1,+prompt('경험치 배율 (1~5)','2')||1)),d=Math.min(5,Math.max(1,+prompt('드롭률 배율 (1~5)','1')||1)),m=Math.min(1440,Math.max(1,+prompt('진행 시간(분)','60')||60)),msg=(prompt('알림 문구','즐거운 이벤트!')||'').slice(0,60);
      ev({exp:e,drop:d,minutes:m,msg})()}},
    {t:'📢 전체 공지 보내기',fn:()=>{const t=(prompt('모든 유저에게 보낼 공지','')||'').trim();if(t)adminPost('/api/admin/notice',{text:t},'공지를 보냈습니다')}},
    {t:'🐉 보스 레이드 지금 열기 (20분)',fn:()=>adminPost('/api/admin/live',{kind:'raid',minutes:20},'레이드를 열었습니다')},
    {t:'🏛 쟁탈전 지금 열기 (10분)',fn:()=>adminPost('/api/admin/live',{kind:'arena',minutes:10},'쟁탈전을 열었습니다')},
    {t:'⛔ 경험치/드롭 이벤트 종료',fn:ev({off:true})},{t:'닫기',fn:closeUI}]);
};
// 운영자 버튼 (상단, 운영자에게만 보임)
HUDB.unshift({id:'adm',x:W-306,y:8,w:82,h:32,l:'🛠 운영',k:'',admin:1});
{const _dhb=drawHudButtons;drawHudButtons=function(g,t){const a=HUDB[0];if(!ISADMIN){HUDB.shift();_dhb(g,t);HUDB.unshift(a);return}_dhb(g,t)}}


/* ---------- 이벤트 시작 연출 ---------- */
let EVFX=null;
const _setEventA=setEvent;
setEvent=function(e){const before=EVENT.id;_setEventA(e);
  if(e&&e.id&&e.id!==before&&evOn()){const left=Math.ceil((e.until-Date.now()-SRVOFF)/60000);EVFX={t0:G.t,text:'🎉 '+evText(e)+' 이벤트 시작! '+(e.msg||'')+' ('+left+'분)'};
    MEGABAN={t0:G.t,m:{name:'운영자',text:evText(e)+' 이벤트가 시작됐어요! '+(e.msg||'')+' — 모두에게 이벤트 버프!'}};
    const p=PARTY[0];if(p&&S)for(let i=0;i<3;i++)spark(p.x,p.y-30,30,['#ffe04a','#ff8ae0','#8ad8ff'][i],360,1.2,5,0,true)}};
{const _pc=pushChat;pushChat=function(m){_pc(m);if(m.kind==='notice'){MEGABAN={t0:G.t,m:{name:'공지',text:m.text}};EVFX=EVFX||{t0:G.t,small:1};if(typeof sfx==='function')sfx('lvl')}}}
function drawFireworks(g,t){
  if(!EVFX)return;const k=G.t-EVFX.t0,dur=EVFX.small?2.4:5.5;if(k>dur){EVFX=null;return}
  const fade=Math.min(1,(dur-k)*1.5);g.save();g.globalCompositeOperation='lighter';
  for(let i=0;i<(EVFX.small?4:9);i++){
    const st=i*.45,lk=k-st;if(lk<0||lk>1.8)continue;const r=mulberry(i*77+3),cx=W*(.12+r()*.76),cy=H*(.14+r()*.32),col=['255,120,200','255,220,90','120,210,255','160,255,170','210,150,255'][i%5];
    if(lk<.35){const y=H-(H-cy)*(lk/.35);g.fillStyle=`rgba(${col},.9)`;g.beginPath();g.arc(cx,y,3,0,6.28);g.fill();continue}
    const e=(lk-.35)/1.45,R=20+e*110;
    for(let a=0;a<22;a++){const an=a/22*6.283+i,x=cx+Math.cos(an)*R,y=cy+Math.sin(an)*R+e*e*40;g.fillStyle=`rgba(${col},${(1-e)*fade})`;g.beginPath();g.arc(x,y,2.6*(1-e)+1,0,6.28);g.fill()}
  }
  g.restore();
  if(!EVFX.small){// 꽃가루
    for(let i=0;i<40;i++){const r=mulberry(i*13+1),x=(r()*W+Math.sin(k*2+i)*20)%W,y=((r()*H*.4)+k*120*(.6+r()))%H;g.save();g.globalAlpha=fade*.9;g.translate(x,y);g.rotate(k*4+i);g.fillStyle=['#ff8ae0','#ffe04a','#8ad8ff','#9affb0'][i%4];g.fillRect(-4,-2,8,4);g.restore()}}
}

/* ---------- 이벤트 버프 : 캐릭터 오라 + 버프 아이콘 ---------- */
function drawEventAura(g,x,y,t,seed){
  const pul=.5+.5*Math.sin(t*3+seed);g.save();g.globalCompositeOperation='lighter';
  const gl=g.createRadialGradient(x,y-20,4,x,y-20,40);gl.addColorStop(0,`rgba(255,220,120,${.18+pul*.12})`);gl.addColorStop(1,'rgba(255,220,120,0)');g.fillStyle=gl;g.fillRect(x-40,y-60,80,80);
  for(let i=0;i<5;i++){const k=((t*.6+i/5+seed*.1)%1),a=i*1.26+t*1.5,px=x+Math.cos(a)*16,py=y-4-k*48;g.fillStyle=`rgba(255,${200+i*10},${120+i*20},${(1-k)*.9})`;g.beginPath();g.arc(px,py,2.2*(1-k)+.8,0,6.28);g.fill()}
  g.restore();
  g.strokeStyle=`rgba(255,215,110,${.35+pul*.3})`;g.lineWidth=2;g.beginPath();g.ellipse(x,y,20,5,0,0,6.28);g.stroke();
}
{const _st=drawSelfTag;drawSelfTag=function(g){if(evOn()&&S&&!S.L.pvp){const t=G.t;for(const p of PARTY)if(!p.dead)drawEventAura(g,p.x,p.y,t,p.x*.01);
  for(const k in PEERS){const q=PEERS[k];if(q.tg.map===S.id&&!q.tg.dd)drawEventAura(g,q.x,q.y,t,q.t)}}_st(g)}}
function drawBuffIcons(g,t){
  if(!evOn()||!S||S.L.pvp)return;const left=Math.max(0,Math.ceil((EVENT.until-Date.now()-SRVOFF)/60000)),list=[];
  if(EVENT.exp>1)list.push(['EXP','×'+EVENT.exp,'#ffd34a']);if(EVENT.drop>1)list.push(['DROP','×'+EVENT.drop,'#8ad8ff']);
  list.forEach(([a,b,c],i)=>{const x=W-60-i*54,y=H-136,pul=.6+.4*Math.sin(t*4+i);
    g.save();g.shadowColor=c;g.shadowBlur=10*pul;g.beginPath();g.roundRect(x,y,46,46,10);g.fillStyle='rgba(50,20,70,.85)';g.fill();g.lineWidth=2;g.strokeStyle=c;g.stroke();g.restore();
    txt(g,a,x+23,y+17,10,c,'center',0);txt(g,b,x+23,y+34,15,'#fff','center',2);txt(g,left+'분',x+23,y+56,10,'#ffe9f6','center',2)});
}
{const _dh=drawHUD;drawHUD=function(g,t){_dh(g,t);drawBuffIcons(g,t);drawFireworks(g,t)}}
