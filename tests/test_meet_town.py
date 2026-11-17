import asyncio, os, subprocess, time
from playwright.async_api import async_playwright
async def main():
    env=dict(os.environ,PORT='3555',DB_FILE='/tmp/cgdd-meet.json')
    if os.path.exists('/tmp/cgdd-meet.json'): os.remove('/tmp/cgdd-meet.json')
    srv=subprocess.Popen(['node','server/server.js'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1.5)
    try:
      async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pages=[]
        for n,job,x,fid in [('당근소녀','archer',1150,1),('브로콜리군','warrior',1250,13),('마늘이','priest',1060,7)]:
          c=await b.new_context(viewport={'width':960,'height':540});pg=await c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
          await pg.goto('http://127.0.0.1:3555/');await pg.wait_for_timeout(500)
          await pg.evaluate(f"(async()=>{{const o=await api('POST','/api/register',{{name:'{n}',password:'pw1234'}});setAcct({{name:o.name,token:o.token}});refreshMe();}})()");await pg.wait_for_timeout(300)
          await pg.evaluate(f"(()=>{{G.fsel={fid};__game.newGame('{job}');SAVE.lvl=12;SAVE.flags.leftHarbor=1;__game.goMap('town',true);G.banner.t=9;G.toasts.length=0;RANKBAN=null;const pl=PARTY[0];pl.x={x};}})()")
          pages.append(pg)
        await asyncio.sleep(1.5)
        a=pages[0]
        print('peers',await a.evaluate("Object.values(PEERS).map(q=>q.tg.name+'@'+q.tg.map).join()"), await a.evaluate("ONLINE_N"))
        await pages[1].evaluate("(async()=>{await api('POST','/api/chat',{text:'안녕! 같이 사냥 갈래?',kind:'map',map:'town'})})()")
        await asyncio.sleep(3)
        await a.evaluate("(()=>{S.cam.x=760;for(let i=0;i<10;i++)__game.step(1/60)})()");await a.wait_for_timeout(300)
        await a.screenshot(path='/tmp/m_meet.png')
        # move peer; check interpolation
        await pages[1].evaluate("(()=>{__game.hold('ArrowRight',true);})()");await asyncio.sleep(1.2);await pages[1].evaluate("__game.hold('ArrowRight',false)")
        print('peer moved',await a.evaluate("Object.values(PEERS).map(q=>Math.round(q.tg.x)).join()"))
        # town overview shots
        await a.evaluate("(()=>{const p=PARTY[0];p.x=1150;S.cam.x=700;S.cam.y=0;})()");await a.wait_for_timeout(300);await a.screenshot(path='/tmp/m_tree.png')
        await a.evaluate("(()=>{const p=PARTY[0];p.x=2265;p.y=120;p.vy=0;S.cam.x=1800;S.cam.y=0;for(let i=0;i<5;i++)__game.step(1/60)})()");await a.wait_for_timeout(300);await a.screenshot(path='/tmp/m_balloon.png')
        print('balloon talk',await a.evaluate("(()=>{qAccept('tw1');const n=S.L.npcs.find(x=>x.id==='balloon');const p=PARTY[0];p.x=n.x;p.y=n.gy;const near=nearInteract();talkNPC(n);closeUI();const r=S.L.npcs.find(x=>x.id==='roofcat');talkNPC(r);closeUI();return [near&&near.n&&near.n.id,qst('tw1').s]})()"))
        await a.evaluate("(()=>{__game.goMap('harbor',true);G.banner.t=9;const p=PARTY[0];p.x=S.L.boatX;p.y=300;S.cam.x=S.L.boatX-500;for(let i=0;i<20;i++)__game.step(1/60)})()");await a.wait_for_timeout(300);await a.screenshot(path='/tmp/m_harbor.png')
        print(errs or 'NO ERRORS'); await b.close()
    finally: srv.terminate()
asyncio.run(main())
