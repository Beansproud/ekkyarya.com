// Usage: npm run reel [-- --out <file.mp4>]. Renders a 12 s portfolio reel (1080 x 1920, 30 fps, H.264) for Ekky's
// stories and posts: logo and tagline, six of his own pieces, then "Hire Ekky" and the site.
// Method borrowed from HyperFrames (HTML/canvas with a seekable timeline, rendered frame by frame in headless Chrome,
// encoded with FFmpeg), without adding it as a dependency: the preinstalled Playwright Chromium draws each frame on a
// canvas and the system ffmpeg encodes them. Deterministic: the same data gives the same frames.
// Only creative() pieces (shareable originals, js/features.js) can be in the reel. Needs Playwright and ffmpeg.
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');const {execFileSync}=require('child_process');
const ROOT=path.join(__dirname,'..');const args=process.argv.slice(2);const OUT=path.resolve(args.includes('--out')?args[args.indexOf('--out')+1]:path.join(ROOT,'out','ekkyarya-reel.mp4'));
const FPS=30,SECONDS=12;
const server=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
// The reel page: loads the site's data, picks six pieces, and exposes frame(t) that draws time t (seconds).
const PAGE=`<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Poppins:wght@400&display=swap" rel="stylesheet">
<body style="margin:0;background:#120a1f"><canvas id="c" width="1080" height="1920"></canvas>
<script src="js/data.js"></script><script src="js/features.js"></script><script src="js/copy.js"></script><script>
const W=1080,H=1920,x=document.getElementById('c').getContext('2d');
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>1-Math.pow(1-clamp(v),3),inout=v=>{v=clamp(v);return v<.5?4*v*v*v:1-Math.pow(-2*v+2,3)/2};
// six of Ekky's own pieces with the featured role, in PROJECTS order (no random pick, so every render is the same)
const six=PROJECTS.filter(p=>creative(p)&&hasRole(p,'featured')).slice(0,6);
const load=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
let IM={};async function ready(){await document.fonts.load('700 80px Fredoka');await document.fonts.load('400 40px Poppins');
  IM.logo=await load('assets/logo.png');IM.face=await load('assets/ui/face.png');IM.pieces=await Promise.all(six.map(p=>load(p.full)));return six.map(p=>p.slug)}
function round(X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function bg(t){const g=x.createRadialGradient(W/2,0,100,W/2,H*.4,H);g.addColorStop(0,'#40236a');g.addColorStop(.55,'#1f1135');g.addColorStop(1,'#120a1f');x.fillStyle=g;x.fillRect(0,0,W,H);
  let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647;x.fillStyle='#fff';
  for(let i=0;i<120;i++){const px=r()*W,py=r()*H,sz=1.5+r()*3.5,tw=.35+.35*Math.sin(t*1.2+i);x.globalAlpha=tw;x.fillRect(px,py,sz,sz)}x.globalAlpha=1}
function text(str,y,font,color,a=1,dx=0){x.globalAlpha=a;x.fillStyle=color;x.font=font;x.textAlign='center';x.fillText(str,W/2+dx,y);x.globalAlpha=1}
// Timeline (time in seconds): 0 to 1.6 s intro, then 1.5 s per piece (6 pieces, 9 s), then the outro to 12 s.
function wrap(str,y,font,max){x.font=font;const out=[];let line='';for(const w of str.split(' ')){const tryL=line?line+' '+w:w;if(x.measureText(tryL).width>max&&line){out.push(line);line=w}else line=tryL}if(line)out.push(line);return out}
function frame(time){bg(time);
  if(time<1.9){const a=ease(time/.6)*(1-clamp((time-1.6)/.3)),lw=520,lh=IM.logo?lw*IM.logo.height/IM.logo.width:0;
    x.globalAlpha=a;if(IM.logo)x.drawImage(IM.logo,(W-lw)/2,700-lh/2-(1-ease(time/.6))*60,lw,lh);x.globalAlpha=1;
    wrap(t('start.tagline'),1010,'700 64px Fredoka',880).forEach((l,i)=>text(l,1010+i*80,'700 64px Fredoka','#fff',a*ease((time-.4)/.6)))}
  const s0=1.6,per=1.5;
  for(let k=0;k<six.length;k++){const a0=s0+k*per,local=time-a0;if(local<-.35||local>per+.35)continue;const im=IM.pieces[k];if(!im)continue;
    const enter=inout((local+.35)/.7),leave=inout((local-per+.35)/.7),shift=(1-enter)*W*.9-leave*W*.9,alpha=Math.min(enter,1-leave);
    const fw=900,fh=Math.min(1120,fw*im.height/im.width),fx=(W-fw)/2+shift,fy=330+(1120-fh)/2;
    x.globalAlpha=alpha;x.fillStyle='#b77e00';round(fx,fy+16,fw,fh,40);x.fill();x.fillStyle='#fff';round(fx,fy,fw,fh,40);x.fill();
    x.save();round(fx+22,fy+22,fw-44,fh-44,22);x.clip();const z=1+.06*clamp(local/per),iw=(fw-44)*z,ih=iw*im.height/im.width;
    x.drawImage(im,fx+22-(iw-(fw-44))/2,fy+22-(ih-(fh-44))/2,iw,ih);x.restore();x.globalAlpha=1;
    text(ptitle(six[k]),1620,'700 72px Fredoka','#FFB400',alpha,shift);wrap(pdesc(six[k]),0,'400 40px Poppins',880).slice(0,2).forEach((l,i)=>text(l,1695+i*54,'400 40px Poppins','#e6defa',alpha,shift))}
  const o=time-(s0+six.length*per);if(o>-.2){const a=ease(o/.6);
    if(IM.face){x.globalAlpha=a;const fs=300;x.drawImage(IM.face,(W-fs)/2,560+(1-a)*50,fs,fs);x.globalAlpha=1}
    text(t('hire.chip'),1020,'700 110px Fredoka','#fff',a);text(t('start.role'),1100,'400 44px Poppins','#e6defa',a);
    x.globalAlpha=a;x.font='700 54px Fredoka';const lab='ekkyarya.com',lw=x.measureText(lab).width+110;x.fillStyle='#FFB400';round((W-lw)/2,1200,lw,104,52);x.fill();x.globalAlpha=1;
    text(lab,1270,'700 54px Fredoka','#2B1342',a);text(t('credit.full'),1580,'600 40px Fredoka','#fff',a)}}
</script>`;
(async()=>{
  try{execFileSync('ffmpeg',['-version'],{stdio:'ignore'})}catch{console.error('ffmpeg is not installed');process.exit(1)}
  fs.writeFileSync(path.join(ROOT,'.reel.html'),PAGE);
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'reel-'));const b=await chromium.launch();
  try{const p=await b.newPage({viewport:{width:1080,height:1920}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(`http://127.0.0.1:${server.address().port}/.reel.html`);const pieces=await p.evaluate(()=>ready());if(errs.length)throw new Error(errs.join('; '));
    for(let i=0;i<FPS*SECONDS;i++){const data=await p.evaluate(t=>{frame(t);return document.getElementById('c').toDataURL('image/jpeg',.92)},i/FPS);
      fs.writeFileSync(path.join(tmp,String(i).padStart(4,'0')+'.jpg'),Buffer.from(data.split(',')[1],'base64'))}
    fs.mkdirSync(path.dirname(OUT),{recursive:true});
    execFileSync('ffmpeg',['-v','error','-y','-framerate',String(FPS),'-i',path.join(tmp,'%04d.jpg'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-movflags','+faststart',OUT]);
    console.log(`wrote ${path.relative(ROOT,OUT)} (${SECONDS} s, pieces: ${pieces.join(', ')})`)}
  finally{await b.close();server.close();fs.rmSync(tmp,{recursive:true,force:true});fs.rmSync(path.join(ROOT,'.reel.html'),{force:true})}})();
