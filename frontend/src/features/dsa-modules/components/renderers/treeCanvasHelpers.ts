export function drawGraphEdge(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  opts?: { weight?: number; directed?: boolean; highlighted?: boolean; inMST?: boolean },
): void {
  const style = getComputedStyle(document.documentElement);
  const colorEdge = style.getPropertyValue('--color-border-strong').trim() || '#475569';
  const colorHighlight = style.getPropertyValue('--color-accent-yellow').trim() || '#FBBF24';
  const colorMST = style.getPropertyValue('--color-accent-purple').trim() || '#A855F7';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  if (opts?.inMST) {
    ctx.strokeStyle = colorMST;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
  } else if (opts?.highlighted) {
    ctx.strokeStyle = colorHighlight;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
  } else {
    ctx.strokeStyle = colorEdge;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  if (opts?.directed) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const tipX = x2 - 20;
    const tipY = y2 - 20;
    const arrowLen = 8;
    ctx.fillStyle = opts.inMST ? colorMST : opts.highlighted ? colorHighlight : colorEdge;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowLen * Math.cos(angle - Math.PI / 6), y2 - arrowLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - arrowLen * Math.cos(angle + Math.PI / 6), y2 - arrowLen * Math.sin(angle + Math.PI / 6));
    ctx.fill();
  }

  if (opts?.weight !== undefined && opts.weight !== null) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const bg = style.getPropertyValue('--color-bg-primary').trim() || '#080808';
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(midX, midY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colorEdge;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = opts.inMST ? colorMST : opts.highlighted ? colorHighlight : '#22D3EE';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(opts.weight), midX, midY);
  }
}

export const NODE_RADIUS = 22;
export const LEVEL_HEIGHT = 70;
export const MARGIN_TOP = 50;

export function drawEdge(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  weight?: number,
): void {
  drawGraphEdge(ctx, x1, y1, x2, y2, { weight, directed: true });
}

export function drawNode(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, value: number,
  status: 'default' | 'active' | 'visited',
): void {
  const style = getComputedStyle(document.documentElement);
  const colorNode = style.getPropertyValue('--color-bg-surface').trim() || '#232323';
  const colorBorder = style.getPropertyValue('--color-border-default').trim() || '#475569';
  const colorActive = style.getPropertyValue('--color-accent-primary').trim() || '#FBBF24';
  const colorVisited = '#10B981';
  const colorText = style.getPropertyValue('--color-text-primary').trim() || '#FFFFFF';
  const colorBg = style.getPropertyValue('--color-bg-primary').trim() || '#080808';

  ctx.beginPath();
  ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);

  if (status === 'active') {
    ctx.fillStyle = colorActive;
  } else if (status === 'visited') {
    ctx.fillStyle = '#065F46';
  } else {
    ctx.fillStyle = colorNode;
  }
  ctx.fill();

  if (status === 'active') {
    ctx.strokeStyle = colorActive;
  } else if (status === 'visited') {
    ctx.strokeStyle = colorVisited;
  } else {
    ctx.strokeStyle = colorBorder;
  }
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = status === 'active' ? colorBg : colorText;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const displayText = value === 999 ? '∞' : String(value);
  ctx.fillText(displayText, x, y);
}
