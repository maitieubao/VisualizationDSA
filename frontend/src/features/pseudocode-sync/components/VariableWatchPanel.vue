<template>
  <div class="watch-panel-card">
    <div class="watch-title">WATCH VARIABLES</div>
    <div class="watch-variables-grid">
      <TransitionGroup name="var-fade">
        <div
          v-for="variable in watchVariables"
          :key="variable.name"
          class="watch-variable-badge"
        >
          <span class="var-name">{{ variable.name }}</span>
          <span class="var-value">{{ variable.value }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePseudocodeStore } from '../store/usePseudocodeStore';
import type { VariableState } from '../types/pseudocode.types';

const pseudocodeStore = usePseudocodeStore();

// PS-015: Sắp xếp theo tên (alphabet) để thứ tự badge ỔN ĐỊNH xuyên các frame —
// trước đây `Object.entries(frame.variables)` theo thứ tự khai báo của từng
// frame → thứ tự badge nhảy/giật liên tục khi phát.
const watchVariables = computed<VariableState[]>(() =>
  [...pseudocodeStore.watchVariablesList].sort((a, b) => a.name.localeCompare(b.name)),
);

// TODO(PS-038): khi `VariableState` được bổ sung field
// `type: 'index' | 'pointer' | 'temporary'` (theo TECHNICAL_SPEC §1 — file
// types/pseudocode.types.ts do agent khác sở hữu), phân loại badge tại đây:
// ví dụ icon/vành màu khác nhau cho biến index/pointer/temporary.
</script>

<style scoped>
.watch-panel-card {
  /* PS-035: margin 16px theo spec 02-ui-ux.md §4 */
  margin: 16px;
  padding: 16px;
  /* PS-015: min-height giữ khung ổn định khi frame thiếu variables —
     trước đây `v-if` ẩn cả panel → khung co giãn đột ngột */
  min-height: 96px;
  background: color-mix(in srgb, var(--color-bg-secondary) 40%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.watch-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: 8px;
  font-weight: 600;
}

.watch-variables-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.watch-variable-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  background: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
  border-radius: 8px;
  border: 1px solid var(--color-border-subtle);
  min-width: 48px;
}

.var-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--color-text-secondary);
}

.var-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: bold;
  color: var(--color-accent-cyan);
  text-shadow: 0 0 6px var(--color-accent-cyan-glow);
}

.var-fade-enter-active {
  transition: all 0.3s ease-out;
}

.var-fade-leave-active {
  transition: all 0.2s ease-in;
}

.var-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.var-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
