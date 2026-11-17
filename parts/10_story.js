/* ============================================================
   STORY : 비석의 길 — 옴니버스 6화 + 에필로그
   각 화 = 점프맵(필드) · 던전(3웨이브) · 결말 보스.
   던전 2회 + 보스 처치 = 비석 균열 3/3 → "비석이 뚫렸습니다" → 다음 화 개방
   ============================================================ */
Object.assign(THEMES,{
 sea:{sun:1,sky:['#2a9aff','#6ac4ff','#b8e8ff','#fff0c8'],moon:{x:.8,y:.22,r:60,c:'#fff4d8',glow:'rgba(255,240,200,'},
   layers:[{k:'clouds',col:'#ffffff',base:.5,f:.05},{k:'ridge',col:'#3a8ad0',amp:40,base:.78,f:.12,cyc:[2,5,9]},{k:'clouds',col:'#e8f8ff',base:.95,f:.3}],
   grass:'#f0e0a8',grass2:'#b09a60',dirt:'#6a5a48',dirt2:'#4a3e32',stone:'#8a8a98',plank:'#9a7a50',plank2:'#5a4428',fly:'#bfe8ff'},
 bamboo:{sun:1,sky:['#7ad0ff','#b0e8d0','#e0f8c8','#fffbe0'],moon:{x:.3,y:.2,r:58,c:'#f4ffe0',glow:'rgba(220,255,200,'},
   layers:[{k:'ridge',col:'#8ad08a',amp:60,base:.6,f:.07,cyc:[2,4,9]},{k:'pines',col:'#5ab060',base:.86,f:.3,hh:[160,260],n:40},{k:'pines',col:'#3a9048',base:.98,f:.55,hh:[220,320],n:22}],
   grass:'#7ad06a',grass2:'#3a8a3a',dirt:'#4a3a24',dirt2:'#30261a',stone:'#6a7a6a',plank:'#a8b860',plank2:'#5a6a2a',fly:'#e8ffa0'},
 snow:{sun:1,sky:['#8ac8ff','#b8dcff','#e0f0ff','#ffffff'],moon:{x:.7,y:.24,r:66,c:'#ffffff',glow:'rgba(220,235,255,'},
   layers:[{k:'ridge',col:'#c8d8f0',amp:90,base:.58,f:.06,cyc:[2,3,7]},{k:'pines',col:'#7a9ac8',base:.86,f:.3,hh:[90,170],n:24},{k:'clouds',col:'#ffffff',base:1,f:.45}],
   grass:'#f4f8ff',grass2:'#b8c8e8',dirt:'#5a6080',dirt2:'#3a4060',stone:'#8a9ac0',plank:'#a8b0c8',plank2:'#606a88',fly:'#ffffff'},
 mask:{sun:1,sky:['#ff9a6a','#ffc080','#ffe0a0','#fff4d0'],moon:{x:.5,y:.22,r:80,c:'#ffd070',glow:'rgba(255,200,80,'},
   layers:[{k:'ridge',col:'#e08a6a',amp:70,base:.62,f:.06,cyc:[3,5,8]},{k:'gates',col:'#c04a3a',base:.9,f:.3},{k:'gates',col:'#902a2a',base:1,f:.5}],
   grass:'#e0a040',grass2:'#8a5a1a',dirt:'#4a2418',dirt2:'#2a140c',stone:'#7a5a50',plank:'#c05a3a',plank2:'#6a2a1a',fly:'#ffd070',lantern:true},
 bus:{sky:['#2a2a6a','#5a4aa0','#c07ab0','#ffb890'],moon:{x:.15,y:.18,r:40,c:'#c8d0ff',glow:'rgba(160,180,255,'},
   layers:[{k:'islands',col:'#4a3a80',base:.62,f:.08},{k:'ridge',col:'#3a2a68',amp:40,base:.82,f:.25,cyc:[5,7,13]}],
   grass:'#a0a0c0',grass2:'#6a6a90',dirt:'#4a4a6a',dirt2:'#34344e',stone:'#4a4a5a',plank:'#6a6a7a',plank2:'#2a2a38',fly:'#ffe070'},
 origin:{sky:['#7a6ae0','#a890ff','#e0c8ff','#fff0ff'],moon:{x:.5,y:.3,r:110,c:'#e8d8ff',glow:'rgba(200,170,255,'},
   layers:[{k:'clouds',col:'#ffffff',base:.55,f:.05},{k:'islands',col:'#9a80e0',base:.7,f:.12},{k:'gates',col:'#7a5ac0',base:.98,f:.45}],
   grass:'#d8c0ff',grass2:'#8a6ad0',dirt:'#5a4a8a',dirt2:'#40346a',stone:'#6a5a8a',plank:'#8a6ac0',plank2:'#3a2a5a',fly:'#e8d8ff'},
});

