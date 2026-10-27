// Usage: node scripts/make-page.mjs <page> [--verify]. Builds a coloring page from one of Ekky's own pieces (B09)
// into assets/color/<page>/:
//   line.png     Ekky's lines: the dark pixels of his original, kept in his own ink, on transparency (D8: threshold lines
//                until he sends a line layer; a page with `line` in PAGES uses that layer instead)
//   regions.png  the fill map: R + 256 * G = region id (1..n) for every pixel. B = 0 inside a region, B = 1 on a line
//                Big areas are also split where Ekky's own colors change (shapes he painted without an outline, like the
//                giraffe's spots or the trees behind the fence), so one tap never floods half the picture.
//                pixel that belongs to the nearest region (so a fill reaches under the anti-aliased line edge).
//                Areas under MIN_AREA px merge into the line.
//   page.json    size, region count, 12 "Ekky's colors" sampled from the original, and the original's path
//   page.js      page.json plus regions.png as a data URL, for js/color.js
//   original.jpg Ekky's colored original with the same crop (Peek and the reveal)
// Deterministic: running it twice gives byte-identical files (own PNG encoder, fixed k-means start).
// --verify fills each region alone and checks that no pixel outside it changes, and that the files are reproducible.
// Needs the preinstalled Playwright Chromium only to decode the JPG. No new npm package.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { deflateSync, inflateSync, crc32 } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
// Pages: slug of the PROJECTS piece, and the darkness threshold that separates Ekky's lines from color.
const PAGES = {
  // crop: the drawing itself, without the empty paper around it (a crop changes no line)
  giraffe: { slug: "giraffe", lineMax: 128, inkSoft: 140, crop: [33, 107, 733, 714] },
  "road-trip": { slug: "road-trip", lineMax: 110, inkSoft: 130, crop: [190, 376, 748, 560] },
  // experiment (switch pageMonster, off): the green monster from Monster in My Room, the owner's own-art alternative
  // to a fan-art page; Ekky approves the lines first (docs/color-monster-lines.png)
  monster: { slug: "monster", lineMax: 110, inkSoft: 130, crop: [300, 0, 780, 780] },
  "plug-hero": { slug: "plug-hero", lineMax: 110, inkSoft: 130 },
  "hands": { slug: "hands", lineMax: 110, inkSoft: 130 },
  // candidates for "more pictures": kept only if --verify passes and the lines read clean (see docs for what was dropped)
  "little-planet": { slug: "little-planet", lineMax: 95, inkSoft: 115 },
  doodles: { slug: "doodles", lineMax: 128, inkSoft: 140 },
  "day-in-life": { slug: "day-in-life", lineMax: 128, inkSoft: 140 },
};
const MIN_AREA = 40, COLORS = 12;
// Color split: areas above SPLIT_AREA px are divided by up to SPLIT_K of their own colors; patches under SPECK px fold
// into the neighbor they touch, and colors closer than SPLIT_MERGE (RGB distance) count as one.
const SPLIT_AREA = 12000, SPLIT_K = 5, SPLIT_MERGE = 34, SPECK = 600;

const [, , name, flag] = process.argv;
const page = PAGES[name];
if (!page) { console.error(`Unknown page "${name}". Pages: ${Object.keys(PAGES).join(", ")}`); process.exit(1); }
const data = vm.runInNewContext(readFileSync(join(ROOT, "js", "data.js"), "utf8") + ";({PROJECTS, shareable})", {});
const piece = data.PROJECTS.find(p => p.slug === page.slug);
if (!piece || !data.shareable(piece)) { console.error(`"${page.slug}" is not shareable (CONFIG.reuse / reuseBlock), so it can't be a coloring page.`); process.exit(1); }

