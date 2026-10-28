// Usage: node scripts/neat.cjs [site dir=.] [out dir=./neat-out]   (QUICK=1: one combo only, 390x844 light EN)
// Visual QA neatness probe: measures alignment and symmetry in px on an iPhone-emulated Chromium at 360x640 and 390x844,
// light and dark, EN and ID. Prints one FINDING line for every offset over 2 px and exits 1 if there are any.
//   FINDING <screen> | <element> | <what> | <offset> px | <combo> | <screenshot>
// PARTS=base,map,admin selects what runs (default all). Covered: map zooms 1x, ~1.5x, 2x and 2x panned to two corners (labels, layer edges), the admin PIN pad and tabs, tab bar (3 icons and labels, Map face), Map face pixels (head vs circle), start grid, Hire chip vs Home button,
// every sheet header, the coloring picker cards. INFO lines are measurements that are not rules (never fail the run).
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),px=require('path');
const SITE=px.resolve(process.argv[2]||'.'),OUT=px.resolve(process.argv[3]||'neat-out');const LIMIT=2;
fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let f=px.join(SITE,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=px.join(f,'index.html');
  if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[px.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});

// ---- in-page measurement helpers (a string, so every probe shares them) ----
const LIB=`
const R=e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height,cx:(r.left+r.right)/2,cy:(r.top+r.bottom)/2}};
const vis=e=>e&&e.getClientRects().length>0;
const textR=e=>{const g=document.createRange();g.selectNodeContents(e);const r=g.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height,cx:(r.left+r.right)/2,cy:(r.top+r.bottom)/2}};
const union=rs=>{const l=Math.min(...rs.map(r=>r.l)),t=Math.min(...rs.map(r=>r.t)),r=Math.max(...rs.map(r=>r.r)),b=Math.max(...rs.map(r=>r.b));return {l,t,r,b,w:r-l,h:b-t,cx:(l+r)/2,cy:(t+b)/2}};
const spread=a=>Math.max(...a)-Math.min(...a);
const out=[];const F=(el,what,off,info)=>out.push({el,what,off:Math.round(off*10)/10,info:!!info});
`;

// tab bar: measured on the start screen, where no tab is active (an active tab lifts its icon on purpose)
const TABS=`(()=>{${LIB}
const bar=document.querySelector('.g-tabs'),bs=[...bar.querySelectorAll('button')];if(!bs.length||!vis(bar))return [{el:'tab bar',what:'not visible',off:99}];
const B=R(bar),b=bs.map(R);const glyph=x=>x.dataset.tab==='map'?x.querySelector('.g-face'):x.querySelector('.g-ico img,.g-ico svg');
const lab=x=>x.dataset.tab==='map'?x.querySelector('small'):x.querySelector(':scope>span:last-child');
const gl=bs.map(x=>R(glyph(x))),lb=bs.map(x=>textR(lab(x)));const nm=bs.map(x=>x.dataset.tab);
F('tab bar','bar left margin vs right margin',Math.abs(B.l-(innerWidth-B.r)));
F('tab bar','tab spacing: gap art-map vs map-mine (centres)',Math.abs((b[1].cx-b[0].cx)-(b[2].cx-b[1].cx)));
F('tab bar','tab widths differ',spread(b.map(r=>r.w)));
F('tab bar','Map tab centre vs bar centre',Math.abs(b[1].cx-B.cx));
F('tab bar','Map face centre vs its tab centre',Math.abs(gl[1].cx-b[1].cx));
F('tab bar','Map face centre vs bar centre',Math.abs(gl[1].cx-B.cx));
nm.forEach((n,i)=>{F('tab bar','icon centre vs its tab centre ('+n+')',Math.abs(gl[i].cx-b[i].cx));F('tab bar','label centre vs its tab centre ('+n+')',Math.abs(lb[i].cx-b[i].cx))});
F('tab bar','icon spacing: art-map vs map-mine (icon centres)',Math.abs((gl[1].cx-gl[0].cx)-(gl[2].cx-gl[1].cx)));
F('tab bar','label spacing: art-map vs map-mine (label centres)',Math.abs((lb[1].cx-lb[0].cx)-(lb[2].cx-lb[1].cx)));
F('tab bar','labels not on one baseline (bottoms of the 3 labels)',spread(lb.map(r=>r.b)));
F('tab bar','Art and Mine icons not on one line (icon centres y)',Math.abs(gl[0].cy-gl[2].cy));
F('tab bar','icon-to-label gap differs, Art vs Mine',Math.abs((lb[0].t-gl[0].b)-(lb[2].t-gl[2].b)));
F('tab bar','Art and Mine icon sizes differ',Math.max(Math.abs(gl[0].w-gl[2].w),Math.abs(gl[0].h-gl[2].h)));
return out})()`;

