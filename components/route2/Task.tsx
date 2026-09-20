"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { LivePanel } from "@/components/ui/LivePanel";
import { EXPORT, TASK3_FRAMING } from "@/lib/route2";
import { Canvas } from "./Canvas";
import { ProposalBuilder } from "./ProposalBuilder";
import { ReportPanel } from "./ReportPanel";
import { useRoute2, domId } from "./useRoute2";

/**
 * Task 3 in full, one continuous scroll: the framing, the decision-
 * architecture canvas (Stage 1), then the guided proposal (Stage 2), with the
 * proposal document assembling beside it. One task, no parts to split — the
 * whole exercise is the deliverable (CLAUDE.md §12).
 */
export function Task() {
  const r2 = useRoute2();

  return (
    <section id={domId.task} className="scroll-mt-24 space-y-6">
      <SectionHeading kicker={`${TASK3_FRAMING.tag} · about ${TASK3_FRAMING.minutes} minutes`} title={TASK3_FRAMING.title} />

      <div className="rounded-2xl border border-accent/30 bg-accentSoft/60 p-5">
        <p className="text-body font-semibold text-ink">{TASK3_FRAMING.lead}</p>
        <p className="mt-2 max-w-prose text-body text-ash">{TASK3_FRAMING.instruction}</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-line bg-canvas p-5">
            <p className="text-micro font-semibold uppercase tracking-wide text-ash">Task 1 · about 10 minutes — Build the decision architecture</p>
            <Canvas />
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-micro font-semibold uppercase tracking-wide text-ash">Task 2 · about 10 minutes — Write the core of the proposal</p>
            <div className="mt-3">
              <ProposalBuilder />
            </div>
          </div>
        </div>

        <LivePanel
          title={EXPORT.docHeading}
          summary={`${6 - r2.orphanedBlocks.length}/6 blocks connected · ${r2.elementsComplete ? "core complete" : "core in progress"}`}
        >
          <ReportPanel />
        </LivePanel>
      </div>
    </section>
  );
}
