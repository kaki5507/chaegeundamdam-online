import asyncio, os, subprocess, time, sys
from playwright.async_api import async_playwright
async def main():
    env=dict(os.environ,PORT='3111',DB_FILE='/tmp/cgdd-e2e.json')
    if os.path.exists('/tmp/cgdd-e2e.json'): os.remove('/tmp/cgdd-e2e.json')
    srv=subprocess.Popen(['node','server/server.js'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1.5)
    try:
        async with async_playwright() as p:
            kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
            if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
            b=await p.chromium.launch(**kw)
            ctx=await b.new_context(viewport={'width':960,'height':540}); pg=await ctx.new_page()
            errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
            await pg.goto('http://127.0.0.1:3111/'); await pg.wait_for_timeout(500)
            await pg.screenshot(path='/tmp/title_auth.png')
            await pg.evaluate("(()=>{G.sel=1;titleStep})()")
            await pg.evaluate("openAuth()"); await pg.wait_for_timeout(200)
            await pg.screenshot(path='/tmp/auth_box.png')
            await pg.fill('#a_n','근육맨'); await pg.fill('#a_p','pw1234'); await pg.click('#a_up'); await pg.wait_for_timeout(1200)
            print('acct',await pg.evaluate("ACCT&&ACCT.name"), 'overlay gone', await pg.evaluate("!document.getElementById('auth')"))
            # play a bit, save to cloud
            await pg.evaluate("(()=>{__game.newGame('rogue');SAVE.lvl=23;SAVE.coins=777;PARTY[0].lvl=23;saveGame();cloudSave(true)})()")
            await pg.wait_for_timeout(800)
            # new browser context = other device
            ctx2=await b.new_context(viewport={'width':960,'height':540}); pg2=await ctx2.new_page()
            await pg2.goto('http://127.0.0.1:3111/'); await pg2.wait_for_timeout(500)
            await pg2.evaluate("openAuth()"); await pg2.fill('#a_n','근육맨'); await pg2.fill('#a_p','pw1234'); await pg2.click('#a_in'); await pg2.wait_for_timeout(1200)
            print('device2 load', await pg2.evaluate("(()=>{const s=loadGame();return s&&[s.job,s.lvl,s.coins]})()"))
            await pg2.evaluate("(()=>{openAuth()})()"); await pg2.wait_for_timeout(100)
            # wrong password
            ctx3=await b.new_context(); pg3=await ctx3.new_page(); await pg3.goto('http://127.0.0.1:3111/'); await pg3.wait_for_timeout(300)
            await pg3.evaluate("openAuth()"); await pg3.fill('#a_n','근육맨'); await pg3.fill('#a_p','nope'); await pg3.click('#a_in'); await pg3.wait_for_timeout(600)
            print('wrong pw msg:', await pg3.inner_text('#a_m'))
            # inventory
            await pg.evaluate("""(()=>{const g=__game;g.continueGame();SAVE.scrolls={atk60:2,hp100:3,white:1};SAVE.inv.vegbit=7;SAVE.ec=9;SAVE.enh={atk:4,hp:2,used:3};PARTY[0].eq={hat:'cs_hat_cat',outfit:'cs_out_rainbow'};recalc(PARTY[0]);G.banner.t=9;openInv(0)})()""")
            await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/inv0.png')
            await pg.evaluate("(()=>{G.inv.tab=1;G.inv.sel=3})()"); await pg.wait_for_timeout(200); await pg.screenshot(path='/tmp/inv1.png')
            r=await pg.evaluate("""(()=>{const s0=SAVE.scrolls.hp100;G.inv.sel=6;__game.press('Enter');__game.step(1/60);return [s0,SAVE.scrolls.hp100,SAVE.enh.used]})()""")
            print('use scroll via inv',r)
            await pg.evaluate("(()=>{G.inv.tab=2;G.inv.sel=1})()"); await pg.wait_for_timeout(200); await pg.screenshot(path='/tmp/inv2.png')
            print(errs or 'NO ERRORS'); await b.close()
    finally: srv.terminate()
asyncio.run(main())
