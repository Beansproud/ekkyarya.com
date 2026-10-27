// Portfolio data, loaded first. Shared by js/site.js (desktop portfolio) and js/game.js (phone game).
/* ===== Edit these: real contact details and portfolio entries ===== */
const CONFIG = {
  email: "hello@example.com",                 // TODO: real email
  links: { instagram: "https://instagram.com/", dribbble: "https://dribbble.com/", behance: "https://behance.net/" } // TODO: real profiles
};
// Portfolio: img = thumbnail, full = large version for the lightbox, rar = card rarity in game mode (0 common … 3 legendary).
const PROJECTS = [
  {"cat": "illustration", "title": "Blue Bird", "img": "assets/work/thumb/blue-bird.jpg", "full": "assets/work/blue-bird.jpg", "rar": 3},
  {"cat": "illustration", "title": "Coexistence", "img": "assets/work/thumb/coexistence.jpg", "full": "assets/work/coexistence.jpg", "rar": 3},
  {"cat": "illustration", "title": "Floating Boy", "img": "assets/work/thumb/floating-boy.jpg", "full": "assets/work/floating-boy.jpg", "rar": 2},
  {"cat": "illustration", "title": "Hidden Monster", "img": "assets/work/thumb/hidden-monster.jpg", "full": "assets/work/hidden-monster.jpg", "rar": 2},
  {"cat": "illustration", "title": "Old Bus", "img": "assets/work/thumb/old-bus.jpg", "full": "assets/work/old-bus.jpg", "rar": 2},
  {"cat": "illustration", "title": "Summertime", "img": "assets/work/thumb/summertime.jpg", "full": "assets/work/summertime.jpg", "rar": 1},
  {"cat": "illustration", "title": "D&D Party", "img": "assets/work/thumb/dnd.jpg", "full": "assets/work/dnd.jpg", "rar": 1},
  {"cat": "illustration", "title": "Beansproud vs Puff", "img": "assets/work/thumb/beansproud-vs-puff.jpg", "full": "assets/work/beansproud-vs-puff.jpg", "rar": 1},
  {"cat": "illustration", "title": "Virus and War", "img": "assets/work/thumb/virus-and-war.jpg", "full": "assets/work/virus-and-war.jpg", "rar": 1},
  {"cat": "illustration", "title": "Monster", "img": "assets/work/thumb/monster.jpg", "full": "assets/work/monster.jpg", "rar": 0},
  {"cat": "illustration", "title": "Doodles", "img": "assets/work/thumb/doodles.jpg", "full": "assets/work/doodles.jpg", "rar": 0},
  {"cat": "illustration", "title": "Monster Crowd", "img": "assets/work/thumb/monster-crowd.jpg", "full": "assets/work/monster-crowd.jpg", "rar": 0},
  {"cat": "illustration", "title": "Game Pattern", "img": "assets/work/thumb/game-pattern.jpg", "full": "assets/work/game-pattern.jpg", "rar": 0},
  {"cat": "illustration", "title": "RPG", "img": "assets/work/thumb/rpg.jpg", "full": "assets/work/rpg.jpg", "rar": 0},
  {"cat": "illustration", "title": "Noodles", "img": "assets/work/thumb/noodles.jpg", "full": "assets/work/noodles.jpg", "rar": 0},
  {"cat": "illustration", "title": "Giraffe", "img": "assets/work/thumb/giraffe.jpg", "full": "assets/work/giraffe.jpg", "rar": 0},
  {"cat": "illustration", "title": "Shark", "img": "assets/work/thumb/shark.jpg", "full": "assets/work/shark.jpg", "rar": 0},
  {"cat": "illustration", "title": "One Piece Fan Art", "img": "assets/work/thumb/one-piece-fan-art.jpg", "full": "assets/work/one-piece-fan-art.jpg", "rar": 0},
  {"cat": "illustration", "title": "Rocket & Groot Fan Art", "img": "assets/work/thumb/rocket-groot-fan-art.jpg", "full": "assets/work/rocket-groot-fan-art.jpg", "rar": 0},
  {"cat": "illustration", "title": "Spider-Verse Fan Art", "img": "assets/work/thumb/spider-verse-fan-art.jpg", "full": "assets/work/spider-verse-fan-art.jpg", "rar": 0},
  {"cat": "illustration", "title": "Godzilla vs Kong Fan Art", "img": "assets/work/thumb/godzilla-kong-fan-art.jpg", "full": "assets/work/godzilla-kong-fan-art.jpg", "rar": 0},
  {"cat": "illustration", "title": "Adventure Time Fan Art", "img": "assets/work/adventure-time-fan-art.gif", "full": "assets/work/adventure-time-fan-art.gif", "rar": 0},
  {"cat": "illustration", "title": "NFT #3", "img": "assets/work/thumb/nft-3.jpg", "full": "assets/work/nft-3.jpg", "rar": 0},
  {"cat": "illustration", "title": "NFT #9", "img": "assets/work/thumb/nft-9.jpg", "full": "assets/work/nft-9.jpg", "rar": 0},
  {"cat": "web", "title": "Tea Break Website", "img": "assets/work/thumb/tea-break-website.jpg", "full": "assets/work/tea-break-website.jpg", "rar": 3},
  {"cat": "web", "title": "Morumelons Landing Page", "img": "assets/work/thumb/morumelons.jpg", "full": "assets/work/morumelons.jpg", "rar": 3},
  {"cat": "web", "title": "Oasis Web Illustration", "img": "assets/work/thumb/oasis.jpg", "full": "assets/work/oasis.jpg", "rar": 2},
  {"cat": "web", "title": "Web Illustration", "img": "assets/work/thumb/web-illustration.jpg", "full": "assets/work/web-illustration.jpg", "rar": 2},
  {"cat": "web", "title": "MSI Web Banner", "img": "assets/work/thumb/msi.jpg", "full": "assets/work/msi.jpg", "rar": 2},
  {"cat": "web", "title": "My Sports Club App", "img": "assets/work/thumb/my-sports-club.jpg", "full": "assets/work/my-sports-club.jpg", "rar": 1},
  {"cat": "branding", "title": "Save Early, Buy Future", "img": "assets/work/thumb/save-early-buy-future.jpg", "full": "assets/work/save-early-buy-future.jpg", "rar": 3},
  {"cat": "branding", "title": "Indomaret Creative Artwork", "img": "assets/work/thumb/indomaret.jpg", "full": "assets/work/indomaret.jpg", "rar": 3},
  {"cat": "branding", "title": "Pop Mie Monster Noodles", "img": "assets/work/thumb/pop-mie.jpg", "full": "assets/work/pop-mie.jpg", "rar": 2},
  {"cat": "branding", "title": "BCA Flazz Card", "img": "assets/work/thumb/bca-flazz-card.jpg", "full": "assets/work/bca-flazz-card.jpg", "rar": 2},
  {"cat": "branding", "title": "Ancol Logo Competition", "img": "assets/work/thumb/ancol-logo.jpg", "full": "assets/work/ancol-logo.jpg", "rar": 2},
  {"cat": "branding", "title": "Toybox Packaging", "img": "assets/work/thumb/toybox.jpg", "full": "assets/work/toybox.jpg", "rar": 1},
  {"cat": "branding", "title": "Plug Hero Mascot", "img": "assets/work/thumb/plug-hero.jpg", "full": "assets/work/plug-hero.jpg", "rar": 1},
  {"cat": "branding", "title": "Thinker & Doer", "img": "assets/work/thumb/thinker-doer.jpg", "full": "assets/work/thinker-doer.jpg", "rar": 1},
  {"cat": "branding", "title": "Type Is Art", "img": "assets/work/type-is-art.gif", "full": "assets/work/type-is-art.gif", "rar": 1},
  {"cat": "branding", "title": "Android Character", "img": "assets/work/android.gif", "full": "assets/work/android.gif", "rar": 0},
  {"cat": "social", "title": "Little Planet", "img": "assets/work/thumb/little-planet.jpg", "full": "assets/work/little-planet.jpg", "rar": 3},
  {"cat": "social", "title": "Hello 2022", "img": "assets/work/thumb/hello-2022.jpg", "full": "assets/work/hello-2022.jpg", "rar": 3},
  {"cat": "social", "title": "Kemerdekaan", "img": "assets/work/thumb/kemerdekaan.jpg", "full": "assets/work/kemerdekaan.jpg", "rar": 2},
  {"cat": "social", "title": "A Day in Life", "img": "assets/work/thumb/day-in-life.jpg", "full": "assets/work/day-in-life.jpg", "rar": 2},
  {"cat": "social", "title": "Road Trip", "img": "assets/work/thumb/road-trip.jpg", "full": "assets/work/road-trip.jpg", "rar": 2},
  {"cat": "social", "title": "Hands", "img": "assets/work/thumb/hands.jpg", "full": "assets/work/hands.jpg", "rar": 1}
];
const CAT_ICON={all:"assets/cat-all.png",illustration:"assets/cat-illustration.png",web:"assets/cat-web.png",branding:"assets/cat-branding.png",social:"assets/cat-social.png"};
const CAT_NAME={illustration:"Project Based Illustration",web:"Web & UI Design",branding:"Branding & Product Design",social:"Social Media"};
