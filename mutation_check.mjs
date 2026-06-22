// mutation_check.mjs — confirms the verifiers can actually go red.
//
// Usage:  node mutation_check.mjs
// Exit code 0 = every mutation was caught (verifiers are honest).
//          1 = at least one sabotaged engine still passed its verifier, OR a
//              target string was missing (so that mutation could not be tested).
//
// WHY THIS EXISTS
// ---------------
// A green verifier is only trustworthy if you have confirmed it can fail. The
// dangerous failure mode is not a verifier that crashes — it is a verifier that
// is green while no longer checking what you think. This script deliberately
// breaks each model's engine in a known way, runs that model's verifier against
// the broken copy, and asserts the verifier FAILS. If a sabotaged engine still
// passes, the verifier is lying and this script tells you so.
//
// Run it after any big refactor, after editing a verify_*.mjs file, and every
// few weeks as a routine honesty check. It is the human-readable backstop behind
// "two AI systems agreeing is not verification" (see CLAUDE.md).
//
// HOW IT WORKS
// ------------
// For each (model HTML, verifier) pair, and for each mutation:
//   1. Read the real HTML.
//   2. Replace one known engine literal with a wrong value (the "mutation").
//   3. Write the mutated HTML to a temp file alongside the original, with the
//      exact filename the verifier expects (the verifier hard-codes its target
//      filename), having first backed up the real file.
//   4. Run the verifier. It SHOULD exit non-zero (red).
//   5. Restore the real file from backup no matter what.
//
// The temp swap is done carefully so the real model file is always restored,
// even if the verifier throws. Nothing here edits the engine permanently.
//
// KNOWN GAP (found by running this very check, 18 Jun 2026)
// ---------------------------------------------------------
// verify_v19.mjs does NOT catch a wrong value of d1, d1r, c1, or m1: the v19
// baseline equilibrium is calibrated to Y=100 regardless of those coefficients,
// so a corrupted multiplier passes the baseline checks. v16 DOES catch the same
// mutations. The fix belongs in verify_v19.mjs — add a check that pins the open
// multiplier k_o (≈1.43 at baseline) or ΔY/ΔG directly, the way v16 does — and
// is a deliberate, human-reviewed engine-side change. Until then, this script
// sabotages v19's UIP relation instead, which the current verifier does catch,
// so it confirms what verify_v19.mjs can verify TODAY without papering over the
// gap. When that check is added to v19, restore a d1/d1r mutation here too.
// [UPDATE 22 Jun: verify_v19.mjs #15 now pins the open multiplier directly,
//  so the d1/d1r/c1/m1 mutations are restored and caught! Gap closed.]

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- The mutations ---------------------------------------------------------
// Each target string is confirmed to appear EXACTLY ONCE in its model file, and
// is a core structural coefficient the verifier asserts on:
//   • `d1  = 0.10`  → the investment-accelerator term; corrupting it breaks the
//                     multiplier (k=2.5 closed, k_o≈1.43 open) the verifier checks.
//   • `d1r = 200`   → the interest-rate response; corrupting it breaks ΔY/Δr.
// If a model is refactored and a literal changes form, the "from" string will no
// longer be found — the script reports that as a FAILURE (an untested mutation is
// not a safe mutation), so you'll know to update the target here.
const MODELS = [
  {
    name: 'v16 (closed)',
    file: 'islm_pc_model_v16_Closed_Economy_MediumRun.html',
    verifier: 'verify_v16.mjs',
    mutations: [
      { label: 'break multiplier (d1 0.10 → 0.40)', from: 'd1  = 0.10', to: 'd1  = 0.40' },
      { label: 'break interest response (d1r 200 → 20)', from: 'd1r = 200', to: 'd1r = 20' },
    ],
  },
  {
    name: 'v19 (open)',
    file: 'islm_pc_model_v19_Open_Economy_Complete_Demo.html',
    verifier: 'verify_v19.mjs',
    // NOTE: v19's verifier is largely insensitive to the d1/d1r/c1/m1 parameter
    // VALUES, because the baseline equilibrium is calibrated to Y=100 regardless
    // of them — so a wrong multiplier slips past the baseline checks. The checks
    // that ARE value-sensitive are the behavioural ones: the UIP identity (tol
    // 0.001) and twin-deficits sign. We sabotage those. (See the comment block
    // below "KNOWN GAP" — the parameter-value insensitivity is a real weakness in
    // verify_v19.mjs worth closing on the engine side.)
    // [UPDATE 22 Jun: verify_v19.mjs #15 now tests the multiplier directly,
    //  so these mutations are caught.]
    mutations: [
      { label: 'break UIP relation (1+i → 1−i)',
        from: 'const E = s.E_e * (1 + i) / (1 + s.i_star);',
        to:   'const E = s.E_e * (1 - i) / (1 + s.i_star);' },
      { label: 'break multiplier (d1 0.10 → 0.40)', from: 'd1  = 0.10', to: 'd1  = 0.40' },
      { label: 'break interest response (d1r 200 → 20)', from: 'd1r = 200', to: 'd1r = 20' },
      { label: 'break MPC (c1 0.5 → 0.8)', from: 'c1: 0.5,', to: 'c1: 0.8,' },
      { label: 'break import leakage (m1 0.30 → 0.00)', from: 'm1: 0.30,', to: 'm1: 0.00,' },
    ],
  },
];

