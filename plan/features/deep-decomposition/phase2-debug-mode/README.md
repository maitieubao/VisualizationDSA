# 🐛 CHẾ ĐỘ DEBUG THUẬT TOÁN (ALGORITHMIC STEP DEBUGGER WORKSPACE)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Algorithmic Step Debugger Workspace** - phân hệ lập trình tương tác, đặt điểm dừng Breakpoint, gỡ lỗi đa cấp bậc và trực quan hóa ngăn xếp đệ quy (Call Stack) thuộc **Phase 2** của **VisualizationDSA**. Tài liệu này đặc tả chi tiết kiến trúc của bộ biên dịch cô-ru-tin JavaScript (Coroutine Generator Compiler), đồng bộ điểm dừng trên lề Monaco Editor (Gutter Breakpoint Registry), thiết kế giao diện Watch Panel và Call Stack Tree lộng lẫy, cùng các giải thuật điều tiết gỡ lỗi dòng thời gian xuất sắc.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Nghiệp vụ & Bản đồ Gỡ lỗi (PRD)](#1-tầm-nhìn-nghiệp-vụ--bản-đồ-gỡ-lỗi-prd)
2. [Kiến trúc Tiêm Generator & Trực quan Đệ quy (TECHNICAL SPEC)](#2-kiến-trúc-tiêm-generator--trực-quan-đệ-quy-technical-spec)
3. [Hiện thực hóa Bộ máy Coroutine Debugger (Core Logic)](#3-hiện-thực-hóa-bộ-máy-coroutine-debugger-core-logic)
4. [Thiết kế Breakpoint lề Monaco & Call Stack Glassmorphism (UI/UX)](#4-thiết-kế-breakpoint-lề-monaco--call-stack-glassmorphism-uiux)
5. [Quản lý Trạng thái Pinia Live Debugger (State Management)](#5-quản-lý-trạng-thái-pinia-live-debugger-state-management)
6. [Hạ tầng Truyền tải Tin nhắn Hộp cát Sandbox (Infrastructure)](#6-hạ-tầng-truyền-tải-tin-nhắn-hộp-cát-sandbox-infrastructure)
7. [Hợp đồng JSON Schema API Gỡ lỗi Động (API Reference)](#7-hợp-đồng-json-schema-api-gỡ-lỗi-động-api-reference)
8. [Quyết định Kiến trúc & Động cơ Generator Yield (ADR)](#8-quyết-định-kiến-trúc--động-cơ-generator-yield-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN NGHIỆP VỤ & BẢN ĐỒ GỠ LỖI (PRD)

### 1.1. Tầm nhìn: Biến công cụ Debug lập trình thành chiếc kính lúp sư phạm trực quan
Mặc dù các trình duyệt có sẵn Chrome DevTools, nhưng chúng được thiết kế cho kỹ sư phát triển phần mềm chuyên nghiệp: giao diện cực kỳ phức tạp, không liên kết trực quan với hoạt ảnh dịch chuyển của Canvas, và Call Stack đệ quy hiển thị dạng chữ rất khó hiểu đối với sinh viên mới học.

**Algorithmic Step Debugger Workspace** mang lại giao diện Debug chuyên biệt EdTech tối giản nhưng vô cùng mạnh mẽ:
*   **Breakpoint ngay trên lề Monaco Editor:** Học sinh nhấp chuột vào lề dòng code để đặt chấm tròn đỏ phát sáng.
*   **Bảng VCR điều khiển dòng lệnh:** Nút `Step Over` (Chạy qua dòng kế), `Step Into` (Chui vào hàm đệ quy), `Step Out` (Thoát khỏi hàm đệ quy) và `Continue` (Phát cho tới điểm dừng tiếp theo) đồng bộ thời gian thực với vị trí dòng code Monaco và Canvas.
*   **Watch Panel sắc nét:** Theo dõi sự thay đổi của các biến số `i`, `j`, `pivot`, `temp` tức khắc, chuyển đổi Neon xanh lam khi biến vừa bị biến đổi giá trị.
*   **Visual Call Stack Tree (Cây đệ quy trực quan):** Trực quan hóa cấu trúc gọi hàm lồng nhau dạng thẻ xếp chồng (Stack frame cards), vô cùng hiệu quả khi giảng dạy các bài học Đệ quy phức tạp như Quick Sort, Merge Sort hay Duyệt cây nhị phân (Tree Traversals).

---

## 2. KIẾN TRÚC TIÊM GENERATOR & TRỰC QUAN ĐỆ QUY (TECHNICAL SPEC)

Khi sinh viên bấm nút Debug trên Monaco Workspace, tệp mã nguồn JS được xử lý qua 2 bước kỹ thuật cao cấp:

### 2.1. Giải thuật Biến đổi Cú pháp AST Generator
Hệ thống sử dụng thư viện `acorn` để parse mã JS của sinh viên sang AST, duyệt cây bằng `estraverse` và tiến hành:
1.  Đổi tên hàm thô `function bubbleSort(arr)` thành hàm Generator `function* bubbleSort(arr)`.
2.  Tiêm mã lệnh dừng `yield` tại mỗi dòng code chứa lệnh thực thi để hỗ trợ tạm ngắt luồng.
3.  Ví dụ: biến đổi dòng `arr[i] = temp;` thành:
    ```javascript
    arr[i] = temp;
    yield { line: 8, arrayState: [...arr], variables: { i, temp } };
    ```
4.  Viết lại chuỗi mã bằng `escodegen` và chạy trong luồng Sandbox Web Worker.

---

## 3. HIỆN THỰC HÓA BỘ MÁY COROUTINE DEBUGGER (CORE LOGIC)

Lớp hạt nhân `LiveCompilerDebugger` điều phối vòng lặp gọi generator `next()` phục vụ cho các nút bấm Step Over/Step Into.

```typescript
export interface DebugFrame {
  lineNumber: number;
  arrayState: number[];
  variables: Record<string, any>;
  callStack: string[];
}
```
Chi tiết thuật toán dịch chuyển và bắt trùng Breakpoint dòng code sẽ được trình bày chi tiết trong tệp logic lõi.

---

## 4. THIẾT KẾ BREAKPOINT LỀ MONACO & CALL STACK GLASSMORPHISM (UI/UX)

### 4.1. Thiết kế Giao diện Debug Workspace
*   **Monaco Breakpoint Gutter:** Nhấp chuột tạo chấm tròn đỏ rực `#F43F5E` Neon có hiệu ứng thở nhẹ (pulse animation).
*   **Active Highlight Line:** Dòng code hiện hành đang dừng debug được tô màu nền Cyan sương mờ phát sáng dịu mắt.
*   **Visual Call Stack Card Stack:** Các khung đệ quy được vẽ chồng lên nhau theo hiệu ứng kính mờ 3D Glassmorphism sang trọng. Khung hàm hiện hành ở đỉnh Stack có viền sáng rực rỡ.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA LIVE DEBUGGER (STATE MANAGEMENT)

Xây dựng bộ quản lý trạng thái Pinia Setup Store `useLiveDebuggerStore.ts`:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLiveDebuggerStore = defineStore('liveDebugger', () => {
  const activeBreakpoints = ref<number[]>([]);
  const currentLineNumber = ref<number | null>(null);
  const callStackFrames = ref<string[]>([]);
  const watchedVariables = ref<Record<string, any>>({});
  const isPaused = ref(false);

  return { activeBreakpoints, currentLineNumber, callStackFrames, watchedVariables, isPaused };
});
```

---

## 6. HẠ TẦNG TRUYỀN TẢI TIN NHẮN HỘP CÁT SANDBOX (INFRASTRUCTURE)

### 6.1. Hộp thư Giao tiếp Web Worker (Worker Message Protocol)
Giao tiếp giữa Main Thread và Web Worker được đóng gói chặt chẽ dưới dạng tin nhắn định dạng JSON, bảo đảm luồng UI của trình duyệt luôn mượt mà trong lúc luồng Sandbox thực thi code Generator.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐỘNG CƠ GENERATOR YIELD (ADR)

### ADR-12: Simulated Coroutine-like Pause/Resume Engine for JS Execution

*   **Quyết định:** Sử dụng giải pháp **Hàm tạo Generator (`function*`) kết hợp từ khóa `yield`** để làm động cơ tạm ngắt/chạy tiếp thuật toán, thay vì chạy luồng thô JS.
*   **Lý do:** Trình duyệt JS mặc định không cho phép dừng luồng thực thi nửa chừng. Bằng cách dịch mã nguồn thô sang dạng generator yield, ta biến thuật toán của sinh viên thành một chuỗi Iterator. Mỗi lần người dùng nhấn nút `Step Over`, ta chỉ cần gọi `generator.next()`, cho phép tạm dừng luồng chạy ảo vô cùng chính xác mà không tốn tài nguyên hệ thống.
*   **Kết quả:** Học sinh có thể trải nghiệm Debug chuyên nghiệp mượt mà, định vị chính xác vị trí lỗi lô-gíc giải thuật đệ quy.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Monaco Gutter Breakpoints & Call Stack UI (Ngày 1-3):** Đồng bộ hóa nhấp chuột tạo chấm tròn đỏ Breakpoint lề Monaco, vẽ các hộp chồng thẻ Call Stack đệ quy Glassmorphic mượt mà.
2.  **Sprint B: Bộ dịch Coroutine Generator yield & Step Engine (Ngày 4-6):** Viết bộ máy `LiveCompilerDebugger` tiêm yield dừng dòng, kết nối phím Step Over/Into/Out/Continue đồng bộ Canvas.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Nhấp chuột vào lề Monaco Editor tạo thành công chấm tròn đỏ Breakpoint phát sáng Neon.
*   Nhấn nút Debug dừng chính xác tại dòng chứa Breakpoint, dòng code đó sáng viền Cyan sương mờ.
*   Nút Step Over/Step Into di chuyển dòng code chuẩn xác và thay đổi hình ảnh Canvas mượt mà 60 FPS.
*   Watch Panel cập nhật đúng đắn giá trị các biến chạy tại dòng dừng.
*   Cây Stack đệ quy hiển thị phân cấp xếp chồng hoàn hảo khi chạy thuật toán Quick Sort đệ quy.
