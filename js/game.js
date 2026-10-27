// Game mode (phones, ?game, deep links, or the Capacitor app). Round 1 is "play your way": no coins, packs, XP,
// trophies or lives, and nothing is ever locked. Screens: start, map, Art, Mine; overlays: level sheets, the Hire
// sheet, Star Catcher. Coloring lives in js/color.js and talks to this file through window.Game.
(function(){
const G=document.getElementById("game"), $=id=>document.getElementById(id);
const native=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const LEVELS=[
  {id:"about",   icon:"ekky",         key:"level.1"},
  {id:"color",   icon:"pen-hand",     key:"level.2"},
  {id:"art",     icon:"palette",      key:"level.3"},
  {id:"process", icon:"ghost",        key:"level.4"},
  {id:"hire",    icon:"monster-head", key:"town.hire"},
];
const RARITY=["#B8D5FF","#7ED9B0","#C9A7FF","#FFB400"];   // cosmetic frame colors only
// Things you made, kept on this device: colorings (js/color.js), best Star Catcher run, settings. Sound is off by default on the web.
const blank={snd:native,vib:true,best:0,colorings:{}};
let st;try{st=Object.assign({},blank,JSON.parse(localStorage.getItem("ekkyGame")||"{}"))}catch{st={...blank}}
["xp","coins","visited","seen","got","ach","freePack","newAch"].forEach(k=>delete st[k]);   // round-0 meta-game, gone
const save=()=>{try{localStorage.setItem("ekkyGame",JSON.stringify(st))}catch{}};
const buzz=ms=>{if(st.vib&&navigator.vibrate)try{navigator.vibrate(ms)}catch{}};
const contactReady=!!CONFIG.email;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---- text: t() and COPY (English and Indonesian) live in js/data.js ---- */
G.querySelectorAll("[data-t]").forEach(el=>el.textContent=t(el.dataset.t));
G.querySelectorAll("[data-t-aria]").forEach(el=>el.setAttribute("aria-label",t(el.dataset.tAria)));

/* ---- mode switching ---- */
const phone=matchMedia("(max-width:760px)");
const pref=()=>{try{return localStorage.getItem("ekkyMode")}catch{return null}};
const q=new URLSearchParams(location.search);
const deep=["color","challenge","card"].some(k=>q.has(k));   // any deep link opens game mode, on desktop too (B12)
function setMode(){const on=native||deep||q.has("game")||(phone.matches&&pref()!=="classic");
  document.body.classList.toggle("game-mode",on);if(on)renderAll()}
document.querySelectorAll("[data-classic]").forEach(b=>b.onclick=()=>{try{localStorage.setItem("ekkyMode","classic")}catch{};
  document.body.classList.remove("game-mode");const u=new URL(location);u.searchParams.delete("game");history.replaceState(null,"",u)});
$("gFab").onclick=()=>{try{localStorage.removeItem("ekkyMode")}catch{};document.body.classList.add("game-mode");renderAll()};
phone.addEventListener("change",setMode);

/* ---- sky ---- */
$("gSky").innerHTML=Array.from({length:60},()=>{const s=1+Math.random()*3;
  return `<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;width:${s}px;height:${s}px;opacity:${.3+Math.random()*.7};animation-delay:${-Math.random()*3}s"></i>`}).join("");

/* ---- screens and tabs ---- */
let screen="start";
function go(to){
  if(to==="color")return typeof Color!=="undefined"?Color.openPicker():null;
  if(to==="hire")return openHire();
  screen=to;G.classList.toggle("at-start",to==="start");
  G.querySelectorAll(".g-screen").forEach(s=>s.classList.toggle("active",s.id==="g-"+to));
  G.querySelectorAll(".g-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===to));
  if(to==="mine")renderMine();
  if(to==="art"&&!artDone){artDone=true;renderArt()}
  if(to==="map")renderMap();
  requestAnimationFrame(moveInd);
}
G.querySelector(".g-tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(b){buzz(10);go(b.dataset.tab)}});
G.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(g){buzz(10);sfx("tap");go(g.dataset.go)}
  if(e.target.closest("[data-hire]")){buzz(10);openHire()}});

/* ---- start screen: the featured six open the lightbox ---- */
function renderStart(){const six=featuredSix().map(p=>({p,i:PROJECTS.indexOf(p)}));
  $("gFeatured").innerHTML=six.map(({p,i})=>`<button class="g-feat" data-i="${i}" aria-label="${esc(ptitle(p))}"><img src="${p.img}" alt="" decoding="async"><b>${esc(ptitle(p))}</b></button>`).join("")}
$("gFeatured").addEventListener("click",e=>{const b=e.target.closest(".g-feat");if(b){buzz(10);show(+b.dataset.i)}});

/* ---- map: an isometric world of 5 floating islands, never locked, no "next level" pressure (B06) ---- */
// Each place is a small isometric island (grass top, earth sides) with Ekky's cut-out standing on it; plank bridges join them.
const ISLAND={about:["#7ED9B0","#3f9f74","#2f7d59"],color:["#FFD45C","#c99a1e","#a87d12"],art:["#C9A7FF","#8f6fd1","#7558b5"],
  process:["#B8D5FF","#7a9fd6","#5f84bd"],hire:["#FF9A8A","#d45a45","#a8402f"]};
function isoIsland(n,tw,d,[top,left,right]){const th=tw/2,W=n*tw,H=n*th;let grid="";
  for(let k=1;k<n;k++)grid+=`M${W/2-k*tw/2} ${k*th/2}L${W-k*tw/2} ${H/2+k*th/2}M${W/2+k*tw/2} ${k*th/2}L${k*tw/2} ${H/2+k*th/2}`;
  return `<svg class="g-iso" width="${W}" height="${H+d}" viewBox="0 0 ${W} ${H+d}" aria-hidden="true">
    <path d="M0 ${H/2}L${W/2} ${H}V${H+d}L0 ${H/2+d}z" fill="${left}"/><path d="M${W/2} ${H}L${W} ${H/2}V${H/2+d}L${W/2} ${H+d}z" fill="${right}"/>
    <path d="M${W/2} 0L${W} ${H/2}L${W/2} ${H}L0 ${H/2}z" fill="${top}"/><path d="${grid}" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
    <path d="M0 ${H/2}L${W/2} 0L${W} ${H/2}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="${W/2}" cy="${H/2+2}" rx="${tw*.55}" ry="${th*.45}" fill="#2B1342" opacity=".22"/></svg>`}
function renderMap(){
  const W=$("gMapWrap"),cw=Math.min(420,W.clientWidth||innerWidth-32),TOP=52,STEP=62,D=12;
  const P=LEVELS.map((l,i)=>{const last=i===LEVELS.length-1,n=3,tw=last?42:36,s=last?60:52;
    return {l,i,n,tw,s,H:n*tw/2,x:cw*(last?.38:i%2?.72:.28),y:TOP+i*STEP+(last?18:0)}});
  const last=P[P.length-1],h=last.y+last.H/2+D+30;
  let planks="";for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],steps=Math.floor(Math.hypot(b.x-a.x,b.y-a.y)/13);
    for(let k=1;k<steps;k++){const x=a.x+(b.x-a.x)*k/steps,y=a.y+(b.y-a.y)*k/steps;planks+=`<path d="M${x.toFixed(1)} ${(y-3).toFixed(1)}l7 3-7 3-7-3z"/>`}}
  W.style.height=h+"px";
  W.innerHTML=`<svg class="g-bridges" width="${cw}" height="${h}" viewBox="0 0 ${cw} ${h}" aria-hidden="true"><g fill="#c98a4a" stroke="#7a4a22" stroke-width="1.2" stroke-linejoin="round">${planks}</g></svg>`+
    P.map(({l,i,n,tw,s,H,x,y})=>`<button class="g-node g-place" style="left:${x}px;top:${y-s+4}px;--s:${s}px;--h:${H}px" data-l="${i}" aria-label="${esc(t(l.key))}">
      ${uiImg(l.icon,"g-place-ic")}${isoIsland(n,tw,D,ISLAND[l.id])}<span class="g-place-label">${esc(t(l.key))}</span></button>`).join("");
}
$("gMapWrap").addEventListener("click",e=>{const n=e.target.closest(".g-node");if(!n)return;buzz(15);sfx("tap");openLevel(+n.dataset.l)});

