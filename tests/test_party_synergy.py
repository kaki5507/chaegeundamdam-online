import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print('buff stack',await pg.evaluate("""()=>{const g=__game;g.newGame('warrior');SAVE.lvl=40;SAVE.tier=2;g.goMap('h3',true);const p=PARTY[0];p.tier=2;p.mp=999;
          addMember('ai','guardian');const a=PARTY[1];a.tier=2;a.mp=999;a.x=p.x+40;a.y=p.y;
          castSkill(p,2);castSkill(a,2);g.step(1/60);return [Object.keys(p.buffs).length,+p.buff.atk.toFixed(2),+p.buff.def.toFixed(2),Object.keys(a.buffs).length]}"""))
        print('turret',await pg.evaluate("""()=>{const g=__game;g.newGame('gunner');SAVE.lvl=20;SAVE.tier=1;g.goMap('h2',true);const p=PARTY[0];p.tier=1;p.mp=999;p.inv=99;S.mobs=[];
          const m=spawnMob('bunny',p.x+200,p.y,{});m.hp=m.max=99999;castSkill(p,2);for(let i=0;i<120;i++)g.step(1/60);return [SUMS.length,SUMS[0]&&SUMS[0].kind,m.max-m.hp>0]}"""))
        print('spirit',await pg.evaluate("""()=>{const g=__game;g.newGame('priest');SAVE.lvl=40;SAVE.tier=2;g.goMap('h2',true);const p=PARTY[0];p.tier=2;p.mp=999;p.inv=99;S.mobs=[];p.hp=p.maxhp*.3;const h=p.hp;
          castSkill(p,3);for(let i=0;i<200;i++)g.step(1/60);return [SUMS[0]&&SUMS[0].kind,p.hp>h]}"""))
        print('online',await pg.evaluate("""()=>{const g=__game;g.newGame('mage');SAVE.lvl=20;g.goMap('h2',true);const p=PARTY[0];EVPT='PP';
          PEERS['x1']={tg:{id:'x1',map:'h2',x:p.x+30,y:p.y,f:1,s:'idle',j:'warrior',ti:2,fi:1,lv:40,eq:{},h:70,pt:'PP',name:'친구'},x:p.x+30,y:p.y,t:0};
          const b=partyExpBonus();const e0=SAVE.exp;gainExp(100,{});const e1=SAVE.exp-e0;
          evMsg(JSON.stringify({t:'pb',k:'warrior:전투 함성',x:p.x,y:p.y,fname:'친구',b:{atk:1.35,spd:1.1,def:0,mpr:0,dur:12,n:'전투 함성'}}));g.step(1/60);
          const e2=SAVE.exp;evMsg(JSON.stringify({t:'kx',e:30,x:p.x,fname:'친구'}));return [b,e1,+p.buff.atk.toFixed(2),SAVE.exp-e2]}"""))
        await pg.evaluate("(()=>{const g=__game;G.banner.t=9;G.toasts.length=0;for(let i=0;i<20;i++)g.step(1/60)})()"); await pg.wait_for_timeout(150)
        await pg.screenshot(path='/tmp/party.png')
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
