/**
 * Task 2 — "Which line of measures should be prioritised first?" ~15 minutes,
 * Level 2. Continues the same FutureGrid engagement: the perspective steps up
 * from junior analyst (Task 1's per-initiative diagnosis) to senior consultant
 * who must prioritise whole lines of measures under incomplete data.
 *
 * Phase 1 (assess) is decide-first, not slider-first (CURRICULUM-GUIDE.md §5):
 * each of the seven dimensions is answered as a short Low/Medium/High
 * judgment question, never dragged in blind, and the answered levels are what
 * render each option's radar. Phase 2 (decide + justify) asks for a single
 * priority pick, a justification that must reference at least two of the
 * seven dimensions, follow-up decisions, and two named attractive-but-weak
 * risks (C9). The pick itself is never graded right/wrong in the UI — the
 * check only ever tests whether the standard objection to *whichever* line
 * was picked has been pre-empted in the justification (CLAUDE.md §4).
 */

import type { AnswerKeyBlock } from "@/lib/answerKey";
import type { IconKey } from "@/lib/routes";
import type { MaterialSectionId } from "./sections";
import type { ClueTier } from "./task1";

// ---------------------------------------------------------------------------
// The seven assessment dimensions (C7) — Task 2's scoring vocabulary
// ---------------------------------------------------------------------------

export type DimensionId =
  | "leverage"
  | "innovation"
  | "sustainability"
  | "feasibility"
  | "risk"
  | "longTerm"
  | "controllability";

export type Level = "low" | "medium" | "high";
export const LEVEL_VALUE: Record<Level, number> = { low: 1, medium: 2, high: 3 };
export const LEVEL_LABEL: Record<Level, string> = { low: "Low", medium: "Medium", high: "High" };

export type Dimension = {
  id: DimensionId;
  /** One word for the radar axis. */
  short: string;
  name: string;
  definition: string;
  /** Six of seven read "bigger is stronger"; Risk alone reads in reverse (C7). */
  direction: "higherStronger" | "higherRiskier";
  question: {
    label: string;
    instruction: string;
    options: { level: Level; label: string }[];
  };
  /** Keywords a justification counts as "referencing" this dimension (case-insensitive substring). */
  keywords: string[];
};

