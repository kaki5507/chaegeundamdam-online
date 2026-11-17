/* ============================================================
   ART 2 : cosmetics, NPCs, props, third boss
   ============================================================ */
const EYE_Y={broc:1,carrot:-3,radish:-2,onion:-1,chili:-1,eggplant:0,corn:-2,garlic:-1};
function torsoPath(g,shy){g.beginPath();g.moveTo(-22,shy+3);g.quadraticCurveTo(0,shy-7,22,shy+3);g.lineTo(11,-26);g.lineTo(-11,-26);g.closePath()}
function drawCape(g,id,t,st,shy){
  const it=ITEMS[id],run=st==='run',fl=(run?12:st==='air'?16:3)+Math.sin(t*(run?16:4))*(run?5:2);
  g.save();if(id==='cape_ghost')g.globalAlpha*=.72;
  g.beginPath();g.moveTo(-8,shy+1);g.quadraticCurveTo(-22-fl*.4,shy+14,-28-fl,-10);
  const bx=-28-fl,n=4;
  for(let i=1;i<=n;i++){const x=bx+(i/n)*(18+fl),y=-10+(i%2?9:2)+Math.sin(t*6+i)*2;g.lineTo(x,y)}
  g.lineTo(8,shy+1);g.closePath();
  const gr=g.createLinearGradient(0,shy,-30,-10);gr.addColorStop(0,it.col);gr.addColorStop(1,id==='cape_ghost'?'#9fb8ff':shade(it.col,-50));
  g.fillStyle=gr;g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();
  if(id==='cape_gold'||id==='cape_red'||id==='cape_blue'){g.strokeStyle='rgba(255,230,140,.9)';g.lineWidth=1.6;g.beginPath();g.moveTo(-9,shy+3);g.quadraticCurveTo(-24-fl*.4,shy+16,-28-fl,-9);g.stroke()}
  g.restore();
}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=clamp((n>>16)+amt,0,255),gg=clamp(((n>>8)&255)+amt,0,255),b=clamp((n&255)+amt,0,255);return`rgb(${r},${gg},${b})`}
function drawOutfit(g,id,shy){
  const it=ITEMS[id];
  g.save();torsoPath(g,shy);g.clip();
  if(id==='out_tank'){g.fillStyle=it.col;g.fillRect(-24,shy+9,48,60);g.fillStyle=shade(it.col,-40);g.fillRect(-24,shy+9,48,3);
    g.fillStyle=it.col;g.fillRect(-15,shy,6,12);g.fillRect(9,shy,6,12);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=1.4;g.beginPath();g.moveTo(-10,shy+16);g.lineTo(-6,-26);g.moveTo(10,shy+16);g.lineTo(6,-26);g.stroke()}
  else if(id==='out_vest'){g.fillStyle=it.col;g.fillRect(-24,shy,18,70);g.fillRect(6,shy,18,70);g.fillStyle='#fff';g.fillRect(-7,shy+2,2.4,70);g.fillRect(5,shy+2,2.4,70);
    g.fillStyle='#ffd34a';for(const yy of[shy+12,shy+22]){circ(g,-12,yy,1.6,'#ffd34a');circ(g,12,yy,1.6,'#ffd34a')}}
  else if(id==='out_dobok'){g.fillStyle=it.col;g.fillRect(-24,shy-2,48,70);g.strokeStyle='#f0f0f0';g.lineWidth=3;g.beginPath();g.moveTo(-12,shy);g.lineTo(2,-18);g.moveTo(12,shy);g.lineTo(-2,-18);g.stroke();
    g.fillStyle='#e8e8e8';g.fillRect(-12,-30,24,4)}
  else if(id==='out_gold'){const gr=g.createLinearGradient(-20,shy,20,-26);gr.addColorStop(0,'#fff2a0');gr.addColorStop(.5,'#ffc83a');gr.addColorStop(1,'#c88a10');g.fillStyle=gr;g.fillRect(-24,shy-2,48,70);
    g.strokeStyle='#8a5a00';g.lineWidth=1.6;g.beginPath();g.arc(-8,shy+10,8,.2,2.9);g.arc(8,shy+10,8,.25,2.95);g.moveTo(0,shy+4);g.lineTo(0,-28);g.stroke();
    for(const yy of[shy+20,shy+26]){g.beginPath();g.moveTo(-8,yy);g.lineTo(8,yy);g.stroke()}}
  else if(id==='cs_out_rainbow'){const cs=['#ff5a5a','#ffa03a','#ffe04a','#5ad45a','#4aa8ff','#9a5aff'];cs.forEach((c,i)=>{g.fillStyle=c;g.fillRect(-24+i*8,shy-2,8.2,70)});g.fillStyle='rgba(255,255,255,.3)';g.fillRect(-24,shy-2,48,4)}
  else if(id==='cs_out_galaxy'){const gr=g.createLinearGradient(0,shy,0,-26);gr.addColorStop(0,'#1a1038');gr.addColorStop(1,'#5a3aa8');g.fillStyle=gr;g.fillRect(-24,shy-2,48,70);
    for(let i=0;i<9;i++){const sx=-20+hash(i*7)*40,sy=shy+hash(i*3+1)*30;g.fillStyle=i%2?'#fff':'#ffe97a';g.fillRect(sx,sy,2,2)}g.fillStyle='#ffe97a';g.fillRect(-24,shy+30,48,2)}
  else if(id==='out_hanbok'){g.fillStyle=it.col;g.fillRect(-24,shy-2,48,70);g.fillStyle='#fff';g.beginPath();g.moveTo(-9,shy);g.lineTo(0,shy+16);g.lineTo(9,shy);g.lineTo(5,shy);g.lineTo(0,shy+9);g.lineTo(-5,shy);g.fill();
    g.strokeStyle='#ffd34a';g.lineWidth=2;g.beginPath();g.moveTo(0,shy+14);g.lineTo(-5,shy+26);g.moveTo(0,shy+14);g.lineTo(5,shy+24);g.stroke()}
  g.restore();
  g.save();torsoPath(g,shy);g.lineWidth=2.4;g.strokeStyle=O_;g.stroke();g.restore();
}
function drawGear(g,c,eq,x,y,t){
  g.save();g.translate(x,y);g.lineJoin='round';
  const ey=EYE_Y[c.head]||0;
  if(eq.face){const id=eq.face;
    if(id==='face_sun'){g.fillStyle='#10101a';g.beginPath();g.roundRect(-10.5,ey-4,9,6.5,2);g.roundRect(1.5,ey-4,9,6.5,2);g.fill();g.lineWidth=1.5;g.strokeStyle=O_;g.stroke();g.beginPath();g.moveTo(-1.5,ey-2);g.lineTo(1.5,ey-2);g.stroke();g.fillStyle='rgba(255,255,255,.4)';g.fillRect(-9,ey-3,3,1.4);g.fillRect(3,ey-3,3,1.4)}
    else if(id==='face_heart'){for(const s of[-1,1]){g.save();g.translate(s*5.5,ey-.5);g.beginPath();g.moveTo(0,5);g.bezierCurveTo(-8,0,-6,-6,0,-3);g.bezierCurveTo(6,-6,8,0,0,5);g.fillStyle='rgba(255,70,140,.8)';g.fill();g.lineWidth=1.5;g.strokeStyle=O_;g.stroke();g.restore()}}
    else if(id==='face_patch'){g.strokeStyle=O_;g.lineWidth=1.4;g.beginPath();g.moveTo(-13,ey-8);g.lineTo(12,ey+6);g.stroke();circ(g,5.2,ey+.4,4.4,'#14141c',O_,1.4)}
    else if(id==='cs_face_star'){for(const s of[-1,1]){g.save();g.translate(s*5.5,ey-.5);g.rotate(Math.sin(t*3)*.3);poly(g,[0,-7,2,-2,7,0,2,2,0,7,-2,2,-7,0,-2,-2],'#ffe04a',O_,1.3);g.restore()}}
    else if(id==='face_mask'){g.beginPath();g.moveTo(-11,ey+5);g.quadraticCurveTo(0,ey+3,11,ey+5);g.quadraticCurveTo(10,ey+16,0,ey+17);g.quadraticCurveTo(-10,ey+16,-11,ey+5);g.fillStyle='#c0283c';g.fill();g.lineWidth=1.8;g.strokeStyle=O_;g.stroke();
      poly(g,[-6,ey+10,-3,ey+10,-4.5,ey+16],'#fff',O_,1);poly(g,[3,ey+10,6,ey+10,4.5,ey+16],'#fff',O_,1)}
  }
  if(eq.hat){const id=eq.hat,it=ITEMS[id];
    if(id==='hat_flower'){for(let i=0;i<5;i++){const a=i/5*6.28;ell(g,11+Math.cos(a)*4.4,-13+Math.sin(a)*4.4,3.2,2.4,'#ff8ac0',O_,1.1,a)}circ(g,11,-13,2.4,'#ffe060',O_,1)}
    else if(id==='hat_gat'){ell(g,0,-12,22,5.4,'#1c1410',O_,2);g.beginPath();g.roundRect(-9,-30,18,18,[6,6,2,2]);g.fillStyle='rgba(40,30,26,.92)';g.fill();g.lineWidth=2;g.strokeStyle=O_;g.stroke();g.strokeStyle='#d03a4a';g.lineWidth=1.6;g.beginPath();g.moveTo(-9,-15);g.lineTo(9,-15);g.stroke();
      g.strokeStyle='#d03a4a';g.beginPath();g.moveTo(-20,-10);g.quadraticCurveTo(-12,6,-9,6);g.moveTo(20,-10);g.quadraticCurveTo(12,6,9,6);g.stroke()}
    else if(id==='hat_horns'){for(const s of[-1,1]){g.save();g.translate(s*10,-14);g.rotate(s*.3);poly(g,[-4,2,4,2,s*1,-20],'#fff0c4',O_,2);g.restore()}}
    else if(id==='hat_crown'){poly(g,[-12,-12,-12,-26,-6,-19,0,-30,6,-19,12,-26,12,-12],'#ffd34a',O_,2);circ(g,0,-20,2.4,'#ff4a5a',O_,1);circ(g,-8,-18,1.6,'#4ab8ff');circ(g,8,-18,1.6,'#4aff9a')}
    else if(id==='hat_helm'){g.beginPath();g.arc(0,-6,15,Math.PI,0);g.lineTo(15,-5);g.lineTo(-15,-5);g.closePath();const gr=g.createLinearGradient(-14,-20,14,-5);gr.addColorStop(0,'#e8edf8');gr.addColorStop(1,'#7a86a0');g.fillStyle=gr;g.fill();g.lineWidth=2.2;g.strokeStyle=O_;g.stroke();g.fillStyle='#c0283c';g.fillRect(-2,-26,4,14);g.strokeRect(-2,-26,4,14)}
    else if(id==='hat_ninja'){g.strokeStyle=O_;g.lineWidth=7.5;g.beginPath();g.moveTo(-12,-8);g.lineTo(12,-8);g.stroke();g.strokeStyle='#22223a';g.lineWidth=5;g.stroke();const f=Math.sin(t*7)*3;g.strokeStyle='#22223a';g.lineWidth=3;g.beginPath();g.moveTo(-12,-8);g.quadraticCurveTo(-20,-6+f,-27,-2+f*1.4);g.moveTo(-12,-8);g.quadraticCurveTo(-19,-12+f,-26,-12+f);g.stroke()}
    else if(id==='cs_hat_halo'){const by=-28+Math.sin(t*3)*1.5;g.strokeStyle=O_;g.lineWidth=6;g.beginPath();g.ellipse(0,by,13,4.4,0,0,6.28);g.stroke();g.strokeStyle='#ffe97a';g.lineWidth=3;g.beginPath();g.ellipse(0,by,13,4.4,0,0,6.28);g.stroke()}
    else if(id==='cs_hat_cat'){for(const s of[-1,1]){g.save();g.translate(s*9,-15);g.rotate(s*.22);poly(g,[-6,3,6,3,0,-15],'#3a3a48',O_,2);poly(g,[-3,2,3,2,0,-9],'#ff9ab0');g.restore()}}
    else if(id==='hat_fox'){for(const s of[-1,1]){g.save();g.translate(s*9,-16);g.rotate(s*.25);poly(g,[-6,3,6,3,0,-17],'#fff2e8',O_,2);poly(g,[-3,2,3,2,0,-10],'#ff9ab0');g.restore()}}
  }
  g.restore();
}
function drawAuraFx(p,dt){ // spawn aura particles
  const a=p.eq&&p.eq.aura;if(!a)return;
  p._ax=(p._ax||0)-dt;if(p._ax>0)return;p._ax=.07;
  const cx=p.x,cy=p.y-30;
  if(a==='aura_flame')parts.push({x:cx+rnd(-14,14),y:p.y-rnd(0,10),vx:rnd(-10,10),vy:rnd(-90,-40),life:.6,max:.6,size:rnd(3,6),col:Math.random()<.5?'#ff8a30':'#ffd040',grav:-60,glow:true});
  else if(a==='aura_petal')parts.push({x:cx+rnd(-30,30),y:p.y-rnd(40,70),vx:rnd(-30,30),vy:rnd(20,50),life:1.1,max:1.1,size:rnd(2.5,4),col:'#ffa0cc',grav:0});
  else if(a==='aura_ghost')parts.push({x:cx+rnd(-24,24),y:p.y-rnd(0,50),vx:rnd(-12,12),vy:rnd(-50,-20),life:.9,max:.9,size:rnd(3,5),col:'#7ad0ff',grav:-30,glow:true});
  else if(a==='cs_aura_star')parts.push({x:cx+rnd(-26,26),y:cy+rnd(-34,30),vx:0,vy:rnd(-20,-6),life:.5,max:.5,size:rnd(2,4.2),col:Math.random()<.5?'#fff36a':'#ffffff',grav:0,glow:true});
  else if(a==='cs_aura_heart')parts.push({x:cx+rnd(-24,24),y:p.y-rnd(0,20),vx:rnd(-10,10),vy:rnd(-70,-35),life:.9,max:.9,size:rnd(3.5,6),col:'#ff7ab8',grav:-20,glow:true});
  else if(a==='aura_thunder'&&Math.random()<.5){const a2=rnd(0,6.28),r=rnd(18,32);parts.push({x:cx+Math.cos(a2)*r,y:cy+Math.sin(a2)*r,vx:0,vy:0,life:.14,max:.14,size:rnd(2,3.4),col:'#fff36a',grav:0,glow:true})}
}

