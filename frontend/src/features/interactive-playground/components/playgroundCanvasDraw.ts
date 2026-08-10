import { GraphGeometryEngine, type Point } from '../engine/GraphGeometryEngine';
import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

export type GraphType = 'undirected' | 'directed';

interface GraphAnimationFrame {
  visitedEdges?: string[];
  activeNodes?: string[];
  visitedNodes?: string[];
  shortestDistances?: Record<string, number>;
  distances?: Record<string, number>;
}

// IP-046: `getComputedStyle` mỗi frame = forced style recalc (antipattern perf).
// CSS variable --color-bg-active hiếm khi đổi → cache 1 lần kèm retry khi null.
let cachedLabelBg: string | null = null;
function getLabelBackground(): string {
  if (cachedLabelBg) return cachedLabelBg;
  if (typeof window === 'undefined' || !document.documentElement) return '#1e293b';
  const value = window.getComputedStyle(document.documentElement).getPropertyValue('--color-bg-active').trim();
  cachedLabelBg = value || '#1e293b';
  return cachedLabelBg;
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
  hoveredEdgeId?: string | null,
  graphType: GraphType = 'undirected',
  isolatedNodeIds: string[] = []
) {
  const labelBg = getLabelBackground();

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

    let edgeColor = '#475569';
    if (isActiveEdge) edgeColor = '#F59E0B';
    else if (isVisitedEdge) edgeColor = '#10B981';
    else if (isSelected) edgeColor = '#0EA5E9';
    else if (isHovered) edgeColor = '#F59E0B';

    const lineWidth = (isSelected || isActiveEdge || isVisitedEdge || isHovered) ? 3 : 2;

    if (isHovered) {
      ctx.beginPath();
      ctx.moveTo(arrow.start.x, arrow.start.y);
      ctx.lineTo(arrow.end.x, arrow.end.y);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 8;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(arrow.start.x, arrow.start.y);
    ctx.lineTo(arrow.end.x, arrow.end.y);
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    if (graphType === 'directed') {
      GraphGeometryEngine.drawArrowhead(ctx, arrow, edgeColor, lineWidth);
    }

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

      if (graphType === 'directed') {
        const tempPlacement = GraphGeometryEngine.calculateArrowPlacement(
          { x: fromNode.x, y: fromNode.y },
          { x: targetX, y: targetY },
          fromNode.radius, 10
        );
        GraphGeometryEngine.drawArrowhead(ctx, tempPlacement, '#38BDF8', 2);
      }
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

    if (isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.fill();
    }

    // IP-005: flash đỏ đỉnh cô lập khi bị chặn bởi quy tắc liên thông (BEHAVIOR_SPEC §2.2).
    const isIsolated = isolatedNodeIds.includes(node.id);
    if (isIsolated) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

    let nodeFill = '#334155';
    let nodeStroke = '#64748B';

    if (isActiveNode) {
      nodeFill = '#F59E0B';
      nodeStroke = '#FBBF24';
    } else if (isVisitedNode) {
      nodeFill = '#10B981';
      nodeStroke = '#34D399';
    } else if (isSelected) {
      nodeFill = '#0EA5E9';
      nodeStroke = '#38BDF8';
    } else if (isHovered) {
      nodeStroke = '#FBBF24';
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