# Spec: θ → Blanchard's convention (full internal rename) — engine + documentation

> Status: DRAFT. **Engine-touching** (state semantics change), so it needs Malin's sign-off and a
> verifier lock before the doc text is rewritten. Frank-level pedagogy decision already taken by
> Malin: the tool's θ will match Blanchard's θ exactly (θ = adaptive/de-anchoring weight; θ = 1
> fully adaptive, θ = 0 fully anchored). This is the "full internal rename" option: `s.theta`
> genuinely stores the adaptive weight, not a presentation trick.
>
> ⚠️ This is the single highest-risk change in the project so far: it inverts the meaning of a
> state variable that participates in the expectations dynamics. The controlling invariant is that
> **no solve()/step() numeric output may change for any equivalent state** — we are relabelling
> what the number means and inverting the stored value in lockstep, not altering the dynamics.
> Line numbers are from the 2026-07-09 afternoon engine upload; re-grep every string.

## 1. Goal (one sentence)
After this change, `s.theta` holds Blanchard's θ (the weight on last period's actual inflation;
θ = 1 fully adaptive, θ = 0 fully anchored), every user-facing surface and every document uses
that convention, and the expectations dynamics produce byte-identical trajectories to today's
build for the corresponding state.

## 2. The algebra (this is the whole change — get it exactly right)
**Today** (anchoring-high convention):
- `effectiveTheta(s) = s.theta * s.cred`  ← effective **anchoring** weight, call it A_eff
- drift `= A_eff·(π̄ − πᵉ) + (1 − A_eff)·(π − πᵉ)`
- So the weight on the target is A_eff; the weight on last period's actual inflation is (1 − A_eff).

**After** (Blanchard convention, `s.theta` = adaptive weight):
- The stored ceiling inverts: a state that today has `theta = t` becomes `theta = 1 − t`.
- Credibility is unchanged in meaning ("fraction of anchoring intact", still anchored-high) and
  unchanged numerically.
- Effective **anchoring** weight is now `A_eff = (1 − s.theta) * s.cred` — because (1 − s.theta)
  is the new anchoring ceiling, scaled by credibility exactly as before.
- drift is IDENTICAL once written in A_eff: `A_eff·(π̄ − πᵉ) + (1 − A_eff)·(π − πᵉ)`.

**Proof of numeric invariance:** take any pre-change state with ceiling `t` and cred `c`. Today
A_eff = t·c. After: stored theta = 1−t, so A_eff = (1 − (1−t))·c = t·c. Identical. The drift,
new_pi_e, credibility law, and every downstream value are therefore unchanged. This is the
invariant the verifier must lock (§6).

## 3. Engine edits (islm_pc_model_v19_Open_Economy_Complete_Demo.html)
Grep-prove each string; surgical edits only; no Set-Content.

**A. `effectiveTheta` — rename + reface.** This function currently returns the anchoring weight
but is named "theta". Rename it to say what it returns, and compute it from the new adaptive-θ:
- Line ~778: `function effectiveTheta(s) { return s.theta * s.cred; }` →
  `function effectiveAnchoring(s) { return (1 - s.theta) * s.cred; }`
- Add a one-line comment: `// Blanchard's θ is the ADAPTIVE weight; anchoring is (1−θ), scaled by credibility.`
- Update the two call sites:
  - Line ~810: `const theta_eff = effectiveTheta(s);` →
    `const anchoring = effectiveAnchoring(s);`
  - Line ~811 drift: `const pi_e_drift = theta_eff * (PI_TARGET - s.pi_e) + (1 - theta_eff) * (eq.pi - s.pi_e);` →
    `const pi_e_drift = anchoring * (PI_TARGET - s.pi_e) + (1 - anchoring) * (eq.pi - s.pi_e);`
  - Line ~2270: `const eff = effectiveTheta(state);` → `const eff = effectiveAnchoring(state);`
    (this feeds the meter; see D — the meter should show anchoring, not θ, so the variable name
    is now correct for what the meter displays.)

**B. Invert every stored θ value (state + presets).** New value = 1 − old:
- Line ~740 initialState: `theta: 1.0` → `theta: 0.0`  (fully anchored default stays fully anchored)
- Line ~2412 preset: `theta: 0.25` → `theta: 0.75`
- Line ~2418 preset (2a de-anchored): `theta: 0.15` → `theta: 0.85`
- Line ~2424 preset (2b anchored twin): `theta: 1` → `theta: 0`
- Line ~2430 preset: `theta: 0.7` → `theta: 0.3`
- Line ~2436 preset: `theta: 0.7` → `theta: 0.3`
- Line ~2442 preset: `theta: 0` → `theta: 1`
⚠️ Sanity after: presets 2a/2b are the twin experiment. 2a is the ADAPTIVE/de-anchored one — it
must end with the HIGHER θ (0.85). 2b is the anchored twin — θ = 0. If those two come out the
wrong way round, the inversion was applied backwards; stop and recheck. (Cross-check against the
narratives, which call 2a "mostly adaptive" and 2b the anchored twin.)

