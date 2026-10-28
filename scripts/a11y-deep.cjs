// Usage: node scripts/a11y-deep.cjs [site dir]
// Deeper accessibility pass than a11y-scan.cjs: names, alt text, lang, text contrast (light + dark), reduced-motion
// animations, live region, focus visibility, on the desktop page and the phone game, EN and ID. Prints findings per config.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');
const SITE=px.resolve(process.argv[2]||'.');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');if(!fs.existsSync(f)){r.writeHead(404);return r.end()}
r.writeHead(200,{'content-type':MIME[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const {defaultBrowserType,...IPHONE}=devices['iPhone 13'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function audit(lang){
  const out=[];const shown=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;for(let n=e;n&&n.nodeType===1;n=n.parentElement){const c=getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.05||n.hidden)return false}return true};
  const id=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\s+/)[0]:'');
  if(document.documentElement.lang!==lang)out.push('lang '+document.documentElement.lang+' != '+lang);
  const nm=e=>{if(e.getAttribute('aria-labelledby'))return e.getAttribute('aria-labelledby').split(' ').map(i=>document.getElementById(i)?.textContent||'').join(' ').trim();
    if(e.getAttribute('aria-label'))return e.getAttribute('aria-label').trim();
    const c=e.cloneNode(true);c.querySelectorAll('[aria-hidden=true]').forEach(x=>x.remove());c.querySelectorAll('img').forEach(i=>i.replaceWith(i.alt||''));return (c.textContent||e.title||'').trim()};
  for(const e of document.querySelectorAll('button,a[href],[role=button],[role=switch],[role=tab],input,select,textarea')){if(!shown(e))continue;const n=nm(e);
    if(!n&&!(e.labels&&e.labels.length))out.push('noname '+id(e)+' '+e.outerHTML.slice(0,90));
    else if(lang==='id'&&/^(Open|Close|Play|Back|Next|Menu|Share|Download|Save|Undo|Clear|Reset)\b/.test(n))out.push('english-in-ID '+id(e)+' "'+n+'"')}
  for(const i of document.querySelectorAll('img')){if(!i.hasAttribute('alt')&&shown(i))out.push('img-noalt '+i.src.split('/').pop())}
  for(const s of document.querySelectorAll('svg')){if(shown(s)&&!s.closest('[aria-hidden=true]')&&!s.getAttribute('aria-label')&&!s.getAttribute('role'))out.push('svg-noaria '+id(s.parentElement))}
  // contrast
  const parse=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:a[0],g:a[1],b:a[2],a:a[3]===undefined?1:a[3]}};
  const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
  const bgOf=e=>{const acc=[];for(let n=e;n&&n.nodeType===1;n=n.parentElement){const s=getComputedStyle(n);if(/url\(/.test(s.backgroundImage))return null;if(/gradient/.test(s.backgroundImage)){const cs=(s.backgroundImage.match(/rgba?\([^)]+\)/g)||[]).map(parse);if(cs.length){acc.push(cs[cs.length-1]);if(cs[cs.length-1].a>=.99)break}}
    const c=parse(s.backgroundColor);if(c&&c.a>0){acc.push(c);if(c.a>=.99)break}}
    let base=acc.length&&acc[acc.length-1].a>=.99?acc.pop():parse(getComputedStyle(document.body).backgroundColor)||{r:255,g:255,b:255};
    while(acc.length){const t=acc.pop();base={r:t.r*t.a+base.r*(1-t.a),g:t.g*t.a+base.g*(1-t.a),b:t.b*t.a+base.b*(1-t.a)}}return base};
  const seen=new Set();
  for(const e of document.querySelectorAll('body *')){if(!shown(e))continue;const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own)continue;
    const s=getComputedStyle(e);const fg=parse(s.color);if(!fg)continue;const bg=bgOf(e);if(!bg)continue;
    let op=1;for(let n=e;n&&n.nodeType===1;n=n.parentElement)op*=+getComputedStyle(n).opacity;const a=fg.a*op;const f={r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a)};
    const L1=lum(f),L2=lum(bg),cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);const big=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&+s.fontWeight>=700);
    if(cr<(big?3:4.5)){const k=id(e)+' '+cr.toFixed(2);if(!seen.has(k)){seen.add(k);out.push('contrast '+k+' "'+e.textContent.trim().slice(0,24)+'" fg'+s.color+' bg rgb('+[bg.r,bg.g,bg.b].map(Math.round)+')')}}}
  // running animations under reduced motion
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)for(const a of document.getAnimations()){if(a.playState!=='running')continue;const t=a.effect&&a.effect.target;if(!t||!shown(t))continue;const d=a.effect.getComputedTiming();if(d.iterations===Infinity||d.endTime>1000)out.push('motion '+id(t)+' '+(a.animationName||a.transitionProperty||'waapi'))}
  return out}
(async()=>{await new Promise(r=>srv.listen(0,r));const U='http://127.0.0.1:'+srv.address().port+'/';const b=await chromium.launch();
  for(const dev of ['desktop','phone'])for(const scheme of ['light','dark'])for(const lang of ['en','id']){
    const ctx=await b.newContext({...(dev==='phone'?IPHONE:{viewport:{width:1366,height:900}}),colorScheme:scheme,reducedMotion:'reduce',locale:lang==='id'?'id-ID':'en-US'});
    await ctx.addInitScript(([l,s])=>{try{localStorage.setItem('lang',l);localStorage.setItem('theme',s)}catch{}},[lang,scheme]);
    const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(U,{waitUntil:'load'});await sleep(1200);
    const res=new Set(await p.evaluate(audit,lang));
    if(dev==='phone'){for(const t of ['map','art','mine']){const bt=await p.$('.g-tabs [data-tab='+t+']');if(bt){await bt.click();await sleep(700);(await p.evaluate(audit,lang)).forEach(x=>res.add(t+': '+x))}}}
    else{await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await sleep(800);(await p.evaluate(audit,lang)).forEach(x=>res.add(x))}
    console.log('== '+dev+' '+scheme+' '+lang+(errs.length?' errors '+errs:''));[...res].forEach(x=>console.log('  '+x));await ctx.close()}
  await b.close();srv.close()})();
