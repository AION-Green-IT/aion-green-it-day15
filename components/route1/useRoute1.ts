"use client";

import { useProgress, useHydrated } from "@/lib/store";
import type { MissingItem } from "@/components/ui/MissingList";
import {
  DIMENSIONS,
  FOLLOWUP_FIELDS,
  GENERIC_FALLBACK_CLUE,
  INITIATIVES,
  LENSES,
  LEVEL_VALUE,
  LOAD_FIELD,
  OPTION_LINES,
  R1,
  RISK_FIELDS,
  STRUCTURE_QUESTIONS,
  checkPriority,
  isCoreInitiative,
  optionById,
  resolveZone,
  type Check2Result,
  type DimensionId,
  type Initiative,
  type LensId,
  type Level,
  type LoadAnswer,
  type OptionId,
  type StructureAnswer,
  type ZoneId,
} from "@/lib/route1";

/** DOM ids the missing-item list scrolls to and flashes. */
export const domId = {
  name: "r1-name",

  task: "task",
  board: "r1-board",
  init: (id: string) => `r1-init-${id}`,
  initLoad: (id: string) => `r1-init-${id}-load`,
  initStructure: (id: string) => `r1-init-${id}-structure`,
  initLens: (id: string) => `r1-init-${id}-lens`,
  initWhy: (id: string) => `r1-init-${id}-why`,
  closing: "r1-closing",
  closingAll: "r1-closing-all",
  /** Optional blocks — persisted open/closed ids. */
  optMoreInitiatives: "r1-more-initiatives",
  optLevel2: "r1-level-2",

  handover: "r1-handover",
  partTwo: "r1-part-two",
  optionCard: (id: string) => `r1-l2-option-${id}`,
  optionScore: (optionId: string, dimensionId: string) => `r1-l2-score-${optionId}-${dimensionId}`,
  priority: "r1-l2-priority",
  justification: "r1-l2-justification",
  followUp: (i: number) => `r1-l2-followup-${i}`,
  risks: "r1-l2-risks",

  export: "r1-export",
};

export type InitiativeState = {
  initiative: Initiative;
  load: LoadAnswer | null;
  structure: StructureAnswer | null;
  /** Derived from the two answers — never chosen directly (lib/route1/task1.ts `resolveZone`). */
  zone: ZoneId | null;
  lens: LensId | null;
  rationale: string;
  /** One of the three initiatives everyone diagnoses. The other three are optional. */
  core: boolean;
  checkCount: number;
  /** Both questions answered, so the card has resolved into a zone. */
  diagnosed: boolean;
  /** Answered, and a rationale written. The lens is optional (C4 is an optional card). */
  complete: boolean;
};

/**
 * A check reports one verdict for the whole initiative and never says which of
 * the two questions is wrong: the structure question is binary, so naming it
 * would be the answer (CLAUDE.md §4, §12). The clue points at the reasoning to
 * redo and sharpens on the second and later checks of the same initiative.
 */
export type CheckResult = { holds: true } | { holds: false; clue: string; tier: "soft" | "sharp" };

export function checkInitiative(state: InitiativeState, checkCountAfter: number): CheckResult {
  const { initiative, load, structure, lens } = state;
  if (!load || !structure) return { holds: true };

  const tier: "soft" | "sharp" = checkCountAfter >= 2 ? "sharp" : "soft";
  const clueFor = (tiers: { soft: string; sharp: string } | undefined) =>
    (tiers ?? GENERIC_FALLBACK_CLUE)[tier];

  if (load !== initiative.expectedLoad) {
    return { holds: false, clue: clueFor(initiative.loadClue), tier };
  }
  if (structure !== initiative.expectedStructure) {
    return { holds: false, clue: clueFor(initiative.structureClue), tier };
  }
  // An unassigned lens is incomplete, not wrong — only a chosen one can miss.
  if (lens && !initiative.acceptedLenses.includes(lens)) {
    return { holds: false, clue: clueFor(initiative.lensClue), tier };
  }
  return { holds: true };
}

