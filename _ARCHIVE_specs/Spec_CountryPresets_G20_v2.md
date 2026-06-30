# Spec v2: G20 Country Calibration Presets (REBUILD FROM CLEAN)

**Owner:** Malin · **Implementer:** Antigravity · **Sign-off:** Malin runs verifiers + browser-check, Malin commits.
**Supersedes** the previous country-preset spec and the work in `..._Countries_.html`. That post-edit file is ABANDONED, not patched.
**Status:** DRAFT. Frank has NOT signed off on the credibility-model design (§3) or the per-country numbers. Run §3 past Frank.

---

## 0. Why this is a rebuild, not a revert

A prior pass produced `..._Countries_.html`. Two of its mechanisms are being discarded because they were wrong, and they were threaded too deeply to unpick cleanly:

1. **c0 forced output to potential.** `applyScenario` reverse-engineered `state.c0 = IS_C0 + (Y_n − Y_unclamped)/k_o`, i.e. it solved for whatever autonomous-consumption value makes Y land exactly on Yₙ=100 on load. This is WRONG for this tool: it hides each country's output gap, which is the single most important thing the IS curve teaches. A high-policy-rate country (Mexico ~11%) *should* load showing output below potential — that contractionary stance is the lesson, not a glitch to anchor away. It also forced a downstream bug-patch (`period>0` on the "settled" warning) that only existed because Y was being forced.

2. **θ locked to 1.0 for all countries; band moved into `cred`.** Every country got `theta:1.0` with the judged band shifted to `cred` (0.3 EM-weak … 0.9 advanced). This erases the institutional ceiling. See §3 for why Blanchard's text makes this unfaithful.

Both mechanisms threaded an optional `c0_val` arg through `isOutput`, `isRateForOutput`, `solve`, `step`, `HANDLES`, and draw loops. Rather than un-thread six call sites, we **start from the clean pre-edit engine** and re-add only what's wanted. Net effect: less risk, and the preset data is being rebuilt anyway (every country was WEAKLY-CALIBRATED — unsourced).

**START FILE (clean baseline):** `islm_pc_model_v19_Open_Economy_Complete_Demo_pre_country_edit_.html`
Confirmed clean: intact unique anchors (`const SCENARIOS = [`, `function applyScenario`, `Object.assign(clone(initialState), clone(preset.state))`, `function reset()`, `IS_C0 = 20`), and zero `c0_val`/`COUNTRY_PRESETS`/`currentScenarioId`/`state.c0` contamination.

---

## 1. Country list (FIXED — 19 units)

```
Argentina, Australia, Brazil, Canada, China, France, Germany, India,
Indonesia, Italy, Japan, Mexico, Russia, Saudi Arabia, South Africa,
South Korea, Turkey, United Kingdom, United States
```
(G20 minus EU and African Union — no single national authority maps to the model.)

A country that cannot be sourced to §6 standard is reported `FAILED`, NOT fabricated, NOT filled with a regional average or recalled number.

---

## 2. Parameter mapping — Yₙ=100 INDEX (read before sourcing)

The model is normalised so **Yₙ = 100 = potential output for every country**. Leave `m_struct`/`z_struct` at engine defaults so this holds. Every "level" parameter is a **share of that country's own potential**, NOT absolute currency. This is what keeps the sliders usable for small and large economies alike: a small economy's government is still ~18–22% of *its own* potential, i.e. ~18–22 on the index, comfortably inside the G/T slider range (10–35). Do NOT attempt to put real GDP levels on the index; the share-normalisation is deliberate and the scale concern dissolves under it.

