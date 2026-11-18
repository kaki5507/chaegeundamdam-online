import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        ctx=await b.new_context(viewport={'width':960,'height':540},has_touch=True)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const g=__game;g.newGame('mage');SAVE.lvl=10;SAVE.apFree=12;SAVE.flags.leftHarbor=1;g.goMap('town',true);G.banner.t=9;G.toasts.length=0;for(let i=0;i<5;i++)g.step(1/60)}")
        await pg.screenshot(path='/tmp/ap_chip.png')
        await pg.mouse.click(178,99); await pg.wait_for_timeout(100)
        print('open',await pg.evaluate("G.ui"))
        await pg.mouse.click(717,142+2*58+26); await pg.mouse.click(600,142+2*58+26); await pg.wait_for_timeout(100)
        print('int',await pg.evaluate("[SAVE.ap.int,SAVE.apFree]"))
        await pg.screenshot(path='/tmp/ap_stat.png')
        await pg.mouse.click(300,395); print('auto',await pg.evaluate("[SAVE.apFree]"))
        await pg.mouse.click(300,431); print('closed',await pg.evaluate("G.ui"))
        await pg.evaluate("()=>{const n=S.L.npcs.find(n=>n.id==='jguide');talkNPC(n)}"); await pg.mouse.click(700,264); await pg.wait_for_timeout(600)
        print('dialog tap',await pg.evaluate("[G.ui,G.fade?'fading':S.id]"))
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
