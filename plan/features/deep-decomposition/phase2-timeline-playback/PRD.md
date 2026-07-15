# 🚀 Product Requirements Document (PRD) - VCR Timeline & Playback (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **VCR Timeline & Playback Controller** là hạt nhân điều hướng "cỗ máy thời gian" giúp sinh viên kiểm soát tuyệt đối luồng chạy của giải thuật. Bằng cách cung cấp thanh trượt tiến trình Scrubber Neon uốn lượn, phím bấm điều khiển mờ kính Glassmorphic sang trọng và bộ lập lịch xung đồng hồ cực kỳ chính xác, phân hệ giúp sinh viên dễ dàng tua ngược quá khứ, nhảy vọt tương lai hoặc kéo quét dòng thời gian để thấu hiểu thuật toán.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Kiểm soát Tuyệt đối Tiến trình (Timeline Control):** Cho phép học viên dừng lại ở bất kỳ bước trung gian nào để nghiên cứu trạng thái bộ nhớ RAM, con trỏ và cây đệ quy.
*   **Quét Trượt Siêu mượt (Ultra-smooth Scrubbing):** Kéo miết thanh scrubber cập nhật lại hình ảnh Canvas tức thì dưới **5ms** không có cảm giác trễ hay giật lag.
*   **Điều chỉnh Tốc độ Linh hoạt (Speed Modulation):** Cung cấp dải tốc độ từ phát siêu chậm 0.1x (để soi chi tiết hoán vị mảng) đến phát nhanh 5.0x (để chạy nhanh qua vòng lặp tẻ nhạt).
*   **Đồng bộ Mã nguồn Monaco Editor (Code Line Sync):** Mỗi bước chuyển frame bắt buộc bôi sáng vàng dòng lệnh Monaco tương thích để học viên biết máy tính đang chạy dòng nào.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Glassmorphic VCR Controller Panel
*   Cụm phím điều hướng: Play/Pause, Step Back (Lùi 1 bước), Step Forward (Tiến 1 bước), Rewind (Về đầu), Fast Forward (Đến cuối).
*   Thẻ mờ kính lơ lửng, nhạy bén xúc giác khi click.

### 3.2. Dynamic Scrubber Slider Track (Thanh trượt Scrubber)
*   Thanh trượt mỏng phát sáng Neon Cyan, có hạt tròn indicator quét phát sáng dịu nhẹ bám đuổi ngón tay.
*   Hiển thị tooltip preview số bước và mô tả ngắn khi hover qua thanh trượt.

### 3.3. Speed Slider điều chế tốc độ phát
*   Thanh trượt điều khiển tốc độ: 0.1x, 0.25x, 0.5x, 1.0x, 1.5x, 2.0x, 5.0x.
*   Lập lịch phát lại đều đặn bám sát xung nhịp thực tế.

### 3.4. Monaco Code Synchronization
*   Đồng bộ ngữ cảnh nhảy dòng code Monaco Editor và highlight dòng hoạt động tương thích thời gian thực.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một học viên đang nghiên cứu thuật toán HeapSort phức tạp, tôi muốn bấm [ TẠM DỪNG ] tại bước số 18 hoán vị đỉnh Heap để soi kỹ xem tại sao số bé bị đẩy xuống. Tôi muốn có phím bấm [ LÙI 1 BƯỚC ] và [ TIẾN 1 BƯỚC ] để quan sát sự chuyển dịch của con trỏ và mảng đồ họa như lật từng trang sách, giúp tôi thấu hiểu chân thực thuật toán.
*   Là một sinh viên đang gỡ lỗi một hàm tìm kiếm nhị phân sâu nhiều tầng, tôi muốn miết kéo ngón tay trên Thanh trượt Scrubber Neon từ bước 2 đến bước 25 để quét nhanh tiến trình. Tôi muốn thấy các bar mảng co giãn đổi chỗ mượt mà 60 FPS bám sát ngón tay kéo của tôi, xua tan cảm giác chờ đợi lag giật tẻ nhạt.
*   Là một người học muốn soi kỹ chuyển động hạt con trỏ, tôi muốn kéo tốc độ phát về 0.25x (Phát siêu chậm). Tôi muốn dòng chữ mô tả "Gán Node head sang Node tiếp theo" hiện ra đồng bộ với nét vẽ Bezier chuyển động lững lờ cực đẹp, giúp tôi ghi nhớ bài học sâu sắc vào tâm trí.
