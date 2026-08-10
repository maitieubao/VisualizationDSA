import { describe, it, expect } from 'vitest';
import { GraphAlgorithmSimulator } from '../services/GraphAlgorithmSimulator';
import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

describe('GraphAlgorithmSimulator', () => {
  const mockNodes: NodeDTO[] = [
    { id: 'node_A', label: 'A', x: 100, y: 100, radius: 20 },
    { id: 'node_B', label: 'B', x: 200, y: 100, radius: 20 },
    { id: 'node_C', label: 'C', x: 300, y: 100, radius: 20 },
  ];

  const mockEdges: EdgeDTO[] = [
    { id: 'edge_1', from: 'node_A', to: 'node_B', weight: 5 },
    { id: 'edge_2', from: 'node_B', to: 'node_C', weight: 10 },
  ];

  it('runs BFS simulation correctly', () => {
    const result = GraphAlgorithmSimulator.simulate('BFS', mockNodes, mockEdges, 'node_A');
    expect(result.algorithmId).toBe('bfs');
    expect(result.pseudoCode.length).toBeGreaterThan(0);
    
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).toContain('node_A');
    expect(finalFrame.visitedNodes).toContain('node_B');
    expect(finalFrame.visitedNodes).toContain('node_C');
    expect(finalFrame.visitedEdges).toContain('edge_1');
    expect(finalFrame.visitedEdges).toContain('edge_2');
  });

  it('runs DFS simulation correctly', () => {
    const result = GraphAlgorithmSimulator.simulate('DFS', mockNodes, mockEdges, 'node_A');
    expect(result.algorithmId).toBe('dfs');
    
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).toContain('node_A');
    expect(finalFrame.visitedNodes).toContain('node_B');
    expect(finalFrame.visitedNodes).toContain('node_C');
  });

  it('runs Dijkstra simulation correctly with shortest paths', () => {
    const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', mockNodes, mockEdges, 'node_A');
    expect(result.algorithmId).toBe('dijkstra');
    
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.distances).toBeDefined();
    expect(finalFrame.distances?.['node_A']).toBe(0);
    expect(finalFrame.distances?.['node_B']).toBe(5);
    expect(finalFrame.distances?.['node_C']).toBe(15);
  });

  it('BFS traverses undirected edges in both directions from the middle node', () => {
    // Cạnh chỉ được lưu 1 chiều (A→B, B→C) nhưng đồ thị là vô hướng,
    // nên BFS bắt đầu từ B phải tới được cả A và C.
    const result = GraphAlgorithmSimulator.simulate('BFS', mockNodes, mockEdges, 'node_B');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).toContain('node_A');
    expect(finalFrame.visitedNodes).toContain('node_C');
  });

  it('DFS traverses undirected edges in both directions from the middle node', () => {
    const result = GraphAlgorithmSimulator.simulate('DFS', mockNodes, mockEdges, 'node_B');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).toContain('node_A');
    expect(finalFrame.visitedNodes).toContain('node_C');
  });

  it('Dijkstra traverses undirected edges in both directions from the middle node', () => {
    const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', mockNodes, mockEdges, 'node_B');
    const finalFrame = result.frames[result.frames.length - 1];
    // Với đồ thị vô hướng, từ B phải tính được khoảng cách tới A (5) và C (10).
    expect(finalFrame.distances?.['node_A']).toBe(5);
    expect(finalFrame.distances?.['node_C']).toBe(10);
  });
});

