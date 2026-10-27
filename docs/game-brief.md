# Game brief: "Try Ekky", round 1

Author: Game Director. Status: draft for gate G1 (to merge with `docs/ux-audit.md` into `docs/backlog.md`).
Serves the goal in `docs/plan.md`: every visitor leaves with something worth sharing, every share says "Illustrated by Ekky Arya" and links back, and every screen leads to "Hire Ekky".

Evidence used: the phone and desktop baseline screenshots, the game code in `index.html` (LEVELS, ACH, RARITY, roll(), openPack(), startArcade()), a played Star Catcher round on an iPhone 13 viewport (random play: 31 points, died after about 19 s), a 400-run simulation of the current Star Catcher rules, and a line-art test on Ekky's images (scripts in the director scratchpad).

---

## 1. Verdict on today's game

**In one line:** the game looks great and feels polished, but there is nothing to make and nothing to share, and hiring Ekky is buried. It is a nice tour, not a loop.

### What works (keep)
| Thing | Why it works |
|---|---|
| The art itself, the planet hero, the purple night sky | Instantly reads as "Ekky". Strong brand. |
| Tab bar with Ekky's face in the middle | Personal, clear, thumb friendly. |
| Bottom sheets with swipe-to-close | Native feel. |
| Pack opening: tap box, flip three cards, confetti on legendary | The best moment in the game today. Keep the feel. |
| Synthesized sounds and vibration, with toggles | Cheap, light, good. |
| Star Catcher feel: particles, screen shake, countdown, floating "+3" | Good juice. The tuning is the problem, not the feel. |
| All 46 artworks are visible in the collection without owning them | Matches "art never locked behind coins". Keep. |

### What is dull or confusing (fix)
1. **No create, no share.** The core of the plan (Create → Share → Friend opens) does not exist. Nothing a visitor can take away.
2. **Hire Ekky is buried.** Final Quest is the 5th node at the bottom of a 1,300 px map, below the fold. The only other path is Trophies → Settings → "Final quest". Zero hire buttons on the start screen, cards, pack or arcade result.
3. **Emoji everywhere**, against the asset rule: the game-mode button, PLAY screen, every level icon, the pack and arcade buttons, Star Catcher items and lives, achievement icons. Some meanings are wrong: a lab flask for "Doodle to Done", a crown for the contact form, a joker card for the collection.
4. **Free achievement at second 1.** "Press Start" pops the moment you tap PLAY and covers the XP bar and the coin counter (see `phone-02-map.png`). Free trophies make trophies worthless.
5. **Skill Tree is filler.** "Every skill is maxed out" plus four "MAX" buttons tells a client nothing, and the confetti covers the text (`phone-04-level-skills.png`).
6. **"Who is Ekky?" uses self-rated stats** (Creativity 96, Playfulness 99). That reads as bragging and shows no work.
7. **"Doodle to Done" is passive.** A checklist that ticks itself.
8. **"Art Collection" is a level that is not a level.** It just jumps to the Cards tab.
9. **The coin economy means nothing.** There are two coin taps (emoji stars floating over the menus, and Star Catcher). A pack costs 10. One random-play Star Catcher round gave 31 coins, enough for 3 packs.
10. **Floating stars on the menus** are a hidden second mini-game. They drift over level nodes and cards and catch taps meant for them.
11. **Star Catcher is harsh and dead-ends.** Hazards rise to 33% of spawns and fall at up to 430 px/s. In simulation, players died before time ran out in more than 90% of runs (average round about 19 s of 30). The result screen says "Ouch!" and offers only "Play again" and "Back to the map": no share, no challenge, no hire.
12. **"0 of 46 cards collected" while all 46 are on screen.** Players can't tell what collecting adds.
13. **The card viewer is a dead end.** Image and title only: no story, no "Color this", no share, no hire.
14. **Client pieces are Legendary** (Indomaret, Tea Break website, and probably Save Early Buy Future and Morumelons). A legendary pull will become a share card, and client art may never appear in share cards.
15. **Hidden fan art.** `game-pattern.jpg` shows Mario, Sonic, Pac-Man, Bulbasaur and other game characters. `dnd.jpg` has a figure that looks like Kratos. Treat both like the fan-art pieces: portfolio only.
16. **Desktop gets no game** unless `?game` is in the URL, so a shared link opened on a laptop would land on the classic site and lose the context.

### Cut
- The Skill Tree level. Its four categories already exist as filter chips in Cards.
- The floating coin stars on the menus. Keep the twinkling background sky.
- The achievements "Press Start" and "Coin Keeper".
- The self-rated stat bars in "Who is Ekky?".
- The Star Catcher buttons on the start screen, the map header and Cards. Replace them with one map node plus "Earn coins" next to the pack button.
- "Reset progress" as a full row in the main panel. Move it to a small link at the bottom of the Me tab.

---

## 2. Core loop

