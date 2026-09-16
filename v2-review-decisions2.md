# Model–Textbook Correspondence v2 — review decisions log

Running record of everything settled in the review session. Items are numbered as in the
original review list. "Parked" means the fix depends on a model change and should be made
after the engine is rebuilt, not before.

---

## A. Model changes decided

### M1. Taylor rule becomes contemporaneous
`step` currently computes the rule from this period's π and gap and applies it to **next**
period. Change to: solve iₜ jointly with Yₜ each period (fixed point in i; everything is
linear in i, so bisection or closed form; ZLB as clamp-and-resolve).

Reason: the lag is an engine artefact, not economics. Blanchard's rule (p. 494) is
contemporaneous. The lag — not the strength of the response — is what causes the ρ = 0
oscillation.

Measured consequences (prototype, closed IS-LM-PC, G + 5):

| | t0 | t1 | t2 | t3 |
|---|---|---|---|---|
| lagged (current), ρ = 0.75 | 112.5 @ 3.0% | 98.8 @ 5.7% | 100.1 @ 5.5% | 100.0 |
| lagged, ρ = 0 | 112.5 | 57.7 @ 14% | 126.6 @ 0% | 30 @ 23% (diverges) |
| contemporaneous, ρ = 0.75 | 105.1 @ 4.5% | 102.1 @ 5.1% | 100.8 @ 5.3% | 100.3 |
| contemporaneous, ρ = 0 | 100.0 @ 5.5% | 100.0 | 100.0 | 100.0 |

- ρ becomes a **gradualism dial** (Blanchard's flexible inflation targeting, p. 493), not a
  stability patch. Keep ρ = 0.75.
- With ρ = 0 a demand shock is fully offset on impact, because ī is shock-aware. This is
  the divine-coincidence result and is correct; it just shows the student less.
- The shock-aware ī and the contemporaneous rule fit together; a fixed ī = 3% would leave a
  permanent gap.

### M2. n₁ = 70 → 21
From Blanchard's Ch. 18 appendix elasticities (p. 393: 1% depreciation ⇒ exports +0.9%,
imports −0.8%, which he calls reasonable numbers). At the calibration point:
−∂X/∂ε + ∂IM/∂ε − IM = 27 + 24 − 30 = 21.

70 had been chosen so the ±30% Eᵉ slider filled the 70–130 chart. That is three times
Blanchard's figure.

Consequences (verified headlessly, nothing breaks, no clamps hit, ZLB never binds):
- medium run through P/P\* roughly three times slower (preset 4: potential at t ≈ 40, not t ≈ 20)
- Eᵉ slider ±30% now moves output ±10.5 rather than ±30 — consider narrowing the slider
- preset 5 loses its point (see M3)

### M3. Preset 5 (global rate hike) — raise i\*
Impact effects at the new constants (c₁ = 0.6, n₁ = 21, rule off):

| i\* | depreciation | Y | π |
|---|---|---|---|
| 6% (current, 3pp) | 2.8% | 101.0 | 2.28% |
| 8% (5pp) | 4.6% | 101.6 | 2.46% |
| 10% (7pp, slider ceiling) | 6.4% | 102.2 | 2.63% |

Even at the ceiling this is a modest demand shock — which is honest: with Blanchard's
elasticities a foreign rate hike does not do much to a domestic economy, and the interesting
part of the preset is the rule's response over time, not the impact. Pick the value **after**
M1 lands, since the rule's response is what the preset demonstrates, then write the narrative
to the numbers.

### M4. c₁ = 0.5 → 0.6, c₀ = 20 → 12
c₁ = 0.6 is Blanchard's "reasonable estimate" (§3-3, p. 53). c₀ follows from the anchor:
60 = c₀ + 0.6 × (100 − 20) ⇒ c₀ = 12. b₁ = 0.1 unchanged.

Reason the old split (c₁ = 0.5 + b₁ = 0.1, preserving k = 2.5) is dropped: Blanchard's own
p. 53 note says the Ch. 3 multiplier of 2.5 is larger than the evidence supports **because**
that model omits the monetary-policy reaction and import leakage — both of which this model
has. Preserving 2.5 matches a number he disowns.

Engine edits: `initialState.c1` → 0.6; `IS_C0` → 12 (and its stale `= 32 − 12` comment); the
`c1 !== undefined ? c1 : 0.5` fallbacks in `isOutput` and `isRateForOutput`; the
`Baseline isOutput = IS_Y_BASE` self-test passes c₁ = 0.5 explicitly and will fail otherwise.

Measured (at n₁ = 21):

| | c₁ = 0.5 / c₀ = 20 | c₁ = 0.6 / c₀ = 12 |
|---|---|---|
| k closed / open | 2.50 / 1.429 | 3.33 / 1.667 |
| calibration point | Y 100, C 60, I 20, G 20, NX 0 | identical |
| opening Y, IS-LM | 90.0 | 86.7 |
| opening Y, IS-LM-UIP | 94.3 (NX 1.71) | 93.3 (NX 2.00) |
| rate slider 0 / 15% | 109.4 / 62.2 | 111.0 / 55.9 |
| impact per 1pp of i | −3.15 | −3.67 |
| Eᵉ ±30% | 109.0 / 91.0 | 110.5 / 89.5 |
| G + 5 impact (open / closed) | 107.1 / 112.5 | 108.3 / 116.7 |
| b₂k_o/Yₙ (the ψ argument) | 2.86 | 3.33 |

