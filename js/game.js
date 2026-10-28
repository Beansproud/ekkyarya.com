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
  {id:"hire",    icon:"monster-head", from:"hidden-monster", key:"town.hire"},
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
// a phone held sideways is wider than 760 px: keep it in game mode (touch screen, short viewport), or turning the
// phone for a game would drop the visitor onto the classic site
const phone=matchMedia("(max-width:760px), (pointer:coarse) and (max-height:520px)");
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
function go(to,fromPop){
  if(to==="color")return typeof Color!=="undefined"?Color.openPicker():null;
  if(to==="hire")return openHire();
  if(!fromPop&&to!==screen){try{history.pushState({s:to},"")}catch(e){}}   // Back returns to the previous screen
  screen=to;G.classList.toggle("at-start",to==="start");G.classList.toggle("at-paper",to==="art"||to==="mine");   // S1: Art and Mine on paper
  G.querySelectorAll(".g-screen").forEach(s=>s.classList.toggle("active",s.id==="g-"+to));
  G.querySelectorAll(".g-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===to));
  if(to==="mine")renderMine();
  if(to==="start"&&dirty.start){dirty.start=false;renderStart()}
  if(to==="art"&&(!artDone||dirty.art)){artDone=true;dirty.art=false;renderArt()}
  if(to==="map"){if(!mapBuilt||dirty.map){mapBuilt=true;dirty.map=false;renderMap()}else refreshWall()}
  requestAnimationFrame(moveInd);
}
try{history.replaceState({s:"start"},"")}catch(e){}
/* Back closes what is on top (the lightbox, Color, a sheet, the share overlay): each open layer has its own history entry */
const LAYERS=[["lb",()=>$("lightbox"),e=>e.open,e=>e.close()],["color",()=>$("gColor"),e=>e.classList.contains("open"),()=>Color.close()],
  ["sheet",()=>$("gSheet"),e=>e.classList.contains("open"),()=>closeSheet()],["share",()=>$("gShare"),e=>e.classList.contains("open"),()=>{const x=$("sX");if(x)x.click()}]];
const lstack=[];let skipPop=0;
function syncLayers(){LAYERS.forEach(([id,get,isOpen])=>{const el=get();if(!el)return;const on=!!isOpen(el),at=lstack.indexOf(id);
  if(on&&at<0){lstack.push(id);try{history.pushState({s:screen,l:id},"")}catch(e){}}
  else if(!on&&at>=0){lstack.splice(at,1);if(history.state&&history.state.l===id){skipPop++;history.back()}}})}   // closed with its own button: drop its entry
addEventListener("load",()=>{const mo=new MutationObserver(syncLayers);
  LAYERS.forEach(([,get])=>{const el=get();if(el)mo.observe(el,{attributes:true,attributeFilter:["class","open"]})});syncLayers()});
addEventListener("popstate",e=>{if(skipPop){skipPop--;return}
  const id=lstack.pop();if(id){const L=LAYERS.find(x=>x[0]===id);L[3](L[1]());return}
  const to=e.state&&e.state.s;if(to&&to!==screen&&document.body.classList.contains("game-mode"))go(to,true)});
G.querySelector(".g-tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(b){buzz(10);go(b.dataset.tab)}});
G.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(g){buzz(10);sfx("tap");go(g.dataset.go)}
  if(e.target.closest("[data-hire]")){buzz(10);openHire()}});

/* ---- start screen: the featured six open the lightbox ---- */
function renderStart(){const six=featuredSix().map(p=>({p,i:PROJECTS.indexOf(p)}));
  // each drawing opens big on tap; Download lives in the viewer, not on the tile (owner, 10-28)
  $("gFeatured").innerHTML=six.map(({p,i})=>`<div class="g-feat-cell"><button class="g-feat" data-i="${i}" aria-label="${esc(ptitle(p))}"><img src="${thumbOf(p)}" alt="" decoding="async"><b>${esc(ptitle(p))}</b></button>`+
    `</div>`).join("")}
$("gFeatured").addEventListener("click",e=>{const b=e.target.closest(".g-feat");if(b){buzz(10);show(+b.dataset.i)}});

/* ---- map: Ekky's Village (B42 V1). One pre-composited picture (scripts/village.py: plain ground shapes plus Ekky's
   cut-outs, placed as drawn) under real buttons for the places, and four frames on the gallery walls that hang
   featuredPick(4) real pieces on every visit. Never locked, no "next" glow, no boss. ---- */
// place id -> what it opens (index in LEVELS, or Star Catcher), its label key, and a feature switch if it has one
const PLACES=[
  {id:"home",        key:"town.home",    icon:"assets/sprites/home.png",      from:"little-planet", open:p=>openLevel(0,p)},
  {id:"studio",      key:"town.studio",  icon:"assets/sprites/studio.png",    from:"giraffe", open:p=>openLevel(1,p)},
  {id:"gallery",     key:"town.gallery", icon:"assets/sprites/toybox.png",    from:"toybox", open:p=>openLevel(2,p)},
  {id:"doodle",      key:"town.workshop",icon:"assets/ui/ghost.png",          from:"doodles", open:p=>openLevel(3,p)},
  {id:"observatory", key:"town.launch",  icon:"assets/ui/astronaut.png",      from:"nft-3", open:()=>startArcade(), feature:"starCatcher"},
  {id:"hire",        key:"town.hire",    icon:"assets/sprites/gate.png",      open:p=>openHire("",p), hire:true},
];
const pct=(v,of)=>(v/of*100).toFixed(3)+"%";
// the ground is the galaxy cloud (a smooth picture) and its stars and gold constellations (a vector, sharp at any zoom), then one picture per island (so each can bob on its own) and the UFO
function groundHTML(V){const L=V.layers;
  const im=(n,cls)=>{const l=L[n];return `<img class="v-ground ${cls}" data-isle="${n}" src="${l.src}" alt="" decoding="async"${n==="sky"?' fetchpriority="high"':""} style="left:${pct(l.x,V.w)};top:${pct(l.y,V.h)};width:${pct(l.w,V.w)};height:${pct(l.h,V.h)}">`};
  const u=V.ufo,b=u&&u.box;
  return im("sky","v-skyimg")+im("stars","v-skyimg")+im("mid","v-isle")+im("north","v-isle")+im("south","v-isle")+
    (u?`<img class="v-ground v-isle v-ufo" data-isle="north" src="${u.src}" alt="" decoding="async" style="left:${pct(b[0],V.w)};top:${pct(b[1],V.h)};width:${pct(b[2]-b[0],V.w)};height:${pct(b[3]-b[1],V.h)}">`:"")}
