# Spec: Sidebar restructure — graph-only grouping, ISLM→UIP→PC, Taylor in IS-LM, PC sub-dividers, credibility drill-downs, shock rename

## 1. Goal (one sentence)
Make the sidebar load permanently grouped **by graph** (no Function/Graph toggle), in the order **IS-LM → UIP → PC**, with the Taylor rule controls living in the IS-LM section, the PC section internally divided by faint dividers, credibility explanatory text hidden behind drill-downs by default, and the "oil shock" button renamed to "Temp supply shock" and placed appropriately.

## 2. Which model(s) and which function(s)
`islm_pc_model_v19_Open_Economy_Complete_Demo.html` ONLY. Touch points:
- `paramDefs` (line ~648): `phi` block reassignment.
- The sidebar HTML region (~340–400): remove the group toggle; retire the three Function-mode sections' role; rename shock button.
- `toggleSidebarGroup()` / `sidebarGroupByGraph` (lines ~963–1050): convert from click-toggle to load-time grouping; remove the Function-mode restore branch; add PC sub-dividers; redirect Taylor/de-anchor move targets; add credibility drill-downs.
- `verify_onboarding.mjs`: update the `phi` block assertion; retire/replace INV-1E (the toggle round-trip check).

NO engine math changes: `solve()`, `step()`, `computeYn`, all constants untouched. This is UI structure only.

## 3. The economics (anchor to the textbook) — classification rationale
- **φ (Taylor response) moves from PC → ISLM.** The Taylor rule is the monetary-policy reaction function: it sets the nominal rate `i` (the MP/LM side), reading inflation to do so. It is a rate-setting object, so under graph-grouping it belongs on the IS-LM chart's section, not the Phillips-curve section. This is more economically honest than its current PC placement (which was a layout compromise). Blanchard: PC gives inflation from the gap; the policy rule is the CB's *response*, setting `i`.
- **`pi_e` (expected inflation) stays PC** — it is intrinsic to the Phillips relation π = πᵉ + …
- **The PC section's internal clusters** reflect the real conceptual layering: (a) Phillips-curve / expectations, (b) credibility, (c) the temp supply shock. Note the structural *supply-side* terms that set Yₙ (markup, structural z) are NOT exposed as sidebar sliders in this model, so there is no populated "supply side" cluster — do not invent one. The temp supply shock is a transitory disturbance (`z_pulse`), distinct from the structural terms; it is the shock, not a Yₙ-setting control.
- **"Temp supply shock"** is the chosen label for the former "oil shock" (`applyOilShock` / `z_pulse`). It is a transitory supply/cost-push disturbance that decays — Blanchard's canonical example is an oil price shock, but the general term is a (temporary) supply shock. Keep the engine function name `applyOilShock` and id `oil-shock-btn` UNCHANGED (renaming those risks breaking handlers/verifier); change only the visible button text and section placement.

