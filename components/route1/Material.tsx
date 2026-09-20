"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { MicroCard } from "@/components/ui/MicroCard";
import { MiniNav } from "@/components/ui/MiniNav";
import { OptionalBlock } from "@/components/ui/OptionalBlock";
import {
  CORE_SECTIONS,
  MATERIAL,
  MATERIAL_INTRO,
  MATERIAL_NAV,
  OPTIONAL_SECTIONS,
  materialAnchorId,
  type MaterialSectionId,
} from "@/lib/route1";
import { ReboundCalculator } from "./diagrams/ReboundCalculator";
import { AiLoadCalculator } from "./diagrams/AiLoadCalculator";
import { CircularFleet } from "./diagrams/CircularFleet";
import { LensKey } from "./diagrams/LensKey";
import { VerdictRule } from "./diagrams/VerdictRule";
import { WaitingCost } from "./diagrams/WaitingCost";
import { PracticeRadar } from "./diagrams/PracticeRadar";
import { EnablerReach } from "./diagrams/EnablerReach";
import { WeaknessLab } from "./diagrams/WeaknessLab";

export const MATERIAL_TRACK_ID = "r1-material";

const DIAGRAMS: Record<MaterialSectionId, () => React.ReactNode> = {
  novelty: () => <ReboundCalculator />,
  aiLoad: () => <AiLoadCalculator />,
  circular: () => <CircularFleet />,
  lenses: () => <LensKey />,
  viability: () => <VerdictRule />,
  uncertainty: () => <WaitingCost />,
  dimensions: () => <PracticeRadar />,
  enablerVsPoint: () => <EnablerReach />,
  attractiveWeak: () => <WeaknessLab />,
};

const cardOf = (id: MaterialSectionId) => MATERIAL.find((c) => c.id === id)!;

/**
 * The teaching block. Four core cards, about 60 minutes (Day 14's standard for a
 * one-task route) — exactly the ideas the core task uses: the resource-load
 * question (C2), impact-or-novelty and circular-or-linear (C1, C3), and the verdict
 * rule with tested/untested (C5). The other five cards are kept in full behind one
 * optional button; they back the optional lens step and the optional Level 2 task.
 */
export function Material() {
  const navItems = CORE_SECTIONS.map((id) => ({
    id,
    code: MATERIAL_NAV[id].code,
    label: MATERIAL_NAV[id].label,
    anchorId: materialAnchorId(id),
  }));

  const optionalMinutes = OPTIONAL_SECTIONS.reduce((n, id) => n + cardOf(id).minutes, 0);

  return (
    <div id={MATERIAL_TRACK_ID} className="space-y-8">
      <MiniNav items={navItems} trackId={MATERIAL_TRACK_ID} />

      <SectionHeading kicker={MATERIAL_INTRO.kicker} title={MATERIAL_INTRO.title} intro={MATERIAL_INTRO.intro} more={MATERIAL_INTRO.more} />

      {CORE_SECTIONS.map((id, i) => (
        <MicroCard key={id} card={cardOf(id)} anchorId={materialAnchorId(id)} position={`Core ${i + 1} of ${CORE_SECTIONS.length}`}>
          {DIAGRAMS[id]()}
        </MicroCard>
      ))}

      <OptionalBlock
        id="r1-more-material"
        title={MATERIAL_INTRO.optionalTitle}
        minutes={optionalMinutes}
        opensFor={OPTIONAL_SECTIONS.map(materialAnchorId)}
      >
        {OPTIONAL_SECTIONS.map((id, i) => (
          <MicroCard key={id} card={cardOf(id)} anchorId={materialAnchorId(id)} position={`Optional ${i + 1} of ${OPTIONAL_SECTIONS.length}`}>
            {DIAGRAMS[id]()}
          </MicroCard>
        ))}
      </OptionalBlock>
    </div>
  );
}
