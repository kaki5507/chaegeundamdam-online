/* ============================================================
   DATA : jobs, cosmetics, monsters, quests
   ============================================================ */
const ADV_LV=[0,10,30,70];          // 수련생 → 1차 Lv10 / 2차 Lv30 / 3차 Lv70
const MAXLV=100;
// 레벨업에 필요한 경험치: 앵커 사이를 로그 보간 (10까지 빠름 · 30까지 완만 · 50부터 힘듦 · 70부터 거의 안 오름)
const NEED_A=[[1,28],[9,92],[10,160],[29,2400],[30,3200],[49,26000],[50,36000],[69,150000],[70,420000],[99,6000000]];
// 몬스터 한 마리가 레벨당 필요량의 1/K 를 채운다 (K = 레벨업에 필요한 사냥 횟수)
const KILL_A=[[1,8],[9,10],[10,22],[29,60],[30,80],[49,170],[50,240],[69,450],[70,1800],[99,5000]];
function interpA(A,l){l=Math.max(1,Math.min(99,l));for(let i=1;i<A.length;i++){if(l<=A[i][0]){const a=A[i-1],b=A[i],k=(l-a[0])/Math.max(1,b[0]-a[0]);return Math.exp(Math.log(a[1])+(Math.log(b[1])-Math.log(a[1]))*k)}}return A[A.length-1][1]}
const need=l=>Math.round(interpA(NEED_A,l));
const expMul=l=>need(l)/(14*interpA(KILL_A,l));      // 달걀귀신(기본 14exp) 기준
const dailyPct=l=>l<10?.08:l<30?.05:l<50?.03:l<70?.02:.005;
const tierOfLv=l=>l>=ADV_LV[3]?3:l>=ADV_LV[2]?2:l>=ADV_LV[1]?1:0;
const bossPct=l=>l<50?1:l<70?.6:.2;
const GIVER_NAME={chief:'촌장님',board:'게시판',coach:'전직 교관',miko:'귀혼 무녀',adv2:'숲의 스승',adv3:'달빛 대현자',daily:'일일 의뢰인'};
const jline=(j,t)=>t<=0?'수련생 '+j.veg:j.line[t-1];
const SK_KEYS=['sk1','sk2','sk3','sk4','sk5'];   // X C V B N
const SK_LABEL=['X','C','V','B','N'];
const SK_TIER=[1,0,1,2,3];                         // 해당 스킬이 열리는 전직 단계 (C 는 수련생부터)
const SKIN='#eaa571',SKIN2='#c17e4e';
const JOBS=[
 {id:'warrior',veg:'브로콜리',role:'전사',head:'broc',line:['부락 파이터','근육 용사','대근육신'],hp:130,mp:60,atk:14,spd:232,jump:640,short:'#d8344a',band:'#ffdd33',col:'#3fae49',proj:'broc',
  bio:'균형 잡힌 근력의 정석. 근접 연타와 광역 폭발.',basic:{k:'melee',range:86,cd:.34,m:1},
  sk:[{n:'근육 폭발',k:'burst',r:150,m:2.6,mp:22,cd:5,col:'#ffe08a'},{n:'야채 투척',k:'fan',cnt:1,m:1.5,mp:7,cd:.55,spd:560,pierce:1},{n:'부락 모드',k:'buff',atk:1.5,spd:1.15,dur:9,mp:40,cd:28},{n:'대지 가르기',k:'quake',m:2.4,mp:32,cd:8},{n:'울트라 부락 폭발',k:'burst',r:330,m:7,mp:70,cd:18,col:'#fff2a0'}]},
 {id:'archer',veg:'당근',role:'궁수',head:'carrot',line:['당근 헌터','당근 레인저','당근 저격수'],hp:106,mp:72,atk:12,spd:262,jump:672,short:'#2f6bd8',band:'#ffffff',col:'#ff8a1f',proj:'carrot',
  bio:'눈이 좋은 원거리 딜러. 빠르고 멀리 쏜다.',basic:{k:'shoot',cd:.3,m:.9,spd:720,life:.9,ammo:'carrot'},
  sk:[{n:'당근 화살비',k:'rain',cnt:9,m:1.1,mp:25,cd:6,aoe:46,rw:220,off:150},{n:'관통 사격',k:'fan',cnt:1,m:2.3,mp:12,cd:1.4,spd:950,pierce:6},{n:'집중',k:'buff',atk:1.4,spd:1.2,dur:8,mp:35,cd:25},{n:'삼연사',k:'fan',cnt:3,sp:.2,m:1.5,mp:22,cd:4,spd:800,pierce:1},{n:'당근 유성우',k:'rain',cnt:24,m:1.6,mp:75,cd:20,aoe:60,rw:320,off:60}]},
 {id:'guardian',veg:'무',role:'수호자',head:'radish',line:['무 가드','무 수호자','대무 장군'],hp:178,mp:50,atk:17,spd:208,jump:620,short:'#2a2a33',band:'#e83a3a',col:'#f2f0e8',proj:'radish',
  bio:'느리지만 쓰러지지 않는다. 방패와 지진.',basic:{k:'melee',range:80,cd:.5,m:1.3},
  sk:[{n:'지진',k:'quake',m:2.2,mp:28,cd:7},{n:'무 방패',k:'shield',dur:3,mp:25,cd:14},{n:'분노',k:'buff',atk:1.6,spd:1,def:.5,dur:10,mp:40,cd:30},{n:'돌진 박치기',k:'dash',m:3,mp:30,cd:8},{n:'대지의 심판',k:'burst',r:380,m:8,mp:80,cd:20,col:'#ffffff'}]},
 {id:'mage',veg:'양파',role:'마법사',head:'onion',line:['양파 마법사','눈물 현자','대눈물 마도사'],hp:100,mp:110,atk:13,spd:222,jump:640,short:'#5a3a9a',band:'#7ad0ff',col:'#e0a860',proj:'orb',
  bio:'눈물 마법. 유도 탄과 광역 폭풍.',basic:{k:'shoot',cd:.42,m:1,spd:430,life:1.3,ammo:'orb',homing:1},
  sk:[{n:'눈물 폭풍',k:'rain',cnt:14,m:.9,mp:30,cd:6,aoe:44,rw:260,off:0},{n:'눈물 화살',k:'fan',cnt:1,m:2.5,mp:14,cd:1.2,spd:820,pierce:4,ammo:'orb'},{n:'마나 폭주',k:'buff',atk:1.5,spd:1.05,mpr:4,dur:10,mp:30,cd:28},{n:'눈물 분수',k:'fan',cnt:5,sp:.9,m:1.2,mp:30,cd:6,spd:380,homing:1,ammo:'orb',life:1.8},{n:'대양파 메테오',k:'rain',cnt:12,m:4.2,mp:95,cd:22,aoe:100,rw:280,off:100}]},
 {id:'fighter',veg:'고추',role:'화염 격투가',head:'chili',line:['매운 고추','불꽃 고추','화염제왕'],hp:118,mp:62,atk:15,spd:246,jump:650,short:'#2a2a33',band:'#ffb020',col:'#e02a2a',proj:'chili',
  bio:'빠른 연타와 불꽃 돌진. 한 번 붙으면 끝장.',basic:{k:'melee',range:92,cd:.28,m:.95,fire:1},
  sk:[{n:'화염 폭발',k:'burst',r:175,m:3,mp:26,cd:5,col:'#ff8a30'},{n:'불 돌진',k:'dash',m:2.2,mp:18,cd:4},{n:'매운 맛 폭주',k:'buff',atk:1.6,spd:1.2,dur:8,mp:40,cd:28},{n:'화염 방사',k:'fan',cnt:5,sp:.5,m:1.0,mp:28,cd:5,spd:520,life:.45,pierce:9,ammo:'fire'},{n:'지옥 불기둥',k:'burst',r:350,m:8,mp:80,cd:20,col:'#ff5a20'}]},
 {id:'rogue',veg:'가지',role:'암살자',head:'eggplant',line:['보라 가지','암야 가지','그림자 대가지'],hp:108,mp:66,atk:13,spd:272,jump:690,short:'#1a1a28',band:'#c05aff',col:'#8a52b8',proj:'star',
  bio:'가장 빠른 칼잡이. 그림자 베기와 암기.',basic:{k:'melee',range:68,cd:.2,m:.62},
  sk:[{n:'그림자 베기',k:'dash',m:3.2,mp:22,cd:5},{n:'암기 투척',k:'fan',cnt:3,sp:.28,m:1.1,mp:10,cd:.8,spd:760,ammo:'star'},{n:'암야',k:'buff',atk:1.3,spd:1.35,def:.3,dur:8,mp:36,cd:26},{n:'분신 난무',k:'burst',r:150,m:4.2,mp:30,cd:7,col:'#c05aff'},{n:'그림자 대폭풍',k:'burst',r:340,m:7.5,mp:75,cd:19,col:'#a040ff'}]},
 {id:'gunner',veg:'옥수수',role:'팝콘 거너',head:'corn',line:['옥수수 사수','팝콘 거너','콘 캐논'],hp:112,mp:70,atk:12,spd:238,jump:640,short:'#3a5a2a',band:'#ffffff',col:'#ffd83a',proj:'kernel',
  bio:'알알이 쏟아지는 연사. 팝콘 폭격.',basic:{k:'shoot',cd:.16,m:.52,spd:820,life:.7,ammo:'kernel'},
  sk:[{n:'팝콘 폭탄',k:'rain',cnt:7,m:1.6,mp:26,cd:5,aoe:72,rw:180,off:170,ammo:'popcorn'},{n:'콘 캐논',k:'fan',cnt:1,m:3.4,mp:20,cd:2,spd:700,pierce:5,ammo:'popcorn'},{n:'팝콘 파티',k:'heal',m:.3,mp:40,cd:25},{n:'콘 기관총',k:'fan',cnt:7,sp:.3,m:.75,mp:26,cd:4,spd:860,ammo:'kernel'},{n:'대팝콘 핵',k:'burst',r:390,m:8.5,mp:90,cd:22,col:'#fff0b0'}]},
 {id:'priest',veg:'마늘',role:'성직자',head:'garlic',line:['마늘 사제','성스러운 마늘','마늘 성자'],hp:122,mp:100,atk:12,spd:226,jump:640,short:'#e8e0c8',band:'#ffd34a',col:'#f6f2e6',proj:'holy',
  bio:'아군을 살리는 힐러. 파티의 든든한 기둥.',basic:{k:'shoot',cd:.4,m:.9,spd:520,life:.8,ammo:'holy',homing:1},
  sk:[{n:'마늘 힐',k:'heal',m:.35,mp:28,cd:6},{n:'정화의 빛',k:'burst',r:210,m:2.4,mp:22,cd:6,col:'#fff7c0'},{n:'마늘 결계',k:'shield',dur:2.6,party:1,mp:30,cd:16},{n:'성스러운 일격',k:'fan',cnt:1,m:3.1,mp:22,cd:3,spd:760,pierce:4,ammo:'holy'},{n:'대사면',k:'heal',m:.8,mp:90,cd:26,burst:{r:340,m:5}}]},
];
JOBS.forEach(j=>{j.skin=SKIN;j.skin2=SKIN2;j.shoe='#3a2418'});
const JOB=Object.fromEntries(JOBS.map(j=>[j.id,j]));
const TIER_AURA=['','rgba(255,255,255,','rgba(255,220,80,'];

