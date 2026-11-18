/* ============================================================
   QUESTS / DIALOG / SHOP / WARDROBE / HUD / MENUS
   ============================================================ */
const FONT='"Jua","Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR","Nanum Gothic",sans-serif';
const F=(s,w='normal')=>`${w} ${Math.round(s*(window.TSC||.86)*10)/10}px ${FONT}`;
function txt(g,s,x,y,size=16,col='#fff',al='left',o=3){
  g.font=F(size);g.textAlign=al;g.textBaseline='alphabetic';
  if(o){g.lineWidth=o;g.strokeStyle='rgba(58,32,86,.95)';g.lineJoin='round';g.strokeText(s,x,y)}
  g.fillStyle=col;g.fillText(s,x,y);
}
function panel(g,x,y,w,h,a=.82){
  g.save();g.beginPath();g.roundRect(x,y,w,h,16);const bg=g.createLinearGradient(0,y,0,y+h);bg.addColorStop(0,`rgba(74,52,140,${a})`);bg.addColorStop(1,`rgba(46,30,96,${a})`);g.fillStyle=bg;g.fill();
  const st=g.createLinearGradient(x,0,x+w,0);st.addColorStop(0,'rgba(255,190,235,.9)');st.addColorStop(.5,'rgba(200,220,255,.9)');st.addColorStop(1,'rgba(255,230,180,.9)');g.lineWidth=2.5;g.strokeStyle=st;g.stroke();
  g.beginPath();g.roundRect(x+4,y+4,w-8,h-8,12);g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.18)';g.stroke();g.restore();
}
function wrap(g,s,maxW,size){
  g.font=F(size);const out=[];
  for(const para of String(s).split('\n')){
    let line='';
    for(const ch of para){const t=line+ch;if(g.measureText(t).width>maxW&&line){out.push(line);line=ch.trimStart()}else line=t}
    out.push(line);
  }
  return out;
}
function bar(g,x,y,w,h,v,col,bg='rgba(0,0,0,.6)'){
  g.fillStyle=bg;g.beginPath();g.roundRect(x,y,w,h,h/2);g.fill();
  if(v>0){g.fillStyle=col;g.beginPath();g.roundRect(x+1.5,y+1.5,Math.max(h-3,(w-3)*clamp(v,0,1)),h-3,(h-3)/2);g.fill();g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.roundRect(x+1.5,y+1.5,Math.max(h-3,(w-3)*clamp(v,0,1)),(h-3)/2,(h-3)/2);g.fill()}
  g.lineWidth=1.5;g.strokeStyle='rgba(0,0,0,.8)';g.beginPath();g.roundRect(x,y,w,h,h/2);g.stroke();
}
const nav=()=>({u:tap('up'),d:tap('down'),l:tap('left'),r:tap('right'),ok:tap('ok'),back:!!(pressed.Escape||pressed.Backspace)});

/* ---------------- quest logic ---------------- */
function qst(id){return SAVE.q[id]||(SAVE.q[id]={s:'none',p:[]})}
function qAvail(id){const q=QUESTS[id],st=qst(id);return st.s==='none'&&SAVE.lvl>=q.min&&(q.pre||[]).every(r=>qst(r).s==='done')&&(!q.story||q.story===1||steleOpen(q.story-1))}
function qAccept(id){
  const q=QUESTS[id],st=qst(id);st.s='active';
  st.p=q.objs.map(o=>o.t==='collect'?Math.min(o.n,SAVE.inv[o.item]||0):o.t==='lvl'?(SAVE.lvl>=o.n?o.n:0):o.t==='talk'?Math.min(o.n,Object.keys(SAVE.talked).length):0);
  qcheck(id);G.toast('퀘스트 수락: '+q.name);sfx('sel');saveGame();
}
function qcheck(id){
  const q=QUESTS[id],st=qst(id);if(st.s!=='active')return;
  if(q.objs.every((o,i)=>st.p[i]>=(o.n||1))){st.s='ready';G.toast('퀘스트 완료! ['+q.name+'] — '+GIVER_NAME[q.giver]+'에게 보고하세요');sfx('flag')}
}
function qev(type,d){
  if(!SAVE)return;
  if(type==='flag'&&!d)return;
  for(const id in SAVE.q){
    const st=SAVE.q[id];if(st.s!=='active')continue;const q=QUESTS[id];let ch=false;
    q.objs.forEach((o,i)=>{
      const nn=o.n||1;if(st.p[i]>=nn)return;let v=st.p[i];
      if(type==='kill'&&o.t==='kill'&&(o.mob==='any'?d.mob!=='dummy':o.mob===d.mob)&&(!o.map||(S&&S.id.startsWith(o.map))))v++;
      else if(type==='dg'&&o.t==='dg'&&o.ch===d.ch)v++;
      else if(type==='boss'&&o.t==='boss'&&o.id===d.id)v=o.n>1?v+1:nn;
      else if(type==='flag'&&o.t==='flag'&&o.key===d)v=1;
      else if(type==='reach'&&o.t==='reach'&&o.map===d.map)v=1;
      else if(type==='collect'&&o.t==='collect'&&o.item===d.item)v++;
      else if(type==='count'&&o.t==='count'&&o.key===d.key)v+=d.n||1;
      else if(type==='talk'&&o.t==='talk')v=Math.min(nn,Object.keys(SAVE.talked).length);
      else if(type==='lvl'&&o.t==='lvl')v=SAVE.lvl>=o.n?nn:0;
      else if(type==='pq'&&o.t==='pq')v++;
      v=Math.min(v,nn);if(v!==st.p[i]){st.p[i]=v;ch=true}
    });
    if(ch)qcheck(id);
  }
}
function qExp(q){
  const r=q.rew;if(r.pct==='d')return Math.max(5,Math.round(need(SAVE.lvl)*dailyPct(SAVE.lvl)));
  if(r.pct)return Math.round(need(SAVE.lvl)*r.pct);return r.exp||0;
}
function qCoin(q){return q.daily?100+SAVE.lvl*10:(q.rew.coin||0)}
function qTurnIn(id){
  const q=QUESTS[id],st=qst(id);if(st.s!=='ready')return;
  for(const o of q.objs)if(o.t==='collect')SAVE.inv[o.item]=Math.max(0,(SAVE.inv[o.item]||0)-o.n);
  st.s='done';const lines=[];
  const ex=qExp(q),cn=qCoin(q);
  if(ex){gainExp(ex);lines.push('경험치 +'+ex)}
  if(cn){SAVE.coins+=cn;lines.push('야채코인 +'+cn)}
  if(q.rew.item){if(!SAVE.inv[q.rew.item]){SAVE.inv[q.rew.item]=1;lines.push('획득: '+ITEMS[q.rew.item].n+' ['+RARITY[ITEMS[q.rew.item].r]+']')}else{SAVE.coins+=ITEMS[q.rew.item].price/2|0;lines.push('중복 아이템 → '+(ITEMS[q.rew.item].price/2|0)+' 코인')}}
  if(q.rew.give)for(const k in q.rew.give){SAVE.inv[k]=(SAVE.inv[k]||0)+q.rew.give[k];lines.push('획득: '+ETC_NAME[k]+' ×'+q.rew.give[k])}
  if(q.rew.gear){const g=GEAR[q.rew.gear];if(!SAVE.ginv[q.rew.gear]){SAVE.ginv[q.rew.gear]=1;lines.push('★ 획득: ['+GRADE[g.gr]+'] '+g.n+'  (인벤토리 I → 장비)')}else{SAVE.coins+=1000;lines.push('중복 장비 → 1000 코인')}}
  if(q.rep){st.s='none';st.p=[]}
  if(q.adv){advanceJob(q.adv);lines.push('전직 완료!  '+jline(JOB[SAVE.job],q.adv))}
  sfx('lvl');saveGame();return lines;
}
function advanceJob(t){
  SAVE.tier=t;const p=PARTY[0];p.tier=t;recalc(p);p.hp=p.maxhp;p.mp=p.maxmp;
  spark(p.x,p.y-40,60,'#ffe04a',420,1,5,0,true);S.fx.push({k:'ring',x:p.x,y:p.y-40,r:260,t:0,max:1,col:'#ffe04a'});S.shake=14;
  G.toast(jline(JOB[SAVE.job],t)+'(으)로 전직했다!  새 스킬 해금');
}
function npcMark(id){
  let rd=false,nw=false,ac=false;
  for(const k in QUESTS){if(QUESTS[k].giver!==id)continue;const s=qst(k).s;if(s==='ready')rd=true;else if(s==='none'&&qAvail(k))nw=true;else if(s==='active')ac=true}
  return rd?'ready':nw?'new':ac?'act':null;
}

