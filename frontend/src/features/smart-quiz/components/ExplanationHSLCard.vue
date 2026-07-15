<template>
  <div
    class="mt-4 rounded-xl p-4 transition-all duration-300"
    :class="isCorrect ? 'quiz-feedback-banner-correct' : 'quiz-feedback-banner-incorrect'"
  >
    <!-- Result Header -->
    <div class="flex items-center gap-2 mb-2">
      <span class="text-lg">{{ isCorrect ? '✓' : '✗' }}</span>
      <span class="font-bold text-sm">
        {{ isCorrect ? 'Chính xác!' : 'Chưa đúng' }}
      </span>
      <span class="ml-auto text-[10px] font-mono opacity-70">
        {{ scorePercentage }}%
      </span>
    </div>

    <!-- XP Reward -->
    <div
      v-if="isCorrect && xpAwarded > 0"
      class="mb-3 px-3 py-1.5 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 flex items-center gap-2"
    >
      <span class="text-accent-yellow text-xs font-bold">+{{ xpAwarded }} XP</span>
      <span class="text-accent-yellow/60 text-[10px]">Thưởng lần đầu!</span>
    </div>

    <!-- Explanation Text -->
    <p class="text-xs leading-relaxed opacity-80">
      {{ explanation }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isCorrect: boolean;
  scorePercentage: number;
  explanation: string;
  xpAwarded: number;
}>();
</script>

<style scoped>
.quiz-feedback-banner-correct {
  border: 1px solid rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.08);
  color: #34D399;
  filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.2));
}

.quiz-feedback-banner-incorrect {
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
  color: #F87171;
}
</style>
