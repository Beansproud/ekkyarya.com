# Backlog: "Try Ekky", round 1

Author: Game Director. Status: gate G1. Merges `docs/game-brief.md` (26 tickets, "brief #n") and `docs/ux-audit.md` (24 fixes, "audit #n") into one prioritized list with no duplicates. It serves the goal, share loop, asset rule and scorecard in `docs/plan.md`.

Every ticket targets the split layout from `dev/split-and-assets`: `index.html` (markup), `css/site.css` (classic site), `css/game.css` (game), `js/data.js` (`CONFIG`, `PROJECTS`, category maps; content lives here), `js/site.js` (classic site), `js/game.js` (game), `scripts/build.mjs` (copies to `www/` for Capacitor), and `assets/ui/` (the Ekky asset library from T1). New modules proposed here: `js/color.js` (coloring), `js/share.js` (share cards and the share service), `js/links.js` (deep links), `assets/color/<page>/` (coloring page files), `scripts/make-page.mjs` (builds them).

## How to read this

- **Owner:** DEV = code. UX = content, copy and curation in `js/data.js` and in `docs/`. DIRECTOR = balance numbers and playtests. OWNER = an answer or a file from Ekky (asked through the integrator).
- **Size** (this scale replaces the one in the brief): S = up to 2 h, M = up to 4 h, L = more than 4 h. Each ticket also gives an hour estimate.
- **Round:** 1 or later. **R1 must-have** tickets have to pass before round 1 can end. **R1 stretch** tickets go in if time is left; otherwise they lead round 2.
- **Test devices:** "phone" = iPhone 13 viewport (390 x 664 visible, DPR 3) in the capture script, plus one real phone for share and haptics. "Desktop" = 1440 x 900 Chrome unless the test says otherwise.
- **Gate G2 applies to every ticket** and is not repeated below: no console errors, every touched game screen captured on the phone viewport, reduced motion respected, zero emoji, no fan or client art in icons, stickers, coloring or share cards.

## Round-1 budget

One developer, about two working days (16 to 18 focused hours). T0 is done, and T1 is already under way, so neither counts toward the budget.

| ID | Ticket | Owner | Size | Hours | Status |
|---|---|---|---|---|---|
| B01 | T0: split `index.html` into css/ and js/ | DEV | M | done | **In progress** (in review) |
| B02 | T1: Ekky asset library in `assets/ui/`, zero emoji | DEV | L | remaining | **In progress** |
| B03 | Art metadata and the share guard | DEV | S | 1 | R1 must-have |
| B04 | Art content: titles, descriptions, labels, order, rarity | UX | S | (UX) | R1 must-have |
| B05 | Calm the game: cut the clutter | DEV | S | 2 | R1 must-have |
| B06 | Map with 5 levels | DEV | S | 1.5 | R1 must-have |
| B07 | "Hire Ekky" in one tap from every screen | DEV | S | 2 | R1 must-have |
| B08 | Featured six on the start screen and the desktop hero | DEV | S | 1.5 | R1 must-have |
| B09 | Giraffe coloring page files | DEV | S | 2 | R1 must-have |
| B10 | Coloring screen (fill-only) | DEV | M | 3 | R1 must-have |
| B11 | Share card and share service | DEV | M | 2.5 | R1 must-have |
| B12 | Coloring link and the arrival screen | DEV | S | 1.5 | R1 must-have |
| B13 | Balance pass (Star Catcher, packs, XP) | DIRECTOR, DEV | S | 1 | R1 must-have |
| B14 | Round-1 copy | UX | S | (UX) | R1 must-have |
| B15 | Real contact details | OWNER, DEV | S | 0.5 | R1 must-have, **blocked on the owner** |
| B16 | Desktop lightbox and contrast fixes | DEV | S | 1 | R1 stretch |
| B17 | Round-1 playtest and scorecard run | DIRECTOR | S | (DIRECTOR) | R1 must-have, last |
| | **DEV total, must-have** | | | **18.5** | |

**Cut line if the developer falls behind** (in this order, each cut moves to round 2): the desktop strip in B08 (the phone row stays), Peek in B10, the "Sign it" name field in B11, then B16. Coloring, share, deep link and Hire never get cut: they are the loop.

**Build order:** B03 → B05 → B06 → B07 → B08 → B09 → B10 → B11 → B12 → B13 → B15 → B16. UX works B04 and B14 in parallel, starting right after B03 lands. B17 runs last.

---

## Decisions

Each one settles a conflict between the brief and the audit, or a gap between them. The integrator and the owner can overturn any of them. Until then, they are what the team builds.

### D1. Lives: hearts, not the cat
Lives use **simple hearts in Ekky's palette** (coral `#FF6B6B`, grey `#6B5A80` when lost), drawn as one SVG shape from T1.
*Why:* the brief put the cat on lives, on the +5 item and (as the Me tab) in navigation. That gives three meanings for one doodle, which the audit rightly flags as confusing. A heart is a general "life" shape, which plan rule 4 allows for gaps. The cat stays the +5 Star Catcher item and a sticker. Both are objects, not navigation.

