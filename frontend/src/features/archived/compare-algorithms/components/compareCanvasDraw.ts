import type { FrameDTO } from '../../animation-engine/types/animation.types';
import { CANVAS_COLORS, CANVAS_LAYOUT, hexToRgba } from '../../../core/renderers/canvasTheme';

export interface BarPosition {
  x: number;
  targetX: number;
}

export const easeOut = (t: number): number => 1 - (1 - t) ** 3;
export const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

export const getDynamicGap = (n: number): number => {
  return Math.max(2, Math.min(6, 120 / n));
};

export const calculateColumnWidth = (n: number, canvasW: number): number => {
  if (n <= 0) return 0;
  const gap = getDynamicGap(n);
  return (canvasW - gap * (n - 1) - CANVAS_LAYOUT.margin * 2) / n;
};

export const calculateColumnHeight = (value: number, maxValue: number, canvasH: number): number => {
  return maxValue <= 0 ? 0 : (value / maxValue) * (canvasH - CANVAS_LAYOUT.paddingTop - CANVAS_LAYOUT.marginBottom);
};

export const calculateX = (index: number, columnWidth: number, n: number): number => {
  const gap = getDynamicGap(n);
  return CANVAS_LAYOUT.margin + index * (columnWidth + gap);
};

export const determineColor = (index: number, frame: FrameDTO | null): string => {
  if (!frame || !frame.highlights) return CANVAS_COLORS.default;
  const h = frame.highlights;
  return (h.sorted?.includes(index))  ? CANVAS_COLORS.sorted
       : (h.swap?.includes(index))    ? CANVAS_COLORS.swap
       : (h.compare?.includes(index)) ? CANVAS_COLORS.compare
       : CANVAS_COLORS.default;
};


/**
 * Vẽ một bar với gradient glassmorphic — đồng bộ phong cách với BubbleSortVisualizer.
 * Fill: gradient từ màu đậm (top) → trong suốt (bottom)
 * Stroke: viền sáng bán trong suốt
 * Shadow: neon glow cho các bar đang active (compare/swap/sorted)
 */
function drawGlassmorphicBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  color: string,
  isActive: boolean,
  radius = 6
): void {
  ctx.save();

  // Neon glow cho bar đang active
  if (isActive) {
    ctx.shadowColor   = color;
    ctx.shadowBlur    = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Gradient fill glassmorphic
  const gradient = ctx.createLinearGradient(x, y, x, y + h);
  gradient.addColorStop(0,   hexToRgba(color, isActive ? 0.45 : 0.28));
  gradient.addColorStop(0.5, hexToRgba(color, isActive ? 0.20 : 0.12));
  gradient.addColorStop(1,   hexToRgba(color, 0.05));
  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();

  // Viền sáng stroke (tắt shadow trước để tránh double glow trên stroke)
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = hexToRgba(color, isActive ? 0.85 : 0.45);
  ctx.lineWidth   = isActive ? 1.5 : 1;
  ctx.stroke();

  ctx.restore();
}

export function drawCompareCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  currentFrame: FrameDTO | null,
  isTransitioning: boolean,
  animationProgress: number,
  barPositions: BarPosition[]
) {
  const rootStyle = typeof window !== 'undefined' ? window.getComputedStyle(document.documentElement) : null;
  const colorBg   = rootStyle?.getPropertyValue('--canvas-bg').trim() || CANVAS_COLORS.bgDark;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = colorBg;
  ctx.fillRect(0, 0, w, h);

  if (!currentFrame) return;
  const n = currentFrame.dataState?.length ?? 0;
  if (n === 0) return;

  const columnWidth = calculateColumnWidth(n, w);
  const maxVal      = Math.max(...(currentFrame.dataState ?? []), 1);

  for (let i = 0; i < n; i++) {
    const colH = calculateColumnHeight(currentFrame.dataState?.[i] ?? 0, maxVal, h);
    const yPos = h - colH - CANVAS_LAYOUT.marginBottom;
    let   xPos = calculateX(i, columnWidth, n);

    if (isTransitioning && barPositions[i]) {
      xPos = lerp(barPositions[i].x, barPositions[i].targetX, easeOut(animationProgress));
    }

    const color    = determineColor(i, currentFrame);
    const isActive = color !== CANVAS_COLORS.default;

    // Vẽ bar glassmorphic gradient (thay thế flat fill cũ)
    drawGlassmorphicBar(ctx, xPos, yPos, columnWidth, colH, color, isActive);

    // Nhãn giá trị phía trên bar
    if (columnWidth >= 12) {
      ctx.fillStyle    = CANVAS_COLORS.text;
      ctx.font         = `bold ${Math.min(11, Math.max(8, columnWidth * 0.5))}px Inter, sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'bottom';
      ctx.shadowBlur   = 0;
      ctx.fillText((currentFrame.dataState?.[i] ?? 0).toString(), xPos + columnWidth / 2, yPos - 4);
    }

    // Auto-hide STT labels nếu N > 12 (nhất quán với BubbleSortVisualizer)
    if (n <= 12 && columnWidth >= 14) {
      ctx.fillStyle    = CANVAS_COLORS.muted;
      ctx.font         = `${Math.min(10, Math.max(8, columnWidth * 0.4))}px Inter, sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowBlur   = 0;
      ctx.fillText(`[${i}]`, xPos + columnWidth / 2, h - CANVAS_LAYOUT.marginBottom + 18);
    }
  }
}
