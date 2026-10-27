# Sprint: 6 hours, autonomous (2026-10-27 20:53 to 2026-10-28 02:53 UTC)

The owner: "start again, I give you 6 hours to do everything autonomously between UX director, game director and 2 game developers."

Autonomous means the team decides, builds and ships without asking the owner. Anything that truly needs Ekky (his handwriting, a photo) is prepared behind a switch that stays off and listed in `docs/owner-asks.md`.

## Goal

Try Ekky feels **hand-made and calm** (Ekky: "too jam-packed", "trying too hard", "uncanny valley"), every feature works on a real phone, and the games are worth sharing. Hire stays one tap away.

## Team and lanes (one owner per file)

| Role | Session | Branch | Owns |
|---|---|---|---|
| Integrator | session_01V9xssjYCJ36JvDWDtGAXJL | `main` | `main`, `docs/status.md`, `docs/owner.md`, `docs/sprint-6h.md`, the gate and the merges |
| UX lead | session_014vZdpVQ1akFUjJUYkatpLJ | `ux/r1` | `docs/backlog.md`, `js/data.js` COPY, `docs/copy.md`, the acceptance of every merge |
| Game Director | session_014vZdpSRoec9dMaZ562esPL | `director/backlog` (fixes on `director/fix-*`) | `docs/minigames.md`, `docs/playtest-*.md`, `scripts/playtest/` |
| Developer A: games | session_014vZdpTepmb6uBiaAW96HMH | `dev/assets` | `js/game.js`, `js/patrol.js`, `js/color.js`, village files (`assets/village`, `scripts/village.py`), `css/game.css` sections for these |
| Developer B: site and look | new session | `dev/site` | `index.html`, `css/site.css`, `js/site.js`, `js/share.js`, `js/links.js`, `manifest.webmanifest`, `sw.js`, the start screen and HUD in `css/game.css` |

When you need a change in a file you don't own, message its owner. Copy (text people read) always goes through the UX lead.

## Scope, in order (new asks go to "Next" at the bottom, not into this list)

### Developer B: site and look
1. **S1, the sketchbook look**, on phone and desktop:
   - an off-white paper background with a faint texture;
   - art taped on at a 1–2° tilt (each tile its own angle, fixed, not animated), with no glossy rounded cards or heavy drop shadows;
   - Ekky's small doodles as section dividers.
   - The colors stay Ekky's palette, and Fredoka stays until the handwriting arrives.
2. **S2, fewer layers.**
   - Phone: one bar (UX decides the HUD or the tab bar), and sheets only where needed.
   - Desktop: drop the game-style chrome and keep one accent color.
3. **S3, a handwriting slot.** Headings can show an image of Ekky's lettering (`assets/hand/<word>.png`), with the real text as the accessible name, behind `FEATURES.handLettering`, which stays off. The same goes for a photo or self-portrait slot in About.
4. **S4, real-phone polish.**
   - Download, share and install on iPhone Safari, Android Chrome and in-app browsers (the save dialog and install help already exist).
   - Every `hidden` toggle has a `[hidden]{display:none}` rule.
   - Tap targets of at least 44 px, no double-tap zoom.
5. **S5, speed.** The first screen in under 2.5 s on slow 4G, with image sizes and lazy loading checked.

### Developer A: games and village
1. **G1, the village (V4) quiet and readable.**
   - The map can zoom to 2x and pan with a finger, with places still one tap.
   - Each place sheet gets "Made from: <piece>", linking to the artwork.
   - Nothing moves on its own.
2. **G2, the Paint Patrol slice**, made playtest-ready: the MG4 playtest happens with the Director. If the Director says GO, switch `paintPatrol` on; otherwise it stays off with a list of reasons.
3. **G3, Star Catcher and Color polish** from the Director's notes: fair difficulty, a clear ending, and share and download working.
4. **G4, the Android app (Capacitor).** `npm run build` and `npx cap sync` succeed. List what an APK needs; don't sign or publish.

### UX lead
- Write acceptance criteria for S1–S5 and G1–G3 in the backlog **before** the developers start (in the first 20 minutes).
- Accept every merge within 15 minutes, as one line: ACCEPT, or the blockers. Nits go in one list per hour.
- Keep the copy short, in Ekky's voice, EN and ID. The owner asked for the uncanny-valley jokes; keep exactly those five lines.

### Game Director
- Commit the playtest driver scripts to `scripts/playtest/` (anyone can re-run them).
- Playtest the snapshot branches the integrator cuts (`sprint/h1` … `sprint/h6`), never a moving head.
- The MG4 playtest of Paint Patrol: GO or NO-GO, with numbers.
- Each finding is one line with a fix of about 10 minutes. Small fixes go on `director/fix-*`, and the integrator merges them.

## Rules (from the round 1 reflection)

- **Small pushes.** Each push gets one line to the integrator: the head, and what it does. No batches, no long reports.
- **The integrator gates and merges every push** (check, a11y, phone probe at 360x640 and 390x664 in EN and ID, 0 errors, 0 endless loops). Review follows the merge.
- **Merge main before every new task.**
- **No motion loops.** Ekky said it tries too hard: allowed are the tap press, plain fades, the coloring fill and gameplay. 0 endless animations outside a game in play.
- **Owner messages.** If the owner types into your session, forward the exact words and the time to the integrator **before** building, and the integrator logs them in `docs/owner.md`.
- **One shared status.** Read `docs/status.md` before you ask for anything; the integrator updates it on every merge.
- No emoji, no art that isn't Ekky's, fan art only in PROJECTS, client pieces portfolio-only unless the owner says otherwise.

## Clock (UTC)

| Time | What happens |
|---|---|
| 20:53 | Kick-off |
| 21:15 | Acceptance criteria are in the backlog |
| every hour | The integrator cuts the branch `sprint/hN`, the Director playtests it, and the UX lead sends nits |
| 02:15 | Code freeze |
| 02:15–02:40 | Final acceptance, the walkthrough video and the board |
| 02:53 | Stop. Each session sends a 5-line reflection |

## Next (not this sprint)

The client-art scenery (needs the owner) and Ekky's handwriting and photo (need Ekky).
