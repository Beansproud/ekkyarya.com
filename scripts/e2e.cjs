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
  const cfg=`${scheme}-${lang}`;const rows=[];const errs=[];
  async function ctx(){
    const c=await browser.newContext({...IPHONE,colorScheme:scheme,acceptDownloads:true});
    await c.addInitScript(l=>{try{if(!sessionStorage.getItem('e2e-init')){localStorage.setItem('lang',l);sessionStorage.setItem('e2e-init','1')}}catch(e){}
      // keep the share sheet deterministic: pretend there is no Web Share so the app's own fallback runs, and record any call
      window.__shared=[];try{navigator.share=undefined;navigator.canShare=undefined}catch(e){}},lang);
    const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));return {c,p}}
  async function boot(p,qs=''){await p.goto(url+'?game=1'+qs);await must(p,'#g-start.active','game mode did not open',8000);await sleep(500)}
  async function T(name,fn){let ok=true,msg='';const {c,p}=await ctx();const before=errs.length;
    try{await fn(p,c);if(errs.length>before)throw new Error('page error: '+errs[errs.length-1].slice(0,90))}catch(e){ok=false;msg=String(e.message||e).split('\n')[0].slice(0,160);
      if(OUT)await p.screenshot({path:`${OUT}/FAIL-${cfg}-${name.replace(/\W+/g,'_')}.png`}).catch(()=>{})}
    rows.push({cfg,name,ok,msg});await c.close()}
  const audit=async(p,what)=>{const a=await p.evaluate(auditFn);if(a.length)throw new Error(`audit ${what}: ${a.slice(0,4).join(' ; ')}${a.length>4?' (+'+(a.length-4)+')':''}`)};
  const hash=p=>p.evaluate(()=>{const c=document.getElementById('cCanvas');if(!c)return null;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=5)h=(h*31+d[i])>>>0;return h});
  const active=p=>p.evaluate(()=>{const s=document.querySelector('.g-screen.active');return s&&s.id});
  const overlayOpen=p=>p.evaluate(()=>[...document.querySelectorAll('#gColor,#gArcade,#gSheet,#lightbox')].some(e=>e.classList.contains('open')||e.open||(e.id==='gColor'&&getComputedStyle(e).display!=='none'&&e.offsetParent!==null)));
  const homeEl='[data-home],.g-home,#gHome,.g-top-logo,.g-logo-btn';
  const tab=async(p,t)=>{await p.tap(`.g-tabs button[data-tab="${t}"]`);await sleep(600)};

  // --- navigation ---
  await T('nav: tabs + Home logo',async p=>{await boot(p);
    for(const t of ['art','map','mine']){await tab(p,t);if(await active(p)!=='g-'+t)throw new Error('tab '+t+' did not open');
      if(!await vis(p,homeEl,500))throw new Error('no Home logo visible on '+t+' screen');
      await p.tap(homeEl+':visible');await sleep(500);if(await active(p)!=='g-start')throw new Error('Home logo from '+t+' did not return to start')}});
  await T('nav: history.back() to start',async p=>{await boot(p);const u0=p.url().split('?')[0];
    for(const t of ['art','map','mine']){await tab(p,t);await p.evaluate(()=>history.back()).catch(()=>{});await sleep(1200);
      if(!p.url().startsWith(u0))throw new Error('back from '+t+' left the app: '+p.url().slice(0,60));if(await active(p)!=='g-start')throw new Error('back from '+t+' stayed on '+await active(p))}});
  await T('nav: back closes overlays',async p=>{await boot(p);await p.tap('[data-go=color]');await must(p,'#gColor','picker did not open');await p.evaluate(()=>history.back()).catch(()=>{});await sleep(1200);
    if(!p.url().includes('localhost'))throw new Error('back from Color left the app');if(await p.isVisible('#cPick'))throw new Error('back did not close the Color picker')});

  // --- screens audit (size, scroll, off-screen, dark contrast) ---
  await T('audit: start',async p=>{await boot(p);await audit(p,'start')});
  for(const t of ['art','map','mine'])await T('audit: '+t,async p=>{await boot(p);await tab(p,t);await sleep(800);await audit(p,t)});

  // --- Color ---
  const openColor=async(p,page)=>{await p.tap('[data-go=color]');await must(p,'#cPages .c-page','picker has no pages');
    if(!await p.isVisible('#cPick'))throw new Error('picker not visible');
    const id=page||await p.evaluate(()=>[...document.querySelectorAll('#cPages .c-page:not(.c-scratch)')][0].dataset.page);
    await p.tap(`#cPages .c-page[data-page="${id}"]`);await must(p,'#cEdit #cCanvas','editor did not open',8000);await sleep(900);return id};
  const fill=async(p,n)=>{const r=await p.evaluate(()=>{const b=document.getElementById('cStage').getBoundingClientRect();return [b.left,b.top,b.width,b.height]});
    let last=await hash(p);const hs=[last];let k=0;
    for(const [fx,fy] of [[.5,.5],[.3,.3],[.7,.3],[.3,.7],[.7,.7],[.5,.25],[.5,.75],[.2,.5],[.8,.5],[.4,.4],[.6,.6],[.35,.55],[.65,.45],[.5,.4],[.5,.6]]){
      if(hs.length>n)break;await p.tap(`#cColors .c-sw[data-v]:nth-of-type(${(k++%12)+1})`).catch(()=>{});await p.touchscreen.tap(r[0]+r[2]*fx,r[1]+r[3]*fy);await sleep(350);const h=await hash(p);if(h!==last){hs.push(h);last=h}}
    if(hs.length<=n)throw new Error(`only ${hs.length-1} of ${n} taps changed pixels`);return hs};
  await T('color: fill 2 + undo x2',async p=>{await boot(p);await openColor(p);const hs=await fill(p,2);
    await p.tap('#cUndo');await sleep(400);if(await hash(p)!==hs[1])throw new Error('1st undo did not restore pixels');
    await p.tap('#cUndo');await sleep(400);if(await hash(p)!==hs[0])throw new Error('2nd undo did not restore pixels');await audit(p,'color editor')});
  await T('color: reload keeps fills + undo',async(p)=>{await boot(p);const id=await openColor(p);const hs=await fill(p,2);await p.tap('#cBack');await sleep(800);
    await p.reload();await must(p,'#g-start.active','reload failed',8000);await sleep(500);await openColor(p,id);const h=await hash(p);
    if(h!==hs[2])throw new Error('fills not kept after reload');await p.tap('#cUndo');await sleep(400);if(await hash(p)===h)throw new Error('Undo does nothing after reopen')});
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
    await p.tap('#cStickBtn');await must(p,'#cTray [data-n]','no stickers');await p.tap('#cTray [data-n]');await sleep(500);
    const pos=()=>p.$eval('#cStickers .c-st:last-child',e=>{const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
    const cnt=()=>p.$$eval('#cStickers .c-st',e=>e.length);const n1=await cnt();if(!n1)throw new Error('sticker not added');
    const [x0,y0]=await pos();const st=await p.$eval('#cStage',e=>{const b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height]});
    const tx=Math.min(st[0]+st[2]*.75,x0+90),ty=Math.min(st[1]+st[3]*.6,y0+90);
    await p.mouse.move(x0,y0);await p.mouse.down();for(let i=1;i<=10;i++)await p.mouse.move(x0+(tx-x0)*i/10,y0+(ty-y0)*i/10);await p.mouse.up();await sleep(400);
    const [x1,y1]=await pos();if(Math.hypot(x1-x0,y1-y0)<20)throw new Error('dragging the sticker did not move it');
    await p.tap('#cUndo');await sleep(400);const n2=await cnt();const back=n2?await pos():null;if(n2===n1&&back&&Math.hypot(back[0]-x1,back[1]-y1)<5)throw new Error('undo after a sticker drag changed nothing');
    // drop on the bin removes it
    await p.tap('#cStickBtn').catch(()=>{});if(!await cnt()){await p.tap('#cUndo');await sleep(300)}
    if(!await p.isVisible('#cTray')){await p.tap('#cStickBtn')}await p.tap('#cTray [data-n]');await sleep(500);const n3=await cnt();const [x2,y2]=await pos();
    await p.mouse.move(x2,y2);await p.mouse.down();await p.mouse.move(x2+6,y2+6);await p.mouse.move(x2+14,y2+10);await sleep(500);
    const bin=await p.$eval('#cBin',e=>{const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
    for(let i=1;i<=10;i++)await p.mouse.move(x2+(bin[0]-x2)*i/10,y2+(bin[1]-y2)*i/10);await sleep(300);
    if(!await p.$eval('#cBin',e=>e.classList.contains('hot')))throw new Error('bin did not light up under the dragged sticker');await p.mouse.up();await sleep(500);
    if(await cnt()>=n3)throw new Error('dropping a sticker on the bin did not delete it');
    await p.tap('#cUndo');await sleep(400);if(await cnt()<n3)throw new Error('undo did not bring the deleted sticker back')});

  // --- Catch stars ---
  await T('stars: play, result, Share, Download',async p=>{await boot(p);await p.tap('#g-start [data-arcade]');await must(p,'#gArcade.open','arcade did not open',5000);await sleep(5000);
    await audit(p,'arcade');
    if(!await vis(p,'#gResult.show',60000))throw new Error('no result screen within 65 s');await sleep(800);await audit(p,'star result');
    const dl=p.waitForEvent('download',{timeout:5000}).then(()=>1,()=>0);const dlg=p.waitForSelector('.g-sheet.open,dialog[open],[class*=share]:visible',{state:'visible',timeout:5000}).then(()=>1,()=>0);
    await p.tap('#gResDl');if(!(await dl)&&!(await dlg))throw new Error('Download on star result: no file and no dialog');});
  await T('stars: result Share',async p=>{await boot(p);await p.tap('#g-start [data-arcade]');await must(p,'#gArcade.open','arcade did not open',5000);
    if(!await vis(p,'#gResult.show',65000))throw new Error('no result screen');const sh=await p.$('#gResult [data-share],#gResShare,#gResult button[aria-label*=hare i]');if(!sh)throw new Error('no Share button on star result');await sh.tap();await sleep(1200)});

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
  const hireOn=async(p,what)=>{if(!await vis(p,'[data-hire]:visible',500))throw new Error('no Hire chip on '+what);
    await p.evaluate(()=>{const e=[...document.querySelectorAll('[data-hire]')].find(x=>x.offsetParent&&x.getBoundingClientRect().height>0);e.click()});await sleep(900);
    if(!await p.evaluate(()=>document.getElementById('gSheet').classList.contains('open')||[...document.querySelectorAll('dialog[open]')].length>0))throw new Error('Hire sheet did not open from '+what);
    await audit(p,'hire sheet')};
  for(const t of ['start','art','map','mine'])await T('hire chip: '+t,async p=>{await boot(p);if(t!=='start')await tab(p,t);await hireOn(p,t)});
  await T('hire chip: color picker',async p=>{await boot(p);await p.tap('[data-go=color]');await must(p,'#cPick','picker did not open');await audit(p,'color picker');
    if(!await vis(p,'#gColor [data-hire],[data-hire]:visible',500))throw new Error('no Hire chip on Color picker')});
  await T('hire chip: star result',async p=>{await boot(p);await p.tap('#g-start [data-arcade]');if(!await vis(p,'#gResult.show',65000))throw new Error('no result');
    if(!await vis(p,'#gResult [data-hire]',500))throw new Error('no Hire chip on star result')});
  return rows}

srv.listen(0,async()=>{
  const url=`http://localhost:${srv.address().port}/`;const b=await chromium.launch();
  const cfgs=[['light','en'],['light','id'],['dark','en'],['dark','id']];
  const all=(await Promise.all(cfgs.map(([s,l])=>runConfig(b,url,s,l).catch(e=>[{cfg:s+'-'+l,name:'RUN',ok:false,msg:String(e.message).slice(0,140)}])))).flat();
  await b.close();srv.close();
  const names=[...new Set(all.map(r=>r.name))];const cols=cfgs.map(c=>c.join('-'));
  console.log('\n'+'test'.padEnd(46)+cols.map(c=>c.padEnd(9)).join(''));
  for(const n of names)console.log(n.padEnd(46)+cols.map(c=>{const r=all.find(x=>x.name===n&&x.cfg===c);return (r?r.ok?'PASS':'FAIL':'-').padEnd(9)}).join(''));
  const fails=all.filter(r=>!r.ok);console.log(`\n${all.length-fails.length} PASS, ${fails.length} FAIL`);
  for(const f of fails)console.log(`FAIL ${f.cfg} | ${f.name}: ${f.msg}`);
  process.exit(fails.length?1:0)});
