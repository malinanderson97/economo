# Spec: G20 Country Calibration Presets

**Owner:** Malin · **Implementer:** Antigravity · **Sign-off:** Malin runs verifier + browser-check, Malin commits.
**Scope:** ADD a country-calibration preset library to the model file. NOTHING ELSE.
**Status:** DRAFT — economics framing below is Claude's; Frank has NOT signed off on the per-country numbers or on whether calibration presets belong in the teaching tool at all. Run the *idea* past Frank before shipping to students.

---

## 0. Why this spec is strict

These presets put **named real-world statistics in front of students**. A wrong number here is worse than a wrong number in a scratch scenario: it is a factual claim about a real economy, attributed (implicitly) to a textbook-grade teaching tool that Malin and Frank intend to sell. The verifier can check that a preset *loads cleanly and the engine stays in range* — it CANNOT check whether "Japan's policy rate is X%" is true. That gap is the entire risk surface. This spec closes it by forcing a cited live source per number and a human-checkable audit table, NOT by trusting the agent's recall.

**The UK example preset (`uk_model_preset.md`) is a FORMAT reference, not a correctness reference.** It contains at least one filler value dressed as an estimate (`c1=0.50` "standard mid-point" — not UK-specific). Do not propagate that pattern. See §4.

---

## 1. Country list (FIXED — do not add, do not substitute)

Build a preset for each of these 18 units. The two non-country G20 members (EU, African Union) are EXCLUDED because they have no single national fiscal/monetary authority that maps to this model.

```
Argentina, Australia, Brazil, Canada, China, France, Germany, India,
Indonesia, Italy, Japan, Mexico, Russia, Saudi Arabia, South Africa,
South Korea, Turkey, United States
```

(United Kingdom already exists as `uk_model_preset.md` — REGENERATE it under this spec too, so all 19 share one provenance standard. That makes 19 presets total.)

If you cannot source a country to the standard in §3, you STOP and report it as FAIL for that country. You do NOT fill the gap with a regional average, a "typical emerging-market value", or a recalled figure. A missing country is a pass; a fabricated country is a catastrophic fail.

---

## 2. Parameter mapping (READ THIS BEFORE SOURCING ANYTHING)

The model is an index where **Yₙ = 100 = potential output**. Every "level" parameter is expressed on that index. Because Yₙ=100, a share-of-GDP figure is numerically equal to its level — but that is a *coincidence of the normalisation*, and you must source the share and then state the level. Do not invent absolute-currency figures.

| Engine key | What to source | Units / framing | Notes |
|---|---|---|---|
| `G` | Govt **final consumption** expenditure, % of GDP | level on Yₙ=100 (so 21% → `21`) | NOT total public spending. Exclude transfers (welfare, pensions, debt interest). Engine baseline is 20. |
| `T` | **Net** taxes = total tax revenue − transfers, % of GDP | level on Yₙ=100 | Net, not gross. Engine baseline is 20. At baseline G=T (balanced). |
| `i_target` / `i` | Central bank **policy rate**, current | decimal (3.75% → `0.0375`) | Set `i` = `i_target`. Cite the rate-setting body + decision date. |
| `i_star` | A **foreign/world** policy rate proxy | decimal | State WHICH proxy (Fed / ECB / trade-weighted). Same proxy choice across all presets, or justify per-country. |
| `pi_e` | **Expected** inflation (central bank projection or survey), ~1yr | decimal | This is expectations, not latest headline CPI. Cite the projection. |
| `B` | Govt debt, **% of GDP** (gross general govt or PSND — state which) | level on Yₙ=100 (95% → `95`) | Slider is keyed `B` but means d=B/Y. Same debt measure across all presets. |
| `g` | **Trend / potential** growth rate | decimal | Trend, not latest-quarter actual. Debt-accounting input only. |
| `c1` | Marginal propensity to consume | dimensionless 0–1 | **See §4 — this is the danger parameter.** |
| `m1` | Imports, % of GDP (import penetration) | dimensionless 0–1 (33% → `0.33`) | Engine clamps slider 0.05–0.60; if a country's import share exceeds 0.60, set 0.60 and FLAG. |
| `alpha` | Phillips-curve slope (output-gap sensitivity of inflation) | dimensionless | Rarely country-specific in published form. **See §4.** |
| `theta` | Max anchoring of inflation expectations (credibility ceiling) | dimensionless 0–1, in BANDS only | **NOT a sourced statistic — a JUDGED band. See §4A.** This is the ONE regime field that varies per country. |

