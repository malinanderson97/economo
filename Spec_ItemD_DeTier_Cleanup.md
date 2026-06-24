Spec: Item D — De-tier & code-tidy cleanup
Goal
Remove stale free/paid "tier" framing across code and docs (the product is one progressive tool per Master Plan §7), keep the closed/open economy distinction, and clear two leftover code-tidy items from the Item C session. Low-risk, multi-file. No engine/economics changes.
Invariant (stated in advance)
After this slice, a repo-wide search for the word tier (case-insensitive) returns zero matches in: both HTML files, README, and the Correspondence doc text. The strings "closed economy" and "open economy" remain present as economy-type labels. Verifier counts unchanged: onboarding 78 / v16 32 / v19 40.
Scope checklist (every item must be ticked; report each)
Code — v19 (islm_pc_model_v19_Open_Economy_Complete_Demo.html):

1. formatStateExport() header line (v19, paid tier, open economy) → (v19, open economy).

2. <h1> tier-badge text paid tier · open economy → open economy.

3. Remove unused function syncDynamicsParams (confirmed dead — grep for any caller first; if a caller exists, STOP and report rather than deleting).

Code — v16 (islm_pc_model_v16_Closed_Economy_MediumRun.html):

4. <h1> tier-badge text free tier · closed economy → closed economy.

5. Check v16's formatStateExport() (or equivalent export) for any "tier"/"free" string → fix to match.

6. syncDynamicsParams — does v16 have the same dead function? Earlier diffs showed v16 had a different syncDynamicsParams (shock-indicator version). Grep v16; if it's dead, remove; if called, leave and report.
Note on .tier-badge CSS class: the class name can stay (renaming it is needless churn and touches the badge styling); only the displayed text changes. Confirm the badge still renders the economy label with its existing style.
Docs:

7. README — sweep for tier/free/paid language, rewrite to single-progressive-tool framing. Do NOT invent new framing; mirror Master Plan §7.

8. Correspondence doc (Model_Textbook_Correspondence_text.txt is the editable source; the .docx is generated/formatted) — same sweep. Edit the .txt; flag if the .docx needs regenerating (that may be a manual step outside the agent).

9. Master Plan — do NOT edit; it is the source of truth and already says single-tool.
Acceptance

Invariant search for "tier" returns zero in the four targets; "closed economy"/"open economy" still present.
HS-1 on both HTML files passes.
All three verifiers green at 78/32/40 (the export-header change may touch a string a verifier checks — if any count moves, report which assertion and why before proceeding; do NOT weaken it).
Browser: both files load, h1 badge reads "open economy" / "closed economy", Copy-state export header reads de-tiered.
Report every checklist item 1–10 with its outcome (changed / not-present / left-with-reason).

Process guardrails (per AGENTS.md + session lessons)

Agent: read-only git only; never restore/checkout/reset/add/commit/rm/stash. Human commits.
No scratch/patch/debug files; never redirect command output to a file.
Never use Set-Content on the HTML files (destroys Unicode).
Review diffs as surgical; this is a string/text + two-function cleanup — any change touching engine logic, solve(), or curve-drawing math beyond item 4 is out of scope → STOP and report.

