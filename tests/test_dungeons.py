import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print('dungeon',await pg.evaluate("""()=>{const g=__game;g.newGame('warrior');SAVE.lvl=36;SAVE.flags.leftHarbor=1;g.goMap('town',true);const n=S.L.npcs.find(n=>n.id==='dunkeeper');talkNPC(n);const opts=G.dlg.opts.map(o=>o.t);closeUI();
          g.goMap('dn2_1',true);const p=PARTY[0];p.inv=999;const po=S.L.portals.find(o=>o.clear);p.x=po.x;p.y=po.y;usePortal(po);const locked=S.id;
          for(const m of S.mobs)if(!m.dead)killMob(m);g.step(1/60);usePortal(po);g.step(1/60);
          g.goMap('dn2_3',true);const boss=S.dunBoss;const r=[opts.slice(0,3),locked,boss&&boss.fbName,boss&&boss.max];killMob(boss);g.step(1/60);
          const ch=S.L.npcs.find(n=>n.id==='dchest');talkNPC(ch);r.push(!!ch,G.dlg.text.split('\\n')[0],SAVE.flags['dun_dn2_'+dayNum()]);return r}"""))
        for m,x in [('dn1_1',700),('dn2_1',700),('dn3_2',700),('dn4_3',700),('dn5_1',700),('sec_garden',600),('sec_star',600),('sec_mermaid',600),('sec_moon',700)]:
            await pg.evaluate("(a)=>{const g=__game;closeUI();g.goMap(a[0],true);G.banner.t=9;G.toasts.length=0;PARTY[0].x=a[1];for(let i=0;i<30;i++)g.step(1/60)}",[m,x]); await pg.wait_for_timeout(150)
            await pg.screenshot(path='/tmp/dn_%s.png'%m)
        print('secret',await pg.evaluate("""()=>{const g=__game;closeUI();SAVE.lvl=20;g.goMap('town',true);const n=S.L.npcs.find(n=>n.id==='riddle');talkNPC(n);const t=G.dlg.opts.map(o=>o.t);
          const i=t.findIndex(x=>x.includes('①'));G.dlg.opts[i].fn();G.dlg.opts[0].fn();closeUI();
          const s=S.L.secrets[0],p=PARTY[0];p.x=s.x;p.y=s.y;p.vy=0;g.step(1/60);g.press('ArrowUp');g.step(1/60);G.fade=null;
          const r=[t.slice(0,3),S.id];g.goMap('sec_garden',true);r.push(SAVE.q.rq1.s);
          g.goMap('h2',true);r.push(JSON.stringify(S.L.secrets));g.goMap('harbor',true);r.push(JSON.stringify(S.L.secrets));return r}"""))
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
