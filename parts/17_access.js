/* ============================================================
   ACCESS : 구름 택시 · NPC 역할 표시 · 모바일 물약/퀵슬롯 터치 · 마을 높은 곳 길
   ============================================================ */
/* ---------- 구름 택시 (마을 · 사냥터 어디서나) ---------- */
NPC_LOOK_X.taxi={job:'gunner',eq:{hat:'hat_helm',outfit:'out_vest'},n:'구름 택시 기사 뭉치',fid:1};
function taxiDests(){
  const d=[{id:'harbor',n:'⛵ 새싹 항구',c:50},{id:'town',n:'🏘 야채마을',c:50,min:1,end:false}];
  d.push({id:'stele',n:'🪨 비석의 길',c:200,min:15});
  for(const h of HUNTS)d.push({id:h.id,n:'🌾 '+h.name+'  ('+h.lv+')',c:100+h.min*6,min:h.min});
  d.push({id:'forest',n:'🌲 도깨비 숲 입구',c:120});
  if(SAVE.cleared.forest)d.push({id:'forest',n:'⛩ 도깨비 숲 꼭대기',c:400,end:true});
  if(SAVE.cleared.dokkaebi)d.push({id:'sky',n:'☁ 하늘길 입구',c:300});
  if(SAVE.cleared.sky)d.push({id:'sky',n:'🌙 하늘길 끝 (달빛 신당 앞)',c:600,end:true});
  d.push({id:'cave',n:'🌋 귀문 동굴',c:800,min:40});
  return d.filter(x=>x.id!==S.id||x.end);
}
function taxiMenu(n){
  const opts=taxiDests().map(d=>{const lock=d.min&&SAVE.lvl<d.min;return{t:(lock?'🔒 ':'')+d.n+'  — '+d.c+'●',fn:()=>{
    if(lock){G.toast('Lv.'+d.min+'부터 갈 수 있어요');return}
    if(SAVE.coins<d.c){G.toast('코인이 부족해요 ('+d.c+'●)');return}
    SAVE.coins-=d.c;closeUI();sfx('portal');goMap(d.id,false,!!d.end);G.toast('뭉게뭉게~ 구름 택시 출발!')}}});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(n.name,'어디든 구름 타고 슝~ 데려다줄게! 사냥터, 마을, 던전 입구 어디든!\n(한 번 가 본 꼭대기는 바로 갈 수 있어)  보유 ● '+SAVE.coins,opts);
}
function addTaxi(L){
  const ok=L.town||L.hunt||L.hub||L.id==='forest'||L.id==='sky';
  if(!ok||(L.npcs||[]).some(n=>n.id==='taxi'))return;
  if(L.harbor&&SAVE.lvl<5)return;
  const sx=(L.spawn?L.spawn.x:200)+(L.hunt?240:L.id==='town'?-140:120),gy=L.spawn?L.spawn.y:470;
  L.npcs=L.npcs||[];L.npcs.push({id:'taxi',name:'구름 택시',x:Math.max(60,sx),gy,look:'taxi',tag:'순간이동 · 택시'});
}
function drawTaxiCar(g,x,y,t){
  const b=Math.sin(t*2)*2;g.save();g.translate(x+34,y-6+b);
  puff(g,0,0,22,'#ffffff',O_);g.fillStyle='rgba(200,220,255,.6)';g.beginPath();g.arc(-8,4,9,0,6.28);g.fill();
  g.fillStyle='#ffd34a';g.beginPath();g.roundRect(-14,-30,28,14,5);g.fill();g.strokeStyle=O_;g.lineWidth=1.6;g.stroke();
  txt(g,'TAXI',0,-19,9,'#5a3a00','center',0);g.restore();
}

/* ---------- NPC 역할 표시 (이름표 아래) ---------- */
const ROLE={chief:'메인 퀘스트',daily:'일일 퀘스트',shop:'물약 · 치장 상점',cash:'캐시 상점 (◆)',board:'퀘스트 게시판',party:'파티 모집',att:'출석 체크',coach:'1차 전직',adv2:'2차 전직',adv3:'3차 전직',
  duel:'PvP 결투장',portal:'포탈 · 사냥터 이동',closet:'옷장 · 표정',miko:'숨겨진 퀘스트',scroll:'강화 주문서',fame:'랭킹',taxi:'순간이동 택시',captain:'튜토리얼 · 퀘스트',fisher:'퀘스트',baker:'퀘스트',
  kid:'대화',dol:'스토리 · 비석',swingkid:'퀘스트',roofcat:'대화',balloon:'대화',lookout:'대화',zgate:'파티던전',adv:'전직'};
const roleOf=n=>ROLE[n.id]||(/^c[1-6]$/.test(n.id)?'스토리 퀘스트':n.tag||'');
function drawRoleTag(g,n){const r=roleOf(n);if(!r)return;g.font=F(10);const w=g.measureText(r).width+10;g.fillStyle='rgba(255,240,252,.9)';g.beginPath();g.roundRect(n.x-w/2,n.gy+20,w,13,6);g.fill();txt(g,r,n.x,n.gy+30,10,'#8a4ac0','center',0)}

/* ---------- 모바일 : 물약 버튼 · 퀵슬롯 탭 ---------- */
(function mobileExtras(){
  const box=document.getElementById('touch');if(!box)return;
  for(const[k,label,pos,col]of[['Digit1','HP','right:150px;top:10px','rgba(255,110,140,.45)'],['Digit2','MP','right:206px;top:10px','rgba(110,150,255,.45)'],['Enter','💬','right:262px;top:10px','rgba(255,255,255,.18)'],['KeyO','AP','right:318px;top:10px','rgba(140,255,170,.3)']]){
    const b=document.createElement('div');b.className='b';b.dataset.k=k;b.textContent=label;b.style.cssText=pos+';width:48px;height:48px;background:'+col;
    const on=e=>{e.preventDefault();keys[k]=true;pressed[k]=true;b.classList.add('on');initAudio()};const off=e=>{e.preventDefault();keys[k]=false;b.classList.remove('on')};
    b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);box.appendChild(b);
  }
  // 캔버스 하단 퀵슬롯을 직접 눌러도 사용
  cv.addEventListener('pointerdown',e=>{
    if(G.state!=='play'||G.ui)return;const rc=cv.getBoundingClientRect(),x=(e.clientX-rc.left)*W/rc.width,y=(e.clientY-rc.top)*H/rc.height;
    if(y<H-62||y>H-8||x<480)return;const i=Math.floor((x-480)/48);if(i<0||i>6)return;
    const code=i<5?'Key'+SK_LABEL[i]:(i===5?'Digit1':'Digit2');pressed[code]=true;keys[code]=true;setTimeout(()=>{keys[code]=false},120);
  });
})();
