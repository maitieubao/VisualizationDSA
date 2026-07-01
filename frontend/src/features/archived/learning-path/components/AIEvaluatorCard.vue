<template>
  <div
    v-if="recommendation.recommendedNodeId || recommendation.recommendationReason"
    class="ai-evaluator-card"
  >
    <div class="flex items-center gap-2 mb-3">
      <span class="text-accent-yellow text-lg">🧠</span>
      <h3 class="text-sm font-bold text-accent-yellow uppercase tracking-wider">
        AI Path Advisor
      </h3>
    </div>

    <p class="text-sm text-text-secondary leading-relaxed mb-4">
      {{ recommendation.recommendationReason }}
    </p>

    <div v-if="recommendation.recommendedNodeId" class="flex items-center gap-3">
      <button
        @click="$emit('navigate-to', recommendation.recommendedNodeId)"
        class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300"
        :class="isReviewMode
          ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/50 hover:bg-accent-yellow/30'
          : 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30'"
      >
        {{ isReviewMode ? 'Ôn Tập Ngay' : 'Bắt Đầu Học' }}
      </button>

      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full" :class="isReviewMode ? 'bg-accent-yellow' : 'bg-accent-cyan'" />
        <span class="text-[10px] text-text-muted">
          {{ isReviewMode ? 'Cần ôn tập' : 'Sẵn sàng' }}
        </span>
      </div>
    </div>

    <!-- Completion banner -->
    <div
      v-if="!recommendation.recommendedNodeId && recommendation.recommendationReason"
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green/10 border border-accent-green/30"
    >
      <span class="text-accent-green">🏆</span>
      <span class="text-xs text-accent-green font-medium">Hoàn thành toàn bộ lộ trình!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AIRecommendation } from '../types/learning-path.types';

const props = defineProps<{
  recommendation: AIRecommendation;
  isReviewMode: boolean;
}>();

defineEmits<{
  (e: 'navigate-to', nodeId: string): void;
}>();
</script>

<style scoped>
.ai-evaluator-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.1);
}
</style>
