# 🚀 Product Requirements Document (PRD) - E-Lecture Mode (Phase 1)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **E-Lecture Mode** (Chế độ Bài giảng Điện tử) chuyển đổi **VisualizationDSA** từ một công cụ vẽ thuật toán thô sơ thành một nền tảng giáo dục thông minh. Phân hệ tích hợp các Slide giáo trình có kịch bản định sẵn với hệ thống Canvas hoạt ảnh trực quan nhằm dẫn dắt người học từ cơ bản đến nâng cao mà không bị choáng ngợp.

---

## 2. Mục tiêu Sư phạm (Pedagogical Goals)
*   **Ứng dụng Lý thuyết Tải lượng Nhận thức (Cognitive Load Theory):** Sinh viên thường bị ngợp nếu được đưa vào một giao diện tự do có quá nhiều luồng thông tin chuyển động cùng lúc. E-Lecture chia nhỏ bài giảng thành các slide ngắn để giảm tải lượng nhận thức.
*   **Dẫn dắt có kịch bản (Scripted Guidance):** Khóa tạm thời tương tác tự do, dẫn dắt học viên theo lộ trình: Đọc hiểu lý thuyết -> Chạy hoạt họa minh họa nhỏ -> Dừng đúng điểm nút sư phạm -> Bắt đầu tự do vọc hoặc làm bài kiểm tra nhỏ.
*   **Tích hợp Onboarding:** Cung cấp bài giảng mặc định hướng dẫn cách tương tác với hệ thống trực quan hóa cho sinh viên mới truy cập lần đầu.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 1 MVP Scope)

### 3.1. Chế độ Bài giảng dẫn dắt (Guided E-Lectures)
*   Tải bài giảng cấu trúc động qua JSON tương ứng với từng thuật toán.
*   Hỗ trợ 3 loại Slide: Slide lý thuyết (Theory Slide), Slide hoạt họa tự chạy dừng (Guided Animation Slide), Slide điểm dừng tương tác (Interactive Check Slide).
*   **Khóa đồng bộ (State Lock):** Khóa thanh trượt kéo thả và các tùy chỉnh tham số khi bài giảng đang mở để bảo toàn ngữ cảnh học.

### 3.2. Điều khiển slide trực quan
*   Nút chuyển slide [ Next > ] và lùi slide [ < Back ] ở góc dưới thẻ bài giảng.
*   Dãy chấm tròn (Pagination Dots) biểu thị vị trí trang hiện tại và tiến trình bài học.
*   Nút đóng bài giảng [ Exit E-Lecture ] để chuyển về chế độ tự vọc tự do (Exploration Mode).

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên bắt đầu học Bubble Sort, tôi muốn có một loạt slide ngắn giải thích thuật toán trượt qua các cặp phần tử và hoán vị trước khi tôi tự tay thiết lập các mảng số phức tạp.
*   Là một giảng viên, tôi muốn cấu trúc sẵn bài giảng Quick Sort dừng chính xác tại khung hình Pivot đã đứng vững vị trí đầu tiên để tôi có thể đặt câu hỏi kiểm tra bài cho cả lớp.
*   Là một học viên lần đầu sử dụng web, tôi muốn hệ thống tự động bật một bài hướng dẫn ngắn (Tutorial E-Lecture) chỉ rõ nút Play nằm đâu, nút Custom Input nằm đâu để tôi biết cách dùng.
