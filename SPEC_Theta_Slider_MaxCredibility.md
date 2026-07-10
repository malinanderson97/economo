# Spec: θ slider presented as "Max credibility (1 − θ)" — display-only inversion

> Status: DRAFT. **UI/display-only** — `s.theta` remains Blanchard's adaptive weight exactly as
> the θ-convention change made it. No `solve()`/`step()`/preset/verifier-numeric change. The golden
> series and every invariant from `SPEC_Theta_Blanchard_Convention.md` remain valid and untouched.
>
> ⚠️ APPLY TO THE CORRECTED ENGINE. The base file for this change is the tooltip-corrected engine
> (SYMBOL_DEFS['θ'] reworded, native `title` tooltip removed, drill copy rewritten, slider infoText
> stripped) — NOT the raw post-θ-convention file. Confirm the base has NO `titleAttr` in
> buildSliders and SYMBOL_DEFS['θ'] reads "adaptiveness of expectations (Blanchard θ)" before
> starting; if it still says "anchoring of expectations", you're on the wrong base — stop.

## 1. Goal (one sentence)
The θ slider is relabelled "Max credibility", shows its value as (1 − θ), and drags in the
credibility direction (right = more anchored), so it runs the SAME way as the "Current credibility"
slider — while `s.theta` still stores Blanchard's θ internally and the θ meaning stays available via
the symbol's hover tooltip.

## 2. Why (the design rationale, for the record)
After the θ-convention change, the two expectation sliders ran in OPPOSITE directions:
"Adaptiveness θ" up = adaptive, "Current credibility" up = anchored, yet they multiply into one
"effective anchoring" number `(1 − θ) × cred`. That opposition is the source of the confusion. By
displaying the first slider as (1 − θ) = "Max credibility", both sliders run the same direction and
compose intuitively as ceiling × fill: **Max credibility (1 − θ)** is the anchoring ceiling this
central bank can reach; **Current credibility** is how much of that ceiling is realised right now;
effective anchoring = Max × Current = (1 − θ) × cred. This is display-only: the stored θ is
untouched, so Blanchard fidelity in the engine is preserved.

## 3. Mechanism — a generic display-transform hook (clean, reusable)
`buildSliders` currently reads/writes `state[p.key]` directly at every boundary (range `input`
handler, edit-box `commit`, and `syncControls`). Add an OPTIONAL pair of transforms on a slider
def so a slider can display a function of its stored value without changing what's stored:

- `toDisplay: v => <shown value>`  (stored → displayed; default identity)
- `fromDisplay: d => <stored value>`  (displayed → stored; default identity)

Apply them at exactly these points in `buildSliders` / `syncControls`:
- Initial `range.value` and `edit.value`: use `toDisplay(state[p.key])`.
- range `input` handler: `state[p.key] = fromDisplay(parseFloat(e.target.value))` (keep the
  existing clamp on the STORED value via p.min/p.max — see §4 note on range bounds).
- edit-box `commit`: `raw = fromDisplay(parse(parseFloat(edit.value)))`, clamp stored, then set
  `range.value = toDisplay(state[p.key])`, `edit.value = editFmt(state[p.key]-in-display)`.
- `syncControls` (wherever it pushes state back to the DOM controls): use `toDisplay`.
- `fmt`: for the theta slider, `fmt` should format the DISPLAYED value (1 − θ), since the readout
  shows credibility. Simplest: keep `fmt: v => v.toFixed(2)` but feed it the displayed value.

For a symmetric linear transform like 1 − θ, `toDisplay` and `fromDisplay` are the same function
(`v => 1 - v`), which keeps this trivially correct and involution-safe. Grep for every place
`state[p.key]` is read to build a control value or written from one, and route all of them through
the transform — miss one and the slider will desync (drag jumps, or the box and thumb disagree).

