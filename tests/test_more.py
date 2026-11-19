import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""()=>{const g=__game;g.newGame('archer');SAVE.lvl=70;SAVE.flags.leftHarbor=1;g.goMap('town',true);const n=S.L.npcs.find(n=>n.id==='taxi');taxiMenu(n);const top=G.dlg.opts.map(o=>o.t);
          G.dlg.opts[3].fn();const inner=G.dlg.opts.map(o=>o.t).slice(0,4);closeUI();
          const r=[];for(let i=0;i<3;i++)r.push(giveEvCos('테스트'));return [top,inner,r,CASH_ITEMS.length]}"""))
        for m in ['nh1','nh2','nh3','nh4','nh5','nh6']:
            await pg.evaluate("(m)=>{const g=__game;closeUI();g.goMap(m,true);G.banner.t=9;G.toasts.length=0;PARTY[0].x=900;for(let i=0;i<30;i++)g.step(1/60)}",m);await pg.wait_for_timeout(120);await pg.screenshot(path='/tmp/more_%s.png'%m)
        await pg.evaluate("()=>{const g=__game;g.goMap('town',true);G.banner.t=9;const p=PARTY[0];p.x=1500;p.eq={hat:'ev_hat_witch',face:'ev_face_mono',outfit:'ev_out_knight',cape:'ev_cape_dragon',aura:'ev_aura_note'};addMember('ai','mage');const q=PARTY[1];q.x=1540;q.eq={hat:'ev_hat_bunny',face:'ev_face_blush',outfit:'ev_out_sailor',cape:'ev_cape_butterfly',aura:'ev_aura_snow'};for(let i=0;i<30;i++)g.step(1/60)}")
        await pg.wait_for_timeout(150);await pg.screenshot(path='/tmp/more_cos.png')
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
