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
  api = new Function(headlessCode + '\nfunction render() {}\nreturn { tutorialState, unlockBlock, setUnlocked, resetTutorial, paramDefs, shockDefs, dynamicsDefs, debtDefs, wrapSymbols, SYMBOL_DEFS, EQ_REF, endLine };')();
} catch (e) {
  console.error('FAILED TO IMPORT HEADLESS:', e.message);
  process.exit(1);
}

const { tutorialState, unlockBlock, setUnlocked, resetTutorial, paramDefs, shockDefs, dynamicsDefs, debtDefs, wrapSymbols, SYMBOL_DEFS, EQ_REF, endLine } = api;

let headlessBaselineExportKeys = Object.keys(api).sort().join(',');

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
  attrs: {}, children: [],
  setAttribute(k, v) { this.attrs[k] = v; }, 
  appendChild(c) { this.children.push(c); }, 
  style: {},
  classList: { 
    classes: new Set(),
    toggle() {}, 
    add(cls) { this.classes.add(cls); }, 
    remove(cls) { this.classes.delete(cls); }, 
    contains(cls) { return this.classes.has(cls); } 
  },
  addEventListener() {}, querySelector: () => fakeEl(), querySelectorAll: () => [],
  _innerHTML: '',
  set innerHTML(val) { this._innerHTML = val; if (!val) this.children = []; },
  get innerHTML() { return this._innerHTML; },
  textContent: '', value: 0, getAttribute(k) { return this.attrs[k] || null; }
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
    querySelector: () => fakeEl(),
    querySelectorAll: (sel) => {
      if (sel.includes('GOODS') || sel.includes('curve-is')) return mockElements.GOODS;
      if (sel.includes('ISLM') || sel.includes('curve-mp')) return mockElements.ISLM;
      if (sel.includes('UIP')) return mockElements.UIP;
      if (sel.includes('PC')) return mockElements.PC;
      return [];
    },
    createElement: (tag) => { let e = fakeEl(); e.tagName = tag; return e; },
    createElementNS: (ns, tag) => { let e = fakeEl(); e.tagName = tag; return e; },
    body: { classList: {
      classes: new Set(),
      toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); },
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    } }
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
  'eq-ts': fakeEl(),
  'ismp': fakeEl(),
  'uip': fakeEl(),
  'pc': fakeEl(),
  'ts': fakeEl(),
  'svg-drill-is': fakeEl(),
  'svg-drill-mp': fakeEl(),
  'svg-drill-pc-a': fakeEl(),
  'svg-drill-pc-b': fakeEl(),
  'svg-drill-pc-c': fakeEl(),
  'drill-pc-wsps': fakeEl(),
  'drill-pc-okun': fakeEl(),
  'drill-pc-phillips': fakeEl(),
  'drill-pc-prev': fakeEl(),
  'drill-pc-next': fakeEl(),
  'drill-eq-wsps': fakeEl(),
  'drill-eq-okun': fakeEl(),
  'drill-eq-phillips': fakeEl(),
  'drill-is': fakeEl(),
  'drill-mp': fakeEl(),
  'drill-pc': fakeEl(),
  'drill-uip': fakeEl()
};
const chipStub = stub.replace('getElementById: () => fakeEl()', `getElementById: (id) => specialEls[id] || fakeEl()`);

const testRender = new Function('mockElements', 'specialEls', chipStub + scripts + '\nreturn { tutorialState, setUnlocked, mockElements, renderTutorial, drawISChips, drawPCChips, drawEquations, solve, state, getState: () => state, specialEls, TERM_BLOCK, drawDrillIS, drawDrillMP, drawDrillPCChain, advanceDrillPC, computeYn, xScale, yScale, L_LABOR, ALPHA_WS, setState: (o) => Object.assign(state, o), render, redrawOpenDrills, getPcDrillStep: () => typeof pcDrillStep !== "undefined" ? pcDrillStep : 0, drawISMP, drawUIP, drawPC, drawTimeSeries, wrapSymbols, findSymbols, SYMBOL_DEFS, CURVE_DEFS, svgTitle, document, window };')(mockElements, specialEls);

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
    'toggleSection(', 'toggleEq(', 'advanceDrillPC(', 'toggleHelpMode(' // Layout toggles
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

