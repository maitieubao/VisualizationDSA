import { GraphGeometryEngine, type Point } from '../engine/GraphGeometryEngine';
import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';
import type { Ref } from 'vue';

/** Shape of the mutable drag state ref used by the playground canvas */
interface DragState {
  nodeId: string | null;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
}

/** Shape of the mutable edge-draw state ref used during ADD_EDGE mode */
interface EdgeDrawState {
  fromNodeId: string | null;
  mouseX: number;
  mouseY: number;
  snapTarget: NodeDTO | null;
}

/** Minimal store surface used by canvas event handlers */
interface PlaygroundStoreSurface {
  isAlgorithmMode: boolean;
  setSourceNodeId(id: string): void;
  selectNode(id: string): void;
  clearSelection(): void;
  addNode(x: number, y: number): void;
  selectEdge(id: string): void;
  deleteNode(id: string): void;
  deleteEdge(id: string): void;
  moveNode(id: string, x: number, y: number): void;
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
  canvasElement: HTMLCanvasElement | null
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
    const hitEdge = GraphGeometryEngine.hitTestEdge(pos, edges, nodes);
    if (hitEdge) {
      const fromNode = nodes.find(n => n.id === hitEdge.from);
      const toNode = nodes.find(n => n.id === hitEdge.to);
      if (fromNode && toNode && canvasElement) {
        const mid = GraphGeometryEngine.edgeMidpoint(fromNode, toNode);
        const rect = canvasElement.getBoundingClientRect();
        const screenX = rect.left + mid.x * (rect.width / canvasElement.width);
        const screenY = rect.top + mid.y * (rect.height / canvasElement.height);
        emitWeightInput({ edgeId: hitEdge.id, x: screenX, y: screenY, currentWeight: hitEdge.weight });
      }
      store.selectEdge(hitEdge.id);
    }
  } else if (mode === 'DELETE') {
    const hitNode = GraphGeometryEngine.hitTestNode(pos, nodes);
    if (hitNode) return store.deleteNode(hitNode.id);
    const hitEdge = GraphGeometryEngine.hitTestEdge(pos, edges, nodes);
    if (hitEdge) store.deleteEdge(hitEdge.id);
  }
}

export function handleMouseMove(
  pos: Point,
  mode: string,
  dragState: Ref<DragState>,
  edgeDrawState: Ref<EdgeDrawState>,
  nodes: NodeDTO[],
  store: PlaygroundStoreSurface,
  width: number,
  height: number
) {
  if (store.isAlgorithmMode) return;

  if (mode === 'SELECT' && dragState.value.isDragging && dragState.value.nodeId) {
    const newX = Math.max(20, Math.min(width - 20, pos.x - dragState.value.offsetX));
    const newY = Math.max(20, Math.min(height - 20, pos.y - dragState.value.offsetY));
    store.moveNode(dragState.value.nodeId, newX, newY);
  }

  if (mode === 'ADD_EDGE' && edgeDrawState.value.fromNodeId) {
    edgeDrawState.value.mouseX = pos.x;
    edgeDrawState.value.mouseY = pos.y;
    let snapTarget: NodeDTO | null = null;
    for (const node of nodes) {
      if (node.id === edgeDrawState.value.fromNodeId) continue;
      if (GraphGeometryEngine.isWithinSnapDistance(pos, node, 40)) {
        snapTarget = node;
        break;
      }
    }
    edgeDrawState.value.snapTarget = snapTarget;
  }
}

