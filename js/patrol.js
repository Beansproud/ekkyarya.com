// Paint Patrol, stage 1 "Rush Hour" (MG1 engine + MG3 slice). Loaded only when the game opens (js/game.js openPatrol),
// behind the paintPatrol switch. Plan: docs/paint-patrol-plan.md. Balance: docs/minigames.md (the Director's table).
// Ekky drives his rolling desk, paint fires on its own, grey doodles turn back into color, and the green monster from
// Monster in My Room is calmed down with paint. No score, no timer, no health, nothing to lose.
(()=>{
const G=document.getElementById("game"),reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const {sfx,buzz,esc}=window.Game;
const PP={worldH:540,ground:470,heroH:110,run:200,gravity:1800,jumpHeights:1.6,paintRate:4,paintSpeed:650,bombRecharge:12,
  waveEvery:[3,5],maxOnScreen:5,hits:{normal:3,big:6},friendMeter:40,attackEvery:[2.5,3.5],telegraph:.8,
  stageScreens:12,screenW:960,knockback:120,invulnerable:.8,powerTime:6,dropChance:.25};
const DOODLES=[["virus","assets/ui/virus.png",58,0],["blob","assets/sprites/blob.png",70,0],["skull","assets/sprites/skull.png",56,0],
  ["orange-monster","assets/sprites/orange-monster.png",72,0],["pickle","assets/sprites/pickle.png",92,1],["dog","assets/sprites/dog.png",100,1],
  ["doodle-cat","assets/sprites/doodle-cat.png",62,0],["waver","assets/sprites/waver.png",96,1],["ufo","assets/sprites/ufo.png",70,0,1]];
const PAINT=["#FFB400","#FF6B6B","#7ED9B0","#68A0DB","#C38BFF"];
const IMG={},GREY={};
const load=(k,src)=>new Promise(ok=>{const i=new Image();i.onload=()=>{IMG[k]=i;ok()};i.onerror=()=>ok();i.src=src});
function greyOf(k){if(GREY[k])return GREY[k];const i=IMG[k];if(!i)return null;const c=document.createElement("canvas");c.width=i.naturalWidth;c.height=i.naturalHeight;
  const x=c.getContext("2d"),native="filter" in CanvasRenderingContext2D.prototype;if(native)x.filter="grayscale(1) brightness(1.08)";x.drawImage(i,0,0);if(!native){const d=x.getImageData(0,0,c.width,c.height),a=d.data;
    for(let j=0;j<a.length;j+=4){const v=a[j]*.3+a[j+1]*.59+a[j+2]*.11;a[j]=a[j+1]=a[j+2]=v}x.putImageData(d,0,0)}return GREY[k]=c}
const rnd=([a,b])=>a+Math.random()*(b-a);

let el,cv,ctx,S=null,raf=0,ready=null,wasHidden=false;
function build(){
  el=document.createElement("div");el.className="g-over pp";el.id="gPatrol";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label","Paint Patrol");
  el.innerHTML=`<canvas class="pp-cv"></canvas>
  <div class="pp-hud"><span class="pp-bomb" aria-hidden="true"><img src="assets/ui/palette.png" alt=""><i></i></span>
    <button class="pp-pause g-round" aria-label="${esc(tt("patrol.pause","Pause"))}"><b aria-hidden="true">II</b></button></div>
  <div class="pp-meter" hidden><i></i></div>
  <p class="pp-hint">${esc(tt("patrol.hint","Drag to run, tap to jump. Painting is automatic."))}</p>
  <div class="pp-card pp-turn" hidden><img src="assets/sprites/hero-desk.png" alt=""><p>${esc(tt("patrol.turn","Turn your phone sideways"))}</p><button class="g-btn" data-pp="anyway">${esc(tt("patrol.playAnyway","Play anyway"))}</button></div>
  <div class="pp-card pp-paused" hidden><h2>${esc(tt("patrol.paused","Paused"))}</h2><button class="g-btn" data-pp="resume">${esc(tt("patrol.resume","Keep playing"))}</button>
    <button class="g-hire" data-hire><img src="assets/ui/monster-head.png" alt=""><span>${esc(t("hire.chip"))}</span></button><button class="g-btn alt sm" data-pp="quit">${esc(tt("patrol.leave","Leave the game"))}</button></div>
  <div class="pp-card pp-end" hidden></div>`;
  G.appendChild(el);cv=el.querySelector(".pp-cv");ctx=cv.getContext("2d");
  el.addEventListener("click",e=>{const b=e.target.closest("[data-pp]");if(!b)return;sfx("tap");const a=b.dataset.pp;
    if(a==="anyway"){S.anyway=true;el.querySelector(".pp-turn").hidden=true;begin()}
    else if(a==="resume")pause(false);
    else if(a==="quit"||a==="other")close();
    else if(a==="again")open();
    else if(a==="see"){const k=+b.dataset.k;close();if(typeof show==="function")show(k)}});
  el.querySelector(".pp-pause").onclick=()=>{sfx("tap");pause(true)};
  addEventListener("resize",()=>{if(S)size()});
  addEventListener("keydown",key);addEventListener("keyup",key);
  cv.addEventListener("pointerdown",down);cv.addEventListener("pointermove",move);cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  document.addEventListener("visibilitychange",()=>{if(!S)return;if(document.hidden){if(S.run){wasHidden=true;S.run=false}}else if(wasHidden&&!S.paused&&!S.ended){wasHidden=false;S.last=performance.now();S.run=true}});
}
async function assets(){
  await Promise.all([load("hero","assets/sprites/hero-desk.png"),load("friend","assets/sprites/friend-monster.png"),load("pen","assets/ui/pen-hand.png"),load("pal","assets/ui/palette.png"),
    ...DOODLES.map(d=>load(d[0],d[1]))]);
  DOODLES.forEach(d=>greyOf(d[0]));greyOf("friend")}
function size(){SIZED={};const d=Math.min(devicePixelRatio||1,1.5);cv.width=innerWidth*d;cv.height=innerHeight*d;
  const portrait=innerHeight>innerWidth;
  // landscape: the world's 540 px fill the height; portrait ("Play anyway"): a zoomed-in strip in the middle
  S.scale=portrait?innerWidth/620:innerHeight/PP.worldH;S.viewW=innerWidth/S.scale;S.offY=portrait?(innerHeight-PP.worldH*S.scale)/2:0;S.dpr=d;
  el.querySelector(".pp-turn").hidden=!(portrait&&!S.anyway&&!S.started);
  // static street layers at screen resolution: sky, wall color, the wall's top edge, sidewalk and road
  const bg=document.createElement("canvas"),k=S.scale*d;bg.width=Math.ceil(S.viewW*k);bg.height=Math.ceil(PP.worldH*k);const b=bg.getContext("2d");b.scale(k,k);
  const sky=b.createLinearGradient(0,0,0,PP.worldH);sky.addColorStop(0,"#40236a");sky.addColorStop(1,"#7a4a8c");b.fillStyle=sky;b.fillRect(0,0,S.viewW,PP.worldH);
  b.fillStyle="#b4524e";b.fillRect(0,170,S.viewW,240);b.fillStyle="#2B1342";b.fillRect(0,406,S.viewW,6);b.fillStyle="#e9d6b2";b.fillRect(0,412,S.viewW,58);b.fillStyle="#7a5a8c";b.fillRect(0,470,S.viewW,70);S.bg=bg;
  // one 80 x 60 brick tile, repeated as a pattern
  const tile=document.createElement("canvas");tile.width=80;tile.height=60;const tc=tile.getContext("2d");tc.strokeStyle="rgba(43,19,66,.35)";tc.lineWidth=2;
  [[0,0],[40,30]].forEach(([o,y])=>{tc.beginPath();tc.moveTo(0,y+1);tc.lineTo(80,y+1);tc.moveTo(o+1,y);tc.lineTo(o+1,y+30);tc.stroke()});S.bricks=ctx.createPattern(tile,"repeat")}

function open(){if(!el)build();
  S={hero:{x:120,y:PP.ground,vy:0,face:1,inv:0,splash:0,knock:0},cam:0,en:[],blobs:[],drops:[],parts:[],wave:1.5,fire:0,bomb:PP.bombRecharge,power:null,powerT:0,
    friend:null,L:PP.stageScreens*PP.screenW,keys:{},stick:null,lastTap:0,run:false,paused:false,ended:false,started:false,anyway:false,last:performance.now(),t:0};
  el.classList.add("open");G.classList.add("playing");["pp-paused","pp-end"].forEach(c=>el.querySelector("."+c).hidden=true);el.querySelector(".pp-meter").hidden=true;
  size();(ready||(ready=assets())).then(()=>{if(!S)return;if(el.querySelector(".pp-turn").hidden)begin();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)})}
function begin(){S.started=true;S.run=true;S.last=performance.now();const h=el.querySelector(".pp-hint");h.classList.remove("show");void h.offsetWidth;h.classList.add("show")}
function close(){cancelAnimationFrame(raf);S=null;el.classList.remove("open");G.classList.remove("playing")}
function pause(on){if(!S||S.ended)return;S.paused=on;S.run=!on;S.last=performance.now();el.querySelector(".pp-paused").hidden=!on;if(on)el.querySelector('[data-pp="resume"]').focus({preventScroll:true})}

/* ---- input: left half drags a thumb stick, right half taps to jump, a double tap throws the paint bomb ---- */
function down(e){if(!S||!S.run)return;cv.setPointerCapture(e.pointerId);
  if(e.clientX<innerWidth/2)S.stick={id:e.pointerId,ox:e.clientX,dx:0};
  else{const now=performance.now();if(now-S.lastTap<300)bomb();else jump();S.lastTap=now}}
function move(e){if(S&&S.stick&&S.stick.id===e.pointerId)S.stick.dx=Math.max(-1,Math.min(1,(e.clientX-S.stick.ox)/50))}
function up(e){if(S&&S.stick&&S.stick.id===e.pointerId)S.stick=null}
function key(e){if(!S)return;const k=e.key.toLowerCase(),on=e.type==="keydown";
  if(["arrowleft","arrowright","a","d","arrowup","w"," ","x","z","escape"].includes(k)&&el.classList.contains("open"))e.preventDefault();else return;
  S.keys[k]=on;if(!on)return;if(k==="escape")return pause(!S.paused);if(!S.run)return;
  if(k==="arrowup"||k==="w"||k===" ")jump();if(k==="z")bomb()}
function jump(){const h=S.hero;if(h.y<PP.ground-1)return;h.vy=-Math.sqrt(2*PP.gravity*PP.heroH*PP.jumpHeights);sfx("tap")}
function bomb(){if(S.bomb<PP.bombRecharge)return;S.bomb=0;sfx("legend");buzz(20);
  S.en.forEach(n=>{if(!n.friend&&n.x<S.cam+S.viewW+40)hit(n,99)});if(S.friend&&S.friend.on)S.friend.meter=Math.min(PP.friendMeter,S.friend.meter+10);burst(S.hero.x+60,S.hero.y-80,24)}

/* ---- the world ---- */
function spawn(){const ahead=S.cam+S.viewW+40;if(ahead>S.L-PP.screenW)return;
  if(S.en.filter(n=>!n.friend).length>=PP.maxOnScreen)return;
  const d=DOODLES[Math.floor(Math.random()*DOODLES.length)];
  S.en.push({k:d[0],h:d[2],big:!!d[3],fly:!!d[4],x:ahead,y:d[4]?PP.ground-170:PP.ground,base:PP.ground-170,v:60+Math.random()*30,hits:0,need:d[3]?PP.hits.big:PP.hits.normal,friend:false,t:Math.random()*6})}
function hit(n,k){if(n.friend)return;n.hits=Math.min(n.need,n.hits+k);
  if(n.hits>=n.need){n.friend=true;n.cheer=2.5;sfx("coin");burst(n.x,n.y-n.h/2,12);
    if(Math.random()<PP.dropChance)S.drops.push({k:Math.random()<.5?"pen":"pal",x:n.x,y:PP.ground-24,t:8})}}
function burst(x,y,n){if(reduce)return;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=100+Math.random()*200;S.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,c:PAINT[i%5],life:.7})}}
function knock(from){const h=S.hero;if(h.inv>0)return;h.inv=PP.invulnerable;h.knock=from<h.x?1:-1;h.kt=.25;h.splash=1.2;sfx("hit");buzz([30,30])}