describe('GraphAlgorithmSimulator — Directed graph (IP-036)', () => {
  const oneWayEdges: EdgeDTO[] = [
    { id: 'edge_1', from: 'node_A', to: 'node_B', weight: 5 },
  ];

  const mockNodes: NodeDTO[] = [
    { id: 'node_A', label: 'A', x: 100, y: 100, radius: 20 },
    { id: 'node_B', label: 'B', x: 200, y: 100, radius: 20 },
    { id: 'node_C', label: 'C', x: 300, y: 100, radius: 20 },
  ];

  it('BFS directed: chỉ đi theo hướng from→to (A tới được B)', () => {
    const result = GraphAlgorithmSimulator.simulate('BFS', mockNodes, oneWayEdges, 'node_A', 'directed');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).toContain('node_A');
    expect(finalFrame.visitedNodes).toContain('node_B');
    expect(finalFrame.visitedEdges).toContain('edge_1');
  });

  it('BFS directed: không đi ngược mũi tên (từ B không tới được A)', () => {
    const result = GraphAlgorithmSimulator.simulate('BFS', mockNodes, oneWayEdges, 'node_B', 'directed');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).toContain('node_B');
    expect(finalFrame.visitedNodes).not.toContain('node_A');
  });

  it('DFS directed: không đi ngược mũi tên', () => {
    const result = GraphAlgorithmSimulator.simulate('DFS', mockNodes, oneWayEdges, 'node_B', 'directed');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).not.toContain('node_A');
  });

  it('Dijkstra directed: dist của đỉnh ngược hướng = Infinity', () => {
    const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', mockNodes, oneWayEdges, 'node_B', 'directed');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.distances?.['node_B']).toBe(0);
    expect(finalFrame.distances?.['node_A']).toBe(Infinity);
  });

  it('directed với 2 cạnh ngược chiều A→B + B→A duyệt được cả 2 hướng', () => {
    const bothWays: EdgeDTO[] = [
      { id: 'e1', from: 'node_A', to: 'node_B', weight: 3 },
      { id: 'e2', from: 'node_B', to: 'node_A', weight: 4 },
    ];
    const result = GraphAlgorithmSimulator.simulate('BFS', mockNodes, bothWays, 'node_B', 'directed');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).toContain('node_A');
    expect(finalFrame.visitedNodes).toContain('node_B');
  });

  it('Dijkstra directed dùng đúng trọng số theo chiều mũi tên', () => {
    const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', mockNodes, oneWayEdges, 'node_A', 'directed');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.distances?.['node_B']).toBe(5);
  });
});

describe('GraphAlgorithmSimulator — Edge cases (#9)', () => {
  const singleNode: NodeDTO[] = [
    { id: 'node_A', label: 'A', x: 100, y: 100, radius: 20 },
  ];

  const twoNodes: NodeDTO[] = [
    { id: 'node_A', label: 'A', x: 100, y: 100, radius: 20 },
    { id: 'node_B', label: 'B', x: 200, y: 100, radius: 20 },
  ];

  it('đồ thị rỗng: trả frame cảnh báo, không crash', () => {
    const result = GraphAlgorithmSimulator.simulate('BFS', [], [], null, 'undirected');
    expect(result.frames).toHaveLength(1);
    expect(result.frames[0].explanation).toContain('rỗng');
    expect(result.frames[0].visitedNodes).toEqual([]);
  });

  it('single node không cạnh: mọi thuật toán chỉ thăm đỉnh duy nhất', () => {
    for (const algo of ['BFS', 'DFS', 'DIJKSTRA'] as const) {
      const result = GraphAlgorithmSimulator.simulate(algo, singleNode, [], 'node_A', 'undirected');
      const finalFrame = result.frames[result.frames.length - 1];
      expect(finalFrame.visitedNodes).toEqual(['node_A']);
    }
  });

  it('source không tồn tại → fallback về nodes[0]', () => {
    const result = GraphAlgorithmSimulator.simulate('BFS', twoNodes, [], 'ghost_id', 'undirected');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).toContain('node_A');
  });

  it('source null → dùng nodes[0]', () => {
    const result = GraphAlgorithmSimulator.simulate('BFS', twoNodes, [], null, 'undirected');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).toContain('node_A');
  });

  it('đồ thị không liên thông: frame cuối cảnh báo đỉnh không đến được (IP-019)', () => {
    const nodes: NodeDTO[] = [
      { id: 'node_A', label: 'A', x: 100, y: 100, radius: 20 },
      { id: 'node_B', label: 'B', x: 200, y: 100, radius: 20 },
      { id: 'node_C', label: 'C', x: 300, y: 100, radius: 20 },
    ];
    const edges: EdgeDTO[] = [{ id: 'e1', from: 'node_A', to: 'node_B', weight: 1 }];
    const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'node_A', 'undirected');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.visitedNodes).not.toContain('node_C');
    expect(finalFrame.explanation).toContain('không đến được');
  });

  it('Dijkstra trọng số âm: simulator tính theo dữ liệu đầu vào (validation thuộc parser/store — IP-003)', () => {
    const negEdges: EdgeDTO[] = [{ id: 'e1', from: 'node_A', to: 'node_B', weight: -5 }];
    const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', twoNodes, negEdges, 'node_A', 'undirected');
    const finalFrame = result.frames[result.frames.length - 1];
    expect(finalFrame.distances?.['node_B']).toBe(-5);
  });
});
