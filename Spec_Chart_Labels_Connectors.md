# Spec: Chart label placement, cross-panel connector lines, logo size

> Scope: VISUAL ONLY. No engine changes (solve/step/computeYn untouched). This slice is
> browser-check-heavy: verifiers can only prove the file still loads (HS-1) and the
> suite stays green; every placement item below must be eyeballed. Baseline: post-v1
> preset-fixes commit (or post-twin commit — this slice touches none of the same lines).
> Layout facts (verified): `.charts` is a 2×2 grid — ISMP top-left, UIP top-right,
> PC bottom-left. Each chart-box contains its own `.eq-box` below the legend. All three
> main SVGs are viewBox 360×220 with P = { l: 38, r: 16, t: 14, b: 28 }.

## Request list (Malin, 2026-07-05)
R1. Label the dashed real-rate line in the ISLM chart `r`, with tooltip.
R2. Move axis labels (output Y / interest rate i / inflation π / exchange rate E) OUTSIDE the plot areas.
R3. IS label → top-LEFT end of the IS line (currently bottom-right).
R4. UIP chart: dotted drop-line from the equilibrium dot to the x-axis, labelled `E`, moving with the dot.
R5. ISMP: LM label → RIGHT end of the line; `i` label at the LEFT end.
R6. Yₙ label → BOTTOM of its dotted line, in both ISMP and PC.
R7. ISMP: dotted drop-line from the equilibrium dot, labelled `Y` at the bottom, continuing BELOW the chart (passing visually underneath the eq-box) down into the PC chart, fainter outside the plots.
R8. Same for the policy-rate level: grey dotted line continuing from ISMP rightward into the UIP chart, fainter in the gap.
R9. UIP: `i*` label → LEFT side; the i line (the received R8 line inside UIP) labelled `i` on the LEFT; when i ≈ i* the two labels merge into one reading `i, i*`.
R10. Logo slightly bigger.

Two interpretation calls baked in (veto at browser-check if wrong):
- (a) The `r` label goes on the LEFT end of the dashed line, mirroring the new `i` (R5). Right end would collide with the relocated LM label.
- (b) R8/R9 together mean UIP gains a horizontal grey dotted guide at the current policy rate i — that line IS the LM extension — labelled `i` on its left.

## Edits

### E1 — geometry: padding for outside axis labels (all three main charts)
In `drawISMP`, `drawUIP`, `drawPC` (three occurrences total):
OLD (each): `const W = 360, H = 220, P = { l: 38, r: 16, t: 14, b: 28 };`
NEW (each): `const W = 360, H = 220, P = { l: 46, r: 16, t: 14, b: 40 };`
(Grep count must be exactly 3; the drill-graph SVGs use their own padding and are NOT touched — but see Browser check item 9.)

### E2 — drawAxes: axis labels outside the plot
OLD (unique, two adjacent statements):
  { const _t = el('text', { x: o.W - o.P.r, y: o.H - o.P.b - 4, class: 'axis-label', 'text-anchor': 'end' }, svg); _t.textContent = o.xLabel; svgTitle(_t, o.xLabel); }
  { const _t = el('text', { x: o.P.l + 4, y: o.P.t + 10, class: 'axis-label', 'text-anchor': 'start' }, svg); _t.textContent = o.yLabel; svgTitle(_t, o.yLabel); }
NEW:
  { const _t = el('text', { x: (o.P.l + o.W - o.P.r) / 2, y: o.H - 6, class: 'axis-label', 'text-anchor': 'middle' }, svg); _t.textContent = o.xLabel; svgTitle(_t, o.xLabel); }
  { const _t = el('text', { x: 12, y: (o.P.t + o.H - o.P.b) / 2, class: 'axis-label', 'text-anchor': 'middle', transform: `rotate(-90 12 ${(o.P.t + o.H - o.P.b) / 2})` }, svg); _t.textContent = o.yLabel; svgTitle(_t, o.yLabel); }
(x-label centered below the tick row — b:40 from E1 makes room; y-label rotated −90° along the left edge.)

### E3 — ISMP: IS label to top-left (R3)
OLD (unique):
  const isEndVal = isRateForOutput(o.xMax, state.G, state.T, eq.eps, effectivePiE(state), state.c1, state.m1, state.Ystar);
  { const _t = el('text', { x: xScale(o.xMax, o) - 14, y: labelY(yScale(isEndVal, o) + 12, o), class: 'curve-label label-is' }, svg); _t.textContent = 'IS'; svgTitle(_t, 'IS'); }
