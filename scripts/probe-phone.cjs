// Usage: node scripts/probe-phone.cjs <site dir> <out dir>. Integrator gate: start screen and map at 360x640 and 390x664 in EN and ID; prints scroll, broken images, clipped text and page/request errors, and saves screenshots.
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');
const SITE=process.argv[2],OUT=process.argv[3];
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}
const ext=px.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0,async()=>{
const url=`http://localhost:${srv.address().port}/`;const b=await chromium.launch();const errs=[];const res={};
for(const [w,h] of [[360,640],[390,664]])for(const L of ['en','id']){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,deviceScaleFactor:2});await c.addInitScript(l=>{try{localStorage.setItem('lang',l)}catch(e){}},L);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('requestfailed',q=>errs.push('fail '+q.url()));p.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});
 await p.goto(url);await p.waitForTimeout(3500);
 res[`${L}-${w}`]=await p.evaluate(()=>{const se=document.scrollingElement;const imgs=[...document.querySelectorAll('#g-start img')].filter(i=>i.offsetParent);
  const thumbs=[...document.querySelectorAll('#g-start .card img, #g-start [data-jump] img')].filter(i=>i.offsetParent&&i.getBoundingClientRect().width>60).map(i=>Math.round(Math.min(i.getBoundingClientRect().width,i.getBoundingClientRect().height)));
  const broken=imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src'));
  const trunc=[...document.querySelectorAll('#g-start *, .g-top *, header *')].filter(e=>e.offsetParent&&e.children.length===0&&e.textContent.trim()&&(e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1)).map(e=>e.textContent.trim().slice(0,30));
  const spill=[...document.querySelectorAll('#g-start button,#g-start a')].filter(e=>{if(!e.offsetParent)return false;const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.left<-1}).map(e=>(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,24));
  return {scroll:se.scrollHeight-innerHeight,thumbs,broken,trunc:[...new Set(trunc)].slice(0,8),spill}});
 await p.screenshot({path:`${OUT}/start-${L}-${w}x${h}.png`});
 await p.evaluate(()=>document.querySelector('.g-tabs button[data-tab="map"]').click());await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/map-${L}-${w}x${h}.png`});await c.close()}
console.log(JSON.stringify(res,null,1));console.log('errors',JSON.stringify(errs));await b.close();srv.close()})
