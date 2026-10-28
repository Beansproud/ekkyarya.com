// Admin settings tabs (docs/admin.md): Links, Settings, Text, Messages. Loaded by js/admin.js after the PIN.
// Each tab edits a copy of data/site.json through ctx.setData(next) (the whole object); ctx.publish() commits it.
// ctx.getData() returns the current object (ctx.data is accepted too). Built-in values come from ctx.builtin when the
// loader keeps them, else from CONFIG, FEATURES and COPY.
const AdminSettings = (() => {
const LINKS = [
  ["instagram", "Instagram", "Hire sheet, Yours and the website", "Lembar Hubungi Ekky, Buatanmu dan situs"],
  ["behance", "Behance", "Yours and the website", "Buatanmu dan situs"],
  ["linkedin", "LinkedIn", "Yours and the website", "Buatanmu dan situs"],
  ["website", "Website", "Yours and the website", "Buatanmu dan situs"],
  ["tiktok", "TikTok", "Yours and the website", "Buatanmu dan situs"],
  ["youtube", "YouTube", "Yours and the website", "Buatanmu dan situs"],
  ["x", "X", "Yours and the website", "Buatanmu dan situs"]
];
const FEATURE_TEXT = {
  starCatcher: ["Star Catcher game", "Game Star Catcher", "The star-catching arcade game.", "Game arkade menangkap bintang."],
  stickers: ["Stickers", "Stiker", "Ekky's sticker tray when coloring.", "Baki stiker Ekky saat mewarnai."],
  doodleScene: ["Blank page to doodle on", "Halaman kosong untuk corat-coret", "Start from scratch with stickers and colors.", "Mulai dari nol dengan stiker dan warna."],
  anyColor: ["Any color picker", "Pilih warna bebas", "A swatch that opens the phone's color picker.", "Kotak warna yang membuka pemilih warna HP."],
  shareCards: ["Share image", "Gambar untuk dibagikan", "Make a picture of a coloring and share it.", "Buat gambar dari hasil mewarnai lalu bagikan."],
  shareVideo: ["Share as video", "Bagikan sebagai video", "A short clip that replays the coloring.", "Klip singkat yang memutar ulang mewarnai."],
  challengeLinks: ["Star Catcher challenge links", "Tautan tantangan Star Catcher", "Send a friend your score to beat.", "Kirim skormu ke teman untuk dikalahkan."],
  holoCards: ["Shiny cards on tilt", "Kartu berkilau saat dimiringkan", "Foil shine that follows the phone's tilt.", "Kilau foil yang mengikuti kemiringan HP."],
  pwa: ["Install the app", "Pasang aplikasi", "The add-to-home-screen button and offline use.", "Tombol pasang ke layar utama dan pemakaian offline."],
  pageRoadTrip: ["Coloring page: Road Trip", "Halaman mewarnai: Road Trip", "Show this page in the coloring list.", "Tampilkan halaman ini di daftar mewarnai."],
  pageMonster: ["Coloring page: Monster", "Halaman mewarnai: Monster", "Show this page in the coloring list.", "Tampilkan halaman ini di daftar mewarnai."],
  pagePlugHero: ["Coloring page: Plug Hero", "Halaman mewarnai: Plug Hero", "Show this page in the coloring list.", "Tampilkan halaman ini di daftar mewarnai."],
  pageLittlePlanet: ["Coloring page: Little Planet", "Halaman mewarnai: Little Planet", "Show this page in the coloring list.", "Tampilkan halaman ini di daftar mewarnai."],
  pageHands: ["Coloring page: Tangled Hands", "Halaman mewarnai: Tangled Hands", "Show this page in the coloring list.", "Tampilkan halaman ini di daftar mewarnai."],
  pageNoodles: ["Coloring page: Noodle Bath", "Halaman mewarnai: Noodle Bath", "Show this page in the coloring list.", "Tampilkan halaman ini di daftar mewarnai."],
  pageShark: ["Coloring page: Big Catch", "Halaman mewarnai: Big Catch", "Show this page in the coloring list.", "Tampilkan halaman ini di daftar mewarnai."],
  apkDownload: ["Android app button", "Tombol aplikasi Android", "The APK chip on the start page, Android only.", "Chip APK di halaman awal, khusus Android."],
  artDownload: ["Download button on art", "Tombol unduh di karya", "Lets visitors save a small copy of a piece.", "Pengunjung bisa menyimpan salinan kecil karya."],
  sound: ["Sound", "Suara", "Sound effects and the sound button.", "Efek suara dan tombol suara."],
  handLettering: ["Ekky's hand lettering", "Tulisan tangan Ekky", "Headings drawn by hand. Turn on when the sheet is in.", "Judul gambar tangan. Nyalakan saat lembarnya sudah ada."],
  aboutPhoto: ["Photo in About", "Foto di About", "Turn on when the photo is in.", "Nyalakan saat fotonya sudah ada."],
  clientScenery: ["Client pieces as village scenery", "Karya klien sebagai pemandangan desa", "Only after the owner confirms.", "Hanya setelah pemilik menyetujui."]
};
const HTTPS = /^https:\/\/[^\s/$.?#][^\s]*$/i;
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMOJI = /[\p{Extended_Pictographic}\u200d\uFE0F]/u;
const lang = ctx => ctx.lang || (document.documentElement.lang === "id" ? "id" : "en");
const pick = (ctx, en, id) => lang(ctx) === "id" ? id : en;
const data = ctx => (ctx.getData ? ctx.getData() : ctx.data) || {};
const clone = o => JSON.parse(JSON.stringify(o || {}));
const builtin = ctx => ctx.builtin || { config: CONFIG, features: FEATURES, copy: COPY };

function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
    if (k === "class") e.className = attrs[k];
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
  }
  kids.flat().forEach(c => c != null && e.append(c.nodeType ? c : document.createTextNode(c)));
  return e;
}
// edit(fn): apply fn to a clone of the data and hand the result to ctx.setData
const edit = (ctx, fn) => { const d = clone(data(ctx)); fn(d); ctx.setData(d); };
const field = (id, label, input, note, msg) => h("div", { class: "as-field" },
  h("label", { class: "as-label", for: id }, label), input, note ? h("p", { class: "as-note" }, note) : null, msg);

function textInput(id, value, placeholder, type) {
  return h("input", { class: "as-in", id, type: type || "text", value: value || "", placeholder: placeholder || "", autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
}
// A checked input: valid or empty values go to onValid, anything else shows the message and changes nothing.
function checked(input, msg, test, bad, onValid) {
  input.addEventListener("input", () => {
    const v = input.value.trim(), ok = v === "" || test(v);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    msg.textContent = ok ? "" : bad;
    if (ok) onValid(v);
  });
}

function linksTab(el, ctx) {
  const d = data(ctx), b = builtin(ctx).config;
  el.replaceChildren(
    h("p", { class: "as-intro" }, pick(ctx, "Full https links only. Leave a box empty to use the built-in link.", "Hanya tautan https lengkap. Kosongkan kotak untuk memakai tautan bawaan.")),
    ...LINKS.map(([k, name, en, id]) => {
      const msg = h("p", { class: "as-err", role: "alert" });
      const input = textInput("as-link-" + k, (d.links || {})[k], (b.links || {})[k] || (k === "website" ? b.website : "") || "https://", "url");
      checked(input, msg, v => HTTPS.test(v), pick(ctx, "Needs to start with https://", "Harus diawali https://"),
        v => edit(ctx, x => { x.links = x.links || {}; x.links[k] = v; }));
      return field("as-link-" + k, name, input, pick(ctx, "Shows in: " + en, "Tampil di: " + id), msg);
    }));
}

function settingsTab(el, ctx) {
  const d = data(ctx), b = builtin(ctx), price = (d.contact || {}).priceLine || {};
  const mailMsg = h("p", { class: "as-err", role: "alert" });
  const mail = textInput("as-email", (d.contact || {}).email, b.config.email, "email");
  checked(mail, mailMsg, v => MAIL.test(v), pick(ctx, "That does not look like an email address.", "Itu tidak terlihat seperti alamat email."),
    v => edit(ctx, x => { x.contact = x.contact || {}; x.contact.email = v; }));
  const priceIn = l => {
    const msg = h("p", { class: "as-err", role: "alert" });
    const input = textInput("as-price-" + l, price[l], (b.copy[l] || {})["hire.price"] || "");
    checked(input, msg, v => !EMOJI.test(v), pick(ctx, "No emoji, please.", "Tanpa emoji, ya."),
      v => edit(ctx, x => { x.contact = x.contact || {}; x.contact.priceLine = x.contact.priceLine || {}; x.contact.priceLine[l] = v; }));
    return field("as-price-" + l, pick(ctx, "Price line (" + l.toUpperCase() + ")", "Baris harga (" + l.toUpperCase() + ")"), input, null, msg);
  };
  const feats = Object.keys(b.features).map(k => {
    const [en, id, den, did] = FEATURE_TEXT[k] || [k, k, "", ""];
    const on = (d.features || {})[k] !== undefined ? d.features[k] : b.features[k];
    const box = h("input", { type: "checkbox", class: "as-check", id: "as-feat-" + k, checked: on });
    box.addEventListener("change", () => edit(ctx, x => {
      x.features = x.features || {};
      if (box.checked === b.features[k]) delete x.features[k]; else x.features[k] = box.checked;
    }));
    return h("label", { class: "as-switch", for: "as-feat-" + k }, box,
      h("span", { class: "as-switch-text" }, h("strong", null, pick(ctx, en, id)), h("span", { class: "as-note" }, pick(ctx, den, did))));
  });
  el.replaceChildren(
    field("as-email", pick(ctx, "Contact email", "Email kontak"), mail,
      pick(ctx, "Hire Ekky opens this address. Empty uses the built-in one.", "Hire Ekky membuka alamat ini. Kosong memakai bawaan."), mailMsg),
    priceIn("en"), priceIn("id"),
    h("h3", { class: "as-h" }, pick(ctx, "Features", "Fitur")),
    h("p", { class: "as-intro" }, pick(ctx, "Turn a feature off and it disappears from the site completely.", "Matikan fitur dan ia hilang sepenuhnya dari situs.")),
    h("div", { class: "as-switches" }, feats));
}

function textTab(el, ctx) {
  const b = builtin(ctx).copy, keys = Object.keys(b.en || {}).filter(k => typeof b.en[k] === "string").sort();   // keys that hold a function are not editable text
  const search = h("input", { class: "as-in", id: "as-search", type: "search", placeholder: pick(ctx, "Search a key or a word", "Cari kunci atau kata"), autocomplete: "off" });
  const list = h("div", { class: "as-rows" });
  const cur = (d, l, k) => ((d.copy || {})[l] || {})[k];
  const draw = () => {
    const q = search.value.trim().toLowerCase(), d = data(ctx);
    const hits = keys.filter(k => !q || k.toLowerCase().includes(q) || (b.en[k] || "").toLowerCase().includes(q) || String(b.id[k] || "").toLowerCase().includes(q));
    list.replaceChildren(...hits.slice(0, 30).map(k => row(k, d)),
      h("p", { class: "as-note" }, hits.length > 30 ? pick(ctx, hits.length + " matches, showing 30. Search more to narrow.", hits.length + " cocok, 30 ditampilkan. Cari lebih spesifik.")
        : hits.length ? pick(ctx, hits.length + " matches", hits.length + " cocok") : pick(ctx, "Nothing found.", "Tidak ditemukan.")));
  };
  const row = (k, d) => {
    const msg = h("p", { class: "as-err", role: "alert" });
    const areas = ["en", "id"].map(l => {
      const a = h("textarea", { class: "as-in as-area", id: `as-t-${l}-${k}`, rows: "3", lang: l });
      a.value = cur(d, l, k) ?? (b[l] || {})[k] ?? "";
      a.addEventListener("input", () => {
        const bad = EMOJI.test(a.value);
        a.setAttribute("aria-invalid", bad ? "true" : "false");
        msg.textContent = bad ? pick(ctx, "No emoji, please.", "Tanpa emoji, ya.") : "";
        if (bad) return;
        edit(ctx, x => {
          x.copy = x.copy || {}; x.copy[l] = x.copy[l] || {};
          if (a.value === (b[l] || {})[k]) delete x.copy[l][k]; else x.copy[l][k] = a.value;
        });
      });
      return h("div", { class: "as-col" }, h("label", { class: "as-label", for: a.id }, l.toUpperCase()), a);
    });
    const reset = h("button", { type: "button", class: "as-btn", onclick: () => {
      edit(ctx, x => { ["en", "id"].forEach(l => { if (x.copy && x.copy[l]) delete x.copy[l][k]; }); });
      areas.forEach((c, i) => { c.querySelector("textarea").value = (b[["en", "id"][i]] || {})[k] ?? ""; });
      msg.textContent = "";
    } }, pick(ctx, "Reset to built-in text", "Kembalikan ke teks bawaan"));
    return h("section", { class: "as-row" }, h("code", { class: "as-key" }, k), h("div", { class: "as-cols" }, areas), msg, reset);
  };
  search.addEventListener("input", draw);
  el.replaceChildren(
    h("p", { class: "as-intro" }, pick(ctx, "Change any line of the site, in English and Indonesian side by side.", "Ubah baris mana pun di situs, bahasa Inggris dan Indonesia berdampingan.")),
    field("as-search", pick(ctx, "Find text", "Cari teks"), search), list);
  draw();
}

function messagesTab(el, ctx) {
  const email = (data(ctx).contact || {}).email || builtin(ctx).config.email;
  el.replaceChildren(
    h("p", { class: "as-intro" }, "With GitHub as the backend, this site has nowhere to receive messages. When someone fills in Hire Ekky, the message arrives by email."),
    h("p", { class: "as-intro", lang: "id" }, "Dengan GitHub sebagai backend, situs ini tidak punya tempat menerima pesan. Saat seseorang mengisi Hire Ekky, pesannya masuk lewat email."),
    email ? h("a", { class: "as-btn as-primary", href: "mailto:" + email }, pick(ctx, "Open the mailbox (" + email + ")", "Buka kotak surat (" + email + ")"))
      : h("p", { class: "as-err" }, pick(ctx, "Add a contact email in Settings first.", "Tambahkan email kontak di Pengaturan dulu.")),
    h("p", { class: "as-note" }, pick(ctx, "A real inbox inside admin needs a backend, which comes later.", "Kotak masuk sungguhan di admin butuh backend, nanti.")));
}

function register(Admin) {
  Admin.registerTab("links", { title: "Links", render: linksTab });
  Admin.registerTab("settings", { title: "Settings", render: settingsTab });
  Admin.registerTab("text", { title: "Text", render: textTab });
  Admin.registerTab("messages", { title: "Messages", render: messagesTab });
}
if (typeof Admin !== "undefined" && Admin.registerTab) register(Admin);
return { register, linksTab, settingsTab, textTab, messagesTab, HTTPS };
})();
