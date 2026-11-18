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
