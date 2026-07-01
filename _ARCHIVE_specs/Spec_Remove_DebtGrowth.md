# Spec: Remove the Debt / Growth block from the medium-run model

**Owner:** Malin · **Implementer:** Antigravity · **Commits:** Malin only.
**Decision:** The debt-sustainability / growth block is being REMOVED from this model. Rationale below. This is a *subtractive* engine change — deliberate, and consistent with the model's scope (a medium-run fluctuations model; Blanchard as the truth, but not obliged to do everything Blanchard does).

## Why (so future sessions understand, and don't "restore" it)
This is a medium-run model: it determines a *level* of output around a fixed potential (Yₙ). It has **no growth theory** — Yₙ is fixed, output is demand-determined. The debt block is the only part that imports a time-evolving denominator and an exogenous `g` the rest of the engine never uses. Keeping it actively *misleads*: it invites students to reason about debt-over-time on an engine that has no growth mechanism and holds fixed the very growth rate debt sustainability depends on. Worse, the debt accounting uses the real **policy** rate `r = i − πᵉ`, which is NOT the rate a government actually pays on its debt (that is the bond rate = policy + term premium + risk premium, on a stock of heterogeneous-maturity debt). So the debt block teaches the right *qualitative* lesson (unstable when r>g) with the wrong *rate* and no maturity dynamics. Debt done properly needs a bond market and a debt stock with structure — neither of which belongs in a medium-run fluctuations model. It is moving to the planned bigger model (see `Model2_Scoping.md`).

All 7 existing scenarios already carry `B: 0, g: 0.02` (debt effectively off), so removing the block changes NO existing scenario's economic behaviour. This is the low-risk signal: we are removing a dormant subsystem, not active logic.

## What to remove (the full footprint — grep-prove each before editing)
1. **Engine — debt accumulation in `step()`:** the line
   `new_B = clamp((s.B * (1 + eq.r) + (s.G - s.T)) / (1 + g), -200, 1000);`
   and any use of `new_B` / `B` carried into the returned next-state. Remove cleanly so `step()` no longer tracks B.
2. **Debt-cue display:** the `dDot = (r - g) * d - s` calculation, `const d = state.B / eq.Y_n`, and the `debt-cue` UI element (appears ~11×) and its `sec-debt` section (~3×).
3. **Sliders:** the `key: 'B', block: 'DEBT', ...` and `key: 'g', block: 'DEBT', ...` slider definitions, and the `DEBT` block itself from the block list/labels (~10× `DEBT` references).
4. **Scenario state objects:** remove `B` and `g` keys from all 7 SCENARIOS `state` objects (and from `initialState`). Since they're all `B:0, g:0.02` and nothing reads them after removal, this is mechanical — but do it so no dangling `B`/`g` references remain.
5. **Onboarding / verifier mapping:** the onboarding stage system maps sliders→blocks and has a DEBT stage. Remove DEBT from the `TUTORIAL_STAGES` / block mapping. **`verify_onboarding.mjs` asserts `Mapping: B, g ∈ DEBT` and likely has a DEBT stage in its expected sequence** — these assertions must be removed/updated to match, NOT left to fail. Updating a verifier to match an intended removal is correct here; this is the one case where changing a verifier assertion is right, because the thing it asserted is being deliberately deleted. Do it explicitly and call it out in the report.

## Critical: this WILL change verifier counts — that is expected
- `verify_v19` has debt-related assertions (e.g. anything referencing B, g, debt dynamics, the snowball). These must be removed, and the pass count will DROP. State the new expected count explicitly in the report and explain each removed assertion.
- `verify_onboarding` (currently 98/0) has the DEBT mapping + stage assertions. These must be removed/updated; count will change. State the new count.
- **This is the one scenario where the rule "never weaken a verifier" is suspended** — because we are removing the feature the assertions test, not making a broken feature look passing. Every removed/changed assertion must be listed with a one-line reason. Do NOT remove any assertion not related to debt/growth.

## Acceptance checks (explicit PASS/FAIL each)
- [ ] No `DEBT`, `debt-cue`, `sec-debt`, `dDot`, or debt-accumulation references remain (`grep -o` each → 0).
- [ ] No `state.B` / `state.g` / `s.B` / `s.g` references remain anywhere (grep → 0). No dangling B/g in initialState or any scenario.
- [ ] `step()` runs and produces finite state over 300 periods for every remaining scenario (debt removal didn't orphan anything in the step loop).
- [ ] `node verify_v19.mjs` passes at its NEW count with only debt assertions removed — list them.
- [ ] `node verify_onboarding.mjs` passes at its NEW count with only DEBT-mapping/stage assertions removed/updated — list them.
- [ ] HS-1 headless safety check passes.
- [ ] The 7 existing scenarios still load and behave economically identically to before (they had debt off, so removing it must not change their Y/i/π/ε paths). Spot-check Taylor Principle and twin-deficits numerically if possible.
- [ ] `git --no-pager diff` in full; changes limited to debt/growth removal + the verifier assertion removals. No unrelated edits, no engine logic changed beyond deleting the debt path.
- [ ] `git status` clean except intended files.

## Forbidden
- No git commit/add/restore — Malin commits.
- No touching the Economo file (generated export).
- Do NOT remove or alter any non-debt assertion. Do NOT "improve" anything while in here. Pure subtraction of the debt/growth subsystem only.
- No scratch files. No reformatting. Run every check, print PASS/FAIL.
- STOP and report on: a debt reference you can't cleanly remove without touching unrelated logic, any non-debt verifier assertion that breaks (that would mean debt was more entangled than expected — report, don't force), dirty tree, or ambiguity.

## Sequencing
Do this as ONE focused change, its own diff, its own review. Do NOT combine with other work. After Malin commits the removal, the context-aware-reset change (separate spec) can follow on the clean base.
