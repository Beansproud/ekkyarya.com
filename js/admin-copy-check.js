// Words tab checks (docs/admin.md, "Words"): house rules, Bahasa Indonesia checks, readability, English grammar through
// LanguageTool, the fit of a line in its real place on the phone, and the score of the 5-second impression test.
// Loaded by js/admin-copy.js after the PIN. Nothing here is saved: every result lives in this browser session only.
const AdminCopyCheck = (() => {
  const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/u;
  const PH = /\{(\w+)\}/g;
  const placeholders = s => [...String(s).matchAll(PH)].map(m => m[0]);
  const T = (en, id) => ({ en, id });

  // ---- words ----
  const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
  const words = s => String(s).replace(PH, "").match(WORD) || [];
  const sentences = s => String(s).replace(PH, "x").split(/(?<=[.!?])\s+|\n+/).map(x => x.trim()).filter(x => words(x).length);
  function syllables(w) {
    w = w.toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, "").replace(/^y/, "");
    const m = w.match(/[aeiouy]{1,2}/g);
    return Math.max(1, m ? m.length : 1);
  }
  // Flesch reading ease (English only); sentence and word length for both languages.
  function readability(text, lang) {
    const ws = words(text), ss = sentences(text);
    if (!ws.length) return null;
    const n = ss.length || 1, letters = ws.reduce((a, w) => a + w.replace(/[^\p{L}\p{N}]/gu, "").length, 0);
    const r = { words: ws.length, sentences: n, perSentence: +(ws.length / n).toFixed(1), perWord: +(letters / ws.length).toFixed(1), longest: Math.max(...(ss.length ? ss : [text]).map(x => words(x).length)), flesch: null };
    if (lang === "en" && ws.length >= 6) r.flesch = Math.round(206.835 - 1.015 * (ws.length / n) - 84.6 * (ws.reduce((a, w) => a + syllables(w), 0) / ws.length));
    return r;
  }

  // ---- Bahasa Indonesia: non-standard forms (KBBI) worth a second look. Ekky's casual voice (bikin, aja, bareng, ngobrol) is fine. ----
  const ID_FIX = {
    dimana: "di mana", kemana: "ke mana", darimana: "dari mana", disini: "di sini", disana: "di sana", disitu: "di situ",
    kesini: "ke sini", kesana: "ke sana", silahkan: "silakan", sekedar: "sekadar", praktek: "praktik", resiko: "risiko",
    nasehat: "nasihat", ijin: "izin", jaman: "zaman", kwalitas: "kualitas", aktifitas: "aktivitas", kreatifitas: "kreativitas",
    analisa: "analisis", merubah: "mengubah", antri: "antre", telpon: "telepon", trampil: "terampil", ketrampilan: "keterampilan",
    hakekat: "hakikat", jadual: "jadwal", obyek: "objek", subyek: "subjek", sistim: "sistem", tehnik: "teknik", tekhnik: "teknik",
    karir: "karier", kongkrit: "konkret", apapun: "apa pun", siapapun: "siapa pun",
    dimanapun: "di mana pun", kapanpun: "kapan pun", manapun: "mana pun", ilustarsi: "ilustrasi", karater: "karakter",
    krakter: "karakter", desaign: "desain", disain: "desain", projek: "proyek", mewarna: "mewarnai", terimakasih: "terima kasih",
    trimakasih: "terima kasih"
  };
  // English where Bahasa has its own word (soft: the owner may want the English one).
  const ID_LOAN = { download: "unduh", didownload: "diunduh", upload: "unggah", diupload: "diunggah", project: "proyek", copy: "salin", mengcopy: "menyalin" };
  // English words that read as English inside Indonesian text (soft: brand names and the game's names stay).
  const EN_IN_ID = new Set("the and you your with for of to is are this that my me we our it its from into about more new see open click tap here there now free get make made please thanks thank yes no not just like what when who how why which will can".split(" "));
  // Indonesian words that read as Indonesian inside English text.
  const ID_IN_EN = new Set("yang dan di ke dari untuk kamu aku saya ini itu dengan tidak karya gambar bikin aja juga sudah belum bisa akan atau kita kami mereka sini sana lagi banget nggak gak".split(" "));
  // Names and loanwords used on purpose in both languages.
  const NAMES = new Set("try ekky ekky's arya star catcher paint patrol doodle scene apk android app email whatsapp instagram behance linkedin dribbble tiktok youtube web website uncanny valley gmt wib morumelons ok oke".split(" "));

  const codeKey = k => /^term\./.test(k);   // the terminal: shell commands and spaced columns on purpose

  // ---- house rules and local checks. sev: "block" (cannot save), "warn" (an issue), "soft" (a gentle note) ----
  // ctx: {key, lang, part, builtin (this part's built-in text), all (whole field text)}
  function local(text, c) {
    const out = [], add = (sev, code, msg, at, len, fix) => out.push({ sev, code, msg, at, len, fix });
    const s = String(text), b = String(c.builtin == null ? "" : c.builtin), code = codeKey(c.key) && c.part === 0;
    if (!s.trim()) { add("soft", "empty", T("Empty: the built-in text is used.", "Kosong: teks bawaan yang dipakai.")); return out; }
    if (EMOJI.test(s)) add("block", "emoji", T("No emoji, please.", "Tanpa emoji, ya."));
    if (/[<>]/.test(s)) add("block", "markup", T("Plain text only: no < or >.", "Teks biasa saja: tanpa < atau >."));
    if (s.includes("|")) add("block", "pipe", T("| splits this line into parts. Use the separate boxes instead.", "| memecah baris ini. Pakai kotak yang terpisah."));
    const lost = placeholders(b).filter(p => !s.includes(p)), extra = placeholders(s).filter(p => !placeholders(b).includes(p));
    if (lost.length) add("block", "placeholder", T("Keep " + lost.join(" ") + ": the site fills it in.", "Pertahankan " + lost.join(" ") + ": situs yang mengisinya."));
    if (extra.length) add("block", "placeholder", T("Unknown " + extra.join(" ") + ": the site cannot fill it in.", "Tidak dikenal " + extra.join(" ") + ": situs tidak bisa mengisinya."));
    if (code) return out;
    if (/[!?]{2,}|!.*!/.test(s)) add("warn", "bang", T("One ! is plenty.", "Satu ! sudah cukup."));
    if (!codeKey(c.key)) { let m; const re = / {2,}/g; while ((m = re.exec(s))) add("warn", "space", T("Double space.", "Spasi ganda."), m.index, m[0].length, " "); }
    { let m; const re = /\s+([,.!?:;])/g; while ((m = re.exec(s))) if (!/\.\.\./.test(s.slice(m.index + m[0].length - 1, m.index + m[0].length + 2))) add("warn", "punct", T("Space before " + m[1] + ".", "Spasi sebelum " + m[1] + "."), m.index, m[0].length, m[1]); }
    { let m; const re = /\b(\p{L}+)\s+\1\b/giu; while ((m = re.exec(s))) add("warn", "repeat", T("Repeated word: " + m[1] + ".", "Kata berulang: " + m[1] + "."), m.index, m[0].length, m[1]); }
    { let m; const re = /([.!?])\s+(\p{Ll})/gu; while ((m = re.exec(s))) add("warn", "caps", T("Capital letter after " + m[1], "Huruf besar setelah " + m[1]), m.index + m[0].length - 1, 1, m[2].toUpperCase()); }
    if (/^\p{Ll}/u.test(s.trim()) && /^\p{Lu}/u.test(b.trim())) add("soft", "caps0", T("The built-in starts with a capital letter.", "Teks bawaan diawali huruf besar."), s.indexOf(s.trim()[0]), 1, s.trim()[0].toUpperCase());
    for (const x of sentences(s)) { const n = words(x).length; if (n > 20) add("warn", "long", T("Long sentence: " + n + " words. Aim for 20 or fewer.", "Kalimat panjang: " + n + " kata. Usahakan 20 atau kurang.")); }
    if (b && s.length > Math.max(24, b.length * 2)) add("warn", "length", T("Much longer than the built-in (" + s.length + " vs " + b.length + " letters).", "Jauh lebih panjang dari bawaan (" + s.length + " vs " + b.length + " huruf)."));
    const toks = []; { let m; const re = /[\p{L}][\p{L}'’]*/gu; while ((m = re.exec(s))) toks.push({ w: m[0], at: m.index }); }
    if (c.lang === "id") {
      for (const t of toks) {
        const lw = t.w.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(ID_FIX, lw) && ID_FIX[lw]) {
          const fix = /^\p{Lu}/u.test(t.w) ? ID_FIX[lw][0].toUpperCase() + ID_FIX[lw].slice(1) : ID_FIX[lw];
          add("warn", "baku", T("Standard form: " + fix + ".", "Bentuk baku: " + fix + "."), t.at, t.w.length, fix);
        }
        else if (ID_LOAN[lw]) add("soft", "loan", T("Bahasa has its own word: " + ID_LOAN[lw] + ".", "Ada kata Bahasa-nya: " + ID_LOAN[lw] + "."), t.at, t.w.length, ID_LOAN[lw]);
        if (EN_IN_ID.has(lw) && !NAMES.has(lw) && !b.toLowerCase().split(/\W+/).includes(lw)) add("soft", "mixed", T("English word in Bahasa: " + t.w + ".", "Kata Inggris dalam Bahasa: " + t.w + "."), t.at, t.w.length);
      }
    } else {
      for (const t of toks) { const lw = t.w.toLowerCase(); if (ID_IN_EN.has(lw) && !NAMES.has(lw) && !b.toLowerCase().split(/\W+/).includes(lw)) add("soft", "mixed", T("Indonesian word in English: " + t.w + ".", "Kata Indonesia dalam bahasa Inggris: " + t.w + "."), t.at, t.w.length); }
    }
    return out;
  }

  // ---- LanguageTool (https://api.languagetool.org, the free public API: about 20 requests and 75 KB a minute) ----
  const LT_URL = "https://api.languagetool.org/v2/check";
  const LIMIT = { reqs: 18, bytes: 60000, chunk: 6000 };
  const sent = [];   // [time, bytes] in the last minute
  const cache = new Map();   // text -> matches (session only)
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function waitFor(bytes) {
    const now = Date.now();
    while (sent.length && now - sent[0][0] > 60000) sent.shift();
    const used = sent.reduce((a, x) => a + x[1], 0);
    if (sent.length < LIMIT.reqs && used + bytes <= LIMIT.bytes) return 0;
    return Math.max(250, 60000 - (now - sent[0][0]) + 50);
  }
  // One request for several texts joined by blank lines; the matches are mapped back to each text.
  async function ltRequest(texts, signal, onWait) {
    const SEP = "\n\n";
    let joined = "", starts = [];
    for (const x of texts) { starts.push(joined.length); joined += x + SEP; }
    const bytes = new TextEncoder().encode(joined).length;
    for (let w; (w = waitFor(bytes)); ) { if (onWait) onWait(Math.ceil(w / 1000)); await sleep(Math.min(w, 1000)); if (signal && signal.aborted) throw new DOMException("stopped", "AbortError"); }
    sent.push([Date.now(), bytes]);
    const body = new URLSearchParams({ text: joined, language: "en-US", enabledOnly: "false" });
    const r = await fetch(LT_URL, { method: "POST", body, signal, headers: { Accept: "application/json" } });
    if (r.status === 429) { const e = new Error("rate"); e.rate = true; throw e; }
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    const per = texts.map(() => []);
    for (const m of j.matches || []) {
      let i = starts.length - 1; while (i > 0 && starts[i] > m.offset) i--;
      const at = m.offset - starts[i], text = texts[i];
      if (at < 0 || at + m.length > text.length) continue;
      per[i].push({ at, len: m.length, bad: text.substr(at, m.length), msg: m.message || m.shortMessage || "", short: m.shortMessage || "",
        fixes: (m.replacements || []).slice(0, 5).map(x => x.value), rule: (m.rule && m.rule.id) || "", kind: (m.rule && m.rule.issueType) || "" });
    }
    return per;
  }
  // Drop matches that sit on a {placeholder}, or on the spaced columns of the terminal.
  const keep = (text, m, key) => !placeholders(text).some(p => { const i = text.indexOf(p); return i >= 0 && m.at < i + p.length && i < m.at + m.len; })
    && !(codeKey(key) && /WHITESPACE|DOUBLE_SPACE/i.test(m.rule));
  // items: [{key, text}] -> Map text -> matches. Cached texts are not sent again. onProgress(done, total, waitSeconds).
  async function grammar(items, opt = {}) {
    const todo = [...new Set(items.map(x => x.text).filter(x => x && x.trim() && !cache.has(x)))];
    const chunks = []; let cur = [], size = 0;
    for (const x of todo) { if (size + x.length > LIMIT.chunk && cur.length) { chunks.push(cur); cur = []; size = 0; } cur.push(x); size += x.length + 2; }
    if (cur.length) chunks.push(cur);
    let done = 0;
    for (const ch of chunks) {
      if (opt.signal && opt.signal.aborted) break;
      let per;
      try { per = await ltRequest(ch, opt.signal, w => opt.onProgress && opt.onProgress(done, chunks.length, w)); }
      catch (e) {
        if (!e.rate) throw e;
        sent.push(...Array(LIMIT.reqs).fill([Date.now(), 0]));   // LanguageTool asked to slow down: wait out the minute, then once more
        per = await ltRequest(ch, opt.signal, w => opt.onProgress && opt.onProgress(done, chunks.length, w));
      }
      ch.forEach((x, i) => cache.set(x, per[i]));
      done++; if (opt.onProgress) opt.onProgress(done, chunks.length, 0);
    }
    const out = new Map();
    for (const it of items) if (cache.has(it.text)) out.set(it.text, cache.get(it.text).filter(m => keep(it.text, m, it.key)));
    return out;
  }
  const cached = (text, key) => cache.has(text) ? cache.get(text).filter(m => keep(text, m, key)) : null;

  // ---- fit: the line rendered in its real place on the site, in a hidden phone-sized frame (360 and 390 px wide) ----
  const SAMPLE = { n: "12", name: "Dina", title: "Little Planet", caption: "First sketch", host: "ekkyarya.com", url: "https://ekkyarya.com", best: "42" };
  const fill = s => String(s).replace(PH, (m, k) => SAMPLE[k] || "Ekky");
  const frames = {};
  function frame(w) {
    if (frames[w]) return frames[w];
    frames[w] = new Promise((res, rej) => {
      const f = document.createElement("iframe");
      f.setAttribute("aria-hidden", "true"); f.tabIndex = -1; f.title = "fit " + w;
      f.style.cssText = `position:fixed;left:-${w + 4000}px;top:0;width:${w}px;height:780px;border:0;visibility:hidden;pointer-events:none`;
      f.src = "index.html?game=1&intro&fit=" + w;
      const to = setTimeout(() => rej(new Error("timeout")), 20000);
      f.onload = () => setTimeout(() => {
        clearTimeout(to);
        const win = f.contentWindow;
        try { win.eval("try{termTyped=true;renderTerm()}catch(e){};try{if(typeof warmHire==='function')warmHire()}catch(e){}"); } catch (e) {}
        res(win);
      }, 1500);
      document.body.appendChild(f);
    });
    frames[w].catch(() => { delete frames[w]; });
    return frames[w];
  }
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const partRe = s => new RegExp("^" + escRe(String(s).trim()).replace(/\\\{\w+\\\}/g, ".+?") + "$");
  // Find the text node that shows this part of the key: [data-t] first, then any text equal to the key's current text.
  function findNode(win, key, part) {
    const doc = win.document;
    if (part === 0) for (const el of doc.querySelectorAll(`[data-t="${CSS.escape(key)}"]`)) { const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim()); if (tn) return tn; }
    let C; try { C = win.eval("COPY"); } catch (e) { return null; }
    const cands = [];
    for (const l of ["en", "id"]) { const v = C[l] && C[l][key]; const parts = Array.isArray(v) ? v : typeof v === "string" ? v.split("|") : []; if (parts[part] && parts[part].trim().length > 1) cands.push(partRe(parts[part])); }
    if (!cands.length) return null;
    const tw = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode()); ) { const v = n.nodeValue.trim(); if (v && cands.some(r => r.test(v)) && !n.parentElement.closest("script,style,title,noscript")) return n; }
    return null;
  }
  // Lines a text takes in place, and whether it spills out of its box or the screen.
  function lay(win, node, text) {
    const old = node.nodeValue; node.nodeValue = text;
    const r = win.document.createRange(); r.selectNodeContents(node);
    const tops = new Set([...r.getClientRects()].filter(x => x.width > 0).map(x => Math.round(x.top)));
    const box = r.getBoundingClientRect();
    let spill = box.right > win.innerWidth + 1 || box.left < -1;
    for (let el = node.parentElement, i = 0; el && i < 3 && !spill; el = el.parentElement, i++) {
      const cs = win.getComputedStyle(el);
      if (/hidden|clip|auto|scroll/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1) spill = true;
    }
    node.nodeValue = old;
    return { lines: tops.size, spill };
  }
  // Shown for the measure, then hidden again: the screens, sheets and [hidden] parts around the node.
  function reveal(win, node) {
    const doc = win.document, undo = [];
    const inGame = !!node.parentElement.closest("#game");
    const body = doc.body, html = doc.documentElement;
    if (inGame !== body.classList.contains("game-mode")) { body.classList.toggle("game-mode", inGame); undo.push(() => body.classList.toggle("game-mode", !inGame)); }
    if (!inGame && html.classList.contains("pre-game")) { html.classList.remove("pre-game"); undo.push(() => html.classList.add("pre-game")); }
    for (let el = node.parentElement; el && el !== body; el = el.parentElement) {
      if (el.hidden) { el.hidden = false; undo.push(() => { el.hidden = true; }); }
      if (el.classList.contains("g-screen") && !el.classList.contains("active")) { el.classList.add("active"); undo.push(() => el.classList.remove("active")); }
      if (win.getComputedStyle(el).display === "none") { const p = el.style.getPropertyValue("display"), pr = el.style.getPropertyPriority("display"); el.style.setProperty("display", "block", "important"); undo.push(() => el.style.setProperty("display", p, pr)); }
    }
    return () => undo.reverse().forEach(f => f());
  }
  // fit(key, parts: [{part, now, def}]) -> {360: [{part, found, def, now, spill}], 390: [...]}; never throws.
  async function fit(key, parts) {
    const out = {};
    for (const w of [360, 390]) {
      let win; try { win = await frame(w); } catch (e) { out[w] = null; continue; }
      out[w] = parts.map(p => {
        const node = findNode(win, key, p.part);
        if (!node) return { part: p.part, found: false };
        const back = reveal(win, node);
        try { const d = lay(win, node, fill(p.def)), n = lay(win, node, fill(p.now)); return { part: p.part, found: true, def: d.lines, now: n.lines, spill: n.spill && !d.spill }; }
        catch (e) { return { part: p.part, found: false }; }
        finally { back(); }
      });
    }
    return out;
  }
  const screenReader = k => /(^|\.)aria$|Aria$/.test(k);

  // ---- the 5-second test: which key words came back ----
  const STOP = new Set(("the and you your with for that this from what when then they them their have will just like into about there here more some over only also than very been were does make made into each every much such were your you're i'm it's don't won't can't " +
    "yang dan di ke dari untuk kamu aku saya ini itu dengan tidak juga sudah akan atau kita kami mereka bisa lalu bikin yang aja lagi buat jadi dulu").split(/\s+/));
  const norm = w => w.toLowerCase().replace(/[’']/g, "'").replace(/'s$/, "").replace(/[^\p{L}\p{N}$]/gu, "");
  function lev(a, b) { if (Math.abs(a.length - b.length) > 1) return 2; const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
  const near = (k, t) => k === t || (k.length >= 4 && t.length >= 4 && (k.startsWith(t.slice(0, Math.max(4, t.length - 2))) || t.startsWith(k.slice(0, Math.max(4, k.length - 2))))) || (k.length >= 5 && lev(k, t) <= 1);
  function recall(shown, typed) {
    const keys = [...new Set(words(shown).map(norm).filter(w => (w.length >= 4 || /\d/.test(w)) && !STOP.has(w)))];
    const got = words(typed).map(norm).filter(Boolean);
    const hit = keys.filter(k => got.some(t => near(k, t))), missed = keys.filter(k => !hit.includes(k));
    return { keys, hit, missed, pct: keys.length ? Math.round(100 * hit.length / keys.length) : 0 };
  }

  return { local, readability, grammar, cached, fit, screenReader, recall, placeholders, codeKey, EMOJI, LT_URL, _cache: cache };
})();
