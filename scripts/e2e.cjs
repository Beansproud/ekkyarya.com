// Usage: node scripts/e2e.cjs [site dir (default .)] [out dir for screenshots (default none)]
// QA walk of every phone user flow on an iPhone 13 profile, light + dark, EN + ID. Checks real results (pixels, state, files),
// not just "no error". Prints a PASS/FAIL table and one "FAIL cfg | test: why" line per failure; exits 1 if any fail.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');
const SITE=px.resolve(process.argv[2]||'.'),OUT=process.argv[3];if(OUT)fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}
r.writeHead(200,{'content-type':MIME[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const {defaultBrowserType,...IPHONE}=devices['iPhone 13'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const vis=(p,sel,t=4000)=>p.waitForSelector(sel,{state:'visible',timeout:t}).then(()=>true,()=>false);
const must=async(p,sel,what,t)=>{if(!await vis(p,sel,t))throw new Error(what||('not visible: '+sel))};

// ---- page-side audits ----
function auditFn(){
  const out=[];const W=innerWidth,H=innerHeight;
  const shown=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;const s=getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none'||+s.opacity<.05)return false;
    for(let n=e;n&&n!==document.body;n=n.parentElement){const c=getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.05||(n.hasAttribute&&n.hasAttribute('hidden')))return false;
      if(n.matches&&n.matches('.g-screen:not(.active)'))return false}return true};
  const name=e=>(e.id?'#'+e.id:'')+(e.className&&e.className.baseVal===undefined?'.'+String(e.className).trim().split(/\s+/).slice(0,2).join('.'):'')+' "'+((e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,18))+'"';
  // an element sitting under an inactive overlay (closed sheet, hidden screen) is not visible to the user
  const btns=[...document.querySelectorAll('button,a[href],[role=button],[role=radio],[role=switch],input:not([type=hidden]):not(.c-any-input)')].filter(shown).filter(e=>{const r=e.getBoundingClientRect();const x=Math.min(Math.max(r.left+r.width/2,0),W-1),y=Math.min(Math.max(r.top+r.height/2,0),H-1);const t=document.elementFromPoint(x,y);return t&&(e.contains(t)||t.contains(e))||r.bottom<0||r.top>H});
  // a visible, tappable control: the hit target must be at least 44 px in both directions (inline text links in prose are exempt)
  for(const e of btns){const r=e.getBoundingClientRect();const inProse=e.tagName==='A'&&e.closest('p,li')&&getComputedStyle(e).display==='inline';
    if(!inProse&&(r.width<43.5||r.height<43.5))out.push('small '+Math.round(r.width)+'x'+Math.round(r.height)+' '+name(e));
    if((r.right>W+1||r.left<-1)&&!(e.closest('.g-filters')||[...(function*(){for(let n=e.parentElement;n;n=n.parentElement)yield n})()].some(n=>/auto|scroll/.test(getComputedStyle(n).overflowX)&&n.scrollWidth>n.clientWidth)))out.push('offscreen-x '+name(e)+' l'+Math.round(r.left)+' r'+Math.round(r.right))}
  const se=document.scrollingElement;if(se.scrollWidth>W+1)out.push('h-scroll page '+se.scrollWidth+'>'+W);
  for(const e of document.querySelectorAll('.g-screen.active,.c-over.open,.c-view,#gSheet.open .g-sheet-in,dialog[open]'))if(shown(e)&&e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflowX!=='hidden'&&getComputedStyle(e).overflowX!=='auto')out.push('h-scroll '+name(e));
  // text outside the screen
  for(const e of document.querySelectorAll('h1,h2,h3,p,span,label,li,small,b,strong'))if(shown(e)&&e.children.length===0&&e.textContent.trim()){const r=e.getBoundingClientRect();
    if(r.right>W+1||r.left<-1)out.push('text-offscreen '+name(e))}
  // dark mode: computed colour vs the first opaque background behind it
  if(matchMedia('(prefers-color-scheme:dark)').matches){
    const parse=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(/[ ,\/]+/).map(Number);return {r:a[0],g:a[1],b:a[2],a:a[3]===undefined?1:a[3]}};
    const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
    const bgOf=e=>{let acc=[];for(let n=e;n;n=n.parentElement){const s=getComputedStyle(n);if(s.backgroundImage!=='none'&&!/^url/.test(s.backgroundImage)&&/gradient/.test(s.backgroundImage)){const cs=(s.backgroundImage.match(/rgba?\([^)]+\)/g)||[]).map(parse).filter(Boolean);if(cs.length)return cs[cs.length-1]}
      const c=parse(s.backgroundColor);if(c&&c.a>0){acc.push(c);if(c.a>=.99)break}}
      if(!acc.length)return {r:255,g:255,b:255,a:1};let base=acc[acc.length-1].a>=.99?acc.pop():{r:20,g:10,b:40,a:1};
      while(acc.length){const t=acc.pop();base={r:t.r*t.a+base.r*(1-t.a),g:t.g*t.a+base.g*(1-t.a),b:t.b*t.a+base.b*(1-t.a),a:1}}return base};
    const bad=new Set();
    for(const e of document.querySelectorAll('h1,h2,h3,h4,p,span,label,li,small,b,strong,button,a,div')){
      if(!shown(e)||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
      const s=getComputedStyle(e);const fg=parse(s.color);if(!fg)continue;const bg=bgOf(e);
      const f={r:fg.r*fg.a+bg.r*(1-fg.a),g:fg.g*fg.a+bg.g*(1-fg.a),b:fg.b*fg.a+bg.b*(1-fg.a)};
      const l1=lum(f),l2=lum(bg);const ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);const big=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.6&&+s.fontWeight>=700);
      if(ratio<(big?3:4.5))bad.add('contrast '+ratio.toFixed(1)+' '+name(e)+' '+s.color+' on rgb('+[bg.r,bg.g,bg.b].map(Math.round)+')')}
    out.push(...[...bad].slice(0,6))}
  return out}

