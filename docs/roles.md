# Roles: where every piece is used

Owner: UX lead. Owner direction (2026-10-27, typed in the Developer's session): **"no need to curate the best artwork make sure all art work has its role"**.
Source of truth: `roles` in `PROJECTS` (`js/data.js`). This page is generated from it, plus the cut-out notes for the Developer (B21).

## Rules

- Every piece has **portfolio** (classic grid and lightbox) and **card** (Art tab).
- **Fan art and client pieces keep only those two** (hard rule). `js/data.js` strips any other role from a piece that is not `own`, so a mistake in the list can't leak.
- Every original also has **featured** (the rotating featured row) and **share** (share-card art and card gifts), plus at least one creative role: coloring, sticker, sprite, level, scene or avatar.
- Code asks `hasRole(p, "sticker")` or `withRole("coloring")`; nothing hard-codes a list of pieces.
- Card frame (`rar`) = number of creative roles, capped at 3. It is decoration, not a ranking.

## Counts

| Role | Pieces |
|---|---|
| featured | 29 |
| share | 29 |
| coloring | 11 |
| sticker | 24 |
| sprite | 2 |
| level | 6 |
| scene | 4 |
| avatar | 2 |

## Every piece

| Piece | Kind | Tag | Roles beyond portfolio and card | Cut-outs and notes for the Developer |
|---|---|---|---|---|
| Coexistence (`coexistence`) | original |  | featured, share, sticker | **Cut:** the monster commuter, the kid with the backpack. |
| Hidden Monster (`hidden-monster`) | original |  | featured, share, sticker | **Cut:** the mimic chest, the two kids with the lantern. |
| The Blue Bird (`blue-bird`) | original |  | featured, share, sprite, scene | **Sprite:** the glowing bird as a rare +5 bonus in Star Catcher (replaces the glow star when it appears). **Scene:** night-trail backdrop. |
| Broken-Down Bus (`old-bus`) | original |  | featured, share, sticker | **Cut:** the bear, the lion driver, the caped hero. |
| Monster Snack Bar (`monster-crowd`) | original |  | featured, share, sticker | **Cut:** 3 or 4 single monsters from the counter. |
| Monster World Doodles (`doodles`) | original |  | featured, share, level, sticker | Done: ghost (level 4). **Cut:** alien, crocodile, worm, skull, dog, "HEY" lettering. |
| Monster in My Room (`monster`) | original |  | featured, share, level, sticker | Done: monster head (level 5, Final Quest). **Cut:** the whole green monster as a sticker. |
| Afloat (`floating-boy`) | original |  | featured, share, coloring, scene | Coloring page (medium). **Scene:** pool-water backdrop. |
| Buried at the Beach (`summertime`) | original |  | featured, share, scene, sticker | **Scene:** beach backdrop. **Cut:** the crab. |
| Viking vs Dragon Kid (`beansproud-vs-puff`) | original |  | featured, share, coloring, sticker | Coloring page without the effects layer. **Cut:** the viking kid, the dragon kid. |
| Virus and War (`virus-and-war`) | original |  | featured, share, sprite, sticker | Done: virus (Star Catcher hazard). **Cut:** the running kid and the soldier kid. |
| RPG (`rpg`) | original |  | featured, share, sticker | **Cut:** the orc and the mouse knight. Not the fire spirit until owner question 2 confirms it. |
| Big Catch (`shark`) | original |  | featured, share, coloring, sticker | Coloring page. **Cut:** the shark. |
| Giraffe Ride (`giraffe`) | original |  | featured, share, coloring, sticker | Coloring page (first page if the Road Trip layer is late, D8). **Cut:** the giraffe with the kid. |
| Noodle Bath (`noodles`) | original |  | featured, share, coloring, sticker | Coloring page. **Cut:** the walking ramen bowl. |
| Astronaut (`nft-3`) | original |  | featured, share, level, sticker | Done: helmet (Star Catcher button). **Cut:** the full astronaut (256 px source; ask for a bigger file). |
| Radio Explorer (`nft-9`) | original |  | featured, share, sticker | **Cut:** the radio explorer (256 px source). |
| The Adventuring Party (`dnd`) | fan | Fan art | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Retro Game Pattern (`game-pattern`) | fan | Fan art | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| One Piece Crew (`one-piece-fan-art`) | fan | Fan art | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Rocket & Groot (`rocket-groot-fan-art`) | fan | Fan art | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Miles Morales (`spider-verse-fan-art`) | fan | Fan art | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Godzilla vs Kong (`godzilla-kong-fan-art`) | fan | Fan art | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Finn & Jake: Bring It On (`adventure-time-fan-art`) | fan | Fan art | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Morumelons (`morumelons`) | original |  | featured, share, sticker, scene | **Cut:** the robot, the dino-hoodie kid, the box-head kid. **Scene:** the crowd as a backdrop. |
| Oasis for Fizzy Tube (`oasis`) | client | Client: Fizzy Tube | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Character Crowd Banner (`web-illustration`) | original |  | featured, share, sticker | **Cut:** 2 or 3 characters (treated as Morumelons, "yes to all Morumelon pieces"). |
| MSI Creator Banner (`msi`) | client | Client: MSI | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Tea Break Website (`tea-break-website`) | client | Client: Tea Break | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| My Sports Club App (`my-sports-club`) | client | Client work | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Save Early, Buy Future (`save-early-buy-future`) | client | Client work | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Indomaret Shopping Rush (`indomaret`) | client | Client: Indomaret | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Thinker & Doer (`thinker-doer`) | client | Client work | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Plug Hero Mascot (`plug-hero`) | original |  | featured, share, coloring, sticker | Coloring page (easy). **Cut:** Plug Hero. |
| Monster Noodles Cup (`pop-mie`) | fan | Fan art | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| BCA Flazz Card (`bca-flazz-card`) | client | Client: BCA | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Ancol Logo Entry (`ancol-logo`) | client | Competition entry: Ancol | none (portfolio and card only) | Never cut, colored, redrawn or shared as art. |
| Toybox Packaging (`toybox`) | original |  | featured, share, sticker | **Cut:** the doodle box. |
| Type Is Art in Motion (`type-is-art`) | original |  | featured, share, level | **Level:** the lettering animation plays in level 4 "Doodle to Done" (needs a still first frame, owner question 11). |
| Secret Android (`android`) | original |  | featured, share, avatar, sticker | Done: `face.png` (middle tab, favicon, level 1). Avatar candidate. **Cut:** none more. |
| Year of the Tiger 2022 (`hello-2022`) | original |  | featured, share, sticker | **Cut:** the tiger, the paper plane. |
| Little Planet (`little-planet`) | original |  | featured, share, avatar, level, coloring, sticker | Done: pen-hand (level 2), palette (level 3, Art tab, +3), cat, planet, category icons (`hero.png`). **Cut:** book, cassette, robot, microphone, map pin, the glasses guy at his desk. Coloring page from the line layer (owner question 6). Avatar candidate (HUD, map token today). |
| Road Trip (`road-trip`) | original |  | featured, share, coloring, sticker | Coloring page (first page, D8). **Cut:** the yellow car with friends. |
| A Day in the Life (`day-in-life`) | original |  | featured, share, level, coloring | **Level:** the four panels illustrate level 1 "Who is Ekky?" (a day in his life). Coloring page: one panel at a time. |
| Merdeka 77 (`kemerdekaan`) | original |  | featured, share, coloring, sticker | Coloring page (seasonal, August). **Cut:** the cyclist. |
| Tangled Hands (`hands`) | original |  | featured, share, coloring | Coloring page. |

## Cut-out rules (B21)

- Transparent PNG, 2x display size, cut along Ekky's own outline; no restyling.
- File name `assets/ui/stickers/<slug>-<thing>.png`, for example `old-bus-bear.png`.
- Only from pieces where `hasRole(p, "sticker")` is true; `npm run check` already blocks the rest.
- A cut that fails at 48 px on the dark game background (`#2B1342`) gets a 2 px light outline (same fix as pen-hand).
