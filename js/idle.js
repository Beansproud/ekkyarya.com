// Idle surprise, on every page: after 10, 30, 60, 150, 210 and 300 seconds without a touch, key or scroll (then every 2 minutes more)
// one of Ekky's doodles makes one random move and shows a fun fact. One short move, then it fades away; any input sends it off.
(function(){
const STEPS=[10,30,60,150,210,300],MORE=120;
const SPRITES=["cat","palette","planet","pen-hand","ghost","astronaut","helmet"].map(n=>`assets/ui/${n}.png`);
const reduce=matchMedia("(prefers-reduced-motion: reduce)");
let last=Date.now(),base=last,idx=0,timer=0,buddy=null,hideT=0,shownAt=0,factIdx=0,lastFact=-1;
const at=i=>(i<STEPS.length?STEPS[i]:STEPS[STEPS.length-1]+MORE*(i-STEPS.length+1))*1000;
const total=()=>+t("fact.count")||0;
// something else has the screen: a game in play, a sheet, the coloring screen, a dialog
const busy=()=>document.hidden||document.querySelector("#game.playing,#game .c-over.open,#game .g-sheet.open,#game .g-over.open,dialog[open]");
// moves: one run of about 1.4 s each, on transform only
const MOVES=[
  [[{transform:"translateY(0)"},{transform:"translateY(-26px)",offset:.2},{transform:"translateY(0)",offset:.4},{transform:"translateY(-18px)",offset:.6},{transform:"translateY(0)",offset:.8},{transform:"translateY(-8px)",offset:.9},{transform:"translateY(0)"}],1400],   // hop
  [[{transform:"rotate(0) scale(1)"},{transform:"rotate(360deg) scale(1.25)",offset:.6},{transform:"rotate(360deg) scale(1)"}],1200],   // spin
  [[{transform:"rotate(0)"},{transform:"rotate(-16deg)",offset:.2},{transform:"rotate(14deg)",offset:.4},{transform:"rotate(-12deg)",offset:.6},{transform:"rotate(8deg)",offset:.8},{transform:"rotate(0)"}],1300],   // wave
  [[{transform:"translateX(-120px)"},{transform:"translateX(0)",offset:.55},{transform:"translateX(-10px)",offset:.7},{transform:"translateX(0)"}],1300],   // peek in from the edge
  [[{transform:"translateY(90px) scale(.6)",opacity:0},{transform:"translateY(-10px) scale(1.1)",opacity:1,offset:.6},{transform:"translateY(0) scale(1)",opacity:1}],1200],   // float up
  [[{transform:"translateX(-140px) rotate(-12deg)"},{transform:"translateX(180px) rotate(12deg)",offset:.5},{transform:"translateX(0) rotate(0)"}],1500],   // dash across and back
];

/* ---- start page: each beat plays ONE whole-grid effect, picked from 10, and the pictures settle back exactly where they were.
   transform and opacity only, added on top of each tile's own tilt (composite:"add"), springy cubic-bezier easing, 1.2 to 2 s,
   geometry read once before it starts (never inside a frame), will-change only while it runs. A tap stops it. ---- */
const E_OUT="cubic-bezier(.22,1,.36,1)",E_IN="cubic-bezier(.5,0,.9,.6)",E_IO="cubic-bezier(.45,0,.2,1)",E_SPRING="cubic-bezier(.34,1.56,.64,1)",E_LAND="cubic-bezier(.2,.7,.4,1)";
const T=(x=0,y=0,r=0,sx=1,sy=sx)=>`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
const pivot=(px,py,r)=>`translate(${px.toFixed(1)}px,${py.toFixed(1)}px) rotate(${r}deg) translate(${(-px).toFixed(1)}px,${(-py).toFixed(1)}px)`;   // turn about a corner without touching transform-origin
const rnd=(a,b)=>a+Math.random()*(b-a),sign=()=>Math.random()<.5?-1:1;
let running=[];
function go(el,frames,dur,delay,opts){const a=el.animate(frames,{duration:dur,delay:delay||0,fill:"backwards",composite:"add",...opts});running.push(a);return a}
function stopFx(){fxTok++;const r=running;running=[];r.forEach(a=>{try{a.cancel()}catch(e){}});document.querySelectorAll("#gFeatured .g-feat-cell").forEach(c=>c.style.willChange="")}
function startCells(){if(!document.body.classList.contains("game-mode"))return null;const st=document.getElementById("g-start");
  if(!st||!st.classList.contains("active"))return null;const cells=[...document.querySelectorAll("#gFeatured .g-feat-cell")];return cells.length?cells:null}
const EFFECTS=[
  ["wind",(c,R)=>c.forEach((el,i)=>{const d=(i%3)*110+(i/3|0)*70;
    go(el,[{transform:T(),offset:0,easing:E_OUT},{transform:T(38,-4,6),offset:.3,easing:E_IO},{transform:T(-12,2,-4),offset:.58,easing:E_IO},{transform:T(7,0,2),offset:.8,easing:E_OUT},{transform:T()}],1500,d);
    try{go(el,[{transform:"rotate(0deg)"},{transform:"rotate(16deg)",offset:.15},{transform:"rotate(-13deg)",offset:.3},{transform:"rotate(10deg)",offset:.45},{transform:"rotate(-7deg)",offset:.62},{transform:"rotate(3deg)",offset:.8},{transform:"rotate(0deg)"}],1500,d,{pseudoElement:"::before",easing:"ease-in-out"})}catch(e){}})],   // the tape flutters
  ["gravity",(c,R)=>c.forEach((el,i)=>{const d=Math.min(R[i].cy+R[i].h/2,640),k=(i/3|0)*150+(i%3)*60;
    go(el,[{transform:T(0,-d,(i%3-1)*5),offset:0,easing:E_IN},{transform:T(),offset:.4,easing:E_LAND},{transform:T(0,-26),offset:.58,easing:E_IN},{transform:T(),offset:.72,easing:E_LAND},{transform:T(0,-8),offset:.84,easing:E_IN},{transform:T()}],1500,k);
    running.push(el.animate([{opacity:0},{opacity:1,offset:.1},{opacity:1}],{duration:1500,delay:k,fill:"backwards"}));})],
  ["quake",(c)=>c.forEach(el=>{const f=[{transform:T(),offset:0,easing:E_IO}];for(let k=1;k<=15;k++){const a=Math.pow(1-k/16,1.3)*11;f.push({transform:T(sign()*a*rnd(.5,1),sign()*a*.5*rnd(.3,1),sign()*a*.35*rnd(.4,1)),offset:k/16,easing:E_IO})}f.push({transform:T()});go(el,f,1400,rnd(0,70))})],
  ["ripple",(c,R)=>{const o=R[Math.random()*R.length|0];const dist=R.map(r=>Math.hypot(r.cx-o.cx,r.cy-o.cy)),mx=Math.max(...dist,1);
    c.forEach((el,i)=>go(el,[{transform:T(),offset:0,easing:E_OUT},{transform:T(0,-16,(i%2?1:-1)*1.5,1.1),offset:.25,easing:E_IO},{transform:T(0,4,0,.97),offset:.55,easing:E_OUT},{transform:T(0,-2,0,1.02),offset:.78,easing:E_OUT},{transform:T()}],1200,dist[i]/mx*480))},],
  ["jelly",(c,R)=>c.forEach((el,i)=>{const h=R[i].h,P=[[1,1],[1.16,.82],[.9,1.12],[1.07,.94],[.97,1.03],[1.01,.99],[1,1]],O=[0,.18,.38,.58,.76,.9,1];
    go(el,P.map(([sx,sy],k)=>({transform:T(0,(1-sy)*h/2,0,sx,sy),offset:O[k],easing:E_IO})),1500,i*70)})],   // the bottom edge stays put
  ["balloon",(c)=>c.forEach((el,i)=>{const s=i%2?1:-1;
    go(el,[{transform:T(),offset:0,easing:E_OUT},{transform:T(s*6,-70,-s*3,1.03),offset:.45,easing:"cubic-bezier(.45,0,.55,1)"},{transform:T(-s*5,-64,s*2,1.03),offset:.62,easing:"cubic-bezier(.34,1.3,.64,1)"},{transform:T()}],1700,i*45)})],
  ["magnet",(c,R,G)=>c.forEach((el,i)=>{const dx=G.cx-R[i].cx,dy=G.cy-R[i].cy,s=i%2?1:-1;
    go(el,[{transform:T(),offset:0,easing:"cubic-bezier(.5,0,.75,0)"},{transform:T(dx*.9,dy*.9,s*7,.78),offset:.38},{transform:T(dx*.9,dy*.9,s*7,.78),offset:.5,easing:E_SPRING},{transform:T(-dx*.08,-dy*.08,0,1.02),offset:.78,easing:E_OUT},{transform:T()}],1700,i*25)})],
  ["domino",(c,R)=>c.forEach((el,i)=>{const px=-R[i].w/2,py=R[i].h/2,F=r=>({transform:pivot(px,py,r)});
    go(el,[{...F(0),offset:0,easing:E_OUT},{...F(16),offset:.35,easing:E_IO},{...F(-3),offset:.65,easing:E_OUT},{...F(0)}],1000,i*120)})],
  ["flip",(c)=>c.forEach((el,i)=>go(el,[{transform:"perspective(700px) rotateY(0deg) scale(1)",offset:0,easing:E_IO},{transform:"perspective(700px) rotateY(180deg) scale(1.08)",offset:.5,easing:E_IO},{transform:"perspective(700px) rotateY(360deg) scale(1)"}],950,i*150))],
  ["scatter",(c)=>c.forEach((el,i)=>{const dx=sign()*rnd(70,130),dy=sign()*rnd(60,120),r=sign()*rnd(12,30),sc=rnd(.85,1.1);
    go(el,[{transform:T(),offset:0,easing:"cubic-bezier(.2,.8,.3,1)"},{transform:T(dx,dy,r,sc),offset:.36},{transform:T(dx*.96,dy*.96,r,sc),offset:.5,easing:E_SPRING},{transform:T(-dx*.06,-dy*.06,-r*.1,1.02),offset:.82,easing:E_OUT},{transform:T()}],1700,i*40)})],
];
let lastFx=-1,fxTok=0;
function playFx(cells,k){stopFx();const n=EFFECTS.length;
  if(k==null){do{k=Math.floor(Math.random()*n)}while(n>1&&k===lastFx)}lastFx=k;
  const R=cells.map(c=>{const r=c.getBoundingClientRect();return {w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}});   // measured once, before anything moves
  const G={cx:R.reduce((a,r)=>a+r.cx,0)/R.length,cy:R.reduce((a,r)=>a+r.cy,0)/R.length};
  cells.forEach(c=>c.style.willChange="transform,opacity");   // the layers are made in this frame; the animations start in the next, so no frame pays for both
  const tok=++fxTok;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(tok!==fxTok)return;
    try{EFFECTS[k][1](cells,R,G)}catch(e){stopFx();return}
    const mine=running.slice();Promise.all(mine.map(a=>a.finished)).then(()=>{if(running[0]===mine[0]){running=[];cells.forEach(c=>c.style.willChange="")}},()=>{})}))}
function words(){return `<b>${esc(t("idle.label"))}</b> ${esc(t("fact."+(factIdx+1)))}`}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function show(){
  const n=total();if(!n||buddy)return;
  do{factIdx=Math.floor(Math.random()*n)}while(n>1&&factIdx===lastFact);lastFact=factIdx;
  buddy=document.createElement("div");buddy.className="idle-buddy";
  buddy.innerHTML=`<img src="${SPRITES[Math.floor(Math.random()*SPRITES.length)]}" alt="" width="64" height="64"><p class="idle-bubble" role="status">${words()}</p>`;
  const cells=reduce.matches?null:startCells();
  if(cells)playFx(cells);   // the start page: the pictures move, the doodle only appears (measured before it is added)
  const b0=buddy,add=()=>{if(buddy!==b0)return;document.body.appendChild(b0);shownAt=Date.now();
    const img=b0.firstChild,bub=b0.lastChild;
    bub.animate([{opacity:0},{opacity:1}],{duration:260,delay:reduce.matches?0:700,fill:"backwards"});   // after the move has started
    if(!cells&&!reduce.matches){const [frames,ms]=MOVES[Math.floor(Math.random()*MOVES.length)];img.animate(frames,{duration:ms,easing:"ease-in-out"})}};
  if(cells){shownAt=Date.now();setTimeout(add,250)}else add();
  clearTimeout(hideT);hideT=setTimeout(hide,6000);
}
function hide(){
  if(!buddy)return;const b=buddy;buddy=null;clearTimeout(hideT);
  const a=b.animate([{opacity:1},{opacity:0}],{duration:260,fill:"forwards"});a.onfinish=()=>b.remove();setTimeout(()=>b.remove(),600);
}
// the doodles and the bubble's fonts are fetched a few seconds in, so the first one to appear costs no frame
const warm=()=>{try{document.fonts.load('500 .85rem Poppins');document.fonts.load('700 .85rem Fredoka')}catch(e){}   // the bubble's faces too: the first load of a face re-lays out the page
  SPRITES.forEach(src=>{const i=new Image();i.src=src;if(i.decode)i.decode().catch(()=>{})})};
(window.requestIdleCallback||(f=>setTimeout(f,50)))(()=>setTimeout(warm,2000),{timeout:5000});
function arm(){clearTimeout(timer);timer=setTimeout(fire,Math.max(1000,at(idx)-(Date.now()-base)))}
function fire(){
  if(last!==base){base=last;idx=0;return arm()}   // there was input since: count from the start again
  if(Date.now()-base<at(idx)-500)return arm();
  if(!busy())show();
  idx++;arm();
}
function touch(e){const now=Date.now();if(/^(pointerdown|touchstart|keydown)$/.test(e.type)){last=now;stopFx();if(buddy)hide();return}   // a tap or key sends it off at once
  if(now-last<250)return;last=now;if(buddy&&now-shownAt>800)hide()}
["pointerdown","pointermove","keydown","wheel","touchstart","scroll"].forEach(ev=>addEventListener(ev,touch,{passive:true,capture:true}));
document.addEventListener("visibilitychange",()=>{last=Date.now()});
addEventListener("ekky:lang",()=>{if(buddy){const b=buddy.lastChild;if(b)b.innerHTML=words()}});
window.IdleFx={names:EFFECTS.map(e=>e[0]),play:k=>{const c=startCells();if(c)playFx(c,k);return !!c}};   // for the QA frame strip
arm();
})();
