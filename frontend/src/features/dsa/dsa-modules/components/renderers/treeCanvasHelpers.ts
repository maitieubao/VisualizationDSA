
export const NODE_RADIUS  = 22;
export const LEVEL_HEIGHT = 70;
export const MARGIN_TOP   = 50;

export function drawEdge(
  ctx: CanvasRenderingContext2D, 
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number,
  weight?: number
): void {
  const style = getComputedStyle(document.documentElement);
  const colorEdge = style.getPropertyValue('--color-border-strong').trim() || '#475569';

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const fromX = x1 + Math.cos(angle) * NODE_RADIUS;
  const fromY = y1 + Math.sin(angle) * NODE_RADIUS;
  const toX   = x2 - Math.cos(angle) * NODE_RADIUS;
  const toY   = y2 - Math.sin(angle) * NODE_RADIUS;
  
  ctx.strokeStyle = colorEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  
  const arrowLen = 8;
  ctx.fillStyle = colorEdge;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - arrowLen * Math.cos(angle - Math.PI / 6), toY - arrowLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - arrowLen * Math.cos(angle + Math.PI / 6), toY - arrowLen * Math.sin(angle + Math.PI / 6));
  ctx.fill();

  // If edge weight is provided (e.g. Dijkstra), draw weighted label at midpoint
  if (weight !== undefined) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    ctx.fillStyle = style.getPropertyValue('--color-bg-primary').trim() || '#080808';
    ctx.beginPath();
    ctx.arc(midX, midY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#22D3EE'; // Neon Cyan edge weight text
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(weight), midX, midY);
  }
}

export function drawNode(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  value: number, 
  status: 'default' | 'active' | 'visited'
): void {
  const style = getComputedStyle(document.documentElement);
  const colorNode = style.getPropertyValue('--color-bg-surface').trim() || '#232323';
  const colorBorder = style.getPropertyValue('--color-border-default').trim() || '#475569';
  const colorActive = style.getPropertyValue('--color-accent-primary').trim() || '#FBBF24'; // Amber active
  const colorVisited = '#10B981'; // Emerald Green outline for visited
  const colorText = style.getPropertyValue('--color-text-primary').trim() || '#FFFFFF';
  const colorBg = style.getPropertyValue('--color-bg-primary').trim() || '#080808';

  ctx.beginPath();
  ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
  
  if (status === 'active') {
    ctx.fillStyle = colorActive;
  } else if (status === 'visited') {
    ctx.fillStyle = '#065F46'; // Dark green background for visited nodes
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

  // Render 999 as Infinity sign (∞)
  const displayText = value === 999 ? '∞' : String(value);
  ctx.fillText(displayText, x, y);
}