**DERIVED — DO NOT SET FROM COUNTRY DATA:**
- `Y_n` is COMPUTED by `computeYn()` from `m_struct`/`z_struct`. Leave both at engine defaults (`m_struct: 0.05`, `z_struct: 0.10`) so Yₙ stays 100 and every preset shares the same index. Setting a country's actual unemployment here would silently move Yₙ and break the "100 = potential" reading everything else depends on. Do NOT touch `m_struct`, `z_struct`, `ALPHA_WS`, `L_LABOR`.
- `P`, `P_star`, `E_e` → leave at `1.0`. These are index/baseline normalisations, not country data.
- `Ystar` → leave at `100`.

**FORBIDDEN as country data:** `cred`, `phi`, `taylor_on`, `deanchor_on`, `speed`, `z`, `z_pulse`. These are *pedagogical regime switches*, not macro statistics. Use the SAME fixed defaults for EVERY country (`cred:1.0, phi:1.5, taylor_on:true, deanchor_on:true, speed:0.5, z:0, z_pulse:0, period:0, history:[]`). If you find yourself wanting to vary one to "fit" a country, STOP — that is a teaching choice for Frank, not a calibration.

**SOLE PER-COUNTRY REGIME EXCEPTION — `theta`:** Expectations anchoring is a genuine country characteristic, so `theta` varies per preset. But it is a JUDGED band, not a sourced figure — see §4A for the mapping, the proxy-sourcing requirement, and the mandatory `JUDGED` status. Every OTHER regime field stays fixed as above.

---

## 3. Sourcing standard (the part the verifier can't enforce — so it's on you)

For EVERY numeric value in EVERY preset (except the fixed regime defaults in §2), you MUST record, in the audit table (§5):

1. The **value** as it goes into the preset.
2. The **raw source figure** it derives from (e.g. "govt final consumption 19.8% of GDP").
3. A **live, fetchable URL** to a primary or near-primary source — central bank, national statistics office, IMF, OECD, World Bank, or the country's OBR-equivalent fiscal body. NOT a blog, NOT a "trading economics"-style aggregator as the *sole* source, NOT your own recall.
4. The **date / vintage** of that figure.
5. Any **transformation** applied (e.g. "gross tax 30% − transfers 11% = net 19").

Rules:
- **One URL minimum per number.** If you cannot fetch a live source for a number, that number is unsourced → the country FAILS (see §1).
- **Policy rates and debt ratios change.** Use the most recent available; if your knowledge is stale, the live fetch is what makes it current. State the decision/observation date.
- **Prefer the same institution family across countries** for comparability (e.g. IMF WEO for debt and growth, OECD for govt consumption), and note where you had to deviate.
- **No silent rounding to "nice" numbers.** 0.0375 is fine; 0.04 "because it's close" is a transformation and must be logged as one.
- If two reputable sources disagree materially, log both and pick the more primary one, noting the conflict.

This tool has web fetch. Use it. A preset built from memory is a FAIL even if the numbers happen to be right, because neither you nor Malin can verify it.

---

## 4. The `c1` and `alpha` trap (mandatory honesty)

`c1` (MPC) and `alpha` (PC slope) are **rarely published as clean per-country values** the way a policy rate is. The UK example quietly used `c1=0.50` as a "standard mid-point" — i.e. a default wearing the costume of an estimate. Do not repeat this silently.

For each country, for `c1` and `alpha` specifically, do ONE of:
- **(a)** Source a genuine country-specific estimate (e.g. an empirical MPC study, a central bank Phillips-curve estimate) with a URL — then it's a real calibration; OR
- **(b)** Use the engine default (`c1:0.5`, `alpha:0.3`) AND mark it in the audit table as `ASSUMED — engine default, no country source` and set a boolean `assumed` flag in the preset object (see §6).

Option (b) is acceptable and often correct — but it must be *labelled as an assumption in the data*, never presented to a student as "this is France's MPC." Honesty about what is calibrated vs assumed is the whole point.

If a preset has more than 4 of its ~10 numeric fields on ASSUMED defaults, it is not really a "calibration" — flag the whole country as `weakly-calibrated` so Frank can decide whether it's worth showing.

---

## 4A. `theta` — a JUDGED band, never a sourced statistic

