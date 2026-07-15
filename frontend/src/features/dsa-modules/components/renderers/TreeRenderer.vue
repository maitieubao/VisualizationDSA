<template>
  <div ref="containerRef" class="w-full h-full bg-[var(--canvas-bg)] relative">
    <canvas ref="canvasRef" class="w-full h-full block" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import type { FrameDTO, TreeNodeDTO } from '../../types/algorithm.types';
import { LEVEL_HEIGHT, MARGIN_TOP, drawEdge, drawNode } from './treeCanvasHelpers';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';

const props = defineProps<{ frame: FrameDTO | null }>();

const algoStore = useAlgorithmStore();
const isDijkstra = computed(() => algoStore.currentAlgorithm?.id === 'dijkstra');
const isBFSOrDFS = computed(() => {
  const id = algoStore.currentAlgorithm?.id;
  return id === 'bfs' || id === 'dfs';
});

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef    = ref<HTMLCanvasElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

interface NodePosition { id: number; value: number; x: number; y: number; leftId: number | null; rightId: number | null; }

function resizeCanvas(): void {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  renderCanvas();
}

function calculateNodePositions(treeNodes: TreeNodeDTO[], canvasWidth: number): NodePosition[] {
  if (treeNodes.length === 0) return [];
  const nodeMap = new Map<number, TreeNodeDTO>();
  for (const n of treeNodes) nodeMap.set(n.id, n);
  const childIds = new Set<number>();
  for (const n of treeNodes) {
    if (n.leftNodeId != null)  childIds.add(n.leftNodeId);
    if (n.rightNodeId != null) childIds.add(n.rightNodeId);
  }
  const rootNode = treeNodes.find(n => !childIds.has(n.id)) ?? treeNodes[0];
  const positions: NodePosition[] = [];
  function layout(nodeId: number, depth: number, xMin: number, xMax: number): void {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    const x = (xMin + xMax) / 2;
    const y = MARGIN_TOP + depth * LEVEL_HEIGHT;
    positions.push({ id: node.id, value: node.value, x, y, leftId: node.leftNodeId, rightId: node.rightNodeId });
    if (node.leftNodeId  != null) layout(node.leftNodeId,  depth + 1, xMin, x);
    if (node.rightNodeId != null) layout(node.rightNodeId, depth + 1, x, xMax);
  }
  layout(rootNode.id, 0, 40, canvasWidth - 40);
  return positions;
}

function renderCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Retrieve theme colors dynamically
  const style = getComputedStyle(document.documentElement);
  const colorBg = style.getPropertyValue('--canvas-bg').trim() || '#080808';
  const colorMuted = style.getPropertyValue('--color-text-muted').trim() || '#64748B';

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = colorBg;
  ctx.fillRect(0, 0, w, h);
  const frame = props.frame;
  if (!frame || !frame.treeNodes || frame.treeNodes.length === 0) {
    if (!frame || frame.dataState.length === 0) {
      ctx.fillStyle = colorMuted; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Cây BST rỗng', w / 2, h / 2);
    }
    return;
  }
  const positions = calculateNodePositions(frame.treeNodes, w);
  const posMap = new Map<number, NodePosition>();
  for (const p of positions) posMap.set(p.id, p);
  for (const pos of positions) {
    if (pos.leftId  != null) { 
      const child = posMap.get(pos.leftId);  
      if (child) drawEdge(ctx as any, pos.x, pos.y, child.x, child.y, isDijkstra.value ? 3 : undefined); 
    }
    if (pos.rightId != null) { 
      const child = posMap.get(pos.rightId); 
      if (child) drawEdge(ctx as any, pos.x, pos.y, child.x, child.y, isDijkstra.value ? 5 : undefined); 
    }
  }
  for (const pos of positions) {
    const isActive = frame.highlights.active.includes(pos.id);
    
    let status: 'default' | 'active' | 'visited' = 'default';
    if (isActive) {
      status = 'active';
    } else if ((isBFSOrDFS.value || isDijkstra.value) && frame.dataState.includes(pos.value)) {
      status = 'visited';
    }

    drawNode(ctx as any, pos.x, pos.y, pos.value, status);
  }
}

watch(() => props.frame, renderCanvas, { deep: true });

onMounted(() => {
  resizeObserver = new ResizeObserver(resizeCanvas);
  if (containerRef.value) resizeObserver.observe(containerRef.value);
  resizeCanvas();
});

onBeforeUnmount(() => { resizeObserver?.disconnect(); });
</script>
