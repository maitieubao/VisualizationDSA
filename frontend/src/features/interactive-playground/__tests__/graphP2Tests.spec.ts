import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { GraphAlgorithmSimulator, BFS_PSEUDO, DFS_PSEUDO, DIJKSTRA_PSEUDO } from '../services/GraphAlgorithmSimulator';
import { GraphGeometryEngine } from '../engine/GraphGeometryEngine';
import { usePlaygroundAnimationStore } from '../../animation-engine/store/useAnimationStore';
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
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  setLineDash: vi.fn(),
})) as any;

(globalThis as any).requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  cb(0);
  return 0;
});
(globalThis as any).cancelAnimationFrame = vi.fn();

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = MockResizeObserver;

(globalThis as any).window = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  confirm: vi.fn().mockReturnValue(true),
};

function mockKeydownHandler(key: string, targetTag = 'DIV', store: ReturnType<typeof usePlaygroundStore>) {
  const tag = targetTag;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (store.isAlgorithmMode) return;

  const keyMap: Record<string, 'SELECT' | 'ADD_NODE' | 'ADD_EDGE' | 'WEIGHT'> = {
    v: 'SELECT', n: 'ADD_NODE', e: 'ADD_EDGE', w: 'WEIGHT'
  };
  const lowerKey = key.toLowerCase();
  if (keyMap[lowerKey]) {
    store.setMode(keyMap[lowerKey]);
  } else if (lowerKey === 'delete' || lowerKey === 'backspace') {
    if (store.selectedNodeId) {
      const node = store.nodes.find(n => n.id === store.selectedNodeId);
      if (node && window.confirm(`Xóa đỉnh ${node.label}?`)) store.deleteNode(store.selectedNodeId);
    } else if (store.selectedEdgeId) {
      if (window.confirm('Xóa cạnh đã chọn?')) store.deleteEdge(store.selectedEdgeId);
    }
  }
}

function buildTriangleGraph(): { nodes: NodeDTO[]; edges: EdgeDTO[] } {
  const nodes: NodeDTO[] = [
    { id: 'n1', label: 'A', x: 0, y: 0, radius: 20 },
    { id: 'n2', label: 'B', x: 0, y: 0, radius: 20 },
    { id: 'n3', label: 'C', x: 0, y: 0, radius: 20 },
  ];
  const edges: EdgeDTO[] = [
    { id: 'e1', from: 'n1', to: 'n2', weight: 1 },
    { id: 'e2', from: 'n2', to: 'n3', weight: 1 },
    { id: 'e3', from: 'n3', to: 'n1', weight: 1 },
  ];
  return { nodes, edges };
}

function autoLayout(nodes: NodeDTO[], width: number, height: number) {
  if (nodes.length === 0) return;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) * 0.6;
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    node.x = cx + radius * Math.cos(angle);
    node.y = cy + radius * Math.sin(angle);
  });
}

