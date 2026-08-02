<template>
  <div
    class="course-card group relative bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:border-accent/30 flex flex-col"
  >
    
    <div class="relative h-36 overflow-hidden bg-bg-surface shrink-0">
      <img
        v-if="course.coverImage"
        :src="course.coverImage"
        :alt="course.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-bg-surface group-hover:scale-105 transition-transform duration-500">
        <svg class="w-12 h-12 text-text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />
      <div class="absolute top-3 right-3 flex gap-1.5">
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
        <h3 class="text-base font-bold text-white line-clamp-1 mr-2">{{ course.title }}</h3>
        <span class="text-[10px] font-bold text-accent-yellow flex items-center gap-0.5 whitespace-nowrap bg-accent-yellow/30 px-1.5 py-0.5 rounded">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
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

          <router-link
            :to="`/courses/${course.id}`"
            class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg cursor-pointer"
            :class="progressPercent === 100 ? 'bg-accent-green hover:bg-accent-green text-white shadow-accent-green/30' : 'bg-accent hover:bg-accent text-white shadow-accent/30'"
          >
            {{ progressPercent === 100 ? 'Ôn tập' : 'Bắt đầu' }}
          </router-link>
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

const props = defineProps<{
  course: Course;
}>();

const authStore = useAuthStore();
const courseStore = useCourseStore();

const progressPercent = computed(() => {
  const progress = courseStore.getCourseProgress(props.course.id);
  return progress.progressPercent;
});

const difficultyBadgeClass = computed(() => {
  switch (props.course.difficulty) {
    case 'Easy': return 'bg-accent-green/20 text-accent-green border border-accent-green/30';
    case 'Medium': return 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30';
    case 'Hard': return 'bg-accent-red/20 text-accent-red border border-accent-red/30';
    default: return 'bg-slate-500/20 text-text-muted';
  }
});
</script>
