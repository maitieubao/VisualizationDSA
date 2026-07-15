<template>
  <div
    class="flex items-center gap-4 px-6 py-3 rounded-2xl vcr-container compare-vcr-controls"
  >
    <div class="flex items-center gap-2">
      <button @click="store.stopPlayback()" class="flex items-center justify-center w-8 h-8 rounded-[10px] vcr-btn disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Dừng lại (R)"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg></button>
      <button @click="store.stepBackward()" :disabled="store.leftCurrentIndex === 0 && store.rightCurrentIndex === 0" class="flex items-center justify-center w-8 h-8 rounded-[10px] vcr-btn disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Bước lùi (←)"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg></button>
      <button @click="store.togglePlayback()" class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-105 cursor-pointer" :title="store.isPlaying ? 'Tạm dừng (Space)' : (store.playbackState === 'FINISHED' ? 'Phát lại' : 'Phát (Space)')">
        <svg v-if="store.isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
        <svg v-else-if="store.playbackState === 'FINISHED'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      </button>
      <button @click="store.stepForward()" :disabled="store.bothFinished" class="flex items-center justify-center w-8 h-8 rounded-[10px] vcr-btn disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Bước tiến (→)"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12h2V6h-2z" /></svg></button>
    </div>

    <div class="flex-1 flex items-center gap-3">
      <span class="text-[10px] font-mono text-text-muted w-10 text-right">{{ Math.round(store.globalProgressPercent) }}%</span>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        :value="Math.round(store.globalProgressPercent)"
        @input="onSliderInput"
        class="appearance-none h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-125 flex-1"
      />
    </div>

    <select
      :value="store.globalPlaySpeed"
      @change="onSpeedChange"
      class="px-2 py-1 rounded-lg text-xs font-medium text-text-primary cursor-pointer font-sans speed-select"
    >
      <option :value="0.25" class="bg-bg-secondary">0.25x</option>
      <option :value="0.5" class="bg-bg-secondary">0.5x</option>
      <option :value="1" class="bg-bg-secondary">1.0x</option>
      <option :value="2" class="bg-bg-secondary">2.0x</option>
      <option :value="4" class="bg-bg-secondary">4.0x</option>
    </select>

    <button
      @click="toggleMode"
      class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
      :style="modeButtonStyle"
      :title="store.playbackMode === 'normalized' ? 'Chế độ đồng bộ tỷ lệ' : 'Chế độ độc lập'"
    >
      {{ store.playbackMode === 'normalized' ? 'Đồng bộ' : 'Độc lập' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useCompareAlgorithmsStore } from '../store/useCompareAlgorithmsStore';

const store = useCompareAlgorithmsStore();

const modeButtonStyle = computed(() =>
  store.playbackMode === 'normalized'
    ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)' }
    : { background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4', border: '1px solid rgba(6, 182, 212, 0.3)' }
);

const onSliderInput = (e: Event) => store.scrubToPercent(Number((e.target as HTMLInputElement).value));
const onSpeedChange = (e: Event) => store.setSpeed(Number((e.target as HTMLSelectElement).value));
const toggleMode = () => store.setPlaybackMode(store.playbackMode === 'normalized' ? 'independent' : 'normalized');

const handleKeydown = (e: KeyboardEvent) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
  if (e.key === ' ') { e.preventDefault(); store.togglePlayback(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); store.stepForward(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); store.stepBackward(); }
  else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); store.stopPlayback(); }
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown));
</script>

<style scoped>
.vcr-container {
  background: color-mix(in srgb, var(--vis-panel-bg) 60%, transparent);
  border: 1px solid var(--color-border-default);
  backdrop-filter: blur(12px);
}

.vcr-btn {
  background: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.vcr-btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.speed-select {
  background: color-mix(in srgb, var(--color-bg-primary) 70%, transparent);
  border: 1px solid var(--color-border-default);
}
</style>