```
PLAY ──► CREATE ──► SHARE ──► FRIEND OPENS ──► RECOMMEND / HIRE
 map,      color a     one tap,   lands on the exact     "I recommend Ekky"
 cards,    drawing,    image +    coloring, card or      sticker, or the
 Star      earn a      link, no   challenge in < 2 s,    Final Quest form
 Catcher   Player Card login      then plays too
   ▲                                     │
   └────────── new player ◄──────────────┘
```

Rewards feed the loop, not the other way round: making and sharing earn coins and XP, coins buy packs, packs give Legendary pulls, and a Legendary pull is another share moment. **The art is never behind coins.**

### First 60 seconds for a new visitor on a phone
| Time | What the visitor sees and does |
|---|---|
| 0 s | Start screen: logo, the planet hero (gentle float), the line "Try Ekky: color his drawings, collect his art, hire him". Under the hero, a horizontal strip of **Ekky's 6 best own pieces** scrolls slowly (Blue Bird, Coexistence, Hidden Monster, Old Bus, Floating Boy, Monster). Top right: a **"Hire Ekky"** pill. Big primary button: **"Color with Ekky"**. Secondary: "Explore Ekky's world". Small link: "Classic site". |
| ~3 s | Taps "Color with Ekky". The coloring screen opens **directly** on the Giraffe page, with no picker. A one-line hint pulses: "Tap a shape to fill it". The first color in Ekky's palette is already selected. |
| 5–35 s | Taps shapes. Each fill pops with a soft "blip", a 6 ms haptic and a short scale bounce. After 3 fills the "Done" button lights up. A "Peek" button (hold) shows Ekky's original colors. A sticker tray offers his doodles (cat, palette, planet, robot…). |
| ~35 s | Taps **Done** (tap 1). Reveal: "Yours vs Ekky's", a split slider you can drag. +50 XP, +15 coins, achievement "First Colors". |
| ~40 s | The share card preview slides up, already rendered (1080x1920). Optional field "Sign it: first name" (remembered). Taps **Share** (tap 2). The phone's share sheet opens with the image and link (tap 3 picks the app). |
| ~50 s | Back in the game, a bottom sheet: "Your free art pack is waiting" (the pack button glows) and "Like his style? Hire Ekky". Both are one tap away. |
| 60 s | The visitor has made something, shared it with credit and a link, seen the original art, and has a free pack and a hire button in view. |

Returning visitor: the start screen shows "Continue" (goes to the map) plus the same buttons.

---

## 3. "Color with Ekky"

### How it plays
- **Screen layout (phone, portrait):** top bar: back (line icon), page name, "Hire Ekky" pill, **Done** (check icon). Middle: the drawing, as large as possible, with pinch-zoom and two-finger pan. Bottom: the tool row, then the palette row.
- **Tools (round 1):**
  | Tool | Behaviour |
  |---|---|
  | Fill (default) | Tap a shape: it fills with the current color. Tapping the same shape with the same color again does nothing. |
  | Brush (should-have) | 3 sizes, uses `PointerEvent.pressure` when > 0 (Apple Pencil, S Pen), drawn under the line layer so the lines stay crisp. |
  | Stickers | A tray of Ekky's own doodles. Drag to place, pinch to scale and rotate, drag onto the bin to delete. At most 6 per page. |
  | Eraser | In fill mode, tapping a shape clears it. In brush mode, it erases strokes. |
  | Undo | Line icon. 30 steps. Long-press does nothing (no redo in round 1). |
  | Peek | Hold to show Ekky's original colors at 100%; release to return. Teaches the eye and shows his art. |
- **Palette:** 12 swatches. Default "Ekky's colors" = colors sampled at build time from his original version of **this** page (so the Giraffe palette really is his giraffe ochre, spot brown and grass green). A second tab "All colors" holds the site palette: `#FFB400` yellow, `#FF6B6B` coral, `#7ED9B0` mint, `#B8D5FF` sky, `#9C91BD` lavender, `#2FC6D8` pool blue (Floating Boy), `#D4C36C` sand, `#B98A37` giraffe spot, `#77B593` grass, `#64AAD8` shark blue, `#8B4737` bus brown, `#FFF3DC` skin cream, plus white. No free color picker in round 1: his palette keeps every result looking like his work.
- **Done:** enabled after 3 fills or 1 sticker. It saves locally (the last 6 colorings in `localStorage` as fill data, not images) and goes to the reveal.
- **Auto-save:** every action. Leaving and coming back restores the page.
- **Reduced motion:** no bounce on fill and no animated reveal; the slider starts at 50%.

### Tech approach (so it stays fast and linkable)
- A build-time script (Node or Python, no new npm runtime package) makes, for each page:
  1. `line.png`: his outline layer, transparent background.
  2. `regions.png`: each closed shape painted in a unique RGB color (connected areas of non-line pixels; areas under 40 px merge into the line).
  3. `page.json`: region count, the palette sampled from his original per region (most common original color), and the original image path.
