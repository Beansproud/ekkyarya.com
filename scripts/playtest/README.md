# Playtest drivers (Game Director)

Run any of them against a checkout of the snapshot being tested (`git worktree add /tmp/h1 origin/sprint/h1`). Each one serves the site over a local HTTP server and uses the preinstalled Playwright Chromium; nothing to install. `[site dir]` defaults to the current directory, `[out dir]` (screenshots) to `/tmp/playtest`.

| Script | What it measures | Run |
|---|---|---|
| `share-loop.cjs` | First-time visitor: Color → Giraffe → 10 fills → Done → Share. Time and taps to the share sheet, the payload, the friend's link in a fresh browser (pixel difference, arrival time), the desktop download and copied link | `node scripts/playtest/share-loop.cjs . /tmp/pt` |
| `arrival.cjs` | A friend's coloring link on a fast connection and on slow 4G: arrival drawn, loader under 50 %, loader gone | `node scripts/playtest/arrival.cjs . 3` |
| `screens.cjs` | Every game screen at 390 x 664 and 360 x 640: Hire Ekky one tap away, endless animations (must be 0 outside a game in play), start drawings visible at 1 s, errors. Add `id` for Bahasa Indonesia | `node scripts/playtest/screens.cjs . /tmp/pt id` |
| `village.cjs` | Ekky's Village: first frame and fps at 4x CPU, places, villager variety, running animations, 3 artworks within 60 s, Hire, list fallback, reduced motion, night | `node scripts/playtest/village.cjs . /tmp/pt` |
| `star-catcher.cjs` | Idle Star Catcher rounds in the real build (should score about 5 to 20) | `node scripts/playtest/star-catcher.cjs . 3` |
| `patrol.cjs` | MG4 Paint Patrol playtest (switch turned on in the page only): time to the end for a casual, a touch-drag and an idle player, knockbacks, characters in the first 30 s, the telegraph before every swing, fps at 4x CPU, end screen, portrait card | `node scripts/playtest/patrol.cjs . /tmp/pt` |
| `star-sim.py` | Star Catcher simulation with the `BALANCE` from `js/game.js`: idle, casual and skilled players | `python3 scripts/playtest/star-sim.py . 300` |

`lib.cjs` holds the shared helpers (server, devices, slow 4G, CPU throttling, the share capture and the coloring flow).
