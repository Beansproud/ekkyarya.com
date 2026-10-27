// Feature switches (B38), loaded right after js/data.js. One on/off switch per optional feature, so scope can be
// limited later without code changes. A switch that is off hides the feature completely: its buttons, tiles, tabs and
// deep links disappear (no greyed-out button, no lock). Core paths (the art, coloring a page, Hire Ekky) have no switch.
// In HTML, mark an entry point with data-feature="<name>"; js/site.js removes it when the switch is off.
const FEATURES = {
  starCatcher: true,     // Star Catcher arcade: start tile, map header button, result screen
  stickers: true,        // sticker tray in the coloring screen (Ekky's own doodles)
  doodleScene: true,     // "Start from scratch": a plain page for stickers and colors
  anyColor: true,        // "Any color" swatch (system color picker) next to Ekky's colors
  shareCards: true,      // share image (1080 x 1920) and the share sheet
  shareVideo: true,      // "Share as video": the coloring plays back as a 5 s clip, recorded in the browser (no library)
  challengeLinks: true,  // Star Catcher challenge links (later ticket B22)
  holoCards: true,       // holo foil on tilt (later ticket B36)
  pwa: true,             // "Install the app" (manifest + sw.js); the full offline work is B37
  pageRoadTrip: false,   // Road Trip coloring page: built (assets/color/road-trip/), waits for Ekky to approve the lines (D8)
  artDownload: true,     // lightbox Download: a copy of at most 1600 px with a subtle mark, never on fan art (owner: yes)
  sound: true,           // sound effects and the sound toggle
};
const feature = name => FEATURES[name] === true;
// Creative use (icons, stickers, coloring pages, share cards, the featured rows): the piece must be shareable() AND Ekky's
// own original work. Project rule: client and fan pieces stay in the portfolio list and the Art tab only, whatever
// CONFIG.reuse says. npm run check enforces the same rule on the code.
const creative = p => !!p && shareable(p) && p.kind === "original";
// The featured row and the desktop strip: a fresh pick on every visit (featuredPick in js/data.js), original pieces only.
// Always n pieces: a random order, at most 2 per category first, then any others to fill up.
const featuredSix = (n = 6) => {
  const pool = withRole("featured").filter(creative);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const per = {}, first = pool.filter(p => (per[p.cat] = (per[p.cat] || 0) + 1) <= 2);
  return first.concat(pool.filter(p => !first.includes(p))).slice(0, n);
};
// tt(key, english): t() for the few keys COPY in js/data.js doesn't have yet (asked of the UX lead); until then it shows
// the English given at the call site instead of the bare key.
const tt = (key, en, vars) => { const s = t(key, vars); return s === key ? en : s; };
