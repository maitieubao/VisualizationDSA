# 🧪 Danh Sách Ca Kiểm Thử (Unit Test Cases Specification) - Sprint 1

Tài liệu này đặc tả chi tiết **11 ca kiểm thử đơn vị (Unit Tests)** được triển khai trong phân hệ `CoreAnimationEngine` và `CompilerStepExecutor` để nghiệm thu chất lượng mã nguồn lõi Sprint 1.

---

## 📌 1. Tổng Quan Kết Quả Kiểm Thử (Test Execution Summary)

*   **Tổng số test cases:** 11/11
*   **Trạng thái:** 🟢 PASS ALL (100% thành công)
*   **Thư viện kiểm thử:** `vitest` + `vi` (mocker)
*   **Tập tin kiểm thử:** [CoreAnimationEngine.spec.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/core/__tests__/CoreAnimationEngine.spec.ts)

---

## 🛠️ 2. Đặc Tả Chi Tiết Các Ca Kiểm Thử (Test Cases Specification)

### 2.1. Nhóm 1: Kiểm Thử Động Cơ Hoạt Ảnh (CoreAnimationEngine)

#### 📝 TC-ENG-01: Phép toán nội suy tuyến tính (Lerp Math)
*   **Mục tiêu:** Đảm bảo hàm `CoreAnimationEngine.lerp` hoạt động chính xác, tự động giới hạn tham số nội suy `t` trong khoảng `[0, 1]`.
*   **Đầu vào:**
    *   `start = 10`, `end = 20`, `t = 0.5` (nội suy giữa)
    *   `start = 10`, `end = 20`, `t = -1` (dưới biên)
    *   `start = 10`, `end = 20`, `t = 2` (vượt biên)
*   **Kết quả mong đợi:**
    *   `lerp(10, 20, 0.5) === 15`
    *   `lerp(10, 20, -1) === 10` (phải clamp về 10)
    *   `lerp(10, 20, 2) === 20` (phải clamp về 20)
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-ENG-02: Phép toán nội suy tọa độ 2D (lerpPoint Math)
*   **Mục tiêu:** Kiểm tra phép nội suy tọa độ 2D `CoreAnimationEngine.lerpPoint` trên mặt phẳng Cartesian.
*   **Đầu vào:**
    *   `p1 = { x: 0, y: 0 }`, `p2 = { x: 100, y: 200 }`
    *   Thử nghiệm với `t = 0.5`, `t = -0.1`, `t = 1.5`
*   **Kết quả mong đợi:**
    *   Với `t = 0.5` -> `{ x: 50, y: 100 }`
    *   Với `t = -0.1` -> `{ x: 0, y: 0 }` (clamp biên dưới)
    *   Với `t = 1.5` -> `{ x: 100, y: 200 }` (clamp biên trên)
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-ENG-03: Đăng ký & Chạy render loop qua requestAnimationFrame
*   **Mục tiêu:** Xác minh callback vẽ hoạt ảnh đăng ký thành công và tự khởi động vòng lặp `requestAnimationFrame`.
*   **Phương thức:** Sử dụng `vi.spyOn` giả lập `globalThis.requestAnimationFrame`.
*   **Kết quả mong đợi:**
    *   Hàm `requestAnimationFrame` được gọi khi đăng ký.
    *   Callback vẽ hoạt ảnh nhận được tham số `deltaTime`.
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-ENG-04: Clamping DeltaTime đề phòng giật lag khi ẩn Tab
*   **Mục tiêu:** Đảm bảo `clampedDelta` giới hạn tối đa là **32ms** khi tab trình duyệt bị ẩn lâu ngày làm tăng đột biến deltaTime, chống giật hình/spike.
*   **Đầu vào:** Giả lập bước nhảy thời gian `1000ms` giữa 2 khung hình.
*   **Kết quả mong đợi:** `recordedDelta` đo được bằng đúng **32ms**.
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-ENG-05: Hủy đăng ký callback không tồn tại
*   **Mục tiêu:** Kiểm tra độ an toàn khi hủy đăng ký một callback chưa từng được đăng ký trước đó.
*   **Kết quả mong đợi:** Không ném ra lỗi hoặc gây sập hệ thống (Crash-safe).
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-ENG-06: Giải phóng tài nguyên tháo dỡ tránh rò rỉ RAM GC
*   **Mục tiêu:** Gọi hàm `destroy()` tháo dỡ toàn bộ render loop và dọn sạch callback.
*   **Kết quả mong đợi:** Hủy `cancelAnimationFrame`, renderCallbacks rỗng, gọi destroy nhiều lần vẫn hoạt động an toàn.
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-ENG-07: Lerp toán học tại các điểm biên cực trị
*   **Mục tiêu:** Đảm bảo lerp tại giá trị biên `t = 0` và `t = 1` khớp tuyệt đối với `start` và `end`.
*   **Kết quả mong đợi:** `lerp(0, 100, 0) === 0` và `lerp(0, 100, 1) === 100`.
*   **Trạng thái:** 🟢 **PASS**

