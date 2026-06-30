# Working rules for this repo — implementation / UI side

**Model scope boundary: Blanchard mechanics frozen; scenarios/content may grow.
Engine changes → future models. See Decision_Log_Model_Scope.md.**

Read on opening the repo, by the agent doing the building. **Engine rules live in
`CLAUDE.md` and the `macro-model-verification` skill** — read those before any
`solve()`/`step()`/coefficient change. This file covers everything else: layout, the
equation boxes, the onboarding state layer, and the `verify_onboarding.mjs` verifier.

Same discipline as `CLAUDE.md`: short and enforceable. If a rule can become a verifier
check, put it in `verify_onboarding.mjs` instead of adding sentences here.

The failure mode on this side is **"engine-correct but diagram/display-wrong."** The
engine verifiers check numbers, not how things are drawn, laid out, or printed — so
these get their own checks *and* your eyes.

## Gates

1. **Verifier-green is the gate** — and on this side that includes `verify_onboarding.mjs`
   (78/0) alongside `verify_v16.mjs` (32/0) and `verify_v19.mjs` (40/0). Not self-report,
   not a screenshot, not two AIs agreeing. (Counts current as of Item D; they grow as
   invariants are added — the point is 0 failures, not a fixed number.)
2. **Never weaken a check to go green** (mirrors `CLAUDE.md` rule 2). When a spec changes
   a fact (e.g. an element moves), *flip* the assertion so it stays true — never delete it.
3. **Scope narrowly** — the named change, not "fix the layout."
4. **`verify_onboarding.mjs` is one growing file — extend it, don't fork it.** Every new
   invariant gets a BAD-fixture that proves the check can go red.

## Visual & layout — EYEBALL-GATED (verifier-green is necessary but NOT sufficient; browser-check before commit)

5. **Measure, don't estimate.** Size-to-fit by measuring and shrinking until content fits
   (`while scrollHeight > clientHeight: shrink`), never by computing estimated heights of
   titles/legends/gaps. Two layout bugs came from estimating.
6. **Freeze a measured value; don't recompute it while a dependent panel is open.** Opening
   an equation dropdown must not resize a graph — freeze the height and switch the page to
   scroll. Recompute only when everything's closed again.
7. **Curves get `pointer-events: none`** so drag handles catch clicks (pre-existing dead-handle bug).
8. **Class-based `.locked` gating on SVG that is rebuilt every render is order-fragile** —
   prefer driving interactivity from the state object at draw time.

## Equation display — MUST reconcile to the engine

9. **Never hardcode a coefficient the engine computes.** Interpolate every input from live
   state/constants; the shown "formula = numbers = result" must arithmetically reconcile,
   AND the result must equal the engine's value for that term. (The `verify_onboarding.mjs`
   reconciliation check enforces this — display strings drifted from the engine once already.)
10. **Display labels are user-facing; internal keys are not.** User-facing text follows
    Blanchard (ISLM, LM). Internal identifiers (e.g. `EQ_COL.MP`, `curve-*`) may keep their
    names — do not conflate a display rename with a key rename, and don't widen a rename's
    blast radius without reason.

## State & verifiability

11. **Tutorial/UI state lives in an inspectable object (`tutorialState`) with named
    transition functions — never in DOM event handlers.** If state lives only in the DOM it
    isn't headless-verifiable and the change has failed.
12. **Onboarding gating** (locks, greying, warning chips, time-controls) is driven from
    `tutorialState.unlocked`, not parallel flags. Anything conceptually belonging to a block
    is gated to that block.

## Environment (PowerShell)

13. `cd` to the repo first (PowerShell opens in system32). Chain with `;` not `&&`. Use
    `Copy-Item -Force` (not `copy /y`) and `fc.exe` (not `fc`). **Never `Set-Content` the
    model HTML** (mirrors `CLAUDE.md` rule 3 — it destroys the Unicode). See rule 15 for git.

## Specs

14. Implement to the **mechanism the spec prescribes**, not just its described behaviour —
    behavioural-only specs got misimplemented (the layout saga). If a spec is only
    behavioural and the mechanism is unclear, ask rather than guess.

## Git — the human commits, never the agent

15. **Run NO git commands. Ever.** No `commit`, no `add`, no `restore`, no `reset`
    (especially not `reset --hard`), no `checkout`, no `stash`, no `clean` — nothing that
    stages, commits, or rewrites history or the working tree. Make file edits only. After a
    change, report what changed and paste the verifier output, then STOP. The human runs the
    verifiers and commits. This is deliberate: verifier-green is the gate, and the commit is
    the human's act of confirming the gate passed — not the agent asserting its own work is
    good. An agent committing or restoring its own changes bypasses the gate. If you think a
    commit is warranted, suggest the message; do not run it. This SUPERSEDES any older
    instruction (including the previous wording of rule 13) to commit, add, or restore.
    **This ban is not about danger, it is about authority** — it includes commands that look
    harmless or "recovery" (`git restore`, `git checkout -- <file>`, `git stash`) just as
    much as destructive ones. If the working tree is broken, dirty, or in an unexpected
    state, do NOT try to fix it with git — STOP and report what you see; restoring or
    resetting state is the human's decision, made after reading `git status`. "I was just
    cleaning up / getting back to a known state" is exactly the action that is forbidden.
    (Violated in the Item C session: the agent ran `git restore .` unprompted.)

16. **No scratch, patch, debug, or temp files in the repo — and never redirect command
    output to a file.** Do not create `diff_*.patch`, `test_*.mjs`, scratch `.md` notes, or
    any helper file the task did not explicitly ask for; do not run `git diff > file`,
    `... > out.txt`, or any redirect that writes into the working tree — print to stdout and
    paste it in your report instead. Stray files pollute `git status` and risk being swept
    into a commit. (Violated twice in the Item C session: `diff_v16.patch` / `diff_v19.patch`
    and a `test_repl.mjs` scratch file.) Any genuinely needed temp file goes outside the
    repo, never under the repo root.
