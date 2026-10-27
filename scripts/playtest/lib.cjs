// Shared helpers for the playtest drivers: a static file server (canvas export and share need http://, not file://),
// the phone and desktop contexts, slow-4G and CPU throttling, and a JS click that works even under overlays.
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium, devices } = require("playwright");
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp", ".mp4": "video/mp4", ".webmanifest": "application/manifest+json" };

function serve(dir) {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      let f = path.join(dir, decodeURIComponent(q.url.split("?")[0]));
      if (f.endsWith(path.sep) || f.endsWith("/")) f += "index.html";
      fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); r.end(d) });
    }).listen(0, () => res({ url: `http://localhost:${srv.address().port}/`, close: () => srv.close() }));
  });
}
const PHONE = devices["iPhone 13"], DESKTOP = { viewport: { width: 1440, height: 900 } };
async function slow4g(ctx, page) { const c = await ctx.newCDPSession(page); await c.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }); }
async function cpu(ctx, page, rate = 4) { const c = await ctx.newCDPSession(page); await c.send("Emulation.setCPUThrottlingRate", { rate }); }
const click = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.click(); return true }, sel);
// Replace navigator.share so a run can read what would be shared (text, url and the file as base64).
const captureShare = ctx => ctx.addInitScript(() => {
  navigator.canShare = () => true;
  navigator.share = async d => { const f = d.files && d.files[0]; let b64 = null;
    if (f) { const buf = await f.arrayBuffer(); let s = ""; new Uint8Array(buf).forEach(c => s += String.fromCharCode(c)); b64 = btoa(s) }
    window.__shared = { text: d.text, url: d.url, file: f && { name: f.name, type: f.type, size: f.size }, b64 } };
});
// Color the Giraffe like a first-time visitor and return the coloring link the share would send.
async function colorAndShare(page, base, { fills = 10, pause = 700, log = () => {} } = {}) {
  await page.goto(base); await page.waitForSelector('[data-go="color"]', { state: "visible" });
  await page.click('[data-go="color"]'); log("Color tile");
  await page.click('#cPages [data-page="giraffe"]'); log("Giraffe page"); await page.waitForTimeout(1200);
  const box = await (await page.$("#cCanvas")).boundingBox();
  const spots = [[.5, .12], [.35, .45], [.55, .6], [.7, .3], [.3, .8], [.62, .4], [.45, .25], [.2, .5], [.8, .7], [.5, .9]];
  for (let i = 0; i < fills; i++) { const sw = await page.$$(".c-colors button"); if (sw.length) await sw[i % Math.min(8, sw.length)].click();
    const [x, y] = spots[i % spots.length]; await page.mouse.click(box.x + box.width * x, box.y + box.height * y); await page.waitForTimeout(pause) }
  log(`${fills} fills`);
  await page.click("#cDone"); log("Done"); await page.waitForTimeout(1200);
  await page.click("#cShare"); log("Share (reveal)"); await page.waitForTimeout(1000);
  await page.click("#sGo"); log("Share (preview)");
  await page.waitForFunction(() => window.__shared, { timeout: 10000 });
  return page.evaluate(() => window.__shared);
}
const linkFrom = (shared, base) => { const u = (shared.text.match(/https?:\/\/\S+/) || [])[0]; return u && u.replace(/^https?:\/\/[^/]+\/?/, base) };
module.exports = { chromium, serve, PHONE, DESKTOP, slow4g, cpu, click, captureShare, colorAndShare, linkFrom };
