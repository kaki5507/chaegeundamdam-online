import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""()=>{const g=__game;g.newGame('warrior');SAVE.lvl=110;SAVE.tier=3;SAVE.flags.leftHarbor=1;g.goMap('df1',true);
          // 사냥 : 120마리(≈10분) 잡았을 때 %
          const e0=SAVE.exp;for(let i=0;i<120;i++)gainExp(MOBS.dknight.exp,{});const hunt=(SAVE.exp-e0)/need(SAVE.lvl)*100;
          g.goMap('town',true);pqMenu();const o=G.dlg.opts.find(o=>o.t.includes('고레벨'));o.fn();const list=G.dlg.opts.map(o=>o.t);
          G.dlg.opts[0].fn();const solo=S.id;addMember('ai','priest');pqMenu();G.dlg.opts.find(o=>o.t.includes('고레벨')).fn();G.dlg.opts[0].fn();
          return [hunt.toFixed(2)+'%',list.slice(0,2),solo]}"""))
        await pg.wait_for_timeout(900)
        print(await pg.evaluate("""()=>{const g=__game;G.fade=null;if(S.id!=='pq6_1')g.goMap('pq6_1',true);const r=[S.id];g.goMap('pq6_3',true);const b=S.dunBoss;r.push(b&&b.fbName);killMob(b);g.step(1/60);
          const ch=S.L.npcs.find(n=>n.id==='dchest');const e0=SAVE.exp,l0=SAVE.lvl;talkNPC(ch);r.push(((SAVE.exp-e0)/need(SAVE.lvl)*100).toFixed(1)+'%',SAVE.lvl===l0);
          closeUI();SAVE.lvl=110;r.push((dunExpPct(DUNS.find(d=>d.id==='dn5'))*100)+'% (낮은 던전)');return r}"""))
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
