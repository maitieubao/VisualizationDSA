import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface NodeDTO { id: string; label: string; x: number; y: number; radius: number; }
export interface EdgeDTO { id: string; from: string; to: string; weight: number; }
export type PlaygroundMode = 'SELECT' | 'ADD_NODE' | 'ADD_EDGE' | 'WEIGHT' | 'DELETE';

const MAX_NODES = 30;

/**
 * Tạo nhãn đỉnh duy nhất kiểu A..Z, sau đó A1..Z1, A2..Z2 ...
 * Tránh hiện tượng trùng nhãn khi vượt quá 26 đỉnh (MAX_NODES = 30).
 */
function nextUniqueLabel(used: Set<string>): string {
  let i = 0;
  for (;; i++) {
    const candidate =
      i < 26
        ? String.fromCharCode(65 + i)
        : `${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26)}`;
    if (!used.has(candidate)) return candidate;
  }
}

export const usePlaygroundStore = defineStore('playground', () => {
  const mode = ref<PlaygroundMode>('SELECT');
  const graphType = ref<'undirected' | 'directed'>('undirected');
  const nodes = ref<NodeDTO[]>([]);
  const edges = ref<EdgeDTO[]>([]);
  const selectedNodeId = ref<string | null>(null);
  const selectedEdgeId = ref<string | null>(null);
  const isPhysicsEnabled = ref(true);
  const isAlgorithmMode = ref(false);
  const selectedAlgorithm = ref<'BFS' | 'DFS' | 'DIJKSTRA'>('BFS');
  const sourceNodeId = ref<string | null>(null);
  const hoveredNodeId = ref<string | null>(null);
  const hoveredEdgeId = ref<string | null>(null);
  const isGuideDismissed = ref(false);
  const zoomLevel = ref(100);

  const canAddNode = computed(() => nodes.value.length < MAX_NODES);
  const nodeCount = computed(() => nodes.value.length);
  const edgeCount = computed(() => edges.value.length);

  const setMode = (newMode: PlaygroundMode) => { mode.value = newMode; clearSelection(); };
  const setGraphType = (type: 'undirected' | 'directed') => { graphType.value = type; };

  const addNode = (x: number, y: number): NodeDTO | null => {
    if (!canAddNode.value) return null;
    const usedLabels = new Set(nodes.value.map(n => n.label));
    const label = nextUniqueLabel(usedLabels);
    const node = { id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, label, x, y, radius: 20 };
    nodes.value.push(node);
    return node;
  };

  const addEdge = (fromId: string, toId: string): EdgeDTO | null => {
    if (fromId === toId || edges.value.some(e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId))) return null;
    const edge = { id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, from: fromId, to: toId, weight: 1 };
    edges.value.push(edge);
    return edge;
  };

  const updateEdgeWeight = (edgeId: string, weight: number) => {
    const e = edges.value.find(x => x.id === edgeId);
    if (e && weight > 0 && weight <= 999) e.weight = weight;
  };

  const moveNode = (nodeId: string, x: number, y: number) => {
    const n = nodes.value.find(v => v.id === nodeId);
    if (n) { n.x = x; n.y = y; }
  };

  const deleteNode = (nodeId: string) => {
    nodes.value = nodes.value.filter(n => n.id !== nodeId);
    edges.value = edges.value.filter(e => e.from !== nodeId && e.to !== nodeId);
    if (selectedNodeId.value === nodeId) selectedNodeId.value = null;
    if (sourceNodeId.value === nodeId) sourceNodeId.value = null;
    if (hoveredNodeId.value === nodeId) hoveredNodeId.value = null;
  };

  const deleteEdge = (edgeId: string) => {
    edges.value = edges.value.filter(e => e.id !== edgeId);
    if (selectedEdgeId.value === edgeId) selectedEdgeId.value = null;
    if (hoveredEdgeId.value === edgeId) hoveredEdgeId.value = null;
  };

  const clearAll = () => { nodes.value = []; edges.value = []; clearSelection(); sourceNodeId.value = null; hoveredNodeId.value = null; hoveredEdgeId.value = null; };
  const clearSelection = () => { selectedNodeId.value = null; selectedEdgeId.value = null; };
  const selectNode = (id: string | null) => { selectedNodeId.value = id; selectedEdgeId.value = null; };
  const selectEdge = (id: string | null) => { selectedEdgeId.value = id; selectedNodeId.value = null; };
  const togglePhysics = () => { isPhysicsEnabled.value = !isPhysicsEnabled.value; };

  const setAlgorithmMode = (val: boolean) => { isAlgorithmMode.value = val; if (!val) clearSelection(); };
  const setSelectedAlgorithm = (algo: 'BFS' | 'DFS' | 'DIJKSTRA') => { selectedAlgorithm.value = algo; };
  const setSourceNodeId = (id: string | null) => { sourceNodeId.value = id; };
  const setHoveredNodeId = (id: string | null) => { hoveredNodeId.value = id; };
  const setHoveredEdgeId = (id: string | null) => { hoveredEdgeId.value = id; };
  const dismissGuide = () => { isGuideDismissed.value = true; };

  return {
    mode, graphType, nodes, edges, selectedNodeId, selectedEdgeId, isPhysicsEnabled,
    isAlgorithmMode, selectedAlgorithm, sourceNodeId, hoveredNodeId, hoveredEdgeId,
    zoomLevel,
    canAddNode, nodeCount, edgeCount, setMode, setGraphType, addNode, addEdge,
    updateEdgeWeight, moveNode, deleteNode, deleteEdge, clearAll,
    clearSelection, selectNode, selectEdge, togglePhysics,
    setAlgorithmMode, setSelectedAlgorithm, setSourceNodeId, setHoveredNodeId, setHoveredEdgeId,
    isGuideDismissed, dismissGuide,
  };
});
