// ============================================================
// LCOMCalculator — LCOM4 Cohesion Metric Calculator
// Measures Lack of Cohesion in Methods via DFS connected components
// LCOM4 = 1: Perfectly cohesive (SRP PASS)
// LCOM4 >= 2: Disconnected responsibilities (SRP VIOLATION)
// ============================================================

import type { UMLClassMember } from '../types/solid-visualization.types';

export class LCOMCalculator {
  /**
   * Calculates LCOM4 (Lack of Cohesion in Methods) by counting
   * connected components in the method-field sharing graph.
   */
  public static calculateLCOM4(members: UMLClassMember[]): number {
    const methods = members.filter((m) => m.type === 'METHOD');
    if (methods.length === 0) return 0;

    const adjList = new Map<string, string[]>();
    for (const m of methods) {
      adjList.set(m.name, []);
    }

    for (let i = 0; i < methods.length; i++) {
      for (let j = i + 1; j < methods.length; j++) {
        const m1 = methods[i];
        const m2 = methods[j];

        const hasSharedField = m1.accessedFields.some((f) =>
          m2.accessedFields.includes(f)
        );
        if (hasSharedField) {
          adjList.get(m1.name)!.push(m2.name);
          adjList.get(m2.name)!.push(m1.name);
        }
      }
    }

    const visited = new Set<string>();
    let connectedComponents = 0;

    for (const m of methods) {
      if (!visited.has(m.name)) {
        connectedComponents++;
        this.dfs(m.name, adjList, visited);
      }
    }

    return connectedComponents;
  }

  private static dfs(
    node: string,
    adjList: Map<string, string[]>,
    visited: Set<string>
  ): void {
    visited.add(node);
    const neighbors = adjList.get(node) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.dfs(neighbor, adjList, visited);
      }
    }
  }
}
