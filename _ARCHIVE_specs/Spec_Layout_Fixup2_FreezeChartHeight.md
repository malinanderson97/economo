# Spec: Layout fix-up 2 — freeze chart height so equation dropdowns never resize the graphs

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER`
**Type of change:** Layout/CSS + small JS on `islm_pc_model_v19_Open_Economy_Complete_Demo.html`. **Eyeball-gated.** Corrects the previous layout fix-up, which left chart height coupled to available vertical space, so opening an equation dropdown still shrank the graph instead of scrolling the page.
**Prerequisite already done:** the readout is now above the charts (keep it). This spec is a second fix-up commit on top of that.

---

## 1. Goal (one sentence)

Each chart SVG renders at the **exact same pixel height whether its equation dropdown is open or closed**; with all dropdowns closed the readout + four graphs fit the viewport with no scroll; opening any dropdown makes the page scroll, never resizes any graph.

## 2. Root cause to fix

The chart height is currently space-driven: the app container clamps to the viewport (`overflow: hidden`, flex column), the charts grid distributes the remaining height across rows, and the SVG fills the leftover space in its cell. When a dropdown opens inside a chart-box, the cell's leftover space shrinks, so the SVG shrinks. Switching the container to `height: auto` on open is not enough on its own, because the SVG height is still recomputed from the (now different) layout.

**The chart height must stop depending on vertical space.** Make it a definite, frozen length.

## 3. Required mechanism (prescriptive — the behavioural-only version was misimplemented)

1. **Definite chart height via a CSS variable.** Introduce `--chart-h` (on `#right-col` or `:root`). The chart SVG uses `width: 100%; height: var(--chart-h);` — remove the fixed `height: 200px` and any rule that ties SVG height to flex/grid leftover space or `height: 100%` of the cell. The `viewBox="0 0 360 220"` scales the drawing to the box (letterboxing is fine).
2. **`fitCharts()` — compute the fit, only when nothing is open.** A function that, when **no** `.eq-box.open` exists, measures the room available in `#right-col` (its height minus the readout bar, minus per-chart title + dropdown-toggle bar + gaps, divided by the number of grid rows in the current reflow — 2 wide, 4 when stacked) and sets `--chart-h` to that, clamped to a sensible floor (e.g. `Math.max(140, computed)`). Call it on load and on `window` resize — but **return early / do nothing if any dropdown is open** (never recompute while open).
3. **`toggleEq()` — switch the page mode, never the height.** After toggling a box, check whether any `.eq-box.open` remains:
   - **Any open:** add a class (e.g. `.eq-open` on `#right-col`/app); switch the scroll container to `overflow-y: auto`; release the viewport clamp so the content grows to natural height (`height: auto`, and `flex: 0 0 auto` on the grid container if it was `flex: 1 1 auto`). **Do NOT call `fitCharts()`** — `--chart-h` stays frozen at its closed-state value.
   - **None open:** remove `.eq-open`; restore `overflow: hidden` and the viewport clamp; **then call `fitCharts()`** to re-fit.
4. **Keep the closed-state neighbour top-aligned.** Set the charts grid cells to `align-items: start` (or `align-content: start`) so a short closed cell next to a tall open one stays at the top rather than centring in the tall row (the "graph sitting lower" artefact).

Net effect: `--chart-h` is identical open vs closed, so every SVG is the same height always; an open dropdown only adds height *below* its (fixed-height) SVG, and that extra height is absorbed by page scroll.

## 4. What must NOT change

- `solve()`, economics, equation content, chart-drawing math — untouched. `verify_v16.mjs` 22/0, `verify_v19.mjs` 30/0 unchanged.
- Slice-1 lock/grey layer and all existing `verify_onboarding.mjs` checks (incl. the readout-before-charts check) — still green.
- Readout stays above the charts. `toggleEq`'s open/close semantics unchanged — only the layout response and the fit logic are added.

## 5. The check(s)

Pixel height is render-time, so the core claim is eyeball-gated; keep the existing static DOM-order check. Optional cheap guard: assert the SVG height rule references `var(--chart-h)` (not a flex/`100%` coupling), so a regression to space-driven height is caught statically — add it only if it greps cleanly, else skip and say so.

**Eyeball acceptance (the decisive ones):**
1. All dropdowns closed: readout + 4 graphs fit the viewport, no scrollbar; graphs a sensible size (not squashed).
2. Open the IS-MP dropdown: the IS-MP graph's height is **unchanged** (check with devtools — the `#ismp` SVG's rendered height is identical to step 1); the page now scrolls; the dropdown content is reachable.
3. The same-row neighbour (UIP) does not move or resize when you open IS-MP; it stays top-aligned at its original height.
4. Open several dropdowns: still no graph resizes; page scrolls further.
5. Close all: snaps back to the exact fit, no scroll, graphs back to the fitted size.
6. Resize the window (closed state): graphs re-fit; reflow to one column at narrow width still works; 1–5 hold at that width.

## 6. Done criteria

- [ ] `verify_onboarding.mjs` green (existing checks; + optional static guard if clean); `verify_v16` 22/0, `verify_v19` 30/0 unchanged.
- [ ] All six eyeball criteria pass — especially #2 and #3 verified in devtools (identical SVG pixel height open vs closed).
- [ ] Committed: `git add -A ; git commit -m "Layout fix-up 2: freeze chart height; eq dropdowns scroll without resizing graphs"`.

## Guardrails / out of scope

- Layout only — no engine/economics/equation-content changes.
- `--chart-h` must never be recomputed while any dropdown is open; that freeze is the whole fix.
- Do not reintroduce a flex/`height:100%` coupling for the SVG; height is the frozen variable.
- Do not widen or weaken any existing assertion.