let mapTok=0;
const LABEL_NUDGE={studio:[50,0]};   // a2: image px to move a label off its baked spot where it would touch a villager
function renderMap(){
  const V=window.VILLAGE,W=$("gMapWrap");if(!V)return;
  const places=PLACES.filter(p=>!p.feature||feature(p.feature));
  const art=featuredSix(4);
  W.style.height="";W.className="g-map-wrap v-map";W.style.aspectRatio=`${V.w}/${V.h}`;
  // the village fills the screen width, edge to edge through the side gutters (art critic a1), unless the height left
  // between the header and the tab bar is shorter: then the width follows that height
  W.style.width=`min(100% + 32px, 520px, calc((100dvh - 196px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) * ${(V.w/V.h).toFixed(4)}))`;
  W.innerHTML=`<div class="v-zoom" id="gMapZoom">${groundHTML(V)}`+
    V.frames.map((f,k)=>{const p=art[k];if(!p)return "";const deg=(Math.atan(f.slope)*180/Math.PI).toFixed(2);
      return `<img class="v-frame" src="${thumbOf(p)}" alt="" decoding="async" style="left:${pct(f.x,V.w)};top:${pct(f.y,V.h)};width:${pct(f.w,V.w)};height:${pct(f.h,V.h)};transform:skewY(${deg}deg)">`}).join("")+
    places.map(p=>{const b=V.places[p.id].box,n=LABEL_NUDGE[p.id]||[0,0],l=[V.places[p.id].label[0]+n[0],V.places[p.id].label[1]+n[1]];
      return `<button class="v-place${p.hire?" hire":""}" data-place="${p.id}" style="left:${pct(b[0],V.w)};top:${pct(b[1],V.h)};width:${pct(b[2]-b[0],V.w)};height:${pct(b[3]-b[1],V.h)}" aria-label="${esc(t(p.key))}"></button>
      <span class="v-label${p.hire?" hire":""}" data-place="${p.id}" aria-hidden="true" style="left:${pct(l[0],V.w)};top:${pct(l[1],V.h)}">${esc(t(p.key))}</span>`}).join("");
  // the villagers and scenery come a moment later, in an idle slice: the first visit lays out the island and the places only
  const mt=++mapTok;(window.requestIdleCallback||(f=>setTimeout(f,30)))(()=>{const z=$("gMapZoom");if(mt===mapTok&&z){z.insertAdjacentHTML("beforeend",villageLife(V)+`<div class="v-fx" aria-hidden="true"></div>`);lifeStart(z,V)}},{timeout:500});
  W.insertAdjacentHTML("beforeend",`<div class="v-zoomctl"><button class="g-round" data-zoom="1" aria-label="${esc(tt("town.zoomIn","Zoom in"))}">${ico("i-plus")}</button><button class="g-round" data-zoom="-1" aria-label="${esc(tt("town.zoomOut","Zoom out"))}"><b aria-hidden="true">&minus;</b></button></div>`);
  Z.base=null;Z.lb=null;Z.s=1;zoomTo(1,0,0);
  $("gMapList").innerHTML=places.map(p=>`<li><button class="v-row${p.hire?" hire":""}" data-place="${p.id}"><img src="${p.icon}" alt="" loading="lazy">${esc(t(p.key))}</button></li>`).join("");
}
// a revisit hangs four new pieces on the gallery walls without rebuilding the village
function refreshWall(){const art=featuredSix(4);$("gMapWrap").querySelectorAll(".v-frame").forEach((im,k)=>{const p=art[k];if(p&&im.getAttribute("src")!==thumbOf(p))im.src=thumbOf(p)})}   // same picture: no reload on a tab switch
/* ---- Village life (B42 V3), inside the ambience budget (decision 10, docs/motion.md): walkers, two clouds, the
   gate's lantern, the noodle bath's steam and the water shimmer. All CSS animations on transform and opacity, so the
   off-screen pause and reduced motion (villagers stand still) apply; day or night is set once, on load. ---- */
   // 1 tile (36 image px) per 1.6 s; pauses at the ends and corners
function villageLife(V){
  // quiet pass (B43, G1): nothing moves on its own; villagers stand at the start of their path, facing it
  const night=(h=>h<6||h>=19)(new Date().getHours());
  $("gMapWrap").classList.toggle("night",night);
  let html="";
  const card=piece=>{const p=PROJECTS.find(q=>q.id===piece||q.slug===piece);return p&&creative(p)?p:null};
  const btn=(cls,p,sprite,style,inner="")=>`<button class="${cls}" data-piece="${PROJECTS.indexOf(p)}" data-sprite="${esc(sprite)}" style="${style}" aria-label="${esc(t("town.seeArt")+": "+ptitle(p))}">${inner}</button>`;
  const box=b=>`left:${pct(b[0],V.w)};top:${pct(b[1],V.h)};width:${pct(b[2]-b[0],V.w)};height:${pct(b[3]-b[1],V.h)}`;
  for(const [name,f] of Object.entries(V.folk||{})){const p=card(f.piece);if(p)html+=btn("v-folk",p,`assets/sprites/${name}.png`,box(f.box))}
  // V5: client scenery, only with the clientScenery switch; each opens its piece, whose card shows the client tag
  if(feature("clientScenery"))(V.scenery||[]).forEach(c=>{const p=PROJECTS.find(q=>q.slug===c.piece);
    if(p&&p.kind==="client"&&hasRole(p,"village"))html+=btn("v-folk v-scenery",p,c.src,box(c.box),`<img src="${esc(c.src)}" alt="">`)});
  const perPiece={};   // at most 8 villagers, and at most 2 from one piece (UX review)
  (V.walkers||[]).map((w,wi)=>[w,wi]).filter(([w])=>(perPiece[w.piece]=(perPiece[w.piece]||0)+1)<=2).slice(0,8).forEach(([w,wi])=>{const p=card(w.piece);if(!p)return;
    const [a,b]=w.route,face=w.face===0?1:Math.sign(b[0]-a[0]||1)*w.face;
    html+=`<div class="v-walk" data-w="${wi}" style="transform:translate(${pct(a[0],V.w)},${pct(a[1],V.h)})">`+
      btn("v-walker",p,w.src,"",`<img src="${w.src}" alt="" decoding="async" style="height:${(w.h/V.w*100).toFixed(2)}cqw;transform:scaleX(${face})">`)+`</div>`});
  return html}

/* ---- Village alive (Map squad; owner 10-28: "a lot of animation, even when idle", "like 20 different animation that
   changes simultaniously"). Under the always-on life (walkers, clouds, twinkle, lantern, steam, islands bobbing) a
   scheduler starts a new short moment every 1-3 s, so 3 to 5 play at once, each in a different part of the map.
   Every moment is a Web Animation on transform and opacity of Ekky's own sprites or a plain gold or paper shape,
   removed when it ends. Nothing runs when the map is off screen or the tab is hidden; reduced motion shows a still map. ---- */
const Life={tok:0,run:false,tm:0,live:new Map(),recent:[],io:null,V:null,fx:null,ctl:null};
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const EZ="cubic-bezier(.4,0,.2,1)",EZI="cubic-bezier(.22,.61,.36,1)";
const calm=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
// a moment's kit: elements it adds (removed at the end) and animations it starts; map units (601 wide) become cqw
function lifeKit(){const V=Life.V,u=v=>(v/V.w*100).toFixed(3)+"cqw",k={els:[],anims:[]};
  k.at=(x,y)=>`left:${pct(x,V.w)};top:${pct(y,V.h)}`;
  k.add=el=>{Life.fx.appendChild(el);k.els.push(el);return el};
  k.img=(src,x,y,h,cls="")=>{const e=document.createElement("img");e.src=src;e.alt="";e.decoding="async";e.className="v-fxi "+cls;e.style.cssText=`${k.at(x,y)};height:${u(h*1.6)}`;return k.add(e)};   // h is for a small sprite; they read at 1.6x on a phone
  k.dot=(cls,x,y,w,h)=>{const e=document.createElement("i");e.className=cls;e.style.cssText=`${k.at(x,y)};width:${u(w)};height:${u(h||w)}`;return k.add(e)};
  // steps: {t offset 0-1, x, y (map units from the start spot), r deg, s scale, o opacity}
  // a step that leaves x, y, r, s or o out keeps the one before it
  k.mv=(el,steps,dur,ease=EZ)=>{const c={x:0,y:0,r:0,s:1,o:1},a=el.animate(steps.map(s=>{Object.assign(c,{...s,t:undefined});
    return {offset:s.t,transform:`translate(${u(c.x)},${u(c.y)}) rotate(${c.r}deg) scale(${c.s})`,opacity:c.o}}),{duration:dur,easing:ease,fill:"both"});k.anims.push(a);return a};
  return k}
