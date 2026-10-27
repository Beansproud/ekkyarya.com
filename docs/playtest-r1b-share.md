# Playtest r1b: the share loop

Author: Game Director. Date: 2026-10-27.

**Build tested:** branch `dev/assets` at `e084bea`: coloring (B10), stickers and the Doodle Scene (B21), share cards (B11), coloring links (B12).

**How:**
- `scripts/capture.cjs` over HTTP (0 errors, 0 emoji, nothing skipped except the picker's close button).
- A first-time-visitor driver on the iPhone 13 viewport. It counts every tap and times it, intercepts `navigator.share` to capture the real file and text, then opens the shared link in a fresh browser and compares the friend's picture pixel by pixel with the player's.
- The same flow on desktop at 1440 x 900, catching the download and reading the clipboard.
- Loading timed on a fast connection and on an emulated slow 4G (150 ms latency, 1.6 Mbit/s).

The r1a fixes are not in this build, as expected, so they aren't repeated here.

## Verdict

**The loop works end to end, and it's simple.**
- A first-time visitor colors the Giraffe and reaches the system share sheet in **17 s**, with 2 taps after Done (3 counting the app pick).
- The friend's link reproduces the picture exactly.
- Desktop downloads the card and copies the link.

**Two things hold it back:**
1. **Speed when a friend opens a link:** the loader covers the friend's coloring until 2.3 s on a fast connection, and the coloring takes 9.4 s on slow 4G.
2. **Little room for creativity on the Giraffe page:** about half the picture is a single region, so most colorings will look alike.

## Results

| Check | Result | Evidence |
|---|---|---|
| Color, then share or download, in ≤ 3 taps after Done | **Pass: 3** | Done → "Share" on the reveal (1) → "Share" in the preview (2) → the app in the system sheet (3). |
| First coloring shareable within 60 s of opening | **Pass: 17 s** | From page load: start screen visible at 0.25 s; a 1.5 s pause to read; Color tile; Giraffe; 10 fills with a color change each; Done; Share; Share. `navigator.share` received at 17.0 s. |
| Share payload | Pass | `ekky-giraffe.png`, 1080 x 1920, 1.3 MB, `image/png`. Text: "I colored a drawing by Ekky Arya. Your turn: {link}", with the link in the text (it survives apps that drop text next to files). |
| Credit on the card | Pass | "Illustrated by Ekky Arya · ekkyarya.com" in white, about 36 px, above the bottom safe zone, plus the yellow "Your turn: ekkyarya.com" pill. |
| Friend's link lands on the exact coloring | **Pass** | The fresh browser opens `?color=giraffe&f=v1.…`. The arrival view's canvas matches the player's canvas: mean difference 1.3 out of 765 per pixel (resampling only), 0.0 % of pixels differ noticeably. Title: "Someone colored Ekky's Giraffe Ride" (with `from=Rina`: "Rina colored…"). The address bar is cleaned to `index.html`. |
| Friend's link under 2 s | **Fail on screen** | On a fast connection, the arrival view is ready at **0.7 s**, but the loader logo stays on top until **2.3 s**. On slow 4G, the loader goes at 4.7 s and the coloring only appears at **9.4 s**. |
| Bad link | Pass | A broken `f` value opens the normal start screen, with no error. |
| Desktop | Pass | The PNG downloads as `ekky-giraffe.png`, the clipboard holds the link, and the toast says "Image saved, link copied". |
| Hire Ekky one tap away | **Pass except the page picker** | Coloring screen (top bar), reveal, share preview and arrival all have Hire. The page picker ("Color with Ekky") covers the HUD and has none. |

## Fixes, ranked by impact

| # | Fix | Why it matters | Owner | Size |
|---|---|---|---|---|
| 1 | **Deep links skip the loader.** On `?color=` (and every arrival link), hide the loader as soon as the arrival view is drawn, not on the fixed timer after the load event. | The friend sees the coloring at 0.7 s instead of 2.3 s: the scorecard's "< 2 s". | DEV | S |
| 2 | **Load the arrival first, defer the rest.** On an arrival link, fetch only `page.js` and `line.png` before drawing. Start the start-screen thumbnails (628 KB) after the arrival is shown. | Slow 4G: 9.4 s today. The arrival needs about 370 KB; the page loads 1.75 MB before it. | DEV | S |
| 3 | **Shrink the two biggest files.** `assets/color/giraffe/line.png` is 336 KB: save it as an indexed or 1-bit-plus-alpha PNG (lines on transparent), about 40 to 60 KB. `assets/hero.png` is 300 KB and loads on every visit only for the 48 px HUD avatar and the Star Catcher hero: add a 2x cut-out of the glasses guy (about 15 KB) and use it there. | First load on phones, for both the visitor and the friend. | DEV | S |
| 4 | **More regions for the coloring page.** The Giraffe has 46 regions, but the background is one region (51 % of the picture) and the giraffe's body another (15 %). In the driver, 10 taps filled only 5 distinct regions. Split the large regions along Ekky's own lines where the line test allows it (sky versus ground behind the fence, giraffe neck versus body), and ship a second page with more closed shapes (Road Trip or Plug Hero). | Creativity (owner: "users can creatively use this website"). Today most results will look alike. | DEV, DIRECTOR (review) | M |
| 5 | **Add Hire Ekky to the page picker.** | Scorecard: Hire in one tap from every screen. | DEV | S |
| 6 | **Show all 12 colors at once.** The color row shows 7.5 of 12 swatches with no sign that it scrolls, so the "any color" swatch is out of sight. Use 2 rows of 7 at 44 px (12 colors, "any color", plus 1 spare). | Players don't find most of the palette. | DEV | S |
| 7 | **The "Tap a shape to fill it" hint is half hidden** above the drawing's top edge (the stage clips it). Put it inside the visible area, or under the top bar. | First-use clarity. | DEV | S |
| 8 | **Confetti on the first Done covers the "Yours" and "Ekky's" labels** of the reveal. Fire it from the edges and behind the two pictures, or only around them. | Readability, motion direction. | DEV | S |
| 9 | **The card prints "ekkyarya.com"** while the link it shares uses the page's own address (GitHub Pages today, `CONFIG.siteUrl` empty). Print the host of the shared link until the domain question is answered. | Credit row: a friend typing the printed address must land on the site. | DEV | S |
| 10 | **No name gives a weak headline.** Without a name, the card's line under the picture is only "Ekky's Giraffe Ride" in small grey text. Use "My Ekky coloring" as the headline (the brief's fallback), in the same size as "Colored by Rina". | The card's top half reads as empty. | DEV, UX copy | S |

## Is it fun and simple?

**Simple: yes.** Three taps get you into a page, filling is instant, Done is always available, and the reveal ("Yours and Ekky's") is a lovely moment: you see his original next to yours.

**Fun: good start, held back by the page.** The fills are satisfying but coarse: two taps color most of the picture. Stickers help a lot. The capture run placed the ghost and the blue-haired face on the giraffe, which already makes the result yours. More regions (fix 4) and a second page will do the most for fun. Not verified here: pinch-to-scale and rotate on a real touch screen (the emulator only drags). Check them on a phone at B19.

## Motion (new screens only; the r1a table still applies to the rest)

| Animation | Now | Verdict | Fix |
|---|---|---|---|
| Overlay open (`overIn`, coloring and share) | 250 ms fade | OK | Keep, at 300 ms. |
| Fill feedback (`cPop`) | The whole picture pulses to 1.012 over 160 ms; the color appears instantly | OK, but it is the whole page, not the shape | Fade the new color into the region over 200 ms, and drop the whole-page pulse. The filled shape is what should move. |
| Hint (`.c-hint`) | Slides in with overshoot `cubic-bezier(.2,1.4,.4,1)` | **Too bouncy** | 300 ms ease-out, no overshoot. |
| Peek | 200 ms cross-fade | OK | 300 ms, to read as "here is Ekky's version". |
| Sticker bin | Slides up in 200 ms when you drag | OK, meaningful | Keep. |
| First-Done confetti | Covers the reveal labels | **Too much** | Fix 8. None under reduced motion. |
| Toggle switch (`.g-switch`) | Overshoot | **Too bouncy** | 200 ms ease-out. |
