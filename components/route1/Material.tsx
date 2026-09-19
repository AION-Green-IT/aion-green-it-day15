"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { MicroCard } from "@/components/ui/MicroCard";
import { MiniNav } from "@/components/ui/MiniNav";
import {
  MATERIAL,
  MATERIAL_INTRO,
  MATERIAL_NAV,
  SECTION_ORDER,
  materialAnchorId,
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

/**
 * The whole teaching block: nine micro-cards, C1–C9, about 22 minutes of
 * reading, continuous before either task (CLAUDE.md §12). Deliberately the
 * light end of the material budget per card — Day 15 puts the learning
 * inside the tasks, so each card is a few sentences, one live diagram, and
 * the rule a task will ask for. C1–C5 feed Task 1; C6–C9 feed Task 2.
 */
export function Material() {
  const [c1, c2, c3, c4, c5, c6, c7, c8, c9] = MATERIAL;

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

      <MicroCard card={c1} total={MATERIAL.length} anchorId={materialAnchorId("novelty")}>
        <ReboundCalculator />
      </MicroCard>

      <MicroCard card={c2} total={MATERIAL.length} anchorId={materialAnchorId("aiLoad")}>
        <AiLoadCalculator />
      </MicroCard>

      <MicroCard card={c3} total={MATERIAL.length} anchorId={materialAnchorId("circular")}>
        <CircularFleet />
      </MicroCard>

      <MicroCard card={c4} total={MATERIAL.length} anchorId={materialAnchorId("lenses")}>
        <LensKey />
      </MicroCard>

      <MicroCard card={c5} total={MATERIAL.length} anchorId={materialAnchorId("viability")}>
        <VerdictRule />
      </MicroCard>

      <MicroCard card={c6} total={MATERIAL.length} anchorId={materialAnchorId("uncertainty")}>
        <WaitingCost />
      </MicroCard>

      <MicroCard card={c7} total={MATERIAL.length} anchorId={materialAnchorId("dimensions")}>
        <PracticeRadar />
      </MicroCard>

      <MicroCard card={c8} total={MATERIAL.length} anchorId={materialAnchorId("enablerVsPoint")}>
        <EnablerReach />
      </MicroCard>

      <MicroCard card={c9} total={MATERIAL.length} anchorId={materialAnchorId("attractiveWeak")}>
        <WeaknessLab />
      </MicroCard>
    </div>
  );
}
