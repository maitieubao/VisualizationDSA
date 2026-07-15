import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { GraphGeometryEngine } from '../engine/GraphGeometryEngine';
import { ForceDirectedEngine } from '../engine/ForceDirectedEngine';
import { GraphParser } from '../services/GraphParser';
import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

// =========================================
// 1. usePlaygroundStore Tests
// =========================================
describe('usePlaygroundStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with SELECT mode and empty arrays', () => {
    const store = usePlaygroundStore();
    expect(store.mode).toBe('SELECT');
    expect(store.nodes).toHaveLength(0);
    expect(store.edges).toHaveLength(0);
    expect(store.selectedNodeId).toBeNull();
    expect(store.selectedEdgeId).toBeNull();
  });

  it('adds node with auto-incrementing label A, B, C...', () => {
    const store = usePlaygroundStore();
    store.addNode(100, 200);
    store.addNode(300, 400);
    store.addNode(500, 100);

    expect(store.nodes).toHaveLength(3);
    expect(store.nodes[0].label).toBe('A');
    expect(store.nodes[1].label).toBe('B');
    expect(store.nodes[2].label).toBe('C');
    expect(store.nodes[0].radius).toBe(20);
  });

  it('enforces max 30 nodes limit', () => {
    const store = usePlaygroundStore();
    for (let i = 0; i < 30; i++) {
      const result = store.addNode(i * 10, i * 10);
      expect(result).not.toBeNull();
    }
    expect(store.canAddNode).toBe(false);
    const overflow = store.addNode(999, 999);
    expect(overflow).toBeNull();
    expect(store.nodes).toHaveLength(30);
  });

  it('adds edge between two nodes', () => {
    const store = usePlaygroundStore();
    const a = store.addNode(100, 100)!;
    const b = store.addNode(200, 200)!;
    const edge = store.addEdge(a.id, b.id);

    expect(edge).not.toBeNull();
    expect(store.edges).toHaveLength(1);
    expect(edge!.weight).toBe(1);
  });

  it('prevents self-loops', () => {
    const store = usePlaygroundStore();
    const a = store.addNode(100, 100)!;
    const edge = store.addEdge(a.id, a.id);
    expect(edge).toBeNull();
    expect(store.edges).toHaveLength(0);
  });

  it('prevents duplicate edges', () => {
    const store = usePlaygroundStore();
    const a = store.addNode(100, 100)!;
    const b = store.addNode(200, 200)!;
    store.addEdge(a.id, b.id);
    const dup = store.addEdge(a.id, b.id);
    expect(dup).toBeNull();
    expect(store.edges).toHaveLength(1);

    // Reverse direction also blocked (undirected)
    const rev = store.addEdge(b.id, a.id);
    expect(rev).toBeNull();
    expect(store.edges).toHaveLength(1);
  });

  it('updates edge weight within valid range', () => {
    const store = usePlaygroundStore();
    const a = store.addNode(100, 100)!;
    const b = store.addNode(200, 200)!;
    const edge = store.addEdge(a.id, b.id)!;

    store.updateEdgeWeight(edge.id, 42);
    expect(store.edges[0].weight).toBe(42);

    store.updateEdgeWeight(edge.id, 0);
    expect(store.edges[0].weight).toBe(42); // unchanged

    store.updateEdgeWeight(edge.id, 1000);
    expect(store.edges[0].weight).toBe(42); // unchanged (>999)
  });

  it('cascade deletes edges when node is removed', () => {
    const store = usePlaygroundStore();
    const a = store.addNode(100, 100)!;
    const b = store.addNode(200, 200)!;
    const c = store.addNode(300, 300)!;
    store.addEdge(a.id, b.id);
    store.addEdge(a.id, c.id);
    store.addEdge(b.id, c.id);

    expect(store.edges).toHaveLength(3);
    store.deleteNode(a.id);
    expect(store.nodes).toHaveLength(2);
    expect(store.edges).toHaveLength(1); // only B-C remains
    expect(store.edges[0].from).toBe(b.id);
    expect(store.edges[0].to).toBe(c.id);
  });

  it('clears all nodes and edges', () => {
    const store = usePlaygroundStore();
    store.addNode(100, 100);
    store.addNode(200, 200);
    store.clearAll();
    expect(store.nodes).toHaveLength(0);
    expect(store.edges).toHaveLength(0);
  });

  it('switches mode and clears selection', () => {
    const store = usePlaygroundStore();
    const a = store.addNode(100, 100)!;
    store.selectNode(a.id);
    expect(store.selectedNodeId).toBe(a.id);

    store.setMode('ADD_NODE');
    expect(store.mode).toBe('ADD_NODE');
    expect(store.selectedNodeId).toBeNull();
  });

  it('moves node position', () => {
    const store = usePlaygroundStore();
    const a = store.addNode(100, 100)!;
    store.moveNode(a.id, 250, 350);
    expect(store.nodes[0].x).toBe(250);
    expect(store.nodes[0].y).toBe(350);
  });

  it('manages hovered states for nodes and edges', () => {
    const store = usePlaygroundStore();
    const a = store.addNode(100, 100)!;
    const b = store.addNode(200, 200)!;
    const edge = store.addEdge(a.id, b.id)!;

    expect(store.hoveredNodeId).toBeNull();
    expect(store.hoveredEdgeId).toBeNull();

    store.setHoveredNodeId(a.id);
    store.setHoveredEdgeId(edge.id);
    expect(store.hoveredNodeId).toBe(a.id);
    expect(store.hoveredEdgeId).toBe(edge.id);

    // Deleting the edge resets hoveredEdgeId if it matches
    store.deleteEdge(edge.id);
    expect(store.hoveredEdgeId).toBeNull();

    // Reset hover node state
    store.setHoveredNodeId(b.id);
    expect(store.hoveredNodeId).toBe(b.id);
    
    // Deleting the node resets hoveredNodeId if it matches
    store.deleteNode(b.id);
    expect(store.hoveredNodeId).toBeNull();
  });
});

