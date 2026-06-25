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
  api = new Function(stub + scripts +
    '\nreturn {solve,step,clone,initialState,effectiveTheta,nextCredibility,SCENARIOS,PI_TARGET,IS_R_BASE,isOutput,isRateForOutput,effectivePiE,tutorialState,currentStage,goToStage};')();
} catch (e) {
  console.error('FAILED TO LOAD ENGINE:', e.stack);
  process.exit(1);
}
const { solve, step, clone, initialState, effectiveTheta, nextCredibility, SCENARIOS, PI_TARGET, IS_R_BASE, isOutput, isRateForOutput, effectivePiE, tutorialState,currentStage, goToStage } = api;

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
goToStage(4);

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

// 14. Static coverage for interactive drag handlers (HANDLES.*)
{
  function getCandidateIdentifiers(codeStr) {
    const candidateSet = new Set(['eq', 'eqNow']);
    for (const match of codeStr.matchAll(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*solve\(/g)) {
      candidateSet.add(match[1]);
    }
    return Array.from(candidateSet);
  }

  function checkHandlers(codeStr, isSelfTest = false) {
    let handlers = [];
    const re = /HANDLES\.([a-zA-Z0-9_]+)\s*=\s*\([^)]*\)\s*=>\s*\{/g;
    let match;
    while ((match = re.exec(codeStr)) !== null) {
      const name = match[1];
      const start = match.index + match[0].length - 1;
      let depth = 0;
      let end = -1;
      for (let i = start; i < codeStr.length; i++) {
        if (codeStr[i] === '{') depth++;
        else if (codeStr[i] === '}') {
          depth--;
          if (depth === 0) { end = i + 1; break; }
        }
      }
      if (end !== -1) {
        handlers.push({ name, body: codeStr.substring(match.index, end) });
      }
    }

    if (!isSelfTest) {
      check('14 handler sanity count', handlers.length >= 4, `found ${handlers.length} handlers`);
    }

    const candidates = getCandidateIdentifiers(codeStr);
    let anyHandlerFailed = false;

    for (const { name, body } of handlers) {
      const cleanBody = body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
      let usedAny = false;
      let handlerPassed = true;

      for (const id of candidates) {
        const uses = [...cleanBody.matchAll(new RegExp(`\\b${id}\\b`, 'g'))].map(m => m.index);
        if (uses.length === 0) continue;
        
        usedAny = true;
        const decl = cleanBody.search(new RegExp(`(?:const|let|var)\\s+${id}\\b`));
        if (decl === -1) {
          if (!isSelfTest) check(`14 HANDLES.${name} declares ${id} locally`, false, `offending identifier: ${id}`);
          handlerPassed = false;
        } else if (uses[0] < decl) {
          if (!isSelfTest) check(`14 HANDLES.${name} declares ${id} locally`, false, `used before declaration: ${id}`);
          handlerPassed = false;
        } else {
          if (!isSelfTest) check(`14 HANDLES.${name} declares ${id} locally`, true);
        }
      }
      
      if (!usedAny && !isSelfTest) {
        check(`14 HANDLES.${name} uses no solve-result identifier`, true);
      }
      if (!handlerPassed) anyHandlerFailed = true;
    }
    return !anyHandlerFailed;
  }

  // Self-test
  const goodFixture = `HANDLES.x = (a,b)=>{ const eq = solve(s); return eq.Y_n; }`;
  const badFixture = `HANDLES.y = (a,b)=>{ return eq.Y_n; }`;
  const goodPass = checkHandlers(goodFixture, true);
  const badPass = checkHandlers(badFixture, true);
  check('14 SELF-TEST analyzer GOOD fixture passes', goodPass === true);
  check('14 SELF-TEST analyzer BAD fixture fails', badPass === false);

  // Actual analysis on html
  checkHandlers(html, false);
}

// ---- 15. Open Multiplier ---------------------------------------------------
{
  const Y0 = isOutput(20, 20, IS_R_BASE, 1, 0.5, 0.30, 100);
  const Yg = isOutput(21, 20, IS_R_BASE, 1, 0.5, 0.30, 100);   // +1 G
  const Yy = isOutput(20, 20, IS_R_BASE, 1, 0.5, 0.30, 101);   // +1 Y*
  const Ym = isOutput(20, 20, IS_R_BASE, 1, 0.5, 0.40, 100);   // m1 0.30→0.40

  check('15 baseline isOutput=100', approx(Y0, 100, 0.001), `Y0=${Y0.toFixed(4)}`);
  check('15 dY/dG ≈ 1.43',  approx(Yg - Y0, 1.4286, 0.02), `ΔY/ΔG=${(Yg-Y0).toFixed(4)}`);
  check('15 dY/dY* ≈ 0.43', approx(Yy - Y0, 0.4286, 0.02), `ΔY/ΔY*=${(Yy-Y0).toFixed(4)}`);
  // import leakage: raising m1 must STRICTLY lower output at the same demand
  check('15 higher m1 lowers Y (leakage)', Ym < Y0 - 0.01, `Y(m1=.40)=${Ym.toFixed(4)}`);
  
  // Self-test
  const staleIsOutput = (G, T, r, eps) => 100 + 2*(G-20) - (T-20) - 400*(r-0.01) - 100*(eps-1);
  const staleY0 = staleIsOutput(20, 20, 0.01, 1, 0.5, 0.30, 100);
  const staleYm = staleIsOutput(20, 20, 0.01, 1, 0.5, 0.40, 100);
  check('15 SELF-TEST analyzer BAD fixture fails', !(staleYm < staleY0 - 0.01));
}
// ---- 16. πᵉ gating -----------------------------------------------------------
{
  // PC LOCKED: r = i, so moving πᵉ must not move Y.
  goToStage(1);            // PC NOT in the set
  const sA = clone(initialState); sA.pi_e = 0.02;
  const sB = clone(initialState); sB.pi_e = 0.10; // large πᵉ change
  const Ya = solve(sA).Y, Yb = solve(sB).Y;
  check('16 PC-locked: Y invariant to πᵉ', approx(Ya, Yb, 1e-9),
        `Y(πᵉ=2%)=${Ya.toFixed(4)} Y(πᵉ=10%)=${Yb.toFixed(4)}`);
  check('16 PC-locked: r = i (no Fisher)', approx(solve(sB).r, sB.i, 1e-9),
        `r=${solve(sB).r.toFixed(4)} i=${sB.i.toFixed(4)}`);

  // PC UNLOCKED: r = i − πᵉ, so a higher πᵉ lowers r, raising Y.
  goToStage(3);
  const Yc = solve(sB).Y;                          // same sB, now PC unlocked
  check('16 PC-unlocked: higher πᵉ raises Y (real-rate channel live)', Yc > Ya + 0.5,
        `Y(πᵉ=10%, PC on)=${Yc.toFixed(4)} vs locked baseline ${Ya.toFixed(4)}`);
  check('16 PC-unlocked: r = i − πᵉ', approx(solve(sB).r, sB.i - sB.pi_e, 1e-9),
        `r=${solve(sB).r.toFixed(4)}`);

  // SELF-TEST: check it fails against un-gated logic
  const ungatedSolve = (s) => {
    const i = Math.max(-0.005, s.i);
    const r = i - s.pi_e;
    const Y = isOutput(s.G, s.T, r, 1.0, s.c1, s.m1, s.Ystar);
    return { Y, r };
  };
  const ya_ungated = ungatedSolve(sA).Y;
  const yb_ungated = ungatedSolve(sB).Y;
  check('16 SELF-TEST analyzer BAD fixture fails', !approx(ya_ungated, yb_ungated, 1e-9));

  // restore default tutorial state for any later assertions
  goToStage(3);
}

// ---- 17. Closed Multiplier (§5.1) -------------------------------------------
{
  goToStage(0); // IS Model (closed)
  const s0 = clone(initialState);
  const sg = clone(initialState); sg.G += 1;
  const Y0 = solve(s0).Y;
  const Yg = solve(sg).Y;
  check('17 Closed multiplier: unlocked={GOODS,ISLM} -> dY/dG ≈ 2.5', approx(Yg - Y0, 2.5, 0.05), `dY/dG=${(Yg-Y0).toFixed(4)}`);
}

// ---- 18. Open Multiplier (Regression) (§5.2) -------------------------------
{
  goToStage(1); // IS-LM-UIP Model (open)
  const s0 = clone(initialState);
  const sg = clone(initialState); sg.G += 1;
  const Y0 = solve(s0).Y;
  const Yg = solve(sg).Y;
  check('18 Open multiplier: unlocked={GOODS,ISLM,UIP} -> dY/dG ≈ 1.43', approx(Yg - Y0, 1.4286, 0.05), `dY/dG=${(Yg-Y0).toFixed(4)}`);
}

// ---- 19. No Trade Channel Closed (§5.3) -------------------------------------
{
  goToStage(0); // IS Model (closed)
  const s0 = clone(initialState);
  const eq0 = solve(s0);
  
  const s1 = clone(initialState); s1.i_star = 0.10;
  const s2 = clone(initialState); s2.E_e = 1.5;
  const s3 = clone(initialState); s3.m1 = 0.5;
  const s4 = clone(initialState); s4.Ystar = 120;
  
  const eq1 = solve(s1);
  const eq2 = solve(s2);
  const eq3 = solve(s3);
  const eq4 = solve(s4);
  
  const inv = (eq) => approx(eq.Y, eq0.Y, 1e-9) && approx(eq.r, eq0.r, 1e-9) && approx(eq.pi, eq0.pi, 1e-9);
  check('19 No trade channel closed: invariant to i_star, E_e, m1, Ystar', inv(eq1) && inv(eq2) && inv(eq3) && inv(eq4));
}

// ---- 20a. Pre-PC closed short run (§5.4a) -----------------------------------
{
  goToStage(0); // IS Model (closed, no PC)
  const s0 = clone(initialState);
  const eq0 = solve(s0);
  const sPi = clone(initialState); sPi.pi_e += 0.05;
  const eqPi = solve(sPi);
  
  const y90 = approx(eq0.Y, 90, 0.1);
  const rEqI = approx(eq0.r, s0.i, 1e-6);
  const invPi = approx(eqPi.Y, eq0.Y, 1e-6);
  
  check('20a Pre-PC closed short run: Y=90, r=i, invariant to πᵉ (no inflation)', y90 && rEqI && invPi, `Y=${eq0.Y.toFixed(4)}, r=${eq0.r.toFixed(4)}, eqPi.Y=${eqPi.Y.toFixed(4)}`);
}

// ---- 20b. Medium-run closed baseline (§5.4b) --------------------------------
{
  goToStage(2); // IS-LM-PC Model (closed, PC)
  const s0 = clone(initialState);
  const eq0 = solve(s0);
  const y100 = approx(eq0.Y, 100, 0.1);
  const fisher = approx(eq0.r, s0.i - s0.pi_e, 1e-6);
  check('20b Medium-run closed baseline: Y=100, r=i−πᵉ (Fisher on with PC)', y100 && fisher, `Y=${eq0.Y.toFixed(4)}, r=${eq0.r.toFixed(4)}`);
}

// ---- 21. Level-2 Named Cell (§5.5) ------------------------------------------
{
  goToStage(1); // IS-LM-UIP Model (open, PC locked)
  const s0 = clone(initialState); s0.pi_e = 0.05; // Change pi_e to verify r=i
  const eq0 = solve(s0);
  check('21 Level-2 cell: open economy, no inflation (r=i)', approx(eq0.r, s0.i, 1e-6) && !approx(eq0.r, s0.i - s0.pi_e, 1e-6), `r=${eq0.r.toFixed(4)}, i=${s0.i.toFixed(4)}, pi_e=${s0.pi_e.toFixed(4)}`);
}

// ---- 22. Level-3 Cross-Cell (§5.6) ------------------------------------------
{
  goToStage(2); // IS-LM-PC Model (closed, PC unlocked)
  const s0 = clone(initialState);
  const sg = clone(initialState); sg.G += 1;
  const sPi = clone(initialState); sPi.pi_e += 0.02; // Change pi_e
  const sTrade = clone(initialState); sTrade.m1 = 0.5;
  
  const eq0 = solve(s0);
  const eqg = solve(sg);
  const eqPi = solve(sPi);
  const eqTrade = solve(sTrade);
  
  const mult = approx(eqg.Y - eq0.Y, 2.5, 0.05);
  const fisher = approx(eq0.r, s0.i - s0.pi_e, 1e-6);
  const noTrade = approx(eqTrade.Y, eq0.Y, 1e-6);
  const respondsPi = !approx(eqPi.Y, eq0.Y, 1e-6);
  
  check('22 Level-3 cross-cell: closed multiplier, r=i-pi_e, invariant to trade, responds to pi_e', mult && fisher && noTrade && respondsPi);
}

// ---- 23. Curve Reconciles to Engine (Closed) (§5.7) -------------------------
{
  goToStage(2); // IS-LM-PC Model (closed, PC unlocked)
  const s0 = clone(initialState);
  const eq0 = solve(s0);
  const r_curve = isRateForOutput(eq0.Y, s0.G, s0.T, eq0.eps, effectivePiE(s0), s0.c1, s0.m1, s0.Ystar);
  
  goToStage(3); // Full Model (open, PC unlocked)
  const sOpen = clone(initialState);
  // Note: hard-coding eps=1 is fine here because eps only shifts the IS intercept, not its slope.
  const r_open1 = isRateForOutput(90, sOpen.G, sOpen.T, 1, effectivePiE(sOpen), sOpen.c1, sOpen.m1, sOpen.Ystar);
  const r_open2 = isRateForOutput(100, sOpen.G, sOpen.T, 1, effectivePiE(sOpen), sOpen.c1, sOpen.m1, sOpen.Ystar);
  const slopeOpen = Math.abs(r_open2 - r_open1) / 10;
  
  goToStage(2); // IS-LM-PC Model (closed, PC unlocked)
  const r_closed1 = isRateForOutput(90, s0.G, s0.T, 1, effectivePiE(s0), s0.c1, s0.m1, s0.Ystar);
  const r_closed2 = isRateForOutput(100, s0.G, s0.T, 1, effectivePiE(s0), s0.c1, s0.m1, s0.Ystar);
  const slopeClosed = Math.abs(r_closed2 - r_closed1) / 10;

  // A larger multiplier (closed, k=2.5) means a flatter curve in (Y, i) space; the open multiplier
  // (k_o≈1.43) is smaller, so the open IS is steeper. Hence slopeOpen > slopeClosed.
  check('23 Curve reconciles to engine (closed)', approx(r_curve, eq0.i, 0.001) && slopeOpen > slopeClosed, `r_curve=${r_curve.toFixed(4)}, eq0.i=${eq0.i.toFixed(4)}, slopeClosed=${slopeClosed.toFixed(4)}, slopeOpen=${slopeOpen.toFixed(4)}`);
  
  // Restore
  goToStage(3);
}

// ---- 24. Stage->Economy Mapping (§6.1) ---------------------------------------
{
  // Stage 1 -> open
  goToStage(1);
  const eq1 = solve(clone(initialState));
  const multOpen1 = approx(solve({...initialState, G: initialState.G+1}).Y - eq1.Y, 1.43, 0.05);
  
  // Stage 2 -> closed
  goToStage(2);
  const eq2 = solve(clone(initialState));
  const multClosed = approx(solve({...initialState, G: initialState.G+1}).Y - eq2.Y, 2.5, 0.05);
  
  // Stage 3 -> open
  goToStage(3);
  const eq3 = solve(clone(initialState));
  const multOpen3 = approx(solve({...initialState, G: initialState.G+1}).Y - eq3.Y, 1.43, 0.05);

  check('24 Stage->economy mapping (open/closed toggles correctly)', multOpen1 && multClosed && multOpen3);
}

// ---- 25. UIP Re-opens at Full (§6.3) ----------------------------------------
{
  // Stage 2 (IS-LM-PC) -> closed
  goToStage(2);
  const eqClosed = solve(clone(initialState));
  const sOpen1 = clone(initialState); sOpen1.i_star = 0.10;
  const invClosed = approx(solve(sOpen1).Y, eqClosed.Y, 1e-6); // Trade channel dead

  // Stage 3 (Full) -> open
  goToStage(3);
  const eqOpen = solve(clone(initialState));
  const openTrade = !approx(solve(sOpen1).Y, eqOpen.Y, 1e-6); // Trade channel alive
  
  check('25 UIP re-opens at Full Model (trade channel turns back on)', invClosed && openTrade);
}

// ---- 26. Dropdown Jump = Next-walk (§6.5) -----------------------------------
{
  // Walk 0->1->2->3
  goToStage(0);
  goToStage(1);
  goToStage(2);
  goToStage(3);
  const eqWalk = solve(clone(initialState));
  
  // Jump 0->3
  goToStage(0);
  goToStage(3);
  const eqJump = solve(clone(initialState));
  
  check('26 Dropdown jump = Next-walk (no path dependence)', approx(eqWalk.Y, eqJump.Y, 1e-6) && approx(eqWalk.r, eqJump.r, 1e-6));
}
// ---- 27. Consistent Stage/Unlocked (§6.2) -----------------------------------
{
  goToStage(2);
  const ok = tutorialState.unlocked.size === currentStage().unlocked.length && currentStage().unlocked.every(b => tutorialState.unlocked.has(b));
  check('27 Stage and unlocked set must remain consistent', ok);
}

// ---- Summary ---------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
