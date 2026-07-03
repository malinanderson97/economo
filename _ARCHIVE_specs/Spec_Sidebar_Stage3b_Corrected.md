# Spec: Stage 3b (corrected) — PC section, four captioned clusters, credibility drill-downs

## 0. Why this supersedes the earlier Stage 3b
The first 3b attempt used an incomplete PC control set and let the agent guess placement. The PC block actually has EIGHT controls. This spec lists all eight with a verified id map and a fixed cluster assignment, and the verifier asserts each control lands in its NAMED cluster (not merely "somewhere in the PC body"). Restore to committed Stage A before starting (verify_v19 55/0).

## 1. Goal (one sentence)
Restructure the PC sidebar section (`body-graph-PC`) into four clusters, each introduced by a captioned heading over a faint divider, with every PC control placed in its assigned cluster, and the credibility explanatory text hidden behind a collapsed drill-down.

## 2. Which model(s) / function(s)
`islm_pc_model_v19_Open_Economy_Complete_Demo.html` — `applyGraphGrouping()` (~990) PC-body build; the `hint-dynamics` prose (~370–388) repackaged into drill-downs. `verify_onboarding.mjs` — INV-1E extended to per-cluster placement. NO engine math; NO changes to `step`/`solve`; the Stage-A Taylor guard and all gating stay exactly as committed.

## 3. Verified control-id map (grep-confirmed — do NOT guess)
Every control's range input is `id="ctl-<key>"`; its full row is that input's `.closest('.control')` wrapper; value box `id="val-<key>"`. The eight PC-block controls (from `paramDefs`, all `block:'PC'`):
| key | label | wrapper via |
|-----|-------|-------------|
| `pi_e` | Expected inflation, πᵉ | `ctl-pi_e` → `.control` |
| `alpha` | PC slope, α | `ctl-alpha` → `.control` |
| `m_struct` | Markup, m | `ctl-m_struct` → `.control` |
| `z_struct` | Wage push, z | `ctl-z_struct` → `.control` |
| `z` | Cost-push (PC shift), z | `ctl-z` → `.control` |
| `theta` | Max anchoring (ceiling), θ | `ctl-theta` → `.control` |
| `cred` | Current credibility | `ctl-cred` → `.control` |
| `phi` | Taylor response, φ | `ctl-phi` → `.control` (lives in IS-LM section, NOT PC — do not move to PC) |
Non-param controls: `speed-wrap` (price flex, has its own id), `deanchor-toggle`, `oil-shock-btn`, `shock-indicator` (all by id).
`moveWrap(key, body)` must resolve `document.getElementById('ctl-'+key)?.closest('.control')` (or the direct id for non-param controls) and append to `body`. If a lookup returns null, that is a FAIL to report, not a silent skip.

## 4. The four clusters (fixed placement — every control assigned)
In `body-graph-PC`, in THIS order, each preceded by a captioned heading + faint divider:
1. **Phillips curve** — `pi_e`, `alpha`, `speed-wrap`
2. **Supply side (natural rate)** — `m_struct`, `z_struct`
3. **Credibility** — `theta`, `cred`, `deanchor-toggle` + the "How credibility works" drill-down
4. **Shocks** — `z`, `oil-shock-btn`, `shock-indicator`

`phi` is NOT here — it stays in the IS-LM section with the Taylor toggle and the "Policy rule & stability" drill-down (as built in the reverted attempt; re-add that IS-LM drill only, it was fine).

Every one of the eight PC controls appears exactly once, in its assigned cluster. No control unplaced.

## 5. The edits

### 5a. Captioned cluster headings
Add a small heading element above each cluster's divider. Match existing `.side-*` styling; a muted caption (e.g. a `div` with `class="cluster-caption"`, faint/small, uppercase or bold-muted) sitting on/above the divider rule — NOT a heavy new component. Caption texts:
1. "Phillips curve"
2. "Supply side (natural rate)"
3. "Credibility"
4. "Shocks"
The first cluster's caption may sit without a divider above it (it's the section top); clusters 2–4 get caption + `border-top` divider. Presentation only; captions must not carry `data-block` or interfere with the gating selectors.

