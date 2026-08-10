<template>
  <div class="vcr-controls-bar">
    <button class="ctrl-btn" :disabled="isUninitialized" @click="$emit('stop')" title="Reset (R)" aria-label="Đặt lại">
      <BaseIcon name="stop" class="w-3.5 h-3.5" />
    </button>
    <button class="ctrl-btn" :disabled="isUninitialized || isFirstFrame" @click="$emit('stepBackward')" title="Step Back (Left)" aria-label="Bước trước">
      <BaseIcon name="step-backward" class="w-3.5 h-3.5" />
    </button>
    <button
      class="ctrl-btn-primary"
      :disabled="isUninitialized"
      @click="$emit('togglePlay')"
      :title="isPlaying ? 'Pause (Space)' : 'Play (Space)'"
      :aria-label="isPlaying ? 'Tạm dừng' : 'Phát'"
      :aria-pressed="isPlaying"
    >
      <BaseIcon :name="isPlaying ? 'pause' : 'play'" class="w-4 h-4" />
    </button>
    <button class="ctrl-btn" :disabled="isUninitialized || isLastFrame" @click="$emit('stepForward')" title="Step Forward (Right)" aria-label="Bước tiếp theo">
      <BaseIcon name="step-forward" class="w-3.5 h-3.5" />
    </button>

    
    <input
      type="range"
      min="0"
      :max="Math.max(0, totalSteps - 1)"
      :value="currentIndex"
      :disabled="isUninitialized"
      class="timeline-scrubber"
      aria-label="Tiến trình hoạt ảnh"
      @input="onScrub"
    />

    
    <select
      class="speed-select"
      :value="playbackSpeed"
      aria-label="Tốc độ phát"
      @change="onSpeedChange"
    >
      <option v-for="speed in SPEED_PRESETS" :key="speed" :value="speed">{{ speed }}x</option>
    </select>

    <span class="step-counter" aria-live="polite">
      {{ counterText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SPEED_PRESETS } from '../composables/useSpeedPreferences';

const props = defineProps<{
  isPlaying: boolean;
  currentIndex: number;
  totalSteps: number;
  playbackSpeed: number;
}>();

const emit = defineEmits<{
  (e: 'stop'): void;
  (e: 'stepBackward'): void;
  (e: 'stepForward'): void;
  (e: 'togglePlay'): void;
  (e: 'scrub', index: number): void;
  (e: 'speedChange', speed: number): void;
}>();

const isUninitialized = computed<boolean>(() => props.totalSteps === 0);
const isFirstFrame = computed<boolean>(() => props.currentIndex === 0);
const isLastFrame = computed<boolean>(() => props.totalSteps > 0 && props.currentIndex >= props.totalSteps - 1);
const counterText = computed<string>(() =>
  props.totalSteps === 0 ? '0 / 0' : `${props.currentIndex + 1} / ${props.totalSteps}`,
);

function onScrub(e: Event): void {
  const target = e.target as HTMLInputElement;
  emit('scrub', parseInt(target.value, 10));
}

function onSpeedChange(e: Event): void {
  const target = e.target as HTMLSelectElement;
  emit('speedChange', parseFloat(target.value));
}
</script>

<style scoped>
.vcr-controls-bar {
  height: 3.5rem;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-md);
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 16px;
}

.ctrl-btn {
  width: 2rem; height: 2rem;
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem;
  transition: var(--transition-fast);
  cursor: pointer;
}
.ctrl-btn:hover { background: var(--color-bg-hover); color: var(--color-text-primary); }
.ctrl-btn:disabled,
.ctrl-btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ctrl-btn-primary {
  width: 2.5rem; height: 2.5rem;
  border-radius: var(--radius-full);
  background: var(--color-accent-cyan);
  border: none;
  color: #ffffff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700;
  transition: var(--transition-fast);
  cursor: pointer;
}
.ctrl-btn-primary:hover { background: var(--color-accent-primary); }

.timeline-scrubber {
  flex: 1;
  height: 4px;
  accent-color: var(--color-accent-cyan);
  cursor: pointer;
}

.speed-select {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  outline: none;
  transition: var(--transition-fast);
}
.speed-select:focus { border-color: var(--color-accent-cyan); }

.step-counter {
  font-size: 10px;
  color: var(--color-text-muted);
  min-width: 80px;
  text-align: right;
  font-family: var(--font-mono);
}
</style>
