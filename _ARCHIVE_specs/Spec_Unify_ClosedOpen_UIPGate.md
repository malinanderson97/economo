# Spec: Unify v16/v19 into one tool — closed vs open economy gated on UIP unlock

> Status: DRAFT for Frank sign-off + Antigravity. Supersedes the planned "v16 parity"
> port (v16 is to be retired by this change, so porting the tooltip system into it is moot).
> Base file: `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (the richer file — has the
> full tooltip system, drill-downs, Slice 1–3b). The closed economy is just the open
> equations with the trade terms gated off (m=0, no exchange-rate channel). It uses the
> closed multiplier k=2.5; its pre-PC short-run baseline is Y=90 at i=3% (r=i, no inflation
> — see §3). v16 is then archived.

## 1. Goal (one sentence)
The single unified tool (v19 base) behaves as a **closed economy** when the `UIP` block is
locked (closed multiplier k = 2.5, no exchange-rate channel) and as an **open economy** when
`UIP` is unlocked (open multiplier k_o ≈ 1.43, UIP + trade channel), with the switch read
entirely off `tutorialState.unlocked` and no separate user-facing toggle.

## 2. Which model(s) and which function(s)
- **File:** v19 only (it becomes *the* file). v16 is archived, not edited.
- **Functions, all in the headless slice:**
  - `isOutput(G, T, r, eps, c1, m1, Ystar)` — gate the open-only terms.
  - `isRateForOutput(Y, G, T, eps, pi_e, c1, m1, Ystar)` — gate the same terms, inverse.
  - A new tiny helper `openOn()` (mirrors the existing `effectivePiE` gating pattern) =
    `tutorialState.unlocked.has('UIP')`. `solve()` is **not** forked; it calls the gated
    `isOutput`/`isRateForOutput` exactly as today.
- **No new control.** The closed/open distinction IS the Level 1 → Level 2 unlock boundary.

### ⚠️ The gate MUST live INSIDE `isOutput`/`isRateForOutput`, never at the call sites
The IS curve plot (`drawLine`/`isPts` loop ~line 1116), the end-of-curve "IS" label
position (~1127), and the draggable IS handle (~1135) **all already route through
`isRateForOutput`** — they do not recompute the curve independently. Same for `solve()` (it
calls `isOutput`). Therefore: gate once, inside each function — when `!openOn()`, force the
local `m` to 0 and drop the `x1·Ys − n1·(eps − base)` autonomous terms — and the engine
output, the plotted curve, its label, and its handle ALL adopt the closed slope together,
automatically. **Do NOT branch at the call sites.** Gating at call sites is the direct route
to the "engine-correct but diagram-wrong" failure class (notes: the IS-plot wrong-argument
incident): miss one of the 7+ call sites and the drawn curve silently diverges from `solve()`.
A single in-function gate makes that divergence structurally impossible.

## 3. The economics (anchor to the textbook)
- **Closed IS-LM (UIP locked):** Blanchard Ch. 3–5. Goods market with closed multiplier
  k = 1/(1 − c₁ − d₁). At c₁=0.5, d₁=0.1 → **k = 2.5**. No imports, no exports, no real
  exchange rate. This is the existing v16 model (Ch. 9 closed anchor).
- **Open IS-LM-UIP (UIP unlocked):** Blanchard Ch. 18–19. Import leakage m₁ enters the
  multiplier denominator: k_o = 1/(1 − c₁ − d₁ + m₁); trade terms x₁·Y* − n₁·(ε − ε_base)
  enter autonomous demand; UIP (eq. 19.5) pins E. At baseline m₁=0.3 → **k_o ≈ 1.4286**.
- **The gate is exactly the closed→open transition Blanchard draws between the core model
  and the open-economy chapters.** Setting m=0 AND dropping the trade terms recovers the
  closed multiplier and the closed IS curve from the open form — algebraically the open
  model nests the closed one. This is faithful: opening the economy = unlocking m₁, x₁, n₁,
  UIP simultaneously, which is precisely the Level 1 → Level 2 step.

### Fidelity note — one confirmation for Frank (per template §3)
The closed economy is the open equations with the trade terms switched off (m=0, no
`x₁·Y* − n₁·(ε−ε_base)` channel), using the closed multiplier k=2.5.

**It is NOT numerically identical to retired v16, and that is deliberate.** In the pre-PC
short-run stage (UIP and PC both locked) the unified engine runs `r = i` — there is no
inflation in the core short run, so the nominal and real rate coincide (Blanchard Ch. 3–5;
this is the πᵉ-gating override). At the baseline i=3% this gives **Y=90**. Old v16 always ran
`r = i − πᵉ` internally regardless of what the student had unlocked, so it sat at Y=100 by
applying a 2% Fisher correction in a stage that is supposed to have no inflation. The unified
engine corrects that disconnect: inflation (and therefore the Fisher distinction) only appears
once the PC block — the medium run — is unlocked, at which point baseline returns to Y=100=Yₙ.

So the closed economy CHANGES vs v16 in exactly one way, and it is a correction, not a
regression: pre-PC it shows the honest fixed-price short-run equilibrium (Y=90, r=i) instead
of v16's hidden-inflation Y=100. Record this in `Model_Textbook_Correspondence` and get
Frank's confirmation that (a) computing the closed economy by gating off the open terms is
fine, and (b) the pre-PC closed economy correctly sits at Y=90 with r=i (no inflation in the
core short run). This is the πᵉ override applied to the closed case — the same decision already
flagged for him, now with a concrete numeric consequence.

### Interaction with the πᵉ gate (independence — state the full truth table)
The two gates are **independent**. `effectivePiE` gates on `PC`; the open/closed gate is on
`UIP`. Level 2 (IS-LM-UIP) is open economy with PC still locked → r = i (nominal), open
multiplier. The unlock sequence already places UIP before PC, so this combination is reachable
and must be correct.

| Level | unlocked set                  | multiplier | trade channel | r        | Fisher line | πᵉ control |
|-------|-------------------------------|------------|---------------|----------|-------------|------------|
| 0     | {GOODS}                       | —          | off           | —        | hidden      | off        |
| 1     | {GOODS, ISLM}                 | k = 2.5    | **off**       | r = i    | hidden      | off        |
| 2     | {GOODS, ISLM, UIP}            | k_o ≈ 1.43 | **on**        | r = i    | hidden      | off        |
| 3*    | {GOODS, ISLM, PC}             | k = 2.5    | **off**       | r = i−πᵉ | shown       | on         |
| 4     | {GOODS, ISLM, UIP, PC}        | k_o ≈ 1.43 | **on**        | r = i−πᵉ | shown       | on         |

\* Level 3 (closed + PC) is the Ch. 9 closed medium-run anchor: UIP locked → closed
multiplier, PC unlocked → real-rate distinction on. This is the cell most likely to be
got wrong, because both gates are active in opposite directions. Verifier must cover it.

## 4. What must NOT change
- **Open-economy behaviour at full unlock (Level 4) is byte-for-byte identical to today.**
  When `UIP` ∈ unlocked, `isOutput`/`isRateForOutput` must compute exactly what they compute
  now. The gate adds a *closed branch*; it must not perturb the open branch.
- Baseline at full unlock: Y_n = 100, k_o ≈ 1.4286, the existing `verify_v19.mjs` 40/0.
- The πᵉ/`PC` gate (`effectivePiE`) is untouched and stays independent.
- No new user-facing control, slider, or button. UIP sliders (i*, Eᵉ, m₁, Y*) follow the
  existing lock/grey presentation for the `UIP` block — no new hide logic beyond what Slice 1
  already does.
- The verifier all-unlock hook (v19 line ~2356, `tutorialState.unlocked = new Set([...all])`)
  must still force the open path for the existing open-economy assertions.

## 5. The invariant(s) that must hold afterward  ← the whole point
Encode ALL of these as assertions in the unified verifier (see §6 for file naming):

1. **Closed multiplier.** With `tutorialState.unlocked = new Set(['GOODS','ISLM'])`:
   ΔY/ΔG = 2.5 ± 0.05 for a +1 G shock at baseline. (Closes the same gap the v19
   `ΔY/ΔG ≈ 1.43` assertion closed for the open side.)
2. **Open multiplier preserved.** With UIP unlocked: ΔY/ΔG = 1.43 ± 0.05 (existing check,
   must still pass).
3. **No trade channel when closed.** With UIP locked, `solve()` output (Y, r, π) is
   **invariant** to `i_star`, `E_e`, `m1`, and `Ystar`. Mutate each across its slider range;
   Y must not move. (Mirror of the existing "output invariant to πᵉ when PC locked" check.)
4. **Closed baseline, two cells (the v16-divergence check).**
   (a) **Pre-PC short run** — unlocked = {GOODS, ISLM} (UIP and PC both locked): default state
       → Y = 90 ± 0.1, with r = i exactly (r = 0.03 at baseline i=3%), and Y invariant to πᵉ.
       This is the honest fixed-price short run — no inflation, so no Fisher correction. (This
       differs from retired v16, which ran r=i−πᵉ always and sat at Y=100; the divergence is
       deliberate per §3.)
   (b) **Medium run** — unlocked = {GOODS, ISLM, PC} (PC on, UIP locked): default state
       → Y = 100 ± 0.1, because r = i − πᵉ = 0.01 once the Fisher effect switches on with PC.
   Both must hold. (a) is the assertion that proves the πᵉ override is actually applied to the
   closed case; (b) confirms the medium-run baseline returns to potential.
5. **Level-3 cross-cell.** unlocked = {GOODS, ISLM, PC}: closed multiplier (2.5) AND
   r = i − πᵉ both hold simultaneously; output invariant to i*/Eᵉ/m1/Ystar; output DOES
   respond to πᵉ. (The dangerous opposite-gates cell.)
6. **Gate independence.** The four-cell product (UIP ∈ {locked, unlocked}) × (PC ∈ {locked,
   unlocked}) each produces the multiplier and r-rule from the §3 truth table.
7. **Curve reconciles to engine (closed).** UIP locked: the equilibrium point sits ON the
   plotted IS curve — `isRateForOutput(solve(s).Y, ...)` ≈ `solve(s).i` to tol 0.001 — AND
   the closed IS slope is **flatter** than the open one (compare `isRateForOutput` at two Y
   values with UIP locked vs unlocked; the closed |Δi/ΔY| is **smaller** because the slope
   is 1/(d1r·k) and the closed multiplier k=2.5 > open k_o=1.43, so a larger multiplier ⇒
   flatter curve in (Y,i) space). Assert `slopeOpen > slopeClosed`.
   [CORRECTED 2026-06: an earlier draft said "closed steeper" — that was wrong. A larger
   multiplier means output responds more to a given rate change, i.e. a flatter IS in (Y,i)
   space. Import leakage makes the open economy less rate-sensitive, hence steeper. Verified
   against the engine: slope = 1/(d1r·k_o), closed 1/(200·2.5)=0.0020 < open 1/(200·1.43)=0.0035.]

A spec that adds engine branches without invariants 1, 3, and 5 is not ready — those three
are where a wrong gate hides.

## 6. Done criteria
- [ ] Verifiers green. **Naming decision needed:** fold `verify_v16.mjs`'s closed-engine
      assertions into a `verify_v19.mjs` "closed-mode" block (recommended — one file, mirrors
      one tool), then archive `verify_v16.mjs`. Expected new count: `verify_v19.mjs`
      40 + (≥6 new closed/cross-cell assertions) = **≥46/0**; `verify_onboarding.mjs` 95/0
      unchanged. State final numbers when implemented.
- [ ] Invariants §5.1, §5.3, §5.5 encoded as assertions, not hand-checked.
- [ ] `mutation_check.mjs` extended: sabotaging the closed branch (e.g. forcing k_o in
      closed mode) must be caught.
- [ ] **Browser check** (verifier-green ≠ diagram-correct): in closed mode the UIP curve and
      its drill-down are hidden/locked, the IS curve redraws with the flatter closed slope
      (closed multiplier is larger ⇒ flatter IS; open is steeper),
      and toggling UIP unlock live-updates both engine output and the visible curves. Confirm
      no clipped/off-screen/wrong-direction regressions.
- [ ] `Model_Textbook_Correspondence` updated with the §3 fidelity note: closed = open
      equations with trade terms gated off (k=2.5); pre-PC closed economy runs r=i with no
      inflation, so baseline = Y=90 (NOT v16's Y=100 — v16 applied a hidden Fisher correction;
      the divergence is a deliberate correction). Recorded BEFORE code lands per template §3.
- [ ] v16 HTML archived (moved out of the active build path, not deleted); README, master
      plan, and correspondence doc tier/version language swept (this absorbs Item D's
      single-version cleanup).
- [ ] Committed by Malin after green: `git add -A && git commit -m "Unify v16/v19: closed/open economy gated on UIP unlock"`.

## 7. Sequencing & risk notes (not part of the contract)
- This supersedes v16 parity entirely. Do NOT port the tooltip system to v16 first.
- `solve()` is the highest-stakes function in the repo; this is the largest engine change
  since the πᵉ override. Headless-safety (§1a) applies: the gate helper `openOn()` must live
  in the headless slice, must not touch the DOM, and must be pure. Run the HS-1 construct-check
  after the edit.
- Migration order suggested for Antigravity: (1) add `openOn()` + gate `isOutput`/
  `isRateForOutput`, verify open path unchanged (invariant §5.2 still green) BEFORE touching
  presentation; (2) add closed invariants; (3) wire UIP-curve/drill hide to the gate;
  (4) browser-check; (5) archive v16 + doc sweep. Commit after each green step (Slice 3b
  precedent: uncommitted-then-reverted work is lost).
