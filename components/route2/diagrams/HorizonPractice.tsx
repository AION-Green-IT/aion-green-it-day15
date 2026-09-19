"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading } from "@/components/ui/LiveReading";

/**
 * D4 — three time horizons, with a practice case that is NOT NovaCircular and does
 * not reuse Task 3's six candidate measures. The test is what a measure produces:
 * a decision (short-term), a pilot or first loop (medium-term), or a permanent
 * place in how the organisation decides (structural). Pick a band for each practice
 * measure and read what the pick means — consequences, not a verdict.
 */

type Band = "short" | "medium" | "structural";

const BANDS: { id: Band; label: string; produces: string; ask: string }[] = [
  { id: "short", label: "Short-term", produces: "A decision, not a deployment", ask: "Could it be decided and published now, without building anything?" },
  { id: "medium", label: "Medium-term", produces: "A pilot or a first loop under the criteria", ask: "Does it test something in practice, on a limited scale, under the agreed criteria?" },
  { id: "structural", label: "Structural", produces: "A permanent place in how decisions are made", ask: "Does it make the framework stop depending on any one champion?" },
];

const CASE = {
  title: "Practice case — a regional retailer's cloud programme",
  body: "A retailer wants to bring its cloud spending and energy use under control. Put each measure in the band it belongs to.",
};

const MEASURES: { id: string; text: string; band: Band; outcome: Record<Band, string> }[] = [
  {
    id: "p1",
    text: "Agree and publish the criteria for approving new cloud workloads",
    band: "short",
    outcome: {
      short: "This is a decision: the criteria can be agreed and published now, and nothing has to be built. It is the first step everything else depends on.",
      medium: "Nothing needs piloting to agree criteria — it is a decision, and waiting to pilot it delays every later step.",
      structural: "The criteria matter permanently, but publishing them is a first decision. The permanent part comes when reviews keep using them.",
    },
  },
  {
    id: "p2",
    text: "Pilot rightsizing on two workloads under the new criteria",
    band: "medium",
    outcome: {
      short: "A pilot needs the criteria first and real running time, so it cannot be a decision made now — it is a test in practice.",
      medium: "This tests the criteria on a limited scale: a pilot under the agreed logic, which is exactly the medium band.",
      structural: "A two-workload pilot is limited in scope and time. It becomes structural only if its result changes how decisions are made permanently.",
    },
  },
  {
    id: "p3",
    text: "Make cloud cost and energy review a standing item in every quarterly finance review",
    band: "structural",
    outcome: {
      short: "It could be scheduled quickly, but its value is that it lasts — a standing item keeps working after the person who proposed it has moved on.",
      medium: "It is not a limited test; it is meant to run indefinitely, which is what makes it structural.",
      structural: "This gives the framework a permanent place in how the retailer decides, so it stops depending on any one champion.",
    },
  },
  {
    id: "p4",
    text: "Publish a first ranking of the ten most expensive workloads",
    band: "short",
    outcome: {
      short: "This is a first prioritisation — a decision and a piece of transparency, not a deployment. It can be done now with data the retailer already has.",
      medium: "Ranking existing workloads does not need a pilot or new infrastructure; it is a first prioritisation.",
      structural: "A one-off ranking is not permanent. It becomes structural only once it is re-run in every review.",
    },
  },
];

export function HorizonPractice() {
  const [picks, setPicks] = useState<Record<string, Band | null>>({});
  const [openId, setOpenId] = useState(MEASURES[0].id);
  const open = MEASURES.find((m) => m.id === openId)!;
  const pick = picks[openId] ?? null;
  const done = MEASURES.filter((m) => picks[m.id]).length;
  const counts = BANDS.map((b) => MEASURES.filter((m) => picks[m.id] === b.id).length);
  const bandsUsed = counts.filter((c) => c > 0).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        {BANDS.map((b) => (
          <div key={b.id} className="rounded-xl border border-line bg-paper p-3">
            <p className="text-caption font-semibold text-ink">{b.label}</p>
            <p className="text-micro text-ink">{b.produces}</p>
            <p className="mt-0.5 text-micro text-ash">Ask: {b.ask}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-paper p-3">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">{CASE.title}</p>
        <p className="mt-1 text-caption text-ink">{CASE.body}</p>
        <div className="mt-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Practice measures">
          {MEASURES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={openId === m.id}
              onClick={() => setOpenId(m.id)}
              className={clsx(
                "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                openId === m.id ? "border-accent bg-accentSoft text-accent" : picks[m.id] ? "border-accent/40 text-accent" : "border-line text-ash hover:border-ash",
              )}
            >
              Measure {i + 1}
              {picks[m.id] ? " ✓" : ""}
            </button>
          ))}
        </div>
        <p className="mt-2 text-caption font-semibold text-ink">{open.text}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {BANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setPicks((cur) => ({ ...cur, [openId]: b.id }))}
              aria-pressed={pick === b.id}
              className={clsx(
                "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                pick === b.id ? "border-accent bg-accentSoft text-accent" : "border-line bg-paper text-ash hover:border-ash",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {pick ? (
        <LiveReading
          whyLabel="What this pick means"
          numbers={
            <>
              Short {counts[0]} · Medium {counts[1]} · Structural {counts[2]} · {done} of {MEASURES.length} placed
            </>
          }
          why={open.outcome[pick]}
          changed={
            done === MEASURES.length
              ? bandsUsed === 1
                ? "Every measure sits in one band — a warning sign. A proposal needs a first decision, a test in practice and a permanent anchor."
                : `Your measures span ${bandsUsed} bands. A robust proposal covers more than one: the first step can ship now, and the anchor makes it last.`
              : undefined
          }
          changedLabel="Across the case"
          tone="neutral"
        />
      ) : (
        <p className="rounded-xl border border-dashed border-line bg-paper p-3 text-caption text-ash">Pick a band for the measure to read what it means.</p>
      )}
    </div>
  );
}
