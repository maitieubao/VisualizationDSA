<template>
  <Transition name="quiz-overlay">
    <div v-if="quizStore.isQuizActive" class="quiz-overlay-wrapper" @click.self="() => {}">
      <div 
        class="quiz-dialog-card" 
        :class="{
          'correct': quizStore.isSubmitted && quizStore.isCorrect,
          'status-incorrect': quizStore.isSubmitted && !quizStore.isCorrect,
        }"
      >
        <!-- Header -->
        <div class="quiz-header">
          <div class="quiz-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            <span>Trắc nghiệm đột xuất</span>
          </div>
          <div class="question-type-badge">{{ questionTypeLabel }}</div>
        </div>

        <!-- Prompt -->
        <p class="quiz-prompt">{{ quizStore.activeQuestion?.prompt }}</p>

        <!-- Canvas Hint -->
        <div v-if="quizStore.activeQuestion?.type === 'CANVAS_TARGET' && !quizStore.isSubmitted" class="canvas-hint">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
          </svg>
          <span>Nhấp trực tiếp vào đỉnh trên Canvas để trả lời</span>
        </div>

        <QuizOptionsList
          :options="quizStore.activeQuestion?.options"
          :type="quizStore.activeQuestion?.type"
          :selected-index="quizStore.selectedAnswerIndex"
          :is-submitted="quizStore.isSubmitted"
          :correct-index="quizStore.activeQuestion?.correctOptionIndex"
          @select="selectOption"
        />

        <!-- Feedback -->
        <Transition name="feedback-fade">
          <div v-if="quizStore.isSubmitted" class="feedback-panel">
            <div class="feedback-title" :class="quizStore.isCorrect ? 'correct' : 'incorrect'">
              <svg v-if="quizStore.isCorrect" class="w-4.5 h-4.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 5 5L20 7" /></svg>
              <svg v-else class="w-4.5 h-4.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" /><path d="M18 6 6 18M6 6l12 12" /></svg>
              <span>{{ quizStore.isCorrect ? 'Chính xác!' : 'Chưa đúng!' }}</span>
            </div>
            <div class="feedback-desc">{{ quizStore.feedbackExplanation }}</div>
          </div>
        </Transition>

        <!-- Continue Button -->
        <div v-if="quizStore.isSubmitted" class="flex justify-end">
          <button class="continue-btn" @click="quizStore.dismissQuestionAndContinue()">
            <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6" /></svg>
            <span>Tiếp tục bài giảng</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../store/useQuizStore';
import QuizOptionsList from './QuizOptionsList.vue';

const quizStore = useQuizStore();

const questionTypeLabel = computed(() => {
  const t = quizStore.activeQuestion?.type;
  return t === 'MULTIPLE_CHOICE' ? 'Nhiều lựa chọn' : t === 'TRUE_FALSE' ? 'Đúng / Sai' : t === 'CANVAS_TARGET' ? 'Nhấp Canvas' : '';
});

const selectOption = (idx: number): void => { if (!quizStore.isSubmitted) quizStore.submitOptionAnswer(idx); };
</script>

<style scoped>
.quiz-overlay-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: color-mix(in srgb, var(--color-bg-primary) 65%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.quiz-dialog-card {
  width: 90%;
  max-w: 520px;
  background-color: color-mix(in srgb, var(--color-bg-surface) 92%, transparent);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-2xl);
  padding: 28px;
  box-shadow: var(--shadow-xl);
  max-height: 85vh;
  overflow-y: auto;
  transition: var(--transition-smooth);
}

.quiz-dialog-card.correct {
  border-color: var(--color-accent-green);
  box-shadow: 0 0 25px var(--color-accent-green-glow);
}

.quiz-dialog-card.status-incorrect {
  border-color: var(--color-accent-red);
  box-shadow: 0 0 25px var(--color-accent-red-glow);
  animation: cssShakeError 0.4s ease-in-out;
}

.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.quiz-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent-cyan);
  background-color: var(--color-accent-cyan-dim);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 25%, transparent);
  padding: 4px 10px;
  border-radius: var(--radius-md);
}

.question-type-badge {
  font-size: 10px;
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
  border: 1px solid var(--color-border-subtle);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.quiz-prompt {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  line-height: 1.625;
  margin: 0 0 20px 0;
  font-family: var(--font-sans);
}

.canvas-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: var(--color-accent-cyan-dim);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
  border-radius: var(--radius-md);
  color: var(--color-accent-cyan);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  margin-bottom: 16px;
}

.feedback-panel {
  padding: 16px;
  background-color: color-mix(in srgb, var(--color-bg-primary) 50%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  margin-bottom: 16px;
}

.feedback-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
}

.feedback-title.correct {
  color: var(--color-accent-green);
}

.feedback-title.incorrect {
  color: var(--color-accent-red);
}

.feedback-desc {
  font-size: 12.5px;
  color: var(--color-text-secondary);
  line-height: 1.625;
  font-family: var(--font-sans);
}

.continue-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background-color: var(--color-accent-green-dim);
  border: 1px solid color-mix(in srgb, var(--color-accent-green) 30%, transparent);
  border-radius: var(--radius-md);
  color: var(--color-accent-green-light);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.continue-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent-green) 25%, transparent);
  border-color: color-mix(in srgb, var(--color-accent-green) 50%, transparent);
  box-shadow: 0 0 12px var(--color-accent-green-glow);
}

@keyframes cssShakeError { 
  0%, 100% { transform: translateX(0); } 
  20%, 60% { transform: translateX(-8px); } 
  40%, 80% { transform: translateX(8px); } 
}

.quiz-overlay-enter-active { animation: fadeInOverlay .3s cubic-bezier(.4,0,.2,1) forwards; }
.quiz-overlay-enter-active .quiz-dialog-card { animation: scaleUpCard .35s cubic-bezier(.34,1.56,.64,1) forwards; }
.quiz-overlay-leave-active { animation: fadeOutOverlay .25s ease-out forwards; }
@keyframes fadeInOverlay  { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOutOverlay { from { opacity: 1; } to { opacity: 0; } }
@keyframes scaleUpCard    { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.feedback-fade-enter-active { transition: opacity .3s ease, transform .3s ease; }
.feedback-fade-enter-from   { opacity: 0; transform: translateY(8px); }
</style>
