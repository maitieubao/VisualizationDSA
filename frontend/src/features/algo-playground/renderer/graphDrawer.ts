import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { COLORS } from './colors';
import { lerpColor } from './geometry';
import { edgeStateColor, isEdgeHighlighted, nodeStateColor } from './nodeStates';

export function drawGraph(ctx: CanvasRenderingContext2D, w: number, h: number, snapshot: CanvasStateSnapshot): void {
  const nodes = snapshot.graphNodes ?? [];
  const edges = snapshot.graphEdges ?? [];
  if (nodes.length === 0) return;

  const nodeR = 22;
  const distances = snapshot.distances ?? {};

  for (const edge of edges) {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) continue;
    const x1 = fromNode.x * w;
    const y1 = fromNode.y * h;
    const x2 = toNode.x * w;
    const y2 = toNode.y * h;

    const highlighted = isEdgeHighlighted(snapshot.highlightedEdges, edge.from, edge.to);
    ctx.strokeStyle = edgeStateColor(snapshot, edge.from, edge.to);
    ctx.lineWidth = highlighted ? 3 : 1.5;
    if (highlighted) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (edge.directed) {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const arrowLen = 9;
      ctx.fillStyle = highlighted ? COLORS.edgeHighlight : COLORS.edgeDefault;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - arrowLen * Math.cos(angle - Math.PI / 6), y2 - arrowLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - arrowLen * Math.cos(angle + Math.PI / 6), y2 - arrowLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }

    if (edge.weight !== undefined && edge.weight !== null) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      ctx.fillStyle = COLORS.badgeBg;
      ctx.beginPath();
      ctx.arc(midX, midY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.edgeWeightText;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(edge.weight), midX, midY);
    }
  }

  for (const node of nodes) {
    const cx = node.x * w;
    const cy = node.y * h;
    ctx.beginPath();
    ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = nodeStateColor(snapshot, node.id);
    ctx.fill();
    ctx.strokeStyle = COLORS.nodeBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = COLORS.nodeText;
    ctx.font = 'bold 13px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, cx, cy);

    const dist = distances[node.id];
    if (dist !== undefined) {
      ctx.fillStyle = COLORS.barCompare;
      ctx.font = '11px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(dist === 999999 ? '∞' : String(dist), cx, cy + nodeR + 14);
    }
  }
}

/**
 * Vẽ graph với nội suy trạng thái giữa prev và curr (vị trí node cố định).
 */
export function drawGraphTransition(ctx: CanvasRenderingContext2D, w: number, h: number, prev: CanvasStateSnapshot, curr: CanvasStateSnapshot, t: number): void {
  const nodes = curr.graphNodes ?? [];
  const edges = curr.graphEdges ?? [];
  if (nodes.length === 0) return;

  const nodeR = 22;
  const distances = curr.distances ?? {};

  for (const edge of edges) {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) continue;
    const x1 = fromNode.x * w;
    const y1 = fromNode.y * h;
    const x2 = toNode.x * w;
    const y2 = toNode.y * h;

    const highlighted = isEdgeHighlighted(curr.highlightedEdges, edge.from, edge.to);
    ctx.strokeStyle = lerpColor(edgeStateColor(prev, edge.from, edge.to), edgeStateColor(curr, edge.from, edge.to), t);
    ctx.lineWidth = highlighted ? 3 : 1.5;
    ctx.setLineDash(highlighted ? [6, 4] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (edge.directed) {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const arrowLen = 9;
      ctx.fillStyle = highlighted ? COLORS.edgeHighlight : COLORS.edgeDefault;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - arrowLen * Math.cos(angle - Math.PI / 6), y2 - arrowLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - arrowLen * Math.cos(angle + Math.PI / 6), y2 - arrowLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }

    if (edge.weight !== undefined && edge.weight !== null) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      ctx.fillStyle = COLORS.badgeBg;
      ctx.beginPath();
      ctx.arc(midX, midY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.edgeWeightText;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(edge.weight), midX, midY);
    }
  }

  for (const node of nodes) {
    const cx = node.x * w;
    const cy = node.y * h;
    ctx.beginPath();
    ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = lerpColor(nodeStateColor(prev, node.id), nodeStateColor(curr, node.id), t);
    ctx.fill();
    ctx.strokeStyle = COLORS.nodeBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = COLORS.nodeText;
    ctx.font = 'bold 13px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, cx, cy);

    const dist = distances[node.id];
    if (dist !== undefined) {
      ctx.fillStyle = COLORS.barCompare;
      ctx.font = '11px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(dist === 999999 ? '∞' : String(dist), cx, cy + nodeR + 14);
    }
  }
}
