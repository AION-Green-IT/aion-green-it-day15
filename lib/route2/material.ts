/**
 * Route 2's material: four micro-cards, D1–D4. The core is D1 and D2 (about 45
 * minutes, Day 14's standard) — what the two core tasks use. D3 and D4 stay in full
 * behind an optional button and back the optional extension of the proposal. Visible per card: standfirst,
 * live diagram, Definition. Behind Read more: why it matters, the decision
 * rules, the sources (DEPTH-UPGRADE-PROMPT §2.1).
 *
 * Self-contained: this route never points at a Route 1 card. Where an idea
 * such as rebound or symbolic politics is needed, it is defined here in a
 * sentence (the RouteGate promises this route stands on its own).
 *
 * Coverage rule (CLAUDE.md §11a): the four assessment criteria Task 3's
 * element 3 must reference (benefit, resource/load, strategic viability,
 * controllability) are defined, with when to use each, in D2; the six canvas
 * blocks are all introduced in D1; the four governance-loop stages and who
 * plays each are defined in D3; the short/medium/structural bands the horizon
 * classifier uses are defined, with examples, in D4.
 */

import type { MicroCard } from "@/lib/materialSection";
import type { MaterialSectionId } from "./sections";

const COURSE_OWN = "Course framework, Module 11";

export const MATERIAL: MicroCard<MaterialSectionId>[] = [
  {
    id: "architecture",
    code: "D1",
    n: 1,
    icon: "network",
    title: "From separate projects to a decision architecture",
    standfirst: "A pile of sensible initiatives is not the same thing as a strategy.",
    definition: [
      "A decision architecture is one integrated assessment framework that every initiative passes through before it scales. It is not one more project next to AI use, the innovation portfolio, the circular economy, investment logic, governance and management review — it is what connects them.",
      "It prevents a familiar failure: a pile of disconnected initiatives, each sensible alone, that add up to symbolic politics (a visible signal with little real effect) and rebound (an efficiency saving eaten by more usage) at portfolio scale.",
      "In Task 1 those six blocks are on a canvas. You connect them so that no block stands on its own.",
    ],
    insight: [
      "An AI pilot here and a take-back scheme there can each be defended in isolation. The problem only shows when they are compared: nobody has said which one deserves the compute, the budget or the attention first.",
      "The senior move is to build the logic once and route everything through it, before any individual technology is scaled.",
    ],
    reasoning: [
      "When building the decision architecture in Task 1, treat every block as something that must connect to at least one other block. An unconnected block is exactly the scattered-initiative pattern this card warns against.",
      "A framework that only routes AI initiatives, or only circular ones, is not integrated — it has to route the whole portfolio, so the connected blocks should form one architecture, not several separate clusters.",
    ],
    sources: [{ label: COURSE_OWN, detail: "The decision-architecture framing is this course's own, not an external standard." }],
    moreHint: "why it matters, decision rules",
    minutes: 22,
  },
  {
    id: "assessmentLogic",
    code: "D2",
    n: 2,
    icon: "funnel",
    title: "Assessment logic: how initiatives get judged",
    standfirst: "The four criteria Task 2's decision logic must name — no fifth substitute allowed.",
    definition: [
      "A framework needs explicit criteria. Judge each initiative on four: benefit, resource and load effect, strategic viability, and controllability. Novelty and enthusiasm are not criteria.",
      "Benefit: the real, measured net effect, not the claim. Resource and load: the extra compute, energy, data and hardware it adds. Strategic viability: whether it can run at scale, hold up over time and be run by this organisation. Controllability: whether the organisation can steer and govern it once it is running.",
      "A funnel is the right picture: many initiatives enter, four filters test each one, and only a few prioritised decisions come out.",
    ],
    insight: [
      "This is what turns \"interesting idea\" into \"prioritised decision\". It is also disclosable: the CSRD and its ESRS standards ask companies to report on governance, strategy and impacts — including climate (ESRS E1) and resource use and the circular economy (ESRS E5) — so an ad-hoc assessment process is itself a governance gap.",
    ],
    reasoning: [
      "Task 2's element 3 (decision logic) must name all four criteria by these terms — benefit, resource/load, strategic viability, controllability — not a rebranded subset.",
      "Use resource/load when the question is what an initiative costs to run; use controllability when the question is who can change its rules once it is live. Strategic viability is about scale and staying power, not about how attractive it looks now.",
      "\"Novelty\" or \"how exciting it looks\" is explicitly not one of the four. If a criterion reduces to enthusiasm, it has failed this card's test.",
    ],
    sources: [
      { label: "CSRD, Directive (EU) 2022/2464 — EUR-Lex", url: "https://eur-lex.europa.eu/eli/dir/2022/2464/oj", detail: "The reporting law. Scope is being revised by the EU's Omnibus package — check before teaching." },
      { label: "ESRS, Delegated Regulation (EU) 2023/2772 — EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg_del/2023/2772/oj", detail: "E1 climate change; E5 resource use and circular economy. Also being simplified." },
    ],
    moreHint: "why it matters, when to use each criterion, sources",
    minutes: 23,
  },
  {
    id: "governance",
    code: "D3",
    n: 3,
    icon: "gavel",
    title: "Governance and investment logic",
    standfirst: "Every decision needs an owner, an approval path, and a way back to the table.",
    definition: [
      "Governance means owners, approval logic and review. The governed loop has four stages. Propose: any team puts an initiative forward. Assess: the framework owner tests it against the four criteria. Approve or park: a steering group decides whether it goes ahead now or waits. Review: management revisits it, and it is renewed, adjusted or closed.",
      "Investment logic means judging cost, payback and follow-on burden while the numbers are still uncertain, and anchoring the choice in a portfolio or management review rather than in whichever department pushed hardest this quarter.",
      "Without all four stages, an assessment framework is a document, not a process.",
    ],
    insight: [
      "Each stage has its own role and its own question, which is why \"who approves?\" alone is not governance: an initiative that is never reviewed keeps its budget by default.",
      "Under uncertainty the loop is what keeps a decision honest — the review stage is where the assumptions behind an early call are checked against real data.",
    ],
    reasoning: [
      "The optional element 6 (roles, responsibilities, approval logic, review mechanisms) must cover all four loop stages — propose, assess, approve or park, review — not just \"who approves.\"",
      "Standards to anchor investment and management-system rigour: ISO 50001 (energy management systems) for a review-and-improve loop, and ISO 20400 (sustainable procurement) where a decision ends in a purchase — cite the one that matches the initiative type rather than both by default.",
    ],
    sources: [
      { label: "ISO 50001 — energy management systems", detail: "The plan-act-check-review loop that the fourth stage borrows from.", note: "not linked: ISO.org could not be opened by script" },
      { label: "ISO 20400 — sustainable procurement", detail: "Relevant wherever governance touches purchasing decisions.", note: "not linked: ISO.org could not be opened by script" },
    ],
    moreHint: "why review matters, which standard to cite, sources",
    minutes: 4,
  },
  {
    id: "horizons",
    code: "D4",
    n: 4,
    icon: "clock",
    title: "Time horizons: short, medium, structural",
    standfirst: "Not every measure lands at once — and a proposal that is all one horizon is a warning sign.",
    definition: [
      "Short-term measures are decisions, not deployments: define the assessment criteria, create transparency, make a first prioritisation.",
      "Medium-term measures are pilots and first loops under those criteria: piloting a selected AI or circularity initiative, building the first take-back or refurbishment loop.",
      "Structural measures anchor the framework so it stops depending on any one champion: a standing place in portfolio decisions, governance and management reviews.",
    ],
    insight: [
      "A proposal whose measures all sit in one band is a warning. All short-term has no anchor; all medium-term has no first decision that could ship today; all structural has no concrete first step.",
    ],
    reasoning: [
      "Every one of your own measures in the optional classifier lands in exactly one of these three bands — never left unclassified. Ask what the measure produces: a decision (short), a pilot (medium), or a permanent place in how the organisation decides (structural).",
      "\"Build the framework first, then scale individual initiatives\" is the ordering rule across all three bands, not a one-off tip — a structural anchor with no short-term first step is exactly the disconnected-good-intentions failure D1 describes.",
    ],
    sources: [{ label: COURSE_OWN, detail: "The three horizons are this course's own working split, not an external standard." }],
    moreHint: "why one band is a warning, decision rules",
    minutes: 3,
  },
];

