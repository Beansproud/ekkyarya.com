# Sprint 3: 3 hours (2026-10-28 14:50 to 17:45 UTC)

The owner, relaying Ekky (WhatsApp, 06:31): on the web the essence survives, on mobile it is getting vague. His old
site was project based: a project has several pictures, showing its flow or other pictures from the project; the new
site is a gallery of single pictures. The owner: "if there are project flow please create the flow but the bubble etc
follow his art style (but still diagram)" and, for admin and Color, "a bit more advance editor like corel. gradation
etc brush", following the best practice of coloring apps for children (Color) and of tools like Corel (admin, more
advanced).

## Team

| Role | Model | Owns | Branch |
|---|---|---|---|
| Product lead | Opus, this session | owner's words, merges, gate, `docs/owner.md`, this file, the board | `main` |
| Flow squad | Opus | projects with several pictures and their flow diagram (data model, web lightbox, game Art card, admin's steps editor in `js/admin-art.js`), `docs/flow.md` | `sprint3/flow` |
| Color squad | Opus | Color (Mewarnai, Doodle Scene): brushes, gradients, textures, eraser, zoom; `js/color.js`, the Play part of `css/game.css` | `sprint3/color` |
| Admin editor squad | Opus | an image editor in admin (crop, adjust, layers, brush, gradient, text, history) in new files `js/admin-editor*.js`; hooks into the upload in `js/admin-art.js` with one call only | `sprint3/editor` |
| QA and critic | Sonnet | from 16:00: tests the merged main on phone, iPad and desktop against these goals, art critic notes; docs only | `sprint3/qa` |

## Rhythm

| UTC | What happens |
|---|---|
| 14:50 | Kick-off |
| every push | `bash scripts/gate.sh` must print `GATE PASS`; the lead merges passing branches about every 15 minutes |
| 16:15 | Mid-point: each squad pushes a working slice; QA starts on main |
| 17:25 | Code freeze: last pushes |
| 17:45 | End: final gate, report to the owner |

## Result (frozen 17:18 UTC, main = 62131a0)

| Squad | Shipped |
|---|---|
| Flow | Projects with several pictures: `docs/flow.md` contract (steps, optional `anim` and `set`), a hand-inked flow diagram (row on desktop, column on phones, zigzag on iPad, single lavender plates with yellow for "this picture"), thumbs-only first view, a step view with a visible "Back to the project" pill, Back/Esc/close reversible, steps editor in admin with Edit |
| Color | Brush that stays inside the touched shape (Free toggle), Fade (2-colour gradient, drag = straight, tap = round), Pattern, Eraser, Undo/Redo for every tool, pinch zoom; sideways phones get a tool column; each Back closes one layer; rules in `docs/color-tools.md` |
| Admin editor | `js/admin-editor.js`: crop with presets, rotate, straighten, adjustments, layers with blend modes, pressure brush, eraser, eyedropper, gradient (2 to 4 stops), text, shapes, history, zoom and pan; Back and Esc act as Cancel; 44 px controls; "Back to original"; plan in `docs/admin-editor.md` |
| Morumelons | Ekky's own collection as a project: landing page, 12 characters with official names in a grid (tap plays once, still under reduced motion), 10 Color stickers, Popstar and Clown walk in the village; `docs/morumelons.md` |
| Lead | Mobile to web and back on every device (sideways iPad fix) with an e2e round trip; ramen shop on the map |
| QA | `docs/qa-sprint3.md`: 2 P1 and 6 P2 found, all fixed except the 22 px "Pen pressure" checkbox; critic's top 3 applied except the bigger phone thumbnail (it moved the Art card after Back) |

Gate at the end: e2e 216 PASS, 0 FAIL; admin 122 PASS. 15 merges, every one through the full gate.

Open for next sprint: the pinch-zoom e2e fails under load and passes on retry; sideways phone and iPad show one flow node at a time; the editor's "Pen pressure" checkbox is 22 px; critic note 2 (bigger flow thumbnail on phones); Kaiju Costume and Dark Wizard stickers need a hand mask; the Guardian loop needs restarting before its 2 h limit.