/* ---- sheets ---- */
const sheet=$("gSheet");let sheetFrom=null;
function openSheet(html){$("gSheetBody").innerHTML=html;sheetFrom=document.activeElement;sheet.classList.add("open");sheet.firstElementChild.scrollTop=0;
  setTimeout(()=>$("gSheetX").focus({preventScroll:true}),50)}
function closeSheet(){sheet.classList.remove("open");if(sheetFrom&&sheetFrom.focus)sheetFrom.focus({preventScroll:true})}
$("gSheetX").onclick=closeSheet;sheet.addEventListener("click",e=>{if(e.target===sheet)closeSheet()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&sheet.classList.contains("open"))closeSheet()});
let sy=null;sheet.firstElementChild.addEventListener("touchstart",e=>{sy=sheet.firstElementChild.scrollTop>0?null:e.touches[0].clientY},{passive:true});
sheet.firstElementChild.addEventListener("touchend",e=>{if(sy!==null&&e.changedTouches[0].clientY-sy>90)closeSheet();sy=null});
// Every sheet ends with a Hire button (B07); the HUD chip above the sheet's backdrop stays tappable too.
const hireChip=()=>`<p class="g-sheet-hire"><button class="g-hire" data-hire aria-label="${esc(t("hire.chip.aria"))}"><img src="assets/ui/monster-head.png" alt=""><span>${esc(t("sheet.hire"))}</span></button></p>`;
const head=l=>`<h2 id="gSheetTitle">${uiImg(l.icon,"h-ico")}${esc(t(l.key))}</h2>`;
function openLevel(i){const l=LEVELS[i];
  if(l.id==="color")return go("color");
  if(l.id==="art")return go("art");
  if(l.id==="hire")return openHire();
  if(l.id==="about"){const three=featuredSix(3).map(p=>({p,k:PROJECTS.indexOf(p)}));
    const facts=["about.fact.from","about.fact.lang","about.fact.hours"].map(k=>t(k)).filter(v=>v&&!v.startsWith("about."));
    openSheet(head(l)+`<p>${esc(t("about.body"))}</p>${facts.length?`<ul class="g-facts">${facts.map(f=>`<li>${esc(f)}</li>`).join("")}</ul>`:""}<h3 class="g-sheet-h3">${esc(t("about.pieces"))}</h3>
      <div class="g-three">${three.map(({p,k})=>`<button class="g-feat" data-i="${k}" aria-label="${esc(ptitle(p))}"><img src="${p.img}" alt="" loading="lazy"><b>${esc(ptitle(p))}</b></button>`).join("")}</div>`+hireChip())}
  if(l.id==="process"){openSheet(head(l)+`<p>${esc(t("process.intro"))}</p>`+
    [["Brief & chat","We talk about your idea, audience and the feeling it should give."],["Sketches","Rough concepts so we pick a direction early."],["Color & polish","Line, color and texture, with room for revisions."],["Delivery","Final files for print, web and social."]]
     .map(([h,d],k)=>`<div class="g-quest" data-k="${k}"><span class="chk">${ico("i-check")}</span><div><b>${esc(tt(`process.step${k+1}`,h))}</b><p>${esc(tt(`process.step${k+1}.body`,d))}</p></div></div>`).join("")+hireChip());
    // the steps tick one after another, slowly, so the order of the process reads (B39)
    setTimeout(()=>$("gSheetBody").querySelectorAll(".g-quest").forEach(q=>setTimeout(()=>q.classList.add("ok"),reduce?0:500+q.dataset.k*600)),300)}
}
$("gSheetBody").addEventListener("click",e=>{const f=e.target.closest(".g-feat");if(f){show(+f.dataset.i)}});