### 5b. Cluster build in applyGraphGrouping()
Rebuild the PC-body population using the §4 order with `moveWrap` for each control, inserting a caption+divider before each cluster. Reuse the `addDivider`/caption helpers. Ensure the build does not leave duplicate `moveWrap` calls (the reverted attempt had stray `alpha`/`m_struct`/`z_struct`/`z` moves before the cluster comments — those must NOT recur; each control is moved once, in its cluster).

### 5c. Credibility drill-down (collapsed by default)
Repackage the credibility portion of `hint-dynamics` (~370–388) into a collapsed `toggleDrill`/`drill-trigger`/`drill-box` disclosure titled "▸ How credibility works", placed in the Credibility cluster after `deanchor-toggle`. Wording verbatim (the θ×credibility and de-anchoring paragraphs). The Taylor/stability portion goes to the IS-LM "Policy rule & stability" drill (as before). Remove the now-empty original `hint-dynamics` block once its content is relocated.

## 6. Invariants
### 6a. Per-cluster placement (replace the "somewhere in PC body" check)
INV-1E must assert placement PER CLUSTER, not just presence in `body-graph-PC`. Since the mock DOM tracks `children` order, assert the PC body children sequence contains the captions and controls in the §4 order — at minimum: caption "Phillips curve" precedes `ctl-pi_e`/`ctl-alpha`/`speed-wrap`; caption "Supply side" precedes `ctl-m_struct`/`ctl-z_struct`; caption "Credibility" precedes `ctl-theta`/`ctl-cred`/`deanchor-toggle` and the `drill-cred`; caption "Shocks" precedes `ctl-z`/`oil-shock-btn`. Assert `ctl-phi` is NOT in the PC body (it's in IS-LM). Assert all eight PC controls are placed (none dropped).
BAD-fixture (mutating): remove one control's `moveWrap` call from a rebuilt source (e.g. drop `ctl-theta`) and confirm the check catches the missing/misplaced control. No literal fixtures.

### 6b. Keep existing checks green
Stage-A Taylor invariant (verify_v19 55/0) untouched. INV-6b gating (taylor/deanchor/shock/speed/phi greying) untouched and still green.

### 6c. Browser-check (the real gate for layout)
Open the file, at a stage with PC unlocked:
- Four clusters in order, each with its caption heading over a faint divider.
- Every control present and in the right cluster — specifically confirm `theta` (credibility cap) sits in **Credibility** with `cred`/`deanchor`, NOT in Phillips.
- "How credibility works" collapsed by default, expands/collapses.
- φ + "Policy rule & stability" drill are in the IS-LM section, not PC.
- Gating still correct across stages (PC controls grey when PC locked; φ/taylor grey until PC).
- Nothing clips at standard viewport.

## 7. Done criteria
- [ ] `node verify_v19.mjs` → 55/0 (Stage-A invariant intact).
- [ ] `node verify_onboarding.mjs` → green; INV-1E now per-cluster with a mutating BAD-fixture (state new total).
- [ ] `node mutation_check.mjs` passes.
- [ ] All eight PC controls placed once each in the §4 clusters; `phi` in IS-LM; `theta` in Credibility.
- [ ] No stray/duplicate `moveWrap` calls; no control silently dropped (every `moveWrap` resolves non-null — report any null).
- [ ] Captions render over dividers; credibility drill collapsed by default; wording verbatim.
- [ ] `git --no-pager diff` pasted; engine HTML + `verify_onboarding.mjs` only (verify_v19 unchanged unless the count line); no engine-math lines.
- [ ] Browser-check §6c confirmed by human.
- [ ] Committed by human: suggested `ui: PC section four captioned clusters (Phillips/supply/credibility/shocks), credibility drill-down; per-cluster verifier`.

## 8. Notes / decisions settled
- θ (credibility cap) grouped with Credibility (`cred`/`deanchor`) — it's the ceiling that pairs with current credibility; Malin's grouping call.
- Supply-side cluster (`m_struct`, `z_struct`) now exposed as its own captioned section — corrects the earlier spec's mistaken claim that structural supply controls weren't in the UI. These set Yₙ (Blanchard Ch.7–8).
- Pure presentation; no engine/fidelity change, nothing for Frank here.
