# Minigames brief: "Paint Patrol" and "Little Planet Quest"

**Status: approved by UX lead (2026-10-27), with the changes below.** Proposed by the Game Director (director/backlog adc021e). The tickets are slotted in `docs/backlog.md` after the round-1 P1 tickets.

## UX lead review (read this first)

Approved: two games that play like real games and stay a portfolio. Ekky on his desk chair as the hero is charming and honest (his only full-body drawing, cut exactly as drawn). Painting instead of shooting, befriending instead of defeating, every character opening its artwork, and Hire Ekky on every pause and end screen are exactly right for a hiring client. Changes, already applied in the text below:

1. **Only the 29 `kind: "original"` pieces build the games.** The brief matches `main`. `js/data.js` gives those 29 a `game` role and strips it from anything else, so a client or fan piece can't slip in, even though client pieces are reusable elsewhere.
2. **Genre only, in the product.** The franchise names appear in this document only inside the owner's quote and the hard rules. They never appear in user-facing text, code, file names, comments, page metadata or commit messages. Stage names, area names and character lines (MG8) are reviewed by UX for this.
3. **No boss-fight theme** (owner: "its a joke you can ignore or dont add bossfight theme to this", reported by the Director). "Boss" is only a design word in this brief: no on-screen text, file name or `COPY` string says "boss" or "boss fight" (checked: none in `COPY.en` or `COPY.id`). The big characters are "grumpy friends to calm down with paint". The RPG piece is not a stage character at all.
4. **The guide bird stays silent.** A glowing companion that calls out to the player is a signature of the series the owner named. The Blue Bird only flies ahead quietly after Ekky stands still for 6 s; it never speaks, chimes or flashes for attention.
5. **The fire spirit from "RPG" is not cut or animated** until the owner confirms it is Ekky's own design (open question). At the Lair camp, only the orc, the mouse knight and the armored giant rest by the fire.
6. **Owner answers:** "use ekky as the hero, landscape is fine" is verified by the integrator. "yes paint and befriend is ok, sound effects only", "no png files, cut them from the images" and the no-boss-fight answer are **reported by the Director**; the brief follows them as the defaults until the integrator verifies them.
7. **One cut-out pipeline.** `scripts/sprites.py` and the B21 sticker cut-outs share one list, kept in `docs/roles.md`; a cut made for a sticker is reused as a sprite and the other way round.
8. **Scope:** the vertical slice (MG1 to MG4, about 16 h) runs after the round-1 P1 tickets. MG5 to MG10 start only on a "go" from the MG4 playtest **and** the UX lead's acceptance of the slice.

**UX acceptance for every MG ticket (hiring-client view):** within 30 s of opening a game, a client sees at least 5 of Ekky's characters at full size; every character names its artwork and opens it in one tap; Hire Ekky is reachable in one tap from every pause, stage end and dialog; nothing can be lost, failed or locked; menus and reveals follow the B39 motion tokens; no franchise name and no "boss" wording anywhere in the product.


## Owner direction

Typed in the Game Director session, 2026-10-27, quoted exactly:

> "make some of minigames that work like real games portofolio
> game like metal slug *re-use all of his aset
> game like zelda but isomorphic *re-use all of his aset"

Owner answers, typed in the Game Director session, 2026-10-27: "yes paint and befriend is ok, sound effects only" (closes owner questions 2 and 5), and "use ekky as the hero, landscape is fine" (closes owner questions 3 and 4).

Read as two minigames that play like real games and work as a portfolio:
- **A run-and-gun side-scroller**, the genre Metal Slug made famous.
- **A top-down adventure in an isometric view**, the genre Zelda made famous ("isomorphic" is read as isometric).

Both are built **only from Ekky's own artwork**, and every one of his 29 original pieces (`kind: "original"` on `main`, 251fd97) has a role in at least one of the games (see the role table). This also follows the owner's direction "make sure all art work has its role".

The other owner directions still hold:
- simple (understood in one look);
- no lives, no trophies, nothing ever locked;
- de-gamified, play your way;
- slow, purposeful animation ("dont make the animation too fast make it slow but make sense");
- every feature switchable in `FEATURES`.

## Hard rules for both games

1. **Genre only, never the franchise.** These games borrow how a genre plays (run, jump, shoot, ride a vehicle; explore, talk, find, solve). They take nothing from the Metal Slug or Zelda games:
   - no names, logos or characters;
   - no music or sound effects;
   - no fonts, HUD look or iconic items (no hearts row, no triangle relic, no green tunic, no sword-in-stone, no rupee-like gems, no tank silhouette copied from those games).

   Neither franchise name appears in the user-facing text, the code or the page metadata.
2. **Only Ekky's own art.** Every sprite, background, prop and boss comes from a piece with `kind: "original"` that passes `shareable()`. Fan-art and client pieces never appear in the games. Simple shapes in his palette (plan rule 4) fill the gaps: tiles, paint blobs, the ground line, UI frames.
3. **No death, no game over, no lives, no score chase, no locks.** Getting hit has a short, readable consequence (knockback, a paint splash, half a second of slowdown) and is never punished. Every stage and every island area is open from the first second.
4. **Friendly, not violent.** The hero fires **paint**, not bullets. A painted enemy turns from grey-outlined to full color, smiles and wanders off as a friend. A boss isn't defeated: it is "colored in", calms down, and its artwork opens. On screen, bosses are never called "boss" and nothing is framed as a "boss fight" (owner: "dont add bossfight theme"); they are big, grumpy characters to calm down with paint. "Boss" in this brief is only a design term. This fits the site (color with Ekky), keeps it all-ages, and suits a client looking at a portfolio.
5. **Portfolio first.** Every character, place and boss names the artwork it comes from. One tap opens that piece in the lightbox, with its title, description and "Want art like this? Hire Ekky". The Hire Ekky chip stays visible whenever the game is paused, on every stage end and on every Quest dialog.

---

## Ekky's Village: the map and the Quest are one island

**Status: proposed by the Game Director, pending UX lead approval.** It is built first, before Paint Patrol and before the rest of the Quest, because every visitor sees the map.

### Owner directions
- Typed in the Game Director session, 2026-10-27, quoted exactly: "make the map isomoprihc like this" (with a screenshot of an isometric village from another mobile game) and "but with animation and re-createfd with his asset".
- Typed in the integrator's session, as relayed by the integrator: "make the map like this so no bossfight" (with a screenshot of a cozy isometric town-builder) and "re-use all of asset of his as much as possible".

