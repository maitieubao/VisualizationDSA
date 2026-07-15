import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";
import { InteractivePlaygroundEngine, type Vertex } from "../engine/InteractivePlaygroundEngine";
import { useGraphPhysics } from "./useGraphPhysics";
import { useGraphInteraction } from "./useGraphInteraction";
import { renderGraphPlayground } from "../renderers/renderGraphPlayground";

export function useGraphPlayground(
  canvas: Ref<HTMLCanvasElement | null>,
  container: Ref<HTMLDivElement | null>,
  inputText: Ref<string>,
  nodesRef: Ref<Array<{ id: string }>>,
  edgesRef: Ref<Array<{ sourceId: string; targetId: string; weight: number }>>,
  validateGraph: () => void
) {
  const vertices = ref<Vertex[]>([]);
  const edges = ref<Array<{ sourceId: string; targetId: string; weight: number }>>([]);
  const selectedVertexId = ref<string | null>(null);
  let playgroundEngine: InteractivePlaygroundEngine | null = null;
  let animFrameId: number | null = null;

  const { isAutoLayout, toggleAutoLayout, startLayoutLoop, stopLayoutLoop } =
    useGraphPhysics(vertices, edges, canvas);

  const {
    draggingEdge, isDraggingVertex, draggedVertexId,
    onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp,
  } = useGraphInteraction(
    canvas, vertices, edges, selectedVertexId,
    isAutoLayout, startLayoutLoop, stopLayoutLoop,
    syncPlaygroundToText, () => playgroundEngine
  );

  function syncTextToPlayground() {
    if (!playgroundEngine) return;
    playgroundEngine.clear();
    const len = nodesRef.value.length;
    if (len === 0) { edges.value = []; return; }
    nodesRef.value.forEach((_, idx) => {
      const angle = (idx * 2 * Math.PI) / len;
      playgroundEngine?.handleDoubleClick(150 + 80 * Math.cos(angle), 125 + 80 * Math.sin(angle));
    });
    edges.value = edgesRef.value.map((e) => ({ ...e }));
  }
  function syncPlaygroundToText() {
    inputText.value = vertices.value.length === 0 ? "" : edges.value.map((e) => `${e.sourceId}-${e.targetId}:${e.weight}`).join(", ");
    validateGraph();
  }

  function clearPlayground() {
    playgroundEngine?.clear();
    edges.value = [];
    selectedVertexId.value = null;
    syncPlaygroundToText();
  }

  function resizeCanvas() {
    if (canvas.value && container.value) {
      canvas.value.width = container.value.clientWidth;
      canvas.value.height = container.value.clientHeight;
    }
  }

  function onCanvasDoubleClick(e: MouseEvent) {
    if (canvas.value && playgroundEngine) {
      const rect = canvas.value.getBoundingClientRect();
      playgroundEngine.handleDoubleClick(e.clientX - rect.left, e.clientY - rect.top);
      syncPlaygroundToText();
    }
  }

  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) =>
    `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 20} ${x2} ${y2}`;

  function draw() {
    const ctx = canvas.value?.getContext("2d");
    if (ctx && canvas.value) {
      renderGraphPlayground(ctx, canvas.value.width, canvas.value.height, vertices.value, edges.value, selectedVertexId.value);
    }
    animFrameId = requestAnimationFrame(draw);
  }

  onMounted(() => {
    playgroundEngine = new InteractivePlaygroundEngine((v) => (vertices.value = v));
    syncTextToPlayground();
    draw();
  });

  onBeforeUnmount(() => {
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);
    stopLayoutLoop();
  });

  return {
    vertices, edges, selectedVertexId, draggingEdge, isDraggingVertex, draggedVertexId,
    isAutoLayout, getBezierPath, syncTextToPlayground, clearPlayground, resizeCanvas,
    onCanvasDoubleClick, onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp, toggleAutoLayout,
  };
}
