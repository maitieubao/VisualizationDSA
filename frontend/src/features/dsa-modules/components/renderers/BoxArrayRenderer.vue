<template>
  <div ref="containerRef" class="w-full h-full vis-canvas-container relative">
    <canvas ref="canvasRef" class="w-full h-full block" />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from 'vue';
import type { FrameDTO } from '../../types/algorithm.types';
import { drawBoxArray, type AnimatedState } from './boxArrayRenderHelpers';

const props = defineProps<{
  frame: FrameDTO | null;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

let cachedColors: Record<string, string> = {};

function cacheColors(): void {
  const style = getComputedStyle(document.documentElement);
  cachedColors = {
    bg: style.getPropertyValue('--canvas-bg').trim() || '#080808',
    default: style.getPropertyValue('--color-bg-active').trim() || '#232323',
    border: style.getPropertyValue('--color-border-default').trim() || '#2b2b2b',
    compare: style.getPropertyValue('--color-accent-yellow').trim() || '#FBBF24',
    found: style.getPropertyValue('--color-accent-green').trim() || '#10B981',
    dimmed: style.getPropertyValue('--color-text-disabled').trim() || 'rgba(35, 35, 35, 0.27)',
    text: style.getPropertyValue('--color-text-primary').trim() || '#FFFFFF',
    dimmedText: style.getPropertyValue('--color-text-muted').trim() || '#FFFFFF55',
    muted: style.getPropertyValue('--color-text-muted').trim() || '#94A3B8',
    low: style.getPropertyValue('--color-accent-blue').trim() || '#3B82F6',
    high: style.getPropertyValue('--color-accent-red').trim() || '#EF4444',
  };
}


const animatedState = shallowRef<AnimatedState | null>(null);
let animationFrameId: number | null = null;
let animStartTime = 0;
const ANIM_DURATION = 420; 

let startState: AnimatedState | null = null;
let targetState: AnimatedState | null = null;

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

function renderCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const colorBg = cachedColors.bg || '#080808';
  const colors = {
    default: cachedColors.default || '#232323',
    border: cachedColors.border || '#2b2b2b',
    compare: cachedColors.compare || '#FBBF24',
    found: cachedColors.found || '#10B981',
    dimmed: cachedColors.dimmed || 'rgba(35, 35, 35, 0.27)',
    text: cachedColors.text || '#FFFFFF',
    dimmedText: cachedColors.dimmedText || '#FFFFFF55',
    muted: cachedColors.muted || '#94A3B8',
    low: cachedColors.low || '#3B82F6',
    high: cachedColors.high || '#EF4444',
  };

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = colorBg;
  ctx.fillRect(0, 0, w, h);

  const frame = props.frame;
  if (!frame || frame.dataState.length === 0) return;

  
  drawBoxArray(ctx, w, h, frame, colors, animatedState.value ?? undefined);
}


function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

function animateFrame(now: number): void {
  if (!startState || !targetState) return;

  const elapsed = now - animStartTime;
  const progress = Math.min(1, elapsed / ANIM_DURATION);
  const t = easeOutQuart(progress);

  
  animatedState.value = {
    low: startState.low + (targetState.low - startState.low) * t,
    lowOpacity: startState.lowOpacity + (targetState.lowOpacity - startState.lowOpacity) * t,
    high: startState.high + (targetState.high - startState.high) * t,
    highOpacity: startState.highOpacity + (targetState.highOpacity - startState.highOpacity) * t,
    mid: startState.mid + (targetState.mid - startState.mid) * t,
    midOpacity: startState.midOpacity + (targetState.midOpacity - startState.midOpacity) * t,
    opacities: startState.opacities.map((v, idx) => v + ((targetState?.opacities[idx] ?? v) - v) * t),
    crosses: startState.crosses.map((v, idx) => v + ((targetState?.crosses[idx] ?? v) - v) * t)
  };

  renderCanvas();

  if (progress < 1) {
    animationFrameId = requestAnimationFrame(animateFrame);
  } else {
    animationFrameId = null;
  }
}


watch(() => props.frame, (newFrame) => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (!newFrame || newFrame.dataState.length === 0) {
    animatedState.value = null;
    renderCanvas();
    return;
  }

  const n = newFrame.dataState.length;
  
  
  const tLow = newFrame.highlights.low ?? (animatedState.value?.low ?? 0);
  const tLowOp = newFrame.highlights.low != null ? 1.0 : 0.0;
  
  const tHigh = newFrame.highlights.high ?? (animatedState.value?.high ?? n - 1);
  const tHighOp = newFrame.highlights.high != null ? 1.0 : 0.0;
  
  const tMid = newFrame.highlights.mid ?? (animatedState.value?.mid ?? 0);
  const tMidOp = newFrame.highlights.mid != null ? 1.0 : 0.0;

  const tOpacities = Array.from({ length: n }, (_, i) => newFrame.highlights.dimmed.includes(i) ? 0.25 : 1.0);
  const tCrosses = Array.from({ length: n }, (_, i) => newFrame.highlights.dimmed.includes(i) ? 1.0 : 0.0);

  const nextTargetState: AnimatedState = {
    low: tLow,
    lowOpacity: tLowOp,
    high: tHigh,
    highOpacity: tHighOp,
    mid: tMid,
    midOpacity: tMidOp,
    opacities: tOpacities,
    crosses: tCrosses
  };

  if (!animatedState.value || animatedState.value.opacities.length !== n) {
    
    animatedState.value = nextTargetState;
    renderCanvas();
  } else {
    
    startState = { ...animatedState.value };
    targetState = nextTargetState;
    animStartTime = performance.now();
    animationFrameId = requestAnimationFrame(animateFrame);
  }
}, { deep: true });

onMounted(() => {
  cacheColors();
  resizeObserver = new ResizeObserver(resizeCanvas);
  if (containerRef.value) resizeObserver.observe(containerRef.value);
  resizeCanvas();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.vis-canvas-container {
  background-color: var(--canvas-bg);
}
</style>
