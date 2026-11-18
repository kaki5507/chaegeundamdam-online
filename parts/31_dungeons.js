/* ============================================================
   DUNGEONS : 레벨별 던전 5곳(방 3개 + 보스 방 + 보상 상자) · 던전 문지기
   SECRETS  : 택시로 못 가는 숨겨진 맵 4곳 — 포탈 표시 없음, 수수께끼 노인의 퀘스트로 찾기
   ============================================================ */
const DUNS=[
 {id:'dn1',name:'버섯 왕국 지하 저장고',min:20,theme:'mask',hue:300,lm:'mushcave',mobs:['mush','bat'],boss:'mush',bn:'버섯 왕국 문지기',gear:'g_dn_spore',sub:'빛나는 버섯 사이로 박쥐가 날아다니는 저장고'},
 {id:'dn2',name:'가라앉은 태엽 공장',min:35,theme:'origin',hue:190,lm:'gears',mobs:['gear','crab'],boss:'gear',bn:'고장 난 공장장 로봇',gear:'g_dn_cog',sub:'물에 잠긴 채 아직도 돌아가는 톱니바퀴들'},
 {id:'dn3',name:'얼어붙은 마도서관',min:50,theme:'snow',hue:220,lm:'library',mobs:['book','snowman','lamp'],boss:'snowman',bn:'서고의 얼음 사서',gear:'g_dn_ice',sub:'얼음에 갇힌 책장과 떠도는 마도서'},
 {id:'dn4',name:'용암 심장부',min:65,theme:'lava',hue:10,lm:'lavafall',mobs:['golem','lamp'],boss:'golem',bn:'용암 심장 골렘',gear:'g_dn_magma',sub:'산의 심장이 붉게 고동치는 곳'},
 {id:'dn5',name:'별의 신전 지하 성소',min:85,theme:'temple',hue:280,lm:'crystal',mobs:['golem','book','lamp'],boss:'golem',bn:'성소의 수호 거상',gear:'g_dn_star',sub:'수정이 노래하는 신전 가장 깊은 곳'},
];
Object.assign(GEAR,{
  g_dn_spore:{slot:'acc',n:'빛나는 포자 귀걸이',gr:2,atk:7,hp:8,req:{lv:20}},
  g_dn_cog:{slot:'acc',n:'황동 톱니 브로치',gr:3,atk:10,spd:4,req:{lv:35}},
  g_dn_ice:{slot:'armor',n:'서리 사서의 로브',gr:3,atk:10,hp:28,mp:20,req:{lv:50}},
  g_dn_magma:{slot:'acc',n:'용암 심장 펜던트',gr:4,atk:15,hp:14,req:{lv:65}},
  g_dn_star:{slot:'armor',n:'별빛 성소 갑주',gr:4,atk:16,hp:45,mp:25,req:{lv:85}},
  g_sec_charm:{slot:'acc',n:'수수께끼 풀이꾼의 부적',gr:4,atk:12,hp:12,mp:12,spd:4,req:{lv:20}},
});
const DUN_RUNS=5;
function dunRoom(D,k){
  const gy=470,last=k===3,Wd=last?1500:2000,r=mulberry(500+D.min*7+k),ms=Math.max(2,D.min*.16);
  const L=newL({id:D.id+'_'+k,name:D.name+(last?' · 보스 방':' · '+k+'번째 방'),sub:'Lv.'+D.min+'~ · '+D.sub,theme:D.theme,music:last?'boss':'sky',w:Wd,h:540,mscale:ms,allHue:D.hue,dun:D.id,room:k,spawn:{x:120,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));L.landmark={k:D.lm,x:0,y:gy};
  if(!last){
    const T=[[360,[[260,420],[940,460],[1520,380]]],[255,[[560,420],[1240,440]]]];
    const gr=D.mobs.filter(m=>!MOBS[m].fly),fl=D.mobs.filter(m=>MOBS[m].fly);let gi=k;
    for(const[y,list]of T)for(const[x,w]of list){L.plats.push(plat(x,y,w,16,'o'));L.ropes.push({x:x+40+Math.round(r()*(w-80)),y1:y,y2:gy});L.mobs.push([gr[(gi++)%gr.length],x+w/2,y,x+12,x+w-12])}
    for(let i=0;i<6;i++){const x=320+i*280;L.mobs.push([gr[(gi++)%gr.length],x,gy,x-120,x+120])}
    if(fl.length)for(let i=0;i<3;i++)L.mobs.push([fl[i%fl.length],500+i*520,200+(i%2)*60,90]);
    L.portals=[{x:Wd-70,y:gy,to:D.id+'_'+(k+1),label:'다음 방 →',clear:1,pqNext:0}];
  }else{
    L.plats.push(plat(200,350,220,14,'o'),plat(1080,350,220,14,'o'));L.ropes.push({x:310,y1:350,y2:gy},{x:1190,y1:350,y2:gy});
    L.dunBoss=1;L.portals=[];
  }
  return fixReach(L);
}
for(const D of DUNS)for(let k=1;k<=3;k++)MAPS[D.id+'_'+k]=()=>dunRoom(D,k);
// 방 잠금 : 몬스터를 다 잡아야 다음 방
{const _up=usePortal;usePortal=function(po){if(po.clear&&S.mobs.some(m=>!m.dead&&m.type!=='peer')){G.toast('🔒 몬스터를 모두 처치해야 문이 열려요 (남은 '+S.mobs.filter(m=>!m.dead&&m.type!=='peer').length+')');sfx('hurt');return}return _up(po)}}
// 던전 방에서는 몬스터가 다시 나오지 않는다
{const _rs=respawnStep;respawnStep=function(dt){if(S.L.dun)S.resp=[];_rs(dt)}}
// 보스 방
{const _lm=loadMap;loadMap=function(id,end){_lm(id,end);const L=S.L;S.dunBoss=null;S.dunDone=false;
  if(L.dun&&L.room===1){const D=DUNS.find(d=>d.id===L.dun),k='dun_'+D.id+'_'+dayNum();SAVE.flags[k]=(SAVE.flags[k]||0)+1;saveGame()}
  if(L.dunBoss){const D=DUNS.find(d=>d.id===L.dun),d=MOBS[D.boss],sc=2.8;
    const m=spawnMob(D.boss,L.w/2,300,{min:150,max:L.w-150,chase:true,hue:D.hue});m.sc=sc;m.w=Math.round(d.w*sc);m.h=Math.round(d.h*sc);
    m.hp=m.max=Math.round(d.hp*L.mscale*70*(1+.45*(PARTY.length-1)));m.dmg=Math.round(m.dmg*2.4);m.exp=Math.round(need(SAVE.lvl)*.05);m.fbName=D.bn;S.dunBoss=m;S.fb=m;
    G.banner={t:0,name:'⚠ '+D.bn,sub:D.name+' 의 주인이 깨어났다!'};sfx('roar')}}}
{const _km=killMob;killMob=function(m){const boss=m===S.dunBoss&&!m.dead;_km(m);if(boss&&m.dead){S.fb=null;
  S.L.npcs.push({id:'dchest',name:'던전 보물상자',x:clamp(m.x,200,S.L.w-200),gy:470,look:'chest',town:'dun_'+S.L.dun});G.banner={t:0,name:'던전 클리어!',sub:'보물상자를 열어 보상을 받으세요 (↑)'};sfx('levelup');
  S.L.portals.push({x:S.L.w-70,y:470,to:'__exit',label:'↩ 마을로',exit:true})}}}
function openDunChest(n){
  if(S.dunDone){openDialog('던전 보물상자','이미 열었어요.',[{t:'닫기',fn:closeUI}]);return}
  S.dunDone=true;const D=DUNS.find(d=>d.id===S.L.dun),lines=[];
  const ex=Math.round(need(SAVE.lvl)*.12),cn=800+D.min*60;gainExp(ex);addCoins(cn);SAVE.ec=(SAVE.ec||0)+1;lines.push('경험치 +'+ex+' · '+cn+'● · ◆1');
  const mat=D.min>=50?['essence','foxtail','stele']:['dhorn','stele','yolk'],mk=mat[(Math.random()*mat.length)|0],mn=1+(Math.random()<.5?1:0);SAVE.inv[mk]=(SAVE.inv[mk]||0)+mn;lines.push('🎁 '+ETC_NAME[mk]+' +'+mn);
  if(Math.random()<.3*EV().drop)lines.push(giveGear(D.gear,'던전 보상'));
  saveGame();sfx('levelup');spark(n.x,n.gy-20,40,'#ffe9a0',300,.8,4,0,true);
  openDialog('던전 보물상자 — '+D.name,lines.join('\n')+'\n\n오늘 남은 입장: '+Math.max(0,DUN_RUNS-(SAVE.flags['dun_'+D.id+'_'+dayNum()]||0))+'회',[{t:'마을로',fn:()=>{closeUI();goMap('town')}},{t:'닫기',fn:closeUI}]);
}
function dunMenu(n){
  const opts=DUNS.map(D=>{const used=SAVE.flags['dun_'+D.id+'_'+dayNum()]||0,ok=SAVE.lvl>=D.min&&used<DUN_RUNS;
    return{t:(SAVE.lvl<D.min?'🔒 ':'🗝 ')+D.name+'  Lv.'+D.min+'~  ('+used+'/'+DUN_RUNS+')',fn:()=>{if(SAVE.lvl<D.min){G.toast('Lv.'+D.min+'부터 들어갈 수 있어요');return}if(used>=DUN_RUNS){G.toast('오늘은 더 들어갈 수 없어요 (매일 '+DUN_RUNS+'회)');return}
      closeUI();sfx('portal');goMap(D.id+'_1')}}});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,'방 두 개의 몬스터를 모두 쓰러뜨리면 문이 열리고, 마지막 방엔 던전의 주인이 기다려.\n주인을 쓰러뜨리면 보물상자에서 경험치·재료·던전 전용 장비(30%)를 얻을 수 있지.\n던전마다 하루 '+DUN_RUNS+'번까지! (파티원이 많으면 보스가 더 단단해져)',opts);
}
NPC_LOOK_X.dunkeeper={job:'guardian',eq:{hat:'hat_helm',outfit:'out_dobok',cape:'cape_ghost'},n:'던전 문지기',fid:6};
ROLE.dunkeeper='레벨별 던전';ROLE.riddle='수수께끼 퀘스트';ROLE.secnpc='???';
{const _tw=MAPS.town;MAPS.town=()=>{const L=_tw();L.npcs.push({id:'dunkeeper',name:'던전 문지기 감자',x:3420,gy:470,look:'dunkeeper'},{id:'riddle',name:'수수께끼 노인 도토리',x:1180,gy:470,look:'riddle'});
  L.secrets=[{x:L.w-50,y:470,to:'sec_garden'}];return L}}

