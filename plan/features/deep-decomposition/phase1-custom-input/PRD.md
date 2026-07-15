# 🚀 Product Requirements Document (PRD) - Custom Input Generator (Phase 1)

## 1. Tổng quan Dự án (Overview)
Tính năng **Custom Input Generator** cho phép người dùng tự đưa dữ liệu của chính mình vào bộ máy hoạt họa giải thuật **VisualizationDSA**, vượt qua giới hạn tẻ nhạt của các bài học mặc định có sẵn. Đây là tính năng cốt lõi giúp cá nhân hóa quá trình học tập, hỗ trợ sinh viên tự thực hành kiểm thử các góc cạnh dữ liệu đặc biệt (Edge Cases) và hiểu sâu sắc hơn về giải thuật.

---

## 2. Mục tiêu Sản phẩm (Goals)
*   **Hỗ trợ đa dạng hóa dữ liệu đầu vào tùy chỉnh:** Nhập mảng một chiều (Array) dạng chuỗi văn bản phân tách bằng dấu phẩy.
*   **Trang bị bộ sinh dữ liệu ngẫu nhiên thông minh:** Tự động tạo mảng ngẫu nhiên hoàn toàn, mảng gần như đã sắp xếp (nearly sorted), hoặc mảng đảo ngược 100% (reversed case) để người dùng nhanh chóng thử nghiệm các trường hợp tốt nhất (Best Cases) và xấu nhất (Worst Cases) của thuật toán.
*   **Trải nghiệm tương tác an toàn & tin cậy:** Bảo vệ hệ thống khỏi các chuỗi nhập liệu bị lỗi định dạng hoặc cố tình nhập kích thước khổng lồ làm treo máy chủ web.

---

## 3. Chân dung Người dùng (User Personas & Stories)

### 3.1. Chân dung Người dùng
*   **Sinh viên CNTT (Vy, 21 tuổi):** Muốn tự gõ mảng số `[12, 4, 85, 9, 3]` lấy từ đề thi cuối kỳ để xem từng bước hoán vị Bubble Sort diễn ra như thế nào. Vy cần giao diện nhập liệu trực quan, dễ xóa trắng và điền số.
*   **Giảng viên lớp lý thuyết (Thầy Minh, 35 tuổi):** Muốn tạo nhanh một mảng gồm 15 số đảo ngược hoàn toàn để chứng minh trực quan độ phức tạp tệ nhất $O(N^2)$ của Bubble Sort trước lớp. Thầy cần nút **Randomize** tự động điền mảng đảo ngược chỉ trong 1 giây mà không phải gõ tay 15 số giảm dần.

### 3.2. User Stories
*   Là một sinh viên, tôi muốn nhập mảng tùy chỉnh do chính tôi nghĩ ra hoặc lấy từ sách bài tập để xem giải thuật chạy từng bước trực quan.
*   Là một người dùng, tôi muốn bấm một nút "Sinh ngẫu nhiên" để hệ thống tự điền một mảng ngẫu nhiên/mảng đảo ngược hợp lệ vào ô nhập liệu để tiết kiệm thời gian.
*   Là một giảng viên, tôi muốn hệ thống báo lỗi ngay tại trình duyệt nếu tôi gõ sai ký tự (ví dụ: gõ chữ cái `a` thay vì số), tránh việc gửi dữ liệu sai lên server rồi chờ thông báo lỗi chậm chạp.

---

## 4. Phạm vi Tính năng (Scope of Work)

### 4.1. Trong phạm vi (In-Scope)
*   Giao diện TextArea lớn cho phép nhập mảng 1D, tự động đếm số phần tử thời gian thực.
*   Dropdown sinh mảng ngẫu nhiên thông minh:
    *   *Random:* Ngẫu nhiên hoàn toàn.
    *   *Nearly Sorted:* Mảng đã được xếp tăng dần 90%, đảo lộn 1-2 cặp phần tử liền kề.
    *   *Reversed:* Mảng đảo ngược giảm dần hoàn toàn.
*   Regex validation cục bộ ở Frontend phát hiện lỗi định dạng ký tự lạ hoặc hai dấu phẩy liền nhau.
*   Backend Constraint Resolver khóa chặt giới hạn phần tử tối đa để bảo vệ CPU.

### 4.2. Ngoài phạm vi (Out-of-Scope - Phase 2)
*   Nhập và cấu hình cấu trúc đồ thị (Graph adjacency list/matrix) bằng kéo thả node trên màn hình.
*   Đọc mảng dữ liệu từ file Excel, CSV tải lên từ thiết bị.

---

## 5. Yêu cầu Phi chức năng (Non-Functional Requirements)
*   **Tốc độ xác thực cú pháp ở client:** Thời gian kiểm tra regex và hiển thị viền đỏ/xanh cảnh báo phải dưới **10ms** ngay sau khi người dùng dừng gõ phím.
*   **Độ trễ xử lý API sinh hoạt họa:** API xử lý mảng custom hợp lệ và trả về chuỗi frames phải dưới **250ms** trên môi trường mạng thông thường.
*   **Tính thích ứng thiết bị (Responsive):** Form nhập liệu hiển thị gọn gàng, tự điều chỉnh nút bấm to hơn trên các thiết bị máy tính bảng và màn hình cảm ứng điện thoại di động.
