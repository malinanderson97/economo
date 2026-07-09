# Spec: Instructor_Manual — replace direct Blanchard citations with Correspondence pointers

> Status: DRAFT. Depends on `SPEC_Correspondence_Doc_Rewrite.md` landing first (or at least its
> §3.A/B/C fixes) — this spec makes the Correspondence doc the *only* place that asserts a
> Blanchard equation number; the Manual should carry zero independent citations after this.
> Documentation-only, no engine files touched.

## 1. Goal (one sentence)
Every `<span class="ref">Blanchard eq. X</span>` tag in `Instructor_Manual.html` is replaced with
a pointer to the relevant Correspondence-doc section, so the Manual never asserts a Blanchard
equation number on its own — it always says "see Correspondence §Y" instead. This is a policy
change, not a spot-fix: even the citations that happen to be correct today get converted, so
there's exactly one place (Correspondence) that can ever be wrong about a Blanchard number.

## 2. Which file(s)
- `Instructor_Manual.html` — all edits are in `<h2 id="equations">` (§6) plus a scan of the rest
  of the file for any other bare citation (none found elsewhere on this pass, but re-grep for
  `Blanchard eq` and `eq\.` before considering this done).
- Depends on: `Model_Textbook_Correspondence.html` (now confirmed as the sole canonical
  documentation format — Malin's decision, everything but the software licence agreement is HTML)
  having the section `id` attributes added per `SPEC_Correspondence_Doc_Rewrite.md §2` **before**
  this spec is actioned. With both files HTML, use real anchor links:
  `<a class="ref" href="Model_Textbook_Correspondence.html#investment">→ Correspondence §2.2</a>`
  — not placeholder pointer text. If the two files ship in the same directory this is a plain
  relative link; confirm the deployed folder structure keeps them adjacent (or adjust the path)
  before treating this as done. After implementing, click through every link in a browser —
  a typo'd anchor id fails silently (dead-end scroll-to-top), it won't throw an error, so this is
  a manual-check item, not something the verifier equivalent for docs would catch (there isn't
  one — this whole ticket is browser-check-only, no headless verifier applies to prose/HTML docs).

## 3. The economics — six confirmed errors, for the record
(These get *replaced* per §4 below, not hand-corrected in place — but recording them here so the
reasoning survives in git history, and so nobody re-adds "Blanchard eq. 18.2" for UIP later.)

1. **UIP cited as "eq. 18.2."** Actual: eq. 19.5 (`E=Eᵉ(1+i)/(1+i*)`, from arbitrage eq. 17.2,
   simplified in Ch. 19). Confirmed against the PDF, the Correspondence doc, and the engine's own
   `EQ_REF['UIP']` object, all three agreeing on 19.5. No chapter-18 equation matches this form.
2. **Closed multiplier `k=1/(1−c₁−d₁)` cited as "eq. 3.8."** Eq. 3.8 (Ch. 3, confirmed against
   the PDF) is `1/(1−c₁)` — investment is exogenous in Ch. 3, so it structurally cannot contain a
   `d₁` accelerator term. The `d₁`-inclusive multiplier has no Blanchard equation number of its
   own; the Correspondence doc correctly calls it a generalisation of eq. 3.8, not eq. 3.8 itself.
3. **NX linear form cited as "eq. 19.2."** Eq. 19.1 is the NX definition (`X(Y*,ε)−IM(Y,ε)/ε`);
   eq. 19.2 is Blanchard's simplifying-assumption step (P=P*=1, r=i), not the NX equation. Swapped.
4. **`I=d₀+d₁Y−d₁ᵣr` cited as bare "eq. 5.1."** Eq. 5.1 is the abstract `I=I(Y,i)` with no
   coefficients — Blanchard never linearizes investment with a rate term anywhere in the text,
   including his own end-of-chapter linearizations. Overclaims a direct match that doesn't exist.
5. **`k_o` cited as bare "eq. 19.1."** k_o is derived from 19.1 across several algebraic steps,
   not stated there. Same overclaiming pattern as #4.
6. **PC line cited as bare "eq. 9.3."** Defensible as an anchor point, but the tool's version is
   normalized (Y_n-denominator, decoupled α, added transitory-shock term) relative to Blanchard's
   literal eq. 9.3 — the Correspondence doc itself documents these adaptations. Should read
   "adapted from," matching the UI copy fix already specified in `SPEC_Correspondence_Doc_Rewrite.md §6`.

## 4. What must NOT change
- §2 "The four teaching stages" table — verified correct against the live engine's
  `TUTORIAL_STAGES` array (4 stages, no debt stage, closed→open→closed→open). Do not touch.
- No engine files, no `solve()`/`step()` logic — this ticket is Manual text only.
- Don't invent new pedagogical claims while doing the citation swap — this is a mechanical
  find-and-replace of the `<span class="ref">...</span>` content, not a rewrite of the
  surrounding prose (the prose itself in §6 is fine; the numbers attached to it are the problem).

## 5. Content changes — itemized, grep-provable against the uploaded file

Replace each of the following `<span class="ref">...</span>` occurrences in `<h2 id="equations">`
with a real anchor link into `Model_Textbook_Correspondence.html`, using the exact `id` slugs
defined in `SPEC_Correspondence_Doc_Rewrite.md §2` (do not invent different slugs — they must
match verbatim or the link dead-ends):

| Current ref (verbatim) | Replace with |
|---|---|
| `Blanchard eq. 9.1` (on `Y=C+I+G`) | `<a class="ref" href="Model_Textbook_Correspondence.html#is-equilibrium">→ Correspondence</a>` |
| `Blanchard eq. 19.1` (on `Y=C+I+G+NX`) | `<a class="ref" href="Model_Textbook_Correspondence.html#open-is">→ Correspondence</a>` |
| `Blanchard eq. 3.3` (on `C=c₀+c₁(Y−T)`) | `<a class="ref" href="Model_Textbook_Correspondence.html#consumption">→ Correspondence</a>` — already correct, convert anyway per §1 policy |
| `Blanchard eq. 5.1` (on `I=d₀+d₁Y−d₁ᵣr`) | `<a class="ref" href="Model_Textbook_Correspondence.html#investment">→ Correspondence</a>` |
| `Blanchard eq. 19.2` (on `NX=x₁Y*−m₁Y−n₁(ε−1)`) | `<a class="ref" href="Model_Textbook_Correspondence.html#linearising-net-exports">→ Correspondence</a>` |
| `Blanchard eq. 3.8` (on closed `k`) | `<a class="ref" href="Model_Textbook_Correspondence.html#is-coefficients">→ Correspondence</a>` |
| `Blanchard eq. 19.1` (on open `k_o`) | `<a class="ref" href="Model_Textbook_Correspondence.html#reduced-form-coefficients">→ Correspondence</a>` |
| `Blanchard eq. 18.2` (on UIP `E=Eᵉ(1+i)/(1+i*)`) | `<a class="ref" href="Model_Textbook_Correspondence.html#uip">→ Correspondence</a>` |
| `Blanchard eq. 9.3` (on PC line) | `<a class="ref" href="Model_Textbook_Correspondence.html#pc-conversion">→ Correspondence</a>` |
| `eq. 8.4` (on `u_n`, `Y_n`) | `<a class="ref" href="Model_Textbook_Correspondence.html#natural-rate">→ Correspondence</a>` |

The existing `.eq .ref` CSS class (grey, small, `font-family:var(--font-ui)`) already styles this
span — reuse it on the `<a>` tag rather than introducing new link styling; just confirm it still
reads as a link (the current `.eq .ref{color:var(--ink-4)}` is very muted grey and won't look
clickable — bump it to `var(--accent)` or add an underline on hover so students recognise these
as jump-links, not just annotation text like they were before).

Grep `Blanchard eq` and standalone `eq\.` in the file after editing — expect zero remaining raw
equation-number citations. Grep `href="Model_Textbook_Correspondence.html#` and confirm the count
matches the ten rows above (ten links, ten matching ids on the other side — see done criteria).

Update the existing note at the top of §6 ("For the complete system of equations block by block,
please see the separate fuller model equations document") to name the file directly and link it,
now that the format question is settled: `For the complete system of equations block by block,
see <a href="Model_Textbook_Correspondence.html">the Model Textbook Correspondence</a>.`

## 6. Flagged, not fixed in this pass — verify against your live files first
- **§6 LM section, money-demand paragraph** (`M/P = Y·(L₀ − L₁·i)` description): the
  Correspondence rewrite spec calls for removing the money-market-panel description because the
  panel no longer exists in the tool. If that's accurate, this paragraph in the Manual describes
  a dead feature and should be cut or updated in the same pass — confirm against the live engine
  before editing (grep for whatever renders the money-market panel; if nothing renders it, cut
  the paragraph).
- **§7 preset narratives (1, 2a/2b, 4, 5)**: don't match the engine snapshot in the current
  project mount closely enough for me to sign off on them sight-unseen. Specifically: preset 1's
  "de-anchor" description reads differently here than in the mounted engine's preset text, and
  the 2a/2b θ-value-to-label pairing here (2a=θ0.15/1970s-adaptive, 2b=θ1/1990s-anchored) doesn't
  match what's in my own notes from our last session — the Manual's version is the one that's
  internally consistent with both the historical narrative and the confirmed θ=1-is-anchored
  engine convention, so it's probably right and my notes are stale, but this is worth a direct
  diff against your current live preset objects rather than trusting either source blind.

## 7. Done criteria
- [ ] All 10 citations in §5's table converted to real `<a href="Model_Textbook_Correspondence.html#...">`
      links using the exact id slugs from `SPEC_Correspondence_Doc_Rewrite.md §2`; grep confirms
      zero raw `Blanchard eq.` strings remain in the file.
- [ ] Ten `href="Model_Textbook_Correspondence.html#"` links present, and — with both files open
      side by side — every one of the ten ids they target actually exists in the Correspondence
      doc (click through each link in a browser; a silent dead-scroll means a typo'd id).
- [ ] `.eq .ref` styling updated so these read as clickable links, not muted annotation text.
- [ ] §2 stage table untouched (diff should show zero changes there).
- [ ] §6 top-of-section note links directly to `Model_Textbook_Correspondence.html`.
- [ ] §6 flag (money-demand paragraph) resolved one way or the other — either cut (if the panel
      is confirmed gone) or left with a note explaining why it's still relevant.
- [ ] §7 preset text diffed against the current live engine file by Malin before publishing —
      not fixed blind by Antigravity from the mounted snapshot.
- [ ] Full diff read by Malin before commit.
