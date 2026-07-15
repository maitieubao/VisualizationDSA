# 📅 Implementation Plan - Execution Control (Phase 1)

Kế hoạch phát triển phân hệ Bảng điều khiển dòng thời gian (Execution Control) được phân hoạch làm 2 Sprint chính, tập trung xây dựng từ khung giao diện đến đồng bộ tối ưu hóa hiệu năng tua thời gian và phím tắt tiếp cận.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Giao diện UI Shell Bảng VCR (Ngày 1-3)    |
| - Xây dựng component ControlPanel.vue.                      |
| - Tùy biến thanh trượt Slider Youtube-style màu xanh Neon.   |
| - Hiệu ứng chuyển động các nút Play/Pause/Replay.           |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Đồng Bộ Động Cơ & Tối Ưu Tua Thời Gian (Ngày 4-6)  |
| - Hai chiều computed property binding với useAnimationStore.|
| - Cài đặt kỹ thuật Throttling 30 FPS khi kéo tua Slider.    |
| - Viết bộ lắng nghe phím tắt toàn cục (Space, Arrows).      |
| - Ghi nhớ tốc độ mặc định bằng Local Storage.               |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Giao diện UI Shell Bảng VCR (Ngày 1-3)
*   **Mục tiêu:** Hoàn thiện giao diện bảng điều khiển đẹp mắt nằm dưới Canvas, tích hợp đầy đủ nút hành động và thanh trượt Youtube-style.
*   **Danh sách công việc:**
    1.  [ ] Xây dựng khung Component `ControlPanel.vue` ứng dụng kính mờ (Glassmorphism CSS).
    2.  [ ] Tùy biến kiểu dáng thanh trượt Range Input (`timeline-slider`) có tô màu xanh Neon cho phần tiến trình đã chạy.
    3.  [ ] Thiết kế các biểu tượng vector sắc nét cho nút Lùi bước `[|◀]`, nút Play/Pause tròn to nổi bật, nút Tiến bước `[▶|]` và nút Replay `[↩]`.
    4.  [ ] Viết Dropdown lựa chọn tốc độ phát ở góc phải panel.
    5.  [ ] Dựng Component Tooltip động nổi trên trỏ chuột khi hover qua thanh Slider hiển thị tóm tắt bước giải thuật.

### Sprint B: Đồng Bộ Động Cơ & Tối Ưu Tua Thời Gian (Ngày 4-6)
*   **Mục tiêu:** Kết nối hoàn chỉnh logic giao diện với Pinia Store, tối ưu hóa kéo tua chống lag và cài đặt phím tắt toàn cục.
*   **Danh sách công việc:**
    1.  [ ] Thiết lập Computed properties hai chiều (`get`/`set`) kết nối `currentFrameIndex` của `useAnimationStore` với Slider.
    2.  [ ] Cài đặt logic tự động tạm dừng hoạt ảnh tự động (`pause()`) khi người dùng click chuột giữ kéo tua Slider.
    3.  [ ] Tích hợp hàm giới hạn tần suất `useThrottleFn` chốt tốc độ vẽ lại tối đa 30 FPS khi đang di chuột kéo tua Slider.
    4.  [ ] Hiện thực hóa sự kiện phím tắt bàn phím toàn cục (Spacebar cho Play/Pause, phím mũi tên Left/Right cho lùi/tiến 1 bước).
    5.  [ ] Viết mã nguồn tự động dọn dẹp (remove listener) phím tắt khi component bị hủy (`onUnmounted`) để chống rò rỉ RAM.
    6.  [ ] Viết logic lưu cấu hình tốc độ phát mặc định vào Local Storage và tự động nạp lại ở phiên truy cập tiếp theo.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Bảng điều khiển VCR hiển thị sắc nét, bo góc tinh tế nằm cố định dưới Canvas, tự động ẩn nút Play và hiện nút Replay khi chạy đến frame cuối.
2.  Kéo giữ chuột tua Slider liên tục qua lại không gây đứng hình trình duyệt, đồ họa cột mảng cập nhật mượt mà, không xảy ra lỗi vẽ đè cột hay méo hình.
3.  Phím tắt Spacebar, mũi tên Trái/Phải phản hồi nhạy bén và tự động ngăn chặn cuộn trang mặc định (Prevent Default behavior) khi đang focus màn hình học.
4.  Khi bật E-Lecture Mode, toàn bộ bảng điều khiển bị làm xám mờ và khóa hoàn toàn tương tác để bảo toàn ngữ cảnh bài giảng.
