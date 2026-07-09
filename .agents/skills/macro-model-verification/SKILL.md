---
name: macro-model-verification
description: >
  Use whenever you are about to change, or have just changed, the solve()/step()
  economic engine of the IS-MP-PC interactive macro models
  (islm_pc_model_v16_Closed_Economy_MediumRun.html or
  islm_pc_model_v19_Open_Economy_Complete_Demo.html), or any of their structural
  coefficients, the Taylor rule, the Phillips curve, the credibility/expectations
  mechanism, or the open-economy UIP/exchange-rate channel. Trigger this before
  declaring any engine edit "done." Do NOT trigger for pure styling, layout, copy,
  or other UI-only changes that cannot affect model output.
---

# Verifying economic correctness of the IS-MP-PC models

## Why this skill exists

The hard part of this project is **economic correctness, not HTML/JS**. The engine
can be syntactically perfect and still be economically wrong in ways that produce
plausible-looking output. "It looks reasonable" is the failure mode, not the
success criterion. The correct numbers (multipliers, reduced-form coefficients,
convergence behavior) are NOT something to reconstruct from memory — they are
fixed by the model's structural parameters and must be checked numerically after
every engine change.

Note: The correct harnesses to use are `verify_v16.mjs` and `verify_v19.mjs` located at the repository root. You must run both of them.

## What to do — every time you touch the engine

1. **Before editing**, identify which block you are changing: IS (goods market),
   MP (monetary policy / Taylor rule), PC (Phillips curve), the expectations /
   credibility mechanism, or the open-economy UIP channel. Re-read the matching
   section of the project README so you know the invariant the change must preserve.

2. **After editing**, run BOTH verification harnesses from the project directory
   (the repository root containing `verify_v16.mjs` and `verify_v19.mjs`):

   ```bash
   node verify_v16.mjs
   node verify_v19.mjs
   ```

   **Resolve the path robustly:** Do not assume your current working directory is the repo root.
   The root verifiers are located 3 levels up from this skill folder (`../../../`). If you are not in the repo root, you must search upward or use relative paths to locate `verify_v16.mjs` and `verify_v19.mjs`. If the verifiers cannot be found, you MUST fail loudly with the message "root verifiers not found" and never silently pass.

3. **Require ALL GREEN from BOTH verifiers.** A non-zero exit code, any `FAIL` line, or a crash in either means the skill reports failure. Do not report success unless both runs are fully green. If any invariant fails, the change is economically wrong
   (or an invariant genuinely needs updating — see below). Do not present the work
   as complete with a failing or unrun check.

## The invariants that must hold

These come from the README and the in-browser self-tests. The harness checks them;
this list is the human-readable spec so you can reason about *why* a failure happened.

**Closed economy (v16):**
- Multiplier `k = 1/(1-c₁-d₁) = 2.5` at baseline (`c₁=0.5, d₁=0.1`).
- Reduced-form responses: `ΔY = +2.5·ΔG`, `ΔY = -1.25·ΔT`, `ΔY = -500·Δr` (`d2=200`).
- Baseline `isOutput(...) = IS_Y_BASE = 100`.

**Open economy (v19):**
- Multiplier `k_o = 1/(1-c₁-d₁+m₁) ≈ 1.43` at baseline (`c₁=0.5, d₁=0.1, m₁=0.3`).
- `k_o < k_closed` whenever `m₁ > 0` (imports leak the multiplier).
- Reduced-form responses: `ΔY = +1.43·ΔG`, `-0.71·ΔT`, `-286·Δr`, `≈ -100·Δε`, `+0.43·ΔY*`.

**Both models:**
- Round-trip `Y → r → Y` recovers the original output (the IS inverse is consistent).
- **Taylor convergence:** with the Taylor rule on, a permanent +1pt demand shock
  (`G: 20→21`) returns output to potential `Yₙ` within ~60 periods (gap < 0.1).
  This depends on the rule anchoring to the *shock-aware neutral rate* `r_neutral`.
- **Higher markup ⇒ lower potential:** `computeYn` with higher `m_struct` yields
  lower `Yₙ` (eq. 8.4 sign). `Yₙ = (m_struct + z_struct)/ALPHA_WS`.

## If an invariant "should" change

Sometimes a change is *meant* to alter an invariant (e.g. retuning a baseline
coefficient). In that case:
- Update the invariant in BOTH the in-browser self-test block (search the HTML for
  `SELF-TESTS`) AND in the corresponding root verifier (`verify_v16.mjs` or `verify_v19.mjs`), with a comment explaining why.
- Re-derive the new expected number from the structural parameters by hand; never
  just paste in whatever the new code happens to output (that defeats the test).
- Confirm the README's "What the model is" section still matches.

## Scope boundaries — do NOT "fix" these

The README documents intentional limitations. Do not treat them as bugs:
- Open economy (v19) uses **backward-looking (naive) FX expectations** by design.
- **Permanent** open-economy supply shocks have no stationary equilibrium (per
  Blanchard Ch. 20) because of naive FX + UIP. Test open-economy supply shocks with
  **transitory** shocks only. Forward-looking FX is explicitly out of scope (v2).

## Cross-checking against Blanchard

For any new or changed *mechanism* (not just a coefficient tweak), confirm it
matches the framework before trusting it: consult `Model_Textbook_Correspondence.docx`
and the Blanchard textbook PDF in the project. If a proposed mechanism can't be tied
to a specific Blanchard relationship, flag the uncertainty to the user rather than
shipping it silently.
