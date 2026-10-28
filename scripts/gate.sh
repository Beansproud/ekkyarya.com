#!/usr/bin/env bash
# The whole gate in one command. Prints one line per check and a final "GATE PASS" or "GATE FAIL: <checks>", then a timing line.
# Run it from the repo root before every push:  bash scripts/gate.sh   (FAST=1 skips e2e)
# A blank or missing output never counts as a pass: each check must print its own PASS.
# The browser checks are independent (each starts its own server and Chromium), so they run in parallel:
# e2e (the longest) in one lane, the four probes in JOBS lanes beside it (default 2, so 4 cores are not oversubscribed).
cd "$(dirname "$0")/.." || exit 2
OUT=${OUT:-$(mktemp -d)}; mkdir -p "$OUT" || exit 2
T0=$(date +%s); fail=(); times=()
ok(){ echo "PASS $1"; }
no(){ echo "FAIL $1: $2"; fail+=("$1"); }
# run <name> <cmd...>: output to $OUT/<name>.txt, exit code and seconds to $OUT/<name>.rc
run(){ local n=$1 s=$(date +%s); shift; "$@" >"$OUT/$n.txt" 2>&1; echo "$? $(( $(date +%s)-s ))" >"$OUT/$n.rc"; }

# Start the slow browser checks first.
[ -z "$FAST" ] && { run e2e node scripts/e2e.cjs . "$OUT/e2e" & }
lane=$(( ${JOBS:-2} ))
probes=( "a11y node scripts/a11y-scan.cjs" "loops node scripts/loops.cjs ." "phone node scripts/probe-phone.cjs . $OUT" "dark node scripts/probe-dark.cjs . $OUT" )
( i=0; for pr in "${probes[@]}"; do while [ "$(jobs -rp | wc -l)" -ge "$lane" ]; do wait -n; done; run $pr & done; wait ) &
probe_pid=$!

# 1. No symlinks in the repo (a committed node_modules link broke GitHub Pages on 2026-10-27).
links=$(git ls-files -s | awk '$1==120000{print $4}')
[ -z "$links" ] && ok symlinks || no symlinks "$links"

# 2. Content rules (emoji, fan art and client pieces only in PROJECTS).
chk(){ node scripts/check.mjs >"$OUT/check.txt" 2>&1 && grep -q '^check passed' "$OUT/check.txt"; }
# A check that printed nothing at all (killed under load) is retried; a real failure prints its reason.
if chk || { [ ! -s "$OUT/check.txt" ] && sleep 1 && chk; } || { [ ! -s "$OUT/check.txt" ] && sleep 2 && chk; }; then ok check; else no check "$(tail -1 "$OUT/check.txt" 2>/dev/null)"; fi

wait $probe_pid
secs(){ [ -f "$OUT/$1.rc" ] && times+=("$1 $(cut -d' ' -f2 "$OUT/$1.rc")s"); }

# 3. Accessibility: tap targets and text size; must print exactly {}.
a=$(tail -1 "$OUT/a11y.txt" 2>/dev/null); [ "$a" = "{}" ] && ok a11y || no a11y "${a:-no result}"; secs a11y

# 4. No endless animations outside a game in play. All four lines (start, map, art, desktop) must end in [].
l=$(cat "$OUT/loops.txt" 2>/dev/null)
if [ "$(echo "$l" | grep -c '\[\]$')" -eq 4 ] && ! echo "$l" | grep -qv '\[\]$'; then ok loops; else no loops "$(echo "$l" | grep -v '\[\]$' | head -3 | tr '\n' ' ')"; fi; secs loops

# 5. Phone probe: no horizontal scroll, broken images, controls off screen or page errors.
p=$(cat "$OUT/phone.txt" 2>/dev/null)
if echo "$p" | grep -Eq '"scroll": [1-9]|"(broken|spill)": \[$|errors \[.+\]'; then no phone "see $OUT"; elif echo "$p" | grep -q 'errors \[\]'; then ok phone; else no phone "no result"; fi; secs phone

# 6. Dark mode probe.
[ "$(cut -d' ' -f1 "$OUT/dark.rc" 2>/dev/null)" = 0 ] && ok dark || no dark "probe-dark failed"; secs dark

# 7. End-to-end walk (iPhone 13, light and dark, EN and ID).
if [ -z "$FAST" ]; then
  wait
  r=$(grep -E '[0-9]+ PASS' "$OUT/e2e.txt" 2>/dev/null)
  echo "$r" | grep -q ', 0 FAIL' && ok "e2e ($r)" || no e2e "${r:-no result}"; secs e2e
fi

[ ${#fail[@]} -eq 0 ] && res="GATE PASS" || res="GATE FAIL: ${fail[*]}"
echo "$res"
echo "TIME total $(( $(date +%s)-T0 ))s ($(IFS=,; echo "${times[*]}" | sed 's/,/, /g'))"
[ ${#fail[@]} -eq 0 ]
