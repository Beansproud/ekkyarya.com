# Color tools (sprint 3)

The owner asked for "a bit more advance editor like corel. gradation etc brush" in Color, following the best practice
of coloring apps for children. Color's audience is children and casual phone visitors, so the bar is: more creative
power, still simple enough for a 5-year-old.

## 10 design rules

Drawn from what the best kids' coloring apps do (Toca Boca, Crayola Create and Play, Lake, Pigment, Happy Color,
Sago Mini).

1. **No fail states.** Every tap does something visible and nothing asks "are you sure?". A tool that has nothing to do
   (Undo with an empty history) is dimmed, never an error.
2. **Big icon tools, short words.** One row of tools, each a 44 px or larger button with an icon and a one-word label
   (Fill, Brush, Fade, Pattern, Eraser). A child who can't read picks by icon.
3. **One tool at a time, clearly on.** The active tool is filled in yellow; picking another switches off the last one.
   There is no hidden mode.
4. **At most one level of options.** A tool shows at most one strip of choices (3 brush sizes, a few gradients, three
   patterns). No menus inside menus, no sliders for size or opacity.
5. **Undo is always visible, and Redo next to it.** Both sit in the action row; every action (fill, stroke, gradient,
   pattern, eraser, sticker) is one Undo step, and the history survives closing the page.
6. **Ekky's lines are always on top.** Fills, strokes, gradients and patterns all go under the lines, so the drawing
   never gets lost and anything looks neat.
7. **Tools work inside the lines by default.** A brush stroke stays inside the shape where the finger first touched
   (Lake and Pigment's "smart fill"); a "Free" switch, off by default, lets older kids draw across shapes.
8. **Pretty by default.** Ready-made gradients and patterns come from Ekky's own palette, so one tap already looks good;
   the current color is always part of the gradient so the child's choice still counts.
9. **Instant, smooth feedback.** Strokes follow the finger at the screen's frame rate, a fill ripples from the tap, the
   swatch pops. Nothing loops; sounds and haptics are short and follow the existing sound and vibration switches.
10. **Saved without asking.** Everything autosaves to Mine (strokes as compact point lists); the reveal, thumbnails,
    share card and share video show exactly what was drawn. Pages are never removed.

## Tools

| Tool | Tap | Drag | Options (one strip) |
|---|---|---|---|
| Fill | fill the shape with the color | — | — |
| Brush | a dot | draw, kept inside the touched shape | Small, Medium, Big, Free |
| Fade (gradient) | round gradient from the tap | straight gradient in the drag direction | 6 ready-made gradients (3 start at your color) |
| Pattern | fill the shape with crayon, glitter or dots in your color | — | Crayon, Glitter, Dots |
| Eraser | clear the shape back to paper | rub out brush strokes | Small, Medium, Big |

Actions: Undo, Redo, Peek (hold), Stickers.

## Save format

`Game.st.colorings[page]` keeps `fills`, `custom`, `stickers`, `undo` as before and adds, only when used:
`fx` (region id to `{k:"lin"|"rad"|"cray"|"glit"|"dots", a, b, p}`) and `ink` (a list of strokes
`{c, w, r, e?, p:[x,y,...]}` in page pixels, and region clears `{x:r}`). Older saves open unchanged; `fills` still
holds a plain color for every gradient or pattern shape, so share links and older readers show a sensible picture.
