// verify_demo93.mjs — regression checks for islm_pc_model_v19_Open_Economy_Complete_Demo9.3.html
//
// Usage:  node verify_demo93.mjs [path-to-engine.html]
// Exit code 0 = all checks passed, 1 = at least one failed.
//
// Unlike verify_v19.mjs (which stubbed a DOM), this loads the SHIPPED file in headless Chromium
// (Playwright, already in node_modules), reads the engine's own [SELF-TEST] console lines, then
// drives solve/step/jumpLongRun and the real UI functions inside the page. The expected numbers are
// the measured values on the v2 engine build (c₁ = 0.6, c₀ = 12, n₁ = 21, contemporaneous Taylor
// rule, ρ = 0.75, ψ = 0.25, Eᵉ weight 0.4, preset 5 = temporary foreign tightening: i* 8% for ten
// periods then back to 3% via the preset's schedule). If you change a constant, the
// rule, or a preset, re-measure and update the expectations here — and confirm the script goes RED
// first: `node verify_demo93.mjs islm_pc_model_v19_Open_Economy_Complete_Demo9.2.html` must fail.
//
// v20 update (M7 + M8). Three section-7 expectations were revised, each because the assertion
// encoded a pre-M8 string rather than because the engine regressed:
//   (a) the stale-string blacklist banned the bare '§6.3'. Under the SUPERSEDED numbering that was
//       a stale target (items 33-35 remapped it to §4.1); in the rebuilt doc §6.3 is a live section,
//       "The expectations update", and is where the new πᵉ line correctly points. The ban is now
//       narrowed to the actual stale usage, 'Model Correspondence §6.3' (the old α reference).
//   (b) EQ_REF now cites subsections (§6.3 / §9.2 / §9.2 / §8.3) rather than whole sections.
//   (c) the eq-ts footnote said "§9 price/expectations dynamics". §9 is price-LEVEL dynamics only;
//       expectations are §6.3. The old assertion asserted the error.
// Section 9 is new and covers the M7 Blanchard-only switch and the M8 reference pass.

import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.resolve(process.argv[2] || path.join(__dirname, 'islm_pc_model_v19_Open_Economy_Complete_Demo9.3.html'));

