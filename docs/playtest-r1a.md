# Playtest r1a: first round-1 build

Author: Game Director. Date: 2026-10-27.

**Build tested:** branch `dev/assets` at `abedf97` (B03, B38, B05, B06, B07, B08, B13, B16, B17 and the B15 safe default). The branch has since moved on to `43380e9` (B09, coloring page files only), which doesn't change anything tested here.

**How:**
- `scripts/capture.cjs` on an iPhone 13 viewport (390 x 664) and on desktop at 1440 x 900.
- A probe script that checks what is visible and tappable on each screen (at the centre of each button, which element is on top).
- A 300-run simulation of Star Catcher with three player models (idle, casual, skilled), using the exact `BALANCE` numbers from `js/game.js`.
- A read of every animation in `css/game.css` and `js/game.js`.

**Quality checks:**
- `npm run check` passes.
- 0 emoji.
- 0 JavaScript errors.
- One failed resource request (an image with an `undefined` URL), on both phone and desktop. This is the known broken-icon issue the integrator listed.

## Verdict

**Simple: yes. Fun: not yet.**
- The shell is clear, calm and quick to read. Three tiles (Color, Catch stars, Explore) and "Just show me the art" on one screen is exactly the "play your way" start the owner asked for. Nothing is locked, there are no coins, and there's no game over.
- Star Catcher works and its result screen is friendly ("New best!", Play again, Something else, Hire Ekky).
- What holds back the fun:
  - Star Catcher scores almost as well when you don't touch the screen.
  - The map is a list of five round buttons rather than a place to explore. The owner's new direction (below) fixes exactly that.
- What breaks the owner's motion direction ("slow but make sense"): almost every animation uses a springy overshoot curve, and up to eight endless loops run at once on the map.

## Scorecard checks asked for

| Check | Result | Evidence |
|---|---|---|
| 6 artworks visible on the start screen within 10 s | **Fail: 3 of 6** | At 1, 2, 4, 6, 8 and 10 s after load, exactly 3 "Ekky's favorites" thumbnails are fully on screen and a 4th is cut off at the right edge. The row doesn't move by itself, so the other 2 or 3 need a swipe. |
| Hire Ekky one tap from every screen | **Fail on 2 screens** | One tap works on: start, map, Art, Mine, the Hire sheet itself, the lightbox (its own "Want art like this? Hire Ekky" button) and the Star Catcher result (its own Hire button). It is **covered** on the "Who is Ekky?" and "Doodle to Done" sheets: the sheet's dark backdrop covers the whole screen, the HUD chip underneath can't be tapped, and those sheets have no Hire button of their own. Hidden during the countdown and live play, as designed. |
| No lock, no game over, nothing to lose | Pass | Every node opens. Star Catcher always runs the full 30 s. |
| No emoji, own art only | Pass | `npm run check`. |

## Fixes, ranked by impact

