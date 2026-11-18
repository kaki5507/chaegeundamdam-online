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
  if(!G.ui&&SAVE.apFree>0&&inR(P,112,84,128,30)){e.preventDefault();openStat()}
});
// 능력치 창 : +5 버튼 표시
{const _ds=drawStat;drawStat=function(g,t){_ds(g,t);STATS.forEach(([k],i)=>{const y=142+i*58;g.fillStyle=SAVE.apFree>=1?'#ffe9a0':'#555';g.beginPath();g.roundRect(576,y+12,48,28,8);g.fill();txt(g,'+5',600,y+32,15,'#2a1a00','center',0)});
  txt(g,'폰: +1 · +5 버튼을 직접 눌러요',480,92,13,'#ffe9a0','center',2)}}
// 남은 AP 알림 칩 (눌러서 능력치 창)
{const _dh=drawHUD;drawHUD=function(g,t){_dh(g,t);if(!PARTY[0]||!SAVE.apFree||G.ui)return;const a=.75+.25*Math.sin(t*5);
  g.save();g.globalAlpha=a;g.beginPath();g.roundRect(116,88,124,22,11);g.fillStyle='#ffcf3a';g.fill();g.restore();txt(g,'💪 AP '+SAVE.apFree+' 찍기 (O)',178,104,12,'#3a2400','center',0)}}
