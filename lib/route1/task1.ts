/**
 * Task 1 — "Sustainable or just attractive?", the FutureGrid Technologies
 * diagnosis game. ~15 minutes, Level 1 only (Level 2 is a separate, later
 * prompt; nothing here assumes it has happened).
 *
 * The mechanic is decision-first, not drag-first: for each initiative the
 * learner answers two diagnostic questions, and the *combination* of those two
 * answers resolves the card into one of three zones. The zone is therefore
 * never a free pick and never a guess — it is the consequence of the learner's
 * own reasoning, which is why showing it immediately does not hand over an
 * answer. The learner then assigns the lens that names why.
 *
 * Feedback is clue-only and on request (CLAUDE.md §4): a check reports whether
 * an initiative's diagnosis holds as one item-level verdict — never which of
 * the two questions is wrong, since one of them is binary and naming it would
 * be the answer — plus a clue that sharpens on re-check.
 */

import type { AnswerKeyBlock } from "@/lib/answerKey";
import type { IconKey } from "@/lib/routes";
import type { MaterialSectionId } from "./sections";

// ---------------------------------------------------------------------------
// Zones — the three verdicts, taught in C5
// ---------------------------------------------------------------------------

export type ZoneId = "opportunity" | "mixed" | "risk";

export type Zone = {
  id: ZoneId;
  name: string;
  /** One line under the name — what lands here, never which initiative does. */
  note: string;
  icon: IconKey;
};

export const ZONES: Zone[] = [
  {
    id: "opportunity",
    name: "Sustainable opportunity",
    note: "Real net benefit, and the structure behind it holds — circular, impact-led or something the organisation can actually run.",
    icon: "target",
  },
  {
    id: "mixed",
    name: "Mixed — needs conditions",
    note: "Benefit and burden are both material, or the two signals disagree. Worth doing, but only with stated conditions attached.",
    icon: "layers",
  },
  {
    id: "risk",
    name: "Sustainability risk",
    note: "Adds load with weak impact logic behind it — linear, novelty-led, or unsupported by anything measurable.",
    icon: "shield",
  },
];

export const zoneById = (id: ZoneId): Zone => ZONES.find((z) => z.id === id)!;

// ---------------------------------------------------------------------------
// The two diagnostic questions
// ---------------------------------------------------------------------------

/** Q1 — asked of every initiative, in the same words. */
export type LoadAnswer = "reduces" | "adds" | "both";

export const LOAD_FIELD = {
  label: "Does this mainly reduce net resource use, or add compute and data load?",
  instruction:
    "Judge the net effect across the lifecycle, not the headline claim. \"Both\" is a real answer when benefit and burden are each material.",
  options: [
    { id: "reduces" as const, label: "Reduces net resource use", means: "The measurable effect is a reduction, even after counting any new load it brings." },
    { id: "adds" as const, label: "Adds compute / data load", means: "The main measurable effect is more compute, data or hardware, with no clear saving to set against it." },
    { id: "both" as const, label: "Both — genuinely unclear", means: "A measurable benefit and a measurable burden are each material. Use it only when there are two real effects." },
  ],
  material: ["novelty", "aiLoad"] as MaterialSectionId[],
};

/**
 * Q2 — one of three, whichever is most diagnostic for that initiative. All
 * three reduce to the same thing: does the structure behind the initiative
 * hold up, or not?
 */
export type StructureQuestionId = "circularLinear" | "impactNovelty" | "testedUntested";
export type StructureAnswer = "circular" | "linear" | "impact" | "novelty" | "tested" | "untested";

export const STRUCTURE_STRENGTH: Record<StructureAnswer, "strong" | "weak"> = {
  circular: "strong",
  linear: "weak",
  impact: "strong",
  novelty: "weak",
  tested: "strong",
  untested: "weak",
};

export const STRUCTURE_QUESTIONS: Record<
  StructureQuestionId,
  {
    label: string;
    instruction: string;
    options: { id: StructureAnswer; label: string }[];
    material: MaterialSectionId[];
  }
> = {
  circularLinear: {
    label: "Is this circular or linear?",
    instruction:
      "Circular keeps devices and components in use or brings them back; linear moves them through to disposal, however efficient the new hardware is.",
    options: [
      { id: "circular", label: "Circular" },
      { id: "linear", label: "Linear" },
    ],
    material: ["circular"],
  },
  impactNovelty: {
    label: "Is this prioritised by impact or by novelty?",
    instruction:
      "Impact-led means a named, measurable effect drove the proposal. Novelty-led means visibility, modernity or market optics did.",
    options: [
      { id: "impact", label: "Impact-led" },
      { id: "novelty", label: "Novelty-led" },
    ],
    material: ["novelty"],
  },
  testedUntested: {
    label: "Is the model organisationally tested or untested?",
    instruction:
      "Tested means FutureGrid already runs something like this today. Untested means it would be a first, which is execution risk — not a verdict on the direction.",
    options: [
      { id: "tested", label: "Tested" },
      { id: "untested", label: "Untested" },
    ],
    material: ["viability"],
  },
};

