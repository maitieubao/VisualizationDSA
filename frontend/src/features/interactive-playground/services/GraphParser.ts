import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

export interface AdjacencyEntry { target: string; weight: number; }
export interface GraphPayload {
  algorithmId: string;
  inputType: string;
  nodes: string[];
  adjacencyList: Record<string, AdjacencyEntry[]>;
}

export class GraphParser {
  static toAdjacencyList(nodes: NodeDTO[], edges: EdgeDTO[], algorithmId = 'dijkstra'): GraphPayload {
    const adjacencyList: Record<string, AdjacencyEntry[]> = {};
    for (const node of nodes) adjacencyList[node.label] = [];
    for (const edge of edges) {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (fromNode && toNode) {
        adjacencyList[fromNode.label].push({ target: toNode.label, weight: edge.weight });
      }
    }
    return { algorithmId, inputType: 'adjacency-list', nodes: nodes.map(n => n.label), adjacencyList };
  }

  static findIsolatedNodes(nodes: NodeDTO[], edges: EdgeDTO[]): string[] {
    if (nodes.length === 0) return [];
    const adjMap = new Map<string, Set<string>>(nodes.map(n => [n.id, new Set()]));
    for (const edge of edges) {
      adjMap.get(edge.from)?.add(edge.to);
      adjMap.get(edge.to)?.add(edge.from);
    }
    const visited = new Set<string>([nodes[0].id]);
    const queue = [nodes[0].id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjMap.get(current);
      if (neighbors) {
        for (const n of neighbors) {
          if (!visited.has(n)) { visited.add(n); queue.push(n); }
        }
      }
    }
    return nodes.filter(n => !visited.has(n.id)).map(n => n.label);
  }

  static exportToJSON(nodes: NodeDTO[], edges: EdgeDTO[]): string {
    return JSON.stringify({ nodes, edges }, null, 2);
  }

  static importFromJSON(jsonStr: string): { nodes: NodeDTO[]; edges: EdgeDTO[] } | null {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null;
      const nodes: NodeDTO[] = parsed.nodes.map((n: unknown) => {
        const r = n as Record<string, unknown>;
        return { id: String(r.id), label: String(r.label), x: Number(r.x), y: Number(r.y), radius: Number(r.radius) || 20 };
      });
      const edges: EdgeDTO[] = parsed.edges.map((e: unknown) => {
        const r = e as Record<string, unknown>;
        return { id: String(r.id), from: String(r.from), to: String(r.to), weight: Number(r.weight) || 1 };
      });
      return { nodes, edges };
    } catch {
      return null;
    }
  }
}
