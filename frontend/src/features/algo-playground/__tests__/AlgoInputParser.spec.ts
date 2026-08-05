import { describe, it, expect } from 'vitest';
import { AlgoInputParser } from '../engine/AlgoInputParser';

describe('AlgoInputParser.parseNumberArray', () => {
  it('parses comma-separated numbers', () => {
    expect(AlgoInputParser.parseNumberArray('5, 3, 8, 4, 2')).toEqual([5, 3, 8, 4, 2]);
  });

  it('parses semicolon and whitespace separators', () => {
    expect(AlgoInputParser.parseNumberArray('1;2;3')).toEqual([1, 2, 3]);
    expect(AlgoInputParser.parseNumberArray('1 2 3')).toEqual([1, 2, 3]);
    expect(AlgoInputParser.parseNumberArray('1\t2\n3')).toEqual([1, 2, 3]);
  });

  it('returns an empty array for blank input', () => {
    expect(AlgoInputParser.parseNumberArray('')).toEqual([]);
    expect(AlgoInputParser.parseNumberArray('   , ; ')).toEqual([]);
  });

  it('throws a clear error for non-numeric parts', () => {
    expect(() => AlgoInputParser.parseNumberArray('1, abc, 3')).toThrow(/không phải là số hợp lệ/);
    expect(() => AlgoInputParser.parseNumberArray('1, 2,,, xyz')).toThrow(/không phải là số hợp lệ/);
  });

  it('rejects arrays longer than the safe limit', () => {
    const longInput = Array.from({ length: 101 }, (_, i) => i).join(', ');
    expect(() => AlgoInputParser.parseNumberArray(longInput)).toThrow(/tối đa 100 phần tử/);
    const okInput = Array.from({ length: 100 }, (_, i) => i).join(', ');
    expect(AlgoInputParser.parseNumberArray(okInput)).toHaveLength(100);
  });

  it('supports decimal values', () => {
    expect(AlgoInputParser.parseNumberArray('0.78, 0.17, 0.39')).toEqual([0.78, 0.17, 0.39]);
  });
});

describe('AlgoInputParser.buildTreeFromArray', () => {
  it('builds a BST with left < root <= right', () => {
    const nodes = AlgoInputParser.buildTreeFromArray([8, 3, 10, 1, 6]);
    expect(nodes).toHaveLength(5);
    const root = nodes[0];
    expect(root.value).toBe(8);
    expect(root.leftId).toBe('3');
    expect(root.rightId).toBe('10');
    const left = nodes.find(n => n.id === '3');
    expect(left?.leftId).toBe('1');
    expect(left?.rightId).toBe('6');
  });

  it('keeps duplicate values on the right subtree', () => {
    const nodes = AlgoInputParser.buildTreeFromArray([5, 5, 3]);
    const root = nodes[0];
    expect(root.value).toBe(5);
    expect(root.rightId).toBe('5_2');
    expect(root.leftId).toBe('3');
  });

  it('returns a default tree for empty input', () => {
    const nodes = AlgoInputParser.buildTreeFromArray([]);
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('every non-root node references an existing parent link', () => {
    const nodes = AlgoInputParser.buildTreeFromArray([8, 3, 10, 1, 6, 14, 4, 7, 13]);
    const ids = new Set(nodes.map(n => n.id));
    for (const node of nodes) {
      if (node.leftId !== null) expect(ids.has(node.leftId)).toBe(true);
      if (node.rightId !== null) expect(ids.has(node.rightId)).toBe(true);
    }
  });
});

describe('AlgoInputParser.buildGraphFromText', () => {
  it('parses weighted undirected edges and dedupes nodes', () => {
    const { graphNodes, graphEdges } = AlgoInputParser.buildGraphFromText('A-B:4, A-C:2, B-C:1');
    expect(graphEdges).toEqual([
      { from: 'A', to: 'B', weight: 4, directed: false },
      { from: 'A', to: 'C', weight: 2, directed: false },
      { from: 'B', to: 'C', weight: 1, directed: false },
    ]);
    expect(graphNodes.map(n => n.id)).toEqual(['A', 'B', 'C']);
  });

  it('parses directed edges with > without weight', () => {
    const { graphEdges } = AlgoInputParser.buildGraphFromText('A>B, B>C');
    expect(graphEdges[0]).toEqual({ from: 'A', to: 'B', weight: undefined, directed: true });
    expect(graphEdges[1].directed).toBe(true);
  });

  it('normalizes node positions within the [0, 1] unit square', () => {
    const { graphNodes } = AlgoInputParser.buildGraphFromText('A-B:1, A-C:2, B-D:3, C-D:4');
    expect(graphNodes).toHaveLength(4);
    for (const node of graphNodes) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(1);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(1);
    }
  });

  it('falls back to a default graph when input is empty', () => {
    const { graphNodes, graphEdges } = AlgoInputParser.buildGraphFromText('');
    expect(graphNodes.length).toBeGreaterThanOrEqual(4);
    expect(graphEdges.length).toBeGreaterThan(0);
  });

  it('throws a clear error for malformed edges', () => {
    expect(() => AlgoInputParser.buildGraphFromText('garbage, A-B:2, bad==input')).toThrow(/Định dạng cạnh/);
  });

  it('supports decimal and negative weights', () => {
    const { graphEdges } = AlgoInputParser.buildGraphFromText('A-B:1.5, B>C:-2');
    expect(graphEdges[0]?.weight).toBe(1.5);
    expect(graphEdges[1]?.weight).toBe(-2);
    expect(graphEdges[1]?.directed).toBe(true);
  });
});

describe('AlgoInputParser.parse', () => {
  it('routes array input', () => {
    expect(AlgoInputParser.parse('1, 2, 3', 'array')).toEqual({ array: [1, 2, 3] });
  });

  it('routes tree input into a BST node list', () => {
    const { treeNodes } = AlgoInputParser.parse('5, 3, 8', 'tree');
    expect(treeNodes).toHaveLength(3);
    expect(treeNodes?.[0].value).toBe(5);
  });

  it('routes graph input into nodes and edges', () => {
    const { graphNodes, graphEdges } = AlgoInputParser.parse('A-B:1', 'graph');
    expect(graphNodes).toHaveLength(2);
    expect(graphEdges).toHaveLength(1);
  });
});
