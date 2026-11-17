import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); pg=await b.new_page(viewport={'width':960,'height':540})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        # AP & stats
        print('ap',await pg.evaluate("""()=>{const g=__game;g.newGame('archer');g.gainExp(5000);const lv=SAVE.lvl,fr=SAVE.apFree;const p=PARTY[0];const a0=p.atkBase;
          autoAP();recalc(p);const a1=p.atkBase;SAVE.ap={str:4+fr,dex:4,int:4,luk:4};recalc(p);const a2=p.atkBase;return [lv,fr,Math.round(a0),Math.round(a1),Math.round(a2),statMul().toFixed(2)]}"""))
        # gear rules
        print('gear',await pg.evaluate("""()=>{SAVE.lvl=40;SAVE.ap={str:4,dex:130,int:4,luk:4};SAVE.apFree=0;['g_gm_bow','g_gm_club','g_lid','g_gm_ring','q_bracelet','r1','r2','r3'].forEach(k=>SAVE.ginv[k]=1);
          const out=[gearCheck('g_gm_club').join(),gearEquip('g_gm_bow','rh'),gearEquip('g_lid','lh'),gearEquip('g_gm_ring','acc1'),gearEquip('q_bracelet','acc2'),gearEquip('r1','acc3'),gearEquip('r2','acc4'),JSON.stringify(SAVE.gear)];return out}"""))
        print('2h',await pg.evaluate("""()=>{const g=__game;g.newGame('warrior');SAVE.lvl=40;SAVE.ap={str:130,dex:4,int:4,luk:4};SAVE.ginv={g_lid:1,g_gm_club:1,g_gm_heart:1};
          gearEquip('g_gm_heart','rh');gearEquip('g_lid','lh');const a=JSON.stringify(SAVE.gear);gearEquip('g_gm_club','rh');const b=JSON.stringify(SAVE.gear);gearEquip('g_lid','lh');return [a,b,JSON.stringify(SAVE.gear)]}"""))
        # story
        print('story',await pg.evaluate("""()=>{const g=__game;g.newGame('mage');SAVE.lvl=16;PARTY[0].lvl=16;recalc(PARTY[0]);g.goMap('stele',true);
          const st=S.L.steles.map(s=>s.c+':'+chAvail(s.c)).join();const npcs=S.L.npcs.map(n=>n.id).join();
          qAccept('c1a');g.goMap('ch1f',true);const po=S.L.portals[0];usePortal(po);return [st,npcs,qst('c1a').s,S.L.w]}"""))
        await pg.wait_for_timeout(900)
        print('dg',await pg.evaluate("""()=>{const g=__game;qTurnIn('c1a');qAccept('c1b');g.goMap('ch1d',true);G.banner.t=9;const p=PARTY[0];p.inv=999;
          let t=0;for(;t<60*200&&G.state==='play';t++){for(const m of S.mobs)if(!m.dead&&Math.random()<.02)killMob(m);p.hp=p.maxhp;g.step(1/60)}
          return [G.state,Math.round(t/60),SAVE.dg[1],qst('c1b').s,G.clear&&G.clear.lines.join('|')]}"""))
        print('boss',await pg.evaluate("""()=>{const g=__game;G.state='play';g.goMap('ch1b',true);const b=S.boss;const r=[b.name,b.max,b.hue,S.L.dmul];
          b.hp=1;hitBoss(b,99,false,PARTY[0]);for(let i=0;i<300;i++)g.step(1/60);return r.concat([G.state,SAVE.cleared.sb1,cracks(1),steleOpen(1)])}"""))
        print('open',await pg.evaluate("""()=>{SAVE.dg[1]=2;steleCheck(1);return [steleOpen(1),G.bigBanner&&G.bigBanner.title,chAvail(2),SAVE.lvl>=25]}"""))
        await pg.screenshot(path='/tmp/s_banner.png')
        print('scene',await pg.evaluate("""()=>{G.state='play';__game.goMap('stele',true);playScene('c1e');let n=0;while(G.ui==='scene'&&n<200){__game.press('Enter');__game.step(1/60);n++}return [n,G.ui]}"""))
        await pg.evaluate("(()=>{playScene('c1a');for(let i=0;i<200;i++)__game.step(1/60);__game.press('Enter');__game.step(1/60);for(let i=0;i<40;i++)__game.step(1/60)})()")
        await pg.screenshot(path='/tmp/s_scene.png')
        await pg.evaluate("(()=>{G.ui=null;G.scene=null;SAVE.lvl=40;G.bigBanner=null;const p=PARTY[0];p.x=560+330;S.cam.x=400;for(let i=0;i<20;i++)__game.step(1/60)})()")
        await pg.screenshot(path='/tmp/s_hub.png')
        await pg.evaluate("(()=>{SAVE.apFree=12;openStat()})()"); await pg.wait_for_timeout(200); await pg.screenshot(path='/tmp/s_stat.png')
        await pg.evaluate("(()=>{closeUI();pushChat({kind:'map',name:'근육맨',text:'안녕하세요!'});pushChat({kind:'mega',name:'당근궁수',text:'파티 구해요 비석 2화'});pushChat({kind:'hmega',name:'운영자',text:'경험치 2배 이벤트 진행중!'});setEvent({id:'e1',exp:2,drop:1,until:Date.now()+3600000,msg:'테스트'})})()")
        await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/s_chat.png')
        print('ev',await pg.evaluate("[EV().exp,evOn()]"))
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