// start grid: the featured row (each cell's tilt is switched off while measuring: the polaroids are rotated on purpose) and the game tiles
const START=`(()=>{${LIB}
const cells=[...document.querySelectorAll('#gFeatured .g-feat-cell')];const keep=cells.map(c=>c.style.transform);cells.forEach(c=>{c.style.transition='none';c.style.transform='none'});
const fe=cells.filter(vis).map(R);cells.forEach((c,i)=>c.style.transform=keep[i]);
const ti=[...document.querySelectorAll('.g-tiles .g-tile')].filter(vis).map(R);
const rows=a=>{const m=new Map();a.forEach(r=>{const k=Math.round(r.t/4);m.set(k,[...(m.get(k)||[]),r])});return [...m.values()]};
const grid=(name,a)=>{if(a.length<2)return;const u=union(a);
  F(name,'left gutter vs right gutter',Math.abs(u.l-(innerWidth-u.r)));
  rows(a).forEach((row,i)=>{if(row.length<2)return;const g=row.slice(1).map((r,k)=>r.l-row[k].r);
    F(name,'row '+(i+1)+': column gaps differ',spread(g));F(name,'row '+(i+1)+': tiles not top aligned',spread(row.map(r=>r.t)));F(name,'row '+(i+1)+': tile widths differ',spread(row.map(r=>r.w)));F(name,'row '+(i+1)+': tile heights differ',spread(row.map(r=>r.h)))});
  const rs=rows(a);if(rs.length>1){const v=rs.slice(1).map((r,k)=>r[0].t-rs[k][0].b);F(name,'row gaps differ',spread(v));F(name,'column lefts differ between rows',spread(rs.map(r=>r[0].l)))}
  const cols=a.filter(r=>Math.abs(r.t-a[0].t)<4);if(cols.length>1)F(name,'column pitch differs',spread(cols.slice(1).map((r,k)=>r.l-cols[k].l)))};
grid('start featured row',fe);grid('start tiles',ti);
if(fe.length&&ti.length){const a=union(fe),c=union(ti);F('start grid','featured left edge vs tiles left edge',Math.abs(a.l-c.l));F('start grid','featured right edge vs tiles right edge',Math.abs(a.r-c.r));
  const g1=fe.length>1?fe[1].l-fe[0].r:null,g2=ti.length>1?ti[1].l-ti[0].r:null;if(g1!=null&&g2!=null)F('start grid','featured column gap vs tiles column gap',Math.abs(g1-g2))}
const logo=document.querySelector('#g-start .g-logo,#g-start .g-logo-text');if(logo&&fe.length)F('start grid','logo left edge vs grid left edge',Math.abs(R(logo).l-union(fe).l));
const hd=document.querySelector('#g-start .g-row-head');if(hd&&fe.length)F('start grid','row heading left edge vs grid left edge',Math.abs(R(hd).l-union(fe).l));
const chip=document.querySelector('.g-hire-pin');if(chip&&vis(chip)&&fe.length){F('start grid','Hire chip right margin vs grid right gutter',Math.abs((innerWidth-R(chip).r)-(innerWidth-union(fe).r)))}
return out})()`;

// Hire chip vs Home button (both visible on Map, Art and Mine)
const CHIP=`(()=>{${LIB}
const c=document.querySelector('.g-hire-pin'),h=document.querySelector('.g-home');if(!vis(c)||!vis(h))return [{el:'Hire chip',what:'chip or Home button not visible',off:99}];
const C=R(c),H=R(h);
F('Hire chip','top margin vs Home button top margin',Math.abs(C.t-H.t));
F('Hire chip','right margin vs Home button left margin',Math.abs((innerWidth-C.r)-H.l));
F('Hire chip','height vs Home button height',Math.abs(C.h-H.h));
F('Hire chip','vertical centre vs Home button centre',Math.abs(C.cy-H.cy));
return out})()`;

// sheet header: args {sheet,title,close}
const HEADER=(a)=>`(()=>{${LIB}
const sh=document.querySelector(${JSON.stringify(a.sheet)}),ti=document.querySelector(${JSON.stringify(a.title)}),x=document.querySelector(${JSON.stringify(a.close)});
if(!vis(sh)||!vis(ti)||!vis(x))return [{el:${JSON.stringify(a.name)},what:'header not visible',off:99}];
const S=R(sh),X=R(x),kids=[...ti.children].filter(vis).map(R),t=textR(ti);const U=union([...kids,t]);const cs=getComputedStyle(ti);
const n=${JSON.stringify(a.name)};
F(n,'title vertical centre vs close button centre',Math.abs(U.cy-X.cy));
F(n,'close button top inset vs right inset',Math.abs((X.t-S.t)-(S.r-X.r)));
F(n,'title overlaps the close button',Math.max(0,U.r-X.l));
F(n,'close button size not 44 px',Math.max(Math.abs(X.w-44),Math.abs(X.h-44)));
const centred=cs.textAlign==='center'||cs.justifyContent==='center';
if(!centred)F(n,'close button right inset vs title left inset',Math.abs((S.r-X.r)-(U.l-S.l)));
const free=(S.r-S.l);
if(centred)F(n,'title not centred in the sheet',Math.abs(U.cx-(S.l+S.r)/2));
else F(n,'title is left aligned (centre offset from sheet centre, not a rule)',Math.abs(U.cx-(S.l+S.r)/2),true);
return out})()`;

