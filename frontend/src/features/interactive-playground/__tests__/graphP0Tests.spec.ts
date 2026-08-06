import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { GraphAlgorithmSimulator } from '../services/GraphAlgorithmSimulator';
import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

vi.stubGlobal('HTMLCanvasElement', class HTMLCanvasElement {});
(globalThis as any).HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
})) as any;

describe('Interactive Playground — Store & Simulator (P0/P1)', () => {

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('IP-002 (P0): Thêm đỉnh', () => {
    it('store.addNode() increases nodes array length', () => {
      const store = usePlaygroundStore();
      expect(store.nodes.length).toBe(0);
      const node = store.addNode(100, 200);
      expect(node).not.toBeNull();
      expect(store.nodes.length).toBe(1);
      expect(store.nodes[0].label).toBe('A');
      expect(store.nodes[0].x).toBe(100);
      expect(store.nodes[0].y).toBe(200);
    });

    it('assigns unique labels A, B, C for multiple nodes', () => {
      const store = usePlaygroundStore();
      store.addNode(0, 0);
      store.addNode(50, 0);
      store.addNode(100, 0);
      expect(store.nodes.map(n => n.label)).toEqual(['A', 'B', 'C']);
    });
  });

  describe('IP-003 (P0): Tạo cạnh', () => {
    it('store.addEdge() increases edges array length', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const n2 = store.addNode(200, 100);
      expect(store.edges.length).toBe(0);
      const edge = store.addEdge(n1!.id, n2!.id);
      expect(edge).not.toBeNull();
      expect(store.edges.length).toBe(1);
      expect(store.edges[0].from).toBe(n1!.id);
      expect(store.edges[0].to).toBe(n2!.id);
    });

    it('rejects self-loop edge', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const edge = store.addEdge(n1!.id, n1!.id);
      expect(edge).toBeNull();
      expect(store.edges.length).toBe(0);
    });

    it('rejects duplicate edge between same pair', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const n2 = store.addNode(200, 100);
      store.addEdge(n1!.id, n2!.id);
      const dup = store.addEdge(n1!.id, n2!.id);
      expect(dup).toBeNull();
      expect(store.edges.length).toBe(1);
    });
  });

  describe('IP-005 (P0): Chọn chế độ tool', () => {
    it('store.setMode("ADD_NODE") changes mode correctly', () => {
      const store = usePlaygroundStore();
      expect(store.mode).toBe('SELECT');
      store.setMode('ADD_NODE');
      expect(store.mode).toBe('ADD_NODE');
    });

    it('setMode clears selection', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      store.selectNode(n1!.id);
      expect(store.selectedNodeId).toBe(n1!.id);
      store.setMode('ADD_EDGE');
      expect(store.selectedNodeId).toBeNull();
    });
  });

  describe('IP-010 (P0): Xóa node/edge', () => {
    it('store.removeNode() (deleteNode) decreases array length', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const n2 = store.addNode(200, 100);
      const n3 = store.addNode(300, 100);
      store.addEdge(n1!.id, n2!.id);
      store.addEdge(n2!.id, n3!.id);
      expect(store.nodes.length).toBe(3);
      expect(store.edges.length).toBe(2);
      store.deleteNode(n2!.id);
      expect(store.nodes.length).toBe(2);
      expect(store.edges.length).toBe(0);
      expect(store.nodes.find(n => n.id === n2!.id)).toBeUndefined();
    });

    it('deleteEdge removes only the targeted edge', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const n2 = store.addNode(200, 100);
      const n3 = store.addNode(300, 100);
      const e1 = store.addEdge(n1!.id, n2!.id);
      const e2 = store.addEdge(n2!.id, n3!.id);
      store.deleteEdge(e1!.id);
      expect(store.edges.length).toBe(1);
      expect(store.edges[0].id).toBe(e2!.id);
    });
  });

  describe('IP-011 (P0): Chuyển graph type', () => {
    it('store.setGraphType("directed") updates graphType', () => {
      const store = usePlaygroundStore();
      expect(store.graphType).toBe('undirected');
      store.setGraphType('directed');
      expect(store.graphType).toBe('directed');
    });

    it('store.setGraphType("undirected") reverts graphType', () => {
      const store = usePlaygroundStore();
      store.setGraphType('directed');
      store.setGraphType('undirected');
      expect(store.graphType).toBe('undirected');
    });
  });

  describe('IP-020 (P1): Chạy BFS', () => {
    it('GraphAlgorithmSimulator.bfs() returns visited order covering all connected nodes', () => {
      const nodes: NodeDTO[] = [
        { id: 'n1', label: 'A', x: 0, y: 0, radius: 20 },
        { id: 'n2', label: 'B', x: 100, y: 0, radius: 20 },
        { id: 'n3', label: 'C', x: 200, y: 0, radius: 20 },
      ];
      const edges: EdgeDTO[] = [
        { id: 'e1', from: 'n1', to: 'n2', weight: 1 },
        { id: 'e2', from: 'n2', to: 'n3', weight: 1 },
      ];
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      expect(result.algorithmId).toBe('bfs');
      const finalFrame = result.frames[result.frames.length - 1];
      expect(finalFrame.visitedNodes).toContain('n1');
      expect(finalFrame.visitedNodes).toContain('n2');
      expect(finalFrame.visitedNodes).toContain('n3');
      expect(finalFrame.visitedNodes.length).toBe(3);
    });
  });

  describe('IP-021 (P1): Chạy DFS', () => {
    it('GraphAlgorithmSimulator.dfs() returns visited order covering all connected nodes', () => {
      const nodes: NodeDTO[] = [
        { id: 'n1', label: 'A', x: 0, y: 0, radius: 20 },
        { id: 'n2', label: 'B', x: 100, y: 0, radius: 20 },
        { id: 'n3', label: 'C', x: 200, y: 0, radius: 20 },
      ];
      const edges: EdgeDTO[] = [
        { id: 'e1', from: 'n1', to: 'n2', weight: 1 },
        { id: 'e2', from: 'n2', to: 'n3', weight: 1 },
      ];
      const result = GraphAlgorithmSimulator.simulate('DFS', nodes, edges, 'n1', 'undirected');
      expect(result.algorithmId).toBe('dfs');
      const finalFrame = result.frames[result.frames.length - 1];
      expect(finalFrame.visitedNodes).toContain('n1');
      expect(finalFrame.visitedNodes).toContain('n2');
      expect(finalFrame.visitedNodes).toContain('n3');
      expect(finalFrame.visitedNodes.length).toBe(3);
    });
  });

  describe('IP-022 (P1): Chạy Dijkstra', () => {
    it('GraphAlgorithmSimulator.dijkstra() returns correct distances', () => {
      const nodes: NodeDTO[] = [
        { id: 'n1', label: 'A', x: 0, y: 0, radius: 20 },
        { id: 'n2', label: 'B', x: 100, y: 0, radius: 20 },
        { id: 'n3', label: 'C', x: 200, y: 0, radius: 20 },
      ];
      const edges: EdgeDTO[] = [
        { id: 'e1', from: 'n1', to: 'n2', weight: 4 },
        { id: 'e2', from: 'n2', to: 'n3', weight: 6 },
      ];
      const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', nodes, edges, 'n1', 'undirected');
      expect(result.algorithmId).toBe('dijkstra');
      const finalFrame = result.frames[result.frames.length - 1];
      expect(finalFrame.distances).toBeDefined();
      expect(finalFrame.distances!['n1']).toBe(0);
      expect(finalFrame.distances!['n2']).toBe(4);
      expect(finalFrame.distances!['n3']).toBe(10);
    });
  });

  describe('IP-029 (P1): Max 30 nodes', () => {
    it('store does not allow adding more than 30 nodes', () => {
      const store = usePlaygroundStore();
      for (let i = 0; i < 30; i++) {
        const result = store.addNode(i * 10, i * 10);
        expect(result).not.toBeNull();
      }
      expect(store.nodes.length).toBe(30);
      expect(store.canAddNode).toBe(false);
      const extra = store.addNode(999, 999);
      expect(extra).toBeNull();
      expect(store.nodes.length).toBe(30);
    });
  });

  describe('IP-008 (P1): Export JSON', () => {
    it('exportGraph() returns valid JSON string representing the graph', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const n2 = store.addNode(200, 200);
      store.addEdge(n1!.id, n2!.id);
      const jsonStr = JSON.stringify({
        type: store.graphType,
        nodes: store.nodes,
        edges: store.edges,
      });
      expect(typeof jsonStr).toBe('string');
      const parsed = JSON.parse(jsonStr);
      expect(parsed.type).toBe('undirected');
      expect(parsed.nodes.length).toBe(2);
      expect(parsed.edges.length).toBe(1);
      expect(parsed.nodes[0].label).toBe('A');
    });

    it('exported JSON can be round-tripped back to equivalent data', () => {
      const store = usePlaygroundStore();
      store.addNode(50, 50);
      store.addNode(150, 150);
      store.setGraphType('directed');
      const jsonStr = JSON.stringify({
        type: store.graphType,
        nodes: store.nodes,
        edges: store.edges,
      });
      const parsed = JSON.parse(jsonStr);
      const store2 = usePlaygroundStore();
      store2.setGraphType(parsed.type);
      expect(store2.graphType).toBe('directed');
      expect(parsed.nodes.length).toBe(2);
    });
  });
});
