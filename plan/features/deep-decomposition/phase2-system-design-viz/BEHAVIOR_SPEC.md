# 🎭 Behavioral Specification & Load Balancing Constraints (Phase 2)

Tài liệu này đặc tả chi tiết giới hạn dung lượng tải của Web Server, phạm vi trễ trễ mạng Database sync replication lag và cơ chế dọn dẹp hạt trong phân hệ **System Design & Distributed Architecture Visualizer**.

---

## 1. Ngưỡng Quá Tải của Máy Chủ Web (Web Server Capacity Overload)

Để mô phỏng chân thực hiện tượng nghẽn mạng (bottleneck) trong đời sống hệ thống lớn:
*   **Ngưỡng Kích hoạt Trạng thái Quá tải (Overload Capacity Threshold):**
    *   Mỗi Web Server được thiết lập giới hạn chịu tải tối đa là **50 requests/giây**.
    *   Nếu tần suất xả hạt Neon đổ bộ vào Server vượt quá ngưỡng 50 hạt/giây, trạng thái Node lập tức chuyển từ `HEALTHY` sang `OVERLOADED`.
    *   *Hiệu ứng hình ảnh:* Viền máy chủ bừng sáng đỏ cam nhấp nháy phát nhiệt nóng bỏng, và tốc độ trôi trượt của hạt Neon qua Server bị giảm đi 3 lần (Lag).
    *   *Cơ chế tự phục hồi:* Khi lưu lượng hạt giảm xuống dưới 30 hạt/giây, Server tự phục hồi về `HEALTHY` sau 3 giây êm dịu.

---

## 2. Cấu hình Trễ mạng DB Sync Replication Lag

*   **Phạm vi Điều chỉnh Độ trễ (Sync Delay Ranges):**
    *   Độ trễ đồng bộ từ Primary DB sang Replica DB được quy định điều chỉnh linh hoạt trong khoảng từ **100ms** (mạng nội bộ tốc độ cao) đến **5000ms** (mạng đa vùng khoảng cách địa lý xa xôi).
    *   Sử dụng thanh kéo trực quan (slider) ở màn hình thực hành để điều chỉnh.
    *   *Hành vi bám sát:* Hạt dữ liệu vàng Neon bắt buộc phải lưu trú nằm đợi trong hàng đợi `Replication Queue` đúng khoảng thời gian cấu hình trước khi được phóng đi bay sang Replica DB.

---

## 3. Cơ chế tự động dọn dẹp hạt (Auto Packet Garbage Collection)

*   **Chính sách dọn dẹp rác (Garbage Collection Policy):**
    *   Tất cả hạt Neon dữ liệu trôi nổi khi tiến sát và chạm mút kết thúc `progress >= 1.0` (Về đích thành công) hoặc bị drop rơi tự do do sập server bắt buộc phải được giải phóng bộ nhớ RAM Client lập tức dưới **5ms**.
    *   Không cho phép lưu trữ vết hạt cũ nhàn rỗi dưới RAM tránh giật lag trình duyệt máy khách.
