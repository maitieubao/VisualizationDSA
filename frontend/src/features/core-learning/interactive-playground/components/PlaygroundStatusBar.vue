<template>
  <div class="status-bar">
    <div class="status-info">
      <span>Nodes: {{ store.nodeCount }}</span>
      <span class="separator">|</span>
      <span>Edges: {{ store.edgeCount }}</span>
      <span class="separator">|</span>
      <span class="mode-badge">{{ modeLabel }}</span>
    </div>
    <div class="status-actions">
      <button class="action-btn" title="Xuất đồ thị (JSON)" @click="$emit('export')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>
      <label class="action-btn-label" title="Nhập đồ thị (JSON)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Import
        <input type="file" accept=".json" class="hidden" @change="onImportFile" />
      </label>
      <button class="run-btn" title="Chạy thuật toán (xuất JSON payload)" @click="$emit('run')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Run
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlaygroundStore } from '../store/usePlaygroundStore';

const store = usePlaygroundStore();
const emit = defineEmits(['export', 'import', 'run']);

const modeLabel = computed(() => {
  const labels: Record<string, string> = { SELECT: 'Di chuyển', ADD_NODE: 'Thêm đỉnh', ADD_EDGE: 'Thêm cạnh', WEIGHT: 'Trọng số', DELETE: 'Xóa' };
  return labels[store.mode] || store.mode;
});

function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) emit('import', file);
  input.value = '';
}
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: color-mix(in srgb, var(--color-bg-secondary) 80%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--color-border-subtle);
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.separator {
  color: var(--color-text-muted);
  user-select: none;
}

.mode-badge {
  padding: 2px 10px;
  border-radius: var(--radius-xl);
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  font-weight: var(--font-semibold);
  font-size: var(--text-xs);
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn, .action-btn-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  background-color: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: var(--font-sans);
}

.action-btn:hover, .action-btn-label:hover {
  background-color: var(--color-bg-active);
  color: var(--color-text-primary);
}

.action-btn-label input[type="file"] {
  display: none;
}

.run-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--color-accent-green) 30%, transparent);
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: var(--transition-fast);
  font-family: var(--font-sans);
}

.run-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent-green) 30%, transparent);
}
</style>
