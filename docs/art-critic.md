# Art critic: rubric and method

The art critic judges whether Try Ekky **feels like Ekky**. It is not the "neat" check (alignment, clipping, contrast,
which are measured) and it is not QA (does it work). It asks whether a screen is beautiful, calm and his.

## Role

- **Advisory, never blocking.** The critic does not stop merges. At the end of each round it walks the whole site and
  writes **the top 3 notes only**. The next round fixes them first.
- **Its main power is removing things.** Every note is one of three verdicts: **keep**, **simplify** or **cut**.
  "Add" is not a verdict: new ideas go to the product lead as a question.
- **Ekky is the final judge, then the owner.** The critic's notes go into Ekky's review. When he or the owner agrees or
  disagrees, the result is written in the calibration log below, and the rubric changes with it.

## Rule zero: protect the hand

Wobbly lines, paper texture, tape and a fixed tilt on each piece are the brand, not flaws. The critic never asks to make
something cleaner, flatter, more modern or more "polished" in a way that removes Ekky's hand. When in doubt, keep what
looks drawn.

## Where the taste comes from

These are the only sources. The critic quotes one of them in every note.

1. **Ekky himself** (2026-10-27, relayed by the owner, `docs/owner.md`):
   > "opo yo, mungkin jam-packed bgt, copywriting e, trus biasane iku koyok animasine niat bgt misale. jd macem yg bikin
   > itu bnyak orang yg ngoyo bgt ngono kesane."

   In English: *"Hmm, maybe it's too jam-packed, and the copywriting. And the animation usually looks like it's trying
   really hard, so it gives the impression it was made by lots of people who are trying way too hard."*

   Three faults in one sentence, and the three things the critic watches most: **too much on screen**, **copy that
   tries too hard**, **motion that tries too hard**.
2. **The owner's decisions** (`docs/owner.md`), among them:
   - "make it better by his feedback ... concise simple full of simple jokes";
   - "menu bar strictly only 3";
   - "a lot of animation when touched", even "when only hovered";
   - "make sure all animation is very smooth, because right now some of it is very clunky";
   - the idle surprise and its 10 whole-page effects;
   - "not neat" four times on the Map face, "not symmetrical up and down".
3. **The sprint goal** (`docs/sprint-6h.md`): Try Ekky feels **hand-made and calm**.
4. **Ekky's portfolio** (`js/data.js`, `PROJECTS`, kind `original`): what good looks like. When a screen and his work
   disagree, his work wins.

## The tension, and how to judge it

Ekky said the motion tries too hard. The owner then asked for motion on every touch and hover, and for idle effects.
Both stand. The critic resolves it like this:

- **Answered motion is welcome; unasked motion is suspect.** A reaction to a tap or a hover answers the visitor.
  Something that moves while nobody touched it has to earn its place. The idle effects are an owner exception: judge
  how they move, not whether they exist.
- **Judge how it moves, not whether it moves.** Good motion is short, soft, has a little weight, and stops. Bad motion
  is fast, jittery, bouncy for no reason, repeats, or makes several things move at once.
- **One thing moves at a time.** If a tap makes three things animate, ask which one carries the meaning and cut the rest.

## The rubric: seven questions per screen

Ask each one. A "no" is a candidate note. Keep only the top 3 for the whole site.

| # | Question | Looks right | Looks wrong | Source |
|---|---|---|---|---|
| 1 | **Is it calm?** Could you look at it for 10 seconds without your eye being pulled around? | One clear focus, empty paper around it | Several things competing: badges, chips, counters, glow, motion | Ekky "jam-packed", sprint goal |
| 2 | **Does the art lead?** Is Ekky's drawing the biggest, first thing you see? | The art is the hero; UI is quiet ink on paper | UI chrome, buttons or effects louder than the art | Portfolio, rule zero |
| 3 | **Does it look drawn?** | Paper, tape, tilt, ink lines, his palette | Glossy cards, gradients, heavy shadows, rounded "app" look, perfectly straight everything | Rule zero, S1 sketchbook |
| 4 | **Is it balanced?** Weight, not pixels: does it sit right? | Optically centred, even margins, things line up | Visibly lopsided, crowded corner, uneven gaps (the "neat" check measures; this asks whether it feels right) | Owner "not neat", "not symmetrical" |
| 5 | **Is the motion relaxed?** | Short, soft, one thing, stops | Busy, fast, bouncy, loops, many things at once, or stutters | Ekky "trying too hard", owner "very smooth" |
| 6 | **Does the copy sound like him?** Read it aloud. | Short, warm, plain, one small joke at most | Marketing voice, exclamation marks, long sentences, a joke on every line | Ekky "copywriting", owner "concise, simple jokes" |
| 7 | **Would Ekky put his name on it?** | You can picture him sharing a screenshot | It feels like a template with his art pasted in | Final check |

## Never suggest

These are owner rules. A note that breaks one is discarded.

- Emoji, or any art that isn't Ekky's. Fan art only in PROJECTS (portfolio and cards); client pieces portfolio only.
- More than 3 items in the menu bar; Hire more than one tap away.
- A dark game screen (the game stays on light paper; dark mode must stay readable).
- Removing the touch and hover reactions or the idle effects outright (owner asked for them). Simplify how they move instead.
- Anything that loops forever outside a game being played.

## How a review runs

1. **When:** at the end of every round (about every 2 hours), on the snapshot branch, never on a moving head.
2. **What to look at:**
   - every screen on an iPhone-sized view (390 x 844), in Safari's engine (WebKit) where possible, because that is
     the owner's phone;
   - light and dark mode, English and Bahasa;
   - the desktop site at 1440 px;
   - one slow pass with a real finger flow: start, tap a drawing, Mewarnai, Doodle Scene, Map, a village place, Mine,
     language switch, Hire;
   - one idle wait of 60 s on the start page.
3. **Write the notes** (`docs/art-notes.md`, newest round on top), exactly this shape:

   ```
   Round <n>, <snapshot>, <time UTC>
   1. <screen>: <verdict: keep | simplify | cut>. <what you see, one sentence>. <source>. Smallest fix: <one sentence>.
   2. ...
   3. ...
   Protect: <the one moment that works best and must not be touched>.
   ```

   Every note names a screen, a verdict, a source from the list above and the smallest fix. No more than 3 notes. Add
   one "Protect" line: the best thing on the site right now, so nobody polishes it away.
4. **Hand-off:** the product lead turns the notes into the next round's first tasks, and shows them to Ekky at his
   weekly review.

## Calibration log

Every time Ekky or the owner reacts to a note, or to something the critic should have caught, add a row. A rubric
change is written in the rubric above in the same commit.

| Date | What happened | Who said | What the critic learns |
|---|---|---|---|
| 2026-10-27 | Round 1 felt "jam-packed", the copy and motion "trying too hard" | Ekky | Questions 1, 5 and 6; the quiet pass (B43) |
| 2026-10-27 | The Map face: "not neat" (cropped hair, then hair breaking over the ring, then high in the circle) | Owner | Question 4: balance is judged by eye in a round frame, not by bounding box; nothing breaks over a ring |
| 2026-10-28 | "some of it is very clunky" | Owner | Question 5: stutter counts as bad motion, even when the idea is good |
| 2026-10-28 | "no need download button" on the tiles | Owner | Question 1: every badge on the art must earn its place; the art leads |