export const DIMENSIONS: Dimension[] = [
  {
    id: "leverage",
    short: "Leverage",
    name: "Strategic leverage",
    definition: "How much this shifts the whole board, not just one square on it.",
    direction: "higherStronger",
    question: {
      label: "Does this change one thing, or how all future decisions are made?",
      instruction: "Judge structural reach, not size of budget.",
      options: [
        { level: "low", label: "Changes one thing" },
        { level: "medium", label: "Changes several related things" },
        { level: "high", label: "Reshapes how future decisions get made" },
      ],
    },
    keywords: ["leverage", "strategic"],
  },
  {
    id: "innovation",
    short: "Innovation",
    name: "Innovation effect",
    definition: "Whether this is genuine new capability, not a rebadge of something that already exists.",
    direction: "higherStronger",
    question: {
      label: "Is this genuine new capability, or a rebrand of existing practice?",
      instruction: "Ask what the organisation can do afterward that it genuinely could not do before.",
      options: [
        { level: "low", label: "Mostly a rebrand or incremental tweak" },
        { level: "medium", label: "Meaningful new capability, narrow scope" },
        { level: "high", label: "Genuine new capability the org lacked" },
      ],
    },
    keywords: ["innovation", "novel", "capability"],
  },
  {
    id: "sustainability",
    short: "Sustain.",
    name: "Sustainability impact",
    definition: "The real net resource or emissions benefit — not the promotional framing.",
    direction: "higherStronger",
    question: {
      label: "What is the real net resource or emissions benefit?",
      instruction: "Judge the net effect (C1), not the headline claim.",
      options: [
        { level: "low", label: "Marginal or unmeasured" },
        { level: "medium", label: "Moderate and plausible" },
        { level: "high", label: "Substantial and measurable" },
      ],
    },
    keywords: ["sustainab", "emission", "resource"],
  },
  {
    id: "feasibility",
    short: "Feasib.",
    name: "Feasibility",
    definition: "Whether it can actually be delivered now, with today's people and budget.",
    direction: "higherStronger",
    question: {
      label: "Can this be delivered now, with today's people and budget?",
      instruction: "Judge current capacity, not capacity you hope to have next year.",
      options: [
        { level: "low", label: "Needs capability or budget we don't have yet" },
        { level: "medium", label: "Deliverable with some stretch" },
        { level: "high", label: "Deliverable now, with what we already have" },
      ],
    },
    keywords: ["feasib", "deliver"],
  },
  {
    id: "risk",
    short: "Risk",
    name: "Risk",
    definition: "What could concretely go wrong, and how exposed the organisation is if it does.",
    direction: "higherRiskier",
    question: {
      label: "How much could concretely go wrong, and how exposed are we?",
      instruction: "Unlike the other six, a High score here is a caution sign, not a strength (C7).",
      options: [
        { level: "low", label: "Little exposure — failure modes are minor or contained" },
        { level: "medium", label: "Some exposure — manageable with normal oversight" },
        { level: "high", label: "Significant exposure — failure would be costly or hard to reverse" },
      ],
    },
    keywords: ["risk"],
  },
  {
    id: "longTerm",
    short: "Long-term",
    name: "Long-term effect",
    definition: "Whether the benefit lasts, or decays once attention moves elsewhere.",
    direction: "higherStronger",
    question: {
      label: "Does the benefit last, or decay once attention moves elsewhere?",
      instruction: "Picture the initiative eighteen months after launch day.",
      options: [
        { level: "low", label: "Likely fades once the initial push ends" },
        { level: "medium", label: "Holds if it keeps being actively maintained" },
        { level: "high", label: "Self-sustaining — keeps paying off unprompted" },
      ],
    },
    keywords: ["long-term", "long term", "durab", "lasting", "decay"],
  },
  {
    id: "controllability",
    short: "Control.",
    name: "Controllability",
    definition: "Whether the organisation can steer and govern it once it exists.",
    direction: "higherStronger",
    question: {
      label: "Can the organisation steer and govern this once it's running?",
      instruction: "Ask who can change the rules it runs by — us, or a vendor.",
      options: [
        { level: "low", label: "Runs largely outside our control (vendor-locked, opaque)" },
        { level: "medium", label: "Steerable, but needs deliberate effort" },
        { level: "high", label: "We set — and can change — the rules it runs by" },
      ],
    },
    keywords: ["controllab", "steer", "govern"],
  },
];

export const dimensionById = (id: DimensionId): Dimension => DIMENSIONS.find((d) => d.id === id)!;

// ---------------------------------------------------------------------------
// The three candidate lines of measures
// ---------------------------------------------------------------------------

export type OptionId = "a" | "b" | "c";

export type OptionLine = {
  id: OptionId;
  letter: string;
  icon: IconKey;
  title: string;
  description: string;
  radarStyle: { color: "accent" | "ink" | "warn"; dash?: string; marker: "circle" | "square" | "triangle" };
};

export const OPTION_LINES: OptionLine[] = [
  {
    id: "a",
    letter: "A",
    icon: "chip",
    title: "Accelerated AI introduction",
    description: "Accelerated introduction of AI-based systems for efficiency and process optimisation.",
    radarStyle: { color: "accent", marker: "circle" },
  },
  {
    id: "b",
    letter: "B",
    icon: "network",
    title: "Innovation & governance framework",
    description:
      "Building an innovation & governance framework that systematically assesses new IT innovations by sustainability impact, resource requirements, and strategic benefit.",
    radarStyle: { color: "ink", dash: "7 4", marker: "square" },
  },
  {
    id: "c",
    letter: "C",
    icon: "recycleLoop",
    title: "Circular IT programme",
    description: "Introducing a circular IT programme with take-back, refurbishment, and reuse logic as a visible structural measure.",
    radarStyle: { color: "warn", dash: "2 3", marker: "triangle" },
  },
];

export const optionById = (id: OptionId): OptionLine => OPTION_LINES.find((o) => o.id === id)!;

/**
 * What each line involves, and one neutral fact per line for each dimension.
 * Facts only — never a level, never a ranking, and never an evaluative word
 * such as "strong" or "weak" (DEPTH-UPGRADE-PROMPT §4.1). They are what a
 * learner reasons from when answering the seven questions; the level is still
 * their own call.
 */
