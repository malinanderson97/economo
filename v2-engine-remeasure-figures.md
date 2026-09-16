# Engine re-measurement — figures for the v2 document pass

Measured headlessly on the rebuilt `islm_pc_model_v19_Open_Economy_Complete_Demo9.3.html`
(c₁ = 0.6, c₀ = 12, n₁ = 21, contemporaneous Taylor rule, ρ = 0.75, ψ = 0.25, Eᵉ weight 0.4),
loaded in headless Chromium and driven through the shipped `solve`/`step`. All five self-tests
pass. Stages: "closed" = IS-LM-PC stage, "full" = Full Model. Every figure marked
**[re-measure]** in the decisions log is here, keyed by the item it replaces.

## Constants and multipliers (M4)

| | value |
|---|---|
| k closed / k_o open | 3.33 / 1.667 |
| calibration point (full) | Y 100, C 60, I 20, G 20, NX 0 |
| b₂k_o/Yₙ (§5 ψ argument) | 3.33 |
| rₙ line (item 19): A = 12 − 12 + 12 + 20 + 30 | **62**; Yₙ/k_o = **60**; rₙ = (62 − 60)/200 = **1.00%** |

## Opening output by stage (items 11b, 27)

| stage | Y | NX |
|---|---|---|
| IS-LM | **86.67** | 0 |
| IS-LM-UIP | **93.33** | **+2.00** |
| IS-LM-PC | 100.00 | 0 |
| Full | 100.00 | 0 |

## Rate response (item 1 — §2 Values b₂, §5 Values ψ)

| | full model | closed IS-LM-PC |
|---|---|---|
| ΔY per 1pp of i (3% → 4%) | **−3.67** | **−6.67** |
| of which: multiplier on investment (k_o·b₂·0.01) | −3.33 | −6.67 |
| of which: exchange rate | **−0.34** (E appreciates 0.97%, NX falls 0.20 direct) | — |
| slider 0% / 15% | **111.0 / 55.9** | **120.0 / 30.0** (floor binds at 15%; unclamped 20.0) |

Note for F§1: the replacement text says "In the closed economy the response is 5.6 … 6.7 in the
closed economy". The 5.6 has no basis in the measurements; the closed response is 6.67.

## n₁ (item 10 — §7 Values)

| | value |
|---|---|
| 10% real appreciation (ε = 1.10), full model | Y **96.5** (ΔY = **−3.5**) |
| net exports, direct (n₁ × 0.1) / total after imports fall with Y | −2.1 / −1.05 |
| ∂Y/∂ε = −n₁·k_o | **−35.0** |
| Eᵉ slider ±30% (Eᵉ = 0.7 / 1.3) | Y 110.5 / 89.5 |

## §8 Values — Eᵉ adjustment weight (item 3)

Settings: full model, Taylor off, θ = 0, cred = 1, i raised 3% → 4% at t = 0 and held.
Weight = E_E_ADAPT × s, s = 0.5. πᵉ stays at 2.00% throughout (θ = 0).

| weight (× s) | Y t0 | t5 | t10 | t20 | t40 | E t20 | ε t20 | ε t40 |
|---|---|---|---|---|---|---|---|---|
| 0 (Eᵉ fixed) | 96.33 | 97.15 | 97.77 | 98.63 | **99.46** | 1.010 | 0.944 | 0.920 |
| 0.4 (tool) | 96.33 | 96.84 | 97.24 | **97.78** | 98.31 | **1.050** | 0.968 | 0.953 |
| 1 | 96.33 | 96.38 | 96.43 | 96.49 | **96.54** | 1.112 | 1.005 | 1.004 |
| 2 | 96.33 | 95.61 | 95.04 | 94.27 | **93.54** | 1.225 | 1.069 | 1.089 |

- Weight 0: the 1pp rise appreciates E by 1% once; Y falls to 96.3 and recovers through the
  price level (ε drifts 1.01 → 0.92) — to 98.6 by t = 20, 99.5 by t = 40.
- Weight 0.4: E drifts 1.010 → 1.050 over twenty periods (unchanged from the old figure); Y
  recovers only to ≈ 97.8 at t = 20 (was "about 98.5"), 98.3 at t = 40.
