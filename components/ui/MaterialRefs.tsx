"use client";

import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { OPEN_READMORE_EVENT } from "@/components/ui/ReadMore";
import { BookOpen } from "@/components/icons/LineIcons";

export type MaterialRef = { anchorId: string; label: string };

/**
 * "Where this comes from" chips under a task step. Each one opens the cited
 * section's Read more (that is where the decision rules live), scrolls to it
 * and flashes it in the accent — never the red missing-item flash, because
 * arriving somewhere you asked to go isn't a warning. Standard #11b: no task
 * step should leave a learner guessing which part of the material it draws on.
 */
export function MaterialRefs({ refs, lead = "Based on" }: { refs: MaterialRef[]; lead?: string }) {
  if (refs.length === 0) return null;

  const go = (anchorId: string) => {
    window.dispatchEvent(new CustomEvent(OPEN_READMORE_EVENT, { detail: anchorId }));
    // Let the panel open first, so the flash lands on the section at its final height.
    window.setTimeout(() => scrollToAndFlash(anchorId, "ref"), 50);
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-micro text-ash">
        <BookOpen className="h-3.5 w-3.5" />
        {lead}:
      </span>
      {refs.map((r) => (
        <button
          key={r.anchorId}
          type="button"
          onClick={() => go(r.anchorId)}
          className="rounded-full border border-accent/35 bg-accentSoft px-2.5 py-0.5 text-micro font-medium text-accent transition-colors duration-150 hover:border-accent hover:text-accentHi"
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
