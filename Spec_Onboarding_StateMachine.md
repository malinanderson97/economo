# Spec: Onboarding choreography — state machine + scoped/coloured equations

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER` (contains `verify_v16.mjs`, `verify_v19.mjs`, the model HTML files).
**Type of change:** New feature (Phase 4 onboarding choreography) **plus** a new headless verifier (`verify_onboarding.mjs`). Do **not** modify `verify_v16.mjs` or `verify_v19.mjs`. Do **not** touch the economics engine (`solve`, the equilibrium math, the calibrated coefficients).

---

## Background / why

The teaching tool reveals blocks progressively (goods market → IS-LM → open economy → PC). When a new block is introduced it is studied **in isolation** (a three-beat choreography), then **integrated** onto the main screen. This is UI state, not economics — and the existing verifiers don't touch it. The risk: an agent builds it, clicks through once, sees it "look right" in a screenshot, and reports success — while a sequence-dependent path (e.g. re-entering an already-unlocked block) is wrong. A screenshot is a single frame; these bugs live in *transitions*.

**The whole point of this spec is to make the choreography checkable headless**, the same way the economics verifiers assert on `solve(state)`. That requires the state to live in a plain inspectable object and every transition to go through a named function — NOT buried in DOM event handlers. If the state lives only in the DOM, it is not verifiable and this spec has failed.

---

## Part A — Expose the state (the enabling constraint)

Implement the choreography as a small state machine with a single inspectable state object and named transition functions. **No transition logic inside DOM event handlers** — handlers call the named functions; the functions own the state.

### A.1 State shape

A single object, e.g. `tutorialState`, with at least:

```js
{
  unlocked:   Set<BlockId>,   // blocks learned & live on the main screen
  soloStudy:  BlockId | null, // the block currently being studied in isolation, or null
  beat:       0 | 1 | 2 | 3,  // 0 = not in a drill-down; 1/2/3 = the three beats
  drillBlock: BlockId | null, // which block's drill-down is open (solo or replay), or null
  firstSeen:  Set<BlockId>,   // blocks whose first-encounter choreography has completed
}
```

`BlockId` is one of: `GOODS`, `ISLM`, `UIP`, `PC` (extendable for v2 forward-FX, out of scope here).

### A.2 Named transitions (handlers call ONLY these)

- `enterDrillDown(block)` — open a block's drill-down. **Branches on `firstSeen`:** if the block is NOT yet in `firstSeen`, this is a first encounter → run the three beats (Beat 1). If it IS in `firstSeen`, skip straight to Beat 2 (the live full-chain replay).
- `advanceBeat()` — move 1 → 2 → 3 during a first encounter.
- `completeChoreography(block)` — Beat 3 finishes: add `block` to `unlocked` and `firstSeen`, end solo-study, return to the main screen.
- `endSoloStudy()` — exit the solo-study view (also reachable via the exit-tutorial button); restores the previously-greyed blocks.
- `exitTutorial()` — global escape: leaves any drill-down, returns to the main screen in a consistent state. Always available.
- `jumpToSection(block)` — tutorial-sections menu: enter any block's tutorial directly. Always available.

### A.3 Make it importable

The engine-slice technique used by the existing verifiers (extract the `<script>` block, slice at the first DOM-dependent function) must be able to import `tutorialState` and the transition functions **without** triggering DOM setup. Keep the state machine ABOVE the first DOM-dependent function (`buildSliders`/`buildControls`) in the script, same pattern as the engine. If that's not feasible, expose the state machine as a self-contained factory the slice can call. Report which approach you used.

---

## Part B — Scoped & coloured equations

Equations are shown in two contexts that use colour for **different purposes**. Do not conflate them.

### B.1 Scoping (applies to both contexts)

A term belongs to a block. A term renders only if its block is in `unlocked` (or is the block currently in `soloStudy`). Examples of the intended progression:

- Before `UIP` unlocked: the IS relation shows **no net-exports term**.
- Before `PC` unlocked: nothing shows πᵉ or the inflation/Phillips dynamics.

Each unlock *adds* its terms. The learner watches the equation grow in the same order they learn the economics. Implementation note: drive this from a single `term → block` map, not scattered conditionals.

### B.2 Drill-down colouring — TRANSIENT teaching highlight (recency)

Inside a block's drill-down, colour marks **"the bit we are adding in this drill-down"**:

- Terms already known (from earlier blocks) render in normal black (`#1a1a1a`).
- The terms introduced **by this block / at the current step** render in that curve's colour.
- This is a transient highlight scoped to the drill-down. As the chain advances within the drill-down, earlier additions revert to black; only the bit being added now is coloured. Purpose: make crystal clear what is new.

### B.3 Full-model colouring — PERMANENT per-curve coding

In the main screen's "Show the equations behind this chart" boxes, colour is **permanent and per-curve**, NOT a recency highlight:

- **Every** term stays coloured by the curve it belongs to, all the time — IS terms red, MP/LM blue, UIP green, PC purple. Many blocks' terms are coloured simultaneously.
- Nothing reverts to black. This is a standing colour-code tying each term to its graph, not a "what's new" cue.

