import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader'])
        pg=await b.new_page(viewport={'width':960,'height':540})
        errs=[]
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://'+__import__('os').path.abspath('index.html')); await pg.wait_for_timeout(300)
        print(await pg.evaluate("""()=>{const g=__game;g.newGame('mage');
          const n=S.L.npcs.find(x=>x.id==='att');const out=[];
          for(let d=0;d<8;d++){ if(d>0)SAVE.att.last=dayNum()-1; checkIn(n); out.push(SAVE.att.streak+':ec'+SAVE.ec+':'+G.dlg.text.split('\\n').slice(2).join('/')); }
          return out}"""))
        print(await pg.evaluate("""()=>{return [SAVE.ec,Object.keys(SAVE.inv).join(),SAVE.att.total,SAVE.att.weeks]}"""))
        # gap breaks streak
        print(await pg.evaluate("""()=>{SAVE.att.last=dayNum()-3;checkIn({name:'x'});return SAVE.att.streak}"""))
        # same day twice
        print(await pg.evaluate("""()=>{const e=SAVE.ec;checkIn({name:'x'});return [SAVE.ec-e,G.dlg.opts.map(o=>o.t).join('|')]}"""))
        # cash shop
        print(await pg.evaluate("""()=>{SAVE.ec=30;openShop(true);const l=shopList();G.shop.sel=l.findIndex(i=>i.id==='cs_out_rainbow');__game.press('Enter');__game.step(1/60);
          const a=[SAVE.ec,!!SAVE.inv.cs_out_rainbow];G.shop.sel=l.findIndex(i=>i.id==='cs_out_galaxy');__game.press('Enter');__game.step(1/60);return a.concat([SAVE.ec,!!SAVE.inv.cs_out_galaxy,l.length])}"""))
        await pg.evaluate("(()=>{SAVE.inv.cs_hat_halo=1;SAVE.inv.cs_cape_wing=1;SAVE.inv.cs_face_star=1;SAVE.inv.cs_aura_heart=1;G.shop.sel=0})()")
        await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/cash.png')
        await pg.evaluate("(()=>{closeUI();const e=PARTY[0].eq;e.hat='cs_hat_halo';e.cape='cs_cape_wing';e.outfit='cs_out_rainbow';e.face='cs_face_star';e.aura='cs_aura_heart';PARTY[0].x=1300;G.banner.t=9;})()")
        await pg.wait_for_timeout(1200); await pg.screenshot(path='/tmp/cashdress.png')
        # scroll seller hidden
        print(await pg.evaluate("""()=>{const n=S.L.npcs.find(x=>x.id==='scroll'),p=PARTY[0];const o=[];
          p.x=1040;p.y=470;o.push(!!nearInteract());p.y=300;p.x=1040;S.near=nearInteract();o.push(S.near&&S.near.n.id);p.x=1600;p.y=470;o.push(!!nearInteract());return [n.x,n.gy].concat(o)}"""))
        await pg.evaluate("(()=>{const p=PARTY[0];p.x=1000;p.y=300;p.vx=p.vy=0;S.cam.x=700;S.cam.y=0;PARTY[0].eq={}})()")
        await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/scroll.png')
        # scrolls
        print(await pg.evaluate("""()=>{const n=S.L.npcs.find(x=>x.id==='scroll');SAVE.coins=100000;scrollBuy(n);
          const ks=Object.keys(SCROLLS);const r=[];
          for(let i=0;i<ks.length;i++){G.dlg.opts[i].fn()}
          r.push(ks.map(k=>SAVE.scrolls[k]).join(','),SAVE.coins);
          const hp0=PARTY[0].maxhp,at0=PARTY[0].atkBase;
          for(let i=0;i<30;i++){if(SAVE.enh.used>=enhSlots())break;useScroll(n,'atk100')}
          r.push(JSON.stringify(SAVE.enh),enhSlots(),PARTY[0].atkBase.toFixed(1)+'/'+at0.toFixed(1));
          useScroll(n,'atk100');r.push(G.dlg.text.split('\\n')[0]);
          useScroll(n,'white');r.push(SAVE.enh.used);
          return r}"""))
        print(await pg.evaluate("""()=>{let ok=0;SAVE.enh={atk:0,hp:0,used:0};SAVE.scrolls.atk60=1000;for(let i=0;i<1000;i++){const e=SAVE.enh;e.used=0;const b=e.atk;useScroll({name:'x'},'atk60');if(e.atk>b)ok++}return ok/1000}"""))
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
