// Usage: RUNS=3 node scripts/jank-map.cjs [site dir]. Map squad's smoothness probe at 4x CPU throttle, iPhone 13: opening the Map tab,
// 10 s idle on the map (the living village), and a zoomed pan. Prints frames, frames over 32 ms and the worst frame; always exits 0.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');
const SITE=px.resolve(process.argv[2]||'.'),RATE=+process.env.THROTTLE||4,RUNS=+process.env.RUNS||1;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}
r.writeHead(200,{'content-type':MIME[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const {defaultBrowserType,...IPHONE}=devices['iPhone 13'];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const openMap=p=>p.tap('.g-tabs button[data-tab="map"]');
const CASES=[
 ['Map tab opens',async p=>{await sleep(500)},async p=>{await openMap(p)},2500],
 ['10 s idle on the map',async p=>{await openMap(p);await sleep(3000)},async()=>{},10000],
 ['pan, zoomed',async p=>{await openMap(p);await sleep(3000);const b=await p.locator('#gMapWrap').boundingBox();await p.touchscreen.tap(b.x+14,b.y+14);await sleep(120);await p.touchscreen.tap(b.x+14,b.y+14);await sleep(900)},
  async p=>{const b=await p.locator('#gMapWrap').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;await p.mouse.move(x,y);await p.mouse.down();
   for(let i=1;i<=30;i++){await p.mouse.move(x-i*4,y+i*2);await sleep(16)}await p.mouse.up()},800]];
const stats=f=>{let over=0,worst=0;for(let i=1;i<f.length;i++){const d=f[i]-f[i-1];if(d>32)over++;if(d>worst)worst=d}return {n:f.length-1,over,worst:Math.round(worst)}};
srv.listen(0,async()=>{const url=`http://localhost:${srv.address().port}/`,b=await chromium.launch(),rows=[];
 for(const [name,setup,run,settle] of CASES){let best=null,err='';
  for(let k=0;k<RUNS;k++){const c=await b.newContext({...IPHONE});await c.addInitScript(()=>{try{localStorage.setItem('lang','en')}catch(e){}});const p=await c.newPage();
   try{await p.goto(url+'?game=1');await p.waitForSelector('#g-start.active',{state:'visible',timeout:8000});await sleep(8000);
    const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});
    await p.evaluate(()=>{window.__f=[];window.__rec=true;const l=t=>{if(window.__rec)window.__f.push(t);requestAnimationFrame(l)};requestAnimationFrame(l)});
    await setup(p);await p.evaluate(()=>{window.__f=[]});await run(p);await sleep(settle);
    const s=stats(await p.evaluate(()=>{window.__rec=false;return window.__f}));if(!best||s.over>best.over||(s.over===best.over&&s.worst>best.worst))best=s}
   catch(e){err=String(e.message).split('\n')[0].slice(0,80)}await c.close()}
  rows.push({name,best,err})}
 await b.close();srv.close();console.log(`\nCPU ${RATE}x, ${RUNS} run(s) each (worst run)`);console.log('action'.padEnd(26)+'frames'.padStart(8)+'>32ms'.padStart(8)+'worst ms'.padStart(10));
 for(const r of rows)console.log(r.name.padEnd(26)+(r.best?String(r.best.n).padStart(8)+String(r.best.over).padStart(8)+String(r.best.worst).padStart(10):'  ERROR '+r.err));process.exit(0)});
