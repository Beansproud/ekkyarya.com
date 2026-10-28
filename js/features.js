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
  pageRoadTrip: true,    // Road Trip coloring page: built (assets/color/road-trip/), waits for Ekky to approve the lines (D8)
  pageMonster: true,     // experiment: the green monster from Monster in My Room as a coloring page (assets/color/monster/),
                         // the owner's own-art alternative to a fan-art page; waits for Ekky to approve docs/color-monster-lines.png
  pagePlugHero: true,    // Plug Hero Mascot coloring page (assets/color/plug-hero/), Ekky original; the scarf and shoes stay as his dark ink
  pageLittlePlanet: true, // Little Planet coloring page (assets/color/little-planet/), Ekky original
  pageHands: true,       // Tangled Hands coloring page (assets/color/hands/), Ekky original
  pageNoodles: true,     // Noodle Bath coloring page (assets/color/noodles/), Ekky original
  pageSummertime: true,  // Buried at the Beach coloring page (assets/color/summertime/), Ekky original
  pageVirusAndWar: true, // Virus and War coloring page (assets/color/virus-and-war/), Ekky original
  pageShark: true,       // Big Catch coloring page (assets/color/shark/), Ekky original; lines regenerated without the baked-in back shading
  apkDownload: true,     // glowing "APK" chip on the start page, Android browsers only (owner, 10-28); links to the app-latest release (GitHub build)
  artDownload: true,     // lightbox Download: a copy of at most 1600 px with a subtle mark, never on fan art (owner: yes)
  sound: true,           // sound effects and the sound toggle
  handLettering: false,  // S3: headings with data-hand="<word>" show Ekky's lettering (assets/hand/<word>.png, listed in
                         // assets/hand/index.json); the heading text stays the accessible name. Off until Ekky's sheet arrives.
  aboutPhoto: false,     // S3: a photo or self-portrait in About (assets/hand/ekky.jpg, listed in assets/hand/index.json). Off until it arrives.
  clientScenery: false,  // V5: drawn elements of client pieces as village scenery, each opening its piece with its tag.
                         // Off until the owner confirms the client-piece change to the Developer directly; no client
                         // cut-out is made or committed before that (scripts/village.py CLIENT_SCENERY stays empty).
};
// Playtest override: ?ff=<switch> (repeatable) turns a switch on for this visit only, so the Director can test a
// feature on a real phone while it stays off for everyone else. It only turns switches on, never off.
// Only switches on this list can be turned on from a link; anything waiting for the owner or Ekky (pageRoadTrip, pageMonster,
// clientScenery, handLettering, aboutPhoto) can never be switched on from a URL.
const PLAYTEST_FF = [];
try { new URLSearchParams(location.search).getAll("ff").forEach(n => { if (PLAYTEST_FF.includes(n)) FEATURES[n] = true; }); } catch (e) {}
const feature = name => FEATURES[name] === true;
// Creative use (icons, stickers, coloring pages, share cards, the featured rows): the piece must be shareable() AND Ekky's
// own original work. Project rule: client and fan pieces stay in the portfolio list and the Art tab only, whatever
// CONFIG.reuse says. npm run check enforces the same rule on the code.
const creative = p => !!p && shareable(p) && p.kind === "original";
// The featured row and the desktop strip: the owner's order (the admin "order" reorders PROJECTS), original pieces only.
// Always n pieces: at most 2 per category first, then any others to fill up. No shuffle: the same six on every visit.
const featuredSix = (n = 6) => {
  const pool = withRole("featured").filter(creative);
  const per = {}, first = pool.filter(p => (per[p.cat] = (per[p.cat] || 0) + 1) <= 2);
  return first.concat(pool.filter(p => !first.includes(p))).slice(0, n);
};
// tt(key, english): t() for the few keys COPY in js/data.js doesn't have yet (asked of the UX lead); until then it shows
// the English given at the call site instead of the bare key.
const tt = (key, en, vars) => { const s = t(key, vars); return s === key ? en : s; };