export const answerLabel = (id: LoadAnswer | StructureAnswer | null): string => {
  if (!id) return "— not answered";
  const load = LOAD_FIELD.options.find((o) => o.id === id);
  if (load) return load.label;
  for (const q of Object.values(STRUCTURE_QUESTIONS)) {
    const hit = q.options.find((o) => o.id === id);
    if (hit) return hit.label;
  }
  return "— not answered";
};

/**
 * The verdict rule, taught verbatim in C5: both signals pointing the same way
 * gives a clear verdict; any disagreement between them — including an honest
 * "both, unclear" on the load question — is Mixed.
 */
export function resolveZone(load: LoadAnswer, structure: StructureAnswer): ZoneId {
  const strong = STRUCTURE_STRENGTH[structure] === "strong";
  if (load === "reduces" && strong) return "opportunity";
  if (load === "adds" && !strong) return "risk";
  return "mixed";
}

/**
 * One sentence saying why a pair of answers gives its zone. Shown live on each
 * initiative card and in C5's playable rule, so the two never drift apart.
 */
export function zoneReason(load: LoadAnswer, structure: StructureAnswer, zone: ZoneId): string {
  const s = answerLabel(structure).toLowerCase();
  if (zone === "opportunity") return `Your first answer says it reduces net resource use, and your second (${s}) is on the right side. Both point the right way, so it lands in Sustainable opportunity.`;
  if (zone === "risk") return `Your first answer says it adds load, and your second (${s}) is on the wrong side. Both point the wrong way, so it lands in Sustainability risk.`;
  if (load === "both") return `"Both, unclear" is already a disagreement inside the first signal, so it lands in Mixed whichever way the structure (${s}) points.`;
  if (load === "reduces") return `The saving is real, but the structure behind it (${s}) is on the wrong side. The two signals disagree, so it lands in Mixed.`;
  return `The structure (${s}) is sound, but it adds load. The two signals disagree, so it lands in Mixed.`;
}

// ---------------------------------------------------------------------------
// The seven assessment lenses — taught in C4, used verbatim here
// ---------------------------------------------------------------------------

export type LensId =
  | "innovation"
  | "aiUse"
  | "resources"
  | "circular"
  | "businessModel"
  | "governance"
  | "investment";

export type Lens = {
  id: LensId;
  name: string;
  icon: IconKey;
  /** What the lens covers. */
  definition: string;
  /** The question it asks — the one to put to an initiative. */
  ask: string;
  /** When it is the decisive lens (rather than merely the topic). */
  useWhen: string;
  /** A short case in which this lens names the decisive issue. Never one of the six task initiatives. */
  example: string;
};

export const LENSES: Lens[] = [
  {
    id: "innovation",
    name: "Innovation",
    icon: "blueprint",
    definition: "Novelty versus real effect — is anything actually reduced, or does it only look advanced?",
    ask: "What does this reduce in absolute terms, beyond being new?",
    useWhen: "The decisive issue is that the case rests on being modern, with no named effect behind it.",
    example: "A team proposes a quantum-ready network refresh because it sounds advanced; no saving is named. The decisive issue is novelty versus real effect.",
  },
  {
    id: "aiUse",
    name: "AI use",
    icon: "chip",
    definition: "Benefit versus load — does what the application delivers justify the compute and data it consumes?",
    ask: "What does the AI deliver, and what does it run on to deliver it?",
    useWhen: "The decisive issue is a measurable AI benefit weighed against a real compute and data burden.",
    example: "A help-desk chatbot answers tickets faster, but every query runs a large model around the clock. The decisive issue is benefit weighed against load.",
  },
  {
    id: "resources",
    name: "Resource requirements",
    icon: "gauge",
    definition: "The energy, compute, storage and data footprint the initiative adds to the organisation.",
    ask: "How much energy, compute, storage and data does this add?",
    useWhen: "The decisive issue is the size of the footprint itself, not whether it pays for itself.",
    example: "A plan to keep every log for ten years triples storage. The decisive issue is the footprint it adds.",
  },
  {
    id: "circular",
    name: "Circular economy",
    icon: "recycleLoop",
    definition: "Loop versus linear — are devices and components kept in use, or pushed through to disposal?",
    ask: "Does this keep devices and components in use, or move them to disposal?",
    useWhen: "The decisive issue is whether hardware stays in the loop — take-back, reuse, repair, refurbishment.",
    example: "A hospital leases its bedside monitors and hands them back to the supplier for refurbishment after five years. The decisive issue is loop versus linear.",
  },
  {
    id: "businessModel",
    name: "Business model",
    icon: "supplier",
    definition: "How value is created and charged — product sale, as-a-service, take-back, or a new revenue line.",
    ask: "How is value created and paid for, and does that reward keeping things in use?",
    useWhen: "The decisive issue is how the offer is sold or charged, which decides who benefits from durability.",
    example: "A software firm moves from one-off licences to a subscription that includes updates. The decisive issue is how value is charged.",
  },
  {
    id: "governance",
    name: "Governance",
    icon: "gavel",
    definition: "The criteria, approval and oversight a decision runs through, and whether its output can be audited.",
    ask: "Who decides, by what criteria, and can anyone check afterwards?",
    useWhen: "The decisive issue is that nobody owns, approves or audits the decision.",
    example: "Three pilots were approved by three sponsors and never compared. The decisive issue is who decides, by what criteria.",
  },
  {
    id: "investment",
    name: "Investment logic",
    icon: "coins",
    definition: "Cost, return and payback when the numbers are still uncertain — what is committed against what is expected.",
    ask: "What is committed, what is expected back, and how sure is that?",
    useWhen: "The decisive issue is the money case: cost, payback or follow-on burden under uncertainty.",
    example: "A scheme needs a large upfront purchase and its payback depends on a price nobody can guarantee. The decisive issue is the money case.",
  },
];

