import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        r=await pg.evaluate("""async()=>{const g=__game;g.newGame('mage');SAVE.lvl=60;SAVE.flags.leftHarbor=1;g.goMap('h1',true);const out=[];
          const go=async(pred)=>{const po=S.L.portals.find(pred);const from=S.id;usePortal(po);await new Promise(r=>setTimeout(r,900));out.push(from+'('+po.x+')→'+S.id+' @'+Math.round(PARTY[0].x)+'/'+S.L.w)};
          await go(o=>o.x>S.L.w/2&&o.to!=='__exit');   // h1 오른쪽 → 다음 사냥터 (왼쪽 포탈 앞)
          await go(o=>o.x<S.L.w/2&&o.to!=='__exit');   // 왼쪽 포탈로 돌아가기 → h1 오른쪽 포탈 앞
          g.goMap('jt_mage',true);await go(o=>o.to==='jh_mage1');await go(o=>o.to==='jt_mage');
          return out}""")
        for x in r: print(x)
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