// =========================================
// 2. GraphGeometryEngine Tests
// =========================================
describe('GraphGeometryEngine', () => {
  const testNodes: NodeDTO[] = [
    { id: 'n1', label: 'A', x: 100, y: 100, radius: 20 },
    { id: 'n2', label: 'B', x: 300, y: 100, radius: 20 },
    { id: 'n3', label: 'C', x: 200, y: 300, radius: 20 },
  ];

  const testEdges: EdgeDTO[] = [
    { id: 'e1', from: 'n1', to: 'n2', weight: 5 },
    { id: 'e2', from: 'n2', to: 'n3', weight: 3 },
  ];

  it('detects hit on node when click is inside circle', () => {
    const hit = GraphGeometryEngine.hitTestNode({ x: 105, y: 95 }, testNodes);
    expect(hit).not.toBeNull();
    expect(hit!.id).toBe('n1');
  });

  it('returns null when click misses all nodes', () => {
    const hit = GraphGeometryEngine.hitTestNode({ x: 500, y: 500 }, testNodes);
    expect(hit).toBeNull();
  });

  it('detects hit exactly on node boundary', () => {
    const hit = GraphGeometryEngine.hitTestNode({ x: 120, y: 100 }, testNodes);
    expect(hit).not.toBeNull();
    expect(hit!.id).toBe('n1');
  });

  it('calculates arrowhead placement stopping at circle border', () => {
    const arrow = GraphGeometryEngine.calculateArrowPlacement(
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      20,
      20
    );

    // Start should be right of node A center
    expect(arrow.start.x).toBeCloseTo(120, 0);
    expect(arrow.start.y).toBeCloseTo(100, 0);
    // End should be left of node B center
    expect(arrow.end.x).toBeCloseTo(280, 0);
    expect(arrow.end.y).toBeCloseTo(100, 0);
    expect(arrow.angle).toBeCloseTo(0, 1);
  });

  it('detects edge hit within threshold', () => {
    // Midpoint of edge e1 is (200, 100), click near that
    const hit = GraphGeometryEngine.hitTestEdge({ x: 200, y: 103 }, testEdges, testNodes, 8);
    expect(hit).not.toBeNull();
    expect(hit!.id).toBe('e1');
  });

  it('returns null when click is far from edge', () => {
    const hit = GraphGeometryEngine.hitTestEdge({ x: 200, y: 200 }, testEdges, testNodes, 8);
    expect(hit).toBeNull();
  });

  it('calculates snap distance correctly', () => {
    expect(GraphGeometryEngine.isWithinSnapDistance({ x: 140, y: 100 }, testNodes[0], 40)).toBe(true);
    expect(GraphGeometryEngine.isWithinSnapDistance({ x: 200, y: 100 }, testNodes[0], 40)).toBe(false);
  });

  it('computes edge midpoint', () => {
    const mid = GraphGeometryEngine.edgeMidpoint(testNodes[0], testNodes[1]);
    expect(mid.x).toBe(200);
    expect(mid.y).toBe(100);
  });

  it('computes point-to-segment distance correctly', () => {
    const dist = GraphGeometryEngine.pointToSegmentDistance(
      { x: 150, y: 110 },
      { x: 100, y: 100 },
      { x: 200, y: 100 }
    );
    expect(dist).toBeCloseTo(10, 0);
  });
});

