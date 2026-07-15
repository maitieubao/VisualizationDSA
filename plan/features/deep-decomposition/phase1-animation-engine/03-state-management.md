# 🗄️ Pinia State Management - useAnimationStore (Vue 3)

Tài liệu này đặc tả chi tiết bộ máy quản lý trạng thái tập trung ở Frontend cho Animation Engine sử dụng **Pinia** và **TypeScript**.

---

## 1. Thiết kế Mã nguồn Pinia Store (`useAnimationStore.ts`)

Mã nguồn được viết theo cú pháp **Vue 3 Composition API (Setup Store)** giúp tăng tính rõ ràng, dễ bảo trì và tận dụng tối đa lợi thế của hệ thống TypeScript gõ tĩnh.

```typescript
import { defineStore } from 'pinia';
import { shallowRef, ref, computed } from 'vue';

// --- INTERFACES & CONTRACTS ---
export interface HighlightIndices {
  compare: number[];
  swap: number[];
  sorted: number[];
}

export interface FrameDTO {
  stepId: number;
  activeLine: number;
  explanation: string;
  dataState: number[];
  highlights: HighlightIndices;
}

export interface AlgorithmResult {
  algorithmId: string;
  pseudoCode: string[];
  frames: FrameDTO[];
}

export const useAnimationStore = defineStore('animation', () => {
  // ==========================================
  // 1. STATE (Trạng thái lõi)
  // ==========================================
  
  // shallowRef tối ưu hóa cực mạnh bộ nhớ client. Vue sẽ không biến đổi các phần tử
  // bên trong mảng frames thành reactive proxy, tránh rò rỉ RAM trình duyệt.
  const frames = shallowRef<FrameDTO[]>([]);
  const pseudoCode = ref<string[]>([]);
  const algorithmId = ref<string>('');
  
  const currentIndex = ref<number>(0);
  const isPlaying = ref<boolean>(false);
  const playbackSpeed = ref<number>(1.0); // Các mức hỗ trợ: 0.5, 1.0, 1.5, 2.0, 5.0
  let timerId: number | null = null;

  // ==========================================
  // 2. GETTERS (Trạng thái tính toán - Computed)
  // ==========================================
  
  const currentFrame = computed<FrameDTO | null>(() => {
    if (frames.value.length === 0) return null;
    return frames.value[currentIndex.value] || null;
  });

  const isFinished = computed<boolean>(() => {
    if (frames.value.length === 0) return false;
    return currentIndex.value === frames.value.length - 1;
  });

  const totalSteps = computed<number>(() => frames.value.length);

  const progressPercent = computed<number>(() => {
    if (frames.value.length <= 1) return 0;
    return (currentIndex.value / (frames.value.length - 1)) * 100;
  });

  // ==========================================
  // 3. ACTIONS (Logic thao tác)
  // ==========================================

  /**
   * Nạp kết quả giải thuật nhận được từ API vào Store.
   */
  function loadResult(result: AlgorithmResult) {
    stop();
    algorithmId.value = result.algorithmId;
    pseudoCode.value = result.pseudoCode;
    frames.value = result.frames;
    currentIndex.value = 0;
  }

  /**
   * Khởi chạy phát hoạt ảnh tự động.
   */
  function play() {
    if (isPlaying.value || isFinished.value) return;
    isPlaying.value = true;
    tick();
  }

  /**
   * Vòng lặp đếm thời gian nhảy bước (High-performance cascade tick loop).
   */
  function tick() {
    if (!isPlaying.value) return;
    if (isFinished.value) {
      pause();
      return;
    }

    currentIndex.value++;

    // Tần suất cơ bản là 1000ms cho 1 step ở tốc độ phát 1.0x
    const baseDelay = 1000;
    const currentDelay = baseDelay / playbackSpeed.value;

    // Sử dụng setTimeout tầng bậc (cascade) thay vì setInterval để tránh hiện tượng
    // dồn luồng sự kiện (timer drift) làm khựng giật khung hình hoạt họa.
    timerId = window.setTimeout(() => {
      tick();
    }, currentDelay);
  }

  /**
   * Tạm dừng phát hoạt ảnh.
   */
  function pause() {
    isPlaying.value = false;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  /**
   * Dừng hẳn hoạt ảnh, đưa con trỏ về bước đầu tiên.
   */
  function stop() {
    pause();
    currentIndex.value = 0;
  }

  /**
   * Di chuyển tiến lên một bước giải thuật thủ công.
   */
  function stepForward() {
    pause();
    if (currentIndex.value < frames.value.length - 1) {
      currentIndex.value++;
    }
  }

  /**
   * Di chuyển lùi lại một bước giải thuật thủ công.
   */
  function stepBackward() {
    pause();
    if (currentIndex.value > 0) {
      currentIndex.value--;
    }
  }

  /**
   * Tua nhanh (Scrubbing) đến một bước bất kỳ trên Timeline.
   */
  function scrubTo(index: number) {
    pause();
    if (index >= 0 && index < frames.value.length) {
      currentIndex.value = index;
    }
  }

  /**
   * Thiết lập tốc độ phát mới và cập nhật tức thì luồng hẹn giờ nếu đang chạy.
   */
  function setSpeed(speed: number) {
    playbackSpeed.value = speed;
    if (isPlaying.value) {
      pause();
      play();
    }
  }

  return {
    // State references
    frames,
    pseudoCode,
    algorithmId,
    currentIndex,
    isPlaying,
    playbackSpeed,
    
    // Computed Getters
    currentFrame,
    isFinished,
    totalSteps,
    progressPercent,
    
    // Action functions
    loadResult,
    play,
    pause,
    stop,
    stepForward,
    stepBackward,
    scrubTo,
    setSpeed
  };
});
```

---

## 2. Các điểm kỹ thuật tối ưu hóa then chốt (Key Optimization Points)

### 2.1. Giải pháp chống lệch thời gian vẽ (Avoiding Timer Drift)
Nếu sử dụng `setInterval(tick, delay)`, trình duyệt sẽ ép buộc đẩy sự kiện vào hàng đợi định kỳ bất kể hệ thống có kịp vẽ xong Canvas hay chưa. Nếu máy client gặp tác vụ nặng làm chậm luồng đồ họa, các sự kiện `tick` sẽ bị dồn ứ, khi máy rảnh trở lại sẽ xả ra một loạt bước nhảy dồn dập rất mất thẩm mỹ.
*   **Giải pháp:** Bắt buộc dùng cơ chế **Cascade setTimeout**. Bước tiếp theo chỉ được lên lịch hẹn giờ *sau khi* bước hiện tại đã thực thi hoàn chỉnh và cập nhật xong trạng thái chỉ số.

### 2.2. Tránh rò rỉ bộ nhớ Vue 3 (Avoiding Memory Overheads)
Vue 3 cài đặt hệ thống reactivity bằng ES6 Proxies. Nếu `frames` chứa 1000 bước, và mỗi bước chứa mảng 50 số cùng đối tượng highlights, Vue sẽ xây dựng hàng chục ngàn Proxy theo dõi chiều sâu.
*   **Giải pháp:** `frames` được bọc qua **`shallowRef`**. Trình duyệt sẽ cực nhẹ và mượt mà, chỉ phát tín hiệu re-render khi tham chiếu của cả mảng thay đổi (hoặc khi `currentIndex` thay đổi), tiết kiệm 95% CPU tiêu tốn cho việc tracking reactivity vô ích.
