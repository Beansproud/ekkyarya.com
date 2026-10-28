# Art notes

The art critic's top 3 per round, newest on top. Method and sources: `docs/art-critic.md`. Advisory, never blocking.

Round 1, main c907348, 04:30 UTC
1. Mewarnai, Doodle Scene and the Done reveal: simplify. The whole coloring overlay sits on a dark purple gradient even in light mode, so the game's priority screen is the one place that stops looking like Ekky's paper (and Doodle Scene's blank page is a flat yellow slab on it). Owner rule "game on light paper" (`docs/sprint-2.md` rules, `docs/backlog.md`), rubric 3. Smallest fix: give `.c-over` (`css/game.css:230`) the same paper background as the start page; leave the pages, swatches and buttons as they are.
2. Start page, idle effects: simplify. Gravity, magnet and scatter empty the grid or pile all six tiles over the Color button, flip mirrors the titles, each for 2 to 3 s, and the fun-fact bubble pops over a drawing at the same moment, so two big things move while nobody touched anything. Ekky "animasine niat bgt" and rubric 5 "one thing moves at a time" (the 10 effects stay: owner exception). Smallest fix: cap every effect so a tile never leaves its own slot (about 12 px travel and 6 degrees, no mirroring), keeping all 10 names.
3. Hire sheet: simplify. Email, Copy email, four underlined links, the price and a full form are stacked in one sheet, three ways to say the same thing, and on a 390 px phone the form runs under the tab bar. Ekky "jam-packed bgt", rubric 1. Smallest fix: cut the row of four links to the Instagram one only; Email, Copy email and the form stay.
Protect: the start page sketchbook wall: six of his drawings as taped, slightly tilted prints on paper, art first, one line of copy above. It is the most "his" screen on the site (the desktop hero with the moon desk is a close second).

Walked on Chromium with an iPhone 13 touch profile at 390 x 844, light and dark, EN and ID, plus desktop 1440; the owner
uses iPhone Safari (WebKit), so motion smoothness there is not confirmed by this pass. Flow: start, 60 s idle (facts at
10, 30, 60 s), a drawing, Mewarnai (5 fills, Done), Doodle Scene (a line and a sticker), Map, Ekky's home, Art, Mine,
EN/ID switch, Hire. All 10 idle effects captured frame by frame. Dark mode keeps the game on light paper as required; no
page errors.
