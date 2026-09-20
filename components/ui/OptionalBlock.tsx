"use client";

import { useEffect, useId, useState } from "react";
import clsx from "clsx";
import { OPEN_READMORE_EVENT } from "@/components/ui/ReadMore";

/** Fire this to open an optional block by its id. */
export const OPEN_OPTIONAL_EVENT = "aion:open-optional";

/**
 * Optional material or optional task work, kept fully out of the way so the learner
 * stays on what is required — but never removed.
 *
 * Hidden every time the page loads: the open state is in memory only, is never
 * persisted, and is never forced open by existing answers. Opening it takes a
 * deliberate click on a deliberately small text link. If the learner already has saved
 * answers inside, the link says so (they are still part of the export); it does not
 * open the block for them.
 *
 * `opensFor` lists section anchor ids this block contains: a MaterialRefs chip that
 * points at one of them opens the block first, so the chip is never a dead click.
 */
export function OptionalBlock({
  id,
  title,
  minutes,
  hasData = false,
  opensFor = [],
  children,
  className,
}: {
  id: string;
  title: string;
  /** Rough extra time, so nobody opens it blind. */
  minutes?: number;
  /** The learner already has saved answers in here. */
  hasData?: boolean;
  opensFor?: string[];
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const onSection = (e: Event) => {
      if (opensFor.includes((e as CustomEvent<string>).detail)) setOpen(true);
    };
    const onOptional = (e: Event) => {
      if ((e as CustomEvent<string>).detail === id) setOpen(true);
    };
    window.addEventListener(OPEN_READMORE_EVENT, onSection);
    window.addEventListener(OPEN_OPTIONAL_EVENT, onOptional);
    return () => {
      window.removeEventListener(OPEN_READMORE_EVENT, onSection);
      window.removeEventListener(OPEN_OPTIONAL_EVENT, onOptional);
    };
    // opensFor is a stable literal at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div id={`optional-${id}`} className={clsx("scroll-mt-24", className)}>
      {!open ? (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            aria-controls={panelId}
            className="text-micro text-ash underline decoration-dotted underline-offset-2 transition-colors duration-150 hover:text-accent"
          >
            + Optional: {title}
            {minutes ? ` (about ${minutes} more min)` : ""}
            {hasData ? " · saved answers included" : ""}
          </button>
        </div>
      ) : (
        <div id={panelId} className="reveal-in space-y-6 rounded-2xl border border-dashed border-accent/40 p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-micro font-semibold uppercase tracking-wide text-accent">Optional · {title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-expanded
              aria-controls={panelId}
              className="text-micro text-ash underline decoration-dotted underline-offset-2 hover:text-accent"
            >
              Hide
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
