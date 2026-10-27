// Game mode (phones, ?game, or the Capacitor app): map, levels, cards, packs, trophies and the Star Catcher arcade.
(function(){
const G=document.getElementById("game"), $=id=>document.getElementById(id);
const LEVELS=[
  {id:"about",   icon:"face",         name:"Who is Ekky?"},
  {id:"skills",  icon:"pen-hand",     name:"Skill Tree"},
  {id:"cards",   icon:"palette",      name:"Art Collection"},
  {id:"process", icon:"ghost",        name:"Doodle to Done"},
  {id:"contact", icon:"monster-head", name:"Final Quest", boss:true},
];
const ACH=[
  {id:"start",    ic:"face",               t:"Press Start",     d:"Begin the adventure"},
  {id:"hello",    ic:"face",               t:"Nice to Meet You", d:"Finish level 1"},
  {id:"coins10",  ic:"s-coin",             t:"Coin Keeper",      d:"Collect 10 coins"},
  {id:"cards3",   ic:"palette",            t:"Art Collector",    d:"Inspect 3 artworks"},
  {id:"explorer", ic:"map-pin",            t:"World Explorer",   d:"Visit every level"},
  {id:"quest",    ic:"monster-head-check", t:"Quest Complete",   d:"Send Ekky a message"},
  {id:"pack",     ic:"toybox",             t:"Pack Opener",      d:"Open your first art pack"},
  {id:"legend",   ic:"blue-bird",          t:"Legendary Pull",   d:"Pull a legendary card"},
  {id:"arcade",   ic:"trophy",             t:"Arcade Star",      d:"Score 40 in Star Catcher"},
  {id:"complete", ic:"chest",              t:"Completionist",    d:"Collect every card (watch out, it bites)"},
];
// a trophy icon is either a palette shape from the SVG set (s-*) or a cut-out from assets/ui/
const achIc=a=>a.ic.startsWith("s-")?ico(a.ic,"ico"):uiImg(a.ic,"");
const COIN=ico("s-coin");
const RARITY=[["Common","#B8D5FF"],["Rare","#7ED9B0"],["Epic","#C9A7FF"],["Legendary","#FFB400"]];
const blank={xp:0,coins:0,visited:[],seen:[],got:[],ach:[],vib:true,snd:true,freePack:true,best:0,newAch:0};
let st;try{st=Object.assign({},blank,JSON.parse(localStorage.getItem("ekkyGame")||"{}"))}catch{st={...blank}}
const save=()=>{try{localStorage.setItem("ekkyGame",JSON.stringify(st))}catch{}};
const buzz=ms=>{if(st.vib&&navigator.vibrate)try{navigator.vibrate(ms)}catch{}};
const lvl=()=>Math.floor(st.xp/100)+1;

/* ---- mode switching ---- */
const phone=matchMedia("(max-width:760px)");
const native=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const pref=()=>{try{return localStorage.getItem("ekkyMode")}catch{return null}};
function setMode(){const on=native||new URLSearchParams(location.search).has("game")||(phone.matches&&pref()!=="classic");
  document.body.classList.toggle("game-mode",on);if(on)renderAll()}
document.querySelectorAll("[data-classic]").forEach(b=>b.onclick=()=>{try{localStorage.setItem("ekkyMode","classic")}catch{};
  document.body.classList.remove("game-mode");const u=new URL(location);u.searchParams.delete("game");history.replaceState(null,"",u)});
$("gFab").onclick=()=>{try{localStorage.removeItem("ekkyMode")}catch{};document.body.classList.add("game-mode");renderAll()};
phone.addEventListener("change",setMode);

/* ---- sky ---- */
$("gSky").innerHTML=Array.from({length:60},()=>{const s=1+Math.random()*3;
  return `<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;width:${s}px;height:${s}px;opacity:${.3+Math.random()*.7};animation-delay:${-Math.random()*3}s"></i>`}).join("");

/* ---- HUD, XP, achievements ---- */
function hud(){const x=st.xp%100;$("gXp").style.width=x+"%";$("gXpText").textContent=`${x} / 100 XP`;$("gLv").textContent="Lv "+lvl();$("gCoinN").textContent=st.coins}
function addXp(n,el){const before=lvl();st.xp+=n;save();hud();if(el)plus("+"+n+" XP",el);
  if(lvl()>before){const lu=$("gLevelUp");lu.classList.remove("show");void lu.offsetWidth;lu.classList.add("show");buzz([30,40,60]);sfx("level");if(typeof confetti==="function")confetti()}}
let popQ=[],popping=false;
function unlock(id){if(st.ach.includes(id))return;st.ach.push(id);save();popQ.push(ACH.find(a=>a.id===id));st.newAch=(st.newAch||0)+1;save();badge();addXp(25);if(!popping)nextPop();renderTrophies()}
function nextPop(){const a=popQ.shift();if(!a){popping=false;return}popping=true;
  $("gPopIc").innerHTML=achIc(a);$("gPopK").textContent="Achievement unlocked";$("gPopT").textContent=a.t;
  $("gPop").classList.add("show");buzz(40);sfx("ach");setTimeout(()=>{$("gPop").classList.remove("show");setTimeout(nextPop,500)},2300)}
function plus(text,el){const r=el.getBoundingClientRect(),g=G.getBoundingClientRect(),p=document.createElement("span");
  p.className="g-plus";p.textContent=text;p.style.left=r.left-g.left+r.width/2-24+"px";p.style.top=r.top-g.top+"px";G.appendChild(p);setTimeout(()=>p.remove(),900)}

/* ---- tabs / screens ---- */
function go(tab){
  if(tab==="quest")return openLevel(LEVELS.length-1);
  G.classList.toggle("at-start",tab==="start");
  G.querySelectorAll(".g-screen").forEach(s=>s.classList.toggle("active",s.id==="g-"+tab));
  G.querySelectorAll(".g-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  if(tab==="map")setTimeout(placeToken,50);
  if(tab==="profile"){st.newAch=0;save();badge()}
  requestAnimationFrame(moveInd);
}
G.querySelector(".g-tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(b){buzz(10);go(b.dataset.tab)}});
$("gPlay").onclick=()=>{buzz(20);sfx("go");unlock("start");go("map")};

/* ---- map ---- */
const POS=[[28,0],[72,1],[30,2],[70,3],[50,4.15]];const STEP=170,TOP=150;
let tokenAt=0;
function renderMap(){
  const h=TOP+STEP*4.15+130,pts=POS.map(([x,i])=>[x,TOP+i*STEP]);
  let d=`M${pts[0][0]} ${pts[0][1]}`;for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i];d+=` C${x0} ${(y0+y1)/2} ${x1} ${(y0+y1)/2} ${x1} ${y1}`}
  const next=LEVELS.findIndex(l=>!st.visited.includes(l.id));
  $("gMapWrap").style.height=h+"px";
  $("gMapWrap").innerHTML=`<svg class="g-path" viewBox="0 0 100 ${h}" preserveAspectRatio="none"><path d="${d}" vector-effect="non-scaling-stroke"/></svg>`+
    LEVELS.map((l,i)=>{const [x,y]=pts[i],done=st.visited.includes(l.id);
      return `<button class="g-node${l.boss?" boss":""}${done?" done":""}${i===next?" next":""}" style="left:${x}%;top:${y}px" data-l="${i}" aria-label="Level ${i+1}: ${l.name}"><span class="num">${i+1}</span>${uiImg(l.icon,"")}</button>
      <div class="g-label" style="left:${x}%;top:${y}px"><b>${l.name}</b><span class="g-stars3">${[0,1,2].map(k=>`<span class="${done?"on":""}" style="animation-delay:${k*.12}s">${ico("s-star","ico")}</span>`).join("")}</span></div>`}).join("")+
    `<div class="g-token" id="gToken"><img src="assets/hero.png" alt=""></div>`;
  placeToken(true);
}
function placeToken(instant){const t=$("gToken");if(!t)return;const [x,i]=POS[tokenAt];if(instant)t.style.transition="none";
  t.style.left=x+"%";t.style.top=TOP+i*STEP+"px";if(instant){void t.offsetWidth;t.style.transition=""}}
$("gMapWrap").addEventListener("click",e=>{const n=e.target.closest(".g-node");if(!n)return;buzz(15);
  const i=+n.dataset.l,t=$("gToken");if(i===tokenAt)return openLevel(i);
  tokenAt=i;t.classList.remove("hop");void t.offsetWidth;t.classList.add("hop");placeToken();setTimeout(()=>openLevel(i),560)});

/* ---- levels (bottom sheet) ---- */
const sheet=$("gSheet");
function closeSheet(){sheet.classList.remove("open")}
$("gSheetX").onclick=closeSheet;sheet.addEventListener("click",e=>{if(e.target===sheet)closeSheet()});
let sy=null;sheet.firstElementChild.addEventListener("touchstart",e=>{sy=sheet.firstElementChild.scrollTop>0?null:e.touches[0].clientY},{passive:true});
sheet.firstElementChild.addEventListener("touchend",e=>{if(sy!==null&&e.changedTouches[0].clientY-sy>90)closeSheet();sy=null});
function complete(i){const l=LEVELS[i];if(st.visited.includes(l.id))return;st.visited.push(l.id);save();addXp(40,document.querySelector(`.g-node[data-l="${i}"]`)||$("gXp"));
  if(l.id==="about")unlock("hello");if(LEVELS.every(x=>st.visited.includes(x.id)))unlock("explorer");setTimeout(renderMap,300)}
function openLevel(i){const l=LEVELS[i];
  if(l.id==="cards"){complete(i);return go("collection")}
  const body=$("gSheetBody"),head=`<span class="g-ribbon">${l.boss?"BOSS LEVEL":"LEVEL "+(i+1)}</span><h2>${uiImg(l.icon,"h-ico")}${l.name}</h2>`;
  if(l.id==="about"){body.innerHTML=head+`
    <p>Hi! I'm Ekky Arya, an illustrator and graphic designer who loves lively, playful work. I give characters a personality you can feel and make visuals that make people of every age smile.</p>
    <div style="margin-top:14px">${[["Creativity",96,"#FFB400"],["Playfulness",99,"#FF6B6B"],["Color sense",92,"#7ED9B0"],["Character design",95,"#9C91BD"]].map(([n,v,c])=>
      `<div class="g-stat"><div><span>${n}</span><span>${v}</span></div><div class="bar"><i data-w="${v}" style="background:${c}"></i></div></div>`).join("")}</div>
    <p style="margin-top:14px"><button class="g-btn" data-goto="1">Next level ${ico("i-next")}</button></p>`}
  if(l.id==="skills"){body.innerHTML=head+`<p>Every skill is maxed out. Tap one to see matching cards.</p>`+
    [["illustration","#FFE8B0","Project Illustrations","Characters, scenes and spot art"],["web","#D6E7FF","Web & UI Design","Friendly interfaces and landing pages"],
     ["branding","#FFD6D6","Branding & Product","Logos, mascots and packaging"],["social","#D3F4E4","Social Media","Posts, stickers and carousels"]]
     .map(([f,bg,t,d],k)=>`<button class="g-skill" data-f="${f}" style="animation-delay:${k*.08}s"><span class="ic" style="background:${bg}">${catImg(f,"")}</span><span><b>${t}</b><small>${d}</small></span><span class="max">MAX</span></button>`).join("")}
  if(l.id==="process"){body.innerHTML=head+`<p>How a project goes from a doodle to final files.</p>`+
    [["Brief & chat","We talk about your idea, audience and the feeling it should give."],["Sketches","Rough concepts so we pick a direction early."],["Color & polish","Line, color and texture, with room for revisions."],["Delivery","Final files for print, web and social."]]
     .map(([t,d],k)=>`<div class="g-quest" data-k="${k}"><span class="chk">${ico("i-check")}</span><div><b>${t}</b><p style="font-size:.85rem">${d}</p></div></div>`).join("")}
  if(l.id==="contact"){body.innerHTML=head+`<p>Defeat the boss by sending Ekky a message about your project. Reward: <b>+100 XP</b> and a new friend.</p>
    <form id="gForm" novalidate>
      <label>Name<input name="name" autocomplete="name" required><span class="err"></span></label>
      <label>Email<input name="email" type="email" autocomplete="email" required><span class="err"></span></label>
      <label>Project type<select name="type"><option>Project based illustration</option><option>Web &amp; UI design</option><option>Branding &amp; product design</option><option>Social media</option><option>Something else</option></select></label>
      <label>Message<textarea name="message" required minlength="10"></textarea><span class="err"></span></label>
      <button class="g-btn" type="submit" style="width:100%">${ico("i-send")} Send message</button>
    </form>`}
  sheet.classList.add("open");sheet.firstElementChild.scrollTop=0;
  setTimeout(()=>{body.querySelectorAll(".bar i").forEach(b=>b.style.width=b.dataset.w+"%");
    body.querySelectorAll(".g-quest").forEach(q=>setTimeout(()=>{q.classList.add("ok");buzz(8)},300+q.dataset.k*350))},350);
  if(l.id!=="contact")complete(i);
}
$("gSheetBody").addEventListener("click",e=>{
  const nx=e.target.closest("[data-goto]");if(nx){closeSheet();setTimeout(()=>{tokenAt=+nx.dataset.goto;go("map");const t=$("gToken");t.classList.add("hop");placeToken();setTimeout(()=>openLevel(tokenAt),560)},350)}
  const sk=e.target.closest(".g-skill");if(sk){closeSheet();gFilter=sk.dataset.f;renderCards();go("collection")}});
$("gSheetBody").addEventListener("submit",e=>{e.preventDefault();const f=e.target;let ok=true;
  f.querySelectorAll("[required]").forEach(i=>{const m=i.validity.valueMissing?"This one's needed":i.validity.typeMismatch?"Hmm, that email looks off":i.validity.tooShort?"A few more words, please":"";
    i.parentElement.querySelector(".err").textContent=m;if(m)ok=false});
  if(!ok){buzz([20,40,20]);f.animate([{transform:"translateX(0)"},{transform:"translateX(-8px)"},{transform:"translateX(8px)"},{transform:"translateX(0)"}],{duration:300});return}
  const d=Object.fromEntries(new FormData(f));complete(LEVELS.length-1);addXp(100);unlock("quest");if(typeof confetti==="function")confetti();closeSheet();
  setTimeout(()=>location.href=`mailto:${CONFIG.email}?subject=${encodeURIComponent(d.type+" project from "+d.name)}&body=${encodeURIComponent(d.message+"\n\n"+d.name+" ("+d.email+")")}`,900)});

/* ---- collection ---- */
let gFilter="all";
function renderCards(fresh){
  $("gFilters").innerHTML=[["all","All"],["illustration","Illustration"],["web","Web & UI"],["branding","Branding"],["social","Social"]]
    .map(([f,n])=>`<button class="${f===gFilter?"active":""}" data-f="${f}">${catImg(f)}${n}</button>`).join("");
  const list=PROJECTS.map((p,i)=>({p,i})).filter(x=>gFilter==="all"||x.p.cat===gFilter);
  $("gCards").innerHTML=list.map(({p,i},k)=>{const [rn,rc]=RARITY[p.rar||0],got=st.got.includes(i);
    return `<button class="g-card${rn==="Legendary"?" legendary":""}${got?" owned":""}${fresh&&fresh.includes(i)?" fresh":""}" data-i="${i}" style="--rc:${rc};animation-delay:${k*.06}s"><div class="inner">
      <span class="rar">${rn}</span><span class="gcat">${catImg(p.cat,"")}</span>${got?`<span class="seen">${ico("s-star")}</span>`:st.seen.includes(i)?`<span class="seen">${ico("i-check")}</span>`:""}<div class="art">${artOf(p)}</div><div class="info"><b>${p.title}</b></div></div></button>`}).join("");
  $("gColCount").textContent=`${st.got.length} of ${PROJECTS.length} cards collected`;$("gColBar").style.width=st.got.length/PROJECTS.length*100+"%";packLabel();
}
$("gFilters").addEventListener("click",e=>{const b=e.target.closest("button");if(b){gFilter=b.dataset.f;buzz(8);renderCards()}});
$("gCards").addEventListener("click",e=>{const c=e.target.closest(".g-card");if(!c)return;const i=+c.dataset.i;buzz(15);c.classList.add("flip");
  setTimeout(()=>{c.classList.remove("flip");show(i);if(!st.seen.includes(i)){st.seen.push(i);save();addXp(10,c);if(st.seen.length>=3)unlock("cards3")}renderCards()},420)});

/* ---- trophies ---- */
function renderTrophies(){$("gSnd").classList.toggle("on",st.snd);$("gAchList").innerHTML=ACH.map(a=>`<div class="g-ach-item${st.ach.includes(a.id)?" got":""}"><span class="ic">${achIc(a)}</span><div><b>${a.t}</b><small>${a.d}</small></div></div>`).join("");
  $("gAchCount").textContent=`${st.ach.length} of ${ACH.length} unlocked · Level ${lvl()}`;$("gVib").classList.toggle("on",st.vib)}
$("gSnd").onclick=()=>{st.snd=!st.snd;save();renderTrophies();sfx("tap")};
$("gHire").onclick=()=>openLevel(LEVELS.length-1);
$("gVib").onclick=()=>{st.vib=!st.vib;save();renderTrophies();buzz(20)};
$("gReset").onclick=()=>{if(!confirm("Reset all progress?"))return;st={...blank};save();tokenAt=0;renderAll();go("start")};

/* ---- falling stars mini game ---- */
setInterval(()=>{if(!document.body.classList.contains("game-mode")||document.hidden||sheet.classList.contains("open"))return;
  if(G.querySelectorAll(".g-fall").length>=4||reduce)return;
  const s=document.createElement("button"),big=Math.random()<.15;s.className="g-fall";s.dataset.v=big?5:1;s.innerHTML=ico(big?"s-star-glow":"s-star");s.setAttribute("aria-label","Catch star");
  s.style.left=8+Math.random()*80+"%";s.style.animationDuration=6+Math.random()*5+"s";
  s.addEventListener("pointerdown",e=>{e.stopPropagation();const v=+s.dataset.v;st.coins+=v;save();hud();plus("+"+v,s);buzz(12);sfx("coin");
    const c=$("gCoins");c.classList.remove("bump");void c.offsetWidth;c.classList.add("bump");s.remove();if(st.coins>=10)unlock("coins10")});
  s.addEventListener("animationend",()=>s.remove());G.appendChild(s)},1400);


/* ---- sound (tiny synthesized blips, no files) ---- */
let actx;
function sfx(type){if(!st.snd)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();
  const seq={tap:[[660,.05]],coin:[[988,.05],[1319,.1]],hit:[[160,.22,"sawtooth"]],level:[[523,.09],[659,.09],[784,.09],[1047,.25]],
    pack:[[392,.07],[523,.07],[784,.18]],flip:[[880,.04]],legend:[[784,.09],[988,.09],[1175,.09],[1568,.4]],ach:[[784,.08],[1047,.16]],count:[[440,.12]],go:[[880,.25]]}[type];
  let t=actx.currentTime;seq.forEach(([f,d,w])=>{const o=actx.createOscillator(),g=actx.createGain();o.type=w||"triangle";o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(actx.destination);o.start(t);o.stop(t+d+.02);t+=d*.85})}catch{}}

/* ---- animated tab bar ---- */
const tabs=G.querySelector(".g-tabs"),ind=document.createElement("span");ind.className="g-ind";tabs.prepend(ind);
function moveInd(){const a=tabs.querySelector("button.active");if(!a)return;ind.style.left=a.offsetLeft+a.offsetWidth/2+"px"}
tabs.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;sfx("tap");b.classList.remove("pressed");void b.offsetWidth;b.classList.add("pressed")});
addEventListener("resize",moveInd);
function badge(){const el=$("gAchBadge");el.textContent=st.newAch||"";el.classList.toggle("on",!!st.newAch)}

