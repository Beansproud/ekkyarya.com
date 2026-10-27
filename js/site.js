// Desktop portfolio: gallery, lightbox, menus, theme, contact form and motion. Its globals (catImg, ico, uiImg, artOf, show, say, confetti, reduce) are used by js/game.js.
document.documentElement.lang=LANG;   // B41: the page language follows the visitor (js/data.js picks it)
/* ===== Feature switches: entry points of a switched-off feature disappear (js/features.js) ===== */
document.querySelectorAll("[data-feature]").forEach(el=>{if(!feature(el.dataset.feature))el.remove()});

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
function artOf(p,big){return p.img?`<img src="${big&&p.full||p.img}" alt="${p.title}" loading="lazy" decoding="async" onload="this.classList.add('ok')" onerror="this.outerHTML=makeArt(PROJECTS[${PROJECTS.indexOf(p)}])">`:makeArt(p)}
const catImg=(c,cls="cat-ico")=>`<img class="${cls}" src="${CAT_ICON[c]}" alt="">`;
// "Fan art", "Client: X" ... from PROJECTS; Ekky's own pieces have no tag.
const tagOf=p=>p.label?`<span class="tag">${p.label}</span>`:"";
// Icons: ico() uses the inline SVG set in index.html (i-* line icons, s-* palette shapes); uiImg() uses a cut-out from assets/ui/.
const ico=(id,cls="ico")=>`<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const uiImg=(name,cls="b-ico")=>`<img class="${cls}" src="assets/ui/${name}.png" alt="">`;

/* ===== Gallery ===== */
const grid=document.getElementById("grid");
grid.innerHTML=PROJECTS.map((p,i)=>`<button class="tile reveal" data-cat="${p.cat}" data-i="${i}">
  <span class="tile-cat">${catImg(p.cat,"")}</span><div class="art">${artOf(p)}</div><span class="view">View</span>
  <div class="meta"><small>${CAT_NAME[p.cat]}</small><h3>${p.title}</h3>${tagOf(p)}</div></button>`).join("");

document.querySelectorAll("#filters [data-filter],#sideCats [data-filter]").forEach(b=>b.insertAdjacentHTML("afterbegin",catImg(b.dataset.filter)));
document.querySelectorAll(".card[data-jump] > .ico").forEach(i=>i.innerHTML=catImg(i.parentElement.dataset.jump,""));
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
document.getElementById("featStrip").innerHTML=featuredSix().map(p=>({p,i:PROJECTS.indexOf(p)}))
  .map(({p,i})=>`<button class="feat" data-i="${i}"><img src="${p.img}" alt="" loading="lazy" decoding="async"><span>${p.title}</span></button>`).join("");
document.getElementById("featStrip").addEventListener("click",e=>{const b=e.target.closest(".feat");if(b)show(+b.dataset.i)});

/* ===== Lightbox ===== */
const lb=document.getElementById("lightbox");let cur=0;
function visible(){return [...grid.querySelectorAll(".tile:not(.hide)")].map(t=>+t.dataset.i)}
function show(i){cur=i;const p=PROJECTS[i];
  document.getElementById("lbArt").innerHTML=artOf(p,true);
  document.getElementById("lbCat").innerHTML=catImg(p.cat,"")+CAT_NAME[p.cat];
  document.getElementById("lbTitle").textContent=p.title;
  document.getElementById("lbDesc").textContent=p.desc||"";
  const tag=document.getElementById("lbTag");tag.textContent=p.label||"";tag.hidden=!p.label;
  document.getElementById("lbHire").textContent=t("lb.hire");
  if(!lb.open)lb.showModal();}
function step(d){const v=visible(),k=v.indexOf(cur);show(v[(k+d+v.length)%v.length])}
grid.addEventListener("click",e=>{const t=e.target.closest(".tile");if(t)show(+t.dataset.i)});
document.getElementById("lbPrev").onclick=()=>step(-1);
document.getElementById("lbNext").onclick=()=>step(1);
document.getElementById("lbClose").onclick=()=>lb.close();
// Hire from the lightbox: prefill "I saw <title>". Game mode opens its Final Quest sheet over the lightbox's screen.
document.getElementById("lbHire").onclick=()=>{const note=t("lb.hire.prefill",{title:PROJECTS[cur].title});lb.close();
  if(document.body.classList.contains("game-mode")&&window.openHire)return openHire(note);
  const m=document.querySelector("#form [name=message]");m.value=note;document.getElementById("contact").scrollIntoView({behavior:"smooth"});setTimeout(()=>m.focus({preventScroll:true}),600)};
lb.addEventListener("click",e=>{if(e.target===lb)lb.close()});
lb.addEventListener("keydown",e=>{if(e.key==="ArrowRight")step(1);if(e.key==="ArrowLeft")step(-1)});

/* ===== Typed words ===== */
(function(){const words=["mascots","characters","brands","websites","stickers","smiles"],el=document.getElementById("typed");
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let w=0,c=words[0].length,del=true;
  (function tick(){const word=words[w];
    if(del){c--;if(c===0){del=false;w=(w+1)%words.length}}
    else{c++;if(c===words[w].length){del=true;el.textContent=words[w];return setTimeout(tick,1800)}}
    el.textContent=words[w].slice(0,c)||"\u200b";setTimeout(tick,del?55:95)})();
})();

/* ===== Reveal, active nav, progress, to-top ===== */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach((el,i)=>{el.style.transitionDelay=(i%4)*70+"ms";io.observe(el)});
const navLinks=[...document.querySelectorAll(".nav a")];
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle("active",a.hash==="#"+e.target.id))}),{rootMargin:"-45% 0px -50% 0px"});
["about","services","work","contact"].forEach(id=>spy.observe(document.getElementById(id)));
const prog=document.getElementById("progress"),toTop=document.getElementById("toTop");
addEventListener("scroll",()=>{const h=document.documentElement;prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight))*100+"%";toTop.classList.toggle("show",h.scrollTop>600)},{passive:true});
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
function applyTheme(t){if(t)root.dataset.theme=t;label.textContent=isDark()?"Light mode":"Dark mode"}
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
document.querySelectorAll(".split").forEach(el=>{
  el.setAttribute("aria-label",el.textContent);
  el.innerHTML=[...el.textContent].map((c,i)=>c===" "?" ":`<span class="ch" aria-hidden="true" style="transition-delay:${i*40}ms">${c}</span>`).join("");
});
// starfield + shooting stars
const stars=document.getElementById("stars");
stars.innerHTML=Array.from({length:40},()=>{const sz=2+Math.random()*4;
  return `<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;animation-delay:${-Math.random()*3}s;animation-duration:${2+Math.random()*3}s"></i>`}).join("")
  +[0,1,2].map(i=>`<b class="shoot" style="left:${60+i*14}%;top:${5+i*12}%;animation-delay:${i*2.3}s"></b>`).join("");