export const OPTION_FACTS: Record<OptionId, { involves: string[]; byDimension: Record<DimensionId, string> }> = {
  a: {
    involves: [
      "Rolling out AI-based systems for efficiency and process optimisation in several areas.",
      "Models, data pipelines and running infrastructure to build and operate.",
      "FutureGrid has no shared way of judging AI use cases yet (case brief).",
    ],
    byDimension: {
      leverage: "Each AI use case is deployed and evaluated on its own.",
      innovation: "AI-based systems are planned for FutureGrid's operations but not yet deployed there.",
      sustainability: "The energy a use case saves can be measured; the compute it needs can be measured too, but has not been counted yet.",
      feasibility: "Off-the-shelf tools exist; it needs data engineers and compute capacity.",
      risk: "If a use case fails or its compute cost grows, the spend is already committed.",
      longTerm: "Models need retraining, monitoring and data upkeep to keep their benefit.",
      controllability: "Models and platforms often come from external vendors with their own update cycles.",
    },
  },
  b: {
    involves: [
      "Defining criteria for sustainability impact, resource requirements and strategic benefit.",
      "Naming an owner, an approval path and a review cycle.",
      "A first prioritisation of the initiatives that are already planned.",
      "The output is a way of deciding, not a deployed technology.",
    ],
    byDimension: {
      leverage: "Every later initiative would be assessed through the same criteria.",
      innovation: "Assessment frameworks exist in other organisations; FutureGrid has none for innovation today.",
      sustainability: "The framework itself saves no energy; it changes which initiatives go ahead.",
      feasibility: "Needs management time and a named owner; there is no new technology to buy.",
      risk: "If it fails, the cost is management time and a delayed first decision.",
      longTerm: "The criteria stay in force for as long as reviews keep using them.",
      controllability: "FutureGrid writes the criteria itself and can change them.",
    },
  },
  c: {
    involves: [
      "Take-back of used devices, refurbishment and reuse.",
      "Logistics, refurbishment capacity and supplier arrangements to set up.",
      "A result that can be counted: devices returned, refurbished and redeployed.",
    ],
    byDimension: {
      leverage: "Changes how devices are handled; other decisions keep their current process.",
      innovation: "Take-back and refurbishment are established practice elsewhere; for FutureGrid it would be a new flow.",
      sustainability: "Devices kept in use longer reduce new purchases and e-waste directly.",
      feasibility: "Needs logistics, refurbishment capacity and supplier agreements to be arranged.",
      risk: "If return volumes or refurbishment yields disappoint, the running costs remain.",
      longTerm: "Take-back keeps running for as long as suppliers and return volumes stay in place.",
      controllability: "Depends on refurbishment partners and supplier terms as well as internal policy.",
    },
  },
};

// ---------------------------------------------------------------------------
// Task framing
// ---------------------------------------------------------------------------

export const TASK2_FRAMING = {
  tag: "TASK 2 · DECIDE",
  title: "Which line of measures should be prioritised first?",
  minutes: 15,
  lead: "Budget is limited. Management wants a visible signal about the future. Finance and operations warn about follow-up costs and complexity. Data on real ROI is only partly available.",
  instruction:
    "You can push only one central line of measures first. Assess, choose, and defend your choice — even with incomplete information.",
} as const;

export const CONTEXT_CHIPS_L2: string[] = [
  "Limited budget",
  "Management wants visible progress",
  "Incomplete ROI data",
  "Departments prefer fast tech adoption",
  "Finance and operations warn of cost and complexity",
];

export const PHASE1_INSTRUCTION =
  "Answer all seven questions for each line. The levels you choose are what draw that line's radar below — nothing is dragged in blind.";

export const PHASE2_INTRO = {
  heading: "Decide and justify",
  body: "Pick one line as first priority, then defend it — even though the ROI data stays incomplete.",
} as const;

export const PRIORITY_FIELD = {
  label: "Which line do you prioritise first?",
  instruction: "One pick. The three radars above are your evidence — use them.",
} as const;

export const JUSTIFICATION_FIELD = {
  label: "Justification",
  instruction: "Defend your pick even though ROI data is incomplete — reference at least two of the seven dimensions.",
  placeholder: "e.g. Scores high on Controllability and Long-term effect even though Feasibility is only Medium, because…",
} as const;

