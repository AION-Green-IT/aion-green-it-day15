"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { NumberSlider } from "@/components/ui/NumberSlider";
import { fmt, fmtDelta } from "@/lib/format";

/**
 * C2 — AI benefit against AI load. Two sliders, both in kWh a year (illustrative):
 * the energy the application saves, and the compute it burns to do so. The reading
 * names which of Task 1's three answers the numbers support:
 *   load ≤ 25% of the saving  → "Reduces net resource use"
 *   load > 100% of the saving → "Adds compute / data load"
 *   in between                → "Both — genuinely unclear" (two material effects)
 * The 25% line is a teaching rule of thumb, not a standard.
 */

const START = { saved: 60, load: 30 };
const MATERIAL_SHARE = 0.25;

type Reading = "reduces" | "both" | "adds";

function read(saved: number, load: number): Reading {
  if (load <= saved * MATERIAL_SHARE) return "reduces";
  if (load > saved) return "adds";
  return "both";
}

const LABEL: Record<Reading, string> = {
  reduces: "Reduces net resource use",
  both: "Both — genuinely unclear",
  adds: "Adds compute / data load",
};

const BENEFIT_ITEMS = ["Load optimisation", "Energy management", "Predictive maintenance", "Decision support"];
const COST_ITEMS = ["Training energy", "Continuous inference", "Data pipeline", "Infrastructure"];

export function AiLoadCalculator() {
  const [saved, setSaved] = useState(START.saved);
  const [load, setLoad] = useState(START.load);

  const net = saved - load;
  const r = read(saved, load);
  const share = saved > 0 ? (load / saved) * 100 : 0;
  // Capped at 14° so the lower pan never swings through the ground line.
  const tilt = Math.max(-14, Math.min(14, ((load - saved) / 100) * 40));

  const changed = useLastChange(
    `${saved}|${load}`,
    (p, n) => {
      const [ps, pl] = p.split("|").map(Number);
      const [ns, nl] = n.split("|").map(Number);
      const before = read(ps, pl);
      const now = read(ns, nl);
      const moved = `Net went from ${fmtDelta(ps - pl)} to ${fmtDelta(ns - nl)} MWh.`;
      const verdict = before === now ? `The reading stays "${LABEL[now]}".` : `The reading moved from "${LABEL[before]}" to "${LABEL[now]}".`;
      const thinking =
        ns !== ps
          ? "A bigger promised saving only helps if it is measured — a benefit with no named load is still an unexamined claim."
          : "Continuous inference is what moves this number in daily operation, not the one-off training run.";
      return `${ns !== ps ? `Saving ${ps} → ${ns} MWh.` : `Load ${pl} → ${nl} MWh.`} ${moved} ${verdict} ${thinking}`;
    },
    "Move a slider to weigh the benefit against the load it needs.",
  );

  const why =
    r === "reduces"
      ? `The load is only ${fmt(share)}% of the saving, so the benefit dominates and the net effect is a real reduction of ${fmt(net)} MWh.`
      : r === "adds"
        ? `The load (${fmt(load)} MWh) is larger than the saving (${fmt(saved)} MWh), so the net effect is ${fmt(Math.abs(net))} MWh more resource use — consumption with a story attached.`
        : `The load is ${fmt(share)}% of the saving: not small enough to ignore, not large enough to cancel it. Two material effects at once — that is what "both" means, and the net is ${fmt(net)} MWh.`;

  return (
    <div className="space-y-4">
      <svg
        viewBox="0 0 320 150"
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto h-auto w-full max-w-sm"
        role="img"
        aria-label={`A balance weighing AI benefit of ${saved} MWh against resource cost of ${load} MWh.`}
      >
        <polygon points="140,128 180,128 160,46" className="fill-mist stroke-ash" strokeWidth="1.2" />
        <line x1="112" y1="128" x2="208" y2="128" stroke="currentColor" className="text-ash" strokeWidth="2.5" strokeLinecap="round" />
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "160px 44px", transition: "transform .35s ease" }}>
          <line x1="50" y1="44" x2="270" y2="44" stroke="currentColor" className="text-ink" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="44" x2="50" y2="70" stroke="currentColor" className="text-accent" strokeWidth="1.5" />
          <line x1="270" y1="44" x2="270" y2="70" stroke="currentColor" className="text-danger" strokeWidth="1.5" />
          <rect x="10" y="70" width="80" height="28" rx="8" className="fill-accentSoft stroke-accent" strokeWidth="1.5" />
          <text x="50" y="89" textAnchor="middle" className="fill-accent text-[12px] font-semibold">
            Benefit
          </text>
          <rect x="222" y="70" width="96" height="28" rx="8" className="fill-danger/10 stroke-danger" strokeWidth="1.5" />
          <text x="270" y="89" textAnchor="middle" className="fill-danger text-[12px] font-semibold">
            Resource cost
          </text>
        </g>
      </svg>

      <div className="grid gap-x-6 sm:grid-cols-2">
        <NumberSlider
          id="c2-saved"
          label="Energy the AI saves"
          caption="Measured saving in the operation it optimises, in MWh a year (illustrative)."
          value={saved}
          onChange={setSaved}
          min={20}
          max={100}
          step={10}
          unit=" MWh"
          baseline={START.saved}
        />
        <NumberSlider
          id="c2-load"
          label="Compute the AI burns"
          caption="Inference running every day plus its data pipeline and infrastructure, in MWh a year."
          value={load}
          onChange={setLoad}
          min={0}
          max={120}
          step={10}
          unit=" MWh"
          baseline={START.load}
        />
      </div>

      <LiveReading
        tone={r === "reduces" ? "good" : r === "adds" ? "bad" : "neutral"}
        numbers={
          <>
            {fmt(saved)} − {fmt(load)} = {fmtDelta(net)} MWh net a year · Task 1 answer this supports: “{LABEL[r]}”
          </>
        }
        why={why}
        changed={changed}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-accent/30 bg-accentSoft/50 p-3">
          <p className="text-micro font-semibold uppercase tracking-wide text-accent">On the benefit side</p>
          <ul className="mt-1.5 space-y-0.5">
            {BENEFIT_ITEMS.map((b) => (
              <li key={b} className="text-caption text-ink">
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-3">
          <p className="text-micro font-semibold uppercase tracking-wide text-danger">On the resource side</p>
          <ul className="mt-1.5 space-y-0.5">
            {COST_ITEMS.map((c) => (
              <li key={c} className="text-caption text-ink">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-micro text-ash">
        The 25% line is a teaching rule of thumb for “small enough to ignore”, not a standard. Scale check — data-centre electricity: about 460 TWh in 2022,
        potentially approaching 1,000 TWh by 2026 (IEA).
      </p>

      <button
        type="button"
        onClick={() => {
          setSaved(START.saved);
          setLoad(START.load);
        }}
        className={clsx(
          "rounded-full border px-3 py-1 text-micro font-semibold transition-colors duration-150",
          saved === START.saved && load === START.load ? "border-line text-ash" : "border-accent text-accent hover:bg-accentSoft",
        )}
      >
        Reset to start
      </button>
    </div>
  );
}
