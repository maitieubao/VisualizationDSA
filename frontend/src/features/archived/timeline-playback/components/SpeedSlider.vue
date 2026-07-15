<template>
  <div class="speed-slider-container">
    <span class="speed-label">Tốc độ</span>
    <div class="speed-buttons">
      <button
        v-for="preset in SPEED_PRESETS"
        :key="preset.value"
        class="speed-button"
        :class="{ 'speed-button-active': store.playbackSpeed === preset.value }"
        @click="store.changeSpeed(preset.value)"
      >
        {{ preset.label }}
      </button>
    </div>
    <span class="speed-interval">
      {{ intervalLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVCRTimelineStore } from '../store/useVCRTimelineStore';
import { SPEED_PRESETS, DEFAULT_STEP_INTERVAL_MS } from '../types/timeline-playback.types';

const store = useVCRTimelineStore();

const intervalLabel = computed(() => {
  const ms = DEFAULT_STEP_INTERVAL_MS / store.playbackSpeed;
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s/bước`;
  return `${Math.round(ms)}ms/bước`;
});
</script>

<style scoped>
.speed-slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  backdrop-filter: blur(12px);
}

.speed-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.speed-buttons {
  display: flex;
  gap: 4px;
}

.speed-button {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: transparent;
  color: #94A3B8;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: 'JetBrains Mono', monospace;
}

.speed-button:hover {
  color: #06B6D4;
  border-color: rgba(6, 182, 212, 0.3);
  background: rgba(6, 182, 212, 0.08);
}

.speed-button-active {
  color: #06B6D4;
  border-color: #06B6D4;
  background: rgba(6, 182, 212, 0.15);
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
}

.speed-interval {
  font-size: 10px;
  color: #64748B;
  font-family: 'JetBrains Mono', monospace;
  min-width: 70px;
  text-align: right;
}
</style>
