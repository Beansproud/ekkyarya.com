// Fallback text, loaded after js/data.js. t() and COPY (English and Indonesian) live in js/data.js and belong to the
// UX lead. This file only adds the English keys the game uses that COPY doesn't have yet; t() falls back to English
// for Indonesian. Placeholders use COPY's style: {name}, {n}, {title}, {url}. Move each key into COPY when it is reviewed.
(() => {
  const add = {
    "map.sub": "Tap any place to visit it",
    "art.title": "Art",
    "mine.sub": "Things you made here. They stay on this device.",
    "mine.colorings": "Your colorings",
    "mine.classic": "Classic website",
    "share.video": "Share as video",
    "share.video.making": "Making your video...",
    "share.video.saved": "Video saved, link copied",
    "dl.video": "Download video",
  };
  for (const k in add) if (!(k in COPY.en)) COPY.en[k] = add[k];
})();