const inBox=(id,fx,fy)=>{const b=Life.V.places[id].box;return [b[0]+(b[2]-b[0])*fx,b[1]+(b[3]-b[1])*fy]};
const SK="assets/sprites/",UI="assets/ui/";
// the 20 moments: id, region (two moments in one region never overlap), length in ms, what happens
const MOMENTS=[
 {id:"shoot",r:"skyT",d:1600,run:k=>{const x=rnd(40,260),y=rnd(10,110),e=k.dot("v-shoot",x,y,9,.5);k.mv(e,[{t:0,o:0,r:32},{t:.12,o:1,x:12,y:8},{t:1,x:250,y:160,o:0}],1600,EZI)}},
 {id:"comet",r:"skyR",d:7000,run:k=>{const x=Life.V.w+20,y=rnd(40,120),e=k.dot("v-comet",x,y,16,2.6);k.mv(e,[{t:0,o:0,r:160},{t:.1,o:.9,x:-30,y:12},{t:.85,o:.7,x:-420,y:150},{t:1,o:0,x:-470,y:170}],7000,"linear")}},
 {id:"beam",r:"N",d:4200,run:k=>{const U=Life.V.folk.ufo.box,x=(U[0]+U[2])/2,y=U[3]-6,
   b=k.dot("v-beam",x,y+35,26,70),c=k.img(SK+"doodle-cat.png",x,y+72,15,"foot");
   k.mv(b,[{t:0,o:0},{t:.2,o:1},{t:.8,o:1},{t:1,o:0}],4200);
   k.mv(c,[{t:0,y:0,s:1,o:0},{t:.12,y:0,o:1},{t:.45,y:-58,s:.55},{t:.55,y:-58,s:.55},{t:.88,y:0,s:1,o:1},{t:1,y:0,o:0}],4200)}},
 {id:"astro",r:"skyL",d:11000,run:k=>{const e=k.img(UI+"astronaut.png",-20,rnd(380,520),30);k.mv(e,[{t:0,x:0,y:0,r:-20,o:0},{t:.1,o:1},{t:.5,x:130,y:-50,r:15},{t:.9,o:1},{t:1,x:260,y:-120,r:-10,o:0}],11000,"linear")}},
 {id:"crab",r:"S",d:3000,run:k=>{const e=k.img(SK+"crab.png",190,650,26,"foot");
   k.mv(e,[{t:0,x:0,o:0},{t:.08,o:1},{t:.2,y:-5},{t:.3,y:0,x:30},{t:.45,y:-5,x:60},{t:.55,y:0,x:80},{t:.7,y:-5,x:110},{t:.8,y:0,x:130},{t:.92,o:1,x:150},{t:1,x:160,o:0}],3000,"linear")}},
 {id:"wave",r:"C",d:3200,run:k=>{const [x,y]=inBox("home",.18,1.02),e=k.img(SK+"waver.png",x,y,38,"foot");
   k.mv(e,[{t:0,y:10,o:0,s:.8},{t:.15,y:0,o:1,s:1},{t:.3,r:-8},{t:.45,r:8},{t:.6,r:-8},{t:.75,r:5},{t:.85,r:0,o:1},{t:1,y:6,o:0}],3200)}},
 {id:"plane",r:"skyL",d:6500,run:k=>{const e=k.dot("v-plane",-20,rnd(560,720),11,6);k.mv(e,[{t:0,o:0,r:-14},{t:.1,o:.95},{t:.4,x:150,y:-40,r:-8},{t:.7,x:300,y:-20,r:-18},{t:.92,o:.95},{t:1,x:420,y:-90,r:-10,o:0}],6500,"linear")}},
 {id:"flies",r:"S",d:5200,run:k=>{const L=Life.V.lantern;for(let i=0;i<5;i++){const e=k.dot("v-fly",L[0]+rnd(-30,30),L[1]+rnd(-18,18),3.4),dx=rnd(-26,26),dy=rnd(-30,-6);
   k.mv(e,[{t:0,o:0},{t:.25,o:1,x:dx*.4,y:dy*.3},{t:.6,o:.5,x:-dx*.5,y:dy*.8},{t:1,o:0,x:dx,y:dy-14}],rnd(4000,5200)*1)}}},
 {id:"cat",r:"E",d:2600,run:k=>{const [x,y]=inBox("gallery",.1,.02),e=k.img(UI+"cat.png",x,y,26,"foot");
   k.mv(e,[{t:0,y:0,o:0},{t:.06,o:1},{t:.2,y:-14,x:28},{t:.3,y:0,x:50},{t:.5,y:-14,x:78},{t:.6,y:0,x:100},{t:.8,y:-14,x:128},{t:.9,y:0,x:150,o:1},{t:1,x:150,o:0}],2600,"linear")}},
 {id:"ghost",r:"W",d:4800,run:k=>{const [x,y]=inBox("doodle",.5,.2),e=k.img(UI+"ghost.png",x,y,20,"foot");
   k.mv(e,[{t:0,y:0,o:0,s:.7},{t:.2,o:.9,s:1,x:6,y:-14},{t:.5,x:-8,y:-34},{t:.8,o:.7,x:8,y:-54},{t:1,x:0,y:-66,o:0,s:1.1}],4800)}},
 {id:"honk",r:"C",d:1400,run:k=>{const c=Life.fx.parentNode.querySelector('.v-walker[data-sprite*="car"] img');if(!c)return;
   k.anims.push(c.animate([{translate:"0 0"},{translate:"0 -.9cqw"},{translate:"0 0"},{translate:"0 -.9cqw"},{translate:"0 0"}],{duration:1400,easing:EZ}))}},
 {id:"orbit",r:"N",d:9000,run:k=>{const O=Life.V.places.observatory.box,cx=(O[0]+O[2])/2,cy=O[1]+30,e=k.img(UI+"planet.png",cx,cy,16);
   const st=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI*2;st.push({t:i/12,x:Math.cos(a)*110,y:Math.sin(a)*22,s:Math.sin(a)>0?1.1:.8,o:.95})}k.mv(e,st,9000,"linear")}},
 {id:"flare",r:"E",d:2200,run:k=>{const b=Life.V.folk["fire-spirit"].box,e=k.dot("v-flare",(b[0]+b[2])/2,(b[1]+b[3])/2,28);k.mv(e,[{t:0,o:0,s:.4},{t:.3,o:.85,s:1},{t:1,o:0,s:1.5}],2200,EZI)}},
 {id:"steam",r:"W",d:3600,run:k=>{const S=Life.V.smoke[0];for(let i=0;i<3;i++){const e=k.dot("v-puff",S[0]+rnd(-6,6),S[1]-30,8);
   setTimeout(()=>{if(e.isConnected)k.mv(e,[{t:0,o:0,s:.5},{t:.2,o:.8},{t:1,x:rnd(-8,10),y:-52,s:1.8,o:0}],2400,EZI)},i*500);e.style.opacity=0}}},
 {id:"glint",r:"skyR",d:3200,run:k=>{[[505,95],[548,150],[470,140],[560,640],[490,610]].slice(0,3+(Math.random()*3|0)).forEach(([x,y],i)=>{
   const e=k.dot("v-spark",x+rnd(-8,8),y+rnd(-8,8),7);setTimeout(()=>{if(e.isConnected)k.mv(e,[{t:0,o:0,s:.2,r:-30},{t:.45,o:1,s:1},{t:1,o:0,s:.5,r:20}],1400)},i*420);e.style.opacity=0})}},
 {id:"pickle",r:"S",d:2800,run:k=>{const e=k.img(SK+"pickle.png",430,668,26,"foot");
   k.mv(e,[{t:0,o:0},{t:.08,o:1},{t:.2,y:-18,x:-14,r:-8},{t:.35,y:0,x:-28,r:0},{t:.55,y:-18,x:-46,r:-8},{t:.7,y:0,x:-62,r:0},{t:.92,o:1,x:-72},{t:1,x:-72,o:0}],2800,"linear")}},
 {id:"frame",r:"E",d:1400,run:k=>{const fr=[...Life.fx.parentNode.querySelectorAll(".v-frame")];if(!fr.length)return;const f=pick(fr),n=nextWallPiece();
   if(!n)return;const a=f.animate([{opacity:1},{opacity:.05,offset:.4},{opacity:.05,offset:.55},{opacity:1}],{duration:1400,easing:EZ});k.anims.push(a);setTimeout(()=>{f.src=thumbOf(n)},560)}},
 {id:"cloudride",r:"skyT",d:14000,run:k=>{const y=rnd(30,90),c=k.dot("v-rcloud",-90,y,80,22),m=k.img(SK+"orange-monster.png",-60,y+8,26,"foot");
   k.mv(c,[{t:0,o:0},{t:.08,o:.4},{t:.92,o:.4,x:700},{t:1,x:760,o:0}],14000,"linear");k.mv(m,[{t:0,o:0},{t:.08,o:1},{t:.5,y:-3},{t:.92,o:1,x:700},{t:1,x:760,o:0}],14000,"linear")}},
 {id:"palette",r:"W",d:3200,run:k=>{const [x,y]=inBox("studio",.5,.05),e=k.img(UI+"palette.png",x,y,22,"foot");
   k.mv(e,[{t:0,y:6,o:0,s:.5,r:0},{t:.25,y:-8,o:1,s:1,r:120},{t:.6,y:-20,r:300},{t:1,y:-36,o:0,r:420}],3200)}},
 {id:"lantern",r:"S",d:2600,run:k=>{const L=Life.V.lantern,e=k.dot("v-flare warm",L[0],L[1],30);k.mv(e,[{t:0,o:.1,s:.7},{t:.3,o:.9,s:1.15},{t:.5,o:.5,s:1},{t:.7,o:.85,s:1.1},{t:1,o:0,s:1.3}],2600,EZ)}}
];
function nextWallPiece(){const shown=new Set([...$("gMapWrap").querySelectorAll(".v-frame")].map(i=>i.getAttribute("src")));
  const o=PROJECTS.filter(p=>creative(p)&&p.kind==="original"&&!shown.has(thumbOf(p)));return o.length?pick(o):null}
