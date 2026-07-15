# 🚀 Product Requirements Document (PRD) - Execution Control (Phase 1)

## 1. Tổng quan Sản phẩm (Overview)
Phân hệ **Execution Control** (Bảng Điều khiển Tiến trình) hoạt động như một bảng điều phối VCR (Video Cassette Recorder) cho phép người học kiểm soát dòng thời gian phát hoạt ảnh của giải thuật. Nó mang lại khả năng tương tác tự nhiên như đang tua hoặc chỉnh tốc độ một video thông thường để phân tích sâu các bước giải thuật phức tạp.

---

## 2. Mục tiêu Trải nghiệm (Goals)
*   **Kiểm soát dòng thời gian trực quan:** Cung cấp thanh kéo trượt tiến trình (Timeline Slider) Youtube-style và các nút Play, Pause, Replay thân thuộc.
*   **Hỗ trợ phân tích chi tiết từng bước:** Cho phép lùi/tiến từng khung hình (Step Backward/Forward) để kết nối trực tiếp biến đổi mảng với dòng mã nguồn tương ứng.
*   **Linh hoạt tốc độ giảng dạy:** Tăng giảm tốc độ phát từ $0.25\times$ đến $4\times$ để phù hợp với nhịp tiếp thu của từng sinh viên.
*   **Hỗ trợ phím tắt chuyên nghiệp:** Tích hợp phím tắt toàn cục để nâng cao hiệu quả thao tác bàn phím của học viên.

---

## 3. Phạm vi MVP (Phase 1 MVP Scope)

### 3.1. Các nút hành động VCR cơ bản
*   Nút **Play/Pause** dạng chuyển trạng thái tức thì.
*   Nút **Step Backward** `[|◀]` (Lùi 1 bước) và **Step Forward** `[▶|]` (Tiến 1 bước).
*   Nút **Replay** `[↩]` xuất hiện tự động khi chạy đến khung hình cuối cùng để phát lại nhanh từ Frame 0.

### 3.2. Thanh tiến trình Timeline Slider
*   Kéo thả tự do bằng chuột để trượt qua các khung hình giải thuật.
*   Hiển thị **Tooltip Động** lấy nội dung thuyết minh `explanation` khi rê chuột qua các phân đoạn.

### 3.3. Bộ tinh chỉnh tốc độ (Speed Multiplier)
*   Dropdown lựa chọn các hệ số tốc độ tiêu chuẩn: $0.25\times$, $0.5\times$, $1.0\times$ (Mặc định), $2.0\times$, $4.0\times$.

---

## 4. Yêu cầu Trải nghiệm Người dùng (User Stories)
*   Là một học viên đang xem hoạt họa Merge Sort phân tách mảng đệ quy, tôi muốn bấm phím cách `Space` để tạm dừng ngay lập tức khi phát hiện bước phân tách quá nhanh để có thời gian đọc lý thuyết đi kèm.
*   Là một sinh viên đang phân tích giải thuật hoán vị Bubble Sort, tôi muốn bấm nút mũi tên Trái `<-` để lùi lại đúng bước so sánh trước đó để đối chiếu với dòng mã giả Pseudocode hiện hành.
*   Là một người học vội trước giờ thi, tôi muốn chỉnh tốc độ lên $4\times$ để lướt nhanh thuật toán Selection Sort xem tổng quan rồi đi làm bài tập.
