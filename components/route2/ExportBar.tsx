"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { markRouteExported } from "@/lib/routeGating";
import { exportFilename, printHtmlDocument } from "@/lib/downloadFile";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { MissingList } from "@/components/ui/MissingList";
import { ChevronDown } from "@/components/icons/LineIcons";
import { EXPORT } from "@/lib/route2";
import { useRoute2, domId } from "./useRoute2";
import { buildProposalHtml } from "./exportDocuments";

/**
 * The route's one sticky export bar. Never disabled (CLAUDE.md #3): clicking
 * while incomplete opens the itemized missing list and jumps to the first
 * gap — an orphaned canvas block, an empty element, or an unclassified
 * measure. The export itself is PDF only, via the browser's print dialog.
 */
export function ExportBar() {
  const r2 = useRoute2();
  const toggleCheck = useProgress((s) => s.toggleCheck);
  const [showMissing, setShowMissing] = useState(false);

  const handleExport = () => {
    if (!r2.allComplete) {
      setShowMissing(true);
      const first = r2.missing[0];
      if (first) {
        first.before?.();
        window.setTimeout(() => scrollToAndFlash(first.id), first.before ? 40 : 0);
      }
      return;
    }
    const filename = exportFilename(r2.name, EXPORT.filenameLevels, EXPORT.filenameTask);
    printHtmlDocument(filename, buildProposalHtml(r2));
    markRouteExported(toggleCheck, 2);
    setShowMissing(false);
  };

  return (
    <div
      id={domId.export}
      className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 print:hidden"
    >
      {showMissing && r2.missing.length > 0 && (
        <div className="mb-2 max-h-52 overflow-y-auto rounded-xl border border-line bg-canvas p-3">
          <MissingList items={r2.missing} lead="Still needed before export:" />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowMissing((v) => !v)}
          className="flex flex-wrap items-center gap-x-1.5 text-caption text-ash hover:text-ink"
        >
          <span>
            <span className="tabular-nums font-semibold text-ink">{6 - r2.orphanedBlocks.length}</span> / 6 blocks connected
          </span>
          <span className="text-ash">·</span>
          <span>
            <span className="tabular-nums font-semibold text-ink">{[r2.element1, r2.element3, r2.element5Why].filter(Boolean).length}</span> / 3 core elements written
          </span>
          {r2.optionalTouched && <span className="text-ash">· optional extension included</span>}
          {r2.missing.length > 0 && (
            <>
              <span className="text-ash">
                · {r2.missing.length} item{r2.missing.length === 1 ? "" : "s"} still needed
              </span>
              <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-150", showMissing && "rotate-180")} />
            </>
          )}
        </button>
        <button type="button" onClick={handleExport} className="btn-accent">
          {EXPORT.buttonLabel}
        </button>
      </div>
    </div>
  );
}
