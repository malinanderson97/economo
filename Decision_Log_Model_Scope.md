# Decision Log — Model Scope Boundary & Parked Features

**Date:** 2026-06-29 · **Status:** decided by Malin; items marked (lecturer) await pedagogical sign-off.

## The boundary (the durable decision)

**This model stays Blanchard-faithful in its MECHANICS. Scenarios and teaching content may still grow within that.**

The test for any future idea:
- **Does it change the engine** — i.e. what `solve` / `step` / `computeYn` / the debt accounting actually compute? → It does NOT belong in this model. Build it as a separate, richer model.
- **Does it only USE the existing engine** — scenarios, narratives, challenges, UI, docs? → Fine to add here.

Rationale: the product is "Blanchard, made interactive" — a faithful companion to the 9th-edition text. Its value and defensibility come from that fidelity. Several genuinely good ideas surfaced that each add realism *beyond* Blanchard; individually reasonable, collectively they would erode the one thing that makes this tool clearly what it is. Better to keep this model clean and build richer models deliberately as separate products.

## Allowed in this model (uses engine, doesn't change it)
- The three debt-challenge scenarios — **UK: the debt challenge**, **France: the eurozone squeeze**, **Italy: high debt, low growth**. Drafted, ready to add to `SCENARIOS`. Teaching challenges with approximate-but-real figures and an "approximate, for teaching" caveat; exact sources in a references doc.
- Further scenarios/challenges using existing mechanics.
- UI, narrative, documentation, references-doc work.
- Bugfixes.

## Parked for FUTURE model(s) — engine changes, NOT for this model

### 1. Sovereign risk premium (RP) on government debt
- **Idea:** separate the *policy rate* (what the central bank sets) from the *debt-service rate* (what the government actually pays). A premium rises with the debt ratio, creating a doom loop: high d → higher premium → higher effective borrowing rate → faster debt growth → higher d.
- **Motivation:** fixes a real teaching confusion — students conflate the bank policy rate with the rate the government borrows at. The Greek crisis is the canonical case (ECB rate ~1%, Greek yields 15%+).
- **Intended shape (when built):** endogenous premium `= k · max(0, d − d_threshold)`; optional ADVANCED toggle in the debt section, default OFF, auto-on in a Greece scenario. Two engine call sites only (the `step()` debt accumulation and the debt-cue Δd display), routed through one new `effectiveDebtRate()` function. Required verifier invariant when built: **premium off ⇒ debt dynamics bit-identical to current behaviour** (purely additive).
- **Open calibration decisions (Malin + lecturer):** `k` and `d_threshold`; and the pedagogical question — should the Greece challenge be *winnable by fiscal policy alone* (gentle k) or *deliberately unwinnable* to teach that some crises need an external backstop the model can't represent? These encode a contested macro stance and must be chosen consciously, not by the implementer.
- **Note:** this is what would change `r`'s meaning in debt accounting — clearly an engine change, hence parked.

### 2. Greece (Eurozone crisis) challenge
- Depends entirely on (1). Fuses the France lesson (no own monetary policy) + the Italy lesson (high-debt low-growth snowball) + the risk-premium doom loop. Frame **historically (2010–2015)** to keep it documented economic history rather than a contestable claim about a current institution.
- Cannot be drafted until (1)'s `k`/`d_threshold` are set, since whether the starting numbers make a good puzzle depends on them.

### 3. Credibility model: ceiling vs earnable (the θ A-vs-B question)
- **Option A (ceiling-only):** every country starts at full current credibility; only the *ceiling* θ differs. Closer to Blanchard's actual treatment.
- **Option B (ceiling + earnable current credibility):** countries differ in both ceiling and starting position; credibility can be earned up toward (never above) the ceiling, slowly and asymmetrically.
- **Status:** Option B was provisionally favoured for a disinflation challenge, with a low-ceiling worked example. BUT — Option B is arguably already a step beyond Blanchard's text, so under the boundary above it likely belongs in a future model, NOT this one. **Flag for the lecturer:** is the two-level earnable-credibility treatment within Blanchard scope, or is it a future-model elaboration? If the latter, this model keeps the simpler existing behaviour.
- Textbook support both ways: independence-vs-inflation cross-country plot supports a per-country *ceiling*; the θ-moves-over-decades plot supports a movable *current* credibility (earned slowly — Fed signalled early-1980s, anchored mid-1990s).

### 4. A disinflation / inflation-credibility challenge
- The natural counterpart to the debt challenges, exercising the Phillips/anchoring side. Depends on (3). A moderate-inflation case (e.g. South Africa or Brazil) renders in-engine; the vivid cases (Turkey, Argentina) exceed engine display ranges.

## Abandoned (do not revisit unless explicitly revived)
- **Full G20 country calibration** (19 sourced presets). Abandoned: only 5 of 19 calibrated cleanly; the data (esp. expected inflation for emerging economies) isn't reliably sourceable, the engine's Yₙ=100 index fights "show the real country," and selling wrong facts about real economies is a liability. Replaced by the handful of honest teaching challenges above. Sourcing work done survives as the references-doc appendix.
- **c0-forced-to-Y=100 reverse-engineering** — discarded (hid output gaps, the core IS lesson). c0 as a real per-country value is fine but only matters within a challenge, approximately.
- **Survival/points/election-cycle game layer** — fun, but pulls focus from mechanism-isolation. Possible separate "game mode" product someday; not now.

## Meta-note for future sessions
Multiple engine-touching ideas accumulated across this project (πᵉ-gating, c0 work, credibility, RP). Each reasonable alone; together they drift the tool away from "faithful Blanchard." The boundary above exists to catch that drift. When a new idea arrives, apply the test: changes the engine → future model; uses the engine → fine here.