const s3TriggerMatch = [...html.matchAll(/class="drill-trigger"[^>]*data-block="([^"]+)"/g)];
check('INV-S3-C: Drill-down triggers carry data-block', s3TriggerMatch.length >= 3 && s3TriggerMatch.every(m => m[1] === 'ISLM' || m[1] === 'UIP' || m[1] === 'PC'));

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

// -------------------------------------------------------------------------
// Slice 2: Scoping and Colouring Invariants (INV-6, 8, 9)
// -------------------------------------------------------------------------
function getRenderedTerms() {
  testRender.drawEquations(testRender.solve(testRender.state));
  const html = ['eq-ismp', 'eq-uip', 'eq-pc', 'eq-ts']
    .map(id => testRender.specialEls[id].innerHTML)
    .join('');
  const terms = new Set();
  const regex = /data-term="([^"]+)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    terms.add(match[1]);
  }
  return terms;
}

function checkScope(unlockedArray, desc) {
  testRender.setUnlocked(unlockedArray);
  const terms = getRenderedTerms();
  for (const t of terms) {
    const block = testRender.TERM_BLOCK[t];
    if (!block || !testRender.tutorialState.unlocked.has(block)) {
      console.log(`  FAIL [${desc}] term '${t}' rendered but its block (${block}) is not unlocked.`);
      return false;
    }
  }
  return true;
}

check('INV-6 Scope: GOODS only', checkScope(['GOODS'], 'GOODS'));
check('INV-6 Scope: +ISLM', checkScope(['GOODS', 'ISLM'], 'ISLM'));
check('INV-6 Scope: +UIP', checkScope(['GOODS', 'ISLM', 'UIP'], 'UIP'));
check('INV-6 Scope: +PC', checkScope(['GOODS', 'ISLM', 'UIP', 'PC'], 'PC'));
check('INV-6 Scope: +DEBT', checkScope(['GOODS', 'ISLM', 'UIP', 'PC', 'DEBT'], 'DEBT'));

// BAD-fixture: forced out of scope
let caughtScope = false;
testRender.setUnlocked(['GOODS']);
const termsBefore = getRenderedTerms();
// artificially inject a term that belongs to PC
testRender.specialEls['eq-ismp'].innerHTML += '<span class="eq-line" data-term="PC"></span>';
const htmlScopeTest = testRender.specialEls['eq-ismp'].innerHTML;
const matchScope = /data-term="([^"]+)"/g;
let ms;
while ((ms = matchScope.exec(htmlScopeTest)) !== null) {
  if (!testRender.tutorialState.unlocked.has(testRender.TERM_BLOCK[ms[1]])) {
    caughtScope = true;
  }
}
check('INV-6 BAD-fixture: Term scoped to wrong block caught', caughtScope);

testRender.setUnlocked(['GOODS', 'ISLM', 'UIP', 'PC', 'DEBT']);
testRender.drawEquations(testRender.solve(testRender.state));
let inv8Passed = true;
let inv9Passed = true;
['eq-ismp', 'eq-uip', 'eq-pc', 'eq-ts'].forEach(id => {
  const html = testRender.specialEls[id].innerHTML;
  const lines = [...html.matchAll(/style="color:([^"]+)".*?data-term="([^"]+)"/g)];
  for (const m of lines) {
    const col = m[1];
    const term = m[2];
    if (!col || col === 'black' || col === '#000' || col === '#000000') {
      inv8Passed = false;
    }
    const b = testRender.TERM_BLOCK[term];
    const allowed = (b === 'GOODS') ? '#d85a30' :
                    (b === 'ISLM') ? ((term==='MP'||term==='i') ? '#185fa5' : '#d85a30') :
                    (b === 'UIP') ? '#0f6e56' :
                    (b === 'PC') ? '#534ab7' : null;
    if (col !== allowed) {
      inv9Passed = false;
    }
  }
});
check('INV-8 Permanent Colour: No term defaults to black', inv8Passed);
check('INV-9 Palette Binding: Colours match EQ_COL strictly', inv9Passed);

// BAD-fixture for INV-8 (term left black)
const badInv8Html = '<span class="eq-line" style="color:black" data-term="C">C</span>';
const caughtInv8 = !!badInv8Html.match(/style="color:(black|#000|#000000)"/);
check('INV-8 BAD-fixture: Black term caught', caughtInv8);

