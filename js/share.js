// Share card, share video and downloads (B11, B40). paintCard() draws the D9 "Gallery frame" (1080 x 1920: the top
// 220 px and the bottom 300 px stay free for the platform's own UI; one-line credit at 40 px) at any moment of a short
// timeline, so one layout gives both the PNG (the last frame) and the video. The video borrows HyperFrames' idea
// (a drawing with a seekable timeline, captured frame by frame) but needs no library: the browser's own
// canvas.captureStream() and MediaRecorder encode it on the visitor's device. Everything throws for art that fails creative() (js/features.js).
const Share=(()=>{
const W=1080,H=1920,FREE_TOP=220,FREE_BOTTOM=300,VIDEO_SECONDS=5.5;
const $=id=>document.getElementById(id);
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>1-Math.pow(1-clamp(v),3);
function check(data){
  if(data.art!=null&&!creative(PROJECTS.find(x=>x.slug===data.art)))throw new Error(`"${data.art}" is not shareable, so it can't be on a share card`);
  const ok=typeof Color!=="undefined"?Color.stickers().map(s=>s.n):[];
  (data.stickers||[]).forEach(n=>{if(!ok.includes(n))throw new Error(`sticker ${n} is not shareable`)})}
async function fonts(){try{await Promise.all([document.fonts.load("700 56px Fredoka"),document.fonts.load("600 40px Fredoka"),document.fonts.load("400 36px Poppins")])}catch{}}
function round(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
// Timeline in seconds (time = Infinity draws the finished card):
//   0 to 0.4   the frame fades in with Ekky's lines on paper
//   0.4 to 3.6 the picture plays: fills sweep in, then the stickers pop in (Color.compose)
//   3.6 to 4.3 the name, title, call to action and credit fade in; then the card holds
function paintCard(x,data,time=Infinity){const done=time===Infinity;
  const g=x.createRadialGradient(W/2,0,100,W/2,H*.4,H);g.addColorStop(0,"#40236a");g.addColorStop(.55,"#1f1135");g.addColorStop(1,"#120a1f");x.fillStyle=g;x.fillRect(0,0,W,H);
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;x.fillStyle="#fff";
  for(let i=0;i<90;i++){x.globalAlpha=.25+rnd()*.6;const s=1.5+rnd()*3.5;x.fillRect(rnd()*W,rnd()*H,s,s)}x.globalAlpha=1;
  const maxH=900;let pw=880,ph=pw*data.aspect;if(ph>maxH){ph=maxH;pw=ph/data.aspect}
  const frameIn=done?1:ease(time/.4),pad=26,fx=(W-pw)/2-pad,fw=pw+pad*2,fh=ph+pad*2,fy=FREE_TOP+30+(1-frameIn)*40;
  x.globalAlpha=frameIn;x.fillStyle="#b77e00";round(x,fx,fy+14,fw,fh,36);x.fill();x.fillStyle="#fff";round(x,fx,fy,fw,fh,36);x.fill();
  x.save();round(x,fx+pad,fy+pad,pw,ph,16);x.clip();data.draw(x,fx+pad,fy+pad,pw,done?1:clamp((time-.4)/3.2));x.restore();
  x.globalAlpha=done?1:ease((time-3.6)/.7);x.textAlign="center";x.textBaseline="alphabetic";let y=FREE_TOP+30+fh+110;
  if(data.name){x.fillStyle="#FFB400";x.font="700 64px Fredoka, sans-serif";x.fillText(t("card.colored",{name:data.name}),W/2,y);y+=66}
  x.fillStyle="#e6defa";x.font="400 38px Poppins, sans-serif";x.fillText(data.page==="scratch"?t("card.scene"):t("card.title",{title:data.title}),W/2,y);
  const cy=Math.min(y+120,H-FREE_BOTTOM-120);x.font="700 44px Fredoka, sans-serif";const label=t("card.cta"),lw=x.measureText(label).width+90;
  x.fillStyle="#FFB400";round(x,(W-lw)/2,cy-62,lw,88,44);x.fill();x.fillStyle="#2B1342";x.fillText(label,W/2,cy-4);
  x.fillStyle="#fff";x.font="600 40px Fredoka, sans-serif";x.fillText(t("credit.full"),W/2,H-FREE_BOTTOM-36);x.globalAlpha=1}
async function renderCard(kind,data){
  if(kind!=="coloring")throw new Error(`unknown card "${kind}"`);
  check(data);if(!data.draw)throw new Error("nothing to draw");await fonts();
  const c=document.createElement("canvas");c.width=W;c.height=H;paintCard(c.getContext("2d"),data);return c}

/* ---- video: the card's timeline, recorded at 720 x 1280 and 30 fps (MP4 where the browser can, else WebM) ---- */
const videoType=()=>{if(typeof MediaRecorder==="undefined"||!HTMLCanvasElement.prototype.captureStream)return "";
  return ["video/mp4;codecs=avc1.42E01E","video/mp4","video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(v=>MediaRecorder.isTypeSupported(v))||""};
const canVideo=()=>feature("shareVideo")&&!!videoType();
async function renderVideo(data){
  check(data);await fonts();const type=videoType();if(!type)throw new Error("no video recorder");
  const c=document.createElement("canvas");c.width=720;c.height=1280;c.className="s-rec";document.body.appendChild(c);const x=c.getContext("2d");
  const rec=new MediaRecorder(c.captureStream(30),{mimeType:type,videoBitsPerSecond:3e6}),chunks=[];
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};const stopped=new Promise(r=>rec.onstop=r);
  const frame=s=>{x.save();x.scale(720/W,1280/H);paintCard(x,data,s);x.restore()};frame(0);rec.start(250);
  const t0=performance.now();await new Promise(ok=>{const tick=()=>{const s=(performance.now()-t0)/1000;frame(Math.min(s,VIDEO_SECONDS));if(s<VIDEO_SECONDS)requestAnimationFrame(tick);else ok()};requestAnimationFrame(tick)});
  rec.stop();await stopped;c.remove();
  const mime=type.split(";")[0];return {blob:new Blob(chunks,{type:mime}),ext:mime==="video/mp4"?"mp4":"webm"}}

/* ---- files: ekkyarya-coloring-<slug>.png, ekkyarya-scene-<date>.png (B40) ---- */
const fileName=(data,ext)=>data.page==="scratch"?`ekkyarya-scene-${new Date().toISOString().slice(0,10)}.${ext}`:`ekkyarya-coloring-${data.art||data.page}.${ext}`;
function save(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
const pngOf=card=>new Promise(r=>{try{card.toBlob(r,"image/png")}catch{r(null)}});
async function download(data){const blob=await pngOf(await renderCard("coloring",data));if(blob){save(blob,fileName(data,"png"));say(t("dl.saved"),"i-check")}else say(t("share.copied"))}
// Phones: the system share sheet with the file and the link. Desktops: save the file and copy the link.
async function send(file,blob,url,savedMsg){const text=t("share.color",{url});
  try{
    if(file&&navigator.canShare&&navigator.canShare({files:[file]}))return await navigator.share({files:[file],text,title:"Ekky Arya"});
    if(navigator.share&&matchMedia("(pointer:coarse)").matches){await navigator.share({text,url});if(blob)save(blob,file.name);return}
  }catch(e){if(e&&e.name==="AbortError")return}
  if(blob)save(blob,file.name);let copied=false;try{await navigator.clipboard.writeText(url);copied=true}catch{}
  say(blob&&copied?savedMsg:copied?t("share.copied"):url)}

/* ---- preview: the card, an optional "Sign it" first name, Share, Download, and Share as video ---- */
document.getElementById("game").insertAdjacentHTML("beforeend",`<div class="c-over s-over" id="gShare" role="dialog" aria-modal="true" aria-label="${t("share.go")}">
  <section class="c-view active"><button class="g-x" id="sX" aria-label="Close"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button>
    <div class="s-preview"><canvas id="sCard"></canvas></div>
    <label class="s-sign">${t("share.sign")}<input id="sName" maxlength="16" autocomplete="given-name" placeholder="${t("share.sign.ph")}"></label>
    <div class="s-row"><button class="g-btn" id="sGo"><svg class="ico" aria-hidden="true"><use href="#i-share"/></svg> ${t("share.go")}</button>
      <button class="g-btn alt" id="sDl"><svg class="ico" aria-hidden="true"><use href="#i-download"/></svg> ${t("dl.button")}</button></div>
    <button class="g-btn pink s-video" id="sVideo" hidden><svg class="ico" aria-hidden="true"><use href="#i-play"/></svg> <span>${t("share.video")}</span></button>
    <div class="c-actions"><button class="g-hire" data-hire aria-label="${t("hire.chip.aria")}"><img src="assets/ui/monster-head.png" alt=""><span>${t("hire.chip")}</span></button></div>
  </section></div>`);
let cur=null,timer=0;
const withName=()=>({...cur,name:Links.cleanName($("sName").value)});
const remember=()=>{Game.st.name=Links.cleanName($("sName").value);Game.save()};
async function openPreview(data){cur=data;$("sName").value=Game.st.name||"";$("sVideo").hidden=!canVideo();$("gShare").classList.add("open");await draw();setTimeout(()=>$("sX").focus({preventScroll:true}),50)}
async function draw(){const card=await renderCard("coloring",withName()),p=$("sCard");p.width=card.width/3;p.height=card.height/3;p.getContext("2d").drawImage(card,0,0,p.width,p.height)}
$("sName").addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(draw,250)});
$("sX").onclick=()=>$("gShare").classList.remove("open");
$("sGo").onclick=async()=>{remember();const d=withName(),blob=await pngOf(await renderCard("coloring",d)),name=fileName(d,"png");
  await send(blob&&new File([blob],name,{type:"image/png"}),blob,cur.link(d.name),t("share.saved"))};
$("sDl").onclick=()=>{remember();download(withName())};
$("sVideo").onclick=async()=>{const b=$("sVideo");if(b.disabled)return;remember();b.disabled=true;const label=b.querySelector("span");label.textContent=t("share.video.making");
  try{const d=withName(),v=await renderVideo(d),name=fileName(d,v.ext);await send(new File([v.blob],name,{type:v.blob.type}),v.blob,cur.link(d.name),t("share.video.saved"))}
  catch{say(t("share.copied"))}finally{b.disabled=false;label.textContent=t("share.video")}};
return {renderCard,renderVideo,paintCard,openPreview,download,canVideo};
})();
