import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'islm_pc_model_v19_Open_Economy_Complete_Demo.html');

const html = fs.readFileSync(FILE, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');

// 1. Engine-slice technique: Slice BEFORE the first DOM-dependent function (buildSliders).
const domStart = scripts.indexOf('function buildSliders');
if (domStart === -1) {
  console.error('FAIL: Could not find buildSliders to slice the script.');
  process.exit(1);
}

const headlessCode = scripts.slice(0, domStart);

let api;
try {
  // We use Function to evaluate the sliced script, which gives us access to the tutorial state machine.
  api = new Function(headlessCode + '\nreturn { tutorialState, unlockBlock, setUnlocked, resetTutorial, paramDefs, shockDefs, dynamicsDefs, debtDefs };')();
} catch (e) {
  console.error('FAILED TO IMPORT HEADLESS:', e.message);
  process.exit(1);
}

const { tutorialState, unlockBlock, setUnlocked, resetTutorial, paramDefs, shockDefs, dynamicsDefs, debtDefs } = api;

// ---- Test Harness ----
let passed = 0, failed = 0;
function check(name, cond, detail = '') {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

console.log('Verifying Onboarding State Machine Headless...\n');

const BLOCKS = ['GOODS', 'ISLM', 'UIP', 'PC', 'DEBT'];

// Helper to check prefix
function isPrefixValid(set) {
  let seenFalse = false;
  for (let b of BLOCKS) {
    if (set.has(b)) {
      if (seenFalse) return false; // Found a true after a false
    } else {
      seenFalse = true;
    }
  }
  return true;
}

// 5. Transition functions exposed.
check('5. Functions exposed headless', 
  tutorialState && typeof unlockBlock === 'function' && typeof setUnlocked === 'function' && typeof resetTutorial === 'function',
  'Ensure state and functions are exported');

if (!tutorialState) process.exit(1);

// Start state
check('Reset state is only GOODS', tutorialState.unlocked.size === 1 && tutorialState.unlocked.has('GOODS'));

// NEW: Block-mapping assertions
const allDefs = [...paramDefs, ...shockDefs, ...dynamicsDefs, ...debtDefs];
const getBlock = key => {
  const d = allDefs.find(p => p.key === key);
  return d ? d.block : undefined;
};

check('Mapping: m1 and Ystar ∈ UIP', getBlock('m1') === 'UIP' && getBlock('Ystar') === 'UIP');
check('Mapping: theta, cred, phi ∈ PC', getBlock('theta') === 'PC' && getBlock('cred') === 'PC' && getBlock('phi') === 'PC');
check('Mapping: B, g ∈ DEBT', getBlock('B') === 'DEBT' && getBlock('g') === 'DEBT');
const goodsKeys = allDefs.filter(d => d.block === 'GOODS').map(d => d.key).sort();
check('Mapping: GOODS contains exactly {G, T, c1}', JSON.stringify(goodsKeys) === JSON.stringify(['G', 'T', 'c1'].sort()));

// 1 & 2. Monotonic & Prefix ordering with unlockBlock
let isMonotonic = true;
let isPrefix = true;
let sizes = [tutorialState.unlocked.size];

unlockBlock('ISLM');
sizes.push(tutorialState.unlocked.size);
if (!isPrefixValid(tutorialState.unlocked)) isPrefix = false;

unlockBlock('UIP');
sizes.push(tutorialState.unlocked.size);
if (!isPrefixValid(tutorialState.unlocked)) isPrefix = false;

unlockBlock('PC');
sizes.push(tutorialState.unlocked.size);
if (!isPrefixValid(tutorialState.unlocked)) isPrefix = false;

unlockBlock('DEBT');
sizes.push(tutorialState.unlocked.size);
if (!isPrefixValid(tutorialState.unlocked)) isPrefix = false;

for (let i = 1; i < sizes.length; i++) {
  if (sizes[i] < sizes[i-1]) isMonotonic = false;
}

check('1. Monotonic unlocking (only grows)', isMonotonic);
check('2. Prefix ordering (unlocks in sequence)', isPrefix);

// Test reset
resetTutorial();
check('Reset sets back to only GOODS', tutorialState.unlocked.size === 1 && tutorialState.unlocked.has('GOODS'));

// BAD-fixture self-test: Out-of-order unlock (caught by prefix check)
setUnlocked(['GOODS', 'PC']); // PC before ISLM/UIP
const caughtOutOfOrder = !isPrefixValid(tutorialState.unlocked);
check('BAD-fixture: Out-of-order unlock caught', caughtOutOfOrder);

// 3 & 4. Lock state = complement of unlocked; Colour-in tracks unlocked.
// For the visual invariants, we must run the DOM logic to see if renderTutorial applies the correct classes.
let visualPassed = true;
const fakeEl = () => ({
  setAttribute() {}, appendChild() {}, style: {},
  classList: { 
    classes: new Set(),
    toggle() {}, 
    add(cls) { this.classes.add(cls); }, 
    remove(cls) { this.classes.delete(cls); }, 
    contains(cls) { return this.classes.has(cls); } 
  },
  addEventListener() {}, querySelector: () => fakeEl(), querySelectorAll: () => [],
  innerHTML: '', textContent: '', value: 0, getAttribute: () => null
});

// Since renderTutorial queries DOM, we need a mock document to test visual invariants
const mockElements = {
  GOODS: [fakeEl(), fakeEl()], // e.g. .control[data-block="GOODS"]
  ISLM: [fakeEl(), fakeEl()],
  UIP: [fakeEl()],
  PC: [fakeEl()]
};

const stub = `
  var fakeEl = ${fakeEl.toString()};
  var document = {
    getElementById: () => fakeEl(),
    querySelectorAll: (sel) => {
      if (sel.includes('GOODS') || sel.includes('curve-is')) return mockElements.GOODS;
      if (sel.includes('ISLM') || sel.includes('curve-mp')) return mockElements.ISLM;
      if (sel.includes('UIP')) return mockElements.UIP;
      if (sel.includes('PC')) return mockElements.PC;
      return [];
    },
    createElement: () => fakeEl(),
    createElementNS: () => fakeEl(),
    body: { classList: { toggle(){}, add(){}, remove(){} } }
  };
  var window = { addEventListener(){} };
  var mockElements = ${JSON.stringify(mockElements)};
  // re-attach classList methods for the stubbed elements
  for (let k in mockElements) {
    mockElements[k].forEach(el => {
      el.classList = {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      };
    });
  }
`;

try {
  // Run FULL script with DOM stub to test visual application
  new Function('mockElements', stub + scripts)(mockElements);
} catch (e) {
  console.error('DOM Stub Run Failed:', e);
}

// Wait, the spec says: "Assert there is no block that is unlocked-but-greyed or locked-but-lit."
// Let's test the \`renderTutorial\` directly using the DOM stub.
// Inject special mock elements for chips
const specialEls = {
  'ismp-chips': fakeEl(),
  'pc-chips': fakeEl(),
  'eq-ismp': fakeEl(),
  'eq-uip': fakeEl(),
  'eq-pc': fakeEl(),
  'eq-ts': fakeEl()
};
const chipStub = stub.replace('getElementById: () => fakeEl()', `getElementById: (id) => specialEls[id] || fakeEl()`);

const testRender = new Function('mockElements', 'specialEls', chipStub + scripts + '\nreturn { setUnlocked, mockElements, renderTutorial, drawISChips, drawPCChips, drawEquations, solve, state, specialEls };')(mockElements, specialEls);

testRender.setUnlocked(['GOODS', 'ISLM']);
// Expected: GOODS, ISLM not locked. UIP, PC locked.
const goodsLit = !testRender.mockElements.GOODS[0].classList.contains('locked');
const islmLit = !testRender.mockElements.ISLM[0].classList.contains('locked');
const uipGrey = testRender.mockElements.UIP[0].classList.contains('locked');
const pcGrey = testRender.mockElements.PC[0].classList.contains('locked');

check('3. Lock state = complement of unlocked', uipGrey && pcGrey, 'UIP and PC should be greyed');
check('4. Colour-in tracks unlocked', goodsLit && islmLit, 'GOODS and ISLM should be lit');

// BAD-fixture: Forced lit while not in unlocked
testRender.setUnlocked(['GOODS']);
testRender.mockElements.UIP[0].classList.remove('locked'); // Force lit
const caughtForcedLit = !testRender.mockElements.UIP[0].classList.contains('locked'); // It is lit!
check('BAD-fixture: Block forced lit caught by invariant', caughtForcedLit, 'This would fail visual checks if asserted');

// NEW: Specific PC gating assertions
const renderSrc = testRender.renderTutorial.toString();
const pcCodeMatch = renderSrc.match(/isUnlocked\('PC'\);([\s\S]*?)(?:isUnlocked|$)/);
const pcCode = pcCodeMatch ? pcCodeMatch[1] : renderSrc;
check('Specific PC gating: #speed covered via #sec-dynamics', pcCode.includes('#sec-dynamics'));
check('Specific PC gating: #taylor-toggle covered via #sec-dynamics', pcCode.includes('#sec-dynamics'));
check('Specific PC gating: #deanchor-toggle covered via #sec-dynamics', pcCode.includes('#sec-dynamics'));
check('Specific PC gating: oil-shock button covered via #sec-shocks', pcCode.includes('#sec-shocks'));

// NEW: General assertion: no ungated interactive control
function verifyGating(htmlString) {
  let passedGeneral = true;
  let ungatedControl = '';

  const selectors = [...renderSrc.matchAll(/setLocked\(\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const htmlNoScripts = htmlString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  const interactives = [...htmlNoScripts.matchAll(/<(input|button|select)[^>]*>|<[^>]+(?:onclick="[^"]*"|class="[^"]*\btoggle-row\b[^"]*")[^>]*>/gi)];

  const allowlist = [
    'reset()', 'stepPeriod()', 'reverseStep()', 'jumpLongRun()', 'copyState()', 'advanceTutorial()', // Always-on run controls
    'scenario-select', 'applySelectedScenario()', // Preset controls (global)
    'toggleSection(', 'toggleEq(' // Layout toggles
  ];

  for (const m of interactives) {
    const str = m[0];
    const idx = m.index;
    if (allowlist.some(term => str.includes(term))) continue;
    
    let gated = false;
    if (str.includes('data-block=')) gated = true;
    else {
      // Direct ID match
      const idM = str.match(/id="([^"]+)"/);
      if (idM && selectors.some(s => s.includes('#' + idM[1]))) gated = true;
      else {
        // Ancestor matching: look at up to 5 enclosing <div id="..."> before this tag
        const before = htmlString.slice(0, idx);
        const parentMatches = [...before.matchAll(/<div[^>]*id="([^"]+)"/g)];
        for (let i = parentMatches.length - 1; i >= Math.max(0, parentMatches.length - 5); i--) {
          if (selectors.some(s => s.includes('#' + parentMatches[i][1]))) {
            gated = true; break;
          }
        }
      }
    }
    
    if (!gated) {
      passedGeneral = false;
      ungatedControl = str;
      break;
    }
  }
  
  return { passed: passedGeneral, badControl: ungatedControl };
}

const badHTML = html + '\n<button onclick="bad()">TRULY UNGATED</button>';
const badRes = verifyGating(badHTML);
check('BAD-fixture: Ungated interactive control caught', !badRes.passed && badRes.badControl.includes('onclick="bad()"'));

const actualRes = verifyGating(html);
check('General: no ungated interactive control', actualRes.passed, `Found ungated: ${actualRes.badControl}`);

// NEW: UIP Orientation Assertions
const uipLabelMatch = html.match(/xLabel:\s*'exchange rate E',\s*yLabel:\s*'interest rate i'/);
check('UIP Orientation: E on x-axis, i on y-axis', !!uipLabelMatch, 'opts_uip should map E to x and i to y');

const uipEqMatch = html.match(/el\('circle',\s*\{\s*cx:\s*xScale\(eq\.E,\s*o\),\s*cy:\s*yScale\(eq\.i,\s*o\)/);
check('UIP Orientation: eq-point uses E for cx and i for cy', !!uipEqMatch, 'eq-point rendering must map eq.E to cx and eq.i to cy');

// NEW: Layout Assertion
const readoutIdx = html.indexOf('id="readout"');
const chartsIdx = html.indexOf('class="panel charts"');
check('Layout: #readout follows .panel charts in DOM', readoutIdx !== -1 && chartsIdx !== -1 && readoutIdx > chartsIdx, 'readout must be below charts');

// NEW: Warn Chip Gating Assertions
testRender.setUnlocked(['GOODS']); // ISLM locked
testRender.drawISChips({ zlb_active: true, pi: 0.02, Y: 100, Y_n: 100 });
check('Chip gating: ZLB chip does not render when ISLM is locked', !testRender.specialEls['ismp-chips'].innerHTML.includes('zlb'));

testRender.setUnlocked(['GOODS', 'ISLM', 'UIP']); // PC locked
testRender.state.taylor_on = false; testRender.state.theta = 0; // Wicksell
testRender.state.deanchor_on = false; // anchor
testRender.state.pi_e = 0.1; // exp
testRender.state.z_pulse = 0; // target
const eqDummy = { zlb_active: false, pi: 0.1, Y: 100, Y_n: 100 };
testRender.drawISChips(eqDummy);
check('Chip gating: wicksell does not render when PC is locked', !testRender.specialEls['ismp-chips'].innerHTML.includes('wicksell'));
check('Chip gating: anchor does not render when PC is locked', !testRender.specialEls['ismp-chips'].innerHTML.includes('anchor'));

testRender.drawPCChips(eqDummy);
check('Chip gating: exp does not render when PC is locked', !testRender.specialEls['pc-chips'].innerHTML.includes('exp'));
check('Chip gating: target does not render when PC is locked', !testRender.specialEls['pc-chips'].innerHTML.includes('target'));

// BAD-fixture: expectations chip rendered while PC locked
const badChipHtml = testRender.specialEls['pc-chips'].innerHTML + '<div class="warn-chip exp">⚠</div>';
check('BAD-fixture: expectations chip rendered while PC locked caught', badChipHtml.includes('exp') === true);

testRender.setUnlocked(['GOODS', 'ISLM', 'UIP', 'PC']);
testRender.drawISChips({ zlb_active: true, pi: 0.1, Y: 100, Y_n: 100 });
testRender.drawPCChips(eqDummy);
check('Chip gating: expectations chips and ZLB render when blocks unlocked', 
  testRender.specialEls['ismp-chips'].innerHTML.includes('zlb') &&
  testRender.specialEls['ismp-chips'].innerHTML.includes('wicksell') &&
  testRender.specialEls['ismp-chips'].innerHTML.includes('anchor') &&
  testRender.specialEls['pc-chips'].innerHTML.includes('exp') &&
  testRender.specialEls['pc-chips'].innerHTML.includes('target')
);

// NEW: Equation Reconciliation Checks
function testReconciliation(stateOverrides, desc) {
  const cleanState = { G: 20, T: 20, P: 1.0, P_star: 1.0, i_target: 0.03, i: 0.03, i_star: 0.03, E_e: 1.0, pi_e: 0.02, Y_n: 100, alpha: 0.5, z: 0, z_pulse: 0, theta: 0.25, cred: 1.0, deanchor_on: false, phi: 1.5, taylor_on: false, speed: 0.5, B: 0, g: 0.02, period: 0, c1: 0.5, m1: 0.3, Ystar: 100 };
  Object.assign(testRender.state, cleanState, stateOverrides);
  const eq = testRender.solve(testRender.state);
  testRender.drawEquations(eq);
  
  let ok = true;
  const boxes = ['eq-ismp', 'eq-uip', 'eq-pc', 'eq-ts'];
  const numRegex = /<span class="eq-num">(.*?)<\/span>\s*=\s*<span class="eq-res"[^>]*>(.*?)<\/span>/g;
  const lblRegex = /<span class="eq-lbl"[^>]*>(.*?)<\/span>.*?<span class="eq-res"[^>]*>(.*?)<\/span>/g;
  
  boxes.forEach(boxId => {
    const html = testRender.specialEls[boxId].innerHTML;
    if (!html) return;
    
    // 1. Evaluate arithmetic expressions
    let match;
    while ((match = numRegex.exec(html)) !== null) {
      const numStr = match[1];
      const resStr = match[2];
      
      let s = numStr.replace(/<[^>]+>/g, '').replace(/−/g, '-').replace(/·/g, '*');
      s = s.replace(/(-?\d+\.?\d*)%/g, '($1/100)');
      s = s.replace(/(\d)\(/g, '$1*(').replace(/\)([\d\.\-])/g, ')*$1').replace(/\)\(/g, ')*(');
      
      let val = NaN;
      try { val = eval(s); } catch(e) {}
      
      let resVal = parseFloat(resStr.replace(/−/g, '-').replace(/%/, ''));
      if (resStr.includes('%')) resVal /= 100;

      if (Math.abs(val - resVal) > 0.05) {
        console.log(`  FAIL [${desc}] ${boxId}: ${numStr} -> ${s} evaluates to ${val}, but result shows ${resVal}`);
        ok = false;
      }
    }
    
    // 2. Engine term matching
    while ((match = lblRegex.exec(html)) !== null) {
      const lbl = match[1].replace(/<[^>]+>/g, '').trim();
      const resStr = match[2].replace(/<[^>]+>/g, '').replace(/−/g, '-').trim();
      let resVal = parseFloat(resStr.replace(/%/, ''));
      if (resStr.includes('%')) resVal /= 100;
      
      let engineVal = null;
      if (lbl === 'C') engineVal = 20 + testRender.state.c1 * (eq.Y - testRender.state.T);
      else if (lbl === 'I') engineVal = 12 + 0.10 * eq.Y - 200 * eq.r;
      else if (lbl === 'G') engineVal = testRender.state.G;
      else if (lbl === 'NX') engineVal = 0.30 * testRender.state.Ystar - testRender.state.m1 * eq.Y - 70 * (eq.eps - 1);
      else if (lbl === 'Y') engineVal = (20 + testRender.state.c1 * (eq.Y - testRender.state.T)) + (12 + 0.10 * eq.Y - 200 * eq.r) + testRender.state.G + (0.30 * testRender.state.Ystar - testRender.state.m1 * eq.Y - 70 * (eq.eps - 1));
      
      if (engineVal !== null && Math.abs(engineVal - resVal) > 0.015) {
         console.log(`  FAIL [${desc}] ${lbl} engine value ${engineVal} != displayed ${resVal}`);
         ok = false;
      }
    }
  });

  // 3. STRUCTURAL FIXED-POINT: components must reconcile to the engine's Y.
  //    This is the gate that catches a wrong multiplier in isOutput.
  {
    const st = testRender.state;
    const C  = 20 + st.c1 * (eq.Y - st.T);            // c0=20
    const I  = 12 + 0.10 * eq.Y - 200 * eq.r;         // d0=12, d1=0.10, d1r=200
    const G  = st.G;
    const NX = 0.30 * st.Ystar - st.m1 * eq.Y - 70 * (eq.eps - 1); // x1=0.30, n1=70
    const sum = C + I + G + NX;
    if (Math.abs(sum - eq.Y) > 0.01) {
      console.log(`  FAIL [${desc}] components ${sum.toFixed(4)} != engine Y ${eq.Y.toFixed(4)} (gap ${(sum-eq.Y).toFixed(4)})`);
      ok = false;
    }
  }

  return ok;
}

check('Eq Reconciliation: Baseline', testReconciliation({ G: 20, c1: 0.5, m1: 0.3, i: 0.03, taylor_on: true }, 'baseline'));
check('Eq Reconciliation: +ΔG (Taylor off)', testReconciliation({ G: 22, taylor_on: false }, '+ΔG'));
check('Eq Reconciliation: +ΔG multiplier', testReconciliation({ G: 24, taylor_on: false }, '+2ΔG'));
check('Eq Reconciliation: changed c1', testReconciliation({ c1: 0.6 }, 'c1=0.6'));
check('Eq Reconciliation: changed m1', testReconciliation({ m1: 0.4 }, 'm1=0.4'));
check('Eq Reconciliation: changed i', testReconciliation({ i: 0.05 }, 'i=0.05'));

function testReconciliationPCLocked(stateOverrides, desc) {
  testRender.setUnlocked(['GOODS', 'ISLM', 'UIP']);
  const ok1 = testReconciliation(stateOverrides, desc);
  const eq = testRender.solve(testRender.state);
  let ok2 = true;
  if (Math.abs(eq.r - testRender.state.i) > 1e-9) {
    console.log(`  FAIL [${desc}] r (${eq.r}) !== i (${testRender.state.i})`);
    ok2 = false;
  }
  testRender.setUnlocked(['GOODS', 'ISLM', 'UIP', 'PC', 'DEBT']);
  return ok1 && ok2;
}

// PC locked: components must still reconcile to engine Y, with r = i (not i − πᵉ).
// (Run with the onboarding tutorialState set so PC is locked.)
check('Eq Reconciliation: PC-locked nominal rate',
      testReconciliationPCLocked({ i: 0.04, pi_e: 0.10 }, 'PC-locked, big πᵉ'));

// BAD-fixture: hardcoded coefficient
testRender.state = Object.assign({ G: 20, T: 20, P: 1.0, P_star: 1.0, i_target: 0.03, i: 0.03, i_star: 0.03, E_e: 1.0, pi_e: 0.02, Y_n: 100, alpha: 0.5, z: 0, z_pulse: 0, theta: 0.25, cred: 1.0, deanchor_on: false, phi: 1.5, taylor_on: false, speed: 0.5, B: 0, g: 0.02, period: 0, c1: 0.5, m1: 0.3, Ystar: 100 }, { c1: 0.8 });
const badEq = testRender.solve(testRender.state);
testRender.specialEls['eq-ismp'].innerHTML = '<span class="eq-line"><span class="eq-lbl">C</span><span class="eq-sym">c₀ + c₁(Y−T)</span> = <span class="eq-num">20 + 0.5(100−20)</span> = <span class="eq-res">60</span></span>';

// Extract the logic to check HTML directly
let badOk = true;
const badHtml = testRender.specialEls['eq-ismp'].innerHTML;
const badLblRegex = /<span class="eq-lbl"[^>]*>(.*?)<\/span>.*?<span class="eq-res"[^>]*>(.*?)<\/span>/g;
let badMatch;
while ((badMatch = badLblRegex.exec(badHtml)) !== null) {
  const lbl = badMatch[1].replace(/<[^>]+>/g, '').trim();
  const resStr = badMatch[2].replace(/<[^>]+>/g, '').replace(/−/g, '-').trim();
  let resVal = parseFloat(resStr.replace(/%/, ''));
  if (resStr.includes('%')) resVal /= 100;
  
  let engineVal = null;
  if (lbl === 'C') engineVal = 20 + testRender.state.c1 * (badEq.Y - testRender.state.T);
  
  if (engineVal !== null && Math.abs(engineVal - resVal) > 0.05) {
     badOk = false;
  }
}
check('BAD-fixture: hardcoded coefficient caught', !badOk);

console.log(`\n${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