### M5. Cost-push shock stays additive — confirmed, not changed
An m-pulse (Blanchard's actual mechanism, Ch. 9 p. 185) was considered and rejected: through
α_ws = 3 a +5pp markup pulse raises uₙ by 1.7pp, lowers Yₙ to 98.25, and yields only ≈ 0.5pp
of inflation. Matching the current 5pp spike would need a markup pulse of ≈ +50pp.

The additive form is standard (Mankiw's ν; every NK cost-push shock) and Blanchard's chapter
summary says supply shocks "directly affect inflation". Document it as the tool's form.
Instructor Manual to note that the **permanent** version of the same event is the m slider,
which does move uₙ and Yₙ.

### M5b. Dynamics chart — axis label to the left-hand side
Move the axis label in the "Dynamics over time" chart to the left. Goes in the housekeeping
batch with the other display edits.

### M7. "Blanchard only" switch for the equation box (new feature)
A toggle that shows each equation in the box in Blanchard's own form rather than the tool's
implemented form, so a student does not carry away a linearisation as the textbook relation.
Example: net exports shows NX(Y, Y\*, ε) = X(Y\*, ε) − IM(Y, ε)/ε (eq. 19.1) instead of
x₁Y\* − m₁Y − n₁(ε − 1).

**Two design decisions to settle before building.**

1. *What the numeric line shows.* Blanchard's general form has no coefficients, so any number
   underneath is still produced by the tool's linearisation. Showing a substituted "derivation"
   would reintroduce the problem the switch exists to fix. Show **arguments and result only** —
   e.g. `NX(100, 100, 1.00) = 0.0` — and leave the coefficients to the tool-form setting.
2. *Equations with no counterpart.* Roughly a third of the box has no Blanchard equivalent:
   the credibility stock, the anchoring weight λ, the Eᵉ update, P and P\* dynamics, the
   smoothing ρ, ψ, the cost-push pulse. **Do not hide them** — a student would see a model
   apparently running on textbook equations alone while the dynamics come from somewhere
   invisible. Show them greyed and labelled "no textbook counterpart — see Correspondence
   §6/§8/§9". The switch then teaches the distinction, which is the point.

**Build the mapping from the document's badges**: everything badged *Blanchard*,
*Blanchard, rearranged* or *Blanchard, linearised* has a switch state; everything badged
*Tool addition* or *Tool departure — calibration* does not. The badges are already the spec.

### M8. Full reference and tooltip pass (after the doc is rebuilt)
Wider than items 33–35, which only cover the stale section numbers. Every equation-box
reference, every `SYMBOL_DEFS` entry and every help tooltip to be checked against **both**
the new correspondence numbering and the corrected Blanchard pages verified in this review
(112, 143, 158, 159, 169, 79, 53, 494, 185, 393). Do this once the rebuilt doc gives a stable
target; M7 will add references of its own, so sequence M8 after it.

### M6. Feature backlog (later development, not now)
**Currency risk premium in UIP**: E = Eᵉ(1 + i − ρ)/(1 + i\*), ρ ≥ 0 exogenous, open stages
only. Motivated by §17-2 (UIP stated on the explicit assumption that investors ignore risk,
which Blanchard immediately flags as too strong) and §20-3 (devaluation risk; margin note
"our computation ignores the risk premium"). It is the only control that would depreciate the
currency while expanding output — the capital-flight scenario the rate slider gets backwards.
Badge as a tool addition.

---

## B. Document fixes agreed

### 1. §2 Values (b₂), §5 Values (ψ) — rate response
Replace the IS-only figure and the chart claim. At the new constants (c₁ = 0.6, n₁ = 21):
a 1pp rate change moves output by ≈ 3.7 in the full model (≈ 3.3 through the multiplier on
investment, ≈ 0.4 through the exchange rate); **6.7** in the closed economy (k = 3.33 × ΔI = 2).
Slider 0–15% gives ≈ 111 to ≈ 56 in the full model; the closed IS-LM-PC stage runs 120 → 30,
i.e. it hits the output clamp (see item 28).

**Drop** "so the whole range stays comfortably on the chart" — the IS-MP axis is 70–130 and
the point leaves it above roughly i = 10%. If a sentence is wanted, restrict it to the range
a central bank would use (0–8%).

### 2. §3.2 ×2, §3 code drawer — no chart marker
There is no neutral-rate marker on any chart. The neutral rate appears only in the equation
box's "Taylor i" line, greyed with "(rule off — not applied)" when the rule is off, and only
**once the Phillips-curve block is unlocked**. Rewrite all three sentences to that. The code
drawer's "the same two lines are repeated where the chart marker and the equation box are
drawn" becomes "…where the equation box is drawn".

### 3. §8 Values — adjustment weight
State the settings at the head of the paragraph: full model, Taylor off, θ = 0, cred = 1,
i raised 3% → 4% and held. Attribute the recovery to the **price-level channel of §9**
(P grows slower than P\*, ε falls, NX rises) — Ch. 20's medium run — **not** "as expectations
adjust": at θ = 0, πᵉ is 2% at period 0 and 2% at period 20. At θ = 1 the run is unstable in
the other direction — deflationary collapse to Y ≈ 64 — which is still Blanchard's
fixed-nominal-rate instability. Figures re-measured; see section I.

### 4. §4.2, §4 Values — cost-push shock pedigree
The **episodes** are Blanchard's (§8-3: 2020–22 markup rise, faded when commodity prices
turned; 1970s oil de-anchoring). The **form** is the tool's: Blanchard's temporary markup rise
enters through eq. 8.4 and so temporarily raises uₙ and lowers Yₙ (Ch. 9, p. 185); the tool
adds the shock to inflation directly and holds Yₙ fixed. Say so in both places.

### 5. §6.3, index 6.4, §6 header, §6 References — eq. 8.10
The numbered eq. 8.10 has πₜ₋₁, not πᵉ. Keep the displayed πᵉ form (it is what the argument
uses, and Blanchard's own prose describes it) and change the label in all four places to
**"§8-4, p. 169; the equation preceding 8.10"**.

### 7. §3.3 (3.4) — ZLB symbol
`i = max(0, ī)` → `i = max(0, i)`, matching the equation index. The bound applies to the
chosen policy rate; ī is never clamped.

### 8. §3 Values, §3 code table — ZLB cross-reference
"(3.3)" → "(3.4)" in both. §5's "(§3.3)" is a section reference and is correct — check the
build script renders the § sign.

### 8b. (3.1) — drop the bar
Write (3.1) without the bar and cite **§23-2, p. 494**, where i is "the policy rate, that is,
the nominal interest rate controlled by the central bank". §5-3's "i = ī" uses the bar in the
opposite sense to the rest of §3 and is the source of the collision.

### 9. §2 Values (b₁, b₂) — "never a coefficient"
False as written. Ch. 5 Problem 5 (pp. 105–106) sets I = 150 + 0.25Y − 1000i. Cite it and say
why it doesn't fit rather than dismissing it as illustrative: its b₁ = 0.25 is paired with
c₁ = 0.25 (k = 2); combined with the text's c₁ it would give k = 4. Its b₂ = 1000 in an
economy of Y = 1000 is a 1%-of-output response per point — half the tool's 2%.

### 10. §7 Values (n₁) — magnitude exists
Replace "Blanchard gives only the sign, no magnitude". Derive 21 from the p. 393 elasticities
(see M2). Badge: the value is Blanchard's, the linear form is the tool's.

### 11. Project file — replace Demo9_2 with Demo9_3
The project folder still holds Demo9_2 (d-naming, no `DEANCHOR_SCALE`). §0 states Demo9_3.
Replace it, and again after each engine change, so the file lecturers get matches the doc.

### 11b. §1.2 / §2 Values "Opening output" — the stage figures move
Under M4 the pre-PC stages open lower: **Y = 86.7 closed (was 90), ≈ 93.3 open (was 94.3),
NX +2.00**. The claim being made — output below potential because r > rₙ — is unchanged.
Update both places where these appear (§1.2 and the "Opening output" paragraph of §2 Values).

### 12. §2.3, §2 References — page
p. 121 → **p. 112** (confirmed in the book). p. 121 is in §6-3 where the risk premium is in
play, so the statement would not even hold there.

### 13. §3.3 — negative rates
Drop "only as an empirical puzzle (a Ch. 6 problem)". Cite the **margin note on p. 79**, the
same page as the ZLB definition: people hold bonds "even when the interest rate is a bit
negative" (Germany), "another complication we ignore here". The tool does the same.

### 14. §4.0, §4 References — split the row
- W = Pᵉ F(u, z) — eq. 7.1 — §7-3 — **p. 143**
- specific form W = Pᵉ(1 − αu + z) — §8-1 — **p. 158**, unnumbered
- P = Pᵉ(1 + m)(1 − αu + z) — eq. 8.1 — **p. 159** (row was already right)

§4.0's inline citation currently attaches "eq. 7.1" to the specific form; fix likewise.

### 15. §8.3 — the flexible-rates quote
Cut the "a country under flexible rates must accept exchange-rate movement" clause. Blanchard's
sentence (p. 428) concludes a passage about markets reacting rationally to **news about future
interest rates** — forward-looking expectations, which the tool does not have. State plainly:
the tool's Eᵉ is backward-looking, so there is no news effect and no forward solution; what it
reproduces is §20-3's comparative result (a lasting differential moves E more) by accumulation
rather than anticipation, pp. 427–428.

General test to apply across §8: drift from accumulation is not volatility from news.

### 16. §3.2, §0 notation — ī's name
Blanchard never writes "neutral nominal rate". On p. 494 ī is "the target nominal interest
rate — the nominal interest rate associated with the neutral rate of interest, rₙ, and the
target rate of inflation". State ī as the tool's name and his as the target nominal rate.
"Neutral" is his word for rₙ.

### 17. §6.4 — credibility asymmetry
"The asymmetry Blanchard describes: credibility is lost faster than it is regained" is not in
Blanchard. Attribute to the tool (`DEANCHOR_ERO` > `DEANCHOR_REC`). His related statement
(§9-2, p. 185) is that de-anchoring risk grows with the duration of the overshoot and falls
with initial credibility.

Checked and rejected as a source: Blanchard & Fischer, *Lectures on Macroeconomics* (1989)
§11.4 — Barro–Gordon loses and regains credibility in one period each; the trigger version
loses it permanently; Cukierman has slow learning in both directions. Also a graduate text
outside the course frame. Do not cite it.

### 18. §6 Values — "the structure Blanchard gives"
The credibility **stock**, its recovery condition, the threshold and the feedback into πᵉ are
all the tool's — the paragraph's own opening says "Blanchard has no credibility variable".
What is his is the **idea**: sustained deviation from target de-anchors expectations, risk
rising in duration and falling in initial credibility (§9-2, p. 185; §8-3 for the
1970s/Covid contrast). TOL, SCALE, ERO, REC stay described as calibrations for visibility.

### 19 + 23. §2 Values (c₁), §2 References — the "range"
p. 53 reads: a reasonable estimate is around 0.6, "(the regressions in Appendix 3 yield two
estimates, 0.5 and 0.8)". Those are two point estimates from two specifications, not a stated
range. Rewrite as "Blanchard puts c₁ at around 0.6, with the Appendix 3 regressions yielding
0.5 and 0.8 (§3-3, p. 53)". Delete "The slider spans exactly this range" (it is 0.30–0.80).
References row: "c₁ ≈ 0.6; regression estimates 0.5 and 0.8".

Consequential (found by sweep, all in §2 unless noted):
- stability-cap paragraph: "Blanchard's upper estimate" → "the higher of his two reported estimates"
- c₀ derivation: 60 = c₀ + 0.6 × (100 − 20) ⇒ c₀ = 12
- §3.2 rₙ line: A = 12 − 12 + 12 + 20 + 30 = **62**, k_o = 1/0.6, Yₙ/k_o = 60,
  rₙ = (62 − 60)/200 = 0.01 — result unchanged at 1%, all five numbers change
- every "1/0.7" as k_o becomes 1/0.6 (§2, §3, §5, §7)
- §2 code drawer quotes `: 0.5` fallbacks — update with the engine
- the 2.5-preservation block in §2 Values is replaced by the p. 53 note argument (see M4)

### 20. §2.2 — the risk premium
"outside the scope of a medium-run model" contradicts eq. 9.1, cited in the same sentence,
which **is** the medium-run IS and **does** contain x. Real reason: nothing in the tool
determines a risk premium — that needs debt dynamics and default risk, which the model has no
state for. Add: in the closed stages a student can see the demand-side effect of a higher
borrowing cost on the rate slider, since only r + x enters the IS; in the open stages that
substitution does **not** carry over, because a higher policy rate appreciates the currency
through UIP whereas higher country risk would depreciate it. (See M6.)

*Check in the book*: that x is introduced in §6-3 as a premium on borrowing, and that eq. 9.1
is its first appearance in the IS.

### 21. §1.1 — "approved by Blanchard"
pp. 46–47 license linearising **the consumption function** ("reasonable"; plus the margin note
that models nearly always start with "assume"). They do not endorse linearising every relation.
Also unnecessary for two of the three cases: the specific wage-setting form is his (§8-1,
p. 158) and the linear investment function is his (Ch. 5, Problem 2). The only genuine tool
linearisation is NX, already derived and badged in §7. Rewrite to say exactly that.

### 22. §4 Values (α) — the empirical sourcing
Two claims, one verifiable and one not.

**0.34 is right but mislabelled.** Hazell, Herreño, Nakamura & Steinsson (QJE 2022) do find
that a 1pp rise in unemployment lowers inflation by about 0.34 points — but that is **ψ** in
their equation (3), not the structural slope. Their κ (Table I, tradeable-demand IV) is
**0.0062**, quarterly, for non-tradeable goods, and ψ = κ/(1 − βρᵤ). Footnote 24 gives 0.34's
construction: 4 × (0.58 × 0.0062 + 0.42 × 0.0243) × 6.16 — annualised, weighting non-shelter
non-tradeables against rents by core-CPI expenditure shares, scaled by unemployment
persistence ζ = 6.16. The paper is explicit that κ is structural and ψ is not. Say which one
0.34 is, or a lecturer who checks finds a headline slope of 0.0062.

**"Recent US price-Phillips-curve estimates sit around 0.18–0.26" is unsourced.** Nothing in
that paper yields it. Their ψ estimates: full sample 0.112 (lagged-unemployment IV) and 0.339
(tradeable-demand IV); by subsample 0.198 pre-1990 / 0.090 post-1990 with time fixed effects,
0.422 / 0.332 with the tradeable-demand instrument. Their κ comparisons (Table III):
Rotemberg–Woodford 0.019, Galí 0.085, Nakamura–Steinsson 0.0077, own 0.0062. Delete the range
or give it a different citation. The honest spread across their own specifications
(≈ 0.09–0.42) supports α = 0.3 with a 0.05–0.50 slider better than an invented tight range.

**Bonus — the paper strengthens the section.** Its central finding is that the early-1980s
disinflation came mostly from shifting long-run expectations rather than a steep Phillips
curve, and that post-1990 stability reflects expectations becoming anchored. That is
Blanchard's θ account in different language, so the doc's "steepness comes from de-anchoring,
not from α" sentence gains a second, independent source. Say so.

**Notation collision — flag it.** HHNS use α for the Calvo non-reset probability (their
κ = λφ⁻¹ with λ = (1 − α)(1 − αβ)/α), λ for that bundle and for the relative-price coefficient,
and ψ for κ/(1 − βρᵤ). All three letters mean something else in this document. When quoting
0.34, name it in words ("their persistence-scaled slope coefficient") rather than as "ψ",
which in §5 is the Taylor output-gap coefficient. Do not carry their letters into the §0
notation table, and never describe 0.0062 as "their α".

*Judgement, not fact*: that their ψ is the right analogue for the tool's α. It is defensible —
their equation (3) has inflation against an unemployment deviation with long-run expectations
as the anchor, which is what the tool does at θ = 0 — but state it as an argument if it goes in.

### 24. §0 legend — add the fifth badge
"Blanchard, linearised" is used on (2.4) and (7.4) and in the equation index but is not one of
the four labels §0 defines. **Add it to the legend** as its own category: the relation is
Blanchard's, the linear functional form is the tool's — distinct from "rearranged", which
implies the same content in different algebra. These are the two equations where a lecturer
will ask "is this his functional form or yours?", so the badge earns its place.

(7.4) also changes under item 10: with n₁ = 21 the coefficient is Blanchard's too, so its badge
should say the linear form is the tool's and the value is his.

### 32-adjacent note — the closed-stage slider range
At the new constants the **closed** IS-LM-PC stage runs 120 → 30 across the 0–15% slider, so it
leaves the 70–130 IS-MP axis at both ends and clamps at the top. §2 Values discusses only the
full model; if any section states a closed-economy range, it needs these figures.

### 25 + 26. §0 constants table and §6 Values — corrections and gaps
- **Yₙ is mapped to `IS_Y_BASE`; it should be `computeYn`** (= `L_LABOR`·(1 − uₙ)), which moves
  with m and z exactly as §4 says. `IS_Y_BASE` is only the calibration/display baseline.
- **Add the φ slider range**: 0–3, step 0.1.
- **Add the step-speed range**: 0.05–1, step 0.05.
- **§6 Values reads "Step speed s = 0.5 (control, )"** — the range was never filled in. Use the
  same 0.05–1, step 0.05.
- **Tool-side label mismatch**: the control the doc calls "Step speed" is labelled "Price flex
  (medium-run speed)" in the tool, with the tooltip "How quickly prices adjust to output gaps".
  s does not enter the Phillips curve at all — it scales the πᵉ, P, P\* and Eᵉ updates. The doc
  is the accurate one; fix the tool's label and tooltip (add to the housekeeping list).

### 27. §2 Values / §3.1 — "starts from balance"
NX = 0 holds at the calibration point (Y = 100, ε = 1), not when the open block opens: the
IS-LM-UIP stage opens below potential, so imports are lower and NX is positive — +1.71 now,
**+2.00 after the c₁ change**. Write "balanced at the calibration point"; update any opening
NX figure in §3.1 to 2.00.

### 28. §2 / §4 code drawer — the output clamp
`solve` ends with `Y = clamp(isOutput(...), 30, 200)`. The drawers document the π, πᵉ and
Taylor clamps but not this one, and it is **reachable**: at i = 15% the closed IS-LM-PC stage
sits exactly at the floor of 30 under the new constants (120 → 30 across the slider). Add it,
noting the floor binds only at extreme slider settings — and consider whether a floor that
binds at a legal slider position is the right design.

### 29. §6 code drawer — stray line number
"`s.deanchor_on` (default `true`, 810)" — line numbers were dropped from the code drawers by
decision; this one survived. Delete "810".

### 30. Code drawers — comments not in the file → add them to the engine
Seven inline comments appear in the "as written" blocks but are not in Demo9_3. All are
accurate; the only problem is that §0 says the drawers quote the file. **Decision: add them to
the engine** when the other engine edits are made, so the file matches the doc.

- `// r = i − πᵉ, with πᵉ = 0 before the PC block`
- `// Taylor rule, §5`
- `// λ = (1 − θ)·cred`
- `// toggle off ⇒ cred frozen`
- `// eq. 19.5`
- `// ε = E·P/P*`
- `// adaptive Eᵉ`

### 31. §6 / §8 / §9 — number each displayed equation separately
§2's equations are individually numbered; §6, §8 and §9 stamp one number on a block holding
several. §6's block is stamped (6.3) but contains λ = (1 − θ)·cred, which the index numbers
**6.2** — so a link to 6.2 lands on a block marked 6.3. §8's block is stamped (8.2) and holds
three equations; §9's is stamped (9.1) and holds two.

**Decision: number each displayed equation separately**, matching §2. Fix in the build script.
This restores the linkable-equation-number feature §0 advertises.

### 33–35. Tool-side cross-references and labels (housekeeping)
All point at the superseded doc's numbering or the pre-Decision-A notation. Map to v2:

| Where | Currently | Becomes |
|---|---|---|
| equation-box footnotes | "§6.3 … §6.7" | §4.1 … §4.2 |
| equation-box footnotes | "§7.8 … §5.5" | §9 … §5.2 |
| `SYMBOL_DEFS['α']` | "see Model Correspondence §6.3" | §4.1 |
| `'Taylor i'` | "see 5.4" | §5 |
| `EQ_REF` | "Correspondence 6.6" / "§7.8" | §6 / §9 / §9 / §8 |
| policy-rate slider | `'Policy rate (target), i'` | `'Policy rate, i'` |
| symbol glossary | `'i_N'` | ī |
| `ZLB` comment | Ch. 23 only | add §4-4, p. 79 |
| speed control label | "Price flex (medium-run speed)" + "how quickly prices adjust to output gaps" | describe what s does: scales the πᵉ, P, P\* and Eᵉ updates |

---

## C. Parked until the engine changes

- **Item 6** (time indices in 5.4) — disappears once M1 lands; the printed equation
  iₜ = ρiₜ₋₁ + (1 − ρ)[…πₜ…] becomes correct as written. Until then it misdescribes the code.
- **Item 32** (§5.2 "with ρ = 0, no value of φ produces a clean adjustment") — false on the
  new engine. The whole ρ paragraph is rewritten as gradualism, not stability.
- **§5 Values**: ψ = 0.25 and ρ = 0.75 justifications; the ψ test paths; b₂k_o/Yₙ = 3.33.
- **§8 Values**: all Eᵉ-weight figures.
- **Instructor Manual**: presets 1, 2a, 2b, 3, 4, 5.
- **§5 Values is a redraft, not a re-measurement.** The ψ = 0.25 and ρ = 0.75 justifications
  were both written to explain behaviour the *lagged* rule produced — oscillation at ψ = 0.5,
  instability at ρ = 0. Neither exists on a contemporaneous rule. Do not swap numbers into the
  existing prose; rewrite the section once the new engine's behaviour is known, and re-examine
  whether the values themselves still want to be 0.25 and 0.75.
- **Engine self-tests to re-run after every change.** Five asserts: `Baseline isOutput =
  IS_Y_BASE` (passes c₁ = 0.5 explicitly — will fail under M4 unless updated), `Round-trip
  Y → r → Y` (same), `k_o < k_closed for m1>0`, `Taylor convergence (60 periods)` (exercises
  the rule — recheck under M1), `Higher m → lower Y_n`.
- **Preset 3 — newly found defect, not in the original list**: the narrative says Y "drifts
  back" to potential. It does not. At i = 1%, Taylor off, θ = 0.3, output settles at ≈ 102
  with π ≈ 2.8% at both n₁ values. A fixed nominal rate below neutral leaves a permanent gap
  unless expectations do the work, and θ = 0.3 is too anchored for that. Fix the preset or
  the narrative.

---

## D. Still to work through

Nothing. All items 1–35 are resolved above, except those in section C, which are deliberately
parked until the engine is rebuilt.

---

## E. Pages verified in this session

| Claim | Page |
|---|---|
| "When expected inflation equals zero, the nominal and the real interest rates are equal" | 112 |
| eq. 7.1, W = Pᵉ F(u, z), §7-3 | 143 |
| specific form W = Pᵉ(1 − αu + z), §8-1, unnumbered | 158 |
| eq. 8.1 | 159 |
| the equation preceding eq. 8.10 (πᵉ form); eq. 8.10 itself has πₜ₋₁ | 169 |
| ZLB definition **and** the "a bit negative" margin note (Germany) | 79 |
| c₁ ≈ 0.6; Appendix 3 regressions give 0.5 and 0.8; multiplier 2.5; margin note that empirical multipliers are smaller | 53 |
| i = "the policy rate"; ī = "the target nominal interest rate…associated with the neutral rate of interest, rₙ" | 494 |
| markup shock raises uₙ and lowers potential output; de-anchoring risk grows with duration; initial credibility matters | 185 |
| Marshall–Lerner appendix elasticities (0.9 / 0.8, "reasonable numbers") | 393 |
| "must accept…substantial exchange rate fluctuations", in the context of news about future rates | 428 |

---

## F. Verbatim current text and replacement wording

For each fix that changes prose, the sentence as it stands in v2 and the replacement. Locate
the current text in the **md drafts**, not the built HTML. Figures marked **[re-measure]** are
provisional on the engine changes (M1, M2, M4) and must be re-run before the doc pass.

### 1 — §2 Values, b₂
CURRENT: "…so b₂ is calibrated to the larger case: a one-point change in r moves investment by
2, a tenth of baseline investment, and output by k_o × 2 ≈ 2.9 in the full open model (k × 2 =
5 in the closed economy, where nothing leaks abroad). Across the policy-rate range of 0–15% the
full model's output runs from about 109 to 66, so the whole range stays comfortably on the
chart."

REPLACEMENT: "…so b₂ is calibrated to the larger case: a one-point change in r moves investment
by 2, a tenth of baseline investment. In the full model it moves output by about 3.7
**[re-measure]**: about 3.3 through the multiplier on investment and about 0.35 through the
exchange rate, since a one-point rate differential appreciates the currency by about 1% (§8)
and that cuts net exports by n₁ × 0.01 ≈ 0.2 (§7). In the closed economy the response is 5.6,
all through the multiplier — 6.7 in the closed economy. Across the policy-rate range of 0–15%
output runs from about 111 to about 56 **[re-measure]**."
(The "comfortably on the chart" clause is deleted, not replaced. The IS-MP axis is 70–130.)

### 1 — §5 Values, ψ
CURRENT: "ΔY = −b₂·k_o·Δr = −200 × 1.43 × 0.01 ≈ −2.9 in the full model (−5 in the closed
economy)" and "a 1pp rate change moves output by 3–5% of Yₙ".
REPLACEMENT: "ΔY ≈ −3.7 in the full model (≈ −3.3 via investment, ≈ −0.4 via the exchange rate;
−6.7 in the closed economy, where k = 3.33)" and "about 3.7% of Yₙ in the full model, 6.7% in
the closed economy". **[re-measure]**

