# ⚙️ Infrastructure & Hotkeys - Keyboard Listeners (Vue 3)

Tài liệu này đặc tả chi tiết cách cài đặt hệ thống phím tắt bàn phím toàn cục (Global Keyboard Shortcuts) và giải pháp ngăn ngừa rò rỉ bộ nhớ (Memory Leaks) trong phân hệ **Execution Control**.

---

## 1. Thiết lập Bộ lắng nghe Phím tắt Toàn cục (Global Hotkey Listeners)

Hệ thống được thiết kế để lắng nghe sự kiện phím tắt của người học trên phạm vi toàn màn hình (`window` level), mang lại khả năng điều phối nhanh chóng như đang sử dụng Youtube:

```typescript
import { onMounted, onUnmounted } from 'vue';
import { useAnimationStore } from '@/stores/useAnimationStore';

export function useGlobalPlaybackHotkeys() {
  const animStore = useAnimationStore();

  /**
   * Bộ xử lý sự kiện gõ bàn phím
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    // 1. Chặn phím tắt nếu người dùng đang gõ trong ô nhập liệu Custom Input để tránh gõ nhầm
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    // 2. Chặn phím tắt nếu bảng điều khiển đang bị khóa (ví dụ đang ở E-Lecture Mode)
    if (animStore.interactionLocked) {
      return;
    }

    switch (event.code) {
      case 'Space':
        // Chặn hành vi mặc định cuộn trang xuống của phím Spacebar
        event.preventDefault();
        
        if (animStore.isFinished) {
          animStore.goToFrame(0);
          animStore.play();
        } else {
          animStore.togglePlay();
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (event.shiftKey) {
          // Shift + Arrow Left: Tua về đầu
          animStore.goToFrame(0);
          animStore.pause();
        } else {
          // Arrow Left: Lùi 1 bước
          animStore.stepBackward();
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (event.shiftKey) {
          // Shift + Arrow Right: Tua nhanh tới cuối cùng
          animStore.goToFrame(animStore.frames.length - 1);
          animStore.pause();
        } else {
          // Arrow Right: Tiến 1 bước
          animStore.stepForward();
        }
        break;

      default:
        break;
    }
  };

  // Đăng ký lắng nghe lúc component được gắn kết vào DOM
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  // Hủy bỏ lắng nghe lúc hủy component để chống rò rỉ RAM bộ nhớ đệm
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
}
```

---

## 2. Giải pháp chống rò rỉ bộ nhớ (Memory Leak Prevention)

*   **Vấn đề nghiêm trọng:** Nếu lập trình viên đăng ký `window.addEventListener` mà quên không gọi `window.removeEventListener` trong lifecycle `onUnmounted`, bộ lắng nghe sự kiện phím tắt của bài học cũ sẽ tiếp tục tồn tại mãi mãi trong bộ nhớ RAM của trình duyệt ngay cả khi người dùng đã chuyển trang đi nơi khác. Mỗi lần bấm phím cách `Space`, hàm `handleKeyDown` cũ sẽ tiếp tục cố gắng thay đổi Store đã giải phóng, gây ra các ngoại lệ lỗi runtime hoặc làm treo đơ trình duyệt.
*   **Giải pháp bảo vệ hạ tầng:** Sử dụng Helper composition function `useGlobalPlaybackHotkeys` đóng gói kín gọn, chốt chặn việc tự động tháo dỡ Event Listener ở vòng đời `onUnmounted`, bảo toàn tuyệt đối hiệu năng hoạt động bền bỉ dài lâu của trang EdTech.
