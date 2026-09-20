"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { createPlacementHistory, type PlacementMap } from "@/lib/usePlacementHistory";
import { undoRedoKeyHandler } from "@/lib/undoShortcuts";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { UndoRedoControls } from "@/components/ui/UndoRedoControls";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { ReadMore } from "@/components/ui/ReadMore";
import { OptionalBlock } from "@/components/ui/OptionalBlock";
import { DragHandle } from "@/components/icons/LineIcons";
import {
  ANSWER_KEY_HORIZONS,
  ANSWER_KEY_L3,
  BANDS_KEY,
  CANDIDATE_MEASURES,
  CRITERIA,
  FIRST_MEASURE_FACTS,
  LOOP_STAGES,
  CHECK3_LABELS,
  ELEMENT_1,
  ELEMENT_3,
  ELEMENT_4,
  ELEMENT_5_WHY,
  ELEMENT_6,
  ELEMENT_7,
  FIRST_MEASURE_FIELD,
  FIRST_MEASURE_OPTIONS,
  GUIDING_DECISIONS_LABEL,
  GUIDING_DECISION_FIELDS,
  HORIZONS,
  R2,
  TASK3_MATERIAL_REFS,
  materialRefs,
  type FirstMeasureId,
  type Horizon,
} from "@/lib/route2";
import { useRoute2, domId } from "./useRoute2";

/**
 * Stage 2 — the guided proposal. Fields on the left, the assembling document
 * beside it (ReportPanel). The first-measure selector never reveals a model
 * answer directly in its own UI — the clue only surfaces through "Check my
 * proposal," same as element 3's criteria-coverage and the horizon
 * classifier's band-uniformity check (CLAUDE.md §4).
 */
