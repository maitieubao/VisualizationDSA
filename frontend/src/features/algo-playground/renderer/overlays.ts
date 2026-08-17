import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { COLORS } from './colors';
import { roundRect } from './geometry';

function drawLegend(ctx: CanvasRenderingContext2D, w: number, h: number, items: Array<{ color: string; label: string }>, y: number): void {
  const x = w - 12;
  const lineH = 16;
  let maxW = 0;
  for (const it of items) {
    const tw = ctx.measureText(it.label).width;
    if (tw > maxW) maxW = tw;
  }
  maxW += 24;

  ctx.fillStyle = COLORS.legendBg;
  roundRect(ctx, x - maxW - 8, y, maxW + 16, items.length * lineH + 12, 6);
  ctx.fill();

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '10px "JetBrains Mono", Consolas, monospace';
  items.forEach((it, i) => {
    ctx.fillStyle = it.color;
    ctx.beginPath();
    ctx.arc(x - 8, y + 8 + i * lineH, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.legendText;
    ctx.fillText(it.label, x - 16, y + 8 + i * lineH);
  });
}

function drawCallStackPanel(ctx: CanvasRenderingContext2D, w: number, h: number, callStack: Array<{ functionName: string; depth: number }>, recursionDepth: number): void {
  const panelW = 180;
  const panelH = Math.min(callStack.length * 22 + 30, h * 0.4);
  const x = 12;
  const y = 12;

  ctx.fillStyle = COLORS.callStackBg;
  roundRect(ctx, x, y, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = COLORS.callStackBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = COLORS.badgeText;
  ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`CALL STACK (depth: ${recursionDepth})`, x + 8, y + 6);

  ctx.font = '10px "JetBrains Mono", Consolas, monospace';
  callStack.forEach((frame, i) => {
    const fy = y + 26 + i * 22;
    if (fy + 16 > y + panelH) return;
    const isActive = i === callStack.length - 1;
    ctx.fillStyle = isActive ? COLORS.callStackActive : COLORS.badgeText;
    const indent = '| '.repeat(frame.depth);
    ctx.fillText(`${indent}${frame.functionName}()`, x + 8, fy);
    if (isActive) {
      // Tam giác chỉ frame đang xử lý (vẽ path — thay ký tự unicode "←")
      ctx.fillStyle = COLORS.callStackActive;
      ctx.beginPath();
      ctx.moveTo(x + panelW - 22, fy + 1);
      ctx.lineTo(x + panelW - 12, fy + 5);
      ctx.lineTo(x + panelW - 22, fy + 9);
      ctx.closePath();
      ctx.fill();
    }
  });
}

function drawBadge(ctx: CanvasRenderingContext2D, x: number, y: number, label: string): void {
  ctx.fillStyle = COLORS.badgeBg;
  const textW = ctx.measureText(label).width;
  roundRect(ctx, x, y, textW + 16, 22, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.badgeText;
  ctx.font = '11px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 8, y + 11);
}

export function drawQueueStackBadges(ctx: CanvasRenderingContext2D, w: number, h: number, snapshot: CanvasStateSnapshot): void {
  const queue = snapshot.queueIds ?? [];
  const stack = snapshot.stackIds ?? [];
  let offset = 0;
  if (queue.length > 0) {
    drawBadge(ctx, 12, h - 34, 'Queue: ' + queue.join(' → '));
    offset += ctx.measureText('Queue: ' + queue.join(' → ')).width + 24;
  }
  if (stack.length > 0) {
    drawBadge(ctx, 12 + offset, h - 34, 'Stack: ' + stack.join(' | '));
  }
}

function drawTargetBadge(ctx: CanvasRenderingContext2D, w: number, h: number, target: number, found: boolean): void {
  const label = found ? `Found: ${target}` : `Target: ${target}`;
  const bg = found ? COLORS.barSorted : COLORS.targetBg;
  const textColor = found ? COLORS.text : COLORS.targetText;
  const iconW = found ? 14 : 0;
  const textW = ctx.measureText(label).width;
  const x = 12;
  const y = 12;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, textW + 20 + iconW, 24, 6);
  ctx.fill();
  if (found) {
    // Dấu check vẽ bằng path vector (thay ký tự unicode "✓")
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 12);
    ctx.lineTo(x + 13, y + 15);
    ctx.lineTo(x + 18, y + 9);
    ctx.stroke();
  }
  ctx.fillStyle = textColor;
  ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 10 + iconW, y + 12);
}

