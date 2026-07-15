# 🗄️ Pinia State Management - useAlgorithmStore (Vue 3)

Tài liệu này đặc tả chi tiết bộ máy quản lý danh sách thuật toán (Algorithm Catalog Store) ở Frontend sử dụng **Pinia** và **TypeScript**.

---

## 1. Thiết kế Mã nguồn Pinia Store (`useAlgorithmStore.ts`)

Mã nguồn được thiết kế theo cú pháp **Vue 3 Setup Store** hiện đại, quản lý danh sách danh mục thuật toán hiển thị ngoài Dashboard và siêu dữ liệu lý thuyết chi tiết của thuật toán đang học.

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

// ==========================================
// ĐỊNH NGHĨA INTERFACES & KIỂU DỮ LIỆU
// ==========================================

export interface Algorithm {
  id: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeComplexity: string;
  spaceComplexity: string;
}

export interface AlgorithmMetadata {
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  pseudoCode: string[];
}

export const useAlgorithmStore = defineStore('algorithm', () => {
  // ==========================================
  // 1. STATE (Trạng thái)
  // ==========================================
  const algorithms = ref<Algorithm[]>([]);
  const currentAlgorithm = ref<Algorithm | null>(null);
  const metadata = ref<AlgorithmMetadata | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string>('');

  // ==========================================
  // 2. ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Tải danh sách tất cả các thuật toán có trong thư viện hiển thị lên Dashboard.
   */
  async function fetchAlgorithms() {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await fetch('/api/v1/algorithms');
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách thuật toán từ máy chủ.');
      }
      
      algorithms.value = await response.json();
    } 
    catch (err: any) {
      error.value = err.message || 'Không thể kết nối đến API.';
    } 
    finally {
      isLoading.value = false;
    }
  }

  /**
   * Tải lý thuyết chi tiết và mã giả của thuật toán được chỉ định.
   */
  async function loadAlgorithmDetails(algoId: string) {
    isLoading.value = true;
    error.value = '';
    
    // Tìm kiếm nhanh trong bộ nhớ đệm client
    const matched = algorithms.value.find(a => a.id === algoId);
    if (matched) {
      currentAlgorithm.value = matched;
    }

    try {
      const response = await fetch(`/api/v1/algorithms/${algoId}/metadata`);
      
      if (!response.ok) {
        throw new Error('Không thể tải siêu dữ liệu chi tiết của giải thuật.');
      }
      
      metadata.value = await response.json();
    } 
    catch (err: any) {
      error.value = err.message || 'Không thể tải dữ liệu chi tiết.';
      metadata.value = null;
    } 
    finally {
      isLoading.value = false;
    }
  }

  /**
   * Giải phóng bộ nhớ đệm thuật toán đang học khi người dùng quay lại Dashboard.
   */
  function clearActive() {
    currentAlgorithm.value = null;
    metadata.value = null;
    error.value = '';
  }

  return {
    // States
    algorithms,
    currentAlgorithm,
    metadata,
    isLoading,
    error,
    
    // Actions
    fetchAlgorithms,
    loadAlgorithmDetails,
    clearActive
  };
});
```

---

## 2. Lợi thế của Thiết kế Phân rã Store (Decoupled Store Benefit)

Bằng cách thiết lập riêng biệt `useAlgorithmStore` tách rời khỏi `useAnimationStore` (quản lý timeline phát và vẽ Canvas):
*   **Hiệu năng vượt trội:** Quá trình chuyển trang hoặc tải lý thuyết không ảnh hưởng đến bộ đếm thời gian hoặc hoạt ảnh Canvas đang vẽ.
*   **Tách biệt nhiệm vụ (Separation of Concerns):** `useAlgorithmStore` chỉ chịu trách nhiệm truy xuất mục lục tĩnh và lý thuyết, trong khi `useAnimationStore` tập trung tối đa cho việc xử lý khung hình hoạt họa 60 FPS động, giúp mã nguồn trở nên gọn gàng, mạch lạc và dễ viết Unit Test.
