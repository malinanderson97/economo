# Model–Textbook Correspondence v2 — document pass, 15 Sept 2026

Applied directly to `Model_Textbook_Correspondence_v2.html` (the built HTML is the source of
truth; the md drafts were not used). No rebuild step. Every figure is the chat-1 measurement:
exchange-rate component of the 1pp rate response **0.34**, closed-economy response **6.67**,
slider range **111 → 56** full / **120 → 30** closed.

Verified headlessly after the edits: 45 equation-number links, none broken; no duplicate `id`s;
no dangling internal anchors; exactly one number per numbered equation block with no
number/text overlap; no table overflowing its column; no page errors.

---

## Structural changes (the two former build-script items)

**Item 31 — one number per displayed equation.** The summary blocks at the head of §6, §8 and §9
each carried several equations under a single stamp. Each is now its own numbered blockquote, as
in §2:

| Block | was | now |
|---|---|---|
| §6 head | one stamp (6.3) over λ and the πᵉ update | (6.2) λ, (6.3) πᵉ update |
| §8 head | one stamp (8.2) over three equations | (8.2) UIP, (8.3) ε = EP/P\*, (8.4) Eᵉ update |
| §9 head | one stamp (9.1) over two | (9.1) P, (9.2) P\* |

Every number in a head block is a link down to the canonical anchor in the subsection where the
equation is derived (e.g. the summary's (8.3) jumps to §8.2). Two canonical anchors — (6.3) and
(9.1) — were left in the head blocks on the first pass and have since been moved into §6.3 and
§9.2, which also puts a number back on §9.2's domestic price equation and §6.3's πᵉ update.
Still in the head: **(8.2)**. §8.1 derives it from (8.1) and prints the solved form unnumbered,
so it is the same shape as the two that were moved — say the word if you want it treated the
same way. This is what makes the numbers absolutely-positioned per block — two `.eqno` spans in
one blockquote would have overlapped.

**Item 24 — "Blanchard, linearised" in the §0 legend.** Added as its own category with its own
badge style (teal, distinct from the accent tint "rearranged" uses), and applied to the two
equations that carry the label: (2.4) and (7.4), plus (7.4)'s restatement at the end of §7.2.

---

## Sections touched

**§0** — legend (new badge; "or linearised as Blanchard does" removed from the rearranged
entry); the prose label list (now four labels); notation rows for `i` and `ī` (item 16);
constants table: c₀ 20 → 12, c₁ 0.50 → 0.60, n₁ 70 → 21, Yₙ code `IS_Y_BASE` → `computeYn`,
φ range 0–3 step 0.1, step-speed range 0.05–1 step 0.05, Eᵉ weight now `E_E_ADAPT` (items 25,
26); equation index rows 3.1, 6.4 and 7.3.

**§1.1** — item 21: the "approved by Blanchard" claim and its blockquote replaced by the narrower
statement (consumption §3-2 pp. 46–47; his own linear forms for wage setting and investment; NX
the one relation the tool linearises).

**§2** — §2.2 badge → linearised, risk-premium provenance and the x = 0 paragraph (item 20);
§2.3 p. 121 → p. 112 (item 12); new multiplier-comparison paragraph at the end of §2.6 (item 19);
Values: calibration-point wording (item 27), opening output 86.7 / 93.3 / NX +2.00 (item 11b),
c₁ = 0.6 (item 19), b₁ rewritten around Problem 5 (item 9), stability-cap wording, c₀ = 12,
b₂ opening clause (item 9) and the rate-response sentence (item 1); code drawer: `IS_C0 = 12`,
default 0.6 in the table and in the quoted `isOutput`, and a new paragraph documenting the
reachable `clamp(…, 30, 200)` output clamp (item 28); References: p. 112, the c₁ row reworded,
plus rows for Ch. 5 Problem 5 and for §6-2 / eq. 6.5.

**§3** — notation note (see findings); (3.1) rewritten without the bar and recited to §23-2
p. 494 (item 8b); §3.2 opening (item 16) and both neutral-rate-marker sentences (item 2);
the rₙ baseline line now A = 12 − 12 + 12 + 20 + 30 = 62, k_o = 1/0.6, Yₙ/k_o = 60, rₙ = 1%;
(3.4) `i = max(0, i)` (item 7); §3.3 negative rates → the p. 79 margin note (item 13);
Values (3.3) → (3.4) (item 8); code drawer rebuilt for the contemporaneous rule (`solve`,
`solveAtRate`, `step`'s carry-forward, `neutralNominalRate`, the 0.6 fallback, "chart marker"
removed); References: the Switzerland row replaced, a p. 494 quotation row added.

**§4** — §4.0 wage-setting citation split (item 14); §4.2 "The episodes are Blanchard's" plus the
new paragraph on the tool's additive form (item 4); Values: α paragraph fully replaced — 0.34
named as their persistence-scaled slope coefficient, 0.0062 named as the structural slope,
0.09–0.42 spread, "0.18–0.26" deleted, their letters not reused, plus the second paragraph on
HHNS as independent support for the θ account (item 22); shock-size form sentence (item 4);
References: wage-setting row split into eq. 7.1 / §7-3 / p. 143 and the unnumbered §8-1 / p. 158
form, plus a p. 185 row for the markup shock.

**§5** — the redraft, from the measured paths. Header sentence (the rule is solved in the same
period); §5.2's middle bullet replaced — ρ is a gradualism dial, with the ρ = 0 divine-coincidence
result, the 4.62 → 5.50% path, and the ρ = 0.75-converges-faster-than-ρ = 0 result under the oil
shock (item 32); Values drawer rewritten — φ range and the φ-sweep table at θ = 0.75, ψ argued
from k_o = 1.667 (−3.3 investment, −3.7 with the FX channel, −6.7 closed) with the new ψ = 0.25
vs 0.5 table, ψ's fixedness justified, ρ's role restated, "when the rule is live" corrected;
code drawer rewritten around `taylorRate` / `solveWithRule` / the bisection, with the ZLB as
clamp-and-resolve and `TAYLOR_I_MAX`.

**§6** — anchor line and all four eq. 8.10 labels → "§8-4, p. 169; the equation preceding 8.10"
(item 5); §6.4 asymmetry attributed to the tool (item 17); Values "structure" → "idea" (item 18)
and the empty step-speed range filled (item 26); code drawer's stray `810` deleted (item 29).

**§7** — both (7.4) badges; m₁'s multiplier figures (k 3.33 → k_o 1.67); Y\* sensitivity 0.43 →
0.5; n₁ Values fully replaced with the p. 393 derivation (27 + 24 − 30 = 21) and the measured
consequences (ΔY −3.5, ∂Y/∂ε −35, NX −2.1 direct / −1.05 after imports adjust); code drawer
`n1 = 21` (item 10).

**§8** — §8.3: the flexible-rates quote cut and replaced with the accumulation-not-anticipation
statement (item 15), plus the new sentence that a permanent world-rate change works through
slowly because Eᵉ adjusts gradually; Values: the weight paragraph rewritten with the re-measured
figures and the settings line, the recovery attributed to §9's price-level channel, and the
θ = 1 note rewritten as the **deflationary collapse to Y ≈ 64** (item 3); code drawer
`E_E_ADAPT`.

**§9** — head block split only. §9 already states that P and P\* are frozen until the PC block
unlocks, in the main text and in the code drawer's "pre-PC" row; no change needed there.

---

## Things found that the log doesn't cover

1. **The equation index's row 7.3 was broken by the old build.** `n₁ ≡ −(dNX/dε)|₍ε₌₁₎` contains a
   pipe, so the markdown table split it: the subscript landed in the Label column, "Definition"
   in the Blanchard column, and the last cell was lost. Fixed. Worth checking any other
   equation with a `|` in it if the build script is ever used again.
2. **§1.2 has no opening-output figures** and **§3.1 has no opening NX figure**, though items 11b
   and 27 expect both. The only place either appears is §2 Values' "Opening output", which now
   carries 86.7 / 93.3 / NX +2.00.
3. **§3's "A note on notation" made the same wrong attribution as §3.2** — it called ī "the
   neutral nominal rate" in Ch. 23. Corrected the same way as item 16 (target nominal rate,
   "neutral" attaches to rₙ). The notation table's `i` row also gave only "ī in §5-3" as
   Blanchard's symbol; it now gives both.
