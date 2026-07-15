# 🚀 Product Requirements Document (PRD) - Design Patterns & SOLID (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Structural Relationship Visualizer** (Trực quan hóa Design Patterns & SOLID) của **VisualizationDSA** mang lại một môi trường học tập kiến trúc phần mềm trực quan sinh động, biến các sơ đồ lớp UML tĩnh khô khan thành các khối hộp Class kéo thả uốn lượn, hỗ trợ kiểm thử thực nghiệm thay đổi Strategy runtime, lan tỏa Observer tín hiệu và chứng minh nguyên lý Đảo ngược phụ thuộc (DIP) hữu hình.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Trực quan hóa Kiến trúc cấp cao:** Chuyển đổi các mối liên kết trừu tượng (Kế thừa, Hiện thực hóa Interface, Phụ thuộc) thành các đường cong SVG uốn lượn uốn cong có hiệu ứng phát sáng Neon độc đáo.
*   **Học tương tác GoF Patterns:** 
    *   *Strategy Pattern:* Cho phép người học chuyển đổi chiến thuật sắp xếp động, chứng kiến liên kết snap mềm mại đổi hướng.
    *   *Observer Pattern:* Kích hoạt gửi tín hiệu từ Subject lan tỏa Neon chớp nháy đồng loạt sang các lớp Subscriber.
*   **Hữu hình hóa nguyên lý SOLID:** Hỗ trợ nút bật tắt "DIP Mode" chứng minh trực quan sự decoupled (lỏng lẻo) của hệ thống khi đưa Interface làm tầng trung gian tách rời khớp nối cứng.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Canvas vẽ Sơ đồ Lớp SVG tương tác
*   Vẽ các Node thẻ lớp dạng kính mờ Glassmorphism.
*   Cho phép kéo thả (Drag-and-drop) Node tự do bằng chuột trên màn hình, các sợi chỉ liên kết Bezier tự động co giãn bám đuổi tọa độ trơn tru.

### 3.2. Chế độ Hoạt ảnh Runtime GoF Patterns
*   **Strategy Simulator:** Panel nút bấm chuyển đổi giữa BubbleSort/QuickSort. Đường liên kết Neon Amber đổi hướng mềm mại.
*   **Observer Hub:** Nút bấm phát tín hiệu, vẽ tia sáng Neon chạy dọc các sợi liên kết tới các Observers đăng ký.

### 3.3. Hộp Cát SOLID - DIP Toggle Sandbox
*   Nút gạt Bật/Tắt DIP.
*   *Khi TẮT:* Vẽ liên kết trực tiếp dày cộm màu đỏ thẫm biểu thị Khớp nối cứng (Highly Coupled).
*   *Khi BẬT:* Đẩy Interface vào giữa, chuyển liên kết thành các sợi chỉ xanh mỏng nhẹ linh hoạt (Decoupled).

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên đang bối rối trước định nghĩa "Đảo ngược phụ thuộc DIP", tôi muốn bật tắt nút gạt DIP Mode để trực tiếp nhìn thấy sự lỏng lẻo linh hoạt của hệ thống khi có Interface làm trung gian tách rời liên kết thô cứng.
*   Là một người học, tôi muốn di chuyển kéo thả các hộp lớp trên sơ đồ và thấy các đường cong liên kết SVG uốn lượn tự động bám đuổi tọa độ mà không bị gãy góc hay vỡ hạt pixel, giúp tôi dễ dàng bố cục sơ đồ lớp gọn gàng theo ý muốn.
*   Là một học viên, tôi muốn nhấp chọn Strategy Pattern và bấm đổi Sort Algorithm để chứng kiến đường liên kết snap nhấp nháy Neon chuyển dịch mượt mà sang lớp sắp xếp mới, khắc sâu cơ chế thay thế thuật toán linh hoạt vào tâm trí tôi.
