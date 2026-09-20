"use client";

import { useProgress } from "@/lib/store";
import { MentorFillButton } from "@/components/ui/MentorFillButton";
import { AnswerKeyButton } from "@/components/ui/AnswerKeyButton";
import {
  DIMENSIONS,
  FOLLOWUP_FIELDS,
  INITIATIVES,
  LENSES,
  OPTION_LINES,
  R1,
  RISK_FIELDS,
  SAMPLE_FOLLOWUPS,
  SAMPLE_JUSTIFICATION,
  SAMPLE_PRIORITY,
  SAMPLE_RISKS,
  SAMPLE_SCORES,
} from "@/lib/route1";

/**
 * The route's mentor bar: one demo auto-fill plus the answer keys, both behind
 * the shared passcode (CLAUDE.md §7). Deliberately visually minor — a
 * convenience gate against accidental clicks, not a security boundary.
 *
 * One fill, everything across both parts: Part 1's diagnostic answers, lens,
 * rationale and closing question, plus Part 2's seven-dimension scores for
 * all three lines, the priority pick, justification, follow-ups and risks —
 * so a mentor can demo the finished export in one click. Every sample comes
 * from lib/route1/task1.ts and task2.ts rather than a second copy that could
 * drift from the answer keys.
 */
export function MentorTools() {
  const setNote = useProgress((s) => s.setNote);
  const choose = useProgress((s) => s.choose);
  const markSeen = useProgress((s) => s.markSeen);

  const fill = () => {
    setNote(R1.name, "Muchson");

    for (const initiative of INITIATIVES) {
      choose(R1.load(initiative.id), initiative.expectedLoad);
      choose(R1.structure(initiative.id), initiative.expectedStructure);
      choose(R1.lens(initiative.id), initiative.acceptedLenses[0]);
      setNote(R1.rationale(initiative.id), initiative.sampleRationale);
    }

    setNote(
      R1.closing,
      "Initiative 6, the “AI everywhere” pilot. It looks innovative and is easy to sell internally, but it adds continuous compute with no benefit target anywhere behind it — novelty-led, not impact-led.",
    );

    setNote(
      R1.closingAll,
      "Initiatives 4 and 6 — the device refresh and the “AI everywhere” pilot. Both are easy to sell internally and neither carries a measured net effect.",
    );

    for (const lens of LENSES) markSeen(R1.lensesSeen, lens.id);

    for (const option of OPTION_LINES) {
      for (const dim of DIMENSIONS) {
        choose(R1.score(option.id, dim.id), SAMPLE_SCORES[option.id][dim.id]);
      }
    }
    choose(R1.priority, SAMPLE_PRIORITY);
    setNote(R1.justification, SAMPLE_JUSTIFICATION);
    FOLLOWUP_FIELDS.forEach((f, i) => setNote(R1.followUp(i), SAMPLE_FOLLOWUPS[i]));
    RISK_FIELDS.forEach((r, i) => setNote(R1.risk(i), SAMPLE_RISKS[i]));
    for (const dim of DIMENSIONS) markSeen(R1.dimensionsSeen, dim.id);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
      <MentorFillButton onFill={fill} />
      <AnswerKeyButton />
    </div>
  );
}
