import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print('taxi',await pg.evaluate("""()=>{const g=__game;g.newGame('archer');SAVE.lvl=22;SAVE.coins=5000;SAVE.flags.leftHarbor=1;g.goMap('town',true);
          const t=S.L.npcs.find(n=>n.id==='taxi');talkNPC(t);const o=G.dlg.opts.map(o=>o.t);const i=o.findIndex(x=>x.includes('무지개 폭포'));G.dlg.opts[i].fn();return [!!t,o.length,i,SAVE.coins]}"""))
        await pg.wait_for_timeout(1200)
        print('arrived',await pg.evaluate("[S.id,S.L.npcs.some(n=>n.id==='taxi'),S.L.portals.map(p=>p.label).join('|')]"))
        # potion via key 1
        print('potion',await pg.evaluate("""()=>{const p=PARTY[0];p.hp=10;const n=SAVE.potions.hp;__game.press('Digit1');__game.step(1/60);return [n,SAVE.potions.hp,p.hp>10]}"""))
        # climb to balloon via rope+clouds (bot)
        print('reach balloon',await pg.evaluate("""()=>{const g=__game;g.goMap('town',true);const p=PARTY[0];const r=S.L.ropes[S.L.ropes.length-1];p.x=r.x;p.y=470;p.inv=99;
          g.hold('ArrowUp',true);for(let i=0;i<300&&p.y>300;i++)g.step(1/60);g.hold('ArrowUp',false);const atTop=p.y;
          return [r.x,r.y1,Math.round(atTop)]}"""))
        await pg.evaluate("(()=>{const p=PARTY[0];S.cam.x=p.x-480;for(let i=0;i<5;i++)__game.step(1/60)})()");
        await pg.evaluate("(()=>{const g=__game;g.goMap('town',true);G.banner.t=9;G.toasts.length=0;const p=PARTY[0];p.x=1150;S.cam.x=720;for(let i=0;i<10;i++)g.step(1/60)})()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/tmp/a_town.png')
        # mobile
        ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2)
        m=await ctx.new_page(); m.on('pageerror',lambda e: errs.append(str(e)))
        await m.goto('file://'+os.path.abspath('index.html')); await m.wait_for_timeout(400)
        await m.evaluate("(()=>{__game.newGame('warrior');SAVE.flags.leftHarbor=1;__game.goMap('h1',true);G.banner.t=9;PARTY[0].hp=20})()"); await m.wait_for_timeout(300)
        n0=await m.evaluate("SAVE.potions.hp")
        await m.tap('[data-k=Digit1]'); await m.wait_for_timeout(200)
        print('mobile potion',n0,await m.evaluate("SAVE.potions.hp"))
        await m.screenshot(path='/tmp/a_mobile.png')
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