- At run time a fill is a lookup (region id → color) redrawn on a canvas. No flood fill on the phone, so it is instant and deterministic. Fills become a short array, which is what makes the coloring **encodable in a link** (section 5).
- Line test on the current JPGs: a simple darkness threshold gives clean, closed lines for **Giraffe**. Shark is good except the water splash. Little Planet, Road Trip and Plug Hero come out broken (their outlines are colored, not dark). Those need Ekky's own ink layer (see Open questions).

### Coloring pages for round 1 (own work only)
| Page | Source | Difficulty | Why it is a good page | Status |
|---|---|---|---|---|
| **Giraffe** | `assets/work/giraffe.jpg` | Easy (~25 shapes) | Big, clear shapes, one cute character, white background, happy subject. Lines extract cleanly today. | **Ready. Default first page.** |
| **Shark** | `assets/work/shark.jpg` | Easy–medium | Funny story (fishing, shark eats the catch), bold shapes, white background. | Needs the water splash lines closed (cleanup or ink layer). |
| **Little Planet** | `assets/work/little-planet.jpg` | Medium | It is Ekky himself, the site's hero. Coloring "the artist" is the most personal page there is. | Needs Ekky's ink layer. |
| Road Trip | `assets/work/road-trip.jpg` | Medium | Friends, a car, a cat: fun to color, social theme fits sharing. | Needs ink layer. Round 1 if supplied. |
| Monster | `assets/work/monster.jpg` | Hard | His boss monster (also the Final Quest icon). A "hard mode" page for fans. | Later (many small shapes). |

Avoid as pages: all fan art, all client work, `game-pattern.jpg` (third-party characters), `dnd.jpg` (a Kratos-like figure), `doodles.jpg` (too dense, and better as a sticker source), `nft-3.jpg` (256 px, too small), and painterly pieces with soft shading (Blue Bird, Coexistence, Floating Boy): they are better as showcase art than as line pages.

### Stickers (own doodles only)
- **Round 1, available now:** the doodles already cut out from the hero drawing: cat (`icon-trophies.png`), palette (`icon-cards.png`), book, robot, cassette, microphone, planet (`assets/cat-*.png`), and Ekky's face (`face.png`). That makes 8 stickers.
- **Later:** characters cut from `doodles.jpg` (pickle monster, yellow ghost, orange dog, cloud) once Ekky supplies them as PNGs. The developer must not cut them by hand from the JPG.

### From coloring to share card
Done → reveal "Yours vs Ekky's" → share card preview → Share. The card layout is in section 4, moment A.

---

## 4. Share moments

Shared rules for every share card:
- Size 1080x1920 PNG, rendered on a canvas in the browser. Fonts: the site's Fredoka (headings) and Poppins (body), loaded before render.
- **Safe zone:** nothing important in the top 220 px or the bottom 260 px (story apps put their UI there). The credit line sits at y ≈ 1590–1650.
- **Credit line on every card, always:** "Illustrated by Ekky Arya", then on the next line the short link text "ekkyarya.com" (the real link is in the share text).
- Background: Ekky's night sky, `#2B1342` → `#120A1F` gradient with sparse white dots (no emoji, no star glyphs: simple circles).
- Only art with `own: true` (see section 6) may appear on a share card. The renderer must refuse any other art.
- The share text always holds the link, because some apps drop the text when a file is attached; the link is also printed on the image.
- Sharing flow: `navigator.canShare({files})` → share image + text + url. Otherwise, share the url only and download the image. Desktop: download the PNG and copy the link, with the toast "Image saved, link copied".

