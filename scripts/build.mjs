// Copies the static site into www/, the folder Capacitor packages into the app.
import { cpSync, rmSync, mkdirSync } from "node:fs";

rmSync("www", { recursive: true, force: true });
mkdirSync("www");
cpSync("index.html", "www/index.html");
for (const dir of ["css", "js", "assets"]) cpSync(dir, `www/${dir}`, { recursive: true });
console.log("Built www/");
