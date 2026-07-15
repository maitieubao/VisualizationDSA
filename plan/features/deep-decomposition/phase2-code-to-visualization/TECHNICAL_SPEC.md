# 🛠 Technical Specification - Code-to-Visualization Compiler (Phase 2)

Tài liệu này đặc tả chi tiết kiến trúc phân tích cây cú pháp trừu tượng AST (Acorn Parser), thuật toán tự động chèn mã ghi vết hoạt ảnh (AST Code Instrumentation) và cơ chế ngắt cát Web Worker Sandbox an toàn.

---

## 1. Thiết kế Tiêm mã Ghi vết Cây Cú pháp (AST Instrumentation Design)

Đoạn mã JavaScript do học sinh tự viết được thư viện **Acorn** biên dịch thành một Cây cú pháp trừu tượng (Abstract Syntax Tree - AST). Hệ thống thực hiện duyệt qua cây này và tiêm các hàm ghi vết hoạt ảnh vào các nút tương ứng:

### 1.1. So sánh phần tử mảng (BinaryExpression)
*   **AST Node:** `BinaryExpression` (Ví dụ: `arr[i] > arr[j]`)
*   **Mã tiêm tương đương:** Thay thế nút bằng một biểu thức hàm tự tạo:
    ```javascript
    // Trước khi tiêm
    if (arr[i] > arr[j])
    
    // Sau khi tiêm
    if (traceCompare(arr, i, j, "COMPARE_STEP"))
    ```

### 1.2. Hoán vị gán trị phần tử mảng (AssignmentExpression)
*   **AST Node:** `AssignmentExpression` (Ví dụ: `arr[i] = temp` hoặc `arr[i] = arr[j]`)
*   **Mã tiêm tương đương:**
    ```javascript
    // Trước khi tiêm
    arr[i] = arr[j]
    
    // Sau khi tiêm
    traceAssign(arr, i, j, "SWAP_STEP")
    ```

---

## 2. Giải thuật Chống Lặp vô hạn (Infinite Loop Prevention)

Để ngăn chặn các cấu trúc lặp `for`, `while`, `do-while` chạy vô hạn gây treo đơ CPU, chúng ta tự động tiêm một **Biến đếm lượt lặp (Loop Iteration Counter)** vào đầu mỗi khối lặp thông qua quá trình biến đổi AST:

```javascript
// Đoạn mã gốc soạn thảo
while (i < n) {
  // Lập trình xử lý...
}

// Đoạn mã sau khi tiêm chống treo
let __loopCounter = 0;
while (i < n) {
  if (++__loopCounter > 10000) {
    throw new Error("Phát hiện lỗi lặp vô hạn! Thuật toán đã vượt ngưỡng 10,000 lượt lặp.");
  }
  // Lập trình xử lý...
}
```

---

## 3. Kiến trúc Luồng cát Web Worker Sandbox (Sandboxed Thread Flow)

Do mã nguồn tự viết của học sinh có thể chứa các mã độc hoặc lệnh gây treo luồng, toàn bộ tiến trình thực thi được cô lập hoàn toàn dưới Web Worker.

```
[Main UI Thread (Monaco Editor)]
               |
               v Bấm nút Run (Gửi mã đã tiêm qua postMessage)
[Web Worker Sandbox Thread]
               |
               +---> 1. Khởi tạo mảng số thử nghiệm
               +---> 2. Chạy hàm customSort(arr) của học sinh
               +---> 3. Lắng nghe các hàm traceCompare, traceAssign tích lũy mảng Frame
               +---> 4. Báo cáo mảng Frame kết quả qua postMessage
               |
               v Nhận kết quả hoặc lỗi sau 1.0 giây
[Trình diễn hoạt ảnh trên Canvas]
```
Nếu luồng Worker mất hơn 1.0 giây để hoàn tất, Main UI Thread tự động gọi `worker.terminate()` và ném lỗi timeout trực quan lên bảng Console Logs của học sinh.