function drawComparisonCounter(ctx: CanvasRenderingContext2D, w: number, count: number, y: number): void {
  const label = `Comparisons: ${count}`;
  const textW = ctx.measureText(label).width;
  const x = w - textW - 24;
  ctx.fillStyle = COLORS.badgeBg;
  roundRect(ctx, x, y, textW + 16, 22, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.barCompare;
  ctx.font = '11px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 8, y + 11);
}

function drawDepthBadge(ctx: CanvasRenderingContext2D, w: number, depth: number, y: number): void {
  const label = `Depth: ${depth}`;
  const textW = ctx.measureText(label).width;
  const x = w - textW - 24;
  ctx.fillStyle = COLORS.badgeBg;
  roundRect(ctx, x, y, textW + 16, 22, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.depthText;
  ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 8, y + 11);
}

function drawNotFoundOverlay(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const label = 'Not Found';
  ctx.font = 'bold 18px "JetBrains Mono", Consolas, monospace';
  const textW = ctx.measureText(label).width;
  const boxW = textW + 64;
  const boxH = 36;
  const x = (w - boxW) / 2;
  const y = h - 60;

  ctx.fillStyle = COLORS.notFoundBg;
  roundRect(ctx, x, y, boxW, boxH, 8);
  ctx.fill();
  ctx.strokeStyle = COLORS.notFoundText;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Dấu X vẽ bằng path vector (thay ký tự unicode "✕")
  ctx.strokeStyle = COLORS.notFoundText;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 13);
  ctx.lineTo(x + 32, y + 23);
  ctx.moveTo(x + 32, y + 13);
  ctx.lineTo(x + 22, y + 23);
  ctx.stroke();

  ctx.fillStyle = COLORS.notFoundText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2 + 10, y + boxH / 2);
}

/** Vẽ các overlay trạng thái (badge/counter/callstack/legend...) — dùng chung cho frame tĩnh và transition. */
export function drawSnapshotOverlays(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  snapshot: CanvasStateSnapshot,
  skipBadges = false,
): void {
  // StackQueueRenderer tự vẽ cấu trúc visual thật → tắt badge chữ trùng lặp
  if (!skipBadges) {
    drawQueueStackBadges(ctx, w, h, snapshot);
  }

  // Target badge
  if (snapshot.searchTarget !== undefined) {
    drawTargetBadge(ctx, w, h, snapshot.searchTarget, snapshot.searchFound === true);
  }

  // ── Các badge góc trên-phải xếp dọc (tránh chồng nhau) ──
  let topRightY = 12;

  // Comparison counter
  if (snapshot.comparisonCount !== undefined && snapshot.comparisonCount > 0) {
    drawComparisonCounter(ctx, w, snapshot.comparisonCount, topRightY);
    topRightY += 22 + 8;
  }

  // Depth badge — ẩn khi đã có call stack panel (panel đã hiển thị depth trong header)
  if (snapshot.recursionDepth !== undefined && snapshot.recursionDepth > 0
    && !(snapshot.callStack && snapshot.callStack.length > 0)) {
    drawDepthBadge(ctx, w, snapshot.recursionDepth, topRightY);
    topRightY += 22 + 8;
  }

  // Not found overlay
  if (snapshot.searchFound === false && snapshot.searchRange) {
    const rng = snapshot.searchRange;
    if (rng.low > rng.high) {
      drawNotFoundOverlay(ctx, w, h);
    }
  }

  // Call stack panel (góc trên-trái — không đè lên badge phải)
  if (snapshot.callStack && snapshot.callStack.length > 0) {
    drawCallStackPanel(ctx, w, h, snapshot.callStack, snapshot.recursionDepth ?? 0);
  }

  // Legend — chỉ hiển thị khi có trạng thái tìm kiếm đặc biệt (found/pruned)
  if (snapshot.searchTarget !== undefined) {
    const legendItems: Array<{ color: string; label: string }> = [
      { color: COLORS.barDefault, label: 'Default' },
      { color: COLORS.barCompare, label: 'Comparing' },
    ];
    if (snapshot.searchFound) legendItems.push({ color: COLORS.barSorted, label: 'Found' });
    else legendItems.push({ color: COLORS.barPruned, label: 'Pruned' });
    if (w > 300) {
      drawLegend(ctx, w, h, legendItems, topRightY);
    }
  }
}
