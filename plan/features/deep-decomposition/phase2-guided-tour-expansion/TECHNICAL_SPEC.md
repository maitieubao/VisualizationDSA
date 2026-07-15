# 🛠️ Technical Specification - Guided Tour Expansion (Phase 2)

## 1. Kiến trúc Kỹ thuật (Technical Architecture)
Hệ thống Guided Tour được xây dựng trên mô hình trạng thái tập trung (Pinia) kết hợp một Overlay duy nhất nằm tại cấp độ cao nhất của ứng dụng (`App.vue`).

```mermaid
graph TD
    A["View Component (onMounted / Button)"] -->|1. Gọi startPageTour(path, force)| B["useGuidedTourStore (Pinia Store)"]
    B -->|2. Cập nhật activePageKey, currentSteps, currentStepIndex, isActive| C["GuidedTourOverlay.vue (Global Overlay)"]
    C -->|3. querySelector(highlightSelector) & getBoundingClientRect()| D["Highlighter Spotlight overlay"]
    C -->|4. Renders Glassmorphic Dialog| E["User View Screen"]
```

---

## 2. Đặc tả Chi tiết các Bộ Hướng dẫn (PAGE_TOURS Configuration Spec)

Chúng ta sẽ bổ sung các cấu hình sau vào hằng số `PAGE_TOURS` trong `frontend/src/features/guided-tour/store/useGuidedTourStore.ts`:

### 2.1. Monaco IDE & Debugger (`/code-ide`)
```typescript
  '/code-ide': [
    {
      title: '💻 Monaco Code Editor',
      description: 'Nơi viết mã nguồn thuật toán thực tế. Hỗ trợ đầy đủ tự động gợi ý (IntelliSense) và tô sáng cú pháp.',
      highlightSelector: '.monaco-editor-container',
    },
    {
      title: '🔴 Điểm dừng Breakpoint',
      description: 'Nhấp chuột vào lề trái (gutter) của dòng code để đặt Breakpoint. Thuật toán sẽ tự động dừng tại dòng này khi debug.',
      highlightSelector: '.monaco-editor .margin',
    },
    {
      title: '⚡ Bộ điều khiển Gỡ lỗi',
      description: 'Sử dụng các nút Bắt đầu debug, Bước tới (Step Over), Chạy tiếp (Continue) để kiểm soát từng dòng code.',
      highlightSelector: '.debugger-actions-panel',
    },
    {
      title: '📚 Ngăn xếp & Biến theo dõi',
      description: 'Theo dõi Call Stack các hàm đang lồng nhau và giá trị các biến thay đổi tức thời ở ô Watch.',
      highlightSelector: '.debug-inspect-panel',
    },
    {
      title: '🎨 Khung trực quan hóa',
      description: 'Quan sát các khối phần tử trên Canvas tự động chuyển động đồng bộ theo từng dòng code bạn đang gỡ lỗi.',
      highlightSelector: '.debug-canvas-container',
    }
  ]
```

### 2.2. Trực quan hóa SOLID (`/solid`)
```typescript
  '/solid': [
    {
      title: '🎓 Lựa chọn Nguyên lý',
      description: 'Chuyển đổi giữa 5 nguyên lý: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.',
      highlightSelector: '.solid-lesson-tabs',
    },
    {
      title: '🏗️ Khung mô phỏng SOLID',
      description: 'Vùng Canvas vẽ mô phỏng các lớp học, thực thể hoặc dòng chảy phụ thuộc tương ứng với nguyên lý.',
      highlightSelector: '.solid-sandbox-canvas',
    },
    {
      title: '🕹️ Bảng điều khiển Tương tác',
      description: 'Bấm nút để kích hoạt hành vi vi phạm nguyên lý (như thay đà điểu vào lớp Chim bay) hoặc áp dụng nguyên lý đúng đắn.',
      highlightSelector: '.solid-action-controls',
    },
    {
      title: '📊 Chỉ số kết dính Cohesion',
      description: 'Đo lường trực quan chỉ số SRP LCOM4 (Lack of Cohesion of Methods) thông qua các kết nối đồ thị nhiệt Canvas.',
      highlightSelector: '.solid-metrics-panel',
    }
  ]
```

### 2.3. Trực quan hóa OOP (`/oop`)
```typescript
  '/oop': [
    {
      title: '📐 Lược đồ Lớp UML',
      description: 'Xem sơ đồ kế thừa Shape, Circle, Rectangle được trình bày theo dạng thẻ Glassmorphic trực quan.',
      highlightSelector: '.oop-class-hierarchy',
    },
    {
      title: '📟 Bộ nhớ RAM Heap',
      description: 'Hiển thị các đối tượng được cấp phát trên bộ nhớ Heap ảo đi kèm địa chỉ Hexa thực tế.',
      highlightSelector: '.oop-heap-allocator',
    },
    {
      title: '🔗 Bảng Đa hình VTable',
      description: 'Theo dõi cách con trỏ đa hình liên kết động (Dynamic Dispatch) tìm đúng hàm thực thi trong bảng ảo Virtual Table.',
      highlightSelector: '.oop-vtable-panel',
    },
    {
      title: '🎮 Kích hoạt Polymorphism',
      description: 'Nhấn gọi hàm đa hình, tia laser Bezier sẽ bắn từ con trỏ Stack sang Heap và định tuyến đến VTable.',
      highlightSelector: '.oop-exec-controls',
    }
  ]
```

