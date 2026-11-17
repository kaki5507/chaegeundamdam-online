import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader'])
        pg=await b.new_page(viewport={'width':960,'height':540})
        errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file://'+__import__('os').path.abspath('index.html')); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""()=>{const o=[];for(const l of [1,5,9,10,20,29,30,40,49,50,60,69,70,80,99])o.push(l+':'+need(l)+'/kills≈'+Math.round(need(l)/(14*expMul(l))/(1)*1/ (need(l)/(14*expMul(l))/ (need(l)/(14*expMul(l)))) ));return o.join(' ')}"""))
        print(await pg.evaluate("""()=>{const o=[];for(const l of [1,5,10,20,30,50,70,90])o.push(l+': egg exp='+Math.max(1,Math.round(14*expMul(l)))+' kills/lv='+Math.round(need(l)/Math.max(1,14*expMul(l))));return o.join(' | ')}"""))
        # new game, tier0, skills
        print(await pg.evaluate("""()=>{const g=__game;g.newGame('archer');const p=g.PARTY[0];return [SAVE.tier,p.tier,[0,1,2,3,4].map(i=>unlocked(p,i)).join()]}"""))
        # daily
        print(await pg.evaluate("""()=>{const g=__game;SAVE.lvl=12;SAVE.dayKey='old';const r=checkDaily();
          qAccept('d1');qst('d1').p=[20];qcheck('d1');const s=qst('d1').s;const e0=SAVE.exp,l0=SAVE.lvl;const lines=qTurnIn('d1');
          return [r,s,lines.join('|'),'pct',dailyPct(12),'need',need(12)]}"""))
        # advancement 1 in town
        print(await pg.evaluate("""()=>{const g=__game;SAVE.lvl=10;PARTY[0].lvl=10;qAccept('j1');qst('j1').p=[20,10];qcheck('j1');const l=qTurnIn('j1');return [SAVE.tier,PARTY[0].tier,l.join('|'),qAvail('j2')]}"""))
        print(await pg.evaluate("""()=>{SAVE.lvl=30;return [qAvail('j2'),qAvail('j3')]}"""))
        # forest NPC present
        print(await pg.evaluate("""()=>{__game.goMap('forest',true);return S.L.npcs.map(n=>n.id+'@'+Math.round(n.x)+','+Math.round(n.gy)).join(' ')+' end '+JSON.stringify(S.L.endSpawn)}"""))
        await pg.evaluate("(()=>{const g=__game;const n=S.L.npcs[0];PARTY[0].x=n.x;PARTY[0].y=n.gy;G.banner.t=9;S.cam.x=n.x-480;S.cam.y=n.gy-340})()")
        await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/adv2.png')
        # j2 trial boss
        print(await pg.evaluate("""()=>{qAccept('j2');goMap('boss1',true);return [S.boss.name,S.boss.hp,S.boss.max]}"""))
        print(await pg.evaluate("""()=>{S.boss.hp=1;hitBoss(S.boss,50,false,PARTY[0]);for(let i=0;i<400;i++)__game.step(1/60);return [G.state,qst('j2').p.join(),qst('j2').s]}"""))
        print(await pg.evaluate("""()=>{SAVE.inv.vegbit=20;qev('collect',{item:'vegbit'});returnTown();for(let i=0;i<60;i++)__game.step(1/60);return [S.id,qst('j2').s,JSON.stringify(PARTY[0].x|0)]}"""))
        await pg.evaluate("(()=>{G.banner.t=9;})()"); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""()=>{qTurnIn('j2');return [SAVE.tier,PARTY[0].tier]}"""))
        # PvP vs AI
        print(await pg.evaluate("""()=>{const g=__game;g.goMap('pvp',true);return [PARTY.length,PARTY.map(p=>p.team+':'+p.kind+':'+!!p.foe).join()]}"""))
        await pg.evaluate("(()=>{G.banner.t=9})()")
        # simulate fight: P1 stands and attacks right
        r=await pg.evaluate("""()=>{const a=PARTY[0],f=PARTY[1];a.x=420;f.x=480;f.y=a.y=420;f.vx=0;f.ai=null;
          const hp0=f.hp;const x0=f.x;
          dealDamage(a,f,atkOf(a)*3,1);
          const vx=f.vx,st=f.stun;
          for(let i=0;i<40;i++)__game.step(1/60);
          return {dmg:hp0-f.hp,vx:Math.round(vx),stun:st,dx:Math.round(f.x-x0)}}""")
        print('knockback',r)
        await pg.screenshot(path='/tmp/pvp1.png')
        # ring-out: put foe at edge and hit
        r=await pg.evaluate("""()=>{const a=PARTY[0],f=PARTY[1];f.dead=false;f.inv=0;f.hp=f.maxhp;f.x=200;f.y=420;a.x=170;
          for(let k=0;k<6;k++){f.inv=0;dealDamage(a,f,atkOf(a)*3,-1);for(let i=0;i<20;i++)__game.step(1/60);}
          for(let i=0;i<120;i++)__game.step(1/60);
          return {score:S.pvp.score,fdead:f.dead,fy:Math.round(f.y)}}""")
        print('ringout',r)
        # AI vs AI full match to completion
        r=await pg.evaluate("""()=>{const g=__game;g.goMap('pvp',true);G.banner.t=9;PARTY[0].kind='ai';
          let n=0;while(!S.pvp.over&&n<60*120){__game.step(1/60);n++}
          return {over:S.pvp.over,score:S.pvp.score,secs:Math.round(n/60),duel:SAVE.duel}}""")
        print('ai match',r)
        await pg.screenshot(path='/tmp/pvp2.png')
        print('\n'.join(errs[:20]) or 'NO ERRORS')
        await b.close()
asyncio.run(main())
