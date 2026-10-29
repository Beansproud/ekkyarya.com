# Admin: the contract the admin squad builds on

Owner, 2026-10-28:
- "admin is page to configure anything add new art see incoming mesages and anything add social media";
- "to enter its an easter egg and give pin";
- "make it differnet easter egg to enter between web and mobile".

Owner's choices: **GitHub as the backend**, **PIN only**.

## How it works

- **Doors** (different on web and on a phone; neither shows any hint in the UI):
  - **Web (desktop site):** type `ekky` on the keyboard anywhere, unless the focus is in a text field.
  - **Phone (game mode):** tap the Ekky Arya logo on the start page 7 times within 3 seconds.
  - **iPad and other tablets:** they get the mobile version (owner, 10-28), so the phone door works: 7 taps on the logo.
    A touch screen that still shows the web site can also tap the web logo 7 times; a computer with a mouse keeps the
    typed door.
  - Either door opens a PIN pad: 6 digits, big 44 px keys, EN and ID, with a soft shake on a wrong PIN and a 30 s pause
    after 5 wrong tries.
- **The PIN is never in the code.** The site stores only
  `sha256("ekkyarya-admin:" + pin)` =
  `7c804fa1e00adf130631ae11cf0d38b9d97ff9117663687fb625c850eaf332e2` and compares hashes (`crypto.subtle`).
  Never write the PIN itself in code, docs, commits or messages.
- **The PIN only opens the admin screen.** Publishing needs the owner's GitHub token: a fine-grained token with
  Contents read and write on `rfim/ekkyarya.com`. He pastes it once in admin. It is kept only in that browser's
  localStorage, never sent anywhere but api.github.com, and can be removed with a "Forget this device" button. Without a
  token, admin works read-only.
- **Admin code loads in two steps.** A door loads only the PIN pad (`js/admin.js`); the admin screen (`js/admin-shell.js`
  and the tab scripts) loads only after the right PIN. Normal visitors download none of it.

## Data: `data/site.json`

The site loads it at start-up (`fetch('data/site.json', {cache: 'no-cache'})`). If it is missing or broken, the site
works exactly as today. It is merged over the built-in data in `js/data.js`:

```json
{
  "version": 1,
  "contact": { "email": "", "priceLine": { "en": "", "id": "" } },
  "links": { "instagram": "", "behance": "", "linkedin": "", "website": "", "tiktok": "", "youtube": "", "x": "" },
  "features": { "pageShark": true },
  "projects": [ { "uid": "u-<slug>", "cat": "illustration", "title": "", "desc": "", "img": "assets/work/thumb/u/<slug>.jpg",
                  "full": "assets/work/u/<slug>.jpg", "kind": "original", "roles": ["portfolio", "card"],
                  "id": { "title": "", "desc": "" } } ],
  "hidden": [ "<built-in title, or uid of an added piece>" ],
  "order": [ "<built-in title, or uid of an added piece>" ],
  "copy": { "en": { "<COPY key>": "text" }, "id": { "<COPY key>": "text" } }
}
```

- Added pieces carry `uid` (`u-<slug>`); `id` stays the Indonesian `{title, desc}` as in `js/data.js`. `hidden` and
  `order` name built-in pieces by title and added pieces by `uid`.
- Admin tabs get `ctx = {data, getData(), setData(full), addFile(path, base64), publish(), canPublish, lang}`: `addFile`
  queues an image for the next Publish commit.
- Empty strings mean "use the built-in value".
- `links` replace `CONFIG.links`, `features` override `FEATURES`, `projects` are added to `PROJECTS`, `hidden` removes
  pieces, `order` sets the featured order, and `copy` overrides `COPY` keys.
- Owner rules still hold: no emoji; fan art only as `kind: "fan"` and never in coloring or stickers; client pieces
  portfolio-only. `scripts/check.mjs` must run on the merged data too.

## Words: the `copy` overrides (tab Words / Kata-kata, `js/admin-copy.js`)

Owner, 2026-10-29: "please make sure all copywriting can be edited and evaluated in admin pages"; "those editor have
helper like the best in the industry grammar if english, and impression test".

- **What is editable:** every key of `COPY.en` and `COPY.id` in `js/data.js` (all `t()` strings), grouped by screen, with
  search and the filters All, Changed and Has issues. Each line shows its key, what it is for (and the comment above it
  in `js/data.js`), the built-in text and editable English and Bahasa fields side by side, each with Reset to built-in.
  `fact.count` is a number the site counts with and is not editable. The Words tab replaces the old Text tab.
