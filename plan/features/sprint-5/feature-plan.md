# 🗺️ Sprint 5 Feature Plan - Interactive Playground & Custom Input

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 5: Interactive Playground & Custom Input**. Phân hệ chịu trách nhiệm xây dựng sân chơi tương tác tự do (Playground) giúp học sinh click vẽ đồ thị/cây nhị phân và hộp nạp dữ liệu mảng tùy biến (Custom Input) gỡ lỗi thuật toán của riêng mình.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng lớp nạp dữ liệu mảng tùy chỉnh và tương tác tự tay vẽ đồ thị Canvas:
*   **Hộp Nạp Dữ Liệu Tùy Biến (Custom Input Parser):** Cho phép học viên nhập chuỗi mảng tùy chỉnh (ví dụ: `[12, 5, 8, 20]`), ma trận kề đồ thị hoặc tham số cây nhị phân, tự động biên dịch phân tích lỗi cú pháp dưới **5ms**.
*   **Sân Chơi Vẽ Tự Do Đồ Họa (Interactive Canvas Playground):** Học viên nhấp đúp chuột lên màn hình để tự tạo các nút đồ thị, nhấp kéo chuột nối liên kết Bezier Neon giữa 2 nút, tự định cấu hình đồ thị thực hành giải thuật Dijkstra tùy chọn.
*   **Xác Thực Tính Đúng Đắn Dữ Liệu (Dynamic Validation):** Kiểm tra tính hợp lệ của mảng nhập vào (tránh nhập chữ, mảng quá dài hay rỗng) trước khi nạp vào VCR engine.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế Hộp thoại Kính mờ `CustomInputPanel.vue` nhập chuỗi mảng và ma trận.
2.  [ ] Lập trình trình phân tích chuỗi ma trận kề `CustomInputParser.ts`.
3.  [ ] Xây dựng bộ điều khiển nhấp chuột Canvas `InteractivePlaygroundEngine.ts` tạo nút/cạnh nối.
4.  [ ] Thiết kế các chỉ báo Neon phát sáng Amber báo hiệu node đồ thị đang được chọn.
5.  [ ] Viết Unit tests kiểm thử phân tích cú pháp chuỗi kề và tạo nút tương tác.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Phân tích chính xác chuỗi mảng tùy biến, chặn 100% trường hợp ký tự lạ hoặc mảng rỗng.
*   Nhấp đúp chuột Canvas tạo mới Vertex đồ thị phản hồi mượt mà 60 FPS.
*   Nhấp kéo nối cạnh đồ thị hiển thị đường Bezier SVG lướt bám sát vị trí con trỏ chuột.
*   Unit tests bao phủ 100% logic phân tích chuỗi ma trận kề đồ thị.
