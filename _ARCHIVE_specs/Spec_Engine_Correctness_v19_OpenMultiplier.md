# Spec — Engine Correctness: v19 Open Multiplier + Reconciliation Gate

**Type:** Engine spec (NOT display/UI). Keep separate from Slice 2.
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (open economy only).
**Do NOT touch:** `islm_pc_model_v16_Closed_Economy_MediumRun.html` — its `isOutput`
  is already structurally correct (`k = 1/(1−c1−d1)`, terms scaled by `c1·k`, `d1r·k`).
**Governed by:** CLAUDE.md + `.agents/AGENTS.md` (esp. the rule that a verifier check is
  NEVER weakened to make code pass — a red check that reflects a real defect must stay
  red until the *engine* is fixed), the `macro-model-verification` skill, and
  `Model_Textbook_Correspondence.docx` §4–§5 (the open IS reduced form).
**Gate:** `node verify_v19.mjs`, `node verify_onboarding.mjs`, and `node mutation_check.mjs`
  must all be green. Agent self-report / "looks healthy" is NOT the gate.

---

## 0. Background — the bug and the improper weakening

### 0.1 The engine bug (real)
`v19`'s `isOutput` is a stale closed-economy reduced form:

```js
function isOutput(G, T, r, eps) {
  return IS_Y_BASE
       + 2   * (G - IS_G_BASE)
       - 1   * (T - IS_T_BASE)
       - 400 * (r - IS_R_BASE)
       - 100 * (eps - IS_EPS_BASE);
}
```

Problems:
- Hardcoded fiscal multiplier of **2** (∂Y/∂G = 2). No accelerator, no import leakage.
- `solve()` calls it as `isOutput(s.G, s.T, r, eps, s.c1, s.m1, s.Ystar)` but the function
  signature only accepts `(G,T,r,eps)` — **`c1`, `m1`, `Ystar` are silently ignored.**
  Moving the `m1`, `c1`, or `Y*` sliders does not move `Y`. `isRateForOutput` has the
  same defect.
- The whole open-economy multiplier lesson (Correspondence §4) is therefore **not in the
  engine**, even though §4.1 / the README / the IS-drag handler / the (corrected)
  equation box all use `k_o = 1/(1−c1−d1+m1) ≈ 1.43`.

Confirmed numerically (G: 20→22, taylor off, r=r0, ε=1):
- stale engine: Y = 104 (ΔY = 4 ⇒ multiplier 2); C+I+G+NX from that Y = 103.2 → **0.8 gap**.
- correct open engine: Y = 102.857 (ΔY = 2.857 = 1.4286·2); C+I+G+NX = 102.857 → **0 gap**;
  baseline still exactly 100.

### 0.2 The improper weakening (to undo)
The equation-display correctness pass added a reconciliation check in
`verify_onboarding.mjs` (`testReconciliation`). It went **red off-baseline** because the
engine (multiplier 2) and the corrected component display (multiplier 1.43) disagree —
which is **correct behaviour**: the check found the engine bug.

