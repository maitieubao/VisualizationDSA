# 🚀 BIÊN DỊCH MÃ NGUỒN SANG HOẠT ẢNH (CODE-TO-VISUALIZATION COMPILER)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Code-to-Visualization Compiler** - phân hệ đỉnh cao và mang tính đột phá kỹ thuật lớn nhất của dự án **VisualizationDSA**. Tài liệu này đặc tả chi tiết kiến trúc biên dịch mã nguồn trực tiếp ở Client-side bằng cách phân tích Cây cú pháp trừu tượng (Abstract Syntax Tree - AST), tự động tiêm mã theo dõi trạng thái (AST Code Instrumentation), thực thi mã nguồn trong môi trường cát cô lập (Web Worker Sandbox), và chuyển đổi tức khắc thuật toán tự viết của học sinh sang hoạt ảnh Canvas động 60 FPS.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Nghiệp vụ & Trình soạn thảo Sáng tạo (PRD)](#1-tầm-nhìn-nghiệp-vụ--trình-soạn-thảo-sáng-tạo-prd)
2. [Kiến trúc Phân tích AST & Tiêm mã Tracing (TECHNICAL SPEC)](#2-kiến-trúc-phân-tích-ast--tiêm-mã-tracing-technical-spec)
3. [Hiện thực hóa Bộ máy AST Parser & Instrumenter (Core Logic)](#3-hiện-thực-hóa-bộ-máy-ast-parser--instrumenter-core-logic)
4. [Thiết kế IDE Thu nhỏ Monaco Editor & Compiler Logs (UI/UX)](#4-thiết-kế-ide-thu-nhỏ-monaco-editor--compiler-logs-uiux)
5. [Quản lý Pinia Store Trình Biên dịch Động (State Management)](#5-quản-lý-pinia-store-trình-biên-dịch-động-state-management)
6. [Hạ tầng Sandbox chống Treo trình duyệt & Web Workers (Infrastructure)](#6-hạ-tầng-sandbox-chống-treo-trình-duyệt--web-workers-infrastructure)
7. [Hợp đồng JSON Giáo trình Hoạt ảnh động (API Reference)](#7-hợp-đồng-json-giáo-trình-hoạt-ảnh-động-api-reference)
8. [Quyết định Kiến trúc & Phân tích AST Tiêm mã (ADR)](#8-quyết-định-kiến-trúc--phân-tích-ast-tiêm-mã-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN NGHIỆP VỤ & TRÌNH SOẠN THẢO SÁNG TẠO (PRD)

### 1.1. Tầm nhìn: Biến người học từ người dùng thụ động thành nhà phát triển sáng tạo
Ở Phase 1, học sinh được xem các thuật toán Bubble Sort, Selection Sort định sẵn trong hệ thống. Tuy nhiên, để thực sự làm chủ thuật toán, sinh viên cần được tự tay tùy biến mã nguồn và quan sát xem sự thay đổi code của mình thay đổi hành vi hoạt ảnh như thế nào.

**Code-to-Visualization Compiler** mang lại trải nghiệm đột phá:
*   **Trình soạn thảo IDE tích hợp (In-browser Monaco Editor):** Một khung soạn thảo code chuyên nghiệp ngay trên trình duyệt có gợi ý cú pháp, tự động thụt dòng.
*   **Biên dịch hoạt ảnh tức thì:** Học sinh tự viết hàm Sort của riêng mình (Ví dụ: hoán đổi thứ tự quét, thêm điều kiện dừng sớm), hệ thống phân tích và sinh hoạt ảnh Canvas bám sát chuẩn xác từng dòng lệnh tự viết đó.
*   **Sandbox an toàn (Infinite Loop Protection):** Ngăn chặn hoàn toàn việc học sinh viết vòng lặp vô hạn `while(true)` làm treo đơ tab trình duyệt bằng cơ chế đếm số lượt lặp tối đa và tự ngắt luồng Web Worker.

---

## 2. KIẾN TRÚC PHÂN TÍCH AST & TIÊM MÃ TRACING (TECHNICAL SPEC)

Để trích xuất được dấu vết thực thi (Execution Trace) từ đoạn code JavaScript tùy ý của người học mà không cần gửi về server, hệ thống áp dụng kỹ thuật **AST Instrumentation**:

### Sơ đồ Quy trình Tiêm mã Tracing Cú pháp
```
    [Đoạn mã JS tự viết của Học sinh] (Ví dụ: swap(arr, i, j))
                   |
                   v Phân tích cú pháp bằng Acorn Parser
     [Cây cú pháp trừu tượng AST]
                   |
                   v Duyệt cây AST (AST Traverser & Walker)
  [Tiêm các hàm gọi traceSwap(), traceCompare() vào các điểm nút AST]
                   |
                   v Tái tạo mã nguồn mới bằng Escodegen
   [Mã nguồn đã tiêm mã Tracing hoàn chỉnh]
                   |
                   v Chuyển sang chạy trong Web Worker Sandbox
[Mảng FrameDTO kết quả] ---> [Nạp vào useAnimationStore để phát hoạt ảnh]
```

---

## 3. HIỆN THỰC HÓA BỘ MÁY AST PARSER & INSTRUMENTER (CORE LOGIC)

Chúng ta sử dụng bộ công cụ phân tích cú pháp **Acorn** để duyệt qua cây AST của đoạn JavaScript học sinh soạn thảo, tìm các điểm nút biến đổi mảng (AssignmentExpressions như `arr[i] = temp`) hoặc so sánh (BinaryExpressions như `arr[i] > arr[j]`), tự động chèn mã ghi vết hoạt ảnh:

```typescript
// Giao diện dữ liệu Frame hoạt ảnh tự động sinh ra
export interface LiveFrameDTO {
  frameIndex: number;
  type: 'COMPARE' | 'SWAP' | 'ACCESS';
  indices: number[]; // Các chỉ số phần tử mảng chịu tương tác
  arrayState: number[]; // Trạng thái mảng số tại bước này
  variables: Record<string, any>;
}
```
Chi tiết thuật toán duyệt AST và tiêm mã sẽ được biểu diễn đầy đủ trong phần mã nguồn logic lõi.

---

## 4. THIẾT KẾ IDE THU NHỎ MONACO EDITOR & COMPILER LOGS (UI/UX)

### 4.1. Bố cục Phân cực Lập trình (IDE Code Workspace)
*   **Bên trái (50%):** Trình soạn thảo Monaco Editor bo viền Slate tối sang trọng có đầy đủ chức năng tự động gợi ý từ khóa.
*   **Bên phải (50%):** Canvas trực quan hóa hoạt ảnh kèm bảng điều khiển.
*   **Phía dưới trình soạn thảo:** Hộp thoại live console ghi nhận nhật ký biên dịch (Compiler Logs) hiển thị trạng thái thành công hoặc các thông báo lỗi cú pháp (Syntax errors) nhấp nháy đỏ Neon Emerald cuốn hút.

---

## 5. QUẢN LÝ PINIA STORE TRÌNH BIÊN DỊCH ĐỘNG (STATE MANAGEMENT)

Xây dựng bộ quản lý trạng thái Pinia Setup Store `useLiveCompilerStore.ts`:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAnimationStore } from './useAnimationStore';

export const useLiveCompilerStore = defineStore('liveCompiler', () => {
  const animStore = useAnimationStore();

  // State
  const sourceCode = ref(`function customSort(arr) {\n  // Hãy tự viết mã nguồn sắp xếp của bạn ở đây!\n}`);
  const isCompiling = ref(false);
  const compileErrors = ref<string[]>([]);
  const consoleLogs = ref<string[]>([]);

  return { sourceCode, isCompiling, compileErrors, consoleLogs };
});
```

---

## 6. HẠ TẦNG WEB WORKERS & CÁT CÔ LẬP SANDBOX (INFRASTRUCTURE)

### 6.1. Web Worker Sandbox
*   **Quy định:** Không chạy mã nguồn của học sinh trực tiếp tại Luồng giao diện (UI Main Thread) vì nếu học sinh viết vòng lặp vô hạn `while(true)`, trình duyệt sẽ bị đơ cứng (Frozen UI) bắt buộc phải đóng tab.
*   **Giải pháp:** Đẩy toàn bộ mã nguồn sau khi tiêm ghi vết vào một **Web Worker** chạy nền chạy độc lập. 
*   **Chống Treo (Timeout Guard):** Cấu hình một Timer giám sát. Nếu Web Worker chạy quá 1.0 giây mà chưa trả về mảng Frame, luồng Worker lập tức bị hủy bỏ (`worker.terminate()`) để bảo toàn tài nguyên CPU, cảnh báo lỗi lặp vô hạn an toàn cho người dùng.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & PHÂN TÍCH AST TIÊM MÃ (ADR)

### ADR-09: AST Instrumentation vs. Client-side Interpretation

*   **Quyết định:** Sử dụng công cụ **Phân tích AST & Tiêm mã Tracing (AST Instrumentation)** chạy trên nền Web Worker Sandbox.
*   **Lý do:** Việc viết một trình thông dịch (Interpreter) thủ công rất tốn công sức và khó bao quát hết các cấu trúc cú pháp của JS hiện đại. AST Instrumentation cho phép mã chạy trực tiếp bằng Engine V8 của trình duyệt ở tốc độ tối đa, trong khi Web Worker bảo vệ giao diện tuyệt đối khỏi loop treo.
*   **Kết quả:** Đồ án DSA hoạt động trơn tru xuất sắc, hỗ trợ mọi cú pháp sắp xếp tùy biến phức tạp nhất.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Tích hợp IDE Monaco Editor & Parser AST (Ngày 1-3):** Dựng trình soạn thảo, viết thư viện Acorn AST parser phân tích cú pháp JavaScript thô của sinh viên.
2.  **Sprint B: Web Worker Sandbox & Tiêm mã Tracing (Ngày 4-6):** Viết script tiêm mã tự động, dựng Sandbox nền Web Worker chống lặp vô hạn, kết nối dữ liệu trace sang Pinia Store lõi để Canvas biểu diễn hoạt ảnh.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Học sinh sửa code trong Monaco Editor, bấm nút Run hệ thống biên dịch hoàn tất dưới 200ms.
*   Viết code lỗi cú pháp hoặc vòng lặp vô hạn không bao giờ gây đơ trình duyệt, báo lỗi dòng và ngắt worker chính xác sau 1.0 giây.
*   Mã nguồn tùy biến (Ví dụ đổi chiều so sánh từ bé sang lớn) lập tức hiển thị hoạt ảnh cột Canvas chuyển động bám sát chiều đảo nghịch tương ứng xuất sắc.
