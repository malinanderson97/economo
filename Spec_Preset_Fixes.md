# Spec: Preset scenario fixes (2a θ inversion · preset 5 narrative · preset 1/4 wording)

> Status: READY. Evidence: headless engine evaluation of all six presets against their own
> narrative claims (harness `eval_presets.mjs`, run 2026-07-04). All proposed changes
> pre-verified green against verify_v19 test-2 assertions before this spec was written.

## 1. Goal (one sentence)
Fix three factual errors in the preset scenario library — preset 2a's inverted θ value,
preset 5's false "raise i_target" instruction (provably inert under Taylor ON) and false
"settles above 2%" claim, and preset 1's "into deflation" wording — plus one precision
correction in preset 4, all within the `SCENARIOS` array (narrative text + one state
scalar; NO engine code touched).

## 2. File and scope
- File: `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (the single canonical file).
- Scope: the `SCENARIOS` const only, plus one amended assertion in `verify_v19.mjs`.
- OUT of scope: `solve()`, `step()`, `computeYn()`, any UI code, the dead `Y_n: 100`
  fields in preset states (logged as a separate micro-TODO — do NOT strip them in this
  slice), and anything else not named below.

## 3. Evidence (why each change is correct)
1. **θ semantics.** The engine's expectations drift is
   `pi_e_drift = θ_eff·(π* − πᵉ) + (1−θ_eff)·(π − πᵉ)`: θ=1 pins πᵉ to target
   (ANCHORED); θ=0 makes πᵉ track past inflation (ADAPTIVE). The sidebar hint text says
   exactly this. Preset 2a sets `theta: 1` while its narrative claims "θ = 1:
   expectations are purely adaptive" — inverted. Measured: with `theta: 1`, πᵉ races
   8%→5%→3.9%→3.1%→2.5% toward target regardless of actual π.
2. **θ = 0.15 chosen over 0** (Malin decision point — see §7). Sweep results, 300
   periods, verify-style metrics:
   | θ | trough Y | min π | recover t | notes |
   |---|---|---|---|---|
   | 0.00 | 84.2 | −12.5% | 91 | deflation whipsaw + Y overshoot to 113.7 — chaotic |
   | 0.15 | 85.7 | +0.3% | 17 | clean painful grind, no deflation | ← chosen
   | 1.00 (current) | 78.7 | ~0% | 7 | one-period whipsaw, wrong mechanism |
   2b (anchored) troughs at 96.1 → the fixed contrast is a ~4×-deeper recession plus
   2.4×-slower recovery under adaptive expectations. That is the intended lesson.
3. **Preset 5 i_target inertness.** In `step()`, when `taylor_on` the rate comes
   entirely from the structurally computed neutral rate + gap terms; `raw_i = s.i_target`
   is overwritten and never blended. Measured: 200-period runs with `i_target` 0.03 vs
   0.06 end bit-identical (Y=99.999, π=2.008%, i=5.960%). The narrative's "raise
   i_target toward the new world rate to bring it home" instruction does nothing, and its
   claim "inflation settles somewhat above 2%" is false (settles at target).
4. **Preset 1 "deflation".** Phase-B trace (φ=0.5 + second shock): min π ≈ +2.7% over
   150 periods — never negative. What actually happens: i is cut to the −0.5% ZLB floor
   for several periods and the return to target is slow and oscillating.
5. **Preset 4.** ε settles at 1.029, narrative says ≈1.04. Retitle ≈1.03.

## 4. Edits (surgical, exact-string; grep-prove each old string exists verbatim and is unique FIRST)

### Edit A — preset 2a state scalar
OLD (unique):
`theta: 1, cred: 1.0, deanchor_on: true`
NEW:
`theta: 0.15, cred: 1.0, deanchor_on: true`
(Only ONE occurrence in the file — it is inside preset 2a's state. Preset 2b uses
`deanchor_on: false` so is not matched. Confirm count = 1 before editing.)

### Edit B — preset 2a narrative (full replacement of the narrative string)
OLD narrative begins: `θ = 1: expectations are purely adaptive and start at 8%.`
NEW narrative:
`θ = 0.15: expectations are mostly adaptive and start at 8%. A transitory cost-push shock (z_pulse = +2%) hits. Disinflation requires a deep, drawn-out recession because the central bank must drag πᵉ down by brute force — the policy rate spends several periods pinned at the ZLB along the way. Since the shock is transitory, output eventually returns to exactly potential (100). Contrast the depth and length of this slump with preset 2b. Permanent supply shocks have no stationary equilibrium in the open economy under naive exchange-rate expectations (Blanchard Ch. 20).`

### Edit C — preset 5 narrative (full replacement)
OLD narrative ends: `a stale-intercept lesson.`
NEW narrative:
`Foreign rates jump to 6%. UIP wants a weaker domestic currency unless the CB matches the hike. With Taylor ON, the domestic rule sees the inflationary depreciation and hikes i. Because the rule anchors to the structurally computed neutral rate, the economy converges cleanly: i settles at the new world rate (6%), inflation returns to the 2% target, and the lasting cost is a persistently weaker nominal E. The lesson: under UIP, a small open economy with a credible rule ends up importing the world interest rate — the exchange rate, not the inflation rate, absorbs the shock.`

### Edit D — preset 1 narrative wording
OLD (within narrative, unique): `the economy overshoots into deflation, the rate is cut nearly to zero`
NEW: `the rate is cut to the ZLB floor and pinned there for several periods`
(Leave the rest of the sentence — "expectations de-anchor (watch the warning chip), and
the return to target takes far longer and oscillates" — untouched.)

### Edit E — preset 4 precision
OLD (unique): `ε permanently higher (≈1.04)`
NEW: `ε permanently higher (≈1.03)`

### Edit F — verify_v19.mjs, strengthen test 2 to lock the fixed behaviour
In the test-2 block, after the existing `trough < 98` check, ADD one assertion:
```js
check('2 deAnchored recession is deep (adaptive expectations)', trough < 90,
      `trough Y=${trough.toFixed(1)} (θ=0.15 sacrifice: must be well below the anchored preset's 96.1 trough)`);