### 2 — §3.2, main text
CURRENT: "…when the rule is off, the neutral rate is still computed and shown as a marker on
the chart, so the user can see how far the chosen rate is from it."
REPLACEMENT: "…when the rule is off, the neutral rate is still computed each period and, once
the Phillips-curve block is unlocked, displayed in the equation box's Taylor line, greyed out,
so the user can see how far the chosen rate is from it."

### 2 — §3.2, "What follows from this"
CURRENT: "This is why the neutral-rate marker on the chart shifts when a fiscal or
exchange-rate slider is dragged, even though nothing labelled 'interest rate' has been touched."
REPLACEMENT: "This is why the neutral rate shown in the equation box shifts when a fiscal or
exchange-rate slider is dragged, even though nothing labelled 'interest rate' has been touched."

### 2 — §3 code drawer
CURRENT: "The same two lines are repeated where the chart marker and the equation box are drawn."
REPLACEMENT: "The same two lines are repeated where the equation box is drawn."

### 3 — §8 Values, adjustment weight
CURRENT: "With the weight at zero (Eᵉ fixed, as in Ch. 19) a 1pp rate rise appreciates the
currency by 1% once, and output falls to 96 and then recovers to potential as expectations
adjust — Ch. 9's medium run, but with no trace of Ch. 20's point that a lasting differential
moves the exchange rate more."
REPLACEMENT: prepend a settings line — "All runs below: full model, Taylor rule off, θ = 0,
cred = 1, i raised from 3% to 4% and held." — then: "With the weight at zero (Eᵉ fixed, as in
Ch. 19) a 1pp rate rise appreciates the currency by 1% once, and output falls to 96 and then
recovers to potential as the price level falls relative to P\* and ε drifts back down — Ch. 20's
medium run, but with no trace of §20-3's point that a lasting differential moves the exchange
rate more." **[re-measure all weight figures]**
NOTE: at θ = 0, πᵉ never moves. At θ = 1 the run does **not** recover either — under the new
constants it collapses deflationarily to Y ≈ 64 (π ≈ −18%), parked near 92 by the πᵉ floor.
(The pre-change engine diverged upward to Y ≈ 180; same instability, opposite direction. Use
the collapse figures.)

