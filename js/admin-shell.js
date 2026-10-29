// Admin shell: the screen behind the PIN. Tabs Art, Icons, Links, Settings, Words, Messages, History; each tab is a mount point that
// other scripts fill with Admin.registerTab(id, {title:{en,id}|string, render(el, ctx)}). Also the GitHub token and Publish.
//
// ctx given to render(el, ctx):
//   ctx.data           the working copy of data/site.json (live: always the latest object)
//   ctx.setData(x)     x is a function(draft) that edits the draft (or returns a new object), or an object merged over the top level
//   ctx.getData()      the same object as ctx.data
//   ctx.addFile(path, base64) / ctx.stage(path, base64OrNull)  queue a file for the next Publish (null deletes it); ctx.staged() lists the paths
//   ctx.publish(msg?)  one commit with data/site.json plus every staged file; returns a promise
//   ctx.canPublish   true when a GitHub token is saved (without one, admin is read-only)
//   ctx.lang           "en" or "id" (current); ctx.t({en,id}) picks the text; ctx.onChange(fn) runs after setData / language switch
(() => {
  const A = window.Admin;
  const REPO = "rfim/ekkyarya.com", API = "https://api.github.com", TOKEN_KEY = "admGhToken";
  const TABS = ["art", "icons", "links", "settings", "words", "messages", "history"];   // Words (js/admin-copy.js) took over the Text tab
  const TAB_TITLE = { art: { en: "Art", id: "Karya" }, links: { en: "Links", id: "Tautan" }, settings: { en: "Settings", id: "Pengaturan" },
    history: { en: "History", id: "Riwayat" }, icons: { en: "Icons", id: "Ikon" }, words: { en: "Words", id: "Kata-kata" }, messages: { en: "Messages", id: "Pesan" } };
  const S = {
    title: { en: "Admin", id: "Admin" },
    close: { en: "Close", id: "Tutup" },
    publish: { en: "Publish", id: "Terbitkan" },
    nothing: { en: "Nothing to publish", id: "Tidak ada yang diterbitkan" },
    readonly: { en: "Read only: paste a GitHub token to publish.", id: "Hanya baca: tempel token GitHub untuk menerbitkan." },
    tokenLabel: { en: "GitHub token (Contents: read and write)", id: "Token GitHub (Contents: baca dan tulis)" },
    save: { en: "Save token", id: "Simpan token" },
    forget: { en: "Forget this device", id: "Lupakan perangkat ini" },
    saved: { en: "Token saved on this device only. It is sent to api.github.com and nowhere else.", id: "Token hanya tersimpan di perangkat ini. Hanya dikirim ke api.github.com." },
    bad: { en: "GitHub did not accept this token for the repository.", id: "GitHub tidak menerima token ini untuk repositori." },
    working: { en: "Publishing...", id: "Menerbitkan..." },
    commit: { en: "See the commit", id: "Lihat commit" },
    offline: { en: "No connection to GitHub.", id: "Tidak ada koneksi ke GitHub." },
    auth: { en: "GitHub refused the token. Check that it has Contents read and write for this repository.", id: "GitHub menolak token. Pastikan token punya akses Contents baca dan tulis untuk repositori ini." },
    live: { en: "Published. Live in about a minute.", id: "Terbit. Tayang sekitar satu menit lagi." },
    fail: { en: "Could not publish: ", id: "Gagal menerbitkan: " },
    changes: { en: "{n} change(s) waiting", id: "{n} perubahan menunggu" },
    none: { en: "This tab is not ready yet.", id: "Tab ini belum siap." },
    forgot: { en: "This device is forgotten.", id: "Perangkat ini sudah dilupakan." },
    preview: { en: "Preview", id: "Pratinjau" },
    previewStop: { en: "Stop preview", id: "Hentikan pratinjau" },
    ribbon: { en: "Preview, not published", id: "Pratinjau, belum diterbitkan" },
    back: { en: "Back to admin", id: "Kembali ke admin" },
    undo: { en: "Undo publish", id: "Batalkan terbitan" },
    help: { en: "Help", id: "Bantuan" },
    helpClose: { en: "Hide help", id: "Tutup bantuan" },
    looking: { en: "Looking for the last publish...", id: "Mencari terbitan terakhir..." },
    noAdmin: { en: "There is no admin publish to undo.", id: "Tidak ada terbitan admin untuk dibatalkan." },
    undoNeed: { en: "Publish or finish your waiting changes first.", id: "Terbitkan atau selesaikan dulu perubahan yang menunggu." },
    undoAsk: { en: "Undo this publish? The site goes back to how it was before it.", id: "Batalkan terbitan ini? Situs kembali seperti sebelum terbitan itu." },
    undoYes: { en: "Yes, undo it", id: "Ya, batalkan" },
    cancel: { en: "Cancel", id: "Batal" },
    undoing: { en: "Undoing...", id: "Membatalkan..." },
    undone: { en: "Undone. Live in about a minute.", id: "Dibatalkan. Tayang sekitar satu menit lagi." },
    undoFail: { en: "Could not undo: ", id: "Gagal membatalkan: " },
    moved: { en: "A file was changed after that publish, so undoing it could lose newer work. Nothing was changed.", id: "Ada berkas yang berubah setelah terbitan itu, jadi membatalkannya bisa menghilangkan pekerjaan yang lebih baru. Tidak ada yang diubah." },
    files: { en: "{n} file(s)", id: "{n} berkas" },
    language: { en: "ID", id: "EN" },
    languageAria: { en: "Switch to Bahasa Indonesia", id: "Switch to English" }
  };

  let root = null, active = TABS[0], data = null, base = "", staged = new Map(), busy = false, status = null;   // status: {kind: "busy"|"ok"|"err", text, sha?}
  const tabs = {}, listeners = new Set();
  const lang = () => (typeof LANG !== "undefined" && LANG === "id") ? "id" : "en";
  const pick = v => typeof v === "string" ? v : v ? (v[lang()] || v.en || "") : "";
  const s = k => pick(S[k]);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const blank = () => ({ version: 1, contact: { email: "", priceLine: { en: "", id: "" } },
    links: { instagram: "", behance: "", linkedin: "", website: "", tiktok: "", youtube: "", x: "" },
    features: {}, projects: [], hidden: [], order: [], copy: { en: {}, id: {} } });
  const clone = o => JSON.parse(JSON.stringify(o));
  const dirtyCount = () => (JSON.stringify(data) !== base ? 1 : 0) + staged.size;

  // ---- GitHub: one commit per Publish (git data API: blobs, tree, commit, ref) ----
  const b64 = str => { const bytes = new TextEncoder().encode(str); let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b)); return btoa(bin); };
  async function gh(path, opts = {}) {
    const r = await fetch(API + path, { ...opts, headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + store.get(TOKEN_KEY),
      "X-GitHub-Api-Version": "2022-11-28", ...(opts.body ? { "Content-Type": "application/json" } : {}) } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || ("HTTP " + r.status));
    return j;
  }
  const post = (path, body, method = "POST") => gh(path, { method, body: JSON.stringify(body) });

  // A short, plain reason for the owner (never the raw HTTP text).
  const friendly = e => {
    const m = String(e && e.message || e);
    if (e instanceof TypeError && /fetch|network|load failed/i.test(m)) return s("offline");
    if (/bad credentials|resource not accessible|not found|requires authentication|no write access|HTTP 40[134]/i.test(m)) return s("auth");
    return m;
  };
  async function checkToken() {
    const r = await gh("/repos/" + REPO);
    if (!r.permissions || !r.permissions.push) throw new Error("no write access");
    return r.default_branch;
  }

  async function publish(message) {
    if (!store.get(TOKEN_KEY)) throw new Error(s("readonly"));
    if (!dirtyCount()) throw new Error(s("nothing"));
    const branch = await checkToken();
    const ref = await gh(`/repos/${REPO}/git/ref/heads/${branch}`);
    const head = ref.object.sha;
    const commit = await gh(`/repos/${REPO}/git/commits/${head}`);
    const entries = [];
    const files = new Map(staged);
    if (JSON.stringify(data) !== base) files.set("data/site.json", b64(JSON.stringify(data, null, 2) + "\n"));
    // the history (js/admin-history.js): what changed, in words, in the same commit and in its message
    const H = typeof AdminHistory !== "undefined" ? AdminHistory : null;
    const sum = H ? H.summarize(JSON.parse(base), data, [...staged.keys()]) : { title: "", changes: [], files: [...staged.keys()] };
    const title = message || sum.title || "update site";
    const entry = { at: new Date().toISOString(), by: await who(), kind: "publish", title, titleId: message ? title : sum.titleId || title, changes: sum.changes, files: [...files.keys()].sort(),
      uploads: H && H.uploads ? await H.uploads(data, [...staged]) : [] };
    files.set("data/history.json", await historyFile(branch, entry));
    // Only these paths may be written: site.json, history.json, the two art folders and the icon folder (no "..", no other folder, no other type).
    for (const path of files.keys()) if (path !== "data/site.json" && path !== "data/history.json" && !/^assets\/work\/(?:thumb\/)?u\/[a-z0-9-]+\.jpg$/.test(path) && !/^assets\/ui\/u\/[a-z0-9-]+\.png$/.test(path)) throw new Error("bad path: " + path);
    for (const [path, content] of files) {
      if (content === null) { entries.push({ path, mode: "100644", type: "blob", sha: null }); continue; }
      const blob = await post(`/repos/${REPO}/git/blobs`, { content, encoding: "base64" });
      entries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const tree = await post(`/repos/${REPO}/git/trees`, { base_tree: commit.tree.sha, tree: entries });
    const made = await post(`/repos/${REPO}/git/commits`, { message: "Admin: " + (H ? H.message({ ...sum, title }) : title), tree: tree.sha, parents: [head] });
    await post(`/repos/${REPO}/git/refs/heads/${branch}`, { sha: made.sha }, "PATCH");
    base = JSON.stringify(data); staged.clear();
    dispatchEvent(new CustomEvent("admin:history", { detail: { ...entry, sha: made.sha } }));
    return made.sha;
  }
  // data/history.json with one more entry (the newest 300 are kept); the GitHub login of the token says who.
  async function who() { try { return (await gh("/user")).login || ""; } catch (e) { return ""; } }
  async function historyFile(branch, entry) {
    let entries = [];
    const cur = await blobAt("data/history.json", branch);
    if (cur && cur.content) try { const j = JSON.parse(dec(cur.content)); if (j && Array.isArray(j.entries)) entries = j.entries; } catch (e) {}
    entries.push(entry);
    return b64(JSON.stringify({ version: 1, entries: entries.slice(-300) }, null, 1) + "\n");
  }

  // ---- undo the last admin publish: one new commit that puts the files back ----
  const dec = b64s => new TextDecoder().decode(Uint8Array.from(atob(b64s.replace(/\s/g, "")), c => c.charCodeAt(0)));
  async function blobAt(path, ref) {
    try { return await gh(`/repos/${REPO}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${ref}`); }
    catch (e) { if (/not found|HTTP 404/i.test(e.message)) return null; throw e; }
  }
  async function lastAdmin() {
    const branch = await checkToken();
    const list = await gh(`/repos/${REPO}/commits?sha=${branch}&per_page=30`);
    const hit = list.find(c => /^Admin:/.test(c.commit.message));
    if (!hit) return null;
    const c = await gh(`/repos/${REPO}/commits/${hit.sha}`);
    return { branch, head: list[0].sha, sha: c.sha, parent: c.parents[0].sha, message: c.commit.message.split("\n")[0], date: c.commit.author.date, files: c.files || [] };
  }
  async function undoLast(info) {
    const entries = []; let siteJson = null;
    for (const f of info.files) {
      if (f.filename === "data/history.json") continue;   // the history is never undone: the undo is written into it
      if (f.status === "renamed") throw new Error("renamed file");
      const now = await blobAt(f.filename, info.branch);
      if (f.status === "added") {
        if (!now) continue;
        if (now.sha !== f.sha) throw new Error("MOVED");
        entries.push({ path: f.filename, mode: "100644", type: "blob", sha: null });
      } else {
        if (now && now.sha !== f.sha) throw new Error("MOVED");
        const before = await blobAt(f.filename, info.parent);
        if (!before) { if (now) entries.push({ path: f.filename, mode: "100644", type: "blob", sha: null }); continue; }
        entries.push({ path: f.filename, mode: "100644", type: "blob", sha: before.sha });
        if (f.filename === "data/site.json") siteJson = before.content;
      }
      if (f.status === "added" && f.filename === "data/site.json") siteJson = "";
    }
    if (!entries.length) throw new Error(s("noAdmin"));
    const entry = { at: new Date().toISOString(), by: await who(), kind: "undo", title: info.message.replace(/^Admin:\s*/, ""),
      changes: [{ area: "undo", en: "Put back as it was before " + info.sha.slice(0, 7), id: "Dikembalikan seperti sebelum " + info.sha.slice(0, 7) }], files: entries.map(e => e.path).sort(),
      uploads: entries.filter(e => !/^data\//.test(e.path)).map(e => ({ path: e.path, for: "Undo", removed: e.sha === null })) };
    const hist = await post(`/repos/${REPO}/git/blobs`, { content: await historyFile(info.branch, entry), encoding: "base64" });
    entries.push({ path: "data/history.json", mode: "100644", type: "blob", sha: hist.sha });
    const head = (await gh(`/repos/${REPO}/git/ref/heads/${info.branch}`)).object.sha;
    if (head !== info.head) throw new Error("MOVED");
    const headCommit = await gh(`/repos/${REPO}/git/commits/${head}`);
    const tree = await post(`/repos/${REPO}/git/trees`, { base_tree: headCommit.tree.sha, tree: entries });
    const made = await post(`/repos/${REPO}/git/commits`, { message: "Admin: undo " + info.message.replace(/^Admin:\s*/, ""), tree: tree.sha, parents: [head] });
    await post(`/repos/${REPO}/git/refs/heads/${info.branch}`, { sha: made.sha }, "PATCH");
    dispatchEvent(new CustomEvent("admin:history", { detail: { ...entry, sha: made.sha } }));
    if (siteJson !== null) { try { data = siteJson ? { ...blank(), ...JSON.parse(dec(siteJson)) } : blank(); } catch (e) { data = blank(); } base = JSON.stringify(data); }
    return made.sha;
  }

  // ---- preview: the unpublished changes shown on the live page, in memory only ----
  let previewOn = false, previewTimer = 0, ribbon = null, pop = null;
  const syncPreview = () => { if (previewOn && typeof SiteData !== "undefined") SiteData.preview(data); };
  function paintRibbon() {
    if (!ribbon) {
      ribbon = document.createElement("dialog"); ribbon.id = "adminRibbon";   // a dialog: game mode hides other children of body
      ribbon.addEventListener("click", e => { const b = e.target.closest("[data-rb]"); if (!b) return; if (b.dataset.rb === "back") show(); else { setPreview(false); show(); } });
      document.body.appendChild(ribbon);
    }
    ribbon.innerHTML = `<b role="status">${s("ribbon")}</b><button type="button" class="adm-btn" data-rb="back">${s("back")}</button><button type="button" class="adm-btn" data-rb="stop">${s("previewStop")}</button>`;
  }
  function setPreview(on) {
    previewOn = on;
    if (typeof SiteData !== "undefined") SiteData.preview(on ? data : null);
    if (on) { paintRibbon(); if (root && root.open) root.close(); ribbon.show(); }
    else if (ribbon) ribbon.close();
    paintTools();
  }

  // ---- the context the tabs get ----
  const ctx = {
    get data() { return data; },
    get lang() { return lang(); },
    getData: () => data,
    get published() { return JSON.parse(base || "{}"); },   // site.json as last loaded or published (History compares against it)
    // the built-in values before the site.json merge (a copy, safe to keep): {config, features, copy}
    get builtin() {
      const b = typeof SiteData !== "undefined" && SiteData.builtin;
      return JSON.parse(JSON.stringify(b || { config: CONFIG, features: FEATURES, copy: COPY }));
    },
    get canPublish() { return !!store.get(TOKEN_KEY); },
    t: pick,
    setData(x) {
      if (typeof x === "function") { const d = clone(data); const r = x(d); data = r && typeof r === "object" ? r : d; }
      else if (x && typeof x === "object") data = { ...data, ...clone(x) };
      changed();
    },
    addFile(path, content) { staged.set(path, content); changed(); },
    stage(path, content) { staged.set(path, content); changed(); },
    unstage(path) { staged.delete(path); changed(); },
    staged: () => [...staged.keys()],
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    publish: async message => {
      status = { kind: "busy", text: s("working") }; busy = true; paintBar();
      try { const sha = await publish(message); status = { kind: "ok", text: s("live"), sha }; }
      catch (e) { status = { kind: "err", text: s("fail") + friendly(e) }; throw e; }
      finally { busy = false; paintBar(); }
    }
  };
  const changed = () => { if (status && status.kind !== "busy") status = null; paintBar(); clearTimeout(previewTimer); previewTimer = setTimeout(syncPreview, 200); listeners.forEach(f => { try { f(); } catch (e) {} }); };

  // ---- the screen ----
  const CSS = `
#adminRoot{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:99999;display:none;border-radius:0;box-shadow:none;animation:none;overflow:hidden;flex-direction:column;background:var(--paper);color:var(--ink);font-family:Fredoka,Poppins,sans-serif;--ink:#2B1342;--paper:#FFF8EC;--line:#e5d8bd;--accent:#FFB400;--card:#fff;--mute:#6b5a80;--text:#4b4655;--muted:#645F70;--bg:#FFF8EC;--side:#F4F4F4;--ink-soft:#4a2f66;--paper-line:#e5d8bd;color-scheme:light}
#adminRoot *{box-sizing:border-box}
#adminRoot[open]{display:flex;animation:none}#adminRoot::backdrop{background:transparent}
#adminRoot button{font-family:inherit;cursor:pointer}
.adm-top{display:flex;align-items:center;gap:6px;padding:max(8px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) 8px max(12px,env(safe-area-inset-left));border-bottom:2px solid var(--line);flex-wrap:nowrap}
.adm-top .adm-btn{padding:8px 12px;flex:none}
.adm-top h1{margin:0;font-size:1.2rem;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
.adm-btn{min-height:44px;padding:8px 16px;border-radius:14px;border:2px solid var(--line);background:var(--card);color:var(--ink);font-weight:600;font-size:.95rem}
.adm-btn.pri{background:var(--accent);border-color:#b77e00;box-shadow:0 3px 0 #b77e00}
.adm-btn:disabled{opacity:.5;cursor:default}
.adm-tabs{display:flex;flex-wrap:wrap;gap:4px;padding:8px 12px;border-bottom:2px solid var(--line)}
.adm-tabs button{min-height:44px;min-width:44px;flex:1 1 auto;padding:6px 6px;font-size:.78rem;white-space:nowrap;border-radius:14px;border:2px solid var(--line);background:var(--card);color:var(--ink);font-weight:600}
.adm-tabs button[aria-selected=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.adm-tools{display:flex;gap:6px;padding:8px 12px;flex-wrap:nowrap;border-bottom:2px solid var(--line)}
.adm-tools .adm-btn{padding:8px 10px;font-size:.9rem;white-space:nowrap;min-width:0}
.adm-btn[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.adm-pop{max-height:55vh;overflow:auto;margin:8px 16px;padding:12px 14px;border-radius:14px;border:2px solid var(--line);background:var(--card);font-size:.95rem;line-height:1.45}
.adm-pop[hidden]{display:none}.adm-pop ol{margin:6px 0;padding-left:20px}.adm-pop h2{margin:0 0 6px;font-size:1.05rem}.adm-pop .adm-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
#adminRibbon{position:fixed;inset:max(8px,env(safe-area-inset-top)) 8px auto 8px;width:auto;max-width:none;margin:0;padding:6px 10px;border:2px solid #b77e00;border-radius:16px;background:#FFB400;color:#2B1342;display:none;align-items:center;gap:8px;flex-wrap:wrap;z-index:100001;font-family:Fredoka,Poppins,sans-serif;box-shadow:0 4px 0 #b77e00;animation:none;overflow:visible}
#adminRibbon[open]{display:flex;animation:none}#adminRibbon::backdrop{display:none}#adminRibbon b{flex:1;min-width:140px}
#adminRibbon .adm-btn{background:#fff;color:#2B1342;border-color:#b77e00;min-height:44px}
.adm-bar{padding:8px 16px;font-size:.9rem;color:var(--mute);display:flex;gap:10px;align-items:center;flex-wrap:wrap;border-bottom:2px solid var(--line)}
.adm-bar input{flex:1;min-width:180px;min-height:44px;padding:8px 12px;border-radius:12px;border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit}
.adm-bar .adm-status{flex-basis:100%;font-weight:600}
.adm-status[data-kind=ok]{color:#1f7a3d}.adm-status[data-kind=err]{color:#b3261e}.adm-status a{color:inherit;text-decoration:underline;display:inline-block;padding:12px 0}
.adm-main{flex:1;overflow:auto;padding:16px max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));-webkit-overflow-scrolling:touch}   /* clear of the notch, the island and the home bar (iPhone, Android app) */
.adm-main .adm-note{color:var(--mute)}
/* The admin screen stays light paper in dark mode too, like the game and the PIN pad (the tab scripts draw on light cards). */
`;
  function build() {
    if (!document.getElementById("admShellCss")) { const st = document.createElement("style"); st.id = "admShellCss"; st.textContent = CSS; document.head.appendChild(st); }
    root = document.createElement("dialog"); root.id = "adminRoot";   // a dialog: game mode hides every other child of body
    root.innerHTML = `<div class="adm-top"><h1 data-adm="title"></h1><button type="button" class="adm-btn" data-adm="lang"></button>
      <button type="button" class="adm-btn pri" data-adm="publish"></button><button type="button" class="adm-btn" data-adm="close"></button></div>
      <div class="adm-tools"></div><div class="adm-pop" hidden role="region"></div><div class="adm-tabs" role="tablist"></div><div class="adm-bar"></div><div class="adm-main" role="tabpanel"></div>`;
    document.body.appendChild(root);
    root.addEventListener("click", e => {
      const b = e.target.closest("[data-adm],[data-tab]"); if (!b) return;
      if (b.dataset.tab) return show(b.dataset.tab);
      ({ close, lang: switchLang, publish: () => ctx.publish().catch(() => {}),
        save: saveToken, forget: forgetDevice, preview: () => setPreview(!previewOn), help: () => togglePop("help"), undo: startUndo, undoYes: confirmUndo, popClose: () => togglePop(null) })[b.dataset.adm]?.();
    });
    root.addEventListener("cancel", e => { e.preventDefault(); close(); });
    addEventListener("ekky:lang", () => { if (root.dataset.lang === lang()) return; if (root.open) paintAll(); else if (ribbon && ribbon.open) paintRibbon(); });   // new words in a preview fire it too: repaint only for a new language
    paintAll();
  }

  function paintBar() {
    if (!root) return;
    const n = dirtyCount(), can = ctx.canPublish;
    root.querySelector("[data-adm=publish]").disabled = busy || !can || !n;
    const bar = root.querySelector(".adm-bar");
    const st = status || { kind: "", text: !can ? s("readonly") : n ? s("changes").replace("{n}", n) : "" };
    const esc = x => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    if (!bar.dataset.built || bar.dataset.can !== String(can) || bar.dataset.lang !== lang()) {
      bar.dataset.built = "1"; bar.dataset.can = String(can); bar.dataset.lang = lang();
      bar.innerHTML = can
        ? `<span class="adm-status" role="status"></span><button type="button" class="adm-btn" data-adm="forget">${esc(s("forget"))}</button>`
        : `<input type="password" autocomplete="off" aria-label="${esc(s("tokenLabel"))}" placeholder="${esc(s("tokenLabel"))}"><button type="button" class="adm-btn" data-adm="save">${esc(s("save"))}</button><span class="adm-status" role="status"></span>`;
    }
    const el = bar.querySelector(".adm-status");
    el.textContent = st.text; el.dataset.kind = st.kind; el.setAttribute("role", st.kind === "err" ? "alert" : "status");
    if (st.sha) { const a = document.createElement("a"); a.href = `https://github.com/${REPO}/commit/${st.sha}`; a.target = "_blank"; a.rel = "noopener"; a.textContent = " " + s("commit"); el.appendChild(a); }
    root.querySelector("[data-adm=publish]").textContent = busy ? s("working") : s("publish");
  }

  function paintTabs() {
    const bar = root.querySelector(".adm-tabs");
    bar.innerHTML = TABS.map(id => `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === active}">${pick(TAB_TITLE[id])}</button>`).join("");
  }

  function paintPanel() {
    const el = root.querySelector(".adm-main");
    el.id = "admTab-" + active; el.textContent = "";
    const t = tabs[active];
    if (!t) { const p = document.createElement("p"); p.className = "adm-note"; p.textContent = s("none"); el.appendChild(p); return; }
    try { t.render(el, ctx); } catch (e) { const p = document.createElement("p"); p.className = "adm-note"; p.textContent = String(e && e.message || e); el.appendChild(p); }
  }

  function paintTools() {
    if (!root) return;
    const t = root.querySelector(".adm-tools");
    t.innerHTML = `<button type="button" class="adm-btn" data-adm="preview" aria-pressed="${previewOn}">${s("preview")}</button>
      <button type="button" class="adm-btn" data-adm="undo"${ctx.canPublish ? "" : " disabled"}>${s("undo")}</button>
      <button type="button" class="adm-btn" data-adm="help" aria-pressed="${!!(pop && pop.kind === "help")}">${s("help")}</button>`;
  }

  const HELP = {
    en: `<h2>Help</h2><p><b>PIN and token.</b> The PIN only opens this screen. To publish you also need a GitHub token.</p>
      <ol><li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com: new fine-grained token</a> (or Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token).</li>
      <li>Repository access: only <b>rfim/ekkyarya.com</b>.</li><li>Permissions: <b>Contents</b>, Read and write. Nothing else.</li>
      <li>Pick an expiry date, generate it, copy it and paste it in the box below, then Save token.</li></ol>
      <p><b>Where it is kept.</b> Only in this browser, on this device. It is sent to api.github.com and nowhere else. Press <b>Forget this device</b> to remove it.</p>
      <p>Publish makes one change on the site, live in about a minute. Preview shows your waiting changes on the site without publishing.</p>`,
    id: `<h2>Bantuan</h2><p><b>PIN dan token.</b> PIN hanya membuka layar ini. Untuk menerbitkan kamu juga perlu token GitHub.</p>
      <ol><li>Buka <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com: token fine-grained baru</a> (atau Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token).</li>
      <li>Repository access: hanya <b>rfim/ekkyarya.com</b>.</li><li>Permissions: <b>Contents</b>, Read and write. Tidak ada yang lain.</li>
      <li>Pilih tanggal kedaluwarsa, buat tokennya, salin, tempel di kotak di bawah, lalu Simpan token.</li></ol>
      <p><b>Disimpan di mana.</b> Hanya di browser ini, di perangkat ini. Token hanya dikirim ke api.github.com. Tekan <b>Lupakan perangkat ini</b> untuk menghapusnya.</p>
      <p>Terbitkan membuat satu perubahan di situs, tayang sekitar satu menit. Pratinjau menampilkan perubahan yang menunggu di situs tanpa menerbitkan.</p>`
  };
  function togglePop(kind) { pop = pop && pop.kind === kind ? null : kind ? { kind } : null; paintPop(); paintTools(); const b = root.querySelector(`[data-adm=${kind || "help"}]`); if (b) b.focus(); }
  function paintPop() {
    if (!root) return;
    const el = root.querySelector(".adm-pop");
    el.hidden = !pop;
    if (!pop) return;
    const esc = x => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    if (pop.kind === "help") el.innerHTML = HELP[lang()] + `<div class="adm-row"><button type="button" class="adm-btn" data-adm="popClose">${s("helpClose")}</button></div>`;
    else if (pop.kind === "undo") {
      const i = pop.info;
      el.innerHTML = `<h2>${esc(s("undo"))}</h2><p>${esc(s("undoAsk"))}</p><p><b>${esc(i.message)}</b><br>${esc(new Date(i.date).toLocaleString(lang() === "id" ? "id-ID" : "en-GB"))}, ${esc(s("files").replace("{n}", i.files.length))}</p>
        <div class="adm-row"><button type="button" class="adm-btn pri" data-adm="undoYes"${busy ? " disabled" : ""}>${esc(s("undoYes"))}</button><button type="button" class="adm-btn" data-adm="popClose">${esc(s("cancel"))}</button></div>`;
    }
  }
  async function startUndo() {
    if (!ctx.canPublish) return;
    if (dirtyCount()) { status = { kind: "err", text: s("undoNeed") }; paintBar(); return; }
    status = { kind: "busy", text: s("looking") }; paintBar();
    try {
      const info = await lastAdmin();
      if (!info) { status = { kind: "err", text: s("noAdmin") }; paintBar(); return; }
      status = null; pop = { kind: "undo", info }; paintPop(); paintTools(); paintBar();
    } catch (e) { status = { kind: "err", text: s("undoFail") + friendly(e) }; paintBar(); }
  }
  async function confirmUndo() {
    const info = pop && pop.info; if (!info || busy) return;
    busy = true; status = { kind: "busy", text: s("undoing") }; paintBar(); paintPop();
    try { const sha = await undoLast(info); status = { kind: "ok", text: s("undone"), sha }; syncPreview(); }
    catch (e) { status = { kind: "err", text: e && e.message === "MOVED" ? s("moved") : s("undoFail") + friendly(e) }; }
    busy = false; pop = null; paintPop(); paintTools(); paintBar(); paintPanel();
  }

  function paintAll() {
    root.dataset.lang = lang();
    root.querySelector("[data-adm=title]").textContent = s("title");
    root.querySelector("[data-adm=close]").textContent = s("close");
    const lb = root.querySelector("[data-adm=lang]"); lb.textContent = s("language"); lb.setAttribute("aria-label", s("languageAria"));
    paintTools(); paintPop(); paintTabs(); paintBar(); paintPanel();
    if (ribbon && ribbon.open) paintRibbon();
  }

  function switchLang() { if (typeof setLang === "function") setLang(lang() === "id" ? "en" : "id"); paintAll(); }

  async function saveToken() {
    const input = root.querySelector(".adm-bar input"), tok = input && input.value.trim();
    if (!tok) return;
    store.set(TOKEN_KEY, tok);
    try { await checkToken(); status = { kind: "ok", text: s("saved") }; }
    catch (e) { store.del(TOKEN_KEY); status = { kind: "err", text: s("bad") }; }
    root.querySelector(".adm-bar").dataset.built = ""; paintBar(); paintTools();
  }

  function forgetDevice() {
    store.del(TOKEN_KEY); status = { kind: "ok", text: s("forgot") };
    ["admLock", "admTries"].forEach(store.del);
    root.querySelector(".adm-bar").dataset.built = ""; paintBar(); paintTools();
  }

  function close() {
    if (!root) return;
    root.close();
    if (previewOn) { paintRibbon(); ribbon.show(); }
    if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {}
  }

  let prevFocus = null;
  async function load() {
    try {
      const r = await fetch("data/site.json", { cache: "no-cache" });
      const d = r.ok ? await r.json() : null;
      data = d && d.version === 1 ? { ...blank(), ...d } : blank();
    } catch (e) { data = blank(); }
    base = JSON.stringify(data);
  }

  async function show(tab) {
    if (!root) build();
    if (!data) await load();
    if (typeof tab === "string" && TABS.includes(tab)) active = tab;
    else { prevFocus = document.activeElement; }
    if (ribbon && ribbon.open) ribbon.close();
    if (!root.open) root.showModal(); paintAll();
    const first = root.querySelector(".adm-tabs [aria-selected=true]"); if (first && typeof tab !== "string") first.focus();
  }

  // Tabs that registered before the shell existed wait in window.AdminTabs ([id, def] pairs or {id, ...def}).
  A.registerTab = (id, def) => { if (!TABS.includes(id)) return; tabs[id] = def; if (root && root.open) { paintTabs(); if (id === active) paintPanel(); } };
  A.ctx = ctx;
  (window.AdminTabs || []).forEach(q => Array.isArray(q) ? A.registerTab(q[0], q[1]) : q && q.id && A.registerTab(q.id, q));
  window.AdminTabs = { push: q => Array.isArray(q) ? A.registerTab(q[0], q[1]) : q && q.id && A.registerTab(q.id, q) };
  A.shell = { show };

  // The tab scripts register themselves; a missing one only leaves its tab saying "not ready yet".
  ["js/admin-art.js", "js/admin-icons.js", "js/admin-settings.js", "js/admin-copy.js", "js/admin-history.js"].forEach(src => {
    const el = document.createElement("script"); el.src = src + "?v=" + Date.now(); el.onerror = () => el.remove(); document.head.appendChild(el);
  });
})();
