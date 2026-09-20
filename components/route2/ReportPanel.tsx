"use client";

import { useHydrated } from "@/lib/store";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { BLOCKS, CANDIDATE_MEASURES, ENGAGEMENT, EXPORT, FIRST_MEASURE_OPTIONS, HORIZONS, connectionKey } from "@/lib/route2";
import { useRoute2, domId } from "./useRoute2";

/** The date line. Client-only, so the static export stays stable. */
export function useReportDate() {
  const hydrated = useHydrated();
  return hydrated
    ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";
}

/**
 * The NovaCircular Management Proposal, live: the connected canvas rendered
 * compactly, then the seven elements and the horizon split. Every section's
 * Edit button scrolls to and flashes the field it mirrors — the report views
 * the learner's answers, never a second copy of them.
 */
export function ReportPanel() {
  const r2 = useRoute2();
  const date = useReportDate();
  const firstMeasureLabel = r2.firstMeasure ? FIRST_MEASURE_OPTIONS.find((o) => o.id === r2.firstMeasure)!.label : null;

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <p className="text-micro font-semibold uppercase tracking-wide text-accent">{EXPORT.docHeading}</p>
      <p className="mt-1 text-caption text-ash">
        <span className="font-semibold text-ink">{r2.name.trim() || "[your name]"}</span>
        {date ? ` · ${date}` : ""} · Case: {ENGAGEMENT.company}
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-micro font-semibold uppercase tracking-wide text-ash">Decision architecture</p>
            <button
              type="button"
              onClick={() => scrollToAndFlash(domId.canvas, "ref")}
              className="text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi"
            >
              Edit
            </button>
          </div>
          {r2.connections.length === 0 ? (
            <p className="mt-1 text-micro italic text-ash">No connections yet.</p>
          ) : (
            <ul className="mt-1.5 space-y-0.5">
              {r2.connections.map(([a, b]) => (
                <li key={connectionKey(a, b)} className="text-micro text-ink">
                  {BLOCKS.find((x) => x.id === a)!.label} ↔ {BLOCKS.find((x) => x.id === b)!.label}
                </li>
              ))}
            </ul>
          )}
          {r2.orphanedBlocks.length > 0 && (
            <p className="mt-1 text-micro text-danger">{r2.orphanedBlocks.length} block(s) still orphaned.</p>
          )}
          {r2.orphanedBlocks.length === 0 && r2.groups.length > 1 && (
            <p className="mt-1 text-micro text-danger">Blocks form {r2.groups.length} separate groups, not one architecture.</p>
          )}
        </div>

        <Row label="1. Strategic relevance" value={r2.element1} onEdit={() => scrollToAndFlash(domId.element1, "ref")} />

        {r2.guidingDecisions.some((g) => g) && (
          <div>
            <div className="flex items-center justify-between">
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">2. Guiding decisions</p>
              <button type="button" onClick={() => scrollToAndFlash(domId.guiding(0), "ref")} className="text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi">
                Edit
              </button>
            </div>
            {r2.guidingDecisions.every((g) => !g) ? (
              <p className="mt-1 text-micro italic text-ash">Not written yet.</p>
            ) : (
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                {r2.guidingDecisions.map((g, i) => (
                  <li key={i} className="text-micro text-ink">
                    {g || <span className="italic text-ash">—</span>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        <Row label="3. Decision logic" value={r2.element3} onEdit={() => scrollToAndFlash(domId.element3, "ref")} />
        {r2.element4 && <Row label="4. Central trade-offs" value={r2.element4} onEdit={() => scrollToAndFlash(domId.element4, "ref")} />}

        <div>
          <div className="flex items-center justify-between">
            <p className="text-micro font-semibold uppercase tracking-wide text-ash">5. First measure + why</p>
            <button type="button" onClick={() => scrollToAndFlash(domId.firstMeasure, "ref")} className="text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi">
              Edit
            </button>
          </div>
          <p className="mt-1 text-micro text-ink">{firstMeasureLabel ?? <span className="italic text-ash">Not picked yet.</span>}</p>
          {r2.element5Why && <p className="mt-0.5 text-micro italic text-ink">&ldquo;{r2.element5Why}&rdquo;</p>}
        </div>

        {r2.element6 && <Row label="6. Roles & governance" value={r2.element6} onEdit={() => scrollToAndFlash(domId.element6, "ref")} />}
        {r2.element7 && <Row label="7. Decide now" value={r2.element7} onEdit={() => scrollToAndFlash(domId.element7, "ref")} />}

        {CANDIDATE_MEASURES.some((m) => r2.horizons[m.id]) && (
          <div>
            <div className="flex items-center justify-between">
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">Time-horizon split</p>
              <button type="button" onClick={() => scrollToAndFlash(domId.horizonBoard, "ref")} className="text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi">
                Edit
              </button>
            </div>
            <div className="mt-1 space-y-1.5">
              {HORIZONS.map((band) => {
                const inBand = CANDIDATE_MEASURES.filter((m) => r2.horizons[m.id] === band.id);
                return (
                  <div key={band.id} className="rounded-lg border border-line bg-canvas p-1.5">
                    <p className="text-micro font-semibold text-ink">
                      {band.label} · {inBand.length}
                    </p>
                    {inBand.length === 0 ? (
                      <p className="text-[11px] italic text-ash">none</p>
                    ) : (
                      <ul className="list-disc pl-4">
                        {inBand.map((m) => (
                          <li key={m.id} className="text-[11px] text-ink">
                            {m.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!r2.optionalTouched && (
          <p className="border-t border-line pt-3 text-micro italic text-ash">
            Optional extension (elements 2, 4, 6, 7 and the time-horizon classifier) — not started. Open it below the proposal if you want it in your export.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">{label}</p>
        <button type="button" onClick={onEdit} className="text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi">
          Edit
        </button>
      </div>
      {value ? <p className="mt-1 text-micro text-ink">{value}</p> : <p className="mt-1 text-micro italic text-ash">Not written yet.</p>}
    </div>
  );
}
