# Spec — Engine: πᵉ Gating (nominal rate until PC unlocks)

**Type:** Engine spec (touches `solve()` and the IS-plot render path). Display-only
consequences (hiding the πᵉ control / Fisher line / real-rate line) are included here
because they are inseparable from the engine gate — but Slice 2's equation *colouring* is
NOT in scope.
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (open economy).
**Also touches:** `verify_v19.mjs` (new assertion) and the in-HTML self-tests.
**Do NOT touch:** v16 (closed economy) in this pass.
**Governed by:** CLAUDE.md + `.agents/AGENTS.md` (no weakening a verifier; spec-first;
verifier-green is the gate), the `macro-model-verification` skill, and the
Correspondence doc.
**Gate:** `node verify_v19.mjs` and `node verify_onboarding.mjs` green; in-HTML self-tests
pass; manual browser check that πᵉ is dead in the ISLM-only stage and live after PC unlock.

---

## 0. The decision (confirmed by Frank)

Blanchard introduces the **nominal** rate in the core short-run IS-LM model (Ch. 5), with
prices and expected inflation held constant — there, the nominal/real distinction does not
exist. The **real** rate `r = i − πᵉ`, the Fisher relation, and expected inflation only
arrive with the medium-run/expectations expansion. In the tool this means:

- **PC locked (GOODS, ISLM, UIP stages):** the engine uses the **nominal rate, r = i**.
  No πᵉ control, no Fisher line, no real-rate line. Moving anything inflation-related must
  do nothing to output, because inflation is not in the model yet.
- **PC unlocked:** the nominal→real distinction switches on. `r = i − πᵉ`, the Fisher line,
  the real-rate dashed line, and the πᵉ control all appear together.

This **reverses the earlier "πᵉ stays in ISLM" decision** (now superseded). Frank has
confirmed it: the full model still has the real rate; we simply don't let it influence
output before it has been taught, because that confuses the core short-run lesson.

---

## 1. Pre-flight: confirm the current state of the file

