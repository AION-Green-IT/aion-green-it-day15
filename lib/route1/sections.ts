/**
 * Route 1's material: nine micro-cards, C1–C9, all of it read before any task
 * (CLAUDE.md §12: "no material between the parts" — L2's four cards continue
 * the same continuous block rather than sitting between Task 1 and Task 2).
 *
 * C1–C5 teach Level 1's diagnosis vocabulary; C6–C9 step the perspective up
 * from junior analyst to senior consultant for Level 2's prioritisation. Each
 * card stays 3–5 sentences plus one live diagram — "read less, do more" — and
 * everything either task asks for is introduced in one of the nine.
 *
 * The ids, labels and anchor ids live above the content so the mini-nav, the
 * MaterialRefs chips on the task, and the material itself can never disagree
 * about what a card is called.
 */

export type MaterialSectionId =
  | "novelty"
  | "aiLoad"
  | "circular"
  | "lenses"
  | "viability"
  | "uncertainty"
  | "dimensions"
  | "enablerVsPoint"
  | "attractiveWeak";

export const SECTION_ORDER: MaterialSectionId[] = [
  "novelty",
  "aiLoad",
  "circular",
  "lenses",
  "viability",
  "uncertainty",
  "dimensions",
  "enablerVsPoint",
  "attractiveWeak",
];

/**
 * The four cards every learner reads (~60 minutes, Day 14's standard). They are
 * exactly the ones the core task draws on: Q1 (C2), Q2 impact/novelty (C1), Q2
 * circular/linear (C3), the verdict rule and tested/untested (C5). The other five
 * — lenses, uncertainty, dimensions, enabler, attractive-but-weak — stay in full,
 * behind an optional block, and are what the optional lens and Level 2 work uses.
 */
export const CORE_SECTIONS: MaterialSectionId[] = ["novelty", "aiLoad", "circular", "viability"];
export const OPTIONAL_SECTIONS: MaterialSectionId[] = SECTION_ORDER.filter((id) => !CORE_SECTIONS.includes(id));
export const isCoreSection = (id: MaterialSectionId): boolean => CORE_SECTIONS.includes(id);

/** DOM anchor a MaterialRefs chip or the mini-nav scrolls to. */
export function materialAnchorId(id: MaterialSectionId): string {
  return `r1-card-${id}`;
}

export const MATERIAL_LABELS: Record<MaterialSectionId, string> = {
  novelty: "C1 · Novelty is not innovation",
  aiLoad: "C2 · AI: promise and burden",
  circular: "C3 · Circular vs linear IT",
  lenses: "C4 · The 7 assessment lenses",
  viability: "C5 · Attractive vs viable",
  uncertainty: "C6 · Deciding under uncertainty",
  dimensions: "C7 · The 7 assessment dimensions",
  enablerVsPoint: "C8 · Enabler vs point-solution",
  attractiveWeak: "C9 · Attractive-but-weak",
};

/** Short label for the sticky mini-nav dots. */
export const MATERIAL_NAV: Record<MaterialSectionId, { code: string; label: string }> = {
  novelty: { code: "C1", label: "Novelty is not innovation" },
  aiLoad: { code: "C2", label: "AI: promise and burden" },
  circular: { code: "C3", label: "Circular vs linear IT" },
  lenses: { code: "C4", label: "The 7 assessment lenses" },
  viability: { code: "C5", label: "Attractive vs viable" },
  uncertainty: { code: "C6", label: "Deciding under uncertainty" },
  dimensions: { code: "C7", label: "The 7 assessment dimensions" },
  enablerVsPoint: { code: "C8", label: "Enabler vs point-solution" },
  attractiveWeak: { code: "C9", label: "Attractive-but-weak" },
};

/** Chips for a task step: which material cards it draws on. */
export function materialRefs(ids: MaterialSectionId[]) {
  return ids.map((id) => ({ anchorId: materialAnchorId(id), label: MATERIAL_LABELS[id] }));
}