```
Do NOT change the existing two test-2 assertions. Pre-verified: with θ=0.15 the trough is
85.7 (<90 PASS), end Y=100.000 (PASS), all values finite (PASS).

## 5. Verification gate
1. `node verify_v19.mjs` → must be 56/0 (55 existing + 1 new).
2. `node verify_onboarding.mjs` → 102/0 unchanged.
3. `node mutation_check.mjs` → green.
4. HS-1 headless construct-check after the HTML edit.
5. Browser check (Malin): load preset 2a at Full Model stage, Run to rebalance — expect a
   deep slump (trough ≈86), a visible ZLB episode, NO negative inflation, and slow
   recovery; contrast side-by-side with 2b (shallow dip to ≈96). Load preset 5, run —
   inflation returns to 2%, i to 6%. Read all four amended narratives in the preview pane.

## 6. Standing prohibitions (restated — mandatory)
- NO scratch/debug files written to disk. NO `Set-Content` on the HTML file — surgical
  exact-string edits only, one at a time, each old string grep-proven to exist verbatim
  and be unique BEFORE editing.
- NO `git restore`, `git checkout`, `git stash`, or any state-changing git operation.
  Malin is the sole committer.
- NO out-of-scope ride-along edits (this includes the dead `Y_n` fields, the copy-state
  header, and anything cosmetic you notice along the way).
- Output the COMPLETE diff of every change. No summarising, no truncation.

## 7. Open decision (Malin, before dispatch)
θ = 0.15 vs 0 for preset 2a. 0 is the literal "purely adaptive" endpoint but produces a
−12.5% deflation whipsaw and Y overshoot to 113.7 (chaotic, arguably a worse lesson);
0.15 gives the clean deep-grind sacrifice story. Spec assumes 0.15; if Malin prefers 0,
change Edit A's NEW string to `theta: 0` and Edit B's opening to
`θ = 0: expectations are purely adaptive…`, and note the deflation episode in the
narrative. Either value passes the verifier gate (both pre-tested).
Pedagogical framing of 2a/2b may also belong in the Frank sign-off bundle.
