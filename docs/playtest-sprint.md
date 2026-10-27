# Sprint playtests (Game Director)

One section per snapshot branch (`sprint/hN`), measured with `scripts/playtest/`. Each finding is one line with a fix of about 10 minutes.

## h0 (`main` a5bc75e), baseline at 21:05 UTC

| Check | Result |
|---|---|
| First coloring shared | 12.7 to 13.9 s to the share sheet (4 runs), 3 taps after Done |
| Friend's link | Same picture: 0 % of 8x8 blocks differ. Arrival at 0.9 to 1.8 s on a fast connection |
| Friend's link on slow 4G | Arrival drawn at 3.14 to 3.18 s; the loader is under 50 % at **3.25 to 3.35 s** (target < 3 s) |
| Hire Ekky one tap away | Every screen, at 390x664 and 360x640 (the Hire sheet itself excepted) |
| Endless animations outside a game | **0** on every screen, the village included (nothing moves on its own) |
| Start screen | 6 drawings fully visible at 1 s |
| Village | First frame 380 ms at 4x CPU, 59.2 fps. 6 places on screen and tappable (doodle corner and Star Catcher at exactly 44 px). 8 villagers from 6 pieces. 3 artworks opened in 19.2 s. List fallback, reduced motion and night OK |
| Star Catcher, idle rounds | 5, 8, 16 points ("Time's up!", copy in points) |
| Errors | 0 |

Findings:
1. Slow 4G: the friend's coloring shows at about 3.3 s, slower than the 3.0 s on c68b7ce. Skip the loader's 0.2 s delay and fade it in 0.3 s when `js/links.js` drops it on an arrival. (Developer B: `css/site.css`, `js/links.js`.)
2. Doodle corner and Star Catcher are exactly 44 x 44 px on the iPhone 13 map (59 to 99 px for the others). With G1's 2x zoom they grow; until then, extend their hit area by 8 px. (Developer A: `js/game.js` place boxes.)

## MG4: Paint Patrol stage 1 (`main` af07cd8, `?game&ff=paintPatrol&play=patrol`), 21:25 UTC

**Verdict: GO.** Developer A can switch `paintPatrol` on.

| Acceptance | Result |
|---|---|
| First try in 50 to 80 s | **62.5 s** for a keyboard player who holds right and jumps when a doodle or a shock wave is close (the big friend arrives at 50.2 s, painting calms him in about 10 s). A touch player who holds the thumb stick and never jumps moves about 130 px/s, so about 100 s: slower, still inside the stage's 60 to 120 s |
| Can't lose | Pass: 11 knockbacks in a 62.5 s run, nothing lost, no game over. An idle player never moves (the stage never ends on its own); the hint says how to move |
| ≥ 5 of Ekky's characters within 30 s | Pass: Ekky plus 7 doodle kinds (virus, dog, blob, pickle, doodle cat, waver, skull) |
| The big friend telegraphs every swing | Pass: 0.8 s lift before each slam, every time |
| 60 fps at 4x CPU | Pass: 60 fps, 95th percentile 16.8 ms, no frame over 50 ms |
| End screen | Pass: Coexistence, "Everyone here comes from: Little Planet, Virus and War, Monster World Doodles, Monster in My Room", See it in the portfolio, Hire Ekky, Play again, Something else |
| Portrait | Pass: "Turn your phone sideways" with "Play anyway". After turning the phone, the game stays (fix a904812, merged) |
| No "boss" or franchise words, motion is gameplay only | Pass: none in `js/patrol.js`, CSS or copy. Outside play: the hint fades once, the end card fades in once, and the phone-turn icon turns twice. No endless loop |
| Errors | 0 |

Findings:
1. **Fixed (a904812):** turning the phone to landscape dropped the visitor onto the classic site, with the game hidden under it.
2. Touch players who don't jump take about 100 s. Lower `knockback` from 120 to 80 px, so a non-jumper finishes nearer 80 s (Developer A, `js/patrol.js` `PP.knockback`).
3. The copy keys `patrol.*` still use the English fallbacks: the UX lead adds EN and ID.
