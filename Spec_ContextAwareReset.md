# Spec: Context-aware Reset + "Reset to Default" dropdown option

Two small, in-scope UI changes to the committed engine `islm_pc_model_v19_Open_Economy_Complete_Demo.html`. SCENARIO/UI-layer only — NO engine changes (`solve`/`step`/`computeYn`/sliders untouched). These restore two of the clean keepers from the abandoned country branch, re-expressed in scenario terms (there are no country presets; "active scenario" = whatever SCENARIOS entry was last loaded).

**NOT in this spec:** the old "settled-warning period>0 patch" is deliberately EXCLUDED. That patched a bug caused by the reverted c0-forced-to-100 mechanism, which no longer exists. Re-adding it would suppress a possibly-correct period-0 warning. Do not add it.

## Behaviour decided
- **↺ Reset** = return to the **active scenario's starting state** (re-apply the scenario at period 0), preserving the user's `speed`. If no scenario is active, Reset wipes to generic `initialState` (current behaviour).
- **"-- Reset to Default Settings --"** dropdown option = wipe to generic `initialState`, clear the active-scenario tracker.

## Current code (verbatim, for anchored edits)

`reset()` — already preserves speed; currently always wipes to initialState:
```
function reset() {
  const sp = parseFloat(document.getElementById('speed').value);
  state = clone(initialState);
  state.speed = sp;
  undoStack = [];
  syncControls();
  render();
}
```

`applyScenario(id)`:
```
function applyScenario(id) {
  const preset = SCENARIOS.find(s => s.id === id);
  if (!preset) return;
  state = Object.assign(clone(initialState), clone(preset.state));
  undoStack = [];
  syncControls();
  render();
}
```

`previewScenario(id)`:
```
function previewScenario(id) {
  const note = document.getElementById('scenario-narrative');
  const btn = document.getElementById('scenario-load-btn');
  if (!id) {
    note.textContent = 'Select a scenario to see its description.';
    btn.disabled = true;
    return;
  }
  const preset = SCENARIOS.find(s => s.id === id);
  if (preset) {
    note.textContent = preset.narrative;
    btn.disabled = false;
  }
}
```
The scenario `<select id="scenario-select">` is EMPTY in HTML and populated by JS — find where options are appended (grep for `scenario-select` and for where SCENARIOS is iterated to build `<option>`s). The new `default` option must be added there as the FIRST option.

## Changes

### 1. Add the global tracker
Near the other top-level state globals (where `undoStack` / `state` are declared), add:
```
let currentScenarioId = null;
```
Grep-prove it doesn't already exist (`grep -o "currentScenarioId" <file> | wc -l` → expect 0 before edit).

### 2. `applyScenario` records the active scenario
After the `state = Object.assign(...)` line, add `currentScenarioId = id;`:
```
function applyScenario(id) {
  const preset = SCENARIOS.find(s => s.id === id);
  if (!preset) return;
  state = Object.assign(clone(initialState), clone(preset.state));
  currentScenarioId = id;
  undoStack = [];
  syncControls();
  render();
}
```

### 3. `reset()` becomes context-aware
Preserve speed (already done), but branch on `currentScenarioId`:
```
function reset() {
  const sp = parseFloat(document.getElementById('speed').value);
  if (currentScenarioId) {
    const preset = SCENARIOS.find(s => s.id === currentScenarioId);
    if (preset) {
      state = Object.assign(clone(initialState), clone(preset.state));
    } else {
      state = clone(initialState);
    }
  } else {
    state = clone(initialState);
  }
  state.speed = sp;
  undoStack = [];
  syncControls();
  render();
}
```

### 4. The "default" dropdown option + its handling
- When building the scenario `<option>`s, prepend one with `value="default"` and label `-- Reset to Default Settings --`.
- `previewScenario('default')`: enable the load button and set a descriptive narrative, e.g. `note.textContent = 'Wipe all settings back to the model defaults (generic baseline).';`. So previewScenario needs a branch handling `id === 'default'` BEFORE the `SCENARIOS.find` (since 'default' is not in SCENARIOS).
- `applyScenario('default')`: intercept at the top — wipe to baseline, clear the tracker:
```
function applyScenario(id) {
  if (id === 'default') {
    const sp = parseFloat(document.getElementById('speed').value);
    state = clone(initialState);
    state.speed = sp;
    currentScenarioId = null;
    undoStack = [];
    syncControls();
    render();
    return;
  }
  const preset = SCENARIOS.find(s => s.id === id);
  if (!preset) return;
  state = Object.assign(clone(initialState), clone(preset.state));
  currentScenarioId = id;
  undoStack = [];
  syncControls();
  render();
}
```
(Decide whether 'default' should also preserve speed — yes, keep it consistent with reset, as written above.)

## Acceptance checks (explicit PASS/FAIL each)
- [ ] `grep -o "currentScenarioId" <file> | wc -l` → was 0 before, now ≥3 (declaration + set in applyScenario + read in reset + clear in default).
- [ ] `node verify_v19.mjs` → 52 passed, 0 failed (engine untouched).
- [ ] `node verify_onboarding.mjs` → 98 passed, 0 failed. **In particular the existing "Reset sets back to IS Model" / "Reset state is IS Model" onboarding assertions must still pass** — context-aware reset must NOT break reset-with-no-scenario-active (the no-scenario branch must still wipe to initialState exactly as before). If those assertions fail, the branch logic is wrong — fix it, do not weaken the assertion.
- [ ] HS-1 headless safety check passes.
- [ ] `git --no-pager diff` pasted in full; changes limited to: the global decl, applyScenario, reset, previewScenario, and the option-building site. Nothing else.
- [ ] Browser check (Malin): load UK challenge → drag some sliders → ↺ Reset → confirm it returns to the UK *starting* state (B≈100, rate 3.75%), not the generic baseline. Then pick "-- Reset to Default Settings --" → confirm it wipes to generic. Then with nothing loaded, ↺ Reset → confirm still wipes to baseline.

## Forbidden
- No engine changes. No settled-warning period>0 patch. No new verifiers.
- No git commit/add/restore. Malin commits. No scratch files. No reformatting.
- No weakening the existing reset/onboarding assertions — if context-aware reset trips them, the logic is wrong, fix the logic.
- Run every check, print PASS/FAIL. STOP and report on dirty tree, verifier count change, or a missing anchor.

## Sequencing note
This can be done in the SAME Antigravity session as the three-challenges add, or after. If same session, do the challenges FIRST (pure data append, lowest risk), verify green, THEN this (touches functions). Keep them as two separate diffs/reviews even if one session, so each is independently checkable.