// coloring picker cards
const PICK=`(()=>{${LIB}
const cs=[...document.querySelectorAll('#cPages .c-page')].filter(vis).map(R);if(cs.length<2)return [{el:'picker cards',what:'fewer than 2 cards',off:99}];
const n='picker cards';const u=union(cs);
F(n,'left gutter vs right gutter',Math.abs(u.l-(innerWidth-u.r)));
F(n,'card widths differ',spread(cs.map(r=>r.w)));F(n,'card heights differ',spread(cs.map(r=>r.h)));
const rows=[];cs.forEach(r=>{const k=rows.find(q=>Math.abs(q[0].t-r.t)<4);k?k.push(r):rows.push([r])});
rows.forEach((row,i)=>{if(row.length>1)F(n,'row '+(i+1)+': column gap differs from the other rows',Math.abs((row[1].l-row[0].r)-(rows[0][1]?rows[0][1].l-rows[0][0].r:row[1].l-row[0].r)))});
const gaps=rows.flatMap(r=>r.length>1?[r[1].l-r[0].r]:[]);if(gaps.length)F(n,'column gap vs row gap',Math.abs(gaps[0]-(rows.length>1?rows[1][0].t-rows[0][0].b:gaps[0])));
if(rows.length>2)F(n,'row gaps differ',spread(rows.slice(1).map((r,k)=>r[0].t-rows[k][0].b)));
const imgs=[...document.querySelectorAll('#cPages .c-page img')].filter(vis).map(R);if(imgs.length>1){F(n,'thumbnail sizes differ',Math.max(spread(imgs.map(r=>r.w)),spread(imgs.map(r=>r.h))))}
return out})()`;

// Map face: where the head sits in the mint circle, from rendered pixels. Runs on a PNG of the face at 4x.
const FACE_PIX=`(async(d)=>{
const img=new Image();img.src='data:image/png;base64,'+d.b64;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
const s=img.width/d.clip.w,cx=(d.cx-d.clip.x)*s,cy=(d.cy-d.clip.y)*s,rin=(d.r-d.border)*s;const px=x.getImageData(0,0,img.width,img.height).data;
const bg=d.bg,dist=(i)=>Math.abs(px[i]-bg[0])+Math.abs(px[i+1]-bg[1])+Math.abs(px[i+2]-bg[2]);
const pts=[];let top=null,bot=null,lef=null,rig=null;
for(let y=0;y<img.height;y++)for(let xx=0;xx<img.width;xx++){const dx=xx+.5-cx,dy=y+.5-cy;if(Math.hypot(dx,dy)>rin-.75*s)continue;const i=(y*img.width+xx)*4;if(px[i+3]<200||dist(i)<60)continue;
  pts.push([dx,dy]);if(!top||dy<top[1])top=[dx,dy];if(!bot||dy>bot[1])bot=[dx,dy];if(!lef||dx<lef[0])lef=[dx,dy];if(!rig||dx>rig[0])rig=[dx,dy]}
if(pts.length<50)return {err:'no head pixels found ('+pts.length+')'};
// minimum enclosing circle (iterative Welzl)
const sh=pts.slice();for(let i=sh.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[sh[i],sh[j]]=[sh[j],sh[i]]}
const circ2=(a,b)=>({x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,r:Math.hypot(a[0]-b[0],a[1]-b[1])/2});
const circ3=(a,b,c)=>{const A=b[0]-a[0],B=b[1]-a[1],C=c[0]-a[0],D=c[1]-a[1],E=A*(a[0]+b[0])+B*(a[1]+b[1]),F=C*(a[0]+c[0])+D*(a[1]+c[1]),G=2*(A*(c[1]-b[1])-B*(c[0]-b[0]));
  if(Math.abs(G)<1e-9)return null;const X=(D*E-B*F)/G,Y=(A*F-C*E)/G;return {x:X,y:Y,r:Math.hypot(a[0]-X,a[1]-Y)}};
const inC=(c,p)=>c&&Math.hypot(p[0]-c.x,p[1]-c.y)<=c.r+1e-6;
let C={x:sh[0][0],y:sh[0][1],r:0};
for(let i=1;i<sh.length;i++){if(inC(C,sh[i]))continue;C={x:sh[i][0],y:sh[i][1],r:0};
  for(let j=0;j<i;j++){if(inC(C,sh[j]))continue;C=circ2(sh[i],sh[j]);
    for(let k=0;k<j;k++){if(inC(C,sh[k]))continue;C=circ3(sh[i],sh[j],sh[k])||C}}}
const far=Math.max(...pts.map(p=>Math.hypot(p[0],p[1])));
return {ox:C.x/s,oy:C.y/s,R:C.r/s,rin:rin/s,far:far/s,gap:(rin-far)/s,n:pts.length,
 ext:{top:(rin-Math.hypot(top[0],top[1]))/s,bottom:(rin-Math.hypot(bot[0],bot[1]))/s,left:(rin-Math.hypot(lef[0],lef[1]))/s,right:(rin-Math.hypot(rig[0],rig[1]))/s},
 bbox:{dy:(-top[1]-bot[1])/2/s,dx:(-lef[0]-rig[0])/2/s,up:-top[1]/s,down:bot[1]/s,left:-lef[0]/s,right:rig[0]/s}}})`;


