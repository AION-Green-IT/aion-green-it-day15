"use client";

import { useState } from "react";
import clsx from "clsx";
import { useHydrated, useProgress } from "@/lib/store";
import { createPlacementHistory, type PlacementMap } from "@/lib/usePlacementHistory";
import { undoRedoKeyHandler } from "@/lib/undoShortcuts";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { UndoRedoControls } from "@/components/ui/UndoRedoControls";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { ReadMore } from "@/components/ui/ReadMore";
import { OptionalBlock } from "@/components/ui/OptionalBlock";
import { Icon } from "@/components/icons/LineIcons";
import {
  CHECK_LABELS,
  CLOSING_ALL_FIELD,
  LENSES,
  LENS_FIELD,
  LOAD_FIELD,
  R1,
  RATIONALE_FIELD,
  STRUCTURE_QUESTIONS,
  ZONES,
  materialRefs,
  zoneById,
  zoneReason,
  type MaterialSectionId,
  type ZoneId,
} from "@/lib/route1";
import { checkInitiative, domId, useRoute1, type CheckResult, type InitiativeState } from "./useRoute1";

/**
 * Task 1 — the FutureGrid diagnosis board.
 *
 * Decision-first, not drag-first: the learner answers two questions per
 * initiative and the card resolves itself into one of three zones. Because the
 * zone is computed from their own two answers it is never a free pick, so
 * showing it immediately reveals nothing they did not just decide.
 *
 * Undo/redo (CLAUDE.md §5) therefore covers the *answers* rather than a drag —
 * undoing a diagnosis moves the card back out of its zone, which is the same
 * "remove a wrong placement and retry" the rule exists to guarantee.
 */
