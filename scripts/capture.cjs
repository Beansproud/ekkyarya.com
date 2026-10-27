// Usage: node scripts/capture.cjs <absolute site dir> <out dir>. Clicks through every game screen on an iPhone 13 viewport and every desktop section, saves screenshots, and prints console errors and the emoji count as JSON. Needs Playwright (preinstalled in Claude cloud sessions).
// Round 1: start, map, level sheets, Hire sheet, Art, lightbox, coloring (when js/color.js is present), Mine, Star Catcher. A step whose button is missing (feature switched off) is skipped.
const {chromium,devices}=require('playwright');const [,,SITE,OUT]=process.argv;const url='file://'+SITE+'/index.html';
(async()=>{const b=await chromium.launch();const errs=[],skipped=[];
const p=await (await b.newContext({...devices['iPhone 13']})).newPage();p.on('pageerror',e=>errs.push('phone: '+e.message));p.on('console',m=>m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text())&&errs.push('phone: '+m.text()));
await p.goto(url);await p.waitForTimeout(2800);const shot=async n=>{await p.waitForTimeout(900);await p.screenshot({path:`${OUT}/phone-${n}.png`})};
const c=async s=>{const el=await p.$(s);if(!el){skipped.push(s);return false}await el.click({force:true});return true};
await shot('01-start');
await c('[data-tab="map"]');await shot('02-map');
for(const [l,n] of [[0,'03-level-about'],[3,'04-level-process'],[4,'05-hire']]){await c(`.g-node[data-l="${l}"]`);await p.waitForTimeout(700);await shot(n);await c('#gSheetX');await p.waitForTimeout(400)}
await c('[data-tab="art"]');await shot('06-art');
if(await c('.g-card[data-i="0"]')){await shot('07-lightbox');await c('#lbClose');await p.waitForTimeout(300)}
await c('[data-tab="map"]');await p.waitForTimeout(400);
if(await c('.g-node[data-l="1"]')){await shot('08-color-picker');
  if(await c('[data-page]:not([data-page="scratch"])')){await p.waitForTimeout(1200);
    for(const [x,y] of [[.35,.45],[.5,.55],[.62,.4]]){const box=await p.$('#cStage');if(box){const r=await box.boundingBox();await p.mouse.click(r.x+r.width*x,r.y+r.height*y);await p.waitForTimeout(150)}}
    await shot('09-coloring');if(await c('#cDone')){await shot('10-reveal');await c('#cClose')}}
  await c('#cPickX')}
await c('[data-tab="mine"]');await shot('11-mine');
await c('[data-tab="map"]');await p.waitForTimeout(500);if(await c('#g-map [data-arcade]')){await p.waitForTimeout(4200);await shot('12-arcade')}
const d=await b.newPage({viewport:{width:1440,height:900}});d.on('pageerror',e=>errs.push('desktop: '+e.message));await d.goto(url);await d.waitForTimeout(2500);await d.screenshot({path:`${OUT}/desk-01-hero.png`});
for(const [id,n] of [['about','02-about'],['services','03-services'],['work','04-work'],['process','05-process'],['contact','06-contact']]){await d.evaluate(i=>document.getElementById(i).scrollIntoView(),id);await d.waitForTimeout(1300);await d.screenshot({path:`${OUT}/desk-${n}.png`})}
await d.evaluate(()=>document.getElementById('work').scrollIntoView());await d.waitForTimeout(600);await d.click('.tile',{force:true});await d.waitForTimeout(1200);await d.screenshot({path:`${OUT}/desk-07-lightbox.png`});
const fs=require('fs'),path=require('path');const files=['index.html',...['css','js'].flatMap(f=>fs.readdirSync(path.join(SITE,f)).map(n=>f+'/'+n))];
const emoji=files.reduce((n,f)=>n+(fs.readFileSync(path.join(SITE,f),'utf8').match(/[\u{1F300}-\u{1FAFF}☀-➿⭐]/gu)||[]).length,0);
const html=fs.readFileSync(SITE+'/index.html','utf8');
console.log(JSON.stringify({errors:errs,emojiCount:emoji,indexHtmlKB:Math.round(html.length/1024),skipped}));await b.close()})();
