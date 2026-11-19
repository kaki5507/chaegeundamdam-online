import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print('exp',await pg.evaluate("()=>[MAXLV,need(99),need(100),need(150),need(199),Math.round(interpA(KILL_A,100)),Math.round(interpA(KILL_A,199))]"))
        print('ult',await pg.evaluate("""()=>{const g=__game;g.newGame('mage');SAVE.lvl=119;SAVE.tier=3;SAVE.flags.leftHarbor=1;g.goMap('df1',true);const p=PARTY[0];p.tier=3;p.mp=9999;p.maxmp=9999;
          const a=unlocked(p,5);SAVE.lvl=120;const b=unlocked(p,5);const hp0=S.mobs.map(m=>m.hp);castSkill(p,5);for(let i=0;i<80;i++)g.step(1/60);
          const hit=S.mobs.filter((m,i)=>m.dead||m.hp<hp0[i]).length;return [a,b,JOB.mage.sk[5].n,hit,S.mobs.length]}"""))
        await pg.evaluate("()=>{ULTFX={t0:G.t,n:'은하 붕괴',col:'#b8a0ff'};G.banner.t=9;G.toasts.length=0}");await pg.wait_for_timeout(250);await pg.screenshot(path='/tmp/eg_ult.png')
        for m in ['df1','df3','df5','df_altar']:
            await pg.evaluate("(m)=>{const g=__game;g.goMap(m,true);G.banner.t=9;G.toasts.length=0;PARTY[0].x=900;for(let i=0;i<30;i++)g.step(1/60)}",m);await pg.wait_for_timeout(150);await pg.screenshot(path='/tmp/eg_%s.png'%m)
        print('altar',await pg.evaluate("""()=>{const g=__game;SAVE.lvl=110;g.goMap('df_altar',true);const n=S.L.npcs.find(n=>n.id==='dkpriest');talkNPC(n);const o=G.dlg.opts.map(o=>o.t);
          G.dlg.opts[0].fn();G.dlg.opts[0].fn();SAVE.inv.dscale=30;qev('collect',{item:'dscale'});SAVE.q.dq1.p[0]=30;qcheck('dq1');qTurnIn('dq1');return [o,SAVE.q.dq1.s,SAVE.inv.dsigil]}"""))
        print('boss',await pg.evaluate("""async()=>{const g=__game;closeUI();const n=S.L.npcs.find(n=>n.id==='dkpriest');talkNPC(n);const i=G.dlg.opts.findIndex(o=>o.t.includes('소환'));G.dlg.opts[i].fn();
          await new Promise(r=>setTimeout(r,900));const r=[S.id,!!S.dkBoss,S.dkCrys.length,DKS&&DKS.pil];const p=PARTY[0];p.inv=999;
          const b=S.dkBoss;hitTarget(b,500,1,false,p);r.push(DKS.hp);for(const c of S.dkCrys)hitTarget(c,4000,1,false,p);r.push(DKS.pil);g.step(1/60);hitTarget(b,500,1,false,p);r.push(DKS.hp);
          hitTarget(b,13000,1,false,p);r.push(DKS.phase,DKS.pil);for(let k=0;k<400;k++){p.hp=p.maxhp;g.step(1/60)}r.push(S.dkfx.length>=0);
          DKS.pil=0;hitTarget(b,40000,1,false,p);g.step(1/60);r.push(DKS.dead,Object.keys(SAVE.ginv).filter(k=>k.startsWith('g_dk')),SAVE.cleared.dragonking);return r}"""))
        await pg.evaluate("()=>{const g=__game;closeUI();g.goMap('df_altar',true);G.dkSummon=1;g.goMap('df_boss',true);G.banner.t=9;G.toasts.length=0;S.dkfx.push({k:'meteor',x:PARTY[0].x+200,t:.7,warn:1.3,dur:.35,hit:false},{k:'breath',t:.6,warn:1.5,dur:1.1,hit:false});PARTY[0].x=700;for(let i=0;i<10;i++)g.step(1/60)}")
        await pg.wait_for_timeout(250);await pg.screenshot(path='/tmp/eg_boss.png')
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
