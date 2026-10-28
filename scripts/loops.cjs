// Usage: node scripts/loops.cjs <site dir>. Lists endless running animations on start, map, Art (phone) and the desktop page. Must print [] everywhere (Ekky: no motion that tries too hard).
// Exception (owner, 2026-10-28: "give a lot if animation, even when idle"): on the map, endless animations inside the village (#g-map)
// are allowed and only counted. They must stop when the map is left: the Art line checks that.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');const SITE=process.argv[2];
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0,async()=>{
const b=await chromium.launch();const u=`http://localhost:${srv.address().port}/`;
const loops=p=>p.evaluate(()=>document.getAnimations().filter(a=>a.effect&&a.effect.getTiming().iterations===Infinity&&a.playState==='running').map(a=>(a.animationName||a.constructor.name)+'@'+(a.effect.target&&a.effect.target.className||'').toString().slice(0,30)));
const p=await (await b.newContext({...devices['iPhone 13']})).newPage();await p.goto(u+'?game');await p.waitForTimeout(3000);
console.log('start',await loops(p));await p.evaluate(()=>Game.go('map'));await p.waitForTimeout(2000);
const village=await p.evaluate(()=>document.getAnimations().filter(a=>a.effect&&a.effect.getTiming().iterations===Infinity&&a.playState==='running'&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('#g-map')).length);
const outside=(await loops(p)).length-village;console.log(`map (village loops allowed: ${village})`,outside>0?await p.evaluate(()=>document.getAnimations().filter(a=>a.effect&&a.effect.getTiming().iterations===Infinity&&a.playState==='running'&&!(a.effect.target&&a.effect.target.closest&&a.effect.target.closest('#g-map'))).map(a=>(a.animationName||a.constructor.name)+'@'+(a.effect.target&&a.effect.target.className||'').toString().slice(0,30))):[]);
await p.evaluate(()=>Game.go('art'));await p.waitForTimeout(1500);console.log('art',await loops(p));
const d=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();await d.goto(u);await d.waitForTimeout(3000);console.log('desktop',await loops(d));
await b.close();srv.close()})
