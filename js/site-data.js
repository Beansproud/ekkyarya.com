// data/site.json loader and merge (docs/admin.md), plus the two admin doors. Loaded after js/features.js, before js/site.js.
// The merge changes CONFIG, FEATURES, PROJECTS and COPY in place. A missing, empty or broken file changes nothing.
// The admin screen itself (js/admin.js) is fetched only when a door opens; normal visitors never download it.
const SiteData = (() => {
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  const str = v => typeof v === "string" ? v.trim() : "";
  const GLYPH = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/u;
  // Owner rule: no emoji. Security: the site puts some of these strings into innerHTML and double-quoted attributes
  // (js/site.js), so no value may carry markup: "<" and ">" are dropped and a straight double quote becomes a curly one.
  const clean = v => { const s = str(v).replace(/[<>]/g, "").replace(/"/g, "\u201D").trim(); return s && !GLYPH.test(s) ? s : ""; };
  const SAFE_URL = /^https:\/\/[^\s"'<>`\\]+$/, SAFE_MAIL = /^[^\s@"'<>`\\]+@[^\s@"'<>`\\]+$/, SAFE_UID = /^u-[a-z0-9-]+$/;
  const SAFE_PATH = /^assets\/work\/(?:thumb\/)?u\/[a-z0-9-]+\.jpe?g$/;
  // Project flow (docs/flow.md): steps of a piece. A bad step is dropped, never the piece; fewer than 2 means no flow.
  const SAFE_STEP = /^assets\/(?:work\/(?:thumb\/|s\/)?(?:u\/)?|projects\/[a-z0-9-]+\/(?:[a-z0-9-]+\/)?)[a-z0-9-]+\.(?:jpe?g|png|gif|webp)$/;
  // a step's optional extras: anim (a play-once animated WebP) and set (a grid of 2 to 24 named pictures)
  const anim = v => SAFE_STEP.test(str(v)) ? { anim: str(v) } : {};
  const setOf = v => { if (!Array.isArray(v)) return {};
    const set = v.filter(isObj).map(x => { const n = isObj(x.name) ? x.name : {}, img = str(x.img), full = str(x.full);
      return SAFE_STEP.test(img) && SAFE_STEP.test(full) ? Object.assign({ img, full, name: { en: clean(n.en).slice(0, 60), id: clean(n.id).slice(0, 60) } }, anim(x.anim)) : null; }).filter(Boolean).slice(0, 24);
    return set.length >= 2 ? { set } : {}; };
  const FLOW_KINDS = ["process", "series"];
  function flowOf(raw) {
    if (!isObj(raw) || !Array.isArray(raw.steps)) return null;
    const steps = raw.steps.filter(isObj).map(x => {
      const c = isObj(x.caption) ? x.caption : {}, img = str(x.img), full = str(x.full);
      return SAFE_STEP.test(img) && SAFE_STEP.test(full) ? Object.assign({ img, full, caption: { en: clean(c.en).slice(0, 60), id: clean(c.id).slice(0, 60) } }, anim(x.anim), setOf(x.set)) : null;
    }).filter(Boolean).slice(0, 8);
    return steps.length >= 2 ? { flow: FLOW_KINDS.includes(raw.flow) ? raw.flow : "process", steps } : null;
  }
  // One COPY override (the admin Words tab), or null to keep the built-in text. Only keys that exist, as plain text
  // (clean above: no markup, no emoji), at most 600 letters; every {placeholder} of the built-in text kept; a "a|b" text keeps
  // its number of parts; a list (hire.types) stays a list of the same length; a trailing space of the built-in is kept.
  const LOCKED = ["fact.count"];
  const PH = /\{\w+\}/g;
  function copyText(base, v, k) {
    if (LOCKED.includes(k)) return null;
    if (Array.isArray(base)) {
      if (!Array.isArray(v) || v.length !== base.length) return null;
      const a = v.map(x => clean(x).slice(0, 120));
      return a.every(Boolean) ? a : null;
    }
    if (typeof base !== "string") return null;
    let s = clean(v).slice(0, 600);
    if (!s || (base.match(PH) || []).some(p => !s.includes(p)) || s.split("|").length !== base.split("|").length) return null;
    if (/\s$/.test(base)) s += " ";
    return s;
  }
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
      uid: (u => SAFE_UID.test(u) ? u : "")(str(typeof raw.id === "string" ? raw.id : raw.uid)), cat: CATS.includes(raw.cat) ? raw.cat : "illustration",
      title, desc: clean(raw.desc), img, full, kind,
      roles: (Array.isArray(raw.roles) ? raw.roles : ["portfolio", "card"]).filter(r => ROLES.includes(r))
    };
    if (kind === "fan") p.label = "Fan art";
    else if (kind === "client" && clean(raw.label)) p.label = clean(raw.label);
    if (tr) p.id = { title: clean(tr.title), desc: clean(tr.desc) };
    const f = flowOf(raw); if (f) Object.assign(p, f);
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
      if (SAFE_MAIL.test(str(c.email))) { g.CONFIG.email = c.email.trim(); changed = true; }
      if (isObj(c.priceLine)) for (const l of ["en", "id"]) if (clean(c.priceLine[l]) && g.COPY[l]) {
        g.COPY[l]["hire.price"] = g.COPY[l]["about.fact.price"] = clean(c.priceLine[l]); changed = true; }
      if (isObj(d.links)) for (const k in d.links) {
        const u = str(d.links[k]);
        if (!SAFE_URL.test(u)) continue;
        if (k === "website") g.CONFIG.website = u; else g.CONFIG.links[k] = u;
        changed = true;
      }
      if (isObj(d.features)) for (const k in d.features) if (typeof d.features[k] === "boolean") { g.FEATURES[k] = d.features[k]; changed = true; }
      if (isObj(d.copy)) for (const l of ["en", "id"]) if (isObj(d.copy[l]) && g.COPY[l]) for (const k in d.copy[l]) {
        const s = copyText(g.COPY[l][k], d.copy[l][k], k); if (s !== null) { g.COPY[l][k] = s; changed = true; } }
      if (Array.isArray(d.projects)) for (const raw of d.projects) {
        const p = piece(g, raw);
        if (p && !g.PROJECTS.some(q => q.full === p.full || (p.uid && q.uid === p.uid))) { g.PROJECTS.push(p); changed = true; }
      }
      // steps for built-in pieces, keyed by title (or uid)
      if (isObj(d.flows)) for (const k in d.flows) { const f = flowOf(d.flows[k]), p = f && g.PROJECTS.find(q => matches(q, [k]));
        if (p) { Object.assign(p, f); changed = true; } }
      const hidden = Array.isArray(d.hidden) ? d.hidden.map(str).filter(Boolean) : [];
      for (let i = g.PROJECTS.length - 1; i >= 0; i--) if (matches(g.PROJECTS[i], hidden)) { g.PROJECTS.splice(i, 1); changed = true; }
      SiteData.order = Array.isArray(d.order) ? d.order.map(str).filter(Boolean) : [];
      SiteData.icons = iconsOf(d.icons); SiteData.places = placesOf(d.icons);
      if (Object.keys(SiteData.icons).length + Object.keys(SiteData.places).length) changed = true;
    } catch (e) { /* a broken file never breaks the site */ }
    return changed;
  }

  // The featured pieces in the owner's order (pieces named in `order`, then the rest from `rest`), at most n.
  function ordered(pieces, n = 6) {
    const first = SiteData.order.map(i => pieces.find(p => matches(p, [i]))).filter(Boolean);
    return first.concat(pieces.filter(p => !first.includes(p))).slice(0, n);
  }

  // ---- icons (the admin Icons tab): "icons": {"style": "<name>", "map": {"<built-in icon>": "assets/ui/u/<file>.png"},
  //      "places": {"<place>": "<built-in icon or assets/ui/u/<file>.png>"}} ----
  // Only the drawn icons below can be swapped, only for a PNG uploaded under assets/ui/u/. Every <img> that shows a swapped
  // icon gets the new file: those in the page, those added later, and `new Image()` sprites (src set through the property).
  const ICONS = ["astronaut", "cat", "ekky", "face-pop", "face", "ghost", "helmet", "monster-head", "palette", "pen-hand", "planet", "radio-explorer", "virus"]
    .map(n => "assets/ui/" + n + ".png").concat(["all", "illustration", "web", "branding", "social"].map(n => "assets/cat-" + n + ".png"));
  const SAFE_ICON = /^assets\/ui\/u\/[a-z0-9-]+\.png$/;
  function iconsOf(raw) {
    const m = {}, map = isObj(raw) && isObj(raw.map) ? raw.map : {};
    for (const k of ICONS) if (SAFE_ICON.test(str(map[k]))) m[k] = str(map[k]);
    return m;
  }
  // Places: one button or spot can show another icon than its built-in one ("places": {"<place>": "<icon or upload>"}).
  // The value is a built-in icon (then the chosen style applies to it too) or a PNG uploaded under assets/ui/u/.
  const PLACES = {
    hire: ".g-hire img", tabArt: '.g-tabs [data-tab="art"] img', tabMap: '.g-tabs [data-tab="map"] img',
    sketch: ".g-start-sketch img", collab: ".g-start-collab img", stars: ".g-intro-stars img, .g-stars-head img",
    fab: "#gFab img", playColor: '.play-card[href*="play=color"] img', playStars: '.play-card[href*="play=stars"] img',
    heroWave: ".wave img", dividers: ".doodle-rule img"
  };
  function placesOf(raw) {
    const m = {}, pl = isObj(raw) && isObj(raw.places) ? raw.places : {};
    for (const k in PLACES) { const v = str(pl[k]); if (ICONS.includes(v) || SAFE_ICON.test(v)) m[k] = v; }
    return m;
  }
  // What an <img> showing icon k should show: its place's choice first, else the icon (swapped or not).
  function want(img, k) {
    for (const id in api.places) if (img.matches && img.matches(PLACES[id])) return iconFor(api.places[id]);
    return iconFor(k);
  }
  let iconHooked = false, iconObs = null;
  const ICO_RE = /(?:^|\/)(assets\/(?:ui\/[a-z-]+|cat-[a-z]+)\.png)$/;
  // The file an icon path shows now: the swapped one (a preview's unpublished picture first), else the path itself.
  function iconFor(v) {
    if (typeof v === "string" && SAFE_ICON.test(v)) return api.iconBlobs[v] || v;   // a place's own upload
    const m = typeof v === "string" && v.match(ICO_RE), k = m && m[1];
    if (!k || !ICONS.includes(k)) return v;
    const to = api.icons[k];
    return to ? (api.iconBlobs[to] || to) : k;
  }
  // data-ico: the built-in icon the <img> stands for; data-ico-set: what this code put in its src (so a later change can redo it).
  function swapImg(img) {
    const cur = img.getAttribute("src") || "", m = cur.match(ICO_RE), was = img.getAttribute("data-ico");
    let k = m && ICONS.includes(m[1]) ? m[1] : null;
    if (!k && was) { if (img.getAttribute("data-ico-set") === cur) k = was; else { img.removeAttribute("data-ico"); img.removeAttribute("data-ico-set"); return; } }   // a reused <img> now shows something else
    if (!k) return;
    const to = want(img, k);
    if (to !== k || was) { img.setAttribute("data-ico", k); img.setAttribute("data-ico-set", to); if (cur !== to) img.setAttribute("src", to); }
  }
  function applyIcons() {
    const any = Object.keys(api.icons).length + Object.keys(api.places).length;
    if (!any && !iconHooked) return;
    if (!iconHooked) {
      iconHooked = true;
      const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
      if (d && d.set) Object.defineProperty(HTMLImageElement.prototype, "src", { configurable: true, enumerable: d.enumerable, get() { return d.get.call(this); },
        set(v) { const m = String(v).match(ICO_RE), to = m && ICONS.includes(m[1]) ? want(this, m[1]) : v;
          if (to !== v) { this.setAttribute("data-ico", m[1]); this.setAttribute("data-ico-set", to); } else { this.removeAttribute("data-ico"); this.removeAttribute("data-ico-set"); }
          d.set.call(this, to); } });
      iconObs = new MutationObserver(list => { for (const r of list) {
        if (r.type === "attributes") { if (r.target.tagName === "IMG") swapImg(r.target); continue; }
        for (const n of r.addedNodes) if (n.nodeType === 1) { if (n.tagName === "IMG") swapImg(n); else if (n.querySelector) n.querySelectorAll("img").forEach(swapImg); } } });
      iconObs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
    }
    document.querySelectorAll("img").forEach(swapImg);
  }

  const api = { merge, ordered, preview, order: [], builtin: null, data: null, ready: null, changed: false, load, openAdmin, ICONS, PLACES, icons: {}, places: {}, iconBlobs: {}, iconFor };

  // Fetch data/site.json once; merge it; tell the page (event "sitedata") only if something changed.
  function load() {
    api.ready = fetch("data/site.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).catch(() => null).then(d => {
      api.data = isOk(d) ? d : null;
      if (api.data && hasContent(api.data)) api.builtin = snapshot();   // pristine, for "reset to built-in"
      const before = JSON.stringify(COPY);
      api.changed = api.data ? merge({ CONFIG, FEATURES, PROJECTS, COPY }, api.data) : false;
      if (api.changed) dispatchEvent(new Event("sitedata"));
      if (JSON.stringify(COPY) !== before) relang();
      applyIcons();
      return api.changed;
    });
    return api.ready;
  }
  const snapshot = () => JSON.parse(JSON.stringify({ config: CONFIG, features: FEATURES, copy: COPY, projects: PROJECTS }));
  const reset = (to, from) => { for (const k of Object.keys(to)) delete to[k]; Object.assign(to, JSON.parse(JSON.stringify(from))); };
  // Preview (admin): show `json` on the live page in memory, over the built-in data, or null to go back to what is published.
  // Nothing is saved or sent anywhere; a reload shows the published site again.
  function preview(json) {
    if (!api.builtin) api.builtin = snapshot();   // nothing was merged at start-up, so the page is still the built-in data
    const b = api.builtin, before = JSON.stringify(COPY);
    reset(CONFIG, b.config); reset(FEATURES, b.features); reset(COPY, b.copy);
    PROJECTS.splice(0, PROJECTS.length, ...JSON.parse(JSON.stringify(b.projects)));
    api.order = []; api.icons = {}; api.places = {};
    const d = json || api.data;
    if (d) merge({ CONFIG, FEATURES, PROJECTS, COPY }, d);
    dispatchEvent(new Event("sitedata"));
    if (JSON.stringify(COPY) !== before) relang();
    applyIcons();
  }
  // New words: every text drawn with t() is set again in place, the same way a language switch does it (js/site.js).
  function relang() { try { if (typeof applyText === "function") applyText(); dispatchEvent(new Event("ekky:lang")); } catch (e) {} }
  const hasContent = v => Array.isArray(v) ? v.some(hasContent) : isObj(v) ? Object.entries(v).some(([k, x]) => k !== "version" && hasContent(x)) : v !== "" && v !== null && v !== undefined && v !== false;
  const isOk = d => isObj(d) && d.version === 1;

  // The admin code is injected only when a door opens.
  function openAdmin() {
    if (window.Admin) return window.Admin.open();
    if (openAdmin.busy) return;
    openAdmin.busy = true;
    const s = document.createElement("script");
    s.src = "js/admin.js?v=" + Date.now();   // admin is rare: always fetch the newest copy
    s.onload = () => { openAdmin.busy = false; window.Admin && window.Admin.open(); };
    s.onerror = () => { openAdmin.busy = false; s.remove(); };
    document.head.appendChild(s);
  }
  return api;
})();

// Doors. Web: type "ekky" outside a text field. Phone (game mode): tap the logo on the start page 7 times in 3 seconds.
// A touch screen on the web site (an iPad, with no keyboard to type on) uses the tap door on the web logo.
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
    const gameLogo = game() && e.target.closest("#g-start .g-logo, #g-start .g-logo-text");
    const webLogo = !game() && matchMedia("(pointer:coarse)").matches && e.target.closest(".topbar .logo, .sidebar .logo");
    if (!gameLogo && !webLogo) return;
    const now = Date.now();
    taps = taps.filter(t => now - t < 3000).concat(now);
    if (taps.length >= 7) { taps = []; SiteData.openAdmin(); }
  });
})();

SiteData.load();
