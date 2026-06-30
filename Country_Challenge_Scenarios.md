# Country Challenge Scenarios — three entries for the existing SCENARIOS array

These are **teaching challenges**, not calibration presets. Each is a normal `SCENARIOS` entry (same shape as `taylorPrinciple` etc.), with roughly-real starting numbers and a narrative that names the puzzle. Starting figures are approximate and rounded to sit cleanly inside engine ranges; exact sources live in the separate references doc. No `COUNTRY_PRESETS` array, no c0 threading, no new verifiers — these slot into `SCENARIOS` and reuse the existing debt-cue (Δd = (r−g)·d − s) as the student's own feedback.

## Engine-range constraints that shaped the numbers
- `B` slider maxes at **150** (= 150% of potential). Japan's real ~250% CANNOT be represented — see note at the bottom; I've substituted a workable third challenge and flagged Japan as a decision for you.
- `i_target` maxes at **0.15** (15%) — all three rates below fit fine.
- All three are DEBT-side challenges, so they leave `theta`/`cred` at neutral teaching defaults (the disinflation/credibility challenge is the held-back fourth, pending the open θ decision — see the Frank doc).
- `Y_n: 100` is kept in each state object only to match the existing entries' format; it is harmless (Yₙ is recomputed by the engine).

---

## Entry 1 — United Kingdom: the debt challenge (the anchor)

```javascript
{
  id: 'ukDebtChallenge',
  label: 'UK: the debt challenge',
  narrative: 'Approximate UK starting position (figures rounded for teaching — see references). Debt sits near 100% of potential output, the policy rate is close to trend growth, and there is a small primary deficit (G just above T). The puzzle: r is hovering around g, so the debt ratio is on a knife-edge. Watch the debt cue — can you bring Δd onto a stable or falling path? Try running a primary surplus (raise T above G), or cutting the rate to widen the g−r gap, and see the trade-off between fiscal pain now and a snowball later. There is no "win" — an economy runs forever — but you can move debt from snowballing to stable.',
  state: { G: 21, T: 20, P: 1.0, P_star: 1.0, i_target: 0.0375, i: 0.0375, i_star: 0.035, E_e: 1.0, pi_e: 0.02, Y_n: 100, alpha: 0.3, z: 0, z_pulse: 0, theta: 1.0, cred: 1.0, deanchor_on: true, phi: 1.5, taylor_on: true, speed: 0.5, B: 100, g: 0.011, period: 0, history: [] }
}
```
Puzzle taught: **debt dynamics / the r vs g snowball.** B=100, rate 3.75%, g=1.1% → r−g is positive, slight deficit → ratio drifts up. Student must create a surplus or change the rate. The debt-cue already computes and colours this.

---

## Entry 2 — France: the Eurozone constraint

```javascript
{
  id: 'franceEurozone',
  label: 'France: the eurozone squeeze',
  narrative: 'Approximate France starting position (figures rounded for teaching — see references). Debt is high (~110% of potential) and the primary balance is roughly neutral. The twist: France is inside the euro, so it does NOT set its own interest rate — the rate here represents the ECB''s, common to the bloc. With the monetary lever effectively out of national hands, the fiscal lever has to do the work. Try stabilising the debt ratio using G and T alone, and notice how much harder it is without being able to move your own rate. This is the lesson of a currency union: you trade monetary independence for membership.',
  state: { G: 23, T: 23, P: 1.0, P_star: 1.0, i_target: 0.04, i: 0.04, i_star: 0.04, E_e: 1.0, pi_e: 0.02, Y_n: 100, alpha: 0.3, z: 0, z_pulse: 0, theta: 1.0, cred: 1.0, deanchor_on: true, phi: 1.5, taylor_on: true, speed: 0.5, B: 110, g: 0.012, period: 0, history: [] }
}
```
Puzzle taught: **constrained policy space.** Same debt machinery, but the narrative frames the rate as exogenous (ECB), pushing the student to solve via fiscal policy only. Renders cleanly; France is also the best-sourced country in the audit, so "approximate" is barely a stretch here.
> Implementation note: the engine can't literally *lock* the rate slider per-scenario, so this constraint is conveyed in the narrative ("treat the rate as fixed by the ECB — solve with fiscal policy") rather than enforced in code. If you later want it enforced, that's a small separate feature (a per-scenario "rate locked" flag), not part of this drop.

---

## Entry 3 — Italy: high debt, low growth (the sustainability vise)

```javascript
{
  id: 'italyHighDebt',
  label: 'Italy: high debt, low growth',
  narrative: 'Approximate Italy starting position (figures rounded for teaching — see references). Debt is very high (~140% of potential) and trend growth is barely positive, so even a modest interest rate pushes r well above g — the snowball term (r−g)·d is large because d itself is large. A small primary deficit compounds it. The puzzle: with growth this low, can fiscal tightening alone stabilise the ratio, or does the sheer size of the debt make the arithmetic punishing? Compare how much harder this is than the UK challenge despite similar policy — that difference IS the lesson about why debt level matters once r exceeds g.',
  state: { G: 19, T: 20, P: 1.0, P_star: 1.0, i_target: 0.04, i: 0.04, i_star: 0.035, E_e: 1.0, pi_e: 0.015, Y_n: 100, alpha: 0.3, z: 0, z_pulse: 0, theta: 1.0, cred: 1.0, deanchor_on: true, phi: 1.5, taylor_on: true, speed: 0.5, B: 140, g: 0.007, period: 0, history: [] }
}
```
Puzzle taught: **how debt LEVEL amplifies the snowball.** B=140, g=0.7%, rate 4% → r−g large AND d large, so (r−g)·d is a big positive number — the student feels how a high-debt low-growth economy is far harder to stabilise than the UK even with the same tools. This is the foil that makes the UK challenge legible by contrast.

---

## Why these three (and not Japan)
The set spans three *distinct* debt lessons rather than three reruns of the same squeeze:
- **UK** — the knife-edge: r ≈ g, small deficit, ratio barely drifting. The clean introductory case.
- **France** — the constraint: you can't use the monetary lever (euro), solve with fiscal only.
- **Italy** — the amplifier: high d + low g makes (r−g)·d punishing; level matters.

**Japan was the original fourth idea** (huge debt, near-zero rate — "scary level, mild snowball"). It's a great lesson, BUT its ~250% debt exceeds the B slider cap of 150, so it can't be shown honestly without either capping it at 150 (which understates the very thing that makes Japan interesting) or widening the slider (an engine change, out of scope here). **Your call:** drop Japan, OR keep it at B=150 with a narrative that says "Japan's real debt is even higher than the slider allows — already an extreme case," OR widen the B slider to ~300 as a separate small task. I left it out of the three rather than ship a capped-and-misleading version.

The disinflation/credibility challenge (Brazil or South Africa) is the natural fourth and teaches the OTHER half of the model (Phillips/anchoring), but it depends on the unresolved θ-model decision — held back deliberately. See the accompanying decision doc.
