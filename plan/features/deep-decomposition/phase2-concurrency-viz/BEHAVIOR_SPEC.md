# 🎭 Behavioral Specification & Thread Lock Policies (Phase 2)

Tài liệu này đặc tả chi tiết các quy tắc dịch chuyển của luồng dọc theo đường ray, chính sách va chạm xếp hàng tranh chấp khóa Mutex Lock và hành vi đông cứng hoạt ảnh khi phát hiện nghẽn Deadlock trong phân hệ **Concurrency & Threading Visualizer**.

---

## 1. Hành vi Dịch chuyển Luồng & Tranh chấp khóa (Thread Collision Policy)

Mỗi luồng ảo chuyển động dọc theo đường ray Slate mờ (Thread Rail) với tốc độ được quy định theo các kịch bản:
*   **Dịch chuyển tự do:** 
    *   Luồng ở trạng thái `RUNNING` tăng tiến trình từ $0 \to 100\%$ liên tục trên Canvas.
*   **Tranh chấp khóa găng (Lock Acquisition Collision):**
    *   Khi luồng chạm mốc vùng găng (ví dụ mốc $50\%$) và gửi lệnh `acquireLock()`.
    *   Nếu ổ khóa đang bị một luồng khác chiếm đóng, quả cầu luồng lập tức **dừng di chuyển ngay tại mốc $50\%$**, đổi màu từ Cyan sang Amber Vàng hổ phách biểu thị trạng thái `BLOCKED` chờ khóa.
    *   Hệ thống đẩy ID của luồng này vào hàng đợi chờ xếp hàng của khóa (`waitingQueue`).
*   **Giải phóng và Đánh thức (Lock Release Signaling):**
    *   Ngay khi luồng đang giữ khóa gọi `releaseLock()` ở mốc $100\%$ đường ray.
    *   Hạ tầng tự động đánh thức luồng đầu tiên đang đứng chờ xếp hàng ở mốc $50\%$. Quả cầu luồng đó đổi màu từ Amber sang Cyan và tiếp tục trượt trơn tru qua cổng vùng găng.

---

## 2. Hành vi Đông cứng Hoạt ảnh khi nghẽn Deadlock (Deadlock Freeze Policy)

Khi giải thuật DFS đồ thị WFG phát hiện chu trình nghẽn khóa vòng tròn khép kín:
*   **Đông cứng cưỡng bức:** 
    *   Toàn bộ luồng giả lập lập tức dừng chuyển động bất động.
    *   Nút bấm Play chung bị vô hiệu hóa (`disabled`) và chuyển sang trạng thái Pause để bảo toàn trạng thái lỗi.
*   **Phát tín hiệu Neon Rose:**
    *   Đường viền của đường ray luồng (Thread Rails Container) nhấp nháy phát sáng Neon Đỏ Rose rực rỡ cảnh báo tắc nghẽn.
    *   Bảng điều khiển phụ và compiler console hiển thị thông báo khẩn cấp hướng dẫn sinh viên tìm nguyên nhân nghẽn chéo giữa Luồng A và Luồng B.

---

## 3. Quy chuẩn Thích ứng Khung hình co giãn (Resize Observer Policy)

*   Khi người dùng co giãn cửa sổ hoặc xem bài học đa luồng trên màn hình ngang iPad:
    *   Hệ thống sử dụng bộ lắng nghe `ResizeObserver` để tự động kéo dãn khoảng cách tọa độ pixel của các đường ray nằm ngang Slate mờ tương ứng.
    *   Đảm bảo các điểm mốc chốt khóa và cổng vùng găng $50\%$ luôn được vẽ sắc nét, cân đối chính xác tuyệt đối trên màn hình.