function step(dt){const h=S.hero;S.t+=dt;
  // move: the stick, the keys, and the knockback slide
  let dx=S.stick?S.stick.dx:0;if(S.keys.arrowleft||S.keys.a)dx=-1;if(S.keys.arrowright||S.keys.d)dx=1;
  if(Math.abs(dx)>.15)h.face=dx>0?1:-1;
  let vx=dx*PP.run;if(h.kt>0){h.kt-=dt;vx=h.knock*PP.knockback/.25}
  const lockL=S.friend&&S.friend.on?S.L-S.viewW:0;
  const maxX=S.friend&&S.friend.on?S.L-S.friend.w*.85:S.L-260;
  h.x=Math.max(Math.max(40,lockL+40),Math.min(maxX,h.x+vx*dt));
  h.vy+=PP.gravity*dt;h.y=Math.min(PP.ground,h.y+h.vy*dt);if(h.y>=PP.ground)h.vy=0;
  h.inv=Math.max(0,h.inv-dt);h.splash=Math.max(0,h.splash-dt);
  S.cam=Math.max(0,Math.min(S.L-S.viewW,S.friend&&S.friend.on?S.L-S.viewW:h.x-S.viewW*.35));
  // waves
  S.wave-=dt;if(S.wave<=0){S.wave=rnd(PP.waveEvery);spawn();if(Math.random()<.4)setTimeout(()=>S&&spawn(),600)}
  // paint fires on its own when something grey is ahead
  const rate=PP.paintRate*(S.power==="pen"?2:1),fwd=n=>(n.x-h.x)*h.face>0&&Math.abs(n.x-h.x)<S.viewW*.9;
  const target=S.en.some(n=>!n.friend&&fwd(n))||(S.friend&&S.friend.on&&!S.friend.calm&&h.face>0);
  S.fire-=dt;if(target&&S.fire<=0){S.fire=1/rate;const y=h.y-PP.heroH*.86;
    const spread=S.power==="pal"?[-120,0,120]:[0];spread.forEach((vy,i)=>S.blobs.push({x:h.x+h.face*30,y,vx:h.face*PP.paintSpeed,vy,c:PAINT[(S.t*7+i|0)%5],life:1.4}))}
  S.blobs.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    for(const n of S.en)if(!n.friend&&Math.abs(b.x-n.x)<n.h*.4&&b.y>n.y-n.h&&b.y<n.y){hit(n,1);b.life=0;break}
    const f=S.friend;if(b.life>0&&f&&f.on&&!f.calm&&b.x>S.cam+S.viewW-f.w*.75){f.meter++;b.life=0;if(f.meter>=PP.friendMeter)calm()}});
  S.blobs=S.blobs.filter(b=>b.life>0);
  // doodles walk toward Ekky; friends cheer, then wander off
  S.en.forEach(n=>{n.t+=dt;if(n.friend){n.cheer-=dt;if(n.cheer<0)n.x+=90*dt;return}
    n.x+=(n.x>h.x?-1:1)*n.v*dt;if(n.fly)n.y=n.base+Math.sin(n.t*2)*30;
    if(Math.abs(n.x-h.x)<n.h*.35+30&&h.y>n.y-n.h-10&&h.y-PP.heroH<n.y)knock(n.x)});
  S.en=S.en.filter(n=>n.x>S.cam-200&&n.x<S.cam+S.viewW+400);
  S.drops.forEach(d=>{d.t-=dt;if(Math.abs(d.x-h.x)<50&&h.y>PP.ground-60){d.t=0;S.power=d.k;S.powerT=PP.powerTime;sfx("coin")}});S.drops=S.drops.filter(d=>d.t>0);
  if(S.powerT>0&&(S.powerT-=dt)<=0)S.power=null;
  S.bomb=Math.min(PP.bombRecharge,S.bomb+dt);
  S.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.life-=dt});S.parts=S.parts.filter(p=>p.life>0);
  // the big grumpy friend leans in at the end of the street
  if(!S.friend&&h.x>S.L-S.viewW*.9){S.friend={on:true,meter:0,next:2,state:"idle",st:0,w:Math.min(S.viewW*.42,PP.worldH*.9*IMG.friend.width/IMG.friend.height),calm:false,waves:[]};
    S.en.forEach(n=>{if(!n.friend)hit(n,99)});el.querySelector(".pp-meter").hidden=false;sfx("level")}
  const f=S.friend;if(f&&f.on){f.st+=dt;
    if(!f.calm){f.next-=dt;if(f.state==="idle"&&f.next<=0){f.state="lift";f.st=0}
      if(f.state==="lift"&&f.st>=PP.telegraph){f.state="slam";f.st=0;sfx("hit");buzz(15);f.waves.push({x:S.cam+S.viewW-f.w*.55})}
      if(f.state==="slam"&&f.st>=.35){f.state="idle";f.next=rnd(PP.attackEvery)}}
    // the hammer's shock wave rolls along the ground: jump over it
    f.waves.forEach(w=>{w.x-=300*dt;if(Math.abs(w.x-h.x)<26&&h.y>PP.ground-28)knock(w.x+40)});f.waves=f.waves.filter(w=>w.x>S.cam-40);
    if(f.shown!==f.meter){f.shown=f.meter;el.querySelector(".pp-meter i").style.width=(f.meter/PP.friendMeter*100)+"%"}
    if(f.calm&&f.st>1.8&&!S.ended)end()}
  const bp=Math.round(S.bomb/PP.bombRecharge*20);if(bp!==S.bombShown){S.bombShown=bp;el.querySelector(".pp-bomb i").style.height=bp*5+"%";el.querySelector(".pp-bomb").classList.toggle("ready",bp===20)}}
