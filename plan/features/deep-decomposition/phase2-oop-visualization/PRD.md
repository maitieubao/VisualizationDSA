# 🚀 Product Requirements Document (PRD) - OOP Concepts Visualizer (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **OOP Concepts Visualizer** mang đến trải nghiệm học lập trình hướng đối tượng (OOP) trực quan vật lý đột phá. Hệ thống hóa các khái niệm trừu tượng như Kế thừa, Đa hình, Đóng gói, Trừu tượng thành các thực thể đồ họa tương tác, giúp sinh viên CNTT thấu hiểu sâu sắc cách máy tính quản lý bộ nhớ Heap/Stack và định tuyến đa hình động.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Học thuyết trực quan hóa (Pedagogy):** Làm sáng tỏ cơ chế hoạt động bên trong của VTable Lookup đa hình động và đóng gói thuộc tính, phá vỡ lối học thuộc lòng sáo rỗng.
*   **Tương tác vật lý hấp dẫn (Engagement):** Thiết kế thẻ lớp UML kính mờ sang trọng, các ổ khóa phát sáng Neon đại diện cho access modifiers và hoạt ảnh bắn tia laser phân giải đa hình lôi cuốn.
*   **Học thử nghiệm linh hoạt (Experimentation):** Cung cấp không gian Polymorphism Sandbox để sinh viên tự thay đổi cấu trúc kế thừa và chạy thử cuộc gọi phương thức ghi đè.
*   **Trải nghiệm hoàn hảo không gián đoạn:** Mọi thao tác biên dịch giả lập, cấp phát Heap ảo diễn ra tức thời dưới 10ms ở Client-side.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Sơ đồ Lớp UML Kính mờ & Padlock Access Modifiers
*   Giao diện thẻ Class UML Glassmorphism rõ ràng.
*   Ổ khóa chỉ định modifier: `private` (đỏ rực đóng chặt), `protected` (vàng hé mở), `public` (lục mở toang).
*   Hiệu ứng rung chấn động rung giật viền đỏ cảnh báo khi click vi phạm đóng gói.

### 3.2. Không gian Đa hình Polymorphism Sandbox & VTable Lookup
*   Bộ máy giả lập VTable chứa danh sách con trỏ hàm.
*   Tia Laser phát sáng bắn định tuyến từ con trỏ gọi hàm đến ô nhớ override tương ứng của lớp con.

### 3.3. Bộ quản lý bộ nhớ Heap ảo (Heap Memory Allocator UI)
*   Hiển thị danh sách các Object Instance được cấp phát trên Heap kèm địa chỉ nhớ hexa giả lập (Ví dụ: `0x7FFF12`).
*   Bảng Stack frame quản lý con trỏ tham chiếu lướt êm ái.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên đang nhầm lẫn khái niệm kế thừa và đa hình, tôi muốn khởi tạo đối tượng `Circle` thừa kế lớp `Shape` trên Heap ảo, nhìn thấy bảng tra VTable tự động kế thừa phương thức `area()` của cha và ghi đè phương thức `draw()` của con lộng lẫy.
*   Là một học viên thực hành Polymorphism Sandbox, tôi muốn bấm nút chạy cuộc gọi `shape.draw()`, nhìn thấy một tia laser Neon bắn cuộn từ Monaco Editor chỉ vào địa chỉ nhớ VTable rồi bẻ hướng phản chiếu bắn thẳng vào ô phương thức `Circle.draw()`, giúp tôi hiểu rõ cơ chế Dynamic Dispatch của máy tính.
*   Là một người học chưa phân biệt rõ access modifiers, tôi muốn nhìn thấy ổ khóa đỏ chói Neon hiển thị cạnh thuộc tính `private price`. Khi tôi cố tình kéo thẻ đối tượng ngoài nhấp truy cập, thuộc tính này lập tức rung lắc viền đỏ kêu bíp cảnh báo lỗi đóng gói, chứng minh bức tường bảo mật trực quan.
