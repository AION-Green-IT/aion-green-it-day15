"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress, useHydrated } from "@/lib/store";
import { RadarChart, type RadarAxis } from "@/components/ui/RadarChart";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { DIMENSIONS, LEVEL_LABEL, LEVEL_VALUE, R1, type DimensionId, type Level } from "@/lib/route1";

/**
 * C7 — a practice scorer. A practice case that is NOT one of Task 2's three
 * lines starts on a sensible baseline, with one reason per axis. Change any level
 * and read: what that level means on this axis, the claim you are now making, the
 * strength points before and after, and what shape the profile has.
 * Six axes read "higher is stronger"; Risk reads in reverse, so its strength is
 * 4 − score. Nothing here reveals a Task 2 cell.
 */

const AXES: RadarAxis[] = DIMENSIONS.map((d) => ({ key: d.id, label: d.short, full: d.name }));

const CASE = {
  title: "Practice case — a cloud-cost dashboard",
  body: "A regional retailer wants one dashboard that shows every team what its cloud spend and energy use are, week by week, and flags the biggest movers.",
};

const BASELINE: Record<DimensionId, { level: Level; reason: string }> = {
  leverage: { level: "medium", reason: "Several teams change how they work, but decisions elsewhere are unaffected." },
  innovation: { level: "low", reason: "Cost dashboards exist already; this mostly repackages data the retailer has." },
  sustainability: { level: "medium", reason: "Visible usage usually trims waste, but nothing is measured yet." },
  feasibility: { level: "high", reason: "The data already exists and the tooling is off the shelf." },
  risk: { level: "low", reason: "If it fails, the retailer loses some effort, not money or reputation." },
  longTerm: { level: "medium", reason: "It holds while someone owns it; dashboards nobody owns go stale." },
  controllability: { level: "high", reason: "The retailer builds and configures it itself." },
};

const toValues = (m: Record<DimensionId, Level>): Record<string, number> => Object.fromEntries(DIMENSIONS.map((d) => [d.id, LEVEL_VALUE[m[d.id]]]));
const strengthOf = (id: DimensionId, level: Level) => (id === "risk" ? 4 - LEVEL_VALUE[level] : LEVEL_VALUE[level]);
const baseLevels = Object.fromEntries(DIMENSIONS.map((d) => [d.id, BASELINE[d.id].level])) as Record<DimensionId, Level>;
const LEVELS: Level[] = ["low", "medium", "high"];

function shapeReading(levels: Record<DimensionId, Level>): string {
  const s = DIMENSIONS.map((d) => ({ d, v: strengthOf(d.id, levels[d.id]) }));
  const min = Math.min(...s.map((x) => x.v));
  const max = Math.max(...s.map((x) => x.v));
  const weak = s.filter((x) => x.v === 1);
  const strong = s.filter((x) => x.v === 3);
  if (max - min === 0) return "Even: every axis sits at the same strength. Nothing stands out, so the decision depends on what else is on the table.";
  if (weak.length === 1 && s.filter((x) => x.v >= 2).length === 6) return `One weak axis: ${weak[0].d.name}. Everything else holds, so the question is whether that single weakness can be accepted or fixed.`;
  if (strong.length === 1 && s.filter((x) => x.v <= 2).length === 7 && s.filter((x) => x.v === 1).length >= 2) return `Spiky: strong on ${strong[0].d.name} only. A spike can win when that one axis is what the decision needs — it is not automatically weaker than an even profile.`;
  if (max - min <= 1) return "Balanced: the axes stay within one step of each other, with no single axis carrying the case.";
  return "Mixed: some axes are strong and some weak. Name which strengths carry the argument and which weaknesses you are accepting.";
}