/* ---- Final Quest: the Hire sheet (B07, B17). Opens over the current screen; closing returns there. ---- */
function openHire(prefill){const l=LEVELS[4];
  // Quick actions lead with the business email; every other channel shows only when CONFIG has it (B15).
  const links=[["instagram","hire.instagram"],["linkedin","hire.linkedin"],["behance","hire.behance"]].filter(([k])=>CONFIG.links[k]);
  const quick=`<div class="g-quick">
      ${CONFIG.email?`<a class="g-btn" href="mailto:${esc(CONFIG.email)}">${ico("i-mail")} ${esc(t("hire.email"))}</a>`:`<a class="g-btn" href="${esc(hireTarget().href)}" target="_blank" rel="noopener">${ico("i-send")} ${esc(t("hire.chip"))}</a>`}
      ${CONFIG.whatsapp?`<a class="g-btn alt" href="https://wa.me/${esc(String(CONFIG.whatsapp).replace(/\D/g,""))}" target="_blank" rel="noopener">${ico("i-chat")} ${esc(t("hire.whatsapp"))}</a>`:""}
      ${CONFIG.email?`<button class="g-btn alt" type="button" id="gCopyMail">${ico("i-copy")} ${esc(t("hire.copy"))}</button>`:""}</div>
    ${links.length||CONFIG.website?`<p class="g-links">${links.map(([k,c])=>`<a href="${esc(CONFIG.links[k])}" target="_blank" rel="noopener">${esc(t(c))}</a>`).join("")}${CONFIG.website?`<a href="${esc(CONFIG.website)}" target="_blank" rel="noopener">${esc(t("hire.website"))}</a>`:""}</p>`:""}`;
  const types=t("hire.form.types").split("|");
  openSheet(`<h2 id="gSheetTitle">${uiImg(l.icon,"h-ico")}${esc(t("hire.title"))}</h2>
    <p>${esc(t("hire.body"))}</p>${quick}<p class="g-small">${esc(t("hire.price"))}</p>
    <h3 class="g-sheet-h3">${esc(t("hire.form.title"))}</h3>
    <form id="gForm" novalidate>
      <label>${esc(t("hire.form.name"))}<input name="name" autocomplete="name" required><span class="err"></span></label>
      <label>${esc(t("hire.form.type"))}<select name="type">${types.map(o=>`<option>${esc(o)}</option>`).join("")}</select></label>
      <label>${esc(t("hire.form.msg"))}<textarea name="message" required minlength="10" placeholder="${esc(t("hire.form.msg.ph"))}">${esc(prefill||"")}</textarea><span class="err"></span></label>
      <button class="g-btn" type="submit" style="width:100%">${ico("i-send")} ${esc(t("hire.form.send"))}</button>
    </form>`);
  const c=$("gCopyMail");if(c)c.onclick=async()=>{try{await navigator.clipboard.writeText(CONFIG.email);say(t("hire.copied"),"i-check")}catch{say(CONFIG.email)}};
}
$("gSheetBody").addEventListener("submit",e=>{e.preventDefault();const f=e.target;let ok=true;
  f.querySelectorAll("[required]").forEach(i=>{const m=i.validity.valueMissing?"This one's needed":i.validity.tooShort?"A few more words, please":"";
    i.parentElement.querySelector(".err").textContent=m;if(m)ok=false});
  if(!ok){buzz([20,40,20]);if(!reduce)f.animate([{transform:"translateX(0)"},{transform:"translateX(-8px)"},{transform:"translateX(8px)"},{transform:"translateX(0)"}],{duration:300});return}
  const d=Object.fromEntries(new FormData(f));sfx("level");if(typeof confetti==="function")confetti();closeSheet();say(t("hire.sent"),"i-check");
  const go=CONFIG.email?`mailto:${CONFIG.email}?subject=${encodeURIComponent(d.type+" project from "+d.name)}&body=${encodeURIComponent(d.message+"\n\n"+d.name)}`:hireTarget().href;
  setTimeout(()=>{if(go.startsWith("mailto:"))location.href=go;else open(go,"_blank","noopener")},900)});

