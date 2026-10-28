# Sprint 2: 6 hours in three 2-hour rounds (2026-10-28 04:20 to 10:20 UTC)

The owner: "start the sprint with the new team". The team shape and its reasons are in the sprint 1 reflection on the
board; in short, the team is organised around what the owner sees on his phone, not around files.

## Goal

Try Ekky feels **calm, smooth and his** on a real phone:
- no visible stutter;
- nothing the owner has to call "not neat";
- every screen passes the art critic.

## Team

| Role | Model | Session | Owns | Branch |
|---|---|---|---|---|
| Product lead | Opus | this session (integrator) | the owner's words, priorities, demos, conflicts, `docs/owner.md`, `docs/status.md`, this file | `main` |
| Play squad | Sonnet | new | Mewarnai, Doodle Scene, the Done reveal, share: `js/color.js`, `js/share.js`, `assets/color/`, `scripts/make-page.mjs`, the "Play" section of `css/game.css` | `squad/play` |
| World squad | Sonnet | new | start page, village, idle effects, Catch stars: `js/game.js` start and map parts, `js/idle.js`, `assets/village/`, the "World" section of `css/game.css` | `squad/world` |
| Shell squad | Sonnet | new | navigation, tabs, language, Hire, speed, the APK, the service worker: `js/site.js`, `index.html`, `sw.js`, `css/site.css`, `js/game.js` navigation parts, the "Shell" section of `css/game.css` | `squad/shell` |
| Visual QA | Sonnet | new | measures neatness on screenshots: alignment, symmetry, clipping, contrast, 44 px; can block a merge with one line | `qa/visual` (docs and scripts only) |
| Art critic | Opus | new | `docs/art-critic.md`: top 3 notes per round, keep, simplify or cut; never blocks | `critic/art` (`docs/art-notes.md` only) |
| Fresh eyes | Sonnet | a new session every round | uses the site as a first-time visitor for 10 minutes; one report | none |
| Guardian | scripts | none | `scripts/gate.sh`, auto-merge, the GitHub Pages deploy check, the board | none |

`js/game.js` is shared by World and Shell: World owns the start, map and village functions, Shell owns `go()`,
tabs, history, `openSheet` and language. Touch the other squad's functions only after a one-line message to them.

## Rhythm

| UTC | What happens |
|---|---|
| 04:20 | Kick-off: each squad gets its round 1 tasks |
| every push | `bash scripts/gate.sh` must print `GATE PASS`, then push; auto-merge takes it within about 3 minutes |
| 06:20, 08:20 | End of a round: snapshot `sprint2/rN`; Visual QA and the art critic review it; fresh eyes runs once; the product lead sends the owner a 60-second demo and one question; the next round starts with the critic's top 3 |
| 10:00 | Code freeze |
| 10:20 | End: final review, board, a 5-line reflection from each session |

## Round 1 backlog (from sprint 1's leftovers)

**Play**
1. Bug: after opening and closing Mewarnai, a language switch pops the picker back up (`relang()` in `js/color.js`
   reopens it because `#cPick` keeps `active`).
2. Big Catch: remove the grey shading baked into the lines, or leave it off with a reason.

**World**
1. Idle effects picked up 3 slow frames (worst 50 ms) in the final run; back to 0.
2. Map face tab: 3 slow frames, worst 67 ms.

**Shell**
1. Tab switching: 5 slow frames, worst 67 ms at 4x CPU. The redesign: screens as light composited layers.
2. Visual QA's findings on the tab bar and Hire chip.

**Visual QA**
- A symmetry and alignment probe (`scripts/neat.cjs`) for the tab bar, Map face, start grid, Hire chip and sheet
  headers, at 360 and 390 px, light and dark. It reports offsets in px; anything over 2 px is a finding.

**Art critic**
- The first review of the live site (`docs/art-notes.md`).

## Rules (from sprint 1)

- `bash scripts/gate.sh` before every push. A blank output is a fail.
- One owner per file. Ask the other squad before touching their part.
- Owner messages typed in your session: forward the exact words and the time to the product lead **before** building.
  If the request conflicts with a standing rule, say so in that message.
- Every smoothness claim comes from `scripts/jank.cjs` with `RUNS=3`, before and after.
- No emoji, only Ekky's art, fan art only in PROJECTS, game on light paper, 3 menu items, Hire one tap away.
