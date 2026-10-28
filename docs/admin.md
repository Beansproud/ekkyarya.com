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
  - **Tablet on the web site (an iPad, no keyboard):** tap the Ekky Arya logo in the top bar or sidebar 7 times within
    3 seconds. Only on touch screens, so a computer with a mouse keeps the typed door.
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
| Admin core | `admin/core` | both doors, the PIN pad, the admin shell (tabs: Art, Links, Settings, Text, Messages), the token and Publish (GitHub API helper), `js/admin.js`, `js/site-data.js` (the loader and merge), one `<script>` line in `index.html` (tell the Shell squad) |
| Admin art | `admin/art` | the Art tab: add a piece (upload, title and description in EN and ID, category, kind, roles), edit, hide, reorder the featured 6, client-side resize; `js/admin-art.js` |
| Admin settings | `admin/settings` | the Links tab (all social links), the Settings tab (contact email, price line, the FEATURES switches with plain labels), the Text tab (edit any COPY key in EN and ID, with search), the Messages panel; `js/admin-settings.js` |
| Admin QA | `admin/qa` | e2e for both doors, the wrong-PIN pause, the read-only mode without a token, publishing against a mocked GitHub API, the site unchanged when `data/site.json` is missing or broken; checks that normal visitors load no admin code |

The admin UI uses the site's own look: paper, ink, Fredoka, 44 px targets, EN and ID.
