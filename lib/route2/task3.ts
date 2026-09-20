/**
 * Route 2's task — "Develop a management proposal", ~20 minutes, Level 3, at
 * NovaCircular Technologies. Core: two related tasks — (1) the canvas and (2) elements
 * 1, 3 and 5 with the first-measure pick. Optional: elements 2, 4, 6, 7 and the horizon
 * classifier, kept in full. A two-stage builder: Stage 1 connects six
 * building blocks into a decision architecture (never a plain list — the
 * connections are what prove it routes as one framework, D1); Stage 2 is the
 * guided seven-element proposal, assembling as a live document beside it.
 *
 * "Check my proposal" never reveals the model recommendation — it only tests
 * fixed, factual coverage (does element 3 name all four D2 criteria; is the
 * first-measure pick the structurally weak kind the material warns about; do
 * the horizon classifications actually span more than one band) and returns a
 * clue for whichever gap is found (CLAUDE.md §4).
 */

import type { AnswerKeyBlock } from "@/lib/answerKey";
import type { IconKey } from "@/lib/routes";
import type { MaterialSectionId } from "./sections";

// ---------------------------------------------------------------------------
// Stage 1 — the six canvas blocks
// ---------------------------------------------------------------------------

export type BlockId = "aiUse" | "portfolio" | "circular" | "investment" | "governance" | "review";

export type Block = { id: BlockId; label: string; icon: IconKey; note: string; pos: { x: number; y: number } };

export const BLOCKS: Block[] = [
  { id: "aiUse", label: "AI use", icon: "chip", note: "Where AI is applied, and what it costs to run.", pos: { x: 90, y: 40 } },
  { id: "portfolio", label: "Innovation portfolio", icon: "layers", note: "The full set of candidate initiatives, compared, not judged alone.", pos: { x: 270, y: 40 } },
  { id: "circular", label: "Circular economy", icon: "recycleLoop", note: "Take-back, refurbishment, reuse — what stays in the loop.", pos: { x: 40, y: 160 } },
  { id: "investment", label: "Investment logic", icon: "coins", note: "Cost, payback, follow-on burden under uncertainty.", pos: { x: 320, y: 160 } },
  { id: "governance", label: "Governance", icon: "gavel", note: "Who proposes, who signs off, how it's revisited.", pos: { x: 130, y: 250 } },
  { id: "review", label: "Management review", icon: "clipboard", note: "The standing forum a decision is anchored in.", pos: { x: 250, y: 250 } },
];

export const blockById = (id: BlockId): Block => BLOCKS.find((b) => b.id === id)!;

/** Canonical, order-independent key for a connection between two blocks. */
export function connectionKey(a: BlockId, b: BlockId): string {
  return [a, b].sort().join(":");
}

// ---------------------------------------------------------------------------
// Stage 2 — the first-measure selector (never reveals a model answer)
// ---------------------------------------------------------------------------

export type FirstMeasureId = "framework" | "ai" | "circular";

export const FIRST_MEASURE_OPTIONS: { id: FirstMeasureId; label: string }[] = [
  { id: "framework", label: "Build the assessment framework first" },
  { id: "ai", label: "Scale AI first" },
  { id: "circular", label: "Launch the circular programme first" },
];

export const FIRST_MEASURE_CLUE: Record<Exclude<FirstMeasureId, "framework">, [soft: string, sharp: string]> = {
  ai: [
    "A visible initiative before an assessment logic — how will you tell a good AI use case from an expensive one?",
    "Without criteria, which AI use case gets the compute first, and who decides? If you keep this pick, say in element 5 how that gap is handled in the meantime.",
  ],
  circular: [
    "A visible circular programme before criteria exist — which devices enter the loop first, and who decided that?",
    "Without criteria, the choice of which devices go first is made by convenience. If you keep this pick, say in element 5 how that choice will be governed meanwhile.",
  ],
};

export const FIRST_MEASURE_FIELD = {
  label: "First-measure selector",
  instruction: "Choose the first move NovaCircular actually makes. This decision is element 5 of the proposal.",
} as const;

// ---------------------------------------------------------------------------
// Stage 2 — the seven proposal elements
// ---------------------------------------------------------------------------

