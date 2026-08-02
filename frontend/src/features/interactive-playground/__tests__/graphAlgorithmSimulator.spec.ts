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
});