/* ---------------- dialog ---------------- */
function openDialog(name,text,opts){G.ui='dialog';G.dlg={name,text,opts:opts||[{t:'닫기',fn:closeUI}],sel:0};sfx('sel')}
function closeUI(){G.ui=null;G.dlg=null;pressed={}}
function faceMenu(n){
  openDialog(n.name,'어떤 표정이 좋아? (지금: '+FACES[SAVE.fid|0]+')',FACES.map((f,i)=>({t:(i===(SAVE.fid|0)?'✔ ':'')+f,fn:()=>{SAVE.fid=i;PARTY[0].fid=i;saveGame();sfx('pickup');faceMenu(n);G.dlg.sel=i}})).concat([{t:'닫기',fn:closeUI}]));
}
function questMenu(n,giver,intro){
  const ids=Object.keys(QUESTS).filter(k=>QUESTS[k].giver===giver&&(qst(k).s!=='none'||qAvail(k)));
  const opts=ids.map(k=>{const s=qst(k).s;return{t:({none:'[!] ',active:'[진행중] ',ready:'[완료!] ',done:'[끝] '})[s]+QUESTS[k].name,fn:()=>questDetail(n,giver,k)}});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,intro||'무엇을 도와줄까?',opts);
}
function questDetail(n,giver,id){
  const q=QUESTS[id],st=qst(id);
  let txt_=q.desc+'\n\n';
  q.objs.forEach((o,i)=>{txt_+=(st.s==='none'?'▫ ':(st.p[i]>=(o.n||1)?'✔ ':'▫ '))+o.label+(o.n>1&&st.s!=='none'?'  ('+Math.min(st.p[i],o.n)+'/'+o.n+')':(o.n>1?'  ×'+o.n:''))+'\n'});
  const r=q.rew;txt_+='\n보상: EXP '+qExp(q)+'  코인 '+qCoin(q)+'  '+(r.item?'['+ITEMS[r.item].n+']':'')+(r.gear?'  ['+GRADE[GEAR[r.gear].gr]+'] '+GEAR[r.gear].n+' ('+gearDesc(r.gear)+')':'')+(r.give?'  '+Object.keys(r.give).map(k=>ETC_NAME[k]+'×'+r.give[k]).join(' '):'')+(q.adv?'  ★'+q.adv+'차 전직':'')+(q.rep?'\n(반복 가능)':'');
  const opts=[];
  if(st.s==='none')opts.push({t:'수락한다',fn:()=>{qAccept(id);if(q.sceneA)playScene(q.sceneA,()=>questMenu(n,giver,'부탁하네!'));else questMenu(n,giver,'좋아, 잘 부탁하네!')}});
  if(st.s==='ready')opts.push({t:'완료 보고',fn:()=>{const l=qTurnIn(id);if(q.sceneB){playScene(q.sceneB,()=>openDialog(n.name,'퀘스트 완료!\n\n'+l.join('\n'),[{t:'확인',fn:()=>questMenu(n,giver)}]));return}openDialog(n.name,'수고했네! 퀘스트 완료!\n\n'+l.join('\n'),[{t:'확인',fn:()=>questMenu(n,giver)}])}});
  opts.push({t:'뒤로',fn:()=>questMenu(n,giver)});
  openDialog(n.name+' · '+q.name,txt_,opts);
}
/* ---------------- 일일 퀘스트 ---------------- */
const DAILY_IDS=Object.keys(QUESTS).filter(k=>QUESTS[k].daily);
const todayKey=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
function checkDaily(){
  const k=todayKey();if(SAVE.dayKey===k)return false;
  SAVE.dayKey=k;SAVE.dbonus=false;
  for(const id of DAILY_IDS){SAVE.q[id]={s:'none',p:[]};}
  saveGame();return true;
}
function dailyDone(){return DAILY_IDS.every(k=>qst(k).s==='done')}
function dailyMenu(n){
  checkDaily();
  const done=DAILY_IDS.filter(k=>qst(k).s==='done').length;
  const opts=DAILY_IDS.map(k=>({t:({none:'[!] ',active:'[진행중] ',ready:'[완료!] ',done:'[끝] '})[qst(k).s]+QUESTS[k].name.replace('[일일] ',''),fn:()=>questDetail(n,'daily',k)}));
  if(dailyDone()&&!SAVE.dbonus)opts.push({t:'[보너스!] 올클리어 보상 받기',fn:()=>{
    SAVE.dbonus=true;SAVE.ec+=2;const ex=Math.max(10,Math.round(need(SAVE.lvl)*dailyPct(SAVE.lvl)*2)),cn=500+SAVE.lvl*30;gainExp(ex);SAVE.coins+=cn;sfx('lvl');saveGame();
    openDialog(n.name,'오늘의 의뢰를 전부 해냈구나! 대단해!\n\n경험치 +'+ex+'\n야채코인 +'+cn+'\n이벤트 코인 ◆ +2',[{t:'확인',fn:()=>dailyMenu(n)}])}});
  opts.push({t:'닫기',fn:closeUI});
  const pc=(dailyPct(SAVE.lvl)*100).toFixed(1).replace('.0','');
  openDialog(n.name,'매일 새로 붙는 일일 의뢰다. 자정이 지나면 초기화돼!\n의뢰 1개당 경험치 = 현재 레벨 필요량의 '+pc+'%\n올클리어 보너스 = 그 2배 + 이벤트 코인 ◆2\n\n오늘 완료 '+done+' / '+DAILY_IDS.length+(SAVE.dbonus?'  (보너스 수령 완료)':''),opts);
}
/* ---------------- 전직 NPC ---------------- */
const ADV_INFO={coach:{t:1,qid:'j1',place:'야채마을'},adv2:{t:2,qid:'j2',place:'도깨비 숲 꼭대기'},adv3:{t:3,qid:'j3',place:'하늘길 끝 달빛 신당'}};
function advMenu(n){
  const a=ADV_INFO[n.id],j=JOB[SAVE.job],opts=[],qid=a.qid,st=qst(qid).s;
  if(st!=='none'||qAvail(qid))opts.push({t:({none:'[!] ',active:'[진행중] ',ready:'[완료!] ',done:'[끝] '})[st]+QUESTS[qid].name,fn:()=>questDetail(n,n.id,qid)});
  opts.push({t:'내 직업 · 스킬 보기',fn:()=>jobInfoDialog(n)});opts.push({t:'닫기',fn:closeUI});
  let msg='현재: '+jline(j,SAVE.tier)+' ('+SAVE.tier+'차)\n\n';
  if(SAVE.tier>=a.t)msg+='이미 '+a.t+'차 전직을 마쳤구나. 더 높은 곳을 노려라!';
  else if(SAVE.tier<a.t-1)msg+='아직 이르다. 먼저 '+(a.t-1)+'차 전직부터 마쳐라.';
  else if(SAVE.lvl<ADV_LV[a.t])msg+=a.t+'차 전직은 Lv.'+ADV_LV[a.t]+' 부터다. (현재 Lv.'+SAVE.lvl+')';
  else msg+='준비가 됐군. 시험을 받아보겠나?';
  const intro={coach:'나는 1차 전직 교관 고추! 수련생 졸업은 Lv.10.\n',adv2:'……여기까지 올라오다니. 숲 꼭대기의 스승이다. 2차 전직은 Lv.30.\n',adv3:'달빛 아래 닿은 자여. 3차 전직은 Lv.70, 가장 높은 근육의 경지다.\n'}[n.id];
  openDialog(n.name,intro+msg,opts);
}
/* ---------------- 출석 / 이벤트 코인 ---------------- */
const dayNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000);
function attMenu(n){
  const a=SAVE.att,dn=dayNum();
  if(a.last>=0&&a.last<dn-1&&a.streak>0&&a.last!==dn)a.streakBroken=true;
  const done=a.last===dn,cur=done?a.streak:(a.last===dn-1?a.streak:0),mark=((cur-1+7)%7)+1;
  const shown=cur===0?0:(cur%7===0?7:cur%7);
  let bar='';for(let i=1;i<=7;i++)bar+=(i<=shown?'■':'□');
  const opts=[];
  if(!done)opts.push({t:'출석 도장 찍기!',fn:()=>checkIn(n)});
  opts.push({t:'이벤트 상점 안내',fn:()=>openDialog(n.name,'이벤트 상점(양배추)은 마을 가운데쯤에 있어. 캐시 치장템은 거기서 ◆ 이벤트 코인으로만 살 수 있어!\n\n◆ 얻는 법\n· 매일 출석 (연속일수 보상)\n· 7일 연속 출석 → 캐시템 지급\n· 누적 출석 10/20/30/50/100일 보너스\n· 일일 퀘스트 올클리어 ◆2 · PvP 승리 ◆1',[{t:'뒤로',fn:()=>attMenu(n)}])});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,'매일 도장을 찍으면 이벤트 코인(◆)을 줘요! 하루라도 빠지면 연속 출석이 처음부터예요.\n\n연속 출석  '+bar+'  ('+shown+'/7)'+(done?'   — 오늘 출석 완료!':'')+'\n누적 출석 '+a.total+'일 · 보유 ◆ '+SAVE.ec+'\n\n보상: 1·2일 ◆3 / 3·4일 ◆5 / 5·6일 ◆8 / 7일 ◆20 + 캐시 치장템',opts);
}
function checkIn(n){
  const a=SAVE.att,dn=dayNum();if(a.last===dn)return attMenu(n);
  a.streak=(a.last===dn-1)?a.streak+1:1;a.last=dn;a.total++;
  const idx=(a.streak-1)%7,ec=ATT_DAY[idx],lines=['연속 '+a.streak+'일째 출석!','이벤트 코인 ◆ +'+ec];
  SAVE.ec+=ec;
  if(idx===6){
    a.weeks=(a.weeks||0)+1;const free=ATT_WEEK_ITEMS.filter(k=>!SAVE.inv[k]);
    if(free.length){const k=free[0];SAVE.inv[k]=1;lines.push('7일 연속 출석 보상!  획득: '+ITEMS[k].n)}
    else{SAVE.ec+=30;lines.push('7일 연속 출석 보상!  (캐시템을 모두 가졌다) ◆ +30')}
  }
  if(ATT_MILE[a.total]){SAVE.ec+=ATT_MILE[a.total];lines.push('누적 '+a.total+'일 달성 보너스 ◆ +'+ATT_MILE[a.total])}
  sfx('lvl');saveGame();
  openDialog(n.name,'도장 쾅! 오늘도 출석했구나!\n\n'+lines.join('\n'),[{t:'확인',fn:()=>attMenu(n)}]);
}
/* ---------------- 숨은 주문서 상인 ---------------- */
const enhSlots=()=>7+SAVE.tier;
function enhText(){const e=SAVE.enh;return '근육 강화 +'+e.atk+' (공격력 +'+(e.atk*1.2).toFixed(1)+'%)\n체력 강화 +'+e.hp+' (체력 +'+(e.hp*1.5).toFixed(1)+'%)\n남은 주문서 슬롯 '+(enhSlots()-e.used)+' / '+enhSlots()+'  (전직할 때마다 슬롯 +1)'}
function keepSel(fn,sel){fn();if(G.dlg)G.dlg.sel=Math.min(sel,G.dlg.opts.length-1)}
function scrollMenu(n){
  openDialog(n.name,'쉿… 목소리를 낮추게. 나는 아무한테나 안 파는 보따리 장수라네.\n주문서는 슬롯을 한 칸 쓰고, 성공해야 강화가 된다네. 순백의 주문서로 슬롯을 되살릴 수도 있지.\n\n'+enhText(),[
    {t:'주문서 구매  (● '+SAVE.coins+')',fn:()=>scrollBuy(n)},{t:'주문서 사용',fn:()=>scrollUse(n)},{t:'닫기',fn:closeUI}]);
}
function scrollBuy(n,sel){
  const ks=Object.keys(SCROLLS);
  const opts=ks.map(k=>{const d=SCROLLS[k];return{t:d.n+'  '+d.price+'●  (보유 '+(SAVE.scrolls[k]||0)+')',fn:()=>{
    if(SAVE.coins<d.price){G.toast('코인이 부족합니다');return}
    SAVE.coins-=d.price;SAVE.scrolls[k]=(SAVE.scrolls[k]||0)+1;sfx('pickup');saveGame();keepSel(()=>scrollBuy(n),ks.indexOf(k))}}});
  opts.push({t:'뒤로',fn:()=>scrollMenu(n)});
  openDialog(n.name,'어떤 주문서가 필요한가?\n근육 : 공격력 / 체력 : 최대 체력\n성공 시 강화 수치가 오른다네.\n\n보유 코인 ● '+SAVE.coins+'\n'+enhText(),opts);
  if(sel!==undefined)G.dlg.sel=sel;
}
function scrollUse(n){
  const ks=Object.keys(SCROLLS).filter(k=>SAVE.scrolls[k]>0);
  const opts=ks.map(k=>({t:SCROLLS[k].n+'  ×'+SAVE.scrolls[k],fn:()=>useScroll(n,k)}));
  if(!ks.length)opts.push({t:'(보유한 주문서가 없다)',fn:()=>scrollMenu(n)});
  opts.push({t:'뒤로',fn:()=>scrollMenu(n)});
  openDialog(n.name,'어떤 주문서를 쓰겠나?\n\n'+enhText(),opts);
}
function scrollApply(k){   // 주문서 1장 사용 → {ok,msg} (슬롯 없음 등은 used:false)
  const d=SCROLLS[k],e=SAVE.enh,p=PARTY[0];
  if(!(SAVE.scrolls[k]>0))return{used:false,msg:'주문서가 없다'};
  if(d.apreset){const tot=SAVE.ap.str+SAVE.ap.dex+SAVE.ap.int+SAVE.ap.luk-16+SAVE.apFree;SAVE.ap={str:4,dex:4,int:4,luk:4};SAVE.apFree=tot;SAVE.scrolls[k]--;gearValidate();recalc(p);sfx('lvl');saveGame();return{used:true,ok:true,msg:'능력치가 초기화됐다! AP '+tot+' — O 키로 다시 분배하자'}}
  if(d.white){
    if(e.used<=0)return{used:false,msg:'복구할 슬롯이 없다. 지금 슬롯은 모두 멀쩡해!'};
    SAVE.scrolls[k]--;e.used--;sfx('lvl');spark(p.x,p.y-40,24,'#ffffff',260,.8,4,0,true);saveGame();
    return{used:true,ok:true,msg:'순백의 빛이 퍼진다…\n슬롯 1칸이 복구되었다!'};
  }
  if(e.used>=enhSlots())return{used:false,msg:'남은 슬롯이 없다. 순백의 주문서로 슬롯을 되살리거나 전직하자!'};
  SAVE.scrolls[k]--;e.used++;let msg,ok=Math.random()<d.rate;
  if(ok){e[d.stat]+=d.pts;recalc(p);sfx('lvl');spark(p.x,p.y-40,40,d.stat==='atk'?'#ff9a4a':'#6aff8a',320,.9,4,200,true);S.fx.push({k:'ring',x:p.x,y:p.y-40,r:150,t:0,max:.7,col:'#ffe04a'});
    msg='주문서 성공!!!\n'+(d.stat==='atk'?'근육 강화':'체력 강화')+' +'+d.pts+'  →  +'+e[d.stat]}
  else{sfx('hurt');spark(p.x,p.y-40,16,'#888',180,.6);msg='주문서가 타버렸다… 실패!\n(슬롯만 1칸 소모됨)'}
  saveGame();return{used:true,ok,msg};
}
function useScroll(n,k){
  const r=scrollApply(k);
  if(!r.used){openDialog(n.name,r.msg+'\n\n'+enhText(),[{t:'뒤로',fn:()=>scrollUse(n)}]);return}
  const again=SAVE.scrolls[k]>0;
  openDialog(n.name,r.msg+'\n\n'+enhText(),[again?{t:'같은 주문서 또 사용  (×'+SAVE.scrolls[k]+')',fn:()=>useScroll(n,k)}:{t:'다른 주문서 사용',fn:()=>scrollUse(n)},{t:'뒤로',fn:()=>scrollMenu(n)}]);
}
function duelMenu(n){
  const has2=PARTY.some(p=>p.kind==='p2'),d=SAVE.duel||(SAVE.duel={w:0,l:0});
  openDialog(n.name,'낙사 결투장! 서로 공격해서 체력을 깎고, 맞을수록 더 멀리 밀려난다.\n섬 밖으로 밀려 떨어지면 낙사 = 상대 1점. 3점을 먼저 따면 승리!\n\n'+(has2?'2P 로컬 대전: 1P vs 2P':'상대는 AI 도전자 (2P를 파티에서 참가시키면 1P vs 2P)')+'\n전적 '+d.w+'승 '+d.l+'패',[
    {t:'결투장 입장',fn:()=>{closeUI();goMap('pvp')}},{t:'닫기',fn:closeUI}]);
}
function talkNPC(n){
  if(!SAVE.talked[n.id]){SAVE.talked[n.id]=1;qev('talk',{})}
  const p=PARTY[0];
  if(n.id==='taxi')return taxiMenu(n);
  if(['swingkid','roofcat','balloon','lookout'].includes(n.id))return talkExtra(n);
  if(n.id==='chief'){
    const intro=qst('h4').s!=='done'?'오, 항구에서 온 모험가로구나! 야채마을에 온 걸 환영하네.':'야채 용사여, 오늘도 근육은 잘 있는가?\n소문에 마을 어딘가 높은 곳에 수상한 보따리 장수가 숨어 있다더군. 반짝이는 빛을 찾아보게나.';
    questMenu(n,'chief',intro);
  }else if(n.id==='board')questMenu(n,'board','마을 사람들이 붙여둔 의뢰서다. 보상은 두둑하다!');
  else if(n.id==='coach'||n.id==='adv2'||n.id==='adv3')advMenu(n);
  else if(n.id==='daily')dailyMenu(n);
  else if(n.id==='duel')duelMenu(n);
  else if(n.id==='att')attMenu(n);
  else if(n.id==='dol')dolMenu(n);
  else if(/^c[1-6]$/.test(n.id))questMenu(n,n.id,CH[+n.id[1]].hero.n+'\n「'+CH[+n.id[1]].title+'」의 주인공.\n\n'+'비석 앞에서 ↑ 로 이 이야기의 점프맵 · 던전 · 결말에 들어갈 수 있다.');
  else if(n.id==='zgate')questMenu(n,'zgate',SAVE.lvl<40?'귀문은 Lv.40 이상만 지날 수 있다. 더 강해져서 오게.':'여기는 천년 귀목이 잠든 귀문이다.\n1) 숨겨진 길(점프맵)을 돌파하고  2) 금이빨로 귀안을 만들어  3) 제단에 바쳐 귀목을 깨워라.\n보유 귀안: '+(SAVE.inv.gwi||0)+'개 · 금이빨 '+(SAVE.inv.gtooth||0)+'개');
  else if(n.id==='cash')openShop(true);
  else if(n.id==='scroll')scrollMenu(n);
  else if(n.id==='shop')openShop();
  else if(n.id==='closet')openDialog(n.name,'반짝반짝~ 오늘은 뭘 바꿔 볼까?',[{t:'옷장 열기 (치장)',fn:()=>{closeUI();openWardrobe()}},{t:'표정 바꾸기 ('+FACES[SAVE.fid|0]+')',fn:()=>faceMenu(n)},{t:'닫기',fn:closeUI}]);
  else if(n.id==='fame')openFame();
  else if(n.id==='captain')questMenu(n,'captain',qst('tut1').s==='none'?'어서 오게, 새내기 모험가! 여기는 새싹 항구야.\n큰 세상으로 나가기 전에 기초부터 익혀 보세.':'파도 소리 좋지? Lv.5가 되면 오른쪽 부두의 배를 타고 야채마을로 갈 수 있다네.');
  else if(n.id==='fisher')questMenu(n,'fisher','오늘은 물때가 좋아~ 조개가 잔뜩 쓸려 왔지 뭐야.');
  else if(n.id==='baker')questMenu(n,'baker','갓 구운 호박빵 냄새 맡았어? 항구 사람들 모두 이 빵으로 하루를 시작해!');
  else if(n.id==='kid')openDialog(n.name,['형아 누나! 저 배 타면 어디 가는지 알아? 야채마을이래!','나도 크면 당근 활 쏘는 궁수 될 거야. 피융피융!','슬라임은 말랑말랑해서 맞아도 하나도 안 아파… 아마도?'][Math.random()*3|0]);
  else if(n.id==='party')partyMenu(n);
  else if(n.id==='portal'){
    const opts=[{t:'도깨비 숲 (점프맵)',fn:()=>{closeUI();goMap('forest')}}];
    if(SAVE.cleared.dokkaebi)opts.push({t:'하늘길 (점프맵)',fn:()=>{closeUI();goMap('sky')}});
    else opts.push({t:'하늘길 (도깨비 대왕 격파 후 개방)',fn:()=>openDialog(n.name,'하늘길은 도깨비 대왕을 쓰러뜨려야 열리네.')});
    if(SAVE.cleared.dokkaebi)opts.push({t:'도깨비 대왕 재도전',fn:()=>{closeUI();goMap('boss1')}});
    if(SAVE.cleared.fox)opts.push({t:'구미호 재도전',fn:()=>{closeUI();goMap('boss2')}});
    opts.push({t:'사냥터로 가기 …',fn:()=>openDialog(n.name,'어느 사냥터로 보내 줄까? 레벨에 맞는 곳이 경험치가 좋다네.',HUNTS.map(h=>({t:h.name+'  ('+h.lv+')'+(SAVE.lvl<h.min?' 🔒':''),fn:()=>{if(SAVE.lvl<h.min){G.toast(h.name+'은(는) Lv.'+h.min+'부터 갈 수 있어요');return}closeUI();goMap(h.id)}})).concat([{t:'닫기',fn:closeUI}]))});
    opts.push({t:'새싹 항구 (배 타고 돌아가기)',fn:()=>{closeUI();goMap('harbor')}});
    opts.push({t:SAVE.lvl>=15?'비석의 길 (스토리 던전)':'비석의 길 (Lv.15 이상)',fn:()=>{if(SAVE.lvl<15){openDialog(n.name,'비석의 길은 Lv.15 이상만 들어갈 수 있다네.');return}closeUI();goMap('stele')}});
    opts.push({t:SAVE.lvl>=40?'귀문 동굴 (파티던전)':'귀문 동굴 (Lv.40 이상)',fn:()=>{if(SAVE.lvl<40){openDialog(n.name,'귀문은 Lv.40 이상만 들어갈 수 있다네. 그 너머엔 천년 묵은 귀목이 잠들어 있지…');return}closeUI();goMap('cave')}});
    opts.push({t:'닫기',fn:closeUI});
    openDialog(n.name,'나무아미타불… 어디로 가시려는가? 마을 동쪽 포탈로도 이동할 수 있네.',opts);
  }
  else if(n.id==='miko')mikoMenu(n);
}
function jobInfoDialog(n){
  const j=JOB[SAVE.job];let t='';
  j.sk.forEach((s,i)=>{t+=(SAVE.tier>=SK_TIER[i]?'':'🔒')+'['+SK_LABEL[i]+'] '+s.n+'  (MP '+s.mp+' · 쿨 '+s.cd+'s)'+(SK_TIER[i]>=1?'  ← '+SK_TIER[i]+'차':'  (수련생)')+'\n'});
  openDialog(n.name,j.role+' : 초보자 → '+j.line.join(' → ')+'\n'+j.bio+'\n\n'+t,[{t:'뒤로',fn:()=>talkNPC(n)}]);
}
function mikoMenu(n){
  const opts=[];
  const ids=['hid'].filter(k=>qst(k).s!=='none'||qAvail(k));
  ids.forEach(k=>opts.push({t:({none:'[!] ',active:'[진행중] ',ready:'[완료!] ',done:'[끝] '})[qst(k).s]+QUESTS[k].name,fn:()=>questDetail(n,'miko',k)}));
  if(qst('hid').s==='active'||qst('hid').s==='ready'||qst('hid').s==='done'||SAVE.lvl>=6)opts.push({t:'달걀 슬라임 소굴로 들어간다 (파티 3명 필요)',fn:()=>enterPQ(n)});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,'……찾아냈구나. 이 마을 구석까지 오는 자는 드문데.\n달걀 슬라임 소굴에 영혼들이 갇혀 있어. 혼자서는 열 수 없는 문… 세 명이 힘을 모아야 해.',opts);
}
function enterPQ(n){
  if(PARTY.length<3){
    openDialog(n.name,'세 명 이상의 파티가 필요해.\nAI 동료로 빈자리를 채워줄까?',[{t:'AI 동료로 채우고 입장',fn:()=>{while(PARTY.length<3)addMember('ai',JOBS[Math.random()*8|0].id);closeUI();startPQ()}},{t:'파티 모집꾼을 찾아간다',fn:closeUI}]);
    return;
  }
  closeUI();startPQ();
}
function partyMenu(n){
  const has2=PARTY.some(p=>p.kind==='p2'),nAI=PARTY.filter(p=>p.kind==='ai').length;
  const opts=[
    {t:has2?'2P 로컬 플레이어 해제':'2P 로컬 플레이어 참가  (WASD · F · G/H/T/Y/U)',fn:()=>{if(has2)removeMember(PARTY.find(p=>p.kind==='p2'));else if(PARTY.length<4)jobPick('2P 직업 선택',id=>{addMember('p2',id);partyMenu(n)});else openDialog(n.name,'파티가 가득 찼어!');if(has2)partyMenu(n)}},
    {t:'AI 동료 추가 ('+nAI+')',fn:()=>{if(PARTY.length>=4)return openDialog(n.name,'파티는 최대 4명이야!',[{t:'뒤로',fn:()=>partyMenu(n)}]);jobPick('AI 동료 직업 선택',id=>{addMember('ai',id);partyMenu(n)})}},
    {t:'AI 동료 해제',fn:()=>{const a=PARTY.filter(p=>p.kind==='ai').pop();if(a)removeMember(a);partyMenu(n)}},
    {t:'닫기',fn:closeUI}];
  openDialog(n.name,'파티를 꾸려보자! 현재 '+PARTY.length+'명.\n온라인 접속은 못 하지만, 한 키보드에서 둘이 같이 하거나 AI 동료와 함께할 수 있어.\n\n· AI 동료는 따라다니며 싸우고, 사제는 치유해 준다\n· 파티퀘스트에서 E 키 : AI 동료를 발판 위로 보내 대기시키기',opts);
}
function jobPick(title,fn){
  openDialog(title,'직업을 고르세요.',JOBS.map(j=>({t:j.role,fn:()=>{closeUI();fn(j.id)}})).concat([{t:'취소',fn:closeUI}]));
}
function addMember(kind,jobId){
  const lead=PARTY[0],lv=SAVE.lvl,p=mkPlayer(kind,jobId,lv);
  p.tier=kind==='p1'?SAVE.tier:tierOfLv(lv);recalc(p);p.hp=p.maxhp;p.mp=p.maxmp;
  p.slot=PARTY.length;p.x=lead.x-lead.face*40;p.y=lead.y;p.face=lead.face;
  const pool=Object.keys(ITEMS).filter(k=>!ITEMS[k].cash);if(kind==='ai'||kind==='p2'){for(const s of['hat','face','outfit','cape','aura']){if(Math.random()<(s==='aura'?.25:.5)){const c=pool.filter(k=>ITEMS[k].slot===s);p.eq[s]=c[Math.random()*c.length|0]}}}
  PARTY.push(p);spark(p.x,p.y-30,16,'#cfe0ff',200,.5,3,0,true);sfx('portal');
  G.toast((kind==='ai'?'AI 동료':kind==='p2'?'2P':'')+' '+jline(JOB[jobId],p.tier)+' 합류!');
}
function removeMember(p){PARTY.splice(PARTY.indexOf(p),1);PARTY.forEach((q,i)=>q.slot=i)}

