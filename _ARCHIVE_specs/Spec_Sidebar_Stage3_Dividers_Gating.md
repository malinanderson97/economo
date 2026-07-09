# Spec: Sidebar Stage 3 — PC sub-dividers, credibility drill-downs, AND unlock-gating fix for moved controls

## 1. Goal (one sentence)
Finish the sidebar restructure: add faint dividers inside the PC section, hide credibility explanatory text behind collapsed-by-default drill-downs, AND fix the unlock-greying so the Taylor toggle, de-anchor toggle, and temp supply shock button (moved out of their old containers in Stage 2) grey out with their block's unlock progression again — plus replace the weak Stage-2 INV-1E verifier check with a real headless one.

## 2. Which model(s) and which function(s)
`islm_pc_model_v19_Open_Economy_Complete_Demo.html` and `verify_onboarding.mjs`. Touch points:
- The gating region (~2119–2138): the `setLocked(...)` block inside the unlock/render function.
- The two dead lines `setLocked('#sec-dynamics .side-body', pcOn)` and `setLocked('#sec-shocks .side-body', pcOn)` — now target hidden empty shells.
- `applyGraphGrouping()` (~963): add dividers/cluster structure to the PC body; the credibility drill-down containers.
- The `hint-dynamics` content (~374–385): repackaged into drill-downs.
- `verify_onboarding.mjs`: replace the provisional INV-1E (string-grep + hollow BAD-fixture) with a real one.
NO engine math changes.

## 3. Background — why the gating fix is needed (regression from Stage 2)
Stage 2 moved `taylor-toggle`, `deanchor-toggle`, `oil-shock-btn`, `shock-indicator` out of `#sec-dynamics`/`#sec-shocks` into the new `body-graph-*` sections, and hid the old sections. But those controls were gated **by their old container**: `setLocked('#sec-dynamics .side-body', pcOn)` and `setLocked('#sec-shocks .side-body', pcOn)`. Those two selectors now match hidden empty shells, so the three controls are **ungated** — they show active regardless of unlock stage. The param-driven sliders are unaffected (they carry `data-block`, and `setLocked('.control[data-block="X"]', …)` selects by attribute which travels with the moved element). Only the three hardcoded non-`data-block` controls fell out of gating. This spec re-gates them via the SAME `.locked` mechanism.

`setLocked(selector, condition)` = `querySelectorAll(selector)` then add/remove `.locked` (greys + disables, control stays visible — the "see what's coming" style). It accepts any selector, so we can gate by id.

## 4. What must NOT change
- No engine math. `verify_v19.mjs` stays 52/0.
- The `.locked` greying style is the house pattern — reuse it, do not invent a hide-entirely or a new disabled style. Locked = greyed + visible, consistent with the sliders.
- Control ids and handlers unchanged (`oil-shock-btn`, `applyOilShock`, `taylor-toggle`/`toggleTaylor`, `deanchor-toggle`/`toggleDeanchor`).
- Credibility explanatory wording preserved verbatim (only visibility/container changes).
- Stage 2's grouping logic (section order, GOODS→ISLM remap) unchanged.

## 5. The edits

### 5a. Re-gate the three moved controls (the regression fix)
In the gating region (~2130–2137), the block-unlock booleans `islmOn` and `pcOn` already exist. Add explicit id-based gating for the moved controls, and DELETE the two dead container lines.
- DELETE: `setLocked('#sec-dynamics .side-body', pcOn);`
- DELETE: `setLocked('#sec-shocks .side-body', pcOn);`
- ADD (near the other `pcOn`/`islmOn` calls):
  - `setLocked('#taylor-toggle', islmOn);`   ← Taylor rule sets the rate → gates with IS-LM
  - `setLocked('#deanchor-toggle', pcOn);`   ← credibility dynamics → gates with PC
  - `setLocked('#oil-shock-btn', pcOn);`     ← supply shock hits PC block
  - `setLocked('#shock-indicator', pcOn);`
(Grep-confirm `islmOn` and `pcOn` are in scope at the insertion point — they are defined a few lines above. Report the exact surrounding lines you inserted into.)

Note: `.locked` on a `.toggle-row` / `.shock-btn` must actually visually grey + disable interaction. Confirm the `.locked` CSS (line ~261) covers pointer-events/opacity for these element types; if `.locked` only styles `.control`, extend the CSS selector to also cover `.toggle-row.locked` and `.shock-btn.locked` (greyed, `pointer-events: none`). Report which case applied.

### 5b. PC section internal dividers
Within `body-graph-PC`, group the controls into three clusters separated by faint dividers (thin `border-top` in a muted tone, or a small muted sub-label — match existing `.side-*` styling; presentation only). Order:
1. **Phillips curve / expectations** — `pi_e`, `theta`, `speed-wrap`.
2. **Credibility** — `cred`, `deanchor-toggle`, + drill-downs (5c).
3. **Temp supply shock** — `oil-shock-btn`, `shock-indicator`.
Controls keep ids/handlers/`data-block`. The dividers must not break the gating selectors from 5a.

