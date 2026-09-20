"use client";

import { useProgress, useHydrated } from "@/lib/store";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LivePanel } from "@/components/ui/LivePanel";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { AnswerKeyNote } from "@/components/ui/AnswerKey";
import { OptionalBlock } from "@/components/ui/OptionalBlock";
import {
  CLOSING_FIELD,
  CONTEXT_CHIPS,
  CONTEXT_CHIPS_L2,
  EXPORT,
  R1,
  TASK2_FRAMING,
  TASK_FRAMING,
  WORK_ASSIGNMENT,
  materialRefs,
} from "@/lib/route1";
import { DiagnosisBoard } from "./DiagnosisBoard";
import { Handover } from "./Handover";
import { PartTwo } from "./PartTwo";
import { ReportPanel } from "./ReportPanel";
import { useRoute1, domId } from "./useRoute1";

/**
 * The core task is one small diagnosis: three initiatives, both questions and a
 * rationale each, then one closing question (~15 minutes, Day 14's standard for a
 * one-task route). Everything else is kept in full but optional and never required
 * for export: the lens, the other three initiatives (inside the board) and Level 2 —
 * the inline handover and the Decide task — behind one button. The core task only
 * asks what the four core cards taught.
 */
export function Task() {
  const r1 = useRoute1();

  return (
    <section id={domId.task} className="scroll-mt-24 space-y-6">
      <SectionHeading kicker="THE TASK" title="FutureGrid Technologies — Diagnose three initiatives" />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          {/* Core — diagnose three initiatives */}
          <div className="space-y-6">
            <SectionHeading
              kicker={`${TASK_FRAMING.tag} · about ${TASK_FRAMING.minutes} minutes`}
              title={TASK_FRAMING.title}
            />

            <div className="rounded-2xl border border-accent/30 bg-accentSoft/60 p-5">
              <p className="text-body font-semibold text-ink">{TASK_FRAMING.lead}</p>
              <p className="mt-2 max-w-prose text-body text-ash">{TASK_FRAMING.instruction}</p>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-5">
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">Where FutureGrid stands today</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CONTEXT_CHIPS.map((chip) => (
                  <span key={chip} className="rounded-full border border-line bg-canvas px-2.5 py-1 text-micro text-ink">
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-canvas p-5">
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">Your work</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                {WORK_ASSIGNMENT.map((step, i) => (
                  <li key={i} className="text-caption text-ink">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <DiagnosisBoard />
            <ClosingQuestion />
          </div>

          {/* Optional — Level 2, Decide */}
          <OptionalBlock id="r1-level-2" title="Level 2, decide which line of measures to prioritise" minutes={TASK2_FRAMING.minutes} hasData={r1.part2Touched}>
            <Handover />

            <div id={domId.partTwo} className="scroll-mt-24 space-y-6">
              <SectionHeading
                kicker={`OPTIONAL · ${TASK2_FRAMING.tag} · about ${TASK2_FRAMING.minutes} minutes`}
                title={TASK2_FRAMING.title}
              />

              <div className="rounded-2xl border border-accent/30 bg-accentSoft/60 p-5">
                <p className="text-body font-semibold text-ink">{TASK2_FRAMING.lead}</p>
                <p className="mt-2 max-w-prose text-body text-ash">{TASK2_FRAMING.instruction}</p>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-5">
                <p className="text-micro font-semibold uppercase tracking-wide text-ash">General conditions</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CONTEXT_CHIPS_L2.map((chip) => (
                    <span key={chip} className="rounded-full border border-line bg-canvas px-2.5 py-1 text-micro text-ink">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <PartTwo />
            </div>
          </OptionalBlock>
        </div>

        <LivePanel
          title={EXPORT.docHeading}
          summary={`Core: ${r1.coreCompleteCount}/${r1.coreCount} written up${r1.part2Touched ? ` · Level 2: ${r1.options.filter((o) => o.fullyScored).length}/3 assessed` : ""}`}
        >
          <ReportPanel />
        </LivePanel>
      </div>
    </section>
  );
}

/** The one free-text question that closes Part 1 — C5's distinction, applied. */
function ClosingQuestion() {
  const hydrated = useHydrated();
  const setNote = useProgress((s) => s.setNote);
  const value = useProgress((s) => s.notes[R1.closing] ?? "");

  return (
    <div id={domId.closing} className="scroll-mt-24 rounded-2xl border border-line bg-paper p-5">
      <label htmlFor="r1-closing-field" className="block text-caption font-semibold text-ink">
        {CLOSING_FIELD.label}
      </label>
      <p className="mt-0.5 text-micro text-ash">{CLOSING_FIELD.instruction}</p>
      <MaterialRefs refs={materialRefs(CLOSING_FIELD.material)} />
      <textarea
        id="r1-closing-field"
        value={hydrated ? value : ""}
        onChange={(e) => setNote(R1.closing, e.target.value)}
        placeholder={CLOSING_FIELD.placeholder}
        rows={3}
        className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
      />
      <AnswerKeyNote
        label="Closing question"
        text={
          "Initiative 6 (the “AI everywhere” pilot) is the intended answer: it looks innovative and is easy to sell internally, but it adds continuous compute with no benefit target behind it — novelty-led, not impact-led (C1, C5). A participant who names initiative 1 has the same technology but the wrong reason: it was proposed on a measured saving, so it is impact-led and lands in Mixed, not Risk. A participant who names initiative 3 is confusing an untested-looking model with a weak one; it is circular and reduces net use, so it lands in Opportunity. If the participant also diagnoses the other three, the optional closing question asks for the pair (initiatives 4 and 6)."
        }
      />
    </div>
  );
}
