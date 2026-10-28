# Morumelons: project prep

Prep for the Flow squad (sprint 3). Assets only: no change to `js/`, `css/` or `index.html`.

## What came in

The owner sent 4 zips (morumelons-1 to -4) with 48 animated GIFs: 1080 x 1080, 40 ms a frame, 24 frames each
(5 have 48), 108 MB in all. Each GIF is one Morumelons character: a bust on a flat or scenic background, with a
short bouncing loop (head bob, a blink, a flame, a floating fish).

- **No duplicates.** No two files are byte-identical, and no two first frames are close (perceptual hash, closest
  pair 36 of 256 bits apart). All 48 are different characters.
- **Near-duplicates (same idea twice)**, so at most one of each pair goes into a project:
  - Heart backgrounds, lovestruck: 27 and 32
  - Helmet over the head, space and sea: 19 (astronaut) and 34 (fishbowl diver)
  - Dark horned knights: 17 and 37; armoured knights: 37 and 45
  - Mountain and forest outdoorsmen: 23 and 47
  - Fire behind the character: 15, 17, 28, 31
- **Left out on purpose** (not about quality):
  - Real brands or logos drawn in: 35 (Dunlop and Red Bull on the racing suit), 21 (green ride-hailing driver
    uniform), 30 (Python logo shirt), 38 (Tetris blocks)
  - A parody of famous paintings: 44 (The Scream over Starry Night)
  - Blood on the face: 46. The site is shared with a children's game, so it stays out.
  - Looks like a base or trait template: 22 (plain blue hair, white shirt)
- **Already on the site:** 19 is the "Astronaut" piece (`assets/work/nft-3.jpg`). "Radio Explorer" (`nft-9.jpg`)
  is not in this set.

`docs/morumelons-sheet.png` shows all 48, numbered in the order used here (zip 3, 1, 4, 2, files sorted by name).
The picks have a red frame.

## The picks (12)

The 12 strongest characters, chosen for variety (space, sea, history, fantasy, cute, dark), clear silhouettes at
thumbnail size and a readable loop. The poster frame is the frame that reads best as a still (for example, the
dino breathing fire, the fish facing out of its bowl), not always frame 0.

| # | Name (working) | Sheet no. | Source GIF (zip / file) | Poster frame | Why |
|---|---|---|---|---|---|
| 01 | Astronaut | 19 | 1 / 8023cd84e1fc56f5db59331ad1c6d14d.gif | 0 | Already a portfolio favourite; ties the project to the existing piece |
| 02 | Robot Pilot | 07 | 3 / 930370e8a08a18edff7ae1a515d5965d.gif | 0 | Best idea in the set: a tiny pilot in a glass dome on a big robot |
| 03 | Mermaid | 13 | 3 / ebce1327204de4d163d8d8da7131bc51.gif | 0 | Bright, friendly, clean colour |
| 04 | Samurai | 15 | 1 / 3aaa631d5f237e6d97f77d5bd77bbd20.gif | 0 | Most detailed costume work |
| 05 | Dino Hoodie | 28 | 4 / 5c68ce1c8bb5ad98bfc69e42d74df378.gif | 6 | Funniest; the fire breath frame |
| 06 | Mummy | 18 | 1 / 7b65143d2edb40d79442cd461d2a03b3.gif | 0 | Strong character in cool sunglasses, night scene |
| 07 | Fishbowl Diver | 34 | 4 / d227c352c400c698d960c0703b007f93.gif | 6 | Surprise: a fish is the head |
| 08 | Unicorn Girl | 43 | 2 / 5da6e49d9b93fcddbc7e3d8e9fa4c6fe.gif | 6 | Pink and purple; balances the darker picks |
| 09 | Wooden Boy | 11 | 3 / dc250ab5d7efe7b30f7d79e08c53f65b.gif | 3 | Storybook feel, pinwheel animation |
| 10 | Wizard | 29 | 4 / 5e0b97741b41578e73911d24e5dd7eb4.gif | 0 | Moody, simple shape, blue flame |
| 11 | Clown | 06 | 3 / 7f0cb624579ec837e87dcea35b11bea6.gif | 0 | Playful, balloons, sunburst background |
| 12 | Dark Knight | 17 | 1 / 61e2629723e5cde8449f620e8ec6f00e.gif | 0 | The most dramatic piece; shows range |

