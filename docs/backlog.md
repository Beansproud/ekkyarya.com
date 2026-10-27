# Backlog: "Try Ekky", round 1

**Status: approved by UX lead (2026-10-27). This is the round-1 plan.** Proposed by the Game Director. Decisions marked **Owner decided** are settled by the owner and are not up for approval.

Author: Game Director. Gate G1. This file merges `docs/game-brief.md` ("brief #n", 26 tickets) and `docs/ux-audit.md` ("audit #n", 24 fixes) into one prioritized list with no duplicates. It serves the goal, share loop, asset rule and scorecard in `docs/plan.md`. UX Portfolio is the team lead and gives final acceptance. Where the brief and the audit conflict, **the audit's choice comes first**, with the Director's alternative and its reason next to it (see Decisions).

## Owner direction (2026-10-27)

1. **"Make the games actually very simple."** Every game is understood in one look and played with one finger, with no rules to learn. Round 1 therefore drops the whole meta-game: coins, packs, rarity drops, XP, player levels, trophies and lives. See D0.
2. **"Use De-Gamification: flexibility to play your way."** See the principles below and D0c.
3. **No locked features.** Every visitor gets every feature, with no login, no coins and no unlocking. Round 1 is static and has no login at all (project rule). If a login ever comes, it only keeps your colorings across devices; it never unlocks anything. See D0b.
4. **Owner answer (2026-10-27): "no trophies, no lives, nothing ever locked."** This settles D0b, D0c, D1 and D2, and closes owner questions 12 and 13.
5. **Owner answer (2026-10-27): "Ekky has the rights to all NFT".** NFT #3 (Astronaut) and NFT #9 (Radio Explorer) are his own work, `own: true`. They can be icons, stickers and share-card art. This closes the rights half of owner question 3; larger files are still wanted.
6. **Owner direction (2026-10-27): "everything is owned by Ekky. Do whatever you can at its finest, we will limit later. Or make a config for it."** Applied as: full scope in round 1 (Option A), and a reuse config in `js/data.js` (see "Ownership and the reuse config" below).
7. **Owner answers (2026-10-27, 08:14 UTC, typed in the Director's session, verified by the integrator).** They answer the numbered owner list in `docs/copy.md`. Mapping by the UX lead:

| Owner's words | Question it answers (`docs/copy.md` list) | Reading |
|---|---|---|
| "he is he" | 1. Pronouns | **He/him.** The copy may say "he". |
| "he is indonesian speak bahasa and english" | (backlog question 9) | **Indonesian; works in Indonesian (Bahasa) and English.** |
| "2. Evening to night, starting price $25." | 2. Reply time, availability, price | **Available evenings to night (Indonesia time, GMT+7). Projects start at $25.** Reply time itself is not promised. |
| "3. Sequis, Intiland, Viar, pbTaxand, Honshu, Suapi, Bima (endi onok popmie wkk)" | 3. Clients to name, and the clients behind "Client work" | **May be named in "Worked with": Sequis, Intiland, Viar, pbTaxand, Honshu, Suapi, Bima.** "endi onok popmie wkk" (Javanese, about "Pop Mie isn't one, lol"): **Pop Mie was not a client.** Which client goes with which piece is still open. |
| "4. NFT own project." | 4. Is Morumelons a client or Ekky's own project? | **Morumelons is Ekky's own NFT project**, not a client. |
| "5. endi onok bossfight." | 5. Boss Fight: is the fire spirit Ekky's design? | About "there's no Boss Fight": **the title is wrong; the piece goes back to "RPG".** The fire-spirit question stays open. |
| "6. self project." | 6. Plug Hero and Toybox: commissions? | **Self projects**, Ekky's own. |
| "7. yes to all Morumelon pieces." | 7. Rights to the NFT pieces (Astronaut, Radio Explorer) | **Yes**: the NFT pieces are Morumelons, and Ekky holds the rights to all of them. |

**Data updates from these answers (B04b, UX; applied together with B14 once `js/data.js` is free):**
- `rpg`: title back to "RPG"; description unchanged.
- `morumelons`: remove the "Client: Morumelons" tag; description "Landing page art for Ekky's own NFT character collection." It stays `original` and Legendary.
- `nft-3`, `nft-9`: descriptions name Morumelons ("A character from Morumelons, Ekky's NFT collection.").
- `pop-mie`: not a client piece. Its kaiju looks like Godzilla, so it becomes `kind: "fan"` with the "Fan art" tag; not reusable either way.
- `plug-hero`, `toybox`: confirmed `original` (no change).
- The copy (B14) uses "he", "Projects from $25", "Available evenings to night (GMT+7)" and "Works in Indonesian and English".

8. **Owner direction (2026-10-27, 08:16 UTC, typed in the Developer's session): "no need to curate the best artwork make sure all art work has its role".** UX decision:
   - **No fixed "best six".** The `featured` numbers are gone. The start-screen row and the desktop strip show **6 pieces picked at random on every visit** from every original piece (`featuredPick()` in `js/data.js`, at most 2 per category). Over a few visits a client sees the whole range, and no piece is ranked above another.
   - **Every piece has a role.** Each `PROJECTS` entry has a `roles` list (portfolio, card, featured, share, coloring, sticker, sprite, level, scene, avatar). Fan-art and client pieces keep only portfolio and card (hard rule, enforced in `js/data.js`). Each of the 29 originals has at least one creative role. The full table and the Developer's cut-out list are in `docs/roles.md`.
   - **Rarity is not a ranking.** The card frame (`rar`) is computed from how many creative roles a piece has.
   - The scorecard row "6 best pieces visible within 10 s" now reads "6 pieces visible within 10 s".

9. **Owner direction (2026-10-27, typed to the integrator): "dont make the animation too fast make it slow but make sense".** P1 ticket B39 (motion pass): taps about 250 ms, transitions 450 to 600 ms, reveals 0.8 to 1.2 s, ambient loops 6 to 12 s, calm easing, and every animation explains something. The UX lead accepts each motion only if a hiring client would understand why it moves.
10. **Owner direction (2026-10-27, typed to the integrator): "dont forget to add download button".** P1 ticket B40: a Download button next to every Share, a downloadable portfolio image in the lightbox, and "Install app".
11. **Owner answers (2026-10-27, typed to the integrator): "yes to all"**, to the integrator's five questions:

| Question | Owner decision |
|---|---|
| "Is Ekky the glasses guy on the little planet?" | **Yes.** `hero.png` (Little Planet) is Ekky's avatar: HUD avatar, map token, Level 1 "Who is Ekky?", desktop hero wave. The middle tab button and the favicon stay `face.png` (the blue-haired character the owner picked for them); `face.png` stays one of Ekky's characters and a sticker. Owner question 1 is closed. |
| "Should client pieces become reusable?" | **Yes.** `CONFIG.reuse.client = true`. Client pieces may be stickers, share art, downloads and featured; their "Client: X" tag stays visible wherever the full piece shows (lightbox, card), and stickers cut from them never include a brand logo. Fan art stays `false`, including Pop Mie (`kind: "fan"`, Godzilla-like kaiju). |
| "Should the site get a Bahasa Indonesia version?" | **Yes.** P1 ticket B41 (EN/ID switch). UX wrote the Indonesian copy (`COPY.id`) and Indonesian titles and descriptions for every piece. |
| "Is his time zone GMT+7 (WIB)?" | **Yes.** The facts read "evenings to night, WIB (GMT+7)". |
| "May visitors download his portfolio pieces?" | **Yes.** `FEATURES.artDownload = true`: a Download button in the lightbox, a smaller copy (at most 1600 px on the long side) with a subtle "ekkyarya.com" watermark, never on fan art (B40). |
12. **Owner contact details (2026-10-27, typed to the integrator):** "Ekky Arya (Character Illustrator)", official site https://ekkyarya.com/, Dribbble https://dribbble.com/shots/6634499-Flat-Guy-Illustration (a single shot, not the profile). Applied in `js/data.js`: `CONFIG.site` (share and download credits, base of share links, D10), `CONFIG.links.dribbble`, role line "Character Illustrator" / "Ilustrator Karakter" (`start.role`), "Character illustrator and graphic designer" where there is room. Email, WhatsApp, Instagram and Behance are empty strings: their buttons stay hidden, never linked to a placeholder. Until the email arrives, Hire Ekky uses `hireTarget()`: the Dribbble link, then the site.

## UX lead decisions (summary)

Judged from the point of view of the person deciding whether to hire Ekky: the art first, Hire Ekky one tap away, nothing in the way. Owner-decided items are recorded, not re-opened.

| Item | Decision |
|---|---|
| Budget | **Option A, full scope, about 34 h** (24.5 h + 0.5 h for the D3 alternative + 1 h for B38 + 1 h for B26 + 2 h for B39 + 3 h for B40 + 2 h for B41), on the owner's direction "do whatever you can at its finest, we will limit later". Nothing moves to round 2. B17 is built now with its contact buttons hidden until B15. |
| D0, D0b, D0c, D1, D2, D17 | Owner decided; recorded. D17 approved as scoped, with the `shareable()` guard. |
| "Mine" tab icon | A **simple frame line icon** (your gallery). The palette doodle stays with Art (D12), so each icon has one meaning. |
| D3 Skill Tree | **Director alternative:** removed; level 2 is "Color with Ekky" (pen-hand icon). |
| D4 lead six | Approved (already in `js/data.js`). |
| D5 rarity | **Audit proposal:** Legendary = the lead six + Little Planet + Morumelons, all `kind: "original"`. Cosmetic only. |
| D6 packs, D7 map | Approved: no packs; 5 levels (Who is Ekky?, Color with Ekky, Art Collection, Doodle to Done, Final Quest). |
| D8 first page | **Recommendation:** Road Trip if the line layer arrives before B09 starts, otherwise Giraffe Ride by threshold, swapped later. |
| D9, D10 | Approved (audit card layout; `from`, `challenge`, `card`, `color` + `f` + `s`; `seed` added in B22). |
| D11 start screen | **Mixed, see D11:** tagline, a random featured row of six (owner direction 8), three equal tiles (Color, Catch stars, Explore), "Just show me the art" link, Hire Ekky chip. |
| D12 icons | Approved; the NFT #3 helmet is the Star Catcher button (owner answer). |
| D13 floating stars | **Director alternative:** removed. |
| D14, D15, D16 | Approved as written. |
| Ownership | **Reuse config**, see below. |

## Ownership and the reuse config (UX decision, on the owner's direction)

The owner says every piece is Ekky's. What may be *reused* (as an icon, sticker, coloring page, Doodle Scene background or share-card art) is now one switchboard in `js/data.js`, so it can be limited later without touching code:

```js
CONFIG.reuse      = { original: true, client: true, fan: false };   // client: owner, "yes to all"
CONFIG.reuseBlock = [];   // slugs to keep out later, e.g. ["morumelons"]
```

- Every `PROJECTS` entry has `kind`: `"original"` (29 pieces), `"client"` (9: Indomaret, BCA Flazz, Ancol, MSI, Tea Break, Oasis, My Sports Club, Save Early Buy Future, Thinker & Doer) or `"fan"` (8: the 7 fan-art pieces, including D&D and Game Pattern, plus Pop Mie).
- `js/data.js` computes `p.slug` (file name) and `p.own = CONFIG.reuse[p.kind] && !CONFIG.reuseBlock.includes(p.slug)`, and defines `shareable(p) = p.own === true`. Code only ever calls `shareable()`.
- `client: true` since the owner's "yes to all" (answer 11). `fan` stays off: those characters belong to their owners.
- Every piece always stays visible in the portfolio, whatever the config says. Tags come from `p.label`.
- Today: 38 pieces are reusable; the 8 fan-art pieces are not. Each piece's roles are in `docs/roles.md`.

## Design principles: de-gamification, play your way

Every ticket below is checked against these five rules. They come from the owner's direction and outrank the brief wherever they clash.

1. **Intrinsic, not extrinsic.** The reward is the activity itself and the thing you made: your coloring, your best run, Ekky's art. Round 1 has no points-for-points, no badges and no progress bars to grind.
2. **Every path is optional, and none is "correct".** Color, Catch, Look and Hire are equal choices from the start screen, in any order. You can skip the game entirely: "Just show me the art" opens the classic portfolio in one tap, and nothing is lost.
3. **No forced order, no gates, no tutorials.** Map levels are never locked, and no "next level" pressure (no glow nagging you to the next node). Each hint shows once and is never blocking.
4. **No punishment.** No game-over screen, no lives lost and no "Ouch!". Mistakes are undone with one tap. A round of Star Catcher always lasts the full 30 seconds.
5. **You decide when you are done.** "Done" works at any time (even after 1 fill). Sharing is offered once, never pushed. Challenges are invitations, not scores to beat.

6. **Make it yours (owner direction: "users can creatively use this website").** The site is a toy box, not a checklist. Visitors get open-ended tools: color with any color, drop Ekky's own doodles as stickers anywhere, draw, and build their own scene. There is no right answer and no score for creativity. The only fixed rules are the asset rule (only Ekky's own art as stickers, pages and share art) and the credit line on every share.

Test for every ticket: *could a first-time visitor ignore this feature completely and still enjoy the site?* If not, the feature is too demanding for round 1.

## Code layout

Tickets are written against the split layout, now on `main` (T0 is merged): `index.html`, `css/site.css`, `css/game.css`, `js/data.js` (`CONFIG`, `PROJECTS` and the copy, all curated in UX-1), `js/site.js`, `js/game.js`, `scripts/build.mjs`. T1 builds `assets/ui/` on `dev/assets`. Proposed new modules: `js/color.js`, `js/share.js`, `js/links.js`, `assets/color/<page>/` and `scripts/make-page.mjs`.

## How to read this

- **Owner:** DEV = code. UX = content, copy and curation in `js/data.js` and `docs/`. DIRECTOR = balance numbers and playtests. OWNER = an answer or a file from Ekky, asked through the integrator.
- **Size:** S = up to 2 h, M = up to 4 h, L = more than 4 h. Hours are estimates.
- **Round:** 1 or later. **R1 must-have** has to pass before round 1 ends. **R1 stretch** goes in if time is left.
- **Phone** = iPhone 13 viewport (390 x 664 visible) in the capture script, plus one real phone for sharing. **Desktop** = 1440 x 900 Chrome.
- **Gate G2 applies to every ticket:** no console errors, phone captures of every touched screen, reduced motion respected, zero emoji, and no fan or client art in icons, stickers, coloring or share cards.

## Round 1 at a glance

The game is three simple things plus one button: **Color** (tap a shape to fill it), **Catch** (Star Catcher: move a finger, catch stars, dodge viruses, 30 seconds), **Look** (all of Ekky's art, free to view), and **Hire Ekky** everywhere.

| ID | Ticket | Owner | Size | Hours | Round |
|---|---|---|---|---|---|
| B01 | T0: split `index.html` | DEV | M | done | **Done** (merged into `main`) |
| B02 | T1: Ekky asset library, zero emoji | DEV | L | ongoing | **In progress** on `dev/assets` |
| B03 | Art metadata and the share guard | DEV | S | 1 | R1 must-have |
| B04 | Art content check (titles, labels, order) | UX | S | (UX) | R1 must-have |
| B05 | Make it simple: remove the meta-game | DEV | S | 2 | R1 must-have |
| B06 | Simple map (Skill Tree replaced by Color with Ekky) | DEV | S | 1 | R1 must-have |
| B07 | "Hire Ekky" in one tap from every screen | DEV | S | 2 | R1 must-have |
| B08 | Start screen and the random featured row | DEV | S | 1.5 | R1 must-have |
| B09 | First coloring page files | DEV | S | 2 | R1 must-have |
| B10 | Coloring screen (tap to fill) | DEV | M | 2.5 | R1 must-have |
| B11 | Share card and share service | DEV | M | 2.5 | R1 must-have |
| B12 | Coloring link and the arrival screen | DEV | S | 1.5 | R1 must-have |
| B13 | Star Catcher made simple and fair | DIRECTOR, DEV | S | 1 | R1 must-have |
| B14 | Round-1 copy | UX | S | (UX) | R1 must-have |
| B15 | Real contact details | OWNER, DEV | S | 0.5 | R1 must-have, **blocked on the owner** |
| B16 | Desktop lightbox and contrast | DEV | S | 1 | R1 must-have (audit #10, #12) |
| B17 | Final Quest quick sheet | DEV, UX | S | 1.5 | R1 must-have (audit #3) |
| B18 | Text sizes and tap targets | DEV | S | 2 | R1 must-have (audit #11) |
| B21 | Stickers and the Doodle Scene (creative mode) | DEV | M | 3 | R1 must-have (D17) |
| B38 | Feature switches (`FEATURES` config) | DEV | S | 1 | **R1 must-have, P1** (owner: "or make config for it") |
| B26 | Hiring facts and "Worked with" row | UX, DEV | S | 1 | **R1 must-have, P1** (owner answered, 2026-10-27) |
| B39 | Motion pass: slow, calm, meaningful | DEV | S | 2 | **R1 must-have, P1** (owner direction 9) |
| B40 | Download everywhere, and "Install app" | DEV | M | 3 | **R1 must-have, P1** (owner direction 10, answer 11) |
| B41 | English / Bahasa Indonesia switch | DEV (UX copy done) | S | 2 | **R1 must-have, P1** (owner answer 11) |
| B19 | Round-1 playtest and scorecard run | DIRECTOR | S | (DIRECTOR) | R1 must-have, last |
| | **DEV total, Option A** | | | **34** | |

**Budget.** 24.5 h is about 3 working days. The ask was about two (16 to 18 h).
- **Option A (UX lead's list in full, plus creative mode):** 24.5 h.
- **Option B (Director's recommendation, about 18 h):** move the desktop strip in B08 (0.5 h), the name field in B11 (0.5 h) and B18 (2 h) to the top of round 2. B08 still fixes the cut-off classic-site link, the worst tap-target problem. That gives about 21 h. To reach two days, also move B16 and B17 to the first days of round 2 (but B17 can't work before B15 anyway), which gives about 18.5 h. This keeps the whole loop (create, share, link, hire) inside two days.
- **UX decision: Option A, full scope (about 34 h, with B38, B26, B39, B40 and B41),** on the owner's direction "do whatever you can at its finest, we will limit later". Every ticket stays in round 1, plus the D3 alternative (+0.5 h). B17 is built now; its contact buttons stay hidden until B15 lands.

**Build order (approved):** B03 → B38 → B41 → B26 → B39 → B05 → B06 → B07 → B08 → B09 → B10 → B11 → B12 → B40 → B21 → B13 → B16 → B17 → B15 → B18. UX works B04 and B14 in parallel. B19 runs last.

---

## Decisions

Format for each: **Proposed (audit)** is what gets built if UX approves as written. **Director alternative** is there so UX can decide fast. Where the audit takes no position, the proposal comes from the brief or the owner.

### D0. Simple games: no meta-game in round 1 (owner direction)
- **Proposed:** remove coins, the coin counter, packs and pack opening, rarity drop rates, XP, player levels, the "Lv" badge and the floating coin stars. The Cards tab becomes **Art**: every piece is visible with its title, description and tag, tap to view, "Hire Ekky" in the viewer. Rarity frames stay purely cosmetic (no foil, no "Not in your deck"). No trophies (D2).
- **Why:** the owner asked for very simple games. A visitor who has to learn coins, packs and drop rates spends time on rules instead of on Ekky's art. It also takes away the brief's balance work (pricing, pity, completion cost), and the audit's "art never behind coins" holds by design.
- **Director note:** pack opening was the best moment in today's game (brief). If the round-1 playtest finds a dead moment, the simplest way to bring it back is one free pack after each finished coloring, still with no coins. That is a later ticket (B27), not round 1.

- **UX decision:** approved. Pack opening may come back only as B27, and only if the playtest shows a dead moment.
### D0c. De-gamification (Owner decided)
- **Decided:** apply the five principles above. Concretely, for round 1:
  - **no trophies at all**; the Trophies tab becomes **"Mine"** (your creations and your best Star Catcher run: things you made, not rewards), see D2;
  - **no lives** in Star Catcher, see D1;
  - **Done at any time** in coloring;
  - **no "next level" glow** on the map;
  - a "Just show me the art" path on the start screen.
- **Why:** points and badges pull attention away from the art and toward the meta-game. A hiring client and a casual visitor both came for Ekky's drawings, and free choice keeps them there longer than a checklist does.

- **UX decision:** owner decided; recorded.
### D17. Creative freedom (owner direction)
- **Decided by the owner, scope proposed by the Director:**
  - **Colors:** "Ekky's colors" stays the default row, plus an **"Any color"** swatch that opens the system color picker. The brief's "no free picker" rule is dropped: the result is the visitor's, not a copy of Ekky's.
  - **Stickers in round 1:** Ekky's own doodles (cat, palette, book, robot, cassette, microphone, planet, the Ekky face, the NFT astronaut and radio explorer, plus every T1 cut-out). Drag, pinch to scale and rotate, drag to the bin. Up to 12 per picture. Moved up from "later" into round 1 (B21).
  - **Blank page:** "Start from scratch" opens a plain paper background where the visitor only uses stickers and colors. This is a **Doodle Scene** made of Ekky's characters (B21).
  - **Later:** brush with pressure, and more pages (B29, B20).
- **Why:** creating something of your own is the strongest intrinsic reward (D0c) and the best share: every result is different, and every result is made of Ekky's art and carries his credit.
- **Guard:** stickers and backgrounds come only from `shareable()` art (B03). No photo upload and no free text on the picture in round 1, so nobody can publish other people's characters or words under Ekky's name.

- **UX decision:** approved as scoped. Stickers, scene backgrounds and the sticker tray come only from `shareable()` art. No photo upload and no free text on the picture in round 1.
### D0b. No login, nothing ever locked (Owner decided)
- **Decided:** no login in round 1 (project rule). Every visitor can use every feature from the first second: coloring, Star Catcher, all the art, sharing, Hire. Map levels are never locked. What you made (colorings, scenes, best score) lives in `localStorage` only.
- **Later:** if a login comes in a later round, it only syncs colorings and trophies between devices. It never gates a feature.

- **UX decision:** owner decided; recorded.
### D1. Lives in Star Catcher (Owner decided)
- **Decided: no lives.** A virus hit costs 2 points and a short shake, never the round. Every round lasts the full 30 s, and there is no game-over screen. The audit's hearts and the brief's cat are both dropped, so no lives icon is needed.

- **UX decision:** owner decided; recorded.
### D2. Trophies (Owner decided)
- **Decided: no trophies and no achievements**, in round 1 or later. No trophy toasts, badges or progress bars.
- The former Trophies tab becomes **"Mine"**: your colorings (re-open, re-share), your best Star Catcher run, the sound and vibration toggles, and a small "Reset" link. It shows things you made, never rewards.
- **Still for UX to decide:** the "Mine" tab icon. Director suggestion: the palette doodle. The audit's trophy cup is not needed.

- **UX decision:** the "Mine" tab uses a **simple frame line icon** from the inline-SVG set. The palette doodle stays with Art (D12), so no icon has two meanings.
### D3. Skill Tree level
- **Proposed (audit):** **keep it**, with the drawing **pen hand** from `hero.png` as its icon and no confetti over its text (audit #15, #16).
- **Director alternative:** **remove it** and put "Color with Ekky" in its slot. *Why:* "every skill maxed out" plus four MAX buttons tells a client nothing (brief), its categories are already filters in Art, and the owner asked for simple: one fewer screen that does nothing. The pen hand then means "draw", which fits coloring.

- **UX decision:** **Director alternative: remove Skill Tree.** A client learns nothing from maxed-out bars; a coloring page shows Ekky's line work directly. Level 2 becomes "Color with Ekky" with the pen-hand icon.
### D4. Which six pieces lead
- **Proposed (audit):** Coexistence, Hidden Monster, The Blue Bird, Broken-Down Bus, Monster Snack Bar, Monster World Doodles, in that order. This is already applied in UX-1 on `main`.
- **Director alternative:** Blue Bird, Coexistence, Hidden Monster, Old Bus, Floating Boy, Monster (brief). **Director agrees with the audit:** its reasons are hiring reasons.

- **UX decision:** approved; already applied.
- **UX decision, revised (owner direction 8):** no fixed lead six. The featured row is a fresh random pick of 6 originals on every visit (`featuredPick()`).
### D5. Rarity labels (cosmetic only after D0)
- **Proposed (audit):** Legendary = the lead six + Little Planet + Morumelons. Tea Break and My Sports Club are Common.
- **Director alternative:** leave Morumelons out (7 Legendaries), because it is client work and can never be on a share card. If share moment B (Legendary pull) comes back later, every Legendary must be shareable. With D0 in round 1, the difference is only a frame color.

- **UX decision:** **audit proposal:** Legendary = the lead six + Little Planet + Morumelons, all `kind: "original"` (owner direction: everything is Ekky's). Applied in `js/data.js`.
### D6. Pack price: 10 or 30
- **Proposed (owner direction, D0):** **no packs and no price in round 1.** The audit takes no position.
- **If packs come back (B27):** free packs earned by coloring, no coins. If coins ever return, 30, so that coins mean something (brief).

- **UX decision:** approved: no packs in round 1.
### D7. Map: 5 or 6 levels
- **Proposed (audit and plan):** **5 levels**: Who is Ekky?, Skill Tree (or Color with Ekky, if UX takes the D3 alternative), Art Collection, Doodle to Done, Final Quest. The vertical step tightens so all 5 fit on one screen.
- **Director alternative:** 6, adding Star Catcher as a node (brief). **Director withdraws it:** on the phone, the map area is about 536 px, and six 64 px nodes at a 105 px step need 589 px, while five need 484 px. Star Catcher gets one big button on the start screen and the map header instead.

- **UX decision:** approved: 5 levels, level 2 = Color with Ekky (D3).
### D8. First coloring page
- **Proposed (audit):** **Road Trip**, from Ekky's own line layer (thick outlines, big shapes). Then Little Planet, Plug Hero (once ownership is confirmed) and Giraffe Ride. The audit warns that tracing lines out of the colored JPGs gives muddy outlines.
- **Director alternative:** **Giraffe Ride** now, with lines extracted by a darkness threshold from his JPG (his real lines, nothing restyled). It is the one page that tests clean today. *Why:* without it, coloring, sharing and the coloring link all wait on owner question 6.
- **Recommended:** if Ekky's Road Trip layer arrives before B09 starts, use it. Otherwise ship Giraffe and swap when the layer comes. B09 is written to work either way.

- **UX decision:** **the recommendation:** Road Trip from a line layer if it arrives before B09 starts, otherwise Giraffe Ride by threshold. Ekky approves the extracted lines before launch (owner question 6).
### D9. Share card
- **Proposed (audit):** the "Gallery frame" layout for colorings. The top 220 px and bottom 300 px stay free. The credit line is **"Illustrated by Ekky Arya · ekkyarya.com"** on one line, at least 32 px, contrast at least 4.5:1. The share text always carries the link.
- **Director alternative:** credit and site on two lines (brief). Not worth a debate: take the audit's.

- **UX decision:** approved: the audit's layout and one-line credit.
### D10. Link format
- **Proposed (audit and plan names):** `?challenge=42&from=Rina` for Star Catcher, `?card=blue-bird&from=Rina` for a card. Coloring has no format in the audit (its caption reused `?card=`), so the proposal is `?color=road-trip&f=v1.…&from=Rina`, using the same `from`.
- **Director alternative:** `by` instead of `from`, and `star` instead of `challenge` (brief). Only the names differ. The one thing the Director needs is that challenge links later carry a `seed`, so both friends get the same stars (`?challenge=42&seed=k3f9a&from=Rina`).

- **UX decision:** approved: `from` (not `by`), `challenge`, `card`, and `?color=<slug>&f=v1.…&s=v1.…&from=…`. Add `seed` to challenge links in B22.
### D11. Start screen
- **Proposed (audit):** the tagline "Ekky Arya draws characters that make people smile.", the Featured row of six, and the buttons **Play / Hire Ekky / Color with Ekky**.
- **Director alternative, simpler and play-your-way:** four equal tiles, each with an Ekky icon and a two-word label: **Color**, **Catch stars**, **Explore**, **See the art**. Plus the "Hire Ekky" HUD chip, and "Just show me the art" (the classic site) as a full-width link. *Why:* "Play" doesn't say what you play. Under D0c, no choice is pushed as the main one, but every choice is one tap. **UX decides.** B08 builds whichever UX picks.

- **UX decision:** **mixed.** From top to bottom: the logo, the tagline "Ekky Arya draws characters that make people smile.", the **featured six** row (the art is the point, and the scorecard needs it within 10 s), then **three equal tiles: Color, Catch stars, Explore** (the map), then a full-width 44 px **"Just show me the art"** link to the classic site. The **Hire Ekky** chip sits in the HUD. "Play" is dropped (it doesn't say what you play), and "See the art" isn't needed: the featured row and the classic link already do that. B14 updates the copy.
### D12. Icon map
- **Proposed (audit section 3, which the Developer is already following in T1):** Level 1 / avatar: one Ekky face (owner question 1). Skill Tree: pen hand. Art Collection and the Art tab: palette. Doodle to Done: yellow ghost. Final Quest: monster head. Send: line "send" icon. Star Catcher button: astronaut helmet crop from NFT #3. Star Catcher items: star shape (+1), palette (+3), glowing star shape (+5), teal virus (hazard). General controls: one inline-SVG line set.
- **Settled by the owner's NFT answer:** the astronaut helmet crop is the Star Catcher button. The Director's star-shape alternative is withdrawn.
- **Not needed any more** (owner decisions D0, D1, D2): hearts, the trophy cup, the map pin, and the pack, Legendary Pull and Completionist icons.

- **UX decision:** approved, including the helmet crop. "Mine" uses a frame line icon (D2).
### D13. Floating stars on the menus
- **Proposed (audit):** keep them only on the map and start screen, at most 2 at a time, never over a sheet or the lightbox.
- **Director alternative:** **remove them** (brief). *Why:* with D0 there are no coins to catch, so a falling star you can tap but that does nothing is a broken promise. Keep only the twinkling sky. **Director recommends the alternative under D0.**

- **UX decision:** **Director alternative: remove them.** Only the twinkling sky stays.
### D14. Toasts, confetti, sound
- **Proposed (audit, the brief agrees):** toasts sit under the HUD, last 1.5 s, show one at a time and merge when several arrive. Confetti only on real wins (first coloring done, quest sent, new Star Catcher record). Sound is off by default on the web (on in the Android app), with a HUD sound toggle.

- **UX decision:** approved.
### D15. Final Quest
- **Proposed (audit):** a quick sheet in round 1: "Email Ekky", "WhatsApp Ekky" and "Copy email" first, then a 3-field form (name, project type, message) with no visitor-email field.
- **Director alternative:** none. Buttons whose contact detail is still a placeholder stay hidden until B15.

- **UX decision:** approved.
### D16. How coloring regions are made
- **Proposed (brief; the audit has no position):** regions are computed once by `scripts/make-page.mjs` (the pre-installed Playwright Chromium canvas, or Python) and committed. A fill is then an instant lookup, the same on every phone, which the `f=` link needs. No new npm package.

- **UX decision:** approved. No new npm package.
---

## Round 1 tickets

**Final round-1 list (UX lead, Option A, full scope):** B01 (done), B02 to B21, B26, B38, B39, B40 and B41. P1, in this order: B38, B41, B26, B39 (the motion pass runs alongside the others), then B40 as soon as share cards exist (B11). B15 waits on the owner's contacts and is the launch blocker; B17 is built now with its contact buttons hidden until then. B19 runs last.

### B01. T0: split `index.html` (done)
Owner DEV · Size M · **Done: merged into `main`** · From: plan T0
- **Acceptance:** met. The split keeps every screen unchanged, and `npm run build` copies `css/` and `js/` to `www/`.

### B02. T1: Ekky asset library and zero emoji (in progress)
Owner DEV (UX picks crops) · Size L · **In progress on `dev/assets`**, following audit section 3 · Depends: B01 · From: plan T1, brief #2, audit #5, #7, #16
- **Goal:** every emoji and generic glyph replaced per D12, with cut-out transparent PNGs in `assets/ui/`, one inline-SVG line-icon set, a star shape and a sparkle shape. **Every Ekky doodle cut-out doubles as a sticker** for B21 (D17). Re-crop `cat-social.png` and `cat-web.png`.
- **Note from this backlog:** with D0, D1 and D2, T1 can skip hearts, the trophy cup, the map pin, and the pack, coin, Legendary Pull and Completionist icons.
- **Acceptance:** the G2 emoji scan of `www/` returns 0. A UX contact sheet shows each icon readable at 32 px on `#2B1642` and on white. Nothing in `assets/ui/` is cut from fan or client art.
- **Avatar (owner answer 11, "yes to all"):** `hero.png`, the glasses guy on Little Planet, is Ekky: HUD avatar, map token, Level 1 and the desktop hero wave. `face.png` stays on the middle tab button and the favicon, and is a sticker.

### B03. Art metadata and the share guard
Owner DEV · Size S (1 h) · R1 must-have · Depends: B01 · From: brief #1, audit #6
- **Goal (UX decision: use the reuse config, no separate `fan` and `client` fields):** `js/data.js` already gives every entry `kind`, `desc`, `slug` and a computed `own`, and defines `shareable(p) = p.own === true` from `CONFIG.reuse` and `CONFIG.reuseBlock` (see "Ownership and the reuse config"). DEV only uses `shareable()`. Every icon, sticker, coloring page and share card must pass it. The grid, Art and the lightbox show `p.label` as a tag ("Fan art", "Client: X", "Client work", "Competition entry: Ancol").
- **Acceptance:** in the console, `PROJECTS.filter(shareable).map(p => p.slug)` contains none of `one-piece-fan-art`, `rocket-groot-fan-art`, `spider-verse-fan-art`, `adventure-time-fan-art`, `godzilla-kong-fan-art`, `game-pattern`, `dnd`, `indomaret`, `bca-flazz-card`, `pop-mie`, `ancol-logo`, `msi`, `tea-break-website`. Setting `CONFIG.reuseBlock = ["giraffe"]` removes Giraffe Ride from the coloring picker and sticker tray with no other change. On the phone, Game Pattern shows "Fan art" and Indomaret shows "Client: Indomaret".

### B04. Art content check
Owner UX · Size S · R1 must-have · Depends: B03 · From: audit #8, #9
- **Goal:** done with this approval: titles, descriptions and order (UX-1), `kind` for every piece and the reuse config (owner direction), the unconfirmed "Client work" tags removed, and Morumelons Legendary (D5).
- **Acceptance:** every piece shows a description in the lightbox and its tag; every piece has a `roles` list, and `docs/roles.md` matches it.

### B05. Make it simple: remove the meta-game
Owner DEV · Size S (2 h) · R1 must-have · Depends: B02 · From: owner direction (D0), brief #4 and its cut list, audit #15, #18 (bars only), #21
- **Goal:**
  - Hide or remove coins, the coin pill, packs, pack opening, XP, the level badge and the "Earn coins" buttons.
  - Cards becomes **Art**: all pieces, tap to view.
  - Remove all trophies and achievements and their toasts. The Trophies tab becomes "Mine" (D2).
  - Remove the map's "next level" glow and any "Next level" button pressure (D0c).
  - Remove the self-rated stat bars from "Who is Ekky?" (a short intro plus 3 own pieces until owner facts arrive).
  - Remove the floating stars (D13, approved) and apply D14.
  - "Reset progress" becomes a small link.
- **Acceptance (phone):**
  - No coin, price, XP or level appears on any screen.
  - Tapping Play shows no toast.
  - Every piece opens from Art with no cost.
  - No badge, trophy, toast for a reward or progress bar appears anywhere.
  - No screen, level or feature is ever locked or greyed out.
  - A first visit is silent until sound is turned on.
  - "Who is Ekky?" shows no percentages.
  - A new visitor reaches each feature (coloring, Star Catcher, all art, Hire) without unlocking anything.

### B06. Simple map
Owner DEV · Size S (0.5 h; 1 h with the D3 alternative) · R1 must-have · Depends: B05 · From: brief #15 (part), audit #2 (part), D3, D7
- **Goal:** 5 levels per D7, with the step tightened. Levels are never locked. Level 2 is "Color with Ekky" and opens coloring (D3, approved). One Star Catcher button sits in the map header.
- **Acceptance:** on the phone, all 5 nodes, including Final Quest, are visible without scrolling. Each node opens its content.

### B07. "Hire Ekky" in one tap from every screen
Owner DEV (UX copy) · Size S (2 h) · R1 must-have · Depends: B02 · From: brief #3, audit #2
- **Goal:**
  - A "Hire Ekky" chip in the HUD, top right. It shows on the start screen, the map, every level sheet, Art, the lightbox, the Star Catcher result, the coloring screen, the share preview and the arrival screen.
  - It is hidden only during the countdown and live play.
  - A tap opens the Final Quest sheet over the current screen, and closing returns to the same place.
  - Lightbox (both views): "Want art like this? Hire Ekky", which prefills "I saw <title>".
  - Desktop "Contact Me" becomes "Hire Ekky". A Hire button in the classic phone header.
  - Accessible name: "Hire Ekky, send a message".
- **Acceptance:** the capture script visits each listed screen, and from each one a single tap opens the sheet (desktop: the contact section). Closing returns to the same screen and scroll. Hire from the Monster Snack Bar lightbox prefills "I saw Monster Snack Bar".

### B08. Start screen and the random featured row
Owner DEV · Size S (1.5 h) · R1 must-have · Depends: B04, B07 · From: brief #11, audit #4, audit #11 (classic-site link)
- **Goal:** the start screen per D11 as approved, with the Featured row of six (each opens the lightbox). "Open the classic site" is 44 px tall and above the fold. Desktop: a strip of the six under the hero, above the fold. Every start-screen control is at least 44 x 44 px. **Revised (owner direction 8):** the row and the desktop strip use `featuredPick(6)`, a new random pick on every visit; they never show fan-art or client pieces.
- **Acceptance:** in a screenshot 2 s after load, the phone start screen shows at least 3 pieces, and a swipe reveals 6. The classic-site link is fully visible. The desktop at 1440 x 900 shows all 6.

### B09. First coloring page files
Owner DEV · Size S (2 h) · R1 must-have · Depends: B01, D8 · From: brief #5, audit #14
- **Goal:** `scripts/make-page.mjs <page>` writes three files to `assets/color/<page>/`:
  - `line.png`: Ekky's line layer, or the threshold lines (D8).
  - `regions.png`: one unique color per closed area; areas under 40 px merge into the line.
  - `page.json`: the region count, 12 "Ekky's colors" sampled from his original, and the original's path.
- **Acceptance:** running the script twice gives byte-identical files. A check script fills each region alone and finds 0 changed pixels outside it. `page.json` has at least 15 regions and 12 colors.

### B10. Coloring screen (tap to fill)
Owner DEV · Size M (2.5 h) · R1 must-have · Depends: B09, B02, B07 · From: brief #6 (cut to the simplest version), audit #14
- **Goal:** `js/color.js`.
  - Top bar: back, page name, the Hire chip, Done.
  - Below it: the drawing, then one row of 12 colors (the first is selected).
  - Tools: tap = fill, Undo, Peek (hold to see Ekky's colors).
  - Done works at any time, even after 1 fill (D0c). Every action autosaves.
  - The hint "Tap a shape to fill it" shows once.
  - Juice: a 160 ms bounce, a soft blip and a short haptic, none of it under reduced motion.
  - After Done: "Yours vs Ekky's" side by side, then the share preview.
  - Round 1 has no stickers, brush, eraser or zoom.
- **Acceptance (phone):**
  - One tap from the start screen opens the page in under 1 s.
  - 3 fills, then Done, reach the reveal in under 30 s (timed).
  - Undo reverts the last fill, and a reload restores the fills.
  - Every control is at least 44 x 44 px.
  - A first-time tester colors without any explanation (B19).

### B11. Share card and share service
Owner DEV (UX spec) · Size M (2.5 h) · R1 must-have · Depends: B10, B03 · From: brief #7, #8, the name part of #17, audit #13
- **Goal:** `js/share.js`.
  - Card: `renderCard('coloring', data)` draws the D9 Gallery frame at 1080 x 1920, with fonts loaded first. It **throws** for art that fails `shareable()`.
  - Name: an optional "Sign it" first name (letters, spaces and hyphens, 1 to 16 characters, drawn as text, remembered).
  - Phones: if `navigator.canShare({files})`, share the image, text and URL. Otherwise share the URL and download the image.
  - Desktop: download and copy the link, with the toast "Image saved, link copied".
  - The link base is `CONFIG.siteUrl` (owner question 4).
- **Acceptance:**
  - On iOS Safari and Android Chrome, Done to the system share sheet takes 3 taps or fewer, and the sheet holds the image and the link.
  - The PNG is 1080 x 1920, with the credit line readable above the bottom 300 px.
  - `renderCard('coloring', {art: 'indomaret'})` throws.
  - On desktop, the PNG downloads and the clipboard holds the link.

### B12. Coloring link and the arrival screen
Owner DEV · Size S (1.5 h) · R1 must-have · Depends: B10, B11 · From: brief #9 (coloring only), #10
- **Goal:** `js/links.js`.
  - Fills are encoded as `f=v1.` + base64url, 4 bits per region. The link format follows D10 as approved.
  - The arrival screen re-draws the friend's coloring: "Rina colored Ekky's Road Trip", with "Color your own", "Hire Ekky" and "Explore".
  - Then `history.replaceState` cleans the URL.
  - A bad value opens the normal start screen.
  - Any deep link opens game mode, on desktop too.
- **Acceptance:**
  - A coloring with 10 fills, opened in a fresh browser on another phone, looks identical, and it shows in under 2 s.
  - The address bar is clean afterwards.
  - A garbage `f` opens the start screen with no error.

### B13. Star Catcher made simple and fair
Owner DIRECTOR (numbers), DEV · Size S (1 h) · R1 must-have · Depends: B02 · From: brief #12 (numbers only), brief issue 11
- **Goal:** one rule on screen: "Catch the stars, dodge the viruses." 30 s, always the full 30 s (D1: no lives; a virus costs 2 points and a small shake). The numbers sit in one `BALANCE` object:
  - spawn interval 0.60 to 0.32 s;
  - fall speed 140 to 320 px/s (+0 to 50 random);
  - hazard share 12 to 25%;
  - catch box ±46 px for stars and ±30 px for hazards.

  The result screen shows "Time's up!" (never "Ouch!" or "Game over"), your score and your best, "Play again", "Something else" (back to the start) and the Hire chip. Round 1 has no combo, fever, seeds or coins.
- **Acceptance:** in 5 casual rounds on the phone by the Director, the scores average 25 to 40, and no round ends before 30 s. A first-time tester understands the game with no help (B19).

### B14. Round-1 copy
Owner UX · Size S · R1 must-have · Depends: none · From: audit section 4, brief sections 2 to 5
- **Goal:** every new string goes in the copy object in `js/data.js` (from UX-1), in English: the start buttons, the Hire chip, the coloring hint, the reveal, the share text, the arrival lines, the Star Catcher rule and result, the "Mine" tab, and the sticker and scene labels. UX adds this `COPY` object to `js/data.js`, built from `docs/copy.md` and updated for these decisions (D11 tiles, no trophies, no packs).
- **Acceptance:** every new on-screen string comes from the copy object, and UX signs off on the B19 captures.

### B15. Real contact details
Owner OWNER, then DEV · Size S (0.5 h) · R1 must-have, **blocked on the owner** · Depends: owner question 5 · From: audit #1
- **Partly answered (owner contact details 12):** `CONFIG.site` and `CONFIG.links.dribbble` are set. Every empty value in `CONFIG` hides its button (email, WhatsApp, Instagram, Behance); nothing links to a placeholder. Hire Ekky, the Final Quest sheet and the desktop contact use `hireTarget()` until the email exists, and the forms that build a `mailto:` are hidden while `CONFIG.email` is empty (show the Dribbble and site buttons instead). The build warns while any contact value is empty.
- **Acceptance:** no `example.com` or bare home-page link in `www/`, and each link opens the right profile. This is a launch blocker: the site does not go public without it.

### B16. Desktop lightbox and contrast
Owner DEV · Size S (1 h) · R1 must-have · Depends: B01 · From: audit #10, #12
- **Goal:** `dialog{margin:auto; max-height:92vh}`, with the art capped at 70vh `contain`. Coral buttons use dark ink. `--muted` becomes `#645F70`.
- **Acceptance:** the lightbox is centered, with the whole image visible, at 1440 x 900 and 1280 x 720. No text is below 4.5:1 (3:1 for large text).

### B17. Final Quest quick sheet
Owner DEV, UX · Size S (1.5 h) · R1 must-have · Depends: B07 (the buttons appear once B15 lands) · From: audit #3, D15
- **Acceptance:** on the phone, the one-tap actions show above the fold, and the form has no visitor-email field. Every button with a placeholder contact stays hidden.

### B18. Text sizes and tap targets
Owner DEV · Size S (2 h) · R1 must-have (Option A) · Depends: B02 · From: audit #11
- **Acceptance:** a script finds no visible text under 12 px and no control under 44 x 44 px on the phone.

### B21. Stickers and the Doodle Scene (creative mode)
Owner DEV · Size M (3 h) · R1 must-have · Depends: B10, B02, B03 · From: owner direction (D17), brief #6 (stickers), #10 (`s=`)
- **Cut-out list (UX):** `docs/roles.md` lists the cut-outs per piece, for every piece with the `sticker` role (24 pieces). Build the tray from `withRole("sticker")` and backdrops from `withRole("scene")`.
- **Goal:**
  - A sticker tray in the coloring screen with Ekky's own doodles (D17). Drag to place, pinch to scale and rotate, drag onto the bin to delete, up to 12.
  - The "Any color" swatch (system color picker).
  - "Start from scratch" on the Color screen opens a plain paper page for a Doodle Scene.
  - Stickers are encoded in the link (`s=v1.`, 5 bytes each) and drawn on the share card.
- **Acceptance (phone):**
  - From the start screen to a scene with 3 placed stickers takes under 20 s.
  - A scene with 4 stickers (one scaled, one rotated), shared and opened in a fresh browser, looks identical.
  - The tray contains no fan or client art (`shareable()` check).
  - Pinch works with two fingers, and every control is at least 44 x 44 px.

### B38. Feature switches (`FEATURES` config)
Owner DEV · Size S (1 h) · **R1 must-have, P1** · Depends: B03 · From: owner direction ("or make config for it")
- **Goal:** a `FEATURES` object in `js/data.js`, next to `CONFIG.reuse`, with one on/off switch per optional feature, so the owner can limit scope later without code changes:
  ```js
  const FEATURES = {
    gameMode: true, starCatcher: true, coloring: true, stickers: true, doodleScene: true, anyColor: true,
    shareCards: true, coloringLinks: true, challengeLinks: true, cardGift: true, recommend: true,
    myGallery: true, brush: true, holoCards: true, pwa: true, linkPreviews: true
  };
  ```
  Every optional feature checks its switch before it renders its button, tile, tab, route or service worker. A switch that is off hides the feature completely: no greyed-out button, no lock (owner: "nothing ever locked"). A feature not built yet keeps its switch, ready for its ticket. Not switchable: Hire Ekky, the art (portfolio and lightbox) and the contact details. With `gameMode: false` the site is the classic portfolio only. (Switch list from the Director, approved.)
- **Acceptance (phone and desktop):** with every switch on, nothing changes. Turning each switch off in turn removes that feature's entry points everywhere (start tiles, map, HUD, result screens; its deep links fall back to the start screen), leaves no empty gap or dead link, and gives 0 console errors. With all switches off, the classic portfolio, the lightbox and Hire Ekky still work.

### B26. Hiring facts and "Worked with" row (P1)
Owner UX (copy), DEV · Size S (1 h) · **R1 must-have, P1** · Depends: B14 · From: audit #17, #18, owner answers 2026-10-27
- **Goal:** the facts a client needs, shown on desktop About, the classic phone About, Level 1 "Who is Ekky?" and the Final Quest sheet:
  - "Illustrator from Indonesia. Works in Indonesian and English."
  - "Available evenings to night, Indonesia time (GMT+7)."
  - "Projects from $25." (Final Quest sheet and Contact, next to Hire Ekky.)
  - A text row, no logos: "Worked with Sequis, Intiland, Viar, pbTaxand, Honshu, Suapi and Bima."
  - These replace the self-rated stat bars on Level 1 (B05). Strings come from the `COPY` object (B14).
- **Acceptance:** at 1440 x 900 and on the phone, the four facts show in About, in Level 1 and (price and hours) in the Final Quest sheet. No client logo is used as an image. No stat percentages remain.

### B39. Motion pass: slow, calm, meaningful (P1)
Owner DEV · Size S (2 h) · **R1 must-have, P1** · Depends: B05 · From: owner direction 9 ("dont make the animation too fast make it slow but make sense")
- **Goal:** one set of motion tokens in `css/` and used everywhere: `--t-tap: 250ms`, `--t-move: 500ms` (450 to 600), `--t-reveal: 1000ms` (0.8 to 1.2 s), ambient loops 6 to 12 s; easing `cubic-bezier(.22,.61,.36,1)` (calm ease-out) for entering, `cubic-bezier(.4,0,.2,1)` for moving. No bounce overshoot over 4%, no flashing, nothing faster than 200 ms except the tap press itself.
- **Every motion has a reason**, and B39 lists them in `docs/motion.md` (one line each): what moves, how long, and what it tells the visitor (for example "the lightbox grows out of the tapped tile, so you know which piece opened"; "the reveal slides Ekky's colors over yours, so you can compare"). A motion with no reason is removed.
- `prefers-reduced-motion`: transitions become 150 ms fades, ambient loops stop.
- **Acceptance (UX lead, hiring-client view):** UX watches a phone and a desktop capture of every screen. Each motion is either named in `docs/motion.md` with a reason a client would understand, or it is gone. No ambient loop runs faster than 6 s. Star Catcher keeps its own game speed (B13), but its menus follow these tokens. Reduced motion leaves no movement except fades.

### B40. Download everywhere, and "Install app" (P1)
Owner DEV · Size M (3 h) · **R1 must-have, P1** · Depends: B11 (share card renderer), B38 · From: owner direction 10 ("dont forget to add download button"), owner answer 11
- **Goal:**
  - **A Download button next to every Share:** coloring, Doodle Scene, sticker scenes, Star Catcher result card and every share card. Line icon `i-download` (same set) plus the word "Download" (`dl.button`); never an icon alone.
  - It saves a PNG at story size (1080 x 1920), with a "Square" (1080 x 1080) choice if the renderer can lay it out cheaply. Every PNG carries the credit line ("Illustrated by Ekky Arya", or "Ilustrasi oleh Ekky Arya" in Indonesian) and `ekkyarya.com`.
  - File names name Ekky and the piece: `ekkyarya-coloring-<slug>.png`, `ekkyarya-scene-<date>.png`, `ekkyarya-stars-<score>.png`, `ekkyarya-<slug>.png`.
  - Download is also the fallback wherever the Web Share API is missing.
  - Only `shareable(p)` art may appear in a download, the same rule as share cards.
  - **Lightbox:** `FEATURES.artDownload` (owner: yes) shows a Download button on every piece except fan art. It saves a smaller copy, at most 1600 px on the long side, with a subtle "ekkyarya.com" mark in a corner (about 3% of the width, 60% opacity), and shows `lb.downloadNote` once. Client pieces keep their tag in the lightbox.
  - **Install app:** behind `FEATURES.pwa`, an "Install the app" button where the browser fires `beforeinstallprompt` (in "Mine" and the desktop footer), hidden otherwise. When the owner sends the Android build URL, an "Get the Android app" link next to it.
- **Acceptance (UX lead, hiring-client view):**
  - After Done in coloring, the Download button is on screen with no more than one tap (zero is better), on a 390 x 664 phone viewport, without scrolling.
  - Its label reads "Download" (or "Unduh") next to a download icon; a first-time tester names what it does before tapping (B19).
  - The saved PNG opens at 1080 x 1920 with the credit line readable, and the file name starts with `ekkyarya-`.
  - In the lightbox, Download shows on an original and on a client piece and never on a fan-art piece; the saved image is at most 1600 px with the mark; the "Client: X" tag stays visible.
  - With `FEATURES.artDownload = false`, the lightbox button is gone and nothing else changes.

### B41. English / Bahasa Indonesia switch (P1)
Owner DEV (copy by UX, done) · Size S (2 h) · **R1 must-have, P1** · Depends: B14 · From: owner answer 11
- **Goal:** every user-facing string comes from `t(key)`, piece titles and descriptions from `ptitle(p)` / `pdesc(p)`, tags from `plabel(p)` and category names from `catName(c)` (all in `js/data.js`). A small "EN / ID" switch sits in the HUD menu, in "Mine", and in the desktop header; `setLang()` remembers the choice, and the first visit follows the browser language. `<html lang>` follows. Share captions, the credit line on share images and downloads, and the arrival screens use the current language.
- **Acceptance:** with a browser in `id-ID`, a first visit shows Indonesian everywhere (start, map, levels, Art, lightbox, Hire, Star Catcher, share card); with `en-US`, English. Switching and reloading keeps the choice. No English string is left on an Indonesian screen except names (Star Catcher, Fan art, client names). No layout breaks with the longer Indonesian strings at 390 px.

### B19. Round-1 playtest and scorecard run
Owner DIRECTOR · Size S · R1 must-have, last · Depends: B03 to B18
- **Goal:** a timed first-60-seconds run from a fresh profile, share taps, deep-link time, Hire from each screen, any dead moment longer than 10 s, Star Catcher averages, a **"simple" test**: 3 first-time testers each start coloring and Star Catcher without any help, and a **"play your way" test**: each tester is asked to do only what they feel like. Note which paths they pick, whether any felt forced, and whether anyone hit a wall, a lock or a fail screen (target: none), and a **"make it yours" test**: each tester makes one coloring or scene. Count how many different-looking results come out, and how many testers wanted to share theirs.
- **Acceptance:** `docs/playtest-r1.md` gives pass or fail with numbers for each scorecard row and for the simple test. Each fail becomes a ticket.

---

## Later tickets

In priority order. Each acceptance test gets expanded when its ticket is pulled into a round. Every later ticket must also pass the D0 test: it adds no rule a first-time visitor has to learn before playing.

| ID | Ticket | Owner | Size | Depends | From | Goal and acceptance test |
|---|---|---|---|---|---|---|
| B20 | More coloring pages and a picker | DEV, OWNER | M | B09, owner question 6 | brief #23, audit #14 | Road Trip, Little Planet, Giraffe, Plug Hero (once own), then the audit's list. Test: each page passes B09's no-leak check and is approved by Ekky. |
| B22 | Star Catcher challenge link | DEV | M | B13, B11 | brief #12 (seed), #13 | Same seed for both friends. Test: the D10 challenge link shows "Rina scored 42. Can you beat it?", and the result reads "You N vs Rina 42". |
| B23 | Card gift share (own art only) | DEV | S | B11 | brief #18 (F) | Test: Share shows on own pieces only. The friend's link opens that piece. |
| B24 | "I recommend Ekky" sticker | DEV, UX | S | B11 | brief #19 | 4 preset reasons, no free text. Test: 2 taps to the preview, 1 to share. |
| B25 | Other deep links and the desktop phone frame | DEV | S | B12 | brief #9 (rest), brief issue 16 | Test: each sample link opens its screen in under 2 s. Desktop shows a centered 430 px frame. |
| B26 | (moved into round 1 as P1; see the B26 ticket above) | | | | | |
| B27 | Optional reward: one free pack per finished coloring (no coins) | DIRECTOR, DEV | S | B19 shows a dead moment | brief #14 (simplified), D0, D6 | Test: finishing a coloring offers one pack. Every card stays free to view. |
| B28 | "My gallery" share card (replaces the brief's Player Card) | DEV | M | B11 | brief #17, D0c | Shows the player's colorings next to Ekky's originals: what they made, with no stats or levels. Test: "Share my gallery" makes one card with up to 4 colorings and the credit line. |
| B29 | Coloring v2: reveal slider, zoom, eraser, brush with pressure | DEV | M | B10 | brief #6, #22 | Test: two-finger zoom works. A stylus changes the brush width. |
| B30 | Doodle to Done with a real process | UX, OWNER, DEV | S | owner question 10 | audit #24 | Test: the sketch and the final of the same piece show. |
| B31 | Reduced motion and juice pass | DEV | M | B10, B13 | brief #21, audit #15 (rest) | Test: reduced motion leaves no confetti or shake, and every flow works. |
| B32 | Labels and semantics | DEV | S | B02 | audit #19 | Test: a VoiceOver pass reads every control's name and state. |
| B33 | Classic phone hero and the game FAB | DEV | S | B07 | audit #22 | Test: the name and "Hire Ekky" show without scrolling, with no overlap. |
| B34 | Sharp logo, Type Is Art still, bigger NFT files | OWNER, DEV | S | owner question 11 | audit #20 | Test: the logo is sharp at 3x. The Type Is Art thumbnail shows lettering. |
| B35 | Link previews (Open Graph) | DEV | M | B12 | brief #26, audit #23 | Test: a pasted link shows its image and the credit. |
| B36 | Holo cards on tilt | DEV | M | B23 | brief #24 | Test: tilting moves the foil. Denying permission falls back to a shimmer. |
| B37 | PWA, offline, View Transitions | DEV | M | B20 | brief #25 | Test: installs from Chrome Android and opens offline. |

**Cut for good under D0** (the owner-decided items never come back; the rest only with the UX lead's approval): coins and coin sources, pack prices, drop rates and pity, XP and player levels, trophies and achievements (brief #16; owner decided), lives and game-over in Star Catcher (owner decided), any lock or unlock, the stat grid on the Player Card, the 4-tab "Color / Me" bar (brief #15, rest), the brief's combo and fever, and "in your deck" labels.

---

## Owner questions

Asked through the integrator. The safe default applies until an answer comes in.

| # | Question | Safe default | Blocks |
|---|---|---|---|
| 1 | Which avatar is really you? | **Answered ("yes to all"):** the glasses guy in `hero.png` is Ekky (HUD avatar, map token, Level 1, hero wave); `face.png` stays on the middle tab and the favicon. | closed |
| 2 | Which pieces are your own and which are client work? | **Answered (2026-10-27):** everything is Ekky's; Morumelons and the NFT pieces are his own project; Plug Hero and Toybox are self projects; Pop Mie was not a client (it becomes fan art, see B04b). **Still open:** which of Sequis, Intiland, Viar, pbTaxand, Honshu, Suapi and Bima goes with Character Crowd Banner, My Sports Club, Save Early Buy Future and Thinker & Doer; is the fire spirit in RPG Ekky's design; are Beansproud and Puff character names? | B04b |
| 3 | NFT #3 and #9: rights, and larger files | **Answered:** "yes to all Morumelon pieces"; both are Ekky's. **Still open:** files at 1000 px or more. Until then they show at 256 px (no upscaling on share cards). | B34 |
| 4 | What domain do share links use? | **Answered:** https://ekkyarya.com/ (`CONFIG.site`). | closed |
| 5 | Real email, WhatsApp, Instagram, Behance, and the Dribbble profile URL. | **Partly answered:** site and one Dribbble shot. Empty values stay hidden; Hire Ekky goes to Dribbble, then the site (`hireTarget()`). No public launch without an email. | B15, B17 |
| 6 | Can you send line layers (transparent PNG, 2000 px) for Road Trip, Little Planet, Giraffe and Plug Hero? Is it OK to extract your own lines from the JPG by darkness threshold? | Per D8 as UX approves: Road Trip from a layer if it arrives in time, otherwise Giraffe by threshold. | B09, B20 |
| 7 | Reply time, availability and a starting price. | **Answered:** "Evening to night, starting price $25." No reply time is promised. | B17, B26 |
| 8 | May we name your clients in a "Worked with" row? | **Answered:** Sequis, Intiland, Viar, pbTaxand, Honshu, Suapi, Bima. **Open:** may Indomaret, BCA, MSI, Tea Break and Fizzy Tube be named in that row too? Default: the row lists only the owner's seven; those names stay in the piece tags. | B26 |
| 9 | Location, time zone and languages. | **Answered:** Indonesian; works in Indonesian and English; WIB (GMT+7), confirmed ("yes to all"). | closed |
| 10 | Sketch files of one lead piece. | Text-only process steps. | B30 |
| 11 | An SVG logo, a Type Is Art still, and doodle cut-outs. | Today's files. Any crop that fails at 32 px becomes a simple palette shape. | B02, B34 |
| 12 | De-gamification: no trophies and no lives? | **Answered:** no trophies, no lives. | closed |
| 13 | Login and locked features? | **Answered:** nothing ever locked. Round 1 has no login. | closed |
| 14 | May visitors download your portfolio pieces? | **Answered ("yes to all"):** yes, a smaller watermarked copy, never fan art (B40). | closed |
| 15 | Should client pieces become reusable? | **Answered ("yes to all"):** yes, with their tags kept. | closed |
| 16 | The Android app URL, for the "Get the Android app" link. | Hidden until it exists. | B40 |

Integrator question: a QR code on share cards needs an encoder (a new package or about 300 lines of code). Default: no QR.

---

## Coverage: every source item and where it went

| Brief ticket | Backlog | | Audit fix | Backlog |
|---|---|---|---|---|
| 1 Art metadata | B03, B04 | | 1 Contacts | B15 |
| 2 No emoji | B02 | | 2 Hire paths | B07 |
| 3 Hire pill | B07 | | 3 Quick sheet | B17 |
| 4 Cut the clutter | B05 | | 4 Art within 10 s | B08 |
| 5 Page pipeline | B09 | | 5 Emoji | B02 |
| 6 Coloring screen | B10, B21 (R1), B29 | | 6 Fan and client tags | B03 |
| 7 Share renderer | B11 | | 7 One avatar | B02, owner question 1 |
| 8 Share service | B11 | | 8 Titles, descriptions | B04 (UX-1) |
| 9 Deep links | B12, B25 | | 9 Order, rarity | B04 (D4, D5) |
| 10 Link encoding | B12 | | 10 Contrast | B16 |
| 11 Start screen | B08 (D11) | | 11 Text size, targets | B18 |
| 12 Star Catcher | B13, B22 | | 12 Lightbox | B16 |
| 13 Challenge | B22 | | 13 Share card | B11 (D9) |
| 14 Economy | cut by D0; B27 optional | | 14 Line art | B09, B20 (D8) |
| 15 Map, tabs | B06 (D7); tabs cut by D0 | | 15 Motion | B05, B31 (D13, D14) |
| 16 Achievements | cut (owner decided, D2) | | 16 Icon crops | B02 (D12) |
| 17 Player Card, name | B11 (name), B28 | | 17 Hiring facts | B26 |
| 18 Legendary, gift share | B23 (gift); Legendary pull cut by D0 | | 18 Stat bars | B05, B26 |
| 19 Recommend | B24 | | 19 Semantics | B32 |
| 20 Card viewer | B04, B07, B23 | | 20 Logo, GIF, NFT | B34 |
| 21 Juice | B31 | | 21 Sound default | B05 (D14) |
| 22 Brush | B29 | | 22 Classic hero | B33 |
| 23 More pages | B20 | | 23 Link previews | B35 |
| 24 Holo | B36 | | 24 Process | B30 |
| 25 PWA | B37 | | | |
| 26 Link previews | B35 | | | |