/* ---- card packs ---- */
function packCost(){return st.freePack?0:10}
function packLabel(){$("gPackBtn").innerHTML=uiImg("toybox")+(st.freePack?" Open free pack":` Open pack · 10${COIN}`)}
$("gPackBtn").onclick=()=>{const b=$("gPackBtn");if(st.coins<packCost()){b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");buzz([20,30,20]);sfx("hit");say("Catch more stars in Star Catcher!");return}
  st.coins-=packCost();st.freePack=false;save();hud();packLabel();openPack()};
function roll(){const r=Math.random(),tier=r<.05?3:r<.17?2:r<.45?1:0;
  let pool=PROJECTS.map((p,i)=>i).filter(i=>(PROJECTS[i].rar||0)===tier);const fresh=pool.filter(i=>!st.got.includes(i));
  if(fresh.length&&Math.random()<.8)pool=fresh;return pool[Math.floor(Math.random()*pool.length)]}
function openPack(){const stage=$("gPackStage"),hint=$("gPackHint");$("gPack").classList.add("open");sfx("pack");
  stage.innerHTML=`<div class="g-packbox" id="gPackBox"><img src="assets/logo.png" alt=""><b>ART PACK</b></div>`;hint.textContent="Tap the pack to open it";
  $("gPackBox").onclick=function(){if(this.classList.contains("rip"))return;this.classList.add("rip");buzz([10,20,10,40]);sfx("pack");
    const pulls=[roll(),roll(),roll()];
    setTimeout(()=>{stage.innerHTML=`<div class="g-pull">${pulls.map((i,k)=>{const p=PROJECTS[i],[rn,rc]=RARITY[p.rar||0];
      return `<div class="g-pc${p.rar===3?" legend":""}" style="--rc:${rc};animation-delay:${k*.12}s" data-i="${i}"><div class="back"><img src="assets/logo.png" alt=""></div><div class="front"><img src="${p.img}" alt="" onload="this.classList.add('ok')" style="transition:opacity .4s"><small>${rn}</small><b>${p.title}</b></div></div>`}).join("")}</div>`;
      hint.textContent="Tap each card to flip it";let flipped=0,newOnes=0;
      stage.querySelectorAll(".g-pc").forEach(c=>c.onclick=()=>{if(c.classList.contains("flipped"))return;c.classList.add("flipped");flipped++;
        const i=+c.dataset.i;if(!st.got.includes(i)){st.got.push(i);newOnes++}save();
        if(PROJECTS[i].rar===3){sfx("legend");buzz([30,30,80]);if(typeof confetti==="function")confetti();unlock("legend")}else sfx("flip");
        if(flipped===3){unlock("pack");addXp(15);hint.innerHTML=`${newOnes} new card${newOnes===1?"":"s"}! <button class="g-btn sm" id="gPackDone" style="margin-left:8px">Collect</button>`;
          $("gPackDone").onclick=()=>{$("gPack").classList.remove("open");renderCards(pulls);if(st.got.length>=PROJECTS.length)unlock("complete")}}})},650)}}
G.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>{$(b.dataset.close).classList.remove("open");renderCards()});

