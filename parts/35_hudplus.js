/* ============================================================
   HUDPLUS : 상단에 🏆 랭킹 · 📅 출석 버튼 · 접속자 배지를 누르면 누가 어디 있는지
   ============================================================ */
HUDB.push({id:'rank',x:0,y:8,w:82,h:32,l:'🏆 랭킹',k:'6'},{id:'att',x:0,y:8,w:82,h:32,l:'📅 출석',k:''});
{const order=['ev','pq','guide','rank','att','adm'];let x=W-10;for(const id of order){const b=HUDB.find(b=>b.id===id);if(!b)continue;x-=b.w;b.x=x;x-=6}}
const attDone=()=>SAVE&&SAVE.att&&SAVE.att.last===dayNum();
{const _dhb=drawHudButtons;drawHudButtons=function(g,t){const a=HUDB.find(b=>b.id==='att');if(a)a.l=attDone()?'📅 출석✓':'📅 출석!';_dhb(g,t);
  if(a&&!attDone()){g.save();g.globalAlpha=.7+.3*Math.sin(t*5);circ(g,a.x+a.w-6,a.y+6,5,'#ff4a6a');g.restore()}}}
function openAttFromHud(){attMenu({id:'att',name:'출석부 요정 콩콩'})}
// 상단 버튼 처리 (기존 처리기는 rank/att 를 eventMenu 로 보내지 않게)
{const _em=eventMenu;eventMenu=function(){const b=G._lastHudBtn;G._lastHudBtn=null;if(b==='rank')return openFame();if(b==='att')return openAttFromHud();return _em()}}
cv.addEventListener('pointerdown',e=>{
  if(G.state!=='play'||G.ui||!S)return;const P=cvPos(e);
  for(const b of HUDB)if((b.id==='rank'||b.id==='att')&&P.x>=b.x-6&&P.x<=b.x+b.w+6&&P.y>=b.y-8&&P.y<=b.y+b.h+12)G._lastHudBtn=b.id;
  if(inR(P,10,84,104,30))openOnline();
},true);
{const _rs=respawnStep;respawnStep=function(dt){_rs(dt);if(G.state==='play'&&!G.ui&&!G.chatOpen&&pressed.Digit6)openFame()}}

/* ---------- 접속자 목록 ---------- */
const MAPNAME={};
function mapName(id){if(!id)return'?';if(MAPNAME[id])return MAPNAME[id];try{MAPNAME[id]=MAPS[id]?(MAPS[id]().name||id).replace('??? ','???'):id}catch(e){MAPNAME[id]=id}return MAPNAME[id]}
async function openOnline(){
  sfx('sel');
  if(!(typeof wsOK==='function'&&wsOK())){openDialog('🟢 접속자','서버에 연결되어 있지 않아요 (오프라인).',[{t:'닫기',fn:closeUI}]);return}
  openDialog('🟢 접속자','불러오는 중…',[{t:'닫기',fn:closeUI}]);
  try{const o=await api('GET','/api/online');if(G.ui!=='dialog')return;
    const lines=o.list.map((r,i)=>(i+1)+'. '+r.name+'  Lv.'+r.lv+' '+(JOB[r.job]?JOB[r.job].role:'')+'  —  📍 '+(r.map&&r.map.startsWith('sec_')?'??? (비밀 장소)':mapName(r.map)));
    const per=9,pages=Math.max(1,Math.ceil(lines.length/per));
    const show=pg=>openDialog('🟢 지금 접속 중 '+o.n+'명'+(pages>1?'  ('+(pg+1)+'/'+pages+')':''),lines.slice(pg*per,pg*per+per).join('\n')||'아무도 없어요',
      (pages>1?[{t:'다음 쪽 ▶',fn:()=>show((pg+1)%pages)}]:[]).concat([{t:'새로고침',fn:openOnline},{t:'닫기',fn:closeUI}]));
    show(0);
  }catch(e){openDialog('🟢 접속자','목록을 불러오지 못했어요: '+e.message,[{t:'닫기',fn:closeUI}])}
}
// 배지에 '눌러서 보기' 힌트
{const _do=drawOnline;drawOnline=function(g,t){_do(g,t);if(typeof wsOK==='function'&&wsOK())txt(g,'▾',104,104,10,'#cfd4e2','center',0)}}
