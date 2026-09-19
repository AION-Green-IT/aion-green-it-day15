"use client";

import { useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/icons/LineIcons";
import { LiveReading } from "@/components/ui/LiveReading";

/**
 * C9 — name the live mechanism. Three practice options (none of them Task 2's
 * lines). For each, pick which of the three failure modes is the live one and read
 * what that pick means: consequences, not verdicts. Every option also shows the
 * early signal that would show the weakness is real.
 */

type Mech = "symbolic" | "misinvestment" | "rebound";

const MECHS: { id: Mech; label: string; detail: string }[] = [
  { id: "symbolic", label: "Symbolic politics", detail: "A visible signal with little real effect behind it." },
  { id: "misinvestment", label: "Misinvestment", detail: "Money and attention committed before the case is proven." },
  { id: "rebound", label: "Rebound", detail: "The efficiency gain is eaten by more usage." },
];

const CASES: {
  id: string;
  text: string;
  live: Mech;
  signal: string;
  outcome: Record<Mech, string>;
}[] = [
  {
    id: "p1",
    text: "A sustainability microsite with a live carbon counter, launched before any measurement exists.",
    live: "symbolic",
    signal: "the counter shows numbers nobody can trace to a data source, and no decision uses them.",
    outcome: {
      symbolic: "This is the live mechanism: the signal is visible and nothing real sits behind it. What would break: the first person who asks where the number comes from.",
      misinvestment: "Some money is being spent early, but the amount is small; the sharper problem is that the signal has no substance behind it.",
      rebound: "There is no efficiency gain here to be eaten by usage, so rebound does not explain the weakness.",
    },
  },
  {
    id: "p2",
    text: "Buying 500 GPUs for an AI programme before a single use case has been approved.",
    live: "misinvestment",
    signal: "the hardware sits at low utilisation while use cases are still being argued about.",
    outcome: {
      symbolic: "It may look impressive, but the money is real and committed — the sharper problem is spending before the case is proven.",
      misinvestment: "This is the live mechanism: money and attention are committed before the case exists. What would break: the compute bill arriving with nothing yet to justify it.",
      rebound: "Rebound needs an efficiency gain that raises usage. Nothing is running yet, so it is too early for that mechanism.",
    },
  },
  {
    id: "p3",
    text: "A more efficient video-conferencing service rolled out free to everyone.",
    live: "rebound",
    signal: "meeting hours and stored recordings grow faster than the per-minute saving.",
    outcome: {
      symbolic: "There is a visible benefit and a real effect; the weakness is not the signal, it is what cheaper use invites.",
      misinvestment: "The rollout is cheap, so money committed early is not the issue — what people do once it is free is.",
      rebound: "This is the live mechanism: efficiency lowers the cost of use, use grows, and the saving is spent. What would break: total energy and storage rise even though each minute is cheaper.",
    },
  },
];

export function WeaknessLab() {
  const [picks, setPicks] = useState<Record<string, Mech | null>>({});
  const [openId, setOpenId] = useState<string>(CASES[0].id);
  const open = CASES.find((c) => c.id === openId)!;
  const pick = picks[openId] ?? null;
  const done = CASES.filter((c) => picks[c.id]).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-warn/30 bg-warn/5 p-3">
        <Icon name="trophy" className="h-8 w-8 shrink-0 text-warn" />
        <p className="text-caption text-ink">Each option below looks like real progress. Pick the one failure mode that is the live risk for it.</p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Practice options">
        {CASES.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={openId === c.id}
            onClick={() => setOpenId(c.id)}
            className={clsx(
              "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
              openId === c.id ? "border-accent bg-accentSoft text-accent" : picks[c.id] ? "border-accent/40 text-accent" : "border-line text-ash hover:border-ash",
            )}
          >
            Option {i + 1}
            {picks[c.id] ? " ✓" : ""}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-paper p-3">
        <p className="text-caption font-semibold text-ink">{open.text}</p>
        <p className="mt-2 text-micro font-semibold uppercase tracking-wide text-ash">Which failure mode is the live one?</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {MECHS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPicks((cur) => ({ ...cur, [openId]: m.id }))}
              aria-pressed={pick === m.id}
              title={m.detail}
              className={clsx(
                "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                pick === m.id ? "border-accent bg-accentSoft text-accent" : "border-line bg-paper text-ash hover:border-ash",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <ul className="mt-2 space-y-0.5">
          {MECHS.map((m) => (
            <li key={m.id} className="text-micro text-ash">
              <span className="font-semibold text-ink">{m.label}: </span>
              {m.detail}
            </li>
          ))}
        </ul>
      </div>

      {pick ? (
        <LiveReading
          whyLabel="What this pick means"
          why={open.outcome[pick]}
          changed={open.signal}
          changedLabel="Early signal that it is real"
          tone={pick === open.live ? "good" : "neutral"}
        />
      ) : (
        <p className="rounded-xl border border-dashed border-line bg-paper p-3 text-caption text-ash">Pick a failure mode to read what it means for this option.</p>
      )}

      <p className="text-micro text-ash">
        {done} of {CASES.length} options named. A defensible pick names, in advance, which one is live for the option — not just that risk exists.
      </p>
    </div>
  );
}
