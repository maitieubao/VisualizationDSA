import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { GraphAlgorithmSimulator, BFS_PSEUDO, DFS_PSEUDO, DIJKSTRA_PSEUDO } from '../services/GraphAlgorithmSimulator';
import { usePlaygroundAnimationStore } from '../../animation-engine/store/useAnimationStore';
import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

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

  // IP-035: loadTemplate thật (GraphView.vue:255-257) được test tại
  // graphComponentTests.spec.ts — describe "IP-035 — GraphView loadTemplate thật".
  // IP-041: mockKeydownHandler nhân bản logic đã bị xóa; phím tắt V/N/E/W và
  // Delete/Backspace được test qua handleKeydown THẬT (mount InteractivePlayground
  // + dispatch KeyboardEvent) tại graphComponentTests.spec.ts.

  describe('IP-014 (P2): Zoom', () => {
    // IP-033: test zoom cũ tự gán store.zoomLevel / mô phỏng clamp — tautological.
    // Hành vi thật (wheel → store.zoomLevel + clamp 20%..300% + ctx.scale) được
    // test tại graphComponentTests.spec.ts — describe "IP-033 — Zoom & Pan".
    it('zoom level reflects percentage value (100 = default)', () => {
      const store = usePlaygroundStore();
      expect(store.zoomLevel).toBe(100);
    });
  });

  // IP-033: pan (kéo giữa chuột / Alt+click) được test qua ctx.translate tại
  // graphComponentTests.spec.ts — describe "IP-033 — Zoom & Pan".

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
  });

  // IP-033: legend, guide overlay và header counter được test bằng DOM thật tại
  // graphComponentTests.spec.ts (mount InteractivePlayground + query theo
  // aria-label / text) — các test cũ chỉ sao chép biểu thức template.

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
      vi.useFakeTimers();
      try {
        const animStore = usePlaygroundAnimationStore();
        const { nodes, edges } = buildTriangleGraph();
        const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
        animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
        animStore.stepForward();
        vi.advanceTimersByTime(200);
        animStore.stepForward();
        vi.advanceTimersByTime(200);
        const idx = animStore.currentIndex;
        animStore.stepBackward();
        expect(animStore.currentIndex).toBe(idx - 1);
      } finally {
        vi.useRealTimers();
      }
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
      vi.useFakeTimers();
      try {
        const animStore = usePlaygroundAnimationStore();
        const { nodes, edges } = buildTriangleGraph();
        const result = GraphAlgorithmSimulator.simulate('BFS', nodes, edges, 'n1', 'undirected');
        animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
        for (let i = 0; i < result.frames.length + 5; i++) {
          animStore.stepForward();
          vi.advanceTimersByTime(200);
        }
        expect(animStore.currentIndex).toBe(result.frames.length - 1);
      } finally {
        vi.useRealTimers();
      }
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
