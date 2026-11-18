/* ============================================================
   SOCIAL : 능력치(AP) · 장비 착용 규칙 · 채팅/확성기 · 운영자 이벤트
   ============================================================ */
/* ---------- 능력치 (레벨당 AP 5) ---------- */
const STATS=[['str','힘','STR','#ff7a5a','공격력(전사·수호자·격투가) · 최대 HP'],['dex','민첩','DEX','#6ad06a','공격력(궁수·거너) · 크리티컬 소폭'],['int','지능','INT','#6ab0ff','공격력(마법사·성직자) · 최대 MP'],['luk','행운','LUK','#ffd34a','공격력(암살자) · 크리티컬']];
const PRIMARY={warrior:'str',guardian:'str',fighter:'str',archer:'dex',gunner:'dex',mage:'int',priest:'int',rogue:'luk'};
const SECOND={str:'dex',dex:'str',int:'luk',luk:'dex'};
function ensureAP(){
  if(!SAVE.ap){SAVE.ap={str:4,dex:4,int:4,luk:4};SAVE.apFree=5*(SAVE.lvl-1);autoAP()}
  if(SAVE.apFree==null)SAVE.apFree=0;
}
function autoAP(){ // 주 능력치 4 : 보조 능력치 1
  const pr=PRIMARY[SAVE.job],se=SECOND[pr],a=SAVE.ap;
  while(SAVE.apFree>0){if((a[se]-4)*4<(a[pr]-4))a[se]++;else a[pr]++;SAVE.apFree--}
}
// 레벨 기준 기대치 대비 투자량 → 공격 배율 (주스탯 몰빵 ≈1.0~1.1, 엉뚱한 스탯 ≈0.55)
function statMul(){
  const pr=PRIMARY[SAVE.job],se=SECOND[pr],a=SAVE.ap,L=SAVE.lvl;
  const eff=a[pr]+.25*a[se],ref=(4+4*(L-1))+.25*(4+(L-1));
  return clamp(.5+.5*eff/ref,.5,1.12);
}
function applyAP(p){
  const a=SAVE.ap;p.atkBase*=statMul();p.maxhp+=a.str*2;p.maxmp+=a.int*2;
  p.crit=clamp(.08+a.luk*.0012+a.dex*.0004,0,.45);
}
function openStat(){G.ui='stat';G.stat={sel:0};sfx('sel')}
function statUpdate(){
  const nv=nav();if(nv.back||pressed.KeyO){closeUI();return}
  if(nv.u)G.stat.sel=(G.stat.sel+5)%6;if(nv.d)G.stat.sel=(G.stat.sel+1)%6;
  if(nv.ok||nv.r){
    const s=G.stat.sel;
    if(s<4){if(SAVE.apFree>0){SAVE.ap[STATS[s][0]]++;SAVE.apFree--;sfx('pickup')}else G.toast('남은 AP가 없습니다 (레벨업마다 +5)')}
    else if(s===4){if(SAVE.apFree>0){autoAP();sfx('lvl')}}
    else{closeUI();return}
    const p=PARTY[0],r=p.hp/p.maxhp;recalc(p);p.hp=Math.round(p.maxhp*r);saveGame();
  }
}
function drawStat(g,t){
  g.fillStyle='rgba(8,4,16,.6)';g.fillRect(0,0,W,H);panel(g,170,50,620,440,.95);
  const p=PARTY[0],j=JOB[SAVE.job],pr=PRIMARY[SAVE.job];
  txt(g,'능력치',200,92,26,'#ffe9a0');txt(g,'O / Esc 닫기',760,92,13,'#cfd4e2','right',2);
  txt(g,jline(j,SAVE.tier)+'  Lv.'+SAVE.lvl,200,120,15,'#fff','left',2);
  txt(g,'남은 AP  '+SAVE.apFree,760,122,20,SAVE.apFree?'#7aff9a':'#888','right');
  STATS.forEach(([k,n,ab,col,desc],i)=>{
    const y=142+i*58,sel=G.stat.sel===i;
    g.fillStyle=sel?'rgba(255,220,120,.2)':'rgba(255,255,255,.05)';g.beginPath();g.roundRect(196,y,568,50,10);g.fill();if(sel){g.strokeStyle='#ffd34a';g.lineWidth=2;g.stroke()}
    txt(g,n+' '+ab+(k===pr?'  ★주':k===SECOND[pr]?'  보조':''),214,y+22,17,col);txt(g,desc,214,y+42,11,'#cfd4e2','left',2);
    txt(g,String(SAVE.ap[k]),660,y+33,24,'#fff','right');
    g.fillStyle=SAVE.apFree?'#ffd34a':'#555';g.beginPath();g.roundRect(690,y+12,54,28,8);g.fill();txt(g,'+1',717,y+32,15,'#2a1a00','center',0);
  });
  [['자동 분배 (주 4 : 보조 1)',4],['닫기',5]].forEach(([s,i],k)=>{const y=380+k*36,sel=G.stat.sel===i;g.fillStyle=sel?'rgba(255,220,120,.25)':'rgba(255,255,255,.06)';g.beginPath();g.roundRect(196,y,260,30,8);g.fill();txt(g,(sel?'▶ ':'')+s,210,y+21,14,sel?'#ffe9a0':'#fff','left',2)});
  const L=[['공격 배율','×'+statMul().toFixed(2)],['공격력',Math.round(p.atkBase)],['최대 HP',p.maxhp],['최대 MP',p.maxmp],['크리티컬',Math.round((p.crit||.12)*100)+'%']];
  L.forEach(([k,v],i)=>{txt(g,k,500,384+i*18,13,'#cfd4e2','left',2);txt(g,String(v),760,384+i*18,13,'#fff','right',2)});
  txt(g,'주 능력치에 투자할수록 강해지고, 장비 착용 조건도 능력치로 정해집니다.',480,478,12,'#9be8ff','center',2);
}

