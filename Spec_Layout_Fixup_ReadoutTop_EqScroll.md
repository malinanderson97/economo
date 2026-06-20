# Spec: Layout fix-up — readout above charts; equation dropdowns scroll instead of shrinking graphs

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER`
**Type of change:** Layout/CSS + small DOM reorder on `islm_pc_model_v19_Open_Economy_Complete_Demo.html`. **Eyeball-gated** (no engine, no economics, no equation-content change). Do this BEFORE Slice 2 so the Slice 2 browser check is judged on a clean layout.
**Why now:** Slice 2's acceptance involves opening the equation dropdowns to watch the equations grow — which is exactly what triggers the shrink bug today. Fix the layout first.

---

## §0 — One decision to confirm (Malin)

- **S1 — readout when scrolling.** Once a dropdown is open and the page scrolls, should the readout (now at the top) **scroll away** with the page, or stay **pinned** (sticky) at the top? *Recommended: scroll away (simplest; the readout's exact value is most useful in the default fit view anyway).* Sticky is a small add if you'd rather keep numbers visible while reading equations.

---

## 1. Goal (one sentence)

By default the viewport fits all four graphs plus the readout with no scrolling; opening any "Show the equations" dropdown keeps every graph at full size and makes the page scroll instead of shrinking the graphs; and the readout sits above the graph area rather than below it.

## 2. Which model / where

- `islm_pc_model_v19_Open_Economy_Complete_Demo.html` only.
- The right-column layout: `.panel.charts` (2×2 grid of `.chart-box`, each with a `.chart-wrap` SVG and an inner `.eq-box` dropdown), and `#readout`. The clamp that makes charts fit the viewport.
- `toggleEq(boxId)` (adds/removes `.eq-box.open`) — may need a hook so the layout can react to "any dropdown open."
- NOT `solve()`, NOT `drawEquations` content, NOT the chart-drawing math.

## 3. Behaviour required

1. **Default state (no `.eq-box.open` anywhere):** the readout + all four graphs fit the viewport with no vertical scrollbar — the current responsive fit, preserved.
2. **Readout position:** `#readout` renders **above** `.panel.charts` (top of the right column, below any top controls/stepper), not below it. Same single horizontal stat bar, just relocated.
3. **Any dropdown open:** the graphs keep their default (fit) size — they must NOT shrink. The opened dropdown's content extends the document height and the page becomes scrollable so the equations are reachable. Applies whether one or several dropdowns are open.
4. **All dropdowns closed again:** returns to the exact-fit, no-scroll state.
5. **Narrow viewport:** the existing reflow to a single column still works; the fit-vs-scroll behaviour above holds at that width too.

*Implementation hint (not prescription — your call):* the simplest route is to keep the "fit to viewport" height clamp only while no `.eq-box` is open, and release it (natural height + normal page scroll) as soon as any dropdown opens — e.g. a class on a container that `toggleEq` sets/clears based on whether any `.eq-box.open` exists, switching the charts area from a viewport-clamped height to its natural height.

## 4. What must NOT change

- Engine, economics, equation content, chart math, and both engine verifiers (`verify_v16` 22/0, `verify_v19` 30/0) — untouched.
- The Slice-1 lock/grey layer and all existing `verify_onboarding.mjs` checks — still green.
- Equation dropdown *contents* and the `toggleEq` open/close semantics — unchanged (only the layout's reaction to "open" changes).

## 5. The check(s)

Layout sizing/scroll is not headless-checkable — it is gated by your eyes against the concrete criteria below. One cheap structural regression guard *is* checkable and should be added:

- **Static (append to `verify_onboarding.mjs`):** `#readout` appears before `.panel charts` in the document source (DOM order), so a future change can't silently move it back below the charts.
- **Eyeball acceptance (browser):**
  1. On load: no vertical scrollbar; all four graphs + readout visible and fitting.
  2. Readout is above the graphs.
  3. Open one equation dropdown → no graph shrinks; page scrolls; dropdown content reachable.
  4. Open several dropdowns → still no shrink; page scrolls further.
  5. Close all → back to exact fit, no scroll.
  6. Resize narrow → reflows to one column; 1–5 still hold.

## 6. Done criteria

- [ ] `verify_onboarding.mjs` green (existing checks + the new readout-before-charts static check); `verify_v16` 22/0 and `verify_v19` 30/0 unchanged.
- [ ] All six eyeball criteria in §5 pass in the browser.
- [ ] Committed: `git add -A && git commit -m "Layout fix-up: readout above charts; eq dropdowns scroll, no graph shrink"`.

## Guardrails / out of scope

- No engine/economics/equation-content changes; layout only.
- Do not change `toggleEq`'s open/close behaviour, only the layout's response to it.
- Do not widen or weaken any existing assertion. If the readout-order check can't be added cleanly, report it rather than skipping silently.
