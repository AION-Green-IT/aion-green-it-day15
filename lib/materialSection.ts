import type { IconKey } from "@/lib/routes";

/**
 * The shape of one material section, shared by both routes.
 *
 * The first three prose fields are the course-wide schema (definition →
 * insight → practical takeaway). `body` carries the depth a 60-minute
 * facilitator-led block needs on top of that: named sub-headings, each with
 * its own paragraphs, so a section can go deep without becoming one wall of
 * text. `reasoning` is the rule set that makes the section operational — it is
 * what the task's MaterialRefs chips point back at.
 */
export type MaterialSection<Id extends string = string> = {
  id: Id;
  /** "S1", "A" — the label the mini-nav and the reference chips use. */
  code: string;
  n: number;
  icon: IconKey;
  kicker: string;
  title: string;
  /** One line under the title, before the diagram. */
  standfirst: string;
  definition: string;
  insight: string;
  takeaway: string;
  /** Deeper explanation, rendered after the diagram. */
  body: { heading: string; paragraphs: string[] }[];
  /** "How to decide when this comes up in the task" — 1–3 operational rules. */
  reasoning: string[];
  callout: { label: string; text: string };
  references: { label: string; detail?: string; url?: string }[];
  /** Roughly how long a facilitator should spend here. */
  minutes: number;
};

/**
 * The lighter material unit: one compact card, one live diagram and one
 * micro-interaction. Used where a day's design puts the learning inside the
 * task rather than in a long facilitator-led reading block.
 *
 * What is visible is only the standfirst, the diagram and the `definition`.
 * Everything else sits behind one collapsed "Read more": `insight` (why it
 * matters), `reasoning` (the decision rules the task's MaterialRefs chips point
 * back at — what makes the card operational) and the sources.
 */
export type MicroCard<Id extends string = string> = {
  id: Id;
  /** "C1" — the label the mini-nav and the reference chips use. */
  code: string;
  n: number;
  icon: IconKey;
  title: string;
  /** One line under the title, before the diagram. */
  standfirst: string;
  /** Visible: 2–4 plain sentences a non-expert can repeat back. Every term and option the task uses is defined here. */
  definition: string[];
  /** Read more: why it matters — the causal mechanism, the figures. */
  insight: string[];
  /** Read more: "How to decide when this comes up in the task" — operational rules, incl. the one that rules out the plausible wrong answer. */
  reasoning: string[];
  /** Read more: real, separate, clickable sources. `note` explains why a source has no link. */
  sources: { label: string; detail?: string; url?: string; note?: string }[];
  /** What is behind Read more, so it is never a blind click. */
  moreHint: string;
  /** Minutes for the visible part only — Read more is optional depth and is not counted. */
  minutes: number;
};
