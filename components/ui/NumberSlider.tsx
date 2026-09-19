"use client";

/**
 * A labelled native range input with a real minimum, a step and a unit — for
 * calculators where every position is a valid value (unlike `Slider`, whose 0
 * means "not answered"). Caption sits under the label (CLAUDE.md #8).
 */
export function NumberSlider({
  id,
  label,
  caption,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  baseline,
}: {
  id: string;
  label: string;
  caption?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** A ghost value to compare against: shown as "+n from baseline" and via the Reset button. */
  baseline?: number;
}) {
  const delta = baseline === undefined ? 0 : value - baseline;
  return (
    <div className="py-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <label htmlFor={id} className="text-caption font-semibold text-ink">
          {label}
        </label>
        <span className="text-micro font-semibold tabular-nums text-accent">
          {value}
          {unit}
          {baseline !== undefined && delta !== 0 ? (
            <span className="ml-1.5 text-ash">
              ({delta > 0 ? "+" : "−"}
              {Math.abs(delta)}
              {unit} from start)
            </span>
          ) : null}
        </span>
      </div>
      {caption && <p className="mt-0.5 text-micro text-ash">{caption}</p>}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value}${unit}`}
        className="range-accent mt-2 w-full"
      />
      <div className="flex justify-between text-micro tabular-nums text-ash">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
