// Color with Ekky (B10) and the Doodle Scene with stickers (B21). One overlay inside #game with four views:
// the page picker, the editor (tap a shape to fill it, Undo, Peek, stickers), the reveal ("Yours and Ekky's")
// and the arrival view for a friend's coloring link (js/links.js). Every action autosaves to Mine.
// Pages come from scripts/make-page.mjs (assets/color/<page>/page.js); only shareable() pieces are offered.
const Color=(()=>{
const G=document.getElementById("game");
// A page with a switch stays hidden until FEATURES turns it on (Road Trip waits for Ekky's OK on the lines).
const PAGES=[{id:"giraffe",slug:"giraffe"},{id:"road-trip",slug:"road-trip",flag:"pageRoadTrip"},{id:"monster",slug:"monster",flag:"pageMonster"},{id:"little-planet",slug:"little-planet",flag:"pageLittlePlanet"},{id:"hands",slug:"hands",flag:"pageHands"},{id:"day-in-life",slug:"day-in-life"},{id:"plug-hero",slug:"plug-hero",flag:"pagePlugHero"}];
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
    <div class="c-stage-wrap"><div class="c-stage" id="cStage"><canvas id="cCanvas"></canvas><img class="c-peek" id="cPeek" alt=""><div class="c-stickers" id="cStickers"></div>
      <div class="c-bin" id="cBin">${ico("i-trash")}<span>${esc(t("color.bin"))}</span></div><p class="c-hint" id="cHint"></p></div></div>
    <div class="c-colors" id="cColors" role="radiogroup" aria-label="${esc(tt("color.colors","Colors"))}"></div>
    <div class="c-tools"><button class="c-tool" id="cUndo">${ico("i-undo")}<span>${esc(t("color.undo"))}</span></button>
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
      <button class="g-btn alt" id="cAgain">${esc(t("reveal.again"))}</button><button class="g-link" id="cAnother">${esc(t("reveal.another"))}</button>
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
function close(){over.classList.remove("open");cur=null}

/* ---- picker ---- */
function openPicker(){
  $("cPages").innerHTML=pages().map(p=>{const pr=bySlug(p.slug);return `<button class="c-page" data-page="${p.id}"><img src="${pr.img}" alt="" loading="lazy"><b>${esc(ptitle(pr))}</b></button>`}).join("")+
    (feature("doodleScene")?`<button class="c-page c-scratch" data-page="scratch">${ico("i-plus")}<b>${esc(t("color.scratch"))}</b><small>${esc(t("color.scratch.sub"))}</small></button>`:"");
  view("cPick");setTimeout(()=>$("cPickX").focus({preventScroll:true}),50)}
$("cPages").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b){Game.buzz(10);Game.sfx("tap");open(b.dataset.page)}});
$("cPickX").onclick=close;

/* ---- page data ---- */
const cache={};
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function loadImg(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src})}
// Region index: for region r, its pixels are idx[start[r] .. start[r+1]).
async function pageData(id){
  if(cache[id])return cache[id];
  let meta,ids;
  if(id==="scratch"){meta=SCRATCH;ids=new Uint16Array(meta.w*meta.h).fill(1)}
  else{const p=pages().find(x=>x.id===id);if(!p)throw new Error("no page "+id);
    if(!(window.COLOR_PAGE_DATA||{})[id])await loadScript(`assets/color/${id}/page.js`);
    meta=COLOR_PAGE_DATA[id];const map=await loadImg(meta.mapData);
    const c=document.createElement("canvas");c.width=meta.w;c.height=meta.h;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(map,0,0);
    const d=x.getImageData(0,0,meta.w,meta.h).data;ids=new Uint16Array(meta.w*meta.h);for(let i=0;i<ids.length;i++)ids[i]=d[i*4]+d[i*4+1]*256}
  const k=meta.regions,start=new Int32Array(k+2),idx=new Int32Array(ids.length);
  for(let i=0;i<ids.length;i++)start[ids[i]+1]++;
  for(let r=1;r<=k+1;r++)start[r]+=start[r-1];
  const fillPos=start.slice();for(let i=0;i<ids.length;i++)idx[fillPos[ids[i]]++]=i;
  const line=meta.line?await loadImg(`assets/color/${id}/${meta.line}`).catch(()=>null):null;
  // rank: the order regions fill in the share video, a top-to-bottom sweep by each region's center
  const cy=[];for(let r=1;r<=k;r++){let sy=0,sx=0,n=start[r+1]-start[r];for(let j=start[r];j<start[r+1];j++){sy+=Math.floor(idx[j]/meta.w);sx+=idx[j]%meta.w}cy.push([r,n?sy/n+sx/n*.25:0])}
  const rank=new Int32Array(k+1);cy.sort((a,b)=>a[1]-b[1]).forEach(([r],i)=>rank[r]=i);
  return cache[id]={id,meta,ids,start,idx,line,rank};
}

