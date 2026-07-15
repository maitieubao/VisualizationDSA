# 🗄️ State Management & Store Bindings (Execution Control)

Tài liệu này đặc tả chi tiết cách tích hợp phản phản ứng hai chiều (Two-way reactive binding) giữa giao diện bảng điều khiển `<ControlPanel>` và Store quản lý hoạt họa cốt lõi `useAnimationStore`.

---

## 1. Thiết lập Computed Properties hai chiều trong Component

Để giao diện nút bấm và thanh tua trượt Slider luôn đồng hành nhịp nhàng với động cơ phát hoạt ảnh, chúng ta ánh xạ các biến trạng thái phản ứng thông qua các computed properties:

```typescript
import { computed } from 'vue';
import { useAnimationStore } from '@/stores/useAnimationStore';

const animStore = useAnimationStore();

// ==========================================
// MAPPING CÁC TRẠNG THÁI PHẢN ỨNG (READ-ONLY)
// ==========================================

// Đọc trạng thái thuật toán đang chạy hay dừng
const isPlaying = computed(() => animStore.isPlaying);

// Đọc trạng thái thuật toán đã chạy hết các bước chưa
const isFinished = computed(() => animStore.isFinished);

// Lấy tổng số lượng Frame của giải thuật hiện tại
const totalFrames = computed(() => animStore.frames.length);

// Kiểm tra có phải frame đầu hay cuối không để ẩn hiện nút bấm
const isFirstFrame = computed(() => animStore.currentFrameIndex === 0);
const isLastFrame = computed(() => animStore.currentFrameIndex === animStore.frames.length - 1);

// ==========================================
// LIÊN KẾT HAI CHIỀU CHO THANH TRƯỢT TIMELINE
// ==========================================
const currentFrame = computed({
  get: () => animStore.currentFrameIndex,
  set: (val: number) => {
    // Gọi hàm snap tức thời của store để vẽ lại mảng ở Frame mới
    animStore.goToFrame(val);
  }
});

// ==========================================
// LIÊN KẾT HAI CHIỀU CHO DROPDOWN TỐC ĐỘ PHÁT
// ==========================================
const playbackSpeed = computed({
  get: () => animStore.playbackSpeed,
  set: (val: number) => {
    // Thiết lập hệ số nhân tốc độ mới ở store lõi
    animStore.setPlaybackSpeed(val);
  }
});
```

---

## 2. Thiết kế logic Nút Phát lại (Replay Action Handler)

Khi thuật toán thực thi đến khung hình cuối cùng (`isFinished === true`):
*   Nút biểu tượng Play ở giữa tự động chuyển đổi sang biểu tượng **Replay [↩]**.
*   **Hành vi xử lý:** Khi người học nhấp vào nút Replay, hệ thống không chỉ phát tiếp mà thực hiện tuần tự các bước:
    1.  Đưa chỉ số khung hình về đầu `goToFrame(0)` để dọn dẹp các highlight và reset vị trí các cột mảng.
    2.  Kích hoạt hàm phát hoạt ảnh `play()` để thuật toán tự động tái diễn mượt mà.

```typescript
function togglePlay() {
  if (isFinished.value) {
    // Phát lại từ đầu
    animStore.goToFrame(0);
    animStore.play();
  } else {
    // Chuyển đổi trạng thái Play/Pause thông thường
    animStore.togglePlay();
  }
}
```

---

## 3. Khóa tương tác khi kích hoạt E-Lecture Mode

Khi phân hệ Bài giảng điện tử (E-Lecture Mode) bật lên, nó sẽ ghi đè cờ hiệu khóa tương tác `interactionLocked = true` trong store lõi. 
*   **Phản hồi UX:** `ControlPanel` sẽ lắng nghe cờ hiệu này và tự động thêm class CSS `.disabled-panel` làm mờ xám 50% bảng điều khiển và vô hiệu hóa tất cả các sự kiện click/kéo trượt timeline để học sinh học theo đúng kịch bản bài học mà không nghịch bấm lung tung làm hỏng bài giảng.
