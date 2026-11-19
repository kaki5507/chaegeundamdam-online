import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const g=__game;g.newGame('rogue');SAVE.flags.leftHarbor=1;g.goMap('town',true);G.banner.t=9;G.toasts.length=0;for(let i=0;i<5;i++)g.step(1/60)}")
        await pg.wait_for_timeout(200);await pg.screenshot(path='/tmp/hud_top.png')
        pos=await pg.evaluate("Object.fromEntries(HUDB.map(b=>[b.id,[b.x+b.w/2,b.y+b.h/2]]))")
        out=[]
        for bid in ['rank','att','guide','pq','ev']:
            await pg.evaluate("closeUI()");await pg.wait_for_timeout(300)
            await pg.mouse.click(*pos[bid]);await pg.wait_for_timeout(150)
            out.append((bid,await pg.evaluate("[G.ui,G.dlg&&G.dlg.name]")))
        await pg.evaluate("closeUI()");await pg.wait_for_timeout(300);await pg.mouse.click(50,99);await pg.wait_for_timeout(150)
        out.append(('online',await pg.evaluate("[G.ui,G.dlg&&G.dlg.text]")))
        print(out);print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