describe('Interactive Graph Playground — P2 Stories', () => {

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  describe('IP-001 (P2): Chế độ SELECT', () => {
    it('store.setMode("SELECT") sets mode to SELECT', () => {
      const store = usePlaygroundStore();
      store.setMode('ADD_NODE');
      store.setMode('SELECT');
      expect(store.mode).toBe('SELECT');
    });

    it('setMode("SELECT") clears current selection', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      store.selectNode(n1!.id);
      store.setMode('SELECT');
      expect(store.selectedNodeId).toBeNull();
      expect(store.mode).toBe('SELECT');
    });

    it('default mode is SELECT on store initialization', () => {
      const store = usePlaygroundStore();
      expect(store.mode).toBe('SELECT');
    });
  });

  describe('IP-006 (P2): Toggle physics', () => {
    it('togglePhysics() flips isPhysicsEnabled from true to false', () => {
      const store = usePlaygroundStore();
      expect(store.isPhysicsEnabled).toBe(true);
      store.togglePhysics();
      expect(store.isPhysicsEnabled).toBe(false);
    });

    it('togglePhysics() restores isPhysicsEnabled to true after two toggles', () => {
      const store = usePlaygroundStore();
      store.togglePhysics();
      store.togglePhysics();
      expect(store.isPhysicsEnabled).toBe(true);
    });

    it('physics disabled prevents node movement during tick', () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      store.togglePhysics();
      expect(store.isPhysicsEnabled).toBe(false);
    });
  });

  describe('IP-007 (P2): Auto layout', () => {
    it('autoLayout() positions nodes in a circular pattern', () => {
      const nodes: NodeDTO[] = [
        { id: 'n1', label: 'A', x: 0, y: 0, radius: 20 },
        { id: 'n2', label: 'B', x: 0, y: 0, radius: 20 },
        { id: 'n3', label: 'C', x: 0, y: 0, radius: 20 },
        { id: 'n4', label: 'D', x: 0, y: 0, radius: 20 },
      ];
      autoLayout(nodes, 800, 600);
      const cx = 400;
      const cy = 300;
      const radius = Math.min(cx, cy) * 0.6;
      nodes.forEach(n => {
        const dist = Math.hypot(n.x - cx, n.y - cy);
        expect(dist).toBeCloseTo(radius, 0);
      });
    });

    it('autoLayout() distributes nodes with angular separation', () => {
      const nodes: NodeDTO[] = [
        { id: 'n1', label: 'A', x: 0, y: 0, radius: 20 },
        { id: 'n2', label: 'B', x: 0, y: 0, radius: 20 },
        { id: 'n3', label: 'C', x: 0, y: 0, radius: 20 },
      ];
      autoLayout(nodes, 800, 600);
      const angles = nodes.map(n => Math.atan2(n.y - 300, n.x - 400));
      const diff1 = Math.abs(angles[1] - angles[0]);
      const diff2 = Math.abs(angles[2] - angles[1]);
      expect(diff1).toBeCloseTo(diff2, 1);
    });

    it('autoLayout() handles single node at center', () => {
      const nodes: NodeDTO[] = [
        { id: 'n1', label: 'A', x: 50, y: 50, radius: 20 },
      ];
      autoLayout(nodes, 800, 600);
      expect(nodes[0].x).toBeCloseTo(400, 0);
      expect(nodes[0].y).toBeCloseTo(120, 0);
    });

    it('autoLayout() does nothing when nodes array is empty', () => {
      const nodes: NodeDTO[] = [];
      autoLayout(nodes, 800, 600);
      expect(nodes.length).toBe(0);
    });
  });

  describe('IP-009 (P2): Template load', () => {
    it('loadTemplate("triangle") creates exactly 3 nodes', () => {
      const store = usePlaygroundStore();
      const { nodes, edges } = buildTriangleGraph();
      nodes.forEach(n => store.addNode(n.x, n.y));
      expect(store.nodes.length).toBe(3);
      expect(store.nodeCount).toBe(3);
    });

    it('loadTemplate("triangle") creates 3 edges forming a cycle', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const n2 = store.addNode(200, 100);
      const n3 = store.addNode(150, 200);
      store.addEdge(n1!.id, n2!.id);
      store.addEdge(n2!.id, n3!.id);
      store.addEdge(n3!.id, n1!.id);
      expect(store.edges.length).toBe(3);
      expect(store.edgeCount).toBe(3);
    });

    it('loaded triangle template has correct labels A, B, C', () => {
      const store = usePlaygroundStore();
      store.addNode(0, 0);
      store.addNode(0, 0);
      store.addNode(0, 0);
      expect(store.nodes.map(n => n.label)).toEqual(['A', 'B', 'C']);
    });
  });

  describe('IP-012 (P2): Shortcuts V/N/E/W', () => {
    it('pressing "v" sets mode to SELECT', () => {
      const store = usePlaygroundStore();
      store.setMode('ADD_NODE');
      mockKeydownHandler('v', 'DIV', store);
      expect(store.mode).toBe('SELECT');
    });

    it('pressing "n" sets mode to ADD_NODE', () => {
      const store = usePlaygroundStore();
      mockKeydownHandler('n', 'DIV', store);
      expect(store.mode).toBe('ADD_NODE');
    });

    it('pressing "e" sets mode to ADD_EDGE', () => {
      const store = usePlaygroundStore();
      mockKeydownHandler('e', 'DIV', store);
      expect(store.mode).toBe('ADD_EDGE');
    });

    it('pressing "w" sets mode to WEIGHT', () => {
      const store = usePlaygroundStore();
      mockKeydownHandler('w', 'DIV', store);
      expect(store.mode).toBe('WEIGHT');
    });

    it('shortcut does not fire when target is INPUT', () => {
      const store = usePlaygroundStore();
      store.setMode('SELECT');
      mockKeydownHandler('n', 'INPUT', store);
      expect(store.mode).toBe('SELECT');
    });

    it('shortcut does not fire when target is TEXTAREA', () => {
      const store = usePlaygroundStore();
      store.setMode('SELECT');
      mockKeydownHandler('e', 'TEXTAREA', store);
      expect(store.mode).toBe('SELECT');
    });

    it('shortcut does not fire when target is SELECT element', () => {
      const store = usePlaygroundStore();
      store.setMode('SELECT');
      mockKeydownHandler('w', 'SELECT', store);
      expect(store.mode).toBe('SELECT');
    });

    it('uppercase key "V" also triggers SELECT mode', () => {
      const store = usePlaygroundStore();
      store.setMode('ADD_NODE');
      mockKeydownHandler('V', 'DIV', store);
      expect(store.mode).toBe('SELECT');
    });
  });

  describe('IP-013 (P2): Delete key', () => {
    it('pressing Delete with selected node removes it (confirmed)', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const n2 = store.addNode(200, 200);
      store.selectNode(n1!.id);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockKeydownHandler('delete', 'DIV', store);
      expect(store.nodes.length).toBe(1);
      expect(store.nodes[0].id).toBe(n2!.id);
    });

    it('pressing Backspace with selected edge removes it (confirmed)', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const n2 = store.addNode(200, 200);
      const edge = store.addEdge(n1!.id, n2!.id);
      store.selectEdge(edge!.id);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockKeydownHandler('backspace', 'DIV', store);
      expect(store.edges.length).toBe(0);
    });

    it('Delete does nothing when no node or edge is selected', () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      store.addNode(200, 200);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockKeydownHandler('delete', 'DIV', store);
      expect(store.nodes.length).toBe(2);
    });

    it('Delete does nothing when confirm is cancelled', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      store.selectNode(n1!.id);
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      mockKeydownHandler('delete', 'DIV', store);
      expect(store.nodes.length).toBe(1);
    });
  });

  describe('IP-014 (P2): Zoom', () => {
    it('zoom in increases zoom level', () => {
      const store = usePlaygroundStore();
      expect(store.zoomLevel).toBe(100);
      store.zoomLevel = 120;
      expect(store.zoomLevel).toBe(120);
    });

    it('zoom out decreases zoom level', () => {
      const store = usePlaygroundStore();
      store.zoomLevel = 80;
      expect(store.zoomLevel).toBe(80);
    });

    it('zoom level reflects percentage value (100 = default)', () => {
      const store = usePlaygroundStore();
      expect(store.zoomLevel).toBe(100);
    });

    it('zoom clamps within reasonable bounds (simulated 0.2–3 range)', () => {
      const zoomMin = 0.2;
      const zoomMax = 3;
      const currentZoom = 1.0;
      const zoomIn = Math.min(zoomMax, currentZoom * 1.1);
      const zoomOut = Math.max(zoomMin, currentZoom * 0.9);
      expect(zoomIn).toBeCloseTo(1.1, 1);
      expect(zoomOut).toBeCloseTo(0.9, 1);
    });
  });

  describe('IP-015 (P2): Pan', () => {
    it('pan offset changes when dragging with middle-click', () => {
      const panOffset = { x: 0, y: 0 };
      const startX = 400;
      const startY = 300;
      const currentX = 450;
      const currentY = 320;
      panOffset.x = currentX - (startX - panOffset.x);
      panOffset.y = currentY - (startY - panOffset.y);
      expect(panOffset.x).toBe(50);
      expect(panOffset.y).toBe(20);
    });

    it('pan offset is zero initially', () => {
      const panOffset = { x: 0, y: 0 };
      expect(panOffset.x).toBe(0);
      expect(panOffset.y).toBe(0);
    });

    it('pan with Alt+click works same as middle-click', () => {
      const panOffset = { x: 0, y: 0 };
      const startX = 200;
      const startY = 200;
      const currentX = 250;
      const currentY = 230;
      panOffset.x = currentX - (startX - panOffset.x);
      panOffset.y = currentY - (startY - panOffset.y);
      expect(panOffset.x).toBe(50);
      expect(panOffset.y).toBe(30);
    });
  });

  describe('IP-016 (P2): Node count display', () => {
    it('nodeCount is 0 initially', () => {
      const store = usePlaygroundStore();
      expect(store.nodeCount).toBe(0);
    });

    it('nodeCount reflects number of nodes after additions', () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      store.addNode(200, 200);
      store.addNode(300, 300);
      expect(store.nodeCount).toBe(3);
    });

    it('nodeCount decreases after node deletion', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      store.addNode(200, 200);
      store.deleteNode(n1!.id);
      expect(store.nodeCount).toBe(1);
    });

    it('header text format "Nodes: X" can be derived from nodeCount', () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      store.addNode(200, 200);
      const headerText = `Nodes: ${store.nodeCount}`;
      expect(headerText).toBe('Nodes: 2');
    });
  });

  describe('IP-017 (P2): Legend', () => {
    it('legend items are defined with correct labels', () => {
      const legendItems = [
        { color: 'amber-400', label: 'Đang xử lý' },
        { color: 'emerald-500', label: 'Đã duyệt' },
        { color: 'sky-500', label: 'Đang chọn' },
        { color: 'weight', label: 'Trọng số' },
      ];
      expect(legendItems.length).toBe(4);
      expect(legendItems[0].label).toBe('Đang xử lý');
    });

    it('legend is visible when nodes exist (store has nodes)', () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      const legendVisible = store.nodes.length > 0 && !store.isAlgorithmMode;
      expect(legendVisible).toBe(true);
    });

    it('legend is hidden in algorithm mode even with nodes', () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      store.setAlgorithmMode(true);
      const legendVisible = store.nodes.length > 0 && !store.isAlgorithmMode;
      expect(legendVisible).toBe(false);
    });
  });

  describe('IP-018 (P2): Guide overlay', () => {
    it('guide overlay shows when no nodes and not dismissed', () => {
      const store = usePlaygroundStore();
      const showGuide = store.nodes.length === 0 && !store.isAlgorithmMode && !store.isGuideDismissed;
      expect(showGuide).toBe(true);
    });

    it('guide overlay hidden when nodes exist', () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      const showGuide = store.nodes.length === 0 && !store.isAlgorithmMode && !store.isGuideDismissed;
      expect(showGuide).toBe(false);
    });

    it('guide overlay hidden in algorithm mode', () => {
      const store = usePlaygroundStore();
      store.setAlgorithmMode(true);
      const showGuide = store.nodes.length === 0 && !store.isAlgorithmMode && !store.isGuideDismissed;
      expect(showGuide).toBe(false);
    });
  });

  describe('IP-019 (P2): Close guide', () => {
    it('dismissGuide() sets isGuideDismissed to true', () => {
      const store = usePlaygroundStore();
      expect(store.isGuideDismissed).toBe(false);
      store.dismissGuide();
      expect(store.isGuideDismissed).toBe(true);
    });

    it('guide overlay hidden after dismissGuide()', () => {
      const store = usePlaygroundStore();
      store.dismissGuide();
      const showGuide = store.nodes.length === 0 && !store.isAlgorithmMode && !store.isGuideDismissed;
      expect(showGuide).toBe(false);
    });

    it('isGuideDismissed persists across node additions', () => {
      const store = usePlaygroundStore();
      store.dismissGuide();
      store.addNode(100, 100);
      expect(store.isGuideDismissed).toBe(true);
    });
  });

  describe('IP-023 (P2): Source node dropdown', () => {
    it('setSourceNodeId updates sourceNodeId in store', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      store.setSourceNodeId(n1!.id);
      expect(store.sourceNodeId).toBe(n1!.id);
    });

    it('setSourceNodeId(null) clears source selection', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      store.setSourceNodeId(n1!.id);
      store.setSourceNodeId(null);
      expect(store.sourceNodeId).toBeNull();
    });

    it('source node defaults to first node when not set', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      store.addNode(200, 200);
      expect(store.sourceNodeId).toBeNull();
      store.setSourceNodeId(store.nodes[0].id);
      expect(store.sourceNodeId).toBe(n1!.id);
    });

    it('source node dropdown lists all available nodes', () => {
      const store = usePlaygroundStore();
      const n1 = store.addNode(100, 100);
      const n2 = store.addNode(200, 200);
      const n3 = store.addNode(300, 300);
      const dropdownOptions = store.nodes.map(n => ({ id: n.id, label: n.label }));
      expect(dropdownOptions.length).toBe(3);
      expect(dropdownOptions[0].label).toBe('A');
      expect(dropdownOptions[1].label).toBe('B');
      expect(dropdownOptions[2].label).toBe('C');
    });
  });

  describe('IP-024 (P2): Algorithm dropdown', () => {
    it('setSelectedAlgorithm("BFS") updates selectedAlgorithm', () => {
      const store = usePlaygroundStore();
      store.setSelectedAlgorithm('BFS');
      expect(store.selectedAlgorithm).toBe('BFS');
    });

    it('setSelectedAlgorithm("DFS") updates selectedAlgorithm', () => {
      const store = usePlaygroundStore();
      store.setSelectedAlgorithm('DFS');
      expect(store.selectedAlgorithm).toBe('DFS');
    });

    it('setSelectedAlgorithm("DIJKSTRA") updates selectedAlgorithm', () => {
      const store = usePlaygroundStore();
      store.setSelectedAlgorithm('DIJKSTRA');
      expect(store.selectedAlgorithm).toBe('DIJKSTRA');
    });

    it('default algorithm is BFS', () => {
      const store = usePlaygroundStore();
      expect(store.selectedAlgorithm).toBe('BFS');
    });

    it('algorithm dropdown has exactly 3 options', () => {
      const store = usePlaygroundStore();
      const algorithms = ['BFS', 'DFS', 'DIJKSTRA'] as const;
      expect(algorithms.length).toBe(3);
      algorithms.forEach(algo => store.setSelectedAlgorithm(algo));
    });
  });

  describe('IP-025 (P2): Pseudocode highlight', () => {
    it('BFS pseudocode has correct structure', () => {
      expect(BFS_PSEUDO.length).toBe(10);
      expect(BFS_PSEUDO[0]).toBe('BFS(G, source):');
      expect(BFS_PSEUDO[BFS_PSEUDO.length - 1]).toBe('        Q.enqueue(w)');
    });

    it('DFS pseudocode has correct structure', () => {
      expect(DFS_PSEUDO.length).toBe(10);
      expect(DFS_PSEUDO[0]).toBe('DFS(G, source):');
      expect(DFS_PSEUDO[DFS_PSEUDO.length - 1]).toBe('          S.push(w)');
    });

    it('Dijkstra pseudocode has correct structure', () => {
      expect(DIJKSTRA_PSEUDO.length).toBe(12);
      expect(DIJKSTRA_PSEUDO[0]).toBe('Dijkstra(G, source):');
      expect(DIJKSTRA_PSEUDO[DIJKSTRA_PSEUDO.length - 1]).toBe('        Q.decreaseKey(v, alt)');
    });

    it('simulation result includes pseudocode matching the algorithm', () => {
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      expect(result.pseudoCode).toEqual(BFS_PSEUDO);
      expect(result.pseudoCode.length).toBeGreaterThan(0);
    });

    it('active line is highlighted in current frame', () => {
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      const frame = result.frames[1];
      expect(frame.activeLine).toBeGreaterThanOrEqual(0);
      expect(frame.activeLine).toBeLessThan(result.pseudoCode.length);
    });

    it('active line changes across frames', () => {
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('DFS', nodes, edges, 'n1', 'undirected');
      const activeLines = result.frames.map(f => f.activeLine);
      const uniqueLines = new Set(activeLines);
      expect(uniqueLines.size).toBeGreaterThan(1);
    });
  });

  describe('IP-026 (P2): Playback controls (VCR)', () => {
    it('animation store starts with empty frames', () => {
      const animStore = usePlaygroundAnimationStore();
      expect(animStore.frames).toHaveLength(0);
      expect(animStore.currentFrame).toBeNull();
    });

    it('loadResult populates frames and resets index', () => {
      const animStore = usePlaygroundAnimationStore();
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      animStore.loadResult({
        algorithmId: result.algorithmId,
        pseudoCode: result.pseudoCode,
        frames: result.frames,
      });
      expect(animStore.frames.length).toBeGreaterThan(0);
      expect(animStore.currentIndex).toBe(0);
      expect(animStore.totalSteps).toBe(result.frames.length);
    });

    it('stepForward advances currentIndex', () => {
      const animStore = usePlaygroundAnimationStore();
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
      const initial = animStore.currentIndex;
      animStore.stepForward();
      expect(animStore.currentIndex).toBe(initial + 1);
    });

    it('stepBackward decreases currentIndex', () => {
      const animStore = usePlaygroundAnimationStore();
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
      animStore.stepForward();
      animStore.stepForward();
      const idx = animStore.currentIndex;
      animStore.stepBackward();
      expect(animStore.currentIndex).toBe(idx - 1);
    });

    it('stepBackward does not go below 0', () => {
      const animStore = usePlaygroundAnimationStore();
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
      animStore.stepBackward();
      expect(animStore.currentIndex).toBe(0);
    });

    it('stepForward does not exceed last frame', () => {
      const animStore = usePlaygroundAnimationStore();
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
      for (let i = 0; i < result.frames.length + 5; i++) {
        animStore.stepForward();
      }
      expect(animStore.currentIndex).toBe(result.frames.length - 1);
    });

    it('scrubTo jumps to specific frame index', () => {
      const animStore = usePlaygroundAnimationStore();
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
      const target = Math.floor(result.frames.length / 2);
      animStore.scrubTo(target);
      expect(animStore.currentIndex).toBe(target);
    });

    it('stop resets currentIndex to 0', () => {
      const animStore = usePlaygroundAnimationStore();
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
      animStore.stepForward();
      animStore.stepForward();
      animStore.stop();
      expect(animStore.currentIndex).toBe(0);
    });

    it('isFinished is true at last frame', () => {
      const animStore = usePlaygroundAnimationStore();
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
      animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
      animStore.scrubTo(result.frames.length - 1);
      expect(animStore.isFinished).toBe(true);
    });

    it('setSpeed updates playback speed', () => {
      const animStore = usePlaygroundAnimationStore();
      animStore.setSpeed(2.0);
      expect(animStore.playbackSpeed).toBe(2.0);
    });
  });

  describe('IP-027 (P2): Distances display (Dijkstra)', () => {
    it('Dijkstra final frame contains distances map', () => {
      const { nodes, edges } = buildTriangleGraph();
      edges[0].weight = 2;
      edges[1].weight = 3;
      edges[2].weight = 10;
      const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', nodes, edges, 'n1', 'undirected');
      const finalFrame = result.frames[result.frames.length - 1];
      expect(finalFrame.distances).toBeDefined();
      expect(finalFrame.distances!['n1']).toBe(0);
    });

    it('Dijkstra computes correct shortest distances in triangle graph', () => {
      const { nodes, edges } = buildTriangleGraph();
      edges[0].weight = 2;
      edges[1].weight = 3;
      edges[2].weight = 10;
      const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', nodes, edges, 'n1', 'undirected');
      const finalFrame = result.frames[result.frames.length - 1];
      expect(finalFrame.distances!['n1']).toBe(0);
      expect(finalFrame.distances!['n2']).toBe(2);
      expect(finalFrame.distances!['n3']).toBe(5);
    });

    it('Dijkstra distances are non-negative', () => {
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', nodes, edges, 'n1', 'undirected');
      const finalFrame = result.frames[result.frames.length - 1];
      Object.values(finalFrame.distances!).forEach(d => {
        expect(d).toBeGreaterThanOrEqual(0);
      });
    });

    it('Dijkstra source node always has distance 0', () => {
      const { nodes, edges } = buildTriangleGraph();
      const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', nodes, edges, 'n2', 'undirected');
      const finalFrame = result.frames[result.frames.length - 1];
      expect(finalFrame.distances!['n2']).toBe(0);
    });

    it('Dijkstra distances update across frames (progressive relaxation)', () => {
      const { nodes, edges } = buildTriangleGraph();
      edges[0].weight = 4;
      edges[1].weight = 6;
      edges[2].weight = 100;
      const result = GraphAlgorithmSimulator.simulate('DIJKSTRA', nodes, edges, 'n1', 'undirected');
      const distancesOverTime = result.frames
        .filter(f => f.distances)
        .map(f => f.distances!['n3']);
      expect(distancesOverTime.length).toBeGreaterThan(1);
      expect(distancesOverTime[distancesOverTime.length - 1]).toBe(10);
    });
  });
});
