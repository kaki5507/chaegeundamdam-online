import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        for touch in [False,True]:
            ctx=await b.new_context(viewport={'width':960,'height':540},has_touch=touch)
            pg=await ctx.new_page(); pg.on('pageerror',lambda e: errs.append(str(e)))
            await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
            out=[]
            for i,job in enumerate(['warrior','archer','guardian','mage','fighter','rogue','gunner','priest']):
                await pg.evaluate("()=>{localStorage.clear();G.state='select';G.jsel=0;S=null;SAVE=null}")
                x=36+(i%4)*224+104;y=70+(i//4)*190+90
                if touch: await pg.touchscreen.tap(x,y)
                else: await pg.mouse.click(x,y)
                await pg.wait_for_timeout(80)
                st=await pg.evaluate("G.state")
                if touch: await pg.touchscreen.tap(960-135,489)
                else: await pg.mouse.click(960-135,489)
                await pg.wait_for_timeout(150)
                out.append((st,await pg.evaluate("SAVE&&SAVE.job")))
            # 키보드
            await pg.evaluate("()=>{G.state='select';G.jsel=0;SAVE=null}");await pg.keyboard.press('ArrowRight');await pg.keyboard.press('ArrowRight');await pg.wait_for_timeout(60);await pg.keyboard.press('Enter');await pg.wait_for_timeout(150)
            out.append(('key',await pg.evaluate("SAVE&&SAVE.job")))
            print('touch' if touch else 'mouse',out); await ctx.close()
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
