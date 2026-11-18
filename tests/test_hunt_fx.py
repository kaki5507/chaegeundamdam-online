import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); pg=await b.new_page(viewport={'width':960,'height':540})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print('no pause',await pg.evaluate("""()=>{const g=__game;g.newGame('mage');SAVE.lvl=20;SAVE.flags.leftHarbor=1;g.goMap('h2',true);const m=S.mobs[0];const x0=m.x;
          openDialog('test','hi');for(let i=0;i<120;i++)g.step(1/60);const moved=Math.abs(m.x-x0)>1;const t0=S.t;closeUI();return [moved,S.mobs.length,S.L.portals.map(p=>p.label).join('|')]}"""))
        print('respawn',await pg.evaluate("""()=>{const g=__game;const n=S.mobs.length;for(const m of S.mobs.slice(0,5))killMob(m);g.step(1/60);const a=S.mobs.filter(m=>!m.dead).length;for(let i=0;i<60*2.2;i++)g.step(1/60);return [n,a,S.mobs.filter(m=>!m.dead).length]}"""))
        print('exit',await pg.evaluate("""()=>{const g=__game;g.goMap('boss1',true);const po=S.L.portals.find(p=>p.exit);usePortal(po);const t=G.dlg&&G.dlg.title;G.dlg.opts[0].fn();return [!!po,t]}"""))
        await pg.wait_for_timeout(1000)
        print('after exit',await pg.evaluate("S.id"))
        print('ch exit',await pg.evaluate("""()=>{SAVE.lvl=20;__game.goMap('ch1f',true);const po=S.L.portals.find(p=>p.exit);usePortal(po);return !!po}""")); await pg.wait_for_timeout(1000)
        print('->',await pg.evaluate("S.id"))
        # fx shot
        await pg.evaluate("""(()=>{const g=__game;g.goMap('h3',true);SAVE.lvl=35;SAVE.tier=2;const p=PARTY[0];p.lvl=35;p.tier=2;recalc(p);p.mp=999;G.banner.t=9;G.toasts.length=0;p.x=700;S.cam.x=300;
          for(const m of S.mobs){if(m.type==='egg'){m.x=p.x+60+Math.random()*200}}
          for(let i=0;i<60;i++)g.step(1/60);g.press('KeyB');for(let i=0;i<8;i++)g.step(1/60);g.press('KeyZ');for(let i=0;i<5;i++)g.step(1/60)})()""")
        await pg.screenshot(path='/tmp/fx1.png')
        await pg.evaluate("""(()=>{const g=__game;const p=PARTY[0];p.mp=999;p.cds=[0,0,0,0,0];g.press('KeyX');for(let i=0;i<10;i++)g.step(1/60)})()"""); await pg.screenshot(path='/tmp/fx2.png')
        for i in range(5):
            await pg.evaluate(f"(()=>{{__game.goMap('h{i+1}',true);G.banner.t=9;const p=PARTY[0];p.x=1300;S.cam.x=880;S.cam.y=0;for(let i=0;i<20;i++)__game.step(1/60)}})()"); await pg.wait_for_timeout(150); await pg.screenshot(path=f'/tmp/hunt{i}.png')
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
