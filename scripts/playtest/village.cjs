// node scripts/playtest/village.cjs [site dir] [out dir]
// Ekky's Village on an iPhone 13: first frame and fps at 4x CPU slowdown, every place (size, on screen, tappable),
// villagers (count, how many different pieces), the running animations, a tester opening 3 artworks from villagers
// (with reading pauses; target < 60 s), Hire, the list fallback, reduced motion and night (21:30).
const { chromium, serve, PHONE, cpu, click } = require("./lib.cjs");
const fs = require("fs"), path = require("path");
const SITE = path.resolve(process.argv[2] || "."), OUT = path.resolve(process.argv[3] || "/tmp/playtest");
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const s = await serve(SITE), b = await chromium.launch(), R = {};
  { const ctx = await b.newContext(PHONE), p = await ctx.newPage(); await cpu(ctx, p, 4); await p.goto(s.url); await p.waitForTimeout(2500);
    const t0 = Date.now(); await click(p, '[data-tab="map"]');
    await p.waitForFunction(() => { const g = document.querySelector(".v-ground"); return g && g.complete && g.naturalWidth > 0 && document.querySelectorAll(".v-place").length }, { polling: 16, timeout: 20000 });
    R.firstFrameMs4x = Date.now() - t0; await p.waitForTimeout(1500);
    R.fps4x = await p.evaluate(() => new Promise(res => { const ts = []; const f = t => { ts.push(t); if (ts.length < 301) requestAnimationFrame(f); else { const d = ts.slice(1).map((x, i) => x - ts[i]).sort((a, b) => a - b);
      res({ meanFps: +(1000 / (d.reduce((a, b) => a + b) / d.length)).toFixed(1), p95ms: +d[Math.floor(d.length * .95)].toFixed(1), over50ms: d.filter(x => x > 50).length }) } }; requestAnimationFrame(f) }));
    await ctx.close() }
  const ctx = await b.newContext(PHONE), p = await ctx.newPage(), errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(s.url); await p.waitForTimeout(2500); await click(p, '[data-tab="map"]'); await p.waitForTimeout(800); await p.screenshot({ path: path.join(OUT, "village.png") });
  R.places = await p.evaluate(() => [...document.querySelectorAll(".v-place")].map(e => { const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return `${e.dataset.place} ${Math.round(r.width)}x${Math.round(r.height)} ${r.top >= 0 && r.bottom <= innerHeight - 90 ? "on screen" : "OFF SCREEN"} ${t && (t === e || e.contains(t)) ? "tappable" : "COVERED"}` }));
  R.villagers = await p.evaluate(() => { const v = [...document.querySelectorAll(".v-folk,.v-walker")], pieces = v.map(e => PROJECTS[+e.dataset.piece] && PROJECTS[+e.dataset.piece].slug);
    const c = {}; pieces.forEach(x => c[x] = (c[x] || 0) + 1); return { count: v.length, differentPieces: Object.keys(c).length, byPiece: c } });
  R.running = await p.evaluate(() => { const g = {}; document.getAnimations().filter(a => a.playState === "running").forEach(a => { const t = a.effect.getTiming(); const k = (a.animationName || "js") + (t.iterations === Infinity ? " (endless)" : ""); g[k] = (g[k] || 0) + 1 }); return g });
  const t0 = Date.now(), opened = [];
  for (let i = 0; i < 3; i++) {
    const who = await p.evaluate(i => { const v = [...document.querySelectorAll(".v-folk,.v-walker")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top > 0 && r.bottom < innerHeight - 90 })[i * 2 % 10]; if (!v) return null; v.click(); return v.getAttribute("aria-label") }, i);
    await p.waitForTimeout(2500); await click(p, "#gSheet [data-see]"); await p.waitForTimeout(3000);
    opened.push([who, Date.now() - t0]); await click(p, "#lbClose"); await p.waitForTimeout(500); await click(p, "#gSheetX"); await p.waitForTimeout(800);
  }
  R.threeArtworks = opened;
  R.hire = await p.evaluate(() => ({ place: !!document.querySelector(".v-place.hire"), chip: [...document.querySelectorAll(".g-hire")].some(e => { const r = e.getBoundingClientRect(); if (!r.width) return false; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === e || e.contains(t)) }) }));
  R.listFallback = await p.evaluate(() => [...document.querySelectorAll("#g-map button")].some(e => /list|daftar/i.test(e.textContent)));
  R.errors = errs; await ctx.close();
  { const c2 = await b.newContext({ ...PHONE, reducedMotion: "reduce" }), q = await c2.newPage(); await q.goto(s.url); await q.waitForTimeout(2500); await click(q, '[data-tab="map"]'); await q.waitForTimeout(1500);
    R.reducedMotionRunning = await q.evaluate(() => document.getAnimations().filter(a => a.playState === "running").map(a => a.animationName || "js")); await c2.close() }
  { const c3 = await b.newContext(PHONE), q = await c3.newPage(); await q.clock.install({ time: new Date("2026-10-27T21:30:00") }); await q.goto(s.url); await q.clock.runFor(3000);
    await click(q, '[data-tab="map"]'); await q.clock.runFor(2000); await q.screenshot({ path: path.join(OUT, "village-night.png") });
    R.night = await q.evaluate(() => document.querySelector("#gMapWrap") && document.querySelector("#gMapWrap").classList.contains("night")); await c3.close() }
  console.log(JSON.stringify(R, null, 1)); await b.close(); s.close();
})();
