# 🚀 Product Requirements Document (PRD) - Smart Interactive Quiz (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Smart Interactive Quiz** (Trắc nghiệm Tương tác Thông minh) biến đổi trải nghiệm học DSA thụ động thành một cuộc phiêu lưu gỡ lỗi chủ động. Thay vì các câu hỏi trắc nghiệm tĩnh dạng form đơn thuần, phân hệ này gài các câu đố trực tiếp vào dòng chảy thực thi của giải thuật, yêu cầu sinh viên tương tác trực tiếp lên Canvas đồ họa SVG hoặc Monaco Code Editor để trả lời câu hỏi bám ngữ cảnh.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Tương tác chủ động tối đa (Interactive Engagement):** Loại bỏ thói quen xem hoạt ảnh giải thuật thụ động, kích thích tư duy phân tích từng bước bằng câu hỏi dự đoán.
*   **Đồng bộ ngữ cảnh mượt mà (In-Context Integration):** Tự động chặn dừng dòng chảy hoạt ảnh giải thuật tại các bước mốc quan trọng, hiện overlay trắc nghiệm không làm đứt đoạn trải nghiệm.
*   **Tô vẽ phản hồi cảm xúc cực độ (Emotional Feedback):** Sử dụng các hoạt ảnh phản hồi Emerald Checkmark (Đúng) hoặc Crimson Wiggle (Sai) cùng pháo Confetti tưng bừng để khích lệ tinh thần người học.
*   **Kết nối Gamification:** Hoàn thành câu hỏi đúng lần đầu tiên trực tiếp gia tăng điểm XP, nuôi ngọn lửa Streak rực rỡ và ghi danh Leaderboard.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Đánh chặn VCR Playback (Contextual Auto-Pause)
*   Tự động phát hiện bước mốc `triggerStepIndex` để khóa tạm thời bộ điều khiển VCR timeline.
*   Trượt nhẹ Overlay trắc nghiệm kính mờ Glassmorphic từ cạnh biên.

### 3.2. Trắc nghiệm Click Đồ họa SVG Node
*   Câu hỏi yêu cầu sinh viên click chọn trực tiếp các array bar (cột mảng) hoặc node cây trong Canvas SVG để đưa ra đáp án hoán đổi hay xoay pivot tiếp theo.
*   Các phần tử hover sáng bừng màu xanh Cyan báo hiệu khả năng tương tác.

### 3.3. Trắc nghiệm Chọn dòng Code Monaco Editor
*   Câu hỏi dự đoán dòng code thực thi kế tiếp.
*   Chuyển Monaco Editor sang chế độ clickable lines, học viên click trực tiếp vào dòng code gutter để chọn đáp án.

### 3.4. Bảng Giải thích Sâu sắc Kính mờ (Vibrant HSL Explanations)
*   Đưa ra lý giải khoa học chi tiết dạng Markdown sắc mịn sau khi submit đáp án.
*   Tặng điểm thưởng XP tức thời cho tài khoản sinh viên.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một học viên đang học Heap Sort, tôi muốn giải thuật tự động dừng ở bước số 8, hiện ra bảng hỏi: *"Hai cột mảng nào sẽ hoán đổi giá trị tiếp theo?"*. Tôi nhấp trực tiếp vào cột mảng số 2 và số 5 trên SVG, bấm Submit và thấy pháoConfetti nổ tỏa tưng bừng vì trả lời đúng, kèm theo lời giải thích cặn kẽ tại sao hai phần tử này hoán đổi theo quy luật Heapify, giúp tôi khắc sâu bài học.
*   Là một sinh viên đang phân tích giải thuật đệ quy QuickSort phân tách pivot, tôi muốn câu hỏi trắc nghiệm dừng lại hỏi dòng code nào trong Monaco Editor sẽ thực thi tiếp theo. Tôi nhấp chọn dòng 9 trong Monaco, thấy dòng đó phát sáng xanh rực rỡ báo hiệu đáp án chính xác, giúp tôi liên kết mã nguồn với tư duy máy tính nhạy bén.
*   Là một cú đêm thích thi đua, tôi muốn khi trả lời đúng câu hỏi tương tác khó của cây đỏ đen, tài khoản của tôi được cộng ngay 50 XP, duy trì ngọn lửa Streak bập bùng và đẩy thứ hạng của tôi thăng cấp trên Weekly Leaderboard.
