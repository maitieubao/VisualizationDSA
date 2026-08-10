<template>
  <div class="vcr-dock-bar flex items-center justify-between gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-full bg-slate-900/45 border border-white/10 shadow-2xl backdrop-blur-xl w-full mx-auto font-sans select-none overflow-hidden">
    
    <div class="relative shrink-0 font-mono">
      <select
        :value="vcrStore.playbackSpeed"
        @change="vcrStore.playbackSpeed = Number(($event.target as HTMLSelectElement).value)"
        aria-label="Tốc độ phát"
        class="bg-bg-active text-accent hover:text-accent-hover border border-border-default rounded-md px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-accent/50 cursor-pointer appearance-none pr-6 transition-all shadow-inner"
      >
        <option v-for="speed in SPEED_PRESETS" :key="speed" :value="speed" class="bg-bg-surface text-text-primary">{{ speed }}x</option>
      </select>
      <BaseIcon name="arrow-down" class="w-3 h-3 text-accent pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
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
        :aria-label="playAriaLabel"
        :aria-pressed="vcrStore.isPlaying"
        class="w-9 h-9 flex items-center justify-center rounded-xl font-bold transition-all shadow-md shadow-accent/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
        :class="vcrStore.isPlaying ? 'bg-accent-red hover:bg-accent-red-light text-white' : 'bg-accent hover:bg-accent-hover text-white'"
        :title="playTitle"
      >
        <BaseIcon v-if="vcrStore.isPlaying" name="pause" class="w-4 h-4" />
        <BaseIcon v-else-if="isAtEndReplay" name="refresh-cw" class="w-4 h-4" />
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
        @mousedown="vcrStore.pause()"
        :disabled="vcrStore.totalFrames === 0"
        aria-label="Tiến trình phát"
        :style="scrubStyle"
        class="vcr-scrubber flex-1 min-w-[30px] h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
      />
      <span class="text-xs font-mono font-bold text-accent shrink-0 text-right whitespace-nowrap pl-1" aria-live="polite">
        {{ vcrStore.totalFrames > 0 ? vcrStore.currentFrameIndex + 1 : 0 }}/{{ vcrStore.totalFrames }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { useVcrStore } from '../store/useVcrStore';
import { SPEED_PRESETS } from '../../animation-engine/composables/useSpeedPreferences';

const vcrStore = useVcrStore();

const isAtEndReplay = computed<boolean>(() => vcrStore.totalFrames > 0 && vcrStore.isAtEnd);

const playTitle = computed<string>(() => {
  if (vcrStore.isPlaying) return 'Tạm dừng (Space)';
  return isAtEndReplay.value ? 'Phát lại từ đầu (Replay)' : 'Phát (Space)';
});

const playAriaLabel = computed<string>(() => {
  if (vcrStore.isPlaying) return 'Tạm dừng';
  return isAtEndReplay.value ? 'Phát lại từ đầu' : 'Phát';
});

const scrubStyle = computed<Record<string, string>>(() => {
  const total = vcrStore.totalFrames;
  const percent = total > 1 ? (vcrStore.currentFrameIndex / (total - 1)) * 100 : 0;
  return { '--scrub-progress': `${percent}%` };
});

let lastScrubTime = 0;
const SCRUB_THROTTLE_MS = 33;

function handleScrub(e: Event): void {
  const now = performance.now();
  if (now - lastScrubTime < SCRUB_THROTTLE_MS) return;
  lastScrubTime = now;
  vcrStore.jumpToFrame(parseInt((e.target as HTMLInputElement).value, 10));
}
</script>

<style scoped>
.vcr-scrubber {
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(
    to right,
    #06B6D4 var(--scrub-progress, 0%),
    rgba(255, 255, 255, 0.1) var(--scrub-progress, 0%)
  );
}

.vcr-scrubber::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #06B6D4;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.8);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.vcr-scrubber::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}

.vcr-scrubber::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #06B6D4;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.8);
  cursor: pointer;
}

.vcr-scrubber:disabled {
  cursor: not-allowed;
}
</style>
