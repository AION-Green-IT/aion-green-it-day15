/**
 * The nine micro-cards, C1–C9 — the whole teaching block for Route 1, both
 * levels, read continuously before either task (CLAUDE.md §12: no material
 * between the parts).
 *
 * Core = C1, C2, C3, C5 (15 min each, ~60 min); the rest are optional and self-paced (see sections.ts).
 *
 * Visible per card: standfirst, live diagram, Definition. Behind Read more:
 * why it matters, the decision rules, the sources (DEPTH-UPGRADE-PROMPT §2.1).
 *
 * Coverage rule (CLAUDE.md §11a): every term and option either task offers is
 * defined in a visible Definition here first.
 *   Task 1 Q1 (reduces / adds / both)        → C2
 *   Task 1 Q2 (circular-linear)              → C3
 *   Task 1 Q2 (impact-novelty)               → C1
 *   Task 1 Q2 (tested-untested), zone rule   → C5
 *   Task 1 lens (seven lenses)               → C4
 *   Task 2 seven dimensions, Low/Med/High    → C7
 *   Task 2 justification / uncertainty       → C6, C8
 *   Task 2 attractive-but-weak risks         → C9, C1
 * C4, C5, C6, C7 and C8 teach this course's own working vocabulary, so their
 * `sources` say so instead of pointing at a standard that does not exist.
 */

import type { MicroCard } from "@/lib/materialSection";
import type { MaterialSectionId } from "./sections";

const COURSE_OWN = "Course framework, Module 11";

