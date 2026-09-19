"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { NumberSlider } from "@/components/ui/NumberSlider";

/**
 * D1 — scattered or routed. N initiatives, each sensible on its own. Scattered:
 * each has its own sponsor and its own justification, and nothing compares one
 * against another. Routed: every one passes the same four criteria, so any two can
 * be compared. With N initiatives there are N × (N − 1) ÷ 2 pairs to compare.
 * The numbers are counts of things, not scores.
 */

const START = 5;

export function ArchitecturePortfolio() {
  const [routed, setRouted] = useState(false);
  const [n, setN] = useState(START);

  const pairs = (n * (n - 1)) / 2;
  const comparable = routed ? pairs : 0;
  const justifications = routed ? 1 : n;

  const changed = useLastChange(
    `${routed}|${n}`,
    (p, q) => {
      const [pr, pn] = p.split("|");
      const [qr, qn] = q.split("|");
      if (pr !== qr) {
        return qr === "true"
          ? `Routed through one framework: ${n} separate justifications became 1 shared logic, and comparable pairs went from 0 to ${pairs}. The shift: from "is this idea good?" to "how does it compare with the others, on the same terms?"`
          : `Scattered again: comparable pairs fell from ${pairs} to 0. Each initiative is defended on its own merits by its own sponsor, so nothing decides between them.`;
      }
      return `Initiatives ${pn} → ${qn}. Pairs to compare: ${(Number(pn) * (Number(pn) - 1)) / 2} → ${pairs}. The number of pairs grows faster than the number of initiatives — the more there are, the more a shared logic is worth.`;
    },
    "Switch between scattered and routed, or change how many initiatives there are.",
  );

  const why = routed
    ? `All ${n} initiatives pass the same four criteria, so any two of the ${pairs} pairs can be compared on the same terms. This is one coherent portfolio, not ${n} separate bets.`
    : `${n} sensible initiatives, ${n} sponsors, ${n} justifications — and 0 of the ${pairs} possible pairs are ever compared. Symbolic politics and rebound at portfolio scale start here.`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setRouted(v)}
            aria-pressed={routed === v}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-caption font-semibold transition-colors duration-150",
              routed === v ? "border-accent bg-accentSoft text-accent" : "border-line bg-paper text-ash hover:border-ash",
            )}
          >
            {v ? "Routed through one framework" : "Scattered initiatives"}
          </button>
        ))}
      </div>

      <NumberSlider
        id="d1-count"
        label="How many initiatives are in the portfolio?"
        caption="AI pilots, take-back schemes, new offerings — anything that would compete for the same budget."
        value={n}
        onChange={setN}
        min={3}
        max={8}
        step={1}
        baseline={START}
      />

      <div className={clsx("rounded-2xl border p-3", routed ? "border-accent/40 bg-accentSoft/40" : "border-line bg-paper")}>
        {routed && (
          <p className="reveal-in mb-2 rounded-lg border border-accent bg-accentSoft px-3 py-1.5 text-center text-caption font-semibold text-accent">
            Assessment framework — benefit · resource/load · strategic viability · controllability
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2" role="img" aria-label={`${n} initiatives, ${routed ? "all routed through one framework" : "each on its own"}`}>
          {Array.from({ length: n }, (_, i) => (
            <div
              key={i}
              className={clsx(
                "w-20 rounded-lg border px-2 py-1.5 text-center transition-all duration-300",
                routed ? "border-accent bg-paper" : "border-ash bg-mist",
                !routed && i % 2 === 1 && "translate-y-2",
              )}
            >
              <p className="text-micro font-semibold text-ink">Initiative {i + 1}</p>
              <p className="text-[10px] text-ash">{routed ? "shared logic" : `sponsor ${i + 1}`}</p>
            </div>
          ))}
        </div>
      </div>

      <LiveReading
        tone={routed ? "good" : "bad"}
        numbers={
          <>
            {n} × ({n} − 1) ÷ 2 = {pairs} pairs · comparable now: {comparable} · separate justifications: {justifications}
          </>
        }
        why={why}
        changed={changed}
      />
    </div>
  );
}
