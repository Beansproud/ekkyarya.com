// Usage: node scripts/admin-layout.cjs <out dir>. Admin shell at 360 and 390 px, EN and ID: top bar, tools and tabs each on one row, nothing clipped.
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');
const SITE=px.resolve(__dirname,'..');const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,q.url.split('?')[0]);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
(async()=>{await new Promise(r=>srv.listen(0,r));const b=await chromium.launch();
for(const w of [360,390])for(const lang of ['en','id'])for(const scheme of ['light']){const c=await b.newContext({viewport:{width:w,height:780},colorScheme:scheme,locale:lang==='id'?'id-ID':'en-US'});const p=await c.newPage();
await p.addInitScript(l=>localStorage.setItem('lang',l),lang);await p.goto('http://localhost:'+srv.address().port+'/?game');await p.waitForTimeout(500);
await p.addScriptTag({url:'/js/admin.js'});await p.addScriptTag({url:'/js/admin-shell.js'});await p.evaluate(()=>Admin.shell.show());await p.waitForSelector('#adminRoot[open]');await p.waitForTimeout(500);
const r=await p.evaluate(()=>{const top=document.querySelector('.adm-top'),tabs=document.querySelector('.adm-tabs');const ys=[...top.children].map(e=>Math.round(e.getBoundingClientRect().top));const tl=document.querySelector('.adm-tools');const tr=new Set([...tl.children].map(e=>Math.round(e.getBoundingClientRect().top))).size;const clip=[...tabs.children].filter(e=>e.scrollWidth>e.clientWidth+0.5).map(e=>e.textContent);return {toolRows:tr,toolsOver:tl.scrollWidth>tl.clientWidth,topRows:new Set([...top.children].map(e=>Math.round(e.getBoundingClientRect().top+e.getBoundingClientRect().height/2))).size,topOver:top.scrollWidth>top.clientWidth,clip,tabsOver:tabs.scrollWidth>tabs.clientWidth,h:[...document.querySelectorAll('.adm-top .adm-btn,.adm-tabs button')].map(e=>Math.round(e.getBoundingClientRect().height)).join()}});
console.log(w,lang,JSON.stringify(r));if(w===390&&lang==='id')await p.screenshot({path:process.argv[2]+'/lay.png',clip:{x:0,y:0,width:390,height:200}});await c.close()}

// Dark mode contrast (WCAG 4.5:1, 3:1 for large text) on the PIN pad and every tab, 390 px phone.
const CONTRAST=()=>{const lum=c=>{const [r,g,b]=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
 const parse=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(',').map(Number);return {c:p.slice(0,3),a:p.length>3?p[3]:1}};
 const bgOf=e=>{let rgb=null;for(let n=e;n;n=n.parentElement){const c=parse(getComputedStyle(n).backgroundColor);if(c&&c.a>.9){rgb=c.c;break}}return rgb||[255,255,255]};
 const bad=[];for(const e of document.querySelectorAll('dialog[open] *')){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const st=getComputedStyle(e);if(st.visibility==='hidden'||st.display==='none')continue;const r=e.getBoundingClientRect();if(r.width<1||r.height<1)continue;
  let fg=parse(st.color);if(!fg)continue;let op=1;for(let n=e;n;n=n.parentElement)op*=+getComputedStyle(n).opacity;const bg=bgOf(e);const f=fg.c.map((v,i)=>v*fg.a*op+bg[i]*(1-fg.a*op));
  const l1=lum(f),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);const px=parseFloat(st.fontSize),large=px>=24||(px>=18.66&&+st.fontWeight>=700);
  if(ratio<(large?3:4.5)&&!e.disabled&&!e.closest('[disabled]'))bad.push(((e.textContent||'').trim().slice(0,24))+' '+ratio.toFixed(2))}return bad};
let fails=0;
for(const lang of ['en','id']){const c=await b.newContext({viewport:{width:390,height:780},colorScheme:'dark'});const p=await c.newPage();
 await p.addInitScript(l=>localStorage.setItem('lang',l),lang);await p.goto('http://localhost:'+srv.address().port+'/?game');await p.waitForTimeout(500);
 await p.addScriptTag({url:'/js/admin.js'});await p.addScriptTag({url:'/js/admin-shell.js'});
 await p.evaluate(()=>{const s=document.createElement('script');});
 await p.evaluate(()=>window.Admin.open());await p.waitForSelector('.adm-pad[open]');await p.keyboard.press('1');await p.waitForTimeout(700);
 let bad=await p.evaluate(CONTRAST);if(process.argv[2])await p.screenshot({path:process.argv[2]+'/dark-pad-'+lang+'.png'});console.log('dark',lang,'pad',bad.length?'FAIL '+bad:'ok');fails+=bad.length;
 await p.evaluate(()=>{document.querySelector('.adm-pad').close();Admin.shell.show()});await p.waitForSelector('#adminRoot[open]');await p.waitForTimeout(500);
 for(const t of ['art','links','settings','text','messages']){await p.click('#adminRoot [data-tab='+t+']');await p.waitForTimeout(300);bad=await p.evaluate(CONTRAST);if(process.argv[2])await p.screenshot({path:process.argv[2]+'/dark-'+t+'-'+lang+'.png'});console.log('dark',lang,t,bad.length?'FAIL '+bad.join(' | '):'ok');fails+=bad.length}
 await c.close()}
await b.close();srv.close();process.exit(fails?1:0)})();
