/** One shared en-GB number formatter, so every figure on screen reads the same way (€18,000 · 4,000 kWh). */
const NUM = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

export const fmt = (n: number): string => NUM.format(n);
export const fmtEur = (n: number): string => `€${NUM.format(Math.round(n))}`;
/** Signed, for "what changed": +3, −2 (a real minus sign), 0. */
export const fmtDelta = (n: number): string => (n > 0 ? `+${NUM.format(n)}` : n < 0 ? `−${NUM.format(Math.abs(n))}` : "0");
