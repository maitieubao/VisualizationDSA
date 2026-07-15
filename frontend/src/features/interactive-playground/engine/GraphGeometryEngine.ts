import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

export interface Point { x: number; y: number; }
export interface ArrowPlacement { start: Point; end: Point; angle: number; }

export class GraphGeometryEngine {
  static hitTestNode(mousePos: Point, nodes: NodeDTO[]): NodeDTO | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (Math.hypot(mousePos.x - n.x, mousePos.y - n.y) <= n.radius) return n;
    }
    return null;
  }

  static hitTestEdge(mousePos: Point, edges: EdgeDTO[], nodes: NodeDTO[], threshold = 8): EdgeDTO | null {
    for (let i = edges.length - 1; i >= 0; i--) {
      const edge = edges[i];
      const from = nodes.find(n => n.id === edge.from);
      const to = nodes.find(n => n.id === edge.to);
      if (from && to && this.pointToSegmentDistance(mousePos, from, to) <= threshold) return edge;
    }
    return null;
  }

  static calculateArrowPlacement(from: Point, to: Point, fromRadius: number, toRadius: number): ArrowPlacement {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    return {
      start: { x: from.x + fromRadius * Math.cos(angle), y: from.y + fromRadius * Math.sin(angle) },
      end: { x: to.x - toRadius * Math.cos(angle), y: to.y - toRadius * Math.sin(angle) },
      angle,
    };
  }

  static isWithinSnapDistance(mousePos: Point, node: NodeDTO, snapDistance = 40): boolean {
    return Math.hypot(mousePos.x - node.x, mousePos.y - node.y) <= node.radius + snapDistance;
  }

  static pointToSegmentDistance(p: Point, a: Point, b: Point): number {
    const abx = b.x - a.x, aby = b.y - a.y;
    const ab2 = abx * abx + aby * aby;
    if (ab2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / ab2));
    return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
  }

  static edgeMidpoint(fromNode: NodeDTO, toNode: NodeDTO): Point {
    return { x: (fromNode.x + toNode.x) / 2, y: (fromNode.y + toNode.y) / 2 };
  }
}
