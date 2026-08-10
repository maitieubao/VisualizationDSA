<template>
  <div class="relative w-full h-full overflow-hidden">
    <canvas
      ref="canvasRef"
      :aria-label="'Canvas vẽ đồ thị — ' + modeTooltip"
      role="application"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @pointerleave="onPointerLeave"
      @wheel="onWheel"
      :style="{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: store.mode === 'SELECT' && !store.isAlgorithmMode ? 'default' : 'crosshair' }"
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
import { GraphGeometryEngine, type Point, type WorldBounds } from '../engine/GraphGeometryEngine';
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

// EC-018/IP-030: vòng lặp render chỉ chạy khi "bận" (physics đang hội tụ,
// algorithm mode, drag, pan, vẽ cạnh) hoặc khi có dirty flag — không chạy
// vĩnh viễn 12.5FPS ở trạng thái idle nữa.
let isLoopRunning = false;
let isDirty = true;

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
  // IP-012: buffer canvas đã nhân DPR nên tỉ lệ c.width/r.width tự chuyển
  // clientX/clientY về CSS-px của canvas, rồi trừ pan & chia zoom → world-space.
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

/** IP-016: bounds WORLD-space thật (đã trừ panOffset) cho physics engine. */
const getPhysicsWorldBounds = (): WorldBounds => {
  return GraphGeometryEngine.worldBoundsFromViewport(
    canvasWidth.value,
    canvasHeight.value,
    panOffset.value,
    zoomLevel.value,
    0
  );
};

// ---- Render loop có dirty flag (EC-018/IP-030, IP-015) ----

const markDirty = (): void => {
  isDirty = true;
  if (!isLoopRunning) {
    isLoopRunning = true;
    animFrameId = requestAnimationFrame(renderLoop);
  }
};

const renderLoop = (): void => {
  isLoopRunning = false;

  // Physics chỉ chạy ngoài algorithm mode; khi hội tụ (isStable) thì dừng hẳn.
  let physicsActive = false;
  if (!store.isAlgorithmMode && store.isPhysicsEnabled && store.nodes.length > 1 && store.edges.length > 0) {
    const energy = physicsEngine.tick(
      store.nodes,
      store.edges,
      canvasWidth.value / zoomLevel.value,
      canvasHeight.value / zoomLevel.value,
      dragState.value.isDragging ? dragState.value.nodeId : null,
      getPhysicsWorldBounds()
    );
    physicsActive = !physicsEngine.isStable(energy);
  }

  draw();
  isDirty = false;

  const busy =
    store.isAlgorithmMode ||
    dragState.value.isDragging ||
    edgeDrawState.value.fromNodeId !== null ||
    isPanning.value ||
    physicsActive;

  if (busy || isDirty) {
    isLoopRunning = true;
    animFrameId = requestAnimationFrame(renderLoop);
  }
  // Idle: dừng hẳn — frame tiếp theo chỉ được vẽ khi markDirty() được gọi.
};

// ---- Pointer events (IP-014): thống nhất chuột + touch cơ bản ----

const cleanupInteraction = (): void => {
  edgeDrawState.value = { fromNodeId: null, mouseX: 0, mouseY: 0, snapTarget: null };
  dragState.value = { nodeId: null, offsetX: 0, offsetY: 0, isDragging: false };
  isPanning.value = false;
  removeWindowPointersListeners();
  markDirty();
};

/** IP-010: mouseup thật nằm trên window — chỉ commit cạnh khi release TRONG canvas. */
const handleWindowPointerUp = (e: PointerEvent): void => {
  const canvas = canvasRef.value;
  const isInsideCanvas = !!canvas &&
    e.clientX >= canvas.getBoundingClientRect().left &&
    e.clientX <= canvas.getBoundingClientRect().right &&
    e.clientY >= canvas.getBoundingClientRect().top &&
    e.clientY <= canvas.getBoundingClientRect().bottom;
  if (isInsideCanvas && edgeDrawState.value.fromNodeId && edgeDrawState.value.snapTarget) {
    // IP-044: addEdge đã xử lý graphType nội bộ (usePlaygroundStore.ts — undirected chặn cặp đảo,
    // directed cho phép 2 chiều) nên không cần truyền props.graphType tại call-site.
    store.addEdge(edgeDrawState.value.fromNodeId, edgeDrawState.value.snapTarget.id);
  }
  cleanupInteraction();
};

const handleWindowPointerCancel = (): void => {
  cleanupInteraction();
};

const removeWindowPointersListeners = (): void => {
  window.removeEventListener('pointerup', handleWindowPointerUp);
  window.removeEventListener('pointercancel', handleWindowPointerCancel);
};

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType === 'mouse' && (e.button === 1 || (e.button === 0 && e.altKey))) {
    isPanning.value = true;
    panStart.value = { x: e.clientX - panOffset.value.x, y: e.clientY - panOffset.value.y };
    capturePointer(e);
    registerWindowPointersListeners();
    markDirty();
    return;
  }
  capturePointer(e);
  // IP-010: mọi thao tác kéo (node/cạnh/pan) theo dõi pointerup ở window để
  // không commit "cạnh ma" khi nhả chuột bên ngoài canvas.
  registerWindowPointersListeners();
  handleMouseDown(getMousePos(e), store.mode, store.nodes, store.edges, store, dragState, edgeDrawState, p => emit('weight-input', p), canvasRef.value, zoomLevel.value, { x: panOffset.value.x, y: panOffset.value.y });
  markDirty();
};

