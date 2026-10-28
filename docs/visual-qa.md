# Visual QA: `scripts/neat.cjs`

`node scripts/neat.cjs [site dir] [out dir]` measures neatness in px on an iPhone-emulated Chromium (360x640 and 390x844, light and dark, EN and ID; `QUICK=1` runs one combo). Exit 1 if any offset is over 2 px.

Measured: the tab bar (3 icons and labels, spacing, baseline, Map face centring), the Map face pixels (head vs circle), the start grid (gutters, gaps, alignment; the polaroid tilt is switched off while measuring), the Hire chip vs the Home button, every sheet header, the coloring picker cards.

Output: `FINDING <screen> | <element> | <what> | <offset> px | <combo> | <screenshot>`, a deduplicated SUMMARY, and INFO lines (measurements that are not rules). Screenshots go to the out dir.
