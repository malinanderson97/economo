# Spec: Stage-list tutorial model (replaces the unlock ratchet) — enables UIP on→off→on

> Status: DRAFT. Supersedes the old Step 3 (UIP-presentation gating), which was reverted — it
> gated on `unlocked.has('UIP')`, a one-way Set that cannot express UIP turning back off at the
> IS-LM-PC stage. This spec replaces the ratchet with an ordered, directly-selectable stage
> list. Steps 1–2 (engine gate + verifier assertions 17–23) are committed and survive; only
> what `openOn()` READS changes, plus the tutorial-state representation and its UI control.

## 1. Goal (one sentence)
Replace the monotonic "unlock next block" ratchet with an ordered list of named teaching
stages that the user can step through (Next button) or jump to directly (stage-label
dropdown), where each stage declares its own economy (closed/open) and unlocked blocks — so
the closed↔open distinction can toggle across stages (notably UIP active at IS-LM-UIP, OFF
again at IS-LM-PC, ON again at Full Model).

## 2. Which model(s) and which function(s)
- File: the unified v19 (the only file).
- New state: an ordered `TUTORIAL_STAGES` array + a current-stage index on `tutorialState`.
- `openOn()` (line ~613): change from `tutorialState.unlocked.has('UIP')` to read the current
  stage's economy flag (`currentStage().economy === 'open'`). THIS IS THE ONLY ENGINE-FACING
  CHANGE. The gate stays inside `isOutput`/`isRateForOutput` — do not move it.
- `advanceTutorial()` (line ~2068): becomes "go to next stage" (index++), bounded.
- New `goToStage(i)` for the dropdown; the existing `setUnlocked()` test helper keeps working
  but a `setStage()` / economy-override path is added so verifier assertions can put the engine
  in closed mode WITH UIP in the unlocked set (the IS-LM-PC stage — see §5).
- UI control (line ~334): replace the single "Unlock Next Block" button with a stage-label
  control (shows current stage name, e.g. "IS-LM-UIP Model"), a dropdown listing all stages,
  and a "Next" button.
- `renderTutorial` (line ~2077): drive presentation off the current stage, INCLUDING greying
  the UIP curve/drill/sliders when `economy === 'closed'` even if UIP ∈ unlocked.

## 3. The stages (the data that replaces the ratchet)
Ordered list. `economy` drives `openOn()`; `unlocked` drives every other `.has()` read (PC,
DEBT, ISLM, GOODS — all genuinely monotonic, so the Set still only grows along the Next path).

| # | label                | economy | unlocked                              |
|---|----------------------|---------|---------------------------------------|
| 0 | IS Model             | closed  | GOODS, ISLM                           |
| 1 | IS-LM-UIP Model      | open    | GOODS, ISLM, UIP                      |
| 2 | IS-LM-PC Model       | closed  | GOODS, ISLM, UIP, PC                  |
| 3 | Full Model           | open    | GOODS, ISLM, UIP, PC                  |
| 4 | + Government Debt    | open    | GOODS, ISLM, UIP, PC, DEBT            |

Rows 2→3 are the crux: PC stays unlocked and DEBT accumulates monotonically, but `economy`
flips closed→open. Row 2 (IS-LM-PC, closed) is the Ch. 9 closed medium-run anchor — UIP greys
out even though it was active at stage 1. This is the combination the old ratchet could not
represent.

NOTE on `unlocked` for non-UIP blocks: economy is now orthogonal to the Set. Keep the Set
monotonic along the Next path for PC/DEBT (they never turn back off). UIP appears in `unlocked`
from stage 1 onward (so its tooltips/defs exist) but its ACTIVE/closed state is governed by
`economy`, not by Set membership. Do NOT remove UIP from the Set at stage 2 — that would
wrongly also hide UIP symbol definitions etc.; instead grey it via the economy flag.

## 4. The economics (anchor to the textbook)
Unchanged from the committed engine. closed = open equations with trade terms gated off
(k=2.5); open = full open IS + UIP (k_o≈1.43). Pre-PC closed runs r=i (Y=90 baseline);
medium-run (PC on) runs r=i−πᵉ (Y=100). The two gates remain independent:
`openOn()`→economy, `effectivePiE`→`unlocked.has('PC')`. The stage table is just the
teaching path through the four cells of (economy × PC). Stages map to: IS (closed,noPC) →
IS-LM-UIP (open,noPC) → IS-LM-PC (closed,PC) → Full (open,PC) → +Debt.