const CH=[null,
 {title:'시금치 등대지기',lv:15,theme:'sea',ms:2.6,dm:1.4,bhp:8000,hue:170,place:'파도 절벽 등대',dg:'등대 지하 창고',item:'소금 결정',pre:'바다',
  boss:{base:'dokkaebi',name:'물귀신 대왕',hue:180},types:['egg','wisp']},
 {title:'대나무숲의 거짓말',lv:25,theme:'bamboo',ms:3.6,dm:1.9,bhp:15000,hue:80,place:'속삭이는 대숲',dg:'거짓말이 자라는 숲속',item:'거짓말 죽순',pre:'대나무',
  boss:{base:'fox',name:'거짓말 여우',hue:90},types:['egg','wisp','baby']},
 {title:'얼어붙은 장터',lv:35,theme:'snow',ms:4.8,dm:2.5,bhp:26000,hue:190,place:'눈 그치지 않는 장터',dg:'얼음 골목',item:'언 배춧잎',pre:'서리',
  boss:{base:'eggking',name:'서리 달걀 대왕',hue:170},types:['egg','baby']},
 {title:'종이탈 무도회',lv:50,theme:'mask',ms:6.5,dm:3.3,bhp:45000,hue:300,place:'탈춤 마당',dg:'가면 창고',item:'찢어진 탈 조각',pre:'탈춤',
  boss:{base:'dokkaebi',name:'말뚝이 탈 도깨비',hue:260},types:['egg','wisp','baby']},
 {title:'막차, 저승행',lv:60,theme:'bus',ms:8,dm:4,bhp:62000,hue:230,place:'자정의 정류장',dg:'막차 뒤칸',item:'구겨진 승차권',pre:'막차',
  boss:{base:'fox',name:'저승 차사 구미호',hue:320},types:['wisp','egg','baby']},
 {title:'순무, 첫 번째 이름',lv:75,theme:'origin',ms:10,dm:5,bhp:90000,hue:260,place:'이름 없는 언덕',dg:'이야기의 조각들',item:'이름 조각',pre:'첫 이름',
  boss:{base:'guimok',name:'이름 없는 귀목',hue:230},types:['egg','wisp','baby']},
];
// 등장인물 외형 (drawNPC · 컷신 초상화 공용)
const NPC_LOOK_X={
 dol:{job:'priest',eq:{hat:'hat_gat',outfit:'out_hanbok'},n:'돌할매'},
 c1:{job:'warrior',eq:{hat:'hat_gat',outfit:'out_vest',cape:'cape_blue'},n:'등대지기 시금치 영감'},
 c2:{job:'archer',eq:{hat:'hat_flower',outfit:'out_tank'},n:'죽순 소년'},
 c3:{job:'guardian',eq:{hat:'hat_flower',outfit:'out_hanbok'},n:'배추 할머니'},
 c4:{job:'mage',eq:{face:'face_mask',outfit:'out_dobok',cape:'cape_red'},n:'연근 광대'},
 c5:{job:'gunner',eq:{face:'face_sun',outfit:'out_dobok'},n:'감자 회사원'},
 c6:{job:'priest',eq:{hat:'hat_flower'},n:'어린 순무'},
};
for(let c=1;c<=6;c++){CH[c].hero=NPC_LOOK_X['c'+c];GIVER_NAME['c'+c]=NPC_LOOK_X['c'+c].n;ETC_NAME['ci'+c]=CH[c].item}
GIVER_NAME.dol='돌할매';

/* ---------- 이야기별 장비 (등급↑ = 드랍률↓, 결말 퀘스트 보상이 가장 좋다) ---------- */
const CH_ARMOR=[null,'그물 갑옷','대나무 갑주','솜누비 갑옷','무도회 도포','운전수 제복','비석 갑옷'];
const CH_MEMO=[null,'등대지기의 램프','거짓말 대나무 피리','할머니의 김장 보자기','얼굴 없는 탈','마지막 승차권','첫 번째 이름'];
const WT_NOUN={sword:'검',twohand:'대검',knuckle:'너클',bow:'장궁',gun:'총',staff:'스태프',wand:'완드',dagger:'단검',shield:'방패',book:'마도서',offdagger:'보조 단검'};
for(let c=1;c<=6;c++){
  const C=CH[c],L=C.lv,gr=c<=2?2:3,base=10+c*4,drops=[];
  for(const wt in WT_NOUN){const w=WT[wt],id='w'+c+wt,lh=w.lh;
    GEAR[id]={wt,slot:lh?'lh':'rh',n:C.pre+'의 '+WT_NOUN[wt],gr,atk:Math.round(lh?base*.35:base*(w.h2?1.3:1)),hp:lh&&wt==='shield'?8+c*3:0,mp:wt==='book'?8+c*3:0,req:{lv:L,[w.st]:Math.round(L*2.4)}};
    drops.push([id,(gr>=3?.012:.03)]);}
  GEAR['a'+c]={slot:'armor',n:CH_ARMOR[c],gr:Math.max(1,gr-1),hp:12+c*5,atk:2+c,req:{lv:L}};drops.push(['a'+c,.08]);
  GEAR['r'+c]={slot:'acc',n:C.pre+'의 반지',gr,atk:4+c*2,hp:4+c*2,req:{lv:L}};drops.push(['r'+c,.02]);
  GEAR['m'+c]={slot:'acc',n:CH_MEMO[c],gr:c>=5?4:3,atk:8+c*3,hp:8+c*4,mp:5+c*3,spd:c>=4?4:2,quest:1,req:{lv:L}};
  GEAR_DROP['sb'+c]=drops;
}
GEAR.mfinal={slot:'acc',n:'순무의 비석 목걸이',gr:4,atk:30,hp:40,mp:30,spd:6,quest:1,req:{lv:75}};

/* ---------- 보스 ---------- */
const STORY_BOSS={};
for(let c=1;c<=6;c++){const B=CH[c].boss;STORY_BOSS['sb'+c]={base:B.base,name:B.name,hue:B.hue,hp:CH[c].bhp,c};BOSS_REW['sb'+c]={pct:.35,coin:900*c,pool:[]}}
function mkStoryBoss(id,SB){
  const b=mkBoss(SB.base),sc=1+.45*(PARTY.length-1),target=Math.round(SB.hp*sc),f=target/b.max;
  b.hp=b.max=target;b.trial=false;b.sid=id;b.name=SB.name;b.hue=SB.hue;b.cdmg*=CH[SB.c].dm;
  for(const m of S.mobs)if(m.type==='arm'){m.hp=m.max=Math.round(m.max*f)}
  return b;
}

