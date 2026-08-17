import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { COLORS } from '../../renderer/colors';
import { easeInOut, minWithFallback, roundRect } from '../../renderer/geometry';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer RIÊNG cho Radix Sort — input row + 10 cột xô + animation bay input↔xô.
 * Data-driven: vẽ từ snapshot.radixStep / activeDigitPlace / radixBuckets /
 * comparingIndices — không chứa logic thuật toán.
 */
export class RadixSortRenderer implements AlgoRenderer {
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
    const step = curr.radixStep ?? 'distribute';
    const place = curr.activeDigitPlace ?? 1;
    const buckets = curr.radixBuckets ?? [];
    const comparing = (curr.comparingIndices ?? []) as number[];
    if (arr.length === 0) return;

    const M = 8;
    const offset = arr.length > 0 ? -minWithFallback(arr, 0) : 0;
    const placeLabel = place === 1 ? 'đơn vị' : place === 10 ? 'chục' : place === 100 ? 'trăm' : '10^' + Math.log10(place);
    const isDist = step !== 'collect';
    const activeIdx = (comparing[0] ?? -1);
    const activeVal = activeIdx >= 0 && activeIdx < arr.length ? arr[activeIdx] : -1;

    // ── How many items are visible in the input row ──
    // Distribute: items move DOWN to buckets → input shrinks
    // Collect: items move UP from buckets → input grows
    const totalInBuckets = buckets.reduce((s, b) => s + b.length, 0);
    const inputVisibleCount = isDist
      ? Math.max(0, arr.length - totalInBuckets)
      : Math.min(arr.length, arr.length - totalInBuckets);

    // ── Shared cell dimensions (input row + buckets identical) ──
    const labelH = 24;
    const bucketGap = 8;
    const cellW = Math.max(28, (w - M * 2 - bucketGap * 9) / 10);
    const itemW = cellW * 0.70;
    const itemH = 56;
    const itemGap = 10;

    // Input row: same cell size as buckets
    const inputH = itemH + 16;
    const bucketAreaTop = M + inputH + labelH;
    const bucketH = h - bucketAreaTop - M;
    const inputGap = 6;

    // ── Input row positions (centered cells, same size as bucket items) ──
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
      const prevBuckets = prev.radixBuckets ?? [];
      const val = arr[collectIdx];
      for (let b = 0; b < 10; b++) {
        const idx = (prevBuckets[b] ?? []).indexOf(val);
        if (idx >= 0) { collectSrcBucket = b; collectSrcSlot = idx; break; }
      }
    }

    // ── Draw input row ──
    for (let i = 0; i < arr.length; i++) {
      if (isDist) {
        // Distribute: items leave input left→right (index 0 first)
        if (i < totalInBuckets) continue;
      } else {
        // Collect: items return input left→right (index 0 first)
        if (i >= inputVisibleCount) continue;
      }

      const p = inputPos[i];
      const digit = Math.floor((arr[i] + offset) / place) % 10;
      roundRect(ctx, p.x, p.y, p.w, p.h, 4);
      ctx.fillStyle = COLORS.barDefault;
      ctx.fill();
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 22px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(arr[i]), p.x + p.w / 2, p.y + p.h / 2 - 6);
      ctx.font = '11px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = COLORS.textDim;
      ctx.fillText('d' + digit, p.x + p.w / 2, p.y + p.h / 2 + 14);
    }

    // ── Phase label ──
    ctx.fillStyle = isDist ? COLORS.foundGlow : COLORS.barSorted;
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.fillText((isDist ? '▼ PHÂN PHỐI' : '▲ THU HOẠCH') + ' — hàng ' + placeLabel, M + 2, M + inputH + 14);

    // ── 10 bucket columns ──
    const bucketY = bucketAreaTop;
    for (let b = 0; b < 10; b++) {
      const bx = M + b * (cellW + bucketGap);
      const items = buckets[b] ?? [];
      const isActiveBucket = isDist && Math.floor((activeVal + offset) / place) % 10 === b;

      // Bucket bg
      roundRect(ctx, bx + 1, bucketY, cellW - 2, bucketH, 4);
      ctx.fillStyle = isActiveBucket ? COLORS.rangeActive : COLORS.nodePruned;
      ctx.fill();
      ctx.strokeStyle = isActiveBucket ? COLORS.foundGlow : COLORS.edgeDefault;
      ctx.lineWidth = isActiveBucket ? 2 : 1;
      ctx.stroke();

      // Bucket label
      ctx.fillStyle = isActiveBucket ? COLORS.foundGlow : COLORS.textDim;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('[' + b + ']', bx + cellW / 2, bucketY + 6);

      // Items: exclude in-flight elements
      const itemStartY = bucketY + 24;
      let renderItems = items;
      if (isDist && activeIdx >= 0 && activeIdx < arr.length && b === Math.floor((activeVal + offset) / place) % 10) {
        const idx = items.indexOf(activeVal);
        if (idx >= 0) renderItems = [...items.slice(0, idx), ...items.slice(idx + 1)];
      }
      // Collect: exclude the element being collected from this bucket
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
          ctx.fillText('+' + (renderItems.length - j), bx + cellW / 2, iy + 2);
          break;
        }
        const ix = bx + (cellW - itemW) / 2;
        roundRect(ctx, ix, iy, itemW, itemH, 4);
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fill();
        ctx.strokeStyle = COLORS.edgeDefault;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 22px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(renderItems[j]), ix + itemW / 2, iy + itemH / 2);
      }
    }

    // ── Movement animation (distribute: input → bucket) ──
    if (isDist && activeIdx >= 0 && activeIdx < arr.length) {
      const src = inputPos[activeIdx];
      const targetBucket = Math.floor((activeVal + offset) / place) % 10;
      const dstX = M + targetBucket * (cellW + bucketGap) + (cellW - itemW) / 2;
      const bucketItems = buckets[targetBucket] ?? [];
      const slotIdx = Math.max(0, bucketItems.length - 1);
      const dstY = bucketY + 24 + slotIdx * (itemH + itemGap);
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
      const srcX = M + collectSrcBucket * (cellW + bucketGap) + (cellW - itemW) / 2;
      const srcY = bucketY + 24 + collectSrcSlot * (itemH + itemGap);
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