// Map at one zoom: labels (clipped, hidden, overlapping, centred on their place) and the layers (sky covers the frame, no island cut at an edge).
// Returns {items, widths}; widths are compared across zooms (labels keep their 1x size).
const MAP=(z)=>`(()=>{${LIB}
const W=document.getElementById('gMapWrap'),L=document.getElementById('gMapZoom');if(!W||!vis(W))return {items:[{el:'map',what:'not visible',off:99}],widths:{}};
const w=R(W),z=${JSON.stringify(z)},n='map '+z;const sc=new DOMMatrix(getComputedStyle(L).transform).a;
const cover=[...document.querySelectorAll('.g-tabs,.g-hire-pin,.g-home')].filter(vis).map(e=>[e.className.includes('tabs')?'the tab bar':e.className.includes('home')?'the Home button':'the Hire chip',R(e)]);
const ix=(a,b)=>Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l)),iy=(a,b)=>Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t));
const labs=[...document.querySelectorAll('#gMapWrap .v-label')].filter(vis),widths={};
labs.forEach((e,i)=>{const r=R(e),nm=(e.dataset.place||i),vw=ix(r,w)*iy(r,w);widths[nm]=r.w;
  const pb=document.querySelector('#gMapWrap .v-place[data-place="'+nm+'"]'),pr=pb&&R(pb),seen=pr&&pr.cx>w.l&&pr.cx<w.r&&pr.cy>w.t&&pr.cy<w.b;   // only labels of places that are in view
  const over=Math.max(0,w.l-r.l,r.r-w.r,w.t-r.t,r.b-w.b);if(seen&&vw>0&&over>0)F(n,'label "'+e.textContent+'" sliced by the map frame (its place is in view)',over);
  cover.forEach(([cn,c])=>{const a=Math.min(ix(r,c),iy(r,c));if(seen&&ix(r,c)>0&&iy(r,c)>0)F(n,'label "'+e.textContent+'" under '+cn+' (its place is in view)',a)});
  labs.slice(i+1).forEach(o=>{const q=R(o);if(ix(r,q)>0&&iy(r,q)>0)F(n,'labels "'+e.textContent+'" and "'+o.textContent+'" overlap',Math.min(ix(r,q),iy(r,q)))});
  const pl=document.querySelector('#gMapWrap .v-place[data-place="'+nm+'"]');if(pl&&z==='1x')F(n,'label "'+e.textContent+'" centre vs its place centre',Math.abs(r.cx-R(pl).cx))});
const sky=document.querySelector('#gMapWrap .v-skyimg');
if(sky){const S=R(sky);F(n,'sky layer leaves a bare strip at the left of the frame',Math.max(0,S.l-w.l));F(n,'sky layer leaves a bare strip at the right of the frame',Math.max(0,w.r-S.r));F(n,'sky layer leaves a bare strip at the top of the frame',Math.max(0,S.t-w.t));F(n,'sky layer leaves a bare strip at the bottom of the frame',Math.max(0,w.b-S.b))}
else F(n,'no sky layer',99);
// an island is cut when opaque pixels touch its image border and that border is inside the frame
const edges=[];
document.querySelectorAll('#gMapWrap img.v-isle:not(.v-ufo)').forEach(im=>{if(!im.complete||!im.naturalWidth)return;const r=R(im);const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);
  const nm=(im.getAttribute('src')||'').split('/').pop(),sx=r.w/c.width,sy=r.h/c.height;
  const run=(px,py,dx,dy,len)=>{let k=0;for(let i=0;i<len;i++){if(x.getImageData(px+dx*i,py+dy*i,1,1).data[3]>40)k++}return k};
  const sides=[['left',0,0,0,1,c.height,r.l>w.l+1&&r.l<w.r-1,sy],['right',c.width-1,0,0,1,c.height,r.r>w.l+1&&r.r<w.r-1,sy],['top',0,0,1,0,c.width,r.t>w.t+1&&r.t<w.b-1,sx],['bottom',0,c.height-1,1,0,c.width,r.b>w.t+1&&r.b<w.b-1,sx]];
  sides.forEach(([nmS,px,py,dx,dy,len,inside,k])=>{if(!inside)return;const v=run(px,py,dx,dy,len)*k;F(n,'island "'+nm+'" has a flat cut at its '+nmS+' edge (opaque run on the image border, a hard edge unless covered)',v)})});
F(n,'map scale is '+sc.toFixed(2)+'x (info)',0,true);
return {items:out,widths}})()`;

