"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { MicroCard } from "@/components/ui/MicroCard";
import { MiniNav } from "@/components/ui/MiniNav";
import { MATERIAL, MATERIAL_INTRO, MATERIAL_NAV, SECTION_ORDER, WORKED_EXAMPLE, materialAnchorId } from "@/lib/route2";
import { ArchitecturePortfolio } from "./diagrams/ArchitecturePortfolio";
import { CriteriaFunnel } from "./diagrams/CriteriaFunnel";
import { GovernanceLab } from "./diagrams/GovernanceLab";
import { HorizonPractice } from "./diagrams/HorizonPractice";

export const MATERIAL_TRACK_ID = "r2-material";

/**
 * The whole teaching block: four micro-cards, D1–D4, about 15 minutes, ending
 * in a read-only worked example on a different company (CircularMind) from
 * the one Task 3 assesses (NovaCircular) — CURRICULUM-GUIDE.md §2.
 */
export function Material() {
  const [d1, d2, d3, d4] = MATERIAL;

  const navItems = SECTION_ORDER.map((id) => ({
    id,
    code: MATERIAL_NAV[id].code,
    label: MATERIAL_NAV[id].label,
    anchorId: materialAnchorId(id),
  }));

  return (
    <div id={MATERIAL_TRACK_ID} className="space-y-8">
      <MiniNav items={navItems} trackId={MATERIAL_TRACK_ID} />

      <SectionHeading kicker={MATERIAL_INTRO.kicker} title={MATERIAL_INTRO.title} intro={MATERIAL_INTRO.intro} more={MATERIAL_INTRO.more} />

      <MicroCard card={d1} total={MATERIAL.length} anchorId={materialAnchorId("architecture")}>
        <ArchitecturePortfolio />
      </MicroCard>

      <MicroCard card={d2} total={MATERIAL.length} anchorId={materialAnchorId("assessmentLogic")}>
        <CriteriaFunnel />
      </MicroCard>

      <MicroCard card={d3} total={MATERIAL.length} anchorId={materialAnchorId("governance")}>
        <GovernanceLab />
      </MicroCard>

      <MicroCard card={d4} total={MATERIAL.length} anchorId={materialAnchorId("horizons")}>
        <HorizonPractice />
      </MicroCard>

      {/* Read-only worked example — visually distinct, a different company from the one Task 3 assesses. */}
      <div className="rounded-2xl bg-slate p-6 text-paper">
        <p className="text-micro font-semibold uppercase tracking-wide text-paper/60">{WORKED_EXAMPLE.heading}</p>
        <h3 className="mt-1 text-h3 text-paper">{WORKED_EXAMPLE.company}</h3>
        <p className="mt-2 max-w-prose text-body text-paper/80">{WORKED_EXAMPLE.intro}</p>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {WORKED_EXAMPLE.findings.map((f) => (
            <li key={f.initiative} className="rounded-xl border border-paper/20 bg-paper/5 p-3">
              <p className="text-caption font-semibold text-paper">{f.initiative}</p>
              <p className="mt-1 text-caption text-paper/80">{f.happened}</p>
              <p className="mt-2 text-micro text-paper/70">
                <span className="font-semibold text-paper">Would have been caught by: {f.criterion}. </span>
                {f.why}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-prose text-body text-paper/80">{WORKED_EXAMPLE.lesson}</p>
        <p className="mt-2 text-micro italic text-paper/60">{WORKED_EXAMPLE.note}</p>
      </div>
    </div>
  );
}
