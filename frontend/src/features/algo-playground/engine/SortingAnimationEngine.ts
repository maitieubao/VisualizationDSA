import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { drawPlaybackFrame, drawPlaybackFrameTransition } from '../renderer/algoCanvasHelpers';
import { MergeSortAnimationEngine } from './MergeSortAnimationEngine';
import { HeapSortAnimationEngine } from './HeapSortAnimationEngine';

// ─── Easing ───
function easeOut(t: number): number { return 1 - (1 - t) ** 3; }
function easeInOut(t: number): number { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }

function lerpColor(from: string, to: string, t: number): string {
  if (from === to) return from;
  const f = parseColor(from);
  const tgt = parseColor(to);
  return `rgb(${Math.round(lerp(f.r, tgt.r, t))},${Math.round(lerp(f.g, tgt.g, t))},${Math.round(lerp(f.b, tgt.b, t))})`;
}
function parseColor(hex: string): { r: number; g: number; b: number } {
  if (hex.startsWith('rgb')) { const m = hex.match(/\d+/g); return { r: +(m?.[0] ?? 0), g: +(m?.[1] ?? 0), b: +(m?.[2] ?? 0) }; }
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
}

const COLORS = { barDefault: '#6366f1', barCompare: '#f59e0b', barSwap: '#ef4444', barSorted: '#10b981' };

type TransitionType = 'compare' | 'swap' | 'highlight' | 'move';

interface BarGeo {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export class SortingAnimationEngine {
  // Canvas
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private cssW = 0;
  private cssH = 0;

  // State
  private prev: CanvasStateSnapshot | null = null;
  private curr: CanvasStateSnapshot | null = null;
  private progress = 1;
  private _playing = false;
  private _speed = 1;
  private onFrameAdvance: (() => void) | null = null;

  // Transition detection
  private transition: TransitionType = 'move';
  private swapPair: [number, number] | null = null;
  private comparePair: [number, number] | null = null;
  private highlightIdx = -1;
  private prevArray: number[] = [];

  // Algorithm identity
  private algorithmId = '';

  // ─── Public API ───

  get isPlaying() { return this._playing; }

  setAlgorithm(id: string) { this.algorithmId = id; }

  start(canvas: HTMLCanvasElement, onAdvance: () => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onFrameAdvance = onAdvance;
    this.lastTimestamp = performance.now();
    this.loop();
  }

  destroy() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.canvas = null;
    this.ctx = null;
  }

  setSnapshots(prev: CanvasStateSnapshot | null, current: CanvasStateSnapshot) {
    this.prevArray = prev?.array ?? [];
    this.prev = prev;
    this.curr = current;
    this.detectTransition();
    if (this._playing) {
      // Đang play: bắt đầu transition MỚI từ đầu — nếu giữ progress cũ, transition kế tiếp
      // sẽ "tiếp tục" từ giữa chừng (watcher async có thể trễ 1-2 tick trên máy chậm)
      // → bar vẽ lệch giữa 2 cặp frame → hiện tượng đè/jump chỉ thấy khi chạy tự động.
      this.progress = 0;
    } else {
      this.progress = 1;
      this.drawInterpolated();
    }
  }

  play() { this._playing = true; this.progress = 0; this.lastTimestamp = performance.now(); }
  pause() { this._playing = false; }
  setSpeed(s: number) { this._speed = s; }
  snapToCurrent() { this.progress = 1; this.drawInterpolated(); }

  // ─── RAF loop ───

