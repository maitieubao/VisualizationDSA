import type { CanvasStateSnapshot, MergeSortState } from '../../../core/CompilerStepExecutor';
import { COLORS } from '../../renderer/colors';
import { easeInOut, lerp, maxWithFallback, minWithFallback, roundRect } from '../../renderer/geometry';
import type { AlgoRenderer, PlaybackContext } from './types';

/**
 * Renderer RIÊNG cho Merge Sort — redesigned 2-zone layout:
 *
 *   Zone 1 (55%): MẢNG GỐC với thanh bar lớn
 *     - Divide: nửa trái tô cyan, nửa phải tô tím, vạch mid marker
 *     - Merge: vùng segment active + con trỏ so sánh trên đầu
 *
 *   Zone 2 (45%): KHÔNG GIAN TRỘN — L / R song song + output
 *     - Divide: hiển thị箭头 chia đôi (không chips)
 *     - Merge: L/R chips lớn với pointer highlight + comparison arrow
 *       + output row ở dưới cùng + chip bay L→OUT hoặc R→OUT
 *
 * Hoàn toàn data-driven: chỉ vẽ từ `snapshot.mergeState` do compiler cấp.
 */
export class MergeSortRenderer implements AlgoRenderer {
  private static shared: MergeSortRenderer | null = null;

  public static instance(): MergeSortRenderer {
    if (!MergeSortRenderer.shared) {
      MergeSortRenderer.shared = new MergeSortRenderer();
    }
    return MergeSortRenderer.shared;
  }

  public static canHandle(snap: CanvasStateSnapshot): boolean {
    return snap.mergeState !== undefined;
  }

  /** Tường thuật động — tách riêng để test dễ. */
  public static captionFor(snap: CanvasStateSnapshot): string {
    const st = snap.mergeState;
    if (!st) return '';
    const total = st.high - st.low + 1;
    if (st.phase === 'divide') {
      return `Chia đoạn [${st.low}..${st.high}] (width=${st.width}) thành 2 nửa ${total / 2}+${total / 2}`;
    }
    const filled = st.output.filter(v => v !== null && v !== undefined).length;
    const src = filled > 0
      ? (st.leftIdx > 0 && st.leftIdx <= st.left.length ? 'L' : 'R')
      : null;
    return src
      ? `Trộn: lấy ${st.output[st.output.length - 1]} từ ${src} → output (${filled}/${total})`
      : `Trộn đoạn [${st.low}..${st.high}] — so sánh L[${st.leftIdx}] vs R[${st.rightIdx}]`;
  }

  // ── Layout: 2-zone ──

  private layout(w: number, h: number) {
    const M = 8;
    const headerH = 24;
    const captionH = 22;
    const usableH = h - M * 3 - headerH - captionH;
    const z1h = Math.round(usableH * 0.45);
    const z2h = usableH - z1h;
    const z1y = M + headerH;
    const z2y = z1y + z1h + M;
    return { M, headerH, captionH, z1y, z1h, z2y, z2h };
  }

  /** Vị trí chip trong một hàng (L/R/OUT). */
  private chipPos(
    w: number,
    M: number,
    labelW: number,
    maxChips: number,
    index: number,
  ): { x: number; w: number } {
    const gap = 6;
    const chipW = Math.max(16, (w - M * 2 - labelW - gap * (maxChips - 1)) / maxChips);
    return { x: M + labelW + index * (chipW + gap), w: chipW };
  }

  // ── Public API ──

