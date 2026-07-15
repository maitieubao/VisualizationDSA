# 🗄️ State Management - useMultiViewStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useMultiViewStore** chịu trách nhiệm quản lý cấu hình các panel chia ô đang mở, trạng thái phát dòng thời gian tua nhanh dùng chung và liên kết với bộ máy Event Bus.

---

## 1. Cấu trúc Mã nguồn Store (`useMultiViewStore.ts`)

Mã nguồn store được viết theo mô hình setup store tối ưu, tích hợp đồng bộ:

```typescript
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { MultiViewEventBus, TimelineStep, SynchronizedTimelineManager } from '../utils/MultiViewEventBus';

export const useMultiViewStore = defineStore('multiView', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const activePanels = ref<string[]>(['code-editor', 'flowchart-view', 'svg-visualizer']);
  const currentStepIndex = ref(0);
  const playbackSpeed = ref(1.0); // Tốc độ trôi: 0.5x, 1.0x, 2.0x
  const isPlaying = ref(false);
  const totalStepsCount = ref(40);
  
  let playbackIntervalId: number | null = null;
  let timelineManager: SynchronizedTimelineManager | null = null;

  // Lịch sử mốc bước nạp sẵn để tua
  const loadedTimelineSteps = ref<TimelineStep[]>([]);

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Thiết lập danh sách bước timeline nạp sẵn cho giải thuật đang chạy
   */
  function initializeTimeline(steps: TimelineStep[]) {
    loadedTimelineSteps.value = steps;
    totalStepsCount.value = steps.length;
    currentStepIndex.value = 0;
    timelineManager = new SynchronizedTimelineManager(steps);
    
    // Snapping về bước 0 ngay khi khởi chạy
    timelineManager.seekToStep(0);
  }

  /**
   * Tua thủ công sang một bước chỉ định (dùng khi kéo Slider)
   */
  function seekToStep(index: number) {
    if (!timelineManager) return;
    
    currentStepIndex.value = index;
    timelineManager.seekToStep(index);
  }

  /**
   * Chuyển đổi trạng thái tự động phát Play/Pause
   */
  function togglePlayback() {
    isPlaying.value = !isPlaying.value;

    if (isPlaying.value) {
      startPlaybackLoop();
    } else {
      stopPlaybackLoop();
    }
  }

  /**
   * Bắt đầu vòng lặp tự động phát tiến trình bước giải thuật
   */
  function startPlaybackLoop() {
    stopPlaybackLoop();

    const intervalDuration = 1000 / playbackSpeed.value; // Tính toán mili-giây theo tốc độ phát
    
    playbackIntervalId = window.setInterval(() => {
      if (currentStepIndex.value < totalStepsCount.value - 1) {
        seekToStep(currentStepIndex.value + 1);
      } else {
        // Hết bước, tự động dừng phát
        stopPlaybackLoop();
        isPlaying.value = false;
      }
    }, intervalDuration);
  }

  /**
   * Dừng vòng lặp phát
   */
  function stopPlaybackLoop() {
    if (playbackIntervalId !== null) {
      window.clearInterval(playbackIntervalId);
      playbackIntervalId = null;
    }
  }

  /**
   * Thay đổi tốc độ tự động phát giải thuật
   */
  function setPlaybackSpeed(speed: number) {
    playbackSpeed.value = speed;
    if (isPlaying.value) {
      // Đang phát, khởi chạy lại vòng lặp với tốc độ mới
      startPlaybackLoop();
    }
  }

  /**
   * Hủy bỏ toàn bộ liên kết an toàn khi đóng Workspace giải thuật
   */
  function destroyStore() {
    stopPlaybackLoop();
    isPlaying.value = false;
    MultiViewEventBus.unsubscribeAll();
  }

  return {
    activePanels,
    currentStepIndex,
    playbackSpeed,
    isPlaying,
    totalStepsCount,
    loadedTimelineSteps,
    initializeTimeline,
    seekToStep,
    togglePlayback,
    setPlaybackSpeed,
    destroyStore
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store

Bằng việc kết hợp Pinia Setup Store với động cơ `MultiViewEventBus` thuần RAM:
*   **Hoàn hảo cho Range Slider Scrubbing:** Tua nhanh kéo chuột liên tục trên thanh slider trơn tru tuyệt hảo nhờ Event Bus truyền tin RAM siêu tốc, trong khi Pinia chỉ cập nhật chỉ số `currentStepIndex` hiển thị trên UI.
*   **Phát tự động co giãn linh hoạt:** Thay đổi tốc độ phát `setPlaybackSpeed` ngay tức thì cập nhật vòng lặp `playbackIntervalId`, mang lại cảm giác phản hồi nhạy bén tối đa.