### 2.4. Trực quan Đồ thị (`/graph`)
```typescript
  '/graph': [
    {
      title: '✏️ Canvas vẽ Đồ thị',
      description: 'Nhấp đúp chuột để tạo đỉnh (Node), kéo thả từ đỉnh này sang đỉnh kia để tạo cạnh (Edge).',
      highlightSelector: '.playground-canvas-container',
    },
    {
      title: '🛠️ Thanh công cụ chế độ',
      description: 'Chọn chế độ Vẽ đỉnh/cạnh (Build Mode), Di chuyển node, chạy Thử nghiệm giải thuật (Simulation Mode).',
      highlightSelector: '.graph-mode-bar',
    },
    {
      title: '🤖 Trợ lý Đồ thị (Graph Assistant)',
      description: 'Xem danh sách cạnh có trọng số, nhập đồ thị nhanh bằng văn bản, sinh ngẫu nhiên đồ thị hoặc xóa sạch Canvas.',
      highlightSelector: '.graph-assistant-panel',
    },
    {
      title: '🚀 Trình chạy thuật toán Đồ thị',
      description: 'Lựa chọn thuật toán BFS, DFS hoặc Dijkstra và nhấn Play để xem thuật toán loang màu trực quan trên đồ thị bạn vừa vẽ.',
      highlightSelector: '.graph-algo-runner',
    }
  ]
```

### 2.5. DI/IoC Container (`/di`)
```typescript
  '/di': [
    {
      title: '📋 Khai báo Services',
      description: 'Danh sách các dịch vụ đăng ký vào IoC Container dưới dạng Singleton (chỉ có 1 instance) hoặc Transient (mỗi lần gọi sinh mới).',
      highlightSelector: '.di-services-list',
    },
    {
      title: '🕸️ Dependency Graph',
      description: 'Biểu diễn mạng lưới phụ thuộc giữa các class. Nét đứt màu Neon biểu thị hướng phụ thuộc của Dependency Injection.',
      highlightSelector: '.di-dependency-graph',
    },
    {
      title: '🎯 Yêu cầu Resolve',
      description: 'Click để yêu cầu IoC Container giải quyết (Resolve) một service, chứng kiến luồng khởi tạo và phát hiện vòng lặp (DFS cycle detection).',
      highlightSelector: '.di-resolve-trigger',
    }
  ]
```

### 2.6. Mẫu thiết kế (`/patterns`)
```typescript
  '/patterns': [
    {
      title: '🎭 Lựa chọn Design Pattern',
      description: 'Chuyển đổi giữa 3 mẫu thiết kế kinh điển: Strategy Pattern, Observer Pattern, và Dependency Inversion Principle.',
      highlightSelector: '.patterns-scenario-tabs',
    },
    {
      title: '🌌 Khung trình diễn Pattern',
      description: 'Mô phỏng sinh động các đối tượng tương tác (ví dụ: Observer bắn hạt thông báo đến Subscribers khi Subject thay đổi).',
      highlightSelector: '.patterns-canvas-panel',
    },
    {
      title: '⚙️ Bảng nút điều khiển',
      description: 'Thay đổi thuật toán vận hành Strategy lúc Runtime hoặc thay đổi trạng thái Subject để kiểm chứng Observer.',
      highlightSelector: '.patterns-control-buttons',
    }
  ]
```

### 2.7. Call Stack & State Inspector (`/state`)
```typescript
  '/state': [
    {
      title: '🥞 Call Stack 3D',
      description: 'Mô hình 3D kính mờ xếp chồng các khung ngăn xếp (Stack Frames) khi thực thi các hàm đệ quy (ví dụ Fibonacci).',
      highlightSelector: '.call-stack-3d-panel',
    },
    {
      title: '🌳 Cây đệ quy (Recursion Tree)',
      description: 'Cây phân rã đệ quy biểu thị quan hệ cha-con của các lời gọi hàm, tự động gán giá trị trả về (return value).',
      highlightSelector: '.recursion-tree-svg',
    },
    {
      title: '👉 Con trỏ Pointer & Heap',
      description: 'Theo dõi các biến con trỏ trên Stack trỏ sang vùng nhớ Heap qua các đường cong Bezier nét đứt neon chuyển động.',
      highlightSelector: '.state-heap-pointer-panel',
    }
  ]
```

