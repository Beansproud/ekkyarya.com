// Admin image editor (docs/admin-editor.md): crop, rotate, straighten, adjustments, layers with blend modes, brush, eraser,
// eyedropper, gradient, text, shapes, history, zoom and pan. Loaded only when "Edit" is pressed in the Art tab.
// AdminEditor.open(source, {lang}) -> Promise<Blob|null>: source is a Blob, File, image URL or canvas; the Blob is the
// flattened picture (JPEG 0.95, long side up to 4096 px), null on Cancel. The form then runs its usual resizeFile.
(() => {
  if (window.AdminEditor) return;
  const MAX = 4096, BLENDS = ["source-over", "multiply", "screen", "overlay"], FONTS = ["Fredoka", "Poppins"];
  const ASPECTS = [["free", 0], ["1:1", 1], ["4:5", 4 / 5], ["3:4", 3 / 4], ["16:9", 16 / 9]];
  const TXT = {
    en: {
      title: "Edit picture", cancel: "Cancel", apply: "Apply", undo: "Undo", redo: "Redo", reset: "Reset", panel: "Panel", close: "Close",
      loading: "Opening the picture...", failed: "This picture could not be opened.", saving: "Saving...", discard: "Leave the editor without your changes?",
      tools: { move: "Move", crop: "Crop", adjust: "Adjust", brush: "Brush", eraser: "Eraser", picker: "Eyedropper", gradient: "Gradient", text: "Text", shape: "Shape", hand: "Hand" },
      primary: "Primary colour", secondary: "Secondary colour", swap: "Swap colours (X)",
      moveHint: "Drag to move the active layer.", pickHint: "Tap the picture to pick a colour.", handHint: "Drag to pan. Pinch or use the wheel to zoom.",
      textHint: "Tap the picture to place text; tap a text to select it.", gradHint: "Drag across the picture.", shapeHint: "Drag to draw.",
      free: "Free", rotL: "Rotate left", rotR: "Rotate right", flipH: "Flip horizontal", flipV: "Flip vertical", straighten: "Straighten", applyCrop: "Apply crop", resetCrop: "Reset crop",
      size: "Size", hardness: "Hardness", opacity: "Opacity", pressure: "Pen pressure", linear: "Linear", radial: "Radial", stop: "Stop", addStop: "Add stop", removeStop: "Remove stop", fromColours: "Use my colours",
      textLabel: "Text", font: "Font", weight: "Weight", rect: "Rectangle", ellipse: "Ellipse", line: "Line", fill: "Fill", outline: "Outline", width: "Width",
      adjust: "Adjustments", adjTarget: "On layer:", adjApply: "Apply adjustments", adjReset: "Reset sliders", adjText: "Pick a photo or paint layer to adjust.",
      adj: { br: "Brightness", ct: "Contrast", sat: "Saturation", hue: "Hue", temp: "Temperature", blk: "Levels: black point", mid: "Levels: midtones", wht: "Levels: white point", shp: "Sharpen" },
      layers: "Layers", history: "History", newLayer: "New layer", dup: "Duplicate", del: "Delete", up: "Move up", down: "Move down", show: "Show", hide: "Hide", blend: "Blend",
      blends: { "source-over": "Normal", multiply: "Multiply", screen: "Screen", overlay: "Overlay" },
      fit: "Fit", zoomIn: "Zoom in", zoomOut: "Zoom out",
      names: { photo: "Photo", layer: "Layer", gradient: "Gradient", shapes: "Shapes", text: "Text" },
      h: { open: "Open", crop: "Crop", rotate: "Rotate", flip: "Flip", adjust: "Adjustments", brush: "Brush", eraser: "Eraser", gradient: "Gradient", shape: "Shape",
        text: "Text", textEdit: "Edit text", move: "Move", layer: "New layer", dup: "Duplicate layer", del: "Delete layer", order: "Reorder", vis: "Show or hide", opacity: "Layer opacity", blend: "Blend mode" }
    },
    id: {
      title: "Sunting gambar", cancel: "Batal", apply: "Terapkan", undo: "Urungkan", redo: "Ulangi", reset: "Atur ulang", panel: "Panel", close: "Tutup",
      loading: "Membuka gambar...", failed: "Gambar ini tidak bisa dibuka.", saving: "Menyimpan...", discard: "Keluar dari editor tanpa perubahan?",
      tools: { move: "Geser", crop: "Potong", adjust: "Atur warna", brush: "Kuas", eraser: "Penghapus", picker: "Pipet", gradient: "Gradasi", text: "Teks", shape: "Bentuk", hand: "Tangan" },
      primary: "Warna utama", secondary: "Warna kedua", swap: "Tukar warna (X)",
      moveHint: "Seret untuk menggeser lapisan aktif.", pickHint: "Ketuk gambar untuk mengambil warna.", handHint: "Seret untuk menggeser. Cubit atau roda tetikus untuk zoom.",
      textHint: "Ketuk gambar untuk menaruh teks; ketuk teks untuk memilihnya.", gradHint: "Seret melintasi gambar.", shapeHint: "Seret untuk menggambar.",
      free: "Bebas", rotL: "Putar kiri", rotR: "Putar kanan", flipH: "Balik mendatar", flipV: "Balik tegak", straighten: "Luruskan", applyCrop: "Terapkan potongan", resetCrop: "Batalkan potongan",
      size: "Ukuran", hardness: "Ketajaman", opacity: "Opasitas", pressure: "Tekanan pena", linear: "Linear", radial: "Radial", stop: "Titik", addStop: "Tambah titik", removeStop: "Hapus titik", fromColours: "Pakai warnaku",
      textLabel: "Teks", font: "Huruf", weight: "Tebal", rect: "Persegi", ellipse: "Elips", line: "Garis", fill: "Isi", outline: "Garis tepi", width: "Lebar",
      adjust: "Penyesuaian", adjTarget: "Di lapisan:", adjApply: "Terapkan penyesuaian", adjReset: "Kembalikan slider", adjText: "Pilih lapisan foto atau lukisan untuk disesuaikan.",
      adj: { br: "Kecerahan", ct: "Kontras", sat: "Saturasi", hue: "Rona", temp: "Suhu warna", blk: "Level: titik hitam", mid: "Level: nada tengah", wht: "Level: titik putih", shp: "Pertajam" },
      layers: "Lapisan", history: "Riwayat", newLayer: "Lapisan baru", dup: "Gandakan", del: "Hapus", up: "Naikkan", down: "Turunkan", show: "Tampilkan", hide: "Sembunyikan", blend: "Campuran",
      blends: { "source-over": "Normal", multiply: "Multiply", screen: "Screen", overlay: "Overlay" },
      fit: "Pas", zoomIn: "Perbesar", zoomOut: "Perkecil",
      names: { photo: "Foto", layer: "Lapisan", gradient: "Gradasi", shapes: "Bentuk", text: "Teks" },
      h: { open: "Buka", crop: "Potong", rotate: "Putar", flip: "Balik", adjust: "Penyesuaian", brush: "Kuas", eraser: "Penghapus", gradient: "Gradasi", shape: "Bentuk",
        text: "Teks", textEdit: "Ubah teks", move: "Geser", layer: "Lapisan baru", dup: "Gandakan lapisan", del: "Hapus lapisan", order: "Urutan", vis: "Tampil atau sembunyi", opacity: "Opasitas lapisan", blend: "Mode campuran" }
    }
  };
  const TOOLS = [["move", "V"], ["crop", "C"], ["adjust", "A"], ["brush", "B"], ["eraser", "E"], ["picker", "I"], ["gradient", "G"], ["text", "T"], ["shape", "U"], ["hand", "H"]];
  const ICON = {   // 24 px line icons, stroke currentColor
    move: "M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3",
    crop: "M6 2v16h16M2 6h16v16",
    adjust: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4",
    brush: "M20 4c-3 1-8 6-10 9l2 2c3-2 8-7 9-10zM9 14c-2 0-4 2-4 4 0 1-1 2-2 2 2 1 6 1 7-2 1-1 1-3-1-4z",
    eraser: "M4 16l9-9 6 6-7 7H8zM9 11l6 6M8 20h12",
    picker: "M15 4l5 5-2 2-5-5zM13 6l-8 8-1 5 5-1 8-8",
    gradient: "M4 4h16v16H4zM8 4v16M12 4v16M16 4v16",
    text: "M5 5h14M12 5v15M9 20h6",
    shape: "M3 3h10v10H3zM17 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
    hand: "M8 12V5a1.5 1.5 0 0 1 3 0v6M11 10V4a1.5 1.5 0 0 1 3 0v6M14 10V5a1.5 1.5 0 0 1 3 0v8c0 4-3 7-7 7-3 0-4-1-6-4l-2-3a1.5 1.5 0 0 1 2.5-1.5L8 14"
  };
  const svg = d => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hex2rgb = h => { const n = parseInt(String(h).replace("#", "").padEnd(6, "0").slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgb2hex = (r, g, b) => "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
  const ADJ0 = { br: 0, ct: 0, sat: 0, hue: 0, temp: 0, blk: 0, mid: 100, wht: 255, shp: 0 };
  const ADJR = { br: [-100, 100], ct: [-100, 100], sat: [-100, 100], hue: [-180, 180], temp: [-100, 100], blk: [0, 250], mid: [10, 300], wht: [5, 255], shp: [0, 100] };

  let S = null;   // the open session
  const T = () => TXT[S && S.lang] || TXT.en;

  // ---- adjustments: levels, brightness, contrast, temperature as lookup tables; saturation and hue as a colour matrix; sharpen as a 3x3 kernel ----
  const isAdj0 = p => Object.keys(ADJ0).every(k => +p[k] === ADJ0[k]);
  function adjustData(img, p) {
    const d = img.data, w = img.width, h = img.height;
    const blk = +p.blk, wht = Math.max(blk + 1, +p.wht), gam = +p.mid / 100, C = p.ct * 2.55, cf = 259 * (C + 255) / (255 * (259 - C)), B = p.br * 1.28, Tm = p.temp * 0.35;
    const lr = new Uint8ClampedArray(256), lg = new Uint8ClampedArray(256), lb = new Uint8ClampedArray(256);
    for (let v = 0; v < 256; v++) {
      let x = clamp((v - blk) / (wht - blk), 0, 1); x = Math.pow(x, 1 / gam) * 255 + B; x = cf * (x - 128) + 128;
      lr[v] = x + Tm; lg[v] = x + Tm * 0.15; lb[v] = x - Tm;
    }
    const s = 1 + p.sat / 100, a = p.hue * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
    const H = [.213 + co * .787 - si * .213, .715 - co * .715 - si * .715, .072 - co * .072 + si * .928,
      .213 - co * .213 + si * .143, .715 + co * .285 + si * .140, .072 - co * .072 - si * .283,
      .213 - co * .213 - si * .787, .715 - co * .715 + si * .715, .072 + co * .928 + si * .072];
    const Sm = [.213 + .787 * s, .715 - .715 * s, .072 - .072 * s, .213 - .213 * s, .715 + .285 * s, .072 - .072 * s, .213 - .213 * s, .715 - .715 * s, .072 + .928 * s];
    const M = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) M.push(H[r * 3] * Sm[c] + H[r * 3 + 1] * Sm[3 + c] + H[r * 3 + 2] * Sm[6 + c]);
    const mat = !(p.sat == 0 && p.hue == 0);
    for (let i = 0; i < d.length; i += 4) {
      let r = lr[d[i]], g = lg[d[i + 1]], b = lb[d[i + 2]];
      if (mat) { const r2 = M[0] * r + M[1] * g + M[2] * b, g2 = M[3] * r + M[4] * g + M[5] * b; b = M[6] * r + M[7] * g + M[8] * b; r = r2; g = g2; }
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
    }
    if (p.shp > 0) {
      const k = p.shp / 100 * 1.2, src = new Uint8ClampedArray(d), row = w * 4;
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * row + x * 4;
        for (let c = 0; c < 3; c++) { const v = src[i + c]; d[i + c] = v + k * (4 * v - src[i + c - 4] - src[i + c + 4] - src[i + c - row] - src[i + c + row]); }
      }
    }
    return img;
  }
  function adjustCanvas(c, p) {
    const x = c.getContext("2d"), img = x.getImageData(0, 0, c.width, c.height);
    x.putImageData(adjustData(img, p), 0, 0);
  }

  // ---- layers ----
  let uid = 0;
  const layerOf = id => S.layers.find(l => l.id === id);
  const active = () => layerOf(S.active) || S.layers[S.layers.length - 1];
  const newLayer = (name, type, c) => ({ id: ++uid, name, type, c: type === "text" ? null : c || mk(S.W, S.H), opacity: 1, blend: "source-over", visible: true, dx: 0, dy: 0, text: null });
  const fontOf = tx => `${tx.weight} ${tx.size}px ${tx.font}, sans-serif`;
  function textBox(l) {
    const tx = l.text, x = mk(1, 1).getContext("2d"); x.font = fontOf(tx);
    const lines = String(tx.str || " ").split("\n"), w = Math.max(...lines.map(s => x.measureText(s).width));
    return { x: tx.x + l.dx, y: tx.y + l.dy, w, h: lines.length * tx.size * 1.15 };
  }
  // draw one layer into x (x already carries the doc transform); src replaces the layer pixels (adjust preview)
  function paintLayer(x, l, src) {
    if (l.type === "text") {
      const tx = l.text; x.fillStyle = tx.color; x.font = fontOf(tx); x.textBaseline = "top";
      String(tx.str).split("\n").forEach((s, i) => x.fillText(s, tx.x + l.dx, tx.y + l.dy + i * tx.size * 1.15));
    } else x.drawImage(src || l.c, l.dx, l.dy, S.W, S.H);
  }

  // ---- history: every entry has undo() and redo(); entry 0 is "Open" ----
  const snap = () => ({ W: S.W, H: S.H, active: S.active, layers: S.layers.map(l => ({ ...l, text: l.text && { ...l.text } })) });
  const restore = s => { S.W = s.W; S.H = s.H; S.active = s.active; S.layers = s.layers.map(l => ({ ...l, text: l.text && { ...l.text } })); };
  function push(e) { S.hist.length = S.hi + 1; S.hist.push(e); S.hi++; changed(); }
  // a change of the layer list, the doc size or layer settings (canvases are replaced, never drawn into)
  function structural(label, fn, key) {
    const last = S.hist[S.hi];
    if (key && last && last.key === key && S.hi === S.hist.length - 1) { fn(); last.after = snap(); return changed(); }
    const before = snap(); fn(); const e = { label, key, before, after: snap() };
    e.undo = () => restore(e.before); e.redo = () => restore(e.after); push(e);
  }
  // pixels drawn into one layer inside rect r; redo replays fn when given (gradients, shapes, adjustments) instead of keeping a copy
  function cropOf(c, r) { const o = mk(r.w, r.h); o.getContext("2d").drawImage(c, -r.x, -r.y); return o; }
  function putBack(id, r, img) { const l = layerOf(id); if (!l || !l.c) return; const x = l.c.getContext("2d"); x.clearRect(r.x, r.y, r.w, r.h); x.drawImage(img, r.x, r.y); }
  function clipRect(r) {
    const x0 = clamp(Math.floor(r.x), 0, S.W), y0 = clamp(Math.floor(r.y), 0, S.H), x1 = clamp(Math.ceil(r.x + r.w), 0, S.W), y1 = clamp(Math.ceil(r.y + r.h), 0, S.H);
    return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
  }
  function pixelOp(label, l, rect, fn, replay) {
    const r = clipRect(rect); if (!r) return;
    const before = cropOf(l.c, r); fn(l.c.getContext("2d")); const after = replay ? null : cropOf(l.c, r), id = l.id;
    push({ label, undo: () => putBack(id, r, before), redo: () => { if (after) putBack(id, r, after); else { putBack(id, r, before); const q = layerOf(id); q && fn(q.c.getContext("2d")); } } });
  }
  function undo() { if (S.hi > 0) { S.hist[S.hi].undo(); S.hi--; changed(); } }
  function redo() { if (S.hi < S.hist.length - 1) { S.hi++; S.hist[S.hi].redo(); changed(); } }
  function goTo(i) { while (S.hi > i) { S.hist[S.hi].undo(); S.hi--; } while (S.hi < i) { S.hi++; S.hist[S.hi].redo(); } changed(); }
  function changed() {
    if (!layerOf(S.active)) S.active = S.layers[S.layers.length - 1].id;
    if (S.crop.W !== S.W || S.crop.H !== S.H) resetCrop();
    if (S.tool === "adjust") makeProxy();
    paintTop(); if (!S.quiet) { paintOpts(); paintPanel(); } render();   // quiet while a slider or text field is in use, so it keeps the pointer and focus
  }

  // ---- flatten (Apply, eyedropper, tests) ----
  function flatten(white = true) {
    const c = mk(S.W, S.H), x = c.getContext("2d");
    if (white) { x.fillStyle = "#fff"; x.fillRect(0, 0, S.W, S.H); }
    for (const l of S.layers) if (l.visible) { x.globalAlpha = l.opacity; x.globalCompositeOperation = l.blend; paintLayer(x, l); }
    return c;
  }
  function sample(px, py) {
    const c = mk(1, 1), x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, 1, 1); x.translate(-Math.floor(px), -Math.floor(py));
    for (const l of S.layers) if (l.visible) { x.globalAlpha = l.opacity; x.globalCompositeOperation = l.blend; paintLayer(x, l); }
    const d = x.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]];
  }

  // ---- view ----
  const view = () => S.view;
  function fit() {
    const r = S.stage.getBoundingClientRect(), pad = 24, s = Math.min((r.width - pad * 2) / S.W, (r.height - pad * 2) / S.H) || 1;
    S.view = { s, ox: (r.width - S.W * s) / 2, oy: (r.height - S.H * s) / 2 }; render(); paintZoom();
  }
  function zoomAt(cx, cy, k) {
    const v = view(), s = clamp(v.s * k, 0.02, 32), dx = (cx - v.ox) / v.s, dy = (cy - v.oy) / v.s;
    S.view = { s, ox: cx - dx * s, oy: cy - dy * s }; render(); paintZoom();
  }
  function zoomTo(s) { const r = S.stage.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, s / view().s); }
  const local = e => { const r = S.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const toDoc = e => { const p = local(e), v = view(); return { x: (p.x - v.ox) / v.s, y: (p.y - v.oy) / v.s }; };

  // ---- drawing the view ----
  let raf = 0;
  const render = () => { if (!raf && S) raf = requestAnimationFrame(draw); };
  function sizeCanvas() {
    const r = S.stage.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (S.cv.width !== w || S.cv.height !== h) { S.cv.width = w; S.cv.height = h; S.comp.width = w; S.comp.height = h; S.tmp.width = w; S.tmp.height = h; }
    S.dpr = dpr;
  }
  const straightScale = (th, W, H) => { const c = Math.abs(Math.cos(th)), s = Math.abs(Math.sin(th)); return Math.max((W * c + H * s) / W, (W * s + H * c) / H); };
  function docTransform(x) {
    const v = view(), d = S.dpr; x.setTransform(d * v.s, 0, 0, d * v.s, d * v.ox, d * v.oy);
    const th = S.tool === "crop" ? S.straight * Math.PI / 180 : 0;
    if (th) { const k = straightScale(th, S.W, S.H); x.translate(S.W / 2, S.H / 2); x.rotate(th); x.scale(k, k); x.translate(-S.W / 2, -S.H / 2); }
  }
  function draw() {
    raf = 0; if (!S) return; sizeCanvas();
    const x = S.vx, cw = S.cv.width, ch = S.cv.height, v = view(), d = S.dpr;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cw, ch);
    // checkerboard under the picture (shows transparent areas)
    x.save(); x.setTransform(d, 0, 0, d, 0, 0); x.beginPath(); x.rect(v.ox, v.oy, S.W * v.s, S.H * v.s); x.clip(); x.fillStyle = S.checker; x.fillRect(0, 0, cw, ch); x.restore();
    // the layers, composited on their own canvas so blend modes do not mix with the checkerboard
    const c = S.comp.getContext("2d"); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cw, ch);
    c.save(); c.setTransform(d, 0, 0, d, 0, 0); c.beginPath(); c.rect(v.ox, v.oy, S.W * v.s, S.H * v.s); c.clip();
    const act = S.act, live = act && act.live, adj = S.tool === "adjust" && S.adj && S.adj.on ? S.adj : null;
    for (const l of S.layers) {
      if (!l.visible) continue;
      const src = adj && adj.id === l.id ? adj.out : null;
      if (live && live.layer === l.id) {
        // the stroke or gradient being drawn: show the layer as it will be after the pointer goes up
        const t = S.tmp.getContext("2d"); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, cw, ch); docTransform(t);
        t.globalAlpha = 1; t.globalCompositeOperation = "source-over"; paintLayer(t, l, src); live.draw(t);
        c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = l.opacity; c.globalCompositeOperation = l.blend; c.drawImage(S.tmp, 0, 0);
      } else { docTransform(c); c.globalAlpha = l.opacity; c.globalCompositeOperation = l.blend; paintLayer(c, l, src); }
      if (live && live.after === l.id) { docTransform(c); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; live.draw(c); }
    }
    c.restore();
    x.drawImage(S.comp, 0, 0);
    // overlays in screen pixels
    x.setTransform(d, 0, 0, d, 0, 0);
    if (S.tool === "crop") drawCrop(x);
    if (act && act.overlay) act.overlay(x);
    const a = active();
    if (a && a.type === "text" && (S.tool === "text" || S.tool === "move")) { const b = textBox(a); x.strokeStyle = "#2B1342"; x.setLineDash([6, 4]); x.lineWidth = 1.5; x.strokeRect(v.ox + b.x * v.s - 4, v.oy + b.y * v.s - 4, b.w * v.s + 8, b.h * v.s + 8); x.setLineDash([]); }
    if ((S.tool === "brush" || S.tool === "eraser") && S.hover) {
      const r = Math.max(2, S.o[S.tool].size * v.s / 2), hx = v.ox + S.hover.x * v.s, hy = v.oy + S.hover.y * v.s;
      x.lineWidth = 1; x.strokeStyle = "rgba(255,255,255,.9)"; x.beginPath(); x.arc(hx, hy, r + 1, 0, 7); x.stroke(); x.strokeStyle = "rgba(0,0,0,.8)"; x.beginPath(); x.arc(hx, hy, r, 0, 7); x.stroke();
    }
  }

  // ---- crop ----
  function resetCrop() { S.crop = { x: 0, y: 0, w: S.W, h: S.H, W: S.W, H: S.H }; S.straight = 0; }
  function setAspect(k) {
    S.o.crop.aspect = k; const r = (ASPECTS.find(a => a[0] === k) || ASPECTS[0])[1];
    if (r) { let w = S.W, h = w / r; if (h > S.H) { h = S.H; w = h * r; } S.crop = { ...S.crop, x: (S.W - w) / 2, y: (S.H - h) / 2, w, h }; }
    paintOpts(); render();
  }
  const cropRatio = () => (ASPECTS.find(a => a[0] === S.o.crop.aspect) || ASPECTS[0])[1];
  function cropHandles() {
    const v = view(), c = S.crop, X = v.ox + c.x * v.s, Y = v.oy + c.y * v.s, W = c.w * v.s, H = c.h * v.s;
    const hs = [["nw", X, Y], ["ne", X + W, Y], ["sw", X, Y + H], ["se", X + W, Y + H]];
    if (!cropRatio()) hs.push(["n", X + W / 2, Y], ["s", X + W / 2, Y + H], ["w", X, Y + H / 2], ["e", X + W, Y + H / 2]);
    return { X, Y, W, H, hs };
  }
  function drawCrop(x) {
    const { X, Y, W, H, hs } = cropHandles(), r = S.stage.getBoundingClientRect();
    x.fillStyle = "rgba(43,19,66,.45)"; x.beginPath(); x.rect(0, 0, r.width, r.height); x.rect(X, Y, W, H); x.fill("evenodd");
    x.strokeStyle = "#fff"; x.lineWidth = 2; x.strokeRect(X, Y, W, H);
    x.lineWidth = 1; x.strokeStyle = "rgba(255,255,255,.6)"; x.beginPath();
    for (const k of [1, 2]) { x.moveTo(X + W * k / 3, Y); x.lineTo(X + W * k / 3, Y + H); x.moveTo(X, Y + H * k / 3); x.lineTo(X + W, Y + H * k / 3); } x.stroke();
    for (const [, hx, hy] of hs) { x.fillStyle = "#fff"; x.strokeStyle = "#2B1342"; x.lineWidth = 2; x.fillRect(hx - 8, hy - 8, 16, 16); x.strokeRect(hx - 8, hy - 8, 16, 16); }
  }
  function cropDown(p, e) {
    const q = local(e), { X, Y, W, H, hs } = cropHandles(), hit = hs.find(h => Math.abs(q.x - h[1]) < 22 && Math.abs(q.y - h[2]) < 22);
    const c0 = { ...S.crop }, ratio = cropRatio();
    let mode = hit ? hit[0] : q.x > X && q.x < X + W && q.y > Y && q.y < Y + H ? "move" : "new";
    const anchor = mode === "new" ? { x: clamp(p.x, 0, S.W), y: clamp(p.y, 0, S.H) } : null;
    return {
      move(p2) {
        if (mode === "move") { S.crop.x = clamp(c0.x + p2.x - p.x, 0, S.W - c0.w); S.crop.y = clamp(c0.y + p2.y - p.y, 0, S.H - c0.h); return render(); }
        if (mode.length === 1) {   // an edge (free aspect only)
          let x0 = c0.x, y0 = c0.y, x1 = c0.x + c0.w, y1 = c0.y + c0.h;
          if (mode === "w") x0 = clamp(p2.x, 0, x1 - 8); if (mode === "e") x1 = clamp(p2.x, x0 + 8, S.W);
          if (mode === "n") y0 = clamp(p2.y, 0, y1 - 8); if (mode === "s") y1 = clamp(p2.y, y0 + 8, S.H);
          S.crop = { ...S.crop, x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; return render();
        }
        // a corner or a new frame: the opposite corner stays put
        const a = anchor || { x: mode.includes("w") ? c0.x + c0.w : c0.x, y: mode.includes("n") ? c0.y + c0.h : c0.y };
        const sx = p2.x >= a.x ? 1 : -1, sy = p2.y >= a.y ? 1 : -1;
        let w = Math.abs(p2.x - a.x), h = Math.abs(p2.y - a.y);
        const mw = sx > 0 ? S.W - a.x : a.x, mh = sy > 0 ? S.H - a.y : a.y;
        if (ratio) { if (w / Math.max(h, 1e-6) > ratio) h = w / ratio; else w = h * ratio; if (w > mw) { w = mw; h = w / ratio; } if (h > mh) { h = mh; w = h * ratio; } }
        else { w = Math.min(w, mw); h = Math.min(h, mh); }
        w = Math.max(w, 8); h = Math.max(h, 8);
        S.crop = { ...S.crop, x: sx > 0 ? a.x : a.x - w, y: sy > 0 ? a.y : a.y - h, w, h }; render();
      },
      up() { paintOpts(); }
    };
  }
  // replace every layer with a new canvas nw x nh drawn through tf(ctx); text layers become paint layers
  function rebuild(nw, nh, tf) {
    S.layers = S.layers.map(l => { const c = mk(nw, nh), x = c.getContext("2d"); tf(x); paintLayer(x, l); return { ...l, c, type: l.type === "text" ? "paint" : l.type, text: null, dx: 0, dy: 0 }; });
  }
  function applyCrop() {
    const th = S.straight * Math.PI / 180, r = { x: Math.round(S.crop.x), y: Math.round(S.crop.y), w: Math.round(S.crop.w), h: Math.round(S.crop.h) };
    const full = r.x <= 0 && r.y <= 0 && r.w >= S.W && r.h >= S.H;
    if (!th && full) return;
    structural(T().h.crop, () => {
      if (th) { const k = straightScale(th, S.W, S.H), W = S.W, H = S.H; rebuild(W, H, x => { x.translate(W / 2, H / 2); x.rotate(th); x.scale(k, k); x.translate(-W / 2, -H / 2); }); }
      if (!full) {
        S.layers = S.layers.map(l => l.type === "text" ? { ...l, text: { ...l.text, x: l.text.x - r.x, y: l.text.y - r.y } } : { ...l, c: cropOf(l.c, r) });
        S.W = r.w; S.H = r.h;
      }
    });
    resetCrop(); S.o.crop.aspect = "free"; fit(); paintOpts();
  }
  function rotate90(dir) {
    const W = S.W, H = S.H;
    structural(T().h.rotate, () => { rebuild(H, W, x => { if (dir > 0) { x.translate(H, 0); x.rotate(Math.PI / 2); } else { x.translate(0, W); x.rotate(-Math.PI / 2); } }); S.W = H; S.H = W; });
    fit();
  }
  function flip(horiz) {
    const W = S.W, H = S.H;
    structural(T().h.flip, () => rebuild(W, H, x => { if (horiz) { x.translate(W, 0); x.scale(-1, 1); } else { x.translate(0, H); x.scale(1, -1); } }));
  }

  // ---- adjustments with a live preview on a small copy ----
  function makeProxy() {
    const l = active();
    if (!l || l.type === "text") { S.adj = null; return; }
    const k = Math.min(1, 1024 / Math.max(S.W, S.H)), proxy = mk(S.W * k, S.H * k);
    proxy.getContext("2d").drawImage(l.c, 0, 0, proxy.width, proxy.height);
    S.adj = { id: l.id, proxy, out: mk(proxy.width, proxy.height), on: false };
    preview();
  }
  function preview() {
    const a = S.adj; if (!a) return render();
    a.on = !isAdj0(S.o.adj);
    if (a.on) { const x = a.out.getContext("2d"); x.clearRect(0, 0, a.out.width, a.out.height); x.drawImage(a.proxy, 0, 0); adjustCanvas(a.out, S.o.adj); }
    render();
  }
  function applyAdjust() {
    const l = active(); if (!l || l.type === "text" || isAdj0(S.o.adj)) return;
    const p = { ...S.o.adj };
    pixelOp(T().h.adjust, l, { x: 0, y: 0, w: S.W, h: S.H }, x => adjustCanvas(x.canvas, p), true);
    S.o.adj = { ...ADJ0 }; makeProxy(); paintPanel();
  }

  // ---- brush and eraser: round stamps into a stroke buffer, committed with the tool opacity on pointer up ----
  function tipFor(color, hard) {
    const n = 256, c = mk(n, n), x = c.getContext("2d"), [r, g, b] = hex2rgb(color), h = clamp(hard, 0, .98);
    const gr = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(h, `rgba(${r},${g},${b},1)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, n, n); return c;
  }
  // the layer a paint tool draws on: the active photo or paint layer; a text layer gets a new layer above it
  function paintTarget(name, needNew) {
    const a = active();
    if (a.type === "text" || (needNew && a.type === "photo")) addLayer(name);
    return active();
  }
  function strokeDown(p, e) {
    const erase = S.tool === "eraser", o = S.o[S.tool];
    if (erase && active().type === "text") return null;
    const l = erase ? active() : paintTarget(T().names.layer, false);
    const buf = S.buf.width === S.W && S.buf.height === S.H ? S.buf : (S.buf = mk(S.W, S.H));
    const bx = buf.getContext("2d"); bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, S.W, S.H);
    const tip = tipFor(erase ? "#000000" : S.c1, o.hard / 100);
    const dirty = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const pres = ev => !o.pres || ev.pointerType !== "pen" ? 1 : clamp(ev.pressure || 0.5, 0.05, 1);
    let last = { ...p, pr: pres(e) }, carry = 0;
    const stamp = (x, y, pr) => {
      const s = Math.max(1, o.size * pr); bx.drawImage(tip, x - s / 2, y - s / 2, s, s);
      dirty.x0 = Math.min(dirty.x0, x - s); dirty.y0 = Math.min(dirty.y0, y - s); dirty.x1 = Math.max(dirty.x1, x + s); dirty.y1 = Math.max(dirty.y1, y + s);
    };
    stamp(p.x, p.y, last.pr);
    const live = { layer: l.id, draw: t => { t.globalAlpha = o.opa / 100; t.globalCompositeOperation = erase ? "destination-out" : "source-over"; t.drawImage(buf, 0, 0); t.globalAlpha = 1; t.globalCompositeOperation = "source-over"; } };
    render();
    return {
      live,
      move(p2, ev) {
        const pr = pres(ev), dx = p2.x - last.x, dy = p2.y - last.y, dist = Math.hypot(dx, dy), step = Math.max(0.5, o.size * 0.1 * Math.min(pr, last.pr));
        let s = step - carry;
        for (; s <= dist; s += step) { const k = s / dist; stamp(last.x + dx * k, last.y + dy * k, last.pr + (pr - last.pr) * k); }
        carry = dist - (s - step); last = { ...p2, pr }; render();
      },
      up() {
        const r = { x: dirty.x0, y: dirty.y0, w: dirty.x1 - dirty.x0, h: dirty.y1 - dirty.y0 };
        pixelOp(T().h[S.tool], l, r, x => live.draw(x));
        bx.clearRect(0, 0, S.W, S.H);
      }
    };
  }

  // ---- eyedropper ----
  function pick(p) { if (p.x < 0 || p.y < 0 || p.x >= S.W || p.y >= S.H) return; S.c1 = rgb2hex(...sample(p.x, p.y)); paintColors(); paintOpts(); }

  // ---- gradient ----
  function gradientPaint(x, a, b, g, W, H) {
    const gr = g.kind === "radial" ? x.createRadialGradient(a.x, a.y, 0, a.x, a.y, Math.max(1, Math.hypot(b.x - a.x, b.y - a.y))) : x.createLinearGradient(a.x, a.y, b.x, b.y);
    g.stops.slice().sort((m, n) => m.p - n.p).forEach(s => gr.addColorStop(clamp(s.p / 100, 0, 1), s.c));
    x.globalAlpha = g.opa / 100; x.globalCompositeOperation = "source-over"; x.fillStyle = gr; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
  }
  function gradDown(p) {
    const g = JSON.parse(JSON.stringify(S.o.gradient)), a = active(), onNew = a.type !== "paint";
    let b = { ...p };
    const live = onNew ? { after: a.id } : { layer: a.id };
    live.draw = t => { if (Math.hypot(b.x - p.x, b.y - p.y) > 1) gradientPaint(t, p, b, g, S.W, S.H); };
    return {
      live,
      move(p2) { b = p2; render(); },
      overlay(x) { const v = view(); x.strokeStyle = "#fff"; x.lineWidth = 2; x.beginPath(); x.moveTo(v.ox + p.x * v.s, v.oy + p.y * v.s); x.lineTo(v.ox + b.x * v.s, v.oy + b.y * v.s); x.stroke();
        for (const q of [p, b]) { x.fillStyle = "#2B1342"; x.beginPath(); x.arc(v.ox + q.x * v.s, v.oy + q.y * v.s, 6, 0, 7); x.fill(); } },
      up() {
        if (Math.hypot(b.x - p.x, b.y - p.y) <= 1) return;
        const l = onNew ? (addLayer(T().names.gradient), active()) : a, W = S.W, H = S.H, e = { ...b };
        pixelOp(T().h.gradient, l, { x: 0, y: 0, w: W, h: H }, x => gradientPaint(x, p, e, g, W, H), true);
      }
    };
  }

  // ---- shapes ----
  function shapePaint(x, a, b, o, c1, c2) {
    x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; x.lineWidth = o.sw; x.lineJoin = "round"; x.lineCap = "round";
    x.beginPath();
    if (o.kind === "line") { x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.strokeStyle = c1; x.stroke(); return; }
    const X = Math.min(a.x, b.x), Y = Math.min(a.y, b.y), W = Math.abs(b.x - a.x), H = Math.abs(b.y - a.y);
    if (o.kind === "ellipse") x.ellipse(X + W / 2, Y + H / 2, W / 2, H / 2, 0, 0, Math.PI * 2); else x.rect(X, Y, W, H);
    if (o.fill) { x.fillStyle = c1; x.fill(); }
    if (o.stroke || !o.fill) { x.strokeStyle = o.fill ? c2 : c1; x.stroke(); }
  }
  function shapeDown(p, e) {
    const o = { ...S.o.shape }, a = active(), onNew = a.type !== "paint", c1 = S.c1, c2 = S.c2;
    let b = { ...p };
    const live = onNew ? { after: a.id } : { layer: a.id };
    live.draw = t => shapePaint(t, p, b, o, c1, c2);
    return {
      live,
      move(p2, ev) {
        b = { ...p2 };
        if (ev.shiftKey && o.kind !== "line") { const d = Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y)); b = { x: p.x + Math.sign(b.x - p.x || 1) * d, y: p.y + Math.sign(b.y - p.y || 1) * d }; }
        render();
      },
      up() {
        if (Math.hypot(b.x - p.x, b.y - p.y) <= 1) return;
        const l = onNew ? (addLayer(T().names.shapes), active()) : a, e2 = { ...b }, m = o.sw + 2;
        pixelOp(T().h.shape, l, { x: Math.min(p.x, e2.x) - m, y: Math.min(p.y, e2.y) - m, w: Math.abs(e2.x - p.x) + m * 2, h: Math.abs(e2.y - p.y) + m * 2 }, x => shapePaint(x, p, e2, o, c1, c2), true);
      }
    };
  }

  // ---- text ----
  function textDown(p) {
    const hit = S.layers.slice().reverse().find(l => l.type === "text" && l.visible && (b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h)(textBox(l)));
    if (hit) { S.active = hit.id; paintPanel(); paintOpts(); return moveDown(p); }
    const o = S.o.text;
    structural(T().h.text, () => {
      const l = newLayer(T().names.text, "text"); l.text = { str: o.str || "Ekky", font: o.font, size: o.size, weight: o.weight, color: S.c1, x: p.x, y: p.y - o.size / 2 };
      const i = S.layers.indexOf(active()); S.layers.splice(i + 1, 0, l); S.active = l.id;
    });
    loadFont(); setTimeout(() => { const f = S && S.root.querySelector("[data-o='text.str']"); if (f && matchMedia("(pointer:fine)").matches) { f.focus(); f.select(); } }, 30);
    return null;
  }
  function setText(k, v) {
    S.o.text[k] = v;
    const l = active();
    if (l && l.type === "text") structural(T().h.textEdit, () => { S.layers = S.layers.map(q => q.id === l.id ? { ...q, text: { ...q.text, [k]: v } } : q); }, "tx" + l.id);
    if (k === "font" || k === "weight") loadFont();
  }
  function loadFont() {
    const l = active(); if (!l || l.type !== "text" || !document.fonts || !document.fonts.load) return;
    document.fonts.load(fontOf(l.text)).then(render, () => {});
  }

  // ---- move ----
  function moveDown(p) {
    const l = active(); if (!l) return null;
    const id = l.id;
    return {
      move(p2) { const q = layerOf(id); if (q) { q.dx = p2.x - p.x; q.dy = p2.y - p.y; render(); } },
      up() {
        const q = layerOf(id); if (!q || (!q.dx && !q.dy)) return;
        const dx = q.dx, dy = q.dy; q.dx = 0; q.dy = 0;
        structural(T().h.move, () => {
          S.layers = S.layers.map(m => {
            if (m.id !== id) return m;
            if (m.type === "text") return { ...m, text: { ...m.text, x: m.text.x + dx, y: m.text.y + dy } };
            const c = mk(S.W, S.H); c.getContext("2d").drawImage(m.c, dx, dy); return { ...m, c };
          });
        });
      }
    };
  }

  // ---- layer actions ----
  function addLayer(name) {
    structural(T().h.layer, () => {
      const n = S.layers.filter(l => l.type === "paint").length + 1, l = newLayer(name || T().names.layer + " " + n, "paint");
      const i = S.layers.indexOf(active()); S.layers.splice(i + 1, 0, l); S.active = l.id;
    });
  }
  function dupLayer() {
    const a = active();
    structural(T().h.dup, () => {
      const l = { ...a, id: ++uid, name: a.name + " 2", type: a.type === "photo" ? "paint" : a.type, text: a.text && { ...a.text } };
      if (a.c) { l.c = mk(S.W, S.H); l.c.getContext("2d").drawImage(a.c, 0, 0); }
      S.layers.splice(S.layers.indexOf(a) + 1, 0, l); S.active = l.id;
    });
  }
  function delLayer() {
    if (S.layers.length < 2) return;
    const a = active(), i = S.layers.indexOf(a);
    structural(T().h.del, () => { S.layers = S.layers.filter(l => l !== a); S.active = (S.layers[i - 1] || S.layers[0]).id; });
  }
  function moveLayer(dir) {
    const a = active(), i = S.layers.indexOf(a), j = i + dir;
    if (j < 0 || j >= S.layers.length) return;
    structural(T().h.order, () => { const L = S.layers.slice(); L[i] = L[j]; L[j] = a; S.layers = L; });
  }
  const setLayer = (id, k, v, label, key) => structural(label, () => { S.layers = S.layers.map(l => l.id === id ? { ...l, [k]: v } : l); }, key);

  // ---- pointer input ----
  const DOWN = { move: moveDown, crop: cropDown, brush: strokeDown, eraser: strokeDown, gradient: gradDown, shape: shapeDown, text: textDown,
    picker: p => { pick(p); return { move: pick, up() {} }; } };
  function onDown(e) {
    if (!S) return;
    e.preventDefault();
    try { S.cv.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
    if (document.activeElement && document.activeElement !== S.cv && S.root.contains(document.activeElement)) document.activeElement.blur();
    S.ptrs.set(e.pointerId, local(e));
    if (S.ptrs.size === 2) {   // two fingers: drop what the first finger started and pinch
      if (S.act && S.act.live) S.act = null;
      const [a, b] = [...S.ptrs.values()]; S.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v: { ...view() } }; S.act = null; return render();
    }
    if (S.ptrs.size > 2 || S.pinch) return;
    if (e.button === 1 || S.space || S.tool === "hand" || S.tool === "adjust") { const q = local(e); S.act = { pan: true, x: q.x, y: q.y, v: { ...view() } }; return; }
    if (e.button === 2) return;
    const p = toDoc(e);
    if (e.altKey && (S.tool === "brush" || S.tool === "shape" || S.tool === "gradient" || S.tool === "text")) { pick(p); return; }
    S.act = (DOWN[S.tool] || (() => null))(p, e);
  }
  function onMove(e) {
    if (!S) return;
    if (S.ptrs.has(e.pointerId)) S.ptrs.set(e.pointerId, local(e));
    if (S.pinch) {
      if (S.ptrs.size < 2) return;
      const [a, b] = [...S.ptrs.values()], P = S.pinch, d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const s = clamp(P.v.s * d / P.d, 0.02, 32), dx = (P.m.x - P.v.ox) / P.v.s, dy = (P.m.y - P.v.oy) / P.v.s;
      S.view = { s, ox: m.x - dx * s, oy: m.y - dy * s }; render(); paintZoom(); return;
    }
    if (e.pointerType !== "touch") { S.hover = toDoc(e); if (!S.act) render(); }
    const a = S.act; if (!a) return;
    if (a.pan) { const q = local(e); S.view = { ...a.v, ox: a.v.ox + q.x - a.x, oy: a.v.oy + q.y - a.y }; return render(); }
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ce of evs.length ? evs : [e]) a.move && a.move(toDoc(ce), ce);
  }
  function onUp(e) {
    if (!S) return;
    S.ptrs.delete(e.pointerId);
    if (S.pinch) { if (S.ptrs.size === 0) S.pinch = null; return; }
    const a = S.act; S.act = null;
    if (a && a.up && e.type !== "pointercancel") a.up(toDoc(e), e);
    render();
  }

  // ---- keys (desktop) ----
  // Esc and Back close the innermost thing first: the phone panel, a crop frame in progress, then the editor (as Cancel)
  function escape() {
    if (!S || Date.now() - (S.escAt || 0) < 300) return; S.escAt = Date.now();
    if (S.panelOpen && S.narrow) { S.panelOpen = false; paintPanel(); return paintTop(); }
    const c = S.crop; if (S.tool === "crop" && c.W && (S.straight || c.x > 0 || c.y > 0 || c.w < S.W || c.h < S.H)) return ACTIONS.resetCrop();
    ACTIONS.cancel();
  }
  // Back: the editor has its own history entry; Back closes it like Cancel and never reaches the page under it
  function onPop(e) {
    if (!S || !S.pushed) return;
    e.stopImmediatePropagation();
    if (S.skipPop) { S.skipPop = false; return; }
    S.pushed = false;
    if (S.hi > 0 && !confirm(T().discard)) return pushEntry();   // stay: the edits are kept
    finish(null);
  }
  function pushEntry() { try { history.pushState(Object.assign({}, history.state, { ae: 1 }), ""); S.pushed = true; } catch (e) { S.pushed = false; } }
  function onKey(e) {
    if (!S) return;
    if (e.key === "Escape") { e.preventDefault(); return escape(); }
    const tg = e.target, typing = tg && (tg.tagName === "TEXTAREA" || (tg.tagName === "INPUT" && /^(text|number|search)$/i.test(tg.type)));
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (mod && k === "z") { e.preventDefault(); return e.shiftKey ? redo() : undo(); }
    if (mod && k === "y") { e.preventDefault(); return redo(); }
    if (typing) return;
    if (mod && (k === "0")) { e.preventDefault(); return fit(); }
    if (mod && (k === "1")) { e.preventDefault(); return zoomTo(1); }
    if (mod && (k === "=" || k === "+")) { e.preventDefault(); return zoomTo(view().s * 1.25); }
    if (mod && k === "-") { e.preventDefault(); return zoomTo(view().s / 1.25); }
    if (mod && k === "j") { e.preventDefault(); return dupLayer(); }
    if (mod && e.shiftKey && k === "n") { e.preventDefault(); return addLayer(); }
    if (mod && (k === "l" || k === "u")) { e.preventDefault(); return setTool("adjust"); }
    if (mod || e.altKey) return;
    if (e.key === " ") { if (!S.space) { S.space = true; S.cv.style.cursor = "grab"; } e.preventDefault(); return; }
    if (e.key === "Enter" && S.tool === "crop") { e.preventDefault(); return applyCrop(); }
    const tool = TOOLS.find(t => t[1].toLowerCase() === k);
    if (tool) return setTool(tool[0]);
    const o = S.o[S.tool];
    if ((e.key === "[" || e.key === "]" || e.key === "{" || e.key === "}") && o && o.size) {
      const up = e.key === "]" || e.key === "}";
      if (e.shiftKey) o.hard = clamp(o.hard + (up ? 10 : -10), 0, 100); else o.size = clamp(Math.round(o.size * (up ? 1.2 : 1 / 1.2)), 1, 1000);
      paintOpts(); return render();
    }
    if (/^[0-9]$/.test(e.key) && o && o.opa != null) { o.opa = e.key === "0" ? 100 : +e.key * 10; return paintOpts(); }
    if (k === "x") { [S.c1, S.c2] = [S.c2, S.c1]; return paintColors(); }
    if (k === "d") { S.c1 = "#000000"; S.c2 = "#ffffff"; return paintColors(); }
  }
  function onKeyUp(e) { if (S && e.key === " ") { S.space = false; S.cv.style.cursor = ""; } }

  // ---- UI ----
  function setTool(id) {
    if (S.tool === "crop" && id !== "crop") { resetCrop(); }
    S.tool = id; S.act = null;
    if (id === "adjust") { makeProxy(); if (S.narrow) S.panelOpen = true; } else { if (S.adj && S.narrow) S.panelOpen = false; S.adj = null; }
    paintTools(); paintOpts(); paintPanel(); paintTop(); render();
    const tb = S.root.querySelector(`[data-tool="${id}"]`); if (tb && tb.scrollIntoView) tb.scrollIntoView({ block: "nearest", inline: "nearest" });
    S.cv.style.cursor = id === "hand" ? "grab" : id === "move" ? "move" : id === "text" ? "text" : "crosshair";
  }
  const btn = (a, label, extra = "", cls = "") => `<button type="button" class="ae-btn ${cls}" data-a="${a}" ${extra}>${esc(label)}</button>`;
  const rng = (o, label, min, max, val, step = 1) => `<label class="ae-rng"><span>${esc(label)} <b>${esc(Math.round(val * 100) / 100)}</b></span><input type="range" data-o="${o}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
  function paintTop() {
    const t = T(), el = S.root.querySelector(".ae-top");
    el.innerHTML = `${btn("cancel", t.cancel)}<h2>${esc(t.title)}</h2>
      ${btn("undo", t.undo, S.hi > 0 ? 'aria-keyshortcuts="Control+Z"' : "disabled")}${btn("redo", t.redo, S.hi < S.hist.length - 1 ? 'aria-keyshortcuts="Control+Shift+Z"' : "disabled")}
      ${btn("reset", t.reset, S.hi > 0 ? "" : "disabled", "ae-wide")}${btn("panel", t.panel, `aria-pressed="${!!S.panelOpen}"`, "ae-narrow")}${btn("apply", t.apply, "", "pri")}`;
  }
  function paintTools() {
    const t = T(), el = S.root.querySelector(".ae-tools");
    el.innerHTML = TOOLS.map(([id, key]) => `<button type="button" class="ae-tool" data-tool="${id}" aria-pressed="${S.tool === id}" title="${esc(t.tools[id])} (${key})" aria-label="${esc(t.tools[id])}" aria-keyshortcuts="${key}">${svg(ICON[id])}<span>${esc(t.tools[id])}</span></button>`).join("") +
      `<div class="ae-colors"><label class="ae-sw" title="${esc(t.primary)}"><input type="color" data-c="c1" aria-label="${esc(t.primary)}"></label>
        <label class="ae-sw ae-sw2" title="${esc(t.secondary)}"><input type="color" data-c="c2" aria-label="${esc(t.secondary)}"></label>
        <button type="button" class="ae-btn ae-swap" data-a="swap" title="${esc(t.swap)}" aria-label="${esc(t.swap)}">X</button></div>`;
    paintColors();
  }
  function paintColors() {
    S.root.querySelectorAll("[data-c]").forEach(i => { i.value = S[i.dataset.c]; i.parentElement.style.background = S[i.dataset.c]; });
  }
  function paintZoom() { const z = S.root.querySelector("[data-a=zoomFit]"); if (z) z.textContent = Math.round(view().s * 100) + " %"; }
  function paintOpts() {
    const t = T(), el = S.root.querySelector(".ae-opts"), o = S.o, tool = S.tool;
    let h = "";
    if (tool === "move") h = `<p>${esc(t.moveHint)}</p>`;
    else if (tool === "picker") h = `<span class="ae-chip" style="background:${esc(S.c1)}"></span><p>${esc(t.pickHint)} ${esc(S.c1)}</p>`;
    else if (tool === "hand") h = `<p>${esc(t.handHint)}</p>`;
    else if (tool === "crop") {
      h = ASPECTS.map(([k]) => btn("aspect", k === "free" ? t.free : k, `data-v="${k}" aria-pressed="${o.crop.aspect === k}"`)).join("") +
        `<span class="ae-sep"></span>${btn("rotL", t.rotL)}${btn("rotR", t.rotR)}${btn("flipH", t.flipH)}${btn("flipV", t.flipV)}
        ${rng("straight", t.straighten, -45, 45, S.straight, 0.5)}${btn("resetCrop", t.resetCrop)}${btn("applyCrop", t.applyCrop, "", "pri")}`;
    } else if (tool === "brush" || tool === "eraser") {
      const b = o[tool];
      h = `${rng(tool + ".size", t.size, 1, 500, b.size)}${rng(tool + ".hard", t.hardness, 0, 100, b.hard)}${rng(tool + ".opa", t.opacity, 1, 100, b.opa)}
        <label class="ae-chk"><input type="checkbox" data-o="${tool}.pres"${b.pres ? " checked" : ""}><span>${esc(t.pressure)}</span></label>`;
    } else if (tool === "gradient") {
      const g = o.gradient;
      h = btn("gkind", t.linear, `data-v="linear" aria-pressed="${g.kind === "linear"}"`) + btn("gkind", t.radial, `data-v="radial" aria-pressed="${g.kind === "radial"}"`) +
        g.stops.map((s, i) => `<span class="ae-stop"><label class="ae-sw ae-swsm" style="background:${esc(s.c)}" title="${esc(t.stop)} ${i + 1}"><input type="color" data-o="gradient.stops.${i}.c" value="${esc(s.c)}" aria-label="${esc(t.stop)} ${i + 1}"></label>
          <input type="range" data-o="gradient.stops.${i}.p" min="0" max="100" value="${s.p}" aria-label="${esc(t.stop)} ${i + 1} %">${g.stops.length > 2 ? btn("delStop", "-", `data-v="${i}" aria-label="${esc(t.removeStop)}"`) : ""}</span>`).join("") +
        (g.stops.length < 4 ? btn("addStop", t.addStop) : "") + btn("gFromColors", t.fromColours) + rng("gradient.opa", t.opacity, 1, 100, g.opa) + `<p>${esc(t.gradHint)}</p>`;
    } else if (tool === "text") {
      const a = active(), tx = a && a.type === "text" ? a.text : o.text;
      h = `<label class="ae-txt"><span>${esc(t.textLabel)}</span><input type="text" data-o="text.str" value="${esc(tx.str)}" maxlength="200"></label>
        <label class="ae-sel"><span>${esc(t.font)}</span><select data-o="text.font">${FONTS.map(f => `<option${tx.font === f ? " selected" : ""}>${f}</option>`).join("")}</select></label>
        <label class="ae-sel"><span>${esc(t.weight)}</span><select data-o="text.weight">${[400, 500, 600, 700].map(w => `<option${+tx.weight === w ? " selected" : ""}>${w}</option>`).join("")}</select></label>
        ${rng("text.size", t.size, 8, 800, tx.size)}<p>${esc(t.textHint)}</p>`;
    } else if (tool === "shape") {
      const s = o.shape;
      h = ["rect", "ellipse", "line"].map(k => btn("skind", t[k], `data-v="${k}" aria-pressed="${s.kind === k}"`)).join("") +
        `<label class="ae-chk"><input type="checkbox" data-o="shape.fill"${s.fill ? " checked" : ""}><span>${esc(t.fill)}</span></label>
        <label class="ae-chk"><input type="checkbox" data-o="shape.stroke"${s.stroke ? " checked" : ""}><span>${esc(t.outline)}</span></label>${rng("shape.sw", t.width, 1, 200, s.sw)}<p>${esc(t.shapeHint)}</p>`;
    } else if (tool === "adjust") {
      const a = active();
      h = a && a.type !== "text" ? `<p>${esc(t.adjTarget)} <b>${esc(a.name)}</b></p>${btn("adjReset", t.adjReset)}${btn("adjApply", t.adjApply, "", "pri")}` : `<p>${esc(t.adjText)}</p>`;
    }
    el.innerHTML = h;
  }
  function paintPanel() {
    const t = T(), el = S.root.querySelector(".ae-panel"), a = active();
    S.root.classList.toggle("ae-open", !!S.panelOpen);
    let h = `<button type="button" class="ae-btn ae-narrow ae-pclose" data-a="panel">${esc(t.close)}</button>`;
    if (S.tool === "adjust") {
      h += `<section><h3>${esc(t.adjust)}</h3>${a && a.type !== "text" ? Object.keys(ADJ0).map(k => rng("adj." + k, t.adj[k], ADJR[k][0], ADJR[k][1], S.o.adj[k])).join("") +
        `<div class="ae-row">${btn("adjReset", t.adjReset)}${btn("adjApply", t.adjApply, "", "pri")}</div>` : `<p>${esc(t.adjText)}</p>`}</section>`;
    }
    h += `<section><h3>${esc(t.layers)}</h3><ol class="ae-layers">${S.layers.slice().reverse().map(l => `<li class="${l.id === S.active ? "on" : ""}">
        <button type="button" class="ae-btn ae-eye" data-a="vis" data-v="${l.id}" aria-pressed="${l.visible}" aria-label="${esc(l.visible ? t.hide : t.show)}: ${esc(l.name)}">${l.visible ? svg("M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z") : svg("M3 3l18 18M2 12s4-7 10-7c2 0 4 1 5 2M22 12s-4 7-10 7c-2 0-4-1-5-2")}</button>
        <button type="button" class="ae-lname" data-a="pickLayer" data-v="${l.id}" aria-pressed="${l.id === S.active}">${esc(l.name)}${l.type === "text" ? ` <small>"${esc(String(l.text.str).slice(0, 14))}"</small>` : ""}${l.opacity < 1 || l.blend !== "source-over" ? ` <small>${Math.round(l.opacity * 100)} % ${esc(t.blends[l.blend])}</small>` : ""}</button></li>`).join("")}</ol>
      ${a ? `${rng("layer.opacity", t.opacity, 0, 100, Math.round(a.opacity * 100))}
      <label class="ae-sel"><span>${esc(t.blend)}</span><select data-o="layer.blend">${BLENDS.map(b => `<option value="${b}"${a.blend === b ? " selected" : ""}>${esc(t.blends[b])}</option>`).join("")}</select></label>` : ""}
      <div class="ae-row">${btn("newLayer", t.newLayer)}${btn("dup", t.dup)}${btn("up", t.up)}${btn("down", t.down)}${btn("del", t.del, S.layers.length < 2 ? "disabled" : "")}</div></section>
      <section><h3>${esc(t.history)}</h3><div class="ae-row ae-narrow">${btn("reset", t.reset, S.hi > 0 ? "" : "disabled")}</div><ol class="ae-hist">${S.hist.map((e, i) => `<li><button type="button" class="ae-btn${i === S.hi ? " on" : ""}${i > S.hi ? " ae-future" : ""}" data-a="goto" data-v="${i}" aria-current="${i === S.hi}">${esc(e.label)}</button></li>`).join("")}</ol></section>`;
    el.innerHTML = h;
    const hl = el.querySelector(".ae-hist"); if (hl) hl.scrollTop = hl.scrollHeight;
  }

  const ACTIONS = {
    cancel: () => { if (S.hi > 0 && !confirm(T().discard)) return; finish(null); },
    apply: () => finishApply(),
    undo, redo, reset: () => goTo(0),
    panel: () => { S.panelOpen = !S.panelOpen; paintPanel(); paintTop(); },
    swap: () => { [S.c1, S.c2] = [S.c2, S.c1]; paintColors(); },
    aspect: v => setAspect(v), rotL: () => rotate90(-1), rotR: () => rotate90(1), flipH: () => flip(true), flipV: () => flip(false),
    applyCrop, resetCrop: () => { resetCrop(); S.o.crop.aspect = "free"; paintOpts(); render(); },
    gkind: v => { S.o.gradient.kind = v; paintOpts(); },
    addStop: () => { const g = S.o.gradient; if (g.stops.length < 4) { g.stops.push({ c: S.c2, p: 50 }); g.stops.sort((a, b) => a.p - b.p); } paintOpts(); },
    delStop: v => { const g = S.o.gradient; if (g.stops.length > 2) g.stops.splice(+v, 1); paintOpts(); },
    gFromColors: () => { S.o.gradient.stops = [{ c: S.c1, p: 0 }, { c: S.c2, p: 100 }]; paintOpts(); },
    skind: v => { S.o.shape.kind = v; paintOpts(); },
    adjReset: () => { S.o.adj = { ...ADJ0 }; preview(); paintPanel(); },
    adjApply: applyAdjust,
    vis: v => { const l = layerOf(+v); if (l) setLayer(l.id, "visible", !l.visible, T().h.vis); },
    pickLayer: v => { S.active = +v; if (S.tool === "adjust") makeProxy(); paintPanel(); paintOpts(); render(); },
    newLayer: () => addLayer(), dup: dupLayer, del: delLayer, up: () => moveLayer(1), down: () => moveLayer(-1),
    goto: v => goTo(+v),
    zoomIn: () => zoomTo(view().s * 1.25), zoomOut: () => zoomTo(view().s / 1.25), zoomFit: fit
  };
  function onInput(e) { S.quiet = true; try { input(e); } finally { S.quiet = false; } }
  function input(e) {
    const i = e.target, path = i.dataset.o, c = i.dataset.c;
    if (c) {
      S[c] = i.value; i.parentElement.style.background = i.value;
      const a = active(); if (c === "c1" && a && a.type === "text" && (S.tool === "text" || S.tool === "move")) { setText("color", i.value); render(); }
      return;
    }
    if (!path) return;
    const val = i.type === "checkbox" ? i.checked : i.type === "range" ? +i.value : i.value;
    const lab = i.closest(".ae-rng"); if (lab) lab.querySelector("b").textContent = val;
    const [head, ...rest] = path.split(".");
    if (head === "straight") { S.straight = val; return render(); }
    if (head === "layer") { const a = active(); if (rest[0] === "opacity") setLayer(a.id, "opacity", val / 100, T().h.opacity, "op" + a.id); else setLayer(a.id, "blend", val, T().h.blend); return; }
    if (head === "text") { setText(rest[0], rest[0] === "size" || rest[0] === "weight" ? +val : val); return render(); }
    let o = S.o[head]; for (let k = 0; k < rest.length - 1; k++) o = o[rest[k]];
    o[rest[rest.length - 1]] = val;
    if (head === "adj") preview();
    if (head === "gradient" && i.type === "color") i.parentElement.style.background = val;
    render();
  }

  // ---- open and close ----
  const CSS = `
#aeRoot{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;border-radius:0;display:none;flex-direction:column;overflow:hidden;z-index:100000;
  background:var(--paper);color:var(--ink);font-family:Fredoka,Poppins,sans-serif;--ink:#2B1342;--paper:#FFF8EC;--line:#e5d8bd;--accent:#FFB400;--card:#fff;--mute:#6b5a80;color-scheme:light}
#aeRoot[open]{display:flex}#aeRoot::backdrop{background:rgba(43,19,66,.4)}
#aeRoot *{box-sizing:border-box}#aeRoot button,#aeRoot select,#aeRoot input{font-family:inherit;color:var(--ink)}
#aeRoot .ae-top{display:flex;align-items:center;gap:6px;padding:max(6px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) 6px max(10px,env(safe-area-inset-left));border-bottom:2px solid var(--line);background:var(--paper)}
#aeRoot .ae-top h2{flex:1;margin:0;font-size:1.1rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#aeRoot .ae-btn{min-height:44px;min-width:44px;padding:6px 12px;border-radius:12px;border:2px solid var(--line);background:var(--card);font-weight:600;font-size:.9rem;cursor:pointer;white-space:nowrap}
#aeRoot .ae-btn.pri{background:var(--accent);border-color:#b77e00;box-shadow:0 2px 0 #b77e00}
#aeRoot .ae-btn:disabled{opacity:.45;cursor:default}
#aeRoot .ae-btn[aria-pressed=true],#aeRoot .ae-btn.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
#aeRoot .ae-opts{display:flex;align-items:center;gap:8px;padding:4px 10px;min-height:56px;border-bottom:2px solid var(--line);overflow-x:auto;overflow-y:hidden;background:#fffdf7;-webkit-overflow-scrolling:touch}
#aeRoot .ae-opts>*{flex:none}#aeRoot .ae-opts p{margin:0;color:var(--mute);font-size:.88rem;white-space:nowrap}
#aeRoot .ae-sep{width:2px;height:32px;background:var(--line)}
#aeRoot .ae-rng{display:flex;flex-direction:column;justify-content:center;min-height:44px;font-size:.78rem;color:var(--mute);min-width:130px}
#aeRoot .ae-rng b{color:var(--ink)}#aeRoot input[type=range]{width:100%;min-height:44px;accent-color:#2B1342;margin:0}
#aeRoot .ae-chk{display:flex;align-items:center;gap:6px;min-height:44px;padding:0 6px;font-size:.88rem;cursor:pointer}#aeRoot .ae-chk input{width:22px;height:22px;accent-color:#2B1342}@media (pointer:coarse){#aeRoot .ae-chk input{width:44px;height:44px;margin:0}}
#aeRoot .ae-sel,#aeRoot .ae-txt{display:flex;flex-direction:column;font-size:.78rem;color:var(--mute)}
#aeRoot select,#aeRoot .ae-txt input{min-height:44px;border-radius:10px;border:2px solid var(--line);background:var(--card);font-size:.95rem;padding:4px 8px}
#aeRoot .ae-txt input{width:220px}
#aeRoot .ae-stop{display:flex;align-items:center;gap:4px;padding:0 4px;border-left:2px solid var(--line)}#aeRoot .ae-stop input[type=range]{width:90px}
#aeRoot .ae-chip{display:inline-block;width:32px;height:32px;border-radius:8px;border:2px solid var(--line)}
#aeRoot .ae-body{flex:1;display:flex;min-height:0}
#aeRoot .ae-tools{width:76px;flex:none;display:flex;flex-direction:column;gap:4px;padding:6px;border-right:2px solid var(--line);overflow-y:auto;background:var(--paper)}
#aeRoot .ae-tool{min-height:52px;width:62px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:12px;border:2px solid transparent;background:transparent;cursor:pointer;padding:2px}
#aeRoot .ae-tool span{font-size:.68rem;line-height:1.1;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#aeRoot .ae-tool:hover{border-color:var(--line)}#aeRoot .ae-tool[aria-pressed=true]{background:var(--ink);color:var(--paper)}
#aeRoot .ae-colors{position:relative;width:62px;height:122px;margin-top:6px;flex:none}
#aeRoot .ae-sw{position:absolute;left:0;top:0;width:44px;height:44px;border-radius:10px;border:0;box-shadow:inset 0 0 0 3px #fff,0 0 0 2px var(--ink);cursor:pointer;z-index:2;overflow:hidden}
#aeRoot .ae-sw input{opacity:0;width:100%;height:100%;cursor:pointer;border:0;padding:0}
#aeRoot .ae-sw2{left:18px;top:26px;z-index:1}
#aeRoot .ae-swsm{position:relative;left:auto;top:auto;width:44px;height:44px}
#aeRoot .ae-colors .ae-swap{position:absolute;left:9px;top:76px;padding:0;border-radius:50%;z-index:3}
#aeRoot .ae-stage{flex:1;position:relative;min-width:0;background:#e9e4da;overflow:hidden}
#aeRoot .ae-stage canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block}
#aeRoot .ae-zoom{position:absolute;right:10px;bottom:10px;display:flex;gap:4px;background:rgba(255,253,247,.92);border-radius:14px;padding:4px;border:2px solid var(--line)}
#aeRoot .ae-msg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--mute);pointer-events:none}
#aeRoot .ae-panel{width:300px;flex:none;border-left:2px solid var(--line);overflow-y:auto;padding:8px 12px;background:var(--paper)}
#aeRoot .ae-panel h3{margin:10px 0 6px;font-size:1rem}#aeRoot .ae-panel section{border-bottom:2px solid var(--line);padding-bottom:10px}
#aeRoot .ae-panel .ae-rng{min-width:0}
#aeRoot .ae-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#aeRoot .ae-layers,#aeRoot .ae-hist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
#aeRoot .ae-layers li{display:flex;gap:4px;align-items:center;border-radius:12px;border:2px solid var(--line);background:var(--card);padding:2px}
#aeRoot .ae-layers li.on{border-color:var(--ink)}
#aeRoot .ae-eye{border:0;background:transparent;padding:0}#aeRoot .ae-eye[aria-pressed=true]{background:transparent;color:var(--ink)}#aeRoot .ae-eye[aria-pressed=false]{color:var(--mute)}
#aeRoot .ae-lname{flex:1;min-height:44px;text-align:left;border:0;background:transparent;font-weight:600;font-size:.92rem;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#aeRoot .ae-lname small{color:var(--mute);font-weight:500}
#aeRoot .ae-hist{max-height:220px;overflow-y:auto}#aeRoot .ae-hist .ae-btn{width:100%;text-align:left;font-weight:500}#aeRoot .ae-hist .ae-future{opacity:.5}
#aeRoot .ae-narrow{display:none}
@media (max-width:759px){
  #aeRoot .ae-wide{display:none}#aeRoot .ae-narrow{display:inline-block}#aeRoot .ae-row.ae-narrow{display:flex}
  #aeRoot .ae-top h2{font-size:0;flex:1}#aeRoot .ae-top .ae-btn{padding:6px 8px}
  #aeRoot .ae-body{flex-direction:column}
  #aeRoot .ae-tools{order:3;width:auto;flex-direction:row;border-right:0;border-top:2px solid var(--line);overflow-x:auto;overflow-y:hidden;padding:4px max(6px,env(safe-area-inset-left)) max(4px,env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch}
  #aeRoot .ae-tool{flex:none;width:58px}
  #aeRoot .ae-colors{margin:0 8px 0 4px;height:52px;width:142px}#aeRoot .ae-colors .ae-sw{top:4px}#aeRoot .ae-colors .ae-sw2{left:50px}#aeRoot .ae-colors .ae-swap{left:98px;top:4px}
  #aeRoot .ae-swsm{width:44px;height:44px}
  #aeRoot .ae-panel{display:none;position:absolute;left:0;right:0;bottom:0;max-height:62%;width:auto;border-left:0;border-top:2px solid var(--line);border-radius:18px 18px 0 0;box-shadow:0 -8px 24px rgba(43,19,66,.18);z-index:5}
  #aeRoot.ae-open .ae-panel{display:block}
  #aeRoot .ae-body{position:relative}
  #aeRoot .ae-pclose{float:right}
}`;
  function build() {
    if (!document.getElementById("aeCss")) { const st = document.createElement("style"); st.id = "aeCss"; st.textContent = CSS; document.head.appendChild(st); }
    const root = document.createElement("dialog"); root.id = "aeRoot"; root.setAttribute("aria-label", T().title);
    root.innerHTML = `<div class="ae-top"></div><div class="ae-opts" role="toolbar"></div>
      <div class="ae-body"><div class="ae-tools" role="toolbar" aria-orientation="vertical"></div>
        <div class="ae-stage"><canvas aria-label="${esc(T().title)}"></canvas><div class="ae-msg" role="status"></div>
          <div class="ae-zoom">${btn("zoomOut", "-", `aria-label="${esc(T().zoomOut)}"`)}${btn("zoomFit", "100 %", `title="${esc(T().fit)} (Ctrl+0)"`)}${btn("zoomIn", "+", `aria-label="${esc(T().zoomIn)}"`)}</div></div>
        <div class="ae-panel"></div></div>`;
    document.body.appendChild(root);
    return root;
  }
  function checker(x) {
    const c = mk(16, 16), g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, 16, 16); g.fillStyle = "#ddd"; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8);
    return x.createPattern(c, "repeat");
  }
  async function loadSource(src) {
    if (src instanceof HTMLCanvasElement) return src;
    let blob = src;
    if (typeof src === "string") { const r = await fetch(src, { cache: "no-cache" }); if (!r.ok) throw new Error("fetch " + r.status); blob = await r.blob(); }
    if (window.createImageBitmap) { try { return await createImageBitmap(blob); } catch (e) { /* fall back to <img> */ } }
    const url = URL.createObjectURL(blob);
    try { return await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => no(new Error("image")); im.src = url; }); }
    finally { setTimeout(() => URL.revokeObjectURL(url), 5000); }
  }

  function open(source, opts = {}) {
    if (S) finish(null);
    return new Promise(async resolve => {
      const lang = opts.lang || (window.Admin && Admin.ctx && Admin.ctx.lang) || document.documentElement.lang || "en";
      S = { lang: lang === "id" ? "id" : "en", resolve, layers: [], hist: [], hi: 0, tool: "brush", ptrs: new Map(), pinch: null, act: null, space: false, hover: null,
        c1: "#2B1342", c2: "#FFB400", straight: 0, panelOpen: false, view: { s: 1, ox: 0, oy: 0 }, W: 1, H: 1, crop: {}, adj: null,
        o: { brush: { size: 24, hard: 80, opa: 100, pres: true }, eraser: { size: 40, hard: 80, opa: 100, pres: true },
          gradient: { kind: "linear", stops: [{ c: "#2B1342", p: 0 }, { c: "#FFB400", p: 100 }], opa: 100 },
          text: { str: "Ekky", font: "Fredoka", size: 120, weight: 600 }, shape: { kind: "rect", fill: true, stroke: false, sw: 8 },
          crop: { aspect: "free" }, adj: { ...ADJ0 } } };
      const root = S.root = build();
      S.stage = root.querySelector(".ae-stage"); S.cv = root.querySelector("canvas"); S.vx = S.cv.getContext("2d");
      S.comp = mk(1, 1); S.tmp = mk(1, 1); S.buf = mk(1, 1); S.checker = checker(S.vx);
      S.narrow = matchMedia("(max-width:759px)").matches;
      root.addEventListener("cancel", e => { e.preventDefault(); escape(); });
      root.addEventListener("click", e => {
        const b = e.target.closest("[data-a],[data-tool]"); if (!b || b.disabled) return;
        if (b.dataset.tool) return setTool(b.dataset.tool);
        const f = ACTIONS[b.dataset.a]; f && f(b.dataset.v);
      });
      root.addEventListener("input", onInput);
      root.addEventListener("change", () => { if (S) { paintPanel(); paintTop(); } });
      root.addEventListener("close", () => { if (S && S.root === root) finish(null); });
      S.cv.addEventListener("pointerdown", onDown); S.cv.addEventListener("pointermove", onMove);
      S.cv.addEventListener("pointerup", onUp); S.cv.addEventListener("pointercancel", onUp);
      S.cv.addEventListener("pointerleave", () => { if (S) { S.hover = null; render(); } });
      S.cv.addEventListener("wheel", e => { e.preventDefault(); const q = local(e); zoomAt(q.x, q.y, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))); }, { passive: false });
      S.cv.addEventListener("contextmenu", e => e.preventDefault());
      document.addEventListener("keydown", onKey); document.addEventListener("keyup", onKeyUp);
      S.ro = new ResizeObserver(() => { if (!S) return; const n = matchMedia("(max-width:759px)").matches; if (n !== S.narrow) S.narrow = n; render(); }); S.ro.observe(S.stage);
      root.showModal(); addEventListener("popstate", onPop, true); pushEntry();
      paintTop(); paintTools(); paintOpts(); paintPanel();
      const msg = root.querySelector(".ae-msg"), me = S; msg.textContent = T().loading;
      try {
        const bm = await loadSource(source);
        if (S !== me) { if (bm.close) bm.close(); return; }   // closed (Cancel, Esc, Back) while the picture was loading
        const w0 = bm.width || bm.naturalWidth, h0 = bm.height || bm.naturalHeight, k = Math.min(1, MAX / Math.max(w0, h0));
        S.W = Math.max(1, Math.round(w0 * k)); S.H = Math.max(1, Math.round(h0 * k));
        const c = mk(S.W, S.H), x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(bm, 0, 0, S.W, S.H); if (bm.close) bm.close();
        S.layers = [{ ...newLayer(T().names.photo, "photo", c) }]; S.active = S.layers[0].id;
        S.hist = [{ label: T().h.open, undo() {}, redo() {} }]; S.hi = 0;
        resetCrop(); msg.textContent = "";
        setTool("brush"); fit();
      } catch (e) { if (S === me) { msg.textContent = T().failed; S.failed = true; } }
    });
  }
  function finish(blob) {
    if (!S) return;
    const s = S; S = null;
    try { s.ro.disconnect(); } catch (e) {}
    document.removeEventListener("keydown", onKey); document.removeEventListener("keyup", onKeyUp);
    if (s.root.open) s.root.close(); s.root.remove();
    removeEventListener("popstate", onPop, true);
    if (s.pushed && history.state && history.state.ae) {   // closed with a button: drop the editor's history entry, quietly
      const quiet = e => { e.stopImmediatePropagation(); removeEventListener("popstate", quiet, true); };
      addEventListener("popstate", quiet, true); history.back();
    }
    s.resolve(blob);
  }
  function finishApply() {
    if (S.failed) return finish(null);
    if (S.tool === "crop") applyCrop();
    if (S.tool === "adjust" && !isAdj0(S.o.adj)) applyAdjust();
    const msg = S.root.querySelector(".ae-msg"); msg.textContent = T().saving;
    const c = flatten(true);
    c.toBlob(b => finish(b), "image/jpeg", 0.95);
  }

  window.AdminEditor = {
    open,
    isOpen: () => !!S,
    debug: () => S && { W: S.W, H: S.H, tool: S.tool, active: S.active, layers: S.layers.map(l => ({ id: l.id, name: l.name, type: l.type, visible: l.visible, opacity: l.opacity, blend: l.blend })),
      history: S.hist.map(e => e.label), hi: S.hi, view: { ...S.view }, crop: { ...S.crop } },
    sample: (x, y) => S && sample(x, y),
    toDoc: (cx, cy) => { if (!S) return null; const r = S.cv.getBoundingClientRect(), v = view(); return { x: (cx - r.left - v.ox) / v.s, y: (cy - r.top - v.oy) / v.s }; },
    toScreen: (x, y) => { if (!S) return null; const r = S.cv.getBoundingClientRect(), v = view(); return { x: r.left + v.ox + x * v.s, y: r.top + v.oy + y * v.s }; },
    adjustData
  };
})();
