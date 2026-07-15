import type { AnimatedItem } from '../types/canvas.types';

const POINTER_COLORS: Record<string, string> = {
  i: '#a78bfa',  // violet
  j: '#f472b6',  // pink
};

/**
 * renderLoopPointer — vẽ arrow pointer cho một biến vòng lặp (i, j, k...).
 */
export function renderLoopPointer(
  ctx: CanvasRenderingContext2D,
  varName: string,
  currentX: number,
  slotWidth: number,
  offsetY: number = 0
) {
  const x = currentX + slotWidth / 2;
  const arrowY = 45 - offsetY;
  const color = POINTER_COLORS[varName] ?? '#e2e8f0';

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  // Arrow triangle
  ctx.beginPath();
  ctx.moveTo(x, 70);
  ctx.lineTo(x - 5, 62);
  ctx.lineTo(x + 5, 62);
  ctx.closePath();
  ctx.fill();

  // Arrow stem
  ctx.beginPath();
  ctx.moveTo(x, 70);
  ctx.lineTo(x, arrowY);
  ctx.stroke();

  // Label badge
  ctx.beginPath();
  ctx.roundRect(x - 12, arrowY - 18, 24, 18, 4);
  ctx.fill();

  const rootStyle = getComputedStyle(document.documentElement);
  const textInverse = rootStyle.getPropertyValue('--color-text-inverse').trim() || '#0f172a';
  ctx.fillStyle = textInverse;
  ctx.font = 'bold 11px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(varName, x, arrowY - 9);

  ctx.restore();
}

/**
 * renderLoopPointers — vẽ arrow pointer cho nhiều biến vòng lặp.
 */
export function renderLoopPointers(
  ctx: CanvasRenderingContext2D,
  loopVariables: Record<string, number>,
  items: AnimatedItem[],
  slotWidth: number
) {
  let pointerOffset = 0;

  Object.entries(loopVariables).forEach(([varName, indexVal]) => {
    const idx = Number(indexVal);
    if (idx < 0 || idx >= items.length) return;

    const item = items[idx];
    renderLoopPointer(ctx, varName, item.currentX, slotWidth, pointerOffset);
    pointerOffset += 24;
  });
}

