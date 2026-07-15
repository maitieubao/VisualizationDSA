<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between text-xs text-text-secondary">
      <span class="font-medium">Nhấp đúp chuột để thêm đỉnh. Click 2 đỉnh liên tiếp để nối cạnh.</span>
      <button
        @click="clearPlayground"
        class="clear-btn text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all cursor-pointer"
      >
        Xoá hết
      </button>
    </div>

    <!-- Canvas Container -->
    <div class="playground-canvas-wrapper relative w-full h-[250px] rounded-xl border overflow-hidden" ref="canvasContainer">
      <div class="canvas-grid absolute inset-0 opacity-10 pointer-events-none"></div>

      <canvas
        ref="playgroundCanvas"
        class="w-full h-full block"
        :class="isDraggingVertex ? 'cursor-grabbing' : draggedVertexId ? 'cursor-grab' : 'cursor-crosshair'"
        @dblclick="onCanvasDoubleClick"
        @mousedown="onCanvasMouseDown"
        @mousemove="onCanvasMouseMove"
        @mouseup="onCanvasMouseUp"
        @mouseleave="onCanvasMouseUp"
      ></canvas>

      <svg v-if="draggingEdge" class="absolute inset-0 pointer-events-none w-full h-full">
        <path
          :d="getBezierPath(draggingEdge.x1, draggingEdge.y1, draggingEdge.x2, draggingEdge.y2)"
          stroke="var(--color-accent-cyan)"
          stroke-width="3"
          stroke-dasharray="4"
          class="dragging-edge-path animate-[dash_1s_linear_infinite]"
          fill="none"
        />
      </svg>
    </div>

    <!-- HUD Details -->
    <GraphPlaygroundHud
      :verticesCount="vertices.length"
      :edgesCount="edges.length"
      :isAutoLayout="isAutoLayout"
      :selectedVertexId="selectedVertexId"
      :isDraggingVertex="isDraggingVertex"
      :draggedVertexId="draggedVertexId"
      @toggleAutoLayout="toggleAutoLayout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
import { useGraphPlayground } from '../composables/useGraphPlayground';
import GraphPlaygroundHud from './GraphPlaygroundHud.vue';

const props = defineProps<{
  graphInputText: string;
  parsedGraphNodes: Array<{ id: string }>;
  parsedGraphEdges: Array<{ sourceId: string; targetId: string; weight: number }>;
}>();

const emit = defineEmits<{
  (e: 'update:graphInputText', val: string): void;
  (e: 'validateGraph'): void;
}>();

const playgroundCanvas = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);

const { graphInputText, parsedGraphNodes, parsedGraphEdges } = toRefs(props);
const graphInputTextRef = ref(props.graphInputText);
watch(() => props.graphInputText, (newVal) => { graphInputTextRef.value = newVal; });
watch(graphInputTextRef, (newVal) => { emit('update:graphInputText', newVal); });

const {
  vertices, edges, selectedVertexId, draggingEdge, isDraggingVertex, draggedVertexId, isAutoLayout,
  syncTextToPlayground, clearPlayground, resizeCanvas, onCanvasDoubleClick, onCanvasMouseDown,
  onCanvasMouseMove, onCanvasMouseUp, toggleAutoLayout, getBezierPath,
} = useGraphPlayground(
  playgroundCanvas, canvasContainer, graphInputTextRef, parsedGraphNodes, parsedGraphEdges,
  () => emit('validateGraph')
);

defineExpose({ resizeCanvas, syncTextToPlayground });
</script>

<style scoped>
.clear-btn {
  color: var(--color-accent-red);
  background-color: var(--color-accent-red-dim);
  border: 1px solid var(--color-accent-red-glow);
}

.clear-btn:hover {
  background-color: var(--color-accent-red-glow);
}

.playground-canvas-wrapper {
  background-color: var(--color-bg-terminal);
  border-color: var(--color-border-subtle);
}

.canvas-grid {
  background-image: 
    linear-gradient(to right, var(--color-border-default) 0.5px, transparent 0.5px),
    linear-gradient(to bottom, var(--color-border-default) 0.5px, transparent 0.5px);
  background-size: 2rem 2rem;
}

@keyframes dash {
  to {
    stroke-dashoffset: -40;
  }
}
</style>
