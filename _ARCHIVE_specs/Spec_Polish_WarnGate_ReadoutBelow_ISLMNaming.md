# Spec: Polish fix-up — per-block warning gating, readout below charts, ISLM/LM naming

**For:** Antigravity (implements in repo)
**Working root:** `BLANCHARD MATCH FOLDER`
**Type of change:** v19 main-screen polish — onboarding gating (verifiable) + a layout reversal + label renames (eyeball + one static check). No engine/economics/equation-content changes. Do not touch `solve()`, `verify_v16.mjs`, `verify_v19.mjs` logic.

---

## §0 — One decision to confirm (Malin)

- **W1 — the ZLB warning chip.** The expectations chips (`exp`, `anchor`, `target`, `wicksell`) gate to PC — they're about inflation de-anchoring/credibility. The **ZLB** chip (`zlb`) is a policy-rate concern, meaningful from ISLM onward. *Recommended: ZLB gates to ISLM, the expectations chips gate to PC.* Alternative: gate ZLB to PC too (blanket). Confirm.

## 1. Goal (one sentence)

Warning chips appear only once the block they belong to is unlocked; the readout sits below the charts again; and the chart/model are labelled ISLM with the flat blue line labelled LM (Blanchard Ch. 5 naming).

## 2. The three changes

### 2a. Per-block warning gating (verifiable)
The `.warn-chip` chips currently render whenever their economic condition fires, regardless of which blocks are unlocked. Gate each chip to its block via `tutorialState.unlocked`, in the same spirit as `renderTutorial` and the time-control gating:
- `exp`, `anchor`, `target`, `wicksell` (inflation expectations / credibility / de-anchoring) → render only if `PC ∈ unlocked`.
- `zlb` (policy rate at lower bound) → render only if `ISLM ∈ unlocked` (pending W1).
A chip whose economic condition is met but whose block is locked must not appear. Drive this from `unlocked`, not from a new parallel flag.

### 2b. Readout below the charts (reverses the earlier move)
Move `#readout` back to **below** `.panel charts` in `#right-col` (it was moved above in the first layout fix-up; that's reversed). **The static verifier check must flip with it:** the existing `verify_onboarding.mjs` assertion "`#readout` precedes `.panel charts`" becomes "`#readout` **follows** `.panel charts`" — update the assertion so it stays true rather than going red. The measure-and-shrink `fitCharts()` is order-agnostic and needs no change, but re-confirm the closed-state fit still shows all four charts + readout with no scroll.

### 2c. ISLM / LM naming (display labels only)
Rename the user-visible strings; **leave the internal `EQ_COL.MP` key and any `curve-*` identifiers unchanged** (documented deliberate choice — minimal blast radius, keeps Slice 2's `EQ_COL.MP` reference valid):
- `<title>` and `<h1>`: `IS-MP-UIP-PC` → `ISLM-UIP-PC`.
- Chart `<h3>`: `IS-MP (goods market & policy rate)` → `ISLM (goods market & policy rate)`.
- Subtitle: `Solid blue = nominal MP … Drag IS for fiscal, MP for monetary.` → `… nominal LM … Drag IS for fiscal, LM for monetary.`
- Legend: `MP: i (nominal)` → `LM: i (nominal)`.
- Equation-box policy-rate line label(s): the `<span class="eq-lbl">MP</span>` text → `LM` (the `class`/key stays).
- Copy-state export header: `IS-MP-UIP-PC Model · State export` → `ISLM-UIP-PC Model · State export`.

## 3. What must NOT change

- Engine, economics, equation content, chart math; `verify_v16` 22/0, `verify_v19` 30/0.
- The internal `EQ_COL` keys and `curve-*` class names (display text only changes).
- `fitCharts()`/freeze behaviour from the layout fix-ups (only the readout's DOM position moves).
- The Slice-1 lock layer and all other existing `verify_onboarding.mjs` checks.

## 4. The check(s)

- **Verifier (append/modify `verify_onboarding.mjs`):**
  - Flip the readout-order assertion to "`#readout` follows `.panel charts`".
  - New: with `unlocked` excluding PC, force each expectations chip's condition and assert it does NOT render; with PC unlocked, it may render. With `unlocked` excluding ISLM, assert the ZLB chip does not render (per W1). Drive from `unlocked` + the chip→block map. Include a BAD-fixture: an expectations chip rendered while PC locked must be caught.
  - `verify_v16` 22/0, `verify_v19` 30/0 unchanged.
- **Eyeball:** at GOODS/ISLM/UIP (PC locked) no expectations warnings appear even under conditions that would trigger them; readout is below the four charts and the closed-state fit still has no scroll; the chart reads "ISLM", the flat line reads "LM" in title, subtitle, legend, and equation box.

## 5. Done criteria

- [ ] `verify_onboarding.mjs` green (flipped readout check + new chip-gating checks + BAD-fixture); `verify_v16` 22/0, `verify_v19` 30/0.
- [ ] Eyeball: warnings gated, readout below + still fits closed, ISLM/LM labels correct.
- [ ] Committed: `git add -A ; git commit -m "Polish: per-block warning gating; readout below charts; ISLM/LM naming"`.

## Guardrails / out of scope

- Display-label rename only — do NOT rename `EQ_COL` keys or `curve-*` identifiers.
- Warning gating driven from `tutorialState.unlocked`, no parallel flag.
- Do not weaken any assertion; flip the readout check rather than deleting it.
