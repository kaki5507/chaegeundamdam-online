'use strict';
/* ============================================================
   야채부락리 온라인 : 야채 무기 대모험  —  single-file canvas platformer
   ============================================================ */
const WSC=.6;
const W=960,H=540,GRAV=1900;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let SC=1;
function resize(){
  const f=Math.min(innerWidth/W,innerHeight/H),d=Math.min(window.devicePixelRatio||1,window.DPR_CAP||2);
  cv.style.width=Math.floor(W*f)+'px';cv.style.height=Math.floor(H*f)+'px';
  cv.width=Math.round(W*f*d);cv.height=Math.round(H*f*d);SC=f*d;
  // 세로 화면(폰)에선 글자를 키운다
  const port=innerHeight>innerWidth&&matchMedia('(pointer:coarse)').matches;window.TSC=port?Math.min(1.35,.86*Math.max(1,600/(W*f))):.86;window.WZ=port?1.4:1;
}
addEventListener('resize',resize);resize();

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const sgn=v=>v<0?-1:1;
const approach=(v,t,d)=>v<t?Math.min(t,v+d):Math.max(t,v-d);
const ov=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hash=n=>{n=Math.sin(n*127.1)*43758.5453;return n-Math.floor(n)};

/* ---------------- input ---------------- */
const keys={};let pressed={};
const K={
  left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD'],up:['ArrowUp','KeyW'],down:['ArrowDown','KeyS'],
  jump:['Space','AltLeft','AltRight','KeyK'],atk:['KeyZ','ControlLeft','ControlRight','KeyJ'],
  sk1:['KeyX'],sk2:['KeyC'],sk3:['KeyV'],ok:['Enter','Space'],pause:['KeyP','Escape'],mute:['KeyM']
};
const held=n=>K[n].some(c=>keys[c]);
const tap=n=>K[n].some(c=>pressed[c]);
const PREVENT=['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','AltLeft','AltRight','ControlLeft'];
addEventListener('keydown',e=>{
  if(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;   // 로그인 창 입력 중에는 게임 키 무시
  if(PREVENT.includes(e.code))e.preventDefault();
  if(!e.repeat)pressed[e.code]=true;
  keys[e.code]=true;initAudio();
});
addEventListener('keyup',e=>{if(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;keys[e.code]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
/* touch controls */
(function(){
  const box=document.getElementById('touch');
  if(!box)return;
  const coarse=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
  if(coarse)box.style.display='block';
  box.querySelectorAll('[data-k]').forEach(b=>{
    const code=b.dataset.k;
    const on=e=>{e.preventDefault();keys[code]=true;pressed[code]=true;b.classList.add('on');initAudio()};
    const off=e=>{e.preventDefault();keys[code]=false;b.classList.remove('on')};
    b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);
    b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);
  });
  cv.addEventListener('pointerdown',()=>{initAudio();if(G.state!=='play'){pressed['Enter']=true}});
})();

/* ---------------- audio ---------------- */
let AC=null,master=null,musGain=null,noiseBuf=null,muted=false;
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return}
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    master=AC.createGain();master.gain.value=.55;master.connect(AC.destination);
    musGain=AC.createGain();musGain.gain.value=.5;musGain.connect(master);
    noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    if(MUS.want)startMusic(MUS.theme);
  }catch(e){AC=null}
}
function tone(f,d,type='square',vol=.1,slide=0,delay=0,dest){
  if(!AC||muted)return;
  const t0=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t0);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(25,f+slide),t0+d);
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+d);
  o.connect(g);g.connect(dest||master);o.start(t0);o.stop(t0+d+.02);
}
function noise(d,vol=.1,freq=1000,delay=0,dest){
  if(!AC||muted||!noiseBuf)return;
  const t0=AC.currentTime+delay,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
  s.buffer=noiseBuf;f.type='bandpass';f.frequency.value=freq;f.Q.value=.8;
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+d);
  s.connect(f);f.connect(g);g.connect(dest||master);s.start(t0);s.stop(t0+d+.02);
}
const SFX={
  jump(){tone(320,.16,'square',.06,380)},
  land(){noise(.07,.07,450)},
  atk(){noise(.12,.09,2400);tone(240,.1,'sawtooth',.04,-140)},
  hit(){noise(.1,.16,900);tone(170,.1,'square',.09,-90)},
  crit(){noise(.14,.2,1500);tone(420,.16,'sawtooth',.09,-250)},
  hurt(){tone(210,.28,'sawtooth',.12,-150);noise(.16,.1,400)},
  skill(){tone(110,.55,'sawtooth',.12,320);noise(.45,.14,300)},
  throw(){tone(560,.12,'triangle',.07,-260)},
  pickup(){tone(660,.08,'square',.06);tone(990,.12,'square',.06,0,.07)},
  lvl(){[523,659,784,1046].forEach((f,i)=>tone(f,.28,'triangle',.11,0,i*.1))},
  roar(){tone(95,.95,'sawtooth',.16,-45);noise(.85,.12,220)},
  boom(){tone(75,.55,'sine',.24,-45);noise(.5,.2,260)},
  warn(){tone(880,.07,'square',.04)},
  fire(){tone(720,.22,'sawtooth',.045,-420)},
  die(){tone(320,.9,'sawtooth',.11,-260)},
  portal(){[392,523,659,784].forEach((f,i)=>tone(f,.45,'sine',.1,0,i*.08))},
  flag(){tone(523,.12,'triangle',.1);tone(784,.22,'triangle',.1,0,.1)},
  sel(){tone(620,.05,'square',.05)},
  beam(){tone(1200,.4,'sawtooth',.06,-900);noise(.3,.1,3000)},
};
function sfx(n){try{SFX[n]&&SFX[n]()}catch(e){}}

