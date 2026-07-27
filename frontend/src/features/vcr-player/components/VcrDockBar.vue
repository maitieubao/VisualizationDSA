<template>
  <div class="vcr-dock-bar flex items-center justify-between gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-lg bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-xl w-full mx-auto font-sans select-none overflow-hidden">
    <!-- Speed Select Dropdown (Ultra-compact VisuAlgo style) -->
    <div class="relative shrink-0 font-mono">
      <select
        :value="vcrStore.playbackSpeed"
        @change="vcrStore.playbackSpeed = Number(($event.target as HTMLSelectElement).value)"
        class="bg-slate-800/90 text-indigo-300 hover:text-white border border-white/10 rounded-md px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-indigo-500/50 cursor-pointer appearance-none pr-6 transition-all shadow-inner"
      >
        <option :value="0.25" class="bg-slate-900 text-slate-200">0.25x</option>
        <option :value="0.5" class="bg-slate-900 text-slate-200">0.5x</option>
        <option :value="1" class="bg-slate-900 text-slate-200">1x</option>
        <option :value="2" class="bg-slate-900 text-slate-200">2x</option>
        <option :value="4" class="bg-slate-900 text-slate-200">4x</option>
      </select>
      <svg class="w-3 h-3 text-indigo-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Center Playback Controls -->
    <div class="flex items-center gap-1.5 shrink-0">
      <!-- Step Prev -->
      <button
        @click="vcrStore.stepPrev"
        :disabled="vcrStore.totalFrames === 0 || vcrStore.isAtStart"
        class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        title="Bước trước"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
      </button>

      <!-- Play / Pause -->
      <button
        @click="vcrStore.togglePlay"
        :disabled="vcrStore.totalFrames === 0"
        class="w-9 h-9 flex items-center justify-center rounded-xl font-bold transition-all shadow-md shadow-indigo-600/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
        :class="vcrStore.isPlaying ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'"
        title="Phát / Tạm dừng"
      >
        <svg v-if="vcrStore.isPlaying" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
        <svg v-else class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      </button>

      <!-- Step Next -->
      <button
        @click="vcrStore.stepNext"
        :disabled="vcrStore.totalFrames === 0 || (!vcrStore.isLooping && vcrStore.isAtEnd)"
        class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        title="Bước tiếp theo"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
      </button>

      <!-- Reset -->
      <button
        @click="vcrStore.reset"
        :disabled="vcrStore.totalFrames === 0"
        class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        title="Đặt lại"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Scrubber Progress Slider -->
    <div class="flex items-center gap-2 flex-1 min-w-[70px] shrink overflow-hidden">
      <input
        type="range"
        min="0"
        :max="Math.max(0, vcrStore.totalFrames - 1)"
        :value="vcrStore.currentFrameIndex"
        @input="handleScrub"
        :disabled="vcrStore.totalFrames === 0"
        class="vcr-scrubber flex-1 min-w-[30px] h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
      />
      <span class="text-xs font-mono font-bold text-indigo-300 shrink-0 text-right whitespace-nowrap pl-1">
        {{ vcrStore.currentFrameIndex + 1 }}/{{ vcrStore.totalFrames }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVcrStore } from '../store/useVcrStore';

const vcrStore = useVcrStore();

function handleScrub(e: Event): void {
  vcrStore.jumpToFrame(parseInt((e.target as HTMLInputElement).value, 10));
}
</script>
