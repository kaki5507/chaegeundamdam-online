import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const g=__game;g.newGame('archer');SAVE.lvl=33;SAVE.tier=1;SAVE.flags.leftHarbor=1;g.goMap('town',true);G.banner.t=9;G.toasts.length=0;for(let i=0;i<10;i++)g.step(1/60)}")
        await pg.mouse.click(960-265,24); await pg.wait_for_timeout(200)
        print(await pg.evaluate("[G.dlg&&G.dlg.name,(G.dlg.opts||[]).map(o=>o.t)]"))
        await pg.screenshot(path='/tmp/guide.png')
        print(await pg.evaluate("()=>{const c=SAVE.coins=5000;G.dlg.opts[0].fn();return [S.id||'fading',SAVE.coins]}"))
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
