# 🗺️ Sprint 6 Feature Plan - OOP Concepts Visualizer & VTable Sandboxing

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 6: OOP Concepts Visualizer & VTable Sandboxing**. Phân hệ chịu trách nhiệm xây dựng sân chơi trực quan hóa các khái niệm lập trình hướng đối tượng nâng cao (Đóng gói, Kế thừa, Đa hình), biểu diễn cấu trúc bảng phương thức ảo VTable và cấp phát ô nhớ Heap lớp đối tượng.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng sandbox mô phỏng phản xạ Class OOP và bảng định tuyến đa hình VTable:
*   **Mô Phỏng Phản Xạ Đối Tượng (OOPReflectionEngine):** Mô phỏng cách biên dịch Class kế thừa, lưu trữ thuộc tính Đóng gói (Private/Public/Protected), phát hiện và báo lỗi truy cập trái phép bằng ổ khóa viền laser đỏ phát sáng.
*   **Bảng Phương Thức Ảo Đa Hình (VTable Dispatch Map):** Minh họa trực quan nguyên lý Đa hình (Polymorphism) bằng bảng định tuyến phương thức ảo VTable. Khi đối tượng gọi hàm, hạt Neon bay đến VTable để tìm địa chỉ hàm thực tế của lớp con.
*   **Cấp Phát Ô Nhớ Heap Đối Tượng (Heap Allocation Cards):** Vẽ thẻ kính mờ Glassmorphism mô tả cấu trúc vật lý vùng nhớ Heap của Instance đối tượng khi khai báo từ khóa `new`.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế giao diện thẻ lớp đối tượng `OOPClassCard.vue` kính mờ sang trọng.
2.  [ ] Lập trình động cơ mô phỏng phản xạ OOP `OOPReflectionEngine.ts`.
3.  [ ] Xây dựng bộ bảng định tuyến đa hình `VirtualMethodTable` VTable.
4.  [ ] Thiết kế các chỉ báo khóa phát sáng Neon đỏ khi vi phạm giới hạn truy cập Private.
5.  [ ] Viết Unit tests kiểm thử phản xạ kế thừa và định tuyến đa hình VTable.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Sandbox phản xạ OOP hoạt động Client-side mượt mà 60 FPS, phản hồi định tuyến đa hình dưới **5ms**.
*   Các ổ khóa thuộc tính Private được hiển thị bọc viền Neon chói lọi khi có lệnh truy cập.
*   Giải phóng và hủy bỏ toàn bộ render loops rAF và listeners khi unmount tránh rò rỉ RAM.
*   Unit tests bao phủ 100% logic kế thừa và định tuyến đa hình phương thức.
