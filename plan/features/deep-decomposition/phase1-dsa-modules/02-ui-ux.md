# 🎨 UI & UX Specifications - Visual Differentiation (Canvas)

Tài liệu này đặc tả chi tiết giao diện vẽ đồ họa Canvas, cơ chế Component Động (Dynamic Components) ở Vue 3 và quy chuẩn vẽ trực quan hóa cho từng nhóm cấu trúc dữ liệu cụ thể.

---

## 1. Cơ chế Component Động trong Vue 3 Setup Store

Để tối ưu hóa mã nguồn hiển thị, tránh việc phình to và chắp vá code vẽ Canvas, chúng ta sử dụng Component động `<component :is>` của Vue 3 để tự động ánh xạ Renderer phù hợp dựa trên Category của thuật toán hiện tại:

```html
<!-- AlgorithmVisualizer.vue -->
<template>
  <div class="visualizer-wrapper">
    <div class="canvas-card">
      <!-- Trình vẽ động Canvas thích ứng cấu trúc -->
      <component 
        :is="activeRenderer" 
        :data-state="animationStore.activeFrame.dataState" 
        :highlights="animationStore.activeFrame.highlights" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAlgorithmStore } from '@/stores/useAlgorithmStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import BarChartRenderer from './renderers/BarChartRenderer.vue';
import BoxArrayRenderer from './renderers/BoxArrayRenderer.vue';
import TreeRenderer from './renderers/TreeRenderer.vue';
import TubeRenderer from './renderers/TubeRenderer.vue';

const algoStore = useAlgorithmStore();
const animationStore = useAnimationStore();

const activeRenderer = computed(() => {
  const category = algoStore.currentAlgorithm?.category.toLowerCase();
  
  switch (category) {
    case 'sorting':
      return BarChartRenderer; // Vẽ cột đứng cho thuật toán Sắp xếp
    case 'searching':
      return BoxArrayRenderer; // Vẽ ô vuông ngang cho thuật toán Tìm kiếm
    case 'graph':
    case 'tree':
      return TreeRenderer;     // Vẽ vòng tròn Node & Mũi tên cho Cây/Đồ thị
    case 'stack-queue':
      return TubeRenderer;     // Vẽ ống nghiệm chứa cho Ngăn xếp/Hàng đợi
    default:
      return BarChartRenderer;
  }
});
</script>
```

---

## 2. Quy chuẩn Trực quan hóa đặc thù (Visual Render Forms)

### 2.1. Biểu đồ cột đứng (Bar Chart - Sorting)
*   **Ứng dụng:** Trình diễn các thuật toán Bubble, Selection, Insertion, Merge, Quick Sort.
*   **Quy chuẩn vẽ:** Trục hoành $X$ chia đều khoảng cách giữa các phần tử. Chiều cao của cột đứng tỉ lệ thuận với giá trị số nguyên. Con số tương ứng được vẽ nhỏ phía dưới chân cột hoặc trên đầu cột để dễ quan sát.

### 2.2. Dãy ô vuông nằm ngang (Box Array - Searching)
*   **Ứng dụng:** Trình diễn các thuật toán Linear Search, Binary Search.
*   **Quy chuẩn vẽ:** Vẽ một chuỗi các hình chữ nhật bo góc nằm sát liền kề nhau. Số nguyên nằm chính giữa ô vuông. Vẽ các mũi tên chỉ con trỏ tìm kiếm (ví dụ con trỏ `Low`, `Mid`, `High` của Binary Search) trượt phía dưới các ô tương ứng.

### 2.3. Sơ đồ Cây phân nhánh (Node & Edges - Binary Search Tree)
*   **Ứng dụng:** Trình diễn CTDL Cây BST, Đồ thị BFS/DFS.
*   **Quy chuẩn vẽ:** Mỗi node được biểu diễn là một hình tròn có bán kính $R = 25px$, giá trị số vẽ ở tâm. Các liên kết cha-con vẽ bằng đường thẳng mũi tên hướng xuống. 
*   *Thuật toán tính toán tọa độ:* Tọa độ node con tự động thu hẹp khoảng cách trục hoành $X$ theo cấp độ sâu $depth$ của cây để tránh chồng chéo node con:
    $$\Delta X = \frac{\text{CanvasWidth}}{2^{\text{depth} + 1}}$$

### 2.4. Ống nghiệm chứa đứng/ngang (Tube Layout - Stack/Queue)
*   **Ứng dụng:** Trình diễn cấu trúc Stack, Queue.
*   **Quy chuẩn vẽ:** 
    *   *Stack:* Vẽ một ống hình chữ nhật khuyết cạnh trên nằm dọc. Thao tác Push/Pop sẽ mô phỏng phần tử rơi dọc từ miệng ống xuống đáy LIFO.
    *   *Queue:* Vẽ một ống hình chữ nhật nằm ngang khuyết hai đầu. Các phần tử xếp hàng trượt từ phải (Rear) sang trái (Front) mô phỏng cấu trúc FIFO.
