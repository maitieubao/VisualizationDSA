<template>
  <Transition name="summary-fade">
    <div v-if="visible" class="summary-overlay" role="dialog" aria-modal="true" aria-labelledby="quiz-summary-title">
      <div ref="summaryCardRef" class="summary-card" tabindex="-1">
        
        <div class="summary-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" class="svg-icon-green">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
          <h3 id="quiz-summary-title" class="summary-title">Tổng kết trắc nghiệm</h3>
        </div>

        <QuizSummaryBadges :correct="correct" :total="total" :streak="streak" />

        <p class="summary-message">{{ summaryMessage }}</p>

        <QuizSummaryActions @retry="$emit('retry')" @close="$emit('close')" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { QuizStatsManager } from '../engine/QuizStatsManager';
import QuizSummaryBadges from './QuizSummaryBadges.vue';
import QuizSummaryActions from './QuizSummaryActions.vue';

const props = defineProps<{ visible: boolean; correct: number; total: number }>();
const emit = defineEmits<{ retry: []; close: [] }>();

const streak = computed(() => QuizStatsManager.getStats().streak);

const accuracy = computed(() =>
  props.total === 0 ? 0 : Math.round((props.correct / props.total) * 100)
);

const summaryMessage = computed(() => {
  if (accuracy.value >= 80) return 'Xuất sắc! Bạn đã nắm vững kiến thức thuật toán này.';
  if (accuracy.value >= 50) return 'Khá tốt! Hãy ôn lại lý thuyết để cải thiện thêm.';
  return 'Cần cố gắng hơn! Xem lại bài giảng và thử lại nhé.';
});

// ─── QZ-038: dialog semantics + Escape đóng summary + focus trap ───
const summaryCardRef = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;
let summaryKeyHandler: ((event: KeyboardEvent) => void) | null = null;

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )).filter(el => !el.hasAttribute('disabled'));
}

function activateSummaryDialog(): void {
  const card = summaryCardRef.value;
  if (!card) return;
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  card.focus({ preventScroll: true });
  summaryKeyHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      emit('close');
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = getFocusableElements(card);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    const isInside = active !== null && card.contains(active);
    if (event.shiftKey) {
      if (active === first || !isInside) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !isInside) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', summaryKeyHandler);
}

function deactivateSummaryDialog(): void {
  if (summaryKeyHandler !== null) {
    document.removeEventListener('keydown', summaryKeyHandler);
    summaryKeyHandler = null;
  }
  if (previouslyFocused !== null) {
    previouslyFocused.focus({ preventScroll: true });
    previouslyFocused = null;
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      void nextTick(activateSummaryDialog);
    } else {
      deactivateSummaryDialog();
    }
  },
  { flush: 'post' },
);

onBeforeUnmount(deactivateSummaryDialog);
</script>

<style scoped>
.summary-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: color-mix(in srgb, var(--color-bg-primary) 65%, transparent); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); display: flex; align-items: center; justify-content: center; /* QZ-041: đồng bộ z-index 2000 với QuizCardOverlay (spec 02-ui-ux.md:27) */ z-index: 2000; }
.summary-card { width: 90%; max-width: 420px; background: color-mix(in srgb, var(--color-bg-surface) 92%, transparent); border: 1px solid color-mix(in srgb, var(--color-accent-green) 20%, transparent); border-radius: var(--radius-2xl); padding: 28px 32px; box-shadow: var(--shadow-xl), 0 0 20px var(--color-accent-green-glow); }
.summary-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.summary-title { font-size: 16px; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.summary-message { font-size: 13px; color: var(--color-text-secondary); text-align: center; line-height: 1.6; margin: 0 0 20px; }
.svg-icon-green { color: var(--color-accent-green); }
.summary-fade-enter-active { animation: fadeInOverlay 0.3s ease forwards; }
.summary-fade-leave-active { animation: fadeOutOverlay 0.25s ease-out forwards; }
@keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOutOverlay { from { opacity: 1; } to { opacity: 0; } }
</style>
