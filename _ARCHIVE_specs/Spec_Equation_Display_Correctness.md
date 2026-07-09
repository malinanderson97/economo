# Spec: Equation-display correctness pass — resync the equation boxes to the engine

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER`
**Type of change:** Fix stale display strings in v19's `drawEquations` so every printed formula matches the engine's actual functional form, interpolates all inputs, and reconciles arithmetically. Adds a headless reconciliation check to `verify_onboarding.mjs`. Do NOT touch `solve()` or the engine constants — the computed `=` results are already correct; only the formula/substitution strings are wrong. Do before Slice 2.

---

## §0 — Notes / confirms (Malin)

- **Sequencing:** do this before Slice 2 (Slice 2 then scopes + colours correct strings).
- **Investment form:** show the full `d₀ + d₁·Y − d₁ᵣ·r` including the accelerator `d₁·Y`. This is required for reconciliation AND it's what makes "investment moves when G moves" legible to the learner (it's the accelerator, not the rate). No simplified alternative — hiding `d₁·Y` is what caused the bug.
- **Real-rate line:** already drawn (dashed `curve-real`, "real r" in legend) and economically correct (`r = i − πᵉ`, eq. 6.4). If you want it more legible (clearer label / show its value), that's a small separate tweak — say so and I'll add it; it's not part of this correctness pass.

## 1. Goal (one sentence)

Every line in every equation box prints a formula that matches the engine's functional form, with all inputs (constants AND live sliders) interpolated, such that the substituted arithmetic evaluates to the displayed result, which equals the engine's value for that term.

## 2. Which model / where

- `islm_pc_model_v19_Open_Economy_Complete_Demo.html`, `drawEquations()` (≈ 1247–1360) — the `eq-ismp`, `eq-uip`, `eq-pc`, `eq-ts` boxes.
- Canonical forms: the Model–Textbook Correspondence doc (§2.1 consumption, §2.2 investment, §7.2–7.3 net exports). NOT `solve()` itself.

## 3. The corrections (ISLM box — audit the others the same way)

Replace the hardcoded literal strings with the engine forms, interpolating every coefficient from the actual engine constants/state (do not hardcode `18`, `19`, `55`, `50`, `0.5`, etc.):

| Line | Currently prints (wrong) | Must print (engine/Correspondence form) |
| --- | --- | --- |
| C | `c₀ + c₁(Y−T) = 18 + 0.5(Y−T)` | `c₀ + c₁(Y−T)` with `c₀=20` and **live `c₁`** (slider), e.g. `20 + 0.50(Y−T)` |
| I | `b₀ − b₁·r = 19 − 200(r)` | `d₀ + d₁·Y − d₁ᵣ·r` with `d₀=12, d₁=0.10, d₁ᵣ=200`, e.g. `12 + 0.10(Y) − 200(r)` |
| NX | `x₀ − x₁·ε = 55 − 50(ε)` | `x₁·Y* − m₁·Y − n₁·(ε−1)` with `x₁=0.30`, **live `m₁`**, engine `n₁`, e.g. `0.30(Y*) − 0.30(Y) − n₁(ε−1)` |

Rules for all lines (every box):
- Interpolate coefficients from the engine's named constants and current state — slider-driven coefficients (`c₁`, `m₁`) must show their **current** value, fixed constants show their real value. No frozen literals.
- The substituted numeric expression (`eq-num`) must be a clean, evaluable arithmetic expression that equals the displayed result (`eq-res`).
- The displayed result must equal the engine's computed value for that term (it already does — don't regress it).
- Audit `eq-uip`, `eq-pc`, `eq-ts` the same way: each printed formula matches the engine, all inputs interpolated, arithmetic reconciles. Fix any that don't (report which were wrong).

## 4. What must NOT change

- `solve()`, engine constants, equilibrium values — untouched. `verify_v16` 22/0, `verify_v19` 30/0.
- The `=` result values (already correct).
- Slice-1 layer and existing `verify_onboarding.mjs` checks.
- This is independent of Slice 2 — do not add scoping or colour-recoding here (that's Slice 2). Keep the existing colours as-is for now.

## 5. The invariant(s) ← the whole point

Add to `verify_onboarding.mjs` a **reconciliation check** (this is headless-verifiable because `drawEquations` runs under the existing DOM stub):

- For each `.eq-line` with a substituted expression and a result: evaluate the `eq-num` expression numerically (safe arithmetic eval) and assert it equals the `eq-res` value (tol 0.01).
- Assert each line's `eq-res` equals the corresponding engine term (`C`, `I`, `G`, `NX`, totals) from `solve()` (tol 0.01).
- Exercise this across several states so interpolation is tested: baseline, +ΔG, changed `c₁`, changed `m₁`, changed `i`. In particular: after changing `c₁`, the printed consumption coefficient must change; after changing `m₁`, the printed NX must change; after +ΔG (Taylor off), the printed investment must change via the `d₁·Y` term while `r` stays fixed.
- **BAD-fixture:** a line that hardcodes a coefficient (so it diverges from the engine when the matching slider moves) MUST be caught.

## 6. Done criteria

- [ ] `verify_onboarding.mjs` green incl. the new reconciliation checks + BAD-fixture; `verify_v16` 22/0, `verify_v19` 30/0.
- [ ] Report which lines in which boxes were stale and were fixed.
- [ ] Eyeball: move G → investment numbers change (via the accelerator); move m₁ → NX numbers change; move the MPC slider → the consumption coefficient changes; every shown "formula = numbers = result" reconciles.
- [ ] Committed: `git add -A ; git commit -m "Equation-display correctness: resync eq boxes to engine forms; add reconciliation check"`.

## Guardrails / out of scope

- Display strings only — no engine changes, no scoping, no colour changes (Slice 2 owns those).
- No hardcoded coefficient literals — interpolate from engine constants/state.
- Do not change the `=` result values; they're correct. If a result looks wrong, STOP and report — that would be an engine issue, not a display one.
- Do not weaken any assertion to go green.
