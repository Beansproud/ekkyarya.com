// Color with Ekky (B10) and the Doodle Scene with stickers (B21). One overlay inside #game with four views:
// the page picker, the editor (tap a shape to fill it, Undo, Peek, stickers), the reveal ("Yours and Ekky's")
// and the arrival view for a friend's coloring link (js/links.js). Every action autosaves to Mine.
// Pages come from scripts/make-page.mjs (assets/color/<page>/page.js); only shareable() pieces are offered.
const Color=(()=>{
const G=document.getElementById("game");
// A page with a switch stays hidden until FEATURES turns it on (Road Trip waits for Ekky's OK on the lines).
const PAGES=[{id:"giraffe",slug:"giraffe"},{id:"road-trip",slug:"road-trip",flag:"pageRoadTrip"},{id:"monster",slug:"monster",flag:"pageMonster"},{id:"little-planet",slug:"little-planet",flag:"pageLittlePlanet"},{id:"hands",slug:"hands",flag:"pageHands"},{id:"noodles",slug:"noodles",flag:"pageNoodles"},{id:"shark",slug:"shark",flag:"pageShark"},{id:"summertime",slug:"summertime",flag:"pageSummertime"},{id:"virus-and-war",slug:"virus-and-war",flag:"pageVirusAndWar"},{id:"day-in-life",slug:"day-in-life"},{id:"plug-hero",slug:"plug-hero",flag:"pagePlugHero"}];
// The Doodle Scene: a plain paper page with one region (the background) and Ekky's palette.
const SCRATCH={id:"scratch",slug:null,title:"Doodle Scene",w:800,h:1000,regions:1,
  colors:["#FFFFFF","#FFF4D6","#FFE08A","#FFB400","#FF6B6B","#F4C2D7","#C9A7FF","#9C91BD","#B8D5FF","#7ED9B0","#3E7C6A","#2B1342"]};
// Stickers: Ekky's own doodles (D17). n is the stable number used in links (append only, never reuse);
// from is the PROJECTS piece the doodle was cut from, so CONFIG.reuse / reuseBlock can take it out.
const STICKERS=[
  {n:1,src:"assets/ui/face.png",from:"android"},
  {n:2,src:"assets/ui/cat.png",from:"little-planet"},
  {n:3,src:"assets/ui/palette.png",from:"little-planet"},
  {n:4,src:"assets/ui/planet.png",from:"little-planet"},
  {n:5,src:"assets/ui/pen-hand.png",from:"little-planet"},
  {n:6,src:"assets/cat-illustration.png",from:"little-planet"},
  {n:7,src:"assets/cat-web.png",from:"little-planet"},
  {n:8,src:"assets/cat-branding.png",from:"little-planet"},
  {n:9,src:"assets/cat-social.png",from:"little-planet"},
  {n:10,src:"assets/ui/ghost.png",from:"doodles"},
  {n:11,src:"assets/ui/virus.png",from:"virus-and-war"},
  {n:12,src:"assets/ui/astronaut.png",from:"nft-3"},
  {n:13,src:"assets/ui/radio-explorer.png",from:"nft-9"},
];
const MAX_STICKERS=12, MAX_CUSTOM=3;
const bySlug=s=>PROJECTS.find(p=>p.slug===s);
const okSlug=s=>s==null||creative(bySlug(s));
const pages=()=>PAGES.filter(p=>okSlug(p.slug)&&(!p.flag||feature(p.flag)));
const stickers=()=>feature("stickers")?STICKERS.filter(s=>okSlug(s.from)):[];
const stickerImg={};
const imgOf=n=>{if(!stickerImg[n]){const s=STICKERS.find(x=>x.n===n);if(!s)return null;stickerImg[n]=new Image();stickerImg[n].src=s.src}return stickerImg[n]};
const nm=(k,en,n)=>tt(k,en).replace("{n}",n);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $=id=>document.getElementById(id);

/* ---- sprint 3 tools (docs/color-tools.md): one row, one tool on at a time; their icons join the page's sprite ---- */
const TOOLS=[["fill","i-bucket","Fill"],["brush","i-brush","Brush"],["fade","i-fade","Fade"],["pattern","i-pattern","Pattern"],["eraser","i-eraser","Eraser"]];
{const sp=document.querySelector("symbol[id='i-undo']"),S=(id,b)=>`<symbol id="${id}" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${b}</g></symbol>`;
  if(sp&&!document.getElementById("i-redo"))sp.parentNode.insertAdjacentHTML("beforeend",
    S("i-redo",'<path d="M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3" stroke-width="2.6"/>')+
    S("i-bucket",'<path d="M4.5 11.5 11 5l7.5 7.5L12 19z"/><path d="M8.5 7.5 6 5M4.5 11.5h14"/><path d="M20.5 15.5s1.5 2 1.5 3a1.5 1.5 0 0 1-3 0c0-1 1.5-3 1.5-3z" fill="currentColor"/>')+
    S("i-brush",'<path d="M20 4 11 13"/><path d="M10.5 13.5c-2 0-3.5 1.4-3.5 3.3 0 1.3-.9 2.2-2.5 2.7 4.2 1.4 8.5-.4 8.5-3.4z" fill="currentColor"/>')+
    S("i-fade",'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 4v16M12 4v16M16 4v16" stroke-dasharray="1.6 2.4" stroke-width="2"/><path d="M3.5 3.5h5v17h-5z" fill="currentColor" stroke="none"/>')+
    S("i-pattern",'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><g fill="currentColor" stroke="none"><circle cx="8.5" cy="8.5" r="1.7"/><circle cx="15.5" cy="8.5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="8.5" cy="15.5" r="1.7"/><circle cx="15.5" cy="15.5" r="1.7"/></g>')+
    S("i-zoomout",'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M7.5 10.5h6M15.5 15.5 20 20"/>')+
    S("i-eraser",'<path d="m14 4.5 6 6-9 9H6.5l-3-3z"/><path d="m9 9.5 6 6M11 19.5h9"/>'))}

/* ---- overlay markup ---- */
G.insertAdjacentHTML("beforeend",`<div class="c-over" id="gColor" role="dialog" aria-modal="true" aria-label="${esc(t("color.title"))}">
  <section class="c-view c-pick" id="cPick">
    <button class="g-x" id="cPickX" aria-label="${tt("ui.close","Close")}">${ico("i-close")}</button>
    <h2 class="g-title">${esc(t("color.title"))}</h2><p class="g-sub">${esc(t("color.intro"))}</p>
    <div class="c-pages" id="cPages"></div>
    <div class="c-actions"><button class="g-hire" data-hire aria-label="${esc(t("hire.chip.aria"))}"><img src="assets/ui/monster-head.png" alt=""><span>${esc(t("sheet.hire"))}</span></button></div>
  </section>
  <section class="c-view c-edit" id="cEdit">
    <div class="c-top"><button class="c-icon" id="cBack" aria-label="${tt("ui.back","Back")}">${ico("i-back")}</button><b id="cTitle"></b>
      <button class="g-hire sm" data-hire aria-label="${esc(t("hire.chip.aria"))}"><img src="assets/ui/monster-head.png" alt=""><span>${esc(t("hire.chip"))}</span></button>
      <button class="g-btn sm" id="cDone">${esc(t("color.done"))}</button></div>
    <div class="c-stage-wrap"><div class="c-stage" id="cStage"><canvas id="cCanvas" role="img"></canvas><img class="c-peek" id="cPeek" alt=""><div class="c-stickers" id="cStickers"></div></div>
      <div class="c-bin" id="cBin"><svg class="ico c-trash" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path class="c-lid" d="M4 7h16M9 7V4.5h6V7"/><path d="M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/></svg><span>${esc(t("color.bin"))}</span></div><p class="c-hint" id="cHint"></p>
      <button class="c-zoomout" id="cZoomOut" hidden aria-label="${esc(tt("color.zoomOut","Zoom out"))}">${ico("i-zoomout")}</button></div>
    <div class="c-colors" id="cColors" role="radiogroup" aria-label="${esc(tt("color.colors","Colors"))}"></div>
    <div class="c-opts" id="cOpts"></div>
    <div class="c-kit" id="cKit" role="radiogroup" aria-label="${esc(tt("tool.tools","Tools"))}">${TOOLS.map(([k,i,en])=>`<button class="c-kt${k==="fill"?" on":""}" data-tool="${k}" role="radio" aria-checked="${k==="fill"}">${ico(i)}<span>${esc(tt("tool."+k,en))}</span></button>`).join("")}</div>
    <div class="c-tools"><button class="c-tool" id="cUndo">${ico("i-undo")}<span>${esc(t("color.undo"))}</span></button>
      <button class="c-tool" id="cRedo">${ico("i-redo")}<span>${esc(tt("color.redo","Redo"))}</span></button>
      <button class="c-tool" id="cPeekBtn">${ico("i-eye")}<span>${esc(t("color.peek"))}</span></button>
      ${feature("stickers")?`<button class="c-tool" id="cStickBtn" aria-expanded="false">${ico("i-plus")}<span>${esc(t("color.stickers"))}</span></button>`:""}</div>
    <div class="c-tray" id="cTray" hidden></div>
    <div class="c-wheel" id="cWheel" role="dialog" aria-label="${esc(t("color.any"))}" hidden>
      <div class="c-wheel-top"><i class="c-wheel-pre" id="cWPre"></i><b>${esc(t("color.any"))}</b></div>
      ${[["h",tt("wheel.hue","Hue")],["s",tt("wheel.sat","Strength")],["l",tt("wheel.light","Light")]].map(([k,n])=>`<div class="c-strip" data-k="${k}" role="slider" tabindex="0" aria-label="${esc(n)}" aria-valuemin="0" aria-valuemax="100"><canvas></canvas><i class="c-knob"></i></div>`).join("")}
      <div class="c-wheel-row"><button class="g-btn alt sm" id="cWNo">${esc(tt("wheel.cancel","Cancel"))}</button><button class="g-btn sm" id="cWYes">${esc(tt("wheel.add","Use this color"))}</button></div>
    </div>
  </section>
  <section class="c-view c-reveal" id="cReveal">
    <button class="g-x" id="cClose" aria-label="${tt("ui.close","Close")}">${ico("i-close")}</button>
    <h2 class="g-title" id="cRevTitle"></h2>
    <div class="c-pair"><figure><canvas id="cYours"></canvas><figcaption>${esc(t("reveal.yours"))}</figcaption></figure>
      <figure id="cEkkyFig"><img id="cEkky" alt=""><figcaption>${esc(t("reveal.ekky"))}</figcaption></figure></div>
    <div class="c-actions">${feature("shareCards")?`<div class="s-row"><button class="g-btn" id="cShare">${ico("i-share")} ${esc(t("reveal.share"))}</button><button class="g-btn alt" id="cDl">${ico("i-download")} ${esc(t("dl.button"))}</button></div>`:""}
      <button class="g-btn alt" id="cAgain">${esc(t("reveal.again"))}</button>
      <button class="g-hire" data-hire aria-label="${esc(t("hire.chip.aria"))}"><img src="assets/ui/monster-head.png" alt=""><span>${esc(t("hire.chip"))}</span></button></div>
  </section>
  <section class="c-view c-arrive" id="cArrive">
    <button class="g-x" id="cArriveX" aria-label="${tt("ui.close","Close")}">${ico("i-close")}</button>
    <h2 class="g-title" id="cArriveTitle"></h2>
    <div class="c-arrive-art"><canvas id="cArriveCanvas"></canvas></div>
    <div class="c-actions"><button class="g-btn" id="cArriveColor">${esc(t("arrive.mine"))}</button>
      <button class="g-hire" data-hire aria-label="${esc(t("hire.chip.aria"))}"><img src="assets/ui/monster-head.png" alt=""><span>${esc(t("hire.chip"))}</span></button>
      <button class="g-btn alt" id="cArriveExplore">${esc(t("arrive.explore"))}</button></div>
  </section>
</div>`);
const over=$("gColor");
function view(name){if(typeof wheel!=="undefined")wheel.hidden=true;over.classList.add("open");over.querySelectorAll(".c-view").forEach(v=>v.classList.toggle("active",v.id===name))}
function close(){
  // the phone's Back while zoomed only zooms out: js/game.js has already taken Color's history entry, so a class flip on the overlay makes it add one again
  if(typeof zoom!=="undefined"&&zoomed()&&window.event&&window.event.type==="popstate"&&$("cEdit").classList.contains("active")){zoomOut();over.classList.add("re");requestAnimationFrame(()=>over.classList.remove("re"));return}
  over.classList.remove("open");cur=null;if(typeof zoom!=="undefined"&&zoomed())zReset()}

/* ---- picker ---- */
function openPicker(){
  $("cPages").innerHTML=pages().map((p,i)=>{const pr=bySlug(p.slug);return `<button class="c-page" data-page="${p.id}" style="--i:${i}"><img src="assets/color/${p.id}/line.png" alt="" loading="lazy"><b>${esc(ptitle(pr))}</b></button>`}).join("")+
    (feature("doodleScene")?`<button class="c-page c-scratch" data-page="scratch" style="--i:${pages().length}">${ico("i-plus")}<b>${esc(t("color.scratch"))}</b><small>${esc(t("color.scratch.sub"))}</small></button>`:"");
  view("cPick");setTimeout(()=>$("cPickX").focus({preventScroll:true}),50)}
$("cPages").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b){Game.buzz(10);Game.sfx("tap");const im=b.querySelector("img"),r=(im||b).getBoundingClientRect();open(b.dataset.page,{from:{left:r.left,top:r.top,w:r.width}})}});
$("cPickX").onclick=close;