### 4 — §4.2
CURRENT: "This follows Blanchard's own account in §8-3: the 2020–22 inflation came largely
through a temporary rise in the markup … and faded when commodity prices turned; the 1970s oil
shocks, by contrast, de-anchored expectations and turned a transitory shock into sustained
inflation."
REPLACEMENT: keep that sentence but open it "The episodes are Blanchard's (§8-3): …", and add
after it: "The form is the tool's. In Blanchard a temporary markup rise enters through eq. 8.4
and so temporarily raises uₙ and lowers Yₙ (Ch. 9, p. 185); the tool instead adds the shock to
inflation directly and holds Yₙ fixed, so that a transitory disturbance and a permanent change
in m remain visibly distinct on the chart."

### 4 — §4 Values, shock sizes
CURRENT: "The form — a pulse that decays while Yₙ stays put — is from §8-3."
REPLACEMENT: "The form — a pulse added to inflation that decays while Yₙ stays fixed — is the
tool's; Blanchard's temporary markup rise moves uₙ and Yₙ for as long as it lasts (Ch. 9,
p. 185)."

### 9 — §2 Values, b₁
CURRENT: "From Chapter 5 investment responds to output, but Blanchard never assigns the response
a value: eq. 5.1 gives only the sign, and Ch. 5 Problem 2 writes I = b₀ + b₁Y − b₂i with b₁
unspecified. The tool keeps Blanchard's multiplier of 2.5 and splits the induced-spending
propensity between the two equations that generate it: …"
REPLACEMENT (this whole block goes, per M4): "Chapter 5 makes investment respond to output but
assigns no coefficient in the text: eq. 5.1 gives only the sign, and Ch. 5 Problem 2 writes
I = b₀ + b₁Y − b₂i with b₁ unspecified. Problem 5 (pp. 105–106) does set I = 150 + 0.25Y −
1000i, but its b₁ = 0.25 is paired with c₁ = 0.25, giving k = 2; combined with the text's
c₁ = 0.6 it would give a closed-economy multiplier of 4. b₁ = 0.1 is a tool calibration, small
enough that c₁ + b₁ = 0.7 stays well inside the stability bound."

### 9 — §2 Values, b₂ (opening clause)
CURRENT: "Blanchard gives the rate channel its sign (eq. 5.1) but never a coefficient."
REPLACEMENT: "Blanchard gives the rate channel its sign (eq. 5.1) but no coefficient in the
text; Problem 5's b₂ = 1000, in an economy of Y = 1000, is a 1%-of-output investment response
per point, half the tool's 2%."

### 10 — §7 Values, n₁
CURRENT: "Blanchard gives only the sign (Marshall–Lerner), no magnitude, so n₁ is a tool
calibration. At 70, a 10% real appreciation (ε = 1.10) lowers net exports by 7 — a quarter of
baseline exports — and output by n₁·k_o·0.1 ≈ 10, or 10% of potential … The reduced-form
coefficient ∂Y/∂ε = −n₁·k_o ≈ −100 …"
REPLACEMENT: "n₁ = 21 comes from Blanchard's Ch. 18 appendix (p. 393), where a 1% depreciation
raises exports by 0.9% and cuts imports by 0.8% — figures he calls reasonable on the
econometric evidence. In the tool's units: −∂X/∂ε + ∂IM/∂ε − IM = 27 + 24 − 30 = 21 at the
calibration point. At 21, a 10% real appreciation lowers net exports by 2.1 and output by
n₁·k_o·0.1 ≈ 3.5 **[re-measure]**. The reduced-form coefficient ∂Y/∂ε = −n₁·k_o ≈ −35
**[re-measure]** is derived from the structural n₁ and the multiplier, not asserted on its own."

### 13 — §3.3
CURRENT: "The tool uses a strict zero bound; the mildly negative rates some central banks have
set are treated by Blanchard only as an empirical puzzle (a Ch. 6 problem) and not as part of
the model."
REPLACEMENT: "The tool uses a strict zero bound, as Blanchard does. He notes on the same page
that people and firms will hold some bonds at slightly negative rates, citing Germany, and
calls it another complication he ignores (§4-4, p. 79)."

### 15 — §8.3
CURRENT: "…so a differential that lasts moves the exchange rate more than one that does not …
which is Blanchard's 'a country under flexible rates must accept exchange-rate movement' made
visible."
REPLACEMENT: delete the quoted clause. Keep the mechanism sentence and add: "The tool has no
forward-looking Eᵉ, so it has no news effect and no forward solution; what it reproduces is the
comparative result of §20-3 (pp. 427–428) — a differential expected to last moves the exchange
rate more — by accumulation rather than anticipation."

### 16 — §3.2 opening and §0 notation row
CURRENT: "Blanchard defines the neutral (or natural) nominal rate as the rate the central bank
should set when the economy is balanced…"
REPLACEMENT: "The tool calls ī the neutral nominal rate: the rate the central bank should set
when the economy is balanced, output at potential and inflation at target. Blanchard calls the
same object the target nominal interest rate — 'the nominal interest rate associated with the
neutral rate of interest, rₙ, and the target rate of inflation' (§23-2, p. 494); for him
'neutral' attaches to the real rate rₙ. It is rₙ plus target inflation, by the Fisher relation
of eq. 6.4."
§0 notation row: "ī — neutral nominal rate (Blanchard's target nominal rate, §23-2)".

