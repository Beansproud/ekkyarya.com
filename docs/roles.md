# Roles: where every piece is used

Owner: UX lead. Owner direction (2026-10-27, typed in the Developer's session): **"no need to curate the best artwork make sure all art work has its role"**.
Source of truth: `roles` in `PROJECTS` (`js/data.js`). This page is generated from it, plus the cut-out notes for the Developer (B21).

## Rules

- Every piece has **portfolio** (classic grid and lightbox) and **card** (Art tab).
- **Fan art and client pieces keep only those two** (hard rule). `js/data.js` strips any other role from a piece that is not `own`, so a mistake in the list can't leak.
- Every original also has **featured** (the rotating featured row) and **share** (share-card art and card gifts), plus at least one creative role: coloring, sticker, sprite, level, scene or avatar.
- Code asks `hasRole(p, "sticker")` or `withRole("coloring")`; nothing hard-codes a list of pieces.
- **game** (the mini-games, `docs/minigames.md`) is for the 29 originals only; `js/data.js` strips it from client and fan pieces. The game uses of each piece are in the role table of `docs/minigames.md`.
- **village** (Ekky's Village, the map): the 29 originals and the drawn elements of 6 client pieces (characters and props only; never a logo, wordmark, storefront sign or campaign lettering; the element list says what is allowed). Each client element opens its piece with its "Client: X" tag. Fan art never.
- Owner: **"re-use all of asset of his as much as possible"**. The "Elements to cut" column is the shared cut-out catalogue for stickers (B21), sprites (MG2) and the village: one cut per element, reused everywhere its piece's roles allow.
- Card frame (`rar`) = number of creative roles, capped at 3. It is decoration, not a ranking.

## Counts

| Role | Pieces |
|---|---|
| featured | 38 |
| share | 38 |
| coloring | 11 |
| sticker | 30 |
| sprite | 2 |
| level | 6 |
| scene | 5 |
| avatar | 2 |
| game | 29 |
| village | 35 |

## Every piece

| Piece | Kind | Tag | Roles beyond portfolio and card | Elements to cut (shared catalogue) | Notes for the Developer |
|---|---|---|---|---|---|
| Coexistence / Hidup Berdampingan (`coexistence`) | original |  | featured, share, sticker, game, village | kid with cap and backpack; gargoyle commuter in a suit with a phone; orange many-eyed monster on a phone; bench; bus-stop sign; brick street (backdrop) | **Cut:** the monster commuter, the kid with the backpack. |
| Hidden Monster / Monster Tersembunyi (`hidden-monster`) | original |  | featured, share, sticker, game, village | two kids with a lantern; mimic treasure chest; stone gate with monster carvings; gargoyle statues; dungeon hall (backdrop) | **Cut:** the mimic chest, the two kids with the lantern. |
| The Blue Bird / Si Burung Biru (`blue-bird`) | original |  | featured, share, sprite, scene, game, village | hiker girl with binoculars and backpack; glowing blue bird; night mountain trail (backdrop); tall grass | **Sprite:** the glowing bird as a rare +5 bonus in Star Catcher (replaces the glow star when it appears). **Scene:** night-trail backdrop. |
| Broken-Down Bus / Bus Mogok (`old-bus`) | original |  | featured, share, sticker, game, village | yellow bus; brown bear on the roof; caped hero kid; lion driver; passengers; desert road and city skyline (backdrop) | **Cut:** the bear, the lion driver, the caped hero. |
| Monster Snack Bar / Kedai Jajan Monster (`monster-crowd`) | original |  | featured, share, sticker, game, village | big purple monster; teal monster in sunglasses; pink monster; skull sun; kid in an orange cap at the counter; fries; snack counter | **Cut:** 3 or 4 single monsters from the counter. |
| Monster World Doodles / Coretan Dunia Monster (`doodles`) | original |  | featured, share, level, sticker, game, village | ghost (done); alien; crocodile; worm; skull; dog; UFO; viking head; pumpkin; "HEY" and "Monster World" lettering | Done: ghost (level 4). **Cut:** alien, crocodile, worm, skull, dog, "HEY" lettering. |
| Monster in My Room / Monster di Kamarku (`monster`) | original |  | featured, share, level, sticker, game, village | green one-eyed monster with a hammer (head done); kid on the bed; teddy bear; basketball; bedroom (backdrop) | Done: monster head (level 5, Final Quest). **Cut:** the whole green monster as a sticker. |
| Afloat / Mengapung (`floating-boy`) | original |  | featured, share, coloring, scene, game, village | boy on a swim ring; three fish; beach ball; can; pool water (backdrop) | Coloring page (medium). **Scene:** pool-water backdrop. |
| Buried at the Beach / Terkubur di Pantai (`summertime`) | original |  | featured, share, scene, sticker, game, village | kid buried in the sand; crab; palm trees; sea and beach (backdrop) | **Scene:** beach backdrop. **Cut:** the crab. |
| Viking vs Dragon Kid / Viking vs Bocah Naga (`beansproud-vs-puff`) | original |  | featured, share, coloring, sticker, game, village | viking kid with an axe; kid in a dragon costume with a staff; cliffs and mountains (backdrop) | Coloring page without the effects layer. **Cut:** the viking kid, the dragon kid. |
| Virus and War / Virus dan Perang (`virus-and-war`) | original |  | featured, share, sprite, sticker, game, village | running kid; helmet kid with a paint blaster; viruses (one done); burning globe; red cloud sky (backdrop) | Done: virus (Star Catcher hazard). **Cut:** the running kid and the soldier kid. |
| RPG / RPG (`rpg`) | original |  | featured, share, sticker, game, village | armored giant; orc; mouse knight; skeleton warriors; fire spirit; grass field | **Cut:** the orc, the mouse knight, the fire spirit (Ekky's own design, owner) and the armored giant. |
| Big Catch / Tangkapan Besar (`shark`) | original |  | featured, share, coloring, sticker, game, village | shark; fishing kid; wooden pier; water splash | Coloring page. **Cut:** the shark. |
| Giraffe Ride / Naik Jerapah (`giraffe`) | original |  | featured, share, coloring, sticker, game, village | giraffe; kid riding; wooden fence; trees; grass patch | Coloring page (first page if the Road Trip layer is late, D8). **Cut:** the giraffe with the kid. |
| Noodle Bath / Mandi Mi (`noodles`) | original |  | featured, share, coloring, sticker, game, village | walking ramen bowl; kid in the bowl; chopsticks; egg | Coloring page. **Cut:** the walking ramen bowl. |
| Astronaut / Astronaut (`nft-3`) | original |  | featured, share, level, sticker, game, village | astronaut (helmet done) | Done: helmet (Star Catcher button). **Cut:** the full astronaut (256 px source; ask for a bigger file). |
| Radio Explorer / Penjelajah Radio (`nft-9`) | original |  | featured, share, sticker, game, village | radio explorer with goggles | **Cut:** the radio explorer (256 px source). |
| The Adventuring Party / Rombongan Petualang (`dnd`) | fan | Fan art | none (portfolio and card only) | none | Fan art: never cut, colored, redrawn, downloaded or shared as art. |
| Retro Game Pattern / Pola Game Retro (`game-pattern`) | fan | Fan art | none (portfolio and card only) | none | Fan art: never cut, colored, redrawn, downloaded or shared as art. |
| One Piece Crew / Kru One Piece (`one-piece-fan-art`) | fan | Fan art | none (portfolio and card only) | none | Fan art: never cut, colored, redrawn, downloaded or shared as art. |
| Rocket & Groot / Rocket & Groot (`rocket-groot-fan-art`) | fan | Fan art | none (portfolio and card only) | none | Fan art: never cut, colored, redrawn, downloaded or shared as art. |
| Miles Morales / Miles Morales (`spider-verse-fan-art`) | fan | Fan art | none (portfolio and card only) | none | Fan art: never cut, colored, redrawn, downloaded or shared as art. |
| Godzilla vs Kong / Godzilla vs Kong (`godzilla-kong-fan-art`) | fan | Fan art | none (portfolio and card only) | none | Fan art: never cut, colored, redrawn, downloaded or shared as art. |
| Finn & Jake: Bring It On / Finn & Jake: Bring It On (`adventure-time-fan-art`) | fan | Fan art | none (portfolio and card only) | none | Fan art: never cut, colored, redrawn, downloaded or shared as art. |
| Morumelons / Morumelons (`morumelons`) | original |  | featured, share, sticker, scene, game, village | robot; dino-hoodie kid; box-head kid; green orc; pink-haired girl; boxer; ninja; Morumelons lettering (Ekky's own project) | **Cut:** the robot, the dino-hoodie kid, the box-head kid. **Scene:** the crowd as a backdrop. |
| Oasis for Fizzy Tube / Oasis untuk Fizzy Tube (`oasis`) | client | Client: Fizzy Tube | featured, share, sticker, scene, village | party characters; palm trees; cacti; sun. NOT the Fizzy Tube logo or the OASIS title | **Cut:** 2 or 3 party characters (no Fizzy Tube logo in a sticker). **Scene:** desert backdrop with the logo cropped out. |
| Character Crowd Banner / Banner Kerumunan Karakter (`web-illustration`) | original |  | featured, share, sticker, game, village | kid in a red beanie; pink-haired girl; blue genie; mustached man; phone with a coin | **Cut:** 2 or 3 characters (treated as Morumelons, "yes to all Morumelon pieces"). |
| MSI Creator Banner / Banner Kreator MSI (`msi`) | client | Client: MSI | featured, share, sticker, village | creator at the laptop; monsters; horse | **Cut:** the creator at the laptop, 2 monsters. |
| Tea Break Website / Situs Tea Break (`tea-break-website`) | client | Client: Tea Break | featured, share | none (photos and UI) | Featured and share only: a website with photos, no drawn characters to cut. |
| My Sports Club App / Aplikasi My Sports Club (`my-sports-club`) | client | Client work | featured, share | none (app UI) | Featured and share only: app screens, no drawn characters to cut. |
| Save Early, Buy Future / Save Early, Buy Future (`save-early-buy-future`) | client | Client work | featured, share, sticker, village | grandparents; graduate; golden chicken; coins; house; plane. NOT the campaign lettering | **Cut:** the grandparents, the graduate, the golden chicken. |
| Indomaret Shopping Rush / Serbu Indomaret (`indomaret`) | client | Client: Indomaret | featured, share, sticker, village | scooter rider; shoppers; skateboarder; cat. NOT the Indomaret storefront or sign | **Cut:** the scooter rider, 2 or 3 shoppers (no logo in a sticker). Tag "Client: Indomaret" stays on the full piece. |
| Thinker & Doer / Thinker & Doer (`thinker-doer`) | client | Client work | featured, share | none (lettering with tiny scenes) | Featured and share only: the tiny scenes are too small to cut. |
| Plug Hero Mascot / Maskot Plug Hero (`plug-hero`) | original |  | featured, share, coloring, sticker, game, village | Plug Hero with his wind-up key | Coloring page (easy). **Cut:** Plug Hero. |
| Monster Noodles Cup / Cup Mi Monster (`pop-mie`) | fan | Fan art | none (portfolio and card only) | none | Fan art: never cut, colored, redrawn, downloaded or shared as art. |
| BCA Flazz Card / Kartu BCA Flazz (`bca-flazz-card`) | client | Client: BCA | featured, share, sticker, village | two astronauts; octopus. NOT the BCA or Flazz logos, NOT the CRAZZ wordmark | **Cut:** the snacking astronaut, the octopus (no card logo in a sticker). |
| Ancol Logo Entry / Karya Lomba Logo Ancol (`ancol-logo`) | client | Competition entry: Ancol | featured, share, sticker, village | barong mask; komodo; dancers; temple. NOT the Ancol wordmark or the 77 logo | **Cut:** the barong mask, the komodo (no Ancol wordmark in a sticker). |
| Toybox Packaging / Kemasan Toybox (`toybox`) | original |  | featured, share, sticker, game, village | doodle-covered box | **Cut:** the doodle box. |
| Type Is Art in Motion / Type Is Art, Bergerak (`type-is-art`) | original |  | featured, share, level, game, village | lettering animation frames | **Level:** the lettering animation plays in level 4 "Doodle to Done" (needs a still first frame, owner question 11). |
| Secret Android / Android Rahasia (`android`) | original |  | featured, share, avatar, sticker, game, village | blue-haired face (face.png done); robot reveal frames | Done: `face.png` (middle tab, favicon, level 1). Avatar candidate. **Cut:** none more. |
| Year of the Tiger 2022 / Tahun Macan 2022 (`hello-2022`) | original |  | featured, share, sticker, game, village | tiger; kid rider with headphones; paper plane; "2022" numbers | **Cut:** the tiger, the paper plane. |
| Little Planet / Planet Kecil (`little-planet`) | original |  | featured, share, avatar, level, coloring, sticker, game, village | Ekky at his desk on his chair (hero); laptop; desk; moon planet; cat (done); palette (done); planet (done); pen-hand (done); book; cassette; robot; microphone; map pin | Done: pen-hand (level 2), palette (level 3, Art tab, +3), cat, planet, category icons (`hero.png`). **Cut:** book, cassette, robot, microphone, map pin, the glasses guy at his desk. Coloring page from the line layer (owner question 6). Avatar candidate (HUD, map token today). |
| Road Trip / Jalan-jalan (`road-trip`) | original |  | featured, share, coloring, sticker, game, village | yellow car with friends; cat on the roof; little bird; signpost; pinwheel | Coloring page (first page, D8). **Cut:** the yellow car with friends. |
| A Day in the Life / Sehari-hari (`day-in-life`) | original |  | featured, share, level, coloring, game, village | four panels: waking up, driving, eating, working at the computer; blue-haired guy | **Level:** the four panels illustrate level 1 "Who is Ekky?" (a day in his life). Coloring page: one panel at a time. |
| Merdeka 77 / Merdeka 77 (`kemerdekaan`) | original |  | featured, share, coloring, sticker, game, village | cyclist with the red-and-white flag; "77" numbers | Coloring page (seasonal, August). **Cut:** the cyclist. |
| Tangled Hands / Tangan Kusut (`hands`) | original |  | featured, share, coloring, game, village | knot of hands | Coloring page. |

## Cut-out rules (B21)

- Transparent PNG, 2x display size, cut along Ekky's own outline; no restyling.
- File name `assets/ui/stickers/<slug>-<thing>.png`, for example `old-bus-bear.png`.
- Only from pieces where `hasRole(p, "sticker")` is true; `npm run check` already blocks the rest.
- A cut that fails at 48 px on the dark game background (`#2B1342`) gets a 2 px light outline (same fix as pen-hand).