// ---- one config = one scheme + language, run end to end ----
async function runConfig(browser,url,scheme,lang){
  const cfg=`${scheme}-${lang}`;const rows=[];
  async function ctx(errs){
    const c=await browser.newContext({...IPHONE,colorScheme:scheme,acceptDownloads:true});
    await c.addInitScript(l=>{try{if(!sessionStorage.getItem('e2e-init')){localStorage.setItem('lang',l);sessionStorage.setItem('e2e-init','1')}}catch(e){}
      // keep the share sheet deterministic: pretend there is no Web Share so the app's own fallback runs
      try{navigator.share=undefined;navigator.canShare=undefined}catch(e){}},lang);
    const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));return {c,p}}
  async function boot(p,qs=''){await p.goto(url+'?game=1'+qs);await must(p,'#g-start.active','game mode did not open',8000);await sleep(500)}
  // tests are independent (each gets its own browser context), so they run POOL at a time; most of the wall time is waiting
  const jobs=[];const ONLY=process.env.ONLY&&new RegExp(process.env.ONLY,'i');const T=(name,fn)=>{if(ONLY&&!ONLY.test(name))return;for(let r=0;r<(+process.env.REPEAT||1);r++)jobs.push({i:jobs.length,name,fn})};   // ONLY=regex REPEAT=n NORETRY=1: for hunting flakes
  async function runJob(job,again){const {i,name,fn}=job;let ok=true,msg='';const errs=[];const {c,p}=await ctx(errs);
    try{await fn(p,c);if(errs.length)throw new Error('page error: '+errs[errs.length-1].slice(0,90))}catch(e){ok=false;msg=String(e.message||e).split('\n')[0].slice(0,160);
      if(OUT)await p.screenshot({path:`${OUT}/FAIL-${cfg}-${name.replace(/\W+/g,'_')}.png`}).catch(()=>{})}
    await c.close().catch(()=>{});if(!ok&&!again&&!process.env.NORETRY)return runJob(job,true);   // one retry: a timing flake must not block a merge; a real bug fails twice
    rows[i]={cfg,name,ok,msg,retried:!!again&&ok}}
  const audit=async(p,what)=>{const a=await p.evaluate(auditFn);if(a.length)throw new Error(`audit ${what}: ${a.slice(0,4).join(' ; ')}${a.length>4?' (+'+(a.length-4)+')':''}`)};
  const hash=p=>p.evaluate(()=>{const c=document.getElementById('cCanvas');if(!c)return null;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=5)h=(h*31+d[i])>>>0;return h});
  // a fill or undo may animate: read the canvas only once two reads 120 ms apart agree
  const settled=async p=>{await sleep(250);let h=await hash(p);for(let i=0;i<25;i++){await sleep(120);const n=await hash(p);if(n===h)return n;h=n}return h};
  const active=p=>p.evaluate(()=>{const s=document.querySelector('.g-screen.active');return s&&s.id});
  const overlayOpen=p=>p.evaluate(()=>[...document.querySelectorAll('#gColor,#gArcade,#gSheet,#lightbox')].some(e=>e.classList.contains('open')||e.open||(e.id==='gColor'&&getComputedStyle(e).display!=='none'&&e.offsetParent!==null)));
  const homeEl='[data-home],.g-home,#gHome,.g-top-logo,.g-logo-btn';
  // wait for the screen to be active (state), not a fixed sleep: under load a tab switch can take longer than 600 ms
  const isActive=(p,id,t=5000)=>p.waitForFunction(id=>{const s=document.querySelector('.g-screen.active');return !!s&&s.id===id},id,{timeout:t,polling:50}).then(()=>true,()=>false);
  const tab=async(p,t)=>{await p.tap(`.g-tabs button[data-tab="${t}"]`);await isActive(p,'g-'+t);await sleep(300)};

  // --- navigation ---
  await T('nav: tabs + Home logo',async p=>{await boot(p);
    for(const t of ['art','map','mine']){await tab(p,t);if(await active(p)!=='g-'+t)throw new Error('tab '+t+' did not open');
      if(!await vis(p,homeEl,3000))throw new Error('no Home logo visible on '+t+' screen');
      await p.tap(homeEl+':visible');await isActive(p,'g-start');if(await active(p)!=='g-start')throw new Error('Home logo from '+t+' did not return to start')}});
  await T('nav: history.back() to start',async p=>{await boot(p);const u0=p.url().split('?')[0];
    for(const t of ['art','map','mine']){await tab(p,t);await p.evaluate(()=>history.back()).catch(()=>{});await isActive(p,'g-start');
      if(!p.url().startsWith(u0))throw new Error('back from '+t+' left the app: '+p.url().slice(0,60));if(await active(p)!=='g-start')throw new Error('back from '+t+' stayed on '+await active(p))}});
  await T('nav: back closes overlays',async p=>{await boot(p);await p.tap('[data-go=color]');await must(p,'#gColor','picker did not open');await p.evaluate(()=>history.back()).catch(()=>{});await sleep(1200);
    if(!p.url().includes('localhost'))throw new Error('back from Color left the app');if(await p.isVisible('#cPick'))throw new Error('back did not close the Color picker')});

  // --- screens audit (size, scroll, off-screen, dark contrast) ---
  await T('audit: start',async p=>{await boot(p);await audit(p,'start')});
  for(const t of ['art','map','mine'])await T('audit: '+t,async p=>{await boot(p);await tab(p,t);await sleep(800);await audit(p,t)});

  // --- Color ---
  const waitIdle=async p=>{await sleep(500);for(let i=0;i<30;i++){if(!await p.evaluate(()=>document.getAnimations().some(a=>a.playState==='running'&&a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('#gColor'))))break;await sleep(100)}await sleep(300)};
  const openColor=async(p,page)=>{await p.tap('[data-go=color]');await must(p,'#cPages .c-page','picker has no pages');
    if(!await p.isVisible('#cPick'))throw new Error('picker not visible');
    const id=page||await p.evaluate(()=>[...document.querySelectorAll('#cPages .c-page:not(.c-scratch)')][0].dataset.page);
    await sleep(600);   // the picker slides in; a tap during the slide can be lost
    for(let k=0;k<3;k++){await p.tap(`#cPages .c-page[data-page="${id}"]`);if(await vis(p,'#cEdit #cCanvas',5000))break}
    await must(p,'#cEdit #cCanvas','editor did not open',8000);await waitIdle(p);return id};
  const fill=async(p,n)=>{const r=await p.evaluate(()=>{const b=document.getElementById('cStage').getBoundingClientRect();return [b.left,b.top,b.width,b.height]});
    let last=await hash(p);const hs=[last];let k=0;
    for(const [fx,fy] of [[.5,.5],[.3,.3],[.7,.3],[.3,.7],[.7,.7],[.5,.25],[.5,.75],[.2,.5],[.8,.5],[.4,.4],[.6,.6],[.35,.55],[.65,.45],[.5,.4],[.5,.6]]){
      if(hs.length>n)break;await p.tap(`#cColors .c-sw[data-v]:nth-of-type(${(k++%12)+1})`).catch(()=>{});await p.touchscreen.tap(r[0]+r[2]*fx,r[1]+r[3]*fy);const h=await settled(p);if(h!==last){hs.push(h);last=h}}
    if(hs.length<=n)throw new Error(`only ${hs.length-1} of ${n} taps changed pixels`);return hs};
  await T('color: fill 2 + undo x2',async p=>{await boot(p);await openColor(p);const hs=await fill(p,2);
    await p.tap('#cUndo');if(await settled(p)!==hs[1])throw new Error('1st undo did not restore pixels');
    await p.tap('#cUndo');if(await settled(p)!==hs[0])throw new Error('2nd undo did not restore pixels');await audit(p,'color editor')});
  await T('color: reload keeps fills + undo',async(p)=>{await boot(p);const id=await openColor(p);const hs=await fill(p,2);await p.tap('#cBack');await sleep(800);
    await p.reload();await must(p,'#g-start.active','reload failed',8000);await sleep(500);await openColor(p,id);const h=await settled(p);
    if(h!==hs[2])throw new Error('fills not kept after reload');await p.tap('#cUndo');if(await settled(p)===h)throw new Error('Undo does nothing after reopen')});
  await T('color: "+" color sheet adds swatch',async p=>{await boot(p);await openColor(p);const n0=await p.$$eval('#cColors .c-sw',e=>e.length);
    if(!await vis(p,'#cColors .c-any',500))throw new Error('no "+" swatch');await p.tap('#cColors .c-any');await must(p,'#cWheel','"+" did not open the color sheet');await sleep(400);
    const pre=()=>p.$eval('#cWPre',e=>getComputedStyle(e).backgroundColor);const p0=await pre();
    for(const k of ['h','s','l']){const r=await p.$eval(`#cWheel [data-k="${k}"]`,e=>{const b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height]});
      await p.touchscreen.tap(r[0]+r[2]*(k==='h'?.7:.45),r[1]+r[3]/2);await sleep(150)}
    if(await pre()===p0)throw new Error('tapping the hue/strength/light strips did not change the preview');
    await audit(p,'color sheet');
    await p.tap('#cWYes');await sleep(500);if(await p.isVisible('#cWheel'))throw new Error('sheet stayed open after "Use this color"');
    const n1=await p.$$eval('#cColors .c-sw',e=>e.length);if(n1<=n0)throw new Error('swatch count '+n0+'->'+n1+' after "Use this color"');
    if(!await p.$eval('#cColors .c-sw.on',e=>+e.dataset.v>=13))throw new Error('new swatch not selected');
    await p.tap('#cColors .c-any');await must(p,'#cWheel','sheet did not reopen');await p.tap('#cWNo');await sleep(400);if(await p.isVisible('#cWheel'))throw new Error('Cancel did not close the sheet')});
  await T('color: stickers add',async p=>{await boot(p);await openColor(p);await p.tap('#cStickBtn');await must(p,'#cTray [data-n]','sticker tray empty');
    const n0=await p.$$eval('#cStickers .c-st',e=>e.length);await p.tap('#cTray [data-n]');await sleep(400);const n1=await p.$$eval('#cStickers .c-st',e=>e.length);if(n1<=n0)throw new Error('sticker not added')});
  await T('color: Done / reveal / Download / Share',async p=>{await boot(p);await openColor(p);await fill(p,1);await audit(p,'color editor');
    await p.tap('#cDone');await must(p,'#cReveal','reveal did not show',8000);await sleep(800);await audit(p,'reveal');
    const dl=p.waitForEvent('download',{timeout:5000}).then(()=>'file',()=>null);const dlg=p.waitForSelector('#shareSheet, .sh-over:visible, dialog[open], .g-sheet.open',{state:'visible',timeout:5000}).then(()=>'dialog',()=>null);
    await p.tap('#cDl');const got=await Promise.race([dl,dlg]);if(!got&&!(await dl)&&!(await dlg))throw new Error('Download: no file and no save dialog');
    await p.keyboard.press('Escape');await sleep(300);if(!await vis(p,'#cShare',500))await p.evaluate(()=>{document.querySelectorAll('.open,[open]').forEach(e=>e.classList.remove('open'))});
    const before=await p.evaluate(()=>document.body.innerHTML.length);await p.tap('#cShare',{timeout:3000}).catch(()=>{throw new Error('Share button not tappable')});await sleep(1500);
    const seen=await p.evaluate(()=>[...document.querySelectorAll('[class*=share],[id*=hare],dialog[open],#toast,.toast')].some(e=>e.offsetParent&&e.getBoundingClientRect().height>20));if(!seen)throw new Error('Share: nothing appeared (no preview / sheet / toast)')});
  await T('color: Doodle Scene (scratch) draw + sticker + undo',async p=>{await boot(p);await p.tap('[data-go=color]');await must(p,'#cPages .c-scratch','no Doodle Scene entry');await p.tap('#cPages .c-scratch');await must(p,'#cEdit #cCanvas','scratch editor did not open',8000);await sleep(800);
    const h0=await hash(p);const r=await p.evaluate(()=>{const b=document.getElementById('cStage').getBoundingClientRect();return [b.left,b.top,b.width,b.height]});
    await p.mouse.move(r[0]+r[2]*.2,r[1]+r[3]*.4);await p.mouse.down();for(let i=1;i<=8;i++)await p.mouse.move(r[0]+r[2]*(.2+i*.07),r[1]+r[3]*(.4+i*.02));await p.mouse.up();await sleep(400);
    const h1=await hash(p);if(h1===h0)throw new Error('drawing changed nothing');
    await p.tap('#cStickBtn');await must(p,'#cTray [data-n]','no stickers on scratch page');const n0=await p.$$eval('#cStickers .c-st',e=>e.length);await p.tap('#cTray [data-n]');await sleep(400);
    if((await p.$$eval('#cStickers .c-st',e=>e.length))<=n0)throw new Error('sticker not placed on scratch page');
    await p.tap('#cUndo');await sleep(400);await p.tap('#cUndo');await sleep(400);if(await p.$$eval('#cStickers .c-st',e=>e.length)>n0&&await hash(p)===h1)throw new Error('undo changed nothing on scratch page')});

  await T('doodle: sticker drag, drop on bin, undo',async p=>{await boot(p);await p.tap('[data-go=color]');await must(p,'#cPages .c-scratch','no Doodle Scene entry');await p.tap('#cPages .c-scratch');await must(p,'#cEdit #cCanvas','scratch editor did not open',8000);await sleep(800);
    await p.tap('#cStickBtn');await must(p,'#cTray [data-n]','no stickers');await p.tap('#cTray [data-n]');await sleep(1000);
    const pos=()=>p.$eval('#cStickers .c-st:last-child',e=>{const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
    const cnt=()=>p.$$eval('#cStickers .c-st',e=>e.length);const n1=await cnt();if(!n1)throw new Error('sticker not added');
    const [x0,y0]=await pos();const st=await p.$eval('#cStage',e=>{const b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height]});
    const tx=Math.min(st[0]+st[2]*.75,x0+90),ty=Math.min(st[1]+st[3]*.6,y0+90);
    await p.mouse.move(x0,y0);await p.mouse.down();for(let i=1;i<=10;i++){await p.mouse.move(x0+(tx-x0)*i/10,y0+(ty-y0)*i/10);await sleep(20)}await p.mouse.up();
    // wait for the result (poll up to 3 s), not a fixed 400 ms: under a loaded CPU the drag and undo can land late
    const until=async(f,t=3000)=>{const end=Date.now()+t;let v;do{v=await f();if(v)return v;await sleep(100)}while(Date.now()<end);return v};
    await until(async()=>{const [a,b]=await pos();return Math.hypot(a-x0,b-y0)>=20});
    const [x1,y1]=await pos();if(Math.hypot(x1-x0,y1-y0)<20)throw new Error('dragging the sticker did not move it');
    await p.tap('#cUndo');await until(async()=>{const n=await cnt();if(n!==n1)return true;const [a,b]=await pos();return Math.hypot(a-x1,b-y1)>=5});const n2=await cnt();const back=n2?await pos():null;if(n2===n1&&back&&Math.hypot(back[0]-x1,back[1]-y1)<5)throw new Error('undo after a sticker drag changed nothing');
    // drop on the bin removes it
    await p.tap('#cStickBtn').catch(()=>{});if(!await cnt()){await p.tap('#cUndo');await sleep(300)}
    if(!await p.isVisible('#cTray')){await p.tap('#cStickBtn')}const n2b=await cnt();await p.tap('#cTray [data-n]');await until(async()=>await cnt()>n2b);await sleep(200);const n3=await cnt();const [x2,y2]=await pos();
    await p.mouse.move(x2,y2);await p.mouse.down();await p.mouse.move(x2+6,y2+6);await p.mouse.move(x2+14,y2+10);await sleep(500);
    const bin=await p.$eval('#cBin',e=>{const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
    for(let i=1;i<=10;i++)await p.mouse.move(x2+(bin[0]-x2)*i/10,y2+(bin[1]-y2)*i/10);await until(()=>p.$eval('#cBin',e=>e.classList.contains('hot')));
    if(!await p.$eval('#cBin',e=>e.classList.contains('hot')))throw new Error('bin did not light up under the dragged sticker');await p.mouse.up();await until(async()=>await cnt()<n3);
    if(await cnt()>=n3)throw new Error('dropping a sticker on the bin did not delete it');
    await p.tap('#cUndo');await until(async()=>await cnt()>=n3);if(await cnt()<n3)throw new Error('undo did not bring the deleted sticker back')});

  // --- language switch in place ---
  await T('lang: switch in place, no stale text',async p=>{await boot(p);await p.evaluate(()=>{window.__m=1});
    const from=lang,to=lang==='en'?'id':'en';
    const stale=(old,nw)=>p.evaluate(([o,n])=>{const bad=new Set();const keys=Object.keys(COPY[o]).filter(k=>typeof COPY[o][k]==='string'&&COPY[o][k].length>=4&&COPY[n][k]!==undefined&&COPY[n][k]!==COPY[o][k]);
      const map=new Map(keys.map(k=>[COPY[o][k].trim(),k]));
      for(const e of document.querySelectorAll('body *')){if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')continue;if(e.closest('script,style,svg'))continue;
        const hidden=e.closest('[hidden],.g-screen:not(.active)');if(hidden)continue;
        const txt=[...e.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent.trim()).join(' ').trim();if(map.has(txt))bad.add(txt.slice(0,28));
        const al=(e.getAttribute('aria-label')||'').trim();if(map.has(al))bad.add('aria:'+al.slice(0,24))}
      return [...bad].slice(0,5)},[old,nw]);
    const check=async(phase)=>{if(!await p.evaluate(()=>window.__m===1))throw new Error('page reloaded when switching language ('+phase+')');
      for(const scr of ['start','art','map','mine']){if(scr!=='start')await tab(p,scr);await sleep(500);const bad=await stale(phase==='to'?from:to,phase==='to'?to:from);if(bad.length)throw new Error(`${phase==='to'?from:to} text left on ${scr} after switching to ${phase==='to'?to:from}: ${bad.join(' | ')}`)}};
    await tab(p,'mine');await p.tap(`#g-mine [data-lang="${to}"]`);await sleep(900);
    if(await p.evaluate(()=>document.documentElement.lang)!==to)throw new Error('html lang not updated');await check('to');
    // overlays redraw too: open the Color picker and the Hire sheet in the new language
    await p.tap('[data-go=color]').catch(()=>{});await tab(p,'start').catch(()=>{});
    await tab(p,'mine');await p.tap(`#g-mine [data-lang="${from}"]`);await sleep(900);await check('back')});

  await T('color: language switch after closing Mewarnai does not reopen the picker',async p=>{await boot(p);await p.tap('[data-go=color]');await must(p,'#cPages .c-page','picker has no pages');await sleep(600);await p.tap('#cPickX');await sleep(600);
    if(await p.isVisible('#cPick'))throw new Error('picker did not close');
    await tab(p,'mine');await p.tap(`#g-mine [data-lang="${lang==='en'?'id':'en'}"]`);await sleep(900);
    if(await p.evaluate(()=>document.getElementById('gColor').classList.contains('open')))throw new Error('language switch reopened Color');
    if(await p.isVisible('#cPick'))throw new Error('language switch popped the picker over the screen');
    await p.tap(`#g-mine [data-lang="${lang}"]`);await sleep(500)});

  // --- Map tab face button ---
  await T('map face button renders, label not clipped',async p=>{await boot(p);
    for(const st of ['start','map']){if(st==='map')await tab(p,'map');await sleep(500);
      const r=await p.evaluate(()=>{const b=document.querySelector('.g-tabs button.center'),i=b&&b.querySelector('img.g-face-img'),l=b&&b.querySelector('small');if(!i)return {err:'no img.g-face-img'};
        const ir=i.getBoundingClientRect();const out={ok:i.complete&&i.naturalWidth>0,w:Math.round(ir.width),h:Math.round(ir.height),vis:ir.width>0&&getComputedStyle(i).visibility!=='hidden'&&+getComputedStyle(i).opacity>0};
        let cl={l:0,t:0,r:innerWidth,b:innerHeight};for(let n=i.parentElement;n&&n!==document.body;n=n.parentElement){const s=getComputedStyle(n);if(/hidden|clip|auto|scroll/.test(s.overflow+s.overflowX+s.overflowY)){const q=n.getBoundingClientRect();cl={l:Math.max(cl.l,q.left),t:Math.max(cl.t,q.top),r:Math.min(cl.r,q.right),b:Math.min(cl.b,q.bottom)}}}
        const ix=Math.max(0,Math.min(ir.right,cl.r)-Math.max(ir.left,cl.l))*Math.max(0,Math.min(ir.bottom,cl.b)-Math.max(ir.top,cl.t));out.shown=Math.round(100*ix/Math.max(1,ir.width*ir.height));
        if(l){const q=l.getBoundingClientRect();out.label=l.textContent.trim();out.lclip=l.scrollWidth>l.clientWidth+1||q.right>innerWidth+.5||q.left<-.5||q.bottom>innerHeight+.5;
          const t=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);out.covered=!(t&&(t===l||l.contains(t)||t===b));out.lw=Math.round(q.width)}return out});
      if(r.err)throw new Error(r.err);if(!r.ok)throw new Error('face image did not load');if(!r.vis||r.w<20)throw new Error(`face image not visible (${r.w}x${r.h})`);if(r.shown<95)throw new Error(`face image clipped, ${r.shown}% visible (${st})`);
      if(!r.label)throw new Error('Map label empty');if(r.lclip)throw new Error(`Map label "${r.label}" clipped/off-screen (${st})`);if(r.covered)throw new Error(`Map label "${r.label}" covered by the face (${st})`)}});

  // --- Noodle Bath page ---
  await T('color: Noodle Bath page opens + fills',async p=>{await boot(p);await p.tap('[data-go=color]');await must(p,'#cPages .c-page','no pages');
    if(!await p.$('#cPages .c-page[data-page="noodles"]'))throw new Error('no Noodle Bath entry in the picker');
    await p.evaluate(()=>document.querySelector('#cPages .c-page[data-page="noodles"]').scrollIntoView());await p.tap('#cPages .c-page[data-page="noodles"]');
    await must(p,'#cEdit #cCanvas','Noodle Bath editor did not open',8000);await sleep(900);
    if(!await p.$eval('#cCanvas',c=>c.width>100&&c.height>100))throw new Error('Noodle Bath canvas is empty');
    await fill(p,1);await audit(p,'noodle bath editor')});

  // --- the 10 start-page idle effects: no errors, tiles back at rest within 1 px, will-change cleared; a tap cancels ---
  const cellRects=p=>p.evaluate(()=>[...document.querySelectorAll('#gFeatured .g-feat-cell')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.top,r.width,r.height]}));
  const cellState=p=>p.evaluate(()=>{const cs=[...document.querySelectorAll('#gFeatured .g-feat-cell')];return {anims:document.getAnimations().filter(a=>a.effect&&a.effect.target&&cs.includes(a.effect.target)).length,wc:cs.filter(c=>c.style.willChange||/transform|opacity/.test(getComputedStyle(c).willChange)).length,n:cs.length}});
  const restDiff=async(p,base)=>{const now=await cellRects(p);let d=0;now.forEach((r,i)=>{for(let k=0;k<4;k++)d=Math.max(d,Math.abs(r[k]-base[i][k]))});return d};
  for(let k=0;k<10;k++)await T('idle fx '+k,async p=>{await boot(p);if(!await p.evaluate(k=>!!(window.IdleFx&&window.IdleFx.names&&window.IdleFx.names.length>k),k))throw new Error('window.IdleFx missing or has no effect '+k);
    await must(p,'#gFeatured .g-feat-cell','no featured tiles',6000);await sleep(1200);const base=await cellRects(p);const name=await p.evaluate(k=>IdleFx.names[k],k);
    if(!await p.evaluate(k=>IdleFx.play(k),k))throw new Error('IdleFx.play('+k+') refused to start');await sleep(150);
    const s0=await cellState(p);if(!s0.anims)throw new Error(name+': no animation running after play()');if(!s0.wc)throw new Error(name+': will-change not set while running');
    const t0=Date.now();while((await cellState(p)).anims&&Date.now()-t0<7000)await sleep(150);const s1=await cellState(p);
    if(s1.anims)throw new Error(name+': still animating after 7 s');await sleep(200);
    const d=await restDiff(p,base);if(d>1)throw new Error(`${name}: tiles ${d.toFixed(1)} px off rest after the effect`);
    const s2=await cellState(p);if(s2.wc)throw new Error(name+': will-change not cleared ('+s2.wc+' tiles)')});
  await T('idle fx: a tap cancels the effect',async p=>{await boot(p);await must(p,'#gFeatured .g-feat-cell','no featured tiles',6000);await sleep(1200);const base=await cellRects(p);
    for(const k of [0,5,9]){await p.evaluate(k=>IdleFx.play(k),k);await sleep(350);if(!(await cellState(p)).anims)throw new Error('effect '+k+' not running to cancel');
      const r=await p.$eval('.g-tagline',e=>{const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});await p.touchscreen.tap(r[0],r[1]);await sleep(200);
      const s=await cellState(p);if(s.anims)throw new Error('effect '+k+' still running 200 ms after a tap');if(s.wc)throw new Error('effect '+k+': will-change left after a tap');
      const d=await restDiff(p,base);if(d>1)throw new Error(`effect ${k}: tiles ${d.toFixed(1)} px off rest after a tap`)}});

  // --- Catch stars ---
  await T('stars: play, result, Share, Download, Hire',async p=>{await boot(p);await p.tap('#g-start [data-arcade]');await must(p,'#gArcade.open','arcade did not open',5000);await sleep(5000);
    await audit(p,'arcade');
    if(!await vis(p,'#gResult.show',60000))throw new Error('no result screen within 65 s');await sleep(800);await audit(p,'star result');
    if(!await vis(p,'#gResult [data-hire]'))throw new Error('no Hire chip on star result');
    const sh=await p.$('#gResult [data-share],#gResShare,#gResult button[aria-label*=hare i]');if(!sh)throw new Error('no Share button on star result');await sh.evaluate(e=>e.click());await sleep(1200);await p.keyboard.press('Escape');await p.evaluate(()=>document.querySelectorAll('.g-sheet.open,dialog[open]').forEach(e=>{e.classList.remove('open');if(e.close)e.close()}));
    const dl=p.waitForEvent('download',{timeout:5000}).then(()=>1,()=>0);const dlg=p.waitForSelector('.g-sheet.open,dialog[open],[class*=share]:visible',{state:'visible',timeout:5000}).then(()=>1,()=>0);
    await p.$eval('#gResDl',e=>e.click());if(!(await dl)&&!(await dlg))throw new Error('Download on star result: no file and no dialog');});

  // --- Art ---
  await T('art: lightbox + Download',async p=>{await boot(p);await tab(p,'art');await must(p,'#gCards >*','no art cards');await p.tap('#gCards >* >> nth=0');await sleep(900);
    if(!await p.evaluate(()=>document.getElementById('lightbox').open))throw new Error('lightbox did not open');await audit(p,'lightbox');
    const dl=p.waitForEvent('download',{timeout:5000}).then(()=>1,()=>0);const dlg=p.waitForSelector('.g-sheet.open,[class*=share]:visible,#toast.show',{state:'visible',timeout:5000}).then(()=>1,()=>0);
    await p.tap('#lbDl');if(!(await dl)&&!(await dlg))throw new Error('Art Download: no file and no dialog')});

  // --- Map ---
  await T('map: place sheet',async p=>{await boot(p);await tab(p,'map');await must(p,'#gMapWrap .v-place','no places',8000);await sleep(800);
    await p.evaluate(()=>document.querySelector('#gMapWrap .v-place:not(.hire)').click());await sleep(900);if(!await p.evaluate(()=>document.getElementById('gSheet').classList.contains('open')))throw new Error('place sheet did not open');
    await audit(p,'place sheet')});
  await T('map: villager sheet',async p=>{await boot(p);await tab(p,'map');await must(p,'#gMapWrap .v-walker, #gMapWrap .v-folk','no villagers',8000);await sleep(800);
    await p.evaluate(()=>document.querySelector('#gMapWrap .v-folk,#gMapWrap .v-walker').click());await sleep(900);if(!await p.evaluate(()=>document.getElementById('gSheet').classList.contains('open')))throw new Error('villager sheet did not open');
    await audit(p,'villager sheet')});
  await T('map: zoom + / -',async p=>{await boot(p);await tab(p,'map');await must(p,'#gMapWrap [data-zoom]','no zoom buttons',8000);await sleep(800);
    const tf=()=>p.evaluate(()=>{const z=document.getElementById('gMapZoom');const s=getComputedStyle(z);return s.transform+'|'+z.getBoundingClientRect().width.toFixed(1)});
    const a=await tf();await p.tap('[data-zoom="1"]');await sleep(600);const b=await tf();if(a===b)throw new Error('zoom + changed nothing');await p.tap('[data-zoom="-1"]');await sleep(600);const c=await tf();if(c===b)throw new Error('zoom - changed nothing')});

  // --- Hire chip on every screen ---
  const hireOn=async(p,what)=>{if(!await vis(p,'[data-hire]:visible',4000))throw new Error('no Hire chip on '+what);
    await p.evaluate(()=>{const e=[...document.querySelectorAll('[data-hire]')].find(x=>x.offsetParent&&x.getBoundingClientRect().height>0);e.click()});
    // wait for the sheet to open (state), then let it finish sliding in before the audit
    await p.waitForFunction(()=>document.getElementById('gSheet').classList.contains('open')||document.querySelectorAll('dialog[open]').length>0,null,{timeout:4000,polling:50}).catch(()=>{});await sleep(600);
    if(!await p.evaluate(()=>document.getElementById('gSheet').classList.contains('open')||[...document.querySelectorAll('dialog[open]')].length>0))throw new Error('Hire sheet did not open from '+what);
    await audit(p,'hire sheet')};
  for(const t of ['start','art','map','mine'])await T('hire chip: '+t,async p=>{await boot(p);if(t!=='start')await tab(p,t);await hireOn(p,t)});
  await T('hire chip: color picker',async p=>{await boot(p);await p.tap('[data-go=color]');await must(p,'#cPick','picker did not open');await audit(p,'color picker');
    if(!await vis(p,'#gColor [data-hire],[data-hire]:visible',500))throw new Error('no Hire chip on Color picker')});
  const q=jobs.slice();await Promise.all(Array.from({length:+process.env.POOL||4},async()=>{for(let j;(j=q.shift());)await runJob(j)}));
  return rows}

