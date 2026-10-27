// Usage: node scripts/capture.cjs <absolute site dir> <out dir>. Clicks through every game screen on an iPhone 13 viewport and every desktop section, saves screenshots, and prints console errors and the emoji count as JSON. Needs Playwright (preinstalled in Claude cloud sessions).
// Round 1: start, map, level sheets, Hire sheet, Art, lightbox, coloring (when js/color.js is present), Mine, Star Catcher. A step whose button is missing (feature switched off) is skipped.
// The site is served over a tiny built-in HTTP server (as on GitHub Pages or in the app), so canvas export works.
const {chromium,devices}=require('playwright');const [,,SITE,OUT]=process.argv;const http=require('http'),fsx=require('fs'),px=require('path');
const TYPES={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.ico':'image/x-icon','.svg':'image/svg+xml'};
const server=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fsx.existsSync(f)&&fsx.statSync(f).isDirectory())f=px.join(f,'index.html');if(!f.startsWith(SITE)||!fsx.existsSync(f)){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':TYPES[px.extname(f)]||'application/octet-stream'});fsx.createReadStream(f).pipe(r)});
(async()=>{await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const url=`http://127.0.0.1:${server.address().port}/index.html`;
const b=await chromium.launch();const errs=[],skipped=[];
const p=await (await b.newContext({...devices['iPhone 13']})).newPage();p.on('pageerror',e=>errs.push('phone: '+e.message));p.on('console',m=>m.type()==='error'&&errs.push('phone: '+m.text()));
await p.goto(url);await p.waitForTimeout(2800);const shot=async n=>{await p.waitForTimeout(900);await p.screenshot({path:`${OUT}/phone-${n}.png`})};
const c=async s=>{const el=await p.$(s);if(!el||!(await el.isVisible())){skipped.push(s);return false}await el.click({force:true});return true};
let link=null;await shot('01-start');
await c('#g-start [data-go="map"]');await shot('02-map');
for(const [l,n] of [['home','03-level-about'],['doodle','04-level-process'],['hire','05-hire']]){await c(`.v-place[data-place="${l}"]`);await p.waitForTimeout(700);await shot(n);await c('#gSheetX');await p.waitForTimeout(400)}
await c('[data-tab="art"]');await shot('06-art');
if(await c('.g-card[data-i="0"]')){await shot('07-lightbox');await c('#lbClose');await p.waitForTimeout(300)}
await c('[data-tab="map"]');await p.waitForTimeout(400);
if(await c('.v-place[data-place="studio"]')){await shot('08-color-picker');
  if(await c('[data-page]:not([data-page="scratch"])')){await p.waitForTimeout(1200);
    for(const [x,y] of [[.35,.45],[.5,.55],[.62,.4]]){const box=await p.$('#cStage');if(box){const r=await box.boundingBox();await p.mouse.click(r.x+r.width*x,r.y+r.height*y);await p.waitForTimeout(150)}}
    await shot('09-coloring');
    if(await c('#cStickBtn')){await p.waitForTimeout(300);await c('.c-tray-st[data-n="1"]');await c('.c-tray-st[data-n="10"]');await c('#cStickBtn');await shot('09b-stickers')}
    if(await c('#cDone')){await shot('10-reveal');
      if(await c('#cShare')){await p.fill('#sName','Rina');await p.waitForTimeout(600);await shot('10b-share');await c('#sX')}
      link=await p.evaluate(()=>Links.colorUrl(Color.state,'Rina'));await c('#cClose')}}
  await c('#cPickX')}
await c('[data-tab="mine"]');await shot('11-mine');
await p.evaluate(()=>Game.go('start'));await p.waitForTimeout(500);if(await c('#g-start [data-arcade]')){await p.waitForTimeout(4200);await shot('12-arcade')}
if(link){const p2=await (await b.newContext({...devices['iPhone 13']})).newPage();p2.on('pageerror',e=>errs.push('arrival: '+e.message));
  await p2.goto(link);await p2.waitForTimeout(3000);await p2.screenshot({path:`${OUT}/phone-13-arrival.png`});
  if(/[?&](color|f|s|from)=/.test(p2.url()))errs.push('arrival: address bar not cleaned: '+p2.url());
  await p2.goto(url+'?color=giraffe&f=v1.garbage!!');await p2.waitForTimeout(2000);await p2.screenshot({path:`${OUT}/phone-14-bad-link.png`});await p2.close()}
const d=await b.newPage({viewport:{width:1440,height:900}});d.on('pageerror',e=>errs.push('desktop: '+e.message));await d.goto(url);await d.waitForTimeout(2500);await d.screenshot({path:`${OUT}/desk-01-hero.png`});
for(const [id,n] of [['about','02-about'],['services','03-services'],['work','04-work'],['process','05-process'],['contact','06-contact']]){await d.evaluate(i=>document.getElementById(i).scrollIntoView(),id);await d.waitForTimeout(1300);await d.screenshot({path:`${OUT}/desk-${n}.png`})}
await d.evaluate(()=>document.getElementById('work').scrollIntoView());await d.waitForTimeout(600);await d.click('.tile',{force:true});await d.waitForTimeout(1200);await d.screenshot({path:`${OUT}/desk-07-lightbox.png`});
const fs=require('fs'),path=require('path');const files=['index.html',...['css','js'].flatMap(f=>fs.readdirSync(path.join(SITE,f)).map(n=>f+'/'+n))];
const emoji=files.reduce((n,f)=>n+(fs.readFileSync(path.join(SITE,f),'utf8').match(/[\u{1F300}-\u{1FAFF}☀-➿⭐]/gu)||[]).length,0);
const html=fs.readFileSync(SITE+'/index.html','utf8');
console.log(JSON.stringify({errors:errs,emojiCount:emoji,indexHtmlKB:Math.round(html.length/1024),skipped}));await b.close();server.close()})();
