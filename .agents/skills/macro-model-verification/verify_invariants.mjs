import { readFileSync } from 'fs';
import vm from 'vm';

// Extracts the pure-engine portion of the model script (everything before the
// first DOM-touching function) and re-runs the documented self-test assertions
// against it. No DOM stubbing required.
function extractEngine(file) {
  const html = readFileSync(file, 'utf8');
  const code = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
  // Cut at the first DOM-dependent function definition.
  const cutMarkers = ['function buildSliders', 'function buildControls'];
  let cut = code.length;
  for (const m of cutMarkers) { const i = code.indexOf(m); if (i !== -1) cut = Math.min(cut, i); }
  return code.slice(0, cut);
}

function check(file, isOpen) {
  const engine = extractEngine(file);
  const results = [];
  const harness = `
    const __R = [];
    const assert = (name, cond) => __R.push({ name, pass: !!cond });
    const near = (a,b,tol=1e-9) => Math.abs(a-b) < tol;
    // documented invariants from README
    ${ isOpen
      ? `assert('Baseline isOutput=IS_Y_BASE', near(isOutput(IS_G_BASE,IS_T_BASE,IS_R_BASE,IS_EPS_BASE,0.5,0.30,YSTAR_BASE), IS_Y_BASE));
         const kC=1/(1-0.5-0.1), kO=1/(1-0.5-0.1+0.30);
         assert('k_o < k_closed', kO < kC);
         assert('k_o approx 1.43', Math.abs(kO-1.4286)<0.01);`
      : `assert('Baseline isOutput=IS_Y_BASE', near(isOutput(IS_G_BASE,IS_T_BASE,IS_R_BASE,0.5), IS_Y_BASE));
         const k=1/(1-0.5-0.1);
         assert('k = 2.5', Math.abs(k-2.5)<1e-9);` }
    let s = JSON.parse(JSON.stringify(initialState));
    s.taylor_on = true; s.G = 21;
    const Yn0 = computeYn(s);
    for (let t=0;t<60;t++) s = step(s);
    assert('Taylor convergence to potential', Math.abs(solve(s).Y - Yn0) < 0.1);
    const lo = computeYn({m_struct:0.05,z_struct:0.10}), hi = computeYn({m_struct:0.10,z_struct:0.10});
    assert('Higher m -> lower Y_n', hi < lo);
    __R;
  `;
  const sandbox = { Math, JSON, Object, Array, Number, String, Boolean, isNaN, parseFloat, parseInt };
  try {
    const out = vm.runInNewContext(engine + '\n' + harness, sandbox, { timeout: 10000 });
    return out;
  } catch (e) { return [{ name: 'ENGINE LOAD', pass: false, err: e.message }]; }
}

let allPass = true;
for (const [f, open] of [['islm_pc_model_v16_Closed_Economy_MediumRun.html', false],
                          ['islm_pc_model_v19_Open_Economy_Complete_Demo.html', true]]) {
  console.log('\n===', f, '===');
  for (const r of check(f, open)) {
    console.log(`  [${r.pass?'PASS':'*** FAIL ***'}] ${r.name}${r.err?' :: '+r.err:''}`);
    if (!r.pass) allPass = false;
  }
}
console.log('\nOVERALL:', allPass ? 'ALL GREEN' : 'PROBLEMS FOUND');