// =========================================
// 3. ForceDirectedEngine Tests
// =========================================
describe('ForceDirectedEngine', () => {
  it('separates overlapping nodes via repulsion', () => {
    const engine = new ForceDirectedEngine();
    const nodes: NodeDTO[] = [
      { id: 'a', label: 'A', x: 200, y: 200, radius: 20 },
      { id: 'b', label: 'B', x: 201, y: 200, radius: 20 },
    ];
    const edges: EdgeDTO[] = [];

    // Run several physics ticks
    for (let i = 0; i < 50; i++) {
      engine.tick(nodes, edges, 800, 500, null);
    }

    // Nodes should be pushed apart
    const dist = Math.sqrt(
      (nodes[0].x - nodes[1].x) ** 2 +
      (nodes[0].y - nodes[1].y) ** 2
    );
    expect(dist).toBeGreaterThan(10);
  });

  it('pulls connected nodes toward desired spring length', () => {
    const engine = new ForceDirectedEngine();
    const nodes: NodeDTO[] = [
      { id: 'a', label: 'A', x: 50, y: 250, radius: 20 },
      { id: 'b', label: 'B', x: 750, y: 250, radius: 20 },
    ];
    const edges: EdgeDTO[] = [
      { id: 'e1', from: 'a', to: 'b', weight: 1 },
    ];

    const initialDist = Math.abs(nodes[1].x - nodes[0].x);
    for (let i = 0; i < 100; i++) {
      engine.tick(nodes, edges, 800, 500, null);
    }

    const finalDist = Math.sqrt(
      (nodes[0].x - nodes[1].x) ** 2 +
      (nodes[0].y - nodes[1].y) ** 2
    );
    // Should be closer than initial distance
    expect(finalDist).toBeLessThan(initialDist);
  });

  it('skips dragged node during physics update', () => {
    const engine = new ForceDirectedEngine();
    const nodes: NodeDTO[] = [
      { id: 'a', label: 'A', x: 200, y: 200, radius: 20 },
      { id: 'b', label: 'B', x: 201, y: 200, radius: 20 },
    ];

    const originalX = nodes[0].x;
    const originalY = nodes[0].y;
    engine.tick(nodes, [], 800, 500, 'a');

    // Dragged node should not move
    expect(nodes[0].x).toBe(originalX);
    expect(nodes[0].y).toBe(originalY);
  });

  it('reports stable energy when nodes settle', () => {
    const engine = new ForceDirectedEngine();
    const nodes: NodeDTO[] = [
      { id: 'a', label: 'A', x: 200, y: 250, radius: 20 },
      { id: 'b', label: 'B', x: 600, y: 250, radius: 20 },
    ];
    const edges: EdgeDTO[] = [
      { id: 'e1', from: 'a', to: 'b', weight: 1 },
    ];

    let energy = Infinity;
    for (let i = 0; i < 300; i++) {
      energy = engine.tick(nodes, edges, 800, 500, null);
    }

    expect(engine.isStable(energy)).toBe(true);
  });
});

