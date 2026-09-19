"use client";

import { useProgress, useHydrated } from "@/lib/store";
import type { MissingItem } from "@/components/ui/MissingList";
import {
  BLOCKS,
  CANDIDATE_MEASURES,
  GUIDING_DECISION_FIELDS,
  HORIZONS,
  R2,
  blockGroups,
  checkProposal,
  connectionKey,
  type BlockId,
  type Check3Result,
  type FirstMeasureId,
  type Horizon,
} from "@/lib/route2";

/** DOM ids the missing-item list scrolls to and flashes. */
export const domId = {
  name: "r2-name",
  task: "task",
  canvas: "r2-canvas",
  blockNode: (id: BlockId) => `r2-block-${id}`,
  firstMeasure: "r2-first-measure",
  element1: "r2-element-1",
  guiding: (i: number) => `r2-guiding-${i}`,
  element3: "r2-element-3",
  element4: "r2-element-4",
  element5Why: "r2-element-5-why",
  element6: "r2-element-6",
  element7: "r2-element-7",
  horizonBoard: "r2-horizons",
  horizonItem: (id: string) => `r2-horizon-${id}`,
  export: "r2-export",
};

const isFirstMeasure = (v: string | undefined): v is FirstMeasureId => v === "framework" || v === "ai" || v === "circular";
const isHorizon = (v: string | undefined): v is Horizon => v === "short" || v === "medium" || v === "structural";

/**
 * Joins the shared progress store to Route 2's whole task, one hook — one
 * `missing` list, one definition of done (CLAUDE.md §12).
 */
export function useRoute2() {
  const hydrated = useHydrated();
  const notes = useProgress((s) => s.notes);
  const choices = useProgress((s) => s.choices);
  const checks = useProgress((s) => s.checks);

  const name = notes[R2.name] ?? "";

  // -- Stage 1: canvas connections --------------------------------------------
  const pairs: [BlockId, BlockId][] = [];
  for (let i = 0; i < BLOCKS.length; i++) {
    for (let j = i + 1; j < BLOCKS.length; j++) {
      pairs.push([BLOCKS[i].id, BLOCKS[j].id]);
    }
  }
  const connections = pairs.filter(([a, b]) => !!checks[R2.connection(connectionKey(a, b))]);
  const isConnected = (a: BlockId, b: BlockId) => !!checks[R2.connection(connectionKey(a, b))];
  const degree = (id: BlockId) => connections.filter(([a, b]) => a === id || b === id).length;
  const orphanedBlocks = BLOCKS.filter((b) => degree(b.id) === 0);
  /** Connected groups: one group means one architecture, several mean islands. */
  const groups = blockGroups(connections);

  // -- Stage 2: first-measure + proposal elements ------------------------------
  const rawFirstMeasure = choices[R2.firstMeasure];
  const firstMeasure = isFirstMeasure(rawFirstMeasure) ? rawFirstMeasure : null;
  const element1 = (notes[R2.element1] ?? "").trim();
  const guidingDecisions = GUIDING_DECISION_FIELDS.map((f) => (notes[R2.guidingDecision(f.id)] ?? "").trim());
  const element3 = (notes[R2.element3] ?? "").trim();
  const element4 = (notes[R2.element4] ?? "").trim();
  const element5Why = (notes[R2.element5Why] ?? "").trim();
  const element6 = (notes[R2.element6] ?? "").trim();
  const element7 = (notes[R2.element7] ?? "").trim();

  const horizons: Record<string, Horizon | null> = {};
  for (const m of CANDIDATE_MEASURES) {
    const raw = choices[R2.horizon(m.id)];
    horizons[m.id] = isHorizon(raw) ? raw : null;
  }
  const unclassifiedMeasures = CANDIDATE_MEASURES.filter((m) => !horizons[m.id]);

  const elementsComplete =
    !!element1 && guidingDecisions.every((g) => g.length > 0) && !!element3 && !!element4 && !!element5Why && !!element6 && !!element7;

  const checkCount = Number(notes[R2.checkCount] ?? "0") || 0;
  const lastCheck: Check3Result = checkProposal({
    groups,
    firstMeasure,
    element3,
    element4,
    element5Why,
    element6,
    horizons,
    elementsComplete,
    checkCountAfter: checkCount,
  });

  // -- Missing list -------------------------------------------------------------
  const missing: MissingItem[] = [];
  if (!name.trim()) missing.push({ id: domId.name, label: "Your name — needed to label the export" });

  if (orphanedBlocks.length > 0) {
    missing.push({
      id: domId.canvas,
      label: `${orphanedBlocks.length} canvas block${orphanedBlocks.length === 1 ? "" : "s"} orphaned`,
    });
  }
  if (orphanedBlocks.length === 0 && groups.length > 1) {
    missing.push({ id: domId.canvas, label: `The canvas splits into ${groups.length} separate groups — connect them into one architecture` });
  }
  if (!firstMeasure) missing.push({ id: domId.firstMeasure, label: "First-measure not selected" });
  if (!element1) missing.push({ id: domId.element1, label: "Element 1 (strategic relevance) empty" });
  guidingDecisions.forEach((g, i) => {
    if (!g) missing.push({ id: domId.guiding(i), label: `Guiding decision ${i + 1} empty` });
  });
  if (!element3) missing.push({ id: domId.element3, label: "Element 3 (decision logic) empty" });
  if (!element4) missing.push({ id: domId.element4, label: "Element 4 (central trade-offs) empty" });
  if (!element5Why) missing.push({ id: domId.element5Why, label: "Element 5 (why this first) empty" });
  if (!element6) missing.push({ id: domId.element6, label: "Element 6 (roles, responsibilities, approval, review) empty" });
  if (!element7) missing.push({ id: domId.element7, label: "Element 7 (the decision to take now) empty" });
  if (unclassifiedMeasures.length > 0) {
    missing.push({ id: domId.horizonBoard, label: `${unclassifiedMeasures.length} measure${unclassifiedMeasures.length === 1 ? "" : "s"} unclassified` });
  }

  return {
    hydrated,
    name,

    // Stage 1
    connections,
    isConnected,
    degree,
    orphanedBlocks,
    groups,

    // Stage 2
    firstMeasure,
    element1,
    guidingDecisions,
    element3,
    element4,
    element5Why,
    element6,
    element7,
    horizons,
    unclassifiedMeasures,
    checkCount,
    lastCheck,
    elementsComplete,

    missing,
    allComplete: missing.length === 0,
  };
}

export type Route2State = ReturnType<typeof useRoute2>;
export const HORIZON_OPTIONS = HORIZONS;
