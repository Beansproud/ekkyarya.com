# Paint Patrol slice: Developer plan (MG1, MG2 rest, MG3, MG9 part)

Owner: Game Developer. This is a plan only. No code is written until V6 passes; the integrator sets the start.
Design and numbers come from `docs/minigames.md` (Game A, the balance table) and win over this page. The Director owns
balance, and the UX lead owns copy, entry points and acceptance. This page is how I build the slice, and what I found
in the source images that the brief should know before MG3 starts.

## 1. What the slice is

Stage 1 "Rush Hour", playable on a phone in landscape. A portrait phone gets the "Turn your phone sideways" card with
a "Play anyway" button.

- **How it plays:** Ekky glides on his chair, paint fires on its own, a tap jumps, and grey doodles turn back into
  color. One big grumpy friend is calmed down with paint.
- **How it ends:** Coexistence fades in, then See it in the portfolio and Hire Ekky.
- **What it never has:** no score, timer, health or losing.
- **Switch:** behind `paintPatrol` (off), with lazy loading, so the portfolio's first load does not change.

## 2. What the source images allow (findings to settle before MG3)

These are checked against the actual files (`assets/hero.png`, `assets/work/monster.jpg`, `assets/work/coexistence.jpg`).

1. **Hero: Ekky's chair can't be cut on its own.** In Little Planet the desk and laptop stand in front of his legs,
   and the chair is behind him. Cutting "exactly as drawn" gives Ekky, chair, desk and laptop as one piece.
   - **Proposal:** the hero is that whole workstation, cut from `hero.png` above the moon's surface (a straight cut
     at the floor line, where the desk and chair legs stand). Ekky drives his rolling desk, and the paint comes from
     his raised stylus.
   - **Drops:** the moon and the floating doodles. Nothing is redrawn.
   - **Size:** about 250 x 330 px at 2x, shown about 110 px tall (balance table).
   - **Decision for:** the Director and the UX lead, because the brief says "chair".
2. **The big friend can't be cut as a full figure.** In Monster in My Room, the green monster runs past the top
   and right edges of the picture.
   - **Proposal:** he leans in from the right edge of the screen, exactly as framed in the piece. He fills the
     right third, his hammer arm raised, his feet on the floor.
   - **The swing:** a slow rotation of the drawn arm-and-hammer piece around the shoulder. It is a separate cut
     from the same drawing (a selection mask), not a redraw. The rest of his body only bobs.
   - **Telegraph:** the hammer lifts 15 degrees over 0.8 s before each swing (balance table).
3. **Rush Hour can't be a wide street from Coexistence alone.** The piece is a close-up, not a wide street, so
   parallax layers can't come straight from it.
   - **Proposal:** the street is plain shapes in Ekky's palette, the same asset rule as the village ground:
     - a far brick wall band in the piece's reds;
     - a sidewalk band;
     - the road.
   - **Coexistence props stand on it, cut from the piece:** the bus-stop sign, the bench, and as background
     commuters who cheer, the orange many-eyed monster on the phone and the gargoyle in the suit.
   - The kid with the backpack sits on the bench at the stage end.
   - **The rule:** every character on screen is Ekky's drawing, and only the ground and wall are shapes.
4. **The enemies are already cut** (V2 batch 2 plus `assets/ui/virus.png`): virus, blob, skull, orange-monster,
   pickle, ufo (flies), dog, doodle-cat and waver. That makes 6 or more distinct "grey doodles" for MG2, so MG2's
   remaining work is the hero, the big friend's two pieces and the Coexistence props.

## 3. MG1: the mini engine (`js/patrol.js`, about 4 to 6 h)

One file, no library, loaded only when Paint Patrol opens. It follows Star Catcher's loop and its fixes.

- **Loop:**
  - `requestAnimationFrame` with a fixed 1/60 s update step and accumulated time, capped at 5 steps per frame so a
    slow phone slows down instead of skipping.
  - Pauses on `visibilitychange` (the Star Catcher hidden-tab fix) and when the pause sheet opens.
- **Canvas:**
  - One `<canvas>` sized to the screen times devicePixelRatio, capped at 2.
  - Fixed world height of 540 px; the width follows the aspect ratio, so landscape phones show more road.
  - The camera follows the hero with a dead zone.
- **Sprites:**
  - Each is loaded once as an `ImageBitmap`. Grey and color versions are made once at load: the grey version is
    drawn once through `filter: grayscale(1)` on an offscreen canvas, never filtered per frame.
  - Painting draws the grey version, then the color version with `globalAlpha = hits / needed`, so a doodle fills
    with color hit by hit.
- **Puppet animator (shared with the village):** bob, lean and squash as small transforms on a whole cut-out
  (y offset, rotation of at most 4 degrees, scale), plus pivots for separate pieces (the hammer arm). There is no
  frame animation, because the drawings have one pose.
- **Input:**
  - Pointer events with `touch-action: none` on the canvas.
  - Left half: a drag stick that appears where the thumb lands.
  - Right half: tap jumps, and a double tap within 300 ms is the paint bomb.
  - Keyboard: arrows or A and D, Up, W or Space, X and Z.
  - Only enabled controls are shown.
- **Reduced motion:** no bob, lean, shake or particles. The world still scrolls and doodles still move (that is
  the game), as in Star Catcher.
