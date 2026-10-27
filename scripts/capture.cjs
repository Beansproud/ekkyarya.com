// Usage: node scripts/capture.cjs <absolute site dir> <out dir>. Clicks through every game screen on an iPhone 13 viewport and every desktop section, saves screenshots, and prints console errors and the emoji count as JSON. Needs Playwright (preinstalled in Claude cloud sessions).
const {chromium,devices}=require('playwright');const [,,SITE,OUT]=process.argv;const url='file://'+SITE+'/index.html';
(async()=>{const b=await chromium.launch();const errs=[];
const p=await (await b.newContext({...devices['iPhone 13']})).newPage();p.on('pageerror',e=>errs.push('phone: '+e.message));p.on('console',m=>m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text())&&errs.push('phone: '+m.text()));
const t0=Date.now();await p.goto(url);await p.waitForTimeout(2800);const shot=async n=>{await p.waitForTimeout(900);await p.screenshot({path:`${OUT}/phone-${n}.png`})};const c=s=>p.click(s,{force:true});
await shot('01-start');await c('#gPlay');await shot('02-map');
for(const [l,n] of [[0,'03-level-about'],[1,'04-level-skills'],[3,'05-level-process'],[4,'06-level-quest']]){await c(`.g-node[data-l="${l}"]`);await p.waitForTimeout(700);await shot(n);await c('#gSheetX');await p.waitForTimeout(400)}
await c('[data-tab="collection"]');await shot('07-cards');await c('#gPackBtn');await shot('08-pack');await c('#gPackBox');await p.waitForTimeout(1300);for(const e of await p.$$('.g-pc'))await e.click({force:true});await shot('09-pack-pulled');await c('#gPackDone');
await c('[data-tab="profile"]');await shot('10-trophies');await c('[data-tab="map"]');await p.waitForTimeout(500);await c('#g-map [data-arcade]');await p.waitForTimeout(4200);await shot('11-arcade');
const d=await b.newPage({viewport:{width:1440,height:900}});d.on('pageerror',e=>errs.push('desktop: '+e.message));await d.goto(url);await d.waitForTimeout(2500);await d.screenshot({path:`${OUT}/desk-01-hero.png`});
for(const [id,n] of [['about','02-about'],['services','03-services'],['work','04-work'],['process','05-process'],['contact','06-contact']]){await d.evaluate(i=>document.getElementById(i).scrollIntoView(),id);await d.waitForTimeout(1300);await d.screenshot({path:`${OUT}/desk-${n}.png`})}
const html=require('fs').readFileSync(SITE+'/index.html','utf8');const emoji=(html.match(/[\u{1F300}-\u{1FAFF}☀-➿⭐]/gu)||[]).length;
console.log(JSON.stringify({errors:errs,emojiCount:emoji,indexHtmlKB:Math.round(html.length/1024)}));await b.close()})();
