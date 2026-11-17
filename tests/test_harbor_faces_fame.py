import asyncio, os, subprocess, time
from playwright.async_api import async_playwright
async def main():
    env=dict(os.environ,PORT='3333',DB_FILE='/tmp/cgdd-hf.json',ADMIN_NAMES='운영자')
    if os.path.exists('/tmp/cgdd-hf.json'): os.remove('/tmp/cgdd-hf.json')
    srv=subprocess.Popen(['node','server/server.js'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1.5)
    try:
      async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); pg=await b.new_page(viewport={'width':960,'height':540})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('http://127.0.0.1:3333/'); await pg.wait_for_timeout(500)
        await pg.evaluate("openAuth()"); await pg.fill('#a_n','운영자'); await pg.fill('#a_p','pw1234'); await pg.click('#a_up'); await pg.wait_for_timeout(1000)
        print('start',await pg.evaluate("""()=>{G.fsel=7;__game.newGame('rogue');return [S.id,SAVE.fid,PARTY[0].fid,S.L.npcs.map(n=>n.id).join()]}"""))
        await pg.wait_for_timeout(2500)
        print('tut',await pg.evaluate("""()=>{const n=S.L.npcs.find(x=>x.id==='captain');talkNPC(n);const o=G.dlg.opts.map(o=>o.t).join('|');closeUI();return o}"""))
        print('boat locked',await pg.evaluate("""()=>{const po=S.L.portals[0];usePortal(po);return [S.id,G.toasts.slice(-1)[0].m]}"""))
        print('shell',await pg.evaluate("""()=>{qst('tut1').s='done';qAccept('h1');qAccept('h2');for(let i=0;i<30;i++){const m=spawnMob('egg',1400,470,{});killMob(m)}for(const it of S.items.slice())pickup(it,PARTY[0]);return [qst('h1').s,qst('h2').s,SAVE.inv.shell,SAVE.lvl]}"""))
        print('lv5',await pg.evaluate("""()=>{qTurnIn('h1');__game.gainExp(500);qAccept('h4');return [SAVE.lvl,qst('h4').s]}"""))
        print('boat',await pg.evaluate("""()=>{qTurnIn('h4');usePortal(S.L.portals[0]);return SAVE.flags.leftHarbor}"""))
        await pg.wait_for_timeout(900)
        print('town',await pg.evaluate("[S.id, S.L.npcs.some(n=>n.id==='fame'), qAvail('main1')]"))
        await pg.evaluate("(async()=>{SAVE.lvl=33;saveGame();await api('PUT','/api/save',{save:SAVE});await sayHello()})()"); await pg.wait_for_timeout(3500)
        print('rankban',await pg.evaluate("[!!RANKBAN, CHAT.filter(m=>m.kind==='rank').length]"))
        await pg.evaluate("(()=>{G.banner.t=9;const p=PARTY[0];p.x=240;S.cam.x=0})()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path='/tmp/h_rank.png')
        await pg.evaluate("openFame()"); await pg.wait_for_timeout(800); await pg.screenshot(path='/tmp/h_fame.png')
        print('fame',await pg.evaluate("[G.fame.list.length,G.fame.me&&G.fame.me.rank]"))
        await pg.evaluate("closeUI()")
        # faces grid
        await pg.evaluate("""(()=>{const g=__game;g.goMap('harbor',true);G.banner.t=9;G.toasts.length=0;RANKBAN=null;PARTY.length=1;
          for(let i=0;i<19;i++){g.addMember('ai',JOBS[i%8].id);const q=PARTY[PARTY.length-1];q.fid=i+1;q.kind='npcview';q.x=150+ (i%10)*70;q.y=i<10?330:470;q.vx=0;q.hold=true}
          G.toasts.length=0;const p=PARTY[0];p.x=80;S.cam.x=0;})()""")
        await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/h_faces.png')
        # zoom block
        print('zoom', await pg.evaluate("(()=>{const e=new MouseEvent('dblclick',{cancelable:true,bubbles:true});document.body.dispatchEvent(e);const w=new WheelEvent('wheel',{ctrlKey:true,cancelable:true,bubbles:true});window.dispatchEvent(w);return [e.defaultPrevented,w.defaultPrevented]})()"))
        print(errs or 'NO ERRORS'); await b.close()
    finally: srv.terminate()
asyncio.run(main())
