# 🗺️ Sprint 7 Feature Plan - SOLID Principles Dynamic Visualizer & LCOM4 Linter

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 7: SOLID Principles Dynamic Visualizer & LCOM4 Linter**. Phân hệ chịu trách nhiệm trực quan hóa 5 nguyên lý thiết kế phần mềm cốt lõi (SRP, OCP, LSP, ISP, DIP) và tính toán chỉ số độ kết dính lớp LCOM4 để kiểm duyệt nguyên lý SRP.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng lớp phân tích tĩnh nguyên lý SOLID và trực quan hình ảnh kết dính:
*   **Chỉ Số Kết Dính Lớp LCOM4 (SRP Cohesion Graph Linter):** Sử dụng thuật toán duyệt đồ thị BFS/DFS tìm số thành phần liên thông rời rạc của các phương thức lớp truy xuất trường dữ liệu. LCOM4 >= 2 chỉ ra lớp vi phạm SRP, kích hoạt hiệu ứng nhiệt điện Canvas bốc lửa cam đỏ nóng quá tải.
*   **Đường Nối Nứt Rạn LSP (LSP Cracked Glass Connectives):** Minh họa nguyên lý Thay thế Liskov bằng hoạt ảnh thay thế lớp con cho lớp cha. Thay thế sai (ví dụ: Chim đà điểu cho Chim bay) kích hoạt Canvas phun kính vỡ nứt rạn rực rỡ.
*   **Đảo Ngược Phụ Thuộc DIP (DIP Dependency Inversion):** Minh họa cách cấu trúc Interface đảo ngược chiều mũi tên liên kết Neon từ dưới lên trên.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế Component `SOLIDInspectorPanel.vue` kính mờ hiển thị 5 nguyên lý.
2.  [ ] Lập trình thuật toán LCOM4 BFS/DFS đồ thị liên thông `SOLIDLCOM4Calculator.ts`.
3.  [ ] Xây dựng bộ tạo hiệu ứng Canvas kính vỡ nứt rạn `LSPCrackedGlassEmitter.ts`.
4.  [ ] Thiết kế các chỉ báo Neon phát sáng đảo chiều mũi tên DIP.
5.  [ ] Viết Unit tests kiểm thử LCOM4 Cohesion và LSP substitution.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Phân tích tính toán chỉ số kết dính LCOM4 ở Client-side cực nhanh dưới **5ms**.
*   Hoạt ảnh nứt vỡ kính khi vi phạm LSP chạy mượt mà 60 FPS Canvas 2D.
*   Giải phóng toàn bộ render loops rAF và listeners khi unmount tránh rò rỉ RAM.
*   Unit tests bao phủ 100% logic thuật toán LCOM4 BFS/DFS đồ thị liên thông.
