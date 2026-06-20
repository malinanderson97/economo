# Spec: Slice 1 — fix-up 6 (Taylor rule off by default + drag-blocked message)

**For:** Antigravity (implements in repo)
**Target file:** `islm_pc_model_v19_Open_Economy_Complete_Demo.html`
**Type of change:** Change a default + add a user message. Do **not** change the economics engine (`solve`/`step`/the Taylor rule math), the verifiers' logic, or any handle logic beyond what's described.

---

## Background / why

When the Taylor rule is ON, the central bank sets the rate *by the rule*, so `state.i` is recomputed each solve and dragging the MP line has no lasting effect (it snaps back — the target slider moves, but the actual rate is overwritten by the rule). This is economically correct: under a rule the rate is not a free choice. But silent snap-back reads as "broken."

Pedagogical decision (from the project owner): the tool should **start with the Taylor rule OFF**, so the learner first sets the rate manually (discretionary policy — drag MP, rate moves, see the effect). Turning the rule ON is then a deliberate step that *takes away* manual control, and an attempt to drag MP while the rule is on should **show a message explaining why**, reinforcing the lesson.

---

## What to do

### 1. Default the Taylor rule OFF

In `initialState`, change `taylor_on: true` → `taylor_on: false`.

**Check for ripple effects before finalising — this is the critical step:**
- At the baseline (Y=100, π=2%=target, zero output gap) the Taylor rule prescribes the neutral rate, which equals `i_target` = 3%. So the baseline equilibrium (Y=100, i=3%, r=1%, π=2%) should be IDENTICAL whether the rule is on or off, because `i_target` defaults to 3%. Confirm this holds.
- Run all three verifiers. If `verify_v19.mjs`'s baseline checks (Y=100, i=3%, etc.) or the Taylor-anchoring check rely on `taylor_on` defaulting to true, they may construct their own state or set the flag explicitly — confirm they still pass. **If any verifier goes red because of this flip, STOP and report it — do NOT modify the verifier to make it pass.** A red verifier here means either the flip has a real effect that needs discussing, or the verifier was implicitly depending on the default; either way it's a human decision.
- Confirm the presets that explicitly set `taylor_on` still behave (they set it themselves, so they should be unaffected — confirm).
- Confirm the `taylor-toggle` switch's initial visual state matches `taylor_on: false` (the toggle should render as OFF on load).

### 2. Message when the user drags MP while the Taylor rule is ON

In `HANDLES.mp`, when `state.taylor_on` is true and the user attempts to drag: instead of silently setting `i_target` (which snaps back), show a brief, non-blocking message such as **"Taylor rule is ON — the rate is set by the rule. Turn it off to set the rate manually."**

- Use whatever lightweight in-app messaging already exists (check for a toast/notice/status element; if there's an existing message mechanism — e.g. the ZLB note or a status line — reuse it). If none exists, a small transient text near the MP chart or a brief highlight of the Taylor toggle is fine. Keep it non-modal (no alert() popups).
- Decide the cleanest behaviour for the drag itself when Taylor is on: either (a) don't move anything (just show the message), or (b) let `i_target` move (the slider tracks) but show the message so the user understands why the line doesn't hold. Prefer (a) — no movement + message — since a target that moves with no visible effect is itself confusing. State which you chose.
- When Taylor is OFF, dragging MP works exactly as now (sets `i_target` and `state.i`, line moves and holds). No message.

### 3. Do not change the economics

`solve`/`step`/the Taylor rule are unchanged. This is a default value + a UI message only.

---

## Acceptance check (report this back)

- On load: Taylor rule shows OFF; dragging MP moves the rate and it holds.
- Turn Taylor ON: dragging MP shows the explanatory message and the line does not hold (per the rule). Turn it OFF again: dragging works.
- Baseline readout on load is still Y=100, i=3%, r=1%, π=2% (the flip shouldn't change it — confirm).
- All three verifiers still green. If any went red, report what and why — do NOT patch the verifier.

## Guardrails / out of scope
- Do **not** modify the engine, the Taylor rule math, or `solve`/`step`.
- Do **not** modify any verifier to accommodate the default flip — if a verifier breaks, report it.
- Do **not** use blocking `alert()` dialogs — the message must be lightweight/non-modal.
- Do **not** change other handles or the lock layer.
