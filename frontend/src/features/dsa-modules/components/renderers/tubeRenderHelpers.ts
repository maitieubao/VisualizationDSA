import type { FrameDTO } from '../../types/algorithm.types';

export interface TubeColors {
  cell: string;
  border: string;
  active: string;
  remove: string;
  text: string;
  muted: string;
}

export const CELL_W = 70;
export const CELL_H = 36;
export const GAP = 4;
export const MARGIN = 40;

export function renderStack(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameDTO,
  colors: TubeColors
): void {
  const n = frame.dataState.length;
  const totalH = n * (CELL_H + GAP) - GAP;
  const startY = Math.max(MARGIN, (h - totalH) / 2);
  const cx = w / 2;

  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - CELL_W / 2 - 10, startY - 10, CELL_W + 20, totalH + 20);

  ctx.fillStyle = colors.muted;
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TOP', cx, startY - 16);

  for (let i = n - 1; i >= 0; i--) {
    const visualIdx = n - 1 - i;
    const y = startY + visualIdx * (CELL_H + GAP);
    const isActive = frame.highlights.active.includes(i);
    const isRemove = frame.highlights.swap.includes(i);

    ctx.fillStyle = isRemove ? colors.remove : isActive ? colors.active : colors.cell;
    ctx.strokeStyle = isRemove ? colors.remove : isActive ? colors.active : colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - CELL_W / 2, y, CELL_W, CELL_H, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colors.text;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(frame.dataState[i]), cx, y + CELL_H / 2);
  }
}

export function renderQueue(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameDTO,
  colors: TubeColors
): void {
  const n = frame.dataState.length;
  const totalW = n * (CELL_W + GAP) - GAP;
  const startX = Math.max(MARGIN, (w - totalW) / 2);
  const cy = h / 2;

  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(startX - 10, cy - CELL_H / 2 - 10, totalW + 20, CELL_H + 20);

  ctx.fillStyle = colors.muted;
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FRONT', startX + CELL_W / 2, cy - CELL_H / 2 - 16);
  ctx.fillText('REAR', startX + totalW - CELL_W / 2, cy - CELL_H / 2 - 16);

  for (let i = 0; i < n; i++) {
    const x = startX + i * (CELL_W + GAP);
    const isActive = frame.highlights.active.includes(i);
    const isRemove = frame.highlights.swap.includes(i);

    ctx.fillStyle = isRemove ? colors.remove : isActive ? colors.active : colors.cell;
    ctx.strokeStyle = isRemove ? colors.remove : isActive ? colors.active : colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, cy - CELL_H / 2, CELL_W, CELL_H, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colors.text;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(frame.dataState[i]), x + CELL_W / 2, cy);
  }
}