function calm(){const f=S.friend;f.calm=true;f.st=0;f.waves=[];sfx("legend");burst(S.cam+S.viewW-f.w*.5,PP.ground-200,30)}
// Every character names its piece (G2): the stage's cast, one tap each to its artwork
const CAST=[["little-planet"],["virus-and-war"],["doodles"],["monster"]];
function cast(){const ps=CAST.map(([slug])=>PROJECTS.find(q=>q.slug===slug)).filter(p=>p&&creative(p));
  return `<p class="pp-cast">${esc(tt("patrol.end.cast","Everyone here comes from:"))} ${ps.map(p=>`<button class="g-link" data-pp="see" data-k="${PROJECTS.indexOf(p)}">${esc(ptitle(p))}</button>`).join(", ")}</p>`}
function end(){S.ended=true;S.run=false;const p=PROJECTS.find(q=>q.slug==="coexistence"),k=PROJECTS.indexOf(p);
  const c=el.querySelector(".pp-end");c.innerHTML=`<img class="pp-art" src="${esc(p?typeof thumbOf==="function"?thumbOf(p):"assets/work/coexistence.jpg":"")}" alt="">
    <h2>${esc(p?ptitle(p):"")}</h2><p>${esc(p?pdesc(p):"")}</p>
    ${cast()}
    <div class="pp-row"><button class="g-btn" data-pp="see" data-k="${k}">${esc(tt("patrol.end.see","See it in the portfolio"))}</button>
    <button class="g-hire" data-hire><img src="assets/ui/monster-head.png" alt=""><span>${esc(t("hire.chip"))}</span></button></div>
    <div class="pp-row"><button class="g-btn alt sm" data-pp="again">${esc(tt("patrol.end.again","Play again"))}</button><button class="g-btn alt sm" data-pp="other">${esc(tt("patrol.end.other","Something else"))}</button></div>`;
  c.hidden=false;c.classList.remove("in");void c.offsetWidth;c.classList.add("in");el.querySelector(".pp-meter").hidden=true}

