<template>
  <router-link
    :to="`/lessons/${lessonId}`"
    class="lesson-list-item group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border"
    :class="[
      status === 'completed'
        ? 'border-accent-green/20 bg-accent-green/20 hover:bg-accent-green/20'
        : status === 'in-progress'
        ? 'border-accent-warm/20 bg-accent-warm/20 hover:bg-amber-950/40'
        : 'border-border-default bg-bg-surface hover:bg-bg-surface hover:border-border-default'
    ]"
  >
    
    <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
      :class="[
        status === 'completed'
          ? 'bg-accent-green/20 text-accent-green'
          : status === 'in-progress'
          ? 'bg-accent-warm/20 text-accent-warm'
          : 'bg-bg-hover text-text-muted'
      ]"
    >
      <span v-if="status === 'completed'"><BaseIcon name="check" class="w-3.5 h-3.5" /></span>
      <span v-else-if="status === 'in-progress'">◐</span>
      <span v-else>{{ order }}</span>
    </div>

    
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2.5">
        <h4 class="text-sm font-medium text-text-primary truncate">{{ title }}</h4>
        <span
          class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
          :class="statusBadgeClass"
        >
          {{ statusLabel }}
        </span>
      </div>
      <div class="flex items-center gap-3 mt-0.5 text-[10px] text-text-muted">
        <span v-if="quizScore !== null">Quiz: {{ quizScore }}/{{ totalQuestions }} điểm</span>
        <span v-if="xpEarned > 0">• +{{ xpEarned }} XP</span>
        <span v-else>• Chưa có tiến độ</span>
      </div>
    </div>

    
    <div class="flex-shrink-0 text-text-muted group-hover:text-text-secondary transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCourseStore } from '../store/useCourseStore';

const props = defineProps<{
  lessonId: string;
  title: string;
  order: number;
  totalQuestions?: number;
}>();

const courseStore = useCourseStore();

const status = computed(() => courseStore.getLessonStatus(props.lessonId));
const quizScore = computed(() => courseStore.getLessonQuizScore(props.lessonId));
const xpEarned = computed(() => courseStore.getLessonXpEarned(props.lessonId));

const statusLabel = computed(() => {
  switch (status.value) {
    case 'completed': return 'Hoàn thành';
    case 'in-progress': return 'Đang học';
    default: return 'Chưa bắt đầu';
  }
});

const statusBadgeClass = computed(() => {
  switch (status.value) {
    case 'completed': return 'bg-accent-green/20 text-accent-green border border-accent-green/30';
    case 'in-progress': return 'bg-accent-warm/20 text-accent-warm border border-accent-warm/30';
    default: return 'bg-bg-hover text-text-secondary border border-border-default';
  }
});
</script>
