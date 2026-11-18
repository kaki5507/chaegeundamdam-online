import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print('boss',await pg.evaluate("""()=>{const g=__game;g.newGame('warrior');SAVE.lvl=20;g.goMap('boss1',true);const bo=S.boss;const ap=SAVE.apFree||0;bossFinish(bo);
          return [bo.id,SAVE.inv.dhorn,(SAVE.apFree||0)-ap,G.clear.lines]}"""))
        await pg.wait_for_timeout(100); await pg.screenshot(path='/tmp/bl_clear.png')
        print('second',await pg.evaluate("""()=>{const g=__game;G.state='play';g.goMap('boss1',true);const ap=SAVE.apFree;bossFinish(S.boss);return [SAVE.inv.dhorn,SAVE.apFree-ap]}"""))
        print('doc',await pg.evaluate("""()=>{const g=__game;G.state='play';G.clear=null;g.goMap('town',true);const n=S.L.npcs.find(n=>n.id==='bossdoc');talkNPC(n);G.dlg.opts[0].fn();const t=G.dlg.opts[0].t;const e0=SAVE.exp,c0=SAVE.coins;G.dlg.opts[0].fn();
          const r=[t,SAVE.inv.dhorn,SAVE.coins-c0];closeUI();SAVE.inv.dhorn=5;SAVE.inv.vegbit=20;talkNPC(n);G.dlg.opts[1].fn();G.dlg.opts[0].fn();r.push(!!SAVE.ginv.g_bl_horn,SAVE.inv.dhorn,SAVE.inv.vegbit);return r}"""))
        print('fieldboss fang',await pg.evaluate("""()=>{const g=__game;closeUI();g.goMap('h3',true);S.fbT=.01;g.step(1/60);g.step(1/60);const m=S.fb;const f=SAVE.inv.fang||0;killMob(m);return (SAVE.inv.fang||0)-f}"""))
        await pg.evaluate("(()=>{const g=__game;g.goMap('town',true);G.banner.t=9;G.toasts.length=0;PARTY[0].x=3460;for(let i=0;i<20;i++)g.step(1/60)})()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/tmp/bl_town.png')
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