/* ---- page data ---- */
const cache={};
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function loadImg(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src})}
// Region index: for region r, its pixels are idx[start[r] .. start[r+1]).
// Opening a page is several big passes over the 800 x 930 map; each stage runs in its own task so no frame waits on all of them.
const breathe=()=>new Promise(r=>setTimeout(r));
async function pageData(id){
  if(cache[id])return cache[id];
  let meta,ids;
  if(id==="scratch"){meta=SCRATCH;ids=new Uint16Array(meta.w*meta.h).fill(1)}
  else{const p=pages().find(x=>x.id===id);if(!p)throw new Error("no page "+id);
    if(!(window.COLOR_PAGE_DATA||{})[id])await loadScript(`assets/color/${id}/page.js`);
    meta=COLOR_PAGE_DATA[id];const map=await loadImg(meta.mapData);await breathe();
    const c=document.createElement("canvas");c.width=meta.w;c.height=meta.h;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(map,0,0);
    const d32=new Uint32Array(x.getImageData(0,0,meta.w,meta.h).data.buffer);c.width=c.height=0;ids=new Uint16Array(d32.length);
    for(let i=0;i<ids.length;i++){const v=d32[i];ids[i]=(v&255)+(v>>8&255)*256}}   // little-endian RGBA: R + 256 * G
  await breathe();
  const pd={id,meta,ids,line:null};boxes(pd);   // pass 1: sizes, bounding boxes and rank together
  await breathe();
  const start=pd.start,idx=new Int32Array(ids.length),fillPos=start.slice();   // pass 2: the pixels of each region, together
  for(let i=0;i<ids.length;i++)idx[fillPos[ids[i]]++]=i;
  pd.idx=idx;
  if(meta.line)pd.line=await loadImg(`assets/color/${id}/${meta.line}`).catch(()=>null);
  return cache[id]=pd;
}

/* ---- drawing: fills (0 = paper, 1..12 = the page's colors, 13..15 = custom colors), Ekky's lines on top ---- */
const hexRgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function colorOf(s,v){return v===0?"#FFFFFF":v<=12?s.pd.meta.colors[v-1]:s.custom[v-13]||"#FFFFFF"}
const UNDO_KEEP=40;
// Sprint 3 (docs/color-tools.md): a shape can also hold a gradient or a pattern (fx[r]; fills[r] keeps a plain color for older readers),
// and brush and eraser strokes live on their own ink layer (ink: a list of ops), always under Ekky's lines.
const FX_KINDS=["lin","rad","cray","glit","dots"],isHex=c=>typeof c==="string"&&/^#[0-9A-Fa-f]{6}$/.test(c);
const okFx=f=>f&&FX_KINDS.includes(f.k)&&isHex(f.a)&&(f.k.length>3||isHex(f.b)&&Array.isArray(f.p)&&f.p.every(Number.isFinite));
const okOp=(o,k)=>o&&(Number.isInteger(o.x)?o.x>0&&o.x<=k:isHex(o.c)&&o.w>0&&o.w<200&&Number.isInteger(o.r)&&o.r>=0&&o.r<=k&&Array.isArray(o.p)&&o.p.length>=2&&!(o.p.length%2)&&o.p.every(Number.isFinite));
const okUndo=(u,k)=>Array.isArray(u)&&(u[0]==="st"?Array.isArray(u[1]):u[0]==="ink"?u[1]==="pop":u[0]==="m"?Array.isArray(u[1])&&u[1].every(v=>okUndo(v,k)):u[0]>0&&u[0]<=k&&(u[2]==null||!u[2]||okFx(u[2])));
const INK_MAX=60000;   // coordinates kept per page (about 250 KB of JSON at most), so a long doodle never fills the device's storage
function makeState(pd,saved){const k=pd.meta.regions;bboxAll(pd);const s={pd,fills:new Uint8Array(k+1),custom:[],stickers:[],undo:[],redo:[],fx:{},ink:[]};
  // fills saved for a different region map (the page was rebuilt) are dropped rather than painted onto the wrong shapes
  if(saved){const same=(saved.fills||[]).length===k+1;if(same)saved.fills.forEach((v,r)=>{s.fills[r]=v});s.custom=(saved.custom||[]).slice(0,MAX_CUSTOM);s.stickers=(saved.stickers||[]).filter(x=>stickers().some(t=>t.n===x.n)).slice(0,MAX_STICKERS);
    if(same){if(saved.fx)Object.entries(saved.fx).forEach(([r,f])=>{r=+r;if(r>0&&r<=k&&okFx(f))s.fx[r]=f});
      if(Array.isArray(saved.ink))s.ink=saved.ink.filter(o=>okOp(o,k));
      if(Array.isArray(saved.undo))s.undo=saved.undo.filter(u=>okUndo(u,k)).slice(-UNDO_KEEP)}}
  if(pd.id==="scratch"&&!saved)s.fills[1]=1;
  return s}
