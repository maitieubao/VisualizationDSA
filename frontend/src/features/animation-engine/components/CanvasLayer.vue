<template>
  <div ref="containerRef" class="relative w-full h-full bg-[var(--canvas-bg)] overflow-hidden">
    <canvas
      ref="canvasRef"
      class="w-full h-full block"
      :class="{ 'canvas-interactive-target-mode': quizStore.isCanvasTargetMode }"
    />

    
    <AnimationHud
      v-if="currentFrame"
      :stepId="currentFrame.stepId"
      :totalSteps="totalSteps"
      :explanation="currentFrame.explanation"
    />

    
    <div v-if="!currentFrame" class="absolute inset-0 flex items-center justify-center">
      <p class="text-sm text-text-muted text-center px-8">
        Vui lòng nhập dữ liệu hoặc sinh mảng ngẫu nhiên để bắt đầu trực quan hóa.
      </p>
    </div>

    
    <AnimationProgressBar :progressPercent="progressPercent" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAnimationCanvas } from '../composables/useAnimationCanvas';
import { useQuizStore } from '../../quiz-system/store/useQuizStore';
import AnimationHud from './AnimationHud.vue';
import AnimationProgressBar from './AnimationProgressBar.vue';

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const quizStore = useQuizStore();

const {
  currentFrame,
  totalSteps,
  progressPercent,
} = useAnimationCanvas(canvasRef, containerRef);
</script>

<style scoped>
/* QZ-004: trỏ chuột hình chữ thập khi quiz đang chờ click node (spec 02-ui-ux.md:114) */
.canvas-interactive-target-mode {
  cursor: crosshair !important;
}
</style>
