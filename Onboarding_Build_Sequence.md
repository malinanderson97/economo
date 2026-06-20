# Onboarding build — step-by-step sequence

**Purpose of this document.** The progressive-teaching layer is being built in small, independently-verifiable slices. This is the ordered plan. Paste this whole file into a new Claude chat at the start of a session so Claude knows exactly where the build is and what the next step is — and does NOT skip ahead, merge steps, or forget the order.

**Read this first (for Claude in a new session):**
- The slices are sequential. Each gates on its verifier going green before the next begins. Do not start slice N+1 until slice N is green and committed.
- Claude writes specs; Antigravity implements in the repo. Claude does not push code. Spec files live at the repo root (finished ones are archived to `_ARCHIVE_specs/`).
- The enabling rule for the whole build: tutorial state lives in an inspectable object (`tutorialState`) with named transition functions, NOT in DOM handlers — that is what makes each slice verifiable headless, the same way `verify_v19.mjs` checks `solve()`. If state lives only in the DOM, the slice has failed regardless of how it looks.
- One verifier file, `verify_onboarding.mjs`, GROWS across slices — each slice adds its checks. Single source of truth; do not fork it.
- Target model: `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (open economy — it has all five blocks). Whether v16 (closed) needs its own reduced teaching version is an OPEN QUESTION, deferred.
- **Canonical block order (FIVE blocks): `GOODS → ISLM → UIP → PC → DEBT`.**
- **The verifier now guards three things beyond engine numbers** (added during Slice 1): block→control mapping, no-ungated-interactive-control (with an explicit allowlist), and UIP diagram orientation. These are a new *class* of check — they guard mappings and diagrams, not just `solve()` outputs. New slices should add diagram/mapping assertions in the same spirit.
- **Layout/visual work has no verifier — it is gated by the human's eyes only.** Expect responsive/visual changes to take a round or two of browser checking; that's normal, not a failure.

---

## CURRENT STATUS

**→ Slice 1 complete & committed (incl. all fix-ups, UIP transpose, responsive layout). Next action: carve the Slice 2 spec (equation scoping + full-model permanent per-curve colouring).**

*(Update this line after each green+committed slice.)*

---

## Settled facts (decided during Slice 1 — treat as fixed unless revisited)

**Block → control mapping:**
- `GOODS`: `G`, `T`, `c1`
- `ISLM`: `i_target`, `pi_e`
- `UIP`: `i_star`, `E_e`, `m1`, `Ystar`
- `PC`: `alpha`, `m_struct`, `z_struct`, `z`, `theta`, `cred`, `phi`, `speed`, the oil-shock button, the Taylor-rule toggle, the de-anchoring toggle
- `DEBT`: `B`, `g`
- Time-controls (`Step`, `Reverse`, `Run-to-rebalance`) gate to `PC`; only `Reset` is always-on.

**Deliberate decisions (with reasons):**
- **πᵉ lives in ISLM, not PC** — the IS curve needs it for the real rate `r = i − πᵉ`. (Locking it until PC would leave the real rate undefined at step 2.) Its *role* differs by stage: a fixed dial at ISLM, dynamic/endogenous once PC unlocks.
- **Debt is a separate final block (DEBT), after PC** — it's growth-related (the `(r−g)` debt dynamics), not part of the IS-LM-PC core.
- **Stepping requires a law of motion → time-controls gate to PC.** Before PC there is no inflation, so GOODS/ISLM/UIP are contemporaneous snapshots; `step()` only evolves PC/inflation-driven quantities. Showing Step earlier teaches the wrong lesson.
- **Taylor rule defaults OFF.** Learner sets the rate manually first (discretionary), then turns the rule on as a deliberate step; dragging MP while the rule is on shows an explanatory message (the rate is set by the rule, not freely chosen).
- **UIP diagram orientation = Blanchard Ch. 19:** exchange rate on x-axis, interest rate on y-axis. (Was transposed during Slice 1; a verifier assertion now pins it.)
- **Money market / upward-sloping LM deliberately NOT shown** — the tool teaches the Blanchard MP-line model; the money-market derivation is one-time scaffolding that adds confusion. (Frank's Macro 1 does teach it, so this is a conscious scope choice.)

**Principles discovered (carry forward):**
- **"Engine-correct but diagram-wrong" is a real failure category.** The UIP axes were economically right in `solve()` but drawn wrong, and no verifier caught it because all the engine verifiers check numbers, not diagrams. Slice 3's drill-down graphs have this risk — pin their orientation/structure with assertions.
- **Curves need `pointer-events: none` so handles catch clicks.** A pre-existing base-model bug left the MP handle dead because curve strokes intercepted the pointer. Slice 3 adds more layered curves+handles — bake this in from the start.
- **Class-based `.locked` gating on SVG elements that get rebuilt every `render()` is a known soft spot.** It works (renderTutorial runs after the redraw) but is order-fragile. Possible future hardening: drive handle interactivity from the state object at draw time rather than toggling a class after.

---

## The slices

### Slice 1 — Main-screen lock / grey / colour-in layer  ✅ COMPLETE & COMMITTED
**What it did:** Lock/grey/colour-in layer on v19 driven by `tutorialState.unlocked`; named transitions (`unlockBlock`, `setUnlocked`, `resetTutorial`); `renderTutorial()` as the single `.locked` writer reading from the set. Five-block order. Created `verify_onboarding.mjs`.
**Fix-ups applied (all committed):** corrected block mappings + added DEBT block; gated hand-built controls (speed, toggles, oil-shock) via section bodies; gated time-controls to PC; responsive layout (charts + readout fit the viewport, reflow to 1 column when narrow, 10 readout stats incl. a split-out "Policy rule" box); Taylor defaults off + drag-message; UIP axis transpose; assorted interaction fixes (dead MP handle via `pointer-events`, output-box height stability).
**Verifier state:** `verify_onboarding.mjs` green with — Slice 1 invariants (monotonic unlock, prefix ordering, lock=complement, colour-in tracks unlocked, transitions exposed), block-mapping assertions, no-ungated-control assertion + allowlist, UIP orientation assertion, BAD-fixture self-tests. `verify_v16`/`verify_v19` still green.

### Slice 2 — Equation scoping + full-model permanent colour-coding  ← NEXT
**Goal:** On the main screen, equations show only terms from unlocked blocks (no net-exports in IS before UIP; no πᵉ-dynamics before PC), and every term is permanently coloured by its curve (IS red `#d85a30`, MP/LM blue `#185fa5`, UIP green `#0f6e56`, PC purple `#534ab7` — reuse the existing `EQ_COL` map, do not invent a parallel palette).
**Depends on:** Slice 1 (uses `unlocked`).
**Spec:** carve from `Spec_Onboarding_StateMachine.md` (Parts B.1, B.3, B.5; invariants 6, 8, 9) into `Spec_Onboarding_Slice2_Equations.md`. Main screen only — NOT the drill-down transient-highlight behaviour (that's Slice 3/4).
**Verifier checks to add:** scope correctness (rendered terms match the unlocked set, driven by a `term → block` map); full-model permanent per-curve colouring (many blocks coloured at once, nothing reverts); palette binding to `EQ_COL`.
**Gate:** `verify_onboarding.mjs` green (Slice 1 + Slice 2) AND `verify_v16`/`verify_v19` green.

**FIRST STEP (paste to Claude in a new chat):**
> Slice 1 is complete and committed. Carve the Slice 2 spec (equation scoping + full-model permanent per-curve colouring, main screen only) out of `Spec_Onboarding_StateMachine.md` into `Spec_Onboarding_Slice2_Equations.md`. Then give me the Antigravity prompt.

### Slice 3 — Drill-down graphs (new visualisations)
**Goal:** Build the zoom-in derivation graphs — IS construction, flat MP line, and the PC three-graph chain (labour market WS/PS → uₙ; Okun u→Yₙ; Phillips curve in (Y,π)). New economics graphs needing Blanchard-fidelity care. No choreography yet — just the graphs existing and being economically correct, with the block's main equation shown above them + Blanchard reference (e.g. PC→9.3, UIP→19.5, IS→9.1).
**Depends on:** Slice 1 (and Slice 2 for scoped equations). Independent of Slice 4.
**Spec:** to be written when reached (`Spec_Onboarding_Slice3_DrillGraphs.md`) — most economics-heavy slice; cross-check the derivation against the correspondence doc and textbook. Layout points (main eq above graphs, Blanchard ref) are in `Spec_Onboarding_StateMachine.md` Part B.4 / invariant 10.
**MUST bake in from the start:** curves get `pointer-events: none` so handles catch clicks; pin each new graph's orientation/structure with a verifier assertion (the "engine-correct-but-diagram-wrong" guard).
**Verifier checks to add:** drill-down transient highlight (the bit being added is coloured, earlier terms black); main-equation-above-graphs + Blanchard reference present; economics checks on the new graphs (WS/PS intersection gives uₙ; Okun maps uₙ→Yₙ); orientation assertions per graph.
**Gate:** `verify_onboarding.mjs` green AND `verify_v16`/`verify_v19` green.

**FIRST STEP (paste to Claude in a new chat):**
> Slices 1 and 2 are complete and committed. Write the Slice 3 spec for the drill-down derivation graphs (IS construction, flat MP line, PC three-graph chain: labour market → Okun → Phillips). Economics-heavy — cross-check against the Blanchard correspondence doc and textbook. Bake in `pointer-events: none` on curves and per-graph orientation assertions. No choreography in this slice. Then give me the Antigravity prompt.

### Slice 4 — The three-beat choreography (state machine on top)
**Goal:** The learn-in-isolation-then-integrate flow: Beat 1 step-through → Beat 2 full chain → Beat 3 selection; solo-study greys already-learned blocks temporarily; re-entry after unlock skips to Beat 2; exit-tutorial button + tutorial-sections menu always available.
**Depends on:** Slices 1 + 3 (needs the lock layer and the drill-down graphs).
**Spec:** `Spec_Onboarding_StateMachine.md` (already written) — Parts A and C, invariants 1–5 and 7. Carve the choreography-only portion into `Spec_Onboarding_Slice4_Choreography.md` when reached, so it doesn't re-spec the equation/graph work already done.
**Verifier checks to add:** re-entry lands on Beat 2 not Beat 1; solo-study reversible; beat ordering 1→2→3 with Beat 3 selecting exactly one graph; two greys (locked vs solo-greyed) distinct and exclusive.
**Gate:** `verify_onboarding.mjs` green (full set) AND `verify_v16`/`verify_v19` green.

**FIRST STEP (paste to Claude in a new chat):**
> Slices 1–3 are complete and committed. Carve the choreography-only Slice 4 spec from `Spec_Onboarding_StateMachine.md` (Parts A and C, invariants 1–5 and 7) into `Spec_Onboarding_Slice4_Choreography.md`, assuming the lock layer and drill-down graphs already exist. Then give me the Antigravity prompt.

---

## Slices deferred / parallel (from the Master Plan, not blocking the above)
- **Phase 1 — symbol tooltips + Blanchard equation references** in the equation boxes. No engine changes; any time, independent.
- **Phase 2 — polished lesson-level UI frame.** The current stepper/controls are functional placeholders; polished frame is a later cosmetic pass.
- **Phase 5 — per-level guided scenarios.** After the four slices.
- **Phase 6 / v2 — forward-looking FX (saddle path).** Genuinely new modelling, separate, last.

## Open questions to resolve along the way
- Does v16 (closed economy) need its own reduced teaching version, or is the teaching layer v19-only? (Frank's Macro 1 leans on the money market, which only v16 has — but the tool deliberately drops the money market. Decide whether the teaching tool serves Macro 1 at all, or is Macro 2-only.)
- `CLAUDE.md` vs `GEMINI.md`/`AGENTS.md` filename — confirm Antigravity auto-loads the root rules file.

## The one rule that matters most
Verifier green is the gate, not agent self-report. Two AIs agreeing is not a human reading the engine. After every slice: run the verifiers yourself, eyeball the load-bearing risk for that slice (and for visual work, browser-check it — the verifier can't see layout/interaction), then `git add -A && git commit`.
