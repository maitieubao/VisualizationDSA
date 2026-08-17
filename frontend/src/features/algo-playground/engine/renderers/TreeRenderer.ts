import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { BarTransitionPipeline } from '../../renderer/barSortTransitions';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer nhóm CÂY (bst, tree-traversal).
 * P3 mở rộng: tô node tìm thấy (BST) + call stack panel.
 */
export class TreeRenderer implements AlgoRenderer {
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
  }
}
