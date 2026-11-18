/* ============================================================
   GUIDE : 레벨별 가이드(추천 사냥터 바로 이동 · 다음 목표 · 오늘 할 일) · 접속자 수 표시
   ============================================================ */
function allHunts(){
  const a=HUNTS.map(h=>({id:h.id,n:h.name,min:h.min,where:'야채마을 사냥터'}));
  for(const d of JTOWNS)for(const h of d.hunts)a.push({id:h.id,n:h.name,min:h.min,where:d.name+(d.job===SAVE.job?' ⭐':'')});
  for(const t of TEMPLES)a.push({id:t.id,n:t.name,min:t.min,where:'별의 신전'});
  return a;
}
function recHunts(){
  const lv=SAVE.lvl,mine=JT_OF(SAVE.job);
  return allHunts().filter(h=>h.min<=lv&&lv<=h.min+20)
    .sort((a,b)=>(b.min-a.min)+((b.where.includes('⭐')?6:0)-(a.where.includes('⭐')?6:0))).slice(0,5);
}
const guideCost=h=>SAVE.lvl<20?0:Math.round(60+h.min*5);
function nextGoals(){
  const lv=SAVE.lvl,t=SAVE.tier,g=[],mine=JT_OF(SAVE.job);
  if(t<1)g.push(lv>=10?'✅ 지금 1차 전직 가능! → 「'+mine.name+'」 교관':'Lv.10 : 1차 전직 (「'+mine.name+'」)');
  else if(t<2)g.push(lv>=30?'✅ 지금 2차 전직 가능! → 도깨비 숲 꼭대기 스승 (슈퍼점프 습득)':'Lv.30 : 2차 전직 (도깨비 숲 꼭대기) · 슈퍼점프');
  else if(t<3)g.push(lv>=70?'✅ 지금 3차 전직 가능! → 하늘길 끝 스승':'Lv.70 : 3차 전직 (하늘길 끝)');
  if(lv>=6&&!SAVE.cleared.eggking)g.push('👥 파티퀘스트 「달걀 슬라임 소굴」 (Lv.6+) — 황금 노른자');
  if(lv>=12&&!SAVE.cleared.dokkaebi)g.push('👹 보스 「도깨비 대왕」 — 도깨비 숲 끝 · 첫 토벌 AP+3');
  if(lv>=28&&!SAVE.cleared.fox)g.push('🦊 보스 「구미호」 — 하늘길 끝 달빛 신당');
  if(lv>=15)g.push('🪨 비석의 길 스토리 던전 — 비석 조각 · 보스 장비 제작');
  if(lv>=40&&!SAVE.cleared.guimok)g.push('🌋 귀문 동굴 → 천년 귀목 (파티 추천)');
  if(lv>=80)g.push('🏛 별의 신전 (Lv.80~90) — 최고 레벨 사냥터');
  return g.slice(0,3);
}
function todayList(){
  const r=[];const dq=Object.keys(QUESTS).filter(k=>/^d\d/.test(k));
  const done=dq.filter(k=>qst(k).s==='done').length;r.push('📅 일일 퀘스트 '+done+'/'+dq.length);
  r.push(SAVE.att&&SAVE.att.last===dayNum()?'✅ 출석 체크 완료':'❗ 출석 체크 안 함 (야채마을 출석부 요정)');
  r.push('🐉 20:00 보스 레이드 · 🏛 20:30 쟁탈전');
  const ready=BL_JOBS.filter(j=>(SAVE.inv[j.mat]||0)>=j.n).length;if(ready)r.push('🎁 보스 연구가에게 납품 가능 '+ready+'건');
  if(SAVE.apFree>0)r.push('💪 남은 AP '+SAVE.apFree+' (AP 버튼 / O키)');
  return r;
}
function guideMenu2(){
  sfx('sel');const j=JOB[SAVE.job],rec=recHunts(),opts=[];
  for(const h of rec){const c=guideCost(h);opts.push({t:'🚕 '+(h.where.includes('⭐')?'⭐':'')+h.n+'  Lv.'+h.min+'~  '+(c?c+'●':'무료'),fn:()=>{
    if(S.L.pq||(S.boss&&!S.boss.dead)||S.dg||S.L.raid||S.L.arenaEv){G.toast('던전 안에서는 이동할 수 없어요');return}
    if(SAVE.coins<c){G.toast('코인이 부족해요 ('+c+'●)');return}SAVE.coins-=c;closeUI();sfx('portal');goMap(h.id);G.toast(h.n+'(으)로 이동!')}})}
  opts.push({t:'⭐ 내 직업 마을 「'+JT_OF(SAVE.job).name+'」 (무료)',fn:()=>{closeUI();sfx('portal');goMap(JT_OF(SAVE.job).id)}});
  opts.push({t:'닫기',fn:closeUI});
  openDialog('📖 Lv.'+SAVE.lvl+' '+jline(j,SAVE.tier)+' 가이드',
    '▶ 다음 목표\n'+nextGoals().map(s=>'  '+s).join('\n')+'\n\n▶ 오늘 할 일\n  '+todayList().slice(0,2).join('   ')+'\n  '+todayList().slice(2).join('   ')+'\n\n▶ 오른쪽에서 추천 사냥터로 바로 이동'+(SAVE.lvl<20?' (Lv.20까지 무료)':''),opts);
}
// 상단 버튼 : 가이드 추가 (운영 버튼은 왼쪽으로)
{const a=HUDB.find(b=>b.id==='adm');if(a)a.x=W-394;HUDB.push({id:'guide',x:W-306,y:8,w:82,h:32,l:'📖 가이드',k:'7'})}
{const _rs=respawnStep;respawnStep=function(dt){_rs(dt);if(G.state==='play'&&!G.ui&&!G.chatOpen&&pressed.Digit7)guideMenu2()}}
// 레벨업 할 때 중요한 레벨이면 안내
{const _ge=gainExp;gainExp=function(n,mob){const lv=SAVE.lvl;const r=_ge(n,mob);if(SAVE.lvl>lv&&[6,10,12,15,20,30,40,70,80].some(v=>lv<v&&SAVE.lvl>=v))setTimeout(()=>G.toast('📖 새 목표가 생겼어요! 오른쪽 위 [가이드] (7)'),1200);return r}}
// 접속자 수 (미니맵 아래)
function drawOnline(g,t){
  if(!S||!PARTY[0])return;const on=typeof wsOK==='function'&&wsOK(),s=on?'접속 '+Math.max(1,ONLINE_N)+'명':'오프라인';
  g.save();g.beginPath();g.roundRect(14,88,on?96:80,22,11);g.fillStyle='rgba(40,24,70,.62)';g.fill();
  circ(g,27,99,4.5,on?'#5ae07a':'#999');if(on){g.globalAlpha=.4+.3*Math.sin(t*3);circ(g,27,99,8,'rgba(90,224,122,.5)');g.globalAlpha=1}
  txt(g,s,36,104,12,'#fff','left',0);g.restore();
}
{const _dh=drawHUD;drawHUD=function(g,t){_dh(g,t);drawOnline(g,t)}}
