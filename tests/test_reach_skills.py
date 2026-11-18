import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        kw=dict(args=['--no-sandbox','--use-gl=swiftshader'])
        if os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
        b=await p.chromium.launch(**kw); errs=[]
        pg=await b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('index.html')); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{__game.newGame('guardian');SAVE.lvl=99;__game.goMap('town',true)}")
        await pg.add_script_tag(path='tests/reach.js')
        bad=await pg.evaluate("""()=>{const r=__reach({hj:96,hs:240});const o=[];for(const k in r){const v=r[k];if(v.err){o.push(k+' ERR');continue}
          if(v.t2.plats.length||v.t2.npcs.length||v.t2.portals.length)o.push(k+' t2:'+JSON.stringify(v.t2));
          const n1=v.t1.npcs.filter(x=>!x.startsWith('chest'));if(n1.length||v.t1.portals.length||v.t1.plats.length>1)o.push(k+' t1:'+JSON.stringify(v.t1))}return o}""")
        print('reach problems',bad)
        # 실제 물리 : 보스 맵 높은 발판 (자동 밧줄) — 수호자(점프 가장 낮음)
        print('boss1 rope',await pg.evaluate("""()=>{const g=__game;g.goMap('boss1',true);const p=PARTY[0];p.inv=99;S.boss&&(S.boss.invuln=true);const r=S.L.ropes.find(r=>r.auto);if(!r)return 'no auto rope';
          p.x=r.x;p.y=r.y2;p.vy=0;for(let i=0;i<10;i++)g.step(1/60);g.hold('ArrowUp',true);for(let i=0;i<300&&p.y>r.y1+2;i++)g.step(1/60);g.hold('ArrowUp',false);for(let i=0;i<30;i++)g.step(1/60);return [r.y1,Math.round(p.y),p.onGround]}"""))
        # 사냥터 하늘 보물상자 : 2차 슈퍼점프
        print('hunt chest',await pg.evaluate("""()=>{const g=__game;g.goMap('jh_mage1',true);const p=PARTY[0];p.tier=2;SAVE.tier=2;p.inv=99;S.mobs=[];const c=S.L.npcs.find(n=>n.id==='chest');
          const under=S.L.plats.filter(q=>q.y>c.gy+60&&c.x>=q.x&&c.x<=q.x+q.w).sort((a,b)=>a.y-b.y)[0];p.x=c.x;p.y=under.y;p.vy=0;for(let i=0;i<20;i++)g.step(1/60);
          g.press('Space');g.hold('Space',true);for(let i=0;i<22;i++)g.step(1/60);g.press('Space');for(let i=0;i<90;i++)g.step(1/60);g.hold('Space',false);for(let i=0;i<30;i++)g.step(1/60);return [c.gy,under.y,Math.round(p.y)]}"""))
        # 1차 스킬 : 이동하는 공격
        for job in ['warrior','archer','guardian','mage','fighter','rogue','gunner','priest']:
            r=await pg.evaluate("""(job)=>{const g=__game;g.newGame(job);SAVE.lvl=20;SAVE.tier=1;g.goMap('jh_'+job+'1',true);const p=PARTY[0];p.tier=1;p.mp=999;p.inv=99;p.face=1;p.x=600;p.y=470;
              S.mobs=[];for(let i=0;i<10;i++)g.step(1/60);const sk=JOB[job].sk[0],x0=p.x;
              const m=spawnMob('bunny',p.x+150,470,{});m.hp=m.max=99999;const h0=m.hp;castSkill(p,0);for(let i=0;i<50;i++)g.step(1/60);
              return [JOB[job].role,jline(JOB[job],1),sk.n,sk.k,Math.round(p.x-x0),h0-m.hp>0]}""",job)
            print(r)
        print(errs or 'NO ERRORS'); await b.close()
asyncio.run(main())