/* ---------- 퀘스트 (화마다 4개 + 에필로그) ---------- */
for(let c=1;c<=6;c++){
  const C=CH[c],L=C.lv,id='c'+c,pre=c===1?[]:['c'+(c-1)+'d'];
  QUESTS[id+'a']={name:'제'+c+'화 · 프롤로그',giver:id,min:L,pre,story:c,desc:'「'+C.title+'」\n'+C.place+'까지 가는 길(점프맵)을 돌파하라. 비석에서 입장할 수 있다.',objs:[{t:'reach',map:'ch'+c+'f',label:C.place+' 도착'}],rew:{pct:.2,coin:200*c},sceneA:id+'a'};
  QUESTS[id+'b']={name:'제'+c+'화 · '+C.dg,giver:id,min:L,pre:[id+'a'],story:c,desc:'던전 「'+C.dg+'」의 세 웨이브를 모두 버텨라.',objs:[{t:'dg',ch:c,n:1,label:C.dg+' 클리어'}],rew:{pct:.3,coin:300*c},sceneA:id+'b'};
  QUESTS[id+'c']={name:'제'+c+'화 · 사이드 「'+C.item+'」',giver:id,min:L,pre:[id+'a'],story:c,desc:C.hero.n+'의 부탁. 이 이야기의 몬스터를 물리치고 '+C.item+'을(를) 모아 달라.',
    objs:[{t:'kill',mob:'any',map:'ch'+c,n:40,label:'이 이야기의 몬스터 처치'},{t:'collect',item:'ci'+c,n:10,label:C.item+' (몬스터 25%)'}],rew:{pct:.3,coin:400*c}};
  QUESTS[id+'d']={name:'제'+c+'화 · 결말',giver:id,min:L,pre:[id+'b'],story:c,desc:C.boss.name+'을(를) 쓰러뜨려 이야기를 끝내라.\n(던전 1회 클리어 후 비석에서 결말에 입장)',objs:[{t:'boss',id:'sb'+c,label:C.boss.name+' 처치'}],rew:{pct:.5,coin:800*c,gear:'m'+c},sceneB:id+'e'};
}
QUESTS.c7={name:'에필로그 · 일곱 번째 빛',giver:'dol',min:75,pre:['c6d'],desc:'모든 비석이 열렸다. 돌할매의 마지막 이야기를 들어라.',objs:[{t:'lvl',n:75,label:'Lv.75 달성'}],rew:{pct:.3,coin:20000,gear:'mfinal'},sceneB:'fin'};