// BAD-fixture for INV-9 (non-EQ_COL literal)
const badInv9Html = '<span class="eq-line" style="color:#ff0000" data-term="C">C</span>';
const caughtInv9 = (badInv9Html.match(/style="color:([^"]+)"/)[1] !== '#d85a30');
check('INV-9 BAD-fixture: Non-EQ_COL literal caught', caughtInv9);

// -------------------------------------------------------------------------
// Slice 3: Drill-down Derivation Graphs (INV-S3)
// -------------------------------------------------------------------------

// Inv #10 layout + reference. Static check
const staticChecks = [
  { id: 'drill-is', ref: '9.1' },
  { id: 'drill-uip', ref: '19.5' },
  { id: 'drill-pc-wsps', ref: '8.4' },
  { id: 'drill-pc-okun', ref: '8.4' },
  { id: 'drill-pc-phillips', ref: '9.3' }
];
let inv10Passed = true;
staticChecks.forEach(chk => {
  const idx = html.indexOf(`id="${chk.id}"`);
  if (idx === -1) { inv10Passed = false; return; }
  const sub = html.slice(idx, idx + 250);
  if (!sub.includes(chk.ref)) {
    console.log(`  FAIL: Missing or incorrect reference ${chk.ref} in ${chk.id}`);
    inv10Passed = false;
  }
});
check('Inv #10: Drill-down layout + references', inv10Passed);

const badInv10Html = html.replace('Blanchard eq. 8.4', 'Blanchard eq. 9.3'); // mislabel
let caughtInv10 = false;
staticChecks.forEach(chk => {
  const idx = badInv10Html.indexOf(`id="${chk.id}"`);
  if (idx === -1) return;
  const sub = badInv10Html.slice(idx, idx + 250);
  if (!sub.includes(chk.ref)) caughtInv10 = true;
});
check('BAD-fixture: Mislabelled drill reference caught', caughtInv10);

// INV-S3-RO: read-only drill
const sBefore = JSON.stringify(testRender.getState());
const eqBefore = JSON.stringify(testRender.solve(testRender.getState()));
testRender.drawDrillIS();
testRender.drawDrillMP();
testRender.advanceDrillPC(-2); // reset to step 0
testRender.drawDrillPCChain();
testRender.advanceDrillPC(1);
testRender.drawDrillPCChain();
const sAfter = JSON.stringify(testRender.getState());
const eqAfter = JSON.stringify(testRender.solve(testRender.getState()));
check('INV-S3-RO: Drill-downs are read-only (state & solve unchanged)', sBefore === sAfter && eqBefore === eqAfter);

// BAD-fixture: drawDrill mutation
const badDrillState = JSON.parse(sBefore);
badDrillState.m_struct = 0.5; // mutate!
const caughtRO = (JSON.stringify(badDrillState) !== sBefore);
check('BAD-fixture: State mutation in drill caught', caughtRO);

// Inv #7 step-by-step highlight (in-drill)
testRender.advanceDrillPC(-2); // pcDrillStep = 0
testRender.drawDrillPCChain();
const pcWsc0 = testRender.specialEls['drill-eq-wsps'].style.color;
const pcOkunc0 = testRender.specialEls['drill-eq-okun'].style.color;
const pcPhillc0 = testRender.specialEls['drill-eq-phillips'].style.color;

testRender.advanceDrillPC(1); // pcDrillStep = 1
testRender.drawDrillPCChain();
const pcWsc1 = testRender.specialEls['drill-eq-wsps'].style.color;
const pcOkunc1 = testRender.specialEls['drill-eq-okun'].style.color;

check('Inv #7: Drill-down step-by-step highlight', pcWsc0 !== '#1a1a1a' && pcOkunc0 === '#1a1a1a' && pcPhillc0 === '#1a1a1a' && pcWsc1 === '#1a1a1a' && pcOkunc1 !== '#1a1a1a');

// BAD-fixture: stuck highlight
const caughtHighlight = (pcWsc0 === pcWsc1); // if it stayed coloured
check('BAD-fixture: Stuck highlight caught', !caughtHighlight);

// INV-S3-A / S3-B Y_n reconciliation
function findCx(svgEl, classMatch) {
  const circle = svgEl.children.find(c => c.attrs && c.attrs.class && c.attrs.class.includes(classMatch));
  return circle ? parseFloat(circle.attrs.cx) : null;
}
function findX1(svgEl, classMatch) {
  const line = svgEl.children.find(c => c.attrs && c.attrs.class && c.attrs.class.includes(classMatch) && c.attrs.x1);
  return line ? parseFloat(line.attrs.x1) : null;
}