/* ---- drawing: fills (0 = paper, 1..12 = the page's colors, 13..15 = custom colors), Ekky's lines on top ---- */
const hexRgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function colorOf(s,v){return v===0?"#FFFFFF":v<=12?s.pd.meta.colors[v-1]:s.custom[v-13]||"#FFFFFF"}
const UNDO_KEEP=40;
function makeState(pd,saved){const k=pd.meta.regions;const s={pd,fills:new Uint8Array(k+1),custom:[],stickers:[],undo:[]};
  // fills saved for a different region map (the page was rebuilt) are dropped rather than painted onto the wrong shapes
  if(saved){if((saved.fills||[]).length===k+1)saved.fills.forEach((v,r)=>{s.fills[r]=v});s.custom=(saved.custom||[]).slice(0,MAX_CUSTOM);s.stickers=(saved.stickers||[]).filter(x=>stickers().some(t=>t.n===x.n)).slice(0,MAX_STICKERS);
    if((saved.fills||[]).length===k+1&&Array.isArray(saved.undo))s.undo=saved.undo.filter(u=>Array.isArray(u)&&(u[0]==="st"?Array.isArray(u[1]):u[0]>0&&u[0]<=k)).slice(-UNDO_KEEP)}
  if(pd.id==="scratch"&&!saved)s.fills[1]=1;
  return s}
// Paint the fill layer of a state onto a canvas at the page's own size.
function paint(s,cv){const {meta,start,idx,line}=s.pd;cv.width=meta.w;cv.height=meta.h;const x=cv.getContext("2d");
  const img=x.createImageData(meta.w,meta.h),d=img.data;d.fill(255);
  for(let r=1;r<=meta.regions;r++){const v=s.fills[r];if(!v)continue;const [R,G2,B]=hexRgb(colorOf(s,v));
    for(let j=start[r];j<start[r+1];j++){const o=idx[j]*4;d[o]=R;d[o+1]=G2;d[o+2]=B}}
  x.putImageData(img,0,0);if(line)x.drawImage(line,0,0)}
// Repaint only the bounding box of region r: paper, then each pixel's region color, then Ekky's lines on top.
// fade: the new color fades into the shape over 250 ms (B39: shows which shape changed; reduced motion paints at once).
function paintRegion(s,cv,r,fade){const {meta,start,idx,line,ids}=s.pd;const x=cv.getContext("2d");
  let x0=meta.w,y0=meta.h,x1=0,y1=0;for(let j=start[r];j<start[r+1];j++){const i=idx[j],px=i%meta.w,py=(i-px)/meta.w;if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py}
  if(x1<x0)return;const w=x1-x0+1,h=y1-y0+1,img=x.createImageData(w,h),d=img.data,rgb=[];for(let v=0;v<16;v++)rgb[v]=hexRgb(colorOf(s,v));
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const c=rgb[s.fills[ids[(y0+yy)*meta.w+x0+xx]]],o=(yy*w+xx)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}
  const box=document.createElement("canvas");box.width=w;box.height=h;const bx=box.getContext("2d");bx.putImageData(img,0,0);if(line)bx.drawImage(line,x0,y0,w,h,0,0,w,h);
  if(!fade||reduce){x.drawImage(box,x0,y0);return}
  // a true 250 ms fade, by time not by frame: the old picture of the box, with the new one on top at the elapsed share
  const old=document.createElement("canvas");old.width=w;old.height=h;old.getContext("2d").drawImage(cv,x0,y0,w,h,0,0,w,h);
  const t0=performance.now();(function step(now){const k=Math.min(1,(now-t0)/250);x.drawImage(old,x0,y0);x.globalAlpha=k;x.drawImage(box,x0,y0);x.globalAlpha=1;if(k<1)requestAnimationFrame(step)})(t0)}
// Draw the whole picture (fills, lines, stickers) into a box on any canvas: thumbnails, reveal, share card, arrival.
// t (0..1) plays the picture as a timeline for the share video: the fills sweep in (to 0.8), then the stickers pop in.
function compose(s,ctx,X,Y,W,t=1){const {meta,rank}=s.pd,H=W*meta.h/meta.w,c=document.createElement("canvas");
  const fillT=Math.min(1,t/.8),stT=Math.max(0,Math.min(1,(t-.8)/.2)),pop=t>=1?1:1-Math.pow(1-stT,3);
  paint(t>=1?s:{...s,fills:s.fills.map((v,r)=>rank[r]<fillT*meta.regions?v:0)},c);ctx.drawImage(c,X,Y,W,H);
  if(!pop)return H;
  s.stickers.forEach(st=>{const im=imgOf(st.n);if(!im||!im.complete||!im.naturalWidth)return;const w=st.s*W*pop,h=w*im.naturalHeight/im.naturalWidth;
    ctx.save();ctx.translate(X+st.x*W,Y+st.y*H);ctx.rotate(st.r);ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore()});return H}

