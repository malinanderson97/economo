# IS-MP-PC Interactive Macro Model

An interactive, browser-based teaching tool for intermediate macroeconomics, built around Blanchard's **IS-MP-PC** framework (*Macroeconomics*, 9th Global Edition, 2024).

The product is a single progressive learning tool that the learner unlocks stage-by-stage from a closed short-run economy through to the full open-economy medium run. The full model is always on screen; blocks not yet taught are greyed and locked.

It is a single self-contained HTML file — no build step, no dependencies. Open it in a browser and it runs.
> **For agents working on this repo:** the hard part of this project is *economic correctness*, not HTML/JS. The engine can be syntactically perfect and still be economically wrong in ways that produce plausible-looking output ("looks plausible" is the core failure mode). Read the "Model engine" and "Scope boundaries" sections before changing anything in `solve()` / `step()`. After **any** engine change, run the verifier (see "Verifying changes") and require a fully green result before declaring the change complete. Do not widen a test tolerance to make a check pass — if an invariant is genuinely meant to change, that is a human decision documented in `Model_Textbook_Correspondence`.

---

## Files

| File | Role |
|------|------|
| `islm_pc_model_v19_Open_Economy_Complete_Demo.html` | **The teaching tool** (single unified file). Anchored to Blanchard Ch. 3–5 (goods market, IS-LM), Ch. 18–19 (open-economy IS / UIP), and Ch. 8–9 (Phillips curve). One engine spanning closed and open economy: the closed economy is the open-economy IS with the trade terms gated off (see "What the model is"). Complexity unlocks stage-by-stage. *(The filename still carries the legacy `v19` label; it is the canonical single tool.)* |
| `verify_v19.mjs` | Node verification harness. Extracts the engine from the HTML and runs structural + self-test + handler-coverage assertions, including the closed-economy invariants (closed multiplier `k = 2.5`, pre-PC `Y = 90`, πᵉ-gating) and the open-economy assertions (UIP identity, twin deficits, credibility/theta, stage→economy mapping, etc.). |
| `Model_Textbook_Correspondence.docx` | **Economic source of truth.** Step-by-step derivations, Blanchard equation numbers, numeric check-cases. Consult this first for any question about whether a mechanism matches the textbook. |
| `Blanchard_O__Macroeconomics_9ed_2024-compressed.pdf` | The textbook (9th Global Edition, 2024), for equation-number lookups. |
| `.agents/skills/macro-model-verification/` | Antigravity skill. On trigger it runs `verify_v19.mjs` and requires a clean exit. It does **not** carry its own harness copy. |

*(The retired closed-economy file `islm_pc_model_v16_Closed_Economy_MediumRun.html` and its harness `verify_v16.mjs` live in `_ARCHIVE_/` as historical reference. Its closed-economy assertions have been folded into `verify_v19.mjs`; the unified tool is the sole current source of truth.)*

---

## What the model is

Three blocks, solved each period as a comparative-static equilibrium, then advanced dynamically.

**IS (goods market).** Output is determined structurally using derived multipliers. The closed and open economy share one engine: the closed economy is the open-economy IS with the import term forced to zero and the trade terms dropped, gated on whether the UIP block is unlocked.

- **Closed economy:** multiplier `k = 1/(1 − c₁ − d₁)`. At baseline (`c₁=0.5, d₁=0.1`), `k = 2.5`. Reduced-form responses: `ΔY = +2.5 ΔG`, `ΔY = −1.25 ΔT`, `ΔY = −500 Δr` (with `d2 = 200`).
- **Open economy:** multiplier `k_o = 1/(1 − c₁ − d₁ + m₁)`. At baseline (`c₁=0.5, d₁=0.1, m₁=0.3`), `k_o ≈ 1.43`. Reduced-form responses: `ΔY = +1.43 ΔG`, `ΔY = −0.71 ΔT`, `ΔY = −286 Δr`, `ΔY ≈ −100 Δε`, `ΔY = +0.43 ΔY*`.

Users can drag the `c1` slider (and `m1` + `Y*` in the open economy) to alter the structural coefficients, with a live coefficient readout showing the updated multiplier and response coefficients.

**MP (monetary policy).** The central bank sets the nominal rate `i` directly — a flat MP line.
- In the **closed** stage, the money stock is endogenous via a multiplicative money-demand function: `M/P = Y·(L₀ − L₁·i)`.
- In the **open** stage, money demand is abstracted out entirely.

**PC (Phillips curve).** `π = πᵉ + α(Y − Yₙ)/Yₙ + z`, where `z` is a cost-push shock and `Yₙ` is endogenous. The PC slope `α` defaults to 0.3 (capped at 0.5), calibrated against Hazell et al. (QJE 2022).

---

## Verifying changes (do this after touching the engine)

Both models contain in-browser **self-tests** that run on load and log `[SELF-TEST] PASS/FAIL` to the browser console.

For checking outside the browser, run the Node harness from the project root (the directory containing the model HTML file):

```
node verify_v19.mjs
```

It extracts the pure engine from the HTML file (via a headless DOM shim) and asserts the documented invariants, plus self-tests, plus **drag-handler coverage** (a static check that every `HANDLES.*` interaction defines its solve-result variable locally before use — this guards the class of bug where a handler references an undefined `eq`).

The verifier exits non-zero on any failure, so it gates automation correctly. **Require it fully green before declaring an engine edit complete.** (For the exact current pass count, run it — the suite grows as invariants are added.)

The `macro-model-verification` skill runs this automatically when triggered in Antigravity; there is no separate consolidated harness.

> **Planned (not yet built):** fuller dynamic-scenario scripts running multi-hundred-period simulations to confirm complex long-run behaviours (credibility erosion, exchange-rate overshooting, twin deficits) headlessly. The current harnesses check structural invariants and a representative set of dynamic assertions, not exhaustive long-run scenarios — those remaining cases are still verified manually in the browser.

---

## Scope boundaries & known issues

- **Exchange-rate expectations:** the open economy uses **backward-looking (naive)** exchange-rate expectations. This is a deliberate, documented scope boundary of the current version.
- **Permanent supply shocks in the open economy:** because of naive FX expectations under the UIP condition, permanent open-economy supply shocks have no stationary equilibrium (cf. Blanchard Ch. 20). Forward-looking FX expectations (Ch. 20 saddle-path dynamics) are **out of scope** for this version and planned for v2. Transitory supply shocks are used for open-economy testing instead.

---

## Working notes

- **Encoding discipline:** the HTML files contain Unicode (Greek letters, subscripts, arrows). Any encoding repair must be a one-shot verify-before-save operation. Never run PowerShell `Set-Content` on the model HTML files — it has destroyed Unicode in the past. (Writing small fresh text files like `.gitignore` with `Set-Content` is fine; editing the models with it is not.)
- **Agent oversight:** two AI systems agreeing with each other is not a substitute for a human reading the engine. Verifier green is the gate, not agent self-report.
- **Backups:** the repo is under Git. Snapshot after every green verifier run (`git add -A` then `git commit -m "..."`). Recovery from a bad change is a committer-only operation — agents run read-only git (`status`/`log`/`diff`/`show`) and never `restore`/`checkout`/`reset`.
