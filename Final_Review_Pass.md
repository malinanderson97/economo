# Economo — Final Review Pass (pre-sign-off)

**Context for the reviewer:** This tool is at sign-off. The Model–Textbook
Correspondence doc is the source of truth and has been heavily reviewed — do not
re-litigate it; only check the *other* files against it. The engine is
`islm_pc_model_v19_Open_Economy_Complete_Demo.html`. Verify every claim against the
actual engine file, never from memory. If the project knowledge base is loaded from
an older commit than the live repo, its engine copy may be stale — re-upload current
files before trusting any engine-level claim. If a file's behaviour surprises you,
re-read the file before concluding.

## Step 0 — Make sure you're reviewing the current files
Re-upload the current versions into the project knowledge base, overwriting any stale
copies: the engine HTML, `verify_v19.mjs`, `verify_onboarding.mjs`, the Instructor
Manual, the Tool Overview one-pager, and the Correspondence doc. Overwriting with the
current version is harmless; reviewing a stale copy is not.

## Gate 1 — Verifiers (machine truth)
Run all three green on the current committed files: `verify_v19.mjs` (expect 58/0),
`verify_onboarding.mjs` (expect 116/0), `mutation_check.mjs` (expect all mutations
caught). The mutation check matters most — it proves the other two can actually go red.
If any count differs from expected, stop and investigate before anything else.

## Gate 2 — Browser pass (the thing no verifier sees)
Every check is headless; none looks at a rendered graph.
- Click through all six presets. For each: Load → step forward ~15 periods → does the
  graph match the narrative? Watch preset 1 (ZLB pinning under φ=0.5) and preset 3
  (settles *above* 2%, does not disinflate to target — this is correct; the narrative
  says so).
- Change stage via the dropdown and confirm equation panels redraw (the
  `goToStage`→`render()` fix). Stale panels on stage change is the classic
  "green but wrong."
- Confirm the Fisher line appears *only* after PC unlocks, never before.
- Toggle Help Mode; confirm symbol tooltips populate.

## Gate 3 — Doc/engine consistency
The manual and one-pager were reconciled to the Correspondence doc. Spot-check they
still agree with the *engine* (not just each other) on the load-bearing facts, and grep
the engine to confirm rather than trusting the docs:
- θ convention: θ=0 anchored, θ=1 adaptive; slider shows "Max credibility (1−θ)".
- Stage numbering 1–4.
- `shock` (transitory) vs `z` (structural wage-push) naming.
- Two α's: PC slope α (slider, default 0.30, cap 0.50) vs α_WS = 3.0 (fixed).
- Taylor smoothing ρ = 0.75, ψ = 0.25.

## Gate 4 — The doc set beyond the two reconciled files
The Master Plan and any other companion docs were NOT touched this session. Check
whether they still carry old θ language ("max anchoring"), old stage numbers (0–3), or
`z` for the transitory shock. If two docs disagree side by side, it undercuts the
fidelity pitch. Most likely place stale content is hiding.

## Gate 5 — Git hygiene
`git status` clean, `git log` shows this session's work as real commits, `git diff`
empty. Nothing important sitting uncommitted where one `git restore` loses it.

## Do NOT re-do
- The Correspondence doc (source of truth, already reviewed).
- The preset α / purity fixes (committed and verified).
- The AGENTS.md rules.

---
*Gates 2 and 4 are where content is most likely still hiding — they are the two the
machine can't cover and the two least-touched at sign-off.*
