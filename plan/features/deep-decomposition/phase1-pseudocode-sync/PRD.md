# 🚀 Product Requirements Document (PRD) - Pseudocode Sync & Watch Panel (Phase 1)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Pseudocode Sync & Watch Panel** (Đồng bộ Mã giả & Theo dõi Biến) thiết lập cầu nối liên kết trực quan giữa các chuyển động của Canvas đồ họa với các dòng mã lệnh thực thi chương trình tương ứng. Phân hệ giúp người học liên hệ trực tiếp hoạt ảnh với mã nguồn thực tế và theo dõi chi tiết biến số động để thấu hiểu bản chất giải thuật ở tầng mã nguồn.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Highlight mã giả song song hoạt ảnh:** Khi giải thuật chạy qua bước nào, dòng lệnh tương ứng bên Code Panel phải tự động phát sáng mượt mà.
*   **Hỗ trợ đa ngôn ngữ (Multilingual Choice):** Cho phép người học tùy chọn ngôn ngữ lập trình ưa thích: C++, Java, Python hoặc JavaScript mà không làm lệch bước đồng bộ.
*   **Hộp theo dõi biến chạy (Variable Watch Panel):** Hiển thị các chỉ số biến lặp, biến tạm thời đang chạy thực tế ở từng khung hình cụ thể.
*   **Tương tác hai chiều (Bidirectional Click-to-Snap):** Nhấp chuột trực tiếp vào một dòng mã bất kỳ trên bảng để điều khiển Canvas tự động tua nhanh tới khung hình thực thi dòng lệnh đó.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 1 MVP Scope)

### 3.1. Code Panel đa ngôn ngữ
*   Tích hợp thanh chuyển đổi tab ngôn ngữ lập trình (C++, Java, Python, JavaScript).
*   Giao diện hiển thị danh sách dòng mã được căn lề, thụt lề chuẩn cú pháp và có số dòng vật lý ở đầu.

### 3.2. Đồng bộ dòng active thời gian thực
*   Lắng nghe frame hoạt ảnh và tự động kích hoạt highlight dòng sáng xanh Neon Emerald tương ứng qua mã định danh logic `logicalId`.
*   Hiệu ứng chuyển dòng mượt mà bằng CSS transitions.

### 3.3. Watch Panel (Bảng theo dõi biến số)
*   Bảng hiển thị cấu trúc Key-Value các biến của bước hiện hành (ví dụ: `i = 2`, `j = 0`, `temp = 14`).
*   Tự động cập nhật số liệu tĩnh khi người học tua thời gian hoặc bấm lùi/tiến bước giải thuật.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một học sinh đang học thuật toán sắp xếp chèn (Insertion Sort), tôi muốn nhìn thấy dòng mã dịch chuyển phần tử phát sáng màu xanh lá cây đồng thời với cột Canvas đang thụt xuống trượt sang trái.
*   Là một sinh viên chuẩn bị thi thực hành C++, tôi muốn chọn tab hiển thị C++ để quan sát các biến chạy `i`, `j` tăng giảm khớp với vòng lặp `for` lồng nhau.
*   Là một người học muốn xem nhanh khi nào thì mảng bắt đầu hoán vị, tôi muốn nhấp chuột vào dòng code `swap` để Canvas tự động trượt nhanh đến đúng bước hoán vị đầu tiên.