const mk=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;return c};
// A shape's mask: opaque where the shape is, the size of its bounding box. Built from the region index on first use; the last few are kept.
function mask(pd,r){const M=pd.masks||(pd.masks=new Map());let m=M.get(r);if(m){M.delete(r);M.set(r,m);return m}
  const [x0,y0,x1,y1]=bboxOf(pd,r);if(x1<x0)return null;const w=x1-x0+1,h=y1-y0+1,c=mk(w,h),x=c.getContext("2d"),img=x.createImageData(w,h),d=new Uint32Array(img.data.buffer),W=pd.meta.w,{start,idx}=pd;
  for(let j=start[r];j<start[r+1];j++){const i=idx[j],yy=(i/W|0)-y0;d[yy*w+i-(i/W|0)*W-x0]=0xffffffff}
  x.putImageData(img,0,0);m={c,x0,y0,w,h};M.set(r,m);if(M.size>16)M.delete(M.keys().next().value);return m}
// Patterns are drawn here, never loaded: a seeded 96 px tile per kind and color, so a page looks the same every time it opens.
const tiles={};
function tile(k,c){const key=k+c;if(tiles[key])return tiles[key];const T=96,t=mk(T,T),x=t.getContext("2d");let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
  const [R,G2,B]=hexRgb(c),lum=(R*299+G2*587+B*114)/1000,mix=(a,v)=>`rgba(${v},${v},${v},${a})`;
  x.fillStyle=c;x.fillRect(0,0,T,T);
  if(k==="cray"){x.lineCap="round";for(let i=0;i<70;i++){const y=rnd()*T,a=rnd()*T;x.strokeStyle=rnd()<.6?mix(.18,255):mix(.12,0);x.lineWidth=.8+rnd()*1.6;
      for(const o of [-T,0,T]){x.beginPath();x.moveTo(a+o-6,y+3);x.lineTo(a+o+10+rnd()*8,y-4);x.stroke()}}
    for(let i=0;i<160;i++){x.fillStyle=mix(.55,255);x.fillRect(rnd()*T,rnd()*T,1.4,1.4)}}
  else if(k==="glit"){for(let i=0;i<90;i++){const v=rnd();x.fillStyle=v<.5?mix(.85,255):v<.75?"rgba(255,226,122,.9)":lum>140?mix(.25,0):mix(.35,255);const z=.8+rnd()*1.8;x.beginPath();x.arc(rnd()*T,rnd()*T,z,0,7);x.fill()}
    x.strokeStyle="#fff";x.lineWidth=1.4;x.lineCap="round";for(let i=0;i<7;i++){const a=rnd()*T,b=rnd()*T,z=3+rnd()*3;x.beginPath();x.moveTo(a-z,b);x.lineTo(a+z,b);x.moveTo(a,b-z);x.lineTo(a,b+z);x.stroke()}}
  else{x.fillStyle=lum>180?"rgba(43,19,66,.22)":"rgba(255,255,255,.6)";for(const [a,b] of [[24,24],[72,72],[72,24],[24,72]].slice(0,4)){x.beginPath();x.arc(a,b,b===a?9:5,0,7);x.fill()}}
  return tiles[key]=t}
// The paint of a gradient or pattern, in page coordinates.
function fxStyle(x,f){if(f.k==="lin"||f.k==="rad"){const p=f.p,g=f.k==="lin"?x.createLinearGradient(p[0],p[1],p[2],p[3]):x.createRadialGradient(p[0],p[1],0,p[0],p[1],Math.max(1,p[2]));
  g.addColorStop(0,f.a);g.addColorStop(1,f.b);return g}return x.createPattern(tile(f.k,f.a),"repeat")}
// Draw shape r's gradient or pattern onto a page-sized context.
function fxOnto(pd,x,r,f){const m=mask(pd,r);if(!m)return;const t=mk(m.w,m.h),tx=t.getContext("2d");tx.drawImage(m.c,0,0);tx.globalCompositeOperation="source-in";
  tx.translate(-m.x0,-m.y0);tx.fillStyle=fxStyle(tx,f);tx.fillRect(m.x0,m.y0,m.w,m.h);x.drawImage(t,m.x0,m.y0);t.width=t.height=0}
// One ink op onto an ink layer: a stroke (points from index `from` on), clipped to its shape unless it was drawn Free, or a shape cleared back to paper.
// Returns the page box it touched, so only that box is composed again.
const scr=mk(1,1),scx=scr.getContext("2d");
function inkOp(pd,x,o,from=0){const W=pd.meta.w,H=pd.meta.h;
  if(o.x){const m=mask(pd,o.x);if(!m)return null;x.globalCompositeOperation="destination-out";x.drawImage(m.c,m.x0,m.y0);x.globalCompositeOperation="source-over";return [m.x0,m.y0,m.w,m.h]}
  const p=o.p,n=p.length/2,s=Math.max(0,Math.min(from,n-1)),h=o.w/2+2;let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
  for(let i=s;i<n;i++){const a=p[2*i],b=p[2*i+1];if(a<bx0)bx0=a;if(a>bx1)bx1=a;if(b<by0)by0=b;if(b>by1)by1=b}
  bx0=Math.max(0,Math.floor(bx0-h));by0=Math.max(0,Math.floor(by0-h));bx1=Math.min(W,Math.ceil(bx1+h));by1=Math.min(H,Math.ceil(by1+h));
  const m=o.r?mask(pd,o.r):null;if(m){bx0=Math.max(bx0,m.x0);by0=Math.max(by0,m.y0);bx1=Math.min(bx1,m.x0+m.w);by1=Math.min(by1,m.y0+m.h)}
  const w=bx1-bx0,hh=by1-by0;if(w<=0||hh<=0)return null;
  if(scr.width<w||scr.height<hh){scr.width=Math.max(scr.width,w);scr.height=Math.max(scr.height,hh)}
  scx.setTransform(1,0,0,1,0,0);scx.globalCompositeOperation="source-over";scx.clearRect(0,0,w,hh);scx.translate(-bx0,-by0);
  scx.lineCap=scx.lineJoin="round";scx.lineWidth=o.w;scx.strokeStyle=o.c;scx.beginPath();scx.moveTo(p[2*s],p[2*s+1]);
  if(n-s<2)scx.lineTo(p[2*s]+.01,p[2*s+1]);else for(let i=s+1;i<n;i++)scx.lineTo(p[2*i],p[2*i+1]);scx.stroke();
  if(m){scx.globalCompositeOperation="destination-in";scx.drawImage(m.c,m.x0,m.y0)}   // the box lies inside the mask's box, so the mask covers all of it
  x.globalCompositeOperation=o.e?"destination-out":"source-over";x.drawImage(scr,0,0,w,hh,bx0,by0,w,hh);x.globalCompositeOperation="source-over";return [bx0,by0,w,hh]}
function inkAll(s,x,n=s.ink.length){for(let i=0;i<n&&i<s.ink.length;i++)inkOp(s.pd,x,s.ink[i])}
// The shapes' colors, gradients and patterns (no ink, no lines) at the page's own size.
function paintBase(s,cv){const {meta,start,idx}=s.pd;cv.width=meta.w;cv.height=meta.h;const x=cv.getContext("2d");
  const img=x.createImageData(meta.w,meta.h),d=img.data;d.fill(255);
  for(let r=1;r<=meta.regions;r++){const v=s.fills[r];if(!v)continue;const [R,G2,B]=hexRgb(colorOf(s,v));
    for(let j=start[r];j<start[r+1];j++){const o=idx[j]*4;d[o]=R;d[o+1]=G2;d[o+2]=B}}
  x.putImageData(img,0,0);for(const r in s.fx)if(s.fills[r])fxOnto(s.pd,x,+r,s.fx[r])}
// Paint the whole picture of a state (shapes, then the first nInk ink ops, then Ekky's lines) onto a canvas at the page's own size.
function paint(s,cv,nInk){paintBase(s,cv);const x=cv.getContext("2d"),{meta,line}=s.pd;
  if(s.ink.length&&nInk!==0){const k=mk(meta.w,meta.h);inkAll(s,k.getContext("2d"),nInk);x.drawImage(k,0,0);k.width=k.height=0}
  if(line)x.drawImage(line,0,0)}
