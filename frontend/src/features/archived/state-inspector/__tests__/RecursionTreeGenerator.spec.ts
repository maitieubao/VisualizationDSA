import { describe, it, expect } from 'vitest';
import { RecursionTreeGenerator } from '../engine/RecursionTreeGenerator';
import type { RecursionNode } from '../types/state-inspector.types';
import { TREE_DEPTH_SPACING_PX, TREE_ROOT_OFFSET_PX } from '../types/state-inspector.types';

function createLeaf(id: string, label: string, depth: number, status: 'ACTIVE' | 'RESOLVED' | 'PENDING' = 'RESOLVED'): RecursionNode {
  return { nodeId: id, label, depth, status, children: [] };
}

describe('RecursionTreeGenerator — Layered Coordinate Calculator', () => {
  it('should calculate coordinates for single root node', () => {
    const root: RecursionNode = createLeaf('root', 'fib(1)', 0);
    const coords = RecursionTreeGenerator.calculateCoordinates(root, 800);

    expect(coords.length).toBe(1);
    expect(coords[0].nodeId).toBe('root');
    expect(coords[0].x).toBe(400); // center of 800
    expect(coords[0].y).toBe(TREE_ROOT_OFFSET_PX); // depth 0 * 80 + 40
    expect(coords[0].parentId).toBeNull();
  });

  it('should distribute binary tree children on Y = depth * 80 + 40', () => {
    const root: RecursionNode = {
      nodeId: 'root',
      label: 'fib(2)',
      depth: 0,
      status: 'RESOLVED',
      children: [
        createLeaf('left', 'fib(1)', 1),
        createLeaf('right', 'fib(0)', 1),
      ],
    };

    const coords = RecursionTreeGenerator.calculateCoordinates(root, 800);
    expect(coords.length).toBe(3);

    // Root at center, depth 0
    expect(coords[0].x).toBe(400);
    expect(coords[0].y).toBe(TREE_ROOT_OFFSET_PX);

    // Children at depth 1
    expect(coords[1].y).toBe(1 * TREE_DEPTH_SPACING_PX + TREE_ROOT_OFFSET_PX);
    expect(coords[2].y).toBe(1 * TREE_DEPTH_SPACING_PX + TREE_ROOT_OFFSET_PX);

    // Left child to the left of center, right child to the right
    expect(coords[1].x).toBeLessThan(400);
    expect(coords[2].x).toBeGreaterThan(400);
  });

  it('should set parentId correctly for child nodes', () => {
    const root: RecursionNode = {
      nodeId: 'r',
      label: 'fib(3)',
      depth: 0,
      status: 'ACTIVE',
      children: [
        {
          nodeId: 'c1',
          label: 'fib(2)',
          depth: 1,
          status: 'ACTIVE',
          children: [
            createLeaf('c1a', 'fib(1)', 2),
            createLeaf('c1b', 'fib(0)', 2),
          ],
        },
        createLeaf('c2', 'fib(1)', 1),
      ],
    };

    const coords = RecursionTreeGenerator.calculateCoordinates(root, 600);
    expect(coords[0].parentId).toBeNull(); // root
    expect(coords[1].parentId).toBe('r'); // c1
    expect(coords[2].parentId).toBe('c1'); // c1a
    expect(coords[3].parentId).toBe('c1'); // c1b
    expect(coords[4].parentId).toBe('r'); // c2
  });

  it('should preserve status in coordinate output', () => {
    const root: RecursionNode = {
      nodeId: 'r',
      label: 'fib(2)',
      depth: 0,
      status: 'ACTIVE',
      children: [
        createLeaf('c1', 'fib(1)', 1, 'RESOLVED'),
        createLeaf('c2', 'fib(0)', 1, 'PENDING'),
      ],
    };

    const coords = RecursionTreeGenerator.calculateCoordinates(root, 800);
    expect(coords[0].status).toBe('ACTIVE');
    expect(coords[1].status).toBe('RESOLVED');
    expect(coords[2].status).toBe('PENDING');
  });

  it('should preserve returnValue in coordinate output', () => {
    const root: RecursionNode = {
      nodeId: 'r',
      label: 'fib(2)',
      depth: 0,
      status: 'RESOLVED',
      returnValue: 1,
      children: [
        { ...createLeaf('c1', 'fib(1)', 1), returnValue: 1 },
        { ...createLeaf('c2', 'fib(0)', 1), returnValue: 0 },
      ],
    };

    const coords = RecursionTreeGenerator.calculateCoordinates(root, 800);
    expect(coords[0].returnValue).toBe(1);
    expect(coords[1].returnValue).toBe(1);
    expect(coords[2].returnValue).toBe(0);
  });

  it('should handle single-child node (non-binary)', () => {
    const root: RecursionNode = {
      nodeId: 'r',
      label: 'fact(3)',
      depth: 0,
      status: 'ACTIVE',
      children: [
        {
          nodeId: 'c1',
          label: 'fact(2)',
          depth: 1,
          status: 'ACTIVE',
          children: [createLeaf('c2', 'fact(1)', 2)],
        },
      ],
    };

    const coords = RecursionTreeGenerator.calculateCoordinates(root, 600);
    expect(coords.length).toBe(3);
    // Single child should be centered under parent
    expect(coords[1].parentId).toBe('r');
    expect(coords[2].parentId).toBe('c1');
  });

  it('should handle 3-child node (ternary tree)', () => {
    const root: RecursionNode = {
      nodeId: 'r',
      label: 'solve()',
      depth: 0,
      status: 'ACTIVE',
      children: [
        createLeaf('c1', 'a()', 1),
        createLeaf('c2', 'b()', 1),
        createLeaf('c3', 'c()', 1),
      ],
    };

    const coords = RecursionTreeGenerator.calculateCoordinates(root, 900);
    expect(coords.length).toBe(4);
    // Children should be ordered left to right
    expect(coords[1].x).toBeLessThan(coords[2].x);
    expect(coords[2].x).toBeLessThan(coords[3].x);
  });

  it('should handle canvasWidth 0 gracefully', () => {
    const root = createLeaf('r', 'f()', 0);
    const coords = RecursionTreeGenerator.calculateCoordinates(root, 0);
    expect(coords.length).toBe(1);
    expect(coords[0].x).toBe(0);
  });

  it('should handle deep tree (depth 4)', () => {
    const root: RecursionNode = {
      nodeId: 'd0',
      label: 'f(4)',
      depth: 0,
      status: 'ACTIVE',
      children: [
        {
          nodeId: 'd1',
          label: 'f(3)',
          depth: 1,
          status: 'ACTIVE',
          children: [
            {
              nodeId: 'd2',
              label: 'f(2)',
              depth: 2,
              status: 'ACTIVE',
              children: [
                {
                  nodeId: 'd3',
                  label: 'f(1)',
                  depth: 3,
                  status: 'ACTIVE',
                  children: [createLeaf('d4', 'f(0)', 4)],
                },
              ],
            },
          ],
        },
      ],
    };

    const coords = RecursionTreeGenerator.calculateCoordinates(root, 800);
    expect(coords.length).toBe(5);
    expect(coords[4].y).toBe(4 * TREE_DEPTH_SPACING_PX + TREE_ROOT_OFFSET_PX);
  });

  it('should preserve label text in coordinates', () => {
    const root = createLeaf('r', 'fibonacci(10)', 0);
    const coords = RecursionTreeGenerator.calculateCoordinates(root, 600);
    expect(coords[0].label).toBe('fibonacci(10)');
  });

  // ---- countNodes ----

  it('should count 1 node for leaf', () => {
    expect(RecursionTreeGenerator.countNodes(createLeaf('r', 'f()', 0))).toBe(1);
  });

  it('should count nodes for binary tree', () => {
    const root: RecursionNode = {
      nodeId: 'r',
      label: 'fib(2)',
      depth: 0,
      status: 'RESOLVED',
      children: [
        createLeaf('c1', 'fib(1)', 1),
        createLeaf('c2', 'fib(0)', 1),
      ],
    };
    expect(RecursionTreeGenerator.countNodes(root)).toBe(3);
  });

  it('should count nodes for deeper tree', () => {
    const root: RecursionNode = {
      nodeId: 'r',
      label: 'fib(3)',
      depth: 0,
      status: 'ACTIVE',
      children: [
        {
          nodeId: 'c1',
          label: 'fib(2)',
          depth: 1,
          status: 'ACTIVE',
          children: [
            createLeaf('c1a', 'fib(1)', 2),
            createLeaf('c1b', 'fib(0)', 2),
          ],
        },
        createLeaf('c2', 'fib(1)', 1),
      ],
    };
    expect(RecursionTreeGenerator.countNodes(root)).toBe(5);
  });

  // ---- getMaxDepth ----

  it('should return depth 0 for single node', () => {
    expect(RecursionTreeGenerator.getMaxDepth(createLeaf('r', 'f()', 0))).toBe(0);
  });

  it('should return max depth for binary tree', () => {
    const root: RecursionNode = {
      nodeId: 'r',
      label: 'fib(2)',
      depth: 0,
      status: 'RESOLVED',
      children: [
        createLeaf('c1', 'fib(1)', 1),
        createLeaf('c2', 'fib(0)', 1),
      ],
    };
    expect(RecursionTreeGenerator.getMaxDepth(root)).toBe(1);
  });

  it('should return max depth for unbalanced tree', () => {
    const root: RecursionNode = {
      nodeId: 'r',
      label: 'f(3)',
      depth: 0,
      status: 'ACTIVE',
      children: [
        {
          nodeId: 'c1',
          label: 'f(2)',
          depth: 1,
          status: 'ACTIVE',
          children: [createLeaf('c1a', 'f(1)', 2)],
        },
        createLeaf('c2', 'f(0)', 1),
      ],
    };
    expect(RecursionTreeGenerator.getMaxDepth(root)).toBe(2);
  });
});
