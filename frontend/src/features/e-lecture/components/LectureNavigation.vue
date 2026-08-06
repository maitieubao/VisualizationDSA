<template>
  <div class="nav-area">
    
    <div class="pagination-dots">
      <button
        v-for="(slide, idx) in slides"
        :key="slide.slideId"
        class="dot"
        :class="{ 'dot-active': idx === currentSlideIndex, 'dot-visited': idx < currentSlideIndex }"
        :disabled="isWaiting"
        :title="`Slide ${idx + 1}`"
        :aria-label="`Chuyển đến slide ${idx + 1}`"
        :aria-current="idx === currentSlideIndex ? 'step' : undefined"
        @click="$emit('goTo', idx)"
      />
    </div>

    
    <div class="nav-buttons">
      <button class="nav-btn nav-btn-back" :disabled="isFirstSlide || isWaiting" @click="$emit('prev')">
        <BaseIcon name="chevron-left" class="w-3.5 h-3.5" />
        <span>Quay lại</span>
      </button>
      <button v-if="!isLastSlide" class="nav-btn nav-btn-next" @click="$emit('next')">
        <span>{{ isWaiting ? 'Bỏ qua' : 'Tiếp tục' }}</span>
        <BaseIcon name="chevron-right" class="w-3.5 h-3.5" />
      </button>
      <button v-else class="nav-btn nav-btn-finish" @click="$emit('exit')">
        <span>Thoát Bài giảng</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  slides: { slideId: string | number }[];
  currentSlideIndex: number;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  isWaiting: boolean;
}>();
defineEmits<{ prev: []; next: []; exit: []; goTo: [number] }>();
</script>

<style scoped>
.nav-area { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; border-top: 1px solid var(--color-border-subtle); }
.pagination-dots { display: flex; justify-content: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; border: none; background: var(--color-text-disabled); cursor: pointer; transition: all .2s; padding: 0; }
.dot:hover:not(:disabled) { background: var(--color-text-secondary); transform: scale(1.3); }
.dot:disabled { cursor: not-allowed; }
.dot-active  { background: var(--color-accent-cyan); box-shadow: 0 0 8px color-mix(in srgb, var(--color-accent-cyan) 50%, transparent); transform: scale(1.3); }
.dot-visited { background: var(--color-text-muted); }
.nav-buttons { display: flex; justify-content: space-between; gap: 8px; }
.nav-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; border: 1px solid var(--color-border-strong); }
.nav-btn:disabled { opacity: .3; cursor: not-allowed; }
.nav-btn-back   { background: color-mix(in srgb, var(--color-bg-primary) 80%, transparent); color: var(--color-text-secondary); }
.nav-btn-back:hover:not(:disabled) { background: var(--color-bg-hover); color: var(--color-text-primary); }
.nav-btn-next   { background: color-mix(in srgb, var(--color-accent-cyan) 15%, transparent); border-color: color-mix(in srgb, var(--color-accent-cyan) 30%, transparent); color: var(--color-accent-cyan-light); margin-left: auto; }
.nav-btn-next:hover:not(:disabled) { background: color-mix(in srgb, var(--color-accent-cyan) 25%, transparent); border-color: color-mix(in srgb, var(--color-accent-cyan) 50%, transparent); }
.nav-btn-finish { background: color-mix(in srgb, var(--color-accent-emerald) 15%, transparent); border-color: color-mix(in srgb, var(--color-accent-emerald) 30%, transparent); color: var(--color-accent-emerald-light); margin-left: auto; }
.nav-btn-finish:hover { background: color-mix(in srgb, var(--color-accent-emerald) 25%, transparent); border-color: color-mix(in srgb, var(--color-accent-emerald) 50%, transparent); }
</style>