NEW:
  const isStartVal = isRateForOutput(o.xMin, state.G, state.T, eq.eps, effectivePiE(state), state.c1, state.m1, state.Ystar);
  { const _t = el('text', { x: xScale(o.xMin, o) + 6, y: labelY(yScale(isStartVal, o) - 6, o), class: 'curve-label label-is' }, svg); _t.textContent = 'IS'; svgTitle(_t, 'IS'); }

### E4 — ISMP: LM right + i left + r label on dashed line (R5, R1)
OLD (unique):
  { const _t = el('text', { x: P.l + 4, y: labelY(yScale(mp_i, o) - 5, o), class: 'curve-label label-mp' }, svg); _t.textContent = 'LM'; svgTitle(_t, 'LM'); }
NEW:
  { const _t = el('text', { x: W - P.r - 4, y: labelY(yScale(mp_i, o) - 5, o), class: 'curve-label label-mp', 'text-anchor': 'end' }, svg); _t.textContent = 'LM'; svgTitle(_t, 'LM'); }
  { const _t = el('text', { x: P.l + 4, y: labelY(yScale(mp_i, o) - 5, o), class: 'curve-label label-mp' }, svg); _t.textContent = 'i'; svgTitle(_t, 'i'); }
  if (tutorialState.unlocked.has('PC')) {
    { const _t = el('text', { x: P.l + 4, y: labelY(yScale(real_i, o) - 5, o), class: 'curve-label label-mp' }, svg); _t.textContent = 'r'; svgTitle(_t, 'r'); }
  }
(SYMBOL_DEFS['r'] exists — 'real interest rate; eq. 6.4' — so the tooltip works via the
existing svgTitle/findSymbols path. Agent must verify SYMBOL_DEFS also resolves 'i',
'Y', 'E' before relying on them in E4–E7; if any key is missing, STOP and report.)

