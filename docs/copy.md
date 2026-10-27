# Copy: user-facing wording

**Round 1: the `COPY` object in `js/data.js` is the source of truth (B14).** It supersedes the tables below where they differ (start tiles, Mine tab, no trophies or packs, the owner's facts: he/him, Indonesian and English, evenings to night GMT+7, projects from $25). The open questions at the end are answered in `docs/backlog.md` (owner answers, 2026-10-27).

Owner: UX Portfolio. Source: `docs/ux-audit.md` sections 1, 2 and 4.
Every string the Developer needs for round 1, in English. Keep it short and warm. No emoji anywhere.
`<...>` is a value filled in at runtime. Lines marked **confirm** need the owner's answer before launch (see the end).

Piece titles, one-line descriptions, labels and the lead 6 live in `js/data.js` (`title`, `desc`, `label`, `own`, `featured`), not here.

## Try Ekky (game) start screen

| Key | Where | Text |
|---|---|---|
| `start.tagline` | Start screen, under the logo | Ekky Arya draws characters that make people smile. |
| `start.role` | Start screen, small line under the tagline | Illustrator and graphic designer |
| `start.play` | Primary button | Play |
| `start.hire` | Secondary button, under Play | Hire Ekky |
| `start.color` | Secondary button | Color with Ekky |
| `start.featured` | Heading of the lead-6 row on the start screen | Ekky's favorites |
| `start.classic` | Text link at the bottom | Open the classic site |

## Try Ekky headings and buttons

| Key | Where | Text |
|---|---|---|
| `map.title` | Map header | Try Ekky |
| `level.1` | Level 1 | Who is Ekky? |
| `level.2` | Level 2 | Skill Tree |
| `level.3` | Level 3 | Art Collection |
| `level.4` | Level 4 | Doodle to Done |
| `level.5` | Level 5 (boss) | Final Quest: Work with Ekky |
| `level.next` | Level sheet button | Next level |
| `cards.title` | Cards tab heading | Art Collection |
| `cards.count` | Under the heading | <n> of <total> cards collected |
| `cards.free` | Under the count | Every piece is free to view. Packs just make collecting fun. |
| `pack.open` | Pack button | Open a pack |
| `pack.done` | After a pull | Add to collection |
| `pack.legend` | Toast on a legendary pull | Legendary! An Ekky favorite. |
| `stars.title` | Star Catcher heading | Star Catcher |
| `stars.result` | Result screen | You caught <n> stars! |
| `stars.again` | Result button | Play again |
| `stars.challenge` | Result button | Challenge a friend |
| `color.title` | Coloring entry heading | Color with Ekky |
| `color.intro` | Coloring entry line | Pick a drawing. Ekky brought the colors. |
| `color.done` | After finishing | Looks great! Share it with a friend. |
| `color.save` | Button | Save image |
| `share.button` | Every share button | Share |
| `share.copied` | Toast when the link is copied (no Web Share API) | Link copied |
| `recommend.button` | Recommend action | I recommend Ekky |
| `recommend.name` | Name field placeholder | Your first name |

## Hire Ekky chip and quick actions

| Key | Where | Text |
|---|---|---|
| `hire.chip` | HUD chip, top right, every screen | Hire Ekky |
| `hire.chip.aria` | `aria-label` of the chip | Hire Ekky: open the contact sheet |
| `hire.title` | Final Quest sheet heading | Final Quest: Work with Ekky |
| `hire.body` | Under the heading | Tell Ekky about your project. He usually replies within 2 working days. **confirm** |
| `hire.email` | Quick action 1 | Email Ekky |
| `hire.whatsapp` | Quick action 2 (hide until `CONFIG` has a number) | WhatsApp Ekky |
| `hire.copy` | Quick action 3 | Copy email |
| `hire.copied` | Toast | Email copied |
| `hire.price` | Small line under the quick actions | Ask for a quote. **confirm** (or "Projects from <amount>") |
| `hire.form.title` | Above the short form | Or send a quick note |
| `hire.form.name` | Field label | Your name |
| `hire.form.type` | Field label (select) | Project type |
| `hire.form.types` | Select options | Character design / Book or editorial / Brand and packaging / Web or app art / Something else |
| `hire.form.msg` | Field label | Your project |
| `hire.form.msg.ph` | Placeholder | What are you making, and when do you need it? |
| `hire.form.send` | Submit button | Send to Ekky |
| `hire.sent` | After sending | Quest complete! Ekky will be in touch soon. |

## Lightbox (both views)

| Key | Where | Text |
|---|---|---|
| `lb.hire` | Button under the description | Want art like this? Hire Ekky |
| `lb.hire.prefill` | Message pre-filled when the form opens from the lightbox | Hi Ekky, I saw "<title>" on your site and |
| `lb.fanart` | Shown with the "Fan art" label (already in `desc`) | Fan art. Characters belong to their owners. |
| `lb.label.client` | Tag text | `label` from `js/data.js`, as is |

## Share caption and credit line

| Key | Where | Text |
|---|---|---|
| `credit` | Every share image, every OG preview | Illustrated by Ekky Arya |
| `credit.full` | Share image footer | Illustrated by Ekky Arya · ekkyarya.com |
| `share.color` | Web Share `text`, coloring | I colored a drawing by Ekky Arya. Your turn: <url> |
| `share.card` | Web Share `text`, card pull | I pulled "<title>" in Try Ekky. Illustrated by Ekky Arya: <url> |
| `share.challenge` | Web Share `text`, Star Catcher | <name> caught <n> stars in Ekky's Star Catcher. Can you beat that? <url> |
| `share.recommend` | Web Share `text`, recommend sticker | <name> recommends Ekky Arya, illustrator. See why: <url> |
| `card.colored` | Share image, name line | Colored by <name> |
| `card.pulled` | Share image, name line | Pulled by <name> |
| `card.cta` | Share image pill | Your turn: ekkyarya.com |
| `card.beat` | Player card link line | Beat me: ekkyarya.com |
| `challenge.landing` | Banner when a challenge link opens | <name> caught <n> stars. Can you beat that? |
| `card.landing` | Banner when a card link opens | <name> shared this piece by Ekky Arya. |

The challenge text avoids "her/his": the sender's pronouns are unknown.

## Desktop and classic site

| Key | Where | Text |
|---|---|---|
| `hero.hi` | Hero kicker | Hi, I'm Ekky Arya |
| `hero.title` | Hero headline | I draw characters that make people smile. |
| `hero.sub` | Hero line | Illustrator and graphic designer from Indonesia. Picture books, mascots, packaging, web art and games. |
| `hero.cta1` | Primary button (was "Contact Me") | Hire Ekky |
| `hero.cta2` | Secondary button | See my work |
| `hero.cta3` | Text link | Try the game |
| `hero.status` | Small pill in the hero | Open for new projects **confirm** |
| `featured.title` | Strip under the hero (lead 6) | Selected work |
| `clients.line` | Text row under the strip | Worked with Indomaret, BCA, MSI, Fizzy Tube, Morumelons and Tea Break **confirm** |
| `about.title` | About heading | About me |
| `about.body` | About text | I'm Ekky, an illustrator from Indonesia. I fill worlds with characters: kids on adventures, monsters on their lunch break, little planets with someone working late. My work is bright, bold and a bit silly, and I like it when a drawing tells a whole story in one frame. I work with brands, publishers and studios on characters, mascots, packaging and web art. |
| `about.basics` | Line under the About text | Based in Indonesia (GMT+7). I work in English and Indonesian. |
| `contact.title` | Contact heading | Let's make something together |
| `contact.body` | Contact text | Got a character, a book, a mascot or a campaign in mind? Tell me about it. I usually reply within 2 working days. **confirm** |
| `contact.send` | Form button | Send to Ekky |
| `contact.copy` | Copy button | Copy email |
| `nav.hire` | Sticky classic-phone header button | Hire Ekky |

## Labels on pieces

| Value of `label` | Meaning |
|---|---|
| `Fan art` | Characters belong to their owners; portfolio only. |
| `Client: <name>` | The client's name is visible on the art, or came with the original title. |
| `Client work` | Made for a client whose name isn't certain yet. |
| `Competition entry: Ancol` | Contest entry, not a commission. |
| (none) | Ekky's own work. |

## Open questions for the owner

1. Pronouns for the copy: the plan uses "he". Confirm, or switch to "Ekky" everywhere.
2. Reply time, availability and price line (`hire.body`, `hire.price`, `hero.status`, `contact.body`).
3. Which clients may be named (`clients.line`), and the clients behind "Client work": Character Crowd Banner, My Sports Club App, Save Early, Buy Future, Thinker & Doer, Monster Noodles Cup (Pop Mie commission or pitch?).
4. Is Morumelons a client or Ekky's own project? If his own, it can be `own: true` and Legendary.
5. ~~Boss Fight: is the fire spirit Ekky's own design?~~ Answered: yes ("fire spirit is his own design"); the piece is titled "RPG".
6. Plug Hero and Toybox are marked as Ekky's own (the plan uses Toybox as the card-pack icon). Confirm neither was a commission.
7. Astronaut and Radio Explorer (NFT): confirm Ekky holds the rights.
