# Spec: Remove IS, MP, and UIP derivations (drill-downs); keep the PC derivation

## 1. Goal (one sentence)
Fully remove the "derivation ▸" drill-downs from the IS, LM/MP, and UIP legend rows — trigger spans, containers, drawing functions, dispatch, and redraw entries — leaving the PC derivation (`drill-pc` / `drawDrillPCChain`) completely intact, so the IS/MP/UIP legend rows show only their equation text with no derivation link.

## 2. Which model / functions
`islm_pc_model_v19_Open_Economy_Complete_Demo.html` + `verify_onboarding.mjs`. NO engine math (`solve`/`step`/constants), NO `SCENARIOS`, NO changes to the just-committed reset/preset work. PC-drill code is OFF-LIMITS (must survive unchanged).

## 3. What STAYS (must not be touched)
- `drill-pc` container (~466) and its three columns `drill-pc-wsps`/`drill-pc-okun`/`drill-pc-phillips`
- `svg-drill-pc-a`, `svg-drill-pc-b`, `svg-drill-pc-c`
- `drawDrillPCChain()` (~1499)
- the PC dispatch case `if (id === 'drill-pc') { drawDrillPCChain(); }` (~1433-1435)
- the PC `redrawOpenDrills` entry (~2033) and the PC legend trigger (~463)
- The `toggleDrill` function itself (only the is/mp *cases inside it* are removed)

## 4. What must NOT change
- No engine math; `verify_v19` stays 55/0.
- The legend equation text + swatches for IS/LM/UIP rows stay — ONLY the `<span class="drill-trigger" …>derivation ▸</span>` inside each is removed, not the equation.
- `.locked` gating of the UIP chart stays working — only the `#drill-uip` token is dropped from its `setLocked` selector.
- Do not weaken any surviving PC-drill verifier check.

## 5. The edits (engine — Stage 1)

### 5a. Remove the IS trigger span (line ~414)
Delete only the trailing drill-trigger span, keep the swatch + equation:
- OLD: `<span><span class="legend-swatch" style="background:#d85a30"></span>IS: Y = f(G,T,r,ε) <span class="drill-trigger" data-block="ISLM" onclick="toggleDrill('drill-is')">derivation ▸</span></span>`
- NEW: `<span><span class="legend-swatch" style="background:#d85a30"></span>IS: Y = f(G,T,r,ε)</span>`

### 5b. Remove the MP trigger span (line ~415)
- OLD: `<span><span class="legend-swatch" style="background:#185fa5"></span>LM: i (nominal) <span class="drill-trigger" data-block="ISLM" onclick="toggleDrill('drill-mp')">derivation ▸</span></span>`
- NEW: `<span><span class="legend-swatch" style="background:#185fa5"></span>LM: i (nominal)</span>`

### 5c. Remove the UIP trigger span (line ~445)
- OLD: `<span><span class="legend-swatch" style="background:#0f6e56"></span>UIP: E = Eᵉ(1+i)/(1+i*) <span class="drill-trigger" data-block="UIP" onclick="toggleDrill('drill-uip')">derivation ▸</span></span>`
- NEW: `<span><span class="legend-swatch" style="background:#0f6e56"></span>UIP: E = Eᵉ(1+i)/(1+i*)</span>`

### 5d. Delete the three containers
- Delete the entire `<div class="drill-container" id="drill-is"> … </div>` block (~419-427).
- Delete the entire `<div class="drill-container" id="drill-mp"> … </div>` block (~428-436).
- Delete the entire `<div class="drill-container" id="drill-uip"> … </div>` block (~449-451, the text-only one: `1 + i = (1 + i*)(E/Eᵉ)` + ref).

### 5e. Delete the drawing functions
- Delete `drawDrillIS()` in full (~1442-1472).
- Delete `drawDrillMP()` in full (~1474-1497).
- Leave `drawDrillPCChain()` untouched.

### 5f. Remove the dispatch cases (~1431-1432)
- OLD:
```
    if (id === 'drill-is') drawDrillIS();
    if (id === 'drill-mp') drawDrillMP();
    if (id === 'drill-pc') {
```
- NEW:
```
    if (id === 'drill-pc') {
```
(Leaves the PC case intact.)