// ---- Tiny test harness -----------------------------------------------------
let passed = 0, failed = 0;
function check(name, cond, detail = '') {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const section = t => console.log(`\n${t}`);
// Each section runs in its own guard, so a missing symbol on an older build fails that section only.
const guarded = async (title, fn) => {
  section(title);
  try { await fn(); }
  catch (e) { failed++; console.log('  FAIL  section aborted — ' + String(e.message || e).split('\n')[0]); }
};

// ---- Load the engine in headless Chromium ---------------------------------
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const logs = [];
page.on('console', m => logs.push(m.text()));
page.on('pageerror', e => logs.push('PAGEERROR: ' + e.message));
await page.goto('file:///' + FILE.replace(/\\/g, '/'));
await page.waitForTimeout(150);
console.log('Engine:', FILE);

// In-page helpers, evaluated once and attached to window.
await page.evaluate(() => {
  window.__v = {
    st: (stage, mod) => { goToStage(stage); return solve(Object.assign(clone(initialState), mod || {})); },
    run: (stage, mod, n, hook) => {
      goToStage(stage);
      let s = Object.assign(clone(initialState), clone(mod || {}));
      const rows = [];
      for (let t = 0; t < n; t++) { if (hook) hook(s, t); const eq = solve(s); rows.push({ t, Y: eq.Y, i: eq.i, pi: eq.pi, pi_e: s.pi_e, E: eq.E, eps: eq.eps, NX: eq.NX, Yn: eq.Y_n, istar: s.i_star }); s = step(s); }
      return rows;
    },
    preset: id => clone(SCENARIOS.find(x => x.id === id).state),
    settle: (rows, tol, key, target) => { for (let t = 0; t < rows.length; t++) { if (rows.slice(t).every(r => Math.abs(r[key] - (target === undefined ? r.Yn : target)) < tol)) return t; } return null; },
  };
});

await guarded('1. Self-tests and boot', async () => {
  const st = logs.filter(l => l.startsWith('[SELF-TEST]'));
  check('five self-tests run and pass (5/5)', st.some(l => /5\/5 passed/.test(l)) && !st.some(l => /FAIL/.test(l)), st.join(' | '));
  check('no page errors at boot', !logs.some(l => l.startsWith('PAGEERROR')), logs.filter(l => l.startsWith('PAGEERROR')).join(' | '));

});
await guarded('2. Constants (M2, M4, M1, housekeeping)', async () => {
  const C = await page.evaluate(() => ({ c1: initialState.c1, c0: IS_C0, b0: IS_B0, n1, b1, b2, rho: RHO_TAYLOR, psi: PSI, w: E_E_ADAPT, cap: TAYLOR_I_MAX, zlb: ZLB,
    p5: SCENARIOS.find(s => s.id === 'globalRateHike').state.i_star, p5sched: SCENARIOS.find(s => s.id === 'globalRateHike').state.schedule,
    reb: [REBALANCE_MAX_PERIODS, REBALANCE_LOOKAHEAD, REBALANCE_TOL_I, REBALANCE_TOL_EE, REBALANCE_TOL_PIE, REBALANCE_TOL_DY] }));
  check('c₁ = 0.6, c₀ = 12, b₀ = 12, b₁ = 0.1, b₂ = 200', C.c1 === 0.6 && C.c0 === 12 && C.b0 === 12 && C.b1 === 0.1 && C.b2 === 200, JSON.stringify(C));
  check('n₁ = 21', C.n1 === 21, String(C.n1));
  check('ρ = 0.75, ψ = 0.25, TAYLOR_I_MAX = 0.30, ZLB = 0', C.rho === 0.75 && C.psi === 0.25 && C.cap === 0.3 && C.zlb === 0);
  check('E_E_ADAPT = 0.4 (named)', C.w === 0.4);
  check('preset 5 i* = 8% with a scheduled return to 3% at t = 10', C.p5 === 0.08 && JSON.stringify(C.p5sched) === JSON.stringify([{ at: 10, set: { i_star: 0.03 } }]), `${C.p5} / ${JSON.stringify(C.p5sched)}`);
  check('rebalance constants (cap 600, look-ahead 5, Δ tolerances 1e-5 / 1e-4 / 1e-5 / 1e-5)', JSON.stringify(C.reb) === JSON.stringify([600, 5, 0.00001, 0.0001, 0.00001, 0.00001]), JSON.stringify(C.reb));

});
await guarded('3. Calibration figures (items 1, 10, 11b, 19, 27, 28)', async () => {
  const K = await page.evaluate(() => {
    const v = window.__v, k_o = 1 / (1 - 0.6 - b1 + 0.30);
    const o = [0, 1, 2, 3].map(i => v.st(i));
    const f3 = v.st(3), f4 = v.st(3, { i_target: 0.04, i: 0.04 });
    const c3 = v.st(2), c4 = v.st(2, { i_target: 0.04, i: 0.04 });
    return { opening: o.map(e => e.Y), openingNX1: o[1].NX, k_o, k_c: 1 / (1 - 0.6 - b1),
      full_dY: f4.Y - f3.Y, closed_dY: c4.Y - c3.Y, full0: v.st(3, { i_target: 0, i: 0 }).Y, full15: v.st(3, { i_target: 0.15, i: 0.15 }).Y,
      closed0: v.st(2, { i_target: 0, i: 0 }).Y, closed15: v.st(2, { i_target: 0.15, i: 0.15 }).Y,
      Ee07: v.st(3, { E_e: 0.7 }).Y, Ee13: v.st(3, { E_e: 1.3 }).Y, g5open: v.st(3, { G: 25 }).Y, g5closed: v.st(2, { G: 25 }).Y,
      eps110: v.st(3, { E_e: 1.10 }), rn: (goToStage(3), isRateForOutput(100, 20, 20, 1, 0, 0.6, 0.30, 100)) };
  });
  check('opening Y by stage 86.67 / 93.33 / 100 / 100', near(K.opening[0], 86.667, 0.01) && near(K.opening[1], 93.333, 0.01) && near(K.opening[2], 100, 1e-6) && near(K.opening[3], 100, 1e-6), K.opening.map(x => x.toFixed(2)).join(' / '));
  check('IS-LM-UIP opens with NX = +2.00', near(K.openingNX1, 2.0, 1e-6), K.openingNX1.toFixed(3));
  check('k = 3.33 closed, k_o = 1.667 open', near(K.k_c, 3.3333, 1e-3) && near(K.k_o, 1.6667, 1e-3));
  check('1pp of i moves Y by −3.67 (full) / −6.67 (closed)', near(K.full_dY, -3.673, 0.005) && near(K.closed_dY, -6.667, 0.005), `${K.full_dY.toFixed(3)} / ${K.closed_dY.toFixed(3)}`);
  check('rate slider 0–15%: 111.0 → 55.9 (full), 120 → 30 (closed, floor binds)', near(K.full0, 111.02, 0.05) && near(K.full15, 55.92, 0.05) && near(K.closed0, 120, 1e-6) && K.closed15 === 30, `${K.full0.toFixed(2)} / ${K.full15.toFixed(2)} / ${K.closed0.toFixed(2)} / ${K.closed15}`);
  check('Eᵉ ±30% moves Y to 110.5 / 89.5', near(K.Ee07, 110.5, 1e-6) && near(K.Ee13, 89.5, 1e-6));
  check('G + 5 impact 108.33 (open) / 116.67 (closed)', near(K.g5open, 108.333, 0.005) && near(K.g5closed, 116.667, 0.005));
  check('10% real appreciation: Y 96.5, NX −1.05, ∂Y/∂ε = −35', near(K.eps110.Y, 96.5, 1e-6) && near(K.eps110.NX, -1.05, 1e-6) && near(-21 * K.k_o, -35, 1e-6), `${K.eps110.Y.toFixed(3)} / ${K.eps110.NX.toFixed(3)}`);
  check('rₙ = 1% at the calibration point (A = 62, Yₙ/k_o = 60)', near(K.rn, 0.01, 1e-9), K.rn.toFixed(6));

});
await guarded('4. Taylor rule (M1): contemporaneous fixed point, ZLB, display', async () => {
  const T = await page.evaluate(() => {
    const v = window.__v;
    const closed = v.run(2, { G: 25, taylor_on: true }, 6);
    goToStage(3); let s = Object.assign(clone(initialState), { G: 25, taylor_on: true }); s = step(step(s));
    const eq = solve(s); const resid = taylorRate(s, eq, s.i) - eq.i;
    const sz = Object.assign(clone(initialState), { taylor_on: true, G: 10, pi_e: -0.02, z: -0.03 });
    const ez = solve(sz); const want0 = taylorRate(sz, solveAtRate(sz, 0), sz.i);
    const so = Object.assign(clone(initialState), { i_target: 0.05, i: 0.05 });
    const ruleOff = solve(so).Y === solveAtRate(so, 0.05).Y && step(so).i === 0.05;
    state = Object.assign(clone(initialState), { G: 25, taylor_on: true }); syncControls(); render();
    const slider = document.getElementById('val-i_target').value, ruleI = (solve(state).i * 100).toFixed(2);
    document.getElementById('box-eq-ismp').classList.add('open'); drawEquations(solve(state));
    const lm = document.getElementById('eq-ismp').innerText.replace(/[ \t\n]+/g, ' ');
    resetToDefault(); goToStage(0);
    return { closedY: closed.map(r => r.Y), closedI: closed.map(r => r.i), resid, zlb: { i: ez.i, active: ez.zlb_active, want0 }, ruleOff, slider, ruleI, lm };
  });
  // Hand calculation, closed IS-LM-PC, G + 5: i = 0.098354 / 2.129167 = 4.619%, Y = 105.87
  check('closed G+5 impact 105.87 @ 4.62% (matches the hand calculation)', near(T.closedY[0], 105.87, 0.01) && near(T.closedI[0], 0.04619, 0.00002), `${T.closedY[0].toFixed(2)} @ ${(T.closedI[0] * 100).toFixed(3)}%`);
  check('closed G+5 path 102.07 → 100.73 → 100.26 → 100.09 (monotone, no undershoot)', near(T.closedY[1], 102.07, 0.01) && near(T.closedY[2], 100.73, 0.01) && near(T.closedY[3], 100.26, 0.01) && T.closedY.every(y => y >= 100 - 1e-9), T.closedY.map(y => y.toFixed(2)).join(' → '));
  check('rule converges to the shock-aware neutral rate 5.5%', near(T.closedI[5], 0.055, 0.0002), (T.closedI[5] * 100).toFixed(3) + '%');
  check('open-economy fixed point: |taylorRate(eq) − eq.i| < 1e-9', Math.abs(T.resid) < 1e-9, String(T.resid));
  check('ZLB clamp-and-resolve: rule wants < 0 ⇒ i = 0, zlb_active', T.zlb.i === 0 && T.zlb.active && T.zlb.want0 < 0, `wants ${(T.zlb.want0 * 100).toFixed(2)}%`);
  check('rule off: solve = solveAtRate(slider), step carries the slider rate', T.ruleOff);
  check('slider shows the rule\'s solved rate while the rule is on', T.slider === T.ruleI, `${T.slider} vs ${T.ruleI}`);
  check('equation box LM line prints the smoothed rule and equals i', /ρ·i₋₁ \+ \(1−ρ\)·\[/.test(T.lm) && new RegExp('= ' + T.ruleI + '%').test(T.lm), T.lm.slice(T.lm.indexOf('LM'), T.lm.indexOf('LM') + 160));

});
await guarded('5. Run to rebalance: balanced AND stationary', async () => {
  const B = await page.evaluate(() => {
    goToStage(3);
    const out = {};
    for (const sc of SCENARIOS) {
      resetToDefault(); applyScenario(sc.id); if (sc.id === 'taylorPrinciple') applyOilShock();
      jumpLongRun();
      const eq = solve(state), n = step(clone(state)), eqn = solve(n);
      out[sc.id] = { t: state.period, rebalanced: rebalanced(state), Y: eq.Y, i: eq.i, eps: eq.eps, dI: Math.abs(eqn.i - eq.i), dEe: Math.abs(n.E_e - state.E_e), dPie: Math.abs(n.pi_e - state.pi_e), dY: Math.abs(eqn.Y - eq.Y) };
    }
    resetToDefault(); goToStage(0);
    return out;
  });
  const expectT = { taylorPrinciple: 200, expectationsDeAnchored: 222, expectationsAnchored: 132, exchangeRateDisinflation: 600, twinDeficits: 52, globalRateHike: 158 };
  for (const [id, r] of Object.entries(B)) {
    const isCap = id === 'exchangeRateDisinflation';
    check(`${id}: stops at t = ${expectT[id]}${isCap ? ' (cap — E/P/P* drift forever while i < i*)' : ''}`, near(r.t, expectT[id], 1), `t = ${r.t}`);
    if (!isCap) check(`${id}: at the stop nothing moves (Δi ${r.dI.toExponential(1)}, ΔEᵉ ${r.dEe.toExponential(1)}, ΔY ${r.dY.toExponential(1)})`, r.rebalanced && r.dI < 1e-5 && r.dEe < 1e-4 && r.dPie < 1e-5 && r.dY < 1e-3);
  }
  check('preset 4 reaches ε = 1 + ΔG/n₁ = 1.0952 at its stop', near(B.twinDeficits.eps, 1.0952, 0.0002), B.twinDeficits.eps.toFixed(4));
  check('preset 5 stops at potential after the scripted return: Y 100.0, i ≈ 3.05%, ε ≈ 0.995', near(B.globalRateHike.Y, 100, 0.01) && near(B.globalRateHike.i, 0.0305, 0.0005) && near(B.globalRateHike.eps, 0.995, 0.002), `Y ${B.globalRateHike.Y.toFixed(3)}, i ${(B.globalRateHike.i * 100).toFixed(3)}%, ε ${B.globalRateHike.eps.toFixed(4)}`);

});
await guarded('6. Preset narratives vs engine (presets 2a, 3, 4, 5)', async () => {
  const N = await page.evaluate(() => {
    const v = window.__v, k_o = 1 / (1 - 0.6 - b1 + 0.30);
    const p3 = SCENARIOS.find(x => x.id === 'exchangeRateDisinflation'), a = v.run(3, p3.state, 121);
    const b = v.run(3, p3.state, 121, (s, t) => { if (t === 3) { s.i_target = 0.03; s.i = 0.03; } });
    const p5 = SCENARIOS.find(x => x.id === 'globalRateHike'), c = v.run(3, p5.state, 301);
    const p2a = v.run(3, v.preset('expectationsDeAnchored'), 41), p2b = v.run(3, v.preset('expectationsAnchored'), 41);
    const p4 = v.run(3, v.preset('twinDeficits'), 121);
    goToStage(0);
    return { n3: p3.narrative, n5: p5.narrative, n2a: SCENARIOS.find(x => x.id === 'expectationsDeAnchored').narrative, n4: SCENARIOS.find(x => x.id === 'twinDeficits').narrative,
      p3: { Y0: a[0].Y, rate: k_o * b2 * 0.02, depr: (1 - a[0].E) * 100, fx: -21 * k_o * (a[0].eps - 1), NX0: a[0].NX, eps20: a[20].eps, Y120: a[120].Y, pi120: a[120].pi, trough: Math.min(...b.map(r => r.Y)), settle: v.settle(b, 0.5, 'Y') },
      p5: { depr: (1 - c[0].E) * 100, Y0: c[0].Y, pi0: c[0].pi, i0: c[0].i, istar9: c[9].istar, istar10: c[10].istar, i9: c[9].i, E9: c[9].E, I9: IS_B0 + b1 * c[9].Y - b2 * (c[9].i - 0.02), NX9: c[9].NX, Ymax: Math.max(...c.map(r => r.Y)),
            Y10: c[10].Y, E10: c[10].E, i10: c[10].i, pi10: c[10].pi, trough: Math.min(...c.map(r => r.Y)), back05: v.settle(c, 0.5, 'Y'), E20: c[20].E, E60: c[60].E, E300: c[300].E, i300: c[300].i,
            onChart: c.every(r => Math.abs(Math.log(r.E)) <= 0.125 && Math.abs(Math.log(r.eps)) <= 0.125), piMin: Math.min(...c.map(r => r.pi)), piMax: Math.max(...c.map(r => r.pi)) },
      p2: { peakPi2a: Math.max(...p2a.map(r => r.pi)), peakPiE2a: Math.max(...p2a.map(r => r.pi_e)), peakPi2b: Math.max(...p2b.map(r => r.pi)), loss2a: p2a.reduce((s, r) => s + Math.min(0, r.Y - r.Yn), 0), loss2b: p2b.reduce((s, r) => s + Math.min(0, r.Y - r.Yn), 0) },
      p4: { eps120: p4[120].eps, settle: v.settle(p4, 0.5, 'Y') } };
  });
  check('preset 3 narrative: Y ≈ 107 = 6.7 (real rate) + <1 (FX), NX ≈ −1.8, depreciation ≈ 2%', near(N.p3.Y0, 107, 0.5) && near(N.p3.rate, 6.667, 0.01) && N.p3.fx < 1 && near(N.p3.NX0, -1.8, 0.05) && near(N.p3.depr, 2, 0.15), `Y ${N.p3.Y0.toFixed(2)}, FX ${N.p3.fx.toFixed(2)}, NX ${N.p3.NX0.toFixed(2)}`);
  check('preset 3 narrative: ε ≈ 1.16 by t ≈ 20, settles Y ≈ 102 with π ≈ 2.8%', near(N.p3.eps20, 1.16, 0.01) && near(N.p3.Y120, 102, 0.5) && near(N.p3.pi120 * 100, 2.8, 0.05), `ε ${N.p3.eps20.toFixed(3)}, Y ${N.p3.Y120.toFixed(2)}, π ${(N.p3.pi120 * 100).toFixed(2)}%`);
  check('preset 3 narrative: restore i at t = 3 ⇒ trough ≈ 98.5, potential by t ≈ 25', near(N.p3.trough, 98.5, 0.1) && N.p3.settle !== null && N.p3.settle >= 20 && N.p3.settle <= 27, `trough ${N.p3.trough.toFixed(2)}, settle t${N.p3.settle}`);
  check('preset 3 narrative text carries those numbers', /≈107/.test(N.n3) && /≈102/.test(N.n3) && /2\.8%/.test(N.n3) && /≈98\.5/.test(N.n3) && /t ≈ 25/.test(N.n3));
  check('preset 5 impact: E −4.4%, Y ≈ 100.7, π 2.2%, i 3.24%', near(N.p5.depr, 4.4, 0.1) && near(N.p5.Y0, 100.7, 0.1) && near(N.p5.pi0 * 100, 2.2, 0.05) && near(N.p5.i0 * 100, 3.24, 0.01), `${N.p5.depr.toFixed(2)}%, ${N.p5.Y0.toFixed(2)}, ${(N.p5.pi0 * 100).toFixed(2)}%, i ${(N.p5.i0 * 100).toFixed(2)}%`);
  check('preset 5 hold: i* 8% through t9 and 3% from t10; i 4.00% and E ≈ 0.90 at t9; I 18.0, NX +2.1; Y ≤ 100.74', N.p5.istar9 === 0.08 && N.p5.istar10 === 0.03 && near(N.p5.i9 * 100, 4.0, 0.02) && near(N.p5.E9, 0.895, 0.005) && near(N.p5.I9, 18.0, 0.05) && near(N.p5.NX9, 2.07, 0.03) && N.p5.Ymax <= 100.75, `i* ${N.p5.istar9}/${N.p5.istar10}, i ${(N.p5.i9 * 100).toFixed(2)}%, E ${N.p5.E9.toFixed(3)}, I ${N.p5.I9.toFixed(2)}, NX ${N.p5.NX9.toFixed(2)}, Ymax ${N.p5.Ymax.toFixed(2)}`);
  check('preset 5 return: trough Y 99.5 at t10 (E 0.93, i 3.8%, π 1.86%); back within 0.5 from t11', near(N.p5.Y10, 99.5, 0.02) && near(N.p5.trough, 99.5, 0.02) && near(N.p5.E10, 0.93, 0.005) && near(N.p5.i10 * 100, 3.84, 0.02) && near(N.p5.pi10 * 100, 1.86, 0.02) && N.p5.back05 === 11, `Y ${N.p5.Y10.toFixed(2)}, E ${N.p5.E10.toFixed(3)}, i ${(N.p5.i10 * 100).toFixed(2)}%, π ${(N.p5.pi10 * 100).toFixed(2)}%, t${N.p5.back05}`);
  check('preset 5 tail: E ≈ 0.94 (t20), 0.97 (t60), → 1.00; i → 3%; E and ε on the ±12.5% chart throughout; π within 1.9–2.2%', near(N.p5.E20, 0.94, 0.005) && near(N.p5.E60, 0.97, 0.005) && near(N.p5.E300, 1.0, 0.003) && near(N.p5.i300, 0.03, 0.0003) && N.p5.onChart && N.p5.piMin > 0.0185 && N.p5.piMax < 0.0225, `E ${N.p5.E20.toFixed(3)} / ${N.p5.E60.toFixed(3)} / ${N.p5.E300.toFixed(3)}, i300 ${(N.p5.i300 * 100).toFixed(2)}%, onChart ${N.p5.onChart}, π ${(N.p5.piMin * 100).toFixed(2)}–${(N.p5.piMax * 100).toFixed(2)}%`);
  check('preset 5 narrative text carries those numbers and the framing', /foreign real interest rate rises 5 points/.test(N.n5) && /holds for ten periods/.test(N.n5) && /scripted into the preset at t = 10/.test(N.n5) && /4\.4%/.test(N.n5) && /E ≈ 0\.90 by t = 9/.test(N.n5) && /4\.0% at t = 9/.test(N.n5) && /from 20 to 18\.0/.test(N.n5) && /from 0 to \+2\.1/.test(N.n5) && /dips to 99\.5/.test(N.n5) && /from t = 11/.test(N.n5) && /1\.9–2\.2%/.test(N.n5) && !/suppress/.test(N.n5));
  check('preset 2a: peak π ≈ 6% (narrative "about 6%"), πᵉ toward 5%, loss ≈ 1.6× 2b', near(N.p2.peakPi2a * 100, 6.2, 0.3) && /about 6%/.test(N.n2a) && N.p2.peakPiE2a > 0.048 && N.p2.peakPiE2a < 0.053 && near(N.p2.loss2a / N.p2.loss2b, 1.6, 0.15), `${(N.p2.peakPi2a * 100).toFixed(2)}%, ratio ${(N.p2.loss2a / N.p2.loss2b).toFixed(2)}`);
  check('preset 4: ε permanently ≈ 1.095 (narrative "≈1.10"); within 0.5 of potential from t ≈ 19', near(N.p4.eps120, 1.0952, 0.001) && /≈1\.10/.test(N.n4) && near(N.p4.settle, 19, 2), `ε ${N.p4.eps120.toFixed(4)}, t${N.p4.settle}`);

});
await guarded('7. Housekeeping (items 30, 33–35, M5b)', async () => {
  const H = await page.evaluate(() => {
    const src = document.documentElement.outerHTML;   // the script text is in the DOM verbatim
    const has = s => src.includes(s);
    goToStage(3); resetToDefault(); applyScenario('globalRateHike'); stepPeriod();
    ['box-eq-pc', 'box-eq-ts'].forEach(id => document.getElementById(id).classList.add('open')); drawEquations(solve(state));
    const foot = [...document.querySelectorAll('.eq-footnote')].map(e => e.textContent).join(' || ');
    const ts = document.getElementById('ts'); const title = [...ts.querySelectorAll('text')].find(t => t.textContent === '% deviation');
    const widest = Math.max(...[...ts.querySelectorAll('text')].filter(t => /%$/.test(t.textContent) && t.getAttribute('text-anchor') === 'end').map(t => t.getBBox().width));
    const out = { comments: ['// r = i − πᵉ, with πᵉ = 0 before the PC block', '// Taylor rule, §5', '// λ = (1 − θ)·cred', '// toggle off ⇒ cred frozen', '// eq. 19.5', '// ε = E·P/P*', '// adaptive Eᵉ'].map(has),
      stale: ['Model Correspondence §6.3', '§6.7', '§7.8', '§5.5', "Correspondence 6.6'", 'see 5.4', "'i_N'", 'Price flex', '(target), i', '0.4 * sp'].map(has),
      policyLabel: document.querySelector('#ctl-i_target').closest('.control').querySelector('label').textContent.replace(/[ \t\n]+/g, ' ').trim(),
      speedLabel: document.querySelector('#speed-wrap label').textContent.replace(/[ \t\n]+/g, ' ').trim(), speedTip: document.querySelector('#speed-wrap .info-icon').getAttribute('title'),
      eqRefs: [EQ_REF.pi_e, EQ_REF.P_prime, EQ_REF.P_star_prime, EQ_REF.Ee_prime], alphaRef: SYMBOL_DEFS['α'].role, taylorRef: SYMBOL_DEFS['Taylor i'].ref, hasIbar: !!SYMBOL_DEFS['ī'], foot,
      barredInBox: document.getElementById('eq-ts').innerHTML.includes('class="barred">i</span>'),
      tsTitleX: title ? +title.getAttribute('x') : null, tsTickRight: title ? 46 - 5 - widest : null, zlbComment: has('§4-4, p. 79') };
    resetToDefault(); goToStage(0);
    return out;
  });
  check('item 30: all seven "as written" comments present', H.comments.every(Boolean), H.comments.join(','));
  check('no stale cross-references or labels remain', H.stale.every(x => !x), H.stale.join(','));
  check('policy-rate slider label "Policy rate, i"', H.policyLabel.startsWith('Policy rate, i'), H.policyLabel);
  check('speed control "Step speed, s" with a tooltip describing what s scales', H.speedLabel.startsWith('Step speed, s') && /πᵉ, P, P\* and Eᵉ/.test(H.speedTip));
  check('EQ_REF → §6.3 / §9.2 / §9.2 / §8.3', H.eqRefs.join('|') === 'Correspondence §6.3 * (λ and s added to eq. 8.7)|Correspondence §9.2 *|Correspondence §9.2 *|Correspondence §8.3 * (adaptive)', H.eqRefs.join(' | '));
  check("SYMBOL_DEFS['α'] → §4.1; 'Taylor i' → §5; glossary key ī with barred display in the box", /§4\.1/.test(H.alphaRef) && /§5/.test(H.taylorRef) && H.hasIbar && H.barredInBox);
  check('footnotes → §4.1/§4.2 and §6.3/§8.3/§9/§5.2', /§4\.1 \(the factor\) and §4\.2/.test(H.foot) && /§6\.3 expectations; §8\.3 the expected exchange rate; §9 price-level dynamics; §5\.2 interest smoothing/.test(H.foot), H.foot);
  check('ZLB comment cites §4-4, p. 79', H.zlbComment);
  check('M5b: Dynamics axis title on the left (x = 12) and clear of the tick labels', H.tsTitleX === 12 && H.tsTickRight > 17, `x = ${H.tsTitleX}, gap to ticks ${H.tsTickRight}`);

});
await guarded('9. M7 Blanchard-only switch and M8 reference pass', async () => {
  const M = await page.evaluate(() => {
    goToStage(3); resetToDefault();
    const st = Object.assign(clone(initialState), { taylor_on: true, z_pulse: 0.02 });
    state = st; ['box-eq-ismp','box-eq-uip','box-eq-pc','box-eq-ts'].forEach(id => document.getElementById(id).classList.add('open'));
    const dump = () => { render(); return ['eq-ismp','eq-uip','eq-pc','eq-ts']
      .map(id => document.getElementById(id).innerHTML).join('\n'); };
    const lines = () => [...document.querySelectorAll('#eq-ismp .eq-line, #eq-uip .eq-line, #eq-pc .eq-line, #eq-ts .eq-line')]
      .map(l => ({ grey: l.classList.contains('eq-nocp'), t: l.textContent.replace(/\s+/g,' ').trim() }));

    setEqMode('tool');      const toolHtml = dump(), toolLines = lines();
    setEqMode('blanchard'); const blHtml  = dump(), blLines  = lines();

    // the model must not depend on the display mode
    const path = () => { let s = Object.assign(clone(initialState), { taylor_on: true, G: 25 }); const o = [];
      for (let t = 0; t < 40; t++) { const eq = solve(s); o.push([eq.Y, eq.i, eq.pi]); s = step(s); } return JSON.stringify(o); };
    setEqMode('tool'); const pTool = path();
    setEqMode('blanchard'); const pBl = path();

    const txt = blLines.map(l => l.t).join(' | ');
    const out = {
      defaultMode: (setEqMode('tool'), eqMode),
      buttons: document.querySelectorAll('#eq-ismp .eq-mode-btn, #eq-uip .eq-mode-btn, #eq-pc .eq-mode-btn, #eq-ts .eq-mode-btn').length,
      pathsIdentical: pTool === pBl,
      // tool form keeps the implemented linearisation
      toolNX: /x₁·Y\* − m₁·Y − n₁·\(ε−1\)/.test(toolLines.map(l => l.t).join(' | ')),
      // Blanchard form is the textbook functional form, with arguments and result only
      blNXsym: /NX\(Y, Y\*, ε\) = X\(Y\*, ε\) − IM\(Y, ε\)\/ε/.test(txt),
      blNXargs: /NX\(Y = [\d.]+, Y\* = [\d.]+, ε = [\d.]+\) = /.test(txt),
      // no calibrated coefficient VALUES anywhere in the Blanchard numeric lines
      noCoeffValues: !/0\.30\(100\)|21\(1\.|200\(0\.|12 \+ 0\.60\(/.test(txt),
      // no-counterpart lines are shown greyed, not hidden
      greyed: ['P′','P\*′','Eᵉ′'].map(sym => blLines.some(l => l.grey && new RegExp(sym).test(l.t) && /no textbook counterpart/.test(l.t))),
      greyedRefs: /Correspondence §9/.test(txt) && /Correspondence §8\.3/.test(txt),
      // split lines: Blanchard's own rule plus a greyed tool step
      mpSplit: /i = ī \+ a\(π − π\*\) − b\(u − uₙ\)|ī \+ a\(π − π\*\) − b\(u − uₙ\)/.test(blLines.map(l=>l.t).join(' ')) ||
               blLines.some(l => !l.grey && /a\(π − π/.test(l.t)),
      mpGrey: blLines.some(l => l.grey && /ρ·i₋₁/.test(l.t) && /Correspondence §5\.2/.test(l.t)),
      pcBlanchard: blLines.some(l => !l.grey && /π − πᵉ = \(α\/L\)\(Y − Yₙ\)/.test(l.t)),
      pcGrey: blLines.some(l => l.grey && /shock/.test(l.t) && /Correspondence §4\.2/.test(l.t)),
      // the πᵉ line exists in both modes and switches to eq. 8.7
      piEtool: toolLines.some(l => /πᵉ′/.test(l.t) && /λ\(π/.test(l.t)),
      piEbl: blLines.some(l => !l.grey && /πᵉ′ = \(1 − θ\)/.test(l.t)),
      piEgrey: blLines.some(l => l.grey && /λ = \(1 − θ\)·cred/.test(l.t)),
      // M8 reference pass
      refs: { Yn: SYMBOL_DEFS['Yₙ'].ref, ibar: SYMBOL_DEFS['ī'].ref, zlb: SYMBOL_DEFS['ZLB'].ref,
              n1: SYMBOL_DEFS['n₁'].ref, eps: SYMBOL_DEFS['ε'].ref, c1: SYMBOL_DEFS['c₁'].ref,
              i: SYMBOL_DEFS['i'].ref, shock: SYMBOL_DEFS['shock'].ref, Pp: SYMBOL_DEFS['P′'].ref },
      mdRemoved: !('MD' in EQ_REF),
      refBcomplete: ['C','I','G','Y','NX','MP','UIP','eps','un','Yn','PC','fisher','pi_e'].every(k => k in EQ_REF_B),
      hint: document.documentElement.outerHTML
    };
    out.hintNoFalseClaim = !/φ above ≈2/.test(out.hint) && !/θ_eff/.test(out.hint);
    out.hintMeasured = (out.hint.match(/Stability notes \(measured on this engine/g) || []).length === 2;
    delete out.hint;
    setEqMode('tool'); resetToDefault(); goToStage(0);
    return out;
  });

  check('switch defaults to Tool form and renders in all four boxes', M.defaultMode === 'tool' && M.buttons === 8, `mode ${M.defaultMode}, ${M.buttons} buttons`);
  check('display mode does not change the model (40-period path identical)', M.pathsIdentical);
  check('tool form keeps the linearised NX', M.toolNX);
  check("Blanchard form shows eq. 19.1's functional form with arguments and result", M.blNXsym && M.blNXargs, `sym ${M.blNXsym}, args ${M.blNXargs}`);
  check('no calibrated coefficient values in the Blanchard numeric lines', M.noCoeffValues);
  check('P′, P*′, Eᵉ′ shown greyed as "no textbook counterpart", not hidden', M.greyed.every(Boolean) && M.greyedRefs, M.greyed.join(','));
  check('Taylor line splits: Blanchard rule + greyed ρ smoothing → §5.2', M.mpSplit && M.mpGrey, `rule ${M.mpSplit}, grey ${M.mpGrey}`);
  check('PC line splits: eq. 9.3 + greyed cost-push shock → §4.2', M.pcBlanchard && M.pcGrey, `pc ${M.pcBlanchard}, grey ${M.pcGrey}`);
  check('πᵉ line present in both modes; Blanchard state is eq. 8.7 with λ/s greyed', M.piEtool && M.piEbl && M.piEgrey, `tool ${M.piEtool}, bl ${M.piEbl}, grey ${M.piEgrey}`);
  check('EQ_REF_B covers every switchable box term', M.refBcomplete);
  check('M8: Yₙ → p. 179, ī → p. 494, ZLB → p. 79, n₁ → p. 393, ε → p. 358, c₁ → p. 53',
    /p\. 179/.test(M.refs.Yn) && /p\. 494/.test(M.refs.ibar) && /p\. 79/.test(M.refs.zlb) &&
    /p\. 393/.test(M.refs.n1) && /p\. 358/.test(M.refs.eps) && /p\. 53/.test(M.refs.c1), JSON.stringify(M.refs));
  check('M8: i → the policy rate p. 494; shock → §4.2; P′ → tool addition §9', /p\. 494/.test(M.refs.i) && /§4\.2/.test(M.refs.shock) && /Correspondence §9/.test(M.refs.Pp), JSON.stringify(M.refs));
  check("M8: unused EQ_REF['MD'] removed", M.mdRemoved);
  check('M8: the false φ>2 hint is gone and both copies carry the measured wording', M.hintNoFalseClaim && M.hintMeasured, `noFalse ${M.hintNoFalseClaim}, twoCopies ${M.hintMeasured}`);
});

await guarded('10. UI smoke (no page errors)', async () => {
  const before = logs.length;
  await page.evaluate(() => {
    for (const sc of SCENARIOS) { goToStage(3); applyScenario(sc.id); for (let k = 0; k < 3; k++) stepPeriod(); jumpLongRun(); reverseStep(); reset(); }
    resetToDefault(); goToStage(3); applyScenario('twinDeficits'); toggleTaylor(); stepPeriod(); toggleTaylor();
    HANDLES.is(150, 100); HANDLES.mp(150, 80); HANDLES.uip(150, 100); HANDLES.pc(200, 120); toggleTaylor(); HANDLES.mp(150, 80); toggleTaylor();
    ['box-eq-ismp', 'box-eq-uip', 'box-eq-pc', 'box-eq-ts'].forEach(toggleEq); toggleDrill('drill-pc'); toggleDrill('drill-taylor');
    toggleExpand('chart-box-ts'); toggleExpand('chart-box-ts'); toggleHelpMode(); render(); toggleHelpMode();
    applyScenario('taylorPrinciple'); [0, 1, 2, 3].forEach(i => { goToStage(i); stepPeriod(); });
    resetToDefault(); goToStage(0);
  });
  const errs = logs.slice(before).filter(l => l.startsWith('PAGEERROR'));
  check('presets, stepping, rebalance, reverse, reset, toggles, drags, boxes, expand, help mode', errs.length === 0, errs.join(' | '));
});
await browser.close();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