// The live editor keeps the shapes (base) and the ink as their own canvases; a change composes only its box onto the screen canvas.
function refresh(b){if(!cur||!b)return;const [x0,y0,w,h]=b.map(Math.round),x=cv.getContext("2d"),{line}=cur.pd;if(w<=0||h<=0)return;
  x.drawImage(cur.base,x0,y0,w,h,x0,y0,w,h);x.drawImage(cur.inkC,x0,y0,w,h,x0,y0,w,h);if(line)x.drawImage(line,x0,y0,w,h,x0,y0,w,h)}
function liveAll(){const {w,h}=cur.pd.meta;paintBase(cur,cur.base);cur.inkC.width=w;cur.inkC.height=h;inkAll(cur,cur.inkC.getContext("2d"));cv.width=w;cv.height=h;refresh([0,0,w,h])}
function redrawInk(){const {w,h}=cur.pd.meta,x=cur.inkC.getContext("2d");x.clearRect(0,0,w,h);inkAll(cur,x);refresh([0,0,w,h])}
// Repaint only the bounding box of region r: paper, then each pixel's region color, then Ekky's lines on top.
// Smooth fills (owner: "some animation is very clunky"): the bounding box of each region is found once when the page opens, pixels are
// written as 32-bit words, and a big region is built in slices of at most 10 ms so a 4x slower phone never stalls a frame.
// The tap's ripple (fillPop) shows which shape changed; the shape itself switches color in one draw.
function boxes(pd){const {meta,ids}=pd,W=meta.w,H=meta.h,k=meta.regions,n=k+1,x0=new Int32Array(n).fill(W),y0=new Int32Array(n).fill(H),x1=new Int32Array(n).fill(-1),y1=new Int32Array(n).fill(-1),
    cnt=new Int32Array(n),sy=new Float64Array(n),sx=new Float64Array(n),start=pd.start=new Int32Array(k+2);
  for(let y=0,i=0;y<H;y++)for(let x=0;x<W;x++,i++){const r=ids[i];cnt[r]++;sx[r]+=x;sy[r]+=y;if(x<x0[r])x0[r]=x;if(x>x1[r])x1[r]=x;if(y<y0[r])y0[r]=y;y1[r]=y}   // y only grows
  const b=pd.bb=new Int32Array(n*4),cy=[];
  for(let r=0;r<=k;r++){start[r+1]=start[r]+cnt[r];b[r*4]=x0[r];b[r*4+1]=y0[r];b[r*4+2]=x1[r];b[r*4+3]=y1[r];if(r)cy.push([r,cnt[r]?sy[r]/cnt[r]+sx[r]/cnt[r]*.25:0])}
  // rank: the order regions fill in the share video, a top-to-bottom sweep by each region's center
  const rank=pd.rank=new Int32Array(n);cy.sort((a,b)=>a[1]-b[1]).forEach(([r],i)=>rank[r]=i)}
const bboxAll=pd=>pd.bb||(boxes(pd),pd.bb)
function bboxOf(pd,r){const b=bboxAll(pd),o=r*4;return [b[o],b[o+1],b[o+2],b[o+3]]}
// Sprint 3: only shape r's own pixels are written (the rest of the box stays clear), so a neighbour's gradient or pattern is kept;
// the shape goes onto the base layer and the box is composed again with the ink and Ekky's lines.
function paintRegion(s,r){const {meta,ids}=s.pd,W=meta.w,[x0,y0,x1,y1]=bboxOf(s.pd,r);
  if(x1<x0)return;const w=x1-x0+1,h=y1-y0+1,box=mk(w,h);
  const bx=box.getContext("2d"),img=bx.createImageData(w,h),d32=new Uint32Array(img.data.buffer),c=hexRgb(colorOf(s,s.fills[r])),col=(255<<24|c[2]<<16|c[1]<<8|c[0])>>>0,f=s.fills[r]&&s.fx[r];
  if(f&&s.base){const bx2=s.base.getContext("2d");box.width=box.height=0;fxOnto(s.pd,bx2,r,f);if(s===cur)refresh([x0,y0,w,h]);return}   // a gradient or pattern: the shape's cached mask, one draw
  let yy=0;const rows=until=>{for(;yy<h&&performance.now()<until;yy++){const base=(y0+yy)*W+x0,o=yy*w;for(let xx=0;xx<w;xx++)if(ids[base+xx]===r)d32[o+xx]=col}};
  const done=()=>{bx.putImageData(img,0,0);if(f){bx.globalCompositeOperation="source-atop";bx.translate(-x0,-y0);bx.fillStyle=fxStyle(bx,f);bx.fillRect(x0,y0,w,h)}
    if(s.base){s.base.getContext("2d").drawImage(box,x0,y0);if(s===cur)refresh([x0,y0,w,h])}box.width=box.height=0};
  rows(performance.now()+10);if(yy>=h)return done();
  const tick=()=>{rows(performance.now()+10);yy>=h?done():requestAnimationFrame(tick)};requestAnimationFrame(tick)}
// Draw the whole picture (fills, lines, stickers) into a box on any canvas: thumbnails, reveal, share card, arrival.
// t (0..1) plays the picture as a timeline for the share video: the fills sweep in (to 0.8), then the stickers pop in.
function compose(s,ctx,X,Y,W,t=1,src){const {meta,rank}=s.pd,H=W*meta.h/meta.w,c=document.createElement("canvas");
  const fillT=Math.min(1,t/.8),stT=Math.max(0,Math.min(1,(t-.8)/.2)),pop=t>=1?1:1-Math.pow(1-stT,3);
  if(src&&t>=1)ctx.drawImage(src,X,Y,W,H);   // the live picture is already painted: a thumbnail is one scaled draw, not a repaint
  else{paint(t>=1?s:{...s,fills:s.fills.map((v,r)=>rank[r]<fillT*meta.regions?v:0)},c,t>=1?undefined:Math.ceil(fillT*s.ink.length));ctx.drawImage(c,X,Y,W,H);c.width=c.height=0}   // brush strokes play in with the fills
  if(!pop)return H;
  s.stickers.forEach(st=>{const im=imgOf(st.n);if(!im||!im.complete||!im.naturalWidth)return;const w=st.s*W*pop,h=w*im.naturalHeight/im.naturalWidth;
    ctx.save();ctx.translate(X+st.x*W,Y+st.y*H);ctx.rotate(st.r);ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore()});return H}

/* ---- editor ---- */
let cur=null,color=1,hintShown=false;
const cv=$("cCanvas"),stage=$("cStage");
async function open(id,opts={}){
  let pd;try{pd=await pageData(id)}catch{return openPicker()}
  const saved=opts.fresh?null:(Game.st.colorings||{})[id];
  cur=makeState(pd,saved);color=pd.id==="scratch"?2:1;   // the Doodle Scene starts on white paper with a soft cream brush; yellow stays a swatch
  
  const pr=bySlug(pd.meta.slug),title=id==="scratch"?t("color.scratch"):pr?ptitle(pr):pd.meta.title;cur.title=title;
  $("cTitle").textContent=title;$("cCanvas").setAttribute("aria-label",title+". "+t("color.hint"));stage.style.aspectRatio=`${pd.meta.w}/${pd.meta.h}`;
  $("cPeek").src=id==="scratch"?"":pd.meta.original||(bySlug(pd.meta.slug)||{}).full||"";$("cPeekBtn").hidden=id==="scratch";
  cur.base=mk(1,1);cur.inkC=mk(1,1);liveAll();renderColors();renderStickers();renderKit();$("cTray").hidden=true;
  zReset();view("cEdit");sizeStage();updUndo();
  // shared-element feel: the page grows from the card that was tapped (transform and opacity only, one shot)
  if(opts.from&&stage.animate&&!matchMedia("(prefers-reduced-motion:reduce)").matches){const r=stage.getBoundingClientRect(),k=opts.from.w/r.width;
    if(r.width&&isFinite(k))stage.animate([{transformOrigin:"0 0",transform:`translate(${opts.from.left-r.left}px,${opts.from.top-r.top}px) scale(${k})`,opacity:.4},{transformOrigin:"0 0",transform:"none",opacity:1}],{duration:320,easing:"cubic-bezier(.2,.8,.2,1)"})}
  if(!hintShown&&!(Game.st.hints||{}).color){hintShown=true;const h=$("cHint");h.textContent=t("color.hint");h.classList.add("show");setTimeout(()=>h.classList.remove("show"),2600);
    Game.st.hints=Object.assign({},Game.st.hints,{color:1});Game.save()}
}
function sizeStage(){if(!cur)return;const wrap=stage.parentElement,{w,h}=cur.pd.meta,aw=wrap.clientWidth,ah=wrap.clientHeight;
  const sc=Math.min(aw/w,ah/h);stage.style.width=w*sc+"px";stage.style.height=h*sc+"px"}
