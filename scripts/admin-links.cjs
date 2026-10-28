// Usage: node scripts/admin-links.cjs. A data/site.json with new links and email must reach the desktop page (socials and #mailLink).
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');
const SITE=px.resolve(__dirname,'..');const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,q.url.split('?')[0]);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
(async()=>{await new Promise(r=>srv.listen(0,r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:800}});
await p.route('**/data/site.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({version:1,links:{instagram:'https://example.com/qa-ig'},contact:{email:'qa@example.com'}})}));
await p.goto('http://localhost:'+srv.address().port+'/');
await p.waitForFunction(()=>document.getElementById('mailLink').textContent==='qa@example.com',null,{timeout:5000});
const r=await p.evaluate(()=>({ig:document.querySelector('[data-link=instagram]').href,mail:document.getElementById('mailLink').href}));
const ok=r.ig==='https://example.com/qa-ig'&&r.mail==='mailto:qa@example.com';console.log(ok?'PASS desktop links and email follow data/site.json':'FAIL '+JSON.stringify(r));
await b.close();srv.close();process.exit(ok?0:1)})();
