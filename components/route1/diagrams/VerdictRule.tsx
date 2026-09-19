"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { ZONES, resolveZone, STRUCTURE_STRENGTH, zoneById, zoneReason, type LoadAnswer, type StructureAnswer, type ZoneId } from "@/lib/route1";

/**
 * C5 — the verdict rule, playable. Signal 1 is the net resource effect; signal 2
 * is the structure behind it (one of six answers, each on the right or wrong
 * side). The table shows all six combinations at once and lights the one you
 * are on; the reading says which zone it gives and why, from Task 1's own
 * `resolveZone` — never a second copy of the rule.
 * Below: four claims that turn into the question that tests them.
 */

const LOAD_OPTIONS: { id: LoadAnswer; label: string }[] = [
  { id: "reduces", label: "Reduces net resource use" },
  { id: "both", label: "Both — genuinely unclear" },
  { id: "adds", label: "Adds compute / data load" },
];

const STRUCTURE_OPTIONS: { id: StructureAnswer; label: string }[] = [
  { id: "circular", label: "Circular" },
  { id: "impact", label: "Impact-led" },
  { id: "tested", label: "Tested" },
  { id: "linear", label: "Linear" },
  { id: "novelty", label: "Novelty-led" },
  { id: "untested", label: "Untested" },
];

const LOAD_LABEL = Object.fromEntries(LOAD_OPTIONS.map((o) => [o.id, o.label])) as Record<LoadAnswer, string>;
const STRUCT_LABEL = Object.fromEntries(STRUCTURE_OPTIONS.map((o) => [o.id, o.label])) as Record<StructureAnswer, string>;

const SHORT: Record<ZoneId, string> = { opportunity: "Opportunity", mixed: "Mixed", risk: "Risk" };
const TONE: Record<ZoneId, string> = {
  opportunity: "border-accent/40 bg-accentSoft text-accent",
  mixed: "border-line bg-mist text-ink",
  risk: "border-danger/40 bg-danger/5 text-danger",
};

const CLAIM_CARDS = [
  { id: "ai", front: "“It is AI-powered.”", back: "What does it consume to deliver that, and what does it measurably reduce?" },
  { id: "everyone", front: "“Everyone in the sector is doing it.”", back: "Who has measured a net effect, and under what conditions did it hold?" },
  { id: "report", front: "“It will look excellent in the annual report.”", back: "What survives after the reporting cycle ends and attention moves on?" },
  { id: "quarter", front: "“We could start next quarter.”", back: "Could we still be running it in three years — do we have the people and the process?" },
];

export function VerdictRule() {
  const [load, setLoad] = useState<LoadAnswer>("reduces");
  const [structure, setStructure] = useState<StructureAnswer>("circular");
  const [flipped, setFlipped] = useState<string[]>([]);
  const toggle = (id: string) => setFlipped((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const zone = resolveZone(load, structure);
  const strong = STRUCTURE_STRENGTH[structure] === "strong";

  const changed = useLastChange(
    `${load}|${structure}`,
    (p, n) => {
      const [pl, ps] = p.split("|") as [LoadAnswer, StructureAnswer];
      const [nl, ns] = n.split("|") as [LoadAnswer, StructureAnswer];
      const before = resolveZone(pl, ps);
      const now = resolveZone(nl, ns);
      const what = nl !== pl ? `Signal 1: ${LOAD_LABEL[pl]} → ${LOAD_LABEL[nl]}.` : `Signal 2: ${STRUCT_LABEL[ps]} → ${STRUCT_LABEL[ns]}.`;
      const result = before === now ? `The zone stays ${SHORT[now]}.` : `The zone moved from ${SHORT[before]} to ${SHORT[now]}.`;
      return `${what} ${result} ${nl !== pl ? "One signal is not enough: the verdict always needs both." : "Same effect, different structure — the structure is what separates a sound case from an attractive one."}`;
    },
    "Choose a signal 1 and a signal 2 to see which zone the pair gives.",
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="text-caption font-semibold text-ink">Signal 1 — the net resource effect</legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {LOAD_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setLoad(o.id)}
                aria-pressed={load === o.id}
                className={clsx(
                  "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                  load === o.id ? "border-accent bg-accentSoft text-accent" : "border-line bg-paper text-ash hover:border-ash",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-caption font-semibold text-ink">Signal 2 — the structure behind it</legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {STRUCTURE_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setStructure(o.id)}
                aria-pressed={structure === o.id}
                className={clsx(
                  "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                  structure === o.id ? "border-accent bg-accentSoft text-accent" : "border-line bg-paper text-ash hover:border-ash",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-micro text-ash">First three are the right side (circular, impact-led, tested); last three the wrong side.</p>
        </fieldset>
      </div>

      {/* All six combinations, the current one lit */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] border-separate border-spacing-1.5 text-center text-micro">
          <caption className="sr-only">Zone for every combination of signal 1 and signal 2</caption>
          <thead>
            <tr>
              <th />
              <th className="font-semibold text-ash">Structure right side</th>
              <th className="font-semibold text-ash">Structure wrong side</th>
            </tr>
          </thead>
          <tbody>
            {LOAD_OPTIONS.map((row) => (
              <tr key={row.id}>
                <th className="text-left font-semibold text-ash">{row.label}</th>
                {[true, false].map((isStrong) => {
                  const z = resolveZone(row.id, isStrong ? "circular" : "linear");
                  const here = load === row.id && strong === isStrong;
                  return (
                    <td key={String(isStrong)} className={clsx("rounded-lg border px-2 py-2 font-semibold", TONE[z], here && "ring-2 ring-ink/60")}>
                      {SHORT[z]}
                      {here ? " ◂ you are here" : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LiveReading
        tone={zone === "opportunity" ? "good" : zone === "risk" ? "bad" : "neutral"}
        numbers={
          <>
            {LOAD_LABEL[load]} + {STRUCT_LABEL[structure]} = {zoneById(zone).name}
          </>
        }
        why={zoneReason(load, structure, zone)}
        changed={changed}
      />
      <p className="text-micro text-ash">
        The three zones: {ZONES.map((z) => z.name).join(" · ")}.
      </p>

      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">Tap a claim to turn it into the question that tests it</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {CLAIM_CARDS.map((c) => {
            const isFlipped = flipped.includes(c.id);
            return (
              <button key={c.id} type="button" onClick={() => toggle(c.id)} aria-pressed={isFlipped} className="flip-card h-24 text-left">
                <div className={clsx("flip-card-inner h-full w-full", isFlipped && "is-flipped")}>
                  <div className="flip-card-face flex h-full w-full items-center rounded-xl border border-line bg-paper p-3">
                    <p className="text-caption font-semibold italic text-ink">{c.front}</p>
                  </div>
                  <div className="flip-card-face flip-card-face-back flex h-full w-full items-center rounded-xl border border-accent/40 bg-accentSoft p-3">
                    <p className="text-caption text-ink">{c.back}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
