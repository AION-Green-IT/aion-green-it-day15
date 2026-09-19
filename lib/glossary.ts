/**
 * Plain-language glossary for every abbreviation, regulation and named idea
 * that the Day 15 material uses. Each entry says what the term stands for, what
 * it means in one or two sentences, and where the primary text lives.
 *
 * URL check (2026-09-19, `curl -L -A "Mozilla/5.0"`): IEA, Global E-waste
 * Monitor, Ellen MacArthur Foundation, EEA, EC WEEE page, GHG Protocol, EFRAG
 * and Wikipedia answered 200. EUR-Lex ELI links answer HTTP 202 to scripts (a
 * bot challenge) — they are the canonical permalink form and were NOT opened in
 * a browser. ISO.org answers 403 to scripts, so ISO standards are named but not
 * linked (`note`).
 */

export type GlossarySource = { label: string; url: string };

export type GlossaryEntry = {
  id: string;
  /** Exact strings in the running text that open this entry (case-sensitive). */
  matches: string[];
  /** The short form shown as the entry's name. */
  name: string;
  /** What it stands for, in full, with the legal reference. */
  full: string;
  meaning: string;
  sources: GlossarySource[];
  /** Shown instead of a link when the primary text cannot be linked. */
  note?: string;
};

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "rebound",
    matches: ["Jevons paradox", "rebound effect", "rebound"],
    name: "Rebound effect",
    full: "Rebound effect — the Jevons paradox is its strongest form",
    meaning:
      "When an efficiency gain makes something cheaper or easier, people use more of it, and the extra use eats part or all of the saving. It is called the Jevons paradox when the extra use is larger than the saving, after the economist W. S. Jevons, who described it for coal in 1865.",
    sources: [{ label: "Jevons paradox — background reading (Wikipedia)", url: "https://en.wikipedia.org/wiki/Jevons_paradox" }],
  },
  {
    id: "iea",
    matches: ["IEA"],
    name: "IEA",
    full: "International Energy Agency",
    meaning:
      "An intergovernmental energy organisation, founded in 1974, that publishes energy statistics and outlooks. Its Electricity 2024 report is the source of the data-centre figures used here.",
    sources: [{ label: "IEA — Electricity 2024", url: "https://www.iea.org/reports/electricity-2024" }],
  },
  {
    id: "twh",
    matches: ["TWh"],
    name: "TWh",
    full: "Terawatt-hour",
    meaning: "A unit of energy: one TWh is one billion kilowatt-hours (kWh), the unit on a household electricity bill.",
    sources: [],
  },
  {
    id: "inference",
    matches: ["inference"],
    name: "Inference",
    full: "Inference — running an already-trained AI model",
    meaning:
      "Using a trained model to produce an answer or a prediction. Training builds the model once; inference happens every time the model is used, so at scale the running load can add up to more than the one-off training.",
    sources: [],
  },
  {
    id: "lca",
    matches: ["life-cycle assessment", "lifecycle"],
    name: "Life-cycle assessment",
    full: "Life-cycle assessment (LCA) — ISO 14040 / ISO 14044",
    meaning:
      "A method that counts the resource use and emissions of a product or service across its whole life — making, running and disposing — instead of at one stage. It is what \"net effect across the lifecycle\" means in practice.",
    sources: [],
    note: "The ISO 14040 and 14044 texts are behind ISO.org, which could not be opened by script, so they are named but not linked.",
  },
  {
    id: "weee",
    matches: ["WEEE Directive (2012/19/EU)", "WEEE Directive", "WEEE"],
    name: "WEEE Directive",
    full: "Waste Electrical and Electronic Equipment Directive — Directive 2012/19/EU",
    meaning:
      "EU law that makes producers responsible for collecting and treating electrical and electronic waste and sets collection targets. In Germany it is implemented through the ElektroG.",
    sources: [
      { label: "Directive 2012/19/EU — EUR-Lex", url: "https://eur-lex.europa.eu/eli/dir/2012/19/oj" },
      {
        label: "WEEE overview — European Commission",
        url: "https://environment.ec.europa.eu/topics/waste-and-recycling/waste-electrical-and-electronic-equipment-weee_en",
      },
    ],
  },
  {
    id: "espr",
    matches: ["EU ESPR (2024)", "ESPR"],
    name: "ESPR",
    full: "Ecodesign for Sustainable Products Regulation — Regulation (EU) 2024/1781",
    meaning:
      "EU framework that lets the Commission set ecodesign rules product group by product group: durability, repairability, recycled content and information such as the digital product passport. The detailed rules for each product group come in later delegated acts.",
    sources: [{ label: "Regulation (EU) 2024/1781 — EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg/2024/1781/oj" }],
  },
  {
    id: "dpp",
    matches: ["digital product passport"],
    name: "Digital product passport",
    full: "Digital product passport (DPP) — introduced by the ESPR",
    meaning:
      "A standard digital record attached to a product that says what it is made of, how to repair it and what to do at end of life — so a refurbisher or recycler does not have to guess.",
    sources: [{ label: "Regulation (EU) 2024/1781 — EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg/2024/1781/oj" }],
  },
  {
    id: "rladder",
    matches: ["R-strategies", "R-ladder"],
    name: "R-strategies",
    full: "R-strategies (the R-ladder) — ordered options from most to least circular",
    meaning:
      "A ladder of ways to keep a product's value: the higher the rung, the more resource it saves. This card uses seven rungs — refuse/rethink, reduce, reuse, repair, refurbish, remanufacture, recycle. Wider versions of the ladder add more rungs, such as repurpose and recover.",
    sources: [{ label: "Ellen MacArthur Foundation — circular economy", url: "https://www.ellenmacarthurfoundation.org/topics/circular-economy-introduction/overview" }],
  },
  {
    id: "ewaste",
    matches: ["Global E-waste Monitor 2024"],
    name: "Global E-waste Monitor 2024",
    full: "Global E-waste Monitor 2024 — UNITAR and ITU",
    meaning:
      "The UN's regular statistical report on electronic waste. The 2024 edition counts 62 million tonnes (Mt) generated in 2022, of which 22.3% was documented as formally collected and recycled.",
    sources: [{ label: "Global E-waste Monitor 2024", url: "https://ewastemonitor.info/the-global-e-waste-monitor-2024/" }],
  },
  {
    id: "takeback",
    matches: ["take-back"],
    name: "Take-back",
    full: "Take-back scheme",
    meaning:
      "An arrangement in which the supplier, or the company itself, collects devices at the end of use so they can be reused, refurbished or recycled instead of thrown away.",
    sources: [],
  },
  {
    id: "csrd",
    matches: ["CSRD"],
    name: "CSRD",
    full: "Corporate Sustainability Reporting Directive — Directive (EU) 2022/2464",
    meaning:
      "EU law that makes large companies publish audited sustainability information in their annual management report. Which companies must report, and from when, is being revised by the EU's simplification (\"Omnibus\") package — check the current scope before teaching it.",
    sources: [{ label: "Directive (EU) 2022/2464 — EUR-Lex", url: "https://eur-lex.europa.eu/eli/dir/2022/2464/oj" }],
  },
  {
    id: "esrs",
    matches: ["ESRS E5", "ESRS E1", "ESRS"],
    name: "ESRS",
    full: "European Sustainability Reporting Standards — Delegated Regulation (EU) 2023/2772",
    meaning:
      "The detailed rulebook for what a CSRD reporter must disclose. Topic E1 covers climate change; topic E5 covers resource use and the circular economy, which is the one that fits circular IT. Both sit in the same regulation. The set is being simplified — check the current version.",
    sources: [{ label: "Delegated Regulation (EU) 2023/2772 — EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg_del/2023/2772/oj" }],
  },
  {
    id: "iso50001",
    matches: ["ISO 50001"],
    name: "ISO 50001",
    full: "ISO 50001 — Energy management systems",
    meaning:
      "An international standard for running energy use as a managed process: set a policy, plan, act, check the results and review in management, then repeat. It is the model for the review loop in the governance cycle.",
    sources: [],
    note: "ISO.org could not be opened by script, so the standard is named but not linked.",
  },
  {
    id: "iso20400",
    matches: ["ISO 20400"],
    name: "ISO 20400",
    full: "ISO 20400 — Sustainable procurement guidance",
    meaning:
      "International guidance for building sustainability into what an organisation buys and from whom. It matters wherever a governance decision ends in a purchase.",
    sources: [],
    note: "ISO.org could not be opened by script, so the standard is named but not linked.",
  },
  {
    id: "greenclaims",
    matches: ["Directive (EU) 2024/825"],
    name: "Directive (EU) 2024/825",
    full: "Empowering Consumers for the Green Transition Directive — Directive (EU) 2024/825",
    meaning:
      "EU law against misleading environmental claims: it restricts vague claims such as \"eco-friendly\" that are not backed up, and claims that a product is neutral because of offsetting. Member states apply it from autumn 2026 — check the current status.",
    sources: [{ label: "Directive (EU) 2024/825 — EUR-Lex", url: "https://eur-lex.europa.eu/eli/dir/2024/825/oj" }],
  },
];

export const glossaryById = (id: string): GlossaryEntry => GLOSSARY.find((g) => g.id === id)!;

// Longest match first, so "WEEE Directive (2012/19/EU)" wins over "WEEE".
const MATCHERS = GLOSSARY.flatMap((g) => g.matches.map((text) => ({ text, id: g.id }))).sort((a, b) => b.text.length - a.text.length);

export type TextPart = { text: string; termId?: string };

/** Splits a sentence into plain runs and glossary terms. */
export function splitByGlossary(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let i = 0;
  let plainStart = 0;
  while (i < text.length) {
    // A term only opens at a word start, so "IEA" never fires inside another word.
    const atWordStart = i === 0 || !/[A-Za-z]/.test(text[i - 1]);
    const hit = atWordStart ? MATCHERS.find((m) => text.startsWith(m.text, i)) : undefined;
    if (hit) {
      if (i > plainStart) parts.push({ text: text.slice(plainStart, i) });
      parts.push({ text: hit.text, termId: hit.id });
      i += hit.text.length;
      plainStart = i;
    } else {
      i += 1;
    }
  }
  if (plainStart < text.length) parts.push({ text: text.slice(plainStart) });
  return parts;
}
