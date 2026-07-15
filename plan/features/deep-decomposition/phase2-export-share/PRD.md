# 🚀 Product Requirements Document (PRD) - Export & Share (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Export & Share Pipeline** (Xuất Sơ đồ & Chia sẻ) của **VisualizationDSA** thúc đẩy khả năng chia sẻ tri thức và làm bài tập thực hành thuật toán, cho phép người học lưu trữ hiện trạng phòng lab và tải xuống sơ đồ vector sắc nét độ phân giải cao phục vụ in ấn, báo cáo chỉ bằng một nút bấm vạn năng.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Hỗ trợ in ấn và thuyết trình sắc nét:** Hỗ trợ trích xuất hình ảnh chất lượng cao dạng SVG Vector (để phóng to thu nhỏ vô hạn trên Figma/Illustrator) hoặc PNG trong suốt phóng đại 3x siêu nét cho giáo án, slide báo cáo.
*   **Lưu vết và Chia sẻ Trạng thái Phòng thí nghiệm (Lab State Sharing):** Nén toàn bộ cấu hình, tọa độ thẻ lớp, các bước debug đang chạy dở của sinh viên thành mã băm ngắn gọn, cho phép lưu trữ và chia sẻ tức khắc qua URL.
*   **Thúc đẩy tương tác xã hội học thuật:** Cung cấp trình sinh mã QR động giúp sinh viên quét camera điện thoại mở nhanh sơ đồ thuật toán, tối ưu thẻ SEO OpenGraph để sơ đồ hiển thị lộng lẫy khi nhắn qua Zalo, Messenger.
*   **Trải nghiệm xuất bản tức thời:** Xử lý 100% tại trình duyệt máy khách dưới 200ms mà không tốn tài nguyên máy chủ.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Hộp thoại Xuất ảnh đa định dạng (Export Modal Panel)
*   Tùy chọn tải ảnh PNG 3x (chất lượng in ấn sắc nét Retina) hoặc SVG Vector thuần khiết.
*   Thanh tiến trình (Progress Bar) Emerald chạy mượt mà hiển thị trạng thái trích xuất.

### 3.2. Bộ Nén Trạng thái Workspace (State Serializer Engine)
*   Nén mảng cấu hình JSON coordinates sang chuỗi Base64 rút gọn an toàn cho đường dẫn URL.
*   Tự động giải nén khôi phục trạng thái workspace giống hệt 100% nguyên bản khi mở link chia sẻ.

### 3.3. Trình sinh QR Code & Social SEO Cards
*   Sinh mã QR Code động mượt mà bao quanh bởi viền vàng Neon lộng lẫy.
*   Tự động sinh thẻ Meta OpenGraph phù hợp với từng giải thuật được chia sẻ.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên vừa hoàn thành sơ đồ lớp SOLID DIP Sandbox cực kỳ ưng ý, tôi muốn xuất tệp ảnh PNG 3x nền trong suốt để chèn vào báo cáo PDF nộp bài tập lớn, đảm bảo hình ảnh phóng to không bị mờ nhòe chữ JetBrains Mono.
*   Là một trợ giảng khóa học thuật toán, tôi muốn sắp đặt sẵn một cấu hình cây đệ quy QuickSort phức tạp, tạo liên kết chia sẻ rút gọn gửi lên group chat lớp, để toàn bộ sinh viên trong lớp nhấp chuột vào link mở ra chính xác 100% trạng thái tôi đã sắp xếp và bắt đầu học tập lập tức.
*   Là một học viên đang xem slide bài giảng in giấy của thầy giáo, tôi muốn dùng camera điện thoại quét mã QR in trên lề trang sách để ngay lập tức mở sơ đồ động tương tác thuật toán đó trên điện thoại của mình.
