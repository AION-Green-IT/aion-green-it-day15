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

        <Row label="3. Decision logic" value={r2.element3} onEdit={() => scrollToAndFlash(domId.element3, "ref")} />

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

        {r2.optionalTouched && (
          <p className="border-t border-line pt-3 text-micro italic text-ash">
            Also saved and included in the PDF: {[
              r2.guidingDecisions.some((g) => g) ? "the guiding decisions" : null,
              r2.element4 ? "the trade-offs" : null,
              r2.element6 ? "roles and governance" : null,
              r2.element7 ? "the decision to take now" : null,
              CANDIDATE_MEASURES.some((m) => r2.horizons[m.id]) ? "the time-horizon split" : null,
            ]
              .filter(Boolean)
              .join(", ")}.
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