export const ELEMENT_1 = {
  n: 1,
  label: "1. Strategic relevance",
  instruction: "Why sustainable IT innovation, AI, and the circular economy matter for this company specifically — not a generic industry statement.",
  placeholder: "e.g. NovaCircular's growth plan depends on…",
  material: ["architecture"] as MaterialSectionId[],
};

export const GUIDING_DECISION_FIELDS = [
  { id: 0, label: "Guiding decision 1", instruction: "A decision management must take in the next 12 months." },
  { id: 1, label: "Guiding decision 2", instruction: "A second, distinct decision in the same window." },
  { id: 2, label: "Guiding decision 3", instruction: "A third, distinct decision in the same window." },
] as const;
export const GUIDING_DECISIONS_LABEL = "2. Three guiding decisions for the next 12 months";

export const ELEMENT_3 = {
  n: 3,
  label: "3. Decision logic",
  instruction: "By which criteria do future initiatives get assessed and prioritised? Name all four from D2 — benefit, resource/load, strategic viability, controllability.",
  placeholder: "e.g. Every initiative is scored on measured benefit, resource and load effect, whether it can run at scale, and…",
  material: ["assessmentLogic"] as MaterialSectionId[],
};

export const ELEMENT_4 = {
  n: 4,
  label: "4. Central trade-offs",
  instruction: "Between innovation speed, resource requirements, market potential, viability, circularity, and manageability.",
  placeholder: "e.g. Moving fast on AI trades against resource load; visible circularity trades against near-term margin…",
  material: ["assessmentLogic", "horizons"] as MaterialSectionId[],
};

export const ELEMENT_5_WHY = {
  n: 5,
  label: "5. Why this first",
  instruction: "Justify the first-measure pick above — this is element 5 in full: the line of measures plus why.",
  placeholder: "e.g. Framework first because…",
  material: ["architecture", "assessmentLogic"] as MaterialSectionId[],
};

export const ELEMENT_6 = {
  n: 6,
  label: "6. Roles, responsibilities, approval, review",
  instruction: "Cover all four governance-loop stages from D3 — propose, assess, approve/park, review — not only \"who approves.\"",
  placeholder: "e.g. Any team can propose; the framework owner assesses against the four criteria; the steering committee…",
  material: ["governance"] as MaterialSectionId[],
};

export const ELEMENT_7 = {
  n: 7,
  label: "7. The decision to take now",
  instruction: "Despite incomplete information — name the one decision that cannot wait for full data.",
  placeholder: "e.g. Regardless of which line scales first, NovaCircular decides now to…",
  material: ["governance", "horizons"] as MaterialSectionId[],
};

// ---------------------------------------------------------------------------
// Stage 2 — the horizon classifier (reinforces D4)
// ---------------------------------------------------------------------------

export type Horizon = "short" | "medium" | "structural";
export const HORIZONS: { id: Horizon; label: string }[] = [
  { id: "short", label: "Short-term" },
  { id: "medium", label: "Medium-term" },
  { id: "structural", label: "Structural" },
];

export type CandidateMeasure = { id: string; text: string };

export const CANDIDATE_MEASURES: CandidateMeasure[] = [
  { id: "m1", text: "Define the four assessment criteria and publish them" },
  { id: "m2", text: "Run a pilot of the AI load-optimisation use case under the new criteria" },
  { id: "m3", text: "Launch the first device take-back and refurbishment loop" },
  { id: "m4", text: "Make the assessment framework a standing agenda item in every portfolio review" },
  { id: "m5", text: "Publish a first prioritisation of the three initiatives already in flight" },
  { id: "m6", text: "Give the framework a formal review cadence inside management reviews" },
];

// ---------------------------------------------------------------------------
// Task framing
// ---------------------------------------------------------------------------

export const TASK3_FRAMING = {
  tag: "THE TASK",
  title: "Develop a management proposal",
  minutes: 20,
  lead: "Two related tasks. Task 1: connect the six building blocks into one architecture. Task 2: write the core of the proposal — why it matters, the decision logic and the first move — using that architecture.",
  instruction:
    "Do not hand management a list of nice ideas — hand them a decision architecture, including the one decision that must be made now despite incomplete information.",
  gradingLens: "Grading lens: a robust decision architecture, not a collection of ideas.",
} as const;