function lifeSpawn(){const busy=new Set([...Life.live.values()].map(m=>m.r)),ids=Life.recent;
  const ok=MOMENTS.filter(m=>!Life.live.has(m.id)&&!busy.has(m.r)&&!ids.includes(m.id));if(!ok.length)return;
  const m=pick(ok),k=lifeKit();Life.recent=[...ids,m.id].slice(-6);Life.live.set(m.id,m);
  try{m.run(k)}catch(e){}
  setTimeout(()=>{k.els.forEach(e=>e.remove());k.anims.forEach(a=>{try{a.cancel()}catch(e){}});Life.live.delete(m.id)},m.d+100)}
function lifeTick(){clearTimeout(Life.tm);if(!Life.run)return;
  if(!Z.pts.size&&Life.live.size<3+Math.floor(Math.random()*3))lifeSpawn();   // nothing new starts under a finger
  Life.tm=setTimeout(lifeTick,rnd(1000,3000))}
// while a finger pans or pinches, the village's motion holds still and resumes when it lets go
function lifeHold(on){if(on===!!Life.held||!Life.fx)return;Life.held=on;if(on)lifeAnims(a=>a.pause());else if(Life.run)lifeAnims(a=>{if(a.playState==="paused")a.play()})}
function lifeAnims(f){const z=$("gMapZoom");if(z)z.getAnimations({subtree:true}).forEach(a=>{try{f(a)}catch(e){}})}
function lifeSet(on){on=on&&!document.hidden&&!calm();if(on===Life.run)return;Life.run=on;
  if(on){lifeAnims(a=>{if(a.playState==="paused")a.play()});lifeTick()}else{clearTimeout(Life.tm);lifeAnims(a=>a.pause())}}
// always on: walkers walk their routes, clouds drift, stars twinkle, islands bob; started once per drawn village
function lifeStart(z,V){Life.V=V;Life.fx=z.querySelector(".v-fx");Life.live.clear();if(!Life.fx||calm())return;
  const u=v=>(v/V.w*100).toFixed(3)+"cqw",tok=++Life.tok,stage=(ms,f)=>setTimeout(()=>{if(tok===Life.tok&&z.isConnected)f()},ms);   // a few frames apart: the first visit never does it all at once
  stage(160,()=>z.querySelectorAll(".v-walk").forEach(w=>{const r=V.walkers[+w.dataset.w];if(!r)return;
    const route=r.route,pts=[...route,...route.slice(0,-1).reverse()],T=36/1600;   // 1 tile (36 px) per 1.6 s
    const segs=pts.slice(1).map((p,j)=>Math.hypot(p[0]-pts[j][0],p[1]-pts[j][1])/T),pause=j=>j===0||j===pts.length-1?2000:800;
    const dur=segs.reduce((a,b)=>a+b,0)+pts.reduce((a,_,j)=>a+pause(j),0),delay=-rnd(0,dur);
    const at=p=>`translate(${pct(p[0],V.w)},${pct(p[1],V.h)})`,kf=[],turns=[];let t=0,side=Math.sign(route[1][0]-route[0][0])||1;
    pts.forEach((p,j)=>{kf.push({offset:t/dur,transform:at(p)});t+=pause(j);kf.push({offset:Math.min(1,t/dur),transform:at(p)});
      if(j<segs.length){const dx=Math.sign(pts[j+1][0]-p[0]);if(dx)side=dx;turns.push({offset:t/dur,side});t+=segs[j]}});
    kf[kf.length-1].offset=1;w.animate(kf,{duration:dur,iterations:Infinity,easing:"linear",delay});
    // the picture turns to face where it goes, flipping while it waits
    const img=w.querySelector("img"),first=turns[0].side;if(img&&r.face!==0&&turns.some(x=>x.side!==first)){
      const fk=[{offset:0,scale:"1 1"},...turns.map(x=>({offset:x.offset,scale:x.side===first?"1 1":"-1 1"})),{offset:1,scale:"1 1"}];
      img.animate(fk.map(f=>({...f,easing:"step-end"})),{duration:dur,iterations:Infinity,delay})}}));
  // islands bob a few px, each at its own pace; what stands on an island (frames, villagers, the UFO) bobs with it
  const BOB={north:[6900,.9,0],mid:[8200,.6,-2300],south:[7400,.8,-4100]},isleAt=y=>y<260?"north":y>=500?"south":"mid";
  const bob=(el,n)=>{const [d,amp,delay]=BOB[n]||BOB.mid;el.animate([{translate:"0 0"},{translate:`0 ${u(-amp)}`}],{duration:d,delay,iterations:Infinity,direction:"alternate",easing:"ease-in-out"})};
  stage(320,()=>{z.querySelectorAll(".v-isle").forEach(e=>bob(e,e.dataset.isle));z.querySelectorAll(".v-frame").forEach(e=>bob(e,"mid"));
    z.querySelectorAll(".v-walk").forEach(e=>{const r=V.walkers[+e.dataset.w];if(r)bob(e,isleAt(r.route[0][1]))});
    const uf=z.querySelector(".v-ufo");if(uf)uf.animate([{transform:"translate(0,0) rotate(-3deg)"},{transform:`translate(${u(1.4)},${u(-1.6)}) rotate(3deg)`}],{duration:4600,iterations:Infinity,direction:"alternate",easing:"ease-in-out"})});
  // clouds drift, the gate's lantern flickers, the noodle bath steams
  Life.fx.insertAdjacentHTML("beforebegin",`<div class="v-cloudrow" style="top:4%"><span class="v-cloud"></span></div><div class="v-cloudrow" style="top:80%"><span class="v-cloud small" style="animation-delay:-36s"></span></div>`);
  Life.fx.insertAdjacentHTML("beforebegin",`<i class="v-lantern" style="left:${pct(V.lantern[0],V.w)};top:${pct(V.lantern[1],V.h)}"></i>`+(V.smoke||[]).map(s=>`<i class="v-smoke" style="left:${pct(s[0],V.w)};top:${pct(s[1]-24,V.h)}"></i>`).join(""));
  // twinkle and constellation glints
  stage(80,()=>{for(let i=0;i<16;i++){const e=document.createElement("i"),x=((i*137+41)%100)/100*V.w,y=((i*89+23)%100)/100*V.h;
    e.className="v-tw"+(i%4===0?" gold":"");e.style.cssText=`left:${pct(x,V.w)};top:${pct(y,V.h)};animation-duration:${3+i%5*.9}s;animation-delay:${-i*.7}s`;Life.fx.appendChild(e)}});
  // the moments' sprites are decoded one by one beforehand, so none hitches when it first appears
  Life.cache=Life.cache||[];[...new Set(["doodle-cat","crab","waver","pickle","orange-monster"].map(n=>SK+n+".png").concat(["astronaut","cat","ghost","planet","palette"].map(n=>UI+n+".png")))].forEach((s,i)=>
    stage(500+i*140,()=>{const im=new Image();im.src=s;im.decode().catch(()=>{});Life.cache.push(im)}));
  stage(2000,()=>{if(!Life.io){Life.io=new IntersectionObserver(es=>lifeSet(es[es.length-1].isIntersecting),{threshold:.05});Life.io.observe($("gMapWrap"));
    document.addEventListener("visibilitychange",()=>lifeSet(!document.hidden&&$("gMapWrap").offsetParent!==null))}
  Life.run=null;lifeSet($("gMapWrap").offsetParent!==null)})}   // null: re-sync play or pause for the freshly drawn village

