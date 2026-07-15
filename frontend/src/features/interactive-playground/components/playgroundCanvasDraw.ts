import { GraphGeometryEngine } from '../engine/GraphGeometryEngine';
import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

/** Subset of graph algorithm frame data used by the canvas renderer */
interface GraphAnimationFrame {
  visitedEdges?: string[];
  activeNodes?: string[];
  visitedNodes?: string[];
  shortestDistances?: Record<string, number>;
  distances?: Record<string, number>;
}

export function drawPlayground(
  ctx: CanvasRenderingContext2D,
  nodes: NodeDTO[],
  edges: EdgeDTO[],
  selectedNodeId: string | null,
  selectedEdgeId: string | null,
  edgeDrawState: { fromNodeId: string | null; mouseX: number; mouseY: number; snapTarget: NodeDTO | null },
  activeFrame?: GraphAnimationFrame | null,
  selectedAlgorithm?: string,
  hoveredNodeId?: string | null,
  hoveredEdgeId?: string | null
) {
  const rootStyle = typeof window !== 'undefined' ? window.getComputedStyle(document.documentElement) : null;
  const labelBg = rootStyle?.getPropertyValue('--color-bg-active').trim() || '#1e293b';

  for (const edge of edges) {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) continue;

    const isSelected = selectedEdgeId === edge.id;
    const isHovered = hoveredEdgeId === edge.id;
    let isVisitedEdge = false;
    let isActiveEdge = false;

    if (activeFrame) {
      if (activeFrame.visitedEdges?.includes(edge.id)) isVisitedEdge = true;
      if (activeFrame.activeNodes?.includes(edge.from) && activeFrame.activeNodes?.includes(edge.to)) {
        isActiveEdge = true;
      }
    }

    const arrow = GraphGeometryEngine.calculateArrowPlacement(
      fromNode, toNode, fromNode.radius, toNode.radius
    );

    // Draw hover glow behind the edge
    if (isHovered) {
      ctx.beginPath();
      ctx.moveTo(arrow.start.x, arrow.start.y);
      ctx.lineTo(arrow.end.x, arrow.end.y);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)'; // Amber glow
      ctx.lineWidth = 8;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(arrow.start.x, arrow.start.y);
    ctx.lineTo(arrow.end.x, arrow.end.y);

    let edgeColor = '#475569';
    if (isActiveEdge) edgeColor = '#F59E0B'; // Amber
    else if (isVisitedEdge) edgeColor = '#10B981'; // Emerald
    else if (isSelected) edgeColor = '#0EA5E9'; // Cyan
    else if (isHovered) edgeColor = '#F59E0B'; // Amber line highlight

    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = (isSelected || isActiveEdge || isVisitedEdge || isHovered) ? 3 : 2;
    ctx.stroke();

    const headLen = 12;
    ctx.beginPath();
    ctx.moveTo(arrow.end.x, arrow.end.y);
    ctx.lineTo(arrow.end.x - headLen * Math.cos(arrow.angle - Math.PI / 6), arrow.end.y - headLen * Math.sin(arrow.angle - Math.PI / 6));
    ctx.lineTo(arrow.end.x - headLen * Math.cos(arrow.angle + Math.PI / 6), arrow.end.y - headLen * Math.sin(arrow.angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = edgeColor;
    ctx.fill();

    const mid = GraphGeometryEngine.edgeMidpoint(fromNode, toNode);
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labelBgW = ctx.measureText(String(edge.weight)).width + 10;
    ctx.fillStyle = labelBg;
    ctx.fillRect(mid.x - labelBgW / 2, mid.y - 9, labelBgW, 18);
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(String(edge.weight), mid.x, mid.y);
  }

  if (edgeDrawState.fromNodeId) {
    const fromNode = nodes.find(n => n.id === edgeDrawState.fromNodeId);
    if (fromNode) {
      const targetX = edgeDrawState.snapTarget?.x ?? edgeDrawState.mouseX;
      const targetY = edgeDrawState.snapTarget?.y ?? edgeDrawState.mouseY;
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(targetX, targetY);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  for (const node of nodes) {
    const isSelected = selectedNodeId === node.id;
    const isSnapTarget = edgeDrawState.snapTarget?.id === node.id;
    const isHovered = hoveredNodeId === node.id;
    let isVisitedNode = false;
    let isActiveNode = false;

    if (activeFrame) {
      if (activeFrame.visitedNodes?.includes(node.id)) isVisitedNode = true;
      if (activeFrame.activeNodes?.includes(node.id)) isActiveNode = true;
    }

    if (isSnapTarget) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw hover glow behind the node
    if (isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

    let nodeFill = '#334155';
    let nodeStroke = '#64748B';

    if (isActiveNode) {
      nodeFill = '#F59E0B'; // Amber
      nodeStroke = '#FBBF24';
    } else if (isVisitedNode) {
      nodeFill = '#10B981'; // Emerald
      nodeStroke = '#34D399';
    } else if (isSelected) {
      nodeFill = '#0EA5E9'; // Cyan
      nodeStroke = '#38BDF8';
    } else if (isHovered) {
      nodeStroke = '#FBBF24'; // Amber border on hover
    }

    ctx.fillStyle = nodeFill;
    ctx.fill();
    ctx.strokeStyle = nodeStroke;
    ctx.lineWidth = isSelected ? 3 : 2;
    if (isSelected && !activeFrame) ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);

    // Draw Dijkstra distances if applicable
    if (selectedAlgorithm === 'DIJKSTRA' && activeFrame && activeFrame.distances) {
      const dVal = activeFrame.distances[node.id];
      const dText = dVal === Infinity || dVal === undefined ? 'd=∞' : `d=${dVal}`;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = dVal === Infinity ? '#64748B' : '#38BDF8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(dText, node.x, node.y + node.radius + 6);
    }
  }
}
