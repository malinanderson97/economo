# Spec: Gate the Taylor rule to PC-unlock (UI + engine), folded into Stage 3b

## 1. Goal (one sentence)
The Taylor rule must be unavailable and inert until the PC block is unlocked: the Taylor toggle and φ slider grey out until PC (UI), and `step()` must not apply the Taylor reaction function while PC is locked (engine) — so at the IS-LM/UIP stages the central bank sets `i` directly (Blanchard Ch.5), and the endogenous rule only appears once there is an inflation gap and a natural rate for it to respond to.

## 2. Which model(s) and which function(s)
`islm_pc_model_v19_Open_Economy_Complete_Demo.html`:
- `step(s)` line ~723 — the `if (s.taylor_on)` block (ENGINE guard).
- The gating region ~2130 — the `setLocked('#taylor-toggle', islmOn)` from Stage 3a re-keys to `pcOn`; add φ gating to `pcOn`.
`verify_onboarding.mjs` — new invariant (Taylor inert pre-PC). Possibly `verify_v19.mjs` if that is the better home for an engine-level `step` invariant (see §6).

## 3. The economics (anchor to the textbook)
The Taylor rule is a monetary-policy reaction function: `i = neutral_i + φ(π − π*) + ψ(Y − Yₙ)/Yₙ`. It responds to (a) the inflation gap and (b) the output gap against natural output Yₙ. Both anchors are PC-block / medium-run objects: pre-PC the engine runs with no inflation apparatus (`effectivePiE` returns 0, prices fixed), and Yₙ is deliberately hidden pre-PC (prior decision). So a Taylor rule active pre-PC is reacting to gaps that are not yet part of the taught model — the CB would be steering toward a target the learner hasn't been shown. In Blanchard's Ch.5 short-run IS-LM the central bank sets the interest rate **directly** (exogenous policy lever); the endogenous reaction rule is a medium-run addition. Gating Taylor to PC therefore makes the short-run stage *more* faithful, not less.

This is the same bundle as the πᵉ-with-PC gating already implemented and pending Frank: the whole inflation/policy apparatus (nominal-vs-real `r=i−πᵉ`, the Fisher line, πᵉ control, and now the Taylor rule) switches on together at PC unlock. Built now on fidelity grounds; **logged for Frank** as part of that bundle (see the Frank note).

## 4. What must NOT change
- No change to `step`/`solve` math other than adding the PC guard to the Taylor block. Pre-PC, `raw_i` must fall through to `s.i_target` exactly as it does today when `taylor_on` is false — i.e. direct rate-setting, unchanged behaviour.
- Post-PC behaviour is IDENTICAL to today (guard is true when PC unlocked, so the Taylor block runs exactly as now).
- φ stays `block:'ISLM'` and the Taylor toggle stays in the IS-LM *section* — placement by function is unchanged. Only the *unlock timing* changes (greyed until PC).
- `effectivePiE`'s existing guard untouched; we mirror its pattern, not modify it.
- `verify_v19` must stay 52/0 for all existing checks (a new check may raise the count).

## 5. The edits

### 5a. Engine guard in `step()` (line ~723)
- OLD: `  if (s.taylor_on) {`
- NEW: `  if (s.taylor_on && tutorialState.unlocked.has('PC')) {`
This mirrors `effectivePiE(s)` (line ~683: `tutorialState.unlocked.has('PC') ? s.pi_e : 0`). When PC is locked, the Taylor block is skipped and `raw_i` stays `s.i_target` (direct rate-setting). `tutorialState` is already reachable from engine functions the headless verifier exercises (via `effectivePiE`), so this does not break headless discipline — confirm by running `verify_v19` after.

