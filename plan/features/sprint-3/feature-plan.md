# 🗺️ Sprint 3 Feature Plan - Pseudocode Synchronization & Code Tracking

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 3: Pseudocode Synchronization & Code Tracking**. Phân hệ chịu trách nhiệm liên kết mã giả (pseudocode) hoặc mã nguồn thực tế với hoạt ảnh trực quan hóa trên Canvas, đảm bảo bôi sáng chính xác dòng lệnh đang chạy.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng lớp đồng bộ mã giả và điều hướng gỡ lỗi trực tiếp:
*   **Tô sáng Dòng đang chạy (Active Line Highlighting):** Khi giải thuật di chuyển qua các bước (hoán vị, so sánh, gán), dòng lệnh tương ứng trong khung Pseudocode hoặc Monaco Editor được bôi sáng vàng rực Neon Amber ngay lập tức dưới **10ms**.
*   **Đồng bộ Hai chiều (Bi-directional Sync):** 
    *   *Chiều xuôi:* Playback VCR chạy bước K -> Tô sáng dòng lệnh L của bước K.
    *   *Chiều ngược:* Nhấp chọn dòng lệnh L trên Monaco -> VCR tự động nhảy (seek) về bước giải thuật đầu tiên thực thi dòng lệnh L đó.
*   **Bảng Điều hướng Dòng lệnh (Monaco Line Click Decorators):** Thêm phím tắt nhấp click ở lề Monaco (gutter) để kích hoạt gỡ lỗi nhanh.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế Component `PseudocodePanel.vue` kính mờ hiển thị các dòng mã giả.
2.  [ ] Lập trình sự kiện kết nối `MonacoLineSyncerCoordinator` đồng bộ `revealLineInCenter`.
3.  [ ] Xây dựng bản đồ ánh xạ bước giải thuật sang dòng code `StepToLineMapping` trong AST compiler.
4.  [ ] Lập trình cơ chế chặn click lề trái dòng (gutter click pointer interceptors) để đặt breakpoints mô phỏng.
5.  [ ] Viết Unit tests kiểm thử đồng bộ hai chiều bước giải thuật và dòng code.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Bôi sáng dòng lệnh phản hồi nhạy bén dưới **10ms** khi chuyển bước VCR.
*   Nhấp chọn dòng lệnh Monaco nhảy chính xác VCR về bước giải thuật tương ứng.
*   Giải phóng và hủy bỏ toàn bộ custom listeners sự kiện Monaco khi unmount để tránh rò rỉ RAM.
*   Unit tests bao phủ 100% logic ánh xạ chỉ số bước giải thuật sang số dòng code.
