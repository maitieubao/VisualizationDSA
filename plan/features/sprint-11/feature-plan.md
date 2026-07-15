# 🗺️ Sprint 11 Feature Plan - System Design Network Simulator & Failover Smoke

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 11: System Design Network Simulator & Failover Smoke**. Phân hệ chịu trách nhiệm trực quan hóa các kiến trúc phân tán thực tế (Mô hình Server Client, Tải cân bằng Load Balancer, Đồng bộ dữ liệu DB Replication) và mô phỏng sự cố mạng bốc khói sập nguồn máy chủ.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng lớp mô phỏng định tuyến mạng phân tán và động cơ khói sập nguồn Canvas 2D:
*   **Mô Phỏng Phân Phối Tải Tròn (Round-Robin Load Balancer):** Minh họa định tuyến tải HTTP request. Mưa hạt Neon Green HTTP bay dồn dập đến Load Balancer và được phân phối tròn đều (Round-Robin) tới các Web Servers.
*   **Đồng Bộ Database Trễ Động (DB Replication Lag Queue):** Minh họa trễ đồng bộ (100ms - 5000ms slider) giữa DB Primary và Replica bằng hàng đợi sự kiện hoãn thời gian thực.
*   **Khói Bốc Hạt Khi Sập Máy Chủ (Failover Smoke Canvas Emitter):** Khi click sập nguồn Server dưới **5ms**, một máy phun luồng hạt bụi khói xám tự phát sáng phun cuồn cuộn 60 FPS, tự thu hồi GC tháo dỡ RAM khi hạt tan biến biến mất.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế các Server Topology Node kéo thả tương tác `SystemTopology.vue`.
2.  [ ] Lập trình động cơ mô phỏng định tuyến `SystemDesignEngine.ts`.
3.  [ ] Xây dựng máy phun hạt bụi khói sập nguồn Canvas 2D `FailureSmokeEmitterEngine.ts`.
4.  [ ] Thiết kế thanh trượt kéo co chỉnh trễ đồng bộ Database Replication Lag.
5.  [ ] Viết Unit tests kiểm thử Load Balancer Round-robin và Replication delay queues.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Bộ mô phỏng định tuyến hạt HTTP Neon bay mượt mà 60 FPS Canvas.
*   Khi sập nguồn server, khói xám bốc nghi ngút 60 FPS tức thì dưới **5ms**.
*   Giải phóng sạch sẽ 100% hạt khói khỏi RAM máy khách khi tan biến tránh rò rỉ GC.
*   Unit tests bao phủ 100% logic phân phối Load Balancer và trễ đồng bộ DB.
