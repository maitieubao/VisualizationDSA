import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { BarTransitionPipeline } from '../../renderer/barSortTransitions';
import { drawArrayBars } from '../../renderer/arrayBars';
import { COLORS } from '../../renderer/colors';
import { easeInOut, roundRect } from '../../renderer/geometry';
import { drawSnapshotOverlays } from '../../renderer/overlays';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer nhóm CẤU TRÚC TUYẾN TÍNH (stack, queue, monotonic-stack):
 *   • STACK: cột ô dọc phía trái (LIFO) — push: ô trượt từ trên xuống đỉnh;
 *     pop: ô trượt lên + mờ dần
 *   • QUEUE: hàng ô ngang phía dưới (FIFO) — enqueue: ô trượt vào từ phải;
 *     dequeue: ô trượt ra trái + mờ dần
 *   • Mỗi ô hiển thị giá trị mảng tại chỉ số được push/enqueue
 *   • Monotonic-stack: đánh dấu phần tử vừa pop (Next Greater đã tìm thấy)
 */
export class StackQueueRenderer implements AlgoRenderer {
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
    const isQueue = pb.algorithmId === 'queue';
    const stack = curr.stackIds ?? [];
    const queue = curr.queueIds ?? [];
    const prevStack = prev?.stackIds ?? [];
    const prevQueue = prev?.queueIds ?? [];
    const items = isQueue ? queue : stack;
    const prevItems = isQueue ? prevQueue : prevStack;

    // ── Layout: array bars phía trên (60%), cấu trúc phía dưới (40%) ──
    const arrayH = Math.round(h * 0.58);
    drawArrayBars(ctx, w, arrayH, curr);

    const structTop = arrayH + 8;
    const structH = h - structTop - 8;
    const cellH = 36;

    // ── Phát hiện push/pop giữa prev → curr ──
    const grew = items.length > prevItems.length;
    const shrank = items.length < prevItems.length;

    if (isQueue) {
      // ── QUEUE: hàng ngang FIFO ──
      const labelY = structTop + 6;
      ctx.fillStyle = COLORS.textDim;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('QUEUE — FIFO (vào phải · ra trái)', 12, labelY);

      const cellW = 50;
      const gap = 8;
      const y = structTop + 22;
      const maxCells = Math.floor((w - 24) / (cellW + gap));

      const drawCell = (slot: number, id: string, alpha: number, xShift: number): void => {
        const idx = Number(id);
        const val = idx >= 0 && idx < arr.length ? String(arr[idx]) : id;
        const x = 12 + slot * (cellW + gap) + xShift;
        ctx.globalAlpha = alpha;
        roundRect(ctx, x, y, cellW, cellH, 4);
        ctx.fillStyle = COLORS.chipActive;
        ctx.fill();
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 13px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(val, x + cellW / 2, y + cellH / 2);
        ctx.globalAlpha = 1;
      };

      if (shrank && prevItems.length > 0) {
        // Dequeue: ô đầu trượt sang trái + mờ, phần còn lại trượt trái 1 slot
        const outId = prevItems[0];
        const shift = -(cellW + gap) * t;
        for (let s = 1; s < prevItems.length; s++) {
          drawCell(Math.min(s - 1, maxCells - 1), prevItems[s], 1, shift);
        }
        // Ô đang bay ra
        drawCell(0, outId, 1 - t, -t * (cellW + 24));
      } else if (grew && prevItems.length > 0) {
        // Enqueue: ô mới trượt vào từ bên phải
        for (let s = 0; s < prevItems.length; s++) {
          drawCell(Math.min(s, maxCells - 1), prevItems[s], 1, 0);
        }
        const newId = items[items.length - 1];
        const slot = Math.min(items.length - 1, maxCells - 1);
        drawCell(slot, newId, Math.min(1, t * 2), (1 - t) * (cellW + 24));
      } else {
        for (let s = 0; s < items.length; s++) {
          if (s >= maxCells) break;
          drawCell(s, items[s], 1, 0);
        }
      }
    } else {
      // ── STACK: cột dọc LIFO ──
      const labelY = structTop + 6;
      ctx.fillStyle = COLORS.textDim;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        pb.algorithmId === 'monotonic-stack' ? 'STACK ĐƠN ĐIỆU — LIFO (đỉnh ở trên)' : 'STACK — LIFO (đỉnh ở trên)',
        12, labelY,
      );

      const cellW = 60;
      const gap = 6;
      const x = 12;
      const baseY = structTop + structH - 4;
      const maxCells = Math.floor(structH / (cellH + gap));

      const drawCell = (slot: number, id: string, alpha: number, yShift: number): void => {
        const idx = Number(id);
        const val = idx >= 0 && idx < arr.length ? String(arr[idx]) : id;
        const cy = baseY - (slot + 1) * (cellH + gap) + gap + yShift;
        ctx.globalAlpha = alpha;
        roundRect(ctx, x, cy, cellW, cellH, 4);
        ctx.fillStyle = COLORS.chipActive;
        ctx.fill();
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 13px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(val, x + cellW / 2, cy + cellH / 2);
        ctx.globalAlpha = 1;
      };

      if (grew && prevItems.length > 0) {
        // Push: ô mới trượt từ trên xuống đỉnh
        for (let s = 0; s < prevItems.length; s++) {
          drawCell(Math.min(s, maxCells - 1), prevItems[s], 1, 0);
        }
        const newId = items[items.length - 1];
        const slot = Math.min(items.length - 1, maxCells - 1);
        drawCell(slot, newId, Math.min(1, t * 2), -t * (cellH + gap));
      } else if (shrank && prevItems.length > 0) {
        // Pop: ô đỉnh trượt lên + mờ; phần còn lại giữ nguyên
        for (let s = 0; s < prevItems.length - 1; s++) {
          drawCell(Math.min(s, maxCells - 1), prevItems[s], 1, 0);
        }
        const poppedId = prevItems[prevItems.length - 1];
        const poppedSlot = Math.min(prevItems.length - 1, maxCells - 1);
        drawCell(poppedSlot, poppedId, 1 - t, -t * (cellH + gap));
      } else {
        for (let s = 0; s < items.length; s++) {
          if (s >= maxCells) break;
          drawCell(s, items[s], 1, 0);
        }
      }
    }

    drawSnapshotOverlays(ctx, w, h, curr, true);
  }
}