| Engine key | Source | Framing |
|---|---|---|
| `G` | Govt **final consumption** % of GDP | level on Yₙ=100 (21% → 21). NOT total spending; exclude transfers. |
| `T` | **Net** taxes (revenue − transfers) % of GDP | level on Yₙ=100. |
| `i_target` / `i` | Policy rate | decimal; set i = i_target. |
| `i_star` | Foreign/world rate proxy | decimal; state which proxy, same across all. |
| `pi_e` | Expected inflation (CB projection/survey) | decimal; expectations, not latest CPI. |
| `B` | Govt debt % of GDP | level on Yₙ=100; state gross/PSND, same measure across all. |
| `g` | Trend growth | decimal; debt-accounting only. |
| `c1` | MPC | 0–1. See §4. |
| `c0` | **Autonomous consumption, per country** | level. See §2A — this is the deliberate scale lever, NOT a residual. |
| `m1` | Imports % of GDP | 0–1; clamp 0.60 max, flag if exceeded. |
| `alpha` | PC slope | dimensionless. See §4. |
| `theta` | **Anchoring CEILING, per country** | judged band {0.3,0.5,0.7,0.9}. See §3. |

**DERIVED / FIXED — do not set from country data:** `Y_n` (computed), `m_struct:0.05`, `z_struct:0.10`, `P:1.0`, `P_star:1.0`, `E_e:1.0`, `Ystar:100`. **Fixed regime (identical every country):** `cred:1.0`*, `phi:1.5`, `taylor_on:true`, `deanchor_on:true`, `speed:0.5`, `z:0`, `z_pulse:0`, `period:0`, `history:[]`.
\* see §3 — `cred` MAY carry a per-country *initial* value if Frank approves the two-level design; default is 1.0.

---

## 2A. c0 is a real per-country value — NOT a residual

`c0` (autonomous consumption) is added as a real, optional per-country state field, defaulting to `IS_C0` (=20) when absent so all existing teaching behaviour and regression tests are untouched.

**Set c0 from each country's actual consumption/saving structure** (poorer/higher-saving economies → lower c0). Then **let output land where the engine puts it.** If a country's policy rate is above neutral, Y loads below 100 — that is correct and desired; the student then acts as government/central bank to close the gap. This is the whole pedagogical point of the presets: *initialise each economy in its current state, then fix it.*

**FORBIDDEN:** computing c0 by solving for the value that forces Y to 100 (the abandoned `state.c0 = IS_C0 + (Y_n − Y_unclamped)/k_o` approach). c0 must trace to a real consumption/saving figure in the audit, or be left at the `IS_C0` default and marked ASSUMED. No reverse-engineering to a target output.

Engine plumbing required: thread an optional `c0` (default `IS_C0`) through `isOutput`, `isRateForOutput`, and their call sites in `solve`/`step`/`HANDLES`/draw loops — same mechanical change as before, but c0's *value* comes from data, never from a Y-target solve. Because Y is no longer forced to 100, do NOT add the `period>0` patch to the "settled" warning; the warning behaves correctly on its own once output isn't being pinned.

---

## 3. Credibility model — TWO LEVELS, Frank sign-off required

**This reverses the prior pass and must be confirmed by Frank before commit. Cite the evidence below.**

The prior pass locked `theta=1.0` everywhere and put the country band in `cred`. Blanchard's text does not support collapsing the ceiling:

- **Ceiling = institutional credibility a CB *can* reach.** Blanchard Ch. 21 (Fig 21-3) plots average inflation against central-bank-independence across countries and finds independence makes the target more credible → lower inflation. Argentina and Germany differ not just in where credibility sits today but in the institutional ceiling it can reach. That cross-country structural fact is exactly what a per-country `theta` (ceiling) encodes. Locking θ=1.0 throws it away.
- **Current position = where anchoring sits now, and it moves over time.** Blanchard Ch. 8 (Fig 8-4) plots θ rising through the 1970s and falling from the 1990s — the *same* country's anchoring moving. In this tool that is `cred` moving under a fixed ceiling, via the existing `deanchor_on` law of motion. Earning/losing anchoring is SLOW: Ch. 21 states the Fed signalled commitment in the early 1980s but expectations only anchored by the mid-1990s — a 10–15 year process. The tool's `DEANCHOR_REC=0.03`/period is slow and asymmetric (erosion faster), which is directionally faithful; the only caveat is that a "period" is uncalibrated, so this is comparative-static, not literal-timeline.

