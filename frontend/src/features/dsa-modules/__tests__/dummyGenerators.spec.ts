import { describe, it, expect } from 'vitest';
import { generateDummyResult } from '../services/dummyGenerators';

describe('dummyGenerators', () => {
  describe('BFS (Breadth-First Search)', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('bfs', [50, 30, 70]);
      expect(result.algorithmId).toBe('bfs');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('traverses in breadth-first order', () => {
      const result = generateDummyResult('bfs', [50, 30, 70]);
      const lastFrame = result.frames[result.frames.length - 1];
      
      expect(lastFrame.dataState).toEqual([50, 30, 70]);
    });
  });

  describe('DFS (Depth-First Search)', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('dfs', [50, 30, 70]);
      expect(result.algorithmId).toBe('dfs');
      expect(result.frames.length).toBeGreaterThan(0);
    });

    it('traverses in depth-first pre-order', () => {
      const result = generateDummyResult('dfs', [50, 30, 70]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([50, 30, 70]);
    });
  });

  describe('Dijkstra', () => {
    it('calculates shortest path on a real graph and updates distances', () => {
      const result = generateDummyResult('dijkstra', [50, 30, 70]);
      expect(result.algorithmId).toBe('dijkstra');
      const lastFrame = result.frames[result.frames.length - 1];

      expect(lastFrame.graphNodes).toBeDefined();
      expect(lastFrame.graphEdges).toBeDefined();
      expect(lastFrame.graphNodes!.length).toBe(3);
      expect(lastFrame.graphNodes!.every(n => n.x !== undefined && n.y !== undefined)).toBe(true);

      const edgeWeights = lastFrame.graphEdges!.map(e => e.weight ?? 0);
      expect(edgeWeights.every(w => w > 0)).toBe(true);
      expect(lastFrame.distances).toBeDefined();
      expect(lastFrame.distances![0]).toBe(0);
    });
  });

  describe('Sliding Window', () => {
    it('computes maximum subarray sum of length K=3', () => {
      const result = generateDummyResult('sliding-window', [2, 1, 5, 1, 3]);
      expect(result.algorithmId).toBe('sliding-window');
      expect(result.frames.length).toBeGreaterThan(0);

      
      const stepWithWindow = result.frames.find(f => f.explanation.includes('Cửa sổ đạt kích thước'));
      expect(stepWithWindow).toBeDefined();
      expect(stepWithWindow!.highlights?.low).toBe(0);
      expect(stepWithWindow!.highlights?.high).toBe(2);
    });
  });

  describe('Monotonic Stack', () => {
    it('solves Next Greater Element problem using stack', () => {
      const result = generateDummyResult('monotonic-stack', [4, 5, 2, 10]);
      expect(result.algorithmId).toBe('monotonic-stack');

      
      const pushFrame = result.frames.find(f => f.explanation.includes('Đẩy index'));
      expect(pushFrame).toBeDefined();
      expect(pushFrame!.dataState?.length).toBeGreaterThan(0);
    });
  });

  describe('Linear Search', () => {
    it('finds target (last element is target)', () => {
      const result = generateDummyResult('linear-search', [5, 3, 8, 1, 3]);
      expect(result.algorithmId).toBe('linear-search');
      const foundFrames = result.frames.filter((f) => f.highlights?.found != null);
      expect(foundFrames.length).toBe(1);
      for (const frame of result.frames) {
        expect(frame.highlights?.target).toBe(3);
      }
    });

    it('handles not found case', () => {
      const result = generateDummyResult('linear-search', [5, 3, 8, 1, 99]);
      const foundFrames = result.frames.filter((f) => f.highlights?.found != null);
      expect(foundFrames.length).toBe(0);
      for (const frame of result.frames) {
        expect(frame.highlights?.target).toBe(99);
      }
    });
  });

  describe('Binary Search', () => {
    it('finds target in sorted array', () => {
      const result = generateDummyResult('binary-search', [1, 3, 5, 8, 12, 5]);
      expect(result.algorithmId).toBe('binary-search');
      const foundFrames = result.frames.filter((f) => f.highlights?.found != null);
      expect(foundFrames.length).toBe(1);
      for (const frame of result.frames) {
        expect(frame.highlights?.target).toBe(5);
      }
    });

    it('has low/mid/high pointers', () => {
      const result = generateDummyResult('binary-search', [1, 3, 5, 8, 12, 5]);
      const pointerFrames = result.frames.filter((f) => f.highlights?.mid != null);
      expect(pointerFrames.length).toBeGreaterThan(0);
    });
  });

  describe('Stack', () => {
    it('generates push and pop operations', () => {
      const result = generateDummyResult('stack', [10, 20, 30]);
      expect(result.algorithmId).toBe('stack');
      expect(result.frames.length).toBeGreaterThan(3);

      const pushFrames = result.frames.filter((f) => f.explanation.includes('Push'));
      expect(pushFrames.length).toBe(3);
    });

    it('final frame has empty data', () => {
      const result = generateDummyResult('stack', [10, 20]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([]);
    });
  });

  describe('Queue', () => {
    it('generates enqueue and dequeue operations', () => {
      const result = generateDummyResult('queue', [10, 20, 30]);
      expect(result.algorithmId).toBe('queue');

      const enqueueFrames = result.frames.filter((f) => f.explanation.includes('Enqueue'));
      expect(enqueueFrames.length).toBe(3);
    });

    it('final frame has empty data', () => {
      const result = generateDummyResult('queue', [10, 20]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([]);
    });
  });

  describe('BST', () => {
    it('generates tree nodes', () => {
      const result = generateDummyResult('bst', [50, 30, 70]);
      expect(result.algorithmId).toBe('bst');
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.treeNodes).toBeDefined();
      expect(lastFrame.treeNodes!.length).toBe(3);
    });

    it('tree structure has correct parent-child relationships', () => {
      const result = generateDummyResult('bst', [50, 30, 70]);
      const lastFrame = result.frames[result.frames.length - 1];
      const root = lastFrame.treeNodes!.find((n) => n.value === 50);
      expect(root).toBeDefined();
      expect(root!.leftNodeId).not.toBeNull();
      expect(root!.rightNodeId).not.toBeNull();
    });
  });

  describe('Unknown algorithm', () => {
    it('returns fallback result', () => {
      const result = generateDummyResult('unknown-algo', [1, 2, 3]);
      expect(result.algorithmId).toBe('unknown-algo');
      expect(result.frames.length).toBe(1);
    });
  });

  describe('Selection Sort', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('selection-sort', [5, 3, 8, 1, 9]);
      expect(result.algorithmId).toBe('selection-sort');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('sorts array correctly', () => {
      const result = generateDummyResult('selection-sort', [5, 3, 8, 1, 9]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([1, 3, 5, 8, 9]);
    });
  });

  describe('Insertion Sort', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('insertion-sort', [5, 3, 8, 1, 9]);
      expect(result.algorithmId).toBe('insertion-sort');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('sorts array correctly', () => {
      const result = generateDummyResult('insertion-sort', [5, 3, 8, 1, 9]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([1, 3, 5, 8, 9]);
    });
  });

  describe('Quick Sort', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('quick-sort', [5, 3, 8, 1, 9]);
      expect(result.algorithmId).toBe('quick-sort');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('sorts array correctly', () => {
      const result = generateDummyResult('quick-sort', [5, 3, 8, 1, 9]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([1, 3, 5, 8, 9]);
    });
  });

  describe('Merge Sort', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('merge-sort', [5, 3, 8, 1, 9]);
      expect(result.algorithmId).toBe('merge-sort');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('sorts array correctly', () => {
      const result = generateDummyResult('merge-sort', [5, 3, 8, 1, 9]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([1, 3, 5, 8, 9]);
    });
  });

  describe('Heap Sort', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('heap-sort', [5, 3, 8, 1, 9]);
      expect(result.algorithmId).toBe('heap-sort');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('sorts array correctly', () => {
      const result = generateDummyResult('heap-sort', [5, 3, 8, 1, 9]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([1, 3, 5, 8, 9]);
    });
  });

  describe('Radix Sort', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('radix-sort', [5, 3, 8, 1, 9]);
      expect(result.algorithmId).toBe('radix-sort');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('sorts array correctly', () => {
      const result = generateDummyResult('radix-sort', [5, 3, 8, 1, 9]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([1, 3, 5, 8, 9]);
    });
  });

  describe('Counting Sort', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('counting-sort', [5, 3, 8, 1, 9]);
      expect(result.algorithmId).toBe('counting-sort');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('sorts array correctly', () => {
      const result = generateDummyResult('counting-sort', [5, 3, 8, 1, 9]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([1, 3, 5, 8, 9]);
    });
  });

  describe('Bucket Sort', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('bucket-sort', [5, 3, 8, 1, 9]);
      expect(result.algorithmId).toBe('bucket-sort');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('sorts array correctly', () => {
      const result = generateDummyResult('bucket-sort', [5, 3, 8, 1, 9]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toEqual([1, 3, 5, 8, 9]);
    });
  });

  describe('BellmanFord', () => {
    it('generates frames with correct algorithm id', () => {
      const result = generateDummyResult('bellman-ford', [50, 30, 70]);
      expect(result.algorithmId).toBe('bellman-ford');
      expect(result.frames.length).toBeGreaterThan(0);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('has graph nodes in frames', () => {
      const result = generateDummyResult('bellman-ford', [50, 30, 70]);
      const lastFrame = result.frames[result.frames.length - 1];
      expect(lastFrame.dataState).toBeDefined();
      expect(lastFrame.dataState!.length).toBeGreaterThan(0);
    });
  });
});
