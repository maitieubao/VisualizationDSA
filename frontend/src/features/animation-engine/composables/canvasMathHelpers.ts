/** Hằng số layout cho canvas bar chart */
export const MARGIN         = 40;
export const MARGIN_BOTTOM  = 40;
export const PADDING_TOP    = 50;
export const GAP            = 8;

/** Bảng màu trực quan */
export const COLOR_DEFAULT = '#38BDF8';
export const COLOR_COMPARE = '#FBBF24';
export const COLOR_SWAP    = '#EF4444';
export const COLOR_SORTED  = '#10B981';
export const COLOR_TEXT    = '#FFFFFF';

export function easeOut(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function calculateColumnWidth(n: number, canvasW: number): number {
  if (n <= 0) return 0;
  return (canvasW - GAP * (n - 1) - MARGIN * 2) / n;
}

export function calculateColumnHeight(value: number, maxValue: number, canvasH: number): number {
  if (maxValue <= 0) return 0;
  return (value / maxValue) * (canvasH - PADDING_TOP - MARGIN_BOTTOM);
}

export function calculateX(index: number, columnWidth: number): number {
  return MARGIN + index * (columnWidth + GAP);
}