// PIN pad (opened by the real door: 7 taps on the logo)
const PAD=`(()=>{${LIB}
const d=document.querySelector('dialog.adm-pad'),c=d&&d.querySelector('.adm-card'),n='PIN pad';if(!d||!vis(c))return [{el:n,what:'not visible',off:99}];
const C=R(c);F(n,'card centre vs screen centre (x)',Math.abs(C.cx-innerWidth/2));F(n,'card centre vs screen centre (y)',Math.abs(C.cy-innerHeight/2));
F(n,'card spills off the screen',Math.max(0,-C.l,-C.t,C.r-innerWidth,C.b-innerHeight));
const keys=[...c.querySelectorAll('.adm-keys button')].filter(vis).map(R);
F(n,'key sizes differ',Math.max(spread(keys.map(r=>r.w)),spread(keys.map(r=>r.h))));F(n,'key smaller than 44 px',Math.max(0,44-Math.min(...keys.map(r=>Math.min(r.w,r.h)))));
const rows=[];keys.forEach(r=>{const q=rows.find(o=>Math.abs(o[0].t-r.t)<4);q?q.push(r):rows.push([r])});
rows.forEach((row,i)=>{if(row.length>1)F(n,'row '+(i+1)+': column gaps differ',spread(row.slice(1).map((r,k)=>r.l-row[k].r)))});
const gaps=rows.flatMap(r=>r.slice(1).map((q,k)=>q.l-r[k].r)),vg=rows.slice(1).map((r,k)=>r[0].t-rows[k][0].b);
F(n,'column gap vs row gap',Math.abs((gaps[0]||0)-(vg[0]||0)));if(vg.length>1)F(n,'row gaps differ',spread(vg));
F(n,'columns not aligned between rows',spread(rows.filter(r=>r.length===3).map(r=>r[0].l)));
const ku=union(keys);F(n,'key grid centre vs card centre',Math.abs(ku.cx-C.cx));
const dots=[...c.querySelectorAll('.adm-dots i')].filter(vis).map(R);if(dots.length>1){const du=union(dots);F(n,'dots centre vs card centre',Math.abs(du.cx-C.cx));F(n,'dot gaps differ',spread(dots.slice(1).map((r,k)=>r.l-dots[k].r)));F(n,'dot sizes differ',spread(dots.map(r=>r.w)))}
const h=c.querySelector('h2'),p=c.querySelector('p'),x=c.querySelector('.adm-x');
if(h)F(n,'title centre vs card centre',Math.abs(textR(h).cx-C.cx));if(p&&p.textContent.trim())F(n,'hint centre vs card centre',Math.abs(textR(p).cx-C.cx));
if(x){const X=R(x);F(n,'close button centre vs card centre',Math.abs(X.cx-C.cx));F(n,'close button smaller than 44 px',Math.max(0,44-X.h));F(n,'close button width vs key grid width',Math.abs(X.w-ku.w),true)}
return out})()`;

// Admin shell: top bar, tabs, content gutters. Run once per tab.
const ADM=(tab)=>`(()=>{${LIB}
const root=document.getElementById('adminRoot'),n='admin '+${JSON.stringify(tab)};if(!root||!vis(root))return [{el:n,what:'not visible',off:99}];
const top=root.querySelector('.adm-top'),bs=[...top.children].filter(vis).map(R);
F(n,'top bar items not on one centre line',spread(bs.map(r=>r.cy)));F(n,'top bar left gutter vs right gutter',Math.abs(bs[0].l-(innerWidth-bs[bs.length-1].r)));
F(n,'top bar buttons shorter than 44 px',Math.max(0,44-Math.min(...[...top.querySelectorAll('button')].filter(vis).map(e=>R(e).h))));
const tb=[...root.querySelectorAll('.adm-tabs button')].filter(vis),tr=tb.map(R);
if(tr.length>1){F(n,'tab heights differ',spread(tr.map(r=>r.h)));F(n,'tab gaps differ',spread(tr.slice(1).map((r,k)=>r.l-tr[k].r)));F(n,'tab smaller than 44 px high',Math.max(0,44-Math.min(...tr.map(r=>r.h))));F(n,'tabs not on one line',spread(tr.map(r=>r.t)))}
F(n,'first tab left edge vs top bar left edge',Math.abs(tr[0].l-bs[0].l));
tb.forEach(e=>{if(e.scrollWidth>e.clientWidth+1)F(n,'tab text clipped ("'+e.textContent+'")',e.scrollWidth-e.clientWidth)});
const m=root.querySelector('.adm-main');F(n,'content scrolls sideways',Math.max(0,m.scrollWidth-m.clientWidth));
const mr=R(m);const spill=[...m.querySelectorAll('*')].filter(vis).map(e=>R(e).r-mr.r).filter(v=>v>1);F(n,'an element spills past the right edge of the content',spill.length?Math.max(...spill):0);
const kids=[...m.querySelectorAll(':scope>*, :scope>*>*')].filter(vis).filter(e=>R(e).w>mr.w*.6).map(R);if(kids.length){const u=union(kids);F(n,'content left gutter vs right gutter',Math.abs((u.l-mr.l)-(mr.r-u.r)))}
const small=[...m.querySelectorAll('button,a,input,select,textarea')].filter(vis).map(e=>[e,R(e)]).filter(([e,r])=>r.h<43.5);if(small.length)F(n,'control under 44 px high ('+(small[0][0].textContent||small[0][0].name||small[0][0].tagName).trim().slice(0,24)+')',44-Math.min(...small.map(([e,r])=>r.h)));
return out})()`;