**Faithful design to implement (pending Frank):**
- `theta` = per-country **ceiling**, judged band {0.3, 0.5, 0.7, 0.9}. This is the institutional/independence story.
- `cred` = **initial current standing**. Default 1.0; OR, if Frank wants countries to start mid-climb, an initial `cred` reflecting current standing, with the country able to earn `cred` up toward — but never above — its `theta` ceiling.
- A user can still pin expectations entirely by switching `deanchor_on` off. Keeping `theta` as the ceiling does not remove that.

`theta` status in the audit is **JUDGED** (never SOURCED — no published θ exists). Source the *proxies*: inflation-expectations anchoring studies (IMF/BIS), length+hit-record of an inflation-targeting regime, a published CB-independence index. One proxy URL + one-line rationale + assigned band per country. Band scheme illustrative starting points: 0.9 long-credible (Germany/France via ECB, Japan, Canada, Australia); 0.7 established-but-tested (UK, US, S. Korea); 0.5 newer/strained (Brazil, Mexico, India, Indonesia, S. Africa, China); 0.3 de-anchoring history (Turkey, Argentina, Russia). Assign from proxies, justify each, no intermediate decimals.

**Open question for Frank (put both, let him choose):**
(a) `cred` starts at 1.0 for all, `theta` ceiling is the only per-country anchoring difference — simplest, ceiling-only story; OR
(b) `cred` starts per-country (current standing) AND `theta` is the per-country ceiling — richer, lets a country be shown mid-climb and earn upward. Note the stance risk: (b) can imply Argentina is "a few good years from solved," which most macroeconomists consider too optimistic; (a) is more conservative. Frank's call.

---

## 4. The c1 / alpha honesty rule (unchanged)

For each country, `c1` and `alpha`: either source a genuine country-specific estimate with URL, OR use the engine default (`c1:0.5`, `alpha:0.3`) and mark `ASSUMED` in the audit + list in the preset's `assumed[]`. Never present a default as a country estimate. >4 of ~11 numeric fields on defaults ⇒ flag the country `WEAKLY-CALIBRATED`. (The prior pass had ALL 19 weakly-calibrated — that is the bar to clear this time, with real sourcing.)

---

## 5. Audit document FIRST (Phase 1 gate)

Build `Country_Preset_Audit.md` before any code. Per country, a table: `engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status` with status ∈ {SOURCED, ASSUMED, JUDGED, CLAMPED, CONFLICT}. `theta` rows always JUDGED with proxy URL; `c0` rows SOURCED (real consumption figure) or ASSUMED (default). Per-country verdict: CALIBRATED / WEAKLY-CALIBRATED / FAILED. **Malin reviews before code; θ bands and the §3 model choice go to Frank.**

---

## 6. Sourcing standard (unchanged)

Every non-fixed numeric value needs: value, raw source figure, live fetchable URL (CB / national stats office / IMF / OECD / World Bank — not a sole aggregator, not recall), vintage date, transformation. One URL minimum per number. Unsourceable country → FAILED. No silent rounding to nice numbers. Use the web-fetch tool; a preset built from memory is a FAIL even if the numbers are right.

---

## 7. Preset objects + wiring

```javascript
const COUNTRY_PRESETS = [
  {
    id: 'GB', label: 'United Kingdom',
    calibration: 'CALIBRATED',           // earn this; not WEAKLY by default
    assumed: ['alpha'],                  // keys on engine default
    theta_band: 0.7,                     // ceiling, mirrors state.theta
    state: {
      G: 22, T: 19, B: 95, g: 0.011,
      i_target: 0.0375, i: 0.0375, i_star: 0.035,
      pi_e: 0.03, m1: 0.33,
      c1: 0.50,                          // sourced or ASSUMED per audit
      c0: 18,                            // REAL per-country autonomous consumption (audit), NOT a residual
      alpha: 0.30,                       // ASSUMED default → in assumed[]
      theta: 0.7,                        // per-country CEILING (judged band)
      cred: 1.0,                         // 1.0, or per-country initial if Frank picks (b)
      // fixed normalisations & regime (identical across ALL presets)
      P: 1.0, P_star: 1.0, E_e: 1.0, Ystar: 100,
      m_struct: 0.05, z_struct: 0.10,
      phi: 1.5, taylor_on: true, deanchor_on: true, speed: 0.5,
      z: 0, z_pulse: 0, period: 0, history: []
    }
  },
  // ... 19 total ...
];
```

