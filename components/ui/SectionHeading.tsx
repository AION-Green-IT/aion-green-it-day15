import clsx from "clsx";
import { ReadMore } from "@/components/ui/ReadMore";

/**
 * Consistent block header: an accent kicker, a title, and an intro line.
 * `more` is optional deeper text kept behind a "Read more" so the header
 * stays one short line by default.
 */
export function SectionHeading({
  kicker,
  title,
  intro,
  more,
  className,
}: {
  kicker: string;
  title: string;
  intro?: string;
  more?: string;
  className?: string;
}) {
  return (
    <div className={clsx("max-w-prose", className)}>
      <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-accent">{kicker}</p>
      <h2 className="text-h2 text-ink">{title}</h2>
      {intro ? <p className="mt-3 text-body text-ash">{intro}</p> : null}
      {more ? (
        <ReadMore className="mt-3">
          <p className="text-body text-ash">{more}</p>
        </ReadMore>
      ) : null}
    </div>
  );
}
