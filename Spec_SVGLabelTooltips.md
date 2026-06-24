# Spec: SVG graph-label tooltips (help-mode hover-to-define for in-chart labels)

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER`
**Target file (this slice):** `islm_pc_model_v19_Open_Economy_Complete_Demo.html` (v19 only)
**Invariant home:** `verify_onboarding.mjs` (it already loads the v19 HTML and has a child-recording mock-SVG harness)
**Type of change:** Add SVG `<title>` tooltips to in-chart axis/curve labels, gated to help mode; refactor the symbol tokenizer into one shared helper. Additive + one latent-bug fix.
**v16 parity:** OUT OF SCOPE — separate follow-up slice once this is committed.

---

## Background / why

Item C shipped help-mode hover-to-define tooltips for **HTML** symbols via `wrapSymbols`, which emits `<span class="sym">…<span class="sym-pop">…</span>…</span>` and a CSS/JS hover popup gated on `document.body.classList.contains('help-mode')`.

The in-chart labels (Yₙ, IS, MP, UIP, πᵉ, PC, i*, uₙ, and compound labels like `π*=2%`, `i (nominal)`, `i, π`) are SVG `<text>` elements. They are **currently** set with `el('text', {...}, svg).innerHTML = wrapSymbols('Yₙ')`. An HTML `<span>` is not a valid child of an SVG `<text>` element — the `.sym-pop` hover tooltip never fires inside SVG, and the markup is invalid. The glyph still shows only because the span's text node survives. So today these labels are doing pointless string work and emitting invalid SVG, with a dead tooltip.

This slice gives those labels a working tooltip via the one mechanism that fits SVG cleanly — a native `<title>` child — and fixes the invalid-markup call sites in the same edit.

### Mechanism decision (decided, with reasons)

- **Chosen: native SVG `<title>` child, appended conditionally when help mode is ON, refreshed by a `render()` on help-toggle.**
- Rejected — HTML overlay layer: would require per-label `getBoundingClientRect` + viewport clamping + redraw wiring across every draw function on every `render()`/`redrawOpenDrills()`/`fitCharts()`. Highest fragility; the exact surface that has bitten this project. Styling parity with `.sym-pop` is not worth that risk for terse graph labels.
- Native `<title>` is always-on and **cannot be JS-suppressed at hover time**, so help-mode gating is achieved by **only appending the `<title>` when help mode is on, at draw time**. Because `toggleHelpMode()` does not currently re-render, this slice adds a single `render()` call to it so toggling help mode adds/removes titles on already-drawn charts.

### Compound-label handling (decided)

A `<text>` may hold only one effective `<title>`. For labels containing more than one recognized token (only real case: `i, π`), the single `<title>` concatenates **all** recognized tokens' definitions in label order, joined by ` | `. Labels with no `SYMBOL_DEFS` token (IS, MP, UIP, PC — these are curve names, not symbol keys) get **no** `<title>`. Adding IS/MP/UIP/PC as symbol keys is out of scope.

---

## What to do

### 1. Extract a shared tokenizer `findSymbols` (headless slice, above `buildSliders`)

Add, beside `wrapSymbols`:

```
function findSymbols(text) {
  // Returns an ordered, non-overlapping list of recognized symbols:
  //   [{ token, def, index }]  sorted by position of first match in `text`.
  // Uses the SAME rules wrapSymbols uses today:
  //   - longest-token-first (so 'π*' wins over 'π', 'πᵉ' over 'π', etc.)
  //   - word-boundary match when token is fully [a-zA-Z0-9_]; raw match otherwise
  //   - a character position already claimed by a longer token is not re-matched
  // Pure: no DOM, no side effects. Operates on a plain string (no HTML tags expected).
}
```

Then **refactor `wrapSymbols` to call `findSymbols`** for its token discovery, preserving its existing tag-skipping behavior (it splits on `/(<[^>]*>)/g` and only scans non-tag segments). The emitted HTML span markup must be **byte-for-byte identical** to today's output.

> If a clean refactor of `wrapSymbols` onto `findSymbols` risks changing output (e.g. because `wrapSymbols` scans HTML-with-tags while `findSymbols` scans plain text), keep `wrapSymbols`'s internal scanning as-is and have it share only the sorted-token list / per-token regex construction with `findSymbols`. **Do not change `wrapSymbols`'s output. The byte-identical invariant (INV-S1) is the gate.** If you cannot achieve sharing without risking the output, STOP and report — duplicate-but-correct is acceptable as a fallback only if you flag it for human decision; do not silently ship a behavior change.

### 2. Add `svgTitle` helper (headless slice, above `buildSliders`)

```
function svgTitle(textEl, label) {
  if (typeof document === 'undefined') return;          // headless no-op
  if (!document.body || !document.body.classList) return;
  if (!document.body.classList.contains('help-mode')) return;  // gated OFF when help is off
  const found = findSymbols(label);
  if (!found.length) return;                            // no recognized token → no title
  const text = found
    .map(f => f.def.meaning + '; ' + f.def.ref + '; ' + f.def.role)
    .join(' | ');
  const t = el('title', {}, textEl);                    // append exactly one <title>
  t.textContent = text;                                 // textContent → Unicode-safe, no innerHTML
}
```

- `el('title', {}, textEl)` uses the existing `createElementNS` SVG helper, so the `<title>` is an SVG element (correct for an SVG `<text>` parent).
- One `<title>` per call. Draw functions rebuild SVGs from scratch each `render()` (`svg.innerHTML = ''`), so there is no stale-title accumulation across renders.

> `svgTitle` reads `document.body.classList` — not strictly DOM-free, but guarded by `typeof document === 'undefined'` so it no-ops under the headless slice import (same guard the Boot region uses). This keeps the HS-1 construct-check green. **`el` is defined below this point in the file today — confirm `svgTitle` is only ever *called* from draw functions (which run after definition), never executed at module-eval time.** It is only referenced, not invoked, during headless import, so this is safe; verify by HS-1.

### 3. Convert the 16 label call sites

Each site currently of the form:

```
el('text', { ...attrs }, svg).innerHTML = wrapSymbols('Yₙ');
```

becomes:

```
const _t = el('text', { ...attrs }, svg);
_t.textContent = 'Yₙ';
svgTitle(_t, 'Yₙ');
```

(Use a local variable; do not chain, since two operations now follow the create.) The full list of sites in v19 (line numbers approximate, locate by the literal):

| Label literal | Function |
|---|---|
| `'Yₙ'` (×4) | drawISMP, drawPC, drawDrillPCChain (svgB and svgC sites) |
| `'IS'` | drawISMP |
| `'MP'` | drawISMP |
| `'i*'` | drawUIP |
| `'UIP'` | drawUIP |
| `'π*=2%'` | drawPC |
| `'πᵉ'` | drawPC |
| `'PC'` | drawPC |
| `'i (nominal)'` | drawDrillMP |
| `'r (real)'` | drawDrillMP |
| `'uₙ'` | drawDrillPCChain (svgA) |
| `'i, π'` | drawTimeSeries |

This **removes** `wrapSymbols(...)` from these SVG sites — that is the latent invalid-markup fix. **Do NOT touch `wrapSymbols` calls that target HTML elements** (readout, equation boxes, chips, multiplier line at ~1353 which writes to an HTML node — verify each is HTML before leaving it alone; if any of these is actually an SVG `<text>`, convert it too and report it).

### 4. Add `render()` to `toggleHelpMode()`

```
function toggleHelpMode() {
  document.body.classList.toggle('help-mode');
  const btn = document.getElementById('btn-help-mode');
  if (btn) btn.textContent = document.body.classList.contains('help-mode') ? '❓ Help Mode: ON' : '❓ Help Mode: OFF';
  render();   // <-- ADD: refresh charts so SVG titles appear/disappear with help mode
}
```

### 5. Verifier harness prep (`verify_onboarding.mjs`)

- **Upgrade the `body.classList` stub** (currently `body: { classList: { toggle(){}, add(){}, remove(){} } }` with no `contains`) to a set-backed, toggleable classList supporting `add/remove/toggle/contains`, so help-mode ON and OFF are both exercisable from the test.
- **Add `drawISMP`, `drawUIP`, `drawPC`, `drawTimeSeries` to the `testRender` return/destructure** so the test can invoke the real main-chart draws. (`drawDrillIS/MP/PCChain` are already exposed.)
- Confirm `createElementNS` returns the child-recording `fakeEl` (it does today via `appendChild(c){ this.children.push(c); }`), so appended `<title>` children are observable.

### 6. Add invariants (`verify_onboarding.mjs`)

**INV-S1 (refactor purity — byte-identical `wrapSymbols`).** For a fixed fixture set covering single tokens, compound (`π*=2%`, `i, π`, `i (nominal)`), HTML-with-tags input, and no-match strings, `wrapSymbols(x)` output equals a hardcoded expected string (or a snapshot captured from the pre-change build and pasted into the verifier). Also assert `findSymbols` is headless-importable and returns `[]` for a no-match string and the correct ordered tokens for `'i, π'`.

**INV-S2 (gating OFF).** With `body.classList` NOT containing `help-mode`, run `render()` (or the relevant draw functions) against the mock SVG; assert **no** captured `<text>` element has a child whose tag is `title`.

**INV-S3 (gating ON + content).** With `body.classList` containing `help-mode`, run the draws; assert every labeled `<text>` whose label contains ≥1 `SYMBOL_DEFS` token has **exactly one** `<title>` child whose `textContent` equals the expected concatenated-defs string; and that `'i, π'`'s title contains BOTH the `i` def and the `π` def joined by ` | `.

**INV-S4 (curve names get no title).** With help mode ON, assert the `IS`/`MP`/`UIP`/`PC` labels (no `SYMBOL_DEFS` key) have **no** `<title>` child — proving the no-match path.

**BAD-fixtures (must mutate real functions, not literals):**
- Mutate `svgTitle` to append the title unconditionally (ignore help-mode) → INV-S2 must FAIL.
- Mutate `svgTitle`/`findSymbols` to drop the second token of a compound → INV-S3's `i, π` both-defs check must FAIL.
- Mutate `wrapSymbols` output (e.g. change the span class) → INV-S1 must FAIL.

> Per the project rule: BAD-fixtures must sabotage the actual engine/helper functions and confirm the check catches it — not assert facts about literals.

---

## Acceptance check (report this back, do NOT commit)

1. **HS-1 construct-check** on the edited HTML — passes (headless slice still imports cleanly; `svgTitle`/`findSymbols` are above `buildSliders` and pure/guarded).
2. **All three verifiers** run and report counts: `verify_onboarding.mjs` must be **78 + (new INV-S1..S4 + BAD-fixtures) pass / 0 fail**; `verify_v16.mjs` **32 / 0** unchanged; `verify_v19.mjs` **40 / 0** unchanged. State the exact new onboarding count.
3. **`git status`** (read-only) — show no scratch/patch/debug files were created.
4. **`git --no-pager diff islm_pc_model_v19_Open_Economy_Complete_Demo.html`** and **`git --no-pager diff verify_onboarding.mjs`** — paste BOTH in full for surgical review. Explain every `-`/`+` hunk; the 16 label-site conversions, the two new helpers, the `wrapSymbols` refactor, the `toggleHelpMode` one-liner, and the harness/invariant additions should be the ONLY changes. Revert anything that rides along.
5. **Browser check (mandatory — verifiers cannot catch diagram-wrong):** open v19, toggle Help Mode ON, hover each in-chart label, confirm the native tooltip shows the right definition; confirm `i, π` shows both defs; toggle Help OFF and confirm tooltips disappear after the chart refreshes. Confirm no label glyph changed position or rendering vs before (textContent vs the old span text node should look identical).

---

## Guardrails / out of scope

- **v19 only.** v16 parity is a separate follow-up slice.
- **Do NOT change `wrapSymbols` output.** INV-S1 is the gate. If sharing the tokenizer risks the output, fall back to non-shared code and FLAG it; never silently change behavior.
- **Do NOT touch HTML-target `wrapSymbols` calls** (readout, equation boxes, chips). Only SVG `<text>` sites convert.
- **Do NOT add IS/MP/UIP/PC to `SYMBOL_DEFS`** in this slice.
- **Do NOT weaken or widen any existing verifier assertion.** Counts for v16/v19 stay exactly 32/40.
- **Antigravity git discipline:** read-only git only (`status`/`log`/`diff`/`show`). Never `restore`/`checkout`/`reset`/`add`/`commit`/`rm`/`stash`. The human owns all git and is the sole committer.
- **No scratch/debug files; no redirecting command output to a file; never `Set-Content` on the HTML.**
- On any SyntaxError / FAILED TO IMPORT / FAILED TO LOAD: **STOP and report immediately.** Do not chase with debug scaffolding.

## Separately flagged (NOT part of this slice — for human decision)

- `verify_v19.mjs` line ~33 contains `fs.writeFileSync('eval_dump.js', stub + scripts);` — this writes a scratch debug file to the repo on every run, violating the no-scratch-files rule. Recommend a one-line removal in its own tiny change. **Do not touch it in this slice** (out of scope; surgical).
- Curve-name tooltips (IS/MP/UIP/PC) would need `SYMBOL_DEFS` entries — defer.
