# Spec: UIP diagram — transpose axes (exchange rate on x, interest rate on y)

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` and `verify_onboarding.mjs`
**Type of change:** Correctness fix to the UIP chart's axis orientation. This touches the UIP drawing function AND its drag handler — both must change together. Do **not** touch the economics engine (`solve`, `step`, the UIP relation itself), the other charts, or the engine verifiers.

---

## Background / why

The UIP diagram currently plots **interest rate `i` on the x-axis and exchange rate `E` on the y-axis** (`opts_uip` has `xLabel: 'interest rate i', yLabel: 'exchange rate E'`). This is the wrong orientation for Blanchard's interest-parity figure (Ch. 19), which puts the **exchange rate on the horizontal axis and the domestic interest rate on the vertical axis**. The project's hard constraint is fidelity to Blanchard's diagrams, so this is a correctness fix, not a style choice.

**Target orientation: exchange rate `E` on the x-axis, interest rate `i` on the y-axis.**

The underlying economics does NOT change — the UIP relation stays `E = Eᵉ(1+i)/(1+i*)`. Only how it's drawn (and dragged) changes. Transpose faithfully: keep whatever slope direction follows from that existing relation; do not invent or reverse a slope.

## What currently exists (in `drawUIP`, ~line 929, and `HANDLES.uip`, ~line 974)

- `opts_uip`: `xMin/xMax = -0.02/0.15` (i range), `yMin/yMax = 0.70/1.30` (E range), `xLabel = 'interest rate i'`, `yLabel = 'exchange rate E'`, x ticks are rates, y ticks are exchange rates.
- The `i*` reference line is drawn **vertically** at `x = i*`.
- The UIP curve and the ε curve are built as `(i, E)` points by looping over `i`.
- The equilibrium point is plotted at `(eq.i, eq.E)`.
- The drag handle sits at `x = 0.06` (an `i` value); `HANDLES.uip` reads `new_i = xInverse(sx)`, `new_E = yInverse(sy)`, then solves `new_E_e = new_E*(1+i*)/(1+new_i)`.

The scale helpers (`xScale`, `yScale`, `xInverse`, `yInverse`) are generic and need NO change — they map data→pixels given the ranges in `opts`. The whole transpose is about what goes into `opts_uip` and how points/point/handle are constructed.

---

## What to do — transpose every axis-bound element together

### 1. Swap the axis ranges and labels in `opts_uip`

- `xMin/xMax` ← the **E** range (currently `0.70 / 1.30`); `xLabel: 'exchange rate E'`; x ticks ← the current E ticks; `xFmt` ← the current E formatter (`v => v.toFixed(2)`).
- `yMin/yMax` ← the **i** range (currently `-0.02 / 0.15`); `yLabel: 'interest rate i'`; y ticks ← the current i ticks; `yFmt` ← the current rate formatter (`v => (v*100).toFixed(0)+'%'`).

### 2. Transpose the curves to `(E, i)` points

The UIP and ε curves are currently `(i, E)`. Rebuild them as `(E, i)`:
- Loop over `i` across its range as now, compute `E = state.E_e*(1+i)/(1+state.i_star)` (and the ε variant), but **push `[E, i]`** (and `[eps, i]`) instead of `[i, E]`. The points are the same relation, just with coordinates swapped so they map onto the new axes. (Equivalently, re-parameterise by E and solve for i — either is fine as long as the plotted relation is unchanged and uses the new axis assignment.)
- Keep the two curve classes (`curve-uip`, `curve-eps`) and the UIP label.

### 3. Flip the `i*` reference line to horizontal

It is currently a vertical line at `x = i*`. It becomes a **horizontal** line at `y = i*` (spanning the x/E range). Move its label accordingly.

### 4. Transpose the equilibrium point

Currently `(eq.i, eq.E)`. Change to **`(eq.E, eq.i)`** so it maps onto the new axes.

### 5. Re-derive the drag handle AND its math (the critical part)

This is where a transpose silently breaks if done halfway. After the swap, **x is E and y is i**:
- Handle position: place it at a sensible E value on the curve (mirror of the current `x=0.06` choice, but now an E coordinate). Compute its `(E, i)` and map with `xScale(E)`, `yScale(i)`.
- `HANDLES.uip`: now `new_E = xInverse(sx, o)` and `new_i = yInverse(sy, o)` (swapped from current). Then re-derive the solve-back: the user is dragging to a new `(E, i)` and we recover the control variable. Currently the handle solves for `E_e`. Keep solving for `E_e` from the UIP relation: `E_e = E*(1+i*)/(1+i)` — using the new `new_E` and `new_i`. Clamp `E_e` to `[0.7, 1.3]` as now. `syncControls(); render();`
- **Verify by dragging:** after the change, grabbing the UIP handle and moving it must move the curve sensibly (not jump or invert). This is the manual check that proves the transpose is complete, since the headless verifier can't drag.

### 6. Update the chart's sub-description if it names the axes

If the UIP chart's `.sub` text or any on-chart label refers to the axes (e.g. "i on the horizontal"), update wording to match the new orientation.

---

## Verifier update (`verify_onboarding.mjs`) — pin the orientation so it can't regress

Add a static assertion (string-parse of the HTML, like the existing checks) on the UIP chart:
- Assert `opts_uip` declares `xLabel` as the exchange rate and `yLabel` as the interest rate (match on the label strings). FAIL if they are the other way round.
- Assert the equilibrium-point circle for the UIP chart maps E→x and i→y (i.e. the `cx` uses `xScale(eq.E…)` / `cy` uses `yScale(eq.i…)`), or, if that's hard to parse robustly, at minimum assert the axis labels. The point is: a future edit that flips the axes back must turn this red.

This makes the Blanchard-correct orientation an enforced invariant, not just a one-time fix.

---

## Acceptance check (report this back)

- Browser: the UIP chart shows exchange rate on the x-axis, interest rate on the y-axis; the `i*` line is horizontal; the equilibrium point sits correctly; the UIP and ε curves render in the right place.
- **Drag the UIP handle** at the new orientation — confirm it moves the curve sensibly and updates `E_e` (state). Report that you tested this.
- `node verify_onboarding.mjs` green, including the NEW orientation assertion (show it by name).
- `node verify_v16.mjs` and `node verify_v19.mjs` STILL green (engine untouched).

## Guardrails / out of scope

- Do **not** change the UIP relation `E = Eᵉ(1+i)/(1+i*)` or anything in `solve`/`step`. Economics is unchanged; only the diagram orientation and the handle's coordinate mapping change.
- Do **not** touch the other three charts (IS-MP, PC, time-series) or their handles.
- Do **not** change the scale helpers (`xScale`/`yScale`/`xInverse`/`yInverse`) — they are generic.
- Transpose the curve faithfully — keep the slope that follows from the existing relation; do not reverse it.
- Do **not** widen or weaken any assertion.
