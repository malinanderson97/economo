# Spec — Item A finisher: repaint equation panel on block unlock

**Scope:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` only.
Display/timing change. NO engine change. NO change to `solve`, `step`,
`computeYn`, `effectivePiE`, or any coefficient.

## Why
The equation-panel gating (NX appears on UIP unlock; the investment-rate symbol
flips i→r on PC unlock) is correct, but it does not repaint at the moment of
unlock. Unlocking a block currently updates only the lock/grey treatment, not
the equation text — the panel refreshes only on the next full render (e.g. when
the user moves a slider).

Root cause: `unlockBlock(block)` (≈line 451) mutates `tutorialState.unlocked`
and then calls only `renderTutorial()`, which re-applies locking but does NOT
call `drawEquations`. The full pipeline lives in `render()` (≈line 1480), which
runs `solve` → `drawEquations(eq)` → `renderTutorial()` in that order. So the
panel text only rebuilds inside `render()`, which unlock never triggers.

This matters for the onboarding feature, not just polish: each unlock is the
intended pedagogical "reveal" (Fisher line / real-rate symbol appear at PC,
NX appears at UIP). The reveal must happen ON unlock, not on the next
incidental interaction.

## Target code
`unlockBlock(block)`, ≈lines 451–454. Current form:

```javascript
function unlockBlock(block) {
  tutorialState.unlocked.add(block);
  renderTutorial();
}
```

## Required change
Trigger a full render on unlock instead of only the locking pass. `render()`
already ends by calling `renderTutorial()` (≈line 1500), so calling `render()`
covers curves, the equation panel, AND the lock/grey treatment in the correct
order:

```javascript
function unlockBlock(block) {
  tutorialState.unlocked.add(block);
  render();
}
```

## Constraints / do NOT
- Change ONLY `unlockBlock`. Do NOT change `setUnlocked` or `resetTutorial`:
  both are called by the Node verifiers (headless, no DOM), where `render()`
  would throw on `document.*` / SVG calls. They must keep calling
  `renderTutorial()` (a safe no-op stub under Node). This separation is
  deliberate — do not "tidy" it by making all three consistent.
- `unlockBlock`'s only caller is `advanceTutorial()` (the "Unlock Next Block"
  button), which only fires from user interaction after full init, so `render()`
  is safe there. Do not add unlock calls anywhere else.
- No engine edit. No `.docx` edit. No git.

## Acceptance criteria (browser)
1. Fresh load, only GOODS+ISLM unlocked: equation panel anchor `Y = C + I + G`,
   investment line `…d₁ᵣ·i`, no NX line. (unchanged from prior spec)
2. Click "Unlock Next Block" to unlock UIP: the NX line and `Y = C + I + G + NX`
   anchor appear IMMEDIATELY, with no slider interaction.
3. Unlock PC: the investment-rate symbol flips to `…d₁ᵣ·r` and the Fisher /
   real-rate elements appear IMMEDIATELY, with no slider interaction.
4. No console errors on any unlock click.
5. Both root verifiers unchanged: verify_v19 40/0, verify_onboarding 37/0
   (this touches no engine path and not the functions the verifier drives).

## Git
Agent does NOT commit (AGENTS.md rule 15). Human commits item A as a whole.
