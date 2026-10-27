// Portfolio data, loaded first. Shared by js/site.js (desktop portfolio) and js/game.js (phone game).
/* ===== Edit these: real contact details and portfolio entries ===== */
const CONFIG = {
  email: "hello@example.com",                 // TODO: real email
  links: { instagram: "https://instagram.com/", dribbble: "https://dribbble.com/", behance: "https://behance.net/" }, // TODO: real profiles
  // Which kinds of piece may take creative roles (sticker, coloring, sprite, level, scene, share, featured, avatar).
  // Every piece always keeps its portfolio and card roles, whatever these say.
  // original and client: Ekky's own work (owner, "yes to all": client pieces may be reused too, with their "Client: X" tag kept).
  // fan: characters belong to their owners; always off, portfolio and card only.
  reuse: { original: true, client: true, fan: false },
  reuseBlock: []                              // slugs to keep out of reuse later, e.g. ["morumelons"]
};
// Portfolio: img = thumbnail, full = large version for the lightbox, desc = one-line caption,
// kind = "original" | "client" | "fan" (see CONFIG.reuse),
// label = tag shown with the piece: "Fan art", "Client: <name>", "Client work" or "Competition entry: <name>" (use plabel(p)),
// id = Indonesian title and description (use ptitle(p) and pdesc(p)),
// roles = where the piece is used (owner: "make sure all artwork has its role"; see docs/roles.md):
//   portfolio  classic grid and lightbox           card      Art tab in the game
//   featured   pool for the rotating featured row  share     share-card art and card gifts
//   coloring   coloring page (line layer)          sticker   source of sticker cut-outs (B21)
//   sprite     Star Catcher sprite                 level     map level or menu art
//   scene      Doodle Scene backdrop               avatar    Ekky avatar candidate (owner question 1)
// Computed below: slug, own, rar (card frame: 0..3 by the number of creative roles; not a ranking).
const PROJECTS = [
  {"cat": "illustration", "title": "Coexistence", "desc": "Rush hour at a bus stop where monsters and people share the bench.", "img": "assets/work/thumb/coexistence.jpg", "full": "assets/work/coexistence.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker"], "id": {"title": "Hidup Berdampingan", "desc": "Jam sibuk di halte, monster dan manusia berbagi bangku yang sama."}},
  {"cat": "illustration", "title": "Hidden Monster", "desc": "Two kids sneak into a monster lair, and the treasure chest bites back.", "img": "assets/work/thumb/hidden-monster.jpg", "full": "assets/work/hidden-monster.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker"], "id": {"title": "Monster Tersembunyi", "desc": "Dua anak menyelinap ke sarang monster, dan peti hartanya malah menggigit."}},
  {"cat": "illustration", "title": "The Blue Bird", "desc": "A hiker meets a glowing bird on a night trail.", "img": "assets/work/thumb/blue-bird.jpg", "full": "assets/work/blue-bird.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sprite", "scene"], "id": {"title": "Si Burung Biru", "desc": "Seorang pendaki bertemu burung bercahaya di jalur malam."}},
  {"cat": "illustration", "title": "Broken-Down Bus", "desc": "A bear, a lion driver and a caped hero wait out a breakdown.", "img": "assets/work/thumb/old-bus.jpg", "full": "assets/work/old-bus.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker"], "id": {"title": "Bus Mogok", "desc": "Beruang, sopir singa, dan pahlawan berjubah menunggu bus yang mogok."}},
  {"cat": "illustration", "title": "Monster Snack Bar", "desc": "Lunch rush at a fast-food counter for monsters.", "img": "assets/work/thumb/monster-crowd.jpg", "full": "assets/work/monster-crowd.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker"], "id": {"title": "Kedai Jajan Monster", "desc": "Jam makan siang yang ramai di konter makanan cepat saji khusus monster."}},
  {"cat": "illustration", "title": "Monster World Doodles", "desc": "A full page of monsters, aliens and hand lettering.", "img": "assets/work/thumb/doodles.jpg", "full": "assets/work/doodles.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "level", "sticker"], "id": {"title": "Coretan Dunia Monster", "desc": "Satu halaman penuh monster, alien, dan huruf tulisan tangan."}},
  {"cat": "illustration", "title": "Monster in My Room", "desc": "A kid stands up to a giant one-eyed roommate.", "img": "assets/work/thumb/monster.jpg", "full": "assets/work/monster.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "level", "sticker"], "id": {"title": "Monster di Kamarku", "desc": "Seorang anak berani melawan teman sekamar raksasa bermata satu."}},
  {"cat": "illustration", "title": "Afloat", "desc": "A lazy summer float with fish, a beach ball and a stray can.", "img": "assets/work/thumb/floating-boy.jpg", "full": "assets/work/floating-boy.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "coloring", "scene"], "id": {"title": "Mengapung", "desc": "Santai mengapung di musim panas bersama ikan, bola pantai, dan kaleng nyasar."}},
  {"cat": "illustration", "title": "Buried at the Beach", "desc": "Summer at the beach, from the point of view of the kid in the sand.", "img": "assets/work/thumb/summertime.jpg", "full": "assets/work/summertime.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "scene", "sticker"], "id": {"title": "Terkubur di Pantai", "desc": "Musim panas di pantai, dari sudut pandang anak yang terkubur pasir."}},
  {"cat": "illustration", "title": "Viking vs Dragon Kid", "desc": "Two tiny heroes duel on a cliff, sparks flying.", "img": "assets/work/thumb/beansproud-vs-puff.jpg", "full": "assets/work/beansproud-vs-puff.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "coloring", "sticker"], "id": {"title": "Viking vs Bocah Naga", "desc": "Dua pahlawan mungil adu tanding di tebing, percikan api di mana-mana."}},
  {"cat": "illustration", "title": "Virus and War", "desc": "Two crises fight over one burning planet.", "img": "assets/work/thumb/virus-and-war.jpg", "full": "assets/work/virus-and-war.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sprite", "sticker"], "id": {"title": "Virus dan Perang", "desc": "Dua krisis berebut satu planet yang terbakar."}},
  {"cat": "illustration", "title": "RPG", "desc": "An orc, a mouse knight and a fire spirit face an armored giant.", "img": "assets/work/thumb/rpg.jpg", "full": "assets/work/rpg.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker"], "id": {"title": "RPG", "desc": "Orc, ksatria tikus, dan roh api menghadapi raksasa berbaju zirah."}},
  {"cat": "illustration", "title": "Big Catch", "desc": "Fishing goes wrong when the fish is the bait.", "img": "assets/work/thumb/shark.jpg", "full": "assets/work/shark.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "coloring", "sticker"], "id": {"title": "Tangkapan Besar", "desc": "Memancing jadi kacau saat ikannya justru jadi umpan."}},
  {"cat": "illustration", "title": "Giraffe Ride", "desc": "A kid hitches a ride on a friendly giraffe.", "img": "assets/work/thumb/giraffe.jpg", "full": "assets/work/giraffe.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "coloring", "sticker"], "id": {"title": "Naik Jerapah", "desc": "Seorang anak menumpang jerapah yang ramah."}},
  {"cat": "illustration", "title": "Noodle Bath", "desc": "A kid soaks in a bowl of ramen that walks on noodle legs.", "img": "assets/work/thumb/noodles.jpg", "full": "assets/work/noodles.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "coloring", "sticker"], "id": {"title": "Mandi Mi", "desc": "Seorang anak berendam di semangkuk ramen yang berjalan dengan kaki mi."}},
  {"cat": "illustration", "title": "Astronaut", "desc": "An astronaut from Morumelons, Ekky's NFT collection.", "img": "assets/work/thumb/nft-3.jpg", "full": "assets/work/nft-3.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "level", "sticker"], "id": {"title": "Astronaut", "desc": "Astronaut dari Morumelons, koleksi NFT milik Ekky."}},
  {"cat": "illustration", "title": "Radio Explorer", "desc": "A radio explorer from Morumelons, Ekky's NFT collection.", "img": "assets/work/thumb/nft-9.jpg", "full": "assets/work/nft-9.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker"], "id": {"title": "Penjelajah Radio", "desc": "Penjelajah radio dari Morumelons, koleksi NFT milik Ekky."}},
  {"cat": "illustration", "title": "The Adventuring Party", "desc": "A tabletop party marches into the snow, dice flying. Fan art. Characters belong to their owners.", "img": "assets/work/thumb/dnd.jpg", "full": "assets/work/dnd.jpg", "kind": "fan", "roles": ["portfolio", "card"], "label": "Fan art", "id": {"title": "Rombongan Petualang", "desc": "Rombongan petualang berbaris ke salju, dadu beterbangan. Fan art. Karakternya milik pemiliknya masing-masing."}},
  {"cat": "illustration", "title": "Retro Game Pattern", "desc": "A repeat pattern of classic video game icons. Fan art. Characters belong to their owners.", "img": "assets/work/thumb/game-pattern.jpg", "full": "assets/work/game-pattern.jpg", "kind": "fan", "roles": ["portfolio", "card"], "label": "Fan art", "id": {"title": "Pola Game Retro", "desc": "Pola berulang dari ikon-ikon video game klasik. Fan art. Karakternya milik pemiliknya masing-masing."}},
  {"cat": "illustration", "title": "One Piece Crew", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/thumb/one-piece-fan-art.jpg", "full": "assets/work/one-piece-fan-art.jpg", "kind": "fan", "roles": ["portfolio", "card"], "label": "Fan art", "id": {"title": "Kru One Piece", "desc": "Fan art. Karakternya milik pemiliknya masing-masing."}},
  {"cat": "illustration", "title": "Rocket & Groot", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/thumb/rocket-groot-fan-art.jpg", "full": "assets/work/rocket-groot-fan-art.jpg", "kind": "fan", "roles": ["portfolio", "card"], "label": "Fan art", "id": {"title": "Rocket & Groot", "desc": "Fan art. Karakternya milik pemiliknya masing-masing."}},
  {"cat": "illustration", "title": "Miles Morales", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/thumb/spider-verse-fan-art.jpg", "full": "assets/work/spider-verse-fan-art.jpg", "kind": "fan", "roles": ["portfolio", "card"], "label": "Fan art", "id": {"title": "Miles Morales", "desc": "Fan art. Karakternya milik pemiliknya masing-masing."}},
  {"cat": "illustration", "title": "Godzilla vs Kong", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/thumb/godzilla-kong-fan-art.jpg", "full": "assets/work/godzilla-kong-fan-art.jpg", "kind": "fan", "roles": ["portfolio", "card"], "label": "Fan art", "id": {"title": "Godzilla vs Kong", "desc": "Fan art. Karakternya milik pemiliknya masing-masing."}},
  {"cat": "illustration", "title": "Finn & Jake: Bring It On", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/adventure-time-fan-art.gif", "full": "assets/work/adventure-time-fan-art.gif", "kind": "fan", "roles": ["portfolio", "card"], "label": "Fan art", "id": {"title": "Finn & Jake: Bring It On", "desc": "Fan art. Karakternya milik pemiliknya masing-masing."}},
  {"cat": "web", "title": "Morumelons", "desc": "Landing page art for Morumelons, Ekky's own NFT character collection.", "img": "assets/work/thumb/morumelons.jpg", "full": "assets/work/morumelons.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker", "scene"], "id": {"title": "Morumelons", "desc": "Ilustrasi landing page untuk Morumelons, koleksi karakter NFT milik Ekky sendiri."}},
  {"cat": "web", "title": "Oasis for Fizzy Tube", "desc": "A desert party around a soda maker, for the web.", "img": "assets/work/thumb/oasis.jpg", "full": "assets/work/oasis.jpg", "kind": "client", "roles": ["portfolio", "card", "featured", "share", "sticker", "scene"], "label": "Client: Fizzy Tube", "id": {"title": "Oasis untuk Fizzy Tube", "desc": "Pesta di gurun di sekitar mesin soda, untuk web."}},
  {"cat": "web", "title": "Character Crowd Banner", "desc": "A wide web banner packed with characters.", "img": "assets/work/thumb/web-illustration.jpg", "full": "assets/work/web-illustration.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker"], "id": {"title": "Banner Kerumunan Karakter", "desc": "Banner web lebar yang penuh karakter."}},
  {"cat": "web", "title": "MSI Creator Banner", "desc": "A creator at work, surrounded by the monsters in their head.", "img": "assets/work/thumb/msi.jpg", "full": "assets/work/msi.jpg", "kind": "client", "roles": ["portfolio", "card", "featured", "share", "sticker"], "label": "Client: MSI", "id": {"title": "Banner Kreator MSI", "desc": "Seorang kreator sedang berkarya, dikelilingi monster dari dalam kepalanya."}},
  {"cat": "web", "title": "Tea Break Website", "desc": "Website design for a bubble tea brand.", "img": "assets/work/thumb/tea-break-website.jpg", "full": "assets/work/tea-break-website.jpg", "kind": "client", "roles": ["portfolio", "card", "featured", "share"], "label": "Client: Tea Break", "id": {"title": "Situs Tea Break", "desc": "Desain situs untuk brand bubble tea."}},
  {"cat": "web", "title": "My Sports Club App", "desc": "App design for a sports club's members and fees.", "img": "assets/work/thumb/my-sports-club.jpg", "full": "assets/work/my-sports-club.jpg", "kind": "client", "roles": ["portfolio", "card", "featured", "share"], "label": "Client work", "id": {"title": "Aplikasi My Sports Club", "desc": "Desain aplikasi untuk anggota dan iuran klub olahraga."}},
  {"cat": "branding", "title": "Save Early, Buy Future", "desc": "A poster about saving today for the life you want later.", "img": "assets/work/thumb/save-early-buy-future.jpg", "full": "assets/work/save-early-buy-future.jpg", "kind": "client", "roles": ["portfolio", "card", "featured", "share", "sticker"], "label": "Client work", "id": {"title": "Save Early, Buy Future", "desc": "Poster tentang menabung hari ini untuk hidup yang kamu mau nanti."}},
  {"cat": "branding", "title": "Indomaret Shopping Rush", "desc": "A busy street of shoppers heading to Indomaret.", "img": "assets/work/thumb/indomaret.jpg", "full": "assets/work/indomaret.jpg", "kind": "client", "roles": ["portfolio", "card", "featured", "share", "sticker"], "label": "Client: Indomaret", "id": {"title": "Serbu Indomaret", "desc": "Jalanan ramai penuh pembeli yang menuju Indomaret."}},
  {"cat": "branding", "title": "Thinker & Doer", "desc": "Lettering packed with tiny scenes of people at work.", "img": "assets/work/thumb/thinker-doer.jpg", "full": "assets/work/thinker-doer.jpg", "kind": "client", "roles": ["portfolio", "card", "featured", "share"], "label": "Client work", "id": {"title": "Thinker & Doer", "desc": "Huruf-huruf yang penuh adegan kecil orang sedang bekerja."}},
  {"cat": "branding", "title": "Plug Hero Mascot", "desc": "A cheerful mascot who runs on a wind-up key.", "img": "assets/work/thumb/plug-hero.jpg", "full": "assets/work/plug-hero.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "coloring", "sticker"], "id": {"title": "Maskot Plug Hero", "desc": "Maskot ceria yang berjalan dengan kunci putar."}},
  {"cat": "branding", "title": "Monster Noodles Cup", "desc": "A noodle-cup design where a kaiju takes a hot bath. Fan art. Characters belong to their owners.", "img": "assets/work/thumb/pop-mie.jpg", "full": "assets/work/pop-mie.jpg", "kind": "fan", "roles": ["portfolio", "card"], "label": "Fan art", "id": {"title": "Cup Mi Monster", "desc": "Desain cup mi tempat kaiju berendam air panas. Fan art. Karakternya milik pemiliknya masing-masing."}},
  {"cat": "branding", "title": "BCA Flazz Card", "desc": "Card art: astronauts on a snack break.", "img": "assets/work/thumb/bca-flazz-card.jpg", "full": "assets/work/bca-flazz-card.jpg", "kind": "client", "roles": ["portfolio", "card", "featured", "share", "sticker"], "label": "Client: BCA", "id": {"title": "Kartu BCA Flazz", "desc": "Ilustrasi kartu: para astronaut sedang istirahat ngemil."}},
  {"cat": "branding", "title": "Ancol Logo Entry", "desc": "An entry for Ancol's Indonesia 77 logo contest.", "img": "assets/work/thumb/ancol-logo.jpg", "full": "assets/work/ancol-logo.jpg", "kind": "client", "roles": ["portfolio", "card", "featured", "share", "sticker"], "label": "Competition entry: Ancol", "id": {"title": "Karya Lomba Logo Ancol", "desc": "Karya untuk lomba logo Indonesia 77 dari Ancol."}},
  {"cat": "branding", "title": "Toybox Packaging", "desc": "A box wrapped in Ekky's doodles.", "img": "assets/work/thumb/toybox.jpg", "full": "assets/work/toybox.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker"], "id": {"title": "Kemasan Toybox", "desc": "Kotak yang dibungkus coretan Ekky."}},
  {"cat": "branding", "title": "Type Is Art in Motion", "desc": "Animated hand lettering.", "img": "assets/work/type-is-art.gif", "full": "assets/work/type-is-art.gif", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "level"], "id": {"title": "Type Is Art, Bergerak", "desc": "Huruf tulisan tangan yang beranimasi."}},
  {"cat": "branding", "title": "Secret Android", "desc": "A friendly face that opens to reveal a robot.", "img": "assets/work/android.gif", "full": "assets/work/android.gif", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "avatar", "sticker"], "id": {"title": "Android Rahasia", "desc": "Wajah ramah yang terbuka dan ternyata robot."}},
  {"cat": "social", "title": "Year of the Tiger 2022", "desc": "A New Year post: racing into the year of the tiger.", "img": "assets/work/thumb/hello-2022.jpg", "full": "assets/work/hello-2022.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "sticker"], "id": {"title": "Tahun Macan 2022", "desc": "Unggahan Tahun Baru: melaju ke tahun macan."}},
  {"cat": "social", "title": "Little Planet", "desc": "Ekky at his desk on his own little planet.", "img": "assets/work/thumb/little-planet.jpg", "full": "assets/work/little-planet.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "avatar", "level", "coloring", "sticker"], "id": {"title": "Planet Kecil", "desc": "Ekky di mejanya, di planet kecilnya sendiri."}},
  {"cat": "social", "title": "Road Trip", "desc": "Five friends and a cat squeezed into one happy little car.", "img": "assets/work/thumb/road-trip.jpg", "full": "assets/work/road-trip.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "coloring", "sticker"], "id": {"title": "Jalan-jalan", "desc": "Lima sahabat dan seekor kucing berdesakan di satu mobil kecil yang ceria."}},
  {"cat": "social", "title": "A Day in the Life", "desc": "Four panels of an ordinary, cozy day.", "img": "assets/work/thumb/day-in-life.jpg", "full": "assets/work/day-in-life.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "level", "coloring"], "id": {"title": "Sehari-hari", "desc": "Empat panel tentang satu hari biasa yang hangat."}},
  {"cat": "social", "title": "Merdeka 77", "desc": "Indonesia's 77th Independence Day, by bicycle.", "img": "assets/work/thumb/kemerdekaan.jpg", "full": "assets/work/kemerdekaan.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "coloring", "sticker"], "id": {"title": "Merdeka 77", "desc": "Hari Kemerdekaan Indonesia ke-77, naik sepeda."}},
  {"cat": "social", "title": "Tangled Hands", "desc": "A happy knot of hands with nowhere to go.", "img": "assets/work/thumb/hands.jpg", "full": "assets/work/hands.jpg", "kind": "original", "roles": ["portfolio", "card", "featured", "share", "coloring"], "id": {"title": "Tangan Kusut", "desc": "Simpul tangan yang riang dan tidak ke mana-mana."}}
];
// slug = file name; own = may take creative roles. Pieces that may not lose every role but portfolio and card.
const BASE_ROLES=["portfolio","card"];
PROJECTS.forEach(p=>{
  p.slug=p.full.split("/").pop().replace(/\.\w+$/,"");
  p.own=!!CONFIG.reuse[p.kind]&&!CONFIG.reuseBlock.includes(p.slug);
  if(!p.own)p.roles=p.roles.filter(r=>BASE_ROLES.includes(r));
  p.rar=Math.min(3,p.roles.filter(r=>!["portfolio","card","featured","share"].includes(r)).length);
});
const shareable=p=>p.own===true;
const hasRole=(p,role)=>p.roles.includes(role);
const withRole=role=>PROJECTS.filter(p=>hasRole(p,role));
// Featured row (start screen) and desktop strip: owner, "no need to curate the best artwork".
// A fresh random pick of n pieces with the featured role on every visit, at most 2 per category.
function featuredPick(n=6){
  const pool=withRole("featured").slice();
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  const per={},out=[];
  for(const p of pool){if(out.length>=n)break;if((per[p.cat]=(per[p.cat]||0)+1)<=2)out.push(p)}
  return out;
}
const CAT_ICON={all:"assets/cat-all.png",illustration:"assets/cat-illustration.png",web:"assets/cat-web.png",branding:"assets/cat-branding.png",social:"assets/cat-social.png"};
const CAT_NAME={illustration:"Project Based Illustration",web:"Web & UI Design",branding:"Branding & Product Design",social:"Social Media"};
const CAT_NAME_ID={illustration:"Ilustrasi Proyek",web:"Desain Web & UI",branding:"Branding & Desain Produk",social:"Media Sosial"};

// Every user-facing string (B14), in English (en) and Indonesian (id). Placeholders in braces are filled by t():
// {name} {n} {title} {url}. Rules: short and warm, no emoji; Ekky is "he" ("ia" in Indonesian).
// The Indonesian is written for Indonesian readers, not translated word for word.
const COPY = {
  en: {
    // Start screen (D11)
    "start.tagline": "Ekky Arya draws characters that make people smile.",
    "start.role": "Illustrator and graphic designer",
    "start.featured": "A few of Ekky's drawings",
    "start.color": "Color",
    "start.catch": "Catch stars",
    "start.explore": "Explore",
    "start.classic": "Just show me the art",
    // Map and levels (D3, D7)
    "map.title": "Try Ekky",
    "level.1": "Who is Ekky?",
    "level.2": "Color with Ekky",
    "level.3": "Art Collection",
    "level.4": "Doodle to Done",
    "level.5": "Final Quest: Work with Ekky",
    "level.next": "Next",
    // Who is Ekky? and About (B26)
    "about.title": "About Ekky",
    "about.body": "Ekky is an illustrator from Indonesia. He fills worlds with characters: kids on adventures, monsters on their lunch break, little planets with someone working late. His work is bright, bold and a bit silly, and he likes it when one drawing tells a whole story.",
    "about.fact.from": "Illustrator from Indonesia",
    "about.fact.lang": "Works in Indonesian and English",
    "about.fact.hours": "Available evenings to night, WIB (GMT+7)",
    "about.fact.price": "Projects from $25",
    "about.workedWith": "Worked with Sequis, Intiland, Viar, pbTaxand, Honshu, Suapi and Bima.",
    // Tabs
    "tab.art": "Art",
    "tab.mine": "Mine",
    "art.free": "Every piece is free to look at. Tap one to see it big.",
    "mine.title": "Made by you",
    "mine.empty": "Nothing here yet. Color a drawing or build a scene, and it will wait for you here.",
    "mine.best": "Your best Star Catcher run: {n} stars",
    "mine.sound": "Sound",
    "mine.vibration": "Vibration",
    "mine.reset": "Clear what I made",
    "mine.resetConfirm": "Clear your colorings, scenes and best run on this device?",
    // Coloring (B10) and creative mode (B21)
    "color.title": "Color with Ekky",
    "color.intro": "Pick a drawing. Ekky brought the colors.",
    "color.hint": "Tap a shape to fill it",
    "color.anyColor": "Any color",
    "color.undo": "Undo",
    "color.peek": "Peek at Ekky's colors",
    "color.done": "Done",
    "color.reveal": "Yours and Ekky's",
    "color.praise": "Looks great! Share it or save it?",
    "color.scratch": "Start from scratch",
    "scene.title": "Doodle Scene",
    "scene.hint": "Drag Ekky's doodles onto the page",
    "sticker.tray": "Stickers",
    "sticker.bin": "Drag here to remove",
    "sticker.full": "That's 12 stickers, the most one picture can hold.",
    // Star Catcher (B13)
    "stars.title": "Star Catcher",
    "stars.rule": "Catch the stars, dodge the viruses.",
    "stars.timeUp": "Time's up!",
    "stars.score": "You caught {n} stars",
    "stars.best": "Your best: {n}",
    "stars.newBest": "New best!",
    "stars.again": "Play again",
    "stars.other": "Something else",
    "stars.challenge": "Challenge a friend",
    // Hire Ekky (B07, B17)
    "hire.chip": "Hire Ekky",
    "hire.chipAria": "Hire Ekky, send a message",
    "hire.title": "Final Quest: Work with Ekky",
    "hire.body": "Tell Ekky about your project. He works evenings to night, WIB (GMT+7).",
    "hire.price": "Projects from $25",
    "hire.email": "Email Ekky",
    "hire.whatsapp": "WhatsApp Ekky",
    "hire.copy": "Copy email",
    "hire.copied": "Email copied",
    "hire.formTitle": "Or send a quick note",
    "hire.name": "Your name",
    "hire.type": "Project type",
    "hire.types": ["Character design", "Book or editorial", "Brand and packaging", "Web or app art", "Something else"],
    "hire.message": "Your project",
    "hire.messageHint": "What are you making, and when do you need it?",
    "hire.send": "Send to Ekky",
    "hire.sent": "Quest complete! Ekky will be in touch soon.",
    // Lightbox (both views)
    "lb.hire": "Want art like this? Hire Ekky",
    "lb.prefill": "Hi Ekky, I saw \"{title}\" on your site and ",
    "lb.download": "Download",
    "lb.downloadNote": "A smaller copy with the ekkyarya.com mark. Please credit Ekky Arya when you post it.",
    // Share and download (B11, B12, B40, D9, D10)
    "share.button": "Share",
    "dl.button": "Download",
    "dl.story": "Story size",
    "dl.square": "Square",
    "dl.saved": "Saved to your downloads",
    "share.signIt": "Sign it (optional)",
    "share.signHint": "Your first name",
    "share.saved": "Image saved, link copied",
    "share.copied": "Link copied",
    "share.credit": "Illustrated by Ekky Arya",
    "share.creditFull": "Illustrated by Ekky Arya · ekkyarya.com",
    "share.colored": "Colored by {name}",
    "share.made": "Made by {name}",
    "share.cta": "Your turn: ekkyarya.com",
    "share.textColor": "I colored a drawing by Ekky Arya. Your turn: {url}",
    "share.textScene": "I made a scene out of Ekky Arya's doodles. Make yours: {url}",
    "share.textChallenge": "{name} caught {n} stars in Ekky's Star Catcher. Can you beat that? {url}",
    "arrive.colored": "{name} colored Ekky's {title}",
    "arrive.coloredAnon": "A friend colored Ekky's {title}",
    "arrive.scene": "{name} made this scene from Ekky's doodles",
    "arrive.sceneAnon": "A friend made this scene from Ekky's doodles",
    "arrive.yours": "Color your own",
    "arrive.explore": "Explore",
    // App and language (B37, B41)
    "app.install": "Install the app",
    "app.android": "Get the Android app",
    "lang.label": "Language",
    "lang.en": "English",
    "lang.id": "Bahasa Indonesia",
    // Desktop and classic site
    "hero.hi": "Hi, I'm Ekky Arya",
    "hero.title": "I draw characters that make people smile.",
    "hero.sub": "Illustrator and graphic designer from Indonesia. Picture books, mascots, packaging, web art and games.",
    "hero.hire": "Hire Ekky",
    "hero.work": "See my work",
    "hero.game": "Try the game",
    "strip.title": "From the sketchbook",
    "contact.title": "Let's make something together",
    "contact.body": "Got a character, a book, a mascot or a campaign in mind? Tell me about it. Projects start at $25.",
    // Tags (plabel)
    "tag.fan": "Fan art",
    "tag.client": "Client: {name}",
    "tag.clientWork": "Client work",
    "tag.entry": "Competition entry: {name}",
    "tag.fanNote": "Fan art. Characters belong to their owners."
  },
  id: {
    "start.tagline": "Ekky Arya menggambar karakter yang bikin orang tersenyum.",
    "start.role": "Ilustrator dan desainer grafis",
    "start.featured": "Beberapa gambar Ekky",
    "start.color": "Mewarnai",
    "start.catch": "Tangkap bintang",
    "start.explore": "Jelajahi",
    "start.classic": "Langsung lihat karyanya",
    "map.title": "Coba Ekky",
    "level.1": "Siapa Ekky?",
    "level.2": "Mewarnai bareng Ekky",
    "level.3": "Koleksi Karya",
    "level.4": "Dari Coretan Jadi Karya",
    "level.5": "Misi Terakhir: Kerja Bareng Ekky",
    "level.next": "Lanjut",
    "about.title": "Tentang Ekky",
    "about.body": "Ekky adalah ilustrator asal Indonesia. Dunianya penuh karakter: anak-anak yang berpetualang, monster yang sedang istirahat makan siang, planet kecil dengan seseorang yang lembur. Karyanya cerah, berani, dan sedikit konyol, dan ia paling senang kalau satu gambar bisa bercerita utuh.",
    "about.fact.from": "Ilustrator asal Indonesia",
    "about.fact.lang": "Bisa berbahasa Indonesia dan Inggris",
    "about.fact.hours": "Tersedia sore sampai malam, WIB (GMT+7)",
    "about.fact.price": "Proyek mulai $25",
    "about.workedWith": "Pernah bekerja sama dengan Sequis, Intiland, Viar, pbTaxand, Honshu, Suapi, dan Bima.",
    "tab.art": "Karya",
    "tab.mine": "Punyaku",
    "art.free": "Semua karya bebas dilihat. Ketuk salah satu untuk melihatnya lebih besar.",
    "mine.title": "Buatanmu",
    "mine.empty": "Belum ada apa-apa. Warnai satu gambar atau bikin satu adegan, nanti tersimpan di sini.",
    "mine.best": "Rekor Star Catcher-mu: {n} bintang",
    "mine.sound": "Suara",
    "mine.vibration": "Getar",
    "mine.reset": "Hapus buatanku",
    "mine.resetConfirm": "Hapus semua hasil mewarnai, adegan, dan rekormu di perangkat ini?",
    "color.title": "Mewarnai bareng Ekky",
    "color.intro": "Pilih gambarnya. Warnanya sudah disiapkan Ekky.",
    "color.hint": "Ketuk bidang untuk mewarnai",
    "color.anyColor": "Warna bebas",
    "color.undo": "Urungkan",
    "color.peek": "Intip warna versi Ekky",
    "color.done": "Selesai",
    "color.reveal": "Versimu dan versi Ekky",
    "color.praise": "Keren! Mau dibagikan atau disimpan?",
    "color.scratch": "Mulai dari kertas kosong",
    "scene.title": "Adegan Coretan",
    "scene.hint": "Seret coretan Ekky ke kertas",
    "sticker.tray": "Stiker",
    "sticker.bin": "Seret ke sini untuk membuang",
    "sticker.full": "Sudah 12 stiker, itu batas untuk satu gambar.",
    "stars.title": "Star Catcher",
    "stars.rule": "Tangkap bintangnya, hindari virusnya.",
    "stars.timeUp": "Waktu habis!",
    "stars.score": "Kamu menangkap {n} bintang",
    "stars.best": "Rekormu: {n}",
    "stars.newBest": "Rekor baru!",
    "stars.again": "Main lagi",
    "stars.other": "Coba yang lain",
    "stars.challenge": "Tantang teman",
    "hire.chip": "Hubungi Ekky",
    "hire.chipAria": "Hubungi Ekky, kirim pesan",
    "hire.title": "Misi Terakhir: Kerja Bareng Ekky",
    "hire.body": "Ceritakan proyekmu ke Ekky. Ia bekerja sore sampai malam, WIB (GMT+7).",
    "hire.price": "Proyek mulai $25",
    "hire.email": "Email Ekky",
    "hire.whatsapp": "WhatsApp Ekky",
    "hire.copy": "Salin email",
    "hire.copied": "Email disalin",
    "hire.formTitle": "Atau kirim pesan singkat",
    "hire.name": "Namamu",
    "hire.type": "Jenis proyek",
    "hire.types": ["Desain karakter", "Buku atau editorial", "Brand dan kemasan", "Ilustrasi web atau aplikasi", "Lainnya"],
    "hire.message": "Proyekmu",
    "hire.messageHint": "Kamu sedang membuat apa, dan kapan butuhnya?",
    "hire.send": "Kirim ke Ekky",
    "hire.sent": "Misi selesai! Ekky akan segera menghubungimu.",
    "lb.hire": "Suka gayanya? Hubungi Ekky",
    "lb.prefill": "Halo Ekky, saya lihat \"{title}\" di situsmu dan ",
    "lb.download": "Unduh",
    "lb.downloadNote": "Versi kecil dengan tanda ekkyarya.com. Cantumkan nama Ekky Arya saat kamu mengunggahnya.",
    "share.button": "Bagikan",
    "dl.button": "Unduh",
    "dl.story": "Ukuran story",
    "dl.square": "Persegi",
    "dl.saved": "Tersimpan di unduhan",
    "share.signIt": "Bubuhkan namamu (opsional)",
    "share.signHint": "Nama depanmu",
    "share.saved": "Gambar tersimpan, tautan disalin",
    "share.copied": "Tautan disalin",
    "share.credit": "Ilustrasi oleh Ekky Arya",
    "share.creditFull": "Ilustrasi oleh Ekky Arya · ekkyarya.com",
    "share.colored": "Diwarnai oleh {name}",
    "share.made": "Dibuat oleh {name}",
    "share.cta": "Giliranmu: ekkyarya.com",
    "share.textColor": "Aku mewarnai gambar karya Ekky Arya. Sekarang giliranmu: {url}",
    "share.textScene": "Aku bikin adegan dari coretan Ekky Arya. Bikin punyamu: {url}",
    "share.textChallenge": "{name} menangkap {n} bintang di Star Catcher Ekky. Bisa kalahkan? {url}",
    "arrive.colored": "{name} mewarnai {title} karya Ekky",
    "arrive.coloredAnon": "Seorang teman mewarnai {title} karya Ekky",
    "arrive.scene": "{name} membuat adegan ini dari coretan Ekky",
    "arrive.sceneAnon": "Seorang teman membuat adegan ini dari coretan Ekky",
    "arrive.yours": "Warnai versimu",
    "arrive.explore": "Jelajahi",
    "app.install": "Pasang aplikasinya",
    "app.android": "Unduh aplikasi Android",
    "lang.label": "Bahasa",
    "lang.en": "English",
    "lang.id": "Bahasa Indonesia",
    "hero.hi": "Halo, aku Ekky Arya",
    "hero.title": "Aku menggambar karakter yang bikin orang tersenyum.",
    "hero.sub": "Ilustrator dan desainer grafis asal Indonesia. Buku bergambar, maskot, kemasan, ilustrasi web, dan game.",
    "hero.hire": "Hubungi Ekky",
    "hero.work": "Lihat karyaku",
    "hero.game": "Coba gamenya",
    "strip.title": "Dari buku sketsa",
    "contact.title": "Yuk, bikin sesuatu bareng",
    "contact.body": "Punya ide karakter, buku, maskot, atau kampanye? Ceritakan saja. Proyek mulai $25.",
    "tag.fan": "Fan art",
    "tag.client": "Klien: {name}",
    "tag.clientWork": "Proyek klien",
    "tag.entry": "Karya lomba: {name}",
    "tag.fanNote": "Fan art. Karakternya milik pemiliknya masing-masing."
  }
};
// Language (B41): remembered choice, else the browser language, else English.
const LANGS = ["en", "id"];
let LANG = (() => {
  try { const s = localStorage.getItem("lang"); if (LANGS.includes(s)) return s; } catch (e) {}
  const nav = typeof navigator !== "undefined" ? (navigator.languages || [navigator.language || ""]) : [];
  return nav.some(l => /^(id|in)\b/i.test(l)) ? "id" : "en";
})();
function setLang(l) {
  if (!LANGS.includes(l)) return;
  LANG = l;
  try { localStorage.setItem("lang", l); } catch (e) {}
  if (typeof document !== "undefined") document.documentElement.lang = l;
}
// t("stars.score", {n: 42}) -> "You caught 42 stars". Falls back to English, then to the key.
function t(key, vars) {
  let s = COPY[LANG][key] ?? COPY.en[key] ?? key;
  if (typeof s === "string" && vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
  return s;
}
const ptitle = p => (LANG === "id" && p.id && p.id.title) || p.title;
const pdesc = p => (LANG === "id" && p.id && p.id.desc) || p.desc;
const catName = c => (LANG === "id" ? CAT_NAME_ID : CAT_NAME)[c];
// Tag text in the current language, or "" for untagged pieces.
function plabel(p) {
  const l = p.label || "";
  if (!l) return "";
  if (l === "Fan art") return t("tag.fan");
  if (l === "Client work") return t("tag.clientWork");
  let m = l.match(/^Client: (.+)$/); if (m) return t("tag.client", { name: m[1] });
  m = l.match(/^Competition entry: (.+)$/); if (m) return t("tag.entry", { name: m[1] });
  return l;
}