async function decode(file, crop) {
  const { chromium } = require("playwright");
  const b = await chromium.launch(), p = await b.newPage();
  const src = "data:image/jpeg;base64," + readFileSync(join(ROOT, file)).toString("base64");
  const out = await p.evaluate(async ([src, crop]) => {
    const im = new Image(); im.src = src; await im.decode();
    const [cx, cy, cw, ch] = crop || [0, 0, im.naturalWidth, im.naturalHeight];
    const c = document.createElement("canvas"); c.width = cw; c.height = ch;
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, cw, ch); x.drawImage(im, -cx, -cy);
    const d = x.getImageData(0, 0, c.width, c.height).data; let s = "";
    for (let i = 0; i < d.length; i += 32768) s += String.fromCharCode.apply(null, d.subarray(i, i + 32768));
    return { w: c.width, h: c.height, b64: btoa(s), jpg: c.toDataURL("image/jpeg", .9).split(",")[1] };
  }, [src, crop]);
  await b.close();
  return { w: out.w, h: out.h, px: Buffer.from(out.b64, "base64"), jpg: Buffer.from(out.jpg, "base64") };
}

function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const chunk = (type, body) => { const len = Buffer.alloc(4); len.writeUInt32BE(body.length);
    const tb = Buffer.concat([Buffer.from(type), body]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(tb) >>> 0); return Buffer.concat([len, tb, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

// Indexed PNG for the line layer (about a tenth of the RGBA size): 4 ink tones, each at 15 opacity levels.
function pngLines(w, h, rgba) {
  const n = w * h, ink = [];
  for (let i = 0; i < n; i++) if (rgba[i * 4 + 3]) ink.push([rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2], rgba[i * 4 + 3]]);
  // 4 tones by weighted k-means with a fixed start (the darkest ink first, then the farthest), so output is reproducible
  let tones = [ink.reduce((a, b) => (a[0] + a[1] + a[2] <= b[0] + b[1] + b[2] ? a : b)).slice(0, 3)];
  while (tones.length < 4) tones.push(ink.reduce((best, p) => { const d = Math.min(...tones.map(t => dist(t, p))); return d > best[1] ? [p, d] : best }, [ink[0], -1])[0].slice(0, 3));
  for (let it = 0; it < 10; it++) { const acc = tones.map(() => [0, 0, 0, 0]);
    for (const p of ink) { const k = nearest(tones, p), a = p[3]; acc[k][0] += p[0] * a; acc[k][1] += p[1] * a; acc[k][2] += p[2] * a; acc[k][3] += a }
    tones = tones.map((t, k) => acc[k][3] ? [acc[k][0] / acc[k][3], acc[k][1] / acc[k][3], acc[k][2] / acc[k][3]] : t) }
  const raw = Buffer.alloc((w + 1) * h);
  for (let i = 0; i < n; i++) { const a = rgba[i * 4 + 3], lv = Math.round(a / 17), o = Math.floor(i / w) * (w + 1) + 1 + (i % w);
    raw[o] = lv ? 1 + nearest(tones, [rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]]) * 15 + (lv - 1) : 0 }
  const plte = Buffer.alloc(61 * 3), trns = Buffer.alloc(61);
  for (let k = 0; k < 4; k++) for (let l = 1; l <= 15; l++) { const i = 1 + k * 15 + (l - 1); tones[k].forEach((v, c) => plte[i * 3 + c] = Math.round(v)); trns[i] = l * 17 }
  const chunk = (type, body) => { const len = Buffer.alloc(4); len.writeUInt32BE(body.length);
    const tb = Buffer.concat([Buffer.from(type), body]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(tb) >>> 0); return Buffer.concat([len, tb, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 3;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("PLTE", plte), chunk("tRNS", trns), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

function build({ w, h, px }) {
  const n = w * h, lum = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = px[i * 4] * .299 + px[i * 4 + 1] * .587 + px[i * 4 + 2] * .114;
  // regions: 4-connected areas of non-line pixels
  const id = new Int32Array(n).fill(-1), sizes = [0];
  for (let i = 0; i < n; i++) if (lum[i] <= page.lineMax) id[i] = 0;
  const stack = new Int32Array(n);
  for (let s = 0; s < n; s++) {
    if (id[s] !== -1) continue;
    const r = sizes.length; let top = 0, area = 0; stack[top++] = s; id[s] = r;
    while (top) { const i = stack[--top]; area++; const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) if (j >= 0 && j < n && id[j] === -1) { id[j] = r; stack[top++] = j } }
    sizes.push(area);
  }
  // tiny areas join the line; renumber the rest 1..k in scan order
  const map = new Int32Array(sizes.length); let k = 0;
  for (let r = 1; r < sizes.length; r++) map[r] = sizes[r] >= MIN_AREA ? ++k : 0;
  for (let i = 0; i < n; i++) id[i] = map[id[i]] || 0;
  k = splitByColor(px, w, h, id, k);
  // every line pixel belongs to its nearest region (breadth-first growth), so fills reach under anti-aliased edges
  const own = Int32Array.from(id), onLine = new Uint8Array(n);
  let front = []; for (let i = 0; i < n; i++) if (id[i]) front.push(i); else onLine[i] = 1;
  while (front.length) { const next = [];
    for (const i of front) { const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) if (j >= 0 && j < n && !own[j]) { own[j] = own[i]; next.push(j) } }
    front = next }
  const regions = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) { regions[i * 4] = own[i] & 255; regions[i * 4 + 1] = own[i] >> 8; regions[i * 4 + 2] = onLine[i]; regions[i * 4 + 3] = 255 }
  // Ekky's lines, in his own ink: alpha ramps from fully dark to inkSoft so edges stay smooth
  const line = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) { const a = Math.max(0, Math.min(1, (page.inkSoft - lum[i]) / (page.inkSoft - page.lineMax * .55)));
    if (a > 0) { line[i * 4] = px[i * 4]; line[i * 4 + 1] = px[i * 4 + 1]; line[i * 4 + 2] = px[i * 4 + 2]; line[i * 4 + 3] = Math.round(a * 255) } }
  // Ekky's colors: the mean color inside each region, weighted by area, clustered into 12 (k-means with a fixed start)
  const sum = Array.from({ length: k + 1 }, () => [0, 0, 0, 0]);
  for (let i = 0; i < n; i++) if (id[i]) { const s = sum[id[i]]; s[0] += px[i * 4]; s[1] += px[i * 4 + 1]; s[2] += px[i * 4 + 2]; s[3]++ }
  const pts = sum.slice(1).map(s => [s[0] / s[3], s[1] / s[3], s[2] / s[3], s[3]]);
  const regionColor = pts.map(p => p.slice(0, 3));
  const byArea = pts.map((p, i) => [p, i]).sort((a, b) => b[0][3] - a[0][3] || a[1] - b[1]);
  let cent = [];
  for (const [p] of byArea) { if (cent.length === COLORS) break; if (cent.every(c => dist(c, p) > 40)) cent.push(p.slice(0, 3)) }
  for (const [p] of byArea) { if (cent.length === COLORS) break; if (!cent.some(c => dist(c, p) < 1)) cent.push(p.slice(0, 3)) }
  for (let it = 0; it < 12; it++) {
    const acc = cent.map(() => [0, 0, 0, 0]);
    for (const p of pts) { const c = nearest(cent, p); acc[c][0] += p[0] * p[3]; acc[c][1] += p[1] * p[3]; acc[c][2] += p[2] * p[3]; acc[c][3] += p[3] }
    cent = cent.map((c, j) => acc[j][3] ? [acc[j][0] / acc[j][3], acc[j][1] / acc[j][3], acc[j][2] / acc[j][3]] : c);
  }
  const hex = c => "#" + c.map(v => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
  const hue = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 18) return 400 + (255 - mx);
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360 };
  const colors = cent.slice().sort((a, b) => hue(a) - hue(b)).map(hex);
  return { line: pngLines(w, h, line), regions: png(w, h, regions), own, k,
    json: JSON.stringify({ page: name, slug: page.slug, title: piece.title, w, h, regions: k, colors,
      ekky: regionColor.map(hex), original: `assets/color/${name}/original.jpg`, crop: page.crop || null, line: "line.png", map: "regions.png" }, null, 1) + "\n" };
}
// Split the big areas along Ekky's color shapes. Inside one area: k-means over its pixel colors (fixed start: the most
// common colors), a 5 x 5 majority filter against JPEG noise, then each connected patch of one color is a new region.
// Specks under SPECK px take the color of the patch next to them. Regions are renumbered in scan order at the end.
function splitByColor(px, w, h, id, k) {
  const n = w * h, area = new Int32Array(k + 1);
  for (let i = 0; i < n; i++) area[id[i]]++;
  let next = k;
  const lab = new Int32Array(n).fill(-1), comp = new Int32Array(n).fill(-1), stack = new Int32Array(n);
  const nb = (i, f) => { const x = i % w; if (x > 0) f(i - 1); if (x < w - 1) f(i + 1); if (i >= w) f(i - w); if (i < n - w) f(i + w) };
  for (let r = 1; r <= k; r++) {
    if (area[r] < SPLIT_AREA) continue;
    const idx = []; for (let i = 0; i < n; i++) if (id[i] === r) idx.push(i);
    // fixed start: the most common colors (quantized to 16 levels), at least SPLIT_MERGE apart
    const hist = new Map();
    for (const i of idx) { const q = (px[i * 4] >> 4) << 8 | (px[i * 4 + 1] >> 4) << 4 | px[i * 4 + 2] >> 4; hist.set(q, (hist.get(q) || 0) + 1) }
    const common = [...hist].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(([q]) => [((q >> 8) & 15) * 16 + 8, ((q >> 4) & 15) * 16 + 8, (q & 15) * 16 + 8]);
    let cent = []; for (const c of common) { if (cent.length === SPLIT_K) break; if (cent.every(d => dist(c, d) > SPLIT_MERGE)) cent.push(c) }
    for (let it = 0; it < 8; it++) {
      const acc = cent.map(() => [0, 0, 0, 0]);
      for (const i of idx) { const p = [px[i * 4], px[i * 4 + 1], px[i * 4 + 2]], c = nearest(cent, p); acc[c][0] += p[0]; acc[c][1] += p[1]; acc[c][2] += p[2]; acc[c][3]++ }
      cent = cent.map((c, j) => acc[j][3] ? [acc[j][0] / acc[j][3], acc[j][1] / acc[j][3], acc[j][2] / acc[j][3]] : c);
    }
    const merged = []; for (const c of cent) if (merged.every(d => dist(c, d) > SPLIT_MERGE)) merged.push(c);
    if (merged.length < 2) continue;
    for (const i of idx) lab[i] = nearest(merged, [px[i * 4], px[i * 4 + 1], px[i * 4 + 2]]);
    // 5 x 5 majority filter inside the area (JPEG edges and noise)
    const sm = new Int32Array(idx.length), cnt = new Int32Array(merged.length);
    idx.forEach((i, j) => { cnt.fill(0); const x = i % w, y = (i - x) / w;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy;
        if (xx >= 0 && xx < w && yy >= 0 && yy < h) { const q = yy * w + xx; if (id[q] === r) cnt[lab[q]]++ } }
      let best = lab[i]; for (let c = 0; c < cnt.length; c++) if (cnt[c] > cnt[best]) best = c; sm[j] = best });
    idx.forEach((i, j) => lab[i] = sm[j]);
    // connected patches of one color; specks are cleared and refilled from their neighbors
    const sizes = [];
    for (const s of idx) { if (comp[s] !== -1) continue; const c = sizes.length; let top = 0, a = 0; stack[top++] = s; comp[s] = c;
      while (top) { const i = stack[--top]; a++; nb(i, j => { if (comp[j] === -1 && id[j] === r && lab[j] === lab[i]) { comp[j] = c; stack[top++] = j } }) }
      sizes.push(a) }
    const big = sizes.map(a => a >= SPECK);
    if (big.filter(Boolean).length < 2) { for (const i of idx) comp[i] = -1; continue }
    let front = []; for (const i of idx) if (!big[comp[i]]) comp[i] = -2; else front.push(i);
    while (front.length) { const nx = []; for (const i of front) nb(i, j => { if (comp[j] === -2) { comp[j] = comp[i]; nx.push(j) } }); front = nx }
    // the patch holding the area's first pixel keeps the area's id; the others get new ids
    const newId = new Map([[comp[idx[0]], r]]);
    for (const i of idx) { if (!newId.has(comp[i])) newId.set(comp[i], ++next); id[i] = newId.get(comp[i]) }
    for (const i of idx) comp[i] = -1;
  }
  // renumber 1..k in scan order so ids stay stable and deterministic
  const order = new Int32Array(next + 1); let m = 0;
  for (let i = 0; i < n; i++) if (id[i] && !order[id[i]]) order[id[i]] = ++m;
  for (let i = 0; i < n; i++) id[i] = id[i] ? order[id[i]] : 0;
  return m;
}
function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }
function nearest(cs, p) { let best = 0, bd = Infinity; cs.forEach((c, j) => { const d = dist(c, p); if (d < bd) { bd = d; best = j } }); return best }

