import { describe, it, expect } from 'vitest';
import {
  ForceDirectedLayout,
  type GraphNode,
  type GraphEdge
} from '../engine/ForceDirectedLayout';

describe('Sprint 5 - ForceDirectedLayout Physics Engine', () => {
  it('Should compute Coulomb repulsion pushing nodes apart', () => {
    const layout = new ForceDirectedLayout({
      kRepulsion: 400,
      kAttraction: 0,
      damping: 1.0 // No damping for predictable test
    });

    // Two nodes close together
    const nodes: GraphNode[] = [
      { id: 'A', x: 100, y: 100, fx: 0, fy: 0 },
      { id: 'B', x: 110, y: 100, fx: 0, fy: 0 } // 10px apart horizontally
    ];
    const edges: GraphEdge[] = [];

    layout.computePhysicsStep(nodes, edges);

    // Both nodes should have repulsion forces (fx should be non-zero)
    expect(nodes[0].fx).not.toBe(0);
    expect(nodes[1].fx).not.toBe(0);
    
    // Node A should be pushed left (negative fx), Node B pushed right (positive fx)
    expect(nodes[0].fx).toBeLessThan(0);
    expect(nodes[1].fx).toBeGreaterThan(0);
  });

  it('Should compute Hooke attraction pulling connected nodes together', () => {
    const layout = new ForceDirectedLayout({
      kRepulsion: 0, // No repulsion for this test
      kAttraction: 0.1,
      idealLength: 100,
      damping: 1.0
    });

    // Two nodes far apart with an edge between them
    const nodes: GraphNode[] = [
      { id: 'A', x: 100, y: 100, fx: 0, fy: 0 },
      { id: 'B', x: 300, y: 100, fx: 0, fy: 0 } // 200px apart, ideal is 100px
    ];
    const edges: GraphEdge[] = [{ sourceId: 'A', targetId: 'B' }];

    layout.computePhysicsStep(nodes, edges);

    // Both nodes should have attraction forces
    expect(nodes[0].fx).not.toBe(0);
    expect(nodes[1].fx).not.toBe(0);
    
    // Node A should be pulled right (positive fx), Node B pulled left (negative fx)
    expect(nodes[0].fx).toBeGreaterThan(0);
    expect(nodes[1].fx).toBeLessThan(0);
  });

  it('Should reach stable equilibrium after multiple iterations', () => {
    const layout = new ForceDirectedLayout({
      kRepulsion: 500,
      kAttraction: 0.05,
      idealLength: 100,
      damping: 0.85
    });

    // Triangle graph
    const nodes: GraphNode[] = [
      { id: 'A', x: 100, y: 100, fx: 0, fy: 0 },
      { id: 'B', x: 200, y: 100, fx: 0, fy: 0 },
      { id: 'C', x: 150, y: 200, fx: 0, fy: 0 }
    ];
    const edges: GraphEdge[] = [
      { sourceId: 'A', targetId: 'B' },
      { sourceId: 'B', targetId: 'C' },
      { sourceId: 'C', targetId: 'A' }
    ];

    // Run convergence
    layout.convergeLayout(nodes, edges, 200);

    // Check stability
    expect(layout.isStable(nodes, 1.0)).toBe(true);
    
    // Nodes should have moved from initial positions
    expect(nodes[0].x).not.toBe(100);
    expect(nodes[0].y).not.toBe(100);
  });

  it('Should respect custom parameters', () => {
    const customLayout = new ForceDirectedLayout({
      kRepulsion: 1000,
      kAttraction: 0.2,
      idealLength: 200,
      damping: 0.9
    });

    const nodes: GraphNode[] = [
      { id: 'A', x: 100, y: 100, fx: 0, fy: 0 },
      { id: 'B', x: 120, y: 100, fx: 0, fy: 0 }
    ];
    const edges: GraphEdge[] = [];

    customLayout.computePhysicsStep(nodes, edges);

    // With higher kRepulsion, forces should be stronger
    const strongRepulsion = Math.abs(nodes[0].fx!);
    
    // Compare with default settings
    const defaultLayout = new ForceDirectedLayout();
    const nodes2: GraphNode[] = [
      { id: 'A', x: 100, y: 100, fx: 0, fy: 0 },
      { id: 'B', x: 120, y: 100, fx: 0, fy: 0 }
    ];
    
    defaultLayout.computePhysicsStep(nodes2, edges);
    const weakRepulsion = Math.abs(nodes2[0].fx!);
    
    expect(strongRepulsion).toBeGreaterThan(weakRepulsion);
  });

  it('Should handle weight factor in edge attraction', () => {
    const layout = new ForceDirectedLayout({
      kRepulsion: 0,
      kAttraction: 0.1,
      idealLength: 100,
      damping: 1.0
    });

    // Two pairs of nodes with different edge weights
    const nodes: GraphNode[] = [
      { id: 'A', x: 100, y: 100, fx: 0, fy: 0 },
      { id: 'B', x: 300, y: 100, fx: 0, fy: 0 }, // Light edge
      { id: 'C', x: 100, y: 300, fx: 0, fy: 0 },
      { id: 'D', x: 300, y: 300, fx: 0, fy: 0 }  // Heavy edge
    ];
    const edges: GraphEdge[] = [
      { sourceId: 'A', targetId: 'B', weight: 10 },  // Light
      { sourceId: 'C', targetId: 'D', weight: 100 } // Heavy
    ];

    layout.computePhysicsStep(nodes, edges);

    // Heavier edge should create stronger attraction force
    const lightAttraction = Math.abs(nodes[0].fx!);
    const heavyAttraction = Math.abs(nodes[2].fx!);
    
    expect(heavyAttraction).toBeGreaterThan(lightAttraction);
  });

  it('Should update node positions correctly after physics step', () => {
    const layout = new ForceDirectedLayout({
      kRepulsion: 400,
      kAttraction: 0.06,
      idealLength: 120,
      damping: 0.5 // Lower damping for more visible movement
    });

    const nodes: GraphNode[] = [
      { id: 'A', x: 100, y: 100, fx: 0, fy: 0 },
      { id: 'B', x: 105, y: 100, fx: 0, fy: 0 } // Very close
    ];
    const edges: GraphEdge[] = [];

    const initialX = nodes[0].x;
    layout.computePhysicsStep(nodes, edges);

    // Position should have changed based on force
    expect(nodes[0].x).not.toBe(initialX);
    expect(nodes[0].fx).toBeDefined();
    expect(nodes[0].fy).toBeDefined();
  });
});

