# Asks for the owner or Ekky

These are not blocking: everything they unlock is ready behind a switch that stays off.

1. **Hand lettering:**
   - **What:** these words in Ekky's hand, one per file, written exactly as the page says them (UX lead, 21:20; the lettering must match the heading's real text). File name, then English, then Indonesian (`<name>-id.png`):

     | File | English | Indonesian |
     |---|---|---|
     | `hi.png` | Hi! | Halo! |
     | `selected-work.png` | Selected work | Karya pilihan |
     | `about.png` | About Ekky | Tentang Ekky |
     | `portfolio.png` | Portfolio | Portofolio |
     | `lets-make.png` | Let's make something | Yuk, bikin sesuatu |
     | `sketchbook.png` | Fresh from the sketchbook | Baru keluar dari buku sketsa |
     | `color.png` | Color | Mewarnai |
     | `catch-stars.png` | Catch stars | Tangkap bintang |

     Without an Indonesian file, the Indonesian page keeps the typed heading. If a heading's wording changes later, its file is dropped until Ekky re-letters it.
   - **Format:** PNG with a transparent background, dark ink, drawn at 2x the size it shows (about 600 x 120 px for a heading), cropped tight to the letters.
   - **Unlocks:** `FEATURES.handLettering` (js/features.js). Drop the files in `assets/hand/` and add each file name to `assets/hand/index.json`. Only listed files are loaded; the heading text stays the accessible name.
2. **A photo or quick self-portrait of Ekky at his desk:**
   - **Format:** `ekky.jpg`, portrait (4:5), at least 960 x 1200 px, under 200 KB.
   - **Unlocks:** `FEATURES.aboutPhoto`, the photo slot in About (taped on like the art). Drop it in `assets/hand/` and add `"ekky.jpg"` to `assets/hand/index.json`.
3. **A one-line handwritten note:** "Thanks for stopping by, Ekky".
4. **Client pieces as village scenery:** a yes or no (`FEATURES.clientScenery`).