### 5g. Remove the redrawOpenDrills entries (~2031-2032)
- Delete the two lines:
```
  if (document.getElementById('drill-is')?.classList.contains('open'))  drawDrillIS();
  if (document.getElementById('drill-mp')?.classList.contains('open'))  drawDrillMP();
```
- Leave the `drill-pc` line (~2033) intact.

### 5h. Drop #drill-uip from the setLocked selector (~2128)
- OLD: `setLocked('#chart-box-uip, .curve-uip, .label-uip, .handle[data-handle="uip"], #drill-uip', uipActive);`
- NEW: `setLocked('#chart-box-uip, .curve-uip, .label-uip, .handle[data-handle="uip"]', uipActive);`

**After 5a–5h:** grep the file for `drill-is`, `drill-mp`, `drill-uip`, `drawDrillIS`, `drawDrillMP`, `svg-drill-is`, `svg-drill-mp` — ALL must return nothing. Grep for `drill-pc`, `drawDrillPCChain`, `svg-drill-pc` — ALL must still be present and unchanged. This is the completeness + safety check.

## 6. Verifier reconciliation (Stage 2)
List every check in `verify_onboarding.mjs` touching `drill-is`/`drill-mp`/`drill-uip`/`drawDrillIS`/`drawDrillMP`, and separately every check touching `drill-pc`/`drawDrillPCChain`. Then:
- **Retire** checks that specifically test the removed IS/MP/UIP drills (they test a removed feature — legitimate retirement, like the debt checks). Name each and why.
- **Narrow** generic drill checks (e.g. live-redraw of open drills `INV-3b-1/2`, `INV-S3-C` "drill triggers carry data-block", read-only checks) so they cover ONLY the PC drill — do not delete PC coverage, do not hollow them out.
- **Do NOT touch** `INV-1A` (three PC drill graphs) or any PC-specific check.
- Update any harness `return {...}` export of `drawDrillIS`/`drawDrillMP`/`redrawOpenDrills` that now points at deleted functions, so the harness does not throw `ReferenceError`. (If `redrawOpenDrills` is kept — it still handles PC — its export stays; just ensure its body no longer calls the deleted functions, done in 5g.)
- Report each retire-vs-narrow decision with one-line reasoning.

## 7. Invariant / safety
- After all edits: `grep` proves IS/MP/UIP drill tokens gone, PC drill tokens present (§5 completeness check) — paste both grep results.
- No BAD-fixture needed for a pure removal, but the SURVIVING PC-drill checks (INV-1A etc.) passing is the proof that PC drilling still works.

## 8. Browser-check (the real gate)
Open the file:
- IS, LM, and UIP legend rows show their equation text with NO "derivation ▸" link.
- The PC legend row STILL has its "derivation ▸" link, and clicking it still opens the three-column PC derivation (WS-PS / Okun / Phillips) drawing correctly.
- No leftover empty space / broken layout where the removed drills were.
- No console errors when toggling the PC drill or interacting with the IS/MP/UIP charts.

## 9. Done criteria
- [ ] verify_v19 55/0; verify_onboarding green (new total after retire/narrow) — state it.
- [ ] mutation_check passes.
- [ ] No `DOM Stub Run Failed`/Error/ReferenceError anywhere in verifier output (paste full, top to bottom).
- [ ] grep: IS/MP/UIP drill tokens gone; PC drill tokens present (both pasted).
- [ ] IS/MP/UIP legend equations intact (only triggers removed); PC derivation fully working in browser.
- [ ] `git --no-pager diff` — engine HTML + verify_onboarding only; no engine-math, no SCENARIOS, no PC-drill changes.
- [ ] Report each verifier check retired vs narrowed, with reasoning.
- [ ] Browser-check §8 confirmed by human.
- [ ] Committed by human: suggested `ui: remove IS/MP/UIP derivations (keep PC derivation); verifier reconciled`.

## 10. Notes / decision
- Full removal (trigger + container + graph + JS), not just hiding — IS/MP/UIP legend rows keep equation text only.
- PC derivation retained deliberately (the WS-PS→Okun→Phillips chain is the one worth teaching in-depth; the IS/MP/UIP derivations were lower-value). Malin's call; presentation/pedagogy, no engine impact, no Frank needed.
