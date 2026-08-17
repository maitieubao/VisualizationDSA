import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { BarTransitionPipeline } from '../../renderer/barSortTransitions';
import { drawArrayBars } from '../../renderer/arrayBars';
import { COLORS } from '../../renderer/colors';
import { easeInOut, lerp, roundRect } from '../../renderer/geometry';
import { drawSnapshotOverlays } from '../../renderer/overlays';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer nhóm TÌM KIẾM (linear-search, binary-search):
 *   • Linear: vùng đã quét (bên trái con trỏ) dim dần — mô tả tính quét tuần tự
 *   • Binary: vùng ngoài searchRange dim — mô tả tính loại nửa khoảng
 *   • Pointer (I/L/H/M) TRƯỢT mượt giữa các vị trí thay vì nhảy cóc
 *   • Compare pulse trên bar đang so sánh
 */
export class SearchingRenderer implements AlgoRenderer {
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
    const foundIdx = curr.foundIndex ?? -1;
    const isLinear = pb.algorithmId === 'linear-search';

    // ── Màu từng bar ──
    const colors: string[] = arr.map((_, i) => {
      if (foundIdx === i) return COLORS.barSorted;
      if (comparing.includes(i)) return COLORS.barCompare;
      if (searchRng && (i < searchRng.low || i > searchRng.high)) return COLORS.barPruned;
      if (isLinear && i < (comparing[0] ?? -1)) return COLORS.barPruned; // vùng đã quét
      return COLORS.barDefault;
    });

    // ── Bars + pulse ring trên bar đang so sánh ──
    drawArrayBars(ctx, w, h, curr, colors, true);

    const geo = this.pipeline.computeGeo(arr, w, h);
    for (const ci of comparing) {
      if (ci < 0 || ci >= geo.length) continue;
      const g = geo[ci];
      const alpha = 0.35 + 0.35 * Math.sin(t * Math.PI);
      ctx.strokeStyle = COLORS.foundGlow;
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha;
      roundRect(ctx, g.x - 2, g.y - 2, g.w + 4, g.h + 4, 4);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ── Pointer lerp — dùng geo objects để căn chính xác vị trí bar ──
    const prevPtrs = prev?.pointers ?? [];
    const markerBarH = 4;
    const markerLabelGap = 2;

    for (const ptr of curr.pointers ?? []) {
      if (ptr.index < 0 || ptr.index >= arr.length || ptr.index >= geo.length) continue;
      const g = geo[ptr.index];
      const barW = g.w;
      const markerLabelFontPx = Math.max(9, Math.min(12, Math.round(barW * 0.45)));
      const color = COLORS.pointerColors[ptr.label] || ptr.color || COLORS.barCompare;

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

    // ── Overlays (target badge, comparisons, legend, not found) ──
    drawSnapshotOverlays(ctx, w, h, curr);
  }
}
