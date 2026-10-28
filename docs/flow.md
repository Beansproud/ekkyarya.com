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

## Where steps live

| Piece | Where its steps are written |
|---|---|
| Built-in (`PROJECTS` in `js/data.js`) | `steps` and `flow` on the entry itself. |
| Added in admin (`data/site.json` `projects[]`, has `uid`) | `steps` and `flow` inline on that project object. |
| Built-in, steps given from admin later | `data/site.json` top-level `"flows": { "<built-in title>": { "flow": "...", "steps": [...] } }`. The merge supports it; the admin UI of this sprint edits steps on added pieces only. |

## Paths and validation (js/site-data.js merge, js/admin-art.js validatePiece)

- A step path must match `^assets/work/(thumb/|s/)?(u/)?[a-z0-9-]+\.(jpg|jpeg|png|gif)$`. Anything else drops that
  step (never the whole piece).
- Admin uploads step pictures with the same resize as a piece (1600 px full, 480 px thumb, JPEG 0.82) to
  `assets/work/u/<piece-slug>-s<n>.jpg` and `assets/work/thumb/u/<piece-slug>-s<n>.jpg`, through `ctx.addFile`.
- Captions are cleaned like every other string (no `<`, `>`; straight double quote becomes curly; emoji drops it).
- Owner rules hold for steps too: only Ekky's own pictures; a fan or client piece may have steps, but they stay in the
  portfolio and the Art tab like the piece itself (steps never feed coloring, stickers, share cards or the village).

## Where the flow shows

- Desktop lightbox (`js/site.js`): under the picture, a horizontal (zigzag when it wraps) diagram.
- Phone game (`js/game.js`): the viewer opened from an Art tab card and from a start page tile; vertical diagram.
- Each node is a sticker-like bubble with a hand-inked outline, a numbered badge and the caption, joined by hand-drawn
  arrows. Tapping a node opens that step's `full` picture. 44 px targets. A short entrance animation that plays once and
  is off under `prefers-reduced-motion`.
- Strings in `COPY` (`js/data.js`): `flow.process`, `flow.series`, `flow.step` (`Step {n}`), `flow.this`, `flow.open`.

## Content shipped

No network access to ekkyarya.com, so no sketches or process pictures could be fetched. The only honest grouping in
`assets/work/` is **Morumelons** (Ekky's own NFT collection): the landing page art, the Astronaut and the Radio
Explorer are pictures from the same project, so each of the three carries the same `series` flow. There is no real
process (sketch to final) example yet: the feature is ready for one as soon as Ekky sends the pictures.
