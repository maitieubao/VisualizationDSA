import type { CanvasStateSnapshot, MergeSortState } from '../../../core/CompilerStepExecutor';
import { COLORS, maxWithFallback, minWithFallback, roundRect } from '../renderer/algoCanvasHelpers';

/**
 * Animation engine RIÊNG cho Merge Sort.
 *
 * Khác với pipeline swap/compare chung của SortingAnimationEngine, engine này vẽ
 * toàn bộ quá trình CHIA – TRỘN:
 *   Tier 1: mảng gốc với vùng segment [low..high] đang xử lý (nửa trái/phải tô khác màu)
 *   Tier 2: hai hàng subarray L / R với con trỏ so sánh leftIdx / rightIdx
 *   Tier 3: hàng output đang điền dần từng phần tử
 *
 * Hoàn toàn data-driven: chỉ vẽ từ `snapshot.mergeState` do compiler cấp qua hook
 * `setMergeState(...)` — không chứa bất kỳ logic thuật toán nào.
 */
export class MergeSortAnimationEngine {
  private static shared: MergeSortAnimationEngine | null = null;

  /** Singleton (engine stateless — chỉ cần 1 instance dùng chung). */
  public static instance(): MergeSortAnimationEngine {
    if (!MergeSortAnimationEngine.shared) {
      MergeSortAnimationEngine.shared = new MergeSortAnimationEngine();
    }
    return MergeSortAnimationEngine.shared;
  }

  /** Kiểm tra snapshot có phải frame của Merge Sort không (data-driven, không dựa vào algorithmId). */
  public static canHandle(snap: CanvasStateSnapshot): boolean {
    return snap.mergeState !== undefined;
  }

  public draw(ctx: CanvasRenderingContext2D, w: number, h: number, snap: CanvasStateSnapshot): void {
    const st = snap.mergeState;
    if (!st) return;

    ctx.clearRect(0, 0, w, h);
    const arr = snap.array ?? [];

    const M = 8;
    const usableH = h - M * 5;
    const t1h = Math.round(usableH * 0.38);
    const t2h = Math.round(usableH * 0.32);
    const t3h = usableH - t1h - t2h;
    const t1y = M;
    const t2y = t1y + t1h + M;
    const t3y = t2y + t2h + M;

    this.drawMainArray(ctx, w, arr, st, t1y, t1h, M);
    this.drawSubArrays(ctx, w, st, t2y, t2h, M);
    this.drawOutput(ctx, w, st, t3y, t3h, M);
    this.drawPhaseLabel(ctx, w, st, t1y);
  }

  // ── Tier 1: mảng gốc với vùng segment ──

