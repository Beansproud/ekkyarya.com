// Portfolio data, loaded first. Shared by js/site.js (desktop portfolio) and js/game.js (phone game).
/* ===== Edit these: real contact details and portfolio entries ===== */
const CONFIG = {
  email: "hello@example.com",                 // TODO: real email
  links: { instagram: "https://instagram.com/", dribbble: "https://dribbble.com/", behance: "https://behance.net/" }, // TODO: real profiles
  // Which kinds of piece may be reused as icons, stickers, coloring pages and share-card art.
  // Every piece always stays visible in the portfolio, whatever these say.
  // original: Ekky's own work (owner: everything is Ekky's). client: made for a brand; off by the project rule until the owner lifts it.
  // fan: characters belong to their owners; keep this off.
  reuse: { original: true, client: false, fan: false },
  reuseBlock: []                              // slugs to keep out of reuse later, e.g. ["morumelons"]
};
// Portfolio: img = thumbnail, full = large version for the lightbox, desc = one-line caption,
// rar = card rarity in game mode (0 common … 3 legendary; only original pieces are legendary),
// kind = "original" | "client" | "fan" (see CONFIG.reuse); own is computed below: true when the piece may be reused,
// label = "Fan art" or "Client: <name>" / "Client work" / "Competition entry: <name>", featured = 1..6 lead pieces.
// Order within each category is the curated display order.
const PROJECTS = [
  {"cat": "illustration", "title": "Coexistence", "desc": "Rush hour at a bus stop where monsters and people share the bench.", "img": "assets/work/thumb/coexistence.jpg", "full": "assets/work/coexistence.jpg", "rar": 3, "kind": "original", "featured": 1},
  {"cat": "illustration", "title": "Hidden Monster", "desc": "Two kids sneak into a monster lair, and the treasure chest bites back.", "img": "assets/work/thumb/hidden-monster.jpg", "full": "assets/work/hidden-monster.jpg", "rar": 3, "kind": "original", "featured": 2},
  {"cat": "illustration", "title": "The Blue Bird", "desc": "A hiker meets a glowing bird on a night trail.", "img": "assets/work/thumb/blue-bird.jpg", "full": "assets/work/blue-bird.jpg", "rar": 3, "kind": "original", "featured": 3},
  {"cat": "illustration", "title": "Broken-Down Bus", "desc": "A bear, a lion driver and a caped hero wait out a breakdown.", "img": "assets/work/thumb/old-bus.jpg", "full": "assets/work/old-bus.jpg", "rar": 3, "kind": "original", "featured": 4},
  {"cat": "illustration", "title": "Monster Snack Bar", "desc": "Lunch rush at a fast-food counter for monsters.", "img": "assets/work/thumb/monster-crowd.jpg", "full": "assets/work/monster-crowd.jpg", "rar": 3, "kind": "original", "featured": 5},
  {"cat": "illustration", "title": "Monster World Doodles", "desc": "A full page of monsters, aliens and hand lettering.", "img": "assets/work/thumb/doodles.jpg", "full": "assets/work/doodles.jpg", "rar": 3, "kind": "original", "featured": 6},
  {"cat": "illustration", "title": "Monster in My Room", "desc": "A kid stands up to a giant one-eyed roommate.", "img": "assets/work/thumb/monster.jpg", "full": "assets/work/monster.jpg", "rar": 2, "kind": "original"},
  {"cat": "illustration", "title": "Afloat", "desc": "A lazy summer float with fish, a beach ball and a stray can.", "img": "assets/work/thumb/floating-boy.jpg", "full": "assets/work/floating-boy.jpg", "rar": 2, "kind": "original"},
  {"cat": "illustration", "title": "Buried at the Beach", "desc": "Summer at the beach, from the point of view of the kid in the sand.", "img": "assets/work/thumb/summertime.jpg", "full": "assets/work/summertime.jpg", "rar": 2, "kind": "original"},
  {"cat": "illustration", "title": "Viking vs Dragon Kid", "desc": "Two tiny heroes duel on a cliff, sparks flying.", "img": "assets/work/thumb/beansproud-vs-puff.jpg", "full": "assets/work/beansproud-vs-puff.jpg", "rar": 2, "kind": "original"},
  {"cat": "illustration", "title": "Virus and War", "desc": "Two crises fight over one burning planet.", "img": "assets/work/thumb/virus-and-war.jpg", "full": "assets/work/virus-and-war.jpg", "rar": 1, "kind": "original"},
  {"cat": "illustration", "title": "Boss Fight", "desc": "An orc, a mouse knight and a fire spirit face an armored giant.", "img": "assets/work/thumb/rpg.jpg", "full": "assets/work/rpg.jpg", "rar": 1, "kind": "original"},
  {"cat": "illustration", "title": "Big Catch", "desc": "Fishing goes wrong when the fish is the bait.", "img": "assets/work/thumb/shark.jpg", "full": "assets/work/shark.jpg", "rar": 1, "kind": "original"},
  {"cat": "illustration", "title": "Giraffe Ride", "desc": "A kid hitches a ride on a friendly giraffe.", "img": "assets/work/thumb/giraffe.jpg", "full": "assets/work/giraffe.jpg", "rar": 1, "kind": "original"},
  {"cat": "illustration", "title": "Noodle Bath", "desc": "A kid soaks in a bowl of ramen that walks on noodle legs.", "img": "assets/work/thumb/noodles.jpg", "full": "assets/work/noodles.jpg", "rar": 1, "kind": "original"},
  {"cat": "illustration", "title": "Astronaut", "desc": "A character from Ekky's NFT series.", "img": "assets/work/thumb/nft-3.jpg", "full": "assets/work/nft-3.jpg", "rar": 0, "kind": "original"},
  {"cat": "illustration", "title": "Radio Explorer", "desc": "A character from Ekky's NFT series.", "img": "assets/work/thumb/nft-9.jpg", "full": "assets/work/nft-9.jpg", "rar": 0, "kind": "original"},
  {"cat": "illustration", "title": "The Adventuring Party", "desc": "A tabletop party marches into the snow, dice flying. Fan art. Characters belong to their owners.", "img": "assets/work/thumb/dnd.jpg", "full": "assets/work/dnd.jpg", "rar": 0, "kind": "fan", "label": "Fan art"},
  {"cat": "illustration", "title": "Retro Game Pattern", "desc": "A repeat pattern of classic video game icons. Fan art. Characters belong to their owners.", "img": "assets/work/thumb/game-pattern.jpg", "full": "assets/work/game-pattern.jpg", "rar": 0, "kind": "fan", "label": "Fan art"},
  {"cat": "illustration", "title": "One Piece Crew", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/thumb/one-piece-fan-art.jpg", "full": "assets/work/one-piece-fan-art.jpg", "rar": 0, "kind": "fan", "label": "Fan art"},
  {"cat": "illustration", "title": "Rocket & Groot", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/thumb/rocket-groot-fan-art.jpg", "full": "assets/work/rocket-groot-fan-art.jpg", "rar": 0, "kind": "fan", "label": "Fan art"},
  {"cat": "illustration", "title": "Miles Morales", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/thumb/spider-verse-fan-art.jpg", "full": "assets/work/spider-verse-fan-art.jpg", "rar": 0, "kind": "fan", "label": "Fan art"},
  {"cat": "illustration", "title": "Godzilla vs Kong", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/thumb/godzilla-kong-fan-art.jpg", "full": "assets/work/godzilla-kong-fan-art.jpg", "rar": 0, "kind": "fan", "label": "Fan art"},
  {"cat": "illustration", "title": "Finn & Jake: Bring It On", "desc": "Fan art. Characters belong to their owners.", "img": "assets/work/adventure-time-fan-art.gif", "full": "assets/work/adventure-time-fan-art.gif", "rar": 0, "kind": "fan", "label": "Fan art"},
  {"cat": "web", "title": "Morumelons", "desc": "Landing page art for an NFT character collection.", "img": "assets/work/thumb/morumelons.jpg", "full": "assets/work/morumelons.jpg", "rar": 3, "kind": "original", "label": "Client: Morumelons"},
  {"cat": "web", "title": "Oasis for Fizzy Tube", "desc": "A desert party around a soda maker, for the web.", "img": "assets/work/thumb/oasis.jpg", "full": "assets/work/oasis.jpg", "rar": 2, "kind": "original", "label": "Client: Fizzy Tube"},
  {"cat": "web", "title": "Character Crowd Banner", "desc": "A wide web banner packed with characters.", "img": "assets/work/thumb/web-illustration.jpg", "full": "assets/work/web-illustration.jpg", "rar": 1, "kind": "original"},
  {"cat": "web", "title": "MSI Creator Banner", "desc": "A creator at work, surrounded by the monsters in their head.", "img": "assets/work/thumb/msi.jpg", "full": "assets/work/msi.jpg", "rar": 2, "kind": "client", "label": "Client: MSI"},
  {"cat": "web", "title": "Tea Break Website", "desc": "Website design for a bubble tea brand.", "img": "assets/work/thumb/tea-break-website.jpg", "full": "assets/work/tea-break-website.jpg", "rar": 0, "kind": "client", "label": "Client: Tea Break"},
  {"cat": "web", "title": "My Sports Club App", "desc": "App design for a sports club's members and fees.", "img": "assets/work/thumb/my-sports-club.jpg", "full": "assets/work/my-sports-club.jpg", "rar": 0, "kind": "original"},
  {"cat": "branding", "title": "Save Early, Buy Future", "desc": "A poster about saving today for the life you want later.", "img": "assets/work/thumb/save-early-buy-future.jpg", "full": "assets/work/save-early-buy-future.jpg", "rar": 2, "kind": "original"},
  {"cat": "branding", "title": "Indomaret Shopping Rush", "desc": "A busy street of shoppers heading to Indomaret.", "img": "assets/work/thumb/indomaret.jpg", "full": "assets/work/indomaret.jpg", "rar": 2, "kind": "client", "label": "Client: Indomaret"},
  {"cat": "branding", "title": "Thinker & Doer", "desc": "Lettering packed with tiny scenes of people at work.", "img": "assets/work/thumb/thinker-doer.jpg", "full": "assets/work/thinker-doer.jpg", "rar": 1, "kind": "original"},
  {"cat": "branding", "title": "Plug Hero Mascot", "desc": "A cheerful mascot who runs on a wind-up key.", "img": "assets/work/thumb/plug-hero.jpg", "full": "assets/work/plug-hero.jpg", "rar": 1, "kind": "original"},
  {"cat": "branding", "title": "Monster Noodles Cup", "desc": "A noodle-cup design where a kaiju takes a hot bath.", "img": "assets/work/thumb/pop-mie.jpg", "full": "assets/work/pop-mie.jpg", "rar": 1, "kind": "client", "label": "Client work"},
  {"cat": "branding", "title": "BCA Flazz Card", "desc": "Card art: astronauts on a snack break.", "img": "assets/work/thumb/bca-flazz-card.jpg", "full": "assets/work/bca-flazz-card.jpg", "rar": 2, "kind": "client", "label": "Client: BCA"},
  {"cat": "branding", "title": "Ancol Logo Entry", "desc": "An entry for Ancol's Indonesia 77 logo contest.", "img": "assets/work/thumb/ancol-logo.jpg", "full": "assets/work/ancol-logo.jpg", "rar": 1, "kind": "client", "label": "Competition entry: Ancol"},
  {"cat": "branding", "title": "Toybox Packaging", "desc": "A box wrapped in Ekky's doodles.", "img": "assets/work/thumb/toybox.jpg", "full": "assets/work/toybox.jpg", "rar": 1, "kind": "original"},
  {"cat": "branding", "title": "Type Is Art in Motion", "desc": "Animated hand lettering.", "img": "assets/work/type-is-art.gif", "full": "assets/work/type-is-art.gif", "rar": 1, "kind": "original"},
  {"cat": "branding", "title": "Secret Android", "desc": "A friendly face that opens to reveal a robot.", "img": "assets/work/android.gif", "full": "assets/work/android.gif", "rar": 0, "kind": "original"},
  {"cat": "social", "title": "Year of the Tiger 2022", "desc": "A New Year post: racing into the year of the tiger.", "img": "assets/work/thumb/hello-2022.jpg", "full": "assets/work/hello-2022.jpg", "rar": 2, "kind": "original"},
  {"cat": "social", "title": "Little Planet", "desc": "Ekky at his desk on his own little planet.", "img": "assets/work/thumb/little-planet.jpg", "full": "assets/work/little-planet.jpg", "rar": 3, "kind": "original"},
  {"cat": "social", "title": "Road Trip", "desc": "Five friends and a cat squeezed into one happy little car.", "img": "assets/work/thumb/road-trip.jpg", "full": "assets/work/road-trip.jpg", "rar": 1, "kind": "original"},
  {"cat": "social", "title": "A Day in the Life", "desc": "Four panels of an ordinary, cozy day.", "img": "assets/work/thumb/day-in-life.jpg", "full": "assets/work/day-in-life.jpg", "rar": 1, "kind": "original"},
  {"cat": "social", "title": "Merdeka 77", "desc": "Indonesia's 77th Independence Day, by bicycle.", "img": "assets/work/thumb/kemerdekaan.jpg", "full": "assets/work/kemerdekaan.jpg", "rar": 2, "kind": "original"},
  {"cat": "social", "title": "Tangled Hands", "desc": "A happy knot of hands with nowhere to go.", "img": "assets/work/thumb/hands.jpg", "full": "assets/work/hands.jpg", "rar": 1, "kind": "original"}
];
// slug = file name of the piece; own = may become an icon, sticker, coloring page or share-card art.
PROJECTS.forEach(p=>{p.slug=p.full.split("/").pop().replace(/\.\w+$/,"");p.own=!!CONFIG.reuse[p.kind]&&!CONFIG.reuseBlock.includes(p.slug)});
const shareable=p=>p.own===true;
const CAT_ICON={all:"assets/cat-all.png",illustration:"assets/cat-illustration.png",web:"assets/cat-web.png",branding:"assets/cat-branding.png",social:"assets/cat-social.png"};
const CAT_NAME={illustration:"Project Based Illustration",web:"Web & UI Design",branding:"Branding & Product Design",social:"Social Media"};
