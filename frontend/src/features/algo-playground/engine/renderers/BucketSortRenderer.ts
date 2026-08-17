import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { COLORS } from '../../renderer/colors';
import { easeInOut, roundRect } from '../../renderer/geometry';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer RIÊNG cho Bucket Sort — input row + N cột xô theo khoảng giá trị
 * + animation bay input↔xô. Data-driven: vẽ từ snapshot.bucketStep /
 * bucketSortBuckets / bucketSortActiveIdx / bucketRangeLabels / comparingIndices
 * — không chứa logic thuật toán.
 */
export class BucketSortRenderer implements AlgoRenderer {
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
    const buckets = curr.bucketSortBuckets ?? [];
    const step = curr.bucketStep ?? 'distribute';
    const activeB = curr.bucketSortActiveIdx ?? -1;
    const rangeLabels = curr.bucketRangeLabels ?? [];
    const comparing = (curr.comparingIndices ?? []) as number[];
    const comparePair = curr.bucketSortComparingBucketIndices;
    if (arr.length === 0) return;

    const M = 8;
    const bucketCount = Math.max(1, buckets.length);
    const isDist = step === 'distribute';
    const activeIdx = (comparing[0] ?? -1);
    const activeVal = activeIdx >= 0 && activeIdx < arr.length ? arr[activeIdx] : -1;

    // ── How many items are visible in the input row ──
    const totalInBuckets = buckets.reduce((s, b) => s + b.length, 0);
    const inputVisibleCount = step === 'sort'
      ? arr.length
      : isDist
        ? Math.max(0, arr.length - totalInBuckets)
        : Math.min(arr.length, arr.length - totalInBuckets);

    // ── Shared cell dimensions (input + bucket identical) ──
    const labelH = 24;
    const bucketGap = 8;
    const colW = Math.max(40, (w - M * 2 - (bucketCount - 1) * bucketGap) / bucketCount);
    const itemW = colW * 0.70;
    const itemH = 56;
    const itemGap = 10;

    const inputH = itemH + 16;
    const bucketAreaTop = M + inputH + labelH;
    const bucketH = h - bucketAreaTop - M;
    const inputGap = 6;

    // ── Input row positions (same cell size as buckets) ──
    const inputSlotW = (w - M * 2 - inputGap * (arr.length - 1)) / arr.length;
    const inputCellW = Math.min(itemW, inputSlotW);
    const inputPos = arr.map((_: number, i: number) => ({
      x: M + i * (inputSlotW + inputGap) + (inputSlotW - inputCellW) / 2,
      y: M + 8,
      w: inputCellW,
      h: itemH,
    }));

    // ── Collect: find source bucket from previous snapshot ──
    const collectIdx = !isDist ? activeIdx : -1;
    let collectSrcBucket = -1;
    let collectSrcSlot = -1;
    if (collectIdx >= 0 && collectIdx < arr.length && prev) {
      const prevBuckets = prev.bucketSortBuckets ?? [];
      const val = arr[collectIdx];
      for (let b = 0; b < bucketCount; b++) {
        const idx = (prevBuckets[b] ?? []).indexOf(val);
        if (idx >= 0) { collectSrcBucket = b; collectSrcSlot = idx; break; }
      }
    }

