import { ref, type Ref } from "vue";
import type { Vertex, InteractivePlaygroundEngine } from "../engine/InteractivePlaygroundEngine";
export function useGraphInteraction(
  canvas: Ref<HTMLCanvasElement | null>,
  vertices: Ref<Vertex[]>,
  edges: Ref<Array<{ sourceId: string; targetId: string; weight: number }>>,
  selectedVertexId: Ref<string | null>,
  isAutoLayout: Ref<boolean>,
  startLayoutLoop: () => void,
  stopLayoutLoop: () => void,
  syncPlaygroundToText: () => void,
  getPlaygroundEngine: () => InteractivePlaygroundEngine | null
) {
  const draggingEdge = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const isDraggingVertex = ref(false);
  const draggedVertexId = ref<string | null>(null);
  const dragOffset = ref({ x: 0, y: 0 });
  function findVertexAt(x: number, y: number): Vertex | null {
    return vertices.value.find((v) => Math.hypot(v.x - x, v.y - y) < 22) || null;
  }
  function onCanvasMouseDown(e: MouseEvent) {
    const c = canvas.value;
    const engine = getPlaygroundEngine();
    if (!c || !engine) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = findVertexAt(x, y);
    if (!clicked) {
      selectedVertexId.value = null;
      engine.selectVertex("");
      return;
    }

    if (selectedVertexId.value === clicked.id) {
      isDraggingVertex.value = true;
      draggedVertexId.value = clicked.id;
      dragOffset.value = { x: x - clicked.x, y: y - clicked.y };
      if (isAutoLayout.value) stopLayoutLoop();
      return;
    }

    if (selectedVertexId.value === null) {
      selectedVertexId.value = clicked.id;
      engine.selectVertex(clicked.id);
    } else {
      const src = selectedVertexId.value;
      const exists = edges.value.some(eg => (eg.sourceId === src && eg.targetId === clicked.id) || (eg.sourceId === clicked.id && eg.targetId === src));
      if (!exists) {
        edges.value.push({ sourceId: src, targetId: clicked.id, weight: 10 });
        syncPlaygroundToText();
      }
      selectedVertexId.value = null;
      engine.selectVertex("");
    }
  }

  function onCanvasMouseMove(e: MouseEvent) {
    const c = canvas.value;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;

    if (isDraggingVertex.value && draggedVertexId.value) {
      const v = vertices.value.find((v) => v.id === draggedVertexId.value);
      if (v) {
        v.x = Math.max(20, Math.min(c.width - 20, x - dragOffset.value.x));
        v.y = Math.max(20, Math.min(c.height - 20, y - dragOffset.value.y));
      }
      return;
    }

    if (selectedVertexId.value) {
      const start = vertices.value.find((v) => v.id === selectedVertexId.value);
      if (start) draggingEdge.value = { x1: start.x, y1: start.y, x2: x, y2: y };
    }
  }

  function onCanvasMouseUp() {
    draggingEdge.value = null;
    if (isDraggingVertex.value) {
      isDraggingVertex.value = false;
      draggedVertexId.value = null;
      syncPlaygroundToText();
      if (isAutoLayout.value) startLayoutLoop();
    }
  }

  return {
    draggingEdge,
    isDraggingVertex,
    draggedVertexId,
    onCanvasMouseDown,
    onCanvasMouseMove,
    onCanvasMouseUp,
  };
}