  private drawMainArray(
    ctx: CanvasRenderingContext2D,
    w: number,
    arr: number[],
    st: MergeSortState,
    y: number,
    h: number,
    M: number,
  ): void {
    if (arr.length === 0) return;
    const minV = minWithFallback(arr, 0);
    const maxV = maxWithFallback(arr, 1);
    const span = Math.max(maxV - minV, 1);
    const gap = 3;
    const barW = Math.max(3, (w - M * 2 - gap * (arr.length - 1)) / arr.length);
    // AL-039: baseline 0 như SortingAnimationEngine.computeGeo — số âm đâm xuống dưới
    // baseline (trước đây mọi giá trị âm vẽ bar 3px nằm đáy).
    const usableH = h - 16;
    const baseY = y + h;
    const zeroY = baseY - ((0 - minV) / span) * usableH;

    // Vùng segment [low..high] — nửa trái / nửa phải tô mờ khác màu (không kẻ viền)
    if (st.low <= st.high && st.high < arr.length) {
      const segX = M + st.low * (barW + gap) - 2;
      const segW = (st.high - st.low + 1) * (barW + gap) - gap + 4;
      ctx.fillStyle = 'rgba(245,158,11,0.10)';
      ctx.fillRect(segX, y, segW, h);
      if (st.mid >= st.low && st.mid < st.high) {
        const midX = M + (st.mid + 1) * (barW + gap) - 2;
        ctx.fillStyle = 'rgba(99,102,241,0.10)';
        ctx.fillRect(midX, y, segX + segW - midX, h);
      }
    }

    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      const top = zeroY - ((v - minV) / span) * usableH;
      const barH = Math.max(3, v >= 0 ? zeroY - top : top - zeroY);
      const x = M + i * (barW + gap);
      const by = v >= 0 ? top : zeroY;
      const inSeg = i >= st.low && i <= st.high;
      roundRect(ctx, x, by, barW, barH, 3);
      ctx.fillStyle = inSeg ? COLORS.barSegment : COLORS.barDefault;
      ctx.fill();
      if (barW >= 6 && barH >= 8) {
        ctx.fillStyle = COLORS.text;
        ctx.font = '10px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(arr[i]), x + barW / 2, by - 2);
      }
    }
  }

  // ── Tier 2: hai hàng L / R với con trỏ ──

  private drawSubArrays(
    ctx: CanvasRenderingContext2D,
    w: number,
    st: MergeSortState,
    y: number,
    h: number,
    M: number,
  ): void {
    const rowH = Math.floor(h / 2) - 2;
    this.drawChipRow(ctx, w, 'L', st.left, st.leftIdx, y, rowH, M);
    this.drawChipRow(ctx, w, 'R', st.right, st.rightIdx, y + rowH + 4, rowH, M);
  }

  private drawChipRow(
    ctx: CanvasRenderingContext2D,
    w: number,
    label: string,
    values: number[],
    activeIdx: number,
    y: number,
    h: number,
    M: number,
  ): void {
    const labelW = 24;
    ctx.fillStyle = COLORS.textDim;
    ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, M, y + h / 2);

    const maxChips = Math.max(values.length, 1);
    const gap = 6;
    const chipW = Math.max(14, (w - M * 2 - labelW - gap * (maxChips - 1)) / maxChips);
    for (let i = 0; i < values.length; i++) {
      const cx = M + labelW + i * (chipW + gap);
      const active = i === activeIdx;
      roundRect(ctx, cx, y + 4, chipW, h - 8, 4);
      ctx.fillStyle = active ? COLORS.chipActive : COLORS.chipBg;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(8, Math.min(12, Math.round(chipW * 0.5)))}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(values[i]), cx + chipW / 2, y + h / 2);
    }
  }

  // ── Tier 3: output đang điền ──

  private drawOutput(
    ctx: CanvasRenderingContext2D,
    w: number,
    st: MergeSortState,
    y: number,
    h: number,
    M: number,
  ): void {
    const labelW = 30;
    ctx.fillStyle = COLORS.textDim;
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('OUT', M, y + h / 2);

    const maxOut = Math.max(st.output.length, 1);
    const gap = 6;
    const chipW = Math.max(14, (w - M * 2 - labelW - gap * (maxOut - 1)) / maxOut);
    for (let i = 0; i < st.output.length; i++) {
      const v = st.output[i];
      if (v === null || v === undefined) continue;
      const cx = M + labelW + i * (chipW + gap);
      roundRect(ctx, cx, y + 4, chipW, h - 8, 4);
      ctx.fillStyle = COLORS.chipOut;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(8, Math.min(12, Math.round(chipW * 0.5)))}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(v), cx + chipW / 2, y + h / 2);
    }
    // Slot kế tiếp (đang điền) — tô nhẹ để người học biết vị trí sắp ghi
    const nextIdx = st.output.length;
    if (nextIdx < (st.high - st.low + 1)) {
      const cx = M + labelW + nextIdx * (chipW + gap);
      roundRect(ctx, cx, y + 4, chipW, h - 8, 4);
      ctx.fillStyle = COLORS.chipSlot;
      ctx.fill();
    }
  }

  // ── Phase label ──

  private drawPhaseLabel(ctx: CanvasRenderingContext2D, w: number, st: MergeSortState, y: number): void {
    const phaseLabel = st.phase === 'divide' ? '01 CHIA' : '02 TRỘN';
    ctx.fillStyle = COLORS.textDim;
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${phaseLabel} · width=${st.width} · [${st.low}..${st.high}]`, w - 12, y + 6);
  }
}
