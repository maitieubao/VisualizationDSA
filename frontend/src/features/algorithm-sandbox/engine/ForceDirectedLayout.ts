export interface GraphNode {
  id: string;
  x: number;
  y: number;
  fx?: number;
  fy?: number;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  weight?: number;
}

export class ForceDirectedLayout {
  private kRepulsion = 400;
  private kAttraction = 0.06;
  private idealLength = 120;
  private damping = 0.85;

  constructor(params?: { kRepulsion?: number; kAttraction?: number; idealLength?: number; damping?: number }) {
    if (params?.kRepulsion) this.kRepulsion = params.kRepulsion;
    if (params?.kAttraction) this.kAttraction = params.kAttraction;
    if (params?.idealLength) this.idealLength = params.idealLength;
    if (params?.damping) this.damping = params.damping;
  }

  public computePhysicsStep(nodes: GraphNode[], edges: GraphEdge[]): void {
    nodes.forEach(n => { n.fx = 0; n.fy = 0; });

    // 1. Coulomb Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;
        const force = this.kRepulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        n1.fx! -= fx; n1.fy! -= fy;
        n2.fx! += fx; n2.fy! += fy;
      }
    }

    // 2. Hooke Attraction
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.sourceId);
      const target = nodes.find(n => n.id === edge.targetId);
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;
      const weightFactor = edge.weight ? Math.sqrt(edge.weight) / 10 : 1;
      const force = this.kAttraction * (dist - this.idealLength) * weightFactor;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      source.fx! += fx; source.fy! += fy;
      target.fx! -= fx; target.fy! -= fy;
    });

    // 3. Update Positions
    nodes.forEach(node => {
      node.x += (node.fx || 0) * this.damping;
      node.y += (node.fy || 0) * this.damping;
    });
  }

  public convergeLayout(nodes: GraphNode[], edges: GraphEdge[], iterations = 100): void {
    for (let i = 0; i < iterations; i++) {
      this.computePhysicsStep(nodes, edges);
    }
  }

  public isStable(nodes: GraphNode[], threshold = 0.1): boolean {
    return nodes.every(n => Math.abs(n.fx || 0) < threshold && Math.abs(n.fy || 0) < threshold);
  }
}

export default ForceDirectedLayout;
