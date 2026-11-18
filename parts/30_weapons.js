/* ============================================================
   WEAPONS : Lv.30 각성 무기 · Lv.70 전설 무기 — 직업 마을 교관의 퀘스트로만 획득
   장착하면 무기에 빛 오라(각성: 푸른 별빛 / 전설: 황금 불꽃)가 감돈다
   ============================================================ */
const SIGW={
 warrior:{wt:'sword',st:'str',a:['청룡 대파검','천공의 대파 성검']},
 archer:{wt:'bow',st:'dex',a:['바람결 당근궁','유성우 당근 대궁']},
 guardian:{wt:'twohand',st:'str',a:['산사태 무망치','대지 진동 무해머']},
 mage:{wt:'staff',st:'int',a:['별빛 양파봉','은하수 양파 지팡이']},
 fighter:{wt:'knuckle',st:'str',a:['용암 고추권','태양 폭염 고추권']},
 rogue:{wt:'dagger',st:'luk',a:['그믐달 가지검','월식 쌍가지검']},
 gunner:{wt:'gun',st:'dex',a:['천둥 옥수수포','폭풍우 옥수수 대포']},
 priest:{wt:'wand',st:'int',a:['새벽빛 마늘봉','성광 마늘 홀']},
};
for(const job in SIGW){const s=SIGW[job],h2=WT[s.wt].h2?1:0,extra=job==='mage'||job==='priest'?{mp:25}:job==='rogue'||job==='fighter'||job==='archer'?{spd:5}:{hp:12};
  GEAR['g_aw_'+job]=Object.assign({wt:s.wt,n:'각성의 '+s.a[0],gr:3,atk:23+h2*4,req:{lv:30,[s.st]:90},sig:1},extra);
  GEAR['g_lg_'+job]=Object.assign({wt:s.wt,n:'전설의 '+s.a[1],gr:4,atk:40+h2*6,req:{lv:70,[s.st]:200},sig:2},Object.fromEntries(Object.entries(extra).map(([k,v])=>[k,v*2])));
  GEAR['g_aw_'+job].slot=GEAR['g_lg_'+job].slot=WT[s.wt].lh?'lh':'rh';
  QUESTS['wq30_'+job]={name:'각성 무기 : '+s.a[0],giver:'coach',min:30,pre:['j1'],job,
    desc:'Lv.30, 이제 진짜 무기를 다룰 때다. 우리 마을 사냥터에서 실력을 보이고, 도깨비 대왕을 쓰러뜨려 그 뿔을 가져와라. 그러면 이 마을에 전해지는 각성 무기를 내어주마.',
    objs:[{t:'kill',mob:'any',map:'jh_'+job,n:60,label:'우리 직업 마을 사냥터 몬스터'},{t:'boss',id:'dokkaebi',n:1,label:'도깨비 대왕 토벌'},{t:'collect',item:'dhorn',n:3,label:'도깨비 뿔 납품'}],
    rew:{pct:.3,coin:3000,gear:'g_aw_'+job}};
  QUESTS['wq70_'+job]={name:'전설 무기 : '+s.a[1],giver:'coach',min:70,pre:['wq30_'+job],job,
    desc:'각성 무기를 쥔 지 오래구나. 전설의 무기는 아무에게나 주지 않는다. 달그림자 계곡에서 수련하고, 천년 귀목과 구미호를 쓰러뜨려 그 증표를 가져와라.',
    objs:[{t:'kill',mob:'any',map:'h5',n:120,label:'달그림자 계곡 몬스터'},{t:'boss',id:'guimok',n:1,label:'천년 귀목 토벌'},{t:'boss',id:'fox',n:1,label:'구미호 토벌'},{t:'collect',item:'essence',n:2,label:'귀목의 정수 납품'},{t:'collect',item:'foxtail',n:4,label:'구미호 꼬리털 납품'}],
    rew:{pct:.4,coin:12000,gear:'g_lg_'+job}};
}
// 다른 직업 퀘스트는 받을 수 없게
{const _qa=qAvail;qAvail=function(id){const q=QUESTS[id];if(q&&q.job&&q.job!==SAVE.job)return false;return _qa(id)}}
// 교관 메뉴에 무기 퀘스트
{const _am=advMenu;advMenu=function(n){_am(n);if(n.id!=='coach'||!S.L.jt||!G.dlg)return;
  const ids=['wq30_'+SAVE.job,'wq70_'+SAVE.job],add=[];
  for(const id of ids){const st=qst(id).s;if(st!=='none'||qAvail(id))add.push({t:({none:'[!] ',active:'[진행중] ',ready:'[완료!] ',done:'[끝] '})[st]+'⚔ '+QUESTS[id].name,fn:()=>questDetail(n,'coach',id)});
    else if(st==='none'){const q=QUESTS[id];add.push({t:'🔒 '+q.name+'  (Lv.'+q.min+(q.pre.length&&qst(q.pre[0]).s!=='done'?' · 선행 퀘스트':'')+')',fn:()=>G.toast('Lv.'+q.min+'부터 받을 수 있어요')})}}
  G.dlg.opts.splice(G.dlg.opts.length-1,0,...add);
  G.dlg.text+='\n\n⚔ Lv.30 「각성 무기」 · Lv.70 「전설 무기」 는 이 교관의 퀘스트로만 얻을 수 있다.'}}
