<template>
  <div v-if="store.isExporting" class="export-progress-section">
    <div class="progress-label">
      <span class="progress-text">Đang đóng gói quy tắc CSS & kết xuất pixel...</span>
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
import { useExportShareStore } from '../store/useExportShareStore';

const store = useExportShareStore();
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
  color: #94a3b8;
}

.progress-percent {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #10b981;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

.export-progress-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.export-progress-bar-fill {
  height: 100%;
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
  transition: width 0.3s ease-out;
  border-radius: 4px;
}
</style>