  private loop = (ts: number = performance.now()): void => {
    if (!this.canvas || !this.ctx) return;
    // Clamp delta ≥ 0: nếu ts < lastTimestamp (RAF restart/đồng hồ nhảy), progress phải
    // KHÔNG lùi — trước đây delta âm làm progress giảm → advance không bao giờ xảy ra.
    const delta = Math.max(0, Math.min(ts - this.lastTimestamp, 32));
    this.lastTimestamp = ts;
    if (this._playing && this.prev && this.curr) {
      const dur = this.transition === 'compare' ? 250 / this._speed : 400 / this._speed;
      this.progress += delta / dur;
      if (this.progress >= 1) {
        this.progress = 0;
        this.onFrameAdvance?.();
        // Không vẽ tick vừa advance: chờ watcher cập nhật snapshots (setSnapshots reset
        // progress về 0) — tránh vẽ transition cũ ở progress 0 rồi lại vẽ transition mới
        // trong cùng chu kỳ, gây nhòe/đè ảnh khi play tự động.
      } else {
        this.drawInterpolated();
      }
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  // ─── Transition detection ───

  private detectTransition() {
    const c = this.curr;
    if (!c) return;
    this.swapPair = null;
    this.comparePair = null;
    this.highlightIdx = -1;

    if (c.swappingIndices && c.swappingIndices.length >= 2) {
      this.transition = 'swap';
      this.swapPair = [c.swappingIndices[0], c.swappingIndices[1]];
    } else if (c.comparingIndices && c.comparingIndices.length >= 2) {
      this.transition = 'compare';
      this.comparePair = [c.comparingIndices[0], c.comparingIndices[1]];
    } else if (c.highlightedIndices && c.highlightedIndices.length > 0) {
      const newHighlights = c.highlightedIndices.filter(i => !(this.prev?.highlightedIndices ?? []).includes(i));
      if (newHighlights.length > 0 && c.array.length > 0) {
        this.transition = 'highlight';
        this.highlightIdx = newHighlights[0];
      } else {
        this.transition = 'move';
      }
    } else {
      this.transition = 'move';
    }
  }

  // ─── Compute bar geometry ───

  private computeGeo(arr: number[]): BarGeo[] {
    const margin = 32; const gap = 3;
    const n = arr.length; if (n === 0) return [];
    const minV = Math.min(...arr, 0);
    const maxV = Math.max(...arr, 1);
    const span = Math.max(maxV - minV, 1);
    const usableW = this.cssW - margin * 2;
    const barW = Math.max(2, (usableW - gap * (n - 1)) / n);
    const usableH = this.cssH - margin * 2;
    const baseY = this.cssH - margin;
    // Baseline 0: số dương dựng lên, số âm đâm xuống
    const zeroY = baseY - ((0 - minV) / span) * usableH;
    return arr.map((v, i) => {
      const top = zeroY - ((v - minV) / span) * usableH;
      const y = v >= 0 ? top : zeroY;
      const h = Math.max(3, v >= 0 ? zeroY - top : top - zeroY);
      return {
        index: i,
        x: margin + i * (barW + gap),
        y,
        w: barW,
        h,
      };
    });
  }

  // ─── Master draw ───

  private drawInterpolated() {
    const ctx = this.ctx; const canvas = this.canvas;
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.cssW = canvas.clientWidth;
    this.cssH = canvas.clientHeight;
    if (this.cssW < 8 || this.cssH < 8) return;
    if (canvas.width !== Math.round(this.cssW * dpr) || canvas.height !== Math.round(this.cssH * dpr)) {
      canvas.width = Math.round(this.cssW * dpr);
      canvas.height = Math.round(this.cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Luôn clear trước khi vẽ — các nhánh transition (swap/compare/highlight/move)
    // không tự clear, nếu không hình frame trước sẽ đè chồng lên (chỉ lộ khi play tự động).
    ctx.clearRect(0, 0, this.cssW, this.cssH);

    if (!this.curr) { return; }

    if (this.isCustomLayout()) {
      this.drawCustomLayout();
      return;
    }

    const snapshot = this.curr;

    if (!this.prev || this.progress >= 1) {
      drawPlaybackFrame(ctx, this.cssW, this.cssH, snapshot);
    } else {
      // Tree/Graph: nội suy màu trạng thái giữa 2 frame (không nhảy cóc)
      const prevSnap = this.prev;
      const handled = drawPlaybackFrameTransition(
        ctx,
        this.cssW,
        this.cssH,
        prevSnap,
        snapshot,
        easeInOut(this.progress),
      );
      if (!handled) {
        switch (this.transition) {
          case 'swap': this.drawSwap(); break;
          case 'compare': this.drawCompare(); break;
          case 'highlight': this.drawHighlight(); break;
          default: this.drawMove(); break;
        }
      }
    }

    this.drawAlgorithmOverlay();
  }

  // ═══════════════════════════════════════════
  // Algorithm-specific overlays (Tier 1)
  // ═══════════════════════════════════════════

  private drawAlgorithmOverlay() {
    const snap = this.curr;
    if (!snap) return;
    const idx = this.curr?.comparingIndices;

    switch (this.algorithmId) {
      case 'bubble-sort':    this.drawBubbleOverlay(snap); break;
      case 'selection-sort': this.drawSelectionOverlay(snap); break;
      case 'insertion-sort': this.drawInsertionOverlay(snap); break;
      case 'quick-sort':     this.drawQuickOverlay(snap); break;
    }
  }

  private drawBubbleOverlay(snap: CanvasStateSnapshot) {
    const ctx = this.ctx!;
    const ci = snap.comparingIndices;
    if (!ci || ci.length < 2) return;
    const geo = this.computeGeo(snap.array);
    const [i, j] = ci;
    if (i >= geo.length || j >= geo.length) return;

    // Bỏ bracket/sorted-boundary (đường kẻ gây nhiễu) — giữ lại phần tô mờ nhẹ
    // phân biệt cặp đang so sánh.
    const a = geo[i]; const b = geo[j];
    const x1 = a.x + a.w / 2;
    const x2 = b.x + b.w / 2;
    ctx.fillStyle = 'rgba(245,158,11,0.08)';
    ctx.fillRect(x1 - 1, Math.min(a.y, b.y) - 10, x2 - x1 + 2, 8);
  }

  private drawSelectionOverlay(snap: CanvasStateSnapshot) {
    const ctx = this.ctx!;
    const ci = snap.comparingIndices;
    if (!ci || ci.length < 2) return;
    const geo = this.computeGeo(snap.array);
    const [minIdx] = ci;
    if (minIdx >= geo.length) return;
    const g = geo[minIdx];

    // "MIN" badge above current minimum (không vẽ mũi tên nối)
    const bx = g.x + g.w / 2;
    const by = g.y - 20;
    ctx.fillStyle = 'rgba(6,182,212,0.2)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    this.roundRect(bx - 16, by - 8, 32, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('MIN', bx, by);
  }

  private drawInsertionOverlay(snap: CanvasStateSnapshot) {
    const ctx = this.ctx!;
    const ci = snap.comparingIndices;
    if (!ci || ci.length < 2) return;
    const geo = this.computeGeo(snap.array);
    const [keyIdx] = ci;
    if (keyIdx >= geo.length) return;

    // Key element floating above array (không vẽ mũi tên nối)
    const g = geo[keyIdx];
    const floatY = Math.max(30, g.y - 30);
    const alpha = 0.65 + 0.2 * Math.sin(this.progress * Math.PI);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#06b6d4';
    this.roundRect(g.x, floatY, g.w, g.h * 0.7, 4);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1.5;
    this.roundRect(g.x, floatY, g.w, g.h * 0.7, 4);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(snap.array[keyIdx]), g.x + g.w / 2, floatY + g.h * 0.35);
    ctx.globalAlpha = 1;

    // "KEY" label
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 9px "JetBrains Mono", Consolas, monospace';
    ctx.fillText('KEY', g.x + g.w / 2, floatY - 6);
  }

  private drawQuickOverlay(snap: CanvasStateSnapshot) {
    const ctx = this.ctx!;
    const geo = this.computeGeo(snap.array);
    const vars = snap.loopVariables ?? {};
    const low = vars.low;
    const high = vars.high;
    const pivot = vars.p ?? vars.pivot;

    if (low !== undefined && high !== undefined && low <= high) {
      // Draw partition regions (chỉ tô mờ, không vẽ viền kẻ)
      const lGeo = geo[low];
      const hGeo = geo[high];
      if (lGeo && hGeo) {
        const regionX = lGeo.x - 2;
        const regionW = hGeo.x + hGeo.w - lGeo.x + 4;
        ctx.fillStyle = 'rgba(99,102,241,0.08)';
        ctx.fillRect(regionX, this.cssH * 0.05, regionW, this.cssH * 0.85);
      }

      // Left/right partition labels
      if (pivot !== undefined && pivot >= low && pivot <= high) {
        const pGeo = geo[pivot];
        if (pGeo) {
          // Left partition (low..pivot-1)
          if (pivot > low) {
            const lEnd = geo[pivot - 1];
            ctx.fillStyle = 'rgba(16,185,129,0.06)';
            const lx = lGeo.x - 1;
            const lw = lEnd.x + lEnd.w - lGeo.x + 2;
            ctx.fillRect(lx, this.cssH * 0.05, lw, this.cssH * 0.85);
          }
          // Right partition (pivot+1..high)
          if (pivot < high) {
            const rStart = geo[pivot + 1];
            ctx.fillStyle = 'rgba(239,68,68,0.06)';
            const rx = rStart.x - 1;
            const rw = hGeo.x + hGeo.w - rStart.x + 2;
            ctx.fillRect(rx, this.cssH * 0.05, rw, this.cssH * 0.85);
          }
          // Pivot highlight ring
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          this.roundRect(pGeo.x - 3, pGeo.y - 3, pGeo.w + 6, pGeo.h + 6, 5);
          ctx.stroke();
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PIVOT', pGeo.x + pGeo.w / 2, pGeo.y - 10);
        }
      }
    }

    // Recursion depth badge
    const depth = vars.depth ?? vars.recursionDepth;
    if (depth !== undefined && depth > 0) {
      const label = `Depth: ${depth}`;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(30,41,59,0.85)';
      this.roundRect(this.cssW - tw - 24, 10, tw + 16, 20, 4);
      ctx.fill();
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(label, this.cssW - tw - 16, 20);
    }
  }

  // ─── SWAP animation: parabolic arc ───

  private drawSwap() {
    const ctx = this.ctx!;
    const p = this.prev!;
    const c = this.curr!;
    const t = easeInOut(this.progress);
    const [a, b] = this.swapPair!;

    const prevGeo = this.computeGeo(p.array);
    const currGeo = this.computeGeo(c.array);

    if (a >= prevGeo.length || b >= prevGeo.length) return;

    const arcH = Math.max(30, (this.cssH - this.cssH * 0.2) * 0.3);

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
      const h = lerp(prevGeo[i].h, currGeo[i].h, t);
      ctx.fillStyle = COLORS.barDefault;
      this.roundRect(g.x, g.y - (h - g.h), g.w, h, 3);
      ctx.fill();
    }

    // Draw swapping bars
    const colA = lerpColor(COLORS.barSwap, COLORS.barDefault, t);
    this.fillBar(posA.x, posA.y - (posA.h - prevGeo[a].h), posA.w, posA.h, colA, String(c.array[b]));
    const colB = lerpColor(COLORS.barSwap, COLORS.barDefault, t);
    this.fillBar(posB.x, posB.y - (posB.h - prevGeo[b].h), posB.w, posB.h, colB, String(c.array[a]));
  }

  // ─── COMPARE animation: pulse glow ───

  private drawCompare() {
    const ctx = this.ctx!;
    const p = this.prev!;
    const c = this.curr!;
    const t = easeInOut(this.progress);
    const scale = 1 + 0.06 * Math.sin(t * Math.PI);
    const alpha = 0.3 + 0.4 * Math.sin(t * Math.PI);
    const [i, j] = this.comparePair!;

    const geo = this.computeGeo(c.array);

    // Draw all bars
    for (let idx = 0; idx < geo.length; idx++) {
      const g = geo[idx];
      if (idx === i || idx === j) {
        // Glow pulse
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 20;
        this.roundRect(g.x - 2, g.y - 2, g.w + 4, g.h + 4, 4);
        ctx.fill(); ctx.restore();

        // Scaled bar
        const cx = g.x + g.w / 2; const cy = g.y + g.h / 2;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
        this.fillBar(g.x, g.y, g.w, g.h, COLORS.barCompare, String(c.array[idx]));
        ctx.restore();
      } else {
        this.fillBar(g.x, g.y, g.w, g.h, COLORS.barDefault, String(c.array[idx]));
      }
    }
  }

  // ─── HIGHLIGHT animation: pop + fade to green ───

  private drawHighlight() {
    const ctx = this.ctx!;
    const c = this.curr!;
    const t = easeOut(this.progress);
    const idx = this.highlightIdx;
    const scale = 1 + 0.12 * (1 - t);
    const color = lerpColor(COLORS.barDefault, COLORS.barSorted, t);
    const geo = this.computeGeo(c.array);

    for (let i = 0; i < geo.length; i++) {
      const g = geo[i];
      if (i === idx) {
        ctx.save();
        ctx.shadowColor = '#10b981'; ctx.shadowBlur = 8 + 12 * (1 - t);
        const cx = g.x + g.w / 2; const cy = g.y + g.h / 2;
        ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
        this.fillBar(g.x, g.y, g.w, g.h, color, String(c.array[idx]));
        ctx.restore();
      } else {
        const isSorted = c.highlightedIndices?.includes(i);
        this.fillBar(g.x, g.y, g.w, g.h, isSorted ? COLORS.barSorted : COLORS.barDefault, String(c.array[i]));
      }
    }
  }

  // ─── MOVE animation: smooth slide ───

  private drawMove() {
    const ctx = this.ctx!;
    const p = this.prev!;
    const c = this.curr!;
    const t = easeOut(this.progress);

    const prevGeo = this.computeGeo(p.array);
    const currGeo = this.computeGeo(c.array);
    const n = Math.max(prevGeo.length, currGeo.length);

    for (let i = 0; i < n; i++) {
      const pg = prevGeo[i] ?? { x: 0, y: 0, h: 0, w: 0 };
      const cg = currGeo[i] ?? { x: 0, y: 0, h: 0, w: 0 };
      const x = lerp(pg.x, cg.x, t);
      const h = lerp(pg.h, cg.h, t);
      const y = currGeo[i] ? cg.y - (cg.h - h) : 0;
      const color = this.getColor(c, i);
      this.fillBar(x, y, pg.w, Math.max(3, h), color, String(c.array[i] ?? ''));
    }
  }

  // ─── Helpers ───

  private fillBar(x: number, y: number, w: number, h: number, color: string, label: string) {
    const ctx = this.ctx!;
    this.roundRect(x, y, w, Math.max(3, h), 3);
    ctx.fillStyle = color;
    ctx.fill();
    if (label && h > 18 && w >= 8) {
      const fontSize = Math.max(7, Math.min(12, Math.round(w * 0.55)));
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `bold ${fontSize}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(label, x + w / 2, y - 2);
    }
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    const ctx = this.ctx!;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private getColor(snap: CanvasStateSnapshot, idx: number): string {
    const swapping = (snap.swappingIndices ?? []) as number[];
    const comparing = (snap.comparingIndices ?? []) as number[];
    const sorted = (snap.highlightedIndices ?? []) as number[];
    if (swapping.includes(idx)) return COLORS.barSwap;
    if (comparing.includes(idx)) return COLORS.barCompare;
    if (sorted.includes(idx)) return COLORS.barSorted;
    return COLORS.barDefault;
  }

  // ═══════════════════════════════════════════
  // Custom layouts (Tier 3): Counting, Radix, Bucket
  // ═══════════════════════════════════════════

  private isCustomLayout(): boolean {
    // Data-driven: merge/heap sort dùng engine riêng khi snapshot có trạng thái tương ứng
    const snap = this.curr ?? {} as CanvasStateSnapshot;
    if (MergeSortAnimationEngine.canHandle(snap)) return true;
    if (HeapSortAnimationEngine.canHandle(snap)) return true;
    return ['counting-sort', 'radix-sort', 'bucket-sort'].includes(this.algorithmId);
  }

  private drawCustomLayout() {
    const ctx = this.ctx!; ctx.clearRect(0, 0, this.cssW, this.cssH);
    const snap = this.curr!;
    if (MergeSortAnimationEngine.canHandle(snap)) {
      // Engine riêng cho Merge Sort: layout CHIA – TRỘN 3 tầng
      MergeSortAnimationEngine.instance().draw(ctx, this.cssW, this.cssH, snap);
      return;
    }
    if (HeapSortAnimationEngine.canHandle(snap)) {
      // Engine riêng cho Heap Sort: cây heap parent-centered + dải mảng,
      // kèm prev/progress để nội suy swap dọc cạnh cây
      HeapSortAnimationEngine.instance().draw(ctx, this.cssW, this.cssH, snap, this.prev, this.progress);
      return;
    }
    switch (this.algorithmId) {
      case 'counting-sort': this.drawCountingLayout(snap); break;
      case 'radix-sort': this.drawRadixLayout(snap); break;
      case 'bucket-sort': this.drawBucketLayout(snap); break;
    }
  }

  // ─── Counting Sort: input bars → count grid → output ───

  private drawCountingLayout(snap: CanvasStateSnapshot) {
    const ctx = this.ctx!;
    const arr = snap.array ?? [];
    const countArr = snap.countArray ?? [];
    const step = snap.countingStep ?? 'count';
    const output = snap.outputArray ?? [];
    const comparing = (snap.comparingIndices ?? []) as number[];

    if (arr.length === 0) return;

    const M = 8;
    const tierH = (this.cssH - M * 4) / 3;
    const minV = Math.min(...arr, 0);
    const maxV = Math.max(...arr, 1);
    const span = Math.max(maxV - minV, 1);
    const min = Math.min(...arr, 0);
    const cells = Math.max(10, Math.min(countArr.length, 24));
    const cellW = Math.max(16, (this.cssW - M * 2) / cells);

    // ── Tier 1: Input bars ──
    const t1y = M; const t1h = tierH; const barGap = 3;
    const barW = Math.max(4, (this.cssW - M * 2 - barGap * (arr.length - 1)) / arr.length);
    for (let i = 0; i < arr.length; i++) {
      const barH = Math.max(4, ((arr[i] - minV) / span) * (t1h - 24));
      const x = M + i * (barW + barGap);
      const y = t1y + t1h - barH;
      const active = comparing[0] === i;
      this.roundRect(x, y, barW, barH, 3);
      ctx.fillStyle = active ? COLORS.barCompare : COLORS.barDefault;
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(String(arr[i]), x + barW / 2, y - 2);
      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      ctx.font = '9px "JetBrains Mono", Consolas, monospace';
      ctx.textBaseline = 'top';
      ctx.fillText('[' + i + ']', x + barW / 2, t1y + t1h + 2);
    }

    // ── Tier 2: Counting Grid ──
    const t2y = t1y + tierH + M;
    for (let d = 0; d < cells; d++) {
      const cx = M + d * cellW;
      const cellActive =
        (step === 'count' && comparing[1] === d) ||
        (step === 'accumulate' && comparing[0] <= d && d <= comparing[1]) ||
        (step === 'output' && comparing[1] === d);

      this.roundRect(cx + 1, t2y + 22, cellW - 2, tierH - 24, 4);
      if (cellActive) {
        ctx.fillStyle = step === 'count' ? 'rgba(61,153,112,0.12)'
          : step === 'accumulate' ? 'rgba(201,162,39,0.12)'
          : 'rgba(16,185,129,0.12)';
      } else {
        ctx.fillStyle = 'rgba(51,65,85,0.4)';
      }
      ctx.fill();
      ctx.strokeStyle = cellActive ? '#f59e0b' : 'rgba(100,116,139,0.3)';
      ctx.lineWidth = cellActive ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = cellActive ? '#f59e0b' : '#94a3b8';
      ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(min !== 0 ? String(d + min) : String(d), cx + cellW / 2, t2y + 2);
      ctx.font = 'bold 14px "JetBrains Mono", Consolas, monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(countArr[d] ?? 0), cx + cellW / 2, t2y + tierH / 2);
    }

    // ── Tier 3: Output ──
    const t3y = t2y + tierH + M;
    for (let i = 0; i < arr.length; i++) {
      const ox = M + i * (barW + barGap);
      const oy = t3y;
      const val = output[i];
      const slotActive = comparing[0] === i;
      this.roundRect(ox, oy + 22, barW, tierH - 44, 3);
      if (val !== null && val !== undefined) {
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(val), ox + barW / 2, oy + tierH / 2);
      } else {
        ctx.fillStyle = 'rgba(51,65,85,0.2)';
        ctx.fill();
        ctx.strokeStyle = slotActive ? 'rgba(16,185,129,0.7)' : 'rgba(100,116,139,0.15)';
        ctx.lineWidth = slotActive ? 2 : 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      ctx.font = '9px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('O[' + i + ']', ox + barW / 2, t3y + tierH - 20);
    }

    // Phase label
    const phaseLabels: Record<string, string> = { count: '01 ĐẾM', accumulate: '02 CỘNG DỒN', output: '03 DỰNG OUTPUT' };
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(phaseLabels[step] ?? '', this.cssW - 12, t2y + 10);
  }

  // ─── Radix Sort: input + digit highlight → 10 bucket columns ───

  private drawRadixLayout(snap: CanvasStateSnapshot) {
    const ctx = this.ctx!;
    const arr = snap.array ?? [];
    const step = snap.radixStep ?? 'distribute';
    const place = snap.activeDigitPlace ?? 1;
    const buckets = snap.radixBuckets ?? [];
    const comparing = (snap.comparingIndices ?? []) as number[];

    if (arr.length === 0) return;

    const M = 6;
    const inputH = 50;
    const offset = arr.length > 0 ? -Math.min(...arr, 0) : 0;
    const placeLabel = place === 1 ? 'đơn vị' : place === 10 ? 'chục' : place === 100 ? 'trăm' : '10^' + Math.log10(place);

    // ── Input row ──
    const barGap = 2;
    const barW = Math.max(6, (this.cssW - M * 2 - barGap * (arr.length - 1)) / arr.length);
    for (let i = 0; i < arr.length; i++) {
      const digit = Math.floor((arr[i] + offset) / place) % 10;
      const x = M + i * (barW + barGap);
      const active = comparing[0] === i;
      this.roundRect(x, M, barW, inputH, 3);
      ctx.fillStyle = active ? '#f59e0b' : '#6366f1';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(arr[i]), x + barW / 2, M + inputH / 2 - 7);
      ctx.font = '9px "JetBrains Mono", Consolas, monospace';
      ctx.fillText('digit ' + digit, x + barW / 2, M + inputH / 2 + 10);
    }

    // Phase + place label (mũi tên hướng vẽ bằng path vector — không dùng glyph unicode)
    const isDist = step !== 'collect';
    ctx.fillStyle = isDist ? '#f59e0b' : '#10b981';
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    const phaseLabelText = (isDist ? 'PHÂN PHỐI' : 'THU HOẠCH') + ' - Hàng ' + placeLabel;
    ctx.beginPath();
    if (isDist) {
      ctx.moveTo(M + 4, M + inputH + 11);
      ctx.lineTo(M + 12, M + inputH + 11);
      ctx.lineTo(M + 8, M + inputH + 21);
    } else {
      ctx.moveTo(M + 4, M + inputH + 21);
      ctx.lineTo(M + 12, M + inputH + 21);
      ctx.lineTo(M + 8, M + inputH + 11);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillText(phaseLabelText, M + 18, M + inputH + 16);

    // ── 10 bucket columns ──
    const bucketY = M + inputH + 30;
    const bucketH = this.cssH - bucketY - M * 2;
    const cellW = Math.max(14, (this.cssW - M * 2) / 10);
    const activeIdx = comparing[0] >= 0 ? comparing[0] : -1;
    const activeDigit = activeIdx >= 0 && activeIdx < arr.length ? Math.floor((arr[activeIdx] + offset) / place) % 10 : -1;

    for (let b = 0; b < 10; b++) {
      const bx = M + b * cellW;
      const items = buckets[b] ?? [];
      const isActive = isDist && activeDigit === b;

      this.roundRect(bx + 1, bucketY + 18, cellW - 2, bucketH - 20, 3);
      ctx.fillStyle = isActive ? 'rgba(201,162,39,0.1)' : 'rgba(51,65,85,0.3)';
      ctx.fill();
      ctx.strokeStyle = isActive ? '#c9a227' : 'rgba(100,116,139,0.3)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isActive ? '#c9a227' : '#94a3b8';
      ctx.font = 'bold 9px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('[' + b + ']', bx + cellW / 2, bucketY);

      for (let j = 0; j < Math.min(items.length, 6); j++) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '9px "JetBrains Mono", Consolas, monospace';
        ctx.fillText(String(items[j]), bx + cellW / 2, bucketY + 22 + j * 14);
      }
      if (items.length > 6) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('+' + (items.length - 6), bx + cellW / 2, bucketY + 22 + 6 * 14);
      }
    }
  }

  // ─── Bucket Sort: 4 range bucket columns ───

  private drawBucketLayout(snap: CanvasStateSnapshot) {
    const ctx = this.ctx!;
    const arr = snap.array ?? [];
    const buckets = snap.bucketSortBuckets ?? [];
    const step = snap.bucketStep ?? 'distribute';
    const activeB = snap.bucketSortActiveIdx ?? -1;
    const rangeLabels = snap.bucketRangeLabels ?? [];
    const comparing = (snap.comparingIndices ?? []) as number[];
    const comparePair = snap.bucketSortComparingBucketIndices;

    if (arr.length === 0) return;

    const M = 6;
    const inputH = 40;
    const barGap = 2;
    const barW = Math.max(6, (this.cssW - M * 2 - barGap * (arr.length - 1)) / arr.length);
    const maxV = Math.max(...arr, 1);
    const bucketCount = Math.max(1, buckets.length);

    // ── Input bars ──
    for (let i = 0; i < arr.length; i++) {
      const barH = Math.max(4, (arr[i] / maxV) * inputH);
      const x = M + i * (barW + barGap);
      const y = M + inputH - barH;
      const active = step === 'distribute' && comparing[0] === i;
      this.roundRect(x, y, barW, barH, 3);
      ctx.fillStyle = active ? '#f59e0b' : '#6366f1';
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(String(arr[i]), x + barW / 2, y - 2);
    }

    // Phase label
    const phaseLabel = step === 'distribute' ? '01 PHÂN PHỐI' : step === 'sort' ? '02 SẮP XẾP' : '03 THU GOM';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(phaseLabel, M, M + inputH + 14);

    // ── Bucket columns ──
    const bucketY = M + inputH + 28;
    const bucketH = this.cssH - bucketY - M;
    const colW = Math.max(30, (this.cssW - M * 2 - (bucketCount - 1) * 4) / bucketCount);

    for (let b = 0; b < bucketCount; b++) {
      const bx = M + b * (colW + 4);
      const items = buckets[b] ?? [];
      const isActive = activeB === b;

      this.roundRect(bx, bucketY + 16, colW, bucketH - 18, 4);
      ctx.fillStyle = isActive ? 'rgba(201,162,39,0.08)' : 'rgba(51,65,85,0.3)';
      ctx.fill();
      ctx.strokeStyle = isActive ? '#c9a227' : 'rgba(100,116,139,0.3)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isActive ? '#c9a227' : '#94a3b8';
      ctx.font = 'bold 8px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('B ' + b, bx + colW / 2, bucketY);
      ctx.fillText(rangeLabels[b] ?? ('Range ' + b), bx + colW / 2, bucketY + 10);

      for (let j = 0; j < Math.min(items.length, 8); j++) {
        const active = step === 'sort' && isActive && comparePair !== null && comparePair !== undefined &&
          (comparePair[0] === j || comparePair[1] === j);
        ctx.fillStyle = active ? '#f59e0b' : '#e2e8f0';
        ctx.font = 'bold ' + (active ? '11px' : '9px') + ' "JetBrains Mono", Consolas, monospace';
        ctx.fillText(String(items[j]), bx + colW / 2, bucketY + 24 + j * (bucketH - 32) / Math.max(items.length, 1));
      }
    }
  }
}
