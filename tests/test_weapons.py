import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""()=>{const g=__game;g.newGame('mage');SAVE.lvl=30;SAVE.tier=1;SAVE.q.j1={s:'done',p:[]};g.goMap('jt_mage',true);
          const n=S.L.npcs.find(n=>n.id==='coach');talkNPC(n);const opts=G.dlg.opts.map(o=>o.t);const i=opts.findIndex(t=>t.includes('각성'));G.dlg.opts[i].fn();G.dlg.opts[0].fn();
          const st=SAVE.q.wq30_mage.s;S.id='jh_mage1';for(let k=0;k<60;k++)qev('kill',{mob:'book'});S.id='jt_mage';qev('boss',{id:'dokkaebi'});SAVE.inv.dhorn=3;qev('collect',{item:'dhorn'});SAVE.q.wq30_mage.p[2]=3;qcheck('wq30_mage');
          const st2=SAVE.q.wq30_mage.s;qTurnIn('wq30_mage');return [opts.filter(t=>t.includes('⚔')||t.includes('🔒')),st,st2,!!SAVE.ginv.g_aw_mage,GEAR.g_aw_mage,GEAR.g_lg_mage.atk]}"""))
        print(await pg.evaluate("()=>{closeUI();SAVE.gear.rh='g_aw_mage';const r=1;PARTY[0].x=900;G.banner.t=9;G.toasts.length=0;for(let i=0;i<20;i++)__game.step(1/60);return [r,sigOf()]}"))
        await pg.wait_for_timeout(200);await pg.screenshot(path='/tmp/wpn.png')
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
