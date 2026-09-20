import {
  DIMENSIONS,
  ENGAGEMENT,
  EXPORT,
  FOLLOWUP_FIELDS,
  LEVEL_LABEL,
  OPTION_LINES,
  RISK_FIELDS,
  ZONES,
  answerLabel,
  lensLabel,
  optionById,
} from "@/lib/route1";
import { CASE } from "@/lib/routes";
import type { Route1State } from "./useRoute1";

/**
 * The route's single export: one print-ready HTML report sent straight to the
 * browser's print dialog — "Save as PDF" is the export (see lib/downloadFile.ts
 * `printHtmlDocument`). No JSON, no PDF library. One top-level block per level
 * (CLAUDE.md §12) — Part 1 grouped by zone, Part 2 by option line — so each
 * stays separately gradable out of the one file.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildEngagementHtml(r1: Route1State): string {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const zoneSections = ZONES.map((zone) => {
    const cards = r1.byZone(zone.id);
    const rows = cards
      .map(
        (c) => `<tr>
      <td><strong>${c.initiative.n}. ${esc(c.initiative.short)}</strong><div class="muted">${esc(
        c.initiative.title,
      )}</div></td>
      <td class="nowrap">${esc(answerLabel(c.load))}</td>
      <td class="nowrap">${esc(answerLabel(c.structure))}</td>
      <td class="nowrap">${esc(lensLabel(c.lens))}</td>
    </tr>${
      c.rationale
        ? `<tr class="why"><td colspan="4"><span class="muted">Rationale — </span>&ldquo;${esc(c.rationale)}&rdquo;</td></tr>`
        : ""
    }`,
      )
      .join("");

    return `<h2>${esc(zone.name)} — ${cards.length}</h2>
  ${
    cards.length
      ? `<table>
    <thead><tr><th>Initiative</th><th>Load</th><th>Structure</th><th>Lens</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`
      : `<p class="muted">Nothing resolved into this zone.</p>`
  }`;
  }).join("\n");

  const optionSections = OPTION_LINES.map((opt) => {
    const a = r1.optionAssessment(opt.id);
    const rows = DIMENSIONS.map(
      (d) => `<tr><td>${esc(d.name)}</td><td class="nowrap">${a.scores[d.id] ? esc(LEVEL_LABEL[a.scores[d.id]!]) : "—"}</td></tr>`,
    ).join("");
    return `<h3>Line ${esc(opt.letter)} — ${esc(opt.title)}</h3>
  <table>
    <thead><tr><th>Dimension</th><th>Level</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
  }).join("\n");

  const followUpRows = FOLLOWUP_FIELDS.map((f, i) => `<li>${esc(r1.followUps[i] || "—")}</li>`).join("");
  const riskRows = RISK_FIELDS.map((r, i) => `<li>${esc(r1.risks[i] || "—")}</li>`).join("");

  const part2Html = r1.part2Touched
    ? `  <h2>Part 2 — Decide (optional)</h2>
  ${optionSections}

  <h3>Priority pick</h3>
  <p>${r1.priority ? `<strong>Line ${esc(optionById(r1.priority).letter)} — ${esc(optionById(r1.priority).title)}</strong>` : "<em>Not yet picked</em>"}</p>

  <h3>Justification</h3>
  <p>${r1.justification ? `&ldquo;${esc(r1.justification)}&rdquo;` : "<em>Not yet written</em>"}</p>

  <h3>Follow-up decisions</h3>
  <ol>${followUpRows}</ol>

  <h3>Two risks of an attractive-but-weak pick</h3>
  <ul class="plain">${riskRows}</ul>

  <div class="summary">
    <strong>${r1.options.filter((o) => o.fullyScored).length} of 3 lines fully assessed across all seven dimensions.</strong>
  </div>`
    : `<p class="muted">Optional Level 2 (Decide) was not attempted.</p>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(EXPORT.docHeading)} — ${esc(r1.name.trim() || "learner")}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 24px; background: #F5F6F7; color: #16191D;
         font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; font-size: 15px; line-height: 1.6; }
  .sheet { max-width: 860px; margin: 0 auto; background: #fff; border: 1px solid #E2E5E9;
           border-radius: 16px; padding: 40px; }
  .kicker { margin: 0 0 4px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
            font-weight: 700; color: #0E7A5A; }
  h1 { margin: 0 0 4px; font-size: 27px; line-height: 1.2; }
  h2 { margin: 24px 0 10px; font-size: 13px; letter-spacing: .06em; text-transform: uppercase;
       color: #5E6670; border-top: 1px solid #E2E5E9; padding-top: 16px; }
  h3 { margin: 18px 0 4px; font-size: 14px; color: #16191D; }
  ol, ul.plain { margin: 6px 0 0; padding-left: 20px; font-size: 13px; }
  .meta { margin: 0; color: #5E6670; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
  th { text-align: left; font-size: 11px; letter-spacing: .05em; text-transform: uppercase;
       color: #5E6670; border-bottom: 1px solid #E2E5E9; padding: 8px 10px 8px 0; font-weight: 700; }
  td { vertical-align: top; padding: 9px 10px 9px 0; border-bottom: 1px solid #EEF1F3; }
  tr.why td { padding-top: 0; border-bottom: 1px solid #EEF1F3; font-style: italic; }
  .muted { color: #5E6670; font-size: 12px; font-style: normal; }
  .nowrap { white-space: nowrap; }
  .summary { margin-top: 10px; padding: 14px 16px; border-radius: 10px; background: #EEF1F3; }
  .summary strong { display: block; font-size: 16px; }
  .closing { margin-top: 10px; padding: 14px 16px; border-radius: 10px; border: 1px solid #E2E5E9; font-style: italic; }
  footer { margin-top: 32px; border-top: 1px solid #E2E5E9; padding-top: 14px;
           color: #5E6670; font-size: 11px; }
  @media (max-width: 560px) {
    body { padding: 12px 8px; }
    .sheet { padding: 18px 14px; border-radius: 12px; }
  }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: 0; border-radius: 0; padding: 0; max-width: none; }
    table { break-inside: avoid; }
    @page { margin: 16mm; }
  }
</style>
</head>
<body>
<div class="sheet">
  <p class="kicker">AION Green IT · Day ${CASE.day} · Route 1 · Levels 1–2</p>
  <h1>${esc(EXPORT.docHeading)}</h1>
  <p class="meta">${esc(r1.name.trim() || "learner")} · ${esc(date)} · Case: ${esc(
    ENGAGEMENT.company,
  )} · Role: ${esc(ENGAGEMENT.role)}</p>

  <h2>Part 1 — Diagnose</h2>
  ${zoneSections}

  <h3>Attractive now, structurally weak</h3>
  <div class="closing">&ldquo;${esc(r1.closing)}&rdquo;</div>
  ${r1.closingAll ? '<h3>Across all six (optional)</h3><div class="closing">&ldquo;' + esc(r1.closingAll) + '&rdquo;</div>' : ""}

  <div class="summary">
    <strong>${r1.coreCompleteCount} of ${r1.coreCount} core initiatives written up — verdict and rationale${r1.diagnosedCount > r1.coreDiagnosedCount ? ", plus " + (r1.diagnosedCount - r1.coreDiagnosedCount) + " optional" : ""}.</strong>
  </div>

  ${part2Html}

  <footer>
    AION Green IT — Day ${CASE.day}, Route 1 (Assess &amp; Decide), Level 1${r1.part2Touched ? " with the optional Level 2" : ""}.
    ${esc(ENGAGEMENT.company)} is a fictional case for training use. Prepared by the learner named above.
  </footer>
</div>
</body>
</html>`;
}
