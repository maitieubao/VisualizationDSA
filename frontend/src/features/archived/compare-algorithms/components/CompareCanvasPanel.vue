<template>
  <div
    ref="containerRef"
    class="visualizer-canvas-container relative w-full h-full overflow-hidden rounded-[18px] transition-all duration-300"
    :class="{ 'finished-border': isFinished }"
  >
    <!-- Background grid -->
    <div class="canvas-grid absolute inset-0 opacity-[0.18] pointer-events-none [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_60%,transparent_100%)]" />

    <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2" style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);">
      <div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full" :style="{ background: accentColor, boxShadow: `0 0 8px ${accentColor}40` }" /><span class="text-xs font-bold text-text-primary uppercase tracking-wider">{{ algorithmName }}</span></div>
      <div class="flex items-center gap-2"><span class="text-[10px] font-mono text-text-secondary">{{ timeComplexity }}</span><span v-if="isFinished" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" :style="{ background: `${accentColor}20`, color: accentColor, boxShadow: `0 0 12px ${accentColor}30` }">Hoàn thành</span></div>
    </div>
    <canvas ref="canvasRef" class="w-full h-full block" />
    <div v-if="currentFrame" class="absolute bottom-3 left-4 pointer-events-none">
      <span class="text-[10px] font-bold uppercase tracking-[0.08em]" :style="{ color: accentColor }">Step {{ currentFrame.stepId }} / {{ totalFrames }}</span>
      <p class="text-[11px] font-medium text-text-secondary leading-tight mt-0.5 max-w-[280px]" style="text-shadow: 0 1px 8px rgba(0,0,0,0.7);">{{ currentFrame.explanation }}</p>
    </div>
    <div v-if="!currentFrame" class="absolute inset-0 flex items-center justify-center pt-10"><p class="text-sm text-text-muted text-center px-6">Chọn thuật toán và tạo dữ liệu để bắt đầu so sánh.</p></div>
    <div class="absolute bottom-0 left-0 right-0 h-[3px]" style="background: rgba(30, 41, 59, 0.6);"><div class="h-full rounded-r-sm transition-[width] duration-100 ease-out" :style="{ width: progressPercent + '%', background: accentColor, boxShadow: `0 0 8px ${accentColor}90` }" /></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import type { FrameDTO } from '../../animation-engine/types/animation.types';
import { drawCompareCanvas, calculateColumnWidth, calculateX, type BarPosition } from './compareCanvasDraw';

const props = defineProps<{
  currentFrame: FrameDTO | null;
  totalFrames: number;
  currentIndex: number;
  algorithmName: string;
  timeComplexity: string;
  isFinished: boolean;
  accentColor: string;
  playbackSpeed: number;
}>();

const progressPercent = computed(() => props.totalFrames <= 1 ? 0 : (props.currentIndex / (props.totalFrames - 1)) * 100);

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let barPositions: BarPosition[] = [];
let isTransitioning = false, animationProgress = 0, lastTimestamp = 0, rafId: number | null = null;

const prepareTransition = () => {
  const f = props.currentFrame;
  if (!f || !canvasRef.value) return;
  const w = canvasRef.value.width / (window.devicePixelRatio || 1);
  const dataState = f.dataState ?? [];
  const colW = calculateColumnWidth(dataState.length, w);
  barPositions = dataState.map((_, i) => ({ x: barPositions[i]?.x ?? calculateX(i, colW, dataState.length), targetX: calculateX(i, colW, dataState.length) }));
  animationProgress = 0; isTransitioning = true;
};

const renderCanvas = () => {
  const c = canvasRef.value, ctx = c?.getContext('2d'), f = props.currentFrame;
  if (c && ctx) {
    const dpr = window.devicePixelRatio || 1, w = c.width / dpr;
    drawCompareCanvas(ctx, w, c.height / dpr, dpr, f, isTransitioning, animationProgress, barPositions);
    if (!isTransitioning && f) {
      const dataState = f.dataState ?? [];
      const colW = calculateColumnWidth(dataState.length, w);
      barPositions = dataState.map((_, i) => ({ x: calculateX(i, colW, dataState.length), targetX: calculateX(i, colW, dataState.length) }));
    }
  }
};

const tick = (t: number) => {
  if (isTransitioning) {
    animationProgress += (t - lastTimestamp) / (300 / props.playbackSpeed);
    if (animationProgress >= 1) { animationProgress = 1; isTransitioning = false; barPositions.forEach(bp => bp.x = bp.targetX); }
  }
  renderCanvas(); lastTimestamp = t; rafId = requestAnimationFrame(tick);
};

const resizeCanvas = () => {
  const c = canvasRef.value, r = containerRef.value?.getBoundingClientRect();
  if (c && r) {
    const dpr = window.devicePixelRatio || 1;
    c.width = r.width * dpr; c.height = r.height * dpr;
    c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
    const f = props.currentFrame;
    if (f) {
      const w = r.width;
      const dataState = f.dataState ?? [];
      const colW = calculateColumnWidth(dataState.length, w);
      barPositions = dataState.map((_, i) => ({ x: calculateX(i, colW, dataState.length), targetX: calculateX(i, colW, dataState.length) }));
    }
    renderCanvas();
  }
};

let resizeObserver: ResizeObserver | null = null;
watch(() => props.currentIndex, () => prepareTransition());

onMounted(() => {
  resizeCanvas(); lastTimestamp = performance.now(); rafId = requestAnimationFrame(tick);
  if (containerRef.value) { resizeObserver = new ResizeObserver(() => resizeCanvas()); resizeObserver.observe(containerRef.value); }
});

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.visualizer-canvas-container {
  background-color: var(--color-bg-primary);
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 85%, transparent);
  box-shadow: 0 8px 40px var(--color-accent-cyan-dim), 0 2px 12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
}

.finished-border {
  border-color: rgba(16, 185, 129, 0.25) !important;
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.08), 0 8px 40px var(--color-accent-cyan-dim), 0 2px 12px rgba(0, 0, 0, 0.5) !important;
}

.canvas-grid {
  background-image: 
    linear-gradient(to right, var(--color-border-default) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-border-default) 1px, transparent 1px);
  background-size: 3.5rem 3.5rem;
}
</style>

