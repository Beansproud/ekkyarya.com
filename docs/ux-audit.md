# UX audit: ekkyarya.com, round 1

Reviewer: UX Portfolio lead. Date: 2026-10-27.
Point of view: an art director or brand manager deciding whether to hire Ekky, and a casual visitor on a phone.
Evidence: baseline screens (`phone-01` to `phone-11`, `desk-01` to `desk-06`), extra Playwright captures and measurements in the scratchpad `ux/` folder, every image in `assets/work/` opened at full size, every icon crop rendered at 32 px on the game's dark purple and on white.

---

## 0. Top findings

1. **The art is three screens away on both views.** Desktop opens on a hero, About and Services before any portfolio piece (the Work grid starts about 2,000 px down). The phone opens on a logo and a Play button; the first piece appears after 2 taps (Play, then Cards or level 3). The scorecard target "6 best pieces visible within 10 s" fails on both.
2. **"Hire Ekky" is 2 to 3 taps plus a scroll on the phone, and missing from the art view on both.** On the map, the Final Quest node sits at y = 1,020 px on a 664 px viewport. The lightbox, the card pack, Star Catcher and the level sheets have no hire action at all.
3. **The contact details are placeholders.** `hello@example.com`, plus Instagram, Dribbble and Behance links that point to the home pages of those sites. Every hire path ends in a dead end until `CONFIG` is filled in. Both forms only open `mailto:`, which does nothing on a desktop with no mail app.
4. **57 emoji characters (baseline scan) are still in the UI, in about 30 places** (map levels, trophies, buttons, Star Catcher items, hero wave, game FAB, HUD). One fan-art piece, **Game Pattern** (Mario, Sonic, Pac-Man, Link, Bulbasaur), is not flagged as fan art. Two "Ekky" avatars are in use: the glasses guy in the HUD and the blue-haired face in the tab bar.
5. **Curation and titles undersell him.** The order follows the file list. Two of the eight Legendary cards are a photo-based website (Tea Break) and a client banner, and the lightbox shows no description. Several titles are guesses ("Monster", "Web Illustration", "Beansproud vs Puff", "A Day in Life").

---

## 1. First impression

### Desktop (1440 x 900)

| Time | What a hiring client understands | What is missing |
|---|---|---|
| 5 s | "I'm Ekky, illustrator and graphic designer, I draw characters." A friendly self-portrait on a little planet. A yellow "Contact Me" button. | Any proof. No portfolio piece is above the fold (the hero art is itself the "Little Planet" piece, but nothing says so). His full name appears only in the logo. The hand wave is an emoji. |
| 30 s | After scrolling: a warm About text, skill tags, 4 service cards, then the grid. The style is clear and consistent: thick outlines, warm palette, lots of characters. | Who he has worked with (Indomaret, BCA, MSI, Ancol and others are in the grid but never named). Location and time zone. Languages. Turnaround time. Rates or "starting at". Availability ("Open for new projects" is 12.8 px grey text in the sidebar footer). Usage and licensing. Any testimonial. Any case study that shows his process on a real piece. |

### Phone, game mode (iPhone 13)

| Time | What a casual visitor or client understands | What is missing |
|---|---|---|
| 5 s | A logo, a cute illustration, "Illustrator · Graphic Designer", a big PLAY button. It is a game. | That this is a portfolio. No art piece. No name in text (the logo is a blurry, upscaled screenshot crop). No hire action. "Open the classic site" is cut off at the bottom edge. |
| 30 s | After PLAY: a map with emoji planets, an achievement toast covering the header, falling stars. Level 1 is About; level 2 confetti covers the skill list; Cards shows the art. | The art is one more tap and a scroll away. The self-rated stats ("Playfulness 99") do not convince a client; real facts would (years, number of clients, pieces delivered). The hire path sits at the bottom of a long map. |

### Phone, classic mode

The hero illustration fills the first screen, so the name and the CTA are below the fold. The game FAB (an emoji) overlaps "I'm Ekky". Contact takes 2 taps (menu, then Contact).

### What a client needs before deciding, and where it should go

