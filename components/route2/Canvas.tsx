"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { createPlacementHistory, type PlacementMap } from "@/lib/usePlacementHistory";
import { undoRedoKeyHandler } from "@/lib/undoShortcuts";
import { UndoRedoControls } from "@/components/ui/UndoRedoControls";
import { Icon } from "@/components/icons/LineIcons";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { LiveReading, useLastChange } from "@/components/ui/LiveReading";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { ANSWER_KEY_CANVAS, BLOCKS, CANVAS_INSTRUCTION, R2, blockById, blockGroups, connectionKey, materialRefs, type BlockId } from "@/lib/route2";
import { useRoute2, domId } from "./useRoute2";

const VIEW_W = 360;
const VIEW_H = 300;

function allPairs(): [BlockId, BlockId][] {
  const pairs: [BlockId, BlockId][] = [];
  for (let i = 0; i < BLOCKS.length; i++) {
    for (let j = i + 1; j < BLOCKS.length; j++) pairs.push([BLOCKS[i].id, BLOCKS[j].id]);
  }
  return pairs;
}
const ALL_PAIRS = allPairs();

/**
 * Stage 1 — the decision-architecture canvas. Six fixed blocks; the learner
 * draws connections between them (native HTML5 drag, plus tap-to-select as
 * the accessible fallback — CLAUDE.md §9). The blocks never move; only the
 * edge set is user-controlled, so undo/redo covers the connection history,
 * mirroring the placement-history pattern from Route 1's boards.
 *
 * The orphan hint below is live, not check-gated (CLAUDE.md §12): a
 * disconnected block is exactly the scattered-initiative pattern D1 warns
 * about, and it also gates export via the missing list.
 */