/* ---------- 장비 착용 규칙 ---------- */
function gearCheck(id){ // → 못 끼는 이유 배열
  const d=GEAR[id],why=[];
  if(d.wt&&d.wt!=='any'){const ok=(d.slot==='lh'?JOB_LH:JOB_WEAP)[SAVE.job]||[];if(!ok.includes(d.wt))why.push(JOB[SAVE.job].role+' 직업은 '+WT[d.wt].n+' 착용 불가')}
  if(d.req){if(d.req.lv&&SAVE.lvl<d.req.lv)why.push('Lv.'+d.req.lv+' 필요');for(const k of['str','dex','int','luk'])if(d.req[k]&&SAVE.ap[k]<d.req[k])why.push(STATN[k]+' '+d.req[k]+' 필요 (현재 '+SAVE.ap[k]+')')}
  return why;
}
function gearEquip(id,slot){ // 성공 시 null, 실패 시 메시지
  const why=gearCheck(id);if(why.length)return why.join(' · ');
  for(const s in SAVE.gear)if(SAVE.gear[s]===id&&s!==slot)delete SAVE.gear[s];
  SAVE.gear[slot]=id;
  if(slot==='rh'&&is2H(id)&&SAVE.gear.lh){delete SAVE.gear.lh;G.toast('양손무기라 왼손 장비를 해제했다')}
  if(slot==='lh'&&is2H(SAVE.gear.rh)){delete SAVE.gear.rh;G.toast('양손무기를 해제하고 왼손에 착용했다')}
  return null;
}
function gearValidate(){for(const s in SAVE.gear){const id=SAVE.gear[s];if(!GEAR[id]||gearCheck(id).length)delete SAVE.gear[s]}}
function migrateGear(){
  const g=SAVE.gear;if(g.weapon){g.rh=g.weapon;delete g.weapon}if(g.acc){g.acc1=g.acc;delete g.acc}
  for(const s in g)if(!GEAR[g[s]])delete g[s];
}

/* ---------- 확성기 ---------- */
const MEGA={m:{n:'확성기',price:300,cur:'●',d:'전체 채팅 1회 (모든 맵의 모든 유저에게)'},h:{n:'고확성기',price:2,cur:'◆',d:'전체 채팅 + 화면 상단 대형 알림 1회'}};

