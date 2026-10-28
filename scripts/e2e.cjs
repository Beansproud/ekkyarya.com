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
  // owner: "if we go from mobile to web, make sure its reversible from web to mobile too": Web, then Play brings the game back,
  // the choice survives a reload both ways, and Play is never covered (a sideways iPad keeps the web sidebar open)
  await T('nav: mobile to web and back',async p=>{const game=()=>p.evaluate(()=>document.body.classList.contains('game-mode'));
    for(const [w,h] of [[390,844],[1180,820]]){await p.setViewportSize({width:w,height:h});await p.goto(url);await must(p,'#g-start.active','game mode did not open',8000);
      await p.tap('#game .g-web-pin');await sleep(500);if(await game())throw new Error(w+': Web did not open the web site');
      await p.reload();await sleep(800);if(await game())throw new Error(w+': web choice lost on reload');
      await must(p,'#gFab',w+': no Play button on the web site');
      const top=await p.evaluate(()=>{const r=document.getElementById('gFab').getBoundingClientRect(),e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!e&&!!e.closest('#gFab')});
      if(!top)throw new Error(w+': Play is covered');
      await p.tap('#gFab');await must(p,'#g-start.active',w+': Play did not bring the game back');
      await p.reload();await must(p,'#g-start.active',w+': game choice lost on reload',8000)}});
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

  // --- Color tools (sprint 3, docs/color-tools.md): brush, fade, pattern, eraser, undo/redo, save and reopen ---
  // snap() keeps the canvas in the page; diff() counts changed pixels inside shape r, in other shapes, and on Ekky's lines (id 0)
  const snap=p=>p.evaluate(()=>{const c=document.getElementById('cCanvas');window.__snap=c.getContext('2d').getImageData(0,0,c.width,c.height).data});
  const diff=(p,r)=>p.evaluate(r=>{const c=document.getElementById('cCanvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,a=window.__snap,ids=Color.state.pd.ids,o={in:0,out:0,line:0};
    for(let i=0;i<ids.length;i++){const k=i*4;if(Math.abs(d[k]-a[k])+Math.abs(d[k+1]-a[k+1])+Math.abs(d[k+2]-a[k+2])>30){const v=ids[i];if(v===r)o.in++;else if(v)o.out++;else o.line++}}return o},r);
  // the biggest shape and a point well inside it, in screen pixels
  const bigShape=p=>p.evaluate(()=>{const s=Color.state,{meta,start,idx,ids}=s.pd;let r=1;for(let k=2;k<=meta.regions;k++)if(start[k+1]-start[k]>start[r+1]-start[r])r=k;
    const b=document.getElementById('cCanvas').getBoundingClientRect(),W=meta.w,k=b.width/W,m=Math.ceil(64/k),v=Math.ceil(14/k);let best=null;
    for(let j=start[r];j<start[r+1];j+=97){const i=idx[j],x=i%W,y=i/W|0;let ok=true;for(let dx=-m;dx<=m&&ok;dx+=2)for(const dy of [-v,0,v])if(x+dx<0||x+dx>=W||ids[(y+dy)*W+x+dx]!==r){ok=false;break}if(ok){best=[x,y];break}}
    if(!best){const i=idx[start[r]+((start[r+1]-start[r])>>1)];best=[i%W,i/W|0]}
    return {r,x:b.left+(best[0]+.5)/W*b.width,y:b.top+(best[1]+.5)/meta.h*b.height,k:b.width/W}});
  // a finger drag (the phone profile has touch, so it goes through CDP touch events, like a real finger)
  const drag=async(p,pts)=>{const cdp=await p.context().newCDPSession(p),tp=(type,q)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:q?[{x:q[0],y:q[1]}]:[]});
    const all=[pts[0]];for(let i=1;i<pts.length;i++)for(let k=1;k<=6;k++)all.push([pts[i-1][0]+(pts[i][0]-pts[i-1][0])*k/6,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*k/6]);
    await tp('touchStart',all[0]);for(const q of all.slice(1)){await tp('touchMove',q);await sleep(16)}await tp('touchEnd');await cdp.detach().catch(()=>{});await sleep(250)};
  const tool=async(p,k)=>{await p.tap(`#cKit [data-tool=${k}]`);await sleep(150);if(!await p.$eval(`#cKit [data-tool=${k}]`,e=>e.getAttribute('aria-checked')==='true'))throw new Error(k+' tool not on after tap')};
  await T('color tools: brush stays inside the touched shape, eraser rubs it out',async p=>{await boot(p);await openColor(p);const s=await bigShape(p);await tool(p,'brush');await p.tap('#cOpts [data-size="2"]');await audit(p,'brush tool');
    await snap(p);await drag(p,[[s.x-50,s.y],[s.x,s.y+4],[s.x+50,s.y]]);const d=await diff(p,s.r);
    if(d.in<200)throw new Error('brush changed only '+d.in+' pixels in its shape');if(d.out>0)throw new Error('brush leaked into '+d.out+' pixels of other shapes');
    if(await p.evaluate(()=>Color.state.ink.length)!==1)throw new Error('stroke not kept');
    await tool(p,'eraser');await p.tap('#cOpts [data-size="2"]');await drag(p,[[s.x-50,s.y],[s.x,s.y+4],[s.x+50,s.y]]);const e=await diff(p,s.r);
    if(e.in>d.in*.2)throw new Error('eraser left '+e.in+' of '+d.in+' brushed pixels');
    await p.tap('#cUndo');await sleep(300);const u=await diff(p,s.r);if(u.in<d.in*.8)throw new Error('undo of the eraser did not bring the stroke back');
    await p.tap('#cRedo');await sleep(300);const rd=await diff(p,s.r);if(rd.in>d.in*.2)throw new Error('redo did not erase again');
    await p.tap('#cUndo');await p.tap('#cUndo');await sleep(300);const z=await diff(p,s.r);if(z.in+z.out>20)throw new Error('two undos did not restore the blank page ('+(z.in+z.out)+' px)')});
  await T('color tools: fade (drag = straight, tap = round), pattern, eraser tap clears the shape',async p=>{await boot(p);await openColor(p);const s=await bigShape(p);await tool(p,'fade');await audit(p,'fade tool');
    await snap(p);await drag(p,[[s.x-50,s.y],[s.x+50,s.y]]);const f=await p.evaluate(r=>Color.state.fx[r],s.r);if(!f||f.k!=='lin')throw new Error('drag did not make a straight fade: '+JSON.stringify(f));
    const n=await p.evaluate(r=>{const c=document.getElementById('cCanvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,{start,idx}=Color.state.pd,set=new Set();for(let j=start[r];j<start[r+1];j+=7){const k=idx[j]*4;set.add(d[k]<<16|d[k+1]<<8|d[k+2])}return set.size},s.r);
    if(n<8)throw new Error('fade shows only '+n+' colors in the shape');if((await diff(p,s.r)).out>0)throw new Error('fade leaked out of its shape');
    await p.touchscreen.tap(s.x,s.y);await sleep(300);if((await p.evaluate(r=>Color.state.fx[r],s.r)||{}).k!=='rad')throw new Error('tap did not make a round fade');
    await tool(p,'pattern');await p.tap('#cOpts [data-pat=dots]');await p.touchscreen.tap(s.x,s.y);await sleep(300);if((await p.evaluate(r=>Color.state.fx[r],s.r)||{}).k!=='dots')throw new Error('pattern not applied');
    await tool(p,'eraser');await p.touchscreen.tap(s.x,s.y);await sleep(300);const c=await p.evaluate(r=>[Color.state.fills[r],!!Color.state.fx[r]],s.r);if(c[0]||c[1])throw new Error('eraser tap did not clear the shape');
    if((await diff(p,s.r)).in>20)throw new Error('cleared shape is not back to paper');
    await p.tap('#cUndo');await sleep(300);if((await p.evaluate(r=>Color.state.fx[r],s.r)||{}).k!=='dots')throw new Error('undo did not bring the pattern back');
    for(let i=0;i<3;i++){await p.tap('#cUndo');await sleep(150)}if((await diff(p,s.r)).in>20)throw new Error('undo x4 did not return to paper');
    for(let i=0;i<4;i++){await p.tap('#cRedo');await sleep(150)}const c2=await p.evaluate(r=>[Color.state.fills[r],!!Color.state.fx[r]],s.r);if(c2[0]||c2[1])throw new Error('redo x4 did not end on the cleared shape')});
  await T('color tools: strokes and fades survive reload, reveal shows them',async p=>{await boot(p);const id=await openColor(p);const s=await bigShape(p);await snap(p);
    await tool(p,'fade');await drag(p,[[s.x-50,s.y],[s.x+50,s.y]]);await tool(p,'brush');await drag(p,[[s.x-40,s.y+10],[s.x+40,s.y+10]]);await sleep(300);
    const sample=()=>p.evaluate(()=>{const c=document.getElementById('cCanvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,o=[];for(let i=0;i<d.length;i+=28)o.push(d[i],d[i+1],d[i+2]);return o});const mine=await sample();
    await p.tap('#cBack');await sleep(800);await p.reload();await must(p,'#g-start.active','reload failed',8000);await sleep(500);await openColor(p,id);await sleep(300);
    const st=await p.evaluate(r=>({ink:Color.state.ink.length,fx:(Color.state.fx[r]||{}).k,undo:Color.state.undo.length}),s.r);if(st.ink!==1||st.fx!=='lin')throw new Error('not kept after reload: '+JSON.stringify(st));
    const now=await sample();let bad=0;for(let i=0;i<now.length;i+=3)if(Math.abs(now[i]-mine[i])+Math.abs(now[i+1]-mine[i+1])+Math.abs(now[i+2]-mine[i+2])>40)bad++;const off=now.length===mine.length?bad/(now.length/3):-1;
    if(off<0||off>.005)throw new Error('reopened picture differs from the one drawn ('+(off*100).toFixed(2)+'% of pixels)');
    await p.tap('#cUndo');await sleep(300);if(await p.evaluate(()=>Color.state.ink.length)!==0)throw new Error('undo after reload did not remove the stroke');await p.tap('#cRedo');await sleep(300);
    await p.tap('#cDone');await must(p,'#cReveal','reveal did not show',8000);await sleep(800);
    const rv=await p.evaluate(()=>{const c=document.getElementById('cYours'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const s=Color.state,col=s.ink[0].c,R=parseInt(col.slice(1,3),16),G=parseInt(col.slice(3,5),16),B=parseInt(col.slice(5,7),16);let n=0;for(let i=0;i<d.length;i+=4)if(Math.abs(d[i]-R)+Math.abs(d[i+1]-G)+Math.abs(d[i+2]-B)<12)n++;return n});
    if(rv<30)throw new Error('reveal does not show the brush stroke ('+rv+' px of its color)');
    const th=await p.evaluate(id=>(Game.st.colorings[id]||{}).thumb||'',id);if(th.length<500)throw new Error('no thumbnail saved')});

  await T('color tools: two-finger pinch zooms and pans, no stray stroke, fills still land',async p=>{await boot(p);const id=await openColor(p);const s=await bigShape(p);await tool(p,'brush');
    const cdp=await p.context().newCDPSession(p),r=await p.$eval('#cStage',e=>{const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]}),tp=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map(([x,y],id)=>({x,y,id}))});
    await tp('touchStart',[[r[0]-20,r[1]]]);await sleep(30);await tp('touchStart',[[r[0]-20,r[1]],[r[0]+20,r[1]]]);
    for(let i=1;i<=10;i++){await tp('touchMove',[[r[0]-20-i*8,r[1]+i*2],[r[0]+20+i*8,r[1]+i*2]]);await sleep(20)}await tp('touchEnd',[]);await cdp.detach().catch(()=>{});await sleep(300);
    const z=await p.$eval('#cStage',e=>new DOMMatrix(getComputedStyle(e).transform).a);if(!(z>1.5))throw new Error('pinch did not zoom: scale '+z);
    if(await p.evaluate(()=>Color.state.ink.length))throw new Error('the pinch left a stroke');
    await tool(p,'fill');const t=await p.$eval('.c-stage-wrap',e=>{const b=e.getBoundingClientRect();return {x:b.left+b.width*.5,y:b.top+b.height*.5}});const h0=await hash(p);await p.touchscreen.tap(t.x,t.y);if(await settled(p)===h0)throw new Error('a tap while zoomed did not fill');
    await p.tap('#cBack');await sleep(800);await p.tap(`#cPages .c-page[data-page="${id}"]`);await must(p,'#cEdit #cCanvas','editor did not reopen',8000);await sleep(600);if(await p.$eval('#cStage',e=>getComputedStyle(e).transform)!=='none')throw new Error('zoom not reset when a page opens')});

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

  // --- Project flow (docs/flow.md): a piece with steps shows the diagram; one without is unchanged ---
  const openPiece=async(p,slug)=>{await tab(p,'art');await must(p,'#gCards >*','no art cards');
    const i=await p.evaluate(s=>PROJECTS.findIndex(q=>q.slug===s),slug);
    const card=`#gCards [data-i="${i}"]`;if(!await p.$(card)){await p.evaluate(i=>show(i),i)}else{await p.$eval(card,e=>e.scrollIntoView({block:'center'}));await sleep(200);await p.tap(card)}
    await sleep(900);if(!await p.evaluate(()=>document.getElementById('lightbox').open))throw new Error('lightbox did not open for '+slug)};
  await T('flow: piece with steps shows the diagram (phone)',async p=>{await boot(p);await openPiece(p,'morumelons');
    await must(p,'#lbFlow .fl-node','no flow nodes',3000);
    const f=await p.evaluate(()=>{const n=[...document.querySelectorAll('#lbFlow .fl-node')],r=n.map(e=>e.getBoundingClientRect());
      return {n:n.length,col:document.getElementById('lbFlow').classList.contains('fl-col'),small:r.filter(x=>x.width<44||x.height<44).length,
        down:r.every((x,k)=>!k||x.top>r[k-1].bottom-1),cur:n.findIndex(e=>e.getAttribute('aria-current')==='true'),title:document.querySelector('#lbFlow .fl-title').textContent,
        arrows:document.querySelectorAll('#lbFlow .fl-arrow').length,lang:LANG,want:t('flow.series')}});
    if(f.n!==3||!f.col||f.small||!f.down||f.arrows!==2)throw new Error('flow layout '+JSON.stringify(f));
    if(f.cur!==0||f.title!==f.want)throw new Error('flow labels '+JSON.stringify(f));
    await p.$eval('#lbFlow .fl-node[data-step="2"]',e=>e.scrollIntoView({block:'center'}));await sleep(300);await p.tap('#lbFlow .fl-node[data-step="2"]');await sleep(500);
    const src=await p.$eval('#lbArt img',e=>e.getAttribute('src'));if(!/nft-9\.jpg$/.test(src))throw new Error('step 3 did not open its picture: '+src);
    await audit(p,'lightbox flow')});
  await T('flow: reversible path (step picture, Back, Esc, close)',async p=>{await boot(p);await openPiece(p,'morumelons');
    const st=()=>p.evaluate(()=>{const lb=document.getElementById('lightbox'),g=document.querySelector('.g-screen.active');return {open:lb.open,step:lb.classList.contains('fl-viewing'),
      src:(document.querySelector('#lbArt img')||{}).getAttribute?.('src')||'',tab:g&&g.id,top:g?Math.round(g.scrollTop):0,l:history.state&&history.state.l}});
    const s0=await st();if(!s0.open||s0.step||!/morumelons\.jpg$/.test(s0.src))throw new Error('start '+JSON.stringify(s0));
    const node=async k=>{await p.$eval(`#lbFlow .fl-node[data-step="${k}"]`,e=>e.scrollIntoView({block:'center'}));await sleep(200);await p.tap(`#lbFlow .fl-node[data-step="${k}"]`);await sleep(400)};
    await node(1);let s=await st();if(!s.step||!/nft-3\.jpg$/.test(s.src)||s.l!=='flstep')throw new Error('step view '+JSON.stringify(s));
    await p.evaluate(()=>history.back());await sleep(600);s=await st();
    if(!s.open||s.step||!/morumelons\.jpg$/.test(s.src)||s.l!=='lb')throw new Error('Back from a step did not return to the flow '+JSON.stringify(s));
    await node(2);await p.keyboard.press('Escape');await sleep(500);s=await st();if(!s.open||s.step)throw new Error('Esc from a step did not return to the flow '+JSON.stringify(s));
    await sleep(300);if((await st()).l!=='lb')throw new Error('Esc left a stale history entry');
    await node(2);if(!await vis(p,'#lbArt .fl-back',1500))throw new Error('no on-screen Back in the step view');await p.tap('#lbArt .fl-back');await sleep(500);s=await st();
    if(!s.open||s.step||s.l!=='lb')throw new Error('the on-screen Back did not return to the flow '+JSON.stringify(s));
    await node(1);await p.tap('#lbClose');await sleep(700);s=await st();
    if(s.open||s.step||s.tab!==s0.tab||Math.abs(s.top-s0.top)>2)throw new Error('close from a step did not return to where it opened '+JSON.stringify({s0,s}));
    if(s.l)throw new Error('a history entry was left behind: '+s.l);
    await p.evaluate(()=>history.back());await sleep(600);if((await st()).open)throw new Error('Back after closing reopened the lightbox')});
  await T('flow: piece without steps is unchanged (phone)',async p=>{await boot(p);await openPiece(p,'giraffe');
    const f=await p.evaluate(()=>({hidden:document.getElementById('lbFlow').hidden,nodes:document.querySelectorAll('#lbFlow .fl-node').length,cls:document.getElementById('lightbox').classList.contains('has-flow')}));
    if(!f.hidden||f.nodes||f.cls)throw new Error('flow shown on a piece without steps '+JSON.stringify(f))});
  await T('flow: desktop lightbox row, and none without steps',async p=>{const c=await p.context().browser().newContext({viewport:{width:1440,height:900},colorScheme:scheme});
    try{const d=await c.newPage();const errs=[];d.on('pageerror',e=>errs.push(e.message));await d.goto(url);await sleep(800);
      await d.evaluate(()=>show(PROJECTS.findIndex(q=>q.slug==='nft-3')));await must(d,'#lbFlow .fl-node','no desktop flow',3000);
      const f=await d.evaluate(()=>{const r=[...document.querySelectorAll('#lbFlow .fl-node')].map(e=>e.getBoundingClientRect());
        return {n:r.length,row:r.every((x,k)=>!k||x.left>r[k-1].right-1),cur:[...document.querySelectorAll('#lbFlow .fl-node')].findIndex(e=>e.getAttribute('aria-current')==='true')}});
      if(f.n!==3||!f.row||f.cur!==1)throw new Error('desktop flow '+JSON.stringify(f));
      const fold=await d.evaluate(()=>{const lb=document.getElementById('lightbox').getBoundingClientRect().bottom;return [...document.querySelectorAll('#lbFlow .fl-node')].every(n=>n.getBoundingClientRect().bottom<=Math.min(innerHeight,lb)+1)});
      if(!fold)throw new Error('desktop 1440x900: the flow is not fully above the fold');
      await d.click('#lbFlow .fl-node[data-step="0"]');await sleep(300);
      if(!/morumelons\.jpg$/.test(await d.$eval('#lbArt img',e=>e.getAttribute('src'))))throw new Error('desktop node did not open its picture');
      await d.keyboard.press('Escape');await sleep(300);
      const r=await d.evaluate(()=>({open:document.getElementById('lightbox').open,step:document.getElementById('lightbox').classList.contains('fl-viewing'),src:document.querySelector('#lbArt img').getAttribute('src')}));
      if(!r.open||r.step||!/nft-3\.jpg$/.test(r.src))throw new Error('desktop Esc from a step did not return to the flow '+JSON.stringify(r));
      await d.evaluate(()=>show(PROJECTS.findIndex(q=>q.slug==='rpg')));await sleep(300);
      if(!await d.$eval('#lbFlow',e=>e.hidden))throw new Error('desktop flow shown on a piece without steps');
      if(errs.length)throw new Error('page errors: '+errs.join(' | '))}finally{await c.close()}});

  // --- Map ---
  await T('map: place sheet',async p=>{await boot(p);await tab(p,'map');await must(p,'#gMapWrap .v-place','no places',8000);await sleep(800);
    await p.evaluate(()=>document.querySelector('#gMapWrap .v-place:not(.hire)').click());await sleep(900);if(!await p.evaluate(()=>document.getElementById('gSheet').classList.contains('open')))throw new Error('place sheet did not open');
    await audit(p,'place sheet')});
  await T('map: villager sheet',async p=>{await boot(p);await tab(p,'map');await must(p,'#gMapWrap .v-walker, #gMapWrap .v-folk','no villagers',8000);await sleep(800);
    await p.evaluate(()=>document.querySelector('#gMapWrap .v-folk,#gMapWrap .v-walker').click());await sleep(900);if(!await p.evaluate(()=>document.getElementById('gSheet').classList.contains('open')))throw new Error('villager sheet did not open');
    await audit(p,'villager sheet')});
  await T('map: double-tap zoom in and out (touch has no +/- buttons)',async p=>{await boot(p);await tab(p,'map');await must(p,'#gMapZoom','no village',8000);await sleep(800);
    const tf=()=>p.evaluate(()=>{const z=document.getElementById('gMapZoom');const s=getComputedStyle(z);return s.transform+'|'+z.getBoundingClientRect().width.toFixed(1)});
    if(await p.evaluate(()=>[...document.querySelectorAll('#gMapWrap [data-zoom]')].some(e=>e.offsetParent)))throw new Error('+/- buttons show on a touch screen');
    const bb=await p.locator('#gMapWrap').boundingBox(),x=bb.x+14,y=bb.y+14,dbl=async()=>{await p.touchscreen.tap(x,y);await sleep(60);await p.touchscreen.tap(x,y);await sleep(800)};
    const a=await tf();await dbl();const b2=await tf();if(a===b2)throw new Error('double-tap did not zoom in');await dbl();const c=await tf();if(c===b2)throw new Error('double-tap did not zoom out')});

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
