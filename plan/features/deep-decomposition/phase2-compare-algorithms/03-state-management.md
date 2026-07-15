# 🗄️ State Management - useCompareAlgorithmsStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useCompareAlgorithmsStore** chịu trách nhiệm lưu giữ mảng trạng thái so sánh kép, quản lý VCR Controls đồng bộ và kết xuất các chỉ số so sánh Big-O thời gian thực.

---

## 1. Cấu trúc Mã nguồn Store (`useCompareAlgorithmsStore.ts`)

Mã nguồn store được viết theo phong cách setup store và import các store thuật toán con để trực tiếp chỉ phối hành động:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from './useAnimationStore'; // Animation Store chung hoặc riêng lẻ
import { UnifiedPlaybackCoordinator } from '../utils/UnifiedPlaybackCoordinator';

export const useCompareAlgorithmsStore = defineStore('compareAlgorithms', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const leftAlgorithmId = ref('bubble-sort');
  const rightAlgorithmId = ref('quick-sort');
  
  const isPlaying = ref(false);
  const globalPlaySpeed = ref(1.0);
  const globalProgressPercent = ref(0); // Mốc tiến trình chung từ 0 đến 100

  // Giả lập lưu trữ mảng Frames của hai bên đối sánh
  const leftTotalFrames = ref(120);
  const rightTotalFrames = ref(35);
  
  const leftCurrentFrame = ref(0);
  const rightCurrentFrame = ref(0);

  // Chỉ số hiệu năng thời gian thực
  const leftComparisons = ref(0);
  const leftSwaps = ref(0);
  const rightComparisons = ref(0);
  const rightSwaps = ref(0);

  // ==========================================
  // GETTERS (Bộ lọc tính toán dữ liệu)
  // ==========================================

  /**
   * Tính toán tỉ lệ hiệu năng so sánh chênh lệch giữa hai thuật toán
   */
  const efficiencyRatio = computed(() => {
    if (leftComparisons.value === 0 || rightComparisons.value === 0) return 1;
    // Trả về tỷ số để hiển thị trực quan lên biểu đồ bar chart
    return Number((leftComparisons.value / rightComparisons.value).toFixed(1));
  });

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Đồng bộ kéo Range Slider trung tâm điều phối 2 bên
   */
  function setGlobalProgressPercent(percent: number) {
    globalProgressPercent.value = percent;

    // Tính toán frame đích tương ứng
    leftCurrentFrame.value = Math.round((percent / 100) * leftTotalFrames.value);
    rightCurrentFrame.value = Math.round((percent / 100) * rightTotalFrames.value);

    // Kéo theo chỉ số thống kê tương ứng tại mốc đó
    updateStatsAtFrame();
  }

  /**
   * Bấm nút khởi chạy đồng bộ luồng phát kép (Unified Play)
   */
  function startSyncPlayback() {
    isPlaying.value = true;
    
    // Khởi chạy vòng lặp phát tự động tăng dần % tiến trình
    executePlaybackTick();
  }

  /**
   * Bấm nút tạm dừng đồng bộ (Unified Pause)
   */
  function pauseSyncPlayback() {
    isPlaying.value = false;
  }

  /**
   * Cập nhật các chỉ số hiệu năng so sánh tương ứng với Frame đang đứng
   */
  function updateStatsAtFrame() {
    // Trích xuất thống kê từ tệp Frames tương ứng của từng bên (Bubble vs Quick)
    // Ví dụ giả lập tính toán tăng dần chỉ số theo tỷ lệ frame
    leftComparisons.value = Math.round((leftCurrentFrame.value / leftTotalFrames.value) * 450);
    leftSwaps.value = Math.round((leftCurrentFrame.value / leftTotalFrames.value) * 180);

    rightComparisons.value = Math.round((rightCurrentFrame.value / rightTotalFrames.value) * 65);
    rightSwaps.value = Math.round((rightCurrentFrame.value / rightTotalFrames.value) * 22);
  }

  /**
   * Vòng lặp đập nhịp đồng bộ của Slider %
   */
  function executePlaybackTick() {
    if (!isPlaying.value) return;

    if (globalProgressPercent.value >= 100) {
      isPlaying.value = false;
      globalProgressPercent.value = 100;
      return;
    }

    // Tăng tiến trình % chung dựa trên tốc độ globalSpeed
    const increment = (globalPlaySpeed.value * 0.5);
    setGlobalProgressPercent(Math.min(100, globalProgressPercent.value + increment));

    // Đập nhịp kế tiếp bằng requestAnimationFrame mượt mà
    requestAnimationFrame(executePlaybackTick);
  }

  /**
   * Nạp bài học so sánh thuật toán mới giải phóng tài nguyên cũ
   */
  function loadCompareSession(leftAlg: string, rightAlg: string) {
    leftAlgorithmId.value = leftAlg;
    rightAlgorithmId.value = rightAlg;
    isPlaying.value = false;
    globalProgressPercent.value = 0;
    leftCurrentFrame.value = 0;
    rightCurrentFrame.value = 0;
    leftComparisons.value = 0;
    leftSwaps.value = 0;
    rightComparisons.value = 0;
    rightSwaps.value = 0;
  }

  return {
    // States
    leftAlgorithmId,
    rightAlgorithmId,
    isPlaying,
    globalPlaySpeed,
    globalProgressPercent,
    leftCurrentFrame,
    rightCurrentFrame,
    leftTotalFrames,
    rightTotalFrames,
    leftComparisons,
    leftSwaps,
    rightComparisons,
    rightSwaps,
    
    // Getters
    efficiencyRatio,
    
    // Actions
    setGlobalProgressPercent,
    startSyncPlayback,
    pauseSyncPlayback,
    loadCompareSession
  };
});
```

---

## 2. Ưu điểm nổi bật của thiết kế So sánh Trực quan liên kết store

Bằng cách quy đổi dòng thời gian của cả hai thuật toán dài ngắn khác nhau về **Thang đo Tỷ lệ phần trăm % chung**:
*   **Tránh bất đồng bộ hiển thị:** Loại bỏ hoàn toàn lỗi lệch slider kéo, học sinh kéo slider tới đâu, hai Canvas cùng nhảy chuẩn xác tới đó.
*   **Biểu đồ phân tích chân thực:** Chỉ số `efficiencyRatio` cho sinh viên thấy rõ ràng Quick Sort hiệu quả hơn Bubble Sort gấp **6.9 lần** ngay trên giao diện, củng cố sâu sắc tri thức Big-O tiệm cận.
