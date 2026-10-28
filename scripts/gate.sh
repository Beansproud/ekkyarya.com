#!/usr/bin/env bash
# The whole gate in one command. Prints one line per check and a final "GATE PASS" or "GATE FAIL: <checks>".
# Run it from the repo root before every push:  bash scripts/gate.sh   (FAST=1 skips e2e)
# A blank or missing output never counts as a pass: each check must print its own PASS.
cd "$(dirname "$0")/.." || exit 2
OUT=${OUT:-$(mktemp -d)}
fail=()
ok(){ echo "PASS $1"; }
no(){ echo "FAIL $1: $2"; fail+=("$1"); }

# 1. No symlinks in the repo (a committed node_modules link broke GitHub Pages on 2026-10-27).
links=$(git ls-files -s | awk '$1==120000{print $4}')
[ -z "$links" ] && ok symlinks || no symlinks "$links"

# 2. Content rules (emoji, fan art and client pieces only in PROJECTS).
node scripts/check.mjs >"$OUT/check.txt" 2>&1 && grep -q '^check passed' "$OUT/check.txt" && ok check || no check "$(tail -1 "$OUT/check.txt")"

# 3. Accessibility: tap targets and text size; must print exactly {}.
a=$(node scripts/a11y-scan.cjs 2>&1 | tail -1); [ "$a" = "{}" ] && ok a11y || no a11y "$a"

# 4. No endless animations outside a game in play.
l=$(node scripts/loops.cjs . 2>&1); echo "$l" | grep -qv '\[\]$' && no loops "$(echo "$l" | grep -v '\[\]$' | head -3 | tr '\n' ' ')" || ok loops

# 5. Phone probe: no horizontal scroll, broken images, controls off screen or page errors.
p=$(node scripts/probe-phone.cjs . "$OUT" 2>&1)
if echo "$p" | grep -Eq '"scroll": [1-9]|"(broken|spill)": \[$|errors \[.+\]'; then no phone "see $OUT"; elif echo "$p" | grep -q 'errors \[\]'; then ok phone; else no phone "no result"; fi

# 6. Dark mode probe.
node scripts/probe-dark.cjs . "$OUT" >/dev/null 2>&1 && ok dark || no dark "probe-dark failed"

# 7. End-to-end walk (iPhone 13, light and dark, EN and ID).
if [ -z "$FAST" ]; then
  r=$(node scripts/e2e.cjs . "$OUT/e2e" 2>&1 | grep -E '[0-9]+ PASS')
  echo "$r" | grep -q ', 0 FAIL' && ok "e2e ($r)" || no e2e "${r:-no result}"
fi

[ ${#fail[@]} -eq 0 ] && { echo "GATE PASS"; exit 0; } || { echo "GATE FAIL: ${fail[*]}"; exit 1; }
