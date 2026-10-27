// Paint Patrol stage 1 length check (MG3 gate: 60 to 120 s). Plays the real game in Playwright with paintPatrol
// switched on for the run only, as two scripted players: "rush" holds right and jumps every 1.2 s; "relaxed" walks
// right 3 s, stops 1 s, and jumps when a doodle is close. Prints the seconds from start to the end screen.
// Usage: node scripts/sim-patrol.cjs <site dir>
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');const SITE=px.resolve(process.argv[2]||'.');
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.json':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f+='/index.html';if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
(async()=>{await new Promise(o=>srv.listen(0,'127.0.0.1',o));const url=`http://127.0.0.1:${srv.address().port}/index.html`;const b=await chromium.launch();const out={},errs=[];
for(const style of ['rush','relaxed']){const ctx=await b.newContext({...devices['iPhone 13 landscape']});
  await ctx.route('**/js/features.js',async r=>{const res=await r.fetch();r.fulfill({response:res,body:(await res.text()).replace('paintPatrol: false','paintPatrol: true')})});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(url);await p.waitForTimeout(1500);
  await p.evaluate(()=>Game.openPatrol());await p.waitForFunction(()=>window.Patrol&&Patrol.state&&Patrol.state.run,null,{timeout:10000});
  const t0=Date.now();let knocks=0,lastInv=0;
  while(Date.now()-t0<200000){const s=await p.evaluate(()=>{const s=Patrol.state;if(!s)return null;const h=s.hero;
      return {ended:s.ended,x:h.x,inv:h.inv,near:s.en.some(n=>!n.friend&&n.x>h.x&&n.x-h.x<170)||(s.friend&&s.friend.waves.some(w=>w.x-h.x<160&&w.x>h.x))}});
    if(!s||s.ended)break;if(s.inv>lastInv+.5)knocks++;lastInv=s.inv;
    const el=(Date.now()-t0)/1000;
    if(style==='rush'){await p.keyboard.down('ArrowRight');if(el%1.2<.25)await p.keyboard.press('Space')}
    else{if(el%4<3)await p.keyboard.down('ArrowRight');else await p.keyboard.up('ArrowRight');if(s.near)await p.keyboard.press('Space')}
    await p.waitForTimeout(200)}
  out[style]={seconds:Math.round((Date.now()-t0)/1000),knocks};await ctx.close()}
console.log(JSON.stringify(out),'errors',JSON.stringify(errs));await b.close();srv.close()})();
