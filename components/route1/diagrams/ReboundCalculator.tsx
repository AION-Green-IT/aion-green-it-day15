"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { NumberSlider } from "@/components/ui/NumberSlider";
import { fmt, fmtDelta } from "@/lib/format";

/**
 * C1 — the rebound calculator. One job that uses 1,000 kWh a year. An efficiency
 * gain cuts what each task uses; usage growth is what people then do because it
 * is cheaper. Total = 1,000 × (1 − gain) × (1 + growth). The saving survives only
 * while usage growth stays below the break-even 1 ÷ (1 − gain) − 1.
 * All numbers are illustrative and derived from the two sliders.
 */

const BASE_KWH = 1000;
const START = { gain: 30, growth: 60 };

const STORIES = [
  { id: "novelty", label: "Novelty-driven", note: "Nobody limits the new usage", gain: 30, growth: 60 },
  { id: "impact", label: "Impact-driven", note: "Usage is capped by design", gain: 30, growth: 10 },
] as const;

const total = (gain: number, growth: number) => BASE_KWH * (1 - gain / 100) * (1 + growth / 100);
const breakEven = (gain: number) => (1 / (1 - gain / 100) - 1) * 100;

export function ReboundCalculator() {
  const [gain, setGain] = useState(START.gain);
  const [growth, setGrowth] = useState(START.growth);

  const after = total(gain, growth);
  const diff = after - BASE_KWH;
  const be = breakEven(gain);
  const rebounds = diff >= 0;

  const changed = useLastChange(
    `${gain}|${growth}`,
    (p, n) => {
      const [pg, pu] = p.split("|").map(Number);
      const [ng, nu] = n.split("|").map(Number);
      const before = total(pg, pu);
      const now = total(ng, nu);
      const move = `Total went from ${fmt(before)} to ${fmt(now)} kWh (${fmtDelta(Math.round(now - before))}).`;
      if (ng !== pg) {
        return `Efficiency gain ${pg}% → ${ng}%. ${move} The break-even usage growth moved from ${fmt(breakEven(pg))}% to ${fmt(breakEven(ng))}%: a bigger gain gives usage more room before the saving is spent.`;
      }
      return `Usage growth ${pu}% → ${nu}%. ${move} The technology did not change — only what people do because it got cheaper. That is the question to ask: not "how efficient is it?" but "what will people do with the saving?"`;
    },
    "Move a slider, or pick a story, to see what the saving does once people react to it.",
  );

  const why = rebounds
    ? `Rebound. Each task uses ${gain}% less, but usage grew ${growth}%, which is above the ${fmt(be)}% break-even for a ${gain}% gain. The saving was spent, and the total is ${fmt(diff)} kWh higher.`
    : `The saving survives. Each task uses ${gain}% less and usage grew ${growth}%, below the ${fmt(be)}% break-even. The total is ${fmt(Math.abs(diff))} kWh lower (${fmt(Math.abs(diff / BASE_KWH) * 100)}%).`;

  const scale = 2000;
  const isStart = gain === START.gain && growth === START.growth;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">Pick a story — it sets the sliders</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {STORIES.map((s) => {
            const on = gain === s.gain && growth === s.growth;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setGain(s.gain);
                  setGrowth(s.growth);
                }}
                aria-pressed={on}
                className={clsx(
                  "rounded-xl border px-3 py-1.5 text-left transition-colors duration-150",
                  on ? "border-accent bg-accentSoft" : "border-line bg-paper hover:border-ash",
                )}
              >
                <span className={clsx("block text-caption font-semibold", on ? "text-accent" : "text-ink")}>{s.label}</span>
                <span className="block text-micro text-ash">{s.note}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-micro text-ash">The story chips do not follow manual slider moves; the reading below always shows the sliders.</p>
      </div>

      <div className="grid gap-x-6 sm:grid-cols-2">
        <NumberSlider
          id="c1-gain"
          label="Efficiency gain per task"
          caption="How much less energy each task needs after the improvement."
          value={gain}
          onChange={setGain}
          min={10}
          max={60}
          step={5}
          unit="%"
          baseline={START.gain}
        />
        <NumberSlider
          id="c1-growth"
          label="Extra usage because it is cheaper"
          caption="How much more the thing gets used once it costs less."
          value={growth}
          onChange={setGrowth}
          min={0}
          max={100}
          step={5}
          unit="%"
          baseline={START.growth}
        />
      </div>

      {/* Before / after, with the baseline drawn as a marker on the after bar */}
      <div className="space-y-2" role="img" aria-label={`Before ${fmt(BASE_KWH)} kWh, after ${fmt(after)} kWh a year`}>
        <div>
          <p className="text-micro text-ash">Before — {fmt(BASE_KWH)} kWh a year</p>
          <div className="mt-0.5 h-5 rounded bg-line" style={{ width: `${(BASE_KWH / scale) * 100}%` }} />
        </div>
        <div>
          <p className="text-micro text-ash">After — {fmt(after)} kWh a year</p>
          <div className="relative mt-0.5 h-5">
            <div
              className={clsx("h-5 rounded", rebounds ? "bg-danger/70" : "bg-accent/80")}
              style={{ width: `${(after / scale) * 100}%`, transition: "width .3s ease" }}
            />
            <div className="absolute inset-y-[-3px] border-l-2 border-dashed border-ink" style={{ left: `${(BASE_KWH / scale) * 100}%` }} title="Baseline" />
          </div>
          <p className="text-micro text-ash">Dashed line = the baseline of {fmt(BASE_KWH)} kWh. Illustrative numbers.</p>
        </div>
      </div>

      <LiveReading
        tone={rebounds ? "bad" : "good"}
        numbers={
          <>
            {fmt(BASE_KWH)} × (1 − {(gain / 100).toFixed(2)}) × (1 + {(growth / 100).toFixed(2)}) = {fmt(after)} kWh
          </>
        }
        why={why}
        changed={changed}
      />

      <button
        type="button"
        onClick={() => {
          setGain(START.gain);
          setGrowth(START.growth);
        }}
        className={clsx(
          "rounded-full border px-3 py-1 text-micro font-semibold transition-colors duration-150",
          isStart ? "border-line text-ash" : "border-accent text-accent hover:bg-accentSoft",
        )}
      >
        Reset to start
      </button>
    </div>
  );
}