### 17 — §6.4
CURRENT: "Recovery is slower than full-strength erosion, which encodes the asymmetry Blanchard
describes: credibility is lost faster than it is regained."
REPLACEMENT: "Recovery is slower than full-strength erosion. The asymmetry is the tool's
(`DEANCHOR_ERO` > `DEANCHOR_REC`), made so that a sustained overshoot has consequences that
outlast it; Blanchard's related point is that the risk of de-anchoring grows with the length of
time inflation exceeds the target, and falls with the central bank's initial credibility (§9-2,
p. 185)."

### 18 — §6 Values
CURRENT: "What the tool takes from Blanchard is the structure: credibility as a stock that
erodes with sustained deviation from target, recovers when inflation returns to it, and feeds
back into how expectations are formed."
REPLACEMENT: "What the tool takes from Blanchard is the idea: sustained deviation from target
de-anchors expectations, the risk growing with the duration of the overshoot and falling with
initial credibility (§9-2, p. 185; §8-3 for the 1970s and Covid contrast). The stock itself,
its recovery condition, the threshold and the feedback into πᵉ are the tool's."

### 19 — §2 Values, c₁
CURRENT: "Blanchard's stated empirical range for the propensity to consume is 0.5–0.8, with a
central estimate of about 0.6 (§3-3, p. 53). The slider spans exactly this range. The default is
0.5 rather than 0.6 because of the accelerator, as follows."
REPLACEMENT: "Blanchard puts the propensity to consume at around 0.6, noting that the
Appendix 3 regressions yield two estimates, 0.5 and 0.8 (§3-3, p. 53). The tool uses his 0.6.
The slider spans 0.30–0.80."

### 19 — §2 Values, stability cap
CURRENT: "The cap coincides with Blanchard's upper estimate…"
REPLACEMENT: "The cap coincides with the higher of his two reported estimates…"

### 19 — §2.6 multiplier paragraph (new argument, replacing the 2.5-preservation claim)
ADD: "Blanchard's Ch. 3 multiplier is 2.5 at c₁ = 0.6 (p. 53). The tool's is larger in the
closed economy (3.33, because investment also responds to output) and smaller in the open
economy (1.67, because imports leak). His own note on that page says empirical multipliers are
typically smaller than 2.5, because the Ch. 3 model leaves out the monetary-policy reaction and
the fact that some demand falls on foreign goods — both of which this model has."

### 20 — §2.2
CURRENT: "The tool does not include a risk premium as a separate factor, as it is outside the
scope of a medium-run model, so x = 0."
REPLACEMENT: "The tool sets x = 0. Nothing in the model determines a risk premium: that would
require debt dynamics and default risk, for which there is no state variable here. In the
closed stages a student can see the demand-side effect of a higher borrowing cost by raising
the policy rate, since only r + x enters the IS; that substitution does not carry over to the
open stages, where a higher policy rate appreciates the currency through UIP whereas higher
country risk would depreciate it."
*Check before writing*: that x is introduced in §6-3 as a premium on borrowing, and that eq. 9.1
is its first appearance in the IS.

### 21 — §1.1
CURRENT: "This process is approved by Blanchard in Chapter 3, pp. 46–47:"
REPLACEMENT: "Blanchard treats linearising a behavioural relation as a reasonable
simplification and says so for consumption (§3-2, pp. 46–47), adding that models nearly always
start with 'assume'. He does it himself for wage setting (§8-1, p. 158) and for investment
(Ch. 5, Problem 2). The one relation the tool linearises that he leaves in general form is net
exports; that step is derived and badged in §7."

### 22 — §4 Values, α (full replacement paragraph)
REPLACEMENT: "The tool's α multiplies an unemployment gap in a relation anchored on expected
inflation, so the comparable empirical object is the coefficient on unemployment in a Phillips
curve written with expectations as the anchor. Hazell, Herreño, Nakamura and Steinsson (QJE
2022) estimate exactly that: a one-point rise in unemployment lowers inflation by about 0.34
points. That figure is their persistence-scaled slope coefficient, not the structural slope —
it is built from a structural κ of 0.0062 (quarterly, non-tradeable goods), weighted against
their separate estimate for rents and scaled by the persistence of unemployment fluctuations,
then annualised. Across their specifications it runs from about 0.09 to 0.42, so 0.3 sits
inside the estimated range rather than at a point estimate, and the slider's 0.05–0.50 spans it
with room either side. A slope near 1 is not supported by any of these estimates, which is why
the slider is capped at 0.5.

The same paper supports the tool's treatment of the 1970s: its central finding is that the
sharp fall in core inflation in the early 1980s came mostly from shifting expectations about
long-run monetary policy rather than from a steep Phillips curve, and that the stability of
inflation after 1990 reflects long-run expectations becoming more firmly anchored. This is
Blanchard's account in different language — he attributes the apparently steep 1970s curve to
the expectations parameter θ rising toward 1 (eqs. 8.5 → 8.8 → 8.9; Figure 8-4), not to a
larger α. The tool follows both, so steepness over time is produced by de-anchoring (§6), not
by the α slider."
(Delete "recent US price-Phillips-curve estimates sit around 0.18–0.26". Do not use the letters
ψ, κ, α or λ for their parameters — all four mean something else in this document.)

### 27 — §2 Values, calibration point
CURRENT: "…net exports are set to zero so the open-economy block starts from balance…"
REPLACEMENT: "…net exports are set to zero so that trade is balanced at the calibration
point…"

---

## G. How to carry this forward — three chats

Split rather than continued in one thread: the engine work generates a lot of test output that
would crowd the document work, and the document pass needs the **md drafts**, which the review
never had open (it read the built HTML, which is the wrong artifact to edit).

### Chat 1 — Engine
*Attach*: this file, Demo9_3.

> I'm making a set of agreed changes to the Economo engine (islm_pc_model_v19 Demo9_3). The
> attached decisions log is the spec — sections A and C. Work through them in this order:
> (1) constants: c₁ 0.5 → 0.6, c₀ 20 → 12, n₁ 70 → 21, and fix the `Baseline isOutput` and
> `Round-trip` self-tests, which pass c₁ = 0.5 explicitly; (2) make the Taylor rule
> contemporaneous per M1 — decide bisection vs closed form for the solver before building, and
> handle the ZLB as clamp-and-resolve; (3) re-run every figure tagged **[re-measure]** in
> sections B and F, plus the six Instructor Manual presets, and give me the results as a table;
> (4) fix preset 5's i\* and preset 3, which doesn't do what its narrative says; (5) the
> housekeeping batch in items 30 and 33–35 plus M5b. Verify headlessly rather than by
> reasoning about the code, and re-run all five self-tests after each change. Don't touch the
> documentation — that's a separate job.

### Chat 2 — Document
*Attach*: **this file (current version — it has been updated since chat 1 downloaded it)**, the
md drafts, the build script, and `v2-engine-remeasure-figures.md` from chat 1.

Before starting, settle the preset 5 question in section I, open item 1 — §5 and §8 will be
written around whatever is decided.

> I'm applying an agreed set of corrections to the Economo Model–Textbook Correspondence. The
> attached log is the spec: section B lists every fix, section F gives the verbatim current
> sentence and its replacement, section E lists the Blanchard pages verified. Apply them to the
> **md drafts**, not the built HTML, then re-run the build script. Two build-script changes
> first: number each displayed equation separately in §6, §8 and §9 (as §2 already does), and
> add "Blanchard, linearised" to the §0 badge legend. Substitute the re-measured figures I'm
> giving you for everything tagged [re-measure]. **§5 Values is a redraft, not a
> re-measurement** — the ψ and ρ justifications explained behaviour the old lagged Taylor rule
> produced, and that behaviour no longer exists; write it fresh from the measured paths in
> section I and the companion figures file. Section I also records where chat 1's measurements
> overturned what section B assumed, and section J records what the open-economy long run
> actually is and two wrong conclusions not to repeat — read both before applying anything
> tagged [re-measure]. Don't propose stylistic rewording of anything not on the list.

Also carry into the document pass, from sections I and J:
- Preset 5 is **already rebuilt** as a temporary foreign tightening (i\* 8% for 10 periods, step
  return), narrative rewritten to measured numbers — see J. Nothing to decide; just make §8 and
  any preset reference consistent with it, and note the new `schedule` mechanism if §0 or the
  code drawers describe preset state.
- §8/§9: state that a permanent world-rate change works through slowly because expectations
  adjust gradually; and check §9 says P\* only grows once the PC block is unlocked.
- The §8 θ = 1 note is a **deflationary collapse to Y ≈ 64**, not the upward divergence the
  original review recorded.
- Preset 3's title, the false φ > 2 hint text, and the Instructor Manual's copies of narratives
  2a, 3, 4, 5 (open items 2–4 in section I).

### Chat 3 — Features
*Attach*: this file, the rebuilt doc, the new engine.

> Two features for the Economo engine, specified in sections M7 and M8 of the attached log.
> First, the "Blanchard only" equation-box switch: build the mapping from the correspondence
> doc's badges (Blanchard / rearranged / linearised get a switch state; Tool addition and Tool
> departure don't), show arguments-and-result rather than a substituted derivation, and grey
> out the tool-only equations with "no textbook counterpart" rather than hiding them. Then M8:
> check every equation-box reference, `SYMBOL_DEFS` entry and help tooltip against both the
> rebuilt correspondence numbering and the corrected Blanchard pages in section E.

---