/* ---- Zoom (G1): pinch, drag or double-tap with a finger, or the +/- buttons with a mouse; 1x to 2x. A place is still one tap: a touch
   that moved more than 8 px is a pan, not a tap. Nothing animates; the view follows the finger. ---- */
const Z={s:1,x:0,y:0,pts:new Map(),moved:false,start:null,raf:0,zs:null,r:{l:0,t:0},cw:0};
// At 1x the map is its framed size. Zoomed, the frame widens to the full screen width at the same height, and the
// village layer keeps its 1x size in px, so more of the island shows side to side; labels keep their 1x size (UX nit).
function widen(on){const W=$("gMapWrap"),L=$("gMapZoom");
  if(on&&!Z.base){Z.base={w:L.clientWidth,h:L.clientHeight,css:W.style.width};
    Object.assign(L.style,{width:Z.base.w+"px",height:Z.base.h+"px",inset:"0 auto auto 0"});
    Object.assign(W.style,{width:"min(100vw,460px)",height:Z.base.h+"px",aspectRatio:"auto"});Z.x=(W.clientWidth-Z.base.w)/2;Z.y=0}
  if(!on&&Z.base){Object.assign(L.style,{width:"",height:"",inset:""});
    Object.assign(W.style,{width:Z.base.css,height:"",aspectRatio:`${window.VILLAGE.w}/${window.VILLAGE.h}`});Z.base=null}}
// Pan and zoom: gesture math runs on cached numbers (Z.r = the frame's rect, Z.cw = its width, both read once per gesture
// by geom(), not per move); the transform is written at most once per frame, and --zs only when the scale changed.
function geom(){const W=$("gMapWrap"),r=W.getBoundingClientRect();Z.r={l:r.left,t:r.top};Z.cw=W.clientWidth}
// a label is shown whole or not at all: one that would be cut by the frame's edge fades out until the map is moved back
function edgeLabels(){if(!Z.lb){const V=window.VILLAGE,k=Z.base.w/V.w;
    Z.lb=[...$("gMapWrap").querySelectorAll(".v-label")].map(el=>{const p=V.places[el.dataset.place].label;return {el,x:p[0]*k,y:p[1]*Z.base.h/V.h,w:el.offsetWidth,h:el.offsetHeight,off:false}})}
  const m=6,cw=Z.cw,ch=Z.base.h;
  for(const l of Z.lb){const x=Z.x+l.x*Z.s,y=Z.y+l.y*Z.s,off=x-l.w/2<m||x+l.w/2>cw-m||y<m||y+l.h>ch-m;if(off!==l.off){l.off=off;l.el.classList.toggle("edge",off)}}}
function paintZoom(){Z.raf=0;const L=$("gMapZoom");if(!L||!Z.base)return;
  L.style.transform=`translate3d(${Z.x}px,${Z.y}px,0) scale(${Z.s})`;edgeLabels();
  if(Z.zs!==Z.s){Z.zs=Z.s;L.style.setProperty("--zs",(1/Z.s).toFixed(3))}}
function zoomTo(s,x,y){const W=$("gMapWrap"),L=$("gMapZoom");if(!L)return;
  Z.s=Math.max(1,Math.min(2,s));if(Z.s===1)widen(false);
  if(!Z.base){cancelAnimationFrame(Z.raf);Z.raf=0;Z.zs=null;Z.lb=null;W.querySelectorAll(".v-label.edge").forEach(e=>e.classList.remove("edge"));L.style.transform="";L.style.removeProperty("--zs");W.classList.remove("zoomed");Z.x=Z.y=0;return}
  const cw=Z.cw,w=Z.base.w*Z.s,h=Z.base.h;
  Z.x=w<=cw?(cw-w)/2:Math.min(0,Math.max(cw-w,x));Z.y=Math.min(0,Math.max(h-h*Z.s,y));
  W.classList.add("zoomed");if(!Z.raf)Z.raf=requestAnimationFrame(paintZoom)}
function zoomAt(k,cx,cy){const ns=Math.max(1,Math.min(2,Z.s*k));if(ns>1&&!Z.base){widen(true);geom()}
  const px=cx-Z.r.l,py=cy-Z.r.t,f=ns/Z.s;
  zoomTo(ns,px-(px-Z.x)*f,py-(py-Z.y)*f)}
(()=>{const W=$("gMapWrap");
  W.addEventListener("pointerdown",e=>{if(e.target.closest(".v-zoomctl"))return;if(e.isPrimary){Z.pts.clear();Z.pinch=null;geom()}Z.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(Z.pts.size===1){Z.moved=false;Z.start={x:e.clientX,y:e.clientY,zx:Z.x,zy:Z.y}}
    else if(Z.pts.size===2){const [a,b]=[...Z.pts.values()];Z.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:Z.s};Z.moved=true}});
  W.addEventListener("pointermove",e=>{if(!Z.pts.has(e.pointerId))return;Z.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(Z.pts.size===2&&Z.pinch){lifeHold(true);const [a,b]=[...Z.pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt(Z.pinch.s*d/Z.pinch.d/Z.s,(a.x+b.x)/2,(a.y+b.y)/2)}
    else if(Z.pts.size===1&&Z.start&&Z.s>1){const dx=e.clientX-Z.start.x,dy=e.clientY-Z.start.y;
      if(Math.hypot(dx,dy)>8)Z.moved=true;if(Z.moved){lifeHold(true);zoomTo(Z.s,Z.start.zx+dx,Z.start.zy+dy)}}});
  // double-tap on empty ground zooms in at that spot (or back out); the +/- buttons stay for mouse users only
  const up=e=>{Z.pts.delete(e.pointerId);if(Z.pts.size<2)Z.pinch=null;if(!Z.pts.size){const st=Z.start;Z.start=null;lifeHold(false);
    if(e.type==="pointerup"&&st&&!Z.moved&&e.pointerType==="touch"&&!e.target.closest(".v-place,.v-label,.v-folk,.v-walker,.v-zoomctl")){const n=performance.now(),d=Z.tap&&Math.hypot(e.clientX-Z.tap.x,e.clientY-Z.tap.y);
      if(Z.tap&&n-Z.tap.t<450&&d<36){Z.tap=null;buzz(8);geom();if(Z.s>1)zoomTo(1,0,0);else zoomAt(2,e.clientX,e.clientY)}else Z.tap={t:n,x:e.clientX,y:e.clientY}}}};
  W.addEventListener("pointerup",up);W.addEventListener("pointercancel",up);
  // a pan or pinch is not a tap on whatever was under the finger
  W.addEventListener("click",e=>{if(Z.moved&&!e.target.closest(".v-zoomctl")){e.stopPropagation();e.preventDefault();Z.moved=false}},true);
  W.addEventListener("click",e=>{const b=e.target.closest("[data-zoom]");if(!b)return;e.stopPropagation();buzz(8);
    const r=W.getBoundingClientRect();geom();zoomAt(+b.dataset.zoom>0?2:.5,r.left+r.width/2,r.top+r.height/2)},true);
  W.addEventListener("wheel",e=>{if(!e.ctrlKey)return;e.preventDefault();if(!Z.base)geom();zoomAt(e.deltaY<0?1.1:1/1.1,e.clientX,e.clientY)},{passive:false});
  addEventListener("resize",()=>{if(Z.base){geom();zoomTo(1,0,0)}})})();

