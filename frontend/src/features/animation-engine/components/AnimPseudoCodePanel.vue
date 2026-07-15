<template>
  <div class="pseudocode-panel">
    <div class="pseudocode-panel__header">
      <span class="pseudocode-panel__label">Pseudocode</span>
    </div>
    <div class="pseudocode-panel__body">
      <div
        v-for="(line, idx) in pseudoCode"
        :key="idx"
        class="pseudocode-line"
        :class="idx === activeLine ? 'pseudocode-line--active' : 'pseudocode-line--default'"
      >
        <span class="pseudocode-line__number">{{ idx + 1 }}</span>
        {{ line }}
      </div>
      <p v-if="pseudoCode.length === 0" class="pseudocode-panel__empty">
        Chưa có mã giả. Hãy chọn thuật toán và nhấn Visualize.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';

const store = useAnimationStore();
const pseudoCode = computed(() => store.pseudoCode);
const activeLine = computed(() => store.currentFrame?.activeLine ?? -1);
</script>

<style scoped>
.pseudocode-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.pseudocode-panel__header {
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-bg-surface);
}
.pseudocode-panel__label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.pseudocode-panel__body {
  flex: 1;
  overflow: auto;
  padding: 16px;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
.pseudocode-panel__empty {
  color: var(--color-text-muted);
  font-style: italic;
}

/* Pseudocode line */
.pseudocode-line {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border-left: 2px solid transparent;
  transition: background 0.15s ease, color 0.15s ease;
}
.pseudocode-line--active {
  background: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan);
  border-left-color: var(--color-accent-cyan);
}
.pseudocode-line--default {
  color: var(--color-text-secondary);
}
.pseudocode-line__number {
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
  margin-right: 12px;
  user-select: none;
}
</style>
