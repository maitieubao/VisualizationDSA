<template>
  <div class="flex flex-col gap-5">
    <div class="slide-card">
      <div class="glow-bg" />
      <div class="flex items-center justify-between">
        <span class="slide-num-label">
          Slide {{ currentSlideIndex + 1 }} / {{ slides.length }}
        </span>
        <span class="sync-status-badge">
          Đồng bộ bước giải thuật: #{{ activeSlide.triggerFrameIndex }}
        </span>
      </div>
      <h3 class="text-lg font-bold text-text-primary tracking-tight leading-snug m-0">
        {{ activeSlide.title }}
      </h3>
      <p class="text-sm text-text-secondary leading-relaxed m-0 font-medium font-['Outfit']">
        {{ activeSlide.content }}
      </p>
      <div class="mt-2 flex items-center gap-2">
        <button 
          @click="$emit('sync')" 
          class="sync-btn"
          title="Đưa động họa visualizer về bước khớp với slide này"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <BaseIcon name="code-ide" class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />
          <span>Xem minh họa bước này</span>
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between gap-4">
      <button 
        @click="$emit('prev')" 
        :disabled="currentSlideIndex === 0"
        class="nav-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>Slide Trước</span>
      </button>

      <div class="flex gap-2">
        <span 
          v-for="(slide, idx) in slides" 
          :key="slide.slideId"
          @click="$emit('jump', idx)"
          class="dot"
          :class="idx === currentSlideIndex ? 'active' : 'inactive'"
        />
      </div>

      <button 
        @click="$emit('next')" 
        :disabled="currentSlideIndex === slides.length - 1"
        class="nav-btn"
      >
        <span>Slide Tiếp</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Slide {
  slideId: string;
  title: string;
  content: string;
  triggerFrameIndex: number;
}
defineProps<{
  currentSlideIndex: number;
  slides: Slide[];
  activeSlide: Slide;
}>();
defineEmits<{
  (e: 'sync'): void;
  (e: 'prev'): void;
  (e: 'next'): void;
  (e: 'jump', idx: number): void;
}>();
</script>

<style scoped>
@import "./LectureSlidesSection.css";
</style>
