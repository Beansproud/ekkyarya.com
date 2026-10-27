# Backlog: "Try Ekky", round 1

**Status: proposed by Game Director, pending UX lead approval.** Decisions marked **Owner decided** are settled by the owner and are not up for approval.

Author: Game Director. Gate G1. This file merges `docs/game-brief.md` ("brief #n", 26 tickets) and `docs/ux-audit.md` ("audit #n", 24 fixes) into one prioritized list with no duplicates. It serves the goal, share loop, asset rule and scorecard in `docs/plan.md`. UX Portfolio is the team lead and gives final acceptance. Where the brief and the audit conflict, **the audit's choice comes first**, with the Director's alternative and its reason next to it (see Decisions).

## Owner direction (2026-10-27)

1. **"Make the games actually very simple."** Every game is understood in one look and played with one finger, with no rules to learn. Round 1 therefore drops the whole meta-game: coins, packs, rarity drops, XP, player levels, trophies and lives. See D0.
2. **"Use De-Gamification: flexibility to play your way."** See the principles below and D0c.
3. **No locked features.** Every visitor gets every feature, with no login, no coins and no unlocking. Round 1 is static and has no login at all (project rule). If a login ever comes, it only keeps your colorings across devices; it never unlocks anything. See D0b.
4. **Owner answer (2026-10-27): "no trophies, no lives, nothing ever locked."** This settles D0b, D0c, D1 and D2, and closes owner questions 12 and 13.
5. **Owner answer (2026-10-27): "Ekky has the rights to all NFT".** NFT #3 (Astronaut) and NFT #9 (Radio Explorer) are his own work, `own: true`. They can be icons, stickers and share-card art. This closes the rights half of owner question 3; larger files are still wanted.
6. **Owner answer (2026-10-27): "the glasses guy is Ekky."** The glasses guy from `hero.png` (Little Planet) is the one Ekky avatar everywhere. The blue-haired `face.png` is one of his characters (the Secret Android boy), not him. This closes owner question 1.
7. **Owner answer (2026-10-27): "everything is owned by Ekky."** Every piece whose ownership was unclear is his own work, `own: true`: Morumelons, Oasis, Web Illustration, My Sports Club, Save Early Buy Future, Plug Hero, Thinker & Doer, Type Is Art, Android, Kemerdekaan, RPG, Toybox, and the NFTs. They may be icons, stickers, coloring pages and share-card art.
   **The project's hard rule still holds and is not changed by this answer:** the fan-art pieces (`one-piece-fan-art`, `rocket-groot-fan-art`, `spider-verse-fan-art`, `adventure-time-fan-art`, `godzilla-kong-fan-art`, `game-pattern`, `dnd`) show characters owned by others, and the client pieces (`indomaret`, `bca-flazz-card`, `pop-mie`, `ancol-logo`, `msi`, `tea-break-website`) carry clients' brands. They stay portfolio-only. Only the integrator can change that rule (owner question 14).
8. **Owner direction (2026-10-27): "Don't limit yourself at the moment, do whatever you can, and we limit after."** The two-day cap is lifted. Every ticket in this file is round-1 scope, ranked P1 to P3. When the owner and the UX lead limit scope later, the cut line runs along that ranking: P3 goes first, then P2. The project's hard rules (static, no backend, no login, the asset rule, no emoji) still apply.
9. **Owner answer (2026-10-27): "He is Indonesian, speaks Bahasa and English."** The hiring facts show **"Based in Indonesia · Works in English and Bahasa Indonesia"** in desktop About, game level 1 ("Who is Ekky?") and the Final Quest sheet. The site's own text stays English (project rule).

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
- **Priority (owner direction 8):** every ticket is round-1 scope. **P1** = the loop (make, share, link, hire) plus the audit's must-fixes. **P2** = more ways to create and share. **P3** = polish and app features. Build in that order; scope gets limited later by cutting from the bottom.
- **Phone** = iPhone 13 viewport (390 x 664 visible) in the capture script, plus one real phone for sharing. **Desktop** = 1440 x 900 Chrome.
- **Gate G2 applies to every ticket:** no console errors, phone captures of every touched screen, reduced motion respected, zero emoji, and no fan or client art in icons, stickers, coloring or share cards.

## P1 at a glance

