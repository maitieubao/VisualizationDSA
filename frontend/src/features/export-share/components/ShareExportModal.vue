<template>
  <Teleport to="body">
    <div
      v-if="store.isSharingModalOpen"
      class="share-export-dialog-backdrop"
      @click.self="store.closeModal()"
    >
      <div
        ref="overlayEl"
        class="share-export-dialog-card"
        role="dialog"
        aria-modal="true"
        aria-label="Xuất sơ đồ và chia sẻ phòng lab"
      >
        
        <h2 class="share-dialog-title">XUẤT SƠ ĐỒ / SHARE</h2>

        
        <ExportFormatSelector />

        
        <button
          class="export-action-btn"
          :disabled="store.isExporting"
          @click="handleExport"
        >
          {{ store.isExporting ? 'Đang xuất...' : exportButtonLabel }}
        </button>

        
        <p v-if="store.exportError" class="overflow-error" role="alert">
          {{ store.exportError }}
        </p>

        
        <ExportProgressBar />

        
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

          
          <p v-if="store.linkError" class="overflow-error" role="alert">
            {{ store.linkError }}
          </p>

          
          <div v-if="store.hasShareLink" class="link-display">
            <code class="link-text">{{ store.generatedShareLink }}</code>
            <button
              class="copy-btn"
              :class="{ copied: store.isLinkCopied }"
              @click="handleCopyLink"
            >
              {{ store.isLinkCopied ? 'COPIED!' : 'COPY LINK' }}
            </button>
          </div>
        </div>

        
        <QRCodeDisplay />

        
        <button class="close-btn" @click="store.closeModal()">Đóng</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useExportShareStore } from '../store/useExportShareStore';
import { useModalA11y } from '../../../composables/useModalA11y';
import { useToastStore } from '../../../composables/useToast';
import ExportFormatSelector from './ExportFormatSelector.vue';
import ExportProgressBar from './ExportProgressBar.vue';
import QRCodeDisplay from './QRCodeDisplay.vue';
import type { WorkspaceState } from '../types/export-share.types';

const store = useExportShareStore();
const toastStore = useToastStore();

const props = defineProps<{
  svgElement?: SVGElement | null;
  workspaceState?: WorkspaceState | null;
}>();

// EX-006: role=dialog + aria-modal + focus trap (Tab) + đóng bằng Esc +
// scroll-lock + hoàn trả focus — dùng useModalA11y chung của dự án.
const { isSharingModalOpen } = storeToRefs(store);
const { overlayEl } = useModalA11y(isSharingModalOpen);

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

// EX-017: clipboard API fail (https thiếu quyền, localhost http, trình duyệt
// chặn...) → fallback execCommand('copy') qua textarea ẩn; nếu cả hai thất bại
// → toast lỗi rõ ràng thay vì im lặng.
function copyWithExecCommand(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch (err) {
    console.error('Lỗi hạ tầng fallback sao chép liên kết:', err);
    return false;
  }
}

async function handleCopyLink(): Promise<void> {
  const copied = await store.copyShareLinkToClipboard();
  if (copied) return;

  const fallbackCopied = copyWithExecCommand(store.generatedShareLink);
  if (fallbackCopied) {
    store.isLinkCopied = true;
    setTimeout(() => {
      store.isLinkCopied = false;
    }, 2000);
    return;
  }

  toastStore.error(
    'Không thể sao chép liên kết tự động. Vui lòng bôi đen và copy thủ công.',
    'Sao chép thất bại',
  );
}
</script>

<style scoped>
@import "./ShareExportModal.css";
</style>
