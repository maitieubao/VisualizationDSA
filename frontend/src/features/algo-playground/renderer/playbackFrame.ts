import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { drawArrayBars } from './arrayBars';
import { clearCanvas } from './geometry';
import { drawGraph, drawGraphTransition } from './graphDrawer';
import { drawSnapshotOverlays } from './overlays';
import { drawTree, drawTreeTransition } from './treeDrawer';

export function drawPlaybackFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  snapshot: CanvasStateSnapshot,
  barColors?: string[],
): void {
  clearCanvas(ctx, w, h);
  const treeNodes = snapshot.treeNodes ?? [];
  const graphNodes = snapshot.graphNodes ?? [];

  if (treeNodes.length > 0) {
    drawTree(ctx, w, h, snapshot);
  } else if (graphNodes.length > 0) {
    drawGraph(ctx, w, h, snapshot);
  } else {
    drawArrayBars(ctx, w, h, snapshot, barColors);
  }

  drawSnapshotOverlays(ctx, w, h, snapshot);
}

/**
 * Vẽ frame với nội suy nếu snapshot là tree/graph; trả về true nếu đã xử lý.
 * Dùng cho transition giữa 2 frame (t ∈ [0,1]) — nếu không phải tree/graph trả về false
 * để engine fallback về pipeline array.
 */
export function drawPlaybackFrameTransition(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  prev: CanvasStateSnapshot,
  curr: CanvasStateSnapshot,
  t: number,
): boolean {
  const treeNodes = curr.treeNodes ?? [];
  const graphNodes = curr.graphNodes ?? [];
  if (treeNodes.length === 0 && graphNodes.length === 0) return false;

  clearCanvas(ctx, w, h);
  if (treeNodes.length > 0) {
    drawTreeTransition(ctx, w, h, prev, curr, t);
  } else {
    drawGraphTransition(ctx, w, h, prev, curr, t);
  }
  drawSnapshotOverlays(ctx, w, h, curr);
  return true;
}