This spec is written against the **post-engine-fix** v19 (the one where `isOutput` /
`isRateForOutput` take `(…, c1, m1, Ystar)` and verify_v19 #15 is green). Before editing,
confirm in the actual repo file:

1. `isRateForOutput`'s signature is `isRateForOutput(Y, G, T, eps, pi_e, c1, m1, Ystar)`.
2. **Every** call site passes all 8 args — in particular the IS-plot calls in the render
   function (the `isPts` loop, the `isEndVal` label, and the `isHandle_i` handle) and the
   Taylor neutral-rate calls in `solve()`/`step()`/`drawEquations`. If any plot call still
   passes only 5 args (relying on defaults), **fix it to pass `state.c1, state.m1,
   state.Ystar` first**, as a separate prep commit, before doing the πᵉ gate. A plot path
   silently running on default coefficients is the "engine-correct but diagram-wrong"
   failure category — it must be closed first or the πᵉ gate will be built on a wrong curve.

Report what you found for (1) and (2) before proceeding.

---

## 2. The mechanism: one helper, routed everywhere

Do **not** sprinkle `if (PC locked)` across the ~10 πᵉ touch-points — that is order-fragile
and easy to miss one. Instead add a single helper and route every real-rate computation
through it.

```js
// πᵉ only influences the model once the PC block (medium-run / expectations) is unlocked.
// Before that we are in Blanchard's core short run: the rate is NOMINAL, r = i.
function effectivePiE(s) {
  return tutorialState.unlocked.has('PC') ? s.pi_e : 0;
}
```

Then replace every place that currently reads `s.pi_e` / `state.pi_e` **for the purpose of
computing a real rate or the IS curve** with `effectivePiE(s)` / `effectivePiE(state)`.

**Sites that MUST route through `effectivePiE` (real-rate / IS-curve uses):**
- `solve()` real rate: `const r = i - effectivePiE(s);` (currently line ~594).
- IS-plot loop: `isRateForOutput(Y, state.G, state.T, eq.eps, effectivePiE(state), state.c1, state.m1, state.Ystar)` (the `isPts` push).
- IS-plot end label `isEndVal` and drag handle `isHandle_i`: same substitution.
- IS-drag handler `HANDLES.is`: `const r = newi - effectivePiE(state);`.
- real-rate dashed line value: `const real_i = eq.i - effectivePiE(state);` (but also hidden — see §3).
- Taylor neutral-rate calls in `solve()`/`step()` that pass `PI_TARGET` as the `pi_e`
  argument to `isRateForOutput`: these are computing a *neutral* rate and the Taylor rule
  only runs when PC is unlocked (Taylor gates to PC). Confirm Taylor cannot fire with PC
  locked; if it can, gate it. Do NOT change the `PI_TARGET` argument there — that is the
  inflation *target* used for the neutral-rate calc, not πᵉ.

**Sites that MUST NOT change (πᵉ used for its own dynamics, only ever active once PC is
unlocked anyway):**
- `solve()` PC equation `pi = s.pi_e + α·gap + z` (line ~598): leave `s.pi_e`. The PC
  equation is only displayed/meaningful when PC is unlocked; gating output (via the real
  rate) is what severs the channel. Adding a verifier check (§4) confirms output is
  πᵉ-invariant when PC locked regardless of this line, because πᵉ reaches output ONLY
  through r, which is now gated.
- `step()` πᵉ drift (lines ~638–639): leave as-is. Stepping/time-controls gate to PC, so
  this never runs pre-PC.
- The PC-curve render (line ~1059) and PC readouts: gated by the PC block visibility.

**Key invariant:** πᵉ's *only* path to output Y is through the real rate r in the IS
relation. Once every real-rate computation routes through `effectivePiE`, output is
automatically πᵉ-invariant whenever PC is locked. That is the whole mechanism — verify it
holds (§4) rather than trying to zero πᵉ everywhere.

---

## 3. Display consequences (inseparable from the gate)

When PC is **locked**, hide:
- The **πᵉ control/slider**. Change its `paramDefs` block from `block: 'ISLM'` to
  `block: 'PC'` (line ~537) so the existing block-gating greys/hides it with the PC block.
- The **Fisher line** in the equation box (lines ~1432–1434) — the Fisher relation IS the
  nominal/real distinction; it must not appear pre-PC.
- The **real-rate dashed line** (`curve-real`, lines ~885–887) on the IS-LM chart.
- The **πᵉ readouts** (lines ~1159 delta, ~1173) — gate to PC.

When PC is **unlocked**, all of the above appear (current behaviour).

Label/naming note (unchanged by this spec): composite chart is "ISLM", flat blue line is
"LM" (display only); internal `EQ_COL.MP` / `curve-mp` identifiers stay as-is.

This is gating of existing elements, not new UI. Use the same block-visibility mechanism
Slice 1 established. Do NOT build the equation *colouring* here — that is Slice 2.

---

## 4. New `verify_v19.mjs` assertion — πᵉ-invariance when PC locked

Export `effectivePiE` (and `tutorialState` access, or a setter) alongside the existing
exports so the verifier can toggle block state. Then add assertion block **"16 πᵉ gating"**:

```js
// 16 — πᵉ gating: output invariant to πᵉ when PC locked; responsive when unlocked.
{
  // PC LOCKED: r = i, so moving πᵉ must not move Y.
  setUnlocked(['GOODS','ISLM','UIP']);            // PC NOT in the set
  const sA = clone(initialState); sA.pi_e = 0.02;
  const sB = clone(initialState); sB.pi_e = 0.10; // large πᵉ change
  const Ya = solve(sA).Y, Yb = solve(sB).Y;
  check('16 PC-locked: Y invariant to πᵉ', approx(Ya, Yb, 1e-9),
        `Y(πᵉ=2%)=${Ya.toFixed(4)} Y(πᵉ=10%)=${Yb.toFixed(4)}`);
  check('16 PC-locked: r = i (no Fisher)', approx(solve(sB).r, sB.i, 1e-9),
        `r=${solve(sB).r.toFixed(4)} i=${sB.i.toFixed(4)}`);

  // PC UNLOCKED: r = i − πᵉ, so a higher πᵉ lowers r, raising Y.
  setUnlocked(['GOODS','ISLM','UIP','PC']);
  const Yc = solve(sB).Y;                          // same sB, now PC unlocked
  check('16 PC-unlocked: higher πᵉ raises Y (real-rate channel live)', Yc > Ya + 0.5,
        `Y(πᵉ=10%, PC on)=${Yc.toFixed(4)} vs locked baseline ${Ya.toFixed(4)}`);
  check('16 PC-unlocked: r = i − πᵉ', approx(solve(sB).r, sB.i - sB.pi_e, 1e-9),
        `r=${solve(sB).r.toFixed(4)}`);

  // restore default tutorial state for any later assertions
  setUnlocked(['GOODS','ISLM','UIP','PC']);
}
```

(`setUnlocked` is whatever helper the file exposes for `tutorialState.unlocked` — reuse the
existing `setTutorialUnlocked`/`resetTutorial` mechanism rather than poking the Set directly,
and export it for the verifier. If none is cleanly exportable, export a small
`__setUnlockedForTest(blocks)` used only by the verifier.)

**Self-test the assertion** in the spirit of the existing analyzer self-tests: a tiny
fixture proving the check fails against an un-gated `r = i − s.pi_e` (the pre-gate engine)
and passes against the gated one, so it can't silently rot.

**Existing assertions must stay green.** Note the baseline (`initialState`) has πᵉ=2% and
the existing baseline checks (Y=100, r=1%, i=3%) assume PC-unlocked semantics (r = i − πᵉ =
3% − 2% = 1%). The verifier's default tutorial state must therefore be **PC-unlocked** so
assertions 1–15 see r = i − πᵉ as before. Only assertion 16 toggles to PC-locked and back.
Confirm assertions 1–15 still pass unchanged.

---

## 5. `verify_onboarding.mjs` — reconciliation under the gate

The reconciliation check (`testReconciliation`) computes the real rate as `eq.r` from the
engine, so it inherits the gate automatically. BUT add one targeted case:

```js
// PC locked: components must still reconcile to engine Y, with r = i (not i − πᵉ).
// (Run with the onboarding tutorialState set so PC is locked.)
check('Eq Reconciliation: PC-locked nominal rate',
      testReconciliationPCLocked({ i: 0.04, pi_e: 0.10 }, 'PC-locked, big πᵉ'));
```

where the PC-locked variant sets `tutorialState` to exclude PC, solves, and asserts both
(a) `C+I+G+NX === eq.Y` and (b) `eq.r === eq.i` (πᵉ had no effect). This guards the
"engine-correct but diagram-wrong" boundary: components in the equation box must reconcile
to the gated Y, and the displayed r must be the nominal rate.

---

## 6. Order of operations & commit discipline

0. Pre-flight §1 — confirm/fix 8-arg `isRateForOutput` plot calls (separate prep commit if a fix is needed).
1. Add `effectivePiE`; route all real-rate/IS-curve sites through it (§2).
2. Display gating: move πᵉ control to PC block; hide Fisher line, real-rate line, πᵉ readouts when PC locked (§3).
3. verify_v19 assertion 16 + export `effectivePiE`/setter + self-test (§4).
4. verify_onboarding PC-locked reconciliation case (§5).
5. Run all verifiers; manual browser check.
6. `git add -A && git commit` only after both verifiers green AND the browser check passes.

**Acceptance (all must hold):**
- [ ] `node verify_v19.mjs` green, incl. new #16 (and its self-test); assertions 1–15 unchanged.
- [ ] `node verify_onboarding.mjs` green, incl. the PC-locked reconciliation case.
- [ ] In-HTML self-tests pass (baseline isOutput=100; round-trip).
- [ ] **Browser, ISLM-only stage (PC locked):** dragging the πᵉ slider — if visible at all —
      does nothing to Y; the πᵉ control, Fisher line, and real-rate dashed line are hidden;
      the IS-LM chart shows r = i.
- [ ] **Browser, after PC unlock:** πᵉ control, Fisher line, real-rate line all appear;
      raising πᵉ lowers the real rate and raises Y.
- [ ] No verifier tolerance widened anywhere.

## 7. Guardrails (do NOT do)
- Do NOT edit v16.
- Do NOT build Slice 2 equation colouring here (separate spec).
- Do NOT change the `PI_TARGET` argument in the Taylor neutral-rate calls (that's the target, not πᵉ).
- Do NOT zero πᵉ in `step()` or in the PC equation itself — gate only the real-rate path via `effectivePiE`; those dynamics never run pre-PC anyway.
- Do NOT weaken/loosen any verifier check; do NOT `Set-Content` the HTML in PowerShell.
- Keep the verifier's DEFAULT tutorial state PC-unlocked so existing assertions are unaffected.