/* ---------------- cosmetics / items ---------------- */
const SLOTS=[['hat','모자'],['face','얼굴'],['outfit','옷'],['cape','망토'],['aura','오라']];
const ITEMS={
 hat_flower:{slot:'hat',n:'꽃핀',price:150,r:0,col:'#ff8ac0'},
 hat_gat:{slot:'hat',n:'선비 갓',price:600,r:1,col:'#241a14'},
 hat_horns:{slot:'hat',n:'도깨비 뿔',price:1200,r:2,col:'#fff0c4'},
 hat_crown:{slot:'hat',n:'황금 왕관',price:3200,r:3,col:'#ffd34a'},
 hat_helm:{slot:'hat',n:'철 투구',price:900,r:1,col:'#9aa4b8'},
 hat_ninja:{slot:'hat',n:'복면 두건',price:700,r:1,col:'#1c1c2c'},
 hat_fox:{slot:'hat',n:'여우 귀',price:1800,r:2,col:'#fff2e8'},
 face_sun:{slot:'face',n:'선글라스',price:300,r:0,col:'#111'},
 face_heart:{slot:'face',n:'하트 안경',price:500,r:1,col:'#ff4a8a'},
 face_patch:{slot:'face',n:'해적 안대',price:450,r:1,col:'#222'},
 face_mask:{slot:'face',n:'도깨비 가면',price:1500,r:2,col:'#c0283c'},
 out_vest:{slot:'outfit',n:'한복 조끼',price:400,r:0,col:'#2a56b8'},
 out_dobok:{slot:'outfit',n:'검은 도복',price:900,r:1,col:'#1a1a22'},
 out_tank:{slot:'outfit',n:'야채 탱크탑',price:350,r:0,col:'#3fae49'},
 out_gold:{slot:'outfit',n:'황금 갑옷',price:3500,r:3,col:'#ffd34a'},
 out_hanbok:{slot:'outfit',n:'붉은 두루마기',price:1400,r:2,col:'#c0283c'},
 cape_red:{slot:'cape',n:'붉은 망토',price:500,r:0,col:'#c0283c'},
 cape_blue:{slot:'cape',n:'푸른 망토',price:500,r:0,col:'#2a56b8'},
 cape_ghost:{slot:'cape',n:'귀혼의 망토',price:2400,r:3,col:'#e8f0ff'},
 cape_gold:{slot:'cape',n:'황금 망토',price:2800,r:3,col:'#ffcf3a'},
 // ---- 캐시 치장 : 이벤트 코인(◆)으로만 구매/획득 가능 ----
 cs_hat_halo:{slot:'hat',n:'[캐시] 천사의 고리',price:0,ec:12,cash:1,r:4,col:'#ffe97a'},
 cs_hat_cat:{slot:'hat',n:'[캐시] 고양이 귀',price:0,ec:20,cash:1,r:4,col:'#3a3a48'},
 cs_face_star:{slot:'face',n:'[캐시] 별빛 눈',price:0,ec:10,cash:1,r:4,col:'#ffe04a'},
 cs_out_rainbow:{slot:'outfit',n:'[캐시] 무지개 로브',price:0,ec:30,cash:1,r:4,col:'#ff8ae0'},
 cs_out_galaxy:{slot:'outfit',n:'[캐시] 은하수 한복',price:0,ec:45,cash:1,r:4,col:'#3a2a78'},
 cs_cape_wing:{slot:'cape',n:'[캐시] 천사 날개',price:0,ec:35,cash:1,r:4,col:'#fff4fa'},
 cs_aura_star:{slot:'aura',n:'[캐시] 별빛 오라',price:0,ec:25,cash:1,r:4,col:'#fff36a'},
 cs_aura_heart:{slot:'aura',n:'[캐시] 하트 오라',price:0,ec:25,cash:1,r:4,col:'#ff7ab8'},
 aura_flame:{slot:'aura',n:'불꽃 오라',price:1600,r:2,col:'#ff7a30'},
 aura_petal:{slot:'aura',n:'진달래 오라',price:1100,r:1,col:'#ff9ac8'},
 aura_ghost:{slot:'aura',n:'귀화 오라',price:2200,r:3,col:'#7ad0ff'},
 aura_thunder:{slot:'aura',n:'번개 오라',price:1900,r:2,col:'#ffee60'},
};
const SHOP_ITEMS=['hat_flower','hat_gat','hat_helm','hat_ninja','face_sun','face_heart','face_patch','out_vest','out_dobok','out_tank','cape_red','cape_blue','aura_petal','hat_fox','out_hanbok','aura_flame','aura_thunder','face_mask'];
const RARITY=['일반','희귀','영웅','전설','캐시'],RCOL=['#cfd4e2','#7ad0ff','#c88aff','#ffcf3a','#ff8ae0'];
const CASH_ITEMS=Object.keys(ITEMS).filter(k=>ITEMS[k].cash);
// 출석 : 연속 7일 사이클. 7일째에 캐시 치장템 지급 · 누적 출석 보너스
const ATT_DAY=[3,3,5,5,8,8,20];
const ATT_WEEK_ITEMS=['cs_hat_halo','cs_face_star','cs_aura_star','cs_hat_cat','cs_aura_heart'];
const ATT_MILE={10:10,20:15,30:20,50:30,100:60};
// 강화 주문서 : 슬롯(7+전직단계) 1칸을 소모해 근육(공격)/체력 강화. 순백의 주문서는 슬롯 1칸 복구
const SCROLLS={
 atk100:{n:'근육 주문서 100%',stat:'atk',rate:1,pts:1,price:400},
 atk60:{n:'근육 주문서 60%',stat:'atk',rate:.6,pts:2,price:1200},
 atk30:{n:'근육 주문서 30%',stat:'atk',rate:.3,pts:4,price:3000},
 atk10:{n:'근육 주문서 10%',stat:'atk',rate:.1,pts:8,price:7000},
 hp100:{n:'체력 주문서 100%',stat:'hp',rate:1,pts:1,price:350},
 hp60:{n:'체력 주문서 60%',stat:'hp',rate:.6,pts:2,price:1000},
 hp30:{n:'체력 주문서 30%',stat:'hp',rate:.3,pts:4,price:2500},
 white:{n:'순백의 주문서 (슬롯 복구)',white:1,price:10000},
};
const POTION={hp:{n:'야채 즙(HP)',price:60,heal:.4},mp:{n:'맑은 물(MP)',price:60,heal:.5}};