4. **§0's prose label list had to move from three labels to four** when the linearised badge was
   added, and the legend's "rearranged" entry described itself as covering linearisation — that
   clause is now the new badge's job, so it was removed. Both are consequences of item 24, not
   separate decisions.
5. **§3's References carried a row for the Switzerland Ch. 6 problem (p. 131)** supporting
   precisely the sentence item 13 deletes. Replaced with the p. 79 margin note rather than left
   pointing at nothing.
6. **The `: 0.5` fallback appears in two engine functions**, not one: `isOutput` (quoted in the
   §2 drawer) and `isRateForOutput` (quoted in the §3 drawer). Both now read 0.6, matching the
   engine.
7. **`clamp(…, -0.05, 0.30)` no longer exists in the engine.** The old §5 drawer documented it as
   a guard whose lower limit never binds; the rebuilt rule uses `TAYLOR_I_MAX = 0.30` as the
   ceiling with the ZLB as the floor, both handled by clamp-and-resolve. Documented that way.
8. **The document has no preset section.** There is no narrative, no scenario state and no code
   drawer describing `SCENARIOS`, so preset 5 and the new `schedule` field have nowhere to land
   here — the only preset-driven change the doc needed was §8's permanent-versus-temporary
   statement, which is in. Preset text lives in the engine and the Instructor Manual.
