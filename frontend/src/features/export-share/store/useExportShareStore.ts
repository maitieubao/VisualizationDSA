import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  ExportFormat,
  WorkspaceState,
} from '../types/export-share.types';
import { SHARE_BASE_URL } from '../types/export-share.types';
import { WorkspaceStateCompressor } from '../engine/WorkspaceStateCompressor';
import { SVGToCanvasExporter } from '../engine/SVGToCanvasExporter';

// EX-024: Đọc CSS var nhưng chỉ chấp nhận giá trị hex (#rgb/#rrggbb);
// mọi giá trị lạ (rgb(), color-mix(), rỗng) → fallback hex hợp lệ
// để QRCodeDisplay không bao giờ vẽ fail vì màu không hợp lệ.
function resolveValidHexColor(cssVarName: string, fallbackHex: string): string {
  if (typeof window === 'undefined') return fallbackHex;
  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarName)
    .trim();
  const hexMatch = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!hexMatch || !hexMatch[1]) return fallbackHex;
  const hex = hexMatch[1].toLowerCase();
  if (hex.length === 3) {
    return `#${hex.charAt(0)}${hex.charAt(0)}${hex.charAt(1)}${hex.charAt(1)}${hex.charAt(2)}${hex.charAt(2)}`;
  }
  return `#${hex}`;
}

function describeError(err: unknown): string {
  return err instanceof Error ? err.message : 'Lỗi không xác định.';
}

// EX-014: revokeObjectURL hoãn sang setTimeout 0 sau link.click() —
// Firefox/Edge có thể hủy download nếu thu hồi ngay lập tức.
function triggerDownload(
  href: string,
  filename: string,
  revokeObjectUrl = false,
): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = href;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (revokeObjectUrl) {
    setTimeout(() => {
      URL.revokeObjectURL(href);
    }, 0);
  }
}

export const useExportShareStore = defineStore('exportShare', () => {
  const isSharingModalOpen = ref(false);
  const isExporting = ref(false);
  const exportProgress = ref(0);
  const selectedFormat = ref<ExportFormat>('png-3x');
  const generatedShareLink = ref('');
  const isLinkCopied = ref(false);
  const isGeneratingLink = ref(false);
  const overflowError = ref('');
  // EX-004: lỗi xuất file (PNG/SVG) và lỗi link/copy — set khi fail, clear khi thành công.
  const exportError = ref('');
  const linkError = ref('');

  const hasShareLink = computed(() => generatedShareLink.value.length > 0);

  const qrCodeValue = computed(() => generatedShareLink.value || '');

  // EX-024: Màu QR hex hợp lệ cấp sẵn cho QRCodeDisplay.
  const qrDarkColor = computed(() =>
    resolveValidHexColor('--color-text-primary', '#000000'),
  );
  const qrLightColor = computed(() =>
    resolveValidHexColor('--color-bg-primary', '#ffffff'),
  );

  function openModal() {
    isSharingModalOpen.value = true;
    isLinkCopied.value = false;
    generatedShareLink.value = '';
    overflowError.value = '';
    exportError.value = '';
    linkError.value = '';
    exportProgress.value = 0;
    isExporting.value = false;
  }

  function closeModal() {
    isSharingModalOpen.value = false;
  }

  function setFormat(format: ExportFormat) {
    selectedFormat.value = format;
  }

  async function downloadPNG3x(svgElement: SVGElement) {
    isExporting.value = true;
    exportError.value = '';
    exportProgress.value = 10;

    // EX-025: Không còn timer giả — progress theo bước thật từ exporter
    // (30=đóng gói CSS, 50=mã hóa SVG, 75=vẽ raster, 90=encode PNG).
    try {
      const base64Png = await SVGToCanvasExporter.exportToPNG(
        svgElement,
        3,
        (percent) => {
          exportProgress.value = percent;
        },
      );

      exportProgress.value = 100;
      triggerDownload(
        base64Png,
        `visualization-dsa-export-${Date.now()}.png`,
      );
    } catch (err) {
      exportError.value = `Xuất ảnh PNG 3x thất bại: ${describeError(err)}`;
      console.error('Lỗi hạ tầng trích xuất ảnh PNG 3x:', err);
    } finally {
      isExporting.value = false;
      exportProgress.value = 0;
    }
  }

  async function downloadSVG(svgElement: SVGElement) {
    // EX-012: downloadSVG khớp với PNG — isExporting + try/catch,
    // hết double-click ra 2 file và lỗi không kiểm soát.
    isExporting.value = true;
    exportError.value = '';

    try {
      const svgString = SVGToCanvasExporter.exportToSVGString(svgElement);

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      triggerDownload(
        url,
        `visualization-dsa-export-${Date.now()}.svg`,
        true,
      );
    } catch (err) {
      exportError.value = `Xuất tệp SVG vector thất bại: ${describeError(err)}`;
      console.error('Lỗi hạ tầng xuất tệp SVG vector:', err);
    } finally {
      isExporting.value = false;
    }
  }

  async function generateShareLink(currentState: WorkspaceState) {
    isGeneratingLink.value = true;
    overflowError.value = '';
    linkError.value = '';

    try {
      const compressedPayload =
        WorkspaceStateCompressor.serializeStateWithValidation(currentState);

      if (compressedPayload === null) {
        // EX-011: overflow → xóa link cũ trước, hết cảnh link cũ hiển thị cạnh lỗi.
        generatedShareLink.value = '';
        overflowError.value =
          'WORKSPACE_OVERFLOW: Sơ đồ quá đồ sộ, vui lòng tinh gọn bớt các Node thừa trước khi chia sẻ!';
        return;
      }

      // EX-013: encodeURIComponent toàn payload — lz-string có thể chứa `+`/`=`,
      // URLSearchParams decode ra khoảng trắng phá payload nếu nhét thô.
      const host = SHARE_BASE_URL;
      generatedShareLink.value = `${host}/s/?state=${encodeURIComponent(compressedPayload)}`;
    } catch (err) {
      generatedShareLink.value = '';
      linkError.value = 'Tạo liên kết chia sẻ thất bại, vui lòng thử lại.';
      console.error('Lỗi hạ tầng sinh mã liên kết chia sẻ:', err);
    } finally {
      isGeneratingLink.value = false;
    }
  }

  async function copyShareLinkToClipboard(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(generatedShareLink.value);
      isLinkCopied.value = true;
      linkError.value = '';
      setTimeout(() => {
        isLinkCopied.value = false;
      }, 2000);
      return true;
    } catch (err) {
      linkError.value = 'Sao chép liên kết chia sẻ thất bại, vui lòng thử lại.';
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
    exportError.value = '';
    linkError.value = '';
  }

  return {
    isSharingModalOpen,
    isExporting,
    exportProgress,
    selectedFormat,
    generatedShareLink,
    isLinkCopied,
    isGeneratingLink,
    overflowError,
    exportError,
    linkError,
    hasShareLink,
    qrCodeValue,
    qrDarkColor,
    qrLightColor,
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
