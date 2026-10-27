// Copies the static site into www/, the folder Capacitor packages into the app.
import { cpSync, rmSync, mkdirSync } from "node:fs";

rmSync("www", { recursive: true, force: true });
mkdirSync("www");
cpSync("index.html", "www/index.html");
cpSync("assets", "www/assets", { recursive: true });
console.log("Built www/");