/* ---- editor ---- */
let cur=null,color=1,hintShown=false;
const cv=$("cCanvas"),stage=$("cStage");
async function open(id,opts={}){
  let pd;try{pd=await pageData(id)}catch{return openPicker()}
  const saved=opts.fresh?null:(Game.st.colorings||{})[id];
  cur=makeState(pd,saved);color=pd.id==="scratch"?4:1;
  const pr=bySlug(pd.meta.slug),title=id==="scratch"?t("color.scratch"):pr?ptitle(pr):pd.meta.title;cur.title=title;
  $("cTitle").textContent=title;stage.style.aspectRatio=`${pd.meta.w}/${pd.meta.h}`;
  $("cPeek").src=id==="scratch"?"":pd.meta.original||(bySlug(pd.meta.slug)||{}).full||"";$("cPeekBtn").hidden=id==="scratch";
  paint(cur,cv);renderColors();renderStickers();$("cTray").hidden=true;
  view("cEdit");sizeStage();updUndo();
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
  color=+b.dataset.v;renderColors()});
function addCustom(c){let i=cur.custom.indexOf(c);
  if(i<0){if(cur.custom.length<MAX_CUSTOM){cur.custom.push(c);i=cur.custom.length-1}else{i=MAX_CUSTOM-1;cur.custom[i]=c;paint(cur,cv)}}
  color=13+i;renderColors();save()}
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
function fillPop(e){const r=stage.getBoundingClientRect(),d=document.createElement("i");d.className="c-ripple";d.style.cssText=`left:${e.clientX-r.left}px;top:${e.clientY-r.top}px;--c:${colorOf(cur,color)}`;
  stage.appendChild(d);setTimeout(()=>d.remove(),400);
  const sw=$("cColors").querySelector(".c-sw.on");if(sw){sw.classList.remove("pop");void sw.offsetWidth;sw.classList.add("pop")}}
function pagePoint(e){const r=cv.getBoundingClientRect();return [Math.floor((e.clientX-r.left)/r.width*cur.pd.meta.w),Math.floor((e.clientY-r.top)/r.height*cur.pd.meta.h)]}
stage.addEventListener("pointerdown",e=>{if(!cur||e.target.closest(".c-st"))return;
  const [x,y]=pagePoint(e);if(x<0||y<0||x>=cur.pd.meta.w||y>=cur.pd.meta.h)return;const r=cur.pd.ids[y*cur.pd.meta.w+x];if(!r||cur.fills[r]===color)return;
  cur.undo.push([r,cur.fills[r]]);cur.fills[r]=color;paintRegion(cur,cv,r,true);Game.sfx("fill");Game.buzz(8);save();if(e.pointerType!=="mouse")fillPop(e)});
// Undo history survives leaving and reopening a page (the owner: "undo button is not working in mewarnai": the colors came
// back but the history did not, so Undo looked active and did nothing). The button is disabled when there is nothing to undo.
function updUndo(){const b=$("cUndo");if(b)b.disabled=!(cur&&cur.undo.length)}
$("cUndo").onclick=()=>{const u=cur&&cur.undo.pop();if(!u){updUndo();return}Game.buzz(6);
  if(u[0]==="st"){cur.stickers=u[1];renderStickers()}else{cur.fills[u[0]]=u[1];paintRegion(cur,cv,u[0])}save()};
// Peek: hold to see Ekky's own colors
const peek=on=>{$("cPeek").classList.toggle("show",on&&!!$("cPeek").getAttribute("src"))};
$("cPeekBtn").addEventListener("pointerdown",e=>{e.preventDefault();peek(true)});["pointerup","pointerleave","pointercancel"].forEach(ev=>$("cPeekBtn").addEventListener(ev,()=>peek(false)));
$("cPeekBtn").addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter")peek(true)});$("cPeekBtn").addEventListener("keyup",()=>peek(false));
$("cBack").onclick=()=>{save(true);openPicker()};
$("cDone").onclick=()=>{save(true);reveal()};

