# 🎭 Behavioral Specification & Cohesion Math Bounds (Phase 2)

Tài liệu này đặc tả chi tiết các ngưỡng số học tính toán độ gắn kết Cohesion, thời gian trễ laser nứt vỡ LSP và giới hạn phần tử Canvas hạt lửa bùng cháy trong phân hệ **SOLID Principles Visualizer**.

---

## 1. Ràng buộc Chỉ số Cohesion SRP (SRP Cohesion Metrics Limits)

Để đảm bảo thuật toán LCOM4 đo lường chính xác hành vi bành trướng của một Class vi phạm SRP:
*   **Ngưỡng Quá nhiệt Nhiệt lượng (Overheating Threshold):**
    *   Hệ thống quy định nếu chỉ số LCOM4 (Lack of Cohesion in Methods) của một Class Node $\ge 2$, lớp đó chính thức rơi vào trạng thái vi phạm SRP nghiêm trọng (God Object).
    *   *Hành vi tự động kích hoạt:* Kích hoạt ngay lập tức viền phát sáng đỏ rực `.is-overheated` và khởi động Canvas 2D phát tia lửa nhiệt lượng dữ dội 60 FPS.
    *   *Giải pháp khắc phục:* Chỉ khi học viên nhấp nút [ SPLIT ], lớp được phân tách hoàn toàn thành các Class Node con có chỉ số LCOM4 = 1, hệ thống sẽ hạ nhiệt ngay tức khắc, đổi viền xanh lá Emerald và dọn sạch hạt lửa Canvas RAM.

---

## 2. Ràng buộc con trỏ LSP & Trễ nứt vỡ Laser (LSP Shatter Delay)

Để tạo hiệu ứng kịch tính vật lý dễ hiểu cho nguyên lý Liskov Substitution:
*   **Chẩn đoán Kế thừa Vi phạm (Substitution Violation Check):**
    *   Khi sinh viên kéo thả thay thế lớp con `Ostrich` ném lỗi `NotImplementedException` vào con trỏ gọi hàm `fly()` của lớp cha `Bird`.
    *   *Hiệu ứng trễ kích hoạt:* Hệ thống cho phép tia laser kết nối SVG bừng sáng rực rỡ trong **800ms** giả lập dòng thực thi đang cố gắng truyền lệnh.
    *   *Hiệu ứng nứt vỡ nổ tung:* Ngay sau 800ms, tia laser chính thức đứt đôi, kích hoạt vết nứt ziczac màu đỏ rực `.lsp-laser-fracture-line` nhấp nháy, phát ra âm thanh thủy tinh vỡ vụn giòn giã và hiện biểu ngữ lỗi tư duy thiết kế.

---

## 3. Ràng buộc DIP Đảo chiều Mũi tên (DIP Neon Flowing Paths)

Để minh họa nguyên lý Dependency Inversion:
*   **Đảo hướng Luồng sáng (Flowing direction switch):**
    *   Khi vi phạm DIP (Class cao cấp phụ thuộc trực tiếp Class cấp thấp), luồng sáng đỏ chói `.dip-flowing-path.is-violating` chạy một chiều từ trên xuống dưới đâm thẳng.
    *   Khi đúng DIP (Chèn Interface ở giữa, lớp cao cấp và lớp cấp thấp đều hướng về Interface), luồng sáng lập tức đảo ngược chiều, hội tụ đồng loạt hướng về Interface màu lục Neon dịu mát.

---

## 4. Giới hạn Hạt Canvas Chống Nghẽn CPU (Particle Density Caps)

*   Để bảo vệ hiệu năng máy tính học sinh tránh giật lag:
    *   Mật độ hạt lửa tối đa trên mỗi Canvas 2D card SRP được giới hạn cứng ở mức **80 hạt**.
    *   Vòng lặp `requestAnimationFrame` bắt buộc phải được hủy bỏ hoàn toàn (`cancelAnimationFrame`) ngay khi học sinh rời khỏi chương học để thu hồi RAM GC.
