# Spec: Rewire `macro-model-verification` skill to use the root verifiers

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER` (the project root containing `verify_v16.mjs`, `verify_v19.mjs`, and the model HTML files).
**Type of change:** Rewire a skill + delete one stale file. Do **not** modify `verify_v16.mjs` or `verify_v19.mjs` themselves.

---

## Background / why

The skill at `.agents/skills/macro-model-verification/` currently bundles its OWN harness, `verify_invariants.mjs` — a consolidated, OLDER design that runs ~5 checks per model. The project's real harnesses are the split, current files at the repo root: `verify_v16.mjs` (22 assertions) and `verify_v19.mjs` (30 assertions, including drag-handler coverage and self-tests).

Consequence of the drift: when the skill triggers, the automated check runs the thin bundled harness and prints "ALL GREEN" while testing roughly a sixth of what the root verifiers test. This is a false-confidence gate. We want exactly ONE harness — the root verifiers — and the skill should invoke those, never carry its own copy.

## What to do

1. **Repoint the skill to the root verifiers.** Edit the skill's instruction/manifest files (`SKILL.md` and any runner config in `.agents/skills/macro-model-verification/`) so that when the skill triggers, it runs BOTH root verifiers and requires BOTH to exit cleanly:
   - `node verify_v16.mjs`
   - `node verify_v19.mjs`
   - **Both must pass.** A non-zero exit, any `FAIL` line, or a crash in either = the skill reports failure. Do not report success unless both runs are fully green.

2. **Resolve the path robustly — do not assume the working directory.** The skill must locate the verifiers at the repo root regardless of where Antigravity's CWD is when the skill fires. Resolve relative to the repo root (the skill is at `<root>/.agents/skills/macro-model-verification/`, so the root is three levels up), or search upward for the directory containing `verify_v19.mjs`. Do NOT hardcode an absolute Windows path. If the verifiers cannot be found, the skill must FAIL loudly with a clear message ("root verifiers not found"), never silently pass.

3. **Confirm both verifiers exit non-zero on failure.** Before relying on exit codes, verify that `verify_v16.mjs` and `verify_v19.mjs` actually call `process.exit(1)` (or equivalent) when an assertion fails. If they currently only print `FAIL` lines without setting a non-zero exit code, report this back — do NOT modify the verifiers to fix it as part of this change; flag it as a follow-up so a human decides. (We don't want a gate that reads exit codes the verifiers never set.)

4. **Delete the bundled harness.** Once the skill is rewired and confirmed working, delete `.agents/skills/macro-model-verification/verify_invariants.mjs`. It is the stale consolidated harness and is no longer wired into anything. Confirm nothing else in the skill references it before deleting.

## Acceptance check (report this back)

- Trigger the skill (or run its command path manually) and show the output. It must run BOTH `verify_v16.mjs` and `verify_v19.mjs` and require both green.
- Show that `.agents/skills/macro-model-verification/verify_invariants.mjs` no longer exists.
- Show the result of a deliberately-failing case if cheap to construct (e.g. point at a nonexistent HTML) to prove the skill FAILS rather than silently passing — analogous to the BAD-fixture self-test already in the verifiers. If constructing this is expensive, skip it but say so.

## Guardrails / out of scope

- Do **not** edit `verify_v16.mjs` or `verify_v19.mjs` logic. This change only rewires the skill and deletes the stale copy.
- Do **not** widen any tolerance or alter any assertion.
- Do **not** create a new consolidated harness to "replace" the deleted one. Single source of truth = the two root verifiers.
- If anything about the skill's trigger registration would change as a side effect, report it rather than silently re-registering.