`theta` is the ONE regime field that varies per country (see §2). It must be handled with MORE care than the macro figures, not less, precisely because it looks like a number you could cite but isn't.

**There is no published value of θ for any country.** θ is an internal parameter of *this* model — the ceiling weight on target vs. past inflation in the expectations update. No central bank reports it. So it can NEVER carry status `SOURCED`. Its status in the audit table is always **`JUDGED`**. Conflating a judged band with a sourced figure is the exact "filler dressed as estimate" failure this whole spec exists to prevent.

**What you DO source (with URLs)** are the *proxies* that justify the band — and these are real and published:
- Inflation-expectations **anchoring** research (IMF WEO chapters, BIS working papers) measuring how much survey/market expectations move when actual inflation moves. This is the strongest proxy: expectations that barely budge during a spike ⇒ well-anchored ⇒ high band.
- Length of a **formal inflation-targeting** regime and its hit/miss record.
- A published **central-bank-independence** index.
- Recent track record of inflation sitting near target vs. drifting.

**The band scheme (use these four values ONLY — no other decimals):**

| θ | Meaning | Typical profile |
|---|---|---|
| `0.9` | Long-credible targeter | e.g. Germany/France via ECB, Japan, Canada, Australia |
| `0.7` | Established but tested | e.g. UK, US, South Korea |
| `0.5` | Newer / recently strained | e.g. Brazil, Mexico, India, South Africa, Indonesia |
| `0.3` | History of de-anchoring | e.g. Turkey, Argentina, Russia |

The country examples above are *illustrative starting suggestions, not instructions* — assign each country's band from its sourced proxies and justify it in one sentence. Do not invent intermediate values like 0.65 to seem precise; the whole point of bands is to be honest that this is a coarse judgement.

**Audit requirement:** every `theta` row has status `JUDGED`, at least one proxy URL, the assigned band, and a one-sentence rationale. A `theta` with no proxy and no rationale is a FAIL for that field.

**Frank sign-off:** the band assignments — especially anything touching how the post-2021 inflation episode pulls the US/UK/EU down a band — go in front of Frank. This reverses the earlier standing decision that θ was a fixed teaching default, so it is explicitly his call to confirm, not Malin's to own alone. Flag this prominently in the report.

**UI / documentation requirement:** below the country-preset picker, add a short standing note (always visible when a country preset is active, or as a one-line caption under the picker) to the effect of: *"Expectations-anchoring (θ) is a rough, banded judgement of central-bank credibility, not a measured statistic — see calibration notes."* The full explanation (the band scheme + that θ is judged, not sourced) goes in `Country_Preset_Audit.md` and any user-facing docs. Students must never read θ as a reported figure.

---

## 5. Deliverable 1: the audit document (BUILD THIS FIRST, before touching code)

Create `Country_Preset_Audit.md`. One section per country. Each section is a table with columns:

`engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status`

where `status` ∈ {`SOURCED`, `ASSUMED`, `JUDGED`, `CLAMPED`, `CONFLICT`}. (`JUDGED` is for `theta` only — see §4A.)

End each country section with a one-line verdict: `CALIBRATED` / `WEAKLY-CALIBRATED` / `FAILED — <reason>`.

**Malin reviews this document before any code is written.** Do not proceed to Deliverable 2 for a country until its audit row is complete. Paste the full audit doc in your report.

This is also where the real review happens: Malin (and ideally Frank) read the URLs and sanity-check, say, "is China's policy rate really represented by the 7-day reverse repo, and did you use that?" The audit table makes that checkable in minutes instead of impossible.

---

## 6. Deliverable 2: the preset objects

Mirror the existing `SCENARIOS` array pattern in the model file. Add a SEPARATE array — do NOT merge into `SCENARIOS`, which holds pedagogical scenarios with narratives, not calibrations.

