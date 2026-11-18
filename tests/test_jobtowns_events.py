import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        ev=pg.evaluate
        print('guide',await ev("""()=>{const g=__game;g.newGame('mage');SAVE.lvl=10;SAVE.flags.leftHarbor=1;g.goMap('town',true);
          const n=S.L.npcs.find(n=>n.id==='jguide');talkNPC(n);const o=G.dlg.opts.map(o=>o.t);G.dlg.opts[0].fn();return [!!n,o.length,o[0]]}"""))
        await pg.wait_for_timeout(900)
        print('mage town',await ev("[S.id,S.L.name,S.L.npcs.map(n=>n.id).join(','),S.L.portals.map(p=>p.to).join(',')]"))
        print('coach',await ev("""()=>{const n=S.L.npcs.find(n=>n.id==='coach');talkNPC(n);const t=G.dlg.opts.map(o=>o.t);const i=t.findIndex(x=>x.includes('1차'));G.dlg.opts[i].fn();
          const o2=G.dlg.opts.map(o=>o.t);G.dlg.opts[0].fn();return [t.join('|'),o2.join('|'),SAVE.q.j1&&SAVE.q.j1.s]}"""))
        print('all maps',await ev("""()=>{const out=[];for(const d of JTOWNS){__game.goMap(d.id,true);out.push(S.L.npcs.length);for(const h of d.hunts){__game.goMap(h.id,true);out.push(S.mobs.length)}}
          for(const t of TEMPLES){__game.goMap(t.id,true);out.push(t.id+':'+S.mobs.length)}return out.join(' ')}"""))
        # 다른 직업 마을 교관
        print('other',await ev("""()=>{__game.goMap('jt_warrior',true);const n=S.L.npcs.find(n=>n.id==='jtm');talkNPC(n);const s=G.dlg.text||G.dlg.msg||'';closeUI();return [!!n,!S.L.npcs.some(n=>n.id==='coach')]}"""))
        # 슈퍼점프 : 1차는 불가, 2차는 가능
        sj=await ev("""()=>{const g=__game;const tryJump=(tier)=>{g.goMap('jt_mage',true);const p=PARTY[0];p.tier=tier;SAVE.tier=tier;p.inv=99;
            const r=S.L.ropes.find(r=>r.y1===300);p.x=r.x;p.y=470;g.hold('ArrowUp',true);for(let i=0;i<400&&p.y>301;i++)g.step(1/60);g.hold('ArrowUp',false);
            p.rope=null;p.x=1620;p.y=299;p.vy=0;for(let i=0;i<30;i++)g.step(1/60);const y0=p.y;
            g.press('Space');g.hold('Space',true);for(let i=0;i<20;i++)g.step(1/60);g.press('Space');for(let i=0;i<60;i++)g.step(1/60);g.hold('Space',false);for(let i=0;i<60;i++)g.step(1/60);
            return [Math.round(y0),Math.round(p.y)]};
          return [tryJump(1),tryJump(2)]}""")
        print('superjump t1/t2',sj)
        print('chest',await ev("""()=>{const n=S.L.npcs.find(n=>n.id==='chest');const c=SAVE.coins;talkNPC(n);closeUI();const c2=SAVE.coins;talkNPC(n);const t=G.dlg?1:0;closeUI();return [c2>c,t]}"""))
        await ev("(()=>{const g=__game;g.goMap('jt_mage',true);G.banner.t=9;G.toasts.length=0;const p=PARTY[0];p.x=1500;for(let i=0;i<30;i++)g.step(1/60)})()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/tmp/j_mage.png')
        for tid,x in [('jt_warrior',1500),('jt_fighter',1500),('jt_gunner',1500),('jh_rogue1',900),('jh_gunner2',900),('tp2',1200)]:
            await ev("(()=>{const g=__game;g.goMap('%s',true);G.banner.t=9;G.toasts.length=0;const p=PARTY[0];p.x=%d;for(let i=0;i<40;i++)g.step(1/60)})()"%(tid,x)); await pg.wait_for_timeout(150)
            await pg.screenshot(path='/tmp/j_%s.png'%tid)
        # 상단 버튼 클릭
        await ev("(()=>{__game.goMap('town',true);G.banner.t=9})()"); await pg.wait_for_timeout(100)
        await pg.mouse.click(960-170,24); await pg.wait_for_timeout(100)
        print('pq button',await ev("[G.ui,G.dlg&&G.dlg.title||G.dlg&&G.dlg.name]"))
        await ev("closeUI()"); await pg.mouse.click(960-60,24); await pg.wait_for_timeout(100)
        print('ev button',await ev("[G.ui,(G.dlg.opts||[]).map(o=>o.t).join('|')]"))
        await pg.screenshot(path='/tmp/j_evmenu.png')
        # 필드보스
        print('fieldboss',await ev("""()=>{const g=__game;SAVE.lvl=40;g.goMap('jh_mage2',true);S.fbT=0.01;g.step(1/60);g.step(1/60);const m=S.fb;if(!m)return 'none';const hp=m.max;
          const ec=SAVE.ec||0;killMob(m);return [m.fbName,hp,m.w,S.fb,(SAVE.ec||0)-ec]}"""))
        await ev("(()=>{const g=__game;g.goMap('jh_mage2',true);S.fbT=0.01;g.step(1/60);G.banner.t=9;const p=PARTY[0];p.x=S.fb.x-200;for(let i=0;i<30;i++)g.step(1/60)})()"); await pg.wait_for_timeout(150)
        await pg.screenshot(path='/tmp/j_fieldboss.png')
        # 레이드 (서버 없음 → 연습)
        print('raid',await ev("""()=>{const g=__game;closeUI();eventMenu();const i=G.dlg.opts.findIndex(o=>o.t.includes('레이드'));G.dlg.opts[i].fn();return 1}"""))
        await pg.wait_for_timeout(900)
        print('raid map',await ev("""()=>{G.fade=null;if(S.id!=='ev_raid')__game.goMap('ev_raid',true);const b=S.boss;if(!b)return [S.id,EVLOCAL,G.fade];const r=[S.id,b&&b.name,b&&b.max];b.hp=1;b.invuln=false;hitBoss(b,10,false,PARTY[0]);r.push(b.dying,b.hp,G.state,G.ui,b.dieT);for(let i=0;i<600&&!b.dead;i++)__game.step(1/60);
          return r.concat([b.dead,Object.keys(SAVE.ginv).filter(k=>k.startsWith('g_rd')).join(','),G.dlg&&G.dlg.title])}"""))
        # 쟁탈전 : 서버 메시지 흉내 → 메달
        print('arena',await ev("""()=>{closeUI();EVLOCAL={arena:1};__game.goMap('ev_arena',true);const m0=SAVE.medal||0;MYWID='u7';
          evMsg(JSON.stringify({t:'ev',raid:{open:0},arena:{open:1,round:2,hold:12.3,tkey:'p:AA',tname:'AA 팀',contested:false,brk:0}}));
          PEERS['u9']={tg:{id:'u9',map:'ev_arena',x:PARTY[0].x+30,y:470,f:1,s:'idle',j:'rogue',ti:1,fi:2,lv:50,eq:{},h:80,pt:'ZZ',name:'상대'},x:PARTY[0].x+30,y:470,t:0};
          for(let i=0;i<3;i++)__game.step(1/60);const ghost=S.mobs.filter(m=>m.type==='peer').length;
          PARTY[0].inv=0;const hp=PARTY[0].hp;evMsg(JSON.stringify({t:'hurt',d:30,dir:1,fname:'상대'}));const hit=PARTY[0].hp<hp;
          evMsg(JSON.stringify({t:'arenaWin',tname:'AA 팀',wids:['u7','u8'],names:['나','친구']}));return [S.id,ghost,hit,(SAVE.medal||0)-m0]}"""))
        await ev("(()=>{G.banner.t=2;const p=PARTY[0];p.x=1500;for(let i=0;i<20;i++)__game.step(1/60)})()"); await pg.wait_for_timeout(150)
        await pg.screenshot(path='/tmp/j_arena.png')
        print('medal shop',await ev("""()=>{SAVE.medal=10;medalShop({name:'교환'});G.dlg.opts[0].fn();return [SAVE.medal,!!SAVE.ginv.g_hn_staff]}"""))
        print('taxi',await ev("""()=>{closeUI();__game.goMap('town',true);SAVE.lvl=85;const t=taxiDests().map(d=>d.id);return [t.includes('jt_mage'),t.includes('jh_gunner2'),t.includes('tp1')]}"""))
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