/**
 * C4's practice case — deliberately NOT one of the six task initiatives (a
 * practice case must not reveal a task answer). The learner picks the lens they
 * think names the decisive issue; each pick gets a consequence, never "wrong".
 */
export const LENS_PRACTICE = {
  title: "Practice case — a regional retailer",
  body: "A regional retailer plans to replace its recommendation engine with a much larger AI model. The vendor demo is impressive. Nobody has said how much more compute the larger model needs, and the plan has no owner yet.",
  question: "Which lens names the decisive issue? Pick one.",
  /** What each pick means for this case. One is the decisive lens; two more are defensible; the rest are the topic, not the issue. */
  outcome: {
    aiUse: { fit: "decisive" as const, text: "This names the decisive issue: a larger model brings an unmeasured compute burden against a benefit nobody has quantified. It is a benefit-versus-load question." },
    resources: { fit: "defensible" as const, text: "Defensible — the added footprint is real. It names the cost side of the same trade-off, but not the missing benefit." },
    governance: { fit: "defensible" as const, text: "Defensible — no owner and no criteria is a real gap. But fixing governance would not by itself tell you whether the model is worth its load." },
    innovation: { fit: "topic" as const, text: "This describes the subject (a new model) more than the issue. The gap is not whether it is new, but what it costs against what it delivers." },
    circular: { fit: "topic" as const, text: "Nothing in this case is about devices staying in use or returning to the loop, so this lens does not explain the verdict." },
    businessModel: { fit: "topic" as const, text: "How the retailer charges customers is not the issue here; the open questions are compute and ownership." },
    investment: { fit: "topic" as const, text: "The money case matters eventually, but the case has no cost figures yet — the burden has not even been named, so this is one step too early." },
  },
} as const;

export const lensById = (id: LensId): Lens => LENSES.find((l) => l.id === id)!;
export const lensLabel = (id: LensId | null): string =>
  LENSES.find((l) => l.id === id)?.name ?? "— not assigned";

export const LENS_FIELD = {
  label: "Which lens best captures why?",
  instruction: "One lens only — the one that names the decisive issue, not the topic the initiative is about.",
  material: ["lenses"] as MaterialSectionId[],
};

export const RATIONALE_FIELD = {
  label: "Your one-line rationale",
  instruction: "In one sentence, state why — name the benefit and the burden.",
  placeholder: "e.g. Cuts operational energy measurably, but adds continuous inference compute nobody has costed yet.",
  material: ["novelty", "viability"] as MaterialSectionId[],
};

/** Core closing question — asked about the three core initiatives only. */
export const CLOSING_FIELD = {
  label: "Which of your three initiatives is attractive now but structurally weak, and why?",
  instruction:
    "Name it by title, then give the reason in one or two sentences — this is the attractive-versus-viable distinction applied to your own diagnosis.",
  placeholder: "e.g. Initiative X reads as modern and is easy to sell internally, but…",
  material: ["viability"] as MaterialSectionId[],
};

/** Optional closing question — the original two-initiative version, for anyone who diagnoses all six. */
export const CLOSING_ALL_FIELD = {
  label: "Across all six: which two initiatives are attractive now but structurally weak, and why?",
  instruction:
    "Only if you diagnosed all six. Name both initiatives by title, then give the reason in one or two sentences.",
  placeholder:
    "e.g. Initiative X and Initiative Y — both read as modern and are easy to sell internally, but neither…",
  material: ["viability"] as MaterialSectionId[],
};

// ---------------------------------------------------------------------------
// The six initiatives
// ---------------------------------------------------------------------------

export type ClueTier = { soft: string; sharp: string };

