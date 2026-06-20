# Spec: Slice 1 — fix-up 5 (output-box overflow + dead MP handle)

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html`
**Type of change:** One CSS fix (readout box) + one interaction-bug diagnosis & fix (MP drag handle). Do **not** change the economics engine, the verifiers, or the UIP/PC/IS handle logic.

---

## Bug 1 — Output box grows/reflows when the gap delta is positive

In the readout, the `Output Y` stat's `delta` is `gap +0.00%` (or `gap -x%`). When the gap turns positive (or the string gets longer), the delta wraps to a new line below the value, making that box taller and reflowing the whole page.

### Fix
Make the readout stat boxes height-stable regardless of delta content:
- The `.delta` is currently inline with `margin-left: 4px` and wraps. Make each stat's value+delta not force a height change: e.g. give `.stat .value` / `.stat .delta` a layout that keeps them on a predictable number of lines, or `white-space: nowrap` on the delta with the box allowed to be a touch wider, OR put the delta on its own reserved line that exists whether or not there's content (so an empty vs filled delta is the same height).
- The key requirement: **a stat box is the same height whether its delta is empty, short, or longer like `gap +1.23%`.** No reflow of the page when a value crosses zero.
- Don't let one box's growth resize others — they're `flex: 1 1 0`, so a taller delta in one currently bumps the row. Reserve consistent vertical space for the delta line in all boxes.

Verify in-browser: change G/T so the output gap goes from negative to positive and back — no box should change height, no page reflow.

---

## Bug 2 — MP drag handle is dead to the mouse (no response)

### Symptoms (confirmed by the user)
- The MP handle does not respond to the mouse at all (not "snaps back" — fully dead).
- Happens **even with all blocks unlocked**, and regardless of whether the Taylor rule is on or off. So this is NOT a Taylor-state bug and NOT explained by the lock layer (it fails when nothing is locked).

### What is already confirmed (do NOT re-investigate these — they are fine)
- `HANDLES.mp` exists and its logic is correct (`sets i_target`; if `!taylor_on` also sets `state.i`).
- The MP handle is drawn with `data-handle="mp"` (in `drawISMP`).
- The pointer dispatch (`svg.addEventListener('pointerdown', …)` → reads `data-handle` → `HANDLES[type]`) is generic and works for the IS handle in the same chart.
- `render()` calls `drawISMP()` (which does `svg.innerHTML=''` and redraws handles) and THEN `renderTutorial()` — so ordering is correct; the tutorial re-applies after redraw.

### The likely cause (instrument this in the LIVE DOM)
The MP handle is probably receiving `pointer-events: none` at runtime — either the `.locked` class is being applied to it (or an ancestor `<g>`/SVG) even when ISLM is unlocked, or the IS handle/curve is drawn ON TOP of the MP handle and intercepting the pointer. Note both the IS and MP handles live in the same `#ismp` SVG, and at the baseline the MP line (i=3%) and the IS curve cross near the MP handle's x-position — so the IS handle or the IS curve path may be sitting over the MP handle and eating the click.

### What to do
1. **Instrument it live.** With all blocks unlocked, inspect the MP handle element at runtime: does it have the `.locked` class? What is its computed `pointer-events`? Is another element (IS handle, a curve path, an overlay rect) on top of it at that pixel? Report what you find before fixing.
2. **Fix based on the finding:**
   - If it's `pointer-events: none` wrongly applied → ensure the MP handle is not locked when ISLM is unlocked (check the `setLocked('… .handle[data-handle="mp"]', islmOn)` line actually evaluates `islmOn` true when ISLM is unlocked, and that `.locked` isn't stuck from a stale pre-redraw state).
   - If it's a z-order / overlap problem → ensure the handles are drawn AFTER the curves and that the MP handle isn't underneath the IS handle/curve (draw order, or raise the handle, or give handles a larger hit target). Handles should be the topmost, pointer-receiving elements in the chart.
3. Confirm the IS handle still works after the fix (don't fix MP by breaking IS — they share the chart).

### Also worth checking while here (report, don't necessarily change)
The lock mapping has the **IS** handle gated to `goodsOn` and the **MP** handle to `islmOn`. Confirm that's intended: the IS curve is goods-market (step 1, GOODS) so its handle unlocking at GOODS is fine; the MP handle unlocking at ISLM (step 2) is fine. Just confirm neither is accidentally cross-wired.

---

## Acceptance check (report this back)

- Browser, Bug 1: drive the output gap positive and negative — no box height change, no page reflow.
- Browser, Bug 2: report what was actually wrong with the MP handle (the live-DOM finding), then show it now drags (with Taylor on: sets i_target, curve responds per the rule; with Taylor off: moves the MP line and it stays). Confirm the IS handle still drags too.
- All three verifiers still green.

## Guardrails / out of scope
- Do **not** change the economics engine, `solve`/`step`, or the Taylor logic.
- Do **not** change the UIP/PC handle logic.
- Do **not** touch the verifiers.
- Do **not** "fix" the MP handle by removing its lock gating entirely — it must still be locked before ISLM unlocks; the fix is to make it live WHEN ISLM is unlocked.
- Report the live-DOM diagnosis before applying the fix, so the cause is understood, not patched blindly.
