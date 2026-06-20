# Spec: <short title of the change>

<!--
  Copy this file, rename it (e.g. SPEC_open_econ_theta_fix.md), fill it in, and hand
  it to Antigravity as the task. The point of the template is the last section: a change
  is not specified until you have written down the check that must pass afterward. That
  one sentence is what turns "looks plausible" into "passes an invariant I defined in
  advance." Delete these comments before handing it over.
-->

## 1. Goal (one sentence)
<What should be true after this change that is not true now.>

## 2. Which model(s) and which function(s)
<e.g. v19 only, inside `solve()` — the UIP block. Name the function, not "the IS curve".>

## 3. The economics (anchor to the textbook)
<What Blanchard says. Cite the chapter/equation number from
Model_Textbook_Correspondence. If this changes an existing documented mechanism, say so
explicitly — that is the kind of change that needs a human decision recorded in the
correspondence doc BEFORE the code changes.>

## 4. What must NOT change
<The blast-radius limit. e.g. "Baseline Y=100, i=3% must be untouched. v16 must not be
edited at all. No slider/handler behaviour changes." This is how you stop a scoped fix
from quietly altering something else.>

## 5. The invariant(s) that must hold afterward  ← the whole point of this spec
<Write the concrete, checkable condition(s). Examples:
  - "verify_v19.mjs still 30/0, AND a new check: after a +1 G shock, real ε rises by >0.01 over 100 periods."
  - "k_o stays ≈1.43 at baseline; ΔY = +1.43·ΔG holds to tol 0.05."
If the invariant isn't already a verifier check, add it to the relevant verify_*.mjs as
part of this change (see CLAUDE.md rule 1 — every caught error becomes a check). A spec
with this section blank is not ready to hand over.>

## 6. Done criteria
- [ ] Both verifiers green (`verify_v16.mjs` 22/0, `verify_v19.mjs` 30/0 — or the new
      expected counts if this change adds checks; state the new numbers here).
- [ ] The new invariant from §5 is encoded as a verifier assertion, not just checked by hand.
- [ ] `mutation_check.mjs` still passes (the verifiers can still catch a deliberately broken engine).
- [ ] Committed: `git add -A && git commit -m "<message>"`.
