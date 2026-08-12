<template>
  <div
    class="course-card group relative bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:border-accent/30 flex flex-col"
  >
    
    <div class="relative h-36 overflow-hidden bg-bg-surface shrink-0">
      <CourseCover :course="course" class="w-full h-full" />
      <div class="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />
      <div class="absolute top-3 right-3 flex gap-1.5">
        <span
          v-if="course.isPremium"
          class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-yellow text-black shadow-sm"
        >
          Premium
        </span>
        <span
          class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          :class="difficultyBadgeClass"
        >
          {{ course.difficulty }}
        </span>
        <span
          class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-bg-surface/80 text-text-secondary"
        >
          {{ course.category }}
        </span>
      </div>
    </div>

    
    <div class="p-4 flex flex-col flex-1">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-base font-bold text-text-primary line-clamp-1 mr-2">{{ course.title }}</h3>
        <span class="text-[10px] font-bold text-accent-yellow flex items-center gap-0.5 whitespace-nowrap bg-accent-yellow/30 px-1.5 py-0.5 rounded">
          <BaseIcon name="zap" class="w-3 h-3" />
          {{ course.xpReward }} XP
        </span>
      </div>

      <p class="text-xs text-text-muted line-clamp-2 mb-4 flex-1">{{ course.description }}</p>

      <div class="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div class="flex items-center gap-2 text-[10px] text-text-muted font-medium">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            {{ course.totalLessons }} bài
          </span>
        </div>

        <div class="flex items-center gap-3">
          
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
            <div class="w-16 h-1.5 bg-bg-surface rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{ width: progressPercent + '%' }"
                :class="progressPercent === 100 ? 'bg-accent-green' : 'bg-accent'"
              />
            </div>
            <span class="text-[9px] font-bold tabular-nums" :class="progressPercent === 100 ? 'text-accent-green' : 'text-text-muted'">
              {{ progressPercent }}%
            </span>
          </div>

          <!-- Visual-only CTA: toàn bộ thẻ là 1 router-link duy nhất (LM-013),
               nút trong chỉ là nhãn — tránh anchor lồng anchor. -->
          <span
            class="px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-lg"
            :class="progressPercent === 100 ? 'bg-accent-green text-white shadow-accent-green/30' : 'bg-accent text-white shadow-accent/30'"
          >
            {{ ctaLabel }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { Course } from '../types/course.types';
import { useCourseStore } from '../store/useCourseStore';
import CourseCover from './CourseCover.vue';

const props = defineProps<{
  course: Course;
}>();

const authStore = useAuthStore();
const courseStore = useCourseStore();

const progressPercent = computed(() => {
  const progress = courseStore.getCourseProgress(props.course.id);
  return progress.progressPercent;
});

// LM-066: "Tiếp tục" khi đang dở dang (0 < progress < 100), "Ôn tập" khi xong.
const ctaLabel = computed(() => {
  if (progressPercent.value === 100) return 'Ôn tập';
  if (progressPercent.value > 0) return 'Tiếp tục';
  return 'Bắt đầu';
});

const difficultyBadgeClass = computed(() => {
  switch (props.course.difficulty) {
    case 'Easy':
    case 'Beginner':
      return 'bg-accent-green/20 text-accent-green border border-accent-green/30';
    case 'Medium':
    case 'Intermediate':
      return 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30';
    case 'Hard':
    case 'Advanced':
      return 'bg-accent-red/20 text-accent-red border border-accent-red/30';
    default: return 'bg-slate-500/20 text-text-muted';
  }
});
</script>
