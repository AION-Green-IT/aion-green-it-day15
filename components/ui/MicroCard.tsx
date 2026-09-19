import type { MicroCard as MicroCardData } from "@/lib/materialSection";
import { Icon } from "@/components/icons/LineIcons";
import { Reveal } from "@/components/ui/Reveal";
import { ReadMore } from "@/components/ui/ReadMore";
import { GlossedText } from "@/components/ui/GlossedText";

/**
 * One material micro-card. Always visible: heading, one-line standfirst, the
 * live diagram and the definition. Behind a collapsed Read more: why it
 * matters, the decision rules the task draws on, and the sources.
 *
 * The diagram comes before the prose deliberately. On a "read less, do more"
 * day it is the primary teaching artifact, and the sentences beside it name
 * what the learner has just made the diagram do.
 */
export function MicroCard({
  card,
  anchorId,
  total,
  children,
}: {
  card: MicroCardData;
  /** DOM id the mini-nav and MaterialRefs chips scroll to. */
  anchorId: string;
  /** How many cards this route has — never hard-coded. */
  total: number;
  /** The card's live diagram and its micro-interaction. */
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section" id={anchorId} className="scroll-mt-24">
      <div className="card space-y-4 p-5 md:p-6">
        {/* Heading */}
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accentSoft text-accent">
            <Icon name={card.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-micro font-semibold uppercase tracking-wide text-accent">
                {card.code} · Card {card.n} of {total}
              </p>
              <span className="rounded-full border border-line px-2 py-0.5 text-micro text-ash">~{card.minutes} min</span>
            </div>
            <h2 className="text-h2 text-ink">{card.title}</h2>
            <p className="mt-1 max-w-prose text-body text-ash">{card.standfirst}</p>
          </div>
        </div>

        {/* The diagram — the primary teaching artifact */}
        <div className="overflow-hidden rounded-2xl border border-line bg-canvas p-4 md:p-5">{children}</div>

        {/* The definition — always visible */}
        <div className="max-w-prose space-y-2 text-body text-ash">
          <p className="text-micro font-semibold uppercase tracking-wide text-ink">Definition</p>
          {card.definition.map((s, i) => (
            <GlossedText key={i} text={s} />
          ))}
        </div>

        {/* Everything else, one tap away */}
        <ReadMore sectionId={anchorId} hint={card.moreHint}>
          {card.insight.length > 0 && (
            <div className="max-w-prose space-y-2 text-body text-ash">
              <p className="text-micro font-semibold uppercase tracking-wide text-ink">Why it matters</p>
              {card.insight.map((s, i) => (
                <GlossedText key={i} text={s} />
              ))}
            </div>
          )}

          {card.reasoning.length > 0 && (
            <div className="rounded-2xl border-y border-r border-l-4 border-accent/25 border-l-accent bg-accentSoft/50 p-4">
              <p className="text-micro font-semibold uppercase tracking-wide text-accent">How to decide when this comes up in the task</p>
              <ul className="mt-2 space-y-1.5">
                {card.reasoning.map((rule, i) => (
                  <li key={i} className="flex gap-2 text-caption text-ink">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {card.sources.length > 0 && (
            <div className="border-t border-line pt-3">
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">Sources</p>
              <ul className="mt-1.5 space-y-1">
                {card.sources.map((s) => (
                  <li key={s.label} className="text-micro text-ash">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-ink underline decoration-dotted underline-offset-2 hover:text-accent"
                      >
                        {s.label} ↗
                      </a>
                    ) : (
                      <span className="font-semibold text-ink">{s.label}</span>
                    )}
                    {s.detail ? ` — ${s.detail}` : ""}
                    {s.note ? <span className="italic"> ({s.note})</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ReadMore>
      </div>
    </Reveal>
  );
}