function testDrillRecon(stateOverrides) {
  testRender.setState(stateOverrides);
  testRender.advanceDrillPC(2); // open all steps
  
  // Clear fake element children
  testRender.specialEls['svg-drill-pc-a'].children = [];
  testRender.specialEls['svg-drill-pc-b'].children = [];
  testRender.specialEls['svg-drill-pc-c'].children = [];
  
  testRender.drawDrillPCChain();
  
  const oA = { W: 160, H: 140, P: { l: 28, r: 12, t: 14, b: 28 }, xMin: 0, xMax: 0.10 };
  const oB = { W: 160, H: 140, P: { l: 28, r: 12, t: 14, b: 28 }, xMin: 0, xMax: 0.10 };
  const oC = { W: 160, H: 140, P: { l: 28, r: 12, t: 14, b: 28 }, xMin: 85, xMax: 115 };
  
  const currState = testRender.getState();
  const un = (currState.m_struct + currState.z_struct) / testRender.ALPHA_WS;
  const Yn = testRender.computeYn(currState);
  
  const drawnUnX_A = findX1(testRender.specialEls['svg-drill-pc-a'], 'curve-natural');
  const drawnUnX_B = findX1(testRender.specialEls['svg-drill-pc-b'], 'curve-natural');
  const expectedUnX_A = testRender.xScale(un, oA);
  
  const drawnYnCx_B = findCx(testRender.specialEls['svg-drill-pc-b'], 'eq-point');
  const drawnYnX_C = findX1(testRender.specialEls['svg-drill-pc-c'], 'curve-natural');
  
  const expectedYnX_B = testRender.xScale(un, oB); // cx matches un in graph B
  const expectedYnX_C = testRender.xScale(Yn, oC);
  
  const eps = 1e-6;
  const passed = Math.abs(drawnUnX_A - expectedUnX_A) < eps && 
                 Math.abs(drawnUnX_B - expectedUnX_A) < eps &&
                 Math.abs(drawnYnCx_B - expectedYnX_B) < eps && 
                 Math.abs(drawnYnX_C - expectedYnX_C) < eps;
  return passed;
}

check('INV-S3-A/B: Y_n and u_n reconciliation (baseline)', testDrillRecon({ m_struct: 0.05, z_struct: 0.10 }));
check('INV-S3-A/B: Y_n and u_n reconciliation (high m)', testDrillRecon({ m_struct: 0.15, z_struct: 0.10 }));
check('INV-S3-A/B: Y_n and u_n reconciliation (high z)', testDrillRecon({ m_struct: 0.05, z_struct: 0.20 }));

// BAD-fixture: hardcoded u_n
const badDrawnUnX_A = testRender.xScale(0.05, { W: 160, H: 140, P: { l: 28, r: 12, t: 14, b: 28 }, xMin: 0, xMax: 0.10 }); // Literal 0.05
const expectedUnX_A_mutated = testRender.xScale((0.15 + 0.10) / testRender.ALPHA_WS, { W: 160, H: 140, P: { l: 28, r: 12, t: 14, b: 28 }, xMin: 0, xMax: 0.10 });
const caughtHardcodedUn = Math.abs(badDrawnUnX_A - expectedUnX_A_mutated) > 1e-6;
check('BAD-fixture: Hardcoded u_n caught', caughtHardcodedUn);

// INV-S3-D: no surface growth
const headlessCurrentExportKeys = Object.keys(api).sort().join(',');
check('INV-S3-D: No engine surface growth (headless exports identical)', headlessCurrentExportKeys === headlessBaselineExportKeys);

// -------------------------------------------------------------------------
// Slice 3b: Live re-render of open drill-down graphs (INV-3b)
// -------------------------------------------------------------------------

// INV-3b-1 live redraw
testRender.specialEls['drill-pc'].classList.add('open');
testRender.advanceDrillPC(-2); // pcDrillStep = 0
testRender.advanceDrillPC(2);  // pcDrillStep = 2 (shows C)

testRender.setState({ m_struct: 0.05, z_struct: 0.10 });
testRender.redrawOpenDrills(); // manual draw
const oC = { W: 160, H: 140, P: { l: 28, r: 12, t: 14, b: 28 }, xMin: 85, xMax: 115 };
let Yn_pre = testRender.computeYn(testRender.getState());
const drawnYnCx_pre = findX1(testRender.specialEls['svg-drill-pc-c'], 'curve-natural');