/* ---------- 컷신 대본 ---------- */
const SCENES={
 hub:[['T','비석의 길','끝나지 못한 이야기들이 잠든 곳'],['dol','어서 오게, 손님. 여긴 비석의 길이야. 끝나지 못한 이야기들이 잠든 곳이지.'],['dol','비석마다 이야기가 하나씩 갇혀 있단다. 이야기의 던전을 두 번 넘고, 결말의 주인을 쓰러뜨리면…'],['dol','비석이 뚫리지. 그 너머로 다음 이야기가 열리고.'],['dol','자, 첫 번째 비석 앞에 서 보게. 바다 냄새가 날 거야.']],
 c1a:[['T','제1화','시금치 등대지기'],['dol','첫 번째 비석엔 바다 냄새가 배어 있지. 매일 밤 불을 켜는 늙은 등대지기 이야기란다.'],['c1','…손님이 왔구먼. 미안하네, 해가 지기 전에 등대에 올라야 해서.'],['c1','삼십 년째 기다리는 배가 있다네. 불이 꺼지면 그 배가 길을 잃어.'],['c1','헌데 요즘 밤마다 불꽃 요정이 몰려와 불을 훔쳐 가. 절벽 위 등대까지, 같이 가 주겠나?']],
 c1b:[['c1','등대 지하 창고에 불꽃 요정 둥지가 있어. 저놈들을 쫓아내야 불이 산다네.'],['N','— 기름 냄새와 짠 바람. 창고 문이 삐걱, 열린다.']],
 c1e:[['N','물귀신 대왕이 쓰러지자, 바다가 거짓말처럼 잠잠해졌다.'],['c1','…그래. 이제야 알겠군. 그 배는 삼십 년 전에 가라앉았지.'],['c1','그리고 나도, 그날 그 배에 타고 있었어.'],['me','그럼 지금까지 불을 켠 건…'],['c1','아직 바다에 나가 있는 다른 배들을 위해서였나 보네. 기다리는 사람이 있는 배들 말이야.'],['c1','고맙네, 젊은이. 오늘 밤 불은 자네가 켜 주게.'],['N','등대에 불이 들어오고, 영감의 모습은 물안개처럼 흩어졌다.'],['dol','…첫 번째 이야기가 끝났구나. 비석에 금이 갔을 게다.']],
 c2a:[['T','제2화','대나무숲의 거짓말'],['dol','두 번째 비석은 대나무 숲이야. 그 숲에선 거짓말을 하면 대나무가 한 마디씩 자란단다.'],['c2','형아, 이 숲엔 들어오면 안 돼! …아, 아니야. 들어와도 돼. 진짜야.'],['N','— 소년이 말할 때마다, 대나무가 삐걱이며 한 마디씩 자란다.'],['c2','우리 엄마는 장에 갔어. 곧 돌아와. …진짜로.'],['N','— 숲 전체가, 소리 없이 한 뼘 자랐다.']],
 c2b:[['c2','숲 한가운데서 거짓말이 너무 자라서 요괴가 됐대. 동생이 거기 갇혔어. …이건 진짜야.']],
 c2e:[['N','거짓말 여우가 쓰러지자, 대나무들이 일제히 고개를 숙였다.'],['c2','…엄마는 안 돌아와. 작년 겨울에, 산 너머로 갔어.'],['c2','동생이 울까 봐 매일 곧 온다고 했어. 그게 숲을 이렇게 만든 거야.'],['me','그 거짓말은 동생을 지키려고 한 거잖아.'],['c2','응. 그래도 이제는 진짜를 말해 줄래. 같이 울어 줄 거야.'],['N','— 처음으로, 숲이 한 마디도 자라지 않았다.'],['dol','거짓말보다 무거운 건 혼자 품은 진실이지. 두 번째 이야기도 끝났구나.']],
 c3a:[['T','제3화','얼어붙은 장터'],['dol','세 번째 비석은 겨울이 끝나지 않는 장터야. 시계도, 사람도, 김치도 얼어붙었지.'],['c3','어서 와요, 총각. 김장 배추 사러 왔수? …아이고, 손님이 얼마 만이야.'],['c3','이 장터는 눈이 그치질 않아. 장꾼들도 다 얼음이 돼 버렸어.'],['c3','나도 손녀한테 보낼 김장을 아직 못 부쳤는데, 우체국 가는 길이 얼음 귀신 천지야.']],
 c3b:[['c3','우체국 가는 골목이 꽁꽁 얼었어. 얼음 귀신들을 좀 녹여 주구려.']],
 c3e:[['N','서리 달걀 대왕이 깨지자, 처마 끝 고드름에서 물방울이 떨어졌다.'],['c3','…총각, 이 보자기 좀 대신 부쳐 주겠수? 우리 손녀, 서울 산다우.'],['c3','그 애가 내 김치 아니면 밥을 안 먹었어. 지금은 다 컸겠지.'],['me','꼭 전해 드릴게요.'],['c3','됐어, 됐어. 이제 장터 문 닫아도 되겠네.'],['N','— 눈이 그쳤다. 얼어 있던 장꾼들이 하나둘 기지개를 켜며 흩어졌다.'],['dol','기다림은 얼음처럼 시간을 붙잡지. 전해 주면 녹는 법이란다.']],
 c4a:[['T','제4화','종이탈 무도회'],['dol','네 번째 비석엔 탈춤 마당이 있어. 한번 탈을 쓰면 벗을 수 없는 무도회지.'],['c4','쉿, 쉿! 박자를 놓치면 탈이 얼굴을 먹어 버려요.'],['c4','나는 연근 광대. 보다시피 얼굴에 구멍이 숭숭… 하하, 농담이에요. 농담이었으면 좋겠네.'],['c4','말뚝이 탈 도깨비가 무도회를 끝내지 못하게 해요. 춤이 끝나야 다들 집에 가는데.']],
 c4b:[['c4','가면 창고에 탈 귀신들이 숨어 있어요. 장단에 맞춰, 하나, 둘!']],
 c4e:[['N','말뚝이 탈이 반으로 갈라지며, 마당의 장단이 멈췄다.'],['c4','…이제 탈을 벗을 수 있겠네요.'],['N','— 광대가 탈을 벗는다. 그 아래엔, 아무것도 없었다.'],['c4','알고 있었어요. 나는 탈 그 자체였다는 걸. 얼굴은 처음부터 없었어요.'],['me','그래도 아까 그 춤은 진짜였어.'],['c4','…그 말, 오래 기억할게요.'],['dol','얼굴이 없어도 마음은 있었지. 그걸로 충분하단다.']],
 c5a:[['T','제5화','막차, 저승행'],['dol','다섯 번째 비석은 자정의 버스 정류장이야. 그 버스엔 종점이 없지.'],['c5','아, 혹시 이 버스 강남 가요? 야근하다 막차를 겨우 탔는데…'],['c5','근데 이상해요. 승객들이 다 창백하고, 정류장 이름이 다 처음 보는 거예요.'],['c5','기사님도 대답을 안 해요. 저… 내려야 할 것 같은데, 문이 안 열려요.']],
 c5b:[['c5','뒤칸에 차사들이 타 있어요! 저 사람들이 문을 잠갔어요!']],
 c5e:[['N','저승 차사 구미호가 사라지자, 버스가 덜컹 멈춰 섰다.'],['c5','…사실 알고 있었어요. 저도 귀신인 줄 알았거든요. 매일 그렇게 살았으니까.'],['me','아니야. 넌 살아 있어. 이 버스에 타면 안 되는 사람이야.'],['c5','…진짜요? 그럼 저, 내일 출근해도 되는 거예요?'],['N','— 문이 열리고, 저 멀리 새벽 첫차의 불빛이 보였다.'],['c5','다음엔 꼭 칼퇴할게요. 고마워요!'],['dol','지친 산 사람은 가끔 귀신보다 길을 더 잘 잃는단다.']],
 c6a:[['T','제6화','순무, 첫 번째 이름'],['dol','…마지막 비석이구나. 이건, 내 이야기야.'],['dol','나는 이 길에서 수많은 이야기를 붙잡아 두었지. 끝나면 다들 떠나 버리니까.'],['c6','할매, 이제 그만 놓아줘. 나까지 붙잡고 있잖아.'],['dol','…저 아이는 어릴 적의 나야. 이름을 잃어버린 채로.'],['dol','가장 깊은 곳에, 내 이름을 삼킨 귀목이 있어. 부탁하마.']],
 c6b:[['c6','저기, 다섯 이야기의 조각들이 길을 막고 있어. 다들 아직 할매를 걱정하나 봐.']],
 c6e:[['N','이름 없는 귀목이 쓰러지자, 일곱 번째 빛이 비석의 길을 가득 채웠다.'],['c1','불은 잘 켜고 있다네.'],['c2','이제 거짓말 안 해요. 진짜로요.'],['c3','김치, 잘 받았대.'],['c4','박자, 안 놓쳤어요.'],['c5','오늘 칼퇴했어요!'],['c6','할매, 이름… 생각나?'],['dol','…그래. 순무. 내 이름은 순무였어.']],
 fin:[['T','에필로그','일곱 번째 빛'],['dol','고맙다, 이야기를 끝까지 들어 준 손님.'],['dol','이야기는 끝나야 비로소 누군가의 기억이 된단다. 이제 이 길은 네 것이야.'],['N','— 채근담담 온라인 · 야채 무기 대모험'],['N','— 비석의 길  完']],
};