**C. Slider config (line ~723) — DECIDED: C2 (direct θ, drag-right = more adaptive).**
The slider directly controls Blanchard's θ. Dragging right raises θ = more adaptive /
backward-looking expectations; dragging left lowers θ = more anchored. Value stored as-is (no
display inversion). The drag direction is the reverse of today's "max anchoring" slider — that is
intended and is the honest Blanchard mapping.
- Line ~723 replace:
  `{ key: 'theta', block: 'PC', label: 'Max anchoring (ceiling), θ', min: 0, max: 1, step: 0.05, fmt: v => v.toFixed(2) },`
  →
  `{ key: 'theta', block: 'PC', label: 'Adaptiveness θ', min: 0, max: 1, step: 0.05, fmt: v => v.toFixed(2), infoText: 'Blanchard\u2019s θ (eq. 8.7): weight on last period\u2019s inflation. Right = higher θ = more adaptive / backward-looking; left = lower θ = more anchored to target. θ = 0 fully anchored, θ = 1 fully adaptive.' },`
- The θ slider currently has NO `infoText`, so its only explanation is the "How credibility works"
  drill box (§3F). Adding `infoText` per above gives it a hover tooltip like the m/z sliders have.
  Confirm the slider-render path actually surfaces `infoText` on hover for PC-block sliders (grep
  `infoText` usage in the render code; m_struct/z_struct rely on the same field, so it should) —
  if for some reason it doesn't render, that wiring is in scope for this slice since the tooltip is
  a stated requirement.

**D. The effective-anchoring meter (lines ~2280–2285).** Currently:
`effective θ = cap × credibility = <value>`. The displayed quantity is the anchoring weight, so
the label was already misleading (it called an anchoring weight "θ"). Fix the label to match what
it shows: `effective anchoring = (1 − θ) × credibility = <value>`. The `<value>` (from
`effectiveAnchoring`) is numerically unchanged.

**E. Warning-chip thresholds and text (lines ~1955, ~1958, ~1980, ~1990, ~2512).**
- Line ~1955 threshold: `state.theta < 0.65` currently means "weak anchoring". In the new
  convention weak anchoring = HIGH θ, so this becomes `state.theta > 0.35`. (0.65 anchoring ceiling
  ⇒ 0.35 adaptive; keep the same crossover point.)
- Line ~1958 message: `Weak anchoring (θ = ${...} < 0.65)` → `Weak anchoring (θ = ${...} > 0.35)`
  and `Raise θ or switch the Taylor rule on.` → `Lower θ or switch the Taylor rule on.`
- Line ~1980: `effective θ = ${effectiveTheta(state)...}` →
  `effective anchoring = ${effectiveAnchoring(state)...}`.
- Line ~1990: `expectations are held fixed (θ = ${state.theta...})` — with de-anchoring off this
  fires regardless of θ value; the θ readout is just informational, but it now prints the adaptive
  weight, so reword to `(θ = ${state.theta...}, Blanchard's adaptive weight)` to avoid implying
  high = anchored.
- Line ~2512 debug dump: `θ (ceiling) = ${state.theta}  cred = ${state.cred}  eff θ = ${state.theta*state.cred}`
  → `θ (adaptive, Blanchard) = ${state.theta}  cred = ${state.cred}  eff anchoring = ${(1-state.theta)*state.cred}`.

