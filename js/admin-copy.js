// Admin Words tab ("Kata-kata"; docs/admin.md, "Words"): every COPY key of js/data.js, grouped by screen, editable in English
// and Bahasa Indonesia side by side, with checks: English grammar (LanguageTool, on request), Bahasa checks, readability,
// house rules, the fit of a line in its real place on the phone, and a 5-second impression test. Saved lines go into
// data/site.json as "copy": {"en": {key: text}, "id": {...}}, only the keys that differ from the built-in text.
// Loaded by js/admin-shell.js after the PIN; js/admin-copy-check.js (the checks) is loaded from here.
const AdminCopy = (() => {
  const S = {
    intro: ["Every line of the site, in English and Bahasa side by side. Save a line, then Preview or Publish at the top.", "Semua baris di situs, bahasa Inggris dan Bahasa berdampingan. Simpan satu baris, lalu Pratinjau atau Terbitkan di atas."],
    search: ["Find a line, a word or a key", "Cari baris, kata atau kunci"],
    all: ["All", "Semua"], changed: ["Changed", "Diubah"], issues: ["Has issues", "Ada catatan"],
    report: ["Report", "Laporan"], checkAll: ["Check all English", "Periksa semua bahasa Inggris"], impression: ["Impression test", "Tes kesan"],
    lines: ["{n} lines", "{n} baris"], none: ["Nothing found.", "Tidak ditemukan."],
    badgeChanged: ["Changed", "Diubah"], badgeDraft: ["Not saved", "Belum disimpan"], badgeIssues: ["{n} to look at", "{n} perlu dilihat"],
    en: ["English", "Bahasa Inggris"], id: ["Bahasa Indonesia", "Bahasa Indonesia"],
    builtin: ["Built-in:", "Bawaan:"], reset: ["Reset to built-in", "Kembalikan ke bawaan"], undoReset: ["Undo reset", "Batalkan pengembalian"],
    save: ["Save", "Simpan"], cancel: ["Cancel", "Batal"], back: ["Back to the list", "Kembali ke daftar"],
    saved: ["Saved. Preview or Publish at the top.", "Tersimpan. Pratinjau atau Terbitkan di atas."],
    blocked: ["Fix the items marked in red first. Nothing was saved.", "Perbaiki dulu yang bertanda merah. Belum ada yang disimpan."],
    askTitle: ["This line has changes that are not saved.", "Baris ini punya perubahan yang belum disimpan."],
    discard: ["Discard changes", "Buang perubahan"], keep: ["Keep editing", "Lanjut mengedit"],
    grammar: ["Check grammar", "Periksa tata bahasa"], checking: ["Checking...", "Memeriksa..."],
    ltNote: ["Check sends this English text to LanguageTool (languagetool.org) to look for grammar and spelling.", "Periksa mengirim teks bahasa Inggris ini ke LanguageTool (languagetool.org) untuk mencari salah ketik dan tata bahasa."],
    ltNoteAll: ["Sends the English lines to LanguageTool (languagetool.org), a few at a time: the free service allows about 20 checks a minute.", "Mengirim baris bahasa Inggris ke LanguageTool (languagetool.org), sedikit demi sedikit: layanan gratisnya sekitar 20 pemeriksaan per menit."],
    ltFail: ["Could not reach LanguageTool. Your text can still be saved.", "Tidak bisa menghubungi LanguageTool. Teksmu tetap bisa disimpan."],
    ltClean: ["LanguageTool found nothing.", "LanguageTool tidak menemukan apa-apa."],
    ltStale: ["Changed since the last check.", "Berubah sejak pemeriksaan terakhir."],
    idNote: ["Bahasa is checked here on this device: spacing, repeated words, capitals, standard spelling and English words.", "Bahasa diperiksa di perangkat ini: spasi, kata berulang, huruf besar, ejaan baku dan kata Inggris."],
    ignore: ["Ignore", "Abaikan"], use: ["Use", "Pakai"],
    read: ["Reading", "Keterbacaan"], readNow: ["Now", "Sekarang"], readDef: ["Built-in", "Bawaan"],
    flesch: ["Reading ease", "Kemudahan baca"], perSentence: ["Words per sentence", "Kata per kalimat"], perWord: ["Letters per word", "Huruf per kata"],
    fleschHint: ["60 and up reads easily.", "60 ke atas mudah dibaca."], harder: ["Harder to read than the built-in.", "Lebih sulit dibaca dari bawaan."],
    fit: ["Fit on the phone", "Muat di HP"], fitting: ["Measuring on 360 and 390 px...", "Mengukur di 360 dan 390 px..."],
    fitLine: ["{w} px, {lang}: {now} line(s), built-in {def}", "{w} px, {lang}: {now} baris, bawaan {def}"],
    fitMore: ["wraps onto more lines", "turun ke baris lebih banyak"], fitSpill: ["spills out of its box", "keluar dari kotaknya"], fitOk: ["fits", "muat"],
    fitAria: ["Read by screen readers only: there is nothing on screen to fit.", "Hanya dibacakan pembaca layar: tidak ada yang perlu muat di layar."],
    fitNone: ["Not on a screen the test can open (a sheet, a toast or a share text). Keep it about as long as the built-in.", "Tidak ada di layar yang bisa dibuka tes (lembar, notifikasi atau teks bagikan). Buat kira-kira sepanjang bawaan."],
    fitFail: ["The phone preview did not load.", "Pratinjau HP tidak termuat."],
    close: ["Close", "Tutup"],
    repTitle: ["Words report", "Laporan kata-kata"], repEmpty: ["Nothing to look at. Nice.", "Tidak ada catatan. Mantap."],
    repCounts: ["{w} to look at, {s} notes, across {k} lines. Red items block saving.", "{w} perlu dilihat, {s} catatan, di {k} baris. Yang merah menghalangi simpan."],
    repLt: ["English checked by LanguageTool: {n} of {t} lines.", "Bahasa Inggris diperiksa LanguageTool: {n} dari {t} baris."],
    open: ["Open", "Buka"], stop: ["Stop", "Berhenti"], fitChanged: ["Fit the changed lines", "Ukur baris yang diubah"],
    progress: ["Checked {d} of {t} batches", "Diperiksa {d} dari {t} kelompok"], waiting: [", waiting {s} s for the free limit", ", menunggu {s} dtk untuk batas gratis"],
    stopped: ["Stopped.", "Dihentikan."], allDone: ["Done.", "Selesai."],
    impTitle: ["5-second impression test", "Tes kesan 5 detik"],
    impIntro: ["Pick a screen. Its words show in a phone for 5 seconds, then hide. Type what you remember: the test scores which key words came back.", "Pilih layar. Kata-katanya tampil di HP selama 5 detik, lalu hilang. Ketik yang kamu ingat: tes menilai kata kunci mana yang teringat."],
    impLang: ["Language", "Bahasa"], start: ["Start", "Mulai"], remember: ["What do you remember?", "Apa yang kamu ingat?"],
    score: ["Score it", "Nilai"], again: ["Try again", "Coba lagi"], recalled: ["Remembered", "Teringat"], missed: ["Missed", "Terlewat"],
    pct: ["{p}% of the key words", "{p}% kata kunci"], runs: ["This session", "Sesi ini"], looking: ["Look now...", "Lihat sekarang..."],
    session: ["Results stay in this browser session only.", "Hasil hanya tersimpan di sesi browser ini."],
    note: ["Note in the code:", "Catatan di kode:"], key: ["Key", "Kunci"],
    sev: { block: ["Must fix", "Harus diperbaiki"], warn: ["Look at this", "Perlu dilihat"], soft: ["Note", "Catatan"] }
  };
  // Groups by screen, first match wins (a key that matches none goes to Other).
  const GROUPS = [
    ["intro", "Phone intro: the terminal", "Intro HP: terminal", ["intro.", "term."]],
    ["story", "Start page: story and how we work", "Halaman awal: cerita dan cara kerja", ["story.", "deal.", "start.page.", "start.sketchbook", "start.collab", "start.swipe"]],
    ["start", "Start page", "Halaman awal", ["start.", "hud.", "home.", "tile.", "fab.", "web."]],
    ["map", "Map and the village", "Peta dan desa", ["map.", "level.", "town."]],
    ["about", "About Ekky", "Tentang Ekky", ["about."]],
    ["tabs", "Tabs: Art and Yours", "Tab: Karya dan Buatanmu", ["tab.", "art.", "mine.", "filter."]],
    ["viewer", "Art viewer and project steps", "Penampil karya dan langkah proyek", ["lb.", "flow.", "mm.", "sheet."]],
    ["color", "Coloring and Doodle Scene", "Mewarnai dan Doodle Scene", ["color.", "scene.", "sticker.", "tool.", "size.", "pat.", "wheel.", "reveal.", "fade."]],
    ["stars", "Star Catcher", "Star Catcher", ["stars."]],
    ["hire", "Hire Ekky", "Hubungi Ekky", ["hire.", "form."]],
    ["share", "Share, download and friends' links", "Bagikan, unduh dan tautan teman", ["share.", "dl.", "card.", "credit", "arrive."]],
    ["desktop", "Desktop site", "Situs desktop", ["hero.", "nav.", "strip.", "contact.", "services.", "process.", "play.", "footer."]],
    ["tags", "Labels on pieces", "Label pada karya", ["tag."]],
    ["facts", "Fun facts (when idle)", "Fakta seru (saat diam)", ["fact.", "idle."]],
    ["app", "App, language and small buttons", "Aplikasi, bahasa dan tombol kecil", ["app.", "lang.", "ui."]],
    ["other", "Other", "Lainnya", [""]]
  ];
  // What a line is for, where the key alone does not say it.
  const PURPOSE = {
    "term.title": ["Title bar of the cartoon terminal on the phone intro", "Bilah judul terminal kartun di intro HP"],
    "term.aria": ["The terminal's name for screen readers", "Nama terminal untuk pembaca layar"],
    "term.1": ["Terminal line 1: the typed command, then the answer", "Baris terminal 1: perintah yang diketik, lalu jawabannya"],
    "term.2": ["Terminal line 2: the typed command, then the answer", "Baris terminal 2: perintah yang diketik, lalu jawabannya"],
    "term.3": ["Terminal line 3: the typed command, then the answer", "Baris terminal 3: perintah yang diketik, lalu jawabannya"],
    "intro.enter": ["The button that leaves the intro for the start page", "Tombol keluar dari intro ke halaman awal"],
    "intro.bored": ["Small line under the terminal, before the star game link", "Baris kecil di bawah terminal, sebelum tautan game bintang"],
    "intro.stars": ["Link to Star Catcher under the terminal", "Tautan ke Star Catcher di bawah terminal"],
    "intro.hint": ["Hint under the Enter button", "Petunjuk di bawah tombol Masuk"],
    "story.kick": ["Small line above the story card's title", "Baris kecil di atas judul kartu cerita"],
    "story.title": ["Title of the story card on the start page", "Judul kartu cerita di halaman awal"],
    "story.body": ["The story card's text", "Teks kartu cerita"],
    "story.swipe": ["Hint at the bottom of the story card", "Petunjuk di bawah kartu cerita"],
    "deal.title": ["Title of the How we work page", "Judul halaman Cara kerja"],
    "deal.go": ["Button at the end of How we work: opens Hire Ekky", "Tombol di akhir Cara kerja: membuka Hubungi Ekky"],
    "start.tagline": ["Line under the logo on the start page", "Baris di bawah logo di halaman awal"],
    "start.swipe": ["Hint to swipe to the six drawings", "Petunjuk geser ke enam gambar"],
    "start.sketchbook": ["Starting point 1: the sketchbook", "Titik mulai 1: buku sketsa"],
    "start.collab": ["Starting point 2: collaborate on a project", "Titik mulai 2: kerja sama proyek"],
    "start.classic": ["Link to the plain art site", "Tautan ke situs karya biasa"],
    "hire.types": ["Project types in the Hire form's list", "Jenis proyek di daftar formulir Hubungi"],
    "hire.form.types": ["Project types in the desktop form's list", "Jenis proyek di daftar formulir desktop"],
    "hero.words": ["Words that the desktop hero types one after another", "Kata yang diketik bergantian di hero desktop"],
    "lb.prefill": ["Message that starts the Hire form from a piece", "Pesan pembuka formulir Hubungi dari sebuah karya"]
  };
  // The 5-second test: the screens whose words are read at a glance.
  const SCREENS = [
    ["term", "Phone intro: the terminal", "Intro HP: terminal", ["term.title", "term.1", "term.2", "term.3", "intro.bored", "intro.stars", "intro.enter"]],
    ["story", "Start page: the story card", "Halaman awal: kartu cerita", ["story.kick", "story.title", "story.body", "story.swipe"]],
    ["deal", "Start page: how we work", "Halaman awal: cara kerja", ["deal.title", "deal.1", "deal.2", "deal.3", "deal.4", "deal.5", "deal.go"]],
    ["start", "Start page: home", "Halaman awal: beranda", ["start.tagline", "start.role", "start.sketchbook", "start.collab", "start.featured", "start.swipe"]],
    ["hire", "Hire Ekky sheet", "Lembar Hubungi Ekky", ["hire.title", "hire.body", "hire.price", "hire.email", "hire.formTitle", "hire.messageHint", "hire.send"]],
    ["about", "About Ekky", "Tentang Ekky", ["about.title", "about.body", "about.fact.from", "about.fact.lang", "about.fact.hours", "about.fact.price", "about.workedWith"]],
    ["hero", "Desktop: the hero", "Desktop: bagian hero", ["hero.hi", "hero.title", "hero.sub", "hero.hire", "hero.work", "nav.status"]]
  ];
  const LOCKED = ["fact.count"];   // a number the site counts with, not text
  const LANGS = ["en", "id"];

  let ctx = null, el = null, BI = null, CK = null, notes = {};
  const st = { q: "", filter: "all", open: null, drafts: new Map(), ask: false, panel: null, flash: null, ltBusy: {}, ltErr: {}, fits: new Map(), resetUndo: {},
    ignored: new Set(), runs: [], imp: null, all: null, expanded: new Set(), scroll: 0, pushed: false };

  const lg = () => (ctx && ctx.lang === "id") ? 1 : 0;
  const s = (k, vars) => { let v = S[k]; v = Array.isArray(v) ? v[lg()] : v; if (vars) v = v.replace(/\{(\w+)\}/g, (m, x) => vars[x] ?? m); return v; };
  const tx = o => o ? (Array.isArray(o) ? o[lg()] : o[["en", "id"][lg()]]) : "";
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));

  // ---- values: built-in, saved (data/site.json "copy"), draft (being edited, not saved yet) ----
  const data = () => (ctx.getData ? ctx.getData() : ctx.data) || {};
  const base = (l, k) => (BI[l] || {})[k];
  const savedRaw = (l, k) => ((data().copy || {})[l] || {})[k];
  const saved = (l, k) => { const v = savedRaw(l, k), b = base(l, k); return v !== undefined && (Array.isArray(b) ? Array.isArray(v) : typeof v === "string") ? v : b; };
  const partsOf = (v, b) => Array.isArray(b) ? (Array.isArray(v) ? v.slice() : b.slice()) : String(v ?? "").split(String(b ?? "").includes("|") ? "|" : /\u0000/);
  const cur = (l, k) => { const d = st.drafts.get(k); return d ? d[l] : partsOf(saved(l, k), base(l, k)); };
  const bparts = (l, k) => partsOf(base(l, k), base(l, k));
  const changed = k => LANGS.some(l => savedRaw(l, k) !== undefined && JSON.stringify(savedRaw(l, k)) !== JSON.stringify(base(l, k)));
  const dirty = k => { const d = st.drafts.get(k); return !!d && LANGS.some(l => JSON.stringify(d[l]) !== JSON.stringify(partsOf(saved(l, k), base(l, k)))); };
  const keys = () => Object.keys(BI.en || {}).filter(k => !LOCKED.includes(k) && (typeof BI.en[k] === "string" || Array.isArray(BI.en[k])));
  const groupOf = k => GROUPS.find(g => g[3].some(p => k.startsWith(p)))[0];

  function partNames(k, n) {
    if (n < 2) return [""];
    if (/^term\.\d/.test(k)) return lg() ? ["Perintah", "Jawaban"] : ["Command", "Answer"];
    if (/^deal\.\d/.test(k)) return lg() ? ["Judul", "Isi"] : ["Title", "Body"];
    const w = /words$/.test(k) ? (lg() ? "Kata" : "Word") : /types$/.test(k) ? (lg() ? "Pilihan" : "Option") : (lg() ? "Bagian" : "Part");
    return Array.from({ length: n }, (_, i) => w + " " + (i + 1));
  }
  function purpose(k) {
    if (PURPOSE[k]) return tx(PURPOSE[k]);
    const g = GROUPS.find(x => x[0] === groupOf(k)), rest = k.split(".").slice(1).join(" ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    const aria = /(^|\.)aria$|Aria$/.test(k);
    return (lg() ? g[2] : g[1]) + ": " + (aria ? (lg() ? "dibacakan pembaca layar (" + rest.replace(/ ?aria$/, "") + ")" : "read aloud by screen readers (" + rest.replace(/ ?aria$/, "") + ")") : rest);
  }

  // ---- checks (js/admin-copy-check.js, loaded on first use) ----
  let ckLoad = null;
  function needChecks() {
    const got = () => typeof AdminCopyCheck !== "undefined" ? AdminCopyCheck : null;   // a top-level const: not on window
    if (got()) { CK = got(); return Promise.resolve(CK); }
    if (!ckLoad) ckLoad = new Promise((res, rej) => { const sc = document.createElement("script"); sc.src = "js/admin-copy-check.js?v=" + Date.now();
      sc.onload = () => { CK = got(); CK ? res(CK) : rej(new Error("checks")); }; sc.onerror = () => { ckLoad = null; sc.remove(); rej(new Error("checks")); }; document.head.appendChild(sc); });
    return ckLoad;
  }
  // Every finding for a key: local checks, LanguageTool (when checked) and fit (when measured). [{l, part, sev, msg, at, len, fix, src}]
  function issuesOf(k) {
    if (!CK) return [];
    const out = [], c = cur, ign = x => st.ignored.has(k + "|" + x.l + "|" + x.part + "|" + (x.rule || x.code) + "|" + (x.bad || x.at));
    for (const l of LANGS) {
      const ps = c(l, k), bs = bparts(l, k);
      ps.forEach((p, i) => {
        CK.local(p, { key: k, lang: l, part: i, builtin: bs[i] }).forEach(x => out.push({ ...x, l, part: i, src: "local" }));
        if (l === "en" && !(CK.codeKey(k) && i === 0)) (CK.cached(p, k) || []).forEach(m => out.push({ sev: "warn", l, part: i, msg: m.msg, at: m.at, len: m.len, fixes: m.fixes, bad: m.bad, rule: m.rule, src: "lt" }));
      });
    }
    const f = st.fits.get(k);
    if (f && f.res) for (const l of LANGS) for (const w of [360, 390]) for (const r of (f.res[l] || {})[w] || []) if (r.found && (r.spill || r.now > r.def))
      out.push({ sev: "warn", l, part: r.part, src: "fit", code: "fit" + w, msg: { en: s("fitLine", { w, lang: l.toUpperCase(), now: r.now, def: r.def }) + ": " + (r.spill ? S.fitSpill[0] : S.fitMore[0]), id: s("fitLine", { w, lang: l.toUpperCase(), now: r.now, def: r.def }) + ": " + (r.spill ? S.fitSpill[1] : S.fitMore[1]) } });
    return out.filter(x => !ign(x));
  }
  const counted = k => issuesOf(k).filter(x => x.sev !== "soft").length;

  // ---- the list ----
  function visible() {
    const q = st.q.trim().toLowerCase();
    return keys().filter(k => {
      if (st.filter === "changed" && !changed(k) && !st.drafts.has(k)) return false;
      if (st.filter === "issues" && !counted(k)) return false;
      if (!q) return true;
      const hay = [k, purpose(k), ...LANGS.flatMap(l => [cur(l, k).join(" "), bparts(l, k).join(" ")])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }
  const mine = () => !!el && el.id === "admTab-words";   // the panel is shared by all tabs: a late repaint must not draw over another tab
  function paint(focus) {
    if (!mine()) return;
    const q0 = el.querySelector("#awSearch"); if (q0) st.q = q0.value;   // typed while a repaint was on its way: keep it
    BI = ctx.builtin.copy;
    const vis = visible(), open = !!(st.q.trim() || st.filter !== "all");
    const groups = GROUPS.map(g => [g, vis.filter(k => groupOf(k) === g[0])]).filter(x => x[1].length);
    const chip = (f, label) => `<button type="button" class="aw-chip" data-f="${f}" aria-pressed="${st.filter === f}">${esc(s(label))}</button>`;
    el.innerHTML = `<div class="aw">
      <p class="aw-intro">${esc(s("intro"))}</p>
      <div class="aw-bar"><label class="aw-sr" for="awSearch">${esc(s("search"))}</label><input id="awSearch" class="aw-in" type="search" autocomplete="off" placeholder="${esc(s("search"))}" value="${esc(st.q)}">
        <div class="aw-chips" role="group">${chip("all", "all")}${chip("changed", "changed")}${chip("issues", "issues")}</div>
        <div class="aw-chips"><button type="button" class="aw-btn" data-a="report" aria-pressed="${st.panel === "report"}">${esc(s("report"))}</button><button type="button" class="aw-btn" data-a="imp" aria-pressed="${st.panel === "imp"}">${esc(s("impression"))}</button></div></div>
      ${st.flash ? `<p class="aw-flash" role="status">${esc(st.flash)}</p>` : ""}
      <div class="aw-panel" ${st.panel ? "" : "hidden"}>${st.panel === "report" ? reportHtml() : st.panel === "imp" ? impHtml() : ""}</div>
      <p class="aw-count">${esc(vis.length ? s("lines", { n: vis.length }) : s("none"))}</p>
      ${groups.map(([g, ks]) => { const ex = open || st.expanded.has(g[0]) || ks.includes(st.open);
        return `<section class="aw-g"><h3><button type="button" class="aw-gh" data-g="${g[0]}" aria-expanded="${ex}">${esc(lg() ? g[2] : g[1])} <span>(${ks.length})</span></button></h3>${ex ? ks.map(rowHtml).join("") : ""}</section>`; }).join("")}
    </div>${st.imp ? impOverlay() : ""}`;
    el.scrollTop = st.scroll;
    if (focus) { const f = el.querySelector(focus); if (f) { f.focus({ preventScroll: true }); if (f.setSelectionRange && f.type !== "button" && f.value != null) try { f.setSelectionRange(f.value.length, f.value.length); } catch (e) {} } }
  }
  function rowHtml(k) {
    const n = counted(k), dr = st.drafts.has(k), ch = changed(k), en = cur("en", k).join(" | "), id = cur("id", k).join(" | ");
    const badges = (ch ? `<span class="aw-b aw-b-ch">${esc(s("badgeChanged"))}</span>` : "") + (dr && dirty(k) ? `<span class="aw-b aw-b-dr">${esc(s("badgeDraft"))}</span>` : "") + (n ? `<span class="aw-b aw-b-is">${esc(s("badgeIssues", { n }))}</span>` : "");
    return `<div class="aw-row${st.open === k ? " on" : ""}" data-key="${esc(k)}"><button type="button" class="aw-open" data-k="${esc(k)}" aria-expanded="${st.open === k}">
      <span class="aw-top"><code>${esc(k)}</code>${badges}</span><span class="aw-purpose">${esc(purpose(k))}</span>
      <span class="aw-txt" lang="en">${esc(en)}</span><span class="aw-txt aw-id" lang="id">${esc(id)}</span></button>${st.open === k ? editorHtml(k) : ""}</div>`;
  }

  // ---- the editor of one line ----
  function editorHtml(k) {
    const n = bparts("en", k).length, names = partNames(k, n), note = notes[k];
    const col = l => {
      const ps = cur(l, k), bs = bparts(l, k);
      return `<div class="aw-col" lang="${l}"><h4>${esc(s(l))}</h4>
        ${ps.map((p, i) => `<label class="${names[i] ? "aw-lab" : "aw-sr"}" for="aw-${l}-${i}">${esc(names[i] || s(l))}</label><textarea class="aw-in aw-ta" id="aw-${l}-${i}" data-l="${l}" data-i="${i}" rows="${Math.min(6, Math.max(2, Math.ceil(String(bs[i] || "").length / 34)))}" lang="${l}" spellcheck="true">${esc(p)}</textarea>`).join("")}
        <p class="aw-def"><b>${esc(s("builtin"))}</b> ${esc(bs.join(" | "))}</p>
        <div class="aw-iss" data-iss="${l}">${issuesHtml(k, l)}</div>
        <div class="aw-read" data-read="${l}">${readHtml(k, l)}</div>
        <div class="aw-acts"><button type="button" class="aw-btn" data-a="reset" data-l="${l}">${esc(st.resetUndo[k + l] ? s("undoReset") : s("reset"))}</button>
        ${l === "en" ? `<button type="button" class="aw-btn" data-a="lt"${st.ltBusy[k] ? " disabled" : ""}>${esc(st.ltBusy[k] ? s("checking") : s("grammar"))}</button>` : ""}</div>
        <p class="aw-note">${esc(l === "en" ? s("ltNote") : s("idNote"))}</p></div>`;
    };
    return `<div class="aw-ed" role="group" aria-label="${esc(k)}">
      ${note ? `<p class="aw-note"><b>${esc(s("note"))}</b> ${esc(note)}</p>` : ""}
      <div class="aw-cols">${col("en")}${col("id")}</div>
      <div class="aw-fit" data-fit>${fitHtml(k)}</div>
      ${st.ask ? `<div class="aw-ask" role="alertdialog" aria-label="${esc(s("askTitle"))}"><p>${esc(s("askTitle"))}</p><div class="aw-acts">
        <button type="button" class="aw-btn pri" data-a="save">${esc(s("save"))}</button><button type="button" class="aw-btn" data-a="discard">${esc(s("discard"))}</button><button type="button" class="aw-btn" data-a="keep">${esc(s("keep"))}</button></div></div>` : ""}
      <p class="aw-msg" role="alert" data-msg>${st.blockMsg ? esc(s("blocked")) : ""}</p>
      <div class="aw-acts aw-main-acts"><button type="button" class="aw-btn pri" data-a="save">${esc(s("save"))}</button><button type="button" class="aw-btn" data-a="cancel">${esc(s("cancel"))}</button>
        <button type="button" class="aw-btn" data-a="fit">${esc(s("fit"))}</button><button type="button" class="aw-btn" data-a="back">${esc(s("back"))}</button></div></div>`;
  }
  function issuesHtml(k, l) {
    if (!CK) return "";
    const items = issuesOf(k).filter(x => x.l === l && x.src !== "fit");
    const ltState = l === "en" ? (st.ltErr[k] ? `<p class="aw-warn" role="alert">${esc(s("ltFail"))}</p>` : cur("en", k).every((p, i) => (CK.codeKey(k) && i === 0) || !p.trim() || CK.cached(p, k)) && cur("en", k).some(p => CK.cached(p, k)) && !items.some(x => x.src === "lt") ? `<p class="aw-ok">${esc(s("ltClean"))}</p>` : "") : "";
    return ltState + items.map((x, j) => {
      const fixes = x.fixes || (x.fix != null ? [x.fix] : []);
      const where = cur(l, k).length > 1 ? partNames(k, cur(l, k).length)[x.part] + ": " : "";
      return `<div class="aw-is aw-${x.sev}"><span class="aw-sev">${esc(tx(S.sev[x.sev]))}</span> ${esc(where)}${esc(typeof x.msg === "string" ? x.msg : tx(x.msg))}${x.bad ? ` <q>${esc(x.bad)}</q>` : ""}
        ${fixes.length || x.src === "lt" || x.sev === "soft" ? `<span class="aw-fixes">${fixes.slice(0, 5).map((f, fi) => `<button type="button" class="aw-btn aw-sm" data-a="fix" data-l="${l}" data-j="${j}" data-fi="${fi}">${esc(s("use"))}: ${esc(f === "" ? (lg() ? "(hapus)" : "(remove)") : f === " " ? (lg() ? "(satu spasi)" : "(one space)") : f)}</button>`).join("")}${x.src === "lt" || x.sev === "soft" ? `<button type="button" class="aw-btn aw-sm" data-a="ignore" data-l="${l}" data-j="${j}">${esc(s("ignore"))}</button>` : ""}</span>` : ""}</div>`;
    }).join("");
  }
  function readHtml(k, l) {
    if (!CK) return "";
    const now = CK.readability(cur(l, k).join(". "), l), def = CK.readability(bparts(l, k).join(". "), l);
    if (!now || now.words < 4) return "";
    const row = (label, a, b) => `<tr><th scope="row">${esc(label)}</th><td>${a ?? "-"}</td><td>${b ?? "-"}</td></tr>`;
    const harder = now.flesch !== null && def && def.flesch !== null && now.flesch < def.flesch - 15 && now.flesch < 60;
    return `<table class="aw-tab"><caption>${esc(s("read"))}</caption><tr><td></td><th scope="col">${esc(s("readNow"))}</th><th scope="col">${esc(s("readDef"))}</th></tr>
      ${l === "en" ? row(s("flesch"), now.flesch, def && def.flesch) : ""}${row(s("perSentence"), now.perSentence, def && def.perSentence)}${row(s("perWord"), now.perWord, def && def.perWord)}</table>
      ${l === "en" && now.flesch !== null ? `<p class="aw-note">${esc(s("fleschHint"))}</p>` : ""}${harder ? `<p class="aw-warn">${esc(s("harder"))}</p>` : ""}`;
  }
  function fitHtml(k) {
    const f = st.fits.get(k);
    if (CK && CK.screenReader(k)) return f ? `<p class="aw-note">${esc(s("fitAria"))}</p>` : "";
    if (!f) return "";
    if (f.busy) return `<p class="aw-note" role="status">${esc(s("fitting"))}</p>`;
    if (f.err) return `<p class="aw-warn">${esc(s("fitFail"))}</p>`;
    const lines = [];
    for (const l of LANGS) for (const w of [360, 390]) for (const r of (f.res[l] || {})[w] || []) if (r.found)
      lines.push(`<li class="${r.spill || r.now > r.def ? "aw-warn" : "aw-ok"}">${esc(s("fitLine", { w, lang: l.toUpperCase(), now: r.now, def: r.def }))}${f.res[l][w].length > 1 ? " (" + esc(partNames(k, f.res[l][w].length)[r.part]) + ")" : ""}: ${esc(r.spill ? s("fitSpill") : r.now > r.def ? s("fitMore") : s("fitOk"))}</li>`);
    return lines.length ? `<ul class="aw-fitl">${lines.join("")}</ul>` : `<p class="aw-note">${esc(s("fitNone"))}</p>`;
  }
  // Repaint only the parts of the open editor that follow the text (the textareas keep focus and caret).
  function repaintEditor(k) {
    const ed = mine() && el.querySelector(".aw-ed"); if (!ed) return;
    for (const l of LANGS) { const a = ed.querySelector(`[data-iss="${l}"]`), b = ed.querySelector(`[data-read="${l}"]`); if (a) a.innerHTML = issuesHtml(k, l); if (b) b.innerHTML = readHtml(k, l); }
    const f = ed.querySelector("[data-fit]"); if (f) f.innerHTML = fitHtml(k);
    const row = el.querySelector(`.aw-row[data-key="${CSS.escape(k)}"] .aw-top`);
    if (row) { const tmp = document.createElement("div"); tmp.innerHTML = rowHtml(k); const t = tmp.querySelector(".aw-top"); if (t) row.innerHTML = t.innerHTML; }
  }

  function openRow(k) {
    if (st.open === k) return;
    if (st.open && dirty(st.open)) { st.ask = true; paint(".aw-ask .pri"); return; }
    if (st.open) closeRow(true);
    st.open = k; st.ask = false; st.flash = null; st.blockMsg = false;
    if (!st.drafts.has(k)) st.drafts.set(k, { en: cur("en", k), id: cur("id", k) });
    pushEntry();
    paint("#aw-en-0");
    const row = el.querySelector(`.aw-row[data-key="${CSS.escape(k)}"]`); if (row && row.scrollIntoView) row.scrollIntoView({ block: "nearest" });
  }
  // Close the editor. keepDraft: an unsaved draft stays (shown as "Not saved") instead of being dropped.
  function closeRow(quiet) {
    const k = st.open; if (!k) return;
    if (!dirty(k)) st.drafts.delete(k);
    st.open = null; st.ask = false; delete st.resetUndo[k + "en"]; delete st.resetUndo[k + "id"];
    dropEntry();
    if (!quiet) paint(`.aw-open[data-k="${CSS.escape(k)}"]`);
  }
  // Back, Esc and Cancel: leave at once when nothing changed, else ask (save, discard or keep editing).
  function leave() { if (!st.open) return; if (dirty(st.open)) { st.ask = true; paint(".aw-ask .pri"); } else closeRow(); }
  // The rules that block saving, checked here too so they hold even before the checks file has loaded.
  const PH = /\{\w+\}/g, GLYPH = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/u;
  function hardBlock(k) {
    const d = st.drafts.get(k);
    return !!d && LANGS.some(l => d[l].some((p, i) => { const b = String(bparts(l, k)[i] ?? "");
      return p.trim() && ((b.match(PH) || []).some(x => !p.includes(x)) || (p.match(PH) || []).some(x => !b.includes(x)) || GLYPH.test(p) || /[<>|]/.test(p)); }));
  }
  const blocking = k => hardBlock(k) ? [1] : issuesOf(k).filter(x => x.sev === "block");
  async function save() {
    const k = st.open; if (!k) return;
    if (!CK && !hardBlock(k)) { await needChecks().catch(() => {}); if (st.open !== k) return; }
    if (blocking(k).length) { st.ask = false; st.blockMsg = true; paint(); const bad = el.querySelector(".aw-ed .aw-block"); if (bad) bad.scrollIntoView({ block: "nearest" }); return; }
    st.blockMsg = false;
    const d = st.drafts.get(k);
    ctx.setData(x => {
      x.copy = x.copy && typeof x.copy === "object" ? x.copy : {};
      for (const l of LANGS) {
        x.copy[l] = x.copy[l] && typeof x.copy[l] === "object" ? x.copy[l] : {};
        const b = base(l, k), bs = bparts(l, k), ps = d[l].map((p, i) => p.trim() ? p.trim() : bs[i]);
        const v = Array.isArray(b) ? ps : ps.join("|");
        if (JSON.stringify(v) === JSON.stringify(b)) delete x.copy[l][k]; else x.copy[l][k] = v;
      }
    });
    st.drafts.delete(k); st.flash = s("saved");
    closeRow();
  }

  // ---- Back on a phone (history): the editor has its own entry, like the image editor ----
  function pushEntry() { if (st.pushed) return; try { history.pushState(Object.assign({}, history.state, { aw: 1 }), ""); st.pushed = true; addEventListener("popstate", onPop, true); } catch (e) {} }
  function dropEntry() {
    if (!st.pushed) return;
    st.pushed = false; removeEventListener("popstate", onPop, true);
    if (history.state && history.state.aw) { const quiet = e => { e.stopImmediatePropagation(); removeEventListener("popstate", quiet, true); }; addEventListener("popstate", quiet, true); history.back(); }
  }
  function onPop(e) {
    e.stopImmediatePropagation();
    st.pushed = false; removeEventListener("popstate", onPop, true);
    if (!st.open) return;
    if (dirty(st.open)) { pushEntry(); st.ask = true; paint(".aw-ask .pri"); } else closeRow();
  }

  // ---- LanguageTool, one line ----
  async function grammar(k) {
    await needChecks();
    st.ltBusy[k] = true; st.ltErr[k] = false; paint();
    try { await CK.grammar(cur("en", k).map((text, i) => ({ key: k, text })).filter((x, i) => !(CK.codeKey(k) && i === 0))); }
    catch (e) { st.ltErr[k] = true; }
    st.ltBusy[k] = false;
    if (st.open === k) { paint(); const b = el.querySelector('.aw-ed [data-a="lt"]'); if (b) b.focus({ preventScroll: true }); } else paint();
  }
  // One tap on a suggestion: the text changes in the draft; the other LanguageTool matches move with it.
  function applyFix(k, l, j, fi) {
    const x = issuesOf(k).filter(y => y.l === l && y.src !== "fit")[j]; if (!x) return;
    const fixes = x.fixes || (x.fix != null ? [x.fix] : []), f = fixes[fi]; if (f == null || x.at == null) return;
    const d = st.drafts.get(k), old = d[l][x.part];
    if (x.bad != null && old.substr(x.at, x.len) !== x.bad) return;
    const now = old.slice(0, x.at) + f + old.slice(x.at + x.len), delta = f.length - x.len;
    d[l][x.part] = now;
    if (x.src === "lt" && CK._cache.has(old)) CK._cache.set(now, CK._cache.get(old).filter(m => m.at + m.len <= x.at || m.at >= x.at + x.len)
      .map(m => m.at >= x.at + x.len ? { ...m, at: m.at + delta } : m).filter(m => now.substr(m.at, m.len) === m.bad));
    const ta = el.querySelector(`#aw-${l}-${x.part}`); if (ta) ta.value = now;
    repaintEditor(k);
  }

  // ---- fit on the phone ----
  async function fitKey(k) {
    await needChecks();
    if (CK.screenReader(k)) { st.fits.set(k, { res: {} }); repaintEditor(k); return; }
    st.fits.set(k, { busy: true }); repaintEditor(k);
    try {
      const res = {};
      for (const l of LANGS) res[l] = await CK.fit(k, cur(l, k).map((now, part) => ({ part, now: now.trim() || bparts(l, k)[part], def: bparts(l, k)[part] })));
      st.fits.set(k, LANGS.every(l => !res[l][360] && !res[l][390]) ? { err: true } : { res });
    } catch (e) { st.fits.set(k, { err: true }); }
    if (st.open === k) repaintEditor(k); else if (st.panel === "report") paint();
  }

  // ---- the page-wide report ----
  function reportHtml() {
    if (!CK) return `<p class="aw-note">${esc(s("checking"))}</p>`;
    const all = keys(), rows = [];
    let w = 0, so = 0, lines = 0;
    for (const k of all) { const is = issuesOf(k); if (!is.length) continue; lines++; for (const x of is) { if (x.sev === "soft") so++; else w++; if (x.sev !== "soft") rows.push([k, x]); } }
    const ltDone = all.filter(k => cur("en", k).every((p, i) => (CK.codeKey(k) && i === 0) || !p.trim() || CK.cached(p, k))).length;
    const a = st.all;
    return `<h2>${esc(s("repTitle"))}</h2>
      <p>${esc(w || so ? s("repCounts", { w, s: so, k: lines }) : s("repEmpty"))}</p>
      <p>${esc(s("repLt", { n: ltDone, t: all.length }))}</p>
      <p class="aw-note">${esc(s("ltNoteAll"))}</p>
      <div class="aw-acts">${a && a.busy ? `<button type="button" class="aw-btn" data-a="stopAll">${esc(s("stop"))}</button>` : `<button type="button" class="aw-btn pri" data-a="checkAll">${esc(s("checkAll"))}</button>`}
        <button type="button" class="aw-btn" data-a="fitChanged">${esc(s("fitChanged"))}</button><button type="button" class="aw-btn" data-a="closePanel">${esc(s("close"))}</button></div>
      ${a ? `<p class="${a.err ? "aw-warn" : "aw-note"}" role="status">${esc(a.text)}</p>` : ""}
      <ul class="aw-rep">${rows.slice(0, 80).map(([k, x]) => `<li class="aw-${x.sev}"><button type="button" class="aw-btn aw-sm" data-a="goto" data-k="${esc(k)}">${esc(s("open"))}</button> <code>${esc(k)}</code> ${x.l.toUpperCase()}: ${esc(typeof x.msg === "string" ? x.msg : tx(x.msg))}${x.bad ? ` <q>${esc(x.bad)}</q>` : ""}</li>`).join("")}</ul>`;
  }
  async function checkAll() {
    await needChecks();
    const ctl = new AbortController(), all = keys();
    st.all = { busy: true, ctl, text: s("progress", { d: 0, t: "..." }) }; paint();
    const items = all.flatMap(k => cur("en", k).map((text, i) => ({ key: k, text, i })).filter(x => !(CK.codeKey(x.key) && x.i === 0)));
    try {
      await CK.grammar(items, { signal: ctl.signal, onProgress: (d, t, wait) => { if (!st.all || st.all.ctl !== ctl) return; st.all.text = s("progress", { d, t }) + (wait ? s("waiting", { s: wait }) : ""); const p = el && el.querySelector('.aw-panel [role="status"]'); if (p) p.textContent = st.all.text; else if (st.panel === "report") paint(); } });
      st.all = { text: s("allDone") };
    } catch (e) { st.all = e && e.name === "AbortError" ? { text: s("stopped") } : { text: s("ltFail"), err: true }; }
    if (st.panel === "report") paint();
  }
  async function fitChanged() {
    const ks = keys().filter(k => changed(k) || st.drafts.has(k));
    for (const k of ks) await fitKey(k);
    if (st.panel === "report") paint();
  }

  // ---- the 5-second impression test ----
  const screens = () => SCREENS.filter(x => x[3].some(k => base("en", k) !== undefined));   // screens whose words still exist
  function impHtml() {
    const i = st.impSel || screens()[0][0], l = st.impLang || ["en", "id"][lg()];
    return `<h2>${esc(s("impTitle"))}</h2><p>${esc(s("impIntro"))}</p>
      <div class="aw-chips" role="group" aria-label="${esc(s("impTitle"))}">${screens().map(x => `<button type="button" class="aw-chip" data-a="impSel" data-v="${x[0]}" aria-pressed="${x[0] === i}">${esc(lg() ? x[2] : x[1])}</button>`).join("")}</div>
      <div class="aw-chips" role="group" aria-label="${esc(s("impLang"))}">${LANGS.map(x => `<button type="button" class="aw-chip" data-a="impLang" data-v="${x}" aria-pressed="${x === l}">${esc(s(x))}</button>`).join("")}</div>
      <div class="aw-acts"><button type="button" class="aw-btn pri" data-a="impStart">${esc(s("start"))}</button><button type="button" class="aw-btn" data-a="closePanel">${esc(s("close"))}</button></div>
      ${st.runs.length ? `<h3>${esc(s("runs"))}</h3><ul class="aw-runs">${st.runs.map(r => `<li>${esc(r.name)}, ${r.lang.toUpperCase()}: <b>${r.pct}%</b> (${esc(s("missed"))}: ${esc(r.missed.join(", ") || "-")})</li>`).join("")}</ul>` : ""}
      <p class="aw-note">${esc(s("session"))}</p>`;
  }
  function screenText(id, l) { const sc = SCREENS.find(x => x[0] === id); return sc[3].filter(k => base(l, k) !== undefined).map(k => [k, cur(l, k)]); }
  function impOverlay() {
    const m = st.imp, sc = SCREENS.find(x => x[0] === m.id);
    const body = m.phase === "show" ? `<div class="aw-phone" lang="${m.lang}">${screenText(m.id, m.lang).map(([k, ps]) => /title|kick/.test(k) && ps.length === 1 ? `<p class="aw-ph-h">${esc(ps[0])}</p>`
        : ps.length > 1 ? `<p class="aw-ph-p"><b>${esc(ps[0])}</b> ${esc(ps.slice(1).join(" "))}</p>` : `<p class="aw-ph-p">${esc(ps[0])}</p>`).join("")}<i class="aw-ph-bar"></i></div>`
      : m.phase === "ask" ? `<label class="aw-lab" for="awRecall">${esc(s("remember"))}</label><textarea id="awRecall" class="aw-in aw-ta" rows="5" lang="${m.lang}"></textarea>
        <div class="aw-acts"><button type="button" class="aw-btn pri" data-a="impScore">${esc(s("score"))}</button><button type="button" class="aw-btn" data-a="impCancel">${esc(s("cancel"))}</button></div>`
      : `<p class="aw-score">${esc(s("pct", { p: m.res.pct }))}</p><p><b>${esc(s("recalled"))}:</b> ${esc(m.res.hit.join(", ") || "-")}</p><p><b>${esc(s("missed"))}:</b> ${esc(m.res.missed.join(", ") || "-")}</p>
        <div class="aw-acts"><button type="button" class="aw-btn pri" data-a="impStart">${esc(s("again"))}</button><button type="button" class="aw-btn" data-a="impCancel">${esc(s("close"))}</button></div>`;
    return `<div class="aw-ov" role="dialog" aria-modal="true" aria-label="${esc(s("impTitle"))}"><div class="aw-ov-card"><h2>${esc(lg() ? sc[2] : sc[1])}</h2>
      ${m.phase === "show" ? `<p class="aw-note" role="status">${esc(s("looking"))}</p>` : ""}${body}
      ${m.phase === "show" ? `<div class="aw-acts"><button type="button" class="aw-btn" data-a="impCancel">${esc(s("cancel"))}</button></div>` : ""}</div></div>`;
  }
  function impStart() {
    const id = st.impSel || screens()[0][0], lang = st.impLang || ["en", "id"][lg()];
    clearTimeout(st.impT);
    st.imp = { id, lang, phase: "show" }; paint(".aw-ov [data-a=impCancel]");
    st.impT = setTimeout(() => { if (st.imp && st.imp.phase === "show") { st.imp.phase = "ask"; paint("#awRecall"); } }, 5000);
  }
  function impScore() {
    const m = st.imp, typed = (el.querySelector("#awRecall") || {}).value || "";
    const shown = screenText(m.id, m.lang).map(([k, ps]) => ps.join(" ")).join(" ");
    m.res = CK.recall(shown, typed); m.phase = "done";
    const sc = SCREENS.find(x => x[0] === m.id);
    st.runs.unshift({ name: lg() ? sc[2] : sc[1], lang: m.lang, pct: m.res.pct, missed: m.res.missed.slice(0, 8) });
    paint(".aw-ov .pri");
  }
  function impCancel() { clearTimeout(st.impT); st.imp = null; paint('[data-a="impStart"]'); }

  // ---- notes from js/data.js (the comment above a key says what it is for) ----
  let notesLoad = null;
  function loadNotes() {
    if (notesLoad) return notesLoad;
    notesLoad = fetch("js/data.js", { cache: "no-cache" }).then(r => r.ok ? r.text() : "").then(src => {
      const a = src.indexOf("const COPY = {"), b = src.indexOf("\n  id: {", a); if (a < 0 || b < 0) return;
      let pending = [];
      for (const line of src.slice(a, b).split("\n")) {
        const c = line.match(/^\s*\/\/\s?(.*)$/); if (c) { pending.push(c[1]); continue; }
        const k = line.match(/^\s*"([\w.]+)":/);
        if (k) { const tail = (line.match(/\/\/\s?(.*)$/) || [])[1]; const n = [...pending, tail].filter(Boolean).join(" ").replace(/\s*\((?:[A-Z]\d+|D\d+|B\d+)[^)]*\)/g, "").trim(); if (n) notes[k[1]] = n; pending = []; }
      }
    }).catch(() => {});
    return notesLoad;
  }

  // ---- events ----
  function onClick(e) {
    const b = e.target.closest("button"); if (!b || !el.contains(b)) return;
    if (b.dataset.f) { st.filter = b.dataset.f; return paint(`[data-f="${b.dataset.f}"]`); }
    if (b.dataset.g) { const g = b.dataset.g; st.expanded.has(g) ? st.expanded.delete(g) : st.expanded.add(g); return paint(`[data-g="${g}"]`); }
    if (b.classList.contains("aw-open")) { const k = b.dataset.k; return st.open === k ? leave() : openRow(k); }
    const a = b.dataset.a, k = st.open;
    switch (a) {
      case "save": return save();
      case "cancel": case "back": return leave();
      case "discard": { const kk = st.open; st.drafts.delete(kk); st.ask = false; return closeRow(); }
      case "keep": st.ask = false; return paint("#aw-en-0");
      case "reset": {
        const l = b.dataset.l, d = st.drafts.get(k), u = st.resetUndo[k + l];
        if (u) { d[l] = u; delete st.resetUndo[k + l]; } else { st.resetUndo[k + l] = d[l].slice(); d[l] = bparts(l, k); }
        return paint(`[data-a="reset"][data-l="${l}"]`);
      }
      case "lt": return grammar(k);
      case "fix": return applyFix(k, b.dataset.l, +b.dataset.j, +b.dataset.fi);
      case "ignore": { const x = issuesOf(k).filter(y => y.l === b.dataset.l && y.src !== "fit")[+b.dataset.j]; if (x) st.ignored.add(k + "|" + x.l + "|" + x.part + "|" + (x.rule || x.code) + "|" + (x.bad || x.at)); return repaintEditor(k); }
      case "fit": return fitKey(k);
      case "report": st.panel = st.panel === "report" ? null : "report"; st.scroll = 0; needChecks().then(() => paint()); return paint('[data-a="report"]');
      case "imp": st.panel = st.panel === "imp" ? null : "imp"; st.scroll = 0; needChecks(); return paint('[data-a="imp"]');
      case "closePanel": { const p = st.panel; st.panel = null; return paint(`[data-a="${p === "imp" ? "imp" : "report"}"]`); }
      case "checkAll": return checkAll();
      case "stopAll": if (st.all && st.all.ctl) st.all.ctl.abort(); return;
      case "fitChanged": return fitChanged();
      case "goto": { const kk = b.dataset.k; st.q = ""; st.filter = "all"; return openRow(kk); }
      case "impSel": st.impSel = b.dataset.v; return paint(`[data-a="impSel"][data-v="${b.dataset.v}"]`);
      case "impLang": st.impLang = b.dataset.v; return paint(`[data-a="impLang"][data-v="${b.dataset.v}"]`);
      case "impStart": return needChecks().then(impStart);
      case "impScore": return impScore();
      case "impCancel": return impCancel();
    }
  }
  let searchT = 0;
  function onInput(e) {
    const t = e.target;
    if (t.id === "awSearch") { st.q = t.value; clearTimeout(searchT); searchT = setTimeout(() => paint("#awSearch"), 180); return; }
    if (t.dataset.l && t.dataset.i && st.open) {
      const d = st.drafts.get(st.open); d[t.dataset.l][+t.dataset.i] = t.value; delete st.resetUndo[st.open + t.dataset.l];
      if (st.blockMsg) { st.blockMsg = false; const m = el.querySelector(".aw-ed [data-msg]"); if (m) m.textContent = ""; }
      clearTimeout(onInput.t); onInput.t = setTimeout(() => repaintEditor(st.open), 120);
    }
  }
  function onKey(e) {
    if (e.key !== "Escape") return;
    if (st.imp) impCancel();
    else if (st.ask) { st.ask = false; paint("#aw-en-0"); }
    else if (st.open) leave();
    else if (st.panel) { const p = st.panel; st.panel = null; paint(`[data-a="${p === "imp" ? "imp" : "report"}"]`); }
    else return;
    e.preventDefault(); e.stopPropagation();
  }

  const STYLE = `
#adminRoot .aw{display:grid;gap:12px;max-width:1100px;margin:0 auto}
#adminRoot .aw-intro{margin:0;line-height:1.45}
#adminRoot .aw-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
#adminRoot .aw-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
#adminRoot .aw-in{box-sizing:border-box;width:100%;min-height:44px;padding:10px 12px;border:2px solid var(--line);border-radius:12px;background:#fff;color:var(--ink);font:inherit;font-size:1rem}
#adminRoot .aw-bar .aw-in{flex:1 1 260px;width:auto}
#adminRoot .aw-ta{resize:vertical;line-height:1.4}
#adminRoot .aw-chips{display:flex;flex-wrap:wrap;gap:6px}
#adminRoot .aw-chip,#adminRoot .aw-btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:14px;border:2px solid var(--line);background:#fff;color:var(--ink);font:600 .92rem Fredoka,Poppins,sans-serif;cursor:pointer}
#adminRoot .aw-chip[aria-pressed=true],#adminRoot .aw-btn[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
#adminRoot .aw-btn.pri{background:var(--accent);border-color:#b77e00;box-shadow:0 3px 0 #b77e00}
#adminRoot .aw-btn:disabled{opacity:.55;cursor:default}
#adminRoot .aw-sm{padding:6px 10px;font-size:.85rem}
#adminRoot .aw-flash{margin:0;padding:10px 12px;border-radius:12px;background:#e6f4ea;color:#1f5f33;font-weight:600}
#adminRoot .aw-count{margin:0;color:var(--mute)}
#adminRoot .aw-panel{padding:12px 14px;border:2px solid var(--line);border-radius:14px;background:#fff}
#adminRoot .aw-panel[hidden]{display:none}
#adminRoot .aw-panel h2,#adminRoot .aw-ov h2{margin:0 0 6px;font-size:1.1rem}
#adminRoot .aw-g h3{margin:0}
#adminRoot .aw-gh{width:100%;min-height:44px;text-align:left;padding:8px 12px;border:0;border-bottom:2px solid var(--line);background:none;color:var(--ink);font:600 1.02rem Fredoka,Poppins,sans-serif;cursor:pointer}
#adminRoot .aw-gh::before{content:"\\25B8";display:inline-block;width:1.1em;transition:transform .15s}
#adminRoot .aw-gh[aria-expanded=true]::before{transform:rotate(90deg)}
#adminRoot .aw-gh span{color:var(--mute);font-weight:500}
#adminRoot .aw-row{border:2px solid var(--line);border-radius:14px;background:#fff;margin:8px 0;overflow:hidden}
#adminRoot .aw-row.on{border-color:var(--ink)}
#adminRoot .aw-open{display:grid;gap:3px;width:100%;min-height:44px;text-align:left;padding:10px 12px;border:0;background:none;color:var(--ink);font:inherit;cursor:pointer}
#adminRoot .aw-top{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#adminRoot .aw-top code{font-size:.82rem;color:var(--mute);overflow-wrap:anywhere}
#adminRoot .aw-purpose{font-size:.85rem;color:var(--mute)}
#adminRoot .aw-txt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.95rem}
#adminRoot .aw-id{color:#4a2f66}
#adminRoot .aw-b{font-size:.75rem;font-weight:600;padding:2px 8px;border-radius:99px;border:1.5px solid}
#adminRoot .aw-b-ch{color:#1f5f33;border-color:#1f7a3d;background:#e6f4ea}
#adminRoot .aw-b-dr{color:#7a4b00;border-color:#b77e00;background:#fff3d6}
#adminRoot .aw-b-is{color:#8c1d18;border-color:#b3261e;background:#fdecea}
#adminRoot .aw-ed{padding:4px 12px 12px;border-top:2px dashed var(--line);display:grid;gap:10px}
#adminRoot .aw-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
#adminRoot .aw-col{display:grid;gap:6px;align-content:start}
#adminRoot .aw-col h4{margin:4px 0 0;font-size:1rem}
#adminRoot .aw-lab{font-weight:600;font-size:.9rem}
#adminRoot .aw-def{margin:0;font-size:.85rem;color:var(--mute);overflow-wrap:anywhere}
#adminRoot .aw-note{margin:0;font-size:.85rem;color:var(--mute);line-height:1.4}
#adminRoot .aw-acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
#adminRoot .aw-is{padding:8px 10px;border-radius:10px;font-size:.9rem;line-height:1.4;border-left:5px solid}
#adminRoot .aw-block{background:#fdecea;border-color:#b3261e}
#adminRoot .aw-warn{background:#fff3d6;border-color:#b77e00}
#adminRoot p.aw-warn,#adminRoot li.aw-warn{padding:6px 10px;border-radius:10px;margin:4px 0;color:#5c3a00}
#adminRoot .aw-soft{background:#f2f0f6;border-color:#8a7aa3}
#adminRoot .aw-ok{color:#1f5f33;margin:4px 0}
#adminRoot .aw-sev{font-weight:700}
#adminRoot .aw-fixes{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
#adminRoot .aw-tab{border-collapse:collapse;font-size:.85rem}
#adminRoot .aw-tab caption{text-align:left;font-weight:600}
#adminRoot .aw-tab th,#adminRoot .aw-tab td{padding:2px 10px 2px 0;text-align:left}
#adminRoot .aw-fitl{margin:0;padding-left:18px}
#adminRoot .aw-msg{margin:0;color:#b3261e;font-weight:600}
#adminRoot .aw-msg:empty{display:none}
#adminRoot .aw-ask{padding:10px 12px;border-radius:12px;background:#fff3d6;border:2px solid #b77e00}
#adminRoot .aw-ask p{margin:0 0 8px;font-weight:600}
#adminRoot .aw-rep{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:6px}
#adminRoot .aw-rep li{padding:6px 8px;border-radius:10px;border-left:5px solid;font-size:.9rem}
#adminRoot .aw-runs{margin:0;padding-left:18px}
#adminRoot .aw-ov{position:fixed;inset:0;z-index:5;background:rgba(43,19,66,.55);display:flex;align-items:center;justify-content:center;padding:16px}
#adminRoot .aw-ov-card{width:min(420px,100%);max-height:100%;overflow:auto;background:var(--paper);color:var(--ink);border-radius:20px;padding:16px;display:grid;gap:10px}
#adminRoot .aw-phone{position:relative;width:min(300px,100%);min-height:420px;margin:0 auto;padding:22px 16px 26px;border:8px solid #2B1342;border-radius:34px;background:#FFF8EC;color:#2B1342;font-family:Fredoka,Poppins,sans-serif;overflow:hidden}
#adminRoot .aw-ph-h{font-size:1.25rem;font-weight:700;margin:0 0 8px;line-height:1.2}
#adminRoot .aw-ph-p{font-size:.98rem;margin:0 0 8px;line-height:1.35}
#adminRoot .aw-ph-bar{position:absolute;left:0;bottom:0;height:6px;width:100%;background:#FFB400;transform-origin:left;animation:aw-shrink 5s linear 1 forwards}
@keyframes aw-shrink{to{transform:scaleX(0)}}
@media (prefers-reduced-motion:reduce){#adminRoot .aw-ph-bar{animation:none}}
#adminRoot .aw-score{font-size:1.4rem;font-weight:700;margin:0}
`;
  function render(target, c) {
    ctx = c; el = target;
    if (!document.getElementById("awCss")) { const x = document.createElement("style"); x.id = "awCss"; x.textContent = STYLE; document.head.appendChild(x); }
    if (!el.dataset.aw) {
      el.dataset.aw = "1";
      el.addEventListener("click", e => { if (el.id === "admTab-words") onClick(e); });
      el.addEventListener("input", e => { if (el.id === "admTab-words") onInput(e); });
      el.addEventListener("keydown", e => { if (el.id === "admTab-words") onKey(e); });
      el.addEventListener("scroll", () => { if (el.id === "admTab-words") st.scroll = el.scrollTop; }, { passive: true });
      const root = el.closest("dialog");
      // admin closed (Close, Esc outside the tab): an open line keeps its unsaved draft for next time; the Back entry goes
      if (root) root.addEventListener("close", () => { if (st.open) { closeRow(true); } clearTimeout(st.impT); st.imp = null; });
    }
    paint();
    needChecks().then(() => { if (el.id === "admTab-words") paint(); }).catch(() => {});
    loadNotes().then(() => { if (el.id === "admTab-words" && st.open) paint(); });
  }

  const def = { title: { en: "Words", id: "Kata-kata" }, render };
  if (window.Admin && window.Admin.registerTab) window.Admin.registerTab("words", def);
  else (window.AdminTabs = window.AdminTabs || []).push(["words", def]);
  return { render, issuesOf: k => issuesOf(k), state: st, GROUPS, SCREENS };
})();
