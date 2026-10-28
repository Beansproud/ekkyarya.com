// Usage: ADMIN_PIN=<pin> node scripts/e2e-admin.cjs [site dir (default .)] [out dir for screenshots (default none)]
// Admin e2e (docs/admin.md): the site without data/site.json, both doors, the PIN pad, read-only mode, publishing against a mocked
// api.github.com, merged data. Desktop 1440 + iPhone 13, EN + ID. The PIN comes only from the env var ADMIN_PIN (never written anywhere);
// when it is unset the tests that need the right PIN print SKIP. Tests that need admin code that has not landed yet print SKIP too.
// Prints a PASS/FAIL table, "FAIL cfg | test: why" lines, and a final "N PASS, M FAIL, K SKIP"; exits 1 if any fail.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path'),crypto=require('crypto');
const SITE=px.resolve(process.argv[2]||'.'),OUT=process.argv[3];if(OUT)fs.mkdirSync(OUT,{recursive:true});
const PIN=process.env.ADMIN_PIN||'';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}
r.writeHead(200,{'content-type':MIME[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const {defaultBrowserType,...IPHONE}=devices['iPhone 13'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const have=f=>fs.existsSync(px.join(SITE,f));
const ADMIN=have('js/admin.js'),SITEDATA=have('js/site-data.js');
const HASH='7c804fa1e00adf130631ae11cf0d38b9d97ff9117663687fb625c850eaf332e2';   // public in docs/admin.md
const sha=s=>crypto.createHash('sha256').update('ekkyarya-admin:'+s).digest('hex');
const WRONG=['000000','111111','123456','654321'].find(x=>sha(x)!==HASH);
class Skip extends Error{}
const skip=why=>{throw new Skip(why)};
const TOKEN='ghp_QA_FAKE_TOKEN_0000';
const vis=(p,sel,t=4000)=>p.waitForSelector(sel,{state:'visible',timeout:t}).then(()=>true,()=>false);

// ---- page-side finders (the admin DOM is not fixed yet, so find things by what they are, not by id) ----
// the PIN pad: a visible container holding buttons for the digits 0-9
const padFn=()=>{const vs=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>.05};
  for(const c of document.querySelectorAll('body *')){const bs=[...c.querySelectorAll('button,[role=button],[data-key],[data-digit]')].filter(vs);
    const d=new Set(bs.map(b=>(b.textContent||'').trim()).filter(t=>/^\d$/.test(t)));if(d.size===10&&vs(c)&&bs.length<=16){document.querySelectorAll('[data-qa-pad]').forEach(x=>x.removeAttribute('data-qa-pad'));c.setAttribute('data-qa-pad','1');return true}}return false};
const padOpen=p=>p.evaluate(padFn);
// the admin shell: the open #adminRoot dialog with its tab buttons
const adminFn=()=>{const r=document.getElementById('adminRoot');return !!(r&&r.open&&r.querySelectorAll('[data-tab]').length>=4&&r.getBoundingClientRect().width>0)};
const adminOpen=p=>p.evaluate(adminFn);
const waitFor=async(fn,t=4000)=>{const e=Date.now()+t;while(Date.now()<e){if(await fn())return true;await sleep(100)}return false};
async function press(p,digits,touch){for(const d of digits){const b=p.locator('[data-qa-pad] :is(button,[role=button],[data-key],[data-digit])').filter({hasText:new RegExp('^\\s*'+d+'\\s*$')}).first();
  if(touch)await b.tap();else await b.click();await sleep(60)}}
const snapshot=p=>p.evaluate(()=>({n:PROJECTS.length,titles:PROJECTS.map(x=>x.title).join('|'),links:JSON.stringify(CONFIG.links),email:CONFIG.email,features:typeof FEATURES!=='undefined'?JSON.stringify(FEATURES):'',copy:typeof COPY!=='undefined'?JSON.stringify(COPY).length:0}));

// ---- mocked GitHub ----
function mockGithub(ctx,state={}){const log={reqs:[],puts:[],commits:[],blobs:{},trees:[],unknown:[]};let n=0;
  const site=JSON.stringify({version:1,projects:[],hidden:[]});const ok=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'},body:JSON.stringify(body)});
  ctx.route('https://api.github.com/**',async route=>{const rq=route.request(),u=new URL(rq.url()),m=rq.method(),path=u.pathname.replace('/repos/rfim/ekkyarya.com','');
    if(m==='OPTIONS')return ok(route,{});log.reqs.push({m,path,auth:rq.headers()['authorization']||''});let body={};try{body=rq.postDataJSON()||{}}catch(e){}
    if(m==='GET'&&path==='/user')return ok(route,{login:'qa'});
    if(m==='GET'&&u.pathname==='/repos/rfim/ekkyarya.com')return ok(route,{default_branch:'main',permissions:{push:true,admin:false,pull:true}});
    if(m==='GET'&&path==='/contents/data/site.json')return ok(route,{type:'file',path:'data/site.json',sha:'sha-site',encoding:'base64',content:Buffer.from(site).toString('base64')});
    if(m==='GET'&&path.startsWith('/contents/'))return ok(route,{message:'Not Found'},404);
    if(m==='PUT'&&path.startsWith('/contents/')){log.puts.push({path:decodeURIComponent(path.slice(10)),message:body.message,b64:body.content,sha:body.sha,branch:body.branch});return ok(route,{content:{sha:'c'+(++n)},commit:{sha:'k'+n}},201)}
    if(m==='GET'&&/\/git\/(ref|refs)\/heads\/main$/.test(path))return ok(route,{ref:'refs/heads/main',object:{sha:'k0'}});
    if(m==='GET'&&path.startsWith('/branches/'))return ok(route,{name:'main',commit:{sha:'k0',commit:{tree:{sha:'t0'}}}});
    if(m==='GET'&&/\/git\/commits\/k0$/.test(path))return ok(route,{sha:'k0',tree:{sha:'t0'}});
    if(m==='POST'&&path==='/git/blobs'){const s='b'+(++n);log.blobs[s]=body.content;return ok(route,{sha:s},201)}
    if(m==='POST'&&path==='/git/trees'){log.trees.push(body.tree||[]);return ok(route,{sha:'t'+(++n)},201)}
    if(m==='POST'&&path==='/git/commits'){log.commits.push({message:body.message});return ok(route,{sha:'k'+(++n)},201)}
    if(m==='PATCH'&&/\/git\/refs?\/heads\/main$/.test(path))return ok(route,{ref:'refs/heads/main'});
    log.unknown.push(m+' '+path);return ok(route,{message:'mock: not handled'},404)});
  return log}
// the committed files, whichever API shape the admin uses: one commit = one PUT /contents, or one POST /git/commits (+ trees/blobs)
function committed(log){const files=[];for(const x of log.puts)files.push({path:x.path,b64:x.b64});
  for(const t of log.trees)for(const e of t){files.push({path:e.path,b64:e.content!==undefined?(e.encoding==='base64'?e.content:Buffer.from(e.content).toString('base64')):log.blobs[e.sha]})}
  return {files,commitCount:log.puts.length+log.commits.length,messages:[...log.puts.map(x=>x.message),...log.commits.map(x=>x.message)]}}
function jpegSize(buf){if(buf[0]!==0xff||buf[1]!==0xd8)return null;let i=2;while(i<buf.length){if(buf[i]!==0xff){i++;continue}const mk=buf[i+1];if(mk>=0xc0&&mk<=0xcf&&![0xc4,0xc8,0xcc].includes(mk))return {h:buf.readUInt16BE(i+5),w:buf.readUInt16BE(i+7)};i+=2+buf.readUInt16BE(i+2)}return null}

// ---- one config = one device + language ----
async function runConfig(browser,url,dev,lang){
  const cfg=`${dev}-${lang}`,phone=dev==='phone';const rows=[];
  async function ctx(errs,withRoutes){const c=await browser.newContext(phone?{...IPHONE}:{viewport:{width:1440,height:900}});
    await c.addInitScript(l=>{try{if(!sessionStorage.getItem('qa-init')){localStorage.setItem('lang',l);sessionStorage.setItem('qa-init','1')}}catch(e){}},lang);
    const reqs=[];c.on('request',r=>reqs.push(r.url()));const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));return {c,p,reqs}}
  const jobs=[];const ONLY=process.env.ONLY&&new RegExp(process.env.ONLY,'i');const T=(name,fn)=>{if(!ONLY||ONLY.test(name))jobs.push({i:jobs.length,name,fn})};
  async function runJob(job,again){const {i,name,fn}=job;let st='PASS',msg='';const errs=[];const x=await ctx(errs);
    try{await fn(x.p,x.c,x.reqs);if(errs.length)throw new Error('page error: '+errs[errs.length-1].slice(0,90))}catch(e){
      if(e instanceof Skip){st='SKIP';msg=e.message}else{st='FAIL';msg=String(e.message||e).split('\n').slice(0,3).join(' ').slice(0,420);if(OUT)await x.p.screenshot({path:`${OUT}/FAIL-${cfg}-${name.replace(/\W+/g,'_')}.png`}).catch(()=>{})}}
    await x.c.close().catch(()=>{});if(st==='FAIL'&&!again&&!process.env.NORETRY)return runJob(job,true);rows[i]={cfg,name,st,msg,retried:!!again&&st==='PASS'}}
  const boot=async(p,qs='')=>{await p.goto(url+(phone?'?game=1':'')+(phone&&qs?'&'+qs:qs?'?'+qs:''));
    if(phone){if(!await vis(p,'#g-start.active',8000))throw new Error('game mode did not open')}else await p.waitForSelector('body');await sleep(500)};
  const route=(c,body,status=200,type='application/json')=>c.route('**/data/site.json*',r=>r.fulfill({status,contentType:type,body}));
  const needAdmin=()=>{if(!ADMIN)skip('admin not landed yet (no js/admin.js)')};
  const needPin=()=>{if(!PIN)skip('ADMIN_PIN not set')};
  const doorEKKY=async p=>{await p.keyboard.type('ekky',{delay:50})};
  async function door(p){if(phone){let box=null,prev='';for(let i=0;i<30;i++){box=await p.locator('.g-logo,.g-logo-text').first().boundingBox();const k=JSON.stringify(box);if(box&&k===prev)break;prev=k;await sleep(150)}if(!box)throw new Error('no start logo');
      for(let i=0;i<7;i++){await p.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);await sleep(120)}}else await doorEKKY(p)}
  async function openPad(p){await door(p);if(!await waitFor(()=>padOpen(p),3000))throw new Error('the door did not open the PIN pad')}
  const tapKeys=(p,d)=>press(p,d,phone);

  // 1. without data/site.json the site is exactly as today; normal visitors download no admin code
  const bad={missing:[404,''],empty:[200,''],'broken json':[200,'{"version":1,"projects":[{'],'not json (html)':[200,'<!doctype html><title>x</title>'],'wrong shape':[200,'[1,2,3]'],null:[200,'null']};
  let base=null;
  T('no site.json: baseline',async(p,c,reqs)=>{await boot(p);base=await snapshot(p);if(!(base.n>0))throw new Error('no projects at all');
    const a=reqs.filter(u=>/admin/i.test(u));if(a.length)throw new Error('visitor downloaded admin code: '+a[0].split('/').slice(-2).join('/'))});
  for(const [k,[st,body]] of Object.entries(bad))T('site.json '+k+': site unchanged',async(p,c,reqs)=>{await route(c,body,st);await boot(p);await sleep(500);
    const s=await snapshot(p);const b=await (async()=>{const e=[];const x=await ctx(e);try{await boot(x.p);return await snapshot(x.p)}finally{await x.c.close()}})();
    for(const f of Object.keys(b))if(s[f]!==b[f])throw new Error(`${f} differs from the no-file site`);
    const a=reqs.filter(u=>/admin/i.test(u));if(a.length)throw new Error('visitor downloaded admin code: '+a[0].split('/').pop());
    if(phone){await p.tap('.g-tabs button[data-tab="art"]');await sleep(600);if(!await vis(p,'#g-art.active',2000))throw new Error('Art tab did not open')}});
  T('visitor network list: no admin code',async(p,c,reqs)=>{await route(c,JSON.stringify({version:1,projects:[],hidden:[]}));await boot(p);
    if(phone){await p.tap('.g-tabs button[data-tab="art"]');await sleep(500)}await p.keyboard.type('ekk',{delay:30});await sleep(500);
    const a=reqs.filter(u=>/admin|github\.com/i.test(u));if(a.length)throw new Error('requested '+a[0].split('/').slice(-2).join('/'));
    if(await p.evaluate(()=>[...document.scripts].some(s=>/admin/i.test(s.src))))throw new Error('index.html carries an admin script tag')});

  // 2. the doors
  if(!phone){
    T('web door: "ekky" opens the PIN pad',async p=>{needAdmin();await boot(p);await doorEKKY(p);if(!await waitFor(()=>padOpen(p),3000))throw new Error('typing ekky did not open the pad')});
    T('web door: not while typing in a text field',async p=>{needAdmin();await boot(p);
      await p.evaluate(()=>{for(const [tag,id] of [['input','qa-in'],['textarea','qa-ta']]){const e=document.createElement(tag);e.id=id;e.style.cssText='position:fixed;top:0;left:0;z-index:99999';document.body.appendChild(e)}
        const d=document.createElement('div');d.id='qa-ce';d.contentEditable='true';d.textContent='x';d.style.cssText='position:fixed;top:40px;left:0;z-index:99999;width:50px;height:20px';document.body.appendChild(d)});
      for(const id of ['#qa-in','#qa-ta','#qa-ce']){await p.focus(id);await p.keyboard.type('ekky',{delay:50});await sleep(300);if(await padOpen(p))throw new Error('the pad opened while typing in '+id)}});
    T('web door: no hint on the page',async p=>{needAdmin();await boot(p);const h=await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(!r.width)continue;
        const t=(e.children.length?'':e.textContent)+' '+(e.getAttribute('title')||'')+' '+(e.getAttribute('aria-label')||'');if(/\badmin\b|\bekky\b.*\b(type|ketik)\b/i.test(t))o.push(t.trim().slice(0,40))}return o});
      if(h.length)throw new Error('visible hint: '+h[0])});
  }else{
    T('phone door: 7 taps on the logo within 3 s',async p=>{needAdmin();await boot(p);await openPad(p)});
    T('phone door: 6 taps do not open it',async p=>{needAdmin();await boot(p);const b=await p.locator('.g-logo,.g-logo-text').first().boundingBox();
      for(let i=0;i<6;i++){await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await sleep(100)}await sleep(3500);if(await padOpen(p))throw new Error('6 taps opened the pad')});
    T('phone door: a slow 7th tap does not open it',async p=>{needAdmin();await boot(p);const b=await p.locator('.g-logo,.g-logo-text').first().boundingBox();
      for(let i=0;i<6;i++){await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await sleep(100)}await sleep(3300);await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await sleep(400);
      if(await padOpen(p))throw new Error('a 7th tap after 3 s opened the pad')});
    T('phone door: typing ekky does nothing, no hint',async p=>{needAdmin();await boot(p);await p.keyboard.type('ekky',{delay:50});await sleep(300);if(await padOpen(p))throw new Error('the web door opened on a phone');
      const h=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().width&&!e.children.length&&/\badmin\b/i.test(e.textContent+(e.getAttribute('aria-label')||'')+(e.title||''))).map(e=>e.textContent.trim().slice(0,40)));if(h.length)throw new Error('visible hint: '+h[0])});
  }

  // 3. the PIN
  T('pin pad: 6 digits, big keys',async p=>{needAdmin();await boot(p);await openPad(p);
    const k=await p.evaluate(()=>[...document.querySelectorAll('[data-qa-pad] :is(button,[role=button],[data-key],[data-digit])')].filter(b=>/^\d$/.test(b.textContent.trim())).map(b=>{const r=b.getBoundingClientRect();return Math.min(r.width,r.height)}));
    if(k.length<10||Math.min(...k)<43.5)throw new Error('digit keys under 44 px: '+Math.round(Math.min(...k)))});
  T('pin: a wrong PIN shakes and stays shut',async p=>{needAdmin();await boot(p);await openPad(p);
    const watch=p.evaluate(()=>new Promise(res=>{const pad=document.querySelector('[data-qa-pad]');const seen=[];const t0=performance.now();
      const look=()=>{const els=[pad,...pad.querySelectorAll('*'),pad.parentElement,pad.parentElement&&pad.parentElement.parentElement].filter(Boolean);
        if(els.some(e=>e.getAnimations().length||/shake|wrong|err|bad|nope/i.test(e.className&&e.className.baseVal===undefined?e.className:'')))seen.push(1);
        if(performance.now()-t0<2500)requestAnimationFrame(look);else res(seen.length)};look()}));
    await sleep(50);await tapKeys(p,WRONG);const shook=await watch;await sleep(300);
    if(!shook)throw new Error('no shake (no animation or shake/wrong class) after a wrong PIN');if(await adminOpen(p))throw new Error('a wrong PIN opened admin')});
  T('pin: 5 wrong tries give a 30 s pause',async p=>{needAdmin();await boot(p);await openPad(p);await p.clock.install();
    for(let i=0;i<5;i++){await tapKeys(p,WRONG);await waitFor(()=>p.evaluate(n=>+localStorage.admTries===n||+localStorage.admLock>0,i+1),3000);await p.clock.runFor(1200)}
    // during the pause: neither a wrong nor the right PIN (when known) may open admin
    await p.keyboard.type(PIN&&PIN.length===6?PIN:WRONG,{delay:30});await p.clock.runFor(500);if(await adminOpen(p))throw new Error('admin opened during the 30 s pause');
    const msg=await p.evaluate(()=>(document.querySelector('[data-qa-pad]').parentElement.innerText||'').replace(/\s+/g,' '));
    const off=await p.evaluate(()=>[...document.querySelectorAll('[data-qa-pad] button')].every(b=>b.disabled||b.getAttribute('aria-disabled')==='true'));
    if(!off&&!/\b(30|2\d|\d)\s*(s|sec|detik|d)\b|tunggu|wait|try again|coba lagi/i.test(msg))throw new Error('no sign of a pause (keys not disabled, no wait message): '+msg.slice(-40));
    await p.clock.runFor(31000);await sleep(200);if(!await padOpen(p))throw new Error('the pad is gone after the pause');
    if(PIN){await p.keyboard.type(PIN,{delay:30});await p.clock.runFor(500);if(!await waitFor(()=>adminOpen(p),3000))throw new Error('the right PIN did not open admin after the 30 s pause')}});
  T('pin: the right PIN opens admin, code loads only now',async(p,c,reqs)=>{needAdmin();needPin();await boot(p);await openPad(p);
    // the door loads only the PIN pad (js/admin.js); the admin screen itself (shell and tabs) must load only after the right PIN
    const screen=/js\/admin-(shell|art|settings)/i,before=reqs.filter(u=>screen.test(u)).length;await tapKeys(p,PIN);
    if(!await waitFor(()=>adminOpen(p),5000))throw new Error('the right PIN did not open admin (no Art/Links/Settings/Text tabs)');
    if(!reqs.some(u=>screen.test(u)))throw new Error('the admin screen code was never requested after the PIN');
    if(before)throw new Error('the admin screen code was already requested before the PIN')});

  // 4. without a token admin is read-only
  // Without ADMIN_PIN the shell is opened through the page API (the PIN check itself is covered by the pad tests), so read-only and publish still run.
  const openAdmin=async p=>{await boot(p);if(PIN){await openPad(p);await tapKeys(p,PIN)}else{await p.evaluate(()=>SiteData.openAdmin());if(!await waitFor(()=>p.evaluate(()=>!!(window.Admin&&window.Admin.open)),4000))throw new Error('admin.js did not load');await p.evaluate(()=>{Admin.unlocked=true;const sc=document.createElement('script');sc.src='js/admin-shell.js';sc.onload=()=>Admin.shell&&Admin.shell.show();document.head.appendChild(sc)})}if(!await waitFor(()=>adminOpen(p),5000))throw new Error('admin did not open')};
  const publishBtn=p=>p.locator('#adminRoot [data-adm=publish]');
  T('no token: admin is read-only',async(p,c)=>{needAdmin();const gh=mockGithub(c);await openAdmin(p);
    const tok=await p.evaluate(()=>JSON.stringify(localStorage));if(/ghp_|github_pat_/.test(tok))throw new Error('a token is stored without anyone pasting one');
    const pb=publishBtn(p);if(await pb.count()){for(let i=0;i<await pb.count();i++){const b=pb.nth(i);if(await b.isVisible()&&await b.isEnabled()){await b.click({force:true,timeout:1500}).catch(()=>{});await sleep(600)}}}
    const writes=gh.reqs.filter(r=>r.m!=='GET'&&r.m!=='OPTIONS');if(writes.length)throw new Error('wrote to GitHub without a token: '+writes[0].m+' '+writes[0].path);
    if(gh.reqs.some(r=>/token/i.test(r.auth)&&!/FAKE/.test(r.auth)))throw new Error('a request carried an auth header without a token');
    if(!await p.evaluate(()=>/token/i.test(document.body.innerText)))throw new Error('admin says nothing about the GitHub token (no way to paste one)')});

  // 5. publish against a mocked api.github.com
  const pasteToken=async p=>{const inp=p.locator('#adminRoot .adm-bar input[type=password]');
    if(!await inp.count())throw new Error('no token field in admin');await inp.fill(TOKEN);await p.locator('#adminRoot [data-adm=save]').click();await sleep(700)};
  const bigJpeg=p=>p.evaluate(async()=>{const c=document.createElement('canvas');c.width=3200;c.height=2000;const x=c.getContext('2d');x.fillStyle='#e9c46a';x.fillRect(0,0,3200,2000);x.fillStyle='#264653';x.fillRect(400,300,1800,1200);
    const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));return [...new Uint8Array(await b.arrayBuffer())]});
  T('publish: one commit, right paths, base64, resized image (mocked GitHub)',async(p,c)=>{needAdmin();const gh=mockGithub(c);await openAdmin(p);await pasteToken(p);
    await p.locator('#adminRoot [data-tab=art]').click();await sleep(400);
    const add=p.locator('#adminRoot button').filter({hasText:/^(Add a piece|Tambah karya)$/});if(!await add.count())throw new Error('no "Add a piece" button in the Art tab');await add.click();await sleep(400);
    const fi=p.locator('#adminRoot input[type=file]').first();if(!await fi.count())throw new Error('no file input in the Art tab');
    await fi.setInputFiles({name:'qa-big.jpg',mimeType:'image/jpeg',buffer:Buffer.from(await bigJpeg(p))});await sleep(2500);
    const fields=p.locator('#adminRoot input:not([type=file]):not([type=checkbox]):not([type=radio]):not([type=password]):not([type=search]),textarea');let n=0;
    for(let i=0;i<await fields.count();i++){const f=fields.nth(i);if(await f.isVisible()&&await f.isEditable()&&!(await f.inputValue())){await f.fill('QA piece '+(++n));}}
    const sv=p.locator('#adminRoot button').filter({hasText:/^(Save piece|Simpan karya)$/});if(!await sv.count())throw new Error('no Save piece button');await sv.click();await sleep(600);
    const pb=publishBtn(p).first();if(!await pb.count())throw new Error('no Publish button');if(!await pb.isEnabled())throw new Error('Publish is disabled with a token and a new piece');await pb.click();
    if(!await waitFor(()=>committed(gh).files.length>0,6000))throw new Error('Publish sent nothing to the mocked GitHub API (unhandled: '+gh.unknown.slice(0,3).join(', ')+')');await sleep(800);
    const k=committed(gh);if(k.commitCount!==1)throw new Error(`${k.commitCount} commits for one change, expected 1`);
    if(!k.messages.every(m=>/^Admin: .+/.test(m||'')))throw new Error('commit message is not "Admin: <what changed>": '+k.messages[0]);
    if(gh.reqs.some(r=>r.auth&&!r.auth.includes(TOKEN)))throw new Error('a request used another credential than the pasted token');
    const by=Object.fromEntries(k.files.map(f=>[f.path,f.b64]));const paths=Object.keys(by);
    const full=paths.find(x=>/^assets\/work\/u\/[^/]+\.jpe?g$/.test(x)),thumb=paths.find(x=>/^assets\/work\/thumb\/u\/[^/]+\.jpe?g$/.test(x));
    if(!by['data/site.json'])throw new Error('data/site.json is not in the commit; paths: '+paths.join(', '));
    if(!full)throw new Error('no full image under assets/work/u/; paths: '+paths.join(', '));if(!thumb)throw new Error('no thumb under assets/work/thumb/u/; paths: '+paths.join(', '));
    if(paths.some(x=>!/^(data\/site\.json|assets\/work\/(thumb\/)?u\/[^/]+\.jpe?g)$/.test(x)))throw new Error('unexpected path: '+paths.find(x=>!/^(data\/site\.json|assets\/work\/(thumb\/)?u\/[^/]+\.jpe?g)$/.test(x)));
    for(const [f,max] of [[full,1600],[thumb,480]]){const b=Buffer.from(by[f],'base64');if(by[f]!==b.toString('base64')||/[^A-Za-z0-9+/=]/.test(by[f]))throw new Error(f+' is not clean base64');
      const d=jpegSize(b);if(!d)throw new Error(f+' is not a JPEG');if(Math.max(d.w,d.h)!==max)throw new Error(`${f} is ${d.w}x${d.h}, long side should be ${max} for a 3200 px source`);if(b.length>1.5e6)throw new Error(f+' is '+b.length+' bytes, too big')}
    let sj;try{sj=JSON.parse(Buffer.from(by['data/site.json'],'base64').toString())}catch(e){throw new Error('data/site.json in the commit is not JSON')}
    if(!(sj.projects||[]).length)throw new Error('data/site.json has no new project');const np=sj.projects[sj.projects.length-1];
    const uid=typeof np.id==='string'?np.id:np.uid;if(!/^u-/.test(uid||''))throw new Error('new project needs an identifier u-<slug> (id string or uid): '+JSON.stringify(np.id)+' '+np.uid);
    if(!np.id||typeof np.id!=='object'&&!np.tr)throw new Error('new project has no Indonesian title/description object');if(!String(np.full).includes(full)||!String(np.img).includes(thumb))throw new Error('project img/full do not point at the uploaded files');
    if(!await waitFor(()=>p.evaluate(()=>/about a minute|sekitar satu menit/i.test(document.body.innerText)),4000))throw new Error('no "Live in about a minute" note after publishing')});

  // 7. the image editor (docs/admin-editor.md): opened directly in the page through AdminEditor.open, so it needs no PIN
  const EDITOR=have('js/admin-editor.js');const needEditor=()=>{if(!EDITOR)skip('js/admin-editor.js not landed yet')};
  const edOpen=async(p,again)=>{needEditor();if(!again){await boot(p);await p.addScriptTag({url:'js/admin-editor.js'})}
    await p.evaluate(l=>{const c=document.createElement('canvas');c.width=1200;c.height=800;const x=c.getContext('2d');x.fillStyle='#e9c46a';x.fillRect(0,0,1200,800);x.fillStyle='#264653';x.fillRect(300,200,600,400);
      window.__qaEd=AdminEditor.open(c,{lang:l}).then(b=>(window.__qaBlob=b,b))},lang);
    if(!await waitFor(()=>p.evaluate(()=>{const d=AdminEditor.debug();return !!(d&&d.W===1200&&document.querySelector('#aeRoot[open] canvas'))}),5000))throw new Error('the editor did not open on the picture')};
  const edSample=(p,x,y)=>p.evaluate(([x,y])=>AdminEditor.sample(x,y),[x,y]);
  const edDrag=async(p,a,b,steps=10)=>{const s=await p.evaluate(([a,b])=>[AdminEditor.toScreen(a[0],a[1]),AdminEditor.toScreen(b[0],b[1])],[a,b]);
    await p.mouse.move(s[0].x,s[0].y);await p.mouse.down();for(let i=1;i<=steps;i++)await p.mouse.move(s[0].x+(s[1].x-s[0].x)*i/steps,s[0].y+(s[1].y-s[0].y)*i/steps);await p.mouse.up();await sleep(100)};
  const edClick=(p,sel)=>p.locator('#aeRoot '+sel).first().click();
  const same=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<=2);
  T('editor: opens, tools are 44 px, admin language',async p=>{await edOpen(p);
    const k=await p.evaluate(()=>[...document.querySelectorAll('#aeRoot .ae-tool,#aeRoot .ae-top .ae-btn')].filter(b=>b.getClientRects().length&&getComputedStyle(b).display!=='none').map(b=>{const r=b.getBoundingClientRect();return Math.min(r.width,r.height)}));
    if(k.length<12||Math.min(...k)<43.5)throw new Error('editor buttons under 44 px: '+Math.round(Math.min(...k)));
    const ap=await p.locator('#aeRoot [data-a=apply]').innerText();if(ap.trim()!==(lang==='id'?'Terapkan':'Apply'))throw new Error('Apply reads "'+ap+'" in '+lang);
    const bg=await p.evaluate(()=>getComputedStyle(document.getElementById('aeRoot')).backgroundColor);if(!/255, 248, 236/.test(bg))throw new Error('the editor is not on light paper: '+bg)});
  T('editor: crop 1:1 and brightness change the output',async p=>{await edOpen(p);const s0=await edSample(p,600,400);
    await edClick(p,'[data-tool=crop]');await edClick(p,'[data-a=aspect][data-v="1:1"]');await edClick(p,'[data-a=applyCrop]');await sleep(150);
    const d=await p.evaluate(()=>AdminEditor.debug());if(d.W!==800||d.H!==800)throw new Error(`crop 1:1 gave ${d.W}x${d.H}, expected 800x800`);
    if(!same(await edSample(p,400,400),s0))throw new Error('the crop did not keep the centre of the picture');
    await edClick(p,'[data-tool=adjust]');await sleep(150);
    await p.evaluate(()=>{const r=document.querySelector('#aeRoot [data-o="adj.br"]');r.value=60;r.dispatchEvent(new Event('input',{bubbles:true}))});
    await p.locator('#aeRoot .ae-panel [data-a=adjApply]').click();await sleep(150);
    const s1=await edSample(p,400,400);if(!(s1[0]+s1[1]+s1[2]>s0[0]+s0[1]+s0[2]+60))throw new Error('brightness +60 did not brighten: '+s0+' -> '+s1);
    const h=(await p.evaluate(()=>AdminEditor.debug())).history;if(h.length!==3)throw new Error('history should be Open, Crop, Adjustments: '+h.join(', '))});
  T('editor: brush and gradient change pixels, undo restores them',async p=>{await edOpen(p);const s0=await edSample(p,600,400),g0=await edSample(p,100,100);
    await edClick(p,'[data-tool=brush]');await edDrag(p,[400,400],[800,400]);
    const s1=await edSample(p,600,400);if(same(s1,s0))throw new Error('a brush stroke did not change the pixels under it');
    await edClick(p,'[data-tool=gradient]');await edDrag(p,[50,50],[1150,750],5);
    const g1=await edSample(p,100,100);if(same(g1,g0))throw new Error('a gradient did not change the pixels');
    const d=await p.evaluate(()=>AdminEditor.debug());if(!d.layers.some(l=>l.type==='paint'))throw new Error('the gradient did not get its own layer over the photo');
    for(let i=0;i<d.hi;i++){if(phone)await edClick(p,'[data-a=undo]');else await p.keyboard.press('Control+z');await sleep(60)}
    if(!same(await edSample(p,600,400),s0)||!same(await edSample(p,100,100),g0))throw new Error('undo did not restore the picture');
    if(phone)await edClick(p,'[data-a=redo]');else await p.keyboard.press('Control+Shift+z');await sleep(60);
    if(same(await edSample(p,600,400),s0))throw new Error('redo did not bring the brush stroke back')});
  T('editor: Apply returns a full-size JPEG Blob',async p=>{await edOpen(p);await edClick(p,'[data-tool=brush]');await edDrag(p,[200,200],[1000,600]);await edClick(p,'[data-a=apply]');
    if(!await waitFor(()=>p.evaluate(()=>!!window.__qaBlob),15000))throw new Error('Apply did not hand back a Blob: '+await p.evaluate(()=>JSON.stringify({open:AdminEditor.isOpen(),msg:(document.querySelector('#aeRoot .ae-msg')||{}).textContent,d:AdminEditor.debug()&&AdminEditor.debug().history})));
    const r=await p.evaluate(async()=>{const b=window.__qaBlob,bm=await createImageBitmap(b);return {type:b.type,w:bm.width,h:bm.height,open:AdminEditor.isOpen()||!!document.querySelector('#aeRoot')}});
    if(r.type!=='image/jpeg'||r.w!==1200||r.h!==800)throw new Error(`Blob is ${r.type} ${r.w}x${r.h}, expected image/jpeg 1200x800`);if(r.open)throw new Error('the editor stayed open after Apply')});
  T('editor: inputs are 44 px on touch',async p=>{if(!phone)skip('touch sizes are checked on the phone');await edOpen(p);const small=[];
    for(const tool of ['brush','gradient','shape','text','crop']){await edClick(p,`[data-tool=${tool}]`);await sleep(100);
      small.push(...await p.evaluate(t=>[...document.querySelectorAll('#aeRoot .ae-opts :is(input,select,button)')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return [t+' '+(e.type||e.tagName)+' '+Math.round(r.width)+'x'+Math.round(r.height),Math.min(r.width,r.height)]}).filter(x=>x[1]<43.5).map(x=>x[0]),tool))}
    if(small.length)throw new Error('under 44 px: '+small.slice(0,4).join(', '))});
  T('editor: Esc and Back close it like Cancel, the page stays',async p=>{await edOpen(p);const url0=p.url();
    await p.keyboard.press('Escape');if(!await waitFor(()=>p.evaluate(()=>!document.querySelector('#aeRoot')),3000))throw new Error('Esc did not close an unchanged editor');
    if(await p.evaluate(()=>window.__qaEd.then(b=>b!==null)))throw new Error('Esc returned a picture instead of nothing');
    await edOpen(p,true);await edClick(p,'[data-tool=brush]');await edDrag(p,[400,400],[800,400]);
    p.once('dialog',d=>d.dismiss());await p.evaluate(()=>history.back());await sleep(500);
    if(!await p.evaluate(()=>!!document.querySelector('#aeRoot[open]')&&AdminEditor.debug().hi>0))throw new Error('Back with edits and "stay" did not keep the editor and its edits');
    p.once('dialog',d=>d.dismiss());await p.keyboard.press('Escape');await sleep(300);
    if(!await p.evaluate(()=>!!document.querySelector('#aeRoot[open]')))throw new Error('Esc with edits and "stay" closed the editor');
    p.once('dialog',d=>d.accept());await p.evaluate(()=>history.back());
    if(!await waitFor(()=>p.evaluate(()=>!document.querySelector('#aeRoot')),3000))throw new Error('Back did not close the editor');
    if(await p.evaluate(()=>window.__qaEd.then(b=>b!==null)))throw new Error('Back returned a picture instead of nothing');
    if(p.url()!==url0)throw new Error('Back left the page: '+p.url());if(phone&&!await vis(p,'#g-start.active',1500))throw new Error('Back moved the game off its screen');
    await edOpen(p,true);await edClick(p,'[data-a=apply]');if(!await waitFor(()=>p.evaluate(()=>!document.querySelector('#aeRoot')),15000))throw new Error('Apply did not close the editor');await sleep(400);
    if(await p.evaluate(()=>!!(history.state&&history.state.ae)))throw new Error('the editor left its history entry behind after Apply');
    if(p.url()!==url0||(phone&&!await vis(p,'#g-start.active',1500)))throw new Error('closing with Apply moved the page')});
  T('editor: Edit in the Art tab sends the edited picture to the form',async(p,c)=>{needAdmin();needEditor();mockGithub(c);await openAdmin(p);
    await p.locator('#adminRoot [data-tab=art]').click();await sleep(400);await p.locator('#adminRoot button').filter({hasText:/^(Add a piece|Tambah karya)$/}).click();await sleep(300);
    await p.locator('#adminRoot input[type=file]').first().setInputFiles({name:'qa-edit.jpg',mimeType:'image/jpeg',buffer:Buffer.from(await bigJpeg(p))});
    if(!await waitFor(()=>p.locator('#aaEdit').count().then(n=>n>0),5000))throw new Error('no Edit button next to the chosen picture');
    const before=await p.locator('#adminRoot .aa-pick img').getAttribute('src');await p.locator('#aaEdit').click();
    if(!await waitFor(()=>p.evaluate(()=>{const d=window.AdminEditor&&AdminEditor.debug();return !!(d&&d.W===3200)}),6000))throw new Error('Edit did not open the editor on the 3200 px picture');
    await edClick(p,'[data-tool=brush]');await p.evaluate(()=>{document.querySelector('#aeRoot [data-o="brush.size"]').value=300;document.querySelector('#aeRoot [data-o="brush.size"]').dispatchEvent(new Event('input',{bubbles:true}))});
    await edDrag(p,[200,1800],[3000,1800]);await edClick(p,'[data-a=apply]');
    if(!await waitFor(()=>p.evaluate(()=>!document.querySelector('#aeRoot')),15000))throw new Error('the editor did not close after Apply');
    if(!await waitFor(async()=>{const s=await p.locator('#adminRoot .aa-pick img').getAttribute('src').catch(()=>null);return !!s&&s!==before},15000))throw new Error('the form preview did not change to the edited picture');
    // reversible: "Back to original" restores the picked picture; Cancel leaves the form as it was
    const orig=p.locator('#aaOrig');if(!await orig.count())throw new Error('no "Back to original" button after an edit');await orig.click();
    if(!await waitFor(()=>p.locator('#adminRoot .aa-pick img').getAttribute('src').then(s=>s===before,()=>false),6000))throw new Error('"Back to original" did not restore the picked picture');
    if(await p.locator('#aaOrig').count())throw new Error('"Back to original" still shows on the original');
    await p.locator('#aaEdit').click();if(!await waitFor(()=>p.evaluate(()=>!!(window.AdminEditor&&AdminEditor.debug())),6000))throw new Error('Edit did not open the editor again');
    await edClick(p,'[data-tool=brush]');await edDrag(p,[200,600],[3000,600]);p.once('dialog',d=>d.accept());await edClick(p,'[data-a=cancel]');
    if(!await waitFor(()=>p.evaluate(()=>!document.querySelector('#aeRoot')),4000))throw new Error('Cancel did not close the editor');await sleep(300);
    if(await p.locator('#adminRoot .aa-pick img').getAttribute('src')!==before)throw new Error('Cancel changed the form picture');
    await p.locator('#aaEdit').click();if(!await waitFor(()=>p.evaluate(()=>!!(window.AdminEditor&&AdminEditor.debug())),6000))throw new Error('Edit did not open the editor a third time');
    await p.evaluate(()=>history.back());if(!await waitFor(()=>p.evaluate(()=>!document.querySelector('#aeRoot')),4000))throw new Error('Back did not close the editor');await sleep(300);
    if(!await adminOpen(p))throw new Error('Back from the editor closed admin');if(await p.locator('#adminRoot .aa-pick img').getAttribute('src')!==before)throw new Error('Back changed the form picture')});

  // 6. merged data (needs js/site-data.js)
  const site={version:1,links:{instagram:'https://example.com/qa-ig'},contact:{email:'qa@example.com'},
    projects:[{id:'u-qa-new',cat:'illustration',title:'QA New Piece',desc:'Added in site.json.',img:'assets/work/thumb/u/qa-new.jpg',full:'assets/work/u/qa-new.jpg',kind:'original',roles:['portfolio','card','featured']},
      {id:'u-qa-fan',cat:'illustration',title:'QA Fan Piece',desc:'Fan art tries every role.',img:'assets/work/thumb/u/qa-fan.jpg',full:'assets/work/u/qa-fan.jpg',kind:'fan',roles:['portfolio','card','coloring','sticker','sprite','scene','level','featured','share','avatar','village','game']}],
    hidden:['Hidden Monster']};
  const merged=async(p,c)=>{if(!SITEDATA)skip('js/site-data.js not landed yet');await route(c,JSON.stringify(site));await boot(p);if(!await waitFor(()=>p.evaluate(()=>PROJECTS.some(x=>x.title==='QA New Piece')),5000))throw new Error('a project added in data/site.json is not in PROJECTS')};
  T('merged: an added project shows on the site',async p=>{const c=p.context();await merged(p,c);
    if(!phone){if(!await waitFor(()=>p.evaluate(()=>document.body.innerText.includes('QA New Piece')||[...document.querySelectorAll('img')].some(i=>/QA New/.test(i.alt))),4000))throw new Error('QA New Piece is in PROJECTS but not on the page')}
    else{await p.tap('.g-tabs button[data-tab="art"]');await sleep(900);if(!await p.evaluate(()=>document.querySelector('#g-art').innerText.includes('QA New Piece')||[...document.querySelectorAll('#g-art img')].some(i=>/QA New/.test(i.alt))))throw new Error('QA New Piece is not in the Art tab')}});
  T('merged: a hidden project disappears',async p=>{const c=p.context();await merged(p,c);
    if(await p.evaluate(()=>PROJECTS.some(x=>x.title==='Hidden Monster')))throw new Error('Hidden Monster still in PROJECTS');
    if(await p.evaluate(()=>[...document.querySelectorAll('body *')].some(e=>!e.children.length&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&(/Hidden Monster/.test(e.textContent)||/Hidden Monster/.test(e.alt||'')))))throw new Error('Hidden Monster still visible on the page')});
  T('merged: links override the built-in ones',async p=>{const c=p.context();await merged(p,c);
    const r=await p.evaluate(()=>({ig:CONFIG.links.instagram,be:CONFIG.links.behance,dom:[...document.querySelectorAll('a[href]')].some(a=>a.href==='https://example.com/qa-ig')}));
    if(r.ig!=='https://example.com/qa-ig')throw new Error('CONFIG.links.instagram not overridden: '+r.ig);if(!/behance/.test(r.be||''))throw new Error('an untouched link was lost: '+r.be);
    if(!r.dom&&!phone)throw new Error('no anchor on the page uses the overridden Instagram link (desktop [data-link] must follow the merged links)')});
  T('merged: fan art rules are enforced',async p=>{const c=p.context();await merged(p,c);
    const r=await p.evaluate(()=>{const f=PROJECTS.find(x=>x.title==='QA Fan Piece');return f&&{roles:f.roles,own:f.own,col:withRole('coloring').includes(f),stk:withRole('sticker').includes(f),spr:withRole('sprite').includes(f),game:withRole('game').includes(f),village:withRole('village').includes(f),feat:withRole('featured').includes(f)}});
    if(!r)throw new Error('the fan piece was dropped; it should stay in the portfolio');
    if(r.roles.some(x=>!['portfolio','card'].includes(x)))throw new Error('fan art kept creative roles: '+r.roles.join(','));if(r.col||r.stk||r.spr||r.game||r.village)throw new Error('fan art leaked into coloring/sticker/sprite/game/village');
    if(!r.roles.includes('portfolio'))throw new Error('fan art lost its portfolio role')});
  T('merged: an emoji in a title is refused or stripped',async p=>{const c=p.context();if(!SITEDATA)skip('js/site-data.js not landed yet');
    await route(c,JSON.stringify({version:1,projects:[{id:'u-qa-emoji',cat:'illustration',title:'QA Emoji \u{1F600}',desc:'x',img:'assets/work/thumb/u/qa-emoji.jpg',full:'assets/work/u/qa-emoji.jpg',kind:'original',roles:['portfolio','card']}]}));await boot(p);await sleep(1200);
    const bad=await p.evaluate(()=>PROJECTS.some(x=>/\p{Extended_Pictographic}/u.test(x.title+x.desc)));if(bad)throw new Error('an emoji reached the site through data/site.json')});

  // 7. project flow (docs/flow.md): steps in data/site.json show the diagram; the Art tab's steps editor (no PIN needed: the tab is driven directly)
  T('merged: steps in site.json show the flow, bad steps are dropped',async p=>{const c=p.context();if(!SITEDATA)skip('js/site-data.js not landed yet');
    await route(c,JSON.stringify({version:1,projects:[{id:'u-qa-flow',cat:'illustration',title:'QA Flow Piece',desc:'Has steps.',img:'assets/work/thumb/u/qa-flow.jpg',full:'assets/work/u/qa-flow.jpg',kind:'original',roles:['portfolio','card'],flow:'process',
      steps:[{img:'assets/work/thumb/giraffe.jpg',full:'assets/work/giraffe.jpg',caption:{en:'Sketch',id:'Sketsa'}},{img:'javascript:alert(1)',full:'x'},{img:'assets/work/thumb/u/qa-flow.jpg',full:'assets/work/u/qa-flow.jpg',caption:{en:'Final',id:'Final'}}]}],
      flows:{'RPG':{flow:'series',steps:[{img:'assets/work/thumb/rpg.jpg',full:'assets/work/rpg.jpg'},{img:'assets/work/thumb/shark.jpg',full:'assets/work/shark.jpg'}]}}}));
    await boot(p);if(!await waitFor(()=>p.evaluate(()=>PROJECTS.some(x=>x.title==='QA Flow Piece')),5000))throw new Error('the piece with steps was not merged');
    const r=await p.evaluate(()=>{const q=PROJECTS.find(x=>x.title==='QA Flow Piece'),g=PROJECTS.find(x=>x.title==='RPG');show(PROJECTS.indexOf(q));
      return {n:stepsOf(q).length,bad:q.steps.some(x=>!/^assets\/work\//.test(x.img)),rpg:stepsOf(g).length,flow:g.flow}});
    if(r.n!==2||r.bad)throw new Error('steps not cleaned: '+JSON.stringify(r));if(r.rpg!==2||r.flow!=='series')throw new Error('flows for a built-in piece not merged: '+JSON.stringify(r));
    if(!await vis(p,'#lbFlow .fl-node',3000))throw new Error('no flow diagram for the merged piece');
    if(await p.$$eval('#lbFlow .fl-node',n=>n.length)!==2)throw new Error('wrong number of flow nodes')});
  if(!phone)T('admin art: steps editor adds, reorders, removes and publishes steps',async p=>{needAdmin();await boot(p);
    await p.addScriptTag({url:url+'js/admin-art.js'});
    await p.evaluate(()=>{const tab=(window.AdminTabs||[]).find(x=>x[0]==='art')[1];window.__qa={data:{version:1,projects:[],hidden:[],order:[]},files:{}};
      const el=document.createElement('div');el.id='qaArt';el.style.cssText='position:fixed;inset:0;overflow:auto;background:#fff;z-index:9999;padding:12px';document.body.appendChild(el);
      tab.render(el,{get data(){return __qa.data},getData:()=>__qa.data,setData:d=>{__qa.data=d},addFile:(k,b)=>{__qa.files[k]=b.length},canPublish:true})});
    const img=px.join(SITE,'assets/work/giraffe.jpg'),img2=px.join(SITE,'assets/work/shark.jpg');
    await p.click('#qaArt #aaAdd');await p.fill('#aaTe','QA Steps');await p.fill('#aaDe','A piece with a flow.');await p.fill('#aaTi','QA Langkah');await p.fill('#aaDi','Karya dengan alur.');
    await p.setInputFiles('#aaFile',img);if(!await waitFor(()=>p.evaluate(()=>!!document.querySelector('#qaArt .aa-big')),6000))throw new Error('main picture did not load');
    await p.fill('#aaTe','QA Steps');
    await p.setInputFiles('#aaStepFile',[img2,img]);if(!await waitFor(()=>p.evaluate(()=>document.querySelectorAll('#qaArt .aa-step').length===2),8000))throw new Error('two step pictures were not added');
    await p.click('#aaStepSelf');if(await p.$$eval('#qaArt .aa-step',n=>n.length)!==3)throw new Error('the piece itself was not added as a step');
    await p.fill('[data-cap-en="0"]','First sketch');await p.fill('[data-cap-id="0"]','Sketsa pertama');
    await p.click('[data-sdel="1"]');if(await p.$$eval('#qaArt .aa-step',n=>n.length)!==2)throw new Error('remove did not remove');
    if(await p.inputValue('[data-cap-en="0"]')!=='First sketch')throw new Error('a caption was lost on redraw');
    await p.click('[data-sup="1"]');await p.click('[data-sdown="0"]');   // up then down: back to the same order
    await p.fill('[data-cap-en="1"]','Final');   // English only: must be refused
    await p.click('#aaForm [type=submit]');if(!await vis(p,'#aaForm .aa-err',2000))throw new Error('a caption in one language only was accepted');
    await p.fill('[data-cap-id="1"]','Final');await p.click('#aaForm [type=submit]');await sleep(300);
    const r=await p.evaluate(()=>({d:__qa.data,f:__qa.files}));const pc=(r.d.projects||[])[0];
    if(!pc||!pc.steps)throw new Error('no steps saved: '+JSON.stringify(r.d).slice(0,200));
    if(pc.steps.length!==2||pc.steps[0].caption.en!=='First sketch'||pc.steps[1].full!==pc.full)throw new Error('steps wrong: '+JSON.stringify(pc.steps));
    if(!/^assets\/work\/u\/qa-steps-s\d\.jpg$/.test(pc.steps[0].full)||!r.f[pc.steps[0].full]||!r.f[pc.steps[0].img])throw new Error('step picture not queued for publish: '+JSON.stringify(Object.keys(r.f)));
    if(pc.flow!=='process')throw new Error('flow kind missing');
    const v=await p.evaluate(()=>AdminArt.validateSteps([{img:'a',full:'b',caption:{en:'x',id:''}}]).length);if(v<2)throw new Error('validateSteps lets one step and a one-language caption through')});

  const q=jobs.slice();await Promise.all(Array.from({length:+process.env.POOL||3},async()=>{for(let j;(j=q.shift());)await runJob(j)}));return rows}

srv.listen(0,async()=>{
  const url=`http://localhost:${srv.address().port}/`;const b=await chromium.launch();
  if(!PIN)console.log('SKIP pin tests that need the right PIN: ADMIN_PIN is not set');
  if(!ADMIN)console.log('SKIP door/pin/admin tests: js/admin.js has not landed yet');if(!SITEDATA)console.log('SKIP merged-data tests: js/site-data.js has not landed yet');
  const cfgs=[['desktop','en'],['desktop','id'],['phone','en'],['phone','id']];
  const all=(await Promise.all(cfgs.map(([d,l])=>runConfig(b,url,d,l).catch(e=>[{cfg:d+'-'+l,name:'RUN',st:'FAIL',msg:String(e.message).slice(0,140)}])))).flat().filter(Boolean);
  await b.close();srv.close();
  const names=[...new Set(all.map(r=>r.name))];const cols=cfgs.map(c=>c.join('-'));
  console.log('\n'+'test'.padEnd(66)+cols.map(c=>c.padEnd(11)).join(''));
  for(const n of names)console.log(n.slice(0,64).padEnd(66)+cols.map(c=>{const r=all.find(x=>x.name===n&&x.cfg===c);return (r?r.st:'-').padEnd(11)}).join(''));
  const fails=all.filter(r=>r.st==='FAIL'),skips=all.filter(r=>r.st==='SKIP'),passes=all.filter(r=>r.st==='PASS');
  for(const s of [...new Map(skips.map(s=>[s.msg,s])).values()])console.log('SKIP '+s.name+': '+s.msg);
  console.log(`\n${passes.length} PASS, ${fails.length} FAIL, ${skips.length} SKIP`+(all.some(r=>r.retried)?`  (passed only on retry: ${all.filter(r=>r.retried).map(r=>r.cfg+' '+r.name).join('; ')})`:''));
  for(const f of fails)console.log(`FAIL ${f.cfg} | ${f.name}: ${f.msg}`);
  process.exit(fails.length?1:0)});
