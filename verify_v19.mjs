// verify_v19.mjs — regression checks for the open-economy IS-MP-UIP-PC model.
//
// Usage:  node verify_v19.mjs
// Exit code 0 = all checks passed, 1 = at least one failed.
//
// This loads islm_pc_model_v19_Open_Economy_Complete_Demo.html, extracts its
// <script> code, stubs a minimal DOM so the engine runs headless, and exercises
// solve()/step() against the behaviors that must hold.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'islm_pc_model_v19_Open_Economy_Complete_Demo.html');

// ---- Load engine -----------------------------------------------------------
const html = fs.readFileSync(FILE, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');

const fakeEl = () => ({
  setAttribute() {}, appendChild() {}, style: {},
  classList: { toggle() {}, add() {}, remove() {}, contains: () => false },
  addEventListener() {}, querySelector: () => fakeEl(), querySelectorAll: () => [],
  innerHTML: '', textContent: '', value: 0, getAttribute: () => null
});
const stub = `var document={getElementById:()=>fakeEl(),createElement:()=>fakeEl(),
  createElementNS:()=>fakeEl(),querySelectorAll:()=>[],
  body:{classList:{toggle(){},add(){},remove(){}}},addEventListener(){}};
  var window={addEventListener(){}};var fakeEl=${fakeEl.toString()};`;

let api;
try {
fs.writeFileSync('eval_dump.js', stub + scripts);
  api = new Function(stub + scripts +
    '\nreturn {solve,step,clone,initialState,effectiveTheta,nextCredibility,SCENARIOS,PI_TARGET,IS_R_BASE};')();
} catch (e) {
  console.error('FAILED TO LOAD ENGINE:', e.stack);
  process.exit(1);
}
const { solve, step, clone, initialState, effectiveTheta, nextCredibility, SCENARIOS, PI_TARGET, IS_R_BASE } = api;

// ---- Tiny test harness -----------------------------------------------------
let passed = 0, failed = 0;
function check(name, cond, detail = '') {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const approx = (a, b, tol = 0.05) => Math.abs(a - b) <= tol;

// Run a state forward n periods (fresh merge onto initialState, like the app does).
function run(mod, n) {
  let s = Object.assign(clone(initialState), clone(mod || {}));
  for (let k = 0; k < n; k++) s = step(s);
  return s;
}
function preset(id) {
  const sc = SCENARIOS.find(s => s.id === id);
  if (!sc) throw new Error('preset not found: ' + id);
  return Object.assign(clone(initialState), clone(sc.state));
}

console.log('Verifying islm_pc_model_v19 (open economy) …\n');

// 1. Baseline equilibrium: at i = I_NEUTRAL with πᵉ on target, Y must equal 100.
{
  const eq = solve(clone(initialState));
  check('1 baseline Y=100', approx(eq.Y, 100, 0.01), `Y=${eq.Y.toFixed(2)}`);
  check('1 baseline i=3%',  approx(eq.i, 0.03, 0.0005), `i=${(eq.i*100).toFixed(2)}%`);
  check('1 baseline r=1%',  approx(eq.r, 0.01, 0.0005), `r=${(eq.r*100).toFixed(2)}%`);
  check('1 baseline pi=2%', approx(eq.pi, 0.02, 0.0005), `pi=${(eq.pi*100).toFixed(2)}%`);
  check('1 baseline E=1',   approx(eq.E, 1.0, 0.01), `E=${eq.E.toFixed(3)}`);
  check('1 baseline eps=1', approx(eq.eps, 1.0, 0.01), `eps=${eq.eps.toFixed(3)}`);
}

// 2. De-Anchored preset: disinflation path recovers to potential (Taylor-anchor fix).
{
  let s = preset('expectationsDeAnchored');
  let trough = Infinity;
  for (let k = 0; k < 300; k++) { trough = Math.min(trough, solve(s).Y); s = step(s); }
  const eq = solve(s);
  check('2 deAnchored troughs (sacrifice)', trough < 98, `trough Y=${trough.toFixed(1)}`);
  
  // Permanent supply shocks in the open economy have no stationary equilibrium under backward-looking
  // exchange-rate expectations (Blanchard Ch. 20 — forward-looking FX is out of scope). This scenario
  // uses a transitory shock; permanent-disinflation dynamics are tested in the closed model v16.
  // Because the shock decays to zero (z=0), the correct steady-state equilibrium given alpha=0.3
  // is gap = -z/alpha = 0, so Y converges precisely back to potential (Y = 100).
  check('2 deAnchored converges to exactly 100', approx(eq.Y, 100, 0.1),
        `end Y=${eq.Y.toFixed(2)} (transitory shock decays, returning output to potential)`);
}

// 3. Exchange-rate disinflation: loose rate booms then real appreciation pulls Y back.
{
  let s = preset('exchangeRateDisinflation');
  let peak = -Infinity;
  for (let k = 0; k < 300; k++) { peak = Math.max(peak, solve(s).Y); s = step(s); }
  const eq = solve(s);
  check('3 exRate booms', peak > 102, `peak Y=${peak.toFixed(1)}`);
  // With Taylor OFF and fixed low rate, Y should settle somewhat above 100 because i < i*
  check('3 exRate settles (not divergent)', eq.Y < 115 && eq.Y > 95,
        `end Y=${eq.Y.toFixed(2)}`);
}

// 4. Taylor OFF + fixed rate away from neutral: stays off-potential (intended).
{
  const s = run({ i: 0.01, i_target: 0.01, theta: 1, cred: 1, taylor_on: false, deanchor_on: false }, 30);
  const eq = solve(s);
  // In the open economy the exchange-rate channel partially offsets fixed-rate
  // misalignment (UIP + adaptive E_e), so the effect is weaker than closed-economy.
  // But output should still be noticeably above potential.
  check('4 fixed loose rate stays above potential', eq.Y > 100.5,
        `Y=${eq.Y.toFixed(1)} (should stay above 100 with loose rate)`);
}

// 5. Credibility recovery: start low, on-target policy rebuilds it toward the cap.
{
  let s = Object.assign(clone(initialState),
    { theta: 1, cred: 0.2, deanchor_on: true, taylor_on: true, phi: 1.5, pi_e: 0.02 });
  const start = s.cred;
  for (let k = 0; k < 40; k++) s = step(s);
  check('5 credibility climbs from 0.2', s.cred > 0.9,
        `start ${start}, end ${s.cred.toFixed(2)}`);
  check('5 effective theta rises to cap', approx(effectiveTheta(s), 1.0, 0.05),
        `effθ=${effectiveTheta(s).toFixed(2)}`);
}

// 6. Ceiling respected: effective theta = cap × credibility, never exceeds cap.
{
  const a = clone(initialState); a.theta = 0.4; a.cred = 1.0;
  const b = clone(initialState); b.theta = 0.4; b.cred = 0.5;
  check('6 effθ capped at θ', approx(effectiveTheta(a), 0.40, 0.001), `effθ=${effectiveTheta(a).toFixed(3)}`);
  check('6 effθ = cap×cred',  approx(effectiveTheta(b), 0.20, 0.001), `effθ=${effectiveTheta(b).toFixed(3)}`);
}

// 7. UIP identity: E = E_e * (1+i) / (1+i*).
{
  let s = clone(initialState); s.i = 0.05; s.i_star = 0.03; s.E_e = 1.0;
  const eq = solve(s);
  const expected_E = 1.0 * (1.05) / (1.03);
  check('7 UIP E identity', approx(eq.E, expected_E, 0.001),
        `E=${eq.E.toFixed(4)}, expected ${expected_E.toFixed(4)}`);
}

// 8. Real exchange rate: eps = E * P / P*.
{
  let s = clone(initialState); s.P = 1.1; s.P_star = 1.0;
  const eq = solve(s);
  check('8 real eps = E*P/P*', approx(eq.eps, eq.E * 1.1 / 1.0, 0.001),
        `eps=${eq.eps.toFixed(4)}, expected ${(eq.E * 1.1).toFixed(4)}`);
}

// 9. Taylor rule anchors to I_NEUTRAL, not i_target.
{
  // Set i_target to 1% but Taylor ON — the rule should override toward I_NEUTRAL
  let s = Object.assign(clone(initialState),
    { i: 0.03, i_target: 0.01, taylor_on: true, theta: 1, cred: 1, phi: 1.5 });
  for (let k = 0; k < 60; k++) s = step(s);
  const eq = solve(s);
  check('9 Taylor anchors to I_NEUTRAL not i_target', approx(eq.Y, 100, 0.5),
        `Y=${eq.Y.toFixed(2)} (should converge to 100 regardless of i_target)`);
}

// 10. No regime field on state (dropped).
{
  check('10 no regime in initialState', !('regime' in initialState),
        `regime=${initialState.regime}`);
}

// 11. State has cred and deanchor_on fields.
{
  check('11 cred in initialState', 'cred' in initialState && typeof initialState.cred === 'number',
        `cred=${initialState.cred}`);
  check('11 deanchor_on in initialState', 'deanchor_on' in initialState,
        `deanchor_on=${initialState.deanchor_on}`);
}

// 12. All presets run 300 periods with finite, bounded end state (no NaN/Inf).
{
  let allFinite = true, detail = '';
  for (const sc of SCENARIOS) {
    let s = Object.assign(clone(initialState), clone(sc.state));
    for (let k = 0; k < 300; k++) s = step(s);
    const eq = solve(s);
    const ok = Number.isFinite(eq.Y) && Number.isFinite(eq.pi) &&
               Number.isFinite(s.pi_e) && Number.isFinite(s.cred) &&
               Number.isFinite(s.P) && Math.abs(eq.Y) <= 200;
    if (!ok) { allFinite = false; detail = `${sc.id}: Y=${eq.Y} pi=${eq.pi} cred=${s.cred}`; }
  }
  check('12 all presets finite & bounded after 300 periods', allFinite, detail);
}

// 13. Twin Deficits preset: G > T drives real appreciation.
{
  let s = preset('twinDeficits');
  const eq0 = solve(s);
  for (let k = 0; k < 100; k++) s = step(s);
  const eq1 = solve(s);
  check('13 twin deficits: real eps rises', eq1.eps > eq0.eps + 0.01,
        `eps0=${eq0.eps.toFixed(3)}, eps100=${eq1.eps.toFixed(3)}`);
}

// ---- Summary ---------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
