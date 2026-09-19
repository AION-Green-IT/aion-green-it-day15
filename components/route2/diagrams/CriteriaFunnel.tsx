"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";

/**
 * D2 — the four-criteria funnel. Drop a demo initiative in and see which filter
 * stops it, and why. Switch a criterion off to see what slips through: an
 * initiative that skips one of the four is exactly the "assessed on enthusiasm"
 * pattern. None of these demos is a Task 3 measure or a NovaCircular initiative.
 */

type FilterId = "benefit" | "resource" | "viability" | "controllability";

const FILTERS: { id: FilterId; label: string; asks: string; useWhen: string }[] = [
  { id: "benefit", label: "Benefit", asks: "What net effect is measured, not claimed?", useWhen: "The case rests on a promise of impact that nobody has measured." },
  { id: "resource", label: "Resource / load", asks: "What does it add in compute, energy, data and hardware?", useWhen: "The question is what the initiative costs to run, not what it delivers." },
  { id: "viability", label: "Strategic viability", asks: "Can it run at scale, last, and be run by this organisation?", useWhen: "It works as a pilot and the doubt is scale and staying power." },
  { id: "controllability", label: "Controllability", asks: "Can we steer and change its rules once it runs?", useWhen: "Someone outside the organisation controls the rules, data or updates." },
];

const DEMOS: { id: string; label: string; stoppedBy: FilterId | null; reason: string }[] = [
  { id: "ai", label: "Chatbot with no measured benefit target", stoppedBy: "benefit", reason: "The case says it will \"improve service\", but no effect is measured or even defined." },
  { id: "loop", label: "Device loop that is heavy to set up", stoppedBy: "resource", reason: "Shipping, storage and testing add more load than the first year's reuse saves." },
  { id: "pilot", label: "Promising pilot with no path to scale", stoppedBy: "viability", reason: "It works for one team; nothing shows how the rest of the organisation could run it." },
  { id: "vendor", label: "Third-party platform we cannot audit", stoppedBy: "controllability", reason: "The vendor sets the rules, the updates and the data access; the organisation cannot change any of them." },
  { id: "sound", label: "A measured, scalable, governed proposal", stoppedBy: null, reason: "It names a measured benefit, a counted load, a path to scale and an owner who can steer it." },
];

export function CriteriaFunnel() {
  const [selected, setSelected] = useState(DEMOS[0].id);
  const [off, setOff] = useState<FilterId[]>([]);
  const demo = DEMOS.find((d) => d.id === selected)!;

  const active = FILTERS.filter((f) => !off.includes(f.id));
  const stoppedActive = demo.stoppedBy && active.some((f) => f.id === demo.stoppedBy);
  const stopFilter = FILTERS.find((f) => f.id === demo.stoppedBy) ?? null;
  const stopIndex = stoppedActive ? FILTERS.findIndex((f) => f.id === demo.stoppedBy) : FILTERS.length;

  const toggle = (id: FilterId) => setOff((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const changed = useLastChange(
    `${selected}|${off.join(",")}`,
    (p, n) => {
      const [ps, po] = p.split("|");
      const [ns, no] = n.split("|");
      if (ps !== ns) {
        const d = DEMOS.find((x) => x.id === ns)!;
        return d.stoppedBy ? `New initiative: "${d.label}". It is stopped by ${FILTERS.find((f) => f.id === d.stoppedBy)!.label} — a different filter than the last one, so no single criterion is enough.` : `New initiative: "${d.label}". It passes all four — this is what a prioritised decision looks like.`;
      }
      const before = po ? po.split(",") : [];
      const after = no ? no.split(",") : [];
      const added = after.find((x) => !before.includes(x));
      const removed = before.find((x) => !after.includes(x));
      if (added) {
        const f = FILTERS.find((x) => x.id === added)!;
        return demo.stoppedBy === added
          ? `${f.label} switched off. "${demo.label}" now gets through — assessed on enthusiasm instead. Every one of the four earns its place.`
          : `${f.label} switched off. This initiative is not affected, but another one would be: a framework that skips a criterion is not a framework.`;
      }
      return removed ? `${FILTERS.find((x) => x.id === removed)!.label} switched back on. The filter can stop initiatives of this kind again.` : null;
    },
    "Pick an initiative, then try switching a criterion off.",
  );

  const why = stoppedActive
    ? `Stopped by ${stopFilter!.label}: ${demo.reason}`
    : demo.stoppedBy
      ? `It only looked weak on ${stopFilter!.label}, which is switched off — so it passes. ${demo.reason}`
      : `Passes every active filter. ${demo.reason}`;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">Drop an initiative into the funnel</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {DEMOS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelected(d.id)}
              aria-pressed={selected === d.id}
              className={clsx(
                "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                selected === d.id ? "border-accent bg-accentSoft text-accent" : "border-line text-ash hover:border-ash",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">The four criteria — tap one to switch it off</p>
        <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
          {FILTERS.map((f, i) => {
            const isOff = off.includes(f.id);
            const isStop = i === stopIndex;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.id)}
                aria-pressed={!isOff}
                className={clsx(
                  "rounded-xl border p-2.5 text-left transition-colors duration-150",
                  isOff ? "border-dashed border-line bg-canvas opacity-60" : isStop ? "border-danger/50 bg-danger/5" : "border-line bg-paper hover:border-ash",
                )}
              >
                <p className="text-caption font-semibold text-ink">
                  {f.label} <span className="text-micro font-normal text-ash">{isOff ? "· off" : isStop ? "· stops it" : "· on"}</span>
                </p>
                <p className="text-micro text-ash">Asks: {f.asks}</p>
                <p className="text-micro text-ash">Use it when: {f.useWhen}</p>
              </button>
            );
          })}
        </div>
      </div>

      <LiveReading
        tone={stoppedActive ? "neutral" : "good"}
        numbers={
          <>
            Filters on: {active.length} of 4 · outcome: {stoppedActive ? `stopped by ${stopFilter!.label}` : "gets through"}
          </>
        }
        why={why}
        changed={changed}
      />
      <p className="text-micro text-ash">Novelty and enthusiasm are not among the four filters. If a criterion reduces to how exciting it looks, it fails this card's test.</p>
    </div>
  );
}
