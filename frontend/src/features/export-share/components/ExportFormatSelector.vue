<template>
  <div class="format-selector-group">
    <label class="format-label">Định dạng xuất ảnh</label>
    <div class="format-buttons">
      <button
        v-for="fmt in EXPORT_FORMAT_OPTIONS"
        :key="fmt.id"
        class="format-btn"
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
  color: #94a3b8;
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
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.format-btn:hover {
  background: rgba(6, 182, 212, 0.06);
  border-color: rgba(6, 182, 212, 0.2);
}

.format-btn.active {
  background: rgba(6, 182, 212, 0.1);
  border-color: #06b6d4;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.15);
}

.format-btn-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
}

.format-btn.active .format-btn-label {
  color: #06b6d4;
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
}

.format-btn-desc {
  font-size: 10px;
  color: #64748b;
}
</style>