function openVillager(b){const k=+b.dataset.piece,p=PROJECTS[k];if(!p)return;
  openSheet(`<h2 id="gSheetTitle"><img class="h-ico" src="${esc(b.dataset.sprite)}" alt="">${esc(ptitle(p))}</h2>
    <div class="g-vcard"><button class="g-villager-art" data-see="${k}" aria-label="${esc(t("town.seeArt")+": "+ptitle(p))}"><img src="${thumbOf(p)}" alt="" loading="lazy"></button>
    ${plabel(p)?`<p><span class="tag">${esc(plabel(p))}</span></p>`:""}<p>${esc(pdesc(p))}</p><p><button class="g-btn" data-see="${k}">${ico("i-eye")} ${esc(t("town.seeArt"))}</button></p></div>`+hireChip())}
$("gMapWrap").addEventListener("click",e=>{const v=e.target.closest(".v-folk,.v-walker");if(v){buzz(10);sfx("tap");return openVillager(v)}
  const b=e.target.closest(".v-place,.v-label");if(!b)return;buzz(15);sfx("tap");
  const pl=PLACES.find(p=>p.id===b.dataset.place);placeTap(pl,()=>pl.open(pl))});
// One small drawn reaction (300 ms) before a place opens: its label lifts and a ring of gold sparks flies out of the place.
function placeTap(pl,open){const V=window.VILLAGE,W=$("gMapWrap"),z=$("gMapZoom"),box=V.places[pl.id].box;
  if(calm()||!z||!z.isConnected){open();return}
  const lab=W.querySelector(`.v-label[data-place="${pl.id}"]`);if(lab){lab.classList.add("go");setTimeout(()=>lab.classList.remove("go"),420)}
  const cx=(box[0]+box[2])/2,cy=(box[1]+box[3])/2,k=100/V.w,fx=document.createElement("div");fx.className="v-burst";fx.style.cssText=`left:${pct(cx,V.w)};top:${pct(cy,V.h)}`;
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.3,r=(box[2]-box[0])*.55,s=document.createElement("i");fx.appendChild(s);
    s.animate([{transform:"translate(0,0) scale(.3)",opacity:0},{opacity:1,offset:.25},{transform:`translate(${(Math.cos(a)*r*k).toFixed(2)}cqw,${(Math.sin(a)*r*k*.8).toFixed(2)}cqw) scale(1)`,opacity:0}],{duration:300,easing:EZI})}
  z.appendChild(fx);setTimeout(()=>fx.remove(),340);setTimeout(open,300)}
$("gMapList").addEventListener("click",e=>{const b=e.target.closest("[data-place]");if(b){buzz(10);sfx("tap");const pl=PLACES.find(p=>p.id===b.dataset.place);pl.open(pl)}});
// The list view replaces the island on the same screen (each place once, 48 px rows); the same link switches back.
$("gMapListBtn").onclick=()=>{const l=$("gMapList"),open=l.hidden,b=$("gMapListBtn");l.hidden=!open;$("gMapWrap").hidden=open;
  b.setAttribute("aria-expanded",open);b.textContent=open?tt("town.showVillage","Show the village"):t("town.list");$("g-map").scrollTop=0;
  if(open)l.querySelector("button")?.focus({preventScroll:true})};

/* ---- sheets ---- */
const sheet=$("gSheet");let sheetFrom=null;
// The Hire sheet is the heaviest one (form inputs: first style and layout), so it is built hidden while the app is idle
// (warmHire) and opening it only slides the finished sheet in. sheetHtml is what the body holds now; a different html
// (another language, another place) is simply drawn again, as before.
let sheetHtml="",warming=false;
function openSheet(html){let fresh=false;
  if(html!==sheetHtml){$("gSheetBody").innerHTML=html;sheetHtml=html;fresh=true;
    const h=$("gSheetTitle");if(h)sheet.firstElementChild.style.setProperty("--xtop",Math.round(h.offsetTop+(h.offsetHeight-44)/2)+"px")}   // the close button sits on the title's centre line, even for a two-line title
  if(warming){if(fresh)sheet.firstElementChild.scrollTop=0;return}
  sheetFrom=document.activeElement;sheet.classList.add("open");if(fresh)sheet.firstElementChild.scrollTop=0;
  setTimeout(()=>$("gSheetX").focus({preventScroll:true}),50)}
function closeSheet(){sheet.classList.remove("open");sheetHtml="";clearTimeout(warmT);warmT=setTimeout(()=>warmWhenIdle(),900);if(sheetFrom&&sheetFrom.focus)sheetFrom.focus({preventScroll:true})}
$("gSheetX").onclick=closeSheet;sheet.addEventListener("click",e=>{if(e.target===sheet)closeSheet()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&sheet.classList.contains("open"))closeSheet()});
let sy=null;sheet.firstElementChild.addEventListener("touchstart",e=>{sy=sheet.firstElementChild.scrollTop>0?null:e.touches[0].clientY},{passive:true});
sheet.firstElementChild.addEventListener("touchend",e=>{if(sy!==null&&e.changedTouches[0].clientY-sy>90)closeSheet();sy=null});
// Every sheet ends with a Hire button (B07); the HUD chip above the sheet's backdrop stays tappable too.
const hireChip=()=>`<p class="g-sheet-hire"><button class="g-hire" data-hire aria-label="${esc(t("hire.chip.aria"))}"><img src="assets/ui/monster-head.png" alt=""><span>${esc(t("sheet.hire"))}</span></button></p>`;
const head=l=>`<h2 id="gSheetTitle">${uiImg(l.icon,"h-ico")}${esc(t(l.key))}</h2>`;
// "Made from: <piece>" on a sheet opened from a village place (G1): the place's art opens in one tap
function madeFrom(pl){const p=pl&&pl.from&&PROJECTS.find(q=>q.slug===pl.from);if(!p)return "";
  return `<p class="g-made">${esc(tt("town.madeFrom","Made from:"))} <button class="g-link" data-see="${PROJECTS.indexOf(p)}">${esc(ptitle(p))}</button></p>`}
