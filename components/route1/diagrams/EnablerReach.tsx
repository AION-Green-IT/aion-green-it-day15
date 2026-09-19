"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { NumberSlider } from "@/components/ui/NumberSlider";

/**
 * C8 — how many decisions a measure reaches. A point solution settles the one
 * decision it was built for. An enabler is inherited by every later decision, so
 * it reaches 1 + n, where n is the number of later initiatives. The trade is
 * visibility: on day one a point solution has something to show and an enabler
 * does not. These are counts of decisions, not euros or points.
 */

const START = 3;
const MAX = 8;

function Row({ label, lit, total, tone }: { label: string; lit: number; total: number; tone: "ash" | "accent" }) {
  return (
    <div>
      <p className="text-micro text-ash">
        {label} — reaches {lit} decision{lit === 1 ? "" : "s"}
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5" role="img" aria-label={`${label} reaches ${lit} of ${total} decisions`}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={clsx(
              "h-6 w-6 rounded-md border text-center text-micro font-semibold leading-6 transition-colors duration-200",
              i < lit ? (tone === "accent" ? "border-accent bg-accentSoft text-accent" : "border-ash bg-mist text-ink") : "border-line bg-paper text-line",
            )}
          >
            {i === 0 ? "1" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export function EnablerReach() {
  const [later, setLater] = useState(START);
  const total = 1 + MAX;
  const point = 1;
  const enabler = 1 + later;

  const changed = useLastChange(
    String(later),
    (p, n) => {
      const pl = Number(p);
      const nl = Number(n);
      return `Later initiatives ${pl} → ${nl}. The point solution still reaches ${point}; the enabler now reaches ${1 + nl} (${nl > pl ? "+" : "−"}${Math.abs(nl - pl)}). ${nl > pl ? "Each new initiative inherits the logic for free — the payoff compounds where the point solution's does not." : "Fewer later decisions means less to inherit, so the enabler's advantage shrinks."}`;
    },
    "Move the slider to change how many later initiatives come after.",
  );

  const why =
    later === 0
      ? "With no later initiatives, an enabler reaches the same one decision as a point solution — and has less to show on day one. The case for it depends on more decisions coming."
      : `An enabler reaches ${enabler} decisions against ${point}: its own, plus the ${later} later one${later === 1 ? "" : "s"} that inherit the same criteria. The cost is visibility: on day one there is nothing dramatic to show management.`;

  return (
    <div className="space-y-4">
      <NumberSlider
        id="c8-later"
        label="Later initiatives that come after"
        caption="How many future decisions the organisation will still make in this area."
        value={later}
        onChange={setLater}
        min={0}
        max={MAX}
        step={1}
        baseline={START}
      />

      <div className="space-y-3">
        <Row label="Point solution" lit={point} total={total} tone="ash" />
        <Row label="Enabler" lit={enabler} total={total} tone="accent" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-paper p-3">
          <p className="text-micro font-semibold uppercase tracking-wide text-ash">Day one — point solution</p>
          <p className="mt-0.5 text-caption text-ink">A visible result to show, easy to evaluate on its own.</p>
        </div>
        <div className="rounded-xl border border-line bg-paper p-3">
          <p className="text-micro font-semibold uppercase tracking-wide text-ash">Day one — enabler</p>
          <p className="mt-0.5 text-caption text-ink">Little to show yet. Its payoff arrives with each later decision.</p>
        </div>
      </div>

      <LiveReading tone={later > 0 ? "good" : "neutral"} numbers={<>Point solution: 1 · Enabler: 1 + {later} = {enabler} decisions reached</>} why={why} changed={changed} />
    </div>
  );
}