const onPointerMove = (e: PointerEvent) => {
  if (isPanning.value) {
    panOffset.value.x = e.clientX - panStart.value.x;
    panOffset.value.y = e.clientY - panStart.value.y;
    markDirty();
    return;
  }
  handleMouseMove(getMousePos(e), store.mode, dragState, edgeDrawState, store.nodes, store.edges, store, canvasWidth.value, canvasHeight.value, zoomLevel.value, { x: panOffset.value.x, y: panOffset.value.y });
  markDirty();
};

const onPointerUp = (e: PointerEvent) => {
  releasePointerCapture(e);
  // Việc commit edge/cạnh được xử lý trong handleWindowPointerUp (IP-010).
};

const onPointerCancel = (e: PointerEvent) => {
  releasePointerCapture(e);
  cleanupInteraction();
};

/** IP-007: rời canvas → xoá hover highlight. */
const onPointerLeave = () => {
  if (store.hoveredNodeId !== null) store.setHoveredNodeId(null);
  if (store.hoveredEdgeId !== null) store.setHoveredEdgeId(null);
  markDirty();
};

const capturePointer = (e: PointerEvent): void => {
  try {
    canvasRef.value?.setPointerCapture(e.pointerId);
  } catch {
    // pointer không còn active — bỏ qua capture.
  }
};

const releasePointerCapture = (e: PointerEvent): void => {
  try {
    if (canvasRef.value?.hasPointerCapture(e.pointerId)) {
      canvasRef.value.releasePointerCapture(e.pointerId);
    }
  } catch {
    // pointer chưa từng được capture — bỏ qua.
  }
};

const registerWindowPointersListeners = (): void => {
  removeWindowPointersListeners();
  window.addEventListener('pointerup', handleWindowPointerUp);
  window.addEventListener('pointercancel', handleWindowPointerCancel);
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
  // IP-015: đánh dấu dirty transform ngay — không chờ idle timer 80ms.
  markDirty();
};

// IP-043: đồng bộ zoom lên store qua action duy nhất (setZoomLevel clamp 20–300%)
// — trước đây gán trực tiếp store.zoomLevel vi phạm single-source-of-truth.
watch(zoomLevel, (val) => { store.setZoomLevel(Math.round(val * 100)); });

const draw = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // IP-012: Retina/DPI — buffer vật lý = CSS-px × DPR, transform bù đúng tỉ lệ.
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvasWidth.value;
  const cssH = canvasHeight.value;
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  ctx.save();
  ctx.translate(panOffset.value.x, panOffset.value.y);
  ctx.scale(zoomLevel.value, zoomLevel.value);

  drawGrid(ctx, cssW, cssH, panOffset.value, zoomLevel.value);

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
    store.isolatedNodeIds,
  );

  ctx.restore();
};

/** IP-017: grid phủ đúng vùng visible theo pan (snap bội số gridSize) + lineWidth theo zoom. */
function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, pan: Point, zoom: number) {
  const gridSize = 40;
  const minX = Math.floor(-pan.x / zoom / gridSize) * gridSize;
  const maxX = Math.ceil((width - pan.x) / zoom / gridSize) * gridSize;
  const minY = Math.floor(-pan.y / zoom / gridSize) * gridSize;
  const maxY = Math.ceil((height - pan.y) / zoom / gridSize) * gridSize;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1 / zoom;
  ctx.beginPath();
  for (let x = minX; x <= maxX; x += gridSize) {
    ctx.moveTo(x, minY);
    ctx.lineTo(x, maxY);
  }
  for (let y = minY; y <= maxY; y += gridSize) {
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
  }
  ctx.stroke();
}

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

    // IP-012: đồng bộ buffer vật lý với DPR ngay khi resize.
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(newWidth * dpr);
    canvas.height = Math.round(newHeight * dpr);

    markDirty();
  }
};

onMounted(() => {
  nextTick(() => {
    resizeCanvas();
    markDirty();

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
  removeWindowPointersListeners();
  window.removeEventListener('resize', resizeCanvas);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  // IP-027/IP-047: reset zoom qua action store (đã tồn tại) — trước đây để lại
  // TODO stale + nhánh else `store.zoomLevel = 100` + cast là dead code.
  store.resetZoom();
});

watch(() => store.nodes.length, () => {
  physicsEngine.reset();
  markDirty();
});
watch(() => store.mode, () => markDirty());
watch(
  [() => store.selectedNodeId, () => store.selectedEdgeId, () => store.hoveredNodeId, () => store.hoveredEdgeId, () => store.isAlgorithmMode],
  () => markDirty()
);
watch(() => animStore.currentFrame, () => markDirty());
</script>

<style scoped>
canvas {
  border-radius: 8px;
}
</style>