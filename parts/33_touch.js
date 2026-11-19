/* ============================================================
   TOUCH : 폰에서 화면을 직접 눌러 — 대화 선택지 · 능력치(+1/+5/자동) · AP 알림 칩
   ============================================================ */
function cvPos(e){const rc=cv.getBoundingClientRect();return{x:(e.clientX-rc.left)*W/rc.width,y:(e.clientY-rc.top)*H/rc.height}}
const inR=(p,x,y,w,h)=>p.x>=x&&p.x<=x+w&&p.y>=y&&p.y<=y+h;
function apAdd(k,n){const p=PARTY[0];let c=0;while(c<n&&SAVE.apFree>0){SAVE.ap[k]++;SAVE.apFree--;c++}
  if(!c){G.toast('남은 AP가 없습니다 (레벨업마다 +5)');return}sfx('pickup');const r=p.hp/p.maxhp;recalc(p);p.hp=Math.round(p.maxhp*r);saveGame()}
{const _od=openDialog;openDialog=function(a,b,c){_od(a,b,c);G.dlgAt=performance.now()}}
{const _os=openStat;openStat=function(){_os();G.dlgAt=performance.now()}}
cv.addEventListener('pointerdown',e=>{
  if(G.state!=='play'||!S||performance.now()-(G.dlgAt||0)<250)return;const P=cvPos(e);
  if(G.ui==='dialog'&&G.dlg){const d=G.dlg,max=7,st=Math.max(0,Math.min(d.sel-3,d.opts.length-max));
    for(let i=0;i<Math.min(max,d.opts.length-st);i++)if(inR(P,640,248+i*36,262,32)){e.preventDefault();d.sel=st+i;const o=d.opts[st+i];sfx('sel');o.fn&&o.fn();return}
    if(P.y<200){e.preventDefault();closeUI()}return}
  if(G.ui==='stat'){
    STATS.forEach(([k],i)=>{const y=142+i*58;if(inR(P,686,y+8,62,36)){e.preventDefault();G.stat.sel=i;apAdd(k,1)}else if(inR(P,572,y+8,56,36)){e.preventDefault();G.stat.sel=i;apAdd(k,5)}else if(inR(P,196,y,370,50))G.stat.sel=i});
    if(inR(P,196,380,260,30)){e.preventDefault();G.stat.sel=4;if(SAVE.apFree>0){autoAP();sfx('lvl');const p=PARTY[0],r=p.hp/p.maxhp;recalc(p);p.hp=Math.round(p.maxhp*r);saveGame()}}
    else if(inR(P,196,416,260,30)||!inR(P,170,50,620,440)){e.preventDefault();closeUI()}
    return}
  if(!G.ui&&SAVE.apFree>0&&inR(P,112,badgeY()-4,128,30)){e.preventDefault();openStat()}
});
// 능력치 창 : +5 버튼 표시
{const _ds=drawStat;drawStat=function(g,t){_ds(g,t);STATS.forEach(([k],i)=>{const y=142+i*58;g.fillStyle=SAVE.apFree>=1?'#ffe9a0':'#555';g.beginPath();g.roundRect(576,y+12,48,28,8);g.fill();txt(g,'+5',600,y+32,15,'#2a1a00','center',0)});
  txt(g,'폰: +1 · +5 버튼을 직접 눌러요',480,92,13,'#ffe9a0','center',2)}}
// 남은 AP 알림 칩 (눌러서 능력치 창)
{const _dh=drawHUD;drawHUD=function(g,t){_dh(g,t);if(!PARTY[0]||!SAVE.apFree||G.ui)return;const a=.75+.25*Math.sin(t*5);
  const by=badgeY();g.save();g.globalAlpha=a;g.beginPath();g.roundRect(116,by,124,22,11);g.fillStyle='#ffcf3a';g.fill();g.restore();txt(g,'💪 AP '+SAVE.apFree+' 찍기 (O)',178,by+16,12,'#3a2400','center',0)}}

/* ---------- 직업 선택 : 터치하면 그 직업 선택, [이 직업으로 시작] 버튼으로 시작 ---------- */
// (전에는 화면 어디를 눌러도 Enter 로 처리돼 항상 첫 번째 직업(전사)으로 시작됐다)
const JSTART={x:W-230,y:458,w:190,h:62};
cv.addEventListener('pointerdown',e=>{
  if(G.state!=='select')return;const P=cvPos(e);delete pressed.Enter;
  if(inR(P,JSTART.x,JSTART.y,JSTART.w,JSTART.h)){pressed.Enter=true;return}
  for(let i=0;i<8;i++){const x=36+(i%4)*224,y=70+(i/4|0)*190;if(inR(P,x,y,208,178)){if(G.jsel!==i){G.jsel=i;sfx('sel')}return}}
  if(inR(P,W-260,6,250,26)){G.fsel=((G.fsel|0)+1)%FACES.length;sfx('sel')}
});
{const _dsel=drawSelect;drawSelect=function(g,t){_dsel(g,t);const b=JSTART,j=JOBS[G.jsel],a=.8+.2*Math.sin(t*4);
  g.save();g.shadowColor='rgba(255,210,90,.8)';g.shadowBlur=14*a;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,14);const gr=g.createLinearGradient(0,b.y,0,b.y+b.h);gr.addColorStop(0,'#ffe58a');gr.addColorStop(1,'#ffb84a');g.fillStyle=gr;g.fill();g.restore();
  g.strokeStyle='#8a5a10';g.lineWidth=2;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,14);g.stroke();
  txt(g,'▶ '+j.role+'(으)로 시작',b.x+b.w/2,b.y+30,18,'#4a2a00','center',0);txt(g,'(Enter)',b.x+b.w/2,b.y+50,11,'#7a4a10','center',0)}}
// 게임 밖 화면(오프닝·직업 선택)에선 터치 버튼을 숨겨 화면을 바로 누를 수 있게
{let _tv=null;const _r=render;render=function(){_r();const tc=document.getElementById('touch');if(!tc)return;const v=G.state==='play'||G.state==='over';if(v!==_tv){_tv=v;tc.style.visibility=v?'':'hidden'}}}
