import { BLOCKS, CANDIDATE_MEASURES, ENGAGEMENT, EXPORT, FIRST_MEASURE_OPTIONS, HORIZONS, connectionKey } from "@/lib/route2";
import { CASE } from "@/lib/routes";
import type { Route2State } from "./useRoute2";

/**
 * The route's single export: one print-ready HTML report sent straight to the
 * browser's print dialog — "Save as PDF" is the export (see
 * lib/downloadFile.ts `printHtmlDocument`). No JSON, no PDF library.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildProposalHtml(r2: Route2State): string {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const firstMeasureLabel = r2.firstMeasure ? FIRST_MEASURE_OPTIONS.find((o) => o.id === r2.firstMeasure)!.label : "Not picked";

  const connectionRows = r2.connections
    .map(([a, b]) => `<li>${esc(BLOCKS.find((x) => x.id === a)!.label)} &harr; ${esc(BLOCKS.find((x) => x.id === b)!.label)}</li>`)
    .join("");

  const guidingRows = r2.guidingDecisions.map((g) => `<li>${esc(g || "—")}</li>`).join("");

  const horizonRows = HORIZONS.map((band) => {
    const inBand = CANDIDATE_MEASURES.filter((m) => r2.horizons[m.id] === band.id);
    const list = inBand.length ? `<ul>${inBand.map((m) => `<li>${esc(m.text)}</li>`).join("")}</ul>` : "<em>none</em>";
    return `<tr><td class="nowrap">${esc(band.label)}</td><td>${list}</td><td class="nowrap">${inBand.length} of ${CANDIDATE_MEASURES.length}</td></tr>`;
  }).join("");

  // Optional sections: present only if the learner did them, and labelled as such.
  const anyHorizon = CANDIDATE_MEASURES.some((m) => r2.horizons[m.id]);
  const optionalParts: string[] = [];
  if (r2.guidingDecisions.some((g) => g)) optionalParts.push(`<h2>2. Three guiding decisions (optional)</h2><ol>${guidingRows}</ol>`);
  if (r2.element4) optionalParts.push(`<h2>4. Central trade-offs (optional)</h2><p class="body-text">${esc(r2.element4)}</p>`);
  if (r2.element6) optionalParts.push(`<h2>6. Roles, responsibilities, approval, review (optional)</h2><p class="body-text">${esc(r2.element6)}</p>`);
  if (r2.element7) optionalParts.push(`<h2>7. The decision to take now (optional)</h2><p class="body-text">${esc(r2.element7)}</p>`);
  if (anyHorizon) optionalParts.push(`<h2>Time-horizon split (optional)</h2><table><tbody>${horizonRows}</tbody></table>`);
  const optionalHtml = optionalParts.length
    ? optionalParts.join("\n  ")
    : `<p class="body-text"><em>The optional extension of the proposal was not attempted.</em></p>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(EXPORT.docHeading)} — ${esc(r2.name.trim() || "learner")}</title>
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
  h2 { margin: 22px 0 8px; font-size: 13px; letter-spacing: .06em; text-transform: uppercase;
       color: #5E6670; border-top: 1px solid #E2E5E9; padding-top: 14px; }
  .meta { margin: 0; color: #5E6670; font-size: 13px; }
  p.body-text { margin: 4px 0 0; font-size: 14px; }
  ul, ol { margin: 6px 0 0; padding-left: 20px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 13px; }
  td { vertical-align: top; padding: 6px 10px 6px 0; border-bottom: 1px solid #EEF1F3; }
  .nowrap { white-space: nowrap; }
  .summary { margin-top: 10px; padding: 14px 16px; border-radius: 10px; background: #EEF1F3; }
  .summary strong { display: block; font-size: 16px; }
  footer { margin-top: 32px; border-top: 1px solid #E2E5E9; padding-top: 14px;
           color: #5E6670; font-size: 11px; }
  @media (max-width: 560px) {
    body { padding: 12px 8px; }
    .sheet { padding: 18px 14px; border-radius: 12px; }
  }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: 0; border-radius: 0; padding: 0; max-width: none; }
    @page { margin: 16mm; }
  }
</style>
</head>
<body>
<div class="sheet">
  <p class="kicker">AION Green IT · Day ${CASE.day} · Route 2 · Level 3</p>
  <h1>${esc(EXPORT.docHeading)}</h1>
  <p class="meta">${esc(r2.name.trim() || "learner")} · ${esc(date)} · Case: ${esc(ENGAGEMENT.company)} · Role: ${esc(ENGAGEMENT.role)}</p>

  <h2>Decision architecture</h2>
  ${r2.connections.length ? `<ul>${connectionRows}</ul>` : `<p class="body-text"><em>No connections.</em></p>`}
  ${r2.orphanedBlocks.length ? `<p class="body-text">${r2.orphanedBlocks.length} block(s) orphaned.</p>` : ""}
  <p class="body-text">${r2.groups.length === 1 ? "The six blocks form one connected architecture." : `The blocks form ${r2.groups.length} separate groups.`}</p>

  <h2>1. Strategic relevance</h2>
  <p class="body-text">${esc(r2.element1) || "<em>Not written.</em>"}</p>

  <h2>3. Decision logic</h2>
  <p class="body-text">${esc(r2.element3) || "<em>Not written.</em>"}</p>

  <h2>5. First prioritised line of measures + why</h2>
  <p class="body-text"><strong>${esc(firstMeasureLabel)}</strong></p>
  <p class="body-text">${esc(r2.element5Why) || "<em>Not written.</em>"}</p>

  ${optionalHtml}

  <div class="summary">
    <strong>${r2.connections.length} connections · ${6 - r2.orphanedBlocks.length} of 6 blocks connected · ${r2.groups.length} group${r2.groups.length === 1 ? "" : "s"}${anyHorizon ? " · " + (6 - r2.unclassifiedMeasures.length) + " of 6 measures classified" : ""} · checked ${r2.checkCount}×.</strong>
  </div>

  <footer>
    AION Green IT — Day ${CASE.day}, Route 2 (Management Decision), Level 3.
    ${esc(ENGAGEMENT.company)} is a fictional case for training use. Prepared by the learner named above.
  </footer>
</div>
</body>
</html>`;
}
