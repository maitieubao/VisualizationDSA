# 🚀 Product Requirements Document (PRD) - Algorithmic Debugger Workspace (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Algorithmic Step Debugger Workspace** (Chế độ Debug Thuật toán) của **VisualizationDSA** mang lại một trải nghiệm thực hành gỡ lỗi chuyên biệt cho học viên, cho phép đặt các điểm dừng (Breakpoints) trực quan trên lề Monaco Editor, chạy từng dòng lệnh (Step Over/Into/Out) kết hợp theo dõi sát sao sự thay đổi của các biến số và ngăn xếp đệ quy (Call Stack), giúp chuyển hóa các giải thuật phức tạp thành các mốc chuyển động dễ nắm bắt.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Debug trực quan hóa cấp cao:** Kết nối đồng bộ mốc dừng dòng lệnh code trong Monaco Editor với trạng thái hoạt ảnh cột số trên Canvas 60 FPS thời gian thực.
*   **Đơn giản hóa gỡ lỗi đệ quy:** Trực quan hóa cấu trúc gọi hàm lồng nhau (Call Stack Frame Stack) thành các khối thẻ xếp chồng kính mờ Glassmorphism 3D sang trọng, giúp sinh viên không còn mơ hồ trước các hàm đệ quy Quick Sort hay Duyệt cây nhị phân.
*   **Bảo vệ tuyệt đối an toàn Client:** Thực thi cô lập mã nguồn Generator an toàn trong Web Worker Sandbox để tránh treo đơ trình duyệt khi người học gõ sai thuật toán đệ quy vô hạn.
*   **Watch Panel sắc sảo lôi cuốn:** Hiển thị tự động danh sách các biến chạy trong tầm vực hoạt động của dòng hiện tại, đổi Neon màu xanh lam khi biến vừa bị biến đổi giá trị.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Monaco Breakpoints Gutter
*   Cho phép sinh viên nhấp chuột trái trên cột lề Monaco Editor để bật/tắt điểm dừng (Breakpoint) biểu thị bằng chấm tròn đỏ Neon.
*   Lưu trữ danh sách các dòng Breakpoints đang hoạt động.

### 3.2. Bộ điều khiển Gỡ lỗi VCR Step Panel
*   **Step Over:** Tiến sang dòng lệnh tiếp theo trong hàm hiện tại.
*   **Step Into:** Đi sâu vào bên trong thân hàm đệ quy được gọi.
*   **Step Out:** Chạy nhanh và nhảy thoát ra ngoài hàm đệ quy hiện tại về hàm cha.
*   **Continue:** Phát hoạt ảnh liên tục cho đến khi chạm điểm dừng Breakpoint kế tiếp.

### 3.3. Cây Đệ quy Stack Frame Glassmorphism
*   Vẽ các thẻ ngăn xếp đệ quy dạng 3D xếp chồng sang trọng, cập nhật tức khắc tên hàm và tham số truyền vào khi có lời gọi đệ quy lồng nhau.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một học viên đang học Quick Sort đệ quy, tôi muốn đặt một điểm dừng tại dòng phân hoạch `partition(left, right)` và nhấn Step Into để trực tiếp chứng kiến ngăn xếp đệ quy Call Stack được đẩy thêm một thẻ hàm con mới thế nào.
*   Là một người học, tôi muốn di chuột lướt trên Watch Panel để thấy rõ giá trị của biến chỉ số `j` đổi màu vàng hổ phách khi giải thuật sắp xếp hoán đổi giá trị, giúp tôi thấu hiểu sâu sắc từng bước gán bộ nhớ ảo.
*   Là một người dùng, tôi muốn bấm nút Continue để bỏ qua các đoạn so sánh đơn điệu và chỉ dừng lại đúng dòng tôi quan tâm, giúp tôi tiết kiệm thời gian phân tích giải thuật.