addEventListener("resize",sizeStage);
function renderColors(){const cols=cur.pd.meta.colors;
  $("cColors").innerHTML=cols.map((c,i)=>`<button class="c-sw${color===i+1?" on":""}" data-v="${i+1}" style="--c:${c}" role="radio" aria-checked="${color===i+1}" aria-label="${esc(nm("color.swatch","Color {n}",i+1))}"></button>`).join("")+
    cur.custom.map((c,i)=>`<button class="c-sw${color===13+i?" on":""}" data-v="${13+i}" style="--c:${c}" role="radio" aria-checked="${color===13+i}" aria-label="${esc(nm("color.mine","Your color {n}",i+1))}"></button>`).join("")+
    (feature("anyColor")?`<button class="c-sw c-any" data-any aria-label="${esc(t("color.any"))}">${ico("i-plus")}</button>`:"")}
$("cColors").addEventListener("click",e=>{const b=e.target.closest(".c-sw");if(!b)return;Game.buzz(6);
  if(b.dataset.any!==undefined){openWheel();return}
  pickColor(+b.dataset.v)});
// Choosing a swatch only moves the "on" ring; the buttons are not rebuilt, so a tap costs no layout.
function pickColor(v){if(v===color)return;const sw=$("cColors");color=v;
  sw.querySelectorAll(".c-sw[data-v]").forEach(b=>{const on=+b.dataset.v===v;b.classList.toggle("on",on);b.setAttribute("aria-checked",on)});if(tool==="fade"||tool==="pattern")renderOpts()}
function addCustom(c){let i=cur.custom.indexOf(c);
  if(i<0){if(cur.custom.length<MAX_CUSTOM){cur.custom.push(c);i=cur.custom.length-1}else{i=MAX_CUSTOM-1;cur.custom[i]=c;paintBase(cur,cur.base);refresh([0,0,cur.pd.meta.w,cur.pd.meta.h])}}
  color=13+i;renderColors();renderOpts();save()}
/* ---- our own color sheet: hue, strength and light strips drawn on canvases (a hidden <input type=color> cannot be opened by script on iOS Safari or in-app browsers) ---- */
const hsl={h:0,s:100,l:50},wheel=$("cWheel");
function hex2hsl(x){const n=parseInt(x.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,l=(mx+mn)/2;
  let h=0;if(d){h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}
  return {h:Math.round(h),s:Math.round(d?d/(1-Math.abs(2*l-1))*100:0),l:Math.round(l*100)}}
function hsl2hex({h,s,l}){s/=100;l/=100;const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};
  return "#"+[f(0),f(8),f(4)].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase()}
function drawStrips(){wheel.querySelectorAll(".c-strip").forEach(el=>{const k=el.dataset.k,c=el.firstChild,w=el.clientWidth||300,h=el.clientHeight||44;if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;
  const x=c.getContext("2d"),g=x.createLinearGradient(0,0,w,0),q=(hh,ss,ll)=>`hsl(${hh},${ss}%,${ll}%)`;
  if(k==="h")for(let i=0;i<=6;i++)g.addColorStop(i/6,q(i*60,100,50));
  else if(k==="s"){g.addColorStop(0,q(hsl.h,0,hsl.l));g.addColorStop(1,q(hsl.h,100,hsl.l))}
  else{g.addColorStop(0,q(hsl.h,hsl.s,0));g.addColorStop(.5,q(hsl.h,hsl.s,50));g.addColorStop(1,q(hsl.h,hsl.s,100))}
  x.fillStyle=g;x.fillRect(0,0,w,h);
  const v=k==="h"?hsl.h/360*100:hsl[k];el.querySelector(".c-knob").style.left=v+"%";el.setAttribute("aria-valuenow",Math.round(v));el.setAttribute("aria-valuetext",hsl2hex(hsl))});
  $("cWPre").style.background=hsl2hex(hsl)}
function setStrip(k,p){p=Math.max(0,Math.min(1,p));if(k==="h")hsl.h=Math.round(p*360);else hsl[k]=Math.round(p*100);drawStrips()}
wheel.querySelectorAll(".c-strip").forEach(el=>{const k=el.dataset.k,at=e=>{const r=el.getBoundingClientRect();setStrip(k,(e.clientX-r.left)/r.width)};
  el.addEventListener("pointerdown",e=>{el.setPointerCapture(e.pointerId);at(e);e.preventDefault()});
  el.addEventListener("pointermove",e=>{if(el.hasPointerCapture(e.pointerId))at(e)});
  el.addEventListener("keydown",e=>{const d={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1}[e.key];if(!d)return;e.preventDefault();const m=k==="h"?360:100;setStrip(k,((k==="h"?hsl.h:hsl[k])+d*(m/50))/m)})});
function openWheel(){Object.assign(hsl,hex2hsl(colorOf(cur,color)));if(hsl.s<20||hsl.l<15||hsl.l>85)Object.assign(hsl,{s:Math.max(hsl.s,60),l:50});wheel.hidden=false;drawStrips();wheel.querySelector(".c-strip").focus({preventScroll:true})}
function closeWheel(){wheel.hidden=true;const b=$("cColors").querySelector(".c-any");if(b)b.focus({preventScroll:true})}
$("cWNo").addEventListener("click",closeWheel);
$("cWYes").addEventListener("click",()=>{addCustom(hsl2hex(hsl));closeWheel()});
wheel.addEventListener("keydown",e=>{if(e.key==="Escape"){e.stopPropagation();closeWheel()}});
/* a touch fill feels alive: a quick ripple from the tap point and a tiny pop of the swatch (about 300 ms; the CSS turns both off under reduced motion) */
function fillPop(e){const r=stage.getBoundingClientRect(),d=document.createElement("i");d.className="c-ripple";d.style.cssText=`left:${(e.clientX-r.left)/zoom.z}px;top:${(e.clientY-r.top)/zoom.z}px;--c:${colorOf(cur,color)}`;
  stage.appendChild(d);setTimeout(()=>d.remove(),400);
  const sw=$("cColors").querySelector(".c-sw.on");if(sw&&sw.animate&&!reduce.matches)sw.animate([{transform:"scale(.8)"},{transform:"none"}],{duration:300,easing:"cubic-bezier(.34,1.56,.64,1)"})}
function pagePoint(e){const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*cur.pd.meta.w,(e.clientY-r.top)/r.height*cur.pd.meta.h]}
// The shape under a point; a touch that lands on one of Ekky's lines takes the nearest shape within a few pixels.
function regionAt(x,y){const {w,h}=cur.pd.meta,ids=cur.pd.ids;x=Math.floor(x);y=Math.floor(y);
  for(let d=0;d<=8;d+=2)for(let dy=-d;dy<=d;dy+=2)for(let dx=-d;dx<=d;dx+=2){const a=x+dx,b=y+dy;if(a>=0&&b>=0&&a<w&&b<h&&ids[b*w+a])return ids[b*w+a]}return 0}
/* ---- tools: Fill, Brush, Fade (gradient), Pattern, Eraser; one on at a time, at most one strip of options ---- */
const SIZES=[8,20,44],FADES=[["@","#FFFFFF"],["@","#FFE08A"],["@","#2B1342"],["#FFE08A","#FF6B6B"],["#B8D5FF","#C9A7FF"],["#7ED9B0","#3E7C6A"]],PATS=[["cray","Crayon"],["glit","Glitter"],["dots","Dots"]];
let tool="fill",size=1,free=false,fade=0,pat="cray",draw=null;
function renderKit(){$("cKit").querySelectorAll("[data-tool]").forEach(b=>{const on=b.dataset.tool===tool;b.classList.toggle("on",on);b.setAttribute("aria-checked",on)});renderOpts()}
function renderOpts(){const o=$("cOpts"),c=cur?colorOf(cur,color):"#FFB400",chip=(on,attrs,lbl,inner="")=>`<button class="c-op${on?" on":""}" ${attrs} aria-label="${esc(lbl)}">${inner}</button>`;
  o.dataset.tool=tool;
  if(tool==="brush"||tool==="eraser")o.innerHTML=`<div role="radiogroup" aria-label="${esc(tt("tool.size","Size"))}">`+SIZES.map((z,i)=>chip(i===size,`data-size="${i}" role="radio" aria-checked="${i===size}"`,tt(["size.s","size.m","size.l"][i],["Small","Medium","Big"][i]),`<i class="c-dot" style="--z:${[8,16,26][i]}px"></i>`)).join("")+`</div>`+
    `<button class="c-op c-free${free?" on":""}" id="cFree" aria-pressed="${free}">${esc(tt("tool.free","Free"))}</button>`;
  else if(tool==="fade")o.innerHTML=`<div role="radiogroup" aria-label="${esc(tt("tool.fade","Fade"))}">`+FADES.map(([a,b],i)=>chip(i===fade,`data-fade="${i}" role="radio" aria-checked="${i===fade}" style="--g:linear-gradient(135deg,${a==="@"?c:a},${b})"`,nm("fade.n","Fade {n}",i+1),"<i></i>")).join("")+`</div>`;
  else if(tool==="pattern")o.innerHTML=`<div role="radiogroup" aria-label="${esc(tt("tool.pattern","Pattern"))}">`+PATS.map(([k,en])=>chip(k===pat,`data-pat="${k}" role="radio" aria-checked="${k===pat}"`,tt("pat."+k,en),`<i style="background-image:url(${tile(k,c).toDataURL()})"></i><span>${esc(tt("pat."+k,en))}</span>`)).join("")+`</div>`;
  else o.innerHTML=`<p class="c-tip">${esc(t("color.hint"))}</p>`}
