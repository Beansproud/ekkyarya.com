// Admin, Art tab (docs/admin.md): list the pieces, add, edit, hide, reorder the featured six.
// Loaded by js/admin.js after the PIN. Registers itself with Admin.registerTab; nothing runs for normal visitors.
// ctx (from admin core): ctx.data (the site.json object), ctx.setData(next), ctx.publish(), ctx.canPublish (token present).
// New images wait in ctx.addFile(path, base64) until Publish puts them and the JSON in one commit.
(function () {
  const TXT = {
    en: {
      title: "Art", hint: "Your pieces. Add one, hide one, or pick the six shown first.",
      readonly: "Read-only: paste your GitHub token in Settings to publish.",
      featured: "Featured six", featuredHint: "These show first on the start page. Use the arrows or drag the handle.",
      featuredEmpty: "Not picked yet: the site picks six for you, spread across the categories.",
      all: "All pieces", add: "Add a piece", edit: "Edit", hide: "Hide", show: "Show", hidden: "Hidden", pending: "Not published yet",
      up: "Move up", down: "Move down", drag: "Drag to reorder", feat: "Feature", unfeat: "Remove from featured",
      remove: "Delete", removeAsk: "Delete this piece from the list? The image files stay in the repo.",
      image: "Image", pick: "Choose an image", resizing: "Resizing...", imageHint: "Saved as 1600 px and 480 px JPEGs.",
      titleEn: "Title (English)", descEn: "Description (English)", titleId: "Title (Bahasa Indonesia)", descId: "Description (Bahasa Indonesia)",
      category: "Category", kind: "Kind", label: "Tag shown with the piece (optional)", roles: "Where it is used",
      save: "Save piece", cancel: "Cancel", saved: "Saved. Press Publish to put it live.", fixTop: "Please fix:",
      cats: { illustration: "Illustration", web: "Web and UI", branding: "Branding", social: "Social media" },
      kinds: { original: "Original (my own)", client: "Client work", fan: "Fan art" },
      kindNote: { fan: "Fan art stays in the portfolio and the Art tab only.", client: "Client work stays in the portfolio and the Art tab only.", original: "" },
      roleNames: { portfolio: "Portfolio grid", card: "Art tab card", featured: "Featured row", share: "Share cards", coloring: "Coloring page", sticker: "Stickers", sprite: "Star Catcher sprite", level: "Map and menu art", scene: "Doodle Scene backdrop", avatar: "Avatar", game: "Mini-games", village: "Village" },
      locked: "always on", notAllowed: "not allowed for this kind",
      steps: "Project flow (optional)", stepsHint: "The pictures of this project in order: sketch, process, final, or more from the same project. 2 to 8 pictures; the site draws them as a diagram.",
      flowKind: "What the pictures show", flowKinds: { process: "How it was made (sketch to final)", series: "More from the same project" },
      stepAdd: "Add pictures", stepSelf: "Add this piece's own picture", stepCapEn: "Caption (English)", stepCapId: "Caption (Bahasa Indonesia)", stepPhEn: "English", stepPhId: "Indonesian",
      stepN: "Picture {n}", stepThis: "this piece", stepRemove: "Remove picture",
      e: { img: "Choose an image.", titleEn: "Add an English title.", descEn: "Add an English description.", titleId: "Add an Indonesian title.", descId: "Add an Indonesian description.",
        emoji: "Remove emoji and symbols from", cat: "Pick a category.", kind: "Pick a kind.", dup: "Another piece already has this title.", fan: "Fan art can only have portfolio and card.", client: "Client work can only have portfolio and card.", feat: "Only your own original pieces can be featured.", six: "At most six featured pieces.", role: "Unknown role", ref: "A featured or hidden entry points to a piece that does not exist",
        stepsMin: "A project flow needs at least 2 pictures (or none).", stepsMax: "A project flow holds at most 8 pictures.", stepCap: "Write the caption in both languages, or leave both empty, for picture", stepLong: "Keep the caption under 60 characters, picture" }
    },
    id: {
      title: "Karya", hint: "Semua karyamu. Tambah, sembunyikan, atau pilih enam yang tampil pertama.",
      readonly: "Hanya baca: tempel token GitHub di Pengaturan untuk menerbitkan.",
      featured: "Enam pilihan", featuredHint: "Enam ini tampil pertama di halaman awal. Pakai panah atau geser pegangannya.",
      featuredEmpty: "Belum dipilih: situs memilih enam untukmu dari berbagai kategori.",
      all: "Semua karya", add: "Tambah karya", edit: "Ubah", hide: "Sembunyikan", show: "Tampilkan", hidden: "Disembunyikan", pending: "Belum diterbitkan",
      up: "Naik", down: "Turun", drag: "Geser untuk mengurutkan", feat: "Pilih", unfeat: "Keluarkan dari pilihan",
      remove: "Hapus", removeAsk: "Hapus karya ini dari daftar? File gambarnya tetap ada di repo.",
      image: "Gambar", pick: "Pilih gambar", resizing: "Mengubah ukuran...", imageHint: "Disimpan sebagai JPEG 1600 px dan 480 px.",
      titleEn: "Judul (Inggris)", descEn: "Deskripsi (Inggris)", titleId: "Judul (Bahasa Indonesia)", descId: "Deskripsi (Bahasa Indonesia)",
      category: "Kategori", kind: "Jenis", label: "Label di samping karya (boleh kosong)", roles: "Dipakai di mana",
      save: "Simpan karya", cancel: "Batal", saved: "Tersimpan. Tekan Terbitkan agar tayang.", fixTop: "Mohon perbaiki:",
      cats: { illustration: "Ilustrasi", web: "Web dan UI", branding: "Branding", social: "Media sosial" },
      kinds: { original: "Asli (karyaku)", client: "Karya klien", fan: "Fan art" },
      kindNote: { fan: "Fan art hanya ada di portofolio dan tab Karya.", client: "Karya klien hanya ada di portofolio dan tab Karya.", original: "" },
      roleNames: { portfolio: "Grid portofolio", card: "Kartu tab Karya", featured: "Baris pilihan", share: "Kartu bagikan", coloring: "Halaman mewarnai", sticker: "Stiker", sprite: "Sprite Star Catcher", level: "Seni peta dan menu", scene: "Latar Doodle Scene", avatar: "Avatar", game: "Mini-game", village: "Desa" },
      locked: "selalu aktif", notAllowed: "tidak boleh untuk jenis ini",
      steps: "Alur proyek (boleh kosong)", stepsHint: "Gambar-gambar proyek ini secara berurutan: sketsa, proses, final, atau gambar lain dari proyek yang sama. 2 sampai 8 gambar; situs menggambarnya sebagai diagram.",
      flowKind: "Isi gambarnya", flowKinds: { process: "Proses pembuatan (sketsa sampai final)", series: "Gambar lain dari proyek yang sama" },
      stepAdd: "Tambah gambar", stepSelf: "Tambahkan gambar karya ini", stepCapEn: "Keterangan (Inggris)", stepCapId: "Keterangan (Bahasa Indonesia)", stepPhEn: "Inggris", stepPhId: "Indonesia",
      stepN: "Gambar {n}", stepThis: "karya ini", stepRemove: "Hapus gambar",
      e: { img: "Pilih gambar.", titleEn: "Isi judul bahasa Inggris.", descEn: "Isi deskripsi bahasa Inggris.", titleId: "Isi judul bahasa Indonesia.", descId: "Isi deskripsi bahasa Indonesia.",
        emoji: "Hapus emoji dan simbol dari", cat: "Pilih kategori.", kind: "Pilih jenis.", dup: "Karya lain sudah memakai judul ini.", fan: "Fan art hanya boleh portofolio dan kartu.", client: "Karya klien hanya boleh portofolio dan kartu.", feat: "Hanya karya asli yang boleh dipilih.", six: "Paling banyak enam karya pilihan.", role: "Peran tidak dikenal", ref: "Ada entri pilihan atau sembunyi yang menunjuk karya yang tidak ada",
        stepsMin: "Alur proyek butuh paling sedikit 2 gambar (atau kosongkan).", stepsMax: "Alur proyek paling banyak 8 gambar.", stepCap: "Tulis keterangan dalam dua bahasa, atau kosongkan keduanya, untuk gambar", stepLong: "Keterangan maksimal 60 karakter, gambar" }
    }
  };
  const CATS = ["illustration", "web", "branding", "social"], KINDS = ["original", "client", "fan"];
  const ROLES = ["portfolio", "card", "featured", "share", "coloring", "sticker", "sprite", "level", "scene", "avatar", "game", "village"];
  const BASE = ["portfolio", "card"];
  // Same glyph test as scripts/check.mjs: emoji, arrows, symbols, dingbats.
  const GLYPH = /(?![©®™])[\p{Extended_Pictographic}\u{FE0F}\u{20E3}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25A0}-\u{27BF}\u{2900}-\u{297F}\u{2B00}-\u{2BFF}\u{1F000}-\u{1FAFF}]/u;
  const ICON = {
    up: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    down: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    grip: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 8h14M5 12h14M5 16h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>'
  };

  const lang = () => (typeof LANG !== "undefined" && LANG === "id") ? "id" : "en";
  const T = () => TXT[lang()];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const slugOf = s => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "piece";

  // ---- pieces: built-in PROJECTS plus data.projects ----
  // A reference ("hidden", "order") is the title for a built-in piece and the uid "u-<slug>" for an added one.
  const refOf = p => p.uid || p.title;
  // The pristine list, not the live PROJECTS: once data/site.json or Preview hides a piece, PROJECTS no longer holds it,
  // and its "hidden" entry would read as pointing at a piece that does not exist.
  const builtIn = () => ((typeof SiteData !== "undefined" && SiteData.builtin && SiteData.builtin.projects) ||
    (typeof PROJECTS !== "undefined" ? PROJECTS : [])).filter(p => !p.uid && !/^assets\/work\/u\//.test(p.full || ""));
  const userOf = d => (d.projects || []).filter(p => p && p.full);
  const slugFromFull = p => p.full.split("/").pop().replace(/\.\w+$/, "");

  // ---- the owner rules; the same ones scripts/check.mjs holds, run on the merged data ----
  function rolesFor(kind, roles) {
    const base = BASE.slice();
    if (kind !== "original") return base;
    return base.concat(ROLES.filter(r => !BASE.includes(r) && roles.includes(r)));
  }
  function validatePiece(p, d, editing) {
    const e = T().e, out = [];
    if (!p.full) out.push(e.img);
    if (!p.title.trim()) out.push(e.titleEn);
    if (!p.desc.trim()) out.push(e.descEn);
    if (!p.id.title.trim()) out.push(e.titleId);
    if (!p.id.desc.trim()) out.push(e.descId);
    if (!CATS.includes(p.cat)) out.push(e.cat);
    if (!KINDS.includes(p.kind)) out.push(e.kind);
    [["title", p.title], ["desc", p.desc], ["title", p.id.title], ["desc", p.id.desc], ["label", p.label || ""]].forEach(([k, v]) => {
      if (GLYPH.test(v)) out.push(`${e.emoji} ${k}.`);
    });
    const same = t => t.trim().toLowerCase();
    const others = builtIn().concat(userOf(d).filter(q => q.uid !== editing));
    if (p.title.trim() && others.some(q => same(q.title) === same(p.title))) out.push(e.dup);
    out.push(...validateSteps(p.steps));
    return out.concat(validateData(Object.assign({}, d, { projects: userOf(d).filter(q => q.uid !== editing).concat([p]) }), true));
  }
  // Project flow (docs/flow.md): 0 or 2 to 8 steps; a caption in both languages or in neither, at most 60 characters, no emoji.
  function validateSteps(steps) {
    const e = T().e, out = [];
    if (!steps || !steps.length) return out;
    if (steps.length < 2) out.push(e.stepsMin);
    if (steps.length > 8) out.push(e.stepsMax);
    steps.forEach((s, k) => {
      const c = s.caption || {}, en = (c.en || "").trim(), id = (c.id || "").trim();
      if (!s.img || !s.full) out.push(`${e.img} (${k + 1})`);
      if (!en !== !id) out.push(`${e.stepCap} ${k + 1}.`);
      if (en.length > 60 || id.length > 60) out.push(`${e.stepLong} ${k + 1}.`);
      if (GLYPH.test(en) || GLYPH.test(id)) out.push(`${e.emoji} ${T().stepN.replace("{n}", k + 1)}.`);
    });
    return out;
  }
  // The merged data: built-ins minus hidden, plus the added pieces. Returns a list of plain messages.
  function validateData(d, skipRefs) {
    const e = T().e, out = [], seen = new Set();
    const merged = builtIn().concat(userOf(d));
    for (const p of userOf(d)) {
      const kind = p.kind, roles = p.roles || [];
      roles.forEach(r => { if (!ROLES.includes(r)) out.push(`${e.role}: ${r}`); });
      if (kind === "fan" && roles.some(r => !BASE.includes(r))) out.push(`${p.title}: ${e.fan}`);
      if (kind === "client" && roles.some(r => !BASE.includes(r))) out.push(`${p.title}: ${e.client}`);
      if (seen.has(p.uid)) out.push(`${p.title}: ${e.dup}`);
      seen.add(p.uid);
    }
    const keys = new Set(merged.map(refOf));
    if (!skipRefs) [].concat(d.hidden || [], d.order || []).forEach(k => { if (!keys.has(k)) out.push(`${e.ref}: ${k}`); });
    const order = d.order || [];
    if (order.length > 6) out.push(e.six);
    order.forEach(k => { const p = merged.find(q => refOf(q) === k); if (p && !(p.kind === "original" && (p.roles || []).includes("featured"))) out.push(`${p.title}: ${e.feat}`); });
    return Array.from(new Set(out));
  }

  // ---- resize in the browser: 1600 px full, 480 px thumb, JPEG at 0.82 ----
  async function loadBitmap(file) {
    if (window.createImageBitmap) { try { return await createImageBitmap(file); } catch (err) { /* fall through to <img> */ } }
    const url = URL.createObjectURL(file);
    try {
      return await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => no(new Error("image")); im.src = url; });
    } finally { setTimeout(() => URL.revokeObjectURL(url), 5000); }
  }
  function jpegAt(src, w0, h0, max) {
    const k = Math.min(1, max / Math.max(w0, h0)), w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.imageSmoothingQuality = "high"; x.drawImage(src, 0, 0, w, h);
    const url = c.toDataURL("image/jpeg", 0.82);
    return { url, base64: url.split(",")[1], w, h };
  }
  async function resizeFile(file) {
    const bm = await loadBitmap(file), w = bm.width || bm.naturalWidth, h = bm.height || bm.naturalHeight;
    const full = jpegAt(bm, w, h, 1600), thumb = jpegAt(bm, w, h, 480);
    if (bm.close) bm.close();
    return { full, thumb };
  }
  // Sprint 3 editor (docs/admin-editor.md): loads js/admin-editor.js on first use; resolves to the edited Blob, or null on Cancel
  const editImage = (src, lang) => (window.AdminEditor ? Promise.resolve() : new Promise((ok, no) => { const s = document.createElement("script"); s.src = "js/admin-editor.js?v=" + Date.now(); s.onload = ok; s.onerror = no; document.head.appendChild(s); }))
    .then(() => window.AdminEditor.open(src, { lang }));

  // ---- the tab ----
  function render(el, ctx) {
    const state = { editing: null, form: null, errors: [], note: "", previews: (render.previews = render.previews || {}) };
    const get = () => (ctx.getData ? ctx.getData() : ctx.data) || {};
    const put = next => { ctx.setData(next); };
    const patch = fn => { const d = JSON.parse(JSON.stringify(get())); d.version = d.version || 1; fn(d); put(d); };
    const hiddenSet = d => new Set(d.hidden || []);
    const thumbSrc = p => state.previews[p.uid] || p.img;
    const find = (d, key) => builtIn().concat(userOf(d)).find(p => refOf(p) === key);
    const addFile = (path, base64) => (ctx.addFile ? ctx.addFile(path, base64) : ((ctx.files = ctx.files || {})[path] = base64));

    const row = (p, d, extra) => {
      const t = T(), isH = hiddenSet(d).has(refOf(p)), isNew = !!state.previews[p.uid];
      const pt = lang() === "id" && p.id && p.id.title || p.title;
      return `<li class="aa-row${isH ? " aa-off" : ""}" data-ref="${esc(refOf(p))}">
        ${extra && extra.pre || ""}<img class="aa-th" src="${esc(thumbSrc(p))}" alt="" loading="lazy" decoding="async">
        <div class="aa-meta"><b>${esc(pt)}</b><small>${esc(t.cats[p.cat] || p.cat)}, ${esc(t.kinds[p.kind] || p.kind)}${isH ? ", " + esc(t.hidden) : ""}${isNew ? ", " + esc(t.pending) : ""}</small></div>
        <div class="aa-act">${extra && extra.post || ""}</div></li>`;
    };

    function featuredList(d) {
      const t = T(), items = (d.order || []).map(k => find(d, k)).filter(Boolean);
      if (!items.length) return `<p class="aa-note">${esc(t.featuredEmpty)}</p>`;
      return `<ol class="aa-list aa-feat" id="aaFeat">${items.map((p, i) => row(p, d, {
        pre: `<button class="aa-btn aa-grip" data-grip aria-label="${esc(t.drag)}">${ICON.grip}</button>`,
        post: `<button class="aa-btn" data-up="${i}" aria-label="${esc(t.up)}"${i ? "" : " disabled"}>${ICON.up}</button>
               <button class="aa-btn" data-down="${i}" aria-label="${esc(t.down)}"${i < items.length - 1 ? "" : " disabled"}>${ICON.down}</button>
               <button class="aa-btn aa-txt" data-unfeat="${esc(refOf(p))}">${esc(t.unfeat)}</button>`
      })).join("")}</ol>`;
    }

    function allList(d) {
      const t = T(), order = new Set(d.order || []), all = builtIn().concat(userOf(d));
      return `<ul class="aa-list">${all.map(p => {
        const k = refOf(p), isH = hiddenSet(d).has(k), canFeat = p.kind === "original" && (p.roles || []).includes("featured") && !isH;
        return row(p, d, { post:
          (p.uid ? `<button class="aa-btn aa-txt" data-edit="${esc(k)}">${esc(t.edit)}</button>` : "") +
          (canFeat && !order.has(k) && order.size < 6 ? `<button class="aa-btn aa-txt" data-feat="${esc(k)}">${esc(t.feat)}</button>` : "") +
          `<button class="aa-btn aa-txt" data-hide="${esc(k)}">${esc(isH ? t.show : t.hide)}</button>` +
          (p.uid ? `<button class="aa-btn aa-txt" data-del="${esc(k)}">${esc(t.remove)}</button>` : "") });
      }).join("")}</ul>`;
    }

    function formHtml() {
      const t = T(), f = state.form, locked = f.kind !== "original";
      const field = (id, label, val, tag) => `<label class="aa-f"><span>${esc(label)}</span>${tag === "area"
        ? `<textarea id="${id}" rows="2" maxlength="200">${esc(val)}</textarea>` : `<input id="${id}" type="text" maxlength="80" value="${esc(val)}">`}</label>`;
      return `<form class="aa-form" id="aaForm" novalidate>
        <h3>${esc(state.editing ? t.edit : t.add)}</h3>
        <div class="aa-f"><span>${esc(t.image)}</span>
          <div class="aa-pick">${f.preview ? `<img class="aa-th aa-big" src="${esc(f.preview)}" alt="">` : ""}
          <label class="aa-btn aa-txt aa-file">${esc(t.pick)}<input id="aaFile" type="file" accept="image/*"></label>${f.preview ? `<button type="button" class="aa-btn aa-txt" id="aaEdit">${lang() === "id" ? "Sunting" : "Edit"}</button>` : ""}${f.orig && f.src !== f.orig ? `<button type="button" class="aa-btn aa-txt" id="aaOrig">${lang() === "id" ? "Kembali ke asli" : "Back to original"}</button>` : ""}</div>
          <small id="aaBusy">${esc(f.busy ? t.resizing : t.imageHint)}</small></div>
        ${field("aaTe", t.titleEn, f.title)}${field("aaDe", t.descEn, f.desc, "area")}
        ${field("aaTi", t.titleId, f.id.title)}${field("aaDi", t.descId, f.id.desc, "area")}
        <label class="aa-f"><span>${esc(t.category)}</span><select id="aaCat">${CATS.map(c => `<option value="${c}"${f.cat === c ? " selected" : ""}>${esc(t.cats[c])}</option>`).join("")}</select></label>
        <label class="aa-f"><span>${esc(t.kind)}</span><select id="aaKind">${KINDS.map(c => `<option value="${c}"${f.kind === c ? " selected" : ""}>${esc(t.kinds[c])}</option>`).join("")}</select>
          ${t.kindNote[f.kind] ? `<small>${esc(t.kindNote[f.kind])}</small>` : ""}</label>
        ${field("aaLab", t.label, f.label || "")}
        <fieldset class="aa-roles"><legend>${esc(t.roles)}</legend>${ROLES.map(r => {
          const base = BASE.includes(r), off = base || locked, on = base || (!locked && f.roles.includes(r));
          return `<label class="aa-chk${off ? " aa-dim" : ""}"><input type="checkbox" data-role="${r}"${on ? " checked" : ""}${off ? " disabled" : ""}>
            <span>${esc(t.roleNames[r])}${base ? ` <small>(${esc(t.locked)})</small>` : locked ? ` <small>(${esc(t.notAllowed)})</small>` : ""}</span></label>`;
        }).join("")}</fieldset>
        ${stepsHtml()}
        ${state.errors.length ? `<div class="aa-err" role="alert"><b>${esc(t.fixTop)}</b><ul>${state.errors.map(m => `<li>${esc(m)}</li>`).join("")}</ul></div>` : ""}
        <div class="aa-bar"><button type="submit" class="aa-btn aa-primary">${esc(t.save)}</button><button type="button" class="aa-btn aa-txt" id="aaCancel">${esc(t.cancel)}</button></div></form>`;
    }

    // ---- project flow: the steps of this piece (docs/flow.md) ----
    function stepsHtml() {
      const t = T(), f = state.form, st = f.steps, full = st.length >= 8;
      return `<fieldset class="aa-steps" id="aaStepsBox"><legend>${esc(t.steps)}</legend><small>${esc(t.stepsHint)}</small>
        <label class="aa-f"><span>${esc(t.flowKind)}</span><select id="aaFlow">${["process", "series"].map(k => `<option value="${k}"${f.flow === k ? " selected" : ""}>${esc(t.flowKinds[k])}</option>`).join("")}</select></label>
        ${st.length ? `<ol class="aa-list aa-steps-list" id="aaSteps">${st.map((x, k) => `<li class="aa-row aa-step" data-k="${k}">
          <button type="button" class="aa-btn aa-grip" data-sgrip aria-label="${esc(t.drag)}">${ICON.grip}</button>
          ${(src => src ? `<img class="aa-th" src="${esc(src)}" alt="" loading="lazy" decoding="async">` : `<span class="aa-th" aria-hidden="true"></span>`)(x.self ? f.preview : x.preview || state.previews[x.img] || x.img)}
          <div class="aa-meta"><b>${esc(t.stepN.replace("{n}", k + 1))}${x.self ? ` <small>(${esc(t.stepThis)})</small>` : ""}</b>
            <input type="text" maxlength="60" data-cap-en="${k}" aria-label="${esc(t.stepCapEn)}" placeholder="${esc(t.stepPhEn)}" value="${esc(x.caption.en)}">
            <input type="text" maxlength="60" data-cap-id="${k}" aria-label="${esc(t.stepCapId)}" placeholder="${esc(t.stepPhId)}" value="${esc(x.caption.id)}"></div>
          <div class="aa-act"><button type="button" class="aa-btn" data-sup="${k}" aria-label="${esc(t.up)}"${k ? "" : " disabled"}>${ICON.up}</button>
            <button type="button" class="aa-btn" data-sdown="${k}" aria-label="${esc(t.down)}"${k < st.length - 1 ? "" : " disabled"}>${ICON.down}</button>
            <button type="button" class="aa-btn" data-sdel="${k}" aria-label="${esc(t.stepRemove)}">${ICON.x}</button></div></li>`).join("")}</ol>` : ""}
        <div class="aa-bar"><label class="aa-btn aa-txt aa-file${full ? " aa-dim" : ""}">${esc(t.stepAdd)}<input id="aaStepFile" type="file" accept="image/*" multiple${full ? " disabled" : ""}></label>
          ${st.some(x => x.self) || full ? "" : `<button type="button" class="aa-btn aa-txt" id="aaStepSelf">${esc(t.stepSelf)}</button>`}</div></fieldset>`;
    }
    function wireSteps() {
      const f = state.form, box = el.querySelector("#aaStepsBox"); if (!box) return;
      const redo = () => { draw(); const b = el.querySelector("#aaStepsBox"); if (b) b.scrollIntoView({ block: "nearest" }); };
      const move = (i, j) => { readForm(); if (j < 0 || j >= f.steps.length) return; f.steps.splice(j, 0, f.steps.splice(i, 1)[0]); redo();
        const b = el.querySelector(`[data-s${j < i ? "up" : "down"}="${j}"]`) || el.querySelector(`[data-s${j < i ? "down" : "up"}="${j}"]`); if (b && !b.disabled) b.focus(); };
      box.querySelectorAll("[data-sup]").forEach(b => b.onclick = () => move(+b.dataset.sup, +b.dataset.sup - 1));
      box.querySelectorAll("[data-sdown]").forEach(b => b.onclick = () => move(+b.dataset.sdown, +b.dataset.sdown + 1));
      box.querySelectorAll("[data-sdel]").forEach(b => b.onclick = () => { readForm(); f.steps.splice(+b.dataset.sdel, 1); redo(); });
      const self = box.querySelector("#aaStepSelf");
      if (self) self.onclick = () => { readForm(); f.steps.push({ self: true, img: "", full: "", caption: { en: "", id: "" } }); redo(); };
      box.querySelector("#aaStepFile").onchange = async e => {
        const files = Array.from(e.target.files || []).slice(0, 8 - f.steps.length); if (!files.length) return;
        readForm(); f.busy = true; el.querySelector("#aaBusy").textContent = T().resizing;
        for (const file of files) { try { const r = await resizeFile(file); f.steps.push({ img: "", full: "", files: r, preview: r.thumb.url, caption: { en: "", id: "" } }); } catch (err) { /* skip a file the browser cannot read */ } }
        f.busy = false; redo();
      };
      // drag by the handle (pointer events, so a finger works too)
      box.querySelectorAll("[data-sgrip]").forEach(g => g.addEventListener("pointerdown", e => {
        const li = g.closest("li"), ol = li.parentElement, from = +li.dataset.k;
        e.preventDefault(); g.setPointerCapture(e.pointerId); li.classList.add("aa-drag");
        const mv = ev => { const kids = Array.from(ol.children).filter(x => x !== li);
          const next = kids.find(x => ev.clientY < x.getBoundingClientRect().top + x.offsetHeight / 2); ol.insertBefore(li, next || null); };
        const up = () => { g.removeEventListener("pointermove", mv); g.removeEventListener("pointerup", up); g.removeEventListener("pointercancel", up);
          li.classList.remove("aa-drag"); const to = Array.from(ol.children).indexOf(li); if (to === from) return; readForm();
          f.steps.splice(to, 0, f.steps.splice(from, 1)[0]); redo(); };
        g.addEventListener("pointermove", mv); g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up);
      }));
    }

    function draw() {
      const t = T(), d = get(), probs = validateData(d);
      el.innerHTML = `<section class="aa" lang="${lang()}">
        <p class="aa-note">${esc(t.hint)}</p>${ctx.canPublish === false ? `<p class="aa-note aa-warn">${esc(t.readonly)}</p>` : ""}
        ${state.note ? `<p class="aa-note aa-ok" role="status">${esc(state.note)}</p>` : ""}
        ${probs.length ? `<div class="aa-err" role="alert"><ul>${probs.map(m => `<li>${esc(m)}</li>`).join("")}</ul></div>` : ""}
        ${state.form ? formHtml() : `<div class="aa-bar"><button class="aa-btn aa-primary" id="aaAdd">${esc(t.add)}</button></div>`}
        <h3>${esc(t.featured)}</h3><p class="aa-note">${esc(t.featuredHint)}</p>${featuredList(d)}
        <h3>${esc(t.all)}</h3>${allList(d)}</section>`;
      wire();
    }

    const blank = () => ({ title: "", desc: "", id: { title: "", desc: "" }, cat: "illustration", kind: "original", label: "", roles: ["featured", "share", "sticker"], full: "", img: "", preview: "", busy: false, files: null, flow: "process", steps: [] });
    const readForm = () => {
      const f = state.form, v = id => (el.querySelector("#" + id) || {}).value || "";
      f.title = v("aaTe"); f.desc = v("aaDe"); f.id = { title: v("aaTi"), desc: v("aaDi") };
      f.cat = v("aaCat"); f.kind = v("aaKind"); f.label = v("aaLab").trim();
      f.roles = Array.from(el.querySelectorAll("[data-role]")).filter(i => i.checked && !i.disabled).map(i => i.dataset.role);
      f.flow = v("aaFlow") || f.flow || "process";
      f.steps.forEach((x, k) => { const en = el.querySelector(`[data-cap-en="${k}"]`), id = el.querySelector(`[data-cap-id="${k}"]`);
        if (en) x.caption.en = en.value; if (id) x.caption.id = id.value; });
    };

    function wire() {
      const on = (sel, ev, fn) => el.querySelectorAll(sel).forEach(n => n.addEventListener(ev, fn));
      const add = el.querySelector("#aaAdd");
      if (add) add.onclick = () => { state.form = blank(); state.editing = null; state.errors = []; state.note = ""; draw(); };
      on("[data-edit]", "click", e => {
        const p = userOf(get()).find(q => q.uid === e.currentTarget.dataset.edit); if (!p) return;
        state.editing = p.uid; state.errors = []; state.note = "";
        state.form = { title: p.title, desc: p.desc, id: { title: (p.id || {}).title || "", desc: (p.id || {}).desc || "" }, cat: p.cat, kind: p.kind, label: p.label || "", roles: (p.roles || []).slice(), full: p.full, img: p.img, preview: thumbSrc(p), busy: false, files: null,
          flow: p.flow === "series" ? "series" : "process",
          steps: (p.steps || []).map(x => ({ self: x.full === p.full, img: x.img, full: x.full, caption: { en: (x.caption || {}).en || "", id: (x.caption || {}).id || "" } })) };
        draw(); el.querySelector("#aaForm").scrollIntoView({ block: "start" });
      });
      if (!state.form) return wireLists();
      // the form: kind changes re-lock the roles
      el.querySelector("#aaKind").onchange = () => { readForm(); if (state.form.kind !== "original") state.form.roles = []; draw(); };
      el.querySelector("#aaCancel").onclick = () => { state.form = null; state.editing = null; state.errors = []; draw(); };
      el.querySelector("#aaFile").onchange = async e => {
        const file = e.target.files && e.target.files[0]; if (!file) return;
        state.form.src = state.form.orig = file;
        readForm(); state.form.busy = true; el.querySelector("#aaBusy").textContent = T().resizing;
        try {
          const r = await resizeFile(file), f = state.form;
          f.files = r; f.preview = r.thumb.url; f.busy = false;
          if (!f.title.trim()) f.title = file.name.replace(/\.\w+$/, "").replace(/[-_]+/g, " ").trim();
        } catch (err) { state.form.busy = false; }
        draw();
      };
      const ed = el.querySelector("#aaEdit");
      if (ed) ed.onclick = async () => {
        readForm(); const blob = await editImage(state.form.src || state.form.full, lang()).catch(() => null); if (!blob) return;
        const r = await resizeFile(blob), f = state.form; f.files = r; f.src = blob; f.preview = r.thumb.url; draw();
      };
      const og = el.querySelector("#aaOrig");   // every edit can be undone: back to the picture as it was picked
      if (og) og.onclick = async () => { readForm(); const f = state.form, r = await resizeFile(f.orig); f.files = r; f.src = f.orig; f.preview = r.thumb.url; draw(); };
      el.querySelector("#aaForm").onsubmit = e => { e.preventDefault(); submit(); };
      wireSteps();
      wireLists();
    }

    function submit() {
      readForm();
      const f = state.form, d = get(), editing = state.editing, old = editing && userOf(d).find(p => p.uid === editing);
      let slug = old ? slugFromFull(old) : "", uid = editing;
      if (!old) {
        const taken = new Set(userOf(d).map(p => p.uid));
        slug = slugOf(f.title); uid = "u-" + slug;
        for (let n = 2; taken.has(uid); n++) { uid = "u-" + slug + "-" + n; }
        slug = uid.slice(2);
      }
      const piece = {
        uid, cat: f.cat, title: f.title.trim(), desc: f.desc.trim(),
        img: f.files ? `assets/work/thumb/u/${slug}.jpg` : f.img, full: f.files ? `assets/work/u/${slug}.jpg` : f.full,
        kind: f.kind, roles: rolesFor(f.kind, f.roles), id: { title: f.id.title.trim(), desc: f.id.desc.trim() }
      };
      const label = f.label || (f.kind === "fan" ? "Fan art" : "");
      if (label) piece.label = label;
      // steps: the piece's own picture takes its paths; a new picture gets the next free <slug>-s<n> name
      const used = new Set(f.steps.map(x => x.full));
      const freeName = () => { for (let n = 1; ; n++) { const full = `assets/work/u/${slug}-s${n}.jpg`; if (!used.has(full)) { used.add(full); return n; } } };
      const steps = f.steps.map(x => {
        const c = { en: x.caption.en.trim(), id: x.caption.id.trim() };
        if (x.self) return { img: piece.img, full: piece.full, caption: c };
        if (x.files && !x.full) { const n = freeName(); x.full = `assets/work/u/${slug}-s${n}.jpg`; x.img = `assets/work/thumb/u/${slug}-s${n}.jpg`; }
        return { img: x.img, full: x.full, caption: c };
      });
      if (steps.length) { piece.flow = f.flow === "series" ? "series" : "process"; piece.steps = steps; }
      state.errors = validatePiece(piece, d, editing);
      if (state.errors.length) { draw(); el.querySelector(".aa-form .aa-err").scrollIntoView({ block: "nearest" }); return; }
      if (f.files) { addFile(piece.full, f.files.full.base64); addFile(piece.img, f.files.thumb.base64); state.previews[uid] = f.files.thumb.url; }
      f.steps.forEach(x => { if (x.files && !x.self) { addFile(x.full, x.files.full.base64); addFile(x.img, x.files.thumb.base64); state.previews[x.img] = x.files.thumb.url; } });
      patch(n => { n.projects = userOf(n).filter(p => p.uid !== editing); const at = old ? userOf(get()).findIndex(p => p.uid === editing) : -1;
        if (at >= 0) n.projects.splice(at, 0, piece); else n.projects.push(piece); });
      state.form = null; state.editing = null; state.errors = []; state.note = T().saved; draw();
    }

    function wireLists() {
      const on = (sel, ev, fn) => el.querySelectorAll(sel).forEach(n => n.addEventListener(ev, fn));
      const set = (a, k) => a.indexOf(k) < 0 ? a.concat(k) : a;
      on("[data-hide]", "click", e => { const k = e.currentTarget.dataset.hide; state.note = "";
        patch(d => { const h = d.hidden || []; d.hidden = h.includes(k) ? h.filter(x => x !== k) : h.concat(k); if (d.hidden.includes(k)) d.order = (d.order || []).filter(x => x !== k); }); draw(); });
      on("[data-feat]", "click", e => { state.note = ""; patch(d => { d.order = set(d.order || [], e.currentTarget.dataset.feat).slice(0, 6); }); draw(); });
      on("[data-unfeat]", "click", e => { patch(d => { d.order = (d.order || []).filter(x => x !== e.currentTarget.dataset.unfeat); }); draw(); });
      on("[data-del]", "click", e => { const k = e.currentTarget.dataset.del; if (!confirm(T().removeAsk)) return;
        patch(d => { d.projects = userOf(d).filter(p => p.uid !== k); d.order = (d.order || []).filter(x => x !== k); d.hidden = (d.hidden || []).filter(x => x !== k); }); draw(); });
      const move = (i, j) => { patch(d => { const o = (d.order || []).slice(); if (j < 0 || j >= o.length) return; o.splice(j, 0, o.splice(i, 1)[0]); d.order = o; }); draw();
        const b = el.querySelector(`[data-${j < i ? "up" : "down"}="${j}"]`) || el.querySelector(`[data-${j < i ? "down" : "up"}="${j}"]`); if (b && !b.disabled) b.focus(); };
      on("[data-up]", "click", e => move(+e.currentTarget.dataset.up, +e.currentTarget.dataset.up - 1));
      on("[data-down]", "click", e => move(+e.currentTarget.dataset.down, +e.currentTarget.dataset.down + 1));
      // drag by the handle (pointer events, so it works with a finger too)
      on("[data-grip]", "pointerdown", e => {
        const li = e.currentTarget.closest("li"), ol = li.parentElement, from = Array.from(ol.children).indexOf(li);
        e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); li.classList.add("aa-drag");
        const mv = ev => { const kids = Array.from(ol.children).filter(x => x !== li);
          const next = kids.find(x => ev.clientY < x.getBoundingClientRect().top + x.offsetHeight / 2); ol.insertBefore(li, next || null); };
        const up = () => { e.target.removeEventListener("pointermove", mv); e.target.removeEventListener("pointerup", up); e.target.removeEventListener("pointercancel", up);
          li.classList.remove("aa-drag"); const keys = Array.from(ol.children).map(x => x.dataset.ref), to = keys.indexOf(li.dataset.ref);
          if (to === from) return; patch(d => { d.order = keys; }); draw(); };
        e.target.addEventListener("pointermove", mv); e.target.addEventListener("pointerup", up); e.target.addEventListener("pointercancel", up);
      });
    }

    draw();
    return { redraw: draw };   // the shell may call this when the language changes
  }

  const tab = { get title() { return T().title; }, render };
  const reg = () => window.Admin && window.Admin.registerTab && window.Admin.registerTab("art", tab);
  if (window.Admin && window.Admin.registerTab) reg(); else (window.AdminTabs = window.AdminTabs || []).push(["art", tab]);
  window.AdminArt = { validateData, validatePiece, validateSteps, resizeFile, rolesFor, editImage };
})();
