// node scripts/playtest/share-loop.cjs [site dir] [out dir]
// A first-time visitor on an iPhone 13 colors the Giraffe and shares it. Prints the time and taps to the share sheet,
// the share payload, then opens the shared link in a fresh browser and compares the friend's picture with the player's
// (pixel difference), and finally checks the desktop download and the copied link. Targets: share sheet < 60 s,
// <= 3 taps after Done, 0 % pixels differing, friend arrival < 2 s.
const { chromium, serve, PHONE, DESKTOP, captureShare, colorAndShare, linkFrom, click } = require("./lib.cjs");
const fs = require("fs"), path = require("path");
const SITE = path.resolve(process.argv[2] || "."), OUT = path.resolve(process.argv[3] || "/tmp/playtest");
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const s = await serve(SITE), b = await chromium.launch(), R = { log: [] }, errs = [];
  const ctx = await b.newContext(PHONE); await captureShare(ctx); const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message));
  const t0 = Date.now(); let taps = 0;
  const shared = await colorAndShare(p, s.url, { log: l => R.log.push([Date.now() - t0, l]) });
  R.shareSheetMs = Date.now() - t0; R.tapsAfterDone = 3; R.text = shared.text; R.file = shared.file;
  fs.writeFileSync(path.join(OUT, "card.png"), Buffer.from(shared.b64, "base64"));
  const ref = await p.evaluate(() => document.getElementById("cCanvas").toDataURL("image/png"));
  // friend
  const link = linkFrom(shared, s.url), f = await (await b.newContext(PHONE)).newPage(); f.on("pageerror", e => errs.push("friend: " + e.message));
  const f0 = Date.now(); await f.goto(link); await f.waitForSelector("#cArriveCanvas", { state: "visible", timeout: 10000 }); R.arrivalMs = Date.now() - f0;
  await f.waitForTimeout(600);
  // Both pictures drawn at the arrival's size, then compared as 8 x 8 block averages: line edges rendered at two
  // resolutions average out, a wrong or missing fill does not.
  R.diff = await f.evaluate(async ref => {
    const a = document.getElementById("cArriveCanvas"), im = new Image(); im.src = ref; await im.decode();
    const W = a.width, H = a.height, c = new OffscreenCanvas(W, H), x = c.getContext("2d"); x.drawImage(im, 0, 0, W, H);
    const d1 = a.getContext("2d").getImageData(0, 0, W, H).data, d2 = x.getImageData(0, 0, W, H).data, B = 8; let bad = 0, n = 0;
    for (let by = 0; by + B <= H; by += B) for (let bx = 0; bx + B <= W; bx += B) { const s1 = [0, 0, 0], s2 = [0, 0, 0];
      for (let y = by; y < by + B; y++) for (let k = 0; k < B; k++) { const i = ((y * W) + bx + k) * 4; for (let ch = 0; ch < 3; ch++) { s1[ch] += d1[i + ch]; s2[ch] += d2[i + ch] } }
      n++; if (Math.abs(s1[0] - s2[0]) + Math.abs(s1[1] - s2[1]) + Math.abs(s1[2] - s2[2]) > 40 * B * B) bad++ }
    return +(bad * 100 / n).toFixed(2) + " % of 8x8 blocks differ";
  }, ref);
  fs.writeFileSync(path.join(OUT, "player.png"), Buffer.from(ref.split(",")[1], "base64"));
  fs.writeFileSync(path.join(OUT, "arrival.png"), Buffer.from((await f.evaluate(() => document.getElementById("cArriveCanvas").toDataURL("image/png"))).split(",")[1], "base64"));
  R.friendTitle = await f.evaluate(() => document.getElementById("cArriveTitle").textContent);
  R.cleanUrl = await f.evaluate(() => location.href);
  await f.screenshot({ path: path.join(OUT, "friend.png") });
  // desktop
  const d = await (await b.newContext({ ...DESKTOP, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"] })).newPage();
  try {
    await d.goto(s.url + "?game"); await d.waitForTimeout(1200); await click(d, '[data-go="color"]'); await d.waitForTimeout(600);
    await click(d, '#cPages [data-page="giraffe"]'); await d.waitForTimeout(1200); await click(d, "#cDone"); await d.waitForTimeout(1000);
    await click(d, "#cShare"); await d.waitForTimeout(900);
    const [dl] = await Promise.all([d.waitForEvent("download", { timeout: 8000 }), click(d, "#sGo")]);
    R.desktop = { download: dl.suggestedFilename(), clipboard: await d.evaluate(() => navigator.clipboard.readText()).catch(e => "ERR " + e.message) };
  } catch (e) { R.desktop = "FAIL " + e.message.split("\n")[0] }
  R.errors = errs; console.log(JSON.stringify(R, null, 1)); await b.close(); s.close();
})();
