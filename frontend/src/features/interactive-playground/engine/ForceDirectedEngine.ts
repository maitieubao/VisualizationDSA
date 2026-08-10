import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';
import type { WorldBounds } from './GraphGeometryEngine';

interface Velocity { x: number; y: number; }

export class ForceDirectedEngine {
  private repulsionConstant = 4000;
  private springConstant = 0.05;
  private desiredSpringLength = 150;
  private damping = 0.85;
  private stabilityThreshold = 0.5;
  private velocities = new Map<string, Velocity>();

  /**
   * IP-016: nhận bounds WORLD-space thật (đã trừ panOffset) để node không bị
   * đẩy ra ngoài mép màn hình khi người dùng pan. Nếu không truyền (test/back-compat),
   * tự suy bounds từ width/height với min = 0 như hành vi cũ.
   */
  tick(nodes: NodeDTO[], edges: EdgeDTO[], width: number, height: number, dragId: string | null, worldBounds?: WorldBounds): number {
    nodes.forEach(n => this.velocities.set(n.id, { x: 0, y: 0 }));

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist === 0) {
          // IP-018: hai node trùng toạ độ → lực đẩy = 0 → chồng lấn vĩnh viễn.
          // Chọn hướng jitter cố định (1, 0) để luôn có lực tách node.
          dx = 1; dy = 0; dist = 1;
        }
        const f = this.repulsionConstant / (dist * dist);
        const fx = (dx / dist) * f, fy = (dy / dist) * f;
        const va = this.velocities.get(a.id)!, vb = this.velocities.get(b.id)!;
        this.velocities.set(a.id, { x: va.x - fx, y: va.y - fy });
        this.velocities.set(b.id, { x: vb.x + fx, y: vb.y + fy });
      }
    }

    for (const edge of edges) {
      const a = nodes.find(n => n.id === edge.from), b = nodes.find(n => n.id === edge.to);
      if (!a || !b) continue;
      let dx = b.x - a.x, dy = b.y - a.y;
      let dist = Math.hypot(dx, dy);
      if (dist === 0) {
        dx = 1; dy = 0; dist = 1;
      }
      const f = this.springConstant * (dist - this.desiredSpringLength);
      const fx = (dx / dist) * f, fy = (dy / dist) * f;
      const va = this.velocities.get(a.id)!, vb = this.velocities.get(b.id)!;
      this.velocities.set(a.id, { x: va.x + fx, y: va.y + fy });
      this.velocities.set(b.id, { x: vb.x - fx, y: vb.y - fy });
    }

    let totalEnergy = 0;
    for (const node of nodes) {
      if (node.id === dragId) continue;
      const vel = this.velocities.get(node.id)!;
      vel.x *= this.damping;
      vel.y *= this.damping;
      const minX = worldBounds ? worldBounds.minX + node.radius : node.radius;
      const maxX = worldBounds ? worldBounds.maxX - node.radius : width - node.radius;
      const minY = worldBounds ? worldBounds.minY + node.radius : node.radius;
      const maxY = worldBounds ? worldBounds.maxY - node.radius : height - node.radius;
      node.x = Math.max(minX, Math.min(maxX, node.x + vel.x));
      node.y = Math.max(minY, Math.min(maxY, node.y + vel.y));
      totalEnergy += vel.x * vel.x + vel.y * vel.y;
    }
    return totalEnergy;
  }

  isStable(energy: number): boolean { return energy < this.stabilityThreshold; }
  reset() { this.velocities.clear(); }
}
