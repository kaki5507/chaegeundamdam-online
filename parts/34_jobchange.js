/* ============================================================
   JOBCHANGE : 직업 변경권 — 모든 계정에 1장 지급 · 레벨/전직 단계 유지, AP 다시 분배
   ============================================================ */
ETC_NAME.jobticket='🎫 직업 변경권';BOSS_MATS.unshift('jobticket');BOSS_MAT_DESC.jobticket='레벨과 전직 단계는 그대로 두고 직업만 바꿔요. 가이드(7) 또는 야채마을 전직 안내원에게서 사용.';
function giftJobTicket(){if(!SAVE||SAVE.flags.jcGift1)return;SAVE.flags.jcGift1=1;SAVE.inv.jobticket=(SAVE.inv.jobticket||0)+1;saveGame();
  setTimeout(()=>{G.banner={t:0,name:'🎫 직업 변경권 1장 지급!',sub:'모든 모험가에게 선물 — 가이드(7) 또는 전직 안내원에게서 사용해요'};sfx('levelup')},1800)}
{const _c=continueGame;continueGame=function(){_c();giftJobTicket()}}
{const _n=newGame;newGame=function(j){_n(j);giftJobTicket()}}
function useJobTicket(){
  const n=SAVE.inv.jobticket||0;
  if(!n){G.toast('직업 변경권이 없어요');return}
  if(S.L.pq||S.L.dun||S.L.raid||S.L.arenaEv||(S.boss&&!S.boss.dead)){G.toast('던전 안에서는 쓸 수 없어요');return}
  openDialog('🎫 직업 변경권 ('+n+'장)','지금: '+JOB[SAVE.job].role+' Lv.'+SAVE.lvl+' ('+SAVE.tier+'차)\n\n바꿀 직업을 고르세요. 레벨·전직 단계·장비·퀘스트는 그대로 유지되고,\n능력치(AP)는 새 직업에 맞게 다시 자동 분배돼요. 손에 든 무기는 장비창으로 돌아가요.',
    JOBS.filter(j=>j.id!==SAVE.job).map(j=>({t:j.role+'  ('+jline(j,SAVE.tier)+')',fn:()=>openDialog('정말 바꿀까요?',JOB[SAVE.job].role+' → '+j.role+'\n직업 변경권 1장을 사용합니다.',[{t:'바꾼다!',fn:()=>doJobChange(j.id)},{t:'취소',fn:closeUI}])})).concat([{t:'닫기',fn:closeUI}]));
}
function doJobChange(job){
  if(!(SAVE.inv.jobticket>0))return;SAVE.inv.jobticket--;
  const total=Object.values(SAVE.ap||{}).reduce((a,b)=>a+b,0)-16+(SAVE.apFree||0);
  SAVE.job=job;SAVE.ap={str:4,dex:4,int:4,luk:4};SAVE.apFree=Math.max(0,total);autoAP();
  if(SAVE.gear){for(const s of['rh','lh']){const id=SAVE.gear[s];if(id&&GEAR[id]&&GEAR[id].wt)SAVE.gear[s]=null}}
  saveGame();closeUI();SUMS=[];
  const id=S.id;PARTY=[buildP1()];goMap(id,true);
  const p=PARTY[0];spark(p.x,p.y-30,50,'#ffe9a0',360,1,5,0,true);sfx('levelup');
  G.banner={t:0,name:'✨ '+JOB[job].role+'(으)로 변신!',sub:jline(JOB[job],SAVE.tier)+' · 새 직업 마을: 「'+JT_OF(job).name+'」'};
}
{const _g=guideMenu2;guideMenu2=function(){_g();if(G.dlg&&SAVE.inv.jobticket>0)G.dlg.opts.splice(G.dlg.opts.length-1,0,{t:'🎫 직업 변경권 사용 ('+SAVE.inv.jobticket+'장)',fn:useJobTicket})}}
{const _gm=guideMenu;guideMenu=function(n){_gm(n);if(G.dlg)G.dlg.opts.splice(G.dlg.opts.length-1,0,{t:'🎫 직업 변경권 사용 ('+(SAVE.inv.jobticket||0)+'장)',fn:useJobTicket})}}
// 2차 전직하면 2단 점프 안내
{const _a=advanceJob;advanceJob=function(t){_a(t);if(t===2)setTimeout(()=>{G.banner={t:0,name:'🦘 2단 점프 습득!',sub:'공중에서 점프를 한 번 더 누르면 더 높이 뛰어요 (폰: 점프 버튼 두 번)'};sfx('levelup')},2600)}}