- Weight 1: stuck near 96.5. Weight 2: falls to 93.5 by t = 40.
- **θ = 1 note**: no longer "diverges (Y ≈ 180 by t = 20)". The instability now runs the other
  way: Y 96.3 → 79.5 (t5) → 71.6 (t10) → trough 63.7 (t ≈ 12), π −18% at t10; then a partial
  recovery to ≈ 90 (t40) / 91.6 (t100) as ε collapses (0.05 at t40), held there only by the
  πᵉ floor of −10% (π ≈ −12% permanently). With n₁ = 21 the Wicksell channel dominates the
  exchange-rate channel that previously drove the run upward.

## §5 Values — new-engine paths (section C: redraft material)

G + 5, rule on, φ = 1.5, θ = 0. Y @ i.

| | t0 | t1 | t2 | t3 | t4 | t5 | t8 |
|---|---|---|---|---|---|---|---|
| closed, ψ 0.25, ρ 0.75 | 105.87 @ 4.62% | 102.07 @ 5.19 | 100.73 @ 5.39 | 100.26 @ 5.46 | 100.09 @ 5.49 | 100.03 @ 5.50 | 100.00 @ 5.50 |
| full, ψ 0.25, ρ 0.75 | 103.79 @ 4.24% | 101.60 @ 4.76 | 100.64 @ 4.96 | 100.21 @ 5.03 | 100.03 @ 5.04 | 99.95 @ 5.02 | 99.89 @ 4.93 |
| closed, ψ 0.5, ρ 0.75 | 104.91 @ 4.76% | 101.45 @ 5.28 | 100.43 @ 5.44 | 100.13 @ 5.48 | 100.04 | 100.01 | 100.00 |
| full, ψ 0.5, ρ 0.75 | 103.33 @ 4.36% | 101.23 @ 4.86 | 100.41 @ 5.03 | 100.10 @ 5.07 | 99.98 | 99.93 | 99.91 |
| closed, ρ = 0 (either ψ) | 100.00 @ 5.50% | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 |
| full, ρ = 0 | 100.00 @ 5.27% | 100.00 @ 5.23 | 100.00 @ 5.18 | 100.00 @ 5.14 | 100.00 @ 5.10 | 100.00 @ 5.06 | 100.00 @ 4.94 |

- The ψ = 0.5 oscillation (112.5 → 94.9 → 102.0 → 99.3 on the lagged rule) is gone: both ψ
  values give a monotone return with no undershoot in the closed stage; ψ = 0.5 is simply faster.
- ρ = 0: the demand shock is fully offset on impact (divine coincidence). In the full model i
  then drifts down slowly because ī moves with ε.

φ sweep, ρ = 0.75, ψ = 0.25 (period from which |Y − Yₙ| < 0.5, or |π − 2%| < 0.1pp, holds):

| φ | G+5 closed, θ 0: settles | oil shock +5pp, full, θ 0: π settles | oil shock, θ 0.75 (preset-1 setting): π settles | min i (θ 0.75) | peak πᵉ (θ 0.75) |
|---|---|---|---|---|---|
| 0 | t5 | t11 | diverges (ZLB, πᵉ → cap) | 0 | — |
| 0.5 | t4 | t10 | diverges | 0 | — |
| 1 | t3 | t9 | t48 | 0.97% | 5.3% |
| 1.2 | t3 | t9 | t15 | 1.35% | 4.95% |
| 1.5 | t3 | t8 | t12 | 1.68% | 4.53% |
| 2 | t3 | t8 | t10 | 1.98% | 4.11% |
| 2.5 | t2 | t7 | t8 | 2.16% | 3.8% |
| 3 | t2 | t7 | t8 | 2.28% | 3.57% |

No overshoot or spiral at any φ up to 3 (min Y = 100 in the closed G+5 runs). The Taylor
principle appears cleanly at θ = 0.75: φ < 1 diverges, φ ≥ 1 converges, faster the larger φ.

Item 32 (ρ = 0): oil shock, θ = 0.75 — φ = 0.5 diverges; φ = 1 settles t35; 1.5 → t22;
2 → t18; 3 → t14. Every φ ≥ 1 gives a clean adjustment, so the sentence is false on the new
engine. ρ = 0.75 converges *faster* than ρ = 0 for the same φ (t12 vs t22 at φ = 1.5): inertia
keeps the rate up while πᵉ unwinds.

