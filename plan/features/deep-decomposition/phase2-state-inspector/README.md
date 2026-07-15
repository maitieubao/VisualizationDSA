# 🔍 BỘ THANH TRA TRẠNG THÁI RAM (STATE INSPECTOR & DYNAMIC VARIABLES)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **State Inspector Engine** - phân hệ thanh tra trạng thái RAM và biểu diễn biến số động thời gian thực của **VisualizationDSA** hỗ trợ vẽ các khung ngăn xếp Call Stack mờ kính Glassmorphic, bắn mũi tên tham chiếu chỉ thẳng sang ô nhớ ảo Heap và dựng cây đệ quy đè bóng SVG tự động. Tài liệu này đặc tả chi tiết kiến trúc hạt nhân bộ quản lý `StateInspectorEngine`, thuật toán sinh tọa độ mũi tên tham chiếu và giải pháp vẽ nhánh đệ quy Neon mượt mà 60 FPS.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Bộ Thanh tra Trạng thái (PRD)](#1-tầm-nhìn-bộ-thanh-tra-trạng-thái-prd)
2. [Bộ máy Theo dõi Ngăn xếp & Mũi tên Tham chiếu (TECHNICAL SPEC)](#2-bộ-máy-theo-dõi-ngăn-xếp--mũi-tên-tham-chiếu-technical-spec)
3. [Hiện thực hóa Trình thanh tra Trạng thái TS & Đệ quy (Core Logic)](#3-hiện-thực-hóa-trình-thanh-tra-trạng-thái-ts--đệ-quy-core-logic)
4. [Bố cục Ngăn xếp Kính mờ & Mũi tên Neon Heap (UI/UX)](#4-bố-cục-ngăn-xếp-kính-mờ--mũi-tên-neon-heap-uiux)
5. [Quản lý Trạng thái Pinia useStateInspectorStore (State Management)](#5-quản-lý-trạng-thái-pinia-usestateinspectorstore-state-management)
6. [Hạ tầng Liên kết Tọa độ Dynamic SVG Pointer Lines (Infrastructure)](#6-hạ-tầng-liên-kết-tọa độ-dynamic-svg-pointer-lines-infrastructure)
7. [Hợp đồng Gói tin Trạng thái JSON Schema & C# Entity (API Reference)](#7-hợp-đồng-gói-tin-trạng-thái-json-schema--c-entity-api-reference)
8. [Quyết định Kiến trúc & Bản đồ Tham chiếu Ô Nhớ ảo (ADR)](#8-quyết-định-kiến-trúc--bản-đồ-tham-chiếu-ô-nhớ-ảo-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN BỘ THANH TRA TRẠNG THÁI (PRD)

### 1.1. Tầm nhìn: Mở toang "hộp đen" bộ nhớ RAM của máy tính
Khi học thuật toán (đặc biệt là đệ quy và quản lý con trỏ liên kết), sinh viên thường gặp khó khăn lớn trong việc tự vẽ bản đồ ngăn xếp xếp chồng và hiểu con trỏ đang trỏ đi đâu dưới RAM:
*   *Vấn đề:* Sinh viên nhìn code chạy đệ quy nhưng không biết Call Stack đang sâu bao nhiêu cấp, biến cục bộ ở các tầng cũ đang giữ giá trị gì. Họ bối rối khi thấy con trỏ thay đổi địa chỉ Hexa mà không có hình ảnh trực quan liên kết sang ô nhớ Heap thực tế.
*   *Giải pháp:* **State Inspector Engine** mở toang hộp đen này:
    1.  **Call Stack Frame Visualizer:** Các khung Stack Frame được vẽ dạng thẻ mờ ảo Glassmorphic chồng lên nhau. Nhấp chọn một stack frame cũ lập tức đưa Monaco Editor cuộn đến dòng code thực thi gọi tầng đó, hiển thị trọn vẹn danh sách biến số động thời gian thực của tầng đó.
    2.  **Mũi tên Neon Heap (Pointer-to-Heap Arrows):** Khi một biến là con trỏ (ví dụ: `Node* head`), hệ thống tự động bắn một mũi tên Neon uốn lượn SVG từ ô biến số của Stack Frame chỉ thẳng sang vị trí ô nhớ đối tượng Node tương ứng nằm bên Heap ảo đồ họa.
    3.  **Cây Đệ quy Động (Recursion Tree SVG):** Tự động vẽ cây thực thi đệ quy thời gian thực (Ví dụ: tính Fibonacci, Merge Sort). Nhánh đang chạy sáng lục Emerald, nhánh đã xong và trả về kết quả sáng xanh Neon cực đẹp.

---

## 2. BỘ MÁY THEO DÕI NGĂN XẾP & MŨI TÊN THAM CHIẾU (TECHNICAL SPEC)

Để quản lý trạng thái biến số động, hệ thống xây dựng bộ máy **StateInspectorEngine**:

```
[Call Stack Frame: fib(3)] ===> (Bắn Mũi tên SVG Pointer) ===> [Virtual Heap Object]
  - local variables: n=3                                          - Address: 0x7ffd98
  - Monaco Line: 12                                               - Value: 2
```

### Thuật toán Tính toán Tọa độ Mũi tên Tham chiếu (Dynamic SVG Pointer Lines)
Hệ thống sử dụng hàm tính tọa độ `getBoundingClientRect` để lấy tâm thẻ nguồn (Stack variable card) và tâm thẻ đích (Heap memory node) để vẽ đường cong Cubic Bezier mượt mà 60 FPS nối kết hai bên.

---

## 3. HIỆN THỰC HÓA TRÌNH THANH TRA TRẠNG THÁI TS & ĐỆ QUY (CORE LOGIC)

Chúng ta xây dựng cấu trúc mô tả Stack Frame và Logic đệ quy bằng TypeScript:

```typescript
export interface StackFrame {
  frameId: string;
  functionName: string;
  lineNumber: number;
  localVariables: Record<string, { value: any; heapAddress?: string }>;
  isActive: boolean;
}
```
Lớp hạt nhân `StateInspectorEngine` sẽ được đặc tả trong tệp core logic.

---

## 4. BỐ CỤC NGĂN XẾP KÍNH MỜ & MŨI TÊN NEON HEAP (UI/UX)

### 4.1. Thiết kế Giao diện Khung Stack Frame (Stack UI)
*   **Call Stack Container:** Xếp chồng thẳng đứng các khung Stack Frame mờ kính Glassmorphic sang trọng. Khung trên cùng phát sáng viền Cyan nhẹ, các khung dưới mờ dần và nhỏ đi tạo chiều sâu vật lý 3D.
*   **Pointer Neon Arrows:** Các đường nét đứt chạy luồng sáng trôi trượt (flowing light neon) nối từ Call Stack sang Heap ảo, tạo hiệu ứng truyền tin vật lý sống động.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA PATH STORE (STATE MANAGEMENT)

Xây dựng store `useStateInspectorStore.ts` quản lý ngăn xếp:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStateInspectorStore = defineStore('stateInspector', () => {
  const stackFrames = ref<any[]>([]);
  const selectedFrameId = ref<string | null>(null);
  const highlightedVariable = ref<string | null>(null);

  return { stackFrames, selectedFrameId, highlightedVariable };
});
```

---

## 6. QUYẾT ĐỊNH KIẾN TRÚC & BẢN ĐỒ THAM CHIẾU Ô NHỚ ẢO (ADR)

### ADR-23: Vẽ Liên Kết Tọa độ Động Pointer-to-Heap thông qua Bezier Curves chạy ở Client-side

*   **Quyết định:** Sử dụng giải pháp tính toán tọa độ động DOM (Bounding Box coordinates) vẽ đường cong SVG Bezier nối Stack và Heap hoàn toàn ở Client-side dưới **10ms** thay vì render tĩnh hay truyền tọa độ cứng từ server.
*   **Lý do:**
    1.  *Kháng co giãn màn hình (Responsive Resilience):* Khi sinh viên thu nhỏ trình duyệt hay xoay màn hình máy tính bảng, tọa độ DOM thay đổi lập tức cập nhật lại Bezier curve mượt mà 60 FPS, đường vẽ không bị lệch hay đứt đoạn.
    2.  *Học thuật hóa bộ nhớ máy tính:* Tạo sự liên kết tuyệt đối giữa Stack (lệnh thực thi) và Heap (dữ liệu vật lý), xua tan sự mờ mịt của con trỏ C/C++.

---

## 7. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 7.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Giao diện Stack Frames & Mũi tên Neon (Ngày 1-3):** Dựng layout Stack Container 3D kính mờ, vẽ mũi tên SVG pointer nối Stack-Heap, neon flowing animation.
2.  **Sprint B: Engine Quản lý StateInspectorEngine & Cây Đệ quy (Ngày 4-6):** Lập trình logic Push/Pop stack frame TS, vẽ cây đệ quy SVG tự co giãn, Monaco code sync click frames.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Call Stack chồng xếp mượt mà 3D, click chọn stack frame cũ bắt buộc di chuyển con trỏ và highlight dòng code tương ứng trong Monaco Editor.
*   Mũi tên SVG pointer bám bắt tọa độ DOM chính xác tuyệt đối từ ô biến số ngăn xếp trỏ đúng địa chỉ ô nhớ Heap ảo.
*   Cây đệ quy SVG tự động sinh nhánh màu lục Emerald (active) và Cyan (resolved) thời gian thực bám sát bước chạy.
*   Tọa độ mũi tên tự động cập nhật lại chính xác tức thì khi người học resize trình duyệt mà không bị lệch vị trí.
*   Giải phóng 100% tài nguyên window resize listeners và canvas khi đóng workspace tránh rò rỉ RAM GC.
