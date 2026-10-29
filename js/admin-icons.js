// Admin Icons tab ("Ikon"; docs/admin.md, "Icons"): every drawn icon of the site in one place. One tap gives all of them
// another art style, made in the browser from Ekky's own drawings (sticker, coloring page, ink, duotone, pastel, pop,
// mono); any single icon can be replaced with his own picture; a button or spot (place) can show another icon; Back to
// original undoes each. Saved as "icons": {"style", "map": {"<built-in icon>": "assets/ui/u/<file>.png"}, "places": {"<place>":
// "<built-in icon or assets/ui/u/<file>.png>"}} plus the PNG files, on Publish (js/site-data.js applies them).
// Loaded by js/admin-shell.js after the PIN.
const AdminIcons = (() => {
  const S = {
    intro: ["Every drawn icon on the site. Give them all a new style in one tap, or replace one with your own picture. Preview or Publish at the top.", "Semua ikon gambar di situs. Ganti gaya semuanya sekali ketuk, atau ganti satu dengan gambarmu sendiri. Pratinjau atau Terbitkan di atas."],
    styleTitle: ["Style for all icons", "Gaya untuk semua ikon"],
    styleNote: ["Made from your own drawings, here in the browser. Your own uploaded icons stay as they are.", "Dibuat dari gambarmu sendiri, di browser ini. Ikon yang kamu unggah sendiri tetap."],
    alsoOwn: ["Also restyle the icons I replaced myself", "Ubah juga ikon yang kuganti sendiri"],
    making: ["Making the icons...", "Membuat ikon..."], done: ["Done. Preview or Publish at the top.", "Selesai. Pratinjau atau Terbitkan di atas."],
    iconsTitle: ["The icons", "Ikonnya"], now: ["Now", "Sekarang"], orig: ["Original", "Asli"],
    own: ["Replace with my own", "Ganti dengan gambarku"], back: ["Back to original", "Kembali ke asli"], allBack: ["All back to original", "Semua kembali ke asli"],
    ownNote: ["A PNG with a transparent background looks best. It is fitted into the icon's square.", "PNG dengan latar transparan paling bagus. Gambar disesuaikan ke kotak ikon."],
    bad: ["That file is not a picture this browser can open.", "Berkas itu bukan gambar yang bisa dibuka browser ini."],
    yours: ["Your own", "Punyamu"],
    placesTitle: ["Icons for buttons and places", "Ikon untuk tombol dan tempat"],
    placesNote: ["Pick which icon one button or spot shows. The rest of the site keeps its icons.", "Pilih ikon untuk satu tombol atau tempat. Bagian lain situs tetap memakai ikonnya."],
    choose: ["Choose icon", "Pilih ikon"], hide: ["Done choosing", "Selesai memilih"], builtinPlace: ["Back to built-in", "Kembali ke bawaan"],
    ownPlace: ["My own picture", "Gambarku sendiri"], chosen: ["chosen", "dipilih"], current: ["In use:", "Dipakai:"], fail: ["Could not make the icons: ", "Gagal membuat ikon: "]
  };
  const STYLES = [
    ["original", "Original", "Asli"], ["sticker", "Sticker", "Stiker"], ["line", "Coloring page", "Halaman mewarnai"], ["ink", "Ink", "Tinta"],
    ["duotone", "Duotone", "Dua warna"], ["pastel", "Pastel", "Pastel"], ["pop", "Pop", "Pop"], ["mono", "Mono", "Hitam putih"]
  ];
  const WHERE = {
    "assets/ui/monster-head.png": ["Hire Ekky button", "Tombol Hubungi Ekky"],
    "assets/ui/palette.png": ["Art tab, sticker, page divider", "Tab Karya, stiker, pembatas halaman"],
    "assets/ui/face-pop.png": ["Map tab (the round face)", "Tab Peta (wajah bulat)"],
    "assets/ui/ekky.png": ["Ekky's head: hero wave, Collaborate tile", "Kepala Ekky: lambaian hero, ubin Kerja sama"],
    "assets/ui/face.png": ["Play button on the website, sticker", "Tombol Main di situs web, stiker"],
    "assets/ui/pen-hand.png": ["Sketchbook tile, Color card, sticker", "Ubin Buku sketsa, kartu Mewarnai, stiker"],
    "assets/ui/helmet.png": ["Catch stars buttons", "Tombol Tangkap bintang"],
    "assets/ui/ghost.png": ["Doodle corner, sticker, page divider", "Pojok coretan, stiker, pembatas halaman"],
    "assets/ui/astronaut.png": ["Star Catcher in the village, sticker", "Star Catcher di desa, stiker"],
    "assets/ui/cat.png": ["Page divider, sticker, idle doodles", "Pembatas halaman, stiker, coretan saat diam"],
    "assets/ui/planet.png": ["Page divider, sticker, idle doodles", "Pembatas halaman, stiker, coretan saat diam"],
    "assets/ui/virus.png": ["Sticker", "Stiker"], "assets/ui/radio-explorer.png": ["Sticker", "Stiker"],
    "assets/cat-all.png": ["Category: All", "Kategori: Semua"], "assets/cat-illustration.png": ["Category: Illustration, sticker", "Kategori: Ilustrasi, stiker"],
    "assets/cat-web.png": ["Category: Web, sticker", "Kategori: Web, stiker"], "assets/cat-branding.png": ["Category: Branding, sticker", "Kategori: Branding, stiker"],
    "assets/cat-social.png": ["Category: Social, sticker", "Kategori: Sosial, stiker"]
  };
  const PLACE = {
    hire: ["Hire Ekky button, on every screen", "Tombol Hubungi Ekky, di semua layar", "assets/ui/monster-head.png"],
    tabArt: ["Art tab in the menu bar", "Tab Karya di bilah menu", "assets/ui/palette.png"],
    tabMap: ["Map tab (the round face)", "Tab Peta (wajah bulat)", "assets/ui/face-pop.png"],
    sketch: ["Start page: My sketchbook tile", "Halaman awal: ubin Buku sketsa", "assets/ui/pen-hand.png"],
    collab: ["Start page: Collaborate tile", "Halaman awal: ubin Kerja sama", "assets/ui/ekky.png"],
    stars: ["Catch stars buttons (intro and Yours)", "Tombol Tangkap bintang (intro dan Buatanmu)", "assets/ui/helmet.png"],
    fab: ["Website: the Play button", "Situs web: tombol Main", "assets/ui/face.png"],
    playColor: ["Website: Color card", "Situs web: kartu Mewarnai", "assets/ui/pen-hand.png"],
    playStars: ["Website: Catch stars card", "Situs web: kartu Tangkap bintang", "assets/ui/helmet.png"],
    heroWave: ["Website: the waving head in the hero", "Situs web: kepala melambai di hero", "assets/ui/ekky.png"],
    dividers: ["Website: all page dividers", "Situs web: semua pembatas halaman", "assets/ui/cat.png"]
  };
  const SAMPLE = ["assets/ui/monster-head.png", "assets/ui/palette.png", "assets/ui/ghost.png", "assets/cat-web.png"];
  const ICONS = () => (typeof SiteData !== "undefined" && SiteData.ICONS) || Object.keys(WHERE);

  let ctx = null, el = null;
  const st = { busy: false, msg: "", err: false, alsoOwn: false, samples: null, origs: {}, pick: null };
  const lg = () => (ctx && ctx.lang === "id") ? 1 : 0;
  const s = k => S[k][lg()];
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const data = () => (ctx.getData ? ctx.getData() : ctx.data) || {};
  const icons = () => { const i = data().icons; return i && typeof i === "object" ? i : {}; };
  const mapOf = () => { const m = icons().map; return m && typeof m === "object" ? m : {}; };
  const placesOf = () => { const m = icons().places; return m && typeof m === "object" ? m : {}; };
  const shownAny = v => /^assets\/ui\/u\//.test(v) ? (blobs()[v] || v) : shown(v);
  const blobs = () => (typeof SiteData !== "undefined" && SiteData.iconBlobs) || (window.__iconBlobs = window.__iconBlobs || {});
  const shown = k => { const to = mapOf()[k]; return to ? (blobs()[to] || to) : st.origs[k] || k + "?o=1"; };
  const isOwn = p => /-own-/.test(p || "");
  const base = k => k.split("/").pop().replace(/\.png$/, "");

  // ---- the originals (a query string keeps the site's icon swap away from them) ----
  function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("load " + src)); i.src = src; }); }
  const origCache = {};
  const original = k => origCache[k] || (origCache[k] = loadImg(k + "?o=1"));

  // ---- the styles: pixel recipes over the original, same size, transparency kept ----
  const INK = [43, 19, 66], ACC = [255, 180, 0], CREAM = [255, 248, 236], MID = [138, 111, 163];
  const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
  const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
  function pixels(cv, fn) {
    const x = cv.getContext("2d"), im = x.getImageData(0, 0, cv.width, cv.height), d = im.data, w = cv.width, h = cv.height;
    const alpha = Uint8ClampedArray.from({ length: w * h }, (_, i) => d[i * 4 + 3]);
    for (let i = 0, p = 0; p < w * h; p++, i += 4) { if (!d[i + 3]) continue; const o = fn(d[i], d[i + 1], d[i + 2], d[i + 3], p % w, (p / w) | 0, alpha, w, h); d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; if (o.length > 3) d[i + 3] = o[3]; }
    x.putImageData(im, 0, 0);
  }
  const edge = (x, y, alpha, w, h, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h || alpha[Y * w + X] < 128) return true; } return false; };
  function render(img, style, W, H) {
    const w = W || img.naturalWidth, h = H || img.naturalHeight, cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const x = cv.getContext("2d"); x.imageSmoothingQuality = "high";
    if (style === "sticker") {
      const k = 0.84, dw = w * k, dh = h * k, ox = (w - dw) / 2, oy = (h - dh) / 2 - h * 0.02, r = Math.max(2, Math.round(w * 0.045));
      const sil = document.createElement("canvas"); sil.width = w; sil.height = h; const sx = sil.getContext("2d");
      sx.drawImage(img, ox, oy, dw, dh); sx.globalCompositeOperation = "source-in"; sx.fillStyle = "#fff"; sx.fillRect(0, 0, w, h);
      x.save(); x.shadowColor = "rgba(43,19,66,.35)"; x.shadowOffsetY = Math.max(1, r / 2); x.shadowBlur = r;
      for (let a = 0; a < 16; a++) x.drawImage(sil, Math.cos(a * Math.PI / 8) * r, Math.sin(a * Math.PI / 8) * r);
      x.restore(); x.drawImage(img, ox, oy, dw, dh);
      return cv;
    }
    x.drawImage(img, 0, 0, w, h);
    const R = Math.max(1, Math.round(w / 64));
    // coloring page: a line where the color jumps (the inside shapes keep their outlines), read from the untouched picture
    const src = style === "line" ? x.getImageData(0, 0, w, h).data : null;
    const L = (X, Y) => { const i = (Math.min(h - 1, Math.max(0, Y)) * w + Math.min(w - 1, Math.max(0, X))) * 4; return lum(src[i], src[i + 1], src[i + 2]); };
    const step = (X, Y) => Math.max(Math.abs(L(X + 1, Y) - L(X - 1, Y)), Math.abs(L(X, Y + 1) - L(X, Y - 1))) / 2;
    const f = {
      original: null,
      mono: (r, g, b) => { const l = lum(r, g, b); return [l, l, l]; },
      duotone: (r, g, b) => mix(INK, ACC, Math.min(1, lum(r, g, b) / 235)),
      pastel: (r, g, b) => lum(r, g, b) < 70 ? mix([r, g, b], INK, 0.4) : mix(mix([r, g, b], [lum(r, g, b), lum(r, g, b), lum(r, g, b)], 0.2), [255, 255, 255], 0.5),
      pop: (r, g, b) => { const l = lum(r, g, b), q = v => Math.round(Math.min(255, Math.max(0, l + (v - l) * 1.6)) / 64) * 64 + (v > 200 ? 63 : 0); return [q(r), q(g), q(b)].map(v => Math.min(255, v)); },
      ink: (r, g, b) => { const l = lum(r, g, b); return l < 90 ? INK : l < 175 ? MID : CREAM; },
      line: (r, g, b, a, X, Y, alpha, ww, hh) => a < 128 ? [255, 255, 255, a] : edge(X, Y, alpha, ww, hh, R) || lum(r, g, b) < 95 || step(X, Y) > 26 ? INK.concat(255) : [255, 255, 255, 255]
    }[style];
    if (f) pixels(cv, f);
    return cv;
  }
  const toData = cv => cv.toDataURL("image/png");
  const stamp = () => Date.now().toString(36);

  // ---- changes ----
  // Swap icon k to a new PNG (dataURL), or back to the original (null). Files staged for the next Publish.
  function setIcon(d, k, url, name) {
    d.icons = d.icons && typeof d.icons === "object" ? d.icons : {};
    d.icons.map = d.icons.map && typeof d.icons.map === "object" ? d.icons.map : {};
    const old = d.icons.map[k];
    if (old && ctx.staged().includes(old)) { ctx.unstage(old); delete blobs()[old]; }
    if (!url) { delete d.icons.map[k]; return; }
    const path = `assets/ui/u/${base(k)}-${name}-${stamp()}.png`;
    d.icons.map[k] = path; blobs()[path] = url;
    ctx.stage(path, url.split(",")[1]);
  }
  async function applyStyle(style) {
    if (st.busy) return;
    st.busy = true; st.msg = s("making"); st.err = false; paint();
    try {
      const d = JSON.parse(JSON.stringify(data())), m = (d.icons && d.icons.map) || {};
      for (const k of ICONS()) {
        if (isOwn(m[k]) && !st.alsoOwn) continue;
        if (style === "original") { setIcon(d, k, null); continue; }
        const img = await original(k);
        setIcon(d, k, toData(render(img, style)), style);
      }
      d.icons = d.icons || {}; d.icons.style = style === "original" ? "" : style;
      if (!Object.keys(d.icons.map || {}).length && !d.icons.style && !Object.keys(d.icons.places || {}).length) delete d.icons;
      ctx.setData(() => d); st.msg = s("done");
    } catch (e) { st.msg = s("fail") + (e && e.message || e); st.err = true; }
    st.busy = false; paint();
  }
  async function ownIcon(k, file) {
    try {
      const bm = await createImageBitmap(file), img = await original(k);
      const W = Math.min(256, img.naturalWidth * 2), H = Math.min(256, Math.round(img.naturalHeight * W / img.naturalWidth));
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      const sc = Math.min(W / bm.width, H / bm.height), dw = bm.width * sc, dh = bm.height * sc;
      cv.getContext("2d").drawImage(bm, (W - dw) / 2, (H - dh) / 2, dw, dh); if (bm.close) bm.close();
      const d = JSON.parse(JSON.stringify(data())); setIcon(d, k, toData(cv), "own"); ctx.setData(() => d);
      st.msg = s("done"); st.err = false;
    } catch (e) { st.msg = s("bad"); st.err = true; }
    paint(`[data-own="${k}"]`);
  }
  function backIcon(k) { const d = JSON.parse(JSON.stringify(data())); setIcon(d, k, null); if (d.icons && !Object.keys(d.icons.map || {}).length) d.icons.style = ""; ctx.setData(() => d); paint(); }

  // ---- places: one button or spot shows another icon (a built-in icon, or an uploaded picture) ----
  function setPlace(id, v, url) {
    const d = JSON.parse(JSON.stringify(data()));
    d.icons = d.icons && typeof d.icons === "object" ? d.icons : {};
    d.icons.places = d.icons.places && typeof d.icons.places === "object" ? d.icons.places : {};
    const old = d.icons.places[id];
    if (old && /^assets\/ui\/u\//.test(old) && ctx.staged().includes(old)) { ctx.unstage(old); delete blobs()[old]; }
    if (url) { v = `assets/ui/u/place-${id.toLowerCase()}-own-${stamp()}.png`; blobs()[v] = url; ctx.stage(v, url.split(",")[1]); }
    if (!v || v === PLACE[id][2]) delete d.icons.places[id]; else d.icons.places[id] = v;
    if (!Object.keys(d.icons.places).length) delete d.icons.places;
    if (!Object.keys(d.icons.map || {}).length && !d.icons.style && !d.icons.places) delete d.icons;
    ctx.setData(() => d);
  }
  async function ownPlace(id, file) {
    try {
      const bm = await createImageBitmap(file), W = 256, sc = Math.min(W / bm.width, W / bm.height), dw = bm.width * sc, dh = bm.height * sc;
      const cv = document.createElement("canvas"); cv.width = W; cv.height = W;
      cv.getContext("2d").drawImage(bm, (W - dw) / 2, (W - dh) / 2, dw, dh); if (bm.close) bm.close();
      setPlace(id, null, toData(cv)); st.msg = s("done"); st.err = false;
    } catch (e) { st.msg = s("bad"); st.err = true; }
    paint(`[data-pick="${id}"]`);
  }
  function placesHtml() {
    const pl = placesOf();
    return `<h3>${esc(s("placesTitle"))}</h3><p class="ai-note">${esc(s("placesNote"))}</p>
      <div class="ai-places">${Object.keys(PLACE).map(id => { const v = pl[id] || PLACE[id][2], open = st.pick === id;
        return `<div class="ai-place${open ? " on" : ""}"><div class="ai-prow"><img src="${esc(shownAny(v))}" alt=""><span><b>${esc(PLACE[id][lg()])}</b>${pl[id] ? ` <span class="ai-note">(${esc(s("chosen"))})</span>` : ""}</span></div>
          <div class="ai-acts"><button type="button" class="ai-btn" data-pick="${id}" aria-expanded="${open}">${esc(open ? s("hide") : s("choose"))}</button>
          ${pl[id] ? `<button type="button" class="ai-btn" data-unplace="${id}">${esc(s("builtinPlace"))}</button>` : ""}</div>
          ${open ? `<div class="ai-picker" role="group" aria-label="${esc(s("choose"))}">${ICONS().map(k => `<button type="button" class="ai-pk" data-place="${id}" data-icon="${esc(k)}" aria-pressed="${k === v}" title="${esc(base(k))}"><img src="${esc(shown(k))}" alt="${esc(base(k))}"></button>`).join("")}
            <label class="ai-btn" tabindex="0" role="button" data-own="place-${id}">${esc(s("ownPlace"))}<input type="file" accept="image/png,image/webp,image/jpeg,image/gif" data-pfile="${id}" hidden></label></div>` : ""}</div>`; }).join("")}</div>`;
  }

  // ---- the screen ----
  async function samples() {
    if (st.samples) return;
    st.samples = {};
    try {
      const imgs = await Promise.all(SAMPLE.map(original));
      for (const [id] of STYLES) st.samples[id] = imgs.map(i => toData(render(i, id)));
    } catch (e) {}
    paint();
  }
  function paint(focus) {
    if (!el || el.id !== "admTab-icons") return;
    const m = mapOf(), cur = icons().style || "original";
    el.innerHTML = `<div class="ai">
      <p class="ai-intro">${esc(s("intro"))}</p>
      <h3>${esc(s("styleTitle"))}</h3><p class="ai-note">${esc(s("styleNote"))}</p>
      <div class="ai-styles" role="group" aria-label="${esc(s("styleTitle"))}">${STYLES.map(([id, en, idn]) => `<button type="button" class="ai-style" data-style="${id}" aria-pressed="${id === cur}"${st.busy ? " disabled" : ""}>
        <span class="ai-sample">${((st.samples || {})[id] || []).map(u => `<img src="${u}" alt="">`).join("")}</span><b>${esc(lg() ? idn : en)}</b></button>`).join("")}</div>
      <label class="ai-check"><input type="checkbox" data-also${st.alsoOwn ? " checked" : ""}> ${esc(s("alsoOwn"))}</label>
      ${st.msg ? `<p class="ai-msg${st.err ? " err" : ""}" role="${st.err ? "alert" : "status"}">${esc(st.msg)}</p>` : ""}
      ${placesHtml()}
      <h3>${esc(s("iconsTitle"))}</h3><p class="ai-note">${esc(s("ownNote"))}</p>
      <div class="ai-grid">${ICONS().map(k => { const to = m[k]; return `<div class="ai-card" data-k="${esc(k)}">
        <div class="ai-pics"><figure><img src="${esc(shown(k))}" alt=""><figcaption>${esc(s("now"))}${isOwn(to) ? " (" + esc(s("yours")) + ")" : ""}</figcaption></figure>${to ? `<figure><img src="${esc(k)}?o=1" alt=""><figcaption>${esc(s("orig"))}</figcaption></figure>` : ""}</div>
        <b>${esc(base(k))}</b><span class="ai-note">${esc((WHERE[k] || ["", ""])[lg()])}</span>
        <div class="ai-acts"><label class="ai-btn" data-own="${esc(k)}" tabindex="0" role="button">${esc(s("own"))}<input type="file" accept="image/png,image/webp,image/jpeg,image/gif" data-file="${esc(k)}" hidden></label>
        ${to ? `<button type="button" class="ai-btn" data-back="${esc(k)}">${esc(s("back"))}</button>` : ""}</div></div>`; }).join("")}</div>
      ${Object.keys(m).length ? `<div class="ai-acts"><button type="button" class="ai-btn" data-style="original">${esc(s("allBack"))}</button></div>` : ""}
    </div>`;
    if (focus) { const f = el.querySelector(focus); if (f) f.focus({ preventScroll: true }); }
  }
  const STYLE = `
#adminRoot .ai{display:grid;gap:12px;max-width:1100px;margin:0 auto}
#adminRoot .ai h3{margin:6px 0 0;font-size:1.05rem}
#adminRoot .ai-intro{margin:0;line-height:1.45}
#adminRoot .ai-note{margin:0;font-size:.85rem;color:var(--mute);line-height:1.4}
#adminRoot .ai-styles{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
#adminRoot .ai-style{display:grid;gap:6px;justify-items:center;min-height:44px;padding:10px;border-radius:14px;border:2px solid var(--line);background:#fff;color:var(--ink);font:600 .92rem Fredoka,Poppins,sans-serif;cursor:pointer}
#adminRoot .ai-style[aria-pressed=true]{border-color:var(--ink);box-shadow:0 0 0 2px var(--ink) inset}
#adminRoot .ai-style:disabled{opacity:.55;cursor:default}
#adminRoot .ai-sample{display:flex;gap:4px;min-height:32px}
#adminRoot .ai-sample img{width:30px;height:30px;object-fit:contain}
#adminRoot .ai-check{display:flex;gap:10px;align-items:center;min-height:44px}
#adminRoot .ai-check input{width:24px;height:24px}
#adminRoot .ai-msg{margin:0;padding:10px 12px;border-radius:12px;background:#e6f4ea;color:#1f5f33;font-weight:600}
#adminRoot .ai-msg.err{background:#fdecea;color:#8c1d18}
#adminRoot .ai-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
#adminRoot .ai-card{display:grid;gap:4px;align-content:start;padding:10px;border:2px solid var(--line);border-radius:14px;background:#fff}
#adminRoot .ai-pics{display:flex;gap:8px;align-items:end}
#adminRoot .ai-pics figure{margin:0;display:grid;justify-items:center;gap:2px}
#adminRoot .ai-pics img{width:64px;height:64px;object-fit:contain}
#adminRoot .ai-pics figure+figure img{width:36px;height:36px;opacity:.8}
#adminRoot .ai-pics figcaption{font-size:.75rem;color:var(--mute)}
#adminRoot .ai-acts{display:flex;flex-wrap:wrap;gap:6px}
#adminRoot .ai-places{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
#adminRoot .ai-place{display:grid;gap:8px;align-content:start;padding:10px;border:2px solid var(--line);border-radius:14px;background:#fff}
#adminRoot .ai-place.on{border-color:var(--ink);grid-column:1/-1}
#adminRoot .ai-prow{display:flex;gap:10px;align-items:center}
#adminRoot .ai-prow img{width:48px;height:48px;object-fit:contain;flex:none}
#adminRoot .ai-picker{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#adminRoot .ai-pk{width:52px;height:52px;padding:4px;border-radius:12px;border:2px solid var(--line);background:#fff;cursor:pointer}
#adminRoot .ai-pk[aria-pressed=true]{border-color:var(--ink);box-shadow:0 0 0 2px var(--ink) inset}
#adminRoot .ai-pk img{width:100%;height:100%;object-fit:contain}
#adminRoot .ai-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 12px;border-radius:14px;border:2px solid var(--line);background:#fff;color:var(--ink);font:600 .88rem Fredoka,Poppins,sans-serif;cursor:pointer;text-align:center}
`;
  function render_(target, c) {
    ctx = c; el = target;
    if (!document.getElementById("aiCss")) { const x = document.createElement("style"); x.id = "aiCss"; x.textContent = STYLE; document.head.appendChild(x); }
    if (!el.dataset.ai) {
      el.dataset.ai = "1";
      el.addEventListener("click", e => {
        if (el.id !== "admTab-icons") return;
        const b = e.target.closest("[data-style],[data-back],[data-pick],[data-unplace],[data-place]"); if (!b) return;
        if (b.dataset.style) applyStyle(b.dataset.style);
        else if (b.dataset.back) backIcon(b.dataset.back);
        else if (b.dataset.pick) { st.pick = st.pick === b.dataset.pick ? null : b.dataset.pick; paint(`[data-pick="${b.dataset.pick}"]`); }
        else if (b.dataset.unplace) { setPlace(b.dataset.unplace, null); paint(`[data-pick="${b.dataset.unplace}"]`); }
        else { setPlace(b.dataset.place, b.dataset.icon); paint(`[data-place="${b.dataset.place}"][data-icon="${b.dataset.icon}"]`); }
      });
      el.addEventListener("keydown", e => { if (el.id !== "admTab-icons") return; const l = e.target.closest("label[data-own]"); if (l && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); l.querySelector("input").click(); } });
      el.addEventListener("change", e => {
        if (el.id !== "admTab-icons") return;
        if (e.target.matches("[data-also]")) { st.alsoOwn = e.target.checked; return; }
        const f = e.target.matches("[data-file]") && e.target.files[0]; if (f) ownIcon(e.target.dataset.file, f);
        const g = e.target.matches("[data-pfile]") && e.target.files[0]; if (g) ownPlace(e.target.dataset.pfile, g);
      });
    }
    st.msg = st.busy ? st.msg : "";
    paint(); samples();
  }
  const def = { title: { en: "Icons", id: "Ikon" }, render: render_ };
  if (window.Admin && window.Admin.registerTab) window.Admin.registerTab("icons", def);
  else (window.AdminTabs = window.AdminTabs || []).push(["icons", def]);
  return { render: render_, renderStyle: render, STYLES };
})();