Strong alternates if the owner wants a swap: 09 (red hood with tentacles), 10 (viking), 24 (cardboard robot),
33 (monkey suit), 45 (knight), 05 (sushi chef), 31 (firefighter).

## Files

In `assets/projects/morumelons/`, 36 files, 4.30 MB in all (1 KB = 1000 bytes; the source GIFs were 108 MB). The contact sheet is 295 KB.

- `morumelons-NN.webp`: still poster, 800 x 800, WebP quality 80. 29 to 75 KB, 609 KB for all 12.
- `morumelons-NN-thumb.webp`: thumbnail, 320 x 320, WebP quality 78. 10 to 22 KB, 198 KB for all 12.
- `morumelons-NN-anim.webp`: one-shot animation, 480 x 480, animated WebP quality 62. It plays **once** (loop
  count 1, not infinite). It starts on the poster frame, runs one cycle at every second frame (80 ms each, about
  1 s, or 2 s for the 48-frame ones) and ends on the poster frame, so swapping poster to animation and back has
  no jump. 120 to 594 KB, 3.49 MB for all 12.

| # | Poster | Thumb | Anim |
|---|---|---|---|
| 01 | 55 KB | 18 KB | 594 KB |
| 02 | 55 KB | 18 KB | 240 KB |
| 03 | 46 KB | 16 KB | 227 KB |
| 04 | 75 KB | 22 KB | 332 KB |
| 05 | 46 KB | 15 KB | 203 KB |
| 06 | 44 KB | 15 KB | 393 KB |
| 07 | 43 KB | 14 KB | 228 KB |
| 08 | 60 KB | 19 KB | 276 KB |
| 09 | 60 KB | 19 KB | 233 KB |
| 10 | 29 KB | 10 KB | 120 KB |
| 11 | 53 KB | 17 KB | 258 KB |
| 12 | 43 KB | 15 KB | 390 KB |

A page that shows the project loads only the 12 thumbs (198 KB), and a poster when one is opened. An animation is
fetched only on tap or hover, so a phone never downloads it unless asked.

The source GIFs are not committed (108 MB); they stay with the owner.

## Ready-to-paste PROJECTS entry (suggestion)

Same shape as the entries in `js/data.js`. It uses `kind: "client"` until the owner answers question 1 below,
because that is the safe side: `derive()` then keeps the roles to portfolio and card, and a client piece never
becomes a sticker, coloring page or game piece. The `pictures` and `flow` fields are a proposal for the Flow squad's
data model; rename them to whatever `docs/flow.md` settles on.

```js
{"cat": "illustration", "title": "Morumelons", "desc": "Twelve animated characters from Morumelons, an NFT collection. Tap one to see it move.",
 "img": "assets/projects/morumelons/morumelons-02-thumb.webp", "full": "assets/projects/morumelons/morumelons-02.webp",
 "kind": "client", "label": "Client: Morumelons", "roles": ["portfolio", "card"],
 "pictures": [
   {"img": "assets/projects/morumelons/morumelons-01-thumb.webp", "full": "assets/projects/morumelons/morumelons-01.webp", "anim": "assets/projects/morumelons/morumelons-01-anim.webp", "title": "Astronaut"},
   {"img": "assets/projects/morumelons/morumelons-02-thumb.webp", "full": "assets/projects/morumelons/morumelons-02.webp", "anim": "assets/projects/morumelons/morumelons-02-anim.webp", "title": "Robot Pilot"}
   // ... 03 Mermaid, 04 Samurai, 05 Dino Hoodie, 06 Mummy, 07 Fishbowl Diver, 08 Unicorn Girl,
   //     09 Wooden Boy, 10 Wizard, 11 Clown, 12 Dark Knight (same pattern)
 ],
 "flow": ["Landing page", "Characters", "Animation"],
 "id": {"title": "Morumelons", "desc": "Dua belas karakter animasi dari Morumelons, koleksi NFT. Ketuk satu untuk melihatnya bergerak."}}
```

Notes for whoever pastes it:
- The slug comes from `full` (`morumelons-02`); the existing landing-page piece keeps the slug `morumelons`, so
  `reuseBlock` and `order` entries that say `"morumelons"` still point at the landing page.
- `js/data.js` today calls Morumelons "Ekky's own NFT character collection" (`kind: "original"`, with sticker,
  scene, game and village roles) for the landing page, Astronaut and Radio Explorer. The brief for this upload calls
  it a client collection. One of the two is wrong; until the owner answers, these new files should not get game
  roles, and the existing three entries should be checked against the answer too.