export const CANVAS_INSTRUCTION =
  "Connect the six blocks so every one routes through the framework, not stands alone (D1). Drag from one block to another to connect them, or tap one block then tap a second to link them — tap a connected pair again to remove it.";

export const CHECK3_LABELS = {
  check: "Check my proposal",
  recheck: "Check again",
  holds: "Reads as an architecture, not a list of ideas.",
  wrongTier1: "Not quite there yet — here is a first clue.",
  wrongTier2: "Still open — a sharper clue, since you've checked this before.",
} as const;

// ---------------------------------------------------------------------------
// Keys shown at the point of use — the four criteria (element 3), the four loop
// stages (element 6) and the three time bands (the classifier). All defined in
// D2 / D3 / D4 first; nothing here is new teaching.
// ---------------------------------------------------------------------------

export const CRITERIA: { id: string; label: string; asks: string; regex: RegExp }[] = [
  { id: "benefit", label: "benefit", asks: "What net effect is measured, not claimed?", regex: /benefit/i },
  { id: "resource", label: "resource/load", asks: "What does it add in compute, energy, data and hardware?", regex: /resource|\bloads?\b|compute|footprint/i },
  { id: "viability", label: "strategic viability", asks: "Can it run at scale, last, and be run by this organisation?", regex: /viab|\bscal(e|es|ing|able)\b|staying power/i },
  { id: "controllability", label: "controllability", asks: "Can we steer and change its rules once it runs?", regex: /controllab|\bsteer|\bcontrol\b/i },
];

export const LOOP_STAGES: { id: string; label: string; role: string; asks: string; regex: RegExp }[] = [
  { id: "propose", label: "propose", role: "Any team or sponsor", asks: "What is being asked for, and what benefit is claimed?", regex: /propos|submit|sponsor/i },
  { id: "assess", label: "assess", role: "The framework owner", asks: "Does it clear the four criteria?", regex: /assess|evaluat|\bscor(e|es|ed|ing)\b|test/i },
  { id: "approve", label: "approve or park", role: "A steering group", asks: "Given the whole portfolio, does this go ahead now, or wait?", regex: /approv|\bpark|sign[- ]?off|steering|committee/i },
  { id: "review", label: "review", role: "Management review", asks: "Did it deliver, and what changes for next time?", regex: /review|revisit|renew|reassess/i },
];

/** What each first measure involves — facts only, never a ranking. */
export const FIRST_MEASURE_FACTS: Record<FirstMeasureId, string> = {
  framework: "Agrees the criteria, an owner and a review cycle. The output is a way of deciding; no technology is deployed yet.",
  ai: "Rolls AI out early. Needs models, data and running compute; the benefit is expected quickly, before criteria exist to compare AI use cases.",
  circular: "Launches take-back and refurbishment early. Needs logistics and partners; the result is visible, before criteria exist for which devices enter the loop.",
};

export const BANDS_KEY: { id: Horizon; label: string; produces: string; ask: string }[] = [
  { id: "short", label: "Short-term", produces: "A decision, not a deployment", ask: "Could it be decided and published now, without building anything?" },
  { id: "medium", label: "Medium-term", produces: "A pilot or a first loop under the criteria", ask: "Does it test something in practice, on a limited scale?" },
  { id: "structural", label: "Structural", produces: "A permanent place in how decisions are made", ask: "Does it stop the framework depending on any one champion?" },
];

/** Band each candidate measure belongs to (mentor key + the check). Judged by what the measure produces. */
export const HORIZON_EXPECTED: Record<string, Horizon> = {
  m1: "short",
  m5: "short",
  m2: "medium",
  m3: "medium",
  m4: "structural",
  m6: "structural",
};

// ---------------------------------------------------------------------------
// The clue engine — a verdict per area, never a model answer (CLAUDE.md §4)
// ---------------------------------------------------------------------------

export function missingCriterion(decisionLogicText: string): string | null {
  const missing = CRITERIA.find((c) => !c.regex.test(decisionLogicText));
  return missing ? missing.label : null;
}

export function missingStage(governanceText: string): string | null {
  const missing = LOOP_STAGES.find((st) => !st.regex.test(governanceText));
  return missing ? missing.label : null;
}

