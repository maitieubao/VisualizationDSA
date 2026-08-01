import { ref, type Ref } from "vue";
import { ForceDirectedLayout, type GraphNode, type GraphEdge } from "../engine/ForceDirectedLayout";
import type { Vertex } from "../engine/InteractivePlaygroundEngine";

export function useGraphPhysics(
  vertices: Ref<Vertex[]>,
  edges: Ref<Array<{ sourceId: string; targetId: string; weight: number }>>,
  canvas: Ref<HTMLCanvasElement | null>
) {
  const isAutoLayout = ref(false);
  let layoutAnimationId: number | null = null;
  let stableCount = 0;

  const forceLayout = new ForceDirectedLayout({
    kRepulsion: 500,
    kAttraction: 0.08,
    idealLength: 100,
    damping: 0.9,
  });

  function startLayoutLoop() {
    if (layoutAnimationId !== null) return;
    stableCount = 0;
    const runLayout = () => {
      if (vertices.value.length >= 2 && edges.value.length > 0) {
        const nodes: GraphNode[] = vertices.value.map((v) => ({
          id: v.id, x: v.x, y: v.y, fx: 0, fy: 0,
        }));
        const graphEdges: GraphEdge[] = edges.value.map((e) => ({
          sourceId: e.sourceId, targetId: e.targetId, weight: e.weight,
        }));

        forceLayout.computePhysicsStep(nodes, graphEdges);

        nodes.forEach((node, idx) => {
          if (vertices.value[idx]) {
            vertices.value[idx].x = node.x;
            vertices.value[idx].y = node.y;
          }
        });

        const c = canvas.value;
        if (c) {
          const dpr = window.devicePixelRatio || 1;
          const w = c.width / dpr;
          const h = c.height / dpr;
          vertices.value.forEach((v) => {
            v.x = Math.max(20, Math.min(w - 20, v.x));
            v.y = Math.max(20, Math.min(h - 20, v.y));
          });
        }

        if (forceLayout.isStable(nodes)) {
          stableCount++;
          if (stableCount >= 3) {
            stopLayoutLoop();
            return;
          }
        } else {
          stableCount = 0;
        }
      }
      layoutAnimationId = requestAnimationFrame(runLayout);
    };
    runLayout();
  }

  function stopLayoutLoop() {
    if (layoutAnimationId !== null) {
      cancelAnimationFrame(layoutAnimationId);
      layoutAnimationId = null;
    }
  }

  function toggleAutoLayout() {
    isAutoLayout.value = !isAutoLayout.value;
    isAutoLayout.value ? startLayoutLoop() : stopLayoutLoop();
  }

  return {
    isAutoLayout,
    toggleAutoLayout,
    startLayoutLoop,
    stopLayoutLoop,
  };
}
