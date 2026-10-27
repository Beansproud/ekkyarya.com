# Minigames brief: "Paint Patrol" and "Little Planet Quest"

**Status: proposed by Game Director, pending UX lead approval.** For the UX lead to turn into backlog tickets. This brief does not change `docs/backlog.md`.

## Owner direction

Typed in the Game Director session, 2026-10-27, quoted exactly:

> "make some of minigames that work like real games portofolio
> game like metal slug *re-use all of his aset
> game like zelda but isomorphic *re-use all of his aset"

Owner answers, typed in the Game Director session, 2026-10-27: "yes paint and befriend is ok, sound effects only" (closes owner questions 2 and 5), and "use ekky as the hero, landscape is fine" (closes owner questions 3 and 4).

Read as two minigames that play like real games and work as a portfolio:
- **A run-and-gun side-scroller**, the genre Metal Slug made famous.
- **A top-down adventure in an isometric view**, the genre Zelda made famous ("isomorphic" is read as isometric).

Both are built **only from Ekky's own artwork**, and every one of his 29 original pieces (`kind: "original"` on `main`, 251fd97) has a role in at least one of the games (see the role table). This also follows the owner's direction "make sure all art work has its role".

The other owner directions still hold:
- simple (understood in one look);
- no lives, no trophies, nothing ever locked;
- de-gamified, play your way;
- slow, purposeful animation ("dont make the animation too fast make it slow but make sense");
- every feature switchable in `FEATURES`.

## Hard rules for both games

1. **Genre only, never the franchise.** These games borrow how a genre plays (run, jump, shoot, ride a vehicle; explore, talk, find, solve). They take nothing from the Metal Slug or Zelda games:
   - no names, logos or characters;
   - no music or sound effects;
   - no fonts, HUD look or iconic items (no hearts row, no triangle relic, no green tunic, no sword-in-stone, no rupee-like gems, no tank silhouette copied from those games).

   Neither franchise name appears in the user-facing text, the code or the page metadata.
2. **Only Ekky's own art.** Every sprite, background, prop and boss comes from a piece with `kind: "original"` that passes `shareable()`. Fan-art and client pieces never appear in the games. Simple shapes in his palette (plan rule 4) fill the gaps: tiles, paint blobs, the ground line, UI frames.
3. **No death, no game over, no lives, no score chase, no locks.** Getting hit has a short, readable consequence (knockback, a paint splash, half a second of slowdown) and is never punished. Every stage and every island area is open from the first second.
4. **Friendly, not violent.** The hero fires **paint**, not bullets. A painted enemy turns from grey-outlined to full color, smiles and wanders off as a friend. A boss isn't defeated: it is "colored in", calms down, and its artwork opens. This fits the site (color with Ekky), keeps it all-ages, and suits a client looking at a portfolio.
5. **Portfolio first.** Every character, place and boss names the artwork it comes from. One tap opens that piece in the lightbox, with its title, description and "Want art like this? Hire Ekky". The Hire Ekky chip stays visible whenever the game is paused, on every stage end and on every Quest dialog.

---

## Game A: "Paint Patrol" (run-and-gun side-scroller)

### One-line pitch
Ride through Ekky's illustrations as **Ekky himself** on his desk chair, paint every grey doodle monster back into color, ride the Broken-Down Bus, and color in four big bosses.

### Why this genre fits a portfolio
- His big scenes (Coexistence, Broken-Down Bus, Monster Snack Bar, Buried at the Beach) are already wide, layered and full of characters. They become parallax stage backgrounds almost as they are.
- His monsters (Monster World Doodles, Monster Snack Bar, Virus and War, Monster in My Room, Year of the Tiger, Big Catch, Boss Fight) are a ready-made cast of enemies and bosses.
- A client playing for 2 minutes sees more than 20 of his characters move, at full size, in his palette.

### Controls (as simple as possible)
| Device | Move | Jump | Paint | Paint bomb |
|---|---|---|---|---|
| Phone | Drag on the left half of the screen (a thumb stick appears where you touch) | Tap the right half | **Automatic:** fires forward at a steady rhythm whenever an enemy is ahead | Double-tap the right half (12 s recharge, shown as a filling palette) |
| Desktop | Arrow keys or A / D | Up, W or Space | Automatic (or hold X to aim up) | Z |

