# Motion: slow, calm, and every move has a reason (B39)

Owner direction: "don't make the animation too fast, make it slow but make sense". Every motion on the site and in the
game is listed here with what it tells the visitor. Anything not on this list was removed in the motion pass.

**Tokens** (`css/site.css`, `:root`): `--dur-fast` 250 ms (tap and press feedback only), `--dur` 500 ms (screens,
sheets, overlays), `--dur-slow` 1000 ms (reveals). Easing: `--ease-in` `cubic-bezier(.22,.61,.36,1)` for things
entering, `--ease-move` `cubic-bezier(.4,0,.2,1)` for things moving. No curve overshoots (no y value above 1).
Ambient loops run 9 to 48 s. At most one decorative loop per screen besides the sky.

**Reduced motion** (`prefers-reduced-motion: reduce`): every animation and transition is switched off
(`css/site.css`); content appears in place. Star Catcher keeps its falling items (that is the game) but drops the
shake, the hit tint and the particle bursts.

**Off-screen**: game screens that are not showing have their animations paused; skeleton shimmer stops as soon as
an image has loaded; the loader dots are removed once the page has loaded.

## Desktop site

| What moves | How | Why |
|---|---|---|
| Ekky's head next to "I'm Ekky" | waves twice, 3 s, at load | says hello: this is the person behind the work |
| Typed words after "I draw" | types and erases one word at a time | lists what Ekky draws without a wall of text |
| Hero illustration | floats 8 px over 10 s (the one loop on the hero) | Ekky's desk sits on a little planet in space |
| Stars behind the hero | twinkle over 9 s | the night sky of that planet (the sky) |
| Sections and tiles | fade up 12 px as you reach them, 500 ms | shows where new content starts as you scroll |
| Skill chips | fade up one after another | reads as a list, in order |
| Marquee of services | scrolls slowly, 48 s per loop, pauses on hover | a ticker of what you can hire Ekky for |
| Lightbox | fades in from 98 % size, 500 ms | the piece you tapped opens in front of the page |
| Tiles and buttons on hover | lift and change color, 250 ms | tells you what you can click |
| Toast | slides up, stays 2.4 s | confirms an action (copied, saved) |
| Loader | logo fades up, dots pulse until load, then gone | the page is still loading |
| Confetti | once, when the contact form is sent | a real win: the message is on its way |

Removed: logo Y wiggle, status ping, floating doodles bob, planet spin, blinking eyes, typing arm, screen glow,
half-moon spin, shooting stars, background blob morph and spin, button sheen, category icon bob, hover wiggles,
step "jelly", mouse parallax, magnetic buttons, 3D tilt, and the click sparkle burst.

## Game (phones)

| What moves | How | Why |
|---|---|---|
| Sky stars | twinkle over 9 s (the sky; no other endless loop on any screen) | the game lives in Ekky's night sky |
| Logo on the start screen | fades down 16 px once, 1 s | the first thing you see settles in |
| Screens | fade and rise 24 px, 500 ms | the new screen replaces the old one in place |
| Tab press | presses to 92 %, 250 ms | your tap registered |
| Tab indicator dot | slides under the active tab, 500 ms | shows where you are |
| Sheets (levels, Hire) | slide up from the bottom, backdrop fades in below the HUD | the sheet comes from the place you tapped and goes back the same way; Hire stays reachable above it |
| Art cards | fade up 12 px, one after another | the collection fills in, in order |
| Legendary card foil | one sweep, 2.4 s, then still | marks Ekky's most-used pieces once, without nagging |
| "Doodle to Done" steps | tick one after another, 0.6 s apart | the order of the process is the point |
| Toasts | slide down under the HUD, 1.5 s | confirms an action without covering the controls |
| Coloring: tapped shape | the new color fades into the shape, 250 ms | shows exactly which shape changed |
| Coloring: hint | slides in once, then away | the one rule, shown once |
| Stickers | follow your finger; the bin slides up while you drag | you are moving this sticker; drop it here to remove it |
| Reveal | fades in, 500 ms | yours next to Ekky's, to compare |
| Share video | the fills sweep in, stickers pop in, the credit fades in (5.5 s clip) | replays what you made, then says whose art it is |
| Star Catcher countdown | each number fades in and out, 0.8 s | time to get ready, with the one rule under it |
| Star Catcher items | fall (the game) | catch the stars, dodge the viruses |
| Star Catcher hit | small shake and a soft tint, 500 ms | you touched a virus (minus 2) |
| Star Catcher catch | a few particles and "+n" rise | what you caught was worth n |
| Result | title fades up, 1 s | the round is over, here is your score |
| Village places | still; a tapped place's label lifts 4 px and glows once (300 ms), then the place opens | "I'm going there" (the walkers, clouds, smoke, lantern and water of the village come in V3, within the B42 budget) |

Removed: the PLAY pulse, ring pings around map nodes, path dash crawl, tab icon wiggle, tab bounce, face idle sway
and "boing", category icon bob, logo float, island bob, card shimmer after load, endless holo, overshooting pops on
the countdown and result, the red hit flash, the whole-picture pulse on each fill, and first-coloring confetti over
the reveal.
