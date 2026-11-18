/* ============================================================
   TWEAKS : 대화창 — 열리면 아무것도 선택 안 된 상태, OK 한 번 더 누르면 닫힘
            (↑↓ 로 고른 뒤 OK 하면 그 항목 실행)
   ============================================================ */
const _openDialogT=openDialog;
openDialog=function(name,text,opts){_openDialogT(name,text,opts);if(G.dlg)G.dlg.sel=-1};
dialogUpdate=function(){
  const d=G.dlg;if(!d)return;const nv=nav(),n=d.opts.length;
  if(nv.u){d.sel=d.sel<0?n-1:(d.sel+n-1)%n;sfx('sel')}
  if(nv.d){d.sel=d.sel<0?0:(d.sel+1)%n;sfx('sel')}
  if(nv.back){closeUI();return}
  if(nv.ok){if(d.sel<0||d.sel>=n){sfx('sel');closeUI();return}const o=d.opts[d.sel];sfx('sel');o.fn&&o.fn()}
};
const _drawDialogT=drawDialog;
drawDialog=function(g,t){_drawDialogT(g,t);const d=G.dlg;if(!d)return;
  const s=d.sel<0?'OK 한 번 더 → 닫기   ·   ↑↓ 로 고르기':'OK → 선택   ·   ESC 닫기';
  txt(g,s,66,506,12,d.sel<0?'#ffe9a0':'#cfd4e2','left',2)};

/* ---------- 채팅 입력창 : 작고 깔끔하게 · OK(Enter/터치 OK) = 보내고 닫기 ---------- */
G.chatCD=0;
openChat=function(mode){
  if(document.getElementById('chatbar')||G.t<G.chatCD)return;
  for(const k in keys)keys[k]=false;
  const rc=cv.getBoundingClientRect(),touch=matchMedia('(pointer:coarse)').matches,small=rc.width<700;
  const d=document.createElement('div');d.id='chatbar';if(small)d.className='sm';
  const bh=small?34:40,w=Math.min(560,rc.width-12);
  // 모바일 세로: 게임 화면 바로 아래 / 그 외: 게임 화면 안쪽 아래
  const top=(touch&&innerHeight-rc.bottom>bh+16)?rc.bottom+6:rc.top+(H-98)*rc.height/H;
  d.style.cssText=`position:fixed;left:${rc.left+6}px;top:${top}px;width:${w}px;height:${bh}px;display:flex;gap:5px;z-index:40`;
  const lab=small?['일반','확성기 '+SAVE.mega.m,'고확성기 '+SAVE.mega.h]:['일반 (이 맵)','확성기 ('+SAVE.mega.m+')','고확성기 ('+SAVE.mega.h+')'];
  d.innerHTML=`<select id="cb_m"><option value="map">${lab[0]}</option><option value="mega">${lab[1]}</option><option value="hmega">${lab[2]}</option></select><input id="cb_t" maxlength="80" enterkeyhint="send" autocomplete="off" placeholder="${ONLINE?(ACCT?(small?'메시지 · OK 보내기':'메시지 입력 · Enter 보내기 · Esc 닫기'):'로그인해야 채팅할 수 있어요'):'오프라인 (서버 없음)'}"><button id="cb_s">전송</button><button id="cb_x" class="x">✕</button>`;
  document.body.appendChild(d);G.chatOpen=true;
  const sel=d.querySelector('#cb_m'),inp=d.querySelector('#cb_t');if(mode)sel.value=mode;
  let done=false;
  const close=()=>{if(done)return;done=true;inp.blur();d.remove();document.removeEventListener('pointerdown',padH,true);G.chatOpen=false;G.chatCD=G.t+.45;pressed={};for(const k in keys)keys[k]=false};
  const send=()=>{if(done)return;const v=inp.value.trim();close();if(v)sendChat(v,sel.value)};
  // 한글 입력 중(조합 중) Enter 는 무시하고, 조합이 끝난 Enter 에서 보냄
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){if(e.isComposing||e.keyCode===229)return;e.preventDefault();send()}else if(e.key==='Escape'){e.preventDefault();close()}});
  // 화면의 OK / 취소 버튼으로도 보내기 · 닫기
  const padH=e=>{const b=e.target.closest&&e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k;
    if(k==='Enter'){e.preventDefault();e.stopPropagation();send()}else if(k==='Escape'){e.preventDefault();e.stopPropagation();close()}};
  document.addEventListener('pointerdown',padH,true);
  d.querySelector('#cb_s').onclick=send;d.querySelector('#cb_x').onclick=close;
  setTimeout(()=>inp.focus(),30);
};
