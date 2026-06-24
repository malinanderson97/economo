# Spec — Item C + §9.3: Help-mode hover-to-define + Blanchard equation references

**Status:** DRAFT (for Antigravity; Malin runs verifiers; Malin commits)
**Source of truth:** `Model_Textbook_Correspondence.docx` §9.2 (hover-to-define) and §9.3 (equation references). This spec lifts both directly.
**Targets:** BOTH `islm_pc_model_v19_Open_Economy_Complete_Demo.html` and `islm_pc_model_v16_Closed_Economy_MediumRun.html`. The symbol→definition map and the wrap mechanism are shared logic; per the doc, "a single symbol→definition map shared by both variants."
**Verifiers:** `verify_onboarding.mjs` (v19 equation-panel assertions), `verify_v16.mjs`, `verify_v19.mjs`. Add assertions; do NOT weaken existing ones.
**Agent guardrails:** Do NOT touch any `.docx`. Do NOT run `git`. Do NOT touch the engine (`solve`, `computeYn`, `isOutput`, `isRateForOutput`, coefficients) — this slice is display-only. No new `state` fields. No new sliders or def entries that feed the engine. Never use `Set-Content` on either HTML file. Implement v19 first, get it green, then port the identical shared logic to v16.

---

## 0. Two features, one slice (both decorate the equation/label surfaces)

**Feature 1 (§9.2) — Help-mode hover-to-define.** A toggle, **off by default**. When ON, hovering any *symbol* anywhere in the UI (equations, chart labels, readouts, slider names) surfaces a tooltip with: the symbol's meaning, its Blanchard equation reference, and its role in the tool. When OFF, no tooltips, no visual change, zero clutter.

**Feature 2 (§9.3) — Equation references.** Each line in every "Show the equations behind this chart" panel gets the Blanchard equation number, right-aligned to the edge of the box. Always on (not gated by help-mode). Each line reads: label → symbolic → numeric → result → (right-aligned) eq. number.

They ship together because both are render-time decorations of the same equation panels and share no engine risk.

---

## 1. Hard invariants (stated in advance)

- **INV-C1 (off by default, truly off).** On load, help-mode is OFF: no `.help-mode` active state, and no symbol span exposes a tooltip (no `title`/tooltip element shown) when OFF. Assert: with help-mode off, the rendered equation HTML contains hoverable symbol spans but none are in the active/tooltip-bearing state; toggling on flips a single root-level state (e.g. a class on a container), not per-span rewrites.
- **INV-C2 (single shared definition map).** Exactly one `SYMBOL_DEFS` object is the source of every definition. No inline definition strings scattered in render code. Assert (static): definitions referenced by the wrap helper resolve through `SYMBOL_DEFS`; a symbol with no entry is not silently wrapped as definable.
- **INV-C3 (no orphan symbols / no orphan defs).** Every symbol token the equation panels actually emit and mark definable has an entry in `SYMBOL_DEFS`; conversely flag (warn, not fail) defs never used. Assert: for the v19 equation panels at full unlock, every definable token resolves to a non-empty definition. BAD-fixture: remove one def entry → an emitted symbol becomes undefined → caught.
- **INV-C4 (display-only / engine untouched).** Wrapping symbols and inserting eq-refs does not change `solve(state)` or any `eq.*` value, and help-mode toggling does not either. Assert: `solve(state)` deep-equal with help-mode off vs on; eq-results identical before/after wrap. (Carry forward: v19 INV-S3-D headless exports unchanged; v16/v19 baseline assertions unchanged.)
- **INV-93-1 (every eq-line carries a reference).** In every equation panel, for every rendered `.eq-line`, a right-aligned reference element is present and non-empty, with the eq-number matching the §9.3 mapping for that line's `data-term`. Assert per panel. BAD-fixture: a line with a missing or wrong-mapped ref → caught.
- **INV-93-2 (reference map matches the doc).** The line→eq-number map equals the §9.3 mapping exactly (see §3.2). Assert against a recorded table. (This is the "display strings must reconcile" rule applied to references.)
- **No layout regression.** The existing assertions that `#readout` follows the charts, eq-line reconciliation (INV-6/8/9), colour binding (EQ_COL), and drill invariants all stay green. The eq-ref span sits as a trailing right-aligned element in the existing flex row; it must not disturb the label/sym/num/result layout the reconciliation assertions read.