| # | Fix | Why it matters | Owner | Size |
|---|---|---|---|---|
| 1 | **Make Hire Ekky tappable on every sheet.** Start the sheet backdrop below the HUD, so the chip stays visible and tappable above it, and add a "Hire Ekky" button at the end of the "Who is Ekky?" and "Doodle to Done" sheets. "Who is Ekky?" is the moment a client is most ready to hire. | Scorecard row "Hire in 1 tap from every screen". | DEV | S |
| 2 | **Show all six favorites at once:** replace the sideways row with a 3 x 2 grid of square thumbnails (about 112 px each at 390 px wide). Shrink the logo from 118 px to about 84 px to make room. Static, no auto-scroll. | Scorecard row "6 best pieces within 10 s": today 3. | DEV, UX | S |
| 3 | **Retune Star Catcher** with the numbers below. Standing still today scores 19 on average (the capture run, which never moved, scored 23), so moving barely matters. | Fun: the player's input has to matter. | DIRECTOR numbers, DEV | S |
| 4 | **Calm the motion:** replace the overshoot curve, remove the stacked loops (motion table below). | Owner: "dont make the animation too fast make it slow but make sense". | DEV | M |
| 5 | **Turn the map into an isometric village** built from Ekky's art (owner direction, section below). | Fun and showcase: the map becomes a place, not a menu. | DEV, UX, DIRECTOR | L |
| 6 | **Remove the "BOSS LEVEL" tag** on the Final Quest sheet. Use no tag, or "Last stop". | Owner: "dont add bossfight theme". | UX, DEV | S |
| 7 | **HUD subtitle is cut off** ("Illustrator and gr…") at 390 px. Shorten it to "Illustrator" or drop it on phones. | Polish: a truncated job title next to a hire button. | UX | S |
| 8 | **Mine: "Clear everything I made" sits under the tab bar** and can only be reached by scrolling past it. Add bottom padding equal to the tab bar height plus 16 px. | Reachability. | DEV | S |
| 9 | **Star Catcher pause bug:** on `visibilitychange`, the round restarts itself after 300 ms even while the tab is still hidden. Resume only when the page is visible again, and show a 1-second "Ready?" before play continues. | Fairness after a phone call or a tab switch. | DEV | S |
| 10 | **Countdown:** 3, 2, 1, GO takes 3.2 s, and each number zooms from 3x with an overshoot. Keep the 3 counts (calm is fine) but fade each number in at 1.0 to 1.1 scale over 500 ms, with no bounce. | Motion direction. | DEV | S |
| 11 | **Delete leftover CSS** for removed features (`packIdle`, the pack and coin styles). | Hygiene. | DEV | S |

## Star Catcher balance (proposed `BALANCE`)

Simulated with 300 rounds per model on a 390 x 664 screen. The models:
- **idle:** never touches the screen.
- **casual:** reacts every 0.45 s, about 38 px off target, finger at 700 px/s, ignores viruses.
- **skilled:** reacts every 0.22 s, 14 px off target, 1400 px/s, dodges viruses, prefers glowing stars.

| Model | Today: mean (10th to 90th percentile) | Proposed: mean (10th to 90th percentile) |
|---|---|---|
| Idle | **19.2** (10 to 30) | **9.8** (3 to 18) |
| Casual | 62.9 (49 to 76) | **43.9** (32 to 56) |
| Skilled | 76.0 (63 to 90) | 60.0 (48 to 73) |

```js
const BALANCE={seconds:30,spawn:[.75,.45],speed:[110,240],speedRandom:40,hazardShare:[.12,.25],catchStar:30,catchHazard:26,hazardCost:2,
  mix:{glow:.08,palette:.20}};
```

What changes and why:
- **`catchStar` 46 → 30**, the main lever. Standing still no longer catches every star that falls near the middle. You have to move under a star to catch it.
- **`catchHazard` 30 → 26.** Viruses stay easier to avoid than stars are to catch.
- **`speed` [140, 320] → [110, 240] and `speedRandom` 50 → 40.** Slower falling, per the owner's "slow". You can read each item before it arrives.
- **`spawn` [.60, .32] → [.75, .45].** Fewer items on screen, calmer, and each catch feels like a choice.
- **`mix.glow` .07 → .08, `palette` .18 → .20.** A few more valuable items, so moving toward them pays off.

Expected scores on a real phone: about 10 if you don't play, 30 to 55 casual, 50 to 75 good. A tester on a real phone should confirm this at the next playtest (B19). The models are approximations. The gap between casual and skilled stays modest on purpose: under de-gamification there is no score chase to reward.

## Motion: every animation

The owner asked for slow animations where each motion makes sense. The curve `cubic-bezier(.2,1.6,.4,1)` (or 1.4) overshoots its end point and springs back, and it is used on 7 animations. **Replace it everywhere with `cubic-bezier(.2,.7,.2,1)`**, a calm ease-out that never overshoots. Rule: **at most one endless loop on screen at a time**, and it has to mean something.