/* ---------------- shop ---------------- */
function openShop(cash){G.ui='shop';G.shop={tab:cash?2:0,sel:0,cash:!!cash};sfx('sel')}
function shopList(){
  if(G.shop.cash)return CASH_ITEMS.map(id=>({id,cash:1}));
  return G.shop.tab===0?[{id:'hp',potion:true},{id:'mp',potion:true},{id:'m',mega:1},{id:'h',mega:1}]:SHOP_ITEMS.map(id=>({id}));
}
function shopUpdate(){
  const nv=nav(),lst=shopList();
  if(nv.back){closeUI();return}
  if((nv.l||nv.r)&&!G.shop.cash){G.shop.tab=1-G.shop.tab;G.shop.sel=0;sfx('sel')}
  if(nv.u)G.shop.sel=(G.shop.sel+lst.length-1)%lst.length;
  if(nv.d)G.shop.sel=(G.shop.sel+1)%lst.length;
  if(nv.ok){
    const it=lst[G.shop.sel];
    if(it.mega){const d=MEGA[it.id],ec=d.cur==='◆',have=ec?SAVE.ec:SAVE.coins;if(have>=d.price){if(ec)SAVE.ec-=d.price;else SAVE.coins-=d.price;SAVE.mega[it.id]++;sfx('pickup');G.toast(d.n+' 구매! (Enter 채팅에서 선택)');saveGame()}else G.toast(ec?'이벤트 코인이 부족합니다':'코인이 부족합니다')}
    else if(it.potion){const pr=POTION[it.id].price;if(SAVE.coins>=pr){SAVE.coins-=pr;SAVE.potions[it.id]++;sfx('pickup');G.toast(POTION[it.id].n+' 구매!')}else G.toast('코인이 부족합니다')}
    else if(it.cash){const d=ITEMS[it.id];if(SAVE.inv[it.id])G.toast('이미 가지고 있습니다');else if(SAVE.ec>=d.ec){SAVE.ec-=d.ec;SAVE.inv[it.id]=1;sfx('lvl');G.toast(d.n+' 구매! 옷장(I)에서 착용하세요');saveGame()}else G.toast('이벤트 코인이 부족합니다 (출석·일일 올클리어)')}
    else{const d=ITEMS[it.id];if(SAVE.inv[it.id])G.toast('이미 가지고 있습니다');else if(SAVE.coins>=d.price){SAVE.coins-=d.price;SAVE.inv[it.id]=1;sfx('lvl');G.toast(d.n+' 구매! 옷장에서 착용하세요');saveGame()}else G.toast('코인이 부족합니다')}
  }
  
}
function drawShop(g,t){
  g.fillStyle='rgba(8,4,16,.6)';g.fillRect(0,0,W,H);
  panel(g,60,40,840,460,.92);
  txt(g,G.shop.cash?'채근담담 이벤트 상점 (캐시)':'옥수수 상인의 가게',90,84,26,G.shop.cash?'#ff8ae0':'#ffe9a0');
  txt(g,G.shop.cash?'◆ '+SAVE.ec:'● '+SAVE.coins,870,84,22,G.shop.cash?'#ff8ae0':'#ffd34a','right');
  if(!G.shop.cash)['소비','치장'].forEach((s,i)=>{g.fillStyle=G.shop.tab===i?'#ffd34a':'rgba(255,255,255,.12)';g.beginPath();g.roundRect(90+i*110,100,100,30,8);g.fill();txt(g,s,140+i*110,122,16,G.shop.tab===i?'#2a1a00':'#fff','center',0)});
  txt(g,G.shop.cash?'이벤트 코인은 출석 · 일일 올클리어로 획득 · Enter 구매':'← → 탭 · ↑↓ 선택 · Enter 구매 · Esc 닫기',870,122,13,'#cfd4e2','right',2);
  const lst=shopList(),per=7,pg=Math.floor(G.shop.sel/per),st=pg*per;
  lst.slice(st,st+per).forEach((it,i)=>{
    const y=150+i*42,sel=st+i===G.shop.sel;
    g.fillStyle=sel?'rgba(255,220,120,.22)':'rgba(255,255,255,.05)';g.beginPath();g.roundRect(90,y,520,38,8);g.fill();
    if(sel){g.strokeStyle='#ffd34a';g.lineWidth=2;g.stroke()}
    if(it.mega){const d=MEGA[it.id];txt(g,d.n+'  — '+d.d,110,y+25,15,'#ffb0e0');txt(g,'보유 '+SAVE.mega[it.id],520,y+25,13,'#cfd4e2','right',2);txt(g,d.price+d.cur,590,y+25,16,d.cur==='◆'?'#ff8ae0':'#ffd34a','right')}
    else if(it.potion){const d=POTION[it.id];txt(g,d.n,110,y+25,16,'#fff');txt(g,'보유 '+SAVE.potions[it.id],430,y+25,14,'#cfd4e2','right',2);txt(g,d.price+'●',590,y+25,16,'#ffd34a','right')}
    else if(it.cash){const d=ITEMS[it.id],own=SAVE.inv[it.id];txt(g,'['+SLOTS.find(s=>s[0]===d.slot)[1]+'] '+d.n.replace('[캐시] ',''),110,y+25,16,RCOL[4]);txt(g,own?'보유중':'캐시',430,y+25,14,own?'#7aff9a':'#cfd4e2','right',2);txt(g,'◆ '+d.ec,590,y+25,16,own?'#777':'#ff8ae0','right')}
    else{const d=ITEMS[it.id],own=SAVE.inv[it.id];txt(g,'['+SLOTS.find(s=>s[0]===d.slot)[1]+'] '+d.n,110,y+25,16,RCOL[d.r]);txt(g,own?'보유중':RARITY[d.r],430,y+25,14,own?'#7aff9a':'#cfd4e2','right',2);txt(g,d.price+'●',590,y+25,16,own?'#777':'#ffd34a','right')}
  });
  // preview
  panel(g,640,150,230,320,.7);
  const c=JOB[SAVE.job],it=lst[G.shop.sel];
  if((G.shop.cash||G.shop.tab===1)&&it){
    const eq=Object.assign({},PARTY[0].eq);eq[ITEMS[it.id].slot]=it.id;
    g.save();g.translate(755,390);g.scale(2.3,2.3);drawVeggie(g,c,{x:0,y:0,face:1,t,st:'idle',eq,tier:SAVE.tier,fid:SAVE.fid});g.restore();
    txt(g,'미리보기',755,178,15,'#ffe9a0','center');
  }else{txt(g,'야채 즙은 HP 40%',755,260,15,'#fff','center');txt(g,'맑은 물은 MP 50% 회복',755,290,15,'#fff','center');txt(g,'1번 / 2번 키로 사용',755,330,14,'#cfd4e2','center')}
  txt(g,'페이지 '+(pg+1)+'/'+Math.ceil(lst.length/per),350,484,13,'#cfd4e2','center',2);
}

