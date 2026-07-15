# 📅 Implementation Plan - OOP Concepts Visualizer (Phase 2)

Kế hoạch phát triển phân hệ Trực quan hóa OOP được phân chia làm 2 Sprint chính nhằm tối ưu hóa giao diện Sơ đồ Lớp UML kính mờ sang trọng và độ tin cậy của bộ phản chiếu Meta-Object Reflection Engine.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Thẻ Lớp UML & Ổ khóa Neon (Ngày 1-3)      |
| - Dựng thẻ class UML Glassmorphism kính mờ tối tân.         |
| - Tích hợp ổ khóa Neon access modifiers (đỏ, vàng, lục).    |
| - Thiết kế hoạt ảnh wiggle rung lắc khi vi phạm đóng gói.  |
| - Vẽ tia laser SVG uốn lượn bắn VTable phân giải đa hình.   |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Lập trình Reflection & Heap ảo (Ngày 4-6)         |
| - Lập trình logic OOPReflectionEngine xây dựng VTable.      |
| - Thiết lập Heap Memory Allocator quản lý địa chỉ nhớ Hexa.  |
| - Tích hợp Polymorphism Sandbox cho học viên tự kế thừa.    |
| - Tối ưu hóa render SVG Laser rAF mượt mà 60 FPS.            |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Thẻ Lớp UML & Ổ khóa Neon (Ngày 1-3)
*   **Mục tiêu:** Xây dựng thẻ lớp UML mờ ảo, các ổ khóa phát sáng Neon quyền truy cập, hoạt ảnh rung vi phạm đóng gói và tia laser phân giải đa hình SVG.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế Component thẻ lớp `UMLClassCard.vue` mờ ảo Glassmorphism cực kỳ sành điệu.
    2.  [ ] Tích hợp bộ icon ổ khóa Neon `AccessModifierPadlock.vue` phát quang 3 màu (đỏ, vàng, lục).
    3.  [ ] Thiết lập hiệu ứng CSS Wiggle Rung lắc viền đỏ chói khi người dùng truy cập thuộc tính `private` lỗi đóng gói.
    4.  [ ] Lập trình tia laser phát sáng SVG `DynamicDispatchLaser.vue` chạy cuộn nét đứt chỉ hướng.

### Sprint B: Lập trình Reflection & Heap ảo (Ngày 4-6)
*   **Mục tiêu:** Hiện thực hóa logic `OOPReflectionEngine` giải quyết chuỗi kế thừa, cấp phát Heap ảo địa chỉ Hexa ngẫu nhiên, polymorphism sandbox.
*   **Danh sách công việc:**
    1.  [ ] Lập trình logic hạt nhân `OOPReflectionEngine` bằng TypeScript duyệt chuỗi kế thừa kế dựng VTable.
    2.  [ ] Thiết lập trình cấp phát ô nhớ `HeapObjectAllocator.vue` hiển thị địa chỉ nhớ giả lập hexa.
    3.  [ ] Xây dựng môi trường chơi cát `PolymorphismSandbox.vue` cho phép học viên tự cấu hình Shape/Circle.
    4.  [ ] Tối ưu hóa rAF Laser Renderer cập nhật tọa độ bắn laser mượt mà 60 FPS khi co giãn cửa sổ.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Bảng tra ảo VTable giải quyết chính xác 100% các phương thức ghi đè (Circle override Shape).
2.  Tia Laser SVG bắn chính xác từ con trỏ gọi hàm, duyệt VTable rồi định tuyến sang phương thức lớp con.
3.  Ổ khóa Neon hiển thị đúng 3 trạng thái chỉ định truy cập (`private`, `protected`, `public`).
4.  Vi phạm đóng gói thuộc tính `private` bắt buộc kích hoạt hiệu ứng CSS Wiggle rung chấn động và âm cảnh báo.
5.  Danh sách Heap Object hiển thị trực quan địa chỉ Hexa tăng tiến offset (Ví dụ: `0x7FFF00`, `0x7FFF10`).
6.  Hoạt ảnh laser và rung chấn hoạt động mượt mà đạt chuẩn 60 FPS trên trình duyệt máy khách.
