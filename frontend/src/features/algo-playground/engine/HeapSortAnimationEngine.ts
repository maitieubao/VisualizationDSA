import type { CanvasStateSnapshot, HeapSortState } from '../../../core/CompilerStepExecutor';

const COLORS = {
  nodeDefault: '#818cf8',
  nodeActive: '#fbbf24',
  nodeExtracted: 'rgba(52,211,153,0.55)',
  nodeBeyond: 'rgba(71,85,105,0.45)',
  edge: 'rgba(148,163,184,0.5)',
  text: '#f8fafc',
  textDim: '#94a3b8',
  barDefault: '#818cf8',
  barExtracted: 'rgba(52,211,153,0.6)',
  barBeyond: 'rgba(71,85,105,0.4)',
  regionHeap: 'rgba(251,191,36,0.10)',
  regionSorted: 'rgba(52,211,153,0.12)',
  captionBg: 'rgba(15,23,42,0.9)',
};

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function easeInOut(t: number): number { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

/**
 * Animation engine RIÊNG cho Heap Sort (v4 — xây lại giao diện, triết lý "mảng là chính").
 *
 * Khác v1/v2/v3 (cây toàn phần + dải mảng — rối, không tập trung):
 *   • MẢNG LÀ NHÂN VẬT CHÍNH (62%): bar lớn, chỉ số dưới mỗi bar, vùng heap/sorted tô mờ
 *     có khe hở ranh giới, ROOT marker khi trích xuất, swap bay cung, compare pulse.
 *   • MINI FOCUS TREE (24%): KHÔNG vẽ cả cây — chỉ vẽ node ĐANG xử lý + 2 con trong đống,
 *     node to (r≈18), so sánh rung; swap sift (cha↔con) bay cung ngắn.
 *   • CAPTION (14%): tường thuật động tiếng Việt sinh từ dữ liệu
 *     ("So sánh 12 với 13 → giữ 13", "Đổi chỗ 12 và 13 — root về cuối mảng, heap thu hẹp"...).
 *   • Header gọn: pha + heapSize (+ số so sánh nếu có).
 *
 * Hoàn toàn data-driven: vẽ từ snapshot.heapState + array/comparing/swapping/
 * highlightedIndices/comparisonCount — không chứa logic thuật toán.
 */
export class HeapSortAnimationEngine {
  private static readonly HEADER_H = 28;
  private static shared: HeapSortAnimationEngine | null = null;

  public static instance(): HeapSortAnimationEngine {
    if (!HeapSortAnimationEngine.shared) {
      HeapSortAnimationEngine.shared = new HeapSortAnimationEngine();
    }
    return HeapSortAnimationEngine.shared;
  }

  public static canHandle(snap: CanvasStateSnapshot): boolean {
    return snap.heapState !== undefined;
  }

  /** Tường thuật động — tách riêng để test dễ. */
  public static captionFor(snap: CanvasStateSnapshot): string {
    const st = snap.heapState;
    if (!st) return '';
    const arr = snap.array ?? [];
    const sw = snap.swappingIndices;
    if (sw && sw.length >= 2 && arr[sw[0]] !== undefined && arr[sw[1]] !== undefined) {
      const base = `Đổi chỗ ${arr[sw[0]]} và ${arr[sw[1]]}`;
      return st.phase === 'extract' && sw[0] === 0
        ? `${base} — root về cuối mảng, heap thu hẹp`
        : `${base} — tiếp tục sift xuống`;
    }
    const cmp = snap.comparingIndices;
    if (cmp && cmp.length >= 2 && arr[cmp[0]] !== undefined && arr[cmp[1]] !== undefined) {
      const a = arr[cmp[0]];
      const b = arr[cmp[1]];
      const bigger = a >= b ? a : b;
      return `So sánh ${a} (vị trí ${cmp[0]}) với ${b} (vị trí ${cmp[1]}) → giữ ${bigger}`;
    }
    if (st.phase === 'build' && arr[st.activeIdx] !== undefined) {
      return `Vun đống tại node ${st.activeIdx} (giá trị ${arr[st.activeIdx]}) — so sánh với các con`;
    }
    if (st.heapSize > 0 && arr[0] !== undefined) {
      return `Root = ${arr[0]} là phần tử lớn nhất — chuẩn bị đưa về cuối mảng`;
    }
    return 'Hoàn tất — mảng đã sắp xếp!';
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    snap: CanvasStateSnapshot,
    prev?: CanvasStateSnapshot | null,
    progress = 1,
  ): void {
    const st = snap.heapState;
    if (!st) return;

    ctx.clearRect(0, 0, w, h);
    const arr = snap.array ?? [];
    if (arr.length === 0) return;

    const M = 8;
    const headerH = 28;
    const captionH = Math.min(36, Math.round(h * 0.12));
    const bodyTop = M + headerH;
    const bodyH = h - bodyTop - M - captionH - M;
    const arrY = bodyTop;
    const arrH = Math.round(bodyH * 0.72);
    const treeY = arrY + arrH + M;
    const treeH = bodyH - arrH - M;
    const capY = treeY + treeH + M;

    const animating = !!prev && progress < 1 && !!snap.swappingIndices;

    this.drawHeader(ctx, w, st, snap);
    this.drawHeroArray(ctx, w, arrH, arrY, arr, st, snap, animating, progress);
    this.drawMiniFocus(ctx, w, treeH, treeY, arr, st, snap, animating, progress);
    this.drawCaption(ctx, w, capY, captionH, snap);
  }

  // ── Header gọn: pha + heapSize ──

  private drawHeader(ctx: CanvasRenderingContext2D, w: number, st: HeapSortState, snap: CanvasStateSnapshot): void {
    const headerH = HeapSortAnimationEngine.HEADER_H;
    const phaseLabel = st.phase === 'build' ? '01 · XÂY ĐỐNG' : '02 · TRÍCH XUẤT';
    ctx.fillStyle = st.phase === 'build' ? 'rgba(251,191,36,0.14)' : 'rgba(52,211,153,0.12)';
    ctx.fillRect(0, 0, w, headerH);
    ctx.fillStyle = st.phase === 'build' ? '#fbbf24' : '#34d399';
    ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(phaseLabel, 12, headerH / 2);

    const stats = `heapSize=${st.heapSize}`;
    const comparisons = snap.comparisonCount;
    const statsText = comparisons !== undefined && comparisons > 0 ? `${stats} · so sánh=${comparisons}` : stats;
    ctx.fillStyle = COLORS.textDim;
    ctx.font = '11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(statsText, w - 12, headerH / 2);
  }

  // ── Mảng chính (hero): bar lớn, chỉ số, vùng tint, root marker, swap bay cung ──

  private drawHeroArray(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    y0: number,
    arr: number[],
    st: HeapSortState,
    snap: CanvasStateSnapshot,
    animating: boolean,
    progress: number,
  ): void {
    const n = arr.length;
    const minV = Math.min(...arr, 0);
    const maxV = Math.max(...arr, 1);
    const span = Math.max(maxV - minV, 1);
    const gap = 4;
    const indexH = 14;
    const barW = Math.max(5, (w - 20 - gap * (n - 1)) / n);
    const usableH = h - indexH - 18;
    const baseY = y0 + h - indexH;
    const zeroY = baseY - ((0 - minV) / span) * usableH;
    const comparing = (snap.comparingIndices ?? []) as number[];
    const swapping = (snap.swappingIndices ?? []) as number[];
    const extracted = (snap.highlightedIndices ?? []) as number[];
    const t = easeInOut(progress);

    // Vùng heap / sorted — khe hở nhỏ ở ranh giới (không kẻ đường)
    if (st.heapSize > 0) {
      ctx.fillStyle = COLORS.regionHeap;
      ctx.fillRect(10, y0, st.heapSize * (barW + gap) - gap, usableH + 6);
    }
    if (st.heapSize < n) {
      const bx = 10 + st.heapSize * (barW + gap) + 2;
      ctx.fillStyle = COLORS.regionSorted;
      ctx.fillRect(bx, y0, (n - st.heapSize) * (barW + gap), usableH + 6);
    }

    const barColor = (i: number): string => {
      if (extracted.includes(i)) return COLORS.barExtracted;
      if (i >= st.heapSize) return COLORS.barBeyond;
      if (comparing.includes(i) || swapping.includes(i)) return COLORS.nodeActive;
      return COLORS.barDefault;
    };
    const barGeo = (i: number): { x: number; y: number; h: number } => {
      const v = arr[i];
      const top = zeroY - ((v - minV) / span) * usableH;
      const y = v >= 0 ? top : zeroY;
      const bh = Math.max(3, v >= 0 ? zeroY - top : top - zeroY);
      return { x: 10 + i * (barW + gap), y, h: bh };
    };
    const geoX = (i: number): number => 10 + i * (barW + gap);

    const pulse = comparing.length >= 2 ? 1 + 0.06 * Math.sin(easeInOut(progress) * Math.PI) : 1;

    for (let i = 0; i < n; i++) {
      let g = barGeo(i);
      if (animating && swapping.length >= 2 && (i === swapping[0] || i === swapping[1])) {
        const other = swapping[0] === i ? swapping[1] : swapping[0];
        const go = barGeo(other);
        g = { x: lerp(g.x, go.x, t), y: g.y - 28 * Math.sin(Math.PI * t), h: g.h };
      }
      const isCompared = comparing.includes(i);
      this.roundRect(ctx, g.x, g.y, barW, g.h, 3);
      ctx.fillStyle = barColor(i);
      ctx.fill();
      if (isCompared && barW >= 5) {
        // Pulse: viền sáng nhẹ quanh bar đang so sánh
        ctx.strokeStyle = COLORS.nodeActive;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4 + 0.4 * Math.sin(easeInOut(progress) * Math.PI);
        this.roundRect(ctx, g.x - 1, g.y - 1, barW + 2, g.h + 2, 4);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (barW >= 7 && g.h >= 8) {
        ctx.fillStyle = COLORS.text;
        ctx.font = '10px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(arr[i]), g.x + barW / 2, g.y - 2);
      }
      if (barW >= 5) {
        ctx.fillStyle = COLORS.textDim;
        ctx.font = '9px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(String(i), g.x + barW / 2, baseY + 3);
      }
    }

    // ROOT marker khi trích xuất
    if (st.phase === 'extract' && st.heapSize > 0) {
      const rx = geoX(0) + barW / 2;
      const rootY = barGeo(0).y;
      ctx.fillStyle = COLORS.nodeActive;
      ctx.beginPath();
      ctx.moveTo(rx, rootY - 14);
      ctx.lineTo(rx - 5, rootY - 6);
      ctx.lineTo(rx + 5, rootY - 6);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 9px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('ROOT', rx, rootY - 16);
    }
  }

  // ── Mini focus tree: chỉ active + 2 con (node to, rõ ràng) ──

  private drawMiniFocus(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    y0: number,
    arr: number[],
    st: HeapSortState,
    snap: CanvasStateSnapshot,
    animating: boolean,
    progress: number,
  ): void {
    const comparing = (snap.comparingIndices ?? []) as number[];
    const swapping = (snap.swappingIndices ?? []) as number[];
    const a = st.activeIdx;
    const left = 2 * a + 1;
    const right = 2 * a + 2;
    const inHeap = (i: number): boolean => i < st.heapSize && i < arr.length;

    const r = 18;
    const cxA = w / 2;
    const cyA = y0 + r;
    const cyC = y0 + r * 2 + Math.max(18, h - r * 3 - 8);
    const spacing = Math.min(96, w * 0.26);
    const posC = (i: number): { x: number; y: number } => (i === left ? { x: cxA - spacing, y: cyC } : { x: cxA + spacing, y: cyC });

    // Edges (chỉ tới con trong đống)
    ctx.strokeStyle = COLORS.edge;
    ctx.lineWidth = 2;
    for (const c of [left, right]) {
      if (!inHeap(c)) continue;
      const pc = posC(c);
      ctx.beginPath();
      ctx.moveTo(cxA, cyA + r);
      ctx.lineTo(pc.x, pc.y - r);
      ctx.stroke();
    }

    const drawNode = (cx: number, cy: number, label: string, active: boolean, compared = false): void => {
      const rr = r * (compared ? 1.08 : 1);
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      if (active) {
        ctx.save();
        ctx.shadowColor = COLORS.nodeActive;
        ctx.shadowBlur = 16;
      }
      ctx.fillStyle = active ? COLORS.nodeActive : COLORS.nodeDefault;
      ctx.fill();
      if (active) ctx.restore();
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 14px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy);
    };

    // Swap sift (cha↔con trong mini-tree): bay cung ngắn
    const isSiftSwap = animating && swapping.length >= 2
      && (swapping[0] === a || swapping[1] === a)
      && (swapping[0] === left || swapping[1] === left || swapping[0] === right || swapping[1] === right);

    if (!isSiftSwap) {
      if (inHeap(a)) drawNode(cxA, cyA, String(arr[a]), true, comparing.includes(a));
      if (inHeap(left)) {
        const pc = posC(left);
        drawNode(pc.x, pc.y, String(arr[left]), false, comparing.includes(left));
      }
      if (inHeap(right)) {
        const pc = posC(right);
        drawNode(pc.x, pc.y, String(arr[right]), false, comparing.includes(right));
      }
    } else {
      // Vẽ node không swap trước, rồi 2 giá trị bay
      if (inHeap(a) && !(swapping[0] === a || swapping[1] === a)) drawNode(cxA, cyA, String(arr[a]), true);
      const t = easeInOut(progress);
      const arcH = Math.min(30, Math.max(10, spacing * 0.2));
      for (const c of [left, right]) {
        if (!inHeap(c)) continue;
        const pc = posC(c);
        if (swapping[0] === c || swapping[1] === c) continue;
        drawNode(pc.x, pc.y, String(arr[c]), false);
      }
      // Giá trị bay: a → c và ngược lại
      const child = swapping[0] === a ? swapping[1] : swapping[0];
      const pc = posC(child);
      const arc = (from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number } => ({
        x: lerp(from.x, to.x, t),
        y: lerp(from.y, to.y, t) - arcH * Math.sin(Math.PI * t),
      });
      drawNode(arc({ x: cxA, y: cyA }, pc).x, arc({ x: cxA, y: cyA }, pc).y, String(arr[child]), true);
      drawNode(arc(pc, { x: cxA, y: cyA }).x, arc(pc, { x: cxA, y: cyA }).y, String(arr[a]), true);
    }
  }

  // ── Caption tường thuật ──

  private drawCaption(ctx: CanvasRenderingContext2D, w: number, y: number, h: number, snap: CanvasStateSnapshot): void {
    ctx.fillStyle = COLORS.captionBg;
    ctx.fillRect(0, y, w, h);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const caption = HeapSortAnimationEngine.captionFor(snap);
    // Tam giác play vẽ bằng path vector (thay ký tự unicode "▶")
    ctx.beginPath();
    ctx.moveTo(15, y + h / 2 - 5);
    ctx.lineTo(15, y + h / 2 + 5);
    ctx.lineTo(21, y + h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillText(caption, 29, y + h / 2);
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
