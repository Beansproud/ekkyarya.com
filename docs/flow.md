# Project flow: the contract (sprint 3, flow squad)

Ekky, relayed by the owner (10-28): his old site was project based, a project had several pictures showing its flow
(sketch, process, final) or other pictures from the same project; the new site shows single pictures, so on mobile the
essence gets vague. Owner: "if there are project flow please create the flow but the bubble etc follow his art style
(but still diagram)".

A piece may carry **steps**: the ordered pictures of its project. A piece without steps works exactly as before.

## Shape

```json
{
  "title": "Morumelons",
  "flow": "series",
  "steps": [
    { "img": "assets/work/thumb/u/morumelons-s1.jpg", "full": "assets/work/u/morumelons-s1.jpg",
      "caption": { "en": "First sketch", "id": "Sketsa pertama" } },
    { "img": "assets/work/thumb/morumelons.jpg", "full": "assets/work/morumelons.jpg",
      "caption": { "en": "Final", "id": "Final" } }
  ]
}
```

- `steps`: 2 to 8 items, in order. Fewer than 2 valid steps means "no flow" (the piece shows as today).
  - `img`: thumbnail (about 480 px). `full`: the large picture opened from the node. Both required.
  - `caption`: `{en, id}`, each at most 60 characters, plain text, no emoji. Both may be empty (the node then shows only
    its number), but if one language is filled the other should be too (admin checks this).
- `flow` (optional): `"process"` (default: sketch, process, final; the heading reads "How it was made") or `"series"`
  (other pictures from the same project; the heading reads "From the same project").
- The piece's own picture should be one of the steps (usually the last for a process). The diagram marks the step
  whose `full` equals the piece's `full` as "this picture". If it is not in the list, nothing is added.

## Optional step extras: `anim` and `set` (additive; steps without them work exactly as above)

```json
{ "img": "assets/projects/morumelons/thumb/astro.jpg", "full": "assets/projects/morumelons/astro.jpg",
  "anim": "assets/projects/morumelons/anim/astro.webp",
  "caption": { "en": "The crew", "id": "Para kru" },
  "set": [ { "img": "...thumb/a.jpg", "full": ".../a.jpg", "anim": ".../anim/a.webp", "name": { "en": "Astronaut", "id": "Astronaut" } } ] }
```

- `anim` (on a step or a set item): a play-once animated WebP. Fetched only when it plays (tap, or hover with a mouse),
  plays once, then settles back on `full`. Never plays under `prefers-reduced-motion`; never loops.
- `set` (on a step): 2 to 24 items `{img, full, anim?, name {en, id}}`. A step with a set opens as a grid of its pictures
  (thumbnails first) instead of a single picture. Fewer than 2 valid items means no set.
- Paths may also be under `assets/projects/<project>/` (one optional sub-folder, e.g. `thumb/`, `anim/`), extension
  jpg, png, gif or webp. A bad `anim` or set item is dropped; the step stays.
- **Who draws them:** the flow core (js/site.js) draws the diagram and, for a plain step, shows `full`. The `anim`
  playback and the `set` grid are drawn by the project's own block through the hook below.

## The hook (stable; js/site.js)

- `window.FlowHooks = [fn, ...]`: after the diagram is drawn (every time the lightbox shows a piece, and on a language
  switch), each `fn(box, piece, steps)` is called. `box` is `#lbFlow` (hidden when the piece has no steps), `steps` is
  `stepsOf(piece)`. A hook adds its own block inside `box` and must not change the nodes.
- Tapping a node fires a cancelable `flowstep` event on `#lightbox` with
  `detail = {piece, step, index, node}`. A hook that handles the step (a set, an animation) calls `preventDefault()`;
  otherwise the core shows `step.full`.

## Where steps live## Where steps live

| Piece | Where its steps are written |
|---|---|
| Built-in (`PROJECTS` in `js/data.js`) | `steps` and `flow` on the entry itself. |
| Added in admin (`data/site.json` `projects[]`, has `uid`) | `steps` and `flow` inline on that project object. |
| Built-in, steps given from admin later | `data/site.json` top-level `"flows": { "<built-in title>": { "flow": "...", "steps": [...] } }`. The merge supports it; the admin UI of this sprint edits steps on added pieces only. |

