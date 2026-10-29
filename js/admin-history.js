// Admin History tab ("Riwayat"; docs/admin.md, "History"): what changed, so the owner can remember and audit it.
// Every Publish and Undo writes one entry to data/history.json in the same commit (js/admin-shell.js), with the same
// summary as the commit message: {at, by, kind: "publish"|"undo", title, titleId, changes: [{area, en, id}], files: [path]}.
// This tab shows the changes still waiting to publish and the published log, newest first, with search.
// summarize(before, after, stagedPaths) is also used by the shell to write the entry and the commit message.
const AdminHistory = (() => {
  const S = {
    intro: ["Every publish and undo, with what changed. Kept in the site's own files, so it stays when you change device.", "Setiap terbitan dan pembatalan, beserta apa yang berubah. Tersimpan di berkas situs, jadi tetap ada walau ganti perangkat."],
    waiting: ["Waiting to publish", "Menunggu diterbitkan"], nothing: ["Nothing waiting.", "Tidak ada yang menunggu."],
    published: ["Published", "Sudah terbit"], empty: ["No history yet. It starts with the next publish.", "Belum ada riwayat. Dimulai dari terbitan berikutnya."],
    search: ["Search the history", "Cari di riwayat"], by: ["by", "oleh"], files: ["{n} file(s)", "{n} berkas"], undo: ["Undo", "Pembatalan"],
    loading: ["Loading the history...", "Memuat riwayat..."], all: ["All admin changes on GitHub", "Semua perubahan admin di GitHub"], commit: ["See the commit", "Lihat commit"],
    noMatch: ["Nothing matches.", "Tidak ada yang cocok."]
  };
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  const J = v => JSON.stringify(v === undefined ? null : v);
  const cut = (v, n = 60) => { const s = Array.isArray(v) ? v.join(", ") : String(v ?? ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  const get = (o, ...p) => p.reduce((x, k) => isObj(x) ? x[k] : undefined, o);

  // ---- what changed between two site.json objects (plus the files waiting) ----
  function summarize(a, b, staged) {
    a = isObj(a) ? a : {}; b = isObj(b) ? b : {};
    const out = [], add = (area, en, id) => out.push({ area, en, id });
    // words
    for (const l of ["en", "id"]) {
      const A = get(a, "copy", l) || {}, B = get(b, "copy", l) || {}, L = l.toUpperCase();
      for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
        if (J(A[k]) === J(B[k])) continue;
        if (B[k] === undefined) add("words", `Words ${L}: ${k} back to the built-in text`, `Kata ${L}: ${k} kembali ke teks bawaan`);
        else add("words", `Words ${L}: ${k} = "${cut(B[k])}"`, `Kata ${L}: ${k} = "${cut(B[k])}"`);
      }
    }
    // icons
    const ia = isObj(a.icons) ? a.icons : {}, ib = isObj(b.icons) ? b.icons : {};
    if ((ia.style || "") !== (ib.style || "")) add("icons", `Icons: style ${ib.style || "original"}`, `Ikon: gaya ${ib.style || "asli"}`);
    const ma = ia.map || {}, mb = ib.map || {};
    const icons = [...new Set([...Object.keys(ma), ...Object.keys(mb)])].filter(k => ma[k] !== mb[k]);
    const own = icons.filter(k => /-own-/.test(mb[k] || "")), back = icons.filter(k => !mb[k]), styled = icons.length - own.length - back.length;
    const nm = k => k.split("/").pop().replace(/\.png$/, "");
    if (own.length) add("icons", `Icons: own picture for ${own.map(nm).join(", ")}`, `Ikon: gambar sendiri untuk ${own.map(nm).join(", ")}`);
    if (styled > 0 && (ia.style || "") === (ib.style || "")) add("icons", `Icons: ${styled} restyled`, `Ikon: ${styled} diganti gayanya`);
    if (back.length && ib.style) add("icons", `Icons: ${back.map(nm).join(", ")} back to original`, `Ikon: ${back.map(nm).join(", ")} kembali ke asli`);
    const pa = ia.places || {}, pb = ib.places || {};
    for (const k of new Set([...Object.keys(pa), ...Object.keys(pb)])) if (pa[k] !== pb[k])
      add("icons", pb[k] ? `Icon for ${k}: ${/-own-/.test(pb[k]) ? "own picture" : nm(pb[k])}` : `Icon for ${k}: back to built-in`, pb[k] ? `Ikon untuk ${k}: ${/-own-/.test(pb[k]) ? "gambar sendiri" : nm(pb[k])}` : `Ikon untuk ${k}: kembali ke bawaan`);
    // art
    const pr = x => (Array.isArray(x.projects) ? x.projects : []).filter(isObj), key = p => p.uid || (typeof p.id === "string" ? p.id : p.full);
    const PA = new Map(pr(a).map(p => [key(p), p])), PB = new Map(pr(b).map(p => [key(p), p]));
    for (const [k, p] of PB) if (!PA.has(k)) add("art", `Art: added "${cut(p.title, 40)}"`, `Karya: ditambah "${cut(p.title, 40)}"`);
      else if (J(PA.get(k)) !== J(p)) add("art", `Art: edited "${cut(p.title, 40)}"`, `Karya: diubah "${cut(p.title, 40)}"`);
    for (const [k, p] of PA) if (!PB.has(k)) add("art", `Art: removed "${cut(p.title, 40)}"`, `Karya: dihapus "${cut(p.title, 40)}"`);
    const ha = a.hidden || [], hb = b.hidden || [];
    for (const k of hb) if (!ha.includes(k)) add("art", `Art: hid "${cut(k, 40)}"`, `Karya: disembunyikan "${cut(k, 40)}"`);
    for (const k of ha) if (!hb.includes(k)) add("art", `Art: shown again "${cut(k, 40)}"`, `Karya: ditampilkan lagi "${cut(k, 40)}"`);
    if (J(a.order || []) !== J(b.order || [])) add("art", `Featured six: ${cut(b.order || [], 80) || "picked by the site"}`, `Enam pilihan: ${cut(b.order || [], 80) || "dipilih situs"}`);
    if (J(a.flows) !== J(b.flows)) add("art", "Art: project steps changed", "Karya: langkah proyek berubah");
    // links, contact, features
    for (const k of new Set([...Object.keys(a.links || {}), ...Object.keys(b.links || {})])) if ((get(a, "links", k) || "") !== (get(b, "links", k) || ""))
      add("links", `Link ${k}: ${get(b, "links", k) || "built-in"}`, `Tautan ${k}: ${get(b, "links", k) || "bawaan"}`);
    if ((get(a, "contact", "email") || "") !== (get(b, "contact", "email") || "")) add("settings", `Contact email: ${get(b, "contact", "email") || "built-in"}`, `Email kontak: ${get(b, "contact", "email") || "bawaan"}`);
    for (const l of ["en", "id"]) if ((get(a, "contact", "priceLine", l) || "") !== (get(b, "contact", "priceLine", l) || ""))
      add("settings", `Price line ${l.toUpperCase()}: "${cut(get(b, "contact", "priceLine", l) || "built-in")}"`, `Baris harga ${l.toUpperCase()}: "${cut(get(b, "contact", "priceLine", l) || "bawaan")}"`);
    for (const k of new Set([...Object.keys(a.features || {}), ...Object.keys(b.features || {})])) if (get(a, "features", k) !== get(b, "features", k)) {
      const v = get(b, "features", k); add("settings", `Feature ${k}: ${v === undefined ? "built-in" : v ? "on" : "off"}`, `Fitur ${k}: ${v === undefined ? "bawaan" : v ? "nyala" : "mati"}`); }
    const known = ["version", "copy", "icons", "projects", "hidden", "order", "flows", "links", "contact", "features"];
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (!known.includes(k) && J(a[k]) !== J(b[k])) add("other", `Other: ${k} changed`, `Lainnya: ${k} berubah`);
    const files = (staged || []).slice().sort();
    const areas = { words: "Words", icons: "Icons", art: "Art", links: "Links", settings: "Settings", other: "Other" };
    const count = {}; out.forEach(c => count[c.area] = (count[c.area] || 0) + 1);
    let title = Object.keys(count).map(k => out.filter(c => c.area === k).length === 1 ? out.find(c => c.area === k).en : `${areas[k]}: ${count[k]} changes`).join("; ");
    const areasId = { words: "Kata", icons: "Ikon", art: "Karya", links: "Tautan", settings: "Pengaturan", other: "Lainnya" };
    let titleId = Object.keys(count).map(k => count[k] === 1 ? out.find(c => c.area === k).id : `${areasId[k]}: ${count[k]} perubahan`).join("; ");
    if (!title && files.length) { title = files.length + " file(s)"; titleId = files.length + " berkas"; }
    if (title.length > 100) title = Object.keys(count).map(k => `${areas[k]} (${count[k]})`).join(", ");
    if (titleId.length > 100) titleId = Object.keys(count).map(k => `${areasId[k]} (${count[k]})`).join(", ");
    return { title, titleId, changes: out, files };
  }
  // The commit message: the title, then one line per change.
  const message = sum => sum.title + (sum.changes.length > 1 || sum.files.length ? "\n\n" + sum.changes.map(c => "- " + c.en).concat(sum.files.length ? ["", "Files: " + sum.files.join(", ")] : []).join("\n") : "");

  // ---- the tab ----
  let ctx = null, el = null, log = null, loading = null;
  const session = [];   // entries written in this session (shown before the site has redeployed)
  const st = { q: "" };
  const lg = () => (ctx && ctx.lang === "id") ? 1 : 0;
  const s = (k, n) => S[k][lg()].replace("{n}", n);
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function load() {
    if (!loading) loading = fetch("data/history.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).catch(() => null)
      .then(j => { log = j && Array.isArray(j.entries) ? j.entries.filter(isObj) : []; paint(); });
    return loading;
  }
  addEventListener("admin:history", e => { if (e.detail) { session.push(e.detail); paint(); } });
  function entries() {
    const seen = new Set((log || []).map(x => x.at)), all = (log || []).concat(session.filter(x => !seen.has(x.at)));
    return all.sort((x, y) => String(y.at).localeCompare(String(x.at)));
  }
  function paint(focus) {
    if (!el || el.id !== "admTab-history" || !ctx) return;
    const pend = summarize(ctx.published, ctx.data, ctx.staged()), q = st.q.trim().toLowerCase();
    const list = entries().filter(x => !q || JSON.stringify(x).toLowerCase().includes(q)), when = x => { const d = new Date(x.at); return isNaN(d) ? "" : d.toLocaleString(lg() ? "id-ID" : "en-GB"); };
    el.innerHTML = `<div class="ah"><p class="ah-intro">${esc(s("intro"))}</p>
      <h3>${esc(s("waiting"))}</h3>${pend.changes.length || pend.files.length ? `<ul class="ah-ch">${pend.changes.map(c => `<li>${esc(lg() ? c.id : c.en)}</li>`).join("")}${pend.files.length ? `<li class="ah-note">${esc(s("files", pend.files.length))}</li>` : ""}</ul>` : `<p class="ah-note">${esc(s("nothing"))}</p>`}
      <h3>${esc(s("published"))}</h3>
      <label class="ah-sr" for="ahSearch">${esc(s("search"))}</label><input id="ahSearch" class="ah-in" type="search" autocomplete="off" placeholder="${esc(s("search"))}" value="${esc(st.q)}">
      ${log === null ? `<p class="ah-note" role="status">${esc(s("loading"))}</p>` : !entries().length ? `<p class="ah-note">${esc(s("empty"))}</p>` : !list.length ? `<p class="ah-note">${esc(s("noMatch"))}</p>` : ""}
      <ol class="ah-log">${list.map(x => `<li class="ah-e${x.kind === "undo" ? " ah-undo" : ""}"><details><summary><span class="ah-when">${esc(when(x))}${x.by ? " " + esc(s("by")) + " " + esc(x.by) : ""}</span>
        <b>${x.kind === "undo" ? esc(s("undo")) + ": " : ""}${esc((lg() && x.titleId) || x.title || "")}</b></summary>
        <ul class="ah-ch">${(x.changes || []).map(c => `<li>${esc(lg() ? c.id || c.en : c.en)}</li>`).join("")}</ul>
        ${(x.files || []).length ? `<p class="ah-note">${esc(s("files", x.files.length))}: ${esc(x.files.join(", "))}</p>` : ""}${x.sha ? `<a href="https://github.com/rfim/ekkyarya.com/commit/${esc(x.sha)}" target="_blank" rel="noopener">${esc(s("commit"))}</a>` : ""}</details></li>`).join("")}</ol>
      <p><a class="ah-link" href="https://github.com/rfim/ekkyarya.com/commits/main/data/history.json" target="_blank" rel="noopener">${esc(s("all"))}</a></p></div>`;
    if (focus) { const f = el.querySelector(focus); if (f) { f.focus({ preventScroll: true }); if (f.setSelectionRange) f.setSelectionRange(f.value.length, f.value.length); } }
  }
  const STYLE = `
#adminRoot .ah{display:grid;gap:10px;max-width:900px;margin:0 auto}
#adminRoot .ah h3{margin:6px 0 0;font-size:1.05rem}
#adminRoot .ah-intro{margin:0;line-height:1.45}
#adminRoot .ah-note{margin:0;font-size:.88rem;color:var(--mute);overflow-wrap:anywhere}
#adminRoot .ah-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
#adminRoot .ah-in{box-sizing:border-box;width:100%;min-height:44px;padding:10px 12px;border:2px solid var(--line);border-radius:12px;background:#fff;color:var(--ink);font:inherit;font-size:1rem}
#adminRoot .ah-ch{margin:4px 0;padding-left:20px;line-height:1.45;overflow-wrap:anywhere}
#adminRoot .ah-log{list-style:none;margin:0;padding:0;display:grid;gap:8px}
#adminRoot .ah-e{border:2px solid var(--line);border-radius:14px;background:#fff;padding:0 12px}
#adminRoot .ah-e.ah-undo{border-style:dashed}
#adminRoot .ah-e summary{min-height:44px;padding:10px 0;cursor:pointer;display:grid;gap:2px}
#adminRoot .ah-when{font-size:.82rem;color:var(--mute)}
#adminRoot .ah-e details>*:last-child{margin-bottom:10px}
#adminRoot .ah a{color:var(--ink);display:inline-block;padding:10px 0}
`;
  function render(target, c) {
    ctx = c; el = target;
    if (!document.getElementById("ahCss")) { const x = document.createElement("style"); x.id = "ahCss"; x.textContent = STYLE; document.head.appendChild(x); }
    if (!el.dataset.ah) { el.dataset.ah = "1"; if (c.onChange) c.onChange(() => paint()); el.addEventListener("input", e => { if (el.id === "admTab-history" && e.target.id === "ahSearch") { st.q = e.target.value; paint("#ahSearch"); } }); }
    paint(); load();
  }
  const def = { title: { en: "History", id: "Riwayat" }, render };
  if (window.Admin && window.Admin.registerTab) window.Admin.registerTab("history", def);
  else (window.AdminTabs = window.AdminTabs || []).push(["history", def]);
  return { summarize, message, render };
})();
