# Spec: Slice 1 — fix-up 4b (CORRECTED responsive layout — fit the viewport)

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html`
**Type of change:** CSS only. Corrects the previous responsive attempt, which made the charts BIGGER. Do **not** touch the chart-drawing JS, the SVG `viewBox`, the `W=360/H=220` constants, the handle math, or any verifier.

---

## Background / why the previous attempt failed

The prior change set `svg { height: auto; aspect-ratio: 360/220; max-height: 38vh; width: 100% }`. This is a **width-driven** height: on a wide desktop each chart column is ~700px wide, so `aspect-ratio` forces each chart to ~430px tall — bigger than the original 200px. With four charts in a 2×2 grid that is ~two rows of very tall charts plus headers/subs/equation-bars, so the tool overflows the screen badly. Confirmed in-browser: charts are larger than before and do not fit.

**The page is already built to fit the viewport** and that infrastructure must be used, not fought:
- `html, body { height: 100% }`
- `body { display: flex; flex-direction: column; overflow: hidden }`
- `.layout { flex: 1 1 auto; min-height: 0 }` (the row that should consume leftover height)
- the charts column already has `overflow-y: auto; min-height: 0`

The ONLY original problem was `svg { height: 200px }` being slightly too tall for two rows. The correct fix is a **height-driven** layout: the charts area fills the leftover vertical space and divides it between the two rows; each SVG fills its cell. The viewBox then scales the drawing to fit (distortion is acceptable for these charts; or use `preserveAspectRatio="xMidYMid meet"` to letterbox instead).

---

## What to do

### 1. Revert the broken SVG sizing

Remove `aspect-ratio: 360/220`, `max-height: 38vh`, and `height: auto` from the `svg` rule. The SVG should fill its chart cell, not size itself from its width.

### 2. Make the charts grid fill the available height and share it between rows

- `.charts` should be a grid that occupies the height its parent gives it and splits it into two equal rows on desktop:
  - `grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;`
  - make it fill its container's height: `height: 100%` (and ensure its parent — the charts column — passes height down: it already has `min-height: 0` and `overflow-y: auto`).
- Each `.chart-box` must be allowed to shrink: `min-height: 0;` (critical — without it, grid/flex children refuse to shrink below content size and overflow returns).

### 3. Make each SVG fill its cell

- `svg { width: 100%; height: 100%; display: block; touch-action: none; }`
- The `.chart-wrap` (SVG's direct parent) should fill the space left in the chart-box after the title/sub: give it `flex: 1 1 auto; min-height: 0;` and make `.chart-box` a `display: flex; flex-direction: column;` so title + sub + wrap stack and the wrap takes the remainder.

### 4. The goal, stated as the test

At a normal desktop window the entire tool — header, controls, all four charts, equation bars — fits with **no page scroll** (`body` is already `overflow: hidden`). On a SHORT window, the charts shrink (they share less vertical space) rather than overflow. The charts must get SMALLER as the window gets shorter, never larger.

### 5. Keep the narrow-screen reflow

The `@media (max-width: 850px)` reflow to a single column is fine to keep — but on narrow/stacked layout, allow vertical scrolling of the charts column (since four stacked charts won't fit a phone height). On wide desktop, no-scroll fit is the target. State how you handled the stacked case (likely: in the media query, let `.charts` be `grid-template-rows: none` / auto rows and allow the column to scroll).

---

## Acceptance check (report this back)

- Browser, normal desktop: the whole tool fits with no page scroll; all four charts visible and reasonably sized.
- Browser, drag the window SHORTER: charts shrink to stay fitted; they never grow.
- Browser, narrow window: reflows to one column (scrolling allowed there).
- Drag each chart's handle (IS, MP, UIP, PC) at a couple of sizes — still works (viewBox keeps coords fixed).
- All three verifiers still green.

## Guardrails / out of scope

- Do **not** reintroduce `aspect-ratio` or width-driven height on the SVGs — that was the bug.
- Do **not** touch chart JS, viewBox, drawing constants, or handle math.
- Do **not** touch any verifier or the engine.
- Do **not** restyle colours/typography — sizing only.
- If after this the charts look slightly distorted (wider than tall), that is acceptable; if you prefer, add `preserveAspectRatio="xMidYMid meet"` to the SVGs to letterbox instead — but do NOT change the viewBox numbers.
