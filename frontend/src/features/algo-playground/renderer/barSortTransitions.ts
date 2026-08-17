import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { drawPlaybackFrame, drawPlaybackFrameTransition } from './playbackFrame';
import { COLORS } from './colors';
import { easeInOut, easeOut, lerp, lerpColor, maxWithFallback, minWithFallback, roundRect } from './geometry';
import { drawSnapshotOverlays } from './overlays';
import type { PlaybackContext } from '../engine/renderers/types';

export interface BarGeo {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Pipeline thanh mảng dùng chung (generic bar pipeline):
 * - Frame tĩnh → drawPlaybackFrame (array/tree/graph + overlays)
 * - Transition tree/graph → drawPlaybackFrameTransition (lerp màu)
 * - Transition bar → swap parabol / compare pulse / highlight pop / move slide
 *
 * Dùng bởi ArraySortingRenderer, SearchingRenderer, TwoPointersRenderer,
 * StackQueueRenderer, TreeRenderer, GraphRenderer (P2) — tách nhỏ dần ở P3.
 */
export class BarTransitionPipeline {
  private geoCache: { ref: number[]; w: number; h: number; bars: BarGeo[] } | null = null;

  // EC-022/AL-033: `Math.min(...arr)` / `Math.max(...arr)` spread vỡ stack khi mảng
  // hàng chục nghìn phần tử — dùng vòng lặp O(n) thay thế.
  computeGeo(arr: number[], w: number, h: number): BarGeo[] {
    const margin = 32;
    const gap = 10;
    const n = arr.length;
    if (n === 0) return [];
    if (this.geoCache && this.geoCache.ref === arr && this.geoCache.w === w && this.geoCache.h === h) {
      return this.geoCache.bars;
    }
    const minV = minWithFallback(arr, 0);
    const maxV = maxWithFallback(arr, 1);
    const span = Math.max(maxV - minV, 1);
    const usableW = w - margin * 2;
    const maxBarW = 80;
    const barW = Math.min(maxBarW, Math.max(2, (usableW - gap * (n - 1)) / n));
    const totalBarsW = n * barW + (n - 1) * gap;
    const barOffset = margin + (usableW - totalBarsW) / 2;
    const usableH = h - margin * 2;
    const baseY = h - margin;
    // Baseline 0: số dương dựng lên trên, số âm đâm xuống dưới
    const zeroY = baseY - ((0 - minV) / span) * usableH;
    const bars: BarGeo[] = new Array<BarGeo>(n);
    for (let i = 0; i < n; i++) {
      const v = arr[i];
      const top = zeroY - ((v - minV) / span) * usableH;
      const y = v >= 0 ? top : zeroY;
      const hh = Math.max(3, v >= 0 ? zeroY - top : top - zeroY);
      bars[i] = { index: i, x: barOffset + i * (barW + gap), y, w: barW, h: hh };
    }
    this.geoCache = { ref: arr, w, h, bars };
    return bars;
  }

  fillBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, label: string): void {
    roundRect(ctx, x, y, w, Math.max(3, h), 3);
    ctx.fillStyle = color;
    ctx.fill();
    // Border to separate adjacent bars visually
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (label && h > 18 && w >= 8) {
      const fontSize = Math.max(7, Math.min(12, Math.round(w * 0.55)));
      ctx.fillStyle = COLORS.barText;
      ctx.font = `bold ${fontSize}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, x + w / 2, y - 2);
    }
  }

  getColor(snap: CanvasStateSnapshot, idx: number): string {
    const swapping = (snap.swappingIndices ?? []) as number[];
    const comparing = (snap.comparingIndices ?? []) as number[];
    const sorted = (snap.highlightedIndices ?? []) as number[];
    if (swapping.includes(idx)) return COLORS.barSwap;
    if (comparing.includes(idx)) return COLORS.barCompare;
    if (sorted.includes(idx)) return COLORS.barSorted;
    return COLORS.barDefault;
  }

  /** Vẽ frame hiện tại hoặc transition prev→curr (generic pipeline). */
  draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    prev: CanvasStateSnapshot | null,
    curr: CanvasStateSnapshot,
    progress: number,
    pb: PlaybackContext,
  ): void {
    if (!prev || progress >= 1) {
      drawPlaybackFrame(ctx, w, h, curr);
      return;
    }

    // Tree/Graph: nội suy màu trạng thái giữa 2 frame (không nhảy cóc)
    const handled = drawPlaybackFrameTransition(ctx, w, h, prev, curr, easeInOut(progress));
    if (handled) return;

    switch (pb.transition) {
      case 'swap': this.drawSwap(ctx, w, h, prev, curr, progress, pb.swapPair); break;
      case 'compare': this.drawCompare(ctx, w, h, curr, progress, pb.comparePair); break;
      case 'highlight': this.drawHighlight(ctx, w, h, curr, progress, pb.highlightIdx); break;
      default: this.drawMove(ctx, w, h, prev, curr, progress); break;
    }

    // Overlay phải tồn tại CẢ trong lúc transition — trước đây badge (target,
    // counter, callstack...) biến mất khi transition đang chạy rồi hiện lại.
    drawSnapshotOverlays(ctx, w, h, curr);
  }

  // ─── SWAP animation: parabolic arc ───

  private drawSwap(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    p: CanvasStateSnapshot,
    c: CanvasStateSnapshot,
    progress: number,
    swapPair: [number, number] | null,
  ): void {
    const t = easeInOut(progress);
    if (!swapPair) return;
    const [a, b] = swapPair;

    const prevGeo = this.computeGeo(p.array, w, h);
    const currGeo = this.computeGeo(c.array, w, h);

    if (a >= prevGeo.length || b >= prevGeo.length) return;

    const arcH = Math.max(30, (h - h * 0.2) * 0.3);

    const posA = {
      x: lerp(prevGeo[a].x, prevGeo[b].x, t),
      y: prevGeo[a].y - arcH * Math.sin(Math.PI * t),
      h: lerp(prevGeo[a].h, currGeo[b].h, t),
      w: prevGeo[a].w,
    };
    const posB = {
      x: lerp(prevGeo[b].x, prevGeo[a].x, t),
      y: prevGeo[b].y - arcH * Math.sin(Math.PI * t) * 0.7,
      h: lerp(prevGeo[b].h, currGeo[a].h, t),
      w: prevGeo[b].w,
    };

    // Draw non-swapping bars
    for (let i = 0; i < currGeo.length; i++) {
      if (i === a || i === b) continue;
      const g = prevGeo[i];
      const hh = lerp(prevGeo[i].h, currGeo[i].h, t);
      ctx.fillStyle = COLORS.barDefault;
      roundRect(ctx, g.x, g.y - (hh - g.h), g.w, hh, 3);
      ctx.fill();
    }

    // Draw swapping bars
    const colA = lerpColor(COLORS.barSwap, COLORS.barDefault, t);
    this.fillBar(ctx, posA.x, posA.y - (posA.h - prevGeo[a].h), posA.w, posA.h, colA, String(c.array[b]));
    const colB = lerpColor(COLORS.barSwap, COLORS.barDefault, t);
    this.fillBar(ctx, posB.x, posB.y - (posB.h - prevGeo[b].h), posB.w, posB.h, colB, String(c.array[a]));
  }

  // ─── COMPARE animation: pulse glow ───

  private drawCompare(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    c: CanvasStateSnapshot,
    progress: number,
    comparePair: [number, number] | null,
  ): void {
    const t = easeInOut(progress);
    const scale = 1 + 0.06 * Math.sin(t * Math.PI);
    const alpha = 0.3 + 0.4 * Math.sin(t * Math.PI);
    if (!comparePair) return;
    const [i, j] = comparePair;

    const geo = this.computeGeo(c.array, w, h);

    for (let idx = 0; idx < geo.length; idx++) {
      const g = geo[idx];
      if (idx === i || idx === j) {
        // Glow pulse
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = COLORS.foundGlow;
        ctx.shadowBlur = 20;
        roundRect(ctx, g.x - 2, g.y - 2, g.w + 4, g.h + 4, 4);
        ctx.fill();
        ctx.restore();

        // Scaled bar
        const cx = g.x + g.w / 2;
        const cy = g.y + g.h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
        this.fillBar(ctx, g.x, g.y, g.w, g.h, COLORS.barCompare, String(c.array[idx]));
        ctx.restore();
      } else {
        this.fillBar(ctx, g.x, g.y, g.w, g.h, COLORS.barDefault, String(c.array[idx]));
      }
    }
  }

  // ─── HIGHLIGHT animation: pop + fade to green ───

  private drawHighlight(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    c: CanvasStateSnapshot,
    progress: number,
    highlightIdx: number,
  ): void {
    const t = easeOut(progress);
    const idx = highlightIdx;
    const scale = 1 + 0.12 * (1 - t);
    const color = lerpColor(COLORS.barDefault, COLORS.barSorted, t);
    const geo = this.computeGeo(c.array, w, h);

    for (let i = 0; i < geo.length; i++) {
      const g = geo[i];
      if (i === idx) {
        ctx.save();
        ctx.shadowColor = COLORS.barSorted;
        ctx.shadowBlur = 8 + 12 * (1 - t);
        const cx = g.x + g.w / 2;
        const cy = g.y + g.h / 2;
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
        this.fillBar(ctx, g.x, g.y, g.w, g.h, color, String(c.array[idx]));
        ctx.restore();
      } else {
        const isSorted = c.highlightedIndices?.includes(i);
        this.fillBar(ctx, g.x, g.y, g.w, g.h, isSorted ? COLORS.barSorted : COLORS.barDefault, String(c.array[i]));
      }
    }
  }

  // ─── MOVE animation: smooth slide ───

  private drawMove(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    p: CanvasStateSnapshot,
    c: CanvasStateSnapshot,
    progress: number,
  ): void {
    const t = easeOut(progress);

    const prevGeo = this.computeGeo(p.array, w, h);
    const currGeo = this.computeGeo(c.array, w, h);
    const n = Math.max(prevGeo.length, currGeo.length);

    for (let i = 0; i < n; i++) {
      const pg = prevGeo[i] ?? { x: 0, y: 0, h: 0, w: 0 };
      const cg = currGeo[i] ?? { x: 0, y: 0, h: 0, w: 0 };
      const x = lerp(pg.x, cg.x, t);
      const hh = lerp(pg.h, cg.h, t);
      const y = currGeo[i] ? cg.y - (cg.h - hh) : 0;
      const color = this.getColor(c, i);
      this.fillBar(ctx, x, y, pg.w, Math.max(3, hh), color, String(c.array[i] ?? ''));
    }
  }
}
