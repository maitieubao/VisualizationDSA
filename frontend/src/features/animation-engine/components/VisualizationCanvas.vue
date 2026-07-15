<template>
  <div class="canvas-wrapper">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="canvas-loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <CanvasLayer />
    <LectureOverlay />
    <QuizCardOverlay />

    <QuizSummaryCard
      :visible="showQuizSummary"
      :correct="sessionCorrect"
      :total="sessionTotal"
      @retry="$emit('retry')"
      @close="$emit('close-summary')"
    />

    <button v-if="showLectureBtn" class="e-lecture-btn" @click="$emit('open-lecture')" title="Mở bài giảng điện tử">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" /><path d="M6 10h10" />
      </svg>
      <span>E-Lecture</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import CanvasLayer from './CanvasLayer.vue';
import { LectureOverlay } from '../../e-lecture';
import { QuizCardOverlay, QuizSummaryCard } from '../../quiz-system';

defineProps<{
  isLoading: boolean;
  showQuizSummary: boolean;
  sessionCorrect: number;
  sessionTotal: number;
  showLectureBtn: boolean;
}>();

defineEmits<{ retry: []; 'close-summary': []; 'open-lecture': [] }>();
</script>

<style scoped>
.canvas-wrapper {
  flex: 6;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-md);
  position: relative;
}

/* Loading overlay */
.canvas-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-spinner {
  width: 2rem; height: 2rem;
  border-radius: 50%;
  border: 2px solid var(--color-accent-cyan);
  border-top-color: transparent;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* E-Lecture button */
.e-lecture-btn {
  position: absolute;
  top: 12px; right: 12px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}
.e-lecture-btn:hover {
  background: var(--color-accent-cyan-dim);
  border-color: var(--color-accent-cyan-glow);
  box-shadow: 0 0 12px var(--color-accent-cyan-glow);
}
</style>
