// Usage: node scripts/jank.cjs [site dir (default .)]
// Smoothness probe: iPhone 13 viewport, CDP CPU throttled 4x. Runs 10 representative taps and, for each, records
// requestAnimationFrame frame times; prints the frames, the count over 32 ms and the worst frame. Lower is better.
// Run before and after a smoothness fix to prove it. Always exits 0 (it measures, it does not gate).
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');
const SITE=px.resolve(process.argv[2]||'.');const SETTLE=process.env.SETTLE!==undefined?+process.env.SETTLE:12000;const RATE=+process.env.THROTTLE||4,RUNS=+process.env.RUNS||1;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}
r.writeHead(200,{'content-type':MIME[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const {defaultBrowserType,...IPHONE}=devices['iPhone 13'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const tap=(p,sel)=>p.tap(sel,{timeout:8000});
const stageBox=p=>p.$eval('#cStage',e=>{const b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height]});
const openColor=async p=>{await tap(p,'[data-go=color]');await p.waitForSelector('#cPages .c-page',{state:'visible'});
  const id=await p.evaluate(()=>document.querySelector('#cPages .c-page:not(.c-scratch)').dataset.page);await tap(p,`#cPages .c-page[data-page="${id}"]`);
  await p.waitForSelector('#cEdit #cCanvas',{state:'visible',timeout:8000});await sleep(1000)};

// each case: setup (not measured), run (measured), settle ms to keep recording after the run
const CASES=[
 ['art tile (lightbox)',async p=>{await tap(p,'.g-tabs button[data-tab="art"]');await p.waitForSelector('#gCards >*',{state:'visible'});await sleep(1200)},
   async p=>{await p.tap('#gCards >* >> nth=0')},1200],
 ['tabs art>map>mine',async p=>{await sleep(500)},
   async p=>{for(const t of ['art','map','mine']){await tap(p,`.g-tabs button[data-tab="${t}"]`);await sleep(600)}},600],
 ['Map face tab',async p=>{await tap(p,'.g-tabs button[data-tab="art"]');await sleep(1200)},
   async p=>{await tap(p,'.g-tabs button.center')},1500],
 ['Hire chip sheet',async p=>{await sleep(500)},
   async p=>{await p.evaluate(()=>[...document.querySelectorAll('[data-hire]')].find(x=>x.offsetParent&&x.getBoundingClientRect().height>0).click())},1200],
 ['color fill',async p=>{await openColor(p)},
   async p=>{const r=await stageBox(p);await p.touchscreen.tap(r[0]+r[2]*.5,r[1]+r[3]*.5);await sleep(200);await p.touchscreen.tap(r[0]+r[2]*.3,r[1]+r[3]*.3)},800],
 ['color swatch',async p=>{await openColor(p)},
   async p=>{for(const n of [3,5,7])await p.tap(`#cColors .c-sw:nth-of-type(${n})`).catch(()=>{})},600],
 ['sticker drag',async p=>{await openColor(p);await tap(p,'#cStickBtn');await tap(p,'#cTray [data-n]');await sleep(600)},
   async p=>{const [x,y]=await p.$eval('#cStickers .c-st:last-child',e=>{const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
     await p.mouse.move(x,y);await p.mouse.down();for(let i=1;i<=24;i++){await p.mouse.move(x+i*3,y-i*2);await sleep(16)}await p.mouse.up()},500],
 ['Done (reveal)',async p=>{await openColor(p);const r=await stageBox(p);await p.touchscreen.tap(r[0]+r[2]*.5,r[1]+r[3]*.5);await sleep(500)},
   async p=>{await tap(p,'#cDone')},2000],
 ['language toggle',async p=>{await tap(p,'.g-tabs button[data-tab="mine"]');await sleep(900)},
   async p=>{await tap(p,'#g-mine [data-lang="id"]')},1000],
 ['idle effect, 9-12 s',async p=>{await sleep(9000-1500)},
   async()=>{},3000,true]];

function stats(f){let over=0,worst=0;for(let i=1;i<f.length;i++){const d=f[i]-f[i-1];if(d>32)over++;if(d>worst)worst=d}return {n:f.length-1,over,worst:Math.round(worst)}}

srv.listen(0,async()=>{
  const url=`http://localhost:${srv.address().port}/`;const b=await chromium.launch();const rows=[];
  for(const [name,setup,run,settle,noSettle] of CASES){const c2={noSettle};let best=null,err='';
    for(let k=0;k<RUNS;k++){const c=await b.newContext({...IPHONE});await c.addInitScript(()=>{try{localStorage.setItem('lang','en')}catch(e){}});
      const p=await c.newPage();try{await p.goto(url+'?game=1');await p.waitForSelector('#g-start.active',{state:'visible',timeout:8000});await sleep(c2.noSettle?0:SETTLE);
        const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});
        await p.evaluate(()=>{window.__f=[];window.__rec=true;const loop=t=>{if(window.__rec)window.__f.push(t);requestAnimationFrame(loop)};requestAnimationFrame(loop)});
        await setup(p);await p.evaluate(()=>{window.__f=[]});
        await run(p);await sleep(settle);const f=await p.evaluate(()=>{window.__rec=false;return window.__f});
        const s=stats(f);if(!best||s.over>best.over||(s.over===best.over&&s.worst>best.worst))best=s}
      catch(e){err=String(e.message).split('\n')[0].slice(0,80)}
      await c.close()}
    rows.push({name,best,err})}
  await b.close();srv.close();
  console.log(`\nCPU ${RATE}x throttle, iPhone 13 viewport, ${RUNS} run(s) each (worst run shown)`);
  console.log('action'.padEnd(26)+'frames'.padStart(8)+'>32ms'.padStart(8)+'worst ms'.padStart(10));
  for(const r of rows)console.log(r.name.padEnd(26)+(r.best?String(r.best.n).padStart(8)+String(r.best.over).padStart(8)+String(r.best.worst).padStart(10):'  ERROR '+r.err));
  process.exit(0)});
