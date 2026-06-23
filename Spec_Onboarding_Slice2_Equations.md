# Spec: Onboarding Slice 2 — equation scoping + full-model permanent per-curve colouring

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER`
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` ONLY.
**Type of change:** DISPLAY only. Do NOT modify the economics engine (`solve`, `step`,
`computeYn`, `effectivePiE`, coefficients). Do NOT modify `verify_v16.mjs` or
`verify_v19.mjs`. Extend `verify_onboarding.mjs` (it grows per slice — single source
of truth, do not fork).

**Carved from** `Spec_Onboarding_StateMachine.md` — Parts B.1, B.3, B.5 and invariants
6, 8, 9 ONLY. The rest of that spec (Part A state machine, Part B.2 transient drill-down
highlight, Part B.4 drill-down layout, invariants 1–5, 7, 10) is **Slice 3/4 — OUT OF
SCOPE here. Do not build the drill-down, do not build any choreography, do not add a
transient/recency highlight.** This slice is the MAIN SCREEN only.

---

## Background

The main-screen "Show the equations behind this chart" boxes must (1) show only terms
whose block is unlocked, and (2) colour every shown term permanently by its curve. Item A
already implemented *ad-hoc* block gating for a few specific terms (NX gates on UIP; the
investment-rate symbol flips i→r on PC; the IS anchor drops to Y=C+I+G pre-UIP). Slice 2
**replaces those scattered conditionals with a single `term → block` map** that drives all
terms uniformly, then adds permanent per-curve colouring and the verifier assertions.

**Do not leave item A's inline gating in place alongside the new map** — that would be two
mechanisms doing scoping, which drift apart. Refactor item A's NX/anchor/symbol gating so it
is driven by the same `TERM_BLOCK` map this slice introduces. The *behaviour* item A
produced must be preserved exactly (verify_v19 #16 and the browser gating still hold); only
the *mechanism* generalises.

---

## Five blocks (note: source spec predates DEBT)

`Spec_Onboarding_StateMachine.md` lists four `BlockId`s (`GOODS, ISLM, UIP, PC`). The
canonical order is now **five**: `GOODS → ISLM → UIP → PC → DEBT` (Slice 1 already added
DEBT to `verify_onboarding.mjs`). The `term → block` map and scope assertions in this slice
MUST cover all five.

---

## Part 1 — The `TERM_BLOCK` map (the single source of scoping truth)

Introduce one map from equation term → owning block, near `EQ_COL` (≈line 1353). Every term
rendered in any main-screen equation box must have an entry. Drive BOTH scoping (Part 2) and
colouring (Part 3) from it. Do not scatter `unlocked.has(...)` conditionals through
`drawEquations` — they all route through this map.

Block assignment for each term (confirm against the equation boxes as built):

- **GOODS:** `G`, `T`, the consumption term `C = c₀ + c₁(Y−T)`, the `Y = C + I + G` anchor
  spine. (GOODS terms are economically IS-curve terms — see colour note below.)
- **ISLM:** the policy rate `i` / MP line term, the investment term `I = d₀ + d₁Y − d₁ᵣ·(rate)`.
- **UIP:** the net-exports term `NX` / `− n₁(ε−1) + x₁Y*`, and the `+ NX` addend in the anchor.
- **PC:** `πᵉ`, the gap term `α(Y−Yₙ)/Yₙ`, the `+ shock` term, the Fisher/real-rate
  distinction `r = i − πᵉ`.
- **DEBT:** debt-dynamics terms `B`, `g` IF they render in an equation box. **OPEN: confirm
  whether the debt box shows equation terms that need scoping, or is purely a time-series
  chart. If no equation-box terms, DEBT needs no TERM_BLOCK entries — report which.**

**Export `TERM_BLOCK`** (alongside the engine exports the verifier already pulls) so
`verify_onboarding.mjs` can assert scope from the same map the renderer uses. This is the
INV-6 hook — the assertion and the renderer must read the *same* object.

---

## Part 2 — Scoping (B.1, invariant 6)

A term renders in a main-screen equation box only if `TERM_BLOCK[term] ∈ tutorialState.unlocked`.
Each unlock *adds* its terms; the learner watches the equation grow in learning order.

Required scoped behaviours (these reproduce item A, now via the map):
- Pre-UIP: IS anchor reads `Y = C + I + G` (no `+ NX`); no net-exports line.
- UIP unlocked: `+ NX` appears in the anchor; net-exports line shows.
- Pre-PC: no `πᵉ`, no gap/Phillips line, no Fisher `r = i − πᵉ`; the investment-rate symbol
  reads `i` (because pre-PC the engine uses r=i — keep this tied to PC scope).
- PC unlocked: `πᵉ`, the gap term, the `+ shock` term, and the Fisher line all appear; the
  investment-rate symbol reads `r`.

### PC equation — pinned form (decided; no Frank dependency for this slice)
The Phillips curve renders in **gap form**, matching the engine and the (Y,π) graph:

```
π = πᵉ + α(Y−Yₙ)/Yₙ + shock
```

- The structural wage-setting term (`z_struct`, internal) does **NOT** appear in the PC box —
  it lives inside Yₙ. (A future Slice 3 derivation graph may show the level form `π = πᵉ +
  (m+z) − αu` in (u,π) space; NOT this slice.)
- The transitory PC disturbance is labelled **`shock`** (not `z`). It renders **always,
  including when it is 0** (showing `+ 0.00%` tells the learner "no shock right now"). It is a
  live PC-block term: colour it PC-purple like any other PC term — **do NOT grey it when zero**
  (zero ≠ locked). Wire it to the engine's existing transitory channel (`s.z + s.z_pulse`); no
  engine change.

---

## Part 3 — Permanent per-curve colouring (B.3, invariants 8, 9)

In the main-screen equation boxes, colour is **permanent and per-curve**, NOT a recency
highlight. Every shown term is coloured by the curve it belongs to, all the time; multiple
blocks' terms are coloured simultaneously; nothing reverts to black. (This is the OPPOSITE of
the Slice-3 drill-down transient highlight — do not import that behaviour here.)

