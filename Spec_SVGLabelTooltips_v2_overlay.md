# Spec (REVISION): SVG label tooltips — switch from native `<title>` to HTML overlay

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (v19 only — v16 still deferred)
**Type of change:** Replace the failed SVG `<title>` mechanism with an HTML overlay popup that reuses the committed `.sym-pop` styling and the existing Boot-region hover handler.
**Supersedes:** the `<title>`-based mechanism in `Spec_SVGLabelTooltips.md`.

---

## Why this revision

The committed slice used native SVG `<title>` children appended by `svgTitle`. Verifiers passed (the `<title>` child exists in the DOM), but **the tooltips do not appear in the browser**. Native SVG `<title>` tooltips have a glyph-only hit target (you must hover the literal painted letter strokes, not a bounding box), a ~1s dwell, and they interact badly with clipping and pointer-events. Adding `.help-mode .curve-label { pointer-events: auto; }` did not fix it. This is the canonical "engine-correct but diagram-wrong" failure: the structural verifier cannot see that a DOM-present `<title>` never renders for the user.

**Decision:** abandon native `<title>`; reuse the HTML overlay mechanism already shipped and proven for HTML symbols in Item C polish (`position: fixed` `.sym-pop` + `getBoundingClientRect` + viewport clamping, driven by Boot-region `mouseover`/`mouseout`). `getBoundingClientRect` works identically on SVG `<text>`, so the same proven placement code drives an SVG-label popup. This is recorded as a deliberate mechanism change after browser-gate failure.

## What survives unchanged (do NOT touch)

- `findSymbols(text)` — the shared tokenizer. Unchanged.
- The help-mode gating concept and the `render()` call added to `toggleHelpMode()`.
- The 16 (now 18, incl. drawAxes) label call sites that create the `<text>` and call `svgTitle(_t, label)`.
- `.help-mode .curve-label { pointer-events: auto; }` — KEEP IT. The JS handler needs the `<text>` to receive hover events. This rule is now load-bearing, not vestigial.
- INV-S1 (tokenizer purity, byte-identical `wrapSymbols`). Unchanged.

## What changes

### 1. `svgTitle` — set an attribute instead of appending a `<title>` child

Replace the body so it tags the `<text>` with a `data-tooltip` attribute (still gated, still using `findSymbols`):

```
function svgTitle(textEl, label) {
  if (typeof document === 'undefined') return;
  if (!document.body || !document.body.classList) return;
  if (typeof document.body.classList.contains !== 'function') return;
  if (!document.body.classList.contains('help-mode')) return;
  const found = findSymbols(label);
  if (!found.length) return;
  const text = found.map(f => f.def.meaning + '; ' + f.def.ref + '; ' + f.def.role).join(' | ');
  textEl.setAttribute('data-tooltip', text);
  textEl.setAttribute('data-svgtip', '1');   // marker class/attr so the handler can target SVG labels
}
```

No `el('title', ...)`, no child append. (Keep the function name `svgTitle` to avoid churning the 18 call sites.)

### 2. One shared floating popup div

Add a single standalone element (NOT nested in any `.sym`), e.g. in the Boot region or static HTML:

```
<div class="sym-pop" id="svg-tooltip" data-tooltip=""></div>
```

It reuses the existing `.sym-pop` CSS (`position: fixed`, `::after { content: attr(data-tooltip) }`, clamping styles). It must default to `display:none`.

> Confirm the existing `.sym-pop` base rule does not force `display:none` only via the `.sym .sym-pop` descendant selector (line 312 is `.sym .sym-pop { display: none; }`, which will NOT match a standalone `#svg-tooltip`). Add an explicit `#svg-tooltip { display: none; }` so it starts hidden, and the handler toggles it to `block`.

### 3. Broaden the Boot-region hover handler (lines ~2288–2319)

The existing handler targets `.sym` and uses the nested `.sym-pop`. Add a second branch for SVG labels that reuses the IDENTICAL placement math:

