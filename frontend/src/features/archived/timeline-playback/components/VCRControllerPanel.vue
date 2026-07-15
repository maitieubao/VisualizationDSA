<template>
  <div class="flex items-center gap-3 px-5 py-2.5 bg-bg-secondary/45 border border-border-subtle rounded-full backdrop-blur-lg shadow-xl w-fit mx-auto">
    <!-- Rewind -->
    <button
      class="bg-transparent border-none text-text-secondary w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:not-disabled:text-accent-cyan hover:not-disabled:bg-accent-cyan/10 hover:not-disabled:scale-110 active:not-disabled:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="store.isAtStart"
      :title="'Về đầu'"
      @click="store.rewind()"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" transform="scale(-1,1) translate(-24,0)" />
      </svg>
    </button>

    <!-- Step Back -->
    <button
      class="bg-transparent border-none text-text-secondary w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:not-disabled:text-accent-cyan hover:not-disabled:bg-accent-cyan/10 hover:not-disabled:scale-110 active:not-disabled:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="store.isAtStart"
      :title="'Lùi 1 bước'"
      @click="onStepBack"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" transform="scale(-1,1) translate(-24,0)" />
      </svg>
    </button>

    <!-- Play / Pause -->
    <button
      class="w-12 h-12 bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:not-disabled:bg-accent-cyan/25 hover:not-disabled:text-accent-cyan hover:not-disabled:scale-110 active:not-disabled:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
      :title="store.isPlaying ? 'Tạm dừng' : 'Phát'"
      @click="store.togglePlayPause()"
    >
      <svg v-if="!store.isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
    </button>

    <!-- Step Forward -->
    <button
      class="bg-transparent border-none text-text-secondary w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:not-disabled:text-accent-cyan hover:not-disabled:bg-accent-cyan/10 hover:not-disabled:scale-110 active:not-disabled:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="store.isAtEnd"
      :title="'Tiến 1 bước'"
      @click="onStepForward"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
      </svg>
    </button>

    <!-- Fast Forward -->
    <button
      class="bg-transparent border-none text-text-secondary w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:not-disabled:text-accent-cyan hover:not-disabled:bg-accent-cyan/10 hover:not-disabled:scale-110 active:not-disabled:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="store.isAtEnd"
      :title="'Đến cuối'"
      @click="store.fastForward()"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
      </svg>
    </button>

    <!-- Step Counter Badge -->
    <span class="text-xs font-semibold text-text-secondary font-mono min-w-[60px] text-center">{{ store.stepLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { useVCRTimelineStore } from '../store/useVCRTimelineStore';
import { STEP_DEBOUNCE_MS } from '../types/timeline-playback.types';

const store = useVCRTimelineStore();

let lastStepTime = 0;

function debounceStep(action: () => void): void {
  const now = Date.now();
  if (now - lastStepTime < STEP_DEBOUNCE_MS) return;
  lastStepTime = now;
  action();
}

function onStepBack(): void {
  debounceStep(() => store.stepBack());
}

function onStepForward(): void {
  debounceStep(() => store.stepForward());
}
</script>