/** Connected groups of blocks (union-find over the drawn links). One group = one architecture. */
export function blockGroups(edges: [BlockId, BlockId][]): BlockId[][] {
  const parent: Record<string, string> = Object.fromEntries(BLOCKS.map((b) => [b.id, b.id]));
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const [x, y] of edges) parent[find(x)] = find(y);
  const groups = new Map<string, BlockId[]>();
  for (const bl of BLOCKS) {
    const root = find(bl.id);
    groups.set(root, [...(groups.get(root) ?? []), bl.id]);
  }
  return [...groups.values()];
}

/** Words that show a non-framework first measure has pre-empted the standard objection: criteria do not exist yet. */
const OBJECTION_PREEMPT = /criteria|framework|assess|govern|which (ai|use case|device)|prioriti|select|interim|in parallel|alongside|trade-?off/i;

export type CheckArea = "canvas" | "logic" | "governance" | "firstMeasure" | "horizon" | "complete";
export type CheckRow = { area: CheckArea; label: string; ok: boolean; clue?: string };
export type Check3Result = { holds: boolean; tier: "soft" | "sharp"; rows: CheckRow[] };

export function checkProposal(args: {
  groups: BlockId[][];
  firstMeasure: FirstMeasureId | null;
  element3: string;
  element4: string;
  element5Why: string;
  element6: string;
  horizons: Record<string, Horizon | null>;
  elementsComplete: boolean;
  checkCountAfter: number;
}): Check3Result {
  const tier: "soft" | "sharp" = args.checkCountAfter >= 2 ? "sharp" : "soft";
  const pick = (soft: string, sharp: string) => (tier === "soft" ? soft : sharp);
  const rows: CheckRow[] = [];

  // 1. Decision architecture: one connected whole, not islands
  const groups = args.groups;
  rows.push({
    area: "canvas",
    label: "Decision architecture",
    ok: groups.length === 1,
    clue:
      groups.length === 1
        ? undefined
        : pick(
            `The canvas has ${groups.length} separate groups. The framework should route the whole portfolio, not several islands (D1) — which block could join them?`,
            `Separate groups right now: ${groups.map((g) => g.map((id) => blockById(id).label).join(" + ")).join("  |  ")}. A link between groups is what turns clusters into one architecture.`,
          ),
  });

  // 2. Decision logic: all four criteria, by name
  const missingC = missingCriterion(args.element3);
  rows.push({
    area: "logic",
    label: "Decision logic (element 3)",
    ok: !missingC,
    clue: missingC
      ? pick(
          `Element 3 doesn't mention ${missingC} — re-read the four criteria in D2.`,
          `D2 names four criteria for a reason: an initiative that skips one is exactly the "assessed on enthusiasm" pattern. Add ${missingC} explicitly.`,
        )
      : undefined,
  });

  // 3. Governance (optional): all four loop stages — only checked once element 6 has been started
  const missingS = missingStage(args.element6);
  if (args.element6.trim()) {
    rows.push({
      area: "governance",
      label: "Roles and governance (optional element 6)",
      ok: !missingS,
      clue: missingS
        ? pick(
            `Element 6 doesn't cover the ${missingS} stage — the loop in D3 has four stages, not only "who approves".`,
            `Without ${missingS}, the loop is broken (D3): say who does it and what question they ask.`,
          )
        : undefined,
    });
  }

  // 4. First measure: framework passes; AI or circular passes only with the objection pre-empted
  let fmOk = false;
  let fmClue: string | undefined;
  if (!args.firstMeasure) {
    fmClue = "No first measure is picked yet.";
  } else if (args.firstMeasure === "framework") {
    fmOk = true;
  } else if (OBJECTION_PREEMPT.test(`${args.element4} ${args.element5Why}`)) {
    fmOk = true;
  } else {
    fmClue = pick(FIRST_MEASURE_CLUE[args.firstMeasure][0], FIRST_MEASURE_CLUE[args.firstMeasure][1]);
  }
  rows.push({ area: "firstMeasure", label: "First measure", ok: fmOk, clue: fmClue });

  // 5. Horizons: item-level only — how many placements hold, never which
  const classified = CANDIDATE_MEASURES.filter((m) => args.horizons[m.id]);
  let hOk = false;
  let hClue: string | undefined;
  if (classified.length < CANDIDATE_MEASURES.length) {
    const n = CANDIDATE_MEASURES.length - classified.length;
    hClue = `${n} measure${n === 1 ? "" : "s"} still unclassified.`;
  } else {
    const holding = CANDIDATE_MEASURES.filter((m) => args.horizons[m.id] === HORIZON_EXPECTED[m.id]).length;
    hOk = holding === CANDIDATE_MEASURES.length;
    const distinct = new Set(CANDIDATE_MEASURES.map((m) => args.horizons[m.id]));
    if (!hOk) {
      hClue = pick(
        `${holding} of ${CANDIDATE_MEASURES.length} placements hold up. For each measure ask what it produces: a decision, a pilot or first loop, or a permanent place in how decisions are made (D4).`,
        `${holding} of ${CANDIDATE_MEASURES.length} placements hold up${distinct.size === 1 ? " — and every measure sits in one band, which is itself a warning sign" : ""}. Ask of each one: could it be decided now (short), does it test something in practice (medium), or does it outlast any one champion (structural)?`,
      );
    }
  }
  // Optional: only checked once at least one measure has been classified
  if (classified.length > 0) rows.push({ area: "horizon", label: "Time horizons (optional)", ok: hOk, clue: hClue });

  // 6. Nothing to judge on empty elements
  if (!args.elementsComplete) {
    rows.push({ area: "complete", label: "Complete proposal", ok: false, clue: "A core element is still empty — the list at the bottom names it." });
  }

  return { holds: rows.every((r) => r.ok), tier, rows };
}

