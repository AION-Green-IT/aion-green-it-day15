/**
 * Route 2 — the NovaCircular Technologies engagement, Level 3.
 *
 * Four micro-cards of material (ending in a read-only CircularMind worked
 * example), then one task — a two-stage builder: connect six blocks into a
 * decision architecture, then write the core of the management proposal
 * beside a live-assembling document — then one export (CLAUDE.md §12).
 *
 * Everything that would otherwise be said twice lives here and only here: the
 * company, the role, the learner's name field, and the export contract.
 */

import type { MaterialSectionId } from "./sections";

export * from "./sections";
export * from "./material";
export * from "./task3";

/** Reused across both routes — the same person's name, entered once per route but the same key, per NAME_FIELD's own instruction. */
export const LEARNER_NAME_KEY = "learner:name";

// ---------------------------------------------------------------------------
// Store key map — every key this route writes.
// ---------------------------------------------------------------------------
export const R2 = {
  name: LEARNER_NAME_KEY,

  /** One boolean per canonical block-pair key (lib/route2/task3.ts `connectionKey`). */
  connection: (pairKey: string) => `r2:t3:conn:${pairKey}`,
  firstMeasure: "r2:t3:firstmeasure",
  element1: "r2:t3:element1",
  guidingDecision: (i: number) => `r2:t3:guiding:${i}`,
  element3: "r2:t3:element3",
  element4: "r2:t3:element4",
  element5Why: "r2:t3:element5why",
  element6: "r2:t3:element6",
  element7: "r2:t3:element7",
  horizon: (measureId: string) => `r2:t3:horizon:${measureId}`,
  /** Stringified count of "Check my proposal" runs. */
  checkCount: "r2:t3:check",
} as const;

/** Prefixes resetSection() must sweep to clear every compound key this route writes. */
export const R2_KEY_PREFIXES = ["r2:t3:"];

export const PAGE_INTRO = {
  tag: "ROUTE 2 — MANAGEMENT DECISION",
  title: "From Initiatives to a Decision Architecture",
  body: "Module 11, Level 3. A pile of sensible initiatives is not a strategy — an AI pilot here, a take-back scheme there, each defensible alone, can still add up to symbolic politics and rebound at portfolio scale. Four cards below teach the senior move: one integrated assessment framework, with real governance and named time horizons, that every future initiative routes through before it scales. Then you build one for NovaCircular Technologies — not a list of ideas, a decision architecture.",
} as const;

/** Stated once, above the task, and never re-introduced mid-page. */
export const ENGAGEMENT = {
  company: "NovaCircular Technologies",
  role: "Head of innovation strategy",
  heading: "The engagement",
  brief:
    "NovaCircular Technologies wants to use AI in a targeted way and strengthen circular principles in IT — but every topic so far has been prioritised by how attractive it looks, not by any shared logic.",
  mandate:
    "Build the decision architecture that channels every future AI, circular, or investment decision through the same criteria and governance — then turn it into a proposal management can act on, including the one decision that cannot wait for complete data.",
  deliverable:
    "You leave with one document: a NovaCircular Technologies Management Proposal — a connected decision architecture plus the core of the proposal (why it matters, the decision logic and the first move).",
} as const;

export const NAME_FIELD = {
  label: "Your name",
  instruction: "Use the same name on every export this week — it is how your submissions are matched.",
  placeholder: "e.g. Jane Muller",
} as const;

/**
 * One export for the whole route: a print-ready HTML report sent straight to
 * the browser's print dialog — "Save as PDF" is the export
 * (lib/downloadFile.ts `printHtmlDocument`). Filename: `1-{name}-day15-l3task1`.
 */
export const EXPORT = {
  filenameLevels: [3],
  filenameTask: 1,
  docHeading: "NovaCircular Technologies Management Proposal",
  buttonLabel: "Export as PDF",
} as const;

/** Material chips shown on the case brief. */
export const BRIEF_REFS: MaterialSectionId[] = ["architecture", "governance"];