export type Initiative = {
  id: string;
  n: number;
  /** Short handle used in the missing list and the report. */
  short: string;
  title: string;
  /** 2–3 lines grounded in the FutureGrid situation. Both answers must be derivable from it. */
  description: string;
  /** Which of the three structure questions is most diagnostic here. */
  structureQuestion: StructureQuestionId;
  expectedLoad: LoadAnswer;
  expectedStructure: StructureAnswer;
  /** Lenses that genuinely defend. The first is the one the mentor fill uses. */
  acceptedLenses: LensId[];
  /** Clues, tiered soft → sharp. None of them names an answer. */
  loadClue: ClueTier;
  structureClue: ClueTier;
  lensClue: ClueTier;
  /** Demo answer for the mentor auto-fill — also the model rationale for the answer key. */
  sampleRationale: string;
  answerKey: AnswerKeyBlock;
};

export const GENERIC_FALLBACK_CLUE: ClueTier = {
  soft: "Re-read the initiative and separate what it promises from what it consumes — then check each answer against that split.",
  sharp: "Take the two sentences of the initiative one at a time. Each one contains a fact that decides one of your two answers; match fact to answer rather than judging the initiative as a whole.",
};

/**
 * The three initiatives every learner diagnoses (~15 minutes, Day 14's standard for
 * a one-task route). They cover all three zones and the sharpest pair: 1 (mixed —
 * same technology as 6, proposed on a measured saving), 3 (opportunity) and 6 (risk).
 * The other three stay in full, behind an optional block, and add to the same zones.
 */
export const CORE_INITIATIVE_IDS: string[] = ["i1", "i3", "i6"];
export const isCoreInitiative = (id: string): boolean => CORE_INITIATIVE_IDS.includes(id);