export function PracticeRadar() {
  const hydrated = useHydrated();
  const seen = useProgress((s) => s.seen);
  const markSeen = useProgress((s) => s.markSeen);
  const seenIds = hydrated ? (seen[R1.dimensionsSeen] ?? []) : [];

  const [levels, setLevels] = useState<Record<DimensionId, Level>>(baseLevels);
  const total = DIMENSIONS.reduce((n, d) => n + strengthOf(d.id, levels[d.id]), 0);
  const baseTotal = DIMENSIONS.reduce((n, d) => n + strengthOf(d.id, baseLevels[d.id]), 0);

  const set = (id: DimensionId, level: Level) => {
    markSeen(R1.dimensionsSeen, id);
    setLevels((cur) => ({ ...cur, [id]: level }));
  };

  const changed = useLastChange(
    JSON.stringify(levels),
    (p, n) => {
      const prev = JSON.parse(p) as Record<DimensionId, Level>;
      const next = JSON.parse(n) as Record<DimensionId, Level>;
      const id = DIMENSIONS.find((d) => prev[d.id] !== next[d.id])?.id;
      if (!id) return null;
      const d = DIMENSIONS.find((x) => x.id === id)!;
      const claim = d.question.options.find((o) => o.level === next[id])!.label;
      const delta = strengthOf(id, next[id]) - strengthOf(id, prev[id]);
      return `${d.name}: ${LEVEL_LABEL[prev[id]]} → ${LEVEL_LABEL[next[id]]}. Strength ${delta > 0 ? "+" : "−"}${Math.abs(delta)}${id === "risk" ? " (Risk reads in reverse: a lower score is stronger)" : ""}. The claim you are now making: “${claim}.” In the task, only score this from what the option's own description supports.`;
    },
    "Change any level below and read what it claims.",
  );

  const ghost = toValues(baseLevels);
  const isBaseline = DIMENSIONS.every((d) => levels[d.id] === baseLevels[d.id]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-paper p-3">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">{CASE.title}</p>
        <p className="mt-1 text-caption text-ink">{CASE.body}</p>
      </div>

      <RadarChart
        axes={AXES}
        series={[
          { id: "base", label: "Baseline", values: ghost, tone: "ghost" },
          { id: "you", label: "Your profile", values: toValues(levels), tone: "real" },
        ]}
        max={4}
        animate
        title="Practice profile across the seven assessment dimensions, dashed line is the baseline"
        className="max-w-sm"
      />

      <div className="space-y-2">
        {DIMENSIONS.map((d) => {
          const opened = seenIds.includes(d.id);
          const level = levels[d.id];
          const means = d.question.options.find((o) => o.level === level)!.label;
          return (
            <div key={d.id} className="rounded-xl border border-line bg-paper p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-caption font-semibold text-ink">
                  {d.name}
                  {d.direction === "higherRiskier" && <span className="ml-1.5 text-micro font-semibold text-danger">reads in reverse</span>}
                  {opened && <span className="ml-1.5 text-micro text-accent">✓</span>}
                </p>
                <div className="flex gap-1" role="group" aria-label={`${d.name} level`}>
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => set(d.id, l)}
                      aria-pressed={level === l}
                      className={clsx(
                        "rounded-full border px-2.5 py-0.5 text-micro font-semibold transition-colors duration-150",
                        level === l ? "border-accent bg-accentSoft text-accent" : "border-line bg-paper text-ash hover:border-ash",
                      )}
                    >
                      {LEVEL_LABEL[l]}
                      {l === BASELINE[d.id].level ? " ·" : ""}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-0.5 text-micro text-ash">{d.definition}</p>
              <p className="mt-1 text-micro text-ink">
                <span className="font-semibold">{LEVEL_LABEL[level]} means: </span>
                {means}
              </p>
              <p className="text-micro text-ash">
                <span className="font-semibold">Baseline ({LEVEL_LABEL[BASELINE[d.id].level]}): </span>
                {BASELINE[d.id].reason}
              </p>
            </div>
          );
        })}
      </div>

      <LiveReading
        whyLabel="Shape reading"
        numbers={
          <>
            Strength points: {total} of 21 (baseline {baseTotal}) · {total - baseTotal === 0 ? "no change" : `${total - baseTotal > 0 ? "+" : "−"}${Math.abs(total - baseTotal)} from baseline`}
          </>
        }
        why={shapeReading(levels)}
        changed={changed}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setLevels(baseLevels)}
          className={clsx(
            "rounded-full border px-3 py-1 text-micro font-semibold transition-colors duration-150",
            isBaseline ? "border-line text-ash" : "border-accent text-accent hover:bg-accentSoft",
          )}
        >
          Reset to baseline
        </button>
        <span className="text-micro text-ash">{hydrated ? seenIds.length : 0} of 7 dimensions opened · a · marks each axis's baseline level</span>
      </div>
    </div>
  );
}
