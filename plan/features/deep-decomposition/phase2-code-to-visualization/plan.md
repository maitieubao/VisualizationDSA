# 📅 Implementation Plan - Code-to-Visualization Compiler (Phase 2)

Kế hoạch phát triển phân hệ Biên dịch Mã nguồn sang Hoạt ảnh (Code-to-Visualization Compiler) được phân bổ làm 2 Sprint chính để cam kết trải nghiệm IDE mượt mà và tính an toàn tuyệt đối của môi trường Sandbox Web Worker.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Tích hợp IDE Monaco & Bộ phân tích AST (Ngày 1-3)  |
| - Nhúng trình soạn thảo Monaco Editor vào giao diện Vue 3.   |
| - Thiết lập tự động thụt dòng, gợi ý cú pháp JavaScript.    |
| - Viết mô-đun Acorn Parser phân tích mã thô sang AST ở Client. |
| - Xây dựng khung hiển thị lỗi cú pháp Compiler Console Logs.|
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Web Worker Sandbox & Tiêm mã Tracing (Ngày 4-6)   |
| - Hiện thực hóa duyệt cây AST tiêm mã traceCompare, traceSwap.|
| - Cài đặt cơ chế chèn biến đếm vòng lặp chống lặp vô hạn.   |
| - Dựng luồng Web Worker cát chạy độc lập cách ly luồng UI.   |
| - Nạp mảng FrameDTO kết quả vào useAnimationStore Canvas.   |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Tích hợp IDE Monaco & Bộ phân tích AST (Ngày 1-3)
*   **Mục tiêu:** Xây dựng giao diện workspace lập trình cao cấp cho sinh viên, nhúng IDE Monaco và hoàn thành mô-đun phân tích mã thô sang cây cú pháp AST.
*   **Danh sách công việc:**
    1.  [ ] Nhúng component Monaco Editor vào dự án Vue 3, cấu hình giao diện tối Slate, font chữ lập trình chuyên nghiệp `JetBrains Mono`.
    2.  [ ] Thiết lập tự động kiểm thử cú pháp (Linting), gạch chân đỏ báo lỗi dòng code tức thì khi sinh viên gõ thiếu dấu hoặc sai cú pháp JavaScript.
    3.  [ ] Tích hợp thư viện `acorn` phân tích mã JS của sinh viên thành cây AST dạng cấu hình JSON.
    4.  [ ] Thiết kế bảng thông báo nhật ký biên dịch `CompilerConsole.vue` hiển thị lỗi biên dịch hoặc mốc biên dịch thành công lôi cuốn.

### Sprint B: Web Worker Sandbox & Tiêm mã Tracing (Ngày 4-6)
*   **Mục tiêu:** Hoàn thiện bộ máy duyệt AST tiêm ghi vết hoạt ảnh, xây dựng Sandbox an toàn bảo vệ trình duyệt khỏi lặp vô hạn và kết nối mảng Frame sang Canvas.
*   **Danh sách công việc:**
    1.  [ ] Viết mã Walker duyệt cây AST, phát hiện các lệnh so sánh mảng và gán trị mảng để chèn tự động `traceCompare`, `traceAssign`.
    2.  [ ] Tiêm tự động biến đếm vòng lặp `__loopCounter` ngăn chặn các vòng lặp vô hạn vượt quá 10,000 lần lặp.
    3.  [ ] Tạo Web Worker cát, truyền tệp code hoàn chỉnh qua Blob URL để chạy cô lập, lắng nghe postMessage trả về.
    4.  [ ] Đóng gói mảng Frame thu thập được, đồng bộ sang `useAnimationStore` để Canvas lập trình vẽ hoạt ảnh sắc nét.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Học sinh soạn thảo code trong Monaco Editor mượt mà, gợi ý cú pháp hoạt động chính xác.
2.  Nhấn nút Run biên dịch và phát hoạt ảnh mượt mà dưới 200ms đối với các đoạn code hợp lệ.
3.  Vòng lặp vô hạn hoặc lỗi chia cho 0 được phát hiện và ngắt luồng an toàn sau 1.0 giây bởi Sandbox, tuyệt đối không gây đơ cứng màn hình của lớp học.
4.  Hoạt ảnh Canvas vẽ chuẩn xác khớp với từng lượt hoán vị, so sánh do học sinh tùy biến.
