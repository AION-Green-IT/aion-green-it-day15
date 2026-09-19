# AION Green IT — Day 15

**Module 11: Innovations for the Sustainable IT of Tomorrow** (sustainable innovation, artificial
intelligence and the circular economy) — the interactive working companion for Day 15.

**Built: Route 1 (Levels 1–2) and Route 2 (Level 3), both routes complete, then depth-upgraded to the
Day 14 standard** (`../DEPTH-UPGRADE-PROMPT.md`). This day is bootstrapped from Day 14's codebase: its
store shape, export mechanism, mentor tools and UI primitives are reused as-is.

## What the depth upgrade changed

**Material: short on screen, deep one tap away.** Each micro-card (Route 1's nine, C1–C9, ~22 min;
Route 2's four, D1–D4, ~15 min) shows only a one-line standfirst, one live interactive and a short
**Definition**. Everything else — why it matters, the decision rules ("How to decide when this comes up
in the task"), the sources — sits behind one collapsed **Read more** that says what is inside.
`components/ui/ReadMore.tsx` is the disclosure; `components/ui/MicroCard.tsx` renders the card;
`MicroCard` type in `lib/materialSection.ts` (`definition`, `insight`, `reasoning`, `sources`,
`moreHint`). `minutes` counts the visible part only.

**Every task chip opens the rules.** A `MaterialRefs` chip in a task fires `aion:open-readmore`, so the
section it points at opens its Read more (where the rules live) before it scrolls and flashes.

**Every abbreviation is a glossary term.** `lib/glossary.ts` (IEA, TWh, inference, LCA, WEEE, ESPR, DPP,
R-strategies, Global E-waste Monitor, take-back, CSRD, ESRS E1/E5, ISO 50001, ISO 20400, Directive (EU)
2024/825, rebound/Jevons). Terms render as dotted-underlined buttons through
`components/ui/GlossedText.tsx`; tapping one opens what it stands for, what it means, and a clickable
**Source ↗**.

**Every interactive shows numbers, a reason, "why this result" and "what just changed".** Shared pieces:
`components/ui/LiveReading.tsx` (the `aria-live` reading + `useLastChange`), `components/ui/NumberSlider.tsx`
(real min/step/unit, "from start" delta), `lib/format.ts` (en-GB numbers). Every number is derived from
state, and each has a reset to baseline where a shape or total moves.

**Green means "verified", nothing else.** Zones, filled slots and clue boxes are neutral; ✓ (green) and ✕
(red) appear only from a fresh Check, and disappear the moment the checked state changes.

**One case per route, briefed once.** Route 2's task framing no longer restates NovaCircular's brief; it
is now self-contained (no pointer to a Route 1 card), so the "this route stands on its own" banner is true.

## Routes

| Route | Levels | Case | Material | Task | Export |
|---|---|---|---|---|---|
| `/route-1-assess-and-decide` | 1–2 | FutureGrid Technologies | C1–C9 micro-cards, ~22 min | Part 1 Diagnose (6 initiatives → zone, lens, rationale) → handover → Part 2 Decide (assess 3 lines on 7 dimensions, radar, priority pick + justification), ~30 min total | `1-{name}-day15-l1l2task1` PDF |
| `/route-2-management-decision` | 3 | NovaCircular Technologies | D1–D4 micro-cards + CircularMind worked example, ~15 min | Connect 6 blocks into one architecture, then the 7-element management proposal, ~20 min | `1-{name}-day15-l3task1` PDF |

**Export naming.** The Level 2 build prompt named two exports (`…-l1task1`, `…-l2task1`). CLAUDE.md §12
and Day 14 Route 1's precedent say one export per route, so Route 1 exports one PDF,
`1-{name}-day15-l1l2task1`. Route 2 has no conflict (`l3task1`).

## The shape of each route

```
case brief + learner name (stated once)
  → MATERIAL — micro-cards: standfirst · live interactive · Definition · [Read more]
  → TASK
       Route 1: Part 1 Diagnose → inline handover → Part 2 Decide
       Route 2: Stage 1 canvas → Stage 2 proposal (document assembling beside it)
  → ONE EXPORT
```

## Route 1's material — nine cards

| Card | Visible Definition defines | Interactive (all numbers derived from state) | Task it grounds |
|---|---|---|---|
| C1 | Novelty vs innovation; impact-led vs novelty-led; rebound | **Rebound calculator**: 1,000 × (1 − gain) × (1 + growth) kWh, break-even growth, before/after bars | Task 1 Q2 (impact / novelty) |
| C2 | AI benefit vs load; "both"; continuous vs one-off compute | **AI load calculator**: MWh saved − MWh burned, names which Task 1 answer the numbers support | Task 1 Q1 |
| C3 | Linear vs circular; the R-strategies | **Fleet calculator**: 100 × (6 ÷ years) × (1 − returned); seven R-rungs with "reach for it when" | Task 1 Q2 (circular / linear) |
| C4 | The seven lenses | **Lens key** (what it covers · asks · use when · a case) + a practice case that is not one of the six initiatives | Task 1 lens |
| C5 | Attractive vs viable; the two signals; tested/untested; the verdict rule | **Playable rule**: pick signal 1 × signal 2, the six-cell table lights up, "why this zone" from Task 1's own `zoneReason` | Task 1 zones |
| C6 | Deciding under uncertainty | **Cost of waiting**: confidence vs runway (illustrative) | Task 2 justification |
| C7 | The seven dimensions, Low/Medium/High, Risk reads in reverse | **Practice radar** on a cloud-cost dashboard (not a Task 2 line): baseline + reason per axis, "N means:", strength points, shape reading | Task 2's 21 ratings |
| C8 | Enabler vs point solution | **Reach counter**: point = 1 decision, enabler = 1 + n | Task 2 leverage / controllability |
| C9 | Symbolic politics, misinvestment, rebound | **Name the live mechanism** on three practice options, each with an early signal | Task 2 risks |

Figures rendered exactly as cited: data-centre electricity ~460 TWh (2022) → potentially ~1,000 TWh by
2026 (IEA, *Electricity 2024*); e-waste 62 Mt generated in 2022, 22.3% formally collected and recycled
(Global E-waste Monitor 2024).

## Route 1's task mechanics

**Part 1.** Per initiative: Q1 (reduces / adds / both — each option now has a one-line meaning under it)
and Q2 (whichever of three questions is most diagnostic). The card resolves into a zone and prints
**"Why this zone: …"** — what the two answers give, explicitly *not* a verdict. Zones are neutral. The lens
step has a **Lens key** (asks · use when). The verdict rule is `resolveZone` (C5): both signals right →
opportunity, both wrong → risk, any disagreement (including "both") → mixed.

**Part 2.** Each line shows **What it involves**, and each of the 21 rating cells shows **one neutral
fact** (`OPTION_FACTS` in `lib/route1/task2.ts`) plus "Low means: …" once chosen. Under the overlaid radar:
strength points per line (Risk counted in reverse), where the lines differ most, and a "what just changed"
sentence. The pick is deliberately open: the check only tests (a) the justification cites ≥ 2 dimensions
and (b) the standard objection to whichever line was picked is pre-empted. Points are labelled as a
summary, not a decision rule (C7). The Check button is no longer disabled: with no pick it scrolls to
and flashes the priority field.

**Checks** are ✓/✕ with a clue that sharpens from the second check; never the answer.

## Route 2's material — four cards + a worked example

| Card | Visible Definition defines | Interactive | Task it grounds |
|---|---|---|---|
| D1 | Decision architecture; the six blocks; rebound and symbolic politics in one sentence each | **Scattered vs routed**: N × (N − 1) ÷ 2 pairs become comparable | Canvas |
| D2 | The four criteria, each with what it asks | **Criteria funnel**: drop an initiative, see which filter stops it and why; switch a criterion off and see what slips through | Element 3 |
| D3 | The four loop stages and who plays each; investment logic | **Governance lab**: remove a stage, read what breaks | Element 6 |
| D4 | Short / medium / structural, by what a measure *produces* | **Horizon practice** on a retailer's cloud programme (not NovaCircular; not Task 3's six measures) | Classifier |

The **CircularMind worked example** (read-only, dark banner, no inputs) now lists three findings, each
tagged with the D2 criterion that would have caught it, plus the lesson.

## Route 2's task mechanic

**Stage 1 — canvas.** Six fixed blocks; link them (native drag or tap-then-tap). A live reading gives
connections, separate groups, orphans, why, and what the last link changed. **The check and the missing
list now require one connected group**, not just "no orphan" — three separate pairs used to pass.
**Stage 2 — the proposal.** Seven elements; a criteria key (element 3) and a stage key (element 6); what
each first-measure option involves; a horizon classifier with a band key, MaterialRefs chip and
keyboard-operable items.

**"Check my proposal"** returns one ✓/✕ per area, each with a clue and never the model recommendation:

| Area | Passes when |
|---|---|
| Decision architecture | The six blocks form one connected group |
| Decision logic (element 3) | Names all four criteria (word-boundary matching; a stray "download" no longer counts as "load") |
| Roles and governance (element 6) | Covers all four loop stages |
| First measure | "Framework" passes. "AI" or "circular" pass **only if** element 4 or 5 names how the missing criteria are handled meanwhile (criteria, framework, assess, govern, interim, alongside, trade-off …) |
| Time horizons | All six classified **and** placements hold up. Reported as "k of 6 hold up" — never which one |
| Complete proposal | Added only while an element is still empty, so "holds" can no longer appear on a near-empty page |

The stored verdict is keyed on every input it judged, so it disappears the moment any of them changes.

## Coverage table (task step → where it is taught → where the rule lives → what rehearses it)

| Task step / option | Section | Rule lives in | Rehearsed by |
|---|---|---|---|
| Q1 reduces / adds / both | C2 | Definition | AI load calculator |
| Q2 impact / novelty | C1 | Definition + Read more | Rebound calculator |
| Q2 circular / linear | C3 | Definition | Fleet calculator |
| Q2 tested / untested | C5 | Definition | Playable rule |
| Zone rule | C5 | Definition | Playable rule |
| Lens choice (7) | C4 | Definition + lens key | Lens key + practice case |
| Seven dimensions, Low/Med/High, Risk reversed | C7 | Definition | Practice radar |
| Justification under incomplete data | C6 | Definition | Cost of waiting |
| Enabler vs point solution | C8 | Definition | Reach counter |
| Two attractive-but-weak risks | C9 | Definition | Name the live mechanism |
| Canvas (six blocks, one architecture) | D1 | Definition + Read more | Scattered vs routed |
| Element 3 (four criteria) | D2 | Definition | Criteria funnel |
| Element 6 (four stages) | D3 | Definition | Governance lab |
| First measure | D1, D2 | Definition (+ CircularMind) | Worked example |
| Horizon classifier | D4 | Definition | Horizon practice |

## Decisions made without asking (please re-check)

1. **Zones are neutral** until Check runs (was green / red / grey).
2. **Route 1 minutes** now sum to 22 (was 24 against a "~22" claim) because the visible part shrank.
3. **ESRS**: D2 previously said "ESRS E1 … resource impact". E1 is climate change; **E5** is resource use
   and the circular economy. The text now names both. Re-check before teaching.
4. **Route 2 no longer mentions Route 1 cards** (C1, C9, C6); rebound and symbolic politics are defined
   inline.
5. **The canvas must be one connected group** to pass the check and to export (was: no orphans).
6. **AI-first / circular-first can pass** the check with an explicit trade-off, matching the mentor
   teaching note (previously it could never pass).
7. **The Route 1 Check button is never disabled** (CLAUDE.md §3).
8. Practice cases (lens key, practice radar, weakness lab, horizon practice, criteria funnel) were written
   new and deliberately avoid the six initiatives, the three lines and Task 3's six measures.
9. C4–C8 and D1/D4 have no external standard to cite, so their Sources say "Course framework, Module 11"
   instead of a made-up citation.

## Not verified / needs a human

- **URLs** were checked with `curl -L -A "Mozilla/5.0"` on 2026-09-19: IEA, Global E-waste Monitor, Ellen
  MacArthur, EC WEEE page, Wikipedia answered 200. **EUR-Lex ELI links answer HTTP 202 to scripts** (a bot
  challenge) — the canonical permalink form, kept, but not opened in a browser. **ISO.org answers 403**, so
  ISO 14040/14044, ISO 50001 and ISO 20400 are named but not linked.
- **In flux — re-check before teaching:** the CSRD/ESRS scope (EU Omnibus simplification) and the start date
  of Directive (EU) 2024/825 (the text says "autumn 2026").
- **"25% = small enough to ignore"** in C2 is a teaching rule of thumb, not a standard; the interactive says so.
- All calculator figures (kWh, MWh, devices, quarters) are illustrative.
- Not exercised: the PDF print dialog itself (`window.print()`), and screenshots — verified through the DOM
  because the browser pane was hidden.

## Mentor tools

One auto-fill per route, per-exercise answer keys, shared passcode `muchson123` in plaintext on purpose.
The unlock flag is session-only. New this round: **Route 2 keys for the canvas and the horizon classifier**
(expected band per measure, why, and the common counter-cases); the first-measure key now states exactly
what the check accepts.

## Shared components

- `lib/materialSection.ts` — `MicroCard` and `MaterialSection`.
- `components/ui/MicroCard.tsx`, `ReadMore.tsx`, `GlossedText.tsx`, `LiveReading.tsx`, `NumberSlider.tsx`,
  `MaterialRefs.tsx` (opens Read more), `MiniNav.tsx`, `LivePanel.tsx`, `RadarChart.tsx`, `MissingList.tsx`.
- `lib/glossary.ts`, `lib/format.ts`, `lib/usePlacementHistory.ts`, `components/ui/UndoRedoControls.tsx`.
- `components/ui/AnswerKey.tsx` + `MentorFillButton` / `AnswerKeyButton`.
- `components/chrome/RouteGate.tsx` — Route 2's soft, non-blocking "Route 1 first" banner.

## Layout

```
app/
  page.tsx                              two route cards, both available
  route-1-assess-and-decide/            FutureGrid Technologies
  route-2-management-decision/          NovaCircular Technologies
lib/
  routes.ts · materialSection.ts · glossary.ts · format.ts · downloadFile.ts · store.ts
  route1/  index · sections · material (C1–C9) · task1 (zones, zoneReason, lenses + practice case, initiatives)
           · task2 (dimensions, lines, OPTION_FACTS, radar scoring, objection engine, key)
  route2/  index · sections · material (D1–D4 + worked example) · task3 (blocks, keys, HORIZON_EXPECTED,
           blockGroups, checkProposal, answer keys)
components/
  route1/  Material · CaseBrief · Task · DiagnosisBoard · Handover · PartTwo · ReportPanel · ExportBar ·
           MentorTools · useRoute1 · exportDocuments · diagrams/ (ReboundCalculator, AiLoadCalculator,
           CircularFleet, LensKey, VerdictRule, WaitingCost, PracticeRadar, EnablerReach, WeaknessLab)
  route2/  Material · CaseBrief · Task · Canvas · ProposalBuilder · ReportPanel · ExportBar · MentorTools ·
           useRoute2 · exportDocuments · diagrams/ (ArchitecturePortfolio, CriteriaFunnel, GovernanceLab,
           HorizonPractice)
  ui/      cross-day shared components
```

## Running it

```bash
npm ci
npm run dev
```

The parent `../.claude/launch.json` has a `day15-dev` entry — `preview_start` reads the parent config, not
this folder's.

```bash
npm run build
```

Static output lands in `out/`. **Never run the build while the dev server is running** — both write to
`.next`, after which the dev server serves 404s for `main-app.js` and nothing hydrates while the page still
looks fine.

```bash
npm run typecheck
```