/* ---- Art: every piece, free to view; rarity is only a frame color ---- */
let gFilter="all";
function renderArt(){
  $("gFilters").innerHTML=[["all","All"],["illustration","Illustration"],["web","Web & UI"],["branding","Branding"],["social","Social"]]
    .map(([f,n])=>`<button class="${f===gFilter?"active":""}" data-f="${f}" aria-pressed="${f===gFilter}">${catImg(f)}${esc(tt("filter."+f,n))}</button>`).join("");
  const list=PROJECTS.map((p,i)=>({p,i})).filter(x=>gFilter==="all"||x.p.cat===gFilter);
  $("gCards").innerHTML=list.map(({p,i},k)=>`<button class="g-card${p.rar===3?" legendary":""}" data-i="${i}" style="--rc:${RARITY[p.rar||0]};animation-delay:${Math.min(k,12)*.04}s"><div class="inner">
      <span class="gcat">${catImg(p.cat,"")}</span><div class="art">${artOf(p)}</div><div class="info"><b>${esc(ptitle(p))}</b>${p.label?`<span class="g-tag">${esc(plabel(p))}</span>`:""}</div></div></button>`).join("");
  $("gArtCount").textContent=t("art.count",{n:list.length});
}
$("gFilters").addEventListener("click",e=>{const b=e.target.closest("button");if(b){gFilter=b.dataset.f;buzz(8);artDone=true;renderArt()}});
$("gCards").addEventListener("click",e=>{const c=e.target.closest(".g-card");if(!c)return;buzz(15);sfx("flip");show(+c.dataset.i)});

