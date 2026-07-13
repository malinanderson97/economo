const fs = require('fs');
const file = 'islm_pc_model_v19_Open_Economy_Complete_Demo.html';
let code = fs.readFileSync(file, 'utf8');

const lines = code.split('\n');

const restoredBlock = `  'M/P': { meaning: 'real money demand', ref: 'eq. 5.3', role: 'liquidity preference' },
  'P': { meaning: 'domestic price level', ref: 'Ch. 7', role: 'price level' },
  'P*': { meaning: 'foreign price level', ref: 'Ch. 19', role: 'foreign price level' },
  'P′': { meaning: 'next-period price level: P(1+π·speed)', ref: 'Ch. 16 p.336 (primes = future values)', role: 'price transition rule' },
  'P*′': { meaning: 'next-period foreign price level', ref: 'Ch. 16 p.336', role: 'foreign price transition rule' },
  'Eᵉ′': { meaning: 'next-period expected exchange rate: adaptive update of Eᵉ toward current E', ref: 'Ch. 16 p.336; cf. eq. 19.5', role: 'expectation transition rule' },
  'Taylor i': { meaning: 'What the central bank will change the interest rate to next period to fulfill the Taylor rule', ref: 'smoothed, see 5.4 in Model Textbook Correspondence', role: 'Taylor rule' }
};

const EQ_REF = {
  'C': 'eq. 3.3',
  'I': 'eq. 5.1 / 9.1',
  'G': 'exogenous (Ch. 3)',
  'Y': 'eq. 3.1 / 9.1',
  'eps': 'ε = E·P/P* (Ch. 17)',
  'anchor': 'eq. 9.1/19.1',
  'fisher': 'eq. 6.4',
  'MD': 'eq. 5.3',
  'MP': 'Ch. 23',
  'PC': 'eq. 9.3 *',
  'un': 'Blanchard eq. 8.4',
  'Yn': "Blanchard p.179; cf. Okun's Law box, eq 9B.1",
  'UIP': 'eq. 19.5',
  'NX': 'eq. 19.1 / 19.2',
  'pi_e': 'Model Textbook Correspondence 6.6',
  'gap': 'output gap — cf. eq. 9.2',
  'P_prime': 'Correspondence §7.8 *',
  'P_star_prime': 'Correspondence §7.8 *',
  'Ee_prime': 'Correspondence §7.8 * (adaptive)',
  'taylor': 'Ch. 23 * (smoothing added)'
};`;

// Line 887 is index 886. I'm replacing lines 887 to 891 (5 lines), which are indexes 886, 887, 888, 889, 890.
lines.splice(886, 5, restoredBlock);

fs.writeFileSync(file, lines.join('\n'));
console.log("Splice successful!");
