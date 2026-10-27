# Playtest V6: Ekky's Village

Author: Game Director. Date: 2026-10-27.

**Build tested:** `main` at `6576ff0`: village V1, V2 batches 1 and 2, V3, and the download fix.

**How:** a village driver over HTTP on the iPhone 13 viewport. It checks, in order:
- the first frame and the frame rate with 4x CPU slowdown;
- every place's size, position and whether it is on top at its center;
- the running animations (`document.getAnimations()`);
- a walker's speed;
- a scripted tester who taps villagers and opens their artwork, with 2.5 s of reading per card and 3 s per artwork;
- Hire;
- the list fallback;
- reduced motion;
- night (clock set to 21:30).

Then a side-by-side look against the owner's reference screenshot.

## Verdict: **GO for V4 (Explore)**, with the fixes below folded into V4 or done alongside it

**Calm, cozy and simple: yes.**
- The village reads at a glance: a small island in Ekky's night sky, six labeled places, his characters on every corner, and "Work with Ekky" glowing at the gate.
- It is fast and light.
- The one real weakness is **variety**: 6 of the 10 tappable villagers come from one piece, so the village shows less of his range than it could.

## Acceptance (B42, V1 to V3 and V6)

| Check | Result | Evidence |
|---|---|---|
| All main places visible without panning, labeled, ≥ 44 px, open in one tap | **Pass** | 6 places, all fully on screen with their labels, and each on top at its center. Sizes: home 66x100, studio 86x84, gallery 112x105, doodle corner 46x46, Star Catcher 48x48, Work with Ekky 68x86. The bus stop is correctly absent while `paintPatrol` is off (decision 6). |
| "Work with Ekky" and the HUD chip visible; Hire found without help | **Pass** | Both visible on the first frame. Tapping the gate opens "Final Quest: Work with Ekky". |
| ≥ 5 of Ekky's characters and 4 real framed pieces in the first frame | **Pass** | In the static picture: Ekky at his desk, the giraffe and kid, the ghost, the astronaut and radio explorer, the gate's lantern kids, the UFO and the crocodile. 4 framed pieces on the gallery walls (`featuredPick(4)`). |
| First frame < 1 s at 4x CPU | **Pass: 139 ms** | From the Map tap to the decoded village picture and the place buttons. |
| 60 fps at 4x CPU | **Pass** | 300 frames: mean 60 fps, 95th percentile 16.8 ms, no frame over 50 ms. |
| Ambience budget (decision 10) | **Pass** | Running on the map:<ul><li>the sky twinkles (9 s);</li><li>1 water shimmer (10 s);</li><li>2 clouds (84 s and 72 s);</li><li>the lantern (6 s);</li><li>one steam (6 s);</li><li>6 walkers (8 to 14 s routes) and their turns.</li></ul>Nothing else. |
| ≤ 8 walkers; slow walk | **Pass** | 6 walkers plus 4 standing villagers. Measured speed: 9.7 px/s on a 358 px-wide village, which is calm. |
| Tap a villager → its artwork | **Pass** | The card shows the title, a thumbnail, one line of description, "See the artwork" and Hire. "See the artwork" opens the lightbox with that piece. |
| A tester opens ≥ 3 artworks within 60 s | **Pass: 21.4 s** | Monster World Doodles at 7.7 s, RPG at 14.6 s, Monster World Doodles again at 21.4 s. See the variety fix below. |
| List fallback | **Pass** | "Show places as a list" on the map. |
| Reduced motion | **Pass** | 0 running animations, walkers stand still, a place opens in about 100 ms with no lift. |
| Night | **Pass** | At 21:30 the ground dims (`brightness(.7)`). The labels, the framed art and "Work with Ekky" stay at full strength. |
| No boss, coins, score, locks or "next" glow | **Pass** | |
| Errors | **Pass** | 0 console errors, at normal speed and at 4x CPU. |
| **Side-by-side with the reference** (decision 1) | **Pass: nothing copied** | The reference is a daylight town of wooden houses, striped market awnings, dirt roads and a wooden tile menu, with a coin and resource bar. The village is a single isometric island floating in Ekky's night sky, built from his own cut-outs on plain palette shapes, with a yellow block gallery hung with his real pieces. It has none of that game's buildings, textures, characters, UI, bars or layout. Only the mood is shared: isometric, peaceful, small life. |

