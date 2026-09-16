# Build notes — knowledge-base diversions and code housekeeping

Collected from every section draft at build time. Nothing here is in the public HTML.


## From §1 Approach
## Diverted to the knowledge-base document

- Old §1.1–1.2: the two gates and the four stages (what is live when, per stage). The public doc keeps only the "note on unlocking" in §0 and the opening-output note in §2.

## Still to check

- Nothing.


## From §2 The IS equation
## Diverted to the knowledge-base document (not in the public HTML)

- Opening-state table by stage (Y, C, I, G, NX for all four stages).
- Appendix 3 regression coefficients (0.63 / 0.69) and the note on how Blanchard rounds them to 0.5–0.8.
- Ch. 3 "trick question" on c₁ > 1.
- Coefficient table and tax-multiplier asymmetry (from the old doc).
- Numeric check-cases, closed and open.

## Code housekeeping (for the model file, not this doc)

- Line 710 comment still says C≈58, I≈17, G≈20, NX≈5 — should read C=60, I=20, G=20, NX=0 at r = 1%.
- Line 738 comment "= 32 − 12 as used in eq box" is opaque; suggest "c₀; autonomous spending c₀ + b₀ = 32 as shown in the equation box".
- The ZLB constant's comment cites Ch. 23; the "zero lower bound" statement is §4-4, p. 79 (Ch. 23 also discusses it). Worth citing both.

## Still to check in the book

- Nothing outstanding.


## From §3 The LM curve: the policy rate
## Code housekeeping (for the model file)

- Slider label: `'Policy rate (target), i'` → `'Policy rate, i'`. (Decision A: i = policy rate, ī = neutral rate.)
- Symbol glossary: `'i_N'` → ī, to match the Taylor-rule equation box, which already writes the neutral rate as ī.
- `ZLB` comment cites Ch. 23; add §4-4, p. 79 as the primary reference.
- The Taylor-rule clamp `clamp(…, -0.05, 0.30)` has a lower limit of −5% that can never bind, because `Math.max(ZLB, raw_i)` follows it. Harmless; could be tidied to `clamp(…, ZLB, 0.30)`.

## Diverted to the knowledge-base document

- `IS_R_BASE` and `IS_EPS_BASE` and how the equation box displays the IS in deviation form.
- Stage/gate detail: which stages grey out the slider and when the Taylor toggle is available.

## Still to check in the book

- Nothing outstanding for this section.


## From §4 The Phillips curve
## Diverted to the knowledge-base document

- Old §6.5's long passage on "the two meanings of a steep Phillips curve" (slope vs. multi-period drift, what the θ slider does and doesn't move). Kept in full there.
- Old §6.2's paragraph on why higher z raises unemployment ("this sign can seem backwards…"). Good teaching text, but it's explanation of a result rather than derivation or calibration; suggest the Instructor Manual or KB.
- Old §5.3's Identity A / Identity B presentation of the u→Y conversion. Your one-substitution version in 4.1 replaces it.

## Code housekeeping

- Comment and the symbol glossary should say the PC-slope slider α and `ALPHA_WS` are Blanchard's one α split in two (the comment currently says "DISTINCT", which is true but hides that Blanchard has only one).
- Consider renaming the transitory-shock slider key `z` → `shock` (or `z_shock`) in a future version so the code matches Blanchard's use of z. Cosmetic; not urgent.

## Still to check in the book

- Nothing outstanding.


## From §5 The Taylor rule
## Diverted to the knowledge-base document

- Old §5.4's note on the "shock-aware neutral rate (Option B)" — the design decision to recompute ī from the IS each period rather than hold it at 3%. The public doc states the mechanism in §3.2; the option history goes to KB.
- Old §5.6 block summary table.

## Code housekeeping

- Nothing new. (The −0.05 clamp is already on the §3 list.)

## Still to check

- φ slider range in the code (I'll pull it when building; nothing for you to look up).


## From §6 Inflation expectations and anchoring
## Diverted to the knowledge-base document

- Old §6.6's fuller eq. 8.10 exposition (the version above is cut to the argument).

## Code housekeeping

- Nothing new.

## Still to check in the book

- Range of the step-speed control (I'll pull it from the HTML at build time).


## From §7 Net exports
## Diverted to the knowledge-base document

- Old §7.4's reduced-form coefficient derivation in deviation form and the whole of §7.5 (numeric check-case table, pre-PC NX = 3 explanation).
- Old §7.6 (foreign-output channel as a teaching scenario — three-channel external-shock lesson). Instructor Manual material.
- Old §7.7 block summary.

## Code housekeeping

- Nothing new. (Line numbers in the §4 code dropdown are off by one — `z_eff` is 849 and the Phillips curve 850; I'll correct all line references against the file at build time rather than patch the drafts now.)

## Still to check in the book

- Nothing outstanding.


## From §9 Price-level dynamics
## Diverted to the knowledge-base document

- Old §7.1's remark that the old ad hoc −100·(ε − 1) term was replaced by the derived n₁·k_o.

## Code housekeeping

- Line 902 (and 2460): the `0.4` adaptive weight on Eᵉ should be a named constant (e.g. `E_E_ADAPT = 0.4`) with a comment, like the DEANCHOR constants.
- `EQ_REF` points the equation box at old-doc section numbers — "Model Textbook Correspondence 6.6" for πᵉ and "Correspondence §7.8" for P′, P\*′ and Eᵉ′. Once the new doc is built these become §6, §9, §9 and §8 respectively. I'll list the exact strings when we get to the build.

## Still to check in the book

- Nothing outstanding.
