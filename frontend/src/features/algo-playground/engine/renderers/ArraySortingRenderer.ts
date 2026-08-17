import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { BarTransitionPipeline } from '../../renderer/barSortTransitions';
import { COLORS } from '../../renderer/colors';
import { roundRect } from '../../renderer/geometry';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer nhóm sắp xếp thanh mảng (Tier 1):
 * bubble-sort, selection-sort, insertion-sort, quick-sort.
 *
 * Dùng pipeline thanh mảng chung (swap parabol / compare pulse / highlight pop / move slide)
 * + overlay đặc thù theo thuật toán (vùng so sánh, MIN badge, KEY float, partition PIVOT).
 */
export class ArraySortingRenderer implements AlgoRenderer {
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
    this.pipeline.draw(ctx, w, h, prev, curr, progress, pb);
    this.drawAlgorithmOverlay(ctx, w, h, curr, progress, pb.algorithmId);
  }

  private drawAlgorithmOverlay(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    snap: CanvasStateSnapshot,
    progress: number,
    algorithmId: string,
  ): void {
    switch (algorithmId) {
      case 'bubble-sort': this.drawBubbleOverlay(ctx, w, h, snap); break;
      case 'selection-sort': this.drawSelectionOverlay(ctx, w, h, snap); break;
      case 'insertion-sort': this.drawInsertionOverlay(ctx, w, h, snap, progress); break;
      case 'quick-sort': this.drawQuickOverlay(ctx, w, h, snap); break;
    }
  }

  private drawBubbleOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, snap: CanvasStateSnapshot): void {
    const ci = snap.comparingIndices;
    if (!ci || ci.length < 2) return;
    const geo = this.pipeline.computeGeo(snap.array, w, h);
    const [i, j] = ci;
    if (i >= geo.length || j >= geo.length) return;

    // Bỏ bracket/sorted-boundary (đường kẻ gây nhiễu) — giữ lại phần tô mờ nhẹ
    // phân biệt cặp đang so sánh.
    const a = geo[i];
    const b = geo[j];
    const x1 = a.x + a.w / 2;
    const x2 = b.x + b.w / 2;
    ctx.fillStyle = COLORS.rangeActive;
    ctx.fillRect(x1 - 1, Math.min(a.y, b.y) - 10, x2 - x1 + 2, 8);
  }

  private drawSelectionOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, snap: CanvasStateSnapshot): void {
    const ci = snap.comparingIndices;
    if (!ci || ci.length < 2) return;
    const geo = this.pipeline.computeGeo(snap.array, w, h);
    const [minIdx] = ci;
    if (minIdx >= geo.length) return;
    const g = geo[minIdx];

    // "MIN" badge above current minimum (không vẽ mũi tên nối)
    const bx = g.x + g.w / 2;
    const by = g.y - 20;
    ctx.fillStyle = COLORS.targetBg;
    ctx.strokeStyle = COLORS.targetText;
    ctx.lineWidth = 1;
    roundRect(ctx, bx - 16, by - 8, 32, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.targetText;
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MIN', bx, by);
  }

  private drawInsertionOverlay(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    snap: CanvasStateSnapshot,
    progress: number,
  ): void {
    const ci = snap.comparingIndices;
    if (!ci || ci.length < 2) return;
    const geo = this.pipeline.computeGeo(snap.array, w, h);
    const [keyIdx] = ci;
    if (keyIdx >= geo.length) return;

    // Key element floating above array (không vẽ mũi tên nối)
    const g = geo[keyIdx];
    const floatY = Math.max(30, g.y - 30);
    const alpha = 0.65 + 0.2 * Math.sin(progress * Math.PI);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = COLORS.targetText;
    roundRect(ctx, g.x, floatY, g.w, g.h * 0.7, 4);
    ctx.fill();
    ctx.strokeStyle = COLORS.targetText;
    ctx.lineWidth = 1.5;
    roundRect(ctx, g.x, floatY, g.w, g.h * 0.7, 4);
    ctx.stroke();
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(snap.array[keyIdx]), g.x + g.w / 2, floatY + g.h * 0.35);
    ctx.globalAlpha = 1;

    // "KEY" label
    ctx.fillStyle = COLORS.targetText;
    ctx.font = 'bold 9px "JetBrains Mono", Consolas, monospace';
    ctx.fillText('KEY', g.x + g.w / 2, floatY - 6);
  }

  private drawQuickOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, snap: CanvasStateSnapshot): void {
    const geo = this.pipeline.computeGeo(snap.array, w, h);
    const vars = snap.loopVariables ?? {};
    const low = vars.low;
    const high = vars.high;
    const pivot = vars.p ?? vars.pivot;

    if (low !== undefined && high !== undefined && low <= high) {
      // Draw partition regions (chỉ tô mờ, không vẽ viền kẻ)
      const lGeo = geo[low];
      const hGeo = geo[high];
      if (lGeo && hGeo) {
        const regionX = lGeo.x - 2;
        const regionW = hGeo.x + hGeo.w - lGeo.x + 4;
        ctx.fillStyle = COLORS.rangeActive;
        ctx.fillRect(regionX, h * 0.05, regionW, h * 0.85);
      }

      // Left/right partition labels
      if (pivot !== undefined && pivot >= low && pivot <= high) {
        const pGeo = geo[pivot];
        if (pGeo) {
          // Left partition (low..pivot-1)
          if (pivot > low) {
            const lEnd = geo[pivot - 1];
            ctx.fillStyle = COLORS.chipSlot;
            const lx = lGeo.x - 1;
            const lw = lEnd.x + lEnd.w - lGeo.x + 2;
            ctx.fillRect(lx, h * 0.05, lw, h * 0.85);
          }
          // Right partition (pivot+1..high)
          if (pivot < high) {
            const rStart = geo[pivot + 1];
            ctx.fillStyle = COLORS.rangePruned;
            const rx = rStart.x - 1;
            const rw = hGeo.x + hGeo.w - rStart.x + 2;
            ctx.fillRect(rx, h * 0.05, rw, h * 0.85);
          }
          // Pivot highlight ring
          ctx.strokeStyle = COLORS.foundGlow;
          ctx.lineWidth = 3;
          roundRect(ctx, pGeo.x - 3, pGeo.y - 3, pGeo.w + 6, pGeo.h + 6, 5);
          ctx.stroke();
          ctx.fillStyle = COLORS.foundGlow;
          ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PIVOT', pGeo.x + pGeo.w / 2, pGeo.y - 10);
        }
      }
    }

    // Recursion depth badge
    const depth = vars.depth ?? vars.recursionDepth;
    if (depth !== undefined && depth > 0) {
      const label = `Depth: ${depth}`;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = COLORS.badgeBg;
      roundRect(ctx, w - tw - 24, 10, tw + 16, 20, 4);
      ctx.fill();
      ctx.fillStyle = COLORS.depthText;
      ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, w - tw - 16, 20);
    }
  }
}
