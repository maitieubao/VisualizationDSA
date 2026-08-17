import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { COLORS } from './colors';
import { maxWithFallback, minWithFallback, roundRect } from './geometry';

export function drawArrayBars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  snapshot: CanvasStateSnapshot,
  barColors?: string[],
  skipPointers = false,
): void {
  const array = snapshot.array ?? [];
  if (array.length === 0) return;

  const margin = 32;
  const gap = 10;
  const minVal = minWithFallback(array, 0);
  const maxVal = maxWithFallback(array, 1);
  const span = Math.max(maxVal - minVal, 1);
  const usableW = w - margin * 2;
  const maxBarW = 80;
  const barW = Math.min(maxBarW, Math.max(2, (usableW - gap * (array.length - 1)) / array.length));
  const totalBarsW = array.length * barW + (array.length - 1) * gap;
  const barOffset = margin + (usableW - totalBarsW) / 2;
  const usableH = h - margin * 2;
  const baseY = h - margin;
  // Đường baseline 0: số dương dựng lên trên, số âm đâm xuống dưới
  const zeroY = baseY - ((0 - minVal) / span) * usableH;
  const valueFontPx = Math.max(6, Math.min(11, Math.round(barW * 0.5)));
  const indexFontPx = Math.max(5, Math.min(9, Math.round(barW * 0.4)));

  const comparing: number[] = snapshot.comparingIndices ?? [];
  const swapping: number[] = snapshot.swappingIndices ?? [];
  const sorted: number[] = snapshot.highlightedIndices ?? [];
  const searchRng = snapshot.searchRange;
  const foundIdx = snapshot.foundIndex ?? -1;
  const pointers = snapshot.pointers ?? [];
  const regions = snapshot.searchRegions ?? [];

  // Draw search regions (backgrounds behind bars)
  for (const region of regions) {
    if (region.start < 0 || region.end >= array.length) continue;
    const x1 = barOffset + region.start * (barW + gap) - 2;
    const x2 = barOffset + region.end * (barW + gap) + barW + 2;
    ctx.fillStyle = region.state === 'active' ? COLORS.rangeActive : COLORS.rangePruned;
    ctx.fillRect(x1, margin - 8, x2 - x1, usableH + 16);
  }

  // Search regions đã tô nền active/pruned — không vẽ thêm bracket kẻ dọc (gây nhiễu)

  for (let i = 0; i < array.length; i++) {
    const v = array[i];
    const top = zeroY - ((v - minVal) / span) * usableH;
    const y = v >= 0 ? top : zeroY;
    const barH = Math.max(3, v >= 0 ? zeroY - top : top - zeroY);
    const x = barOffset + i * (barW + gap);

    let fill = barColors?.[i] ?? COLORS.barDefault;
    if (!barColors) {
      if (swapping.includes(i)) fill = COLORS.barSwap;
      else if (comparing.includes(i)) fill = COLORS.barCompare;
      else if (sorted.includes(i)) fill = COLORS.barSorted;
    }

    // Dim elements outside search range
    if (searchRng && (i < searchRng.low || i > searchRng.high) && !sorted.includes(i)) {
      fill = COLORS.barPruned;
    }

    // Found state — golden glow
    if (foundIdx === i) {
      fill = COLORS.barSorted;
      ctx.save();
      ctx.shadowColor = COLORS.foundGlow;
      ctx.shadowBlur = 16;
      roundRect(ctx, x, y, barW, barH, 3);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = COLORS.foundGlow;
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, barW, barH, 3);
      ctx.stroke();
    } else {
      roundRect(ctx, x, y, barW, barH, 3);
      ctx.fillStyle = fill;
      ctx.fill();
      // Border to separate adjacent bars visually
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Value label above bar (ẩn khi bar quá hẹp)
    if (barW >= 7 && barH >= 10) {
      ctx.fillStyle = COLORS.barText;
      ctx.font = `${valueFontPx}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(v), x + barW / 2, y - 4);
    }

    // Index label below bar (ẩn khi bar quá hẹp)
    if (barW >= 5) {
      ctx.fillStyle = COLORS.textDim;
      ctx.globalAlpha = 0.4;
      ctx.font = `${indexFontPx}px "JetBrains Mono", Consolas, monospace`;
      ctx.textBaseline = 'top';
      ctx.fillText(String(i), x + barW / 2, baseY + 4);
      ctx.globalAlpha = 1;
    }
  }

  // Draw pointer indicators above bars — thanh đánh dấu rộng bằng cột, căn giữa, không đè index
  if (!skipPointers) {
    const markerBarH = 4;
    const markerLabelGap = 2;
    const markerLabelFontPx = Math.max(9, Math.min(12, Math.round(barW * 0.45)));
    for (const ptr of pointers) {
      if (ptr.index < 0 || ptr.index >= array.length) continue;
      const barX = barOffset + ptr.index * (barW + gap);
      const barY = zeroY - ((array[ptr.index] - minVal) / span) * usableH;
      const color = COLORS.pointerColors[ptr.label] || ptr.color || COLORS.barCompare;

      // Vị trí marker: ngay trên value label (y - 4 - markerLabelFontPx - markerLabelGap - markerBarH)
      const markerY = barY - 4 - markerLabelFontPx * 0.7 - markerLabelGap - markerBarH;

      // Thanh ngang rộng bằng cột bar
      ctx.fillStyle = color;
      ctx.beginPath();
      roundRect(ctx, barX, markerY, barW, markerBarH, 2);
      ctx.fill();

      // Label ở trên thanh marker
      ctx.fillStyle = color;
      ctx.font = `bold ${markerLabelFontPx}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(ptr.label, barX + barW / 2, markerY - 2);
    }
  }
}

/** Tính hình học cột thanh (bar geometry) — dùng chung cho array renderer. */
export interface BarGeo {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function computeBarGeo(arr: number[], w: number, h: number): BarGeo[] {
  const margin = 32;
  const gap = 10;
  const n = arr.length;
  if (n === 0) return [];
  const minV = minWithFallback(arr, 0);
  const maxV = maxWithFallback(arr, 1);
  const span = Math.max(maxV - minV, 1);
  const usableW = w - margin * 2;
  const maxBarW = 80;
  const barW = Math.min(maxBarW, Math.max(2, (usableW - gap * (n - 1)) / n));
  const totalBarsW = n * barW + (n - 1) * gap;
  const barOffset = margin + (usableW - totalBarsW) / 2;
  const usableH = h - margin * 2;
  const baseY = h - margin;
  // Baseline 0: số dương dựng lên, số âm đâm xuống
  const zeroY = baseY - ((0 - minV) / span) * usableH;
  const bars: BarGeo[] = new Array<BarGeo>(n);
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    const top = zeroY - ((v - minV) / span) * usableH;
    const y = v >= 0 ? top : zeroY;
    const hh = Math.max(3, v >= 0 ? zeroY - top : top - zeroY);
    bars[i] = { index: i, x: barOffset + i * (barW + gap), y, w: barW, h: hh };
  }
  return bars;
}
