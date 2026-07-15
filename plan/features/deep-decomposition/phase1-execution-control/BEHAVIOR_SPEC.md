# 🎭 Behavioral Specification & Interaction Rules (Execution Control)

Tài liệu này đặc tả chi tiết các quy tắc phản hồi giao diện, kịch bản tương tác an toàn và các ràng buộc biên của bảng điều khiển **Execution Control**.

---

## 1. Khóa giao diện khi kích hoạt Bài giảng điện tử (E-Lecture Mode Override)

*   **Ràng buộc:** Khi chế độ bài giảng điện tử (E-Lecture Mode) đang hoạt động, việc tự do tua thời gian hoặc thay đổi tốc độ bị cấm hoàn toàn để tránh đứt gãy kịch bản sư phạm.
*   **Hành vi giao diện:** 
    *   Toàn bộ bảng điều khiển `<ControlPanel>` tự động chuyển sang màu xám mờ (đặt thuộc tính CSS `opacity: 0.5`).
    *   Thuộc tính `pointer-events: none` được kích hoạt trên thanh trượt Slider và các nút bấm VCR để vô hiệu hóa tất cả các sự kiện nhấn/kéo của người dùng.
    *   Hủy bỏ toàn bộ sự kiện phím tắt bàn phím toàn cục.
    *   Thanh điều khiển chỉ được mở khóa tương tác tự do trở lại sau khi người dùng click chủ động nút **[ Exit E-Lecture ]**.

---

## 2. Quy tắc tự động Tạm dừng khi Tua thời gian (Scrubbing Auto-Pause)

*   **Ràng buộc:** Khi người dùng đang phát tự động hoạt ảnh (đang chạy Slide hoặc bấm Play) mà đột ngột nhấn giữ trỏ chuột vào thanh Slider tiến trình để kéo tua.
*   **Hành vi xử lý:**
    *   Ngay khi phát hiện sự kiện `@mousedown` trên thanh range input, hệ thống kích hoạt hàm `pause()` dừng ngay động cơ phát hoạt họa.
    *   Quá trình kéo tua Slider chỉ cập nhật các khung hình tĩnh 30 FPS. Điều này ngăn chặn việc Canvas vừa chạy hiệu ứng trượt cột vừa bị ép thay đổi khung hình tĩnh dẫn đến lỗi đồng bộ đồ họa.

---

## 3. Ràng buộc Biên nút bấm Lùi/Tiến bước (Step Boundary Limits)

*   **Nút Step Backward [|◀] (Lùi 1 bước):**
    *   Bị vô hiệu hóa (`disabled` ở HTML) nếu chỉ số khung hình hiện tại `currentFrameIndex === 0`.
    *   Nhấn nút sẽ thực hiện dịch chuyển Canvas về vị trí tĩnh của khung hình trước đó và ép động cơ dừng lại (`pause()`).
*   **Nút Step Forward [▶|] (Tiến 1 bước):**
    *   Bị vô hiệu hóa (`disabled` ở HTML) nếu chỉ số khung hình hiện tại `currentFrameIndex === frames.length - 1` (khung hình kết thúc).
    *   Nhấn nút sẽ thực hiện tịnh tiến Canvas sang khung hình kế tiếp và ép động cơ dừng lại (`pause()`).

---

## 4. Reset dòng thời gian khi thay đổi Dữ liệu mảng (Custom Input Reset)

*   **Ràng buộc:** Khi người học đang xem hoạt ảnh dở dang và quyết định gõ một mảng số mới vào khung nhập dữ liệu tùy chọn (Custom Input Editor).
*   **Hành vi xử lý:**
    *   Ngay sau khi mảng số mới được biên dịch thành công, hệ thống bắt buộc phải đặt lại chỉ số khung hình `currentFrameIndex = 0`.
    *   Toàn bộ dòng thời gian giải thuật cũ bị hủy bỏ hoàn toàn. Bảng điều khiển nạp lại tổng số lượng khung hình mới tương ứng với mảng vừa nhập và đưa trạng thái nút phát về biểu tượng Play đầu tiên.