/* ---- Star Catcher arcade ---- */
const cv=$("gCanvas"),ctx=cv.getContext("2d"),heroImg=new Image();heroImg.src="assets/hero.png";
let A=null,raf=0;
function sizeCanvas(){const d=Math.min(devicePixelRatio||1,2);cv.width=cv.clientWidth*d;cv.height=cv.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)}
function startArcade(){$("gArcade").classList.add("open");$("gResult").classList.remove("show");sizeCanvas();
  const W=cv.clientWidth,H=cv.clientHeight;
  A={W,H,score:0,lives:3,t:30,items:[],parts:[],texts:[],px:W/2,tx:W/2,spawn:0,shake:0,run:false,stars:Array.from({length:50},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.5,v:20+Math.random()*60}))};
  hudA();cancelAnimationFrame(raf);let last=performance.now();const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);draw();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  let n=3;const cd=$("gCount");const tick=()=>{if(!A)return;if(n>0){cd.innerHTML=`<span>${n}</span>`;sfx("count");n--;setTimeout(tick,800)}else{cd.innerHTML=`<span>GO!</span>`;sfx("go");A.run=true;setTimeout(()=>cd.innerHTML="",800)}};tick()}
function hudA(){$("gScore").innerHTML=COIN+A.score;$("gLives").innerHTML=[0,1,2].map(k=>ico("s-heart",k<A.lives?"ico":"ico lost")).join("");$("gLives").setAttribute("aria-label",A.lives+" lives");$("gTime").style.width=A.t/30*100+"%"}
// sprite, value, size: star shape +1, palette +3, glowing star +5, teal virus = hazard
const KINDS=[["star",1,36],["palette",3,40],["glow",5,48],["virus",-1,40]];
function svgSprite(id){const sym=document.getElementById(id),i=new Image();
  i.src="data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sym.getAttribute("viewBox")}" width="96" height="96">${sym.innerHTML}</svg>`);return i}
function pngSprite(n){const i=new Image();i.src=`assets/ui/${n}.png`;return i}
const SPR={star:svgSprite("s-star"),glow:svgSprite("s-star-glow"),palette:pngSprite("palette"),virus:pngSprite("virus")};
function step(dt){const a=A;if(!a)return;
  a.stars.forEach(s=>{s.y+=s.v*dt;if(s.y>a.H)s.y=0});
  a.px+=(a.tx-a.px)*Math.min(1,dt*14);
  a.parts=a.parts.filter(p=>(p.life-=dt)>0);a.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt});
  a.texts=a.texts.filter(t=>(t.life-=dt)>0);a.texts.forEach(t=>t.y-=60*dt);
  a.shake=Math.max(0,a.shake-dt*30);
  if(!a.run)return;
  a.t-=dt;const prog=1-a.t/30;a.spawn-=dt;
  if(a.spawn<=0){a.spawn=.55-prog*.3;let r=Math.random(),k=KINDS[0];
    const rockP=.18+prog*.15;if(r<rockP)k=KINDS[3];else{r=Math.random();k=r<.07?KINDS[2]:r<.25?KINDS[1]:KINDS[0]}
    a.items.push({k,x:24+Math.random()*(a.W-48),y:-30,v:150+prog*220+Math.random()*60,r:(Math.random()-.5)*4,rot:0})}
  const py=a.H-120;
  a.items.forEach(it=>{it.y+=it.v*dt;it.rot+=it.r*dt;
    if(!it.dead&&Math.abs(it.x-a.px)<46&&Math.abs(it.y-(py-10))<44){it.dead=true;
      if(it.k[1]<0){a.lives--;a.shake=12;sfx("hit");buzz([40,30,60]);$("gFlash").classList.remove("on");void $("gFlash").offsetWidth;$("gFlash").classList.add("on");burst(it.x,it.y,"#FF6B6B",16)}
      else{a.score+=it.k[1];sfx("coin");buzz(8);burst(it.x,it.y,it.k[1]>=5?"#FFB400":it.k[1]===3?"#7ED9B0":"#FFE08A",10+it.k[1]*2);a.texts.push({x:it.x,y:it.y,s:"+"+it.k[1],life:.8})}
      hudA()}});
  a.items=a.items.filter(it=>!it.dead&&it.y<a.H+40);
  $("gTime").style.width=Math.max(0,a.t/30*100)+"%";
  if(a.t<=0||a.lives<=0)endArcade()}
function burst(x,y,c,n){for(let i=0;i<n;i++){const ang=Math.random()*Math.PI*2,sp=120+Math.random()*220;A.parts.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-150,c,life:.6+Math.random()*.4,s:3+Math.random()*4})}}
function draw(){const a=A;if(!a)return;const sx=(Math.random()-.5)*a.shake,sy=(Math.random()-.5)*a.shake;
  ctx.save();ctx.clearRect(0,0,a.W,a.H);const g=ctx.createLinearGradient(0,0,0,a.H);g.addColorStop(0,"#40236a");g.addColorStop(1,"#120a1f");ctx.fillStyle=g;ctx.fillRect(0,0,a.W,a.H);
  ctx.translate(sx,sy);ctx.fillStyle="#fff";a.stars.forEach(s=>{ctx.globalAlpha=.3+s.s/4;ctx.fillRect(s.x,s.y,s.s,s.s)});ctx.globalAlpha=1;
  ctx.textAlign="center";ctx.textBaseline="middle";
  a.items.forEach(it=>{ctx.save();ctx.translate(it.x,it.y);ctx.rotate(it.rot);if(it.k[1]>=5){ctx.shadowColor="#FFB400";ctx.shadowBlur=20}const im=SPR[it.k[0]],z=it.k[2];if(im.complete&&im.naturalWidth)ctx.drawImage(im,-z/2,-z/2,z,z);ctx.restore()});
  a.parts.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.fill()});ctx.globalAlpha=1;
  ctx.font="bold 24px Fredoka, sans-serif";ctx.fillStyle="#FFB400";ctx.strokeStyle="#2B1342";ctx.lineWidth=5;a.texts.forEach(t=>{ctx.globalAlpha=Math.min(1,t.life*2);ctx.strokeText(t.s,t.x,t.y);ctx.fillText(t.s,t.x,t.y)});ctx.globalAlpha=1;
  const pw=96,ph=pw*780/540,py=a.H-120,tilt=(a.tx-a.px)*.004,bob=Math.sin(performance.now()/180)*3;
  ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.ellipse(a.px,a.H-28,40,9,0,0,7);ctx.fill();
  ctx.save();ctx.translate(a.px,py+bob);ctx.rotate(Math.max(-.3,Math.min(.3,tilt)));if(heroImg.complete&&heroImg.naturalWidth)ctx.drawImage(heroImg,-pw/2,-ph*.55,pw,ph);ctx.restore();
  ctx.restore()}
function aim(e){if(!A)return;const r=cv.getBoundingClientRect(),x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;A.tx=Math.max(40,Math.min(A.W-40,x))}
cv.addEventListener("pointerdown",aim);cv.addEventListener("pointermove",aim);cv.addEventListener("touchmove",e=>{aim(e);e.preventDefault()},{passive:false});
function endArcade(){const a=A;a.run=false;const best=Math.max(st.best||0,a.score),rec=a.score>(st.best||0)&&a.score>0;st.best=best;st.coins+=a.score;save();hud();
  if(a.score>=40)unlock("arcade");if(st.coins>=10)unlock("coins10");
  $("gResTitle").textContent=a.lives<=0?"Ouch!":rec?"New record!":"Time's up!";$("gResScore").innerHTML=COIN+a.score;
  $("gResText").textContent=`+${a.score} coins · best ${best}`;$("gResult").classList.add("show");sfx(rec?"legend":"level");if(rec&&typeof confetti==="function")confetti();addXp(Math.min(50,a.score))}
function quitArcade(){cancelAnimationFrame(raf);A=null;$("gArcade").classList.remove("open");$("gCount").innerHTML="";packLabel()}
$("gArcadeX").onclick=quitArcade;$("gResBack").onclick=()=>{quitArcade();go("map")};$("gAgain").onclick=startArcade;
G.querySelectorAll("[data-arcade]").forEach(b=>b.onclick=()=>{sfx("tap");startArcade()});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&A&&A.run){A.run=false;setTimeout(()=>{if(A)A.run=true},300)}});

function renderAll(){hud();renderMap();renderCards();renderTrophies();badge();setTimeout(moveInd,60)}
setMode();
})();
