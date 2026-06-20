# Onboarding build — step-by-step sequence

**Purpose of this document.** The progressive-teaching layer is being built in small, independently-verifiable slices. This is the ordered plan. Paste this whole file into a new Claude chat at the start of a session so Claude knows exactly where the build is and what the next step is — and does NOT skip ahead, merge steps, or forget the order.

**Read this first (for Claude in a new session):**
- The slices are sequential. Each one gates on its verifier going green before the next begins. Do not start slice N+1 until slice N is green and committed.
- Claude writes specs; Antigravity implements in the repo. Claude does not push code. Spec files live at the repo root.
- The enabling rule for the whole build: tutorial state lives in an inspectable object (`tutorialState`) with named transition functions, NOT in DOM handlers — that is what makes each slice verifiable headless, the same way `verify_v19.mjs` checks `solve()`. If state lives only in the DOM, the slice has failed regardless of how it looks.
- One verifier file, `verify_onboarding.mjs`, GROWS across slices — each slice adds its checks. Single source of truth; do not fork it.
- Target model: `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (open economy — it has all four blocks). Whether v16 gets a reduced teaching version is an OPEN QUESTION, deferred.
- Canonical block order: `GOODS → ISLM → UIP → PC`.

---

## CURRENT STATUS

**→ Next action: Slice 1 (lock layer). Not yet handed to Antigravity.**

*(Update this line after each green+committed slice, e.g. "Slice 1 green & committed; next action: carve Slice 2 spec.")*

---

## The slices

### Slice 1 — Main-screen lock / grey / colour-in layer  ← START HERE
**Goal:** Blocks not yet reached are greyed/unusable; they colour in and become usable as the learner progresses. Nothing else.
**Depends on:** nothing (this is the foundation).
**Spec:** `Spec_Onboarding_Slice1_LockLayer.md` (already written).
**Verifier checks added:** monotonic unlocking; prefix ordering (GOODS→ISLM→UIP→PC); lock-state = complement of unlocked; colour-in tracks unlocked; transitions exposed headless. Creates `verify_onboarding.mjs`.
**Gate:** `verify_onboarding.mjs` green (5 invariants + BAD-fixture self-tests) AND `verify_v16`/`verify_v19` still green.

**PROMPT TO ANTIGRAVITY (paste this):**
> Implement `Spec_Onboarding_Slice1_LockLayer.md` (at the repo root). Follow it exactly. Scope is ONLY the lock/grey/colour-in layer, its state object, and the new `verify_onboarding.mjs` — no drill-downs, no choreography, no equation changes. Gate on: `node verify_onboarding.mjs` green (all 5 invariants + BAD-fixture self-tests), and `node verify_v16.mjs` + `node verify_v19.mjs` still green. Report the verifier output, confirm the state imports headless, and confirm in words that no out-of-scope work was done. Do not widen any tolerance or weaken any assertion.

**When it comes back, check (ask Claude to help):** Is the lock state actually read from `tutorialState`, or is it hardcoded in CSS/handlers? Run the verifier yourself; agent "it works" is not the gate.

---

### Slice 2 — Equation scoping + full-model permanent colour-coding
**Goal:** On the main screen, equations show only terms from unlocked blocks (no net-exports in IS before UIP; no πᵉ before PC), and every term is permanently coloured by its curve (IS red, MP/LM blue, UIP green, PC purple).
**Depends on:** Slice 1 (needs `unlocked`).
**Spec:** to be carved from `Spec_Onboarding_StateMachine.md` (Parts B.1, B.3, B.5; invariants 6, 8, 9) into its own `Spec_Onboarding_Slice2_Equations.md` when we reach it.
**Verifier checks added to `verify_onboarding.mjs`:** scope correctness (terms match unlocked set); full-model permanent per-curve colouring; palette binding to `EQ_COL`.
**Gate:** `verify_onboarding.mjs` green (now Slice 1 + Slice 2 checks) AND `verify_v16`/`verify_v19` still green.

**FIRST STEP (paste to Claude in a new chat):**
> Slice 1 is green and committed. Carve the Slice 2 spec (equation scoping + full-model permanent per-curve colouring) out of `Spec_Onboarding_StateMachine.md` into `Spec_Onboarding_Slice2_Equations.md`, scoped to the main screen only (no drill-down equation behaviour yet). Then give me the Antigravity prompt for it.

---

### Slice 3 — Drill-down graphs (new visualisations)
**Goal:** Build the zoom-in derivation graphs themselves — IS construction, flat MP line, and the PC three-graph chain (labour market WS/PS → uₙ; Okun u→Yₙ; Phillips curve in (Y,π)). These are NEW economics graphs and need Blanchard-fidelity care. No choreography yet — just the graphs existing and being economically correct, with the block's main equation shown above them + Blanchard reference.
**Depends on:** Slice 1 (and ideally Slice 2 for the scoped equations). Independent of Slice 4.
**Spec:** to be written when we reach it (`Spec_Onboarding_Slice3_DrillGraphs.md`) — this is the most economics-heavy slice; it deserves its own careful spec and a Blanchard cross-check against the correspondence doc. Layout points (main equation above graphs, Blanchard reference) are in `Spec_Onboarding_StateMachine.md` Part B.4 / invariant 10.
**Verifier checks added:** drill-down transient highlight (the bit being added is coloured, earlier terms black); main-equation-above-graphs + Blanchard reference present; plus any economics checks on the new graphs (e.g. WS/PS intersection gives uₙ; Okun maps uₙ→Yₙ correctly).
**Gate:** `verify_onboarding.mjs` green AND `verify_v16`/`verify_v19` still green.

**FIRST STEP (paste to Claude in a new chat):**
> Slices 1 and 2 are green and committed. Write the Slice 3 spec for the drill-down derivation graphs (IS construction, flat MP line, PC three-graph chain: labour market → Okun → Phillips). This is the economics-heavy slice — cross-check the derivation against the Blanchard correspondence doc and the textbook before writing. No choreography in this slice. Then give me the Antigravity prompt.

---

### Slice 4 — The three-beat choreography (state machine on top)
**Goal:** The learn-in-isolation-then-integrate flow: Beat 1 step-through → Beat 2 full chain → Beat 3 selection; solo-study greys already-learned blocks temporarily; re-entry after unlock skips to Beat 2; exit-tutorial button + tutorial-sections menu always available.
**Depends on:** Slices 1 + 3 (needs the lock layer and the drill-down graphs to exist).
**Spec:** `Spec_Onboarding_StateMachine.md` (already written) — Parts A and C, invariants 1–5 and 7. Carve the choreography-only portion into `Spec_Onboarding_Slice4_Choreography.md` when we reach it, so it doesn't re-specify the equation/graph work already done.
**Verifier checks added:** re-entry lands on Beat 2 not Beat 1; solo-study reversible; beat ordering 1→2→3 with Beat 3 selecting exactly one graph; two greys (locked vs solo-greyed) distinct and exclusive.
**Gate:** `verify_onboarding.mjs` green (full set) AND `verify_v16`/`verify_v19` still green.

**FIRST STEP (paste to Claude in a new chat):**
> Slices 1–3 are green and committed. Carve the choreography-only Slice 4 spec from `Spec_Onboarding_StateMachine.md` (Parts A and C, invariants 1–5 and 7) into `Spec_Onboarding_Slice4_Choreography.md`, assuming the lock layer and drill-down graphs already exist. Then give me the Antigravity prompt.

---

## Slices deferred / parallel (from the Master Plan, not blocking the above)
- **Phase 1 — symbol tooltips + Blanchard equation references** in the existing equation boxes. No engine changes; can be done any time, independent of the slices above.
- **Phase 2 — polished lesson-level UI frame** (top stepper styling). The minimal stepper in Slice 1 is a placeholder; the polished frame is a later cosmetic pass.
- **Phase 5 — per-level guided scenarios.** After the four slices.
- **Phase 6 / v2 — forward-looking FX (saddle path).** Genuinely new modelling, separate, last.

## Open questions to resolve along the way
- Does v16 (closed economy) need its own reduced teaching version, or is the teaching layer v19-only?
- `CLAUDE.md` vs `GEMINI.md`/`AGENTS.md` filename — confirm Antigravity auto-loads the root rules file (carried over from the existing to-do).

## The one rule that matters most
Verifier green is the gate, not agent self-report. Two AIs agreeing is not a human reading the engine. After every slice: run the verifier yourself, eyeball the load-bearing risk for that slice, then `git add -A && git commit`.
