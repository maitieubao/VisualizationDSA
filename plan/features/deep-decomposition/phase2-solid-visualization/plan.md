# 📅 Implementation Plan - SOLID Principles Visualizer (Phase 2)

Kế hoạch phát triển phân hệ Trực quan hóa SOLID được phân chia làm 2 Sprint chính nhằm tối ưu hóa giao diện Tỏa nhiệt bùng lửa Canvas 2D và độ tin cậy của bộ chấm điểm Cohesion LCOM4.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Thẻ SRP Tỏa nhiệt & Vết nứt LSP (Ngày 1-3)|
| - Dựng thẻ Class UML Glassmorphic nhiệt hóa sắc độ HSL.     |
| - Viết bộ phát hạt tia lửa Canvas 2D Thermal Particle.      |
| - Lập trình vết nứt rạn rách rưới laser SVG Fracture.       |
| - Thiết kế luồng sáng rẽ lối nguyên lý OCP và DIP.         |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Lập trình Engine Phân tích & Tái cấu trúc (Ngày 4-6)|
| - Lập trình logic đếm BFS/DFS đồ thị LCOMCalculator.        |
| - Lập trình bộ kiểm khớp Substitution LSP ném exception.    |
| - Xây dựng DIP Abstraction Layer đổi hướng luồng sáng.     |
| - Tích hợp confetti pháo hoa khi tái cấu trúc mát lạnh.    |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Thẻ SRP Tỏa nhiệt & Vết nứt LSP (Ngày 1-3)
*   **Mục tiêu:** Xây dựng thẻ class tỏa nhiệt SRP, bộ phát hạt lửa Canvas, vết nứt SVG Fracture rạn vỡ laser, luồng sáng rẽ lối OCP/DIP.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế Component thẻ lớp `ThermalClassCard.vue` mờ ảo đổi sắc độ HSL đỏ chói.
    2.  [ ] Lập trình bộ máy Canvas 2D phát hạt lửa `ThermalSparkParticleEngine.ts` bay hướng lên 60 FPS.
    3.  [ ] Thiết lập hiệu ứng răng cưa rạn nứt rách rưới `LaserFractureOverlay.vue` uốn khúc ziczac.
    4.  [ ] Dựng luồng sáng phát quang chạy dọc các nét vẽ `NeonFlowingPath.vue`.

### Sprint B: Lập trình Engine Phân tích & Tái cấu trúc (Ngày 4-6)
*   **Mục tiêu:** Hiện thực hóa logic `LCOMCalculator` đếm thành phần liên thông LCOM4, substitution LSP, DIP interface, dọn dẹp RAM.
*   **Danh sách công việc:**
    1.  [ ] Lập trình logic hạt nhân `LCOMCalculator` bằng TypeScript duyệt DFS đồ thị dùng chung thuộc tính.
    2.  [ ] Thiết lập bộ máy so khớp con trỏ con LSP, bắt lỗi `NotImplementedException` gây gãy nổ laser.
    3.  [ ] Xây dựng mô phỏng DIP cho phép chèn Interface trừu tượng đảo chiều mũi tên luồng sáng màu lục Neon.
    4.  [ ] Viết quy trình tháo dỡ giải phóng 100% tài nguyên Canvas hạt lửa tránh rò rỉ RAM (GC cleanup).

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  LCOMCalculator tính toán chính xác 100% chỉ số LCOM4 đếm đúng các thành phần liên thông.
2.  Thẻ lớp vi phạm SRP bùng cháy hạt lửa Canvas 2D mượt mà 60 FPS viền đỏ rực rỡ.
3.  Nhấp Split phân tách class thành công làm dịu mát viền, dọn sạch hạt lửa và RAM GC.
4.  Vi phạm LSP bắt buộc kích hoạt nứt rạn ziczac laser SVG và tiếng vỡ thủy tinh vụn rơi.
5.  DIP chèn Interface trừu tượng đảo chiều luồng sáng lục Neon mượt mà 60 FPS.
6.  Giải phóng hoàn toàn các luồng hoạt ảnh hạt Canvas và listener khi unmount workspace.
