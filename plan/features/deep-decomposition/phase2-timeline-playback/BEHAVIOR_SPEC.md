# 🎭 Behavioral Specification & Speed Controls (Phase 2)

Tài liệu này đặc tả chi tiết các ràng buộc chỉ số frame đầu cuối dòng thời gian, phạm vi điều chế tốc độ của Speed Slider và cơ chế chống spam click trên **VCR Timeline & Playback Controller**.

---

## 1. Kiểm soát Ranh giới Chỉ số Frame Dòng thời gian (Index Bounds Clamping)

Để đảm bảo động cơ máy lập lịch không bao giờ bị trượt chỉ số vượt biên dẫn đến vỡ màn hình hoặc lỗi Null Reference:
*   **Ràng buộc chỉ số chặt chẽ (Index Clamping Constraints):**
    *   Mọi truy xuất đổi bước thông qua lùi bước, tiến bước hay kéo thả Scrubber đều phải đi qua bộ lọc Clamping:
        $$\text{StepIndex}_{\text{valid}} = \text{Clamp}(\text{Index}, 0, \text{totalSteps} - 1)$$
    *   Nếu học sinh click phím [ TIẾN 1 BƯỚC ] khi đã ở bước cuối cùng, hệ thống tự động khóa phím bấm (Disabled style) và dừng phát lại VCR (PAUSED).
    *   Nếu học sinh click phím [ LÙI 1 BƯỚC ] khi đang ở bước 0, hệ thống tự động khóa phím lùi và không thực hiện thêm hành động nào.

---

## 2. Ràng buộc Phạm vi Điều chế Tốc độ phát (Speed Modulation Ranges)

*   **Hạn mức tốc độ tối thiểu và tối đa:**
    *   Tốc độ phát lại VCR được giới hạn trong dải từ **0.1x** (Phát cực chậm, 10 giây/bước hoạt ảnh) đến **5.0x** (Phát cực nhanh, 200ms/bước hoạt ảnh).
    *   *Hành vi bám sát:* Thay đổi tốc độ phát lập tức cập nhật lại nhịp đập `stepInterval = 1000 / speed` mà không làm gián đoạn vòng lặp `requestAnimationFrame` đang chạy.

---

## 3. Cơ chế Chống Spam Click Phím VCR (Click Debouncing)

*   **Thời gian trễ chống dội nút bấm (Debounce click duration):**
    *   Để ngăn chặn học sinh spam click liên tục vào phím lùi/tiến bước hoặc tua đi tua lại gây giật lag canvas vẽ đồ họa:
    *   Hệ thống thiết lập cơ chế chống spam (debounced) **100ms** cho phím lùi và tiến bước.
    *   *Hành vi:* Các lượt bấm spam trong khoảng trễ 100ms bị loại bỏ, chỉ thực thi lệnh đầu tiên.
