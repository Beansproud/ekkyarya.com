// Desktop portfolio: gallery, lightbox, menus, theme, contact form and motion. Its globals (catImg, ico, uiImg, artOf, show, say, confetti, reduce) are used by js/game.js.
document.documentElement.lang=LANG;   // B41: the page language follows the visitor (js/data.js picks it)
// Text in the markup: data-t="key" sets the text, data-t-aria="key" the accessible name, data-tt="key|English" uses tt().
function applyText(){
  document.querySelectorAll("[data-t]").forEach(el=>el.textContent=t(el.dataset.t));
  document.querySelectorAll("[data-t-aria]").forEach(el=>el.setAttribute("aria-label",t(el.dataset.tAria)));
  document.querySelectorAll("[data-tt]").forEach(el=>{const [k,en]=el.dataset.tt.split("|");el.textContent=tt(k,en)});
  document.querySelectorAll("[data-tta]").forEach(el=>{const [k,en]=el.dataset.tta.split("|");el.setAttribute("aria-label",tt(k,en))});
}
applyText();
// EN / ID switch (B41): remembers the choice (setLang in js/data.js) and redraws the page in that language.
const langBtns=document.querySelectorAll("[data-lang]");
const syncLang=()=>{document.documentElement.lang=LANG;langBtns.forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===LANG))};
syncLang();
// Switches in place, no reload: a short dim, the text and every screen redrawn at the dim point ("ekky:lang"), then back.
function switchLang(l){if(l===LANG)return;setLang(l);syncLang();
  const swap=()=>{applyText();dispatchEvent(new Event("ekky:lang"))};
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return swap();
  const el=document.body;el.style.transition="opacity .1s";el.style.opacity=".4";
  setTimeout(()=>{swap();el.style.opacity="1";setTimeout(()=>{el.style.transition="";el.style.opacity=""},120)},110)}
langBtns.forEach(b=>b.addEventListener("click",()=>switchLang(b.dataset.lang)));
/* ===== Install the app (B40, FEATURES.pwa). Where the browser offers it (beforeinstallprompt, Chrome), the button opens
   the browser's own install prompt. Everywhere else (iPhone, an in-app browser, Chrome before it decides to offer it) the
   button used to do nothing; now it shows how to add Try Ekky to the home screen. Hidden once running as the app. ===== */
if(feature("pwa")&&"serviceWorker" in navigator&&/^https?:/.test(location.protocol))addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
let installEvt=null;
const installed=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true||!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const showInstall=on=>document.querySelectorAll("[data-install],[data-install-row]").forEach(b=>b.hidden=!on);
if(feature("pwa"))showInstall(!installed());
addEventListener("beforeinstallprompt",e=>{if(!feature("pwa"))return;e.preventDefault();installEvt=e;showInstall(true)});
addEventListener("appinstalled",()=>{installEvt=null;showInstall(false)});
function installHelp(){
  const ua=navigator.userAgent,iOS=/iP(hone|ad|od)/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  const inApp=/\bwv\b|FBAN|FBAV|Instagram|Line\/|WhatsApp|Telegram|TikTok|musical_ly|Snapchat|Twitter|GSA\//i.test(ua);
  const key=inApp?"app.help.inapp":iOS?"app.help.ios":/Android/i.test(ua)?"app.help.android":"app.help.desktop";
  const fall={"app.help.inapp":"Open this page in Chrome or Safari first (use the menu and choose Open in browser), then install it from there.",
    "app.help.ios":"Tap the Share button in the browser bar, then choose Add to Home Screen.",
    "app.help.android":"Open the browser menu (the three dots at the top right), then tap Install app or Add to Home screen.",
    "app.help.desktop":"Click the install icon at the right of the address bar, or open the browser menu and choose Install."};
  let d=document.getElementById("installDlg");
  if(!d){document.body.insertAdjacentHTML("beforeend",`<dialog class="save-dlg" id="installDlg" aria-labelledby="installDlgT"><div class="save-in">
    <img src="assets/favicon-192.png" alt="" width="72" height="72" style="border-radius:18px">
    <h3 id="installDlgT"></h3><p class="save-hint"></p>
    <div class="save-row"><button class="btn" id="installDlgCopy" hidden></button><button class="btn ghost" id="installDlgX"></button></div></div></dialog>`);
    d=document.getElementById("installDlg");document.getElementById("installDlgX").onclick=()=>d.close();
    d.addEventListener("click",e=>{if(e.target===d)d.close()})}
  d.querySelector("h3").textContent=tt("app.help.title","Add Try Ekky to your home screen");
  d.querySelector(".save-hint").textContent=tt(key,fall[key]);
  const c=d.querySelector("#installDlgCopy");c.hidden=!inApp;c.textContent=tt("app.help.copy","Copy link");
  c.onclick=async()=>{try{await navigator.clipboard.writeText(location.href.split("#")[0]);c.textContent=t("share.copied")}catch{}};
  d.querySelector("#installDlgX").textContent=tt("ui.close","Close");
  if(!d.open)d.showModal()}