## 4. The theta slider def (on the corrected base, ~line 720)
Replace:
`{ key: 'theta', block: 'PC', label: 'Adaptiveness θ', min: 0, max: 1, step: 0.05, fmt: v => v.toFixed(2) },`
with:
`{ key: 'theta', block: 'PC', label: 'Max credibility', symbol: '(1−θ)', min: 0, max: 1, step: 0.05, fmt: v => v.toFixed(2), toDisplay: v => 1 - v, fromDisplay: d => 1 - d },`
- **Range bounds:** min/max are 0–1 and symmetric under 1−v, so the displayed range is also 0–1 —
  no bound recomputation needed. (If bounds were asymmetric this would need care; they aren't.)
- **The symbol "(1−θ)" must render as the hover-tooltip target.** The label "Max credibility" is
  plain text; the "(1−θ)" is the symbol chunk that `wrapSymbols`/the ctl-sym span turns into the
  hoverable element. Confirm the θ inside "(1−θ)" still matches SYMBOL_DEFS['θ'] so the black
  help-mode tooltip fires on it. If `wrapSymbols` only matches a bare `θ` token and not one inside
  "(1−θ)", adjust so the θ within the parenthetical is the tooltip anchor (e.g. keep the label as
  `Max credibility (1−<θ-as-symbol>)`), OR attach the tooltip to the whole "(1−θ)" symbol span.
  The REQUIREMENT: hovering the (1−θ) symbol shows the θ definition; no second/native tooltip.

## 5. Tooltip content (SYMBOL_DEFS['θ'], already corrected on the base — verify only)
The black help-mode tooltip should read (from the tooltip-fix already applied):
`adaptiveness of expectations (Blanchard θ); eq. 8.7; weight on last period's inflation; θ=1 fully
adaptive, θ=0 fully anchored`. That is correct as-is and explains θ even though the slider shows
(1−θ). Optionally prepend one clause so the relationship is explicit on hover:
`shown as Max credibility = 1 − θ; ` + existing text. Keep it one line.

## 6. Drill-box copy ("How credibility works", both copies — already rewritten on the base)
The base already describes θ as Blanchard's adaptive weight and credibility as a separate stock.
With this change, tighten the pairing to the ceiling×fill framing now that both sliders read as
credibility:
- "**Max credibility (1 − θ)** is the highest anchoring this central bank can reach — a structural
  property of how backward-looking expectations are (Blanchard's θ, shown here as its complement).
  **Current credibility** is how much of that ceiling is realised right now. Effective anchoring =
  Max credibility × Current credibility = (1 − θ) × cred."
Apply to BOTH copies (~lines 467 and ~1207 on the corrected base); grep to confirm two.

## 7. What must NOT change
- `s.theta` semantics or value — still Blanchard's θ; presets stay at their inverted values.
- Any solve()/step()/computeYn/nextCredibility line, the meter math `(1 − θ) × credibility`, or the
  golden-series numerics. This spec must not move a single computed value.
- The "Current credibility" slider (`cred`) — untouched.
- The de-anchoring toggle and credibility law of motion.

## 8. Invariants / verifier
- **Display round-trip:** for the theta slider, `fromDisplay(toDisplay(θ)) === θ` for θ ∈
  {0, 0.05, …, 1} (involution check). Add as a small assertion if the verifier can reach the slider
  defs; otherwise verify by hand in the browser (drag to a value, read the box, confirm stored θ =
  1 − shown via the debug dump).
- **No-numeric-change lock:** the existing INV-θ-NUMERIC golden-series assertion must still pass
  unchanged — proves this display change didn't perturb the engine. If it moves, something wrote
  through the transform into the math; STOP.
- Grep-lock: no `titleAttr` reintroduced (the native white tooltip must NOT come back); exactly one
  `toDisplay`/`fromDisplay` pair (on theta) unless other sliders adopt the hook later.
- Both verifiers green at current counts (58 / 111); mutation_check; HS-equivalent baseline check.
- **Browser check (required, this is UI):** the two expectation sliders now drag the SAME direction
  (both right = more anchored); the θ slider reads "Max credibility" with value (1−θ); hovering
  (1−θ) shows the θ definition in the black help tooltip; NO white native tooltip appears; dragging
  it updates effective anchoring correctly; presets 2a/2b still load and behave identically (their
  stored θ unchanged; the slider just now displays 1−θ). Screenshot both sliders side by side.

## 9. Done criteria
- [ ] Display-transform hook added to buildSliders/syncControls; all state[p.key]↔control
      boundaries routed through it; no desync on drag or edit-box entry.
- [ ] theta slider: label "Max credibility", symbol "(1−θ)", toDisplay/fromDisplay = 1−v.
- [ ] (1−θ) symbol is the hover anchor for the θ help tooltip; no native/white tooltip.
- [ ] Both drill copies use the Max×Current ceiling-fill framing.
- [ ] INV-θ-NUMERIC still green (no numeric drift); involution round-trip holds.
- [ ] Verifiers green (58/111); mutation_check; browser check with both sliders same-direction,
      screenshot attached.
- [ ] Full diff read by Malin before commit; confirm zero engine-math hunks.
