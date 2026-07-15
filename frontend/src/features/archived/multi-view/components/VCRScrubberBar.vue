<template>
  <div class="vcr-scrubber-container">
    <!-- Playback controls -->
    <div class="vcr-controls">
      <button
        class="vcr-btn"
        :disabled="store.isAtStart"
        @click="store.stepPrev()"
        title="Bước trước"
      >
        ⏮
      </button>

      <button
        class="vcr-btn vcr-btn-play"
        @click="store.togglePlayback()"
        :title="store.isPlaying ? 'Tạm dừng' : 'Phát'"
      >
        {{ store.isPlaying ? '⏸' : '▶' }}
      </button>

      <button
        class="vcr-btn"
        :disabled="store.isAtEnd"
        @click="store.stepNext()"
        title="Bước tiếp"
      >
        ⏭
      </button>
    </div>

    <!-- Timeline slider -->
    <div class="vcr-timeline-section">
      <span class="vcr-step-label">{{ store.currentStepIndex + 1 }} / {{ store.totalStepsCount }}</span>
      <input
        type="range"
        class="vcr-timeline-slider"
        :min="0"
        :max="Math.max(store.totalStepsCount - 1, 0)"
        :value="store.currentStepIndex"
        @input="onSliderInput"
      />
      <span class="vcr-progress-label">{{ store.progressPercent }}%</span>
    </div>

    <!-- Speed controls -->
    <div class="vcr-speed-controls">
      <span class="vcr-speed-label">Tốc độ:</span>
      <button
        v-for="speed in store.PLAYBACK_SPEEDS"
        :key="speed"
        class="vcr-speed-btn"
        :class="{ active: store.playbackSpeed === speed }"
        @click="store.setPlaybackSpeed(speed)"
      >
        {{ speed }}x
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMultiViewStore } from '../store/useMultiViewStore';

const store = useMultiViewStore();

function onSliderInput(event: Event) {
  const target = event.target as HTMLInputElement;
  store.seekToStep(Number(target.value));
}
</script>

<style scoped>
.vcr-scrubber-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.vcr-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.vcr-btn {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vcr-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(6, 182, 212, 0.5);
}

.vcr-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.vcr-btn-play {
  width: 40px;
  height: 40px;
  background: rgba(249, 115, 22, 0.2);
  border-color: rgba(249, 115, 22, 0.4);
  font-size: 16px;
}

.vcr-btn-play:hover {
  background: rgba(249, 115, 22, 0.3) !important;
  border-color: rgba(249, 115, 22, 0.6) !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
}

.vcr-timeline-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.vcr-step-label,
.vcr-progress-label {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  min-width: 48px;
  text-align: center;
}

.vcr-timeline-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.vcr-timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #F97316;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.8);
  cursor: grab;
  transition: transform 0.1s ease;
}

.vcr-timeline-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.25);
}

.vcr-timeline-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #F97316;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.8);
  cursor: grab;
  border: none;
}

.vcr-speed-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.vcr-speed-label {
  font-size: 10px;
  color: #64748b;
  white-space: nowrap;
}

.vcr-speed-btn {
  padding: 2px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  border-radius: 6px;
  color: #94a3b8;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vcr-speed-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.vcr-speed-btn.active {
  background: rgba(249, 115, 22, 0.2);
  border-color: rgba(249, 115, 22, 0.5);
  color: #F97316;
}
</style>
