<template>
  <div class="relative w-full h-full overflow-hidden">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      :aria-label="'Canvas vẽ đồ thị — ' + modeTooltip"
      role="application"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @wheel="onWheel"
      :style="{ display: 'block', width: '100%', height: '100%', cursor: store.mode === 'SELECT' && !store.isAlgorithmMode ? 'default' : 'crosshair' }"
    />

    <div v-show="store.nodes.length > 0 || store.isAlgorithmMode || store.isGuideDismissed" class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-[11px] font-medium text-text-secondary bg-bg-secondary/80 backdrop-blur-md border border-border-subtle pointer-events-none transition-all shadow-2xl select-none text-center max-w-[90%] md:min-w-[340px] z-[1000]">
      <span class="w-2 h-2 rounded-full inline-block mr-2 animate-pulse" :class="store.isAlgorithmMode ? 'bg-accent-cyan' : 'bg-accent-emerald'"></span>
      <span>{{ modeTooltip }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { usePlaygroundAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { GraphGeometryEngine, type Point } from '../engine/GraphGeometryEngine';
import { ForceDirectedEngine } from '../engine/ForceDirectedEngine';
import { drawPlayground } from './playgroundCanvasDraw';
import { handleMouseDown, handleMouseMove } from './canvasEventHandlers';

const props = defineProps<{
  graphType: 'undirected' | 'directed';
}>();

const store = usePlaygroundStore();
const animStore = usePlaygroundAnimationStore();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(800);
const canvasHeight = ref(500);

const physicsEngine = new ForceDirectedEngine();
let animFrameId = 0;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

const dragState = ref({ nodeId: null as string | null, offsetX: 0, offsetY: 0, isDragging: false });
const edgeDrawState = ref({ fromNodeId: null as string | null, mouseX: 0, mouseY: 0, snapTarget: null as import('../store/usePlaygroundStore').NodeDTO | null });

const emit = defineEmits<{
  (e: 'weight-input', payload: { edgeId: string; x: number; y: number; currentWeight: number }): void;
}>();

const zoomLevel = ref(1);
const panOffset = ref({ x: 0, y: 0 });
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });

const modeTooltip = computed(() => {
  if (store.isAlgorithmMode) {
    return 'Đang chạy mô phỏng. Sử dụng VCR bên dưới để điều khiển.';
  }
  const tooltips: Record<string, string> = {
    SELECT: 'Nhấp kéo đỉnh để di chuyển. Nhấp chọn đỉnh/cạnh để gán/xóa.',
    ADD_NODE: 'Nhấp chuột lên vùng trống bản vẽ để thêm đỉnh mới.',
    ADD_EDGE: 'Kéo thả từ đỉnh nguồn tới đỉnh đích để nối cạnh.',
    WEIGHT: 'Nhấp vào nhãn số của cạnh trên Canvas để nhập trọng số.',
    DELETE: 'Nhấp trực tiếp vào đỉnh hoặc cạnh bất kỳ để xóa.',
  };
  return tooltips[store.mode] || '';
});

const getMousePos = (e: MouseEvent): Point => {
  const c = canvasRef.value;
  if (!c) return { x: 0, y: 0 };
  const r = c.getBoundingClientRect();
  const rectX = (e.clientX - r.left) * (c.width / r.width);
  const rectY = (e.clientY - r.top) * (c.height / r.height);
  return {
    x: (rectX - panOffset.value.x) / zoomLevel.value,
    y: (rectY - panOffset.value.y) / zoomLevel.value,
  };
};

const getScreenPos = (worldX: number, worldY: number): { x: number; y: number } => {
  return {
    x: worldX * zoomLevel.value + panOffset.value.x,
    y: worldY * zoomLevel.value + panOffset.value.y,
  };
};

const onMouseDown = (e: MouseEvent) => {
  if (e.button === 1 || (e.button === 0 && e.altKey)) {
    isPanning.value = true;
    panStart.value = { x: e.clientX - panOffset.value.x, y: e.clientY - panOffset.value.y };
    return;
  }
  handleMouseDown(getMousePos(e), store.mode, store.nodes, store.edges, store, dragState, edgeDrawState, p => emit('weight-input', p), canvasRef.value, zoomLevel.value, { x: panOffset.value.x, y: panOffset.value.y });
};

const onMouseMove = (e: MouseEvent) => {
  if (isPanning.value) {
    panOffset.value.x = e.clientX - panStart.value.x;
    panOffset.value.y = e.clientY - panStart.value.y;
    return;
  }
  handleMouseMove(getMousePos(e), store.mode, dragState, edgeDrawState, store.nodes, store, canvasWidth.value, canvasHeight.value);
};

const onMouseUp = () => {
  if (store.mode === 'ADD_EDGE' && edgeDrawState.value.fromNodeId && edgeDrawState.value.snapTarget) {
    store.addEdge(edgeDrawState.value.fromNodeId, edgeDrawState.value.snapTarget.id);
  }
  edgeDrawState.value = { fromNodeId: null, mouseX: 0, mouseY: 0, snapTarget: null };
  dragState.value = { nodeId: null, offsetX: 0, offsetY: 0, isDragging: false };
  isPanning.value = false;
};

const onWheel = (e: WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(0.2, Math.min(3, zoomLevel.value * delta));
  const c = canvasRef.value;
  if (c) {
    const rect = c.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    panOffset.value.x = mouseX - (mouseX - panOffset.value.x) * (newZoom / zoomLevel.value);
    panOffset.value.y = mouseY - (mouseY - panOffset.value.y) * (newZoom / zoomLevel.value);
  }
  zoomLevel.value = newZoom;
};

watch(zoomLevel, (val) => { store.zoomLevel = Math.round(val * 100); });

const draw = () => {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(panOffset.value.x, panOffset.value.y);
    ctx.scale(zoomLevel.value, zoomLevel.value);

    drawGrid(ctx, canvasWidth.value / zoomLevel.value, canvasHeight.value / zoomLevel.value);

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
      store.hoveredEdgeId,
      props.graphType,
    );

    ctx.restore();
  }
};

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gridSize = 40;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
}

const renderLoop = () => {
  if (!store.isAlgorithmMode && store.isPhysicsEnabled && store.nodes.length > 1 && store.edges.length > 0) {
    physicsEngine.tick(store.nodes, store.edges, canvasWidth.value / zoomLevel.value, canvasHeight.value / zoomLevel.value, dragState.value.isDragging ? dragState.value.nodeId : null);
  }
  draw();

  const busy =
    store.isAlgorithmMode ||
    dragState.value.isDragging ||
    edgeDrawState.value.fromNodeId !== null ||
    isPanning.value;

  if (busy) {
    animFrameId = requestAnimationFrame(renderLoop);
  } else {
    idleTimer = setTimeout(() => {
      idleTimer = null;
      animFrameId = requestAnimationFrame(renderLoop);
    }, 80);
  }
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
  if (idleTimer) clearTimeout(idleTimer);
  window.removeEventListener('resize', resizeCanvas);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(() => store.nodes.length, () => physicsEngine.reset());
</script>

<style scoped>
canvas {
  border-radius: 8px;
}
</style>