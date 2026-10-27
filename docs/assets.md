# UI asset library

Every icon in the game and site is cut from Ekky's own artwork (`assets/ui/`) or comes from one small inline-SVG set in `index.html`. No emoji. Only pieces marked `own: true` in PROJECTS may be cut, and fan-art and client pieces are never used; `npm run check` enforces all three rules.

- Regenerate the cut-outs: `python3 scripts/ui-assets.py` (Pillow + numpy). Crop areas below are in source pixels and match the script.
- Regenerate the contact sheet: `node scripts/assets-sheet.cjs` writes [`assets-sheet.png`](assets-sheet.png) (every icon at display size on #2B1342 and on white).
- PNG files are 2x their largest display size.
- **Sticker** (coloring and Doodle Scene, ticket B21): only clean transparent cut-outs of Ekky's own doodles. Badges keep a background, so they are not stickers.

## Cut-outs and badges (`assets/ui/`)

| File | Size | Source piece | Crop area (x0, y0, x1, y1) | Type | Sticker | Used for |
|---|---|---|---|---|---|---|
| `ekky.png` | 128 | `assets/hero.png` (Ekky, owner answer) | 244, 140, 346, 252 | Cut-out (head, inside the outline; laptop edge removed) | yes | HUD avatar, Level 1 "Who is Ekky?", desktop hero wave |
| `face.png` | 128 | `assets/face.png` | 0, 0, 256, 256 | Cut-out (mint background removed) | yes | Game-mode button (the middle tab and favicon use `assets/face.png` itself) |
| `pen-hand.png` | 96 | `assets/hero.png` | 170, 100, 262, 220 (cut at the wrist) | Cut-out with a light sticker outline | yes | Level 2 "Skill Tree" |
| `palette.png` | 96 | `assets/hero.png` | 388, 58, 486, 156 | Cut-out | yes | Level 3 "Art Collection", Cards tab, Art Collector trophy, Star Catcher +3 |
| `planet.png` | 96 | `assets/hero.png` | 428, 186, 526, 252 | Cut-out | yes | Sticker only for now |
| `cat.png` | 96 | `assets/hero.png` | 232, 8, 324, 100 | Cut-out | yes | Trophies tab (until it becomes "Mine") |
| `ghost.png` | 96 | `assets/work/doodles.jpg` | 925, 362, 1252, 632 | Cut-out | yes | Level 4 "Doodle to Done" |
| `virus.png` | 96 | `assets/work/virus-and-war.jpg` | 440, 355, 582, 487 | Cut-out | yes | Star Catcher hazard |
| `astronaut.png` | 96 | `assets/work/nft-3.jpg` (Ekky holds the rights) | 30, 8, 228, 182 | Cut-out (helmet and head, inside the outline) | yes | Sticker |
| `radio-explorer.png` | 96 | `assets/work/nft-9.jpg` (Ekky holds the rights) | 52, 10, 198, 174 | Cut-out (head, inside the outline) | yes | Sticker |
| `monster-head.png` | 128 | `assets/work/monster.jpg` | 610, 0, 1000, 390 | Badge (the head runs into the body and the raised hand) | no | Level 5 boss "Final Quest", Final quest button |
| `monster-head-check.png` | 128 | same as `monster-head.png` | same | Badge + check mark | no | Quest Complete trophy |
| `helmet.png` | 96 | `assets/work/nft-3.jpg` (Ekky holds the rights) | 30, 6, 226, 202 | Badge (256 px source, busy background) | no | Star Catcher and Earn coins buttons |

Re-cropped category icons (same folder as before):

| File | Source piece | Crop area | Type | Sticker | Fix |
|---|---|---|---|---|---|
| `assets/cat-social.png` | `assets/hero.png` | 60, 366, 156, 450 | Cut-out | yes | Mic handle no longer cut off; moon lines removed |
| `assets/cat-web.png` | `assets/hero.png` | 408, 282, 522, 396 | Cut-out | yes | Stray line at the bottom-left removed |

The other category icons (`cat-all`, `cat-illustration`, `cat-branding`) and `icon-cards.png` / `icon-trophies.png` are earlier cut-outs from `hero.png`; they are sticker candidates too. The icons for the card pack, coin, map pin, trophy cup, Legendary Pull, Completionist and lives were dropped by the owner's scope change (round 1). Their remaining uses show the plain star shape or text until those features are removed.

## Inline SVG set (`index.html`, top of `<body>`)

Defined once as `<symbol>`s; use `<svg class="ico"><use href="#id"/></svg>`, or `ico(id)` in JS. Not stickers.

| Id | Kind | Used for |
|---|---|---|
| `i-close` | Line icon | Close buttons (level sheet, pack, Star Catcher, lightbox) |
| `i-back`, `i-next` | Line icons | Lightbox prev/next, "Next level", service card "View projects" |
| `i-check` | Line icon | Process checklist, card seen mark, "Email copied" toast |
| `i-replay` | Line icon | Play again |
| `i-send` | Line icon | Send message |
| `i-share` | Line icon | Reserved for share cards |
| `i-frame` | Line icon | Reserved for the "Mine" tab |
| `i-up` | Line icon | Back to top |
| `i-play` | Line icon | PLAY |
| `s-star` | Shape (#FFB400, #2B1342) | Score and coin count, level star rating, owned card mark, falling star +1, Star Catcher +1, placeholder for dropped trophies |
| `s-star-glow` | Shape | Falling star +5, Star Catcher +5 |
| `s-sparkle` | Shape (text colour) | Start hint, marquee separator, click sparks |

## Role map

The plan for every piece (owner: "make sure all artwork has its role") is the `roles` array in `js/data.js` and the
table in `docs/roles.md`, both by the UX lead. `node scripts/check.mjs --roles` prints the roles per piece;
`npm run check` warns about any shareable original that has no creative role.

Two code rules on top of `roles` (`creative()` in `js/features.js`): stickers, coloring pages, share cards and the
featured rows use only shareable **original** pieces. Client and fan pieces stay in the portfolio list and the Art tab.

## Village sprites (`assets/sprites/`, B42)

Cut by `python3 scripts/sprites.py` (same tools as `ui-assets.py`), exactly as drawn; busy pieces use a polygon or
ellipse selection mask that only selects part of the drawing. `assets/sprites/index.json` lists piece, file, size,
role and cut method. Every piece must be shareable and carry the `village` role (`npm run check` enforces it).
Batch 1 (the main places): `home` (Little Planet, Ekky at his desk), `studio` (Giraffe Ride with fence and trees),
`toybox` (the gallery's sign), `gate` (Hidden Monster's stone gate with the two kids and their lantern), plus
`ghost`, `astronaut`, `radio-explorer`, `palette`, `pen-hand` and `helmet` reused from `assets/ui/`.

`python3 scripts/village.py` composes the first frame `assets/village/village.png` from those cut-outs on plain ground
shapes in Ekky's palette (sea, islands, paths, plank bridges, the gallery block), and writes the place and frame
positions to `village.json` / `village.js`.
