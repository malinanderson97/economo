# Spec: z → shock naming (all surfaces) + PC reference to "eq. 9.3 *" with footnote

> Status: DRAFT. Display/copy-only in the engine — no `solve()`/`step()`/`computeYn` logic
> changes; internal state keys (`z`, `z_pulse`, `z_eff`) are NOT renamed in this slice (see §7).
> Includes one new verifier assertion, because this exact rename has regressed once already:
> the eq-box PC line read `+ shock` in the 2026-07-09 morning build and reads `+ z` in the
> afternoon build. Encode it or it will happen again.
> Line numbers below are from the 2026-07-09 afternoon upload — re-grep every string verbatim
> before editing (per AGENTS.md); lines drift.

## 1. Goal (one sentence)
The symbol z appears on exactly one concept — Blanchard's structural wage-setting term
(eq. 8.4) — and the tool's transitory cost-push term is called "shock" on every user-facing
surface, with the PC equation referenced as "Blanchard eq. 9.3 *" and a footnote explaining that
the shock term is a tool addition, pointing to the Model Textbook Correspondence.

## 2. The economics (anchor to the textbook)
Blanchard's eq. 9.3 is `π − πᵉ = (α/L)(Y − Yₙ)` — it has NO additive shock term. His z lives in
the wage-setting relation and the natural-rate formula (eq. 8.4), where it permanently moves uₙ
and therefore Yₙ. The tool's additive term exists precisely so transitory supply shocks (oil,
Covid) can shift the PC without relocating the natural rate. So the allocation is: **z = eq. 8.4
structural term (keeps the symbol, matching Blanchard); shock = the tool's transitory addition
(gives up the symbol entirely)**. The reference for the tool's PC line is Blanchard eq. 9.3 with
an asterisk marking the deviation, not an invented "Economo Eq." numbering scheme.

## 3. Engine display edits (islm_pc_model_v19_Open_Economy_Complete_Demo.html)
Grep-prove each old string verbatim first. Surgical exact-string edits only (no Set-Content).

**A. The five `+ z` display strings → `+ shock`:**
1. Line ~532 (PC chart sub-caption): `Cost-push z lifts the whole curve.`
   → `Cost-push shock lifts the whole curve.`
2. Line ~538 (PC legend row): `π = πᵉ + α(Y−Yₙ)/Yₙ + z` → `π = πᵉ + α(Y−Yₙ)/Yₙ + shock`
3. Line ~554 (supply drill header, `#drill-eq-phillips`):
   `π = πᵉ + (α/Yₙ)(Y−Yₙ) + z` → `π = πᵉ + (α/Yₙ)(Y−Yₙ) + shock`
4. Line ~717 (slider config): `label: 'Cost-push (PC shift), z'`
   → `label: 'Cost-push shock (PC shift)'`
5. Line ~2185 (eq-pc box PC line): `<span class="eq-sym">π = πᵉ + α(Y−Yₙ)/Yₙ + z</span>`
   → `<span class="eq-sym">π = πᵉ + α(Y−Yₙ)/Yₙ + shock</span>`