Wiring: a country picker that applies a preset via the SAME path as `applyScenario` — `state = Object.assign(clone(initialState), clone(preset.state)); undoStack=[]; syncControls(); render();` — with NO reverse-engineering step inserted. Reuse `applyScenario`'s body; do not fork a parallel state-setter. Standing caption under the picker (always visible): *"Each country loads in its current state — output may sit above or below potential given its policy stance; act as government and central bank to close the gap. Anchoring (θ) is a rough, banded judgement of central-bank credibility, not a measured statistic."*

The two clean keepers from the prior pass MAY be re-added (they were in-scope and sensible): context-aware `↺ Reset` (re-loads the active country/scenario at period 0, preserves `speed`) via a `currentScenarioId` tracker; and a `-- Reset to Default --` dropdown option that wipes to `initialState`. Keep these minimal and self-contained.

Do NOT alter `solve`, `step`, `computeYn`, sliders, existing verifiers, or draw code beyond the c0 threading (§2A) and the picker/caption/reset wiring.

---

## 8. Verifier: `verify_country_presets.mjs` (with BAD fixtures)

Loop every `COUNTRY_PRESETS` entry. Assert:
- `solve(state)` returns finite Y, i, π, E, eps; Y in [30,200]. **Y is NOT required to equal 100** — a loaded country may sit off potential; that is correct (assert only finiteness + range, and log the gap).
- `i === i_target`.
- **INV-CP-FIXED** — every preset shares identical fixed regime fields (`phi, taylor_on, deanchor_on, speed, z, z_pulse, P, P_star, E_e, Ystar, m_struct, z_struct`). `theta` is NOT in this set (per-country).
- **INV-CP-THETA** — `theta` ∈ {0.3,0.5,0.7,0.9} exactly, and `theta === theta_band`.
- **INV-CP-C0** — `c0` is present and finite; assert it was NOT computed to force Y=100 by checking that `solve(state).Y` is generally ≠ 100 for at least the high-rate countries (a preset whose Y is pinned to exactly 100 across the board is the failure signature).

**BAD fixtures (required), assert each FAILS:** (1) a preset with `taylor_on:false` (trips INV-CP-FIXED); (2) `theta:0.65` (trips INV-CP-THETA — proves off-band rejection); (3) a preset whose `c0` was set by the forbidden Y=100 solve so its Y pins to 100 (trips INV-CP-C0). State all three expected-fails in the report.

---

## 9. Phases & acceptance (same discipline as before)

**Phase 1 — audit only, then STOP** for Malin review + Frank on §3.
**Phase 2 — implement** on the clean pre-edit file: c0 threading (real values), COUNTRY_PRESETS, picker+caption+reset wiring, verifier with BAD fixtures.
**Phase 3 — verify & report:** `verify_v19` unchanged count, `verify_onboarding` 95/0, HS-1, `verify_country_presets` per-country + 3 BAD fixtures failing as expected; full `git --no-pager diff`; `git status` clean; name 3 spot-check countries (advanced/EM/high-inflation).

Explicit PASS/FAIL on every check. STOP-and-report on: dirty tree, verifier load failure, missing/non-unique anchor, unsourceable country, any existing invariant tripped.

## 10. Forbidden
- No git state-changing commands. Malin commits.
- No scratch/debug files. No out-of-scope edits (engine/sliders/existing verifiers/CSS untouched beyond §2A + wiring).
- No reverse-engineering c0 to a target output.
- No locking theta=1.0 across countries (reverses the faithful design).
- No weakening any existing verifier assertion — flag engine bugs, don't relax checks.
- No filling an unsourceable country with recalled/averaged numbers.
- No "passes implicitly" — run it, print PASS/FAIL.