```javascript
// Country calibration presets — see Country_Preset_Audit.md for provenance.
// theta is a JUDGED per-country anchoring band (§4A). EVERY OTHER regime
// switch (phi, taylor_on, ...) is a FIXED teaching default, NOT country data.
// Yₙ is derived (m_struct/z_struct left at engine default).
const COUNTRY_PRESETS = [
  {
    id: 'GB',
    label: 'United Kingdom',
    calibration: 'CALIBRATED',          // or 'WEAKLY-CALIBRATED'
    assumed: ['c1', 'alpha'],           // keys using engine defaults, not country data
    theta_band: 0.7,                    // JUDGED — mirrors state.theta; surfaced in UI note
    state: {
      // sourced
      G: 22, T: 19, B: 95, g: 0.011,
      i_target: 0.0375, i: 0.0375, i_star: 0.035,
      pi_e: 0.03, m1: 0.33,
      // assumed (engine defaults — see audit)
      c1: 0.50, alpha: 0.30,
      // JUDGED anchoring band (§4A) — the ONE per-country regime field
      theta: 0.7,
      // fixed normalisations & regime (IDENTICAL across ALL presets)
      P: 1.0, P_star: 1.0, E_e: 1.0, Ystar: 100,
      m_struct: 0.05, z_struct: 0.10,
      cred: 1.0, phi: 1.5,
      taylor_on: true, deanchor_on: true, speed: 0.5,
      z: 0, z_pulse: 0, period: 0, history: []
    }
  },
  // ... one per country ...
];
```

Wiring: build a second dropdown (or a labelled optgroup in the existing scenario `<select>`) that applies a country preset via the SAME mechanism as `applyScenario` — i.e. `state = Object.assign(clone(initialState), clone(preset.state)); undoStack=[]; syncControls(); render();`. Reuse `applyScenario`'s body; do not write a parallel state-setting path. When a `WEAKLY-CALIBRATED` or `assumed`-heavy preset is selected, show a short note in the existing narrative box: e.g. "Calibration note: MPC and PC slope use model defaults, not <country> data."

**Standing θ caption (required, §4A):** below the country picker, render a permanent short caption: *"Expectations-anchoring (θ) is a rough, banded judgement of central-bank credibility, not a measured statistic."* This must be visible whenever the country picker is — it is not optional and not buried in a tooltip. When a country is active, optionally append its band in words (e.g. "UK: established but tested").

**Do NOT** alter `initialState`, `solve`, `step`, `computeYn`, the sliders, the verifiers' existing invariants, or any drawing code beyond the minimal dropdown wiring.

---

## 7. Grep-prove before editing (mandatory)

