"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress, useHydrated } from "@/lib/store";
import { Icon } from "@/components/icons/LineIcons";
import { LiveReading } from "@/components/ui/LiveReading";
import { LENSES, LENS_PRACTICE, R1, type LensId } from "@/lib/route1";

/**
 * C4 — the lens key. The wheel fills in as each lens is opened (a soft nudge,
 * never a gate). Every lens is opened as: what it covers, the question it asks,
 * when it is the decisive lens, and a short case. Below it, a practice case that
 * is NOT one of the six task initiatives: pick a lens and read what the pick
 * means for the case — consequences, not verdicts.
 */

const WHEEL = { cx: 90, cy: 90, rOuter: 74, rInner: 42, gapDeg: 3 };

/** One donut segment, computed rather than hand-drawn so seven stay even. */
function segmentPath(index: number, total: number): string {
  const { cx, cy, rOuter, rInner, gapDeg } = WHEEL;
  const step = 360 / total;
  const start = index * step - 90 + gapDeg / 2;
  const end = (index + 1) * step - 90 - gapDeg / 2;
  const rad = (d: number) => (d * Math.PI) / 180;
  const p = (r: number, d: number) => `${cx + r * Math.cos(rad(d))} ${cy + r * Math.sin(rad(d))}`;
  const large = end - start > 180 ? 1 : 0;
  return [`M ${p(rOuter, start)}`, `A ${rOuter} ${rOuter} 0 ${large} 1 ${p(rOuter, end)}`, `L ${p(rInner, end)}`, `A ${rInner} ${rInner} 0 ${large} 0 ${p(rInner, start)}`, "Z"].join(" ");
}

const FIT_LABEL = { decisive: "Names the decisive issue", defensible: "Defensible, but not the sharpest", topic: "Describes the topic, not the issue" } as const;

export function LensKey() {
  const hydrated = useHydrated();
  const seen = useProgress((s) => s.seen);
  const markSeen = useProgress((s) => s.markSeen);
  const [openId, setOpenId] = useState<LensId | null>(null);
  const [pick, setPick] = useState<LensId | null>(null);

  const seenIds = hydrated ? (seen[R1.lensesSeen] ?? []) : [];
  const open = LENSES.find((l) => l.id === openId) ?? null;

  const select = (id: LensId) => {
    setOpenId((cur) => (cur === id ? null : id));
    markSeen(R1.lensesSeen, id);
  };

  const outcome = pick ? LENS_PRACTICE.outcome[pick] : null;

  return (
    <div className="space-y-5">
      <div className="grid items-center gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
        <svg viewBox="0 0 180 180" preserveAspectRatio="xMidYMid meet" className="mx-auto h-auto w-40 sm:w-full" role="img" aria-label={`Seven assessment lenses; ${seenIds.length} of 7 opened.`}>
          {LENSES.map((lens, i) => {
            const isSeen = seenIds.includes(lens.id);
            const isOpen = openId === lens.id;
            return (
              <path
                key={lens.id}
                d={segmentPath(i, LENSES.length)}
                className={clsx("cursor-pointer", isOpen ? "fill-accent" : isSeen ? "fill-accentSoft stroke-accent" : "fill-mist stroke-line")}
                strokeWidth="1.2"
                style={{ transition: "fill .25s ease" }}
                onClick={() => select(lens.id)}
              />
            );
          })}
          <text x="90" y="86" textAnchor="middle" className="fill-ink text-[15px] font-semibold">
            {seenIds.length}/7
          </text>
          <text x="90" y="101" textAnchor="middle" className="fill-ash text-[9px] uppercase tracking-wide">
            lenses opened
          </text>
        </svg>

        <div className="grid grid-cols-2 gap-1.5">
          {LENSES.map((lens) => {
            const isSeen = seenIds.includes(lens.id);
            const isOpen = openId === lens.id;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => select(lens.id)}
                aria-pressed={isOpen}
                className={clsx(
                  "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition-colors duration-150",
                  isOpen ? "border-accent bg-accent text-paper" : isSeen ? "border-accent/40 bg-accentSoft text-accent" : "border-line bg-paper text-ash hover:border-ash",
                )}
              >
                <Icon name={lens.icon} className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 truncate text-micro font-semibold">{lens.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div aria-live="polite">
        {open ? (
          <div key={open.id} className="reveal-in space-y-1.5 rounded-xl border border-accent/30 bg-accentSoft p-3">
            <p className="text-caption text-ink">
              <span className="font-semibold text-accent">{open.name} — </span>
              {open.definition}
            </p>
            <p className="text-caption text-ink">
              <span className="font-semibold">It asks: </span>
              {open.ask}
            </p>
            <p className="text-caption text-ink">
              <span className="font-semibold">Use it when: </span>
              {open.useWhen}
            </p>
            <p className="text-caption text-ink">
              <span className="font-semibold">A case: </span>
              {open.example}
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line bg-paper p-3 text-caption text-ash">Tap a lens to read what it covers, the question it asks, when to use it, and a case.</p>
        )}
      </div>

      {hydrated && seenIds.length < LENSES.length && (
        <p className="text-micro text-ash">Suggested: open all seven once before starting the task — you have {seenIds.length} of 7. You can start regardless.</p>
      )}
      {hydrated && seenIds.length === LENSES.length && <p className="reveal-in text-micro font-semibold text-accent">All seven opened — you have the vocabulary the task uses.</p>}

      {/* Practice case — not one of the task's initiatives */}
      <div className="rounded-xl border border-line bg-paper p-3">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">{LENS_PRACTICE.title}</p>
        <p className="mt-1 text-caption text-ink">{LENS_PRACTICE.body}</p>
        <p className="mt-2 text-caption font-semibold text-ink">{LENS_PRACTICE.question}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {LENSES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setPick(l.id)}
              aria-pressed={pick === l.id}
              className={clsx(
                "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                pick === l.id ? "border-accent bg-accentSoft text-accent" : "border-line bg-paper text-ash hover:border-ash",
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
        {outcome && pick ? (
          <div className="mt-2">
            <LiveReading
              whyLabel={FIT_LABEL[outcome.fit]}
              why={outcome.text}
              tone="neutral"
              changed={outcome.fit === "decisive" ? "This is the shift the task asks for: pick the lens that explains the verdict, not the one that names the subject." : "Try another lens: the goal is the one a decision-maker would have to act on first."}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
