<template>
  <div class="vcr-dock-bar flex items-center justify-between gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-lg bg-bg-surface border border-border-default shadow-2xl backdrop-blur-xl w-full mx-auto font-sans select-none overflow-hidden">
    
    <div class="relative shrink-0 font-mono">
      <select
        :value="vcrStore.playbackSpeed"
        @change="vcrStore.playbackSpeed = Number(($event.target as HTMLSelectElement).value)"
        aria-label="Tốc độ phát"
        class="bg-bg-active text-accent hover:text-accent-hover border border-border-default rounded-md px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-accent/50 cursor-pointer appearance-none pr-6 transition-all shadow-inner"
      >
        <option :value="0.25" class="bg-bg-surface text-text-primary">0.25x</option>
        <option :value="0.5" class="bg-bg-surface text-text-primary">0.5x</option>
        <option :value="1" class="bg-bg-surface text-text-primary">1x</option>
        <option :value="2" class="bg-bg-surface text-text-primary">2x</option>
        <option :value="4" class="bg-bg-surface text-text-primary">4x</option>
      </select>
      <svg class="w-3 h-3 text-accent pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    
    <div class="flex items-center gap-1.5 shrink-0">
      
      <button
        @click="vcrStore.stepPrev"
        :disabled="vcrStore.totalFrames === 0 || vcrStore.isAtStart"
        aria-label="Bước trước"
        class="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-active hover:bg-bg-hover text-text-secondary hover:text-text-primary border border-border-default transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        title="Bước trước"
      >
        <BaseIcon name="step-backward" class="w-3.5 h-3.5" />
      </button>

      
      <button
        @click="vcrStore.togglePlay"
        :disabled="vcrStore.totalFrames === 0"
        :aria-label="vcrStore.isPlaying ? 'Tạm dừng' : 'Phát'"
        :aria-pressed="vcrStore.isPlaying"
        class="w-9 h-9 flex items-center justify-center rounded-xl font-bold transition-all shadow-md shadow-accent/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
        :class="vcrStore.isPlaying ? 'bg-accent-red hover:bg-accent-red-light text-white' : 'bg-accent hover:bg-accent-hover text-white'"
        title="Phát / Tạm dừng"
      >
        <BaseIcon v-if="vcrStore.isPlaying" name="pause" class="w-4 h-4" />
        <BaseIcon v-else name="play" class="w-4 h-4 ml-0.5" />
      </button>

      
      <button
        @click="vcrStore.stepNext"
        :disabled="vcrStore.totalFrames === 0 || (!vcrStore.isLooping && vcrStore.isAtEnd)"
        aria-label="Bước tiếp theo"
        class="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-active hover:bg-bg-hover text-text-secondary hover:text-text-primary border border-border-default transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        title="Bước tiếp theo"
      >
        <BaseIcon name="step-forward" class="w-3.5 h-3.5" />
      </button>

      
      <button
        @click="vcrStore.reset"
        :disabled="vcrStore.totalFrames === 0"
        aria-label="Đặt lại"
        class="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-active hover:bg-accent-red/10 text-text-muted hover:text-accent-red border border-border-default hover:border-accent-red/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        title="Đặt lại"
      >
        <BaseIcon name="refresh-cw" class="w-3.5 h-3.5" />
      </button>
    </div>

    
    <div class="flex items-center gap-2 flex-1 min-w-[70px] shrink overflow-hidden">
      <input
        type="range"
        min="0"
        :max="Math.max(0, vcrStore.totalFrames - 1)"
        :value="vcrStore.currentFrameIndex"
        @input="handleScrub"
        :disabled="vcrStore.totalFrames === 0"
        aria-label="Tiến trình phát"
        class="vcr-scrubber flex-1 min-w-[30px] h-1.5 bg-bg-active rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-40"
      />
      <span class="text-xs font-mono font-bold text-accent shrink-0 text-right whitespace-nowrap pl-1">
        {{ vcrStore.totalFrames > 0 ? vcrStore.currentFrameIndex + 1 : 0 }}/{{ vcrStore.totalFrames }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { useVcrStore } from '../store/useVcrStore';

const vcrStore = useVcrStore();

function handleScrub(e: Event): void {
  vcrStore.jumpToFrame(parseInt((e.target as HTMLInputElement).value, 10));
}
</script>