- **Contract in `data/site.json`:** `"copy": {"en": {"<key>": "text"}, "id": {"<key>": "text"}}`, only keys whose text
  differs from the built-in one (Save drops a key that is back to the built-in text; an empty field means the built-in).
  - A text with `|` (`term.N` and `termHire.N` command|answer, `deal.N` title|body, `hero.words`, `hire.form.types`) is edited as one
    field per part and stored joined with `|`; it must keep the built-in number of parts.
  - A list (`hire.types`) is stored as a list of the same length.
  - Every `{placeholder}` of the built-in text (`{n}`, `{name}`, `{title}`, `{caption}`, `{host}`, `{url}`, `{best}`)
    must stay, and no unknown one may be added: admin blocks Save until it is fixed.
- **Merge (`js/site-data.js`):** an override is used only for a key that exists in `COPY`, as plain text (no `<` or `>`,
  a straight `"` becomes a curly one, no emoji), at most 600 letters (120 per list item), with every placeholder and the
  number of `|` parts kept; anything else keeps the built-in text. A trailing space of the built-in text (`lb.prefill`)
  is kept. When `COPY` changed, the page sets its text again in place the way a language switch does (`applyText()` and
  the `ekky:lang` event), at start-up and in Preview.
- **Checks** (`js/admin-copy-check.js`, results kept in the browser session only, never saved):
  - English grammar and spelling with LanguageTool (`https://api.languagetool.org/v2/check`, `en-US`), only on request:
    Check grammar on a line, or Check all English in the Report (batched, at most 18 requests and 60 KB a minute for the
    free API). The text is sent to LanguageTool and the admin says so next to the button. Matches show their message and
    up to five one-tap suggestions. A failed check says so; it never blocks Save.
  - Bahasa Indonesia, on the device: double spaces, repeated words, a capital after `.`, `!` or `?`, a space before
    punctuation, non-standard spellings (di mana, silakan, risiko, ...), English words inside Bahasa (soft).
    Ekky's casual voice (bikin, aja, bareng, ngobrol) is not flagged.
  - House rules for both: no emoji, no markup, one `!` at most, sentences of 20 words or fewer, Bahasa and English kept
    apart (soft), much longer than the built-in text. Jokes are allowed.
  - Readability: Flesch reading ease (English), words per sentence and letters per word, next to the built-in text.
  - Fit on the phone: the line is set in its real place on the site in hidden 360 and 390 px frames (its own font and
    width) and the lines it takes are compared with the built-in text; more lines or spilling out of its box is flagged.
    Lines that only screen readers hear, or that show in a sheet, toast or share text the frame cannot open, say so.
  - The 5-second impression test: pick a screen (the Hire flow: flash terminal, story card and steps; start page, Hire
    contact, About, desktop hero) and a language; its words show in a phone frame for 5 seconds, then hide; type what you remember and
    the test lists the key words remembered and missed.
- **Reversible:** a line opens in place; Save, Cancel and Back to the list close it. Back (phone), Esc, Cancel and Back
  to the list ask (Save, Discard changes, Keep editing) when the line has unsaved changes. Closing admin keeps an
  unsaved line as a draft ("Not saved") until the page is reloaded.

## Icons: style, own pictures and places (tab Icons / Ikon, `js/admin-icons.js`)

Owner, 2026-10-29: "kaya icon2 itu gaween bisa diganti ya"; "add option to change all icon with differnt art style";
"user can choos their own icon for speeisfic pages or button".

- **The icons:** the 18 drawn icons in `SiteData.ICONS` (`assets/ui/*.png` used on the site and `assets/cat-*.png`). The
  line icons drawn in SVG (the Yours tab, the desktop line icons) and the app icons (favicon, home screen) are not in it.
- **Style for all icons:** Original, Sticker, Coloring page, Ink, Duotone, Pastel, Pop, Mono. Each one is made in the
  browser from Ekky's own icons (no outside art), same size, transparency kept, and uploaded as PNG. Icons he replaced
  himself keep his picture unless he ticks "Also restyle the icons I replaced myself". Original takes the style back off.
