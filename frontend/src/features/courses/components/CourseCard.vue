<template>
  <div
    class="course-card group relative bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:border-indigo-500/30 flex flex-col"
  >
    
    <div class="relative h-36 overflow-hidden bg-slate-800 shrink-0">
      <img
        v-if="course.coverImage"
        :src="course.coverImage"
        :alt="course.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-slate-800 group-hover:scale-105 transition-transform duration-500">
        <svg class="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      <div class="absolute top-3 right-3 flex gap-1.5">
        <span
          class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          :class="difficultyBadgeClass"
        >
          {{ course.difficulty }}
        </span>
        <span
          class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300"
        >
          {{ course.category }}
        </span>
      </div>
    </div>

    
    <div class="p-4 flex flex-col flex-1">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-base font-bold text-white line-clamp-1 mr-2">{{ course.title }}</h3>
        <span class="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 whitespace-nowrap bg-amber-900/30 px-1.5 py-0.5 rounded">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          {{ course.xpReward }} XP
        </span>
      </div>

      <p class="text-xs text-slate-400 line-clamp-2 mb-4 flex-1">{{ course.description }}</p>

      <div class="flex items-center justify-between pt-3 border-t border-white/5">
        <div class="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            {{ course.totalLessons }} bài
          </span>
        </div>

        <div class="flex items-center gap-3">
          
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
            <div class="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{ width: progressPercent + '%' }"
                :class="progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'"
              />
            </div>
            <span class="text-[9px] font-bold tabular-nums" :class="progressPercent === 100 ? 'text-emerald-400' : 'text-slate-400'">
              {{ progressPercent }}%
            </span>
          </div>

          <router-link
            :to="`/courses/${course.id}`"
            class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg cursor-pointer"
            :class="progressPercent === 100 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'"
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
    case 'Easy': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    case 'Medium': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'Hard': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    default: return 'bg-slate-500/20 text-slate-400';
  }
});
</script>