function openLevel(i,pl){const l=LEVELS[i];
  if(l.id==="color")return go("color");
  if(l.id==="art")return go("art");
  if(l.id==="hire")return openHire();
  if(l.id==="about"){const three=featuredSix(3).map(p=>({p,k:PROJECTS.indexOf(p)}));
    const facts=["about.fact.from","about.fact.lang","about.fact.hours","about.fact.price","about.workedWith"].map(k=>t(k)).filter(v=>v&&!v.startsWith("about."));
    openSheet(head(l)+`<p>${esc(t("about.body"))}</p>${facts.length?`<ul class="g-facts">${facts.map(f=>`<li>${esc(f)}</li>`).join("")}</ul>`:""}<h3 class="g-sheet-h3">${esc(t("about.pieces"))}</h3>
      <div class="g-three">${three.map(({p,k})=>`<button class="g-feat" data-i="${k}" aria-label="${esc(ptitle(p))}"><img src="${thumbOf(p)}" alt="" loading="lazy"><b>${esc(ptitle(p))}</b></button>`).join("")}</div>`+madeFrom(pl)+hireChip())}
  if(l.id==="process"){openSheet(head(l)+`<p>${esc(t("process.intro"))}</p>`+
    [["Brief & chat","We talk about your idea, audience and the feeling it should give."],["Sketches","Rough concepts so we pick a direction early."],["Color & polish","Line, color and texture, with room for revisions."],["Delivery","Final files for print, web and social."]]
     .map(([h,d],k)=>`<div class="g-quest" data-k="${k}"><span class="chk">${ico("i-check")}</span><div><b>${esc(tt(`process.step${k+1}`,h))}</b><p>${esc(tt(`process.step${k+1}.body`,d))}</p></div></div>`).join("")+madeFrom(pl)+hireChip());
    $("gSheetBody").querySelectorAll(".g-quest").forEach(q=>q.classList.add("ok"))}   // quiet pass: the steps show ticked, no sequence
}
$("gSheetBody").addEventListener("click",e=>{const f=e.target.closest(".g-feat");if(f){show(+f.dataset.i)}
  const s=e.target.closest("[data-see]");if(s){buzz(10);show(+s.dataset.see)}});

/* ---- Final Quest: the Hire sheet (B07, B17). Opens over the current screen; closing returns there. ---- */
function openHire(prefill,pl){const l=LEVELS[4];
  // Quick actions lead with the business email; every other channel shows only when CONFIG has it (B15).
  const links=[["instagram","hire.instagram"]].filter(([k])=>CONFIG.links[k]);   // owner: the sheet shows Email, Copy email and Instagram only; the other links live on Mine
  const quick=`<div class="g-quick">
      ${CONFIG.email?`<a class="g-btn" href="mailto:${esc(CONFIG.email)}">${ico("i-mail")} ${esc(t("hire.email"))}</a>`:`<a class="g-btn" href="${esc(hireTarget().href)}" target="_blank" rel="noopener">${ico("i-send")} ${esc(t("hire.chip"))}</a>`}
      ${CONFIG.email?`<button class="g-btn alt" type="button" id="gCopyMail">${ico("i-copy")} ${esc(t("hire.copy"))}</button>`:""}</div>
    ${links.length?`<p class="g-links">${links.map(([k,c])=>`<a href="${esc(CONFIG.links[k])}" target="_blank" rel="noopener">${esc(t(c))}</a>`).join("")}</p>`:""}`;
  const types=t("hire.form.types").split("|");
  openSheet(`<h2 id="gSheetTitle">${uiImg(l.icon,"h-ico")}${esc(t("hire.title"))}</h2>
    <p>${esc(t("hire.body"))}</p>${quick}<p class="g-small">${esc(t("hire.price"))}</p>
    <h3 class="g-sheet-h3">${esc(t("hire.form.title"))}</h3>
    <form id="gForm" novalidate>
      <label>${esc(t("hire.form.name"))}<input name="name" autocomplete="name" required><span class="err"></span></label>
      <label>${esc(t("hire.form.type"))}<select name="type">${types.map(o=>`<option>${esc(o)}</option>`).join("")}</select></label>
      <label>${esc(t("hire.form.msg"))}<textarea name="message" required minlength="10" placeholder="${esc(t("hire.form.msg.ph"))}">${esc(prefill||"")}</textarea><span class="err"></span></label>
      <button class="g-btn" type="submit" style="width:100%">${ico("i-send")} ${esc(t("hire.form.send"))}</button>
    </form>`+madeFrom(pl));
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
let artTok=0;
function renderArt(){
  $("gFilters").innerHTML=[["all","All"],["illustration","Illustration"],["web","Web & UI"],["branding","Branding"],["social","Social"]]
    .map(([f,n])=>`<button class="${f===gFilter?"active":""}" data-f="${f}" aria-pressed="${f===gFilter}">${catImg(f)}${esc(tt("filter."+f,n))}</button>`).join("");
  const list=PROJECTS.map((p,i)=>({p,i})).filter(x=>gFilter==="all"||x.p.cat===gFilter);
  // eight cards now, the rest in idle slices: the first visit lays out a screenful, not the whole grid
  const card=({p,i},k)=>`<button class="g-card" data-i="${i}" style="--tilt:${typeof tiltOf==="function"?tiltOf(p):"-1deg"}"><div class="inner">
      <span class="gcat">${catImg(p.cat,"")}</span><div class="art">${artOf(p)}</div><div class="info"><b>${esc(ptitle(p))}</b>${p.label?`<span class="g-tag">${esc(plabel(p))}</span>`:""}</div></div></button>`;
  const tok=++artTok,rest=list.slice(8),idle=window.requestIdleCallback||(f=>setTimeout(f,30));
  $("gCards").innerHTML=list.slice(0,8).map(card).join("");
  (function more(){if(tok!==artTok||!rest.length)return;idle(()=>{if(tok!==artTok)return;$("gCards").insertAdjacentHTML("beforeend",rest.splice(0,10).map(card).join(""));more()},{timeout:600})})();
  $("gArtCount").textContent=t("art.count",{n:list.length});
}
$("gFilters").addEventListener("click",e=>{const b=e.target.closest("button");if(b){gFilter=b.dataset.f;buzz(8);artDone=true;renderArt()}});
$("gCards").addEventListener("click",e=>{const c=e.target.closest(".g-card");if(!c)return;buzz(15);sfx("flip");show(+c.dataset.i)});

/* ---- Mine: things you made, never rewards ---- */
function renderMine(){
  const list=Object.entries(st.colorings||{}).sort((a,b)=>(b[1].at||0)-(a[1].at||0));
  $("gMineList").innerHTML=list.length?list.map(([id,c])=>`<button class="g-mine-item" data-page="${esc(id)}" aria-label="${esc(c.title||id)}" style="--tilt:${typeof tiltOf==="function"?tiltOf({slug:id}):"-1deg"}">${c.thumb?`<img src="${c.thumb}" alt="">`:""}<b>${esc(c.title||id)}</b></button>`).join(""):`<p class="g-small">${esc(t("mine.empty"))}</p>`;
  if($("gMineLinks")){const ls=[["linkedin","hire.linkedin"],["behance","hire.behance"]].filter(([k])=>CONFIG.links[k]).map(([k,c])=>[CONFIG.links[k],t(c)]);if(CONFIG.website)ls.push([CONFIG.website,t("hire.website")]);
    $("gMineLinks").innerHTML=ls.map(([h,n])=>`<a class="g-link" href="${esc(h)}" target="_blank" rel="noopener">${esc(n)}</a>`).join("");$("gMineLinks").parentElement.hidden=!ls.length}
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
// the three tab centres are measured once (and again on resize), so a tab switch never forces a layout to place the marker
const tabBtns=[...tabs.querySelectorAll("button")];let tabX=null;
const measureTabs=()=>{tabX=tabBtns.map(b=>b.offsetLeft+b.offsetWidth/2)};
function moveInd(){const k=tabBtns.findIndex(b=>b.classList.contains("active"));ind.style.opacity=k<0?0:1;
  if(k>=0){if(!tabX||tabX.some(v=>!v))measureTabs();ind.style.setProperty("--ix",tabX[k]+"px")}}
tabs.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;sfx("tap");b.classList.remove("pressed");requestAnimationFrame(()=>b.classList.add("pressed"))});
addEventListener("resize",()=>{tabX=null;moveInd()});

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
  let n=3;const cd=$("gCount");const tick=()=>{if(!A)return;if(n>0){cd.innerHTML=`<span>${n}</span><p>${esc(t("stars.rule"))}</p>`;sfx("count");n--;setTimeout(tick,800)}else{cd.innerHTML=`<span>${esc(tt("stars.go","GO!"))}</span>`;sfx("go");A.run=true;setTimeout(()=>cd.innerHTML="",800)}};tick()}
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
// "New best!" only when there was a best to beat (the first round is just "Time's up!")
function endArcade(){const a=A;a.run=false;lastScore=a.score;const rec=(st.best||0)>0&&a.score>st.best;st.best=Math.max(st.best||0,a.score);save();
  $("gResTitle").textContent=rec?t("stars.record"):t("stars.end");$("gResScore").innerHTML=ico("s-star")+a.score;
  // the score counts points (a palette is 3, a glowing star 5, a virus minus 2), so the line says points, not stars
  $("gResText").textContent=tt("stars.resultPoints","{n} points. Your best: {best} points.",{n:a.score,best:st.best});$("gResult").classList.add("show");G.classList.remove("playing");
  sfx(rec?"legend":"level");if(rec&&typeof confetti==="function")confetti()}