- **Own picture:** any icon can be replaced with a picture he uploads (fitted into the icon's box, up to 256 px, PNG).
  Back to original undoes it; All back to original undoes every swap.
- **Places:** one button or spot can show another icon than its built-in one; the rest of the site keeps its icons.
  Places (`SiteData.PLACES`, CSS selectors in `js/site-data.js`): `hire` (the Hire Ekky button everywhere), `tabArt`,
  `tabMap`, `sketch`, `collab`, `stars`, `fab`, `playColor`, `playStars`, `heroWave`, `dividers`. A place takes one of the
  18 icons (and then follows the chosen style) or his own uploaded picture. Back to built-in undoes it.
- **New art as an icon (owner: "if he upload some image, give him option to devour the image and became icon or
  something component of the web or not"):** after a new picture is saved in the Art tab (`admin:art-saved`), admin asks
  "Also use this art on the site?": "No, just the art" (nothing else changes) or "Make it an icon or button picture":
  zoom and move a square crop, remove the background (flooded away from the edges, with a "how much" slider), then pick
  where it goes: replace one icon everywhere, or only one button or place. Esc and Cancel change nothing. Only Ekky's
  own pieces (`kind: "original"`) are offered, never fan art or client work. "Make an icon from your art" in the Icons
  tab does the same for any of his own published pieces.
- **Contract in `data/site.json`:**
  `"icons": {"style": "<style>", "map": {"<built-in icon>": "assets/ui/u/<file>.png"}, "places": {"<place>": "<built-in icon or assets/ui/u/<file>.png>"}}`.
  Files are written to `assets/ui/u/` (lowercase, digits and `-`, `.png` only); the shell refuses any other path. New
  names on every change, so the service worker's cache never shows an old icon.
- **Merge (`js/site-data.js`):** only known icons and places, only values under `assets/ui/u/` (or a built-in icon for a
  place). Every `<img>` showing an icon gets the new file: those in the page, those added later (a MutationObserver)
  and `new Image()` sprites (the `src` property). The hook is installed only when something is swapped. Preview shows
  unpublished icons from memory (`SiteData.iconBlobs`); canvas sprites already drawn change after a reload.

## History (tab History / Riwayat, `js/admin-history.js`)

Owner, 2026-10-29: "after upload etc it has some history log so he can remember or audit".

- Every Publish and every Undo publish writes one entry to **`data/history.json`** in the same commit:
  `{"version": 1, "entries": [{"at": "<ISO time>", "by": "<GitHub login of the token>", "kind": "publish" | "undo",
  "title": "...", "titleId": "...", "changes": [{"area": "words|icons|art|links|settings|other|undo", "en": "...", "id": "..."}],
  "files": ["<path>", ...]}]}`, the newest 300 kept. Undo never rewinds the history: it adds an "undo" entry.
- **Every uploaded file is audited** (owner: "audit every uploaded art too ... in history"): the entry's `"uploads"` lists
  each file the publish writes, `{"path", "for", "bytes", "w", "h", "sha256"}` (what it is for: the piece and whether it
  is the full picture, the thumbnail or a step, or the icon or place; size; pixel size; SHA-256 of the exact bytes
  committed, so a file can be checked later), and each file it removes, `{"path", "for", "removed": true}` (an undo
  lists what it put back or removed). History shows them with a thumbnail, and "Uploads only" lists every upload ever,
  newest first, with when and who.
- The commit message carries the same summary (`Admin: <title>`, then one line per change and the files), so the git
  log on GitHub is the same audit trail.
- The tab shows what is waiting to publish (compared with the last loaded or published site.json), then the published
  entries, newest first, in EN or ID, with search, the files of each entry and a link to the commit when known.
- The shell may write `data/history.json` besides `data/site.json` and the image folders; nothing else.

## Publishing

- One **Publish** button makes one commit through the GitHub contents API (`PUT /repos/rfim/ekkyarya.com/contents/...`),
  with the message `Admin: <what changed>`.
- New art: the image is resized in the browser to 1600 px (full) and 480 px (thumb), saved as JPEG at about 0.82, and
  uploaded to `assets/work/u/` and `assets/work/thumb/u/`.
- GitHub Pages then deploys in about a minute; admin shows "Live in about a minute".

## Incoming messages

With GitHub as the backend there is nowhere to receive form messages, so the Hire form stays email. The admin
**Messages** panel says so plainly, in EN and ID, and has a button that opens the owner's mailbox. A real inbox needs
a backend (later).

## Who builds what

| Dev | Branch | Owns |
|---|---|---|
| Admin core | `admin/core` | both doors, the PIN pad, the admin shell (tabs: Art, Icons, Links, Settings, Words, Messages, History), the token and Publish (GitHub API helper), `js/admin.js`, `js/site-data.js` (the loader and merge), one `<script>` line in `index.html` (tell the Shell squad) |
| Admin art | `admin/art` | the Art tab: add a piece (upload, title and description in EN and ID, category, kind, roles), edit, hide, reorder the featured 6, client-side resize; `js/admin-art.js` |
| Admin settings | `admin/settings` | the Links tab (all social links), the Settings tab (contact email, price line, the FEATURES switches with plain labels), the Messages panel; `js/admin-settings.js` |
| Admin copy | `admin/copy` | the Words tab (every COPY key in EN and ID, checks, impression test) and the Icons tab (styles, own pictures, places), the `copy` and `icons` merge in `js/site-data.js`; `js/admin-copy.js`, `js/admin-copy-check.js`, `js/admin-icons.js` |
| Admin QA | `admin/qa` | e2e for both doors, the wrong-PIN pause, the read-only mode without a token, publishing against a mocked GitHub API, the site unchanged when `data/site.json` is missing or broken; checks that normal visitors load no admin code |

The admin UI uses the site's own look: paper, ink, Fredoka, 44 px targets, EN and ID.