// =========================================
// 4. GraphParser Tests
// =========================================
describe('GraphParser', () => {
  const nodes = [
    { id: 'n1', label: 'A', x: 0, y: 0, radius: 20 },
    { id: 'n2', label: 'B', x: 0, y: 0, radius: 20 },
    { id: 'n3', label: 'C', x: 0, y: 0, radius: 20 },
  ];
  const edges = [
    { id: 'e1', from: 'n1', to: 'n2', weight: 10 },
    { id: 'e2', from: 'n2', to: 'n3', weight: 5 },
  ];

  it('converts to adjacency list (directed)', () => {
    const payload = GraphParser.toAdjacencyList(nodes, edges, 'dijkstra');
    expect(payload.algorithmId).toBe('dijkstra');
    expect(payload.inputType).toBe('adjacency-list');
    expect(payload.nodes).toEqual(['A', 'B', 'C']);
    expect(payload.adjacencyList['A']).toEqual([{ target: 'B', weight: 10 }]);
    expect(payload.adjacencyList['B']).toEqual([{ target: 'C', weight: 5 }]);
    expect(payload.adjacencyList['C']).toEqual([]);
  });

  it('finds isolated nodes (disconnected graph)', () => {
    const nodes: NodeDTO[] = [
      { id: 'n1', label: 'A', x: 100, y: 150, radius: 20 },
      { id: 'n2', label: 'B', x: 300, y: 250, radius: 20 },
      { id: 'n3', label: 'C', x: 150, y: 400, radius: 20 },
    ];

    const edges: EdgeDTO[] = [
      { id: 'e1', from: 'n1', to: 'n2', weight: 8 },
      { id: 'e2', from: 'n2', to: 'n3', weight: 5 },
    ];
    const allNodes = [
      ...nodes,
      { id: 'n4', label: 'D', x: 500, y: 500, radius: 20 },
    ];
    const isolated = GraphParser.findIsolatedNodes(allNodes, edges);
    expect(isolated).toEqual(['D']);
  });

  it('returns empty array for fully connected graph', () => {
    const isolated = GraphParser.findIsolatedNodes(nodes, edges);
    expect(isolated).toEqual([]);
  });

  it('exports and re-imports graph correctly', () => {
    const json = GraphParser.exportToJSON(nodes, edges);
    const result = GraphParser.importFromJSON(json);

    expect(result).not.toBeNull();
    expect(result!.nodes).toHaveLength(3);
    expect(result!.edges).toHaveLength(2);
    expect(result!.nodes[0].label).toBe('A');
    expect(result!.edges[0].weight).toBe(10);
  });

  it('returns null for invalid JSON import', () => {
    expect(GraphParser.importFromJSON('not json')).toBeNull();
    expect(GraphParser.importFromJSON('{"foo": 123}')).toBeNull();
  });

  it('handles empty graph', () => {
    const payload = GraphParser.toAdjacencyList([], [], 'bfs');
    expect(payload.nodes).toEqual([]);
    expect(payload.adjacencyList).toEqual({});
  });

  it('handles single node with no edges', () => {
    const singleNode = [{ id: 'n1', label: 'A', x: 100, y: 100, radius: 20 }];
    const isolated = GraphParser.findIsolatedNodes(singleNode, []);
    expect(isolated).toEqual([]); // single node is its own connected component
  });
});