/* ---- stickers: tap one in the tray to add it; drag to move, pinch to scale and rotate, drag onto the bin to remove ---- */
if($("cStickBtn")){
  $("cStickBtn").onclick=()=>{const tr=$("cTray"),open=tr.hidden;tr.hidden=!open;$("cStickBtn").setAttribute("aria-expanded",open);
    if(open)tr.innerHTML=stickers().map(s=>`<button class="c-tray-st" data-n="${s.n}" aria-label="${esc(nm("color.sticker","Sticker {n}",s.n))}"><img src="${s.src}" alt=""></button>`).join("")};
  $("cTray").addEventListener("click",e=>{const b=e.target.closest("[data-n]");if(!b||!cur)return;
    if(cur.stickers.length>=MAX_STICKERS)return say(t("color.full"));
    cur.undo.push(["st",cur.stickers.map(x=>({...x}))]);
    cur.stickers.push({n:+b.dataset.n,x:.5+(Math.random()-.5)*.2,y:.45+(Math.random()-.5)*.2,s:.24,r:0});renderStickers();Game.sfx("tap");Game.buzz(8);save()});
}
function renderStickers(){$("cStickers").innerHTML=cur.stickers.map((s,k)=>{const im=STICKERS.find(x=>x.n===s.n);imgOf(s.n);
  return `<img class="c-st" data-k="${k}" src="${im.src}" alt="" draggable="false" style="left:${s.x*100}%;top:${s.y*100}%;width:${s.s*100}%;transform:translate(-50%,-50%) rotate(${s.r}rad)">`}).join("")}
const pts=new Map();let gest=null;
$("cStickers").addEventListener("pointerdown",e=>{const el=e.target.closest(".c-st");if(!el||!cur)return;e.preventDefault();el.setPointerCapture(e.pointerId);
  pts.set(e.pointerId,[e.clientX,e.clientY]);const k=+el.dataset.k;
  if(!gest||gest.k!==k){gest={k,el,before:cur.stickers.map(x=>({...x}))};$("cBin").classList.add("show")}
  gest.base={...cur.stickers[k]};gest.start=[...pts.values()].map(p=>p.slice())});
$("cStickers").addEventListener("pointermove",e=>{if(!gest||!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);
  const r=stage.getBoundingClientRect(),s=cur.stickers[gest.k],b=gest.base,now=[...pts.values()],st=gest.start;
  if(now.length>=2&&st.length>=2){const d0=Math.hypot(st[1][0]-st[0][0],st[1][1]-st[0][1]),d1=Math.hypot(now[1][0]-now[0][0],now[1][1]-now[0][1]);
    const a0=Math.atan2(st[1][1]-st[0][1],st[1][0]-st[0][0]),a1=Math.atan2(now[1][1]-now[0][1],now[1][0]-now[0][0]);
    s.s=Math.max(.06,Math.min(.8,b.s*d1/(d0||1)));s.r=b.r+a1-a0;
    s.x=b.x+((now[0][0]+now[1][0])-(st[0][0]+st[1][0]))/2/r.width;s.y=b.y+((now[0][1]+now[1][1])-(st[0][1]+st[1][1]))/2/r.height}
  else{s.x=b.x+(now[0][0]-st[0][0])/r.width;s.y=b.y+(now[0][1]-st[0][1])/r.height}
  s.x=Math.max(0,Math.min(1,s.x));s.y=Math.max(0,Math.min(1,s.y));
  gest.el.style.left=s.x*100+"%";gest.el.style.top=s.y*100+"%";gest.el.style.width=s.s*100+"%";gest.el.style.transform=`translate(-50%,-50%) rotate(${s.r}rad)`;
  const bin=$("cBin").getBoundingClientRect();$("cBin").classList.toggle("hot",e.clientX>bin.left&&e.clientX<bin.right&&e.clientY>bin.top&&e.clientY<bin.bottom)});
function endGesture(e){if(!gest||!pts.has(e.pointerId))return;pts.delete(e.pointerId);
  if(pts.size){gest.base={...cur.stickers[gest.k]};gest.start=[...pts.values()].map(p=>p.slice());return}
  const hot=$("cBin").classList.contains("hot");$("cBin").classList.remove("show","hot");
  cur.undo.push(["st",gest.before]);if(hot){cur.stickers.splice(gest.k,1);Game.buzz(15)}gest=null;renderStickers();save()}
["pointerup","pointercancel"].forEach(ev=>$("cStickers").addEventListener(ev,endGesture));