export const FOLLOWUP_FIELDS = [
  { id: 0, label: "First follow-up decision", instruction: "What must be decided next because of this choice — the very next call, not a whole roadmap." },
  { id: 1, label: "Second follow-up decision", instruction: "A second decision this choice now forces, distinct from the first." },
  { id: 2, label: "Third follow-up decision", instruction: "A third — e.g. who owns it, what gets deprioritised, or what gets measured first." },
] as const;

export const RISK_FIELDS = [
  { id: 0, label: "Risk 1 — if this looked good but was structurally weak" },
  { id: 1, label: "Risk 2 — if this looked good but was structurally weak" },
] as const;
export const RISK_INSTRUCTION =
  "Name a concrete risk if your pick turns out to be attractive-but-weak (C9) — symbolic politics, misinvestment, or rebound, not a vague \"it might not work.\"";

export const CHECK2_LABELS = {
  check: "Check my reasoning",
  recheck: "Check again",
  holds: "✓ This holds up — the standard objection to this pick is pre-empted.",
  needsDimensions: "✕ Not yet checkable — the justification doesn't reference two of the seven dimensions yet.",
  wrongTier1: "✕ Doesn't hold up yet — here is a first clue.",
  wrongTier2: "✕ Still doesn't hold up — a sharper clue, since you've checked this before.",
} as const;

// ---------------------------------------------------------------------------
// The clue engine — never names the "right" line, only the standard
// objection to whichever line was picked, and whether it has been pre-empted.
// ---------------------------------------------------------------------------

const DIMENSION_REFERENCE_CLUE: ClueTier = {
  soft: "Name at least two of the seven dimensions from C7 that this pick wins or loses on — not just that you like it.",
  sharp: "Point at your own radar. Which two axes are doing the actual work in this argument? Name them by their C7 names.",
};

/** Keywords in the justification that count as pre-empting each pick's standard objection. */
const OBJECTION_KEYWORDS: Record<OptionId, string[]> = {
  a: ["framework", "criteria", "assess", "governance", "use case", "which ai", "which use"],
  b: ["signal", "visible", "speed", "fast", "quickly", "momentum", "too slow"],
  c: ["criteria", "prioriti", "select", "which device", "steer", "govern", "assess"],
};

const OBJECTION_CLUE: Record<OptionId, ClueTier> = {
  a: {
    soft: "You're accelerating before you can assess. What tells you which AI use case is actually worth its compute?",
    sharp: "Re-read C8: an AI rollout with no assessment logic behind it is a point solution repeated three times, not an enabler. What in your justification answers \"worth it compared to what\"?",
  },
  b: {
    soft: "A framework is strong on control — but management wants a visible signal. How do you answer the \"too slow\" objection?",
    sharp: "C6 is the test here: a framework that produces its first decision in month nine has moved the risk downstream, not removed it. What in your justification shows an early, visible output from this line?",
  },
  c: {
    soft: "A visible programme is not the same as a portfolio you can steer. What decides which devices enter the loop first?",
    sharp: "C7's Controllability axis is the gap: without stated criteria, \"circular\" describes an intention, not a governed process. What in your justification names the selection logic?",
  },
};

export function dimensionsReferenced(justification: string): DimensionId[] {
  const lower = justification.toLowerCase();
  return DIMENSIONS.filter((d) => d.keywords.some((k) => lower.includes(k))).map((d) => d.id);
}

export type Check2Result =
  | { holds: true }
  | { holds: false; reason: "dimensions" | "objection"; clue: string; tier: "soft" | "sharp" };

/**
 * The check never reveals which line is "right" — it only tests two generic,
 * pick-agnostic requirements: does the justification cite real evidence
 * (≥2 dimensions), and has the standard objection to *this* pick been
 * addressed. Both requirements exist for all three picks equally.
 */
export function checkPriority(
  pick: OptionId,
  justification: string,
  checkCountAfter: number,
): Check2Result {
  const tier: "soft" | "sharp" = checkCountAfter >= 2 ? "sharp" : "soft";
  const referenced = dimensionsReferenced(justification);
  if (referenced.length < 2) {
    return { holds: false, reason: "dimensions", clue: DIMENSION_REFERENCE_CLUE[tier], tier };
  }
  const lower = justification.toLowerCase();
  const addressed = OBJECTION_KEYWORDS[pick].some((k) => lower.includes(k));
  if (!addressed) {
    return { holds: false, reason: "objection", clue: OBJECTION_CLUE[pick][tier], tier };
  }
  return { holds: true };
}

