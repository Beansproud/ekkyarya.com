// Coloring links (B12, format D10): ?color=<page>&f=v1.<fills>&s=v1.<stickers>&from=<name>
//   f: base64url of [number of custom colors (0..3), their RGB bytes, then 4 bits per region in order, two per byte]
//      (0 = paper, 1..12 = the page's colors, 13..15 = the custom colors)
//   s: base64url of 5 bytes per sticker: number, x, y, size, rotation (each 0..255)
// Opening a link shows the arrival screen with the friend's coloring, then cleans the address bar. A bad value
// opens the normal start screen with no error. Any deep link opens game mode, on desktop too (js/game.js).
const Links=(()=>{
const b64=a=>btoa(String.fromCharCode(...a)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const unb64=s=>{if(!/^[A-Za-z0-9_-]*$/.test(s))throw new Error("bad link");const bin=atob(s.replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(bin,c=>c.charCodeAt(0))};
const NAME=/^[\p{L}][\p{L} -]{0,15}$/u;
const cleanName=n=>{n=String(n||"").trim().replace(/\s+/g," ");return NAME.test(n)?n:""};
function encFills(fills,custom){const k=fills.length-1,out=[custom.length];
  custom.forEach(c=>out.push(parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)));
  for(let r=1;r<=k;r+=2)out.push((fills[r]&15)<<4|((r+1<=k?fills[r+1]:0)&15));return "v1."+b64(out)}
function decFills(str,k){if(!str.startsWith("v1."))throw new Error("bad link");const b=unb64(str.slice(3)),n=b[0];if(n>3||b.length!==1+n*3+Math.ceil(k/2))throw new Error("bad link");
  const custom=[];for(let i=0;i<n;i++)custom.push("#"+[...b.slice(1+i*3,4+i*3)].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase());
  const fills=[0];for(let r=1;r<=k;r++){const byte=b[1+n*3+((r-1)>>1)],v=(r-1)%2?byte&15:byte>>4;if(v>12+n)throw new Error("bad link");fills.push(v)}
  return {fills,custom}}
const TAU=Math.PI*2;
function encStickers(list){return "v1."+b64(list.flatMap(s=>[s.n,Math.round(s.x*255),Math.round(s.y*255),Math.round((s.s-.04)/.76*255),Math.round(((s.r%TAU+TAU)%TAU)/TAU*256)&255]))}
function decStickers(str){if(!str)return [];if(!str.startsWith("v1."))throw new Error("bad link");const b=unb64(str.slice(3));if(b.length%5||b.length>60)throw new Error("bad link");
  const ok=Color.stickers().map(s=>s.n),out=[];
  for(let i=0;i<b.length;i+=5){if(!ok.includes(b[i]))continue;out.push({n:b[i],x:b[i+1]/255,y:b[i+2]/255,s:.04+b[i+3]/255*.76,r:b[i+4]/256*TAU})}return out}
function base(){if(CONFIG.siteUrl)return CONFIG.siteUrl;return location.protocol==="file:"?location.href.split(/[?#]/)[0]:location.origin+location.pathname}
function colorUrl(state,name){const q=new URLSearchParams({color:state.pd.id,f:encFills(state.fills,state.custom)});
  if(state.stickers.length)q.set("s",encStickers(state.stickers));const n=cleanName(name);if(n)q.set("from",n);return base()+"?"+q}
async function arrive(){const q=new URLSearchParams(location.search);if(!q.has("color"))return;
  const id=q.get("color"),from=cleanName(q.get("from"));
  const clean=()=>{const u=new URL(location.href);["color","f","s","from"].forEach(k=>u.searchParams.delete(k));history.replaceState(null,"",u)};
  try{const known=id==="scratch"?feature("doodleScene"):Color.pages().some(p=>p.id===id);if(!known)throw new Error("bad link");
    const pd=await Color.pageData(id),{fills,custom}=decFills(q.get("f")||"",pd.meta.regions),st=decStickers(q.get("s")||"");
    await Color.showArrival(id,fills,custom,st,from)}catch{}
  clean()}
arrive();
return {colorUrl,encFills,decFills,encStickers,decStickers,cleanName};
})();