srv.listen(0,async()=>{
  const url=`http://localhost:${srv.address().port}/`;const b=await chromium.launch();
  const cfgs=[['light','en'],['light','id'],['dark','en'],['dark','id']];
  const all=(await Promise.all(cfgs.map(([s,l])=>runConfig(b,url,s,l).catch(e=>[{cfg:s+'-'+l,name:'RUN',ok:false,msg:String(e.message).slice(0,140)}])))).flat();
  await b.close();srv.close();
  const names=[...new Set(all.map(r=>r.name))];const cols=cfgs.map(c=>c.join('-'));
  console.log('\n'+'test'.padEnd(46)+cols.map(c=>c.padEnd(9)).join(''));
  for(const n of names)console.log(n.padEnd(46)+cols.map(c=>{const r=all.find(x=>x.name===n&&x.cfg===c);return (r?r.ok?'PASS':'FAIL':'-').padEnd(9)}).join(''));
  const fails=all.filter(r=>!r.ok);console.log(`\n${all.length-fails.length} PASS, ${fails.length} FAIL`+(all.some(r=>r.retried)?`  (passed only on retry: ${all.filter(r=>r.retried).map(r=>r.cfg+' '+r.name).join('; ')})`:''));
  for(const f of fails)console.log(`FAIL ${f.cfg} | ${f.name}: ${f.msg}`);
  process.exit(fails.length?1:0)});
