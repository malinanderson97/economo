# Spec: Slice 1 — fix-up 4c (charts must leave room for the readout bar)

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html`
**Type of change:** CSS only. Do **not** touch chart JS, SVG `viewBox`, drawing constants, handle math, or any verifier.

---

## Background / the actual problem

The charts fit, but the **readout bar** below them (`<div class="readout" id="readout">` — Output Y, Nominal i, Real r, Inflation π, Nominal E, Real ε, Price P, Primary T−G, Debt B/Y) is pushed off the bottom of the screen. The user needs the four charts AND the full readout bar visible at once, no page scroll.

### Why it's happening (structure confirmed)

```
#right-col
  .panel.charts   ← 2×2 chart grid; a previous fix gave it height:100%
  .readout        ← stats bar, sibling BELOW the charts
```

The charts were set to `height: 100%` of `#right-col`, so they consume the entire column height and leave nothing for `.readout`, which overflows off-screen. The charts aren't individually too big — they're taking the readout's space.

`#right-col` is inside `.layout` (`flex: 1 1 auto; min-height: 0`), which is inside `body` (`display:flex; flex-direction:column; overflow:hidden`). So the column already has a bounded height to divide — it just isn't dividing it between charts and readout.

---

## What to do

### 1. Make `#right-col` a flex column that splits height between charts and readout

- `#right-col { display: flex; flex-direction: column; min-height: 0; }` (it must pass its bounded height down and allow children to shrink).

### 2. Charts take leftover space; readout takes its natural height

- `.charts` (the `.panel.charts`): replace `height: 100%` with `flex: 1 1 auto; min-height: 0;` — it takes whatever height is left AFTER the readout, and is allowed to shrink.
- `.readout`: `flex: 0 0 auto;` — it takes exactly its content height and is never shrunk away or pushed off. Keep its `flex-wrap: wrap`.

### 3. Keep the chart cells able to shrink

- `.chart-box { min-height: 0; }` and the chart grid rows (`grid-template-rows: 1fr 1fr`) stay — so as the charts area gets shorter (because the readout reserves its row), the four charts shrink to fit rather than overflow.

### 4. Handle the readout wrapping (it has 9 items)

On narrower widths the readout wraps to 2 rows, which is taller. That's fine as long as the charts shrink to accommodate — because `.readout` is `flex: 0 0 auto` it gets its (taller) height and `.charts` takes the remainder. Just confirm this composes (no overflow when the readout is on two rows).

### 5. Re-confirm the ε sentence deletion

While here: verify the time-series chart `.sub` no longer contains "Watch ε (real exchange rate) appreciate after a shock, then revert as prices and the nominal rate adjust." If it's still present, remove it (leave the rest of that `.sub`).

### 6. Give the Taylor-rule info its own readout box

Currently the `Nominal i` stat crams the Taylor status into its `delta` (`taylorStatus = state.taylor_on ? 'Taylor ON φ=…' : 'Taylor OFF'`). When Taylor is on, that string wraps to a second line, making the Nominal i box TALLER than the others — visually inconsistent. Split it:

- **`Nominal i`**: its `delta` should be `eq.zlb_active ? 'ZLB binds' : 'i*'` (or simply empty when not at the ZLB). The ZLB note stays here because it's genuinely about the nominal rate being pinned at the floor. The Taylor on/off/φ info LEAVES this box.
- **New stat box `Policy rule`** (insert immediately AFTER `Nominal i` in the `stats` array): `value` = `Taylor ON` or `Taylor OFF` (from `state.taylor_on`); `delta` = `φ=${state.phi.toFixed(1)}` when on, empty when off. This is a normal `.stat`, so it has equal height to the others.

This is the readout that now has **10** items. Confirm the readout still fits per task 2 (it's `flex-wrap: wrap`, so an extra item just wraps; the charts shrink to keep everything on screen). Do not change any other stat. Do not change the economics — `taylor_on`/`phi` are read, not modified.

---

## Acceptance check (report this back)

- Browser, normal desktop: all four charts AND the entire readout bar (all 9 stats) visible at once, no page scroll.
- Drag the window shorter: charts shrink; the readout bar stays fully visible (it's the charts that give up space, not the readout).
- Narrow window: reflow still works; if the readout wraps to two rows, nothing overflows off-screen (charts shrink to compensate) — or the column scrolls gracefully on very small screens.
- Drag handles (IS/MP/UIP/PC) still work.
- All three verifiers still green.
- Confirm the ε sentence is gone.
- Browser: the `Nominal i` box is the same height as the others whether Taylor is ON or OFF (no second-line wrap), and a separate `Policy rule` box shows the Taylor status next to it. Toggle the Taylor switch (after PC unlocks) and confirm the Policy-rule box updates and no box changes height.

## Guardrails / out of scope

- Do **not** give `.charts` a fixed or `100%` height again — it must be `flex: 1 1 auto` so the readout gets its space.
- Do **not** reintroduce `aspect-ratio`/`max-height` width-driven sizing on the SVGs.
- Do **not** touch chart JS, viewBox, drawing constants, handle math, verifiers, or the engine.
- Do **not** restyle colours/typography — sizing only.