/* ---------------- monsters ---------------- */
const MOBS={
 egg:{n:'달걀귀신',hp:30,dmg:12,exp:14,coin:[3,9],w:30,h:34},
 wisp:{n:'도깨비불',hp:22,dmg:10,exp:10,coin:[2,7],w:26,h:30},
 baby:{n:'아기 달걀귀신',hp:14,dmg:8,exp:4,coin:[1,3],w:22,h:24},
};

/* ---------------- quests ---------------- */
// objective types: kill{mob|any} boss{id} flag{key} reach{map} collect{item} count{key} talk{n} lvl pq
const QUESTS={
 tut1:{name:'튜토리얼 · 야채마을의 아침',giver:'chief',min:1,desc:'촌장 무 할아버지가 부락 수련을 시켜준다. 이동·점프·공격·스킬·밧줄을 익히고 허수아비를 쓰러뜨려라!',
   objs:[{t:'flag',key:'move',label:'좌우로 이동하기 (←→)'},{t:'flag',key:'jump',label:'점프하기 (Space)'},{t:'flag',key:'attack',label:'허수아비 때리기 (Z)'},{t:'flag',key:'skill',label:'스킬 사용하기 (C)'},{t:'flag',key:'rope',label:'밧줄 끝까지 오르기 (↑)'},{t:'kill',mob:'dummy',n:2,label:'허수아비 쓰러뜨리기'}],
   rew:{exp:60,coin:150,item:'hat_flower'}},
 main1:{name:'도깨비 숲의 홍살문',giver:'chief',min:1,pre:['tut1'],desc:'마을 동쪽 포탈로 도깨비 숲에 들어가 꼭대기 홍살문까지 올라라.',objs:[{t:'reach',map:'forest',label:'도깨비 숲 꼭대기 도달'}],rew:{exp:100,coin:200,item:'out_tank'}},
 main2:{name:'도깨비 대왕 토벌',giver:'chief',min:3,pre:['main1'],desc:'숲의 끝에서 날뛰는 도깨비 대왕을 처치하라!',objs:[{t:'boss',id:'dokkaebi',label:'도깨비 대왕 처치'}],rew:{exp:220,coin:600,item:'cape_red'}},
 main3:{name:'하늘길 개척',giver:'chief',min:6,pre:['main2'],desc:'구름 위 하늘길 끝까지 도달하라. 떨어지면 큰일이다!',objs:[{t:'reach',map:'sky',label:'하늘길 끝 도달'}],rew:{exp:320,coin:700,item:'face_sun'}},
 main4:{name:'구미호의 구슬',giver:'chief',min:8,pre:['main3'],desc:'하늘길 끝 달빛 신당의 구미호를 쓰러뜨려라.',objs:[{t:'boss',id:'fox',label:'구미호 처치'}],rew:{exp:600,coin:1200,item:'aura_ghost'}},
 s1:{name:'달걀귀신 소탕',giver:'board',min:1,desc:'숲에 달걀귀신이 득실댄다. 15마리를 잡아라.',objs:[{t:'kill',mob:'egg',n:15,label:'달걀귀신 처치'}],rew:{exp:60,coin:220}},
 s2:{name:'도깨비불 소방대',giver:'board',min:1,desc:'하늘을 떠도는 도깨비불 12마리를 꺼뜨려라.',objs:[{t:'kill',mob:'wisp',n:12,label:'도깨비불 처치'}],rew:{exp:60,coin:220,item:'face_heart'}},
 s3:{name:'야채 조각 수집',giver:'board',min:1,desc:'몬스터가 떨어뜨리는 야채 조각 10개를 모아와라.',objs:[{t:'collect',item:'vegbit',n:10,label:'야채 조각 수집'}],rew:{exp:70,coin:260}},
 s4:{name:'근육 단련',giver:'board',min:1,desc:'스킬을 25번 사용해 근육을 단련하라.',objs:[{t:'count',key:'skill',n:25,label:'스킬 사용'}],rew:{exp:50,coin:160,item:'cape_blue'}},
 s5:{name:'체크포인트 순례',giver:'board',min:2,desc:'숲과 하늘길의 깃발(체크포인트) 3개를 밝혀라.',objs:[{t:'count',key:'flag',n:3,label:'깃발 밝히기'}],rew:{exp:50,coin:180}},
 s6:{name:'코인 수집가',giver:'board',min:3,desc:'모험 중 야채코인 800개를 모아라.',objs:[{t:'count',key:'coin',n:800,label:'코인 획득'}],rew:{exp:90,coin:100,item:'hat_gat'}},
 s7:{name:'수다쟁이 용사',giver:'board',min:1,desc:'마을 사람 6명에게 말을 걸어라.',objs:[{t:'talk',n:6,label:'서로 다른 NPC와 대화'}],rew:{exp:40,coin:120}},
 s8:{name:'소문난 용사',giver:'board',min:8,desc:'레벨 12를 달성하라.',objs:[{t:'lvl',n:12,label:'레벨 12 달성'}],rew:{exp:140,coin:400,item:'out_dobok'}},
 j1:{name:'1차 전직의 시험',giver:'coach',min:ADV_LV[1],desc:'수련생 시절은 끝! 몬스터 20마리를 쓰러뜨리고 스킬을 10번 써서 근육을 증명하라. 시험을 통과하면 1차 전직!',
   objs:[{t:'kill',mob:'any',n:20,label:'몬스터 처치'},{t:'count',key:'skill',n:10,label:'스킬 사용'}],rew:{pct:.6,coin:300},adv:1},
 j2:{name:'2차 전직의 시험',giver:'adv2',min:ADV_LV[2],pre:['j1'],desc:'도깨비 숲 꼭대기의 스승이 내리는 시련. 시련 모드의 도깨비 대왕(체력 1.6배)을 다시 쓰러뜨리고 야채 조각 15개를 가져와라.',
   objs:[{t:'boss',id:'dokkaebi',label:'도깨비 대왕 처치 (시련)'},{t:'collect',item:'vegbit',n:15,label:'야채 조각 수집'}],rew:{pct:.5,coin:800},adv:2},
 j3:{name:'3차 전직의 시험',giver:'adv3',min:ADV_LV[3],pre:['j2'],desc:'하늘길 끝 달빛 신당의 대현자가 내리는 마지막 시련. 시련 모드의 구미호(체력 1.6배)를 쓰러뜨리고 야채 조각 30개를 바쳐라.',
   objs:[{t:'boss',id:'fox',label:'구미호 처치 (시련)'},{t:'collect',item:'vegbit',n:30,label:'야채 조각 수집'}],rew:{pct:.4,coin:2000},adv:3},
 // ---- 일일 퀘스트 (매일 초기화 · 경험치는 레벨당 필요량의 일정 %) ----
 d1:{daily:1,name:'[일일] 달걀귀신 사냥',giver:'daily',min:1,desc:'오늘도 달걀귀신이 설친다. 20마리를 잡아라.',objs:[{t:'kill',mob:'egg',n:20,label:'달걀귀신 처치'}],rew:{pct:'d'}},
 d2:{daily:1,name:'[일일] 도깨비불 끄기',giver:'daily',min:1,desc:'도깨비불 10마리를 꺼뜨려라.',objs:[{t:'kill',mob:'wisp',n:10,label:'도깨비불 처치'}],rew:{pct:'d'}},
 d3:{daily:1,name:'[일일] 야채 조각 납품',giver:'daily',min:1,desc:'야채 조각 8개를 납품하라.',objs:[{t:'collect',item:'vegbit',n:8,label:'야채 조각 수집'}],rew:{pct:'d'}},
 d4:{daily:1,name:'[일일] 근육 단련',giver:'daily',min:1,desc:'스킬을 30번 사용해 근육을 단련하라.',objs:[{t:'count',key:'skill',n:30,label:'스킬 사용'}],rew:{pct:'d'}},
 d5:{daily:1,name:'[일일] 숲 정상 정복',giver:'daily',min:1,desc:'도깨비 숲 꼭대기까지 올라라.',objs:[{t:'reach',map:'forest',label:'도깨비 숲 꼭대기 도달'}],rew:{pct:'d'}},
 hid:{name:'[숨겨진] 달걀귀신 소굴',giver:'miko',min:6,desc:'달걀귀신 소굴에 갇힌 영혼들을 구해달라고 한다. 파티원 3명(AI 동료 포함)이 필요하다.',objs:[{t:'pq',n:1,label:'파티퀘스트 클리어'}],rew:{exp:700,coin:1500,item:'hat_horns'}},
};
const NPCS=[
 {id:'att',name:'출석부 요정 팥',x:1735,look:'att',tag:'출석 체크 · 이벤트 코인'},
 {id:'cash',name:'이벤트 상점 양배추',x:1250,look:'cash',tag:'캐시 치장 (◆ 이벤트 코인)'},
 {id:'scroll',name:'수상한 보따리 상인',x:1045,gy:300,look:'scroll',tag:'강화 주문서',hidden:true,minLv:1,seeY:true},
 {id:'chief',name:'촌장 무 할아버지',x:330,look:'chief',tag:'메인 퀘스트 · 튜토리얼'},
 {id:'daily',name:'일일 의뢰인 쪽파',x:460,look:'daily',tag:'일일 퀘스트'},
 {id:'duel',name:'결투장 심판 파',x:2000,look:'duel',tag:'PvP 결투'},
 {id:'coach',name:'1차 전직 교관 고추',x:1850,look:'coach',tag:'1차 전직 (Lv.10)'},
 {id:'shop',name:'옥수수 상인',x:1120,look:'shop',tag:'상점'},
 {id:'board',name:'퀘스트 게시판',x:1380,look:'board',tag:'일반 퀘스트'},
 {id:'portal',name:'포탈 지기 마늘 스님',x:2150,look:'monk',tag:'이동'},
 {id:'party',name:'파티 모집꾼 양파 아줌마',x:1620,look:'aunt',tag:'파티'},
 {id:'closet',name:'옷장 요정',x:900,look:'closet',tag:'치장 · 옷장'},
 {id:'adv2',name:'숲의 스승 가지',x:0,look:'sage',tag:'2차 전직 (Lv.30)',map:'forest'},
 {id:'adv3',name:'달빛 대현자',x:0,look:'moon',tag:'3차 전직 (Lv.70)',map:'sky'},
 {id:'miko',name:'귀혼 무녀',x:110,look:'miko',tag:'???',hidden:true},
];

