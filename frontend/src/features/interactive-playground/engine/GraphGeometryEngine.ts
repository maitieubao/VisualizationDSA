import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

export interface Point { x: number; y: number; }
export interface ArrowPlacement { start: Point; end: Point; angle: number; }

/** Giới hạn toạ độ WORLD-space (đã trừ pan & chia zoom) mà node được phép di chuyển. */
export interface WorldBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class GraphGeometryEngine {
  static hitTestNode(mousePos: Point, nodes: NodeDTO[]): NodeDTO | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (Math.hypot(mousePos.x - n.x, mousePos.y - n.y) <= n.radius) return n;
    }
    return null;
  }

  /**
   * IP-024: threshold nhận giá trị WORLD-space nhưng được quy đổi sang SCREEN-space
   * (chia zoom, tối thiểu 5px màn hình) để cạnh luôn bấm được dù thu nhỏ.
   */
  static hitTestEdge(mousePos: Point, edges: EdgeDTO[], nodes: NodeDTO[], threshold = 8, zoom = 1): EdgeDTO | null {
    const screenThreshold = Math.max(threshold / zoom, 5);
    for (let i = edges.length - 1; i >= 0; i--) {
      const edge = edges[i];
      const from = nodes.find(n => n.id === edge.from);
      const to = nodes.find(n => n.id === edge.to);
      if (from && to && this.pointToSegmentDistance(mousePos, from, to) <= screenThreshold) return edge;
    }
    return null;
  }

  /**
   * IP-006/IP-016: helper clamp dùng chung — chuyển viewport CSS px + camera
   * (pan/zoom) thành giới hạn WORLD-space thật của vùng nhìn thấy.
   * minX = -pan.x/zoom + margin ; maxX = (width - pan.x)/zoom - margin (tương tự Y).
   */
  static worldBoundsFromViewport(width: number, height: number, pan: Point, zoom: number, margin: number): WorldBounds {
    return {
      minX: -pan.x / zoom + margin,
      maxX: (width - pan.x) / zoom - margin,
      minY: -pan.y / zoom + margin,
      maxY: (height - pan.y) / zoom - margin,
    };
  }

  static clampPointToBounds(pos: Point, bounds: WorldBounds): Point {
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, pos.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, pos.y)),
    };
  }

  static calculateArrowPlacement(from: Point, to: Point, fromRadius: number, toRadius: number): ArrowPlacement {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    return {
      start: { x: from.x + fromRadius * Math.cos(angle), y: from.y + fromRadius * Math.sin(angle) },
      end: { x: to.x - toRadius * Math.cos(angle), y: to.y - toRadius * Math.sin(angle) },
      angle,
    };
  }

  static drawArrowhead(ctx: CanvasRenderingContext2D, placement: ArrowPlacement, color: string, lineWidth: number) {
    const arrowSize = 8;
    ctx.save();
    ctx.translate(placement.end.x, placement.end.y);
    ctx.rotate(placement.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowSize, -arrowSize * 0.6);
    ctx.lineTo(-arrowSize * 0.5, 0);
    ctx.lineTo(-arrowSize, arrowSize * 0.6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  /**
   * IP-013: khoảng cách snap 40px tính theo WORLD nhưng phải quy đổi sang
   * screen-space (chia zoom, tối thiểu 5px màn hình) để không bị mất hút khi zoom nhỏ.
   */
  static isWithinSnapDistance(mousePos: Point, node: NodeDTO, snapDistance = 40, zoom = 1): boolean {
    const screenSnapDistance = Math.max(snapDistance / zoom, 5);
    return Math.hypot(mousePos.x - node.x, mousePos.y - node.y) <= node.radius + screenSnapDistance;
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
