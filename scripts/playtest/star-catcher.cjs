// node scripts/playtest/star-catcher.cjs [site dir] [rounds]
// Plays Star Catcher rounds in the real build without touching the screen (an idle player) and prints each result.
// With the tuned BALANCE an idle round should score about 5 to 20: moving under the stars has to matter.
const { chromium, serve, PHONE, click } = require("./lib.cjs");
const path = require("path"), SITE = path.resolve(process.argv[2] || "."), N = +(process.argv[3] || 3);
(async () => {
  const s = await serve(SITE), b = await chromium.launch();
  const one = async () => { const p = await (await b.newContext(PHONE)).newPage(); await p.goto(s.url); await p.waitForTimeout(2000);
    if (!await click(p, "[data-arcade]")) return "no Star Catcher button";
    await p.waitForTimeout(3600 + 30500);
    return p.evaluate(() => ({ score: (document.getElementById("gResScore") || {}).textContent, title: (document.getElementById("gResTitle") || {}).textContent, text: (document.getElementById("gResText") || {}).textContent })) };
  console.log(JSON.stringify(await Promise.all(Array.from({ length: N }, one)), null, 1)); await b.close(); s.close();
})();
