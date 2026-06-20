# Working rules for this repo

This file is read on opening the repo. It is the short list of non-negotiables.
Everything here is enforceable and short on purpose — if it grows past one screen,
move a rule into a verifier instead of adding sentences here.

The hard part of this project is **economic correctness, not HTML/JS**. The engine
can be syntactically perfect and economically wrong in ways that look plausible.
"Looks plausible" is the failure mode this whole repo is built to catch.

## The five rules

1. **Green-before-done.** After any change to `solve()` or `step()` in either model,
   run BOTH verifiers and require a fully green result before the change is complete:
   ```
   node verify_v16.mjs
   node verify_v19.mjs
   ```
   Expected state: `verify_v16.mjs` → 22 passed, 0 failed. `verify_v19.mjs` → 30 passed,
   0 failed. A lower passed-count means a check was removed or skipped — investigate, do
   not proceed.

2. **Never weaken a check to make it pass.** Do not widen a tolerance, change an expected
   value (e.g. `k=2.5`), or comment out an assertion to turn a check green. If an invariant
   is genuinely meant to change, that is a human decision, recorded in
   `Model_Textbook_Correspondence` first, and the verifier is updated deliberately and
   reviewed as carefully as the engine. A green run *after a verifier edit* means nothing
   until a human has read the verifier diff.

3. **Never `Set-Content` the model HTML.** The HTML files hold Unicode (Greek letters,
   subscripts, arrows). PowerShell `Set-Content` has destroyed that Unicode before. Any
   encoding repair is a one-shot verify-before-save operation. (Writing small fresh text
   files like `.gitignore` is fine; editing the models with `Set-Content` is not.)

4. **The correspondence doc is the economic source of truth; the verifiers enforce it.**
   For any question about whether a mechanism matches the textbook, consult
   `Model_Textbook_Correspondence` before changing the engine. The verifiers are the
   machine-checkable shadow of that document.

5. **Scope edits narrowly.** Work on the named function, not "fix the IS curve." Small,
   named, single-purpose changes produce fewer silent errors and cheaper reverts.

## Two AI systems agreeing is not verification

Verifier-green is the gate, not agent self-report and not a second model's agreement.
A green signal is only as trustworthy as the last time someone confirmed it can go red —
see `mutation_check.mjs`, which deliberately breaks the engine and confirms the verifiers
catch it. Run it after any big refactor.

## Backups

The repo is under Git. Snapshot after every green verifier run
(`git add -A` then `git commit -m "..."`). Recover a bad change with `git restore .`.