Rule off, de-anchoring off (the tool's "θ_eff ≈ 0.65" hint): closed G+5 — θ = 0 leaves a
permanent gap (Y 116.7, π 6.75%), θ = 0.2 settles at 131.7, θ = 0.3 diverges slowly (188 by
t60), θ ≥ 0.35 hits the 200 clamp. With de-anchoring ON (the default) every θ diverges under a
permanent G + 5, because π sits outside the ±2% band and credibility erodes.

## M3 — preset 5, impact with the rule off (confirms the log's table)

| i* | depreciation | Y | π |
|---|---|---|---|
| 6% | 2.83% | 100.99 | 2.28% |
| 8% | 4.63% | 101.62 | 2.46% |
| 10% | 6.36% | 102.23 | 2.63% |

Rule on (preset state, θ = 0, φ = 1.5):

| i* | Y t0 | π t0 | i: t0 / t5 / t10 / t20 / t40 / t60 / t100 / t300 | E t20 / t60 | i within 0.5pp of i* | E leaves ±12.5% chart |
|---|---|---|---|---|---|---|
| 6% | 100.45 | 2.13% | 3.15 / 3.45 / 3.66 / 4.01 / 4.55 / 4.93 / 5.40 / 5.96 | 0.897 / 0.808 | t114 | t25 |
| **8% (chosen)** | 100.74 | 2.21% | 3.24 / 3.74 / 4.07 / 4.63 / 5.46 / 6.05 / 6.80 / 7.85 | 0.835 / 0.698 | t181 | t12 |
| 10% | 101.02 | 2.29% | 3.33 / 4.00 / 4.45 / 5.19 / 6.29 / 7.05 / 8.03 / 9.58 | 0.778 / 0.601 | t275 | t7 |

Original engine (n₁ = 70, lagged rule, i* = 6%) for comparison: Y t0 102.83, π 2.81%, i within
0.5pp of 6% at t36. The import of the world rate is now a drift with a half-life of ≈ 33 periods
(≈ 10 before): ī rises only as the accumulated depreciation feeds net exports, and n₁ is a third
of what it was.

The rows above are the *permanent* rise. A permanent i* rise is a change in the foreign neutral
real rate, not a policy event, so the shipped preset 5 is now the temporary version (i* 8% for
ten periods, then 3%) — see "Instructor Manual presets" below. The impact figures are the same.

## Instructor Manual presets (final engine)

**1. Taylor principle** (θ 0.75, de-anchoring off, +5pp pulse at t0)

| | t0 | t1 | t2 | t3 | t5 | t8 | t12 | t20 |
|---|---|---|---|---|---|---|---|---|
| φ 1.5: π | 5.81 | 5.96 | 5.67 | 5.15 | 3.94 | 2.64 | 2.05 | 2.04 |
| φ 1.5: i | 4.14 | 5.02 | 5.49 | 5.57 | 4.90 | 3.31 | 2.03 | 1.80 |
| φ 1.5: Y | 95.8 | 96.6 | 96.6 | 96.3 | 96.3 | 97.4 | 99.2 | 100.1 |
| φ 0.5: π | 6.53 | 7.52 | 8.05 | 8.22 | 7.87 | 6.55 | 4.78 | 2.93 (0.23 at t40) |
| φ 0.5: i | 3.45 | 4.01 | 4.48 | 4.78 | 4.80 | 3.80 | 1.95 | 0 (ZLB) |

φ 1.5: πᵉ peaks 4.48%, min i 1.74%, no ZLB, π within 0.1pp of target from **t = 12** (original
engine: not within 0.1pp by t = 40). φ 0.5 (fresh from the preset): rate first rises to 4.8%,
reaches the ZLB around t ≈ 15 and is pinned for 17 of 41 periods; πᵉ peaks 6.0%; π overshoots
to 0.2% at t40; not settled by t = 40. As a continuation of the φ 1.5 run (the narrative's
protocol): ZLB 22 periods, π −5.9% at t40, Y trough 86.3.

**2a vs 2b** (+5pp pulse, φ 1.5)

| | 2a (θ 0.85) | 2b (θ 0) |
|---|---|---|
| peak π | **6.22%** (was 7.0 on the lagged rule) | 5.81% |
| peak πᵉ | 5.15% | 2.00% |
| periods π > 2.5% / > 3% | 11 / 9 | 4 / 3 |
| cumulative output loss Σ(Y − Yₙ) | −43.0 | −26.9 (ratio 1.6×) |
| trough Y | 95.8 (t0) | 94.8 (t1) |
| peak i | 6.00% (t3) | 4.20% (t1) |
| episode over (Y within 0.25, π within 0.25pp, sustained) | t17 | **t11** |

π path 2b: 5.81 → 4.03 → 3.14 → 2.67 → 2.27 (t5) → 2.09 (t8). Engine narrative 2a now says
"about 6%" (was "7%"); "roughly twice as long" is 1.5–2.75× depending on the criterion.

**3. Exchange-rate disinflation** (i 1%, Taylor off, θ 0.3)

| | t0 | t1 | t3 | t5 | t10 | t20 | t40 | t120 |
|---|---|---|---|---|---|---|---|---|
| Y | 107.35 | 108.17 | 108.86 | 108.65 | 106.40 | 102.50 | 101.86 | **101.93** |
| π | 4.09 | | 5.25 | | 4.74 | 3.12 | 2.75 | **2.79** |
| ε | 0.981 | 0.987 | 1.007 | 1.032 | | 1.158 | 1.159 | 1.158 |
| NX | −1.80 | | −2.80 | | | −4.06 | | −3.89 |

Impact +7.35 = 6.67 real-rate channel + 0.68 exchange-rate channel; depreciation 1.94%. It never
returns (original engine: also 101.93). Restore i to 3% at t = 3: Y 108.2 → 101.5 (t3) → trough
98.5 (t ≈ 9) → within 0.5 of potential from t23, 0.25 from t27; π back to 2% by t28; E ends
0.988. (Restore at t5: trough 97.6, settles t27; at t8: trough 96.2, t31. Rule switched on at
t5 instead: settles t7.)

**4. Twin deficits** (G 22, Taylor off, θ 0.3)

| | t0 | t1 | t5 | t10 | t20 | t30 | t40 | t60 |
|---|---|---|---|---|---|---|---|---|
| Y | 103.33 | 103.64 | 103.57 | 102.26 | 100.29 | 99.91 | 99.96 | 100.00 |
| π | 2.95 | | | 3.00 | 2.17 | | 1.98 | 2.00 |
| ε | 1.000 | | | 1.065 | 1.095 | | 1.095 | 1.095 |

Within 0.5 of potential from **t19** (0.25 from t21; π within 0.1pp from t22); ε permanently
**1.095** (= 1 + ΔG/n₁; was 1.029); E stays 1.000 (i = i*); NX −1.0 → −2.0. Original engine:
within 0.5 at t8. Engine narrative now says "≈1.10".

**5. Global rate hike** — now a *temporary* foreign tightening: i* 3% → 8%, held ten periods,
back to 3% at t = 10 via a schedule carried in the preset state (`schedule: [{ at: 10, set:
{ i_star: 0.03 } }]`, applied in `step`). Foreign inflation is unchanged (P* grows at π*
regardless of i*), so this is a rise in the foreign real rate. Rule on, θ = 0.

| | t0 | t1 | t5 | t9 (end of hold) | t10 (return) | t11 | t20 | t60 | t158 (rebalance) |
|---|---|---|---|---|---|---|---|---|---|
| i* | 8 | 8 | 8 | 8 | 3 | 3 | 3 | 3 | 3 |
| Y | 100.74 | 100.46 | 100.22 | 100.20 | **99.50** | 99.76 | 99.97 | 99.98 | 100.00 |
| i | 3.24 | 3.39 | 3.74 | **4.00** | 3.84 | 3.76 | 3.61 | 3.30 | 3.05 |
| π | **2.21** | 2.13 | 2.06 | 2.06 | 1.86 | 1.93 | 1.99 | 2.00 | 2.00 |
| E | 0.956 | 0.949 | 0.921 | 0.895 | 0.930 | 0.931 | 0.941 | 0.971 | 0.995 |
| NX | 0.70 | 0.92 | 1.54 | 2.07 | 1.53 | 1.45 | 1.20 | 0.60 | 0.10 |
| I | 19.59 | 19.27 | 18.55 | 18.01 | 18.27 | 18.45 | 18.78 | 19.40 | 19.90 |

Trough Y 99.50 (t10); peak i 4.00% (t9); peak π 2.21% (t0); back within 0.5 of potential from
t = 11 (0.25 from t11, 0.1 from t13); E and ε stay inside the ±12.5% axis throughout (E min
0.895 = −11.1%); long run E → 1.000, ε → 1, i → 3%. Composition during the hold: investment
20 → 18.0, net exports 0 → +2.1, output within 0.3 of potential.

Hold length and return shape (measured, rule on): during the hold Y stays within +0.7 and π
within +0.2 pp whatever the hold, so the visible domestic response is in i and E. Peak i /
E trough by hold: H = 3 → 3.50% / −5.8%; 5 → 3.66% / −7.2%; 8 → 3.87% / −9.7%; **10 → 4.00% /
−11.1%**; 12 → 4.13% / −12.4% (touches the axis). Step return: trough 99.5; a 3- or 5-period
taper or a 0.7/0.5 geometric decay smooths the trough to 99.7–99.9 and lengthens the tail
(rebalance 128–141 vs 117 at H = 5). Chosen: H = 10, step.

Permanent-rise reference (the previous version, kept for the record): converges to Y = 100,
π = 2%, i → 8%, ε = 0.53, NX = 9.8, I ≈ 10; i within 0.5 pp of i* at t181; rebalance t339.

## Consequences for tool text not changed here

- The ISLM drill / hint text "with θ_eff = 1, φ above ≈2 can overshoot and spiral" is false on
  the new engine (φ = 3 converges in 7–8 periods with no overshoot); "φ ≈ 1.2–2 is robust"
  understates it. Left for the §5 redraft.
- 2a's "roughly twice as long" (see above) and 2b's "back near target within a couple of
  periods" (2.7% at t3, 2.3% at t5) are loose but not wrong.

## "Run to rebalance" (jumpLongRun) — stationarity tests added

The button now stops only when the state is balanced (the original three tests: gap, π = πᵉ, no
pulse) AND stationary: over each of the next 5 periods, i, Eᵉ, πᵉ and Y must each move by less
than display precision (Δi < 0.001 pp, ΔEᵉ < 0.0001, Δπᵉ < 0.001 pp, ΔY < 0.001). The 5-period
look-ahead is what distinguishes a state that has stopped from one that is turning round (with a
single-step test, looser tolerances stopped preset 4 in its undershoot trough at Y = 99.91).
Cap unchanged at 600 periods. Constants: REBALANCE_* in the engine.

| preset (protocol) | old stop | new stop | state at the new stop | chart at that length |
|---|---|---|---|---|
| 1 Taylor principle (after the oil shock) | t0 before the shock / t≈20 after | **t200** | Y 100.00, i 2.94%, E 0.885, ε 1.006 | legible; episode in the first ~10% |
| 2a de-anchored | t18 (Eᵉ still moving) | **t222** | i 2.94%, E 0.851, ε 1.006 | legible; episode in the first ~10% |
| 2b anchored | t13 | **t132** | i 2.95%, E 0.960, ε 1.005 | legible; episode in the first ~15% |
| 3 exchange-rate | cap 600 | **cap 600** (unchanged) | Y 101.9, π 2.79%, E 0.095, P/P* 12.2 | unreadable (pre-existing): E and P/P* never stop while i < i* |
| 4 twin deficits | t23 (Y still falling) | **t52** | Y 100.00, **ε 1.0952 = 1 + ΔG/n₁** | reads well |
| 5 global rate hike (temporary, scripted return at t10) | t45 (i 5.63% still rising) | **t158** | Y 100.00, i 3.05%, E 0.995, ε 0.995 | reads well: the cycle in the first ~7%, then E's recovery fills the chart; everything on-axis (permanent version: t339, E off-axis from t12) |

Why the tails are long: any episode with i ≠ i* moves E permanently (backward-looking Eᵉ), so ε
must return to 1 through P/P* — a first-order process with half-life ≈ 33 periods at n₁ = 21 —
and i converges to 3% along with it. Each run takes 10–20 ms.

Looser alternatives (same look-ahead), stop periods for 1 / 2a / 2b / 4 / 5:
- half a display tick (5e-5 / 5e-4 / 5e-5 / 5e-5): 104 / 121 / 45 / 43 / 185
- one display tick (1e-4 / 1e-3 / 1e-4 / 1e-4): 65 / 79 / 17 / 28 (stops in the trough, Y 99.92) / 126
