# 📅 Implementation Plan - VCR Timeline Playback (Phase 2)

Kế hoạch phát triển phân hệ Điều hướng VCR và Dòng thời gian giải thuật được phân chia làm 2 Sprint chính nhằm tối ưu hóa độ mượt mà khi quét Scrubber và đồng bộ dòng code Monaco Editor.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Giao diện VCR Panel & Scrubber (Ngày 1-3) |
| - Dựng panel phím bấm kính mờ Play/Pause/Forward/Rewind.    |
| - Thiết kế thanh trượt Scrubber Neon mỏng Cyan.             |
| - Viết indicator quét tròn bám sát ngón tay.                |
| - Dựng dải Speed Slider điều chế tốc độ phát.               |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Lập trình Engine VCR & Monaco Sync Hooks (Ngày 4-6) |
| - Lập trình hạt nhân VCRPlaybackEngine TS rAF scheduler.    |
| - Xây dựng mảng Caching PlaybackFrame dưới RAM máy khách.   |
| - Cài đặt thuật toán quét chỉ số Scrubber Math clamped.      |
| - Liên kết sự kiện đập nhịp nhảy dòng Monaco Editor.        |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Giao diện VCR Panel & Scrubber (Ngày 1-3)
*   **Mục tiêu:** Xây dựng cụm phím điều hướng mờ kính, thanh trượt Scrubber Neon, speed slider, tooltips preview bước.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế Component `VCRControllerPanel.vue` kính mờ, phím bấm nhạy xúc giác.
    2.  [ ] Dựng thanh trượt tiến trình mỏng Neon `VCRProgressBar.vue` Cyan.
    3.  [ ] Viết CSS hoạt ảnh indicator quét tròn bám đuổi tay uốn lượn.
    4.  [ ] Lập trình giao diện Speed Slider điều phối tốc độ phát 0.1x -> 5x.

### Sprint B: Lập trình Engine VCR & Monaco Sync Hooks (Ngày 4-6)
*   **Mục tiêu:** Hiện thực hóa logic hạt nhân `VCRPlaybackEngine` TS rAF scheduler, mảng Caching Frames, sync click Monaco.
*   **Danh sách công việc:**
    1.  [ ] Lập trình lớp lõi `VCRPlaybackEngine` bằng TypeScript chạy xung `performance.now()` và `requestAnimationFrame`.
    2.  [ ] Thiết lập cơ chế lưu trữ snapshot `PlaybackFrame[]` dưới RAM Client-side ngay khi kết thúc biên dịch.
    3.  [ ] Cài đặt công thức tính toán tọa độ chuột kéo Scrubber clamped bám bắt mượt mà 60 FPS.
    4.  [ ] Liên kết sự kiện đập nhịp chuyển frame gọi API Monaco `revealLineInCenter` nhảy dòng lệnh chuẩn xác, dọn dẹp GC khi đóng.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Phím bấm Play/Pause/Rewind/Forward phản hồi tức thì dưới **5ms**, chuyển đổi tốc độ phát chuẩn xác.
2.  Thao tác kéo trượt thanh Scrubber cập nhật hình ảnh mảng/cây trên Canvas mượt mà 60 FPS bám sát ngón tay.
3.  Mỗi bước chuyển frame phát lập tức kích hoạt cuộn Monaco Editor tô sáng dòng code tương ứng chuẩn chỉ.
4.  Hủy bỏ 100% listeners window mouse events và vòng lặp hoạt ảnh `requestAnimationFrame` khi unmount tránh tràn bộ nhớ RAM máy khách.
5.  Đầy đủ unit tests bao phủ 100% logic VCR Engine và dọn dẹp cache.