### D2. Trophies tab: the trophy cup from "A Day in the Life"
The 4th tab is **Trophies**, with the **gold cup** cut from panel 4 of `day-in-life.jpg`. When the Player Card lands (round 2), it sits at the top of this tab, together with "My colorings" and the settings. The tab is not renamed "Me".
*Why:* the cup reads at 32 px (audit) and means "trophies" with no explanation. The cat medal is a cat first. "Me" with a cup would be a mismatch, and a Player Card is a summary of your trophies anyway.
**Rule behind D1 and D2: one navigation icon, one meaning.** Tabs, map levels and trophies each get a distinct asset. Star Catcher items and stickers may reuse doodles, because they are things, not places.

### D3. Skill Tree: removed
The Skill Tree level is cut. Its slot on the map becomes "Color with Ekky".
*Why:* the brief shows it tells a client nothing (four "MAX" buttons, self-rated skills), and confetti covers it. Its four categories already exist as filter chips in Cards. The audit only proposed a better icon for it (the pen hand), not a reason to keep it. The pen hand moves to level 2, where "draw" fits coloring.

### D4. The six pieces that lead: the audit's list, in its order
1 Coexistence, 2 Hidden Monster, 3 The Blue Bird, 4 Broken-Down Bus (`old-bus`), 5 Monster Snack Bar (`monster-crowd`), 6 Monster World Doodles (`doodles`).
*Why:* curation is UX's remit, and the audit's reasons are hiring reasons (story, mood, ensemble, character range, the doodle language behind the site's icons). The brief's picks Floating Boy and Monster in My Room become Epic and stay in the first row of Illustration. All six are own work.

### D5. Legendary set: the lead 6 plus Little Planet (7, all own work)
Legendary = the D4 six + **Little Planet** (the self-portrait and hero art). Hello 2022, Floating Boy and Monster become Epic. Former Legendaries that are client work, or of unconfirmed ownership, drop out: **Morumelons, Indomaret and Save Early, Buy Future become Epic, and Tea Break and My Sports Club become Common** (the audit: UI and photography, not illustration).
*Why:* a Legendary pull becomes a share card (round 2), and client art may never be on one. The audit wanted Morumelons Legendary, but it is client work, so it can't be shareable. The brief left out Doodles and Monster Crowd, but rarity should follow the curation. Share text: "1 of 7 legendaries".

### D6. Pack price: 30 coins, first pack free
The first pack is **free** and fixed (1 own Legendary, 1 Epic, 1 Rare). Every pack after that costs **30**.
*Why:* with the floating menu stars gone (D13), Star Catcher and coloring are the only coin sources. A casual round after the B13 retune scores 25 to 40, and a first coloring gives 15. So 30 coins means one more pack every 1 to 2 rounds. At 10, one round buys 3 packs and coins mean nothing (brief, issue 9). The free first pack makes up for the higher price in the first session. The art is never behind coins: all 46 pieces stay visible in Cards and the grid either way.

### D7. Map: 5 levels, not 6
Levels: 1 Who is Ekky?, 2 Color with Ekky, 3 Art Collection, 4 Doodle to Done, 5 Final Quest (boss). Star Catcher is **not** a node. It has one button in the map header and one "Earn coins" button next to the pack in Cards.
*Why:* the scorecard needs Final Quest reachable without a scroll. On the iPhone 13, the map area is about 536 px (664 minus the HUD and the tab bar). Six 64 px nodes at the brief's 105 px step need 589 px, which doesn't fit. Five need 484 px, which does. The brief's sixth node (Star Catcher) is a game, not a stop on the tour, and the header button keeps it one tap away. This also costs less: the Color level takes the Skill Tree slot.

### D8. First coloring page: Giraffe
Round 1 ships **Giraffe Ride** only, with its lines extracted by a darkness threshold from Ekky's own JPG. Road Trip, Little Planet and the others follow when Ekky sends line layers.
*Why:* the audit prefers Road Trip and asks for clean line layers, which is right in the long run. But no line layer exists yet, and Giraffe is the one page whose lines test as clean and closed today (brief). Threshold extraction keeps his real lines. It is not a filter that fakes his style. Plug Hero (audit "easy level") has to wait until its ownership is confirmed.

### D9. Share cards: two templates, the audit's safe zones, one credit line
- Templates: the audit's **"Gallery frame"** (coloring, Legendary pull, card gift) and **"Player card"** (Player Card, score, challenge). The "I recommend Ekky" sticker uses the Gallery frame with the sticker in place of the art. Round 1 builds only the Gallery frame, for colorings.
- Safe zones: **top 220 px, bottom 300 px** (the stricter of the brief's 260 and the audit's 300).
- Credit: "Illustrated by Ekky Arya" on one line, with the site label under it, at least 32 px, contrast at least 4.5:1, inside **y 1500 to 1620**. The brief's y 1590 to 1650 falls inside the 300 px bottom safe zone, so it moves up.
- The share text always carries the link, because text on the image is not clickable.

### D10. Link format: the brief's scheme
`?c=&f=&s=&by=` (coloring), `?card=&by=`, `?star=&seed=&by=`, `?rec=&by=`, `?by=`. The router also accepts the plan's `?challenge=` and `?from=` as aliases for `star` and `by`.
*Why:* one name parameter (`by`) for every link, and the seed is required for a fair challenge. The audit's coloring caption (`?card=blue-bird`) was a placeholder. B14 corrects it.

### D11. Start screen: "Color with Ekky" leads
Tagline (audit): "Ekky Arya draws characters that make people smile." Then the Featured row of the six. The primary button is **"Color with Ekky"** and the secondary is **"Play"** ("Continue" for returning players). The "Hire Ekky" chip sits top right. "Open the classic site" sits above the fold. The start-screen Star Catcher button is removed.
*Why:* the brief's 60-second plan needs coloring one tap away. The audit's separate "Hire Ekky" start button would make three equal buttons, and the HUD chip already gives Hire in one tap.

### D12. Icon map (final, overrides the plan's table where they differ)
| Where | Asset | Change from plan |
|---|---|---|
| Ekky avatar (Map tab center, HUD, map token, game FAB, Level 1, hero wave) | Glasses guy from `hero.png` (head crop), default until the owner answers (owner question 1) | Plan used `face.png` |
| Level 2 "Color with Ekky", "First Colors" | Pen hand from `hero.png` | New level; Hands piece fails at 32 px |
| Level 3 "Art Collection", Cards tab, "Art Lover" | Palette doodle (`icon-cards.png`) | Same as plan |
| Pack button, "Pack Opener" | Toybox box, cut out with an outline | Same; ownership in owner question 2 |
| Trophies tab | Trophy cup from `day-in-life.jpg` | D2 |
| Star Catcher button, "Arcade Star" | Simple 5-point star shape in `#FFE08A` | Plan used the NFT #3 astronaut; NFT rights unconfirmed (owner question 3) |
| Level 4 "Doodle to Done" | Yellow ghost from `doodles.jpg` | Audit crop |
| Level 5 "Final Quest", "Quest Complete" | Monster head from `monster.jpg` | Head only (audit) |
| Send, Hire chip | Line "send" icon | The paper plane crop fails (audit) |
| Lives | Hearts | D1 |
| Star Catcher items | +1 star shape, +3 palette, +5 cat, hazard teal virus | Audit crops |
| "World Explorer" | Red map pin from `hero.png` | Planet did not mean "map" |
| "Legendary Pull" | Glowing blue bird, cut out with glow | Same |
| "Completionist" | Mimic chest from `hidden-monster.jpg` | Same |
| Close, back, next, check, replay, share, scroll up, sound | One inline-SVG line-icon set | Same (plan rule 3) |

### D13. Floating menu stars: removed, not limited
The falling coin stars go from every menu. The twinkling background sky stays.
*Why:* the audit would keep two at a time on the map. But they are a hidden second coin game that catches taps meant for nodes and cards (brief), and D6 needs coins to come from playing and making.

### D14. Toasts, confetti and sound
Toasts slide in **under** the HUD, last 1.5 s, show one at a time and merge when several arrive (brief + audit). Confetti fires only on a Legendary pull, a sent Final Quest or a level up. Sound is **off by default on the web** (on in the Android app), with a sound toggle in the HUD (audit; the brief was silent on this).

### D15. Final Quest quick sheet: adopted, round 2
The audit's sheet (Email / WhatsApp / Copy email above a 3-field form) is the target. It waits for round 2 because its buttons need the real contact details (B15). In round 1, the Hire chip opens today's form.

### D16. Coloring regions are built ahead, not flood-filled on the phone
`regions.png` and `page.json` are made once by `scripts/make-page.mjs` and committed. That script may drive the pre-installed Playwright Chromium (canvas) or use Python. **No new npm package.**
*Why:* lookups are instant and deterministic, which the `f=` link encoding needs (brief).

---

## Round 1 tickets

### B01. T0: split `index.html` into css/ and js/ (in progress)
Owner DEV · Size M · Round 1 must-have · **In progress**: done on `dev/split-and-assets` (commit `676f86a`), awaiting the integrator · Depends: none · From: plan T0
- **Goal:** markup in `index.html`, styles in `css/site.css` and `css/game.css`, data in `js/data.js`, logic in `js/site.js` and `js/game.js`, with no visible change.
- **Acceptance:** desktop and phone baseline screenshots match before and after the split. No console errors. `npm run build` puts `css/` and `js/` in `www/`, and the Capacitor app starts.

### B02. T1: Ekky asset library and zero emoji (in progress)
Owner DEV (UX picks crops) · Size L · Round 1 must-have · **In progress** on `dev/split-and-assets` · Depends: B01 · From: plan T1, brief #2, audit #5, #7, #16
- **Goal:** every emoji and generic glyph is replaced per D12. That means cut-out transparent PNGs in `assets/ui/`, one inline-SVG line-icon set, a star shape, a 4-point sparkle shape and hearts. Re-crop `cat-social.png` (the mic handle is cut off) and `cat-web.png` (stray line). Star Catcher items are drawn on the canvas as images, not text. **Changes this backlog makes to T1:** D1 hearts, D2 trophy cup, the D12 star shape for Star Catcher (not the NFT astronaut), the D12 glasses-guy avatar as the default, and the pen hand for level 2.
- **Acceptance:** the G2 emoji scan of the built `www/` returns 0. A UX contact sheet shows every `assets/ui/` icon at 32 px on `#2B1642` and on white, and each one is recognizable. No file in `assets/ui/` is cut from a fan-art or client piece. One single avatar file is referenced for "Ekky".

### B03. Art metadata and the share guard
Owner DEV · Size S (1 h) · Round 1 must-have · Depends: B01 · From: brief #1, audit #6
- **Goal:** each `PROJECTS` entry in `js/data.js` gets `slug` (from the file name), `own` (true only for the brief's own list, minus the D12 and owner-question exceptions), `fan` (bool), `client` (name or null) and `desc`. Add `shareable(p) = p.own && !p.fan && !p.client`. Every icon, sticker, coloring page and share card must pass it. The grid, Cards and the lightbox show the tags "Fan art" (with the line "Fan art. Characters belong to their owners."), "Client: X" and "Competition entry".
- **Acceptance:** in the console, `PROJECTS.filter(shareable).map(p => p.slug)` contains none of `one-piece-fan-art`, `rocket-groot-fan-art`, `spider-verse-fan-art`, `adventure-time-fan-art`, `godzilla-kong-fan-art`, `game-pattern`, `dnd`, `indomaret`, `bca-flazz-card`, `pop-mie`, `ancol-logo`, `msi`, `tea-break-website`. On the phone, Game Pattern in Cards shows "Fan art", and Indomaret shows "Client: Indomaret".

### B04. Art content: titles, descriptions, labels, order, rarity
Owner UX · Size S · Round 1 must-have · Depends: B03 · From: audit #8, #9, brief #1 (rarity), brief issue 14
- **Goal:** apply the audit's section 2 titles, one-line descriptions, labels and per-category order in `js/data.js`. Write the missing lines (Road Trip, Tangled Hands, the fan pieces). Set `rar` per D5. Leave every "confirm" row as `own: false` until the owner answers.
- **Acceptance:** the first 6 tiles under "All" on the desktop grid and in Cards are the D4 six, in order. Cards shows exactly 7 Legendary cards, all `own: true`. Tea Break and My Sports Club are Common. Opening any piece in the lightbox shows a description.

### B05. Calm the game: cut the clutter
Owner DEV · Size S (2 h) · Round 1 must-have · Depends: B02 · From: brief #4, the brief's cut list, audit #15 (part), #18 (part), #21
- **Goal:** remove the floating coin stars from the menus (D13). Remove the "Press Start" and "Coin Keeper" achievements. Replace the self-rated stat bars in "Who is Ekky?" with a short intro and a strip of 3 own pieces. Remove the Star Catcher button from the start screen. Apply the D14 toast, confetti and sound rules. Shrink "Reset progress" to a small link at the bottom of the Trophies tab. With reduced motion on, hide the star hint and the Star Catcher flash and shake.
- **Acceptance (phone):** tapping Play shows no toast, and the coin counter and XP bar stay visible. For 30 s on the map and in Cards, nothing falls over the content. Opening any level sheet fires no confetti. A first visit plays no sound until the HUD sound toggle is tapped. "Who is Ekky?" shows no percentages. With reduced motion, no shake or flash in Star Catcher.

### B06. Map with 5 levels
Owner DEV · Size S (1.5 h) · Round 1 must-have · Depends: B05 (B10 for the level 2 target; stub it until then) · From: brief #15 (part), brief issues 5 and 8, audit #2 (part)
- **Goal:** `LEVELS` in `js/game.js` per D7, with the vertical step tightened so all five fit. Level 2 opens the coloring screen (Giraffe directly, since round 1 has one page). Keep one Star Catcher button in the map header. First open of a level gives 20 XP. Levels are never locked.
- **Acceptance:** on the phone, all 5 nodes, including Final Quest, are visible without scrolling. Each node opens its content. "Skill Tree" appears nowhere in the game.

### B07. "Hire Ekky" in one tap from every screen
Owner DEV (UX copy) · Size S (2 h) · Round 1 must-have · Depends: B02 · From: brief #3, audit #2
- **Goal:** a "Hire Ekky" chip in the HUD, top right next to the coins, on the start screen, the map, every level sheet, Cards, the lightbox, the pack result, the Star Catcher result, the coloring screen, the share preview and the deep-link arrival screens. It is hidden only during the 3-2-1 countdown and live Star Catcher play. A tap opens the Final Quest sheet over the current screen, and closing it returns to the same place. The lightbox gets "Want art like this? Hire Ekky" on both views, which prefills "I saw <title>". On desktop, "Contact Me" becomes "Hire Ekky". The classic phone header gets a Hire button. Accessible name: "Hire Ekky, send a message".
- **Acceptance:** the capture script visits each listed screen, and from each one a single tap opens the Final Quest sheet (desktop: the contact section). Closing it returns to the same screen at the same scroll position. Hire from the Monster Snack Bar lightbox prefills "I saw Monster Snack Bar".

### B08. Featured six on the start screen and the desktop hero
Owner DEV (picks from D4) · Size S (1.5 h) · Round 1 must-have · Depends: B04, B07 · From: brief #11, audit #4, audit #11 (the classic-site link only)
- **Goal:** the phone start screen follows D11, and each Featured piece opens the lightbox. "Open the classic site" is 44 px tall and above the fold. On desktop, a strip of the six sits directly under the hero, above the fold.
- **Acceptance:** in a screenshot 2 s after load, the desktop at 1440 x 900 shows all 6 pieces. The phone start screen shows at least 3 pieces, and a swipe reveals all 6. The classic-site link is fully visible. A fresh visitor can tap "Color with Ekky" without scrolling.

### B09. Giraffe coloring page files
Owner DEV · Size S (2 h) · Round 1 must-have · Depends: B01 · From: brief #5, audit #14 (Giraffe only, D8)
- **Goal:** `scripts/make-page.mjs giraffe` writes `assets/color/giraffe/line.png` (Ekky's lines on a transparent background, by darkness threshold), `regions.png` (each closed area in a unique color; areas under 40 px merge into the line) and `page.json` (region count, the 12 most common original colors as "Ekky's colors", region-to-original color, original path). Per D16, no new npm package.
- **Acceptance:** running the script twice gives byte-identical files. A check script fills each region alone and counts 0 changed pixels outside that region (no leak). `page.json` lists at least 15 regions and 12 palette colors.

### B10. Coloring screen (fill-only)
Owner DEV · Size M (3 h) · Round 1 must-have · Depends: B09, B02, B07 · From: brief #6 (round-1 cut), audit #14
- **Goal:** `js/color.js` and styles in `css/game.css`. Top bar: back, page name, the Hire chip, Done. The drawing fits the screen. Tools: Fill (default), Eraser, Undo (30 steps), Peek (hold to show Ekky's original). The palette has the 12 colors from `page.json`, with the first one selected. Done is enabled after 3 fills. Every action autosaves to `localStorage`. Juice per brief section 8, lines 1, 3, 4 and 5. Reduced motion: no bounce. Reveal: "Yours vs Ekky's" side by side, then the share preview (B11). First finish gives +50 XP and +15 coins.
- **Acceptance (phone):** one tap on "Color with Ekky" from the start screen opens the page in under 1 s. Three fills, then Done, reach the reveal in under 30 s (timed). Undo reverts the last fill. A reload restores the fills. Holding Peek shows the original. Every control is at least 44 x 44 px.

### B11. Share card and share service
Owner DEV (UX spec) · Size M (2.5 h) · Round 1 must-have · Depends: B10, B03 · From: brief #7, #8, the name part of #17, audit #13
- **Goal:** `js/share.js`. `renderCard(kind, data)` draws 1080 x 1920 on a canvas, with Fredoka and Poppins loaded first. Round 1 builds the D9 Gallery frame for colorings: "Colored by <name>", the coloring, a small inset of Ekky's version, the page name, and the D9 credit. It **throws** for any art where `shareable()` is false. An optional "Sign it" first-name field (letters, spaces and hyphens, 1 to 16 characters, drawn as text, never HTML, remembered). Share: if `navigator.canShare({files})`, share the image + text + url. Otherwise share the url and download the image. On desktop, download and copy the link, with the toast "Image saved, link copied". Text: "I colored Ekky Arya's Giraffe. Your turn: {link}". The link base comes from `CONFIG.siteUrl` (owner question 4). The first share gives +30 XP and +10 coins.
- **Acceptance:** on iOS Safari and Android Chrome, Done to the system share sheet takes 3 taps or fewer (Done, Share, then the app), and the sheet holds the image and text with the link. The saved PNG is 1080 x 1920, with "Illustrated by Ekky Arya" and the site label readable in y 1500 to 1620. `renderCard('coloring', {art: 'indomaret'})` throws, and no card shows. On desktop Chrome, the PNG downloads and the clipboard holds the link. A name like `<b>x` is rejected.

### B12. Coloring link and the arrival screen
Owner DEV · Size S (1.5 h) · Round 1 must-have · Depends: B10, B11 · From: brief #10, brief #9 (the coloring link only)
- **Goal:** `js/links.js`. Fills are encoded as `f=v1.` + base64url, one 4-bit palette index per region. On load, `?c=&f=&by=` opens an arrival screen with the coloring re-drawn from the link, "Rina colored Ekky's Giraffe", and the buttons "Color your own", "Hire Ekky" and "Explore". Then `history.replaceState` cleans the URL. A bad or unknown value opens the normal start screen with no error. Any deep link forces game mode, on desktop too (the centered phone frame comes in round 2).
- **Acceptance:** a coloring with 10 fills, shared from one phone and opened in a fresh browser profile on another, looks identical, and its content shows in under 2 s. After arrival, the address bar shows the clean URL. `?c=giraffe&f=garbage` opens the start screen with no console error. The same link on desktop opens game mode.

### B13. Balance pass (Star Catcher, packs, XP)
Owner DIRECTOR (numbers), DEV (applies) · Size S (1 h) · Round 1 must-have · Depends: B03, B04 · From: brief #12 (numbers only), brief #14 (packs), brief section 6
- **Goal:** one `BALANCE` object in `js/game.js` holds every number. Star Catcher: spawn interval 0.60 to 0.32 s, fall speed 140 to 320 px/s (+0 to 50 random), hazard share 12 to 25%, item mix star 72 / palette 20 / cat 8, catch box ±46 px for good items and ±30 px for hazards. The result screen shows "Play again" and the Hire chip, and "Ouch!" becomes "Time's up!" or "Out of hearts". XP per the brief's table. Packs per D6: drop rates Common 50 / Rare 30 / Epic 15 / Legendary 5, slot 3 is Rare or better. Seeds, combo and fever come in round 2 (B23).
- **Acceptance:** in 5 casual Director rounds on the phone, scores average 25 to 40, and at least 3 of 5 rounds last the full 30 s. In 10 fresh browser profiles, the first pack is free and holds 1 own Legendary every time. The second pack shows a price of 30.

### B14. Round-1 copy
Owner UX · Size S · Round 1 must-have · Depends: none (DEV reads it in B05 to B13) · From: audit section 4, brief sections 2 to 5
- **Goal:** a `COPY` object in `js/data.js` with every new user-facing string, in English: tagline, start buttons, Hire chip and lightbox button, coloring hint ("Tap a shape to fill it"), reveal, share text, "Sign it", arrival lines, toasts, the Star Catcher result lines. Fix the coloring caption to the D10 link format.
- **Acceptance:** every new string on screen comes from `COPY` (search the new code for literal UI strings). UX signs off on the B17 capture set. No emoji.

### B15. Real contact details
Owner OWNER, then DEV · Size S (0.5 h) · Round 1 must-have, **blocked on the owner** · Depends: owner question 5 · From: audit #1
- **Goal:** the real email, WhatsApp number and profiles in `CONFIG`. Until then (safe default), social icons whose URL is a bare home page are hidden, and the build logs a warning while `CONFIG.email` still contains `example.com`.
- **Acceptance:** the built site contains no `example.com` and no bare `instagram.com/`, `dribbble.com/` or `behance.net/` link. Each link opens the right profile. This is a launch blocker: the round can close without it, but the site can't go public.

### B16. Desktop lightbox and contrast fixes
Owner DEV · Size S (1 h) · R1 stretch · Depends: B01 · From: audit #10, #12
- **Goal:** `dialog{margin:auto; max-height:92vh}`, with the art capped at about 70vh with `object-fit:contain`. Coral buttons use dark ink `#2B1342`. `--muted` becomes `#645F70`.
- **Acceptance:** the lightbox is centered, with the whole image visible, at 1440 x 900 and 1280 x 720. A contrast script finds no text below 4.5:1 (3:1 for large text) on the start screen, map, Cards and the desktop sidebar.

### B17. Round-1 playtest and scorecard run
Owner DIRECTOR · Size S · Round 1 must-have, last · Depends: B03 to B15 · From: plan gates G3 and the scorecard
- **Goal:** play the round on the phone viewport and one real phone: a timed first-60-seconds run from a fresh profile, share taps, deep-link time, Hire from each screen, any dead moment longer than 10 s, Star Catcher averages.
- **Acceptance:** `docs/playtest-r1.md` lists pass or fail with the measured number for each scorecard row. Every fail becomes a ticket in this file.

---

## Later tickets (round 2 and after)

Listed in priority order. Size and owner are given; acceptance tests are short, and get expanded when a ticket is pulled into a round.

| ID | Ticket | Owner | Size | Depends | From | Goal and acceptance test |
|---|---|---|---|---|---|---|
| B18 | Final Quest quick sheet | DEV, UX | S | B15 | audit #3 | Email / WhatsApp / Copy email above a 3-field form with no visitor-email field (D15). Test: on the phone, 3 one-tap actions show above the fold. WhatsApp opens `wa.me`, and the button is hidden while the number is empty. |
| B19 | Stickers in coloring | DEV | M | B10 | brief #6, #10 (`s=`) | 8 own doodles: drag, pinch, rotate, bin, at most 6. Test: 2 stickers survive a share link exactly. |
| B20 | More coloring pages and a picker | DEV, OWNER | M | B09, owner question 6 | brief #23, audit #14 | Road Trip, Little Planet, Shark first, then the audit's list (Plug Hero only once own). Level 2 opens a picker with finished thumbnails. Test: each page passes the B09 no-leak check and is approved by Ekky. |
| B21 | Coloring v2: reveal slider, pinch-zoom | DEV | S | B10 | brief #6 | Test: "Yours vs Ekky's" slider drags. Two-finger pan and zoom work on the phone. |
| B22 | Share moments B and F: Legendary pull and card gift | DEV | S | B11 | brief #18 | "Show it off" under an own Legendary. `?card=` adds the card once. Test: no share button on a non-own card. |
| B23 | Star Catcher seed, fixed step, combo, fever | DEV, DIRECTOR | M | B13 | brief #12 | Test: two phones with the same seed log the same first 20 spawns. Combo ×2 shows after 8 catches. |
| B24 | Challenge mode and the Player card template | DEV | M | B23, B11 | brief #13 | Test: `?star=47&seed=k3f9a&by=Rina` shows the challenge, the result reads "You N vs Rina 47", and "Send it back" keeps the seed. |
| B25 | Economy rest: coin sources, pity, duplicates, "in your deck" labels | DEV, DIRECTOR | S | B13 | brief #14, brief issue 12 | Test: a duplicate shows "+5". A Legendary comes within 5 packs. The header reads "N of 46 in your deck · all art is free to view". |
| B26 | Achievements rework (14) | DEV | S | B02, B11 | brief #16 | Test: each achievement fires from its action. The Trophies tab shows "x of 14". |
| B27 | Tab bar: Map / Color / Cards / Trophies | DEV | S | B20 | brief #15 (rest), D2 | Test: 4 tabs with D12 icons. Each tab is one tap from any tab. |
| B28 | Player Card and name in Trophies | DEV | M | B24, B26 | brief #17 | Test: "Share my Player Card" makes card D with correct stats. |
| B29 | "I recommend Ekky" sticker | DEV, UX | S | B11 | brief #19 | 4 preset reasons, no free text. Test: 2 taps to the preview, 1 to share. The link shows Hire as the main button. |
| B30 | Other deep links and the desktop phone frame | DEV | S | B12 | brief #9 (rest), brief issue 16 | `card`, `rec`, `by`, the D10 aliases, and a centered 430 px frame on desktop. Test: each sample link shows its arrival screen in under 2 s. |
| B31 | Card viewer: "Color this" and Share | DEV | S | B20, B22 | brief #20 | Test: Giraffe shows "Color this". Indomaret shows no Share. |
| B32 | Hiring facts, "Worked with" row, client-work row | UX, OWNER | S | owner questions 7 to 9 | audit #17, #18, audit section 2 | Test: location, languages, availability, a price line and "Worked with" show on desktop About and in level 1. |
| B33 | Doodle to Done with a real process | UX, OWNER, DEV | S | owner question 10 | audit #24, brief level 5 | Test: swipeable steps show the sketch and the final of the same piece. The last card opens Final Quest. |
| B34 | Text sizes and tap targets | DEV | S | B02 | audit #11 | Test: a script finds no visible text under 12 px and no control under 44 x 44 on the phone. |
| B35 | Reduced motion and juice pass | DEV | M | B10, B23 | brief #21, audit #15 (rest) | Test: with reduced motion, no confetti, shake or flying coins, and every flow works. With it off, each brief juice line is visible. |
| B36 | Labels and semantics | DEV | S | B02 | audit #19 | Test: a VoiceOver pass reads every control's name and state. Sheets get focus on open. |
| B37 | Classic phone hero and FAB | DEV | S | B07 | audit #22 | Test: the classic phone view shows the name and "Hire Ekky" without scrolling, with no overlap. |
| B38 | Brush with pressure | DEV | M | B10 | brief #22 | Test: strokes stay under the lines. A stylus varies the width. |
| B39 | Sharp logo, Type Is Art still, bigger NFT files | OWNER, DEV | S | owner question 11 | audit #20 | Test: the logo is sharp at 3x. The Type Is Art thumbnail shows lettering. |
| B40 | Link previews (Open Graph) | DEV | M | B12 | brief #26, audit #23 | Test: pasting a coloring or card link into WhatsApp shows its image and "Illustrated by Ekky Arya". |
| B41 | Holo Legendaries on tilt | DEV | M | B22 | brief #24 | Test: tilt moves the foil. Denied permission falls back to the slow shimmer. |
| B42 | PWA, offline, View Transitions | DEV | M | B20 | brief #25 | Test: install from Chrome Android. In airplane mode, the game, cards and coloring still open. |

---

## Owner questions

Asked through the integrator. The team builds with the safe default until an answer comes in. Each default is reversible in one place.

| # | Question | Safe default until answered | Blocks |
|---|---|---|---|
| 1 | Which avatar is really you: the glasses guy in `hero.png` (Little Planet) or the blue-haired face in `face.png` (it looks like the Secret Android boy)? | The glasses guy (Little Planet is labeled as the self-portrait). `face.png` is used only as a character sticker. The avatar is one file in `assets/ui/`, so swapping it is one line. | B02 |
| 2 | Which pieces are your own work, and which are client work? Unclear today: Tea Break, Morumelons, Oasis (Fizzy Tube?), Web Illustration, My Sports Club, Save Early Buy Future, Plug Hero, Thinker & Doer, Type Is Art, Android, Kemerdekaan, RPG (is the fire spirit yours?), NFT #9, Toybox. Is Pop Mie a commission or a pitch? Are "Beansproud" and "Puff" character names? Is the D&D figure your own design? | All of these are `own: false`: in the portfolio and packs, but never on share cards, Legendaries, coloring pages or icons. `dnd` and `game-pattern` stay portfolio-only regardless (project rule). Toybox is the one exception: its box is used as the pack icon because its visible art is your doodles. It changes to a simple box shape if you say it is client work. | B03, B04, B20 |
| 3 | Do you own the rights to NFT #3 and #9? Can you send them at 1000 px or more? | `own: false`. The Star Catcher icon is the star shape, not the astronaut. | B02, B39 |
| 4 | What domain do share cards and links use: `ekkyarya.com`, or the GitHub Pages URL for now? | `CONFIG.siteUrl` stays empty, and links use the current page URL (GitHub Pages). The label printed on cards is that URL's host. In the Android app, links use `CONFIG.fallbackUrl` (the Pages URL). | B11, B12 |
| 5 | Real email, WhatsApp number, Instagram, Dribbble and Behance. | Placeholders stay. Bare home-page social links are hidden, the WhatsApp button is hidden, and the build warns. The site doesn't go public until this is answered. | B15, B18 |
| 6 | Can you export your line (ink) layers as transparent 2000 px PNGs: Road Trip, Little Planet, Shark, Giraffe, Plug Hero? Is it OK to extract your own lines from the JPG by darkness threshold, as done for Giraffe? | Giraffe ships with threshold-extracted lines (your own lines, nothing restyled). Other pages wait for layers. If you say no to extraction, coloring waits for your Giraffe layer. | B09, B20 |
| 7 | Reply time, availability ("booking from <month>"), and a starting price or "quote only". | No promised reply time. "Tell Ekky about your project" and "Ask for a quote". | B18, B32 |
| 8 | May we name your clients in a "Worked with" row? | No row. "Client: X" tags only use names already in today's titles (Indomaret, BCA, Pop Mie, Ancol, MSI, Tea Break, Morumelons). | B32 |
| 9 | Location, time zone and languages: is "Based in Indonesia (GMT+7), works in English and Indonesian" right? | Not shown until confirmed. | B32 |
| 10 | Sketch files of one lead piece, for the "Doodle to Done" process. | Text-only steps. | B33 |
| 11 | An SVG or 1000 px logo, a still frame for Type Is Art, and clean cut-outs of the doodles in `doodles.jpg` (pickle monster, yellow ghost, dog, cloud). | Today's logo stays. T1 crops only from existing files, and any crop that fails the 32 px check becomes a simple palette shape. Doodles are not hand-cut from the JPG for stickers. | B02, B19, B39 |

Integrator question (not the owner): a QR code on share cards would need a QR encoder (a new package or about 300 lines of code). Default: no QR. The link sits in the share text and is printed on the card.

---

## Coverage: every source item and where it went

| Brief ticket | Backlog | | Audit fix | Backlog |
|---|---|---|---|---|
| 1 Art metadata | B03, B04 | | 1 Contact placeholders | B15 |
| 2 No emoji | B02 | | 2 Hire paths | B07 |
| 3 Hire pill | B07 | | 3 Final Quest quick sheet | B18 (D15) |
| 4 Cut the clutter | B05 | | 4 Art within 10 s | B08 |
| 5 Page pipeline | B09 | | 5 Emoji | B02 |
| 6 Coloring screen | B10, B19, B21 | | 6 Fan and client labels | B03 |
| 7 Share renderer | B11 | | 7 One avatar | B02, owner question 1 |
| 8 Share service | B11 | | 8 Titles, descriptions | B04 |
| 9 Deep-link router | B12, B30 | | 9 Order and rarity | B04 (D4, D5) |
| 10 Link encoding | B12, B19 | | 10 Contrast | B16 |
| 11 Start screen | B08 (D11) | | 11 Text size, tap targets | B34 (classic-site link in B08) |
| 12 Star Catcher retune + seed | B13, B23 | | 12 Desktop lightbox | B16 |
| 13 Challenge mode | B24 | | 13 Share card | B11 (D9) |
| 14 Economy | B13, B25 (D6) | | 14 Line art | B09, B20 (D8) |
| 15 Map restructure | B06, B27 (D7) | | 15 Motion overload | B05, B35 (D13, D14) |
| 16 Achievements | B26 | | 16 Icon crops | B02 (D12) |
| 17 Player Card + name | B11 (name), B28 | | 17 Hiring facts | B32 |
| 18 Legendary + gift share | B22 | | 18 Stat bars | B05 (removed), B32 (facts) |
| 19 I recommend Ekky | B29 | | 19 Labels, semantics | B36 |
| 20 Card viewer | B04 (story), B07 (Hire), B31 | | 20 Logo, GIF still, NFT files | B39 |
| 21 Reduced motion + juice | B35 | | 21 Sound default | B05 (D14) |
| 22 Brush | B38 | | 22 Classic phone hero | B37 |
| 23 More pages | B20 | | 23 Link previews | B40 |
| 24 Holo cards | B41 | | 24 Real process example | B33 |
| 25 PWA | B42 | | | |
| 26 Link previews | B40 | | | |