function quitArcade(){cancelAnimationFrame(raf);A=null;pausedByHide=false;$("gArcade").classList.remove("open");G.classList.remove("playing");$("gCount").innerHTML=""}
let lastScore=0;
// G3: Share on the result, next to Download. It shares the same stars card (Share.renderCard) through the phone's
// share sheet; where that can't take a file it falls back to the Download path (Share.downloadStars).
async function shareStars(){if(typeof Share==="undefined")return;
  try{const c=await Share.renderCard("stars",{score:lastScore}),blob=await new Promise(ok=>c.toBlob(ok,"image/png"));
    const file=new File([blob],`ekkyarya-stars-${lastScore}.png`,{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){const url=siteBase();   // a friend can open the game from the share
      await navigator.share({files:[file],text:tt("stars.shareText","I caught {n} points in Ekky's Star Catcher.",{n:lastScore}).replace("{n}",lastScore)+" "+url,url});return}
  }catch(e){if(e&&e.name==="AbortError")return}
  Share.downloadStars(lastScore)}
if(cv&&feature("shareCards")&&!$("gResShare")){$("gAgain").insertAdjacentHTML("afterend",`<button class="g-btn alt sm" id="gResShare">${ico("i-share")} <span>${esc(t("reveal.share"))}</span></button>`);
  $("gResShare").onclick=()=>{buzz(10);shareStars()}}
if(cv){$("gResDl").onclick=()=>typeof Share!=="undefined"&&Share.downloadStars(lastScore);$("gArcadeX").onclick=quitArcade;$("gResBack").onclick=()=>{quitArcade();go("start")};$("gAgain").onclick=startArcade}
G.addEventListener("click",e=>{if(e.target.closest("[data-arcade]")){sfx("tap");startArcade()}});
{const play=q.get("play");   // desktop "Play with Ekky's art" cards: ?game&play=color|stars
  if(play==="color")setTimeout(()=>go("color"),600);
  else if(play==="stars"&&feature("starCatcher"))setTimeout(startArcade,600)}
// A hidden tab pauses the round; it resumes only once the tab is visible again (r1a bug: it used to resume while hidden).
let pausedByHide=false;
document.addEventListener("visibilitychange",()=>{if(!A)return;if(document.hidden){if(A.run){A.run=false;pausedByHide=true}}
  else if(pausedByHide){pausedByHide=false;setTimeout(()=>{if(A&&!document.hidden&&A.t>0)A.run=true},600)}});

// A friend's link draws their coloring first; the start thumbnails and the Art cards load after it (share playtest).
// The village's pictures (about 1 MB at 2x) are fetched only when the Map tab opens (go("map")), never at load, so a
// slow phone spends its first seconds on the start screen and a desktop visit never fetches them (sprint 2, first load).
let artDone=false,mapBuilt=false;const dirty={start:false,art:false,map:false};   // screens are built once and kept; a language switch redraws only the one in view
// The village (its layers and sprites, about 0.6 MB) is built when the map opens (go("map")), not at load, so the
// start screen's drawings come first on a slow phone (S5, Developer B).
/* ---- Language switched in place (js/site.js dispatches "ekky:lang" at the dim point): redraw what was built with t() ---- */
let sheetRe=null;
const remember=f=>(...a)=>{sheetRe=()=>f(...a);return f(...a)};   // the sheet's opener, so a language switch can draw it again
const hireRaw=openHire;openVillager=remember(openVillager);openLevel=remember(openLevel);openHire=remember(openHire);
function redrawScreens(){   // the screen in view is drawn again; the others are marked and drawn when opened
  renderMine();
  if(screen==="start")renderStart();else dirty.start=true;
  if(artDone){if(screen==="art")renderArt();else dirty.art=true}
  if(mapBuilt){if(screen==="map"){const sv={s:Z.s,x:Z.x,y:Z.y};renderMap();if(sv.s>1){widen(true);zoomTo(sv.s,sv.x,sv.y)}}else dirty.map=true}}
addEventListener("sitedata",redrawScreens);   // js/site-data.js merged data/site.json: new, hidden or reordered art and links show without a reload
addEventListener("ekky:lang",()=>{
  redrawScreens();
  const rs=$("gResShare");if(rs)rs.querySelector("span").textContent=t("reveal.share");
  const l=$("gMapList"),b=$("gMapListBtn");if(!l.hidden)b.textContent=tt("town.showVillage","Show the village");
  if(sheet.classList.contains("open")&&sheetRe){
    const body=sheet.firstElementChild,top=body.scrollTop,from=sheetFrom,f=$("gForm"),v=f&&[f.name.value,f.type.selectedIndex,f.message.value];
    sheetRe();body.scrollTop=top;sheetFrom=from;
    const g=$("gForm");if(g&&v){g.name.value=v[0];g.type.selectedIndex=v[1];g.message.value=v[2]}}
  else{$("gSheetBody").innerHTML="";sheetHtml="";clearTimeout(warmT);warmT=setTimeout(warmWhenIdle,900)}});   // a hidden, warmed sheet must not keep the old language
// Build Art and the village once the start screen has settled and nobody is tapping, off the tap: the first visit then only shows them.
let lastTouch=0;addEventListener("pointerdown",()=>{lastTouch=Date.now()},{passive:true,capture:true});
let warmT=0;
function warmHire(){if(sheet.classList.contains("open")||!hireRaw)return;warming=true;try{hireRaw()}finally{warming=false}}
function warmWhenIdle(){if(!document.body.classList.contains("game-mode")||sheet.classList.contains("open"))return;
  if(Date.now()-lastTouch<1500)return void(warmT=setTimeout(warmWhenIdle,1500));
  (window.requestIdleCallback||(f=>setTimeout(f,50)))(()=>{if(Date.now()-lastTouch>=1500)warmHire();else warmT=setTimeout(warmWhenIdle,1500)},{timeout:4000})}
function prewarm(){if(!document.body.classList.contains("game-mode"))return;
  const idle=window.requestIdleCallback||(f=>setTimeout(f,50));
  const when=job=>{if(Date.now()-lastTouch<1500)return setTimeout(()=>when(job),1500);idle(()=>Date.now()-lastTouch<1500?when(job):job(),{timeout:4000})};
  when(()=>{if(!artDone){artDone=true;renderArt()}
    })}   // the Art thumbnails stay lazy and the village waits for the Map tab: only the start screen's six load up front
addEventListener("load",()=>{setTimeout(prewarm,2000);warmT=setTimeout(warmWhenIdle,2500)});
function renderAll(){if(deep)setTimeout(renderStart,2500);else renderStart();renderMine();setTimeout(moveInd,60)}
// Shared with js/color.js, js/share.js and js/links.js.
window.Game={go,openHire,openSheet,closeSheet,sfx,buzz,save,get st(){return st},esc,contactReady,screen:()=>screen};
window.openHire=openHire;
setMode();
})();