// marquee
const words=["Illustration","Character Design","Mascots","Branding","Web & UI","Social Media","Stickers","Picture Books"];
document.getElementById("marq").innerHTML=[...words,...words].map(w=>`<span>${w}${ico("s-sparkle","ico sep")}</span>`).join("");
// custom cursor
if(fine&&!reduce){const c=document.getElementById("cursor"),d=document.getElementById("cursorDot");let x=0,y=0,cx=0,cy=0;
  addEventListener("mousemove",e=>{x=e.clientX;y=e.clientY;d.style.transform=`translate(${x}px,${y}px)`});
  (function loop(){cx+=(x-cx)*.18;cy+=(y-cy)*.18;c.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(loop)})();
  document.addEventListener("mouseover",e=>c.classList.toggle("big",!!e.target.closest("a,button,.tile,input,select,textarea")));
}else{document.getElementById("cursor").remove();document.getElementById("cursorDot").remove()}
// B39: decorative motion removed (parallax, magnetic buttons, 3D tilt, click sparkles); hover keeps calm CSS transitions
// stagger chips
document.querySelectorAll(".chip").forEach((c,i)=>c.style.animationDelay=i*60+"ms");
// confetti
function confetti(){if(reduce)return;const cols=["#FFB400","#FF6B6B","#7ED9B0","#B8D5FF","#2B1342"];
  for(let i=0;i<90;i++){const c=document.createElement("i");c.className="confetti";
    c.style.cssText=`left:${Math.random()*100}vw;background:${cols[i%5]};--dx:${(Math.random()-.5)*200}px;--r:${Math.random()*900}deg;animation-duration:${1.8+Math.random()*1.6}s;animation-delay:${Math.random()*.4}s;border-radius:${i%3?2:50}%`;
    document.body.appendChild(c);setTimeout(()=>c.remove(),4000)}}

document.getElementById("year").textContent=new Date().getFullYear();