- **Landscape** (owner: "landscape is fine"). In portrait, a calm "Turn your phone sideways" card shows Ekky's chair turning, with a "Play anyway" button that runs a zoomed-in view.
- On first play, a hint shows once and fades after 4 s: "Drag to run, tap to jump. Painting is automatic."

### Rules
- **Painting:** each paint blob hits once. A normal enemy needs 3 hits, a big one 6, and a boss shows a "color meter" that fills as you paint it.
- **Getting touched:** the hero is knocked back about 120 px, gets a paint splash on his chair and is invulnerable for 0.8 s. Nothing is lost. There is no health bar.
- **Power-ups** (dropped by befriended enemies, no counters):
  - pen-hand = rapid paint for 6 s;
  - palette = a rainbow spread shot of 3 blobs for 6 s;
  - Plug Hero = he runs across the screen and paints everything in his path;
  - Astronaut helmet = a bubble shield that absorbs the next knockback.
  - The helmet kid from "Virus and War" = he runs in for 8 s and paints alongside Ekky, then waves and leaves.
- **Vehicle:** in stage 2, the Broken-Down Bus rolls in. Jump on its roof and it becomes a slow, sturdy moving platform with a big paint cannon (the bear, the lion driver and the caped hero ride along and cheer). Jump off at any time.
- **Stage end:** the stage's original artwork fades in, full screen and slowly (D-motion below), with its title, one line of description, "See it in the portfolio" and the Hire Ekky chip. Then "Next stage", "Pick a stage" or "Something else".
- **No score, no timer, no stars.** The stage-select screen shows which stages you've seen with a small painted frame, never as a percentage.

### Stages (each 60 to 120 s, all open from the start)
| # | Stage | Background (parallax layers cut from) | Enemies and friends | Boss |
|---|---|---|---|---|
| 1 | **Rush Hour** | Coexistence (the bus-stop street, the gargoyle commuter cheering from the bench) | Viruses from Virus and War; small doodles from Monster World Doodles | **The green one-eyed monster** from Monster in My Room (swings his hammer in slow, readable arcs; paint him to calm him down) |
| 2 | **Breakdown Road** | Broken-Down Bus (desert road, clouds, the city on the horizon); the Road Trip car honks past in the background | Monster Snack Bar monsters; Morumelons characters | **The tiger** from Year of the Tiger 2022 (leaps from the 2022 letters; a pounce is telegraphed by 0.8 s of crouching) |
| 3 | **Beach Day** | Buried at the Beach (sand) and Afloat (water, with the floating boy drifting by as a friend) | The crab from Buried at the Beach; the fish from Afloat | **The shark** from Big Catch (jumps out of the water in arcs; the fishing kid from the same piece cheers from the pier) |
| 4 | **Snack Bar Riot** | Monster Snack Bar (counter, fries, crowd); the Hidden Monster gate as the final door | Mixed doodles and Monster Snack Bar monsters; the Viking kid and the Dragon kid from "Viking vs Dragon Kid" join as allies who paint alongside you | **The armored giant** from "RPG" (the orc, mouse knight and fire spirit from the same piece are freed and cheer). The owner's "endi onok bossfight" may mean the owner wants a boss fight, or that the RPG piece has none; this use doesn't depend on the piece's title. See owner question 6. |
| Credits | **Parade** | The Character Crowd Banner scrolls past as a crowd of every friend you made, with the "Type Is Art in Motion" lettering as the title | Everyone you painted dances | none |