### 5b. UI gating (gating region ~2130, from Stage 3a)
- CHANGE: `setLocked('#taylor-toggle', islmOn);` → `setLocked('#taylor-toggle', pcOn);`
- ADD (φ is a `.control[data-block="ISLM"]`, so it is currently lit at ISLM-unlock; it must instead gate on PC): the φ control needs to grey on `pcOn` not `islmOn`. Since blanket `setLocked('.control[data-block="ISLM"]', islmOn)` lights ALL ISLM controls at ISLM-unlock, add an explicit override AFTER that line: `setLocked('#control-phi', pcOn);` (confirm the φ control's actual id/selector — grep for how `phi` renders its wrapper; if it has no stable id, gate via a targeted selector such as `.control[data-key="phi"]` and confirm that attribute exists, else add a stable id to the φ control wrapper in buildControls output). Report the exact selector used.
- Net: at IS-LM and UIP stages, Taylor toggle AND φ are greyed; at PC-unlock both light. `i` remains a direct, draggable lever pre-PC (the rate handle / i control is NOT gated by this change).

## 6. The invariant(s) that must hold afterward  ← the whole point
Add an engine-level invariant asserting the Taylor rule is inert pre-PC. This is a `step()` behaviour, so `verify_v19.mjs` (which owns engine-output invariants and already tests the πᵉ-invariance-when-PC-locked property) is the natural home — put it there, matching the existing πᵉ-locked check's style:
- With PC LOCKED and `taylor_on = true`: `step(s)` must produce the SAME next-period `i` as with `taylor_on = false` (both fall through to `i_target`). I.e. next `i` is invariant to `taylor_on` when PC is locked. Assert `step({...s, taylor_on:true}).i === step({...s, taylor_on:false}).i` at a PC-locked tutorial stage.
- With PC UNLOCKED: `taylor_on = true` DOES change next `i` vs `taylor_on = false` (the rule is live) — proving the guard only suppresses pre-PC, not always.
- BAD-fixture (mutating): remove the `&& tutorialState.unlocked.has('PC')` from a mutated source, rebuild, and confirm the PC-locked-invariance assertion now FAILS (Taylor leaks pre-PC). No literal fixtures.

Also, in `verify_onboarding.mjs`, extend the Stage-3a gating check (INV-6b) so `#taylor-toggle` (and the φ control) are asserted `.locked` at a PC-locked stage and lit at Full — matching the deanchor/shock pattern already there.

**Browser-check (§6c continuation):** at IS-LM and UIP stages, Taylor toggle and φ are greyed and unclickable; toggling is impossible; stepping the model with the (greyed) Taylor state does not move `i` via the rule. At PC/Full, Taylor + φ light and the rule works exactly as before. Confirm `i` is still directly draggable at the IS-LM stage.

## 7. Done criteria
- [ ] `node verify_v19.mjs` → 52/0 existing + new Taylor-inert-pre-PC invariant with mutating BAD-fixture (state new total).
- [ ] `node verify_onboarding.mjs` → green; INV-6b extended to cover Taylor+φ gating (state new total).
- [ ] `node mutation_check.mjs` passes.
- [ ] Engine diff is EXACTLY the one-condition guard on the `step` Taylor block — no other `step`/`solve` lines changed.
- [ ] Report the exact φ selector used for gating.
- [ ] Browser-check: Taylor+φ greyed pre-PC, `i` still directly draggable pre-PC, rule works post-PC.
- [ ] `git --no-pager diff` pasted; only engine HTML + verifier(s); confirm post-PC engine behaviour unchanged.
- [ ] Committed by human: suggested `engine+ui: gate Taylor rule to PC-unlock (inert + greyed pre-PC; direct rate-setting in short run); verifier invariant added`.
- [ ] **Frank note updated** (see §8) — bundled with the πᵉ-with-PC decision.

## 8. Frank note (append to the existing πᵉ-with-PC decision log for Frank)
Add to the pending-Frank bundle: "The Taylor rule is now gated to PC-unlock, both in the UI (toggle + φ greyed until PC) and in the engine (`step` skips the Taylor reaction while PC is locked, so the short-run CB sets i directly per Blanchard Ch.5). Rationale: the Taylor rule responds to the inflation gap and the output gap against Yₙ, both of which are PC-block/medium-run objects not present in the short-run model; with Yₙ already hidden pre-PC, an active Taylor rule pre-PC would react to targets not yet taught. This is part of the same 'inflation & policy apparatus unlocks at PC' bundle as the πᵉ / nominal-vs-real / Fisher-line gating. Decided by Malin on fidelity grounds; flagged for Frank's sign-off on teaching sequence — specifically whether students should meet the Taylor rule at the short-run stage or only at the medium-run/PC stage."
