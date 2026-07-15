/**
 * useExportShareStore — Pinia Setup Store
 *
 * Điều phối trạng thái hộp thoại xuất ảnh, quản lý tiến độ tải xuống
 * Emerald, nén băm trạng thái workspace và sinh QR Code.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  ExportFormat,
  WorkspaceState,
} from '../types/export-share.types';
import { SHARE_BASE_URL } from '../types/export-share.types';
import { WorkspaceStateCompressor } from '../engine/WorkspaceStateCompressor';
import { SVGToCanvasExporter } from '../engine/SVGToCanvasExporter';

export const useExportShareStore = defineStore('exportShare', () => {
  // ==========================================
  // STATE
  // ==========================================
  const isSharingModalOpen = ref(false);
  const isExporting = ref(false);
  const exportProgress = ref(0);
  const selectedFormat = ref<ExportFormat>('png-3x');
  const generatedShareLink = ref('');
  const isLinkCopied = ref(false);
  const isGeneratingLink = ref(false);
  const overflowError = ref('');

  // ==========================================
  // GETTERS
  // ==========================================
  const hasShareLink = computed(() => generatedShareLink.value.length > 0);

  const qrCodeValue = computed(() => generatedShareLink.value || '');

  // ==========================================
  // ACTIONS
  // ==========================================

  function openModal() {
    isSharingModalOpen.value = true;
    isLinkCopied.value = false;
    generatedShareLink.value = '';
    overflowError.value = '';
    exportProgress.value = 0;
    isExporting.value = false;
  }

  function closeModal() {
    isSharingModalOpen.value = false;
  }

  function setFormat(format: ExportFormat) {
    selectedFormat.value = format;
  }

  /**
   * Trích xuất tải ảnh PNG 3x chất lượng in ấn sắc mịn Retina
   */
  async function downloadPNG3x(svgElement: SVGElement) {
    isExporting.value = true;
    exportProgress.value = 10;

    try {
      const interval = setInterval(() => {
        if (exportProgress.value < 80) exportProgress.value += 15;
      }, 80);

      const base64Png = await SVGToCanvasExporter.exportToPNG(
        svgElement,
        3,
      );

      clearInterval(interval);
      exportProgress.value = 100;

      const link = document.createElement('a');
      link.download = `visualization-dsa-export-${Date.now()}.png`;
      link.href = base64Png;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        isExporting.value = false;
        exportProgress.value = 0;
      }, 500);
    } catch (err) {
      console.error('Lỗi hạ tầng trích xuất ảnh PNG 3x:', err);
      isExporting.value = false;
      exportProgress.value = 0;
    }
  }

  /**
   * Tải xuống SVG Vector thuần khiết
   */
  function downloadSVG(svgElement: SVGElement) {
    const svgString = SVGToCanvasExporter.exportToSVGString(svgElement);

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `visualization-dsa-export-${Date.now()}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Đóng gói nén trạng thái phòng lab và sinh link chia sẻ rút gọn
   */
  async function generateShareLink(currentState: WorkspaceState) {
    isGeneratingLink.value = true;
    overflowError.value = '';

    try {
      const compressedPayload =
        WorkspaceStateCompressor.serializeStateWithValidation(
          currentState,
        );

      if (compressedPayload === null) {
        overflowError.value =
          'WORKSPACE_OVERFLOW: Sơ đồ quá đồ sộ, vui lòng tinh gọn bớt các Node thừa trước khi chia sẻ!';
        isGeneratingLink.value = false;
        return;
      }

      // Client-side URL generation (no backend dependency)
      const host = SHARE_BASE_URL;
      generatedShareLink.value = `${host}/s/?state=${compressedPayload}`;
    } catch (err) {
      console.error('Lỗi hạ tầng sinh mã liên kết chia sẻ:', err);
    } finally {
      isGeneratingLink.value = false;
    }
  }

  /**
   * Sao chép nhanh liên kết vào Clipboard
   */
  async function copyShareLinkToClipboard(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(generatedShareLink.value);
      isLinkCopied.value = true;
      setTimeout(() => {
        isLinkCopied.value = false;
      }, 2000);
      return true;
    } catch (err) {
      console.error('Lỗi hạ tầng sao chép link chia sẻ:', err);
      return false;
    }
  }

  function resetState() {
    isSharingModalOpen.value = false;
    isExporting.value = false;
    exportProgress.value = 0;
    selectedFormat.value = 'png-3x';
    generatedShareLink.value = '';
    isLinkCopied.value = false;
    isGeneratingLink.value = false;
    overflowError.value = '';
  }

  return {
    // State
    isSharingModalOpen,
    isExporting,
    exportProgress,
    selectedFormat,
    generatedShareLink,
    isLinkCopied,
    isGeneratingLink,
    overflowError,
    // Getters
    hasShareLink,
    qrCodeValue,
    // Actions
    openModal,
    closeModal,
    setFormat,
    downloadPNG3x,
    downloadSVG,
    generateShareLink,
    copyShareLinkToClipboard,
    resetState,
  };
});
