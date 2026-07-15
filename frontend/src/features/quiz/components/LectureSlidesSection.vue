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
          <span>💻 Xem minh họa bước này</span>
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
.slide-card {
  padding: 20px;
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 60%, transparent);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 160px;
  position: relative;
  overflow: hidden;
}

.glow-bg {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 96px;
  height: 96px;
  background-color: color-mix(in srgb, var(--color-accent-cyan) 5%, transparent);
  border-radius: var(--radius-full);
  filter: blur(24px);
  pointer-events: none;
}

.slide-num-label {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent-cyan);
  font-family: var(--font-mono);
}

.sync-status-badge {
  font-size: 11px;
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  background-color: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
  padding: 4px 10px;
  border-radius: var(--radius-md);
}

.sync-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 40%, transparent);
  color: var(--color-accent-cyan);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);
}

.sync-btn:hover {
  border-color: color-mix(in srgb, var(--color-accent-cyan) 60%, transparent);
  background-color: var(--color-bg-active);
}

.sync-btn:active {
  transform: scale(0.95);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
  border-radius: var(--radius-xl);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.nav-btn:hover:not(:disabled) {
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.dot.active {
  background-color: var(--color-accent-cyan);
  box-shadow: 0 0 8px var(--color-accent-cyan-glow);
  transform: scale(1.1);
}

.dot.inactive {
  background-color: var(--color-bg-active);
}

.dot.inactive:hover {
  background-color: var(--color-bg-hover);
}
</style>
