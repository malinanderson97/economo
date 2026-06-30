# Spec: two small fixes (Yₙ gating + context-aware reset)

Target file: `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (committed, debt-removed clean state). NOT the Economo export. Two INDEPENDENT changes — keep them as two separate diffs/reviews even if done in one session. Surgical edits only (no bulk regex, no Set-Content — same rule as the debt removal). UI/scenario layer; engine `solve`/`step` untouched.

---

## FIX 1 — Yₙ line leaks on the UIP chart when PC is locked

### The bug (confirmed)
The Yₙ vertical reference line is drawn on the UIP chart unconditionally, so it appears even at the IS-Model / IS-LM-UIP stages where the PC block is still locked. Yₙ is a supply-side concept (defined by the PC/natural-rate machinery), so it should not show pre-PC.

### Why this is a clear bug, not a design choice
The IS-LM chart ALREADY gates this correctly:
```
if (tutorialState.unlocked.has('PC')) {
  const yn_x = xScale(eq.Y_n, o);
  el('line', { x1: yn_x, x2: yn_x, y1: P.t, y2: H - P.b, class: 'curve-natural' }, svg);
  { const _t = el('text', { x: yn_x + 3, y: P.t + 9, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'Yₙ'; svgTitle(_t, 'Yₙ'); }
}
```
The UIP chart draws the SAME thing with NO gate (the leak):
```
  const yn_x = xScale(eq.Y_n, o);
  el('line', { x1: yn_x, x2: yn_x, y1: P.t, y2: H - P.b, class: 'curve-natural' }, svg);
  { const _t = el('text', { x: yn_x + 3, y: P.t + 9, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'Yₙ'; svgTitle(_t, 'Yₙ'); }
```
So the fix is simply to make the UIP chart match the IS-LM chart's existing, deliberate gating. No new behaviour — just consistency. (The third Yₙ draw, inside the `drill-pc` derivation block, is already in PC-context and must NOT be changed.)

### The edit
Wrap the UIP chart's Yₙ line+label draw in the same `if (tutorialState.unlocked.has('PC')) { ... }` guard the IS-LM chart uses. Match exactly — same condition, same gating, indentation consistent with surrounding code.

### Verifier assertion (REQUIRED — so it can't regress)
Add an assertion to `verify_onboarding.mjs`, in the chip/element-gating family (near the existing "Chip gating: ... does not render when PC is locked" checks): **Yₙ line/label is NOT drawn on the UIP chart when PC is locked, and IS drawn once PC is unlocked.** Mirror how the existing PC-gated chip assertions are structured. Include a BAD-fixture proving the assertion catches an ungated Yₙ (e.g. a version that draws Yₙ regardless of PC state must FAIL the check). This matches the project's existing gating-assertion style.

### Acceptance (FIX 1)
- [ ] UIP-chart Yₙ draw now inside `if (tutorialState.unlocked.has('PC'))`.
- [ ] IS-LM chart gate unchanged; the drill-pc Yₙ unchanged.
- [ ] New assertion + BAD-fixture added; both behave correctly.
- [ ] `node verify_onboarding.mjs` passes at new count (96 + new assertions); list what was added.
- [ ] `node verify_v19.mjs` still 52/0 (engine untouched).
- [ ] Browser: step to IS-Model and IS-LM-UIP stages → NO Yₙ line on EITHER the IS-LM or UIP chart. Step to a PC-unlocked stage → Yₙ appears on both. (Malin confirms visually.)

---

## FIX 2 — Context-aware Reset

### Behaviour (decided)
- **↺ Reset** = return to the **active scenario's starting state**, preserving the user's `speed`. If no scenario is active, wipe to generic `initialState` (current behaviour — must be preserved).
- **"-- Reset to Default Settings --"** dropdown option (first option, value `'default'`) = wipe to generic `initialState`, clear the active-scenario tracker.

### Current code (verbatim)
`reset()`:
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
`previewScenario(id)`: handles narrative + load-button enable; currently returns early if `!id`, else finds preset in SCENARIOS.
The scenario `<select id="scenario-select">` is empty in HTML, populated by JS (find where SCENARIOS is iterated to build `<option>`s).

### Edits
1. **Global tracker** — near `undoStack`/`state` globals, add `let currentScenarioId = null;` (grep-prove it doesn't already exist → 0 before edit).
2. **applyScenario records it** — add `currentScenarioId = id;` after the `state = Object.assign(...)` line.
3. **reset() branches on it**:
```
function reset() {
  const sp = parseFloat(document.getElementById('speed').value);
  if (currentScenarioId) {
    const preset = SCENARIOS.find(s => s.id === currentScenarioId);
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
4. **"default" dropdown option** — when building scenario `<option>`s, prepend `value="default"`, label `-- Reset to Default Settings --`. `previewScenario` gets a branch for `id === 'default'` (BEFORE the SCENARIOS.find) that enables the load button and sets a narrative like `'Wipe all settings back to the model defaults.'`. `applyScenario` gets an intercept at the top:
```
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
```

### CRITICAL — do not break the existing reset assertions
`verify_onboarding.mjs` asserts "Reset state is IS Model" / "Reset sets back to IS Model". With NO scenario active, `reset()` must behave EXACTLY as before (wipe to initialState). The `currentScenarioId` branch only changes behaviour when a scenario IS active. If those assertions fail, the no-scenario branch is wrong — fix the logic, do NOT weaken the assertion. (If the onboarding reset test calls `reset()` with a scenario somehow active, confirm the test's expectation and adjust the TEST SETUP, not the assertion meaning — and flag it for Malin rather than guessing.)

### Acceptance (FIX 2)
- [ ] `grep -o "currentScenarioId" <file> | wc -l` → 0 before, ≥4 after (decl + set + read + clear).
- [ ] `node verify_v19.mjs` → 52/0.
- [ ] `node verify_onboarding.mjs` → existing reset assertions STILL PASS at prior count. If reset behaviour is tested, it must still pass with no-scenario wiping to initialState.
- [ ] Browser (Malin): load a scenario (e.g. Taylor Principle) → drag sliders → ↺ Reset → returns to that scenario's START, not generic baseline. Pick "-- Reset to Default --" → wipes to generic. With nothing loaded, ↺ Reset → wipes to baseline (unchanged).

---

## Sequencing & forbidden
- Do FIX 1 first, its own diff, verify, hand back. Then FIX 2, its own diff. Two separate reviews.
- No bulk regex, no Set-Content, no multi-pass fix scripts. Surgical edits, grep-confirm each.
- No git commit/add/restore — Malin commits. No Economo file. No scratch files.
- No weakening any assertion. Run every check, print PASS/FAIL. STOP and report on any target not found verbatim, any unrelated assertion breaking, or ambiguity.
- Browser checks are the real gate for both fixes (verifiers can't see the rendered chart or the reset-to-scenario behaviour fully). Provide them / flag for Malin.
