# Spec: Hide the Yₙ line on the IS-LM chart until the PC block is unlocked

## 1. Goal (one sentence)
The natural-output line `Yₙ` (the grey dashed vertical line + its "Yₙ" label) on the IS-LM chart must NOT be drawn while the PC block is locked, and must appear exactly as now once PC is unlocked.

## 2. Which model(s) and which function(s)
`islm_pc_model_v19_Open_Economy_Complete_Demo.html` ONLY, inside `drawISMP()` (the IS-LM / IS-MP chart). The Yₙ line is drawn at the two lines immediately after `const yn_x = xScale(eq.Y_n, o);` — the `el('line', …, class: 'curve-natural')` and the following `el('text', …)` that sets `textContent = 'Yₙ'`. NOTHING ELSE is touched.

Note: this is NOT the UIP chart. `drawUIP()` also draws a `curve-natural` line, but that is the foreign-rate line `i*` (`yScale(state.i_star, …)`, label "i*"), a different economic object — do not touch it.

## 3. The economics (anchor to the textbook) — PEDAGOGY, CONFIRM WITH FRANK
Yₙ (natural output) is a medium-run / Phillips-curve concept: it is the output level consistent with the natural rate of unemployment Uₙ (Blanchard Ch. 8, WS-PS; Ch. 9). It does not exist in the Ch. 5 short-run IS-LM model, where output is demand-determined and there is no natural-rate anchor on screen. Showing Yₙ on the IS-LM chart before the PC block is unlocked therefore leaks a concept the learner has not been taught yet, and (as the user notes) Yₙ is conceptually tied to Uₙ which is also a PC-block object.

**This is a pedagogical/display decision about what the learner sees and when — it should be confirmed with Frank**, in the same way the πᵉ-with-PC gating override is flagged "to be confirmed with Frank" in the Master Plan even though the engine work was done. The user (who owns implementation decisions) has made the call to hide it; this spec implements that call and flags it for Frank's pedagogy sign-off. It does NOT change any engine economics — `solve()`, `eq.Y_n`, and every numeric output are untouched; only whether a line is *drawn* changes.

## 4. What must NOT change
- `solve()` and all engine math: untouched. `eq.Y_n` is still computed exactly as now.
- The Yₙ line on every OTHER chart that legitimately shows it once PC is live (the PC chart `drawPC`, the drill charts) — untouched. This spec is ONLY the IS-LM chart instance.
- The `i*` line in `drawUIP` — untouched (it is not Yₙ).
- The real-rate line already gated in `drawISMP` at `if (tutorialState.unlocked.has('PC'))` — untouched; the new guard must use the SAME predicate so the chart is internally consistent.
- `verify_v19.mjs` must stay 52/0. No slider/handler/economics behaviour changes.

## 5. The edit (surgical, exact-string, grep-confirmed)
The canonical "PC unlocked" predicate in this engine is `tutorialState.unlocked.has('PC')` — used throughout (e.g. `drawISMP` line ~1218 for the real-rate line, readout lines, chip gating). Use that exact predicate; do NOT invent a new flag.

Wrap the two Yₙ-drawing statements in `drawISMP()` in that guard.

- OLD:
```
  const yn_x = xScale(eq.Y_n, o);
  el('line', { x1: yn_x, x2: yn_x, y1: P.t, y2: H - P.b, class: 'curve-natural' }, svg);
  { const _t = el('text', { x: yn_x + 3, y: P.t + 9, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'Yₙ'; svgTitle(_t, 'Yₙ'); }
```
- NEW:
```
  if (tutorialState.unlocked.has('PC')) {
    const yn_x = xScale(eq.Y_n, o);
    el('line', { x1: yn_x, x2: yn_x, y1: P.t, y2: H - P.b, class: 'curve-natural' }, svg);
    { const _t = el('text', { x: yn_x + 3, y: P.t + 9, class: 'axis-label', fill: '#666' }, svg); _t.textContent = 'Yₙ'; svgTitle(_t, 'Yₙ'); }
  }
```
(Confirm `const yn_x` is not referenced later in `drawISMP` outside this block before scoping it inside the `if` — grep the function body. If it IS used later, declare `yn_x` outside and only guard the two `el(...)` draw calls instead. Report which case applies.)

## 6. The invariant(s) that must hold afterward  ← the whole point
Add a headless assertion to `verify_onboarding.mjs` (this is a DRAW/DISPLAY invariant, which `verify_onboarding` is the right home for — `verify_v19` tests `solve()` only and cannot catch this):

- With PC LOCKED (e.g. `goToStage` to the ISLM or UIP stage), calling `drawISMP()` / `drawEquations` path produces an `#ismp` SVG containing **no** element whose text content is `Yₙ` (and no `curve-natural` line attributable to Yₙ in that chart).
- With PC UNLOCKED (Full stage), the same render DOES produce the `Yₙ` label in `#ismp`.
- Pattern-match the existing INV-6 scope-style checks / the chip-gating render checks in `verify_onboarding.mjs` for how it inspects rendered SVG headlessly. Add a matching BAD-fixture proving the check can go red (e.g. force the line drawn while PC locked → check fails).

Because this is also eyeball-gated (verifier-green ≠ done for visuals, per AGENTS.md): **browser-check** — open the file, confirm at the IS-LM (closed) and IS-LM-UIP (open) stages the Yₙ line and label are absent from the IS-LM chart, then unlock PC and confirm they reappear correctly positioned.

## 7. Done criteria
- [ ] `node verify_v19.mjs` → 52/0 (unchanged).
- [ ] `node verify_onboarding.mjs` → 96/0 + the new check(s) (state the new count, e.g. 97/0 or 98/0 with its BAD-fixture).
- [ ] New invariant from §6 encoded as a headless assertion in `verify_onboarding.mjs`, with a BAD-fixture that proves it can fail.
- [ ] `node mutation_check.mjs` still passes.
- [ ] Browser check done: Yₙ absent on IS-LM chart pre-PC, present post-PC, correctly positioned.
- [ ] `git --no-pager diff` pasted; only `drawISMP` in the engine HTML and the new check in `verify_onboarding.mjs` changed — no other charts, no `solve()`, no UIP `i*` line.
- [ ] Committed by the human: suggested `engine: gate Yn line in IS-LM chart on PC-unlock (hide pre-PC); verifier check added`.
- [ ] **Route to Frank**: log the pedagogy decision (Yₙ hidden until PC) for Frank's sign-off, alongside the πᵉ-with-PC override already pending his review.
