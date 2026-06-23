# Spec — Onboarding Slice 3b: Live re-render of open drill-down graphs

**Status:** DRAFT (for Antigravity; Malin runs verifiers; Malin commits)
**Depends on (committed):** Slice 3 (`drawDrillIS`, `drawDrillMP`, `drawDrillPCChain`, `toggleDrill`, `advanceDrillPC`, the `.drill-container`/`.open` markup).
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` only. v16 out of scope.
**Verifier:** `verify_onboarding.mjs` — add assertions; do NOT weaken or edit existing ones.
**Agent guardrails:** Do NOT touch any `.docx`. Do NOT run `git`. Do NOT touch the economics engine (`solve`, `computeYn`, `isOutput`, `isRateForOutput`, coefficients). No new `state` fields, no new sliders, no new `paramDefs`/`shockDefs`/`dynamicsDefs`/`debtDefs` entries. Never use `Set-Content` on the HTML file.

---

## 0. Problem

The drill-down derivation graphs render only when opened (`toggleDrill`) or stepped (`advanceDrillPC`). They are **not** called from the main `render()` path. Consequence: with a drill open, dragging any slider re-renders the main charts but leaves the drill showing stale values — the derivation no longer matches the model it claims to derive. This is the exact failure mode the drill-downs were meant to prevent (a view that silently disagrees with the engine).

## 1. Desired behaviour

While a drill-down container is **open**, it re-renders on every parameter change, identically to the main charts. Drag `z_struct` with the PC chain open → uₙ shifts in graph (a), Yₙ moves in (b), the gap origin slides in (c), live. Close a drill → it stops re-rendering (no wasted work). Open state and PC-chain step position are preserved across re-renders.

## 2. Hard invariants (stated in advance)

- **INV-3b-1 (live redraw).** After any `render()`, every drill container currently carrying the `.open` class has been redrawn from current `state` — i.e. the SVG content reflects `solve(state)`/`computeYn(state)` as of this render, not the state at open-time. Assert: open a drill, mutate `state`, call `render()` (or the redraw helper), and confirm a state-dependent drawn coordinate (e.g. the Yₙ vertical x, the uₙ mark) equals the value computed from the *new* state to 1e-6.
- **INV-3b-2 (closed drills are not drawn).** A drill **without** `.open` is not redrawn by `render()`. Assert: a closed drill's SVG is untouched (no draw call) across a `render()`. (Prevents needless work and prevents a hidden drill from resurrecting.)
- **INV-3b-3 (PC step preserved).** A live redraw of the PC chain draws at the **current** `pcDrillStep`; it must NOT reset the step pointer and must NOT call `advanceDrillPC`. Assert: set the chain to step 1, mutate state, redraw, confirm step is still 1 and the inv #7 highlight is still on step 1's term (earlier terms black). This protects the Slice 3 step-by-step highlight.
- **INV-3b-RO (still read-only).** The redraw path introduces no `state` mutation and no change to `solve(state)`. (Re-assert the Slice 3 read-only property through the new render-driven path.) Assert: `state` and `solve(state)` deep-equal before vs after a `render()` with drills open.
- **No engine/surface growth.** Headless exports unchanged; no new state fields or defs (carry forward Slice 3's INV-S3-D — it must stay green).

## 3. Mechanism (how)

1. **A single redraw helper**, e.g. `redrawOpenDrills()`:
   ```
   function redrawOpenDrills() {
     if (document.getElementById('drill-is')?.classList.contains('open'))  drawDrillIS();
     if (document.getElementById('drill-mp')?.classList.contains('open'))  drawDrillMP();
     if (document.getElementById('drill-uip')?.classList.contains('open')) drawDrillUIP();   // if a UIP drill exists
     if (document.getElementById('drill-pc')?.classList.contains('open'))  drawDrillPCChain();
   }
   ```
   It calls the **existing** draw functions unchanged. `drawDrillPCChain()` already reads the module-level `pcDrillStep`, so calling it here redraws at the current step — satisfying INV-3b-3. Do NOT pass a step argument; do NOT reset the pointer.
2. **Call it once at the end of `render()`**, after the main charts are drawn. One line. This is the whole behavioural change.
3. **Gating by `.open` is the on/off switch** — no new state flag. The container's class is the single source of truth for "is this drill showing," set by the existing `toggleDrill`. Closed → helper skips it (INV-3b-2).
4. **Do not change `toggleDrill` or `advanceDrillPC`.** Open-time and step-time draws still happen as before; this slice only *adds* the render-time draw for already-open drills.

## 4. Verifier additions (`verify_onboarding.mjs`)

Use the existing `testRender` harness. The mock element's `classList` already supports `add`/`contains`; ensure the drill containers are reachable via the special-els/`getElementById` stub so `.open` can be toggled in-test.

- **INV-3b-1 live redraw.** Open the PC drill (set its container `.open`, set step to show graph (b)/(c)); record the drawn Yₙ x. `setState({ z_struct: 0.20 })`; call `render()` (or `redrawOpenDrills()` directly); re-read the drawn Yₙ x; assert it now equals `xScale(computeYn(state), oC)` for the new state, and differs from the pre-change value. BAD-fixture: a `redrawOpenDrills` that skips the PC branch → drawn Yₙ stays stale → caught.
- **INV-3b-2 closed not drawn.** Leave `drill-is` closed; clear its SVG children; call `render()`; assert its SVG children are still empty (no draw happened). BAD-fixture: helper that draws regardless of `.open` → caught.
- **INV-3b-3 step preserved.** Set PC chain to step 1; `setState` something; `render()`; assert `pcDrillStep === 1` (or however step is exposed) and the inv #7 highlight invariant still holds at step 1. BAD-fixture: redraw path that resets step to 0 → caught.
- **INV-3b-RO read-only via render.** Snapshot `state` + `solve(state)`; open all drills; `render()`; assert deep-equal. (Reuses Slice 3's read-only pattern, now through the render path.)
- Confirm Slice 3's **INV-S3-D** (headless exports identical) and **inv #7** still green.

Target: existing 59 stay green; new INV-3b assertions added on top; report N/0.

## 5. Eyeball check (visual; beyond verifier-green)

- PC chain open, drag `z_struct` up: uₙ (a) moves right, Yₙ (b) moves left, gap origin (c) shifts — all live, all agreeing with the main Phillips chart's Yₙ.
- IS drill open, drag `G` or the policy rate: IS locus / operating point move live.
- MP drill open, change the policy rate: flat line moves live; real-r line still absent pre-PC, present post-PC.
- Step to beat 2 of the PC chain, then drag a slider: it stays on beat 2 (does not snap to beat 1), highlight still correct.
- Close a drill, drag sliders, reopen: it opens showing current state (not pre-close state), at the step it was on.

## 6. Out of scope

- Animation of curve construction (the "trace it out" motion) — that is a separate idea (#2 from discussion), not this slice.
- Three-beat choreography wiring (auto-enter on unlock) — separate slice.
- Any v16 change.

## 7. Definition of done

1. `verify_onboarding.mjs` green (≥59/0 + new INV-3b), `verify_v16.mjs` 22/0, `verify_v19.mjs` 40/0 — engine verifiers unchanged.
2. Eyeball checks in §5 hold.
3. Malin commits (agent does not), then archive this spec to `_ARCHIVE_specs/`.