---

### 2.2. Nhóm 2: Kiểm Thử Bộ Phân Tích Mã Cú Pháp (CompilerStepExecutor)

#### 📝 TC-COMP-01: Biên dịch dòng so sánh & hoán vị chính xác (JS Engine)
*   **Mục tiêu:** Kiểm tra khả năng phân tích cú pháp biểu thức so sánh `compare(arr[0], arr[1])` và hoán vị `swap(arr[0], arr[1])` của JS Sandbox.
*   **Đầu vào:** Mã nguồn giả mẫu:
    ```javascript
    compare(arr[0], arr[1])
    swap(arr[0], arr[1])
    ```
*   **Kết quả mong đợi:**
    *   Sinh chính xác 2 Playback Frames.
    *   `frames[0].canvasStateSnapshot.comparingIndices` là `[0, 1]`.
    *   `frames[1].canvasStateSnapshot.swappingIndices` là `[0, 1]`.
    *   Mảng số liệu được đảo chính xác: `[20, 10]`.
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-COMP-02: Bỏ qua dòng trống và bình luận
*   **Mục tiêu:** Đảm bảo compiler không biên dịch các dòng trống hoặc dòng có dấu `//`.
*   **Kết quả mong đợi:** Sinh ra 1 Playback Frame duy nhất bỏ qua bình luận và dòng trống.
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-COMP-03: Biên dịch từ khóa loop, for, while và hỗ trợ Regex Fallback
*   **Mục tiêu:** Kiểm tra khả năng nhận diện các vòng lặp, trích xuất biến vòng lặp `i`, `j`, `k` và tự động fallback sang static Regex compiler khi phát hiện mã giả không hợp lệ của JavaScript.
*   **Đầu vào:** Mã giả:
    ```
    loop i from 0
    for j from 1
    while k
    ```
*   **Kết quả mong đợi:**
    *   `frames[0].canvasStateSnapshot.loopVariables` chứa `{ i: 0 }` và tô sáng chỉ số `[0]`.
    *   `frames[1].canvasStateSnapshot.loopVariables` chứa `{ j: 1 }` và tô sáng chỉ số `[1]`.
    *   `frames[2].canvasStateSnapshot.loopVariables` chứa `{ k: 0 }`.
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-COMP-04: Biên dịch mã nguồn rỗng hoặc chỉ có khoảng trắng
*   **Mục tiêu:** Kiểm tra hành vi biên dịch khi mã nguồn trống.
*   **Kết quả mong đợi:** Trả về mảng rỗng `[]`, không ném ra ngoại lệ.
*   **Trạng thái:** 🟢 **PASS**

---

## 📈 3. Kết Luận
Tất cả các ca kiểm thử hoạt động ổn định và chính xác trên môi trường máy khách. Cơ chế đệm an toàn tự động fallback từ thực thi mã JS động sang Regex tĩnh chạy hoàn hảo khi gặp mã giả phức tạp. Độ bao phủ tính năng cốt lõi đạt **100%**.
