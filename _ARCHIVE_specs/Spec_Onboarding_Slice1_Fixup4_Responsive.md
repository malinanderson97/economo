# Spec: Slice 1 — fix-up 4 (responsive chart sizing + text removal)

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html`
**Type of change:** CSS/layout only (responsive sizing + reflow) plus one text deletion. Do **not** touch the economics engine, the chart-drawing JS, the SVG `viewBox` values, the drag-handle coordinate math, or any verifier.

---

## Background / why

The chart section is too big and overflows on smaller screens. The SVGs already use `viewBox="0 0 360 220"` with internal drawing coordinates fixed at `W=360, H=220`, so they scale to their container automatically — the problem is purely the CSS container sizing: `svg { height: 200px }` is a fixed height, and the 2×2 grid doesn't reflow. The fix is CSS only. **Because the SVGs use a viewBox, the internal coordinate system never changes — so the drag handles keep working without any JS change. Do not touch the drawing code or handle math.**

## Two requirements

1. **Fit any screen.** The whole tool should size down so the chart section is never too big for the viewport — on a short screen the charts shrink rather than overflow.
2. **Reflow when narrow.** On a narrow window (e.g. half-screen / tablet width), the four charts reflow from the 2×2 grid to a single stacked column. On wide screens, keep 2×2.

---

## What to do

### 1. Make chart height flexible, not fixed

Replace the fixed `svg { height: 200px }` with a flexible sizing approach that keeps the SVG's aspect ratio (the viewBox is 360×220 ≈ 1.64:1) and lets the chart scale with available space. Options (pick the one that composes cleanly with the existing grid):
- Give the SVG (or its `.chart-wrap`) an `aspect-ratio: 360 / 220` and `width: 100%`, dropping the fixed pixel height, OR
- Use viewport-relative or container-relative sizing so the charts shrink on short screens.
The goal: on a short viewport the charts get smaller; they never force the page to overflow.

### 2. Responsive grid reflow

The charts grid is currently `.charts { grid-template-columns: 1fr 1fr }`. Add a media query (or use `repeat(auto-fit, minmax(...))`) so that below a sensible narrow breakpoint it becomes a single column (`1fr`), and at wider widths stays 2×2. Pick a breakpoint that looks right; state what you chose.

### 3. Keep the whole layout fitting

The outer `.layout` is `grid-template-columns: 280px 1fr` (left control panel + charts). Ensure that on narrow screens this also degrades gracefully (e.g. control panel and charts stack, or the panel stays usable) so nothing is cut off. Minimal change — don't redesign the panel, just make sure it doesn't overflow.

### 4. Remove the ε sentence

In the time-series chart description (line ~409, the `.sub` under the "dynamics over time" chart), delete this sentence:
> Watch ε (real exchange rate) appreciate after a shock, then revert as prices and the nominal rate adjust.
Leave the rest of that `.sub` (the "Y, i, π, P, ε, B/Y across periods." part) intact.

---

## Acceptance check (report this back)

- Browser: at a normal desktop size, charts are 2×2 and fit without overflow. Shrink the window short — charts shrink, no vertical overflow of the tool. Narrow the window — charts reflow to a single column. State the breakpoint chosen.
- Confirm the drag handles still work after resizing (drag IS, MP, UIP, PC handles at a couple of window sizes) — they should, because the viewBox keeps internal coords fixed, but verify since resizing is the change.
- Confirm the ε sentence is gone and the rest of that description remains.
- `node verify_onboarding.mjs`, `verify_v16.mjs`, `verify_v19.mjs` all still green (this change shouldn't affect any of them).

## Guardrails / out of scope

- Do **not** change the SVG `viewBox`, the `W=360, H=220` drawing constants, or any `xScale`/`yScale`/`xInverse`/`yInverse` / handle math. This is container CSS only.
- Do **not** touch the economics engine or any verifier logic.
- Do **not** do the UIP axis transpose here — that is a separate spec.
- Do **not** restyle beyond what responsiveness requires (no colour/typography redesign — that's a later phase).