```
document.addEventListener('mouseover', e => {
  if (!document.body.classList.contains('help-mode')) return;

  // --- existing HTML .sym path: UNCHANGED ---
  const sym = e.target.closest('.sym');
  if (sym) {
    const pop = sym.querySelector('.sym-pop');
    if (!pop) return;
    // ... existing placement code, unchanged ...
    return;
  }

  // --- new SVG label path ---
  const svgLabel = e.target.closest('[data-svgtip]');
  if (!svgLabel || !svgLabel.getAttribute('data-tooltip')) return;
  const pop = document.getElementById('svg-tooltip');
  if (!pop) return;
  pop.setAttribute('data-tooltip', svgLabel.getAttribute('data-tooltip'));
  const rect = svgLabel.getBoundingClientRect();
  pop.style.display = 'block';
  const popRect = pop.getBoundingClientRect();
  let top = rect.bottom + 4, left = rect.left;
  if (left + popRect.width > window.innerWidth) left = window.innerWidth - popRect.width - 10;
  if (top + popRect.height > window.innerHeight) top = rect.top - popRect.height - 4;
  pop.style.top = top + 'px';
  pop.style.left = Math.max(10, left) + 'px';
});

document.addEventListener('mouseout', e => {
  // existing .sym path unchanged, plus:
  const svgLabel = e.target.closest('[data-svgtip]');
  if (svgLabel) {
    const pop = document.getElementById('svg-tooltip');
    if (pop) pop.style.display = 'none';
  }
});
```

- `.closest('[data-svgtip]')` works on SVG elements (SVGElement implements `closest`).
- `getBoundingClientRect()` on `<text>` returns the rendered glyph box in viewport coords — same as HTML — so the placement code is identical.
- The handler stays in the Boot region; nothing moves into the headless slice.

### 4. Verifier invariants (`verify_onboarding.mjs`) — adapt to attribute, not child

The structure is identical; only the assertion target changes from "`<title>` child" to "`data-tooltip` attribute".

- **INV-S2 (gating OFF):** after render with help-mode OFF, no labeled `<text>` has a `data-tooltip` attribute.
- **INV-S3 (gating ON + content):** with help-mode ON, every labeled `<text>` whose label has ≥1 token has a `data-tooltip` attribute equal to the concatenated-defs string; `i, π` contains both defs joined by ` | `.
- **INV-S4 (no-match):** IS/MP/UIP/PC `<text>` have no `data-tooltip` attribute.
- **BAD-fixtures:** mutate `svgTitle` to set the attribute unconditionally (drop the help-mode guard) → INV-S2 fails; mutate `findSymbols` to drop the second token → INV-S3 `i, π` both-defs fails. **Each BAD-fixture's `.replace()` target string MUST be confirmed to exist verbatim in source (paste a grep proving it) so the fixture is not vacuous.** The mock `fakeEl` must record `setAttribute` calls (check it stores attributes in a way the test can read back, e.g. an `attrs` map or `getAttribute`); if it currently no-ops `setAttribute`, upgrade it to record so the attribute assertions are real.
- **INV-S1:** unchanged.

> NOTE: the harness `fakeEl` previously recorded appended children (for the `<title>` test). Now it must record attributes. Confirm `fakeEl.setAttribute` stores to a readable map and `fakeEl.getAttribute` reads it. If the existing stub's `getAttribute: () => null` is still there, the attribute invariants will silently always-pass-or-fail — fix the stub and prove it with a fixture that flips red.

## Acceptance check (report back; do NOT commit)

1. HS-1 construct-check passes.
2. All three verifiers, exact counts: onboarding (state new total), **v16 = 32/0**, **v19 = 40/0**. State all three.
3. For EACH BAD-fixture, paste a grep proving its `.replace()` target string exists verbatim in source. A fixture whose target is absent is vacuous and must be rewritten.
4. `git status` (no scratch files); full `git --no-pager diff` of v19 and verify_onboarding.mjs, every hunk explained.
5. **Browser check (the gate that failed last time — do it carefully):** v19, Help Mode ON. Hover IS/MP/UIP/PC curve labels → styled popup appears immediately (no 1s dwell, no need to hit exact glyph strokes). Hover axis labels (Yₙ, output Y, i*) → popup appears. `i, π` shows BOTH defs joined by ` | `. Drag the IS and MP endpoint handles near their labels → confirm the now-pointer-active labels don't block the drag. Toggle Help OFF → popups stop after refresh. Confirm no label glyph shifted position.

## Guardrails / out of scope

- v19 only. v16 deferred (and its stray `.help-mode .curve-label` line should already be reverted — confirm v16 is NOT in `git status`).
- Do NOT alter the existing `.sym` HTML tooltip behaviour — the new SVG branch is additive; the `.sym` path stays byte-identical.
- Do NOT weaken any verifier assertion. v16/v19 counts stay 32/40.
- Read-only git only. Human is sole committer. No scratch files. No `Set-Content` on HTML.
- On any SyntaxError / FAILED TO LOAD: STOP and report.

## Follow-ups logged (not this slice)
- `findSymbols` line ~831 space-sentinel fragility (`' '.repeat` → `'\x00'.repeat`).
- `eval_dump.js` scratch write in `verify_v19.mjs`.
- v16 parity slice (full helper set + this overlay + the CSS line).
