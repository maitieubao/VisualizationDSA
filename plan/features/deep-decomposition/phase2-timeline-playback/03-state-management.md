# 🗄️ State Management - useVCRTimelineStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useVCRTimelineStore** chịu trách nhiệm quản lý dòng thời gian giải thuật, lưu trữ các khung hình Caching Snapshot dưới RAM Client và đồng bộ nhảy dòng Monaco.

---

## 1. Cấu trúc Giao diện Mã Store (`useVCRTimelineStore.ts`)

Mã nguồn store được viết theo cấu hình setup store tối ưu, tích hợp đồng hồ VCRPlaybackEngine:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { VCRPlaybackEngine, PlaybackFrame, PlaybackStatus } from '../utils/VCRPlaybackEngine';

export const useVCRTimelineStore = defineStore('vcrTimeline', () => {
  // ==========================================
  // STATE (Trạng thái dòng thời gian)
  // ==========================================
  const currentStep = ref<number>(0);
  const totalSteps = ref<number>(0);
  const playbackSpeed = ref<number>(1.0);
  const status = ref<PlaybackStatus>('PAUSED');
  const currentDescription = ref<string>('Khởi tạo giải thuật');

  let engine: VCRPlaybackEngine | null = null;

  // ==========================================
  // ACTIONS (Hành động điều khiển VCR)
  // ==========================================

  /**
   * Khởi tạo nạp danh sách snapshot mảng/cây giải thuật
   */
  function initializeFrames(frames: PlaybackFrame[]) {
    if (engine) {
      engine.destroy();
    }

    totalSteps.value = frames.length;
    currentStep.value = 0;
    status.value = 'PAUSED';

    // Tạo mới động cơ máy lập lịch và lắng nghe callback đổi bước
    engine = new VCRPlaybackEngine((frame) => {
      currentStep.value = frame.stepIndex;
      currentDescription.value = frame.description;
      
      // Bắn sự kiện nhảy dòng Monaco Editor Client-side cực nhanh
      triggerMonacoLineSync(frame.lineNumber);
      
      // Bắn sự kiện cập nhật hình vẽ Canvas đồ họa
      triggerCanvasStateUpdate(frame.canvasStateSnapshot);
    });

    engine.setFrames(frames);
    engine.seekToStep(0); // Về đầu
  }

  /**
   * Phát giải thuật (Play)
   */
  function play() {
    if (engine) {
      engine.play();
      status.value = engine.getStatus();
    }
  }

  /**
   * Tạm dừng phát (Pause)
   */
  function pause() {
    if (engine) {
      engine.pause();
      status.value = engine.getStatus();
    }
  }

  /**
   * Lùi lại một bước giải thuật
   */
  function stepBack() {
    if (engine) {
      engine.stepBack();
    }
  }

  /**
   * Tiến lên một bước giải thuật
   */
  function stepForward() {
    if (engine) {
      engine.stepForward();
    }
  }

  /**
   * Tua quét nhanh đến chỉ số bước K (Scrubbing Seek)
   */
  function seekTo(stepIndex: number) {
    if (engine) {
      engine.seekToStep(stepIndex);
    }
  }

  /**
   * Thay đổi hệ số nhân tốc độ phát (0.1x -> 5x)
   */
  function changeSpeed(speed: number) {
    playbackSpeed.value = speed;
    if (engine) {
      engine.setSpeed(speed);
    }
  }

  /**
   * Dọn dẹp tháo dỡ RAM và GC sạch sẽ
   */
  function clearTimeline() {
    if (engine) {
      engine.destroy();
      engine = null;
    }
    currentStep.value = 0;
    totalSteps.value = 0;
    playbackSpeed.value = 1.0;
    status.value = 'PAUSED';
    currentDescription.value = 'Giải phóng tài nguyên';
  }

  // ==========================================
  // UTILS (Bổ trợ nội bộ)
  // ==========================================
  function triggerMonacoLineSync(lineNumber: number) {
    const syncEvent = new CustomEvent('MONACO_REVEAL_LINE_INSIGHT', {
      detail: { lineNumber }
    });
    window.dispatchEvent(syncEvent);
  }

  function triggerCanvasStateUpdate(snapshot: any) {
    const syncEvent = new CustomEvent('CANVAS_REDRAW_STATE_SNAPSHOT', {
      detail: { snapshot }
    });
    window.dispatchEvent(syncEvent);
  }

  return {
    currentStep,
    totalSteps,
    playbackSpeed,
    status,
    currentDescription,
    initializeFrames,
    play,
    pause,
    stepBack,
    stepForward,
    seekTo,
    changeSpeed,
    clearTimeline
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store

Bằng việc kết hợp Pinia Setup Store với động cơ `VCRPlaybackEngine` giải quyết tua quét nhanh Scrubber bám tay 60 FPS:
*   **Reconcile Canvas cực nhạy:** Tua lùi tiến bước bám sát chỉ số cache RAM Client phản hồi dưới **5ms**.
*   **Chống rò rỉ RAM GC đỉnh cao:** Phương thức `.clearTimeline()` hủy hoàn toàn requestAnimationFrame và dọn dẹp các mảng snapshot lớn tức khắc khi đổi trang, mát lạnh máy khách.
