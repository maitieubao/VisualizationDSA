import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { COLORS } from '../../renderer/colors';
import { easeInOut, maxWithFallback, minWithFallback, roundRect } from '../../renderer/geometry';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer RIÊNG cho Counting Sort — 3 tầng: input → lưới đếm → output.
 * Animation: phase "count" → thanh giá trị bay từ input sang ô đếm;
 * phase "output" → giá trị bay từ ô đếm sang slot output.
 * Data-driven: vẽ từ snapshot.countArray / countingStep / outputArray /
 * comparingIndices — không chứa logic thuật toán.
 */
export class CountingSortRenderer implements AlgoRenderer {
  private layout(
    w: number,
    h: number,
    arrLen: number,
    countLen: number,
  ): {
    M: number; t1y: number; t1h: number; t2y: number; t2h: number; t3y: number; t3h: number;
    barW: number; barGap: number; cellW: number; cellGap: number; cells: number;
  } {
    const M = 8;
    const barGap = 6;
    const barW = Math.max(6, (w - M * 2 - barGap * (arrLen - 1)) / arrLen);
    const gapY = 8;
    const zoneH = (h - M * 2 - gapY * 2) / 3;
    const t1y = M;
    const t1h = zoneH;
    const t2y = t1y + t1h + gapY;
    const t2h = zoneH;
    const t3y = t2y + t2h + gapY;
    const t3h = zoneH;
    const cellGap = 4;
    const cells = Math.max(10, Math.min(countLen, 24));
    const cellW = Math.max(14, (w - M * 2 - cellGap * (cells - 1)) / cells);
    return { M, t1y, t1h, t2y, t2h, t3y, t3h, barW, barGap, cellW, cellGap, cells };
  }

  draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    prev: CanvasStateSnapshot | null,
    curr: CanvasStateSnapshot,
    progress: number,
    _pb: PlaybackContext,
  ): void {
    const arr = curr.array ?? [];
    const countArr = curr.countArray ?? [];
    const step = curr.countingStep ?? 'count';
    const output = curr.outputArray ?? [];
    const comparing = (curr.comparingIndices ?? []) as number[];
    if (arr.length === 0) return;

    const min = minWithFallback(arr, 0);
    const L = this.layout(w, h, arr.length, countArr.length);
    const { M, t1y, t1h, t2y, t2h, t3y, t3h, barW, barGap, cellW, cellGap, cells } = L;

    // ── Phát hiện chuyển động bay giữa prev → curr ──
    let fly: { x: number; y: number; dx: number; dy: number; value: number } | null = null;
    if (prev && progress < 1) {
      const prevOut = prev.outputArray ?? [];
      if (step === 'count' && (comparing[0] ?? -1) >= 0) {
        const i = comparing[0];
        const d = comparing[1];
        if (d >= 0 && i < arr.length && i !== (prev.comparingIndices ?? [])[0]) {
          const x = M + i * (barW + barGap);
          const y = t1y + t1h - 20;
          const dx = M + d * (cellW + cellGap);
          const dy = t2y + 20;
          fly = { x, y, dx, dy, value: arr[i] };
        }
      } else if (step === 'output' && output.length > prevOut.length) {
        const slotIdx = output.length - 1;
        const v = output[slotIdx];
        if (v !== null && v !== undefined) {
          const d = Math.max(0, Math.min(cells - 1, v - min));
          const x = M + d * (cellW + cellGap);
          const y = t2y + 20;
          const dx = M + slotIdx * (barW + barGap);
          const dy = t3y + 18;
          fly = { x, y, dx, dy, value: v };
        }
      }
    }

    const t = easeInOut(progress);

    // ── Tier 1: Input bars ──
    const minV = minWithFallback(arr, 0);
    const maxV = maxWithFallback(arr, 1);
    const span = Math.max(maxV - minV, 1);
    const inputBarMaxH = t1h - 26;
    for (let i = 0; i < arr.length; i++) {
      const barH = Math.max(4, ((arr[i] - minV) / span) * inputBarMaxH);
      const x = M + i * (barW + barGap);
      const y = t1y + t1h - barH;
      const active = comparing[0] === i;
      // Giảm độ sáng khi thanh đang bay đi
      const flying = fly !== null && i === comparing[0];
      roundRect(ctx, x, y, barW, barH, 3);
      ctx.fillStyle = active ? COLORS.barCompare : COLORS.barDefault;
      if (flying) ctx.globalAlpha = 1 - t;
      ctx.fill();
      ctx.globalAlpha = 1;
      // Border to separate adjacent bars
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, barW, barH, 3);
      ctx.stroke();
      ctx.fillStyle = active ? '#fff' : COLORS.barText;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(arr[i]), x + barW / 2, y - 3);
      ctx.fillStyle = COLORS.textDim;
      ctx.font = '9px "JetBrains Mono", Consolas, monospace';
      ctx.textBaseline = 'top';
      ctx.fillText('[' + i + ']', x + barW / 2, t1y + t1h + 2);
    }

    // ── Tier 2: Counting grid ──
    const cellInnerH = t2h - 30;
    for (let d = 0; d < cells; d++) {
      const cx = M + d * (cellW + cellGap);
      const cellActive =
        (step === 'count' && comparing[1] === d) ||
        (step === 'accumulate' && comparing[0] <= d && d <= comparing[1]) ||
        (step === 'output' && comparing[1] === d);

      roundRect(ctx, cx + 1, t2y + 20, cellW - 2, cellInnerH, 4);
      ctx.fillStyle = cellActive
        ? (step === 'count' ? COLORS.chipSlot : step === 'accumulate' ? COLORS.rangeActive : COLORS.chipSlot)
        : COLORS.nodePruned;
      ctx.fill();
      ctx.strokeStyle = cellActive ? COLORS.foundGlow : COLORS.edgeDefault;
      ctx.lineWidth = cellActive ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = cellActive ? COLORS.foundGlow : COLORS.textDim;
      ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(min !== 0 ? String(d + min) : String(d), cx + cellW / 2, t2y + 4);
      ctx.font = 'bold 14px "JetBrains Mono", Consolas, monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(countArr[d] ?? 0), cx + cellW / 2, t2y + 20 + cellInnerH / 2);
    }

    // ── Tier 3: Output slots ──
    const outBarH = t3h - 30;
    for (let i = 0; i < arr.length; i++) {
      const ox = M + i * (barW + barGap);
      const val = output[i];
      const slotActive = comparing[0] === i;
      roundRect(ctx, ox, t3y + 18, barW, outBarH, 3);
      if (val !== null && val !== undefined) {
        ctx.fillStyle = COLORS.barSorted;
        ctx.fill();
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), ox + barW / 2, t3y + 18 + outBarH / 2);
      } else {
        ctx.fillStyle = COLORS.nodePruned;
        ctx.fill();
        ctx.strokeStyle = slotActive ? COLORS.chipSlot : COLORS.edgeDefault;
        ctx.lineWidth = slotActive ? 2 : 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = COLORS.textDim;
      ctx.font = '9px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('O[' + i + ']', ox + barW / 2, t3y + 18 + outBarH + 3);
    }

    // ── Flying ghost ──
    if (fly) {
      const cx = fly.x + (fly.dx - fly.x) * t;
      const cy = fly.y + (fly.dy - fly.y) * t;
      ctx.shadowColor = COLORS.foundGlow;
      ctx.shadowBlur = 12;
      roundRect(ctx, cx, cy, barW, Math.max(14, outBarH * 0.5), 4);
      ctx.fillStyle = COLORS.foundGlow;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(fly.value), cx + barW / 2, cy + Math.max(14, outBarH * 0.5) / 2);
    }

    // Phase label
    const phaseLabels: Record<string, string> = { count: '▼ 01 ĐẾM', accumulate: '▼ 02 CỘNG DỒN', output: '▲ 03 DỰNG OUTPUT' };
    ctx.fillStyle = COLORS.foundGlow;
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(phaseLabels[step] ?? '', w - M, t2y + 12);
  }
}