### Hero
**Ekky** (owner: "use ekky as the hero"). The game uses the image the owner confirms as Ekky (owner question 1 of `docs/backlog.md`; the glasses guy from Little Planet, per the owner's message in the Game Director session).
- **No redrawing:** the only full-body drawing of him is Little Planet, where he sits at his desk on a chair holding a stylus. So by default, **Ekky rides his desk chair**, cut out exactly as drawn. The chair glides along the ground (run), hops (jump), and the paint comes from his stylus.
- If Ekky sends a standing or running pose of himself (owner question 1 below), that drawing replaces the chair, with no other change.
- `CONFIG.games.hero` points to the sprite file, so it can be swapped later without code changes.

---

## Game B: "Little Planet Quest" (isometric adventure)

### One-line pitch
Walk around a small isometric island where every house, tree and character comes from one of Ekky's drawings. Meet his characters, help them, and find the artist at his desk in the middle.

### Why this genre fits a portfolio
- **The island is the portfolio.** Each area is a group of pieces, and each character you meet opens their artwork. A client explores his whole range in 3 to 5 minutes, in any order.
- Talking to characters gives a natural place for the UX lead's one-line descriptions ("A kid hitches a ride on a friendly giraffe.").

### Controls
| Device | Move | Interact |
|---|---|---|
| Phone | **Tap where to go** (the hero walks there along a path); or drag for direct control | Tap a character or an object next to you |
| Desktop | Arrow keys or WASD (8 directions), or click to walk | Space or E |

The glowing bird from "The Blue Bird" follows Ekky and flies slowly toward the nearest place you haven't seen yet. It is a gentle suggestion, never a requirement (principle 3).

### Rules
- **No combat, no health, no locks.** Every area is reachable from the start.
- **Optional little tasks**, which never gate anything. Seven characters have each lost a small doodle, scattered on the island: the book, cassette, microphone, robot, planet, palette and cat cut-outs from `assets/`. Bring it back and they do a short happy animation and say a thank-you line. That is the whole reward.
- **Painting the world** (ties to Color with Ekky): a few objects start as grey line art (a bridge, a fountain, the observatory dome). Tapping them with the pen-hand paints them in his colors over 1.2 s. It only changes looks, and there is always another way around.
- **The Sketchbook** (top right, `i-frame` icon) lists every artwork you have met, as thumbnails. It has no counter, no percentage and no "x of 29". Each thumbnail opens the lightbox.
- **Home base:** the hub is Ekky's desk on the Little Planet. The laptop gives three choices: "About me" (the hiring facts from B26), "Hire Ekky" (the Final Quest sheet) and "Show me everything" (the classic portfolio).

### The island (about 28 x 28 tiles, 11 areas)
| Area | Built from | Who you meet and what happens |
|---|---|---|
| **Hub: Little Planet** | Little Planet (the moon, the desk, the floating doodles) | Ekky's home base. His laptop on the desk offers "About me" (the hiring facts from B26), "Hire Ekky" (the Final Quest sheet) and "Show me everything" (the classic portfolio) |
| **Giraffe Meadow** | Giraffe Ride (fence, trees, grass) | The giraffe and the kid. Ride the giraffe to cross the island at 2x speed |
| **Noodle Bath House** | Noodle Bath | The kid in the bowl. The bowl walks on its noodle legs to a new spot every minute |
| **The Lake** | Afloat, Big Catch | The floating boy drifts in circles. The fishing kid is on the pier; the shark jumps at the end of his line |
| **Bus Stop** | Coexistence, Broken-Down Bus, Road Trip | The commuters on the bench. The broken-down bus with its passengers. The Road Trip car is a fast-travel ride to any area |
| **Market Street** | Morumelons, Toybox Packaging, Type Is Art in Motion | Morumelons characters run the stalls. Toybox boxes as crates you can push. The Type Is Art lettering as the street sign. The grey fountain to paint |
| **Ekky's House** | A Day in the Life (the four panels become four rooms) | Walk through his day. The phone on the table opens the island map (a plain frame in his palette) |
| **The Cliffs** | Viking vs Dragon Kid, Merdeka 77 | The two kids duel in slow motion. The cyclist from Merdeka 77 is a mail courier who rides you to the cliff top |
| **Monster Quarter** | Monster in My Room, Monster Snack Bar, Monster World Doodles | The green monster's house, the snack bar counter, doodle monsters wandering about |
| **Hidden Lair** (a small 3-room dungeon) | Hidden Monster, Tangled Hands, RPG | The two kids with the lantern. The mimic chest (it bites, then laughs). A "tangled hands" knot puzzle: rotate 4 tiles to untangle it and open a shortcut (the long way round is always open too). In the last room, the RPG party camps by a fire |
| **Observatory** | Astronaut (NFT #3), Radio Explorer (NFT #9), Secret Android | The astronaut stargazing. The radio explorer gives hints over the radio. The Secret Android robot opens up in his workshop |
| **Sky** | The Blue Bird, Year of the Tiger 2022, Virus and War, Plug Hero Mascot, Buried at the Beach | The hiker from The Blue Bird stargazing on a rock, with her glowing bird. The tiger lies in the sun by the gate. The helmet kid from Virus and War waves (the Paint Patrol hero, a link to Game A). Plug Hero winds himself up by the beach where the Buried at the Beach kid is stuck in the sand |

### Hero
**Ekky** (owner: "use ekky as the hero"), the same sprite as in Paint Patrol: by default Ekky on his rolling desk chair, cut out from Little Planet exactly as drawn, gliding from tile to tile. The glowing bird from The Blue Bird is his companion. Riding the giraffe swaps the chair for the giraffe until he gets off.

---

## Every original piece has a role

| Piece (slug) | Paint Patrol | Little Planet Quest |
|---|---|---|
| `android` | | Robot in the Observatory |
| `beansproud-vs-puff` | Allies in stage 4 | Cliffs duel |
| `blue-bird` | | **Guide bird**, the hiker in the Sky area |
| `coexistence` | Stage 1 background | Bus Stop |
| `day-in-life` | | Ekky's House (4 rooms) |
| `doodles` | Enemy pool | Monster Quarter, island props |
| `floating-boy` | Stage 3 water and a friend | The Lake |
| `giraffe` | | Giraffe Meadow, ride |
| `hands` | | Lair knot puzzle |
| `hello-2022` | Boss 2 (tiger) | Sky gate |
| `hidden-monster` | Stage 4 final door | Hidden Lair |
| `kemerdekaan` | | Courier on the Cliffs |
| `little-planet` | **Hero** (Ekky on his chair), title screen | **Hero** (Ekky on his chair), **hub** |
| `monster-crowd` | Stage 2 enemies, stage 4 background | Monster Quarter |
| `monster` | Boss 1 (green monster) | Monster Quarter house |
| `morumelons` | Stage 2 enemies | Market stalls |
| `nft-3` | Shield power-up | Observatory astronaut |
| `nft-9` | | Radio hints |
| `noodles` | | Noodle Bath House |
| `old-bus` | Stage 2 background, **vehicle** | Bus Stop |
| `plug-hero` | Dash power-up | Sky / beach |
| `road-trip` | Background car | Fast travel |
| `rpg` | Boss 4 (armored giant), freed party | Lair camp |
| `shark` | Boss 3 (shark) | The Lake |
| `summertime` | Stage 3 sand, crab | Beach by the Sky area |
| `toybox` | | Pushable crates |
| `type-is-art` | Credits title | Island title card, Market street sign |
| `virus-and-war` | Ally power-up (the helmet kid), virus enemies | Cameo (links to Game A) |
| `web-illustration` | Credits parade | |

Never used: the 8 fan-art pieces and the 9 client pieces on `main` (`CONFIG.reuse`; that now includes Oasis, My Sports Club, Save Early Buy Future and Thinker & Doer as client, and Pop Mie as fan). If the owner switches `client: true` later, client pieces still stay out of the games. Brand logos don't belong in a game world.

---

## Art production: from drawings to sprites

Ekky's pieces are flat, finished illustrations, not sprite sheets. Two routes, best first:

1. **Ekky's layered files** (owner question 1 below). Characters exported separately as transparent PNGs, about 1000 px tall. This is the cleanest result.
2. **Cut-outs from the published images**, extending `scripts/ui-assets.py` into `scripts/sprites.py` (Pillow + numpy, already in use; no new packages):
   - Pieces on plain backgrounds (Plug Hero, Giraffe Ride, Big Catch, Road Trip, Merdeka 77, Little Planet, Noodle Bath, the NFT pieces) cut cleanly by background removal.
   - Pieces with busy backgrounds (Coexistence, Monster Snack Bar, Broken-Down Bus, Hidden Monster, Virus and War, RPG) need a hand-drawn polygon mask per character, stored in the script as coordinates and reviewed on the contact sheet like the T1 icons.
   - Backgrounds are split into 2 to 3 parallax layers (sky, far, near) by cropping horizontal bands. Where a character covers the scene, a soft blur fills the gap behind it. **Nothing is redrawn:** every sprite is Ekky's own drawing exactly as he made it, only cut out and moved. No character is redrawn, traced, extended or imitated, and nothing comes from any existing game.

**Animation without new drawings: "paper puppet" motion.** Each sprite is one still cut-out, moved by code, like a paper cut-out theatre. It suits Ekky's thick-outlined style and needs no extra frames. Following the owner's "slow but make sense":
| Action | Motion | Duration | What it tells the player |
|---|---|---|---|
| Walk / run | A gentle up-and-down bob and a 4 degree lean forward | 700 ms per bob walking, 450 ms running | "I'm moving this way" |
| Idle | A slow breath: scale 1.00 to 1.02 | 2.4 s | "I'm alive, waiting" |
| Jump | Squash 6% before take-off, stretch 4% at the top | 120 ms, then 600 ms in the air | "I'm launching", without cartoon overshoot |
| Paint hit on an enemy | One white flash, then the color fills from the hit point outward | 150 ms flash, 900 ms fill | "That worked, it's changing" |
| Befriended | A small hop and a 360 degree turn to face away, then a calm walk off | 1.2 s | "It's a friend now, it's leaving" |
| Boss wind-up | A crouch and lean back before every attack | 800 ms | "Something is coming, get ready" |
| Knockback | Slide back, then a 10 degree tilt that eases out | 400 ms | "I got bumped", without a shake |
| Artwork reveal | Fade and a slow zoom from 96% to 100% | 1.4 s | "Here is the real piece" |

- No idle loops on top of other loops.
- Easing is ease-out (`cubic-bezier(.2,.7,.2,1)`) and never springy.
- Under reduced motion: no bob, lean, squash or zoom. Fades only.

---

## Technical approach

- **Folder:** `js/games/engine.js` (a shared engine of about 400 lines), `js/games/paint-patrol.js`, `js/games/planet-quest.js`, `js/games/levels/*.js` (stage and island data), and `assets/sprites/` (generated cut-outs plus one atlas per game).
- **Engine:**
  - Canvas 2D with `devicePixelRatio` scaling.
  - A fixed 60 Hz update loop with interpolated drawing.
  - Input from keyboard, pointer and touch, with the virtual thumb stick.
  - Camera with parallax, AABB collision, the puppet animator, and sound effects only, from the existing synth (owner: "sound effects only"; no music; honors the sound toggle; off by default on the web).
  - Pauses on `visibilitychange`.
  - No new npm packages. Isometric drawing uses 2:1 diamond tiles (64 x 32 px) and a depth sort by tile row plus height. Tap-to-walk uses A* on the tile grid.
- **Loading:** both games load only when opened (a dynamic `import()`, or a script tag added on demand). The portfolio's first load does not grow. Budget per game: JS under 40 KB gzip, sprites and backgrounds under 1.5 MB, first frame under 1.5 s on a mid-range phone after tapping.
- **Feature switches:** add `paintPatrol: true` and `planetQuest: true` to `FEATURES` (B38). Off means no entry point anywhere.
- **Entry points:** two tiles on the start screen next to Color and Catch stars ("Paint Patrol", "Little Planet Quest"), plus the map header. The UX lead decides placement.
- **Deep links:** `?game=patrol&stage=2` and `?game=quest&area=lake` open directly. A bad value opens the stage select or the hub.
- **Saving:** `localStorage` only: stages seen, Sketchbook entries, where you stand on the island. No account (owner: no login).
- **Accessibility:**
  - Every control has an accessible name.
  - Pause is always one tap or key (Esc / P) away.
  - In Quest, dialog text is real HTML over the canvas (readable by screen readers, 16 px minimum).
  - With reduced motion, screen shake and parallax are off.
- **Quality gate G2 applies:** no console errors, phone captures of every stage and area, zero emoji, no fan or client art (extend `npm run check` to scan `assets/sprites/` against the cut-out list).

---

## Proposed tickets (for the UX lead to number and slot)

| # | Ticket | Owner | Size | Depends | Acceptance test |
|---|---|---|---|---|---|
| MG1 | Shared mini engine | DEV | L (4 to 6 h) | B38 | A test scene runs at 60 fps on the phone viewport. Keyboard, touch drag and tap all work. It pauses when the tab is hidden. Reduced motion stops the bob and shake. |
| MG2 | Sprite pipeline and the first 12 cut-outs | DEV, UX (review) | L (6 h) | MG1 | `scripts/sprites.py` regenerates byte-identical PNGs. The contact sheet shows the Ekky-on-chair hero, 6 enemies, boss 1 and the stage 1 layers, each with clean edges on dark and on white. `npm run check` passes. |
| MG3 | **Paint Patrol vertical slice: stage 1 "Rush Hour"** | DEV | L (6 h) | MG1, MG2 | A first-time tester on the phone finishes stage 1 in 60 to 120 s without help. Nobody can lose. The Monster in My Room boss telegraphs every swing. The stage end shows Coexistence and opens it in the lightbox. Hire Ekky is reachable while paused and on the end screen. |
| MG4 | Director playtest of the slice | DIRECTOR | S | MG3 | A short report: fun, simple, motion feel (too fast / too bouncy / meaningless), ranked fixes. Go or no-go for MG5. |
| MG5 | Paint Patrol stages 2 to 4, bus vehicle, bosses 2 to 4, credits | DEV | L (8 to 10 h) | MG4 go | Each stage is selectable from the start and runs 60 to 120 s. The bus can be boarded and left at any time. Each boss telegraphs every attack for at least 0.8 s. |
| MG6 | Isometric engine: tiles, depth sort, tap-to-walk, dialog | DEV | L (6 to 8 h) | MG1 | On the phone, tapping any reachable tile walks the hero there along a path. Sprites draw in the right order behind and in front of each other. Dialog text is HTML and readable. |
| MG7 | Little Planet Quest island content | DEV, UX (lines) | L (8 to 10 h) | MG2, MG6 | All 11 areas exist and are reachable from the start. Every character opens its artwork. The 7 lost-doodle tasks work and gate nothing. The artist in the hub offers Hire Ekky. |
| MG8 | Character lines and stage names | UX | M | MG3, MG7 | One short line per character, in English, from the piece's description. Stage and area names approved. No franchise names anywhere. |
| MG9 | Entry tiles, switches, deep links, lazy loading | DEV | S (2 h) | MG3 | With `paintPatrol` or `planetQuest` off, its tile, link and route are gone. With both on, the portfolio's first load size is unchanged (± 1 KB). The deep links open the right stage or area. |
| MG10 | Director playtest of both games | DIRECTOR | S | MG5, MG7 | The report covers fun, simple, play-your-way, motion feel and "did a tester open at least 3 artworks?". Ranked fixes. |

Order: MG1 → MG2 → MG3 → **MG4 (go or no-go)** → MG5 and MG6 in parallel → MG7 → MG8 → MG9 → MG10. Total DEV time is about 46 to 56 h. The stage 1 vertical slice (MG1 to MG3, about 16 h) comes first, so the owner can see and feel a real game before the rest is built.

---

## Balance starting numbers (Director owns these; tuned in MG4 and MG10)

**Paint Patrol** (in world pixels; the hero, Ekky on his chair, is about 110 px tall):

| Setting | Value |
|---|---|
| Run speed | 200 px/s |
| Jump | about 1.6 hero heights high, gravity 1800 px/s² |
| Paint | 4 blobs per second at 650 px/s |
| Paint bomb | clears the screen, 12 s recharge |
| Enemy waves | every 3 to 5 s, at most 5 enemies on screen |
| Hits to befriend | normal 3, big 6, boss meter 40 |
| Boss attacks | every 2.5 to 3.5 s, each telegraphed for 800 ms |
| Stage length | 6 to 8 screen widths, about 90 s at a relaxed pace |
| Knockback | 120 px, 0.8 s of invulnerability |

**Little Planet Quest:**

| Setting | Value |
|---|---|
| Island | 28 x 28 tiles |
| Walk speed | 3 tiles per second (giraffe 6) |
| Dialog | at most 2 lines per bubble, 3 bubbles per character |
| Lost doodles | 7 |
| Guide bird | waits 6 s after you stop before it moves on |

---

## Owner questions

| # | Question | Safe default |
|---|---|---|
| 1 | Can Ekky export the main characters as separate transparent PNGs (layered files)? Priority: **Ekky himself standing or running** (a full-body pose; today there is only the seated one in Little Planet), the Blue Bird bird, the Virus and War helmet kid, the green monster, the tiger, the shark, the RPG giant. | Ekky rides his desk chair, cut from Little Planet. The other characters are cut from the published images (route 2); quality may be rougher on busy pieces. |
| 2 | Is it OK that the helmet kid's blaster fires paint, and that enemies are "colored in and befriended" rather than defeated? | **Answered:** "yes paint and befriend is ok". |
| 3 | Heroes | **Answered:** "use ekky as the hero". Ekky is the hero of both games. |
| 4 | Phone orientation for Paint Patrol | **Answered:** "landscape is fine". Landscape, with a "Play anyway" portrait fallback. |
| 5 | Should the games have their own short music loops, or stay with sound effects only? | **Answered:** "sound effects only". No music loops. Sound is off by default on the web. |
| 6 | "endi onok bossfight": did you mean you want a boss fight, or that the RPG piece has no boss fight in it? | The RPG giant is boss 4 in Paint Patrol either way. The piece's title is the UX lead's call. |
