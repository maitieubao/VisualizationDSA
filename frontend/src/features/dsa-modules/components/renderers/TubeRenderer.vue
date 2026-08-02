<template>
  <div ref="containerRef" class="w-full h-full bg-[var(--canvas-bg)] relative">
    <canvas ref="canvasRef" class="w-full h-full block" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { FrameDTO } from '../../types/algorithm.types';
import { renderStack, renderQueue } from './tubeRenderHelpers';

const props = defineProps<{
  frame: FrameDTO | null;
  mode: 'stack' | 'queue';
}>();

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

function renderCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const style = getComputedStyle(document.documentElement);
  const colorBg = style.getPropertyValue('--canvas-bg').trim() || '#080808';
  const colors = {
    cell: style.getPropertyValue('--color-bg-active').trim() || '#232323',
    border: style.getPropertyValue('--color-border-default').trim() || '#475569',
    active: style.getPropertyValue('--color-accent-cyan').trim() || '#38BDF8',
    remove: style.getPropertyValue('--color-accent-red').trim() || '#EF4444',
    text: style.getPropertyValue('--color-text-primary').trim() || '#FFFFFF',
    muted: style.getPropertyValue('--color-text-muted').trim() || '#94A3B8',
  };

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = colorBg;
  ctx.fillRect(0, 0, w, h);

  const frame = props.frame;
  if (!frame) return;

  if (frame.dataState.length === 0) {
    ctx.fillStyle = colors.muted;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(props.mode === 'stack' ? 'Ngăn xếp rỗng' : 'Hàng đợi rỗng', w / 2, h / 2);
    return;
  }

  if (props.mode === 'stack') {
    renderStack(ctx, w, h, frame, colors);
  } else {
    renderQueue(ctx, w, h, frame, colors);
  }
}

watch([() => props.frame, () => props.mode], renderCanvas, { deep: true });

onMounted(() => {
  resizeObserver = new ResizeObserver(resizeCanvas);
  if (containerRef.value) resizeObserver.observe(containerRef.value);
  resizeCanvas();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>
