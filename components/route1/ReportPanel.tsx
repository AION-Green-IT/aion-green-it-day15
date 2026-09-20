"use client";

import clsx from "clsx";
import { useHydrated } from "@/lib/store";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { ENGAGEMENT, EXPORT, OPTION_LINES, ZONES, answerLabel, lensLabel, optionById } from "@/lib/route1";
import { useRoute1, domId } from "./useRoute1";

/** The date line. Client-only, so the static export stays stable. */
export function useReportDate() {
  const hydrated = useHydrated();
  return hydrated
    ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";
}

/**
 * The FutureGrid Innovation Diagnosis, live: every initiative grouped under
 * the zone its own two answers resolved it into, so the report reads as a
 * verdict document rather than a log of clicks. Every entry's Edit button
 * scrolls to and flashes that card — the report views the learner's answers,
 * never a second copy of them.
 */
export function ReportPanel() {
  const r1 = useRoute1();
  const date = useReportDate();

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <p className="text-micro font-semibold uppercase tracking-wide text-accent">{EXPORT.docHeading}</p>
      <p className="mt-1 text-caption text-ash">
        <span className="font-semibold text-ink">{r1.name.trim() || "[your name]"}</span>
        {date ? ` · ${date}` : ""} · Case: {ENGAGEMENT.company}
      </p>

      <div className="mt-4 space-y-4">
        <p className="text-micro font-semibold uppercase tracking-wide text-accent">Part 1 — Diagnose</p>
        {ZONES.map((zone) => {
          const inZone = r1.byZone(zone.id);
          return (
            <div key={zone.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">
                {zone.name} — {inZone.length}
              </p>
              {inZone.length === 0 ? (
                <p className="mt-1 text-micro italic text-ash">Nothing here yet.</p>
              ) : (
                <ul className="mt-1.5 space-y-2">
                  {inZone.map((c) => (
                    <li key={c.initiative.id} className="rounded-lg border border-line bg-canvas p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-caption font-semibold text-ink">
                          {c.initiative.n}. {c.initiative.short}
                          {!c.core && <span className="ml-1.5 text-micro font-normal text-ash">(optional)</span>}
                        </p>
                        <span
                          className={clsx(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-micro font-semibold",
                            c.complete ? "bg-accentSoft text-accent" : "border border-line text-ash",
                          )}
                        >
                          {c.complete ? "filed" : "in progress"}
                        </span>
                      </div>
                      <dl className="mt-1 space-y-0.5 text-micro">
                        <Row label="Load" value={answerLabel(c.load)} />
                        <Row label="Structure" value={answerLabel(c.structure)} />
                        <Row label="Lens" value={lensLabel(c.lens)} />
                        {c.rationale && (
                          <div className="pt-0.5">
                            <dt className="text-ash">Rationale</dt>
                            <dd className="mt-0.5 italic text-ink">&ldquo;{c.rationale}&rdquo;</dd>
                          </div>
                        )}
                      </dl>
                      <button
                        type="button"
                        onClick={() => scrollToAndFlash(domId.init(c.initiative.id), "ref")}
                        className="mt-1.5 text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi"
                      >
                        Edit this entry
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        <div className="border-t border-line pt-3">
          <p className="text-micro font-semibold uppercase tracking-wide text-ash">
            Attractive now, structurally weak
          </p>
          {r1.closing ? (
            <p className="mt-1 text-caption italic text-ink">&ldquo;{r1.closing}&rdquo;</p>
          ) : (
            <p className="mt-1 text-micro italic text-ash">Not answered yet.</p>
          )}
        </div>

        {r1.closingAll && (
          <div className="border-t border-line pt-3">
            <p className="text-micro font-semibold uppercase tracking-wide text-ash">Across all six (optional)</p>
            <p className="mt-1 text-caption italic text-ink">&ldquo;{r1.closingAll}&rdquo;</p>
          </div>
        )}

        {r1.part2Touched ? (
          <>
        <p className="border-t border-line pt-3 text-micro font-semibold uppercase tracking-wide text-accent">
          Part 2 — Decide (optional)
        </p>

        {OPTION_LINES.map((opt) => {
          const a = r1.optionAssessment(opt.id);
          return (
            <div key={opt.id} className="rounded-lg border border-line bg-canvas p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-caption font-semibold text-ink">
                  Line {opt.letter} — {opt.title}
                </p>
                <span
                  className={clsx(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-micro font-semibold",
                    a.fullyScored ? "bg-accentSoft text-accent" : "border border-line text-ash",
                  )}
                >
                  {a.scoredCount}/7 rated
                </span>
              </div>
              <button
                type="button"
                onClick={() => scrollToAndFlash(domId.optionCard(opt.id), "ref")}
                className="mt-1.5 text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi"
              >
                Edit this entry
              </button>
            </div>
          );
        })}

        <div className="rounded-lg border border-line bg-canvas p-2.5">
          <Row label="Priority" value={r1.priority ? `Line ${optionById(r1.priority).letter} — ${optionById(r1.priority).title}` : "— not picked"} />
          {r1.justification && (
            <div className="mt-1 pt-0.5">
              <dt className="text-micro text-ash">Justification</dt>
              <dd className="mt-0.5 text-micro italic text-ink">&ldquo;{r1.justification}&rdquo;</dd>
            </div>
          )}
          <button
            type="button"
            onClick={() => scrollToAndFlash(domId.priority, "ref")}
            className="mt-1.5 text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi"
          >
            Edit this entry
          </button>
        </div>
          </>
        ) : (
          <p className="border-t border-line pt-3 text-micro italic text-ash">Optional Level 2 (Decide) — not started. Open it below the task if you want it in your export.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 text-ash">{label}</dt>
      <dd className="min-w-0 flex-1 text-ink">{value}</dd>
    </div>
  );
}
