# Playtest r1c: final round-1 build

Author: Game Director. Date: 2026-10-27.

**Build tested:** branch `dev/assets` at `713c99b`. It contains the r1a fixes, the share fixes, the Giraffe split patch (and a Road Trip page behind `FEATURES.pageRoadTrip`, off), the EN / ID switch, downloads, Install app, and share as video.

**How:**
- `scripts/capture.cjs`: 0 errors, 0 emoji. `npm run check` passes.
- My drivers from r1a and r1b, on the iPhone 13 viewport and desktop:
  - a timed first-visitor share loop with `navigator.share` intercepted;
  - a fresh-browser friend link, compared pixel by pixel;
  - Hire Ekky reachability on every screen;
  - the running animations (`document.getAnimations()`);
  - 3 idle Star Catcher rounds in the real build;
  - the arrival time, repeated 5 times on emulated slow 4G (150 ms latency, 1.6 Mbit/s).

## Verdict: **GO for the village (V1)**

**Simple: yes. Fun: yes for a short visit, and the village is what it needs next.**
- Every r1a and r1b blocker I raised is fixed.
- The core loop is solid: make something, see it next to Ekky's, share it, a friend lands on it.
- What's left is breadth, not breakage:
  - one coloring page (Road Trip waits for Ekky's approval);
  - one 30-second arcade;
  - a map that is still five tiles rather than a place.
- The village (V1 to V3) is the biggest fun lever left, so starting it now is right.
- The remaining items below are small and can run alongside V1. None of them blocks it.

## Scorecard checks

| Check | r1a / r1b | Now | Evidence |
|---|---|---|---|
| 6 artworks within 10 s | 3 of 6 | **Pass: 6 of 6 at 1 s** | The start grid shows all 6 thumbnails fully on screen at every check from 1 to 10 s. |
| First coloring shared within 60 s | 17 s | **Pass: 15.9 s** | From load: start screen at 0.8 s, Color, Giraffe, 10 fills, Done, Share, Share. The share sheet received the 1080 x 1920 PNG and the link text. |
| ≤ 3 taps after Done | 3 | **Pass: 3** | Share (reveal) → Share (preview) → the app. |
| Friend lands on the exact coloring | pass | **Pass** | Fresh browser, same picture. Old links from the 46-region map open the start screen with no error. |
| Friend's link under 2 s | 2.3 s fast, 9.4 s slow 4G | **Pass on a fast connection: 0.6 s (loader gone at 1.2 s). Slow 4G: about 4.5 s** (5 runs: 4.2, 4.5, 4.5, 4.5 and one outlier at 9.4) | The loader no longer hides a ready arrival on a fast connection. On slow 4G the arrival waits for its data; see fix 1. |
| Hire Ekky one tap away | fail on 2 sheets and the picker | **Pass** | A tappable Hire on start, map, every level sheet, Art, the lightbox ("Want art like this?"), Mine, the picker ("Like what you see? Hire Ekky"), coloring, reveal, share preview, arrival and the Star Catcher result. The Final Quest sheet is the hire form itself. |
| No boss wording | fail | **Pass** | Map place "Work with Ekky", sheet "Final Quest: Work with Ekky", no `boss` class. |
| Real contacts | placeholders | **Pass** | Email, Copy email, Instagram, LinkedIn, Behance, website, "Projects from $25", "evenings to night, WIB (GMT+7)". |
| Ekky picture | wrong face on level 1 | **Pass** | The glasses guy on "Who is Ekky?", the HUD and the map. The middle tab keeps `face.png`, as the owner asked. |

## Is it fun now?

- **Coloring is the heart, and it works.**
  - The Giraffe now has 91 shapes, so 10 taps colored 8 different shapes (5 before the split). Results look like the player's own.
  - Two rows of colors plus "any color", stickers from his doodles, and "Peek at Ekky's colors" all make the page a small toy rather than a test.
  - The "Yours and Ekky's" reveal, with no confetti covering it now, is the best moment in the build: it shows his art at its best right after you made something.
- **Star Catcher now asks you to play.** Idle rounds in the real build scored 6, 10 and 19 (average 11.7; the simulation predicted 9.8). Before the retune, standing still scored 19 on average. Falling items are slower and readable, and every round runs the full 30 s with no game over.
- **What still limits the fun is breadth.**
  - One page. Road Trip is built but switched off until Ekky approves the lines; switching it on doubles the coloring content at no cost.
  - One short arcade.
  - A map that works as a menu, not a place to explore. Ekky's Village (B42) addresses exactly this.
- **Choice overload in one spot:** the share preview now offers Share, Download and Share as video, plus Hire Ekky, all as big buttons. For a first-time visitor, Share should be the one big button, with Download and video as smaller secondary actions. See fix 4.

## Motion: against "slow but make sense"

**Pass.**
- `css/game.css` has no overshoot curve left. Everything uses the B39 tokens: `--ease-in` `cubic-bezier(.22,.61,.36,1)`, `--ease-move` `cubic-bezier(.4,0,.2,1)`, and durations of 250 / 500 / 1000 ms.
- On the start screen and the map, the only running animations are the 60 star twinkles, at a calm 9 s each. No stacked loops: the wiggle, face rock, card bob and island bob are gone, and holo is one-shot.
- Tab presses use a short `press` (250 ms). The logo fades in. Countdown and result no longer zoom or spin.

| Remaining motion item | Verdict | Fix |
|---|---|---|
| Art tab: 34 `skel` loading shimmers keep looping on cards below the fold (1.2 s, endless) | Hidden work | Stop the shimmer once the image has loaded, and don't start it until the card is near the viewport. |
| Fill fade (`js/color.js:137`): each frame redraws the new color at 35 % opacity on top of the last frame, so it reaches full color after about 6 frames (about 100 ms at 60 fps, slower on slow phones), not over the intended 250 ms | Too fast, frame-rate dependent | Keep a copy of the shape before the fill and draw `before`, then `new` at alpha `k` (0 → 1 over 250 ms). |
| Ekky's bob in Star Catcher (`js/game.js:241`): ±3 px, about 1.1 s per cycle | OK | Keep. |

## Fixes, ranked by impact (none blocks V1)

| # | Fix | Why | Owner | Size |
|---|---|---|---|---|
| 1 | **Fetch the coloring first on a deep link.** On `?color=`, add `<link rel="preload">` for `assets/color/<page>/page.js` and `line.png` from an inline script at the top of `index.html`, so they start at once. Today `page.js` starts after 21 UI icon and font requests (at about 1.4 s on slow 4G) and `line.png` only after `page.js` finishes (3.5 s). Hide the loader the moment the arrival is drawn: on slow 4G it stays up about 0.7 s after the arrival is ready. | Slow-4G arrival from about 4.5 s toward 2 s. | DEV | S |
| 2 | **Don't load the classic hero in game mode.** `assets/hero.png` (300 KB) is still downloaded on phones in game mode, through the classic site's `<img class="hero-art">` (`index.html:122`). Lazy-load it, or set its `src` only in classic mode. | 300 KB off every phone visit. | DEV | S |
| 3 | **Fill fade and skeleton loops** (motion table above). | Motion direction, battery. | DEV | S |
| 4 | **Share preview: one primary button.** Share stays big and yellow; Download and Share as video become one row of smaller secondary buttons under it. | Simple: one obvious next step. | UX, DEV | S |
| 5 | **Star Catcher result copy:** "You caught 6 stars" counts points (palettes are +3, glowing stars +5). Say "You scored 6 points", or count the items caught. On the very first round, "New best!" is automatic; say "Nice catching!" when there is no earlier best. | Honest copy, no empty praise (de-gamification). | UX | S |
| 6 | **Switch on Road Trip** as soon as Ekky approves its lines (owner question 6). | Doubles the coloring content. | OWNER, then a 1-line switch | S |

**Not tested here:** pinch and rotate of stickers on a real touch screen (the emulator only drags), and "Share as video" (behind `shareVideo`). Check both on a real phone before launch.

---

## Addendum: slow-4G re-time after the r1c fixes (`main` c68b7ce)

Emulated slow 4G (150 ms latency, 1.6 Mbit/s down) on the iPhone 13 viewport. Friend link `?color=giraffe&f=…&from=Rina`. 5 runs, plus 3 runs measuring the loader at half opacity.

| Moment | Before the fixes (713c99b) | Now (c68b7ce) | Target |
|---|---|---|---|
| Arrival drawn (`#cArrive` active) | about 4.5 s (4.2 to 9.4) | **2.60 to 2.68 s** in all 5 runs | |
| Loader below 50 % opacity (the coloring shows through) | about 5.0 s | **3.00 to 3.07 s** | under 3 s |
| Loader fully gone | about 5.2 s | 3.26 to 3.33 s | |
| Fast connection: arrival / loader gone | 0.6 / 1.2 s | 0.33 to 0.92 / 0.95 to 1.65 s | under 2 s |

**Result:**
- The preload works: the arrival is drawn about 1.9 s sooner, reliably (no slow outlier in 5 runs).
- What remains is the loader's own fade, 0.2 s delay plus 0.6 s (`css/site.css:213`). The friend sees the coloring about 0.4 s after it is drawn, which misses the 3 s target by about 70 ms.

**Fix (S, DEV):** when `js/links.js` drops the loader on an arrival, skip the delay and fade faster. For example, add a class `quick` with `transition:opacity .3s,visibility .3s` and no delay. The loader then crosses 50 % at about 2.75 s on slow 4G. The normal start keeps its calm 0.6 s fade.

Verdict unchanged: **GO for V1.**
