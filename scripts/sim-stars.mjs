// Usage: node scripts/sim-stars.mjs [rounds]. Plays Star Catcher (B13) headlessly with the BALANCE object read from
// js/game.js, using the game's own spawn, fall and catch rules on a 390 x 664 phone field, and reports the scores of
// two players: "idle" (never moves) and "casual" (follows the next star it can reach, a bit late, and dodges most
// viruses). r1b acceptance: idle at most 12, casual between 30 and 55 on average. Exits 1 outside those bounds.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(ROOT, "js", "game.js"), "utf8");
const BALANCE = Function(`return ${src.match(/const BALANCE=(\{[\s\S]*?\}\});/)[1].replace(/\}\);$/, "})")}`)();
const ROUNDS = +process.argv[2] || 50, W = 390, H = 664, DT = 1 / 60, PY = H - 120;
let seed = 12345;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const lerp = ([a, b], k) => a + (b - a) * k;
const KINDS = { star: 1, palette: 3, glow: 5, virus: -BALANCE.hazardCost };

function round(player) {
  let t = BALANCE.seconds, spawn = 0, score = 0, px = W / 2, tx = W / 2, think = 0;
  const items = [];
  while (t > 0) {
    t -= DT; const prog = Math.min(1, 1 - t / BALANCE.seconds); spawn -= DT;
    if (spawn <= 0) {
      spawn = lerp(BALANCE.spawn, prog); let v;
      if (rnd() < lerp(BALANCE.hazardShare, prog)) v = KINDS.virus;
      else { const r = rnd(); v = r < BALANCE.mix.glow ? KINDS.glow : r < BALANCE.mix.glow + BALANCE.mix.palette ? KINDS.palette : KINDS.star }
      items.push({ v, x: 24 + rnd() * (W - 48), y: -30, s: lerp(BALANCE.speed, prog) + rnd() * BALANCE.speedRandom });
    }
    if (player === "casual" && (think -= DT) <= 0) {
      think = .3 + rnd() * .2;                       // reacts every 0.3 to 0.5 s
      const goal = items.filter(i => !i.dead && i.v > 0 && i.y < PY && (PY - i.y) / i.s > Math.abs(i.x - px) / 500)
        .sort((a, b) => (PY - a.y) / a.s - (PY - b.y) / b.s)[0];
      if (goal && rnd() < .8) tx = goal.x + (rnd() - .5) * 30;   // aims a little off, misses some
      const threat = items.find(i => !i.dead && i.v < 0 && Math.abs(i.x - tx) < 50 && i.y < PY && (PY - i.y) / i.s < .6);
      if (threat && rnd() < .7) tx = threat.x + (tx > threat.x ? 70 : -70);
      tx = Math.max(40, Math.min(W - 40, tx));
    }
    px += (tx - px) * Math.min(1, DT * 14);
    for (const i of items) {
      i.y += i.s * DT; const box = i.v < 0 ? BALANCE.catchHazard : BALANCE.catchStar;
      if (!i.dead && Math.abs(i.x - px) < box && Math.abs(i.y - (PY - 10)) < box) { i.dead = true; score = Math.max(0, score + i.v) }
    }
    for (let k = items.length - 1; k >= 0; k--) if (items[k].dead || items[k].y > H + 40) items.splice(k, 1);
  }
  return score;
}
const stats = p => { const s = Array.from({ length: ROUNDS }, () => round(p)); const avg = s.reduce((a, b) => a + b) / s.length;
  return { avg: +avg.toFixed(1), min: Math.min(...s), max: Math.max(...s) } };
const idle = stats("idle"), casual = stats("casual");
const ok = idle.avg <= 12 && casual.avg >= 30 && casual.avg <= 55;
console.log(JSON.stringify({ rounds: ROUNDS, BALANCE, idle, casual, pass: ok }));
process.exit(ok ? 0 : 1);
