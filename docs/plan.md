# Plan: the "Try Ekky" portfolio game

## Goal
A creative, out-of-the-box portfolio game, built with modern browser tech, that visitors enjoy, share without logging in, and that makes them recommend and hire Ekky Arya as an illustrator.
Every visitor should leave with something worth sharing, and every share should say "Illustrated by Ekky Arya", with a link back.

## The share loop
PLAY (map, cards, Star Catcher) → CREATE (color one of Ekky's drawings, earn a Player Card) → SHARE (one tap, no login: image + link) → FRIEND OPENS the exact card or challenge → RECOMMEND or HIRE ("I recommend Ekky" sticker, Final Quest contact form) → new player.

## Feature ideas (ranked)
1. Color with Ekky: color one of his drawings with his palette and his doodles as stickers (canvas, pointer events, pressure).
2. Share cards: story-sized image of a coloring, Player Card, legendary pull or high score, with Ekky credit + link (canvas → Web Share API with files; download fallback).
3. Challenge links: `?challenge=42&from=Rina`, `?card=blue-bird`; the friend lands straight on it.
4. "I recommend Ekky" stickers: one-tap reaction + first name → shareable testimonial image.
5. Wall of Love: NOT in round 1 (static only, no backend).
6. Holo legendary cards that follow phone tilt (DeviceOrientation; iOS asks permission once).
7. App-like: installable PWA, offline, View Transitions between screens.
8. Link previews: a static page per card with Open Graph tags, generated at build time.

## Asset rule
1. Every visual element (buttons, rewards, levels, achievements, game items) uses artwork Ekky made himself, and its meaning must fit.
2. Only Ekky's own characters and doodles become icons. Fan-art pieces (One Piece, Rocket & Groot, Spider-Verse, Adventure Time, Godzilla vs Kong) and client pieces (Indomaret, BCA, Pop Mie, Ancol, MSI) stay in the portfolio only: never icons, never in share cards, never coloring pages.
3. Truly general controls (close, back, next, check, replay, share, scroll up) use one consistent simple line-icon set (inline SVG). No emoji anywhere.
4. Gaps with no fitting Ekky asset yet (star/coin currency, sparkle): simple shapes in his palette until Ekky supplies a mini asset pack.

### Icon mapping
| Where | Ekky asset | Why |
|---|---|---|
| Level 1 "Who is Ekky?", game-mode button, hero wave | face drawing (`assets/face.png`) | it's him |
| Level 2 "Skill Tree" | "Hands" piece (`Artboard-1`, `assets/work/hands.jpg`) | craft |
| Level 3 "Art Collection", Cards tab | palette doodle (`assets/icon-cards.png`) | art |
| Level 4 "Doodle to Done" | a character from "Doodles" (`assets/work/doodles.jpg`) | doodle |
| Level 5 boss "Final Quest" | green monster from "Monster" (`assets/work/monster.jpg`) | a boss |
| Send message | paper plane from "Hello 2022" (`assets/work/hello-2022.jpg`) | sending |
| Card pack | "Toybox" box (`assets/work/toybox.jpg`) | box of goodies |
| Star Catcher button | astronaut from "NFT #3" (`assets/work/nft-3.jpg`) | space game |
| Star Catcher +3 / +5 / hazard | palette doodle / cat doodle / virus blob from "Virus and War" | |
| Lives | cat doodle, grey when lost | |
| Trophies: World Explorer / Legendary Pull / Completionist | planet doodle / glowing bird from "Blue Bird" / treasure chest from "Hidden Monster" | |
| Category icons | book, robot, cassette, microphone, planet (`assets/cat-*.png`) | already done |

## Roles (sub-agents of the integrator session)
- Game Director: the share loop, what is worth sharing, challenge rules, reward moments, coloring levels, balance. Writes `docs/game-brief.md`. No code.
- UX Portfolio: reviews as a hiring client; "Try Ekky" copy, which drawings become coloring pages, share-card design and credit line, paths to Hire Ekky, icon meanings. Writes `docs/ux-audit.md`, later edits content/layout.
- Game Developer: splits `index.html` into files (T0), builds the Ekky asset library (T1), then the features, performance and accessibility.
- Integrator: gates, merging, scorecard.

## Gates
- G1 plan gate: brief + audit merged into `docs/backlog.md` (tickets with owner, goal, acceptance test).
- G2 quality gate (every change): no console errors; every game screen captured on a phone viewport; animations smooth; reduced motion respected; no emoji in the site; no fan-art/client asset used as an icon or in share cards.
- G3 review gate: Director "is it fun?", UX "is the art and Hire Ekky clear?", then merge to `main`.

## Scorecard (round ends when all are met; max 2 rounds before checking with the owner)
| Pillar | Target |
|---|---|
| Fun | a full loop with no dead moment longer than 10 s |
| Showcase | 6 best pieces visible within 10 s of opening; art never locked behind coins |
| Share | a share card is made and shared in ≤ 3 taps; first coloring shareable within 60 s |
| Deep links | a shared link opens the exact card/challenge in < 2 s |
| Credit | every share image carries "Illustrated by Ekky Arya" + site link |
| Conversion | "Hire Ekky" reachable in 1 tap from every screen |
| Assets | zero emoji; only Ekky's own artwork as icons |
| Quality | G2 passes; no open bugs |

## Constraints
- Static site on GitHub Pages; also packaged by Capacitor (`npm run build` copies to `www/`). No backend in round 1.
- No new npm packages without the integrator's approval.
- Text users see is in English (the existing site's language).
- Contact email and social links are placeholders in `CONFIG` until the owner supplies real ones.
