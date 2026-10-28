// Admin shell: the screen behind the PIN. Tabs Art, Links, Settings, Text, Messages; each tab is a mount point that
// other scripts fill with Admin.registerTab(id, {title:{en,id}|string, render(el, ctx)}). Also the GitHub token and Publish.
//
// ctx given to render(el, ctx):
//   ctx.data           the working copy of data/site.json (live: always the latest object)
//   ctx.setData(x)     x is a function(draft) that edits the draft (or returns a new object), or an object merged over the top level
//   ctx.stage(path, base64OrNull)  queue a file for the next Publish (null deletes it); ctx.staged() lists the paths
//   ctx.publish(msg?)  one commit with data/site.json plus every staged file; returns a promise
//   ctx.canPublish()   true when a GitHub token is saved (without one, admin is read-only)
//   ctx.lang           "en" or "id" (current); ctx.t({en,id}) picks the text; ctx.onChange(fn) runs after setData / language switch
(() => {
  const A = window.Admin;
  const REPO = "rfim/ekkyarya.com", API = "https://api.github.com", TOKEN_KEY = "admGhToken";
  const TABS = ["art", "links", "settings", "text", "messages"];
  const TAB_TITLE = { art: { en: "Art", id: "Karya" }, links: { en: "Links", id: "Tautan" }, settings: { en: "Settings", id: "Pengaturan" },
    text: { en: "Text", id: "Teks" }, messages: { en: "Messages", id: "Pesan" } };
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
    live: { en: "Published. Live in about a minute.", id: "Terbit. Tayang sekitar satu menit lagi." },
    fail: { en: "Could not publish: ", id: "Gagal menerbitkan: " },
    changes: { en: "{n} change(s) waiting", id: "{n} perubahan menunggu" },
    none: { en: "This tab is not ready yet.", id: "Tab ini belum siap." },
    forgot: { en: "This device is forgotten.", id: "Perangkat ini sudah dilupakan." },
    language: { en: "Bahasa Indonesia", id: "English" }
  };

  let root = null, active = TABS[0], data = null, base = "", staged = new Map(), busy = false, status = "";
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
    for (const [path, content] of files) {
      if (content === null) { entries.push({ path, mode: "100644", type: "blob", sha: null }); continue; }
      const blob = await post(`/repos/${REPO}/git/blobs`, { content, encoding: "base64" });
      entries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const tree = await post(`/repos/${REPO}/git/trees`, { base_tree: commit.tree.sha, tree: entries });
    const made = await post(`/repos/${REPO}/git/commits`, { message: "Admin: " + (message || "update site"), tree: tree.sha, parents: [head] });
    await post(`/repos/${REPO}/git/refs/heads/${branch}`, { sha: made.sha }, "PATCH");
    base = JSON.stringify(data); staged.clear();
    return made.sha;
  }

  // ---- the context the tabs get ----
  const ctx = {
    get data() { return data; },
    get lang() { return lang(); },
    t: pick,
    setData(x) {
      if (typeof x === "function") { const d = clone(data); const r = x(d); data = r && typeof r === "object" ? r : d; }
      else if (x && typeof x === "object") data = { ...data, ...clone(x) };
      changed();
    },
    stage(path, content) { staged.set(path, content); changed(); },
    unstage(path) { staged.delete(path); changed(); },
    staged: () => [...staged.keys()],
    canPublish: () => !!store.get(TOKEN_KEY),
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    publish: async message => {
      status = s("working"); busy = true; paintBar();
      try { await publish(message); status = s("live"); }
      catch (e) { status = s("fail") + (e && e.message || e); throw e; }
      finally { busy = false; paintBar(); }
    }
  };
  const changed = () => { paintBar(); listeners.forEach(f => { try { f(); } catch (e) {} }); };

  // ---- the screen ----
  const CSS = `
#adminRoot{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:99999;display:none;flex-direction:column;background:var(--paper);color:var(--ink);font-family:Fredoka,Poppins,sans-serif;--ink:#2B1342;--paper:#FFF8EC;--line:#e5d8bd;--accent:#FFB400;--card:#fff;--mute:#6b5a80}
#adminRoot *{box-sizing:border-box}
#adminRoot[open]{display:flex}#adminRoot::backdrop{background:transparent}
#adminRoot button{font-family:inherit;cursor:pointer}
.adm-top{display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:2px solid var(--line);flex-wrap:wrap}
.adm-top h1{margin:0;font-size:1.3rem;flex:1;min-width:80px}
.adm-btn{min-height:44px;padding:8px 16px;border-radius:14px;border:2px solid var(--line);background:var(--card);color:var(--ink);font-weight:600;font-size:.95rem}
.adm-btn.pri{background:var(--accent);border-color:#b77e00;box-shadow:0 3px 0 #b77e00}
.adm-btn:disabled{opacity:.5;cursor:default}
.adm-tabs{display:flex;gap:6px;padding:8px 16px;overflow-x:auto;border-bottom:2px solid var(--line)}
.adm-tabs button{flex:none;min-height:44px;padding:8px 16px;border-radius:14px;border:2px solid var(--line);background:var(--card);color:var(--ink);font-weight:600}
.adm-tabs button[aria-selected=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.adm-bar{padding:8px 16px;font-size:.9rem;color:var(--mute);display:flex;gap:10px;align-items:center;flex-wrap:wrap;border-bottom:2px solid var(--line)}
.adm-bar input{flex:1;min-width:180px;min-height:44px;padding:8px 12px;border-radius:12px;border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit}
.adm-bar .adm-status{flex-basis:100%}
.adm-main{flex:1;overflow:auto;padding:16px;-webkit-overflow-scrolling:touch}
.adm-main .adm-note{color:var(--mute)}
@media (prefers-color-scheme:dark){#adminRoot{--ink:#f3ecff;--paper:#1b1028;--line:#3e2a5c;--card:#2f1f47;--mute:#b9a9d4}.adm-btn.pri{color:#2B1342}}
`;
  function build() {
    if (!document.getElementById("admShellCss")) { const st = document.createElement("style"); st.id = "admShellCss"; st.textContent = CSS; document.head.appendChild(st); }
    root = document.createElement("dialog"); root.id = "adminRoot";   // a dialog: game mode hides every other child of body
    root.innerHTML = `<div class="adm-top"><h1 data-adm="title"></h1><button type="button" class="adm-btn" data-adm="lang"></button>
      <button type="button" class="adm-btn pri" data-adm="publish"></button><button type="button" class="adm-btn" data-adm="close"></button></div>
      <div class="adm-tabs" role="tablist"></div><div class="adm-bar"></div><div class="adm-main" role="tabpanel"></div>`;
    document.body.appendChild(root);
    root.addEventListener("click", e => {
      const b = e.target.closest("[data-adm],[data-tab]"); if (!b) return;
      if (b.dataset.tab) return show(b.dataset.tab);
      ({ close, lang: switchLang, publish: () => ctx.publish().catch(() => {}),
        save: saveToken, forget: forgetDevice })[b.dataset.adm]?.();
    });
    root.addEventListener("cancel", e => { e.preventDefault(); close(); });
    addEventListener("ekky:lang", () => { if (root.open) paintAll(); });
    paintAll();
  }

  function paintBar() {
    if (!root) return;
    const n = dirtyCount(), can = ctx.canPublish();
    root.querySelector("[data-adm=publish]").textContent = s("publish");
    root.querySelector("[data-adm=publish]").disabled = busy || !can || !n;
    const bar = root.querySelector(".adm-bar");
    const msg = status || (!can ? s("readonly") : n ? s("changes").replace("{n}", n) : "");
    const esc = x => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    if (!bar.dataset.built || bar.dataset.can !== String(can) || bar.dataset.lang !== lang()) {
      bar.dataset.built = "1"; bar.dataset.can = String(can); bar.dataset.lang = lang();
      bar.innerHTML = can
        ? `<span class="adm-status" role="status"></span><button type="button" class="adm-btn" data-adm="forget">${esc(s("forget"))}</button>`
        : `<input type="password" autocomplete="off" aria-label="${esc(s("tokenLabel"))}" placeholder="${esc(s("tokenLabel"))}"><button type="button" class="adm-btn" data-adm="save">${esc(s("save"))}</button><span class="adm-status" role="status"></span>`;
    }
    bar.querySelector(".adm-status").textContent = msg;
  }

  function paintTabs() {
    const bar = root.querySelector(".adm-tabs");
    bar.innerHTML = TABS.map(id => `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === active}">${pick((tabs[id] && tabs[id].title) || TAB_TITLE[id])}</button>`).join("");
  }

  function paintPanel() {
    const el = root.querySelector(".adm-main");
    el.id = "admTab-" + active; el.textContent = "";
    const t = tabs[active];
    if (!t) { const p = document.createElement("p"); p.className = "adm-note"; p.textContent = s("none"); el.appendChild(p); return; }
    try { t.render(el, ctx); } catch (e) { const p = document.createElement("p"); p.className = "adm-note"; p.textContent = String(e && e.message || e); el.appendChild(p); }
  }

  function paintAll() {
    root.querySelector("[data-adm=title]").textContent = s("title");
    root.querySelector("[data-adm=close]").textContent = s("close");
    root.querySelector("[data-adm=lang]").textContent = s("language");
    paintTabs(); paintBar(); paintPanel();
  }

  function switchLang() { if (typeof setLang === "function") setLang(lang() === "id" ? "en" : "id"); paintAll(); }

  async function saveToken() {
    const input = root.querySelector(".adm-bar input"), tok = input && input.value.trim();
    if (!tok) return;
    store.set(TOKEN_KEY, tok);
    try { await checkToken(); status = s("saved"); }
    catch (e) { store.del(TOKEN_KEY); status = s("bad"); }
    root.querySelector(".adm-bar").dataset.built = ""; paintBar();
  }

  function forgetDevice() {
    store.del(TOKEN_KEY); status = s("forgot");
    ["admLock", "admTries"].forEach(store.del);
    root.querySelector(".adm-bar").dataset.built = ""; paintBar();
  }

  function close() {
    if (!root) return;
    root.close();
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
    if (!root.open) root.showModal(); paintAll();
    const first = root.querySelector(".adm-tabs [aria-selected=true]"); if (first && typeof tab !== "string") first.focus();
  }

  A.registerTab = (id, def) => { if (!TABS.includes(id)) return; tabs[id] = def; if (root && root.open) { paintTabs(); if (id === active) paintPanel(); } };
  A.ctx = ctx;
  A.shell = { show };

  // The tab scripts register themselves; a missing one only leaves its tab saying "not ready yet".
  ["js/admin-art.js", "js/admin-settings.js"].forEach(src => {
    const el = document.createElement("script"); el.src = src; el.onerror = () => el.remove(); document.head.appendChild(el);
  });
})();