export const INITIATIVES: Initiative[] = [
  {
    id: "i1",
    n: 1,
    short: "AI-based operational optimisation",
    title: "AI-based operational optimisation",
    description:
      "Deploy machine learning to optimise energy use and workload distribution across FutureGrid's own systems. The models are expected to cut operational energy measurably, and they were proposed on the strength of that measured saving rather than on how modern they look. They also run inference continuously against live telemetry, adding permanent compute and a data pipeline that has to be maintained.",
    structureQuestion: "impactNovelty",
    expectedLoad: "both",
    expectedStructure: "impact",
    acceptedLenses: ["aiUse", "resources"],
    loadClue: {
      soft: "You have settled on one direction — but read the initiative again and count both. What does it save, and what does it run continuously in order to save it?",
      sharp: "Two facts sit in this description: a measurable energy cut, and inference running permanently against live telemetry. If both are material, the honest answer is not one of the two one-sided options.",
    },
    structureClue: {
      soft: "Ask what actually drove the proposal here. The description says why the team put it forward — go back to that sentence rather than judging it by the technology involved.",
      sharp: "Using AI does not by itself make something novelty-led. Look only at the stated reason for proposing it, and check that against C1's test for what counts as impact.",
    },
    lensClue: {
      soft: "Your lens should name the decisive tension in this initiative, which is a trade-off rather than a device or a revenue question.",
      sharp: "The deciding issue here is that the same system both saves and consumes. Which two lenses in C4 are about exactly that weighing, rather than about loops, money or approval?",
    },
    sampleRationale:
      "Cuts operational energy on a measured basis, but the saving is partly offset by inference compute and a data pipeline running permanently underneath it.",
    answerKey: {
      prompt: "Initiative 1 — AI-based operational optimisation",
      items: [
        {
          option: "Load: Both — genuinely unclear (expected)",
          verdict: "pick",
          why: "The description names a measurable energy cut and continuous inference compute in the same breath. When both are material, \"both\" is the accurate reading, not a hedge.",
        },
        {
          option: "Load: Reduces net resource use (plausible wrong)",
          verdict: "avoid",
          why: "It takes the promised saving at face value and ignores the permanent inference load — exactly the one-sided AI case C2 warns about.",
        },
        {
          option: "Structure: Impact-led (expected)",
          verdict: "pick",
          why: "The description states it was proposed on the strength of a measured saving, not on how advanced it looks. That is the definition of impact-led in C1.",
        },
        {
          option: "Structure: Novelty-led (plausible wrong)",
          verdict: "avoid",
          why: "Chosen by learners who read \"AI\" as automatically novelty-driven. The test is what drove the proposal, and here it is a measured effect.",
        },
        {
          option: "Lens: AI use, or Resource requirements (expected)",
          verdict: "pick",
          why: "The decisive issue is benefit weighed against compute and data load — that is the AI use lens, with Resource requirements defensible as the same trade-off named from the cost side.",
        },
        {
          option: "Lens: Innovation (plausible wrong)",
          verdict: "avoid",
          why: "Innovation is the lens for novelty-versus-real-effect, and the effect here is not in dispute — the burden that comes with it is.",
        },
      ],
      teachingNote:
        "Resolves to Mixed. The two signals disagree: the structure is sound (impact-led) but the load is genuinely two-sided, and C5's rule makes any disagreement Mixed. Expect a participant to argue for Opportunity because the saving is measured — the counter is that the measurement covers the saving only, not the inference load that offsets it, so the condition to attach is \"measure net, including inference.\"",
    },
  },
  {
    id: "i2",
    n: 2,
    short: "Expand data-based services",
    title: "Expand data-based services",
    description:
      "Build a new revenue line on analytics products sold to customers. It adds storage, processing and retention load on top of today's platform, and the net sustainability effect is unclear: the products help customers decide, but nothing measures whether those decisions reduce anything. The data platform it would sit on is already running and staffed — FutureGrid has operated it for years.",
    structureQuestion: "testedUntested",
    expectedLoad: "adds",
    expectedStructure: "tested",
    acceptedLenses: ["businessModel", "resources"],
    loadClue: {
      soft: "Look for what this initiative reduces in absolute terms. Is a reduction claimed anywhere, or only a possibility on someone else's side of the transaction?",
      sharp: "\"Helps customers decide\" is not a measured reduction — the description says explicitly that nothing measures whether those decisions reduce anything. What is left that is certain?",
    },
    structureClue: {
      soft: "This question is not about whether the idea is good, but about whether FutureGrid can run it. Re-read the last sentence of the description.",
      sharp: "Organisational maturity asks one thing: does the company already do something like this today? The description answers that directly — you are being asked to notice it, not to infer it.",
    },
    lensClue: {
      soft: "The decisive issue here is what kind of thing this initiative *is* for the company, and what it adds to carry it. Two lenses in C4 fit that; the device-and-loop one does not.",
      sharp: "No hardware enters or leaves the loop here. Think about where the value comes from and what the platform underneath has to carry.",
    },
    sampleRationale:
      "Opens a real revenue line on a platform FutureGrid already runs, but adds storage and processing load against a customer-side benefit nobody is measuring.",
    answerKey: {
      prompt: "Initiative 2 — Expand data-based services",
      items: [
        {
          option: "Load: Adds compute / data load (expected)",
          verdict: "pick",
          why: "Storage, processing and retention load are stated as certain; the countervailing benefit is explicitly unmeasured, so it cannot be set against them.",
        },
        {
          option: "Load: Both — genuinely unclear (plausible wrong)",
          verdict: "avoid",
          why: "Defensible-sounding, but \"both\" requires two material effects. Here only one side is established — the other is a hypothesis about customer behaviour with nothing measuring it.",
        },
        {
          option: "Structure: Tested (expected)",
          verdict: "pick",
          why: "The description states the platform is already running and staffed, and has been for years. Organisational maturity is high even though the sustainability case is weak.",
        },
        {
          option: "Structure: Untested (plausible wrong)",
          verdict: "avoid",
          why: "Learners pick this because the *product* is new. The question asks about the model the organisation has to run, not about the novelty of the offering.",
        },
        {
          option: "Lens: Business model, or Resource requirements (expected)",
          verdict: "pick",
          why: "This is a new way of creating and charging for value (Business model), carried by an added data footprint (Resource requirements). Either names the decisive issue.",
        },
        {
          option: "Lens: Circular economy (plausible wrong)",
          verdict: "avoid",
          why: "Nothing physical enters or leaves a loop here — the circular lens has no purchase on a pure data service.",
        },
      ],
      teachingNote:
        "Resolves to Mixed. The signals disagree: load is added, but the organisation can genuinely run this. That is the case for conditions rather than rejection — the obvious one being to measure the customer-side effect that is currently only assumed. If a participant argues Risk, the counter is that a tested operator with a real revenue case is not the same situation as initiative 6, where nobody can say what the benefit would even be.",
    },
  },
  {
    id: "i3",
    n: 3,
    short: "Circular procurement and take-back",
    title: "Circular procurement and take-back",
    description:
      "Buy modular, refurbishable hardware and take devices back at end of use so components re-enter the loop instead of the waste stream. It directly reduces new-device demand and the volume going to disposal. FutureGrid has never run a take-back scheme before, so the direction is well-established practice but the execution here would be a first.",
    structureQuestion: "circularLinear",
    expectedLoad: "reduces",
    expectedStructure: "circular",
    acceptedLenses: ["circular", "businessModel"],
    loadClue: {
      soft: "Separate two different things: how hard this is to run, and what it does to resource use. This question only asks the second.",
      sharp: "The description states what happens to new-device demand and to disposal volume. Execution risk is real, but it is not an answer to a question about net resource effect.",
    },
    structureClue: {
      soft: "Go back to C3 and ask what physically happens to a device at end of use under this initiative — where does it go?",
      sharp: "Being new to the company is not the same as being linear. The R-ladder classifies by what happens to the device, not by whether the organisation has done it before.",
    },
    lensClue: {
      soft: "Two lenses defend here: what happens to the hardware, and how the arrangement with the supplier is structured. A third, about approval criteria, does not.",
      sharp: "The decisive move is keeping value in the loop. Which lens is named after exactly that, and which second one covers take-back as a commercial arrangement?",
    },
    sampleRationale:
      "Cuts new-device demand and disposal volume by keeping hardware in the loop, at the cost of running a take-back process the company has never operated before.",
    answerKey: {
      prompt: "Initiative 3 — Circular procurement and take-back",
      items: [
        {
          option: "Load: Reduces net resource use (expected)",
          verdict: "pick",
          why: "Stated directly: less new-device demand, less disposal volume. This is an upper-R-ladder move (reuse, repair, refurbish), which C3 identifies as the high-effect end.",
        },
        {
          option: "Load: Both — genuinely unclear (plausible wrong)",
          verdict: "avoid",
          why: "Usually chosen because the scheme is unproven. Execution difficulty is not resource load — mixing the two is the specific confusion this initiative is built to surface.",
        },
        {
          option: "Structure: Circular (expected)",
          verdict: "pick",
          why: "Devices come back and components re-enter use. That is the definition of circular regardless of who is running it or how well.",
        },
        {
          option: "Structure: Linear (plausible wrong)",
          verdict: "avoid",
          why: "Only defensible if \"untested\" is being read as \"linear\". Linearity is about where the device ends up, not about organisational confidence.",
        },
        {
          option: "Lens: Circular economy, or Business model (expected)",
          verdict: "pick",
          why: "Circular economy names the loop directly; Business model defends because take-back changes the commercial relationship with the supplier and the device's ownership over its life.",
        },
        {
          option: "Lens: Governance (plausible wrong)",
          verdict: "avoid",
          why: "Oversight matters to running the scheme, but nothing in the description turns on approval criteria or auditability — it turns on where the hardware goes.",
        },
      ],
      teachingNote:
        "Resolves to Sustainable opportunity. Expect the strongest challenge of the whole task here: \"it is untested, so surely it is Mixed at best?\" C5 answers it — untested is execution risk, and the rule is to state what would have to be true rather than to veto the direction. The condition belongs in the rationale (pilot it, name an owner, contract the take-back), not in the verdict. Note that the deliberate contrast is with initiative 2, where untested-versus-tested genuinely is the deciding question because the sustainability case there is weak on its own.",
    },
  },
  {
    id: "i4",
    n: 4,
    short: "Device refresh on the classic market cycle",
    title: "Device refresh on the classic market cycle",
    description:
      "Replace hardware on the vendor's fixed refresh cycle regardless of the condition of the devices in service. It is fast, familiar and easy to budget, and every department already understands it. Devices leave the company while still fully serviceable, and each cycle pulls new hardware and its embodied footprint into the organisation.",
    structureQuestion: "circularLinear",
    expectedLoad: "adds",
    expectedStructure: "linear",
    acceptedLenses: ["circular", "resources"],
    loadClue: {
      soft: "Newer hardware is usually more efficient in operation — but C1 asks about the net effect across the lifecycle. What comes in with every new device?",
      sharp: "Per-unit efficiency is not net reduction. Count what each cycle pulls into the organisation, and what leaves it while still usable, before judging the direction.",
    },
    structureClue: {
      soft: "Ask what happens to a working device under this policy, and check that against C3's two models.",
      sharp: "The R-ladder is about keeping value in use. A fixed replacement cycle that discards serviceable hardware does the opposite of every rung on it.",
    },
    lensClue: {
      soft: "The decisive issue is what happens to hardware over its life. Budgeting is easy here, so the money lens is not where this one is decided.",
      sharp: "Two lenses fit: the one named after loops, and the one named after footprint. Investment logic does not — the description says the cost case is the *comfortable* part.",
    },
    sampleRationale:
      "Predictable and easy to budget, but it discards serviceable devices and pulls fresh embodied footprint into the company on every cycle.",
    answerKey: {
      prompt: "Initiative 4 — Device refresh on the classic market cycle",
      items: [
        {
          option: "Load: Adds compute / data load (expected)",
          verdict: "pick",
          why: "Read as resource load generally: each cycle brings in new hardware and its embodied footprint while serviceable devices leave. Nothing is reduced in absolute terms.",
        },
        {
          option: "Load: Reduces net resource use (plausible wrong)",
          verdict: "avoid",
          why: "The classic efficiency-trap answer — newer devices draw less power per unit, but C1's test is the lifecycle net, which the embodied footprint of continuous replacement dominates.",
        },
        {
          option: "Structure: Linear (expected)",
          verdict: "pick",
          why: "Buy → use → dispose on a fixed cycle, with no rung of the R-ladder engaged. This is the textbook linear model from C3.",
        },
        {
          option: "Structure: Circular (plausible wrong)",
          verdict: "avoid",
          why: "Sometimes argued on the grounds that old devices get recycled at end of cycle. Recycling is C3's last resort and does not make a replacement policy circular.",
        },
        {
          option: "Lens: Circular economy, or Resource requirements (expected)",
          verdict: "pick",
          why: "The loop is what this initiative breaks (Circular economy); the added footprint is the measurable consequence (Resource requirements).",
        },
        {
          option: "Lens: Investment logic (plausible wrong)",
          verdict: "avoid",
          why: "Tempting because refresh cycles are a budgeting instrument, but the description says the cost case is the easy part — the problem is not financial logic.",
        },
      ],
      teachingNote:
        "Resolves to Sustainability risk, and it is the clearest of the six. The teaching value is that it is also the most comfortable option on the list — familiar, predictable, easy to defend in a budget meeting. That comfort is precisely what C5 calls attractive-but-weak, and it is a strong candidate for the closing question.",
    },
  },
  {
    id: "i5",
    n: 5,
    short: "Sustainability-reporting offering for customers",
    title: "New sustainability-reporting IT offering for customers",
    description:
      "A product that helps client companies track and report their emissions. Its own footprint is modest — periodic reporting data rather than continuous inference — and it was proposed because client demand for auditable figures is measurable and growing, which also differentiates FutureGrid in the market. It is governance-heavy: the figures it produces have to withstand audit, so approval criteria and oversight must be defined before launch.",
    structureQuestion: "impactNovelty",
    expectedLoad: "reduces",
    expectedStructure: "impact",
    acceptedLenses: ["businessModel", "governance"],
    loadClue: {
      soft: "Compare this initiative's own footprint with the other data-heavy ones on the board. What does the description say it runs — and how often?",
      sharp: "Periodic reporting is not continuous inference. Set its modest own load against what the product enables on the customer side, and judge the net rather than the fact that data is involved.",
    },
    structureClue: {
      soft: "The description gives a reason this was proposed. Is that reason a measurable effect, or is it about appearing modern?",
      sharp: "Market differentiation on the back of measurable, growing client demand is not the same as novelty-seeking. C1's test is whether a named effect drove the proposal.",
    },
    lensClue: {
      soft: "Two things decide this one: it is a new revenue line, and its output has to survive external scrutiny. Which two lenses name exactly those?",
      sharp: "\"Approval criteria and oversight must be defined\" points at one specific lens by name in C4. The other is about how the company creates and charges for value.",
    },
    sampleRationale:
      "Modest own footprint and real client demand behind it, but the figures it sells have to survive audit, so oversight has to exist before launch rather than after.",
    answerKey: {
      prompt: "Initiative 5 — New sustainability-reporting IT offering",
      items: [
        {
          option: "Load: Reduces net resource use (expected)",
          verdict: "pick",
          why: "Own footprint is explicitly modest and periodic, and the product enables reduction on the customer side. The net across the lifecycle points down.",
        },
        {
          option: "Load: Adds compute / data load (plausible wrong)",
          verdict: "avoid",
          why: "Chosen by pattern-matching on \"data product\". The description distinguishes periodic reporting from continuous inference precisely so this can be judged rather than assumed.",
        },
        {
          option: "Structure: Impact-led (expected)",
          verdict: "pick",
          why: "Measurable, growing client demand for auditable figures is a named effect, and it is what the description says drove the proposal.",
        },
        {
          option: "Structure: Novelty-led (plausible wrong)",
          verdict: "avoid",
          why: "\"Market-differentiating\" reads as optics to some learners. The distinction is whether the differentiation rests on a measurable demand — here it does.",
        },
        {
          option: "Lens: Business model, or Governance (expected)",
          verdict: "pick",
          why: "It is a new revenue line (Business model) whose output must be auditable, requiring criteria and oversight before launch (Governance).",
        },
        {
          option: "Lens: AI use (plausible wrong)",
          verdict: "avoid",
          why: "No AI workload is described. The lens must name the decisive issue in this initiative, not a technology the learner expects to find on this day.",
        },
      ],
      teachingNote:
        "Resolves to Sustainable opportunity. The useful discussion is that governance-heavy does not mean risky — it means the conditions are known in advance and can be built in, which is the opposite of initiative 6's situation. If a participant argues Mixed on the grounds of audit exposure, the counter is that a named, definable requirement before launch is a work item, not an unresolved trade-off.",
    },
  },
  {
    id: "i6",
    n: 6,
    short: "\"AI everywhere\" pilot across departments",
    title: "\"AI everywhere\" pilot across departments",
    description:
      "Add AI features broadly across departments so FutureGrid is visibly innovative, with each department choosing its own use case. None of the pilots carries a measured benefit target, and no one has been asked what would count as success. Combined, they add substantial continuous compute and data load across the organisation.",
    structureQuestion: "impactNovelty",
    expectedLoad: "adds",
    expectedStructure: "novelty",
    acceptedLenses: ["innovation", "aiUse"],
    loadClue: {
      soft: "Trace the compute. Where does the extra load come from when every department runs its own pilot, and what measured saving is offered against it?",
      sharp: "The description states there is no measured benefit target anywhere in this initiative. With nothing established on the benefit side, only one side of the balance has anything on it.",
    },
    structureClue: {
      soft: "Ask what the stated purpose of this initiative actually is — the description gives it in the first line, and it is not a measured outcome.",
      sharp: "\"So that the company is visibly innovative\" is a statement about how it looks. C1's test asks whether a named effect drove it — and here, explicitly, none did.",
    },
    lensClue: {
      soft: "Two lenses fit: the one about whether anything real is being achieved, and the one about AI's benefit weighed against its load.",
      sharp: "The deciding fault is that newness is being pursued for its own sake. Which lens in C4 is named after exactly that distinction?",
    },
    sampleRationale:
      "Adds continuous compute across every department for the sake of appearing innovative, with no measured benefit anywhere to weigh against it.",
    answerKey: {
      prompt: "Initiative 6 — \"AI everywhere\" pilot",
      items: [
        {
          option: "Load: Adds compute / data load (expected)",
          verdict: "pick",
          why: "Substantial continuous compute and data load across departments, with no measured benefit offered against it. One-sided by the description's own account.",
        },
        {
          option: "Load: Both — genuinely unclear (plausible wrong)",
          verdict: "avoid",
          why: "\"Both\" needs two material effects. An unmeasured, unspecified hope of benefit is not material — that is the difference between this and initiative 1.",
        },
        {
          option: "Structure: Novelty-led (expected)",
          verdict: "pick",
          why: "The stated purpose is visible innovativeness, and no pilot carries a benefit target. This is C1's novelty-driven path in its purest form.",
        },
        {
          option: "Structure: Impact-led (plausible wrong)",
          verdict: "avoid",
          why: "Sometimes argued on the grounds that pilots produce learning. Learning would need a defined success criterion, and the description says none exists.",
        },
        {
          option: "Lens: Innovation, or AI use (expected)",
          verdict: "pick",
          why: "Innovation names the novelty-versus-effect fault directly; AI use defends because the load being added is specifically AI compute with no benefit weighed against it.",
        },
        {
          option: "Lens: Governance (plausible wrong)",
          verdict: "avoid",
          why: "Genuinely tempting — nobody set criteria. But the missing criteria are a symptom of pursuing novelty; treat the cause as decisive, and mention governance in the rationale.",
        },
      ],
      teachingNote:
        "Resolves to Sustainability risk. This is the sharpest contrast with initiative 1: same technology, opposite verdict, because one was proposed on a measured saving and the other on visibility. If the room only remembers one thing from Task 1, this pair is the thing to remember — and both this and initiative 4 are the intended answers to the closing question.",
    },
  },
];