export function DiagnosisBoard() {
  const r1 = useRoute1();
  const choose = useProgress((s) => s.choose);
  const setNote = useProgress((s) => s.setNote);

  const [useBoardHistory] = useState(() => createPlacementHistory());
  const past = useBoardHistory((s) => s.past);
  const future = useBoardHistory((s) => s.future);
  const recordChange = useBoardHistory((s) => s.recordChange);
  const doUndo = useBoardHistory((s) => s.undo);
  const doRedo = useBoardHistory((s) => s.redo);

  /** Verdicts from the last check, each tagged with the answers it was computed from. */
  const [results, setResults] = useState<Record<string, { sig: string; result: CheckResult }>>({});
  const [summary, setSummary] = useState<string | null>(null);

  const signature = (c: InitiativeState) => `${c.load ?? ""}|${c.structure ?? ""}|${c.lens ?? ""}`;

  const currentMap = (): PlacementMap => {
    const map: PlacementMap = {};
    for (const c of r1.cards) {
      map[`${c.initiative.id}:load`] = c.load;
      map[`${c.initiative.id}:structure`] = c.structure;
      map[`${c.initiative.id}:lens`] = c.lens;
    }
    return map;
  };

  const applyMap = (map: PlacementMap) => {
    for (const c of r1.cards) {
      const id = c.initiative.id;
      choose(R1.load(id), map[`${id}:load`] ?? "");
      choose(R1.structure(id), map[`${id}:structure`] ?? "");
      choose(R1.lens(id), map[`${id}:lens`] ?? "");
    }
  };

  /** Every answer change goes through here, so every one of them is undoable. */
  const answer = (initiativeId: string, field: "load" | "structure" | "lens", value: string) => {
    // Re-picking the same option must not push an identical snapshot, or the
    // next Undo would look broken by appearing to do nothing.
    if (r1.cardById(initiativeId)[field] === value) return;
    recordChange(currentMap());
    const key =
      field === "load" ? R1.load(initiativeId) : field === "structure" ? R1.structure(initiativeId) : R1.lens(initiativeId);
    choose(key, value);
  };

  const handleUndo = () => {
    const prev = doUndo(currentMap());
    if (prev) applyMap(prev);
  };
  const handleRedo = () => {
    const next = doRedo(currentMap());
    if (next) applyMap(next);
  };

  const runCheck = () => {
    const diagnosed = r1.cards.filter((c) => c.diagnosed);
    if (diagnosed.length === 0) {
      setSummary(CHECK_LABELS.unanswered);
      return;
    }
    const next: Record<string, { sig: string; result: CheckResult }> = {};
    let holds = 0;
    for (const c of diagnosed) {
      const countAfter = c.checkCount + 1;
      setNote(R1.checkCount(c.initiative.id), String(countAfter));
      const result = checkInitiative(c, countAfter);
      if (result.holds) holds += 1;
      next[c.initiative.id] = { sig: signature(c), result };
    }
    setResults(next);
    setSummary(CHECK_LABELS.summary(holds, diagnosed.length));
  };

  const resultFor = (c: InitiativeState): CheckResult | null => {
    const entry = results[c.initiative.id];
    if (!entry || entry.sig !== signature(c)) return null;
    return entry.result;
  };

  return (
    <div
      id={domId.board}
      tabIndex={-1}
      onKeyDown={undoRedoKeyHandler(handleUndo, handleRedo)}
      className="scroll-mt-24 space-y-5"
    >
      {/* Board header — progress, the one check action, undo/redo */}
      <div className="rounded-2xl border border-line bg-paper p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-micro text-ash">
            <span className="font-semibold tabular-nums text-ink">{r1.coreDiagnosedCount}</span> of {r1.coreCount} diagnosed ·{" "}
            <span className="font-semibold tabular-nums text-ink">{r1.coreCompleteCount}</span> of {r1.coreCount} written up
            {r1.diagnosedCount > r1.coreDiagnosedCount ? ` · plus ${r1.diagnosedCount - r1.coreDiagnosedCount} optional` : ""}
          </p>
          <UndoRedoControls
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={past.length > 0}
            canRedo={future.length > 0}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
          <button
            type="button"
            onClick={runCheck}
            className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-caption font-semibold text-ink transition-colors duration-150 hover:border-ash"
          >
            {Object.keys(results).length > 0 ? CHECK_LABELS.recheck : CHECK_LABELS.check}
          </button>
          <p className="text-micro text-ash">
            Checks every initiative you have diagnosed so far. It tells you whether a diagnosis holds and gives a clue
            where it does not — never the answer.
          </p>
        </div>

        {summary && (
          <p aria-live="polite" className="reveal-in mt-2 text-caption font-semibold text-ink">
            {summary}
          </p>
        )}

        {/* Live zone tally */}
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {ZONES.map((z) => (
            <div key={z.id} className={clsx("rounded-xl border px-3 py-2", zoneTone(z.id).chip)}>
              <p className={clsx("text-micro font-semibold uppercase tracking-wide", zoneTone(z.id).text)}>{z.name}</p>
              <p className="text-readout tabular-nums text-ink">{r1.byZone(z.id).length}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Not yet diagnosed — the core three */}
      <div className="rounded-2xl border border-dashed border-line bg-canvas p-4">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">
          Not yet diagnosed — {r1.coreCards.filter((c) => !c.diagnosed).length} of {r1.coreCount}
        </p>
        <p className="mt-0.5 text-micro text-ash">
          Answer both questions on a card and it resolves itself into one of the three zones below. You are not choosing
          the zone — your two answers decide it.
        </p>
        {r1.coreCards.every((c) => c.diagnosed) ? (
          <p className="mt-2 text-caption text-ash">
            All three are diagnosed and sitting in the zones below. Change any answer there and the card moves.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {r1.coreCards
              .filter((c) => !c.diagnosed)
              .map((c) => (
                <InitiativeCard
                  key={c.initiative.id}
                  card={c}
                  result={resultFor(c)}
                  onAnswer={answer}
                  onRationale={(v) => setNote(R1.rationale(c.initiative.id), v)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Optional — the other three initiatives, same questions, same zones */}
      <OptionalBlock
        id={domId.optMoreInitiatives}
        title="Diagnose the other three initiatives"
        hint="The same two questions on initiatives 2, 4 and 5. They land in the same zones below and are added to your export."
        minutes={10}
        openWhen={r1.extraTouched}
      >
        {r1.extraCards.filter((c) => !c.diagnosed).length === 0 ? (
          <p className="text-caption text-ash">All three optional initiatives are diagnosed and sitting in the zones below.</p>
        ) : (
          <div className="space-y-3">
            {r1.extraCards
              .filter((c) => !c.diagnosed)
              .map((c) => (
                <InitiativeCard
                  key={c.initiative.id}
                  card={c}
                  result={resultFor(c)}
                  onAnswer={answer}
                  onRationale={(v) => setNote(R1.rationale(c.initiative.id), v)}
                />
              ))}
          </div>
        )}
        <OptionalClosing />
      </OptionalBlock>

      {/* The three zones */}
      <div className="space-y-4">
        {ZONES.map((zone) => {
          const inZone = r1.byZone(zone.id);
          const tone = zoneTone(zone.id);
          return (
            <div key={zone.id} className={clsx("rounded-2xl border p-4", tone.lane)}>
              <div className="flex items-start gap-2.5">
                <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper", tone.text)}>
                  <Icon name={zone.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className={clsx("text-caption font-semibold", tone.text)}>
                    {zone.name} — {inZone.length}
                  </p>
                  <p className="mt-0.5 text-micro text-ash">{zone.note}</p>
                </div>
              </div>

              {inZone.length === 0 ? (
                <p className="mt-3 rounded-lg border border-dashed border-line bg-paper/60 px-3 py-2 text-micro italic text-ash">
                  Nothing has resolved here yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {inZone.map((c) => (
                    <InitiativeCard
                      key={c.initiative.id}
                      card={c}
                      result={resultFor(c)}
                      onAnswer={answer}
                      onRationale={(v) => setNote(R1.rationale(c.initiative.id), v)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Every zone is neutral. A zone is the consequence of the learner's own two
 * answers, not a verdict on them, so it must never read as "correct" (green) or
 * "wrong" (red) before Check has run — colour is reserved for a fresh verdict,
 * and `warn` for mentor answer keys (CLAUDE.md §7). The zone is told apart by
 * its name and icon.
 */
function zoneTone(_id: ZoneId) {
  return { lane: "border-line bg-mist", chip: "border-line bg-mist", text: "text-ink" };
}

// ---------------------------------------------------------------------------
// One initiative — the same card whether it is still in the pool or resolved
// ---------------------------------------------------------------------------

function InitiativeCard({
  card,
  result,
  onAnswer,
  onRationale,
}: {
  card: InitiativeState;
  result: CheckResult | null;
  onAnswer: (initiativeId: string, field: "load" | "structure" | "lens", value: string) => void;
  onRationale: (value: string) => void;
}) {
  const { initiative } = card;
  const structureQ = STRUCTURE_QUESTIONS[initiative.structureQuestion];
  const zone = card.zone ? zoneById(card.zone) : null;
  const tone = card.zone ? zoneTone(card.zone) : null;

  const refs: MaterialSectionId[] = Array.from(
    new Set<MaterialSectionId>([...LOAD_FIELD.material, ...structureQ.material]),
  );

  return (
    <div id={domId.init(initiative.id)} className="scroll-mt-24 rounded-xl border border-line bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-micro font-semibold uppercase tracking-wide text-ash">
            Initiative {initiative.n}
            {!card.core && <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-micro font-normal normal-case text-ash">optional</span>}
          </p>
          <h4 className="text-h3 text-ink">{initiative.title}</h4>
        </div>
        {zone && tone && (
          <span
            key={zone.id}
            className={clsx(
              "anim-pop shrink-0 rounded-full border px-2.5 py-1 text-micro font-semibold",
              tone.chip,
              tone.text,
            )}
          >
            {zone.name}
          </span>
        )}
      </div>

      <p className="mt-2 max-w-prose text-caption text-ink">{initiative.description}</p>
      <MaterialRefs refs={materialRefs(refs)} />

      {/* Q1 — the same question for every initiative */}
      <div id={domId.initLoad(initiative.id)} className="mt-4 scroll-mt-24 border-t border-line pt-3">
        <p className="text-caption font-semibold text-ink">{LOAD_FIELD.label}</p>
        <p className="mt-0.5 text-micro text-ash">{LOAD_FIELD.instruction}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {LOAD_FIELD.options.map((o) => (
            <OptionChip
              key={o.id}
              label={o.label}
              on={card.load === o.id}
              onClick={() => onAnswer(initiative.id, "load", o.id)}
            />
          ))}
        </div>
        <ul className="mt-1.5 space-y-0.5">
          {LOAD_FIELD.options.map((o) => (
            <li key={o.id} className="text-micro text-ash">
              <span className="font-semibold text-ink">{o.label}: </span>
              {o.means}
            </li>
          ))}
        </ul>
      </div>

      {/* Q2 — whichever question is most diagnostic here */}
      <div id={domId.initStructure(initiative.id)} className="mt-3 scroll-mt-24">
        <p className="text-caption font-semibold text-ink">{structureQ.label}</p>
        <p className="mt-0.5 text-micro text-ash">{structureQ.instruction}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {structureQ.options.map((o) => (
            <OptionChip
              key={o.id}
              label={o.label}
              on={card.structure === o.id}
              onClick={() => onAnswer(initiative.id, "structure", o.id)}
            />
          ))}
        </div>
      </div>

      {!card.diagnosed && (
        <p className="mt-3 text-micro italic text-ash">
          Answer both and this card resolves into a zone.
        </p>
      )}

      {card.diagnosed && card.zone && card.load && card.structure && (
        <div aria-live="polite" className="reveal-in mt-3 rounded-lg border border-line bg-canvas p-2.5">
          <p className="text-caption text-ink">
            <span className="font-semibold">Why this zone: </span>
            {zoneReason(card.load, card.structure, card.zone)}
          </p>
          <p className="mt-1 text-micro text-ash">This is what your two answers give — it is not a verdict on them. Use Check to find out whether they hold up.</p>
        </div>
      )}

      {card.diagnosed && (
        <>
          {/* The lens — optional (it needs C4, an optional card) */}
          <OptionalBlock
            id={`r1-lens-${initiative.id}`}
            title="Name the lens"
            hint="Which of the seven lenses names the decisive issue? Uses optional card C4. Added to your export if you do."
            openWhen={!!card.lens}
            className="mt-4"
          >
          <div id={domId.initLens(initiative.id)} className="scroll-mt-24">
            <p className="text-caption font-semibold text-ink">{LENS_FIELD.label}</p>
            <p className="mt-0.5 text-micro text-ash">{LENS_FIELD.instruction}</p>
            <MaterialRefs refs={materialRefs(LENS_FIELD.material)} />
            <ReadMore className="mt-1.5" label="Lens key" hint="what each lens asks and when to use it">
              <ul className="space-y-1.5">
                {LENSES.map((lens) => (
                  <li key={lens.id} className="text-micro text-ink">
                    <span className="font-semibold">{lens.name} — </span>
                    {lens.definition} <span className="text-ash">It asks: {lens.ask}</span> <span className="text-ash">Use it when: {lens.useWhen}</span>
                  </li>
                ))}
              </ul>
            </ReadMore>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LENSES.map((lens) => {
                const on = card.lens === lens.id;
                return (
                  <button
                    key={lens.id}
                    type="button"
                    title={lens.definition}
                    onClick={() => onAnswer(initiative.id, "lens", lens.id)}
                    aria-pressed={on}
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                      on ? "border-accent bg-accentSoft text-accent" : "border-line text-ash hover:border-ash",
                    )}
                  >
                    <Icon name={lens.icon} className="h-3.5 w-3.5" />
                    {lens.name}
                  </button>
                );
              })}
            </div>
          </div>

          </OptionalBlock>

          {/* The rationale */}
          <div id={domId.initWhy(initiative.id)} className="mt-3 scroll-mt-24">
            <label htmlFor={`r1-why-${initiative.id}`} className="block text-caption font-semibold text-ink">
              {RATIONALE_FIELD.label}
            </label>
            <p className="mt-0.5 text-micro text-ash">{RATIONALE_FIELD.instruction}</p>
            <textarea
              id={`r1-why-${initiative.id}`}
              value={card.rationale}
              onChange={(e) => onRationale(e.target.value)}
              placeholder={RATIONALE_FIELD.placeholder}
              rows={2}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
            />
          </div>
        </>
      )}

      {/* The clue, from the last check that still matches these answers */}
      {result && (
        <div className="mt-3 space-y-1.5 rounded-lg border border-line bg-canvas p-2.5">
          {result.holds ? (
            <p className="reveal-in text-caption font-semibold text-accent">{CHECK_LABELS.holds}</p>
          ) : (
            <div className="reveal-in space-y-1">
              <p className="text-caption font-semibold text-danger">
                {result.tier === "sharp" ? CHECK_LABELS.wrongTier2 : CHECK_LABELS.wrongTier1}
              </p>
              <p className="rounded-lg border border-line bg-paper px-2.5 py-1.5 text-caption text-ink">
                {result.clue}
              </p>
            </div>
          )}
          {card.checkCount > 0 && <p className="text-micro text-ash">checked {card.checkCount}×</p>}
        </div>
      )}

      <AnswerKey block={initiative.answerKey} />
    </div>
  );
}

function OptionChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={clsx(
        "rounded-full border px-3 py-1.5 text-caption font-semibold transition-colors duration-150",
        on ? "border-accent bg-accentSoft text-accent" : "border-line text-ash hover:border-ash",
      )}
    >
      {label}
    </button>
  );
}

/** Optional closing question for anyone who diagnoses all six — the original two-initiative version. */
function OptionalClosing() {
  const hydrated = useHydrated();
  const setNote = useProgress((s) => s.setNote);
  const value = useProgress((s) => s.notes[R1.closingAll] ?? "");
  return (
    <div id={domId.closingAll} className="scroll-mt-24 rounded-2xl border border-line bg-paper p-5">
      <label htmlFor="r1-closing-all-field" className="block text-caption font-semibold text-ink">
        {CLOSING_ALL_FIELD.label}
      </label>
      <p className="mt-0.5 text-micro text-ash">{CLOSING_ALL_FIELD.instruction}</p>
      <MaterialRefs refs={materialRefs(CLOSING_ALL_FIELD.material)} />
      <textarea
        id="r1-closing-all-field"
        value={hydrated ? value : ""}
        onChange={(e) => setNote(R1.closingAll, e.target.value)}
        placeholder={CLOSING_ALL_FIELD.placeholder}
        rows={3}
        className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
      />
    </div>
  );
}