$("cKit").addEventListener("click",e=>{const b=e.target.closest("[data-tool]");if(!b||b.dataset.tool===tool)return;tool=b.dataset.tool;Game.buzz(6);Game.sfx("tap");renderKit();
  if(b.animate&&!reduce.matches)b.animate([{transform:"scale(.85)"},{transform:"none"}],{duration:280,easing:"cubic-bezier(.34,1.56,.64,1)"})});
$("cOpts").addEventListener("click",e=>{const b=e.target.closest(".c-op");if(!b)return;Game.buzz(6);
  if(b.id==="cFree")free=!free;else if(b.dataset.size)size=+b.dataset.size;else if(b.dataset.fade)fade=+b.dataset.fade;else if(b.dataset.pat)pat=b.dataset.pat;renderOpts()});
// Every change is one Undo step; a new change clears Redo.
function push(u){cur.undo.push(u);cur.redo.length=0}
stage.addEventListener("pointerdown",e=>{if(!cur)return;if(gest){joinGesture(e);return}if(e.target.closest(".c-st"))return;
  if(pinch)return;
  if(draw){if(e.pointerType==="touch"&&draw.pointer==="touch")startPinch(e);return}   // a second finger zooms and pans; the first finger's stroke is let go
  const [x,y]=pagePoint(e),{w,h}=cur.pd.meta;if(x<0||y<0||x>=w||y>=h)return;const r=regionAt(x,y),c=colorOf(cur,color);
  if(!r&&tool!=="brush"&&tool!=="eraser"&&e.pointerType!=="touch")return;
  if(tool==="fade"&&r)mask(cur.pd,r);
  draw={pointer:e.pointerType,id:e.pointerId,r,cx:e.clientX,cy:e.clientY,x,y,moved:false,done:0,k:cv.width/cv.getBoundingClientRect().width};
  if(tool==="brush"||tool==="eraser"){const op={c:tool==="eraser"?"#000000":c,w:SIZES[size]*(tool==="eraser"?1.4:1),r:free?0:r,p:[Math.round(x),Math.round(y)]};if(tool==="eraser")op.e=1;draw.op=op;inkSoon()}
  try{stage.setPointerCapture(e.pointerId)}catch{}e.preventDefault()});
let inkRaf=0;const inkSoon=()=>{if(!inkRaf)inkRaf=requestAnimationFrame(inkFrame)};
// Strokes draw once per frame, only the new points, and only their box is composed again (no full repaint per move).
function inkFrame(){inkRaf=0;if(!draw||!draw.op||!cur)return;const n=draw.op.p.length/2;if(draw.done>=n)return;
  refresh(inkOp(cur.pd,cur.inkC.getContext("2d"),draw.op,Math.max(0,draw.done-1)));draw.done=n}
stage.addEventListener("pointermove",e=>{if(pinch){movePinch(e);return}if(!draw||e.pointerId!==draw.id)return;draw.lx=e.clientX;draw.ly=e.clientY;if(Math.hypot(e.clientX-draw.cx,e.clientY-draw.cy)>8)draw.moved=true;
  if(!draw.op)return;const p=draw.op.p,evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];
  for(const ev of (evs.length?evs:[e])){const [x,y]=pagePoint(ev),a=Math.round(x),b=Math.round(y);if(Math.hypot(a-p[p.length-2],b-p[p.length-1])>=2.5)p.push(a,b)}inkSoon()});
// Fill and Pattern act when the finger lifts (on the shape first touched), so a two-finger zoom never fills a shape by accident.
function fillAt(e,r){const c=colorOf(cur,color),f=tool==="pattern"?{k:pat,a:c}:null,old=cur.fx[r]||0;
  if(!r||cur.fills[r]===color&&JSON.stringify(old||null)===JSON.stringify(f))return;
  push([r,cur.fills[r],old]);cur.fills[r]=color;if(f)cur.fx[r]=f;else delete cur.fx[r];paintRegion(cur,r);Game.sfx("fill");Game.buzz(8);save();if(e.pointerType!=="mouse")fillPop(e)}
function endDraw(e){if(pinch){endPinch(e);return}if(!draw||e.pointerId!==draw.id)return;const d=draw;draw=null;if(inkRaf){cancelAnimationFrame(inkRaf);inkRaf=0}
  if(tool==="fill"||tool==="pattern"){if(e.type==="pointerup")fillAt(e,d.r);return}
  if(d.op){const n=d.op.p.length/2;if(d.done<n)refresh(inkOp(cur.pd,cur.inkC.getContext("2d"),d.op,Math.max(0,d.done-1)));
    if(d.op.e&&!d.moved&&d.r){   // a tap with the eraser clears the shape back to paper: its color, gradient or pattern and the ink inside it
      const r=d.r;push(["m",[[r,cur.fills[r],cur.fx[r]||0],["ink","pop"]]]);cur.ink.push({x:r});cur.fills[r]=0;delete cur.fx[r];
      redrawInk();paintRegion(cur,r);Game.sfx("tap");Game.buzz(10);save();return}
    if(inkCount()+d.op.p.length>INK_MAX){redrawInk();say(tt("color.inkFull","This page is full of brush. Try Fill or Fade."));return}
    cur.ink.push(d.op);push(["ink","pop"]);Game.buzz(6);save();return}
  if(tool==="fade"&&d.r){const [x,y]=e.type==="pointercancel"?[d.x,d.y]:pagePoint(e),r=d.r,[a,b]=FADES[fade],A=a==="@"?colorOf(cur,color):a,[x0,y0,x1,y1]=bboxOf(cur.pd,r);
    const f=d.moved?{k:"lin",a:A,b,p:[d.x,d.y,x,y].map(Math.round)}:{k:"rad",a:A,b,p:[Math.round(d.x),Math.round(d.y),Math.round(Math.max(...[[x0,y0],[x1,y0],[x0,y1],[x1,y1]].map(([u,v])=>Math.hypot(u-d.x,v-d.y))))]};
    push([r,cur.fills[r],cur.fx[r]||0]);cur.fills[r]=color;cur.fx[r]=f;paintRegion(cur,r);Game.sfx("fill");Game.buzz(8);save();if(e.pointerType!=="mouse")fillPop(e)}}
const inkCount=()=>cur.ink.reduce((n,o)=>n+(o.p?o.p.length:1),0);
/* ---- two fingers: pinch to zoom (1x to 4x) and pan; the page is moved with a transform only, once per frame, and comes back to 1x when let go near it ---- */
let pinch=null,zoom={z:1,x:0,y:0},zRaf=0;
const zApply=()=>{zRaf=0;stage.style.transform=zoom.z===1&&!zoom.x&&!zoom.y?"":`translate3d(${zoom.x}px,${zoom.y}px,0) scale(${zoom.z})`;zSync()};
function zReset(){zoom={z:1,x:0,y:0};pinch=null;zApply()}
// Every zoom level can be left (owner rule: every path is reversible): the zoom-out button, Esc, the editor's Back button and the
// phone's Back each bring the page back to 1x first. No history entry is added for a zoom (Chrome skips entries pushed without a tap);
// the phone's Back reaches close() below, which zooms out instead while zoomed.
const zoomed=()=>zoom.z>1.001;
function zSync(){const b=$("cZoomOut");if(b)b.hidden=!zoomed()}
function zoomOut(){if(!zoomed())return false;stage.classList.add("zback");setTimeout(()=>stage.classList.remove("zback"),300);zoom={z:1,x:0,y:0};pinch=null;zApply();return true}
$("cZoomOut").addEventListener("click",()=>{Game.buzz(6);zoomOut()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&over.classList.contains("open")&&$("cEdit").classList.contains("active")&&wheel.hidden&&zoomOut()){e.stopImmediatePropagation();e.preventDefault()}},true);   // before js/game.js, whose Esc closes Color
function startPinch(e){const d=draw;draw=null;if(inkRaf){cancelAnimationFrame(inkRaf);inkRaf=0}if(d&&d.op)redrawInk();   // the first finger's unfinished stroke is dropped
  const P=new Map([[d.id,[d.lx??d.cx,d.ly??d.cy]],[e.pointerId,[e.clientX,e.clientY]]]);try{stage.setPointerCapture(e.pointerId)}catch{}
  const R=stage.getBoundingClientRect();pinch={P,a:[...P.values()].map(v=>v.slice()),z0:{...zoom},w:stage.offsetWidth,h:stage.offsetHeight,O:[R.left-zoom.x,R.top-zoom.y]}}