/* ---------- 맵 ---------- */
function genField(c){
  const C=CH[c],r=mulberry(500+c*37),Hh=1000,seq=['n','c','m','n','v','n','c','n','m','n'];
  const L=newL({id:'ch'+c+'f',name:C.place,sub:'제'+c+'화 「'+C.title+'」 · 점프맵',theme:C.theme,music:'sky',w:0,h:Hh,killY:Hh+90,mscale:C.ms,pit:true,ch:c,mhue:C.hue,dmul:C.dm});
  let y=720;L.plats.push(plat(-300,y,660,400,'s'));L.spawn={x:200,y};
  let cur={x:0,w:360,y},x=360;const N=24+c*2;
  for(let i=0;i<N;i++){
    const k=i<2?'n':seq[(i*3+c)%seq.length];let nx,w,ny;
    if(k==='m'){const gap=240;w=130;ny=cur.y-10;
      L.plats.push(plat(x+gap/2-50,cur.y-4,100,16,'o',{mv:{x0:x+gap/2-50,y0:cur.y-4,ax:gap/2-62,ay:0,sp:.95+c*.04,ph:r()*6}}));nx=x+gap;L.plats.push(plat(nx,ny,w,16,'o'))}
    else if(k==='v'){const up=cur.y>=560,dist=170;w=130;ny=up?cur.y-dist:cur.y+dist;const y0=up?cur.y-dist/2:cur.y+dist/2;
      L.plats.push(plat(x+40,y0,110,16,'o',{mv:{x0:x+40,y0,ax:0,ay:dist/2,sp:1.1,ph:up?Math.PI:0}}));nx=x+190;L.plats.push(plat(nx,ny,w,16,'o'))}
    else{const gap=36+r()*44;w=Math.round(110+r()*80);ny=clamp(cur.y+Math.round(-62+r()*110),340,820);nx=x+gap;
      const cr=k==='c'&&c>=2;L.plats.push(plat(nx,ny,w,16,'o',cr?{crumble:{timer:0,fall:false,fy:0,back:0}}:{}));
      if(!cr&&w>=150&&i%3===0)L.spikes.push({x:nx+w/2-22,y:ny,w:44});
      else if(!cr&&w>=140)L.mobs.push([C.types.includes('egg')?'egg':'wisp',nx+w/2,ny,nx+14,nx+w-14]);
      if(i%3===1)L.mobs.push(['wisp',nx+w/2,ny-110,80]);
      if(i%4===2&&c>=3)L.drops.push({x:nx+w/2,y:Math.max(60,ny-330),period:3+r(),ph:r()*3});}
    if(i===Math.floor(N/2))L.flags.push({x:nx+w/2,y:ny});
    cur={x:nx,w,y:ny};x=nx+w;
  }
  const ex=x+60;L.plats.push(plat(ex,cur.y,500,400,'s'));
  L.portals.push({x:ex+250,y:cur.y,to:'stele',label:'비석의 길로',reach:'ch'+c+'f'});
  L.w=ex+620;return L;
}
function genDg(c){
  const C=CH[c],r=mulberry(900+c*13);
  const L=arenaBase({id:'ch'+c+'d',name:C.dg,sub:'제'+c+'화 · 던전 — 세 웨이브를 버텨라!',theme:C.theme,music:'boss',mscale:C.ms,ch:c,mhue:C.hue,dmul:C.dm});
  const lay=[[120,350,220],[940,350,220],[520,250,240],[300,180,120],[860,180,120]];
  lay.slice(0,3+(c%3)).forEach(([x,y,w])=>L.plats.push(plat(x+Math.round((r()-.5)*40),y,w,14,'o')));
  L.dg={waves:[{n:8+c,max:6,every:1.1,types:C.types},{n:11+c*2,max:8,every:.9,types:C.types},{n:14+c*2,max:9,every:.8,types:C.types.concat(['baby'])}]};
  return L;
}
function genBossMap(c){
  const C=CH[c];
  const L=arenaBase({id:'ch'+c+'b',name:C.boss.name,sub:'제'+c+'화 「'+C.title+'」 · 결말',theme:C.theme,music:'boss',boss:'sb'+c,ch:c,dmul:C.dm,mscale:C.ms,mhue:C.hue});
  if(C.boss.base==='fox')L.plats.push(plat(110,360,300,14,'o'),plat(870,360,300,14,'o'),plat(500,250,280,14,'o'));
  else if(C.boss.base==='guimok')L.plats.push(plat(300,370,170,14,'o'),plat(810,370,170,14,'o'),plat(470,270,340,14,'o'),plat(130,285,150,14,'o'),plat(1000,285,150,14,'o'));
  else L.plats.push(plat(120,350,200,14,'o'),plat(960,350,200,14,'o'),plat(540,255,200,14,'o'));
  return L;
}
const chAvail=c=>c>=1&&c<=6&&SAVE.lvl>=CH[c].lv&&(c===1||steleOpen(c-1));
const steleOpen=c=>!!(SAVE.stele&&SAVE.stele[c]);
const cracks=c=>Math.min(2,(SAVE.dg&&SAVE.dg[c])||0)+(SAVE.cleared['sb'+c]?1:0);
function buildStele(){
  const gy=470,Wd=2560;
  const L=newL({id:'stele',name:'비석의 길',sub:'끝나지 못한 이야기들이 잠든 곳',theme:'origin',music:'field',w:Wd,h:540,town:true,hub:true,spawn:{x:170,y:gy}});
  L.plats.push(plat(-300,gy,Wd+600,300,'s'));
  L.portals=[{x:70,y:gy,to:'town',label:'야채마을'}];
  L.steles=[];for(let c=1;c<=6;c++)L.steles.push({c,x:560+(c-1)*330,y:gy});
  L.npcs=[{id:'dol',name:'돌할매',x:330,gy,look:'dol',tag:'비석지기'}];
  for(let c=1;c<=6;c++)if(chAvail(c))L.npcs.push({id:'c'+c,name:CH[c].hero.n,x:560+(c-1)*330+120,gy,look:'c'+c});
  return L;
}
for(let c=1;c<=6;c++){const k=c;MAPS['ch'+c+'f']=()=>genField(k);MAPS['ch'+c+'d']=()=>genDg(k);MAPS['ch'+c+'b']=()=>genBossMap(k)}
MAPS.stele=buildStele;