/* ---------- 채팅 · 이벤트 (서버가 있을 때만 온라인) ---------- */
let ONLINE=false,ISADMIN=false,CHAT=[],CHAT_SINCE=0,SRVOFF=0,MEGABAN=null;
let EVENT={id:'',exp:1,drop:1,until:0,msg:''};
const evOn=()=>EVENT.until>Date.now()+SRVOFF;
const EV=()=>evOn()?{exp:EVENT.exp||1,drop:EVENT.drop||1}:{exp:1,drop:1};
function pushChat(m){CHAT.push(Object.assign({at:G.t},m));if(CHAT.length>80)CHAT.shift();if(m.kind==='hmega')MEGABAN={t0:G.t,m};if(m.kind==='rank')RANKBAN={t0:G.t,m}}
function sysChat(text){pushChat({kind:'sys',text})}
async function socialInit(){
  if(location.protocol==='file:')return;
  try{const r=await fetch('/api/health');const o=await r.json();ONLINE=!!o.ok}catch(e){ONLINE=false}
  if(ONLINE){refreshMe();pollLoop();presenceConnect()}
}
async function refreshMe(){presenceHello();if(!ACCT){ISADMIN=false;return}try{const o=await api('GET','/api/me');ISADMIN=!!o.admin}catch(e){}}
let _pollMap='';
async function pollOnce(){
  const map=S?S.id:'title';if(map!==_pollMap){_pollMap=map}
  const r=await fetch('/api/poll?since='+CHAT_SINCE+'&map='+encodeURIComponent(map));const o=await r.json();
  SRVOFF=(o.now||Date.now())-Date.now();
  for(const m of o.msgs||[]){if(m.ts>CHAT_SINCE)CHAT_SINCE=m.ts;pushChat(m)}
  setEvent(o.event);
}
function pollLoop(){pollOnce().catch(()=>{}).finally(()=>setTimeout(pollLoop,document.hidden?8000:2500))}
function evText(e){const p=[];if(e.exp>1)p.push('경험치 '+e.exp+'배');if(e.drop>1)p.push('드롭률 '+e.drop+'배');return p.join(' · ')||'이벤트'}
function setEvent(e){
  const was=evOn();
  if(!e||!e.id){if(EVENT.id&&was){G.toast('이벤트가 종료되었습니다')}EVENT={id:'',exp:1,drop:1,until:0,msg:''};return}
  const isNew=e.id!==EVENT.id;EVENT=e;
  if(isNew&&evOn()){const left=Math.ceil((e.until-Date.now()-SRVOFF)/60000);G.bigBanner={t0:G.t,title:'🎉 '+evText(e)+' 이벤트가 실행됐다!',sub:(e.msg?e.msg+'  ':'')+'(남은 시간 '+left+'분)',col:'#ff8ae0'};sfx('lvl')}
}
function openChat(mode){
  if(document.getElementById('chatbar'))return;
  for(const k in keys)keys[k]=false;
  const rc=document.getElementById('c').getBoundingClientRect();
  const d=document.createElement('div');d.id='chatbar';
  d.style.cssText=`position:fixed;left:${rc.left+8}px;top:${rc.top+(H-98)*rc.height/H}px;width:${Math.min(560,rc.width-16)}px;display:flex;gap:6px;z-index:40`;
  d.innerHTML=`<select id="cb_m"><option value="map">일반 (이 맵)</option><option value="mega">확성기 (${SAVE.mega.m})</option><option value="hmega">고확성기 (${SAVE.mega.h})</option></select><input id="cb_t" maxlength="80" placeholder="${ONLINE?(ACCT?'메시지 입력 · Enter 보내기 · Esc 닫기':'로그인해야 채팅할 수 있어요'):'오프라인 (서버 없음)'}"><button id="cb_s">전송</button>`;
  document.body.appendChild(d);G.chatOpen=true;
  const sel=d.querySelector('#cb_m'),inp=d.querySelector('#cb_t');if(mode)sel.value=mode;
  const close=()=>{d.remove();G.chatOpen=false;pressed={};document.getElementById('c').focus&&document.getElementById('c').focus()};
  const send=()=>{const v=inp.value.trim();if(v)sendChat(v,sel.value);close()};
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();send()}else if(e.key==='Escape')close()});
  d.querySelector('#cb_s').onclick=send;setTimeout(()=>inp.focus(),30);
}
async function sendChat(text,mode){
  if(text[0]==='/'){chatCommand(text);return}
  if(!ONLINE){pushChat({kind:'map',name:(ACCT?ACCT.name:'나'),text:text+'  (오프라인)'});return}
  if(!ACCT){sysChat('로그인해야 채팅할 수 있어요 (타이틀 → 로그인/회원가입)');return}
  if(mode==='mega'&&!(SAVE.mega.m>0)){sysChat('확성기가 없습니다. 옥수수 상인에게서 살 수 있어요 (300●)');return}
  if(mode==='hmega'&&!(SAVE.mega.h>0)){sysChat('고확성기가 없습니다. 옥수수 상인에게서 살 수 있어요 (◆2)');return}
  try{await api('POST','/api/chat',{text,kind:mode,map:S?S.id:'town',job:SAVE.job,lvl:SAVE.lvl});
    if(mode==='mega')SAVE.mega.m--;if(mode==='hmega')SAVE.mega.h--;if(mode!=='map')saveGame();pollOnce().catch(()=>{})}
  catch(e){sysChat(e.message)}
}
function chatCommand(text){
  const c=text.split(/\s+/)[0];
  if(c==='/운영'||c==='/admin'){if(!ISADMIN){sysChat('운영자만 사용할 수 있는 명령입니다');return}adminMenu();return}
  if(c==='/도움'||c==='/help'){sysChat('채팅: Enter · 일반(맵) / 확성기(전체) / 고확성기(전체+상단 알림) · 운영자: /운영');return}
  sysChat('알 수 없는 명령: '+c+'  (/도움)');
}
function adminMenu(){
  const go=async body=>{closeUI();try{await api('POST','/api/admin/event',body);pollOnce().catch(()=>{})}catch(e){sysChat(e.message)}};
  openDialog('운영자 이벤트','이벤트를 열면 접속 중인 모든 유저에게 알림이 뜨고 즉시 적용됩니다.\n\n현재: '+(evOn()?evText(EVENT)+' (남은 '+Math.ceil((EVENT.until-Date.now()-SRVOFF)/60000)+'분)':'진행 중인 이벤트 없음'),[
    {t:'경험치 2배 · 1시간',fn:()=>go({exp:2,drop:1,minutes:60,msg:'사냥하기 좋은 시간!'})},
    {t:'드롭률 2배 · 1시간',fn:()=>go({exp:1,drop:2,minutes:60,msg:'장비가 쏟아진다!'})},
    {t:'경험치·드롭 2배 · 2시간',fn:()=>go({exp:2,drop:2,minutes:120,msg:'주말 특별 이벤트'})},
    {t:'경험치 3배 · 30분',fn:()=>go({exp:3,drop:1,minutes:30,msg:'번개 이벤트!'})},
    {t:'이벤트 종료',fn:()=>go({off:true})},{t:'닫기',fn:closeUI}]);
}
function drawSocial(g,t){
  // 채팅 로그 (왼쪽 아래)
  const open=G.chatOpen,list=CHAT.filter(m=>open||G.t-m.at<14).slice(open?-10:-6);
  if(list.length){
    const lh=17,y0=H-(open?108:78)-list.length*lh;
    if(open||list.length){g.save();g.fillStyle=open?'rgba(255,245,252,.88)':'rgba(255,245,252,.55)';g.beginPath();g.roundRect(6,y0-17,open?566:318,list.length*lh+10,14);g.fill();g.strokeStyle='rgba(240,180,230,.9)';g.lineWidth=2;g.stroke();g.restore()}
    list.forEach((m,i)=>{
      const a=open?1:clamp((14-(G.t-m.at))/2,0,1);g.globalAlpha=a;
      const pre=m.kind==='rank'?'[명예의 전당] ':m.kind==='sys'?'[알림] ':m.kind==='event'?'[운영자] ':m.kind==='mega'?'[확성기] '+m.name+' : ':m.kind==='hmega'?'[고확성기] '+m.name+' : ':m.name+' : ';
      const col=m.kind==='rank'?'#c07a00':m.kind==='sys'?'#3a8ac0':m.kind==='event'?'#d03a9a':m.kind==='mega'?'#c04aa0':m.kind==='hmega'?'#b06a00':'#5a3a8a';
      g.font=F(12);let s=pre+m.text;while(g.measureText(s).width>(open?545:300)&&s.length>4)s=s.slice(0,-2);if(s!==pre+m.text)s+='…';
      txt(g,s,14,y0+i*lh,12,col,'left',0);
    });g.globalAlpha=1;
  }
  // 고확성기 상단 알림
  if(MEGABAN){const k=G.t-MEGABAN.t0;if(k>6)MEGABAN=null;else{const a=clamp(Math.min(k*3,(6-k)*2),0,1);g.globalAlpha=a;
    const m=MEGABAN.m,s='📢 '+m.name+' : '+m.text;g.font=F(16);const w=Math.min(800,g.measureText(s).width+50);
    const gr=g.createLinearGradient(W/2-w/2,0,W/2+w/2,0);['#ff5a8a','#ffd34a','#5ad48a','#5ab0ff','#c05aff'].forEach((c,i)=>gr.addColorStop(i/4,c));
    g.fillStyle='rgba(20,6,30,.9)';g.beginPath();g.roundRect(W/2-w/2,98,w,36,10);g.fill();g.strokeStyle=gr;g.lineWidth=3;g.stroke();txt(g,s,W/2,122,16,'#fff','center',3);g.globalAlpha=1}}
  drawRankBanner(g,t);
  // 이벤트 배지
  if(evOn()&&S&&!S.L.pq&&!S.L.pvp){const left=Math.ceil((EVENT.until-Date.now()-SRVOFF)/60000),s='🎉 '+evText(EVENT)+' · '+left+'분';g.font=F(13);const w=g.measureText(s).width+24;
    g.fillStyle='rgba(60,10,50,.8)';g.beginPath();g.roundRect(W/2-w/2,8,w,24,12);g.fill();g.strokeStyle='#ff8ae0';g.lineWidth=1.5;g.stroke();txt(g,s,W/2,25,13,'#ffd0f0','center',2)}
  // AP 알림

}
