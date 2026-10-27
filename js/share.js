// Share card and share service (B11). renderCard("coloring", data) draws the D9 "Gallery frame" at 1080 x 1920:
// the top 220 px and the bottom 300 px stay free for the platform's own UI, and the credit line
// "Illustrated by Ekky Arya · ekkyarya.com" sits on one line at 40 px. It throws for art that fails shareable().
// Phones share the image, text and link; desktops download the image and copy the link.
const Share=(()=>{
const W=1080,H=1920,FREE_TOP=220,FREE_BOTTOM=300;
const $=id=>document.getElementById(id);
function check(data){
  if(data.art!=null){const p=PROJECTS.find(x=>x.slug===data.art);if(!p||!shareable(p))throw new Error(`"${data.art}" is not shareable, so it can't be on a share card`)}
  const ok=typeof Color!=="undefined"?Color.stickers().map(s=>s.n):[];
  (data.stickers||[]).forEach(n=>{if(!ok.includes(n))throw new Error(`sticker ${n} is not shareable`)})}
async function renderCard(kind,data){
  if(kind!=="coloring")throw new Error(`unknown card "${kind}"`);
  check(data);
  if(!data.draw)throw new Error("nothing to draw");
  try{await Promise.all([document.fonts.load("700 56px Fredoka"),document.fonts.load("600 40px Fredoka"),document.fonts.load("400 36px Poppins")])}catch{}
  const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const g=x.createRadialGradient(W/2,0,100,W/2,H*.4,H);g.addColorStop(0,"#40236a");g.addColorStop(.55,"#1f1135");g.addColorStop(1,"#120a1f");x.fillStyle=g;x.fillRect(0,0,W,H);
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;x.fillStyle="#fff";
  for(let i=0;i<90;i++){x.globalAlpha=.25+rnd()*.6;const s=1.5+rnd()*3.5;x.fillRect(rnd()*W,rnd()*H,s,s)}x.globalAlpha=1;
  // the picture in a white frame
  const maxH=900;let pw=880,ph=pw*data.aspect;if(ph>maxH){ph=maxH;pw=ph/data.aspect}
  const pad=26,fx=(W-pw)/2-pad,fy=FREE_TOP+30,fw=pw+pad*2,fh=ph+pad*2;
  x.fillStyle="#b77e00";round(x,fx,fy+14,fw,fh,36);x.fill();x.fillStyle="#fff";round(x,fx,fy,fw,fh,36);x.fill();
  x.save();round(x,fx+pad,fy+pad,pw,ph,16);x.clip();data.draw(x,fx+pad,fy+pad,pw);x.restore();
  x.textAlign="center";x.textBaseline="alphabetic";let y=fy+fh+110;
  if(data.name){x.fillStyle="#FFB400";x.font="700 64px Fredoka, sans-serif";x.fillText(t("card.colored",{name:data.name}),W/2,y);y+=66}
  x.fillStyle="#e6defa";x.font="400 38px Poppins, sans-serif";x.fillText(data.page==="scratch"?"A Doodle Scene of Ekky's characters":`Ekky's ${data.title}`,W/2,y);
  // call to action and the credit, both above the free bottom 300 px
  const cy=Math.min(y+120,H-FREE_BOTTOM-120);x.font="700 44px Fredoka, sans-serif";const label=t("card.cta"),lw=x.measureText(label).width+90;
  x.fillStyle="#FFB400";round(x,(W-lw)/2,cy-62,lw,88,44);x.fill();x.fillStyle="#2B1342";x.fillText(label,W/2,cy-4);
  x.fillStyle="#fff";x.font="600 40px Fredoka, sans-serif";x.fillText(t("credit.full"),W/2,H-FREE_BOTTOM-36);
  return c}
function round(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}

/* ---- preview: the card, an optional "Sign it" first name, and one Share button ---- */
document.getElementById("game").insertAdjacentHTML("beforeend",`<div class="c-over s-over" id="gShare" role="dialog" aria-modal="true" aria-label="${t("share.go")}">
  <section class="c-view active"><button class="g-x" id="sX" aria-label="Close"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button>
    <div class="s-preview"><canvas id="sCard"></canvas></div>
    <label class="s-sign">${t("share.sign")}<input id="sName" maxlength="16" autocomplete="given-name" placeholder="${t("share.sign.ph")}"></label>
    <div class="c-actions"><button class="g-btn" id="sGo"><svg class="ico" aria-hidden="true"><use href="#i-share"/></svg> ${t("share.go")}</button>
      <button class="g-hire" data-hire aria-label="${t("hire.chip.aria")}"><img src="assets/ui/monster-head.png" alt=""><span>${t("hire.chip")}</span></button></div>
  </section></div>`);
let cur=null,timer=0;
async function openPreview(data){cur=data;$("sName").value=Game.st.name||"";$("gShare").classList.add("open");await draw();setTimeout(()=>$("sX").focus({preventScroll:true}),50)}
async function draw(){const name=Links.cleanName($("sName").value);const card=await renderCard("coloring",{...cur,name});const p=$("sCard");p.width=card.width/3;p.height=card.height/3;
  p.getContext("2d").drawImage(card,0,0,p.width,p.height);return card}
$("sName").addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(draw,250)});
$("sX").onclick=()=>$("gShare").classList.remove("open");
$("sGo").onclick=async()=>{const name=Links.cleanName($("sName").value);Game.st.name=name;Game.save();
  const card=await renderCard("coloring",{...cur,name}),url=cur.link(name),text=t("share.color",{url});
  let blob=null;try{blob=await new Promise(r=>card.toBlob(r,"image/png"))}catch{}
  const file=blob&&new File([blob],`ekky-${cur.page}.png`,{type:"image/png"});
  try{
    if(file&&navigator.canShare&&navigator.canShare({files:[file]}))return await navigator.share({files:[file],text,title:"Ekky Arya"});
    if(navigator.share&&matchMedia("(pointer:coarse)").matches){await navigator.share({text,url});if(blob)download(blob);return}
  }catch(e){if(e&&e.name==="AbortError")return}
  if(blob)download(blob);let copied=false;try{await navigator.clipboard.writeText(url);copied=true}catch{}
  say(blob&&copied?t("share.saved"):copied?t("share.copied"):url)};
function download(blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`ekky-${cur.page}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
return {renderCard,openPreview};
})();
