# Spec: Layout fix-up 3 — fit ALL charts to the viewport by measure-and-shrink (stop estimating)

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER`
**Type of change:** Layout/JS on `islm_pc_model_v19_Open_Economy_Complete_Demo.html`. **Eyeball-gated.** Corrects fix-up 2: the freeze works, but `fitCharts()` computes `--chart-h` too large, so with all dropdowns closed the bottom chart row falls below the fold. Keep the freeze; replace the fit calculation.

---

## 1. Goal (one sentence)

With every equation dropdown closed, all FOUR charts (both rows) **plus** the readout bar are fully visible in the viewport with no scrollbar; the chart height stays frozen when a dropdown opens (unchanged from fix-up 2).

## 2. Root cause to fix

`fitCharts()` estimates available height by subtracting the readout and gaps, but each chart-box also carries a title, a subtitle, a legend row, and the dropdown-toggle bar — across two rows. Those aren't being subtracted, so `--chart-h` comes out too tall and the second row overflows below the viewport. Estimating each piece is the thing that has now failed twice. Don't estimate — **measure the overflow and shrink until it's gone.**

(Also confirm the closed state is actually clamped — see §3.1. If the container's height is natural/auto when closed, nothing forces a fit and charts will be too big regardless of the calc.)

## 3. Required mechanism (prescriptive)

### 3.1 Closed state must be clamped
With no `.eq-box.open`: the app stays `overflow: hidden`, and the scroll container `#right-col` has a **bounded** height (its flex track in the fixed-height column) so that `#right-col.scrollHeight > #right-col.clientHeight` is meaningful — i.e. content taller than the box overflows rather than growing the box. (When `.eq-open` is present, keep fix-up 2's behaviour: `overflow-y: auto`, height auto, scroll.)

### 3.2 Replace `fitCharts()` with measure-and-shrink
```
function fitCharts() {
  if (typeof document === 'undefined' || !document.querySelector) return;   // headless guard
  if (document.querySelector('.eq-box.open')) return;                       // never recompute while open
  const col = document.getElementById('right-col');
  if (!col) return;
  let h = 260;                          // optimistic upper bound (px)
  col.style.setProperty('--chart-h', h + 'px');   // or set on :root — wherever the SVGs read it
  let guard = 0;
  // shrink until the column no longer overflows its clamped height
  while (col.scrollHeight > col.clientHeight && h > 120 && guard < 60) {
    h -= 4; guard++;
    col.style.setProperty('--chart-h', h + 'px');
  }
}
```
- Run it on load **after layout has settled** — call inside a `requestAnimationFrame` (or after the first `render()`), not synchronously before the DOM/readout exist.
- Run it on `window` resize.
- The loop reads `scrollHeight`/`clientHeight` each pass; that forces reflows, which is fine here (≤60 small steps, one-off on load/resize).
- It self-corrects for all chrome (titles, subs, legends, toggle bars) and for the 2-row vs stacked reflow, because it shrinks until the *actual* content fits the *actual* box.

### 3.3 Freeze on open — unchanged from fix-up 2
`toggleEq()`: any dropdown open → add `.eq-open`, switch to scroll + natural height, do NOT call `fitCharts()`. All closed → remove `.eq-open`, restore the clamp, then call `fitCharts()`.

## 4. What must NOT change

- `solve()`, economics, equation content, chart math — untouched. `verify_v16` 22/0, `verify_v19` 30/0.
- Slice-1 layer + existing `verify_onboarding.mjs` checks (incl. readout-before-charts) — green.
- Readout stays above the charts. SVG height still read from the frozen `--chart-h` variable; do not reintroduce a flex/`height:100%` coupling.

## 5. The check(s)

Render-time fit is eyeball-gated; keep the existing static DOM-order check. **Decisive eyeball criteria:**
1. **All dropdowns closed: all four charts (top AND bottom row) and the readout are fully visible, no scrollbar.** This is the one that's failing now — verify the Phillips curve and Dynamics charts are fully on-screen, not cut off.
2. Open the IS-MP dropdown: its graph height is unchanged (devtools: identical `#ismp` SVG pixel height); the page scrolls; dropdown reachable.
3. Same-row neighbour doesn't move or resize on open.
4. Open several: still no resize; scrolls further.
5. Close all: snaps back to the all-four-visible fit, no scroll.
6. Resize / narrow reflow: re-fits, all charts visible; 1–5 hold.

## 6. Done criteria

- [ ] `verify_onboarding.mjs` green; `verify_v16` 22/0, `verify_v19` 30/0 unchanged.
- [ ] Criterion #1 confirmed: **all four charts + readout fit with no scroll when closed.** And #2 confirmed in devtools (frozen height on open).
- [ ] Committed: `git add -A ; git commit -m "Layout fix-up 3: measure-and-shrink fit so all charts fit closed; freeze on open"`.

## Guardrails / out of scope

- Layout only — no engine/economics/equation changes.
- `--chart-h` is set ONLY by `fitCharts()`, and `fitCharts()` runs ONLY when no dropdown is open.
- Do not estimate chrome sizes — use the measure-and-shrink loop so the fit is exact.
- Do not widen/weaken any existing assertion.
