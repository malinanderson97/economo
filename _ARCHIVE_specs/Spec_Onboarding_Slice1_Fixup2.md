# Spec: Onboarding Slice 1 — fix-up 2 (hand-built controls + verifier blind spot)

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` and `verify_onboarding.mjs`
**Type of change:** Gate four hand-built DOM controls that the `Defs`-array mapping doesn't cover, and extend the verifier to catch ungated interactive controls in general. Do **not** touch the economics engine, `verify_v16.mjs`, or `verify_v19.mjs`. Do **not** re-architect the Slice 1 state machine or `renderTutorial`.

---

## Background / why

The block annotations in `paramDefs`/`shockDefs`/`dynamicsDefs`/`debtDefs` are all CORRECT. But four interactive controls are hand-built directly in the HTML, carry no `data-block`, and so are invisible to `renderTutorial` — they stay live regardless of unlock state:

- `#speed` — "Price flex (medium-run speed)" slider (the πᵉ drift-speed, `state.speed`).
- `#taylor-toggle` — "Taylor rule active" switch.
- `#deanchor-toggle` — "Allow expectations to de-anchor" switch.
- The oil-shock `<button class="shock-btn">` inside `#sec-shocks`.

All four are inflation-dynamics / supply-shock controls and belong to the **PC** block.

The verifier's block-mapping assertion only inspects controls defined in the `Defs` arrays, so it went green while these four sat ungated. That is a verifier blind spot: any hand-built interactive control is currently invisible to the gate. This fix closes both the specific gap and the general one.

## Structural note (informs the clean fix)

These controls live inside topic **section containers**:
- `#sec-dynamics` (side-body) contains `#dynamics-controls` (the already-gated θ/cred/φ sliders), plus the hand-built `#speed` slider and both toggles.
- `#sec-shocks` (side-body) contains `#shock-controls` (the `z` slider, already PC via `data-block`) plus the hand-built oil-shock button.

Both whole sections are PC-block material. Gate the section bodies, not four individual elements — it greys everything inside (controls + hint text) in one move and is robust to future controls added to those sections. This mirrors the existing `#sec-debt` / `#chart-box-pc` gating.

---

## What to do

### 1. Gate the two section bodies to PC

In `renderTutorial`, add gating so that while `PC` is locked, the contents of `#sec-dynamics` and `#sec-shocks` are greyed and inert; when `PC` unlocks, they light up. Use the existing `setLocked(selector, condition)` helper with `pcOn`:

- `setLocked('#sec-dynamics .side-body', pcOn)` (or the section's body wrapper — pick the element that covers the speed slider, both toggles, and the dynamics sliders).
- `setLocked('#sec-shocks .side-body', pcOn)`.

Confirm the greyed state makes the `#speed` slider, both `.toggle-row` switches, and the `.shock-btn` non-interactive (`.locked` already sets `pointer-events: none` — confirm it reaches these elements; the toggles have their own `onclick`, so the locked wrapper must block clicks reaching them).

### 2. Do NOT change what the controls do

Gating is visual/interaction only. `state.speed` still drives the πᵉ drift; the toggles still flip `taylor_on`/`deanchor_on`; the oil shock still fires `z_pulse` — all once PC is unlocked. No engine changes.

---

## Verifier updates (`verify_onboarding.mjs`) — close the blind spot

### 3. General assertion: no ungated interactive control

This is the important one. Add an assertion that enumerates EVERY interactive control in the HTML and fails if any is gated by neither a `data-block` annotation nor an explicit `renderTutorial` selector:

- Parse the HTML for interactive elements: `<input` (range, etc.), `<button`, `<select`, and elements with an `onclick`/`.toggle-row` handler.
- For each, it counts as GATED if either: (a) it (or an ancestor in the same control wrapper) carries a `data-block` attribute, OR (b) its id / a containing section id appears as a selector inside `renderTutorial`'s body (parse `renderTutorial`'s source text for the selector strings it passes to `setLocked`).
- A small allowlist is permitted for controls that are intentionally always-on and block-independent — the run controls (Reset / Step / Reverse), the preset-scenario selector and load button, the section collapse headers (`toggleSection`), and the advance-tutorial button. List these explicitly in the verifier with a comment saying why each is exempt.
- FAIL, naming the element, if any interactive control is neither gated nor allowlisted.

This assertion would have caught all four controls in this fix-up, and will catch the next hand-built control anyone adds.

### 4. Specific assertion: the four controls gate to PC

Assert that `#speed`, `#taylor-toggle`, `#deanchor-toggle`, and the oil-shock button are covered by the PC gating (via the `#sec-dynamics` / `#sec-shocks` selectors in `renderTutorial`). Explicit, so a regression names them.

### 5. Keep everything else

All existing Slice 1 + fix-up invariants, the block-mapping assertions, and the BAD-fixture self-tests stay. Add a BAD-fixture for the new general assertion: an inline fixture with an ungated `<button onclick="...">` must be CAUGHT (proves the blind-spot check actually fires).

---

## Acceptance check (report this back)

- `node verify_onboarding.mjs` green, showing: the new general "no ungated interactive control" assertion, the four specific PC-gating assertions, and the new BAD-fixture catching an ungated control.
- `node verify_v16.mjs` and `node verify_v19.mjs` STILL green.
- Confirm in the browser (state in words): at steps before PC, the speed slider, both toggles, and the oil-shock button are greyed and do not respond; after PC unlocks they work.
- Confirm the allowlist is explicit and commented (which always-on controls are exempt and why).

## Guardrails / out of scope

- Do **not** re-architect the state machine or `renderTutorial` — additive gating only.
- Do **not** touch the economics engine or the existing engine verifiers.
- Do **not** change control behaviour — only whether each is gated.
- Do **not** make the allowlist a broad pattern that would let real ungated controls slip through — it must be an explicit, named list.
- Do **not** widen or weaken any assertion.
