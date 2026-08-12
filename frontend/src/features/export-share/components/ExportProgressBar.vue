<template>
  <div
    v-if="store.isExporting"
    class="export-progress-section"
    role="progressbar"
    :aria-valuenow="store.exportProgress"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-live="polite"
    :aria-label="progressLabel"
  >
    <div class="progress-label">
      <span class="progress-text">{{ progressLabel }}</span>
      <span class="progress-percent">{{ store.exportProgress }}%</span>
    </div>
    <div class="export-progress-bar-container">
      <div
        class="export-progress-bar-fill"
        :style="{ width: store.exportProgress + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useExportShareStore } from '../store/useExportShareStore';

const store = useExportShareStore();

// EX-025 (phần view): nhãn tiến trình khớp đúng định dạng đang xuất — SVG không
// chạy đoạn kết xuất pixel Retina (chỉ PNG mới có), tránh text sai format.
const progressLabel = computed(() =>
  store.selectedFormat === 'png-3x'
    ? 'Đang kết xuất pixel Retina 3x...'
    : 'Đang đóng gói vector SVG...',
);
</script>

<style scoped>
.export-progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.progress-percent {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-accent-emerald);
  text-shadow: 0 0 8px color-mix(in srgb, var(--color-accent-emerald) 30%, transparent);
}

.export-progress-bar-container {
  width: 100%;
  height: 8px;
  background: var(--color-bg-hover);
  border-radius: 4px;
  overflow: hidden;
}

.export-progress-bar-fill {
  height: 100%;
  background: var(--color-accent-emerald);
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-accent-emerald) 40%, transparent);
  transition: width 0.3s ease-out;
  border-radius: 4px;
}
</style>
