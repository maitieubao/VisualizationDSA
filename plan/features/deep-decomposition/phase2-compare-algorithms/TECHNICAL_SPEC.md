# 🛠 Technical Specification - side-by-side Algorithm Comparator (Phase 2)

Tài liệu này đặc tả chi tiết kiến trúc của bộ điều phối luồng phát kép đồng bộ `UnifiedPlaybackCoordinator`, giải thuật tính toán tốc độ phát tương đối và cơ chế đồng bộ chu kỳ vẽ RequestAnimationFrame.

---

## 1. Kiến trúc Bộ điều phối Playback Trung tâm (UnifiedPlaybackCoordinator)

Để đảm bảo hai Canvas con chuyển động đồng bộ hoàn hảo dưới sự điều khiển của một Slider chung, bộ điều phối `UnifiedPlaybackCoordinator` hoạt động như một nhạc trưởng:

```typescript
export interface PlaybackState {
  currentFrameIndex: number;
  totalFrames: number;
  progressPercent: number;
}

export class UnifiedPlaybackCoordinator {
  private leftStore: any;
  private rightStore: any;

  constructor(leftStore: any, rightStore: any) {
    this.leftStore = leftStore;
    this.rightStore = rightStore;
  }

  /**
   * Đồng bộ kéo tua dòng thời gian theo tỉ lệ phần trăm chung (0 - 100)
   */
  public snapToGlobalProgress(percent: number): void {
    const leftTargetFrame = Math.round((percent / 100) * this.leftStore.totalFrames);
    const rightTargetFrame = Math.round((percent / 100) * this.rightStore.totalFrames);

    // Kích hoạt nhảy frame đồng thời ở cả 2 Store con
    this.leftStore.goToFrame(leftTargetFrame);
    this.rightStore.goToFrame(rightTargetFrame);
  }

  /**
   * Tính toán chỉ số tốc độ phát tương đối (Speed alignment)
   * Vì Quick Sort có 20 frames, Bubble Sort có 100 frames, nếu phát cùng tốc độ thời gian, Quick Sort sẽ dừng quá nhanh.
   * Để so sánh trực diện quá trình di chuyển, hệ thống hỗ trợ cơ chế Phát đồng bộ tỷ lệ (Normalized Progress Speed):
   */
  public calculateAlignedSpeeds(baseSpeed: number): { leftSpeed: number; rightSpeed: number } {
    const leftFrames = this.leftStore.totalFrames;
    const rightFrames = this.rightStore.totalFrames;

    if (leftFrames === 0 || rightFrames === 0) {
      return { leftSpeed: baseSpeed, rightSpeed: baseSpeed };
    }

    // Giữ nguyên tốc độ base cho thuật toán dài hơn, tăng tốc độ tương ứng cho thuật toán ngắn hơn để cùng kết thúc đồng thời
    if (leftFrames > rightFrames) {
      return {
        leftSpeed: baseSpeed,
        rightSpeed: baseSpeed * (rightFrames / leftFrames)
      };
    } else {
      return {
        leftSpeed: baseSpeed * (leftFrames / rightFrames),
        rightSpeed: baseSpeed
      };
    }
  }
}
```

---

## 2. Giải pháp Đồng bộ Vẽ RequestAnimationFrame (rAF Optimization)

Thay vì để mỗi Canvas tự kích hoạt hàm render riêng lẻ bất đồng bộ gây quá tải luồng UI chính, hệ thống hợp nhất chu kỳ vẽ vào một luồng render đồng nhất:

```typescript
export class UnifiedRenderScheduler {
  private static leftCanvasCallback: (() => void) | null = null;
  private static rightCanvasCallback: (() => void) | null = null;
  private static isLoopRunning = false;

  public static registerCallbacks(leftCb: () => void, rightCb: () => void) {
    this.leftCanvasCallback = leftCb;
    this.rightCanvasCallback = rightCb;
  }

  /**
   * Bắt đầu vòng lặp render đồng nhất rAF
   */
  public static startSchedulerLoop() {
    if (this.isLoopRunning) return;
    this.isLoopRunning = true;
    
    const tick = () => {
      if (!this.isLoopRunning) return;

      // Gom các thao tác xóa và vẽ lại của cả 2 Canvas vào cùng 1 Frame quét của màn hình
      if (this.leftCanvasCallback) this.leftCanvasCallback();
      if (this.rightCanvasCallback) this.rightCanvasCallback();

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  public static stopSchedulerLoop() {
    this.isLoopRunning = false;
  }
}
```
 Thiết kế đồng bộ hóa tỷ lệ tiến trình phát (Normalized Progress Speed) kết hợp luồng vẽ tối ưu hóa GPU rAF đảm bảo hai Canvas hoạt ảnh song hành mượt mà hoàn hảo tuyệt đối trên mọi thiết bị di động cấu hình thấp.
