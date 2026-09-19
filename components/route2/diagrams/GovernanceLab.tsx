"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";

/**
 * D3 — the governance loop as a role lab. Four stages, each with who plays it, the
 * question it asks, and what goes wrong without it. Remove a stage to read the
 * consequence; the numbers count how many of the four are covered. Task 3's
 * element 6 has to cover all four, not just "who approves".
 */

type StageId = "propose" | "assess" | "approve" | "review";

const STAGES: { id: StageId; label: string; role: string; question: string; without: string }[] = [
  { id: "propose", label: "Propose", role: "Any team or sponsor", question: "What is being asked for, and what benefit is claimed?", without: "Ideas arrive by side door — whoever has the loudest sponsor gets heard, and nothing is written down to assess." },
  { id: "assess", label: "Assess", role: "The framework owner", question: "Does it clear the four criteria?", without: "Nothing is tested against the criteria, so approval rests on enthusiasm. The framework becomes a document, not a process." },
  { id: "approve", label: "Approve / park", role: "A steering group", question: "Given the whole portfolio, does this go ahead now, or wait?", without: "Assessed initiatives pile up with no one to fund or park them, so the department that pushes hardest decides." },
  { id: "review", label: "Review", role: "Management review", question: "Did it deliver, and what changes for next time?", without: "Approved initiatives keep their budget by default. Assumptions made under uncertainty are never checked against real results." },
];

export function GovernanceLab() {
  const [off, setOff] = useState<StageId[]>([]);
  const [openId, setOpenId] = useState<StageId>("propose");
  const open = STAGES.find((s) => s.id === openId)!;
  const covered = STAGES.length - off.length;

  const toggle = (id: StageId) => {
    setOpenId(id);
    setOff((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const changed = useLastChange(
    off.join(","),
    (p, n) => {
      const before = p ? p.split(",") : [];
      const after = n ? n.split(",") : [];
      const added = after.find((x) => !before.includes(x)) as StageId | undefined;
      const removed = before.find((x) => !after.includes(x)) as StageId | undefined;
      if (added) return `${STAGES.find((s) => s.id === added)!.label} removed: ${4 - after.length} of 4 stages remain. ${STAGES.find((s) => s.id === added)!.without}`;
      if (removed) return `${STAGES.find((s) => s.id === removed)!.label} restored: ${4 - after.length} of 4 stages covered.`;
      return null;
    },
    "Remove a stage to see what goes wrong without it.",
  );

  const missing = STAGES.filter((s) => off.includes(s.id));
  const why =
    missing.length === 0
      ? "All four stages are covered: each has a role and a question, and a decision can be revisited. This is what element 6 has to describe — not just who approves."
      : `Without ${missing.map((m) => m.label).join(" and ")}, the loop is broken. ${missing[0].without}`;

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 340 170" preserveAspectRatio="xMidYMid meet" className="mx-auto h-auto w-full max-w-md" role="img" aria-label={`A governed loop with ${covered} of 4 stages covered`}>
        <path d="M90 46 H250 V124 H90 Z" fill="none" stroke="currentColor" className="text-line" strokeWidth="1.6" />
        {[
          { s: STAGES[0], x: 90, y: 30 },
          { s: STAGES[1], x: 250, y: 30 },
          { s: STAGES[2], x: 250, y: 140 },
          { s: STAGES[3], x: 90, y: 140 },
        ].map(({ s, x, y }) => {
          const isOff = off.includes(s.id);
          return (
            <g key={s.id} className="cursor-pointer" onClick={() => toggle(s.id)}>
              <circle cx={x} cy={y} r="24" className={isOff ? "fill-canvas stroke-danger" : openId === s.id ? "fill-accent" : "fill-paper stroke-line"} strokeWidth="1.6" strokeDasharray={isOff ? "4 3" : undefined} />
              <text x={x} y={y + 3.5} textAnchor="middle" className={clsx("text-[9.5px] font-semibold", isOff ? "fill-danger" : openId === s.id ? "fill-paper" : "fill-ink")}>
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">The four stages — tap one to remove or restore it</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {STAGES.map((s) => {
            const isOff = off.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={!isOff}
                className={clsx(
                  "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                  isOff ? "border-dashed border-danger/50 text-danger" : openId === s.id ? "border-accent bg-accentSoft text-accent" : "border-line text-ash hover:border-ash",
                )}
              >
                {s.label}
                {isOff ? " · removed" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div key={open.id} className="reveal-in rounded-xl border border-accent/30 bg-accentSoft p-3">
        <p className="text-caption text-ink">
          <span className="font-semibold text-accent">{open.label} — {open.role}. </span>
          It asks: {open.question}
        </p>
      </div>

      <LiveReading tone={missing.length === 0 ? "good" : "bad"} numbers={<>Stages covered: {covered} of 4</>} why={why} changed={changed} />
    </div>
  );
}
