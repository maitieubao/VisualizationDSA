<template>
  <div class="vcr-controls-bar">
    <button class="ctrl-btn" @click="$emit('stop')" title="Reset (R)">
      <BaseIcon name="stop" class="w-3.5 h-3.5" />
    </button>
    <button class="ctrl-btn" @click="$emit('stepBackward')" title="Step Back (←)">
      <BaseIcon name="step-backward" class="w-3.5 h-3.5" />
    </button>
    <button
      class="ctrl-btn-primary"
      @click="$emit('togglePlay')"
      :title="isPlaying ? 'Pause (Space)' : 'Play (Space)'"
    >
      <BaseIcon :name="isPlaying ? 'pause' : 'play'" class="w-4 h-4" />
    </button>
    <button class="ctrl-btn" @click="$emit('stepForward')" title="Step Forward (→)">
      <BaseIcon name="step-forward" class="w-3.5 h-3.5" />
    </button>

    <!-- Timeline Scrubber -->
    <input
      type="range"
      min="0"
      :max="Math.max(0, totalSteps - 1)"
      :value="currentIndex"
      class="timeline-scrubber"
      @input="onScrub"
    />

    <!-- Speed -->
    <select
      class="speed-select"
      :value="playbackSpeed"
      @change="onSpeedChange"
    >
      <option :value="0.5">0.5x</option>
      <option :value="1">1x</option>
      <option :value="2">2x</option>
      <option :value="5">5x</option>
      <option :value="10">10x</option>
    </select>

    <span class="step-counter">
      {{ currentIndex + 1 }} / {{ totalSteps }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
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
