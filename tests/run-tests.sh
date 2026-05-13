#!/bin/sh
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

pass() {
  echo "PASS: $1"
}

grep -q 'js/core.js' index.html || fail "index.html must load js/core.js"
grep -q 'js/scenes-act2.js' index.html || fail "index.html must load js/scenes-act2.js"
grep -q 'js/scenes-final.js' index.html || fail "index.html must load js/scenes-final.js"
pass "script tags exist"

core_line=$(grep -n 'js/core.js' index.html | cut -d: -f1)
world_line=$(grep -n 'js/world.js' index.html | cut -d: -f1)
act2_line=$(grep -n 'js/scenes-act2.js' index.html | cut -d: -f1)
final_line=$(grep -n 'js/scenes-final.js' index.html | cut -d: -f1)

[ "$core_line" -lt "$world_line" ] || fail "core.js must load before world.js"
[ "$world_line" -lt "$act2_line" ] || fail "world.js must load before scenes-act2.js"
[ "$act2_line" -lt "$final_line" ] || fail "scenes-act2.js must load before scenes-final.js"
pass "script order is valid"

grep -q 'k.scene("floor8"' js/scenes-act2.js || fail "floor8 scene must be registered"
grep -q 'k.onKeyPress("t"' js/dialog.js || fail "T key must open laptop"
grep -q 'function openLaptop' js/dialog.js || fail "laptop UI must exist"
grep -q 'saveGame();' js/dialog.js || fail "laptop must call saveGame"
pass "laptop and floor8 hooks exist"

grep -q 'id="code-terminal"' index.html || fail "typed code terminal must exist in index.html"
grep -q 'function openCodePuzzle' js/dialog.js || fail "typed code puzzle helper must exist"
grep -q 'openCodePuzzle({' js/scenes-act1.js || fail "Aigerim laptop must use typed code puzzle"
grep -q 'codePuzzleOpen' js/world.js || fail "typed code puzzle must pause player controls"
pass "typed code mini-game hooks exist"

grep -q 'function setupAct2OfficeHaunt' js/scenes-act2.js || fail "Act 2 office haunt system must exist"
grep -q 'function addGlitchMonitor' js/scenes-act2.js || fail "Act 2 glitch monitors must exist"
grep -q 'function addRepeatingEmployee' js/scenes-act2.js || fail "Act 2 repeating employees must exist"
grep -q 'act2ElevatorLieSeen' js/core.js || fail "Act 2 haunted elevator state must exist"
pass "act 2 office horror hooks exist"

if command -v osascript >/dev/null 2>&1; then
  for file in js/*.js; do
    output="$(osascript -l JavaScript "$file" 2>&1 || true)"
    case "$output" in
      *SyntaxError*) fail "syntax error in $file: $output" ;;
      *) : ;;
    esac
  done
  pass "all JS files parse without SyntaxError"
else
  echo "SKIP: osascript not available for syntax parsing"
fi

echo "All tests passed."
