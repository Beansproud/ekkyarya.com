// Usage: node scripts/assets-sheet.cjs. Renders docs/assets-sheet.png: every assets/ui icon and every shape and
// line icon of the inline SVG set (read from index.html), each at its display size on the game's dark purple and on white.
// Needs Playwright (preinstalled in Claude cloud sessions).
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
// file, display size in px (half the PNG size)
const PNG=[['face',64],['pen-hand',48],['palette',48],['ghost',48],['monster-head',64],['monster-head-check',64],
  ['helmet',48],['virus',48],['planet',48],['cat',48]];
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const sprite=html.match(/<svg width="0" height="0"[\s\S]*?<\/svg>/)[0];
const SVG=[...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(m=>m[1]);
const cell=(inner,label,size)=>`<figure><div class="row"><div class="t dark">${inner}</div><div class="t light">${inner}</div></div><figcaption>${label}<small>${size} px</small></figcaption></figure>`;
const page=`<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:28px;font:14px/1.3 Poppins,system-ui,sans-serif;color:#2B1342;background:#F4F1F8;width:1180px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:24px 0 10px}p{margin:0 0 8px;color:#6b5e80}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
figure{margin:0;background:#fff;border:1px solid #E5E0EE;border-radius:14px;padding:10px}
.row{display:flex;gap:6px}.t{flex:1;height:84px;border-radius:10px;display:grid;place-items:center}
.dark{background:#2B1342;color:#fff}.light{background:#fff;border:1px solid #E5E0EE;color:#2B1342}
figcaption{margin-top:8px;font-weight:600;display:flex;justify-content:space-between}small{font-weight:400;color:#6b5e80}
img{object-fit:contain}svg{width:32px;height:32px}.spark{color:#FFB400}
</style>${sprite}
<h1>Ekky Arya: UI icon sheet</h1><p>Every icon at its display size, on the game background (#2B1342) and on white. Cut-outs come from assets/ui/ (2x files); shapes and line icons from the inline SVG set in index.html.</p>
<h2>Cut-outs from Ekky's artwork (assets/ui/)</h2><div class="grid">${PNG.map(([n,s])=>cell(`<img src="file://${ROOT}/assets/ui/${n}.png" width="${s}" height="${s}">`,n+'.png',s)).join('')}</div>
<h2>Palette shapes and line icons (inline SVG)</h2><div class="grid">${SVG.map(id=>cell(`<svg class="${id==='s-sparkle'?'spark':''}"><use href="#${id}"/></svg>`,'#'+id,32)).join('')}</div>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1236,height:800},deviceScaleFactor:1});
  const tmp=path.join(ROOT,'docs','.assets-sheet.html');fs.writeFileSync(tmp,page);
  try{await p.goto('file://'+tmp);await p.waitForTimeout(400);await p.screenshot({path:path.join(ROOT,'docs','assets-sheet.png'),fullPage:true})}finally{fs.unlinkSync(tmp)}
  await b.close();console.log('wrote docs/assets-sheet.png')})();
