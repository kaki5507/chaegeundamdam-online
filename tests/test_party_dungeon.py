import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); pg=await b.new_page(viewport={'width':960,'height':540})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""()=>{const g=__game;g.newGame('warrior');SAVE.lvl=45;SAVE.tier=2;const p=PARTY[0];p.lvl=45;p.tier=2;recalc(p);
          g.goMap('cave',true);const z=S.L.npcs.map(n=>n.id).join();qAccept('z1');
          // reach end portal
          const po=S.L.portals[0];p.x=po.x;p.y=po.y;usePortal(po);const dlg=G.dlg&&G.dlg.text.slice(0,20);G.dlg.opts[0].fn();
          return [z,dlg,PARTY.length,qst('z1').s]}"""))
        await pg.wait_for_timeout(900)
        print(await pg.evaluate("""()=>{const r=qTurnIn('z1');return [S.id,r.join('|'),JSON.stringify(SAVE.ginv)]}"""))
        # z2: teeth drop and eye
        print(await pg.evaluate("""()=>{qAccept('z2');SAVE.inv.gtooth=0;let drops=0;__game.goMap('cave',true);
          for(let i=0;i<400;i++){const m=spawnMob('egg',300,700,{});killMob(m)}
          const n=S.items.filter(i=>i.kind==='gtooth').length;for(const it of S.items.filter(i=>i.kind==='gtooth'))pickup(it,PARTY[0]);
          const st=qst('z2').s;const r=qTurnIn('z2');return ['teethDropRate',n/400,st,r&&r.join('|'),'gwi',SAVE.inv.gwi,'z2 state',qst('z2').s]}"""))
        # altar summon & fight
        print(await pg.evaluate("""()=>{const g=__game;G.fade=null;g.goMap('altar',true);G.banner.t=9;const p=PARTY[0];p.x=S.L.altar.x;p.y=470;S.near=null;
          for(let i=0;i<3;i++)g.step(1/60);const near=nearInteract();summonGuimok();const arms=S.mobs.filter(m=>m.type==='arm').length;
          const hp0=S.boss.hp;for(let i=0;i<150;i++)g.step(1/60);hitBoss(S.boss,500,false,p);const inv=S.boss.hp===hp0;
          return [near&&near.k,arms,S.boss.name,S.boss.max,'invulnWithArms',inv,SAVE.inv.gwi]}"""))
        await pg.screenshot(path='docs/img/15-guimok.png')
        print(await pg.evaluate("""()=>{const g=__game,b=S.boss;for(const m of S.mobs)if(m.type==='arm')killMob(m);
          for(let i=0;i<30;i++)g.step(1/60);const hp0=b.hp;hitBoss(b,500,false,PARTY[0]);return ['phase',b.phase,'dmgTaken',hp0-b.hp]}"""))
        # AI party actually fights: let sim run 90s with player invincible-ish
        print(await pg.evaluate("""()=>{const g=__game;g.goMap('altar',true);SAVE.inv.gwi=1;summonGuimok();const p=PARTY[0];p.kind='ai';
          for(let i=0;i<60*150&&G.state==='play';i++){for(const q of PARTY){if(q.hp<q.maxhp*.3)q.hp=q.maxhp}g.step(1/60)}
          return [G.state,S.boss&&S.boss.hp,S.mobs.filter(m=>m.type==='arm').length, G.clear&&G.clear.lines.join(' | ')]}"""))
        await pg.screenshot(path='/tmp/guimok_end.png')
        print(await pg.evaluate("""()=>{PARTY[0].kind='p1';SAVE.ginv.g_gm_ring=1;openInv(0);G.inv.sel=0;return invRows().map(r=>r.label+':'+(r.id||'-')).join(' ')}"""))
        print(await pg.evaluate("""()=>{const a0=PARTY[0].atkBase;gearPick('acc1');G.dlg.opts.find(o=>o.t.includes('반지')).fn();return [SAVE.gear.acc1,Math.round(a0),Math.round(PARTY[0].atkBase)]}"""))
        await pg.wait_for_timeout(200); await pg.screenshot(path='docs/img/16-equipment.png')
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
