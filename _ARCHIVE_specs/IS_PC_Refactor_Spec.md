# Refactor IS/PC/LM Blocks to Structural Parameters + Add Self-Tests

**Single authoritative spec.** Apply to both `islm_pc_model_v16_Closed_Economy_MediumRun.html` (closed) and `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (open). All IS multipliers/coefficients must be **derived from named structural primitives** (Blanchard eqs. 9.1 / 19.1–19.2), not hard-coded. Apply as one coordinated change per file; do not apply piecemeal. Line numbers are approximate — verify against the actual code before editing.

---

## 0. Critical rules (read first)

1. **Two different "alpha" parameters exist. Keep them separate.**
   - `alpha` (slider, default **0.3**, cap **0.5**) = the **Phillips-curve slope** (α_PC). Used only in the PC formula `pi = pi_e + alpha*(Y - Y_n)/Y_n + z_eff`.
   - `ALPHA_WS` (**fixed constant = 3.0**) = the **wage-setting slope** (α_WS). Used only in the natural-rate formula `un = (m + z)/ALPHA_WS`.
   - **Never** use the slider `alpha` in the natural-rate calculation. Doing so reintroduces a 50%-unemployment bug and makes the PC-slope slider spuriously move potential output.

2. **Per-file differences are intentional — do NOT unify them:**
   - `RHO_TAYLOR` is **0.8 in v16** and **0.75 in v19**. Leave each as-is (v16 lacks the exchange-rate damping channel, so needs more smoothing).
   - `moneyDemand` exists in **v16 only**. v19 is a pure MP model with no LM curve — do not add `moneyDemand` to v19.
   - v19 IS has extra ε and Y* terms; v16 does not.

3. **The IS coefficients are hard-coded in THREE sites that must all change together:** `isOutput`, `isRateForOutput` (the inverse), and the IS drag handler. Updating only `isOutput` will silently desync the draggable curve. The drag handler solves for **G**, so its algebra differs.

4. **No verification harness exists inside the HTML** (despite the README). Build the in-browser self-tests in §9. Also update the existing Node files `verify_v16.mjs` / `verify_v19.mjs` to the new signatures (§10).

---

## 1. Structural constants

### v16 — add after `I_NEUTRAL` (~line 458)
```javascript
// ─── Structural IS primitives (Blanchard eq. 9.1) ───
// c1 is slider-driven (default 0.5); d1, d1r are fixed.
const d1  = 0.10;   // investment accelerator dI/dY
const d1r = 200;    // investment rate-sensitivity |dI/dr|
// k = 1/(1 - c1 - d1) is the fiscal multiplier. At c1=0.5,d1=0.1: k = 2.5.
// Do NOT hard-code 2.5 — always compute from current c1.

// ─── Money demand (Blanchard eq. 5.3, multiplicative) ───
// M/P = Y * (LAMBDA0 - LAMBDA1*i)
// Calibrated at baseline Y=100, i=0.03 to match the OLD additive value & slope:
//   old M/P = 60 + 100 - 2000*0.03 = 100  → LAMBDA0 - LAMBDA1*0.03 = 1.0
//   old ∂(M/P)/∂i = -2000 → Y*(-LAMBDA1) = -2000 at Y=100 → LAMBDA1 = 20
//   → LAMBDA0 = 1.0 + 20*0.03 = 1.6
const LAMBDA0 = 1.6;
const LAMBDA1 = 20;