export const initiativeById = (id: string): Initiative => INITIATIVES.find((i) => i.id === id)!;

// ---------------------------------------------------------------------------
// Task framing
// ---------------------------------------------------------------------------

export const TASK_FRAMING = {
  tag: "THE TASK",
  title: "FutureGrid Technologies — Sustainable or just attractive?",
  minutes: 15,
  lead: "FutureGrid Technologies is planning six innovation initiatives. Management is excited — but excitement is not an assessment. You start with three of them.",
  instruction:
    "Your job is not to approve or reject. Your job is to see clearly: which initiatives are genuine sustainability opportunities, and which are only technologically attractive?",
} as const;

/** The initial situation, as short chips rather than a paragraph nobody reads. */
export const CONTEXT_CHIPS: string[] = [
  "AI promises efficiency but needs more compute and data",
  "Procurement is still linear — buy, use, dispose",
  "Circular models are untested organisationally",
  "Projects are prioritised by novelty, not impact",
  "Departments push technology; finance and operations focus on cost",
  "No integrated decision logic exists yet",
];

export const WORK_ASSIGNMENT: string[] = [
  "For each of the three initiatives, answer the two diagnostic questions. Your two answers together resolve the initiative into a zone — you do not pick the zone directly.",
  "Write a one-line rationale for each initiative, naming both the benefit and the burden.",
  "Use \"Check my reasoning\" whenever you want a clue — it tells you whether a diagnosis holds, never what the answer is.",
  "Finish with the closing question: which one is attractive now but structurally weak?",
  "Want more? Optional: name the lens for any initiative, diagnose the other three initiatives, or go on to Level 2 and decide which line of measures to prioritise.",
];

export const CHECK_LABELS = {
  check: "Check my reasoning",
  recheck: "Check again",
  holds: "✓ This diagnosis holds up.",
  wrongTier1: "✕ This one does not hold up yet — here is a first clue.",
  wrongTier2: "✕ Still does not hold up — a sharper clue, since you have checked this one before.",
  unanswered: "Answer both questions first, then this one can be checked.",
  summary: (holds: number, checked: number) =>
    `${holds} of ${checked} diagnosed initiative${checked === 1 ? "" : "s"} ${holds === 1 ? "holds" : "hold"} up.`,
} as const;
