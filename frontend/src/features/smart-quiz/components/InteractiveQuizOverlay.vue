<template>
  <div
    class="smart-quiz-overlay-panel"
    :class="{
      'is-active': store.overlayStatus === 'SLIDE_IN' || store.overlayStatus === 'SUBMITTED',
      'is-shake': shakeActive,
    }"
  >
    <!-- Quiz Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center">
          <span class="text-accent text-sm font-bold">?</span>
        </div>
        <h3 class="text-text-primary font-semibold text-sm">Trắc Nghiệm Tương Tác</h3>
      </div>
      <span
        v-if="store.activeQuiz"
        class="text-[10px] px-2 py-0.5 rounded-full font-mono"
        :class="questionTypeBadgeClass"
      >
        {{ questionTypeLabel }}
      </span>
    </div>

    <!-- Prompt Text -->
    <p
      v-if="store.activeQuiz"
      class="text-text-secondary text-sm leading-relaxed mb-4"
    >
      {{ store.activeQuiz.promptText }}
    </p>

    <!-- Multiple Choice Options -->
    <div
      v-if="store.activeQuiz?.questionType === 'MULTIPLE_CHOICE' && store.activeQuiz.options"
      class="space-y-2 mb-4"
    >
      <button
        v-for="option in store.activeQuiz.options"
        :key="option.id"
        @click="store.toggleAnswerSelection(option.id)"
        class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border"
        :class="optionClass(option.id)"
        :disabled="store.evaluationResult.hasSubmitted"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- SVG / Monaco Click Hint -->
    <div
      v-if="store.activeQuiz?.questionType !== 'MULTIPLE_CHOICE' && !store.evaluationResult.hasSubmitted"
      class="mb-4 px-3 py-2 rounded-lg border border-accent-cyan/20 bg-accent-cyan/5"
    >
      <p class="text-accent text-[11px]">
        <span v-if="store.activeQuiz?.questionType === 'SVG_NODE_CLICK'">
          👆 Click chọn các phần tử trên Canvas SVG bên trái
        </span>
        <span v-else>
          👆 Click chọn dòng code trong Monaco Editor
        </span>
      </p>
      <p class="text-text-muted text-[10px] mt-1">
        Đã chọn: {{ store.selectionCount }} / {{ store.maxSelections }}
      </p>
    </div>

    <!-- Selected Answers Display (SVG/Monaco) -->
    <div
      v-if="store.selectedAnswers.length > 0 && store.activeQuiz?.questionType !== 'MULTIPLE_CHOICE'"
      class="flex flex-wrap gap-1 mb-3"
    >
      <span
        v-for="ans in store.selectedAnswers"
        :key="ans"
        class="px-2 py-0.5 rounded text-[10px] font-mono bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20"
      >
        {{ ans }}
      </span>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button
        v-if="!store.evaluationResult.hasSubmitted"
        @click="handleSubmit"
        :disabled="!store.canSubmit"
        class="flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200"
        :class="store.canSubmit
          ? 'bg-accent hover:bg-accent-light text-text-primary shadow-lg shadow-cyan-600/20'
          : 'bg-bg-active text-text-muted cursor-not-allowed'"
      >
        SUBMIT
      </button>

      <button
        v-if="store.evaluationResult.hasSubmitted && !store.evaluationResult.isCorrect"
        @click="store.retryQuiz()"
        class="flex-1 px-4 py-2 rounded-lg text-xs font-bold bg-accent-yellow hover:bg-accent-yellow text-text-primary transition-colors"
      >
        THỬ LẠI
      </button>

      <button
        v-if="store.evaluationResult.hasSubmitted"
        @click="store.closeQuiz()"
        class="flex-1 px-4 py-2 rounded-lg text-xs font-bold bg-bg-active hover:bg-bg-hover text-text-secondary transition-colors"
      >
        TIẾP TỤC
      </button>
    </div>

    <!-- Evaluation Feedback -->
    <ExplanationHSLCard
      v-if="store.evaluationResult.hasSubmitted && store.activeQuiz"
      :is-correct="store.evaluationResult.isCorrect"
      :score-percentage="store.evaluationResult.scorePercentage"
      :explanation="store.activeQuiz.explanationMarkdown"
      :xp-awarded="store.xpAwarded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
import { useSmartQuizStore } from '../store/useSmartQuizStore';
import ExplanationHSLCard from './ExplanationHSLCard.vue';

const store = useSmartQuizStore();

const shakeActive = ref(false);

const questionTypeLabel = computed(() => {
  switch (store.activeQuiz?.questionType) {
    case 'SVG_NODE_CLICK': return 'SVG Click';
    case 'MONACO_LINE_CLICK': return 'Monaco';
    case 'MULTIPLE_CHOICE': return 'Trắc nghiệm';
    default: return '';
  }
});

const questionTypeBadgeClass = computed(() => {
  switch (store.activeQuiz?.questionType) {
    case 'SVG_NODE_CLICK':
      return 'bg-accent-cyan/10 text-accent border border-accent-cyan/20';
    case 'MONACO_LINE_CLICK':
      return 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20';
    case 'MULTIPLE_CHOICE':
      return 'bg-accent-green/10 text-accent-green border border-accent-green/20';
    default:
      return 'bg-bg-hover/10 text-text-secondary';
  }
});

function optionClass(optionId: string): string {
  const isSelected = store.selectedAnswers.includes(optionId);
  if (store.evaluationResult.hasSubmitted) {
    const isCorrect = store.activeQuiz?.correctAnswers.includes(optionId);
    if (isCorrect) return 'correct-option text-accent-green';
    if (isSelected && !isCorrect) return 'incorrect-option text-accent-red';
    return 'border-border-default bg-bg-surface/50 text-text-muted';
  }
  if (isSelected) return 'selected-option text-accent-yellow';
  return 'border-border-default bg-bg-surface/50 text-text-secondary hover:border-accent-cyan/30 hover:bg-accent-cyan/5';
}

function handleSubmit(): void {
  const isCorrect = store.submitAnswers();
  if (!isCorrect) {
    shakeActive.value = true;
    setTimeout(() => {
      shakeActive.value = false;
    }, 400);
  }
}
</script>

<style scoped>
.smart-quiz-overlay-panel {
  position: absolute;
  top: 20px;
  right: -380px;
  width: 340px;
  background: rgba(10, 15, 30, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  z-index: 100;
  transition: right 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.smart-quiz-overlay-panel.is-active {
  right: 20px;
}

.smart-quiz-overlay-panel.is-shake {
  animation: quiz-shake 0.4s ease-in-out;
}

@keyframes quiz-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.correct-option {
  border-color: color-mix(in srgb, var(--color-accent-green) 40%, transparent) !important;
  background-color: color-mix(in srgb, var(--color-accent-green) 10%, transparent) !important;
}
.incorrect-option {
  border-color: color-mix(in srgb, var(--color-accent-red) 40%, transparent) !important;
  background-color: color-mix(in srgb, var(--color-accent-red) 10%, transparent) !important;
}
.selected-option {
  border-color: color-mix(in srgb, var(--color-accent-yellow) 40%, transparent) !important;
  background-color: color-mix(in srgb, var(--color-accent-yellow) 10%, transparent) !important;
}
</style>
