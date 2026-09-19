"use client";

import { useState } from "react";
import clsx from "clsx";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { NumberSlider } from "@/components/ui/NumberSlider";
import { fmt, fmtDelta } from "@/lib/format";

/**
 * C3 — a fleet of 100 devices over six years, linear against circular.
 * Two levers: how long a device stays in service before it is replaced, and the
 * share of retired devices that go back into use (reuse, repair, refurbish).
 *   new devices bought = 100 × (6 ÷ years in service) × (1 − share returned)
 *   sent to disposal   = devices retired that are not returned
 * Linear baseline: replace every 3 years, nothing returned → 200 bought, 200 disposed.
 * Below the numbers, the seven R-strategies: what each means and when to reach for it.
 */

const FLEET = 100;
const YEARS = 6;
const START = { service: 3, returned: 0 };

type Rung = { id: string; label: string; means: string; useWhen: string };

const R_LADDER: Rung[] = [
  { id: "refuse", label: "Refuse / rethink", means: "Do we need the device at all, or can the need be met another way?", useWhen: "Before any purchase — the biggest saving is the device never bought." },
  { id: "reduce", label: "Reduce", means: "Fewer devices, less capacity, a lower specification for the same job.", useWhen: "When the fleet is bigger or stronger than the work needs." },
  { id: "reuse", label: "Reuse", means: "The same device used again by someone else, unchanged.", useWhen: "When a device is retired but still works and fits another role." },
  { id: "repair", label: "Repair", means: "Fix the fault and keep the device in service rather than replacing it.", useWhen: "When a fault, not age, is the reason for replacement." },
  { id: "refurbish", label: "Refurbish", means: "Restore a used device to as-new condition for resale or redeployment.", useWhen: "When the device is worn but the hardware is sound — take-back schemes feed this." },
  { id: "remanufacture", label: "Remanufacture", means: "Rebuild from recovered components back to original specification.", useWhen: "When whole devices are not reusable but components are." },
  { id: "recycle", label: "Recycle", means: "Recover the materials once nothing else is possible — the last resort, not the goal.", useWhen: "Only when no rung above it is left." },
];

const bought = (service: number, returned: number) => FLEET * (YEARS / service) * (1 - returned / 100);
/** Simplification: every device bought is eventually disposed of, so the two counts move together. */
const disposed = bought;

export function CircularFleet() {
  const [service, setService] = useState(START.service);
  const [returned, setReturned] = useState(START.returned);
  const [openId, setOpenId] = useState<string>("reuse");

  const buy = bought(service, returned);
  const bin = disposed(service, returned);
  const baselineBuy = bought(START.service, START.returned);
  const saved = baselineBuy - buy;
  const circular = service > START.service || returned > 0;
  const open = R_LADDER.find((r) => r.id === openId)!;
  const rank = R_LADDER.findIndex((r) => r.id === openId) + 1;

  const changed = useLastChange(
    `${service}|${returned}`,
    (p, n) => {
      const [ps, pr] = p.split("|").map(Number);
      const [ns, nr] = n.split("|").map(Number);
      const move = `New devices bought went from ${fmt(bought(ps, pr))} to ${fmt(bought(ns, nr))}.`;
      return ns !== ps
        ? `Years in service ${ps} → ${ns}. ${move} Keeping a device longer buys fewer — that lever sits high on the R-ladder (reduce, repair). The shift: not "which new device is more efficient?" but "do we need to buy at all?"`
        : `Devices returned to use ${pr}% → ${nr}%. ${move} Take-back, reuse and refurbishment keep value in the loop — the same fleet is served by fewer new purchases.`;
    },
    "Move a lever to see how many new devices the fleet needs over six years.",
  );

  const why = !circular
    ? `Buy, use for ${START.service} years, dispose: ${fmt(buy)} new devices and ${fmt(bin)} sent to disposal in ${YEARS} years. This is linear, and it stays linear however efficient each new device is.`
    : `Circular: the same fleet is served with ${fmt(buy)} new devices instead of ${fmt(baselineBuy)} (${fmtDelta(-saved)}), and ${fmt(bin)} go to disposal. ${service > START.service ? `Longer service cuts purchases. ` : ""}${returned > 0 ? `${returned}% coming back into use cuts them further.` : ""}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-x-6 sm:grid-cols-2">
        <NumberSlider
          id="c3-service"
          label="Years a device stays in service"
          caption="A fixed refresh cycle: replace every N years."
          value={service}
          onChange={setService}
          min={2}
          max={6}
          step={1}
          unit=" y"
          baseline={START.service}
        />
        <NumberSlider
          id="c3-returned"
          label="Retired devices that return to use"
          caption="Share that goes back into use through reuse, repair, refurbishment or take-back."
          value={returned}
          onChange={setReturned}
          min={0}
          max={80}
          step={10}
          unit="%"
          baseline={START.returned}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2" role="img" aria-label={`Linear baseline ${fmt(baselineBuy)} new devices; current ${fmt(buy)}`}>
        <div>
          <p className="text-micro text-ash">Linear baseline — {fmt(baselineBuy)} new devices in {YEARS} years</p>
          <div className="mt-0.5 h-5 rounded bg-line" style={{ width: "100%" }} />
        </div>
        <div>
          <p className="text-micro text-ash">
            Your fleet — {fmt(buy)} new devices, {fmt(bin)} disposed
          </p>
          <div
            className={clsx("mt-0.5 h-5 rounded", circular ? "bg-accent/80" : "bg-line")}
            style={{ width: `${(buy / baselineBuy) * 100}%`, transition: "width .3s ease" }}
          />
        </div>
      </div>

      <LiveReading
        tone={circular ? "good" : "neutral"}
        numbers={
          <>
            {FLEET} × ({YEARS} ÷ {service}) × (1 − {(returned / 100).toFixed(1)}) = {fmt(buy)} new devices
          </>
        }
        why={why}
        changed={changed}
      />

      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">The R-strategies — tap a rung. Rung 1 has the highest leverage, rung 7 is the last resort</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {R_LADDER.map((r, i) => {
            const on = r.id === openId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setOpenId(r.id)}
                aria-pressed={on}
                className={clsx(
                  "rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                  on ? "border-accent bg-accentSoft text-accent" : "border-line bg-paper text-ash hover:border-ash",
                )}
              >
                {i + 1}. {r.label}
              </button>
            );
          })}
        </div>
        <div key={openId} className="reveal-in mt-2 rounded-xl border border-accent/30 bg-accentSoft p-3" aria-live="polite">
          <p className="text-caption text-ink">
            <span className="font-semibold text-accent">
              Rung {rank} of 7 · {open.label} —{" "}
            </span>
            {open.means}
          </p>
          <p className="mt-1 text-caption text-ink">
            <span className="font-semibold">Reach for it: </span>
            {open.useWhen}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setService(START.service);
          setReturned(START.returned);
        }}
        className={clsx(
          "rounded-full border px-3 py-1 text-micro font-semibold transition-colors duration-150",
          service === START.service && returned === START.returned ? "border-line text-ash" : "border-accent text-accent hover:bg-accentSoft",
        )}
      >
        Reset to the linear baseline
      </button>
    </div>
  );
}
