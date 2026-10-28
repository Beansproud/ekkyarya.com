// data/site.json loader and merge (docs/admin.md), plus the two admin doors. Loaded after js/features.js, before js/site.js.
// The merge changes CONFIG, FEATURES, PROJECTS and COPY in place. A missing, empty or broken file changes nothing.
// The admin screen itself (js/admin.js) is fetched only when a door opens; normal visitors never download it.
const SiteData = (() => {
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  const str = v => typeof v === "string" ? v.trim() : "";
  const GLYPH = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/u;
  const clean = v => { const s = str(v); return s && !GLYPH.test(s) ? s : ""; };   // owner rule: no emoji
  const SAFE_PATH = /^assets\/work\/(?:thumb\/)?u\/[a-z0-9-]+\.jpe?g$/;
  const KINDS = ["original", "client", "fan"], CATS = ["illustration", "web", "branding", "social"];
  const ROLES = ["portfolio", "card", "featured", "share", "coloring", "sticker", "sprite", "level", "scene", "avatar", "game", "village"];
  const key = p => [p.title, p.uid, p.slug];
  const matches = (p, ids) => ids.some(i => key(p).includes(i));

  // Same derived fields as the PROJECTS loop in js/data.js.
  function derive(g, p) {
    p.slug = p.full.split("/").pop().replace(/\.\w+$/, "");
    p.own = !!g.CONFIG.reuse[p.kind] && !g.CONFIG.reuseBlock.includes(p.slug);
    if (!p.own) p.roles = p.roles.filter(r => r === "portfolio" || r === "card");
    if (p.kind !== "original") p.roles = p.roles.filter(r => r !== "game");
    p.rar = Math.min(3, p.roles.filter(r => !["portfolio", "card", "featured", "share", "game", "village"].includes(r)).length);
  }

  // One added piece, or null if it breaks a rule. A string id is the identifier (uid); an object id is the Indonesian text.
  function piece(g, raw) {
    if (!isObj(raw)) return null;
    const title = clean(raw.title), img = str(raw.img), full = str(raw.full);
    if (!title || !SAFE_PATH.test(img) || !SAFE_PATH.test(full)) return null;
    const kind = KINDS.includes(raw.kind) ? raw.kind : "original";
    const tr = isObj(raw.id) ? raw.id : isObj(raw.tr) ? raw.tr : null;
    const p = {
      uid: str(typeof raw.id === "string" ? raw.id : raw.uid), cat: CATS.includes(raw.cat) ? raw.cat : "illustration",
      title, desc: clean(raw.desc), img, full, kind,
      roles: (Array.isArray(raw.roles) ? raw.roles : ["portfolio", "card"]).filter(r => ROLES.includes(r))
    };
    if (kind === "fan") p.label = "Fan art";
    else if (kind === "client" && clean(raw.label)) p.label = clean(raw.label);
    if (tr) p.id = { title: clean(tr.title), desc: clean(tr.desc) };
    if (!p.roles.includes("portfolio")) p.roles.unshift("portfolio");
    if (!p.roles.includes("card")) p.roles.push("card");
    if (kind !== "original") p.roles = p.roles.filter(r => ["portfolio", "card"].includes(r));   // fan and client: portfolio only
    derive(g, p);
    return p;
  }

  // g = {CONFIG, FEATURES, PROJECTS, COPY}. Returns true if anything changed. Never throws.
  function merge(g, d) {
    let changed = false;
    try {
      if (!isObj(d) || d.version !== 1) return false;
      const c = isObj(d.contact) ? d.contact : {};
      if (clean(c.email) && /^[^\s@]+@[^\s@]+$/.test(c.email.trim())) { g.CONFIG.email = c.email.trim(); changed = true; }
      if (isObj(c.priceLine)) for (const l of ["en", "id"]) if (clean(c.priceLine[l]) && g.COPY[l]) {
        g.COPY[l]["hire.price"] = g.COPY[l]["about.fact.price"] = clean(c.priceLine[l]); changed = true; }
      if (isObj(d.links)) for (const k in d.links) {
        const u = str(d.links[k]);
        if (!/^https:\/\/[^\s]+$/.test(u)) continue;
        if (k === "website") g.CONFIG.website = u; else g.CONFIG.links[k] = u;
        changed = true;
      }
      if (isObj(d.features)) for (const k in d.features) if (typeof d.features[k] === "boolean") { g.FEATURES[k] = d.features[k]; changed = true; }
      if (isObj(d.copy)) for (const l of ["en", "id"]) if (isObj(d.copy[l]) && g.COPY[l]) for (const k in d.copy[l]) {
        const s = clean(d.copy[l][k]); if (s) { g.COPY[l][k] = s; changed = true; } }
      if (Array.isArray(d.projects)) for (const raw of d.projects) {
        const p = piece(g, raw);
        if (p && !g.PROJECTS.some(q => q.full === p.full || (p.uid && q.uid === p.uid))) { g.PROJECTS.push(p); changed = true; }
      }
      const hidden = Array.isArray(d.hidden) ? d.hidden.map(str).filter(Boolean) : [];
      for (let i = g.PROJECTS.length - 1; i >= 0; i--) if (matches(g.PROJECTS[i], hidden)) { g.PROJECTS.splice(i, 1); changed = true; }
      SiteData.order = Array.isArray(d.order) ? d.order.map(str).filter(Boolean) : [];
    } catch (e) { /* a broken file never breaks the site */ }
    return changed;
  }

  // The featured pieces in the owner's order (pieces named in `order`, then the rest from `rest`), at most n.
  function ordered(pieces, n = 6) {
    const first = SiteData.order.map(i => pieces.find(p => matches(p, [i]))).filter(Boolean);
    return first.concat(pieces.filter(p => !first.includes(p))).slice(0, n);
  }

  const api = { merge, ordered, order: [], builtin: null, data: null, ready: null, changed: false, load, openAdmin };

  // Fetch data/site.json once; merge it; tell the page (event "sitedata") only if something changed.
  function load() {
    api.ready = fetch("data/site.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).catch(() => null).then(d => {
      api.data = isOk(d) ? d : null;
      if (api.data && hasContent(api.data)) api.builtin = JSON.parse(JSON.stringify({ config: CONFIG, features: FEATURES, copy: COPY }));   // pristine, for "reset to built-in"
      api.changed = api.data ? merge({ CONFIG, FEATURES, PROJECTS, COPY }, api.data) : false;
      if (api.changed) dispatchEvent(new Event("sitedata"));
      return api.changed;
    });
    return api.ready;
  }
  const hasContent = v => Array.isArray(v) ? v.some(hasContent) : isObj(v) ? Object.entries(v).some(([k, x]) => k !== "version" && hasContent(x)) : v !== "" && v !== null && v !== undefined && v !== false;
  const isOk = d => isObj(d) && d.version === 1;

  // The admin code is injected only when a door opens.
  function openAdmin() {
    if (window.Admin) return window.Admin.open();
    if (openAdmin.busy) return;
    openAdmin.busy = true;
    const s = document.createElement("script");
    s.src = "js/admin.js";
    s.onload = () => { openAdmin.busy = false; window.Admin && window.Admin.open(); };
    s.onerror = () => { openAdmin.busy = false; s.remove(); };
    document.head.appendChild(s);
  }
  return api;
})();

// Doors. Web: type "ekky" outside a text field. Phone (game mode): tap the logo on the start page 7 times in 3 seconds.
// Neither shows any hint in the interface.
(() => {
  const game = () => document.body.classList.contains("game-mode");
  let typed = "";
  addEventListener("keydown", e => {
    if (game() || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    const a = document.activeElement;
    if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) { typed = ""; return; }
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === "ekky") { typed = ""; SiteData.openAdmin(); }
  });
  let taps = [];
  document.addEventListener("click", e => {
    if (!game() || !e.target.closest("#g-start .g-logo, #g-start .g-logo-text")) return;
    const now = Date.now();
    taps = taps.filter(t => now - t < 3000).concat(now);
    if (taps.length >= 7) { taps = []; SiteData.openAdmin(); }
  });
})();

SiteData.load();
