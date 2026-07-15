# 📅 Implementation Plan - side-by-side Algorithm Comparator (Phase 2)

Kế hoạch phát triển phân hệ So sánh Đối chiếu Giải thuật (Algorithm Comparator) được phân bổ làm 2 Sprint chính để cam kết tính cân đối thẩm mỹ của Split Layout và sự mượt mà tuyệt đối của bộ điều phối phát RequestAnimationFrame.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Split Layout & Dashboard (Ngày 1-3)      |
| - Thiết kế bố cục chia đôi Split Screen cân đối 50/50.     |
| - Nhúng hai Canvas độc lập vào hai bảng bên trái và phải.   |
| - Xây dựng các thanh đo tiến trình so sánh hiệu năng động.  |
| - Dựng panel chọn lựa chọn thuật toán đối sánh lôi cuốn.    |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Bộ điều phối Đồng bộ & Tối ưu GPU rAF (Ngày 4-6)   |
| - Viết lớp hạt nhân UnifiedPlaybackCoordinator đồng bộ %.  |
| - Đồng bộ thanh Range Slider kéo tua chung và cụm phím VCR. |
| - Cài đặt lập lịch vẽ RequestAnimationFrame hợp nhất GPU.    |
| - Thiết lập nút tiêm chung mảng số ngẫu nhiên ban đầu.      |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Split Layout & Dashboard (Ngày 1-3)
*   **Mục tiêu:** Xây dựng giao diện Split Screen bóng bẩy, kết nối hai Canvas hoạt ảnh song hành và hoàn thành bảng theo dõi các chỉ số Big-O thời gian thực.
*   **Danh sách công việc:**
    1.  [ ] Xây dựng khung chứa Split Screen CSS Grid tỉ lệ 50/50, bảo đảm tự động co giãn responsive theo chiều ngang màn hình.
    2.  [ ] Nhúng hai thực thể Canvas độc lập vào hai bên trái/phải, thiết lập viền sương mờ Glassmorphism Slate cho mỗi bên.
    3.  [ ] Thiết kế Component `ComparativeDashboard.vue` hiển thị tiến độ % của hai thuật toán bằng thanh đo tiến trình màu Cyan và Emerald phát sáng.
    4.  [ ] Xây dựng bộ điều khiển lựa chọn đầu vào để chọn nhanh cặp thuật toán cần so sánh (ví dụ: Bubble vs Quick, Dijkstra vs A*).

### Sprint B: Bộ điều phối Đồng bộ & Tối ưu GPU rAF (Ngày 4-6)
*   **Mục tiêu:** Lập trình động cơ đồng bộ hóa kéo tua tiến trình %, căn chỉnh tốc độ Aligned Speeds và lập lịch render RequestAnimationFrame chung chống lag.
*   **Danh sách công việc:**
    1.  [ ] Hiện thực hóa lớp TypeScript `UnifiedPlaybackCoordinator` kết nối hai Pinia store con và đồng bộ mốc frame nhảy theo %.
    2.  [ ] Đồng bộ cụm phím điều khiển chung (Play, Pause, Step) và Range Slider dòng thời gian hoạt động mượt mà.
    3.  [ ] Cài đặt dịch vụ `UnifiedRenderScheduler` gom các callback render của 2 Canvas vào chung một vòng lặp rAF tối ưu GPU.
    4.  [ ] Xây dựng chức năng tiêm dữ liệu ngẫu nhiên ban đầu đồng nhất, bảo đảm cả hai bên chạy trên cùng một mảng số thô.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Màn hình phân đôi Split Screen hiển thị cân đối tuyệt đối trên cả Desktop và Tablet.
2.  Tiêm chung mảng số ngẫu nhiên ban đầu giống hệt nhau cho cả hai bên khi bấm nút "Tạo dữ liệu".
3.  Cụm phím Play/Pause chung điều khiển cả hai Canvas chuyển động đồng hành song song trơn tru 60 FPS, không có hiện tượng giật hình.
4.  Thanh Range Slider chung cho phép kéo lướt tua nhanh đồng bộ tiến độ phần trăm % của cả hai bên mượt mà.
5.  Các chỉ số thống kê hiệu năng so sánh và hoán vị cập nhật liên tục khớp chuẩn xác với hoạt ảnh Canvas.