## Fixes, ranked by impact

| # | Fix | Why | Owner | Size |
|---|---|---|---|---|
| 1 | **More pieces among the villagers.** Today 6 of 10 tappable villagers are from Monster World Doodles (UFO, crocodile, dog, pickle monster, waver, doodle cat). The other 4 are RPG (fire spirit), Noodle Bath, Plug Hero and Buried at the Beach (crab), so villagers lead to only 5 artworks. Swap 3 or 4 doodle walkers for characters from other pieces in the `docs/roles.md` catalogue: the Coexistence kid, the Broken-Down Bus caped hero, a Monster Snack Bar monster, a Morumelons kid, the Viking and Dragon kids, the RPG orc or mouse knight. Aim for **8 different pieces** among the 10. The sprites already cut in batch 2 (`orange-monster`, `blob`, `skull`, `car`) can carry some of this. | A client tapping around should meet his range, not one page of doodles. | DEV, UX | S |
| 2 | **Clouds never cross the art.** The day cloud (84 s) drifts across the giraffe and the kid's faces at the paint studio as a pale smear. Keep clouds in the sky band and at the island's edges (behind the island's top corner, over open water), or fade them to about 0 while they pass over a place. | Showcase: his drawing is the content; a white blur over it reads as a glitch. | DEV | S |
| 3 | **Labels next to, not on, the characters.** "Paint studio" covers the giraffe's legs, "Star Catcher" the astronaut's feet, and "Ekky's home" the bottom of his planet. Move each label to the ground in front of its place, or 6 to 10 px lower, so no character is cut. | Showcase. | DEV, UX | S |
| 4 | **A gentle walk.** Walkers glide without any step. Add the paper-puppet bob from `docs/minigames.md` (±2 px, about 700 ms, on the `img` inside the walker) so they read as walking, not sliding. It costs one transform animation per walker, inside the budget since walkers are content (decision 10). Off under reduced motion. | "Slow but make sense": the motion should say "walking". | DEV | S |
| 5 | **Every drawn character opens its own piece.** The giraffe and kid, the astronaut, the radio explorer, the ghost and Ekky at his desk are part of the places, so tapping them opens the place's action (Color, Star Catcher, …), and their own pieces (Giraffe Ride, Astronaut, Radio Explorer, Monster World Doodles, Little Planet) are never offered from the map. Add one line to each place's sheet: "Made from: <piece title>" opening the lightbox. | Every character names its artwork (owner: "make sure all art work has its role"). | DEV, UX | S |
| 6 | **Tab bar restyle** (decision 12: cream tiles, yellow active) is not in this build. The bar is still the dark one. | Approved polish. | DEV | S |
| 7 | **Small places on a small island.** The village is 358 px wide, so Doodle corner and Star Catcher are just 46 to 48 px, and the framed pieces about 40 px. Fine for round 1. Explore (V4) should zoom to 2x, so the art is seen at a size that does it justice. | Showcase; feeds V4. | DEV | (V4) |

**Not verified here:** touch feel on a real phone (tapping a moving 44 px walker), and the client sceneries of V5. None appear in this build's village data (`folk` and `walkers` hold only original pieces). If V5 is merged, it isn't visible yet.

## Re-run on `main` 830e9ec

Same results as `6576ff0`; the build only adds the V5 client-scenery path behind its switch, which is off.
- First frame: 192 ms at 4x CPU. Frame rate: 59.4 fps, 95th percentile 16.8 ms.
- Places: all 6 in view and tappable.
- Animations: the same budget.
- Tester: 3 artworks in 21.7 s.
- Reduced motion: still. Errors: 0.

Villagers are still 6 of 10 from Monster World Doodles.

**GO for V4.** The top 3 issues stay #1 variety, #2 cloud over the art, #3 labels on the characters.
