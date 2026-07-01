import type { PathNode } from '../types/learning-path.types';

/**
 * Client-side DAG solver for prerequisite-based node unlocking.
 * Resolves node statuses based on completed prerequisites.
 */
export class PrerequisiteDAGEngine {
  /**
   * Resolve all node statuses based on completed node IDs.
   * A node is UNLOCKED only when ALL prerequisites are COMPLETED.
   */
  public static resolveNodeStatuses(
    nodes: PathNode[],
    completedNodeIds: Set<string>
  ): PathNode[] {
    return nodes.map((node) => {
      if (completedNodeIds.has(node.id)) {
        return { ...node, status: 'COMPLETED' as const };
      }

      if (node.prerequisites.length === 0) {
        return {
          ...node,
          status: node.status === 'LOCKED' ? ('UNLOCKED' as const) : node.status,
        };
      }

      const allPrereqsCompleted = node.prerequisites.every((prereqId) =>
        completedNodeIds.has(prereqId)
      );

      if (allPrereqsCompleted) {
        return {
          ...node,
          status: node.status === 'LOCKED' ? ('UNLOCKED' as const) : node.status,
        };
      }

      return { ...node, status: 'LOCKED' as const };
    });
  }

  /**
   * Detect cycles in the DAG to validate graph integrity.
   * Returns true if a cycle is detected (invalid DAG).
   */
  public static hasCycle(nodes: PathNode[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const adjacency = new Map<string, string[]>();

    for (const node of nodes) {
      adjacency.set(node.id, node.prerequisites);
    }

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const prereqs = adjacency.get(nodeId) ?? [];
      for (const prereqId of prereqs) {
        if (!visited.has(prereqId)) {
          if (dfs(prereqId)) return true;
        } else if (recursionStack.has(prereqId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }

  /**
   * Get topological order of nodes for rendering.
   */
  public static getTopologicalOrder(nodes: PathNode[]): string[] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjacency.set(node.id, []);
    }

    for (const node of nodes) {
      for (const prereqId of node.prerequisites) {
        const neighbors = adjacency.get(prereqId);
        if (neighbors) {
          neighbors.push(node.id);
        }
        inDegree.set(node.id, (inDegree.get(node.id) ?? 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);

      const neighbors = adjacency.get(current) ?? [];
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    return order;
  }
}
