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
    cancel: ["Cancel", "Batal"],
    dvAsk: ["Also use this art on the site?", "Pakai juga karya ini di situs?"],
    dvAskNote: ["It can become an icon or the picture on a button. The piece itself stays in your art either way.", "Bisa jadi ikon atau gambar di tombol. Karyanya tetap ada di daftar karyamu."],
    dvYes: ["Make it an icon or button picture", "Jadikan ikon atau gambar tombol"], dvNo: ["No, just the art", "Tidak, cukup jadi karya"],
    dvTitle: ["Make an icon from your art", "Buat ikon dari karyamu"], dvZoom: ["Zoom", "Perbesar"], dvX: ["Left and right", "Kiri dan kanan"], dvY: ["Up and down", "Atas dan bawah"],
    dvCut: ["Remove the background", "Hapus latar belakang"], dvTol: ["How much background", "Seberapa banyak latar"],
    dvWhere: ["Where does it go?", "Dipakai di mana?"], dvIcon: ["Replace an icon everywhere", "Ganti satu ikon di semua tempat"], dvPlace: ["Only on one button or place", "Hanya di satu tombol atau tempat"],
    dvUse: ["Use it", "Pakai"], dvPick: ["Pick where it goes first.", "Pilih dulu tempatnya."], dvDone: ["Done. Preview or Publish at the top.", "Selesai. Pratinjau atau Terbitkan di atas."],
    fromArt: ["Make an icon from your art", "Buat ikon dari karyamu"], fromArtNote: ["Your own pieces only: fan art and client work stay as art.", "Hanya karyamu sendiri: fan art dan karya klien tetap jadi karya."],
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

  // ---- devour: a piece of art becomes an icon or the picture of a button/place ----
  // Opened after a new piece is saved in the Art tab ("admin:art-saved"), or from "Make an icon from your art" here.
  const dv = { on: false, ask: false, bm: null, title: "", zoom: 1, x: 0.5, y: 0.5, cut: true, tol: 40, target: null, list: false, err: "" };
  function dvCanvas() {
    const W = 256, cv = document.createElement("canvas"); cv.width = W; cv.height = W;
    const b = dv.bm; if (!b) return cv;
    const side = Math.min(b.width, b.height) / dv.zoom, sx = (b.width - side) * dv.x, sy = (b.height - side) * dv.y;
    const x = cv.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(b, sx, sy, side, side, 0, 0, W, W);
    if (dv.cut) {   // flood the background away from the edges: pixels close to the edge colour become see-through
      const im = x.getImageData(0, 0, W, W), d = im.data, seen = new Uint8Array(W * W), q = [];
      let r = 0, g = 0, bl = 0, n = 0;
      for (let i = 0; i < W; i++) for (const p of [i, (W - 1) * W + i, i * W, i * W + W - 1]) { r += d[p * 4]; g += d[p * 4 + 1]; bl += d[p * 4 + 2]; n++; }
      r /= n; g /= n; bl /= n;
      const near = p => Math.abs(d[p * 4] - r) + Math.abs(d[p * 4 + 1] - g) + Math.abs(d[p * 4 + 2] - bl) < dv.tol * 3;
      for (let i = 0; i < W; i++) for (const p of [i, (W - 1) * W + i, i * W, i * W + W - 1]) if (!seen[p] && near(p)) { seen[p] = 1; q.push(p); }
      while (q.length) { const p = q.pop(), px = p % W, py = (p / W) | 0; d[p * 4 + 3] = 0;
        for (const o of [px > 0 ? p - 1 : -1, px < W - 1 ? p + 1 : -1, py > 0 ? p - W : -1, py < W - 1 ? p + W : -1]) if (o >= 0 && !seen[o] && near(o)) { seen[o] = 1; q.push(o); } }
      x.putImageData(im, 0, 0);
    }
    return cv;
  }
  async function devour(src, title, ask) {
    ctx = ctx || (window.Admin && window.Admin.ctx); if (!ctx) return;
    try { dv.bm = await (src instanceof Blob ? createImageBitmap(src) : loadImg(src)); } catch (e) { return; }
    Object.assign(dv, { on: true, ask: !!ask, title: title || "", zoom: 1, x: 0.5, y: 0.5, cut: true, tol: 40, target: null, list: false, err: "" });
    dvPaint(ask ? "[data-dv=yes]" : "[data-dv=zoom]");
  }
  function dvClose() { dv.on = false; dv.bm = null; const o = document.getElementById("aiDevour"); if (o) o.remove(); const t = document.querySelector("#adminRoot .adm-main"); if (t) t.focus && t.focus({ preventScroll: true }); }
  function dvApply() {
    if (!dv.target) { dv.err = s("dvPick"); return dvPaint("[data-dv=use]"); }
    const url = toData(dvCanvas()), [kind, k] = dv.target.split("|");
    if (kind === "place") setPlace(k, null, url);
    else { const d = JSON.parse(JSON.stringify(data())); setIcon(d, k, url, "own"); ctx.setData(() => d); }
    st.msg = s("dvDone"); st.err = false; dvClose(); paint();
  }
  function ownPieces() { return (typeof PROJECTS !== "undefined" ? PROJECTS : []).filter(p => p.own && p.kind === "original" && p.full); }
  function dvPaint(focus) {
    const root = document.getElementById("adminRoot"); if (!root || !dv.on) return;
    let o = document.getElementById("aiDevour");
    if (!o) {
      o = document.createElement("div"); o.id = "aiDevour"; o.className = "ai-ov"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); root.appendChild(o);
      o.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); dvClose(); } });
      o.addEventListener("click", e => { const b = e.target.closest("[data-dv],[data-dvt],[data-dvp]"); if (!b) return;
        if (b.dataset.dvp) return pickPiece(b.dataset.dvp);
        if (b.dataset.dvt) { dv.target = b.dataset.dvt; dv.err = ""; return dvPaint(`[data-dvt="${b.dataset.dvt}"]`); }
        ({ yes: () => { dv.ask = false; dvPaint("[data-dv=zoom]"); }, no: dvClose, cancel: dvClose, use: dvApply })[b.dataset.dv]?.(); });
      o.addEventListener("input", e => { const k = e.target.dataset.dvi; if (!k) return; dv[k] = e.target.type === "checkbox" ? e.target.checked : +e.target.value;
        const c = o.querySelector(".ai-dv-prev"); if (c) { const n = dvCanvas(); c.width = n.width; c.height = n.height; c.getContext("2d").drawImage(n, 0, 0); } });
    }
    o.setAttribute("aria-label", dv.ask ? s("dvAsk") : s("dvTitle"));
    const pl = Object.keys(PLACE);
    o.innerHTML = `<div class="ai-ov-card">${dv.list ? `<h2>${esc(s("fromArt"))}</h2><p class="ai-note">${esc(s("fromArtNote"))}</p>
        <div class="ai-picker">${ownPieces().map((p, i) => `<button type="button" class="ai-pk ai-pk-art" data-dvp="${i}" title="${esc(p.title)}"><img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy"></button>`).join("")}</div>
        <div class="ai-acts"><button type="button" class="ai-btn" data-dv="cancel">${esc(s("cancel"))}</button></div>`
      : dv.ask ? `<h2>${esc(s("dvAsk"))}</h2>${dv.title ? `<p><b>${esc(dv.title)}</b></p>` : ""}<p class="ai-note">${esc(s("dvAskNote"))}</p>
        <div class="ai-acts"><button type="button" class="ai-btn pri" data-dv="yes">${esc(s("dvYes"))}</button><button type="button" class="ai-btn" data-dv="no">${esc(s("dvNo"))}</button></div>`
      : `<h2>${esc(s("dvTitle"))}</h2>${dv.title ? `<p><b>${esc(dv.title)}</b></p>` : ""}
        <canvas class="ai-dv-prev" width="256" height="256" aria-hidden="true"></canvas>
        <label class="ai-lab">${esc(s("dvZoom"))}<input type="range" min="1" max="5" step="0.05" value="${dv.zoom}" data-dvi="zoom" data-dv-r="zoom"></label>
        <label class="ai-lab">${esc(s("dvX"))}<input type="range" min="0" max="1" step="0.01" value="${dv.x}" data-dvi="x"></label>
        <label class="ai-lab">${esc(s("dvY"))}<input type="range" min="0" max="1" step="0.01" value="${dv.y}" data-dvi="y"></label>
        <label class="ai-check"><input type="checkbox" data-dvi="cut"${dv.cut ? " checked" : ""}> ${esc(s("dvCut"))}</label>
        <label class="ai-lab">${esc(s("dvTol"))}<input type="range" min="5" max="120" step="1" value="${dv.tol}" data-dvi="tol"></label>
        <h3>${esc(s("dvWhere"))}</h3><p class="ai-note">${esc(s("dvIcon"))}</p>
        <div class="ai-picker">${ICONS().map(k => `<button type="button" class="ai-pk" data-dvt="icon|${esc(k)}" aria-pressed="${dv.target === "icon|" + k}" title="${esc(base(k))}"><img src="${esc(shown(k))}" alt="${esc(base(k))}"></button>`).join("")}</div>
        <p class="ai-note">${esc(s("dvPlace"))}</p>
        <div class="ai-acts">${pl.map(id => `<button type="button" class="ai-btn" data-dvt="place|${id}" aria-pressed="${dv.target === "place|" + id}">${esc(PLACE[id][lg()])}</button>`).join("")}</div>
        ${dv.err ? `<p class="ai-msg err" role="alert">${esc(dv.err)}</p>` : ""}
        <div class="ai-acts"><button type="button" class="ai-btn pri" data-dv="use">${esc(s("dvUse"))}</button><button type="button" class="ai-btn" data-dv="cancel">${esc(s("cancel"))}</button></div>`}</div>`;
    const c = o.querySelector(".ai-dv-prev"); if (c) c.getContext("2d").drawImage(dvCanvas(), 0, 0);
    const f = focus && o.querySelector(focus.replace("[data-dv=zoom]", "[data-dvi=zoom]")); if (f) f.focus({ preventScroll: true });
  }
  async function pickPiece(i) { const p = ownPieces()[+i]; if (!p) return; dv.list = false; await devour(p.full, p.title, false); }
  function fromArt() { ctx = ctx || (window.Admin && window.Admin.ctx); Object.assign(dv, { on: true, list: true, ask: false }); dvPaint(".ai-pk-art"); }
  // The Art tab tells us when a new piece is saved; only Ekky's own pieces are offered (never fan art or client work).
  addEventListener("admin:art-saved", e => { const x = e.detail || {}; if (x.kind === "original" && x.src) devour(x.src, x.title, true); });

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
      <div class="ai-acts"><button type="button" class="ai-btn" data-fromart>${esc(s("fromArt"))}</button></div>
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
#adminRoot .ai-ov{position:fixed;inset:0;z-index:6;background:rgba(43,19,66,.55);display:flex;align-items:center;justify-content:center;padding:16px}
#adminRoot .ai-ov-card{width:min(560px,100%);max-height:100%;overflow:auto;background:var(--paper);color:var(--ink);border-radius:20px;padding:16px;display:grid;gap:10px}
#adminRoot .ai-ov-card h2{margin:0;font-size:1.15rem}#adminRoot .ai-ov-card p{margin:0}
#adminRoot .ai-dv-prev{width:160px;height:160px;justify-self:center;border-radius:14px;border:2px solid var(--line);background:conic-gradient(#eee 25%,#fff 0 50%,#eee 0 75%,#fff 0) 0 0/16px 16px}
#adminRoot .ai-lab{display:grid;gap:2px;font-weight:600;font-size:.9rem}
#adminRoot .ai-lab input[type=range],#adminRoot .ai-check input{accent-color:var(--ink)}
#adminRoot .ai-lab input[type=range]{width:100%;min-height:44px}
#adminRoot .ai-btn.pri{background:var(--accent);border-color:#b77e00;box-shadow:0 3px 0 #b77e00}
#adminRoot .ai-btn[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
#adminRoot .ai-pk-art{width:64px;height:64px;padding:0;overflow:hidden}#adminRoot .ai-pk-art img{object-fit:cover}
#adminRoot .ai-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 12px;border-radius:14px;border:2px solid var(--line);background:#fff;color:var(--ink);font:600 .88rem Fredoka,Poppins,sans-serif;cursor:pointer;text-align:center}
`;
  function render_(target, c) {
    ctx = c; el = target;
    if (!document.getElementById("aiCss")) { const x = document.createElement("style"); x.id = "aiCss"; x.textContent = STYLE; document.head.appendChild(x); }
    if (!el.dataset.ai) {
      el.dataset.ai = "1";
      el.addEventListener("click", e => {
        if (el.id !== "admTab-icons") return;
        if (e.target.closest("[data-fromart]")) return fromArt();
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
  return { render: render_, renderStyle: render, STYLES, devour };
})();
