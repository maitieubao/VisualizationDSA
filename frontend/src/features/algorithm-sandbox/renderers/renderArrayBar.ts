import type { AnimatedItem } from '../types/canvas.types';

/**
 * renderArrayBar — vẽ một card/bar đại diện cho phần tử trong mảng.
 * Pure function: không có side effect ngoài draw calls lên ctx.
 */
export function renderArrayBar(
  ctx: CanvasRenderingContext2D,
  item: AnimatedItem,
  idx: number,
  maxVal: number,
  slotWidth: number,
  slotHeight: number
) {
  const x = item.currentX;
  const y = 80;
  const cardH = Math.max((item.value / maxVal) * slotHeight, 35);
  const scale = item.currentScale;
  const { r, g, b } = item.currentRGB;
  const colorStr = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  ctx.save();
  ctx.translate(x + slotWidth / 2, y + cardH / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(x + slotWidth / 2), -(y + cardH / 2));

  // Gradient fill
  const grad = ctx.createLinearGradient(x, y, x, y + cardH);
  if (item.status === 'normal') {
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0.15)');
  } else {
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.85)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.15)`);
  }

  ctx.shadowBlur = item.status === 'normal' ? 6 : 22;
  ctx.shadowColor = colorStr;
  ctx.fillStyle = grad;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
  ctx.lineWidth = item.status === 'normal' ? 1.5 : 2.5;

  ctx.beginPath();
  ctx.roundRect(x, y, slotWidth, cardH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Value label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.value.toString(), x + slotWidth / 2, y + cardH / 2);

  // Index label
  ctx.fillStyle = item.status === 'normal' ? '#94a3b8' : colorStr;
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillText(`[${idx}]`, x + slotWidth / 2, y + cardH + 20);

  ctx.restore();
}