document.addEventListener("click",async e=>{if(!e.target.closest("[data-install]"))return;
  if(!installEvt)return installHelp();
  const ev=installEvt;installEvt=null;ev.prompt();let out="";try{out=(await ev.userChoice).outcome}catch{}
  if(out==="accepted")showInstall(false)});
/* ===== The classic hero image (300 KB) loads only when the classic site is showing, never under game mode ===== */
function heroArt(){if(document.body.classList.contains("game-mode"))return;const i=document.querySelector(".hero-art[data-src]");if(i){i.src=i.dataset.src;i.removeAttribute("data-src")}}
// after every deferred script (js/game.js decides game mode), so the 300 KB desktop hero never loads behind the phone game
addEventListener("DOMContentLoaded",()=>{document.documentElement.classList.remove("pre-game");heroArt()});document.addEventListener("click",e=>{if(e.target.closest("[data-classic]"))setTimeout(heroArt,0)});
/* ===== Feature switches: entry points of a switched-off feature disappear (js/features.js) ===== */
document.querySelectorAll("[data-feature]").forEach(el=>{if(!feature(el.dataset.feature))el.remove()});
// S3: Ekky's hand lettering and his photo, each behind a switch that stays off until the files arrive. Only files listed
// in assets/hand/index.json are ever requested (no 404s, no broken images). A word may have an Indonesian version,
// "<word>-id.png"; the English lettering shows only in English. The heading keeps its text as the accessible name.
if(feature("handLettering")||feature("aboutPhoto"))fetch("assets/hand/index.json").then(r=>r.ok?r.json():[]).catch(()=>[]).then(have=>{
  if(!Array.isArray(have))return;
  if(feature("handLettering"))document.querySelectorAll("[data-hand]").forEach(el=>{
    const w=el.dataset.hand,f=have.includes(w+"-"+LANG+".png")?w+"-"+LANG+".png":LANG==="en"&&have.includes(w+".png")?w+".png":"";
    if(f){el.style.backgroundImage=`url("assets/hand/${f}")`;el.classList.add("has-hand")}});
  const fig=document.querySelector(".about-photo");
  if(fig&&feature("aboutPhoto")&&have.includes("ekky.jpg")){fig.querySelector("img").src="assets/hand/ekky.jpg";fig.querySelector("img").alt=t("about.title");fig.hidden=false}});