## 4. What must NOT change
- No engine math. `solve`/`step`/`computeYn`/constants untouched.
- The `applyOilShock` function name, the `oil-shock-btn` element id, the `z_pulse` mechanics — unchanged (only the button's visible text changes).
- All control `data-block` attributes stay driven by `paramDef.block`; the ONLY block reassignment is `phi` PC→ISLM.
- `verify_v19.mjs` stays 52/0.
- The Yₙ-gate just added (drawISMP PC-gate) — untouched.
- Credibility *content* (the existing hint text lines ~374–385) is repackaged/relocated into drill-downs, not rewritten. Preserve the wording.

## 5. The edits

### 5a. Reassign φ to ISLM (paramDefs ~648)
- OLD: `{ key: 'phi',      block: 'PC', label: 'Taylor response, φ',   min: 0, max: 3, step: 0.1,  fmt: v => v.toFixed(1) }`
- NEW: `{ key: 'phi',      block: 'ISLM', label: 'Taylor response, φ',   min: 0, max: 3, step: 0.1,  fmt: v => v.toFixed(1) }`

### 5b. Remove the group toggle UI (~340)
Delete the `sidebar-group-toggle` div entirely (the `<div id="sidebar-group-toggle" … onclick="toggleSidebarGroup()">Group by: …</div>`). Grouping is now permanent, so the control is dead.

### 5c. Rename the shock button text (~397)
- OLD button text: `⚡ Apply oil shock (+5%)`
- NEW button text: `⚡ Apply temp supply shock (+5%)`
(Element id `oil-shock-btn` and `onclick="applyOilShock()"` UNCHANGED.)

### 5d. Convert grouping to load-time, graph-only (the core change, ~963–1050)
Replace the toggle mechanism with a single `applyGraphGrouping()` that runs once on load (call it from the existing init/first-render path, wherever `renderTutorial()` is first invoked — grep for the init call site and report it). Requirements:
- `sidebarGroupByGraph` state var and the whole Function-mode `else` restore branch are REMOVED (dead once there is no toggle). The three Function sections (`sec-policy`, `sec-dynamics`, `sec-shocks`) are hidden permanently (or their controls are relocated and the empty shells hidden).
- **Section order must be IS-LM → UIP → PC.** The current code builds `['GOODS','ISLM','PC','UIP']`. New behaviour: three sections in the order **ISLM, UIP, PC**, where the ISLM section holds BOTH the goods controls (G, T, c₁ — `data-block="GOODS"`) and the policy/rate controls (`data-block="ISLM"`, which now includes φ), under one **"IS-LM"** header. So GOODS folds into IS-LM; there is no standalone GOODS section.
  - Implementation: build sections keyed by the three headers; when distributing `.control[data-block]`, map both `GOODS` and `ISLM` controls into the IS-LM body. UIP → UIP body. PC → PC body.
- **Taylor + de-anchor toggles** (`taylor-toggle`, `deanchor-toggle`): the existing code `move()`s these to `pcBody`. Redirect `taylor-toggle` to the **IS-LM body** (it is a policy-rate control). Keep `deanchor-toggle` with credibility in the **PC body** (de-anchoring is a credibility-dynamics control). `speed-wrap` (price flex) stays in PC. The shock button + indicator go in the PC body's shock cluster (see 5e).

### 5e. PC section internal dividers (faint)
Within the single PC body, insert faint visual dividers (a thin `border-top` rule or a small muted sub-label — match existing `.side-*` styling, do not invent a heavy new component) separating three clusters, in this order:
1. **Phillips curve / expectations** — `pi_e` (πᵉ), `theta` (θ ceiling), `speed-wrap` (price flex).
2. **Credibility** — `cred` (current credibility) + `deanchor-toggle`, with the explanatory text behind drill-downs (5f).
3. **Temp supply shock** — the renamed `oil-shock-btn` + `shock-indicator`.
The dividers are presentation only; controls keep their ids and handlers.

### 5f. Credibility info hidden by default, drill-down disclosures
The existing `hint-dynamics` block (~374–385) carries the θ/credibility/de-anchor/Taylor explanation as always-visible prose. Repackage it so it is **collapsed by default**:
- Reuse the existing collapsible pattern (`toggleSection` / `toggleDrill` — grep to confirm the house mechanism and match it; do NOT invent a new toggle system).
- Split the content sensibly: the θ×credibility explanation and the de-anchoring explanation become one or two small "▸ How credibility works" disclosures in the credibility cluster; the Taylor-principle / stability notes move to a "▸ Policy rule & stability" disclosure in the IS-LM section next to φ and the Taylor toggle.
- Default state: collapsed. Preserve the wording verbatim; only the container/visibility changes.

## 6. The invariant(s) that must hold afterward  ← the whole point
Update `verify_onboarding.mjs`:
- **Change the φ mapping assertion.** The existing check `Mapping: theta, cred, phi ∈ PC` must become `theta, cred ∈ PC` AND a new/updated assertion `phi ∈ ISLM`. (This is a deliberate reclassification, not weakening — φ genuinely moved blocks. Do NOT just delete the coverage; re-point it.)
- **Retire/replace INV-1E** ("Sidebar grouping toggle round-trips"). The toggle no longer exists, so the round-trip check is obsolete. Replace it with a check that graph-grouping is applied on load: after init, the sidebar shows the three graph sections (IS-LM, UIP, PC) and the `sidebar-group-toggle` element is absent. Add a BAD-fixture proving the new check can go red.
- All existing block-mapping checks for GOODS/UIP/PC that don't involve φ must still pass unchanged.

**Browser-check (verifier-green ≠ done for layout):** open the file and confirm, at load with no interaction:
- Sidebar is grouped by graph, three sections in order IS-LM → UIP → PC, no group toggle visible.
- IS-LM section contains G, T, c₁, the rate/MP controls, φ (Taylor response), and the Taylor-rule toggle.
- PC section shows the three clusters with faint dividers in order (Phillips/expectations, credibility, temp supply shock).
- Credibility explanatory text is collapsed by default; disclosures expand/collapse correctly.
- Shock button reads "temp supply shock"; clicking it still fires `applyOilShock` (pulse indicator updates).
- Nothing overflows/clips at the standard viewport; unlock-gating still hides locked-block controls correctly (a locked PC still hides PC controls, etc.).

## 7. Done criteria
- [ ] `node verify_v19.mjs` → 52/0 (unchanged).
- [ ] `node verify_onboarding.mjs` → passes with updated φ∈ISLM assertion and replaced INV-1E (state new total).
- [ ] `node mutation_check.mjs` passes.
- [ ] Browser-check list in §6 all confirmed by the human.
- [ ] `git --no-pager diff` pasted; only the engine HTML and `verify_onboarding.mjs` changed; no engine-math lines in the diff (no `solve`/`step`/constants).
- [ ] φ reassignment is the ONLY `data-block`/`paramDef.block` change; `applyOilShock` name and `oil-shock-btn` id unchanged; credibility wording preserved.
- [ ] Report the init call site where `applyGraphGrouping()` is now invoked.
- [ ] Committed by the human: suggested `ui: graph-only sidebar (ISLM→UIP→PC), Taylor in ISLM, PC sub-dividers, credibility drill-downs, rename oil→temp supply shock`.

## 8. Notes / decisions settled (not routed to Frank)
- Graph-only grouping, toggle removed: UX decision, Malin's call.
- Taylor/φ classified to the MP/IS-LM side: economically more correct than prior PC placement; not a Blanchard-fidelity departure (it's a presentation grouping, engine unchanged).
- No populated "supply side" cluster because those structural controls aren't exposed in this model's UI — consistent with current scope (structural Yₙ inputs deferred to Model 2).
