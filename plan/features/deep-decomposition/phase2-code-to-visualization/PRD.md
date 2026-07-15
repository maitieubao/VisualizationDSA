# 🚀 Product Requirements Document (PRD) - Code-to-Visualization Compiler (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Code-to-Visualization Compiler** (Biên dịch Mã nguồn sang Hoạt ảnh) đại diện cho bước nhảy vọt sáng tạo nhất trong **VisualizationDSA**, cho phép sinh viên tự soạn thảo mã nguồn thuật toán JavaScript tùy ý ngay trên trình duyệt, tự động phân tích và chuyển hóa mã nguồn đó thành hoạt ảnh Canvas mô phỏng 60 FPS thời gian thực.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Kích thích tự chủ sáng tạo:** Cho phép sinh viên tự viết thuật toán sắp xếp của riêng mình (ví dụ: Bubble Sort đảo ngược, Selection Sort tối giản) và nhìn thấy trực tiếp thành quả của dòng code hoạt động trên Canvas.
*   **Trình soạn thảo IDE thu nhỏ cao cấp:** Tích hợp Monaco Editor đầy đủ chức năng tự động thụt dòng, gợi ý cú pháp và báo lỗi dòng mã (Linting).
*   **Môi trường thử nghiệm an toàn (Sandbox):** Đảm bảo sinh viên viết lỗi logic lập trình hay vòng lặp vô hạn không bao giờ làm treo tab trình duyệt của cả lớp học.
*   **Nhật ký biên dịch thời gian thực (Compiler Logs):** Bảng Console hiển thị quá trình phân tích cú pháp, số bước hoạt ảnh tạo ra hoặc lý do lỗi chi tiết giúp sinh viên dễ dàng gỡ lỗi (Debug).

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. IDE Lập trình Monaco Editor
*   Tích hợp Monaco Editor màu Slate tối cao cấp, hỗ trợ ngôn ngữ JavaScript.
*   Tự động phát hiện lỗi cú pháp và gạch chân đỏ lỗi thời gian thực.

### 3.2. Động cơ AST Tracing Instrumenter
*   Sử dụng thư viện phân tích cú pháp ở Client-side để duyệt qua cây AST của mã nguồn sinh viên.
*   Tiêm tự động các hàm ghi vết hoạt ảnh (`traceSwap`, `traceCompare`, `traceAccess`) tại các điểm hoán vị, so sánh mảng số.

### 3.3. Web Worker Sandbox & Chống Loop vô hạn
*   Khởi chạy mã nguồn sau tiêm của sinh viên dưới một Web Worker độc lập tách biệt luồng UI chính.
*   Thiết lập bộ ngắt thời gian Timeout Guard tự động hủy Worker sau 1.0 giây nếu chạy quá tải lặp vô hạn, xuất thông báo an toàn.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên xuất sắc, tôi muốn thử viết một hàm sắp xếp chèn (Insertion Sort) nâng cấp để kiểm tra xem thuật toán của tôi có số bước so sánh ít hơn thuật toán mặc định của giáo trình hay không.
*   Là một người học, khi tôi lỡ gõ sai vòng lặp khiến biến `i` chạy lùi vô hạn, tôi muốn hệ thống tự ngắt luồng an toàn và chỉ ra dòng lệnh lặp vô hạn cho tôi thay vì làm treo đơ máy tính.
*   Là một giảng viên, tôi muốn sửa trực tiếp mã nguồn trên bảng chiếu để minh họa lỗi sắp xếp kinh điển cho cả lớp quan sát hoạt ảnh chạy sai trực quan.