/* simple generative BGM : 평조 (pentatonic) + 장구 style percussion */
const MUS={timer:null,theme:'field',step:0,want:false};
const SCALES={field:[0,2,5,7,9],sky:[0,2,4,7,9],boss:[0,1,5,7,8]};
function mf(base,semi){return base*Math.pow(2,semi/12)}
function startMusic(theme){
  MUS.theme=theme;MUS.want=true;
  stopMusic(true);
  if(!AC)return;
  const bpm=theme==='boss'?156:theme==='sky'?112:98;
  MUS.step=0;
  MUS.timer=setInterval(()=>{try{musicStep()}catch(e){}},60000/bpm/2);
}
function stopMusic(keep){if(MUS.timer)clearInterval(MUS.timer);MUS.timer=null;if(!keep)MUS.want=false}
const PHRASES={
  field:[[0,2,4,2,3,1,2,-1],[4,3,2,0,1,2,3,-1],[0,0,2,4,5,4,2,-1],[3,2,1,0,2,-1,0,-1]],
  sky:[[2,4,5,4,2,1,0,-1],[0,2,4,6,5,4,2,-1],[4,5,6,5,4,2,4,-1],[0,-1,2,4,2,1,0,-1]],
  boss:[[0,0,1,0,3,2,1,0],[4,3,2,1,0,1,2,3],[0,2,0,3,0,4,3,1],[5,4,3,2,1,0,0,-1]]
};
function musicStep(){
  if(!AC||muted||G.paused)return;
  const th=MUS.theme,sc=SCALES[th],s=MUS.step++,bar=Math.floor(s/8)%4,i=s%8;
  const base=th==='boss'?146.8:th==='sky'?164.8:130.8;
  // bass
  if(i%4===0){const deg=[0,0,3,2][bar];tone(mf(base/2,sc[deg%5]),.34,'triangle',.16,0,0,musGain)}
  // percussion (장구 / 북)
  if(i===0||(th==='boss'&&i===4)||(i===4&&th!=='boss')){tone(120,.16,'sine',.3,-80,0,musGain)}
  if(i===2||i===6||(th==='boss'&&i%2===1))noise(.05,th==='boss'?.1:.07,3500,0,musGain);
  // melody (가야금 pluck)
  const ph=PHRASES[th][(bar+(Math.floor(s/32)%2))%4],n=ph[i];
  if(n>=0){const oct=n>=5?12:0;tone(mf(base*2,sc[n%5]+oct+(n>=5?0:0)),.42,'triangle',.13,0,0,musGain);
    if(th!=='boss'&&i%2===0)tone(mf(base*4,sc[n%5]),.2,'sine',.04,0,.02,musGain)}
  if(th==='boss'&&i===0)tone(mf(base,0),.9,'sawtooth',.035,-6,0,musGain);
}

/* ---------------- particles / text ---------------- */
const parts=[],texts=[];
function spark(x,y,n,col,spd=200,life=.5,size=3,grav=500,glow=false){
  for(let i=0;i<n;i++){
    const a=Math.random()*6.283,s=spd*(.3+Math.random()*.7);
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-spd*.2,life:life*(.6+Math.random()*.6),max:life,size:size*(.6+Math.random()*.8),col,grav,glow});
  }
  while(parts.length>900)parts.shift();
}
function dust(x,y,n=6,col='rgba(220,200,170,'){
  for(let i=0;i<n;i++)parts.push({x:x+rnd(-10,10),y,vx:rnd(-60,60),vy:rnd(-50,-10),life:.45,max:.45,size:rnd(3,6),col,grav:-20,soft:true});
}
function ftext(x,y,txt,col='#fff',size=18,life=.9){texts.push({x,y,txt,col,size,life,max:life,vy:-70})}