9. **The filename question in section I is settled by the artefacts**: §0 already reads
   `islm_pc_model_v19_Open_Economy_Complete_Demo9_3.html`, and the engine you sent uses the
   underscore. No change needed.
10. **Unverified page, left out of the doc**: p. 493 for "flexible inflation targeting". §5.2 now
    cites the section (§23-2) with no page. If you confirm 493, it can be added.
11. **Item 30's seven comments are in the engine**, so the drawers' quoted comments now match the
    file — including `// Taylor rule, §5`, which in the rebuilt engine sits above `taylorRate`
    and is quoted there in the new §5 drawer.
12. **Item 20's check is closed and the doc reflects it**: x is introduced in §6-2 (pp. 114–115)
    and first enters the IS in eq. 6.5 (p. 121), which eq. 9.1 repeats.

## Still outstanding (engine chat, not this pass)

- Preset 3's title. Proposal, not applied: **"3. Rate Cut & Real Appreciation"** — parallel to
  preset 4 and describes the Ch. 20 mechanism the preset actually shows.
- The φ > 2 hint text (two copies, the ISLM panel and the Taylor drill box). Proposed
  replacement, same length: *"with θ_eff = 1 the rule converges for every φ ≥ 1, faster the larger
  φ, and diverges below 1 — the Taylor principle."* The first clause of that note (rule off,
  θ_eff below ≈ 0.65 Wicksell-unstable) matches the measurements and stands.
- `verify_demo93.mjs` asserts housekeeping strings, so it will need re-running after either.
- The Instructor Manual copy in outputs carries the preset 2a/3/4/5 rewrites and the m-slider
  note from earlier in this session; its other stale figures (d-naming, k = 2.5, the Y = 90 FAQ,
  the −2% rate floor, the "permanent supply shock never settles" FAQ) are listed in
  `doc-pass-prep-notes.md` and are for the manual's own review.
