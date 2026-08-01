<template>
  <div ref="containerRef" class="w-full h-full vis-canvas-container relative overflow-hidden">
    <canvas ref="canvasRef" class="w-full h-full block cursor-grab active:cursor-grabbing" />

    
    <div v-if="hoveredNode" class="absolute pointer-events-none z-20 px-3 py-2 rounded-lg text-xs shadow-2xl" :style="tooltipStyle">
      <div class="font-bold text-accent mb-1">{{ hoveredNode.label ?? `V${hoveredNode.id}` }}</div>
      <div class="text-text-secondary">Giá trị: {{ hoveredNode.value }}</div>
      <div v-if="frame?.distances && frame.distances[hoveredNode.id] !== undefined" class="text-text-secondary">
        Khoảng cách: {{ frame.distances[hoveredNode.id] === Infinity ? '∞' : frame.distances[hoveredNode.id] }}
      </div>
      <div v-if="hoveredNodeDegree > 0" class="text-text-secondary">Bậc: {{ hoveredNodeDegree }}</div>
    </div>

    
    <div v-if="frame?.graphNodes?.length" class="absolute top-3 right-3 flex flex-col gap-1 z-10">
      <button @click="zoomIn" class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-text-primary hover:bg-white/10 transition" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.05)" title="Phóng to">+</button>
      <button @click="zoomOut" class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-text-primary hover:bg-white/10 transition" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.05)" title="Thu nhỏ">−</button>
      <button @click="resetView" class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-text-primary hover:bg-white/10 transition" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.05)" title="Đặt lại">⟳</button>
    </div>

    
    <div v-if="frame?.graphNodes?.length" class="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] z-10">
      <span class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
        <span class="w-2.5 h-2.5 rounded-full" style="background:#FBBF24"></span> Active
      </span>
      <span class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
        <span class="w-2.5 h-2.5 rounded-full" style="background:#10B981"></span> Visited
      </span>
      <span class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
        <span class="w-2.5 h-2.5 rounded-full" style="background:#06B6D4"></span> Frontier
      </span>
      <span v-if="hasDistances" class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
        <span class="text-cyan-400 font-mono">dist</span> Labels
      </span>
    </div>

    
    <div v-if="showDistanceTable && distances" class="absolute top-3 right-12 text-[10px] p-2 rounded-lg max-h-[40%] overflow-auto z-10" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.05)">
      <div class="font-bold text-accent mb-1">Distances</div>
      <div v-for="([nodeId, d]) in sortedDistances" :key="nodeId" class="flex justify-between gap-2">
        <span class="node-label">{{ getName(Number(nodeId)) }}</span>
        <span class="font-mono" :class="d === Infinity ? 'text-text-muted' : 'text-cyan-400'">{{ d === Infinity ? '∞' : d }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, type CSSProperties } from 'vue';
import type { FrameDTO, GraphNodeDTO, GraphEdgeDTO } from '../../types/algorithm.types';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';

const props = defineProps<{ frame: FrameDTO | null }>();

const algoStore = useAlgorithmStore();
const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let resizeObserver: ResizeObserver | null = null;


const zoom = ref(1);
const panX = ref(0);
const panY = ref(0);
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartOX = 0;
let panStartOY = 0;
const hoveredNode = ref<GraphNodeDTO | null>(null);
let dragNode: GraphNodeDTO | null = null;
let dragStartX = 0;
let dragStartY = 0;
let dragNodeStartX = 0;
let dragNodeStartY = 0;
let animFrameId = 0;

const hasDistances = computed(() => {
  const d = props.frame?.distances;
  return d && Object.keys(d).length > 0;
});

const distances = computed(() => props.frame?.distances ?? {});

const sortedDistances = computed(() => {
  const d = props.frame?.distances;
  if (!d) return [];
  return Object.entries(d).sort((a, b) => Number(a[0]) - Number(b[0]));
});

const getName = (nodeId: number) => {
  const nodes = props.frame?.graphNodes;
  const node = nodes?.find(n => n.id === nodeId);
  return node?.label ?? `V${nodeId}`;
};

const showDistanceTable = computed(() => {
  const id = algoStore.currentAlgorithm?.id;
  return id === 'dijkstra' || id === 'bellman-ford' || id === 'a-star';
});

const tooltipStyle = computed((): CSSProperties => {
  if (!hoveredNode.value) return { display: 'none' };
  return {
    left: `${hoveredNode.value.x + 24}px`,
    top: `${hoveredNode.value.y - 10}px`,
    background: 'rgba(15,23,42,0.92)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#FFFFFF',
  };
});

const hoveredNodeDegree = computed(() => {
  if (!hoveredNode.value || !props.frame?.graphEdges) return 0;
  return props.frame.graphEdges.filter(e => e.from === hoveredNode.value!.id || e.to === hoveredNode.value!.id).length;
});

function applyTransform(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr * zoom.value, 0, 0, dpr * zoom.value, panX.value * dpr, panY.value * dpr);
}

