// node scripts/playtest/patrol.cjs [site dir] [out dir]
// MG4 playtest of Paint Patrol stage 1, with FEATURES.paintPatrol switched on in the page only (the file is not changed).
// iPhone 13 in landscape. Three players: "casual" (holds right, jumps when something is close or a shock wave rolls in),
// "drag" (the real touch stick on the left half), and "idle" (never touches; does the stage end on its own?).
// Reports time to the end screen, knockbacks, characters seen in the first 30 s, the telegraph before every swing,
// fps at 4x CPU, the end screen (Coexistence, lightbox, Hire), the portrait card and errors.
const { chromium, serve, PHONE, cpu } = require("./lib.cjs");
const fs = require("fs"), path = require("path");
const SITE = path.resolve(process.argv[2] || "."), OUT = path.resolve(process.argv[3] || "/tmp/playtest");
fs.mkdirSync(OUT, { recursive: true });
const LAND = { ...PHONE, viewport: { width: 844, height: 390 }, screen: { width: 844, height: 390 } };
async function page(b, base, dev, opts = {}) {
  const ctx = await b.newContext(dev), p = await ctx.newPage(), errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.route("**/js/features.js", async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace(/paintPatrol:\s*false/, "paintPatrol: true") }) });
  if (opts.cpu) await cpu(ctx, p, opts.cpu);
  await p.goto(base); await p.waitForTimeout(1800);
  const entry = await p.evaluate(() => { const e = document.querySelector('[data-go="patrol"],[data-patrol],[data-place="busstop"],[data-place="patrol"]'); if (e) { e.click(); return e.outerHTML.slice(0, 80) } return null });
  if (!entry) await p.evaluate(() => window.Patrol ? window.Patrol.open() : (typeof openPatrol === "function" && openPatrol()));
  await p.waitForFunction(() => window.Patrol && window.Patrol.state && window.Patrol.state.started, { timeout: 15000 }).catch(() => {});
  return { ctx, p, errs, entry };
}
// watch the state every 100 ms: knockbacks, kinds seen, telegraph lengths, the end
const watch = p => p.evaluate(() => { const W = window.__pt = { kinds: {}, knocks: 0, tele: [], t0: performance.now(), endAt: null, friendAt: null };
  let lastInv = 0, liftAt = null;
  setInterval(() => { const S = window.Patrol.state; if (!S) return; const t = (performance.now() - W.t0) / 1000;
    if (t < 30) S.en.forEach(n => W.kinds[n.k] = 1);
    if (S.hero.inv > lastInv + .1) W.knocks++; lastInv = S.hero.inv;
    const f = S.friend; if (f && f.on && W.friendAt == null) W.friendAt = +t.toFixed(1);
    if (f && f.state === "lift" && liftAt == null) liftAt = t; if (f && f.state === "slam" && liftAt != null) { W.tele.push(+(t - liftAt).toFixed(2)); liftAt = null }
    if (S.ended && W.endAt == null) W.endAt = +t.toFixed(1) }, 100) });
const casual = p => p.evaluate(() => { window.__bot = setInterval(() => { const S = window.Patrol.state; if (!S || !S.run) return; const h = S.hero;
  S.keys.arrowright = true;
  const near = S.en.some(n => !n.friend && Math.abs(n.x - h.x) < 120) || (S.friend && S.friend.waves.some(w => Math.abs(w.x - h.x) < 90));
  if (near && h.y >= 469) dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" })) }, 120) });
(async () => {
  const s = await serve(SITE), b = await chromium.launch(), R = {};
  for (const mode of ["casual", "drag", "idle"]) {
    const { ctx, p, errs, entry } = await page(b, s.url, LAND); R.entry = entry || "Patrol.open() (no entry button found)";
    await watch(p);
    if (mode === "casual") await casual(p);
    if (mode === "drag") { await p.mouse.move(150, 300); await p.mouse.down(); await p.mouse.move(210, 300, { steps: 4 }) }
    const limit = mode === "idle" ? 60 : 150;
    await p.waitForFunction(() => window.__pt.endAt != null, { timeout: limit * 1000, polling: 500 }).catch(() => {});
    const W = await p.evaluate(() => ({ ...window.__pt, heroX: window.Patrol.state && Math.round(window.Patrol.state.hero.x), stageL: window.Patrol.state && window.Patrol.state.L }));
    R[mode] = { endsAfterS: W.endAt, bigFriendAtS: W.friendAt, knockbacks: W.knocks, kindsFirst30s: Object.keys(W.kinds), telegraphS: W.tele.slice(0, 6), heroX: W.heroX, stageL: W.stageL, errors: errs };
    if (mode === "casual" && W.endAt != null) { await p.waitForTimeout(1800); await p.screenshot({ path: path.join(OUT, "patrol-end.png") });
      R.endScreen = await p.evaluate(() => { const c = document.querySelector(".pp-end"); return c && { text: c.innerText.replace(/\s+/g, " ").slice(0, 200), hire: !!c.querySelector("[data-hire]"), see: !!c.querySelector('[data-pp="see"]'), again: !!c.querySelector('[data-pp="again"]') } }) }
    if (mode === "casual") await p.screenshot({ path: path.join(OUT, "patrol-casual.png") });
    await ctx.close();
  }
  { const { ctx, p } = await page(b, s.url, LAND, { cpu: 4 }); await casual(p); await p.waitForTimeout(3000);
    R.fps4x = await p.evaluate(() => new Promise(res => { const ts = []; const f = t => { ts.push(t); if (ts.length < 241) requestAnimationFrame(f); else { const d = ts.slice(1).map((x, i) => x - ts[i]).sort((a, b) => a - b);
      res({ meanFps: +(1000 / (d.reduce((a, b) => a + b) / d.length)).toFixed(1), p95ms: +d[Math.floor(d.length * .95)].toFixed(1), over50ms: d.filter(x => x > 50).length }) } }; requestAnimationFrame(f) }));
    await ctx.close() }
  { const { ctx, p } = await page(b, s.url, PHONE); await p.waitForTimeout(800); await p.screenshot({ path: path.join(OUT, "patrol-portrait.png") });
    R.portrait = await p.evaluate(() => { const c = document.querySelector(".pp-turn"); return c && !c.hidden ? c.innerText.replace(/\s+/g, " ") : "no turn card" }); await ctx.close() }
  console.log(JSON.stringify(R, null, 1)); await b.close(); s.close();
})();
