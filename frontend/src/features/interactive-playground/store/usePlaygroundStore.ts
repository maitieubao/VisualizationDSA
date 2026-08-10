import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface NodeDTO { id: string; label: string; x: number; y: number; radius: number; }
export interface EdgeDTO { id: string; from: string; to: string; weight: number; }
export type PlaygroundMode = 'SELECT' | 'ADD_NODE' | 'ADD_EDGE' | 'WEIGHT' | 'DELETE';

const MAX_NODES = 30;
/** Biên tọa độ thế giới hợp lý dùng khi clamp (tránh node nằm ngoài canvas vô hạn — IP-031). */
const MAX_COORD = 1000;
const MIN_WEIGHT = 1;
const MAX_WEIGHT = 999;
/** Zoom tính bằng phần trăm, khớp dải 0.2x–3x của PlaygroundCanvas.onWheel. */
const MIN_ZOOM_PCT = 20;
const MAX_ZOOM_PCT = 300;
const DEFAULT_ZOOM_PCT = 100;

/** Clamp giá trị số vào [min, max]; chỉ gọi khi value đã được xác nhận finite. */
function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

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
  /** Getter cho toast "đã đạt trần 30 đỉnh" (BEHAVIOR_SPEC §1 / IP-023) — component agent dùng. */
  const nodeLimitReached = computed(() => !canAddNode.value);
  const nodeCount = computed(() => nodes.value.length);
  const edgeCount = computed(() => edges.value.length);

  /** Lý do từ chối gần nhất của addNode/addEdge để component hiển thị toast (IP-023/IP-032). */
  const lastNodeError = ref<string | null>(null);
  const lastEdgeError = ref<string | null>(null);
  /** IP-005: danh sách id đỉnh cô lập bị chặn bởi quy tắc liên thông (BEHAVIOR_SPEC §2.2) —
   * canvas vẽ flash đỏ, xóa khi thoát algorithm mode / import / clearAll. */
  const isolatedNodeIds = ref<string[]>([]);
  const setIsolatedNodeIds = (ids: string[]) => { isolatedNodeIds.value = ids; };

  // IP-048: toast dùng chung qua store — single source of truth cho cả
  // InteractivePlayground.vue lẫn GraphView.vue (trước đây GraphView import JSON
  // bỏ qua errors vì không có cơ chế feedback riêng).
  const toast = ref({ visible: false, message: '', type: 'info' as 'info' | 'error' | 'success' });
  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  const showToast = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    if (toastTimer) clearTimeout(toastTimer);
    toast.value = { visible: true, message, type };
    toastTimer = setTimeout(() => { toast.value.visible = false; }, 3000);
  };

  const setMode = (newMode: PlaygroundMode) => { mode.value = newMode; clearSelection(); };
  const setGraphType = (type: 'undirected' | 'directed') => { graphType.value = type; };

  const addNode = (x: number, y: number): NodeDTO | null => {
    if (!canAddNode.value) {
      // BEHAVIOR_SPEC §1: toast + rung viền do component đảm nhận.
      // TODO(component): canvasEventHandlers.ts:61-62 — khi addNode trả null, đọc
      // nodeLimitReached/lastNodeError để toast + hiệu ứng rung viền đỏ (IP-023).
      lastNodeError.value = 'Số lượng đỉnh tối đa cho phép là 30 để đảm bảo màn hình hiển thị trực quan.';
      return null;
    }
    lastNodeError.value = null;
    const usedLabels = new Set(nodes.value.map(n => n.label));
    const label = nextUniqueLabel(usedLabels);
    const node = { id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, label, x, y, radius: 20 };
    nodes.value.push(node);
    return node;
  };

  /**
   * IP-004: chỉ chặn cặp đảo (A→B + B→A) khi graphType = 'undirected';
   * directed cho phép đủ 2 chiều, chỉ chặn trùng CÙNG hướng.
   * IP-032: trả lý do từ chối qua lastEdgeError để component hiển thị toast.
   */
  const addEdge = (fromId: string, toId: string, graphTypeOverride?: 'undirected' | 'directed'): EdgeDTO | null => {
    if (!nodes.value.some(n => n.id === fromId) || !nodes.value.some(n => n.id === toId)) {
      lastEdgeError.value = 'Không thể tạo cạnh: đỉnh đầu hoặc cuối không tồn tại trong đồ thị.';
      return null;
    }
    if (fromId === toId) {
      lastEdgeError.value = 'Không thể tạo cạnh tự nối (self-loop) giữa một đỉnh với chính nó.';
      return null;
    }
    const effectiveType = graphTypeOverride ?? graphType.value;
    const duplicate =
      effectiveType === 'directed'
        ? edges.value.some(e => e.from === fromId && e.to === toId)
        : edges.value.some(e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId));
    if (duplicate) {
      lastEdgeError.value =
        effectiveType === 'directed'
          ? 'Cạnh cùng hướng giữa hai đỉnh này đã tồn tại.'
          : 'Cạnh giữa hai đỉnh này đã tồn tại.';
      return null;
    }
    // TODO(component): PlaygroundCanvas.vue:113 — khi addEdge trả null, đọc lastEdgeError
    // để hiển thị toast (IP-032, BEHAVIOR_SPEC §2.1).
    lastEdgeError.value = null;
    const edge = { id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, from: fromId, to: toId, weight: 1 };
    edges.value.push(edge);
    return edge;
  };

  const updateEdgeWeight = (edgeId: string, weight: number) => {
    const e = edges.value.find(x => x.id === edgeId);
    if (e && weight >= MIN_WEIGHT && weight <= MAX_WEIGHT) e.weight = weight;
  };

  /** IP-026: moveNode là action duy nhất — clamp biên an toàn ngay trong store. */
  const moveNode = (
    nodeId: string,
    x: number,
    y: number,
    bounds?: { minX: number; minY: number; maxX: number; maxY: number },
  ) => {
    const n = nodes.value.find(v => v.id === nodeId);
    if (!n) return;
    // Mặc định clamp 0..MAX_COORD (IP-031); caller (canvas) có thể truyền biên
    // world-space chuẩn (đã trừ pan/zoom — IP-006) khi cần.
    n.x = clampNumber(x, bounds?.minX ?? 0, bounds?.maxX ?? MAX_COORD);
    n.y = clampNumber(y, bounds?.minY ?? 0, bounds?.maxY ?? MAX_COORD);
  };

  const deleteNode = (nodeId: string) => {
    nodes.value = nodes.value.filter(n => n.id !== nodeId);
    edges.value = edges.value.filter(e => e.from !== nodeId && e.to !== nodeId);
    if (selectedNodeId.value === nodeId) selectedNodeId.value = null;
    // IP-009: cascade delete cũng phải dọn selection cạnh (cạnh trỏ tới node đã xóa).
    selectedEdgeId.value = null;
    if (sourceNodeId.value === nodeId) sourceNodeId.value = null;
    if (hoveredNodeId.value === nodeId) hoveredNodeId.value = null;
  };

  const deleteEdge = (edgeId: string) => {
    edges.value = edges.value.filter(e => e.id !== edgeId);
    if (selectedEdgeId.value === edgeId) selectedEdgeId.value = null;
    if (hoveredEdgeId.value === edgeId) hoveredEdgeId.value = null;
  };

  const clearAll = () => { nodes.value = []; edges.value = []; clearSelection(); sourceNodeId.value = null; hoveredNodeId.value = null; hoveredEdgeId.value = null; isolatedNodeIds.value = []; };
  const clearSelection = () => { selectedNodeId.value = null; selectedEdgeId.value = null; };
  const selectNode = (id: string | null) => { selectedNodeId.value = id; selectedEdgeId.value = null; };
  const selectEdge = (id: string | null) => { selectedEdgeId.value = id; selectedNodeId.value = null; };
  const togglePhysics = () => { isPhysicsEnabled.value = !isPhysicsEnabled.value; };

  const setAlgorithmMode = (val: boolean) => { isAlgorithmMode.value = val; if (!val) { clearSelection(); isolatedNodeIds.value = []; } };
  const setSelectedAlgorithm = (algo: 'BFS' | 'DFS' | 'DIJKSTRA') => { selectedAlgorithm.value = algo; };
  const setSourceNodeId = (id: string | null) => { sourceNodeId.value = id; };
  const setHoveredNodeId = (id: string | null) => { hoveredNodeId.value = id; };
  const setHoveredEdgeId = (id: string | null) => { hoveredEdgeId.value = id; };
  const dismissGuide = () => { isGuideDismissed.value = true; };

  /**
   * IP-003: Import đồ thị qua đúng action store — áp dụng mọi ràng buộc của addNode/addEdge:
   * ≤ 30 node, id/label duy nhất (label không rỗng), x/y finite, edge endpoints tồn tại
   * (lọc dangling edge), weight finite trong [1, 999]. Thay thế toàn bộ nội dung đồ thị.
   */
  const importGraph = (importNodes: NodeDTO[], importEdges: EdgeDTO[]): { success: boolean; errors: string[] } => {
    const errors: string[] = [];
    const cleanedNodes: NodeDTO[] = [];
    const nodeIds = new Set<string>();
    const nodeLabels = new Set<string>();

    for (const raw of importNodes) {
      if (cleanedNodes.length >= MAX_NODES) {
        errors.push(`Vượt quá giới hạn ${MAX_NODES} đỉnh: bỏ đỉnh "${raw.label ?? raw.id}".`);
        continue;
      }
      const id = typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : '';
      const label = typeof raw.label === 'string' && raw.label.trim().length > 0 ? raw.label.trim() : '';
      if (!id) { errors.push(`Bỏ đỉnh thiếu id (${JSON.stringify(raw.label)}).`); continue; }
      if (!label) { errors.push(`Bỏ đỉnh "${id}" thiếu nhãn (label không được rỗng).`); continue; }
      if (nodeIds.has(id)) { errors.push(`Bỏ đỉnh trùng id: "${id}".`); continue; }
      if (nodeLabels.has(label)) { errors.push(`Bỏ đỉnh trùng nhãn: "${label}".`); continue; }
      if (!Number.isFinite(raw.x) || !Number.isFinite(raw.y)) {
        errors.push(`Bỏ đỉnh "${label}" có tọa độ không hợp lệ (x/y phải là số hữu hạn).`);
        continue;
      }
      if (!Number.isFinite(raw.radius)) {
        errors.push(`Bỏ đỉnh "${label}" có radius không hợp lệ (phải là số hữu hạn).`);
        continue;
      }
      nodeIds.add(id);
      nodeLabels.add(label);
      // IP-031: giữ radius thật (clamp tối thiểu 1), clamp x/y vào biên hợp lý thay vì giữ nguyên.
      cleanedNodes.push({
        id,
        label,
        x: clampNumber(raw.x, 0, MAX_COORD),
        y: clampNumber(raw.y, 0, MAX_COORD),
        radius: clampNumber(raw.radius, 1, MAX_COORD),
      });
    }

    const acceptedIds = new Set(cleanedNodes.map(n => n.id));
    const cleanedEdges: EdgeDTO[] = [];
    for (const raw of importEdges) {
      const id = typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : '';
      const from = typeof raw.from === 'string' ? raw.from : String(raw.from);
      const to = typeof raw.to === 'string' ? raw.to : String(raw.to);
      if (!id) { errors.push('Bỏ cạnh thiếu id.'); continue; }
      if (!acceptedIds.has(from) || !acceptedIds.has(to)) {
        errors.push(`Bỏ cạnh "${id}" có đỉnh đầu/cuối không tồn tại trong đồ thị (dangling edge).`);
        continue;
      }
      if (!Number.isFinite(raw.weight) || raw.weight < MIN_WEIGHT || raw.weight > MAX_WEIGHT) {
        errors.push(`Bỏ cạnh "${id}" có trọng số không hợp lệ (phải là số từ ${MIN_WEIGHT} đến ${MAX_WEIGHT}).`);
        continue;
      }
      cleanedEdges.push({ id, from, to, weight: raw.weight });
    }

    // Hành vi cũ là clearAll + push trực tiếp; nay gom vào action duy nhất.
    // TODO(component): InteractivePlayground.vue:314-319 / GraphView.vue:279-283 — thay
    // clearAll + push bằng store.importGraph(result.nodes, result.edges) + toast errors (IP-003).
    nodes.value = cleanedNodes;
    edges.value = cleanedEdges;
    clearSelection();
    sourceNodeId.value = null;
    hoveredNodeId.value = null;
    hoveredEdgeId.value = null;
    isolatedNodeIds.value = [];

    return { success: errors.length === 0, errors };
  };

  /** IP-022/IP-026: Auto-layout vòng tròn — single source of truth, mutate qua action. */
  const autoLayout = (radius?: number, startAngle?: number, center?: { x: number; y: number }) => {
    const count = nodes.value.length;
    if (count === 0) return;
    const effectiveRadius = radius ?? Math.max(80, count * 25);
    const effectiveStartAngle = startAngle ?? -Math.PI / 2;
    const effectiveCenter = center ?? nodes.value.reduce(
      (acc, n) => ({ x: acc.x + n.x / count, y: acc.y + n.y / count }),
      { x: 0, y: 0 },
    );
    nodes.value.forEach((node, i) => {
      const angle = effectiveStartAngle + (2 * Math.PI * i) / count;
      node.x = effectiveCenter.x + effectiveRadius * Math.cos(angle);
      node.y = effectiveCenter.y + effectiveRadius * Math.sin(angle);
    });
  };

  /** IP-026/IP-027: zoom tính bằng phần trăm, clamp đúng dải 0.2x–3x của canvas. */
  const setZoomLevel = (zoom: number) => {
    zoomLevel.value = clampNumber(zoom, MIN_ZOOM_PCT, MAX_ZOOM_PCT);
  };
  /** IP-027: reset zoom về 100% — component canvas gọi khi unmount để header hiển thị đúng. */
  const resetZoom = () => {
    zoomLevel.value = DEFAULT_ZOOM_PCT;
  };

  return {
    mode, graphType, nodes, edges, selectedNodeId, selectedEdgeId, isPhysicsEnabled,
    isAlgorithmMode, selectedAlgorithm, sourceNodeId, hoveredNodeId, hoveredEdgeId,
    zoomLevel, isolatedNodeIds, setIsolatedNodeIds,
    toast, showToast,
    canAddNode, nodeLimitReached, nodeCount, edgeCount,
    lastNodeError, lastEdgeError,
    setMode, setGraphType, addNode, addEdge, updateEdgeWeight, moveNode,
    deleteNode, deleteEdge, clearAll, clearSelection, selectNode, selectEdge, togglePhysics,
    setAlgorithmMode, setSelectedAlgorithm, setSourceNodeId, setHoveredNodeId, setHoveredEdgeId,
    isGuideDismissed, dismissGuide,
    importGraph, autoLayout, setZoomLevel, resetZoom,
  };
});
