"use client";

import { useState } from "react";
import clsx from "clsx";

/**
 * The reading every upgraded interactive shows under its controls, always
 * derived from state (never a hard-coded copy of a number):
 *  - `numbers`  the visible sum / totals
 *  - `why`      "Why this result": the outcome, the margin, which input made the difference
 *  - `changed`  "What just changed": what moved after the last control change, and the shift in thinking
 * The region is `aria-live="polite"` so a screen reader hears the change.
 */
export function LiveReading({
  numbers,
  why,
  changed,
  tone = "neutral",
  whyLabel = "Why this result",
  changedLabel = "What just changed",
}: {
  numbers?: React.ReactNode;
  why: string;
  changed?: string;
  tone?: "good" | "bad" | "neutral";
  whyLabel?: string;
  changedLabel?: string;
}) {
  return (
    <div
      aria-live="polite"
      className={clsx(
        "rounded-xl border p-3",
        tone === "good" && "border-accent/30 bg-accentSoft",
        tone === "bad" && "border-danger/30 bg-danger/5",
        tone === "neutral" && "border-line bg-paper",
      )}
    >
      {numbers && <div className="text-caption font-semibold tabular-nums text-ink">{numbers}</div>}
      <p className={clsx("text-caption text-ink", numbers && "mt-1.5")}>
        <span className="font-semibold">{whyLabel}: </span>
        {why}
      </p>
      {changed ? (
        <p className="mt-1.5 border-t border-line/70 pt-1.5 text-caption text-ash">
          <span className="font-semibold text-ink">{changedLabel}: </span>
          {changed}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Remembers the last "what changed" sentence. Call it with the value that the
 * controls drive; `describe(prev, next)` returns the sentence for that move.
 * The sentence stays until the next change, so a learner who looks away and
 * back still sees the last thing they did.
 */
export function useLastChange<T>(value: T, describe: (prev: T, next: T) => string | null, initial = ""): string {
  const [prev, setPrev] = useState<T>(value);
  const [msg, setMsg] = useState(initial);
  if (!Object.is(value, prev)) {
    setPrev(value);
    const m = describe(prev, value);
    if (m) setMsg(m);
  }
  return msg;
}
