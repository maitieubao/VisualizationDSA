<template>
  <div class="format-selector-group">
    <label class="format-label" id="format-selector-label">Định dạng xuất ảnh</label>
    <div
      class="format-buttons"
      role="radiogroup"
      aria-labelledby="format-selector-label"
    >
      <button
        v-for="fmt in EXPORT_FORMAT_OPTIONS"
        :key="fmt.id"
        class="format-btn"
        role="radio"
        :aria-checked="store.selectedFormat === fmt.id"
        :class="{ active: store.selectedFormat === fmt.id }"
        @click="store.setFormat(fmt.id)"
      >
        <span class="format-btn-label">{{ fmt.label }}</span>
        <span class="format-btn-desc">{{ fmt.description }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExportShareStore } from '../store/useExportShareStore';
import { EXPORT_FORMAT_OPTIONS } from '../types/export-share.types';

const store = useExportShareStore();
</script>

<style scoped>
.format-selector-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.format-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.format-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.format-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.format-btn:hover {
  background: color-mix(in srgb, var(--color-accent-cyan) 6%, transparent);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
}

.format-btn.active {
  background: color-mix(in srgb, var(--color-accent-cyan) 10%, transparent);
  border-color: var(--color-accent-cyan);
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-accent-cyan) 15%, transparent);
}

.format-btn-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.format-btn.active .format-btn-label {
  color: var(--color-accent-cyan);
  text-shadow: 0 0 8px color-mix(in srgb, var(--color-accent-cyan) 30%, transparent);
}

.format-btn-desc {
  font-size: 10px;
  color: var(--color-text-muted);
}
</style>
