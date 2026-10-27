// Copies the static site into www/, the folder Capacitor packages into the app.
import { cpSync, rmSync, mkdirSync } from "node:fs";

rmSync("www", { recursive: true, force: true });
mkdirSync("www");
cpSync("index.html", "www/index.html");
for (const dir of ["css", "js", "assets"]) cpSync(dir, `www/${dir}`, { recursive: true });
console.log("Built www/");
// B15: warn while the contact details are still placeholders (the site must not go public like this).
import { readFileSync } from "node:fs";
const data = readFileSync("js/data.js", "utf8");
if (/example\.com/.test(data)) console.warn("WARNING: CONFIG.email is still a placeholder (example.com). Fill in js/data.js before launch.");
for (const m of data.matchAll(/"(https:\/\/[^"]+?)"/g)) if (!new URL(m[1]).pathname.replace(/\/+$/, "")) console.warn(`WARNING: ${m[1]} is a bare home page, not a profile link.`);
