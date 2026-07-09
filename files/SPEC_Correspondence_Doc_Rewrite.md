# Spec: Model_Textbook_Correspondence rewrite (equation index, derivations, scrub, fidelity fixes)

> Status: DRAFT. Documentation-only. No `solve()`/`step()`/`computeYn` changes in this spec —
> see the companion `SPEC_Rename_d1r_to_d2.md` for the one engine-touching item, kept separate
> deliberately (see AGENTS.md: engine scope is frozen; this ticket should not need engine review).
> All items below, including §5 item G (the θ/credibility fix), are confirmed errors and are
> safe to implement directly — none of this is gated on external review.

## 1. Goal (one sentence)
Rewrite `Model_Textbook_Correspondence` (currently `.txt`/`.docx`; this spec's edits should be
applied to whichever is made canonical — see §2 note) so it is accurate enough, and readable
enough, that `Instructor_Manual.html` can link to it instead of citing raw Blanchard equation
numbers directly — while fixing four verified factual errors along the way.

## 2. Which file(s)
- `Model_Textbook_Correspondence.html` is now the **sole canonical format** (Malin's decision:
  all documentation other than the software licence agreement is HTML going forward). Apply every
  edit in this spec to the `.html` file. Retire the `.docx` and `.txt` as this ticket lands — do
  not keep hand-syncing three formats; if either is still referenced anywhere (README, links,
  build scripts), update the reference to point at the `.html` instead. The `.txt` in the project
  mirror is lossy (Greek letters/asterisks/minus signs rendered as `?`) and was only ever useful
  as a grep-able mirror — once `.html` is canonical it has no remaining purpose.
- **Add stable section anchors** (`id="..."` on each `<h2>`/`<h3>`) — `SPEC_Instructor_Manual_
  Correspondence_Pointers.md` links to these by real `href="Model_Textbook_Correspondence.html#..."`
  anchors, so these exact id strings must exist verbatim (case-sensitive, no substitutions):
  - `id="consumption"` — §2.1
  - `id="investment"` — §2.2
  - `id="is-equilibrium"` — §2.4 / §3
  - `id="is-coefficients"` — §3 (coefficient table)
  - `id="open-is"` — §7.2
  - `id="linearising-net-exports"` — §7.3
  - `id="reduced-form-coefficients"` — §7.4
  - `id="uip"` — §7.1
  - `id="pc-conversion"` — §6.3
  - `id="natural-rate"` — §6.2

  These ten are load-bearing (the Manual links to them); add ids on other headers too for general
  navigability, but these ten must exist under these exact strings or the Manual's links 404/dead-
  scroll silently. Do this pass *before* `SPEC_Instructor_Manual_Correspondence_Pointers.md` is
  actioned, and re-confirm the strings match if either spec's section numbering shifts during
  implementation (e.g. if §4's renumbering per item D changes what's now §7.x).
- `islm_pc_model_v19_Open_Economy_Complete_Demo.html` — three copy-only string edits (§6). No
  `solve()`/`step()` lines touched.
- `Instructor_Manual.html` — supplied by Malin; see the companion spec for its edits, which now
  depend on the anchor ids added here.

## 3. The economics (anchor to the textbook) — verified against the Blanchard PDF directly

**A. UIP eq. 19.5 typo (confirmed real, not an artifact).** Current doc: `E = Eᵉ(1+i)/(1+i)`.
Blanchard's actual eq. 19.5 (confirmed against the PDF): `E = Eᵉ·(1+i)/(1+i*)` — the second term
is missing its asterisk. Fix by inserting `*`.

**B. NX eq. 19.1 typo (confirmed real).** Current doc: `NX(Y, Y, ε) = X(Y, ε) − IM(Y, ε)/ε`.
Blanchard's actual eq. 19.1: `NX(Y, Y*, ε) = X(Y*, ε) − IM(Y, ε)/ε` — both missing asterisks are
on the foreign-output term, `Y*`. (Verified by comparing against the correctly-asterisked `Y*`
two lines below in the same file, and against the PDF.)

