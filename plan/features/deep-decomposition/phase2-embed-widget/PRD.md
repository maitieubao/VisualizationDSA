# 🚀 Product Requirements Document (PRD) - Interactive Embed Widget (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Interactive Embed Widget** (Tiện ích Nhúng Sơ đồ Trực quan) của **VisualizationDSA** mở rộng khả năng tiếp cận giáo dục thuật toán, cho phép giáo viên, giảng viên đại học, blogger công nghệ nhúng trực tiếp các sơ đồ thuật toán tương tác động mượt mà vào giáo trình điện tử của họ chỉ bằng vài thao tác copy-paste đơn giản.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Tối đa hóa mức độ phủ sóng bài học:** Đưa sơ đồ trực quan tương tác 60 FPS đi muôn nơi - từ các hệ thống quản lý học tập LMS chuyên nghiệp (Moodle, Canvas) đến các trang chia sẻ kiến thức cộng đồng (Medium, WordPress).
*   **Cung cấp bảng cấu hình trực quan cao cấp (Embed Configurator):** Hỗ trợ người dùng tinh chỉnh giao diện widget (chọn theme mờ Glassmorphic sành điệu, ẩn hiện watch variables, bật tắt phím tua VCR) và lấy code nhúng tức khắc.
*   **Kết nối truyền tin hai chiều an toàn:** Cung cấp giải pháp giao tiếp `postMessage` bảo mật, giúp bài giảng ở trang chủ tương tác trực tiếp với iframe nhúng bên trong và nhận điểm số hoàn thành quiz của sinh viên.
*   **Siêu nhẹ và tương thích hoàn hảo:** Tự động co giãn chiều cao loại bỏ thanh cuộn kép gây khó chịu, tải trang siêu tốc dưới 150KB.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Bảng Cấu hình Tiện ích Nhúng (Embed Configurator Sidebar)
*   Bộ tùy biến Theme (Dark, Light, Glassmorphism).
*   Bật/tắt VCR controls (Play/Pause, Slider) và bảng Watch Variables.
*   Thiết lập chế độ: Interactive (cho phép học sinh bấm kéo thả tự do) hoặc Static (chỉ hiển thị hoạt ảnh trình diễn).

### 3.2. Bộ sinh Mã nhúng Tốc hành (Copy-paste Code Generator)
*   Nút bấm Copy tự động tạo thẻ `<iframe src="..." width="..." height="..." sandbox="...">`.
*   Hoạt ảnh "Copied!" Emerald mượt mà khi nhấp chuột sao chép.

### 3.3. Cầu nối Truyền tin postMessage Bridge
*   Truyền sự kiện từ Host vào Widget (ví dụ: tua bước, reset).
*   Bắn sự kiện từ Widget ngược ra Host (ví dụ: học viên giải xong quiz, hoàn tất hoạt ảnh).

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một giảng viên CNTT tại Bách Khoa đang soạn giáo trình đệ quy trên Moodle, tôi muốn nhúng trực quan cây đệ quy QuickSort vào bài viết của mình, cấu hình ẩn bớt code editor Monaco cho gọn màn hình, để sinh viên của tôi có thể trực tiếp click từng bước đệ quy ngay trong bài học LMS mà không cần chuyển hướng trang.
*   Là một blogger công nghệ viết bài giải thuật trên WordPress, tôi muốn nhúng một widget Heap Sort glassmorphic sành điệu, tự động co giãn chiều cao theo màn hình di động của người đọc để bài viết của tôi trông vô cùng cao cấp và chuyên nghiệp.
*   Là một lập trình viên LMS, tôi muốn lắng nghe sự kiện `QUIZ_COMPLETED` từ iframe nhúng gửi ra trang chủ để tự động ghi nhận điểm thi của học sinh vào cơ sở dữ liệu chung của nhà trường.
