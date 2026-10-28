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
