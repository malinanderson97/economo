# Spec (ADDENDUM): Curve-name tooltips (IS / MP / UIP / PC) via a separate CURVE_DEFS map

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (v19 only)
**Type of change:** Additive. Give the curve-NAME labels (IS, MP, UIP, PC) tooltips, using a curve-only definitions map that the HTML symbol path never consults. Also finish converting the four curve-name `<text>` sites from `.innerHTML = wrapSymbols(...)` to `.textContent` (latent-bug fix carried over from the main slice).
**Builds on:** the committed-pending v2 overlay slice. Same `#svg-tooltip` overlay, same Boot handler — no handler change needed.

---

## Why

Browser check confirmed: axis labels and symbol-bearing labels (`i (nominal)`, etc.) show tooltips; the curve NAMES IS/MP/UIP/PC do not. That is current-spec-correct — they aren't `SYMBOL_DEFS` keys, so `svgTitle` finds no token and sets no `data-svgtip`. But the curve name is pedagogically the most valuable hover ("what is the IS curve?"), so we add definitions for them. They must NOT be added to `SYMBOL_DEFS`, or `wrapSymbols`/`findSymbols` would start matching the letters "IS"/"MP"/"PC" inside HTML equation/readout prose and inject spurious tooltips. Hence a separate `CURVE_DEFS` map consulted ONLY by `svgTitle`.

## What to do

### 1. Add `CURVE_DEFS` (headless slice, beside `SYMBOL_DEFS`)

```
const CURVE_DEFS = {
  'IS':  { meaning: 'goods-market equilibrium', ref: 'Ch. 5', role: 'output where demand equals production at each interest rate' },
  'MP':  { meaning: 'monetary policy rate',     ref: 'Ch. 5', role: 'the interest rate the central bank sets' },
  'UIP': { meaning: 'uncovered interest parity', ref: 'eq. 19.5', role: 'links domestic and foreign returns through the exchange rate' },
  'PC':  { meaning: 'Phillips curve',           ref: 'eq. 9.3', role: 'links inflation to the output gap' }
};
```
(Wording is provisional — flag for Frank. Keep the `meaning; ref; role` shape so the tooltip-string builder is shared.)

### 2. `svgTitle`: consult `SYMBOL_DEFS` (via findSymbols) first, then `CURVE_DEFS` exact-label fallback

```
function svgTitle(textEl, label) {
  if (typeof document === 'undefined') return;
  if (!document.body || !document.body.classList) return;
  if (typeof document.body.classList.contains !== 'function') return;
  if (!document.body.classList.contains('help-mode')) return;

  let text = '';
  const found = findSymbols(label);
  if (found.length) {
    text = found.map(f => f.def.meaning + '; ' + f.def.ref + '; ' + f.def.role).join(' | ');
  } else if (CURVE_DEFS[label]) {                       // exact whole-label match only
    const d = CURVE_DEFS[label];
    text = d.meaning + '; ' + d.ref + '; ' + d.role;
  }
  if (!text) return;

  textEl.setAttribute('data-tooltip', text);
  textEl.setAttribute('data-svgtip', '1');
}
```

- `CURVE_DEFS` is an EXACT whole-label lookup, not a sub-token scan — so it only ever fires when the label is exactly `'IS'`/`'MP'`/`'UIP'`/`'PC'`.
- `wrapSymbols` and `findSymbols` are NOT changed and do NOT see `CURVE_DEFS`. The HTML symbol path is untouched.

### 3. Convert the four curve-name sites from `.innerHTML = wrapSymbols(...)` to `.textContent`

In `drawISMP` (IS, MP), `drawUIP` (UIP), `drawPC` (PC): change
```
{ const _t = el('text', {...}, svg); _t.innerHTML = wrapSymbols('IS'); svgTitle(_t, 'IS'); }
```
to
```
{ const _t = el('text', {...}, svg); _t.textContent = 'IS'; svgTitle(_t, 'IS'); }
```
Same for MP, UIP, PC. This removes the last invalid-`innerHTML`-into-SVG sites and makes attribute-setting order safe. (These are the ONLY four sites still on `wrapSymbols`; after this, no SVG `<text>` uses `wrapSymbols`.)

### 4. Verifier updates (`verify_onboarding.mjs`)

- Destructure `CURVE_DEFS` from `testRender` if asserting its contents.
- **INV-S4 INVERTS.** It currently asserts IS/MP/UIP/PC get NO `data-tooltip`. Now they MUST get one. Rewrite INV-S4: with help-mode ON, each of IS/MP/UIP/PC `<text>` has a `data-tooltip` equal to the `CURVE_DEFS` `meaning; ref; role` string.
- **New no-leak invariant (INV-S5):** prove `CURVE_DEFS` does NOT leak into the HTML path — assert `wrapSymbols('IS and PC')` contains NO `class="sym"` span (i.e. wrapSymbols still treats IS/PC as plain text). This guards the whole reason for the separate map.
- **BAD-fixture:** mutate `svgTitle` to skip the `CURVE_DEFS` branch (e.g. `.replace("CURVE_DEFS[label]", "false")`) → INV-S4 must fail. Confirm the replace target exists verbatim (grep + paste).
- INV-S1/S2/S3 unchanged.

## Acceptance check (report back; do NOT commit)
1. HS-1 construct-check passes.
2. Three verifiers, exact counts: onboarding (new total), v16 = 32/0, v19 = 40/0.
3. Grep proving the new BAD-fixture's `.replace()` target exists verbatim.
4. Full `git --no-pager diff` of both files, every hunk explained. The ONLY new changes vs the v2 slice: `CURVE_DEFS` added, `svgTitle` fallback branch, four `.innerHTML`→`.textContent` conversions, INV-S4 inverted + INV-S5 + one BAD-fixture. Anything else rode along — revert it.
5. **Browser check:** v19, Help Mode ON — hover IS / MP / UIP / PC → curve-name tooltip appears (this was the failing case). Re-confirm axis + `i, π` still work. Drag handles near the IS/MP labels → no drag interception. Help OFF → tooltips stop.

## Guardrails
- v19 only. Read-only git only; human commits. No scratch files; no Set-Content on HTML.
- Do NOT add IS/MP/UIP/PC to SYMBOL_DEFS. They go ONLY in CURVE_DEFS.
- Do NOT change wrapSymbols or findSymbols.
- Do NOT weaken any assertion; v16/v19 stay 32/40.
- On SyntaxError / FAILED TO LOAD: STOP and report.

## Follow-ups still logged (not this addendum)
- findSymbols space-sentinel (`' '.repeat` → `'\x00'.repeat`).
- eval_dump.js scratch write in verify_v19.mjs.
- Rename INV-S2/S3 check-label strings (they still say "<title>" though the mechanism is now data-tooltip — cosmetic but misleading in pass/fail output).
- v16 parity slice.
- Frank to ratify: CURVE_DEFS wording, and the drawAxes axis-label tooltip expansion.
