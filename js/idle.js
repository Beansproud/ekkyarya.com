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
function words(){return `<b>${esc(t("idle.label"))}</b> ${esc(t("fact."+(factIdx+1)))}`}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function show(){
  const n=total();if(!n||buddy)return;
  do{factIdx=Math.floor(Math.random()*n)}while(n>1&&factIdx===lastFact);lastFact=factIdx;
  buddy=document.createElement("div");buddy.className="idle-buddy";
  buddy.innerHTML=`<img src="${SPRITES[Math.floor(Math.random()*SPRITES.length)]}" alt="" width="64" height="64"><p class="idle-bubble" role="status">${words()}</p>`;
  document.body.appendChild(buddy);shownAt=Date.now();
  const img=buddy.firstChild,bub=buddy.lastChild;
  bub.animate([{opacity:0},{opacity:1}],{duration:260,delay:reduce.matches?0:700,fill:"backwards"});   // after the move has started
  if(!reduce.matches){const [frames,ms]=MOVES[Math.floor(Math.random()*MOVES.length)];img.animate(frames,{duration:ms,easing:"ease-in-out"})}
  clearTimeout(hideT);hideT=setTimeout(hide,6000);
}
function hide(){
  if(!buddy)return;const b=buddy;buddy=null;clearTimeout(hideT);
  const a=b.animate([{opacity:1},{opacity:0}],{duration:260,fill:"forwards"});a.onfinish=()=>b.remove();setTimeout(()=>b.remove(),600);
}
function arm(){clearTimeout(timer);timer=setTimeout(fire,Math.max(1000,at(idx)-(Date.now()-base)))}
function fire(){
  if(last!==base){base=last;idx=0;return arm()}   // there was input since: count from the start again
  if(Date.now()-base<at(idx)-500)return arm();
  if(!busy())show();
  idx++;arm();
}
function touch(e){const now=Date.now();if(/^(pointerdown|touchstart|keydown)$/.test(e.type)){last=now;if(buddy)hide();return}   // a tap or key sends it off at once
  if(now-last<250)return;last=now;if(buddy&&now-shownAt>800)hide()}
["pointerdown","pointermove","keydown","wheel","touchstart","scroll"].forEach(ev=>addEventListener(ev,touch,{passive:true,capture:true}));
document.addEventListener("visibilitychange",()=>{last=Date.now()});
addEventListener("ekky:lang",()=>{if(buddy){const b=buddy.lastChild;if(b)b.innerHTML=words()}});
arm();
})();
