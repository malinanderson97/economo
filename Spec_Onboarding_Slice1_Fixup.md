# Spec: Onboarding Slice 1 — fix-up (block mappings + 5th block)

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html`
**Type of change:** Corrections to the Slice 1 block mappings + add a 5th block. The lock-layer state machine and `verify_onboarding.mjs` from Slice 1 are CORRECT and stay — this only fixes which controls/elements are annotated to which block, adds one block to the canonical order, and ensures greyed controls are truly inert. Do **not** touch the economics engine, `verify_v16.mjs`, or `verify_v19.mjs`.

---

## Background / why

Slice 1's state machine and DOM-sync (`renderTutorial`, the single `.locked` writer reading from `tutorialState.unlocked`) are verified correct and must not be re-architected. Browser testing found the BLOCK MAPPINGS are wrong in three places and the canonical block list is missing a final block:

1. Open-economy sliders (`m1`, `Ystar`) are live at step 1 (closed economy), where they shouldn't exist yet.
2. The adjustment-dynamics controls (`theta`, `cred`, `phi`) are ungated, so that block never greys.
3. Government debt belongs to long-run growth, not the IS-LM-PC core — it should be a final block after PC, not part of the early sequence.

Also: greyed controls must be non-interactive (a greyed slider must not respond to dragging) — confirm `.locked` enforces `pointer-events: none` on controls, not just visual opacity.

## Canonical block order (UPDATED — now five blocks)

`GOODS → ISLM → UIP → PC → DEBT`

This replaces the four-block order everywhere it appears (state machine, `TUTORIAL_BLOCKS`, the verifier's expected sequence, `renderTutorial`).

---

## What to do

### 1. Re-annotate every control to the correct block

Set the `block:` annotation on each `paramDefs` / `shockDefs` / dynamics-control entry exactly as follows (by `key`):

| Block | Control keys |
|---|---|
| `GOODS` | `G`, `T`, `c1` |
| `ISLM` | `i_target`, `pi_e` |
| `UIP` | `i_star`, `E_e`, `m1`, `Ystar` |
| `PC` | `alpha`, `m_struct`, `z_struct`, `z`, `theta`, `cred`, `phi` |
| `DEBT` | `B`, `g` |

Key corrections vs current state: `m1` and `Ystar` move OUT of any early block INTO `UIP`; `theta`, `cred`, `phi` get annotated to `PC` (they were ungated); `B`, `g` go to the new `DEBT` block.

### 2. Add the `DEBT` block to the canonical order

- Add `DEBT` as the fifth and final entry in `TUTORIAL_BLOCKS` (after `PC`).
- `renderTutorial` gets a `const debtOn = isUnlocked('DEBT')` branch that greys/lights the debt controls (`.control[data-block="DEBT"]`) and any debt-specific chart element (the debt readout / debt time-series line — find its selector and gate it).
- The advance button's "all unlocked" condition already uses `tutorialState.unlocked.size >= TUTORIAL_BLOCKS.length`, so adding `DEBT` to the array automatically extends the sequence. Confirm this still works (it should require 5 unlocks now).

### 3. Map block → DOM elements for the controls that moved

Ensure the `data-block` attribute on each control's DOM element matches its new block annotation, so `setLocked('.control[data-block="..."]', ...)` greys the right controls. The open-economy chart box (`#chart-box-uip`) and PC chart box (`#chart-box-pc`) gating already exist; add the debt element gating.

### 4. Greyed = inert

Confirm the `.locked` CSS rule includes `pointer-events: none` (Slice 1's report said it does — verify it actually applies to greyed sliders so they cannot be dragged). A greyed slider that still responds to drag is a bug. If `pointer-events: none` is present but a slider still drags, report it rather than guessing a fix.

---

## Verifier updates (`verify_onboarding.mjs`)

The verifier must reflect the new five-block order and the corrected mappings:

1. **Update the canonical order** the prefix-ordering invariant (#2) checks: `[GOODS, ISLM, UIP, PC, DEBT]`.
2. **Add a block-mapping assertion.** For each block, assert its expected control keys are annotated to it and NOT to any other block — drive this from the table in step 1. This is the check that would have caught `m1`/`Ystar` being in the wrong block. Specifically assert: `m1` and `Ystar` ∈ `UIP` (not `GOODS`/`ISLM`); `theta`, `cred`, `phi` ∈ `PC`; `B`, `g` ∈ `DEBT`; `GOODS` contains exactly `{G, T, c1}`.
3. **Update any count** that assumed four blocks.
4. Keep all existing Slice 1 invariants and BAD-fixture self-tests.

---

## Acceptance check (report this back)

- `node verify_onboarding.mjs` green, including the NEW block-mapping assertions (show them by name).
- `node verify_v16.mjs` and `node verify_v19.mjs` STILL green.
- Confirm the five-block order is everywhere (state machine, `TUTORIAL_BLOCKS`, verifier) — no leftover four-block assumption.
- Confirm `pointer-events: none` is on `.locked` and applies to controls.

## Guardrails / out of scope

- Do **not** re-architect the Slice 1 state machine or `renderTutorial` — it is correct. This is mapping + one new block only.
- Do **not** touch the economics engine or the existing engine verifiers.
- Do **not** build drill-downs, choreography, or equation scoping — still later slices.
- Do **not** change what the sliders DO economically — only which block they are gated to. (`m1`/`Ystar` still drive the open-economy IS terms; they're just locked until `UIP` unlocks.)
- Do **not** widen or weaken any assertion.
