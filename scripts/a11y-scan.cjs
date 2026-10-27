// Usage: npm run a11y (or node scripts/a11y-scan.cjs [site dir]). B18: on an iPhone 13 viewport, opens each game screen and the
// classic phone site and lists visible text under 12 px and controls (buttons, links, inputs) under 44 x 44 px.
// Exits 1 when it finds any. Needs Playwright (preinstalled in Claude cloud sessions).
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const SITE=path.resolve(process.argv[2]||process.cwd());
const server=http.createServer((q,r)=>{const f=path.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(SITE)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const scan=()=>{const out=[],vis=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth};
  const hidden=el=>{for(let e=el;e;e=e.parentElement){const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return true;if(e.closest('[aria-hidden="true"]'))return true}return false};
  const name=el=>(el.id?'#'+el.id:'')+'.'+[...el.classList].join('.')+' "'+(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,30)+'"';
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while((n=walker.nextNode())){if(!n.textContent.trim())continue;const el=n.parentElement;if(!el||hidden(el)||!vis(el))continue;const fs=parseFloat(getComputedStyle(el).fontSize);if(fs<12)out.push(`text ${fs}px: ${name(el)}`)}
  document.querySelectorAll('button,a[href],input,select,textarea,[role="switch"]').forEach(el=>{if(hidden(el)||!vis(el))return;const r=el.getBoundingClientRect();
    if(r.width<43.5||r.height<43.5)out.push(`target ${Math.round(r.width)}x${Math.round(r.height)}: ${name(el)}`)});
  return [...new Set(out)]};
(async()=>{await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const url=`http://127.0.0.1:${server.address().port}/index.html`;
  const b=await chromium.launch(),p=await (await b.newContext({...devices['iPhone 13'],reducedMotion:'reduce'})).newPage();
  await p.goto(url);await p.waitForTimeout(1500);const found={};
  const step=async(label,fn)=>{if(fn)await fn();await p.waitForTimeout(500);const r=await p.evaluate(scan);if(r.length)found[label]=r};
  const click=s=>p.evaluate(s=>document.querySelector(s)&&document.querySelector(s).click(),s);
  await step('start');
  await step('map',()=>click('[data-tab="map"]'));
  await step('level 1',()=>click('.g-node[data-l="0"]'));await click('#gSheetX');
  await step('hire sheet',()=>click('.g-hud [data-hire]'));await click('#gSheetX');
  await step('art',()=>click('[data-tab="art"]'));
  await step('mine',()=>click('[data-tab="mine"]'));
  await step('color picker',()=>click('.g-node[data-l="1"]'));
  await step('color editor',()=>click('[data-page="giraffe"]'));
  await step('reveal',()=>click('#cDone'));
  await step('share preview',()=>click('#cShare'));await click('#sX');
  await p.evaluate(()=>{const m=document.getElementById('gColor');m&&m.classList.remove('open')});
  await step('lightbox',()=>p.evaluate(()=>show(0)));await p.evaluate(()=>document.getElementById('lightbox').close());
  await p.evaluate(()=>document.querySelector('[data-classic]').click());await p.evaluate(()=>scrollTo(0,0));
  await step('classic site');
  console.log(JSON.stringify(found,null,1));await b.close();server.close();process.exit(Object.keys(found).length?1:0)})();