/* ---------- 비석 ---------- */
function steleCheck(c){
  if(steleOpen(c)||cracks(c)<3)return;
  SAVE.stele[c]=true;saveGame();sfx('roar');S.shake=26;
  G.bigBanner={t0:G.t,title:'제'+c+'화의 비석이 뚫렸습니다!',sub:c<6?'제'+(c+1)+'화 「'+CH[c+1].title+'」 로 가는 길이 열렸다 (권장 Lv.'+CH[c+1].lv+')':'모든 비석이 열렸다… 돌할매를 찾아가자',col:'#ffe04a'};
}
function steleMenu(c){
  const C=CH[c],nm='제'+c+'화의 비석';
  if(!chAvail(c)){openDialog(nm,'굳게 봉인된 비석이다. 표면에 「'+C.title+'」 라고 희미하게 새겨져 있다.\n\n· 필요 레벨  Lv.'+C.lv+'  (현재 Lv.'+SAVE.lvl+')'+(c>1?'\n· 제'+(c-1)+'화의 비석이 뚫려야 한다'+(steleOpen(c-1)?' ✔':''):''),[{t:'닫기',fn:closeUI}]);return}
  const cr=cracks(c),fOK=SAVE.cleared['ch'+c+'f'],nd=(SAVE.dg[c]||0),opts=[];
  opts.push({t:'점프맵 · '+C.place+(fOK?' ✔':''),fn:()=>{closeUI();goMap('ch'+c+'f')}});
  opts.push({t:fOK?'던전 · '+C.dg+' ('+nd+'회)':'던전 · 🔒 점프맵 끝 도달 필요',fn:()=>{if(!fOK){G.toast('먼저 '+C.place+'까지 가야 한다');return}closeUI();goMap('ch'+c+'d')}});
  opts.push({t:nd>=1?'결말 · '+C.boss.name+(SAVE.cleared['sb'+c]?' ✔':''):'결말 · 🔒 던전 1회 클리어 필요',fn:()=>{if(nd<1){G.toast('던전을 먼저 클리어해야 한다');return}closeUI();goMap('ch'+c+'b')}});
  opts.push({t:'프롤로그 다시 보기',fn:()=>playScene('c'+c+'a',()=>steleMenu(c))});
  if(SAVE.cleared['sb'+c])opts.push({t:'결말 다시 보기',fn:()=>playScene('c'+c+'e',()=>steleMenu(c))});
  opts.push({t:'닫기',fn:closeUI});
  openDialog(nm,'제'+c+'화 「'+C.title+'」   권장 Lv.'+C.lv+'+\n\n비석 균열   '+'●'.repeat(cr)+'○'.repeat(3-cr)+(steleOpen(c)?'   — 뚫림!':'')+'\n· 던전 '+Math.min(nd,2)+'/2회   · 결말 보스 '+(SAVE.cleared['sb'+c]?'1':'0')+'/1\n\n이야기의 주인공 「'+C.hero.n+'」 이(가) 비석 옆에서 기다린다.',opts);
}
function dolMenu(n){
  const open=[1,2,3,4,5,6].filter(steleOpen).length;
  questMenu(n,'dol','비석 '+open+' / 6 개가 뚫렸구나.\n'+(open<6?'다음 이야기는 제'+(open+1)+'화 「'+CH[open+1].title+'」 (권장 Lv.'+CH[open+1].lv+').':'이제 남은 건 에필로그뿐이야.')+'\n\n· 비석 앞에서 ↑ : 점프맵 / 던전 / 결말 입장\n· 던전 2회 + 결말 보스 = 비석이 뚫린다');
  G.dlg.opts.splice(G.dlg.opts.length-1,0,{t:'비석의 길 이야기 다시 듣기',fn:()=>playScene('hub',()=>dolMenu(n))});
}