**C. Real appreciation quantity-effect direction (confirmed real, this is a substantive error,
not a typo).** Current doc (§7.3 area): *"a real appreciation has two opposing effects on net
exports: it reduces export volumes and import volumes (quantity effect, lowering NX)..."*
This is economically wrong on the import side. A real appreciation makes foreign goods cheaper
in domestic terms, so **import volumes rise**, not fall. The correct statement: exports fall
(hurts NX) AND import volumes rise (also hurts NX) — that's the quantity effect Marshall-Lerner
requires to dominate; separately, each unit of import costs less in domestic-currency terms
(valuation effect, which by itself would help NX). Replace with:
> "Economically, a real appreciation has two opposing effects on net exports: it reduces export
> volumes and increases import volumes (quantity effect, both pushing NX down), but it cheapens
> each imported good in domestic-currency terms (valuation effect, pushing NX up). Marshall–Lerner
> is the condition that the volume effects dominate the valuation effect, so that on net a real
> appreciation worsens net exports — i.e. n₁ > 0."

**D. Investment/UIP/NX general content (§1, §2, §7 in the proposed rewrite) — checked against
the PDF, no errors found.** `I=I(Y,i)` (eq. 5.1) → real borrowing rate `r+x` introduced in Ch.6
eq. 6.5 → carried into Ch.9 eq. 9.1 exactly as the current doc already documents. The proposed
rewrite's shorter "eq 5.1 → Ch.9" framing isn't wrong, just less complete than the existing Ch.
3→5→6→9 chain — keep the fuller chain, don't shorten it.

## 4. What must NOT change
- No `solve()`, `step()`, or `computeYn` edits anywhere (this is a documentation ticket).
- Baseline numbers unchanged: closed k=2.5, open k_o≈1.43, pre-PC Y=90, medium-run Y=100,
  neutral rate 3% at baseline. This spec explains these, it does not touch them.
- Existing correct content is not to be "improved" into something looser — e.g. don't touch the
  UIP/NX equations beyond the two specific asterisk insertions in §3.A/B.

## 5. Content changes — checkable, itemized

**A. Equation index.** Add a new section at the top: one table listing every final linearized
tool equation (I, NX, k, k_o, UIP, PC, u_n/Y_n, Taylor rule) with a one-line description and a
link/anchor to its full derivation section. Purely additive, no existing section renumbers as a
result (put it before current §1).

**B. Section-header equations.** Each major section header (Investment, NX, Phillips curve, etc.)
gets the final linearized equation displayed directly under the header, before the derivation
prose. Purely additive.

**C. Color-highlighting of derivation steps.** In each step-by-step derivation, highlight the
specific term/side being discussed in that step (e.g. color the `Y` terms during "group all `Y`
terms on the left"), using inline `<span style="color:...">` or a CSS class consistent with the
Economo design system's accent palette. Cosmetic, straightforward now that `.html` is the only
format — no lossy-mirror constraint to work around.

**D. Scrub legacy references — delete, don't reword.**
- Delete §4.1 "Relation to the original tool (pre-refactor v16)" entirely (the whole
  Original-v16-vs-faithful-Ch.9 coefficient table at lines ~99–101 of the current .txt).
- In current §4.2 ("The closed economy in the unified tool (Y=90 pre-PC)"), remove every mention
  of "v16" / "the retired standalone v16" / "the retired v16" — the explanation of *why* Y=90 is
  correct stands on its own without the legacy-tool comparison; keep the "why Y=90" economic
  reasoning, drop the "vs v16" framing sentences.
  - Renumber: since §4.1 is deleted, current §4.2 becomes the sole subsection of §4 — either
    fold it into an unsectioned §4, or renumber it 4.1. Grep the whole document afterward for
    dangling `4.1`/`4.2` cross-references and fix them.
- Delete the trailing technical/attribution sentence from the end of §4.2: *"Verifier encoding:
  pre-PC ({GOODS,ISLM}) -> Y = 90 +/- 0.1, r = i exactly, Y invariant to pi-e; medium run
  ({GOODS,ISLM,PC}) -> Y = 100 +/- 0.1, r = i - pi-e. Decision owner: Malin (2026-06); not routed
  to Frank."* The preceding "Why Y=90" paragraph already is the plain-English explanation this
  ticket wants — this sentence is pure implementation/attribution detail, cut it, don't rewrite
  it into prose.
- Grep the whole document for `v16`, `v19`, `Malin`, `Frank` after edits: expect zero remaining
  hits outside of `§8 Implementation prompt (applied — retained as the build record)`, which is
  explicitly a historical build log and can be left alone or moved to an internal-only appendix
  — Malin's call.

**E. "Closed vs open baseline output" — this is new content, not a replacement.** ⚠️
Implementation note: the proposed edit describes this as "replace the complex 'Verifier encoding'
paragraph with a straightforward economic explanation" about why open-economy baseline Y exceeds
closed-economy baseline Y despite k_o < k (because baseline NX > 0). **I could not find an
existing paragraph in the current document that makes this closed-vs-open comparison** — the
only "Verifier encoding" text in the document is the PC-unlock (Y=90→100) one handled in item D
above, which is a different comparison (closed pre-PC vs closed post-PC, not closed vs open).
So: keep item D's cut as its own edit, and separately **add** this as new content (a good
addition — §4 or §7 are the natural homes):
> "Even though the closed-economy multiplier (k=2.5) is mathematically larger than the
> open-economy multiplier (k_o≈1.43), baseline output is still higher in the open IS-LM-UIP stage
> than in the closed IS-LM stage. This is not a multiplier effect — it's because baseline net
> exports (NX) are positive at the tool's default parameters (export propensity x₁ and the
> exchange-rate baseline outweigh the import leakage m₁ at ε=1), which adds directly to demand
> independent of the multiplier that amplifies it."
Verify this claim against the actual baseline parameter values in the engine (x₁, m₁, n₁, ε
baseline) before publishing — don't assert positive baseline NX without checking the live
constants.

