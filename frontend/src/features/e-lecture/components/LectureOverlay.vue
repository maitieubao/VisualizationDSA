<template>
  <Transition name="lecture-fade">
    <div
      v-if="lectureStore.isActive"
      class="absolute inset-0 z-[900] transition-colors duration-400 ease-[cubic-bezier(.25,.8,.25,1)]"
      :class="lectureStore.isMinimized ? '' : 'lecture-overlay'"
    >
      <div
        class="lecture-panel absolute top-[10%] left-[5%] w-[380px] min-h-[250px] p-5 backdrop-blur-md border border-border-subtle rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] z-[1000] flex flex-col gap-3.5 transition-all duration-400 ease-[cubic-bezier(.25,.8,.25,1)]"
        :class="lectureStore.isMinimized ? 'opacity-15 scale-[0.88] -translate-x-5 pointer-events-none' : 'opacity-100 scale-100 translate-x-0 translate-y-0 pointer-events-auto'"
      >
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <BaseIcon name="book-open" class="text-accent-cyan w-4 h-4" />
            <span class="text-[11px] font-bold uppercase tracking-wider text-accent-cyan">E-Lecture</span>
            <span class="badge-bg text-[11px] font-semibold text-text-muted border border-border-default py-0.5 px-2 rounded-md">{{ lectureStore.slideProgress }}</span>
          </div>
          <button class="exit-btn flex items-center justify-center w-7 h-7 rounded-lg border border-border-default text-text-muted cursor-pointer transition-all hover:text-text-primary hover:border-border-default" @click="lectureStore.exitLecture()" title="Thoát bài giảng (Esc)" aria-label="Thoát bài giảng (Esc)">
            <BaseIcon name="x" class="w-3.5 h-3.5" />
          </button>
        </div>

        
        <div v-if="lectureStore.currentLecture" class="pb-2 border-b border-border-default/6">
          <h2 class="text-sm font-bold text-text-primary leading-snug m-0">{{ lectureStore.currentLecture.title }}</h2>
        </div>

        
        <div v-if="activeSlide" class="flex flex-col gap-2.5 flex-1">
          <div class="inline-flex self-start text-[10px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-md" :class="slideBadgeClass">{{ slideBadgeText }}</div>
          <div class="text-xs text-text-secondary leading-relaxed [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-text-heading [&_h3]:mb-1.5 [&_p]:mb-2 [&_b]:text-text-primary [&_b]:font-semibold [&_em]:text-text-muted [&_em]:italic [&_ul]:my-1 [&_ul]:pl-4.5 [&_li]:mb-1" v-html="sanitizedContent" />
        </div>

        
        <div v-if="lectureStore.isWaitingForAnimation" class="flex items-center gap-2.5 p-3 py-2.5 bg-accent-cyan/8 border border-accent-cyan/20 rounded-[10px]" role="status" aria-live="polite">
          <div class="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" aria-hidden="true" />
          <span class="text-xs text-accent-cyan font-medium">Đang phát hoạt ảnh minh họa...</span>
        </div>

        
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
import DOMPurify from 'dompurify';
import LectureNavigation from './LectureNavigation.vue';

const lectureStore = useLectureStore();
const activeSlide  = computed(() => lectureStore.activeSlide);
// Sanitize nội dung slide (HTML từ lecture script) — chống stored XSS.
const sanitizedContent = computed(() => DOMPurify.sanitize(activeSlide.value?.content ?? ''));

const slideBadgeClass = computed(() => {
  if (!activeSlide.value) return '';
  return { theory: 'bg-accent/15 border border-accent/30 text-accent', 'guided-animation': 'bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan', 'interactive-check': 'bg-accent-green/15 border border-accent-green/30 text-accent-green' }[activeSlide.value.type] ?? '';
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