// ─── PC natural rate (Blanchard eq. 8.4) ───
// un = (m_struct + z_struct)/ALPHA_WS ;  Y_n = L_LABOR*(1 - un)
// ALPHA_WS is the WAGE-SETTING slope — FIXED, and DISTINCT from the PC-slope slider.
// Baseline: m=0.05, z=0.10, ALPHA_WS=3.0 → un = 0.15/3.0 = 0.05 (5%).
const ALPHA_WS = 3.0;
const L_LABOR  = 100 / (1 - 0.05);   // ≈ 105.2632, so Y_n = 100 at baseline
```

### v19 — same IS + PC + ALPHA_WS/L_LABOR constants as v16 (NOT the money-demand block), plus:
```javascript
// ─── Open-economy IS primitives (Blanchard eq. 19.1/19.2) ───
// m1 is slider-driven (default 0.30); x1, n1 are fixed.
const x1 = 0.30;   // export sensitivity to foreign output Y*
const n1 = 70;     // net-export sensitivity to ε (Marshall-Lerner ⇒ n1 > 0)
// k_o = 1/(1 - c1 - d1 + m1) is the open multiplier. At c1=0.5,d1=0.1,m1=0.3: k_o ≈ 1.4286.
const YSTAR_BASE = 100;   // foreign output baseline
```

---

## 2. IS curve rewrite — all three sites

### v16 — `isOutput` (~lines 459–461)
```javascript
function isOutput(G, T, r, c1_val) {
  const c = (c1_val !== undefined) ? c1_val : 0.5;
  const k = 1 / (1 - c - d1);
  return IS_Y_BASE + k * (G - IS_G_BASE) - (c * k) * (T - IS_T_BASE)
                   - (d1r * k) * (r - IS_R_BASE);
}
```

### v16 — `isRateForOutput` (~lines 463–467)
```javascript
function isRateForOutput(Y, G, T, pi_e, c1_val) {
  const c = (c1_val !== undefined) ? c1_val : 0.5;
  const k = 1 / (1 - c - d1);
  const r = IS_R_BASE + (IS_Y_BASE - Y + k * (G - IS_G_BASE)
            - (c * k) * (T - IS_T_BASE)) / (d1r * k);
  return r + pi_e;
}
```

### v16 — IS drag handler (~lines 841–849), solves for G
```javascript
HANDLES.is = (sx, sy) => {
  const o = opts_islm; if (!o) return;
  const newY = xInverse(sx, o);
  const newi = yInverse(sy, o);
  const r = newi - state.pi_e;
  const k = 1 / (1 - state.c1 - d1);
  const newG = IS_G_BASE + (newY - IS_Y_BASE + (state.c1 * k) * (state.T - IS_T_BASE)
             + (d1r * k) * (r - IS_R_BASE)) / k;
  state.G = clamp(newG, 10, 35);
  syncControls();
  render();
};
```

### v19 — `isOutput` (~lines 461–467)
```javascript
function isOutput(G, T, r, eps, c1_val, m1_val, Ystar) {
  const c  = (c1_val !== undefined) ? c1_val : 0.5;
  const m  = (m1_val !== undefined) ? m1_val : 0.30;
  const ys = (Ystar !== undefined) ? Ystar : YSTAR_BASE;
  const k_o = 1 / (1 - c - d1 + m);
  return IS_Y_BASE + k_o * (G - IS_G_BASE) - (c * k_o) * (T - IS_T_BASE)
                   - (d1r * k_o) * (r - IS_R_BASE) - (n1 * k_o) * (eps - IS_EPS_BASE)
                   + (x1 * k_o) * (ys - YSTAR_BASE);
}
```

### v19 — `isRateForOutput` (~lines 470–474)
```javascript
function isRateForOutput(Y, G, T, eps, pi_e, c1_val, m1_val, Ystar) {
  const c  = (c1_val !== undefined) ? c1_val : 0.5;
  const m  = (m1_val !== undefined) ? m1_val : 0.30;
  const ys = (Ystar !== undefined) ? Ystar : YSTAR_BASE;
  const k_o = 1 / (1 - c - d1 + m);
  const r = IS_R_BASE + (IS_Y_BASE - Y + k_o * (G - IS_G_BASE)
            - (c * k_o) * (T - IS_T_BASE) - (n1 * k_o) * (eps - IS_EPS_BASE)
            + (x1 * k_o) * (ys - YSTAR_BASE)) / (d1r * k_o);
  return r + pi_e;
}
```

### v19 — IS drag handler (~lines 850–861), solves for G
```javascript
HANDLES.is = (sx, sy) => {
  const o = opts_ismp; if (!o) return;
  const newY = xInverse(sx, o);
  const newi = yInverse(sy, o);
  const eqNow = solve(state);
  const r = newi - state.pi_e;
  const k_o = 1 / (1 - state.c1 - d1 + state.m1);
  const newG = IS_G_BASE + (newY - IS_Y_BASE + (state.c1 * k_o) * (state.T - IS_T_BASE)
             + (d1r * k_o) * (r - IS_R_BASE) + (n1 * k_o) * (eqNow.eps - IS_EPS_BASE)
             - (x1 * k_o) * (state.Ystar - YSTAR_BASE)) / k_o;
  state.G = clamp(newG, 10, 35);
  syncControls();
  render();
};
```

---

## 3. Money demand — v16 ONLY (~line 522)
```javascript
function moneyDemand(Y, i) {
  // Blanchard eq. 5.3 multiplicative form: M/P = Y * (λ0 − λ1·i)
  // LAMBDA0=1.6, LAMBDA1=20 calibrated so M/P=100 and ∂(M/P)/∂i=−2000 at baseline.
  return Y * (LAMBDA0 - LAMBDA1 * i);
}
```
**Do not add this to v19.** v19's money-market panel already only displays consequences of the CB rate.

---

## 4. Phillips curve — alpha slider & endogenous Y_n

- `paramDefs` alpha entry: change `max: 2, step: 0.05` → **`max: 0.5, step: 0.01`**.
- `initialState`: change `alpha: 0.5` → **`alpha: 0.3`**.
- `paramDefs`: **remove** the `Y_n` entry. Add two structural sliders:
```javascript
{ key: 'm_struct', label: 'Markup m', min: 0.01, max: 0.30, step: 0.005,
  fmt: v => v.toFixed(3), infoText: 'Price-setting markup (shifts natural rate)' },
{ key: 'z_struct', label: 'Wage push z', min: 0.01, max: 0.30, step: 0.005,
  fmt: v => v.toFixed(3), infoText: 'Structural wage-push (shifts natural rate)' },