### 2.8. System Design & Load Balancer (`/system`)
```typescript
  '/system': [
    {
      title: '🌐 Sơ đồ Topology Hệ thống',
      description: 'Mô hình hệ thống gồm Client, Load Balancer định tuyến, Web Servers, Cache Redis, Primary DB và Replica DB.',
      highlightSelector: '.system-topology-canvas',
    },
    {
      title: '🌊 Thanh xả lũ Traffic',
      description: 'Kéo thanh trượt để tạo ra hàng loạt tin HTTP Request (hạt neon lục Emerald) bắn dồn dập vào Load Balancer.',
      highlightSelector: '.system-traffic-slider',
    },
    {
      title: '🔌 Giả lập sập nguồn Failover',
      description: 'Nhấn nút tắt nguồn một Web Server. Máy chủ chuyển đỏ bốc khói, Load Balancer lập tức chuyển hướng luồng hạt neon sang server còn lại.',
      highlightSelector: '.system-node-actions',
    },
    {
      title: '⏳ replication Lag DB',
      description: 'Cấu hình độ trễ sync từ Primary sang Replica DB, chứng kiến hạt dữ liệu trôi chậm và độ lệch đồng bộ.',
      highlightSelector: '.replication-lag-control',
    }
  ]
```

### 2.9. Học tập & Trắc nghiệm (`/quiz`)
```typescript
  '/quiz': [
    {
      title: '❓ Thẻ câu hỏi trắc nghiệm',
      description: 'Cửa sổ trượt kính mờ chứa nội dung câu hỏi MCQ hoặc Đúng/Sai xuất hiện ngắt mạch hoạt ảnh.',
      highlightSelector: '.quiz-card-overlay',
    },
    {
      title: '🎯 Lựa chọn Đáp án',
      description: 'Lựa chọn các đáp án bằng cách click trực tiếp vào danh sách phương án hoặc click thẳng vào phần tử Canvas/Monaco.',
      highlightSelector: '.quiz-options-grid',
    },
    {
      title: '💡 Bảng giải thích chi tiết',
      description: 'Hiển thị giải thích sư phạm chi tiết đi kèm màu sắc HSL (Lục correct, Đỏ sai lệch) giúp củng cố kiến thức.',
      highlightSelector: '.quiz-explanation-panel',
    }
  ]
```

---

## 3. Thành phần nút Trợ giúp dùng chung (Reusable HelpButton.vue)
Nút Trợ giúp sẽ được thiết kế gọn gàng, hỗ trợ hiệu ứng mờ kính Glassmorphism, tự động lấy Route hiện tại để kích hoạt Tour:

```html
<!-- frontend/src/features/guided-tour/components/HelpButton.vue -->
<template>
  <button
    class="help-button fixed bottom-6 right-6 z-[99] flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-accent-cyan/50 hover:bg-accent-cyan/10 text-text-secondary hover:text-accent-cyan transition-all duration-300 shadow-lg cursor-pointer"
    style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);"
    title="Hướng dẫn sử dụng giao diện"
    @click="triggerTour"
  >
    <span class="text-sm font-bold">❓</span>
  </button>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useGuidedTourStore } from '../store/useGuidedTourStore';

const route = useRoute();
const tourStore = useGuidedTourStore();

function triggerTour() {
  const currentPath = route.path;
  tourStore.startPageTour(currentPath, true);
}
</script>

<style scoped>
.help-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.help-button:hover {
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
}
</style>
```

---

## 4. Tích hợp và Tự động kích hoạt ở các View (Integration)
Ở mỗi View học thuật (ví dụ `SortingView.vue`, `CodeIDEView.vue`, `SOLIDVisualizationView.vue`, etc.), chúng ta sẽ thực hiện:
1. Import `useGuidedTourStore` và `HelpButton.vue`.
2. Gọi `tourStore.startPageTour(route.path, false)` bên trong hook `onMounted`.
3. Mount `<HelpButton />` vào phần template của View.

```typescript
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useGuidedTourStore } from '@/features/guided-tour/store/useGuidedTourStore';
import HelpButton from '@/features/guided-tour/components/HelpButton.vue';

const route = useRoute();
const tourStore = useGuidedTourStore();

onMounted(() => {
  // Chỉ tự động kích hoạt nếu chưa xem (force = false)
  tourStore.startPageTour(route.path, false);
});
```

---

## 5. Kịch bản Kiểm thử Tích hợp (Unit Testing Spec)
Chúng ta sẽ viết thêm các unit tests trong `frontend/src/features/guided-tour/__tests__/useGuidedTourStore.spec.ts` để kiểm thử luồng hoạt động:

```typescript
  it('should initialize and load specific tours for custom academic routes', () => {
    const store = useGuidedTourStore();
    
    // Test cho /code-ide
    store.startPageTour('/code-ide', true);
    expect(store.isActive).toBe(true);
    expect(store.activePageKey).toBe('/code-ide');
    expect(store.currentSteps.length).toBe(5);
    expect(store.currentSteps[0].title).toContain('Monaco Code Editor');
  });

  it('should respect localStorage and not auto-trigger if already seen', () => {
    const store = useGuidedTourStore();
    localStorage.setItem('page_tour_solid_seen', 'true');
    
    store.startPageTour('/solid', false);
    expect(store.isActive).toBe(false); // Không tự động kích hoạt
    
    // Ép buộc kích hoạt bằng nút Trợ giúp (force = true)
    store.startPageTour('/solid', true);
    expect(store.isActive).toBe(true); // Được kích hoạt lại
  });
```