const isLoadAnswer = (v: string | undefined): v is LoadAnswer =>
  !!v && LOAD_FIELD.options.some((o) => o.id === v);

const isStructureAnswer = (v: string | undefined, initiative: Initiative): v is StructureAnswer =>
  !!v && STRUCTURE_QUESTIONS[initiative.structureQuestion].options.some((o) => o.id === v);

const isLensId = (v: string | undefined): v is LensId => !!v && LENSES.some((l) => l.id === v);

const isLevel = (v: string | undefined): v is Level => v === "low" || v === "medium" || v === "high";
const isOptionId = (v: string | undefined): v is OptionId => v === "a" || v === "b" || v === "c";

export type OptionAssessment = {
  optionId: OptionId;
  scores: Record<DimensionId, Level | null>;
  scoredCount: number;
  fullyScored: boolean;
  /** Numeric 1–3 values for the radar, 0 (collapses to centre) where unscored. */
  radarValues: Record<string, number>;
};

/**
 * Joins the shared progress store to Route 1's whole task — Task 1 (Diagnose)
 * and Task 2 (Decide) — one hook, one `missing` list, one definition of done
 * (CLAUDE.md §12).
 */
export function useRoute1() {
  const hydrated = useHydrated();
  const notes = useProgress((s) => s.notes);
  const choices = useProgress((s) => s.choices);

  const name = notes[R1.name] ?? "";
  const closing = (notes[R1.closing] ?? "").trim();
  const closingAll = (notes[R1.closingAll] ?? "").trim();

  // -- Task 1 ----------------------------------------------------------------
  const cards: InitiativeState[] = INITIATIVES.map((initiative) => {
    const rawLoad = choices[R1.load(initiative.id)];
    const load = isLoadAnswer(rawLoad) ? rawLoad : null;
    const rawStructure = choices[R1.structure(initiative.id)];
    const structure = isStructureAnswer(rawStructure, initiative) ? rawStructure : null;
    const rawLens = choices[R1.lens(initiative.id)];
    const lens = isLensId(rawLens) ? rawLens : null;
    const rationale = (notes[R1.rationale(initiative.id)] ?? "").trim();
    const checkCount = Number(notes[R1.checkCount(initiative.id)] ?? "0") || 0;

    const diagnosed = !!load && !!structure;

    return {
      initiative,
      load,
      structure,
      zone: diagnosed ? resolveZone(load!, structure!) : null,
      lens,
      rationale,
      core: isCoreInitiative(initiative.id),
      checkCount,
      diagnosed,
      complete: diagnosed && rationale.length > 0,
    };
  });

  const cardById = (id: string) => cards.find((c) => c.initiative.id === id)!;
  const byZone = (zone: ZoneId) => cards.filter((c) => c.zone === zone);
  const undiagnosed = cards.filter((c) => !c.diagnosed);
  const diagnosedCount = cards.filter((c) => c.diagnosed).length;
  const completeCount = cards.filter((c) => c.complete).length;
  const coreCards = cards.filter((c) => c.core);
  const extraCards = cards.filter((c) => !c.core);
  const coreDiagnosedCount = coreCards.filter((c) => c.diagnosed).length;
  const coreCompleteCount = coreCards.filter((c) => c.complete).length;
  /** The learner has started anything in the optional part of Part 1 — it then stays open. */
  const extraTouched =
    extraCards.some((c) => !!c.load || !!c.structure || !!c.lens || !!c.rationale) || closingAll.length > 0;
  /** A lens is optional on every card; a card with one keeps its lens block open. */
  const task1Complete = coreCards.every((c) => c.complete) && !!closing;

  // -- Task 2 ------------------------------------------------------------------
  const options: OptionAssessment[] = OPTION_LINES.map((opt) => {
    const scores = {} as Record<DimensionId, Level | null>;
    const radarValues: Record<string, number> = {};
    for (const dim of DIMENSIONS) {
      const raw = choices[R1.score(opt.id, dim.id)];
      const level = isLevel(raw) ? raw : null;
      scores[dim.id] = level;
      radarValues[dim.id] = level ? LEVEL_VALUE[level] : 0;
    }
    const scoredCount = DIMENSIONS.filter((d) => scores[d.id]).length;
    return { optionId: opt.id, scores, scoredCount, fullyScored: scoredCount === DIMENSIONS.length, radarValues };
  });
  const optionAssessment = (id: OptionId) => options.find((o) => o.optionId === id)!;
  const allOptionsScored = options.every((o) => o.fullyScored);

  const rawPriority = choices[R1.priority];
  const priority = isOptionId(rawPriority) ? rawPriority : null;
  const justification = (notes[R1.justification] ?? "").trim();
  const followUps = FOLLOWUP_FIELDS.map((f) => (notes[R1.followUp(f.id)] ?? "").trim());
  const risks = RISK_FIELDS.map((r) => (notes[R1.risk(r.id)] ?? "").trim());
  const risksFilledCount = risks.filter((r) => r.length > 0).length;
  const checkCount2 = Number(notes[R1.checkCount2] ?? "0") || 0;

  /** The learner has started the optional Level 2 decision — it then stays open. */
  const part2Touched =
    options.some((o) => o.scoredCount > 0) ||
    !!priority ||
    justification.length > 0 ||
    followUps.some((f) => f.length > 0) ||
    risksFilledCount > 0;

  const task2Complete =
    allOptionsScored && !!priority && justification.length > 0 && followUps.every((f) => f.length > 0) && risksFilledCount === RISK_FIELDS.length;

  const lastCheck2: Check2Result | null = priority ? checkPriority(priority, justification, checkCount2) : null;

  // -- Missing list ------------------------------------------------------------
  // Standard #1: one entry per concretely-missing thing, named, in page order.
  const missing: MissingItem[] = [];
  if (!name.trim()) missing.push({ id: domId.name, label: "Your name — needed to label the export" });

  // Only the core task is ever required: three initiatives (both questions and a rationale)
  // and the closing question. The lens, the other three initiatives and Level 2 are optional
  // and never appear here, however far the learner gets with them.
  for (const c of coreCards) {
    const who = `Initiative ${c.initiative.n} "${c.initiative.short}"`;
    if (!c.load) {
      missing.push({
        id: domId.initLoad(c.initiative.id),
        label: `${who} — the resource-load question is still unanswered`,
      });
    }
    if (!c.structure) {
      missing.push({
        id: domId.initStructure(c.initiative.id),
        label: `${who} — the "${STRUCTURE_QUESTIONS[c.initiative.structureQuestion].label}" question is still unanswered`,
      });
    }
    if (c.diagnosed && !c.rationale) {
      missing.push({ id: domId.initWhy(c.initiative.id), label: `${who} — no one-line rationale written yet` });
    }
  }

  if (!closing) {
    missing.push({
      id: domId.closing,
      label: "Closing question — which of your three initiatives is attractive now but structurally weak?",
    });
  }

  return {
    hydrated,
    name,
    closing,
    closingAll,

    // Task 1
    cards,
    coreCards,
    extraCards,
    coreDiagnosedCount,
    coreCompleteCount,
    coreCount: coreCards.length,
    extraTouched,
    part2Touched,
    cardById,
    byZone,
    undiagnosed,
    diagnosedCount,
    completeCount,
    totalCards: INITIATIVES.length,
    task1Complete,

    // Task 2
    options,
    optionAssessment,
    allOptionsScored,
    priority,
    justification,
    followUps,
    risks,
    risksFilledCount,
    checkCount2,
    lastCheck2,
    task2Complete,

    missing,
    allComplete: missing.length === 0,
  };
}

export type Route1State = ReturnType<typeof useRoute1>;