function endPinch(e){pinch.P.delete(e.pointerId);if(pinch.P.size)return;pinch=null;if(zoom.z<1.08){zoom={z:1,x:0,y:0};if(!zRaf)zRaf=requestAnimationFrame(zApply)}}
function movePinch(e){if(!pinch.P.has(e.pointerId))return;pinch.P.set(e.pointerId,[e.clientX,e.clientY]);const [a,b]=pinch.a,[c,d]=[...pinch.P.values()],o=pinch.z0;
  const z=Math.max(1,Math.min(4,o.z*Math.hypot(c[0]-d[0],c[1]-d[1])/(Math.hypot(a[0]-b[0],a[1]-b[1])||1))),m0=[(a[0]+b[0])/2,(a[1]+b[1])/2],m1=[(c[0]+d[0])/2,(c[1]+d[1])/2];
  // the page point under the fingers' first midpoint stays under their midpoint now (O: the page's unmoved corner); never past the page's edges
  const px=(m0[0]-pinch.O[0]-o.x)/o.z,py=(m0[1]-pinch.O[1]-o.y)/o.z;
  zoom={z,x:Math.min(0,Math.max(pinch.w*(1-z),m1[0]-pinch.O[0]-z*px)),y:Math.min(0,Math.max(pinch.h*(1-z),m1[1]-pinch.O[1]-z*py))};
  if(!zRaf)zRaf=requestAnimationFrame(zApply)}
stage.addEventListener("pointerup",endDraw);stage.addEventListener("pointercancel",endDraw);
// Undo history survives leaving and reopening a page (the owner: "undo button is not working in mewarnai": the colors came
// back but the history did not, so Undo looked active and did nothing). The button is disabled when there is nothing to undo.
function updUndo(){const b=$("cUndo"),rd=$("cRedo");if(b)b.disabled=!(cur&&cur.undo.length);if(rd)rd.disabled=!(cur&&cur.redo.length)}
// Apply one history entry and return the entry that reverses it (Undo feeds Redo and back).
function apply(u){
  if(u[0]==="st"){const inv=["st",cur.stickers.map(x=>({...x}))];cur.stickers=u[1];renderStickers();return inv}
  if(u[0]==="ink"){if(u[1]==="push"){cur.ink.push(u[2]);refresh(inkOp(cur.pd,cur.inkC.getContext("2d"),u[2]));return ["ink","pop"]}
    const op=cur.ink.pop();redrawInk();return op?["ink","push",op]:null}
  if(u[0]==="m"){const inv=[];for(let i=u[1].length-1;i>=0;i--){const v=apply(u[1][i]);if(v)inv.push(v)}return ["m",inv]}
  const r=u[0],inv=[r,cur.fills[r],cur.fx[r]||0];cur.fills[r]=u[1];if(u[2])cur.fx[r]=u[2];else delete cur.fx[r];paintRegion(cur,r);return inv}
function step(from,to){const u=cur&&cur[from].pop();if(!u){updUndo();return}Game.buzz(6);const inv=apply(u);if(inv)cur[to].push(inv);save()}
$("cUndo").onclick=()=>step("undo","redo");$("cRedo").onclick=()=>step("redo","undo");
// Peek: hold to see Ekky's own colors
const peek=on=>{$("cPeek").classList.toggle("show",on&&!!$("cPeek").getAttribute("src"))};
$("cPeekBtn").addEventListener("pointerdown",e=>{e.preventDefault();peek(true)});["pointerup","pointerleave","pointercancel"].forEach(ev=>$("cPeekBtn").addEventListener(ev,()=>peek(false)));
$("cPeekBtn").addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter")peek(true)});$("cPeekBtn").addEventListener("keyup",()=>peek(false));
$("cBack").onclick=()=>{if(zoomOut())return;save(true);openPicker()};
$("cDone").onclick=reveal;   // the screen switches on the tap frame; the save (thumbnail, JSON) runs after the reveal has painted

/* ---- stickers: tap one in the tray to add it; drag to move, pinch to scale and rotate, drag onto the bin to remove ---- */
if($("cStickBtn")){
  $("cStickBtn").onclick=()=>{const tr=$("cTray"),open=tr.hidden;tr.hidden=!open;$("cStickBtn").setAttribute("aria-expanded",open);
    if(open)tr.innerHTML=stickers().map(s=>`<button class="c-tray-st" data-n="${s.n}" aria-label="${esc(nm("color.sticker","Sticker {n}",s.n))}"><img src="${s.src}" alt=""></button>`).join("")};
  $("cTray").addEventListener("click",e=>{const b=e.target.closest("[data-n]");if(!b||!cur)return;
    if(cur.stickers.length>=MAX_STICKERS)return say(t("color.full"));
    push(["st",cur.stickers.map(x=>({...x}))]);
    cur.stickers.push({n:+b.dataset.n,x:.5+(Math.random()-.5)*.2,y:.45+(Math.random()-.5)*.2,s:.24,r:0});renderStickers();popSticker(cur.stickers.length-1);Game.sfx("tap");Game.buzz(8);save()});
}
function renderStickers(){$("cStickers").innerHTML=cur.stickers.map((s,k)=>{const im=STICKERS.find(x=>x.n===s.n);imgOf(s.n);
  return `<img class="c-st" data-k="${k}" src="${im.src}" alt="" draggable="false" style="left:${s.x*100}%;top:${s.y*100}%;width:${s.s*100}%;transform:translate(-50%,-50%) rotate(${s.r}rad)">`}).join("")}
const pts=new Map();let gest=null;
function rebase(){if(dragRaf){cancelAnimationFrame(dragRaf);dragFrame()}gest.base={...cur.stickers[gest.k]};gest.start=[...pts.values()].map(p=>p.slice())}
function joinGesture(e){if(pts.has(e.pointerId))return;e.preventDefault();pts.set(e.pointerId,[e.clientX,e.clientY]);try{stage.setPointerCapture(e.pointerId)}catch{}rebase()}
$("cStickers").addEventListener("pointerdown",e=>{const el=e.target.closest(".c-st");if(!el||!cur)return;e.preventDefault();el.setPointerCapture(e.pointerId);
  if(gest)return joinGesture(e);   // a second finger on any sticker pinches the sticker already held
  pts.set(e.pointerId,[e.clientX,e.clientY]);const k=+el.dataset.k;
  {gest={k,el,before:cur.stickers.map(x=>({...x})),orig:{...cur.stickers[k]},rect:stage.getBoundingClientRect(),bin:null,hot:false};$("cBin").classList.add("show");setTimeout(()=>{if(gest&&gest.el===el)gest.bin=$("cBin").getBoundingClientRect()},260)}
  el.classList.add("drag");
  gest.base={...cur.stickers[k]};gest.start=[...pts.values()].map(p=>p.slice())});
/* Dragging runs on requestAnimationFrame and moves the sticker with a transform only: the stage and bin rectangles are read once, never per move. */
let dragRaf=0;
function dragFrame(){dragRaf=0;if(!gest||!cur)return;const r=gest.rect,s=cur.stickers[gest.k],b=gest.base,o=gest.orig,now=[...pts.values()],st=gest.start;if(!now.length)return;
  if(now.length>=2&&st.length>=2){const d0=Math.hypot(st[1][0]-st[0][0],st[1][1]-st[0][1]),d1=Math.hypot(now[1][0]-now[0][0],now[1][1]-now[0][1]);
    const a0=Math.atan2(st[1][1]-st[0][1],st[1][0]-st[0][0]),a1=Math.atan2(now[1][1]-now[0][1],now[1][0]-now[0][0]);
    s.s=Math.max(.06,Math.min(.8,b.s*d1/(d0||1)));s.r=b.r+a1-a0;
    s.x=b.x+((now[0][0]+now[1][0])-(st[0][0]+st[1][0]))/2/r.width;s.y=b.y+((now[0][1]+now[1][1])-(st[0][1]+st[1][1]))/2/r.height}
  else{s.x=b.x+(now[0][0]-st[0][0])/r.width;s.y=b.y+(now[0][1]-st[0][1])/r.height}
  s.x=Math.max(0,Math.min(1,s.x));s.y=Math.max(0,Math.min(1,s.y));
  gest.el.style.transform=`translate(-50%,-50%) translate3d(${(s.x-o.x)*r.width}px,${(s.y-o.y)*r.height}px,0) rotate(${s.r}rad) scale(${s.s/o.s})`;
  const bn=gest.bin,p=now[now.length-1],hot=!!bn&&p[0]>bn.left&&p[0]<bn.right&&p[1]>bn.top&&p[1]<bn.bottom;
  if(hot!==gest.hot){gest.hot=hot;$("cBin").classList.toggle("hot",hot)}}
