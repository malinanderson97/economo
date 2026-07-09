# Spec: Context-aware Reset (return to active scenario's start; add "Reset to Default")

## 1. Goal (one sentence)
`reset()` must return the model to the START of the currently-active scenario (not bare `initialState`), and a separate "Reset to Default" action must return to the no-scenario default — so a user experimenting inside a scenario can restart *that* scenario, while still being able to clear back to the base model.

## 2. Which model / functions
`islm_pc_model_v19_Open_Economy_Complete_Demo.html` only. Touch points: `reset()` (~2148), `applyScenario(id)` (~2237), a new `activeScenarioId` state var, and the reset UI control (the existing Reset button + a new "Reset to Default" affordance — likely a small dropdown or secondary button next to Reset). NO engine math; `solve`/`step`/`initialState` untouched.

## 3. Background — how scenarios work (so reset is faithful)
`applyScenario(id)` sets `state = Object.assign(clone(initialState), clone(preset.state))`. So a scenario's START state is fully reconstructable as `initialState + preset.state` — no snapshot needed. The current `reset()` wipes to `clone(initialState)` and preserves the live `speed` slider value (`state.speed = sp`). That speed-preservation is deliberate and MUST be kept.

## 4. What must NOT change
- `initialState`, `solve`, `step`, engine constants — untouched.
- The speed-preservation behaviour in reset (live `speed` value survives a reset) — kept for BOTH reset paths.
- `undoStack` still cleared on reset (both paths).
- Scenario application behaviour (`applyScenario`) otherwise unchanged.
- Verifier baselines: verify_v19 55/0, verify_onboarding 98/0 (a new check may raise onboarding).

## 5. The edits

### 5a. Track the active scenario
Add a module-level `let activeScenarioId = null;` (null = default/no scenario). In `applyScenario(id)`, set `activeScenarioId = id;` after the preset is found. When the user clears to default (5c), set `activeScenarioId = null`.

### 5b. Make reset() context-aware
Rewrite `reset()` so it rebuilds the active scenario's start (or default if none), preserving speed and clearing undo:
```
function reset() {
  const sp = parseFloat(document.getElementById('speed').value);
  if (activeScenarioId) {
    const preset = SCENARIOS.find(s => s.id === activeScenarioId);
    state = preset ? Object.assign(clone(initialState), clone(preset.state)) : clone(initialState);
  } else {
    state = clone(initialState);
  }
  state.speed = sp;
  undoStack = [];
  syncControls();
  render();
}
```
(Confirm `clone` and `SCENARIOS` are in scope at `reset()` — they are used nearby. Report if not.)

### 5c. Add "Reset to Default"
Add a `resetToDefault()` that clears the active scenario and resets to base:
```
function resetToDefault() {
  activeScenarioId = null;
  reset();               // now returns to initialState since activeScenarioId is null
  // optionally clear the scenario-select dropdown to its blank/placeholder option
  const sel = document.getElementById('scenario-select');
  if (sel) sel.value = '';
}
```
UI: add a "Reset to Default" affordance next to the existing Reset button. Simplest faithful option: a small secondary button or a dropdown-caret beside Reset offering "Reset to Default". Match existing button styling (`.shock-btn`/toolbar button classes — grep the Reset button's current markup and mirror it). The main Reset button keeps calling `reset()`; the new control calls `resetToDefault()`.
- Report the exact markup added and where.

### 5d. Reset button label (optional polish)
If trivial, make the main Reset button's tooltip/label indicate context ("Reset scenario") when a scenario is active — but do NOT over-engineer; the core requirement is the two behaviours, not dynamic relabelling. Skip if it complicates the diff.

## 6. Invariants
Add a headless check to verify_onboarding.mjs (state behaviour, no DOM needed beyond the stub):
- After `applyScenario(<some id>)` then mutating a param then `reset()`: `state` equals `initialState + preset.state` (+ preserved speed) — i.e. reset returns to that scenario's start, not initialState. Assert a scenario-specific field (one that differs from initialState) is restored to the preset value, and a user-mutated field is reverted.
- After `resetToDefault()`: `activeScenarioId === null` and `state` equals `initialState` (+ preserved speed) — assert a scenario-specific field is back to the initialState value.
- BAD-fixture (mutating): revert `reset()` to always use `clone(initialState)` in a rebuilt source and confirm the scenario-restore assertion goes red.

Browser-check: load a scenario, drag some sliders, hit Reset → returns to that scenario's start (not the base model). Hit "Reset to Default" → returns to base model and the scenario dropdown clears. Speed slider value is preserved across both. Undo history cleared.

## 7. Done criteria
- [ ] verify_v19 55/0; verify_onboarding green (state new total) with the scenario-reset check + mutating BAD-fixture.
- [ ] mutation_check passes.
- [ ] No `DOM Stub Run Failed`/error lines anywhere in verifier output (full output pasted, top to bottom).
- [ ] Reset returns to active scenario start; Reset-to-Default returns to base + clears dropdown; speed preserved both paths; undo cleared.
- [ ] Report exact reset UI markup added and its location.
- [ ] `git --no-pager diff` pasted; engine HTML + verify_onboarding only; no engine-math lines.
- [ ] Browser-check confirmed by human.
- [ ] Committed by human: suggested `ui: context-aware Reset (returns to active scenario start) + Reset to Default; verifier check`.

## 8. Notes
- Scenario start is reconstructed as `initialState + preset.state`, not snapshotted — matches how `applyScenario` builds it, so it stays correct if presets change.
- Pure UX/state change; no engine or fidelity impact; nothing for Frank.