This is the key difference from B.2: drill-down = one transient highlight; full model = all terms permanently colour-coded.

### B.4 Drill-down layout

The block's **main/full equation sits ABOVE the graphs**, prominent, so the learner sees it clearly — with its Blanchard equation number referenced (e.g. PC → "9.3", UIP → "19.5", IS → "9.1"), reusing the references already mapped in the correspondence doc. Supporting/derivation equations go elsewhere in the drill-down in whatever arrangement reads well.

### B.5 Palette — reuse the existing `EQ_COL`, do NOT invent a parallel one

Both contexts use the same colour source. The engine already defines the canonical map (v19 line ~1237): `EQ_COL = { IS:'#d85a30', MP:'#185fa5', UIP:'#0f6e56', ..., PC:'#534ab7', ... }`. These match the curve strokes (`.curve-is`, `.curve-uip`, `.curve-pc`) and Frank's palette: **IS red `#d85a30`, LM/MP blue `#185fa5`, UIP green `#0f6e56`, PC purple `#534ab7`**. Any term's colour MUST equal `EQ_COL[itsBlock]`. Do not introduce a second colour table — reference the existing one so they can't drift.

---

## Part C — The verifier (`verify_onboarding.mjs`, new file at repo root)

Mirror the structure of `verify_v19.mjs`: import the state machine via the slice technique, run named transitions, assert on the resulting state object, print `PASS`/`FAIL` lines, `process.exit(1)` on any failure, and include BAD-fixture self-tests (deliberately wrong sequences that MUST be caught — analogous to the existing verifiers' self-tests). Include a static coverage check that every transition function in Part A.2 exists and is exported.

### Invariants to assert (these ARE the checkable claim)

**State machine:**

1. **Re-entry rule.** After a block is in `firstSeen`, calling `enterDrillDown(block)` sets `beat === 2` (never 1). *The single highest-value check — the bug most likely to pass a screenshot.*
2. **Solo-study is reversible.** Capture `unlocked` + grey-state before `enterDrillDown` on a NEW block; after `endSoloStudy()` (or `exitTutorial()`), every block EXCEPT the one just learned is in exactly its prior unlock state. (Post-condition: nothing silently re-locks or stays greyed.)
3. **Monotonic unlocking.** No transition ever shrinks `unlocked`. Once `ISLM ∈ unlocked`, it stays. Assert across an arbitrary sequence of transitions.
4. **Beat ordering on first encounter.** First time through a new block, beats fire 1 → 2 → 3 with none skipped, and Beat 3 selects **exactly one** graph (the chain's final one: PC → the (Y,π) graph; IS-LM → the IS-LM chart).
5. **Two greys are distinct and exclusive.** Every block is either *locked-grey* (∉ `unlocked`, never learned) or *solo-greyed* (∈ `unlocked` but stepped aside while another block is in `soloStudy`) — never both. In the full-unlock end state, zero blocks are locked-grey.

**Equations:**

6. **Scope correctness (both contexts).** For a given `unlocked` set, the rendered term list contains exactly the terms whose block ∈ `unlocked` (∪ `soloStudy`) — no term from a not-yet-learned block appears. Drive the assertion from the same `term → block` map.
7. **Drill-down transient highlight.** *Inside a drill-down only:* the coloured (non-black) terms are exactly the bit being added at the current step — all terms from earlier-learned blocks are black. As the chain advances, the previously-coloured terms revert to black. (Catches a stuck highlight.)
8. **Full-model permanent coding.** *In the main "Show the equations" boxes:* every term is coloured by its curve, none black-by-default; multiple blocks' terms are coloured simultaneously and nothing reverts. (This is the OPPOSITE of #7 — assert it in the full-model context so the two behaviours don't get cross-wired.)
9. **Palette binding (both contexts).** Any term's colour equals `EQ_COL[itsBlock]`. (Catches a drifted parallel palette.)
10. **Drill-down layout.** The block's main/full equation is positioned above the graphs and carries a Blanchard equation reference matching the correspondence doc (PC→9.3, UIP→19.5, IS→9.1, etc.). A static check that the reference string is present and non-empty for each block's drill-down.

---

## Acceptance check (report this back)

- `node verify_onboarding.mjs` runs green, showing all 10 invariant groups passing plus the BAD-fixture self-tests catching the deliberately-wrong sequences.
- Show the state object is importable headless (the slice runs without DOM errors).
- Confirm `EQ_COL` is referenced, not duplicated (grep for any second colour literal table and show there is none).
- `node verify_v16.mjs` and `node verify_v19.mjs` STILL green (this change must not perturb the engine).

## Guardrails / out of scope

- Do **not** modify the economics engine or the existing verifiers.
- Do **not** put transition logic in DOM handlers — handlers call named functions only (this is what makes it verifiable; violating it defeats the spec).
- Do **not** invent a second colour palette — reuse `EQ_COL`.
- Do **not** widen any tolerance or weaken any assertion to make a run go green. If an invariant can't be satisfied, report it — do not mask it. (The canonical agent anti-pattern; it applies here exactly as in the economics verifiers.)
- Forward-FX (v2) blocks are out of scope — design `BlockId` to extend, but don't implement them.
