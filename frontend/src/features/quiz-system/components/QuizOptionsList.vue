<template>
  <div v-if="options && type !== 'CANVAS_TARGET'" class="quiz-options">
    <button
      v-for="(option, idx) in options"
      :key="idx"
      class="quiz-option-btn"
      :class="{
        'option-selected':  selectedIndex === idx && !isSubmitted,
        'option-correct':   isSubmitted && idx === correctIndex,
        'option-incorrect': isSubmitted && selectedIndex === idx && idx !== correctIndex,
        'option-disabled':  isSubmitted,
      }"
      :disabled="isSubmitted"
      @click="$emit('select', idx)"
    >
      <span class="option-letter">{{ letters[idx] }}</span>
      <span class="option-text">{{ option }}</span>
      <span v-if="isSubmitted && idx === correctIndex" class="option-icon correct-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 7" /></svg>
      </span>
      <span v-if="isSubmitted && selectedIndex === idx && idx !== correctIndex" class="option-icon incorrect-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options?: string[];
  type?: string;
  selectedIndex: number | null;
  isSubmitted: boolean;
  correctIndex?: number;
}>();
defineEmits<{ select: [number] }>();
const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
</script>

<style scoped>
.quiz-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.quiz-option-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; text-align: left; font-family: var(--font-sans); font-size: 13.5px; color: var(--color-text-primary); background: color-mix(in srgb, var(--color-bg-secondary) 30%, transparent); border: 1px solid var(--color-border-subtle); border-radius: 14px; cursor: pointer; transition: var(--transition-smooth); }
.quiz-option-btn:hover:not(.option-disabled) { background: var(--color-bg-hover); border-color: var(--color-border-strong); transform: translateY(-1px); }
.quiz-option-btn.option-selected  { border-color: color-mix(in srgb, var(--color-accent-blue) 50%, transparent); background: var(--color-accent-blue-dim); }
.quiz-option-btn.option-correct   { border-color: var(--color-accent-green); background: var(--color-accent-green-dim); color: var(--color-accent-green-light); }
.quiz-option-btn.option-incorrect { border-color: var(--color-accent-red); background: var(--color-accent-red-dim); color: var(--color-accent-red-light); }
.quiz-option-btn.option-disabled  { cursor: default; opacity: 0.85; }
.option-letter { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 8px; background: var(--color-bg-hover); border: 1px solid var(--color-border-subtle); font-size: 12px; font-weight: 700; color: var(--color-text-secondary); flex-shrink: 0; }
.option-text { flex: 1; line-height: 1.4; }
.option-icon { flex-shrink: 0; display: flex; align-items: center; }
.correct-icon { color: var(--color-accent-green); }
.incorrect-icon { color: var(--color-accent-red); }
</style>