/* ---------------- wardrobe ---------------- */
/* ---------------- 인벤토리 (장비 · 소비 · 기타) ---------------- */
const INV_TABS=['장비','소비','기타'];
function openInv(tab){G.ui='inv';G.inv={tab:tab||0,sel:0};sfx('sel')}
function invRows(){
  const t=G.inv.tab;
  if(t===0)return GSLOTS.map(([k,lb])=>({kind:'gear',slot:k,label:lb,id:SAVE.gear[k]||null})).concat(SLOTS.map((sl,i)=>({kind:'slot',i,label:sl[1],id:PARTY[0].eq[sl[0]]||null})));
  if(t===1){
    const r=[{kind:'potion',id:'hp'},{kind:'potion',id:'mp'},{kind:'mega',id:'m'},{kind:'mega',id:'h'}];
    for(const k of Object.keys(SCROLLS))r.push({kind:'scroll',id:k});
    return r;
  }
  const r=[];
  r.push({kind:'misc',n:'야채 조각',v:SAVE.inv.vegbit||0,d:'몬스터가 떨어뜨리는 재료. 퀘스트 납품에 쓴다.'});
  r.push({kind:'misc',n:'귀안(鬼眼)',v:SAVE.inv.gwi||0,d:'귀목의 제단에 바쳐 천년 귀목을 소환한다. 귀문 수문장 퀘스트로만 얻을 수 있다.'});
  r.push({kind:'misc',n:'도깨비 금이빨',v:SAVE.inv.gtooth||0,d:'귀문 동굴 몬스터가 20% 확률로 떨어뜨린다. 8개로 귀안 1개.'});
  r.push({kind:'misc',n:'귀목의 정수',v:SAVE.inv.essence||0,d:'천년 귀목이 40% 확률로 남긴다. 최고급 투구 퀘스트 재료.'});
  for(const k of BOSS_MATS)r.push({kind:'misc',n:ETC_NAME[k],v:SAVE.inv[k]||0,d:BOSS_MAT_DESC[k]});
  r.push({kind:'misc',n:'야채코인 ●',v:SAVE.coins,d:'상점 · 주문서 구매에 쓰는 기본 화폐.'});
  r.push({kind:'misc',n:'이벤트 코인 ◆',v:SAVE.ec,d:'출석 · 일일 올클리어 · PvP 승리로 획득. 이벤트 상점(캐시 치장)에서 사용.'});
  r.push({kind:'misc',n:'보유 치장템',v:Object.keys(ITEMS).filter(k=>SAVE.inv[k]).length+' / '+Object.keys(ITEMS).length,d:'착용은 장비 탭에서 슬롯을 선택(Enter).'});
  r.push({kind:'misc',n:'파티퀘스트 클리어',v:SAVE.pq||0,d:'달걀 슬라임 소굴 클리어 횟수.'});
  r.push({kind:'misc',n:'결투 전적',v:(SAVE.duel?SAVE.duel.w+'승 '+SAVE.duel.l+'패':'-'),d:'낙사 결투장 기록.'});
  r.push({kind:'misc',n:'연속 출석',v:SAVE.att?SAVE.att.streak+'일 (누적 '+SAVE.att.total+')':'-',d:'7일 연속이면 캐시 치장템!'});
  return r;
}
function invUpdate(){
  const nv=nav(),rows=invRows();
  if(nv.back||pressed.KeyI){closeUI();return}
  if(nv.l){G.inv.tab=(G.inv.tab+2)%3;G.inv.sel=0;sfx('sel')}
  if(nv.r){G.inv.tab=(G.inv.tab+1)%3;G.inv.sel=0;sfx('sel')}
  const n=Math.max(1,invRows().length);
  if(nv.u)G.inv.sel=(G.inv.sel+n-1)%n;if(nv.d)G.inv.sel=(G.inv.sel+1)%n;
  if(nv.ok){
    const r=rows[G.inv.sel];if(!r)return;
    if(r.kind==='slot'){openWardrobe();G.wd.tab=r.i}
    else if(r.kind==='gear')gearPick(r.slot);
    else if(r.kind==='potion'){usePotion(r.id)}
    else if(r.kind==='mega'){closeUI();openChat(r.id==='m'?'mega':'hmega')}
    else if(r.kind==='scroll'){const x=scrollApply(r.id);G.toast(x.msg.split('\n')[0]+(x.used?'':''))}
  }
}
function drawInv(g,t){
  g.fillStyle='rgba(8,4,16,.62)';g.fillRect(0,0,W,H);panel(g,50,34,860,472,.94);
  txt(g,'인벤토리',80,76,26,'#ffe9a0');txt(g,'← → 탭 · ↑↓ 선택 · Enter 사용/변경 · I / Esc 닫기',880,76,13,'#cfd4e2','right',2);
  INV_TABS.forEach((s,i)=>{g.fillStyle=G.inv.tab===i?'#ffd34a':'rgba(255,255,255,.12)';g.beginPath();g.roundRect(80+i*110,92,100,30,8);g.fill();txt(g,s,130+i*110,114,16,G.inv.tab===i?'#2a1a00':'#fff','center',0)});
  const rows=invRows(),per=8,pg=Math.floor(G.inv.sel/per),st=pg*per,p=PARTY[0],j=JOB[SAVE.job];
  rows.slice(st,st+per).forEach((r,i)=>{
    const y=134+i*42,sel=st+i===G.inv.sel;
    g.fillStyle=sel?'rgba(255,220,120,.22)':'rgba(255,255,255,.05)';g.beginPath();g.roundRect(80,y,470,38,8);g.fill();if(sel){g.strokeStyle='#ffd34a';g.lineWidth=2;g.stroke()}
    if(r.kind==='gear'){const d=r.id&&GEAR[r.id];txt(g,'['+r.label+']',96,y+25,15,'#ffb060');txt(g,d?'['+GRADE[d.gr]+'] '+d.n:'(비어 있음)',178,y+25,15,d?GCOL[d.gr]:'#888');txt(g,'Enter : 장착',536,y+25,12,'#cfd4e2','right',2)}
    else if(r.kind==='slot'){txt(g,'['+r.label+']',96,y+25,15,'#9be8ff');txt(g,r.id?ITEMS[r.id].n:'(비어 있음)',170,y+25,16,r.id?RCOL[ITEMS[r.id].r]:'#888');txt(g,'Enter : 변경',536,y+25,12,'#cfd4e2','right',2)}
    else if(r.kind==='mega'){const d=MEGA[r.id];txt(g,d.n,96,y+25,16,'#ffb0e0');txt(g,'×'+SAVE.mega[r.id],420,y+25,16,'#7aff9a','right');txt(g,'채팅 열기',536,y+25,12,'#cfd4e2','right',2)}
    else if(r.kind==='potion'){const d=POTION[r.id];txt(g,d.n,96,y+25,16,'#fff');txt(g,'×'+SAVE.potions[r.id],420,y+25,16,'#7aff9a','right');txt(g,'사용 ('+(r.id==='hp'?'1':'2')+'키)',536,y+25,12,'#cfd4e2','right',2)}
    else if(r.kind==='scroll'){const d=SCROLLS[r.id],c=SAVE.scrolls[r.id]||0;txt(g,d.n,96,y+25,15,c?'#fff':'#777');txt(g,'×'+c,420,y+25,16,c?'#7aff9a':'#777','right');txt(g,c?'사용':'',536,y+25,12,'#cfd4e2','right',2)}
    else{txt(g,r.n,96,y+25,16,'#fff');txt(g,String(r.v),536,y+25,16,'#ffd34a','right')}
  });
  txt(g,'페이지 '+(pg+1)+'/'+Math.max(1,Math.ceil(rows.length/per)),315,490,13,'#cfd4e2','center',2);
  // right panel
  panel(g,570,130,320,360,.7);
  const sel=rows[G.inv.sel];
  if(G.inv.tab===0){
    g.save();g.translate(650,330);g.scale(2.1,2.1);drawVeggie(g,j,{x:0,y:0,face:1,t,st:'idle',eq:p.eq,tier:SAVE.tier,fid:SAVE.fid});g.restore();
    txt(g,jline(j,SAVE.tier),730,160,17,'#ffe9a0','center');
    if(sel&&sel.kind==='gear'&&sel.id){const d=GEAR[sel.id];txt(g,'['+GRADE[d.gr]+'] '+d.n,800,200,13,GCOL[d.gr],'center',2);wrap(g,gearDesc(sel.id),150,12).forEach((l,i)=>txt(g,l,800,220+i*18,12,'#fff','center',2))}
    const e=SAVE.enh||{atk:0,hp:0,used:0};
    const L=[['Lv.',SAVE.lvl],['HP',p.maxhp],['MP',p.maxmp],['공격력',Math.round(p.atkBase)],['이동속도',j.spd],['점프력',j.jump],['근육 강화','+'+e.atk],['체력 강화','+'+e.hp],['남은 슬롯',(enhSlots()-e.used)+'/'+enhSlots()]];
    L.forEach(([k,v],i)=>{const c=i%2,r=(i/2)|0,x0=c?738:588;txt(g,k,x0,372+r*22,13,'#cfd4e2','left',2);txt(g,String(v),x0+(c?138:136),372+r*22,13,'#fff','right',2)});
  }else if(G.inv.tab===1){
    txt(g,'소비 아이템',730,160,17,'#ffe9a0','center');
    const lines=sel&&sel.kind==='mega'?[MEGA[sel.id].d,'가격 '+MEGA[sel.id].price+MEGA[sel.id].cur+' (옥수수 상인)','Enter : 채팅창 열기']:sel&&sel.kind==='scroll'&&SCROLLS[sel.id].apreset?['모든 AP를 4로 되돌린다','O 키로 다시 분배','조건 안 맞는 장비는 해제됨']:sel&&sel.kind==='potion'?(sel.id==='hp'?['HP를 40% 회복','1번 키로도 사용 가능']:['MP를 50% 회복','2번 키로도 사용 가능']):
      sel&&sel.kind==='scroll'?(SCROLLS[sel.id].white?['슬롯 1칸을 복구한다','(강화 수치는 그대로)','가격 '+SCROLLS[sel.id].price+'●']:['성공률 '+Math.round(SCROLLS[sel.id].rate*100)+'%','성공 시 '+(SCROLLS[sel.id].stat==='atk'?'근육(공격력)':'체력')+' +'+SCROLLS[sel.id].pts,'슬롯 1칸 소모 (성공/실패 무관)','가격 '+SCROLLS[sel.id].price+'●','구매: 마을 어딘가의 수상한 상인']):[];
    lines.forEach((l,i)=>txt(g,l,730,210+i*26,15,'#fff','center',2));
    const e=SAVE.enh;txt(g,'남은 슬롯 '+(enhSlots()-e.used)+' / '+enhSlots(),730,420,15,'#9be8ff','center',2);
    txt(g,'근육 +'+e.atk+' · 체력 +'+e.hp,730,446,14,'#ffd34a','center',2);
  }else{
    txt(g,'기타',730,160,17,'#ffe9a0','center');
    if(sel)wrap(g,sel.d||'',270,15).forEach((l,i)=>txt(g,l,730,210+i*24,15,'#fff','center',2));
  }
}
function gearPick(slot){
  const own=Object.keys(GEAR).filter(k=>slotFits(k,slot)&&SAVE.ginv[k]).sort((a,b)=>GEAR[b].gr-GEAR[a].gr);
  const lb=GSLOTS.find(s=>s[0]===slot)[1],cur=SAVE.gear[slot];
  const back=()=>{openInv(0);G.inv.sel=GSLOTS.findIndex(s=>s[0]===slot)};
  const done=id=>{
    if(id){const err=gearEquip(id,slot);if(err){G.toast('착용 불가: '+err);sfx('hurt');return}}else delete SAVE.gear[slot];
    const p=PARTY[0],r=p.hp/p.maxhp;recalc(p);p.hp=Math.round(p.maxhp*r);sfx('pickup');saveGame();back()};
  const opts=own.map(k=>{const bad=gearCheck(k).length;return{t:(k===cur?'✔ ':bad?'✖ ':'')+'['+GRADE[GEAR[k].gr]+'] '+GEAR[k].n,fn:()=>done(k)}});
  if(cur)opts.push({t:'장착 해제',fn:()=>done(null)});
  opts.push({t:'닫기',fn:()=>{closeUI();back()}});
  const lines=own.map(k=>{const w=gearCheck(k);return(w.length?'✖ ':'')+'['+GRADE[GEAR[k].gr]+'] '+GEAR[k].n+(GEAR[k].quest?' (퀘스트)':'')+' — '+gearDesc(k)+(w.length?'\n   └ '+w[0]:'')});
  const hint=slot==='rh'?'사용 가능 무기: '+(JOB_WEAP[SAVE.job]||[]).map(w=>WT[w].n+(WT[w].h2?'(양손)':'')).join(', '):slot==='lh'?'왼손: '+((JOB_LH[SAVE.job]||[]).map(w=>WT[w].n).join(', ')||'이 직업은 왼손 장비 없음')+' · 양손무기 착용 중엔 사용 불가':'';
  openDialog(lb+' 장착',(hint?hint+'\n\n':'')+(own.length?lines.slice(0,6).join('\n'):'가진 장비가 없다.\n보스를 쓰러뜨리면 낮은 확률로 장비가 떨어진다. (등급이 높을수록 희귀!)\n최고 등급은 퀘스트로만 얻을 수 있다.'),opts);
}
function openWardrobe(){G.ui='wardrobe';G.wd={tab:0,sel:0};sfx('sel')}
function wdList(){const slot=SLOTS[G.wd.tab][0];return[null].concat(Object.keys(ITEMS).filter(k=>ITEMS[k].slot===slot&&SAVE.inv[k]))}
function wdUpdate(){
  const nv=nav(),lst=wdList();
  if(nv.back||pressed.KeyI){closeUI();return}
  if(nv.l){G.wd.tab=(G.wd.tab+4)%5;G.wd.sel=0;sfx('sel')}if(nv.r){G.wd.tab=(G.wd.tab+1)%5;G.wd.sel=0;sfx('sel')}
  if(nv.u)G.wd.sel=(G.wd.sel+lst.length-1)%lst.length;if(nv.d)G.wd.sel=(G.wd.sel+1)%lst.length;
  if(nv.ok){const slot=SLOTS[G.wd.tab][0],id=lst[G.wd.sel];if(id){PARTY[0].eq[slot]=id;SAVE.eq[slot]=id}else{delete PARTY[0].eq[slot];delete SAVE.eq[slot]}sfx('pickup');saveGame()}
}
function drawWardrobe(g,t){
  g.fillStyle='rgba(8,4,16,.62)';g.fillRect(0,0,W,H);
  panel(g,50,34,860,472,.93);
  txt(g,'옷장 · 치장',80,76,26,'#ffe9a0');txt(g,'← → 부위 · ↑↓ 선택 · Enter 착용/해제 · Esc 닫기',880,76,13,'#cfd4e2','right',2);
  SLOTS.forEach((s,i)=>{g.fillStyle=G.wd.tab===i?'#ffd34a':'rgba(255,255,255,.12)';g.beginPath();g.roundRect(80+i*92,92,86,30,8);g.fill();txt(g,s[1],123+i*92,113,15,G.wd.tab===i?'#2a1a00':'#fff','center',0)});
  const lst=wdList(),slot=SLOTS[G.wd.tab][0],per=9,pg=Math.floor(G.wd.sel/per),st=pg*per;
  lst.slice(st,st+per).forEach((id,i)=>{
    const y=136+i*38,sel=st+i===G.wd.sel,on=(id===null&&!PARTY[0].eq[slot])||(id&&PARTY[0].eq[slot]===id);
    g.fillStyle=sel?'rgba(255,220,120,.22)':'rgba(255,255,255,.05)';g.beginPath();g.roundRect(80,y,430,34,8);g.fill();if(sel){g.strokeStyle='#ffd34a';g.lineWidth=2;g.stroke()}
    txt(g,id?ITEMS[id].n:'(착용 안 함)',98,y+23,16,id?RCOL[ITEMS[id].r]:'#cfd4e2');
    if(id)txt(g,'['+RARITY[ITEMS[id].r]+']',410,y+23,13,RCOL[ITEMS[id].r],'right',2);
    if(on)txt(g,'착용중',495,y+23,14,'#7aff9a','right',2);
  });
  const own=Object.keys(SAVE.inv).filter(k=>ITEMS[k]).length;
  txt(g,'보유 치장템 '+own+' / '+Object.keys(ITEMS).length,80,492,14,'#cfd4e2','left',2);
  panel(g,540,130,340,360,.7);
  const eq=Object.assign({},PARTY[0].eq),sel=lst[G.wd.sel];if(sel)eq[slot]=sel;else delete eq[slot];
  g.save();g.translate(710,420);g.scale(3.1,3.1);drawVeggie(g,JOB[SAVE.job],{x:0,y:0,face:1,t,st:'idle',eq,tier:SAVE.tier,fid:SAVE.fid,buff:false});g.restore();
  txt(g,jline(JOB[SAVE.job],SAVE.tier),710,162,18,'#ffe9a0','center');
}

