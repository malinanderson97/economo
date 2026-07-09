# Spec: Gate the scenario picker until the full model (PC) is unlocked

## 1. Goal (one sentence)
The "Preset scenarios" section must be greyed out (visible but disabled) until the PC block is unlocked, so learners can only load presets once the full model is available — matching the fact that most scenarios exercise inflation/expectations/credibility machinery that is locked pre-PC.

## 2. Which model / function
`islm_pc_model_v19_Open_Economy_Complete_Demo.html` only — the `renderTutorial()` gating region (~2130, where the other `setLocked(...)` calls live). NO engine math; NO scenario changes; the `SCENARIOS` array is not touched.

## 3. Background
The scenario picker is `#sec-presets` (line ~341), containing `#scenario-select`, `#scenario-load-btn`, `#scenario-narrative`. It is currently ungated. The `.locked` class (opacity 0.25 + `pointer-events:none` + grayscale) is the house greying pattern, already applied to PC controls, Taylor/deanchor/shock, etc. `pcOn` (= `isUnlocked('PC')`) already exists in the render function. Gating is greyed-not-hidden, consistent with the rest of the sidebar.

## 4. What must NOT change
- No engine math; `SCENARIOS` untouched; `applyScenario`/`reset` (the just-committed context-aware reset) untouched.
- `#scenario-load-btn`'s own `disabled` logic in `previewScenario` unchanged — the `.locked` gate sits on top of it; both can coexist.
- Greyed, not hidden (do not `display:none` the section).
- verify_v19 55/0; verify_onboarding 101/0 (a new check may raise it).

## 5. The edit
In the `renderTutorial` gating block, next to the existing `pcOn` `setLocked` calls, add:
- `setLocked('#sec-presets', pcOn);`
This greys the whole Preset scenarios section (select + load button + narrative) until PC unlocks. Because `.locked` sets `pointer-events:none`, the greyed section can't be interacted with regardless of the load button's own disabled state.
(Confirm `pcOn` is in scope at the insertion point — it is, used by adjacent calls. Report the exact lines inserted into.)

## 6. Invariant
Extend the existing INV-6b-style gating check in verify_onboarding.mjs: at a PC-locked stage (e.g. `applyBlocks(['ISLM'])` or `['ISLM','UIP']`), assert `#sec-presets` carries `.locked`; at the Full stage (`['GOODS','ISLM','UIP','PC']`), assert it does NOT. Add a mutating BAD-fixture: remove the new `setLocked('#sec-presets', pcOn)` from a rebuilt source and confirm the PC-locked assertion goes red.
(Add `'sec-presets': fakeEl()` to the verifier's `specialEls` map if not already resolvable, so the id-based `setLocked` selector reaches it — mirror how `taylor-toggle`/`oil-shock-btn` are handled.)

Browser-check: at the closed IS-LM stage and the open UIP stage, the Preset scenarios section is greyed and the dropdown/load button can't be used. At the Full model stage, it lights up and scenarios load normally. Confirm a greyed dropdown genuinely doesn't open/select.

## 7. Done criteria
- [ ] verify_v19 55/0; verify_onboarding green (new total) with the sec-presets gating check + mutating BAD-fixture.
- [ ] mutation_check passes.
- [ ] No `DOM Stub Run Failed`/Error/ReferenceError anywhere in verifier output (paste full, top to bottom).
- [ ] Preset section greyed pre-PC, active at Full model; greyed section not interactable.
- [ ] Report exact lines the `setLocked` was inserted into.
- [ ] `git --no-pager diff` — engine HTML + verify_onboarding only; no engine-math, no SCENARIOS changes.
- [ ] Browser-check confirmed by human.
- [ ] Committed by human: suggested `ui: gate preset scenarios until full model (PC) unlocked; verifier check`.

## 8. Notes / decision
- Presets gated to PC-unlock: pedagogy/sequencing call (scenarios exercise PC-block machinery — πᵉ, credibility, Taylor — that is inert/hidden pre-PC, so loading one earlier would show a partial/confusing picture). Decided by Malin; low-stakes availability choice, not a model-mechanics change, so no Frank sign-off needed. Logged here for the record.