/* ===== Procedural placeholder art ===== */
function rng(seed){return()=>((seed=Math.imul(seed^seed>>>15,seed|1)+0x6D2B79F5|0,(seed^seed>>>13)>>>0)%1e4)/1e4}
function makeArt(p){
  const r=rng(p.seed*9973), [bg,ink,a,b]=p.pal; let s="";
  for(let i=0;i<7;i++){const x=r()*400,y=r()*300,rad=10+r()*40;s+=`<circle cx="${x}" cy="${y}" r="${rad}" fill="${r()>.5?a:b}" opacity=".35"/>`}
  for(let i=0;i<5;i++){const x=20+r()*360,y=20+r()*260;s+=`<path d="M${x} ${y-8}l2.5 5.5 6 .5-4.5 4 1.5 6-5.5-3-5.5 3 1.5-6-4.5-4 6-.5z" fill="${ink}" opacity=".8"/>`}
  // a little original blob character
  const cx=150+r()*100, cy=170, w=70+r()*30;
  s+=`<ellipse cx="200" cy="262" rx="${w+30}" ry="14" fill="${ink}" opacity=".12"/>
  <path d="M${cx-w} ${cy+80} C${cx-w} ${cy-60} ${cx+w} ${cy-60} ${cx+w} ${cy+80} Z" fill="${a}" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
  <ellipse cx="${cx-18}" cy="${cy+10}" rx="7" ry="10" fill="${ink}"/><ellipse cx="${cx+18}" cy="${cy+10}" rx="7" ry="10" fill="${ink}"/>
  <circle cx="${cx-34}" cy="${cy+30}" r="8" fill="${b}" opacity=".8"/><circle cx="${cx+34}" cy="${cy+30}" r="8" fill="${b}" opacity=".8"/>
  <path d="M${cx-10} ${cy+32} q10 10 20 0" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
  <path d="M${cx-w+20} ${cy-10} l-12 -30 M${cx+w-20} ${cy-10} l12 -30" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="${cx-w+8}" cy="${cy-42}" r="8" fill="${b}" stroke="${ink}" stroke-width="4"/><circle cx="${cx+w-8}" cy="${cy-42}" r="8" fill="${b}" stroke="${ink}" stroke-width="4"/>`;
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${p.title} artwork"><rect width="400" height="300" fill="${bg}"/>${s}</svg>`;
}
// A project with `img` shows that file; if it fails to load, the drawn placeholder takes its place.
// Animated pieces (GIF) show a still poster frame (assets/work/thumb/<slug>.jpg) in grids; the lightbox plays the animation.
// S5: phones get the 400 px copies in assets/work/s/ (scripts/small-thumbs.py), about half the bytes of the 720 px set
const smallThumbs=matchMedia("(max-width:760px)").matches;
const thumbOf=p=>{const t=/\.gif$/i.test(p.img)?`assets/work/thumb/${p.slug}.jpg`:p.img;return smallThumbs?t.replace("assets/work/thumb/","assets/work/s/"):t};
function artOf(p,big){return p.img?`<img src="${big&&p.full||thumbOf(p)}" alt="${ptitle(p)}" loading="lazy" decoding="async" onload="this.classList.add('ok')" onerror="this.outerHTML=makeArt(PROJECTS[${PROJECTS.indexOf(p)}])">`:makeArt(p)}
const catImg=(c,cls="cat-ico")=>`<img class="${cls}" src="${CAT_ICON[c]}" alt="" loading="lazy">`;   // lazy: not fetched while the desktop page is hidden (game mode)
// "Fan art", "Client: X" ... from PROJECTS; Ekky's own pieces have no tag.
const tagOf=p=>p.label?`<span class="tag">${plabel(p)}</span>`:"";
// Icons: ico() uses the inline SVG set in index.html (i-* line icons, s-* palette shapes); uiImg() uses a cut-out from assets/ui/.
const ico=(id,cls="ico")=>`<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const uiImg=(name,cls="b-ico")=>`<img class="${cls}" src="assets/ui/${name}.png" alt="">`;

// S1 sketchbook look: each piece is taped on at its own fixed tilt, 1 to 2 degrees either way, seeded by its slug
// (the same angle on every visit and in every list; never random per load, never animated)
const tiltOf=p=>{let h=0;for(const c of p.slug||p.title||"")h=(h*31+c.charCodeAt(0))|0;h=Math.abs(h);return((h%2?1:-1)*(1+(h>>1)%11/10)).toFixed(1)+"deg"};
const tiltAttr=p=>` style="--tilt:${tiltOf(p)}"`;

/* ===== Gallery ===== */
const grid=document.getElementById("grid");
const renderGrid=()=>{grid.innerHTML=PROJECTS.map((p,i)=>`<button class="tile reveal" data-cat="${p.cat}" data-i="${i}"${tiltAttr(p)}>
  <span class="tile-cat">${catImg(p.cat,"")}</span><div class="art">${artOf(p)}</div><span class="view">${tt("tile.view","View")}</span>
  <div class="meta"><small>${catName(p.cat)}</small><h3>${ptitle(p)}</h3>${tagOf(p)}</div></button>`).join("")};
renderGrid();

// sidebar category names follow the language (catName); the icon goes in front
function renderCats(){document.querySelectorAll("#sideCats [data-filter]").forEach(b=>{const n=catName(b.dataset.filter);if(n)b.textContent=n});
  document.querySelectorAll("#filters [data-filter],#sideCats [data-filter]").forEach(b=>b.insertAdjacentHTML("afterbegin",catImg(b.dataset.filter)));
  document.querySelectorAll(".card[data-jump] > .ico").forEach(i=>i.innerHTML=catImg(i.parentElement.dataset.jump,""))}
renderCats();
let shown=12;
function setFilter(f,keep){
  if(!keep)shown=12;setFilter.cur=f;let n=0;
  document.querySelectorAll("#filters button").forEach(b=>b.classList.toggle("active",b.dataset.filter===f));
  document.querySelectorAll("#sideCats button").forEach(b=>b.classList.toggle("active",b.dataset.filter===f));
  grid.querySelectorAll(".tile").forEach(t=>{const m=f==="all"||t.dataset.cat===f;t.classList.toggle("hide",!m||n>=shown);t.style.animationDelay=((m?n:0)%12)*45+"ms";if(m)n++;t.classList.add("in")});
  document.getElementById("loadMore").hidden=n<=shown;
}
document.getElementById("loadMore").onclick=()=>{shown+=12;setFilter(setFilter.cur||"all",true)};
setFilter("all");
document.getElementById("filters").addEventListener("click",e=>{const b=e.target.closest("button");if(b)setFilter(b.dataset.filter)});
document.querySelectorAll("#sideCats button,[data-jump]").forEach(b=>b.addEventListener("click",e=>{
  e.preventDefault();setFilter(b.dataset.filter||b.dataset.jump);closeMenu();
  document.getElementById("work").scrollIntoView({behavior:"smooth"});
}));

/* ===== Selected work: the featured six under the hero (B08) ===== */
const renderStrip=()=>document.getElementById("featStrip").innerHTML=featuredSix().map(p=>({p,i:PROJECTS.indexOf(p)}))
  .map(({p,i})=>`<button class="feat" data-i="${i}"${tiltAttr(p)}><img src="${thumbOf(p)}" alt="" loading="lazy" decoding="async"><span>${ptitle(p)}</span></button>`).join("");
renderStrip();
document.getElementById("featStrip").addEventListener("click",e=>{const b=e.target.closest(".feat");if(b)show(+b.dataset.i)});
// the phone start screen's six (rendered by js/game.js): the same per-piece tilt on each taped cell
const gFeat=document.getElementById("gFeatured");
if(gFeat){const tape=()=>gFeat.querySelectorAll(".g-feat-cell").forEach(c=>{const b=c.querySelector("[data-i]");if(b)c.style.setProperty("--tilt",tiltOf(PROJECTS[+b.dataset.i]))});
  new MutationObserver(tape).observe(gFeat,{childList:true});tape()}

/* ===== Lightbox ===== */
const lb=document.getElementById("lightbox");let cur=0;
function visible(){return [...grid.querySelectorAll(".tile:not(.hide)")].map(t=>+t.dataset.i)}
function show(i){cur=i;const p=PROJECTS[i];
  document.getElementById("lbArt").innerHTML=artOf(p,true);
  document.getElementById("lbCat").innerHTML=catImg(p.cat,"")+catName(p.cat);
  document.getElementById("lbTitle").textContent=ptitle(p);
  document.getElementById("lbDesc").textContent=pdesc(p)||"";
  const tag=document.getElementById("lbTag");tag.textContent=plabel(p);tag.hidden=!p.label;
  document.getElementById("lbHire").textContent=t("lb.hire");
  const dl=document.getElementById("lbDl");if(dl)dl.hidden=p.kind==="fan";
  if(!lb.open)lb.showModal();}
function step(d){const v=visible(),k=v.indexOf(cur);show(v[(k+d+v.length)%v.length])}
grid.addEventListener("click",e=>{const t=e.target.closest(".tile");if(t)show(+t.dataset.i)});
document.getElementById("lbPrev").onclick=()=>step(-1);
document.getElementById("lbNext").onclick=()=>step(1);
document.getElementById("lbClose").onclick=()=>lb.close();
if(document.getElementById("lbDl"))document.getElementById("lbDl").onclick=()=>typeof Share!=="undefined"&&Share.downloadArt(PROJECTS[cur]);
// Hire from the lightbox: prefill "I saw <title>". Game mode opens its Final Quest sheet over the lightbox's screen.
document.getElementById("lbHire").onclick=()=>{const note=t("lb.prefill",{title:ptitle(PROJECTS[cur])});lb.close();
  if(document.body.classList.contains("game-mode")&&window.openHire)return openHire(note);
  const m=document.querySelector("#form [name=message]");m.value=note;document.getElementById("contact").scrollIntoView({behavior:"smooth"});setTimeout(()=>m.focus({preventScroll:true}),600)};
lb.addEventListener("click",e=>{if(e.target===lb)lb.close()});
lb.addEventListener("keydown",e=>{if(e.key==="ArrowRight")step(1);if(e.key==="ArrowLeft")step(-1)});

/* ===== Typed words ===== */
const typedWord=()=>{const el=document.getElementById("typed");if(el)el.textContent=t("hero.words").split("|")[0]};
typedWord();
(function(){const words=t("hero.words").split("|"),el=document.getElementById("typed");if(!el)return;el.textContent=words[0];
  return; // quiet pass (B43): one still word, no typing loop
  let w=0,c=words[0].length,del=true;
  (function tick(){const word=words[w];
    if(del){c--;if(c===0){del=false;w=(w+1)%words.length}}
    else{c++;if(c===words[w].length){del=true;el.textContent=words[w];return setTimeout(tick,1800)}}
    el.textContent=words[w].slice(0,c)||"\u200b";setTimeout(tick,del?55:95)})();
})();

/* ===== Reveal, active nav, to-top ===== */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach((el,i)=>{el.style.transitionDelay=(i%4)*70+"ms";io.observe(el)});
const navLinks=[...document.querySelectorAll(".nav a")];
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle("active",a.hash==="#"+e.target.id))}),{rootMargin:"-45% 0px -50% 0px"});
["about","services","work","contact"].forEach(id=>spy.observe(document.getElementById(id)));
const toTop=document.getElementById("toTop");
addEventListener("scroll",()=>toTop.classList.toggle("show",document.documentElement.scrollTop>600),{passive:true});
toTop.onclick=()=>scrollTo({top:0,behavior:"smooth"});

/* ===== Mobile menu ===== */
const burger=document.getElementById("burger");
function closeMenu(){document.body.classList.remove("menu-open");burger.setAttribute("aria-expanded","false")}
burger.onclick=()=>{const o=document.body.classList.toggle("menu-open");burger.setAttribute("aria-expanded",o)};
document.getElementById("scrim").onclick=closeMenu;
document.querySelectorAll(".sidebar a[href^='#']").forEach(a=>a.addEventListener("click",closeMenu));
addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});

/* ===== Theme ===== */
const root=document.documentElement,label=document.getElementById("themeLabel");
function isDark(){return root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches}
function applyTheme(th){if(th)root.dataset.theme=th;label.textContent=t(isDark()?"nav.light":"nav.dark")}
try{applyTheme(localStorage.getItem("theme")||(isDark()?"dark":"light"))}catch{applyTheme(isDark()?"dark":"light")}
document.getElementById("themeToggle").onclick=()=>{const t=isDark()?"light":"dark";applyTheme(t);try{localStorage.setItem("theme",t)}catch{}};

/* ===== Contact ===== */
const toast=document.getElementById("toast");
function say(m,icon){toast.textContent=m;if(icon)toast.insertAdjacentHTML("afterbegin",ico(icon));toast.classList.add("show");clearTimeout(say.t);say.t=setTimeout(()=>toast.classList.remove("show"),document.body.classList.contains("game-mode")?1500:2400)}   // D14: 1.5 s in the game
const mail=document.getElementById("mailLink");mail.textContent=CONFIG.email;mail.href="mailto:"+CONFIG.email;
// B15 safe default: a placeholder email or a link to a bare home page (no profile path) stays hidden until CONFIG is filled in.
const realLink=u=>{try{return new URL(u).pathname.replace(/\/+$/,"").length>0}catch{return false}};
document.querySelectorAll("[data-link]").forEach(a=>{const u=CONFIG.links[a.dataset.link];if(realLink(u))a.href=u;else a.remove()});
if(!CONFIG.email){document.querySelector(".mail").remove();document.querySelector('.socials a[href="#contact"]')?.remove()}
const copyMail=document.getElementById("copyMail");if(copyMail)copyMail.onclick=async()=>{try{await navigator.clipboard.writeText(CONFIG.email);say(t("hire.copied"),"i-check")}catch{say(CONFIG.email)}};
document.getElementById("form").addEventListener("submit",e=>{e.preventDefault();const f=e.target;let ok=true;
  f.querySelectorAll("[required]").forEach(i=>{const err=i.parentElement.querySelector(".err");
    const msg=i.validity.valueMissing?"This one's needed":i.validity.typeMismatch?"Hmm, that email looks off":i.validity.tooShort?"A few more words, please":"";
    err.textContent=msg;if(msg)ok=false});
  if(!ok)return say("Please check the form");
  const d=Object.fromEntries(new FormData(f));
  if(!CONFIG.email){open(hireTarget().href,"_blank","noopener");return}
  location.href=`mailto:${CONFIG.email}?subject=${encodeURIComponent(d.type+" project from "+d.name)}&body=${encodeURIComponent(d.message+"\n\n"+d.name+" ("+d.email+")")}`;
  say("Opening your email app…");confetti();
});

/* ===== Extra motion ===== */
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches, fine=matchMedia("(pointer:fine)").matches;
// loader
addEventListener("load",()=>setTimeout(()=>document.getElementById("loader").classList.add("done"),700));
setTimeout(()=>document.getElementById("loader").classList.add("done"),3000);
// split headings into letters
function splitHeads(){document.querySelectorAll(".split").forEach(el=>{
  el.setAttribute("aria-label",el.textContent);
  el.innerHTML=[...el.textContent].map((c,i)=>c===" "?" ":`<span class="ch" aria-hidden="true" style="transition-delay:${i*40}ms">${c}</span>`).join("");
})}
splitHeads();
// starfield + shooting stars
const stars=document.getElementById("stars");
stars.innerHTML=Array.from({length:40},()=>{const sz=2+Math.random()*4;
  return `<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;animation-delay:${-Math.random()*3}s;animation-duration:${2+Math.random()*3}s"></i>`}).join("")
  +[0,1,2].map(i=>`<b class="shoot" style="left:${60+i*14}%;top:${5+i*12}%;animation-delay:${i*2.3}s"></b>`).join("");
