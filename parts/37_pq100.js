/* ============================================================
   PQ100 : Lv.100부터는 파티퀘스트가 주 성장 수단
   · 사냥 경험치는 아주 느리게 (10분 ≈ 0.3%)
   · 고레벨 파티퀘스트 2종 : 한 번 클리어 = 레벨의 6~8% (+온라인 파티원 1명당 +1%) · 하루 5회
   · 레벨보다 한참 낮은 던전은 경험치가 줄어든다
   ============================================================ */
DUNS.push(
 {id:'pq6',pq:1,name:'파티퀘스트 · 용의 요새 원정',min:100,theme:'dragon',hue:0,lm:'dfort',mobs:['dknight','whelp','drake'],boss:'dknight',bn:'용비늘 기사단장',gear:'g_dk_eye',exp:.06,sub:'파티원과 함께 요새의 성문을 돌파하라'},
 {id:'pq7',pq:1,name:'파티퀘스트 · 천공의 시련',min:150,theme:'temple',hue:200,lm:'crystal',mobs:['drake','golem','book'],boss:'golem',bn:'천공의 수호 거신',gear:'g_dk_armor',exp:.08,sub:'하늘 끝 신전에서 내리는 시련'},
);
for(const D of DUNS.filter(d=>d.pq))for(let k=1;k<=3;k++)MAPS[D.id+'_'+k]=()=>dunRoom(D,k);
function onlinePartyN(){return typeof onlineParty==='function'?onlineParty().length:0}
function dunExpPct(D){
  if(D.pq)return D.exp+Math.min(.04,onlinePartyN()*.01);
  // 레벨보다 20 넘게 낮은 던전은 경험치 1/4
  return SAVE.lvl>D.min+20?.03:.12;
}
function pqHighMenu(){
  const opts=DUNS.filter(D=>D.pq).map(D=>{const used=SAVE.flags['dun_'+D.id+'_'+dayNum()]||0,party=PARTY.length+onlinePartyN();
    return{t:(SAVE.lvl<D.min?'🔒 ':'⚔ ')+D.name.replace('파티퀘스트 · ','')+'  Lv.'+D.min+'~  ('+used+'/'+DUN_RUNS+') · 경험치 '+Math.round(D.exp*100)+'%+',fn:()=>{
      if(SAVE.lvl<D.min){G.toast('Lv.'+D.min+'부터 입장할 수 있어요');return}
      if(used>=DUN_RUNS){G.toast('오늘은 더 들어갈 수 없어요 (매일 '+DUN_RUNS+'회)');return}
      if(party<2){G.toast('파티원이 2명 이상 필요해요 (온라인 파티 코드 또는 AI 동료·2P)');return}
      if(S.L.pq||S.L.dun||(S.boss&&!S.boss.dead)){G.toast('지금은 이동할 수 없어요');return}
      closeUI();sfx('portal');goMap(D.id+'_1')}}});
  opts.push({t:'🙋 파티원 모으기 (AI 동료 · 2P · 온라인 파티 코드)',fn:()=>partyMenu({name:'파티 모집'})},{t:'닫기',fn:closeUI});
  openDialog('👥 고레벨 파티퀘스트 (Lv.100~)','Lv.100부터는 사냥으로 거의 오르지 않아요. 파티퀘스트가 가장 빠른 성장 방법!\n· 클리어 1회 = 지금 레벨 경험치의 6~8% + 같은 맵 온라인 파티원 1명당 +1% (최대 +4%)\n· 하루 '+DUN_RUNS+'회 · 파티원 2명 이상 · 방의 몬스터를 모두 잡아야 다음 방이 열려요',opts);
}
{const _pq=pqMenu;pqMenu=function(){_pq();if(!G.dlg)return;G.dlg.opts.splice(G.dlg.opts.length-1,0,{t:'⚔ 고레벨 파티퀘스트 (Lv.100~ · 경험치 대량)',fn:pqHighMenu})}}
{const _pm=partyMenu;partyMenu=function(n){_pm(n);if(!G.dlg||SAVE.lvl<100)return;G.dlg.opts.splice(0,0,{t:'⚔ 고레벨 파티퀘스트 (Lv.100~)',fn:pqHighMenu})}}
// 보스 체력은 파티 인원에 맞게 (dunRoom 보스는 PARTY 길이 기준 → 온라인 파티원도 반영)
{const _lm=loadMap;loadMap=function(id,end){_lm(id,end);const L=S.L;if(L.dun&&L.dunBoss&&S.dunBoss&&DUNS.find(d=>d.id===L.dun).pq){const m=S.dunBoss,k=1+.6*onlinePartyN();m.hp=m.max=Math.round(m.max*k)}}}
// 가이드
{const _ng=nextGoals;nextGoals=function(){const g=_ng();if(SAVE.lvl>=100)g.unshift('⚔ 고레벨 파티퀘스트 — 오른쪽 위 [파티퀘스트] (하루 '+DUN_RUNS+'회)');return g.slice(0,3)}}
// Lv.100 안내 문구 갱신
{const _ge=gainExp;gainExp=function(n,mob){const lv=SAVE.lvl;const r=_ge(n,mob);if(lv<100&&SAVE.lvl>=100)setTimeout(()=>{G.banner={t:0,name:'Lv.100 — 이제부터는 파티퀘스트!',sub:'사냥 경험치는 아주 적어요 · [파티퀘스트] 버튼에서 고레벨 파티퀘스트'}},6000);return r}}
