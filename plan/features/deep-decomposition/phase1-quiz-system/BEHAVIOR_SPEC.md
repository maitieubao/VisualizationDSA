# 🎭 Behavioral Specification & Playback Lock Rules (Quiz System)

Tài liệu này đặc tả chi tiết các quy tắc khóa cứng bảng điều khiển hoạt ảnh khi mở câu hỏi, cơ chế kiểm duyệt câu trả lời nhấp Canvas và chính sách khôi phục phát tự động trên **Interactive Quiz System**.

---

## 1. Cơ chế Khóa cứng Bảng điều khiển (Playback Lock Dynamics)

Để ngăn chặn người học kéo tua thanh trượt Slider lướt qua câu hỏi trắc nghiệm đột xuất mà không chịu suy nghĩ trả lời:
*   **Hành vi khóa:**
    *   Tự động khóa cứng thẻ `<canvas>` bằng CSS `pointer-events: none` đối với các sự kiện vẽ đồ thị thông thường.
    *   Vô hiệu hóa (`disabled`) toàn bộ thanh trượt Youtube-style Range Slider, không cho phép kéo tua thủ công.
    *   Ẩn hoặc làm mờ cụm phím điều tốc VCR Controls (Play, Pause, Step Forward, Step Backward).
    *   Khóa phím tắt bàn phím (`Spacebar` tạm dừng, `Arrow Left/Right` tua bước) để chặn lách luật điều khiển.
*   **Hành vi mở khóa:**
    *   Sau khi người học hoàn tất nộp đáp án (Đúng hoặc Sai) và nhấp chọn nút *"Tiếp tục bài giảng"*, toàn bộ thuộc tính khóa bị tháo dỡ, giao diện vẽ và điều khiển khôi phục 100% quyền tương tác tự do.

---

## 2. Kiểm duyệt Câu hỏi Nhấp Canvas (CANVAS_TARGET Click Validation)

Đối với câu hỏi yêu cầu tương tác click đỉnh Canvas làm đáp án:
*   **Hành vi chống nhấp lặp (Double-click protection):**
    *   Khi người học vừa click chọn đỉnh A, hệ thống khóa ngay lập tức khả năng click Canvas kế tiếp để tránh tình trạng nhấp loạn xạ thử vận may.
    *   Đỉnh vừa nhấp được highlight đổi màu tức khắc (Xanh Emerald nếu đúng, Đỏ Rose nếu sai).
*   **Hành vi click trượt (Blank space clicks):**
    *   Nếu học sinh click vào khoảng trống trên Canvas (không trúng bất kỳ đỉnh nào): Hệ thống hiện thông báo nhắc nhở: *"Nhấp chưa trúng đỉnh nào trên bản vẽ. Hãy nhìn kỹ và click lại vào hình tròn node."*. Lượt nhấp trượt này không bị tính là lượt trả lời sai, người học vẫn giữ quyền click nộp lại.

---

## 3. Chính sách Kiểm tra Checkpoint Lặp (Checkpoint Repetition Policy)

Để tránh tình trạng người học tua ngược Slider lùi thời gian vượt qua mốc trắc nghiệm cũ rồi kéo tiến lên lại làm kích hoạt câu hỏi trắc nghiệm đè lên Canvas liên tục gây ức chế (Infinity loop of pops):
*   **Hành vi xử lý:**
    *   Hệ thống lưu giữ danh sách các chỉ số mốc checkpoint đã trả lời thành công trong mảng `completedCheckpointIndexes` thuộc Pinia store.
    *   Khi dòng thời gian hoạt ảnh dịch chuyển qua mốc khung hình `frameIndex` cũ, hệ thống đối chiếu chéo với mảng completed. Nếu mốc này đã nằm trong danh sách hoàn thành, hệ thống lướt qua mượt mà và tuyệt đối không bật lại hộp thoại trắc nghiệm đè lên Canvas nữa.
    *   Danh sách completed này chỉ được xóa sạch hoàn toàn khi người học chủ động nhấn nút *"Làm mới bài học"* hoặc chuyển sang chương học mới.