| Animation (file:line) | Where | Now | Verdict | What it should communicate, and the fix |
|---|---|---|---|---|
| `gDrop` (`game.css:25`) | Start logo entrance | Falls 200 px with a -20 degree spin, 1 s, overshoot | **Too bouncy** | "Hello, this is Ekky". Fade in and rise 12 px over 700 ms, ease-out, no spin. |
| `gFloat` (`game.css:25`) | Start logo, after the entrance | ±8 px float, 4 s, endless | **Meaningless** (competes with the art below it) | Remove. The logo stays still once it has arrived. |
| `twinkle` (`game.css:8`) | Background sky, every screen | Each star 3 s, endless | OK, slightly busy | "Night sky, calm". Keep, but 6 to 9 s per star with random delays, at most 40 % opacity change. Off under reduced motion (already). |
| `icoWiggle` (`game.css:47`) | Active tab icon | Rotates ±12 degrees every 2.4 s, endless | **Meaningless** | The active tab is already shown by the yellow dot and the label. Remove the loop. |
| `tabBounce` (`game.css:48`) | Tab press | Scales to 1.35 x 0.7 and back, 550 ms, overshoot | **Too bouncy** | "Pressed". Scale 1 → 0.92 → 1 over 200 ms, ease-out. |
| `faceIdle` (`game.css:53`) | The face in the middle tab | Rocks ±4 degrees, 3 s, endless, on every screen | **Meaningless** (always moving while you read) | Remove, or play it once (2 rocks) when the Map tab opens, as "here I am". |
| `faceBoing` (`game.css:55`) | The middle tab face, pressed | 1.25 x 0.75 squash, 600 ms, overshoot | **Too bouncy** | Same as `tabBounce`: 200 ms press. |
| `dashMove` (`game.css:62`) | The dotted path between map nodes | Dashes slide, 1.2 s per loop, endless | **Too fast** | "This is the way". Slow it to 5 s, or make it static. Replaced anyway by the village map (fix 5). |
| `cardIn` (`game.css:80`) | Art cards appearing | Rise 30 px and scale from 0.9, 500 ms, overshoot 1.4 | **Slightly bouncy** | "New art arriving". Rise 16 px with a fade over 450 ms, ease-out, 40 ms between cards, no scale. |
| `holo` (`game.css:87`) | The 8 Legendary cards in Art | Light sweep, 2.6 s, endless, on every Legendary at once | **Stacked loops** (8 shimmers at once) | "This one is special". Sweep once when a card scrolls into view, then rest. Or one card at a time, every 8 s. |
| `catBob` (`game.css:89`) | Category badge on every art card | Bobs 4 px, 3 s, endless, on every card | **Meaningless** (dozens of loops) | Remove. The badge is a label, not a character. |
| `.g-ico` transitions (`game.css:42-43`) | Tab icons | 300 to 350 ms, overshoot | **Too bouncy** | 250 ms ease-out. |
| `shakeX` (`game.css:134`, and `game.js:122`) | A button or form field with an error | ±8 px shake, 400 ms | OK (it means "not yet") | Keep, at ±6 px. None under reduced motion. |
| `packIdle` (`game.css:145`) | Card pack (removed feature) | 1.6 s endless | Dead code | Delete. |
| `countPop` (`game.css:156`) | Star Catcher 3-2-1 | Zooms from 3x, 900 ms, overshoot | **Too fast and bouncy** | "Get ready". Fade each number in at 1.1 → 1.0 over 500 ms; the 800 ms rhythm stays. |
| `resPop` (`game.css:160`) | Star Catcher result title | Scales from 0 with a -12 degree spin, 1.2 s, overshoot | **Too bouncy** | "Round finished". Fade and rise 12 px over 600 ms. On a new best, the title can glow once (600 ms), which is enough together with the confetti. |
| `flash` (`game.css:166`) | Red screen flash on a virus hit | 350 ms | OK, a little strong | "Oops, a virus". Keep at half the opacity (0.18). Off under reduced motion (already). |
| Hero bob (`game.js:219`) | Ekky in Star Catcher | ±3 px sine, about 1.1 s per bob | OK | "I'm alive". Keep. |
| Item spin (`game.js:200`) | Falling stars and viruses | Up to ±2 rad/s random spin | OK | "Falling". Cap it at ±1 rad/s, so it reads as calmer. |
| Hit and catch particles, floating "+3" (`game.js:203-211`) | Star Catcher | 0.6 to 1.0 s | OK | "Got it". Keep. |
| Sheet open (`game.css:101-103`) | Level sheets, Hire sheet | Backdrop 300 ms fade; sheet slides up | OK | "Here's more". Keep, at 350 ms ease-out. |
| Confetti (`game.js:124`, `game.js:228`) | Quest sent, new best | Library burst | OK (real wins only) | Keep. None under reduced motion. |