| # | Moment | Trigger | What the image shows (top to bottom) | Share text and link |
|---|---|---|---|---|
| A | **Coloring done** | Done on a coloring page, then Share; again later from Me → My colorings | Small logo at the top (y 240). The heading "Colored by Rina" (or "My Ekky coloring" without a name). The player's coloring: 920x920, white 16 px rounded frame, tilted −2°, a sticker of Ekky's face peeking over the top-right corner. Below it, a 300x300 inset of Ekky's original, labeled "Ekky's version". A small chip with the page name, "Giraffe". Credit line. "Your turn: ekkyarya.com" | "I colored Ekky Arya's Giraffe. Your turn: {link}"; link `?c=giraffe&f=…&s=…&by=Rina` |
| B | **Legendary pull** (own art only) | Flipping a Legendary card in a pack, and only if the card is own work; button "Show it off" under the flipped card | A gold "LEGENDARY" ribbon at the top. The card: the art in a gold foil frame (diagonal light stripes), 860x1180. The title under the card ("Blue Bird"). "Rina pulled 1 of 6 legendaries". Credit line. | "I pulled a Legendary Ekky Arya card: Blue Bird. Open it to get it too: {link}"; link `?card=blue-bird&by=Rina` (the friend receives the card as a gift) |
| C | **Star Catcher record / challenge** | A new best score, or a won challenge; button "Challenge a friend" on the result screen (shown after every round, highlighted on a record) | "STAR CATCHER" heading. A huge score, "47" (Fredoka 360 px, yellow `#FFB400`). Beneath it: "Can you beat Rina?". The hero sprite catching (the planet hero drawing) with 3 catch icons and counts (palette ×6, cat ×2, plain star ×21). Credit line. | "I scored 47 in Ekky Arya's Star Catcher. Beat me: {link}"; link `?star=47&seed=k3f9a&by=Rina` |
| D | **Player Card** | Me tab → "Share my Player Card"; offered once after the first coloring share and after the Final Quest | A trading-card layout. Name at the top ("Rina"), "Level 4 Art Explorer". An avatar: the sticker the player chose (one of Ekky's doodles). A 2x2 stat grid: cards collected 18/46, best Star Catcher 47, colorings 3, trophies 7/14. A "Favorite card" art strip (own art only, the player's choice). "Player since Oct 2026". Credit line. | "My Player Card in Ekky Arya's world. Come play: {link}"; link `?by=Rina` |
| E | **"I recommend Ekky" sticker** | Me tab → "Recommend Ekky"; after sending the Final Quest; secondary button on the coloring reveal | A large die-cut sticker: Ekky's face drawing in a speech bubble, white outline, slight tilt. Text: "Rina recommends Ekky Arya". The reason as a coral chip (one of 4 presets, below). "Need an illustrator? ekkyarya.com". Credit line. | "I recommend Ekky Arya: {reason}. See his work: {link}"; link `?rec=2&by=Rina` |
| F | **Card gift** (own art only) | The share button in the card viewer of an own piece | The art large (900x900), the title, the category icon, "From Rina's collection". Credit line. | "Look at this piece by Ekky Arya: {title} {link}"; link `?card=old-bus&by=Rina` |

