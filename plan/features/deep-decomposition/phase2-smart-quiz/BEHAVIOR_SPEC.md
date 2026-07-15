# 🎭 Behavioral Specification & Quiz Interception Rules (Phase 2)

Tài liệu này đặc tả chi tiết quy định dừng timeline VCRPlay, hạn định số lượt click tương tác tối đa và cơ chế ngăn chặn gian lận nộp điểm khống trong phân hệ **Smart Interactive Quiz Widget**.

---

## 1. Ràng buộc Tạm dừng Dòng thời gian (Timeline Lock Policies)

Để đảm bảo tính bắt buộc học tập tư duy bám ngữ cảnh của trắc nghiệm:
*   **Cưỡng chế Khóa VCR Scrubber (Strict Interception Lock):**
    *   Khi giải thuật chạy đến bước mốc `triggerStepIndex` được cấu hình, hệ thống lập tức cưỡng chế dừng tự động (Auto-Pause) và chuyển trạng thái timeline sang **LOCKED**.
    *   Trong suốt thời gian câu đố hiển thị, nút Play/Pause, tua nhanh/chậm và thanh trượt dòng thời gian VCR Slider đều chuyển sang trạng thái **Disabled** (vô hiệu hóa mờ xám). Sinh viên không được phép tua qua bài cho đến khi đã gửi câu trả lời.
    *   Sau khi học sinh nhấp nút [ SUBMIT ] và nhận được phản hồi kết quả giải thích sâu sắc, hệ thống sẽ mở khóa điều khiển VCR để học viên tiếp tục quan sát tiến trình giải thuật.

---

## 2. Hạn định Số lượt chọn và Đánh chặn Spam (Spam click prevention)

*   **Hạn mức Lượt click chọn (Selection Ceiling Clamping):**
    *   Để tránh trường hợp sinh viên bấm click tràn lan bừa bãi toàn bộ các cột mảng trên Canvas SVG để bao phủ đáp án đúng, hệ thống áp dụng kỹ thuật giới hạn số lượt click:
        $$\text{MaxSelections} = \text{correctAnswers.length}$$
    *   Nếu câu hỏi yêu cầu tìm 2 cột hoán đổi, học sinh chỉ được click tối đa **2 cột**. Lần click cột thứ 3 sẽ bị bỏ qua hoặc tự động bỏ chọn cột đầu tiên (FIFO Toggle).
*   **Chống Spam nộp bài liên tục (Debounce Submit):**
    *   Nút bấm [ SUBMIT ] được gài cơ chế Debounce **2 giây** để ngăn chặn hành vi click liên tục gửi nhiều yêu cầu chấm điểm đồng thời.

---

## 3. Chính sách Cộng điểm XP Gamification (Gamification Integration Rules)

*   **Tính Điểm thưởng lần đầu duy nhất (First-Try Bonus Policy):**
    *   Hệ thống chỉ gửi API cộng điểm thưởng XP lên máy chủ khi học sinh chọn đáp án đúng ngay trong **lần nộp bài đầu tiên** của lượt giải thuật này.
    *   Các lần nộp bài sửa sai sau đó vẫn nhận được giải thích sâu sắc, nhưng chỉ số XP thưởng sẽ bị giảm trừ còn 0 XP để ngăn chặn hành vi farm điểm double-clicking.