// ---------------------------------------------------------------------------
// Mentor sample + answer key
// ---------------------------------------------------------------------------

/** A defensible sample profile per option, used by mentor auto-fill. */
export const SAMPLE_SCORES: Record<OptionId, Record<DimensionId, Level>> = {
  a: { leverage: "medium", innovation: "high", sustainability: "medium", feasibility: "high", risk: "high", longTerm: "low", controllability: "low" },
  b: { leverage: "high", innovation: "medium", sustainability: "high", feasibility: "medium", risk: "low", longTerm: "high", controllability: "high" },
  c: { leverage: "medium", innovation: "medium", sustainability: "high", feasibility: "medium", risk: "medium", longTerm: "medium", controllability: "medium" },
};

export const SAMPLE_PRIORITY: OptionId = "b";
export const SAMPLE_JUSTIFICATION =
  "Line B scores High on Strategic leverage and Controllability, and Low on Risk, because it is the enabler (C8) every future AI or circular initiative would then be assessed through — including line A's own use cases. To answer the \"too slow\" objection: the first assessment criteria and a first prioritisation can ship as a visible output within one quarter, before any individual technology is scaled.";
export const SAMPLE_FOLLOWUPS: string[] = [
  "Name who owns and chairs the assessment framework.",
  "Decide the first three initiatives it will be run against, including line A's AI use cases.",
  "Set a visible first checkpoint (e.g. one quarter) so it doesn't read as invisible to management.",
];
export const SAMPLE_RISKS: string[] = [
  "Symbolic politics if line C is chosen for visibility alone: a take-back programme launched before criteria exist can look like progress while the devices it processes are picked by convenience, not impact.",
  "Rebound if line A is scaled before an assessment framework exists: efficiency gains from AI optimisation get outpaced by the compute the AI itself adds, with no framework in place to have flagged that trade-off.",
];

export const ANSWER_KEY_L2: AnswerKeyBlock = {
  prompt: "Task 2 — Which line of measures should be prioritised first?",
  items: [
    {
      option: "B — Innovation & governance framework (recommended default)",
      verdict: "pick",
      why: "Highest Strategic leverage and Controllability, lowest Risk: it is the enabler (C8) that every later AI or circular initiative would then be assessed through, including line A's own use cases — the textbook-defensible pick when the exercise is genuinely open.",
    },
    {
      option: "A — Accelerated AI introduction",
      verdict: "avoid",
      why: "High Feasibility and Innovation effect make it the most immediately attractive-looking pick, but Risk is High and Controllability is Low with no assessment logic yet in place — exactly C9's misinvestment/rebound pattern if scaled first.",
    },
    {
      option: "C — Circular IT programme",
      verdict: "avoid",
      why: "Genuinely strong Sustainability impact and a real structural measure, but Medium Controllability without stated selection criteria means \"which devices first\" is undecided — visible, but not yet steerable.",
    },
  ],
  teachingNote:
    "This is a genuinely open exercise, not a disguised single-answer one — the material explicitly withholds a model priority. A learner who picks A or C defensibly (naming the AI-momentum or steerability risk up front, per the clue engine) should be graded on the *quality of the defence*, not marked down for disagreeing with B. Use this key to answer a participant who pushes back: B is the safer, lower-risk, higher-control pick; A is the fastest visible win if the organisation already trusts its own AI use-case judgement; C is the strongest sustainability story if governance can be added quickly after launch. The check judges only two things and never names a line as right: the justification cites at least two of the seven dimensions, and the standard objection to whichever line was picked is pre-empted (matched by keyword, per line). The 21 per-cell facts are neutral on purpose — a learner who rates from them, not from the technology category, is doing what C7 asks.",
};

/** Material this task draws on, for MaterialRefs chips. */
export const TASK2_MATERIAL_REFS: MaterialSectionId[] = ["uncertainty", "dimensions", "enablerVsPoint", "attractiveWeak"];