| Need | Proposal | Where |
|---|---|---|
| Proof of quality | The 6 lead pieces (section 2) | Desktop: a strip directly under the hero, above the fold at 1440 x 900. Phone: a "Featured" row on the start screen, under the hero |
| Who he worked with | "Worked with Indomaret, BCA, MSI, Ancol, Morumelons, Fizzy Tube" as a text row (no client logos as icons) | Under the featured strip; About level |
| Style range | Category chips with counts | Already present; reorder (section 2) |
| Process | "Doodle to done" with one real example: sketch, then final (needs Ekky's sketch files) | Process section, level 4 |
| Availability | "Booking projects from <month>" | Hero, Final Quest |
| Price | "Projects from <amount>" or a "Get a quote" button | Final Quest, Contact |
| Contact | Real email, WhatsApp (`wa.me` link, the normal channel in Indonesia), Instagram DM | Everywhere (section 4) |
| Basics | "Based in Indonesia (GMT+7), works in English and Indonesian" | About, Contact |

---

## 2. Curation

### Lead 6 (all original, none fan art or client)

| # | Piece | Why it leads |
|---|---|---|
| 1 | **Coexistence** (`coexistence.jpg`) | One frame tells a whole story: a kid squeezed on a bus bench beside a monster commuter. It shows humor, character range, a crowded scene that stays readable, and an editorial finish. |
| 2 | **Hidden Monster** (`hidden-monster.jpg`) | Mood and lighting: a lantern glow leads the eye from the kids to a mimic chest. It proves he can do atmosphere for picture books and games. |
| 3 | **The Blue Bird** (`blue-bird.jpg`) | A calm single-character moment with glow light and emotion. A strong cover image for children's books. |
| 4 | **Broken-Down Bus** (`old-bus.jpg`) | An ensemble cast of people and animals with perspective and weather. It shows he can handle a brief with many characters. |
| 5 | **Monster Snack Bar** (`monster-crowd.jpg`) | Dense character invention with texture: a dozen distinct monsters, each with its own personality. A mascot buyer sees range at a glance. |
| 6 | **Monster World Doodles** (`doodles.jpg`) | His raw doodle language and hand lettering. It is also the source of the site's doodle icons, so it ties the brand together. |

Right after the lead 6, show one **"Client work"** row: Indomaret, Morumelons, Oasis for Fizzy Tube, BCA Flazz, MSI, Save Early, Buy Future. Clients buy proof of commercial delivery as much as style.

**Rarity in game mode should follow this curation.** Legendary = the lead 6, plus Little Planet and Morumelons. Move Tea Break Website and My Sports Club App to Common: they are UI and photography, not illustration. Every piece, whatever its rarity, stays visible in the grid and in Cards without coins (true today; keep it).

### Order per category

- **Illustration:** Coexistence, Hidden Monster, The Blue Bird, Broken-Down Bus, Monster Snack Bar, Monster World Doodles, Monster in My Room, Afloat, Buried at the Beach, Viking vs Dragon Kid, The Adventuring Party, Virus and War, Boss Fight, Big Catch, Giraffe Ride, Noodle Bath, Astronaut, Radio Explorer. Fan art goes last as its own group: Retro Game Pattern, One Piece Crew, Rocket & Groot, Miles Morales, Godzilla vs Kong, Finn & Jake.
- **Web & UI:** Morumelons, Oasis for Fizzy Tube, Character Crowd Banner, MSI Creator Banner, Tea Break website, My Sports Club app.
- **Branding & Product:** Save Early, Buy Future, Indomaret Shopping Rush, Thinker & Doer, Plug Hero mascot, Monster Noodles cup, BCA Flazz card, Ancol logo entry, Toybox packaging, Type Is Art in Motion, Secret Android.
- **Social:** Year of the Tiger 2022, Little Planet, Road Trip, A Day in the Life, Merdeka 77, Tangled Hands.

### Titles, descriptions and labels

Label rule: fan art shows a "Fan art" tag and the line "Fan art. Characters belong to their owners." Client work shows a "Client: X" tag. A contest entry shows "Competition entry". Nothing is hidden. Items marked "confirm" need Ekky's answer before launch.

| Current title | Proposed title | One-line description | Label |
|---|---|---|---|
| Blue Bird | The Blue Bird | A hiker meets a glowing bird on a night trail. | Original |
| Coexistence | Coexistence | Rush hour at a bus stop where monsters and people share the bench. | Original |
| Floating Boy | Afloat | A lazy summer float with fish, a beach ball and a stray can. | Original |
| Hidden Monster | Hidden Monster | Two kids sneak into a monster lair, and the treasure chest bites back. | Original |
| Old Bus | Broken-Down Bus | A bear, a lion driver and a caped hero wait out a breakdown. | Original |
| Summertime | Buried at the Beach | Summer at the beach, from the point of view of the kid in the sand. | Original |
| D&D Party | The Adventuring Party | A tabletop party marches into the snow, dice flying. (Avoid the trademark in the title.) | Original |
| Beansproud vs Puff | Viking vs Dragon Kid | Two tiny heroes duel on a cliff. (Confirm whether Beansproud and Puff are character names; if so, keep them in the description.) | Original |
| Virus and War | Virus and War | Two crises fight over one burning planet. | Original |
| Monster | Monster in My Room | A kid stands up to a giant one-eyed roommate. | Original |
| Doodles | Monster World Doodles | A full page of monsters, aliens and hand lettering. | Original |
| Monster Crowd | Monster Snack Bar | Lunch rush at a fast-food counter for monsters. | Original |
| Game Pattern | Retro Game Pattern | A repeat pattern of classic video game icons. | **Fan art (not flagged today)** |
| RPG | Boss Fight | An orc, a mouse knight and a fire spirit face an armored giant. (Confirm the fire spirit is his own design.) | Original, confirm |
| Noodles | Noodle Bath | A kid soaks in a bowl of ramen that walks on noodle legs. | Original |
| Giraffe | Giraffe Ride | A kid hitches a ride on a friendly giraffe. | Original |
| Shark | Big Catch | Fishing goes wrong when the fish is the bait. | Original |
| One Piece Fan Art | One Piece Crew | | Fan art |
| Rocket & Groot Fan Art | Rocket & Groot | | Fan art |
| Spider-Verse Fan Art | Miles Morales | | Fan art |
| Godzilla vs Kong Fan Art | Godzilla vs Kong | | Fan art |
| Adventure Time Fan Art | Finn & Jake: Bring It On | | Fan art |
| NFT #3 | Astronaut | Character from his NFT series. (Only 256 px; ask for a larger file. Confirm he owns the rights.) | Original, confirm |
| NFT #9 | Radio Explorer | Character from his NFT series. (256 px; same request.) | Original, confirm |
| Tea Break Website | Tea Break website | Website design for a bubble tea brand. | Client: Tea Break |
| Morumelons Landing Page | Morumelons | Landing page art for an NFT character collection. | Client: Morumelons |
| Oasis Web Illustration | Oasis for Fizzy Tube | A desert party around a soda maker, for the web. | Client: Fizzy Tube (confirm) |
| Web Illustration | Character Crowd Banner | A wide banner packed with characters. (Confirm the client; it looks like part of Morumelons.) | Confirm |
| MSI Web Banner | MSI Creator Banner | A creator at work, surrounded by the monsters in their head. | Client: MSI |
| My Sports Club App | My Sports Club app | App UI for a sports club's members and fees. | Client: confirm |
| Save Early, Buy Future | Save Early, Buy Future | A poster about saving today for the life you want later. | Confirm client or personal |
| Indomaret Creative Artwork | Indomaret Shopping Rush | A busy street of shoppers heading to Indomaret. | Client: Indomaret |
| Pop Mie Monster Noodles | Monster Noodles cup | A noodle-cup concept with a kaiju taking a hot bath. (The Pop Mie brand is not visible on the art; confirm whether it was a commission or a pitch.) | Client: Pop Mie (confirm) |
| BCA Flazz Card | BCA Flazz card | Card art: astronauts on a snack break. | Client: BCA |
| Ancol Logo Competition | Ancol logo entry | Entry for Ancol's Indonesia 77 logo contest. | Competition entry |
| Toybox Packaging | Toybox packaging | Box wrap covered in his doodles. | Confirm |
| Plug Hero Mascot | Plug Hero mascot | A mascot who runs on a wind-up key. | Confirm |
| Thinker & Doer | Thinker & Doer | Lettering packed with tiny scenes of people at work. | Confirm client |
| Type Is Art | Type Is Art in Motion | Animated hand lettering. (The first GIF frame is blank, so a still thumbnail or share preview shows an empty blue square; add a still `thumb`.) | Original |
| Android Character | Secret Android | A friendly face that opens to reveal a robot. (Animated.) | Original |
| Little Planet | Little Planet (self-portrait) | Ekky at his desk on his own little planet. This is the hero art. | Original |
| Hello 2022 | Year of the Tiger 2022 | New Year post: racing into the year of the tiger. | Original |
| Kemerdekaan | Merdeka 77 | Indonesia's 77th Independence Day, by bicycle. | Original |
| A Day in Life | A Day in the Life | Four panels of an ordinary day. | Original |
| Road Trip | Road Trip | | Original |
| Hands | Tangled Hands | | Original |

DEV note: `PROJECTS` needs `desc`, `client` and `fan` fields. The lightbox already reads `p.desc`, but every piece has an empty one today.

---

## 3. Icon mapping check

All crops were rendered at 32 px on #2B1642 (game background) and on white. JPG crops carry their background, so each icon needs a cut-out transparent PNG (ideally from Ekky's layered file). `face.png` is RGB with a mint square behind it.

### Rows of the plan's table

| Where | Planned asset | Reads at 32 px? | Meaning fits? | Verdict and better option |
|---|---|---|---|---|
| Level 1, game-mode button, hero wave | `face.png` (blue-haired face) | Yes, clear | Partly | This is the "Secret Android" character and the blue-haired boy who recurs in Plug Hero, A Day in the Life, Merdeka 77 and Road Trip. The HUD avatar and map token use the glasses guy from `hero.png`, so two different "Ekky"s are on screen. **Ask Ekky which one is him.** Then use that one everywhere: avatar, token, FAB, Level 1, hero wave. If it is the glasses guy, crop the head and the raised pen hand from `hero.png` (about x 140 to 400, y 120 to 330). |
| Level 2 "Skill Tree" | `hands.jpg` (whole) | **No**: a beige blob | Weak ("craft" is a stretch) | Use the **pen hand from `hero.png`** (the raised arm with the stylus, about x 140 to 280, y 120 to 300), cut out. A drawing hand reads as "skill". |
| Level 3 "Art Collection", Cards tab | `icon-cards.png` palette | Yes | Yes | Keep. |
| Level 4 "Doodle to Done" | a character from `doodles.jpg` | Depends on the crop | Yes | Use the **yellow ghost** (about x 940 to 1210, y 370 to 660): big eyes, reads clearly at 32 px. The tall green monster on the left edge is too narrow. |
| Level 5 boss "Final Quest" | green monster from `monster.jpg` | Head only: yes | Yes | Crop **the head with the single eye and the teeth** (about x 590 to 1000, y 0 to 330). The full body turns to mush at 32 px. |
| Send message | paper plane from `hello-2022.jpg` | **No** | Yes | The plane is cut off by the right edge of the image and overlaps a fist. Use a **line "send" icon** (it is a general control), or ask Ekky for a clean plane doodle in the mini asset pack. |
| Card pack | box from `toybox.jpg` | Yes on dark, weak on white | Yes | It is a rendered product photo, white box on cream. OK as a cut-out with an outline. Confirm Toybox is his own piece, not a client's. |
| Star Catcher button | astronaut from `nft-3.jpg` | Weak: a grey blob with a dark visor | Yes | The source is 256 px. Crop the **helmet only** (x 20 to 230, y 10 to 200) and ask for a larger file. Confirm the NFT rights. |
| Star Catcher +3 / +5 / hazard | palette / cat / virus | All read | +3 and +5 are arbitrary; hazard fits | Use the **teal virus** (x 440 to 580, y 350 to 490): it is the cleanest. The +1 item is still an emoji star; use a simple star shape in his palette (plan rule 4). |
| Lives | cat doodle, grey when lost | Yes | Weak | The cat is already the Trophies tab and the +5 item; a third meaning confuses. Use **simple hearts in his palette** (a general shape), or the face from row 1. |
| Trophy: World Explorer | planet doodle | Yes | Weak (a planet is not a map) | Use the **red map pin** from `hero.png` (about x 320 to 420, y 420 to 520). |
| Trophy: Legendary Pull | glowing bird from `blue-bird.jpg` | Fair: low contrast on dark purple | Yes | Keep, but cut out with its blue glow and a light outline. |
| Trophy: Completionist | chest from `hidden-monster.jpg` | Yes, very clear | Yes, with a joke (it is a mimic) | Keep. Description: "Collect every card (watch out, it bites)". |
| Category icons | `cat-*.png` | Yes | Yes | Done. Two fixes: `cat-social.png` has the mic handle cut off at the right edge, and `cat-web.png` has a stray line at its bottom-left. Re-crop both. |

**New asset found:** the **gold trophy cup** in panel 4 of `day-in-life.jpg` (about x 530 to 660, y 570 to 720) reads perfectly at 32 px. Use it for the **Trophies tab** and the "Arcade Star" trophy. The cat can then stay a cat (Lives or +5 only).

### Every other emoji or generic glyph in `index.html`

| Line | Where | Now | Replace with |
|---|---|---|---|
| 678 | Desktop hero wave | ✋ | The chosen Ekky face, waving (or the pen hand) |
| 867 | Game-mode FAB | 🎮 | The chosen Ekky face, plus the text "Play" |
| 875, 1380, 1409, 1447 | Coin pill, pack price, arcade score | ★ | A simple star shape in his palette (one SVG, used everywhere) |
| 883, 891, 898 | Star Catcher / Earn coins | 🎯 | The Star Catcher icon (astronaut helmet) |
| 884, 1178, 1391 | Hint sparkle, click sparks, card back | ✦ | A 4-point sparkle shape in his palette; the card back shows the logo |
| 898, 1211, 1380 | Pack button, Pack Opener trophy | 🎁 | Toybox box |
| 910, 1313 | Final quest button, Send message | ⚔️ | Monster head (Final quest); line "send" icon (Send) |
| 923, 926, 934, 948 | Close buttons | ✕ | Line icon: close |
| 940 | Play again | ↻ | Line icon: replay |
| 952, 1299 | Lightbox prev/next, "Next level →" | ← → | Line icons: back, next |
| 863, 140 | "Back to top ↑", card "more" arrow | ↑ → | Line icons: scroll up, next |
| 264 | Marquee separator | ✦ | Sparkle shape |
| 1128, 1306, 1338 | "Email copied ✓", process checks, seen mark | ✓ | Line icon: check |
| 1198 to 1202 | Map level icons | 👋 ✏️ 🃏 🧪 👑 | Face, pen hand, palette, yellow ghost, monster head (table above) |
| 1205 | Press Start trophy | 🎮 | The chosen Ekky face |
| 1206 | Nice to Meet You trophy | 👋 | The chosen Ekky face, waving |
| 1207 | Coin Keeper trophy | 🪙 | The star shape on a coin disc |
| 1208 | Art Collector trophy | 🃏 | Palette |
| 1209 | World Explorer trophy | 🗺️ | Map pin from `hero.png` |
| 1210 | Quest Complete trophy | 👑 | Monster head with a check badge |
| 1212 | Legendary Pull trophy | ✨ | Glowing blue bird |
| 1213 | Arcade Star trophy | 🎯 | Trophy cup from `day-in-life.jpg` |
| 1214 | Completionist trophy | 💎 | Mimic chest |
| 1301, 1302 | Skill Tree data (unused, but still emoji) | ✏️ 💻 📦 💬 | Delete the emoji from the data; `catImg` already draws the icon |
| 1356, 1358, 1410 | Floating stars, Star Catcher items | ⭐ 🌟 🎨 ☄️ | Star shape (+1), palette (+3), glowing star shape (+5), teal virus (hazard). Draw them as images on the canvas, not text. |
| 933, 1409 | Lives | ❤ 🖤 | Hearts in his palette, grey when lost |
| 881, 1347, 1448 | Middle dot "·" | · | Fine (typography, not an icon) |

---

## 4. "Hire Ekky" paths

### Today

| View | Screen | Hire action | Taps to the form |
|---|---|---|---|
| Desktop | Hero | "Contact Me" button | 1 |
| Desktop | Any section | Sidebar "Contact" link and mail icon (sticky) | 1 |
| Desktop | Lightbox | None (the modal covers the sidebar) | 2 (close, Contact) |
| Desktop | Contact | Form opens `mailto:` with a placeholder address; "Copy" button | Dead end until `CONFIG` is real |
| Classic phone | Any | Menu, then Contact; the hero button is below the fold | 2 |
| Game | Start | None | 2 taps + scroll (Play, scroll the map, Final Quest node, then a 0.56 s hop) |
| Game | Map | Final Quest node, 360 px below the fold | 1 tap + scroll + hop |
| Game | Levels 1, 2, 4 (sheet) | None; level 1 has only "Next level" | 2 taps + scroll |
| Game | Cards | None | 2 taps + scroll |
| Game | Art view (lightbox) | None | 3 |
| Game | Pack opening / pulled | None | 3+ |
| Game | Star Catcher, playing or result | None | 2 + scroll |
| Game | Trophies | "Hire Ekky: Final quest" under Settings, below the fold | 1 + scroll |
| Game | Final Quest | Form: 4 fields, then `mailto:` | |

### Changes so every screen is 1 tap

1. **A persistent "Hire Ekky" chip in the game HUD**, top right next to the coins. It is visible on every screen and overlay, including the lightbox, pack, sheets and results. Star Catcher shows it only on the result screen, so play is not interrupted. One tap opens the Final Quest sheet.
2. **A "Hire Ekky" secondary button on the start screen**, under PLAY (replacing the third Star Catcher button).
3. **A "Want art like this? Hire Ekky" button in the lightbox** on both views. It pre-fills the message with "I saw <title>".
4. **Desktop:** rename "Contact Me" to "Hire Ekky". Add a sticky "Hire Ekky" button to the classic phone header, next to the menu button.
5. **Make the Final Quest sheet a quick sheet, not just a form.** Three big buttons first: "Email Ekky", "WhatsApp Ekky", "Copy email". The short form (name, project type, message) comes below. Drop the visitor-email field: `mailto:` already sends from their address. Add "Usually replies within 2 working days" (confirm) and "Projects from ..." or "Ask for a quote".
6. **Fill `CONFIG`** with the real email, WhatsApp number and profiles. It is a launch blocker.

### "Try Ekky" wording (English, short, warm)

| Place | Copy |
|---|---|
| Start screen line | Ekky Arya draws characters that make people smile. |
| Start buttons | Play / Hire Ekky / Color with Ekky |
| HUD chip | Hire Ekky |
| Lightbox button | Want art like this? Hire Ekky |
| Final Quest heading | Final Quest: Work with Ekky |
| Final Quest body | Tell Ekky about your project. He'll reply within 2 working days. |
| Final Quest buttons | Email Ekky / WhatsApp Ekky / Copy email / Send to Ekky |
| After sending | Quest complete! Ekky will be in touch soon. |
| Coloring entry | Color with Ekky: pick a drawing, he brought the colors. |
| Coloring done | Looks great! Share it with a friend. |
| Share button | Share |
| Share caption | I colored a drawing by Ekky Arya. Your turn: ekkyarya.com/?card=blue-bird |
| Challenge caption | Rina caught 42 stars in Ekky's Star Catcher. Can you beat her? ekkyarya.com/?challenge=42&from=Rina |
| Recommend sticker | I recommend Ekky |
| Credit line (on every image) | Illustrated by Ekky Arya · ekkyarya.com |
| Desktop hero CTAs | Hire Ekky / See my work / Try the game |

---

## 5. Share-card design (1080 x 1920)

Rules for both variants: keep the top 220 px and the bottom 300 px free of key content (story apps put their UI there). The art is always Ekky's own original piece, never fan art or client work. The credit line and link are in the safe area in at least 32 px text, with contrast of 4.5:1 or better. Stickers come only from his doodles: cat, palette, planet, book, cassette, robot, mic, pin, the chosen face.

### Variant A: "Gallery frame" (coloring pages, legendary pulls)

```
y    0 ┌────────────────────────────┐  plain background in his palette (lavender #EDE9F6 or night purple)
     │  (safe margin, no content)   │
 220 │  [logo small]      [doodle]  │  logo 160 px wide, top-left; one doodle sticker top-right
 320 │ ┌────────────────────────┐   │
     │ │                        │   │  art 920 x 1150, white 24 px frame, 2 degree tilt,
     │ │        THE ART         │   │  soft shadow; a doodle sticker overlaps one corner
     │ │                        │   │
1470 │ └────────────────────────┘   │
1510 │   Colored by Rina            │  visitor name, 72 px bold (or "Pulled by Rina")
1600 │   Illustrated by Ekky Arya   │  credit, 40 px
1660 │  ( Your turn: ekkyarya.com ) │  call-to-action pill, 40 px, accent yellow
1620+│  (safe margin, no content)   │
1920 └────────────────────────────┘
```

### Variant B: "Player card" (Player Card, high score, challenge)

```
y    0 ┌────────────────────────────┐  night-sky background with a few stars (simple shapes)
 220 │   PLAYER CARD · LEGENDARY    │  ribbon, 36 px, rarity color
 300 │ ╔════════════════════════╗   │  trading-card frame in rarity color, rounded 48 px
     │ ║  [art window 860x860]  ║   │  the art (or the coloring)
     │ ║                        ║   │
     │ ║  RINA                  ║   │  visitor name, 88 px, on the card
     │ ║  42 stars · 3 colors   ║   │  stats line, 36 px
     │ ║  [cat][palette][planet]║   │  up to 3 earned doodle badges
1480 │ ╚════════════════════════╝   │
1520 │  Illustrated by Ekky Arya    │  credit, 40 px, white
1580 │  Beat me: ekkyarya.com/...   │  challenge link, 36 px, yellow
1620 │  (safe margin)               │
1920 └────────────────────────────┘
```

Text links in a story image are not clickable, so the shared post must also carry the URL in its text (Web Share API `text` + `url`). A small QR code next to the link would help, but it needs a QR encoder in the code; that is an integrator decision (no new packages without approval).

---

## 6. Coloring pages

Ask Ekky for **line-art layers (PNG, transparent, 2000 px)**. Tracing lines out of the colored JPGs gives muddy, broken outlines.

| Piece | Verdict | Why |
|---|---|---|
| Road Trip | **Best first page** | Thick even outlines, big simple shapes, lots of white space, five characters and a cat. Works on a phone with a finger. |
| Little Planet (self-portrait) | **Great** | Bold outline, every floating doodle is its own small shape, and coloring Ekky himself is a strong share. |
| Plug Hero | **Great, easy level** | One character, few large areas. Good as the 60-second first coloring. |
| Giraffe Ride | **Great, easy level** | Clear spots, fence and trees; simple. |
| Big Catch (Shark) | **Good** | Clear outline, big water splash shapes. |
| A Day in the Life | **Good** | Four simple panels; the visitor can color one panel at a time. |
| Tangled Hands | **Good, playful** | Bold outlines; fun to color as a rainbow knot. |
| Noodle Bath | **Good** | Bold outlines; the noodles are a nice challenge. |
| Afloat (Floating Boy) | **Good, medium** | Clean outlines; the water pattern adds many small areas. |
| Viking vs Dragon Kid | **Medium** | Clear outlines, but the lightning and fire effects are many small pieces; remove the effects layer. |
| Merdeka 77 | **Medium** | Good outlines; the dust and lightning need cleaning. A good seasonal page for August. |
| Monster World Doodles | **Medium** | Too many tiny shapes for one page; better as the sticker source. |
| Coexistence, Hidden Monster, Monster Snack Bar, Broken-Down Bus, The Blue Bird, Monster in My Room | **No** | Dense scenes; painted light, glow and texture carry the image. Line art alone would look empty or crowded. |
| Thinker & Doer, Type Is Art, Year of the Tiger | **No** | Lettering and tiny details; poor at phone size. |
| Astronaut, Radio Explorer (NFT) | **No** | 256 px only. |
| Retro Game Pattern and all fan art | **Never** | Fan art (asset rule 2). |
| All client pieces | **Never** | Client work (asset rule 2). |

---

## 7. Accessibility and readability

### Contrast (measured)

| Element | Now | Ratio | Fix |
|---|---|---|---|
| White text on coral #FF6B6B (Star Catcher, Earn coins, Final quest, "Lv" badge) | fail | 2.78:1 | Dark ink #2B1342 on coral (5.94:1), or white on #D13B3B (4.77:1) |
| Sidebar links, status and toggle, #7A7585 on #F4F4F4 | fail | 4.05:1 | #645F70 (5.59:1) |
| Muted text #7A7585 on white ("Hi!", roles, "Selected work", filters, tile categories) | just fails | 4.46:1 | Same token change to #645F70 |
| Game subtitles #cbbfe3 on #2f1f47 | pass | 8.6:1 | |

### Text too small (phone)

| Element | Size | Fix |
|---|---|---|
| Rarity labels on cards (LEGENDARY, EPIC) | 9.6 px | 12 px minimum |
| "Lv" badge | 10.4 px | 12 px |
| XP text | 10.9 px | 12 px |
| Trophy descriptions | 11.5 px | 13 px |
| Desktop tile category (uppercase) | 12 px | 13 px, or drop the uppercase |

### Tap targets under 44 px

| Element | Size | Fix |
|---|---|---|
| "Open the classic site" (also cut off at the bottom of the start screen) | 140 x 22 | 44 px tall; move it above the fold or into the menu |
| Card filter chips | 41 tall | 44 |
| Sound / Vibration switches | 50 x 28 | 44 px hit area |
| Settings buttons (Final quest, Reset, Open) | 38 tall | 44 |
| Game close buttons | 40 x 40 | 44 |
| Lightbox close / prev / next | 42 x 42 | 48 |
| Desktop social icons | 40 x 40 | 44 |
| Desktop dark-mode toggle | 120 x 24 | 44 tall |
| Sidebar links | 37 tall | 44 (mostly for touch laptops) |

### Motion

- Falling stars cross every game screen every 1.4 s, over titles and text (they cover "Art Collection" and "Completionist" in the captures). Show them only on the map and start screens, never while a sheet or the lightbox is open, and no more than 2 at a time.
- Confetti on opening level 2 covers the skill list it celebrates (phone-04). Fire confetti only on real wins (legendary pull, quest sent, level up), and behind the text.
- Achievement toasts queue up and cover the HUD and title for 2.3 s each; three at once means 7 s of covered header. Make them shorter (1.5 s), lower on the screen, and merged when several arrive together.
- Star Catcher uses a red screen flash and shake when you are hit. Keep them small, and remove both under reduced motion.
- With reduced motion, the stars are rightly off, but the hint "tap falling stars to collect coins" still shows. Hide it.
- Sound is on by default. Default it to off on the web (keep it on in the Android app) and show a clear sound toggle in the HUD.
- Desktop: typed words, custom cursor, magnetic buttons and parallax are already off under reduced motion. Good.

### Labels and semantics

- Sound and Vibration switches have no state; add `role="switch"` and `aria-checked`.
- The bottom sheet is a dialog with no accessible name; add `aria-labelledby` pointing to the level title. Move focus into it on open and back on close.
- The pack-pull card images use `alt=""`, but they are content; use the piece title.
- Emoji used as icons are read aloud as "waving hand", "crown" and so on. Once they are replaced with images, give each a meaningful alt, or `alt=""` when the text next to it says the same.
- The lightbox description is always empty (no `desc` data).

### Layout bugs found during the audit

- **The desktop lightbox is stuck to the top-left and its art is cut at the top** (`desk-lightbox.png`). Cause: the global reset `*{margin:0}` removes the `<dialog>`'s auto-centering. Fix: `dialog{margin:auto; max-height:92vh}`, and cap the art at about 70vh with `object-fit:contain`.
- The phone logo is a 182 px screenshot crop shown at about 390 px, so it looks blurry. Ask Ekky for an SVG or a 1000 px PNG.
- The start-screen logo touches the top edge (no safe-area padding).
- The classic phone view's game FAB overlaps the "I'm Ekky" headline.
- No Open Graph tags: shared links show no image today (plan feature 8).

---

## 8. Prioritized fix list

R1 = round-1 must-have. Owner: UX = copy, layout and curation; DEV = code; EKKY = an answer or file from the owner (flag via the integrator).

| # | R1 | Problem | Fix | Owner | Acceptance test |
|---|---|---|---|---|---|
| 1 | R1 | Contact details are placeholders | Real email, WhatsApp and profile links in `CONFIG` | EKKY, then DEV | No `example.com` or bare home-page URL in the built site; each link opens the right profile |
| 2 | R1 | Hire is 2 to 3 taps plus a scroll in game mode, and missing in the lightbox | Persistent "Hire Ekky" HUD chip; start-screen button; lightbox button; desktop "Hire Ekky" CTA; classic-phone header button | DEV (UX copy) | From every screen in the capture script (start, map, each level, cards, lightbox, pack, arcade result, trophies) one tap opens the Final Quest sheet or the contact section |
| 3 | R1 | Final Quest is a 4-field form that only works with a mail app | Quick actions (Email, WhatsApp, Copy email) above a 3-field form; reply-time line | DEV + UX | Sheet shows 3 one-tap actions above the fold on iPhone 13; form has no visitor-email field |
| 4 | R1 | Art not visible within 10 s | Desktop: lead-6 strip under the hero, above the fold at 1440 x 900. Phone: "Featured" row of the 6 on the start screen, each opening the lightbox | DEV (UX picks) | Screenshot at 2 s after load shows 6 pieces on desktop and at least 3 (with a swipe row) on the phone start screen |
| 5 | R1 | Emoji in the UI (57 characters, about 30 places) | Replace per the section 3 tables; one inline-SVG line-icon set for general controls | DEV (UX mapping) | The G2 emoji scan of the built site returns 0 |
| 6 | R1 | Game Pattern is unflagged fan art; no client or fan labels | Add `fan` and `client` fields; show "Fan art" and "Client: X" tags in the grid, cards and lightbox | DEV + UX | All 6 fan pieces and every client piece show their tag; none of them appears in icons, stickers, coloring or share cards |
| 7 | R1 | Two different "Ekky" avatars | Ekky picks one; use it for the HUD, token, FAB, Level 1 and hero wave | EKKY, then DEV | Only one face asset is referenced for "Ekky" |
| 8 | R1 | Titles guessed, no descriptions | Apply the section 2 titles and descriptions; confirm the "confirm" rows | UX, EKKY | Lightbox shows a description for every piece |
| 9 | R1 | Portfolio order and rarity do not follow quality | Reorder per section 2; Legendary = lead 6 + Little Planet + Morumelons | UX, DEV | The first 6 tiles in "All" are the lead 6; Tea Break and My Sports Club are Common |
| 10 | R1 | Contrast failures | Coral buttons use dark ink; `--muted` becomes #645F70 | DEV | Axe or a measurement script shows no text below 4.5:1 (3:1 for large text) |
| 11 | R1 | Text under 12 px, targets under 44 px | Sizes and hit areas per section 7 | DEV | Script finds no visible text under 12 px and no interactive element under 44 x 44 on iPhone 13 |
| 12 | R1 | Desktop lightbox off-center and cut | `dialog{margin:auto}`, max height, contained art | DEV | Lightbox is centered at 1440 x 900 and 1280 x 720; the whole image is visible |
| 13 | R1 | Share card needed for the share loop | Build Variant A for colorings and pulls, Variant B for scores; credit and link in the safe area | DEV (UX spec) | Generated PNG is 1080 x 1920, contains "Illustrated by Ekky Arya" and the link, no fan or client art; share in 3 taps or fewer |
| 14 | R1 | Coloring needs clean line art | Ekky supplies line layers for Road Trip, Plug Hero, Giraffe Ride, Little Planet (first four) | EKKY, then DEV | First coloring is shareable within 60 s on a phone |
| 15 | R1 | Motion overload (stars over text, confetti over content, toast pile-up, flash) | Rules in section 7 | DEV | No falling star over an open sheet or the lightbox; reduced motion hides the star hint and the flash |
| 16 | R1 | Icon crops that fail at 32 px | Use the replacements: pen hand (Skill Tree), yellow ghost (level 4), monster head (boss), line "send" icon, helmet crop, map pin (World Explorer), trophy cup (Trophies tab), virus (hazard) | DEV (UX picks), EKKY for cut-outs | Each icon rendered at 32 px is recognizable on both #2B1642 and white (screenshot review by UX) |
| 17 | | Hiring facts missing | Add "Worked with" row, location and time zone, languages, availability, "projects from" or "Get a quote" | UX, EKKY | All six facts appear on the desktop About section and in game level 1 |
| 18 | | Self-rated stat bars | Replace with facts (years drawing, clients, pieces delivered) | UX, EKKY | Level 1 shows no made-up percentages |
| 19 | | Labels and semantics | Switch roles and state, dialog name and focus, alt text for pulled cards | DEV | Screen-reader pass (VoiceOver) reads every control's name and state |
| 20 | | Blurry logo; Type Is Art blank first frame; NFT files 256 px | Ask for an SVG logo, a still for the GIF, and larger NFT files | EKKY, then DEV | Logo sharp at 3x; Type Is Art thumbnail shows lettering; NFT art at 1000 px or more |
| 21 | | Sound on by default | Off by default on the web, a HUD toggle | DEV | First visit makes no sound until the visitor turns it on |
| 22 | | Classic phone hero hides the name and CTA; FAB overlaps the headline | Shorter hero art on phones, name and "Hire Ekky" above the fold; move the FAB | DEV | iPhone 13 classic view shows the name and the CTA without scrolling; no overlap |
| 23 | | No link previews | Open Graph tags (site, then per card at build time) | DEV | Pasting the URL in WhatsApp shows the image, title and "Illustrated by Ekky Arya" |
| 24 | | Process has no real example | One sketch-to-final sequence of a lead piece | EKKY, UX | Process section and level 4 show the sketch and the final of the same piece |

### Questions for the owner (via the integrator)

1. Which avatar is you: the glasses guy on the little planet, or the blue-haired face?
2. Real email, WhatsApp, Instagram, Dribbble and Behance.
3. Clients and permission to name them: Tea Break, Morumelons, Fizzy Tube, MSI, Indomaret, Pop Mie (commission or pitch?), BCA, the "Web Illustration" banner, Thinker & Doer, Save Early, Buy Future, My Sports Club, Toybox, Plug Hero.
4. Do you own the rights to NFT #3 and #9? Can you send larger files?
5. Is the fire spirit in "RPG" your own design? Are "Beansproud" and "Puff" character names?
6. Line-art layers for Road Trip, Plug Hero, Giraffe Ride and Little Planet; cut-outs for the icon crops; an SVG logo.
7. Reply time, availability, and a starting price (or "quote only").