Antigravity then weakened the check (dropped the "components must reconcile to the engine's
`Y`" requirement) and declared the code healthy. The current check only verifies:
1. each displayed `eq-num` expression evaluates to its own `eq-res` (display self-arithmetic), and
2. each displayed component equals a formula **recomputed from `eq.Y`** (circular — confirms
   the display reused `eq.Y`, never that the component sum equals `eq.Y`).

Neither catches the multiplier defect. The structural fixed-point condition
`C(Y) + I(Y,r) + G + NX(Y,ε) = Y` is exactly what's missing.

---

## 1. Restore the strict reconciliation check (`verify_onboarding.mjs`)

In `testReconciliation`, **add** a third requirement (do not remove the existing two):

> **The independently-summed components must equal the engine's `Y`.**
> Compute `C, I, G, NX` from `eq.Y`, `eq.r`, `eq.eps` and the state coefficients exactly as
> the engine's structural primitives define them, then assert
> `|（C + I + G + NX) − eq.Y| ≤ 0.01`.

Reference implementation (adapt to existing helpers/naming in the file):

```js
// 3. STRUCTURAL FIXED-POINT: components must reconcile to the engine's Y.
//    This is the gate that catches a wrong multiplier in isOutput.
{
  const st = testRender.state;
  const C  = 20 + st.c1 * (eq.Y - st.T);            // c0=20
  const I  = 12 + 0.10 * eq.Y - 200 * eq.r;         // d0=12, d1=0.10, d1r=200
  const G  = st.G;
  const NX = 0.30 * st.Ystar - st.m1 * eq.Y - 70 * (eq.eps - 1); // x1=0.30, n1=70
  const sum = C + I + G + NX;
  if (Math.abs(sum - eq.Y) > 0.01) {
    console.log(`  FAIL [${desc}] components ${sum.toFixed(4)} != engine Y ${eq.Y.toFixed(4)} (gap ${(sum-eq.Y).toFixed(4)})`);
    ok = false;
  }
}
```

- Keep all five existing `check('Eq Reconciliation: …')` cases.
- **Add an off-baseline fiscal case that exercises the multiplier:**
  `check('Eq Reconciliation: +ΔG multiplier', testReconciliation({ G: 24, taylor_on: false }, '+2ΔG'));`
  With the stale engine this MUST go red; with the fixed engine it MUST be green.
- Keep the existing BAD-fixture test (hardcoded-coefficient catch).
- **Do not** widen any tolerance to make a check pass. If `verify_onboarding` is red after
  step 1 and before step 2, that is correct — proceed to step 2, do not relax.

---

## 2. Fix `isOutput` and `isRateForOutput` (v19 engine)

Replace the stale reduced form with the structural open multiplier, mirroring v16's pattern
but with the open-economy denominator and the two foreign channels. Use the structural
primitives already declared as constants (`d1=0.10`, `d1r=200`, `x1=0.30`, `n1=70`,
`YSTAR_BASE=100`) plus `c0=20`, `d0=12`.

```js
const IS_C0 = 20;   // c0  (autonomous consumption; = 32 − 12 as used in eq box)
const IS_D0 = 12;   // d0  (autonomous investment)

// Open-economy IS, structural. k_o = 1/(1 − c1 − d1 + m1) — the import leakage m1 is
// INSIDE the denominator, so a higher m1 lowers every multiplier (Blanchard Ch. 18).
function isOutput(G, T, r, eps, c1, m1, Ystar) {
  const c  = (c1    !== undefined) ? c1    : 0.5;
  const m  = (m1    !== undefined) ? m1    : 0.30;
  const Ys = (Ystar !== undefined) ? Ystar : YSTAR_BASE;
  const k_o = 1 / (1 - c - d1 + m);
  // Autonomous demand A, then Y = k_o · A. Equivalent deviation form below.
  return IS_Y_BASE
       + k_o          * (G   - IS_G_BASE)        // ∂Y/∂G   = k_o      ≈ +1.43
       - (c   * k_o)  * (T   - IS_T_BASE)        // ∂Y/∂T   = −c1·k_o  ≈ −0.71
       - (d1r * k_o)  * (r   - IS_R_BASE)        // ∂Y/∂r   = −d1r·k_o ≈ −286
       - (n1  * k_o)  * (eps - IS_EPS_BASE)      // ∂Y/∂ε   = −n1·k_o  ≈ −100
       + (x1  * k_o)  * (Ys  - YSTAR_BASE);      // ∂Y/∂Y*  = x1·k_o   ≈ +0.43
}

// Inverse: real rate r that puts the IS curve at output Y, then nominal i = r + pi_e.
// Invert the r-channel only; all other terms move to the RHS, scaled by the SAME k_o.
function isRateForOutput(Y, G, T, eps, pi_e, c1, m1, Ystar) {
  const c  = (c1    !== undefined) ? c1    : 0.5;
  const m  = (m1    !== undefined) ? m1    : 0.30;
  const Ys = (Ystar !== undefined) ? Ystar : YSTAR_BASE;
  const k_o = 1 / (1 - c - d1 + m);
  const rhs = IS_Y_BASE
            + k_o         * (G   - IS_G_BASE)
            - (c   * k_o) * (T   - IS_T_BASE)
            - (n1  * k_o) * (eps - IS_EPS_BASE)
            + (x1  * k_o) * (Ys  - YSTAR_BASE);
  const r = IS_R_BASE + (rhs - Y) / (d1r * k_o);
  return r + pi_e;
}
```

**Invariants the fix must satisfy (the agent must check these, not just transcribe):**
- **Baseline preserved:** `isOutput(20,20,0.01,1,0.5,0.30,100) === 100` exactly. Likewise
  the round-trip `Y → isRateForOutput → r → isOutput → Y` returns the input Y (the existing
  self-test at the bottom of the HTML already asserts both — they must still pass).
- **`isRateForOutput` inverts `isOutput`** under the *same* `(c1,m1,Ystar)`. Because both
  share one `k_o`, the r-channel coefficient in the inverse is `d1r·k_o` (NOT a bare 400).
- **No bare magic numbers** left in either function (`2`, `400`, `100`, `-1` must all be gone;
  every coefficient derives from a primitive × `k_o`).
- The `eps` (real exchange) coefficient is now `−n1·k_o`, which equals −100 only at the
  default `c1=0.5, m1=0.30`. Moving those sliders MUST move it. (The stale `−100` was a
  coincidence at default calibration.)
- Both functions keep their existing call sites unchanged — `solve()` already passes
  `(s.G, s.T, r, eps, s.c1, s.m1, s.Ystar)`; `isRateForOutput` is called with
  `(Y, G, T, eps, pi_e, c1, m1, Ystar)`. Confirm the argument ORDER matches every call site
  (the inverse takes `pi_e` before the `c1,m1,Ystar` trio).

**No display/UI edits in this spec.** The equation box, IS-drag handler, and `k_o`
expressions there are already correct (they use `1/(1−c1−d1+m1)`); leave them. This spec
only makes the engine agree with what they already display.

---

## 3. New `verify_v19.mjs` assertion — pin the open multiplier to `isOutput` directly

This closes the documented gap (baseline calibrates to Y=100 regardless, so existing checks
never test the multiplier).

**3a. Export the engine functions.** In the `new Function(... 'return {...}')()` line (currently
~lines 35–41), add `isOutput, isRateForOutput` to both the `return {…}` object and the
destructuring assignment.

**3b. Add assertion block "15 open multiplier"** that calls `isOutput` directly (not `solve`,
not the formula — the actual engine function), at default coefficients `c1=0.5, m1=0.30,
Ystar=100`, r and ε at baseline:

```js
{
  const Y0 = isOutput(20, 20, IS_R_BASE, 1, 0.5, 0.30, 100);
  const Yg = isOutput(21, 20, IS_R_BASE, 1, 0.5, 0.30, 100);   // +1 G
  const Yy = isOutput(20, 20, IS_R_BASE, 1, 0.5, 0.30, 101);   // +1 Y*
  const Ym = isOutput(20, 20, IS_R_BASE, 1, 0.5, 0.40, 100);   // m1 0.30→0.40

  check('15 baseline isOutput=100', approx(Y0, 100, 0.001), `Y0=${Y0.toFixed(4)}`);
  check('15 dY/dG ≈ 1.43',  approx(Yg - Y0, 1.4286, 0.02), `ΔY/ΔG=${(Yg-Y0).toFixed(4)}`);
  check('15 dY/dY* ≈ 0.43', approx(Yy - Y0, 0.4286, 0.02), `ΔY/ΔY*=${(Yy-Y0).toFixed(4)}`);
  // import leakage: raising m1 must STRICTLY lower output at the same demand
  check('15 higher m1 lowers Y (leakage)', Ym < Y0 - 0.01, `Y(m1=.40)=${Ym.toFixed(4)}`);
}
```

Rationale for the `m1` sub-check: it is the single assertion that the stale engine cannot
pass (the stale form ignores `m1` entirely, so `Ym === Y0`). It is the canary for this
exact bug class.

**3c. Self-test the assertion** in the spirit of the existing analyzer self-tests: include a
tiny inline fixture proving the new check fails against a stale `(G,T,r,eps)`-only stub and
passes against the structural one, so the assertion can't silently rot.

---

## 4. Re-run `mutation_check.mjs`

The known v19 gap was: mutating `d1`, `d1r`, `c1`, `m1` did not get caught because baseline
calibrates to 100 regardless. With the engine now using those primitives and assertion 15
pinning ∂Y/∂G, ∂Y/∂Y*, and the m1-leakage sign:

- Run `node mutation_check.mjs` and confirm the v19 multiplier mutations are now **caught**.
- If any mutation still slips through, report which coefficient and which assertion *should*
  have caught it — do not patch by loosening; extend assertion 15 instead.
- Update the documented "known gap" note (in `mutation_check.mjs` and/or the
  `macro-model-verification` skill) from "not caught" to "caught by verify_v19 #15".

---

## 5. Correct the Correspondence doc (engine-truth, last)

`Model_Textbook_Correspondence.docx` (UTF-8 markdown despite the `.docx` extension), §4.1,
line ~204 currently claims the faithful IS "**changes are now implemented in both variants**"
with a table headed "Faithful (Ch. 9), **now implemented**".

That was true for v16 and false for v19 until this spec lands. After steps 1–4 are green,
make the doc match reality:
- Change the §4.1 framing so "now implemented in both variants" is only asserted **after**
  this engine fix (i.e. it becomes true once merged). Until merged it overstates v19.
- Suggested edit: note explicitly that **v16 carried the structural form first; v19's
  `isOutput` was migrated to the open multiplier `k_o = 1/(1−c1−d1+m1)` in this pass**, and
  that the §4.3 reduced-form coefficients (∂Y/∂G=+1.43, ∂Y/∂T=−0.71, ∂Y/∂r=−286,
  ∂Y/∂ε=−n1·k_o≈−100, ∂Y/∂Y*=+0.43) are now produced by the engine, verified by
  `verify_v19` #15, not merely documented.
- Do not alter the algebra in §4.2–§4.4 (it is correct and is the source of truth this fix
  implements).
- This is a documentation edit; it does not gate the verifiers but should be committed in the
  same change so the doc never again claims more than the engine delivers.

---

## 6. Order of operations & commit discipline

1. Step 1 (restore strict reconciliation) — expect `verify_onboarding` to go RED. Good.
2. Step 2 (fix `isOutput`/`isRateForOutput`) — `verify_onboarding` returns to GREEN; the
   in-HTML self-tests still pass; baseline still 100.
3. Step 3 (verify_v19 #15 + exports + self-test) — `verify_v19` GREEN, now with multiplier coverage.
4. Step 4 (`mutation_check.mjs`) — mutations caught; update the gap note.
5. Step 5 (doc) — correct §4.1.
6. `git add -A && git commit` only after **all three** verifiers are green. Do NOT commit
   between steps 1 and 2 (intentionally-red state).

**Acceptance (all must hold):**
- [ ] `node verify_v19.mjs` green, including new #15 (and its self-test).
- [ ] `node verify_onboarding.mjs` green, including the restored fixed-point requirement and
      the new `+2ΔG` case.
- [ ] `node mutation_check.mjs`: v19 `d1/d1r/c1/m1` mutations caught.
- [ ] In-HTML self-tests still pass (baseline isOutput=100; round-trip Y→r→Y).
- [ ] Moving the `m1` and `Y*` sliders visibly moves `Y` in the running tool (manual browser
      check — engine-correct ≠ diagram-correct, but here it's an engine claim so the slider
      response is the live confirmation).
- [ ] Correspondence §4.1 no longer overstates v19.
- [ ] No tolerance was widened anywhere to pass a check.

## 7. Guardrails (do NOT do)
- Do NOT edit v16 (`isOutput` already correct there).
- Do NOT touch the equation box, IS-drag handler, UIP/PC/debt blocks, or any Slice-2 display work.
- Do NOT weaken, delete, or loosen any verifier check to make a step pass.
- Do NOT `Set-Content` the HTML files in PowerShell (Unicode destruction); edit in place.
- Do NOT hardcode `1.43`, `2.5`, `286`, etc. in the engine — every coefficient = primitive × k_o.
- Naming: composite chart is "ISLM", flat blue line is "LM" (display only). Internal
  `EQ_COL.MP` / `curve-mp` identifiers stay as-is; do not rename them in this pass.