/* ---- Mine: things you made, never rewards ---- */
function renderMine(){
  const list=Object.entries(st.colorings||{}).sort((a,b)=>(b[1].at||0)-(a[1].at||0));
  $("gMineList").innerHTML=list.length?list.map(([id,c])=>`<button class="g-mine-item" data-page="${esc(id)}" aria-label="${esc(c.title||id)}">${c.thumb?`<img src="${c.thumb}" alt="">`:""}<b>${esc(c.title||id)}</b></button>`).join(""):`<p class="g-small">${esc(t("mine.empty"))}</p>`;
  if($("gBest"))$("gBest").innerHTML=st.best?`${ico("s-star")} ${esc(t("mine.best",{n:st.best}))}`:esc(t("mine.best.none"));
  syncToggles();
}
$("gMineList").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b&&typeof Color!=="undefined")Color.open(b.dataset.page)});
function syncToggles(){
  [$("gSnd"),$("gSndSwitch")].forEach(b=>{if(!b)return;b.classList.toggle("on",st.snd);b.setAttribute(b.id==="gSnd"?"aria-pressed":"aria-checked",st.snd)});
  $("gVib").classList.toggle("on",st.vib);$("gVib").setAttribute("aria-checked",st.vib)}
const toggleSnd=()=>{st.snd=!st.snd;save();syncToggles();sfx("tap")};
if($("gSnd"))$("gSnd").onclick=toggleSnd;if($("gSndSwitch"))$("gSndSwitch").onclick=toggleSnd;
$("gVib").onclick=()=>{st.vib=!st.vib;save();syncToggles();buzz(20)};
$("gReset").onclick=()=>{if(!confirm(t("mine.reset.confirm")))return;st={...blank,snd:st.snd,vib:st.vib};save();renderMine()};

