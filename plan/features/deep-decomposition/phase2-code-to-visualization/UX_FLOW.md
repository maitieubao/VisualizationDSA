# 🌊 UX Flow & Interactive IDE Walkthroughs - Code-to-Visualization

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) trong tiến trình lập trình thuật toán tùy biến, sửa lỗi biên dịch cú pháp và vận hành Sandbox an toàn trên **Code-to-Visualization Compiler**.

---

## 📌 KỊCH BẢN 1: HỌC VIÊN SOẠN THẢO THUẬT TOÁN CUSTOM BUBBLE SORT & SỬA LỖI CÚ PHÁP

### Tình huống: Học sinh muốn thử viết thuật toán Bubble Sort đổi hướng quét mảng số và lỡ gõ sai dấu đóng ngoặc

```
[Mở tab Lập trình Tùy biến (Custom Code IDE)]
[Bên trái: Trình soạn thảo Monaco Editor hiển thị mã hàm thô]
[Bên phải: Canvas hiển thị mảng cột số chưa sắp xếp]
        |
        v Học sinh chỉnh sửa hàm, gõ thiếu dấu ngoặc ở câu điều kiện: "if (arr[j] > arr[j+1] {"
        v Bấm nút [ RUN COMPILATION ] màu Cyan lấp lánh
[Nút bấm chuyển trạng thái "Đang biên dịch...", vô hiệu hóa (disabled) click tiếp]
[Đường viền của Monaco Editor lóe sáng đỏ nhấp nháy Neon]
[Bảng Compiler Console Logs bên dưới cuộn dòng chữ thông báo lỗi Rose Red:]
"12:33:05 [LỖI] Phân tích cú pháp AST thất bại: Unexpected token, expected ')' (Dòng số 6)"
        |
        v Học sinh quan sát dòng lỗi, phát hiện thiếu dấu đóng ngoặc ")", sửa lại code sạch sẽ
        v Nhấp lại nút [ RUN COMPILATION ]
[Viền Monaco đổi sang màu xanh lá Emerald phát sáng nhẹ nhàng]
[Compiler Logs hiển thị chữ Cyan Neon tươi tắn:]
"12:33:10 [INFO] Phân tích AST thành công. Khởi chạy Web Worker Sandbox..."
"12:33:10 [SUCCESS] Tạo vết thực thi thành công! Sinh ra 52 bước hoạt ảnh."
[Canvas bên phải tự động nhảy về đầu tiên và bắt đầu vẽ hoạt ảnh chạy trơn tru 60 FPS]
```

---

## 📌 KỊCH BẢN 2: HỌC VIÊN VÔ TÌNH VIẾT VÒNG LẶP VÔ HẠN (INFINITE LOOP SAFETY)

### Tình huống: Người học gõ nhầm biến tăng giảm chỉ số khiến vòng lặp while chạy vô tận

```
[Đang soạn thảo thuật toán sắp xếp nhanh trong Monaco Editor]
        |
        v Gõ sai cú pháp: while(i < n) { // quên tăng giá trị i++ }
        v Nhấp nút [ RUN COMPILATION ]
[Nút bấm chuyển sang loading. Luồng Web Worker chạy cát được kích hoạt dưới nền]
[Học sinh di chuột lướt trên màn hình, giao diện Vue 3 vẫn di chuyển cực kỳ mượt mà, không đơ]
        |
        v Hệ thống đếm thời gian Timeout trôi qua đúng 1.5 giây
[Main Thread tự động hủy bỏ luồng Worker nền đang quá tải]
[Monaco Editor phát sáng Neon Rose đỏ cảnh báo]
[Bảng Compiler Console Logs bật thông báo an toàn:]
"12:34:02 [LỖI] Thực thi quá tải thời gian (Timeout 1.5s)! Phát hiện cấu trúc lặp vô hạn (Infinite Loop)."
"12:34:02 [LỖI] Trình duyệt của bạn đã được bảo vệ an toàn. Hãy kiểm tra lại điều kiện dừng của vòng lặp!"
        |
        v Học sinh mỉm cười nhẹ nhõm, sửa lại điều kiện tăng "i++" và nhấn Run biên dịch thành công
```
 Trải nghiệm lập trình bảo vệ an toàn tuyệt đối và phản hồi thông minh giúp sinh viên luôn cảm thấy được hỗ trợ tối đa, xóa bỏ hoàn toàn rào cản sợ sai khi viết mã nguồn thuật toán phức tạp.
