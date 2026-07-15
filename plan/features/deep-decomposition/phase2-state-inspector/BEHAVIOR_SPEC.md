# 🎭 Behavioral Specification & Heap Pointer Debounce (Phase 2)

Tài liệu này đặc tả chi tiết giới hạn số tầng Call Stack, thời gian trễ cập nhật tọa độ mũi tên tham chiếu và cơ chế ngăn chặn tràn bộ nhớ do đệ quy vô hạn trong phân hệ **State Inspector & Dynamic Variables Panel**.

---

## 1. Giới hạn Chiều sâu Ngăn xếp Xếp chồng (Call Stack Depth Limits)

Để đảm bảo hiệu năng dựng hình 3D kính mờ Glassmorphism luôn mượt mà và tránh làm rối loạn tầm nhìn học viên:
*   **Hạn mức Chiều sâu Ngăn xếp tối đa (Stack Frame Ceiling Clamping):**
    *   Hệ thống quy định chiều sâu hiển thị tối đa của Call Stack ảo được giới hạn ở mức **10 frames** (tầng ngăn xếp).
    *   Nếu giải thuật đệ quy chạy vượt quá 10 cấp (Ví dụ: đệ quy vô hạn hoặc đệ quy sâu băm nhỏ), hệ thống sẽ gộp hiển thị các frame ở giữa thành biểu tượng dấu ba chấm `...` và chỉ hiển thị rõ nét 3 frame ở đáy stack cùng 3 frame ở đỉnh stack đang hoạt động tích cực.
    *   *Mục đích:* Ngăn chặn nghẽn DOM vẽ HTML quá tải và tối ưu hóa không gian hiển thị của màn hình học tập.

---

## 2. Ràng buộc Tốc độ Cập nhật Mũi tên Tham chiếu (Pointer Update Debounce)

Để tránh hiện tượng giật lag lắc lư đường vẽ Bezier khi học sinh cuộn thanh cuộn mảng hoặc di chuyển chuột liên tục:
*   **Debounce cập nhật tọa độ Window Resize:**
    *   Khi người dùng thay đổi kích thước trình duyệt hoặc co giãn cửa sổ, sự kiện vẽ lại tọa độ mũi tên Bezier được trì hoãn (debounced) **16ms** (tương đương 1 frame hình 60 FPS).
    *   *Hành vi bám sát:* Sử dụng vòng lặp tối ưu `requestAnimationFrame` (rAF) chạy đồng bộ với tần số quét của màn hình thiết bị giúp đường vẽ mượt mà tuyệt đối không có độ trễ cảm nhận được.

---

## 3. Ràng buộc Tương tác Di chuột Hover Biến số (Hover Pulse Constraints)

*   **Thời gian trễ chớp tắt (Pulse duration):**
    *   Khi học viên rà chuột qua một biến trong Call Stack, hiệu ứng chớp tắt Amber Neon `.is-hover-pulsed` trên Canvas Heap ảo được duy trì liên tục cho đến khi chuột rời khỏi ô biến.
    *   *Debounce hủy bỏ:* Khi chuột rời đi, hiệu ứng tắt ngúm bừng sáng lập tức dưới **5ms** giải phóng bộ nhớ highlight của RAM Client.