/* ---- autosave to Mine ---- */
let saveT=0;
function save(now){if(!cur)return;clearTimeout(saveT);const run=()=>{if(!cur)return;const st=Game.st;st.colorings=st.colorings||{};
  let thumb="";try{const c=document.createElement("canvas");c.width=240;c.height=Math.round(240*cur.pd.meta.h/cur.pd.meta.w);compose(cur,c.getContext("2d"),0,0,240);thumb=c.toDataURL("image/jpeg",.7)}catch{}
  st.colorings[cur.pd.id]={title:cur.title,fills:[...cur.fills],custom:cur.custom,stickers:cur.stickers.map(s=>({n:s.n,x:+s.x.toFixed(4),y:+s.y.toFixed(4),s:+s.s.toFixed(4),r:+s.r.toFixed(4)})),undo:cur.undo.slice(-UNDO_KEEP),at:Date.now(),thumb};Game.save();updUndo()};
  if(now)run();else saveT=setTimeout(run,400)}

/* ---- reveal: yours and Ekky's, then the share preview ---- */
function reveal(){const scratch=cur.pd.id==="scratch",c=$("cYours"),{w,h}=cur.pd.meta;c.width=480;c.height=Math.round(480*h/w);compose(cur,c.getContext("2d"),0,0,480);
  $("cRevTitle").textContent=scratch?t("color.scratch"):t("reveal.title");$("cEkkyFig").hidden=scratch;$("cEkky").src=scratch?"":cur.pd.meta.original||(bySlug(cur.pd.meta.slug)||{}).full||"";
  view("cReveal");Game.sfx("level");
  Game.st.firstDone=1;Game.save()}   // no confetti here: it covered the comparison (share playtest); the reveal itself is the reward
$("cClose").onclick=close;$("cAgain").onclick=()=>{view("cEdit");sizeStage()};$("cAnother").onclick=openPicker;
if($("cShare"))$("cShare").onclick=()=>typeof Share!=="undefined"&&Share.openPreview(shareData());
if($("cDl"))$("cDl").onclick=()=>typeof Share!=="undefined"&&Share.download({...shareData(),name:Game.st.name||""});
function shareData(){const s=cur;return {art:s.pd.meta.slug||null,page:s.pd.id,title:s.title,stickers:s.stickers.map(x=>x.n),
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
  ["#cDone","color.done"],["#cBin span","color.bin"],["#cColors","color.colors","aria","Colors"],["#cUndo span","color.undo"],["#cPeekBtn span","color.peek"],["#cStickBtn span","color.stickers"],
  ["#cWheel","color.any","aria"],["#cWheel .c-wheel-top b","color.any"],['#cWheel [data-k="h"]',"wheel.hue","aria","Hue"],['#cWheel [data-k="s"]',"wheel.sat","aria","Strength"],
  ['#cWheel [data-k="l"]',"wheel.light","aria","Light"],["#cWNo","wheel.cancel","text","Cancel"],["#cWYes","wheel.add","text","Use this color"],
  ["#cReveal figure:first-child figcaption","reveal.yours"],["#cEkkyFig figcaption","reveal.ekky"],["#cShare","reveal.share"],["#cDl","dl.button"],["#cAgain","reveal.again"],
  ["#cAnother","reveal.another"],["#cArriveColor","arrive.mine"],["#cArriveExplore","arrive.explore"]];
function relang(){
  LBL.forEach(([sel,k,kind,en])=>{const w=en?tt(k,en):t(k);over.querySelectorAll(sel).forEach(el=>{
    if(kind==="aria")return el.setAttribute("aria-label",w);
    const n=[...el.childNodes].reverse().find(x=>x.nodeType===3&&x.textContent.trim());
    if(n)n.textContent=(/^\s/.test(n.textContent)?" ":"")+w;else if(!el.children.length)el.textContent=w})});
  over.setAttribute("aria-label",t("color.title"));
  if($("cPick").classList.contains("active"))openPicker();
  if(cur){const pr=bySlug(cur.pd.meta.slug);cur.title=cur.pd.id==="scratch"?t("color.scratch"):pr?ptitle(pr):cur.pd.meta.title;$("cTitle").textContent=cur.title;
    $("cRevTitle").textContent=cur.pd.id==="scratch"?t("color.scratch"):t("reveal.title");renderColors();
    if(!$("cTray").hidden)$("cTray").innerHTML=stickers().map(s=>`<button class="c-tray-st" data-n="${s.n}" aria-label="${esc(nm("color.sticker","Sticker {n}",s.n))}"><img src="${s.src}" alt=""></button>`).join("")}
  if(arriveRe&&$("cArrive").classList.contains("active"))arriveRe()}
addEventListener("ekky:lang",relang);

return {openPicker,open,close,showArrival,pages,stickers,PAGES,STICKERS,SCRATCH,get state(){return cur},compose,pageData,makeState};
})();
