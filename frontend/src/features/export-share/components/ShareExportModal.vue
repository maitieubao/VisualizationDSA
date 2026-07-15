<template>
  <Teleport to="body">
    <div
      v-if="store.isSharingModalOpen"
      class="share-export-dialog-backdrop"
      @click.self="store.closeModal()"
    >
      <div class="share-export-dialog-card">
        <!-- Title -->
        <h2 class="share-dialog-title">XUẤT SƠ ĐỒ / SHARE</h2>

        <!-- Format Selector -->
        <ExportFormatSelector />

        <!-- Export Button -->
        <button
          class="export-action-btn"
          :disabled="store.isExporting"
          @click="handleExport"
        >
          {{ store.isExporting ? 'Đang xuất...' : exportButtonLabel }}
        </button>

        <!-- Progress Bar -->
        <ExportProgressBar />

        <!-- Divider -->
        <div class="divider" />

        <!-- Share Link Section -->
        <div class="share-link-section">
          <label class="section-label">Chia sẻ trạng thái phòng lab</label>
          <button
            class="generate-link-btn"
            :disabled="store.isGeneratingLink"
            @click="handleGenerateLink"
          >
            {{ store.isGeneratingLink ? 'Đang tạo...' : 'GENERATE SHARE LINK' }}
          </button>

          <!-- Overflow Error -->
          <p v-if="store.overflowError" class="overflow-error">
            {{ store.overflowError }}
          </p>

          <!-- Generated Link Display -->
          <div v-if="store.hasShareLink" class="link-display">
            <code class="link-text">{{ store.generatedShareLink }}</code>
            <button
              class="copy-btn"
              :class="{ copied: store.isLinkCopied }"
              @click="store.copyShareLinkToClipboard()"
            >
              {{ store.isLinkCopied ? 'COPIED!' : 'COPY LINK' }}
            </button>
          </div>
        </div>

        <!-- QR Code -->
        <QRCodeDisplay />

        <!-- Close Button -->
        <button class="close-btn" @click="store.closeModal()">Đóng</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useExportShareStore } from '../store/useExportShareStore';
import ExportFormatSelector from './ExportFormatSelector.vue';
import ExportProgressBar from './ExportProgressBar.vue';
import QRCodeDisplay from './QRCodeDisplay.vue';
import type { WorkspaceState } from '../types/export-share.types';

const store = useExportShareStore();

const props = defineProps<{
  svgElement?: SVGElement | null;
  workspaceState?: WorkspaceState | null;
}>();

const exportButtonLabel = computed(() =>
  store.selectedFormat === 'png-3x'
    ? 'TẢI ẢNH PNG 3X (RETINA SHARP)'
    : 'TẢI TỆP SVG VECTOR',
);

function handleExport() {
  if (!props.svgElement) return;
  if (store.selectedFormat === 'png-3x') {
    store.downloadPNG3x(props.svgElement);
  } else {
    store.downloadSVG(props.svgElement);
  }
}

function handleGenerateLink() {
  if (!props.workspaceState) return;
  store.generateShareLink(props.workspaceState);
}
</script>

<style scoped>
.share-export-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 12, 24, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.share-export-dialog-card {
  width: 460px;
  max-height: 90vh;
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.share-dialog-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #06b6d4;
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
  text-align: center;
}

.export-action-btn {
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.export-action-btn:hover:not(:disabled) {
  background: rgba(6, 182, 212, 0.2);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}

.export-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.share-link-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.generate-link-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  color: #f59e0b;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-link-btn:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.15);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.15);
}

.generate-link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.overflow-error {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #ef4444;
  text-shadow: 0 0 6px rgba(239, 68, 68, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.link-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 10px;
}

.link-text {
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #06b6d4;
  word-break: break-all;
}

.copy-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.copy-btn.copied {
  color: #10b981;
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.close-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}
</style>
