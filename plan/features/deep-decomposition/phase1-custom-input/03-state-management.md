# 🗄️ Pinia State Management - useInputStore (Vue 3)

Tài liệu này đặc tả chi tiết bộ máy quản lý trạng thái nhập liệu (Input State Store) ở Frontend sử dụng **Pinia** và **TypeScript**.

---

## 1. Thiết kế Mã nguồn Pinia Store (`useInputStore.ts`)

Mã nguồn được thiết kế theo cú pháp **Vue 3 Setup Store** hiện đại, tích hợp chặt chẽ các hàm xác thực và cơ chế đồng bộ chuyển giao dữ liệu hoạt ảnh sang `useAnimationStore`.

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from './useAnimationStore';

export const useInputStore = defineStore('input', () => {
  // --- INSTANCES ---
  const animationStore = useAnimationStore();

  // ==========================================
  // 1. STATE (Trạng thái)
  // ==========================================
  const rawText = ref<string>('');
  const maxLimit = ref<number>(50); // Mặc định giới hạn 50 phần tử
  const isLoading = ref<boolean>(false);
  const apiErrorMessage = ref<string>('');

  // Biểu thức chính quy kiểm tra định dạng mảng cách nhau bởi dấu phẩy
  const arrayFormatRegex = /^([+-]?\d+)(\s*,\s*[+-]?\d+)*$/;

  // ==========================================
  // 2. GETTERS (Computed Properties)
  // ==========================================
  
  /**
   * Phân tách chuỗi thô thành mảng số nguyên tạm thời.
   */
  const parsedArray = computed<number[]>(() => {
    const cleanText = rawText.value.trim();
    if (!cleanText || !arrayFormatRegex.test(cleanText)) {
      return [];
    }
    return cleanText.split(',').map(s => parseInt(s.trim(), 10));
  });

  /**
   * Đếm số lượng phần tử thực tế hiện tại.
   */
  const elementCount = computed<number>(() => parsedArray.value.length);

  /**
   * Kiểm tra tính hợp lệ của định dạng cú pháp.
   */
  const isValidFormat = computed<boolean>(() => {
    const cleanText = rawText.value.trim();
    if (cleanText === '') return true; // Cho phép trống khi đang gõ
    return arrayFormatRegex.test(cleanText);
  });

  /**
   * Kiểm tra kích thước mảng có nằm trong ranh giới an toàn.
   */
  const isWithinLimit = computed<boolean>(() => {
    return elementCount.value <= maxLimit.value;
  });

  /**
   * Điều kiện kích hoạt nút Run thực thi giải thuật trên giao diện.
   */
  const canExecute = computed<boolean>(() => {
    return (
      rawText.value.trim() !== '' &&
      isValidFormat.value &&
      isWithinLimit.value &&
      elementCount.value > 0 &&
      !isLoading.value
    );
  });

  // ==========================================
  // 3. ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Cài đặt giới hạn an toàn tối đa tùy thuộc thuật toán được chọn.
   */
  function setLimit(limit: number) {
    maxLimit.value = limit;
  }

  /**
   * Sinh mảng ngẫu nhiên thông minh cục bộ và điền trực tiếp vào TextArea.
   */
  function generateRandomInput(type: 'random' | 'nearly-sorted' | 'reversed', size: number = 10) {
    const clampedSize = Math.min(size, maxLimit.value);
    let arr: number[] = [];

    // 1. Sinh ngẫu nhiên số trong khoảng [10, 99]
    for (let i = 0; i < clampedSize; i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }

    // 2. Điều chỉnh cấu trúc mảng cho các mục đích kiểm thử
    if (type === 'nearly-sorted') {
      arr.sort((a, b) => a - b);
      if (clampedSize > 3) {
        const idx = Math.floor(Math.random() * (clampedSize - 2));
        const temp = arr[idx];
        arr[idx] = arr[idx + 1];
        arr[idx + 1] = temp;
      }
    } else if (type === 'reversed') {
      arr.sort((a, b) => b - a);
    }

    rawText.value = arr.join(', ');
    apiErrorMessage.value = '';
  }

  /**
   * Gửi dữ liệu tùy chỉnh lên Backend API và đồng bộ hoạt họa.
   */
  async function submitCustomInput(algorithmId: string) {
    if (!canExecute.value) return;

    isLoading.value = true;
    apiErrorMessage.value = '';
    animationStore.pause(); // Tạm dừng mọi hoạt cảnh đang chạy cũ

    try {
      const response = await fetch('/api/v1/algorithms/custom-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          algorithmId: algorithmId,
          rawInput: rawText.value
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Đã xảy ra lỗi không xác định từ API.');
      }

      const result = await response.json();
      
      // CRITICAL INTEGRATION: 
      // Chuyển giao trực tiếp kết quả frames và pseudocode vừa nhận được 
      // sang AnimationStore để kích hoạt vẽ Canvas mới.
      animationStore.loadResult(result);
    } 
    catch (error: any) {
      apiErrorMessage.value = error.message || 'Không thể kết nối đến máy chủ.';
    } 
    finally {
      isLoading.value = false;
    }
  }

  function clear() {
    rawText.value = '';
    apiErrorMessage.value = '';
    isLoading.value = false;
  }

  return {
    // States
    rawText,
    maxLimit,
    isLoading,
    apiErrorMessage,
    
    // Computed Getters
    parsedArray,
    elementCount,
    isValidFormat,
    isWithinLimit,
    canExecute,
    
    // Actions
    setLimit,
    generateRandomInput,
    submitCustomInput,
    clear
  };
});
```

---

## 2. Điểm tích hợp Liên thông thiết kế (Integration Pattern)
Điểm mấu chốt của thiết kế là hành động **`submitCustomInput`** thực hiện liên kết hai Store Pinia khác nhau:
1.  `useInputStore` đóng vai trò cổng xác thực và trung gian vận chuyển. Nó chỉ thu thập chuỗi thô, gửi POST thô, bắt các lỗi API mạng.
2.  Sau khi API kiểm duyệt thành công và trả về `List<FrameDTO>`, `useInputStore` lập tức gọi `animationStore.loadResult(result)` giải phóng dữ liệu.
3.  `useAnimationStore` tiếp quản dữ liệu sạch, tự động reset `currentIndex = 0` và vẽ mảng tùy chỉnh mới toanh của người dùng lên Canvas, đưa hệ thống vào trạng thái sẵn sàng phát (`LOADED`).
