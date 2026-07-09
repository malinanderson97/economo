# Spec v2-delta: Twin rebuild of presets 2a/2b (applies ON TOP of the v1 preset fixes)

> BASELINE: the repo state AFTER Spec_Preset_Fixes.md (v1) was applied and committed
> (verify_v19 at 56/0). All OLD strings below are the post-v1 strings — verified against
> Malin's post-v1 file 2026-07-05. The preset 5/1/4 fixes from v1 are DONE and are not
> touched here. Supersedes Spec_Preset_Fixes_v2.md (which assumed a pre-v1 baseline).
>
> Purpose (Malin decision 2026-07-05): presets 2a/2b must be a controlled twin
> experiment — identical states, identical +5% transitory supply shock, ONLY θ differs
> (0.15 vs 1) — so de-anchoring emerges endogenously on screen instead of being baked
> into the initial conditions (current 2a starts at πᵉ=8% → artifact boom to Y=117).
> All edits and assertions below pre-verified green against the post-v1 engine.

## 1. Scope
- `islm_pc_model_v19_Open_Economy_Complete_Demo.html`: presets 2a and 2b inside the
  `SCENARIOS` const only (two state lines, two narratives).
- `verify_v19.mjs`: remove ONE v1-added assertion (it fails under the twin states),
  add THREE new ones. Net expected count: 58/0.
