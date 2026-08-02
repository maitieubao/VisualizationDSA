<template>
  <div class="vcr-control-panel">
    

    
    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-label">Progress</span>
        <span class="progress-counter">{{ vcrStore.currentFrameIndex + 1 }} / {{ vcrStore.totalFrames }}</span>
      </div>
      <input type="range" min="0" :max="Math.max(0, vcrStore.totalFrames - 1)"
        :value="vcrStore.currentFrameIndex" @input="handleScrub"
        :disabled="vcrStore.totalFrames === 0"
        class="vcr-scrubber" />
    </div>

    
    <div class="controls-row">
      <button @click="vcrStore.stepPrev"
        :disabled="vcrStore.totalFrames === 0 || vcrStore.isAtStart"
        class="ctrl-btn"
        data-tour-id="vcr-step-debug">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
      </button>

      <button @click="vcrStore.togglePlay"
        :disabled="vcrStore.totalFrames === 0"
        class="ctrl-btn-play"
        data-tour-id="vcr-play-btn"
        :class="vcrStore.isPlaying ? 'ctrl-btn-play--pause' : 'ctrl-btn-play--play'">
        <svg v-if="vcrStore.isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
        <svg v-else class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      </button>

      <button @click="vcrStore.stepNext"
        :disabled="vcrStore.totalFrames === 0 || (!vcrStore.isLooping && vcrStore.isAtEnd)"
        class="ctrl-btn"
        data-tour-id="vcr-step-debug">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
      </button>

      <button @click="vcrStore.reset"
        :disabled="vcrStore.totalFrames === 0"
        class="ctrl-btn ctrl-btn--danger">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    
    <div class="speed-row" data-tour-id="vcr-speed-select">
      <span class="speed-label">Speed</span>
      <div class="speed-buttons">
        <button v-for="speed in [0.5, 1, 2, 4]" :key="speed"
          @click="vcrStore.playbackSpeed = speed"
          class="speed-btn"
          :class="vcrStore.playbackSpeed === speed ? 'speed-btn--active' : ''">
          {{ speed }}x
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useVcrStore } from "../store/useVcrStore";

const vcrStore = useVcrStore();

const handleScrub = (e: Event): void => {
  vcrStore.jumpToFrame(parseInt((e.target as HTMLInputElement).value, 10));
};

const handleGlobalKeydown = (e: KeyboardEvent): void => {
  if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
  if (e.code === "Space") { e.preventDefault(); vcrStore.togglePlay(); }
  else if (e.code === "ArrowRight") { e.preventDefault(); vcrStore.stepNext(); }
  else if (e.code === "ArrowLeft") { e.preventDefault(); vcrStore.stepPrev(); }
};

onMounted(() => window.addEventListener("keydown", handleGlobalKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", handleGlobalKeydown));
</script>

<style scoped>
.vcr-control-panel {
  height: auto;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}


.progress-section { display: flex; flex-direction: column; gap: 8px; }
.progress-header  { display: flex; align-items: center; justify-content: space-between; font-size: var(--text-xs); }
.progress-label   { color: var(--color-text-muted); }
.progress-counter { font-family: var(--font-mono); color: var(--color-accent-primary-text); }

.vcr-scrubber {
  width: 100%;
  height: 6px;
  border-radius: var(--radius-full);
  appearance: none;
  cursor: pointer;
  background: var(--color-bg-hover);
  accent-color: var(--color-accent-primary);
}
.vcr-scrubber:disabled { opacity: 0.4; }


.controls-row { display: flex; align-items: center; justify-content: center; gap: 8px; padding-top: 8px; }

.ctrl-btn {
  width: 2.5rem; height: 2.5rem;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-subtle);
  cursor: pointer;
  transition: var(--transition-fast);
}
.ctrl-btn:hover    { background: var(--color-bg-hover); color: var(--color-text-primary); }
.ctrl-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.ctrl-btn--danger:hover { color: var(--color-accent-red); background: var(--color-accent-red-dim); }

.ctrl-btn-play {
  width: 3rem; height: 3rem;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-xl);
  border: none;
  color: #ffffff;
  cursor: pointer;
  transition: var(--transition-fast);
}
.ctrl-btn-play:disabled { opacity: 0.3; cursor: not-allowed; }
.ctrl-btn-play--play  { background: var(--color-accent-primary); }
.ctrl-btn-play--play:hover  { background: var(--color-accent-primary-light); }
.ctrl-btn-play--pause { background: var(--color-accent-red); }
.ctrl-btn-play--pause:hover { background: var(--color-accent-red-light); }


.speed-row    { display: flex; align-items: center; justify-content: center; gap: 8px; }
.speed-label  { font-size: 10px; color: var(--color-text-muted); }
.speed-buttons { display: flex; gap: 4px; }
.speed-btn {
  padding: 2px 8px;
  font-size: 10px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: var(--transition-fast);
}
.speed-btn:hover        { color: var(--color-text-secondary); }
.speed-btn--active      { background: var(--color-accent-primary-dim); color: var(--color-accent-primary-text); }
</style>
