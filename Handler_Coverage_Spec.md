# Spec: Static coverage for interactive drag handlers (`HANDLES.*`)

**For:** Antigravity (implements in repo)
**Target file:** `verify_v19.mjs` (root harness). Mirror into `verify_v16.mjs` only after confirming v16 has analogous `HANDLES.*` handlers — check first, do not assume.
**Type of change:** Add new test block. Do **not** modify existing tests or widen any tolerance.

---

## Why this exists

A real bug shipped in `HANDLES.pc`: it used `eq.Y_n` but never defined `eq` locally. There is no module-scope `eq` for the handler to close over (every `eq` in the file is a function-local `const`), so dragging the PC handle threw `ReferenceError: eq is not defined` at runtime. The fix was a one-line `const eq = solve(state);` at the top of the handler.

The existing harness never caught this because it runs the model **engine** headlessly in Node and never touches the DOM drag handlers. This test closes that gap.

## Why static analysis, not execution

The `HANDLES.*` handlers:
- take screen-pixel coordinates (`sx, sy`),
- call `render()` and `syncControls()`, which require a live DOM,
- depend on chart-option objects (`opts_pc`, `opts_ismp`, etc.) populated only during draw.

The harness is headless (no DOM). So **do not execute the handlers.** Instead, extract each handler's source text from the HTML and assert structural correctness. This matches how the harness already ingests the model (reads the HTML as a string).

## What to assert

For the canonical file `islm_pc_model_v19_Open_Economy_Complete_Demo.html`:

1. **Enumerate handlers.** Find every `HANDLES.<name> = (…) => { … }` assignment. Capture `<name>` and the function body (balanced-brace match from the arrow `{` to its matching `}`).

2. **For each handler body, assert the "no undeclared `eq`" invariant:**
   - If the body contains any use of the bare identifier `eq` (word-boundary match, e.g. `eq.`, `eq[`, `eq)` , `eq ` — not `eqNow`, not `eqX`), then the body MUST also contain a local declaration of that exact identifier: `const eq = …` or `let eq = …`, appearing **before** the first use.
   - Same rule applied per-identifier for any solve-result alias actually used (e.g. `eqNow`): if `eqNow` is used, `const eqNow =`/`let eqNow =` must be declared locally first. Keep it general: for each candidate identifier the body reads as a solve result, require a matching local declaration before first use.
   - PASS if every used solve-result identifier is locally declared before use. FAIL (with the handler name + offending identifier) otherwise.

3. **Sanity assertion on handler count.** Assert at least 4 `HANDLES.*` handlers are found (currently: `is`, `mp`, `uip`, `pc`). If fewer, FAIL — it means the extraction regex broke or the file changed structurally, and a silent zero-handlers pass would be worse than useless.

## Expected result on current canonical file

All handlers PASS:
- `HANDLES.is` — uses `eqNow`, declared locally. ✓
- `HANDLES.mp` — uses no solve-result identifier. ✓ (vacuously passes)
- `HANDLES.uip` — uses no solve-result identifier. ✓ (vacuously passes)
- `HANDLES.pc` — uses `eq`, now declared locally (post-fix). ✓

If `HANDLES.pc` ever loses its local `const eq = solve(state);` again, this test must go red and name `pc` + `eq`.

## Implementation notes / guardrails

- **Do not** add a DOM shim or jsdom dependency for this. Pure string/regex analysis on the already-loaded HTML source.
- **Do not** alter the existing 23 assertions or the 5 self-tests. This is purely additive — new lines in the summary, e.g. `PASS 14 HANDLES.pc declares eq locally`.
- Brace-matching: a naive regex won't reliably capture a full handler body if any nested braces appear. Use a small balanced-brace scanner starting at the `=> {` of each handler. Verify the captured body for `HANDLES.pc` actually ends at the handler's closing `}` (it should include the `render();` call and stop before `// Time series chart`).
- Identifier matching must respect word boundaries so `eqNow`, `eqX`, `requestAnimationFrame`, etc. are never mistaken for `eq`. (Reminder: `requestAnimationFrame` contains the substring `eq` — word boundaries prevent a false match.)
- Report failures with enough detail to act on: handler name, offending identifier, and the snippet of the offending line.

## Self-test to add (mirrors existing `[SELF-TEST]` block)

Add one self-test that runs the analyzer against two inline fixture strings, to prove the analyzer itself works:
- a GOOD fixture: `HANDLES.x = (a,b)=>{ const eq = solve(s); return eq.Y_n; }` → must PASS.
- a BAD fixture: `HANDLES.y = (a,b)=>{ return eq.Y_n; }` → must FAIL (catches `eq` used without local declaration).

This guards against the analyzer silently passing everything (the classic dead-test failure mode).

## Out of scope (do not do in this change)

- Do **not** attempt to execute handlers or simulate drags.
- Do **not** refactor the handlers themselves.
- Do **not** touch the `.agents/skills/macro-model-verification/` copy in this change — that harness-drift question is tracked separately.
