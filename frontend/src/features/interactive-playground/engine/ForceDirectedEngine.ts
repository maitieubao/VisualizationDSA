import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

interface Velocity { x: number; y: number; }

export class ForceDirectedEngine {
  private repulsionConstant = 4000;
  private springConstant = 0.05;
  private desiredSpringLength = 150;
  private damping = 0.85;
  private stabilityThreshold = 0.5;
  private velocities = new Map<string, Velocity>();

  tick(nodes: NodeDTO[], edges: EdgeDTO[], width: number, height: number, dragId: string | null): number {
    nodes.forEach(n => this.velocities.set(n.id, { x: 0, y: 0 }));

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1.0;
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
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1.0;
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
      node.x = Math.max(node.radius, Math.min(width - node.radius, node.x + vel.x));
      node.y = Math.max(node.radius, Math.min(height - node.radius, node.y + vel.y));
      totalEnergy += vel.x * vel.x + vel.y * vel.y;
    }
    return totalEnergy;
  }

  isStable(energy: number): boolean { return energy < this.stabilityThreshold; }
  reset() { this.velocities.clear(); }
}