/* ---------- 던전 웨이브 ---------- */
function dgInit(){S.dg={w:0,killed:0,spawned:0,spT:1.2,pause:1.5,done:false};G.bigBanner={t0:G.t,title:'WAVE 1 / 3',sub:S.L.name,col:'#ffb060'}}
function storyStep(dt){
  const L=S.L;if(!L.dg||!S.dg||S.dg.done)return;
  const d=S.dg,w=L.dg.waves[d.w];
  if(d.pause>0){d.pause-=dt;return}
  d.spT-=dt;
  const alv=S.mobs.filter(m=>m.dgMob&&!m.dead).length;
  if(d.spawned<w.n&&alv<w.max&&d.spT<=0){
    d.spT=w.every;d.spawned++;const type=w.types[Math.random()*w.types.length|0],x=Math.random()<.5?60:L.w-60;
    const o={chase:true,dgMob:true,hue:L.mhue};
    if(type==='wisp')spawnMob('wisp',x,rnd(200,360),Object.assign(o,{range:30}));else spawnMob(type,x,440,o);
    spark(x,400,10,'#cfa8ff',160,.5,3,0,true);
  }
  // 낙오한 몹 보정 (맵 밖으로 사라진 경우)
  if(d.spawned>=w.n&&alv===0&&d.killed<w.n)d.killed=w.n;
  if(d.killed>=w.n){
    d.w++;d.killed=0;d.spawned=0;
    if(d.w>=L.dg.waves.length)dgClear();
    else{d.pause=1.8;G.bigBanner={t0:G.t,title:'WAVE '+(d.w+1)+' / 3',sub:d.w===2?'마지막 웨이브!':'',col:'#ffb060'};sfx('roar')}
  }
}
function dgClear(){
  const L=S.L,c=L.ch,C=CH[c];S.dg.done=true;
  for(const m of S.mobs)if(!m.dead){m.dead=true;spark(m.x,m.y-10,10,'#cfa8ff',200,.5,3,0,true)}
  SAVE.dg[c]=(SAVE.dg[c]||0)+1;
  const ex=Math.max(20,Math.round(need(SAVE.lvl)*.12*bossPct(SAVE.lvl))),cn=250*c;gainExp(ex);addCoins(cn);
  qev('dg',{ch:c});
  const lines=['경험치 +'+ex,'야채코인 +'+cn,'던전 클리어 '+SAVE.dg[c]+'회','비석 균열 '+cracks(c)+' / 3'];
  saveGame();
  G.clear={title:C.dg+' 클리어!',lines};G.state='clear';
  steleCheck(c);
}