## H. Caveats on the review itself

- **Categories 1, 2 and 4** (mathematics, code correspondence, internal consistency) were
  verified directly: the engine was extracted and run headlessly, every derivation recomputed,
  every quoted code line checked against Demo9_3.
- **Category 3** (textbook fidelity) rests on the pages listed in section E — those are
  confirmed — plus project search for the rest. Two checks remain open and are flagged where
  they occur: whether x is introduced in §6-3 as a premium on borrowing and whether eq. 9.1 is
  its first appearance in the IS (item 20); and whether Hazell et al.'s ψ is the right analogue
  for the tool's α (item 22 — defensible, but an argument, not a fact).
- **A regression verifier now exists**: `verify_demo93.mjs` in the repo — 59 checks in 8 sections
  (self-tests, constants, calibration figures, the contemporaneous rule including the
  hand-calculated 105.87 @ 4.62%, rebalance stops and stationarity, preset-narrative numbers,
  housekeeping strings and M5b geometry, UI smoke). Green on the current build, red on Demo9.2
  and the pre-change copy, so it can actually fail. Run it after any further engine edit.
- **Not re-reviewed**: the Instructor Manual, the licence agreement, the one-page overview, and
  the digraphs file. Changes here will touch at least the Instructor Manual.
- **Recommended, not decided**: give the Instructor Manual its own review on the same standard
  once the engine settles. Its preset narratives are the part of the suite a lecturer is most
  likely to run step by step, and two of the six already fail — preset 3 outright, preset 5
  after the n₁ change — without anyone having reviewed it.

---

## I. Chat 1 outcome — engine rebuilt and re-measured (status: DONE)

All five steps of chat 1 are applied to the engine, verified in headless Chromium driving the
real `solve`/`step`, with the self-tests at 5/5 after every step and a full UI smoke run passing.
Full tables are in the companion file **v2-engine-remeasure-figures.md**; this section records
what changed for anyone applying the document fixes.

**Filename**: the engine was saved as `…Demo9.3.html` (dot). Everything else in the suite uses
`Demo9_3` (underscore). **Pick one and make §0 match** before the doc is rebuilt.

### Decisions taken in chat 1
- **Taylor solver: bisection on the model as a black box**, not a closed form. The rule's RHS is
  strictly decreasing in i (higher i → lower Y, π, gap, and in the open stages a lower shock-aware
  ī through ε), so the fixed point is unique and bisection on [ZLB, 0.30] is guaranteed. A closed
  form would duplicate the E→ε→NX→Y→π chain and go stale silently when `solve` changes.
- **The rule now lives in `solve()`**, so charts, readout, slider and equation box all show the
  rule-consistent equilibrium within the period; `step()` just carries the solved rate forward as
  i₋₁. ZLB is clamp-and-resolve, with a symmetric ceiling at 0.30.
- **Preset 5: i\* = 8%** (a 5pp hike, the 2022 magnitude) — the largest rise that keeps E on the
  ±12.5% chart for a dozen periods; at 10% it leaves by t7.
- **Equation-box LM/Taylor lines now print the smoothed form** ρ·i₋₁ + (1−ρ)[ī + …] so the numbers
  add up; with the rule off the greyed line shows the rule's prescription at the current state.

### Engine problems found in chat 1 that the review had missed
- The equation box hard-coded `c0 = 32 − 12` and `b0 = 12` as literals. After M4 the C line would
  have displayed 20 and the box would not have summed to Y. Now reads `IS_C0`/`IS_B0`.
- **Three** self-tests hard-coded c₁ = 0.5, not the two identified in the review. The stale test
  would have asserted 80 rather than 100.

### Results that differ from what this log recorded
| Where | Log said | Measured on the new engine |
|---|---|---|
| §8, θ = 1 | diverges upward, Y ≈ 180 | **deflationary collapse to Y ≈ 64** (π ≈ −18%), parked ≈ 92 by the πᵉ floor — corrected in B§3 and F§3 above |
| §5, ψ = 0.5 | oscillates | **no longer oscillates**: 104.9 → 101.5 → 100.4 |
| §5, item 32 | expected false | **confirmed false**: ρ = 0 converges for every φ ≥ 1 |
| Preset 3 | settles ≈ 102 | **101.9**, π 2.8% — and it did so on the *original* engine too, so "drifts back" was always wrong |
| Preset 5 | i climbs to i\* | **slow drift**, half-life ≈ 33 periods (was ≈ 10) |
| Preset 4 | — | ε settles permanently at **1.095**, not the 1.03 the narrative claims |
| Preset 2a | — | peak π **6.2%**, not the 7% the narrative claims (2b: 5.8%) |

### Re-measured headline figures (supersede every [re-measure] tag above)
- **Item 1 (b₂, ψ)**: 1pp of i → **−3.67** full model (−3.33 investment, −0.34 FX; E +0.97%),
  **−6.67** closed. Slider 0–15%: **111.0 → 55.9** full, **120 → 30** closed (floor binds).
- **Item 10 (n₁)**: 10% real appreciation → Y **96.5**; ∂Y/∂ε = **−35**; NX −2.1 direct,
  −1.05 after the induced import fall.
- **Items 11b / 27**: opening **86.67** closed, **93.33** open, NX **+2.00**; rₙ line A = 62,
  Yₙ/k_o = 60.
- **Item 3 (§8 weights)**: w = 0 → Y 96.3 → 99.5 at t40; w = 0.4 → E 1.010 → **1.050** at t20,
  Y **97.8** at t20 / 98.3 at t40; w = 1 stuck at 96.5; w = 2 → 93.5.
- **§5 (for the redraft)**: ψ = 0.5 → 104.9 → 101.5 → 100.4; ρ = 0 → Y = 100 throughout;
  φ = 0…3 all converge with no overshoot; at θ = 0.75 the Taylor principle is clean — φ ≤ 0.5
  diverges, φ = 1 converges by t48, φ = 1.5 by t12, φ = 3 by t8.
- **Preset 1**: φ = 1.5 → π back within 0.1pp by t12, no ZLB; φ = 0.5 → ZLB for 17 periods,
  πᵉ → 6%.
- **Presets 2a / 2b**: peak π 6.2 / 5.8%; loss ratio 1.6×; over by t17 / t11.
- **Preset 4**: within 0.5 of potential from t19; ε permanently 1.095.

### Changes made beyond the agreed list (revert any you don't want)
- `E_E_ADAPT = 0.4` named constant (was on the build-notes list; needed for the weight sweeps).
  Paths byte-identical before and after.
- Stale line-710 baseline comment fixed (build notes).
- `'Taylor i'` glossary *meaning* rewritten — the "next period" wording is false under M1;
  `syncControls` now shows the rule's solved rate on the slider.
- Two narrative numbers the constant changes falsified: preset 2a "spikes to 7%" → "about 6%";
  preset 4 "ε ≈ 1.03" → "≈ 1.10".

### Open items handed to the document chat
1. **Preset 5 — RESOLVED AND BUILT, see section J.** Made a *temporary* foreign tightening
   (i\* 8%, 10-period hold, step return); the long-tail diagnosis that prompted the question was
   investigated and the engine turned out to be correct. Verifier now 59/59.
2. **Preset 3's title** "Exchange-Rate Disinflation" does not describe what it does (a rate cut).
3. **The tool's hint text** "with θ_eff = 1, φ above ≈ 2 can overshoot and spiral" is now false;
   left in place deliberately for the §5 redraft to resolve.
4. **The Instructor Manual** carries its own copies of narratives 2a, 3, 4 and 5 — all need the
   same edits. Its preset-5 entry still describes the **permanent 6%** version and is now two
   revisions out of date. This is on top of the recommendation in section H that it get its own
   review.
5. **Not done from the build notes**: the `ALPHA_WS` comment, and the cosmetic `z → shock`
   rename. The −0.05 clamp tidy is moot — that clamp is gone.

---

## J. The long-tail investigation — the engine is right, the preset changes

Chat 1's rebalance fix produced very long runs (preset 5: 339 periods). The cause was
investigated and **no engine defect was found**. Recorded here because the finding is
counter-intuitive and the wrong conclusion was reached once already.

### What the long run actually is
Preset 5 with i\* raised permanently to 8%, traced to t = 400, ends at:

Y = 100.00 = Yₙ · π = 2.00% = target · i = 7.92% ≈ i\* · r = 5.92% · ε = 0.531
C = 60.00, I = 10.16, G = 20, NX = 9.84 — **sums to 100.00 exactly**

This is a coherent medium-run equilibrium, derivable independently: at a world real rate of 6%,
investment is 10 rather than 20, so demand is 10 short of potential; the only component that can
fill the gap is net exports; NX = −n₁(ε − 1) = 10 requires ε = 1 − 10/21 = **0.524**. The engine
lands on 0.531.

### Two wrong conclusions, recorded so they are not reached again
- **"The tool loses monetary independence because i → i\*."** No. Under UIP any steady state with
  a constant E requires i = i\*, and with both countries at a 2% target the real rates equalise
  too. Flexible rates buy short-run independence and control of your own inflation rate, not a
  permanently different interest rate from the rest of the world. The *fixed*-Eᵉ alternative
  (i settling at 3.39% with E constant) is the one that violates UIP.
- **"Anchor Eᵉ to PPP so ε returns to 1."** This would be a real error. At ε = 1 with r = 6%,
  autonomous spending is 50 and output about 83 — the anchor would force a real exchange rate
  the rest of the model contradicts. **Do not implement this.**

The real exchange rate is not unanchored: it is pinned by the requirement that output equal
potential at the world real rate.

### What is left
Only transition speed. The adaptive Eᵉ is the sole channel carrying the economy to an equilibrium
it must reach, so a *permanent* i\* change takes ~339 periods. The economics is right; the speed
is a calibration.

