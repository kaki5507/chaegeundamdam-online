/* ============================================================
   BOSSLOOT : 보스 → 전용 재료(확정) → 보스 연구가의 토벌 의뢰/제작으로 이어지는 보상
   밸런스 : 재료는 확정이라 꾸준히 잡으면 반드시 얻는다. 장비는 보스 레벨대에 맞춘 등급.
   ============================================================ */
Object.assign(ETC_NAME,{dhorn:'도깨비 뿔',foxtail:'구미호 꼬리털',yolk:'황금 노른자',stele:'비석 조각',fang:'거대 송곳니',festm:'축제 훈장'});
const BOSS_MATS=['dhorn','foxtail','yolk','stele','fang','festm'];
const BOSS_MAT_DESC={dhorn:'도깨비 대왕이 확정으로 2~3개 남긴다. 보스 연구가에게 가져가자.',foxtail:'구미호가 확정으로 2개 남긴다.',yolk:'킹 달걀 슬라임(파티퀘스트)이 확정으로 2개 남긴다.',
  stele:'비석의 길 보스들이 2~3개 남긴다.',fang:'사냥터 필드 보스가 1~2개 남긴다.',festm:'축제 보스 레이드 참가 보상으로 2개.'};
// 제작 장비
Object.assign(GEAR,{
  g_bl_horn:{slot:'acc',n:'도깨비 뿔 귀걸이',gr:2,atk:7,hp:6,req:{lv:15}},
  g_bl_tail:{slot:'acc',n:'구미호 꼬리 목도리',gr:3,atk:10,spd:5,req:{lv:30}},
  g_bl_yolk:{slot:'acc',n:'황금 노른자 펜던트',gr:3,atk:9,hp:12,req:{lv:25}},
  g_bl_stele:{slot:'armor',n:'비석 수호 갑옷',gr:3,atk:8,hp:30,req:{lv:25}},
  g_bl_fang:{slot:'acc',n:'거대 송곳니 부적',gr:3,atk:11,hp:8,req:{lv:35}},
});
// 보스별 확정 재료 · 의뢰(반복) · 제작
const BOSS_LOOT={
  dokkaebi:{mat:'dhorn',n:[2,3]},fox:{mat:'foxtail',n:[2,2]},eggking:{mat:'yolk',n:[2,2]},guimok:{mat:'essence',n:[1,1]},
  sb1:{mat:'stele',n:[2,2]},sb2:{mat:'stele',n:[2,2]},sb3:{mat:'stele',n:[2,3]},sb4:{mat:'stele',n:[2,3]},sb5:{mat:'stele',n:[3,3]},sb6:{mat:'stele',n:[3,4]},
};
const BL_JOBS=[ // 반복 의뢰 : 재료 몇 개 → 경험치(현재 레벨 필요치의 %) + 코인 + ◆
  {mat:'dhorn',n:3,pct:.05,coin:600,ec:1,t:'도깨비 뿔 3개 납품'},
  {mat:'foxtail',n:3,pct:.06,coin:1200,ec:1,t:'구미호 꼬리털 3개 납품'},
  {mat:'yolk',n:2,pct:.05,coin:1000,ec:1,t:'황금 노른자 2개 납품'},
  {mat:'stele',n:4,pct:.06,coin:900,ec:1,t:'비석 조각 4개 납품'},
  {mat:'fang',n:2,pct:.04,coin:800,ec:1,t:'거대 송곳니 2개 납품'},
];
const BL_CRAFT=[
  {id:'g_bl_horn',need:{dhorn:5,vegbit:20}},
  {id:'g_bl_yolk',need:{yolk:4,vegbit:30}},
  {id:'g_bl_stele',need:{stele:10,vegbit:30}},
  {id:'g_bl_tail',need:{foxtail:6,dhorn:3}},
  {id:'g_bl_fang',need:{fang:6,vegbit:40}},
  {id:'g_gm_ring',need:{essence:3,dhorn:5}},
  {id:'g_rd_star',need:{festm:8}},
];
function addMat(k,n){SAVE.inv[k]=(SAVE.inv[k]||0)+n;qev('collect',{item:k})}
const _bossFinishL=bossFinish;
bossFinish=function(b){
  _bossFinishL(b);
  const bid=b.sid||b.id,L=BOSS_LOOT[bid];if(!L||b.raid)return;
  const n=L.n[0]+((Math.random()*(L.n[1]-L.n[0]+1))|0);addMat(L.mat,n);
  const first=!SAVE.flags['bfirst_'+bid];let fl=null;
  if(first){SAVE.flags['bfirst_'+bid]=1;SAVE.apFree=(SAVE.apFree||0)+3;SAVE.ec=(SAVE.ec||0)+3;fl='★ 첫 토벌 보너스 : AP +3 · ◆ +3'}
  saveGame();
  if(G.clear){G.clear.lines=G.clear.lines.slice(0,4).concat(['🎁 '+ETC_NAME[L.mat]+' +'+n+'  (보유 '+SAVE.inv[L.mat]+')'],fl?[fl]:[],['→ 야채마을 「보스 연구가」에게 가져가요'])}
};
// 필드 보스 · 레이드
{const _km=killMob;killMob=function(m){const fb=m.fb&&!m.dead;_km(m);if(fb&&m.dead){const n=1+(Math.random()<.4?1:0);addMat('fang',n);ftext(m.x,m.y-120,ETC_NAME.fang+' +'+n,'#ffd34a',16,1.4)}}}
{const _bf=bossFinish;bossFinish=function(b){const raid=b.raid;_bf(b);if(raid){addMat('festm',2);saveGame();if(G.dlg)G.dlg.text=G.dlg.text.replace('참가 보상:','참가 보상: 축제 훈장 ×2 ·')}}}

