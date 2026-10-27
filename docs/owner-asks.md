# Asks for the owner or Ekky

These are not blocking: everything they unlock is ready behind a switch that stays off.

1. **Hand lettering:**
   - **What:** these words in Ekky's hand, one word or phrase per file. File names in brackets:
     Hi! (`hi.png`), About (`about.png`), Work (`work.png`), Hire me (`hire-me.png`), Selected work (`selected-work.png`), Color (`color.png`), Catch stars (`catch-stars.png`).
     Optional Indonesian versions of the same words (the wording comes from the UX lead), with `-id` added to the name, for example `about-id.png`. Without an Indonesian file, the Indonesian page keeps the typed heading.
   - **Format:** PNG with a transparent background, dark ink, drawn at 2x the size it shows (about 600 x 120 px for a heading), cropped tight to the letters.
   - **Unlocks:** `FEATURES.handLettering` (js/features.js). Drop the files in `assets/hand/` and add each file name to `assets/hand/index.json`. Only listed files are loaded; the heading text stays the accessible name.
2. **A photo or quick self-portrait of Ekky at his desk:**
   - **Format:** `ekky.jpg`, portrait (4:5), at least 960 x 1200 px, under 200 KB.
   - **Unlocks:** `FEATURES.aboutPhoto`, the photo slot in About (taped on like the art). Drop it in `assets/hand/` and add `"ekky.jpg"` to `assets/hand/index.json`.
3. **A one-line handwritten note:** "Thanks for stopping by, Ekky".
4. **Client pieces as village scenery:** a yes or no (`FEATURES.clientScenery`).