/* ---------------- NPCs ---------------- */
function drawNPC(g,n,t,mark,faceDir){
  const x=n.x,y=n.gy;
  g.save();
  if(n.look==='board'){
    g.fillStyle='#5a3a1c';g.fillRect(x-40,y-92,6,92);g.fillRect(x+34,y-92,6,92);
    g.beginPath();g.roundRect(x-52,y-120,104,70,6);g.fillStyle='#8a5a30';g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke();
    for(const[dx,dy,c]of[[-38,-112,'#fff8e0'],[-8,-114,'#ffe9a0'],[20,-110,'#ffd8d8'],[-30,-86,'#e0f0ff'],[2,-88,'#fff8e0'],[28,-84,'#e8ffe0']]){g.save();g.translate(x+dx,y+dy);g.rotate((hash(dx)-.5)*.2);g.fillStyle=c;g.fillRect(0,0,24,22);g.strokeStyle=O_;g.lineWidth=1.3;g.strokeRect(0,0,24,22);g.fillStyle='#a0402a';g.fillRect(2,3,16,1.6);g.fillRect(2,8,12,1.6);g.fillRect(2,13,15,1.6);circ(g,12,0,2,'#e04040');g.restore()}
    g.restore();return;
  }
  if(n.look==='closet'){
    const fy=Math.sin(t*2)*4;
    g.translate(0,fy);
    g.beginPath();g.roundRect(x-34,y-110,68,98,5);g.fillStyle='#b8784a';g.fill();g.lineWidth=3;g.strokeStyle=O_;g.stroke();
    g.strokeStyle='#6a3e1c';g.lineWidth=2;g.strokeRect(x-28,y-104,26,86);g.strokeRect(x+2,y-104,26,86);circ(g,x-6,y-60,3,'#ffd34a',O_,1);circ(g,x+6,y-60,3,'#ffd34a',O_,1);
    g.fillStyle='#8a5a30';g.fillRect(x-40,y-118,80,10);g.strokeRect(x-40,y-118,80,10);
    g.globalAlpha=.8;for(const s of[-1,1]){g.save();g.translate(x+s*36,y-80);g.rotate(s*(.3+Math.sin(t*8)*.15));ell(g,s*14,0,16,6,'#e8f4ff',O_,1.5);g.restore()}
    g.globalAlpha=1;for(let i=0;i<3;i++){const a=t*2+i*2.1;g.fillStyle='#fff7a0';g.font='14px sans-serif';g.textAlign='center';g.fillText('✦',x+Math.cos(a)*48,y-70+Math.sin(a)*34)}
    g.restore();return;
  }
  if(n.look==='miko'){
    const fy=Math.sin(t*2.3)*5;g.translate(0,fy-14);
    const al=n.alpha===undefined?1:n.alpha;g.globalAlpha=al;
    // ghost flame
    for(let i=0;i<3;i++)circ(g,x+Math.cos(t*2+i*2.1)*34,y-80+Math.sin(t*2+i*2.1)*20,5,'rgba(140,210,255,.85)');
    g.beginPath();g.moveTo(x-18,y-86);g.lineTo(x+18,y-86);g.lineTo(x+28,y-4);g.quadraticCurveTo(x+10,y+8,x,y-6);g.quadraticCurveTo(x-10,y+10,x-28,y-4);g.closePath();
    g.fillStyle='rgba(250,246,255,.94)';g.fill();g.lineWidth=2.6;g.strokeStyle=O_;g.stroke();
    g.fillStyle='#c0283c';g.fillRect(x-18,y-86,36,10);g.strokeRect(x-18,y-86,36,10);
    g.fillStyle='#1a1224';g.beginPath();g.ellipse(x,y-102,17,19,0,0,6.28);g.fill();g.strokeStyle=O_;g.stroke();g.fillRect(x-18,y-102,6,64);g.fillRect(x+12,y-102,6,64);
    ell(g,x,y-98,13,15,'#f6e8e0',O_,2);
    circ(g,x-5,y-98,1.8,O_);circ(g,x+5,y-98,1.8,O_);g.strokeStyle='#c0283c';g.lineWidth=2;g.beginPath();g.arc(x,y-92,3,.2,2.9);g.stroke();
    g.fillStyle='#c0283c';g.fillRect(x-14,y-114,28,4);
    g.restore();return;
  }
  // veggie-bodied NPCs
  const map={chief:'guardian',coach:'fighter',shop:'gunner',monk:'priest',aunt:'mage',daily:'archer',duel:'warrior',sage:'rogue',moon:'mage',att:'priest',cash:'rogue',scroll:'gunner',zgate:'guardian'};
  const job=JOB[map[n.look]],eq={};
  if(n.look==='coach'){eq.hat='hat_helm';eq.outfit='out_dobok'}
  if(n.look==='shop'){eq.outfit='out_tank';eq.hat='hat_flower'}
  if(n.look==='monk'){eq.outfit='out_hanbok'}
  if(n.look==='aunt'){eq.outfit='out_vest';eq.hat='hat_flower'}
  if(n.look==='chief'){eq.hat='hat_gat';eq.outfit='out_dobok'}
  if(n.look==='zgate'){eq.hat='hat_horns';eq.outfit='out_gold';eq.cape='cape_red'}
  if(n.look==='att'){eq.hat='hat_flower';eq.outfit='out_hanbok';eq.face='face_heart'}
  if(n.look==='cash'){eq.hat='cs_hat_cat';eq.outfit='cs_out_rainbow';eq.cape='cs_cape_wing'}
  if(n.look==='scroll'){eq.hat='hat_ninja';eq.face='face_patch'}
  if(n.look==='daily'){eq.hat='hat_flower';eq.outfit='out_vest'}
  if(n.look==='duel'){eq.hat='hat_helm';eq.outfit='out_tank'}
  if(n.look==='sage'){eq.hat='hat_ninja';eq.cape='cape_red'}
  if(n.look==='moon'){eq.outfit='out_hanbok';eq.aura='aura_ghost'}
  drawVeggie(g,job,{x,y,face:faceDir||1,t:t+n.x,st:'idle',eq,tier:n.look==='moon'||n.look==='sage'?3:1});
  if(n.look==='chief'){ // beard + cane
    g.strokeStyle=O_;g.lineWidth=7;g.beginPath();g.moveTo(x+(faceDir||1)*-20,y-14);g.lineTo(x+(faceDir||1)*-20,y);g.stroke();
    g.fillStyle='#f4f4f4';g.beginPath();g.moveTo(x-9,y-48);g.quadraticCurveTo(x,y-26,x+9,y-48);g.fill();g.lineWidth=1.6;g.strokeStyle=O_;g.stroke();
  }
  if(n.look==='shop'){ // stall
    g.fillStyle='#8a5a30';g.fillRect(x+34,y-36,64,36);g.lineWidth=2.4;g.strokeStyle=O_;g.strokeRect(x+34,y-36,64,36);
    g.fillStyle='#c0283c';poly(g,[x+28,y-70,x+104,y-70,x+98,y-48,x+34,y-48],'#c0283c',O_,2.4);
    for(let i=0;i<3;i++){circ(g,x+46+i*18,y-42,6,['#e02a2a','#ffd83a','#3fae49'][i],O_,1.6)}
  }
  g.restore();
}
function drawMark(g,x,y,kind,t){
  if(!kind)return;
  const by=y-Math.abs(Math.sin(t*4))*5;
  g.save();g.textAlign='center';g.font='bold 26px sans-serif';g.lineWidth=5;g.strokeStyle='#1c1018';
  const ch=kind==='ready'?'?':kind==='new'?'!':'…',col=kind==='ready'?'#7aff9a':kind==='new'?'#ffe04a':'#cfd4e2';
  g.strokeText(ch,x,by);g.fillStyle=col;g.fillText(ch,x,by);g.restore();
}

