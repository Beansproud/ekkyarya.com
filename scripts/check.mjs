// Usage: npm run check. Fails (exit 1) with a list of file:line locations when
//  1. an emoji or symbol glyph is left in index.html, css/ or js/ (icons come from assets/ui/ or the inline SVG set), or
//  2. a fan-art or client piece is referenced from UI code. Those pieces may appear only in the PROJECTS list in js/data.js.
//  3. UI code or the icon generator uses a piece from assets/work/ for which shareable(p) in js/data.js is false.
// No packages: Node built-ins only.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FORBIDDEN = [
  "one-piece-fan-art", "rocket-groot-fan-art", "spider-verse-fan-art", "adventure-time-fan-art", "godzilla-kong-fan-art", "game-pattern", "dnd",
  "indomaret", "bca-flazz-card", "pop-mie", "ancol-logo", "msi", "tea-break-website",
];
// Emoji, emoji variation selector, arrows, technical symbols, geometric shapes, misc symbols, dingbats, stars.
// Typography such as the copyright sign, dashes, the middle dot and the ellipsis is fine.
const GLYPH = /(?![©®™])[\p{Extended_Pictographic}\u{FE0F}\u{20E3}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25A0}-\u{27BF}\u{2900}-\u{297F}\u{2B00}-\u{2BFF}\u{1F000}-\u{1FAFF}]/gu;
const SLUG = new RegExp(`(?<![a-z0-9-])(${FORBIDDEN.join("|")})(?![a-z0-9-])`, "gi");

function files(dir, ext) {
  return readdirSync(dir).flatMap(n => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p, ext) : ext.some(e => n.endsWith(e)) ? [p] : [];
  });
}
const ui = [join(ROOT, "index.html"), ...files(join(ROOT, "css"), [".css"]), ...files(join(ROOT, "js"), [".js"])];
// The icon generator must not cut from those pieces either.
const iconSources = [join(ROOT, "scripts", "ui-assets.py")];

// slug -> shareable(p), computed by js/data.js itself (CONFIG.reuse and CONFIG.reuseBlock decide)
const data = vm.runInNewContext(readFileSync(join(ROOT, "js", "data.js"), "utf8") + ";({PROJECTS, shareable})", {});
// creative use needs shareable(p) and an original piece (js/features.js): client and fan pieces stay portfolio-only
const SHAREABLE = new Map(data.PROJECTS.map(p => [p.slug, data.shareable(p) === true && p.kind === "original"]));
const WORK = /assets\/work\/(?:thumb\/)?([a-z0-9-]+)\.\w+/gi;

const problems = [];
for (const f of [...ui, ...iconSources]) {
  const rel = relative(ROOT, f), lines = readFileSync(f, "utf8").split("\n");
  let inProjects = false;
  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;
    if (ui.includes(f)) for (const m of line.matchAll(GLYPH))
      problems.push(`${at}  glyph "${m[0]}" (U+${m[0].codePointAt(0).toString(16).toUpperCase()}): use an assets/ui icon or the inline SVG set`);
    if (rel === join("js", "data.js")) {
      if (/^\s*const PROJECTS\s*=\s*\[/.test(line)) inProjects = true;
      if (inProjects) { if (/^\s*\];/.test(line)) inProjects = false; return; }
    }
    // sticker sources (from:"slug") and coloring pages (slug:"slug") in the game code
    for (const m of line.matchAll(/\b(?:from|slug):"([a-z0-9-]+)"/g))
      if (SHAREABLE.get(m[1]) !== true) problems.push(`${at}  sticker or coloring page from "${m[1]}", which is not shareable`);
    for (const m of line.matchAll(WORK))
      if (SHAREABLE.get(m[1]) !== true) problems.push(`${at}  "${m[1]}" is not shareable (CONFIG.reuse / reuseBlock in js/data.js), so it can't be an icon, sticker or UI art`);
    for (const m of line.matchAll(SLUG))
      problems.push(`${at}  "${m[1]}" is a fan-art or client piece: it may appear only in the PROJECTS list`);
  });
}

// Roles (owner: "make sure all art work has its role"). Every piece is in the portfolio and is a game card; a
// shareable piece should also feed something made from it: an icon, a sticker, a coloring page or the lead six.
// The `roles` arrays in PROJECTS (UX lead, docs/roles.md) are the plan; the code-derived roles show what is built. Pieces with no such role are a warning, not a failure.
const roles = new Map(data.PROJECTS.map(p => [p.slug, new Set((p.roles || ["portfolio", "card"]).filter(r => SHAREABLE.get(p.slug) || ["portfolio", "card"].includes(r)))]));
const add = (slug, r) => roles.has(slug) && roles.get(slug).add(r);
for (const m of readFileSync(join(ROOT, "scripts", "ui-assets.py"), "utf8").matchAll(/^\s*"([a-z-]+)":\s*dict\(src="assets\/work\/([a-z0-9-]+)\./gm)) add(m[2], `icon (${m[1]})`);
const colorJs = readFileSync(join(ROOT, "js", "color.js"), "utf8");
for (const m of colorJs.matchAll(/src:"[^"]*\/([a-z0-9-]+)\.png",from:"([a-z0-9-]+)"/g)) add(m[2], `sticker (${m[1]})`);
for (const m of colorJs.matchAll(/\{id:"([a-z0-9-]+)",slug:"([a-z0-9-]+)"\}/g)) add(m[2], "coloring page");
const roleless = data.PROJECTS.filter(p => SHAREABLE.get(p.slug) && [...roles.get(p.slug)].every(r => ["portfolio", "card"].includes(r))).map(p => p.slug);
if (process.argv.includes("--roles")) {
  console.log("| Piece | Kind | Shareable | Roles |\n|---|---|---|---|");
  for (const p of data.PROJECTS) console.log(`| ${p.title} (\`${p.slug}\`) | ${p.kind} | ${SHAREABLE.get(p.slug) ? "yes" : "no"} | ${[...roles.get(p.slug)].join(", ")} |`);
  process.exit(0);
}

if (problems.length) {
  console.error(`check failed (${problems.length}):\n` + problems.map(p => "  " + p).join("\n"));
  process.exit(1);
}
if (roleless.length) console.warn(`warning: ${roleless.length} shareable pieces have no role beyond portfolio and game card yet: ${roleless.join(", ")}`);
console.log(`check passed: ${ui.length} UI files, no emoji or symbol glyphs, no fan-art or client pieces outside PROJECTS, UI and sticker art only from shareable pieces`);