The game is three simple things plus one button: **Color** (tap a shape to fill it), **Catch** (Star Catcher: move a finger, catch stars, dodge viruses, 30 seconds), **Look** (all of Ekky's art, free to view), and **Hire Ekky** everywhere.

| ID | Ticket | Owner | Size | Hours | Priority |
|---|---|---|---|---|---|
| B01 | T0: split `index.html` | DEV | M | done | **Done** (merged into `main`) |
| B02 | T1: Ekky asset library, zero emoji | DEV | L | ongoing | **In progress** on `dev/assets` |
| B03 | Art metadata and the share guard | DEV | S | 1 | P1 |
| B04 | Art content check (titles, labels, order) | UX | S | (UX) | P1 |
| B05 | Make it simple: remove the meta-game | DEV | S | 2 | P1 |
| B06 | Simple map | DEV | S | 0.5 | P1 |
| B07 | "Hire Ekky" in one tap from every screen | DEV | S | 2 | P1 |
| B08 | Start screen and the featured six | DEV | S | 1.5 | P1 |
| B09 | First coloring page files | DEV | S | 2 | P1 |
| B10 | Coloring screen (tap to fill) | DEV | M | 2.5 | P1 |
| B11 | Share card and share service | DEV | M | 2.5 | P1 |
| B12 | Coloring link and the arrival screen | DEV | S | 1.5 | P1 |
| B13 | Star Catcher made simple and fair | DIRECTOR, DEV | S | 1 | P1 |
| B14 | Round-1 copy | UX | S | (UX) | P1 |
| B15 | Real contact details | OWNER, DEV | S | 0.5 | P1, blocked on the owner |
| B16 | Desktop lightbox and contrast | DEV | S | 1 | P1 |
| B17 | Final Quest quick sheet | DEV, UX | S | 1.5 | P1 |
| B18 | Text sizes and tap targets | DEV | S | 2 | P1 |
| B21 | Stickers and the Doodle Scene (creative mode) | DEV | M | 3 | P1 |
| B19 | Round-1 playtest and scorecard run | DIRECTOR | S | (DIRECTOR) | P1, last |
| | **DEV total, P1** | | | **24.5** | |

**Budget.** P1 is about 24.5 h of DEV work. P2 and P3 add about 25 h more, so the whole backlog is about 50 h (6 to 7 working days for one developer). There is no cap for now (owner direction 8). If a cut is needed later, the Director's suggested first cut is: all of P3, then B18, the desktop strip in B08 and the name field in B11.

**Build order:** P1 first: B03 → B05 → B06 → B07 → B08 → B09 → B10 → B11 → B12 → B21 → B13 → B16 → B17 → B15 → B18. Then P2 and P3 in table order. UX works B04, B14 and B26 in parallel. B19 runs after P1 and again at the end.

---

## Decisions

Format for each: **Proposed (audit)** is what gets built if UX approves as written. **Director alternative** is there so UX can decide fast. Where the audit takes no position, the proposal comes from the brief or the owner.

### D0. Simple games: no meta-game in round 1 (owner direction)
- **Proposed:** remove coins, the coin counter, packs and pack opening, rarity drop rates, XP, player levels, the "Lv" badge and the floating coin stars. The Cards tab becomes **Art**: every piece is visible with its title, description and tag, tap to view, "Hire Ekky" in the viewer. Rarity frames stay purely cosmetic (no foil, no "Not in your deck"). No trophies (D2).
- **Why:** the owner asked for very simple games. A visitor who has to learn coins, packs and drop rates spends time on rules instead of on Ekky's art. It also takes away the brief's balance work (pricing, pity, completion cost), and the audit's "art never behind coins" holds by design.
- **Director note:** pack opening was the best moment in today's game (brief). Its feel (tap, flip, reveal) can live on in the coloring reveal and the share-card slide-up, with no reward attached.

### D0c. De-gamification (Owner decided)
- **Decided:** apply the five principles above. Concretely, for round 1:
  - **no trophies at all**; the Trophies tab becomes **"Mine"** (your creations and your best Star Catcher run: things you made, not rewards), see D2;
  - **no lives** in Star Catcher, see D1;
  - **Done at any time** in coloring;
  - **no "next level" glow** on the map;
  - a "Just show me the art" path on the start screen.
- **Why:** points and badges pull attention away from the art and toward the meta-game. A hiring client and a casual visitor both came for Ekky's drawings, and free choice keeps them there longer than a checklist does.

### D17. Creative freedom (owner direction)
- **Decided by the owner, scope proposed by the Director:**
  - **Colors:** "Ekky's colors" stays the default row, plus an **"Any color"** swatch that opens the system color picker. The brief's "no free picker" rule is dropped: the result is the visitor's, not a copy of Ekky's.
  - **Stickers in round 1:** Ekky's own doodles (cat, palette, book, robot, cassette, microphone, planet, the glasses-guy Ekky head, the blue-haired boy from `face.png` (his character), the NFT astronaut and radio explorer, plus every T1 cut-out). Drag, pinch to scale and rotate, drag to the bin. Up to 12 per picture. Moved up from "later" into round 1 (B21).
  - **Blank page:** "Start from scratch" opens a plain paper background where the visitor only uses stickers and colors. This is a **Doodle Scene** made of Ekky's characters (B21).
  - **Also in scope (P2):** brush with pressure, and more pages (B29, B20).
- **Why:** creating something of your own is the strongest intrinsic reward (D0c) and the best share: every result is different, and every result is made of Ekky's art and carries his credit.
- **Guard:** stickers and backgrounds come only from `shareable()` art (B03). No photo upload and no free text on the picture in round 1, so nobody can publish other people's characters or words under Ekky's name.

### D0b. No login, nothing ever locked (Owner decided)
- **Decided:** no login in round 1 (project rule). Every visitor can use every feature from the first second: coloring, Star Catcher, all the art, sharing, Hire. Map levels are never locked. What you made (colorings, scenes, best score) lives in `localStorage` only.
- **Later:** if a login comes in a later round, it only syncs colorings and scenes between devices. It never gates a feature.

### D1. Lives in Star Catcher (Owner decided)
- **Decided: no lives.** A virus hit costs 2 points and a short shake, never the round. Every round lasts the full 30 s, and there is no game-over screen. The audit's hearts and the brief's cat are both dropped, so no lives icon is needed.

### D2. Trophies (Owner decided)
- **Decided: no trophies and no achievements**, in round 1 or later. No trophy toasts, badges or progress bars.
- The former Trophies tab becomes **"Mine"**: your colorings (re-open, re-share), your best Star Catcher run, the sound and vibration toggles, and a small "Reset" link. It shows things you made, never rewards.
- **Still for UX to decide:** the "Mine" tab icon. Director suggestion: the palette doodle. The audit's trophy cup is not needed.

### D3. Skill Tree level
- **Proposed (audit):** **keep it**, with the drawing **pen hand** from `hero.png` as its icon and no confetti over its text (audit #15, #16).
- **Director alternative:** **remove it** and put "Color with Ekky" in its slot. *Why:* "every skill maxed out" plus four MAX buttons tells a client nothing (brief), its categories are already filters in Art, and the owner asked for simple: one fewer screen that does nothing. The pen hand then means "draw", which fits coloring.

### D4. Which six pieces lead
- **Proposed (audit):** Coexistence, Hidden Monster, The Blue Bird, Broken-Down Bus, Monster Snack Bar, Monster World Doodles, in that order. This is already applied in UX-1 on `main`.
- **Director alternative:** Blue Bird, Coexistence, Hidden Monster, Old Bus, Floating Boy, Monster (brief). **Director agrees with the audit:** its reasons are hiring reasons.

### D5. Rarity labels (cosmetic only after D0)
- **Proposed (audit):** Legendary = the lead six + Little Planet + Morumelons. Tea Break and My Sports Club are Common.
- **Settled by the owner's ownership answer:** Morumelons is Ekky's own work, so all 8 Legendaries are shareable. The Director's alternative is withdrawn.

### D6. Pack price: 10 or 30
- **Proposed (owner direction, D0):** **no packs and no price in round 1.** The audit takes no position.
- **If packs come back (B27):** free packs earned by coloring, no coins. If coins ever return, 30, so that coins mean something (brief).

### D7. Map: 5 or 6 levels
- **Proposed (audit and plan):** **5 levels**: Who is Ekky?, Skill Tree (or Color with Ekky, if UX takes the D3 alternative), Art Collection, Doodle to Done, Final Quest. The vertical step tightens so all 5 fit on one screen.
- **Director alternative:** 6, adding Star Catcher as a node (brief). **Director withdraws it:** on the phone, the map area is about 536 px, and six 64 px nodes at a 105 px step need 589 px, while five need 484 px. Star Catcher gets one big button on the start screen and the map header instead.

### D8. First coloring page
- **Proposed (audit):** **Road Trip**, from Ekky's own line layer (thick outlines, big shapes). Then Little Planet, Plug Hero (his own, owner answer) and Giraffe Ride. The audit warns that tracing lines out of the colored JPGs gives muddy outlines.
- **Director alternative:** **Giraffe Ride** now, with lines extracted by a darkness threshold from his JPG (his real lines, nothing restyled). It is the one page that tests clean today. *Why:* without it, coloring, sharing and the coloring link all wait on owner question 6.
- **Recommended:** if Ekky's Road Trip layer arrives before B09 starts, use it. Otherwise ship Giraffe and swap when the layer comes. B09 is written to work either way.

### D9. Share card
- **Proposed (audit):** the "Gallery frame" layout for colorings. The top 220 px and bottom 300 px stay free. The credit line is **"Illustrated by Ekky Arya · ekkyarya.com"** on one line, at least 32 px, contrast at least 4.5:1. The share text always carries the link.
- **Director alternative:** credit and site on two lines (brief). Not worth a debate: take the audit's.

### D10. Link format
- **Proposed (audit and plan names):** `?challenge=42&from=Rina` for Star Catcher, `?card=blue-bird&from=Rina` for a card. Coloring has no format in the audit (its caption reused `?card=`), so the proposal is `?color=road-trip&f=v1.…&from=Rina`, using the same `from`.
- **Director alternative:** `by` instead of `from`, and `star` instead of `challenge` (brief). Only the names differ. The one thing the Director needs is that challenge links later carry a `seed`, so both friends get the same stars (`?challenge=42&seed=k3f9a&from=Rina`).

### D11. Start screen
- **Proposed (audit):** the tagline "Ekky Arya draws characters that make people smile.", the Featured row of six, and the buttons **Play / Hire Ekky / Color with Ekky**.
- **Director alternative, simpler and play-your-way:** four equal tiles, each with an Ekky icon and a two-word label: **Color**, **Catch stars**, **Explore**, **See the art**. Plus the "Hire Ekky" HUD chip, and "Just show me the art" (the classic site) as a full-width link. *Why:* "Play" doesn't say what you play. Under D0c, no choice is pushed as the main one, but every choice is one tap. **UX decides.** B08 builds whichever UX picks.

### D12. Icon map
- **Proposed (audit section 3, which the Developer is already following in T1):** Ekky avatar (Map tab center, HUD, map token, game FAB, Level 1, desktop hero wave): **the glasses guy's head from `hero.png`, owner decided.** Skill Tree: pen hand. Art Collection and the Art tab: palette. Doodle to Done: yellow ghost. Final Quest: monster head. Send: line "send" icon. Star Catcher button: astronaut helmet crop from NFT #3. Star Catcher items: star shape (+1), palette (+3), glowing star shape (+5), teal virus (hazard). General controls: one inline-SVG line set.
- **Settled by the owner's NFT answer:** the astronaut helmet crop is the Star Catcher button. The Director's star-shape alternative is withdrawn.
- **Not needed any more** (owner decisions D0, D1, D2): hearts, the trophy cup, the map pin, and the pack, Legendary Pull and Completionist icons.

### D13. Floating stars on the menus
- **Proposed (audit):** keep them only on the map and start screen, at most 2 at a time, never over a sheet or the lightbox.
- **Director alternative:** **remove them** (brief). *Why:* with D0 there are no coins to catch, so a falling star you can tap but that does nothing is a broken promise. Keep only the twinkling sky. **Director recommends the alternative under D0.**

### D14. Toasts, confetti, sound
- **Proposed (audit, the brief agrees):** toasts sit under the HUD, last 1.5 s, show one at a time and merge when several arrive. Confetti only on real wins (first coloring done, quest sent, new Star Catcher record). Sound is off by default on the web (on in the Android app), with a HUD sound toggle.

### D15. Final Quest
- **Proposed (audit):** a quick sheet in round 1: "Email Ekky", "WhatsApp Ekky" and "Copy email" first, then a 3-field form (name, project type, message) with no visitor-email field.
- **Director alternative:** none. Buttons whose contact detail is still a placeholder stay hidden until B15.

### D16. How coloring regions are made
- **Proposed (brief; the audit has no position):** regions are computed once by `scripts/make-page.mjs` (the pre-installed Playwright Chromium canvas, or Python) and committed. A fill is then an instant lookup, the same on every phone, which the `f=` link needs. No new npm package.

---

## Round 1 tickets

### B01. T0: split `index.html` (done)
Owner DEV · Size M · **Done: merged into `main`** · From: plan T0
- **Acceptance:** met. The split keeps every screen unchanged, and `npm run build` copies `css/` and `js/` to `www/`.

### B02. T1: Ekky asset library and zero emoji (in progress)
Owner DEV (UX picks crops) · Size L · **In progress on `dev/assets`**, following audit section 3 · Depends: B01 · From: plan T1, brief #2, audit #5, #7, #16
- **Goal:** every emoji and generic glyph replaced per D12, with cut-out transparent PNGs in `assets/ui/`, one inline-SVG line-icon set, a star shape and a sparkle shape. **Every Ekky doodle cut-out doubles as a sticker** for B21 (D17). Re-crop `cat-social.png` and `cat-web.png`.
- **Note from this backlog:** with D0, D1 and D2, T1 can skip hearts, the trophy cup, the map pin, and the pack, coin, Legendary Pull and Completionist icons.
- **Acceptance:** the G2 emoji scan of `www/` returns 0. A UX contact sheet shows each icon readable at 32 px on `#2B1642` and on white. Nothing in `assets/ui/` is cut from fan or client art. One single avatar file, the glasses guy's head crop from `hero.png`, is used everywhere "Ekky" appears. `face.png` is not used as Ekky anywhere (it may appear only as a character sticker).

### B03. Art metadata and the share guard
Owner DEV · Size S (1 h) · P1 · Depends: B01 · From: brief #1, audit #6
- **Goal:** check the UX-1 data on `main` for `slug`, `own`, `fan`, `client` and `desc` on every `PROJECTS` entry, and add any that are missing. Add `shareable(p) = p.own && !p.fan && !p.client`. Every icon, sticker, coloring page and share card must pass it. The grid, Art and the lightbox show the "Fan art", "Client: X" and "Competition entry" tags.
- **Acceptance:** in the console, `PROJECTS.filter(shareable).map(p => p.slug)` contains none of `one-piece-fan-art`, `rocket-groot-fan-art`, `spider-verse-fan-art`, `adventure-time-fan-art`, `godzilla-kong-fan-art`, `game-pattern`, `dnd`, `indomaret`, `bca-flazz-card`, `pop-mie`, `ancol-logo`, `msi`, `tea-break-website`. On the phone, Game Pattern shows "Fan art" and Indomaret shows "Client: Indomaret".

### B04. Art content check
Owner UX · Size S · P1 · Depends: B03 · From: audit #8, #9
- **Goal:** UX-1 already applied the titles, descriptions and order. Check them against B03's fields, fill any missing description, and set the cosmetic rarity per D5 as approved.
- **Acceptance:** the first 6 tiles under "All" are the D4 six. Every piece shows a description in the lightbox.

### B05. Make it simple: remove the meta-game
Owner DEV · Size S (2 h) · P1 · Depends: B02 · From: owner direction (D0), brief #4 and its cut list, audit #15, #18 (bars only), #21
- **Goal:**
  - Hide or remove coins, the coin pill, packs, pack opening, XP, the level badge and the "Earn coins" buttons.
  - Cards becomes **Art**: all pieces, tap to view.
  - Remove all trophies and achievements and their toasts. The Trophies tab becomes "Mine" (D2).
  - Remove the map's "next level" glow and any "Next level" button pressure (D0c).
  - Remove the self-rated stat bars from "Who is Ekky?" (a short intro plus 3 own pieces until owner facts arrive).
  - Apply D13 and D14 as approved.
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
Owner DEV · Size S (0.5 h; 1 h with the D3 alternative) · P1 · Depends: B05 · From: brief #15 (part), audit #2 (part), D3, D7
- **Goal:** 5 levels per D7, with the step tightened. Levels are never locked. With the D3 alternative, level 2 opens coloring. One Star Catcher button sits in the map header.
- **Acceptance:** on the phone, all 5 nodes, including Final Quest, are visible without scrolling. Each node opens its content.

### B07. "Hire Ekky" in one tap from every screen
Owner DEV (UX copy) · Size S (2 h) · P1 · Depends: B02 · From: brief #3, audit #2
- **Goal:**
  - A "Hire Ekky" chip in the HUD, top right. It shows on the start screen, the map, every level sheet, Art, the lightbox, the Star Catcher result, the coloring screen, the share preview and the arrival screen.
  - It is hidden only during the countdown and live play.
  - A tap opens the Final Quest sheet over the current screen, and closing returns to the same place.
  - Lightbox (both views): "Want art like this? Hire Ekky", which prefills "I saw <title>".
  - Desktop "Contact Me" becomes "Hire Ekky". A Hire button in the classic phone header.
  - Accessible name: "Hire Ekky, send a message".
- **Acceptance:** the capture script visits each listed screen, and from each one a single tap opens the sheet (desktop: the contact section). Closing returns to the same screen and scroll. Hire from the Monster Snack Bar lightbox prefills "I saw Monster Snack Bar".

### B08. Start screen and the featured six
Owner DEV · Size S (1.5 h) · P1 · Depends: B04, B07 · From: brief #11, audit #4, audit #11 (classic-site link)
- **Goal:** the start screen per D11 as approved, with the Featured row of six (each opens the lightbox). "Open the classic site" is 44 px tall and above the fold. Desktop: a strip of the six under the hero, above the fold .
- **Acceptance:** in a screenshot 2 s after load, the phone start screen shows at least 3 pieces, and a swipe reveals 6. The classic-site link is fully visible. The desktop at 1440 x 900 shows all 6.

### B09. First coloring page files
Owner DEV · Size S (2 h) · P1 · Depends: B01, D8 · From: brief #5, audit #14
- **Goal:** `scripts/make-page.mjs <page>` writes three files to `assets/color/<page>/`:
  - `line.png`: Ekky's line layer, or the threshold lines (D8).
  - `regions.png`: one unique color per closed area; areas under 40 px merge into the line.
  - `page.json`: the region count, 12 "Ekky's colors" sampled from his original, and the original's path.
- **Acceptance:** running the script twice gives byte-identical files. A check script fills each region alone and finds 0 changed pixels outside it. `page.json` has at least 15 regions and 12 colors.

### B10. Coloring screen (tap to fill)
Owner DEV · Size M (2.5 h) · P1 · Depends: B09, B02, B07 · From: brief #6 (cut to the simplest version), audit #14
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
Owner DEV (UX spec) · Size M (2.5 h) · P1 · Depends: B10, B03 · From: brief #7, #8, the name part of #17, audit #13
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
Owner DEV · Size S (1.5 h) · P1 · Depends: B10, B11 · From: brief #9 (coloring only), #10
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
Owner DIRECTOR (numbers), DEV · Size S (1 h) · P1 · Depends: B02 · From: brief #12 (numbers only), brief issue 11
- **Goal:** one rule on screen: "Catch the stars, dodge the viruses." 30 s, always the full 30 s (D1: no lives; a virus costs 2 points and a small shake). The numbers sit in one `BALANCE` object:
  - spawn interval 0.60 to 0.32 s;
  - fall speed 140 to 320 px/s (+0 to 50 random);
  - hazard share 12 to 25%;
  - catch box ±46 px for stars and ±30 px for hazards.

  The result screen shows "Time's up!" (never "Ouch!" or "Game over"), your score and your best, "Play again", "Something else" (back to the start) and the Hire chip. Round 1 has no combo, fever, seeds or coins.
- **Acceptance:** in 5 casual rounds on the phone by the Director, the scores average 25 to 40, and no round ends before 30 s. A first-time tester understands the game with no help (B19).

### B14. Round-1 copy
Owner UX · Size S · P1 · Depends: none · From: audit section 4, brief sections 2 to 5
- **Goal:** every new string goes in the copy object in `js/data.js` (from UX-1), in English: the start buttons, the Hire chip, the coloring hint, the reveal, the share text, the arrival lines, the Star Catcher rule and result, the "Mine" tab, and the sticker and scene labels.
- **Acceptance:** every new on-screen string comes from the copy object, and UX signs off on the B19 captures.

### B15. Real contact details
Owner OWNER, then DEV · Size S (0.5 h) · P1, **blocked on the owner** · Depends: owner question 5 · From: audit #1
- **Safe default:** social links that point to a bare home page are hidden, the WhatsApp button is hidden, and the build warns while `example.com` remains.
- **Acceptance:** no `example.com` or bare home-page link in `www/`, and each link opens the right profile. This is a launch blocker: the site does not go public without it.

### B16. Desktop lightbox and contrast
Owner DEV · Size S (1 h) · P1 · Depends: B01 · From: audit #10, #12
- **Goal:** `dialog{margin:auto; max-height:92vh}`, with the art capped at 70vh `contain`. Coral buttons use dark ink. `--muted` becomes `#645F70`.
- **Acceptance:** the lightbox is centered, with the whole image visible, at 1440 x 900 and 1280 x 720. No text is below 4.5:1 (3:1 for large text).

### B17. Final Quest quick sheet
Owner DEV, UX · Size S (1.5 h) · P1 · Depends: B07 (the buttons appear once B15 lands) · From: audit #3, D15
- **Acceptance:** on the phone, the one-tap actions show above the fold, and the form has no visitor-email field. Every button with a placeholder contact stays hidden.

### B18. Text sizes and tap targets
Owner DEV · Size S (2 h) · P1 · Depends: B02 · From: audit #11
- **Acceptance:** a script finds no visible text under 12 px and no control under 44 x 44 px on the phone.

### B21. Stickers and the Doodle Scene (creative mode)
Owner DEV · Size M (3 h) · P1 · Depends: B10, B02, B03 · From: owner direction (D17), brief #6 (stickers), #10 (`s=`)
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

### B19. Round-1 playtest and scorecard run
Owner DIRECTOR · Size S · P1, runs after P1 and again at the end · Depends: B03 to B18
- **Goal:** a timed first-60-seconds run from a fresh profile, share taps, deep-link time, Hire from each screen, any dead moment longer than 10 s, Star Catcher averages, a **"simple" test**: 3 first-time testers each start coloring and Star Catcher without any help, and a **"play your way" test**: each tester is asked to do only what they feel like. Note which paths they pick, whether any felt forced, and whether anyone hit a wall, a lock or a fail screen (target: none), and a **"make it yours" test**: each tester makes one coloring or scene. Count how many different-looking results come out, and how many testers wanted to share theirs.
- **Acceptance:** `docs/playtest-r1.md` gives pass or fail with numbers for each scorecard row and for the simple test. Each fail becomes a ticket.

---

## P2 and P3 tickets (round 1, owner direction 8)

In build order. Each acceptance test gets expanded when the developer picks the ticket up. Every ticket must also pass the D0 test: it adds no rule a first-time visitor has to learn before playing.

| ID | Pri | Ticket | Owner | Size | Depends | From | Goal and acceptance test |
|---|---|---|---|---|---|---|---|
| B20 | P2 | More coloring pages and a picker | DEV, OWNER | M | B09, owner question 6 | brief #23, audit #14 | Road Trip, Little Planet, Giraffe, Plug Hero, then the audit's list. Test: each page passes B09's no-leak check and is approved by Ekky. |
| B22 | P2 | Star Catcher challenge link | DEV | M | B13, B11 | brief #12 (seed), #13 | Same seed for both friends. Test: the D10 challenge link shows "Rina scored 42. Can you beat it?", and the result reads "You N vs Rina 42". |
| B23 | P2 | Card gift share (own art only) | DEV | S | B11 | brief #18 (F) | Test: Share shows on own pieces only. The friend's link opens that piece. |
| B24 | P2 | "I recommend Ekky" sticker | DEV, UX | S | B11 | brief #19 | 4 preset reasons, no free text. Test: 2 taps to the preview, 1 to share. |
| B25 | P2 | Other deep links and the desktop phone frame | DEV | S | B12 | brief #9 (rest), brief issue 16 | Test: each sample link opens its screen in under 2 s. Desktop shows a centered 430 px frame. |
| B26 | P2 | Hiring facts, "Worked with", client-work row | UX, OWNER | S | owner questions 7 and 8 (location and languages answered) | audit #17, #18, audit section 2 | Location and languages can ship now. Test: "Based in Indonesia · Works in English and Bahasa Indonesia" shows in desktop About, level 1 and Final Quest; the remaining facts follow when owner questions 7 and 8 are answered. |
| B28 | P2 | "My gallery" share card (replaces the brief's Player Card) | DEV | M | B11 | brief #17, D0c | Shows the player's colorings next to Ekky's originals: what they made, with no stats or levels. Test: "Share my gallery" makes one card with up to 4 colorings and the credit line. |
| B29 | P2 | Coloring v2: reveal slider, zoom, eraser, brush with pressure | DEV | M | B10 | brief #6, #22 | Test: two-finger zoom works. A stylus changes the brush width. |
| B30 | P2 | Doodle to Done with a real process | UX, OWNER, DEV | S | owner question 10 | audit #24 | Test: the sketch and the final of the same piece show. |
| B31 | P3 | Reduced motion and juice pass | DEV | M | B10, B13 | brief #21, audit #15 (rest) | Test: reduced motion leaves no confetti or shake, and every flow works. |
| B32 | P3 | Labels and semantics | DEV | S | B02 | audit #19 | Test: a VoiceOver pass reads every control's name and state. |
| B33 | P3 | Classic phone hero and the game FAB | DEV | S | B07 | audit #22 | Test: the name and "Hire Ekky" show without scrolling, with no overlap. |
| B34 | P3 | Sharp logo, Type Is Art still, bigger NFT files | OWNER, DEV | S | owner question 11 | audit #20 | Test: the logo is sharp at 3x. The Type Is Art thumbnail shows lettering. |
| B35 | P3 | Link previews (Open Graph) | DEV | M | B12 | brief #26, audit #23 | Test: a pasted link shows its image and the credit. |
| B36 | P3 | Holo cards on tilt | DEV | M | B23 | brief #24 | Test: tilting moves the foil. Denying permission falls back to a shimmer. |
| B37 | P3 | PWA, offline, View Transitions | DEV | M | B20 | brief #25 | Test: installs from Chrome Android and opens offline. |

**Cut for good under D0** (the owner-decided items never come back; the rest only with the UX lead's approval): coins and coin sources, pack prices, drop rates and pity, XP and player levels, trophies and achievements (brief #16; owner decided), lives and game-over in Star Catcher (owner decided), any lock or unlock, the stat grid on the Player Card, the 4-tab "Color / Me" bar (brief #15, rest), the brief's combo and fever, "in your deck" labels, and packs as a reward for coloring (former B27: a reward for making is the extrinsic loop D0c removes).

---

## Owner questions

Asked through the integrator. The safe default applies until an answer comes in.

| # | Question | Safe default | Blocks |
|---|---|---|---|
| 1 | Which avatar is really you? | **Answered:** the glasses guy in `hero.png`. | closed |
| 2 | Which pieces are your own? | **Answered:** everything is Ekky's own. All pieces outside the hard-rule list are `own: true`. **Still open (small):** are "Beansproud" and "Puff" character names (for the title)? Default: the audit's title "Viking vs Dragon Kid". | B03, B04 |
| 3 | NFT #3 and #9: rights, and larger files | **Rights answered:** Ekky has the rights to all NFTs, so both are `own: true`. **Still open:** can you send them at 1000 px or more? Until then they show at their current 256 px (no upscaling on share cards; the sticker crop uses the native size). | B02, B34 |
| 4 | What domain do share links use: `ekkyarya.com` or the GitHub Pages URL for now? | `CONFIG.siteUrl` stays empty, so links use the current page URL. In the Android app, links use the Pages URL. | B11, B12 |
| 5 | Real email, WhatsApp, Instagram, Dribbble and Behance. | Placeholders stay hidden (B15). No public launch until answered. | B15, B17 |
| 6 | Can you send line layers (transparent PNG, 2000 px) for Road Trip, Little Planet, Giraffe and Plug Hero? Is it OK to extract your own lines from the JPG by darkness threshold? | Per D8 as UX approves: Road Trip from a layer if it arrives in time, otherwise Giraffe by threshold. | B09, B20 |
| 7 | Reply time, availability and a starting price (or "quote only"). | No promised reply time; "Ask for a quote". | B17, B26 |
| 8 | May we name your clients in a "Worked with" row? | No row. The tags only use names already in today's titles. | B26 |
| 9 | Location and languages | **Answered:** Indonesian, works in English and Bahasa Indonesia. **Still open (small):** which city or time zone (Indonesia has three: WIB GMT+7, WITA GMT+8, WIT GMT+9)? Default: "Based in Indonesia" with no time zone. | B26 |
| 10 | Sketch files of one lead piece. | Text-only process steps. | B30 |
| 11 | An SVG logo, a Type Is Art still, and doodle cut-outs. | Today's files. Any crop that fails at 32 px becomes a simple palette shape. | B02, B34 |
| 12 | De-gamification: no trophies and no lives? | **Answered:** no trophies, no lives. | closed |
| 14 | For the integrator: the owner says everything is Ekky's own. Should the fan-art and client pieces stay portfolio-only (current hard rule), or does the owner want client pieces (not fan art) usable too? | Hard rule unchanged: fan-art and client pieces stay portfolio-only. Fan art can never change: it shows other owners' characters. | B03 |
| 13 | Login and locked features? | **Answered:** nothing ever locked. Round 1 has no login. | closed |

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
| 6 Coloring screen | B10, B21 (P1), B29 | | 6 Fan and client tags | B03 |
| 7 Share renderer | B11 | | 7 One avatar | B02 (owner: the glasses guy) |
| 8 Share service | B11 | | 8 Titles, descriptions | B04 (UX-1) |
| 9 Deep links | B12, B25 | | 9 Order, rarity | B04 (D4, D5) |
| 10 Link encoding | B12 | | 10 Contrast | B16 |
| 11 Start screen | B08 (D11) | | 11 Text size, targets | B18 |
| 12 Star Catcher | B13, B22 | | 12 Lightbox | B16 |
| 13 Challenge | B22 | | 13 Share card | B11 (D9) |
| 14 Economy | cut by D0 | | 14 Line art | B09, B20 (D8) |
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