// ---- Helpers ---------------------------------------------------------------
let problems = 0;

// Run a verifier; return true if it exited GREEN (code 0), false if RED (non-zero).
function verifierPassed(verifier) {
  try {
    execFileSync('node', [verifier], { cwd: __dirname, stdio: 'pipe' });
    return true;   // exit 0
  } catch {
    return false;  // non-zero exit
  }
}

// Run one mutation safely: back up the real file, write the mutated copy in its
// place, run the verifier, then ALWAYS restore the original.
function runMutation(model, mut) {
  const filePath = path.join(__dirname, model.file);
  const original = fs.readFileSync(filePath, 'utf8');

  if (!original.includes(mut.from)) {
    console.log(`  MISSING TARGET  ${model.name}: "${mut.from}" not found — cannot test "${mut.label}"`);
    problems++;
    return;
  }

  const occurrences = original.split(mut.from).length - 1;
  if (occurrences !== 1) {
    console.log(`  AMBIGUOUS TARGET  ${model.name}: "${mut.from}" appears ${occurrences}× (expected 1) — skipping "${mut.label}"`);
    problems++;
    return;
  }

  const mutated = original.replace(mut.from, mut.to);
  const backup = filePath + '.mutation-backup';

  try {
    fs.writeFileSync(backup, original, 'utf8');   // safety copy of the real file
    fs.writeFileSync(filePath, mutated, 'utf8');  // swap in the broken engine

    const stillGreen = verifierPassed(model.verifier);
    if (stillGreen) {
      console.log(`  LYING           ${model.name}: ${mut.label} — engine broken but ${model.verifier} stayed GREEN`);
      problems++;
    } else {
      console.log(`  caught          ${model.name}: ${mut.label} — ${model.verifier} went red as expected`);
    }
  } finally {
    // Restore no matter what happened above.
    fs.writeFileSync(filePath, original, 'utf8');
    if (fs.existsSync(backup)) fs.unlinkSync(backup);
  }
}

// ---- Sanity gate: the verifiers must be GREEN on the real files first -------
// If they're already red before any mutation, the mutation result is meaningless.
console.log('Mutation check — confirming the verifiers can go red.\n');
console.log('Step 0: baseline — verifiers must be green on the real files.');
let baselineOk = true;
for (const model of MODELS) {
  const green = verifierPassed(model.verifier);
  console.log(`  ${green ? 'green' : 'RED  '}           ${model.verifier} on the real ${model.file}`);
  if (!green) baselineOk = false;
}
if (!baselineOk) {
  console.error('\nABORT: a verifier is already red on the unmodified files. Fix that first —' +
                '\nthe mutation check is only meaningful when the real engines pass.');
  process.exit(1);
}

// ---- Run the mutations -----------------------------------------------------
console.log('\nStep 1: sabotage each engine and confirm its verifier catches it.');
for (const model of MODELS) {
  for (const mut of model.mutations) {
    runMutation(model, mut);
  }
}

// ---- Verify the real files are intact after all the swapping ---------------
console.log('\nStep 2: confirm the real files were restored and are still green.');
let restoredOk = true;
for (const model of MODELS) {
  const green = verifierPassed(model.verifier);
  console.log(`  ${green ? 'green' : 'RED  '}           ${model.verifier} on the restored ${model.file}`);
  if (!green) { restoredOk = false; problems++; }
}
if (!restoredOk) {
  console.error('\nWARNING: a real file did not come back green after restore. Check `git status`' +
                '\nand `git restore .` if needed.');
}

// ---- Verdict ---------------------------------------------------------------
console.log('');
if (problems === 0) {
  console.log('RESULT: all mutations caught. The verifiers can go red — they are doing their job.');
  process.exit(0);
} else {
  console.log(`RESULT: ${problems} problem(s). At least one mutation was NOT caught, or a target` +
              `\nwas missing/ambiguous. The verifiers are not fully trustworthy until this is resolved.`);
  process.exit(1);
}