    // ── Draw input row ──
    for (let i = 0; i < arr.length; i++) {
      if (isDist) {
        if (i < totalInBuckets) continue;
      } else {
        if (i >= inputVisibleCount) continue;
      }

      const p = inputPos[i];
      roundRect(ctx, p.x, p.y, p.w, p.h, 4);
      ctx.fillStyle = COLORS.barDefault;
      ctx.fill();
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 22px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(arr[i]), p.x + p.w / 2, p.y + p.h / 2);
    }

    // ── Phase label ──
    const phaseLabel = step === 'distribute' ? '▼ PHÂN PHỐI' : step === 'sort' ? '▼ SẮP XẾP' : '▲ THU GOM';
    ctx.fillStyle = COLORS.foundGlow;
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(phaseLabel, M + 2, M + inputH + 14);

    // ── Bucket columns ──
    const bucketY = bucketAreaTop;
    for (let b = 0; b < bucketCount; b++) {
      const bx = M + b * (colW + bucketGap);
      const items = buckets[b] ?? [];
      const isActive = activeB === b;

      roundRect(ctx, bx + 1, bucketY, colW - 2, bucketH, 4);
      ctx.fillStyle = isActive ? COLORS.rangeActive : COLORS.nodePruned;
      ctx.fill();
      ctx.strokeStyle = isActive ? COLORS.foundGlow : COLORS.edgeDefault;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isActive ? COLORS.foundGlow : COLORS.textDim;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('B' + b, bx + colW / 2, bucketY + 6);
      ctx.font = '9px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(rangeLabels[b] ?? '', bx + colW / 2, bucketY + 20);

      // Items: exclude in-flight elements
      const itemStartY = bucketY + 36;
      let renderItems = items;
      if (isDist && activeIdx >= 0 && activeIdx < arr.length && activeB === b) {
        const idx = items.indexOf(activeVal);
        if (idx >= 0) renderItems = [...items.slice(0, idx), ...items.slice(idx + 1)];
      }
      if (!isDist && collectSrcBucket === b && collectSrcSlot >= 0) {
        renderItems = [...items.slice(0, collectSrcSlot), ...items.slice(collectSrcSlot + 1)];
      }

      for (let j = 0; j < renderItems.length; j++) {
        const iy = itemStartY + j * (itemH + itemGap);
        if (iy + itemH > bucketY + bucketH - 4) {
          ctx.fillStyle = COLORS.textDim;
          ctx.font = '10px "JetBrains Mono", Consolas, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('+' + (renderItems.length - j), bx + colW / 2, iy + 2);
          break;
        }
        const isCompare = step === 'sort' && isActive && comparePair !== null && comparePair !== undefined &&
          (comparePair[0] === j || comparePair[1] === j);
        const ix = bx + (colW - itemW) / 2;
        roundRect(ctx, ix, iy, itemW, itemH, 4);
        ctx.fillStyle = isCompare ? 'rgba(61,153,112,0.35)' : 'rgba(255,255,255,0.07)';
        ctx.fill();
        ctx.strokeStyle = isCompare ? COLORS.foundGlow : COLORS.edgeDefault;
        ctx.lineWidth = isCompare ? 2 : 1;
        ctx.stroke();
        ctx.fillStyle = isCompare ? COLORS.text : COLORS.textDim;
        ctx.font = (isCompare ? 'bold 22px' : '20px') + ' "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(renderItems[j]), ix + itemW / 2, iy + itemH / 2);
      }
    }

    // ── Movement animation (distribute: input → bucket) ──
    if (isDist && activeIdx >= 0 && activeIdx < arr.length && activeB >= 0) {
      const src = inputPos[activeIdx];
      const dstX = M + activeB * (colW + bucketGap) + (colW - itemW) / 2;
      const bucketItems = buckets[activeB] ?? [];
      const slotIdx = Math.max(0, bucketItems.length - 1);
      const dstY = bucketY + 36 + slotIdx * (itemH + itemGap);
      const t = easeInOut(progress);
      const cx = src.x + (dstX - src.x) * t;
      const cy = src.y + (dstY - src.y) * t;
      const ch = itemH;

      ctx.shadowColor = COLORS.foundGlow;
      ctx.shadowBlur = 14;
      roundRect(ctx, cx, cy, itemW, ch, 4);
      ctx.fillStyle = COLORS.foundGlow;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(activeVal), cx + itemW / 2, cy + ch / 2);
    }

    // ── Movement animation (collect: bucket → input) ──
    if (!isDist && collectIdx >= 0 && collectIdx < arr.length && collectSrcBucket >= 0) {
      const srcX = M + collectSrcBucket * (colW + bucketGap) + (colW - itemW) / 2;
      const srcY = bucketY + 36 + collectSrcSlot * (itemH + itemGap);
      const dst = inputPos[collectIdx];
      const t = easeInOut(progress);
      const cx = srcX + (dst.x - srcX) * t;
      const cy = srcY + (dst.y - srcY) * t;
      const ch = itemH;

      ctx.shadowColor = COLORS.foundGlow;
      ctx.shadowBlur = 14;
      roundRect(ctx, cx, cy, itemW, ch, 4);
      ctx.fillStyle = COLORS.foundGlow;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(activeVal), cx + itemW / 2, cy + ch / 2);
    }
  }
}
