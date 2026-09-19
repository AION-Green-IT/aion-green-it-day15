"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { createPlacementHistory, type PlacementMap } from "@/lib/usePlacementHistory";
import { undoRedoKeyHandler } from "@/lib/undoShortcuts";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { UndoRedoControls } from "@/components/ui/UndoRedoControls";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { RadarChart, SeriesSwatch, type RadarAxis, type RadarSeries } from "@/components/ui/RadarChart";
import { Icon } from "@/components/icons/LineIcons";
import {
  ANSWER_KEY_L2,
  CHECK2_LABELS,
  DIMENSIONS,
  FOLLOWUP_FIELDS,
  JUSTIFICATION_FIELD,
  LEVEL_LABEL,
  LEVEL_VALUE,
  OPTION_FACTS,
  OPTION_LINES,
  PHASE1_INSTRUCTION,
  PHASE2_INTRO,
  PRIORITY_FIELD,
  R1,
  RISK_FIELDS,
  RISK_INSTRUCTION,
  TASK2_MATERIAL_REFS,
  materialRefs,
  type DimensionId,
  type Level,
  type OptionId,
} from "@/lib/route1";
import { useRoute1, domId, type OptionAssessment } from "./useRoute1";

const RADAR_AXES: RadarAxis[] = DIMENSIONS.map((d) => ({ key: d.id, label: d.short, full: d.name }));

/**
 * Task 2, in full — "Which line of measures should be prioritised first?"
 * Phase 1 (assess) renders one combined radar from answered Low/Medium/High
 * judgments, never a blind slider (CURRICULUM-GUIDE.md §5: decide first,
 * discover the position second). Phase 2 (decide + justify) never reveals
 * which line is "right" — the check only ever tests whether the standard
 * objection to *whichever* line was picked has been pre-empted (CLAUDE.md §4).
 */
