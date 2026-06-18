// verify_v16.mjs — regression checks for the closed-economy IS-MP-PC model.
//
// Usage:  node verify_v16.mjs
// Exit code 0 = all checks passed, 1 = at least one failed.
//
// This loads islm_pc_model_v16_Closed_Economy_MediumRun.html, extracts its
// <script> code, stubs a minimal DOM so the engine runs headless, and exercises
// solve()/step() against the behaviors that must hold. See README.md ("Verifying
// changes") for the economic rationale behind each check.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'islm_pc_model_v16_Closed_Economy_MediumRun.html');

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
    '\nreturn {solve,step,clone,initialState,effectiveTheta,SCENARIOS};')();
} catch (e) {
  console.error('FAILED TO LOAD ENGINE:', e.message);
  process.exit(1);
}
const { solve, step, clone, initialState, effectiveTheta, SCENARIOS } = api;

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

console.log('Verifying islm_pc_model_v16 …\n');

// 1. Baseline equilibrium
{
  const eq = solve(clone(initialState));
  check('1 baseline Y=100', approx(eq.Y, 100, 0.01), `Y=${eq.Y.toFixed(2)}`);
  check('1 baseline i=3%',  approx(eq.i, 0.03, 0.0005), `i=${(eq.i*100).toFixed(2)}%`);
  check('1 baseline r=1%',  approx(eq.r, 0.01, 0.0005), `r=${(eq.r*100).toFixed(2)}%`);
  check('1 baseline pi=2%', approx(eq.pi, 0.02, 0.0005), `pi=${(eq.pi*100).toFixed(2)}%`);
  check('1 baseline M/P=100', approx(eq.MP, 100, 0.5), `M/P=${eq.MP.toFixed(2)}`);
}

// 2. Disinflation preset: recovers fully to potential (NOT stuck at ~97).
{
  let s = preset('disinflationSacrifice');
  let trough = Infinity;
  for (let k = 0; k < 300; k++) { trough = Math.min(trough, solve(s).Y); s = step(s); }
  const eq = solve(s);
  check('2 disinflation troughs (sacrifice)', trough < 95, `trough Y=${trough.toFixed(1)}`);
  check('2 disinflation recovers to Y=100', approx(eq.Y, 100, 0.3),
        `end Y=${eq.Y.toFixed(2)} (if ~97, Taylor-anchor bug is back)`);
  check('2 disinflation pi back to 2%', approx(eq.pi, 0.02, 0.003), `pi=${(eq.pi*100).toFixed(2)}%`);
}

// 3. Monetary neutrality preset: boom then back to potential.
{
  let s = preset('monetaryNeutrality');
  let peak = -Infinity;
  for (let k = 0; k < 300; k++) { peak = Math.max(peak, solve(s).Y); s = step(s); }
  const eq = solve(s);
  check('3 neutrality booms', peak > 104, `peak Y=${peak.toFixed(1)}`);
  check('3 neutrality returns to Y=100', approx(eq.Y, 100, 0.2), `end Y=${eq.Y.toFixed(2)}`);
}

// 4. Taylor OFF + fixed rate away from neutral: freezes off-potential (intended).
{
  const s = run({ i: 0.01, i_target: 0.01, theta: 1, cred: 1, taylor_on: false, deanchor_on: false }, 30);
  const eq = solve(s);
  check('4 fixed loose rate stays off-potential', eq.Y > 104,
        `Y=${eq.Y.toFixed(1)} (should NOT self-correct to 100)`);
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

// 7. All presets run 300 periods with finite, bounded end state (no NaN/Inf).
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
  check('7 all presets finite & bounded after 300 periods', allFinite, detail);
}

// 8. Static coverage for interactive drag handlers (HANDLES.*)
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
      check('8 handler sanity count', handlers.length >= 3, `found ${handlers.length} handlers`);
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
          if (!isSelfTest) check(`8 HANDLES.${name} declares ${id} locally`, false, `offending identifier: ${id}`);
          handlerPassed = false;
        } else if (uses[0] < decl) {
          if (!isSelfTest) check(`8 HANDLES.${name} declares ${id} locally`, false, `used before declaration: ${id}`);
          handlerPassed = false;
        } else {
          if (!isSelfTest) check(`8 HANDLES.${name} declares ${id} locally`, true);
        }
      }
      
      if (!usedAny && !isSelfTest) {
        check(`8 HANDLES.${name} uses no solve-result identifier`, true);
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
  check('8 SELF-TEST analyzer GOOD fixture passes', goodPass === true);
  check('8 SELF-TEST analyzer BAD fixture fails', badPass === false);

  // Actual analysis on html
  checkHandlers(html, false);
}

// ---- Summary ---------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