/* ---------------- save ---------------- */
const SAVEKEY='yachae_buraki_v3',OLDKEY='yachae_buraki_v2';
function defaultSave(jobId){
  return {job:jobId,lvl:1,exp:0,coins:200,tier:0,inv:{},eq:{},potions:{hp:3,mp:2},q:{},flags:{},cnt:{},talked:{},cleared:{},pq:0,name:'부락리',dayKey:'',dbonus:false,duel:{w:0,l:0},ec:0,att:{last:-1,streak:0,total:0,weeks:0},enh:{atk:0,hp:0,used:0},scrolls:{}};
}
let SAVE=null;
function saveGame(){try{localStorage.setItem(SAVEKEY,JSON.stringify(SAVE))}catch(e){}}
function loadGame(){
  try{
    let s=localStorage.getItem(SAVEKEY),old=false;
    if(!s){s=localStorage.getItem(OLDKEY);old=!!s}
    if(s){const o=JSON.parse(s);if(o&&o.job&&JOB[o.job]){
      if(old){o.tier=Math.max(1,o.tier||1);o.q=o.q||{};o.q.j1={s:'done',p:[]};for(const k of['j2','j3'])if(o.q[k]&&o.q[k].s!=='done')delete o.q[k]}   // v2 → v3 이전: 이미 1차였던 것으로 처리
      return o}}
  }catch(e){}return null}
