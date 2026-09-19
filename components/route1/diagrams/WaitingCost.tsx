"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { NumberSlider } from "@/components/ui/NumberSlider";
import { fmt } from "@/lib/format";

/**
 * C6 — the cost of waiting. A decision has to be made within four quarters. Waiting
 * buys better data but spends runway, and it buys no learning from a live decision.
 *   data confidence = 40% + 15 points per quarter waited (capped at 100%)
 *   runway left     = 4 − quarters waited
 *   learning        = quarters the decision has been live = runway left, if you decide at the end of the wait
 * All values are illustrative — the point is the trade-off, not the figures.
 */

const HORIZON = 4;
const BASE_CONFIDENCE = 40;
const PER_QUARTER = 15;
const START = 0;

const confidence = (w: number) => Math.min(100, BASE_CONFIDENCE + PER_QUARTER * w);

export function WaitingCost() {
  const [waited, setWaited] = useState(START);
  const conf = confidence(waited);
  const runway = HORIZON - waited;
  const learning = runway;

  const changed = useLastChange(
    String(waited),
    (p, n) => {
      const pw = Number(p);
      const nw = Number(n);
      return `Waiting ${pw} → ${nw} quarters. Data confidence ${confidence(pw)}% → ${confidence(nw)}%, but runway ${HORIZON - pw} → ${HORIZON - nw} quarters. ${nw > pw ? "Waiting for more data feels like caution; what it really did was move the same decision onto someone with less time." : "Deciding earlier gives up some data confidence, and gets back quarters in which the decision teaches you something."}`;
    },
    "Move the slider to see what waiting buys and what it spends.",
  );

  const why =
    waited === 0
      ? `Decide now: confidence is ${conf}% — incomplete, which is the normal case — and the decision is live for ${learning} quarters, so you learn from it and can correct it.`
      : `Waiting ${waited} quarter${waited === 1 ? "" : "s"} raises confidence by ${conf - BASE_CONFIDENCE} points to ${conf}%, but leaves ${runway} quarter${runway === 1 ? "" : "s"} of runway and ${learning} of learning. The risk did not go away; it moved to whoever decides then.`;

  return (
    <div className="space-y-4">
      <NumberSlider
        id="c6-wait"
        label="Quarters spent waiting for better data"
        caption="Zero means: decide now, with the logic you have. The decision has to land within four quarters (illustrative)."
        value={waited}
        onChange={setWaited}
        min={0}
        max={HORIZON}
        step={1}
        unit=" q"
        baseline={START}
      />

      <div className="space-y-2" role="img" aria-label={`Data confidence ${conf}%, runway ${runway} of ${HORIZON} quarters`}>
        <div>
          <p className="text-micro text-ash">Confidence in the ROI data — {conf}%</p>
          <div className="mt-0.5 h-4 rounded bg-line">
            <div className="h-4 rounded bg-accent/80" style={{ width: `${conf}%`, transition: "width .3s ease" }} />
          </div>
        </div>
        <div>
          <p className="text-micro text-ash">
            Runway left to act — {runway} of {HORIZON} quarters
          </p>
          <div className="mt-0.5 h-4 rounded bg-line">
            <div className={clsx("h-4 rounded", runway <= 1 ? "bg-danger/70" : "bg-ash/60")} style={{ width: `${(runway / HORIZON) * 100}%`, transition: "width .3s ease" }} />
          </div>
        </div>
      </div>

      <LiveReading
        tone={waited === 0 ? "good" : runway <= 1 ? "bad" : "neutral"}
        numbers={
          <>
            {BASE_CONFIDENCE}% + {waited} × {PER_QUARTER} = {fmt(conf)}% confidence · {HORIZON} − {waited} = {runway} quarters of runway
          </>
        }
        why={why}
        changed={changed}
      />
      <p className="text-micro text-ash">Illustrative numbers: the shape of the trade-off is the point. Real data never arrives on a schedule like this.</p>
    </div>
  );
}
