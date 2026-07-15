# 🌊 UX Flow & System Design Simulator Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) khi sinh viên kéo thả thiết kế mạng phân tán, bấm sập nguồn máy chủ và điều chỉnh replication lag DB trên **System Design & Distributed Architecture Visualizer**.

---

## 📌 KỊCH BẢN 1: CÂN BẰNG TẢI TRÒN VÀ MÔ PHỎNG SẬP NGUỒN (ROUND-ROBIN & FAILOVER)

### Tình huống: Học sinh gỡ lỗi sập nguồn Web Server, Load Balancer tự phục hồi dòng hạt

```
[Học sinh kéo thả sơ đồ mạng: 1 Client, 1 Load Balancer, 2 Web Server A và B]
[Học sinh bấm nút [ XẢ LŨ HẠT NEON ] phát lưu lượng HTTP Requests:]
        |
[Các hạt Neon Green (Lục Emerald) phát sáng trôi nổi dồn dập bắn ra:]
  - Chạy dọc từ Client đến Load Balancer.
  - Load Balancer thực thi định tuyến xoay vòng Round-Robin:
    + 5 hạt bay uốn lượn rẽ trái sang Web Server A.
    + 5 hạt bay uốn lượn rẽ phải sang Web Server B.
  - Sinh viên reo lên vì thấy dòng hạt chia đôi hoàn hảo cân bằng!
        |
[Sinh viên bấm nút [ SẬP NGUỒN ] ngay trên Web Server A:]
  - Thẻ Web Server A lập tức đổi màu đỏ rực chói, bọc viền đỏ phát sáng sụp tối.
  - Canvas 2D phía sau phun hạt khói xám cuồn cuộn bay nhẹ tỏa tròn sống động.
        |
[Load Balancer phát hiện sự cố Web Server A sập nguồn lập tức dưới 5ms:]
  - Tái định tuyến chuyển hướng 100% dòng hạt Neon đang bay dồn dập rẽ hết sang Server B.
  - Không còn một hạt Neon nào bay lệch sang hướng Server A bị sập nữa.
  - Minh họa trực quan tuyệt mỹ cho giải pháp thiết kế an toàn chống chịu lỗi (Failover).
```

---

## 📌 KỊCH BẢN 2: THỬ NGHIỆM ĐỒNG BỘ TRỄ DB (REPLICATION LAG TIME TRIAL)

### Tình huống: Học sinh kiểm thử lệch dữ liệu DB Primary sang Replica

```
[Mô hình hệ thống chứa: Web Server, Database Primary, Database Replica]
[Học sinh điều chỉnh thanh kéo cấu hình trễ đồng bộ (Sync Delay) lên mức: 2000ms]
        |
[Web Server bắn lệnh ghi dữ liệu xuống Database Primary:]
  - Một hạt Neon vàng rực rỡ (DB Write packet) bay lướt từ Server rơi xuống Primary DB.
  - Primary DB bừng sáng Neon vàng tỏa nhiệt báo hiệu: "Đã ghi nhận dữ liệu mới!"
        |
[Hạt dữ liệu đồng bộ nằm đợi trong hàng đợi Sync Queue đúng 2000ms:]
  - Trong lúc chờ, Database Replica vẫn tối đèn, chưa có dữ liệu mới (Tính lệch pha dữ liệu).
        |
[Đồng hồ đếm ngược hết trễ 2 giây -> Hạt Neon vàng bắn bay dọc nét nối sang Replica DB:]
  - Replica DB bừng sáng rực rỡ vàng Neon.
  - Học viên thấu hiểu sâu sắc: "À! Đây chính là replication lag gây lệch dữ liệu trong thực tế!"
```
 Trải nghiệm kéo thả thiết kế mạng phân tán, xả lũ mưa hạt Neon rực rỡ và chứng kiến cảnh tượng sập nguồn bốc khói Canvas 2D failover mang lại sự thấu hiểu kiến trúc hệ thống trực quan đỉnh cao, sành điệu nhất.