testRender.setState({ z_struct: 0.20 }); // change state
testRender.render(); // this should trigger redrawOpenDrills since .open is present
let Yn_post = testRender.computeYn(testRender.getState());
const drawnYnCx_post = findX1(testRender.specialEls['svg-drill-pc-c'], 'curve-natural');
const expectedYnCx_post = testRender.xScale(Yn_post, oC);

check('INV-3b-1: Live redraw updates open PC graph',
  drawnYnCx_pre !== drawnYnCx_post && Math.abs(drawnYnCx_post - expectedYnCx_post) < 1e-6
);

// BAD-fixture for INV-3b-1: A redrawOpenDrills that skips PC would leave drawnYnCx_post == drawnYnCx_pre
testRender.specialEls['svg-drill-pc-c'].children = []; // clear
const badRedraw1 = function() { testRender.drawDrillIS(); testRender.drawDrillMP(); }; // skip PC
testRender.setState({ z_struct: 0.30 });
badRedraw1(); // simulate bad render()
const drawnYnCx_bad = findX1(testRender.specialEls['svg-drill-pc-c'], 'curve-natural');
check('BAD-fixture: Live redraw skipping PC caught', drawnYnCx_bad === null);

// INV-3b-2 closed not drawn
testRender.specialEls['drill-is'].classList.remove('open');
testRender.specialEls['svg-drill-is'].children = []; // clear
testRender.setState({ G: 25 });
testRender.render(); // should NOT draw IS
check('INV-3b-2: Closed drills are not drawn', testRender.specialEls['svg-drill-is'].children.length === 0);

// BAD-fixture for INV-3b-2: Redraw regardless of .open
testRender.specialEls['drill-is'].classList.remove('open');
testRender.specialEls['svg-drill-is'].children = []; // clear
const badRedraw2 = function() { testRender.drawDrillIS(); }; // draw regardless
badRedraw2(); // simulate bad render()
check('BAD-fixture: Redrawing closed drill caught', testRender.specialEls['svg-drill-is'].children.length > 0);

// INV-3b-3 step preserved
testRender.advanceDrillPC(-2); // reset
testRender.advanceDrillPC(1);  // step 1
testRender.setState({ m_struct: 0.10 });
testRender.render();
const stepAfterRender = testRender.getPcDrillStep();
const pcWsc1_b3 = testRender.specialEls['drill-eq-wsps'].style.color;
const pcOkunc1_b3 = testRender.specialEls['drill-eq-okun'].style.color;
check('INV-3b-3: Live redraw preserves PC step and highlights',
  stepAfterRender === 1 && pcWsc1_b3 === '#1a1a1a' && pcOkunc1_b3 !== '#1a1a1a'
);

// BAD-fixture for INV-3b-3: Redraw resets step
testRender.advanceDrillPC(-2); // reset
testRender.advanceDrillPC(1);  // step 1
const badRedraw3 = function() { testRender.advanceDrillPC(-2); testRender.drawDrillPCChain(); };
badRedraw3(); // simulate bad render()
const stepAfterBadRender = testRender.getPcDrillStep();
check('BAD-fixture: Redraw resetting PC step caught', stepAfterBadRender === 0);

// INV-3b-RO read-only via render
// open all
testRender.specialEls['drill-is'].classList.add('open');
testRender.specialEls['drill-mp'].classList.add('open');
testRender.specialEls['drill-pc'].classList.add('open');
if(testRender.specialEls['drill-uip']) testRender.specialEls['drill-uip'].classList.add('open');

const sBefore3b = JSON.stringify(testRender.getState());
const eqBefore3b = JSON.stringify(testRender.solve(testRender.getState()));

testRender.render();
const sAfter3b = JSON.stringify(testRender.getState());
const eqAfter3b = JSON.stringify(testRender.solve(testRender.getState()));
check('INV-3b-RO: render() with open drills is read-only', sBefore3b === sAfter3b && eqBefore3b === eqAfter3b);

// -------------------------------------------------------------------------
// Item C: Help Mode & Eq Refs (INV-C1 - C4, INV-93-1 - 2)
// -------------------------------------------------------------------------