**The screenshots are a mood reference only:** cozy, isometric, peaceful, lots of small life. Nothing is taken from those games: no building, character, texture, UI art, button style, bottom bar, layout, currency or resource counter. Everything on the island is cut from Ekky's own pieces exactly as drawn: never redrawn, traced or extended. The only things not from his drawings are plain shapes in his palette: ground tiles, paths, water, plank bridges, smoke puffs and shadows (plan asset rule 4).

### One island, two ways to see it
| View | How you get there | What it is |
|---|---|---|
| **Village** (zoomed out) | The Map tab (the face button) | The whole island fits on one phone screen. Every place is a labeled button: tap it to visit. Villagers stroll the paths. |
| **Explore** (zoomed in) | The "Explore" tile on the start screen, or the signpost in the village | Same island, same places, same villagers. The camera zooms in on Ekky at his desk, and you walk with him (tap a spot to go there). This is Little Planet Quest. |

Switching between the views is one camera zoom of 600 ms, ease-in-out. Nothing reloads. One isometric engine, one tile map and one sprite set serve both views, so nothing is built twice.

### It extends the interim map (dev/assets 2f09d76)
The Developer's interim map already has the right bones: five floating isometric islands, each a real `<button>` with one of Ekky's cut-outs and a label sign, joined by plank bridges, all visible on the iPhone 13 screen. The village grows from that rather than replacing it:
1. **Keep the archipelago.** The village is a main island plus small islets on a calm sea, joined by the same plank bridges. The interim's five islands become five of its districts.
2. **Keep places as DOM buttons** (accessible, at least 44 px, labeled). Add a canvas layer under and between them for the ground detail, walking villagers and ambient motion.
3. **Replace each island's single icon with a small scene** built from that piece's cut-outs: a building or landmark, 2 or 3 props and a sign. See the places table.
4. **Remove the per-island bob** (`islandBob`, 5 endless loops at once). Ground doesn't float; the life comes from villagers and clouds.
5. **Drop the "boss" class and its red styling** on Final Quest (no boss-fight theme). It becomes the warm lantern-lit gate below.
6. **Move the Star Catcher header button into the village** as the Observatory. There is one entry point on the map, plus the start-screen tile.
7. **Fix the Level 1 picture.** The interim's "Who is Ekky?" island shows the blue-haired face, which `docs/roles.md` lists as the Secret Android character. Ekky is the glasses guy (owner, confirmed by the integrator), so his home shows the glasses guy at his desk from Little Planet. The middle tab and the favicon keep `face.png` as the owner asked.

### Places (tap to visit)
Seven **main places** carry an action. Each is a labeled button visible on the first screen without panning. Around them, **scenery places** open their artwork when tapped.

