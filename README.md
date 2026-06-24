# IS-MP-PC Interactive Macro Model

An interactive, browser-based teaching tool for intermediate macroeconomics, built around Blanchard's **IS-MP-PC** framework (*Macroeconomics*, 9th Global Edition, 2024).

The product is a single progressive learning tool that the learner unlocks block-by-block from a closed short-run economy through to the full open-economy medium run. The full model is always on screen; blocks not yet taught are greyed and locked.

Each variant is a single self-contained HTML file — no build step, no dependencies. Open it in a browser and it runs.
> **For agents working on this repo:** the hard part of this project is *economic correctness*, not HTML/JS. The engine can be syntactically perfect and still be economically wrong in ways that produce plausible-looking output ("looks plausible" is the core failure mode). Read the "Model engine" and "Scope boundaries" sections before changing anything in `solve()` / `step()`. After **any** engine change, run BOTH verifiers (see "Verifying changes") and require a fully green result before declaring the change complete. Do not widen a test tolerance to make a check pass — if an invariant is genuinely meant to change, that is a human decision documented in `Model_Textbook_Correspondence`.

---

## Files

| File | Role |
|------|------|
| `islm_pc_model_v16_Closed_Economy_MediumRun.html` | **Closed economy version** (anchored to Blanchard Ch. 9). Multiplicative money demand; fully refactored structural coefficients. |
| `islm_pc_model_v19_Open_Economy_Complete_Demo.html` | **Open economy version** (anchored to Ch. 18–19 IS/UIP plus Ch. 9 PC). UIP/exchange-rate channel; fully refactored structural coefficients. **This is the canonical v19** — the former `_2` duplicate has been merged in and removed. |
| `verify_v16.mjs` | Node verification harness for v16. Extracts the engine from the HTML and runs structural + self-test + handler-coverage assertions. |
| `verify_v19.mjs` | Node verification harness for v19. Same structure as v16 plus the open-economy assertions (UIP identity, twin deficits, credibility/theta, etc.). |
| `Model_Textbook_Correspondence.docx` | **Economic source of truth.** Step-by-step derivations, Blanchard equation numbers, numeric check-cases. Consult this first for any question about whether a mechanism matches the textbook. |
| `Blanchard_O__Macroeconomics_9ed_2024-compressed.pdf` | The textbook (9th Global Edition, 2024), for equation-number lookups. |
| `.agents/skills/macro-model-verification/` | Antigravity skill. On trigger it runs **both** root verifiers (`verify_v16.mjs` and `verify_v19.mjs`) and requires both to exit cleanly. It does **not** carry its own harness copy. |

*(Older versions may exist as historical reference, but v16 and the canonical v19 are the current sources of truth.)*

---

## What the model is

Three blocks, solved each period as a comparative-static equilibrium, then advanced dynamically.

**IS (goods market).** Output is determined structurally using derived multipliers.

- **Closed economy:** multiplier `k = 1/(1 − c₁ − d₁)`. At baseline (`c₁=0.5, d₁=0.1`), `k = 2.5`. Reduced-form responses: `ΔY = +2.5 ΔG`, `ΔY = −1.25 ΔT`, `ΔY = −500 Δr` (with `d1r = 200`).
- **Open economy:** multiplier `k_o = 1/(1 − c₁ − d₁ + m₁)`. At baseline (`c₁=0.5, d₁=0.1, m₁=0.3`), `k_o ≈ 1.43`. Reduced-form responses: `ΔY = +1.43 ΔG`, `ΔY = −0.71 ΔT`, `ΔY = −286 Δr`, `ΔY ≈ −100 Δε`, `ΔY = +0.43 ΔY*`.

Users can drag the `c1` slider (and `m1` + `Y*` in the open economy) to alter the structural coefficients, with a live coefficient readout showing the updated multiplier and response coefficients.

**MP (monetary policy).** The central bank sets the nominal rate `i` directly — a flat MP line.
- In **v16 (closed)**, the money stock is endogenous via a multiplicative money-demand function: `M/P = Y·(L₀ − L₁·i)`.
- In **v19 (open)**, money demand is abstracted out entirely.

**PC (Phillips curve).** `π = πᵉ + α(Y − Yₙ)/Yₙ + z`, where `z` is a cost-push shock and `Yₙ` is endogenous. The PC slope `α` defaults to 0.3 (capped at 0.5), calibrated against Hazell et al. (QJE 2022).

---

## Verifying changes (do this after touching the engine)

Both models contain in-browser **self-tests** that run on load and log `[SELF-TEST] PASS/FAIL` to the browser console.

For checking outside the browser, run **both** Node harnesses from the project root (the directory containing the model HTML files):

```
node verify_v16.mjs
node verify_v19.mjs
```

Each extracts the pure engine from its HTML file (via a headless DOM shim) and asserts the documented invariants, plus self-tests, plus **drag-handler coverage** (a static check that every `HANDLES.*` interaction defines its solve-result variable locally before use — this guards the class of bug where a handler references an undefined `eq`).

Expected current state: **`verify_v16.mjs` → 22 passed, 0 failed** (4 self-tests); **`verify_v19.mjs` → 30 passed, 0 failed** (5 self-tests). Both verifiers exit non-zero on any failure, so they gate automation correctly. **Require both fully green before declaring an engine edit complete.**

The `macro-model-verification` skill runs both of these automatically when triggered in Antigravity; there is no separate consolidated harness.

> **Planned (not yet built):** fuller dynamic-scenario scripts running multi-hundred-period simulations to confirm complex long-run behaviours (credibility erosion, exchange-rate overshooting, twin deficits) headlessly. The current harnesses check structural invariants and a representative set of dynamic assertions, not exhaustive long-run scenarios — those remaining cases are still verified manually in the browser.

---

## Scope boundaries & known issues

- **Exchange-rate expectations:** the open economy (v19) uses **backward-looking (naive)** exchange-rate expectations. This is a deliberate, documented scope boundary of the current version.
- **Permanent supply shocks in the open economy:** because of naive FX expectations under the UIP condition, permanent open-economy supply shocks have no stationary equilibrium (cf. Blanchard Ch. 20). Forward-looking FX expectations (Ch. 20 saddle-path dynamics) are **out of scope** for this version and planned for v2. Transitory supply shocks are used for open-economy testing instead.

---

## Working notes

- **Encoding discipline:** the HTML files contain Unicode (Greek letters, subscripts, arrows). Any encoding repair must be a one-shot verify-before-save operation. Never run PowerShell `Set-Content` on the model HTML files — it has destroyed Unicode in the past. (Writing small fresh text files like `.gitignore` with `Set-Content` is fine; editing the models with it is not.)
- **Agent oversight:** two AI systems agreeing with each other is not a substitute for a human reading the engine. Verifier green is the gate, not agent self-report.
- **Backups:** the repo is under Git. Snapshot after every green verifier run (`git add -A` then `git commit -m "..."`); recover from a bad agent change with `git restore .`.
