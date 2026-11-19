import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""()=>{const g=__game;newGame('warrior');SAVE.lvl=35;SAVE.tier=2;SAVE.flags.leftHarbor=1;SAVE.ap={str:80,dex:20,int:4,luk:4};SAVE.apFree=3;SAVE.gear=SAVE.gear||{};SAVE.gear.rh='g_hn_sword';SAVE.ginv.g_hn_sword=1;saveGame();
          g.goMap('town',true);const t0=SAVE.inv.jobticket;guideMenu2();const o=G.dlg.opts.find(o=>o.t.includes('직업 변경권'));o.fn();const m=G.dlg.opts.find(o=>o.t.startsWith('마법사'));m.fn();G.dlg.opts[0].fn();
          return [t0,SAVE.job,PARTY[0].job,SAVE.inv.jobticket,SAVE.ap,SAVE.apFree,SAVE.gear.rh,!!SAVE.ginv.g_hn_sword,SAVE.lvl,SAVE.tier,S.id]}"""))
        print(await pg.evaluate("()=>{continueGame();return SAVE.inv.jobticket}"))
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
