# Admin image editor (sprint 3)

Owner: "for admin ... can you add a bit more advance editor like corel. grdation etc brush ... best practice tools that
like corel ... admin pages more advance".

Ekky is a professional illustrator, so the editor follows the conventions he already knows from CorelDRAW / Corel
Painter, Photoshop, Procreate and Photopea instead of inventing new ones. It opens from the Art tab ("Edit" next to the
chosen picture), works at the picture's full resolution (long side up to 4096 px), and "Apply" hands one flattened
picture back to the existing upload flow, which still makes the 1600 px and 480 px JPEGs (`resizeFile`).

Files: `js/admin-editor.js` (the whole editor, its CSS inside the file like the other admin scripts). It is loaded only
when "Edit" is pressed (`js/admin-editor.js?v=<time>`, like the admin tab scripts); visitors never download it.

## Layout

| Area | Desktop and iPad landscape | Phone (narrower than 760 px) |
|---|---|---|
| Top bar | Cancel, title, Undo, Redo, Reset, Apply | Cancel, Undo, Redo, Panel, Apply (Reset in the panel) |
| Tool bar | Left column, one 44 px button per tool, the two colours below | A bottom bar of tools that scrolls sideways |
| Options bar | Under the top bar: the settings of the active tool (Photoshop / Photopea "options bar", Corel "property bar") | The same, scrolls sideways |
| Canvas | Centre, checkerboard where the picture is transparent, zoom and pan | Full width |
| Panel | Right column: Adjustments (when the Adjust tool is on), Layers, History | A sheet over the canvas, opened with "Panel" |

The editor stays on light paper in dark mode, like the rest of admin. Every target is at least 44 px. All text is in
English and Bahasa Indonesia, following the admin language switch.

## Tools

| Tool | Key | What it does |
|---|---|---|
| Move | V | Drag the active layer (text and paint layers; the photo too) |
| Crop | C | Crop frame with handles; aspect presets Free, 1:1, 4:5, 3:4, 16:9; Rotate left / right 90, Flip horizontal / vertical, Straighten slider (-45 to 45, fills the frame like phone photo apps); Enter applies, Esc cancels |
| Adjust | A (also Ctrl+L, Ctrl+U) | Brightness, Contrast, Saturation, Hue, Temperature, Levels (black point, midtones, white point), Sharpen on the active layer, live preview; "Apply adjustments" or "Reset" |
| Brush | B | Size, Hardness, Opacity, Pressure (pen pressure from pointer events changes the size; mouse and finger paint at full size), primary colour |
| Eraser | E | Same settings as the brush, erases to transparent |
| Eyedropper | I | Tap to pick the colour of the whole picture into the primary colour (Alt while painting does the same, like Photoshop) |
| Gradient | G | Drag to draw; Linear or Radial, 2 to 4 colour stops (colour and position), Opacity; drawn on the active paint layer, or on a new "Gradient" layer when the photo is active |
| Text | T | Tap to place a text layer; text, font (Fredoka, Poppins), size, weight, colour; the selected text layer stays editable |
| Shape | U | Rectangle, Ellipse, Line; fill and/or outline, outline width; drawn on the active paint layer or a new "Shapes" layer |
| Hand | H (or hold Space) | Pan |

Colours: primary and secondary swatches under the tools. X swaps them, D resets to black and white (Photoshop).

## Layers and history

- The photo is the bottom layer; "New layer" adds a transparent paint layer above the active one. Each layer has
  show/hide, opacity, blend mode (Normal, Multiply, Screen, Overlay), move up / down and delete. Ctrl+J duplicates,
  Ctrl+Shift+N adds a layer.
- History lists every step by name (Procreate / Photoshop history panel). Tapping a step jumps there; undo and redo are
  unlimited within the session: Ctrl+Z, Ctrl+Shift+Z or Ctrl+Y. "Reset" goes back to the picture as it was opened.

## View

Mouse wheel or trackpad pinch zooms around the pointer; two fingers pinch and pan on touch; Space-drag or the Hand
tool pans. Ctrl+0 fits the picture, Ctrl+1 shows 100 %, Ctrl+= and Ctrl+- zoom. Brush size: [ and ]; hardness:
Shift+[ and Shift+]; opacity: the number keys 1 to 0 (10 % to 100 %), like Photoshop.

## Apply and quality

Apply flattens the visible layers over white (JPEG has no transparency) at full resolution and returns a JPEG Blob at
quality 0.95; the form then runs the usual `resizeFile`. Cancel returns nothing and the form keeps its picture.

## For developers and tests

`AdminEditor.open(source, {lang})` takes a Blob, File, image URL or canvas and resolves to a Blob, or `null` on Cancel.
`AdminEditor.debug()` returns the size, layers and history count, and `AdminEditor.sample(x, y)` the flattened colour
at a picture pixel; `scripts/e2e-admin.cjs` uses them to test the editor without the admin PIN.
