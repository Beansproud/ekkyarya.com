const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');
// Usage: ADMIN_PIN=<pin> node scripts/admin-core.cjs   (skips when ADMIN_PIN is unset)
const SITE=px.resolve(__dirname,'..');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,q.url.split('?')[0]);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
(async()=>{const PIN=process.env.ADMIN_PIN;if(!PIN){console.log('skip: ADMIN_PIN unset');return}
await new Promise(r=>srv.listen(0,r));const url='http://localhost:'+srv.address().port+'/';
const b=await chromium.launch();const reqs=[];
// web door
let p=await b.newPage({viewport:{width:1200,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('request',q=>reqs.push(q.url()));
await p.goto(url);await p.waitForTimeout(500);
console.log('admin loaded before door:',reqs.some(u=>/admin\.js|admin-shell/.test(u)));
await p.keyboard.type('ekky');await p.waitForSelector('.adm-pad');
for(const d of '111111')await p.keyboard.press(d);await p.waitForTimeout(300);
console.log('wrong msg:',await p.textContent('.adm-card p'));
for(const d of PIN)await p.keyboard.press(d);await p.waitForSelector('#adminRoot:not([hidden])');
console.log('tabs:',await p.$$eval('.adm-tabs button',e=>e.map(x=>x.textContent)));
console.log('readonly bar:',await p.textContent('.adm-status'));
console.log('errs',errs);await p.close();
// lockout
p=await b.newPage({viewport:{width:1200,height:800}});await p.goto(url);await p.waitForTimeout(300);await p.keyboard.type('ekky');
await p.waitForSelector('.adm-pad');for(let i=0;i<5;i++){for(const d of '000000')await p.keyboard.press(d);await p.waitForTimeout(250)}
console.log('lock:',await p.textContent('.adm-card p'),await p.evaluate(()=>JSON.stringify(localStorage)));await p.close();
// phone door
const {defaultBrowserType,...IP}=devices['iPhone 13'];const c=await b.newContext(IP);p=await c.newPage();await p.goto(url+'?game');await p.waitForTimeout(800);
const logo=await p.$('#g-start .g-logo, #g-start .g-logo-text');for(let i=0;i<6;i++)await logo.click();
console.log('6 taps pad:',!!await p.$('.adm-pad'));await logo.click();await p.waitForSelector('.adm-pad');console.log('7 taps pad ok');
await b.close();srv.close()})();
