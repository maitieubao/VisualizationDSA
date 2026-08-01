<template>
  <Teleport to="body">
    <div
      v-if="store.isSharingModalOpen"
      class="share-export-dialog-backdrop"
      @click.self="store.closeModal()"
    >
      <div class="share-export-dialog-card">
        
        <h2 class="share-dialog-title">XUẤT SƠ ĐỒ / SHARE</h2>

        
        

        
        <button
          class="export-action-btn"
          :disabled="store.isExporting"
          @click="handleExport"
        >
          {{ store.isExporting ? 'Đang xuất...' : exportButtonLabel }}
        </button>

        
        

        
        <div class="divider" />

        
        <div class="share-link-section">
          <label class="section-label">Chia sẻ trạng thái phòng lab</label>
          <button
            class="generate-link-btn"
            :disabled="store.isGeneratingLink"
            @click="handleGenerateLink"
          >
            {{ store.isGeneratingLink ? 'Đang tạo...' : 'GENERATE SHARE LINK' }}
          </button>

          
          <p v-if="store.overflowError" class="overflow-error">
            {{ store.overflowError }}
          </p>

          
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

        
        

        
        <button class="close-btn" @click="store.closeModal()">Đóng</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useExportShareStore } from '../store/useExportShareStore';

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
@import "./ShareExportModal.css";
</style>