// 가이드에도
{const _ng=nextGoals;nextGoals=function(){const g=_ng(),j=SAVE.job,a=qst('wq30_'+j).s,b=qst('wq70_'+j).s;
  if(SAVE.lvl>=30&&a!=='done')g.unshift('⚔ 각성 무기 퀘스트 ('+(a==='none'?'직업 마을 교관':a==='ready'?'완료! 보고하기':'진행 중')+')');
  else if(SAVE.lvl>=70&&b!=='done')g.unshift('⚔ 전설 무기 퀘스트 ('+(b==='none'?'직업 마을 교관':b==='ready'?'완료! 보고하기':'진행 중')+')');
  return g.slice(0,3)}}

/* ---------- 무기 오라 ---------- */
let WFX=0;
const sigOf=()=>{const id=SAVE&&SAVE.gear&&(SAVE.gear.rh||SAVE.gear.lh);return id&&GEAR[id]&&GEAR[id].sig||0};
{const _dv=drawVeggie;drawVeggie=function(g,c,o){const prev=WFX;
  if(o&&o.wfx!=null)WFX=o.wfx;else if(PARTY[0]&&o&&o.x===PARTY[0].x&&o.y===PARTY[0].y&&c===JOB[PARTY[0].job])WFX=sigOf();else WFX=0;
  try{return _dv(g,c,o)}finally{WFX=prev}}}
{const _dw=drawVegWeapon;drawVegWeapon=function(g,c,t,st){
  if(WFX){const gold=WFX>=2,col=gold?'255,200,80':'120,210,255';
    g.save();g.globalCompositeOperation='lighter';
    const gl=g.createRadialGradient(0,-16,2,0,-16,gold?34:26);gl.addColorStop(0,`rgba(${col},${gold?.55:.4})`);gl.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gl;g.fillRect(-36,-52,72,72);
    g.restore()}
  _dw(g,c,t,st);
  if(WFX){const gold=WFX>=2;g.save();g.globalCompositeOperation='lighter';
    for(let i=0;i<(gold?5:3);i++){const a=t*(gold?4:3)+i*2.1,r=gold?16:12;g.fillStyle=gold?(i%2?'#fff3b0':'#ffb040'):(i%2?'#ffffff':'#8ae0ff');g.globalAlpha=.6+.4*Math.sin(t*6+i);
      g.beginPath();g.arc(Math.cos(a)*r,-16+Math.sin(a)*r*1.4,gold?2.6:2,0,6.28);g.fill()}
    if(gold){for(let i=0;i<3;i++){const k=(t*1.5+i/3)%1;g.globalAlpha=(1-k)*.7;g.fillStyle='#ff9a30';g.beginPath();g.ellipse(Math.sin(t*5+i*2)*4,-24-k*22,3*(1-k)+1,6*(1-k)+1,0,0,6.28);g.fill()}}
    g.restore()}
};}
// 다른 유저에게도 보이게 (접속 정보에 무기 등급)
{const _dp=drawPeers;drawPeers=function(g,t){
  const orig=drawVeggie;drawVeggie=function(g2,c,o){const q=Object.values(PEERS).find(q=>q.x===o.x&&q.y===o.y);return orig(g2,c,Object.assign({},o,{wfx:q&&q.tg.w||0}))};
  try{_dp(g,t)}finally{drawVeggie=orig}}}
