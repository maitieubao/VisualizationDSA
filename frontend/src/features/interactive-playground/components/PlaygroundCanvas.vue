<template>
  <div class="relative w-full h-full overflow-hidden">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      style="display: block; width: 100%; height: 100%; background: var(--canvas-bg); border-radius: 8px; cursor: crosshair;"
    />
    
    <div v-show="store.nodes.length > 0 || store.isAlgorithmMode || store.isGuideDismissed" class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-[11px] font-medium text-text-secondary bg-bg-secondary/80 backdrop-blur-md border border-white/5 pointer-events-none transition-all shadow-2xl select-none text-center max-w-[90%] md:min-w-[340px] z-[1000]">
      <span class="w-2 h-2 rounded-full inline-block mr-2 animate-pulse" :class="store.isAlgorithmMode ? 'bg-accent-cyan' : 'bg-accent-emerald'"></span>
      <span>{{ modeTooltip }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { GraphGeometryEngine, type Point } from '../engine/GraphGeometryEngine';
import { ForceDirectedEngine } from '../engine/ForceDirectedEngine';
import { drawPlayground } from './playgroundCanvasDraw';
import { handleMouseDown, handleMouseMove } from './canvasEventHandlers';

const store = usePlaygroundStore();
const animStore = useAnimationStore();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(800);
const canvasHeight = ref(500);

const physicsEngine = new ForceDirectedEngine();
let animFrameId = 0;

const dragState = ref({ nodeId: null as string | null, offsetX: 0, offsetY: 0, isDragging: false });
const edgeDrawState = ref({ fromNodeId: null as string | null, mouseX: 0, mouseY: 0, snapTarget: null as import('../store/usePlaygroundStore').NodeDTO | null });

const emit = defineEmits<{
  (e: 'weight-input', payload: { edgeId: string; x: number; y: number; currentWeight: number }): void;
}>();

const modeTooltip = computed(() => {
  if (store.isAlgorithmMode) {
    return 'Đang chạy mô phỏng. Sử dụng VCR bên dưới để điều khiển. Nhấp đỉnh bất kỳ để đổi đỉnh nguồn.';
  }
  const tooltips: Record<string, string> = {
    SELECT: 'Nhấp kéo đỉnh để di chuyển. Nhấp chọn đỉnh/cạnh để gán/xóa.',
    ADD_NODE: 'Nhấp chuột lên vùng trống bản vẽ để thêm đỉnh mới.',
    ADD_EDGE: 'Kéo thả từ đỉnh nguồn tới đỉnh đích để nối cạnh.',
    WEIGHT: 'Nhấp vào nhãn số của cạnh trên Canvas để nhập trọng số.',
    DELETE: 'Nhấp trực tiếp vào đỉnh hoặc cạnh bất kỳ để xóa.'
  };
  return tooltips[store.mode] || '';
});

const getMousePos = (e: MouseEvent): Point => {
  const c = canvasRef.value;
  if (!c) return { x: 0, y: 0 };
  const r = c.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
};

const onMouseDown = (e: MouseEvent) => {
  handleMouseDown(getMousePos(e), store.mode, store.nodes, store.edges, store, dragState, edgeDrawState, p => emit('weight-input', p), canvasRef.value);
};

const onMouseMove = (e: MouseEvent) => {
  handleMouseMove(getMousePos(e), store.mode, dragState, edgeDrawState, store.nodes, store, canvasWidth.value, canvasHeight.value);
};

const onMouseUp = () => {
  if (store.mode === 'ADD_EDGE' && edgeDrawState.value.fromNodeId && edgeDrawState.value.snapTarget) {
    store.addEdge(edgeDrawState.value.fromNodeId, edgeDrawState.value.snapTarget.id);
  }
  edgeDrawState.value = { fromNodeId: null, mouseX: 0, mouseY: 0, snapTarget: null };
  dragState.value = { nodeId: null, offsetX: 0, offsetY: 0, isDragging: false };
};

const draw = () => {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const activeFrame = store.isAlgorithmMode ? animStore.currentFrame : null;
    drawPlayground(
      ctx,
      store.nodes,
      store.edges,
      store.selectedNodeId,
      store.selectedEdgeId,
      edgeDrawState.value,
      activeFrame,
      store.selectedAlgorithm,
      store.hoveredNodeId,
      store.hoveredEdgeId
    );
  }
};

const renderLoop = () => {
  if (!store.isAlgorithmMode && store.isPhysicsEnabled && store.nodes.length > 1 && store.edges.length > 0) {
    physicsEngine.tick(store.nodes, store.edges, canvasWidth.value, canvasHeight.value, dragState.value.isDragging ? dragState.value.nodeId : null);
  }
  draw();
  animFrameId = requestAnimationFrame(renderLoop);
};

let resizeObserver: ResizeObserver | null = null;

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (canvas?.parentElement) {
    const newWidth = canvas.parentElement.clientWidth;
    const newHeight = canvas.parentElement.clientHeight;

    if (newWidth <= 0 || newHeight <= 0) return;
    
    if (canvasWidth.value > 0 && canvasHeight.value > 0 && (canvasWidth.value !== newWidth || canvasHeight.value !== newHeight)) {
      const scaleX = newWidth / canvasWidth.value;
      const scaleY = newHeight / canvasHeight.value;
      store.nodes.forEach(node => {
        node.x = node.x * scaleX;
        node.y = node.y * scaleY;
      });
    }

    canvasWidth.value = newWidth;
    canvasHeight.value = newHeight;
  }
};

onMounted(() => {
  nextTick(() => { 
    resizeCanvas(); 
    renderLoop(); 
    
    const canvas = canvasRef.value;
    if (canvas?.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(canvas.parentElement);
    }
  });
  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  cancelAnimationFrame(animFrameId);
  window.removeEventListener('resize', resizeCanvas);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(() => store.nodes.length, () => physicsEngine.reset());
</script>