/* ---------------- HUD ---------------- */
function drawHUD(g,t){
  const p=PARTY[0];if(!p)return;
  const j=JOB[p.job];
  drawStatusBar(g,t);const mmB=drawMinimap(g,t);
  // party
  let py=mmB;
  for(const q of PARTY){if(q===p)continue;
    panel(g,10,py,200,38,.6);txt(g,(S.L.pvp?(q.team===p.team?'아군 ':'상대 '):q.kind==='p2'?'2P ':'AI ')+JOB[q.job].role+' Lv.'+q.lvl,18,py+16,12,q.dead?'#999':'#fff','left',2);
    bar(g,18,py+21,184,8,q.dead?0:q.hp/q.maxhp,'#e8484f');if(q.dead)txt(g,'기절…'+Math.max(0,(q.kind==='ai'?7:6)-q.deadT).toFixed(0),200,py+16,11,'#cfe0ff','right',2);py+=42}
  // quest tracker
  let qy=48;const act=Object.keys(SAVE.q).filter(k=>SAVE.q[k].s==='active'||SAVE.q[k].s==='ready').slice(0,3);
  for(const k of act){
    const q=QUESTS[k],st=SAVE.q[k];
    const lines=q.objs.map((o,i)=>(st.p[i]>=(o.n||1)?'✔ ':'· ')+o.label+(o.n>1?' '+Math.min(st.p[i],o.n)+'/'+o.n:''));
    const h=24+lines.length*17;panel(g,W-250,qy,240,h,.55);
    txt(g,q.name,W-242,qy+18,13,st.s==='ready'?'#7aff9a':'#ffe9a0','left',2);
    lines.forEach((l,i)=>txt(g,l,W-242,qy+36+i*17,11,'#fff','left',2));
    qy+=h+6;
  }
  if(S.L.pvp&&S.pvp){panel(g,W/2-150,8,300,40,.75);txt(g,'1P팀  '+S.pvp.score[0]+'  :  '+S.pvp.score[1]+'  상대팀',W/2,36,20,'#ffe9a0','center');txt(g,S.pvp.to+'KO 선취',W/2,60,11,'#cfd4e2','center',2)}
  // PQ status
  if(S.L.pq){
    const pq=S.pq;let s='';
    if(S.L.pq===1)s='영혼 쿠폰 '+pq.coupons+' / 15';else if(S.L.pq===2)s='혼의 발판 '+(pq.plateOn||0)+' / 3';else if(S.L.pq===3)s='열쇠 '+pq.keys+' / 7';else s='킹 달걀 슬라임 처치!';
    panel(g,W/2-130,8,260,34,.72);txt(g,'파티퀘스트 '+S.L.pq+'/4 · '+s,W/2,31,15,'#c0a0ff','center');
  }
  // tutorial hint
  if(qst('tut1').s==='active'&&S.L.town){
    const st=qst('tut1'),hints=['← → 방향키로 좌우 이동','Space(또는 Alt) 로 점프','허수아비에게 가서 Z(또는 Ctrl) 로 공격','C 키로 스킬 사용 (수련생은 C 하나만!)','밧줄 아래에서 ↑ 를 눌러 끝까지 오르기','허수아비를 쓰러뜨려라 (HP를 0으로)'];
    const i=st.p.findIndex((v,k)=>v<(QUESTS.tut1.objs[k].n||1));
    if(i>=0){panel(g,W/2-250,H-120,500,40,.75);txt(g,'TIP  '+hints[i],W/2,H-93,16,'#ffe04a','center')}
  }
}
function drawBossBar(g){
  const b=S.boss;if(!b||b.dead)return;
  const x=W/2-170,y=50;panel(g,x-10,y-8,360,46,.7);
  txt(g,b.name+(b.phase>1?'  [분노]':''),x,y+10,16,b.phase>1?'#ff8a6a':'#ffe9a0');
  bar(g,x,y+16,340,14,b.hp/b.max,b.phase>1?'#ff4a3a':'#e8a030');
  g.fillStyle='rgba(255,255,255,.8)';g.fillRect(x+170-1,y+14,2,18);
}
function drawToasts(g){
  let y=196;
  for(const ts of G.toasts){const a=Math.min(1,ts.t*2,(ts.max-ts.t)*2+.01);g.globalAlpha=clamp(a,0,1);g.font=F(18);const w=g.measureText(ts.m).width+36;
    g.fillStyle='rgba(18,10,34,.85)';g.beginPath();g.roundRect(W/2-w/2,y-22,w,34,10);g.fill();g.strokeStyle='rgba(255,220,150,.8)';g.lineWidth=2;g.stroke();
    txt(g,ts.m,W/2,y+2,18,'#fff','center',2);y+=40}
  g.globalAlpha=1;
}
function drawDialog(g,t){
  const d=G.dlg;if(!d)return;
  panel(g,40,226,880,290,.92);
  g.fillStyle='#ffd34a';g.beginPath();g.roundRect(60,212,Math.min(600,g.measureText(d.name).width+80),30,8);g.fill();
  g.font=F(16);const nw=g.measureText(d.name).width;g.fillStyle='#ffd34a';g.beginPath();g.roundRect(60,212,nw+30,30,8);g.fill();txt(g,d.name,75,233,16,'#2a1a00','left',0);
  const lines=wrap(g,d.text,540,16);
  lines.slice(0,9).forEach((l,i)=>txt(g,l,66,266+i*23,16,'#fff','left',2));
  // options
  const ox=640,max=7,st=Math.max(0,Math.min(d.sel-3,d.opts.length-max));
  d.opts.slice(st,st+max).forEach((o,i)=>{
    const y=248+i*36,sel=st+i===d.sel;
    g.fillStyle=sel?'rgba(255,220,120,.25)':'rgba(255,255,255,.05)';g.beginPath();g.roundRect(ox,y,262,32,8);g.fill();if(sel){g.strokeStyle='#ffd34a';g.lineWidth=2;g.stroke()}
    g.font=F(14);let s=o.t;while(g.measureText(s).width>240&&s.length>3)s=s.slice(0,-2);if(s!==o.t)s+='…';
    txt(g,(sel?'▶ ':'')+s,ox+10,y+22,14,sel?'#ffe9a0':'#fff','left',2);
  });
  if(d.opts.length>max)txt(g,'↑↓ '+(d.sel+1)+'/'+d.opts.length,ox+260,508,12,'#cfd4e2','right',2);
}
function dialogUpdate(){
  const d=G.dlg;if(!d)return;const nv=nav();
  if(nv.u){d.sel=(d.sel+d.opts.length-1)%d.opts.length;sfx('sel')}
  if(nv.d){d.sel=(d.sel+1)%d.opts.length;sfx('sel')}
  if(nv.back){closeUI();return}
  if(nv.ok){const o=d.opts[d.sel];sfx('sel');o.fn&&o.fn()}
}
function drawQuestLog(g,t){
  g.fillStyle='rgba(8,4,16,.62)';g.fillRect(0,0,W,H);panel(g,50,34,860,472,.93);
  txt(g,'퀘스트 일지',80,76,26,'#ffe9a0');txt(g,'Q / Esc 닫기',880,76,13,'#cfd4e2','right',2);
  const act=Object.keys(QUESTS).filter(k=>SAVE.q[k]&&(SAVE.q[k].s==='active'||SAVE.q[k].s==='ready'));
  const done=Object.keys(QUESTS).filter(k=>SAVE.q[k]&&SAVE.q[k].s==='done').length,total=Object.keys(QUESTS).length;
  txt(g,'완료 '+done+' / '+total,80,102,15,'#7aff9a','left',2);
  let y=128;
  if(!act.length)txt(g,'진행 중인 퀘스트가 없습니다. 촌장님과 게시판을 찾아보세요!',90,160,17,'#cfd4e2');
  for(const k of act){
    const q=QUESTS[k],st=SAVE.q[k],h=30+q.objs.length*22;if(y+h>490)break;
    g.fillStyle='rgba(255,255,255,.06)';g.beginPath();g.roundRect(80,y,800,h,8);g.fill();
    txt(g,(st.s==='ready'?'[완료] ':'')+q.name,94,y+22,16,st.s==='ready'?'#7aff9a':'#ffe9a0');
    txt(g,'의뢰인 '+GIVER_NAME[q.giver],866,y+22,12,'#cfd4e2','right',2);
    q.objs.forEach((o,i)=>txt(g,(st.p[i]>=(o.n||1)?'✔ ':'▫ ')+o.label+(o.n>1?'  '+Math.min(st.p[i],o.n)+'/'+o.n:''),110,y+44+i*22,14,'#fff','left',2));
    y+=h+8;
  }
}
const HELP=[
  ['1P  이동','← →  /  ↑ ↓ (밧줄·포탈·NPC)'],['1P  점프','Space 또는 Alt  (↓ + 점프 : 아래로 내려가기)'],['1P  공격','Z 또는 Ctrl  (꾹 누르면 연속)'],
  ['1P  스킬','C (수련생) · 1차 X V · 2차 B · 3차 N'],['1P  물약','1 : HP  /  2 : MP'],['2P  이동','A D W S   점프 : Shift   공격 : F'],['2P  스킬','G H T Y U'],
  ['채팅','Enter : 채팅 (일반 · 확성기 · 고확성기)   O : 능력치(AP)'],['메뉴','Q 퀘스트 · I 인벤토리 · P 메뉴 · M 음소거 · E AI 동료 배치/해제'],['밧줄','밧줄 앞에서 ↑ / ↓ , 점프+좌우로 뛰어내리기'],['팁','일일퀘스트 · PvP 결투장 · 전직(1차 마을/2차 숲 꼭대기/3차 하늘길 끝)'],
];
function drawHelp(g){
  g.fillStyle='rgba(8,4,16,.7)';g.fillRect(0,0,W,H);panel(g,90,50,780,440,.94);
  txt(g,'조작법',W/2,98,28,'#ffe9a0','center');
  HELP.forEach((h,i)=>{txt(g,h[0],130,140+i*28,15,'#ffd34a');txt(g,h[1],270,140+i*28,15,'#fff')});
  txt(g,'아무 키나 눌러 닫기',W/2,470,14,'#cfd4e2','center',2);
}