export function ProposalBuilder() {
  const r2 = useRoute2();
  const choose = useProgress((s) => s.choose);
  const setNote = useProgress((s) => s.setNote);

  const [checkResultSig, setCheckResultSig] = useState<string | null>(null);
  // Everything the check judges. The verdict disappears the moment any of it changes.
  const inputSig = JSON.stringify([
    r2.groups.map((g) => g.join("+")),
    r2.firstMeasure,
    r2.element3,
    r2.element4,
    r2.element5Why,
    r2.element6,
    r2.horizons,
    r2.elementsComplete,
  ]);
  const signature = `${inputSig}|${r2.checkCount}`;
  const result = checkResultSig === signature ? r2.lastCheck : null;

  const runCheck = () => {
    setNote(R2.checkCount, String(r2.checkCount + 1));
    setCheckResultSig(`${inputSig}|${r2.checkCount + 1}`);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-accent/25 bg-accentSoft/50 px-3 py-2">
        <p className="text-caption font-semibold text-accent">Grading lens: a robust decision architecture, not a collection of ideas.</p>
      </div>

      <div id={domId.element1} className="scroll-mt-24">
        <label htmlFor="r2-element1-field" className="block text-caption font-semibold text-ink">
          {ELEMENT_1.label}
        </label>
        <p className="mt-0.5 text-micro text-ash">{ELEMENT_1.instruction}</p>
        <MaterialRefs refs={materialRefs(ELEMENT_1.material)} />
        <textarea
          id="r2-element1-field"
          value={r2.element1}
          onChange={(e) => setNote(R2.element1, e.target.value)}
          placeholder={ELEMENT_1.placeholder}
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
        />
      </div>

      <div id={domId.element3} className="scroll-mt-24">
        <label htmlFor="r2-element3-field" className="block text-caption font-semibold text-ink">
          {ELEMENT_3.label}
        </label>
        <p className="mt-0.5 text-micro text-ash">{ELEMENT_3.instruction}</p>
        <MaterialRefs refs={materialRefs(ELEMENT_3.material)} />
        <ReadMore className="mt-1.5" label="Criteria key" hint="the four criteria: what each asks">
          <ul className="space-y-1">
            {CRITERIA.map((c) => (
              <li key={c.id} className="text-micro text-ink">
                <span className="font-semibold capitalize">{c.label} — </span>
                {c.asks}
              </li>
            ))}
          </ul>
        </ReadMore>
        <textarea
          id="r2-element3-field"
          value={r2.element3}
          onChange={(e) => setNote(R2.element3, e.target.value)}
          placeholder={ELEMENT_3.placeholder}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
        />
      </div>

      {/* First-measure selector + element 5 */}
      <div id={domId.firstMeasure} className="scroll-mt-24 rounded-xl border border-line bg-canvas p-4">
        <p className="text-caption font-semibold text-ink">{FIRST_MEASURE_FIELD.label}</p>
        <p className="mt-0.5 text-micro text-ash">{FIRST_MEASURE_FIELD.instruction}</p>
        <MaterialRefs refs={materialRefs(["architecture", "assessmentLogic"])} />
        <div className="mt-1.5 flex flex-wrap gap-2">
          {FIRST_MEASURE_OPTIONS.map((o) => {
            const on = r2.firstMeasure === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(R2.firstMeasure, o.id)}
                aria-pressed={on}
                className={clsx(
                  "rounded-xl border px-3 py-2 text-caption font-semibold transition-colors duration-150",
                  on ? "border-accent bg-accentSoft text-accent" : "border-line bg-paper text-ink hover:border-ash",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        <ul className="mt-2 space-y-0.5">
          {FIRST_MEASURE_OPTIONS.map((o) => (
            <li key={o.id} className="text-micro text-ash">
              <span className="font-semibold text-ink">{o.label}: </span>
              {FIRST_MEASURE_FACTS[o.id]}
            </li>
          ))}
        </ul>

        <div id={domId.element5Why} className="mt-3 scroll-mt-24">
          <label htmlFor="r2-element5-field" className="block text-caption font-semibold text-ink">
            {ELEMENT_5_WHY.label}
          </label>
          <p className="mt-0.5 text-micro text-ash">{ELEMENT_5_WHY.instruction}</p>
          <MaterialRefs refs={materialRefs(ELEMENT_5_WHY.material)} />
          <textarea
            id="r2-element5-field"
            value={r2.element5Why}
            onChange={(e) => setNote(R2.element5Why, e.target.value)}
            placeholder={ELEMENT_5_WHY.placeholder}
            rows={2}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
          />
        </div>
      </div>

      {/* Optional — the rest of the seven-element proposal and the horizon classifier, kept in full */}
      <OptionalBlock
        id="r2-extend"
        title="extend the proposal (elements 2, 4, 6, 7 and the horizon classifier)"
        minutes={15}
        hasData={r2.optionalTouched}
      >
      <div>
        <p className="text-caption font-semibold text-ink">{GUIDING_DECISIONS_LABEL}</p>
        <MaterialRefs refs={materialRefs(["governance", "horizons"])} />
        <div className="mt-1.5 grid gap-3 sm:grid-cols-3">
          {GUIDING_DECISION_FIELDS.map((f, i) => (
            <div key={f.id} id={domId.guiding(i)} className="scroll-mt-24">
              <label htmlFor={`r2-guiding-input-${i}`} className="block text-micro font-semibold text-ash">
                {f.label}
              </label>
              <p className="mt-0.5 text-micro text-ash">{f.instruction}</p>
              <input
                id={`r2-guiding-input-${i}`}
                type="text"
                value={r2.guidingDecisions[i]}
                onChange={(e) => setNote(R2.guidingDecision(i), e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
              />
            </div>
          ))}
        </div>
      </div>

      <div id={domId.element4} className="scroll-mt-24">
        <label htmlFor="r2-element4-field" className="block text-caption font-semibold text-ink">
          {ELEMENT_4.label}
        </label>
        <p className="mt-0.5 text-micro text-ash">{ELEMENT_4.instruction}</p>
        <MaterialRefs refs={materialRefs(ELEMENT_4.material)} />
        <textarea
          id="r2-element4-field"
          value={r2.element4}
          onChange={(e) => setNote(R2.element4, e.target.value)}
          placeholder={ELEMENT_4.placeholder}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
        />
      </div>

      <div id={domId.element6} className="scroll-mt-24">
        <label htmlFor="r2-element6-field" className="block text-caption font-semibold text-ink">
          {ELEMENT_6.label}
        </label>
        <p className="mt-0.5 text-micro text-ash">{ELEMENT_6.instruction}</p>
        <MaterialRefs refs={materialRefs(ELEMENT_6.material)} />
        <ReadMore className="mt-1.5" label="Stage key" hint="the four loop stages: who plays each, what it asks">
          <ul className="space-y-1">
            {LOOP_STAGES.map((st) => (
              <li key={st.id} className="text-micro text-ink">
                <span className="font-semibold capitalize">{st.label} — {st.role}. </span>
                It asks: {st.asks}
              </li>
            ))}
          </ul>
        </ReadMore>
        <textarea
          id="r2-element6-field"
          value={r2.element6}
          onChange={(e) => setNote(R2.element6, e.target.value)}
          placeholder={ELEMENT_6.placeholder}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
        />
      </div>

      <div id={domId.element7} className="scroll-mt-24">
        <label htmlFor="r2-element7-field" className="block text-caption font-semibold text-ink">
          {ELEMENT_7.label}
        </label>
        <p className="mt-0.5 text-micro text-ash">{ELEMENT_7.instruction}</p>
        <MaterialRefs refs={materialRefs(ELEMENT_7.material)} />
        <textarea
          id="r2-element7-field"
          value={r2.element7}
          onChange={(e) => setNote(R2.element7, e.target.value)}
          placeholder={ELEMENT_7.placeholder}
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
        />
      </div>

        <HorizonClassifier />
      </OptionalBlock>

      {/* Check my proposal — never names the model recommendation */}
      <div className="space-y-1.5 rounded-lg border border-line bg-canvas p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={runCheck}
            className="rounded-lg border border-line bg-paper px-3 py-1.5 text-caption font-semibold text-ink transition-colors duration-150 hover:border-ash"
          >
            {r2.checkCount > 0 ? CHECK3_LABELS.recheck : CHECK3_LABELS.check}
          </button>
          {r2.checkCount > 0 && <span className="text-micro text-ash">checked {r2.checkCount}×</span>}
        </div>
        {result && (
          <div className="reveal-in space-y-1.5" aria-live="polite">
            <p className={result.holds ? "text-caption font-semibold text-accent" : "text-caption font-semibold text-danger"}>
              {result.holds ? "✓ " + CHECK3_LABELS.holds : "✕ " + (result.tier === "sharp" ? CHECK3_LABELS.wrongTier2 : CHECK3_LABELS.wrongTier1)}
            </p>
            <ul className="space-y-1">
              {result.rows.map((row) => (
                <li key={row.area} className="text-caption text-ink">
                  <span className={row.ok ? "font-semibold text-accent" : "font-semibold text-danger"}>{row.ok ? "✓" : "✕"} </span>
                  <span className="font-semibold">{row.label}</span>
                  {row.clue ? <span className="mt-0.5 block rounded-lg border border-line bg-paper px-2.5 py-1.5 text-caption text-ink">{row.clue}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <AnswerKey block={ANSWER_KEY_L3} />
      <AnswerKey block={ANSWER_KEY_HORIZONS} />
    </div>
  );
}

/** The horizon classifier — reinforces D4, undo/redo on every placement. */
function HorizonClassifier() {
  const r2 = useRoute2();
  const choose = useProgress((s) => s.choose);

  const [useHorizonHistory] = useState(() => createPlacementHistory());
  const past = useHorizonHistory((s) => s.past);
  const future = useHorizonHistory((s) => s.future);
  const recordChange = useHorizonHistory((s) => s.recordChange);
  const doUndo = useHorizonHistory((s) => s.undo);
  const doRedo = useHorizonHistory((s) => s.redo);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overBand, setOverBand] = useState<Horizon | "pool" | null>(null);

  const currentMap = (): PlacementMap => {
    const map: PlacementMap = {};
    for (const m of CANDIDATE_MEASURES) map[m.id] = r2.horizons[m.id];
    return map;
  };
  const applyMap = (map: PlacementMap) => {
    for (const m of CANDIDATE_MEASURES) choose(R2.horizon(m.id), map[m.id] ?? "");
  };

  const place = (measureId: string, band: Horizon | null) => {
    if (r2.horizons[measureId] === band) return;
    recordChange(currentMap());
    choose(R2.horizon(measureId), band ?? "");
  };
  const handleUndo = () => {
    const prev = doUndo(currentMap());
    if (prev) applyMap(prev);
  };
  const handleRedo = () => {
    const next = doRedo(currentMap());
    if (next) applyMap(next);
  };

  const startDrag = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };
  const endDrag = () => setDraggingId(null);
  const dropOn = (band: Horizon | null) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setOverBand(null);
    if (id) place(id, band);
  };
  const tapPlace = (band: Horizon | null) => () => {
    if (!selectedId) return;
    place(selectedId, band);
    setSelectedId(null);
  };

  const unplaced = CANDIDATE_MEASURES.filter((m) => !r2.horizons[m.id]);

  return (
    <div
      id={domId.horizonBoard}
      tabIndex={-1}
      onKeyDown={undoRedoKeyHandler(handleUndo, handleRedo)}
      className="scroll-mt-24 space-y-3 rounded-xl border border-line bg-canvas p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-caption font-semibold text-ink">Classify NovaCircular's candidate measures</p>
          <p className="mt-0.5 text-micro text-ash">Drag each measure into Short / Medium / Structural (D4) — or tap one, then tap a band.</p>
          <MaterialRefs refs={materialRefs(["horizons"])} />
        </div>
        <UndoRedoControls onUndo={handleUndo} onRedo={handleRedo} canUndo={past.length > 0} canRedo={future.length > 0} />
      </div>

      <ul className="grid gap-1.5 sm:grid-cols-3">
        {BANDS_KEY.map((b) => (
          <li key={b.id} className="rounded-lg border border-line bg-paper p-2 text-micro text-ink">
            <span className="font-semibold">{b.label}: </span>
            {b.produces}. <span className="text-ash">Ask: {b.ask}</span>
          </li>
        ))}
      </ul>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOverBand("pool");
        }}
        onDragLeave={() => setOverBand((cur) => (cur === "pool" ? null : cur))}
        onDrop={dropOn(null)}
        onClick={tapPlace(null)}
        className={clsx(
          "rounded-xl border border-dashed p-3 transition-colors duration-150",
          overBand === "pool" ? "is-drop-target" : "border-line bg-paper",
          selectedId && "cursor-pointer",
        )}
      >
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">Unclassified</p>
        {unplaced.length === 0 ? (
          <p className="mt-1.5 text-micro italic text-ash">All six classified. Drag one back here, or tap it and tap here, to reclassify.</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-2">
            {unplaced.map((m) => (
              <div
                key={m.id}
                id={domId.horizonItem(m.id)}
                draggable
                role="button"
                tabIndex={0}
                onDragStart={(e) => startDrag(e, m.id)}
                onDragEnd={endDrag}
                aria-pressed={selectedId === m.id}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedId((cur) => (cur === m.id ? null : m.id));
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId((cur) => (cur === m.id ? null : m.id));
                }}
                className={clsx(
                  "flex max-w-xs cursor-grab items-start gap-1.5 rounded-lg border p-2 text-left transition-colors duration-150",
                  draggingId === m.id && "is-dragging",
                  selectedId === m.id ? "border-accent bg-accentSoft ring-2 ring-accent/30" : "border-line bg-canvas hover:border-ash",
                )}
              >
                <DragHandle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ash" />
                <span className="text-micro text-ink">{m.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {HORIZONS.map((band) => {
          const placed = CANDIDATE_MEASURES.filter((m) => r2.horizons[m.id] === band.id);
          return (
            <div
              key={band.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverBand(band.id);
              }}
              onDragLeave={() => setOverBand((cur) => (cur === band.id ? null : cur))}
              onDrop={dropOn(band.id)}
              onClick={selectedId ? tapPlace(band.id) : undefined}
              className={clsx(
                "rounded-xl border bg-paper p-2.5 transition-colors duration-150",
                overBand === band.id && "is-drop-target",
                selectedId && "cursor-pointer",
              )}
            >
              <p className="text-micro font-semibold text-ink">{band.label}</p>
              {placed.length === 0 ? (
                <p className="mt-1.5 rounded-lg border border-dashed border-line bg-canvas px-2 py-1.5 text-[11px] italic text-ash">Drop here.</p>
              ) : (
                <div className="mt-1.5 space-y-1.5">
                  {placed.map((m) => (
                    <div
                      key={m.id}
                      id={domId.horizonItem(m.id)}
                      draggable
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedId === m.id}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedId((cur) => (cur === m.id ? null : m.id));
                        }
                      }}
                      onDragStart={(e) => startDrag(e, m.id)}
                      onDragEnd={endDrag}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId((cur) => (cur === m.id ? null : m.id));
                      }}
                      className={clsx(
                        "cursor-grab rounded-lg border p-1.5 text-[11px] text-ink transition-colors duration-150",
                        draggingId === m.id && "is-dragging",
                        selectedId === m.id ? "border-accent bg-accentSoft" : "border-line bg-canvas",
                      )}
                    >
                      {m.text}
                    </div>
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