/* ---------------- props ---------------- */
function drawDummy(g,d,t){
  const sh=d.shake>0?Math.sin(t*60)*4*d.shake*4:0;
  g.save();g.translate(d.x+sh,d.y);
  if(d.flash>0)g.globalAlpha=.7;
  g.fillStyle='#5a3a1c';g.fillRect(-4,-72,8,72);g.strokeStyle=O_;g.lineWidth=2;g.strokeRect(-4,-72,8,72);
  g.beginPath();g.roundRect(-30,-64,60,10,4);g.fillStyle='#8a5a30';g.fill();g.stroke();
  g.beginPath();g.roundRect(-14,-62,28,34,6);g.fillStyle='#d8b878';g.fill();g.stroke();
  g.strokeStyle='#8a6a38';g.lineWidth=1.4;for(const yy of[-54,-46,-38]){g.beginPath();g.moveTo(-12,yy);g.lineTo(12,yy);g.stroke()}
  circ(g,0,-80,13,'#e0c890',O_,2.2);circ(g,-4,-82,1.8,O_);circ(g,4,-82,1.8,O_);g.strokeStyle=O_;g.lineWidth=1.8;g.beginPath();g.moveTo(-4,-75);g.lineTo(4,-75);g.stroke();
  g.fillStyle='#c0283c';g.fillRect(-13,-90,26,4);
  g.fillStyle='#4a2c18';g.fillRect(-18,-3,36,6);
  g.restore();
  // hp bar
  if(d.hp<d.max){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(d.x-24,d.y-110,48,6);g.fillStyle='#ff5a5a';g.fillRect(d.x-23,d.y-109,46*d.hp/d.max,4)}
}
function drawCrate(g,b,t){
  g.save();g.translate(b.x,b.y);
  const sh=b.flash>0?Math.sin(t*70)*3:0;g.translate(sh,0);
  g.beginPath();g.roundRect(-22,-44,44,44,4);g.fillStyle='#b07a3c';g.fill();g.lineWidth=2.6;g.strokeStyle=O_;g.stroke();
  g.strokeStyle='#6a4420';g.lineWidth=2;g.beginPath();g.moveTo(-22,-14);g.lineTo(22,-14);g.moveTo(-22,-30);g.lineTo(22,-30);g.stroke();
  g.fillStyle='#4a4a58';for(const[a,c]of[[-17,-39],[17,-39],[-17,-5],[17,-5]])circ(g,a,c,2.2,'#4a4a58',O_,1);
  g.strokeStyle='#c0283c';g.lineWidth=3;g.beginPath();g.moveTo(-8,-30);g.lineTo(8,-14);g.moveTo(8,-30);g.lineTo(-8,-14);g.stroke();
  if(b.hp<b.max*.6){g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1.6;g.beginPath();g.moveTo(-10,-44);g.lineTo(-4,-30);g.lineTo(-12,-20);g.stroke()}
  g.restore();
}
function drawPlate(g,pl,on,prog,t,idx){
  const x=pl.x,y=pl.y,w=pl.w;
  g.save();
  const col=on?'#7aff9a':'#7ad0ff';
  const gr=g.createRadialGradient(x+w/2,y-2,4,x+w/2,y-2,w*.8);gr.addColorStop(0,col+'aa');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(x-20,y-60,w+40,70);
  g.beginPath();g.roundRect(x+4,y-6,w-8,8,3);g.fillStyle=on?'#2ab060':'#4a6ab0';g.fill();g.lineWidth=2.4;g.strokeStyle=O_;g.stroke();
  g.fillStyle=col;g.font='bold 15px sans-serif';g.textAlign='center';g.fillText('魂 '+(idx+1),x+w/2,y-12);
  for(let i=0;i<3;i++){const a=t*2+i*2.1;g.fillStyle=col;g.globalAlpha=.8;g.fillRect(x+w/2+Math.cos(a)*(w*.3)-1.5,y-26+Math.sin(a)*10-Math.abs(Math.sin(t*3+i))*14,3,3)}
  g.restore();
}
function drawEggKing(g,b,t){
  g.save();g.translate(b.x,b.y);
  if(b.flash>0)g.filter='brightness(2)';
  const rage=b.phase>1,an=b.anim;
  let sq=1,rot=0;
  if(an==='crouch'||an==='land')sq=.84;else if(an==='air')sq=1.1;
  if(an==='roll')rot=b.rot||0;
  ell(g,0,0,86,10,'rgba(0,0,0,.35)');
  g.translate(0,-96*sq);g.scale(1/sq,sq);g.rotate(rot);
  // shell
  if(rage){const gl=g.createRadialGradient(0,0,20,0,0,150);gl.addColorStop(0,'rgba(255,200,60,.4)');gl.addColorStop(1,'rgba(255,200,60,0)');g.fillStyle=gl;g.fillRect(-160,-160,320,320)}
  g.beginPath();g.ellipse(0,0,80,98,0,0,6.2832);
  const gr=g.createRadialGradient(-26,-34,10,0,0,100);gr.addColorStop(0,'#fffdf4');gr.addColorStop(.6,'#f4ead0');gr.addColorStop(1,'#cdb98a');
  g.fillStyle=gr;g.fill();g.lineWidth=4;g.strokeStyle=O_;g.stroke();
  // cracks
  g.strokeStyle='#7a6a48';g.lineWidth=2.4;g.beginPath();g.moveTo(-40,-86);g.lineTo(-28,-64);g.lineTo(-44,-50);g.lineTo(-30,-32);
  if(rage){g.moveTo(50,-70);g.lineTo(36,-48);g.lineTo(52,-34);g.lineTo(40,-14);g.moveTo(-60,20);g.lineTo(-44,34);g.lineTo(-54,52)}
  g.stroke();
  if(rage){g.fillStyle='#ffcf30';g.beginPath();g.moveTo(36,-48);g.lineTo(52,-34);g.lineTo(44,-40);g.fill()}
  // crown
  const cy=-96;poly(g,[-30,cy+8,-30,cy-14,-16,cy-2,0,cy-20,16,cy-2,30,cy-14,30,cy+8],'#ffd34a',O_,3);circ(g,0,cy-4,4,'#ff4a5a',O_,1.5);
  // face
  ell(g,-26,-14,16,18,'#fff',O_,3);ell(g,26,-14,16,18,'#fff',O_,3);
  circ(g,-22,-12,7,rage?'#c00000':'#2a1020');circ(g,22,-12,7,rage?'#c00000':'#2a1020');circ(g,-20,-15,2,'#fff');circ(g,24,-15,2,'#fff');
  g.strokeStyle=O_;g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(-46,-38);g.lineTo(-10,-26);g.moveTo(46,-38);g.lineTo(10,-26);g.stroke();
  g.beginPath();g.moveTo(-34,30);g.quadraticCurveTo(0,(an==='roar'||an==='land')?74:54,34,30);g.fillStyle='#3a0a14';g.fill();g.lineWidth=3.4;g.stroke();
  poly(g,[-24,34,-14,36,-20,48],'#fff',O_,1.8);poly(g,[24,34,14,36,20,48],'#fff',O_,1.8);
  g.rotate(-rot);
  g.restore();g.filter='none';
  // little limbs (not rotated)
  g.save();g.translate(b.x,b.y);
  const st=an==='walk'?Math.sin(t*10)*8:0;
  limb(g,-30,-8,-34+st,0,14,'#f4ead0');limb(g,30,-8,34-st,0,14,'#f4ead0');
  g.restore();
}