/* ---------- 던전 장식 ---------- */
{const _dl=drawLandmark;drawLandmark=function(g,L,t){_dl(g,L,t);const m=L.landmark;if(!m)return;const gy=m.y;
  if(m.k==='mushcave'){for(let i=0;i<Math.ceil(L.w/260);i++){const x=120+i*260,h=110+(i%3)*50,c=['#ff8ad8','#8ad8ff','#c0a0ff'][i%3];
      g.fillStyle='#f4e8ff';g.fillRect(x-9,gy-h,18,h);g.beginPath();g.moveTo(x-60,gy-h+6);g.bezierCurveTo(x-60,gy-h-70,x+60,gy-h-70,x+60,gy-h+6);g.closePath();g.fillStyle=c;g.globalAlpha=.75;g.fill();g.globalAlpha=1;
      const gl=g.createRadialGradient(x,gy-h-20,4,x,gy-h-20,90);gl.addColorStop(0,'rgba(255,220,255,.35)');gl.addColorStop(1,'rgba(255,220,255,0)');g.fillStyle=gl;g.fillRect(x-90,gy-h-110,180,180);
      for(const[dx,dy]of[[-28,-30],[10,-44],[30,-22]])circ(g,x+dx,gy-h+dy,6,'rgba(255,255,255,.7)')}}
  else if(m.k==='gears'){for(let i=0;i<Math.ceil(L.w/300);i++){const x=150+i*300,y=160+(i%2)*120,R=60+(i%3)*20;g.save();g.translate(x,y);g.rotate(t*(i%2?.5:-.5));g.fillStyle='rgba(150,130,90,.55)';
      for(let k=0;k<10;k++){g.rotate(Math.PI/5);g.fillRect(-9,-R-14,18,18)}circ(g,0,0,R,'rgba(170,150,100,.55)');circ(g,0,0,R*.35,'rgba(80,70,50,.6)');g.restore()}
    g.fillStyle='rgba(80,150,190,.25)';g.fillRect(0,gy-60,L.w,60)}
  else if(m.k==='library'){for(let i=0;i<Math.ceil(L.w/200);i++){const x=40+i*200;g.fillStyle='rgba(120,90,70,.55)';g.fillRect(x,110,150,gy-110);
      for(let s=0;s<6;s++){const y=130+s*55;g.fillStyle='rgba(90,60,40,.6)';g.fillRect(x,y+40,150,6);for(let b=0;b<9;b++){g.fillStyle=['#b06a6a','#6a8ab0','#8ab06a','#c0a050'][(b+s+i)%4];g.globalAlpha=.6;g.fillRect(x+6+b*15,y+6+((b*7+s)%3)*3,11,34-((b*7+s)%3)*3);g.globalAlpha=1}}
      g.fillStyle='rgba(220,240,255,.45)';g.fillRect(x,110,150,14);for(let k=0;k<4;k++)poly(g,[x+20+k*35,124,x+28+k*35,150,x+36+k*35,124],'rgba(220,240,255,.6)')}}
  else if(m.k==='lavafall'){for(let i=0;i<Math.ceil(L.w/340);i++){const x=170+i*340;const lg=g.createLinearGradient(0,0,0,gy);lg.addColorStop(0,'rgba(255,120,40,.9)');lg.addColorStop(1,'rgba(255,200,60,.8)');
      g.fillStyle=lg;g.fillRect(x-18,0,36,gy);for(let k=0;k<5;k++){const yy=((t*120+k*90)%gy);g.fillStyle='rgba(255,240,150,.7)';g.fillRect(x-14+(k%3)*8,yy,4,26)}
      const gl=g.createRadialGradient(x,gy-10,4,x,gy-10,120);gl.addColorStop(0,'rgba(255,160,60,.5)');gl.addColorStop(1,'rgba(255,160,60,0)');g.fillStyle=gl;g.fillRect(x-120,gy-130,240,140)}}
  else if(m.k==='crystal'){for(let i=0;i<Math.ceil(L.w/220);i++){const x=110+i*220,h=120+(i%3)*60,c=['rgba(200,170,255,.7)','rgba(150,220,255,.7)','rgba(255,200,240,.7)'][i%3];
      poly(g,[x-22,gy,x,gy-h,x+22,gy],c,'rgba(255,255,255,.8)',2);poly(g,[x+14,gy,x+34,gy-h*.55,x+46,gy],c,'rgba(255,255,255,.8)',2);
      g.globalAlpha=.4+.3*Math.sin(t*2+i);circ(g,x,gy-h+20,10,'#fff');g.globalAlpha=1}}
  else if(m.k==='garden'){for(let i=0;i<Math.ceil(L.w/180);i++){const x=90+i*180;g.fillStyle='#8a5a3a';g.fillRect(x-6,gy-150,12,150);
      for(const[dx,dy,r]of[[0,-170,46],[-34,-140,32],[34,-140,32]])circ(g,x+dx,gy+dy,r,['#ffb8e0','#fff0a0','#c8f0c0'][i%3]);
      for(let k=0;k<3;k++){const a=t+i+k*2;txt(g,'✿',x+Math.cos(a)*50,gy-60+Math.sin(a*1.3)*20,14,'#ff9ad0','center',0)}}}
  else if(m.k==='stars'){for(let i=0;i<60;i++){const r=mulberry(i*17+3),x=r()*L.w,y=r()*380,tw=.4+.6*Math.abs(Math.sin(t*2+i));g.globalAlpha=tw;txt(g,'✦',x,y,8+r()*10,'#fff6c0','center',0)}g.globalAlpha=1}
  else if(m.k==='sea'){g.fillStyle='rgba(60,140,200,.35)';g.fillRect(0,0,L.w,gy);for(let i=0;i<30;i++){const r=mulberry(i*29),x=r()*L.w,y=((r()*gy)-t*30*(.5+r()))%gy;circ(g,x,(y+gy)%gy,3+r()*5,'rgba(220,250,255,.6)')}
    for(let i=0;i<Math.ceil(L.w/160);i++){const x=60+i*160;g.strokeStyle='rgba(60,180,120,.7)';g.lineWidth=6;g.beginPath();g.moveTo(x,gy);for(let k=1;k<6;k++)g.lineTo(x+Math.sin(t*1.5+k+i)*12,gy-k*30);g.stroke()}}
  else if(m.k==='moon'){const gl=g.createRadialGradient(L.w/2,120,20,L.w/2,120,300);gl.addColorStop(0,'rgba(255,250,220,.9)');gl.addColorStop(.3,'rgba(220,210,255,.35)');gl.addColorStop(1,'rgba(220,210,255,0)');g.fillStyle=gl;g.fillRect(L.w/2-300,-180,600,600);
    circ(g,L.w/2,120,90,'#f8f4e0');for(const[dx,dy,r]of[[-30,-20,14],[25,20,20],[10,-40,8],[-20,40,10]])circ(g,L.w/2+dx,120+dy,r,'rgba(200,190,170,.6)')}
}}
// 애니메이션 배경 목록에 추가 (배경 캐시 갱신)
{const _drawBGx=drawBG;}

