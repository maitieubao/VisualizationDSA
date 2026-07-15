<template>
  <div class="debug-canvas-container">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-2 border-b"
      style="border-color: rgba(255, 255, 255, 0.05); background: rgba(30, 41, 59, 0.6);"
    >
      <div class="w-2 h-2 rounded-full bg-accent-green"></div>
      <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">
        Array State
      </span>
      <span class="ml-auto text-[10px] text-text-muted font-mono">
        {{ arrayState.length }} phan tu
      </span>
    </div>

    <!-- Canvas -->
    <div class="flex-1 min-h-0 p-3">
      <canvas
        ref="canvasRef"
        class="w-full h-full rounded-lg"
        style="background: rgba(15, 23, 42, 0.6);"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  arrayState: number[];
  currentLine: number | null;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animFrameId = 0;

function drawBars(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  const arr = props.arrayState;
  if (arr.length === 0) {
    ctx.fillStyle = '#64748B';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Mang rong', width / 2, height / 2);
    return;
  }

  const maxVal = Math.max(...arr, 1);
  const barGap = 4;
  const barWidth = Math.max(8, (width - (arr.length + 1) * barGap) / arr.length);
  const maxBarHeight = height - 40;

  for (let i = 0; i < arr.length; i++) {
    const barHeight = (arr[i] / maxVal) * maxBarHeight;
    const x = barGap + i * (barWidth + barGap);
    const y = height - 20 - barHeight;

    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, '#06B6D4');
    gradient.addColorStop(1, '#0891B2');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 3);
    ctx.fill();

    ctx.shadowColor = 'rgba(6, 182, 212, 0.3)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#CBD5E1';
    ctx.font = `${Math.min(11, barWidth - 2)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(String(arr[i]), x + barWidth / 2, height - 6);
  }
}

function scheduleRedraw(): void {
  cancelAnimationFrame(animFrameId);
  animFrameId = requestAnimationFrame(drawBars);
}

watch(() => props.arrayState, scheduleRedraw, { deep: true });
watch(() => props.currentLine, scheduleRedraw);

onMounted(() => {
  scheduleRedraw();
  window.addEventListener('resize', scheduleRedraw);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId);
  window.removeEventListener('resize', scheduleRedraw);
});
</script>

<style scoped>
.debug-canvas-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  overflow: hidden;
}
</style>
