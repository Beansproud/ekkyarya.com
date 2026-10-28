// Admin door, step 2: the PIN pad. Loaded by js/site-data.js only when a door opens (normal visitors never fetch it).
// The PIN is never in the code: only sha256("ekkyarya-admin:" + pin) is compared. Once it matches, the shell
// (js/admin-shell.js) is loaded; nothing of the admin screen is downloaded before that.
window.Admin = (() => {
  const HASH = "7c804fa1e00adf130631ae11cf0d38b9d97ff9117663687fb625c850eaf332e2";
  const SALT = "ekkyarya-admin:", LEN = 6, MAX_TRIES = 5, PAUSE_MS = 30000;
  const TXT = {
    en: { title: "Admin", hint: "Enter your PIN", wrong: "Wrong PIN", wait: "Too many tries. Wait {n} s.", del: "Delete", close: "Close", err: "This browser cannot check the PIN here (it needs https).", digits: "PIN digits" },
    id: { title: "Admin", hint: "Masukkan PIN", wrong: "PIN salah", wait: "Terlalu banyak percobaan. Tunggu {n} dtk.", del: "Hapus", close: "Tutup", err: "Browser ini tidak bisa memeriksa PIN di sini (perlu https).", digits: "Digit PIN" }
  };
  const lang = () => (typeof LANG !== "undefined" && LANG === "id") ? "id" : "en";
  const tx = k => TXT[lang()][k];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  async function hashOf(pin) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(SALT + pin));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  const CSS = `
dialog.adm-pad{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:100000;display:none;border-radius:0;box-shadow:none;animation:none;overflow:hidden;align-items:center;justify-content:center;background:rgba(43,19,66,.55);font-family:Fredoka,Poppins,sans-serif;--ink:#2B1342;--paper:#FFF8EC;--line:#e5d8bd;--accent:#FFB400;--text:#4b4655;--muted:#645F70;color-scheme:light}
dialog.adm-pad[open]{display:flex;animation:none}.adm-pad::backdrop{background:transparent}
.adm-pad *{box-sizing:border-box}
.adm-card:focus{outline:none}
.adm-card{width:min(320px,calc(100vw - 32px));background:var(--paper);color:var(--ink);border-radius:22px;padding:22px 20px 18px;box-shadow:0 12px 40px rgba(0,0,0,.35);text-align:center}
.adm-card h2{margin:0 0 4px;font-size:1.4rem}
.adm-card p{margin:0 0 14px;min-height:1.3em;font-size:.95rem}
.adm-dots{display:flex;justify-content:center;gap:12px;margin:0 0 16px}
.adm-dots i{width:14px;height:14px;border-radius:50%;border:2px solid var(--ink)}
.adm-dots i.on{background:var(--ink)}
.adm-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.adm-keys button,.adm-x{min-height:52px;border-radius:16px;border:2px solid var(--line);background:#fff;color:var(--ink);font:600 1.3rem Fredoka,Poppins,sans-serif;cursor:pointer}
.adm-keys button:active{background:var(--accent)}
.adm-keys button:disabled{opacity:.45}
.adm-keys .adm-sm{font-size:.95rem}
.adm-x{margin-top:12px;width:100%;min-height:44px;font-size:.95rem;background:none}
.adm-shake{animation:adm-shake .32s ease-out 1}
@keyframes adm-in{from{opacity:0;transform:translateY(10px)}}
.adm-pad[open] .adm-card{animation:adm-in .18s ease-out}
@keyframes adm-shake{25%{transform:translateX(-8px)}60%{transform:translateX(7px)}100%{transform:none}}
@media (prefers-reduced-motion:reduce){.adm-shake,.adm-pad[open] .adm-card{animation:none}}
`;
  function addCss() {
    if (document.getElementById("admCss")) return;
    const s = document.createElement("style"); s.id = "admCss"; s.textContent = CSS; document.head.appendChild(s);
  }

  let pad = null;
  function open() {
    if (pad) return;
    if (api.unlocked) return api.showShell();     // already unlocked in this visit
    addCss();
    const prevFocus = document.activeElement;
    let pin = "";
    const el = document.createElement("dialog");   // a dialog: game mode hides every other child of body (css/game.css)
    el.className = "adm-pad";
    el.innerHTML = `<div class="adm-card"><h2></h2><p aria-live="polite"></p><div class="adm-dots" role="img">${"<i></i>".repeat(LEN)}</div>
      <div class="adm-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-k="${n}">${n}</button>`).join("")}
      <button type="button" class="adm-sm" data-k="del"></button><button type="button" data-k="0">0</button><span></span></div>
      <button type="button" class="adm-x"></button></div>`;
    const card = el.firstChild, msg = card.querySelector("p"), dots = [...card.querySelectorAll(".adm-dots i")];
    const keys = [...card.querySelectorAll(".adm-keys button")];
    const label = () => {
      card.querySelector("h2").textContent = tx("title");
      card.querySelector(".adm-dots").setAttribute("aria-label", tx("digits"));
      card.querySelector("[data-k=del]").textContent = tx("del");
      card.querySelector(".adm-x").textContent = tx("close");
      if (!locked()) msg.textContent = tx("hint");
    };
    const draw = () => dots.forEach((d, i) => d.classList.toggle("on", i < pin.length));
    const locked = () => Math.max(0, Number(store.get("admLock") || 0) - Date.now());
    let tick = 0;
    const lockUi = () => {
      clearInterval(tick);
      const run = () => {
        const left = locked();
        keys.forEach(b => b.disabled = left > 0);
        if (left > 0) msg.textContent = tx("wait").replace("{n}", Math.ceil(left / 1000));
        else { clearInterval(tick); msg.textContent = tx("hint"); }
      };
      if (locked() > 0) { run(); tick = setInterval(run, 500); }
    };
    const close = () => {
      clearInterval(tick); removeEventListener("keydown", onKey, true); el.remove(); pad = null;
      if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {}
    };
    async function submit() {
      if (locked() > 0) return;
      let ok = false;
      try {
        if (!(window.crypto && crypto.subtle)) { msg.textContent = tx("err"); pin = ""; draw(); return; }
        ok = (await hashOf(pin)) === HASH;
      } catch (e) { msg.textContent = tx("err"); pin = ""; draw(); return; }
      if (ok) { store.set("admTries", "0"); api.unlocked = true; close(); loadShell(); return; }
      const tries = Number(store.get("admTries") || 0) + 1;
      pin = ""; draw();
      card.classList.remove("adm-shake"); void card.offsetWidth; card.classList.add("adm-shake");
      if (tries >= MAX_TRIES) { store.set("admTries", "0"); store.set("admLock", String(Date.now() + PAUSE_MS)); lockUi(); }
      else { store.set("admTries", String(tries)); msg.textContent = tx("wrong"); }
    }
    function press(k) {
      if (locked() > 0) return;
      if (k === "del") pin = pin.slice(0, -1);
      else if (pin.length < LEN) pin += k;
      draw();
      if (pin.length === LEN) submit();
    }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (/^[0-9]$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); press(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); press("del"); }
    }
    card.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) press(b.dataset.k); });
    card.querySelector(".adm-x").onclick = close;
    el.addEventListener("click", e => { if (e.target === el) close(); });
    addEventListener("keydown", onKey, true);
    document.body.appendChild(el); pad = el; el.showModal();
    el.addEventListener("cancel", e => { e.preventDefault(); close(); });
    label(); draw(); lockUi();
    card.tabIndex = -1; card.focus();
  }

  // After the PIN: fetch the shell, which also loads the tab scripts.
  function loadShell() {
    if (api.shell) return api.shell.show();
    const s = document.createElement("script");
    s.src = "js/admin-shell.js";
    s.onload = () => api.shell && api.shell.show();
    document.head.appendChild(s);
  }

  const api = { open, shell: null, unlocked: false, showShell: () => api.shell && api.shell.show() };
  return api;
})();
