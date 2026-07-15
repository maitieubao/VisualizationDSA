<template>
  <div class="explanation-panel">
    <div class="explanation-panel__header">
      <span class="explanation-panel__label">Explanation</span>
    </div>
    <div class="explanation-panel__body">
      <p v-if="currentFrame" class="explanation-panel__text">
        {{ currentFrame.explanation }}
      </p>
      <p v-else class="explanation-panel__empty">
        Chưa có dữ liệu hoạt ảnh. Hãy nhấn Visualize để bắt đầu.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';

const store = useAnimationStore();
const currentFrame = computed(() => store.currentFrame);
</script>

<style scoped>
.explanation-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.explanation-panel__header {
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-bg-surface);
}
.explanation-panel__label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.explanation-panel__body {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
.explanation-panel__text {
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text-primary);
}
.explanation-panel__empty {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
