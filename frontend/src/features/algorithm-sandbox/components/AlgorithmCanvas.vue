<template>
  <div
    class="canvas-container relative w-full h-[400px] rounded-2xl border overflow-hidden shadow-2xl"
    ref="container"
  >
    <!-- background grid -->
    <div class="canvas-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

    <canvas
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
    ></canvas>

    <!-- HUD Info -->
    <div class="absolute top-4 left-4 pointer-events-none select-none flex flex-col gap-1">
      <div class="text-xs font-semibold uppercase tracking-wider text-accent-cyan">DSA Viewport</div>
      <div class="text-lg font-bold text-text-primary drop-shadow-md">{{ currentStepDescription }}</div>
    </div>

    <!-- Viewport Controls -->
    <div class="viewport-controls absolute top-4 right-4 flex items-center gap-2 backdrop-blur border p-1.5 rounded-xl shadow-lg">
      <button
        @click="handleResetViewport"
        class="reset-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
        title="Reset camera zoom & position"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        <span>Reset view</span>
      </button>
      <div class="divider h-4 w-px"></div>
      <div class="text-[11px] font-mono text-accent-cyan px-2">Zoom: {{ Math.round(camera.zoom * 100) }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAlgorithmCanvasController } from '../composables/useAlgorithmCanvasController';

const canvas = ref<HTMLCanvasElement | null>(null);
const container = ref<HTMLDivElement | null>(null);

const {
  camera,
  currentStepDescription,
  handleResetViewport,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
} = useAlgorithmCanvasController(canvas, container);
</script>

<style scoped>
.canvas-container {
  background-color: var(--color-bg-primary);
  border-color: color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
  box-shadow: var(--shadow-cyan);
}

.canvas-grid {
  background-image: 
    linear-gradient(to right, var(--color-border-default) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-border-default) 1px, transparent 1px);
  background-size: 4rem 4rem;
}

.viewport-controls {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 85%, transparent);
  border-color: color-mix(in srgb, var(--color-border-default) 60%, transparent);
}

.reset-btn {
  color: var(--color-text-secondary);
}

.reset-btn:hover {
  color: var(--color-text-primary);
  background-color: color-mix(in srgb, var(--color-bg-hover) 80%, transparent);
}

.divider {
  background-color: var(--color-border-subtle);
}

.viewport-controls button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