const rnd=v=>Math.round(v*10)/10;
const all=[];   // {screen, el, what, off, combo, shot}

async function settle(p){await p.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect&&a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))).catch(()=>{});await p.waitForTimeout(250)}
async function shot(p,name){await settle(p);const f=px.join(OUT,name+'.png');await p.screenshot({path:f});return f}
function record(items,screen,combo,shotPath){for(const it of items){all.push({screen,el:it.el,what:it.what,off:it.off,info:it.info,combo,shot:shotPath})}}


async function mapPart(p,combo,tag){
  await p.evaluate(()=>Game.go('map'));await p.waitForTimeout(2500);
  const lw={};
  const step=async(z,name)=>{await p.waitForTimeout(500);const sh=await shot(p,`map-${name}-${tag}`);const r=await p.evaluate(MAP(z));record(r.items,'map '+z,combo,sh);lw[z]=r.widths;return r};
  await step('1x','1x');
  // about 1.5x: four ctrl+wheel steps of 1.1 (1.46x)
  await p.evaluate(()=>{const W=document.getElementById('gMapWrap'),r=W.getBoundingClientRect();
    for(let i=0;i<4;i++){W.dispatchEvent(new WheelEvent('wheel',{ctrlKey:true,deltaY:-1,clientX:r.left+r.width/2,clientY:r.top+r.height/2,bubbles:true,cancelable:true}))}});
  await step('1.5x','1p5x');
  await p.evaluate(()=>document.querySelector('#gMapWrap [data-zoom="1"]').click());await p.waitForTimeout(300);
  await step('2x','2x');
  // pan the 2x map to its corners, where the layer edges would show
  const box=await p.evaluate(()=>{const r=document.getElementById('gMapWrap').getBoundingClientRect();return {l:r.left,t:r.top,w:r.width,h:r.height}});
  // pointer events dispatched directly (a mouse drag does not reach the map's pointer handlers in the touch emulation)
  const drag=async(dx,dy)=>{await p.evaluate(([dx,dy])=>{const W=document.getElementById('gMapWrap'),r=W.getBoundingClientRect(),x0=r.left+r.width/2,y0=r.top+r.height/2;
      const ev=(t,x,y)=>W.dispatchEvent(new PointerEvent(t,{pointerId:7,isPrimary:true,pointerType:'touch',clientX:x,clientY:y,bubbles:true,cancelable:true}));
      ev('pointerdown',x0,y0);for(let i=1;i<=8;i++)ev('pointermove',x0+dx*i/8,y0+dy*i/8);ev('pointerup',x0+dx,y0+dy)},[dx,dy]);await p.waitForTimeout(400)};
  await drag(2000,2000);await step('2x top-left','2x-tl');
  await drag(-4000,-4000);await step('2x bottom-right','2x-br');
  // labels keep their 1x size at every zoom
  for(const z of ['1.5x','2x','2x top-left','2x bottom-right'])for(const k of Object.keys(lw['1x']||{})){if(lw[z]&&lw[z][k]!=null)record([{el:'map '+z,what:'label "'+k+'" width changes from its 1x width',off:Math.abs(lw[z][k]-lw['1x'][k])}],'map '+z,combo,px.join(OUT,`map-${z.replace(/[ .]/g,'-')}-${tag}.png`))}
  await p.evaluate(()=>{const b=document.querySelector('#gMapWrap [data-zoom="-1"]');if(b){b.click();b.click()}});await p.waitForTimeout(300)}