stage.addEventListener("pointermove",e=>{if(!gest||!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(!dragRaf)dragRaf=requestAnimationFrame(dragFrame)});
function endGesture(e){if(!gest||!pts.has(e.pointerId))return;if(dragRaf){cancelAnimationFrame(dragRaf);dragFrame()}pts.delete(e.pointerId);
  if(pts.size){rebase();return}
  const hot=$("cBin").classList.contains("hot");$("cBin").classList.remove("show","hot");
  const k=gest.k,moved=JSON.stringify(gest.before[k])!==JSON.stringify(cur.stickers[k]);   // a plain tap on a sticker is not an edit: no Undo step
  if(moved||hot)push(["st",gest.before]);if(hot){cur.stickers.splice(k,1);Game.buzz(15)}gest=null;renderStickers();if(!hot&&moved)popSticker(k);save()}
function popSticker(k){const el=$("cStickers").children[k];if(el){el.classList.add("pop");setTimeout(()=>el.classList.remove("pop"),300)}}
["pointerup","pointercancel"].forEach(ev=>stage.addEventListener(ev,endGesture));

/* ---- autosave to Mine ---- */
let saveT=0;
function save(now){updUndo();if(!cur)return;clearTimeout(saveT);const run=()=>{if(!cur)return;const st=Game.st;st.colorings=st.colorings||{};
  let thumb="";try{const c=document.createElement("canvas");c.width=240;c.height=Math.round(240*cur.pd.meta.h/cur.pd.meta.w);compose(cur,c.getContext("2d"),0,0,240,1,cv);thumb=c.toDataURL("image/jpeg",.7);c.width=c.height=0}catch{}
  st.colorings[cur.pd.id]={title:cur.title,fills:[...cur.fills],custom:cur.custom,stickers:cur.stickers.map(s=>({n:s.n,x:+s.x.toFixed(4),y:+s.y.toFixed(4),s:+s.s.toFixed(4),r:+s.r.toFixed(4)})),undo:cur.undo.slice(-UNDO_KEEP),at:Date.now(),thumb};
  if(Object.keys(cur.fx).length)st.colorings[cur.pd.id].fx=cur.fx;if(cur.ink.length)st.colorings[cur.pd.id].ink=cur.ink;Game.save();updUndo()};
  if(now)run();else saveT=setTimeout(()=>window.requestIdleCallback?requestIdleCallback(run,{timeout:1500}):run(),400)}

/* ---- reveal: yours and Ekky's, then the share preview ---- */
function reveal(){const s=cur,scratch=s.pd.id==="scratch",c=$("cYours"),{w,h}=s.pd.meta,ek=$("cEkky");
  c.width=480;c.height=Math.round(480*h/w);
  $("cRevTitle").textContent=scratch?t("color.scratch"):t("reveal.title");$("cEkkyFig").hidden=scratch;
  view("cReveal");   // the screen switches on the tap frame; the drawing, the image and the save follow, so the tap never waits on them
  requestAnimationFrame(()=>{if(cur!==s)return;compose(s,c.getContext("2d"),0,0,480,1,cv);Game.sfx("level");Game.st.firstDone=1;requestAnimationFrame(()=>{if(cur===s){save(true);Game.save()}})});   // no confetti here: it covered the comparison (share playtest); the reveal itself is the reward
  if(scratch){ek.removeAttribute("src");return}
  ek.style.opacity=0;ek.src=s.pd.meta.original||(bySlug(s.pd.meta.slug)||{}).full||"";
  ek.decode().catch(()=>{}).then(()=>{ek.style.opacity=""})}
$("cClose").onclick=close;$("cAgain").onclick=()=>{view("cEdit");sizeStage()};
if($("cShare"))$("cShare").onclick=()=>typeof Share!=="undefined"&&Share.openPreview(shareData());
if($("cDl"))$("cDl").onclick=()=>typeof Share!=="undefined"&&Share.download({...shareData(),name:Game.st.name||""});
function shareData(){const s=cur;return {art:s.pd.meta.slug||null,page:s.pd.id,get title(){return s.title},stickers:s.stickers.map(x=>x.n),
  draw:(ctx,X,Y,W,t)=>compose(s,ctx,X,Y,W,t),aspect:s.pd.meta.h/s.pd.meta.w,link:name=>Links.colorUrl(s,name)}}

/* ---- arrival: a friend's coloring link (js/links.js) ---- */
async function showArrival(id,fills,custom,stks,from){let pd;try{pd=await pageData(id)}catch{return false}
  const s=makeState(pd,{fills,custom,stickers:stks}),pr=bySlug(pd.meta.slug),title=id==="scratch"?t("color.scratch"):ptitle(pr);s.title=title;
  const c=$("cArriveCanvas");c.width=560;c.height=Math.round(560*pd.meta.h/pd.meta.w);
  await Promise.all(s.stickers.map(x=>{const im=imgOf(x.n);return im.complete?0:new Promise(r=>{im.onload=im.onerror=r})}));
  compose(s,c.getContext("2d"),0,0,560);
  arriveRe=()=>{const title=id==="scratch"?t("color.scratch"):ptitle(pr);
    $("cArriveTitle").textContent=id==="scratch"?(from?t("arrive.scene",{name:from}):t("arrive.sceneAnon")):from?t("arrive.color",{name:from,title}):t("arrive.color.anon",{title})};arriveRe();
  $("cArriveColor").onclick=()=>open(id);view("cArrive");return true}
$("cArriveX").onclick=close;$("cArriveExplore").onclick=()=>{close();Game.go("map")};

/* ---- language switched in place ("ekky:lang", js/site.js): the overlay markup above was built once with t(), so its words are set again here ---- */
let arriveRe=null;
const LBL=[["#cPick .g-title","color.title"],["#cPick .g-sub","color.intro"],["#gColor [data-hire]","hire.chip.aria","aria"],
  ["#cPick .g-hire span","sheet.hire"],["#cEdit .g-hire span","hire.chip"],["#cReveal .g-hire span","hire.chip"],["#cArrive .g-hire span","hire.chip"],
  ["#cPickX","ui.close","aria","Close"],["#cClose","ui.close","aria","Close"],["#cArriveX","ui.close","aria","Close"],["#cBack","ui.back","aria","Back"],
  ["#cDone","color.done"],["#cRedo span","color.redo","text","Redo"],["#cKit","tool.tools","aria","Tools"],["[data-tool=fill] span","tool.fill","text","Fill"],["[data-tool=brush] span","tool.brush","text","Brush"],["[data-tool=fade] span","tool.fade","text","Fade"],["[data-tool=pattern] span","tool.pattern","text","Pattern"],["[data-tool=eraser] span","tool.eraser","text","Eraser"],["#cBin span","color.bin"],["#cColors","color.colors","aria","Colors"],["#cUndo span","color.undo"],["#cPeekBtn span","color.peek"],["#cStickBtn span","color.stickers"],
  ["#cWheel","color.any","aria"],["#cWheel .c-wheel-top b","color.any"],['#cWheel [data-k="h"]',"wheel.hue","aria","Hue"],['#cWheel [data-k="s"]',"wheel.sat","aria","Strength"],
  ['#cWheel [data-k="l"]',"wheel.light","aria","Light"],["#cWNo","wheel.cancel","text","Cancel"],["#cWYes","wheel.add","text","Use this color"],
  ["#cReveal figure:first-child figcaption","reveal.yours"],["#cEkkyFig figcaption","reveal.ekky"],["#cShare","reveal.share"],["#cDl","dl.button"],["#cAgain","reveal.again"],
  ["#cArriveColor","arrive.mine"],["#cArriveExplore","arrive.explore"]];
function relang(){
  LBL.forEach(([sel,k,kind,en])=>{const w=en?tt(k,en):t(k);over.querySelectorAll(sel).forEach(el=>{
    if(kind==="aria")return el.setAttribute("aria-label",w);
    const n=[...el.childNodes].reverse().find(x=>x.nodeType===3&&x.textContent.trim());
    if(n)n.textContent=(/^\s/.test(n.textContent)?" ":"")+w;else if(!el.children.length)el.textContent=w})});
  over.setAttribute("aria-label",t("color.title"));
  // A closed overlay keeps "active" on its last view, so only redraw views while the overlay is open.
  const shown=over.classList.contains("open");
  if(shown&&$("cPick").classList.contains("active"))openPicker();
  if(cur){const pr=bySlug(cur.pd.meta.slug);cur.title=cur.pd.id==="scratch"?t("color.scratch"):pr?ptitle(pr):cur.pd.meta.title;$("cTitle").textContent=cur.title;
    $("cRevTitle").textContent=cur.pd.id==="scratch"?t("color.scratch"):t("reveal.title");renderColors();renderOpts();
    if(!$("cTray").hidden)$("cTray").innerHTML=stickers().map(s=>`<button class="c-tray-st" data-n="${s.n}" aria-label="${esc(nm("color.sticker","Sticker {n}",s.n))}"><img src="${s.src}" alt=""></button>`).join("")}
  if(shown&&arriveRe&&$("cArrive").classList.contains("active"))arriveRe()}
addEventListener("ekky:lang",relang);

return {openPicker,open,close,showArrival,pages,stickers,PAGES,STICKERS,SCRATCH,get state(){return cur},compose,pageData,makeState};
})();