### Decisions
- **Preset 5 becomes a temporary foreign tightening.** Not mainly for run length: a central bank
  does not choose a permanently high policy rate — it chooses a target, and the rate follows from
  the neutral rate plus that target. A permanent i\* rise is a *structural* change abroad (foreign
  neutral real rate up), not a policy event, so calling it a "global rate hike" mislabels it. A
  temporary rise is a foreign tightening cycle, which is what central banks actually do.
- **Documentation accepts the slow permanent case** rather than re-engineering it: a permanent
  world-rate change takes a long time to work through because expectations adjust gradually.

### Implemented (chat 1b) — preset 5 as built, all figures measured
**Scenario**: i\* 3% → 8%, held **10 periods**, then a **step** return to 3%. Rule on, θ = 0.

| | t0 | t9 (end of hold) | t10 (return) | t11 | t20 | t60 | t158 |
|---|---|---|---|---|---|---|---|
| i\* | 8% | 8% | 3% | 3% | 3% | 3% | 3% |
| Y | 100.74 | 100.20 | **99.50** | 99.76 | 99.97 | 99.98 | 100.00 |
| i | 3.24 | **4.00** | 3.84 | 3.76 | 3.61 | 3.30 | 3.05 |
| π | **2.21** | 2.06 | 1.86 | 1.93 | 1.99 | 2.00 | 2.00 |
| E | 0.956 | 0.895 | 0.930 | 0.931 | 0.941 | 0.971 | 0.995 |
| I / NX | 19.6 / 0.7 | 18.0 / 2.1 | 18.3 / 1.5 | 18.5 / 1.5 | 18.8 / 1.2 | 19.4 / 0.6 | 19.9 / 0.1 |

- Trough Y **99.50** (t10); peak i **4.00%** (t9); peak π **2.21%** (t0).
- Within 0.5 of potential from **t11**; 0.1 from t13. Rebalance stops **t158**.
- E and ε stay on the ±12.5% chart throughout (E min 0.895 = −11.1%).
- **No permanent depreciation**: long run E → 1.000, ε → 1, i → 3%, because the inflation
  differential nets out over the cycle. This is the contrast with the permanent case above.

**Why these choices** (all decided by measurement, not assumption):
- *Hold = 10.* With the rule on, Y stays within +0.7 and π within +0.2pp whatever the hold — the
  rule absorbs the demand effect, so the visible domestic response is in i and E. Peak i / E
  trough by hold: 3 → 3.50% / −5.8%; 5 → 3.66% / −7.2%; 8 → 3.87% / −9.7%; **10 → 4.00% /
  −11.1%**; 12 → 4.13% / −12.4% (touches the axis). Ten is the shortest hold that lifts the
  domestic rate a full point and the longest that keeps E inside ±12.5% with margin.
- *Step return, not a taper.* The step is what makes the transition cost visible: Y dips to 99.5
  the period i\* returns (E snaps up, NX drops while i is still 3.8%). Tapers and geometric
  decays smooth the trough to 99.7–99.9 and lengthen the tail.

**New engine mechanism**: a preset state may carry `schedule: [{ at: N, set: {…} }]`, applied in
`step()` when the state reaches period N — the engine previously had no way to express a
time-varying i\*. It is transparent: the i\* slider and UIP legend show 3.0% once it fires,
`Copy state` lists the scheduled change, Reverse restores 8% and stepping refires. With no
schedule present it changes nothing — the other five presets' 40-period paths are bit-identical.
Preset 3's manual protocol could use the same field; it was left alone.

**Label** "5. Global Rate Hike Spillover" kept — now accurate. The narrative names the event as a
rise in the foreign *real* rate, describes the hold as a composition shift (I 20 → 18.0, NX
0 → +2.1, output within 0.3 of potential), places the output cost in the transition, and closes
on inflation never leaving 1.9–2.2%. The verifier asserts the word "suppress" is absent.

**Verification**: self-tests 5/5; `verify_demo93.mjs` **59/59, exit 0** (exit 1 on Demo9.2), with
the preset-5 assertions replaced.

### Two implications for the document pass
- **§8.3 now has a preset that demonstrates its claim.** Because the temporary version returns
  E → 1.000 and ε → 1 with no permanent depreciation, it shows "a differential that lasts moves
  the exchange rate more, and unwinds when the differential does" without ending in the
  permanent case's odd resting place. Worth pointing §8.3 at it.
- **Preset 5 teaches the exchange-rate channel, not an output story — say so in the narrative.**
  With the rule on, output stays within +0.7 whatever the hold length: the Taylor rule absorbs
  the entire demand effect, so the whole visible response is in i, E and the C/I/NX split. That
  is correct behaviour, but a lecturer who expects a foreign shock to cause a domestic recession
  will not see one, and will think the preset is broken. The narrative should set that
  expectation explicitly — the output cost is the one-period dip at the return, nothing more.

### Verified while investigating
`step` sets `P_star: (s.P_star || 1) * (1 + PI_TARGET * sp)` — **no dependence on i\***. Foreign
inflation is fixed at the 2% target, so a rise in i\* is unambiguously a rise in the foreign
*real* rate. The preset 5 narrative should say so. (P\* only grows once the PC block is unlocked;
check §9 says this.) The P\* equation-box reference still reads `Correspondence §7.8` → §9.

### For the narrative — the lesson to write
The medium run pins Y at potential; the interest rate determines what output is *made of*. At the
higher world real rate, investment falls from 20 to 10 and net exports rise from 0 to 9.8. Avoid
"high rates suppress growth" — a student who reads that and then sees Y = 100 will think the
model is broken. The output cost is in the **transition**, which is what the temporary preset
shows.


---

## K. Chat 3 outcome — M7 and M8 built (status: DONE)

Both features are in the engine, saved as `islm_pc_model_v20_M7_M8.html`. Verified in headless
Chromium against the real `solve`/`step`: engine self-tests **5/5**, `verify_demo93.mjs`
**73/73, exit 0** (up from 59 checks — see "Verifier" below), no page errors.

