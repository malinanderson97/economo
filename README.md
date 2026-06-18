# IS-MP-PC Interactive Macro Model

An interactive, browser-based teaching tool for intermediate macroeconomics, built around Blanchard's **IS-MP-PC** framework (*Macroeconomics*, 9th Global Edition, 2024). It is a single self-contained HTML file per variant (no build step, no dependencies) — open it in a browser and it runs. 

> **For agents working on this repo:** the hard part of this project is *economic correctness*, not HTML/JS. The engine can be syntactically perfect and still be economically wrong in ways that produce plausible-looking output. Read the "Model engine" and "Scope Boundaries" sections before changing anything in `solve()` / `step()`. After any engine change, run the verification harness shipped with the `macro-model-verification` skill (`.agents/skills/macro-model-verification/verify_invariants.mjs`) and require an ALL GREEN result — see "Verifying changes" below.

---

## Files

| File | Role |
|------|------|
| `islm_pc_model_v16_Closed_Economy_MediumRun.html` | **Closed economy version.** Includes multiplicative money demand and fully refactored structural coefficients. |
| `islm_pc_model_v19_Open_Economy_Complete_Demo.html` | **Open economy version.** Has UIP/exchange-rate channel and fully refactored structural coefficients. |
| `Model_Textbook_Correspondence.docx` | **Economic source of truth.** Step-by-step derivations, Blanchard equation numbers, numeric check-cases. Consult this first for any question about whether a mechanism matches the textbook. |
| `Blanchard_O__Macroeconomics_9ed_2024-compressed.pdf` | The textbook itself (9th Global Edition, 2024), for equation-number lookups. |
| `.agents/skills/macro-model-verification/` | Antigravity skill: runs `verify_invariants.mjs` to check the structural invariants after any engine edit. |

*(Note: older versions may exist as historical reference but v16 and v19 are the current sources of truth.)*

---

## What the model is

Three blocks, solved each period as a comparative-static equilibrium, then advanced dynamically.

**IS (goods market).** Output is determined structurally using derived multipliers.

- **Closed Economy:** The multiplier is `k = 1/(1-c₁-d₁)`. At baseline (`c₁=0.5, d₁=0.1`), `k = 2.5`. 
  This yields reduced-form responses: `ΔY = +2.5 ΔG`, `ΔY = -1.25 ΔT`, and `ΔY = -500 Δr` (where `d1r = 200`).
- **Open Economy:** The multiplier is `k_o = 1/(1-c₁-d₁+m₁)`. At baseline (`c₁=0.5, d₁=0.1, m₁=0.3`), `k_o ≈ 1.43`.
  This yields reduced-form responses: `ΔY = +1.43 ΔG`, `ΔY = -0.71 ΔT`, `ΔY = -286 Δr`, `ΔY ≈ -100 Δε`, and `ΔY = +0.43 ΔY*`.

Users can drag the `c1` slider (and `m1` + `Y*` in the open economy) to dynamically alter the structural coefficients. A **live coefficient readout** displays the updated multiplier `k` and response coefficients in real time.

**MP (monetary policy).** 
The central bank sets the nominal rate `i` directly — a flat MP line. 
- In **v16 (Closed)**, the money stock is endogenous via a multiplicative money demand function: `M/P = Y·(L₀ - L₁·i)`. 
- In **v19 (Open)**, money demand is abstracted out entirely.

**PC (Phillips curve).**
`π = πᵉ + α(Y - Yₙ)/Yₙ + z`
Where `z` is a cost-push shock. `Yₙ` is **endogenous**: `Yₙ = (m_struct + z_struct) / ALPHA_WS` where `m_struct` and `z_struct` are controllable structural sliders (the old free `Yₙ` slider is gone). 

---

## Model engine (`solve` and `step`)

`solve(state)` computes the within-period equilibrium from the current state.
`step(state)` advances one period: it updates the CB rate, expected inflation, credibility, the price level, and government debt.

### The Taylor rule — anchors to shock-aware neutral rate

```
taylor_target = r_neutral + π* + φ·(π - π*) + 0.25·gap
i_next        = ρ·i + (1 - ρ)·taylor_target          (when Taylor rule ON)
i_next        = i_target                             (when Taylor rule OFF)
```

- The rule anchors to the **shock-aware neutral rate** (`r_neutral`), computed dynamically each period as the exact rate that returns output to `Yₙ` given current `G, T, ε, Y*`. This ensures the economy perfectly converges to potential output (`Yₙ`) under demand shocks.
- Smoothing parameter `RHO_TAYLOR` is `0.8` for the closed economy (v16) and `0.75` for the open economy (v19).

### Expectations + endogenous de-anchoring (the credibility mechanism)

Expected inflation drifts each period:
`πᵉ_next = πᵉ + speed * [ θ_eff·(π* - πᵉ) + (1 - θ_eff)·(π - πᵉ) ]`

`θ_eff` is **effective anchoring**, defined as `θ_cap × credibility`.
- **`theta`** (ceiling) — how credible this CB could ever be (0—1).
- **`cred`** — current credibility (0—1).

Credibility erodes if inflation is outside a ±2% tolerance band for a sustained stretch, and rebuilds if inflation normalizes.

---

## Verifying changes (do this after touching the engine)

Both models contain built-in **in-browser self-tests** that execute on load and log
`[SELF-TEST] PASS/FAIL` to the browser console, asserting that the basic equilibrium
math matches the structural parameters.

For checking outside the browser, run the verification harness shipped with the
`macro-model-verification` skill:

```
node .agents/skills/macro-model-verification/verify_invariants.mjs
```

Run it from the project root (the directory containing the two model HTML files).
It extracts the pure engine from each HTML file and asserts the documented
invariants (multipliers, round-trip consistency, Taylor convergence to potential,
markup→potential sign). **Require an ALL GREEN result before declaring an engine
edit complete.** The skill's `SKILL.md` contains the full invariant spec and the
procedure for the (rare) case where an invariant is *meant* to change.

> **Not yet built (planned):** fuller dynamic-scenario scripts that run multi-hundred-period
> simulations to confirm complex behaviours (credibility erosion, exchange-rate
> overshooting, twin deficits) headlessly. The current harness checks structural
> invariants, not these long-run dynamic scenarios — those are still verified manually
> in the browser. If you see references to `verify_v16.mjs` / `verify_v19.mjs` elsewhere,
> they do not currently exist in this repo.

---

## Scope Boundaries & Known Issues

- **Exchange-Rate Expectations:** The open economy (v19) strictly uses **backward-looking (naive) exchange-rate expectations**. 
- **Permanent Supply Shocks in Open Economy:** Due to naive exchange-rate expectations and the UIP condition, permanent open-economy supply shocks have no stationary equilibrium (per Blanchard Ch. 20). Forward-looking FX expectations are explicitly **out of scope** for this version (planned for v2). Transitory supply shocks are used for open-economy testing instead.