- Every term's colour MUST equal `EQ_COL[block]` for its block. Use the existing `EQ_COL`
  (≈line 1353) and `eqColor(txt, col)` helper. **Do NOT introduce a second colour table.**
- **`EQ_COL` gap:** it currently has `{IS, MP, UIP, eps, PC, P, i, pi}` — no `GOODS` or `DEBT`
  key. GOODS terms are IS-curve terms, so **GOODS → `EQ_COL.IS` (red `#d85a30`)**; do not add a
  new GOODS colour. If DEBT terms render (Part 1 open question), add a `DEBT` key to `EQ_COL`
  using the existing debt series colour (`#0f6e56`, the B/Y trace) — but note that collides
  with UIP green; **if DEBT needs equation-box colouring, FLAG the collision and stop for a
  human decision rather than picking a colour.**
- Map block→EQ_COL key: GOODS→IS, ISLM→MP (the rate) and IS (investment/goods terms — assign
  per term, not per block, since the ISLM box mixes IS-red goods terms and MP-blue rate terms),
  UIP→UIP, PC→PC. Drive this from `TERM_BLOCK` + a small block→EQ_COL-key lookup.

---

## Part 4 — Verifier (`verify_onboarding.mjs`, extend; INV-6, 8, 9)

Add assertions, mirroring the existing structure (slice-import, run transitions, assert, BAD
fixtures, `process.exit(1)` on fail). Pull the exported `TERM_BLOCK`.

- **INV-6 (scope).** For several `unlocked` sets (GOODS only; +ISLM; +UIP; +PC; +DEBT/full),
  the set of rendered terms equals exactly `{t : TERM_BLOCK[t] ∈ unlocked}`. No term from a
  not-yet-unlocked block appears. Assert from the exported map (renderer and assertion read the
  same object). BAD fixture: a term deliberately scoped to the wrong block MUST fail.
- **INV-8 (permanent full-model coding).** With multiple blocks unlocked, every rendered term
  is coloured (none black-by-default) and multiple blocks' colours appear simultaneously; assert
  nothing reverts to black. BAD fixture: a term left black MUST fail.
- **INV-9 (palette binding).** Every term's colour equals `EQ_COL[itsBlock-key]`. Grep-style
  check that there is no second colour-literal table. BAD fixture: a term coloured with a
  non-EQ_COL literal MUST fail.

INV-7 (transient drill-down highlight) and INV-10 (drill-down layout) are **Slice 3 — do not
add them here.**

---

## Acceptance (report back)

1. `node verify_onboarding.mjs` green, INV-6/8/9 groups passing + BAD-fixtures caught.
2. `node verify_v19.mjs` 40/0 and `node verify_v16.mjs` green — engine unperturbed.
3. In-HTML console self-tests still 5/5.
4. Confirm item A's inline NX/anchor/symbol gating is now driven by `TERM_BLOCK` (one
   mechanism, not two), and the item-A behaviour is preserved (browser: NX on UIP, symbol i→r
   on PC, anchor pre-UIP).
5. Confirm `TERM_BLOCK` is exported and the verifier reads it (not a duplicated map).
6. Report the DEBT open question (Part 1) and the EQ_COL DEBT-colour collision (Part 3) if
   reached — do NOT guess a colour.

## Browser check (human, beyond verifier-green)
Scoping + colouring is visual: confirm in-browser that terms appear in learning order on each
unlock, all terms are permanently curve-coloured (nothing black, nothing reverts), and the PC
box reads `π = πᵉ + α(Y−Yₙ)/Yₙ + shock` with `+ shock` visible at 0 and PC-purple.

## Guardrails
- DISPLAY only. No engine edit. No `.docx`. No git (human commits).
- One `TERM_BLOCK` map; one `EQ_COL`. No parallel tables.
- Do NOT build the drill-down, choreography, transient highlight, or layout (Slice 3/4).
- Do NOT weaken or widen any assertion to go green; if an invariant can't hold, report it.
- Preserve Unicode in the HTML (πᵉ, ε, −, subscripts) — targeted edits, no whole-file re-encode,
  no Set-Content.
