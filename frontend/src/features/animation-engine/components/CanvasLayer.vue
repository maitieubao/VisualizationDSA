<template>
  <div ref="containerRef" class="relative w-full h-full bg-[var(--canvas-bg)] overflow-hidden">
    <canvas ref="canvasRef" class="w-full h-full block" />

    <!-- HUD Step Description -->
    <AnimationHud
      v-if="currentFrame"
      :stepId="currentFrame.stepId"
      :totalSteps="totalSteps"
      :explanation="currentFrame.explanation"
    />

    <!-- Empty state -->
    <div v-if="!currentFrame" class="absolute inset-0 flex items-center justify-center">
      <p class="text-sm text-text-muted text-center px-8">
        Vui lòng nhập dữ liệu hoặc sinh mảng ngẫu nhiên để bắt đầu trực quan hóa.
      </p>
    </div>

    <!-- Progress bar -->
    <AnimationProgressBar :progressPercent="progressPercent" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAnimationCanvas } from '../composables/useAnimationCanvas';
import AnimationHud from './AnimationHud.vue';
import AnimationProgressBar from './AnimationProgressBar.vue';

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const {
  currentFrame,
  totalSteps,
  progressPercent,
} = useAnimationCanvas(canvasRef, containerRef);
</script>