export function Canvas() {
  const r2 = useRoute2();
  const toggleCheck = useProgress((s) => s.toggleCheck);

  const [useConnHistory] = useState(() => createPlacementHistory());
  const past = useConnHistory((s) => s.past);
  const future = useConnHistory((s) => s.future);
  const recordChange = useConnHistory((s) => s.recordChange);
  const doUndo = useConnHistory((s) => s.undo);
  const doRedo = useConnHistory((s) => s.redo);

  const [selectedId, setSelectedId] = useState<BlockId | null>(null);
  const [draggingId, setDraggingId] = useState<BlockId | null>(null);
  const [hoverId, setHoverId] = useState<BlockId | null>(null);

  const connKey = r2.connections.map(([a, b]) => connectionKey(a, b)).sort().join(",");
  const changed = useLastChange(
    connKey,
    (prev, next) => {
      const before = prev ? prev.split(",") : [];
      const after = next ? next.split(",") : [];
      const added = after.filter((k) => !before.includes(k));
      const removed = before.filter((k) => !after.includes(k));
      const groupsOf = (keys: string[]) => blockGroups(keys.map((k) => k.split(":") as [BlockId, BlockId])).length;
      const g0 = groupsOf(before);
      const g1 = groupsOf(after);
      const label = (k: string) => k.split(":").map((id) => blockById(id as BlockId).label).join(" ↔ ");
      if (added.length === 1 && removed.length === 0) {
        return `${label(added[0])} connected. Separate groups: ${g0} → ${g1}. ${g1 < g0 ? "Two clusters just became one — that is what routing everything through the same logic looks like." : "It strengthens a group that was already joined; it does not yet join anything new."}`;
      }
      if (removed.length === 1 && added.length === 0) {
        return `${label(removed[0])} removed. Separate groups: ${g0} → ${g1}. ${g1 > g0 ? "That link was the only thing joining two clusters." : "The blocks are still joined some other way."}`;
      }
      return `Several links changed at once (undo or redo). Separate groups: ${g0} → ${g1}.`;
    },
    "Draw a link between two blocks to see what it joins.",
  );
  const selectedBlock = selectedId ? blockById(selectedId) : null;

  const currentMap = (): PlacementMap => {
    const map: PlacementMap = {};
    for (const [a, b] of ALL_PAIRS) map[connectionKey(a, b)] = r2.isConnected(a, b) ? "1" : null;
    return map;
  };
  const applyMap = (map: PlacementMap) => {
    for (const [a, b] of ALL_PAIRS) toggleCheck(R2.connection(connectionKey(a, b)), !!map[connectionKey(a, b)]);
  };

  const toggleConnection = (a: BlockId, b: BlockId) => {
    if (a === b) return;
    recordChange(currentMap());
    toggleCheck(R2.connection(connectionKey(a, b)), !r2.isConnected(a, b));
  };

  const handleUndo = () => {
    const prev = doUndo(currentMap());
    if (prev) applyMap(prev);
  };
  const handleRedo = () => {
    const next = doRedo(currentMap());
    if (next) applyMap(next);
  };

  const startDrag = (e: React.DragEvent, id: BlockId) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "link";
    setDraggingId(id);
  };
  const endDrag = () => {
    setDraggingId(null);
    setHoverId(null);
  };
  const dropOn = (target: BlockId) => (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") as BlockId;
    setHoverId(null);
    if (sourceId) toggleConnection(sourceId, target);
  };

  const tapBlock = (id: BlockId) => {
    if (!selectedId) {
      setSelectedId(id);
      return;
    }
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }
    toggleConnection(selectedId, id);
    setSelectedId(null);
  };

  return (
    <div
      id={domId.canvas}
      tabIndex={-1}
      onKeyDown={undoRedoKeyHandler(handleUndo, handleRedo)}
      className="scroll-mt-24 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-micro text-ash">
          <span className="font-semibold tabular-nums text-ink">{r2.connections.length}</span> connection
          {r2.connections.length === 1 ? "" : "s"} · <span className="font-semibold tabular-nums text-ink">{r2.orphanedBlocks.length}</span> orphaned
        </p>
        <UndoRedoControls onUndo={handleUndo} onRedo={handleRedo} canUndo={past.length > 0} canRedo={future.length > 0} />
      </div>
      <p className="max-w-prose text-caption text-ash">{CANVAS_INSTRUCTION}</p>
      <MaterialRefs refs={materialRefs(["architecture"])} />

      <div className="relative w-full rounded-2xl border border-line bg-canvas p-2" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="pointer-events-none absolute inset-0 h-full w-full">
          {r2.connections.map(([a, b]) => {
            const pa = BLOCKS.find((x) => x.id === a)!.pos;
            const pb = BLOCKS.find((x) => x.id === b)!.pos;
            return <line key={connectionKey(a, b)} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="currentColor" className="text-accent" strokeWidth="2" strokeLinecap="round" />;
          })}
        </svg>

        {BLOCKS.map((block) => {
          const leftPct = (block.pos.x / VIEW_W) * 100;
          const topPct = (block.pos.y / VIEW_H) * 100;
          const orphaned = r2.degree(block.id) === 0;
          const selected = selectedId === block.id;
          const isHoverTarget = hoverId === block.id && draggingId !== block.id;
          return (
            <button
              key={block.id}
              id={domId.blockNode(block.id)}
              type="button"
              draggable
              onDragStart={(e) => startDrag(e, block.id)}
              onDragEnd={endDrag}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggingId && draggingId !== block.id) setHoverId(block.id);
              }}
              onDragLeave={() => setHoverId((cur) => (cur === block.id ? null : cur))}
              onDrop={dropOn(block.id)}
              onClick={() => tapBlock(block.id)}
              aria-pressed={selected}
              className={clsx(
                "absolute flex w-28 -translate-x-1/2 -translate-y-1/2 cursor-grab flex-col items-center gap-1 rounded-xl border p-2 text-center shadow-sm transition-colors duration-150",
                draggingId === block.id && "is-dragging",
                isHoverTarget && "is-drop-target",
                selected
                  ? "border-accent bg-accentSoft ring-2 ring-accent/30"
                  : orphaned
                    ? "border-dashed border-danger/40 bg-paper"
                    : "border-line bg-paper hover:border-ash",
              )}
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              <Icon name={block.icon} className={clsx("h-5 w-5", selected ? "text-accent" : orphaned ? "text-danger" : "text-ink")} />
              <span className="text-micro font-semibold leading-tight text-ink">{block.label}</span>
              {orphaned && <span className="text-[10px] font-semibold text-danger">not connected</span>}
            </button>
          );
        })}
      </div>

      <p className="min-h-[2.5rem] rounded-lg border border-line bg-paper px-3 py-2 text-caption text-ink">
        {selectedBlock ? (
          <>
            <span className="font-semibold">{selectedBlock.label}: </span>
            {selectedBlock.note} Tap another block to link them.
          </>
        ) : (
          <span className="text-ash">Tap a block to read what it is, then tap a second to link them.</span>
        )}
      </p>

      <LiveReading
        tone={r2.groups.length === 1 ? "good" : "neutral"}
        whyLabel="Where the canvas stands"
        numbers={
          <>
            {r2.connections.length} connection{r2.connections.length === 1 ? "" : "s"} · {r2.groups.length} separate group{r2.groups.length === 1 ? "" : "s"} · {r2.orphanedBlocks.length} orphaned
          </>
        }
        why={
          r2.groups.length === 1
            ? "All six blocks form one architecture: an initiative entering through any block meets the same logic, which is what D1 asks for."
            : r2.orphanedBlocks.length > 0
              ? `${r2.orphanedBlocks.length === 1 ? "One block isn't" : `${r2.orphanedBlocks.length} blocks aren't`} connected to anything (${r2.orphanedBlocks.map((b) => b.label).join(", ")}) — a disconnected block is exactly the scattered-initiative pattern from D1.`
              : `Every block has a link, but they form ${r2.groups.length} separate groups. A framework that routes only some blocks is not integrated (D1) — it has to route the whole portfolio.`
        }
        changed={changed}
      />
      <AnswerKey block={ANSWER_KEY_CANVAS} />
    </div>
  );
}
