/**
 * Route 1 — the FutureGrid Technologies engagement, Level 1 + Level 2.
 *
 * Nine micro-cards of material (C1–C9), then one task on one continuous
 * scroll — Part 1 Diagnose (Task 1) → inline handover → Part 2 Decide
 * (Task 2) — then one export (CLAUDE.md §12).
 *
 * **Export-naming note.** The Level 2 build prompt names a second, standalone
 * export id (`1-{name}-day15-l2task1`), independent from Level 1's
 * (`1-{name}-day15-l1task1`). The established codebase convention —
 * CLAUDE.md §12 ("one export bar, one deliverable, one missing list spanning
 * the whole task") and Day 14 Route 1's own precedent for a merged L1+L2
 * route — is **one export per route**, so this route now exports a single
 * PDF covering both parts as `1-{name}-day15-l1l2task1`, not two files.
 * Flagged here per that prompt's own instruction to surface the discrepancy
 * rather than pick silently (see also README.md).
 *
 * Everything that would otherwise be said twice lives here and only here: the
 * company, the role, the learner's name field, and the export contract.
 */

import type { MaterialSectionId } from "./sections";

export * from "./sections";
export * from "./material";
export * from "./task1";
export * from "./task2";

export const LEARNER_NAME_KEY = "learner:name";

// ---------------------------------------------------------------------------
// Store key map — every key this route writes.
// ---------------------------------------------------------------------------
export const R1 = {
  name: LEARNER_NAME_KEY,

  // -- Task 1 (Level 1 — Diagnose) -------------------------------------------
  /** Q1 — the load answer for one initiative. */
  load: (initiativeId: string) => `r1:t1:load:${initiativeId}`,
  /** Q2 — the structure answer for one initiative. */
  structure: (initiativeId: string) => `r1:t1:structure:${initiativeId}`,
  lens: (initiativeId: string) => `r1:t1:lens:${initiativeId}`,
  rationale: (initiativeId: string) => `r1:t1:why:${initiativeId}`,
  /** Stringified count of "Check my reasoning" runs covering this initiative — exported for grading. */
  checkCount: (initiativeId: string) => `r1:t1:check:${initiativeId}`,
  /** The closing free-text question. */
  closing: "r1:t1:closing",
  /** Optional closing question, for anyone who diagnoses all six. */
  closingAll: "r1:t1:closing-all",
  /** Which of the seven lens chips in C4 have been opened — drives a soft nudge only. */
  lensesSeen: "r1:c4:lenses",

  // -- Task 2 (Level 2 — Decide) ---------------------------------------------
  /** Phase 1 — one Low/Medium/High level per (option, dimension) pair. */
  score: (optionId: string, dimensionId: string) => `r1:t2:score:${optionId}:${dimensionId}`,
  /** Phase 2 — the single priority pick (option id). */
  priority: "r1:t2:priority",
  justification: "r1:t2:justification",
  followUp: (index: number) => `r1:t2:followup:${index}`,
  risk: (index: number) => `r1:t2:risk:${index}`,
  /** Stringified count of "Check my reasoning" runs on the priority decision. */
  checkCount2: "r1:t2:check",
  /** Which of the seven dimension chips in C7 have been opened — drives a soft nudge only. */
  dimensionsSeen: "r1:c7:dimensions",
} as const;

/** Prefixes resetSection() must sweep to clear every compound key this route writes. */
export const R1_KEY_PREFIXES = ["r1:t1:", "r1:t2:", "r1:c4:", "r1:c7:"];

export const PAGE_INTRO = {
  tag: "ROUTE 1 — ASSESS & DECIDE",
  title: "Innovations for the Sustainable IT of Tomorrow",
  body: "Module 11. New technology is not automatically sustainable technology: AI can cut energy and add compute at the same time, a circular model can be the right direction and still be hard to run, and an initiative can be genuinely exciting while reducing nothing at all. Four core cards below give you the vocabulary and the decision rules. Then you use them on FutureGrid Technologies: diagnose three planned initiatives one by one. If you want more, five extra cards, three more initiatives and a Level 2 decision about whole lines of measures are there behind optional buttons.",
} as const;

/** Stated once, above the task, and never re-introduced mid-page. */
export const ENGAGEMENT = {
  company: "FutureGrid Technologies",
  role: "Innovation assessment analyst, then senior consultant",
  heading: "The engagement",
  brief:
    "FutureGrid Technologies is planning six innovation initiatives at once — AI, data services, procurement, hardware and a new customer offering. Management is enthusiastic about all of them, and no integrated way of judging them exists yet.",
  mandate:
    "Core: assess, not approve — say which of three initiatives are genuine sustainability opportunities, which are risks, and which are mixed. Optional: diagnose the other three, then step up a level — with only one line of measures fundable first, prioritise and defend a choice under incomplete data.",
  deliverable:
    "You leave with one document: a FutureGrid Technologies Innovation Diagnosis & Priority. It always holds the initiative-level diagnosis; anything optional you also complete is added to it.",
} as const;

export const NAME_FIELD = {
  label: "Your name",
  instruction: "Use the same name on every export this week — it is how your submissions are matched.",
  placeholder: "e.g. Jane Muller",
} as const;

/**
 * One export for the whole route: a print-ready HTML report sent straight to
 * the browser's print dialog — "Save as PDF" is the export
 * (lib/downloadFile.ts `printHtmlDocument`). Filename:
 * `1-{name}-day15-l1l2task1` (see the export-naming note above).
 */
export const EXPORT = {
  filenameLevels: [1, 2],
  filenameTask: 1,
  docHeading: "FutureGrid Technologies Innovation Diagnosis & Priority",
  buttonLabel: "Export as PDF",
} as const;

/** Material chips shown on the case brief. */
export const BRIEF_REFS: MaterialSectionId[] = ["lenses", "viability"];

/** The handover panel between Part 1 (Diagnose) and Part 2 (Decide). */
export const HANDOVER = {
  heading: "From one initiative to a whole portfolio",
  body: "You just diagnosed six initiatives one at a time. Now zoom out: FutureGrid can only fund one central line of measures first. The same reasoning — net effect, structure, attractive versus viable — still applies, but the decision is bigger, the data is thinner, and you have to defend it before all the numbers exist.",
} as const;