/* ---- drawing: plain-shape street in Ekky's palette, every character one of his cut-outs ---- */
// each sprite is scaled once to its size on screen (cleared on resize), so a frame never downsizes a big image
let SIZED={};
function sized(k,h,grey){const key=k+"|"+h+"|"+(grey?1:0);if(SIZED[key])return SIZED[key];const src=grey?GREY[k]:IMG[k];if(!src)return null;
  const px=Math.max(1,Math.round(h*S.scale*S.dpr)),c=document.createElement("canvas");c.height=px;c.width=Math.max(1,Math.round(px*src.width/src.height));
  const x=c.getContext("2d");x.imageSmoothingQuality="high";x.drawImage(src,0,0,c.width,c.height);return SIZED[key]=c}
function sprite(k,x,y,h,colorK,flip,rot){const i=IMG[k];if(!i)return;h=Math.round(h);const w=h*i.width/i.height;ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot);if(flip)ctx.scale(-1,1);
  if(colorK<1){const g=sized(k,h,true);if(g)ctx.drawImage(g,-w/2,-h,w,h);if(colorK>0){ctx.globalAlpha=colorK;ctx.drawImage(sized(k,h),-w/2,-h,w,h)}}else ctx.drawImage(sized(k,h),-w/2,-h,w,h);ctx.restore()}
