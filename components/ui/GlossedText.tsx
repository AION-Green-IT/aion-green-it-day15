"use client";

import { useState } from "react";
import clsx from "clsx";
import { glossaryById, splitByGlossary } from "@/lib/glossary";

/**
 * A sentence with its abbreviations and regulations turned into tappable,
 * dotted-underlined buttons. Tapping one opens a panel under the text (what it
 * stands for, what it means, a clickable source); tapping it again or Close
 * hides it. Self-contained: nothing is loaded, nothing is sent.
 */
export function GlossedText({ text, className }: { text: string; className?: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div className={className}>
      <p>
        {splitByGlossary(text).map((part, i) =>
          part.termId ? (
            <button
              key={i}
              type="button"
              onClick={() => toggle(part.termId!)}
              aria-expanded={openId === part.termId}
              className={clsx(
                "rounded-sm border-b border-dotted font-semibold not-italic transition-colors duration-150",
                openId === part.termId ? "border-accent bg-accentSoft text-accent" : "border-accent/60 text-ink hover:text-accent",
              )}
            >
              {part.text}
            </button>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </p>
      {openId && <TermPanel id={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}

/** What a term stands for, what it means, and where to read the source. */
export function TermPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const g = glossaryById(id);
  return (
    <div className="reveal-in mt-2 rounded-lg border border-accent/30 bg-canvas p-3" role="region" aria-label={`${g.name} explained`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-micro font-semibold uppercase tracking-wide text-accent">{g.name}</p>
          <p className="mt-0.5 text-caption font-semibold text-ink">{g.full}</p>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 rounded-full border border-line px-2 py-0.5 text-micro font-semibold text-ash hover:border-ash">
          Close
        </button>
      </div>
      <p className="mt-1.5 text-caption text-ink">{g.meaning}</p>
      {g.sources.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {g.sources.map((src) => (
            <li key={src.url} className="text-micro text-ash">
              Source:{" "}
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink underline decoration-dotted underline-offset-2 hover:text-accent"
              >
                {src.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
      {g.note && <p className="mt-2 text-micro italic text-ash">{g.note}</p>}
    </div>
  );
}