export const MATERIAL: MicroCard<MaterialSectionId>[] = [
  {
    id: "novelty",
    code: "C1",
    n: 1,
    icon: "blueprint",
    title: "Novelty is not the same as innovation",
    standfirst: "New does not mean sustainable. The net effect does.",
    definition: [
      "Novelty means a technology is new. A sustainable innovation is one that lowers total resource use once its whole lifecycle is counted — making it, running it and disposing of it. Something can be the first of its kind and still make the total worse.",
      "The test is the net effect: what the initiative reduces in absolute terms, after people change their behaviour around it. If a named, measurable effect drove the proposal, it is impact-led. If visibility, modernity or market optics drove it, it is novelty-led.",
      "The trap is the rebound effect: an efficiency gain makes something cheaper, people use more of it, and the extra use eats the saving.",
    ],
    insight: [
      "Efficiency lowers cost, lower cost raises demand, and total consumption can end up flat or higher than before the improvement. When the extra use is larger than the saving, it is called the Jevons paradox.",
      "\"Net effect across the lifecycle\" is life-cycle assessment thinking: count every stage, not just the one the brochure talks about.",
    ],
    reasoning: [
      "Ask what an initiative reduces in absolute terms, not what it makes more efficient per unit. If the only claim is that it is more modern or more advanced, that is novelty, not innovation.",
      "Impact-led versus novelty-led (Task 1, question 2): look only at the stated reason the initiative was proposed. Using AI, or any new technology, does not by itself make it novelty-led — a measured saving as the reason makes it impact-led.",
      "Where an efficiency gain makes something cheaper or easier at scale, expect more usage — count that extra usage before calling the saving real.",
    ],
    sources: [
      { label: "Jevons paradox — background reading (Wikipedia)", url: "https://en.wikipedia.org/wiki/Jevons_paradox", detail: "Efficiency gains partly or wholly offset by higher demand." },
      { label: "ISO 14040 / ISO 14044 — life-cycle assessment", detail: "The standard method for counting a lifecycle", note: "not linked: ISO.org could not be opened by script" },
    ],
    moreHint: "why the rebound happens, decision rules, sources",
    minutes: 15,
  },
  {
    id: "aiLoad",
    code: "C2",
    n: 2,
    icon: "chip",
    title: "AI: efficiency promise and resource burden",
    standfirst: "Both sides are real. An AI case that names only one of them is unfinished.",
    definition: [
      "AI genuinely helps Green IT — load and energy optimisation, predictive maintenance, decision support — but it is not automatically sustainable, because it also consumes compute, energy, data and infrastructure.",
      "Task 1 asks one question of every initiative: does it mainly reduce net resource use, add compute and data load, or both? \"Both\" is a real answer when a measurable benefit and a measurable burden are each material. It is an assessment, not a hedge.",
      "Compute is continuous when inference runs every day in operation, and one-off when it is a training run. Continuous load is what decides the net effect.",
    ],
    insight: [
      "The scale is not marginal: the IEA estimated data-centre electricity at around 460 TWh in 2022, potentially approaching 1,000 TWh by 2026, with AI and crypto as key drivers.",
      "At scale it is everyday inference, not the one-off training run, that can dominate lifetime energy — so every AI use case has to be weighed in both directions: what benefit does it deliver, and what does it consume to deliver it?",
    ],
    reasoning: [
      "For any AI initiative, name the benefit and the load in the same sentence. A benefit with no named load is an unexamined claim, not an assessment.",
      "Ask where the compute is continuous (inference running in daily operation) rather than one-off (training) — continuous load is what decides the net effect.",
      "Choose \"both\" only when there are two material effects — a measurable saving and a real running burden. One effect plus one hope is not \"both\"; and if only one direction is material, pick that direction.",
    ],
    sources: [
      { label: "IEA — Electricity 2024", url: "https://www.iea.org/reports/electricity-2024", detail: "Data-centre demand ~460 TWh in 2022, potentially approaching ~1,000 TWh by 2026." },
    ],
    moreHint: "the IEA figures, decision rules, sources",
    minutes: 15,
  },
  {
    id: "circular",
    code: "C3",
    n: 3,
    icon: "recycleLoop",
    title: "Circular versus linear IT",
    standfirst: "Linear buys, uses and disposes. Circular keeps the value in the loop.",
    definition: [
      "The linear model is buy → use → dispose. A circular model keeps devices and components in use, or brings them back.",
      "The R-strategies rank the ways to do that, from most to least effective: refuse/rethink, reduce, reuse, repair, refurbish, remanufacture — and recycle only as the last resort.",
      "Task 1, question 2 may ask \"circular or linear?\". Circular means the initiative keeps devices in use longer or brings them back — take-back, refurbishment, reuse. Buying new on a fixed cycle is linear, however efficient the new hardware is.",
    ],
    insight: [
      "E-waste is one of the fastest-growing waste streams: the Global E-waste Monitor 2024 reports 62 million tonnes generated in 2022, of which only 22.3% was formally collected and recycled, with e-waste rising around five times faster than documented recycling.",
      "Circularity in IT is not a disposal question decided at the end. It is decided upstream, by product design, modularity, take-back systems, provider and as-a-service models, and lifecycle management. In the EU it is backed by the WEEE Directive (collection and producer responsibility) and the ESPR (durability, repairability, digital product passport).",
    ],
    reasoning: [
      "Call an initiative circular only if it keeps devices or components in use longer, or brings them back. Buying new on a fixed cycle is linear however efficient the new hardware is.",
      "The higher up the R-ladder you act (refuse, reduce, reuse, repair), the larger the effect — recycling is the last resort, not the target.",
    ],
    sources: [
      { label: "Global E-waste Monitor 2024 (UNITAR/ITU)", url: "https://ewastemonitor.info/the-global-e-waste-monitor-2024/", detail: "62 Mt of e-waste in 2022; 22.3% formally collected and recycled." },
      { label: "WEEE Directive 2012/19/EU — EUR-Lex", url: "https://eur-lex.europa.eu/eli/dir/2012/19/oj", detail: "Collection and producer-responsibility rules for electrical and electronic equipment." },
      { label: "ESPR, Regulation (EU) 2024/1781 — EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg/2024/1781/oj", detail: "Ecodesign framework: durability, repairability, digital product passport." },
      { label: "Ellen MacArthur Foundation — circular economy", url: "https://www.ellenmacarthurfoundation.org/topics/circular-economy-introduction/overview", detail: "The R-strategies / circular economy framework." },
    ],
    moreHint: "the e-waste figures, the EU rules, decision rules, sources",
    minutes: 15,
  },
  {
    id: "lenses",
    code: "C4",
    n: 4,
    icon: "layers",
    title: "The seven assessment lenses",
    standfirst: "This is the vocabulary Task 1 uses — open each lens once before you start.",
    definition: [
      "Sustainable-innovation decisions are read through seven lenses: Innovation, AI use, Resource requirements, Circular economy, Business model, Governance and Investment logic. Each names a different reason an initiative succeeds or fails.",
      "In Task 1 you assign exactly one lens per initiative: the lens that names the decisive issue, not the topic the initiative is about.",
      "Open each lens below to see what it asks, when to use it, and a short case.",
    ],
    insight: [
      "The lenses are deliberately different questions: novelty versus real effect, benefit versus load, footprint, loop versus linear, how value is created and charged, who decides and by what criteria, and whether the money case holds under uncertainty.",
    ],
    reasoning: [
      "Choose the lens that explains your verdict — why this is an opportunity, a risk, or mixed — rather than the lens that merely describes the subject matter.",
      "If two lenses genuinely fit, take the one a decision-maker would have to act on first.",
      "Lens versus topic: an initiative about AI is not automatically the AI use lens. It is the AI use lens only when the deciding issue is benefit against compute; if the deciding issue is that nobody approved it, that is Governance.",
    ],
    sources: [{ label: COURSE_OWN, detail: "The seven lenses are this course's working vocabulary, not an external standard." }],
    moreHint: "decision rules, lens versus topic",
    minutes: 2,
  },
  {
    id: "viability",
    code: "C5",
    n: 5,
    icon: "target",
    title: "Attractive now versus viable long-term",
    standfirst: "The one distinction Task 1 trains — and the rule that decides the verdict.",
    definition: [
      "Attractive now means modern, exciting and easy to market. Viable long-term means it holds up on impact, resources and controllability over time — and that the organisation can actually run it.",
      "Every initiative gets two signals. Signal 1 is the net resource effect: reduces, adds, or both. Signal 2 is the structure behind it: circular or linear, impact-led or novelty-led, tested or untested. Tested means the company already runs something like it; untested means it would be a first, which is execution risk, not a verdict on the direction.",
      "The verdict rule: both signals pointing the right way is a Sustainable opportunity; both pointing the wrong way is a Sustainability risk; any disagreement — including an honest \"both, unclear\" — is Mixed, worth doing only under stated conditions.",
    ],
    insight: [
      "Viability also depends on organisational maturity: whether the company can actually run the model. A first take-back scheme can be exactly the right direction and still carry real execution risk.",
      "Telling attractive from viable before the money is committed is the manager's job, and it is what the task below asks of you.",
    ],
    reasoning: [
      "Right way means: reduces net resource use, and the structure is circular, impact-led or tested. Wrong way means: adds load, and the structure is linear, novelty-led or untested. Everything else is Mixed.",
      "Attractive-but-weak reads as: strong story, thin impact evidence, a load nobody has counted. Viable reads as: a named benefit, a named burden, and someone who can actually run it.",
      "Untested is not the same as reject. Say what would have to be true for it to work and treat that as a condition, not a veto.",
    ],
    sources: [{ label: COURSE_OWN, detail: "The two-signal verdict rule is this course's own decision rule, not an external standard." }],
    moreHint: "the right-way / wrong-way test, decision rules",
    minutes: 15,
  },
  {
    id: "uncertainty",
    code: "C6",
    n: 6,
    icon: "compass",
    title: "Deciding under uncertainty",
    standfirst: "Task 2 steps you up from analyst to consultant — the data stays incomplete either way.",
    definition: [
      "Managers rarely get complete ROI data before they decide. Deciding under uncertainty means having a decision logic that stays defensible while the information is incomplete.",
      "Waiting is not neutral. A delayed decision does not remove the risk; it moves the risk to whoever has to decide later, with less runway left.",
      "A defensible choice names which dimensions (C7) it wins on now and which stay genuinely open.",
    ],
    insight: [
      "Waiting looks like caution, which is why its cost is easy to miss. A good early decision also improves your position for the next one — you learn from a real commitment in a way you cannot from a postponed one.",
    ],
    reasoning: [
      "When a task asks you to prioritise with partial data, treat \"we don't have full ROI numbers yet\" as the normal case, not a reason to default to the safest-looking option.",
      "Defend a choice by naming which dimensions it wins on now and which ones stay genuinely open — not by claiming certainty you do not have.",
    ],
    sources: [{ label: COURSE_OWN, detail: "Decision logic under incomplete data — course-defined, not an external standard." }],
    moreHint: "decision rules",
    minutes: 2,
  },
  {
    id: "dimensions",
    code: "C7",
    n: 7,
    icon: "radar",
    title: "The seven assessment dimensions",
    standfirst: "This is the scoring vocabulary Task 2's radar uses — try a practice case before you rate anything.",
    definition: [
      "Task 2 scores every candidate line on seven dimensions, each at Low, Medium or High. Strategic leverage: how much it shifts the whole board. Innovation effect: genuine new capability, not a rebadge. Sustainability impact: the real net resource or emissions benefit. Feasibility: deliverable now, with today's people and budget.",
      "Risk: what can concretely go wrong. Long-term effect: whether the benefit lasts or decays once attention moves on. Controllability: whether the organisation can steer and govern it once it exists.",
      "Six read \"higher is stronger\". Risk reads in reverse: High means more could go wrong. A lens (C4) names why an initiative succeeds or fails; a dimension gives a score you can compare across options.",
    ],
    insight: [
      "The radar draws one point per dimension, so its shape carries the argument: a spike shows one strong axis, an even shape shows a balanced profile, and a single dent shows the one weakness a decision has to accept or fix.",
    ],
    reasoning: [
      "Score a dimension from what the option's own description supports, not from general enthusiasm for the technology category.",
      "Six axes read \"bigger is stronger.\" Risk reads in reverse — a strong profile keeps that one axis small while the rest are large.",
      "A profile with one very high dimension and several low ones is not automatically weaker than an all-Medium profile — which pattern wins depends on what the decision actually needs, which is Task 2's judgement call.",
    ],
    sources: [{ label: COURSE_OWN, detail: "The seven dimensions are this course's scoring vocabulary, not an external standard." }],
    moreHint: "decision rules, how to read the shape",
    minutes: 3,
  },
  {
    id: "enablerVsPoint",
    code: "C8",
    n: 8,
    icon: "network",
    title: "Enabler versus point-solution",
    standfirst: "Where the real leverage sits is not always where the visible impact sits.",
    definition: [
      "A point solution is one technology or one programme solving one thing — visible, contained, easy to evaluate on its own.",
      "An enabler changes how every future decision gets made — an assessment or governance framework, for instance — so every later initiative inherits it automatically.",
      "For each line in Task 2, ask: is this a decision the organisation makes once, or how it will make every later decision?",
    ],
    insight: [
      "Enablers usually look less exciting on day one: lower visibility, no single dramatic win to show management. Their payoff is structural — higher strategic leverage and higher controllability, compounding across everything that comes after.",
    ],
    reasoning: [
      "Before scoring Strategic leverage or Controllability (C7) on an option, ask whether it is a decision made once, or a decision the organisation will now make correctly every time.",
      "Do not mistake \"less visible now\" for \"less valuable\" — an enabler's benefit shows up in every initiative that follows it, not in itself. Equally, being an enabler is not enough by itself: it still has to be deliverable now (Feasibility).",
    ],
    sources: [{ label: COURSE_OWN, detail: "Enabler versus point solution — course-defined framing." }],
    moreHint: "why enablers look weak on day one, decision rules",
    minutes: 2,
  },
  {
    id: "attractiveWeak",
    code: "C9",
    n: 9,
    icon: "trophy",
    title: "Attractive-but-weak: symbolic innovation and rebound",
    standfirst: "Naming what breaks if the shiny option wins is part of a defensible prioritisation.",
    definition: [
      "A measure can look excellent for the future and still be structurally weak underneath. Three failure modes recur.",
      "Symbolic politics: a visible signal with little real effect behind it. Misinvestment: money and attention committed before the case is proven. Rebound: the efficiency gain is eaten by more usage (C1), showing up again at portfolio scale.",
      "In Task 2 you name two risks, each as one of these three mechanisms, with the early signal that would show it is happening.",
    ],
    insight: [
      "None of the three makes a measure automatically wrong — a first visible win can matter politically. What they demand is that you can say, in advance, what specifically breaks if the attractive option is chosen and the weakness turns out to be real.",
      "Symbolic claims are also a legal exposure in the EU: Directive (EU) 2024/825 restricts vague, unsupported environmental claims.",
    ],
    reasoning: [
      "When justifying a prioritisation pick, name at least one concrete way it could turn out to be attractive-but-weak, and what would signal that early.",
      "A risk phrased as \"it might not work\" is not this card's point — the point is naming which of the three specific mechanisms (symbolic, misinvestment, rebound) is the live one for this option.",
    ],
    sources: [
      { label: "Directive (EU) 2024/825 — EUR-Lex", url: "https://eur-lex.europa.eu/eli/dir/2024/825/oj", detail: "Restricts vague or unsupported environmental claims." },
    ],
    moreHint: "why none is an automatic veto, decision rules, sources",
    minutes: 2,
  },
];

export const MATERIAL_INTRO = {
  kicker: "Material · four core cards · about 60 minutes",
  title: "Four ideas, then you use them",
  intro: "Read each definition, play with its diagram, then diagnose three FutureGrid initiatives with them.",
  more: "The four core cards cover everything the core task asks: the resource-load question (C2), the impact-or-novelty and circular-or-linear questions (C1, C3) and the verdict rule that turns your two answers into a zone (C5). Five more cards — the seven lenses, deciding under uncertainty, the seven dimensions, enabler versus point solution, and attractive-but-weak — sit behind the optional button below; they back the optional lens step and the optional Level 2 decision. Open Read more on any card for the decision rules, the reasoning behind them and the sources.",
  optionalTitle: "More material — five extra cards",
  optionalHint: "C4 the seven lenses · C6 deciding under uncertainty · C7 the seven dimensions · C8 enabler vs point solution · C9 attractive-but-weak. Needed only for the optional lens step and the optional Level 2 task.",
} as const;
