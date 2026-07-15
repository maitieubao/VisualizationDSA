# 🚀 Product Requirements Document (PRD) - Interactive Quiz System (Phase 1)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Interactive Quiz System** (Hệ thống Trắc nghiệm tương tác) chuyển đổi trải nghiệm đánh giá năng lực của người học từ việc trả lời chữ thô sơ sang hình thức tương tác trực quan động tích hợp trực tiếp vào tiến trình học tập. Phân hệ mang lại phản hồi lý thuyết tức thì và thúc đẩy tư duy chủ động thông qua các câu hỏi điểm dừng đột xuất và câu hỏi nhấp trực tiếp đỉnh Canvas.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Chống thụ động bằng Điểm dừng đột xuất (Checkpoints):** Tự động dừng bài giảng E-Lecture tại các khung hình then chốt để đặt câu hỏi thử thách tư duy, yêu cầu người học tương tác để tiếp tục.
*   **Trắc nghiệm nhấp Canvas trực quan (Canvas Click Targets):** Hỗ trợ dạng câu hỏi yêu cầu người học nhấp chọn trực tiếp một đỉnh (Node) trên Canvas làm phương án trả lời.
*   **Giải thích Markdown phản hồi tức thì:** Hiển thị tức thời lý thuyết giải thích chi tiết có đầy đủ định dạng (bôi đậm, in nghiêng, khối mã lệnh) sau khi nộp đáp án.
*   **Bảo lưu tiến độ học tập:** Lưu trữ kết quả trắc nghiệm và tỷ lệ trả lời đúng cục bộ (Local Storage Stats) để sinh viên theo dõi tiến độ ôn thi.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 1 MVP Scope)

### 3.1. Điểm dừng Trắc nghiệm nổi (Interactive Checkpoints)
*   Khả năng so khớp khung hình `currentFrameIndex` và tự động tạm dừng bài giảng, kích hoạt lớp phủ kính mờ đè lên bảng điều khiển Canvas.
*   Hiện thẻ trắc nghiệm nổi bật chính giữa màn hình với các phương án lựa chọn được sắp xếp ngay ngắn.

### 3.2. Chế độ câu hỏi nhấp Canvas (Canvas-targeted Quiz)
*   Hỗ trợ khóa hoàn toàn thanh công cụ Toolbar vẽ và mở lớp lắng nghe sự kiện click chuột trên Canvas.
*   Chấm điểm chính xác bằng thuật toán khoảng cách hình học đối chiếu với ID đỉnh đáp án đúng.

### 3.3. Thẻ giải thích Markdown & Mở khóa bài giảng
*   Hiển thị lời giải thích kỹ thuật định dạng Markdown chuyên nghiệp ngay dưới câu hỏi.
*   Nút bấm mở khóa tháo dỡ cờ khóa tương tác bài giảng, tiếp tục phát hoạt ảnh mượt mà từ khung hình cũ.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một học sinh đang xem bài giảng thuật toán Dijkstra, tôi muốn hệ thống tự động dừng lại trước khi bắt đầu duyệt đỉnh kề để đặt câu hỏi đố vui giúp tôi kiểm tra xem mình có đoán đúng đỉnh tiếp theo sẽ được duyệt hay không.
*   Là một sinh viên ôn thi cấu trúc dữ liệu cây, tôi muốn nhận được câu hỏi yêu cầu nhấp chuột vào đỉnh gốc (Root Node) của cây nhị phân trên Canvas để kiểm tra phản xạ nhận diện đồ họa của mình.
*   Là một người học trả lời sai, tôi muốn đọc ngay lời giải thích lý thuyết sắc sảo giải thích cặn kẽ tại sao phương án tôi chọn lại không chính xác để tôi sửa sai lập tức.