Recommendation reasons (presets only, no free text, so nobody can post words under Ekky's name): 1 "Love the characters", 2 "Super fun style", 3 "Great to work with", 4 "Would hire again". Reasons 3 and 4 only appear after the player answers "Have you worked with Ekky?" with Yes.

Player name: asked once, on the first share ("Sign it with your first name, optional"). Letters, spaces and hyphens only, 1–16 characters. Always drawn as text, never as HTML. Stored in `localStorage`. Editable in Me.

---

## 5. Challenge and deep links

### URL format (query parameters on the site root; work on GitHub Pages and in Capacitor)
| Link | Format | Example |
|---|---|---|
| Coloring | `?c={page}&f={fills}&s={stickers}&by={name}` | `?c=giraffe&f=v1.AbC…&s=v1.Xy…&by=Rina` |
| Card gift | `?card={slug}&by={name}` | `?card=blue-bird&by=Rina` |
| Star Catcher challenge | `?star={score}&seed={base36}&by={name}` | `?star=47&seed=k3f9a&by=Rina` |
| Recommendation | `?rec={1-4}&by={name}` | `?rec=2&by=Rina` |
| Invite / Player Card | `?by={name}` | `?by=Rina` |

- `f`: version prefix `v1.`, then base64url of one 4-bit palette index per region (0 = empty). 120 regions = about 80 characters.
- `s`: `v1.`, then base64url of 5 bytes per sticker (id, x 0–255, y 0–255, scale, rotation). At most 6 stickers.
- Brush strokes are not in the link (too big). They appear only in the shared image.
- Slugs come from the file names (`blue-bird`, `old-bus`). Add a `slug` field to `PROJECTS`.
- Bad or unknown values: ignore the parameter and open the start screen normally. Never show an error.
- After handling, replace the URL with a clean one (`history.replaceState`), so a refresh doesn't repeat the gift or the challenge.
- A deep link **always opens game mode**, on any device. On desktop the game renders in a centered 430 px phone frame over the dimmed classic site, with a close button that returns to the classic site.

### What the friend sees on arrival (target: under 2 s to the content)
| Link | Arrival screen | Buttons |
|---|---|---|
| Coloring | Rina's coloring re-rendered live from the link (fills + stickers), framed, with "Rina colored Ekky's Giraffe". A "Peek at Ekky's version" hold button. | **"Color your own"** (opens the same page blank), "Hire Ekky", "Explore" |
| Card gift | The card flips in with its rarity glow: "Rina sent you Blue Bird". The card is added to the friend's collection (once per slug). The full art viewer is one tap away. | **"Open my free pack"**, "Hire Ekky" |
| Star Catcher | A challenge card: "Rina scored 47. Can you beat it?", with the same seed so the friend gets the same stars in the same order. | **"Accept challenge"** (starts the 3-2-1), "Not now" |
| Recommendation | The sticker as it was shared: "Rina recommends Ekky: Super fun style", then 6 best pieces in a strip. | **"Hire Ekky"**, "Play" |
| Invite | The start screen with a banner, "Rina invited you to color with Ekky". | The normal start screen |

### Challenge result and re-share
- During play, a thin ghost marker on the score pill shows Rina's 47 ("Rina 47").
- Result screen: "You 51 vs Rina 47: You win!" (or "So close! 39 vs 47"), with both names and a bar comparison.
- Buttons: **"Send it back"** shares card C with the new score, the **same seed** and the new `by`, so the rivalry continues on the same course. "Play again" (same seed). "Hire Ekky".
- A won challenge unlocks "Rival Beaten". The score in a link can be edited by hand. That is accepted in round 1: no backend, no prizes at stake.

### Determinism (needed for fair challenges)
- Star Catcher uses the existing `rng(seed)` helper for every random call in the round (spawn kind, x, speed, spin).
- Game logic runs on a fixed 1/60 s step (accumulate real time, step in fixed slices), so the same seed gives the same spawns on every phone.
- A normal round picks a random seed and stores it with the best score.

---

## 6. Rewards and balance

### Art metadata (do this first)
Add to each `PROJECTS` entry: `slug`, `own` (true/false), and a corrected `rar`.
- `own: true` (assumed from the plan's icon mapping and the images): Blue Bird, Coexistence, Floating Boy, Hidden Monster, Old Bus, Summertime, Beansproud vs Puff, Virus and War, Monster, Doodles, Monster Crowd, Noodles, Giraffe, Shark, Little Planet, Hello 2022, A Day in Life, Road Trip, Hands, NFT #3, Toybox Packaging.
- `own: false`: all 5 fan-art pieces, the 5 client pieces (Indomaret, BCA, Pop Mie, Ancol, MSI), Game Pattern, D&D Party, and every piece the owner has not confirmed (Tea Break, Morumelons, Oasis, Web Illustration, My Sports Club, Save Early Buy Future, Plug Hero, Thinker & Doer, Type Is Art, Android, Kemerdekaan, RPG, NFT #9). They stay in the portfolio and in packs, but never on a share card.
- **Legendary = own work only.** New Legendary set (6): Blue Bird, Coexistence, Hidden Monster, Old Bus, Little Planet, Hello 2022. Former Legendaries that are not own (Tea Break, Morumelons, Save Early Buy Future, Indomaret) drop to Epic.

### XP (100 XP per player level; the level shows on the Player Card)
| Action | XP | Notes |
|---|---|---|
| Open a map level the first time | 20 | Was 40. |
| View an artwork the first time | 5 | Was 10. 46 pieces = 230 XP of browsing. |
| Finish a coloring (Done) | 50 | Per page, first time. A recolor gives 10. |
| Share (any moment, first time per moment type) | 30 | Later shares: 5. Counted when the share promise resolves or the download starts. |
| Star Catcher round | score ÷ 2, max 30 | |
| Open a pack | 15 | Unchanged. |
| Achievement unlocked | 25 | Unchanged. |
| Final Quest sent | 100 | Unchanged. |

### Coins
| Source | Coins |
|---|---|
| Star Catcher | 1 per point (plain star 1, palette 3, cat 5) |
| First coloring of each page | 15 |
| First share of each moment type | 10 |
| Duplicate card from a pack | 5 per duplicate |
| Accepting a challenge link (once per link) | 10 |
| Floating stars on menus | **removed** |

### Packs
| Rule | Value | Reason |
|---|---|---|
| First pack | Free; the button glows after the first coloring | Instant reward on the first visit. |
| First pack contents | Fixed: 1 own Legendary (random from the 6), 1 Epic, 1 Rare | Guarantees share moment B in the first session. |
| Price after that | **30 coins** | A casual round scores 20–40, plus 15 from a coloring. The second pack is affordable after 1 to 2 rounds (scorecard). |
| Cards per pack | 3 | Unchanged. |
| Drop rates per slot | Common 50% · Rare 30% · Epic 15% · Legendary 5% | Was 55/28/12/5. |
| Slot 3 guarantee | Rare or better | No all-common packs. |
| Legendary pity | Guaranteed in the 5th pack after the last Legendary | Keeps share moment B coming. |
| New-card bias | 80% chance to pick an unowned card within the tier | Unchanged. |
| Completion cost | About 18 paid packs, about 540 coins, 15–20 rounds | A long-tail goal for fans. Nothing is hidden meanwhile. |

**Collected vs not collected:** every card shows its full art always. Collecting adds the rarity foil frame, the "Collected" star and the right to share or gift it. Uncollected cards get a thin dashed frame and a tiny label "Not in your deck". The header reads "18 of 46 in your deck · all art is free to view".

### Star Catcher tuning
| Parameter | Today | Round 1 |
|---|---|---|
| Duration | 30 s | 30 s |
| Lives | 3; at 0 the round ends | 3; at 0 the round ends, but hazards are rarer and easier to dodge (below) |
| Spawn interval | 0.55 s → 0.25 s (linear) | 0.60 s → 0.32 s (linear) |
| Fall speed | 150 → 370 px/s (+0–60 random) | 140 → 320 px/s (+0–50 random) |
| Hazard share | 18% → 33% | 12% → 25% |
| Item mix (non-hazard) | star 75%, palette 18%, cat 7% | star 72%, palette 20%, cat 8% |
| Catch box | ±46 px for everything | ±46 px for good items, **±30 px for hazards** (forgiving) |
| Combo | none | 8 catches in a row: ×2 points until the next miss or hit. A "×2" badge on the score pill. |
| Fever | none | Last 5 s: background pulses, all plain stars are worth 2 |
| Seed | Math.random | `rng(seed)` with a fixed 1/60 step (section 5) |
| Items' art | emoji | plain star = a simple 5-point shape in `#FFE08A`; +3 = palette doodle; +5 = cat doodle; hazard = virus blob from "Virus and War"; lives = cat doodle, grey when lost (plan mapping) |

Expected scores after tuning: casual 25–40, good 60–90, record 120+. That puts "Arcade Star" at 60, beyond a first round but reachable.

### Achievements (14, icons from Ekky's art per the plan's mapping; no emoji)
| Id | Name | Condition | Icon |
|---|---|---|---|
| hello | Nice to Meet You | Open "Who is Ekky?" | face |
| color1 | First Colors | Finish a coloring | palette doodle |
| color3 | Color Club | Finish 3 different pages | hands (from "Hands") |
| share | Show-off | Share anything | paper plane (Hello 2022) |
| challenger | Challenger | Send a Star Catcher challenge | astronaut (NFT #3) |
| rival | Rival Beaten | Win a challenge link | cat doodle |
| fan | Fan Club | Send an "I recommend Ekky" sticker | Ekky's face in a speech bubble |
| cards6 | Art Lover | View 6 artworks | book doodle |
| pack | Pack Opener | Open a pack | Toybox box |
| legend | Legendary Pull | Pull a Legendary | glowing bird (Blue Bird) |
| arcade | Arcade Star | Score 60 in Star Catcher | the star shape |
| explorer | World Explorer | Open every map level | planet doodle |
| quest | Quest Complete | Send the Final Quest | green monster (Monster) |
| complete | Completionist | Collect all 46 | treasure chest (Hidden Monster) |

Kept from today: hello, pack, legend, arcade (new threshold), explorer, quest, complete; "Art Collector" becomes "Art Lover" (6 views). New: color1, color3, share, challenger, rival, fan. Removed: Press Start, Coin Keeper. Toasts never cover the HUD: they slide in **below** it, and at most one shows at a time.

---

## 7. Map and levels

### Tabs (bottom bar)
`Map` (Ekky's face, center) · `Color` (palette doodle) · `Cards` (Toybox box) · `Me` (cat doodle; Player Card, trophies, settings, my colorings).
The plan maps the palette doodle to the Cards tab. With coloring as the core, the palette fits "Color" better, and the Toybox box (the plan's pack icon) fits "Cards". UX can veto this.

### Levels (6 nodes, all visible on the first map screen on an iPhone 13; tighten the vertical step from 170 px to about 105 px)
| # | Level | Icon (Ekky asset) | What happens there | Reward |
|---|---|---|---|---|
| 1 | Who is Ekky? | face | A 3-line intro, 3 short facts (city, years drawing, favorite subjects: copy from UX), 3 own pieces as a mini strip. Buttons: "Color with Ekky", "Hire Ekky". | 20 XP |
| 2 | **Color with Ekky** | Hands (from "Hands") | The page picker: Giraffe, Shark, Little Planet (+ Road Trip). Finished pages show the player's thumbnail and a check. | 20 XP + coloring rewards |
| 3 | Art Collection | palette doodle | Opens the Cards tab, with the pack button in focus. | 20 XP |
| 4 | Star Catcher | astronaut (NFT #3) | Starts the arcade. The node shows "Best 47". | 20 XP + score |
| 5 | Doodle to Done | doodle character (Doodles) | The 4 process steps as swipeable cards. Each step uses an image of a real Ekky piece at that stage, if Ekky supplies sketches; otherwise text only. Last card: "Start your project", which opens Final Quest. | 20 XP |
| 6 | **Final Quest** (boss) | green monster (Monster) | The contact form (mailto), with the project type prefilled from the category the player viewed most. After sending: "Recommend Ekky" (sticker E) and "Share my Player Card". | 100 XP |

Cut: Skill Tree (its categories live as filters in Cards). Levels are never locked. The "next" glow just suggests an order.

### "Hire Ekky" in one tap from every screen
- A persistent **"Hire Ekky" pill in the HUD**, top right, next to the coins, on: the start screen, map, Color picker, Cards, Me, all level sheets, the card viewer, the pack result, the arcade result, the coloring reveal and every deep-link arrival screen.
- In the coloring canvas the pill sits in the top bar (it stays visible).
- The only exceptions are the 3-2-1 countdown and the 30 s of live Star Catcher play (a tap there would quit the round). The result screen shows it again.
- Tap = the Final Quest sheet opens directly, over the current screen. Closing it returns to the same place.
- Accessible name: "Hire Ekky, send a message". Line icon: paper plane (or Ekky's paper plane once in the asset library).

---

## 8. Juice list (each line: moment → feedback)

1. Fill a shape → the region scales 1.00→1.04→1.00 over 160 ms, soft "blip" (660 Hz, 50 ms), 6 ms haptic.
2. Place a sticker → drop shadow lifts during the drag, a small "pop" sound and 10 ms haptic on release.
3. Undo → the region fades back over 120 ms, low "tick".
4. Peek (hold) → Ekky's colors cross-fade in over 200 ms, back out on release.
5. Done → the canvas flashes white for 80 ms, the "Yours vs Ekky's" slider sweeps from left to center, rising arpeggio, haptic `[20,30,40]`.
6. Share card ready → the card slides up from the bottom with a 2° tilt that settles; the Share button pulses once.
7. Share succeeded → toast "Shared! +10 coins", coins fly from the toast to the HUD counter.
8. Coins added (anywhere) → each coin flies to the HUD, the counter ticks up, `bump` animation.
9. Pack button ready (enough coins) → a gentle glow pulse every 3 s; no pulse when unaffordable.
10. Pack open → existing rip + flip; a Legendary flip adds a gold light sweep, `legend` sound, haptic `[30,30,80]`, confetti.
11. Duplicate card → the card shrinks into a "+5" coin.
12. Map travel → the existing hop of the token; arrival bounce on the node.
13. Level first-open → three stars light up one by one under the node (existing), with a tick per star.
14. Star Catcher catch → existing burst; combo ×2 → the score pill turns gold and wobbles.
15. Star Catcher hazard hit → existing shake + red flash; the lost cat-life icon turns grey with a small drop.
16. Fever (last 5 s) → background hue pulse, faster tick sound.
17. New record / challenge won → "New record!" stamp scales down onto the score, confetti, `legend` sound.
18. Achievement → toast slides in under the HUD (never over it), `ach` sound, 40 ms haptic.
19. Deep-link arrival → the content card flips in within 600 ms of first paint; a "From Rina" ribbon drops in.
20. Hire Ekky tap → the sheet rises with a slight overshoot; on send: the paper plane flies off-screen, confetti.

Global: with `prefers-reduced-motion`, keep the color and opacity changes, and drop scale, shake, confetti and flying coins. Sounds and haptics follow the existing toggles, and the sound starts only after the first user tap.

---

## 9. Prioritized backlog for the developer

Sizes: S ≤ half a day, M ≤ 2 days, L > 2 days. **R1** = must-have for round 1. Plan tickets T0 (split `index.html`) and T1 (Ekky asset library) come first.

| # | Ticket | Goal | Acceptance test (on an iPhone-size phone) | Size | R1 |
|---|---|---|---|---|---|
| 1 | Art metadata | `slug`, `own`, new `rar` in `PROJECTS` (section 6) | The Cards tab shows 6 Legendaries, all own work. The dev console function `shareable()` lists no fan-art or client piece. | S | **R1** |
| 2 | No emoji, right icons | Replace every emoji in the game with Ekky assets or line icons per the plan mapping and section 6 | A search of the shipped HTML/JS/CSS for emoji code points returns 0. Each level, tab, achievement and Star Catcher item shows Ekky art. | M | **R1** |
| 3 | Hire Ekky pill | One-tap hire from every screen (section 7) | On each listed screen, one tap on "Hire Ekky" opens the Final Quest form. Closing returns to the same screen. | S | **R1** |
| 4 | Cut the clutter | Remove floating menu stars, Skill Tree, Press Start, Coin Keeper, duplicate Star Catcher buttons; move achievement toasts under the HUD | No falling stars over the map or cards. The map shows 6 nodes without Skill Tree. The coin counter stays visible during every toast. | S | **R1** |
| 5 | Coloring page pipeline | Build script outputs `line.png`, `regions.png`, `page.json` (with palette) per page | Running the script for Giraffe creates the 3 files. Every region in Giraffe can be filled without color leaking into a neighbor. | L | **R1** |
| 6 | Coloring screen | Fill, stickers, eraser, undo, peek, done, auto-save (section 3) | From the start screen, "Color with Ekky" → 3 fills → Done takes under 30 s. Undo reverts the last fill. Leaving and reopening restores the page. Pinch-zoom works. | L | **R1** |
| 7 | Share card renderer | One canvas module that renders cards A–F at 1080x1920 with the credit line, refusing `own:false` art | Each card type saves as a 1080x1920 PNG. "Illustrated by Ekky Arya" and "ekkyarya.com" are readable at y 1590–1650. Feeding a client piece throws and shows no card. | M | **R1** |
| 8 | Share service | Web Share with files → url-only + download → desktop download + copy link | On iOS Safari and Android Chrome, Share opens the system sheet with the image and text with link. On desktop Chrome the PNG downloads and the toast says "link copied". From Done to share sheet takes ≤ 3 taps. | M | **R1** |
| 9 | Deep-link router | Parse `c`, `card`, `star`, `rec`, `by`; arrival screens (section 5); clean URL after; desktop phone frame | Opening each sample link on a phone shows its arrival screen in < 2 s. Refreshing does not re-gift. A broken `f` value opens the start screen without errors. On desktop the game opens in a centered frame. | M | **R1** |
| 10 | Coloring link encode/decode | `f` and `s` encoding, v1 | A coloring with 10 fills and 2 stickers, shared and opened in a fresh browser, looks identical (fills and sticker positions). | S | **R1** |
| 11 | Start screen, first 60 s | Tagline, 6-best strip, "Color with Ekky" primary, Explore, Continue for returning players | A fresh visitor sees 6 own pieces within 10 s without scrolling. The first coloring is shareable within 60 s, from a timed run. | M | **R1** |
| 12 | Star Catcher retune + seed | New numbers (section 6), fixed step, seeded rng, combo, fever, Ekky item art | Two phones with the same seed get the same first 20 spawns, from a logged list. Casual play in 5 test rounds averages 25–40. | M | **R1** |
| 13 | Challenge mode | Ghost score, vs result, "Send it back" with the same seed | Opening `?star=47&seed=k3f9a&by=Rina` shows the challenge. After the round the result shows "You N vs Rina 47". "Send it back" shares a link with the same seed and the new score. | M | **R1** |
| 14 | Economy | Coin sources, pack price 30, rigged first pack, slot-3 guarantee, pity, duplicates → coins | The first pack always holds 1 own Legendary. After it, one coloring plus one round of 20+ points buys the next pack. A duplicate shows "+5". | S | **R1** |
| 15 | Map restructure | 6 levels (section 7), all visible on one screen, new tab bar with Color and Me | On an iPhone 13 all 6 nodes are visible without scrolling. Each node opens its content. Final Quest prefills the project type. | M | **R1** |
| 16 | Achievements rework | The list in section 6 | Each achievement can be triggered by its action. The Me tab shows "x of 14". | S | **R1** |
| 17 | Player Card + name | Card D, name prompt, Me tab | After the first share the name is remembered. "Share my Player Card" produces card D with correct stats. | M | **R1** |
| 18 | Legendary + card gift share | Cards B and F, gift on arrival | Pulling an own Legendary shows "Show it off". The friend's link adds the card to their deck once. No share button on non-own cards. | S | **R1** |
| 19 | "I recommend Ekky" | Sticker E with 4 preset reasons, no free text | From the Me tab: 2 taps to the sticker preview, 1 to share. The link shows "Rina recommends Ekky" with Hire as the main button. | S | **R1** |
| 20 | Card viewer upgrade | A short story line per piece (copy from UX), "Color this" (if it is a page), Share (own only), Hire | Opening Giraffe in Cards shows "Color this", which opens the page. Opening Indomaret shows no share button. | S | **R1** |
| 21 | Reduced motion + juice pass | Section 8 | With reduced motion on, no confetti, shake or flying coins, and every flow still works. With it off, each juice line is visible. | M | should |
| 22 | Brush with pressure | Brush tool (section 3) | On a phone, brush strokes stay under the lines. With a stylus, stroke width varies with pressure. | M | should |
| 23 | More pages | Shark, Little Planet, Road Trip from ink layers | Each page passes the "no leak" check of ticket 5 and is approved by Ekky. | M | should (Shark R1 if cleanup works) |
| 24 | Holo Legendaries on tilt | DeviceOrientation foil, iOS permission asked once on first Legendary | Tilting the phone moves the foil on Legendary cards. Denying permission falls back to the slow automatic shimmer. | M | later |
| 25 | PWA + offline + View Transitions | Installable, works offline after the first visit | Install from Chrome Android. Airplane mode → the game, cards and coloring still open. | M | later |
| 26 | Link previews | Static pages per card and page with Open Graph images, built at build time | Pasting `ekkyarya.com/c/giraffe` into a chat shows the Giraffe preview with credit. | M | later |

Suggested build order: 1 → 2 → 4 → 3 → 5 → 6 → 7 → 8 → 10 → 9 → 11 → 14 → 12 → 13 → 15 → 16 → 17 → 18 → 19 → 20.

---

## 10. Open questions for the owner (blocking only)

1. **Line art for the coloring pages.** Can Ekky export his ink (outline) layers for Shark, Little Planet and Road Trip as PNGs? Without them, round 1 ships with Giraffe only, plus Shark if cleanup works. Also: is it OK to extract his own outlines from the JPG by darkness threshold, as done for Giraffe? This extracts his real lines; it is not an "Ekky-style" filter.
2. **Which pieces are his own work?** Section 6 lists 13 pieces of unknown ownership. They stay out of share cards and Legendaries until confirmed. Please mark the ones that are his own.
3. **The domain printed on share cards and links.** Is it `ekkyarya.com`, or the GitHub Pages URL for now? Every share card and challenge link depends on it.
4. **The real contact email** (still `hello@example.com` in `CONFIG`). The Final Quest and the Hire pill send people there.
