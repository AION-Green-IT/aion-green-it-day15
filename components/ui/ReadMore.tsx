"use client";

import { useEffect, useId, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "@/components/icons/LineIcons";

/** Event a MaterialRefs chip fires so the section it points at opens its Read more (the decision rules live there). */
export const OPEN_READMORE_EVENT = "aion:open-readmore";

/**
 * A collapsed "read more" disclosure for optional depth. The definition stays
 * on screen; everything behind this is a deep dive the learner opens on
 * purpose. Closed by default, no animation library — the open state reuses the
 * shared `reveal-in` keyframe (switched off under prefers-reduced-motion).
 *
 * `sectionId`, when given, lets a task's MaterialRefs chip open this panel on
 * its way to the section, so the decision rules are actually on screen when the
 * learner arrives.
 */
export function ReadMore({
  label = "Read more",
  hint,
  sectionId,
  children,
  className,
}: {
  label?: string;
  /** What is inside, so the learner knows what they would be opening. */
  hint?: string;
  sectionId?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!sectionId) return;
    const onOpen = (e: Event) => {
      if ((e as CustomEvent<string>).detail === sectionId) setOpen(true);
    };
    window.addEventListener(OPEN_READMORE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_READMORE_EVENT, onOpen);
  }, [sectionId]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1.5 text-caption font-semibold text-accent transition-colors duration-150 hover:border-accent hover:bg-accentSoft"
        >
          <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-150", open && "rotate-180")} />
          {open ? "Show less" : label}
        </button>
        {!open && hint ? <span className="text-micro text-ash">{hint}</span> : null}
      </div>

      {open && (
        <div id={panelId} className="reveal-in mt-4 space-y-5">
          {children}
        </div>
      )}
    </div>
  );
}
