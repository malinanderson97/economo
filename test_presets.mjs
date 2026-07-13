import fs from 'fs';
const code = fs.readFileSync('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'utf8');

const engineCode = code.replace(/document\.addEventListener[\s\S]*/, '') 
  + `
  return { SCENARIOS, initialState, solve, step, computeYn };
`;

const engineFactory = new Function('window', 'document', engineCode);
const engine = engineFactory({}, { getElementById: () => ({}) });

const { SCENARIOS, initialState, solve, step, computeYn } = engine;

let allPass = true;

// 1. Check that no preset sets a state key that the engine doesn't use.
// We'll gather keys accessed during solve and step.
// Actually, javascript doesn't trivially trace key access without a Proxy.
// Let's use a Proxy!

SCENARIOS.forEach(preset => {
  let accessedKeys = new Set();
  
  const handler = {
    get(target, prop) {
      if (typeof prop === 'string') {
        accessedKeys.add(prop);
      }
      return Reflect.get(target, prop);
    }
  };

  let proxyState = new Proxy(JSON.parse(JSON.stringify(preset.state)), handler);
  
  // mock tutorialState since effectivePiE uses it
  global.tutorialState = { unlocked: new Set(['ISLM', 'UIP', 'PC']) };
  global.ZLB = 0;
  global.ZLB_EPS = 1e-4;
  global.PI_TARGET = 0.02;
  global.PSI = 0.25;
  global.RHO_TAYLOR = 0.5;
  global.L_LABOR = 200;
  global.ALPHA_WS = 0.3;
  
  // Call solve and step
  let res = solve(proxyState);
  let next = step(proxyState);
  
  // Some fields might only be used under certain conditions.
  // We can just statically check against a known whitelist of valid engine state fields.
  const validFields = [
    'G', 'T', 'P', 'P_star', 'i_target', 'i', 'i_star', 'E_e', 'pi_e', 
    'm_struct', 'z_struct', 'alpha', 'z', 'z_pulse', 'theta', 'cred', 
    'deanchor_on', 'phi', 'taylor_on', 'speed', 'period', 'history', 'c1', 'm1', 'Ystar'
  ];
  
  for (let key of Object.keys(preset.state)) {
    if (!validFields.includes(key)) {
      console.log(\`Preset \${preset.id} uses invalid or unused key: \${key}\`);
      allPass = false;
    }
  }
  
  if (!('m_struct' in preset.state) || !('z_struct' in preset.state)) {
    console.log(\`Preset \${preset.id} missing m_struct or z_struct\`);
    allPass = false;
  }
});

if (allPass) console.log('All preset assertions pass.');