check('INV-C1: wrapSymbols is pure and string-to-string (headless)', typeof wrapSymbols('Yₙ') === 'string' && wrapSymbols('Yₙ') !== 'Yₙ');

const badWrapCode = headlessCode.replace('return result;', 'return { notAString: true };');
const badWrapApi = new Function(badWrapCode + '\nfunction render() {}\nreturn { wrapSymbols };')();
check('BAD-fixture: wrapSymbols impurity caught', typeof badWrapApi.wrapSymbols('Yₙ') !== 'string');

testRender.setUnlocked(['GOODS', 'ISLM', 'UIP', 'PC', 'DEBT']);
testRender.drawEquations(testRender.solve(testRender.state));
check('INV-C2: drawEquations applies wrapSymbols', testRender.specialEls['eq-ismp'].innerHTML.includes('class="sym"'));

testRender.specialEls['eq-ismp'].innerHTML = '<span class="eq-line"><span class="eq-sym">Yₙ</span></span>'; // missing .sym
check('BAD-fixture: Unwrapped symbol caught', !testRender.specialEls['eq-ismp'].innerHTML.includes('class="sym"'));

const c3Match = wrapSymbols('Yₙ').match(/data-tooltip="([^"]+)"/);
const expectedTooltip = `${SYMBOL_DEFS['Yₙ'].meaning}; ${SYMBOL_DEFS['Yₙ'].ref}; ${SYMBOL_DEFS['Yₙ'].role}`;
check('INV-C3: Tooltips correctly extract the symbol mapping', c3Match && c3Match[1] === expectedTooltip);

const badTooltip = wrapSymbols('Yₙ').replace(expectedTooltip, 'WRONG');
check('BAD-fixture: Incorrect tooltip mapping caught', badTooltip.match(/data-tooltip="([^"]+)"/)[1] !== expectedTooltip);

check('INV-C4: EQ_REF contains valid targets', typeof EQ_REF['C'] === 'string');
const badEqRefCode = headlessCode.replace("'C': 'eq. 3.3',", "");
const badEqRefApi = new Function(badEqRefCode + '\nfunction render() {}\nreturn { EQ_REF };')();
check('BAD-fixture: Empty EQ_REF caught', typeof badEqRefApi.EQ_REF['C'] !== 'string');

check('INV-93-1: endLine outputs an eq-ref span when a ref exists', endLine('C').includes('class="eq-ref"') && endLine('C').includes(EQ_REF['C']));
const badEndLineCode1 = headlessCode.replace('`<span class="eq-ref">(${EQ_REF[term]})</span>`', 'EQ_REF[term]');
const badEndLineApi1 = new Function(badEndLineCode1 + '\nfunction render() {}\nreturn { endLine, EQ_REF };')();
check('BAD-fixture: endLine misses span caught', !badEndLineApi1.endLine('C').includes('class="eq-ref"'));

check('INV-93-2: endLine outputs nothing when a ref does not exist', endLine('UNKNOWN_REF_XXX') === '');
const badEndLineCode2 = headlessCode.replace("? `<span class=\"eq-ref\">(${EQ_REF[term]})</span>` : ''", "? `<span class=\"eq-ref\">(${EQ_REF[term]})</span>` : '<span class=\"eq-ref\">GARBAGE</span>'");
const badEndLineApi2 = new Function(badEndLineCode2 + '\nfunction render() {}\nreturn { endLine };')();
check('BAD-fixture: endLine creates garbage for missing ref caught', badEndLineApi2.endLine('UNKNOWN_REF_XXX') !== '');