/* ---------- 보스 연구가 (야채마을) ---------- */
NPC_LOOK_X.bossdoc={job:'mage',eq:{hat:'hat_gat',outfit:'out_vest'},n:'보스 연구가',fid:9};
ROLE.bossdoc='보스 재료 · 제작';
{const _tw=MAPS.town;MAPS.town=()=>{const L=_tw();L.npcs.push({id:'bossdoc',name:'보스 연구가 우엉',x:3440,gy:470,look:'bossdoc'});return L}}
const matTxt=need=>Object.entries(need).map(([k,v])=>(ETC_NAME[k]||k)+' '+(SAVE.inv[k]||0)+'/'+v).join(' · ');
const hasNeed=need=>Object.entries(need).every(([k,v])=>(SAVE.inv[k]||0)>=v);
function bossDoc(n){
  const opts=[];
  opts.push({t:'📜 토벌 의뢰 (반복 납품)',fn:()=>{
    openDialog(n.name,'보스 재료를 가져오면 연구비를 줄게! 몇 번이든 좋아.',BL_JOBS.map(j=>({t:(SAVE.inv[j.mat]>=j.n?'[완료 가능] ':'')+j.t+'  ('+(SAVE.inv[j.mat]||0)+'/'+j.n+') → 경험치 '+Math.round(j.pct*100)+'% · '+j.coin+'● · ◆'+j.ec,
      fn:()=>{if((SAVE.inv[j.mat]||0)<j.n){G.toast('재료가 부족해요');return}SAVE.inv[j.mat]-=j.n;const ex=Math.round(need(SAVE.lvl)*j.pct);gainExp(ex);addCoins(j.coin);SAVE.ec=(SAVE.ec||0)+j.ec;saveGame();sfx('levelup');
        openDialog(n.name,'고마워! 연구에 큰 도움이 됐어.\n경험치 +'+ex+' · '+j.coin+'● · ◆'+j.ec,[{t:'더 납품하기',fn:()=>bossDoc(n)},{t:'닫기',fn:closeUI}])}})).concat([{t:'뒤로',fn:()=>bossDoc(n)}]))}});
  opts.push({t:'⚒ 보스 장비 제작',fn:()=>{
    openDialog(n.name,'재료를 모아오면 보스의 힘이 깃든 장비를 만들어 줄게.',BL_CRAFT.map(c=>{const d=GEAR[c.id],own=SAVE.ginv[c.id];return{t:(own?'[보유] ':hasNeed(c.need)?'[제작 가능] ':'')+'['+GRADE[d.gr]+'] '+d.n+' — '+matTxt(c.need),
      fn:()=>{if(own){G.toast('이미 가지고 있어요');return}if(!hasNeed(c.need)){G.toast('재료가 부족해요');return}for(const[k,v]of Object.entries(c.need))SAVE.inv[k]-=v;SAVE.ginv[c.id]=1;saveGame();sfx('levelup');
        openDialog(n.name,'완성! ['+GRADE[d.gr]+'] '+d.n+'\n'+gearDesc(c.id)+'\n\n인벤토리(I) → 장비에서 착용해요.',[{t:'뒤로',fn:()=>bossDoc(n)},{t:'닫기',fn:closeUI}])}}}).concat([{t:'뒤로',fn:()=>bossDoc(n)}]))}});
  opts.push({t:'어떤 보스가 무엇을 주나요?',fn:()=>openDialog(n.name,'· 도깨비 대왕 → 도깨비 뿔 2~3\n· 구미호 → 구미호 꼬리털 2\n· 킹 달걀 슬라임(파티퀘스트) → 황금 노른자 2\n· 천년 귀목 → 귀목의 정수 1 (+기존 40%)\n· 비석의 길 보스 → 비석 조각 2~4\n· 사냥터 필드 보스 → 거대 송곳니 1~2\n· 축제 보스 레이드 → 축제 훈장 2\n\n보스마다 처음 잡으면 AP +3 · ◆3 보너스!',[{t:'뒤로',fn:()=>bossDoc(n)}])});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,'보스들이 남긴 재료를 연구하는 우엉이야.\n재료는 보스를 잡으면 반드시 떨어지니, 꾸준히 모아오면 좋은 장비를 만들어 줄게!',opts);
}
{const _t=talkNPC;talkNPC=function(n){if(n.id==='bossdoc'){if(!SAVE.talked.bossdoc){SAVE.talked.bossdoc=1;qev('talk',{})}return bossDoc(n)}return _t(n)}}