/* ---- sound (tiny synthesized blips, no files); off until turned on ---- */
let actx;
function sfx(type){if(!st.snd||!feature("sound"))return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();
  const seq={tap:[[660,.05]],coin:[[988,.05],[1319,.1]],hit:[[160,.22,"sawtooth"]],level:[[523,.09],[659,.09],[784,.09],[1047,.25]],
    flip:[[880,.04]],legend:[[784,.09],[988,.09],[1175,.09],[1568,.4]],count:[[440,.12]],go:[[880,.25]],fill:[[740,.04],[988,.06]]}[type];
  let t0=actx.currentTime;seq.forEach(([f,d,w])=>{const o=actx.createOscillator(),g=actx.createGain();o.type=w||"triangle";o.frequency.setValueAtTime(f,t0);
    g.gain.setValueAtTime(.14,t0);g.gain.exponentialRampToValueAtTime(.001,t0+d);o.connect(g).connect(actx.destination);o.start(t0);o.stop(t0+d+.02);t0+=d*.85})}catch{}}

/* ---- animated tab bar ---- */
const tabs=G.querySelector(".g-tabs"),ind=document.createElement("span");ind.className="g-ind";tabs.prepend(ind);
function moveInd(){const a=tabs.querySelector("button.active");ind.style.opacity=a?1:0;if(a)ind.style.left=a.offsetLeft+a.offsetWidth/2+"px"}
tabs.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;sfx("tap");b.classList.remove("pressed");void b.offsetWidth;b.classList.add("pressed")});
addEventListener("resize",moveInd);

/* ---- Star Catcher (B13): one rule, always the full 30 s, no lives, no game over ---- */
// Balance numbers (Game Director): each range goes from the start of the round to the end.
// Retuned after the r1a playtest (docs/playtest-r1a.md): slower and calmer; scripts/sim-stars.mjs checks idle and casual scores.
const BALANCE={seconds:30,spawn:[.75,.45],speed:[110,240],speedRandom:40,hazardShare:[.12,.25],catchStar:30,catchHazard:26,hazardCost:2,
  mix:{glow:.08,palette:.20}};   // of the non-hazard items: 8% glowing star (+5), 20% palette (+3), the rest star (+1)