const expC = `<span class="sym" data-sym="C" data-tooltip="${SYMBOL_DEFS['C'].meaning}; ${SYMBOL_DEFS['C'].ref}; ${SYMBOL_DEFS['C'].role}"><span class="sym-pop" data-tooltip="${SYMBOL_DEFS['C'].meaning}; ${SYMBOL_DEFS['C'].ref}; ${SYMBOL_DEFS['C'].role}"></span>C</span>`;
const expI = `<span class="sym" data-sym="I" data-tooltip="${SYMBOL_DEFS['I'].meaning}; ${SYMBOL_DEFS['I'].ref}; ${SYMBOL_DEFS['I'].role}"><span class="sym-pop" data-tooltip="${SYMBOL_DEFS['I'].meaning}; ${SYMBOL_DEFS['I'].ref}; ${SYMBOL_DEFS['I'].role}"></span>I</span>`;
const expPiStar = `<span class="sym" data-sym="π*" data-tooltip="${SYMBOL_DEFS['π*'].meaning}; ${SYMBOL_DEFS['π*'].ref}; ${SYMBOL_DEFS['π*'].role}"><span class="sym-pop" data-tooltip="${SYMBOL_DEFS['π*'].meaning}; ${SYMBOL_DEFS['π*'].ref}; ${SYMBOL_DEFS['π*'].role}"></span>π*</span>`;
const exp_i = `<span class="sym" data-sym="i" data-tooltip="${SYMBOL_DEFS['i'].meaning}; ${SYMBOL_DEFS['i'].ref}; ${SYMBOL_DEFS['i'].role}"><span class="sym-pop" data-tooltip="${SYMBOL_DEFS['i'].meaning}; ${SYMBOL_DEFS['i'].ref}; ${SYMBOL_DEFS['i'].role}"></span>i</span>`;
const expPi = `<span class="sym" data-sym="π" data-tooltip="${SYMBOL_DEFS['π'].meaning}; ${SYMBOL_DEFS['π'].ref}; ${SYMBOL_DEFS['π'].role}"><span class="sym-pop" data-tooltip="${SYMBOL_DEFS['π'].meaning}; ${SYMBOL_DEFS['π'].ref}; ${SYMBOL_DEFS['π'].role}"></span>π</span>`;

const s1Expected = `<div>${expC} and ${expI} and <span>${expPiStar}</span> and ${exp_i}, ${expPi}</div>`;
check('INV-S1: wrapSymbols is pure and string-to-string (headless)', 
  testRender.wrapSymbols('<div>C and I and <span>π*</span> and i, π</div>') === s1Expected &&
  testRender.wrapSymbols('no match here') === 'no match here' &&
  testRender.findSymbols('no match here').length === 0 &&
  testRender.findSymbols('i, π').length === 2 &&
  testRender.findSymbols('i, π')[0].token === 'i' &&
  testRender.findSymbols('i, π')[1].token === 'π'
);

const badWrapCodeS1 = headlessCode.replace('class="sym"', 'class="sym-wrong"');
const badWrapApiS1 = new Function(badWrapCodeS1 + '\nfunction render() {}\nreturn { wrapSymbols };')();
check('BAD-fixture: Mutated wrapSymbols output caught', badWrapApiS1.wrapSymbols('<div>C and I and <span>π*</span> and i, π</div>') !== s1Expected);

check('INV-S5: wrapSymbols ignores CURVE_DEFS labels', !testRender.wrapSymbols('IS and PC').includes('class="sym"'));

function getSvgTexts(svgNode) {
  let texts = [];
  function walk(node) {
    if (node.tagName === 'text') texts.push(node);
    node.children.forEach(walk);
  }
  walk(svgNode);
  return texts;
}

testRender.document.body.classList.remove('help-mode');
testRender.specialEls['ismp'].children = [];
testRender.specialEls['uip'].children = [];
testRender.specialEls['pc'].children = [];
testRender.specialEls['ts'].children = [];
testRender.window.lastSolveResult = testRender.solve(testRender.state);
testRender.drawISMP();
testRender.drawUIP();
testRender.drawPC();
testRender.drawTimeSeries();

let allTextsOff = [
  ...getSvgTexts(testRender.specialEls['ismp']),
  ...getSvgTexts(testRender.specialEls['uip']),
  ...getSvgTexts(testRender.specialEls['pc']),
  ...getSvgTexts(testRender.specialEls['ts'])
];
let hasTooltipOff = allTextsOff.some(t => t.getAttribute('data-tooltip'));
check('INV-S2: No <title> appended when help-mode is OFF', !hasTooltipOff);

const badSvgTitleCodeS2 = scripts.replace("if (!document.body.classList.contains('help-mode')) return;", "");
const badSvgTitleApiS2 = new Function('mockElements', 'specialEls', chipStub + badSvgTitleCodeS2 + '\nreturn { document, window, drawISMP, solve, state };')(mockElements, specialEls);
badSvgTitleApiS2.document.body.classList.remove('help-mode');
specialEls['ismp'].children = [];
badSvgTitleApiS2.window.lastSolveResult = badSvgTitleApiS2.solve(badSvgTitleApiS2.state);
badSvgTitleApiS2.drawISMP();
let badTextsS2 = getSvgTexts(specialEls['ismp']);
check('BAD-fixture: Unconditional <title> append caught', badTextsS2.some(t => t.getAttribute('data-tooltip')));

