# Status

The integrator updates this every hour. Read it before you ask for anything.

- **main:** 6fb6566 (00:55 UTC). check passes, a11y {}, 0 endless loops, phone and dark probes clean, e2e 152 PASS / 0 FAIL.
- **Snapshot:** `sprint/h4` = 6fb6566.
- **Sprint:** 6 hours, autonomous, until 02:53 UTC (`docs/sprint-6h.md`). **Freeze:** 02:15 UTC.
- **Auto-merge (owner, 23:45):** every 2–3 min each `dev/lean*` push merges by itself when check, a11y, loops, the phone and
  dark probes and e2e all pass, and it deletes no coloring page. Skips are logged and sent to the owning developer.
- **APK:** `.github/workflows/android-apk.yml` builds a debug-signed APK on every app change into the `app-latest` release;
  the glowing APK chip on the start page links to it (Android browsers only).

| Lane | Branch | Now |
|---|---|---|
| Developer 1 (game.js, idle.js) | dev/lean | Tab switch: still 6 frames over 32 ms, worst 100 ms at 4x |
| Developer 2 (color.js) | dev/lean2 | Coloring and Doodle Scene polish |
| Developer 3 (site, touch CSS) | dev/lean3 | Touch and hover, smoothness |
| Developer 4 (coloring pages, map) | dev/lean4 | Coloring picker and page-open animation (merged) |
| Developer 5 (QA) | dev/lean5 | `scripts/e2e.cjs` (152 checks), `scripts/jank.cjs` (frame times at 4x CPU) |

## Frame times at 4x CPU (jank.cjs RUNS=3, worst run), 00:55

| Action | Frames over 32 ms | Worst |
|---|---|---|
| Tabs Art, Map, Mine | 6 | 100 ms |
| Hire sheet | 4 | 67 ms |
| Done reveal | 4 | 33 ms |
| Art lightbox | 2 | 50 ms |
| Map face tab | 2 | 67 ms |
| Language toggle | 1 | 33 ms |
| Coloring fill, swatch, sticker drag | 0 | 17 ms |

## Open asks for the owner or Ekky (not blocking; see docs/owner-asks.md)

- Ekky's hand lettering sheet, and a photo or self-portrait.
- Client pieces as village scenery.
- Android: a release signing key (the APK is debug-signed today).