**F. Other proposed rewording — all fine as specified, no fidelity issues found:**
- LM/MP: relabel money-demand explanation "Linearised form of L(i)" (make clear λ₀/λ₁ are ours).
- Remove the "money-market panel" paragraph (current §5.1, the "Money demand is abstract..."
  paragraph) and the reference at "Money-market panel is a CONSEQUENCE display" (§8 build log,
  optional if §8 is kept as historical record) — panel no longer exists in the tool.
- Clarify I_NEUTRAL / Taylor rule neutral-rate explanation — current text is already close to
  what's wanted; light copy-edit only, no factual change needed.
- Add concrete examples for structural m/z shifts (monopoly power / union strength) — additive.
- Inflation's role in open/closed output (r=i−πᵉ lowering real rate → higher I) — additive,
  no existing content to check against; straightforward and correct as proposed.

**G. θ / credibility — confirmed error, implement directly.**
This is a genuine notation conflict, not a copy-edit — the doc currently makes a factual claim
about the tool that the engine code contradicts. Fix it the same way as items A/B/C: state what's
actually true and correct the text.

**What I verified:** Blanchard's own eq. 8.7 (`πᵉ=(1−θ)π̄+θπ₋₁`) and Fig. 8-4 walkthrough use θ
as a *de-anchoring/adaptive weight*: θ=0 is fully anchored (static expectations, the "original"
pre-1970s tradeoff, eq. 8.6), θ=1 is fully adaptive (the accelerationist form, eq. 8.9). The
current Correspondence doc (§6.4–6.6) states this correctly and matches the textbook.

**The actual bug:** the doc then claims *"the tool implements this exactly via effective
anchoring θ_eff=(max anchoring)×(current credibility)... this is Blanchard's account... a clean
structural match."* It is not a clean match — it's inverted. I checked the live engine
(`islm_pc_model_v19...html`, `effectiveTheta()` and the `pi_e_drift` formula at the `step()`
function): the **tool's** `theta`/`theta_eff` runs the opposite direction from Blanchard's
textbook θ. In the tool, θ_eff=1 means full anchoring/credibility (expectations pinned to
target); θ_eff=0 means fully adaptive/de-anchored. This is confirmed by the UI's own tooltip
text ("at θ=1, full credibility pins expectations to π*"), which is internally consistent with
the engine code — so the **UI is fine and needs no changes**. It's specifically the
Correspondence document's claim of an exact match to Blanchard's θ that's wrong. It's wrong
regardless of who wrote it or when — fix it like any other confirmed error in this spec.

