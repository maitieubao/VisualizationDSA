import { describe, it, expect } from 'vitest';
import { PrerequisiteDAGEngine } from '../engine/PrerequisiteDAGEngine';
import type { PathNode } from '../types/learning-path.types';

function makeNodes(overrides: Partial<PathNode>[] = []): PathNode[] {
  const defaults: PathNode[] = [
    { id: 'bubble-sort', title: 'Bubble Sort', prerequisites: [], status: 'UNLOCKED' },
    { id: 'quicksort', title: 'Quick Sort', prerequisites: ['bubble-sort'], status: 'LOCKED' },
    { id: 'binary-tree', title: 'Binary Search Tree', prerequisites: ['quicksort'], status: 'LOCKED' },
    { id: 'solid-uml', title: 'SOLID Design Patterns', prerequisites: ['binary-tree'], status: 'LOCKED' },
  ];
  return overrides.length > 0
    ? overrides.map((o, i) => ({ ...defaults[i], ...o }))
    : defaults;
}

describe('PrerequisiteDAGEngine', () => {
  describe('resolveNodeStatuses', () => {
    it('should unlock QuickSort when BubbleSort is COMPLETED', () => {
      const nodes = makeNodes();
      const completed = new Set(['bubble-sort']);
      const resolved = PrerequisiteDAGEngine.resolveNodeStatuses(nodes, completed);

      expect(resolved.find((n) => n.id === 'bubble-sort')!.status).toBe('COMPLETED');
      expect(resolved.find((n) => n.id === 'quicksort')!.status).toBe('UNLOCKED');
    });

    it('should keep nodes LOCKED when prerequisites are not completed', () => {
      const nodes = makeNodes();
      const completed = new Set<string>();
      const resolved = PrerequisiteDAGEngine.resolveNodeStatuses(nodes, completed);

      expect(resolved.find((n) => n.id === 'quicksort')!.status).toBe('LOCKED');
      expect(resolved.find((n) => n.id === 'binary-tree')!.status).toBe('LOCKED');
      expect(resolved.find((n) => n.id === 'solid-uml')!.status).toBe('LOCKED');
    });

    it('should auto-unlock nodes with no prerequisites', () => {
      const nodes: PathNode[] = [
        { id: 'intro', title: 'Introduction', prerequisites: [], status: 'LOCKED' },
      ];
      const completed = new Set<string>();
      const resolved = PrerequisiteDAGEngine.resolveNodeStatuses(nodes, completed);

      expect(resolved[0].status).toBe('UNLOCKED');
    });

    it('should preserve IN_PROGRESS status for nodes without prerequisites', () => {
      const nodes: PathNode[] = [
        { id: 'intro', title: 'Introduction', prerequisites: [], status: 'IN_PROGRESS' },
      ];
      const completed = new Set<string>();
      const resolved = PrerequisiteDAGEngine.resolveNodeStatuses(nodes, completed);

      expect(resolved[0].status).toBe('IN_PROGRESS');
    });

    it('should mark completed nodes as COMPLETED regardless of prerequisites', () => {
      const nodes = makeNodes();
      const completed = new Set(['bubble-sort', 'quicksort', 'binary-tree', 'solid-uml']);
      const resolved = PrerequisiteDAGEngine.resolveNodeStatuses(nodes, completed);

      resolved.forEach((n) => expect(n.status).toBe('COMPLETED'));
    });

    it('should unlock chain: bubble → quicksort → binary-tree when first two completed', () => {
      const nodes = makeNodes();
      const completed = new Set(['bubble-sort', 'quicksort']);
      const resolved = PrerequisiteDAGEngine.resolveNodeStatuses(nodes, completed);

      expect(resolved.find((n) => n.id === 'binary-tree')!.status).toBe('UNLOCKED');
      expect(resolved.find((n) => n.id === 'solid-uml')!.status).toBe('LOCKED');
    });

    it('should handle multiple prerequisites requiring ALL to be completed', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'UNLOCKED' },
        { id: 'b', title: 'B', prerequisites: [], status: 'UNLOCKED' },
        { id: 'c', title: 'C', prerequisites: ['a', 'b'], status: 'LOCKED' },
      ];
      const onlyA = new Set(['a']);
      const bothAB = new Set(['a', 'b']);

      const resolvedPartial = PrerequisiteDAGEngine.resolveNodeStatuses(nodes, onlyA);
      expect(resolvedPartial.find((n) => n.id === 'c')!.status).toBe('LOCKED');

      const resolvedFull = PrerequisiteDAGEngine.resolveNodeStatuses(nodes, bothAB);
      expect(resolvedFull.find((n) => n.id === 'c')!.status).toBe('UNLOCKED');
    });

    it('should handle empty nodes array', () => {
      const resolved = PrerequisiteDAGEngine.resolveNodeStatuses([], new Set());
      expect(resolved).toEqual([]);
    });

    it('should not mutate the original nodes array', () => {
      const nodes = makeNodes();
      const original = JSON.stringify(nodes);
      PrerequisiteDAGEngine.resolveNodeStatuses(nodes, new Set(['bubble-sort']));
      expect(JSON.stringify(nodes)).toBe(original);
    });

    it('should preserve IN_PROGRESS status when prerequisites are met', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'COMPLETED' },
        { id: 'b', title: 'B', prerequisites: ['a'], status: 'IN_PROGRESS' },
      ];
      const completed = new Set(['a']);
      const resolved = PrerequisiteDAGEngine.resolveNodeStatuses(nodes, completed);
      expect(resolved.find((n) => n.id === 'b')!.status).toBe('IN_PROGRESS');
    });
  });

  describe('hasCycle', () => {
    it('should return false for a valid DAG', () => {
      const nodes = makeNodes();
      expect(PrerequisiteDAGEngine.hasCycle(nodes)).toBe(false);
    });

    it('should return true for a graph with a cycle', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: ['c'], status: 'LOCKED' },
        { id: 'b', title: 'B', prerequisites: ['a'], status: 'LOCKED' },
        { id: 'c', title: 'C', prerequisites: ['b'], status: 'LOCKED' },
      ];
      expect(PrerequisiteDAGEngine.hasCycle(nodes)).toBe(true);
    });

    it('should return false for a single node with no prerequisites', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'UNLOCKED' },
      ];
      expect(PrerequisiteDAGEngine.hasCycle(nodes)).toBe(false);
    });

    it('should return false for empty graph', () => {
      expect(PrerequisiteDAGEngine.hasCycle([])).toBe(false);
    });

    it('should return false for disconnected nodes', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'UNLOCKED' },
        { id: 'b', title: 'B', prerequisites: [], status: 'UNLOCKED' },
        { id: 'c', title: 'C', prerequisites: [], status: 'UNLOCKED' },
      ];
      expect(PrerequisiteDAGEngine.hasCycle(nodes)).toBe(false);
    });
  });

  describe('getTopologicalOrder', () => {
    it('should return correct topological order for linear chain', () => {
      const nodes = makeNodes();
      const order = PrerequisiteDAGEngine.getTopologicalOrder(nodes);

      const idxBubble = order.indexOf('bubble-sort');
      const idxQuick = order.indexOf('quicksort');
      const idxTree = order.indexOf('binary-tree');
      const idxSolid = order.indexOf('solid-uml');

      expect(idxBubble).toBeLessThan(idxQuick);
      expect(idxQuick).toBeLessThan(idxTree);
      expect(idxTree).toBeLessThan(idxSolid);
    });

    it('should handle nodes with no prerequisites first', () => {
      const nodes: PathNode[] = [
        { id: 'c', title: 'C', prerequisites: ['a', 'b'], status: 'LOCKED' },
        { id: 'a', title: 'A', prerequisites: [], status: 'UNLOCKED' },
        { id: 'b', title: 'B', prerequisites: [], status: 'UNLOCKED' },
      ];
      const order = PrerequisiteDAGEngine.getTopologicalOrder(nodes);

      expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'));
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'));
    });

    it('should return empty array for empty input', () => {
      expect(PrerequisiteDAGEngine.getTopologicalOrder([])).toEqual([]);
    });

    it('should return all nodes for graph with no edges', () => {
      const nodes: PathNode[] = [
        { id: 'x', title: 'X', prerequisites: [], status: 'UNLOCKED' },
        { id: 'y', title: 'Y', prerequisites: [], status: 'UNLOCKED' },
      ];
      const order = PrerequisiteDAGEngine.getTopologicalOrder(nodes);
      expect(order).toHaveLength(2);
      expect(order).toContain('x');
      expect(order).toContain('y');
    });
  });
});