Keep untouched: line ~713 `label: 'Wage push, z'` (this IS Blanchard's z) and the uₙ display
`(m+z)/α_WS` (lines ~544 and ~2177) — that z is the structural one and stays.
Optional but recommended: extend the z_struct slider infoText to
`'Structural wage-push, Blanchard's z in eq. 8.4 (shifts natural rate) — distinct from the
transitory cost-push shock, which does not.'`

**B. Reference: "Economo Eq. 1.3" → "eq. 9.3 *" (two sites):**
6. Line ~554 (drill header ref span): `(Economo Eq. 1.3)` → `(Blanchard eq. 9.3 *)`
7. Line ~890: `'PC': 'Economo Eq. 1.3',` → `'PC': 'eq. 9.3 *',`
   (EQ_REF entries elsewhere use bare `eq. X` format; the drill header spells "Blanchard" out
   because its sibling refs do — match each site's local convention.)

**C. Footnote (two sites, one new CSS class):**
Add a CSS class near the other eq-box styles:
`.eq-footnote { font-size: 10px; color: var(--ink-4); font-family: 'Hanken Grotesk', sans-serif;
display: block; margin-top: 6px; }`
8. eq-pc box: in the `pcEl.innerHTML` template (line ~2175 block), append after the gap line:
   `<span class="eq-footnote">* shock is a tool addition — Blanchard's eq. 9.3 has none. See the
   Model Textbook Correspondence for why it is included.</span>`
   Place it INSIDE the `isUnl('PC')` branch so it only appears when the PC block renders.
9. Supply drill panel: add a static footnote div inside the drill container, directly under the
   three `.drill-eq` headers (after line ~554's sibling block):
   `<div class="eq-footnote">* shock is a tool addition — Blanchard's eq. 9.3 has none. See the
   Model Textbook Correspondence.</div>`

**D. SYMBOL_DEFS glossary — split the catch-all, keep tooltips working:**
The glossary currently has THREE z entries (lines ~848–850): 'Wage push z' (correct),
'Cost-push z' (right content, wrong key once the display says "shock"), and a catch-all 'z'
("moves the PC or natural rate") that actively merges the two concepts.
10. Keep `'Wage push z'` as-is.
11. Rename key `'Cost-push z'` → `'shock'`, and update its ref: `ref: 'eq. 9.3'` →
    `ref: 'tool addition (cf. Section 8-3)'`. Content/role already correct ("does NOT move Yₙ").
12. Repoint the catch-all `'z'` entry to structural-only (it's still needed — the uₙ display
    `(m+z)/α_WS` contains a bare z that wrapSymbols matches against this key):
    `'z': { meaning: 'structural wage-push (wage-setting relation)', ref: 'eq. 8.4',
    role: 'raises uₙ and lowers Yₙ; distinct from the transitory shock term' }`
13. wrapSymbols dependency: confirm the tooltip still fires on the word "shock" in the new
    display strings (wrapSymbols matches SYMBOL_DEFS keys against rendered text — the new 'shock'
    key from item 11 is what makes this work). Browser-check by hovering the shock term in the
    eq-pc box and the drill header.

**E. Preset narratives (user-visible text only, state objects untouched):**
14. Preset 2a narrative (line ~2414): `A transitory supply shock (z_pulse = +5%) hits:`
    → `A transitory +5% cost-push shock hits:`
    Grep `z_pulse` across ALL preset narrative strings (2b and any others) and apply the same
    treatment wherever it appears in user-facing prose. State fields (`z_pulse: 0.05`) unchanged.

**F. Bonus one-liner visible in Malin's screenshot (same eq-pc block, do it in this pass):**
15. Line ~2182: the Yₙ line renders L_LABOR raw — `${L_LABOR}(1−...)` displays
    `105.26315789473685(1−6.8%)=98`. Change to `${f(L_LABOR,1)}(1−...)` → displays `105.3`.

## 4. Manual + Correspondence edits (carried over from the addendum's item 6)
16. `Instructor_Manual.html` PC line: `π = πᵉ + α(Y − Yₙ)/Yₙ + z` → `... + shock`. Grep the whole
    Manual for any other bare-z PC rendering.
17. `Model_Textbook_Correspondence.html`: standardize `z_shock` → `shock` in the §0 equation
    index and §6.3/§6.6 prose, so all documents plus both panels use the identical word.
18. Correspondence §6.6: add one sentence making the allocation explicit:
    "Blanchard's own eq. 9.3 carries no shock term; the additive `shock` is the tool's addition,
    and the symbol z is reserved throughout for the structural wage-setting term of eq. 8.4."
    This is the section the new asterisk footnote points readers to — make sure it actually
    answers the question the footnote raises (why the term exists: transitory shocks that must
    not move Yₙ).

## 5. What must NOT change
- Internal state keys `z`, `z_pulse`, and the `z_eff = s.z + s.z_pulse` computation — display
  rename only in this slice (see §7).
- `z_struct` anywhere (key, label, or math) — that IS Blanchard's z.
- The debug dump line (~2506, `z (persistent) = ...`) — internal diagnostic, out of scope.
- No preset state values, no slider ranges/defaults, no solve()/step() lines.
- The `(m+z)/α_WS` displays — that z is correct and stays.

## 6. Invariants / verifier
- **New assertion (regression lock):** the engine source must contain
  `π = πᵉ + α(Y−Yₙ)/Yₙ + shock` and must NOT contain `+ z</span>` within any `eq-sym` PC string,
  and must NOT contain `Economo Eq`. Add to `verify_onboarding.mjs` (it already imports EQ_REF /
  SYMBOL_DEFS / wrapSymbols, so it's the natural home). BAD-fixture: a copy with one site
  reverted to `+ z` must fail; grep-prove the fixture's `.replace()` target exists first.
- **Verifier coupling check:** `verify_onboarding.mjs` loads `EQ_REF` and `SYMBOL_DEFS` directly
  (line ~23) — grep the CURRENT local verifier for `Economo`, `Cost-push z`, and `'z'` key
  assertions before editing; if any assertion hard-codes the old strings, update it in the same
  commit, and say so in the commit message.
- Both verifiers green at their current counts; `mutation_check.mjs` passes; HS-1 after the HTML
  edit.
- Browser check (this is presentation): eq-pc box shows `+ shock` with the footnote; drill panel
  shows `+ shock`, `(Blanchard eq. 9.3 *)`, and the footnote; shock tooltip fires on hover;
  slider label reads `Cost-push shock (PC shift)` without overflowing its container; Yₙ line
  shows `105.3` not the raw float.

## 7. Deferred (separate slice if ever wanted): internal state-key rename
`z`/`z_pulse`/`z_eff` → shock-named keys would be a d1r→d2-style refactor with a much larger
footprint (solve(), presets, history serialization, debug dump, verifier fixtures — 20+ sites).
Same invariant pattern if done: zero remaining old token, byte-identical verifier numerics,
before/after count check proving `z_struct` untouched. Do not fold into this slice.

## 8. Done criteria
- [ ] All 15 engine edits applied; grep `Economo` returns zero hits; grep `+ z<` and
      `+ z ` in display strings returns zero PC-equation hits (the uₙ `(m+z)` hits remain, by
      design).
- [ ] Manual and Correspondence use the identical word "shock"; `z_shock` greps to zero across
      all three documents.
- [ ] Regression-lock assertion added and BAD-fixture proven to fail.
- [ ] Verifiers green at current counts (state numbers on re-run); mutation_check passes; HS-1 run.
- [ ] Browser check per §6 — screenshot the drill panel and eq-pc box.
- [ ] Full diff read by Malin before commit; commit message notes this is the SECOND time the
      shock rename has been applied, and points at the new lock assertion.