async function adminPart(p,combo,tag){
  await p.evaluate(()=>Game.go('start'));await p.waitForTimeout(700);
  // the real door: 7 taps on the logo
  await p.evaluate(()=>{const e=document.querySelector('#g-start .g-logo,#g-start .g-logo-text');for(let i=0;i<7;i++)e.click()});await p.waitForTimeout(1200);
  const ps=await shot(p,`pin-${tag}`);record(await p.evaluate(PAD),'PIN pad',combo,ps);
  await p.keyboard.press('Escape');await p.waitForTimeout(300);
  // past the PIN (the PIN itself is never used here): unlock the already loaded admin and show the shell
  const ok=await p.evaluate(()=>new Promise(res=>{if(!window.Admin)return res(false);Admin.unlocked=true;if(Admin.shell){Admin.shell.show();return res(true)}const sc=document.createElement('script');sc.src='js/admin-shell.js';sc.onload=()=>{Admin.shell&&Admin.shell.show();res(!!Admin.shell)};sc.onerror=()=>res(false);document.head.appendChild(sc)}));if(!ok){record([{el:'admin',what:'shell did not open',off:99}],'admin',combo,ps);return}await p.waitForTimeout(1500);
  const tabs=await p.evaluate(()=>[...document.querySelectorAll('#adminRoot .adm-tabs button[data-tab]')].map(b=>b.dataset.tab));
  for(const t of tabs){await p.evaluate(x=>document.querySelector(`#adminRoot .adm-tabs [data-tab="${x}"]`).click(),t);await p.waitForTimeout(900);
    const sh=await shot(p,`admin-${t}-${tag}`);record(await p.evaluate(ADM(t)),'admin '+t,combo,sh)}
  await p.evaluate(()=>{const b=document.querySelector('#adminRoot [data-adm="close"]');if(b)b.click()});await p.waitForTimeout(500)}

(async()=>{await new Promise(r=>srv.listen(0,r));const url=`http://localhost:${srv.address().port}/`;const b=await chromium.launch();
const sizes=process.env.QUICK?[[390,844]]:[[360,640],[390,844]],schemes=process.env.QUICK?['light']:['light','dark'],langs=process.env.QUICK?['en']:['en','id'];
const errs=[];const PARTS=(process.env.PARTS||'base,map,admin').split(',');const has=k=>PARTS.includes(k);
for(const [w,h] of sizes)for(const scheme of schemes)for(const L of langs){
  const combo=`${w}x${h} ${scheme} ${L}`,tag=`${w}x${h}-${scheme}-${L}`;
  const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:w,height:h},screen:{width:w,height:h},deviceScaleFactor:4,colorScheme:scheme});
  await ctx.addInitScript(l=>{try{localStorage.setItem('lang',l);localStorage.setItem('seen','1')}catch(e){}},L);
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(combo+' '+e.message));
  await p.goto(url);await p.waitForTimeout(3500);
  if(has('base')){
  // start screen: tab bar, start grid, Map face
  await p.evaluate(()=>scrollTo(0,0));const sShot=await shot(p,`start-${tag}`);
  record(await p.evaluate(TABS),'start',combo,sShot);
  record(await p.evaluate(START),'start',combo,sShot);
  // Map face pixels (render at 4x: this context already is 4x)
  const fi=await p.evaluate(()=>{const f=document.querySelector('.g-tabs .g-face');if(!f||!f.getClientRects().length)return null;const r=f.getBoundingClientRect(),cs=getComputedStyle(f);
    return {x:r.left,y:r.top,w:r.width,h:r.height,border:parseFloat(cs.borderTopWidth),bg:cs.backgroundColor.match(/\d+/g).slice(0,3).map(Number)}});
  if(fi){const pad=3,clip={x:fi.x-pad,y:fi.y-pad,width:fi.w+pad*2,height:fi.h+pad*2};
    const fShot=px.join(OUT,`face-${tag}.png`);const buf=await p.screenshot({clip,path:fShot});
    const r=await p.evaluate(async(a)=>{const fn=eval(a.fn);return fn(a.d)},{fn:FACE_PIX,d:{b64:buf.toString('base64'),clip:{x:clip.x,y:clip.y,w:clip.width},cx:fi.x+fi.w/2,cy:fi.y+fi.h/2,r:fi.w/2,border:fi.border,bg:fi.bg}});
    if(r.err)record([{el:'Map face',what:r.err,off:99}],'start',combo,fShot);
    else{const it=[
      {el:'Map face',what:'head enclosing-circle centre off the circle centre (x, y: '+rnd(r.ox)+', '+rnd(r.oy)+')',off:Math.hypot(r.ox,r.oy)},
      {el:'Map face',what:'head vertical: gap above vs below (top gap '+rnd(r.bbox.up)+' px from centre, bottom '+rnd(r.bbox.down)+')',off:Math.abs(r.bbox.dy*2),info:true},
      {el:'Map face',what:'head horizontal: left vs right (left '+rnd(r.bbox.left)+', right '+rnd(r.bbox.right)+')',off:Math.abs(r.bbox.dx*2),info:true},
      {el:'Map face',what:'head touches the circle edge (clearance '+rnd(r.gap)+' px, needs 2)',off:Math.max(0,2-r.gap)},
      {el:'Map face',what:'extreme points\' distance to circle edge differs (top '+rnd(r.ext.top)+', bottom '+rnd(r.ext.bottom)+', left '+rnd(r.ext.left)+', right '+rnd(r.ext.right)+')',off:spreadN([r.ext.top,r.ext.bottom,r.ext.left,r.ext.right]),info:true}];
      record(it,'start',combo,fShot)}
  }
  }
  if(has('base')){
  // Map screen: Hire chip vs Home, tabs on the map, sheets
  await p.evaluate(()=>Game.go('map'));await p.waitForTimeout(1500);const mShot=await shot(p,`map-${tag}`);
  record(await p.evaluate(CHIP),'map',combo,mShot);
  const sheets=[['sheet About','home'],['sheet Process','studio'],['sheet Hire','hire']];
  for(const [name,place] of sheets){
    const ok=await p.evaluate(pl=>{const e=document.querySelector(`[data-place="${pl}"]`);if(!e)return false;e.click();return true},place);if(!ok)continue;await p.waitForTimeout(900);
    const sh=await shot(p,`${name.replace(' ','-').toLowerCase()}-${tag}`);
    record(await p.evaluate(HEADER({name,sheet:'.g-sheet-in',title:'#gSheetTitle',close:'#gSheetX'})),name,combo,sh);
    await p.evaluate(()=>document.getElementById('gSheetX').click());await p.waitForTimeout(700)}
  const vk=await p.evaluate(()=>{const e=document.querySelector('.v-folk,.v-walker');if(!e)return false;e.click();return true});
  if(vk){await p.waitForTimeout(900);const sh=await shot(p,`sheet-villager-${tag}`);record(await p.evaluate(HEADER({name:'sheet Villager',sheet:'.g-sheet-in',title:'#gSheetTitle',close:'#gSheetX'})),'sheet Villager',combo,sh);
    await p.evaluate(()=>document.getElementById('gSheetX').click());await p.waitForTimeout(700)}
  for(const t of ['art','mine']){await p.evaluate(x=>Game.go(x),t);await p.waitForTimeout(1200);const ts=await shot(p,`${t}-${tag}`);record(await p.evaluate(CHIP),t,combo,ts)}
  }
  if(has('map'))await mapPart(p,combo,tag);
  if(has('admin'))await adminPart(p,combo,tag);
  if(has('base')){
  // coloring picker
  await p.evaluate(()=>Game.go('start'));await p.waitForTimeout(600);
  await p.evaluate(()=>Color.openPicker());await p.waitForTimeout(1800);const ps=await shot(p,`picker-${tag}`);
  record(await p.evaluate(PICK),'coloring picker',combo,ps);
  record(await p.evaluate(HEADER({name:'picker header',sheet:'#cPick',title:'#cPick .g-title',close:'#cPickX'})),'coloring picker',combo,ps);
  }
  await ctx.close()}