---## 1a. HEADLESS-SAFETY (mandatory — this slice broke on it once)

The verifiers (`verify_v19`, `verify_onboarding`) build a *headless slice* of the
HTML by extracting all <script> text and constructing it with `new Function(...)`.
If the script is not brace-balanced, or if top-level code touches the DOM, that
construction throws `SyntaxError: Unexpected end of input` / `FAILED TO LOAD ENGINE`
and EVERY headless verifier dies. A prior attempt did exactly this. Therefore:

- **HS-1 (brace balance).** Every edit must leave the <script> block brace-,
  paren-, and bracket-balanced. After EACH edit, before running anything else,
  check the script still constructs:
  `node -e "const h=require('fs').readFileSync('islm_pc_model_v19_Open_Economy_Complete_Demo.html','utf8');const s=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');new Function(s);console.log('CONSTRUCTS OK')"`
  If it does not print CONSTRUCTS OK, the edit is broken — fix the braces, do not proceed.

- **HS-2 (headless-safe placement).** `SYMBOL_DEFS` and `wrapSymbols` must be PURE:
  plain data + string manipulation only. No `document`, no `window`, no DOM calls at
  definition time. They must sit in the headless region (above `function buildSliders`,
  alongside the other engine-region helpers), so the headless slice still constructs.
  Tooltip wiring that DOES touch the DOM goes in the DOM region (at/after buildSliders),
  never at top level.

- **HS-3 (STOP on load failure).** If any verifier prints `SyntaxError`,
  `Unexpected end of input`, `FAILED TO LOAD`, or `DOM Stub Run Failed`: STOP.
  Paste the full error. Do NOT create debug files, do NOT write a replacement harness,
  do NOT reconstruct the headless slice, do NOT use Set-Content. A red verifier is a
  signal to report, not to route around.


## 2. Symbol set (from §9.2; the tokens the panels emit)

The doc names: π, α, πᵉ, θ, Yₙ, c₁, d₁ᵣ, m₁, k_open, uₙ. The equation panels (from `drawEquations`) additionally emit: c₀, d₀, d₁, x₁, n₁, ε, Y, T, G, r, i, i_N, φ, ψ, π*, Y*, NX, C, I. The `SYMBOL_DEFS` map must cover **every token that gets wrapped as definable** (INV-C3). Each entry: `{ meaning, ref (Blanchard eq.), role }`. Definitions draw on the correspondence doc (e.g. `r` → "real interest rate; r = i − πᵉ; eq. 6.4; the rate that enters investment"). Symbols absent from a given variant (e.g. money-demand symbols are v16-only; ε/UIP symbols v19-only) are simply not emitted there, so the shared map is a superset and each variant wraps only what it renders.

---

## 3. Mechanism (how — this is the part that must not be hand-scattered)

### 3.1 Help-mode + wrapping (one helper, one toggle)
1. **One `SYMBOL_DEFS` map**, shared (defined once; identical in both files). Keyed by the canonical symbol token.
2. **One `wrapSymbols(htmlOrText)` helper** that turns definable tokens into `<span class="sym" data-sym="π">π</span>`. It is the ONLY thing that produces definable spans. Render code calls `wrapSymbols(...)` at the points that emit symbol-bearing text — it does NOT hand-write `<span class="sym">` anywhere. This satisfies INV-C2 and keeps wrapping consistent across the render paths that rebuild each cycle (the order-fragility lesson: one mechanism, not per-site).
3. **The toggle flips ONE root state** — a `.help-mode` class on a top-level container (or a boolean read by CSS). Tooltip visibility is pure CSS/hover driven by that root class: `.help-mode .sym:hover::after { content: attr(data-tooltip); ... }` or an equivalent single tooltip element. Toggling does NOT re-run `wrapSymbols` or rewrite spans (INV-C1). Off by default.
4. **Tooltip content** is read from `SYMBOL_DEFS[token]` — either pre-baked into `data-tooltip` at wrap time, or looked up on hover. Either is fine provided the source is `SYMBOL_DEFS` (INV-C2).
5. **Surfaces (the "everywhere" requirement):** apply `wrapSymbols` at — (a) `drawEquations` `eq-sym`/`eq-lbl` content; (b) chart legend/label strings; (c) the readout panel; (d) slider name labels. Implement (a) first (it's the densest and the verifier's main hook), then (b)/(c)/(d). Each is a call site of the same helper.