// ---------------------------------------------------------------------------
// Mentor sample + answer key
// ---------------------------------------------------------------------------

export const SAMPLE_CONNECTIONS: [BlockId, BlockId][] = [
  ["governance", "portfolio"],
  ["portfolio", "aiUse"],
  ["portfolio", "circular"],
  ["investment", "portfolio"],
  ["review", "governance"],
  ["governance", "investment"],
];

export const SAMPLE_ELEMENT_1 =
  "NovaCircular's growth plan depends on being trusted with sustainability claims by both customers and regulators — AI and circularity are the two levers with the most reach, and the biggest downside if either is oversold.";
export const SAMPLE_GUIDING_DECISIONS = [
  "Approve the four-criteria assessment framework and name its owner.",
  "Decide which of the in-flight AI and circular initiatives get evaluated first under it.",
  "Set the first portfolio review date the framework will report into.",
];
export const SAMPLE_ELEMENT_3 =
  "Every initiative is scored on measured benefit, its resource and load effect, whether it is strategically viable at full scale, and how controllable it is once running — no initiative advances on novelty or enthusiasm alone.";
export const SAMPLE_ELEMENT_4 =
  "Innovation speed trades against resource requirements (faster AI rollout means less time to size its compute load); visible circularity trades against near-term market potential (a slower, better-governed programme is a weaker press release); and viability trades against manageability (the most ambitious option is rarely the one we can steer).";
export const SAMPLE_FIRST_MEASURE: FirstMeasureId = "framework";
export const SAMPLE_ELEMENT_5_WHY =
  "Framework first: every later AI or circular decision becomes cheaper to evaluate once the criteria exist, and it is the one move that is genuinely correct regardless of which individual initiative eventually wins funding.";
export const SAMPLE_ELEMENT_6 =
  "Any team may propose. The framework owner assesses against the four D2 criteria. A steering committee approves or parks each proposal against portfolio capacity. Every approved initiative reports into the quarterly management review, where it is renewed, adjusted, or closed.";
export const SAMPLE_ELEMENT_7 =
  "Regardless of which line scales first, NovaCircular decides now to fund the assessment framework and name its owner — everything else can wait one quarter for real data; this cannot, because every quarter without it is another initiative evaluated on enthusiasm.";

export const SAMPLE_HORIZONS: Record<string, Horizon> = HORIZON_EXPECTED;

