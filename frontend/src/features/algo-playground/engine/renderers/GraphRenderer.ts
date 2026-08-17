import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { BarTransitionPipeline } from '../../renderer/barSortTransitions';
import { COLORS } from '../../renderer/colors';
import { easeInOut, roundRect } from '../../renderer/geometry';
import { drawGraph, drawGraphTransition } from '../../renderer/graphDrawer';
import { drawSnapshotOverlays } from '../../renderer/overlays';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer nhóm ĐỒ THỊ (bfs, dfs, dijkstra):
 *   • Graph: lerp màu node/edge giữa 2 frame (visited/active/highlight)
 *   • BFS: hàng đợi duyệt hiển thị dạng chip hàng ngang (FIFO)
 *   • DFS: ngăn xếp duyệt hiển thị dạng chip hàng ngang (LIFO)
 *   • Dijkstra: nhãn khoảng cách dưới node (đã có trong graphDrawer)
 */
export class GraphRenderer implements AlgoRenderer {
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
    const nodes = curr.graphNodes ?? [];
    if (nodes.length === 0) {
      this.pipeline.draw(ctx, w, h, prev, curr, progress, pb);
      return;
    }

    const t = easeInOut(progress);
    const chipH = 24;
    const graphH = h - 40;

    if (prev && progress < 1) {
      drawGraphTransition(ctx, w, graphH, prev, curr, t);
    } else {
      drawGraph(ctx, w, graphH, curr);
    }

    drawSnapshotOverlays(ctx, w, h, curr, true);

    // ── Chip hàng đợi / ngăn xếp duyệt ──
    const queue = curr.queueIds ?? [];
    const stack = curr.stackIds ?? [];
    if (queue.length > 0) {
      this.drawChipRow(ctx, w, h - 32, chipH, 'HÀNG ĐỢI', queue, true);
    } else if (stack.length > 0) {
      this.drawChipRow(ctx, w, h - 32, chipH, 'NGĂN XẾP', stack, false);
    }
  }

  private drawChipRow(
    ctx: CanvasRenderingContext2D,
    w: number,
    y: number,
    chipH: number,
    label: string,
    ids: string[],
    queueMode: boolean,
  ): void {
    const labelW = 78;
    const gap = 6;
    const chipW = 38;
    const x0 = 12;

    ctx.fillStyle = COLORS.textDim;
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x0, y + chipH / 2);

    const startX = x0 + labelW;
    const maxChips = Math.floor((w - startX - 12) / (chipW + gap));
    for (let i = 0; i < Math.min(ids.length, maxChips); i++) {
      const x = startX + i * (chipW + gap);
      const isFront = queueMode && i === 0; // hàng đợi: phần tử đầu (sắp ra)
      const isTop = !queueMode && i === ids.length - 1; // ngăn xếp: đỉnh (sắp ra)
      roundRect(ctx, x, y, chipW, chipH, 4);
      ctx.fillStyle = (isFront || isTop) ? COLORS.chipActive : COLORS.chipBg;
      ctx.fill();
      ctx.strokeStyle = (isFront || isTop) ? COLORS.foundGlow : COLORS.edgeDefault;
      ctx.lineWidth = (isFront || isTop) ? 1.5 : 1;
      ctx.stroke();
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ids[i], x + chipW / 2, y + chipH / 2);
    }
    if (ids.length > maxChips) {
      ctx.fillStyle = COLORS.textDim;
      ctx.font = '10px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('+' + (ids.length - maxChips), startX + maxChips * (chipW + gap) + 2, y + chipH / 2);
    }
  }
}