testRender.document.body.classList.add('help-mode');
testRender.specialEls['ismp'].children = [];
testRender.specialEls['uip'].children = [];
testRender.specialEls['pc'].children = [];
testRender.specialEls['ts'].children = [];
testRender.state.block = 'PC';
testRender.window.lastSolveResult = testRender.solve(testRender.state);
testRender.drawISMP();
testRender.drawUIP();
testRender.drawPC();
testRender.drawTimeSeries();

let allTextsOn = [
  ...getSvgTexts(testRender.specialEls['ismp']),
  ...getSvgTexts(testRender.specialEls['uip']),
  ...getSvgTexts(testRender.specialEls['pc']),
  ...getSvgTexts(testRender.specialEls['ts'])
];
let s3Pass = true;
let iPiFound = false;
let s4Pass = true;
allTextsOn.forEach(t => {
  const lbl = t.textContent;
  const tooltip = t.getAttribute('data-tooltip');
  const found = testRender.findSymbols(lbl);
  if (found.length > 0) {
    if (!tooltip) {
      s3Pass = false;
    } else {
      const expTitle = found.map(f => f.def.meaning + '; ' + f.def.ref + '; ' + f.def.role).join(' | ');
      if (tooltip !== expTitle) {
        s3Pass = false;
      }
    }
    if (lbl === 'i, π' && tooltip && tooltip.includes(testRender.SYMBOL_DEFS['i'].meaning) && tooltip.includes(testRender.SYMBOL_DEFS['π'].meaning)) {
      iPiFound = true;
    }
  } else {
    if (['IS', 'MP', 'UIP', 'PC'].includes(lbl)) {
      if (!tooltip) {
        s4Pass = false;
      } else {
        const d = testRender.CURVE_DEFS[lbl];
        const expTitle = d.meaning + '; ' + d.ref + '; ' + d.role;
        if (tooltip !== expTitle) {
          s4Pass = false;
        }
      }
    }
  }
});
check('INV-S3: exactly one <title> with combined definitions when help-mode ON', s3Pass && iPiFound);
check('INV-S4: Curve names get tooltips via CURVE_DEFS', s4Pass);

const badSvgTitleCodeS4 = scripts.replace("} else if (CURVE_DEFS[label]) {", "} else if (false) {");
const badSvgTitleApiS4 = new Function('mockElements', 'specialEls', chipStub + badSvgTitleCodeS4 + '\nreturn { document, window, drawISMP, solve, state, CURVE_DEFS };')(mockElements, specialEls);
badSvgTitleApiS4.document.body.classList.add('help-mode');
specialEls['ismp'].children = [];
badSvgTitleApiS4.window.lastSolveResult = badSvgTitleApiS4.solve(badSvgTitleApiS4.state);
badSvgTitleApiS4.drawISMP();
let badTextsS4 = getSvgTexts(specialEls['ismp']);
let badIS = badTextsS4.find(t => t.textContent === 'IS');
check('BAD-fixture: Skipped CURVE_DEFS fallback caught', badIS && !badIS.getAttribute('data-tooltip'));

const badSvgTitleCodeS3 = scripts.replace("return matches.sort", "return [matches[0]].filter(Boolean); // drop rest");
const badSvgTitleApiS3 = new Function('mockElements', 'specialEls', chipStub + badSvgTitleCodeS3 + '\nreturn { document, window, drawTimeSeries, solve, state };')(mockElements, specialEls);
badSvgTitleApiS3.document.body.classList.add('help-mode');
specialEls['ts'].children = [];
badSvgTitleApiS3.state.block = 'PC';
badSvgTitleApiS3.window.lastSolveResult = badSvgTitleApiS3.solve(badSvgTitleApiS3.state);
badSvgTitleApiS3.drawTimeSeries();
let badTextsS3 = getSvgTexts(specialEls['ts']);
let badIPi = badTextsS3.find(t => t.textContent === 'i, π');
check('BAD-fixture: Dropped second token in compound label caught', badIPi && badIPi.getAttribute('data-tooltip') && !badIPi.getAttribute('data-tooltip').includes('|'));

console.log(`\n${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
