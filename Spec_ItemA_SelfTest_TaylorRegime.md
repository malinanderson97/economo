# Spec — Item A finisher: fix Taylor-convergence self-test (PC-regime setup)

**Scope:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` only.
Test-only change. NO engine change. NO change to `solve`, `step`,
`computeYn`, `effectivePiE`, or any coefficient.

## Why
The πᵉ-gating change (item A) made `effectivePiE(s)` return 0 unless PC is
unlocked. At in-HTML self-test time `tutorialState.unlocked` is `{'GOODS'}`
(PC locked), so the Taylor-convergence self-test runs in the nominal-rate
regime: `solve` computes `r = i − 0`, while `step`'s Taylor block computes its
neutral rate on `PI_TARGET = 0.02`. That 2-point wedge pushes the fixed point
off `computeYn` by more than the 0.1 tolerance — the test now reports FAIL,
giving the "4/5" the agent saw.

This is a TEST inconsistency, not an engine bug. In the UI the Taylor rule and
all time-controls are gated to PC (`#sec-dynamics .side-body` and the Taylor φ
control both gate on PC unlock, lines ~1599–1601 / control `block:'PC'`), so
the wedge is unreachable for any user. The test was implicitly asserting a
PC-regime (medium-run) property while setting up a PC-locked state. Fix the
test setup to match the regime it is testing.

## Target code
The self-test IIFE, the Taylor-convergence test (refreshed file ~lines
1834–1839). Current form:

```javascript
let s = JSON.parse(JSON.stringify(initialState));
s.taylor_on = true; s.G = 21;
const Yn0 = computeYn(s);
for (let t = 0; t < 60; t++) s = step(s);
assert('Taylor convergence (60 periods)', Math.abs(solve(s).Y - Yn0) < 0.1);
```

## Required change
Unlock PC for the duration of this test only, then restore the prior unlocked
set so page state is untouched:

```javascript
// Taylor convergence is a PC-regime (medium-run) property — the Taylor rule
// and time-controls are gated to PC in the UI, so test it in that regime.
const _savedUnlocked = tutorialState.unlocked;
tutorialState.unlocked = new Set(['GOODS','ISLM','UIP','PC']);

let s = JSON.parse(JSON.stringify(initialState));
s.taylor_on = true; s.G = 21;
const Yn0 = computeYn(s);
for (let t = 0; t < 60; t++) s = step(s);
assert('Taylor convergence (60 periods)', Math.abs(solve(s).Y - Yn0) < 0.1);

tutorialState.unlocked = _savedUnlocked;
```

## Constraints
- Do NOT change the assertion text, the tolerance (0.1), the period count (60),
  the `G = 21` setup, or any other self-test.
- Do NOT call `setUnlocked(...)` — that fires `renderTutorial()` and touches the
  DOM. Assign `tutorialState.unlocked` directly so the test is side-effect-free.
- Restore `_savedUnlocked` even though the test runs on load with GOODS only —
  this keeps the block hermetic in case test ordering changes later.

## Acceptance criteria
1. Browser F12 console on load prints five PASS lines and
   `[SELF-TEST] 5/5 passed`.
2. The page's own tutorial state is unchanged after load (only GOODS+ISLM
   reflected in the UI on a fresh load).
3. Both root verifiers unchanged: verify_v19 40/0, verify_onboarding 37/0
   (this change touches no engine path, so counts must not move).

## Git
Agent does NOT commit (AGENTS.md rule 15). Human commits item A as a whole.

## Note for canonical docs (do later, not part of this edit)
Master Plan §9: record that `step`'s Taylor neutral-rate calc hardcodes
`PI_TARGET` rather than `effectivePiE(s)`. Harmless today (Taylor is PC-gated),
but if pre-PC Taylor is ever exposed, the follow-up is to route that calc
through `effectivePiE` too (the "Option 2" engine fix).
