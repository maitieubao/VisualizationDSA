import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { BarTransitionPipeline } from '../../renderer/barSortTransitions';
import { drawArrayBars } from '../../renderer/arrayBars';
import { COLORS } from '../../renderer/colors';
import { easeInOut, lerp, roundRect } from '../../renderer/geometry';
import { drawSnapshotOverlays } from '../../renderer/overlays';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer nhóm HAI CON TRỎ / CỬA SỔ TRƯỢT (two-pointers, sliding-window):
 *   • Cửa sổ (khoảng L..R / searchRange) tô nền active — ngoài cửa sổ dim
 *   • Con trỏ L/R/W TRƯỢT mượt giữa các vị trí
 *   • Compare pulse trên cặp đang xét
 */
export class TwoPointersRenderer implements AlgoRenderer {
  private readonly pipeline = new BarTransitionPipeline();

  draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    prev: CanvasStateSnapshot | null,
    curr: CanvasStateSnapshot,
    progress: number,
    pb: PlaybackContext,
  ): void {
    const arr = curr.array ?? [];
    if (arr.length === 0) {
      this.pipeline.draw(ctx, w, h, prev, curr, progress, pb);
      return;
    }

    const t = easeInOut(progress);
    const comparing = (curr.comparingIndices ?? []) as number[];
    const searchRng = curr.searchRange;
    const isWindow = pb.algorithmId === 'sliding-window';
    const pointers = curr.pointers ?? [];
    const lPtr = pointers.find(p => p.label === 'L' || p.label === 'Left');
    const rPtr = pointers.find(p => p.label === 'R' || p.label === 'Right');

    // ── Xác định vùng cửa sổ ──
    let winLow = -1;
    let winHigh = -1;
    if (isWindow && searchRng) {
      winLow = searchRng.low;
      winHigh = searchRng.high;
    } else if (lPtr && rPtr) {
      winLow = Math.min(lPtr.index, rPtr.index);
      winHigh = Math.max(lPtr.index, rPtr.index);
    }

    // ── Màu từng bar ──
    const colors: string[] = arr.map((_, i) => {
      if (comparing.includes(i)) return COLORS.barCompare;
      if (winLow >= 0 && i >= winLow && i <= winHigh) return COLORS.barDefault;
      if (winLow >= 0) return COLORS.barPruned; // ngoài cửa sổ
      return COLORS.barDefault;
    });

    // ── Nền vùng cửa sổ ──
    const geo = this.pipeline.computeGeo(arr, w, h);
    if (winLow >= 0 && winHigh < arr.length && geo[winLow] && geo[winHigh]) {
      const x1 = geo[winLow].x - 2;
      const x2 = geo[winHigh].x + geo[winHigh].w + 2;
      ctx.fillStyle = COLORS.rangeActive;
      ctx.fillRect(x1, 24, x2 - x1, h - 56);
    }

    // ── Bars + pulse ──
    drawArrayBars(ctx, w, h, curr, colors, true);

    for (const ci of comparing) {
      if (ci < 0 || ci >= geo.length) continue;
      const g = geo[ci];
      ctx.strokeStyle = COLORS.foundGlow;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * Math.PI);
      roundRect(ctx, g.x - 2, g.y - 2, g.w + 4, g.h + 4, 4);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ── Pointer lerp — dùng geo objects để căn chính xác vị trí bar ──
    const prevPtrs = prev?.pointers ?? [];
    const markerBarH = 4;
    const markerLabelGap = 2;

    for (const ptr of pointers) {
      if (ptr.index < 0 || ptr.index >= arr.length || ptr.index >= geo.length) continue;
      const g = geo[ptr.index];
      const barW = g.w;
      const markerLabelFontPx = Math.max(9, Math.min(12, Math.round(barW * 0.45)));
      const color = COLORS.pointerColors[ptr.label] || ptr.color || COLORS.barCompare;

      // Lerp vị trí x giữa prev và curr using geo objects
      const prevPtr = prevPtrs.find(p => p.label === ptr.label);
      const prevGeo = prev ? this.pipeline.computeGeo(prev.array ?? [], w, h) : null;
      let barCenterX: number;
      if (prevPtr && prevPtr.index >= 0 && prevGeo && prevPtr.index < prevGeo.length) {
        const fromX = prevGeo[prevPtr.index].x + prevGeo[prevPtr.index].w / 2;
        const toX = g.x + g.w / 2;
        barCenterX = lerp(fromX, toX, t);
      } else {
        barCenterX = g.x + g.w / 2;
      }
      const barX = barCenterX - barW / 2;

      const markerY = g.y - 4 - markerLabelFontPx * 0.7 - markerLabelGap - markerBarH;

      ctx.fillStyle = color;
      ctx.beginPath();
      roundRect(ctx, barX, markerY, barW, markerBarH, 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.font = `bold ${markerLabelFontPx}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(ptr.label, barCenterX, markerY - 2);
    }

    drawSnapshotOverlays(ctx, w, h, curr);
  }
}