### E5 — ISMP: Yₙ label to bottom (R6)
OLD (unique):
  { const _t = el('text', { x: yn_x + 3, y: P.t + 9, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'Yₙ'; svgTitle(_t, 'Yₙ'); }
NEW:
  { const _t = el('text', { x: yn_x - 3, y: H - P.b - 4, class: 'axis-label', fill: '#666', 'text-anchor': 'end' }, svg); _t.textContent = 'Yₙ'; svgTitle(_t, 'Yₙ'); }
(end-anchored LEFT of the line so it cannot collide with the new Y drop-label, which is
start-anchored right of its line.)

### E6 — PC: Yₙ label to bottom (R6) — same transform
OLD (unique — differs from E5's by context; grep within drawPC):
  { const _t = el('text', { x: yn_x + 3, y: P.t + 9, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'Yₙ'; svgTitle(_t, 'Yₙ'); }
NOTE: this string is IDENTICAL to E5's OLD → global grep count is 2. Procedure: apply E5
first (drawISMP), re-grep (count must now be 1, inside drawPC), then apply E6 with the
same NEW text as E5. Any other count → STOP.

### E7 — in-chart guide segments + labels (R4, R7-inside, R8-inside, R9)
E7a. drawISMP — insert immediately AFTER the eq-point circle line
(`el('circle', { cx: xScale(eq.Y, o), cy: yScale(eq.i, o), r: 4.5, class: 'eq-point' }, svg);`):
  // guide: Y drop-line from the dot to the x-axis (continues to PC via overlay)
  el('line', { x1: xScale(eq.Y, o), x2: xScale(eq.Y, o), y1: yScale(eq.i, o), y2: H - P.b, class: 'guide-line' }, svg);
  { const _t = el('text', { x: xScale(eq.Y, o) + 3, y: H - P.b - 4, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'Y'; svgTitle(_t, 'Y'); }
  // guide: i continues rightward toward UIP (bridge drawn by overlay)
  el('line', { x1: xScale(eq.Y, o), x2: W - P.r, y1: yScale(eq.i, o), y2: yScale(eq.i, o), class: 'guide-line' }, svg);
E7b. drawUIP — REPLACE the i* line+label block:
OLD (unique):
  const ee_y = yScale(state.i_star, o);
  el('line', { x1: P.l, x2: W - P.r, y1: ee_y, y2: ee_y, class: 'curve-natural' }, svg);
  { const _t = el('text', { x: W - P.r - 10, y: ee_y - 4, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'i*'; svgTitle(_t, 'i*'); }
NEW:
  const ee_y = yScale(state.i_star, o);
  el('line', { x1: P.l, x2: W - P.r, y1: ee_y, y2: ee_y, class: 'curve-natural' }, svg);
  const i_y = yScale(clamp(eq.i, o.yMin, o.yMax), o);
  el('line', { x1: P.l, x2: W - P.r, y1: i_y, y2: i_y, class: 'guide-line' }, svg);
  if (Math.abs(eq.i - state.i_star) < 0.0025) {
    { const _t = el('text', { x: P.l + 4, y: ee_y - 4, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'i, i*'; svgTitle(_t, 'i, i*'); }
  } else {
    { const _t = el('text', { x: P.l + 4, y: ee_y - 4, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'i*'; svgTitle(_t, 'i*'); }
    { const _t = el('text', { x: P.l + 4, y: i_y - 4, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'i'; svgTitle(_t, 'i'); }
  }
  NOTE: `eq` must already be in scope at this point in drawUIP; if the block sits before
  `const eq = solve(state);`, move the insertion to just after it — grep the function first.
E7c. drawUIP — insert after the eq-point circle (R4):
  el('line', { x1: xScale(eq.E, o), x2: xScale(eq.E, o), y1: yScale(eq.i, o), y2: H - P.b, class: 'guide-line' }, svg);
  { const _t = el('text', { x: xScale(eq.E, o) + 3, y: H - P.b - 4, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'E'; svgTitle(_t, 'E'); }
E7d. drawPC — insert after the eq-point circle (receiving end of the Y line):
  el('line', { x1: xScale(clamp(eq.Y, o.xMin, o.xMax), o), x2: xScale(clamp(eq.Y, o.xMin, o.xMax), o), y1: P.t, y2: yScale(clamp(eq.pi, o.yMin, o.yMax), o), class: 'guide-line' }, svg);

### E8 — cross-panel connector overlay (R7/R8 bridges)
E8a. HTML: inside `<div class="panel charts">`, add as FIRST child:
  <svg id="connector-overlay" aria-hidden="true"></svg>
E8b. CSS additions (append to the stylesheet):
  .charts { position: relative; }
  #connector-overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: visible; }
  .eq-box, .legend-row, .chart-chips { position: relative; z-index: 1; }
  .guide-line { stroke: #8a8f98; stroke-width: 1; stroke-dasharray: 3 4; fill: none; }
  .connector-faint { stroke: #8a8f98; stroke-width: 1; stroke-dasharray: 3 4; opacity: 0.35; fill: none; }
(`.eq-box` already has an opaque background (var(--surface-2)) — with z-index above the
overlay, the bridge passes visually UNDERNEATH it, per R7.)
E8c. JS: new function, placed near the other draw functions:
  function drawConnectors() {
    const ov = document.getElementById('connector-overlay');
    if (!ov || typeof ov.getBoundingClientRect !== 'function') return;   // headless guard
    while (ov.firstChild) ov.removeChild(ov.firstChild);
    const cont = ov.getBoundingClientRect();
    if (!cont || !cont.width) return;
    const svgs = {};
    for (const id of ['ismp', 'uip', 'pc']) {
      const n = document.getElementById(id);
      if (!n || typeof n.getBoundingClientRect !== 'function') return;
      svgs[id] = n.getBoundingClientRect();
      if (!svgs[id].width) return;
    }
    const eq = solve(state);
    // Y bridge: bottom of ismp plot -> top of pc plot, at x = xScale(eq.Y)
    const sxI = svgs.ismp.width / 360, syI = svgs.ismp.height / 220;
    const sxP = svgs.pc.width / 360;
    const yTopPx  = svgs.ismp.top - cont.top + (220 - opts_ismp.P.b) * syI;
    const yBotPx  = svgs.pc.top   - cont.top + opts_pc.P.t * (svgs.pc.height / 220);
    const xIsmpPx = svgs.ismp.left - cont.left + xScale(clamp(eq.Y, opts_ismp.xMin, opts_ismp.xMax), opts_ismp) * sxI;
    const xPcPx   = svgs.pc.left   - cont.left + xScale(clamp(eq.Y, opts_pc.xMin,  opts_pc.xMax),  opts_pc)  * sxP;
    el('path', { d: `M ${xIsmpPx} ${yTopPx} L ${xIsmpPx} ${(yTopPx + yBotPx) / 2} L ${xPcPx} ${(yTopPx + yBotPx) / 2} L ${xPcPx} ${yBotPx}`, class: 'connector-faint' }, ov);
    // i bridge: right edge of ismp plot -> left edge of uip plot, at y = yScale(eq.i)
    const syU = svgs.uip.height / 220;
    const yIsmpPx = svgs.ismp.top - cont.top + yScale(clamp(eq.i, opts_ismp.yMin, opts_ismp.yMax), opts_ismp) * syI;
    const yUipPx  = svgs.uip.top  - cont.top + yScale(clamp(eq.i, opts_uip.yMin,  opts_uip.yMax),  opts_uip)  * syU;
    const xRightPx = svgs.ismp.left - cont.left + (360 - opts_ismp.P.r) * sxI;
    const xLeftPx  = svgs.uip.left  - cont.left + opts_uip.P.l * (svgs.uip.width / 360);
    el('path', { d: `M ${xRightPx} ${yIsmpPx} L ${(xRightPx + xLeftPx) / 2} ${yIsmpPx} L ${(xRightPx + xLeftPx) / 2} ${yUipPx} L ${xLeftPx} ${yUipPx}`, class: 'connector-faint' }, ov);
  }
(The dog-leg midpoints handle any misalignment between the two charts' pixel scales.
The el() helper appends to any node, including the overlay; if el() hard-codes a
namespace/parent assumption that breaks this, STOP and report rather than rewriting el().)
E8d. Call site: at the END of render(), add `drawConnectors();` (grep render() first;
if the main redraw function has a different name, STOP and report — do not guess).
E8e. Resize: alongside the other window listeners add
  window.addEventListener('resize', () => { if (typeof drawConnectors === 'function') drawConnectors(); });

### E9 — logo (R10)
OLD (unique): .logo-badge { display: inline-flex; align-items: center; justify-content: center; flex: none; width: 48px; height: 48px; }
NEW:          .logo-badge { display: inline-flex; align-items: center; justify-content: center; flex: none; width: 56px; height: 56px; }
OLD (unique): logo-badge img { width: 44px; height: 44px; object-fit: contain; display: block; }
NEW:          logo-badge img { width: 52px; height: 52px; object-fit: contain; display: block; }

## Verification gate
1. `node verify_v19.mjs`, `node verify_onboarding.mjs`, `node mutation_check.mjs` — all
   green at their current baselines (this slice adds no assertions; a top-level runtime
   error from E7/E8 WOULD break the harness load, which the suite catches).
2. HS-1 headless check.
3. Browser check (Malin) — the REAL gate for this slice, at Full Model stage unless noted:
   1. Dashed real-rate line labelled `r` left end; Help-Mode tooltip reads "real interest rate; eq. 6.4…". (Stage 2+ only; confirm NO `r` label at stages 0–1.)
   2. All three charts: axis titles sit OUTSIDE the plot (x-title below the tick numbers, y-title rotated along the left edge); nothing clipped.
   3. IS label at the top-left end of the IS curve.
   4. UIP: dotted drop-line from the dot to the axis, `E` at its foot; drag the UIP handle — line and label track the dot.
   5. ISMP: `LM` at the right end, `i` at the left end of the policy line.
   6. Yₙ label at the BOTTOM of its dashed line in both ISMP and PC, left of the line; the `Y` drop-label sits right of its line — nudge Y near Yₙ and confirm no overlap.
   7. The Y line runs from the ISMP dot, under the ISMP eq-box (open the box: the faint line must disappear behind it, not cross it), into the PC chart, meeting the PC dot's vertical guide. Fainter in the gap than inside the charts.
   8. The i line runs from the ISMP dot rightward into UIP, fainter in the gap, meeting UIP's horizontal guide. At startup (i = i* = 3%) UIP shows a single left-side label `i, i*`; raise i* — it splits into `i` and `i*`, both on the left.
   9. Resize the window: bridges re-anchor correctly. Check the three PC drill graphs still render without clipped labels (E2 changes drawAxes globally); if their axis titles clip, report — do not improvise padding changes there.
   10. Logo visibly larger, header not misaligned.
   11. Stage 0 sanity: no r label, no Fisher artifacts; guides and bridges still correct.

## Standing prohibitions (restated — mandatory)
No `Set-Content` (Unicode: θ, πᵉ, ε, Yₙ), no scratch/temp files, no wholesale rewrites,
no git mutations, dirty tree → STOP, every OLD string grep-proven at its expected count
BEFORE editing, no out-of-scope ride-alongs, complete raw diff, PASS/FAIL per gate item.
