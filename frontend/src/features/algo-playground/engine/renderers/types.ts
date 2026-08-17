import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';

export type TransitionType = 'compare' | 'swap' | 'highlight' | 'move';

/** Ngữ cảnh phát lại do AlgoAnimationEngine cấp cho renderer mỗi tick. */
export interface PlaybackContext {
  algorithmId: string;
  transition: TransitionType;
  swapPair: [number, number] | null;
  comparePair: [number, number] | null;
  highlightIdx: number;
  prevArray: number[];
}

/**
 * Giao ước renderer theo nhóm thuật toán (Open-Closed: thêm nhóm mới = thêm 1 file,
 * không sửa lõi engine — xem AGENTS.md Quy tắc 1).
 *
 * - `prev`: snapshot frame trước (có thể null ở bước đầu).
 * - `curr`: snapshot frame hiện tại.
 * - `progress`: ∈ [0,1] — vị trí nội suy giữa prev→curr.
 */
export interface AlgoRenderer {
  draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    prev: CanvasStateSnapshot | null,
    curr: CanvasStateSnapshot,
    progress: number,
    pb: PlaybackContext,
  ): void;
}
