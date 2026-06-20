# Spec: Onboarding Slice 1 — main-screen lock / grey / colour-in layer

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER` (contains `verify_v16.mjs`, `verify_v19.mjs`, the model HTML files).
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (the open-economy model — it contains all four blocks the teaching flow unlocks). v16 is out of scope for this slice.
**Type of change:** New feature (the foundation of the teaching flow) **plus** a new headless verifier `verify_onboarding.mjs`. Do **not** modify `verify_v16.mjs`, `verify_v19.mjs`, or the economics engine (`solve`, equilibrium math, calibrated coefficients).

---

## Background / why

This is the FIRST slice of the progressive-teaching build. It does ONE thing: put a lock/grey/colour-in layer on the existing full model. Blocks the learner hasn't reached yet are greyed and unusable; as the learner progresses, blocks "colour in" and become usable. Nothing else — **no drill-downs, no three-beat choreography, no equation changes.** Those are later slices and must not be started here.

The current v19 has zero notion of locking — every block is always live. This slice introduces that notion and the inspectable state it lives in. Getting this foundation verifiable is what makes every later slice checkable.

## The four blocks (canonical order)

`GOODS` → `ISLM` → `UIP` → `PC`. The teaching flow unlocks them in exactly this order. (`MP`/`LM` is part of the `ISLM` block.)

---

## What to do

### 1. State lives in an inspectable object (the enabling constraint)

Create a single state object, e.g. `tutorialState`, holding at minimum:

```js
{ unlocked: Set<BlockId> }   // BlockId ∈ {GOODS, ISLM, UIP, PC}
```

Design it to extend later (the choreography slice will add `soloStudy`, `beat`, etc.) — but for THIS slice it only needs `unlocked`.

All changes to it go through **named transition functions**, never inline in DOM event handlers:

- `unlockBlock(block)` — add the next block in canonical order to `unlocked`.
- `setUnlocked(blocks)` — set the unlocked set directly (for jumping to a level).
- `resetTutorial()` — back to the start (only `GOODS` unlocked, or empty — your call, state it).

DOM handlers (buttons, a stepper, whatever UI you add) call these functions. The functions own the state. **If the locked/greyed state lives only in CSS/DOM and not in `tutorialState`, this slice has failed** — it would not be verifiable.

### 2. Visual lock/grey/colour-in tracks the state

- A block renders **coloured-in and usable** (its curve at full colour, its sliders active) **iff** it is in `unlocked`.
- A block not in `unlocked` renders **greyed and unusable** (transparent/greyed curve, sliders disabled, drag handles inert).
- This must be DRIVEN by `unlocked` — a single render/refresh function reads the set and applies the styling. Do not set lock styling independently of the set anywhere.

### 3. Minimal UI to drive it

A simple control to advance through the unlock sequence (e.g. a "next" affordance or a small stepper). Keep it minimal — the polished lesson frame is a later phase. The only requirement: advancing calls `unlockBlock` / `setUnlocked`, never mutates state directly.

### 4. Importable headless

The engine-slice technique the existing verifiers use (extract the `<script>`, slice at the first DOM-dependent function `buildSliders`/`buildControls`) must be able to import `tutorialState` and the transition functions **without** triggering DOM setup. Keep the state machine ABOVE the first DOM-dependent function. Report which approach you used.

---

## The verifier (`verify_onboarding.mjs`, NEW file at repo root)

Mirror `verify_v19.mjs`: import via the slice technique, run named transitions, assert on the state object, print `PASS`/`FAIL`, `process.exit(1)` on any failure, include BAD-fixture self-tests (deliberately-wrong cases that MUST be caught). Include a static check that the transition functions exist and are exported. This file will GROW in later slices; for now it holds only the Slice 1 invariants.

### Invariants to assert (Slice 1)

1. **Monotonic unlocking.** No transition ever shrinks `unlocked` (except `resetTutorial`, which is the one allowed exception — assert it resets to exactly the documented start state). Across an arbitrary sequence of `unlockBlock` calls, the set only grows.
2. **Prefix ordering.** `unlocked` is always a prefix of `[GOODS, ISLM, UIP, PC]` — you can't unlock `PC` while `UIP` is still locked. (Catches out-of-order unlocking.)
3. **Lock state = complement of unlocked.** Every block is greyed/locked iff it is not in `unlocked`. The rendered lock state must equal the set-derived state for every block — assert there is no block that is unlocked-but-greyed or locked-but-lit.
4. **Colour-in tracks unlocked.** A block is rendered coloured-in/usable iff in `unlocked`. (Same as #3 from the visual side — assert the render function's output matches the set.)
5. **Transition functions exposed.** `unlockBlock`, `setUnlocked`, `resetTutorial` exist and are importable headless; state is in `tutorialState`, not the DOM.

### BAD-fixture self-tests (must be CAUGHT)

- An out-of-order unlock (e.g. `PC` before `UIP`) → invariant 2 fires.
- A block forced lit while not in `unlocked` → invariant 3/4 fires.

---

## Acceptance check (report this back)

- `node verify_onboarding.mjs` runs green: all 5 Slice 1 invariants pass, BAD-fixture self-tests catch the wrong cases.
- Show `tutorialState` and the transitions import headless (slice runs without DOM errors).
- `node verify_v16.mjs` and `node verify_v19.mjs` STILL green — this slice must not perturb the engine.
- Confirm in words: no drill-down, no choreography, no equation changes were made (those are later slices).

## Guardrails / out of scope

- **Scope discipline:** ONLY the lock/grey/colour-in layer + its state + its verifier. No drill-downs, no three-beat choreography, no equation scoping/colouring. If you find yourself building any of those, stop — they are separate slices.
- Do **not** modify the economics engine or the existing verifiers.
- Do **not** put lock logic in DOM handlers — handlers call named functions only.
- Do **not** widen any tolerance or weaken any assertion to make a run go green. If an invariant can't be satisfied, report it.