export const ANSWER_KEY_L3: AnswerKeyBlock = {
  prompt: "Task 2 — First-measure selector",
  items: [
    {
      option: "Build the assessment framework first (expected)",
      verdict: "pick",
      why: "This is CircularMind's own lesson in the material: every AI or circular decision made before criteria exist has to be re-litigated once they do. Framework first is cheaper in total, not just safer.",
    },
    {
      option: "Scale AI first",
      verdict: "avoid",
      why: "Fast and visible, but repeats CircularMind's AI pilot mistake — no criteria yet to say which use case is worth its compute, which is exactly what let the compute bill outgrow the saving.",
    },
    {
      option: "Launch the circular programme first",
      verdict: "avoid",
      why: "Genuinely strong sustainability story, but without criteria there is no basis for which devices enter the loop first — visible, not yet steerable, the same gap CircularMind's take-back trial had.",
    },
  ],
  teachingNote:
    "Unlike Route 1's Task 2 (deliberately open), this exercise does have a taught, defensible answer — the worked example exists specifically to teach it. The check accepts AI or circular first only when element 4 or element 5 names how the missing criteria are handled meanwhile (words such as criteria, framework, assess, governance, interim, alongside, trade-off). A participant who argues for AI or circular first under real urgency (e.g. a board demanding a visible win this quarter) has a legitimate practical point — that is exactly what the check lets through, provided they state the sequencing risk as a trade-off instead of pretending it isn't there.",
};

/** Stage 1 — the canvas has no single right drawing, so the key states what the check accepts and rejects. */
export const ANSWER_KEY_CANVAS: AnswerKeyBlock = {
  prompt: "Task 1 — the decision-architecture canvas",
  items: [
    {
      option: "One connected group (accepted)",
      verdict: "pick",
      why: "Every block is linked to the rest, directly or through others, so an initiative entering anywhere meets the same logic. D1's rule: the framework routes the whole portfolio.",
    },
    {
      option: "Every block linked, but in two or more separate groups (rejected)",
      verdict: "avoid",
      why: "No orphan, yet the framework only routes part of the portfolio — e.g. AI use and the portfolio joined, circular economy and governance joined, nothing between the pairs. Islands, not architecture.",
    },
    {
      option: "One or more orphaned blocks (rejected)",
      verdict: "avoid",
      why: "A block with no link is the scattered-initiative pattern D1 warns about, made visible.",
    },
  ],
  teachingNote:
    "The check accepts any drawing that ends as one connected group. There is no required hub: the sample links go through Innovation portfolio and Governance, but a learner who routes through Investment logic is equally valid. Ask them why their central blocks are the central ones.",
};

/** Stage 2 — the horizon classifier: expected band per measure, with a reason for each. */
export const ANSWER_KEY_HORIZONS: AnswerKeyBlock = {
  prompt: "Optional — time-horizon classifier",
  items: [
    { option: "Define the four assessment criteria and publish them — Short-term (expected)", verdict: "pick", why: "A decision, not a deployment: the criteria can be agreed and published now, and everything else depends on them." },
    { option: "Publish a first prioritisation of the three initiatives already in flight — Short-term (expected)", verdict: "pick", why: "A first prioritisation is a decision and a piece of transparency. It uses the criteria on initiatives that already exist; nothing is built." },
    { option: "Run a pilot of the AI load-optimisation use case under the new criteria — Medium-term (expected)", verdict: "pick", why: "A test in practice on a limited scale, under the agreed criteria. It needs the criteria first, so it cannot be short-term." },
    { option: "Launch the first device take-back and refurbishment loop — Medium-term (expected)", verdict: "pick", why: "A first loop, on a limited scale. It becomes structural only when it is governed as a permanent programme." },
    { option: "Make the framework a standing agenda item in every portfolio review — Structural (expected)", verdict: "pick", why: "It gives the framework a permanent place in how decisions are made, so it no longer depends on any one champion." },
    { option: "Give the framework a formal review cadence inside management reviews — Structural (expected)", verdict: "pick", why: "A permanent review mechanism inside management review. Whoever proposed it can leave and it keeps working." },
  ],
  teachingNote:
    "The test is what the measure produces, not how long it takes. Common counter-cases: a learner puts the take-back loop under Structural because circularity is 'permanent' — the loop is a first launch, the permanent part is governing it. A learner puts the first prioritisation under Medium because it needs data — it uses initiatives already in flight, so it can ship now. The check reports only how many placements hold up, never which.",
};

export const TASK3_MATERIAL_REFS: MaterialSectionId[] = ["architecture", "assessmentLogic", "governance", "horizons"];
