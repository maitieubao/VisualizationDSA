<template>
  <div ref="containerRef" class="w-full h-full vis-canvas-container relative">
    <canvas ref="canvasRef" class="w-full h-full block" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { FrameDTO } from '../../types/algorithm.types';

const props = defineProps<{
  frame: FrameDTO | null;
}>();

const MARGIN = 40;
const MARGIN_BOTTOM = 40;
const PADDING_TOP = 20;
const GAP = 6;

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

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

function determineColor(index: number, frame: FrameDTO, colors: Record<string, string>): string {
  if (frame.highlights.sorted.includes(index)) return colors.sorted;
  if (frame.highlights.pivot === index) return colors.pivot;
  if (frame.highlights.swap.includes(index)) return colors.swap;
  if (frame.highlights.compare.includes(index)) return colors.compare;
  return colors.default;
}

function renderCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Retrieve theme colors dynamically
  const style = getComputedStyle(document.documentElement);
  const colorBg = style.getPropertyValue('--canvas-bg').trim() || '#080808';
  const colorDefault = style.getPropertyValue('--color-accent-cyan').trim() || '#38BDF8';
  const colorCompare = style.getPropertyValue('--color-accent-yellow').trim() || '#FBBF24';
  const colorSwap = style.getPropertyValue('--color-accent-red').trim() || '#EF4444';
  const colorSorted = style.getPropertyValue('--color-accent-green').trim() || '#10B981';
  const colorPivot = style.getPropertyValue('--color-accent-purple').trim() || '#8B5CF6';
  const colorText = style.getPropertyValue('--color-text-primary').trim() || '#FFFFFF';
  const colorMuted = style.getPropertyValue('--color-text-muted').trim() || '#94A3B8';

  const colors = {
    default: colorDefault,
    compare: colorCompare,
    swap: colorSwap,
    sorted: colorSorted,
    pivot: colorPivot
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

  const n = frame.dataState.length;
  const maxVal = Math.max(...frame.dataState, 1);
  
  // Dynamic gap based on element count to optimize spacing
  const gapVal = Math.max(2, Math.min(6, 120 / n));
  const colW = (w - gapVal * (n - 1) - MARGIN * 2) / n;
  const drawableHeight = h - PADDING_TOP - MARGIN_BOTTOM;

  for (let i = 0; i < n; i++) {
    const val = frame.dataState[i];
    const barH = (val / maxVal) * drawableHeight;
    const x = MARGIN + i * (colW + gapVal);
    const y = h - MARGIN_BOTTOM - barH;

    ctx.fillStyle = determineColor(i, frame, colors);
    ctx.beginPath();
    ctx.roundRect(x, y, colW, barH, 4); // Smoother round corners
    ctx.fill();

    // Draw value label above the bar
    if (colW >= 12) {
      ctx.fillStyle = colorText;
      ctx.font = `bold ${Math.min(12, Math.max(8, colW * 0.5))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x + colW / 2, Math.max(y - 6, PADDING_TOP - 4));
    }

    // Auto-hide STT labels under columns if element count N > 12
    if (n <= 12 && colW >= 14) {
      ctx.fillStyle = colorMuted;
      ctx.font = `${Math.min(10, Math.max(8, colW * 0.4))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`[${i}]`, x + colW / 2, h - MARGIN_BOTTOM + 16);
    }
  }
}

watch(() => props.frame, renderCanvas, { deep: true });

onMounted(() => {
  resizeObserver = new ResizeObserver(resizeCanvas);
  if (containerRef.value) resizeObserver.observe(containerRef.value);
  resizeCanvas();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.vis-canvas-container {
  background-color: var(--canvas-bg);
}
</style>