**Desktop classic site** (`css/site.css`), out of the game's scope but under the same owner direction: `wave`, `bob`, `spin`, `eyes`, `glow`, `morph`, `spinSlow`, `ywiggle`, `icoWiggle`, `catBob`, `marq` and `scrolly` can all be running at once on the hero. That calls for its own motion pass: keep the marquee and one hero loop, and remove the rest or play each once.

---

## Owner direction: an isometric map, animated, made from Ekky's art

Typed in the Game Director session, 2026-10-27, quoted exactly: **"make the map isomoprihc like this"**, with a screenshot of an isometric village from another mobile game, then **"but with animation and re-createfd with his asset"**.

**What we take from the screenshot: only the idea of an isometric village.**
- We take: places along winding paths, small figures walking about, a camera that looks down at an angle, and buildings you tap to enter.
- We copy nothing from that game: no building designs, no textures, no characters, no coin or resource bar, no build menu, no layout, no colors (project rule: never imitate others' art).
- Everything you see comes from Ekky's own pieces (`kind: "original"`, `shareable()`), with plain isometric shapes in his palette where no drawing exists (plan asset rule 4).

### The village: "Little Planet Town"
The map becomes a small isometric town on a grassy diamond island in the night sky the site already uses.
- Each map level is one **place**, marked by Ekky's own cut-out art on a simple block building.
- His characters stroll along the paths between them.

| Place (map level) | Built from | What it shows |
|---|---|---|
| **Ekky's desk**, in the center (Who is Ekky?) | Little Planet: Ekky on his chair at his desk | Ekky sits at his desk with the floating doodles around him. Tap: the "Who is Ekky?" sheet |
| **Paint studio** (Color with Ekky) | Pen-hand and palette cut-outs as the sign; the Giraffe Ride giraffe looking over the fence next to it | A simple block house in his yellow, with the pen-hand on the roof. Tap: coloring |
| **The gallery** (Art Collection) | Real thumbnails of his pieces, hung as frames on the building's two visible walls (an isometric skew of the actual images) | The only building showing actual artwork on its walls. Tap: Art |
| **Doodle workshop** (Doodle to Done) | The yellow ghost from Monster World Doodles peeking out of the door | Tap: the process sheet |
| **The gate** (Final Quest), at the edge of the island | The Hidden Monster lair gate and the monster head | A warm lantern glow at the gate. Tap: the Hire sheet. No boss wording |
| **Launch pad** (Star Catcher) | The NFT #3 astronaut helmet on a small round pad | Tap: Star Catcher |
| Later: **bus stop** (Paint Patrol) and **harbor** (Little Planet Quest) | The Broken-Down Bus; the Afloat swimming ring | Appear only when those games exist and their `FEATURES` switches are on |

### Animation (slow, every motion means something)
| Motion | Timing | Meaning |
|---|---|---|
| 3 to 5 of his characters walk the paths (the ghost, the cat, the Plug Hero, the giraffe kid, a Monster Snack Bar monster), each a cut-out with the puppet bob from `docs/minigames.md` | 1 tile every 1.6 s, a 700 ms bob, a pause at each corner | "This place is alive". One character per path, never crowded. |
| Tap a place: Ekky glides on his chair along the path to it, then it opens | 0.6 to 1.2 s depending on distance, ease-in-out | "I'm going there". Tapping again during the glide opens it at once (no waiting). |
| The tapped building lifts 4 px and its sign glows once | 300 ms | "This one". |
| Clouds drift across the sky behind the island | 60 s per crossing | Ambience only, the one endless background loop. |
| The gate's lantern glows | 4 s soft pulse | "Come here when you're ready" (Hire). The only loop on a building. |
| Reduced motion | | No walking figures, no glide (instant open), no lantern pulse. Everything stays tappable. |

### Rules it must keep
- **Every place is visible on the first screen** on the iPhone 13 (390 x 536 px map area), with no panning needed. Panning by drag is optional, for a closer look.
- **Every place is a real `<button>`**, at least 44 x 44 px, with its name as a label under it and as its accessible name. The canvas is only scenery.
- **No locks, no "next" glow, no coins** (owner decisions).
- **Hire Ekky chip** in the HUD as today.
- Performance: the ground is one pre-drawn image (generated once by `scripts/` from shapes), the walkers are drawn on one canvas, and the buildings are DOM elements. Target 60 fps on a mid-range phone, under 400 KB of new images.
- **Shares the isometric code with Little Planet Quest** (MG6 in `docs/minigames.md`): the same tile math, depth sort and puppet animator. The map is a good first, smaller use of that engine.

### Proposed ticket (for the UX lead)
| Ticket | Owner | Size | Acceptance test |
|---|---|---|---|
| Isometric village map (replaces the node list in B06) | DEV (engine), UX (place names and labels), DIRECTOR (layout and motion review) | L (6 to 8 h) | On the iPhone 13 viewport, all 6 places are visible without panning, and each is a labeled button of at least 44 px that opens its content in one tap. 3 to 5 own-art characters walk the paths at the speeds above. With reduced motion, nothing walks and every place still opens. `npm run check` passes, with no art from fan or client pieces. 60 fps in a Chrome performance trace on a 4x CPU slowdown. |

---

## Addendum: the interim isometric map (dev/assets 2f09d76)

Tested the same way on the iPhone 13 viewport, at 0.3, 1.5 and 4 s after opening the Map tab.

| Check | Result |
|---|---|
| All places visible without scrolling | **Pass.** The 5 islands and the Star Catcher button are all on screen. |
| Tap targets | **Pass.** Each island is a real button, 108 to 126 x 123 to 138 px, on top (tappable) at its center. |
| Labels | **Pass.** Each island has its name as a sign below it. |
| Console | 0 errors. |
| No boss theme | **Fail.** The Final Quest island still has the `boss` class and its red styling. |
| Ekky picture | **Fix.** The "Who is Ekky?" island shows the blue-haired face, which `docs/roles.md` lists as the Secret Android character. Ekky is the glasses guy (owner, confirmed). |
| Motion | **Stacked loops.** While the map is open, `document.getAnimations()` reports 5 `islandBob` loops (4 s each, all at once), 60 `twinkle`, and, on screens that are **not visible**, 46 `catBob`, 46 `skel` (the loading shimmer) and 8 `holo` loops, plus 3 loader `dot` loops after the loader has finished. Pause animations on hidden screens. Remove the island bob (the ground shouldn't float). |

**Verdict:** a good first step and the right bones (DOM buttons, labels, bridges, everything on one screen). It still reads as five icons on five tiles rather than a place. The design that extends it is "Ekky's Village" in `docs/minigames.md` (tickets V1 to V6).
