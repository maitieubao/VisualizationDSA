# 🎭 Behavioral Specification & Multi-View Rules (Phase 2)

Tài liệu này đặc tả chi tiết quy định đồng bộ dòng dữ liệu đơn hướng, hạn mức co giãn tối đa/tối thiểu của thanh chia ô resizable splitter và các nguyên tắc bảo vệ tính toàn vẹn trạng thái timeline của phân hệ **Multi-View Synchronization**.

---

## 1. Nguyên lý Dòng Dữ liệu Đơn hướng Tuyệt đối (Unidirectional Flow Policy)

Để tránh hiện tượng vòng lặp cập nhật vô tận (Infinite Loop Bug) và lỗi đứt gãy trạng thái đồng bộ:
*   **VCR Scrubber làm Chủ Tể (Single Source of Truth):**
    *   Thanh trượt dòng thời gian VCR Scrubber (hoặc vòng lặp tự động phát Playback) là nguồn dữ liệu thay đổi duy nhất được phép phát thông điệp `STEP_CHANGED`.
    *   Các Panel (Monaco Editor, Flowchart, SVG Visualizer) chỉ được đăng ký lắng nghe (Subscribe) thụ động từ Event Bus để cập nhật lại giao diện tương ứng với bước nhận được.
    *   Nghiêm cấm các Panel tự ý sửa đổi chỉ số bước hoặc tự truyền tin chéo cập nhật trực tiếp lẫn nhau khi chưa có lệnh điều động từ VCR Scrubber.

---

## 2. Hạn định Kích thước Co giãn Bố cục (Pane Resizing Bounds)

Để tránh trường hợp sinh viên kéo thanh Drag Splitter quá đà làm các Panel biến mất hoàn toàn khỏi giao diện hoặc tràn vỡ bố cục:
*   **Ngưỡng Khóa Biên An toàn (Clamping Constraints):**
    *   Độ rộng tối thiểu của một Panel bất kỳ không được nhỏ hơn **15%** độ rộng Container tổng.
    *   Độ rộng tối đa của một Panel bất kỳ không được vượt quá **85%** độ rộng Container tổng.
    *   Khi sinh viên kéo chuột chạm mốc giới hạn (Ví dụ: 14%), hệ thống lập tức cưỡng chế khóa chặt ở mốc 15% và dừng tính toán lại để tránh lỗi hiển thị CSS.

---

## 3. Chính sách Bảo vệ Dòng thời gian (Timeline Integrity Rules)

*   **Chống lỗi Vượt Biên chỉ mục (Step Index Boundaries Safeguard):**
    *   Chỉ mục bước `stepIndex` gửi đi bắt buộc phải nằm trong đoạn $[0, \text{TotalSteps} - 1]$.
    *   Mọi yêu cầu tua đến bước vượt biên sẽ bị bộ quản lý `SynchronizedTimelineManager` bỏ qua và báo lỗi cảnh báo nhẹ ở console nhà phát triển.
*   **Hạn mức tốc độ tua tự động:**
    *   Tốc độ tự động phát hỗ trợ tối đa là **4.0x** (phát cực nhanh) và tối thiểu là **0.25x** (phát siêu chậm để quan sát kỹ).