### 5c. Credibility drill-downs (collapsed by default)
Repackage the `hint-dynamics` prose (~374–385) using the existing `toggleDrill`/`drill-trigger`/`drill-box` collapsible pattern (grep to match it exactly):
- Credibility explanation (θ×credibility, de-anchoring paragraphs) → a collapsed "▸ How credibility works" drill in the credibility cluster.
- Taylor-principle / stability notes → a collapsed "▸ Policy rule & stability" drill in the IS-LM section next to φ / taylor-toggle.
- Default collapsed. Wording verbatim. If splitting the text, split on existing sentence boundaries; do not rewrite.

## 6. The invariant(s) that must hold afterward  ← the whole point

### 6a. Replace the provisional INV-1E with a REAL headless check
The Stage-2 INV-1E is currently three `htmlSrc.includes(...)` string-greps plus a hollow BAD-fixture (`const badHasToggle = true`). Replace BOTH:
- **Real check:** call `testRender.applyGraphGrouping()` headlessly, then assert the section bodies contain the expected controls — e.g. the IS-LM body (`body-graph-ISLM`) contains the goods controls (G/T/c1) AND φ AND `taylor-toggle`; the PC body contains `theta`/`cred`/`pi_e`, `deanchor-toggle`, `oil-shock-btn`; UIP body contains m1/Ystar. (Use the mock DOM's parent/child tracking already used by other render checks — grep how `specialEls` / `getSvgTexts` / childrens are inspected elsewhere and match that.)
- **Real BAD-fixture (must mutate real code, not a literal):** e.g. take `scripts`, regex-break the GOODS→ISLM remap (`if (b === 'GOODS') b = 'ISLM'` → `if (false) b = 'ISLM'`), build a second `Function` from the mutated source, run its `applyGraphGrouping()`, and assert the check now FAILS (GOODS controls land in a `body-graph-GOODS` that doesn't exist / are missing from IS-LM). This proves the check can go red. NO hardcoded booleans.

### 6b. New gating check
Add a headless assertion for 5a: at a stage where PC is locked (e.g. `applyBlocks(['ISLM'])` or `goToStage` to an ISLM/UIP stage), after running the render/gating path, assert `deanchor-toggle`, `oil-shock-btn`, `shock-indicator` carry `.locked`, and `taylor-toggle` is `.locked` only when ISLM is locked / unlocked appropriately. At the Full stage assert they are NOT `.locked`. Add a mutating BAD-fixture (e.g. remove the new `setLocked('#oil-shock-btn', pcOn)` from a mutated source and confirm the check catches the shock button ungated).
(If the mock DOM can't resolve id-based `querySelectorAll('#id')`, note it and use the closest inspectable equivalent — but prefer a real gating assertion over a string-grep.)

### 6c. Browser-check (this stage is heavily eyeball-gated — verifier-green ≠ done)
Open the file and confirm at load:
- PC section shows three clusters with faint dividers, in order (Phillips/expectations, credibility, temp supply shock).
- Credibility drill-downs collapsed by default; expand/collapse works.
- **Gating progression (the key check):** step through the stages. At the closed IS-LM stage and the open UIP stage (PC locked): the de-anchor toggle and temp supply shock button are greyed/disabled. The Taylor toggle greys/ungreys with the IS-LM unlock. Sliders grey per their block as before. At the Full stage: all active.
- Clicking a greyed control does nothing; clicking an active one still fires its handler.
- Nothing clips at standard viewport.

## 7. Done criteria
- [ ] `node verify_v19.mjs` → 52/0.
- [ ] `node verify_onboarding.mjs` → green; INV-1E now a real headless grouping check with a mutating BAD-fixture; new gating check (6b) present with its own mutating BAD-fixture (state new total).
- [ ] `node mutation_check.mjs` passes.
- [ ] No hollow/literal fixtures remain in the onboarding verifier for these checks (grep the diff: no `const bad... = true` style literal asserts).
- [ ] Browser-check list §6c confirmed by human — especially the gating progression.
- [ ] `git --no-pager diff` pasted; only engine HTML + `verify_onboarding.mjs`; no engine-math lines.
- [ ] Report: which `.locked` CSS case applied (5a), and the exact lines the new `setLocked` calls were inserted into.
- [ ] Committed by the human: suggested `ui: PC sub-dividers + credibility drill-downs; re-gate moved Taylor/deanchor/shock controls to unlock progression; real INV-1E + gating verifier checks`.

## 8. Notes / decisions settled
- Gating targets: Taylor→ISLM, de-anchor/shock→PC. Consistent with where the controls were placed and with the block each concept belongs to. UX/classification call, Malin's.
- `.locked` (grey + visible) reused, not hide-on-lock — matches existing slider behaviour so the sidebar reads consistently.
