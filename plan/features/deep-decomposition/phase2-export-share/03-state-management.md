# 🗄️ State Management - useExportShareStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useExportShareStore** chịu trách nhiệm điều phối trạng thái hộp thoại xuất ảnh, quản lý tiến độ tải xuống Emerald và băm nén trạng thái phòng lab gửi lên Supabase Database.

---

## 1. Cấu trúc Mã nguồn Store (`useExportShareStore.ts`)

Mã nguồn store được viết theo mô hình setup store tối ưu, tích hợp bộ nén hạt nhân:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { WorkspaceState, WorkspaceStateCompressor, SVGToCanvasExporter } from '../utils/WorkspaceStateCompressor';

export const useExportShareStore = defineStore('exportShare', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const isSharingModalOpen = ref(false);
  const isExporting = ref(false);
  const exportProgress = ref(0);
  const generatedShareLink = ref('');
  const isLinkCopied = ref(false);
  
  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Đóng mở Modal Xuất bản
   */
  function toggleSharingModal(isOpen: boolean) {
    isSharingModalOpen.value = isOpen;
    if (isOpen) {
      isLinkCopied.value = false;
      generatedShareLink.value = '';
    }
  }

  /**
   * Trích xuất tải ảnh PNG 3x chất lượng in ấn sắc mịn Retina
   */
  async function downloadPNG3x(svgElement: SVGElement) {
    isExporting.value = true;
    exportProgress.value = 10;

    try {
      // Giả lập tiến trình chạy mượt mà Emerald
      const interval = setInterval(() => {
        if (exportProgress.value < 80) exportProgress.value += 15;
      }, 80);

      const base64Png = await SVGToCanvasExporter.exportToPNG(svgElement, 3);
      
      clearInterval(interval);
      exportProgress.value = 100;

      // Tạo thẻ anchor tải tệp tự động
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
   * Đóng gói bén nén trạng thái phòng lab và lưu lên máy chủ rút gọn URL
   */
  async function generateShareLink(currentState: WorkspaceState) {
    try {
      // 1. Nén lz-string sâu Base64 URL-Safe
      const compressedPayload = WorkspaceStateCompressor.serializeState(currentState);

      // 2. Gửi mã băm lên Backend ASP.NET Core để đăng ký rút gọn vào Supabase DB
      const res = await fetch('/api/v1/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compressedState: compressedPayload,
          title: `Chia sẻ sơ đồ thuật toán của sinh viên`
        })
      });

      if (!res.ok) throw new Error('Không thể kết nối máy chủ tạo link chia sẻ.');
      const data = await res.json(); // Nhận shareId băm rút gọn từ Backend (ví dụ: "e8x9a")
      
      const host = window.location.origin;
      generatedShareLink.value = `${host}/s/${data.shareId}`;
    } catch (err) {
      console.error('Lỗi hạ tầng sinh mã liên kết chia sẻ:', err);
    }
  }

  /**
   * Sao chép nhanh liên kết vào Clipboard
   */
  async function copyShareLinkToClipboard() {
    try {
      await navigator.clipboard.writeText(generatedShareLink.value);
      isLinkCopied.value = true;
      setTimeout(() => {
        isLinkCopied.value = false;
      }, 2000);
    } catch (err) {
      console.error('Lỗi hạ tầng sao chép link chia sẻ:', err);
    }
  }

  return {
    isSharingModalOpen,
    isExporting,
    exportProgress,
    generatedShareLink,
    isLinkCopied,
    toggleSharingModal,
    downloadPNG3x,
    generateShareLink,
    copyShareLinkToClipboard
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồng bộ Xuất ảnh Pinia Store

Bằng việc kết hợp Pinia Setup Store với động cơ `SVGToCanvasExporter` và `WorkspaceStateCompressor`:
*   **Xuất ảnh tức thì không tắc nghẽn (Zero lag):** Tiến trình trích xuất vector sang PNG sắc nét 3x diễn ra hoàn hảo tại trình duyệt máy khách, giải phóng hoàn toàn gánh nặng CPU backend.
*   **Hoạt ảnh Emerald đồng bộ trực giác:** Thanh tiến trình Emerald chạy mượt từ 10% đến 100% giúp sinh viên hứng thú theo dõi tiến trình đóng gói, biến thao tác tải tệp khô khan thành trải nghiệm công nghệ lôi cuốn.
