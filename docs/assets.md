# UI asset library

Every icon in the game and site is cut from Ekky's own artwork (`assets/ui/`) or comes from one small inline-SVG set in `index.html`. No emoji. Fan-art and client pieces are never used here; `npm run check` enforces both rules.

- Regenerate the cut-outs: `python3 scripts/ui-assets.py` (Pillow + numpy). Crop areas below are in source pixels and match the script.
- Regenerate the contact sheet: `node scripts/assets-sheet.cjs` writes [`assets-sheet.png`](assets-sheet.png) (every icon at display size on #2B1342 and on white).
- PNG files are 2x their largest display size.

## Cut-outs and badges (`assets/ui/`)

| File | Size | Source piece | Crop area (x0, y0, x1, y1) | Type | Used for |
|---|---|---|---|---|---|
| `face.png` | 128 | `assets/face.png` | 0, 0, 256, 256 | Cut-out (mint background removed) | Level 1 "Who is Ekky?", game-mode button, desktop hero wave, Press Start and Nice to Meet You trophies |
| `pen-hand.png` | 96 | `assets/hero.png` | 170, 100, 262, 220 (cut at the wrist) | Cut-out | Level 2 "Skill Tree" |
| `palette.png` | 96 | `assets/hero.png` | 388, 58, 486, 156 | Cut-out | Level 3 "Art Collection", Cards tab, Art Collector trophy, Star Catcher +3 |
| `planet.png` | 96 | `assets/hero.png` | 428, 186, 526, 252 | Cut-out | Library only (not used yet) |
| `cat.png` | 96 | `assets/hero.png` | 232, 8, 324, 100 | Cut-out | Library only (not used yet) |
| `map-pin.png` | 96 | `assets/hero.png` | 362, 398, 430, 478 | Cut-out (inside the outline, moon lines removed) | World Explorer trophy |
| `ghost.png` | 96 | `assets/work/doodles.jpg` | 925, 362, 1252, 632 | Cut-out | Level 4 "Doodle to Done" |
| `monster-head.png` | 128 | `assets/work/monster.jpg` | 610, 0, 1000, 390 | Badge (the head runs into the body and the raised hand) | Level 5 boss "Final Quest", Final quest button |
| `monster-head-check.png` | 128 | same as `monster-head.png` | same | Badge + check mark | Quest Complete trophy |
| `toybox.png` | 96 | `assets/work/toybox.jpg` | 150, 50, 860, 650 | Cut-out with an ink outline | Open pack button, Pack Opener trophy |
| `helmet.png` | 96 | `assets/work/nft-3.jpg` | 30, 6, 226, 202 | Badge (256 px source, busy background) | Star Catcher and Earn coins buttons |
| `virus.png` | 96 | `assets/work/virus-and-war.jpg` | 440, 355, 582, 487 | Cut-out | Star Catcher hazard |
| `blue-bird.png` | 96 | `assets/work/blue-bird.jpg` | 1080, 600, 1345, 952 | Cut-out with a light outline and blue glow | Legendary Pull trophy |
| `chest.png` | 96 | `assets/work/hidden-monster.jpg` | 640, 1170, 970, 1450 | Cut-out | Completionist trophy |
| `trophy.png` | 96 | `assets/work/day-in-life.jpg` | 548, 585, 668, 694 (shelf removed) | Cut-out | Trophies tab, Arcade Star trophy |

Re-cropped category icons (same folder as before):

| File | Source piece | Crop area | Type | Fix |
|---|---|---|---|---|
| `assets/cat-social.png` | `assets/hero.png` | 60, 366, 156, 450 | Cut-out | Mic handle no longer cut off; moon lines removed |
| `assets/cat-web.png` | `assets/hero.png` | 408, 282, 522, 396 | Cut-out | Stray line at the bottom-left removed |

`assets/icon-cards.png` and `assets/icon-trophies.png` are no longer referenced by the UI (replaced by `palette.png` and `trophy.png`); they stay for the sticker plan in `docs/game-brief.md`.

## Inline SVG set (`index.html`, top of `<body>`)

Defined once as `<symbol>`s; use `<svg class="ico"><use href="#id"/></svg>`, or `ico(id)` in JS.

| Id | Kind | Used for |
|---|---|---|
| `i-close` | Line icon | Close buttons (level sheet, pack, Star Catcher, lightbox) |
| `i-back`, `i-next` | Line icons | Lightbox prev/next, "Next level", service card "View projects" |
| `i-check` | Line icon | Process checklist, card seen mark, "Email copied" toast |
| `i-replay` | Line icon | Play again |
| `i-send` | Line icon | Send message |
| `i-share` | Line icon | Reserved for share cards |
| `i-up` | Line icon | Back to top |
| `i-play` | Line icon | PLAY |
| `s-coin` | Shape (#FFB400, #2B1342) | The currency everywhere: coin pill, pack price, Star Catcher score, Coin Keeper trophy |
| `s-star` | Shape | Level star rating, owned card mark, falling star +1, Star Catcher +1 |
| `s-star-glow` | Shape | Falling star +5, Star Catcher +5 |
| `s-sparkle` | Shape (text colour) | Start hint, marquee separator, click sparks |
| `s-heart` | Shape (text colour) | Star Catcher lives: #FF6B6B, grey #6b5e80 when lost |