const img = await decode(piece.full, page.crop);
const out = build(img);
const dir = join(ROOT, "assets", "color", name);
if (flag === "--verify") {
  const again = build(img);
  const same = ["line", "regions", "json"].every(f => Buffer.compare(Buffer.from(out[f]), Buffer.from(again[f])) === 0)
    && ["line.png", "regions.png", "page.json"].every((f, i) => Buffer.compare(readFileSync(join(dir, f)), Buffer.from(out[["line", "regions", "json"][i]])) === 0);
  // read the committed regions.png back the way the browser does, fill each region alone with the runtime rule
  // (every pixel whose map id equals the region), and count pixels that change outside that region or stay empty
  const raw = inflateSync(readFileSync(join(dir, "regions.png")).subarray(33, -12).subarray(8)), n = img.w * img.h, stride = img.w * 4 + 1;
  const fileId = new Int32Array(n); for (let i = 0; i < n; i++) { const y = Math.floor(i / img.w), o = y * stride + 1 + (i % img.w) * 4; fileId[i] = raw[o] + raw[o + 1] * 256 }
  let leaks = 0, empty = 0;
  for (let r = 1; r <= out.k; r++) { let cnt = 0; for (let i = 0; i < n; i++) if (fileId[i] === r) { cnt++; if (out.own[i] !== r) leaks++ } if (!cnt) empty++ }
  for (let i = 0; i < n; i++) if (!fileId[i]) leaks++;   // every pixel must belong to exactly one region
  const colors = JSON.parse(out.json).colors.length;
  console.log(JSON.stringify({ page: name, regions: out.k, colors, reproducible: same, leaks, empty }));
  process.exit(same && !leaks && !empty && out.k >= 15 && colors >= 12 ? 0 : 1);
}
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "line.png"), out.line);
writeFileSync(join(dir, "original.jpg"), img.jpg);   // Ekky's colored original, same crop: Peek and "Ekky's" in the reveal
writeFileSync(join(dir, "regions.png"), out.regions);
writeFileSync(join(dir, "page.json"), out.json);
// page.js: the same data for the browser, with the fill map embedded as a data URL so the page also works from file://
// (a canvas may not read pixels of a file:// image). js/color.js loads it on demand.
writeFileSync(join(dir, "page.js"), `// Generated by scripts/make-page.mjs from page.json and regions.png. Do not edit.\n(window.COLOR_PAGE_DATA=window.COLOR_PAGE_DATA||{})[${JSON.stringify(name)}]=Object.assign(${JSON.stringify(JSON.parse(out.json))},{mapData:"data:image/png;base64,${out.regions.toString("base64")}"});\n`);
console.log(`wrote assets/color/${name}/ (${out.k} regions)`);
