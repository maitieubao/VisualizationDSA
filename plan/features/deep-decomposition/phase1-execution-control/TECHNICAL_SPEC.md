# 🛠 Technical Specification - Execution Control (Phase 1)

Tài liệu này đặc tả chi tiết kiến trúc điều phối dòng thời gian hoàn toàn chạy ở Client-side và mô hình phát lệnh tương tác (Command Issuer Pattern) kết nối vào Pinia Store lõi.

---

## 1. Kiến trúc Phát lệnh Tương tác (Command Issuer Pattern)

Phân hệ **Execution Control** được thiết kế độc lập về giao diện hiển thị, không trực tiếp xử lý thuật toán vẽ Canvas hay tính toán frames. Thay vào đó, component `<ControlPanel>` hoạt động như một **Command Issuer** - chuyên gửi các yêu cầu thay đổi trạng thái tới Pinia Store `useAnimationStore`:

```
[ControlPanel.vue]
   |
   +--- Bấm Play/Pause     ---> [useAnimationStore.togglePlay()]
   +--- Bấm Step Forward   ---> [useAnimationStore.stepForward()]
   +--- Bấm Step Backward  ---> [useAnimationStore.stepBackward()]
   +--- Kéo thanh trượt    ---> [useAnimationStore.goToFrame(val)]
   +--- Chọn Tốc độ (2x)   ---> [useAnimationStore.setPlaybackSpeed(2.0)]
```

Cơ chế này tách biệt hoàn toàn giao diện nút bấm khỏi lõi xử lý hoạt họa, đảm bảo kiến trúc hệ thống lỏng (Loose Coupling), dễ bảo trì và mở rộng giao diện điều khiển mới trong tương lai.

---

## 2. Công thức Toán học co giãn Tốc độ phát (Speed Scaling)

Thời gian hiển thị chuyển động mặc định của một bước thuật toán được quy định bằng hằng số `baseDuration = 1000ms`. Thời gian thực thi chuyển tiếp thực tế được tính toán động dựa trên hệ số nhân tốc độ `playbackSpeed` do người dùng chọn:

$$\text{transitionDuration} = \frac{\text{baseDuration}}{\text{playbackSpeed}}$$

### Các mốc chuyển đổi tiêu chuẩn:
*   Tốc độ $0.25\times$: $\text{transitionDuration} = 1000 / 0.25 = 4000\text{ms}$ (Thích hợp cho giải thuật đệ quy phức tạp).
*   Tốc độ $1.0\times$ (Mặc định): $\text{transitionDuration} = 1000 / 1.0 = 1000\text{ms}$.
*   Tốc độ $4.0\times$: $\text{transitionDuration} = 1000 / 4.0 = 250\text{ms}$ (Thích hợp cho việc lướt nhanh thuật toán dài).

---

## 3. Quản lý Đăng ký Hotkeys hệ thống

*   **Vòng đời lắng nghe:** Bộ lắng nghe sự kiện phím tắt toàn cục được đăng ký lúc khởi tạo component (`onMounted`) qua `window.addEventListener('keydown', handleGlobalHotkeys)`.
*   **Chống rò rỉ RAM (Memory Leak Prevention):** Phải gỡ bỏ listener này khi người dùng chuyển hướng trang và hủy component (`onUnmounted`) qua `window.removeEventListener('keydown', handleGlobalHotkeys)`.
