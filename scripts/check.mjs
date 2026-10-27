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
const SHAREABLE = new Map(data.PROJECTS.map(p => [p.slug, data.shareable(p) === true]));
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
    for (const m of line.matchAll(WORK))
      if (SHAREABLE.get(m[1]) !== true) problems.push(`${at}  "${m[1]}" is not shareable (CONFIG.reuse / reuseBlock in js/data.js), so it can't be an icon, sticker or UI art`);
    for (const m of line.matchAll(SLUG))
      problems.push(`${at}  "${m[1]}" is a fan-art or client piece: it may appear only in the PROJECTS list`);
  });
}

if (problems.length) {
  console.error(`check failed (${problems.length}):\n` + problems.map(p => "  " + p).join("\n"));
  process.exit(1);
}
console.log(`check passed: ${ui.length} UI files, no emoji or symbol glyphs, no fan-art or client pieces outside PROJECTS, UI and sticker art only from shareable pieces`);
