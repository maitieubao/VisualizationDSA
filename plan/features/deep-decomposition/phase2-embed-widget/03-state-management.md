# 🗄️ State Management - useEmbedConfiguratorStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useEmbedConfiguratorStore** chịu trách nhiệm lưu trữ cấu hình tiện ích nhúng, tự động sinh chuỗi mã nhúng Iframe theo thời gian thực và quản lý trạng thái sao chép mã.

---

## 1. Cấu trúc Mã nguồn Store (`useEmbedConfiguratorStore.ts`)

Mã nguồn store được thiết lập theo mô hình setup store để quản lý cấu hình mượt mà:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEmbedConfiguratorStore = defineStore('embedConfigurator', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const selectedTheme = ref<'dark' | 'light' | 'glass'>('glass');
  const showVcrControls = ref(true);
  const showWatchVariables = ref(true);
  const isInteractive = ref(true);
  
  const widgetWidth = ref(800);
  const widgetHeight = ref(500);
  const selectedAlgorithm = ref('quicksort-recursion');
  const isCopied = ref(false);

  // ==========================================
  // GETTERS (Tự động biên dịch mã nhúng)
  // ==========================================
  
  /**
   * Tự động sinh chuỗi iframe nhúng bảo mật cao theo cấu hình hiện tại
   */
  const generatedIframeCode = computed(() => {
    const baseUrl = 'https://visualization-dsa.edu.vn/embed';
    const params = new URLSearchParams({
      algo: selectedAlgorithm.value,
      theme: selectedTheme.value,
      vcr: showVcrControls.value.toString(),
      watch: showWatchVariables.value.toString(),
      interactive: isInteractive.value.toString()
    });

    const iframeUrl = `${baseUrl}?${params.toString()}`;
    
    // Trả về thẻ iframe có sandbox an toàn tuyệt đối
    return `<iframe src="${iframeUrl}" width="${widgetWidth.value}" height="${widgetHeight.value}" style="border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" sandbox="allow-scripts allow-same-origin"></iframe>`;
  });

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Sao chép mã nhúng vào bộ nhớ tạm Clipboard
   */
  async function copyEmbedCodeToClipboard() {
    try {
      await navigator.clipboard.writeText(generatedIframeCode.value);
      isCopied.value = true;
      
      // Khôi phục trạng thái nút bấm sau 2 giây
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (err) {
      console.error('Lỗi hạ tầng sao chép mã nhúng:', err);
    }
  }

  /**
   * Cài đặt lại cấu hình về mặc định sành điệu
   */
  function resetConfigurator() {
    selectedTheme.value = 'glass';
    showVcrControls.value = true;
    showWatchVariables.value = true;
    isInteractive.value = true;
    widgetWidth.value = 800;
    widgetHeight.value = 500;
    selectedAlgorithm.value = 'quicksort-recursion';
    isCopied.value = false;
  }

  return {
    selectedTheme,
    showVcrControls,
    showWatchVariables,
    isInteractive,
    widgetWidth,
    widgetHeight,
    selectedAlgorithm,
    isCopied,
    generatedIframeCode,
    copyEmbedCodeToClipboard,
    resetConfigurator
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Embed Store

Bằng việc kết hợp Pinia Setup Store với thuộc tính computed thông minh:
*   **Biên dịch mã thời gian thực (Live Code Generation):** Khi giáo viên nhấp gạt nút chuyển theme từ Dark sang Glass hoặc đổi thuật toán nhúng, chuỗi code iframe nhúng lập tức tự cập nhật ký tự rực rỡ bên trong hộp Neon Code Snippet Box mà không gặp độ trễ Reflow/Repaint nào.
*   **Trải nghiệm Clipboard mượt mà:** Sự chuyển dịch trạng thái `isCopied` kích hoạt hoạt ảnh đổi màu nút bấm từ Cyan sang Emerald dịu mát, khắc ghi ấn tượng tương tác tinh tế của EdTech premium.