/* ---------- 숨겨진 맵 ---------- */
const SECRETS={
 sec_garden:{name:'??? 비밀의 정원',sub:'아무도 모르는 마을 끝, 꽃이 지지 않는 정원',theme:'forest',lm:'garden',back:'town',music:'town',mobs:[],npc:{n:'정원지기 할머니 들꽃',lines:['어머나, 여길 찾아오다니! 이 정원은 마음이 맑은 사람만 볼 수 있단다.','꽃 한 송이 가져가렴. 하루에 한 번은 꽃이 다시 핀단다.']}},
 sec_star:{name:'??? 별똥별 동굴',sub:'별이 떨어진 자리 아래 숨겨진 동굴',theme:'night',lm:'stars',back:'h2',music:'sky',mobs:['bat','book'],min:15,npc:{n:'별똥별 요정 반짝',lines:['쉿! 여기 떨어진 별 조각들은 내가 지키고 있어.','별 조각을 노리는 박쥐들을 쫓아내 줄래?']}},
 sec_mermaid:{name:'??? 인어의 동굴',sub:'부두 끝 바다 아래, 노래가 들리는 동굴',theme:'sea',lm:'sea',back:'harbor',music:'town',mobs:['crab'],min:5,npc:{n:'인어 가수 물방울',lines:['바다의 노래를 들었구나? 그럼 넌 친구야!','항구 사람들은 이 동굴을 몰라. 우리만의 비밀이야.']}},
 sec_moon:{name:'??? 달의 뒷면',sub:'달그림자 계곡 너머, 아무도 본 적 없는 달의 뒤편',theme:'night',lm:'moon',back:'h5',music:'boss',mobs:['lamp','book','golem'],min:70,npc:{n:'달토끼 은하',lines:['여기까지 오다니… 넌 진짜 모험가구나.','달의 뒷면엔 오래된 보물이 잠들어 있어. 단, 지키는 녀석들이 있지.']}},
};
function buildSecret(id){
  const D=SECRETS[id],gy=470,Wd=1800,ms=Math.max(1.2,(D.min||5)*.17);
  const L=newL({id,name:D.name,sub:D.sub,theme:D.theme,music:D.music,w:Wd,h:540,mscale:ms,secret:1,spawn:{x:140,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'),plat(420,360,240,14,'o'),plat(1140,360,240,14,'o'),plat(760,260,280,14,'o'));
  L.ropes.push({x:540,y1:360,y2:gy},{x:1260,y1:360,y2:gy},{x:900,y1:260,y2:360});L.landmark={k:D.lm,x:0,y:gy};
  D.mobs.forEach((m,i)=>{for(let k=0;k<3;k++){const x=500+k*420+i*60;L.mobs.push(MOBS[m].fly?[m,x,200,90]:[m,x,gy,x-140,x+140])}});
  L.npcs=[{id:'secnpc',name:D.npc.n,x:300,gy,look:'jl_priest',sec:id},{id:'chest',name:'비밀의 상자',x:900,gy:260,look:'chest',town:id}];
  L.portals=[{x:60,y:gy,to:D.back,label:'← 돌아가기'}];
  return fixReach(L);
}
for(const id in SECRETS)MAPS[id]=()=>buildSecret(id);
// 숨겨진 입구 : 포탈 표시 없이 ↑ 를 누르면 들어간다 (가끔 아주 희미하게 반짝)
function addSecretSpots(L){
  L.secrets=L.secrets||[];
  const top=()=>L.plats.filter(p=>!p.mv&&p.t==='o').sort((a,b)=>a.y-b.y)[0];
  if(L.id==='h2'){const p=top();if(p)L.secrets.push({x:p.x+p.w/2,y:p.y,to:'sec_star'})}
  if(L.id==='h5'){const p=top();if(p)L.secrets.push({x:p.x+p.w/2,y:p.y,to:'sec_moon'})}
  if(L.id==='harbor'){const p=L.plats.filter(p=>!p.mv).sort((a,b)=>(b.x+b.w)-(a.x+a.w))[0];if(p)L.secrets.push({x:Math.min(L.w-40,p.x+p.w-30),y:p.y,to:'sec_mermaid'})}
  return L;
}
for(const id of ['h2','h5','harbor']){const f=MAPS[id];MAPS[id]=function(){return addSecretSpots(f.apply(this,arguments))}}
function secretStep(){
  const L=S.L,p=PARTY[0];if(!L.secrets||!p||p.dead||G.ui||!pressed.ArrowUp||S.near)return;
  for(const s of L.secrets)if(Math.abs(p.x-s.x)<44&&Math.abs(p.y-s.y)<36){const D=SECRETS[s.to];if(D.min&&SAVE.lvl<D.min){G.toast('…무언가 느껴지지만 아직은 힘이 부족하다 (Lv.'+D.min+')');return}
    sfx('portal');spark(p.x,p.y-30,40,'#fff6c0',300,.8,4,0,true);G.toast('✨ 숨겨진 길을 발견했다!');goMap(s.to);return}
}
{const _rs=respawnStep;respawnStep=function(dt){_rs(dt);secretStep()}}
{const _lm=loadMap;loadMap=function(id,end){_lm(id,end);if(S.L.secret){qev('reach',{map:id});const k='found_'+id;if(!SAVE.flags[k]){SAVE.flags[k]=1;SAVE.ec=(SAVE.ec||0)+2;G.banner={t:0,name:'✨ 숨겨진 장소 발견!',sub:S.L.name.replace('??? ','')+'  · ◆ +2'};saveGame()}}}}
{const _st=drawSelfTag;drawSelfTag=function(g){_st(g);const L=S.L;if(!L.secrets)return;const t=G.t;
  for(const s of L.secrets){const k=(t*.35+s.x*.001)%1;if(k<.12){g.globalAlpha=Math.sin(k/.12*Math.PI)*.55;txt(g,'✦',s.x,s.y-30,14,'#fff8d0','center',0);g.globalAlpha=1}}}}

/* ---------- 수수께끼 노인 · 퀘스트 ---------- */
NPC_LOOK_X.riddle={job:'priest',eq:{hat:'hat_gat',outfit:'out_vest'},n:'수수께끼 노인 도토리',fid:12};
GIVER_NAME.riddle='수수께끼 노인 도토리';
Object.assign(QUESTS,{
 rq1:{name:'수수께끼 ① 해가 뜨는 쪽 끝',giver:'riddle',min:5,desc:'"해가 뜨는 쪽, 마을의 가장 끝. 다들 울타리 너머엔 길이 없다고 하지만… 끝에 서서 위를 보면 문이 있지."\n\n(포탈은 보이지 않는다. 그 자리에서 ↑ 를 눌러보자)',objs:[{t:'reach',map:'sec_garden',label:'숨겨진 장소를 찾아라'}],rew:{pct:.08,coin:500}},
 rq2:{name:'수수께끼 ② 별이 떨어진 자리',giver:'riddle',min:15,pre:['rq1'],desc:'"반딧불이 가장 높이 모이는 숲. 그 숲에서 하늘과 가장 가까운 발판, 별이 떨어진 자리에 서서 하늘을 올려다보게."',objs:[{t:'reach',map:'sec_star',label:'숨겨진 장소를 찾아라'}],rew:{pct:.1,coin:1500}},
 rq3:{name:'수수께끼 ③ 바다의 노래',giver:'riddle',min:15,pre:['rq2'],desc:'"처음 배를 탔던 항구를 기억하나? 부두의 맨 끝, 더는 걸을 수 없는 곳에서 바다의 노래에 귀 기울여 보게."',objs:[{t:'reach',map:'sec_mermaid',label:'숨겨진 장소를 찾아라'}],rew:{pct:.1,coin:2000}},
 rq4:{name:'수수께끼 ④ 달의 뒷면',giver:'riddle',min:70,pre:['rq3'],desc:'"가장 깊은 계곡, 달그림자가 드리운 곳. 달에 가장 가까운 발판에 서면… 달의 뒷면으로 건너갈 수 있다네. 그곳의 보물은 자네 것이야."',objs:[{t:'reach',map:'sec_moon',label:'숨겨진 장소를 찾아라'}],rew:{pct:.15,coin:8000,gear:'g_sec_charm'}},
});
{const _t=talkNPC;talkNPC=function(n){
  if(n.id==='dunkeeper')return dunMenu(n);
  if(n.id==='dchest')return openDunChest(n);
  if(n.id==='riddle'){if(!SAVE.talked.riddle){SAVE.talked.riddle=1;qev('talk',{})}return questMenu(n,'riddle','허허, 수수께끼 좋아하나? 이 세상엔 포탈도 표지판도 없는 길이 있다네.\n내 수수께끼를 풀면 그 길이 보일 게야.')}
  if(n.id==='secnpc'){const D=SECRETS[n.sec];n.li=((n.li|0)+1)%D.npc.lines.length;return openDialog(n.name,D.npc.lines[n.li],[{t:'또 얘기하기',fn:()=>talkNPC(n)},{t:'닫기',fn:closeUI}])}
  return _t(n)}}
NPC_LOOK_X.jl_priest=NPC_LOOK_X.jl_priest||{job:'priest',eq:{},n:'',fid:7};
// 가이드에 던전 추천
{const _ng=nextGoals;nextGoals=function(){const g=_ng(),D=DUNS.filter(d=>SAVE.lvl>=d.min).pop();if(D)g.splice(1,0,'🗝 던전 「'+D.name+'」 — 던전 문지기 (하루 '+DUN_RUNS+'회)');return g.slice(0,3)}}