## Paths and validation (js/site-data.js merge, js/admin-art.js validatePiece)

- A step path must match `^assets/(work/(thumb/|s/)?(u/)?|projects/<project>/(<folder>/)?)[a-z0-9-]+\.(jpg|jpeg|png|gif|webp)$`. Anything else drops that
  step (never the whole piece).
- Admin uploads step pictures with the same resize as a piece (1600 px full, 480 px thumb, JPEG 0.82) to
  `assets/work/u/<piece-slug>-s<n>.jpg` and `assets/work/thumb/u/<piece-slug>-s<n>.jpg`, through `ctx.addFile`.
- Captions are cleaned like every other string (no `<`, `>`; straight double quote becomes curly; emoji drops it).
- Owner rules hold for steps too: only Ekky's own pictures; a fan or client piece may have steps, but they stay in the
  portfolio and the Art tab like the piece itself (steps never feed coloring, stickers, share cards or the village).

## Where the flow shows

- Desktop lightbox (`js/site.js` `renderFlow`): a zigzag row under the title and buttons (scrolls sideways past 5 steps).
- Phone game: the same lightbox, opened from an Art tab card or a start page tile; a vertical diagram right under the
  description, before the buttons. Art cards and start tiles of a piece with steps carry a small "3 pictures" sticker.
- Each node is a sticker-like bubble with a hand-inked outline, a numbered badge and the caption, joined by hand-drawn
  arrows. Tapping a node opens that step's `full` picture. 44 px targets. A short entrance animation that plays once and
  is off under `prefers-reduced-motion`.
- A node shows its step's picture in the lightbox (the piece's own step brings the piece back); it is marked
  `aria-current="true"`.
- **Reversible path** (owner, 10-28: "please make sure the flow have reversible path"): a step's picture is its own layer
  (`#lightbox.fl-viewing`, the `flstep` entry in `LAYERS` in js/game.js, which also runs on the desktop site). Back
  (button or phone gesture) and Esc return to the piece with its flow, the lightbox still open and the step's node focused;
  the piece's own node does the same. Back again, or the close button, returns to exactly where the lightbox was opened
  (same tab, same scroll, no stale history entry). Layers that close together go back in one history step.
- Strings in `COPY` (`js/data.js`): `flow.process`, `flow.series`, `flow.step` (`Step {n}`), `flow.this`, `flow.open`, `flow.count`.

## Admin (js/admin-art.js)

The piece form of an added piece has a "Project flow (optional)" box: what the pictures show (process or series), Add
pictures (several at once, resized like the piece), Add this piece's own picture, EN and ID captions, up and down
buttons, a drag handle, remove, and Edit (opens the step picture in the image editor through `AdminArt.editImage`;
Cancel leaves it untouched; the piece's own picture is edited with the main Edit). Save writes `flow` and `steps` on the piece and queues the step pictures for the next
Publish commit. `validatePiece` refuses 1 step, more than 8, a caption in one language only, a caption over 60
characters, and emoji (`AdminArt.validateSteps`). Built-in pieces have no edit form, so their steps stay in `js/data.js`
(or `flows` in data/site.json written by hand) for now.

## Tests

`scripts/e2e.cjs` (iPhone 13 and desktop 1440, light and dark, EN and ID): a piece with steps shows the column on the
phone and the row on the desktop, a node opens its picture, a piece without steps has no flow at all.
`scripts/e2e-admin.cjs`: steps in site.json merge and bad steps drop; the Art tab's steps editor adds, reorders, removes,
validates and saves steps with their files queued (driven without the PIN).

## Content shipped

No network access to ekkyarya.com, so no sketches or process pictures could be fetched. The only honest grouping in
`assets/work/` is **Morumelons** (Ekky's own NFT collection): the landing page art, the Astronaut and the Radio
Explorer are pictures from the same project, so each of the three carries the same `series` flow. There is no real
process (sketch to final) example yet: the feature is ready for one as soon as Ekky sends the pictures.