describe('Sprint 5 - CustomInputParser Graph Features', () => {
  it('Should parse adjacency list text format correctly', async () => {
    const { CustomInputParser } = await import('../engine/CustomInputParser');
    
    const input = 'A-B:10, B-C:20, A-C:50';
    const graph = CustomInputParser.parseAdjacencyList(input);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.nodes.map(n => n.id).sort()).toEqual(['A', 'B', 'C']);
    
    expect(graph.edges).toHaveLength(3);
    expect(graph.edges[0]).toMatchObject({ sourceId: 'A', targetId: 'B', weight: 10 });
    expect(graph.edges[1]).toMatchObject({ sourceId: 'B', targetId: 'C', weight: 20 });
    expect(graph.edges[2]).toMatchObject({ sourceId: 'A', targetId: 'C', weight: 50 });
  });

  it('Should throw error for invalid edge format', async () => {
    const { CustomInputParser } = await import('../engine/CustomInputParser');
    
    expect(() => {
      CustomInputParser.parseAdjacencyList('A-B-10'); // Wrong format
    }).toThrow();
    
    expect(() => {
      CustomInputParser.parseAdjacencyList('invalid');
    }).toThrow();
  });

  it('Should handle empty input gracefully', async () => {
    const { CustomInputParser } = await import('../engine/CustomInputParser');
    
    const graph = CustomInputParser.parseAdjacencyList('');
    
    expect(graph.nodes).toHaveLength(0);
    expect(graph.edges).toHaveLength(0);
  });
});