```
  (Ranges keep `un = (m+z)/3.0` within ~0–20%.)
- `initialState`: remove `Y_n: 100`; add `c1: 0.5`, `m_struct: 0.05`, `z_struct: 0.10`. v19 also add `m1: 0.30`, `Ystar: 100`.

### Helper (both files)
```javascript
function computeYn(s) {
  const un = (s.m_struct + s.z_struct) / ALPHA_WS;   // ALPHA_WS = 3.0, NOT s.alpha
  return L_LABOR * (1 - un);
}
```

---

## 5. `solve()` and `step()` — use computed Y_n

### v16 `solve()` (~lines 524–533)
```javascript
function solve(s) {
  const i = Math.max(ZLB, s.i);
  const r = i - s.pi_e;
  const Y_n = computeYn(s);
  const Y = clamp(isOutput(s.G, s.T, r, s.c1), 30, 200);
  const MP = moneyDemand(Y, i);
  const z_eff = s.z + s.z_pulse;
  const pi = clamp(s.pi_e + s.alpha * (Y - Y_n) / Y_n + z_eff, -0.20, 0.70);
  const zlb_active = i <= ZLB + ZLB_EPS;
  return { Y, i, r, pi, z_eff, MP, zlb_active, Y_n };
}
```

### v19 `solve()` (~lines 531–544)
```javascript
function solve(s) {
  const i = Math.max(ZLB, s.i);
  const E = s.E_e * (1 + s.i) / (1 + s.i_star);
  const eps = E * s.P / (s.P_star || 1);
  const r = i - s.pi_e;
  const Y_n = computeYn(s);
  const Y = clamp(isOutput(s.G, s.T, r, eps, s.c1, s.m1, s.Ystar), 30, 200);
  const z_eff = s.z + s.z_pulse;
  const pi = clamp(s.pi_e + s.alpha * (Y - Y_n) / Y_n + z_eff, -0.20, 0.70);
  const zlb_active = i <= ZLB + ZLB_EPS;
  return { Y, i, r, pi, z_eff, E, eps, zlb_active, Y_n };
}
```

### `step()` (both files)
- Compute `const Y_n = computeYn(s);` and use it in the Taylor gap: `const gap = (eq.Y - Y_n) / Y_n;`
- Remove `Y_n: s.Y_n` from the next-state object (Y_n is no longer stored in state).
- Leave `RHO_TAYLOR` per-file (0.8 / 0.75) and the rest of the rule unchanged.

### Replace every remaining `s.Y_n` / `state.Y_n`
Search both files exhaustively. Known locations beyond solve/step: the PC chart's natural-output line, the readout display, and any preset scenarios that set `Y_n` (convert those to set `m_struct`/`z_struct`). A single missed reference will surface as Self-Test 4 failing.

---

## 6. C / I / NX display equations

Components must sum to `IS_Y_BASE = 100` at baseline. Treat `c0`, `d0` as autonomous residuals computed from current params so the identity holds:

- **v16:** `c0 + d0 = IS_Y_BASE - c1*(IS_Y_BASE - IS_T_BASE) - d1*IS_Y_BASE + d1r*IS_R_BASE - IS_G_BASE`. At baseline = `100 - 0.5*80 - 0.1*100 + 200*0.01 - 20 = 32`. Split e.g. `c0 = 20, d0 = 12`. Display `C = c0 + c1*(Y-T)`, `I = d0 + d1*Y - d1r*r`, `G` exogenous. (Compute `c0` from current `c1` so the split stays consistent as `c1` is dragged; keep `d0` fixed and let `c0 = 32_equivalent - d0` recompute.)
- **v19:** same C and I, plus `NX = x1*Ystar - m1*Y - n1*(eps - IS_EPS_BASE)`, and the identity is `Y = C + I + G + NX`. Recompute the autonomous residual including the baseline NX so the total is 100.

---

## 7. New sliders & live coefficient readout

`paramDefs` additions:
```javascript
// both files:
{ key: 'c1', label: 'MPC (c₁)', min: 0.30, max: 0.80, step: 0.01, fmt: v => v.toFixed(2) },
// v19 only:
{ key: 'm1',    label: 'Import prop. (m₁)', min: 0.05, max: 0.60, step: 0.01, fmt: v => v.toFixed(2) },
{ key: 'Ystar', label: 'Foreign output Y*',  min: 80,   max: 120,  step: 1,    fmt: v => v.toFixed(0) },
```

**Live readout** (updates as c1 / m1 dragged): show the implied multiplier and each reduced-form coefficient.

| | v16 (closed) | v19 (open) |
|---|---|---|
| Multiplier | `k = 1/(1−c1−d1)` | `k_o = 1/(1−c1−d1+m1)` |
| G→Y | `+k` | `+k_o` |
| T→Y | `−c1·k` | `−c1·k_o` |
| r→Y | `−d1r·k` | `−d1r·k_o` |
| ε→Y | — | `−n1·k_o` |
| Y*→Y | — | `+x1·k_o` |

**Instability warning (BOTH files): fire when `(c1 + d1) >= 0.95`.**
Do **not** use `(c1 + d1 - m1)` for v19 — `+m1` enlarges the denominator and only increases stability, so subtracting it is wrong. The blow-up condition is identical for both files.

---

## 8. Expected coefficient values (for sanity-checking)

| Coefficient | v16 old | v16 new (c1=0.5) | v19 old | v19 new (c1=0.5, m1=0.3) |
|---|---|---|---|---|
| Multiplier | 2 | **2.5** | 2 | **1.4286** |
| G→Y | +2 | **+2.5** | +2 | **+1.4286** |
| T→Y | −1 | **−1.25** | −1 | **−0.7143** |
| r→Y | −400 | **−500** | −400 | **−285.71** |
| ε→Y | — | — | −100 | **−100** (via n1=70) |
| Y*→Y | — | — | — | **+0.4286** |

Baseline natural rate: `un = (0.05 + 0.10)/3.0 = 0.05` (5%); `Y_n = 105.2632·0.95 = 100`.

---

## 9. In-browser self-tests (add before `</script>` in both files)

```javascript
// ═══════════════════ SELF-TESTS (run on load) ═══════════════════
(function runSelfTests() {
  const results = [];
  const assert = (name, cond) => {
    results.push({ name, pass: !!cond });
    console.log(`[SELF-TEST] ${cond ? 'PASS' : '*** FAIL ***'}: ${name}`);
  };
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) < tol;

  // 1. Baseline output = IS_Y_BASE  (use baseline structural params)
  //    v16: isOutput(IS_G_BASE, IS_T_BASE, IS_R_BASE, 0.5)
  //    v19: isOutput(IS_G_BASE, IS_T_BASE, IS_R_BASE, IS_EPS_BASE, 0.5, 0.30, YSTAR_BASE)
  const Y_bl = /* v16 */ isOutput(IS_G_BASE, IS_T_BASE, IS_R_BASE, 0.5);
  assert('Baseline isOutput = IS_Y_BASE', near(Y_bl, IS_Y_BASE));

  // 2. Inverse round-trips: Y → r → Y
  const testY = 105;
  const r_inv  = /* v16 */ isRateForOutput(testY, IS_G_BASE, IS_T_BASE, PI_TARGET, 0.5);
  const r_real = r_inv - PI_TARGET;
  const Y_rt   = /* v16 */ isOutput(IS_G_BASE, IS_T_BASE, r_real, 0.5);
  assert('Round-trip Y→r→Y', near(Y_rt, testY));

  // 3. (v19 ONLY) open multiplier < closed multiplier for m1 > 0
  // const kC = 1/(1 - 0.5 - 0.1), kO = 1/(1 - 0.5 - 0.1 + 0.30);
  // assert('k_o < k_closed for m1>0', kO < kC);

  // 4. Taylor convergence: +1pt demand shock returns to Y_n within 40 periods
  let s = JSON.parse(JSON.stringify(initialState));
  s.taylor_on = true; s.G = 21;
  const Yn0 = computeYn(s);
  for (let t = 0; t < 40; t++) s = step(s);
  assert('Taylor convergence (40 periods)', Math.abs(solve(s).Y - Yn0) < 0.1);

  // 5. Higher markup ⇒ lower Y_n (eq. 8.4 sign)
  const lo = computeYn({ m_struct: 0.05, z_struct: 0.10 });
  const hi = computeYn({ m_struct: 0.10, z_struct: 0.10 });
  assert('Higher m → lower Y_n', hi < lo);

  console.log(`[SELF-TEST] ${results.filter(r => r.pass).length}/${results.length} passed`);
})();
```
Adapt the commented signature differences per file. Test 3 runs in v19 only. Test 4 is the key regression catch for any missed `s.Y_n` reference.

---

## 10. Update Node verify files

- `verify_v16.mjs`: update extracted signatures (`isOutput`/`isRateForOutput` now take `c1_val`) and `initialState` fields (`c1`, `m_struct`, `z_struct` replace `Y_n`).
- `verify_v19.mjs`: same, plus `m1_val`, `Ystar` params and the v19 state fields.

---

## 11. Manual verification checklist

1. Open each file; console shows `[SELF-TEST] N/N passed` (5/5 v19, 4/4 v16 — Test 3 is v19-only).
2. Drag `c1` → multiplier readout and IS curve update live.
3. Drag `m_struct` / `z_struct` → Y_n moves, PC natural-output line shifts.
4. (v19) Drag `m1` → open multiplier falls as import propensity rises.
5. (v19) Drag `Ystar` down → IS shifts left (foreign-recession spillover).
6. Taylor-rule run → economy converges to (new) Y_n.
7. Instability chip appears when `c1 + d1 ≥ 0.95` (≈ c1 ≥ 0.85), in BOTH files.
8. Transitory oil shock (`z_pulse`) still decays separately from structural m/z.
9. (v19) UIP exchange-rate mechanism unchanged and working.
10. `node verify_v16.mjs` and `node verify_v19.mjs` both pass.
