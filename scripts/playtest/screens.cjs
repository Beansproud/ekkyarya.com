// node scripts/playtest/screens.cjs [site dir] [out dir] [lang]
// Walks every game screen on an iPhone 13 (and 360 x 640) and reports, per screen: whether a Hire Ekky button is
// visible and on top at its center (one tap), the endless animations running (sprint rule: 0 outside a game in
// play), and console errors. Also counts how many of the start screen's drawings are fully visible at 1 s.
const { chromium, serve, PHONE, click } = require("./lib.cjs");
const fs = require("fs"), path = require("path");
const SITE = path.resolve(process.argv[2] || "."), OUT = path.resolve(process.argv[3] || "/tmp/playtest"), LANG = process.argv[4] || "en";
fs.mkdirSync(OUT, { recursive: true });
const probe = page => page.evaluate(() => {
  const vw = innerWidth, vh = innerHeight;
  const hires = [...document.querySelectorAll('button,a')].filter(e => /hire|ekky.*work|work with ekky|rekrut|kerja/i.test((e.getAttribute("aria-label") || "") + " " + e.textContent) && e.getBoundingClientRect().width > 0);
  const tappable = hires.filter(e => { const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return false; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === e || e.contains(t)) });
  const loops = document.getAnimations().filter(a => a.playState === "running" && a.effect && a.effect.getTiming().iterations === Infinity)
    .map(a => a.animationName || a.constructor.name);
  const agg = {}; loops.forEach(n => agg[n] = (agg[n] || 0) + 1);
  return { hireOneTap: tappable.length > 0, endless: agg };   // the Hire sheet itself reports no Hire button: that is expected
});
(async () => {
  const s = await serve(SITE), b = await chromium.launch(), out = {};
  for (const [name, dev] of [["iphone13", PHONE], ["360x640", { ...PHONE, viewport: { width: 360, height: 640 } }]]) {
    const ctx = await b.newContext(dev), p = await ctx.newPage(), errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
    await p.goto(s.url + (LANG === "id" ? "?lang=id" : "")); await p.waitForTimeout(1000);
    const R = {};
    R.startGrid = await p.evaluate(() => { const ims = [...document.querySelectorAll("img")].filter(i => /assets\/work/.test(i.currentSrc || i.src) && i.getClientRects().length && getComputedStyle(i).visibility !== "hidden");
      return ims.filter(i => { const r = i.getBoundingClientRect(); return r.width > 40 && r.left >= -1 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight }).length + " of " + ims.length + " fully visible at 1 s" });
    await p.waitForTimeout(1500);
    const step = async (label, fn) => { if (fn) { await fn(); await p.waitForTimeout(1100) } R[label] = await probe(p); await p.screenshot({ path: path.join(OUT, `${name}-${label}.png`) }) };
    await step("start");
    await step("map", () => click(p, '[data-tab="map"]'));
    for (const id of ["home", "studio", "gallery", "doodle", "hire"]) { await step("place-" + id, () => click(p, `.v-place[data-place="${id}"]`)); await click(p, "#gSheetX"); await p.waitForTimeout(400); await click(p, '[data-tab="map"]'); await p.waitForTimeout(400) }
    await step("villager", () => click(p, ".v-folk,.v-walker")); await click(p, "#gSheetX"); await p.waitForTimeout(400);
    await step("art", () => click(p, '[data-tab="art"]'));
    await step("lightbox", () => click(p, ".g-card")); await click(p, "#lbClose"); await p.waitForTimeout(400);
    await step("mine", () => click(p, '[data-tab="mine"]'));
    await step("color-picker", () => click(p, '[data-go="color"]').then(async ok => ok || (await click(p, '[data-tab="map"]'), click(p, '.v-place[data-place="studio"]'))));
    await click(p, "#cPickX"); await p.waitForTimeout(400);
    R.errors = errs; out[name] = R; await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1)); await b.close(); s.close();
})();
