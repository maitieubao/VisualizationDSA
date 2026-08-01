import type { Vertex } from "../engine/InteractivePlaygroundEngine";

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  weight: number;
}

export function renderGraphPlayground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  vertices: Vertex[],
  edges: GraphEdge[],
  selectedVertexId: string | null
): void {
  ctx.clearRect(0, 0, width, height);

  // Extract design tokens dynamically from DOM computed styles
  const rootStyle = getComputedStyle(document.documentElement);
  const primaryBg = rootStyle.getPropertyValue('--color-bg-primary').trim() || '#0b0b0b';
  const surfaceBg = rootStyle.getPropertyValue('--color-bg-surface').trim() || '#181818';
  const borderDefault = rootStyle.getPropertyValue('--color-border-strong').trim() || '#334155';
  const primaryText = rootStyle.getPropertyValue('--color-text-primary').trim() || '#f2f2f2';
  const secondaryText = rootStyle.getPropertyValue('--color-text-secondary').trim() || '#8a8a8a';
  const cyanAccent = rootStyle.getPropertyValue('--color-accent-cyan').trim() || '#06b6d4';
  const activeBg = rootStyle.getPropertyValue('--color-accent-primary-dark').trim() || '#c96848';
  const activeBorder = rootStyle.getPropertyValue('--color-accent-primary').trim() || '#e8825a';

  edges.forEach((edge) => {
    const v1 = vertices.find((v) => v.id === edge.sourceId);
    const v2 = vertices.find((v) => v.id === edge.targetId);
    if (!v1 || !v2) return;

    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.quadraticCurveTo((v1.x + v2.x) / 2, (v1.y + v2.y) / 2 - 15, v2.x, v2.y);
    ctx.strokeStyle = cyanAccent;
    ctx.lineWidth = 2;
    ctx.shadowColor = cyanAccent;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const mx = (v1.x + v2.x) / 2;
    const my = (v1.y + v2.y) / 2 - 15;
    ctx.fillStyle = primaryBg;
    ctx.fillRect(mx - 8, my - 6, 16, 12);
    ctx.strokeStyle = cyanAccent;
    ctx.strokeRect(mx - 8, my - 6, 16, 12);
    ctx.fillStyle = primaryText;
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(edge.weight), mx, my);
  });

  vertices.forEach((v) => {
    const isSelected = selectedVertexId === v.id;
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(v.x, v.y, 25, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(232, 130, 90, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(v.x, v.y, 18, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? activeBg : surfaceBg;
    ctx.fill();
    ctx.strokeStyle = isSelected ? activeBorder : borderDefault;
    ctx.lineWidth = 2;
    if (isSelected) {
      ctx.shadowColor = activeBorder;
      ctx.shadowBlur = 10;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = isSelected ? "#ffffff" : secondaryText;
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(v.id, v.x, v.y);
  });
}

