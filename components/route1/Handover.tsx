"use client";

import { HANDOVER, ZONES, type ZoneId } from "@/lib/route1";
import { useRoute1, domId } from "./useRoute1";

const SHORT_ZONE_LABEL: Record<ZoneId, string> = {
  opportunity: "Opportunity",
  mixed: "Mixed",
  risk: "Risk",
};

/**
 * The inline handover between Part 1 (Diagnose) and Part 2 (Decide) —
 * CLAUDE.md §12: not a section of content, and never a gate. It consumes the
 * learner's own Part 1 output (their zone tally) drawn as a small SVG, so
 * Part 2 reads as caused by Part 1 rather than a fresh, unrelated task.
 */
export function Handover() {
  const r1 = useRoute1();
  const counts = ZONES.map((z) => ({ zone: z, count: r1.byZone(z.id).length }));
  const total = r1.totalCards;

  return (
    <div id={domId.handover} className="scroll-mt-24 rounded-2xl border border-line bg-mist p-5">
      <p className="text-micro font-semibold uppercase tracking-wide text-ash">{HANDOVER.heading}</p>

      <div className="mt-3 flex h-6 overflow-hidden rounded-full border border-line bg-paper" role="img" aria-label="Your Part 1 tally across the three zones">
        {counts.map(({ zone, count }) => {
          const width = total > 0 ? (count / total) * 100 : 0;
          if (width === 0) return null;
          const tone =
            zone.id === "opportunity" ? "bg-ink" : zone.id === "risk" ? "bg-ash" : "bg-line";
          return <div key={zone.id} className={tone} style={{ width: `${width}%` }} title={`${zone.name}: ${count}`} />;
        })}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {counts.map(({ zone, count }) => (
          <span key={zone.id} className="text-micro text-ash">
            <span className="font-semibold text-ink">{count}</span> {SHORT_ZONE_LABEL[zone.id]}
          </span>
        ))}
      </div>

      <p className="mt-3 max-w-prose text-body text-ash">{HANDOVER.body}</p>
    </div>
  );
}
