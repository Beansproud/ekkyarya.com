// Usage: node scripts/probe-ua.cjs <site dir>. S4: taps Download (start screen and lightbox) and Install on iPhone Safari, Android Chrome
// and in-app browsers (Instagram, WhatsApp), with navigator.share present, refused (no gesture) or missing. Each tap must end in
// the share sheet, a real download, the save dialog or the install help; prints dead [] when none is a dead button.
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');const SITE=process.argv[2];
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0,async()=>{
const u=`http://localhost:${srv.address().port}/`;const b=await chromium.launch();const dead=[],errors=[];
const UA={
 iphone:['Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1','share'],
 iphoneNoGesture:['Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1','reject'],
 android:['Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36','share'],
 androidNoShare:['Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36','none'],
 instagram:['Mozilla/5.0 (Linux; Android 14; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 Instagram 330.0.0.0','none'],
 whatsappIOS:['Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/2.24','none'],
};
for(const [k,[ua,mode]] of Object.entries(UA)){
 const c=await b.newContext({viewport:{width:390,height:664},isMobile:true,hasTouch:true,userAgent:ua,acceptDownloads:true});
 await c.addInitScript(m=>{window.__ev=[];if(m==='none'){try{delete Navigator.prototype.share;delete Navigator.prototype.canShare}catch{};Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'canShare',{value:undefined})}
   else{navigator.canShare=()=>true;navigator.share=async d=>{window.__ev.push('share:'+(d.files?d.files.map(f=>f.name).join():d.url));if(m==='reject')throw new DOMException('no gesture','NotAllowedError')}}},mode);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));let dl=[];p.on('download',d=>dl.push(d.suggestedFilename()));
 await p.goto(u);await p.waitForTimeout(2500);
 const out=async()=>{await p.waitForTimeout(1500);const r=await p.evaluate(()=>({ev:window.__ev.splice(0),save:!!document.querySelector('#saveDlg[open]'),inst:!!document.querySelector('#installDlg[open]'),toast:(document.getElementById('toast')||{}).textContent}));r.dl=dl.splice(0);
   await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));return JSON.stringify(r)};
 await p.tap('.g-feat-dl');const a=await out();
 await p.evaluate(()=>Game.go('mine'));await p.waitForTimeout(600);const ib=await p.$('#g-mine [data-install]:not([hidden])');let i='no install button';if(ib){await ib.tap();i=await out()}
 await p.evaluate(()=>{document.querySelector('.g-feat').click()});await p.waitForTimeout(800);const lbdl=await p.$('#lbDl:not([hidden])');let l='no lb dl';if(lbdl){await lbdl.tap();l=await out()}
 const ok=r=>{try{const o=JSON.parse(r);return o.ev.length||o.save||o.inst||o.dl.length}catch{return false}};
 [['startDl',a],['install',i],['lightboxDl',l]].forEach(([n,r])=>{if(!ok(r))dead.push(k+' '+n)});errors.push(...errs);console.log(k,'startDl',a,'install',i,'lightboxDl',l);await c.close()}
console.log('dead',JSON.stringify(dead));console.log('errors',JSON.stringify(errors));await b.close();srv.close()})
