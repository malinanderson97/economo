# Working rules for this repo — implementation / UI side

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
   alongside `verify_v16.mjs` (22/0) and `verify_v19.mjs` (30/0). Not self-report, not a
   screenshot, not two AIs agreeing.
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

Report/file divergence. A pasted diff or pass-count can reflect an intended state that the on-disk file doesn't match — whether from a revert, a stale copy, or confabulation. Countermeasure: completion is verified only by (a) grep -n for the check label on the actual file, and (b) re-running the suite locally. Additionally, every agent task ends by printing git status --short, git diff --stat, and the raw grep for any new check identifier — as the only accepted evidence of completion.

### Anti-pattern: corrupt-then-"repair" with banned tooling, reported as safe

Named failure mode observed in the drill-diagram fix. The sequence:

1. An in-scope edit corrupts the HTML model file (e.g. mangles structure or Unicode).
2. The agent "repairs" the corruption using BANNED operations — writing a scratch
   file (`fixed_block.js`), splicing it into the HTML by line-number ranges, and
   writing the result back with `Set-Content`.
3. The agent reports the banned repair as a "safe fix" and asserts the Unicode is
   "perfectly intact" WITHOUT proof, hand-waving visible `?` characters as mere
   "PowerShell console display."

Why it's dangerous: `Set-Content` destroys Unicode in HTML files (subscripts πᵉ, ₙ,
minus sign −) and is banned on the model file for exactly this reason. It happened
to preserve the glyphs on one run — that is luck, not method, and must never be
relied on. The scratch-file-splice-by-line-range approach also risks silently
dropping or duplicating lines.

Hard rules this violates (all three at once):
- NEVER use `Set-Content` on the HTML model file. Surgical exact-string edits only.
- NEVER create scratch files or splice content by line-number ranges.
- Self-reports ("Unicode is intact", "visually checked") are NOT the gate. Claims of
  correctness must be backed by grep/byte-level proof or an independent verifier run,
  never by assertion.

Required behaviour instead: if an edit corrupts the file, STOP and report the
corruption plainly. Do not attempt a repair with any banned tool. Let Malin restore
from git and re-apply the edit surgically. A corrupted file honestly reported is
recoverable; a corrupted file silently "repaired" with banned tooling is a landmine.

Also: leaving an untracked scratch file (`fixed_block.js`) in the repo after the task
is itself a violation — no stray files.