const KINDS={star:["star",1,36],palette:["palette",3,40],glow:["glow",5,48],virus:["virus",-BALANCE.hazardCost,40]};
function svgSprite(id){const sym=document.getElementById(id),i=new Image();
  i.src="data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sym.getAttribute("viewBox")}" width="96" height="96">${sym.innerHTML}</svg>`);return i}
function pngSprite(n){const i=new Image();i.src=`assets/ui/${n}.png`;return i}
let SPR=null,A=null,raf=0;
const cv=$("gCanvas"),ctx=cv&&cv.getContext("2d"),heroImg=new Image();
function sizeCanvas(){const d=Math.min(devicePixelRatio||1,2);cv.width=cv.clientWidth*d;cv.height=cv.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)}
const lerp=([a,b],k)=>a+(b-a)*k;
function startArcade(){if(!feature("starCatcher")||!cv)return;
  if(!SPR){SPR={star:svgSprite("s-star"),glow:svgSprite("s-star-glow"),palette:pngSprite("palette"),virus:pngSprite("virus")};heroImg.src="assets/hero.png"}
  $("gArcade").classList.add("open");G.classList.add("playing");$("gResult").classList.remove("show");sizeCanvas();
  const W=cv.clientWidth,H=cv.clientHeight;
  A={W,H,score:0,t:BALANCE.seconds,items:[],parts:[],texts:[],px:W/2,tx:W/2,spawn:0,shake:0,run:false,stars:Array.from({length:50},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.5,v:20+Math.random()*60}))};
  hudA();cancelAnimationFrame(raf);let last=performance.now();const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);draw();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  let n=3;const cd=$("gCount");const tick=()=>{if(!A)return;if(n>0){cd.innerHTML=`<span>${n}</span><p>${esc(t("stars.rule"))}</p>`;sfx("count");n--;setTimeout(tick,800)}else{cd.innerHTML=`<span>GO!</span>`;sfx("go");A.run=true;setTimeout(()=>cd.innerHTML="",800)}};tick()}
function hudA(){$("gScore").innerHTML=ico("s-star")+A.score;$("gTime").style.width=Math.max(0,A.t/BALANCE.seconds*100)+"%"}
function step(dt){const a=A;if(!a)return;
  a.stars.forEach(s=>{s.y+=s.v*dt;if(s.y>a.H)s.y=0});
  a.px+=(a.tx-a.px)*Math.min(1,dt*14);
  a.parts=a.parts.filter(p=>(p.life-=dt)>0);a.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt});
  a.texts=a.texts.filter(x=>(x.life-=dt)>0);a.texts.forEach(x=>x.y-=60*dt);
  a.shake=Math.max(0,a.shake-dt*30);
  if(!a.run)return;
  a.t-=dt;const prog=Math.min(1,1-a.t/BALANCE.seconds);a.spawn-=dt;
  if(a.spawn<=0){a.spawn=lerp(BALANCE.spawn,prog);let k;
    if(Math.random()<lerp(BALANCE.hazardShare,prog))k=KINDS.virus;else{const r=Math.random();k=r<BALANCE.mix.glow?KINDS.glow:r<BALANCE.mix.glow+BALANCE.mix.palette?KINDS.palette:KINDS.star}
    a.items.push({k,x:24+Math.random()*(a.W-48),y:-30,v:lerp(BALANCE.speed,prog)+Math.random()*BALANCE.speedRandom,r:(Math.random()-.5)*4,rot:0})}
  const py=a.H-120;
  a.items.forEach(it=>{it.y+=it.v*dt;it.rot+=it.r*dt;const box=it.k[1]<0?BALANCE.catchHazard:BALANCE.catchStar;
    if(!it.dead&&Math.abs(it.x-a.px)<box&&Math.abs(it.y-(py-10))<box){it.dead=true;
      if(it.k[1]<0){a.score=Math.max(0,a.score+it.k[1]);if(!reduce)a.shake=8;sfx("hit");buzz([30,30]);$("gFlash").classList.remove("on");void $("gFlash").offsetWidth;if(!reduce)$("gFlash").classList.add("on");
        burst(it.x,it.y,"#7ED9B0",10);a.texts.push({x:it.x,y:it.y,s:String(it.k[1]),life:.8})}
      else{a.score+=it.k[1];sfx("coin");buzz(8);burst(it.x,it.y,it.k[1]>=5?"#FFB400":it.k[1]===3?"#7ED9B0":"#FFE08A",10+it.k[1]*2);a.texts.push({x:it.x,y:it.y,s:"+"+it.k[1],life:.8})}
      hudA()}});
  a.items=a.items.filter(it=>!it.dead&&it.y<a.H+40);
  $("gTime").style.width=Math.max(0,a.t/BALANCE.seconds*100)+"%";
  if(a.t<=0)endArcade()}
function burst(x,y,c,n){if(reduce)return;for(let i=0;i<n;i++){const ang=Math.random()*Math.PI*2,sp=120+Math.random()*220;A.parts.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-150,c,life:.6+Math.random()*.4,s:3+Math.random()*4})}}
function draw(){const a=A;if(!a)return;const sx=(Math.random()-.5)*a.shake,sy=(Math.random()-.5)*a.shake;
  ctx.save();ctx.clearRect(0,0,a.W,a.H);const g=ctx.createLinearGradient(0,0,0,a.H);g.addColorStop(0,"#40236a");g.addColorStop(1,"#120a1f");ctx.fillStyle=g;ctx.fillRect(0,0,a.W,a.H);
  ctx.translate(sx,sy);ctx.fillStyle="#fff";a.stars.forEach(s=>{ctx.globalAlpha=.3+s.s/4;ctx.fillRect(s.x,s.y,s.s,s.s)});ctx.globalAlpha=1;
  ctx.textAlign="center";ctx.textBaseline="middle";
  a.items.forEach(it=>{ctx.save();ctx.translate(it.x,it.y);ctx.rotate(it.rot);const im=SPR[it.k[0]],z=it.k[2];if(im.complete&&im.naturalWidth)ctx.drawImage(im,-z/2,-z/2,z,z);ctx.restore()});
  a.parts.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.fill()});ctx.globalAlpha=1;
  ctx.font="bold 24px Fredoka, sans-serif";ctx.fillStyle="#FFB400";ctx.strokeStyle="#2B1342";ctx.lineWidth=5;a.texts.forEach(x=>{ctx.globalAlpha=Math.min(1,x.life*2);ctx.strokeText(x.s,x.x,x.y);ctx.fillText(x.s,x.x,x.y)});ctx.globalAlpha=1;
  const pw=96,ph=pw*780/540,py=a.H-120,tilt=(a.tx-a.px)*.004,bob=reduce?0:Math.sin(performance.now()/180)*3;
  ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.ellipse(a.px,a.H-28,40,9,0,0,7);ctx.fill();
  ctx.save();ctx.translate(a.px,py+bob);ctx.rotate(Math.max(-.3,Math.min(.3,tilt)));if(heroImg.complete&&heroImg.naturalWidth)ctx.drawImage(heroImg,-pw/2,-ph*.55,pw,ph);ctx.restore();
  ctx.restore()}
function aim(e){if(!A)return;const r=cv.getBoundingClientRect(),x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;A.tx=Math.max(40,Math.min(A.W-40,x))}
if(cv){cv.addEventListener("pointerdown",aim);cv.addEventListener("pointermove",aim);cv.addEventListener("touchmove",e=>{aim(e);e.preventDefault()},{passive:false})}
function endArcade(){const a=A;a.run=false;const rec=a.score>(st.best||0);st.best=Math.max(st.best||0,a.score);save();
  $("gResTitle").textContent=rec?t("stars.record"):t("stars.end");$("gResScore").innerHTML=ico("s-star")+a.score;
  $("gResText").textContent=t("stars.result",{n:a.score,best:st.best});$("gResult").classList.add("show");G.classList.remove("playing");
  sfx(rec?"legend":"level");if(rec&&typeof confetti==="function")confetti()}
function quitArcade(){cancelAnimationFrame(raf);A=null;pausedByHide=false;$("gArcade").classList.remove("open");G.classList.remove("playing");$("gCount").innerHTML=""}
if(cv){$("gArcadeX").onclick=quitArcade;$("gResBack").onclick=()=>{quitArcade();go("start")};$("gAgain").onclick=startArcade}
G.addEventListener("click",e=>{if(e.target.closest("[data-arcade]")){sfx("tap");startArcade()}});
// A hidden tab pauses the round; it resumes only once the tab is visible again (r1a bug: it used to resume while hidden).
let pausedByHide=false;
document.addEventListener("visibilitychange",()=>{if(!A)return;if(document.hidden){if(A.run){A.run=false;pausedByHide=true}}
  else if(pausedByHide){pausedByHide=false;setTimeout(()=>{if(A&&!document.hidden&&A.t>0)A.run=true},600)}});

// A friend's link draws their coloring first; the start thumbnails and the Art cards load after it (share playtest).
let artDone=false;
function renderAll(){if(deep)setTimeout(renderStart,2500);else renderStart();renderMap();renderMine();setTimeout(moveInd,60)}
// Shared with js/color.js, js/share.js and js/links.js.
window.Game={go,openHire,openSheet,closeSheet,sfx,buzz,save,get st(){return st},esc,contactReady,screen:()=>screen};
window.openHire=openHire;
setMode();
})();