## 5. What must NOT change
- The engine gate stays INSIDE `isOutput`/`isRateForOutput`. Steps 1–2 engine code is untouched
  except the one line inside `openOn()`.
- `effectivePiE` still reads `unlocked.has('PC')`. PC remains monotonic.
- All committed verifier assertions 17–23 keep their INTENT. Their state-setup changes only
  where they used "UIP absent from set" to mean "closed": that must become "economy=closed"
  so closed-mode can be tested WITH UIP unlocked (the IS-LM-PC stage). Logic/tolerances
  unchanged.
- Baselines: pre-PC closed Y=90, medium-run closed Y=100, open multiplier 1.43, closed 2.5.
- No engine numbers move. verify_v19 stays 48/0 (or +N if §6 adds stage assertions — state
  the new count), onboarding stays 95/0.

## 6. The invariant(s) that must hold afterward
Encode as verifier assertions:
1. **Stage→economy mapping.** For each stage in TUTORIAL_STAGES, after `goToStage(i)`,
   `openOn()` returns the table's economy value. In particular: stage "IS-LM-UIP" → open;
   stage "IS-LM-PC" → closed (THE non-monotonic case: UIP ∈ unlocked AND economy closed);
   stage "Full Model" → open.
2. **Closed+PC cell via stage, not set-absence.** At stage "IS-LM-PC": closed multiplier
   (ΔY/ΔG≈2.5) AND r=i−πᵉ AND output invariant to i*/Eᵉ/m1/Ystar AND responds to πᵉ. (This is
   committed assertion 22, re-expressed to set the stage rather than omit UIP from the set.)
3. **UIP re-opens at Full.** Going IS-LM-PC → Full Model (Next): `openOn()` flips closed→open,
   multiplier returns to 1.43, trade channel live again — proving the toggle is reversible.
4. **Monotonic blocks stay monotonic.** Across the Next path, `unlocked` for PC and DEBT never
   shrinks (PC present from stage 2 on; DEBT from stage 4).
5. **Dropdown jump = Next-walk.** `goToStage(i)` produces the same `tutorialState` as stepping
   Next i times from stage 0 (no path dependence — jumping to a stage gives its declared state
   regardless of route).

## 7. Done criteria
- [ ] verify_v19 green (state new count if assertions added; ≥48/0), onboarding 95/0,
      mutation_check green.
- [ ] Invariants §6.1, §6.2, §6.3, §6.5 encoded as assertions (not hand-checked).
- [ ] HS-1 construct-check passes (run it explicitly — not "implicitly").
- [ ] **Browser check** (this is where the old Step 3 failed silently): stepping Next through
      all stages shows IS → IS-LM-UIP (UIP curve/sliders colour in) → IS-LM-PC (UIP greys out,
      IS curve redraws to the flatter closed slope, PC appears) → Full (UIP colours back in,
      IS steepens) → +Debt. The dropdown jumps directly to any stage. Confirm the UIP elements
      actually grey/hide at IS-LM-PC — grep-verify every selector used matches a real element
      BEFORE trusting the presentation code (the old edit used unverified selectors).
- [ ] Committed by Malin after green.

## 8. Notes / sequencing for Antigravity
- Suggested slices, commit after each green: (1) add TUTORIAL_STAGES + stage index + goToStage
  + change `openOn()` to read economy; prove engine path via §6.1/§6.2 assertions BEFORE any
  UI. (2) Replace the button with the label+dropdown+Next control; wire renderTutorial to the
  stage. (3) Browser check.
- `openOn()` lives in the headless slice and must stay pure. `currentStage()` it calls must
  also be headless-safe (read `tutorialState`, no DOM). The dropdown/Next DOM wiring lives in
  the Boot region only.
- Do NOT remove UIP from the `unlocked` Set at the closed-PC stage (see §3 note) — grey via
  economy, not via set membership, or UIP symbol definitions vanish.
