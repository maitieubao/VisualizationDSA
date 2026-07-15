<template>
  <Transition name="lecture-fade">
    <div v-if="lectureStore.isActive" class="absolute inset-0 z-[900] transition-colors duration-400 ease-[cubic-bezier(.25,.8,.25,1)]" :class="lectureStore.isMinimized ? '' : 'lecture-overlay'">
      <div class="lecture-panel absolute top-[10%] left-[5%] w-[380px] min-h-[250px] p-5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] z-[1000] flex flex-col gap-3.5 transition-all duration-400 ease-[cubic-bezier(.25,.8,.25,1)]" :class="lectureStore.isMinimized ? 'opacity-15 scale-[0.88] -translate-x-5 pointer-events-none' : 'opacity-100 scale-100 translate-x-0 translate-y-0 pointer-events-auto'">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-[#06b6d4] w-4 h-4">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10M6 10h10" />
            </svg>
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#06b6d4]">E-Lecture</span>
            <span class="badge-bg text-[11px] font-semibold text-slate-400 border border-slate-800 py-0.5 px-2 rounded-md">{{ lectureStore.slideProgress }}</span>
          </div>
          <button class="exit-btn flex items-center justify-center w-7 h-7 rounded-lg border border-slate-700 text-slate-400 cursor-pointer transition-all hover:text-slate-100 hover:border-slate-600" @click="lectureStore.exitLecture()" title="Thoát bài giảng (Esc)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Lecture Title -->
        <div v-if="lectureStore.currentLecture" class="pb-2 border-b border-white/6">
          <h2 class="text-sm font-bold text-[#f1f5f9] leading-snug m-0">{{ lectureStore.currentLecture.title }}</h2>
        </div>

        <!-- Slide Content -->
        <div v-if="activeSlide" class="flex flex-col gap-2.5 flex-1">
          <div class="inline-flex self-start text-[10px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-md" :class="slideBadgeClass">{{ slideBadgeText }}</div>
          <div class="text-xs text-slate-300 leading-relaxed [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[#f1f5f9] [&_h3]:mb-1.5 [&_p]:mb-2 [&_b]:text-[#e2e8f0] [&_b]:font-semibold [&_em]:text-slate-400 [&_em]:italic [&_ul]:my-1 [&_ul]:pl-4.5 [&_li]:mb-1" v-html="activeSlide.content" />
        </div>

        <!-- Waiting Indicator -->
        <div v-if="lectureStore.isWaitingForAnimation" class="flex items-center gap-2.5 p-3 py-2.5 bg-cyan-500/8 border border-cyan-500/20 rounded-[10px]">
          <div class="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <span class="text-xs text-cyan-300 font-medium">Đang phát hoạt ảnh minh họa...</span>
        </div>

        <!-- Navigation -->
        <LectureNavigation
          :slides="lectureStore.currentLecture?.slides ?? []"
          :current-slide-index="lectureStore.currentSlideIndex"
          :is-first-slide="lectureStore.isFirstSlide"
          :is-last-slide="lectureStore.isLastSlide"
          :is-waiting="lectureStore.isWaitingForAnimation"
          @prev="lectureStore.prevSlide()"
          @next="lectureStore.nextSlide()"
          @exit="lectureStore.exitLecture()"
          @go-to="lectureStore.goToSlide"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useLectureStore } from '../store/useLectureStore';
import LectureNavigation from './LectureNavigation.vue';

const lectureStore = useLectureStore();
const activeSlide  = computed(() => lectureStore.activeSlide);

const slideBadgeClass = computed(() => {
  if (!activeSlide.value) return '';
  return { theory: 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300', 'guided-animation': 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300', 'interactive-check': 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' }[activeSlide.value.type] ?? '';
});

const slideBadgeText = computed(() => {
  if (!activeSlide.value) return '';
  return { theory: 'Lý thuyết', 'guided-animation': 'Hoạt họa dẫn dắt', 'interactive-check': 'Điểm kiểm tra' }[activeSlide.value.type] ?? '';
});

function handleKeydown(e: KeyboardEvent): void {
  if (!lectureStore.isActive) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); lectureStore.nextSlide(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); lectureStore.prevSlide(); }
  else if (e.key === 'Escape') { e.preventDefault(); lectureStore.exitLecture(); }
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<style scoped>
.lecture-overlay {
  background: color-mix(in srgb, var(--color-bg-primary) 40%, transparent);
}

.lecture-panel {
  background: color-mix(in srgb, var(--vis-panel-bg) 85%, transparent);
}

.badge-bg {
  background: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
}

.exit-btn {
  background: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
  transition: all 0.2s ease;
}

.exit-btn:hover {
  background: var(--color-bg-hover);
}

.lecture-fade-enter-active, .lecture-fade-leave-active { transition: opacity .35s ease; }
.lecture-fade-enter-active .lecture-panel, .lecture-fade-leave-active .lecture-panel { transition: transform .35s cubic-bezier(.25,.8,.25,1), opacity .35s ease; }
.lecture-fade-enter-from { opacity: 0; }
.lecture-fade-enter-from .lecture-panel, .lecture-fade-leave-to .lecture-panel { opacity: 0; transform: scale(.9) translateY(20px); }
.lecture-fade-leave-to { opacity: 0; }
</style>