- **Sound:** existing `sfx()` and the sound switch. Effects only, no music (owner).
- **Done when:** a test scene with 5 doodles, 12 paint blobs and the big friend runs at 60 fps at 4x CPU on the
  iPhone 13 viewport, and stops on a hidden tab.

## 4. MG2 rest: cut-outs (about 3 h, in `scripts/sprites.py`)

| Cut | From | Method |
|---|---|---|
| `hero-desk` | `assets/hero.png` (Little Planet) | alpha cut above the moon surface; drop the floating doodles (not connected) |
| `friend-body`, `friend-arm` | Monster in My Room | selection masks; the arm with the hammer cut at the shoulder outline |
| `bus-sign`, `bench`, `commuter-orange`, `commuter-gargoyle`, `kid-backpack` | Coexistence | selection masks and the new `bright` cut where the background is busy |

Each one goes on the contact sheet (`--sheet`) for the UX lead, on dark and on white. If a cut isn't clean, it is
dropped and reported, as with the shark in V2.

## 5. MG3: stage 1 "Rush Hour" (about 6 h)

- **Length:** 7 screen widths at 200 px/s run speed, plus waves and the big friend, about 90 s at a relaxed pace.
  Before MG4, `scripts/sim-patrol.mjs` (like `sim-stars.mjs`) checks 60 to 120 s for a relaxed player and a
  rushing one.
- **Waves:** every 3 to 5 s, at most 5 on screen. A doodle needs 3 hits and a big one 6.
- **Knockback:** 120 px with 0.8 s of invulnerability, and a paint splash on the desk (not a red flash).
- **Power-ups:** befriended doodles drop the pen-hand (rapid paint) and the palette (3 blobs), both already cut.
  The helmet shield and Plug Hero come in MG5.
- **The big friend:** a color meter of 40, attacks every 2.5 to 3.5 s, each telegraphed for 800 ms. Once full he
  calms down, sits, and the commuters cheer.
- **Stage end:**
  - Coexistence fades in full screen over 1 s (`--dur-slow`), with its title and one line.
  - Buttons: See it in the portfolio (lightbox), Hire Ekky, and Next stage, Pick a stage or Something else.
  - Hire Ekky is also in the pause sheet.
- **Copy keys for the UX lead** (I use `tt()` with English fallbacks until they exist): `patrol.title`,
  `patrol.hint`, `patrol.turn`, `patrol.playAnyway`, `patrol.pause`, `patrol.resume`, `patrol.end.see`,
  `patrol.end.next`, `patrol.end.pick`, `patrol.end.other`, `patrol.stage1`, `patrol.friend1`. None says "boss".

## 6. MG9 part: entry and loading

- **Entry points:** the start tile and a map header button, both `data-feature="paintPatrol"`. The UX lead places
  them (the brief suggests a "Games" picker).
- **Bus stop place:** the village gets its "Bus stop" place only when the switch is on (B42 decision).
- **Loading:** `js/patrol.js` and the stage 1 sprites load on the first tap, so the first load stays within ±1 KB.
- **Deep link:** `?play=patrol&stage=1`, through `js/links.js`.

## 7. How it is checked before each push

- **Usual gate:** `npm run check`, `npm run a11y`, and `node scripts/capture.cjs` with a new Paint Patrol step:
  start, mid-stage, the big friend's telegraph, the end screen and the portrait card.
- **Probe:** fps at 4x CPU, `document.getAnimations()` empty while playing (canvas only), no input lost after a
  hidden tab, and reduced motion verified.
- **Sim:** `sim-patrol.mjs` stage length.

## 8. Open questions (for the integrator to route)

1. **Director and UX:** is the hero OK as Ekky at his rolling desk (section 2.1), since the chair can't be cut on
   its own?
2. **Director:** is the big friend OK leaning in from the screen edge with a swinging hammer arm (2.2)?
3. **UX:** is the Rush Hour street OK as palette shapes, with the Coexistence characters and props standing on it
   (2.3)?
4. **Integrator:** may MG1 start right after V6 passes, or only after V4?

## Build status (MG1 + MG3 first pass, behind `paintPatrol`, off)

- `js/patrol.js` (about 14 KB, loaded on the first tap of the Paint Patrol tile or `?play=patrol`): engine, input,
  stage 1, the big friend, the end screen, the pause card with Hire, and the portrait card with "Play anyway".
- **Built as proposed in section 2:** the hero is `hero-desk` (Ekky at his rolling desk) and the big friend is
  `friend-monster` (one cut with the hammer). The friend's attack is a lean back (0.8 s telegraph) and a slam that
  sends a paint wave along the ground to jump over.
- **Dropped:** the Coexistence commuters (the cut pulled in the kid and the wall). The street is palette shapes
  only, and Coexistence is shown at the stage end.
- **Measured (iPhone 13 landscape, headless):** 1.1 ms of script per frame at 4x CPU, and 53 to 55 fps at 4x.
  That is the same as this machine's ceiling with the game closed. The sky's 60 twinkles now stop behind any
  full-screen game (Star Catcher too).
- **Not yet:** `scripts/sim-patrol.mjs` (stage length check), the helmet shield and Plug Hero power-ups (MG5), and
  copy keys in `COPY` (`tt()` English fallbacks for now: `start.patrol`, `patrol.*`).
- **To playtest (MG4):** set `paintPatrol: true` in `js/features.js`; the start screen then shows a fourth tile.