await b.close();srv.close();

// ---- report ----
function spreadN(a){return Math.max(...a)-Math.min(...a)}
const findings=all.filter(x=>!x.info&&x.off>LIMIT),infos=all.filter(x=>x.info);
for(const f of findings)console.log(`FINDING ${f.screen} | ${f.el} | ${f.what} | ${rnd(f.off)} px | ${f.combo} | ${f.shot}`);
if(errs.length)console.log('page errors:',JSON.stringify([...new Set(errs)].slice(0,5)));
const groups=new Map();for(const f of findings){const k=`${f.screen} | ${f.el} | ${f.what.replace(/\(.*$/,'').trim()}`;const g=groups.get(k)||{max:0,combos:new Set(),shot:f.shot,off:0};if(f.off>=g.off){g.off=f.off;g.shot=f.shot}g.combos.add(f.combo);groups.set(k,g)}
console.log(`\nSUMMARY (unique findings, worst case each): ${groups.size}`);
for(const [k,g] of groups)console.log(`- ${k}: up to ${rnd(g.off)} px in ${g.combos.size} of ${sizes.length*schemes.length*langs.length} combos; ${g.shot}`);
const seen=new Set();for(const i of infos){const k=i.el+i.what.replace(/\(.*$/,'');if(seen.has(k)||i.combo.indexOf('390x844 light en')<0&&all.some(z=>z.info&&z.el===i.el&&z.combo.startsWith('390x844 light en')))continue;seen.add(k);console.log(`INFO ${i.screen} | ${i.el} | ${i.what} | ${rnd(i.off)} px | ${i.combo}`)}
console.log(`\nneat: ${all.length} measurements, ${findings.length} findings (limit ${LIMIT} px), screenshots in ${OUT}`);
process.exit(findings.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
