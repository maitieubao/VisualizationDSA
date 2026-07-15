<template>
  <div class="vcr-controls glass-panel">
    <h4 class="vcr-controls__title">VCR Playback</h4>
    <div class="vcr-controls__row">
      <div class="vcr-controls__nav">
        <button
          class="vcr-controls__btn vcr-controls__btn--nav"
          :disabled="currentIndex <= 0"
          @click="$emit('prev')"
        >◀ Prev</button>
        <button
          class="vcr-controls__btn vcr-controls__btn--nav"
          :disabled="currentIndex >= totalFrames - 1"
          @click="$emit('next')"
        >Next ▶</button>
        <button
          class="vcr-controls__btn vcr-controls__btn--nav"
          @click="$emit('reset')"
        >⏮ Reset</button>
      </div>
      <div class="vcr-controls__indicator">
        Frame {{ currentIndex + 1 }} / {{ totalFrames }}
      </div>
      <button
        class="vcr-controls__btn vcr-controls__btn--exit"
        @click="$emit('exit')"
      >Exit VCR → Sandbox</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentIndex: number;
  totalFrames: number;
}>();

defineEmits<{
  prev: [];
  next: [];
  reset: [];
  exit: [];
}>();
</script>

<style scoped>
.vcr-controls {
  border-color: var(--vcr-accent-dim);
  border-radius: 12px;
  padding: 12px 16px;
}

.vcr-controls__title {
  color: var(--vcr-accent);
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vcr-controls__row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.vcr-controls__nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.vcr-controls__btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-normal) ease;
  border: 1px solid var(--glass-border);
  background: var(--picker-bg);
  color: #94a3b8;
}
.vcr-controls__btn:hover:not(:disabled) {
  background: var(--picker-hover-bg);
}
.vcr-controls__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.vcr-controls__btn--nav {
  color: #c4b5fd;
  border-color: rgba(196, 181, 253, 0.3);
}

.vcr-controls__btn--exit {
  color: var(--vcr-exit-color);
  border-color: var(--vcr-exit-border);
  margin-left: auto;
}

.vcr-controls__indicator {
  font-size: 12px;
  color: var(--vcr-accent);
  font-weight: 600;
  padding: 4px 10px;
  background: var(--vcr-accent-bg);
  border-radius: 6px;
}
</style>
