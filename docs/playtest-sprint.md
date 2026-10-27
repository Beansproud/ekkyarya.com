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
