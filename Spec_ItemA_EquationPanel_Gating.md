# Spec — Item A finisher: ISMP equation-panel block gating

**Scope:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` only. Display-only.
No engine change. Closes the last browser gap in item A (πᵉ-gating). Do NOT
touch Slice 2 territory (per-curve permanent colouring, TERM_BLOCK export).

## Why
The engine now uses `r = i − effectivePiE(s)`, and `effectivePiE` returns 0
until PC unlocks (so r=i pre-PC) and returns `s.pi_e` after. The IS-MP
equation panel (`drawEquations`, the `eq-ismp` blob) does NOT yet reflect this:
- It always shows the NX line, even before UIP is unlocked.
- The investment line always reads `d₀ + d₁·Y − d₁ᵣ·r`, showing the symbol
  `r` even pre-PC when the engine is on the nominal rate. Pre-PC it must read
  `i`, matching the engine.
- The anchor always reads `Y = C + I + G + NX`.

This is the same "engine-correct, diagram-wrong" failure, one level down in the
equation text. The panel must tell the same story as the engine and the plotted
curves: pre-UIP there is no open-economy term; pre-PC there is no real-rate
distinction.

## Target code
`drawEquations(eq)`, the `if (ismpEl)` branch, approx lines 1367–1417.
Available gating API (already used elsewhere in the file):
`tutorialState.unlocked.has('UIP')`, `tutorialState.unlocked.has('PC')`.

## Required behaviour

### A. NX line — gate on UIP
- When `UIP` is **locked**: omit the NX line entirely AND change the anchor to
  `Y = C + I + G`. The Y-total line must sum only C + I + G (drop `+ NXd` from
  both the displayed sum string and the arithmetic).
- When `UIP` is **unlocked**: unchanged from current — anchor `Y = C + I + G + NX`,
  NX line present, total includes NX.

### B. Investment rate symbol — gate on PC
- When `PC` is **locked**: the I line symbolic form reads `d₀ + d₁·Y − d₁ᵣ·i`
  (symbol `i`, not `r`), and the substituted number uses the nominal rate value.
  Because `effectivePiE` returns 0 pre-PC, `r === eq.i` numerically, so the
  displayed number is already correct — only the **symbol** glyph changes r→i.
- When `PC` is **unlocked**: unchanged — `d₀ + d₁·Y − d₁ᵣ·r`, using `r`.

Implementation note: the I line currently hardcodes `d₁ᵣ·r` in the `.eq-sym`
span and substitutes `${f(r,4)}`. Introduce
`const rateSym = tutorialState.unlocked.has('PC') ? 'r' : 'i';`
and use `rateSym` in the symbolic span. The numeric `r` value is left as-is
(it equals i pre-PC by construction — do not recompute).

### C. Do NOT touch
- The MP/LM line (already gates correctly on `taylor_on`).
- Greying/locking visual treatment of the curves themselves (Slice 1, done).
- Any colour constants or `EQ_COL` (Slice 2 owns permanent colouring).
- The engine, `solve`, `step`, `effectivePiE`, or any plot function.

## Acceptance criteria (browser, F12 console + visual)
1. Fresh load (only GOODS+ISLM unlocked, PC & UIP locked):
   - `eq-ismp` anchor reads `Y = C + I + G` (no NX).
   - No NX line present.
   - I line reads `d₀ + d₁·Y − d₁ᵣ·i`.
   - Y-total = C + I + G and the displayed sum has three addends.
2. Unlock UIP (not PC): NX line appears, anchor becomes `Y = C + I + G + NX`,
   total gains the NX addend. I line still reads `…− d₁ᵣ·i`.
3. Unlock PC: I line symbol flips to `…− d₁ᵣ·r`. Displayed numbers unchanged
   at the unlock instant (continuity: r=i at πᵉ=0).
4. Self-tests still print `[SELF-TEST] 5/5 passed` (this change touches no
   engine path, so the count must not move — if it reads 4/5, STOP, that is a
   pre-existing regression to investigate before this edit lands).

## Verifier
No new .mjs assertion required: this is pure display gating with no `solve()`
consequence, and verify_v19 #16 already pins the engine invariant (Y invariant
to πᵉ when PC locked). Note in the handoff that the agent must run both root
verifiers and report counts unchanged (verify_v19 40/0, verify_onboarding 37/0)
to prove no engine path was disturbed.

## Git
Agent does NOT commit (AGENTS.md rule 15). Human commits item A as a whole
after this lands and browser criteria 1–3 pass and self-tests read 5/5.