/* ---------- 컷신 (레터박스 · 타자기 효과) ---------- */
function playScene(key,cb){const lines=SCENES[key];if(!lines){cb&&cb();return}G.ui='scene';G.scene={lines,i:0,ch:0,cb,t:0};pressed={};sfx('sel')}
function sceneEnd(){const cb=G.scene&&G.scene.cb;G.scene=null;G.ui=null;pressed={};if(cb)cb()}
function sceneUpdate(dt){
  const sc=G.scene;if(!sc)return;sc.t+=dt;
  const ln=sc.lines[sc.i],len=ln[0]==='T'?1:ln[1].length;sc.ch+=dt*(ln[0]==='T'?1:38);
  if(pressed.Escape){sceneEnd();return}
  const adv=pressed.Enter||pressed.Space||pressed.KeyZ||pressed.ArrowUp;
  if(adv||(ln[0]==='T'&&sc.ch>2.6)){
    if(ln[0]!=='T'&&sc.ch<len){sc.ch=len;return}
    sc.i++;sc.ch=0;sfx('sel');if(sc.i>=sc.lines.length)sceneEnd();
  }
}
function drawScene(g,t){
  const sc=G.scene;if(!sc)return;const ln=sc.lines[sc.i];if(!ln)return;
  g.fillStyle='rgba(6,2,14,.55)';g.fillRect(0,0,W,H);
  const bar=56;g.fillStyle='#000';g.fillRect(0,0,W,bar);g.fillRect(0,H-bar,W,bar);
  if(ln[0]==='T'){
    const a=clamp(Math.min(sc.ch*2,(2.6-sc.ch)*2),0,1);g.globalAlpha=a;
    txt(g,ln[1],W/2,H/2-20,24,'#cfd4e2','center',3);txt(g,'「'+ln[2]+'」',W/2,H/2+28,40,'#ffe9a0','center',5);
    g.fillStyle='#ffe9a0';g.fillRect(W/2-120,H/2+48,240,2);g.globalAlpha=1;
    txt(g,'Esc 건너뛰기',W-16,H-22,12,'#888','right',0);return;
  }
  const who=ln[0],isMe=who==='me',narr=who==='N';
  // 초상화
  if(!narr){
    const L=isMe?{job:SAVE.job,eq:PARTY[0]?PARTY[0].eq:{},n:'나'}:NPC_LOOK_X[who];
    if(L){const x=isMe?W-150:150;g.save();g.translate(x,H-bar-8);g.scale(2.6,2.6);
      drawVeggie(g,JOB[L.job],{x:0,y:0,face:isMe?-1:1,t,st:'idle',eq:L.eq,tier:isMe?SAVE.tier:1});g.restore()}
  }
  const bx=narr?120:isMe?60:260,bw=narr?720:640,by=H-bar-150;
  panel(g,bx,by,bw,130,.9);
  if(!narr){const nm=isMe?'나':(NPC_LOOK_X[who]||{n:who}).n;g.font=F(16);const w=g.measureText(nm).width;g.fillStyle='#ffd34a';g.beginPath();g.roundRect(bx+18,by-16,w+28,28,8);g.fill();txt(g,nm,bx+32,by+4,16,'#2a1a00','left',0)}
  const shown=ln[1].slice(0,Math.floor(sc.ch));
  wrap(g,shown,bw-48,18).slice(0,4).forEach((l,i)=>txt(g,l,bx+24,by+42+i*26,18,narr?'#e8e0ff':'#fff','left',2));
  if(sc.ch>=ln[1].length&&Math.sin(t*6)>0)txt(g,'▼',bx+bw-24,by+118,14,'#ffe9a0','center',2);
  txt(g,(sc.i+1)+' / '+sc.lines.length+'   Enter 다음 · Esc 건너뛰기',W-16,H-22,12,'#888','right',0);
}
function drawBigBanner(g,t){
  const b=G.bigBanner;if(!b)return;const k=G.t-b.t0;if(k>4.2){G.bigBanner=null;return}
  const a=clamp(Math.min(k*3,(4.2-k)*2),0,1),sc=1+Math.max(0,.25-k)*1.2;
  g.save();g.globalAlpha=a;g.translate(W/2,250);g.scale(sc,sc);
  g.fillStyle='rgba(10,4,20,.82)';g.beginPath();g.roundRect(-330,-46,660,b.sub?92:70,14);g.fill();g.strokeStyle=b.col||'#ffe04a';g.lineWidth=3;g.stroke();
  txt(g,b.title,0,b.sub?-6:2,30,b.col||'#ffe04a','center',5);if(b.sub)txt(g,b.sub,0,28,15,'#fff','center',3);
  g.restore();
}
function drawStele(g,st,t,near){
  const x=st.x,y=st.y,c=st.c,av=chAvail(c),op=steleOpen(c),cr=av?cracks(c):0;
  g.save();
  if(op){const gl=g.createRadialGradient(x,y-90,8,x,y-90,130);gl.addColorStop(0,'rgba(255,230,140,.55)');gl.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=gl;g.fillRect(x-140,y-230,280,240)}
  else if(av){const gl=g.createRadialGradient(x,y-90,8,x,y-90,100);gl.addColorStop(0,'rgba(190,160,255,.35)');gl.addColorStop(1,'rgba(190,160,255,0)');g.fillStyle=gl;g.fillRect(x-110,y-200,220,200)}
  // 받침
  poly(g,[x-54,y,x-46,y-18,x+46,y-18,x+54,y],'#4a4058',O_,2.5);
  const col=av?'#8a82a0':'#4a465a';
  if(op){ // 갈라진 비석
    for(const s of[-1,1]){g.save();g.translate(x+s*18,y-18);g.rotate(s*.12);g.beginPath();g.moveTo(0,0);g.lineTo(s*34,0);g.lineTo(s*30,-150);g.quadraticCurveTo(s*16,-168,0,-164);g.lineTo(s*6,-110);g.lineTo(-s*4,-70);g.lineTo(s*4,-30);g.closePath();g.fillStyle=col;g.fill();g.lineWidth=2.5;g.strokeStyle=O_;g.stroke();g.restore()}
    const gl=g.createLinearGradient(x,y-170,x,y-18);gl.addColorStop(0,'rgba(255,250,220,0)');gl.addColorStop(.5,'rgba(255,240,180,.9)');gl.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=gl;g.fillRect(x-12,y-175,24,160);
  }else{
    g.beginPath();g.moveTo(x-34,y-18);g.lineTo(x-34,y-150);g.quadraticCurveTo(x,y-178,x+34,y-150);g.lineTo(x+34,y-18);g.closePath();g.fillStyle=col;g.fill();g.lineWidth=2.5;g.strokeStyle=O_;g.stroke();
    g.fillStyle='rgba(255,255,255,.1)';g.fillRect(x-28,y-140,8,118);
    // 균열
    g.strokeStyle=av?'#ffe9a0':'#222';g.lineWidth=2;const crk=[[[x-2,y-150],[x+6,y-120],[x-4,y-100]],[[x+20,y-60],[x+6,y-80],[x+14,y-100]],[[x-26,y-40],[x-10,y-56],[x-16,y-80]]];
    for(let i=0;i<cr;i++){g.beginPath();crk[i].forEach(([a,b],j)=>j?g.lineTo(a,b):g.moveTo(a,b));g.stroke()}
    if(!av){g.strokeStyle='#2a2830';g.lineWidth=5;for(const s of[-1,1]){g.beginPath();g.moveTo(x-40,y-120+s*20);g.lineTo(x+40,y-60-s*20);g.stroke()}circ(g,x,y-90,9,'#6a6070',O_,2)}
  }
  txt(g,['','一','二','三','四','五','六'][c],x,y-112,26,op?'#fff3c0':av?'#e8e0ff':'#666','center',3);
  txt(g,'제'+c+'화 「'+CH[c].title+'」',x,y+22,13,op?'#ffe04a':av?'#e8e0ff':'#777','center',3);
  if(av&&!op)txt(g,'●'.repeat(cr)+'○'.repeat(3-cr),x,y+40,12,'#ffd34a','center',2);
  if(!av)txt(g,'🔒 Lv.'+CH[c].lv,x,y+40,12,'#aaa','center',2);
  if(near)txt(g,'↑ 비석 살펴보기',x,y-196,15,'#ffe04a','center',4);
  g.restore();
}
