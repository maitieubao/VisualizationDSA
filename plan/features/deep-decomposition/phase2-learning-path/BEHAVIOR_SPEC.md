# 🎭 Behavioral Specification & Learning Path Rules (Phase 2)

Tài liệu này đặc tả chi tiết quy định mở khóa các node ải học tập tiên quyết, chính sách chấm điểm ôn tập AI gợi ý và chu kỳ đồng bộ dữ liệu ngoại tuyến trong phân hệ **Learning Path Skill Tree**.

---

## 1. Ràng buộc Mở khóa Node Kỹ năng (Prerequisite Locking Policy)

Để đảm bảo sinh viên tiếp thu kiến thức một cách khoa học, bền vững theo đúng lộ trình đào tạo trực quan:
*   **Ràng buộc Mở khóa Tuyệt đối (Strict Unlocking Constraints):**
    *   Một Node $N$ chỉ được chuyển trạng thái từ `LOCKED` sang `UNLOCKED` khi và chỉ khi toàn bộ các Node $P$ nằm trong danh sách `prerequisites(N)` đều có trạng thái là `COMPLETED`.
    *   Học viên không thể click bắt đầu học một ải môn bị khóa Slate u tối. Mọi nỗ lực can thiệp từ ngoài sẽ bị Client-side DAG Engine từ chối, hiện cảnh báo vàng Neon: `"ẢI MÔN BỊ KHÓA: Vui lòng hoàn thành xuất sắc các ải tiên quyết trước khi mở cánh cửa này!"`
*   **Ngưỡng Điểm số Đạt ải (Quiz Passing Threshold):**
    *   Một Node được xem là `COMPLETED` khi học viên vượt qua bài trắc nghiệm thuật toán tích hợp đạt điểm số tối thiểu là **70%**.
    *   Nếu điểm số dưới 70%, ải môn chỉ giữ trạng thái `IN_PROGRESS` (Đang học), không kích hoạt mở khóa ải tiếp theo.

---

## 2. Ràng buộc Đề xuất Cá nhân hóa AI (AI Personalized Recommendation Rules)

*   **Chính sách Ôn tập Ưu tiên (Review-First Recommendation):**
    *   Hệ thống AI Evaluator luôn ưu tiên quét qua lịch sử làm bài gần nhất của sinh viên.
    *   Nếu có bất kỳ ải môn nào điểm số đạt mức yếu kém ($< 70\%$), AI lập tức chuyển trạng thái đề xuất ôn tập lại ải đó, tạm hoãn gợi ý tiến trình thăng cấp ải mới.
    *   Đường viền của Node đề xuất sẽ phát hào quang vàng hổ phách ấm áp kèm thông điệp gợi ý chi tiết.

---

## 3. Chu kỳ Đồng bộ Offline và An toàn Tiến trình (Sync Frequency Policy)

*   **Đồng bộ Tức thì LocalStorage:**
    *   Ngay khi có sự thay đổi trạng thái hoàn thành node, Client lập tức ghi đè dữ liệu tiến trình vào `localStorage` máy khách với độ trễ $\text{Delay} = 0\text{ms}$.
*   **Đồng bộ Trì hoãn lên Máy chủ (Debounced Background Server Sync):**
    *   Giao dịch đồng bộ lên cơ sở dữ liệu Supabase được trì hoãn 2 giây (Debounce 2000ms) để gom cụm các sự thay đổi, tránh spam request nộp điểm liên tục gây quá tải cho máy chủ API.