### M7 — the "Blanchard only" switch, as built
A two-button control (`Tool form` / `Blanchard only`) at the top of each of the four equation
boxes. State is global, so flipping it in one box flips all four. Two new tables drive it:
`EQ_REF_B` (Blanchard's equation plus the Correspondence number, per switchable term) and
`EQ_NO_COUNTERPART`. The mapping is taken from the document's badges, as M7 instructed.

- **Switchable**: anchor → (2.2); C → (2.3); I → (2.4), shown as Blanchard's general `I(Y, r)`;
  G → (2.6); NX → (7.1); UIP → (8.2); ε → (8.3); uₙ → (4.4); Yₙ → (4.6); Fisher → (2.5);
  rule-off LM → (3.1); πᵉ → (6.1).
- **Greyed, no counterpart**: P′ and P\*′ → §9; Eᵉ′ → §8.3.
- **Split lines**: the Taylor/LM line shows Blanchard's rule (5.1) in the unemployment gap with
  its own result, then a greyed `ρ·i₋₁ + (1−ρ)·[rule]` line giving the rate actually in force
  (§5.2). The PC line shows eq. 9.3 with the `+ shock` term greyed to §4.2. The u-gap is
  recovered through the Correspondence's own conversion (5.2), not a fresh derivation.

The worked example from M7 renders as specified:
`NX(Y, Y*, ε) = X(Y*, ε) − IM(Y, ε)/ε` over `NX(Y = 98.3, Y* = 100, ε = 1.004) = 0.41`.

### Decisions taken in chat 3
- **Arguments-and-result applies to every switched line, including C**, on M7's own logic. C's
  Blanchard form is eq. 3.3 with coefficients, but c₀ = 12 is the tool's calibration anchor, so
  substituting it under a Blanchard-badged form has the same failure mode as substituting a
  linearisation. The coefficients stay one click away.
- **Named arguments, not positional** — `NX(Y = 98.3, …)` rather than M7's `NX(98.3, …)`, since
  the args line sits under a symbolic line that may or may not show the function form. Cosmetic;
  revertible in one string.
- **The πᵉ line was added** (agreed in chat). It is in the transitions box, Blanchard state
  eq. 8.7, with λ and the step speed greyed to §6.2/§6.3. Everything it needed was already
  wired — `TERM_BLOCK['pi_e'] = 'PC'`, `EQ_REF['pi_e']`, and the `new_pi_e` computation inside
  `drawEquations` — and none of it reached the screen. It looks like an intended line that was
  dropped.
- **The credibility law of motion (6.5) was NOT added.** The cred meter covers it and a two-case
  piecewise rule would crowd the box. Reconsider if §6.4 becomes a teaching point.

### Where the badges overrule M7's prose
M7 lists **ψ** among the things with no textbook counterpart. The rebuilt §5.1 derives
ψ ≡ b(1 − uₙ) from Blanchard's b and badges it *Blanchard, rearranged*. M7 says the badges are
the spec, so ψ is treated as having a counterpart and **only ρ is greyed** on the Taylor line.
M7's prose predates the doc rebuild; this is the one place the two disagree.

### M8 — reference and tooltip pass
Checked every `SYMBOL_DEFS` entry, every `EQ_REF` entry and every help tooltip against the
rebuilt numbering and the section E pages. Applied:

| Entry | Was | Now |
|---|---|---|
| `ZLB`, `AXIS_DEFS['0% ZLB']` | Ch. 23 | §4-4, p. 79; Ch. 23 |
| `Yₙ` | eq. 8.4 | §9-1, p. 179 — eq. 8.4 is uₙ, not Yₙ |
| `ī` | Ch. 23 | item 16's wording verbatim; §23-2, p. 494 |
| `i`, `φ`, `ψ`, `π̄` | Ch. 23 | §23-2, p. 494 |
| `c₁` | eq. 3.3 | eq. 3.3; §3-3, p. 53 |
| `n₁` | eq. 19.1 | Correspondence §7.2; Marshall–Lerner appendix, p. 393 |
| `ε` | eq. 17.1 | eq. 17.1, p. 358 |
| `shock` | tool addition (cf. §8-3) | tool addition — §4.2 (cf. §8-3, p. 185) |
| `P′`, `P*′`, `Eᵉ′` | Ch. 16 p. 336 | tool addition — §9 / §8.3 |
| `EQ_REF` pi_e / P_prime / P_star_prime / Ee_prime | §6 / §9 / §9 / §8 | §6.3 / §9.2 / §9.2 / §8.3 |
| `EQ_REF['MD']` | Blanchard eq. 5.3 | removed — unused, and the tool has no money-demand line |

`Ch. 16 p. 336` was sourcing only the primes-are-future-values convention, not the transition
rules themselves, so it read as though Blanchard supplied them.

### The φ hint was false — rewritten from measurement
Open item 3 of section I is resolved. "With θ_eff = 1, φ above ≈2 can overshoot and spiral" is
**false**: fully anchored, rule on, cost-push pulse, Y never exceeds 100 at any φ from 0 to 3 and
π returns to 2% every time. This matches the redrafted §5. Measured over 120 periods:

- Rule OFF, transitory cost-push pulse: returns to target while effective anchoring λ = (1 − θ)·cred
  stays at or above **≈ 0.7**; λ = 0.67 is already sluggish (Y 100.87), λ = 0.65 runs away (127.9),
  λ ≤ 0.64 hits the clamp.
- Rule OFF, **permanent** demand shock (G + 5): no λ below 1 is stable — λ = 0.9 reaches Y ≈ 121.
  With i fixed the gap never closes, so any adaptiveness compounds. Stability is shock-dependent,
  which the old note did not say.
- Rule ON, θ = 1: φ ≤ 0.5 diverges; **φ = 1 parks inflation at 9.77% with Y back at 100** (the
  indeterminate-level case); φ ≥ 1.5 converges.

Both copies of the note (it was duplicated verbatim at two places in the file) now carry the
measured wording. **"θ_eff" is gone** — it denoted effective *anchoring* while θ everywhere else
in the tool and the doc means *adaptiveness*, so the two readings pointed opposite ways.

### Layout fixes (raised in chat, not on the original list)
- The equation boxes were widening their grid column. Cause: `.charts` is a `1fr 1fr` grid and
  grid items default to `min-width: auto` = max-content, so a `white-space: nowrap` line stretched
  the track. **This predates M7** — the previous build measured 514px / 641px for two columns that
  should be equal. Fixed with `min-width: 0` on `.chart-box`; both columns are now 519px, identical
  in either display mode.
- Over-long lines now wrap to a new line instead of scrolling sideways (`flex-wrap` on `.eq-line`).
  The line stays `nowrap` *inside* each span, so a formula never breaks mid-expression — the wrap
  points are the gaps between symbolic / numeric / result / reference / tag.
- The "no textbook counterpart" tag takes its own full-width line, indented under its equation.
- **Equals signs were rendering flush against their operands** (`P(1 + π·s)=1.018`). The templates
  do contain the spaces, but a text sequence in a flex container becomes an anonymous flex item
  with leading and trailing whitespace stripped. Fixed with `column-gap: 5px` on `.eq-line` —
  one line of CSS rather than ~30 template edits. Also pre-existing, visible in tool mode.

### Verifier
`verify_demo93.mjs` ran **56/59** on the new build. All three failures were the verifier asserting
pre-M8 strings, not regressions. Updated and saved as **`verify_demo93_v20.mjs`**, now **73/73**:

- The stale-string blacklist banned the bare `§6.3`. Under the superseded numbering that was a
  stale target (items 33–35 remapped it to §4.1); in the rebuilt doc §6.3 is a live section and the
  correct home for the πᵉ line. Narrowed to the actual stale usage, `Model Correspondence §6.3`.
  The other nine banned strings were confirmed absent before the change.
- The `EQ_REF` assertion expected whole sections; it now expects the subsections.
- The footnote assertion **required the error it was meant to catch** — the literal string
  "§9 price/expectations dynamics", when §9 is price-*level* dynamics and expectations are §6.3.
  Worth noting as a pattern: a wrong string locked in by a passing test survived the earlier pass.
- **New section 9**, 14 checks: the switch defaults to Tool form and renders in all four boxes;
  the 40-period path is identical in both modes; tool form keeps the linearised NX while Blanchard
  form shows eq. 19.1's functional form with args-and-result; no calibrated coefficient value
  appears in any Blanchard numeric line; the three greyed lines are present, not hidden; both split
  lines carry their greyed step and section; the πᵉ line exists in both modes; the M8 page
  references and the rewritten hint.
- Header documents each revised expectation and why. Confirmed it still goes **red** (exit 1) on
  the pre-M7/M8 build, where section 9 aborts on `setEqMode is not defined`.

### Cross-checks that fell out
- Closed G + 5 impact: **105.870841 @ 4.6194%** — matches the hand calculation in section H.
- Open full model: **103.79 → 101.60 → 100.64** — matches §5's ψ = 0.25 row.

### Open items handed on from chat 3
1. **The de-anchoring warning banner fires at `theta > 0.35`** (λ < 0.65), but the measured
   cost-push boundary is λ ≈ 0.68 (θ ≈ 0.32), so it warns one notch late. Not changed — moving a
   trigger threshold is engine behaviour, not a tooltip. Decide whether it should match the hint
   text it sits beside.
2. ~~Run the verifier against Demo9.2.~~ **DONE** — `verify_demo93_v20.mjs` on Demo9.2 gives
   **exit 1, 3 passed / 15 failed**, so the updated script still fails on an old build. The three
   survivors are boot, the UI smoke, and Demo9.2's *own* self-tests at 5/5 — which is the stale-test
   problem recorded in section I: those asserts hard-code c₁ = 0.5, so they pass on the wrong engine.
   The self-tests alone cannot tell the builds apart; the verifier is what does. Also confirmed that
   narrowing the stale-string check (section K, Verifier) did **not** defang it: `Model Correspondence
   §6.3` is present in Demo9.2 at the old `SYMBOL_DEFS['α']` and the check still fires on all ten
   strings.
3. **The credibility law of motion (6.5) is still not in any equation box** — see the decision above.
4. **The Instructor Manual is untouched** — see section L.

---

## L. Chat 4 — the Instructor Manual (not yet started)

Extends the three-chat plan in section G. Confirmed by inspection of `Instructor_Manual.html`:
**nothing in it has been changed by chats 1–3.** It is still the pre-review document, and it is now
the only part of the suite that contradicts the engine.

### What the audit found
| Passage | Manual says | Engine / doc now |
|---|---|---|
| Multiplier | `k = 1/(1 − c₁ − d₁) = 2.5 at baseline (c₁=0.5, d₁=0.1)` | c₁ = 0.6, **k = 3.33** |
| Open multiplier | `k_o ≈ 1.43` | **k_o = 1.667** |
| Notation | uses **d₁** for the investment accelerator | engine and doc use **b₁** |
| Preset 5 | "Foreign rates jump to **6%** … i settles at the new world rate (6%)" | temporary tightening, i\* **8% for 10 periods** then a step back to 3%; **two revisions out of date** |
| Preset 5 framing | "i settles at the new world rate" | section J records this as one of the **two wrong conclusions** not to repeat |
| Preset 2a | inflation "spikes to **7%**"; loss "about **1.5×**" | peak π **6.2%**; loss ratio **1.6×** |
| Preset 3 | "Y **drifts back**" | settles ≈ **101.9** with π ≈ 2.8%; it does not drift back |
| Preset 3 title | "Exchange-Rate Disinflation" | does not describe what it does (a rate cut) — open item 2, section I |
| Preset 4 | ε "permanently higher" (no figure) | ε settles at **1.095** |

Presets 1 and 2b were not flagged by the string audit but have not been checked against the
rebuilt engine either — assume all six need re-measuring.

### Suggested brief
*Attach*: this file, the rebuilt Correspondence, `islm_pc_model_v20_M7_M8.html`,
`verify_demo93_v20.mjs`, and `v2-engine-remeasure-figures.md`.

> I'm bringing the Economo Instructor Manual up to date with the rebuilt engine and the corrected
> Model–Textbook Correspondence. The attached decisions log is the spec — section L lists what the
> audit found, section I the re-measured figures, section J what preset 5 now is and the two wrong
> conclusions not to repeat, and section K what the equation box now does. Work in this order:
> (1) re-measure all six preset narratives against the attached engine headlessly rather than
> reasoning from the log, and give me the results as a table before editing anything;
> (2) correct the constants and the multipliers, and switch d₁ to b₁ throughout to match the engine
> and the doc; (3) rewrite the preset 5 entry for the temporary foreign tightening, including the
> section J framing — the medium run pins Y at potential and the interest rate determines what
> output is *made of*, so the output cost is the one-period dip at the return, not a recession;
> (4) fix presets 2a, 3 and 4 to the measured numbers, and settle preset 3's title;
> (5) document the new "Blanchard only" equation-box switch — it is a teaching feature and a
> lecturer will want to know what the greyed lines mean. Don't change the engine.

Also worth deciding in that chat, from section H: whether the Manual gets a **full review on the
same standard as the Correspondence**, rather than only these corrections. Its preset narratives
are the part of the suite a lecturer is most likely to run step by step, and the audit above found
a fault in four of the six without anyone having reviewed it.

The licence agreement, the one-page overview and the digraphs file remain un-reviewed and are not
covered by this brief.