- OUT of scope: engine functions, UI code, presets 1/3/4/5, dead `Y_n` fields in
  presets 3/4/5 (2b's is removed only because its whole state line is replaced).

## 2. Measured twin dynamics (identical starts Y=100, π=2%, πᵉ=2%, i=3%; shock z_pulse=+5%)
| | θ=1 anchored (2b) | θ=0.15 adaptive (2a) |
|---|---|---|
| t=0 frame | identical: π→7%, πᵉ=2% | identical: π→7%, πᵉ=2% |
| πᵉ path | pinned at 2.0% | chases: 2.0→4.1→5.0% |
| trough Y | 90.3 (t=1, sharp) | 92.7 (t=3, drawn out) |
| periods π>2.5% | 4 | 9 |
| cumulative output loss | 26.9 | 41.4 (1.54×) |
| back to trend | t≈12 | t≈30+ |
Anchored dips DEEPER at t=1: rising πᵉ cushions the adaptive economy's first period by
eroding the real rate — the cushion is the poison. Narratives state this explicitly.

## 3. Edits (surgical, exact-string; grep-prove each OLD string exists verbatim exactly once FIRST)

### Edit A — preset 2a state line (full replacement)
OLD (post-v1, unique):
    state: { G: 20, T: 20, P: 1.0, P_star: 1.0, i_target: 0.03, i: 0.03, i_star: 0.03, E_e: 1.0, pi_e: 0.08, m_struct: 0.05, z_struct: 0.10, alpha: 0.3, z: 0, z_pulse: 0.02, theta: 0.15, cred: 1.0, deanchor_on: true, phi: 1.5, taylor_on: true, speed: 0.5, period: 0, history: [] }
NEW:
    state: { G: 20, T: 20, P: 1.0, P_star: 1.0, i_target: 0.03, i: 0.03, i_star: 0.03, E_e: 1.0, pi_e: 0.02, m_struct: 0.05, z_struct: 0.10, alpha: 0.3, z: 0, z_pulse: 0.05, theta: 0.15, cred: 1.0, deanchor_on: false, phi: 1.5, taylor_on: true, speed: 0.5, period: 0, history: [] }

### Edit B — preset 2a narrative (full replacement)
OLD narrative begins (post-v1): `θ = 0.15: expectations are mostly adaptive and start at 8%.`
NEW narrative:
`Twin experiment, part 1 — identical to preset 2b in every field except θ. θ = 0.15: expectations are mostly adaptive. A transitory supply shock (z_pulse = +5%) hits: inflation spikes to 7% and πᵉ chases it upward (watch it climb toward 5%). The central bank now fights a moving target: rates go higher for longer, inflation stays elevated for roughly twice as long as in 2b, and the cumulative output loss is about 1.5× larger — even though the first-period dip is milder, because rising πᵉ erodes the real rate. That cushion is exactly the poison. Since the shock is transitory, output eventually returns to potential (100).`

### Edit C — preset 2b state line (full replacement; removes dead Y_n, aligns to twin)
OLD (unique, unchanged by v1):
    state: { G: 20, T: 20, P: 1.0, P_star: 1.0, i_target: 0.03, i: 0.03, i_star: 0.03, E_e: 1.0, pi_e: 0.02, Y_n: 100, alpha: 0.5, z: 0.02, z_pulse: 0, theta: 1, cred: 1.0, deanchor_on: false, phi: 1.5, taylor_on: true, speed: 0.5, period: 0, history: [] }
NEW (identical to Edit A's NEW except theta):
    state: { G: 20, T: 20, P: 1.0, P_star: 1.0, i_target: 0.03, i: 0.03, i_star: 0.03, E_e: 1.0, pi_e: 0.02, m_struct: 0.05, z_struct: 0.10, alpha: 0.3, z: 0, z_pulse: 0.05, theta: 1, cred: 1.0, deanchor_on: false, phi: 1.5, taylor_on: true, speed: 0.5, period: 0, history: [] }

### Edit D — preset 2b narrative (full replacement)
OLD narrative begins: `θ = 1: credibility is absolute. The same persistent cost-push shock (z = 2%)`
NEW narrative:
`Twin experiment, part 2 — identical to preset 2a in every field except θ. θ = 1: credibility is absolute and πᵉ stays nailed to 2% no matter what inflation does. The same +5% transitory supply shock produces a sharper but brief slump: one decisive hike, inflation is back near target within a couple of periods, and the episode is over by around t = 12. Run this side-by-side with 2a: same economy, same shock — the only difference is whether expectations are anchored. Central-bank credibility is itself a policy tool (Blanchard Ch. 9).`

### Edit E — verify_v19.mjs: swap assertions
E1. REMOVE the assertion v1 added (locate by its check label; grep `deAnchored recession is deep`
    first — expected count 1). It asserts `trough < 90`; under the twin states the trough
    is 92.7 and it would fail. Remove that one check only; do NOT touch the two original
    test-2 assertions (`trough < 98`, end Y≈100 — both still pass: 92.7 / 100.000).
    If the grep count is 0 (v1's verifier edit was never applied), report that and skip
    E1 — the expected final count below is unchanged either way.
E2. ADD three assertions in/after the test-2 block, adapting names to the file's actual
    check()/preset()/step conventions (grep them first); logic and thresholds are fixed:
```js
// 2t. Twin-design lock: 2a and 2b must be identical except theta.
{
  const a = SCENARIOS.find(s => s.id === 'expectationsDeAnchored').state;
  const b = SCENARIOS.find(s => s.id === 'expectationsAnchored').state;
  const strip = o => { const c = { ...o }; delete c.theta; delete c.history; return JSON.stringify(c); };
  check('2t twin states identical except theta', strip(a) === strip(b),
        'presets 2a/2b must differ ONLY in theta (controlled experiment)');
}
// 2u. Mechanism: expectations chase the shock in 2a, stay pinned in 2b.
{
  const maxPiE = id => { let s = preset(id), m = -Infinity;
    for (let k = 0; k < 300; k++) { m = Math.max(m, s.pi_e); s = step(s); } return m; };
  const mA = maxPiE('expectationsDeAnchored'), mB = maxPiE('expectationsAnchored');
  check('2u deAnchored pi_e chases shock (>4%)', mA > 0.04, `max pi_e=${(mA*100).toFixed(2)}%`);
  check('2u anchored pi_e stays pinned (<2.1%)', mB < 0.021, `max pi_e=${(mB*100).toFixed(2)}%`);
}
```
Pre-verified on the post-v1 engine: 2t PASS, mA=5.00% PASS, mB=2.00% PASS.

## 4. Verification gate
1. `node verify_v19.mjs` → 58/0 (56 post-v1, −1 removed, +3 added).
2. `node verify_onboarding.mjs` → 102/0. 3. `node mutation_check.mjs` → green.
4. HS-1 headless check after the HTML edit.
5. Browser check (Malin), Full Model stage:
   - 2a and 2b FIRST FRAMES identical (Y=100, π spikes to 7%, πᵉ=2%).
   - 2a: πᵉ climbs toward 5%, trough ≈92.7, drags to ≈t=30, no negative inflation.
   - 2b: πᵉ flat at 2%, sharper dip ≈90.3 at t=1, over by ≈t=12.
   - Read both new narratives in the preview pane.

## 5. Standing prohibitions (restated — mandatory)
- No `Set-Content` (file contains θ, πᵉ, ε — Unicode destruction), no scratch/temp/backup
  files, no wholesale rewrites; exact-string surgical edits, grep-proven unique first.
- No git mutations (commit/checkout/restore/stash/branch). Malin commits.
- Dirty tree at start → STOP. Any grep count ≠ expected → STOP and report.
- No out-of-scope ride-alongs.

## 6. Decisions embedded (log for Frank bundle; not blocking)
θ=0.15 as the adaptive pole (θ=0 → −12.5% deflation whipsaw, Y overshoot 113.7);
shock +5% not +2% (contrast too subtle at 2%); deanchor_on FALSE in both twins
(endogenous credibility erosion stays preset 1's territory).