function screenToWorld(sx: number, sy: number): { x: number; y: number } {
  const dpr = window.devicePixelRatio || 1;
  return {
    x: (sx - panX.value * dpr) / (zoom.value * dpr),
    y: (sy - panY.value * dpr) / (zoom.value * dpr),
  };
}

function findNodeAt(wx: number, wy: number): GraphNodeDTO | null {
  const nodes = props.frame?.graphNodes;
  if (!nodes) return null;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    const dx = wx - n.x;
    const dy = wy - n.y;
    if (dx * dx + dy * dy < 22 * 22) return n;
  }
  return null;
}

function onMouseMove(e: MouseEvent): void {
  const canvas = canvasRef.value;
  if (!canvas || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const world = screenToWorld(sx, sy);

  if (dragNode) {
    dragNode.x = dragNodeStartX + (world.x - dragStartX);
    dragNode.y = dragNodeStartY + (world.y - dragStartY);
    renderCanvas();
    return;
  }

  if (isPanning) {
    const dpr = window.devicePixelRatio || 1;
    panX.value = panStartOX + (e.clientX - panStartX) / (zoom.value * dpr);
    panY.value = panStartOY + (e.clientY - panStartY) / (zoom.value * dpr);
    renderCanvas();
    return;
  }

  hoveredNode.value = findNodeAt(world.x, world.y) || null;
  canvas.style.cursor = hoveredNode.value ? 'pointer' : 'grab';
  renderCanvas();
}

function onMouseDown(e: MouseEvent): void {
  const canvas = canvasRef.value;
  if (!canvas || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const world = screenToWorld(sx, sy);

  const node = findNodeAt(world.x, world.y);
  if (node) {
    dragNode = node;
    dragStartX = world.x;
    dragStartY = world.y;
    dragNodeStartX = node.x;
    dragNodeStartY = node.y;
    canvas.style.cursor = 'grabbing';
    return;
  }

  isPanning = true;
  panStartX = e.clientX;
  panStartY = e.clientY;
  panStartOX = panX.value;
  panStartOY = panY.value;
  canvas.style.cursor = 'grabbing';
}

function onMouseUp(): void {
  if (dragNode) {
    dragNode = null;
    const canvas = canvasRef.value;
    if (canvas) canvas.style.cursor = 'grab';
  }
  isPanning = false;
}

function onWheel(e: WheelEvent): void {
  e.preventDefault();
  const canvas = canvasRef.value;
  if (!canvas || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  const oldZoom = zoom.value;
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  zoom.value = Math.max(0.3, Math.min(5, zoom.value * delta));

  
  const dpr = window.devicePixelRatio || 1;
  panX.value = sx - (sx - panX.value * dpr) * (zoom.value / oldZoom);
  panY.value = sy - (sy - panY.value * dpr) * (zoom.value / oldZoom);

  renderCanvas();
}

function zoomIn(): void {
  zoom.value = Math.min(5, zoom.value * 1.3);
  renderCanvas();
}

function zoomOut(): void {
  zoom.value = Math.max(0.3, zoom.value / 1.3);
  renderCanvas();
}

function resetView(): void {
  zoom.value = 1;
  panX.value = 0;
  panY.value = 0;
  renderCanvas();
}

function resizeCanvas(): void {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  renderCanvas();
}

function getEdgeKey(from: number, to: number): string {
  return `${Math.min(from, to)}-${Math.max(from, to)}`;
}

function renderCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const style = getComputedStyle(document.documentElement);
  const colorBg = style.getPropertyValue('--canvas-bg').trim() || '#080808';
  const colorEdge = style.getPropertyValue('--color-border-strong').trim() || '#475569';
  const colorEdgeHighlight = style.getPropertyValue('--color-accent-yellow').trim() || '#FBBF24';
  const colorEdgeMST = '#A855F7';
  const activeGlow = style.getPropertyValue('--color-accent-primary').trim() || '#FBBF24';
  const visitedColor = '#10B981';
  const queueColor = '#06B6D4';

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = colorBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  applyTransform(ctx, w, h);

  const frame = props.frame;
  if (!frame || !frame.graphNodes?.length) {
    if (!frame || frame.dataState.length === 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = `${14 * zoom.value}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Chọn thuật toán đồ thị để bắt đầu', w / 2, h / 2);
    }
    return;
  }

  const nodes = frame.graphNodes;
  const edges = frame.graphEdges ?? [];

  
  const drawnEdgeKeys = new Set<string>();
  const isUndirected = !edges.some(e => e.directed);

  
  for (const edge of edges) {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) continue;

    const key = getEdgeKey(edge.from, edge.to);
    if (isUndirected && drawnEdgeKeys.has(key)) continue;
    drawnEdgeKeys.add(key);

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = 1;

    
    const offset = isUndirected ? 8 : 0;
    const perpX = dist > minDist ? (-dy / dist) * offset : 0;
    const perpY = dist > minDist ? (dx / dist) * offset : 0;

    const startX = fromNode.x + perpX;
    const startY = fromNode.y + perpY;
    const endX = toNode.x + perpX;
    const endY = toNode.y + perpY;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    if (edge.inMST) {
      ctx.strokeStyle = colorEdgeMST;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
    } else if (edge.highlighted) {
      ctx.strokeStyle = colorEdgeHighlight;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
    } else {
      ctx.strokeStyle = colorEdge;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    
    if (edge.directed || isUndirected) {
      const angle = Math.atan2(endY - startY, endX - startX);
      const arrowLen = 8;
      const tipX = endX - Math.cos(angle) * 20;
      const tipY = endY - Math.sin(angle) * 20;
      ctx.fillStyle = edge.inMST ? colorEdgeMST : edge.highlighted ? colorEdgeHighlight : colorEdge;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(tipX - arrowLen * Math.cos(angle - Math.PI / 6), tipY - arrowLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(tipX - arrowLen * Math.cos(angle + Math.PI / 6), tipY - arrowLen * Math.sin(angle + Math.PI / 6));
      ctx.fill();
    }

    
    if (edge.weight !== undefined && edge.weight !== null && dist > 30) {
      const midX = (startX + endX) / 2 + perpX;
      const midY = (startY + endY) / 2 + perpY;
      ctx.fillStyle = colorBg;
      ctx.beginPath();
      ctx.arc(midX, midY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colorEdge;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = edge.inMST ? colorEdgeMST : edge.highlighted ? colorEdgeHighlight : '#22D3EE';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(edge.weight), midX, midY);
    }
  }

  
  const activeIds = new Set<number>(frame.highlights?.active ?? []);
  const compareIds = new Set<number>(frame.highlights?.compare ?? []);
  const sortedIds = new Set<number>(frame.highlights?.sorted ?? []);
  const dimmedIds = new Set<number>(frame.highlights?.dimmed ?? []);

  for (const node of nodes) {
    const isActive = activeIds.has(node.id);
    const isCompare = compareIds.has(node.id);
    const isSorted = sortedIds.has(node.id);
    const isDimmed = dimmedIds.has(node.id);
    const isHovered = hoveredNode.value?.id === node.id;

    const nodeRadius = isHovered ? 22 : 18;

    
    if (isActive || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius + 8, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(node.x, node.y, nodeRadius, node.x, node.y, nodeRadius + 8);
      gradient.addColorStop(0, isHovered ? 'rgba(6,182,212,0.5)' : 'rgba(251, 191, 36, 0.4)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);

    if (isActive) {
      ctx.fillStyle = activeGlow;
      ctx.strokeStyle = activeGlow;
    } else if (isSorted) {
      ctx.fillStyle = '#065F46';
      ctx.strokeStyle = visitedColor;
    } else if (isCompare) {
      ctx.fillStyle = '#0E7490';
      ctx.strokeStyle = queueColor;
    } else if (isDimmed) {
      ctx.fillStyle = '#1E1E2E';
      ctx.strokeStyle = '#334155';
    } else if (isHovered) {
      ctx.fillStyle = '#1E3A5F';
      ctx.strokeStyle = '#06B6D4';
    } else {
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
    }
    ctx.lineWidth = isActive || isHovered ? 3 : 2;
    ctx.fill();
    ctx.stroke();

    
    ctx.fillStyle = isActive || isCompare || isHovered ? '#000' : '#FFFFFF';
    ctx.font = `bold ${isHovered ? 13 : 12}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const displayLabel = node.label ?? String(node.value);
    ctx.fillText(displayLabel.length > 2 ? displayLabel.slice(0, 2) : displayLabel, node.x, node.y);

    
    if (frame.distances && frame.distances[node.id] !== undefined) {
      ctx.fillStyle = isDimmed ? '#64748B' : '#22D3EE';
      ctx.font = '9px monospace';
      ctx.fillText(frame.distances[node.id] === Infinity ? '∞' : String(frame.distances[node.id]), node.x, node.y + nodeRadius + 14);
    }
  }

  
  if (frame.currentPath && frame.currentPath.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 4]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < frame.currentPath.length; i++) {
      const node = nodes.find(n => n.id === frame.currentPath![i]);
      if (!node) continue;
      if (i === 0) ctx.moveTo(node.x, node.y);
      else ctx.lineTo(node.x, node.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

watch(() => props.frame, () => { animFrameId = requestAnimationFrame(renderCanvas); }, { deep: true });

onMounted(() => {
  resizeObserver = new ResizeObserver(resizeCanvas);
  if (containerRef.value) resizeObserver.observe(containerRef.value);

  const canvas = canvasRef.value;
  if (canvas) {
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.style.cursor = 'grab';
  }
  resizeCanvas();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (animFrameId) cancelAnimationFrame(animFrameId);
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('mouseleave', onMouseUp);
    canvas.removeEventListener('wheel', onWheel);
  }
});
</script>