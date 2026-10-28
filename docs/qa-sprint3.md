# QA and art critic, sprint 3 (main cca4ff0)

Tested 2026-10-28 16:00 to 16:15 UTC on a fresh checkout of origin/main (`cca4ff0`), served with `python3 -m http.server`,
driven with Playwright (Chromium, touch emulation; not real Safari/WebKit). Matrix: iPhone 13 390x844, phone 360x640,
sideways phone 844x390, iPad upright 820x1180, iPad sideways 1180x820 (all touch, so they open the game) and desktop
1440x900 (mouse, web site), each light and dark, EN and ID: 24 configs, same script in each. Screenshots are small JPEGs in
`docs/qa-sprint3/`.

What was walked (all reversible unless listed below): Start, Art tab, Morumelons flow, node to step picture and back
(device Back, Esc, close, Back after close), each Color tool (Fill, Brush, Fade, Pattern, Eraser) with its options,
Undo all then Redo all (picture identical), pinch zoom in and out, Stickers tray, colour wheel, Back to picker and
reopen (work kept), Web chip then reload then Play then reload, admin editor (opened as `scripts/e2e-admin.cjs` does,
no PIN) with every tool, the phone Panel, Cancel button.

What is not covered: the PIN path, real Safari, a real finger, sound/haptics, Doodle Scene Back chain (my script's own
step broke there, so it is not claimed), editor Cancel with unsaved edits (only tested with none; code shows a native
`confirm`).

Result in one line: the owner's reversibility rule holds for the flow, Web/Play, Undo/Redo and zoom. Two P1s remain: Color
is unusable on a sideways phone, and the editor's Back leaves the site.

## P1

### P1-1 Color is unusable on a sideways phone (844x390)
Steps: phone 844x390, Start, Color, any page (e.g. Giraffe Ride). Size: the picture area is 824x34 px (the toolbar, colours
and option rows take the other 356 px); `#cEdit` does not scroll. Result: the drawing is a thin sliver, no tool can be used
on it. Same in light/dark, EN/ID. Not a dead end (rotate the phone), but a coloring app that shows no picture. At 360x640 the
picture is 340x284, small but usable; iPhone 390x844 gives 370x488.
Screenshot: `docs/qa-sprint3/land-color-sliver.jpg`.
Suggested fix: in a short viewport (height under 500) put colours and tools in a side column beside the picture.

### P1-2 Admin editor: phone Back leaves the whole page, edits lost
Steps: open the editor (`AdminEditor.open`, or Edit in the Art tab), paint something, press the browser/phone Back (390x844,
1440x900 identical). Result: the page navigates away from the site; the editor and its history are gone, no confirm.
`docs/admin-editor.md` ("Cancel, Esc and the phone's Back close the editor") promises the editor closes and the form keeps
its picture. `js/admin-editor.js` has no `popstate`/`pushState`; the only exit is the Cancel button. Cancel itself works
(returns `null`, editor closes, page intact).
Suggested fix: push a history entry on open, close on `popstate` (same `discard` confirm as Cancel).

## P2

| # | Finding | Exact steps and size | Screenshot |
|---|---|---|---|
| P2-1 | Editor: Esc does nothing | Open the editor, press Esc (all sizes). Dialog `cancel` is `preventDefault`ed and only resets Crop (`js/admin-editor.js:816`). The doc says Esc closes. | |
| P2-2 | Color: Back with the colour wheel open closes all of Color | Start, Color, page, tap the `+` swatch (wheel opens), device Back. Wheel, editor and picker all close, you land on Start (history state stays `color`, the wheel is not a layer). Work is kept, but one Back should close only the wheel. Phones and iPads, all configs. | `wheel-back.jpg` |
| P2-3 | Color: device Back from the editor skips the page picker | Start, Color, page, swipe/device Back: lands on Start. The on-screen arrow goes to the picker. Editor and picker share one history entry. Flow's step view has its own layer; Color does not. | |
| P2-4 | Editor targets under 44 px (doc says every target is 44) | All sizes, all tools: sliders (range) 159x42, 302x42, 366x42, 274x42, 90x42; colour inputs 38x38; "Pen pressure" checkbox 22x22; selects 40 high; text input 220x40; gradient stop sliders 90x42. Buttons and tools are fine (44+). | `iphone-editor.jpg` |
| P2-5 | Flow, desktop 1440x900: the diagram is below the fold | Desktop, open Astronaut (`show(...)` / click it in Work). Picture takes 570 px, "From the same project" starts at y=809 of a 864 px box; the lightbox needs scrolling and there is no cue. Nodes 1 and 3 show only their tops. | `desk-flow-below-fold.jpg`, `desk-flow-fold-light.jpg` |
| P2-6 | Flow, step view has no visible one-step Back | iPhone, Art, Morumelons, tap node 2. Back via device gesture or Esc works. On screen only X is visible, and X closes the whole lightbox (back to the Art list), not the step. The diagram (the other way back) is under the picture and needs a scroll. iPhone has no back button (owner 10-27). | `iphone-flow-step.jpg` |
| P2-7 | Flow on a sideways phone/iPad shows one node | 844x390 and iPad 1180x820: the flow sits in a side column or below a tall picture; only node 1 is visible, rest needs scrolling. Works, but the diagram is the point of the feature. | `land-flow-open.jpg`, `ipadL-sheet.jpg` |

