# Patches for the Developer

Changes the Game Director made on top of `dev/assets` and could not push there (the Director pushes only to `director/backlog`). Apply them on `dev/assets`:

```
git am docs/patches/<file>.patch
node scripts/make-page.mjs giraffe        # regenerates the page files (deterministic)
node scripts/make-page.mjs giraffe --verify
```

| Patch | Base | What it does |
|---|---|---|
| `0001-giraffe-split-regions.patch` | `dev/assets` 49040fc | Owner, typed in the Game Director session: "split the big regions on the giraffe page". `scripts/make-page.mjs` also splits big areas where Ekky's own colors change (spots, trees, grass): 46 → 91 regions, no colored region larger than 9.3 % (the white paper stays one). `--verify`: reproducible, 0 leaks, 0 empty. `js/color.js` drops saved fills made for an older region map (stickers are kept). Tested over HTTP on the iPhone 13 viewport: 10 taps now fill 8 distinct regions instead of 5; share in 3 taps after Done; the friend's link matches pixel for pixel; an old 46-region link opens the start screen; an old save keeps its sticker and drops its fills. Before and after: `0001-giraffe-split-regions.png` (original, old map, new map). |
