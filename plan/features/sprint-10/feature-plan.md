# 🗺️ Sprint 10 Feature Plan - State Inspector Stack-Heap & Custom DSL Compiler

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 10: State Inspector Stack-Heap & Custom DSL Compiler**. Phân hệ chịu trách nhiệm xây dựng ngăn xếp Call Stack 3D kính mờ, vùng cấp phát Heap động kết nối mũi tên uốn Bezier SVG, và bộ biên dịch tập lệnh DSL tùy biến siêu nhanh.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng lớp giám sát bộ nhớ RAM Stack-Heap và trình biên dịch lệnh DSL:
*   **Ngăn Xếp Call Stack 3D (3D Call Stack Cards):** Vẽ các thẻ ngăn xếp hàm lồng nhau dạng thẻ kính mờ Glassmorphism uốn lượn 3D tuyệt đẹp, hiển thị rõ ràng danh sách tham số hàm đang chạy.
*   **Đường Mũi Tên Bezier Stack-to-Heap Pointer (Bezier Pointer curves SVG):** Tự động bắt bounding box tọa độ tuyệt đối để uốn lượn con trỏ pointer nét đứt Neon hổ phách Amber chỉ sang nút Heap co giãn linh hoạt bám sát resize dưới **5ms**.
*   **Trình Biên Dịch Lệnh DSL Tùy Biến (Custom DSA DSL Engine):** Cho phép biên dịch các lệnh đơn giản (ví dụ: `ALLOC NodeA 12`, `PUSH StackB`, `LINK NodeA->NodeB`) thành hoạt ảnh hoạt động trực quan.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế Component hiển thị Call Stack 3D kính mờ `CallStackInspector.vue`.
2.  [ ] Lập trình giải thuật tính toán mũi tên uốn cong SVG Pointer `PointerArrowBatchRenderer.ts`.
3.  [ ] Lập trình bộ phân dịch lệnh tùy biến DSL `DSLEngine.ts` Client-side.
4.  [ ] Xây dựng bộ điều khiển co giãn tọa độ bám sát kéo co resize cửa sổ màn hình.
5.  [ ] Viết Unit tests kiểm thử DSL compiler step và tính toán tọa độ uốn cong Bezier.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Bộ DSL compiler biên dịch tập lệnh sinh khung hình hoạt ảnh tốc độ dưới **2ms**.
*   Tọa độ mũi tên pointer uốn cong bám sát chính xác khi co giãn resize màn hình dưới **5ms**.
*   Giải phóng và hủy bỏ toàn bộ resize event listeners khi unmount tránh rò rỉ RAM.
*   Unit tests bao phủ 100% logic biên dịch DSL và tính toán tọa độ pointer Bezier.