function draw(){const s=S.scale,W=S.viewW,cam=S.cam,now=performance.now()/1000;
  ctx.setTransform(S.dpr,0,0,S.dpr,0,0);ctx.fillStyle="#120a1f";ctx.fillRect(0,0,innerWidth,innerHeight);ctx.translate(0,S.offY);ctx.scale(s,s);
  // the street is pre-rendered once (size()); only the brick pattern and the road marks move
  ctx.drawImage(S.bg,0,0,W,PP.worldH);
  ctx.save();ctx.translate(-(cam*.5)%80,0);ctx.fillStyle=S.bricks;ctx.fillRect(0,170,W+80,236);ctx.restore();
  ctx.fillStyle="#fff3dc";for(let x=-(cam%120);x<W;x+=120)ctx.fillRect(x,500,60,6);
  ctx.translate(-cam,0);
  const bob=t=>reduce?0:Math.sin(t)*3;
  S.drops.forEach(d=>{const i=IMG[d.k];if(i)ctx.drawImage(i,d.x-22,d.y-22+bob(now*4),44,44)});
  S.en.forEach(n=>sprite(n.k,n.x,n.y+(n.friend?bob(now*8+n.t):bob(now*5+n.t)),n.h,n.friend?1:n.hits/n.need*.75,n.x>S.hero.x&&!n.friend?false:true));
  const f=S.friend;
  if(f&&f.on){const fx=cam+W-f.w*.5,lean=reduce?0:f.calm?0:f.state==="lift"?-.07*Math.min(1,f.st/PP.telegraph):f.state==="slam"?.05:0,fh=f.w*IMG.friend.height/IMG.friend.width;
    ctx.save();ctx.translate(fx+f.w*.5,PP.ground+10+(f.calm?30:0));ctx.rotate(lean);sprite("friend",-f.w*.5,0,fh,f.calm?1:f.meter/PP.friendMeter*.8);ctx.restore();
    ctx.fillStyle="#FFB400";f.waves.forEach(w=>{ctx.beginPath();ctx.ellipse(w.x,PP.ground-8,26,14,0,Math.PI,0);ctx.fill()})}
  const h=S.hero,blink=h.inv>0&&!reduce&&(now*12|0)%2;
  if(!blink){ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(h.x,PP.ground+4,34,7,0,0,7);ctx.fill();
    sprite("hero",h.x,h.y+bob(now*9)*(h.y>=PP.ground?.4:0),PP.heroH,1,h.face<0,reduce?0:Math.max(-.08,Math.min(.08,(S.stick?S.stick.dx:0)*.06)));
    if(h.splash>0){ctx.globalAlpha=Math.min(1,h.splash);ctx.fillStyle="#FF6B6B";[[-14,-40],[10,-58],[-2,-24]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(h.x+a,h.y+b,6,0,7);ctx.fill()});ctx.globalAlpha=1}}
  S.blobs.forEach(b=>{ctx.fillStyle=b.c;ctx.beginPath();ctx.arc(b.x,b.y,8,0,7);ctx.fill()});
  S.parts.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill()});ctx.globalAlpha=1}
function loop(now){if(!S)return;const t0=performance.now(),dt=Math.min(1/20,(now-S.last)/1000);S.last=now;
  // fixed 1/60 s steps, at most 5 per frame, so a slow phone slows down instead of skipping through walls
  if(S.run){S.acc=(S.acc||0)+dt;let n=0;while(S.acc>=1/60&&n<5){step(1/60);S.acc-=1/60;n++}if(n===5)S.acc=0}
  const d0=performance.now();draw();const d1=performance.now();S.ms=(S.ms||0)*.95+(d1-t0)*.05;S.msDraw=(S.msDraw||0)*.95+(d1-d0)*.05;raf=requestAnimationFrame(loop)}   // S.ms: work per frame, for the perf probe

window.Patrol={open,close,get state(){return S},PP};
})();