**F. The credibility explainer copy (lines ~470–476 and ~1208–1214, duplicated block).**
Currently: "Effective anchoring = θ × credibility: at θ=1, full credibility pins expectations to
π*". Reword to the new convention: "Effective anchoring = (1 − θ) × credibility: at θ = 0
(Blanchard's fully-anchored case) with full credibility, expectations are pinned to π*; at θ = 1
they track last period's inflation." Both copies must match — grep to confirm there are exactly
two and edit both.

## 4. What must NOT change
- Any solve()/step() NUMERIC output for an equivalent state (the whole point — see §2 proof).
- The credibility stock, its law of motion (`nextCredibility`), and the de-anchoring toggle —
  meaning and math both unchanged.
- `speed`, `alpha`, `z`/`shock`, and every non-θ parameter.
- The credibility slider (line ~724) — it stays "Current credibility", anchored-high, untouched.

## 5. Documentation edits (do AFTER the engine change is committed and verifier-green)
The doc currently DESCRIBES the inversion as a live deviation. Once the engine matches Blanchard,
that entire framing is deleted, not softened.
- **§6.5 convention note** (the italic "watch the subscript" caveat just added): DELETE it
  entirely. θ now means the same thing in both the tool and Blanchard, so there is nothing to warn
  about. The surrounding Blanchard-θ paragraph becomes simply correct with no caveat.
- **§6.6** (Inflation expectations and anchoring — eq. 8.7): remove the "inverted mapping / tool's
  credibility runs opposite to Blanchard's θ" language. Replace with a straight statement that the
  tool implements eq. 8.7 with θ as Blanchard defines it, plus the tool's ADDITION of an
  endogenous credibility stock (which is the real, remaining deviation — keep that flagged as
  TOOL ADDITION, because it genuinely is one).
- **§6.7 summary table row** for Expectations: change status from the current "Inverted mapping…"
  wording to `EXACT (θ per eq. 8.7) + TOOL ADDITION (credibility stock)` or split into two rows.
- **§6.6 card** (the correspondence card): its "Change" line currently says the tool's θ runs
  opposite to Blanchard's — replace with: θ matches Blanchard exactly; the tool adds an
  endogenous credibility stock (cred ∈ [0,1]) that scales effective anchoring, which Blanchard's
  static eq. 8.7 does not have.
- Anywhere the docs say "θ_eff = θ × credibility", update to "effective anchoring = (1 − θ) ×
  credibility" to match the engine.
- Re-grep all three documents for "inver", "mirror image", "opposite", "watch the subscript",
  "θ_eff = 1 is anchored" — all should be gone after this pass.

## 6. Invariants / verifier (the safety net for a semantics change)
- **INV-θ-NUMERIC (the critical one):** for a representative sweep of states, stepping the model
  must produce the SAME πᵉ trajectory as the pre-change build. Concretely: pick 3 states (anchored,
  mid, adaptive), run N steps, and assert the πᵉ/π/cred series equal a hard-coded expected series
  captured from the CURRENT build BEFORE the change. Capture those golden series first (run the
  current engine, record the numbers), embed them, THEN make the change; the test proves invariance.
- **INV-θ-BLANCHARD:** assert `initialState.theta === 0` (fully anchored default in the new
  convention) and that preset 2a's theta (0.85) > preset 2b's theta (0.0) — locks the twin
  experiment against a backwards inversion.
- **BAD-fixture:** a copy that inverts only the drift but not the presets (or vice versa) must
  fail INV-θ-NUMERIC — proves the test actually catches a half-applied flip.
- Grep-lock: engine contains no `effectiveTheta` (renamed) and no `θ × credibility` / `cap ×
  credibility` display strings.
- Both verifiers green at current counts (plus the new assertions); mutation_check passes; HS-1.

## 7. Sequencing (strict)
1. Capture golden πᵉ/cred series from the CURRENT engine (for INV-θ-NUMERIC).
2. Apply engine edits §3 A–F.
3. Run INV-θ-NUMERIC — must match the golden series exactly. If not, the algebra in §2/§3A is
   wrong; STOP.
4. Both verifiers green, mutation_check, HS-1, browser check (slider, meter, warning chips, presets
   load and behave identically).
5. Malin commits the engine change.
6. ONLY THEN apply the documentation edits §5, re-verify anchors + grep-locks, commit docs.

## 8. Done criteria
- [ ] §2 algebra implemented; INV-θ-NUMERIC proves byte-identical πᵉ/cred trajectories.
- [ ] All 7 stored θ values inverted; twin-experiment sanity (2a > 2b) holds.
- [ ] Slider implemented as C2: label "Adaptiveness θ", drag-right = higher θ = more adaptive,
      value stored directly, with the specified `infoText` hover tooltip present and rendering.
- [ ] Meter, warning chips, debug dump, and both credibility-explainer copies reworded.
- [ ] Docs: convention caveat deleted; §6.6/§6.7 restated so θ = EXACT and credibility stock =
      TOOL ADDITION; grep for "invert/mirror/opposite/subscript" returns zero.
- [ ] Verifiers green + new assertions; mutation_check; HS-1; browser check.
- [ ] Full diff read by Malin before each of the two commits (engine, then docs).