// marquee
const words=["Illustration","Character Design","Mascots","Branding","Web & UI","Social Media","Stickers","Picture Books"];
// the services ticker only moves while it is on screen (the hero keeps a single loop)
// B39: decorative motion removed (parallax, magnetic buttons, 3D tilt, click sparkles); hover keeps calm CSS transitions
// stagger chips
document.querySelectorAll(".chip").forEach((c,i)=>c.style.animationDelay=i*60+"ms");
// confetti
function confetti(){if(reduce)return;const cols=["#FFB400","#FF6B6B","#7ED9B0","#B8D5FF","#2B1342"];
  for(let i=0;i<90;i++){const c=document.createElement("i");c.className="confetti";
    c.style.cssText=`left:${Math.random()*100}vw;background:${cols[i%5]};--dx:${(Math.random()-.5)*200}px;--r:${Math.random()*900}deg;animation-duration:${1.8+Math.random()*1.6}s;animation-delay:${Math.random()*.4}s;border-radius:${i%3?2:50}%`;
    document.body.appendChild(c);setTimeout(()=>c.remove(),4000)}}

document.getElementById("year").textContent=new Date().getFullYear();

// One shared touch response, touch only and once per tap: buttons and tiles squash and bounce, drawings and villagers wiggle
// and lift, tab-bar items bounce (the Map face nods), and the drawings, Hire and the play tiles pop a few of Ekky's doodles.
(()=>{const mq=matchMedia("(prefers-reduced-motion: reduce)");
  const TAP="button,a,[data-i],.g-feat,.g-tile,.v-place,.v-walker,.v-folk,.c-st,.c-sw,.tile,.feat,.g-hint>span",
    WIG=".tile,.feat,.g-feat,.g-card,.g-mine-item,.v-walker,.v-folk",BURST=".g-feat,.g-card,.g-mine-item,.tile,.feat,.g-hire,.g-tile,.play-card",
    DOODLES=["cat","palette","planet","pen-hand","ghost"].map(n=>`assets/ui/${n}.png`);
  // warm the doodles so the first burst does not decode images mid-animation
  const warm=()=>DOODLES.forEach(u=>{const i=new Image();i.src=u;i.decode&&i.decode().catch(()=>{})});
  window.requestIdleCallback?requestIdleCallback(warm,{timeout:2500}):setTimeout(warm,1200);
  const play=(el,c)=>{el.classList.add(c);const done=()=>el.classList.remove(c);
    el.addEventListener("animationend",e=>{if(e.target===el)done()},{once:true});setTimeout(done,600)};
  function burst(x,y,big){if(document.querySelectorAll(".t-burst").length>(big?24:10))return;
    const n=big?9:5;
    for(let i=0;i<n;i++){const a=(i/n)*6.283+Math.random()*.7,d=(big?70:34)+Math.random()*(big?50:26),im=new Image();
      im.className="t-burst"+(big?" big":"");im.alt="";im.src=DOODLES[(Math.random()*DOODLES.length)|0];
      im.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-14}px;--r:${(Math.random()-.5)*60}deg`;
      document.body.appendChild(im);setTimeout(()=>im.remove(),big?680:560)}}
  // Finishing a drawing: a bigger burst from Done on touch, then the newest item in Mine pops once the next time Mine opens
  let justDone=false;
  document.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch"||mq.matches||!e.target.closest)return;
    const d=e.target.closest("#cDone");if(!d)return;justDone=true;const r=d.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,true)},{passive:true});
  document.addEventListener("click",e=>{if(!justDone||!e.target.closest||!e.target.closest('[data-tab="mine"]'))return;
    justDone=false;const it=document.querySelector("#gMineList .g-mine-item");if(it&&!mq.matches)play(it,"t-popin")});
  document.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch"||mq.matches||!e.target.closest)return;
    const el=e.target.closest(TAP);if(!el||/\bt-(squash|wiggle|bounce)\b/.test(el.className))return;
    const tab=el.matches(".g-tabs button");
    play(el,tab?"t-bounce":el.matches(WIG)?"t-wiggle":"t-squash");
    if(tab&&el.classList.contains("center")){const f=el.querySelector(".g-face");if(f)play(f,"t-nod")}
    if(el.matches(BURST))burst(e.clientX,e.clientY)},{passive:true})})();

// Language switched in place: redraw what the desktop page built with t() at load (the text in the markup is applyText()).
addEventListener("ekky:lang",()=>{const redraw=()=>{renderGrid();setFilter(setFilter.cur||"all",true);renderCats();renderStrip();typedWord();applyTheme();splitHeads();
    if(lb.open)show(cur)};
  // game mode hides this page: redraw it when the phone is idle, not in the frame that switches the language
  if(document.body.classList.contains("game-mode")&&window.requestIdleCallback)requestIdleCallback(redraw,{timeout:3000});else redraw()});

// The tab marker slides with translate, not left: game.js still writes style.left, and it is mirrored into --ix (the first
// placement is instant, so the dot never slides in from the edge on load).
(()=>{const tabs=document.querySelector(".g-tabs");if(!tabs)return;
  const sync=i=>{const l=i.style.left;if(l&&i.style.getPropertyValue("--ix")!==l)i.style.setProperty("--ix",l)};
  const hook=()=>{const i=tabs.querySelector(".g-ind");if(!i||i._ix)return;i._ix=1;i.style.transition="none";sync(i);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{i.style.transition=""}));
    new MutationObserver(()=>sync(i)).observe(i,{attributes:true,attributeFilter:["style"]})};
  hook();new MutationObserver(hook).observe(tabs,{childList:true})})();
