# 📅 Implementation Plan - System Design Visualizer (Phase 2)

Kế hoạch phát triển phân hệ Trực quan hóa Thiết kế Hệ thống được phân chia làm 2 Sprint chính nhằm tối ưu hóa mưa hạt Neon SVG và độ tin cậy của bộ chuyển hướng Failover máy chủ.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Giao diện Nodes & Luồng Hạt Neon (Ngày 1-3)|
| - Dựng kéo thả các Node Glassmorphic Slate 900.             |
| - Viết nét vẽ SVG Paths uốn lượn liên kết co giãn.          |
| - Thiết kế hạt Neon tròn di chuyển trượt trên Paths.        |
| - Viết Canvas khói xám bốc tỏa tròn sập nguồn FAILED node.  |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Lập trình Engine Định tuyến & DB Replication (Ngày 4-6)|
| - Lập trình logic Round-Robin SystemDesignEngine TS.        |
| - Cài đặt cơ chế sập nguồn Failover định tuyến lại 5ms.     |
| - Dựng hàng đợi DB Replication Lag tự trễ sync.             |
| - Viết cơ chế dọn dẹp hạt về đích tháo dỡ RAM GC triệt để.  |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Giao diện Nodes & Luồng Hạt Neon (Ngày 1-3)
*   **Mục tiêu:** Xây dựng kéo thả nodes mờ kính, SVG paths kết nối co giãn, trượt hạt Neon, Canvas hạt khói FAILED.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế component kéo thả `SystemArchitectureCanvas.vue` mờ kính lơ lửng.
    2.  [ ] Viết mã liên kết đường dẫn co giãn SVG bám bắt 2 đầu Nodes khi di chuyển.
    3.  [ ] Lập trình trượt hạt Neon tròn chạy dọc đường đi uốn lượn SVG.
    4.  [ ] Dựng bộ Canvas 2D phát khói xám đen `FailureSmokeEmitterEngine.ts` bay tỏa tròn.

### Sprint B: Lập trình Engine Định tuyến & DB Replication (Ngày 4-6)
*   **Mục tiêu:** Hiện thực hóa logic định tuyến `SystemDesignEngine` TS, failover chuyển hướng 5ms, replication lag, dọn RAM.
*   **Danh sách công việc:**
    1.  [ ] Lập trình logic định tuyến xoay vòng `SystemDesignEngine` bằng TypeScript.
    2.  [ ] Cài đặt listener sự kiện click tắt nguồn sập server Web, LB chuyển hướng dòng hạt Neon sang server an toàn dưới 5ms.
    3.  [ ] Xây dựng mô phỏng Database Replication Lag đồng bộ hạt vàng từ Primary sang Replica có thanh kéo cấu hình trễ mạng.
    4.  [ ] Viết quy trình dọn dẹp hạt đã về đích hoặc bị drop khỏi RAM GC để tránh tràn bộ nhớ máy khách.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Load Balancer định tuyến Round-Robin chia đôi dòng hạt Neon mượt mà 60 FPS khi xả mưa hạt.
2.  Nhấp tắt Server A sập nguồn lập tức bốc khói Canvas 2D, Load Balancer đổi hướng 100% hạt sang Server B dưới 5ms.
3.  Mô phỏng Database Replication Lag đồng bộ dữ liệu từ Primary sang Replica có thanh kéo trễ 100ms - 5000ms hoạt động chuẩn xác.
4.  Tự động dọn dẹp các hạt dữ liệu đã về đích hoặc bị drop khỏi RAM GC hoàn hảo.
5.  Giải phóng 100% vòng lặp `requestAnimationFrame` và listeners khi đóng workspace.
6.  Đầy đủ unit tests bao phủ 100% logic định tuyến Round-Robin và DB replication sync queues.
