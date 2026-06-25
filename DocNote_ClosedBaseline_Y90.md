# Correspondence-doc note — closed economy in the unified tool (Y=90 pre-PC)

> Paste this into `Model_Textbook_Correspondence` (the closed-economy / πᵉ-gating section).
> Decision owner: Malin, 2026-06. Not routed to Frank — recorded as a Malin call.

## Closed economy = open equations with trade terms gated off

In the unified tool the closed economy is not a separate engine. It is the open-economy IS
(`isOutput` / `isRateForOutput`) with the open-only terms switched off when the UIP block is
locked: the import leakage m is forced to 0 and the trade terms (x₁·Y* − n₁·(ε − ε_base)) are
dropped. With m=0 the denominator returns the closed multiplier k = 1/(1 − c₁ − d₁) = 2.5
(c₁=0.5, d₁=0.1). The gate lives inside the two functions, so `solve()`, the plotted IS curve,
its label, and its drag handle all adopt the closed form together.

## Pre-PC baseline is Y=90, and that is correct (not a regression from v16)

The pre-PC stage (UIP and PC both locked) is Blanchard's core fixed-price short run (Ch. 3–5):
prices are constant, there is no inflation, so the nominal and real rate coincide — r = i.
This is the πᵉ-gating override (`effectivePiE` returns 0 until the PC block unlocks). At the
baseline policy rate i = 3% this gives r = 3%, and the goods market clears at **Y = 90**,
below potential (Yₙ = 100).

This differs from the retired standalone v16, which ran r = i − πᵉ internally at all times and
therefore sat at Y = 100 even before any Phillips-curve content was introduced — i.e. v16
applied a 2% Fisher correction in a stage that is supposed to have no inflation. The unified
engine removes that disconnect: the Fisher distinction (r = i − πᵉ) switches on only with the
PC block (the medium run), at which point the real rate falls to i − πᵉ = 1% and output
returns to Yₙ = 100.

### Why Y=90 — the mechanism, stated correctly

Y = 90 is a *real-interest-rate* result, not a "the closed economy is smaller" result. The
closed multiplier (2.5) is in fact larger than the open one (k_o ≈ 1.43); the closed economy
is the more interest-sensitive of the two. Output sits below potential purely because, in the
fixed-price short run, the real rate equals the full 3% nominal rate (no inflation to
subtract), and at a 3% real rate the goods market clears below Yₙ. It is a faithful short-run
equilibrium, not a slump to explain away. It self-corrects to Y = 100 once PC (the medium run)
unlocks and the real rate drops to 1%.

### Verifier encoding
- `verify_v19.mjs` 20a: pre-PC ({GOODS,ISLM}) → Y = 90 ± 0.1, r = i exactly, Y invariant to πᵉ.
- `verify_v19.mjs` 20b: medium run ({GOODS,ISLM,PC}) → Y = 100 ± 0.1, r = i − πᵉ.
