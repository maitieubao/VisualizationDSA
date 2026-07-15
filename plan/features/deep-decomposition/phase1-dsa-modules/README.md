# 📚 THƯ VIỆN GIẢI THUẬT & CẤU TRÚC DỮ LIỆU (DSA MODULES LIBRARY)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **DSA Modules Library** - trái tim nội dung cốt lõi của dự án **VisualizationDSA**. Tài liệu này đặc tả chi tiết từ yêu cầu nghiệp vụ (PRD), thiết kế giao diện đa dạng cấu trúc biểu diễn (HTML5 Canvas UI/UX), kiến trúc Plugin mở rộng tự động ở Backend (.NET Core) sử dụng Reflection và Strategy Pattern, đến hệ thống quản lý danh sách và lý thuyết thuật toán ở Frontend (Pinia Store).

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Mục tiêu Nghiệp vụ & Danh mục Thuật toán MVP (PRD)](#1-mục-tiêu-nghiệp-vụ--danh-mục-thuật-toán-mvp-prd)
2. [Kiến trúc Hệ thống Plugin & Tự động Đăng ký (TECHNICAL SPEC)](#2-kiến-trúc-hệ-thống-plugin--tự-động-đăng-ký-technical-spec)
3. [Hiện thực hóa Logic Sinh State Quy nạp ở Backend (Backend C# Core Logic)](#3-hiện-thực-hóa-logic-sinh-state-quy-nạp-ở-backend-backend-c-core-logic)
4. [Đặc tả Trình diễn Đa cấu trúc Đồ họa (Canvas UI/UX Visual Forms)](#4-đặc-tả-trình-diễn-đa-cấu-trúc-đồ-họa-canvas-uiux-visual-forms)
5. [Quản lý Metadata & Danh sách Giải thuật (Frontend Pinia Store)](#5-quản-lý-metadata--danh-sách-giải-thuật-frontend-pinia-store)
6. [Đặc tả API Giao tiếp & JSON Schema Contracts](#6-đặc-tả-api-giao-tiếp--json-schema-contracts)
7. [Quyết định Kiến trúc & Đảm bảo Nguyên tắc SOLID (ADR)](#7-quyết-định-kiến-trúc--đảm-bảo-nguyên-tắc-solid-adr)
8. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#8-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. MỤC TIÊU NGHIỆP VỤ & DANH MỤC THUẬT TOÁN MVP (PRD)

### 1.1. Tầm nhìn Sư phạm
Bộ thư viện giải thuật không chỉ đơn thuần là code chạy được, mà là một **học cụ sư phạm trực quan**. Nhiệm vụ tối thượng là giúp người học hình dung được cấu trúc dữ liệu co giãn như thế nào trong bộ nhớ, các con trỏ trượt đi đâu, và các giá trị hoán đổi vị trí theo quy luật ra sao.

### 1.2. Danh mục Thuật toán MVP (Phase 1 MVP Catalog)
Để đảm bảo phủ rộng kiến thức cơ bản trong chương trình đại học, Phase 1 tập trung xây dựng 4 nhóm giải thuật nền tảng:

| Phân nhóm | Thuật toán cụ thể | Cấu trúc biểu diễn đồ họa Canvas | Độ phức tạp thời gian |
|:---|:---|:---|:---|
| **Sắp xếp (Sorting)** | Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort | Biểu đồ cột đứng tương thích chiều cao (Bars) | $O(N^2)$ đến $O(N \log N)$ |
| **Tìm kiếm (Searching)** | Linear Search, Binary Search | Dãy các ô vuông nằm ngang (Box Array) | $O(N)$ đến $O(\log N)$ |
| **CTDL Tuyến tính** | Ngăn xếp (Stack), Hàng đợi (Queue) | Ống chứa dọc LIFO / Ống chứa ngang FIFO (Tube) | $O(1)$ cho Push/Pop/Enqueue/Dequeue |
| **CTDL Phi tuyến** | Cây tìm kiếm nhị phân (BST) | Sơ đồ hình tròn node liên kết mũi tên (Node/Edge) | $O(\log N)$ trung bình |

---

## 2. KIẾN TRÚC HỆ THỐNG PLUGIN & TỰ ĐỘNG ĐĂNG KÝ (TECHNICAL SPEC)

Hệ thống tuân thủ chặt chẽ nguyên lý **Open/Closed Principle (SOLID)**. Chúng ta thiết kế một cơ chế Plugin bằng cách định nghĩa Interface chung `IAlgorithmStrategy`. Khi muốn thêm thuật toán mới, lập trình viên chỉ cần tạo Class mới kế thừa interface này mà không cần động vào mã nguồn gốc của hệ thống.

```
                  +----------------------------------+
                  |       IAlgorithmStrategy         | (Interface Lõi)
                  +----------------------------------+
                                    ^
                                    | Kế thừa & Hiện thực hóa
         +--------------------------+--------------------------+
         |                          |                          |
+------------------+       +------------------+       +------------------+
| BubbleSort       |       | QuickSort        |       | BinarySearch     | (Các Plugin độc lập)
| - Id: bubble-sort|       | - Id: quick-sort |       | - Id: bin-search |
+------------------+       +------------------+       +------------------+
         |                          |                          |
         +--------------------------+--------------------------+
                                    |
                                    v Tự động Quét (Scan) qua Reflection
                  +----------------------------------+
                  |    Microsoft DI Container C#     |
                  +----------------------------------+
```

### 2.1. Mã nguồn Interface Chiến thuật (`IAlgorithmStrategy.cs`)
```csharp
using System.Collections.Generic;
using VisualizationDSA.Core.DTOs;

namespace VisualizationDSA.Core.Strategies
{
    public interface IAlgorithmStrategy
    {
        string AlgorithmId { get; }
        string Name { get; }
        string Category { get; }
        AlgorithmMetadata GetMetadata();
        List<FrameDTO> Execute(int[] inputData);
    }
}
```

### 2.2. Đăng ký Tự động bằng Reflection (Dependency Injection Container)
Thay vì gõ thủ công hàng chục dòng đăng ký DI tẻ nhạt trong `Program.cs`, chúng ta viết bộ quét tự động bằng công nghệ phản chiếu (Reflection) của .NET:

```csharp
using System;
using System.Linq;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using VisualizationDSA.Core.Strategies;

namespace VisualizationDSA.Infrastructure.Extensions
{
    public static class AlgorithmDependencyInjection
    {
        public static IServiceCollection AddAlgorithmStrategies(this IServiceCollection services)
        {
            // Quét qua Assembly hiện tại chứa các thuật toán
            var strategyTypes = Assembly.GetExecutingAssembly().GetTypes()
                .Where(t => typeof(IAlgorithmStrategy).IsAssignableFrom(t) 
                            && !t.IsInterface 
                            && !t.IsAbstract);

            foreach (var type in strategyTypes)
            {
                // Đăng ký dưới dạng Transient để giải phóng bộ nhớ ngay sau khi dùng xong
                services.AddTransient(typeof(IAlgorithmStrategy), type);
            }

            return services;
        }
    }
}
```

---

## 3. HIỆN THỰC HÓA LOGIC SINH STATE QUY NẠP Ở BACKEND (BACKEND C# CORE LOGIC)

Việc viết giải thuật trực quan đòi hỏi tư duy khác biệt hoàn toàn so với viết thuật toán thông thường. Thay vì chỉ chạy vèo một mạch và trả về kết quả cuối cùng, chúng ta phải thiết lập các điểm **chụp lại snapshot trạng thái (CaptureState)** sau mỗi hành động so sánh, dịch chuyển con trỏ, hoán vị phần tử.

### 3.1. Đặc tả Thuật toán Phức tạp: Quick Sort Đệ Quy (C#)
Đối với thuật toán đệ quy như Quick Sort, việc theo dõi con trỏ `Pivot`, `Left`, `Right` và tái cấu trúc trạng thái mảng đòi hỏi sự tinh tế cao:

```csharp
using System.Collections.Generic;
using VisualizationDSA.Core.DTOs;
using VisualizationDSA.Core.Strategies;

namespace VisualizationDSA.Core.Algorithms
{
    public class QuickSortStrategy : IAlgorithmStrategy
    {
        public string AlgorithmId => "quick-sort";
        public string Name => "Sắp xếp Nhanh (Quick Sort)";
        public string Category => "Sorting";

        private List<FrameDTO> _frames;
        private int _stepCounter;

        public AlgorithmMetadata GetMetadata()
        {
            return new AlgorithmMetadata
            {
                TimeComplexity = "O(N log N)",
                SpaceComplexity = "O(log N)",
                Description = "Quick Sort hoạt động theo nguyên lý chia để trị (Divide and Conquer). Chọn một phần tử làm chốt (Pivot), phân chia mảng thành hai nửa sao cho một nửa nhỏ hơn chốt và nửa kia lớn hơn chốt, sau đó đệ quy sắp xếp từng nửa."
            };
        }

        public List<FrameDTO> Execute(int[] inputData)
        {
            _frames = new List<FrameDTO>();
            _stepCounter = 1;
            
            int[] workingArray = (int[])inputData.Clone();
            
            // Chụp frame ban đầu
            Capture(workingArray, 0, "Khởi tạo mảng đầu vào và chuẩn bị sắp xếp nhanh.");
            
            RunQuickSort(workingArray, 0, workingArray.Length - 1);
            
            // Chụp frame hoàn tất
            var sortedIndices = new List<int>();
            for (int i = 0; i < workingArray.Length; i++) sortedIndices.Add(i);
            Capture(workingArray, 0, "Thuật toán hoàn tất! Toàn bộ mảng đã được sắp xếp tăng dần.", sorted: sortedIndices);

            return _frames;
        }

        private void RunQuickSort(int[] arr, int low, int high)
        {
            if (low < high)
            {
                int pivotIdx = Partition(arr, low, high);
                RunQuickSort(arr, low, pivotIdx - 1);
                RunQuickSort(arr, pivotIdx + 1, high);
            }
        }

        private int Partition(int[] arr, int low, int high)
        {
            int pivot = arr[high]; // Chọn phần tử cuối làm Pivot
            int i = (low - 1); // Con trỏ Left

            Capture(arr, 2, $"Chọn phần tử cuối cùng làm chốt Pivot: {pivot} (chỉ số index {high})", pivotIdx: high);

            for (int j = low; j < high; j++)
            {
                Capture(arr, 5, $"So sánh phần tử hiện tại A[{j}] ({arr[j]}) với Pivot ({pivot})", pivotIdx: high, compareIdxs: new[] { j });
                
                if (arr[j] < pivot)
                {
                    i++;
                    Capture(arr, 7, $"Phần tử A[{j}] ({arr[j]}) < Pivot. Hoán vị A[{i}] ({arr[i]}) và A[{j}] ({arr[j]})", pivotIdx: high, swapIdxs: new[] { i, j });
                    
                    int temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }

            Capture(arr, 11, $"Đưa Pivot về đúng vị trí sắp xếp. Hoán vị A[{i + 1}] ({arr[i + 1]}) và A[{high}] ({arr[high]})", pivotIdx: high, swapIdxs: new[] { i + 1, high });
            
            int temp2 = arr[i + 1];
            arr[i + 1] = arr[high];
            arr[high] = temp2;

            return i + 1;
        }

        private void Capture(
            int[] arr, 
            int activeLine, 
            string explanation, 
            int pivotIdx = -1, 
            int[] compareIdxs = null, 
            int[] swapIdxs = null,
            List<int> sorted = null)
        {
            var highlights = new HighlightsDTO
            {
                Compare = compareIdxs != null ? new List<int>(compareIdxs) : new List<int>(),
                Swap = swapIdxs != null ? new List<int>(swapIdxs) : new List<int>(),
                Sorted = sorted != null ? sorted : new List<int>()
            };

            if (pivotIdx != -1)
            {
                // Sử dụng màu sắc riêng biệt (ví dụ: con trỏ Pivot màu tím)
                highlights.Compare.Add(pivotIdx); 
            }

            _frames.Add(new FrameDTO
            {
                StepId = _stepCounter++,
                ActiveLine = activeLine,
                Explanation = explanation,
                DataState = new List<int>(arr),
                Highlights = highlights
            });
        }
    }
}
```

---

## 4. ĐẶC TẢ TRÌNH DIỄN ĐA CẤU TRÚC ĐỒ HỌA (CANVAS UI/UX VISUAL FORMS)

Mỗi phân nhóm thuật toán có bản chất cấu trúc lưu trữ khác nhau. Để truyền tải kiến thức trực quan và tự nhiên nhất, giao diện vẽ Canvas HTML5 áp dụng các mô hình vẽ chuyên biệt:

```
+-----------------------------------------------------------------------+
|                         DANH MỤC VẼ ĐỒ HỌA CANVAS                     |
+-----------------------------------------------------------------------+
|  1. MẢNG SẮP XẾP (Sorting): Cột Đứng (Bars)                           |
|     ||      ||      ||                                                |
|     || (25) || (45) || (12) ... Chiều cao tỉ lệ thuận với giá trị     |
|                                                                       |
|  2. MẢNG TÌM KIẾM (Searching): Ô Ngang liền nhau (Box Array)          |
|     +----+  +----+  +----+                                            |
|     | 12 |  | 35 |  | 88 | ... Hiện rõ số nguyên, trượt trỏ tìm       |
|     +----+  +----+  +----+                                            |
|                                                                       |
|  3. CÂY / ĐỒ THỊ (Non-Linear): Nút Tròn & Mũi Tên (Node & Edges)       |
|            (( 50 ))                                                   |
|            /      \                                                   |
|        (( 30 ))  (( 70 )) ... Tự động tính góc xoay và liên kết       |
|                                                                       |
|  4. NGĂN XẾP / HÀNG ĐỢI (Stack/Queue): Ống chứa (Tube)                 |
|     +-----+                                                           |
|     |  3  |                                                           |
|     +-----+                                                           |
|     |  8  | ===> Vào ra chung 1 đầu (LIFO / FIFO)                      |
|     +-----+                                                           |
+-----------------------------------------------------------------------+
```

### 4.1. Bộ Điều Phối Component Động ở Vue 3 (`<component :is>`)
Thay vì viết một Component Canvas khổng lồ chứa hàng ngàn dòng lệnh if/else chắp vá, chúng ta tạo các Component vẽ chuyên biệt (`BarChartRenderer.vue`, `BoxArrayRenderer.vue`, `TreeRenderer.vue`, `TubeRenderer.vue`) và sử dụng cơ chế Component động của Vue:

```html
<template>
  <div class="canvas-container">
    <!-- Component Dynamic tự động ánh xạ cấu trúc vẽ phù hợp -->
    <component 
      :is="currentRenderer" 
      :data-state="activeFrame.dataState" 
      :highlights="activeFrame.highlights" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAlgorithmStore } from '@/stores/useAlgorithmStore';
import BarChartRenderer from './renderers/BarChartRenderer.vue';
import BoxArrayRenderer from './renderers/BoxArrayRenderer.vue';
import TreeRenderer from './renderers/TreeRenderer.vue';
import TubeRenderer from './renderers/TubeRenderer.vue';

const algoStore = useAlgorithmStore();

const currentRenderer = computed(() => {
  const category = algoStore.currentAlgorithm?.category.toLowerCase();
  
  switch (category) {
    case 'sorting':
      return BarChartRenderer;
    case 'searching':
      return BoxArrayRenderer;
    case 'graph':
    case 'tree':
      return TreeRenderer;
    case 'stack-queue':
      return TubeRenderer;
    default:
      return BarChartRenderer;
  }
});
</script>
```

---

## 5. QUẢN LÝ METADATA & DANH SÁCH GIẢI THUẬT (FRONTEND PINIA STORE)

Pinia Store chịu trách nhiệm lưu trữ cấu mục lục thuật toán, lý thuyết tóm tắt, bảng độ phức tạp Big-O và quản lý thuật toán đang được lựa chọn để hiển thị.

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

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
  // --- STATE ---
  const algorithms = ref<Algorithm[]>([]);
  const currentAlgorithm = ref<Algorithm | null>(null);
  const metadata = ref<AlgorithmMetadata | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string>('');

  // --- ACTIONS ---
  
  /**
   * Tải danh sách thuật toán hiển thị ngoài Dashboard
   */
  async function fetchAlgorithms() {
    isLoading.value = true;
    error.value = '';
    try {
      const response = await fetch('/api/v1/algorithms');
      if (!response.ok) throw new Error('Không thể tải danh sách thuật toán.');
      algorithms.value = await response.json();
    } catch (err: any) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Tải dữ liệu lý thuyết và mã giả chi tiết của một thuật toán cụ thể
   */
  async function loadAlgorithmDetails(algoId: string) {
    isLoading.value = true;
    error.value = '';
    
    // Tìm kiếm nhanh trong bộ nhớ đệm
    const matched = algorithms.value.find(a => a.id === algoId);
    if (matched) {
      currentAlgorithm.value = matched;
    }

    try {
      const response = await fetch(`/api/v1/algorithms/${algoId}/metadata`);
      if (!response.ok) throw new Error('Không thể tải dữ liệu chi tiết thuật toán.');
      metadata.value = await response.json();
    } catch (err: any) {
      error.value = err.message;
      metadata.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  function clearActive() {
    currentAlgorithm.value = null;
    metadata.value = null;
  }

  return {
    algorithms,
    currentAlgorithm,
    metadata,
    isLoading,
    error,
    
    fetchAlgorithms,
    loadAlgorithmDetails,
    clearActive
  };
});
```

---

## 6. ĐẶC TẢ API GIAO TIẾP & JSON SCHEMA CONTRACTS

### 6.1. Endpoint: Lấy danh mục thuật toán ngoài Dashboard
*   **URL:** `/api/v1/algorithms`
*   **Method:** `GET`
*   **Response Payload JSON (HTTP 200 OK):**
```json
[
  {
    "id": "bubble-sort",
    "name": "Bubble Sort (Sắp xếp nổi bọt)",
    "category": "Sorting",
    "difficulty": "Easy",
    "timeComplexity": "O(N^2)",
    "spaceComplexity": "O(1)"
  },
  {
    "id": "quick-sort",
    "name": "Quick Sort (Sắp xếp nhanh)",
    "category": "Sorting",
    "difficulty": "Medium",
    "timeComplexity": "O(N log N)",
    "spaceComplexity": "O(log N)"
  }
]
```

### 6.2. Endpoint: Lấy chi tiết lý thuyết & mã giả
*   **URL:** `/api/v1/algorithms/{algorithmId}/metadata`
*   **Method:** `GET`
*   **Response Payload JSON (HTTP 200 OK):**
```json
{
  "timeComplexity": "O(N log N)",
  "spaceComplexity": "O(log N)",
  "description": "Quick Sort hoạt động theo nguyên lý chia để trị. Chọn chốt Pivot phân tách mảng làm hai nửa nhỏ hơn và lớn hơn chốt...",
  "pseudoCode": [
    "runQuickSort(A, low, high)",
    "  if low < high",
    "    pivotIdx = partition(A, low, high)",
    "    runQuickSort(A, low, pivotIdx - 1)",
    "    runQuickSort(A, pivotIdx + 1, high)"
  ]
}
```

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐẢM BẢO NGUYÊN TẮC SOLID (ADR)

### ADR-03: Nguyên tắc Mở rộng Độc lập (SOLID Open/Closed Principle)

*   **Bối cảnh:** Khi thư viện giải thuật phình to từ 5 thuật toán lên 50 thuật toán trong các giai đoạn tiếp theo của dự án, nếu chúng ta thiết kế hệ thống dạng rẽ nhánh thủ công (`switch-case` khổng lồ trong Controller), mã nguồn sẽ cực kỳ dễ vỡ, tốn công bảo trì và vi phạm SOLID nghiêm trọng.
*   **Quyết định:** Áp dụng **Strategy Pattern** kết hợp cơ chế quét tự động **Reflection** trong Dependency Injection Container:
    *   Tất cả thuật toán viết độc lập trên các file Class riêng biệt.
    *   Thêm thuật toán mới chỉ cần bổ sung file mới, tuyệt đối không chỉnh sửa Controller hay Core Engine cũ.
    *   Giảm thiểu hoàn toàn lỗi hồi quy (Regression Bugs), đảm bảo tính an toàn kiến trúc.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Bước 1: Thiết lập Kiến trúc Plugin lõi (Backend):** Định nghĩa `IAlgorithmStrategy`, viết bộ đăng ký DI tự động dùng Reflection và hiện thực hóa Bubble/Selection Sort mẫu.
2.  **Bước 2: Phát triển các nhóm giải thuật phức tạp:** Lần lượt viết các thuật toán Quick/Merge Sort đệ quy, Binary Search kiểm tra mảng sắp xếp và cấu trúc cây BST.
3.  **Bước 3: Tích hợp Dynamic Components ở Frontend:** Xây dựng 4 Renderer chuyên biệt (Bars, Box, Node/Edge, Tube) và kết nối với cơ chế lựa chọn `<component :is>` của Vue 3.

### 8.2. Tiêu chí nghiệm thu (Definition of Done)
1.  Thuật toán thêm mới tự động đăng ký vào API mà không cần khai báo dòng code services.AddTransient nào trong Program.cs.
2.  Quá trình đệ quy của Quick/Merge Sort phải được chụp trạng thái rõ ràng, phân biệt được con trỏ Pivot (màu tím) với so sánh (màu vàng) trên Canvas.
3.  Binary Search phải ném ra lỗi `HTTP 400 Bad Request` giải thích chi tiết nếu người dùng cố tình nhập mảng custom chưa được sắp xếp.
