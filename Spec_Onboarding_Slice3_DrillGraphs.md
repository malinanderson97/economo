# Spec — Onboarding Slice 3: Drill-down Derivation Graphs

**Status:** DRAFT (for Antigravity implementation; Malin runs verifiers; Malin commits)
**Carved from:** `Spec_Onboarding_StateMachine.md` — Part B.4 (drill-down layout: block's main equation above the graphs, carrying its Blanchard equation reference) and the existing invariants **#7** (drill-down transient highlight) and **#10** (drill-down layout + equation reference). Slice 3 *builds the drill-down chain that those invariants police* — it does NOT restate them. Do NOT archive the StateMachine spec — it remains a live dependency for Slices 2–4.
**Depends on (committed):** Item A (πᵉ-gating engine), Slice 2 (`TERM_BLOCK` map + per-curve `EQ_COL` colouring).
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (open economy). Closed-economy v16 is out of scope for this slice.
**Verifier:** `verify_onboarding.mjs` (add new INV assertions + BAD-fixtures here; do NOT weaken existing assertions).
**Agent guardrails:** Do NOT touch any `.docx`. Do NOT run `git`. Run only this named spec. Do NOT edit any verifier to make it pass; if an assertion fails, fix the model, not the assertion. Never use `Set-Content` on the HTML model file.

---

## 0. Purpose

Each headline curve in the main view (IS, the flat MP line, the Phillips curve) is the *reduced form* of a construction the learner has not yet seen. Slice 3 adds **read-only drill-down derivation graphs** that show where each curve comes from:

1. **IS construction** — how the goods-market equilibrium condition traces out IS in (Y, r) space as r varies.
2. **Flat MP** — why the policy line is horizontal at the chosen rate (rate is the instrument; the central bank sets it directly).
3. **PC three-graph chain** — the medium-run supply side that fixes Yₙ, then maps to inflation:
   - **(a) Labour market** WS/PS → natural unemployment uₙ;
   - **(b) Okun's law** uₙ → Yₙ;
   - **(c) Phillips** in (Y, π) space, with the gap measured from the Yₙ that (a)+(b) produced.

These graphs are **derivation aids, not new controls.** They introduce **no new state, no new engine functions, and no new sliders.** They read the existing engine (`solve`, `computeYn`, `isRateForOutput`, `isOutput`) and the existing structural constants. This keeps the slice eyeball-gated-on-top-of-verifier-green rather than engine-risk.

---

## 1. Hard invariants (stated in advance, per SPEC_TEMPLATE)

These are the contract. Implementation is correct iff all hold and all existing `verify_onboarding` assertions stay green (currently 47/0).

- **Inv #7 (transient drill-down highlight) — owned by the StateMachine spec; Slice 3 must satisfy it, not restate it.** Inside a PC-chain drill-down, only the term/curve being added *at the current step* is coloured (its curve colour); terms from earlier-learned blocks render black, and as the chain advances the previously-coloured term reverts to black. Slice 3's job is to build the chain so this is true step-by-step. (Do not confuse with inv #8, the *opposite* main-screen behaviour: permanent per-curve colour, nothing reverts.)
- **Inv #10 (drill-down layout + Blanchard reference) — owned by the StateMachine spec; Slice 3 implements the drill-downs it checks.** Each block's main/full equation sits **above** its graphs, prominent, carrying the Blanchard equation reference from the correspondence doc: **IS → 9.1, UIP → 19.5, PC chain headline → 9.3**. The PC chain is a multi-equation derivation, so its constituent graphs carry their own references: **labour-market WS/PS graph (a) → 8.4** (natural rate uₙ = (m+z)/α_WS), **Okun graph (b) → 8.4** (Yₙ = L(1−uₙ), same natural-rate relation), **Phillips graph (c) → 9.3** (output-space PC, the headline). Do NOT label graph (a) or (b) with 9.3 — that is the output-space PC only. Supporting/derivation equations sit elsewhere in the drill-down. Each reference string must be present and non-empty.
- **INV-S3-RO (drill-downs are read-only) — NEW, owned by Slice 3.** Opening, closing, or interacting with any derivation graph must not mutate `state`, must not change what `solve(state)` returns, and must not enqueue history. Assert: `solve(state)` deep-equals (all numeric fields) before vs after any drill-graph open/close, and `state` is unchanged.
- **INV-S3-A (Yₙ reconciliation).** The labour-market + Okun chain shown in the PC drill-down must reconcile to the engine: the uₙ the WS/PS graph marks and the Yₙ the Okun graph marks must equal `computeYn(state)`-derived values to within 1e-6. No hardcoded uₙ or Yₙ in the drill-graph draw code — both must be derived from `ALPHA_WS`, `L_LABOR`, `state.m_struct`, `state.z_struct` exactly as `computeYn` does. (Mirrors Slice 2's "display strings must reconcile to the engine" rule.)
- **INV-S3-B (gap consistency).** The Yₙ vertical marked in the PC drill-down graph (c) must be the same Yₙ used by the main Phillips chart and by `solve` — i.e. `computeYn(state)`. The drill-down must not recompute Yₙ from a parallel formula.
- **INV-S3-C (drill-down gating).** A block's derivation graph is reachable **only when that block is unlocked.** The IS/MP drill-downs gate on `ISLM`; the PC three-graph chain gates on `PC`. A locked block exposes no drill-down trigger and no drill-down content in the DOM. (Reuses the existing `verifyGating` "no ungated interactive control" machinery — the drill-down trigger is an interactive control and must be block-gated or allowlisted.)
- **INV-S3-D (no engine surface growth).** No new keys in `paramDefs`, `shockDefs`, `dynamicsDefs`, `debtDefs`. No new fields on `state`. No new exported engine function. The headless slice in `verify_onboarding` (everything before `buildSliders`) must still import cleanly and expose the same `{ tutorialState, unlockBlock, setUnlocked, resetTutorial, paramDefs, shockDefs, dynamicsDefs, debtDefs }`.
- **pointer-events.** All plotted curves inside drill-down SVGs carry `pointer-events: none` (per the established curve rule), so any future drag handles can catch pointer events; the drill-downs themselves are non-draggable in this slice.
- **Fisher / real-rate absence pre-PC** (inherited from Item A) must be preserved: the IS/MP drill-down, when reachable at ISLM-unlocked-but-PC-locked, shows the **nominal** rate only (r = i), no Fisher line, no real-r line. The real-r line appears in the drill-down only when PC is unlocked, matching the main chart.

---

## 2. Economics content (Blanchard-faithful)

All references are to *Macroeconomics*, 9th Global Edition (2024).

### 2.1 IS construction drill-down (gates on ISLM)
Show IS as the locus of goods-market equilibria as the real rate r varies. Reuse the engine's own `isOutput(G, T, r, eps, c1, m1, Ystar)` evaluated across a small set of r values; mark the current operating point at `(eq.Y, eq.r)`. The curve plotted **must** pass the full argument list (`state.G, state.T, eq.eps, state.c1, state.m1, state.Ystar`) — silent default-coefficient fallback is the "engine-correct but diagram-wrong" trap and is forbidden. Annotate that the multiplier is `k_o = 1/(1 − c₁ − d₁ + m₁)` computed live, never the literal 1.43.

### 2.2 Flat MP drill-down (gates on ISLM)
A single horizontal line at the policy rate, annotated: the central bank sets the rate as its instrument, so MP is horizontal in (Y, i). Pre-PC this is the nominal rate i; at PC-unlock the real line r = i − πᵉ also appears (consistent with the main chart and Item A). No new computation.

### 2.3 PC three-graph chain (gates on PC)

**(a) Labour market — WS/PS → uₙ** *(Blanchard eq. 8.4)*. Wage-setting and price-setting relations cross at the natural rate of unemployment:
`uₙ = (m_struct + z_struct) / ALPHA_WS`.
With baseline `m_struct = 0.05`, `z_struct = 0.10`, `ALPHA_WS = 3.0` → uₙ = 0.05 (5%). `ALPHA_WS = 3.0` is the **wage-setting slope — FIXED and DISTINCT from the PC-slope slider α.** The graph must derive uₙ from the live `state.m_struct`/`state.z_struct` (the two structural sliders), so raising the markup m or wage-push z visibly raises uₙ.

**(b) Okun's law — uₙ → Yₙ** *(Blanchard eq. 8.4, same natural-rate relation)*. The bridge from unemployment to output: `Yₙ = L_LABOR · (1 − uₙ)`, with `L_LABOR = 100/(1 − 0.05) ≈ 105.2632` so that baseline Yₙ = 100 exactly. Mark Yₙ on this graph; it must equal `computeYn(state)`.

**(c) Phillips in (Y, π)** *(Blanchard eq. 9.3 — the chain headline)*. The reduced-form PC the learner already sees, here shown explicitly anchored to the Yₙ that (a)+(b) produced:
`π = πᵉ + α(Y − Yₙ)/Yₙ + shock`, gap form, engine unchanged. The transitory term is the **"shock"** (`= s.z + s.z_pulse`), per the Slice 2 naming decision — NOT a second structural z. Structural (m + z) lives in Yₙ via graph (a); it does not appear as a term in (c).

> **Level-form PC is OUT OF SCOPE for this slice.** Do not implement it, do not add a seam or placeholder for it, do not mention it in the UI. (It is a separate Frank-gated idea tracked in `Spec_Onboarding_StateMachine.md`; building it here is forbidden.)

---

## 3. Implementation mechanism (how, not just what)

Specs prescribe mechanism. Concretely:

1. **Trigger.** Each headline chart panel (`#ismp`, the MP legend region, `#pc`) gets a small "derivation ▸" disclosure trigger. The trigger element carries `data-block="ISLM"` (IS + MP) and `data-block="PC"` (the three-graph chain) so the **existing** `renderTutorial`/`setLocked` gating greys it out exactly like other block-scoped controls — no new gating mechanism. This satisfies INV-S3-C through the machinery `verify_onboarding`'s `verifyGating` already enforces.
2. **Drill containers.** Add hidden `<svg>` containers (e.g. `#drill-is`, `#drill-mp`, `#drill-pc-wsps`, `#drill-pc-okun`, `#drill-pc-phillips`) that render on demand. They are NOT part of the main `render()` cost path when closed.
3. **Draw functions.** New pure draw functions `drawDrillIS(eq)`, `drawDrillMP(eq)`, `drawDrillPCChain(eq)` that read `solve(state)` output and the structural constants. They **call `computeYn` / `isOutput` / `isRateForOutput`** — they never re-derive coefficients. Reuse existing `drawAxes`, `drawLine`, `xScale`, `yScale`, `el`, and the existing `curve-natural` class for the Yₙ vertical.
4. **Open/close is view-only.** Toggling a drill-down sets a local view flag and calls only the relevant `drawDrill*`; it must NOT call `solve` with side effects, must NOT push history, must NOT call `stepPeriod`. This is what INV-S3-RO asserts.
5. **Step-by-step highlight (satisfies inv #7).** As the PC chain advances within its drill-down, colour only the term/curve being added at the current step; revert prior steps to black. The drill-down's main equation sits above its graphs with its Blanchard reference (satisfies inv #10). This is className/positioning only — it never touches `eq.*` or `state`.
6. **Colour.** Reuse `EQ_COL` / the existing per-curve palette from Slice 2. No parallel palette. The PC chain uses PC-purple for the Phillips curve; the labour-market and Okun graphs use the natural-rate styling (`curve-natural`) for the Yₙ/uₙ marks.

---

## 4. Verifier additions (`verify_onboarding.mjs`)

Add to the existing harness (headless slice + DOM-stub `testRender`). Do not modify existing assertions. New assertions:

- **Inv #7 step-by-step highlight (in-drill).** Using the chip/special-el stub pattern: drive the PC chain through its steps and assert that at each step the coloured terms are exactly the step's addition, with earlier terms black, and that advancing reverts the prior step to black. BAD-fixture: a stuck highlight (prior term stays coloured) → caught. (This is the in-drill check; keep it distinct from inv #8's main-screen permanent-colour check so the two don't cross-wire.)
- **Inv #10 layout + reference.** Static check: each drill-down's main equation string is positioned above its graphs and carries a non-empty Blanchard reference matching the correspondence doc — IS 9.1, UIP 19.5, and for the PC chain: graph (a) 8.4, graph (b) 8.4, graph (c) 9.3. BAD-fixture: a drill-down with an empty/missing reference, OR graph (a) mislabelled 9.3 instead of 8.4 → caught.
- **INV-S3-RO read-only drill.** Snapshot `solve(state)`; invoke each `drawDrill*` (chip/special-el stub pattern as used for `drawEquations`/`drawISChips`); re-`solve(state)`; assert deep-equal AND `state` deep-equal before/after. BAD-fixture: a `drawDrill*` variant that writes to `state` → caught.
- **INV-S3-A / S3-B Yₙ reconciliation.** For several `state` overrides (baseline; raised `m_struct`; raised `z_struct`), assert the uₙ and Yₙ the drill code would mark equal `(state.m_struct+state.z_struct)/ALPHA_WS` and `computeYn(state)` to 1e-6. Reuse the "no hardcoded coefficient" BAD-fixture style from the existing `eq-ismp` test: a drill draw with a literal `0.05` uₙ → caught.
- **INV-S3-C gating.** Extend the existing `verifyGating` allowlist/data-block check: the derivation triggers must be caught as block-gated. BAD-fixture: a derivation trigger with no `data-block` and not in the allowlist → caught by the existing "no ungated interactive control" assertion (so this mostly reuses machinery; add a positive assertion that `#drill-*` triggers carry `data-block`).
- **INV-S3-D no surface growth.** Assert `paramDefs/shockDefs/dynamicsDefs/debtDefs` key-sets are unchanged from a recorded baseline list, and that the headless import still returns the same export set.

Target: existing 47 stay green; new assertions added on top; report N/0.

---

## 5. Out of scope (explicit)

- Level-form PC overlay — forbidden in this slice (Frank-gated, tracked separately; no seam, no placeholder).
- Any change to v16 (closed economy).
- Any new slider, shock, or state field.
- Drag interaction inside drill-downs (pointer-events:none now; drag is a later slice if ever).
- Forward-looking FX expectations (separate planned v2 feature).

---

## 6. Definition of done

1. All existing `verify_onboarding` assertions green (≥47/0).
2. New INV-S3-A/B/C/D and INV-S3-RO assertions green; inv #7 (in-drill step highlight) and inv #10 (layout + reference) satisfied and asserted.
3. Browser eyeball check (visual work is eyeball-gated beyond verifier-green):
   - IS drill shows IS traced by varying r, current point on it; multiplier annotation reconciles.
   - MP drill flat at policy rate; real-r line absent pre-PC, present post-PC.
   - PC chain: raising m_struct or z_struct visibly raises uₙ (a) and lowers Yₙ (b) and shifts the gap origin in (c); all three agree with the main chart's Yₙ.
   - As the PC chain advances, only the current step's term is coloured; prior steps revert to black; the main equation sits above the graphs with its Blanchard reference.
   - Drill triggers greyed when their block is locked.
4. Malin commits (agent does not). Then archive this spec to `_ARCHIVE_specs/` via `Move-Item`.
