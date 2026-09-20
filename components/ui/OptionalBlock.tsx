"use client";

import { useEffect, useId } from "react";
import clsx from "clsx";
import { useHydrated, useProgress } from "@/lib/store";
import { ChevronDown } from "@/components/icons/LineIcons";
import { OPEN_READMORE_EVENT } from "@/components/ui/ReadMore";

/** Fire this to open an optional block by its id (e.g. from a missing-item `before` callback). */
export const OPEN_OPTIONAL_EVENT = "aion:open-optional";

/**
 * Optional material or optional task work, kept out of the way but never removed.
 * Closed by default: one dashed button that says what is inside. Open: the content,
 * with a "Hide" control. Nothing in here is ever required for export.
 *
 * The open state is persisted (a small `ui:opt:` note), so a reload keeps it. It also
 * stays open by itself when `openWhen` is true — pass "the learner has already
 * written something in here" so answers are never hidden behind a closed block.
 *
 * `opensFor` lists section anchor ids this block contains: a MaterialRefs chip that
 * points at one of them opens the block first, so the chip is never a dead click.
 */
export function OptionalBlock({
  id,
  title,
  hint,
  minutes,
  opensFor = [],
  openWhen = false,
  children,
  className,
}: {
  id: string;
  title: string;
  hint: string;
  /** Rough extra time, shown on the button so nobody opens it blind. */
  minutes?: number;
  opensFor?: string[];
  openWhen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const hydrated = useHydrated();
  const key = `ui:opt:${id}`;
  const flag = useProgress((s) => s.notes[key]);
  const setNote = useProgress((s) => s.setNote);
  const panelId = useId();

  const forced = hydrated && openWhen;
  const open = forced || (hydrated && flag === "1");

  useEffect(() => {
    const onSection = (e: Event) => {
      if (opensFor.includes((e as CustomEvent<string>).detail)) setNote(key, "1");
    };
    const onOptional = (e: Event) => {
      if ((e as CustomEvent<string>).detail === id) setNote(key, "1");
    };
    window.addEventListener(OPEN_READMORE_EVENT, onSection);
    window.addEventListener(OPEN_OPTIONAL_EVENT, onOptional);
    return () => {
      window.removeEventListener(OPEN_READMORE_EVENT, onSection);
      window.removeEventListener(OPEN_OPTIONAL_EVENT, onOptional);
    };
    // opensFor is a stable literal at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, key, setNote]);

  return (
    <div id={`optional-${id}`} className={clsx("scroll-mt-24", className)}>
      {!open ? (
        <button
          type="button"
          onClick={() => setNote(key, "1")}
          aria-expanded={false}
          aria-controls={panelId}
          className="flex w-full items-start gap-3 rounded-2xl border border-dashed border-line bg-canvas px-4 py-3 text-left transition-colors duration-150 hover:border-accent hover:bg-accentSoft/40"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent/50 text-micro font-semibold text-accent">+</span>
          <span className="min-w-0">
            <span className="block text-caption font-semibold text-ink">
              Optional · {title}
              {minutes ? <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-micro font-normal text-ash">about {minutes} more min</span> : null}
            </span>
            <span className="mt-0.5 block text-micro text-ash">{hint}</span>
          </span>
        </button>
      ) : (
        <div id={panelId} className="reveal-in space-y-6 rounded-2xl border border-dashed border-accent/40 p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-micro font-semibold uppercase tracking-wide text-accent">Optional · {title}</p>
            {!forced && (
              <button
                type="button"
                onClick={() => setNote(key, "0")}
                aria-expanded
                aria-controls={panelId}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-3 py-1 text-micro font-semibold text-ash hover:border-ash"
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                Hide
              </button>
            )}
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