- The existing thumbs are JPEG; these are WebP (supported by every browser the site targets).

## How the Flow squad could show it

- **Cover:** 02 Robot Pilot (the most unusual idea, reads well small). 01 Astronaut is the alternative, but it is
  already a separate tile.
- **Tile in the grid:** the cover thumb, with a small "12" count badge to say it is a project.
- **Project view (lightbox):** the existing landing-page piece (`assets/work/morumelons.jpg`) first, then the 12
  posters in a swipeable row or a 3 x 4 grid (2 columns on a phone). Tap or hover a poster: swap its `src` to the
  `-anim.webp`, it plays once and stops on the same frame. Under reduced motion, never swap.
- **Flow diagram (three bubbles in Ekky's line style):**
  1. **Landing page**: the collection's world (`assets/work/morumelons.jpg`)
  2. **Characters**: one base body, many costumes and backgrounds (cover: a poster from the set)
  3. **Animation**: each character gets a one-second loop (cover: the dino's fire frame; tap plays the animation
     once)
- **Game:** nothing. Client pieces stay out of stickers, coloring pages and the game until the owner says
  otherwise.

## What was built (Morumelons worker, sprint 3)

The suggested PROJECTS entry above was not pasted. The 12 characters became part of the existing Morumelons piece
through the Flow contract (`docs/flow.md`, the optional `set` and `anim` fields), so the landing page keeps its slug,
its roles and its tile:

- Flow (`js/data.js`, `MORUMELONS_FLOW`, also shown on Astronaut and Radio Explorer): **1 The landing page**
  (`assets/work/morumelons.jpg`) then **2 The characters** (cover 02 Robot Pilot; a set of all 12) then
  **3 Animation** (05 Dino Hoodie, plays once when opened).
- The set (`js/site.js`, `mmRenderSet` through `FlowHooks`): a grid under the diagram, 6 across on the desktop,
  3 on a phone. Thumbs only on first view; a tap (or a hover with a mouse) fetches that character's `-anim.webp`,
  plays it once and settles back on the thumb. Under reduced motion the grid is still pictures and nothing is
  fetched. Posters load only when the Animation step opens.
- Reversible: the set step only scrolls to its grid (no new view); the Animation step opens through the flow core's
  step layer, so Back and Esc return to the piece and close returns to where the lightbox was opened.
- e2e (`scripts/e2e.cjs`, "morumelons: ..."): 12 characters on a 390 x 844 phone and on the desktop, thumbs only on
  first view, one tap fetches exactly one animation and it settles back, reduced motion fetches none, Back and Esc
  return.

### Stickers and village (owner, 10-28 16:2x: "Add the characters to stickers and the village too")

- `scripts/morumelons-stickers.py` cuts each poster along Ekky's dark outline into `sticker-NN.png` (128 px). 10 of the
  12 are in Color's sticker tray (stickers 14 to 23, `from: "morumelons"`). Kaiju Costume (its fire breath opens the face
  to the background) and Dark Wizard (scarf and night sky are one dark mass) need a hand-drawn mask first.
- Ekky's Village: Popstar on the north island and Clown on the grass between Ekky's home and the Gallery (walkers in
  `scripts/village.py`, sprites in `scripts/sprites.py`; the game shows at most 2 walkers per piece). Both open the
  Morumelons card. The rebuild changed only the village data, not the island pictures.

## Open questions for the owner

1. **Answered** (owner, 10-28 15:1x, relayed by the lead): "its ekky own collection, can be shown publicly".
   Morumelons is Ekky's own collection, `kind: "original"`, no Client label. The existing three pieces keep their
   roles; the 12 characters may take creative roles where they fit (sticker, game, village; coloring only if a
   clean line version exists). None is wired this sprint: they show in the portfolio and the Art card's viewer.
2. **Answered** (same message): the 12 characters may be shown publicly. No client to name.
3. **Answered** (owner, 10-28 16:2x, a screen recording of the collection's listing): the official names, used in
   both languages: 01 Astro, 02 Destroyer Mech, 03 Mermaid Princess, 04 Samurai Warrior, 05 Kaiju Costume,
   06 Invisible, 07 Fishbowl Head, 08 Popstar, 09 Living Puppet, 10 Dark Wizard, 11 Clown, 12 Dark Lord (each
   followed by "Melon").
4. Keep 12, or swap any for the alternates above?