Concretely, every "θ_eff → 1" in §6.4/§6.6 describing the de-anchored/spiral/low-credibility case
needs to become "θ_eff → 0" (or the sentence needs to be restated around credibility/anchoring
language instead of θ_eff, since credibility and Blanchard's θ point opposite directions). The
§6.7 summary-table row *"Expectations πᵉ=(1−θ)πᵉ+θπ; eq. (8.7); Exact; credibility=θ_eff"* is the
specific line asserting the false equivalence and needs to be corrected to state the inversion,
not deleted — a reader comparing the tool's slider to the textbook formula needs to be told they
run opposite ways, not have the comparison silently dropped.

**Replacement text for §6.5 (insert after the eq. 8.7 explanation, replacing the "clean
structural match" sentence):**
> "The tool's anchoring slider (θ, 'max anchoring ceiling') and Blanchard's θ in eq. (8.7) use
> the same symbol for inverse concepts: Blanchard's θ is the weight on last period's *actual*
> inflation (high θ = more adaptive = less anchored); the tool's θ is anchoring *capacity* (high
> θ = more anchored = more credible). The tool's effective anchoring θ_eff = θ × credibility
> corresponds to Blanchard's (1 − θ_Blanchard), not to θ_Blanchard directly. This is a deliberate
> UI choice — 'higher slider = more central-bank credibility' is the more intuitive direction for
> a policy-facing control — but the tool's θ is not literally identical to Blanchard's θ, and this
> document should not describe it as such."
This also explains why the engine's own preset narratives (two presets both setting `theta:1`,
one calling it "purely adaptive" and the other "credibility is absolute") read as contradictory
on a raw code read — that contradiction is a direct symptom of this same mislabeling, worth
noting in the doc as a concrete illustration of why the distinction matters.

## 6. UI copy-only edits (islm_pc_model_v19...html) — no engine logic touched
Grep-prove each old string exists verbatim before editing (per AGENTS.md discipline):
- `EQ_REF['anchor']` (currently `'eq. 9.1'`, line ~805) → confirm this already reads `eq. 9.1`
  for the `Y=C+I+G+NX` panel line; if the open-economy panel needs `9.1/19.1` specifically,
  update this value, not a hardcoded string elsewhere.
- `EQ_REF['PC']` (currently `'eq. 9.3 (expectations 8.7, natural rate 8.4)'`, line ~809) →
  append the instructor-facing pointer: `'Adapted from Blanchard Eq. 9.3 (see Model
  Correspondence for derivations)'` per the proposal — confirm this doesn't break the panel's
  line-length/layout before committing (browser check required, this is presentation).
- Alpha slider (`key: 'alpha'`, line ~633, label `'PC slope, α'`) — the slider config line itself
  has no tooltip string attached at that line; the Phillips-curve tooltip block lives in the
  `#hint-dynamics` div (~line 374). Locate the correct tooltip element for the alpha slider
  specifically (may be a separate per-slider tooltip, not `#hint-dynamics` which is about θ) and
  append a one-line pointer to the Correspondence booklet. Grep-prove the actual element before
  editing — don't guess the selector.

## 7. Instructor_Manual.html
Not available in the current project mount. Before actioning: Malin to supply the file (or its
current equation-number citations) so the "strip direct numbers, point to Correspondence instead"
edit can be scoped precisely rather than done blind.

## 8. Done criteria
- [ ] §3.A, §3.B, §3.C fixes applied verbatim as specified above.
- [ ] §5.D: v16/v19/Malin/Frank grep returns zero hits outside §8 build-log (or that section is
      moved/retitled per Malin's call).
- [ ] §5.E: new closed-vs-open NX paragraph added, and its "baseline NX positive" claim verified
      against the live engine's x₁/m₁/n₁/ε constants before publishing (not asserted on faith).
- [ ] §5.G: θ/credibility section corrected — every "θ_eff → 1" describing the de-anchored case
      fixed to "θ_eff → 0" (or restated in anchoring/credibility language), the §6.7 summary-table
      row corrected to state the inversion rather than claim a "clean structural match", and the
      §6.5 replacement text inserted. No engine/UI changes required for this item.
- [ ] §6 UI copy edits pass a browser check (panel layout doesn't break/overflow) — this is a
      presentation change like any other, verifier-green alone isn't sufficient per your usual
      staged-verification rule.
- [ ] Full diff read by Malin before commit, as usual — this is a large text diff, worth reading
      end to end once rather than skimming given how much of it is prose.