  public draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    prev: CanvasStateSnapshot | null,
    curr: CanvasStateSnapshot,
    progress: number,
    _pb: PlaybackContext,
  ): void {
    const st = curr.mergeState;
    if (!st) return;

    ctx.clearRect(0, 0, w, h);
    const arr = curr.array ?? [];
    const { M, headerH, captionH, z1y, z1h, z2y, z2h } = this.layout(w, h);

    // ── Fly animation detection ──
    const prevSt = prev?.mergeState;
    const newOut = (curr.output?.length ?? 0) - (prevSt?.output?.length ?? 0);
    const flyAnim = prevSt && prevSt.phase === 'merge' && st.phase === 'merge'
      && newOut === 1 && progress < 1;
    let flySide: 'L' | 'R' | null = null;
    if (flyAnim) {
      const fromLeft = (st.leftIdx ?? 0) > (prevSt?.leftIdx ?? 0);
      const fromRight = (st.rightIdx ?? 0) > (prevSt?.rightIdx ?? 0);
      flySide = fromLeft && !fromRight ? 'L' : !fromLeft && fromRight ? 'R' : null;
    }

    const t = easeInOut(progress);

    // ── Header ──
    this.drawHeader(ctx, w, st, M, headerH);

    // ── Zone 1: Main Array ──
    this.drawMainArray(ctx, w, arr, st, z1y, z1h, M);

    // ── Zone 2: Merge Workspace ──
    if (flyAnim && flySide) {
      this.drawMergeWorkspaceFly(ctx, w, st, z2y, z2h, M, flySide, t);
    } else if (st.phase === 'merge') {
      this.drawMergeWorkspace(ctx, w, st, z2y, z2h, M);
    } else {
      this.drawDivideWorkspace(ctx, w, st, z2y, z2h, M);
    }

    // ── Caption ──
    this.drawCaption(ctx, w, h, st, M, captionH);
  }

  public render(ctx: CanvasRenderingContext2D, w: number, h: number, snap: CanvasStateSnapshot): void {
    const st = snap.mergeState;
    if (!st) return;

    ctx.clearRect(0, 0, w, h);
    const arr = snap.array ?? [];
    const { M, headerH, captionH, z1y, z1h, z2y, z2h } = this.layout(w, h);

    this.drawHeader(ctx, w, st, M, headerH);
    this.drawMainArray(ctx, w, arr, st, z1y, z1h, M);

    if (st.phase === 'merge') {
      this.drawMergeWorkspace(ctx, w, st, z2y, z2h, M);
    } else {
      this.drawDivideWorkspace(ctx, w, st, z2y, z2h, M);
    }

    this.drawCaption(ctx, w, h, st, M, captionH);
  }

  // ── Header ──

  private drawHeader(ctx: CanvasRenderingContext2D, w: number, st: MergeSortState, M: number, headerH: number): void {
    const phaseLabel = st.phase === 'divide' ? 'CHIA' : 'TRỘN';
    const passLabel = `Pass ${st.pass}`;
    const rangeLabel = `[${st.low}..${st.high}]`;
    const widthLabel = `width=${st.width}`;

    ctx.fillStyle = COLORS.textDim;
    ctx.font = '10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const y = M + headerH / 2;
    ctx.fillText(`${passLabel}`, M, y);
    ctx.fillStyle = st.phase === 'divide' ? COLORS.chipActive : COLORS.chipOut;
    ctx.fillText(phaseLabel, M + 52, y);
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText(`${rangeLabel}  ${widthLabel}`, M + 96, y);
  }

  // ── Zone 1: Main Array ──

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
    const pad = 16;
    const gap = 10;
    const maxBarW = 40;
    const barW = Math.min(maxBarW, Math.max(4, (w - M * 2 - pad * 2 - gap * (arr.length - 1)) / arr.length));
    const totalBarsW = arr.length * barW + (arr.length - 1) * gap;
    const barOffset = M + pad + ((w - M * 2 - pad * 2) - totalBarsW) / 2;
    const usableH = h - 16;
    const baseY = y + h;
    const zeroY = baseY - ((0 - minV) / span) * usableH;

    // ── Segment background ──
    if (st.low <= st.high && st.high < arr.length) {
      const segX = barOffset + st.low * (barW + gap) - 2;
      const segW = (st.high - st.low + 1) * (barW + gap) - gap + 4;

      if (st.phase === 'divide') {
        // Divide: LEFT half cyan, RIGHT half purple
        const midX = barOffset + (st.mid + 1) * (barW + gap) - 2;
        const leftW = midX - segX;
        const rightW = segX + segW - midX;

        // Left half — cyan tint
        ctx.fillStyle = COLORS.pointerColors?.L ?? '#06b6d4';
        ctx.globalAlpha = 0.12;
        ctx.fillRect(segX, y, leftW, h);
        ctx.globalAlpha = 1;

        // Right half — purple tint
        ctx.fillStyle = COLORS.pointerColors?.H ?? '#a78bfa';
        ctx.globalAlpha = 0.12;
        ctx.fillRect(midX, y, rightW, h);
        ctx.globalAlpha = 1;

        // Mid divider line
        ctx.strokeStyle = COLORS.textDim;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(midX, y);
        ctx.lineTo(midX, y + h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = COLORS.pointerColors?.L ?? '#06b6d4';
        ctx.fillText('L', segX + leftW / 2, y + 2);
        ctx.fillStyle = COLORS.pointerColors?.H ?? '#a78bfa';
        ctx.fillText('R', midX + rightW / 2, y + 2);
      } else {
        // Merge: active segment highlight — darker background to contrast with bars
        ctx.fillStyle = 'rgba(90,184,138,0.15)';
        ctx.fillRect(segX, y, segW, h);
      }
    }

    // ── Bars ──
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      const top = zeroY - ((v - minV) / span) * usableH;
      const barH = Math.max(3, v >= 0 ? zeroY - top : top - zeroY);
      const x = barOffset + i * (barW + gap);
      const by = v >= 0 ? top : zeroY;
      const inSeg = i >= st.low && i <= st.high;

      roundRect(ctx, x, by, barW, barH, 3);
      if (inSeg) {
        // Segment bars: lighter color to contrast with segment background
        ctx.fillStyle = '#5ab88a';
      } else {
        ctx.fillStyle = COLORS.barDefault;
      }
      ctx.fill();
      // Border to separate bars visually
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Value label
      if (barW >= 6 && barH >= 8) {
        ctx.fillStyle = COLORS.text;
        ctx.font = '9px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(arr[i]), x + barW / 2, by - 2);
      }

      // Index label below bar
      if (barW >= 8) {
        ctx.fillStyle = COLORS.textDim;
        ctx.font = '8px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(String(i), x + barW / 2, baseY - 2);
      }
    }

    // ── Merge phase: comparison pointers on main array — bar-width markers ──
    if (st.phase === 'merge' && st.low <= st.high && st.high < arr.length) {
      const leftPtrIdx = st.low + st.leftIdx;
      const rightPtrIdx = st.mid + 1 + st.rightIdx;
      const markerBarH = 4;
      const markerLabelGap = 2;
      const markerLabelFontPx = Math.max(9, Math.min(12, Math.round(barW * 0.45)));

      if (leftPtrIdx <= st.mid && st.leftIdx < st.left.length) {
        const lx = barOffset + leftPtrIdx * (barW + gap);
        const lv = arr[leftPtrIdx];
        const lTop = zeroY - ((lv - minV) / span) * usableH;
        const lMarkerY = lTop - 4 - markerLabelFontPx * 0.7 - markerLabelGap - markerBarH;
        ctx.fillStyle = COLORS.pointerColors?.L ?? '#06b6d4';
        ctx.beginPath();
        roundRect(ctx, lx, lMarkerY, barW, markerBarH, 2);
        ctx.fill();
        ctx.font = `bold ${markerLabelFontPx}px "JetBrains Mono", Consolas, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('L', lx + barW / 2, lMarkerY - 2);
      }

      if (rightPtrIdx <= st.high && st.rightIdx < st.right.length) {
        const rx = barOffset + rightPtrIdx * (barW + gap);
        const rv = arr[rightPtrIdx];
        const rTop = zeroY - ((rv - minV) / span) * usableH;
        const rMarkerY = rTop - 4 - markerLabelFontPx * 0.7 - markerLabelGap - markerBarH;
        ctx.fillStyle = COLORS.pointerColors?.R ?? '#b85c5c';
        ctx.beginPath();
        roundRect(ctx, rx, rMarkerY, barW, markerBarH, 2);
        ctx.fill();
        ctx.font = `bold ${markerLabelFontPx}px "JetBrains Mono", Consolas, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('R', rx + barW / 2, rMarkerY - 2);
      }
    }
  }

  // ── Zone 2: Divide Workspace (chia đôi — hiển thị arrow) ──

  private drawDivideWorkspace(
    ctx: CanvasRenderingContext2D,
    w: number,
    st: MergeSortState,
    y: number,
    h: number,
    M: number,
  ): void {
    const mid = y + h / 2;

    // Arrow down from center
    ctx.strokeStyle = COLORS.textDim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, y + 4);
    ctx.lineTo(w / 2, y + h - 8);
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(w / 2 - 5, y + h - 14);
    ctx.lineTo(w / 2, y + h - 6);
    ctx.lineTo(w / 2 + 5, y + h - 14);
    ctx.closePath();
    ctx.fillStyle = COLORS.textDim;
    ctx.fill();

    // Left label
    const leftW = w / 2 - M * 2;
    const rightW = w / 2 - M * 2;
    ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = COLORS.pointerColors?.L ?? '#06b6d4';
    ctx.fillText(`L [${st.left.join(', ')}]`, M + leftW / 2, mid - 6);

    ctx.fillStyle = COLORS.pointerColors?.H ?? '#a78bfa';
    ctx.fillText(`R [${st.right.join(', ')}]`, w / 2 + M + rightW / 2, mid - 6);

    // Split description
    ctx.font = '10px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText(`${st.left.length} + ${st.right.length}`, w / 2, mid + 12);
  }

  // ── Zone 2: Merge Workspace (trộn — L/R song song + output) ──

  private drawMergeWorkspace(
    ctx: CanvasRenderingContext2D,
    w: number,
    st: MergeSortState,
    y: number,
    h: number,
    M: number,
  ): void {
    const outH = Math.round(h * 0.32);
    const outY = y + h - outH;
    const workspaceH = h - outH - 6;
    const workspaceY = y;

    const halfW = Math.floor((w - M * 2) / 2);
    const leftX = M;
    const rightX = M + halfW + 6;

    // ── Vertical divider ──
    ctx.strokeStyle = COLORS.textDim;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(M + halfW + 3, workspaceY);
    ctx.lineTo(M + halfW + 3, workspaceY + workspaceH);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── L array ──
    this.drawChipColumn(ctx, leftX, workspaceY, halfW - 3, workspaceH, 'L', st.left, st.leftIdx, true);

    // ── R array ──
    this.drawChipColumn(ctx, rightX, workspaceY, halfW - 3, workspaceH, 'R', st.right, st.rightIdx, false);

    // ── Comparison indicator ──
    if (st.leftIdx < st.left.length && st.rightIdx < st.right.length) {
      const cx = M + halfW + 3;
      const cy = workspaceY + workspaceH / 2;
      ctx.fillStyle = COLORS.textDim;
      ctx.font = 'bold 14px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const leftVal = st.left[st.leftIdx];
      const rightVal = st.right[st.rightIdx];
      const winner = leftVal <= rightVal ? 'L' : 'R';
      ctx.fillText(`${leftVal} ⚡ ${rightVal}`, cx, cy - 10);
      ctx.font = '10px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = winner === 'L' ? (COLORS.pointerColors?.L ?? '#06b6d4') : (COLORS.pointerColors?.R ?? '#b85c5c');
      ctx.fillText(`→ ${winner}`, cx, cy + 8);
    }

    // ── Output row ──
    this.drawOutputRow(ctx, M, outY, w - M * 2, outH, st);
  }

  /** Vẽ mảng L hoặc R dạng cột chip dọc (vertical). */
  private drawChipColumn(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    colW: number,
    colH: number,
    label: string,
    values: number[],
    activeIdx: number,
    isLeft: boolean,
  ): void {
    if (values.length === 0) return;

    const chipGap = 8;
    const labelH = 18;
    const chipH = Math.max(20, Math.min(36, (colH - labelH - chipGap * (values.length - 1)) / values.length));
    const chipW = Math.min(140, colW - 12);

    // Label
    ctx.fillStyle = isLeft ? (COLORS.pointerColors?.L ?? '#06b6d4') : (COLORS.pointerColors?.H ?? '#a78bfa');
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + colW / 2, y);

    // Chips
    for (let i = 0; i < values.length; i++) {
      const cy = y + labelH + i * (chipH + chipGap);
      const isActive = i === activeIdx;
      const chipX = x + (colW - chipW) / 2;

      roundRect(ctx, chipX, cy, chipW, chipH, 4);
      ctx.fillStyle = isActive ? COLORS.chipActive : COLORS.chipBg;
      ctx.fill();

      if (isActive) {
        // Glow effect
        ctx.shadowColor = COLORS.chipActive;
        ctx.shadowBlur = 8;
        roundRect(ctx, chipX, cy, chipW, chipH, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Value
      ctx.fillStyle = isActive ? '#000' : COLORS.text;
      ctx.font = `${Math.max(10, Math.min(13, Math.round(chipW * 0.3)))}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(values[i]), chipX + chipW / 2, cy + chipH / 2);
    }
  }

  /** Vẽ output row (horizontal). */
  private drawOutputRow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rowW: number,
    rowH: number,
    st: MergeSortState,
  ): void {
    const output = st.output ?? [];
    const totalSlots = st.high - st.low + 1;
    const labelW = 32;
    const pad = 8;

    // Label
    ctx.fillStyle = COLORS.textDim;
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('OUT', x, y + rowH / 2);

    // Chips
    const maxChips = Math.max(totalSlots, 1);
    const gap = 6;
    const maxChipW = 80;
    const chipW = Math.min(maxChipW, Math.max(16, (rowW - labelW - pad * 2 - gap * (maxChips - 1)) / maxChips));

    // Center the row horizontally
    const totalRowW = maxChips * chipW + (maxChips - 1) * gap;
    const rowOffset = labelW + pad + ((rowW - labelW - pad * 2) - totalRowW) / 2;

    for (let i = 0; i < totalSlots; i++) {
      const cx = x + rowOffset + i * (chipW + gap);
      const v = i < output.length ? output[i] : null;

      roundRect(ctx, cx, y + 4, chipW, rowH - 8, 4);

      if (v !== null && v !== undefined) {
        ctx.fillStyle = COLORS.chipOut;
        ctx.fill();
        ctx.fillStyle = COLORS.text;
        ctx.font = `${Math.max(8, Math.min(12, Math.round(chipW * 0.45)))}px "JetBrains Mono", Consolas, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(v), cx + chipW / 2, y + rowH / 2);
      } else {
        ctx.fillStyle = COLORS.chipSlot;
        ctx.fill();
      }
    }
  }

  // ── Zone 2: Merge Workspace with Fly Animation ──

  private drawMergeWorkspaceFly(
    ctx: CanvasRenderingContext2D,
    w: number,
    st: MergeSortState,
    y: number,
    h: number,
    M: number,
    flySide: 'L' | 'R',
    t: number,
  ): void {
    const outH = Math.round(h * 0.32);
    const outY = y + h - outH;
    const workspaceH = h - outH - 6;
    const workspaceY = y;

    const halfW = Math.floor((w - M * 2) / 2);
    const leftX = M;
    const rightX = M + halfW + 6;

    // ── Vertical divider ──
    ctx.strokeStyle = COLORS.textDim;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(M + halfW + 3, workspaceY);
    ctx.lineTo(M + halfW + 3, workspaceY + workspaceH);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── L array (skip flying chip) ──
    const flyIdx = flySide === 'L' ? st.leftIdx - 1 : st.leftIdx;
    this.drawChipColumnSkip(ctx, leftX, workspaceY, halfW - 3, workspaceH, 'L', st.left, flySide === 'L' ? st.leftIdx : st.leftIdx, flySide === 'L' ? flyIdx : -1);

    // ── R array (skip flying chip) ──
    const flyIdxR = flySide === 'R' ? st.rightIdx - 1 : st.rightIdx;
    this.drawChipColumnSkip(ctx, rightX, workspaceY, halfW - 3, workspaceH, 'R', st.right, flySide === 'R' ? st.rightIdx : st.rightIdx, flySide === 'R' ? flyIdxR : -1);

    // ── Comparison indicator ──
    const cx = M + halfW + 3;
    const cy = workspaceY + workspaceH / 2;
    ctx.fillStyle = COLORS.textDim;
    ctx.font = 'bold 14px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`→ ${flySide}`, cx, cy);

    // ── Output row (static, last element removed) ──
    const output = st.output ?? [];
    const staticOut = output.slice(0, output.length - 1);
    const totalSlots = st.high - st.low + 1;
    const labelW = 32;
    const pad = 8;
    const gap = 6;
    const maxChipW = 80;
    const chipW = Math.min(maxChipW, Math.max(16, ((w - M * 2) - labelW - pad * 2 - gap * (totalSlots - 1)) / totalSlots));
    const totalRowW = totalSlots * chipW + (totalSlots - 1) * gap;
    const rowOffset = labelW + pad + (((w - M * 2) - labelW - pad * 2) - totalRowW) / 2;

    // Output label
    ctx.fillStyle = COLORS.textDim;
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('OUT', M, outY + outH / 2);

    // Static output chips
    for (let i = 0; i < staticOut.length; i++) {
      const v = staticOut[i];
      if (v === null || v === undefined) continue;
      const cx2 = M + rowOffset + i * (chipW + gap);
      roundRect(ctx, cx2, outY + 4, chipW, outH - 8, 4);
      ctx.fillStyle = COLORS.chipOut;
      ctx.fill();
      ctx.fillStyle = COLORS.text;
      ctx.font = `${Math.max(8, Math.min(12, Math.round(chipW * 0.45)))}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(v), cx2 + chipW / 2, outY + outH / 2);
    }

    // Empty slots
    for (let i = staticOut.length; i < totalSlots; i++) {
      const cx2 = M + rowOffset + i * (chipW + gap);
      roundRect(ctx, cx2, outY + 4, chipW, outH - 8, 4);
      ctx.fillStyle = COLORS.chipSlot;
      ctx.fill();
    }

    // ── Flying chip ──
    const slotIdx = output.length - 1;
    const flying = output[slotIdx];

    // Source position (in L or R column)
    const flyChipIdx = flySide === 'L' ? st.leftIdx - 1 : st.rightIdx - 1;
    const srcColX = flySide === 'L' ? leftX : rightX;
    const chipGap = 8;
    const labelH = 18;
    const chipRowH = Math.max(20, Math.min(36, (workspaceH - labelH - chipGap * (st.left.length - 1)) / st.left.length));
    const srcChipY = workspaceY + labelH + flyChipIdx * (chipRowH + chipGap) + 4;
    const srcChipH = chipRowH - 8;

    // Destination position (output slot)
    const dstChipX = M + rowOffset + slotIdx * (chipW + gap);
    const dstChipY = outY + 4;
    const dstChipH = outH - 8;

    // Interpolate position
    const srcChipW = Math.min(140, (halfW - 3) - 12);
    const flyX = lerp(srcColX + ((halfW - 3) - srcChipW) / 2, dstChipX, t);
    const flyY = lerp(srcChipY, dstChipY, t);
    const flyH = lerp(srcChipH, dstChipH, t);

    // Glow
    ctx.shadowColor = COLORS.chipOut;
    ctx.shadowBlur = 12;
    roundRect(ctx, flyX, flyY, chipW, flyH, 4);
    ctx.fillStyle = COLORS.chipOut;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Value
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.max(8, Math.min(12, Math.round(chipW * 0.45)))}px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(flying), flyX + chipW / 2, flyY + flyH / 2);
  }

  /** drawChipColumn with skip index (for fly animation — hides the chip being animated). */
  private drawChipColumnSkip(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    colW: number,
    colH: number,
    label: string,
    values: number[],
    activeIdx: number,
    skipIdx: number,
  ): void {
    if (values.length === 0) return;

    const chipGap = 8;
    const labelH = 18;
    const chipH = Math.max(20, Math.min(36, (colH - labelH - chipGap * (values.length - 1)) / values.length));
    const chipW = Math.min(140, colW - 12);

    // Label
    const isLeft = label === 'L';
    ctx.fillStyle = isLeft ? (COLORS.pointerColors?.L ?? '#06b6d4') : (COLORS.pointerColors?.H ?? '#a78bfa');
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + colW / 2, y);

    // Chips
    for (let i = 0; i < values.length; i++) {
      if (i === skipIdx) continue;
      const cy = y + labelH + i * (chipH + chipGap);
      const isActive = i === activeIdx;
      const chipX = x + (colW - chipW) / 2;

      roundRect(ctx, chipX, cy, chipW, chipH, 4);
      ctx.fillStyle = isActive ? COLORS.chipActive : COLORS.chipBg;
      ctx.fill();

      if (isActive) {
        ctx.shadowColor = COLORS.chipActive;
        ctx.shadowBlur = 8;
        roundRect(ctx, chipX, cy, chipW, chipH, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = isActive ? '#000' : COLORS.text;
      ctx.font = `${Math.max(10, Math.min(13, Math.round(chipW * 0.3)))}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(values[i]), chipX + chipW / 2, cy + chipH / 2);
    }
  }

  // ── Caption ──

  private drawCaption(ctx: CanvasRenderingContext2D, w: number, h: number, st: MergeSortState, M: number, captionH: number): void {
    const text = MergeSortRenderer.captionFor({ mergeState: st } as CanvasStateSnapshot);
    if (!text) return;
    const y = h - captionH / 2;
    ctx.fillStyle = COLORS.captionBg;
    roundRect(ctx, M, h - captionH, w - M * 2, captionH, 4);
    ctx.fill();
    ctx.fillStyle = COLORS.textDim;
    ctx.font = '10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, y);
  }
}