export function PartTwo() {
  const r1 = useRoute1();
  const choose = useProgress((s) => s.choose);
  const setNote = useProgress((s) => s.setNote);

  const [useScoreHistory] = useState(() => createPlacementHistory());
  const past = useScoreHistory((s) => s.past);
  const future = useScoreHistory((s) => s.future);
  const recordChange = useScoreHistory((s) => s.recordChange);
  const doUndo = useScoreHistory((s) => s.undo);
  const doRedo = useScoreHistory((s) => s.redo);

  const [hiddenSeries, setHiddenSeries] = useState<OptionId[]>([]);
  const [checkResultSig, setCheckResultSig] = useState<string | null>(null);

  const currentMap = (): PlacementMap => {
    const map: PlacementMap = {};
    for (const opt of OPTION_LINES) {
      for (const dim of DIMENSIONS) {
        map[`${opt.id}:${dim.id}`] = r1.optionAssessment(opt.id).scores[dim.id];
      }
    }
    return map;
  };

  const applyMap = (map: PlacementMap) => {
    for (const opt of OPTION_LINES) {
      for (const dim of DIMENSIONS) {
        choose(R1.score(opt.id, dim.id), map[`${opt.id}:${dim.id}`] ?? "");
      }
    }
  };

  const score = (optionId: OptionId, dimensionId: DimensionId, level: Level) => {
    if (r1.optionAssessment(optionId).scores[dimensionId] === level) return;
    recordChange(currentMap());
    choose(R1.score(optionId, dimensionId), level);
  };

  const handleUndo = () => {
    const prev = doUndo(currentMap());
    if (prev) applyMap(prev);
  };
  const handleRedo = () => {
    const next = doRedo(currentMap());
    if (next) applyMap(next);
  };

  const toggleSeries = (id: OptionId) =>
    setHiddenSeries((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const radarSeries: RadarSeries[] = OPTION_LINES.filter((o) => !hiddenSeries.includes(o.id)).map((o) => ({
    id: o.id,
    label: `${o.letter} — ${o.title}`,
    values: r1.optionAssessment(o.id).radarValues,
    tone: "option",
    style: o.radarStyle,
  }));

  const strength = (dim: DimensionId, level: Level | null) => (level ? (dim === "risk" ? 4 - LEVEL_VALUE[level] : LEVEL_VALUE[level]) : 0);
  const points = OPTION_LINES.map((o) => {
    const sc = r1.optionAssessment(o.id).scores;
    return { o, total: DIMENSIONS.reduce((n, d) => n + strength(d.id, sc[d.id]), 0), rated: r1.optionAssessment(o.id).scoredCount };
  });
  const allRated = points.every((x) => x.rated === DIMENSIONS.length);
  // The dimension the three lines differ on most, by strength spread.
  const spread = DIMENSIONS.map((d) => {
    const vals = OPTION_LINES.map((o) => strength(d.id, r1.optionAssessment(o.id).scores[d.id]));
    return { d, gap: Math.max(...vals) - Math.min(...vals) };
  }).sort((a, b) => b.gap - a.gap);
  const scoreKey = JSON.stringify(currentMap());
  const changedScore = useLastChange(
    scoreKey,
    (prevKey, nextKey) => {
      const prev = JSON.parse(prevKey) as Record<string, string | null>;
      const next = JSON.parse(nextKey) as Record<string, string | null>;
      const keys = Object.keys(next).filter((k) => prev[k] !== next[k]);
      if (keys.length !== 1) return keys.length > 1 ? "Several scores changed at once (undo, redo or a fill). The points above are up to date." : null;
      const [oid, did] = keys[0].split(":") as [OptionId, DimensionId];
      const dim = DIMENSIONS.find((d) => d.id === did)!;
      const nl = next[keys[0]] as Level | null;
      const pl = prev[keys[0]] as Level | null;
      const claim = nl ? dim.question.options.find((o) => o.level === nl)?.label : null;
      return `Line ${optionLetter(oid)} · ${dim.name}: ${pl ? LEVEL_LABEL[pl] : "not rated"} → ${nl ? LEVEL_LABEL[nl] : "not rated"}.${claim ? ` The claim you are now making: “${claim}.”` : ""} Only score this from what the line itself involves, not from how the technology category feels.`;
    },
    "Rate a dimension and the radar and points update.",
  );

  const runCheck = () => {
    if (!r1.priority) {
      scrollToAndFlash(domId.priority);
      return;
    }
    setNote(R1.checkCount2, String(r1.checkCount2 + 1));
    setCheckResultSig(`${r1.priority}|${r1.justification}|${r1.checkCount2 + 1}`);
  };
  const result = checkResultSig === `${r1.priority}|${r1.justification}|${r1.checkCount2}` ? r1.lastCheck2 : null;

  return (
    <div className="space-y-6">
      {/* Phase 1 — structured assessment */}
      <div
        tabIndex={-1}
        onKeyDown={undoRedoKeyHandler(handleUndo, handleRedo)}
        className="space-y-4 rounded-2xl border border-line bg-canvas p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-micro font-semibold uppercase tracking-wide text-ash">Phase 1 — Assess all three</p>
            <p className="mt-0.5 max-w-prose text-caption text-ash">{PHASE1_INSTRUCTION}</p>
          </div>
          <UndoRedoControls onUndo={handleUndo} onRedo={handleRedo} canUndo={past.length > 0} canRedo={future.length > 0} />
        </div>

        <MaterialRefs refs={materialRefs(TASK2_MATERIAL_REFS)} />

        <div className="space-y-4">
          {OPTION_LINES.map((opt) => (
            <OptionCard key={opt.id} option={opt} assessment={r1.optionAssessment(opt.id)} onScore={score} />
          ))}
        </div>

        {/* Combined, comparable radar */}
        <div className="rounded-xl border border-line bg-paper p-4">
          <p className="text-micro font-semibold uppercase tracking-wide text-ash">
            All three, overlaid — toggle a line to compare
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {OPTION_LINES.map((o) => {
              const hidden = hiddenSeries.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggleSeries(o.id)}
                  aria-pressed={!hidden}
                  className={clsx(
                    "flex items-center gap-2 rounded-full border px-2.5 py-1 text-micro font-semibold transition-colors duration-150",
                    hidden ? "border-line text-ash opacity-50" : "border-accent/30 bg-accentSoft text-ink",
                  )}
                >
                  <SeriesSwatch style={o.radarStyle} />
                  {o.letter}
                </button>
              );
            })}
          </div>
          <RadarChart
            axes={RADAR_AXES}
            series={radarSeries}
            max={3}
            animate
            title="Options A, B and C compared across the seven assessment dimensions"
            className="mt-2 max-w-md"
          />
          <div className="mt-3">
            <LiveReading
              whyLabel="Where the lines differ"
              numbers={<>Strength points (Risk counted in reverse): {points.map((x) => `${x.o.letter} ${x.total}`).join(" · ")} — of 21 each</>}
              why={
                allRated
                  ? `They differ most on ${spread[0].d.name}${spread[1].gap > 0 ? ` and ${spread[1].d.name}` : ""}. Points are only a summary: a line with one strong axis is not automatically weaker than an even one (C7), so use the shape, not the total.`
                  : `Rate all seven dimensions on every line (${points.reduce((n, x) => n + x.rated, 0)} of ${OPTION_LINES.length * DIMENSIONS.length} done) and this reading will say where the lines differ.`
              }
              changed={changedScore}
            />
          </div>
        </div>
      </div>

      {/* Phase 2 — decide and justify */}
      <div className="space-y-4 rounded-2xl border border-line bg-paper p-5">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">Phase 2 — {PHASE2_INTRO.heading}</p>
        <p className="max-w-prose text-caption text-ash">{PHASE2_INTRO.body}</p>

        <div id={domId.priority} className="scroll-mt-24">
          <p className="text-caption font-semibold text-ink">{PRIORITY_FIELD.label}</p>
          <p className="mt-0.5 text-micro text-ash">{PRIORITY_FIELD.instruction}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {OPTION_LINES.map((o) => {
              const on = r1.priority === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => choose(R1.priority, o.id)}
                  aria-pressed={on}
                  className={clsx(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-caption font-semibold transition-colors duration-150",
                    on ? "border-accent bg-accentSoft text-accent" : "border-line text-ink hover:border-ash",
                  )}
                >
                  <Icon name={o.icon} className="h-4 w-4" />
                  {o.letter} — {o.title}
                </button>
              );
            })}
          </div>
        </div>

        <div id={domId.justification} className="scroll-mt-24">
          <label htmlFor="r1-l2-justification-field" className="block text-caption font-semibold text-ink">
            {JUSTIFICATION_FIELD.label}
          </label>
          <p className="mt-0.5 text-micro text-ash">{JUSTIFICATION_FIELD.instruction}</p>
          <textarea
            id="r1-l2-justification-field"
            value={r1.justification}
            onChange={(e) => setNote(R1.justification, e.target.value)}
            placeholder={JUSTIFICATION_FIELD.placeholder}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {FOLLOWUP_FIELDS.map((f, i) => (
            <div key={f.id} id={domId.followUp(i)} className="scroll-mt-24">
              <label htmlFor={`r1-l2-followup-input-${i}`} className="block text-caption font-semibold text-ink">
                {f.label}
              </label>
              <p className="mt-0.5 text-micro text-ash">{f.instruction}</p>
              <input
                id={`r1-l2-followup-input-${i}`}
                type="text"
                value={r1.followUps[i]}
                onChange={(e) => setNote(R1.followUp(i), e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
              />
            </div>
          ))}
        </div>

        <div id={domId.risks} className="scroll-mt-24">
          <p className="text-caption font-semibold text-ink">Two risks of an attractive-but-weak pick</p>
          <p className="mt-0.5 text-micro text-ash">{RISK_INSTRUCTION}</p>
          <MaterialRefs refs={materialRefs(["attractiveWeak"])} />
          <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
            {RISK_FIELDS.map((r, i) => (
              <div key={r.id}>
                <label htmlFor={`r1-l2-risk-${i}`} className="block text-micro font-semibold text-ash">
                  {r.label}
                </label>
                <textarea
                  id={`r1-l2-risk-${i}`}
                  value={r1.risks[i]}
                  onChange={(e) => setNote(R1.risk(i), e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-caption text-ink"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Check my reasoning — never names the "right" line */}
        <div className="space-y-1.5 rounded-lg border border-line bg-canvas p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={runCheck}
              className="rounded-lg border border-line bg-paper px-3 py-1.5 text-caption font-semibold text-ink transition-colors duration-150 hover:border-ash"
            >
              {r1.checkCount2 > 0 ? CHECK2_LABELS.recheck : CHECK2_LABELS.check}
            </button>
            {!r1.priority && <span className="text-micro text-ash">Pick a priority line first.</span>}
            {r1.checkCount2 > 0 && <span className="text-micro text-ash">checked {r1.checkCount2}×</span>}
          </div>
          {result?.holds && <p className="reveal-in text-caption font-semibold text-accent">{CHECK2_LABELS.holds}</p>}
          {result && !result.holds && (
            <div className="reveal-in space-y-1">
              <p className="text-caption font-semibold text-danger">
                {result.reason === "dimensions"
                  ? CHECK2_LABELS.needsDimensions
                  : result.tier === "sharp"
                    ? CHECK2_LABELS.wrongTier2
                    : CHECK2_LABELS.wrongTier1}
              </p>
              <p className="rounded-lg border border-line bg-paper px-2.5 py-1.5 text-caption text-ink">{result.clue}</p>
            </div>
          )}
        </div>

        <AnswerKey block={ANSWER_KEY_L2} />
      </div>
    </div>
  );
}

function OptionCard({
  option,
  assessment,
  onScore,
}: {
  option: (typeof OPTION_LINES)[number];
  assessment: OptionAssessment;
  onScore: (optionId: OptionId, dimensionId: DimensionId, level: Level) => void;
}) {
  return (
    <div id={domId.optionCard(option.id)} className="scroll-mt-24 rounded-xl border border-line bg-paper p-4">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accentSoft text-accent">
          <Icon name={option.icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-micro font-semibold uppercase tracking-wide text-ash">
            Line {option.letter} · {assessment.scoredCount}/7 rated
          </p>
          <h4 className="text-h3 text-ink">{option.title}</h4>
          <p className="mt-0.5 max-w-prose text-caption text-ash">{option.description}</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-line bg-canvas p-2.5">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">What it involves</p>
        <ul className="mt-1 space-y-0.5">
          {OPTION_FACTS[option.id].involves.map((f) => (
            <li key={f} className="flex gap-2 text-micro text-ink">
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-ash" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {DIMENSIONS.map((dim) => {
          const level = assessment.scores[dim.id];
          return (
            <div key={dim.id} id={domId.optionScore(option.id, dim.id)} className="scroll-mt-24 rounded-lg border border-line bg-canvas p-2.5">
              <p className="text-micro font-semibold text-ink">{dim.name}</p>
              <p className="mt-0.5 text-micro text-ash">{dim.question.label}</p>
              <p className="mt-1 text-micro text-ink">
                <span className="font-semibold">Fact: </span>
                {OPTION_FACTS[option.id].byDimension[dim.id]}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {dim.question.options.map((o) => {
                  const on = level === o.level;
                  return (
                    <button
                      key={o.level}
                      type="button"
                      title={o.label}
                      onClick={() => onScore(option.id, dim.id, o.level)}
                      aria-pressed={on}
                      className={clsx(
                        "rounded-full border px-2 py-0.5 text-micro font-semibold transition-colors duration-150",
                        on ? "border-accent bg-accentSoft text-accent" : "border-line text-ash hover:border-ash",
                      )}
                    >
                      {o.level === "low" ? "Low" : o.level === "medium" ? "Medium" : "High"}
                    </button>
                  );
                })}
              </div>
              {level && (
                <p className="mt-1 text-micro text-ash">
                  <span className="font-semibold text-ink">{LEVEL_LABEL[level]} means: </span>
                  {dim.question.options.find((o) => o.level === level)?.label}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const optionLetter = (id: OptionId): string => OPTION_LINES.find((o) => o.id === id)!.letter;
