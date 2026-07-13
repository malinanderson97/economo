const fs = require('fs');
const code = fs.readFileSync('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'utf8');

// Extract the JS part
const scriptStart = code.indexOf('<script>');
const scriptEnd = code.lastIndexOf('</script>');
const jsCode = code.substring(scriptStart + 8, scriptEnd);

// Mock DOM
const mockDOM = `
const document = {
  getElementById: () => ({ classList: { toggle: ()=>{} }, value: '', innerHTML: '' }),
  createElement: () => ({ classList: { add: ()=>{} }, appendChild: ()=>{} }),
  body: { classList: { toggle: ()=>{} } },
  querySelector: () => ({}),
  querySelectorAll: () => []
};
const window = { addEventListener: ()=>{} };
`;

// Evaluate engine
const engineCode = mockDOM + jsCode + `
  return { SCENARIOS, step, solve };
`;

const engine = new Function(engineCode)();

function simulate(scenarioId, steps) {
  const scenario = engine.SCENARIOS.find(s => s.id === scenarioId);
  let s = JSON.parse(JSON.stringify(scenario.state));
  console.log('--- Scenario:', scenario.label, '---');
  for (let i = 0; i < steps; i++) {
    const res = engine.solve(s);
    if (i === 0 || i === steps - 1) {
      console.log('t=' + i + ' | Y=' + res.Y.toFixed(2) + ' | pi=' + (res.pi*100).toFixed(2) + '% | pi_e=' + (s.pi_e*100).toFixed(2) + '% | eps=' + res.eps.toFixed(3));
    }
    s = engine.step(s);
  }
}

simulate('taylorPrinciple', 20);
simulate('exchangeRateDisinflation', 20);
simulate('twinDeficits', 50);
simulate('globalRateHike', 30);