export const MATERIAL_INTRO = {
  kicker: "Material · two core cards · about 45 minutes",
  title: "One decision architecture, not a list of ideas",
  intro: "Read each definition, play with its diagram, then build one for NovaCircular.",
  more: "Two core cards: why disconnected initiatives fail even when each one is sensible (D1), and the four criteria that turn enthusiasm into a prioritised decision (D2) — followed by a worked example. Together they cover everything the two core tasks ask: the canvas (Task 1) and the core of the proposal (Task 2). Two more cards — the governance loop and the time horizons — sit behind the optional button below and back the optional extension of the proposal. Open Read more on a card for the decision rules and sources.",
  optionalTitle: "More material — two extra cards",
  optionalHint: "D3 governance and investment logic · D4 time horizons. Needed only for the optional extension of the proposal (elements 2, 4, 6, 7 and the horizon classifier).",
} as const;

/**
 * A read-only worked example inside the material — a different company from the one Task 3 assesses
 * (CURRICULUM-GUIDE.md §2). Each finding names the D2 criterion that would have caught it, so the
 * story rehearses the criteria rather than only illustrating the lesson.
 */
export const WORKED_EXAMPLE = {
  company: "CircularMind Digital Systems GmbH",
  heading: "Worked example — read only",
  intro:
    "CircularMind ran three sensible initiatives at once, each approved on its own merits by a different sponsor. None was assessed against the others. Eighteen months in:",
  findings: [
    {
      initiative: "AI load-balancing pilot",
      happened: "The compute bill had quietly outgrown its savings.",
      criterion: "Resource / load",
      why: "Nobody had counted what the pilot added in running compute, so the net effect was never known.",
    },
    {
      initiative: "Device take-back trial",
      happened: "There were no criteria for which devices to prioritise, so the choice was made by convenience.",
      criterion: "Strategic viability",
      why: "Without a rule for what enters the loop first, the trial could not be run at scale or repeated.",
    },
    {
      initiative: "ESG-reporting product",
      happened: "Its governance sat with whichever team built it, not with anyone accountable for the numbers it published.",
      criterion: "Controllability",
      why: "Nobody outside the builders could steer it or correct it, and the organisation was publishing figures it did not control.",
    },
  ],
  lesson:
    "The lesson management drew was not \"pick better initiatives\" — it was build the assessment framework first, then scale individual initiatives. Every initiative that came after the framework went live was cheaper to evaluate and faster to kill or fund.",
  note: "Which criterion would have caught each one is a teaching reading, not the only defensible one.",
} as const;
