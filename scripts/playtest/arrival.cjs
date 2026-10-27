// node scripts/playtest/arrival.cjs [site dir] [runs]
// How fast a friend's coloring link shows, on a fast connection and on emulated slow 4G (150 ms, 1.6 Mbit/s).
// Makes a fresh coloring link first, then per run: when the arrival is drawn, when the loader is under 50 % opacity
// (the coloring shows through) and when it is gone. Targets: < 2 s fast, < 3 s slow 4G (loader under 50 %).
const { chromium, serve, PHONE, slow4g, captureShare, colorAndShare, linkFrom } = require("./lib.cjs");
const path = require("path"), SITE = path.resolve(process.argv[2] || "."), RUNS = +(process.argv[3] || 3);
(async () => {
  const s = await serve(SITE), b = await chromium.launch();
  const c0 = await b.newContext(PHONE); await captureShare(c0); const link = linkFrom(await colorAndShare(await c0.newPage(), s.url, { fills: 4, pause: 300 }), s.url); await c0.close();
  console.log("link", link);
  for (const net of ["fast", "slow4g"]) for (let i = 0; i < RUNS; i++) {
    const ctx = await b.newContext(PHONE), p = await ctx.newPage(); if (net === "slow4g") await slow4g(ctx, p);
    const t0 = Date.now(), m = {}; await p.goto(link, { waitUntil: "commit" });
    for (let k = 0; k < 300; k++) {
      const st = await p.evaluate(() => { const l = document.getElementById("loader"), a = document.getElementById("cArrive"), o = l ? +getComputedStyle(l).opacity : 0;
        return { arrive: !!a && a.classList.contains("active"), op: l && getComputedStyle(l).visibility !== "hidden" ? o : 0 } }).catch(() => ({}));
      const t = Date.now() - t0; if (st.arrive && !m.arrive) m.arrive = t; if (m.arrive && st.op < .5 && !m.half) m.half = t; if (m.arrive && st.op < .05 && !m.gone) m.gone = t;
      if (m.gone) break; await p.waitForTimeout(50);
    }
    console.log(net, JSON.stringify(m)); await ctx.close();
  }
  await b.close(); s.close();
})();