### 3.2 Equation references (§9.3 map, keyed by `data-term`)
Each `.eq-line` already carries `data-term`. Drive the ref from a `EQ_REF` map keyed by `data-term` (and panel where a term differs by panel). The doc's mapping, lifted directly:

| line / term | Blanchard eq. |
|---|---|
| consumption C | 3.3 |
| investment I | 5.1 / 9.1 |
| identity Y = C + I + G | 9.1 |
| real rate r = i − πᵉ | 6.4 |
| money demand M/P = Y·L(i) (v16 only) | 5.3 |
| Taylor rule / MP | Ch. 23 |
| Phillips π = πᵉ + α(Y−Yₙ)/Yₙ + … | 9.3 (expectations 8.7, natural rate 8.4) |
| UIP E = Eᵉ(1+i)/(1+i*) (v19) | 19.5 |
| net exports / open IS (v19) | 19.1 / 19.2 |

Insertion: append one `<span class="eq-ref">…</span>` per `.eq-line`, right-aligned (flex `margin-left:auto` or equivalent) so it sits at the box edge without disturbing the existing label/sym/num/result row. Always rendered (not help-mode gated).

---

## 4. Verifier additions

**v19 (`verify_onboarding.mjs`, equation-panel hook):**
- INV-C1: render eq panel, help-mode off → assert symbol spans exist (`class="sym"`) but no active-tooltip state; flip the root class → assert active state, no span rewrite (span count identical).
- INV-C3: at full unlock, collect every `data-sym` the panel emits; assert each resolves to a non-empty `SYMBOL_DEFS` entry. BAD-fixture: delete one entry → caught.
- INV-C4: `solve(state)` deep-equal help-off vs help-on; eq-results unchanged after wrap. INV-S3-D still green.
- INV-93-1: every `.eq-line` has a non-empty `.eq-ref`; its value matches `EQ_REF[data-term]`. BAD-fixture: blank a ref, and mis-map a ref → both caught.
- INV-93-2: `EQ_REF` equals the §3.2 table.
- Confirm INV-6/8/9, EQ_COL, drill invariants, layout assertion all still green.

**v16 (`verify_v16.mjs`):** port the INV-C1/C3/C4 and INV-93-1/2 equivalents for the closed-economy panels (money-demand line present → ref 5.3; no UIP/NX lines). Confirm the 22 existing assertions stay green.

**v19 engine (`verify_v19.mjs`):** confirm the 40 stay green (this slice must not perturb them at all).

Target: all three verifiers green, counts up only by the new assertions, engine counts unchanged.

---

## 5. Eyeball check (visual; beyond verifier-green)

- Help-mode off by default: equations look exactly as now; hovering a symbol does nothing.
- Toggle on: hover `π`, `α`, `Yₙ`, `c₁`, `d₁ᵣ`, `k_open`, `ε`, `r` → correct definition + eq-ref + role appears; works in equations, on slider names, in the readout, on chart labels.
- Toggle off again: tooltips gone, no leftover state.
- Every equation line shows its Blanchard number right-aligned at the box edge; numbers match the table (consumption 3.3, identity 9.1, r 6.4, Phillips 9.3, UIP 19.5, etc.).
- v16: money-demand line shows 5.3; no UIP/NX lines; help-mode works identically.
- Long lines: the right-aligned ref doesn't break the existing horizontal-scroll layout.

## 6. Out of scope
- Definitions for symbols not emitted anywhere (don't pre-populate dead entries beyond the shared superset).
- Restyling the equation panels beyond adding the ref span and the sym spans.
- Any engine or curve change.

## 7. Definition of done
1. `verify_onboarding.mjs`, `verify_v16.mjs`, `verify_v19.mjs` all green; engine counts (v16 22, v19 40) unchanged; onboarding up only by new assertions.
2. §5 eyeball checks hold in BOTH variants.
3. Malin commits (agent does not), then archive this spec to `_ARCHIVE_specs/`.