## P3

- Flow step view keeps the piece title and description ("Morumelons, Landing page art...") while the picture is a different
  one; the step caption is never shown with its picture. iPhone, Morumelons node 2. `iphone-flow-step.jpg`.
- Color zoom: pinch to 4x works and pinch out returns to 1.00, but there is no Fit/reset button; a child who zooms by accident
  must pinch out. Phones and iPads.
- Color at 360x640: the hint "Tap a shape to fill it" sits over the drawing (top of the picture) and "Peek at mine" wraps to
  two lines. `s360-color-fade.jpg`. In zoomed state the hint and "Drop here to remove" are positioned outside the screen
  (audit "text-offscreen", only while zoomed).
- Editor: "Pen pressure" label contrast 2.6:1 (rgb 165,157,181 on 255,253,247) when disabled; on phones the tool bar shows 6 of
  10 tools and cuts "Gradient" in half as the only hint to scroll. `iphone-editor.jpg`.
- Desktop web home (mouse): footer/social/nav links and the theme toggle measure under 44 px. Mouse only, listed for
  completeness.
- Audit false positives, so nobody chases them: desktop dark flow captions flagged at contrast 1.0 are dark ink on the
  cream bubble (screenshot shows it is readable); editor "text-offscreen" is the sideways-scrolling tool bar.

Clean: no horizontal page scroll, no clipped text, no overlap, no target under 44 px on any game screen (Start, Art, Color
picker, Color editor, sheets, Web chip: 79x44 at 390, 44x44 globe at 360) in any of the 24 configs. Web then Play then reload
round trip passes at 390, 360, 844, 820 and 1180; Play is never covered. Undo x5 then Redo x5 restores identical pixels.
Flow Back, Esc, close and Back-after-close all return to the right place with the scroll position kept (phone, iPad,
sideways, desktop).

## Kids-app check of Color (could a 5-year-old use each tool without reading?)

| Tool | Without reading? | Fail state? |
|---|---|---|
| Fill | Yes. Bucket icon, tap a shape. The hint text is not needed. | None. |
| Brush | Mostly. Three dots for size are readable by sight. "Free" (stroke may cross shapes) is a word with no icon, and by default a stroke stays inside the shape where the finger started: a child who drags across the giraffe sees only part of the line and may think it broke. | Not an error, but the missing line looks like a bug. |
| Fade | Partly. The tool icon (a barcode-like block) says nothing; the six gradient swatches are clear. Tap gives a round fade, drag a straight one, and nothing tells the child. | None. |
| Pattern | Mostly. Dice icon is odd, the three options have a swatch but also words (Crayon, Glitter, Dots). | None. |
| Eraser | Yes. Eraser icon, sizes as dots; "Free" again a word. | None. |
| Undo / Redo | Yes. Arrows, dimmed when empty (no error). | None. |
| Peek, Stickers, colour wheel `+` | Peek is an eye plus words; Stickers is plus words; the rainbow `+` is clear. | None. |
| Zoom (pinch) | Natural, but no way to see you are zoomed or to reset. | Sideways phone (P1-1) is the real fail state: no usable picture. |

## Art critic: top 3 (docs/art-critic.md shape)

Round 1 of sprint 3, main cca4ff0, 16:15 UTC
1. Project flow diagram (phone, `iphone-flow-open.jpg`): simplify. Each bubble carries an outline, a coloured offset plate
   (yellow, red, green in turn), a numbered badge, an arrow and a label, and the plate colours rotate for no reason; Ekky's own
   work is one clean ink line and a few flat colours. Source: Ekky "too jam-packed", rubric Q1 and Q3. Smallest fix: keep the
   hand-inked outline, numbers and arrows, drop the rotating plate colour (one accent, his yellow, only on "this picture").
2. Project flow diagram, bubble layout: simplify. The thumbnail is about 95 px wide and the caption leaves the right half of
   every bubble empty, so the drawing is not the hero. Source: rubric Q2 and Q4, Ekky's portfolio (the art leads). Smallest fix:
   make the thumbnail fill the left two thirds of the bubble, or stack picture over caption.
3. Color tool bar (`iphone-color-brush.jpg`): simplify. Under the picture sit colours, an options row, five tools and four
   actions: four rows of chrome take about 42 % of an iPhone screen, and the solid yellow active tool is the loudest thing on
   the page, louder than the drawing. Source: Ekky "jam-packed", rubric Q1 and Q2. Smallest fix: make Undo, Redo, Peek and
   Stickers icon-only (the words add a row's worth of height) and give the active tool a yellow outline and tint, not a solid fill.
Protect: the wobbly hand-drawn arrows and outlines of the flow bubbles; they are the only place in the new work that looks
drawn by him. Nothing above removes them.
