# Round 1 acceptance (UX lead)

Build: `dev/assets` 713c99b merged with `ux/r1` 6f65f9b (clean). Date: 2026-10-27.
Method: `scripts/capture.cjs` (phone and desktop screens), plus two probes over HTTP on a 390 x 664 phone viewport and 1440 x 900 desktop: visibility and hit-testing at element centers, `document.getAnimations()`, text scans in EN (`en-US`) and ID (`id-ID`), failed requests, and real taps.

**Verdict: ROUND 1 ACCEPTED** on `dev/assets` ecdd32f (re-check, 2026-10-27). The first pass on 713c99b found two small blocking items (below); both are fixed and verified:
- **B26:** "Who is Ekky?" now lists all four facts plus "Worked with Sequis, Intiland, Viar, pbTaxand, Honshu, Suapi and Bima.", in EN and in ID ("Proyek mulai $25", "Pernah bekerja sama dengan ..."); desktop About shows the same four facts and the row.
- **Mine:** scrolled to the end, "Clear what I made" / "Hapus buatanku" sits at 388 to 432 px, clear of the tab bar at 580 px, and is the topmost element at its center.
- Non-blocking items done too: the loader no longer catches taps, nothing animates on hidden screens, and the desktop hero keeps one loop (`bob`) plus the marquee. 0 page errors and 0 failed requests in both languages; `npm run check` passes.

The first-pass report follows for the record.

## r1b acceptance list

| Check | Result | Evidence |
|---|---|---|
| 6 artworks fully on screen within 2 s, no swipe (phone) | **Pass** | 6 of 6 fully visible and loaded at 2 s; also after a bad deep link. |
| Different set on reload; no fan art | **Pass** | Two reloads gave two different sets; 0 fan-art pieces in 15 reloads. |
| Desktop strip of 6 above the fold | **Pass** | 6 artwork images fully above the fold at 1440 x 900. |
| Hire Ekky in one tap from every screen and sheet | **Pass** | Real taps on the HUD chip open the Hire sheet on start and map; the chip is topmost on Art, Mine and every level sheet. The coloring picker covers the chip but has its own "Like what you see? Hire Ekky" button. |
| No "boss" text, EN and ID | **Pass** | 0 matches in both languages. |
| HUD role line not truncated | **Pass** | "Character Illustrator" fits. |
| 0 console errors, 0 failed requests | **Pass** | Phone, desktop, arrival link and bad link: none. |
| No overshooting curve | **Pass** | Curves in use: `(.2,1,.3,1)`, `(.22,.61,.36,1)`, `(.4,0,.2,1)`; none exceeds 1. |
| At most one decorative loop per screen besides the sky | **Pass** | Phone start, map, Art, Mine: only the sky twinkle. |
| Star Catcher: idle ≤ 12, casual 30 to 55 | **Pass** | Integrator's simulation: idle 9.7, casual 52.9. |
| Hidden tab never resumes play by itself | **Pass** | `visibilitychange` pauses and marks the round; play resumes only when visible. |
| "Clear what I made" reachable without being under the tab bar | **Fail (blocking 2)** | Scrolled to the end, the button sits at 620 to 664 px and the tab bar starts at 580 px; the tab bar is on top at its center. |
| `npm run check` | **Pass** | 10 UI files, 0 glyphs, no fan art outside PROJECTS. |

## Hiring-client review

| Area | Result |
|---|---|
| Start screen | Pass. Logo, the tagline, 6 real artworks, three equal tiles, "Just show me the art", EN / ID switch, Hire chip. The HUD shows the glasses guy as Ekky. |
| Map (interim islands) | Pass. All 5 places on one screen (lowest ends at 528 px of 664), "Work with Ekky" labeled, no boss styling. The village (B42) replaces it next. |
| Lightbox | Pass. Category, title, one-line description, "Want art like this? Hire Ekky", Download. |
| Coloring, reveal, share | Pass. Share and Download side by side right after Done (0 taps), "Share as video", the credit line, the arrival screen re-draws the friend's coloring. |
| Hire sheet | Pass. "Final Quest: Work with Ekky" clear of the X, Email Ekky, Copy email, Instagram, LinkedIn, Behance, "Ekky's website", "Projects from $25". |
| **Who is Ekky? and desktop About** | **Fail (blocking 1).** See below. |
| Bahasa Indonesia | Pass. With `id-ID`, the first visit is Indonesian and `<html lang="id">`; piece titles are Indonesian. |

## Blocking

1. **B26 hiring facts are incomplete.** The "Who is Ekky?" sheet shows 3 of the 4 facts: from Indonesia, languages, hours. It has no "Projects from $25" (`about.fact.price`) and no "Worked with Sequis, Intiland, Viar, pbTaxand, Honshu, Suapi and Bima." row (`about.workedWith`). Desktop About shows only skill tags, with neither the facts nor the row. Neither key is used anywhere in the code. A client deciding to hire looks for exactly these two lines. **Fix:** add both lines to the sheet, after the facts, and add the four facts plus the "Worked with" row (text, no logos) to desktop About.
2. **Mine: "Clear what I made" sits under the tab bar** (r1a fix 8). **Fix:** bottom padding on the Mine screen equal to the tab bar height plus 16 px.

## Not blocking (next round, or alongside V1)

- The finished loader keeps `pointer-events: auto` while fading. Taps still work, but set `pointer-events: none` once it starts to fade.
- 31 endless animations keep running on the Art screen while it is hidden. Pause them off-screen (the playtest asked for this; the village budget, B42 decision 10, requires it).
- Desktop hero runs `blink` and `bob` plus the marquee: keep one hero loop (B39).
- Client pieces are still portfolio and card only in the Developer's build, which predates the owner's "yes to all". `js/data.js` already allows them (`CONFIG.reuse.client`), so this needs only the Developer's filters relaxed once the owner confirms it with the Developer.

## Final acceptance at the deadline (main 243f861, 2026-10-27 11:55 UTC)

**ACCEPTED.** Probe at 390 x 664, 360 x 640 and 1440 x 900, EN and ID: 6 artworks fully visible first, no fan art in the featured row, Hire one tap from start, map, Art and Mine, every village place labeled, on screen and topmost, "Work with Ekky" above the tab bar, fan-art lightbox tagged with no Download, no "boss" text, no English left on ID screens (the desktop hero was the last one, fixed in 243f861), 0 errors, 0 failed requests, 0 loops under reduced motion, `npm run check` passes. The low-poly village islands are generated from plain shapes by `scripts/village.py`: nothing is copied from the reference.

## Sprint freeze acceptance (main 1672a23, 2026-10-28 02:15 UTC)

**ACCEPTED.** Sprint probe at 360 x 640 and 390 x 664 in EN and ID plus 1440 x 900: 0 blockers (0 errors, 0 failed requests, Hire one tap from every screen, the 5 uncanny-valley lines intact, no loops outside play). Start screen: 12 controls (Hire, 6 drawings, Color, Catch stars, 3 tabs). `scripts/probe-dark.cjs`: start, Art, Mine, Map and desktop readable in dark mode. `npm run check` passes.
**Games (Game Director):** village GO (first frame 251 ms and 60 fps at 4x CPU, 0 errors, 3 artworks reached, Hire place and chip, list fallback, nothing running under reduced motion). Paint Patrol: not in this build (removed in 082d9e6), no verdict.
