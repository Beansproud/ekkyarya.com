// Usage: node scripts/probe-dark.cjs <site dir> <out dir>. Screenshots start, Art, Mine and Map on an iPhone in DARK mode, plus the desktop page in dark mode. Run it on any visual change: the owner's phone is in dark mode.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');const SITE=process.argv[2],OUT=process.argv[3];
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.json':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0,async()=>{
const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13'],colorScheme:'dark'});await c.addInitScript(()=>{try{localStorage.setItem('lang','en')}catch(e){}});const p=await c.newPage();
await p.goto(`http://localhost:${srv.address().port}/`);await p.waitForTimeout(3000);await p.screenshot({path:OUT+'/dark-start.png'});
for(const t of ['art','mine','map']){await p.evaluate(x=>Game.go(x),t);await p.waitForTimeout(1200);await p.screenshot({path:`${OUT}/dark-${t}.png`})}
const d=await (await b.newContext({viewport:{width:1440,height:900},colorScheme:'dark'})).newPage();await d.goto(`http://localhost:${srv.address().port}/`);await d.waitForTimeout(2500);await d.screenshot({path:OUT+'/dark-desk.png'});
await b.close();srv.close()})
