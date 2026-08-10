import { GraphGeometryEngine, type Point } from '../engine/GraphGeometryEngine';
import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';
import type { Ref } from 'vue';


interface DragState {
  nodeId: string | null;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
}


interface EdgeDrawState {
  fromNodeId: string | null;
  mouseX: number;
  mouseY: number;
  snapTarget: NodeDTO | null;
}


interface PlaygroundStoreSurface {
  isAlgorithmMode: boolean;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
  setSourceNodeId(id: string): void;
  selectNode(id: string): void;
  clearSelection(): void;
  addNode(x: number, y: number): void;
  selectEdge(id: string): void;
  deleteNode(id: string): void;
  deleteEdge(id: string): void;
  moveNode(id: string, x: number, y: number): void;
  setHoveredNodeId(id: string | null): void;
  setHoveredEdgeId(id: string | null): void;
}

export function handleMouseDown(
  pos: Point,
  mode: string,
  nodes: NodeDTO[],
  edges: EdgeDTO[],
  store: PlaygroundStoreSurface,
  dragState: Ref<DragState>,
  edgeDrawState: Ref<EdgeDrawState>,
  emitWeightInput: (payload: { edgeId: string; x: number; y: number; currentWeight: number }) => void,
  canvasElement: HTMLCanvasElement | null,
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 }
) {
  if (store.isAlgorithmMode) {
    const hitNode = GraphGeometryEngine.hitTestNode(pos, nodes);
    if (hitNode) {
      store.setSourceNodeId(hitNode.id);
    }
    return;
  }

  if (mode === 'SELECT') {
    const hitNode = GraphGeometryEngine.hitTestNode(pos, nodes);
    if (hitNode) {
      dragState.value = { nodeId: hitNode.id, offsetX: pos.x - hitNode.x, offsetY: pos.y - hitNode.y, isDragging: true };
      store.selectNode(hitNode.id);
    } else store.clearSelection();
  } else if (mode === 'ADD_NODE') {
    store.addNode(pos.x, pos.y);
  } else if (mode === 'ADD_EDGE') {
    const hitNode = GraphGeometryEngine.hitTestNode(pos, nodes);
    if (hitNode) edgeDrawState.value = { fromNodeId: hitNode.id, mouseX: pos.x, mouseY: pos.y, snapTarget: null };
  } else if (mode === 'WEIGHT') {
    const hitEdge = GraphGeometryEngine.hitTestEdge(pos, edges, nodes, 8, zoomLevel);
    if (hitEdge) {
      const fromNode = nodes.find(n => n.id === hitEdge.from);
      const toNode = nodes.find(n => n.id === hitEdge.to);
      if (fromNode && toNode && canvasElement) {
        const mid = GraphGeometryEngine.edgeMidpoint(fromNode, toNode);
        const rect = canvasElement.getBoundingClientRect();
        // IP-012: canvas buffer đã nhân DPR nên không được dùng lại tỉ lệ
        // rect.width/canvas.width — world→CSS-px chính là phép (mid * zoom + pan).
        const screenX = rect.left + mid.x * zoomLevel + panOffset.x;
        const screenY = rect.top + mid.y * zoomLevel + panOffset.y;
        emitWeightInput({ edgeId: hitEdge.id, x: screenX, y: screenY, currentWeight: hitEdge.weight });
      }
      store.selectEdge(hitEdge.id);
    }
  } else if (mode === 'DELETE') {
    const hitNode = GraphGeometryEngine.hitTestNode(pos, nodes);
    if (hitNode) {
      if (window.confirm(`Xóa đỉnh ${hitNode.label}?`)) store.deleteNode(hitNode.id);
      return;
    }
    const hitEdge = GraphGeometryEngine.hitTestEdge(pos, edges, nodes, 8, zoomLevel);
    if (hitEdge) {
      if (window.confirm('Xóa cạnh đã chọn?')) store.deleteEdge(hitEdge.id);
    }
  }
}

export function handleMouseMove(
  pos: Point,
  mode: string,
  dragState: Ref<DragState>,
  edgeDrawState: Ref<EdgeDrawState>,
  nodes: NodeDTO[],
  edges: EdgeDTO[],
  store: PlaygroundStoreSurface,
  width: number,
  height: number,
  zoom = 1,
  pan = { x: 0, y: 0 }
) {
  if (store.isAlgorithmMode) return;

  if (mode === 'SELECT' && dragState.value.isDragging && dragState.value.nodeId) {
    // IP-006: clamp trong WORLD-space thật (trừ pan, chia zoom) — dùng chung
    // helper với physics bounds (IP-016) để node luôn kéo tới được mép view.
    const bounds = GraphGeometryEngine.worldBoundsFromViewport(width, height, pan, zoom, 20);
    const clamped = GraphGeometryEngine.clampPointToBounds(
      { x: pos.x - dragState.value.offsetX, y: pos.y - dragState.value.offsetY },
      bounds
    );
    store.moveNode(dragState.value.nodeId, clamped.x, clamped.y);
  }

  if (mode === 'ADD_EDGE' && edgeDrawState.value.fromNodeId) {
    edgeDrawState.value.mouseX = pos.x;
    edgeDrawState.value.mouseY = pos.y;
    let snapTarget: NodeDTO | null = null;
    for (const node of nodes) {
      if (node.id === edgeDrawState.value.fromNodeId) continue;
      if (GraphGeometryEngine.isWithinSnapDistance(pos, node, 40, zoom)) {
        snapTarget = node;
        break;
      }
    }
    edgeDrawState.value.snapTarget = snapTarget;
  }

  // IP-007: hover highlight — node ưu tiên thắng edge; không hover khi đang
  // kéo node hoặc đang vẽ cạnh dở (lúc đó dùng snap glow).
  if (!dragState.value.isDragging && edgeDrawState.value.fromNodeId === null) {
    const hitNode = GraphGeometryEngine.hitTestNode(pos, nodes);
    if (hitNode) {
      if (store.hoveredNodeId !== hitNode.id) store.setHoveredNodeId(hitNode.id);
      if (store.hoveredEdgeId !== null) store.setHoveredEdgeId(null);
    } else {
      const hitEdge = GraphGeometryEngine.hitTestEdge(pos, edges, nodes, 8, zoom);
      if (store.hoveredNodeId !== null) store.setHoveredNodeId(null);
      if (store.hoveredEdgeId !== (hitEdge?.id ?? null)) store.setHoveredEdgeId(hitEdge?.id ?? null);
    }
  }
}
