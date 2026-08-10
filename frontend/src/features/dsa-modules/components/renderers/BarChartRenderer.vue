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

let cachedColors: Record<string, string> = {};

function cacheColors(): void {
  const style = getComputedStyle(document.documentElement);
  cachedColors = {
    bg: style.getPropertyValue('--canvas-bg').trim() || '#080808',
    default: style.getPropertyValue('--color-accent-cyan').trim() || '#38BDF8',
    compare: style.getPropertyValue('--color-accent-yellow').trim() || '#FBBF24',
    swap: style.getPropertyValue('--color-accent-red').trim() || '#EF4444',
    sorted: style.getPropertyValue('--color-accent-green').trim() || '#10B981',
    pivot: style.getPropertyValue('--color-accent-purple').trim() || '#8B5CF6',
    text: style.getPropertyValue('--color-text-primary').trim() || '#FFFFFF',
    muted: style.getPropertyValue('--color-text-muted').trim() || '#94A3B8',
  };
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

  const colorBg = cachedColors.bg || '#080808';
  const colors = {
    default: cachedColors.default || '#38BDF8',
    compare: cachedColors.compare || '#FBBF24',
    swap: cachedColors.swap || '#EF4444',
    sorted: cachedColors.sorted || '#10B981',
    pivot: cachedColors.pivot || '#8B5CF6',
  };
  const colorText = cachedColors.text || '#FFFFFF';
  const colorMuted = cachedColors.muted || '#94A3B8';

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
  // EC-022: `Math.max(...frame.dataState, 1)` spread vỡ stack với mảng lớn
  // (RangeError: Maximum call stack size exceeded) — duyệt vòng lặp O(n) thay thế.
  let maxVal = 1;
  for (let i = 0; i < n; i++) {
    const v = frame.dataState[i];
    if (v > maxVal) maxVal = v;
  }
  
  
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
    ctx.roundRect(x, y, colW, barH, 4); 
    ctx.fill();

    
    if (colW >= 12) {
      ctx.fillStyle = colorText;
      ctx.font = `bold ${Math.min(12, Math.max(8, colW * 0.5))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x + colW / 2, Math.max(y - 6, PADDING_TOP - 4));
    }

    
    if (n <= 12 && colW >= 14) {
      ctx.fillStyle = colorMuted;
      ctx.font = `${Math.min(10, Math.max(8, colW * 0.4))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`[${i}]`, x + colW / 2, h - MARGIN_BOTTOM + 16);
    }
  }
}

// EC-023: frame là object bất biến — mỗi frame mới là tham chiếu mới, watch theo
// identity đủ; `{ deep: true }` chỉ tốn phí duyệt cây mỗi lần trigger.
watch(() => props.frame, renderCanvas);

onMounted(() => {
  cacheColors();
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