| Main place | Built from (cut exactly as drawn) | Tap opens |
|---|---|---|
| **Ekky's home**, the center islet | Little Planet: Ekky at his desk on his chair, the laptop, the moon planet; around him the floating doodles (book, cassette, robot, microphone, map pin, cat, palette, planet) | Level 1 "Who is Ekky?" (the hiring facts) |
| **Paint studio** | Giraffe Ride: the giraffe with the kid, the wooden fence and trees; the pen-hand cut-out as the sign | Color with Ekky |
| **Gallery** | Toybox Packaging: the doodle-covered box, building-sized, with the palette cut-out as its flag | Art (every piece) |
| **Doodle corner** | Monster World Doodles: the ghost at the door, with the alien, worm and crocodile peeking around it; the "HEY" lettering as the sign | Level 4 "Doodle to Done" |
| **Observatory** | Astronaut (NFT #3) on the hill, with Radio Explorer (NFT #9) at his radio; the helmet cut-out as the sign | Star Catcher |
| **Bus stop** | Coexistence: the bench, the bus-stop sign and the commuters (kid with backpack, gargoyle in a suit, orange many-eyed monster); the Broken-Down Bus parked beside it with the bear on the roof and the lion driver | Paint Patrol (once built; switch `paintPatrol`) |
| **The gate**, the island's edge | Hidden Monster: the stone gate with its carvings and gargoyle statues, the two kids with the lantern; the monster-head cut-out as the sign | Hire Ekky (Final Quest sheet). No boss wording. |

| Scenery place | Built from | Tap opens |
|---|---|---|
| Snack bar shop front | Monster Snack Bar: the counter, fries, the big purple monster behind it, the teal monster in sunglasses, the kid in the orange cap | Monster Snack Bar |
| Noodle bath house | Noodle Bath: the walking ramen bowl with the kid in it, the chopsticks and egg | Noodle Bath |
| The lake | Afloat: the boy on his swim ring, three fish, the beach ball; Big Catch: the wooden pier, the fishing kid, the shark | Afloat or Big Catch (whichever was tapped) |
| The beach | Buried at the Beach: the buried kid, the crab, palm trees | Buried at the Beach |
| Market lane | Morumelons: the robot, dino-hoodie kid and box-head kid at the stalls; the Character Crowd Banner kid in the red beanie and the pink-haired girl as shoppers | Morumelons or Character Crowd Banner |
| Monster's house | Monster in My Room: the green one-eyed monster napping in the doorway, the teddy bear, the basketball | Monster in My Room |
| Ekky's day | A Day in the Life: the four panels as four lit windows of one house (waking up, driving, eating, working) | A Day in the Life |
| Plaza fountain | Tangled Hands: the knot of hands as the plaza statue | Tangled Hands |
| Village sign | Type Is Art in Motion: the lettering as the village's name board | Type Is Art in Motion |
| Robot workshop | Secret Android: the robot reveal | Secret Android |
| Camp by the fire | RPG: the orc, the mouse knight and the armored giant resting (no fire spirit until confirmed; no fight) | RPG |
| Cliff lookout | Viking vs Dragon Kid: the two kids on the cliff edge, watching the sea (not fighting) | Viking vs Dragon Kid |
| Night trail | The Blue Bird: the hiker with binoculars, the tall grass; the glowing bird circles above her | The Blue Bird |
| Tiger rock | Year of the Tiger 2022: the tiger asleep in the sun, the paper plane caught on a branch | Year of the Tiger 2022 |
| Bonfire hill | Virus and War: the helmet kid and the running kid waving (the Paint Patrol heroes' cameo) | Virus and War |

**Client pieces as scenery** (UX lead decision: drawn elements only, never logos, wordmarks, signs or lettering; never in Paint Patrol or Quest gameplay). Each opens its piece with its "Client: X" tag.

| Client scenery | Elements | Tag |
|---|---|---|
| Market lane shoppers | Indomaret: scooter rider, 2 or 3 shoppers, the skateboarder, the cat | Client: Indomaret |
| Observatory picnic | BCA Flazz: the two snacking astronauts, the octopus | Client: BCA |
| Temple corner | Ancol: the barong mask on a stand, the komodo, the dancers, the temple | Competition entry: Ancol |
| Cafe corner | MSI: the creator at the laptop with 2 of the monsters | Client: MSI |
| The beach party | Oasis: 2 or 3 party characters, palm trees, cacti, the sun | Client: Fizzy Tube |
| Ekky's front yard | Save Early, Buy Future: the grandparents on a bench, the graduate, the golden chicken | Client work |

**Open point for the UX lead:** the Village and the Quest are now the same island, so client scenery would also be visible while exploring. Proposed: keep it as scenery in both views, tappable to open its piece, but **never part of Quest gameplay** (no dialog lines, no lost-doodle tasks, no paths that depend on it). **UX lead decides.**

### Villagers
- Characters that stand or move upright stroll the paths, cut exactly as drawn:
  - the Coexistence kid and commuters;
  - the Hidden Monster kids with their lantern (only after dark);
  - the Broken-Down Bus caped hero and bear;
  - 3 or 4 Monster Snack Bar monsters;
  - the Monster World Doodles ghost, alien, dog and worm;
  - the giraffe with the kid;
  - the walking ramen bowl;
  - the Morumelons robot, dino-hoodie kid and box-head kid;
  - the Character Crowd Banner beanie kid and pink-haired girl;
  - Plug Hero;
  - the Virus and War running kid;
  - the RPG orc and mouse knight;
  - the Viking kid and the Dragon kid;
  - client walkers: the Indomaret shoppers, skateboarder and cat, and the Save Early graduate.
- Two drive or ride a loop on the island road: the Road Trip yellow car (with the cat on the roof) and the Merdeka 77 cyclist.
- **Calm, not crowded:** at most 8 walkers on screen at once. Every 45 s one walker leaves and another arrives, so all of them appear within a few minutes.
- **Walk cycle:** the paper-puppet bob from the motion table below: a 700 ms bob, a 4 degree lean, 1 tile every 1.6 s. A walker pauses 1 to 3 s at corners and at places.
- **Facing:** a walker going the other way is mirrored. Mirroring only flips the cut-out, nothing is redrawn. Cut-outs with lettering are never mirrored (they only walk one way).
- **Tap a villager:** they stop and turn to face you, and a small card opens with the piece's title, one line from its description and "See the artwork" (the lightbox, which has "Want art like this? Hire Ekky"). Hit areas are at least 44 x 44 px, even when the sprite is smaller.

### Ambient motion (slow, every motion means something)
| Motion | Timing | Meaning |
|---|---|---|
| Clouds drift across the sky band | 70 to 90 s per crossing | Time passes, calm. The one endless background loop besides the sky. |
| Smoke puffs: soft translucent circles from the snack bar and the noodle bath (and from any chimney that is in the drawing itself) | 1 puff every 3 s, each rising and fading over 2.5 s | Someone is cooking. |
| Water shimmer on the sea and the lake | A slow color shift, 8 s | Water. |
| The gate's lantern | Soft glow pulse, 4 s | "Come here when you're ready" (Hire Ekky). |
| Day to night | Follows the visitor's own clock: day 06:00 to 18:00, dusk, night. Night lights the windows of "Ekky's day" and brings out the lantern kids | The village lives on your time. |
| Tap a main place | Ekky glides on his chair from his home to it (0.6 to 1.2 s by distance), the place lifts 4 px and its sign glows once (300 ms), then it opens. A second tap during the glide opens it at once | "I'm going there". |

- **Reduced motion:** no walking, no glide, no smoke or shimmer. Villagers stand still at their spots, and every place and villager stays tappable.
- **Performance:** pause every animation on screens that are not visible. Today the Art screen's 46 `catBob` and 46 `skel` loops and the loader's `dot` loops keep running behind the map.

### Tab bar
Keep the three tabs (Art, the face button, Mine). Their tiles can take warmer rounded squares in Ekky's palette: cream `#FFF3DC` with a soft `#2B1342` shadow, and the active tab filled with yellow `#FFB400`. They don't copy the reference's bar (no wood, no extra tabs, no frames).

### Tickets (replaces the map part of B06; merges MG6 and MG7; for the UX lead to slot)
| # | Ticket | Owner | Size | Depends | Acceptance test |
|---|---|---|---|---|---|
| V1 | **Village layout**: the archipelago from the interim map, the 7 main places as scenes from their cut-outs, labels, paths and bridges, zoom-out camera | DEV, UX (labels) | L (6 h) | 2f09d76, V2 (first batch) | On the iPhone 13 viewport, all 7 main places are visible without panning, each a labeled button of at least 44 px that opens its content in one tap. No "boss" class or wording. Level 1 shows the glasses guy. `npm run check` passes. |
| V2 | **Shared cut-out batch** (MG2 and B21 merged): every element in the asset-yield table, from `docs/roles.md` | DEV, UX (contact sheet) | L (8 h, in 2 batches: main places first, then villagers and scenery) | MG1 (puppet animator), B21 | `scripts/sprites.py` regenerates byte-identical files. The contact sheet shows each cut on dark and on white with clean edges. Nothing is cut from fan art, and nothing from client pieces outside the allowed elements. |
| V3 | **Villagers and ambience**: walkers, the road loop, tap-a-villager card, clouds, smoke, water, lantern, day and night, reduced motion | DEV | M (4 h) | V1, V2 | At most 8 walkers at once, at the speeds above. Tapping one opens its artwork card. With reduced motion, nothing moves and everything is tappable. 60 fps in a Chrome trace with 4x CPU slowdown. Off-screen animations paused. |
| V4 | **Explore mode** (was MG6 and MG7): zoom in, tap-to-walk with A* on the same tile map, HTML dialog lines, the lost-doodle tasks, the guide bird, Ekky's laptop menu | DEV, UX (lines) | L (10 to 12 h) | V1 to V3 | Switching views takes 600 ms, with nothing reloading. Every area is reachable from the start. Every character names and opens its artwork. Tasks gate nothing. Hire Ekky is one tap from every dialog. |
| V5 | **Client scenery** (UX decision) | DEV | S (2 h) | V2 | The 6 client sceneries appear as listed, each opening its piece with its tag. No logo, wordmark, sign or lettering is visible. None appears in Paint Patrol, and none in Quest dialog or tasks. |
| V6 | **Director playtest of the village**, and UX acceptance | DIRECTOR, UX | S | V3 | Report on calm, cozy, simple, motion feel and "does a tester open at least 3 artworks within 60 s?". Go for V4. |

**New order:** V1 → V2 → V3 → V6 (playtest) → V4, then the Paint Patrol slice (MG1, MG3, MG4) and the rest. MG1's puppet animator and game loop are built first as part of V2/V3 and reused by Paint Patrol. MG6 and MG7 are replaced by V1 to V4.

### Asset yield: every element, and where it appears
Built from the "Elements to cut (shared catalogue)" column of `docs/roles.md` (the single list, not a new one), with the "where it appears" mapping added. One cut per element, reused everywhere.

Key:
- **V-place** = a main place in the village; **V-scene** = village scenery; **V-walk** = a village walker.
- **PP** = Paint Patrol; **Q** = Explore (Quest) gameplay.
- **St** = sticker (B21); **Col** = coloring page.
- **SC** = Star Catcher; **L** = a level sheet.

| Piece | Elements and where each appears |
|---|---|
| `little-planet` | Ekky at his desk on his chair: V-place (home), **hero** of PP and Q, L1. Laptop: Q (Ekky's menu). Desk, moon planet: V-place (home). Cat, palette, planet, pen-hand (done): signs and flags (studio, gallery), St, SC (+3 palette). Book, cassette, robot, microphone, map pin: home props, Q lost doodles, St. Whole piece: Col |
| `coexistence` | Kid with cap and backpack: V-walk, PP friend, St. Gargoyle commuter: V-place (bus stop), PP stage-1 cheering, St. Orange many-eyed monster: V-walk, PP enemy, St. Bench, bus-stop sign: V-place (bus stop). Brick street: PP stage-1 backdrop layers |
| `hidden-monster` | Two kids with a lantern: V-place (gate), V-walk at night, Q Lair, St. Mimic chest: Q Lair, St. Stone gate with carvings: V-place (gate), PP stage-4 final door. Gargoyle statues: gate props. Dungeon hall: Q Lair backdrop |
| `blue-bird` | Hiker girl: V-scene (night trail), Q. Glowing bird: Q guide, SC rare +5. Night mountain trail, tall grass: V-scene, the PP/Q night sky band |
| `old-bus` | Yellow bus: V-place (bus stop), PP stage-2 vehicle. Bear, lion driver, caped hero, passengers: bus-stop props, V-walk (caped hero, bear), PP riders, St. Desert road and skyline: PP stage-2 backdrop |
| `monster-crowd` | Big purple monster: V-scene (snack bar), PP stage-4 grumpy friend. Teal monster in sunglasses, pink monster: V-walk, PP enemies, St. Skull sun: snack-bar sign. Kid in the orange cap: V-scene. Fries, snack counter: V-scene, PP stage-4 backdrop |
| `doodles` | Ghost (done): V-place (doodle corner), L4, St. Alien, crocodile, worm, dog: doodle-corner props, V-walk, PP enemies, St. Skull, UFO, viking head, pumpkin: props, St. "HEY" lettering: doodle-corner sign. "Monster World" lettering: map title band |
| `monster` | Green one-eyed monster: V-scene (monster's house), PP stage-1 grumpy friend, St. Head (done): gate sign, Final Quest. Kid on the bed, teddy bear, basketball: house props, St. Bedroom: Q house interior |
| `floating-boy` | Boy on a swim ring: V-scene (lake), PP stage-3 friend. Three fish: lake life, PP stage-3 enemies. Beach ball, can: props. Pool water: lake texture, PP stage-3 layer. Whole piece: Col |
| `summertime` | Buried kid: V-scene (beach). Crab: V-walk on the beach, PP stage-3 enemy, St. Palm trees: island trees everywhere. Sea and beach: PP stage-3 backdrop, shore band |
| `beansproud-vs-puff` | Viking kid, dragon kid: V-scene (cliff), V-walk, PP stage-4 allies, St. Cliffs and mountains: island edge, PP far layer. Whole piece: Col |
| `virus-and-war` | Running kid: V-walk, PP. Helmet kid with the paint blaster: V-scene (bonfire hill), PP ally power-up, St. Viruses (done): SC hazard, PP enemies. Burning globe, red cloud sky: PP sky band |
| `rpg` | Armored giant, orc, mouse knight: V-scene (camp), Q Lair camp, V-walk (orc, knight), St. Skeleton warriors: camp props. Grass field: island ground detail. Fire spirit: on hold |
| `shark` | Shark: V-scene (lake), PP stage-3 grumpy friend, St. Fishing kid, wooden pier: V-scene (lake). Water splash: lake detail. Whole piece: Col |
| `giraffe` | Giraffe with the kid: V-place (paint studio), V-walk, Q ride, St. Wooden fence, trees, grass patch: studio props, island hedges. Whole piece: Col (first page) |
| `noodles` | Walking ramen bowl with the kid: V-scene (noodle bath), V-walk, St. Chopsticks, egg: props. Whole piece: Col |
| `nft-3` | Astronaut: V-place (observatory), PP shield power-up, St. Helmet (done): observatory sign, SC button |
| `nft-9` | Radio explorer: V-place (observatory), Q radio hints, St |
| `morumelons` | Robot, dino-hoodie kid, box-head kid, green orc, pink-haired girl, boxer, ninja: V-scene (market lane), V-walk, PP stage-2 enemies, St. Crowd: market backdrop. Morumelons lettering: market sign |
| `web-illustration` | Beanie kid, pink-haired girl, blue genie, mustached man: V-walk (genie floats), PP credits parade, St. Phone with a coin: market prop |
| `plug-hero` | Plug Hero: V-walk (winds himself up at corners), PP dash power-up, St. Whole piece: Col |
| `toybox` | Doodle box: V-place (gallery building), Q pushable crates (smaller copies), St |
| `type-is-art` | Lettering frames: V-scene (village sign), PP credits title, L4 |
| `android` | Blue-haired face (done): middle tab, favicon, avatar. Robot reveal frames: V-scene (robot workshop), Q |
| `hello-2022` | Tiger: V-scene (tiger rock), PP stage-2 grumpy friend, St. Kid rider with headphones: V-walk. Paper plane: tiger-rock prop, St. "2022" numbers: not used (lettering) |
| `road-trip` | Yellow car with friends: V-walk (road loop), PP stage-2 background car, Q fast travel, St. Cat on the roof, little bird, pinwheel: props. Signpost: V "Explore" signpost. Whole piece: Col |
| `day-in-life` | Four panels: V-scene (Ekky's day, as four windows), L1, Q Ekky's house rooms. Blue-haired guy: inside the windows. Whole piece: Col (one panel at a time) |
| `kemerdekaan` | Cyclist with the flag: V-walk (road loop), Q courier, St. "77" numbers: not used (lettering). Whole piece: Col |
| `hands` | Knot of hands: V-scene (plaza fountain), Q knot puzzle. Whole piece: Col |
| `indomaret` (client) | Scooter rider, shoppers, skateboarder, cat: V-scene (market lane), V-walk. Storefront and sign: never |
| `bca-flazz-card` (client) | Two astronauts, octopus: V-scene (observatory picnic). Logos and the CRAZZ wordmark: never |
| `ancol-logo` (client) | Barong mask, komodo, dancers, temple: V-scene (temple corner). Wordmark and the 77 logo: never |
| `msi` (client) | Creator at the laptop, 2 monsters: V-scene (cafe corner). Logo: never |
| `oasis` (client) | Party characters, palm trees, cacti, sun: V-scene (beach party). Fizzy Tube logo and the OASIS title: never |
| `save-early-buy-future` (client) | Grandparents, graduate, golden chicken: V-scene (Ekky's front yard), V-walk (graduate). Coins, house, plane: props. Campaign lettering: never |
| Existing cut-outs | `assets/ui` icons (face, pen-hand, palette, planet, cat, ghost, virus, monster head, helmet) and the category doodles (book, robot, cassette, microphone, planet): place signs, flags and home props. The logo: the village name board's small badge |

Not in the village or the games: the 8 fan-art pieces (never), and the client pieces with nothing drawn to cut (Tea Break, My Sports Club, Thinker & Doer). They stay in the portfolio, the Art tab and the gallery building's frames.

---

## Game A: "Paint Patrol" (run-and-gun side-scroller)

### One-line pitch
Ride through Ekky's illustrations as **Ekky himself** on his desk chair, paint every grey doodle monster back into color, ride the Broken-Down Bus, and color in four big bosses.

### Why this genre fits a portfolio
- His big scenes (Coexistence, Broken-Down Bus, Monster Snack Bar, Buried at the Beach) are already wide, layered and full of characters. They become parallax stage backgrounds almost as they are.
- His monsters (Monster World Doodles, Monster Snack Bar, Virus and War, Monster in My Room, Year of the Tiger, Big Catch, Boss Fight) are a ready-made cast of enemies and bosses.
- A client playing for 2 minutes sees more than 20 of his characters move, at full size, in his palette.

### Controls (as simple as possible)
| Device | Move | Jump | Paint | Paint bomb |
|---|---|---|---|---|
| Phone | Drag on the left half of the screen (a thumb stick appears where you touch) | Tap the right half | **Automatic:** fires forward at a steady rhythm whenever an enemy is ahead | Double-tap the right half (12 s recharge, shown as a filling palette) |
| Desktop | Arrow keys or A / D | Up, W or Space | Automatic (or hold X to aim up) | Z |

- **Landscape** (owner: "landscape is fine"). In portrait, a calm "Turn your phone sideways" card shows Ekky's chair turning, with a "Play anyway" button that runs a zoomed-in view.
- On first play, a hint shows once and fades after 4 s: "Drag to run, tap to jump. Painting is automatic."

### Rules
- **Painting:** each paint blob hits once. A normal enemy needs 3 hits, a big one 6, and a boss shows a "color meter" that fills as you paint it.
- **Getting touched:** the hero is knocked back about 120 px, gets a paint splash on his chair and is invulnerable for 0.8 s. Nothing is lost. There is no health bar.
- **Power-ups** (dropped by befriended enemies, no counters):
  - pen-hand = rapid paint for 6 s;
  - palette = a rainbow spread shot of 3 blobs for 6 s;
  - Plug Hero = he runs across the screen and paints everything in his path;
  - Astronaut helmet = a bubble shield that absorbs the next knockback.
  - The helmet kid from "Virus and War" = he runs in for 8 s and paints alongside Ekky, then waves and leaves.
- **Vehicle:** in stage 2, the Broken-Down Bus rolls in. Jump on its roof and it becomes a slow, sturdy moving platform with a big paint cannon (the bear, the lion driver and the caped hero ride along and cheer). Jump off at any time.
- **Stage end:** the stage's original artwork fades in, full screen and slowly (D-motion below), with its title, one line of description, "See it in the portfolio" and the Hire Ekky chip. Then "Next stage", "Pick a stage" or "Something else".
- **No score, no timer, no stars.** The stage-select screen shows which stages you've seen with a small painted frame, never as a percentage.

### Stages (each 60 to 120 s, all open from the start)
| # | Stage | Background (parallax layers cut from) | Enemies and friends | Boss |
|---|---|---|---|---|
| 1 | **Rush Hour** | Coexistence (the bus-stop street, the gargoyle commuter cheering from the bench) | Viruses from Virus and War; small doodles from Monster World Doodles | **The green one-eyed monster** from Monster in My Room (swings his hammer in slow, readable arcs; paint him to calm him down) |
| 2 | **Breakdown Road** | Broken-Down Bus (desert road, clouds, the city on the horizon); the Road Trip car honks past in the background | Monster Snack Bar monsters; Morumelons characters | **The tiger** from Year of the Tiger 2022 (leaps from the 2022 letters; a pounce is telegraphed by 0.8 s of crouching) |
| 3 | **Beach Day** | Buried at the Beach (sand) and Afloat (water, with the floating boy drifting by as a friend) | The crab from Buried at the Beach; the fish from Afloat | **The shark** from Big Catch (jumps out of the water in arcs; the fishing kid from the same piece cheers from the pier) |
| 4 | **Snack Bar Riot** | Monster Snack Bar (counter, fries, crowd); the Hidden Monster gate as the final door | Mixed doodles and Monster Snack Bar monsters; the Viking kid and the Dragon kid from "Viking vs Dragon Kid" join as allies who paint alongside you | **The big purple monster** behind the Monster Snack Bar counter (it gets grumpy about the riot; paint it to calm it down, and the snack bar crowd cheers) |
| Credits | **Parade** | The Character Crowd Banner scrolls past as a crowd of every friend you made, with the "Type Is Art in Motion" lettering as the title | Everyone you painted dances | none |

### Hero
**Ekky** (owner: "use ekky as the hero"). Ekky is the glasses guy from Little Planet (owner, Game Director session: "the glasses guy is ekky"; confirmed in the integrator session: "yes to all").
- **No redrawing:** the only full-body drawing of him is Little Planet, where he sits at his desk on a chair holding a stylus. So by default, **Ekky rides his desk chair**, cut out exactly as drawn. The chair glides along the ground (run), hops (jump), and the paint comes from his stylus.
- The owner confirmed there are no separate PNG files ("no png files, cut them from the images"), so **the chair version is final**.
- `CONFIG.games.hero` points to the sprite file, so it can be swapped later without code changes.

---

## Game B: "Little Planet Quest" (isometric adventure)

> **Now part of Ekky's Village** (section above): the Quest is the "Explore" view of the village island, built in ticket V4. The areas below become the village's places and scenery; the island table is kept as the content list for V4.

### One-line pitch
Walk around a small isometric island where every house, tree and character comes from one of Ekky's drawings. Meet his characters, help them, and find the artist at his desk in the middle.

### Why this genre fits a portfolio
- **The island is the portfolio.** Each area is a group of pieces, and each character you meet opens their artwork. A client explores his whole range in 3 to 5 minutes, in any order.
- Talking to characters gives a natural place for the UX lead's one-line descriptions ("A kid hitches a ride on a friendly giraffe.").

### Controls
| Device | Move | Interact |
|---|---|---|
| Phone | **Tap where to go** (the hero walks there along a path); or drag for direct control | Tap a character or an object next to you |
| Desktop | Arrow keys or WASD (8 directions), or click to walk | Space or E |

The glowing bird from "The Blue Bird" follows Ekky. After he stands still for 6 s, it flies slowly toward the nearest place you haven't seen yet. It never speaks, chimes or flashes for attention (UX review point 4). It is a gentle suggestion, never a requirement (principle 3).

### Rules
- **No combat, no health, no locks.** Every area is reachable from the start.
- **Optional little tasks**, which never gate anything. Seven characters have each lost a small doodle, scattered on the island: the book, cassette, microphone, robot, planet, palette and cat cut-outs from `assets/`. Bring it back and they do a short happy animation and say a thank-you line. That is the whole reward.
- **Painting the world** (ties to Color with Ekky): a few objects start as grey line art (a bridge, a fountain, the observatory dome). Tapping them with the pen-hand paints them in his colors over 1.2 s. It only changes looks, and there is always another way around.
- **The Sketchbook** (top right, `i-frame` icon) lists every artwork you have met, as thumbnails. It has no counter, no percentage and no "x of 29". Each thumbnail opens the lightbox.
- **Home base:** the hub is Ekky's desk on the Little Planet. The laptop gives three choices: "About me" (the hiring facts from B26), "Hire Ekky" (the Final Quest sheet) and "Show me everything" (the classic portfolio).

### The island (about 28 x 28 tiles, 11 areas)
| Area | Built from | Who you meet and what happens |
|---|---|---|
| **Hub: Little Planet** | Little Planet (the moon, the desk, the floating doodles) | Ekky's home base. His laptop on the desk offers "About me" (the hiring facts from B26), "Hire Ekky" (the Final Quest sheet) and "Show me everything" (the classic portfolio) |
| **Giraffe Meadow** | Giraffe Ride (fence, trees, grass) | The giraffe and the kid. Ride the giraffe to cross the island at 2x speed |
| **Noodle Bath House** | Noodle Bath | The kid in the bowl. The bowl walks on its noodle legs to a new spot every minute |
| **The Lake** | Afloat, Big Catch | The floating boy drifts in circles. The fishing kid is on the pier; the shark jumps at the end of his line |
| **Bus Stop** | Coexistence, Broken-Down Bus, Road Trip | The commuters on the bench. The broken-down bus with its passengers. The Road Trip car is a fast-travel ride to any area |
| **Market Street** | Morumelons, Toybox Packaging, Type Is Art in Motion | Morumelons characters run the stalls. Toybox boxes as crates you can push. The Type Is Art lettering as the street sign. The grey fountain to paint |
| **Ekky's House** | A Day in the Life (the four panels become four rooms) | Walk through his day. The phone on the table opens the island map (a plain frame in his palette) |
| **The Cliffs** | Viking vs Dragon Kid, Merdeka 77 | The two kids duel in slow motion. The cyclist from Merdeka 77 is a mail courier who rides you to the cliff top |
| **Monster Quarter** | Monster in My Room, Monster Snack Bar, Monster World Doodles | The green monster's house, the snack bar counter, doodle monsters wandering about |
| **Hidden Lair** (a small 3-room dungeon) | Hidden Monster, Tangled Hands, RPG | The two kids with the lantern. The mimic chest (it bites, then laughs). A "tangled hands" knot puzzle: rotate 4 tiles to untangle it and open a shortcut (the long way round is always open too). In the last room, the orc, the mouse knight and the armored giant from RPG rest by a fire (no fire spirit until confirmed, UX review point 5) |
| **Observatory** | Astronaut (NFT #3), Radio Explorer (NFT #9), Secret Android | The astronaut stargazing. The radio explorer gives hints over the radio. The Secret Android robot opens up in his workshop |
| **Sky** | The Blue Bird, Year of the Tiger 2022, Virus and War, Plug Hero Mascot, Buried at the Beach | The hiker from The Blue Bird stargazing on a rock, with her glowing bird. The tiger lies in the sun by the gate. The helmet kid from Virus and War waves (Ekky's ally in Paint Patrol, a link to Game A). Plug Hero winds himself up by the beach where the Buried at the Beach kid is stuck in the sand |

### Hero
**Ekky** (owner: "use ekky as the hero"), the same sprite as in Paint Patrol: by default Ekky on his rolling desk chair, cut out from Little Planet exactly as drawn, gliding from tile to tile. The glowing bird from The Blue Bird is his companion. Riding the giraffe swaps the chair for the giraffe until he gets off.

---

## Every original piece has a role

| Piece (slug) | Paint Patrol | Little Planet Quest |
|---|---|---|
| `android` | | Robot in the Observatory |
| `beansproud-vs-puff` | Allies in stage 4 | Cliffs duel |
| `blue-bird` | | **Guide bird**, the hiker in the Sky area |
| `coexistence` | Stage 1 background | Bus Stop |
| `day-in-life` | | Ekky's House (4 rooms) |
| `doodles` | Enemy pool | Monster Quarter, island props |
| `floating-boy` | Stage 3 water and a friend | The Lake |
| `giraffe` | | Giraffe Meadow, ride |
| `hands` | | Lair knot puzzle |
| `hello-2022` | Boss 2 (tiger) | Sky gate |
| `hidden-monster` | Stage 4 final door | Hidden Lair |
| `kemerdekaan` | | Courier on the Cliffs |
| `little-planet` | **Hero** (Ekky on his chair), title screen | **Hero** (Ekky on his chair), **hub** |
| `monster-crowd` | Stage 2 enemies, stage 4 background | Monster Quarter |
| `monster` | Boss 1 (green monster) | Monster Quarter house |
| `morumelons` | Stage 2 enemies | Market stalls |
| `nft-3` | Shield power-up | Observatory astronaut |
| `nft-9` | | Radio hints |
| `noodles` | | Noodle Bath House |
| `old-bus` | Stage 2 background, **vehicle** | Bus Stop |
| `plug-hero` | Dash power-up | Sky / beach |
| `road-trip` | Background car | Fast travel |
| `rpg` | | Lair camp (orc, mouse knight and the giant, peaceful, by the fire; no fire spirit until confirmed) |
| `shark` | Boss 3 (shark) | The Lake |
| `summertime` | Stage 3 sand, crab | Beach by the Sky area |
| `toybox` | | Pushable crates |
| `type-is-art` | Credits title | Island title card, Market street sign |
| `virus-and-war` | Ally power-up (the helmet kid), virus enemies | Cameo (links to Game A) |
| `web-illustration` | Credits parade | |

Never used in gameplay: the 8 fan-art pieces and the 9 client pieces. (Exception, owner "re-use all of asset of his as much as possible": drawn elements of 6 client pieces may be ambient villagers and props in Ekky's Village, never logos, and never heroes, enemies, allies or power-ups; see `docs/roles.md`.) `client` is `true` since the owner's "yes to all", so client pieces are reusable elsewhere, but they stay out of the games: brand logos don't belong in a game world. `js/data.js` enforces this with the `game` role (originals only).

---

## Art production: from drawings to sprites

Ekky's pieces are flat, finished illustrations, not sprite sheets. The owner's answer, typed in the Game Director session: **"no png files, cut them from the images"**. So every sprite is cut from the published images:

- **Cut-outs from the published images**, extending `scripts/ui-assets.py` into `scripts/sprites.py` (Pillow + numpy, already in use; no new packages):
   - Pieces on plain backgrounds (Plug Hero, Giraffe Ride, Big Catch, Road Trip, Merdeka 77, Little Planet, Noodle Bath, the NFT pieces) cut cleanly by background removal.
   - Pieces with busy backgrounds (Coexistence, Monster Snack Bar, Broken-Down Bus, Hidden Monster, Virus and War, RPG) need a polygon mask per character, placed along Ekky's own outline (the mask only selects pixels; the drawing itself is never changed), stored in the script as coordinates and reviewed on the contact sheet like the T1 icons.
   - Backgrounds are split into 2 to 3 parallax layers (sky, far, near) by cropping horizontal bands. Where a character covers the scene, a soft blur fills the gap behind it. **Nothing is redrawn:** every sprite is Ekky's own drawing exactly as he made it, only cut out and moved. No character is redrawn, traced, extended or imitated, and nothing comes from any existing game.

**Animation without new drawings: "paper puppet" motion.** Each sprite is one still cut-out, moved by code, like a paper cut-out theatre. It suits Ekky's thick-outlined style and needs no extra frames. Following the owner's "slow but make sense":
| Action | Motion | Duration | What it tells the player |
|---|---|---|---|
| Walk / run | A gentle up-and-down bob and a 4 degree lean forward | 700 ms per bob walking, 450 ms running | "I'm moving this way" |
| Idle | A slow breath: scale 1.00 to 1.02 | 2.4 s | "I'm alive, waiting" |
| Jump | Squash 6% before take-off, stretch 4% at the top | 120 ms, then 600 ms in the air | "I'm launching", without cartoon overshoot |
| Paint hit on an enemy | One white flash, then the color fills from the hit point outward | 150 ms flash, 900 ms fill | "That worked, it's changing" |
| Befriended | A small hop and a 360 degree turn to face away, then a calm walk off | 1.2 s | "It's a friend now, it's leaving" |
| Boss wind-up | A crouch and lean back before every attack | 800 ms | "Something is coming, get ready" |
| Knockback | Slide back, then a 10 degree tilt that eases out | 400 ms | "I got bumped", without a shake |
| Artwork reveal | Fade and a slow zoom from 96% to 100% | 1.4 s | "Here is the real piece" |

- No idle loops on top of other loops.
- Easing is ease-out (`cubic-bezier(.2,.7,.2,1)`) and never springy.
- Under reduced motion: no bob, lean, squash or zoom. Fades only.

---

## Technical approach

- **Folder:** `js/games/engine.js` (a shared engine of about 400 lines), `js/games/paint-patrol.js`, `js/games/planet-quest.js`, `js/games/levels/*.js` (stage and island data), and `assets/sprites/` (generated cut-outs plus one atlas per game).
- **Engine:**
  - Canvas 2D with `devicePixelRatio` scaling.
  - A fixed 60 Hz update loop with interpolated drawing.
  - Input from keyboard, pointer and touch, with the virtual thumb stick.
  - Camera with parallax, AABB collision, the puppet animator, and sound effects only, from the existing synth (owner: "sound effects only"; no music; honors the sound toggle; off by default on the web).
  - Pauses on `visibilitychange`.
  - No new npm packages. Isometric drawing uses 2:1 diamond tiles (64 x 32 px) and a depth sort by tile row plus height. Tap-to-walk uses A* on the tile grid.
- **Loading:** both games load only when opened (a dynamic `import()`, or a script tag added on demand). The portfolio's first load does not grow. Budget per game: JS under 40 KB gzip, sprites and backgrounds under 1.5 MB, first frame under 1.5 s on a mid-range phone after tapping.
- **Feature switches:** add `paintPatrol: true` and `planetQuest: true` to `FEATURES` (B38). Off means no entry point anywhere.
- **Entry points:** two tiles on the start screen next to Color and Catch stars ("Paint Patrol", "Little Planet Quest"), plus the map header. The UX lead decides placement.
- **Deep links:** `?game=patrol&stage=2` and `?game=quest&area=lake` open directly. A bad value opens the stage select or the hub.
- **Saving:** `localStorage` only: stages seen, Sketchbook entries, where you stand on the island. No account (owner: no login).
- **Accessibility:**
  - Every control has an accessible name.
  - Pause is always one tap or key (Esc / P) away.
  - In Quest, dialog text is real HTML over the canvas (readable by screen readers, 16 px minimum).
  - With reduced motion, screen shake and parallax are off.
- **Quality gate G2 applies:** no console errors, phone captures of every stage and area, zero emoji, no fan or client art (extend `npm run check` to scan `assets/sprites/` against the cut-out list).

---

## Proposed tickets (for the UX lead to number and slot)

| # | Ticket | Owner | Size | Depends | Acceptance test |
|---|---|---|---|---|---|
| MG1 | Shared mini engine | DEV | L (4 to 6 h) | B38 | A test scene runs at 60 fps on the phone viewport. Keyboard, touch drag and tap all work. It pauses when the tab is hidden. Reduced motion stops the bob and shake. |
| MG2 | Sprite pipeline and the first 12 cut-outs | DEV, UX (review) | L (6 h) | MG1 | `scripts/sprites.py` regenerates byte-identical PNGs. The contact sheet shows the Ekky-on-chair hero, 6 enemies, boss 1 and the stage 1 layers, each with clean edges on dark and on white. `npm run check` passes. |
| MG3 | **Paint Patrol vertical slice: stage 1 "Rush Hour"** | DEV | L (6 h) | MG1, MG2 | A first-time tester on the phone finishes stage 1 in 60 to 120 s without help. Nobody can lose. The Monster in My Room boss telegraphs every swing. The stage end shows Coexistence and opens it in the lightbox. Hire Ekky is reachable while paused and on the end screen. |
| MG4 | Director playtest of the slice | DIRECTOR | S | MG3 | A short report: fun, simple, motion feel (too fast / too bouncy / meaningless), ranked fixes. Go or no-go for MG5. |
| MG5 | Paint Patrol stages 2 to 4, bus vehicle, bosses 2 to 4, credits | DEV | L (8 to 10 h) | MG4 go | Each stage is selectable from the start and runs 60 to 120 s. The bus can be boarded and left at any time. Each boss telegraphs every attack for at least 0.8 s. |
| MG6 | Isometric engine: tiles, depth sort, tap-to-walk, dialog | DEV | L (6 to 8 h) | MG1 | On the phone, tapping any reachable tile walks the hero there along a path. Sprites draw in the right order behind and in front of each other. Dialog text is HTML and readable. |
| MG7 | Little Planet Quest island content | DEV, UX (lines) | L (8 to 10 h) | MG2, MG6 | All 11 areas exist and are reachable from the start. Every character opens its artwork. The 7 lost-doodle tasks work and gate nothing. The artist in the hub offers Hire Ekky. |
| MG8 | Character lines and stage names | UX | M | MG3, MG7 | One short line per character, in English, from the piece's description. Stage and area names approved. No franchise names anywhere. |
| MG9 | Entry tiles, switches, deep links, lazy loading | DEV | S (2 h) | MG3 | With `paintPatrol` or `planetQuest` off, its tile, link and route are gone. With both on, the portfolio's first load size is unchanged (± 1 KB). The deep links open the right stage or area. |
| MG10 | Director playtest of both games | DIRECTOR | S | MG5, MG7 | The report covers fun, simple, play-your-way, motion feel and "did a tester open at least 3 artworks?". Ranked fixes. |

Order: MG1 → MG2 → MG3 → **MG4 (go or no-go)** → MG5 and MG6 in parallel → MG7 → MG8 → MG9 → MG10. Total DEV time is about 46 to 56 h. The stage 1 vertical slice (MG1 to MG3, about 16 h) comes first, so the owner can see and feel a real game before the rest is built.

---

## Balance starting numbers (Director owns these; tuned in MG4 and MG10)

**Paint Patrol** (in world pixels; the hero, Ekky on his chair, is about 110 px tall):

| Setting | Value |
|---|---|
| Run speed | 200 px/s |
| Jump | about 1.6 hero heights high, gravity 1800 px/s² |
| Paint | 4 blobs per second at 650 px/s |
| Paint bomb | clears the screen, 12 s recharge |
| Enemy waves | every 3 to 5 s, at most 5 enemies on screen |
| Hits to befriend | normal 3, big 6, boss meter 40 |
| Boss attacks | every 2.5 to 3.5 s, each telegraphed for 800 ms |
| Stage length | 6 to 8 screen widths, about 90 s at a relaxed pace |
| Knockback | 120 px, 0.8 s of invulnerability |

**Little Planet Quest:**

| Setting | Value |
|---|---|
| Island | 28 x 28 tiles |
| Walk speed | 3 tiles per second (giraffe 6) |
| Dialog | at most 2 lines per bubble, 3 bubbles per character |
| Lost doodles | 7 |
| Guide bird | waits 6 s after you stop before it moves on |

---

## Owner questions

| # | Question | Safe default |
|---|---|---|
| 1 | Layered character files? | **Answered:** "no png files, cut them from the images". Every sprite is cut from the published images with `scripts/sprites.py`, and Ekky rides his chair (Little Planet). |
| 2 | Is it OK that the hero fires paint, and that enemies are "colored in and befriended" rather than defeated? | **Reported by the Director:** "yes paint and befriend is ok" (not yet verified by the integrator). |
| 3 | Heroes | **Answered:** "use ekky as the hero". Ekky is the hero of both games. |
| 4 | Phone orientation for Paint Patrol | **Answered:** "landscape is fine". Landscape, with a "Play anyway" portrait fallback. |
| 5 | Should the games have their own short music loops, or stay with sound effects only? | **Reported by the Director:** "sound effects only" (not yet verified). No music loops. Sound is off by default on the web. |
| 7 | Is the fire spirit in "RPG" Ekky's own design? | It stays out of both games until confirmed (UX review point 5). |
| 6 | "endi onok bossfight" | **Answered:** "its a joke you can ignore or dont add bossfight theme to this". The RPG piece gets no boss-fight theme: it is not a boss in Paint Patrol, and in the Quest its party camps peacefully. No on-screen text in either game says "boss" or "boss fight" (see hard rule 4). |
