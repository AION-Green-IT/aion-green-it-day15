/**
 * Route 2's material: four micro-cards, D1–D4, all read before Task 3
 * (CLAUDE.md §12: material first, no material between task parts — Task 3
 * has no parts to split anyway, it is one continuous builder).
 */

export type MaterialSectionId = "architecture" | "assessmentLogic" | "governance" | "horizons";

export const SECTION_ORDER: MaterialSectionId[] = ["architecture", "assessmentLogic", "governance", "horizons"];

/**
 * The two cards every learner reads (~45 minutes, Day 14's standard for a two-card
 * route): the decision architecture (D1) and the four assessment criteria (D2), plus
 * the read-only CircularMind example. They are exactly what the two core tasks use —
 * the canvas (D1), and elements 1, 3 and 5 of the proposal (D1, D2). The governance
 * loop (D3) and the time horizons (D4) stay in full behind an optional button; they
 * back the optional extension of the proposal (elements 2, 4, 6, 7 and the horizon
 * classifier).
 */
export const CORE_SECTIONS: MaterialSectionId[] = ["architecture", "assessmentLogic"];
export const OPTIONAL_SECTIONS: MaterialSectionId[] = SECTION_ORDER.filter((id) => !CORE_SECTIONS.includes(id));

/** DOM anchor a MaterialRefs chip or the mini-nav scrolls to. */
export function materialAnchorId(id: MaterialSectionId): string {
  return `r2-card-${id}`;
}

export const MATERIAL_LABELS: Record<MaterialSectionId, string> = {
  architecture: "D1 · From projects to a decision architecture",
  assessmentLogic: "D2 · Assessment logic",
  governance: "D3 · Governance & investment logic",
  horizons: "D4 · Time horizons",
};

export const MATERIAL_NAV: Record<MaterialSectionId, { code: string; label: string }> = {
  architecture: { code: "D1", label: "From projects to a decision architecture" },
  assessmentLogic: { code: "D2", label: "Assessment logic" },
  governance: { code: "D3", label: "Governance & investment logic" },
  horizons: { code: "D4", label: "Time horizons" },
};

/** Chips for a task step: which material cards it draws on. */
export function materialRefs(ids: MaterialSectionId[]) {
  return ids.map((id) => ({ anchorId: materialAnchorId(id), label: MATERIAL_LABELS[id] }));
}