**IMPORTANT — the model file is a single-line / minified export.** It was produced by a visual editor (Claude Design) and the entire document sits on effectively one physical line, with HTML escaped and a trailing `__om-edit-overrides` style block. Consequences you MUST account for:
- `grep -n` will report nearly every match as the SAME line number (e.g. "184"). That is expected and does NOT mean the anchor is duplicated. Judge uniqueness by the matched STRING, not the line number — use `grep -o` / count occurrences of the exact substring, not line counts.
- `str_replace` must key off a substring that is unique across the whole blob, not a line. Pick an anchor long and specific enough to occur exactly once (e.g. the full `state = Object.assign(clone(initialState), clone(preset.state));` line, or the `const SCENARIOS = [` opening through its first entry's `id:`).
- Do NOT attempt to reformat, pretty-print, or re-indent the file. Reflowing the blob would produce a massive spurious diff and could corrupt the escaped content. Insert the new `COUNTRY_PRESETS` block and wiring with surgical, minimal substring replacements only.
- If a chosen anchor is NOT unique across the file, STOP and report — do not guess which occurrence to edit.

Before inserting anything, prove the anchors exist VERBATIM and paste the output (count occurrences, don't rely on line numbers):

```
grep -o "const SCENARIOS = \[" <model>.html | wc -l
grep -o "function applyScenario" <model>.html | wc -l
grep -o "buildScenarioDropdown" <model>.html | wc -l
grep -o "id=\"scenario-select\"" <model>.html | wc -l
grep -o "Object.assign(clone(initialState), clone(preset.state))" <model>.html | wc -l
```

Each count should be exactly 1 (or the known expected number). If any anchor is absent (count 0) or unexpectedly non-unique, STOP and report. Do not "find the nearest equivalent."

---

## 8. Acceptance checks (every one needs explicit PASS/FAIL in your report)

**Provenance (human-gated):**
- [ ] `Country_Preset_Audit.md` exists with a complete table for all 19 units.
- [ ] Every non-fixed numeric field has a live source URL OR is marked `ASSUMED`.
- [ ] Every `c1` and `alpha` is either sourced-with-URL or in the preset's `assumed[]` list. No silent defaults.
- [ ] Every `theta` row has status `JUDGED`, ≥1 proxy URL, an assigned band ∈ {0.3,0.5,0.7,0.9}, and a one-sentence rationale (§4A). No `theta` marked `SOURCED`. No off-band decimals.
- [ ] The standing θ caption is wired below the country picker and always visible (§4A UI requirement).
- [ ] Report flags prominently that the θ band assignments need Frank's sign-off (reverses a prior standing decision).
- [ ] Any value hitting an engine clamp (e.g. m1>0.60) is marked `CLAMPED` and flagged.
- [ ] Countries that couldn't be sourced are listed as `FAILED`, NOT fabricated.

**Engine safety (verifier + browser):**
- [ ] `verify_v19` still **52/0**. (You did not touch the engine; prove it.)
- [ ] `verify_onboarding` still **95/0**.
- [ ] HS-1 headless safety check passes after the HTML edit.
- [ ] For EACH preset: loading it then calling `solve(state)` yields Y, i, π, ε all finite and within the chart-drawn ranges (no NaN, no clamp-pinned Y unless intended). Add this as a loop in a NEW verifier `verify_country_presets.mjs` — see §9. Report the per-country PASS/FAIL line.
- [ ] Browser check (MALIN does this, not you — you only assert what you changed): selecting 3 spot-check countries (one advanced, one emerging, one high-inflation e.g. Turkey/Argentina) loads without console error and the curves redraw. You list the 3 you recommend; Malin confirms.

**Scope:**
- [ ] `git --no-pager diff` pasted in full.
- [ ] Diff touches ONLY: the new `COUNTRY_PRESETS` array, the dropdown-wiring lines, the new verifier file, and the two `.md` deliverables. Zero changes to `initialState`/`solve`/`step`/`computeYn`/sliders/existing verifiers.
- [ ] No scratch/debug files created. `git status` clean except intended files.
- [ ] The file was NOT reformatted/pretty-printed. The diff shows only the inserted preset block + wiring as added content, not a whole-file reflow. (The file is a single-line export — a reflow would show as the entire file changing.)

---

## 9. Deliverable 3: `verify_country_presets.mjs` (with a BAD fixture)

A new verifier, in the style of `verify_v19.mjs`, that imports the engine functions and loops every entry in `COUNTRY_PRESETS`:

For each preset, assert:
- `solve(merged_state)` returns finite Y, i, pi, E, eps.
- Y within [30,200] and not pinned to a clamp boundary unless the country is intentionally extreme (log if pinned).
- `i === i_target` (the preset set both equal).
- All §2 "FIXED" fields equal the canonical fixed values — **but NOT `theta`**, which is now per-country (§4A). The fixed set is `cred, phi, taylor_on, deanchor_on, speed, z, z_pulse, P, P_star, E_e, Ystar, m_struct, z_struct`. This is the key invariant: **INV-CP-FIXED** — every country preset shares identical regime defaults *except θ*; only macro fields and θ may differ.
- **INV-CP-THETA** — `theta` ∈ {0.3, 0.5, 0.7, 0.9} exactly (one of the four §4A bands, no other value), and `theta === theta_band`. Catches both an off-band decimal and a drift between the displayed band and the live state.

**BAD fixture (required):** include a test-only malformed preset and assert the checks FAIL on it. Use TWO bad cases: (1) one with a drifted *fixed* field — e.g. `taylor_on: false` — to prove INV-CP-FIXED bites; (2) one with `theta: 0.65` (a plausible-looking off-band value) to prove INV-CP-THETA bites. The second is the important one: it proves the verifier rejects the exact "false precision" failure §4A warns about. State both expected-fail results in your report.

---

## 10. Forbidden (standing rules)
- No `git` state-changing commands (no commit, no `restore`, no `checkout`, no `add`). Malin commits.
- No scratch/debug files.
- No out-of-scope edits — engine, sliders, existing verifiers, CSS, other `.md`s stay untouched.
- No weakening any existing verifier assertion. If a preset trips an existing invariant, that's a real signal — STOP and report it, do not relax the check.
- No filling an unsourceable country with a recalled or averaged number. (θ is the sole exception to "must be sourced" — but it must still be a JUDGED band with a proxy URL and rationale, never a bare guess.)
- No varying ANY regime field other than `theta`. φ, taylor_on, speed, cred, etc. stay fixed across every preset.
- No claiming a check "passes implicitly." Run it, print PASS/FAIL.
- STOP and report on: dirty tree, verifier load failure, missing grep anchor, any country you cannot source.
