# 🖥️ ĐA GIAO DIỆN & CHẾ ĐỘ XEM SONG SONG (MULTI-VIEW SYNCHRONIZATION)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Multi-View Synchronization Engine** - phân hệ đồng bộ đa giao diện và chế độ xem song song của **VisualizationDSA** hỗ trợ chia đôi/chia ba màn hình trực quan (Split-screen), liên kết đồng bộ thời gian thực Monaco Code Editor với sơ đồ khối Flowchart và bộ máy dựng hình mảng cây SVG thông qua một trục trượt dòng thời gian dùng chung VCR Scrubber. Tài liệu này đặc tả chi tiết kiến trúc truyền thông điệp đồng bộ siêu tốc dưới 1ms, hệ quản trị trạng thái Pinia dùng chung và giải pháp kéo thả co giãn kích thước phân cực kính mờ (Glassmorphic Resizable Splitters).

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Đa giao diện Song song (PRD)](#1-tầm-nhìn-đa-giao-diện-song-song-prd)
2. [Bộ máy Truyền thông điệp Đồng bộ Siêu tốc (TECHNICAL SPEC)](#2-bộ-máy-truyền-thông-điệp-đồng-bộ-siêu-tốc-technical-spec)
3. [Hiện thực hóa Bộ điều phối Event Bus & Timeline (Core Logic)](#3-hiện-thực-hóa-bộ-điều-phối-event-bus--timeline-core-logic)
4. [Bố cục Resizable Panes & Monaco Highlighting (UI/UX)](#4-bố-cục-resizable-panes--monaco-highlighting-uiux)
5. [Quản lý Trạng thái Pinia useMultiViewStore (State Management)](#5-quản-lý-trạng-thái-pinia-usemultiviewstore-state-management)
6. [Hạ tầng Co giãn Khung chia Throttled Drag Coordinator (Infrastructure)](#6-hạ-tầng-co-giãn-khung-chia-throttled-drag-coordinator-infrastructure)
7. [Hợp đồng Đồng bộ trạng thái JSON Schema & C# Entity (API Reference)](#7-hợp-đồng-đồng-bộ-trạng-thái-json-schema--c-entity-api-reference)
8. [Quyết định Kiến trúc & Bộ điều phối sự kiện Đồng bộ (ADR)](#8-quyết-định-kiến-trúc--bộ-điều-phối-sự-kiện-đồng-bộ-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN ĐA GIAO DIỆN SONG SONG (PRD)

### 1.1. Tầm nhìn: Phá bỏ ranh giới giữa Mã nguồn và Đồ họa Trực quan
Khi học các giải thuật đệ quy phức tạp như QuickSort hay xây dựng Cây đỏ đen, sinh viên thường gặp khó khăn lớn do không kết nối được mã nguồn đang chạy với cấu trúc dữ liệu thay đổi trong bộ nhớ:
*   *Vấn đề:* Nhìn mã nguồn trong Monaco Editor riêng biệt khiến học sinh không hiểu dòng code đó hoán đổi phần tử mảng thế nào. Nhìn hình ảnh động riêng lại không biết code nào đang thực thi.
*   *Giải pháp:* **Multi-View Synchronization Engine** đập tan ranh giới này bằng giao diện đa chế độ xem song song hoàn hảo:
    1.  **Chia tách linh hoạt (Dynamic Split Panes):** Cho phép sinh viên kéo thanh chia đôi màn hình để xem Monaco Code Editor bên trái, sơ đồ khối Flowchart ở giữa và hoạt ảnh cấu trúc cây SVG bên phải.
    2.  **Đồng bộ dòng thời gian tuyệt đối (Unified VCR Scrubber):** Một thanh trượt tua thời gian dùng chung. Khi người dùng kéo tua, cả 3 chế độ xemSnap đồng thời sang bước chỉ định (Monaco sáng dòng số 8, Flowchart sáng node đệ quy, SVG dịch chuyển pivot).

---

## 2. BỘ MÁY TRUYỀN THÔNG ĐIỆP ĐỒNG BỘ SIÊU TỐC (TECHNICAL SPEC)

Để đạt tốc độ đồng bộ tức thì, tránh lỗi lệch pha giữa các khung panel, hệ thống áp dụng kiến trúc **Unidirectional State Dispatcher** thông qua trục truyền thông điệp `MultiViewEventBus`:

```
[Trục trượt VCR Scrubber / Play Button]
                 |
                 v Phát sự kiện "STEP_CHANGED" (Step 15)
     +-----------+-----------+
     |                       |
     v (Monaco Editor)       v (SVG Visualizer)
[Tô sáng dòng code 12]    [Hoán đổi Array Bar 3 & 4]
```

### Thuật toán Đồng bộ Khung hình (Sub-millisecond Synchronizer)
Hạ tầng truyền tải thông điệp sử dụng chuỗi sự kiện bộ nhớ RAM trực tiếp, bỏ qua cơ chế chuyển đổi sâu của DOM, đảm bảo thời gian trễ đồng bộ chênh lệch giữa các View nhỏ hơn **1ms**.

---

## 3. HIỆN THỰC HÓA BỘ ĐIỀU PHỐI EVENT BUS & TIMELINE (CORE LOGIC)

Chúng ta xây dựng bộ truyền tin an toàn và quản lý dòng thời gian tua nhanh bằng TypeScript:

```typescript
export interface TimelineStep {
  stepIndex: number;
  activeLineNumber: number;
  activeFlowchartNodeId: string;
  memoryStateSnapshot: any; // Trạng thái mảng hoặc cấu trúc cây tại bước này
}
```
Lớp hạt nhân `MultiViewEventBus` và `SynchronizedTimelineManager` sẽ được đặc tả trong tệp core logic.

---

## 4. BỐ CỤC RESIZABLE PANES & MONACO HIGHLIGHTING (UI/UX)

### 4.1. Thiết kế Giao diện Khung Resizable mờ ảo (Glassmorphism splitters)
*   **Split Pane Divider Handle:** Thanh chia dọc kính mờ sành điệu. Khi di chuột qua, viền thanh sáng bừng màu xanh Cyan Neon, cho phép kéo thả trượt êm ái.
*   **Monaco Gutter Active Highlight:** Tô sáng dòng code đang thực thi bằng dải nền màu vàng hổ phách Neon mờ rực rỡ, kết hợp mũi tên laser nhỏ chỉ ở lề biên (gutter pointer).
*   **Flowchart Node Pulsing Glow:** Khi code chạy vào node đệ quy, node tương ứng trên sơ đồ khối nhấp nháy phát sáng Neon.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA PATH STORE (STATE MANAGEMENT)

Xây dựng store `useMultiViewStore.ts` quản lý khung panel:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMultiViewStore = defineStore('multiView', () => {
  const activePanels = ref<string[]>(['code-editor', 'svg-visualizer']);
  const currentStep = ref(0);
  const totalSteps = ref(40);
  const isPlaying = ref(false);

  return { activePanels, currentStep, totalSteps, isPlaying };
});
```

---

## 6. HẠ TẦNG CO GIÃN KHUNG CHIA THROTTLED DRAG COORDINATOR (INFRASTRUCTURE)

*   **Bộ điều phối kéo thả co giãn tối ưu (Throttled Drag Coordinator):**
    *   Kéo thanh chia pane liên tục sinh ra hàng ngàn sự kiện thay đổi chiều rộng phần tử. Hạ tầng sử dụng giải pháp giới hạn tần suất (Throttle) bằng `requestAnimationFrame` để tính toán lại tỷ lệ layout phần trăm panel mượt mà 60 FPS, ngăn chặn 100% hiện tượng đơ lag hay rung giật màn hình.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & BỘ ĐIỀU PHỐI SỰ KIỆN ĐỒNG BỘ (ADR)

### ADR-19: Bộ điều phối sự kiện Đồng bộ Unidirectional Event Bus thuần RAM (Synchronous Event-Driven Cross-View State Dispatcher)

*   **Quyết định:** Sử dụng cơ chế Unidirectional Event Bus thuần bộ nhớ RAM để đồng bộ hóa trạng thái timeline thay vì để các panel quan sát giao tiếp chéo lẫn nhau hoặc ghi đè liên tục vào Pinia Store cho các tác vụ tua tốc độ cao (Range Scrubbing).
*   **Lý do:**
    1.  *Chống trễ cổ chai (Performance Bottleneck Avoidance):* Khi người dùng kéo tua chuột nhanh trên thanh trượt timeline, Pinia reactive proxy có thể gặp hiện tượng nghẽn do kích hoạt cập nhật DOM quá nhiều. Event Bus truyền tin trực tiếp bằng hàm callback RAM giúp snapping diễn ra ngay lập tức dưới **0.5ms**.
    2.  *Lập trình Unidirectional rõ ràng:* VCR Scrubber là nguồn dữ liệu duy nhất (Single Source of Truth), phát đi chỉ thị step cập nhật cho tất cả, các View chỉ lắng nghe thụ động, không có quyền thay đổi chiều ngược lại khi đang tua.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Layout Chia đôi Panes & Monaco Highlight (Ngày 1-3):** Dựng layout khung chia pane Drag Splitter mờ ảo, tích hợp Monaco active line highlight và flowchart neon pulsing circles views.
2.  **Sprint B: Trục Truyền tin Event Bus & tua Timeline đồng bộ (Ngày 4-6):** Lập trình `MultiViewEventBus`, liên kết đồng bộ VCR Range Scrubber dùng chung, tối ưu hóa throttle drag resize layout mượt mà 60 FPS.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Monaco code editor, Flowchart và SVG memory visualizer snapping đồng bộ hoàn hảo cùng 1 bước chỉ định khi kéo tua slider.
*   Trễ chênh lệch đồng bộ thời gian thực giữa các panel dưới **1ms**, cam kết không có hiện tượng lệch pha.
*   Thanh Drag Splitter kéo thả mượt mà, co giãn Responsive panel chuẩn xác không bị tràn layout.
*   Tính năng Play/Pause hoạt động trơn tru với các mốc tốc độ tua tùy chỉnh ($0.5x, 1x, 2x$).
*   Giải phóng 100% tài nguyên lắng nghe event listener khi đóng chế độ đa giao diện song song, không rò rỉ RAM.
